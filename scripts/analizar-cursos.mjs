/**
 * analizar-cursos.mjs — Rendimiento de los 13 cursos existentes
 *
 * Cruza:
 *   A) Uso real (Turso: uso_aplicaciones) — visitas, duración, recurrencia, profundidad por capítulo
 *   B) Demanda/ranking de búsqueda (Google Search Console, páginas /curso-)
 *
 * Objetivo: decidir con datos si merece la pena reactivar el programa de cursos.
 *
 * Uso:
 *   node scripts/analizar-cursos.mjs         # ventana GSC 90 días
 *   node scripts/analizar-cursos.mjs 180
 */
import { createClient } from '@libsql/client';
import { JWT } from 'google-auth-library';
import { config } from 'dotenv';
import { readFileSync } from 'node:fs';

config({ path: '.env.local', quiet: true });

const diasGSC = parseInt(process.argv[2], 10) || 90;
const nf = new Intl.NumberFormat('es-ES');

// =========================================================================
// A) USO REAL (Turso)
// =========================================================================
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const ipRow = await turso.execute(`SELECT valor FROM analytics_config WHERE clave = 'ip_excluida'`);
const ipExcluida = ipRow.rows[0]?.valor || '';
const filtroIp = ipExcluida
  ? ` AND (es_propio IS NULL OR es_propio = 0) AND (ip_address IS NULL OR ip_address != '${ipExcluida}')`
  : '';

// Todas las filas de cursos (raw), para poder analizar profundidad por capítulo
const sqlCursos = `
  SELECT aplicacion,
         COUNT(*) as visitas,
         AVG(CASE WHEN duracion_segundos > 0 AND duracion_segundos < 3600 THEN duracion_segundos END) as dur,
         SUM(CASE WHEN es_recurrente = 1 THEN 1 ELSE 0 END) as rec,
         MIN(timestamp) as primera,
         MAX(timestamp) as ultima
  FROM uso_aplicaciones
  WHERE aplicacion LIKE '%curso-%' ${filtroIp}
  GROUP BY aplicacion
`;
const res = await turso.execute(sqlCursos);

// Agrupar por raíz de curso (curso-xxxxx) y separar índice vs capítulos
const cursos = {};
for (const row of res.rows) {
  const slug = String(row.aplicacion);
  const m = slug.match(/(curso-[a-z0-9-]+?)(?:\/|$|_)/i) || slug.match(/(curso-[a-z0-9-]+)/i);
  if (!m) continue;
  const raiz = m[1];
  const esIndice = slug === raiz || slug === raiz + '/' || /^curso-[a-z0-9-]+\/?$/i.test(slug);
  if (!cursos[raiz]) cursos[raiz] = { indiceV: 0, capV: 0, totV: 0, sumDur: 0, cntDur: 0, rec: 0, subpaginas: new Set(), primera: null, ultima: null };
  const c = cursos[raiz];
  const v = Number(row.visitas);
  const d = Number(row.dur) || 0;
  c.totV += v;
  c.rec += Number(row.rec);
  if (d > 0) { c.sumDur += d * v; c.cntDur += v; }
  if (esIndice) c.indiceV += v; else { c.capV += v; c.subpaginas.add(slug); }
  if (!c.primera || String(row.primera) < c.primera) c.primera = String(row.primera);
  if (!c.ultima || String(row.ultima) > c.ultima) c.ultima = String(row.ultima);
}

console.log('\n' + '='.repeat(96));
console.log('A) USO REAL DE CURSOS (Turso, todo el histórico, IP propia excluida)');
console.log('='.repeat(96));
console.log(
  'Curso'.padEnd(34) + 'Visit'.padStart(7) + 'Índice'.padStart(8) + 'Caps'.padStart(7) +
  'Dur(s)'.padStart(8) + '%rec'.padStart(7) + ' Prof' .padStart(6) + '  Última visita'
);
console.log('-'.repeat(96));

const filas = Object.entries(cursos).map(([raiz, c]) => {
  const dur = c.cntDur > 0 ? c.sumDur / c.cntDur : 0;
  const porcRec = c.totV > 0 ? (c.rec / c.totV) * 100 : 0;
  // Profundidad = visitas a capítulos / visitas al índice (proxy de si pasan de la portada)
  const prof = c.indiceV > 0 ? c.capV / c.indiceV : (c.capV > 0 ? Infinity : 0);
  return { raiz, totV: c.totV, indiceV: c.indiceV, capV: c.capV, dur, porcRec, prof, nSub: c.subpaginas.size, ultima: c.ultima };
}).sort((a, b) => b.totV - a.totV);

for (const f of filas) {
  console.log(
    f.raiz.padEnd(34) +
    nf.format(f.totV).padStart(7) +
    nf.format(f.indiceV).padStart(8) +
    nf.format(f.capV).padStart(7) +
    (f.dur ? f.dur.toFixed(0) : '—').padStart(8) +
    f.porcRec.toFixed(0).padStart(6) + '%' +
    (isFinite(f.prof) ? f.prof.toFixed(2) : '∞').padStart(6) +
    '  ' + (f.ultima || '—')
  );
}

const totVisitas = filas.reduce((s, f) => s + f.totV, 0);
const totCap = filas.reduce((s, f) => s + f.capV, 0);
const totInd = filas.reduce((s, f) => s + f.indiceV, 0);
console.log('-'.repeat(96));
console.log(`TOTAL: ${nf.format(totVisitas)} visitas · índice ${nf.format(totInd)} · capítulos ${nf.format(totCap)} · profundidad global ${totInd ? (totCap / totInd).toFixed(2) : '—'}`);
console.log('\n(Prof = visitas a capítulos ÷ visitas al índice. >1 = la gente entra al contenido; <1 = se queda en portada / abandona)');

// =========================================================================
// B) GSC — demanda y ranking de las páginas /curso-
// =========================================================================
console.log('\n' + '='.repeat(96));
console.log(`B) GOOGLE SEARCH CONSOLE — páginas /curso- (${diasGSC} días)`);
console.log('='.repeat(96));

const keyFile = process.env.GSC_SA_KEY_FILE;
if (!keyFile) {
  console.log('⚠️  Falta GSC_SA_KEY_FILE en .env.local — omito la parte de búsqueda.');
  process.exit(0);
}

const API = 'https://www.googleapis.com/webmasters/v3';
const key = JSON.parse(readFileSync(keyFile, 'utf8'));
const client = new JWT({ email: key.client_email, key: key.private_key, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });

function ymd(d) { return d.toISOString().slice(0, 10); }
const fin = new Date(); fin.setDate(fin.getDate() - 3);
const ini = new Date(fin); ini.setDate(ini.getDate() - diasGSC);

async function apiGet(p) { return (await client.request({ url: `${API}${p}` })).data; }
async function apiPost(p, body) { return (await client.request({ url: `${API}${p}`, method: 'POST', data: body })).data; }

// Propiedad meskeia principal
const sitesData = await apiGet('/sites');
const sites = (sitesData.siteEntry || []).map(s => s.siteUrl);
const meskeia = sites.find(u => u.toLowerCase().includes('meskeia')) || sites[0];
console.log(`Propiedad: ${meskeia}\n`);

const enc = encodeURIComponent(meskeia);
const body = {
  startDate: ymd(ini),
  endDate: ymd(fin),
  dimensions: ['page'],
  dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'contains', expression: '/curso-' }] }],
  rowLimit: 500,
};
const data = await apiPost(`/sites/${enc}/searchAnalytics/query`, body);
const rows = data.rows || [];

// Agrupar por raíz de curso
const gsc = {};
for (const r of rows) {
  const url = r.keys[0];
  const m = url.match(/\/(curso-[a-z0-9-]+)/i);
  if (!m) continue;
  const raiz = m[1];
  if (!gsc[raiz]) gsc[raiz] = { clicks: 0, impr: 0, posSum: 0, posW: 0 };
  gsc[raiz].clicks += r.clicks;
  gsc[raiz].impr += r.impressions;
  gsc[raiz].posSum += r.position * r.impressions;
  gsc[raiz].posW += r.impressions;
}

console.log('Curso'.padEnd(34) + 'Clics'.padStart(7) + 'Impres.'.padStart(10) + 'CTR'.padStart(8) + 'Pos.med'.padStart(9));
console.log('-'.repeat(96));
const gfilas = Object.entries(gsc).map(([raiz, g]) => ({
  raiz, clicks: g.clicks, impr: g.impr, ctr: g.impr ? g.clicks / g.impr : 0, pos: g.posW ? g.posSum / g.posW : 0,
})).sort((a, b) => b.impr - a.impr);

let tc = 0, ti = 0;
for (const g of gfilas) {
  tc += g.clicks; ti += g.impr;
  console.log(
    g.raiz.padEnd(34) +
    nf.format(g.clicks).padStart(7) +
    nf.format(g.impr).padStart(10) +
    (g.ctr * 100).toFixed(1).padStart(7) + '%' +
    g.pos.toFixed(1).padStart(9)
  );
}
console.log('-'.repeat(96));
console.log(`TOTAL cursos en GSC: ${nf.format(tc)} clics · ${nf.format(ti)} impresiones · CTR ${(ti ? tc / ti * 100 : 0).toFixed(2)}%`);
console.log(`\n(Impresiones = demanda/visibilidad. Pos.med alta [>15] = Google no confía; muchas impr + pocos clics = título/CTR o intención)\n`);

process.exit(0);
