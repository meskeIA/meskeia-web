// Devuelve la siguiente tanda de apps a auditar: las primeras N (batchSize)
// del ranking que NO estén ya en "audited" dentro de audit-state.json.
//
// Uso: node scripts/audit-pipeline/find-next-batch.mjs [tamañoTanda]
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = join(__dirname, 'audit-state.json');

const state = JSON.parse(readFileSync(STATE_PATH, 'utf-8'));
const batchSize = Number(process.argv[2] || state.batchSize || 4);

if (!state.ranking || state.ranking.length === 0) {
  console.error('ERROR: "ranking" está vacío. Ejecuta primero extract-ranking.mjs.');
  process.exit(1);
}

const auditedSlugs = new Set(state.audited.map((a) => a.slug));

const siguiente = state.ranking
  .filter((app) => !auditedSlugs.has(app.slug))
  .slice(0, batchSize);

if (siguiente.length === 0) {
  console.log('No quedan apps pendientes en el ranking extraído.');
} else {
  console.log(`Tanda ${state.lastTanda + 1} — siguientes ${siguiente.length} apps:`);
  siguiente.forEach((app) => {
    console.log(`  #${app.rank}  ${app.slug}  (${app.usos} usos)`);
  });
}
