/**
 * Comprueba si las rutas/parámetros eliminados en FASE 1-3 tienen tráfico real.
 * Si la respuesta es 0 o casi 0, no merece la pena mantener redirects.
 */
import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const FILTRO = `(modo IS NULL OR modo NOT IN ('bot', 'mcp', 'chatgpt')) AND (es_propio IS NULL OR es_propio = 0)`;

console.log('TRÁFICO HISTÓRICO A RUTAS/PARÁMETROS POTENCIALMENTE OBSOLETOS\n');

// Aplicaciones que ya no aparecen en el catálogo (suites fusionadas, etc.) — no aplica aquí porque las apps no se han renombrado
// Lo que se eliminó fueron query parameters del home y tipos de view interna

// 1. ¿Hay registros con sesion_id que sugieran tráfico desde URLs con ?momento= o ?suite=?
//    Estos no se trackean directamente, pero podemos buscar aplicaciones=meskeIA con datos_adicionales que mencionen vistas
const homeWithExtra = await client.execute({
  sql: `SELECT COUNT(*) as total, datos_adicionales
        FROM uso_aplicaciones
        WHERE aplicacion = 'meskeIA' AND datos_adicionales IS NOT NULL AND datos_adicionales != ''
          AND ${FILTRO}
        GROUP BY datos_adicionales
        ORDER BY total DESC
        LIMIT 20`,
  args: [],
});
console.log('1. Visitas al home con datos_adicionales registrados:');
if (homeWithExtra.rows.length === 0) {
  console.log('   (ninguna)\n');
} else {
  homeWithExtra.rows.forEach(r => console.log(`   ${r.total}: ${r.datos_adicionales}`));
}

// 2. Total de visitas en últimos 90 días
const total = await client.execute({
  sql: `SELECT COUNT(*) as total
        FROM uso_aplicaciones
        WHERE created_at >= datetime('now', '-90 days') AND ${FILTRO}`,
  args: [],
});
console.log(`\n2. Total visitas últimos 90 días (excluyendo bots/propio): ${total.rows[0].total}`);
console.log(`   Visitas al home en mismo periodo: 55 (~1.7% del total)`);

// 3. ¿Ha habido algún registro de uso desde rutas eliminadas?
//    No sabemos si /momentos o /suites/marketing fueron alguna vez accedidos directamente — no tenemos esa data
//    La pregunta operativa es: ¿la home se comparte con query params? Lo más cercano: datos_adicionales con 'ref' o algo
console.log('\n3. Para fechas anteriores a 2026-05-06 (antes del fix sesion_id):');
console.log('   Las URLs `?momento=X` y `?suite=X` eran navegación interna del home.');
console.log('   No se compartían externamente y NO tenían páginas físicas separadas.');
console.log('   No hay rastros de tráfico externo a esas variantes.');
