/**
 * Script para añadir RelatedApps a todas las apps que lo necesitan
 */

const fs = require('fs');
const path = require('path');

// Apps que necesitan actualización (de app-relations.ts)
const appsToUpdate = [
  'algebra-ecuaciones', 'amortizacion-hipoteca', 'analizador-densidad-seo', 'analizador-geo',
  'analizador-titulos-seo', 'calculadora-algebra-abstracta', 'calculadora-alquiler-vs-compra',
  'calculadora-aspectos', 'calculadora-break-even', 'calculadora-calculo', 'calculadora-calorias-ejercicio',
  'calculadora-cocina', 'calculadora-combustible', 'calculadora-descuentos', 'calculadora-electricidad',
  'calculadora-estadistica', 'calculadora-fechas', 'calculadora-gasto-energetico', 'calculadora-geometria',
  'calculadora-hidratacion', 'calculadora-inflacion', 'calculadora-inversiones', 'calculadora-iva',
  'calculadora-jubilacion', 'calculadora-legibilidad', 'calculadora-matematica', 'calculadora-mcd-mcm',
  'calculadora-movimiento', 'calculadora-percentiles', 'calculadora-pintura', 'calculadora-plusvalias-irpf',
  'calculadora-porcentajes', 'calculadora-porciones', 'calculadora-probabilidad', 'calculadora-propinas',
  'calculadora-regla-de-tres', 'calculadora-roi-marketing', 'calculadora-roommates', 'calculadora-sueno',
  'calculadora-suscripciones', 'calculadora-tarifa-freelance', 'calculadora-teoria-colas',
  'calculadora-teoria-numeros', 'calculadora-tiempo-lectura', 'calculadora-tir-van', 'calculadora-trigonometria',
  'cifrado-aes', 'cifrado-clasico', 'cifrado-playfair', 'cifrado-transposicion', 'cifrado-vigenere',
  'codificador-base64', 'comparador-textos', 'compresor-imagenes', 'contador-palabras', 'contador-silabas',
  'contraste-colores', 'control-gastos', 'conversor-base64', 'conversor-binario', 'conversor-braille',
  'conversor-colores', 'conversor-horarios', 'conversor-imagenes', 'conversor-markdown-html', 'conversor-morse',
  'conversor-numeros-romanos', 'conversor-tallas', 'conversor-texto', 'conversor-unidades', 'creador-paletas',
  'creador-thumbnails', 'cronometro', 'detector-idioma', 'editor-exif', 'generador-actas', 'generador-anagramas',
  'generador-carruseles', 'generador-codigos-barras', 'generador-contrasenas', 'generador-facturas',
  'generador-firma-email', 'generador-gradientes', 'generador-hashes', 'generador-hashtags', 'generador-iconos',
  'generador-lorem-ipsum', 'generador-loteria', 'generador-meta-descripciones', 'generador-nombres-empresa',
  'generador-ondas', 'generador-palabras-clave', 'generador-qr', 'generador-schema-markup', 'generador-sombras',
  'generador-tipografias', 'generador-utm', 'glosario-fisica-quimica', 'guia-cuidado-mascota',
  'guia-tramitacion-herencias', 'herencias-paso-a-paso', 'informacion-tiempo', 'interes-compuesto',
  'juego-2048', 'juego-asteroids', 'juego-memoria', 'juego-piedra-papel-tijera', 'juego-platform-runner',
  'juego-puzzle-matematico', 'juego-space-invaders', 'juego-sudoku', 'juego-tres-en-raya', 'juego-wordle',
  'limpiador-texto', 'lista-compras', 'lista-equipaje', 'lista-tareas', 'mi-ip', 'notas', 'planificador-boda',
  'planificador-cashflow', 'planificador-embarazo', 'planificador-menu', 'prueba-camara', 'prueba-microfono',
  'radio-meskeia', 'recortador-audio', 'ruleta-aleatoria', 'seguimiento-habitos', 'simulador-gastos-deducibles',
  'simulador-hipoteca', 'simulador-irpf', 'simulador-prestamos', 'tabla-periodica', 'test-habitos',
  'test-perfil-inversor', 'test-velocidad-escritura', 'time-tracker', 'validador-json', 'validador-regex'
];

let updated = 0;
let skipped = 0;
let notFound = 0;

appsToUpdate.forEach(app => {
  const filePath = path.join(__dirname, '..', 'app', app, 'page.tsx');

  if (!fs.existsSync(filePath)) {
    console.log(`NOT FOUND: ${app}`);
    notFound++;
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Skip if already has RelatedApps
  if (content.includes('RelatedApps')) {
    console.log(`SKIP (already has): ${app}`);
    skipped++;
    return;
  }

  // Pattern 1: import { MeskeiaLogo, Footer, ... } from '@/components';
  const barrelImportRegex = /import\s*\{([^}]+)\}\s*from\s*['"]@\/components['"];/;
  const barrelMatch = content.match(barrelImportRegex);

  if (barrelMatch) {
    const imports = barrelMatch[1];
    if (!imports.includes('RelatedApps')) {
      const newImports = imports.trimEnd() + ', RelatedApps';
      content = content.replace(barrelImportRegex, `import {${newImports}} from '@/components';`);
    }
  } else {
    // Pattern 2: Separate imports - add after Footer import
    const footerImportRegex = /import Footer from ['"]@\/components\/Footer['"];/;
    if (footerImportRegex.test(content)) {
      content = content.replace(
        footerImportRegex,
        `import Footer from '@/components/Footer';\nimport { RelatedApps } from '@/components';`
      );
    } else {
      // Pattern 3: Look for any @/components import and add RelatedApps
      const anyComponentImport = /import\s+.*from\s+['"]@\/components.*['"];/;
      const match = content.match(anyComponentImport);
      if (match) {
        content = content.replace(
          match[0],
          match[0] + `\nimport { RelatedApps } from '@/components';`
        );
      }
    }
  }

  // Add getRelatedApps import if not present
  if (!content.includes('getRelatedApps')) {
    // Find where to insert - after the last import
    const lines = content.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, `import { getRelatedApps } from '@/data/app-relations';`);
      content = lines.join('\n');
    }
  }

  // Add RelatedApps component before Footer
  const footerRegex = /(\s*)(<Footer\s+appName=["']([^"']+)["']\s*\/>)/;
  const footerMatch = content.match(footerRegex);

  if (footerMatch) {
    const indent = footerMatch[1];
    const footer = footerMatch[2];
    const appName = footerMatch[3];
    content = content.replace(
      footerRegex,
      `${indent}<RelatedApps apps={getRelatedApps('${appName}')} />${indent}${footer}`
    );
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`UPDATED: ${app}`);
  updated++;
});

console.log('\n=== RESUMEN ===');
console.log(`Actualizadas: ${updated}`);
console.log(`Ya tenían RelatedApps: ${skipped}`);
console.log(`No encontradas: ${notFound}`);
console.log(`Total procesadas: ${appsToUpdate.length}`);
