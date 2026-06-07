/**
 * Verificación de PARIDAD del rollup de analytics.
 *
 * Compara la salida del endpoint tRPC getStats (ruta rollup, sistema completo:
 * tablas rollup_* + ventana viva + helper) contra números de REFERENCIA
 * calculados con queries crudas directas sobre uso_aplicaciones — réplica exacta
 * del getStats original. Si no coinciden, NO desplegar.
 *
 * Requiere dev server corriendo y el backfill ya ejecutado:
 *   1) npm run dev
 *   2) node scripts/rollup-backfill.mjs
 *   3) node scripts/rollup-verify.mjs
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
const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');

let fallos = 0;
const ok = (n) => console.log(`  ✅ ${n}`);
const fail = (n, ref, got) => { console.log(`  ❌ ${n}: referencia=${ref}  rollup=${got}`); fallos++; };
const cmp = (n, ref, got, tol = 0) => { (Math.abs(Number(ref) - Number(got)) <= tol) ? ok(`${n} (${got})`) : fail(n, ref, got); };

async function llamarGetStats(excluir) {
  // tRPC SIN superjson: input plano y respuesta en result.data (sin .json)
  const input = encodeURIComponent(JSON.stringify({ '0': { limite: 500, excluir_mi_ip: excluir } }));
  const res = await fetch(`${BASE}/api/trpc/analytics.getStats?batch=1&input=${input}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return j[0].result.data;
}

// fecha_ord helpers
const ordExpr = `substr(timestamp,7,4)||substr(timestamp,4,2)||substr(timestamp,1,2)`;
const ord = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

async function verificarModo(excluir) {
  console.log(`\n═══ Modo excluir_mi_ip = ${excluir} ═══`);

  // IP excluida configurada
  const cfg = await client.execute(`SELECT valor FROM analytics_config WHERE clave='ip_excluida'`);
  const ipExcluida = excluir && cfg.rows.length ? String(cfg.rows[0].valor) : '';
  const ipF = ipExcluida ? ` AND (ip_address IS NULL OR ip_address != '${ipExcluida.replace(/'/g, "''")}')` : '';

  const rollup = await llamarGetStats(excluir);

  // ── Globales ──
  const s = (await client.execute(`
    SELECT COUNT(*) total, COUNT(DISTINCT aplicacion) apps,
      AVG(CASE WHEN duracion_segundos IS NOT NULL THEN duracion_segundos END) dur,
      SUM(CASE WHEN tipo_dispositivo='movil' THEN 1 ELSE 0 END) movil,
      SUM(CASE WHEN tipo_dispositivo='escritorio' THEN 1 ELSE 0 END) escritorio,
      SUM(CASE WHEN es_recurrente=1 THEN 1 ELSE 0 END) rec,
      SUM(CASE WHEN es_recurrente=0 THEN 1 ELSE 0 END) nue
    FROM uso_aplicaciones WHERE 1=1${ipF}`)).rows[0];

  cmp('total_usos', s.total, rollup.estadisticas.total_usos);
  cmp('total_aplicaciones', s.apps, rollup.estadisticas.total_aplicaciones);
  cmp('duracion_promedio_seg', Math.round((Number(s.dur) || 0) * 10) / 10, rollup.estadisticas.duracion_promedio_segundos, 0.2);
  cmp('movil', s.movil, rollup.estadisticas.dispositivos.movil.total);
  cmp('escritorio', s.escritorio, rollup.estadisticas.dispositivos.escritorio.total);
  cmp('recurrentes', s.rec, rollup.estadisticas.usuarios.recurrentes.total);
  cmp('nuevos', s.nue, rollup.estadisticas.usuarios.nuevos.total);

  const sh = (await client.execute(`SELECT COUNT(*) t FROM uso_aplicaciones WHERE datos_adicionales LIKE '%"ref":"share"%'${ipF}`)).rows[0];
  cmp('por_compartir', sh.t, rollup.estadisticas.por_compartir);

  // ── Ranking (por app) ──
  const rk = await client.execute(`
    SELECT aplicacion, COUNT(*) usos,
      AVG(CASE WHEN duracion_segundos IS NOT NULL AND duracion_segundos<=7200 THEN duracion_segundos END) dur
    FROM uso_aplicaciones WHERE 1=1${ipF} GROUP BY aplicacion`);
  const refRank = new Map();
  for (const r of rk.rows) refRank.set(String(r.aplicacion), { usos: Number(r.usos), dur: Number(r.dur) || 0 });
  const gotRank = new Map();
  for (const a of rollup.ranking_aplicaciones) gotRank.set(a.aplicacion, { usos: a.total_usos, dur: a.duracion_promedio_segundos });

  let rankFails = 0;
  if (refRank.size !== gotRank.size) { fail('ranking nº apps', refRank.size, gotRank.size); }
  for (const [app, ref] of refRank) {
    const got = gotRank.get(app);
    if (!got) { rankFails++; if (rankFails <= 5) console.log(`  ❌ ranking falta app: ${app}`); continue; }
    if (ref.usos !== got.usos) { rankFails++; if (rankFails <= 5) console.log(`  ❌ ranking ${app} usos: ${ref.usos} vs ${got.usos}`); }
    else if (Math.abs(ref.dur - got.dur) > 0.5) { rankFails++; if (rankFails <= 5) console.log(`  ❌ ranking ${app} dur: ${ref.dur} vs ${got.dur}`); }
  }
  if (rankFails === 0) ok(`ranking (${gotRank.size} apps, usos+duración)`); else { fallos++; console.log(`  ❌ ranking: ${rankFails} discrepancias`); }

  // ── Países (top por clave) ── referencia normalizada (Spain→ES, etc.) como el getStats original
  const NORM = { Spain: 'ES', 'United States': 'US', Mexico: 'MX', Argentina: 'AR', Colombia: 'CO', Bolivia: 'BO', Ecuador: 'EC', Chile: 'CL', Peru: 'PE', Venezuela: 'VE', Guatemala: 'GT', 'Costa Rica': 'CR', Honduras: 'HN', 'El Salvador': 'SV', Nicaragua: 'NI', Panama: 'PA', Cuba: 'CU', 'Dominican Republic': 'DO', 'Puerto Rico': 'PR', Uruguay: 'UY', Paraguay: 'PY', Brazil: 'BR', Portugal: 'PT', France: 'FR', Germany: 'DE', 'United Kingdom': 'GB', Italy: 'IT', Netherlands: 'NL', Belgium: 'BE', Switzerland: 'CH', Sweden: 'SE', Norway: 'NO', Denmark: 'DK', Finland: 'FI', Poland: 'PL', Russia: 'RU', Turkey: 'TR', Canada: 'CA', Australia: 'AU', Japan: 'JP', China: 'CN', India: 'IN', 'South Korea': 'KR' };
  const gotPais = new Map(rollup.estadisticas.geografia.paises.map((p) => [p.pais, Number(p.total)]));
  const refPaisRows = (await client.execute(`SELECT pais, COUNT(*) t FROM uso_aplicaciones WHERE pais IS NOT NULL AND pais != ''${ipF} GROUP BY pais`)).rows;
  const refPais = new Map();
  for (const r of refPaisRows) { const k = NORM[String(r.pais)] ?? String(r.pais); refPais.set(k, (refPais.get(k) || 0) + Number(r.t)); }
  let paisFails = 0;
  for (const [pais, total] of gotPais) {
    if (refPais.get(pais) !== total) { paisFails++; if (paisFails <= 5) console.log(`  ❌ país ${pais}: ref=${refPais.get(pais)} rollup=${total}`); }
  }
  if (paisFails === 0) ok(`países top (${gotPais.size}, normalizados)`); else fallos++;

  // ── Comparativa temporal (usos) ──
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
  const anteayer = new Date(hoy); anteayer.setDate(hoy.getDate() - 2);
  const hace7 = new Date(hoy); hace7.setDate(hoy.getDate() - 7);
  const hace14 = new Date(hoy); hace14.setDate(hoy.getDate() - 14);
  const iMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const iMesAnt = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const fMesAnt = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

  const contar = async (d1, d2) => Number((await client.execute({
    sql: `SELECT COUNT(*) t FROM uso_aplicaciones WHERE ${ordExpr} >= ? AND ${ordExpr} <= ?${ipF}`,
    args: [ord(d1), ord(d2)],
  })).rows[0].t);

  cmp('comparativa.hoy.usos', await contar(hoy, hoy), rollup.comparativa.hoy.usos);
  cmp('comparativa.ayer.usos', await contar(ayer, ayer), rollup.comparativa.ayer.usos);
  cmp('comparativa.semana.usos', await contar(hace7, hoy), rollup.comparativa.semana.usos);
  cmp('comparativa.mes.usos', await contar(iMes, hoy), rollup.comparativa.mes.usos);
  cmp('detalles.anteayer', await contar(anteayer, anteayer), rollup.comparativa.detalles.anteayer);
  cmp('detalles.semanaAnterior', await contar(hace14, hace7), rollup.comparativa.detalles.semanaAnterior);
  cmp('detalles.mesAnterior', await contar(iMesAnt, fMesAnt), rollup.comparativa.detalles.mesAnterior);

  // apps_distintas
  const contarApps = async (d1, d2) => Number((await client.execute({
    sql: `SELECT COUNT(DISTINCT aplicacion) t FROM uso_aplicaciones WHERE ${ordExpr} >= ? AND ${ordExpr} <= ?${ipF}`,
    args: [ord(d1), ord(d2)],
  })).rows[0].t);
  cmp('apps_distintas.semana', await contarApps(hace7, hoy), rollup.comparativa.semana.apps_distintas);
  cmp('apps_distintas.mes', await contarApps(iMes, hoy), rollup.comparativa.mes.apps_distintas);
}

console.log('🔍 Verificación de paridad del rollup\n');
await verificarModo(true);
await verificarModo(false);

console.log(`\n${fallos === 0 ? '✅ PARIDAD TOTAL — seguro desplegar' : `❌ ${fallos} discrepancias — NO desplegar`}`);
process.exit(fallos === 0 ? 0 : 1);
