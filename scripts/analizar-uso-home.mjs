/**
 * Análisis de uso de la home de meskeIA.
 * Objetivo: entender si la navegación de la home (suites/momentos/guías) sirve.
 */

import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config({ path: '.env.local', quiet: true });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// 90 días atrás
const PERIODO = `created_at >= datetime('now', '-90 days')`;
// excluir bots/mcp/chatgpt y visitas propias
const FILTRO_BASE = `(modo IS NULL OR modo NOT IN ('bot', 'mcp', 'chatgpt')) AND (es_propio IS NULL OR es_propio = 0)`;

console.log('═══════════════════════════════════════════════════════════════');
console.log('  ANÁLISIS DE USO DEL HOME — meskeIA');
console.log('  Periodo: últimos 90 días, excluyendo bots/MCP/ChatGPT y visitas propias');
console.log('═══════════════════════════════════════════════════════════════\n');

// ─────────────────────────────────────────────────────────────
// 1. ¿Cómo se identifica la home en analytics?
// ─────────────────────────────────────────────────────────────
console.log('1. SLUGS USADOS PARA TRACKEAR EL HOME\n');

const slugCheck = await client.execute({
  sql: `SELECT aplicacion, COUNT(*) as visitas
        FROM uso_aplicaciones
        WHERE LOWER(aplicacion) IN ('meskeia', 'home', 'index', 'meskeia-home')
          AND ${PERIODO}
          AND ${FILTRO_BASE}
        GROUP BY aplicacion
        ORDER BY visitas DESC`,
  args: [],
});
slugCheck.rows.forEach(r => console.log(`   ${String(r.aplicacion).padEnd(20)} ${r.visitas} visitas`));
const totalHome = slugCheck.rows.reduce((s, r) => s + Number(r.visitas), 0);
console.log(`   ─────────────────────────────`);
console.log(`   TOTAL HOME: ${totalHome} visitas\n`);

if (totalHome === 0) {
  console.log('⚠️ No se encuentra tracking del home. Saliendo.');
  process.exit(0);
}

const homeSlug = slugCheck.rows[0]?.aplicacion;

// ─────────────────────────────────────────────────────────────
// 2. % rebote del home: sesiones que solo visitan home vs continúan
// ─────────────────────────────────────────────────────────────
console.log('2. SESIONES QUE PASAN POR EL HOME — REBOTE vs CONTINÚAN\n');

const rebote = await client.execute({
  sql: `WITH home_sessions AS (
          SELECT DISTINCT sesion_id, MIN(created_at) as primera
          FROM uso_aplicaciones
          WHERE aplicacion = ?
            AND ${PERIODO}
            AND ${FILTRO_BASE}
            AND sesion_id IS NOT NULL
          GROUP BY sesion_id
        )
        SELECT
          COUNT(DISTINCT hs.sesion_id) as total_sesiones_home,
          COUNT(DISTINCT CASE WHEN ua.aplicacion != ? THEN hs.sesion_id END) as continuan
        FROM home_sessions hs
        LEFT JOIN uso_aplicaciones ua
          ON ua.sesion_id = hs.sesion_id
          AND ua.created_at >= hs.primera
          AND (ua.modo IS NULL OR ua.modo NOT IN ('bot', 'mcp', 'chatgpt'))
          AND (ua.es_propio IS NULL OR ua.es_propio = 0)`,
  args: [homeSlug, homeSlug],
});
const r = rebote.rows[0];
const reboten = Number(r.total_sesiones_home) - Number(r.continuan);
const rebotePct = (reboten / Number(r.total_sesiones_home) * 100).toFixed(1);
const continuanPct = (Number(r.continuan) / Number(r.total_sesiones_home) * 100).toFixed(1);
console.log(`   Sesiones que pasaron por home:  ${r.total_sesiones_home}`);
console.log(`   ├─ Solo visitaron home (rebote): ${reboten}  (${rebotePct}%)`);
console.log(`   └─ Continuaron a otra app:       ${r.continuan}  (${continuanPct}%)`);

// ─────────────────────────────────────────────────────────────
// 3. Top destinos desde el home
// ─────────────────────────────────────────────────────────────
console.log('\n3. TOP 20 APPS A LAS QUE SE LLEGA TRAS PASAR POR HOME\n');

const topDestinos = await client.execute({
  sql: `WITH home_sessions AS (
          SELECT DISTINCT sesion_id, MIN(created_at) as primera
          FROM uso_aplicaciones
          WHERE aplicacion = ?
            AND ${PERIODO}
            AND ${FILTRO_BASE}
            AND sesion_id IS NOT NULL
          GROUP BY sesion_id
        )
        SELECT ua.aplicacion, COUNT(DISTINCT hs.sesion_id) as desde_home
        FROM home_sessions hs
        JOIN uso_aplicaciones ua
          ON ua.sesion_id = hs.sesion_id
          AND ua.created_at >= hs.primera
          AND ua.aplicacion != ?
          AND (ua.modo IS NULL OR ua.modo NOT IN ('bot', 'mcp', 'chatgpt'))
          AND (ua.es_propio IS NULL OR ua.es_propio = 0)
        GROUP BY ua.aplicacion
        ORDER BY desde_home DESC
        LIMIT 20`,
  args: [homeSlug, homeSlug],
});

console.log('   Rank | App                                          | Sesiones |');
console.log('   -----|----------------------------------------------|----------|');
topDestinos.rows.forEach((row, i) => {
  console.log(`   ${(i+1).toString().padStart(4)} | ${String(row.aplicacion).padEnd(45)}| ${String(row.desde_home).padStart(8)} |`);
});

// ─────────────────────────────────────────────────────────────
// 4. Total apps destino y concentración (Pareto)
// ─────────────────────────────────────────────────────────────
console.log('\n4. CONCENTRACIÓN DEL TRÁFICO DESDE EL HOME (Pareto)\n');

const totalReal = await client.execute({
  sql: `WITH home_sessions AS (
          SELECT DISTINCT sesion_id, MIN(created_at) as primera
          FROM uso_aplicaciones
          WHERE aplicacion = ?
            AND ${PERIODO}
            AND ${FILTRO_BASE}
            AND sesion_id IS NOT NULL
          GROUP BY sesion_id
        )
        SELECT COUNT(DISTINCT ua.aplicacion) as apps_distintas, COUNT(*) as eventos_destino
        FROM home_sessions hs
        JOIN uso_aplicaciones ua
          ON ua.sesion_id = hs.sesion_id
          AND ua.created_at >= hs.primera
          AND ua.aplicacion != ?
          AND (ua.modo IS NULL OR ua.modo NOT IN ('bot', 'mcp', 'chatgpt'))
          AND (ua.es_propio IS NULL OR ua.es_propio = 0)`,
  args: [homeSlug, homeSlug],
});
const tr = totalReal.rows[0];
const top5 = topDestinos.rows.slice(0, 5).reduce((s, r) => s + Number(r.desde_home), 0);
const top10 = topDestinos.rows.slice(0, 10).reduce((s, r) => s + Number(r.desde_home), 0);
const top20 = topDestinos.rows.reduce((s, r) => s + Number(r.desde_home), 0);

console.log(`   Apps destino distintas (total): ${tr.apps_distintas}`);
console.log(`   Eventos destino totales:        ${tr.eventos_destino}`);
console.log(`   Top 5 apps (por sesiones desde home):  ${top5}/${tr.eventos_destino} = ${(top5/Number(tr.eventos_destino)*100).toFixed(1)}%`);
console.log(`   Top 10 apps:                            ${top10}/${tr.eventos_destino} = ${(top10/Number(tr.eventos_destino)*100).toFixed(1)}%`);
console.log(`   Top 20 apps:                            ${top20}/${tr.eventos_destino} = ${(top20/Number(tr.eventos_destino)*100).toFixed(1)}%`);

// ─────────────────────────────────────────────────────────────
// 5. Duración media en el home
// ─────────────────────────────────────────────────────────────
console.log('\n5. DURACIÓN EN HOME\n');

const duracion = await client.execute({
  sql: `SELECT
          AVG(duracion_segundos) as media,
          COUNT(*) as muestras
        FROM uso_aplicaciones
        WHERE aplicacion = ?
          AND duracion_segundos IS NOT NULL
          AND duracion_segundos > 0
          AND ${PERIODO}
          AND ${FILTRO_BASE}`,
  args: [homeSlug],
});
const d = duracion.rows[0];
console.log(`   Muestras con duración registrada: ${d.muestras}`);
console.log(`   Duración media: ${Number(d.media || 0).toFixed(1)} segundos`);

const buckets = await client.execute({
  sql: `SELECT
          SUM(CASE WHEN duracion_segundos < 5 THEN 1 ELSE 0 END) as menos5s,
          SUM(CASE WHEN duracion_segundos BETWEEN 5 AND 15 THEN 1 ELSE 0 END) as entre5y15,
          SUM(CASE WHEN duracion_segundos BETWEEN 16 AND 30 THEN 1 ELSE 0 END) as entre16y30,
          SUM(CASE WHEN duracion_segundos BETWEEN 31 AND 60 THEN 1 ELSE 0 END) as entre31y60,
          SUM(CASE WHEN duracion_segundos > 60 THEN 1 ELSE 0 END) as masDe60
        FROM uso_aplicaciones
        WHERE aplicacion = ?
          AND duracion_segundos IS NOT NULL
          AND ${PERIODO}
          AND ${FILTRO_BASE}`,
  args: [homeSlug],
});
const b = buckets.rows[0];
const totalDur = Number(b.menos5s) + Number(b.entre5y15) + Number(b.entre16y30) + Number(b.entre31y60) + Number(b.masDe60);
const pct = (n) => totalDur > 0 ? (Number(n) / totalDur * 100).toFixed(1) : '0';
console.log(`   Distribución (n=${totalDur}):`);
console.log(`     < 5s:      ${b.menos5s} (${pct(b.menos5s)}%)  — vistazo y se van`);
console.log(`     5-15s:     ${b.entre5y15} (${pct(b.entre5y15)}%)  — orientación rápida`);
console.log(`     16-30s:    ${b.entre16y30} (${pct(b.entre16y30)}%)  — exploración`);
console.log(`     31-60s:    ${b.entre31y60} (${pct(b.entre31y60)}%)  — navegación clara`);
console.log(`     > 60s:     ${b.masDe60} (${pct(b.masDe60)}%)  — uso prolongado`);

// ─────────────────────────────────────────────────────────────
// 6. Comparativa apps/sesión: home vs entrada directa
// ─────────────────────────────────────────────────────────────
console.log('\n6. APPS POR SESIÓN — HOME vs ENTRADA DIRECTA\n');

const compara = await client.execute({
  sql: `WITH session_apps AS (
          SELECT
            sesion_id,
            COUNT(DISTINCT aplicacion) as apps_distintas,
            MAX(CASE WHEN aplicacion = ? THEN 1 ELSE 0 END) as paso_por_home
          FROM uso_aplicaciones
          WHERE ${PERIODO}
            AND ${FILTRO_BASE}
            AND sesion_id IS NOT NULL
          GROUP BY sesion_id
        )
        SELECT
          paso_por_home,
          COUNT(*) as sesiones,
          AVG(apps_distintas * 1.0) as apps_por_sesion_media
        FROM session_apps
        GROUP BY paso_por_home`,
  args: [homeSlug],
});
compara.rows.forEach(row => {
  const tipo = Number(row.paso_por_home) === 1 ? 'PASARON por home' : 'NO pasaron por home';
  console.log(`   ${tipo}:  ${String(row.sesiones).padStart(5)} sesiones,  ${Number(row.apps_por_sesion_media).toFixed(2)} apps/sesión media`);
});

// ─────────────────────────────────────────────────────────────
// 7. Tipo de dispositivo de quienes pasan por home
// ─────────────────────────────────────────────────────────────
console.log('\n7. DISPOSITIVO DE LOS QUE PASAN POR HOME\n');

const dispositivos = await client.execute({
  sql: `SELECT tipo_dispositivo, COUNT(*) as visitas
        FROM uso_aplicaciones
        WHERE aplicacion = ?
          AND ${PERIODO}
          AND ${FILTRO_BASE}
        GROUP BY tipo_dispositivo`,
  args: [homeSlug],
});
const totalDispos = dispositivos.rows.reduce((s, r) => s + Number(r.visitas), 0);
dispositivos.rows.forEach(row => {
  console.log(`   ${String(row.tipo_dispositivo || 'desconocido').padEnd(15)} ${row.visitas} (${(Number(row.visitas)/totalDispos*100).toFixed(1)}%)`);
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  Análisis completado.');
console.log('═══════════════════════════════════════════════════════════════');
