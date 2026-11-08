#!/usr/bin/env node
/**
 * censo-reserva-oscuro.mjs — censo del cabo C0681: la RESERVA de la receta de
 * `check:semanticos-claro`, `var(--rojo-texto, X)` (y `--naranja-`, `--ambar-`, `--verde-texto`),
 * en el tema OSCURO.
 *
 *   node scripts/contraste-semanticos/censo-reserva-oscuro.mjs            resumen
 *   node scripts/contraste-semanticos/censo-reserva-oscuro.mjs --detalle  cada uso que falla
 *
 * En oscuro globals pone los cuatro tokens `-texto` a `initial`, así que manda la reserva X: el
 * color de antes de la receta, que la campaña del claro no midió en oscuro. Ningún candado lo
 * mira: `check:semanticos-claro` solo juzga el claro y `check:token-oscuro` solo los semánticos
 * de globals (`--danger`, `--error`, `--success`, `--warning`), no un token del módulo usado de
 * reserva.
 *
 * Resuelve X en oscuro (literal; token del módulo, con su valor oscuro si lo redeclara en algún
 * selector oscuro; o token de globals en oscuro) y la mide contra los fondos oscuros PLANOS del
 * sitio (`FONDOS_OSCUROS` de censo.mjs). Se salta los selectores que redeclaran `color` en su
 * variante oscura, donde la reserva no llega a pintarse.
 *
 * Es una cota, no el veredicto: no ve los tintes (el caso de origen, «Aún no cuadra» de
 * visualizador-reacciones-quimicas, era #e74c3c a 4,12:1 sobre su tinte al 10 % encima de
 * #1A1A1A), ni el fondo que pone el TSX, ni el tamaño del texto (3:1 si es grande). El valor de
 * cada caso se decide por píxel contra su fondo real.
 *
 * Medido el 08/11/2026 (tarea de /reparar): 848 usos como color de texto; 455 en 261 hojas por
 * debajo de 4,5:1 en algún fondo plano, 322 en 212 contra la tarjeta #2D2D2D y 57 en 48 contra
 * la página #1A1A1A.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsearCss } from '../contraste-marca/clasificar.mjs';
import { aHex, contraste, FONDOS_OSCUROS } from './censo.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DETALLE = process.argv.includes('--detalle');
const RE_OSCURO = /\[data-theme\s*=\s*['"]?dark['"]?\]/;
const RE_RECETA = /var\(\s*--(rojo|naranja|ambar|verde)-texto\s*,\s*(.+)\)\s*$/;
const RE_COLOR = /^(color|-webkit-text-fill-color)$/;

function recorrer(dir, suf, acc = []) {
  let es;
  try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of es) {
    if (['node_modules', '.next', '.git'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p, suf, acc);
    else if (e.name.endsWith(suf)) acc.push(p);
  }
  return acc;
}

const esOscuro = (b) => RE_OSCURO.test(b.selector) || b.contexto.oscuroMedia;

/** Tokens de una hoja separados por tema: el último valor visto en cada uno. */
function tokens(bloques) {
  const osc = new Map();
  const cla = new Map();
  for (const b of bloques) {
    for (const d of b.decls) if (d.prop.startsWith('--')) (esOscuro(b) ? osc : cla).set(d.prop, d.valor.trim());
  }
  return { osc, cla };
}

const G = tokens(parsearCss(fs.readFileSync(path.join(RAIZ, 'app/globals.css'), 'utf8')));

function resolver(valor, mod, prof = 0) {
  if (prof > 6) return null;
  const v = valor.trim().replace(/\s*!important$/i, '');
  const hex = aHex(v);
  if (hex) return hex;
  const m = v.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/);
  if (!m) return null;
  const cand = mod.osc.get(m[1]) ?? mod.cla.get(m[1]) ?? G.osc.get(m[1]) ?? G.cla.get(m[1]);
  if (cand && cand !== 'initial') return resolver(cand, mod, prof + 1);
  if (m[2]) return resolver(m[2], mod, prof + 1);
  return null;
}

const baseDe = (parte) => parte
  .replace(/:global\(\s*(\[data-theme\s*=\s*['"]?dark['"]?\])\s*\)/, '$1')
  .replace(RE_OSCURO, '').replace(/\s+/g, ' ').trim();

const casos = [];
const hojas = ['app', 'components', 'styles'].flatMap((a) => recorrer(path.join(RAIZ, a), '.module.css'));
for (const h of hojas) {
  const rel = path.relative(RAIZ, h).replace(/\\/g, '/');
  const bloques = parsearCss(fs.readFileSync(h, 'utf8'));
  const mod = tokens(bloques);
  const colorOscuro = new Set();
  for (const b of bloques) {
    if (!esOscuro(b)) continue;
    if (!b.decls.some((d) => RE_COLOR.test(d.prop) && !RE_RECETA.test(d.valor.trim()))) continue;
    for (const parte of b.selector.split(',')) colorOscuro.add(baseDe(parte));
  }
  for (const b of bloques) {
    if (/\[data-theme\s*=\s*['"]?light/.test(b.selector)) continue;
    if (!esOscuro(b) && b.selector.split(',').every((p) => colorOscuro.has(p.replace(/\s+/g, ' ').trim()))) continue;
    for (const d of b.decls) {
      if (!RE_COLOR.test(d.prop)) continue;
      const m = d.valor.trim().match(RE_RECETA);
      if (!m) continue;
      const hex = resolver(m[2], mod);
      const ratios = hex ? FONDOS_OSCUROS.map((f) => contraste(hex, f)) : [];
      casos.push({ rel, linea: d.linea, sel: b.selector, reserva: m[2], hex: hex ?? '?', ratios });
    }
  }
}

const fmt = (n) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const hojasDe = (cs) => new Set(cs.map((c) => c.rel)).size;
const resueltos = casos.filter((c) => c.hex !== '?');
const peor = (c) => Math.min(...c.ratios);
const fallan = resueltos.filter((c) => peor(c) < 4.5);
const tarjeta = resueltos.filter((c) => c.ratios[FONDOS_OSCUROS.indexOf('#2D2D2D')] < 4.5);
const pagina = resueltos.filter((c) => c.ratios[FONDOS_OSCUROS.indexOf('#1A1A1A')] < 4.5);

console.log('\nCenso C0681 — reserva de la receta -texto en oscuro (fondos planos: cota, no veredicto)');
console.log(`   ${hojas.length} hojas · ${casos.length} usos como color de texto · ${casos.length - resueltos.length} sin resolver`);
console.log(`   por debajo de 4,5:1 en algún fondo plano (${FONDOS_OSCUROS.join(', ')}): ${fallan.length} en ${hojasDe(fallan)} hojas`);
console.log(`   contra la tarjeta #2D2D2D: ${tarjeta.length} en ${hojasDe(tarjeta)} hojas · contra la página #1A1A1A: ${pagina.length} en ${hojasDe(pagina)} hojas\n`);
const porHex = {};
for (const c of fallan) (porHex[c.hex] ??= []).push(c);
for (const [k, cs] of Object.entries(porHex).sort((a, b) => b[1].length - a[1].length).slice(0, DETALLE ? Infinity : 15)) {
  console.log(`   · ${String(cs.length).padStart(3)} × ${k} (peor ${fmt(Math.min(...cs.map(peor)))}:1)`);
}
if (DETALLE) {
  console.log('');
  for (const c of fallan) console.log(`   ${c.rel}:${c.linea}  ${c.sel}  reserva ${c.reserva} = ${c.hex}  peor ${fmt(peor(c))}:1`);
  for (const c of casos.filter((x) => x.hex === '?')) console.log(`   SIN RESOLVER ${c.rel}:${c.linea} ${c.reserva}`);
}
