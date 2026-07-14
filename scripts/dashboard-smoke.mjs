/**
 * Smoke test funcional del dashboard de analytics.
 * Complementa a rollup-verify.mjs (paridad numérica): aquí se valida
 * autenticación, shape de las respuestas y coherencia básica.
 *
 * Uso: npm run start  →  node scripts/dashboard-smoke.mjs [http://localhost:3050]
 *
 * Prueba funcional de los endpoints tRPC del dashboard de analytics
 * contra el servidor local de producción (npm run start, puerto 3050).
 * Valida: autenticación, shape de las respuestas y coherencia de los números.
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const env = readFileSync(resolve(ROOT, '.env.local'), 'utf8');
const SECRET = env.match(/^ANALYTICS_SECRET=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '');
if (!SECRET) { console.error('❌ ANALYTICS_SECRET no encontrada en .env.local'); process.exit(1); }

const BASE = (process.argv[2] || 'http://localhost:3050').replace(/\/$/, '');
let fallos = 0;
const ok = (msg) => console.log(`  ✅ ${msg}`);
const fail = (msg) => { console.log(`  ❌ ${msg}`); fallos++; };
const check = (cond, msg) => (cond ? ok(msg) : fail(msg));

async function trpc(proc, payload, conClave = true) {
  const url = payload === undefined
    ? `${BASE}/api/trpc/analytics.${proc}`
    : `${BASE}/api/trpc/analytics.${proc}?input=${encodeURIComponent(JSON.stringify(payload))}`;
  const res = await fetch(url, { headers: conClave ? { 'x-analytics-key': SECRET } : {} });
  const body = await res.json();
  return { status: res.status, body };
}

// ── 1. Autenticación ──
console.log('\n═══ Autenticación ═══');
{
  const sin = await trpc('getStats', { limite: 10, excluir_mi_ip: true }, false);
  check(sin.status === 401 || JSON.stringify(sin.body).includes('UNAUTHORIZED'), `sin clave → rechazado (HTTP ${sin.status})`);
  const mal = await fetch(`${BASE}/api/trpc/analytics.getStats?input=${encodeURIComponent('{"limite":10}')}`, { headers: { 'x-analytics-key': 'clave-invalida' } });
  check(mal.status === 401 || JSON.stringify(await mal.json()).includes('UNAUTHORIZED'), `clave inválida → rechazado (HTTP ${mal.status})`);
}

// ── 2. getStats (rollup) ──
console.log('\n═══ getStats ═══');
const { status: st, body: sb } = await trpc('getStats', { limite: 500, excluir_mi_ip: true });
check(st === 200, `HTTP ${st}`);
const d = sb?.result?.data;
if (!d) { fail('sin result.data'); console.log(JSON.stringify(sb).slice(0, 500)); process.exit(1); }
check(d.version === 'v4-rollup', `version = ${d.version}`);
check(d.rollup && typeof d.rollup.esperado === 'string', `rollup.esperado = ${d.rollup?.esperado}`);
check(d.rollup?.hasta !== undefined, `rollup.hasta = ${d.rollup?.hasta}`);
check(d.estadisticas.total_usos > 0, `total_usos = ${d.estadisticas.total_usos}`);
check(d.estadisticas.total_aplicaciones > 500, `total_aplicaciones = ${d.estadisticas.total_aplicaciones}`);
check(Array.isArray(d.data) && d.data.length > 0, `registros = ${d.data.length}`);
check(typeof d.data[0].id === 'number' && typeof d.data[0].aplicacion === 'string', `registros tipados (id=${d.data[0].id})`);
const c = d.comparativa;
check(c && typeof c.hoy.usos === 'number', `comparativa.hoy = ${c?.hoy?.usos} usos / ${c?.hoy?.apps_distintas} apps`);
check(c.semana.usos >= c.hoy.usos, `semana (${c.semana.usos}) ≥ hoy (${c.hoy.usos})`);
check(c.mes.usos >= c.hoy.usos, `mes (${c.mes.usos}) ≥ hoy (${c.hoy.usos})`);
const r0 = d.ranking_aplicaciones[0];
check(typeof r0.usos_30d === 'number', `ranking[0] usos_30d = ${r0.usos_30d} (${r0.aplicacion})`);
check(['✅ Activa', '⚠️ Bajo uso', '💤 Sin uso 30d'].includes(r0.estado), `estado 30d = ${r0.estado}`);
const sinUso = d.ranking_aplicaciones.filter(a => a.estado === '💤 Sin uso 30d').length;
const activas = d.ranking_aplicaciones.filter(a => a.estado === '✅ Activa').length;
console.log(`  ℹ️ ranking: ${d.ranking_aplicaciones.length} apps → ${activas} activas, ${sinUso} sin uso 30d`);
check(d.filtros.aplicacion === undefined, 'filtros legacy eliminados del shape');

// ── 3. getResumen ──
console.log('\n═══ getResumen ═══');
{
  const { status, body } = await trpc('getResumen', {});
  const rd = body?.result?.data;
  check(status === 200 && rd?.filas?.length >= 9, `HTTP ${status}, ${rd?.filas?.length} filas`);
  check(rd.totalReal.total > 0, `totalReal.total = ${rd.totalReal.total}`);
  check(rd.totalReal.semana >= rd.totalReal.hoy, `semana (${rd.totalReal.semana}) ≥ hoy (${rd.totalReal.hoy})`);
}

// ── 4. getTendencia30Dias ──
console.log('\n═══ getTendencia30Dias ═══');
{
  const { status, body } = await trpc('getTendencia30Dias', { excluir_mi_ip: true });
  const rd = body?.result?.data;
  check(status === 200 && rd?.dias?.length === 30, `HTTP ${status}, ${rd?.dias?.length} días`);
  const suma = rd.dias.reduce((a, x) => a + x.usos, 0);
  check(suma > 0, `suma 30 días = ${suma}`);
  // El último día debe ser hoy (Madrid), formato DD/MM con ceros
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', day: '2-digit', month: '2-digit' }).formatToParts(new Date());
  const v = (t) => p.find(x => x.type === t)?.value;
  const hoyMadrid = `${v('day')}/${v('month')}`;
  check(rd.dias[29].fecha === hoyMadrid, `último día = ${rd.dias[29].fecha} (hoy Madrid = ${hoyMadrid})`);
}

// ── 5. getTendencias (sin input) ──
console.log('\n═══ getTendencias ═══');
{
  const { status, body } = await trpc('getTendencias', undefined);
  const rd = body?.result?.data;
  check(status === 200 && Array.isArray(rd?.mensual), `HTTP ${status}, ${rd?.mensual?.length} meses`);
  check(rd.canales && typeof rd.canales.web === 'number', `canales.web = ${rd?.canales?.web}`);
  check(rd.latam?.length === 2, `latam = ${rd?.latam?.map(l => `${l.mes}:${l.pct}%`).join(' ')}`);
}

// ── 6. getDistribucionDuraciones ──
console.log('\n═══ getDistribucionDuraciones ═══');
{
  const { status, body } = await trpc('getDistribucionDuraciones', { excluir_mi_ip: true });
  const rd = body?.result?.data;
  check(status === 200 && rd?.buckets?.length === 5, `HTTP ${status}, ${rd?.buckets?.length} buckets, total=${rd?.total}`);
  check(rd.topPorDuracion.length > 0, `topPorDuracion = ${rd?.topPorDuracion?.length} apps`);
}

// ── 7. getNavegacion (con filtro SQL de fecha) ──
console.log('\n═══ getNavegacion ═══');
{
  const t0 = Date.now();
  const { status, body } = await trpc('getNavegacion', { dias: 14 });
  const ms = Date.now() - t0;
  const rd = body?.result?.data;
  check(status === 200 && rd?.kpis?.totalSesiones > 0, `HTTP ${status}, ${rd?.kpis?.totalSesiones} sesiones, ${rd?.kpis?.totalVisitas} visitas (${ms} ms)`);
  check(typeof rd.descubrimientoInterno?.total === 'number', `descubrimiento interno = ${rd?.descubrimientoInterno?.total} clics`);
}

// ── 8. getPorDominio ──
console.log('\n═══ getPorDominio ═══');
{
  const { status, body } = await trpc('getPorDominio', {});
  const rd = body?.result?.data;
  check(status === 200 && rd?.filas?.length > 0, `HTTP ${status}, ${rd?.filas?.length} dominios`);
  check(rd.total.semana >= rd.total.hoy, `total.semana (${rd?.total?.semana}) ≥ total.hoy (${rd?.total?.hoy})`);
}

// ── 9. getIPConfig ──
console.log('\n═══ getIPConfig ═══');
{
  const { status, body } = await trpc('getIPConfig', { ip_actual: 'localhost' });
  const rd = body?.result?.data;
  check(status === 200 && rd?.data, `HTTP ${status}, ip_excluida=${rd?.data?.ip_excluida ? 'configurada' : 'no'}, ip_actual=${rd?.data?.ip_actual}`);
}

console.log(`\n${fallos === 0 ? '✅ TODAS LAS PRUEBAS PASAN' : `❌ ${fallos} pruebas fallidas`}`);
process.exit(fallos === 0 ? 0 : 1);
