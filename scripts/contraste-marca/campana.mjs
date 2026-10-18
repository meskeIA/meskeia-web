#!/usr/bin/env node
/**
 * campana.mjs — la campaña de contraste de marca del cabo C0070, en DOS tandas.
 *
 *   node scripts/contraste-marca/campana.mjs                     simulación de las dos tandas
 *   node scripts/contraste-marca/campana.mjs --tanda 1           simulación de una
 *   node scripts/contraste-marca/campana.mjs --tanda 1 --aplicar escribe la tanda 1
 *   … --json <ruta>   vuelca el detalle completo (todos los hallazgos y lo de aparte)
 *   … --diffs N       cuántos ficheros al azar se enseñan con su diff (3 por defecto)
 *   … --semilla N     fija el azar de esos diffs, para poder repetir la muestra
 *   … --sin-congelados  deja fuera las apps congeladas (los cursos, 16/10/2026): ver abajo
 *   … --raiz <dir>    trabaja sobre otro árbol (lo usa la prueba del candado)
 *
 * QUÉ HACE
 * ────────
 *   Tanda 1 — texto blanco sobre fondo de marca → `var(--primary-boton)` / `var(--secondary-boton)`.
 *   Tanda 2 — la marca como color de texto     → `var(--primary-texto)` / `var(--secondary-texto)`.
 *
 * Los cuatro tokens existen en `app/globals.css` en los dos temas y en los tres portales con
 * marca propia. El criterio de qué es cada cosa NO vive aquí: lo comparte con el candado
 * `scripts/check-contraste-marca.mjs` desde `clasificar.mjs`, para que la campaña y el candado
 * no puedan discrepar.
 *
 * Solo escribe lo `automatico`. Lo que es defecto y no tiene sustituto seguro (un fondo
 * translúcido, un degradado con `--accent`, un texto que en oscuro cambia de color sin
 * cambiar de fondo…) sale en la lista de «no sabe clasificar», para resolverlo a mano.
 *
 * QUÉ NO TOCA
 * ───────────
 *   · El texto pintado en un `<canvas>` (simulador-lentes-opticas, inspector 03/10/2026) ni los
 *     `fill` de SVG: se listan aparte, porque el color no está en un `color:`.
 *   · `var(--hero-bg)`: con blanco encima da 8,33:1.
 *   · Las apps con PALETA PROPIA (redeclaran `--primary` a otro tono): ahí el token global les
 *     cambiaría el color. Se listan con la redeclaración que las delata.
 *   · `app/globals.css`, que es donde viven los tokens.
 *   · Con `--sin-congelados`, las apps de `PREFIJOS_CONGELADOS` (los cursos). La campaña se
 *     decidió el 12/10 para todo el catálogo y los cursos se congelaron el 16/10 («sin trabajo
 *     dedicado», sin drenar su pasivo a11y): qué manda de las dos decisiones lo dice el usuario.
 *
 * DE DÓNDE SALE
 * ─────────────
 * El censo del 12/10/2026 (1.989 reglas de fondo y 5.405 de texto en 891 apps) se hizo con un
 * script en la copia de /reparar que se perdió. El usuario decidió ese día la campaña por
 * script en dos tandas, cada una con su candado. La nota del 14/10 (lupa-digital, blanco sobre
 * `#2E86AB` y `rgba(46,134,171,0.85)` escritos a mano) es la razón de que cuente también los
 * hexadecimales y `rgb()`: un script que solo buscara `var(--primary)` no los veía.
 *
 * ESCRITURA ATÓMICA: cada fichero se escribe en un temporal, se vuelve a analizar (los
 * hallazgos automáticos de la tanda deben desaparecer y el número de bloques no cambiar) y
 * solo entonces se renombra encima del original.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analizarCss, analizarTsx, aplicar, paletaPropia, parsearCss } from './clasificar.mjs';
import { slugsStemum, slugsCoquinum } from '../parsers-catalogo.mjs';
import { prefijosCongelados, esCongelado } from './congelados.mjs';

const arg = (n, def = null) => {
  const i = process.argv.indexOf(n);
  return i === -1 ? def : process.argv[i + 1];
};
const RAIZ = arg('--raiz') ? path.resolve(arg('--raiz')) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SIN_CONGELADOS = process.argv.includes('--sin-congelados');
const CONGELADOS = SIN_CONGELADOS ? prefijosCongelados(RAIZ) : [];
const APLICAR = process.argv.includes('--aplicar');
const TANDA = arg('--tanda') ? Number(arg('--tanda')) : null;
const JSON_SALIDA = arg('--json');
const N_DIFFS = Number(arg('--diffs', 3));
let semilla = Number(arg('--semilla', Date.now() % 100000));

if (APLICAR && ![1, 2].includes(TANDA)) {
  console.error('❌ --aplicar exige --tanda 1 o --tanda 2: las tandas se aplican y se verifican por separado.');
  process.exit(2);
}
if (TANDA !== null && ![1, 2].includes(TANDA)) {
  console.error('❌ --tanda solo admite 1 o 2.');
  process.exit(2);
}

const ARBOLES = ['app', 'components', 'styles'];

function recorrer(dir, acc = []) {
  let entradas;
  try {
    entradas = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entradas) {
    if (['node_modules', '.next', '.git'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p, acc);
    else if (e.name.endsWith('.module.css') || e.name.endsWith('.tsx')) acc.push(p);
  }
  return acc;
}

const rel = (p) => path.relative(RAIZ, p).replace(/\\/g, '/');
/** La app de un fichero: `app/<slug>`; en components/ y styles/, el propio fichero. */
const appDe = (r) => (r.startsWith('app/') ? r.split('/').slice(0, 2).join('/') : r);

// ─── Portales: dónde un cambio de token puede cambiar el TONO, no solo oscurecerlo ───
// En un árbol de prueba sin data/ no hay portales: el recuento de tono sale a cero, sin más.
const leer = (r) => { try { return fs.readFileSync(path.join(RAIZ, r), 'utf8'); } catch { return ''; } };
const portal = new Map();
for (const s of leer('data/stemum.ts') ? slugsStemum(leer('data/stemum.ts')) : []) portal.set(`app/${s}`, 'stemum');
for (const s of leer('data/coquinum.ts') ? slugsCoquinum(leer('data/coquinum.ts')) : []) portal.set(`app/${s}`, 'coquinum');
portal.set('app/visualizador-historia', 'cronicum');

// ─── Recorrido ────────────────────────────────────────────────────────────────
const ficheros = ARBOLES.flatMap((a) => recorrer(path.join(RAIZ, a))).filter((f) => !esCongelado(rel(f), CONGELADOS));
const textoDe = new Map(ficheros.map((f) => [f, fs.readFileSync(f, 'utf8')]));

// Paleta propia y redeclaración local, por app
const paletaPorApp = new Map();
const redeclaraMarca = new Set();
for (const [f, t] of textoDe) {
  const a = appDe(rel(f));
  const ajenas = paletaPropia(t);
  if (ajenas.length) paletaPorApp.set(a, [...(paletaPorApp.get(a) ?? []), ...ajenas.map((x) => `${rel(f)} · ${x}`)]);
  if (/(^|[\s;{])--(primary|secondary)\s*:\s*#/i.test(t.replace(/\/\*[\s\S]*?\*\//g, ' '))) redeclaraMarca.add(a);
}

const porFichero = [];
const aparte = [];
for (const [f, t] of textoDe) {
  const r = rel(f);
  if (r === 'app/globals.css') continue;
  const app = appDe(r);
  const res = f.endsWith('.css') ? analizarCss(t) : analizarTsx(t);
  for (const a of res.aparte) aparte.push({ ...a, fichero: r, app });
  if (!res.hallazgos.length) continue;
  porFichero.push({ fichero: r, ruta: f, app, paleta: paletaPorApp.has(app), hallazgos: res.hallazgos });
}

// ─── Clasificación ────────────────────────────────────────────────────────────
const tandas = TANDA ? [TANDA] : [1, 2];
const resumen = {};
for (const n of tandas) {
  const r = { automaticos: [], manuales: [], firmados: [], paleta: [], ficheros: new Set(), apps: new Set(), ediciones: 0, tono: [] };
  for (const pf of porFichero) {
    for (const h of pf.hallazgos.filter((x) => x.tanda === n)) {
      const item = { fichero: pf.fichero, app: pf.app, ...h };
      if (h.escape === 'firmado') { r.firmados.push(item); continue; }
      if (pf.paleta) { r.paleta.push(item); continue; }
      if (!h.automatico) { if (h.defecto) r.manuales.push(item); continue; }
      r.automaticos.push(item);
      r.ficheros.add(pf.fichero);
      r.apps.add(pf.app);
      r.ediciones += h.ediciones.length;
      // Bajo un portal con marca propia, un literal o una marca redeclarada en local pintaban
      // el azul de meskeIA; el token del portal pintará el del portal.
      const p = portal.get(pf.app);
      if (p && (h.ediciones.some((e) => !e.viejo.startsWith('var(')) || redeclaraMarca.has(pf.app))) r.tono.push({ ...item, portal: p });
    }
  }
  resumen[n] = r;
}

// ─── Informe ──────────────────────────────────────────────────────────────────
const fmt = (x) => new Intl.NumberFormat('es-ES').format(x);
const NOMBRE = { 1: 'TANDA 1 · texto blanco sobre la marca → --*-boton', 2: 'TANDA 2 · la marca como texto → --*-texto' };

console.log(`\nCampaña de contraste de marca (C0070) — ${APLICAR ? 'APLICANDO' : 'simulación'}`);
console.log(`${fmt(ficheros.length)} ficheros barridos en ${ARBOLES.join('/, ')}/ · ${fmt(paletaPorApp.size)} apps o ficheros con paleta propia${SIN_CONGELADOS ? ` · fuera las congeladas (${CONGELADOS.join(', ')})` : ''}\n`);

for (const n of tandas) {
  const r = resumen[n];
  console.log(`── ${NOMBRE[n]}`);
  console.log(`   reglas que migra:      ${fmt(r.automaticos.length)} (${fmt(r.ediciones)} sustituciones) en ${fmt(r.ficheros.size)} ficheros de ${fmt(r.apps.size)} apps`);
  const formas = {};
  for (const h of r.automaticos) for (const e of h.ediciones) {
    const k = e.viejo.startsWith('var(') ? 'var()' : e.viejo.startsWith('#') ? 'hexadecimal' : 'rgb()';
    formas[k] = (formas[k] ?? 0) + 1;
  }
  console.log(`   por forma:             ${Object.entries(formas).map(([k, v]) => `${k} ${fmt(v)}`).join(' · ')}`);
  const tsx = r.automaticos.filter((h) => h.fichero.endsWith('.tsx'));
  console.log(`   en estilo en línea:    ${fmt(tsx.length)} en ${fmt(new Set(tsx.map((h) => h.fichero)).size)} .tsx`);
  console.log(`   cambian de TONO bajo un portal (literal o marca redeclarada): ${fmt(r.tono.length)} reglas en ${fmt(new Set(r.tono.map((h) => h.app)).size)} apps (${[...new Set(r.tono.map((h) => h.portal))].join(', ') || '—'})`);
  console.log(`   firmados (marca-ok):   ${fmt(r.firmados.length)}`);
  console.log(`   en apps con paleta propia, sin tocar: ${fmt(r.paleta.length)}`);
  console.log(`   NO SABE CLASIFICAR (defecto sin sustituto seguro): ${fmt(r.manuales.length)}`);
  const motivos = {};
  for (const h of r.manuales) for (const m of h.motivo.split('; ')) {
    const k = m.replace(/\(#[0-9a-f]+\)|#[0-9a-f]{3,6}|var\([^)]*\)/gi, '…');
    (motivos[k] ??= []).push(h);
  }
  for (const [m, hs] of Object.entries(motivos).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`      · ${fmt(hs.length)} — ${m}`);
    for (const h of hs.slice(0, 3)) console.log(`          ${h.fichero}:${h.linea}  ${h.selector.slice(0, 70)}`);
  }
  console.log('');
}

const aparteTipos = {};
for (const a of aparte) (aparteTipos[a.tipo] ??= []).push(a);
console.log('── APARTE (se cuenta, no se toca)');
for (const [t, as] of Object.entries(aparteTipos).sort((a, b) => b[1].length - a[1].length)) {
  const fs_ = new Set(as.map((a) => a.fichero));
  console.log(`   · ${fmt(as.length)} — ${t} (${fmt(fs_.size)} ficheros)`);
  if (/lienzo/.test(t)) for (const f of [...fs_].slice(0, 20)) console.log(`        ${f}`);
}
console.log('');
if (paletaPorApp.size) {
  console.log('── PALETA PROPIA (sin tocar)');
  for (const [a, xs] of [...paletaPorApp].slice(0, 30)) console.log(`   · ${a}: ${xs[0].split(' · ')[1]}${xs.length > 1 ? ` (+${xs.length - 1})` : ''}`);
  console.log('');
}

// ─── Diffs al azar ────────────────────────────────────────────────────────────
const azar = () => ((semilla = (semilla * 1103515245 + 12345) % 2147483648) / 2147483648);
function diffDe(original, nuevo) {
  const a = original.split('\n');
  const b = nuevo.split('\n');
  const salida = [];
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) salida.push(`   ${String(i + 1).padStart(4)} - ${a[i].trim()}\n          + ${b[i].trim()}`);
  return salida;
}

function edicionesDe(pf, n) {
  return pf.hallazgos.filter((h) => h.tanda === n && h.automatico && h.escape !== 'firmado').flatMap((h) => h.ediciones);
}

for (const n of tandas) {
  const candidatos = porFichero.filter((pf) => !pf.paleta && edicionesDe(pf, n).length);
  const muestra = [];
  const usados = new Set();
  while (muestra.length < Math.min(N_DIFFS, candidatos.length)) {
    const k = Math.floor(azar() * candidatos.length);
    if (usados.has(k)) continue;
    usados.add(k);
    muestra.push(candidatos[k]);
  }
  console.log(`── ${N_DIFFS} DIFFS AL AZAR · tanda ${n}${arg('--semilla') ? '' : ` (repetir con --semilla ${arg('--semilla') ?? '…'})`}`);
  for (const pf of muestra) {
    const t = textoDe.get(pf.ruta);
    const d = diffDe(t, aplicar(t, edicionesDe(pf, n)));
    console.log(`   ${pf.fichero} (${d.length} líneas)`);
    for (const l of d.slice(0, 8)) console.log(l);
    if (d.length > 8) console.log(`          … y ${d.length - 8} más`);
  }
  console.log('');
}

// ─── Aplicar ──────────────────────────────────────────────────────────────────
if (APLICAR) {
  let escritos = 0;
  let sustituciones = 0;
  for (const pf of porFichero) {
    if (pf.paleta) continue;
    const eds = edicionesDe(pf, TANDA);
    if (!eds.length) continue;
    const original = textoDe.get(pf.ruta);
    const nuevo = aplicar(original, eds);
    // Validar antes de renombrar: la tanda queda sin automáticos y la hoja conserva sus bloques
    const re = pf.ruta.endsWith('.css') ? analizarCss(nuevo) : analizarTsx(nuevo);
    const quedan = re.hallazgos.filter((h) => h.tanda === TANDA && h.automatico && h.escape !== 'firmado');
    if (quedan.length) throw new Error(`${pf.fichero}: tras aplicar quedan ${quedan.length} automáticos (L${quedan[0].linea})`);
    if (pf.ruta.endsWith('.css') && parsearCss(nuevo).length !== parsearCss(original).length) {
      throw new Error(`${pf.fichero}: el número de bloques cambió al aplicar`);
    }
    const tmp = `${pf.ruta}.campana-tmp`;
    fs.writeFileSync(tmp, nuevo);
    fs.renameSync(tmp, pf.ruta);
    escritos++;
    sustituciones += eds.length;
  }
  console.log(`✅ Tanda ${TANDA} aplicada: ${fmt(sustituciones)} sustituciones en ${fmt(escritos)} ficheros (esperados: ${fmt(resumen[TANDA].ediciones)} en ${fmt(resumen[TANDA].ficheros.size)}).`);
}

if (JSON_SALIDA) {
  const plano = Object.fromEntries(Object.entries(resumen).map(([k, r]) => [k, {
    automaticos: r.automaticos.map(({ ediciones, ...h }) => ({ ...h, ediciones: ediciones.map((e) => `${e.viejo} → ${e.nuevo}`) })),
    manuales: r.manuales, firmados: r.firmados, paleta: r.paleta, tono: r.tono.map((h) => `${h.fichero}:${h.linea} (${h.portal})`),
  }]));
  fs.writeFileSync(JSON_SALIDA, JSON.stringify({ fecha: new Date().toISOString(), resumen: plano, aparte, paleta: Object.fromEntries(paletaPorApp) }, null, 1));
  console.log(`Detalle completo en ${JSON_SALIDA}`);
}
