#!/usr/bin/env node
/**
 * check-blanco-semantico.mjs — que ninguna regla NUEVA ponga texto blanco sobre un fondo rojo,
 * naranja, ámbar o verde por debajo de 4,5:1
 *
 * Ejecutar:  npm run check:blanco-semantico              (lo ejecuta también `npm run build`)
 *            npm run check:blanco-semantico -- --todo    (catálogo entero: informa, NO rompe)
 *            npm run check:blanco-semantico -- --desde <ref>
 *
 * QUÉ BUSCA
 * En los .module.css de app/ y components/, una regla que declara `color` blanco y un
 * `background` literal de tono semántico (rojo, naranja, ámbar o verde, saturación ≥ 0,35, fuera
 * de la marca) con menos de 4,5:1, cuando el commit añade o toca la línea del blanco o la del fondo.
 *
 * DE DÓNDE SALE (cabo C0659, inspector 07/11/2026)
 * cronometro: el botón Pausar con texto blanco sobre #f59e0b, igual en los dos temas, 2,15:1
 * (hover #d97706: 3,19:1) con texto de 17,6 px. Ningún candado lo veía: check:contraste-marca solo
 * mira el blanco sobre la MARCA y check:semanticos-claro el color del TEXTO semántico, no el blanco
 * sobre un FONDO semántico.
 *
 * POR QUÉ SOLO LO QUE AÑADE EL COMMIT
 * El censo del 07/11/2026 (scripts/contraste-marca/censo-blanco-semantico.mjs, el mismo criterio)
 * dio 97 reglas en 55 carpetas, con sobrecuenta: no sabe si el texto es grande (3:1; las fichas de
 * juego-2048 y juego-wordle lo son) ni ve los fondos que llegan por var() o desde otra regla. Ni
 * es campaña (el tono de cada botón es decisión de su app) ni cabe sin pasivo: el pasivo lo drena
 * el Inspector app por app, midiendo por píxel.
 *
 * Escape: «blanco-ok: <razón>» en un comentario dentro de la regla o en la línea anterior a ella
 * (texto grande a 3:1, un fondo que no se ve con texto encima). La marca a secas no vale.
 *
 * Pruebas: `npm run blanco-semantico:probar-candado`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ, argumentos, lineasTocadas, objetivos } from './lineas-anadidas.mjs';

if (process.env.VERCEL) {
  console.log('✓ blanco sobre semántico: omitido en Vercel (se valida en local antes de subir)');
  process.exit(0);
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
const BLANCO = /(^|[;{\s])color\s*:\s*(#fff\b|#ffffff\b|white\b|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))/i;
const FONDO = /background(?:-color)?\s*:\s*(#[0-9a-f]{6}|#[0-9a-f]{3})(?![0-9a-f])/i;
const ESCAPE = /blanco-ok:\s*\S{3,}/;

/** Fondo semántico con blanco por debajo de 4,5:1, o null. */
function fondoMalo(h) {
  const norm = (h.length === 4 ? [...h.slice(1)].map((c) => c + c).join('') : h.slice(1)).toLowerCase();
  if (MARCA.has(norm)) return null;
  const rgb = hex(norm);
  const { h: hue, s } = tono(rgb);
  if (s < 0.35 || !(hue < 170 || hue >= 330)) return null;
  const r = contraste([255, 255, 255], rgb);
  return r < 4.5 ? { norm, r } : null;
}

const args = argumentos();
const barrido = args.todo || args.sueltos.length > 0;
const relevante = (f) => /^(app|components)\//.test(f) && f.endsWith('.module.css');
let ficheros;
try { ficheros = objetivos(args, { dirs: ['app', 'components'], relevante }); } catch {
  console.log('✓ blanco sobre semántico: omitido (no se pudo consultar git)');
  process.exit(0);
}

const linea = (txt, idx) => txt.slice(0, idx).split('\n').length; // 1-based
const rompen = [];
const pasivo = [];
for (const rel of ficheros) {
  const abs = path.resolve(RAIZ, rel);
  if (!fs.existsSync(abs)) continue;
  const original = fs.readFileSync(abs, 'utf8');
  const lineas = original.split('\n');
  // Los comentarios se blanquean conservando los saltos, para que los índices sigan valiendo
  const css = original.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const tocadas = barrido ? null : lineasTocadas(rel, args.base);
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const [, sel, decl] = m;
    const b = decl.match(BLANCO);
    const f = decl.match(FONDO);
    if (!b || !f) continue;
    const malo = fondoMalo(f[1]);
    if (!malo) continue;
    const ini = m.index + sel.length + 1;
    const lBlanco = linea(css, ini + b.index + b[1].length);
    const lFondo = linea(css, ini + f.index);
    const lSel = linea(css, m.index + sel.search(/\S/));
    const lFin = linea(css, m.index + m[0].length);
    const tramo = lineas.slice(Math.max(0, lSel - 2), lFin);
    if (tramo.some((l) => ESCAPE.test(l))) continue;
    const caso = { rel, n: lFondo, sel: sel.trim().split('\n').pop().trim(), color: `#${malo.norm}`, r: malo.r.toFixed(2).replace('.', ',') };
    const delCommit = !barrido && (tocadas === null || tocadas.has(lBlanco) || tocadas.has(lFondo));
    (delCommit ? rompen : pasivo).push(caso);
  }
}

if (rompen.length) {
  console.error('\n✗ Texto blanco sobre fondo semántico — el build se detiene\n');
  for (const c of rompen) console.error(`  ${c.rel}:${c.n}  ${c.sel} · blanco sobre ${c.color} = ${c.r}:1 (exige 4,5:1)`);
  console.error('\nOscurece el fondo conservando el tono hasta 4,5:1 con el blanco, en los dos temas.');
  console.error('Si el texto es grande (≥ 24 px, o ≥ 18,66 px en negrita) basta 3:1: escríbelo con');
  console.error('«/* blanco-ok: <razón> */» dentro de la regla o en la línea anterior.\n');
  process.exit(1);
}
if (barrido) {
  const n = new Set(pasivo.map((c) => c.rel.split('/')[1])).size;
  console.log(pasivo.length ? `· blanco sobre semántico — ${pasivo.length} regla(s) en ${n} carpeta(s) (pasivo, no rompe)` : '✓ blanco sobre semántico: ninguno en lo revisado');
  if (args.sueltos.length) for (const c of pasivo) console.log(`  ${c.rel}:${c.n}  ${c.sel} · ${c.color} ${c.r}:1`);
  process.exit(0);
}
console.log(pasivo.length
  ? `✓ blanco sobre semántico: lo que añade este commit está limpio (${pasivo.length} regla(s) anteriores sin tocar)`
  : '✓ blanco sobre semántico: ninguno en lo que toca este commit');
