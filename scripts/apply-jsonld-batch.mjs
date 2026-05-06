import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const apps = [
  "guia-comprar-casa","guia-invertir","curso-nutrisalud","calculadora-movimiento",
  "contraste-colores","generador-gradientes","simulador-fisica","calculadora-electricidad",
  "calculadora-fechas","calculadora-iva","amortizacion-hipoteca","analizador-espectro",
  "enchufes-por-pais","contador-palabras","glosario-fisica-quimica","guia-freelance",
  "seguimiento-habitos","calculadora-aspectos","conversor-colores","estimador-cartera-inversion",
  "vitaminas-minerales","conversor-horarios","curso-pensamiento-sistemico","estimador-prestamos",
  "inferencia-bayesiana","calculadora-suscripciones","conversor-unidades","generador-contrasenas",
  "calculadora-algebra-booleana","curso-marketing-digital","glosario-programacion",
  "calculadora-descuentos","calculadora-trigonometria","conversor-formatos","ejercicios-vocalizacion",
  "informacion-tiempo","juego-wordle","planificador-rutinas","calculadora-distribuciones",
  "calculadora-gasto-energetico","calculadora-matematica","calculadora-porcentajes",
  "curso-decisiones-inversion","generador-codigos-barras","presupuesto-viaje",
  "visualizador-estructuras-datos","calculadora-calorias-ejercicio","calculadora-estadistica-medica",
  "comparador-formas-juridicas","conversor-binario",
];

function getCategory(slug) {
  // Financiero: cálculos con dinero, IRPF, hipotecas, préstamos
  if (/^(estimador-|amortizacion-|presupuesto-|simulador-cartera|simulador-hipoteca)/.test(slug)) return 'FinanceApplication';
  if (/^calculadora-(iva|hipoteca|prestamo|inversion|coste-vivienda|aspectos|jubilacion|freelance|tarifa|descuentos|suscripciones)/.test(slug)) return 'FinanceApplication';

  // Educativos: cursos, simuladores, glosarios, calculadoras académicas, juegos educativos
  if (/^(curso-|glosario-|simulador-|visualizador-|juego-|ejercicios-|guia-)/.test(slug)) return 'EducationalApplication';
  if (/^calculadora-(movimiento|electricidad|algebra|trigonometria|distribuciones|matematica|porcentajes|estadistica|geometria|calorias|gasto-energetico)/.test(slug)) return 'EducationalApplication';
  if (/^(vitaminas-|inferencia-)/.test(slug)) return 'EducationalApplication';

  // Salud
  if (/^(seguimiento-|planificador-|orientador-)/.test(slug)) return 'UtilityApplication';

  // Utilidades por defecto: conversores, generadores, contraste, comparadores, info
  return 'UtilityApplication';
}

function getFolderPath(slug) {
  if (slug.startsWith('guia-')) {
    return `app/guia/${slug.substring(5)}`;
  }
  return `app/${slug}`;
}

function pageHasMultipleStates(slug) {
  // Apps que tienen layout.tsx existentes (suficiente para inyectar JSON-LD ahí)
  return existsSync(`${getFolderPath(slug)}/layout.tsx`);
}

function extractStringField(content, fieldName) {
  // Match: title: 'X' o title: "X" o title: `X`
  const regex = new RegExp(`\\b${fieldName}:\\s*(['"\`])((?:\\\\.|(?!\\1).)*)\\1`, 's');
  const match = content.match(regex);
  if (!match) return null;
  return match[2].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, ' ').trim();
}

function buildJsonLdBlock(slug, title, description, category) {
  // Limpiar el title si tiene "| meskeIA"
  const cleanTitle = title ? title.replace(/\s*\|\s*meskeIA.*$/i, '').replace(/\s*-\s*meskeIA.*$/i, '').trim() : slug;
  const url = slug.startsWith('guia-')
    ? `https://meskeia.com/guia/${slug.substring(5)}/`
    : `https://meskeia.com/${slug}/`;

  const desc = description || `Herramienta gratuita de meskeIA: ${cleanTitle}`;

  // Features genéricos pero válidos
  const features = [
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ];

  return `
export const jsonLd = generateWebAppSchema({
  name: ${JSON.stringify(cleanTitle)},
  description: ${JSON.stringify(desc)},
  url: '${url}',
  category: '${category}',
  features: ${JSON.stringify(features, null, 4).replace(/^/gm, '  ').trim()},
});
`;
}

function processMetadata(slug) {
  const path = `${getFolderPath(slug)}/metadata.ts`;
  if (!existsSync(path)) {
    return { slug, status: 'skip-no-metadata' };
  }
  let content = readFileSync(path, 'utf8');

  // Si ya tiene jsonLd, saltar
  if (content.includes('export const jsonLd') || content.includes('generateWebAppSchema')) {
    return { slug, status: 'skip-already-has-jsonld' };
  }

  const title = extractStringField(content, 'title');
  const description = extractStringField(content, 'description');
  const category = getCategory(slug);

  // Añadir import si no existe
  if (!content.includes("from '@/lib/schema-templates'")) {
    content = content.replace(
      /(import\s+\{[^}]*\}\s+from\s+'next';?\s*\n)/,
      `$1import { generateWebAppSchema } from '@/lib/schema-templates';\n`
    );
  }

  // Añadir el bloque jsonLd al final
  content = content.trimEnd() + '\n' + buildJsonLdBlock(slug, title, description, category);

  writeFileSync(path, content);
  return { slug, status: 'metadata-updated', category, title: title?.slice(0, 60) };
}

function processLayout(slug) {
  const path = `${getFolderPath(slug)}/layout.tsx`;
  const standardLayout = `import { jsonLd } from './metadata';

export { metadata } from './metadata';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
`;

  if (!existsSync(path)) {
    // Crear nuevo layout
    writeFileSync(path, standardLayout);
    return { slug, layout: 'created' };
  }

  let content = readFileSync(path, 'utf8');

  // Si ya tiene jsonLd, skip
  if (content.includes("import { jsonLd }")) {
    return { slug, layout: 'already-has-jsonld' };
  }

  // Caso: layout passthrough simple
  const isSimplePassthrough = /^\s*export\s*\{\s*metadata\s*\}\s*from\s*'\.\/metadata';\s*\n+\s*export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{\s*return\s*<>\{children\}<\/>;?\s*\}\s*$/m.test(content);

  if (isSimplePassthrough) {
    writeFileSync(path, standardLayout);
    return { slug, layout: 'replaced-passthrough' };
  }

  // Caso: layout con CourseProvider u otro wrapper
  if (content.includes('CourseProvider')) {
    // Insertar import jsonLd
    if (!content.includes("import { jsonLd }")) {
      content = content.replace(
        /import\s*\{\s*CourseProvider\s*\}\s*from\s*'\.\/CourseContext';/,
        `import { CourseProvider } from './CourseContext';\nimport { jsonLd } from './metadata';`
      );
    }
    // Envolver el return con script + fragment
    content = content.replace(
      /return\s*<CourseProvider>\{children\}<\/CourseProvider>;/,
      `return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CourseProvider>{children}</CourseProvider>
    </>
  );`
    );
    writeFileSync(path, content);
    return { slug, layout: 'updated-courseprovider' };
  }

  return { slug, layout: 'manual-needed', content: content.slice(0, 200) };
}

const summary = { ok: [], errors: [], manual: [] };

for (const slug of apps) {
  const m = processMetadata(slug);
  const l = processLayout(slug);
  const log = `${slug}: meta=${m.status} | layout=${l.layout}`;
  if (m.status === 'metadata-updated' && (l.layout === 'created' || l.layout === 'replaced-passthrough' || l.layout === 'updated-courseprovider' || l.layout === 'already-has-jsonld')) {
    summary.ok.push({ slug, ...m, ...l });
    console.log('✓ ' + log);
  } else if (l.layout === 'manual-needed') {
    summary.manual.push({ slug, ...m, ...l });
    console.log('⚠ ' + log + ' [MANUAL]');
  } else {
    summary.errors.push({ slug, ...m, ...l });
    console.log('✗ ' + log);
  }
}

console.log(`\nResumen: ${summary.ok.length} OK | ${summary.errors.length} errores | ${summary.manual.length} manual`);
if (summary.manual.length > 0) {
  console.log('\nApps que necesitan revisión manual:');
  summary.manual.forEach(a => console.log(`  - ${a.slug}: ${a.content?.slice(0, 100)}`));
}
