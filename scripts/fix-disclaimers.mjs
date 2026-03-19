/**
 * fix-disclaimers.mjs
 *
 * Corrección automática de incidencias de disclaimers meskeIA.
 * Aplica fixes mecánicos en apps que ya tienen DisclaimerCard.
 *
 * Uso:
 *   node scripts/fix-disclaimers.mjs --dry-run   (simular sin escribir)
 *   node scripts/fix-disclaimers.mjs             (aplicar cambios reales)
 *
 * Referencia: DISCLAIMER-POLICY.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const APP_DIR = path.join(ROOT, 'app');
const APPLICATIONS_FILE = path.join(ROOT, 'data', 'applications.ts');

const DRY_RUN = process.argv.includes('--dry-run');

if (DRY_RUN) {
  console.log('\n⚠️  MODO DRY-RUN — No se escribirá ningún archivo\n');
}

// ============================================================
// POLÍTICA (igual que audit-disclaimers.mjs)
// ============================================================

const SUITE_LEVEL = {
  inmobiliaria: 1,
  finanzas: 2,
  salud: 2,
  freelance: 2,
  marketing: 3,
  productividad: 3,
  estudiantes: 4,
  tecnicas: 4,
  diseno: 4,
  juegos: 4,
  cultura: 4,
  accesibilidad: 3,
  viajes: 3,
};

const DISPARADORES_CRITICO = [
  'irpf', 'iva', 'fiscal', 'impuesto', 'tributar', 'hacienda', 'plusvalia',
  'retencion', 'deduccion', 'cuota-autonomo', 'sociedades', 'sucesion',
  'donacion', 'herencia', 'legitima', 'tramitacion-herencia',
  'jubilacion', 'pension', 'hipoteca', 'compraventa', 'plusvalia-municipal',
  'medicamento', 'tension-arterial', 'colesterol', 'osteoporosis',
  'embarazo', 'discapacidad', 'dependencia', 'fragilidad', 'percentil',
];

const SEVERITY_ESPERADA = { 1: 'critical', 2: 'high', 3: 'medium', 4: 'low' };

// ============================================================
// HELPERS
// ============================================================

function parsearApplications() {
  const contenido = fs.readFileSync(APPLICATIONS_FILE, 'utf8');
  const apps = new Map();
  const entryRegex = /\{\s*name:\s*"([^"]+)"[^}]*suites:\s*\[([^\]]*)\][^}]*url:\s*"([^"]+)"/gs;
  let match;
  while ((match = entryRegex.exec(contenido)) !== null) {
    const url = match[3].replace(/\//g, '').trim();
    const suites = [...match[2].matchAll(/"([^"]+)"/g)].map(m => m[1]);
    apps.set(url, { name: match[1], suites });
  }
  return apps;
}

function calcularNivel(slug, suites) {
  let nivel = 4;
  for (const suite of suites) {
    const n = SUITE_LEVEL[suite] ?? 4;
    if (n < nivel) nivel = n;
  }
  if (suites.includes('inmobiliaria')) nivel = 1;
  const slugLower = slug.toLowerCase();
  for (const d of DISPARADORES_CRITICO) {
    if (slugLower.includes(d)) { nivel = 1; break; }
  }
  return nivel;
}

// ============================================================
// FUNCIÓN DE FIX POR ARCHIVO
// ============================================================

/**
 * Aplica correcciones sobre el contenido de un page.tsx.
 * Retorna { contenidoNuevo, cambios[] } o null si no hay cambios.
 */
function aplicarFixes(slug, contenidoOriginal, nivel) {
  let contenido = contenidoOriginal;
  const cambios = [];
  const severidadEsperada = SEVERITY_ESPERADA[nivel];

  // ── Solo actuar si hay DisclaimerCard ──
  if (!/<DisclaimerCard/.test(contenido)) return null;

  // ──────────────────────────────────────────────────────────
  // FIX 1: collapsible={true} → collapsible={false}
  //         en apps de nivel 1 o 2
  // ──────────────────────────────────────────────────────────
  if (nivel <= 2 && /collapsible=\{true\}/.test(contenido)) {
    contenido = contenido.replace(/collapsible=\{true\}/g, 'collapsible={false}');
    cambios.push('collapsible={true} → collapsible={false}');
  }

  // Eliminar prop `collapsible` standalone (sin valor, que en JSX implica true)
  // Solo si está en contexto de DisclaimerCard y nivel <= 2
  if (nivel <= 2) {
    // Buscar "collapsible" sin "={false}" ni "={true}" dentro de <DisclaimerCard...>
    const dcBlockRegex = /(<DisclaimerCard[^>]*?)(\s+collapsible(?!=))([^>]*>)/g;
    const nuevo = contenido.replace(dcBlockRegex, (_, antes, _colapsible, despues) => {
      cambios.push('prop collapsible standalone eliminada');
      return `${antes}${despues}`;
    });
    if (nuevo !== contenido) contenido = nuevo;
  }

  // ──────────────────────────────────────────────────────────
  // FIX 2: severity incorrecta → corregir valor
  // ──────────────────────────────────────────────────────────
  const severidadActualMatch = contenido.match(/severity=["']([^"']+)["']/);
  const severidadActual = severidadActualMatch ? severidadActualMatch[1] : null;

  // Orden de severidad (de menor a mayor)
  const ORDEN = ['low', 'medium', 'high', 'critical'];
  const nivelActual = ORDEN.indexOf(severidadActual);
  const nivelEsperado = ORDEN.indexOf(severidadEsperada);

  // Solo corregir si la severidad actual es MENOR que la esperada (nunca rebajar)
  if (severidadActual && nivelActual < nivelEsperado) {
    const antes = contenido;
    contenido = contenido.replace(
      /(<DisclaimerCard[\s\S]*?)(severity=["'])([^"']+)(["'])/,
      (_, pre, inicio, _val, cierre) => `${pre}${inicio}${severidadEsperada}${cierre}`
    );
    if (contenido !== antes) {
      cambios.push(`severity="${severidadActual}" → severity="${severidadEsperada}"`);
    }
  }

  // ──────────────────────────────────────────────────────────
  // FIX 3: Sin prop severity → inyectar dentro del bloque <DisclaimerCard>
  //         Solo dentro de la etiqueta de apertura de DisclaimerCard,
  //         no en otros componentes con prop variant (ej: ResultCard)
  // ──────────────────────────────────────────────────────────
  if (!severidadActual && nivel <= 2) {
    const antes = contenido;
    // Buscar el bloque <DisclaimerCard ... > completo y añadir severity dentro
    contenido = contenido.replace(
      /(<DisclaimerCard\b[^>]*?)(variant=["'][^"']+["'])/,
      `$1$2\n        severity="${severidadEsperada}"`
    );
    if (contenido !== antes) {
      cambios.push(`severity="${severidadEsperada}" añadida (faltaba)`);
    }
  }

  if (cambios.length === 0) return null;
  return { contenidoNuevo: contenido, cambios };
}

// ============================================================
// EJECUCIÓN PRINCIPAL
// ============================================================

function main() {
  const applications = parsearApplications();

  const slugs = fs.readdirSync(APP_DIR)
    .filter(entry => {
      const full = path.join(APP_DIR, entry);
      return fs.statSync(full).isDirectory() &&
             fs.existsSync(path.join(full, 'page.tsx')) &&
             entry !== 'guia' && entry !== 'curso' && !entry.startsWith('(');
    })
    .sort();

  const stats = {
    analizadas: 0,
    modificadas: 0,
    sinDisclaimerCard: [],
    errores: [],
  };

  const cambiosPorTipo = {};

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  FIX DISCLAIMERS — meskeIA');
  console.log(`  ${new Date().toLocaleDateString('es-ES')}${DRY_RUN ? '  ·  DRY-RUN' : ''}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  for (const slug of slugs) {
    stats.analizadas++;
    const pagePath = path.join(APP_DIR, slug, 'page.tsx');

    let contenido;
    try {
      contenido = fs.readFileSync(pagePath, 'utf8');
    } catch {
      stats.errores.push(slug);
      continue;
    }

    // Apps sin DisclaimerCard → registrar y saltar
    if (!/<DisclaimerCard/.test(contenido)) {
      const appData = applications.get(slug) || { suites: [] };
      const nivel = calcularNivel(slug, appData.suites);
      if (nivel <= 2) {
        stats.sinDisclaimerCard.push({ slug, nivel });
      }
      continue;
    }

    const appData = applications.get(slug) || { suites: [] };
    const nivel = calcularNivel(slug, appData.suites);

    const resultado = aplicarFixes(slug, contenido, nivel);
    if (!resultado) continue;

    const { contenidoNuevo, cambios } = resultado;

    // Registrar cambios por tipo
    for (const cambio of cambios) {
      cambiosPorTipo[cambio] = (cambiosPorTipo[cambio] || 0) + 1;
    }

    console.log(`  ✏️  app/${slug}/`);
    for (const c of cambios) console.log(`       → ${c}`);

    if (!DRY_RUN) {
      try {
        fs.writeFileSync(pagePath, contenidoNuevo, 'utf8');
      } catch (err) {
        console.log(`       ⚠️  Error al escribir: ${err.message}`);
        stats.errores.push(slug);
        continue;
      }
    }

    stats.modificadas++;
  }

  // ── Resumen ──────────────────────────────────────────────

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  RESUMEN');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Apps analizadas  : ${stats.analizadas}`);
  console.log(`  Apps ${DRY_RUN ? 'a modificar' : 'modificadas'}  : ${stats.modificadas}`);

  if (Object.keys(cambiosPorTipo).length > 0) {
    console.log('\n  Tipos de cambio aplicados:');
    for (const [tipo, count] of Object.entries(cambiosPorTipo)) {
      console.log(`    · ${tipo}: ${count} apps`);
    }
  }

  if (stats.sinDisclaimerCard.length > 0) {
    console.log(`\n  ⚠️  Apps SIN DisclaimerCard que lo requieren (${stats.sinDisclaimerCard.length}):`);
    console.log('  (Requieren revisión manual — no se modifican automáticamente)\n');
    const porNivel = { 1: [], 2: [] };
    for (const { slug, nivel } of stats.sinDisclaimerCard) {
      if (porNivel[nivel]) porNivel[nivel].push(slug);
    }
    if (porNivel[1].length > 0) {
      console.log(`  Nivel 1 CRÍTICO (${porNivel[1].length} apps):`);
      for (const s of porNivel[1]) console.log(`    - app/${s}/`);
    }
    if (porNivel[2].length > 0) {
      console.log(`\n  Nivel 2 ALTO (${porNivel[2].length} apps):`);
      for (const s of porNivel[2]) console.log(`    - app/${s}/`);
    }
  }

  if (stats.errores.length > 0) {
    console.log(`\n  ❌ Errores (${stats.errores.length}): ${stats.errores.join(', ')}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  if (DRY_RUN) {
    console.log('  Dry-run completado. Ejecuta sin --dry-run para aplicar cambios.');
  } else {
    console.log('  Correcciones aplicadas. Ejecuta npm run build para verificar.');
  }
  console.log('═══════════════════════════════════════════════════════════\n');
}

main();
