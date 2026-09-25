/**
 * generate-delegum-es.mjs
 *
 * Escanea las páginas de las apps en busca del marcador <RegionBadge
 * variant="es-only"|"es-data" /> y genera data/delegum/apps-region-es.ts con
 * los dos conjuntos que decide la banda de descubrimiento de Delegum:
 *
 *  - APPS_REGION_ES: `es-only`, la autodeclaración de "herramienta
 *    fiscal-España" (universo Delegum). La banda dice que la herramienta
 *    aplica a España, que es lo mismo que dice su badge.
 *  - APPS_REGION_ES_DATOS: `es-data` en una app de las suites de Delegum
 *    (finanzas, freelance, legal-fiscal). La banda invita a Delegum SIN
 *    declarar ámbito: el badge de encima ya dice «Datos de referencia:
 *    España. La metodología es universal».
 *
 * Lo consume el componente DescubreVertical para mostrar la banda de
 * descubrimiento de Delegum en apps de España que NO están en la curaduría de
 * Soluciones (enlazándolas a la home de Soluciones, sin engordar el directorio).
 *
 * Por qué `es-data` ya no basta sola (hallazgo 1685 del Inspector, 25/09/2026):
 * hasta ese día cualquier `es-data` contaba como fiscal-España. `es-data` dice
 * que los DATOS son de España (precios en euros, normativa de la UE citada), no
 * que la app sea de fiscalidad o finanzas: al ponérselo a los selectores
 * (smartphone el 20/09 y nueve más el 25/09) salió en ellos, justo bajo «La
 * metodología es universal», una banda que decía «Esta herramienta aplica a
 * España». Dos declaraciones de ámbito contradictorias en la misma pantalla, y
 * Delegum anunciado en un test de mascota o de ejercicio.
 *
 * Las suites salen de data/applications.ts leído como TEXTO (scripts/CLAUDE.md):
 * si el formato cambia, el regex se queda mudo sin error. Por eso el script se
 * PLANTA si reconoce menos apps de las esperables, en vez de escribir una lista
 * sin la parte `es-data`.
 *
 * Se encadena en el build (package.json) → la lista se regenera sola y nunca
 * queda obsoleta. Salida ordenada para diffs estables.
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = join(__dirname, '../app');
const outPath = join(__dirname, '../data/delegum/apps-region-es.ts');
const rutaApplications = join(__dirname, '../data/applications.ts');

// El marcador es exclusivo de RegionBadge; basta detectar la variante.
const RE_ES = /variant=["'](es-only|es-data)["']/;

/** Suites cuyo contenido es el de Delegum: fiscalidad, derecho laboral y finanzas. */
const SUITES_DELEGUM = new Set(['finanzas', 'freelance', 'legal-fiscal']);

/** Mínimo de apps con suites reconocidas por debajo del cual el parser está roto. */
const MINIMO_APPS_CON_SUITES = 500;

// Cada app de applications.ts es un objeto en UNA línea con `suites: [...]` y `url: "/slug/"`.
const suitesPorSlug = new Map();
for (const linea of readFileSync(rutaApplications, 'utf-8').split('\n')) {
  const url = linea.match(/url:\s*["']\/([^"'/]+)\/["']/);
  const suites = linea.match(/suites:\s*\[([^\]]*)\]/);
  if (!url || !suites) continue;
  suitesPorSlug.set(url[1], [...suites[1].matchAll(/["']([^"']+)["']/g)].map((m) => m[1]));
}
if (suitesPorSlug.size < MINIMO_APPS_CON_SUITES) {
  console.error(
    `❌ generate-delegum-es: solo ${suitesPorSlug.size} apps con suites en data/applications.ts ` +
      `(se esperan más de ${MINIMO_APPS_CON_SUITES}). ¿Ha cambiado el formato del fichero? ` +
      'No se escribe la lista: una parte es-data vacía quitaría la banda en silencio.'
  );
  process.exit(1);
}

const soloEspana = [];
const datosEspana = [];
for (const entry of readdirSync(appDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const page = join(appDir, entry.name, 'page.tsx');
  if (!existsSync(page)) continue;
  const src = readFileSync(page, 'utf-8');
  const m = src.match(RE_ES);
  if (!m || !src.includes('RegionBadge')) continue;
  // Una página que declare las dos variantes es fiscal-España: manda es-only.
  if (m[1] === 'es-only' || /variant=["']es-only["']/.test(src)) {
    soloEspana.push(entry.name);
  } else if ((suitesPorSlug.get(entry.name) ?? []).some((s) => SUITES_DELEGUM.has(s))) {
    datosEspana.push(entry.name);
  }
}
soloEspana.sort();
datosEspana.sort();

const cuerpo = (slugs) => slugs.map((s) => `  '${s}',`).join('\n');
const out = `// AUTO-GENERADO por scripts/generate-delegum-es.mjs — NO editar a mano.
// Se regenera en cada build. Lo consume DescubreVertical para mostrar la banda
// de descubrimiento de Delegum en apps ES que NO están en la curaduría de
// Soluciones (enlace a soluciones home). Ver _private/archivo/DELEGUM-SOLUCIONES.md.

/** Apps fiscal-España: <RegionBadge variant="es-only">. */
export const APPS_REGION_ES: ReadonlySet<string> = new Set([
${cuerpo(soloEspana)}
]);

/**
 * Apps con datos de referencia de España (<RegionBadge variant="es-data">) en
 * una suite de Delegum (finanzas, freelance, legal-fiscal). Su metodología es
 * universal: la banda no declara ámbito.
 */
export const APPS_REGION_ES_DATOS: ReadonlySet<string> = new Set([
${cuerpo(datosEspana)}
]);
`;

writeFileSync(outPath, out, 'utf-8');
console.log(
  `   🏛️  Delegum ES: ${soloEspana.length} apps fiscal-España + ${datosEspana.length} con datos de España → data/delegum/apps-region-es.ts`
);
