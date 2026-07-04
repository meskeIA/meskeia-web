/**
 * Qué páginas encuentra/recomienda cada IA — meskeIA (solo lectura)
 *
 * Mide la señal supply-side del foso: qué apps reciben tráfico REAL de cada
 * plataforma IA (clic desde una respuesta de ChatGPT/Copilot, o llamada MCP).
 * Replica EXACTAMENTE el clasificador de origen de lib/analytics-rollup.ts.
 *
 * OJO — qué NO mide:
 *  - Citas de IA SIN clic (el usuario se queda en el chat): esto es un SUELO.
 *  - Crawl de bots (lo que las IAs ingieren): eso va en el bucket 'bot'.
 *
 * Uso:  node scripts/analizar-ia-paginas.mjs
 */

import { createClient } from '@libsql/client';
import { writeFileSync } from 'node:fs';
import { config } from 'dotenv';

config({ path: '.env.local', quiet: true });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Clasificador IA idéntico a lib/analytics-rollup.ts::clasificarOrigenReal
function clasificarIA(modo, datosAd) {
  if (modo === 'mcp') return 'mcp';
  if (modo === 'chatgpt') return 'chatgpt';
  if (modo === 'referral-ia') {
    const ref = (datosAd && datosAd.referrer_ia) || null;
    if (ref === 'chatgpt.com') return 'chatgpt';
    if (ref === 'copilot.microsoft.com') return 'copilot';
    return 'otras-ia';
  }
  return null;
}

const CATS = ['chatgpt', 'copilot', 'otras-ia', 'mcp'];
const linea = '═'.repeat(78);
console.log(linea);
console.log('  QUÉ PÁGINAS ENCUENTRA CADA IA — meskeIA (histórico, tráfico con clic)');
console.log(linea + '\n');

// ── 1. Filas IA (referral-ia + chatgpt legacy + mcp) ──
const iaRes = await client.execute({
  sql: `SELECT aplicacion, modo, datos_adicionales
        FROM uso_aplicaciones
        WHERE modo IN ('mcp', 'chatgpt', 'referral-ia')
          AND (es_propio IS NULL OR es_propio = 0)`,
  args: [],
});

const appIA = new Map();     // app -> {chatgpt, copilot, otras-ia, mcp, total}
const totalCat = { chatgpt: 0, copilot: 0, 'otras-ia': 0, mcp: 0 };
for (const row of iaRes.rows) {
  const app = String(row.aplicacion || '').trim();
  if (!app) continue;
  let datos = null;
  try { if (row.datos_adicionales) datos = JSON.parse(String(row.datos_adicionales)); } catch { /* ignorar */ }
  const cat = clasificarIA(String(row.modo || ''), datos);
  if (!cat) continue;
  if (!appIA.has(app)) appIA.set(app, { chatgpt: 0, copilot: 0, 'otras-ia': 0, mcp: 0, total: 0 });
  const e = appIA.get(app); e[cat]++; e.total++;
  totalCat[cat]++;
}

// ── 2. Tráfico total real por app (contexto: ¿es IA-dependiente?) ──
const realRes = await client.execute({
  sql: `SELECT aplicacion, COUNT(*) c
        FROM uso_aplicaciones
        WHERE (modo IS NULL OR modo != 'bot')
          AND (es_propio IS NULL OR es_propio = 0)
        GROUP BY aplicacion`,
  args: [],
});
const appReal = new Map();
for (const r of realRes.rows) appReal.set(String(r.aplicacion), Number(r.c));

// ── 3. Resumen por plataforma ──
console.log('1. VOLUMEN IA POR PLATAFORMA (con clic a la web)\n');
for (const c of CATS) console.log(`   ${c.padEnd(10)} ${String(totalCat[c]).padStart(5)} visitas`);
const totIA = CATS.reduce((s, c) => s + totalCat[c], 0);
console.log(`   ${'TOTAL'.padEnd(10)} ${String(totIA).padStart(5)} visitas · ${appIA.size} apps distintas`);
console.log('   ⚠️  Volumen bajo: léelo como dirección, no como estadística robusta.');

// ── 4. Top apps por total IA (pivot) ──
const filas = [...appIA.entries()].map(([app, e]) => ({ app, ...e, real: appReal.get(app) || 0 }))
  .sort((a, b) => b.total - a.total);

console.log('\n2. TOP APPS POR TRÁFICO IA (todas las plataformas)\n');
console.log('   tot | GPT | Cop | Otr | MCP | %s/real | app');
console.log('   ----|-----|-----|-----|-----|---------|--------------------------------');
for (const f of filas.slice(0, 30)) {
  const pct = f.real > 0 ? Math.round((f.total / f.real) * 1000) / 10 : 0;
  console.log(
    `   ${String(f.total).padStart(3)} | ${String(f.chatgpt).padStart(3)} | ${String(f.copilot).padStart(3)} | ` +
    `${String(f['otras-ia']).padStart(3)} | ${String(f.mcp).padStart(3)} | ${String(pct).padStart(6)}% | ${f.app.slice(0, 32)}`
  );
}

// ── 5. Líder por plataforma ──
console.log('\n3. TOP 8 POR PLATAFORMA (qué manda tráfico cada IA)\n');
for (const c of CATS) {
  const top = [...appIA.entries()].filter(([, e]) => e[c] > 0).sort((a, b) => b[1][c] - a[1][c]).slice(0, 8);
  if (!top.length) { console.log(`   ${c}: (sin datos)\n`); continue; }
  console.log(`   ▶ ${c.toUpperCase()}`);
  for (const [app, e] of top) console.log(`       ${String(e[c]).padStart(3)} ×  ${app.slice(0, 44)}`);
  console.log('');
}

console.log(linea);
console.log(`  Total apps con tráfico IA: ${appIA.size} de ~1111 · ${totIA} visitas IA con clic (histórico)`);
console.log(linea);

// ── Volcado JSON opcional (para visualización) ──
const OUT = process.env.IA_OUT;
if (OUT) {
  const apps = filas.map(f => ({
    app: f.app, chatgpt: f.chatgpt, copilot: f.copilot, otras: f['otras-ia'], mcp: f.mcp,
    total: f.total, real: f.real, pctIA: f.real > 0 ? Math.round((f.total / f.real) * 1000) / 10 : 0,
  }));
  writeFileSync(OUT, JSON.stringify({ totals: totalCat, totalIA: totIA, nApps: appIA.size, apps }, null, 2));
  console.log(`\n📄 JSON escrito en ${OUT}  (${apps.length} apps)`);
}

await client.close?.();
