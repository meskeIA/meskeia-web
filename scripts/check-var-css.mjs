#!/usr/bin/env node
/**
 * Script: check-var-css.mjs
 *
 * Candado de la VARIABLE CSS QUE NO EXISTE. Se ejecuta antes de cada build (`npm run build`)
 * y a mano con `npm run check:var-css`.
 *
 * QUÉ PROHÍBE
 * ───────────
 * Que un `.module.css` de `app/` o `components/` use `var(--x)` SIN valor de reserva cuando
 * `--x` no se declara en ningún sitio desde el que pueda llegarle:
 *   · `app/globals.css` (cualquier selector) u otro CSS global de `app/` o `styles/`;
 *   · el propio módulo;
 *   · el TSX de su carpeta (la de la app, `app/<slug>/`, o `components/`), que la pone en
 *     línea: `style={{ ['--pos' as string]: … }}`, `setProperty('--x', …)`;
 *   · un `layout.tsx` de `app/`, que la cuelga del `<html>` o del `<body>` (las fuentes de
 *     next/font: `variable: '--font-sora'`).
 *
 * Una `var()` sin declarar y sin reserva no da un valor por defecto: invalida la declaración
 * ENTERA en tiempo de cálculo, como si no estuviera. Un `background: var(--card-bg)` deja la
 * tarjeta transparente; un `border-radius: var(--radius-medium)`, en ángulo recto. El CSS es
 * válido, el build pasa y nada avisa.
 *
 * DE DÓNDE SALE
 * ─────────────
 * Del hallazgo 2367 (simulador-fluidos-bernoulli, 28/09/2026) y del cabo C0052 que lo
 * generalizó: cuatro nombres que nunca existieron en globals (`--radius-large` en 115
 * módulos, `--shadow-md` en 112, `--shadow-sm` en 90, `--shadow-lg` en 9), resueltos con
 * alias en globals (d608b1ac), y una docena suelta drenada después app a app: `--danger`,
 * `--bg-secondary`, `--radius-medium`, `--shadow-large`, `--spacing-4xl`, `--background`
 * (33c10c79) y el último, `--card-bg` en transportador-angulos (48c24779, 12/10/2026), que
 * dejaba sus tres tarjetas sin fondo.
 *
 * SIN PASIVO
 * ──────────
 * Barre el árbol entero. Con 48c24779 ya no quedaba ninguno salvo el de
 * estimador-irpf-pensionista, descartado en el Inspector del 03/10/2026 y firmado con su
 * escape: solo puede encenderlo código nuevo.
 *
 * QUÉ NO MIRA, Y POR QUÉ
 * ──────────────────────
 *   · `var(--x, reserva)`: con reserva la declaración no se invalida.
 *   · Si la variable llega de verdad al ELEMENTO: una declarada en `.otraCaja` del módulo
 *     cuenta como declarada aunque el elemento no esté dentro de `.otraCaja`. Saberlo exige el
 *     árbol del DOM; eso lo ve el Inspector en el navegador.
 *   · Los `style={{…}}` del JSX que usan `var(--x)` en línea.
 *
 * SE PLANTA SI NO PUEDE MIRAR
 * ───────────────────────────
 * Si no encuentra `--primary` entre las variables de `app/globals.css`, o no ha leído ningún
 * `.module.css`, rompe: con el conjunto vacío daría por indefinido todo, y con cero hojas
 * daría verde sin mirar (la trampa de `scripts/CLAUDE.md`).
 *
 * ESCAPE
 * ──────
 * `var-ok: <razón>` en la línea del uso o en el comentario que la precede. **La razón es
 * obligatoria**: la marca a secas también rompe el build.
 *
 * Sus casos de prueba se le reinyectan con `npm run var-css:probar-candado`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ_DEFECTO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const iRaiz = process.argv.indexOf('--raiz');
const RAIZ = iRaiz !== -1 ? path.resolve(process.argv[iRaiz + 1]) : RAIZ_DEFECTO;
const VERBOSO = process.argv.includes('--todo');

const ARBOLES = ['app', 'components'];

function recorrer(dir, filtro, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') recorrer(p, filtro, out); }
    else if (filtro(e.name)) out.push(p);
  }
  return out;
}

const sinComentariosCss = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
const rel = (p) => path.relative(RAIZ, p).replace(/\\/g, '/');

/** `--x:` declaradas en un CSS. */
function declaradasCss(css) {
  const s = new Set();
  for (const [, k] of sinComentariosCss(css).matchAll(/(--[A-Za-z_][\w-]*)\s*:/g)) s.add(k);
  return s;
}

/** `--x` puestas desde TS/TSX: tras una comilla (`'--pos'`, `variable: '--font-sora'`) o en un `style` de texto. */
function declaradasTs(txt) {
  const s = new Set();
  for (const [, k] of txt.matchAll(/['"`]\s*(--[A-Za-z_][\w-]*)/g)) s.add(k);
  for (const [, k] of txt.matchAll(/;\s*(--[A-Za-z_][\w-]*)\s*:/g)) s.add(k);
  return s;
}

const esTs = (n) => /\.(tsx?|jsx?)$/.test(n);
const union = (destino, origen) => { for (const k of origen) destino.add(k); return destino; };

// ─── Lo global: CSS globales y layouts ─────────────────────────────────────────
const globales = new Set();
const cssGlobales = [
  ...recorrer(path.join(RAIZ, 'app'), (n) => n.endsWith('.css') && !n.endsWith('.module.css')),
  ...recorrer(path.join(RAIZ, 'styles'), (n) => n.endsWith('.css') && !n.endsWith('.module.css')),
];
for (const f of cssGlobales) union(globales, declaradasCss(fs.readFileSync(f, 'utf8')));
const globalsLeido = cssGlobales.some((f) => rel(f) === 'app/globals.css');
if (!globalsLeido || !globales.has('--primary')) {
  console.error('\n❌ Variable CSS que no existe: no puedo leer las variables de app/globals.css');
  console.error(`   ${globalsLeido ? 'no aparece --primary entre las declaradas: el parser ya no las encuentra' : `no existe ${path.join(RAIZ, 'app', 'globals.css')}`}.`);
  console.error('   Sin esa lista el candado daría por indefinidas todas las variables, o verde sin mirar.\n');
  process.exit(1);
}
for (const f of recorrer(path.join(RAIZ, 'app'), (n) => /^layout\.(tsx?|jsx?)$/.test(n))) {
  union(globales, declaradasTs(fs.readFileSync(f, 'utf8')));
}

// ─── Lo de cada carpeta: el TSX de la app o de components/ ─────────────────────
const porCarpeta = new Map();
function carpetaDe(ruta) {
  const partes = rel(ruta).split('/');
  return partes[0] === 'app' && partes.length > 2 ? `app/${partes[1]}` : partes[0];
}
function enLineaDe(carpeta) {
  if (!porCarpeta.has(carpeta)) {
    const s = new Set();
    const dir = path.join(RAIZ, carpeta);
    const ficheros = carpeta === 'app'
      ? fs.readdirSync(dir).filter(esTs).map((n) => path.join(dir, n))
      : recorrer(dir, esTs);
    for (const f of ficheros) union(s, declaradasTs(fs.readFileSync(f, 'utf8')));
    porCarpeta.set(carpeta, s);
  }
  return porCarpeta.get(carpeta);
}

// ─── Escape ────────────────────────────────────────────────────────────────────
function clasificarEscape(texto) {
  const m = texto.match(/var-ok:([^\n]*)/);
  if (!m) return null;
  const razon = m[1].replace(/\*\/.*$/, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
  return /\p{L}{3,}/u.test(razon) ? 'firmado' : 'sin razón';
}

/** La línea del uso y el comentario que la precede, entero. */
function escapeEn(lineas, n) {
  const propia = clasificarEscape(lineas[n - 1] ?? '');
  if (propia) return propia;
  let i = n - 2;
  if (i < 0 || !/\*\/\s*$/.test(lineas[i])) return null;
  const trozo = [];
  for (; i >= 0; i--) {
    trozo.unshift(lineas[i]);
    if (lineas[i].includes('/*')) break;
  }
  return clasificarEscape(trozo.join('\n'));
}

// ─── Barrido ───────────────────────────────────────────────────────────────────
const errores = [];
const exentas = [];
let hojas = 0;
let usos = 0;
for (const ruta of ARBOLES.flatMap((a) => recorrer(path.join(RAIZ, a), (n) => n.endsWith('.module.css')))) {
  hojas++;
  const txt = fs.readFileSync(ruta, 'utf8');
  const limpio = sinComentariosCss(txt);
  const lineas = txt.split('\n');
  const propias = declaradasCss(txt);
  const enLinea = enLineaDe(carpetaDe(ruta));
  // `var(--x)` cerrado sin coma: sin reserva
  for (const m of limpio.matchAll(/var\(\s*(--[A-Za-z_][\w-]*)\s*\)/g)) {
    usos++;
    const k = m[1];
    if (globales.has(k) || propias.has(k) || enLinea.has(k)) continue;
    const n = limpio.slice(0, m.index).split('\n').length;
    const esc = escapeEn(lineas, n);
    if (esc === 'firmado') { exentas.push(`${rel(ruta)}:${n}`); continue; }
    const porQue = esc === 'sin razón'
      ? ' — lleva `var-ok:` SIN razón escrita, y una excepción sin motivo no se puede revisar'
      : '';
    errores.push(`${rel(ruta)}:${n} — \`var(${k})\` no se declara en globals, en el módulo ni en el TSX de ${carpetaDe(ruta)}/: la declaración entera se anula. Usa el token de globals que corresponda o pon una reserva \`var(${k}, …)\`.${porQue}`);
  }
}

if (hojas === 0) {
  console.error(`\n❌ Variable CSS que no existe: no he leído ningún .module.css en ${ARBOLES.join('/, ')}/ de ${RAIZ}\n`);
  process.exit(1);
}

// ─── Resultado ─────────────────────────────────────────────────────────────────
if (errores.length) {
  const muestra = VERBOSO ? errores : errores.slice(0, 12);
  console.error(`\n❌ Variable CSS que no existe: ${errores.length} uso(s)\n`);
  for (const e of muestra) console.error(`   · ${e}`);
  if (!VERBOSO && errores.length > 12) console.error(`\n   … y ${errores.length - 12} más (--todo para verlos).`);
  console.error('');
  process.exit(1);
}

console.log('✅ Variable CSS que no existe: correcto');
console.log(`   · ${hojas} hojas .module.css de app/ y components/, sin pasivo`);
console.log(`   · ${usos} usos de var() sin reserva, todos con su variable declarada (${globales.size} globales)`);
if (exentas.length) console.log(`   · ${exentas.length} exento(s) con \`var-ok\`: ${exentas.slice(0, 5).join(', ')}`);
