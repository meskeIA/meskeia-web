#!/usr/bin/env node
/**
 * censo-literal-oscuro.mjs — censo del cabo C0708: un color semántico LITERAL (rojo, naranja,
 * ámbar o verde escrito en hexadecimal o rgb, sin `var()`) como color de texto en un
 * `.module.css`, sin que su selector redeclare `color` en la variante oscura.
 *
 *   node scripts/contraste-semanticos/censo-literal-oscuro.mjs            resumen
 *   node scripts/contraste-semanticos/censo-literal-oscuro.mjs --detalle  cada uso que falla
 *
 * Caso de origen (inspector 11/11/2026, conjugador-verbos): el aviso de error en #dc2626 queda
 * en oscuro a 2,97:1 sobre la tarjeta #2A2A2A. Ningún candado lo ve: `check:semanticos-claro`
 * mide solo el claro, y `check:token-oscuro` solo tokens declarados en el módulo y los semánticos
 * de globals. La receta `var(--rojo-texto, X)` es la otra forma del mismo hueco y la cuenta su
 * hermano `censo-reserva-oscuro.mjs` (C0681): aquí se excluye para no contarla dos veces.
 *
 * Mide el literal contra los fondos oscuros PLANOS del sitio (`FONDOS_OSCUROS` de censo.mjs) y se
 * salta los selectores que redeclaran `color` en su variante oscura. Es una cota, no el veredicto:
 * no ve tintes, ni el fondo que pone el TSX (un aviso sobre su propio fondo claro, igual en los
 * dos temas, sale aquí como falso positivo), ni el tamaño del texto (3:1 si es grande).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsearCss } from '../contraste-marca/clasificar.mjs';
import { aHex, contraste, FONDOS_OSCUROS } from './censo.mjs';
import { familia } from '../check-semanticos-claro.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DETALLE = process.argv.includes('--detalle');
const RE_OSCURO = /\[data-theme\s*=\s*['"]?dark['"]?\]/;
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
const baseDe = (parte) => parte
  .replace(/:global\(\s*(\[data-theme\s*=\s*['"]?dark['"]?\])\s*\)/, '$1')
  .replace(RE_OSCURO, '').replace(/\s+/g, ' ').trim();

const casos = [];
const hojas = ['app', 'components', 'styles'].flatMap((a) => recorrer(path.join(RAIZ, a), '.module.css'));
for (const h of hojas) {
  const rel = path.relative(RAIZ, h).replace(/\\/g, '/');
  const bloques = parsearCss(fs.readFileSync(h, 'utf8'));
  // Selectores cuya variante oscura ya redeclara el color: ahí el literal no llega a pintarse.
  const colorOscuro = new Set();
  for (const b of bloques) {
    if (!esOscuro(b)) continue;
    if (!b.decls.some((d) => RE_COLOR.test(d.prop))) continue;
    for (const parte of b.selector.split(',')) colorOscuro.add(baseDe(parte));
  }
  for (const b of bloques) {
    // ⚠️ parsearCss no marca `@media print`: una regla de impresión cuenta aquí (sobrecuenta).
    if (esOscuro(b)) continue;
    if (/\[data-theme\s*=\s*['"]?light/.test(b.selector)) continue;
    if (b.selector.split(',').every((p) => colorOscuro.has(p.replace(/\s+/g, ' ').trim()))) continue;
    for (const d of b.decls) {
      if (!RE_COLOR.test(d.prop)) continue;
      const v = d.valor.trim().replace(/\s*!important$/i, '');
      if (v.includes('var(')) continue;
      const hex = aHex(v);
      if (!hex) continue;
      const fam = familia(hex);
      if (!fam) continue;
      const ratios = FONDOS_OSCUROS.map((f) => contraste(hex, f));
      casos.push({ rel, linea: d.linea, sel: b.selector, hex, fam, ratios });
    }
  }
}

const fmt = (n) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const hojasDe = (cs) => new Set(cs.map((c) => c.rel)).size;
const peor = (c) => Math.min(...c.ratios);
const fallan = casos.filter((c) => peor(c) < 4.5);
const tarjeta = casos.filter((c) => c.ratios[FONDOS_OSCUROS.indexOf('#2D2D2D')] < 4.5);
const pagina = casos.filter((c) => c.ratios[FONDOS_OSCUROS.indexOf('#1A1A1A')] < 4.5);

console.log('\nCenso C0708 — color semántico LITERAL sin variante oscura (fondos planos: cota, no veredicto)');
console.log(`   ${hojas.length} hojas · ${casos.length} usos como color de texto en ${hojasDe(casos)} hojas`);
console.log(`   por debajo de 4,5:1 en algún fondo plano (${FONDOS_OSCUROS.join(', ')}): ${fallan.length} en ${hojasDe(fallan)} hojas`);
console.log(`   contra la tarjeta #2D2D2D: ${tarjeta.length} en ${hojasDe(tarjeta)} hojas · contra la página #1A1A1A: ${pagina.length} en ${hojasDe(pagina)} hojas\n`);
const porHex = {};
for (const c of fallan) (porHex[c.hex] ??= []).push(c);
for (const [k, cs] of Object.entries(porHex).sort((a, b) => b[1].length - a[1].length).slice(0, DETALLE ? Infinity : 15)) {
  console.log(`   · ${String(cs.length).padStart(3)} × ${k} ${cs[0].fam} (peor ${fmt(Math.min(...cs.map(peor)))}:1)`);
}
if (DETALLE) {
  console.log('');
  for (const c of fallan) console.log(`   ${c.rel}:${c.linea}  ${c.sel}  ${c.hex}  peor ${fmt(peor(c))}:1`);
}
