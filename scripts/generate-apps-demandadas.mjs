#!/usr/bin/env node
/**
 * generate-apps-demandadas.mjs — pool de apps con demanda demostrada para «Apps del día».
 *
 * Genera `data/apps-demandadas.ts`: la lista de slugs que el módulo DailyApps de la
 * portada puede mostrar. Sustituye al sorteo sobre el catálogo entero.
 *
 * POR QUÉ EXISTE (medición del 08/09/2026, hito `medir-home-instrumentada`)
 * -------------------------------------------------------------------------
 * Con el sorteo aleatorio sobre las +1.100 apps del catálogo, «Apps del día» rendía
 * 36 clics en 30 días: el 3,8 % de las sesiones que entran por la portada, frente al
 * 40,0 % del buscador que tiene justo encima. Los 36 clics se repartían entre 25 apps
 * sin que ninguna pasara de 3 — la firma de un módulo que no se elige, se acepta.
 * La causa no era el espacio ni la posición: era que ofrecía 4 apps al azar de mil.
 *
 * CÓMO SE ELIGE
 * -------------
 * Visitas reales de los últimos 90 días sobre el dump congelado de Turso, con el filtro
 * humano canónico del proyecto (fuera bots, MCP, ChatGPT y tráfico propio) MÁS el filtro
 * de resolución de abajo. Umbral: MIN_VISITAS. Da ~100 apps → rotando 4 al día, el ciclo
 * es de ~25 días, así que «cambian cada día» sigue siendo verdad.
 *
 * ⚠️ FILTRO DE AUTOMATIZACIÓN NO CLASIFICADA (hallazgo del 08/09/2026)
 * Las resoluciones 800x600, 400x400 y 1408x881 son firma de navegador headless: en 90 días
 * suman 436 cargas que el clasificador de bots NO marca, y 334 son de US. Fuera de US casi
 * no existen (800x600: 62 en US frente a 6 en todo el resto del mundo; 400x400: 48 y CERO).
 * Se filtran por resolución y no por país a propósito: excluir US entero descartaría también
 * a los hispanohablantes reales de allí, que sí existen (1.431 cargas con 83 s de media).
 *
 * Es una firma REAL pero PARCIAL, y conviene no creerla más de lo que es: sobre las entradas
 * a la portada quita 7 de las 68 de US, y las que quedan siguen fugándose al 95,1 %. Aquí
 * basta —lo que se ordena es un ranking de ~100 apps, donde ese resto no mueve el orden—,
 * pero NO da por limpia una métrica de página de aterrizaje. Detalle y tabla de bases en
 * la memoria `project_analytics_bots_duracion` (quinta especie).
 *
 * CADENCIA
 * --------
 * Se regenera y se commitea, igual que `data/app-dates.json` y por el mismo motivo: en
 * Vercel el clon es shallow y no hay acceso al dump, así que el build solo lee el fichero.
 * La cadencia vive en la Agenda Operativa (`pool-apps-demandadas`). Ejecutarlo de más no
 * rompe nada: si el resultado no cambia, el fichero queda idéntico.
 *
 * Uso:  node scripts/generate-apps-demandadas.mjs [--dias 90] [--min 50] [--dry]
 * Solo hace SELECT sobre una copia local. No toca Turso.
 */
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TURSO_DIR = 'C:/Users/jaceb/Documents/meskeIA_Critico/turso';
const SALIDA = path.join(RAIZ, 'data', 'apps-demandadas.ts');

const args = process.argv.slice(2);
const valor = (flag, def) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : def;
};
const DIAS = valor('--dias', 90);
const MIN_VISITAS = valor('--min', 50);
const DRY = args.includes('--dry');

// ── 1. Dump más reciente ───────────────────────────────────────────────────
const dumps = readdirSync(TURSO_DIR)
  .filter((f) => /^turso-dump-\d{4}-\d{2}-\d{2}\.sql$/.test(f))
  .sort();
if (!dumps.length) {
  console.error(`❌ No hay dumps en ${TURSO_DIR}`);
  process.exit(1);
}
const dump = dumps[dumps.length - 1];
const fechaDump = dump.slice(11, 21);
console.log(`📖 Dump: ${dump}  ·  ventana ${DIAS} días  ·  umbral ${MIN_VISITAS} visitas`);

const db = new DatabaseSync(':memory:');
const cargarSql = db.exec.bind(db);
cargarSql('PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;');
cargarSql(readFileSync(path.join(TURSO_DIR, dump), 'utf8'));

// ── 2. Ranking por visitas reales ──────────────────────────────────────────
// Filtro humano canónico del proyecto + resoluciones de navegador automatizado.
const HUMANO = `(modo IS NULL OR modo NOT IN ('bot','mcp','chatgpt','share-emit'))
                AND (es_propio IS NULL OR es_propio = 0)
                AND (resolucion IS NULL OR resolucion NOT IN ('800x600','400x400','1408x881'))`;
// Fuera lo que es navegación o portal, no una herramienta que se pueda destacar.
const NO_NAVEGACION = `aplicacion NOT IN ('home','catalogo-apps','meskeIA','stemum','cronicum','coquinum','delegum')
                       AND aplicacion NOT LIKE 'pag:%'
                       AND aplicacion NOT LIKE 'stemum-%' AND aplicacion NOT LIKE 'coquinum-%'
                       AND aplicacion NOT LIKE 'cronicum-%' AND aplicacion NOT LIKE 'delegum%'
                       AND aplicacion NOT LIKE 'mcp%'`;

const ranking = db
  .prepare(
    `SELECT aplicacion slug, COUNT(*) visitas, COUNT(DISTINCT ip_address) personas
     FROM uso_aplicaciones
     WHERE created_at >= date('${fechaDump}', '-${DIAS} days')
       AND ${HUMANO} AND ${NO_NAVEGACION}
     GROUP BY 1 HAVING visitas >= ${MIN_VISITAS}
     ORDER BY visitas DESC`
  )
  .all();

// ── 3. Cruce con el catálogo: un slug sin app viva no puede mostrarse ──────
// applications.ts guarda `url: "/slug/"`; el tracker emite el slug pelado.
const fuente = readFileSync(path.join(RAIZ, 'data', 'applications.ts'), 'utf8');
const slugsCatalogo = new Set(
  [...fuente.matchAll(/url:\s*"\/([^"/]+)\/"/g)].map((m) => m[1])
);

const validas = [];
const huerfanas = [];
for (const r of ranking) {
  (slugsCatalogo.has(r.slug) ? validas : huerfanas).push(r);
}

console.log(`\n📊 ${ranking.length} apps superan el umbral · ${validas.length} en el catálogo · ${huerfanas.length} sin ficha`);
if (huerfanas.length) {
  console.log(`   ⚠️ Fuera del pool (slug sin entrada en applications.ts):`);
  for (const h of huerfanas.slice(0, 15)) console.log(`      ${h.slug} (${h.visitas})`);
  if (huerfanas.length > 15) console.log(`      …y ${huerfanas.length - 15} más`);
}
if (validas.length < 20) {
  console.error(`\n❌ Solo ${validas.length} apps válidas: el pool sería más pobre que el sorteo. No se escribe nada.`);
  process.exit(1);
}

console.log(`\n   Top 10: ${validas.slice(0, 10).map((v) => v.slug).join(' · ')}`);
console.log(`   Cola:   ${validas.slice(-5).map((v) => `${v.slug} (${v.visitas})`).join(' · ')}`);
console.log(`   Ciclo de rotación: ${Math.ceil(validas.length / 4)} días a 4 tarjetas/día`);

// ── 4. Escribir el módulo ──────────────────────────────────────────────────
// Formato español obligatorio: DD/MM/YYYY con dos dígitos (toLocaleDateString no rellena).
const hoy = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
const contenido = `/**
 * Apps con demanda demostrada — pool de «Apps del día» de la portada.
 *
 * ⚠️ FICHERO GENERADO: no editar a mano.
 *    Lo escribe \`node scripts/generate-apps-demandadas.mjs\` desde el dump de Turso,
 *    y la cabecera de ese script explica por qué existe y cómo se eligen las apps.
 *
 * Generado el ${hoy} · ventana de ${DIAS} días · umbral ${MIN_VISITAS} visitas
 * Dump de origen: ${dump}
 */

/** Slugs ordenados por visitas reales (descendente). */
export const APPS_DEMANDADAS: readonly string[] = [
${validas.map((v) => `  '${v.slug}', // ${v.visitas} visitas · ${v.personas} personas`).join('\n')}
];

export const APPS_DEMANDADAS_META = {
  generado: '${new Date().toISOString().slice(0, 10)}',
  ventanaDias: ${DIAS},
  minVisitas: ${MIN_VISITAS},
  total: ${validas.length},
} as const;
`;

if (DRY) {
  console.log(`\n🔍 --dry: no se escribe. Serían ${validas.length} apps en ${path.relative(RAIZ, SALIDA)}`);
} else {
  writeFileSync(SALIDA, contenido, 'utf8');
  console.log(`\n✅ Escrito ${path.relative(RAIZ, SALIDA)} con ${validas.length} apps`);
}
