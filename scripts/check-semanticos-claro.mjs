#!/usr/bin/env node
/**
 * check-semanticos-claro.mjs — que ningún texto rojo, naranja, ámbar o verde escrito en un
 * `.module.css` se quede por debajo de su umbral de contraste en el tema CLARO (cabo C0296).
 *
 * Ejecutar:  npm run check:semanticos-claro          (lo ejecuta también `npm run build`)
 *            npm run check:semanticos-claro -- --todo   lista también lo que no juzga
 *            node scripts/check-semanticos-claro.mjs app/x/X.module.css   (hojas sueltas)
 *
 * QUÉ BUSCA
 * ─────────
 * Un `color:` (o `-webkit-text-fill-color:`) del tema claro cuyo valor es un color de familia
 * semántica —rojo, naranja, ámbar o verde, por su tono— escrito como literal, como token propio
 * del módulo (`--danger: #ef4444` y luego `var(--danger)`) o como token global sin variante de
 * texto (`var(--error)` es #F44336: 3,68:1 sobre blanco). Lo mide contra el fondo que sabe:
 * el de la misma regla si lo declara (un `rgba()` compuesto sobre blanco) y, si no, contra el
 * BLANCO, que es la cota alta (sobre #FAFAFA o un tinte el contraste real es menor). Umbral
 * 4,5:1, o 3:1 si la misma regla declara texto grande (≥ 24 px, o ≥ 18,66 px en negrita) o es
 * un `::before`/`::after`/`::marker` (iconos y viñetas: no-texto, WCAG 1.4.11).
 *
 * La receta es un token de TEXTO por familia, como `--primary-texto` de C0070, que existe SOLO
 * en el tema claro: `--rojo-texto`, `--naranja-texto`, `--ambar-texto` y `--verde-texto`, y se
 * escribe con el color de antes como reserva: `color: var(--rojo-texto, #ef4444)`. En oscuro
 * globals los deja en `initial`, la reserva manda y la app se ve exactamente como antes. Por
 * qué no llevan un valor del oscuro, como `--primary-texto`: dos de cada tres hojas pintan
 * algún tinte claro que no cambia en oscuro, y un rojo pastel encima de un rosa fijo da
 * 1,3:1; el oscuro de los semánticos es C0226 (check:token-oscuro). Por eso el candado rompe
 * también con un token de éstos SIN reserva: en oscuro el color caería a lo heredado.
 * `familia()` y `analizarHoja()` se exportan: los usó la campaña.
 *
 * QUÉ NO JUZGA, Y POR QUÉ
 * ───────────────────────
 *   · El texto cuyo fondo es OSCURO: el de la propia regla o el de una clase antecesora del
 *     selector que el módulo pinta oscura (`.footer a` con `.footer { background: #1a1a2e }`,
 *     los bloques de código, los héroes). Ahí oscurecer el texto lo empeora. Era el ruido
 *     conocido del censo del 19/10.
 *   · Un fondo que no sabe leer (degradado claro, `var()` que no resuelve, imagen).
 *   · `var(--x, #lit)` con `--x` sin declarar en la hoja: lo pone el TSX en su `style`.
 *   · Los `style={{ color }}` de los `.tsx`, el `fill` de un SVG y el texto de un `<canvas>`.
 *   · Las apps congeladas (los cursos, 16/10/2026: publicados, sin drenar su pasivo).
 *   · Los portales con paleta propia (home y páginas de Coquinum, Cronicum, Delegum y Stemum,
 *     y sus pies): su oro y su terracota son marca, no semánticos, y van sobre héroes y pies
 *     oscuros que pone el TSX. La marca la vigila check:contraste-marca.
 *   · Lo que va con `opacity` en un antecesor: el contraste real lo mide el píxel.
 * Que el sustituto cumpla en su fondo REAL lo mide por píxel tests/contraste-semanticos-claro.spec.ts.
 *
 * DE DÓNDE SALE
 * ─────────────
 * C0296 (18/10/2026), visto al reparar C0226 (los semánticos en OSCURO, check:token-oscuro):
 * en claro tampoco cumplían adaptacion-hogar (#E74C3C sobre #fdf2f2, 3,6:1) y mi-ip (el 3G
 * #ffc107 sobre blanco, 1,6:1), reparados a mano en f9af2556. El censo del 19/10 (929 reglas en
 * 471 hojas, con un script que se perdió con la copia de /reparar) lo hizo campaña, y el
 * hallazgo 3600 (calculadora-legibilidad, 30/10) volvió a dar la misma forma. Este detector,
 * reescrito el 31/10/2026, contó 1.138 reglas en 513 hojas antes de la campaña: más que el
 * del 19/10 porque resuelve los tokens propios de cualquier nombre (`--color-warn`), los
 * globales y `styles/`; las diferencias no se pueden reconciliar con un script que no existe.
 *
 * Sin pasivo: barre el árbol entero. Escape: «semanticos-ok: <razón>» en la línea del color o
 * en la anterior, con la razón obligatoria (la marca a secas también rompe).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsearCss, luminancia } from './contraste-marca/clasificar.mjs';
import { aHex, contraste } from './contraste-semanticos/censo.mjs';
import { prefijosCongelados, esCongelado } from './contraste-marca/congelados.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Los cuatro tokens de texto con su valor (≥ 4,5:1 sobre blanco, #FAFAFA, #F5F5F5 y el tinte
 *  al 20 % de su familia). Los mismos que `app/globals.css`. */
export const FAMILIAS = {
  rojo: { token: '--rojo-texto', claro: '#B91C1C' },
  naranja: { token: '--naranja-texto', claro: '#B93E0B' },
  ambar: { token: '--ambar-texto', claro: '#8A5A00' },
  verde: { token: '--verde-texto', claro: '#136E35' },
};

/** Valores del claro de los tokens de globals que pueden aparecer como `var()`. */
const GLOBALES = {
  '--error': '#f44336', '--success': '#4caf50', '--warning': '#ff9800',
  '--bg-card': '#ffffff', '--bg-primary': '#fafafa', '--hover': '#f5f5f5', '--border': '#e5e5e5',
  '--hero-bg': '#1a5278', '--primary': '#2e86ab', '--secondary': '#48a9a6',
  '--primary-boton': '#26718f', '--secondary-boton': '#327874',
  ...Object.fromEntries(Object.values(FAMILIAS).map((f) => [f.token, f.claro.toLowerCase()])),
};

const RE_OSCURO = /\[data-theme\s*=\s*["']?dark["']?\s*\]|:global\(\s*\.dark\s*\)/i;
const RE_ESCAPE = /semanticos-ok:\s*(\S.*)?/;
/** Por debajo, el texto blanco encima pasa de 4,5:1: es un fondo oscuro. */
const LUM_OSCURO = 0.183;

function hsl(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  const d = mx - mn;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

/** La familia semántica de un color por su tono, o null (grises, azules, violetas…). */
export function familia(hex) {
  const { h, s } = hsl(hex);
  if (s < 0.3) return null;
  if (h >= 340 || h < 14) return 'rojo';
  if (h < 30) return 'naranja'; // #d97706 (32°) es el ámbar-600 de Tailwind, no un naranja

  if (h < 62) return 'ambar';
  if (h >= 75 && h < 170) return 'verde';
  return null;
}

const aHex6 = (r, g, b) => `#${[r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
const canales = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const sobreBlanco = (hex, a) => aHex6(...canales(hex).map((c) => c * a + 255 * (1 - a)));

/** Resuelve un valor de fondo a { hex } o { tipo } ('degradado', 'otro', 'transparente'). */
function resolverFondo(valor, tokens) {
  let v = valor.trim().toLowerCase().replace(/\s*!important$/, '');
  if (/^(transparent|none|inherit|initial|unset)$/.test(v)) return { tipo: 'transparente' };
  const mv = v.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)$/);
  if (mv) v = tokens[mv[1]] ?? GLOBALES[mv[1]] ?? (mv[2] ? mv[2].trim() : null) ?? '';
  if (/gradient\(/.test(v)) {
    const colores = [...v.matchAll(/#[0-9a-f]{3,6}\b|rgba?\([^)]*\)|var\(\s*--[\w-]+\s*\)/g)].map((m) => {
      const x = m[0].startsWith('var(') ? tokens[m[0].slice(4, -1).trim()] ?? GLOBALES[m[0].slice(4, -1).trim()] : m[0];
      return x ? resolverFondo(x, tokens) : null;
    });
    if (colores.length && colores.every((c) => c?.hex && luminancia(c.hex) < LUM_OSCURO)) return { hex: colores[0].hex };
    return { tipo: 'degradado' };
  }
  if (/url\(/.test(v)) return { tipo: 'otro' };
  const m = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+%?)\s*)?\)/);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : +m[4];
    if (a === 0) return { tipo: 'transparente' };
    return { hex: sobreBlanco(aHex6(+m[1], +m[2], +m[3]), a) };
  }
  const h = aHex(v.split(/\s+/)[0] ?? '');
  return h ? { hex: h } : { tipo: 'otro' };
}

const ultimoFondo = (decls) => decls.filter((d) => /^background(-color)?$/.test(d.prop)).at(-1);
/** Los compuestos de un selector (`.a > .b .c` → ['.a', '.b', '.c']). */
const compuestos = (sel) => sel.replace(/\s*[>+~]\s*/g, ' ').trim().split(/\s+/);
const clasesDe = (comp) => (comp.match(/\.[A-Za-z0-9_-]+/g) ?? []);

/**
 * Los textos semánticos de una hoja que no llegan a su umbral en claro. Cada caso lleva
 * `accion`: 'receta' (con el valor nuevo en `nuevo`), 'aparte' (no juzgado, con `motivo`) o
 * 'sin-reserva' (el token de texto usado sin el color del oscuro detrás), y `escape` si su
 * línea lo lleva.
 */
export function analizarHoja(css) {
  const bloques = parsearCss(css);
  const lineas = css.split('\n');
  const claros = bloques.filter((b) => !b.contexto.oscuroMedia && !RE_OSCURO.test(b.selector));

  // Tokens propios del módulo (su valor del claro, resolviendo un nivel de var())
  const tokens = {};
  for (const b of claros) for (const d of b.decls) if (d.prop.startsWith('--')) tokens[d.prop] ??= d.valor.trim();
  for (const [k, v] of Object.entries(tokens)) {
    const mv = v.match(/^var\(\s*(--[\w-]+)\s*\)$/);
    tokens[k] = mv ? tokens[mv[1]] ?? GLOBALES[mv[1]] ?? v : v;
  }

  // Clases que el módulo pinta con fondo oscuro
  const clasesOscuras = new Set();
  for (const b of claros) {
    const f = ultimoFondo(b.decls);
    if (!f) continue;
    const r = resolverFondo(f.valor, tokens);
    if (r.hex && luminancia(r.hex) < LUM_OSCURO) {
      for (const p of b.selector.split(',')) for (const c of clasesDe(compuestos(p.trim()).at(-1) ?? '')) clasesOscuras.add(c);
    }
  }

  const casos = [];
  for (const b of claros) {
    for (const d of b.decls) {
      if (!/^(color|-webkit-text-fill-color)$/.test(d.prop)) continue;
      const importante = /!important\s*$/i.test(d.valor);
      const valor = d.valor.replace(/\s*!important\s*$/i, '').trim();
      let hex = aHex(valor);
      let via = 'literal';
      const mv = valor.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)$/);
      if (!hex && mv) {
        if (Object.values(FAMILIAS).some((f) => f.token === mv[1])) {
          // Ya es la receta. Sin reserva y sin declararlo el módulo, en oscuro no hay color:
          // el token no existe en ese tema y `color` cae a lo heredado.
          if (!mv[2] && !(mv[1] in tokens)) casos.push({ linea: d.linea, selector: b.selector, valor: d.valor, accion: 'sin-reserva' });
          continue;
        }
        if (tokens[mv[1]] && aHex(tokens[mv[1]])) { hex = aHex(tokens[mv[1]]); via = 'token-modulo'; }
        else if (GLOBALES[mv[1]] && /^--(error|success|warning)$/.test(mv[1])) { hex = GLOBALES[mv[1]]; via = 'token-global'; }
        else if (mv[2] && aHex(mv[2])) { hex = aHex(mv[2]); via = 'reserva'; }
      }
      if (!hex) continue;
      const fam = familia(hex);
      if (!fam) continue;

      const tam = b.decls.find((x) => x.prop === 'font-size')?.valor ?? '';
      const px = (m => m ? (m[2] === 'rem' || m[2] === 'em' ? +m[1] * 16 : +m[1]) : 0)(tam.match(/^([\d.]+)(px|rem|em)$/));
      const negrita = /^(bold|bolder|[6-9]00)$/.test(b.decls.find((x) => x.prop === 'font-weight')?.valor.trim() ?? '');
      const pseudo = /::?(before|after|marker)\b/.test(b.selector);
      const umbral = px >= 24 || (px >= 18.66 && negrita) || pseudo ? 3 : 4.5;

      const fDecl = ultimoFondo(b.decls);
      const fondo = fDecl ? resolverFondo(fDecl.valor, tokens) : { tipo: 'ninguno' };
      const hexFondo = fondo.hex ?? '#ffffff';
      const ratio = contraste(hex, hexFondo);
      if (ratio >= umbral) continue;

      const caso = {
        linea: d.linea, desde: d.desde, hasta: d.hasta, selector: b.selector, valor: d.valor, hex, fam, via,
        fondo: fondo.hex ?? fondo.tipo, ratio: Math.round(ratio * 100) / 100, umbral,
      };
      const esc = [lineas[d.linea - 1], lineas[d.linea - 2]].map((l) => l?.match(RE_ESCAPE)).find(Boolean);
      if (esc) caso.escape = esc[1]?.replace(/\*\/.*$/, '').trim() || '';

      const partes = b.selector.split(',').map((p) => p.trim());
      const padreOscuro = partes.some((p) => compuestos(p).slice(0, -1).some((c) => clasesDe(c).some((k) => clasesOscuras.has(k))));
      if (fondo.hex && luminancia(fondo.hex) < LUM_OSCURO) Object.assign(caso, { accion: 'aparte', motivo: 'fondo oscuro en la regla' });
      else if (padreOscuro) Object.assign(caso, { accion: 'aparte', motivo: 'fondo oscuro del antecesor' });
      else if (fondo.tipo === 'degradado' || fondo.tipo === 'otro') Object.assign(caso, { accion: 'aparte', motivo: `fondo ${fondo.tipo}` });
      else if (via === 'reserva') Object.assign(caso, { accion: 'aparte', motivo: 'var() que pone el TSX' });
      else Object.assign(caso, { accion: 'receta', nuevo: `var(${FAMILIAS[fam].token}, ${valor})${importante ? ' !important' : ''}` });
      casos.push(caso);
    }
  }
  return casos;
}

// ─── Ejecución directa ────────────────────────────────────────────────────────

function recorrer(dir, acc = []) {
  let es;
  try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of es) {
    if (['node_modules', '.next', '.git'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p, acc);
    else if (e.name.endsWith('.module.css')) acc.push(p);
  }
  return acc;
}

const RE_PORTAL = /^app\/(coquinum|cronicum|delegum|stemum)\/|^components\/(Coquinum|Cronicum|Delegum|Stemum)[A-Za-z]*\.module\.css$/;

/** Las hojas que barre el candado: app/, components/ y styles/, sin congeladas ni portales. */
export function hojasDelArbol(raiz = RAIZ) {
  const cong = prefijosCongelados(raiz);
  return ['app', 'components', 'styles']
    .flatMap((a) => recorrer(path.join(raiz, a)))
    .filter((h) => {
      const rel = path.relative(raiz, h).replace(/\\/g, '/');
      return !esCongelado(rel, cong) && !RE_PORTAL.test(rel);
    });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const TODO = args.includes('--todo');
  const sueltas = args.filter((a) => !a.startsWith('--'));
  const hojas = sueltas.length ? sueltas.map((s) => path.resolve(s)) : hojasDelArbol();
  // Un árbol sin hojas daría verde sin haber mirado nada
  if (!hojas.length) {
    console.error('❌ check:semanticos-claro — no encuentro ninguna hoja .module.css que mirar');
    process.exit(2);
  }
  const fmt = (n) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(n);
  const rompen = [];
  const sinRazon = [];
  const aparte = [];
  for (const h of hojas) {
    const rel = path.relative(RAIZ, h).replace(/\\/g, '/');
    for (const c of analizarHoja(fs.readFileSync(h, 'utf8'))) {
      if (c.escape === '') sinRazon.push({ rel, ...c });
      else if (c.escape) continue;
      else if (c.accion === 'aparte') aparte.push({ rel, ...c });
      else rompen.push({ rel, ...c });
    }
  }
  const linea = (c) => c.accion === 'sin-reserva'
    ? `   ${c.rel}:${c.linea}  ${c.selector}  ${c.valor}`
    : `   ${c.rel}:${c.linea}  ${c.selector}  ${c.valor} sobre ${c.fondo === 'ninguno' ? 'blanco (la regla no pone fondo)' : c.fondo} = ${fmt(c.ratio)}:1 (umbral ${fmt(c.umbral)})`;
  if (TODO && aparte.length) {
    console.log(`\nNo juzgados (${aparte.length}): el fondo no es claro o no se sabe leer`);
    for (const c of aparte) console.log(`${linea(c)} · ${c.motivo}`);
  }
  if (rompen.length || sinRazon.length) {
    console.error(`\n❌ check:semanticos-claro — texto rojo, naranja, ámbar o verde que no se lee en el tema claro`);
    for (const c of rompen) console.error(`${linea(c)}\n      → ${c.accion === 'sin-reserva' ? 'falta la reserva: en oscuro este token no existe' : c.nuevo}`);
    for (const c of sinRazon) console.error(`${linea(c)}\n      → el escape semanticos-ok necesita su razón`);
    console.error(`\n   Receta: var(--rojo-texto, <color de antes>), y lo mismo con --naranja-texto, --ambar-texto`);
    console.error(`   y --verde-texto. Solo existen en claro: en oscuro manda la reserva (C0296).`);
    console.error(`   Falso positivo (el fondo real es oscuro y lo pone el TSX): «semanticos-ok: <razón>».\n`);
    process.exit(1);
  }
  console.log(`✅ check:semanticos-claro — ${hojas.length} hojas, ningún texto semántico por debajo de su umbral en claro${aparte.length ? ` (${aparte.length} no juzgados: --todo)` : ''}`);
}
