/**
 * Añade jsonLd (WebApplication schema) a todas las apps que no lo tienen.
 * Uso:
 *   node scripts/add-jsonld-bulk.mjs          → dry-run (solo lista cambios)
 *   node scripts/add-jsonld-bulk.mjs --apply  → aplica cambios reales
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const APPLY = process.argv.includes('--apply');
const APP_DIR = 'app';
const BASE_URL = 'https://meskeia.com';

// Mapeo suite → categoría (por prioridad)
const SUITE_CATEGORY = {
  finanzas:       'FinanceApplication',
  'legal-fiscal': 'FinanceApplication',
  inmobiliaria:   'FinanceApplication',
  freelance:      'BusinessApplication',
  estudiantes:    'EducationalApplication',
  cultura:        'EducationalApplication',
  tecnicas:       'UtilityApplication',
  productividad:  'UtilityApplication',
  salud:          'UtilityApplication',
  juegos:         'UtilityApplication',
  viajes:         'UtilityApplication',
  diseno:         'UtilityApplication',
  accesibilidad:  'UtilityApplication',
};
const CATEGORY_PRIORITY = ['FinanceApplication', 'BusinessApplication', 'EducationalApplication', 'UtilityApplication'];

function getCategory(suites) {
  const cats = suites.map(s => SUITE_CATEGORY[s]).filter(Boolean);
  for (const p of CATEGORY_PRIORITY) {
    if (cats.includes(p)) return p;
  }
  return 'UtilityApplication';
}

// Parsea applications.ts para obtener slug → { name, description, suites, url }
// Cada entrada de applications.ts es una línea única — matching solo en esa línea.
function parseApplications() {
  const content = readFileSync('data/applications.ts', 'utf8');
  const map = {};
  for (const line of content.split('\n')) {
    const urlMatch = line.match(/url:\s*["']\/([^/"']+)\//);
    if (!urlMatch) continue;
    const slug = urlMatch[1];
    const nameMatch = line.match(/name:\s*["']([^"']+)["']/);
    const descMatch = line.match(/description:\s*["']([^"']+)["']/);
    const suitesMatch = line.match(/suites:\s*\[([^\]]+)\]/);
    const suites = suitesMatch
      ? (suitesMatch[1].match(/["']([^"']+)["']/g) ?? []).map(s => s.replace(/["']/g, ''))
      : [];
    map[slug] = {
      name: nameMatch ? nameMatch[1] : slug,
      description: descMatch ? descMatch[1] : '',
      suites,
      url: `${BASE_URL}/${slug}/`,
    };
  }
  return map;
}

// Extrae la descripción del bloque export const metadata
function extractMetaDescription(content) {
  const m1 = content.match(/^\s{2}description:\s+'((?:[^'\\]|\\.)+)'/m);
  if (m1) return m1[1].replace(/\\'/g, "'");
  const m2 = content.match(/^\s{2}description:\s+`([^`]+)`/m);
  if (m2) return m2[1].replace(/\s+/g, ' ').trim();
  return null;
}

// Inyecta el import de generateWebAppSchema después del último import existente
function injectImport(content) {
  if (content.includes('generateWebAppSchema')) return content; // ya importado
  const lines = content.split('\n');
  let lastImportIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^import /)) lastImportIdx = i;
  }
  if (lastImportIdx >= 0) {
    lines.splice(lastImportIdx + 1, 0, `import { generateWebAppSchema } from '@/lib/schema-templates';`);
  } else {
    lines.unshift(`import { generateWebAppSchema } from '@/lib/schema-templates';`);
  }
  return lines.join('\n');
}

// Template de layout.tsx con solo jsonLd
function layoutOneScript() {
  return `import { jsonLd } from './metadata';
export { metadata } from './metadata';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

const appMap = parseApplications();
let modified = 0, skipped = 0, noData = 0;
const byCat = { FinanceApplication: 0, BusinessApplication: 0, EducationalApplication: 0, UtilityApplication: 0 };

for (const dir of readdirSync(APP_DIR).sort()) {
  const metaPath = join(APP_DIR, dir, 'metadata.ts');
  const layoutPath = join(APP_DIR, dir, 'layout.tsx');
  if (!existsSync(metaPath)) continue;

  const content = readFileSync(metaPath, 'utf8');
  if (content.includes('export const jsonLd')) { skipped++; continue; }

  const appData = appMap[dir];
  if (!appData) {
    if (!APPLY) console.log(`⚠️  Sin datos en applications.ts: ${dir}`);
    noData++;
    continue;
  }

  const category = getCategory(appData.suites);
  const description = extractMetaDescription(content) || appData.description || appData.name;
  const shortDesc = description.substring(0, 200).replace(/\\/g, '');

  if (!APPLY) {
    console.log(`  ${dir.padEnd(50)} → ${category}`);
    modified++;
    continue;
  }

  // 1. Inyectar import
  let newContent = injectImport(content);

  // 2. Añadir export jsonLd al final
  const jsonLdBlock = `
export const jsonLd = generateWebAppSchema({
  name: ${JSON.stringify(appData.name)},
  description: ${JSON.stringify(shortDesc)},
  url: ${JSON.stringify(appData.url)},
  category: '${category}',
  features: [],
});
`;
  newContent = newContent.trimEnd() + '\n' + jsonLdBlock;
  writeFileSync(metaPath, newContent, 'utf8');

  // 3. Actualizar layout.tsx: solo si es el boilerplate estándar (sin Provider, sin lógica custom)
  if (existsSync(layoutPath)) {
    const layoutContent = readFileSync(layoutPath, 'utf8');
    const hasScript = layoutContent.includes('dangerouslySetInnerHTML');
    const hasCustomLogic = layoutContent.includes('Provider') || layoutContent.includes('Context') || layoutContent.includes('useState') || layoutContent.includes('use client');
    if (!hasScript && !hasCustomLogic) {
      writeFileSync(layoutPath, layoutOneScript(), 'utf8');
    }
    // Si ya tiene script JSON-LD, o tiene lógica custom (CourseProvider, etc.) → no tocar
  } else {
    writeFileSync(layoutPath, layoutOneScript(), 'utf8');
  }

  byCat[category]++;
  modified++;
}

console.log('\n══════════════════════════════════════════════════');
if (APPLY) {
  console.log('  JSONLD BULK — CAMBIOS APLICADOS');
} else {
  console.log('  JSONLD BULK — DRY-RUN (sin cambios reales)');
}
console.log('══════════════════════════════════════════════════');
console.log(`Modificadas:  ${modified}`);
console.log(`Ya tenían:    ${skipped}`);
console.log(`Sin datos:    ${noData}`);
if (APPLY) {
  console.log('\nPor categoría:');
  for (const [cat, n] of Object.entries(byCat)) {
    if (n > 0) console.log(`  ${cat}: ${n}`);
  }
}
if (!APPLY) {
  console.log('\n⚡ Para aplicar los cambios:');
  console.log('   node scripts/add-jsonld-bulk.mjs --apply');
}
