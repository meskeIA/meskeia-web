/**
 * add-level3-disclaimers.mjs
 *
 * Añade DisclaimerCard (Level 3 MEDIO, collapsible) a las 46 apps
 * que no lo tienen todavía según la auditoría.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const APP_DIR = path.join(ROOT, 'app');

// Mapping: slug → variant (general | educational | technical | medical)
const APP_VARIANT = {
  // Marketing / SEO
  'analizador-densidad-seo':       'technical',
  'analizador-titulos-seo':        'technical',
  'generador-meta-descripciones':  'technical',
  'generador-og-images':           'technical',
  'generador-palabras-clave':      'technical',
  'generador-schema-markup':       'technical',
  'generador-utm':                 'technical',
  'generador-hashtags':            'general',
  'generador-carruseles':          'general',
  'generador-firma-email':         'general',
  'analizador-geo':                'technical',
  // Productividad / Texto
  'calculadora-legibilidad':       'general',
  'calculadora-tiempo-lectura':    'general',
  'comparador-textos':             'general',
  'contador-palabras':             'general',
  'conversor-texto':               'general',
  'detector-idioma':               'general',
  'limpiador-texto':               'general',
  'generador-lorem-ipsum':         'general',
  'generador-actas':               'general',
  // Calculadoras generales
  'calculadora-fechas':            'general',
  'calculadora-porcentajes':       'general',
  'calculadora-regla-de-tres':     'general',
  'contador-manual':               'general',
  // Conversores
  'conversor-braille':             'educational',
  'conversor-formatos':            'technical',
  'conversor-imagenes':            'technical',
  'conversor-morse':               'educational',
  'conversor-tallas':              'general',
  'conversor-unidades':            'general',
  'enchufes-por-pais':             'general',
  // Herramientas técnicas / diseño
  'contraste-colores':             'technical',
  'creador-thumbnails':            'technical',
  'generador-codigos-barras':      'technical',
  'generador-qr':                  'technical',
  'extractor-audio-video':         'technical',
  'recortador-audio':              'technical',
  // Viajes / listas
  'checklist-documentos-viaje':    'general',
  'lista-equipaje':                'general',
  'planificador-itinerario':       'general',
  'enchufes-por-pais':             'general',
  // Productividad laboral
  'planificador-turnos':           'general',
  'cronometro':                    'general',
  // Educativo / Info
  'paises-del-mundo':              'educational',
  'test-madurez-digital':          'educational',
  'test-velocidad-escritura':      'general',
  // Legal / reclamaciones
  'asistente-reclamaciones':       'general',
};

let fixedCount = 0;
let errors = [];

for (const [slug, variant] of Object.entries(APP_VARIANT)) {
  const filePath = path.join(APP_DIR, slug, 'page.tsx');
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  No encontrado: ${slug}`);
    continue;
  }

  let c = fs.readFileSync(filePath, 'utf8');

  // Skip si ya tiene DisclaimerCard
  if (c.includes('<DisclaimerCard')) {
    console.log(`⏭️  Ya tiene DisclaimerCard: ${slug}`);
    continue;
  }

  // ─── 1. Añadir DisclaimerCard al import de @/components ───
  // Caso A: import multilínea  {  ...  } from '@/components'
  if (/import \{[^}]+\} from '@\/components'/s.test(c)) {
    c = c.replace(
      /(import \{[^}]+)(} from '@\/components')/s,
      (match, imports, end) => imports + '  DisclaimerCard,\n' + end
    );
  }
  // Caso B: imports individuales — añadir línea después del último import de @/components
  else if (c.includes("from '@/components'")) {
    const lastIdx = c.lastIndexOf("from '@/components'");
    const lineEnd = c.indexOf('\n', lastIdx);
    c = c.slice(0, lineEnd + 1) +
        `import { DisclaimerCard } from '@/components';\n` +
        c.slice(lineEnd + 1);
  }

  // ─── 2. Añadir <DisclaimerCard> JSX después de <LegalNotice /> ───
  const disclaimerJSX = `\n\n      <DisclaimerCard\n        variant="${variant}"\n        severity="medium"\n        collapsible={true}\n        context="${slug}-disclaimer"\n      />`;

  if (c.includes('      <LegalNotice />')) {
    c = c.replace('      <LegalNotice />', `      <LegalNotice />${disclaimerJSX}`);
  } else if (c.includes('<LegalNotice />')) {
    // Indentación diferente — usar la que haya
    c = c.replace('<LegalNotice />', `<LegalNotice />${disclaimerJSX}`);
  } else {
    console.warn(`  ⚠️  No encontrado <LegalNotice /> en ${slug}`);
    errors.push(slug);
    continue;
  }

  fs.writeFileSync(filePath, c);
  fixedCount++;
  console.log(`✅ ${slug} (${variant})`);
}

console.log(`\nTotal: ${fixedCount} apps actualizadas`);
if (errors.length > 0) {
  console.log(`Errores: ${errors.join(', ')}`);
}
