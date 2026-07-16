/**
 * generate-delegum-es.mjs
 *
 * Escanea las páginas de las apps en busca del marcador <RegionBadge
 * variant="es-only"|"es-data" />, que es la autodeclaración de "herramienta
 * fiscal-España" (universo Delegum). Genera data/delegum/apps-region-es.ts con
 * el conjunto de slugs.
 *
 * Lo consume el componente DescubreVertical para mostrar la banda de
 * descubrimiento de Delegum en apps de España que NO están en la curaduría de
 * Soluciones (enlazándolas a la home de Soluciones, sin engordar el directorio).
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

// El marcador es exclusivo de RegionBadge; basta detectar la variante.
const RE_ES = /variant=["'](es-only|es-data)["']/;

const slugs = [];
for (const entry of readdirSync(appDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const page = join(appDir, entry.name, 'page.tsx');
  if (!existsSync(page)) continue;
  const src = readFileSync(page, 'utf-8');
  if (RE_ES.test(src) && src.includes('RegionBadge')) {
    slugs.push(entry.name);
  }
}
slugs.sort();

const body = slugs.map((s) => `  '${s}',`).join('\n');
const out = `// AUTO-GENERADO por scripts/generate-delegum-es.mjs — NO editar a mano.
// Apps que se autodeclaran "fiscal-España" mediante <RegionBadge es-only|es-data>.
// Se regenera en cada build. Lo consume DescubreVertical para mostrar la banda
// de descubrimiento de Delegum en apps ES que NO están en la curaduría de
// Soluciones (enlace a soluciones home). Ver _private/archivo/DELEGUM-SOLUCIONES.md.
export const APPS_REGION_ES: ReadonlySet<string> = new Set([
${body}
]);
`;

writeFileSync(outPath, out, 'utf-8');
console.log(`   🏛️  Delegum ES: ${slugs.length} apps fiscal-España → data/delegum/apps-region-es.ts`);
