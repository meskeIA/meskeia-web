// Devuelve la siguiente tanda de apps a revisar, leyendo REVISION-PROGRESO.md
// (fuente única de verdad: [ ] = pendiente, [x] = ya revisada).
//
// Prioriza por ranking de uso (audit-state.json) mientras queden apps rankeadas
// pendientes; para el resto, recorre REVISION-PROGRESO.md en su orden de archivo
// (agrupado por suite primaria).
//
// Uso: node scripts/audit-pipeline/find-next-batch.mjs [tamañoTanda]
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = join(__dirname, 'audit-state.json');
const PROGRESO_PATH = join(__dirname, '..', '..', 'REVISION-PROGRESO.md');

const state = JSON.parse(readFileSync(STATE_PATH, 'utf-8'));
const batchSize = Number(process.argv[2] || state.batchSize || 4);

const progreso = readFileSync(PROGRESO_PATH, 'utf-8');
const rowRe = /^\| \[( |x)\] \| (.+?) \| `\/([^`/]+)\/` \|/gm;

const pendientes = new Set();
for (const m of progreso.matchAll(rowRe)) {
  if (m[1] === ' ') pendientes.add(m[3]);
}

if (pendientes.size === 0) {
  console.log('¡Todas las apps de REVISION-PROGRESO.md están marcadas como revisadas!');
  process.exit(0);
}

const siguiente = [];

// 1. Prioridad: apps con ranking de uso conocido que sigan pendientes
for (const app of state.ranking || []) {
  if (siguiente.length >= batchSize) break;
  if (pendientes.has(app.slug)) {
    siguiente.push({ slug: app.slug, usos: app.usos, rank: app.rank });
    pendientes.delete(app.slug);
  }
}

// 2. Relleno: siguiente pendiente en orden de archivo (por suite)
if (siguiente.length < batchSize) {
  for (const slug of pendientes) {
    if (siguiente.length >= batchSize) break;
    siguiente.push({ slug, usos: null, rank: null });
  }
}

console.log(`Tanda ${state.lastTanda + 1} — siguientes ${siguiente.length} apps:`);
siguiente.forEach((app) => {
  if (app.rank != null) {
    console.log(`  ${app.slug}  (#${app.rank} ranking, ${app.usos} usos)`);
  } else {
    console.log(`  ${app.slug}  (sin ranking — orden de archivo)`);
  }
});
