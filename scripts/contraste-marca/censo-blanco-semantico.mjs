#!/usr/bin/env node
/**
 * censo-blanco-semantico.mjs — dónde mirar el texto BLANCO sobre un FONDO semántico (cabo C0659)
 *
 * Uso:  node scripts/contraste-marca/censo-blanco-semantico.mjs [--detalle]
 *
 * De dónde sale: cronometro (inspector 07/11/2026), el botón Pausar con texto blanco sobre
 * #f59e0b, 2,15:1. Ningún candado lo ve: check:contraste-marca solo mira el blanco sobre la
 * MARCA y check:semanticos-claro el color del TEXTO semántico, no el blanco sobre un fondo
 * semántico.
 *
 * Qué cuenta: reglas de .module.css de app/ y components/ que declaran, en la MISMA regla, color
 * blanco y un background literal rojo, naranja, ámbar o verde (saturación ≥ 0,35, fuera de la
 * marca) por debajo de 4,5:1. Medido el 07/11/2026: 97 reglas en 55 carpetas.
 *
 * Por qué NO es un candado: sobrecuenta y se deja cosas. No sabe si el texto es grande (3:1: las
 * fichas de juego-2048 y juego-wordle lo son) ni ve los fondos que llegan por var() o desde otra
 * regla. Solo dice dónde mirar; el valor se decide midiendo por píxel contra el fondo real, app
 * por app (receta de contraste: cambiar el fondo hasta 4,5:1 conservando el tono).
 *
 * Lo que entra NUEVO lo para desde el 13/11/2026 `npm run check:blanco-semantico`, con este mismo
 * criterio sobre las líneas que añade cada commit; este censo sigue midiendo el pasivo.
 */
import fs from 'node:fs';
import path from 'node:path';

const detalle = process.argv.includes('--detalle');
function recorrer(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') recorrer(p, out); }
    else if (e.name.endsWith('.module.css')) out.push(p);
  }
  return out;
}
const hex = (h) => {
  let s = h.replace('#', '');
  if (s.length === 3) s = [...s].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const lum = ([r, g, b]) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const tono = ([r, g, b]) => {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min;
  if (d === 0) return { h: 0, s: 0 };
  let h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  h *= 60; if (h < 0) h += 360;
  const l = (max + min) / 2;
  return { h, s: d / (1 - Math.abs(2 * l - 1)) };
};
const MARCA = new Set(['2e86ab', '48a9a6', '7fb3d3', '1a5278']);
const BLANCO = /(^|;|\s)color\s*:\s*(#fff\b|#ffffff\b|white\b|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))/i;
const FONDO = /background(?:-color)?\s*:\s*(#[0-9a-f]{3,6})\b/i;

const hojas = recorrer('app').concat(recorrer('components'));
let total = 0;
const porApp = {};
for (const f of hojas) {
  const css = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const [, sel, decl] = m;
    if (!BLANCO.test(decl)) continue;
    const fm = decl.match(FONDO);
    if (!fm) continue;
    const h = fm[1].toLowerCase().replace('#', '');
    const norm = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
    if (MARCA.has(norm)) continue;
    const rgb = hex(fm[1]);
    const { h: hue, s } = tono(rgb);
    if (s < 0.35) continue;
    // rojo, naranja, ámbar y verde: fuera quedan los azules, violetas y rosas
    if (!(hue < 170 || hue >= 330)) continue;
    const r = contraste([255, 255, 255], rgb);
    if (r >= 4.5) continue;
    total++;
    const app = f.split(path.sep)[1];
    (porApp[app] ??= []).push(`${sel.trim().split('\n').pop().trim()} · #${norm} · ${r.toFixed(2).replace('.', ',')}:1${/dark/.test(sel) ? ' (oscuro)' : ''}`);
  }
}
const orden = Object.entries(porApp).sort((x, y) => y[1].length - x[1].length);
console.log(`${total} reglas en ${orden.length} carpetas (texto blanco sobre fondo semántico literal por debajo de 4,5:1)`);
if (detalle) for (const [a, l] of orden) console.log(`\n${a} (${l.length})\n   ${l.join('\n   ')}`);
else console.log(orden.slice(0, 30).map(([a, l]) => `${a} ${l.length}`).join(' · '));
