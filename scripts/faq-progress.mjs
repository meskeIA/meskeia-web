/**
 * Estado de FAQPage por suite. Ejecutar: node scripts/faq-progress.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'fs';

// 1. Apps con FAQPage ya implementado
const withFaq = new Set();
for (const dir of readdirSync('app')) {
  const meta = `app/${dir}/metadata.ts`;
  if (existsSync(meta) && readFileSync(meta, 'utf8').includes('faqJsonLd')) {
    withFaq.add(dir);
    continue;
  }
  // Rutas dinámicas [slug]: detectar via layout.tsx con FAQPage
  const dynamicLayout = `app/${dir}/[slug]/layout.tsx`;
  if (existsSync(dynamicLayout) && readFileSync(dynamicLayout, 'utf8').includes('FAQPage')) {
    withFaq.add(dir);
  }
}

// 2. Parsear applications.ts línea a línea
const lines = readFileSync('data/applications.ts', 'utf8').split('\n');
const entries = [];

for (let i = 0; i < lines.length; i++) {
  // Buscar líneas con url: "/slug/"
  const urlMatch = lines[i].match(/url:\s*["']\/([^/"']+)\//);
  if (!urlMatch) continue;
  const slug = urlMatch[1];

  // Buscar suites en un rango ±5 líneas
  let suites = [];
  const start = Math.max(0, i - 5);
  const end = Math.min(lines.length - 1, i + 5);
  for (let j = start; j <= end; j++) {
    const sm = lines[j].match(/suites:\s*\[([^\]]+)\]/);
    if (sm) {
      suites = sm[1].match(/["']([^"']+)["']/g)?.map(s => s.replace(/["']/g, '')) ?? [];
      break;
    }
  }

  if (suites.length) entries.push({ slug, suites });
}

// 3. Agrupar por suite
const suiteMap = {};
for (const { slug, suites } of entries) {
  for (const suite of suites) {
    if (!suiteMap[suite]) suiteMap[suite] = { done: [], pending: [] };
    if (withFaq.has(slug)) suiteMap[suite].done.push(slug);
    else suiteMap[suite].pending.push(slug);
  }
}

const SUITE_NAMES = {
  finanzas:       'Finanzas e Inversión',
  'legal-fiscal': 'Legal, Fiscal y Patrimonio',
  salud:          'Salud y Bienestar',
  estudiantes:    'Estudiantes',
  productividad:  'Productividad',
  freelance:      'Freelance y Autónomo',
  cultura:        'Cultura General',
  tecnicas:       'Herramientas Técnicas',
  inmobiliaria:   'Inmobiliaria y Hogar',
  juegos:         'Juegos y Ocio',
  viajes:         'Viajes y Turismo',
  diseno:         'Diseño y Contenido',
  accesibilidad:  'Accesibilidad e Inclusión',
};

const sorted = Object.entries(suiteMap).sort((a, b) =>
  (b[1].done.length + b[1].pending.length) - (a[1].done.length + a[1].pending.length)
);

console.log('\n══════════════════════════════════════════════════════════');
console.log('  ESTADO FAQPage POR SUITE — meskeia.com');
console.log('══════════════════════════════════════════════════════════');
console.log('Suite                           Total   ✅    ⏳    %');
console.log('────────────────────────────────────────────────────────');

for (const [id, { done, pending }] of sorted) {
  const total = done.length + pending.length;
  const pct = Math.round(done.length / total * 100);
  const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
  const name = (SUITE_NAMES[id] ?? id).padEnd(31);
  console.log(`${name} ${String(total).padStart(4)}  ${String(done.length).padStart(3)}  ${String(pending.length).padStart(4)}  ${bar} ${pct}%`);
}

const totalApps = new Set(entries.map(e => e.slug)).size;
const totalDone = withFaq.size;
console.log('────────────────────────────────────────────────────────');
console.log(`Total apps únicas en catálogo:  ${totalApps}`);
console.log(`Con FAQPage: ${totalDone}  |  Sin FAQPage: ${totalApps - totalDone}`);

// Pendientes por suite
console.log('\n══════════════════════════════════════════════════════════');
console.log('  PENDIENTES POR SUITE');
console.log('══════════════════════════════════════════════════════════');
for (const [id, { done, pending }] of sorted) {
  const name = SUITE_NAMES[id] ?? id;
  if (pending.length === 0) {
    console.log(`\n✅ ${name} — COMPLETADA`);
  } else {
    console.log(`\n📋 ${name} [${done.length}/${done.length + pending.length}]`);
    pending.forEach(s => console.log(`   - ${s}`));
  }
}
