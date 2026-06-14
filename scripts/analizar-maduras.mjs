/**
 * Análisis SOLO de apps con >30 días en producción
 * Elimina sesgo de los 27 simuladores creados el 2026-05-07
 */
import { createClient } from '@libsql/client';
import { config } from 'dotenv';
config({ path: '.env.local', quiet: true });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function clasificar(slug) {
  if (slug.startsWith('simulador-')) return 'simulador';
  if (slug.startsWith('estimador-')) return 'estimador';
  if (slug.startsWith('calculadora-')) return 'calculadora';
  if (slug.startsWith('test-')) return 'test';
  return 'otro';
}

const ipRow = await client.execute(`SELECT valor FROM analytics_config WHERE clave = 'ip_excluida'`);
const ipExcluida = ipRow.rows[0]?.valor || '';
const filtroIp = ipExcluida ? ` AND (es_propio IS NULL OR es_propio = 0) AND (ip_address IS NULL OR ip_address != '${ipExcluida}')` : '';

// Apps maduras: primera visita antes del 2026-04-10 (hace 30+ días) y al menos 3 visitas
const sql = `
  SELECT
    aplicacion,
    COUNT(*) as visitas,
    AVG(CASE WHEN duracion_segundos > 0 AND duracion_segundos < 1800 THEN duracion_segundos END) as duracion_avg,
    SUM(CASE WHEN es_recurrente = 1 THEN 1 ELSE 0 END) as recurrentes,
    MIN(timestamp) as primera,
    MAX(timestamp) as ultima
  FROM uso_aplicaciones
  WHERE 1=1 ${filtroIp}
  GROUP BY aplicacion
  HAVING COUNT(*) >= 3
`;

const result = await client.execute(sql);

// Filtrar por edad: primera visita anterior al 10/04/2026
function esMadura(timestampStr) {
  // formato "DD/MM/YYYY, HH:MM:SS"
  const m = timestampStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return false;
  const [, d, mes, y] = m;
  const fecha = new Date(`${y}-${mes}-${d}`);
  const corte = new Date('2026-04-10');
  return fecha < corte;
}

const porCategoria = {};
for (const row of result.rows) {
  const slug = String(row.aplicacion);
  const cat = clasificar(slug);
  if (cat === 'otro') continue;
  if (!esMadura(String(row.primera))) continue;

  if (!porCategoria[cat]) porCategoria[cat] = { apps: [], totV: 0, sumD: 0, cntD: 0, totR: 0 };

  const v = Number(row.visitas);
  const d = Number(row.duracion_avg) || 0;
  const r = Number(row.recurrentes);

  porCategoria[cat].apps.push({ slug, v, d: Math.round(d), r, porcRec: (r / v) * 100, primera: row.primera });
  porCategoria[cat].totV += v;
  if (d > 0) { porCategoria[cat].sumD += d * v; porCategoria[cat].cntD += v; }
  porCategoria[cat].totR += r;
}

console.log('\n' + '='.repeat(85));
console.log('APPS MADURAS (>30 días en producción, mín. 3 visitas)');
console.log('='.repeat(85));
console.log('Tipo'.padEnd(15) + 'Apps'.padEnd(8) + 'Visitas'.padEnd(10) + 'V/app'.padEnd(8) + 'Dur(s)'.padEnd(10) + '%recurr');
console.log('-'.repeat(85));

for (const cat of ['simulador', 'estimador', 'calculadora', 'test']) {
  const d = porCategoria[cat];
  if (!d) { console.log(cat.padEnd(15) + '0'); continue; }
  const n = d.apps.length;
  const vApp = n > 0 ? d.totV / n : 0;
  const durAvg = d.cntD > 0 ? d.sumD / d.cntD : 0;
  const porcRec = d.totV > 0 ? (d.totR / d.totV) * 100 : 0;
  console.log(
    cat.padEnd(15) +
    String(n).padEnd(8) +
    String(d.totV).padEnd(10) +
    vApp.toFixed(1).padEnd(8) +
    durAvg.toFixed(0).padEnd(10) +
    porcRec.toFixed(1) + '%'
  );
}

// Mediana sin outliers (los que dominan)
console.log('\n' + '='.repeat(85));
console.log('MEDIANA por tipo (más robusta que la media frente a outliers)');
console.log('='.repeat(85));
const mediana = arr => {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
};
console.log('Tipo'.padEnd(15) + 'n'.padEnd(6) + 'Mediana visitas'.padEnd(20) + 'Mediana dur(s)'.padEnd(20) + 'Mediana %rec');
console.log('-'.repeat(85));
for (const cat of ['simulador', 'estimador', 'calculadora', 'test']) {
  const d = porCategoria[cat];
  if (!d) continue;
  const v = d.apps.map(a => a.v);
  const dur = d.apps.filter(a => a.d > 0).map(a => a.d);
  const rec = d.apps.map(a => a.porcRec);
  console.log(
    cat.padEnd(15) +
    String(v.length).padEnd(6) +
    mediana(v).toFixed(1).padEnd(20) +
    (dur.length ? mediana(dur).toFixed(0) : 'n/a').padEnd(20) +
    mediana(rec).toFixed(1) + '%'
  );
}

// Apps maduras de simuladores en detalle
console.log('\n' + '='.repeat(85));
console.log('SIMULADORES MADUROS (detalle)');
console.log('='.repeat(85));
for (const a of (porCategoria.simulador?.apps || []).sort((x, y) => y.v - x.v)) {
  console.log(`  ${a.slug.padEnd(45)} ${String(a.v).padStart(5)}v  ${String(a.d).padStart(4)}s  ${a.porcRec.toFixed(0).padStart(3)}% rec  desde ${a.primera}`);
}

console.log();
process.exit(0);
