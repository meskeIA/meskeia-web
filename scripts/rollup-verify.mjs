/**
 * Verificación de PARIDAD del rollup de analytics (modelo unificado).
 *
 * Compara la salida de los endpoints tRPC (vía rollup) contra números de
 * REFERENCIA calculados con queries crudas que aplican el MISMO modelo:
 *   - Visita propia = es_propio=1 OR ip=IP_actual
 *   - U1 "tráfico real" = todo excepto bot y propio (conteos)
 *   - U2 "con página" = U1 excepto mcp (duración/buckets)
 *   - Cap único de duración = 1.800s
 *
 * Requiere dev server + rollup recomputado (?rebuild=1):
 *   1) npm run dev   2) GET /api/analytics/rollup?rebuild=1&max=400 (x-api-key)
 *   3) node scripts/rollup-verify.mjs http://localhost:3050
 */

import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const env = readFileSync(resolve(ROOT, '.env.local'), 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const BASE = (process.argv[2] || 'http://localhost:3050').replace(/\/$/, '');
const CAP = 1800;

let fallos = 0;
const ok = (n) => console.log(`  ✅ ${n}`);
const fail = (n, ref, got) => { console.log(`  ❌ ${n}: referencia=${ref}  rollup=${got}`); fallos++; };
const cmp = (n, ref, got, tol = 0) => { (Math.abs(Number(ref) - Number(got)) <= tol) ? ok(`${n} (${got})`) : fail(n, ref, got); };

async function trpc(proc, payload) {
  const input = encodeURIComponent(JSON.stringify({ '0': payload }));
  // Los procedures del dashboard son protectedProcedure: requieren la clave
  const res = await fetch(`${BASE}/api/trpc/analytics.${proc}?batch=1&input=${input}`, {
    headers: { 'x-analytics-key': process.env.ANALYTICS_SECRET || '' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return (await res.json())[0].result.data;
}

const ordExpr = `substr(timestamp,7,4)||substr(timestamp,4,2)||substr(timestamp,1,2)`;
const ord = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

let IPX = '';
const NORM = { Spain: 'ES', 'United States': 'US', Mexico: 'MX', Argentina: 'AR', Colombia: 'CO', Bolivia: 'BO', Ecuador: 'EC', Chile: 'CL', Peru: 'PE', Venezuela: 'VE', Guatemala: 'GT', 'Costa Rica': 'CR', Honduras: 'HN', 'El Salvador': 'SV', Nicaragua: 'NI', Panama: 'PA', Cuba: 'CU', 'Dominican Republic': 'DO', 'Puerto Rico': 'PR', Uruguay: 'UY', Paraguay: 'PY', Brazil: 'BR', Portugal: 'PT', France: 'FR', Germany: 'DE', 'United Kingdom': 'GB', Italy: 'IT', Netherlands: 'NL', Belgium: 'BE', Switzerland: 'CH', Sweden: 'SE', Norway: 'NO', Denmark: 'DK', Finland: 'FI', Poland: 'PL', Russia: 'RU', Turkey: 'TR', Canada: 'CA', Australia: 'AU', Japan: 'JP', China: 'CN', India: 'IN', 'South Korea': 'KR' };

// Filtros SQL del modelo. NO simplificar por "bot∩propio=0": era cierto cuando se
// escribió esto y dejó de serlo (ver whereU1). Una simplificación apoyada en los datos
// de un día caduca en silencio; la condición completa no.
// "no propio" maneja NULL como el código real: NOT(0 OR NULL)=NULL excluiría mal
// las filas con ip NULL, por eso se escribe con IS NULL explícito.
const noPropio = () => `(es_propio IS NULL OR es_propio=0) AND (ip_address IS NULL OR ip_address!='${IPX.replace(/'/g, "''")}')`;
// MCP anónimo = bot desde el 30/07/2026 (ver clasificarOrigenReal más abajo y el mismo
// criterio en lib/analytics-rollup.ts). La referencia se calcula en SQL sobre la columna
// `modo` CRUDA, que sigue diciendo 'mcp' —la reclasificación es de la capa derivada, a
// propósito, para no destruir el dato—, así que hay que replicar aquí la lista blanca o
// la referencia cuenta filas que el rollup ya no cuenta. Sin esto salían 20 descuadres
// falsos, todos de esta única causa.
const MCP_ANON =
  `(modo='mcp' AND NOT (` +
  ['Claude-User', 'openai-mcp', 'MistralAI-MCPClient']
    .map(c => `COALESCE(json_extract(datos_adicionales,'$.uaCliente'),'') LIKE '${c}%'`)
    .join(' OR ') +
  `))`;

// IA · lectura y crawlers: mismo caso que el MCP anónimo. La reclasificación vive en la
// capa derivada y la columna `modo` CRUDA sigue diciendo 'web' en los registros
// históricos (la ingesta solo marca los nuevos), así que hay que replicar aquí el
// criterio de clasificarOrigenReal o la referencia cuenta filas que el rollup ya no.
// Medido el 10/08/2026: sin la parte de crawlers salían 579 descuadres falsos en U2
// (bingbot 253 + Googlebot 189 + Google-InspectionTool 132 + Bytespider/Baiduspider/
// meta-externalagent 5), todos con modo<>'bot' porque son anteriores al filtro de la
// ingesta o llegaron con un UA de cliente distinto del de transporte.
const ES_IA_LECTURA = `COALESCE(navegador,'') LIKE '%NotebookLM%'`;
const NO_IA_LECTURA = `NOT (${ES_IA_LECTURA})`;
const ES_CRAWLER = '(' + [
  'bingbot', 'Googlebot', 'Google-InspectionTool', 'AdsBot-Google', 'Slurp', 'DuckDuckBot',
  'Baiduspider', 'YandexBot', 'Bytespider', 'PetalBot', 'AhrefsBot', 'SemrushBot', 'MJ12bot',
  'DotBot', 'facebookexternalhit', 'meta-externalagent', 'Applebot', 'Amazonbot', 'GPTBot',
  'OAI-SearchBot', 'ClaudeBot', 'anthropic-ai', 'PerplexityBot', 'Diffbot', 'Screaming Frog',
].map(p => `COALESCE(navegador,'') LIKE '%${p}%'`).join(' OR ') + ')';

// origenReal==='bot', en el MISMO orden de precedencia que clasificarOrigenReal:
// ia-lectura gana a bot, así que una fila de lectura NUNCA es bot.
const ES_BOT = `(${NO_IA_LECTURA} AND (modo='bot' OR ${ES_CRAWLER} OR ${MCP_ANON}))`;
// Negación EXACTA de noPropio() (no basta con es_propio=1: la IP también decide).
const esPropio = () => `(es_propio=1 OR ip_address='${IPX.replace(/'/g, "''")}')`;

// Universo U1. Ojo con excluir=false: la cabecera de este fichero daba por verificado
// que bot∩propio=0 y por eso simplificaba a "no es bot". Esa suposición se rompió —hay
// 3 filas mcp:convertir_unidades lanzadas con curl desde la IP propia—, y como
// agregarRegistros solo descarta bots NO propios, el rollup las cuenta en el universo
// sin exclusión y la referencia simplificada no. De ahí 4 descuadres de exactamente 3.
const whereU1 = (excluir) => excluir
  ? `NOT ${ES_BOT} AND ${NO_IA_LECTURA} AND ${noPropio()}`
  : `(NOT ${ES_BOT} OR ${esPropio()}) AND ${NO_IA_LECTURA}`;
// Universo U2 (visita con página): además fuera mcp, que no tiene página.
// SIN la excepción de bots propios que sí lleva U1, y no por descuido: los buckets de
// duración se saltan en agregarRegistros por `U2_SET.has(origenReal)`, no por el
// `continue` que solo descarta bots no-propios. Un bot propio suma en g.usos pero nunca
// en b_*, así que aquí la condición es la misma con o sin exclusión.
const whereU2 = (excluir) =>
  `NOT ${ES_BOT} AND ${NO_IA_LECTURA} AND (modo IS NULL OR modo!='mcp')${excluir ? ` AND ${noPropio()}` : ''}`;
const num = async (sql) => Number((await client.execute(sql)).rows[0].n);

// Réplica EXACTA de lib/analytics-rollup.ts::clasificarOrigenReal. Si divergen, este
// verificador reporta descuadres que no existen. Al tocar una, tocar la otra.
const MCP_CLIENTES_IA = /^(Claude-User|openai-mcp|MistralAI-MCPClient)/i;
const AGENTES_IA_LECTURA = /NotebookLM/i;
const CRAWLERS_UA =
  /bingbot|Googlebot|Google-InspectionTool|AdsBot-Google|Slurp|DuckDuckBot|Baiduspider|YandexBot|Bytespider|PetalBot|AhrefsBot|SemrushBot|MJ12bot|DotBot|facebookexternalhit|meta-externalagent|Applebot|Amazonbot|GPTBot|OAI-SearchBot|ClaudeBot|anthropic-ai|PerplexityBot|Diffbot|Screaming Frog/i;
function clasificarOrigenReal(modo, datosAd, navegador = null) {
  if (navegador && AGENTES_IA_LECTURA.test(navegador)) return 'ia-lectura';
  if (modo === 'bot') return 'bot';
  if (navegador && CRAWLERS_UA.test(navegador)) return 'bot';
  if (modo === 'mcp') {
    // Lista blanca: MCP anónimo (sondeadores/escáneres) cuenta como bot, no como IA.
    const ua = typeof datosAd?.uaCliente === 'string' ? datosAd.uaCliente : '';
    return MCP_CLIENTES_IA.test(ua) ? 'mcp' : 'bot';
  }
  if (modo === 'chatgpt') return 'chatgpt';
  const ref = datosAd?.referrer_ia ?? null;
  if (modo === 'referral-ia') return ref === 'chatgpt.com' ? 'chatgpt' : ref === 'copilot.microsoft.com' ? 'copilot' : 'otras-ia';
  if (modo === 'pwa') return 'pwa';
  if (modo === 'referral-social') return 'redes';
  return 'web';
}

async function verificarStats(excluir) {
  console.log(`\n═══ getStats (excluir=${excluir}) ═══`);
  const w = whereU1(excluir);
  const got = await trpc('getStats', { limite: 500, excluir_mi_ip: excluir });

  cmp('total_usos', await num(`SELECT COUNT(*) n FROM uso_aplicaciones WHERE ${w}`), got.estadisticas.total_usos);
  cmp('total_aplicaciones', await num(`SELECT COUNT(DISTINCT aplicacion) n FROM uso_aplicaciones WHERE ${w}`), got.estadisticas.total_aplicaciones);
  const dur = (await client.execute(`SELECT AVG(CASE WHEN duracion_segundos IS NOT NULL THEN MIN(duracion_segundos,${CAP}) END) d FROM uso_aplicaciones WHERE ${w}`)).rows[0].d;
  cmp('duracion_promedio (cap1800)', Math.round((Number(dur) || 0) * 10) / 10, got.estadisticas.duracion_promedio_segundos, 0.2);
  cmp('movil', await num(`SELECT COUNT(*) n FROM uso_aplicaciones WHERE ${w} AND tipo_dispositivo='movil'`), got.estadisticas.dispositivos.movil.total);
  cmp('escritorio', await num(`SELECT COUNT(*) n FROM uso_aplicaciones WHERE ${w} AND tipo_dispositivo='escritorio'`), got.estadisticas.dispositivos.escritorio.total);
  cmp('recurrentes', await num(`SELECT COUNT(*) n FROM uso_aplicaciones WHERE ${w} AND es_recurrente=1`), got.estadisticas.usuarios.recurrentes.total);
  cmp('por_compartir', await num(`SELECT COUNT(*) n FROM uso_aplicaciones WHERE ${w} AND datos_adicionales LIKE '%"ref":"share"%'`), got.estadisticas.por_compartir);

  // Ranking por app (usos + duración media cap1800)
  const rk = await client.execute(`SELECT aplicacion, COUNT(*) usos, AVG(CASE WHEN duracion_segundos IS NOT NULL THEN MIN(duracion_segundos,${CAP}) END) dur FROM uso_aplicaciones WHERE ${w} GROUP BY aplicacion`);
  const refRank = new Map(rk.rows.map(r => [String(r.aplicacion), { usos: Number(r.usos), dur: Number(r.dur) || 0 }]));
  const gotRank = new Map(got.ranking_aplicaciones.map(a => [a.aplicacion, { usos: a.total_usos, dur: a.duracion_promedio_segundos }]));
  let rf = 0;
  if (refRank.size !== gotRank.size) fail('ranking nº apps', refRank.size, gotRank.size);
  for (const [app, ref] of refRank) {
    const g = gotRank.get(app);
    if (!g || ref.usos !== g.usos || Math.abs(ref.dur - g.dur) > 0.5) { rf++; if (rf <= 4) console.log(`  ❌ ranking ${app}: ref=${JSON.stringify(ref)} got=${JSON.stringify(g)}`); }
  }
  rf === 0 ? ok(`ranking (${gotRank.size} apps)`) : fallos++;

  // Comparativa (usos por período). Ventanas SIN solape (2026-07-14):
  // semana = [hoy-6, hoy] y semana anterior = [hoy-13, hoy-7], 7 días cada una.
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
  const ante = new Date(hoy); ante.setDate(hoy.getDate() - 2);
  const h6 = new Date(hoy); h6.setDate(hoy.getDate() - 6);
  const h7 = new Date(hoy); h7.setDate(hoy.getDate() - 7);
  const h13 = new Date(hoy); h13.setDate(hoy.getDate() - 13);
  const iMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const iMesA = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const fMesA = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
  const cont = async (a, b) => num(`SELECT COUNT(*) n FROM uso_aplicaciones WHERE ${ordExpr}>='${ord(a)}' AND ${ordExpr}<='${ord(b)}' AND ${w}`);
  cmp('comp.hoy', await cont(hoy, hoy), got.comparativa.hoy.usos);
  cmp('comp.semana', await cont(h6, hoy), got.comparativa.semana.usos);
  cmp('comp.mes', await cont(iMes, hoy), got.comparativa.mes.usos);
  cmp('comp.detalles.anteayer', await cont(ante, ante), got.comparativa.detalles.anteayer);
  cmp('comp.detalles.semAnt', await cont(h13, h7), got.comparativa.detalles.semanaAnterior);
  cmp('comp.detalles.mesAnt', await cont(iMesA, fMesA), got.comparativa.detalles.mesAnterior);

  // Ranking usos_30d: ventana [hoy-29, hoy]
  const h29 = new Date(hoy); h29.setDate(hoy.getDate() - 29);
  const rk30 = await client.execute(`SELECT aplicacion, COUNT(*) usos FROM uso_aplicaciones WHERE ${ordExpr}>='${ord(h29)}' AND ${w} GROUP BY aplicacion`);
  const ref30 = new Map(rk30.rows.map(r => [String(r.aplicacion), Number(r.usos)]));
  let rf30 = 0;
  for (const a of got.ranking_aplicaciones) {
    const ref = ref30.get(a.aplicacion) || 0;
    if (ref !== a.usos_30d) { rf30++; if (rf30 <= 4) console.log(`  ❌ usos_30d ${a.aplicacion}: ref=${ref} got=${a.usos_30d}`); }
  }
  rf30 === 0 ? ok('ranking usos_30d') : fallos++;
}

async function verificarResumen() {
  console.log(`\n═══ getResumen (origen × período) ═══`);
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
  const h7 = new Date(hoy); h7.setDate(hoy.getDate() - 6); // "7 días" = [hoy-6, hoy]
  const iMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const parse = (ts) => { const m = String(ts).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null; };
  const rows = (await client.execute(`SELECT timestamp, modo, datos_adicionales, ip_address, es_propio, navegador FROM uso_aplicaciones`)).rows;
  const ref = {}; const nf = () => ({ hoy: 0, ayer: 0, semana: 0, mes: 0, total: 0 });
  for (const r of rows) {
    const f = parse(r.timestamp); if (!f) continue;
    let dAd = null; try { if (r.datos_adicionales) dAd = JSON.parse(String(r.datos_adicionales)); } catch {}
    const propio = Number(r.es_propio) === 1 || String(r.ip_address || '') === IPX;
    const oReal = clasificarOrigenReal(
      String(r.modo || 'web'), dAd, r.navegador == null ? null : String(r.navegador)
    );
    const o = propio ? 'propio' : oReal;
    if (!ref[o]) ref[o] = nf();
    const c = ref[o];
    if (f >= hoy) c.hoy++; if (f >= ayer && f < hoy) c.ayer++;
    if (f >= h7) c.semana++; if (f >= iMes) c.mes++; c.total++;
  }
  const tr = nf();
  // TOTAL REAL excluye bot, propio e ia-lectura (esta última desde el 10/08/2026:
  // un agente que se lleva el texto no es una visita). Mismo Set que excluirDeTotalReal
  // en server/routers/analytics.ts.
  const FUERA_TOTAL_REAL = new Set(['bot', 'propio', 'ia-lectura']);
  for (const [k, v] of Object.entries(ref)) if (!FUERA_TOTAL_REAL.has(k)) for (const p of ['hoy', 'ayer', 'semana', 'mes', 'total']) tr[p] += v[p];

  const got = await trpc('getResumen', {});
  for (const p of ['hoy', 'ayer', 'semana', 'mes', 'total']) cmp(`totalReal.${p}`, tr[p], got.totalReal[p]);
  cmp('suma filas total', Object.values(ref).reduce((a, v) => a + v.total, 0), got.filas.reduce((a, f) => a + f.total, 0));
  cmp('fila Web', ref['web']?.total || 0, got.filas.find(f => f.origen === 'Web')?.total || 0);
  cmp('fila Propio', ref['propio']?.total || 0, got.filas.find(f => f.origen === 'Propio')?.total || 0);
  cmp('fila MCP', ref['mcp']?.total || 0, got.filas.find(f => f.origen === 'IA / MCP')?.total || 0);
  cmp('fila PWA', ref['pwa']?.total || 0, got.filas.find(f => f.origen.includes('PWA'))?.total || 0);
}

async function verificarTendencia(excluir) {
  console.log(`\n═══ getTendencia30Dias (excluir=${excluir}) ═══`);
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const inicio = new Date(hoy); inicio.setDate(hoy.getDate() - 29);
  const ref = await num(`SELECT COUNT(*) n FROM uso_aplicaciones WHERE ${ordExpr}>='${ord(inicio)}' AND ${whereU1(excluir)}`);
  const got = await trpc('getTendencia30Dias', { excluir_mi_ip: excluir });
  cmp('suma 30 días', ref, got.dias.reduce((a, d) => a + d.usos, 0));
  cmp('nº días', 30, got.dias.length);
}

async function verificarDistribucion(excluir) {
  console.log(`\n═══ getDistribucionDuraciones (excluir=${excluir}) ═══`);
  // Ventana 30d desde 2026-08-20 (antes: histórico completo, que ya no se movía).
  // topPorDuracion retirado el mismo día (índice compuesto irreconstruible a ojo).
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const inicio = new Date(hoy); inicio.setDate(hoy.getDate() - 29);
  const w = `${whereU2(excluir)} AND ${ordExpr}>='${ord(inicio)}'`;
  const r = (await client.execute(`SELECT
    COUNT(*) total,
    COUNT(CASE WHEN duracion_segundos IS NULL THEN 1 END) sr,
    COUNT(CASE WHEN duracion_segundos IS NOT NULL AND duracion_segundos<=30 THEN 1 END) rb,
    COUNT(CASE WHEN duracion_segundos>30 AND duracion_segundos<=120 THEN 1 END) co,
    COUNT(CASE WHEN duracion_segundos>120 AND duracion_segundos<=600 THEN 1 END) me,
    COUNT(CASE WHEN duracion_segundos>600 THEN 1 END) la
    FROM uso_aplicaciones WHERE ${w}`)).rows[0];
  const got = await trpc('getDistribucionDuraciones', { excluir_mi_ip: excluir });
  cmp('total U2 (30d)', r.total, got.total);
  cmp('bucket sin registro', r.sr, got.buckets[0].valor);
  cmp('bucket 2-30s', r.rb, got.buckets[1].valor);
  cmp('bucket 30s-2min', r.co, got.buckets[2].valor);
  cmp('bucket 2-10min', r.me, got.buckets[3].valor);
  cmp('bucket >10min', r.la, got.buckets[4].valor);
  // cobertura = % con duración registrada (redondeo a 1 decimal, tolerancia 0,1)
  const cobRef = Number(r.total) > 0 ? Math.round((Number(r.total) - Number(r.sr)) / Number(r.total) * 1000) / 10 : 0;
  cmp('cobertura del dato', cobRef, got.cobertura, 0.1);
}

console.log('🔍 Verificación de paridad — modelo unificado\n');
IPX = String((await client.execute(`SELECT valor FROM analytics_config WHERE clave='ip_excluida'`)).rows[0]?.valor || '');
console.log(`IP propietario: ${IPX}`);
await verificarStats(true);
await verificarStats(false);
await verificarResumen();
await verificarTendencia(true);
await verificarTendencia(false);
await verificarDistribucion(true);
await verificarDistribucion(false);

console.log(`\n${fallos === 0 ? '✅ PARIDAD TOTAL — seguro desplegar' : `❌ ${fallos} discrepancias — NO desplegar`}`);
process.exit(fallos === 0 ? 0 : 1);
