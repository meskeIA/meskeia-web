#!/usr/bin/env node
/**
 * check-reloj-azar.mjs — que el HTML prerenderizado no se quede con la fecha o el azar del build
 *
 * Ejecutar:  npm run check:reloj-azar               (lo ejecuta también `npm run build`)
 *            npm run check:reloj-azar -- --todo     (catálogo entero: informa, NO rompe)
 *            node scripts/check-reloj-azar.mjs app/x/page.tsx   (ficheros sueltos)
 *            node scripts/check-reloj-azar.mjs --raiz <dir>     (lo usa reloj-azar:probar-candado)
 *
 * QUÉ BUSCA
 * ─────────
 * Dos formas del mismo defecto: un valor que se calcula durante el RENDER a partir del reloj o
 * del azar. Next prerenderiza la página en el build y React la vuelve a renderizar al hidratar,
 * así que ese valor se calcula DOS veces, con dos resultados distintos.
 *
 *   A. Un `useState` cuyo valor inicial llega al reloj o al azar:
 *        useState(() => new Date().toISOString().split('T')[0])      ← control-gastos
 *        useState<Acta>({ …, fecha: new Date().toISOString()… })     ← generador-actas
 *   B. El `min` o el `max` de un `<input>` de fecha calculados en el render:
 *        const hoy = new Date().toISOString().split('T')[0];  …  max={hoy}   ← planificador-mascota
 *
 * Fuentes que cuenta: `Math.random()`, `crypto.randomUUID()`, `Date.now()`, `new Date()` SIN
 * argumentos y los ayudantes de `@/lib` que leen el reloj cuando se llaman sin argumentos
 * (`hoyISOLocal()`, `hoyFechaOrd()`). Sigue además las variables y las funciones del MISMO
 * fichero (hasta tres saltos): `useState(generarId)` con `const generarId = () => Math.random()…`
 * es el mismo defecto con un paso más.
 *
 * POR QUÉ IMPORTA
 * ───────────────
 * React 19 no corrige al hidratar un atributo que no coincide con el del servidor: se queda el
 * del HTML. Lo que se ve no es lo que calcula la app. En simulador-kmeans (hallazgo alto del
 * Inspector, 29/09/2026, a59e60ca) los puntos pintados no eran los que agrupaba el algoritmo;
 * en control-gastos (8a4c1c03, 27/10/2026) el campo de fecha proponía la del build; en
 * planificador-embarazo y planificador-mascota (e3ba909f) el tope del calendario seguía siendo
 * el día del build. La receta, en los tres: el valor se pone al montar, en un efecto
 * (`setFecha(prev => prev || hoyISOLocal())`), y el atributo va `|| undefined` mientras tanto.
 * Para el azar que dibuja algo, un PRNG sembrado (mulberry32, como simulador-kmeans).
 *
 * El cabo C0074 lo censó a mano el 24/10/2026 con un grep de una línea, que no veía el objeto
 * multilínea de generador-actas. Por eso aquí se lee el árbol sintáctico.
 *
 * QUÉ NO HACE, Y POR QUÉ
 * ──────────────────────
 * Juzga **las líneas que el commit añade**, como `check:parser` y `check:clases-css`: un sitio
 * rompe si su línea (la del `useState(`, la del atributo) o la de la fuente de reloj o azar es
 * nueva. El pasivo no obliga, porque no todo lo que encuentra es un defecto VISIBLE: si lo que
 * depende del valor espera a montado (calendario-fiscal-emprendedor, mes y año), o la app no
 * se prerenderiza, se ve bien. Eso se decide app a app, y lo decide el Inspector.
 *
 * NO ve lo que llega al reloj a través de otro fichero (un hook propio, un motor importado) ni
 * el texto calculado en el render fuera de un `useState` o de un `min`/`max`. Eso se mide en
 * navegador comparando el DOM servido con el estado tras hidratar.
 *
 * Escape: «reloj-ok: <razón>» en la línea del sitio, en la anterior, o junto a la fuente. La
 * razón es obligatoria: la marca a secas también rompe.
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
const SUELTOS = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--raiz');

// En Vercel no se ejecuta: el clon es shallow y `git diff HEAD` no significa lo mismo, y el
// build local —que es donde manda el flujo del proyecto— ya lo ha pasado antes del push.
if (process.env.VERCEL) {
  console.log('✓ reloj y azar en el render: omitido en Vercel (se valida en local antes de subir)');
  process.exit(0);
}

const TIPOS_FECHA = new Set(['date', 'datetime-local', 'month', 'week', 'time']);
/** Ayudantes propios que leen el reloj si se llaman sin argumentos. */
const AYUDANTES_RELOJ = new Set(['hoyISOLocal', 'hoyFechaOrd']);
const SALTOS = 3;

const relevante = (f) =>
  /\.(ts|tsx)$/.test(f) && !f.endsWith('.d.ts') && /^(app|components|lib)\//.test(f);

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
    diff = git(['diff', '--unified=0', '--no-color', 'HEAD', '--', rel]);
  } catch {
    return null;
  }
  if (!diff.length) return null;
  const tocadas = new Set();
  for (const linea of diff) {
    const m = linea.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
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
    for (const dir of ['app', 'components', 'lib']) rec(path.join(RAIZ, dir));
    return todos.filter(relevante);
  }
  try {
    const cambiados = git(['diff', '--name-only', '--diff-filter=ACM', 'HEAD']);
    const nuevos = git(['ls-files', '--others', '--exclude-standard']);
    return [...new Set([...cambiados, ...nuevos])].filter(relevante);
  } catch {
    console.log('✓ reloj y azar en el render: omitido (no se pudo consultar git)');
    process.exit(0);
  }
}

// ─── Fuentes de reloj y azar ──────────────────────────────────────────────────

/** Si el nodo ES una lectura del reloj o del azar, cuál; si no, null. */
function fuente(n) {
  if (ts.isNewExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'Date'
      && !(n.arguments && n.arguments.length)) return 'new Date()';
  if (!ts.isCallExpression(n)) return null;
  const c = n.expression;
  if (ts.isIdentifier(c) && AYUDANTES_RELOJ.has(c.text) && n.arguments.length === 0) return `${c.text}()`;
  if (ts.isPropertyAccessExpression(c)) {
    const nombre = c.name.text;
    const base = c.expression;
    const baseTexto = ts.isIdentifier(base) ? base.text
      : ts.isPropertyAccessExpression(base) ? base.name.text : null;
    if (baseTexto === 'Math' && nombre === 'random') return 'Math.random()';
    if (baseTexto === 'Date' && nombre === 'now') return 'Date.now()';
    if (baseTexto === 'crypto' && nombre === 'randomUUID') return 'crypto.randomUUID()';
  }
  return null;
}

/** El identificador es una REFERENCIA a un valor (no un nombre de propiedad ni de declaración). */
function esReferencia(id) {
  const p = id.parent;
  if (!p) return false;
  if (ts.isPropertyAccessExpression(p) && p.name === id) return false;
  if ((ts.isPropertyAssignment(p) || ts.isPropertyDeclaration(p) || ts.isMethodDeclaration(p)) && p.name === id) return false;
  if (ts.isJsxAttribute(p) || ts.isJsxOpeningElement(p) || ts.isJsxSelfClosingElement(p) || ts.isJsxClosingElement(p)) return false;
  if ((ts.isVariableDeclaration(p) || ts.isFunctionDeclaration(p) || ts.isParameter(p) || ts.isBindingElement(p)) && p.name === id) return false;
  if (ts.isImportSpecifier(p) || ts.isImportClause(p)) return false;
  return true;
}

/** Declaración local (variable con valor o función) a la que se refiere un identificador. */
function resolver(id) {
  const nombre = id.text;
  for (let a = id.parent; a; a = a.parent) {
    if (ts.isFunctionLike(a) && a.parameters?.some((p) => ts.isIdentifier(p.name) && p.name.text === nombre)) return null;
    const sentencias = ts.isBlock(a) || ts.isSourceFile(a) || ts.isModuleBlock(a) ? a.statements : null;
    if (!sentencias) continue;
    for (const s of sentencias) {
      if (ts.isFunctionDeclaration(s) && s.name?.text === nombre) return s;
      if (ts.isVariableStatement(s)) {
        for (const d of s.declarationList.declarations) {
          if (ts.isIdentifier(d.name) && d.name.text === nombre && d.initializer) return d.initializer;
        }
      }
    }
  }
  return null;
}

/**
 * TODAS las fuentes de reloj o azar a las que llega el nodo, siguiendo lo local. Todas y no la
 * primera: en generador-actas el estado inicial ya llega al azar por `generateId` (pasivo), y
 * quedándose con esa, la fecha del build devuelta a otra línea del mismo objeto pasaba callada
 * (caso 6 de las pruebas, que falló con la primera versión).
 */
function buscarFuentes(nodo, saltos = SALTOS, vistos = new Set(), via = null) {
  const halladas = [];
  const visitar = (n) => {
    if (ts.isTypeNode(n)) return;
    const f = fuente(n);
    if (f) { halladas.push({ nodo: n, que: f, via }); return; }
    if (ts.isIdentifier(n) && saltos > 0 && esReferencia(n)) {
      const decl = resolver(n);
      if (decl && !vistos.has(decl)) {
        vistos.add(decl);
        halladas.push(...buscarFuentes(decl, saltos - 1, vistos, via ?? n.text));
      }
    }
    ts.forEachChild(n, visitar);
  };
  visitar(nodo);
  return halladas;
}

// ─── Sitios ───────────────────────────────────────────────────────────────────

const esUseState = (n) =>
  ts.isCallExpression(n) && n.arguments.length > 0 && (
    (ts.isIdentifier(n.expression) && n.expression.text === 'useState') ||
    (ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'useState'));

function tipoDeInput(atributos) {
  for (const a of atributos.properties) {
    if (!ts.isJsxAttribute(a) || a.name.getText() !== 'type' || !a.initializer) continue;
    if (ts.isStringLiteral(a.initializer)) return a.initializer.text;
    const e = a.initializer.expression;
    if (e && (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e))) return e.text;
  }
  return null;
}

function sitiosDe(sf) {
  const sitios = [];
  const visitar = (n) => {
    if (esUseState(n)) {
      const fuentes = buscarFuentes(n.arguments[0]);
      if (fuentes.length) sitios.push({ forma: 'A', nodo: n, fuentes, que: 'valor inicial de useState' });
    }
    if ((ts.isJsxSelfClosingElement(n) || ts.isJsxOpeningElement(n))
        && n.tagName.getText() === 'input' && TIPOS_FECHA.has(tipoDeInput(n.attributes))) {
      for (const a of n.attributes.properties) {
        if (!ts.isJsxAttribute(a) || !['min', 'max'].includes(a.name.getText())) continue;
        const e = a.initializer && ts.isJsxExpression(a.initializer) ? a.initializer.expression : null;
        if (!e) continue;
        const fuentes = buscarFuentes(e);
        if (fuentes.length) sitios.push({ forma: 'B', nodo: a, fuentes, que: `${a.name.getText()} de un input de fecha` });
      }
    }
    ts.forEachChild(n, visitar);
  };
  visitar(sf);
  return sitios;
}

// ─── Análisis ─────────────────────────────────────────────────────────────────

/** La razón del escape, sin el cierre del comentario. Vacía = escape a secas; null = no hay. */
const razon = (linea) => {
  const m = (linea ?? '').match(/reloj-ok:([^\n]*)/);
  return m ? m[1].replace(/\*\/|\}|\/\//g, '').trim() : null;
};

const rompen = [];
const pasivo = [];
const exentos = [];

for (const rel of objetivos()) {
  const abs = path.join(RAIZ, rel);
  if (!fs.existsSync(abs)) continue;
  const texto = fs.readFileSync(abs, 'utf8');
  if (!/useState|type=/.test(texto)) continue;
  const lineas = texto.split('\n');
  const sf = ts.createSourceFile(rel, texto, ts.ScriptTarget.Latest, true,
    rel.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const barrido = TODO || SUELTOS.length > 0;
  const tocadas = barrido ? null : lineasTocadas(rel);
  const linea = (nodo) => sf.getLineAndCharacterOfPosition(nodo.getStart(sf)).line + 1;

  for (const s of sitiosDe(sf)) {
    const nSitio = linea(s.nodo);
    const conLinea = s.fuentes.map((f) => ({ ...f, n: linea(f.nodo) }));
    const escapeEn = (n) => [n, n - 1].map((k) => razon(lineas[k - 1])).find((r) => r !== null) ?? null;
    const delSitio = escapeEn(nSitio);
    // Una fuente queda exenta con el escape del sitio o con el suyo propio.
    const vivas = conLinea.filter((f) => !(delSitio || escapeEn(f.n)));
    const sinRazon = delSitio === '' || conLinea.some((f) => escapeEn(f.n) === '');
    // Las del commit primero: son las que se nombran al romper.
    const nuevas = barrido ? [] : vivas.filter((f) => tocadas === null || tocadas.has(f.n));
    const nombrada = nuevas[0] ?? vivas[0] ?? conLinea[0];
    const caso = {
      rel, n: nSitio, forma: s.forma, que: s.que,
      fuente: `${nombrada.que}${nombrada.via ? ` vía «${nombrada.via}»` : ''} (L${nombrada.n})` +
        (conLinea.length > 1 ? ` y ${conLinea.length - 1} más` : ''),
      texto: lineas[nSitio - 1].trim().slice(0, 90),
      sinRazon,
    };
    if (!vivas.length) { exentos.push(caso); continue; }
    const esDelCommit = barrido ? false : tocadas === null || tocadas.has(nSitio) || nuevas.length > 0;
    (esDelCommit ? rompen : pasivo).push(caso);
  }
}

// ─── Salida ───────────────────────────────────────────────────────────────────

const pintar = (c) => `  ${c.rel}:${c.n}  [${c.forma}] ${c.que} ← ${c.fuente}${c.sinRazon ? ' · lleva `reloj-ok:` SIN razón escrita' : ''}`;

if (rompen.length) {
  console.error('\n✗ Reloj o azar en el render — el build se detiene\n');
  for (const c of rompen) {
    console.error(pintar(c));
    console.error(`          ${c.texto}`);
  }
  console.error('\nNext prerenderiza la página en el BUILD y React la vuelve a renderizar al hidratar:');
  console.error('ese valor sale dos veces distinto, y React 19 no corrige un atributo que no coincide.');
  console.error('Receta: el valor vacío en el render y el de verdad al montar, en un efecto');
  console.error('(`setFecha(prev => prev || hoyISOLocal())`, `max={hoy || undefined}`); para el azar que');
  console.error('dibuja algo, un PRNG sembrado. Si lo que depende del valor espera a montado o la página');
  console.error('no se prerenderiza, «reloj-ok: <razón>» en esa línea o en la anterior.\n');
  process.exit(1);
}

if (TODO || SUELTOS.length) {
  if (!pasivo.length) {
    console.log('✓ reloj y azar en el render: nada en lo revisado');
  } else {
    const ficheros = new Set(pasivo.map((c) => c.rel));
    console.log(`\n· reloj y azar en el render — ${pasivo.length} sitio(s) en ${ficheros.size} fichero(s):\n`);
    for (const c of pasivo) console.log(pintar(c));
    console.log('\nEs el PASIVO: no rompe nada. Si es defecto visible lo decide el Inspector app por');
    console.log('app (¿lo que depende del valor espera a montado?).\n');
  }
  if (exentos.length) console.log(`  ${exentos.length} exento(s) con \`reloj-ok\``);
  process.exit(0);
}

if (pasivo.length) {
  const ficheros = new Set(pasivo.map((c) => c.rel));
  console.log(
    '✓ reloj y azar en el render: lo que añade este commit está limpio ' +
      `(${pasivo.length} sitio(s) anteriores en ${ficheros.size} fichero(s), sin tocar)`,
  );
} else {
  console.log('✓ reloj y azar en el render: nada en lo que toca este commit');
}
