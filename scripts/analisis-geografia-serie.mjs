/**
 * analisis-geografia-serie.mjs — ¿el crecimiento es ESTRUCTURAL o rotación de calendario?
 *
 * Se escribió para cerrar el hito `estacionalidad-latam-agosto` (15/09/2026), que preguntaba si
 * el salto de tráfico de agosto era producto o calendario escolar LATAM. Queda como script y no
 * como tabla porque la respuesta CADUCA: la tabla de aquel día ya no vale dentro de un mes, y
 * rehacer el análisis desde cero cuesta una sesión entera.
 *
 * ⚠️ EL EJE QUE DISCRIMINA NO ES EL VOLUMEN. Que suba el total no distingue las dos hipótesis:
 * las dos lo predicen. Lo que las separa son tres cosas, y por eso el script las imprime juntas:
 *
 *   1. La RATIO LATAM/ES. Rotación de calendario = la ratio se tuerce (uno sube mientras el otro
 *      baja). Crecimiento de producto = los dos crecen y la ratio se queda quieta.
 *   2. La CONCENTRACIÓN. Un curso escolar que arranca se ve como aulas: bloques app-día donde una
 *      sola IP se lleva la mitad. Si el tráfico crece y la concentración BAJA, no son clases.
 *   3. La CALIDAD (duración, recurrencia). Distingue gente de automatización no marcada. Si al
 *      triplicarse el volumen la duración media sube, no es un bot; un bot la hunde.
 *
 * Veredicto del 15/09/2026, con sus cifras: memoria `project_baseline_tendencias_digest`.
 * Allí consta también la decisión de NO fijar línea de base estática mientras la serie crezca.
 *
 * Filtros: el humano canónico del proyecto (modo<>'bot', es_propio=0, sin NotebookLM, sin la IP
 * de desarrollo) MÁS las tres resoluciones de navegador automatizado que el clasificador de bots
 * no marca — 800x600, 400x400 y 1408x881, caracterizadas el 08/09/2026. Y sin `home`, que entró
 * en Analytics el 07/08/2026: contarla mezcla instrumentación nueva con tráfico nuevo.
 *
 * Uso:  node scripts/analisis-geografia-serie.mjs [--desde 2026-06-29]
 */
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const TURSO_DIR = 'C:/Users/jaceb/Documents/meskeIA_Critico/turso';
const ARGS = process.argv.slice(2);
const DESDE = ARGS.includes('--desde') ? ARGS[ARGS.indexOf('--desde') + 1] : '2026-06-29';

const dumps = readdirSync(TURSO_DIR).filter(f => /^turso-dump-\d{4}-\d{2}-\d{2}\.sql$/.test(f)).sort();
if (!dumps.length) throw new Error(`No hay dumps en ${TURSO_DIR}`);
const dumpPath = path.join(TURSO_DIR, dumps[dumps.length - 1]);

// Misma guardia que digest-diario.mjs: el dump se escribe ~08:06 y a medio volcar carga SIN error.
const sql = readFileSync(dumpPath, 'utf8');
if (!sql.trimEnd().endsWith('PRAGMA foreign_keys=ON;')) {
  throw new Error(`Dump INCOMPLETO: ${path.basename(dumpPath)}. Espera a que termine el backup.`);
}

const db = new DatabaseSync(':memory:');
const cargarScript = db.exec.bind(db); // node:sqlite (no es child_process)
cargarScript(sql);
const all = (s, ...p) => db.prepare(s).all(...p);
const one = (s, ...p) => db.prepare(s).get(...p);

const ipExcluida = one(`SELECT valor v FROM analytics_config WHERE clave='ip_excluida'`)?.v ?? null;
const FILTRO_IP = ipExcluida ? ` AND (ip_address IS NULL OR ip_address <> '${String(ipExcluida).replace(/'/g, "''")}')` : '';
const HUM = `modo<>'bot' AND es_propio=0 AND COALESCE(navegador,'') NOT LIKE '%NotebookLM%'`
  + ` AND (resolucion IS NULL OR resolucion NOT IN ('800x600','400x400','1408x881'))`
  + FILTRO_IP + ` AND aplicacion NOT LIKE 'mcp:%' AND aplicacion <> 'home'`;

// `pais` pasó de nombre completo a código ISO-2 a lo largo de la serie: se contemplan las dos
// formas, o las semanas viejas caen enteras en RESTO y el desglose miente sin avisar.
const LATAM = ['MX','CO','AR','PE','CL','EC','GT','BO','DO','HN','PY','SV','NI','CR','PA','UY','VE','CU','PR',
  'Mexico','Colombia','Argentina','Peru','Chile','Ecuador','Guatemala','Bolivia','Dominican Republic',
  'Honduras','Paraguay','El Salvador','Nicaragua','Costa Rica','Panama','Uruguay','Venezuela','Cuba','Puerto Rico']
  .map(p => `'${p}'`).join(',');
const ES = `'ES','Spain'`;

const maxDia = one(`SELECT MAX(date(created_at)) d FROM uso_aplicaciones`).d;
console.log(`Dump: ${path.basename(dumpPath)} · serie hasta ${maxDia} excluido (día incompleto)`);
console.log(`Filtro: humano canónico + resoluciones de automatización · sin 'home' · sin mcp:\n`);

// ── 1. Serie semanal y la RATIO, que es lo que discrimina ─────────────────────────────────
console.log('=== VISITAS POR SEMANA · el eje es la RATIO, no el total ===');
console.log('semana        total      ES   LATAM   %LATAM   RATIO L/ES');
const sem = all(`
  SELECT date(created_at, 'weekday 1', '-7 days') AS s, COUNT(*) tot,
         SUM(CASE WHEN pais IN (${ES})    THEN 1 ELSE 0 END) es,
         SUM(CASE WHEN pais IN (${LATAM}) THEN 1 ELSE 0 END) la
  FROM uso_aplicaciones
  WHERE ${HUM} AND date(created_at) >= '${DESDE}' AND date(created_at) < '${maxDia}'
  GROUP BY s ORDER BY s`);
for (const r of sem) {
  const pct = r.tot ? (100 * r.la / r.tot).toFixed(1) : '-';
  const ratio = r.es ? (r.la / r.es).toFixed(2) : '-';
  console.log(`${r.s}  ${String(r.tot).padStart(5)}  ${String(r.es).padStart(6)}  ${String(r.la).padStart(6)}   ${pct.padStart(6)}   ${ratio.padStart(8)}`);
}
console.log('\n  Ratio quieta mientras los dos crecen  -> producto (estructural)');
console.log('  Ratio que se tuerce, uno sube y otro baja -> rotación de calendario');

// ── 2. Concentración: un curso que arranca se ve como aulas ───────────────────────────────
// Umbrales de firma-trafico.mjs: una IP con >=8 visitas y >=50% del bloque app-día.
console.log('\n=== TRÁFICO EN BLOQUES CONCENTRADOS (firma de aula / visitante intensivo) ===');
console.log('mes         bloque   visitas  concentr.      %');
const meses = all(`SELECT DISTINCT strftime('%Y-%m', created_at) m FROM uso_aplicaciones
  WHERE ${HUM} AND date(created_at) >= '${DESDE}' ORDER BY m`).map(r => r.m);
for (const m of meses) {
  for (const [et, cond] of [['LATAM', `pais IN (${LATAM})`], ['ES   ', `pais IN (${ES})`]]) {
    const r = one(`
      WITH bloques AS (
        SELECT aplicacion, date(created_at) d, ip_address, COUNT(*) n FROM uso_aplicaciones
        WHERE ${HUM} AND ${cond} AND ip_address IS NOT NULL AND strftime('%Y-%m', created_at)='${m}'
        GROUP BY aplicacion, d, ip_address),
      tot AS (SELECT aplicacion, d, SUM(n) t FROM bloques GROUP BY aplicacion, d)
      SELECT (SELECT COALESCE(SUM(t),0) FROM tot) total,
             (SELECT COALESCE(SUM(b.n),0) FROM bloques b
              JOIN tot ON tot.aplicacion=b.aplicacion AND tot.d=b.d
              WHERE b.n >= 8 AND b.n >= 0.5 * tot.t) conc`);
    const pct = r.total ? (100 * r.conc / r.total).toFixed(1) : '-';
    console.log(`${m}    ${et}   ${String(r.total).padStart(6)}  ${String(r.conc).padStart(9)}  ${String(pct).padStart(5)}`);
  }
}
console.log('\n  Volumen que crece con concentración que BAJA -> tráfico difuso, no clases');

// ── 3. Calidad: separa gente de automatización que el clasificador no marca ────────────────
console.log('\n=== CALIDAD (si al crecer el volumen esto se hunde, no es gente) ===');
console.log('mes         bloque   visitas  %con-dur  dur-media  %>=30s  %recurr');
for (const m of meses) {
  for (const [et, cond] of [['LATAM', `pais IN (${LATAM})`], ['ES   ', `pais IN (${ES})`]]) {
    const r = one(`SELECT COUNT(*) n,
        SUM(CASE WHEN duracion_segundos IS NOT NULL THEN 1 ELSE 0 END) cd,
        AVG(duracion_segundos) dm,
        SUM(CASE WHEN duracion_segundos >= 30 THEN 1 ELSE 0 END) d30,
        SUM(es_recurrente) rec
      FROM uso_aplicaciones WHERE ${HUM} AND ${cond} AND strftime('%Y-%m', created_at)='${m}'`);
    const p = (x, base) => base ? (100 * x / base).toFixed(1).padStart(6) : '     -';
    console.log(`${m}    ${et}   ${String(r.n).padStart(6)}  ${p(r.cd, r.n)}  ${(r.dm ?? 0).toFixed(0).padStart(9)}  ${p(r.d30, r.cd)}  ${p(r.rec, r.n)}`);
  }
}

// ── 4. Anchura: que el crecimiento no sea un pico en tres apps ────────────────────────────
console.log('\n=== ANCHURA: apps con >=5 visitas en el mes y peso del top-15 ===');
console.log('mes         bloque   apps>=5   top15%');
for (const m of meses) {
  for (const [et, cond] of [['LATAM', `pais IN (${LATAM})`], ['ES   ', `pais IN (${ES})`]]) {
    const base = `FROM uso_aplicaciones WHERE ${HUM} AND ${cond} AND strftime('%Y-%m', created_at)='${m}'`;
    const apps = one(`SELECT COUNT(*) c FROM (SELECT aplicacion ${base} GROUP BY aplicacion HAVING COUNT(*) >= 5)`).c;
    const tot = one(`SELECT COUNT(*) n ${base}`).n;
    const top = all(`SELECT COUNT(*) n ${base} GROUP BY aplicacion ORDER BY n DESC LIMIT 15`).reduce((a, r) => a + r.n, 0);
    const pct = tot ? (100 * top / tot).toFixed(1) : '-';
    console.log(`${m}    ${et}   ${String(apps).padStart(7)}   ${String(pct).padStart(6)}`);
  }
}
console.log('\n  Top-15 con peso ESTABLE mientras el total crece -> crece toda la distribución');
