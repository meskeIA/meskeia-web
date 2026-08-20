/**
 * Cruce del grafo de co-visita con app-relations.ts (solo lectura).
 *
 * Para cada par de afinidad detectado por covisita.mjs, comprueba si las dos
 * apps ya están enlazadas mutuamente en RelatedApps. Los pares con afinidad
 * real que NO están enlazados son candidatos a cross-link (wins baratos).
 *
 * Uso:  node scripts/covisita-crosscheck.mjs [ruta-covisita-data.json]
 */

import { readFileSync } from 'node:fs';

const JSON_PATH = process.argv[2] || process.env.COVISITA_OUT;
if (!JSON_PATH) {
  console.error('Falta la ruta al JSON de covisita (arg 1 o COVISITA_OUT).');
  process.exit(1);
}

const data = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
const rel = readFileSync('data/app-relations.ts', 'utf8');

// ─────────────────────────────────────────────────────────────
// Parsear app-relations.ts → adyacencia slug -> Set(slugs enlazados)
// Formato: "  'clave': [ { url: '/otro/', ... }, ... ],"
// Las entradas con spread (...arrayPredefinido) no son 100% parseables por
// texto: se marcan para revisión manual.
// ─────────────────────────────────────────────────────────────
const adj = new Map();
const spreadKeys = new Set();
let cur = null;
for (const raw of rel.split('\n')) {
  const km = raw.match(/^ {2}'([^']+)':\s*\[/);
  if (km) {
    cur = km[1];
    if (!adj.has(cur)) adj.set(cur, new Set());
    if (raw.includes('...')) spreadKeys.add(cur);
    const inline = raw.match(/\/([a-z0-9-]+)\//g);
    if (inline) inline.forEach(u => adj.get(cur).add(u.replace(/\//g, '')));
    if (/\],?\s*$/.test(raw)) cur = null; // bloque en una sola línea
    continue;
  }
  if (cur) {
    if (raw.includes('...')) spreadKeys.add(cur);
    const um = raw.match(/url:\s*'\/([a-z0-9-]+)\//);
    if (um) adj.get(cur).add(um[1]);
    if (/^ {2}\],?\s*$/.test(raw)) cur = null; // fin de bloque
  }
}

// ─────────────────────────────────────────────────────────────
// Clasificar y cruzar
// ─────────────────────────────────────────────────────────────
const HUBS = new Set(['stemum', 'coquinum', 'cronicum', 'delegum']);
const esArtefacto = (p) => /[A-Z ]/.test(p.a) || /[A-Z ]/.test(p.b); // nombre visible, no slug
// `meskeIA` NO era la home: hasta el 20/08/2026 era el cubo compartido de /acerca/,
// /contacto/, /mcp/, /privacidad/, /terminos/ y la página de error, así que tratarlo
// como home descartaba pares de covisita por una razón falsa. Desde esa fecha esas
// páginas emiten `pag:<pagina>`; se sigue nombrando `meskeIA` porque el histórico
// crudo lo conserva y este script recorre toda la serie.
const NO_APP = new Set(['home', '/', 'index', 'meskeIA']);
const esHome = (p) => NO_APP.has(p.a) || NO_APP.has(p.b) || p.a.startsWith('pag:') || p.b.startsWith('pag:');
const esPortal = (p) => HUBS.has(p.a) || HUBS.has(p.b);

const tool = [];
const portal = [];
const descartados = [];
for (const p of data.affinity) {
  if (esArtefacto(p) || esHome(p)) descartados.push(p);
  else if (esPortal(p)) portal.push(p);
  else tool.push(p);
}

const estado = (a, b) => {
  const aB = adj.get(a)?.has(b);
  const bA = adj.get(b)?.has(a);
  if (aB && bA) return { txt: '✅ bidireccional', tag: 'ok' };
  if (aB || bA) return { txt: `⚠️  solo ${aB ? `${a}→${b}` : `${b}→${a}`}`, tag: 'media' };
  const sp = spreadKeys.has(a) || spreadKeys.has(b);
  return { txt: sp ? '❓ sin enlace literal (bloque spread — revisar)' : '❌ SIN ENLACE (candidato)', tag: sp ? 'spread' : 'falta' };
};

const linea = '═'.repeat(74);
console.log(linea);
console.log('  CRUCE CO-VISITA × app-relations.ts');
console.log(`  ${data.meta.dias} días · ${data.meta.totalSes} sesiones · ${data.affinity.length} pares de afinidad`);
console.log(linea);

console.log('\n▶ AFINIDAD ENTRE HERRAMIENTAS (lo accionable)\n');
console.log('  lift | co | estado                          | par');
console.log('  -----|----|---------------------------------|----------------------------------');
let faltan = 0;
for (const p of tool.sort((x, y) => y.co - x.co)) {
  const e = estado(p.a, p.b);
  if (e.tag === 'falta') faltan++;
  console.log(`  ${String(p.lift).padStart(4)} | ${String(p.co).padStart(2)} | ${e.txt.padEnd(31)} | ${p.a} ↔ ${p.b}`);
}

console.log('\n▶ NAVEGACIÓN DE PORTAL (stemum/coquinum/cronicum — hub↔subpágina, esperado)\n');
for (const p of portal.sort((x, y) => y.co - x.co)) {
  console.log(`  ${String(p.co).padStart(2)} co ·  ${p.a} ↔ ${p.b}`);
}

console.log('\n▶ DESCARTADOS (artefacto de slug / home)\n');
for (const p of descartados) console.log(`  ${p.a} ↔ ${p.b}`);

console.log('\n' + linea);
console.log(`  RESUMEN: ${tool.length} pares de afinidad-herramienta · ${faltan} SIN enlace (candidatos a cross-link)`);
console.log(linea);
