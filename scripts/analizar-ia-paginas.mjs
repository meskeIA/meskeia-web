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
// (lista blanca de clientes MCP incluida: al tocar una, tocar la otra)
const MCP_CLIENTES_IA = /^(Claude-User|openai-mcp|MistralAI-MCPClient)/i;
function clasificarIA(modo, datosAd) {
  if (modo === 'mcp') {
    // MCP anónimo (sondeadores/escáneres) no es una IA leyendo páginas: fuera del análisis.
    const ua = (datosAd && typeof datosAd.uaCliente === 'string') ? datosAd.uaCliente : '';
    return MCP_CLIENTES_IA.test(ua) ? 'mcp' : null;
  }
  if (modo === 'chatgpt') {
    // Llamada de un GPT a su Action (app/api/chatgpt/*). Se le exige la MISMA lista blanca
    // que al MCP desde el 14/09/2026: el endpoint es público y el CORS no protege una
    // llamada de servidor a servidor, así que sin UA atribuible no se puede afirmar que
    // haya una IA al otro lado. Hasta esa fecha ninguna route capturaba el user-agent, de
    // modo que todo lo histórico cae aquí y cuenta 0 — irrecuperable, como los 68 registros
    // MCP sin uaCliente. Motivo completo en scripts/digest-diario.mjs (const FOSO).
    const ua = (datosAd && typeof datosAd.uaCliente === 'string') ? datosAd.uaCliente : '';
    return MCP_CLIENTES_IA.test(ua) ? 'chatgpt' : null;
  }
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

// ── 6. EL GATILLO VIGENTE (14/09/2026): ¿el canal SOSTIENE alguna app? ──
//
// Sustituye al criterio de reapertura de ~300 visitas/mes, que se cumplió en septiembre de 2026
// y por tanto dejó de informar. La pregunta de esta etapa ya NO es «¿crece el canal?» —sabemos
// que sí— ni «¿vale más su visitante?»: eso se midió el 14/09 y la respuesta es NO. El visitante
// de IA permanece MENOS que el de buscador (mediana 18 s frente a 26 s, comparando el mismo
// dispositivo) y tampoco explora más — el «3,58 apps frente a 1,83» de la primera lectura era
// sesgo de selección, y al comparar a igual número de visitas la diferencia desaparece.
//
// Lo que hace distinto al foso es a DÓNDE va, no a quién trae: apps de la cola larga que el
// buscador no alimenta. Así que lo que decide la inversión es si ese alcance llega a SOSTENER
// algo. Baseline 14/09/2026: CERO apps sobre 170 candidatas, con el máximo en el 15,8 %
// (cronicum-publicidad) y las dos primeras plazas del podio ocupadas por Cronicum.
//
// ⚠️ Ventana de 90 días, NO el acumulado histórico del resto del informe: el acumulado esconde
//    los vuelcos de composición (gotcha del 06/08, memoria:project_medidor_ia_paginas).
// ⚠️ Y NO es un porcentaje del sitio — eso fue lo que hundió el umbral del 5 % en agosto, con un
//    denominador que crecía más rápido que el foso. Aquí el denominador es CADA app.
const UMBRAL_SOSTIENE = 20; // % del tráfico de una app que ha de venir del canal IA
const MIN_VISITAS_APP = 30; // por debajo, el cociente es ruido y no señal

const sostRes = await client.execute({
  sql: `SELECT aplicacion, modo, datos_adicionales
        FROM uso_aplicaciones
        WHERE created_at > datetime('now','-90 days')
          AND (modo IS NULL OR modo != 'bot')
          AND (es_propio IS NULL OR es_propio = 0)
          AND aplicacion NOT LIKE 'mcp:%' AND aplicacion NOT LIKE 'pag:%'`,
  args: [],
});

// Se clasifica en JS con `clasificarIA`, la MISMA función del resto del informe, en vez de
// replicar la lista blanca dentro del SQL: dos copias del criterio divergen solas.
const porApp = new Map();
for (const row of sostRes.rows) {
  const app = String(row.aplicacion || '').trim();
  if (!app) continue;
  let datos = null;
  try { if (row.datos_adicionales) datos = JSON.parse(String(row.datos_adicionales)); } catch { /* ignorar */ }
  if (!porApp.has(app)) porApp.set(app, { ia: 0, total: 0 });
  const e = porApp.get(app);
  e.total++;
  if (clasificarIA(String(row.modo || ''), datos)) e.ia++;
}

const candidatas = [...porApp.entries()]
  .filter(([, e]) => e.total >= MIN_VISITAS_APP)
  .map(([app, e]) => ({ app, ia: e.ia, total: e.total, cuota: (e.ia * 100) / e.total }))
  .sort((a, b) => b.cuota - a.cuota);
const sostiene = candidatas.filter((c) => c.cuota >= UMBRAL_SOSTIENE);

console.log('\n4. ¿SOSTIENE EL CANAL IA ALGUNA APP? — gatillo vigente (90 d)\n');
console.log(`   Apps con >= ${UMBRAL_SOSTIENE} % de su tráfico desde el canal IA: ${sostiene.length}`);
console.log(`   (sobre ${candidatas.length} apps con al menos ${MIN_VISITAS_APP} visitas en la ventana)\n`);
// El podio se imprime SIEMPRE, dé 0 o dé 10: sin él, un «0» no se puede interpretar —no
// distingue «ninguna llega» de «ninguna se acerca»— y el indicador dejaría de informar.
console.log('   cuota | IA / total | app');
for (const c of candidatas.slice(0, 8)) {
  const marca = c.cuota >= UMBRAL_SOSTIENE ? '  <<<' : '';
  console.log(`   ${c.cuota.toFixed(1).padStart(5)}% | ${String(c.ia).padStart(4)} /${String(c.total).padStart(6)} | ${c.app.slice(0, 40)}${marca}`);
}
console.log(
  '\n   Cómo leerlo: 0 significa que el canal IA todavía no sostiene ninguna app — aporta, pero\n' +
  '   ninguna dependería de él. El día que aparezcan apps aquí, el foso habrá dejado de ser un\n' +
  '   extra para ser adquisición propia, y ESE es el momento de replantear la inversión.\n' +
  '   Baseline 14/09/2026: 0 apps de 170, máximo 15,8 % (cronicum-publicidad).'
);

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
