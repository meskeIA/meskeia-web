#!/usr/bin/env node
/**
 * check-specs-produccion.mjs — que ningún spec NUEVO dependa de algo que solo existe en `next dev`
 *
 * Ejecutar:  npm run check:specs-produccion               (lo ejecuta también `npm run build`)
 *            npm run check:specs-produccion -- --todo     (todo tests/: informa, NO rompe)
 *            node scripts/check-specs-produccion.mjs tests/apps/x.spec.ts   (ficheros sueltos)
 *            node scripts/check-specs-produccion.mjs --raiz <dir>   (lo usa specs-produccion:probar-candado)
 *            node scripts/check-specs-produccion.mjs --desde <ref>  (lo añadido desde <ref>, commits incluidos)
 *
 * QUÉ BUSCA
 * ─────────
 * Dos formas que un spec escribe en `next dev`, donde pasa, y que fallan contra el build de
 * producción (`next start`), que es contra lo que corre la suite de la recogida del Inspector
 * y de /reparar:
 *
 *   (a) LOCALIZAR POR EL NOMBRE DE CLASE DE UN MÓDULO CSS. `next dev` compila `.card` de
 *       `Foo.module.css` como «Foo-module__hash__card»; el build, como «hash_card», sin el
 *       nombre del fichero ni el doble guion bajo (cabecera de tests/apps/_modulo-css.ts). Se
 *       enciende en un literal (cadena, plantilla o expresión regular) que lleve:
 *         · «-module» pegado a un nombre:            '[class*="page-module"]'
 *         · «__» delante de un nombre de clase:      '[class$="__card"]', `__${fin}$`, /__card$/
 *         · un [class…="…"] cuyo valor empieza por mayúscula, que es un nombre de módulo:
 *                                                    '[class*="OrientacionHerencias"]'
 *       Receta: `selectorDelModulo` de tests/apps/_modulo-css.ts, `[class$="_x"]` para un
 *       nombre local suelto, o mejor rol o texto.
 *
 *   (b) ESPERAR A 'networkidle'. En producción los <Link> prefetchean `/?_rsc=` y alguno se
 *       queda colgado en localhost, así que la red no queda quieta nunca y el test se agota; y
 *       aun cuando llega, no dice que React haya hidratado. Receta: `esperarPaginaAsentada` de
 *       tests/apps/_hidratacion.ts (hidratación confirmada y DOM quieto).
 *
 * DE DÓNDE SALE (P004 del repaso de procesos, aceptada el 08/11/2026)
 * ───────────────────────────────────────────────────────────────────
 * C0457 (nombre de módulo) y C0487 se cerraron el 27/10/2026 corrigiendo los specs a mano, sin
 * candado. La trampa volvió en specs nuevos:
 *   · 03/11 · orientacion-tramitacion-herencias, `[class*="OrientacionHerencias"]` (a57337a0c)
 *   · 07/11 · guias-cifra-fichas-familia, `__${fin}$`, 9 rojos (c0f8ad3b9, cabo C0665)
 *   · 07/11 · las cuatro portadas de portal, waitForLoadState('networkidle') (10b6d8a2d)
 * Tres recogidas paradas, cada una con su conversación, por un fallo que estaba en el test y
 * no en la app. `specs-produccion:probar-candado` les reinyecta los tres.
 *
 * CÓMO MIRA
 * ─────────
 * Con el parser de TypeScript, solo los LITERALES: los comentarios quedan fuera, y tienen que
 * quedar, porque los propios arreglos explican la trampa en un comentario («NO 'networkidle'»,
 * «…__card en dev»). Por eso tampoco se enciende el `w.__tono` de un espía en `window` ni el
 * `__NEXT_DATA__`: no son un literal con «__» delante de un nombre de clase en minúscula.
 *
 * Juzga **las líneas que el commit añade**, como `check:parser`: el pasivo (`--todo`) se cuenta
 * y se nombra, pero no detiene nada; cada uno se drena cuando su spec se toca o se pone rojo.
 *
 * Escape: «produccion-ok: <razón>» en la línea o en la anterior, y la razón es obligatoria (un
 * spec que solo corre en dev, o un `networkidle` en una página sin <Link>). Revertir si salta en
 * falso dos veces: dos escapes cuya razón sea que la forma sí funciona en el build (P004).
 */

import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ_DEFECTO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ts = createRequire(path.join(RAIZ_DEFECTO, 'package.json'))('typescript');

const args = process.argv.slice(2);
const iRaiz = args.indexOf('--raiz');
const RAIZ = iRaiz !== -1 ? path.resolve(args[iRaiz + 1]) : RAIZ_DEFECTO;
const TODO = args.includes('--todo');
const iDesde = args.indexOf('--desde');
const BASE = iDesde !== -1 ? args[iDesde + 1] : 'HEAD';
const SUELTOS = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--raiz' && args[i - 1] !== '--desde');

if (process.env.VERCEL) {
  console.log('✓ specs de producción: omitido en Vercel (se valida en local antes de subir)');
  process.exit(0);
}

const relevante = (f) => /^tests\//.test(f) && /\.(ts|tsx|mjs|js)$/.test(f) && !f.endsWith('.d.ts');

// ─── Las formas ───────────────────────────────────────────────────────────────

const RECETA_CLASE = 'selectorDelModulo de tests/apps/_modulo-css.ts, [class$="_x"], o rol/texto';
/**
 * Los nombres de los módulos CSS del repositorio (`Foo` de `Foo.module.css`) que empiezan por
 * mayúscula. Se leen SIEMPRE del repositorio real, también con `--raiz`: el candado juzga los
 * specs de este catálogo.
 *
 * Por qué hace falta la lista y no basta con «empieza por mayúscula»: `[class*="Overlay"]` o
 * `[class*="calcBtn"]:not([class*="Ghost"])` casan con la COLA camelCase de un nombre local
 * («modalOverlay», «calcBtnGhost») y funcionan en el build. Lo que no existe en el build es el
 * nombre del FICHERO («OrientacionHerencias», «DataReference»). Medido el 08/11/2026: con la
 * mayúscula a secas, 3 de los 5 sitios de todo tests/ eran colas así.
 */
function nombresDeModulo() {
  const nombres = new Set();
  const rec = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) rec(abs);
      else if (e.name.endsWith('.module.css') && /^[A-Z]/.test(e.name)) nombres.add(e.name.slice(0, -'.module.css'.length));
    }
  };
  for (const dir of ['app', 'components']) rec(path.join(RAIZ_DEFECTO, dir));
  return nombres;
}
const MODULOS = nombresDeModulo();

/** Un [class*=|^=|…="Valor"] cuyo valor empieza por el nombre de un fichero .module.css. */
const ATRIBUTO_CLASE = /\[\s*class\s*[*^$~|]?=\s*\\?['"]?([A-Z][A-Za-z0-9]*)/g;
function nombreDeModuloEn(fuente) {
  for (const m of fuente.matchAll(ATRIBUTO_CLASE)) {
    for (let fin = m[1].length; fin > 0; fin--) {
      if (MODULOS.has(m[1].slice(0, fin))) return m;
    }
  }
  return null;
}

const FORMAS_CLASE = [
  { buscar: (t) => /[A-Za-z0-9]-module\b/.exec(t), que: '«-module» en un localizador de clase' },
  // «__» delante de un nombre local o de una interpolación. Fuera: lo que lleva un identificador
  // pegado delante (`w.__tono`, `#__next`), y lo que sigue con «_» o «$» detrás, que no es un
  // nombre local de CSS Modules sino una clave interna (`__reactProps$`, `__reactFiber$`) o un
  // id con «__» de cierre (`__next-route-announcer__`).
  // Las claves de React también van por nombre, porque a veces se escriben sin el «$». Un «$»
  // seguido de «/», «)» o «|» es el ancla de una expresión regular (`/__card$/`), no una clave.
  { buscar: (t) => /(?<![\w$#.\\-])__(?:(?!react)[a-z][A-Za-z0-9-]*(?![\w-]|\$(?![/)|]))|\$\{)/.exec(t), que: '«__» de clase de módulo (forma de next dev)' },
  { buscar: nombreDeModuloEn, que: '[class…] con el nombre de un fichero .module.css' },
];

/**
 * Un literal que es la CLAVE de algo y no un localizador: `VentanaMorse['__morse']`,
 * `w['__tono']`, `{ '__x': … }`. Un espía en `window` se nombra así; una clase, no.
 */
function esClave(nodo) {
  const p = nodo.parent;
  if (!p) return false;
  return (
    (ts.isElementAccessExpression(p) && p.argumentExpression === nodo) ||
    ts.isLiteralTypeNode(p) ||
    ts.isComputedPropertyName(p) ||
    ((ts.isPropertyAssignment(p) || ts.isPropertySignature(p)) && p.name === nodo)
  );
}

/** Hallazgos de un fichero: { linea (1-based), forma, que, receta }. */
function analizar(rel, texto) {
  const kind = /\.tsx$/.test(rel) ? ts.ScriptKind.TSX : /\.m?js$/.test(rel) ? ts.ScriptKind.JS : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(rel, texto, ts.ScriptTarget.Latest, true, kind);
  const hallazgos = [];
  const linea = (pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;

  const visitar = (nodo) => {
    const k = nodo.kind;
    const esCadena = k === ts.SyntaxKind.StringLiteral || k === ts.SyntaxKind.NoSubstitutionTemplateLiteral;
    const esLiteral = esCadena || k === ts.SyntaxKind.TemplateExpression || k === ts.SyntaxKind.RegularExpressionLiteral;
    if (esLiteral) {
      const inicio = nodo.getStart(sf);
      const fuente = nodo.getText(sf);
      if (esCadena && nodo.text === 'networkidle') {
        hallazgos.push({ linea: linea(inicio), forma: 'b', que: "espera a 'networkidle'", receta: 'esperarPaginaAsentada de tests/apps/_hidratacion.ts' });
      }
      for (const f of esClave(nodo) ? [] : FORMAS_CLASE) {
        const m = f.buscar(fuente);
        if (m) {
          hallazgos.push({ linea: linea(inicio + m.index), forma: 'a', que: f.que, receta: RECETA_CLASE });
          break; // una por literal basta
        }
      }
      // Una plantilla ya se ha mirado entera: no bajar a sus trozos, que repetirían el hallazgo.
      if (k !== ts.SyntaxKind.TemplateExpression) return;
    }
    ts.forEachChild(nodo, visitar);
  };
  visitar(sf);
  return hallazgos;
}

// ─── Git ──────────────────────────────────────────────────────────────────────

function git(argumentos) {
  return execFileSync('git', argumentos, { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Líneas que el commit añade o modifica, en su numeración ACTUAL. `null` = todas. */
function lineasTocadas(rel) {
  let diff;
  try {
    diff = git(['diff', '--unified=0', '--no-color', BASE, '--', rel]);
  } catch {
    return null;
  }
  if (!diff.length) return null;
  const tocadas = new Set();
  for (const l of diff) {
    const m = l.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (!m) continue;
    const desde = Number(m[1]);
    const cuantas = m[2] === undefined ? 1 : Number(m[2]);
    for (let i = 0; i < cuantas; i++) tocadas.add(desde + i);
  }
  return tocadas;
}

function objetivos() {
  if (SUELTOS.length) return SUELTOS.map((f) => f.replace(/\\/g, '/'));
  if (TODO) {
    const todos = [];
    const rec = (dir) => {
      if (!fs.existsSync(dir)) return;
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, e.name);
        if (e.isDirectory()) rec(abs);
        else todos.push(path.relative(RAIZ, abs).replace(/\\/g, '/'));
      }
    };
    rec(path.join(RAIZ, 'tests'));
    return todos.filter(relevante);
  }
  try {
    const cambiados = git(['diff', '--name-only', '--diff-filter=ACM', BASE]);
    const nuevos = git(['ls-files', '--others', '--exclude-standard']);
    return [...new Set([...cambiados, ...nuevos])].filter(relevante);
  } catch {
    console.log('✓ specs de producción: omitido (no se pudo consultar git)');
    process.exit(0);
  }
}

// ─── Análisis ─────────────────────────────────────────────────────────────────

/** La razón del escape, sin el cierre del comentario. Vacía = escape a secas; null = no hay. */
const razon = (l) => {
  const m = (l ?? '').match(/produccion-ok:([^\n]*)/);
  return m ? m[1].replace(/\*\/|\}|\/\//g, '').trim() : null;
};

const rompen = [];
const pasivo = [];
const barrido = TODO || SUELTOS.length > 0;

for (const rel of objetivos()) {
  const abs = path.join(RAIZ, rel);
  if (!fs.existsSync(abs)) continue;
  const texto = fs.readFileSync(abs, 'utf8');
  const lineas = texto.split('\n');
  const tocadas = barrido ? null : lineasTocadas(rel);

  for (const h of analizar(rel, texto)) {
    const escape = razon(lineas[h.linea - 1]) ?? razon(lineas[h.linea - 2]);
    if (escape) continue; // con razón escrita
    const caso = { rel, ...h, sinRazon: escape === '', fuente: (lineas[h.linea - 1] ?? '').trim().slice(0, 100) };
    const esDelCommit = barrido ? false : tocadas === null || tocadas.has(h.linea);
    (esDelCommit ? rompen : pasivo).push(caso);
  }
}

// ─── Salida ───────────────────────────────────────────────────────────────────

const pintar = (c) =>
  `  ${c.rel}:${c.linea}  (${c.forma}) ${c.que} → ${c.receta}${c.sinRazon ? ' · lleva `produccion-ok:` SIN razón escrita' : ''}\n          ${c.fuente}`;

if (rompen.length) {
  console.error('\n✗ Specs de producción — el build se detiene\n');
  for (const c of rompen) console.error(pintar(c));
  console.error('\nEstas formas pasan en `next dev` y fallan contra el build (`next start`), que es contra');
  console.error('lo que corre la suite de la recogida: (a) el build compila las clases de módulo como');
  console.error('«hash_x», sin el nombre del fichero ni «__»; (b) en producción la red no queda quieta.');
  console.error('Si de verdad funciona en el build, «produccion-ok: <razón>» en esa línea o en la anterior.\n');
  process.exit(1);
}

if (barrido) {
  if (!pasivo.length) {
    console.log('✓ specs de producción: sin formas de next dev en lo revisado');
  } else {
    const ficheros = new Set(pasivo.map((c) => c.rel));
    const a = pasivo.filter((c) => c.forma === 'a').length;
    console.log(`\n· specs de producción — ${pasivo.length} sitio(s) en ${ficheros.size} fichero(s) (${a} de clase de módulo, ${pasivo.length - a} de networkidle):\n`);
    for (const c of pasivo) console.log(pintar(c));
    console.log('\nEs el PASIVO: no rompe nada. Se drena cuando su spec se toca o se pone rojo.\n');
  }
  process.exit(0);
}

if (pasivo.length) {
  const ficheros = new Set(pasivo.map((c) => c.rel));
  console.log(`✓ specs de producción: lo que añade este commit está limpio (${pasivo.length} sitio(s) anteriores en ${ficheros.size} fichero(s), sin tocar)`);
} else {
  console.log('✓ specs de producción: sin formas de next dev en lo que toca este commit');
}
