/**
 * Backfill del rollup de analytics.
 *
 * Puebla las tablas rollup_* con todo el histórico de días cerrados llamando
 * en bucle al endpoint /api/analytics/rollup (fuente única del algoritmo: el
 * core lib/analytics-rollup.ts). Idempotente: re-ejecutable sin daño.
 *
 * Requiere el dev server corriendo:
 *   1) npm run dev   (en otra terminal)
 *   2) node scripts/rollup-backfill.mjs
 *
 * Opcional: node scripts/rollup-backfill.mjs https://meskeia.com   (contra prod)
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Cargar ANALYTICS_SECRET de .env.local
const env = readFileSync(resolve(ROOT, '.env.local'), 'utf8');
let secret = '';
for (const line of env.split('\n')) {
  const m = line.match(/^ANALYTICS_SECRET=(.*)$/);
  if (m) secret = m[1].trim().replace(/^["']|["']$/g, '');
}
if (!secret) {
  console.error('❌ No se encontró ANALYTICS_SECRET en .env.local');
  process.exit(1);
}

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const MAX_POR_LOTE = 60;

console.log(`🔄 Backfill de rollup contra ${BASE}\n`);

let totalProcesados = 0;
let iteracion = 0;

while (true) {
  iteracion++;
  let res;
  try {
    res = await fetch(`${BASE}/api/analytics/rollup?max=${MAX_POR_LOTE}`, {
      headers: { 'x-api-key': secret },
    });
  } catch (e) {
    console.error(`❌ No se pudo conectar a ${BASE}. ¿Está corriendo "npm run dev"?`);
    console.error(`   ${e.message}`);
    process.exit(1);
  }

  if (!res.ok) {
    console.error(`❌ HTTP ${res.status}: ${await res.text()}`);
    process.exit(1);
  }

  const data = await res.json();
  if (data.status !== 'success') {
    console.error(`❌ Error: ${JSON.stringify(data)}`);
    process.exit(1);
  }

  totalProcesados += data.procesados;
  if (data.procesados > 0) {
    console.log(`  Lote ${iteracion}: ${data.procesados} días [${data.desde}–${data.hasta}] en ${data.ms} ms`);
  }

  if (data.procesados === 0 || !data.quedan) {
    break;
  }
}

console.log(`\n✅ Backfill completado: ${totalProcesados} días cerrados agregados.`);
