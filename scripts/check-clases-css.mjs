#!/usr/bin/env node
/**
 * check-clases-css.mjs — la clase de CSS module que el JSX usa y su .module.css no declara
 *
 * Ejecutar:  npm run check:clases-css              (lo ejecuta también `npm run build`)
 *            npm run check:clases-css -- --todo    (censo del catálogo entero: informa, NO rompe)
 *            node scripts/check-clases-css.mjs app/x/page.tsx   (ficheros sueltos)
 *
 * QUÉ PROHÍBE
 * ───────────
 * Que el código de `app/` o `components/` lea `styles.x`, `styles['x']` o ``styles[`x`]`` de un
 * `.module.css` importado que no declara `.x`. El módulo devuelve `undefined`, el elemento sale
 * SIN atributo class y se pinta sin maquetar. El CSS es válido, TypeScript no lo ve (el tipo de
 * un módulo CSS es un diccionario abierto), el build pasa y nada avisa.
 *
 * Juzga, como `check-a11y-jsx`, **las líneas que el commit añade**, no el fichero entero: el
 * censo del 13/10/2026 (cabo C0157, un grep de 40 líneas que se perdió) dio 563 clases así en
 * 68 apps, y este script con `--todo`, al nacer el 23/10/2026, 548 en 89 ficheros de 59 apps
 * (ya sin los 7 falsos de generador-firma-email). Un candado por fichero rompería el build cada
 * vez que se tocase una de ellas por otro motivo. El pasivo de un fichero tocado se cuenta y se
 * dice, pero no detiene nada; lo drena el Inspector app por app (cabo C0386).
 *
 * Y una cosa más que el diff de un .tsx no enseña: si el commit cambia un `.module.css` y una
 * clase que ESTABA declarada deja de estarlo, cada uso que quede en sus importadores rompe,
 * esté en la línea que esté. La clase la ha borrado este commit.
 *
 * DE DÓNDE SALE
 * ─────────────
 * Del Inspector del 07/10/2026 en `estimador-cartera-inversion`: 28 clases de su bloque
 * educativo (comparativaTable, escenarioCard, faqList, warningBox…) no existían en
 * EstimadorCartera.module.css, y la tabla de perfiles perdía dos columnas a 390 px. Reparado
 * en c465b811. El cabo C0157 lo generalizó; los casos por app viven en C0386.
 *
 * LOS FALSOS POSITIVOS QUE EVITA, Y CÓMO
 * ──────────────────────────────────────
 *   · Solo cuenta un identificador LIGADO al `import x from '….module.css'`, resuelto con el
 *     binder de TypeScript, no por su nombre. `generador-firma-email` declara dentro de una
 *     función un `const styles = { name: …, company: …, link: … }` de estilos en línea que
 *     tapa al import; un grep de `styles.` lo daba por 7 clases inexistentes.
 *   · Cada uso se coteja con el módulo que importa ESE identificador, resuelto por su ruta
 *     (`./`, `../`, `@/`), no con el .module.css de la carpeta: un fichero que importa dos
 *     (`styles` e `impresion`) se juzga con cada uno por separado.
 *   · `composes:` no declara ni quita nada: la clase que compone se declara por su selector.
 *   · Un acceso dinámico (`styles[variable]`, ``styles[`a${b}`]``) no se puede juzgar y se omite.
 *
 * QUÉ NO MIRA
 * ───────────
 *   · Un `styles` que llega por prop desde otro componente: no hay import que resolver.
 *   · Si la clase declarada pinta algo: eso lo ve el Inspector en el navegador.
 *   · No se ejecuta en Vercel (allí el clon es shallow y el diff no significa lo mismo).
 *
 * SE PLANTA SI NO PUEDE MIRAR
 * ───────────────────────────
 * Si un fichero importa un `.module.css` por texto y el análisis no encuentra ningún
 * identificador ligado a él, rompe: daría verde sin haber mirado (la trampa de
 * `scripts/CLAUDE.md`). En `--todo`, también si no encuentra ningún import en todo el árbol.
 *
 * ESCAPE
 * ──────
 * `clases-ok: <razón>` en la línea del uso o en la anterior (en JSX, `{/* clases-ok: … *\/}`).
 * **La razón es obligatoria**: la marca a secas también rompe el build.
 *
 * Sus casos se le reinyectan con `npm run clases-css:probar-candado`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const RAIZ_DEFECTO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ts = createRequire(path.join(RAIZ_DEFECTO, 'package.json'))('typescript');

const args = process.argv.slice(2);
const iRaiz = args.indexOf('--raiz');
const RAIZ = iRaiz !== -1 ? path.resolve(args[iRaiz + 1]) : RAIZ_DEFECTO;
const TODO = args.includes('--todo');
const SUELTOS = args.filter((a, i) => !a.startsWith('--') && !(iRaiz !== -1 && i === iRaiz + 1));
const TODAS = TODO || SUELTOS.length > 0;

if (process.env.VERCEL) {
  console.log('✓ Clases CSS: omitido en Vercel (se valida en local antes de subir)');
  process.exit(0);
}

const rel = (abs) => path.relative(RAIZ, abs).replace(/\\/g, '/');
const esCodigo = (f) => /\.tsx?$/.test(f) && !f.endsWith('.d.ts');
const relevante = (f) => esCodigo(f) && (f.startsWith('app/') || f.startsWith('components/'));
/** Un import de módulo CSS por TEXTO, al principio de línea: una cadena que lo cita
 *  (`glosario-programacion` lo pone de ejemplo) no es un import. */
const IMPORT_MODULO = /^\s*import\s[^;]*?from\s+['"][^'"]+\.module\.css['"]/m;

function git(argumentos) {
  return execFileSync('git', argumentos, { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    .split('\n').map((s) => s.trim()).filter(Boolean);
}

function recorrer(dir, filtro, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') recorrer(p, filtro, out); }
    else if (filtro(e.name)) out.push(rel(p));
  }
  return out;
}
const arbolCodigo = () => ['app', 'components'].flatMap((d) => recorrer(path.join(RAIZ, d), esCodigo));

// ─── Clases declaradas en un .module.css ───────────────────────────────────────

/** Cada `.x` de un selector, sin comentarios. Lo que haya en `url(…)` o en `content:` solo
 *  puede AÑADIR nombres al conjunto, nunca quitarlos: ante la duda, el candado calla.
 *  Con letras Unicode: el catálogo tiene `.colorLeptón` y `.añadirBtn`, y con `\w` se leían
 *  como `colorLept` y se daban por inexistentes. */
function clasesDe(css) {
  const limpio = css.replace(/\/\*[\s\S]*?\*\//g, ' ');
  return new Set([...limpio.matchAll(/\.(-?[\p{L}_][\p{L}\p{N}\p{M}_-]*)/gu)].map((m) => m[1]));
}

const cacheCss = new Map();
function clasesDelModulo(relCss) {
  if (!cacheCss.has(relCss)) {
    const abs = path.join(RAIZ, relCss);
    cacheCss.set(relCss, fs.existsSync(abs) ? clasesDe(fs.readFileSync(abs, 'utf8')) : null);
  }
  return cacheCss.get(relCss);
}

function resolverModulo(desde, especificador) {
  const base = especificador.startsWith('@/')
    ? path.join(RAIZ, especificador.slice(2))
    : path.join(RAIZ, path.dirname(desde), especificador);
  return rel(base);
}

// ─── Qué mirar ─────────────────────────────────────────────────────────────────

/** Líneas que el commit añade en un fichero, en su numeración ACTUAL; `null` = todas. */
function lineasTocadas(f) {
  let diff;
  try { diff = git(['diff', '--unified=0', '--no-color', 'HEAD', '--', f]); } catch { return null; }
  if (!diff.length) return null;   // sin seguir: todo es nuevo
  const tocadas = new Set();
  for (const linea of diff) {
    const m = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(linea);
    if (!m) continue;
    const cuantas = m[2] === undefined ? 1 : Number(m[2]);
    for (let i = 0; i < cuantas; i++) tocadas.add(Number(m[1]) + i);
  }
  return tocadas;
}

let cambiados = [];
let nuevos = [];
if (!TODAS) {
  try {
    cambiados = git(['-c', 'core.quotepath=false', 'diff', '--name-only', '--diff-filter=ACM', 'HEAD']);
    nuevos = git(['-c', 'core.quotepath=false', 'ls-files', '--others', '--exclude-standard']);
  } catch {
    console.log('✓ Clases CSS: omitido (no se pudo consultar git)');
    process.exit(0);
  }
}

/**
 * Clases que ESTABAN declaradas en HEAD y este commit ha quitado de un .module.css ya
 * seguido. Un .module.css nuevo no tiene «antes»: lo que le falte lo verá el diff del .tsx.
 */
const desaparecidas = new Map();   // relCss → Set de clases
for (const f of cambiados.filter((f) => f.endsWith('.module.css'))) {
  let antes;
  try { antes = execFileSync('git', ['show', `HEAD:${f}`], { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); }
  catch { continue; }
  const ahora = clasesDelModulo(f) ?? new Set();
  const idas = [...clasesDe(antes)].filter((c) => !ahora.has(c));
  if (idas.length) desaparecidas.set(f, new Set(idas));
}

let objetivos;
if (SUELTOS.length) objetivos = SUELTOS.map((f) => f.replace(/\\/g, '/'));
else if (TODO) objetivos = arbolCodigo();
else {
  objetivos = [...new Set([...cambiados, ...nuevos])].filter(relevante);
  // Los importadores de un módulo que ha perdido clases, aunque el commit no los toque
  if (desaparecidas.size) {
    const nombres = [...desaparecidas.keys()].map((f) => path.basename(f));
    for (const f of arbolCodigo()) {
      if (objetivos.includes(f)) continue;
      const txt = fs.readFileSync(path.join(RAIZ, f), 'utf8');
      if (nombres.some((n) => txt.includes(n))) objetivos.push(f);
    }
  }
}
objetivos = objetivos.filter((f) => fs.existsSync(path.join(RAIZ, f)));

// ─── Análisis ──────────────────────────────────────────────────────────────────

const programa = ts.createProgram(objetivos.map((f) => path.join(RAIZ, f)), {
  noResolve: true, noLib: true, types: [], jsx: ts.JsxEmit.Preserve, allowJs: false,
});
const checker = programa.getTypeChecker();

const errores = [];   // en líneas del commit → rompen
const pasivo = [];    // lo que el fichero ya arrastraba → se cuenta
const exentas = [];
const plantados = [];
let importsVistos = 0;

/** `null` sin escape · 'firmado' con razón · 'sin razón' con la marca a secas. */
function escapeEn(lineas, l) {
  for (const t of [lineas[l - 1] ?? '', lineas[l - 2] ?? '']) {
    const m = t.match(/clases-ok:([^\n]*)/);
    if (!m) continue;
    const razon = m[1].replace(/\*\/.*$/, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
    return /\p{L}{3,}/u.test(razon) ? 'firmado' : 'sin razón';
  }
  return null;
}

/** El nombre de clase de un acceso estático, o `null` si es dinámico. */
function claseDe(n) {
  if (ts.isPropertyAccessExpression(n)) return n.name.text;
  const a = n.argumentExpression;
  if (a && (ts.isStringLiteral(a) || ts.isNoSubstitutionTemplateLiteral(a))) return a.text;
  return null;
}

for (const f of objetivos) {
  const abs = path.join(RAIZ, f);
  const sf = programa.getSourceFile(abs);
  if (!sf) continue;
  const texto = sf.text;
  const lineas = texto.split('\n');
  const tocadas = TODAS ? null : lineasTocadas(f);

  // Las ligaduras: declaración del import → módulo que resuelve
  const ligaduras = new Map();
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier)) continue;
    const esp = st.moduleSpecifier.text;
    if (!esp.endsWith('.module.css') || !st.importClause?.name) continue;
    ligaduras.set(st.importClause, resolverModulo(f, esp));
  }
  importsVistos += ligaduras.size;
  if (IMPORT_MODULO.test(texto.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')) && !ligaduras.size) {
    plantados.push(f);
    continue;
  }
  if (!ligaduras.size) continue;

  const visitar = (n) => {
    if ((ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n)) && ts.isIdentifier(n.expression)) {
      const decl = checker.getSymbolAtLocation(n.expression)?.declarations?.[0];
      const modulo = decl && ligaduras.get(decl);
      const clase = modulo && claseDe(n);
      const declaradas = modulo && clasesDelModulo(modulo);
      if (clase && declaradas && !declaradas.has(clase)) {
        const nodoLinea = ts.isPropertyAccessExpression(n) ? n.name : n.argumentExpression;
        const l = sf.getLineAndCharacterOfPosition(nodoLinea.getStart(sf)).line + 1;
        const esc = escapeEn(lineas, l);
        const borrada = desaparecidas.get(modulo)?.has(clase);
        const hallazgo = { f, l, clase, modulo, borrada, sinRazon: esc === 'sin razón' };
        if (esc === 'firmado') exentas.push(`${f}:${l}`);
        else if (tocadas === null || tocadas.has(l) || borrada) errores.push(hallazgo);
        else pasivo.push(hallazgo);
      }
    }
    ts.forEachChild(n, visitar);
  };
  visitar(sf);
}

// ─── Salida ────────────────────────────────────────────────────────────────────

if (plantados.length || (TODO && importsVistos === 0)) {
  console.error('\n❌ Clases CSS: no puedo ver los imports de los módulos CSS');
  for (const f of plantados) console.error(`   · ${f} importa un .module.css y no encuentro el identificador que lo liga`);
  if (!plantados.length) console.error('   · ningún import `x from \'….module.css\'` en todo el árbol: el análisis ya no los reconoce');
  console.error('   Sin ellos el candado daría verde sin haber mirado.\n');
  process.exit(1);
}

const porFichero = (arr) => {
  const m = new Map();
  for (const e of arr) { if (!m.has(e.f)) m.set(e.f, []); m.get(e.f).push(e); }
  return m;
};
const unicas = (arr) => new Set(arr.map((e) => `${e.f}\u0000${e.clase}`)).size;
const appDe = (f) => (f.startsWith('app/') ? f.split('/')[1] : f.split('/')[0]);

if (TODO) {
  const filas = [...porFichero(errores)].map(([f, es]) => [f, [...new Set(es.map((e) => e.clase))]])
    .sort((a, b) => b[1].length - a[1].length);
  console.log(`\n── Censo: ${unicas(errores)} clase(s) inexistentes (${errores.length} usos) en ${filas.length} fichero(s) de ${new Set(filas.map(([f]) => appDe(f))).size} app(s)\n`);
  for (const [f, cs] of filas) console.log(`  ${String(cs.length).padStart(3)}  ${f}  ${cs.join(' ')}`);
  if (exentas.length) console.log(`\n  ${exentas.length} exenta(s) con \`clases-ok\``);
  console.log('\n(modo --todo: mide el pasivo del catálogo, no rompe el build)\n');
  process.exit(0);
}

if (!errores.length) {
  if (pasivo.length) {
    console.log('· Clases CSS — pasivo anterior, fuera de este commit (no detiene el build):');
    for (const [f, es] of porFichero(pasivo)) console.log(`    ${f} arrastra ${es.length} uso(s) de clases inexistentes`);
    console.log('  Se ven con: node scripts/check-clases-css.mjs <fichero>');
  }
  console.log(`✓ Clases CSS: lo que toca este commit usa clases que su .module.css declara${exentas.length ? ` (${exentas.length} exenta(s))` : ''}`);
  process.exit(0);
}

console.error('\n✗ Clases CSS — el build se detiene: clase de CSS module que su .module.css no declara\n');
for (const [f, es] of porFichero(errores)) {
  console.error(`  ${f}`);
  // Una línea por clase, con sus usos: el caso de origen eran 28 clases en 90 usos
  const porClase = new Map();
  for (const e of es.sort((a, b) => a.l - b.l)) {
    const k = `${e.clase}\u0000${e.modulo}`;
    if (!porClase.has(k)) porClase.set(k, []);
    porClase.get(k).push(e);
  }
  for (const usos of porClase.values()) {
    const e = usos[0];
    const motivo = e.borrada ? `este commit la quita de ${e.modulo}` : `no está en ${e.modulo}`;
    const lineas = usos.map((u) => `L${u.l}`);
    const donde = lineas.length > 6 ? `${lineas.slice(0, 6).join(', ')}… (${lineas.length} usos)` : lineas.join(', ');
    console.error(`    .${e.clase} — ${motivo} · ${donde}${usos.some((u) => u.sinRazon) ? ' · lleva `clases-ok:` SIN razón escrita' : ''}`);
  }
}
console.error('\nEl elemento saldría sin atributo class y sin maquetar. Declara la clase en el módulo o usa una');
console.error('que exista. Si es un falso positivo, «clases-ok: <razón>» en esa línea o en la anterior.\n');
process.exit(1);
