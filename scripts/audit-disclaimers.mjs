/**
 * audit-disclaimers.mjs
 *
 * Auditoría automática del sistema de disclaimers meskeIA.
 * Detecta inconsistencias entre el nivel de riesgo esperado y el implementado.
 *
 * Uso:
 *   node scripts/audit-disclaimers.mjs
 *   node scripts/audit-disclaimers.mjs --solo-criticos
 *   node scripts/audit-disclaimers.mjs --json > informe.json
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

const soloCriticos = process.argv.includes('--solo-criticos');
const modoJSON = process.argv.includes('--json');

// ============================================================
// POLÍTICA DE NIVELES (DISCLAIMER-POLICY.md)
// ============================================================

// Nivel por defecto de cada suite
const SUITE_LEVEL = {
  inmobiliaria: 1,
  'legal-fiscal': 1,  // cualquier contenido fiscal/legal → siempre Level 1
  finanzas: 2,        // puede subir a 1 por disparadores
  salud: 2,           // puede subir a 1 por disparadores
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

// ============================================================
// EXCEPCIONES REVISADAS MANUALMENTE (DISCLAIMER-POLICY.md)
// Apps auditadas individualmente — nivel aprobado por revisión
// ============================================================

// Apps sin disclaimer (contenido informativo puro, sin riesgo)
const APPS_SIN_DISCLAIMER = new Set([
  // Cursos (/curso-*) — excluidos del patrón v2.0 (estructura propia, ver CLAUDE.md)
  'curso-emprendimiento',
  'curso-empresa-familiar',
  'curso-estrategia-empresarial',
  'curso-marketing-digital',
  'curso-negociacion',
  'curso-optimizacion-ia',
  'calculadora-cocina',       // recetas — sin implicación financiera/legal
  'calculadora-pintura',      // m² de pintura — sin consejo profesional
  'golden-hour',              // hora dorada fotográfica — herramienta creativa
  'informacion-tiempo',       // info meteorológica — sin implicaciones
  'lista-compras',            // lista de compras — sin consejo profesional
  'mi-ip',                    // muestra dirección IP — técnico puro
  'conversor-horarios',       // conversor de zonas horarias — sin consejo
  'temporizador-pomodoro',    // temporizador — sin consejo profesional
  'temporizador-visual',      // temporizador visual — herramienta accesibilidad
  'privacidad',               // página legal de privacidad — ES la info legal
]);

// Apps con nivel aprobado manualmente (distinto del cálculo automático por suites)
// Formato: slug → nivel aprobado (1-4)
const NIVEL_MANUAL = {
  // Herramientas hogar sin implicación financiera real (suite: inmobiliaria)
  'calculadora-combustible':    3,  // calculadora de coste de combustible
  'calculadora-gasto-energetico': 3, // estimador gasto energético doméstico
  'planificador-mudanzas':      3,  // planificador/checklist de mudanza
  // Herramientas financieras informativas (sin asesoramiento)
  'calculadora-suscripciones':  3,  // seguimiento de suscripciones personales
  'conversor-divisas':          3,  // conversor con tipos BCE (orientativo)
  'presupuesto-viaje':          3,  // planificador de presupuesto de viaje
  'estimador-gastos-comunidad': 2,  // estimador gastos comunidad (financiero, no fiscal)
  // Herramientas de productividad/freelance generales (sin consejo profesional)
  'lista-tareas':               3,
  'notas':                      3,
  'matriz-eisenhower':          3,
  'seguimiento-habitos':        3,
  'time-tracker':               3,
  'requisitos-nomada-digital':  3,  // info sobre visa nómada digital
  // Bienestar/salud educativa (sin orientación clínica)
  'semaforo-emocional':         3,
  'orientador-jet-lag':         3,  // recomendaciones de adaptación horaria
  'lupa-digital':               3,  // herramienta de accesibilidad visual
  // Contenido educativo (no clínico)
  'huesos-cuerpo-humano':       3,
  'simulador-genetica':         3,
  'vitaminas-minerales':        3,
  // Fiscal con datos de data/fiscal/ → Level 1 CRÍTICO (override por contenido)
  'orientador-intereses-demora': 1, // calcula intereses de demora fiscales
};

// Palabras en URL/nombre que elevan a Nivel 1 CRÍTICO
const DISPARADORES_CRITICO = [
  // Fiscal
  'irpf', 'iva', 'fiscal', 'impuesto', 'tributar', 'hacienda', 'plusvalia',
  'retencion', 'deduccion', 'cuota-autonomo', 'sociedades', 'sucesion',
  'donacion', 'herencia', 'legitima', 'tramitacion-herencia',
  // Financiero-crítico
  'jubilacion', 'pension', 'hipoteca', 'compraventa',
  // Inmobiliaria (ya es nivel 1 por suite, pero por si acaso)
  'plusvalia-municipal',
  // Salud-crítico
  'medicamento', 'tension-arterial', 'colesterol', 'osteoporosis',
  'embarazo', 'discapacidad', 'dependencia', 'fragilidad', 'percentil',
];

// Severity esperada por nivel
const SEVERITY_ESPERADA = {
  1: 'critical',
  2: 'high',
  3: 'medium',
  4: 'low',
};

// ============================================================
// PARSEO DE applications.ts
// ============================================================

function parsearApplications() {
  const contenido = fs.readFileSync(APPLICATIONS_FILE, 'utf8');
  const apps = new Map(); // url → { name, suites }

  // Regex para extraer entradas: { name: "...", suites: [...], url: "..." }
  const entryRegex = /\{\s*name:\s*"([^"]+)"[^}]*suites:\s*\[([^\]]*)\][^}]*url:\s*"([^"]+)"/gs;

  let match;
  while ((match = entryRegex.exec(contenido)) !== null) {
    const name = match[1];
    const suitesRaw = match[2];
    const url = match[3].replace(/\//g, '').trim(); // normalizar slug

    // Extraer array de suites
    const suites = [...suitesRaw.matchAll(/"([^"]+)"/g)].map(m => m[1]);

    apps.set(url, { name, suites, url });
  }

  return apps;
}

// ============================================================
// ESCANEO DE PÁGINAS
// ============================================================

function escanearApp(slug) {
  const pagePath = path.join(APP_DIR, slug, 'page.tsx');
  if (!fs.existsSync(pagePath)) return null;

  const contenido = fs.readFileSync(pagePath, 'utf8');

  // ¿Tiene DisclaimerCard?
  const tieneDisclaimer = /DisclaimerCard/.test(contenido);

  // Extraer props de DisclaimerCard (puede haber varias instancias, cogemos la primera)
  const disclaimerMatch = contenido.match(/<DisclaimerCard([^>]*(?:>(?!\/DisclaimerCard)[^>]*)*)>/s);
  const propsRaw = disclaimerMatch ? disclaimerMatch[1] : '';

  const variant = (propsRaw.match(/variant=["']([^"']+)["']/) || [])[1] || null;
  const severity = (propsRaw.match(/severity=["']([^"']+)["']/) || [])[1] || null;
  const collapsible = /collapsible(?:=\{true\})?(?!\s*=\s*\{false\})/.test(propsRaw) &&
                      !/collapsible=\{false\}/.test(propsRaw);

  // ¿Importa de data/fiscal/?
  const usaDatosFiscales = /from ['"]@\/data\/fiscal/.test(contenido);

  // ¿Tiene DataReference?
  const tieneDataReference = /DataReference/.test(contenido);

  // ¿Usa localStorage explícito en contexto de disclaimer?
  // Detecta solo si el key del DisclaimerCard context aparece en una llamada localStorage
  // (no cuenta el localStorage propio de la app para guardar datos del usuario)
  const contextMatch = propsRaw.match(/context=["']([^"']+)["']/);
  const disclaimerKey = contextMatch ? contextMatch[1] : null;
  const usaLocalStorage = tieneDisclaimer && disclaimerKey
    ? new RegExp(`localStorage[^\\n]*${disclaimerKey.replace(/-/g, '[-_]')}`).test(contenido)
    : false;

  return {
    tieneDisclaimer,
    variant,
    severity,
    collapsible,
    usaDatosFiscales,
    tieneDataReference,
    usaLocalStorage,
  };
}

// ============================================================
// CÁLCULO DE NIVEL ESPERADO
// ============================================================

function calcularNivelEsperado(slug, suites) {
  // Nivel revisado manualmente → tiene prioridad absoluta
  if (NIVEL_MANUAL[slug] !== undefined) return NIVEL_MANUAL[slug];

  // Nivel base: máximo de todas las suites
  let nivel = 4;
  for (const suite of suites) {
    const nivelSuite = SUITE_LEVEL[suite] ?? 4;
    if (nivelSuite < nivel) nivel = nivelSuite;
  }

  // Inmobiliaria o legal-fiscal → siempre 1
  if (suites.includes('inmobiliaria') || suites.includes('legal-fiscal')) nivel = 1;

  // Disparadores de crítico por nombre de slug
  const slugLower = slug.toLowerCase();
  for (const disparador of DISPARADORES_CRITICO) {
    if (slugLower.includes(disparador)) {
      nivel = 1;
      break;
    }
  }

  return nivel;
}

// ============================================================
// ANÁLISIS DE INCIDENCIAS
// ============================================================

function analizarApp(slug, appData, scan) {
  const incidencias = [];

  // App revisada manualmente sin disclaimer → sin incidencias
  if (APPS_SIN_DISCLAIMER.has(slug)) {
    return { nivel: null, incidencias };
  }

  const nivel = calcularNivelEsperado(slug, appData.suites);
  const severidadEsperada = SEVERITY_ESPERADA[nivel];

  // Sin DisclaimerCard pero debería tenerlo
  if (!scan.tieneDisclaimer) {
    if (nivel <= 2) {
      incidencias.push({
        prioridad: '🔴',
        codigo: 'SIN_DISCLAIMER_CRITICO',
        mensaje: `Sin DisclaimerCard — nivel esperado ${nivel} (${severidadEsperada})`,
      });
    } else if (nivel === 3) {
      incidencias.push({
        prioridad: '🟡',
        codigo: 'SIN_DISCLAIMER_MEDIO',
        mensaje: 'Sin DisclaimerCard — recomendado para nivel 3',
      });
    }
    return { nivel, incidencias };
  }

  // Severity incorrecta
  if (scan.severity && scan.severity !== severidadEsperada) {
    const prioridad = nivel <= 2 ? '🔴' : '🟡';
    incidencias.push({
      prioridad,
      codigo: 'SEVERITY_INCORRECTA',
      mensaje: `severity="${scan.severity}" pero esperada "${severidadEsperada}" (nivel ${nivel})`,
    });
  }

  // Severity no especificada (default "high") cuando debería ser "critical"
  if (!scan.severity && nivel === 1) {
    incidencias.push({
      prioridad: '🔴',
      codigo: 'SEVERITY_DEFAULT_EN_CRITICO',
      mensaje: 'severity no especificada (default "high") — nivel 1 requiere severity="critical"',
    });
  }

  // Colapsable cuando no debería
  if (scan.collapsible && nivel <= 2) {
    incidencias.push({
      prioridad: '🔴',
      codigo: 'COLAPSABLE_EN_NIVEL_ALTO',
      mensaje: `collapsible={true} en nivel ${nivel} — debe ser collapsible={false} o ausente`,
    });
  }

  // localStorage en nivel 3 (debería ser sessionStorage)
  if (scan.usaLocalStorage && nivel === 3) {
    incidencias.push({
      prioridad: '🟡',
      codigo: 'LOCALSTORAGE_EN_NIVEL_MEDIO',
      mensaje: 'Usa localStorage — nivel 3 requiere sessionStorage',
    });
  }

  // Datos fiscales sin DataReference
  if (scan.usaDatosFiscales && !scan.tieneDataReference) {
    incidencias.push({
      prioridad: '🟢',
      codigo: 'SIN_DATA_REFERENCE',
      mensaje: 'Importa data/fiscal pero no tiene <DataReference>',
    });
  }

  return { nivel, incidencias };
}

// ============================================================
// EJECUCIÓN PRINCIPAL
// ============================================================

function main() {
  const applications = parsearApplications();

  // Obtener todos los slugs de app/
  const slugs = fs.readdirSync(APP_DIR).filter(entry => {
    const full = path.join(APP_DIR, entry);
    return fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, 'page.tsx'));
  });

  const resultados = [];
  let totalApps = 0;
  let sinIncidencias = 0;

  for (const slug of slugs.sort()) {
    // Ignorar guías y cursos (estructura propia)
    if (slug === 'guia' || slug === 'curso' || slug.startsWith('(')) continue;

    const scan = escanearApp(slug);
    if (!scan) continue;

    totalApps++;

    // Buscar datos de la app (normalizar slug)
    const appData = applications.get(slug) ||
                    applications.get(slug.replace(/-/g, '')) ||
                    { name: slug, suites: [], url: slug };

    const { nivel, incidencias } = analizarApp(slug, appData, scan);

    if (soloCriticos && !incidencias.some(i => i.prioridad === '🔴')) continue;

    if (incidencias.length === 0) {
      sinIncidencias++;
    }

    resultados.push({
      slug,
      nombre: appData.name,
      suites: appData.suites,
      nivelEsperado: nivel,
      tieneDisclaimer: scan.tieneDisclaimer,
      variant: scan.variant,
      severity: scan.severity,
      collapsible: scan.collapsible,
      tieneDataReference: scan.tieneDataReference,
      incidencias,
    });
  }

  if (modoJSON) {
    console.log(JSON.stringify({ generado: new Date().toISOString(), totalApps, sinIncidencias, resultados }, null, 2));
    return;
  }

  // ── Informe legible ──────────────────────────────────────

  const incidenciasTotal = resultados.reduce((acc, r) => acc + r.incidencias.length, 0);
  const criticas = resultados.filter(r => r.incidencias.some(i => i.prioridad === '🔴'));
  const altas = resultados.filter(r => r.incidencias.some(i => i.prioridad === '🟡') && !r.incidencias.some(i => i.prioridad === '🔴'));
  const normales = resultados.filter(r => r.incidencias.every(i => i.prioridad === '🟢') && r.incidencias.length > 0);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  AUDITORÍA DE DISCLAIMERS — meskeIA');
  console.log(`  ${new Date().toLocaleDateString('es-ES')}  ·  Política: DISCLAIMER-POLICY.md`);
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`📊 RESUMEN`);
  console.log(`   Apps analizadas : ${totalApps}`);
  console.log(`   Sin incidencias : ${sinIncidencias}`);
  console.log(`   Con incidencias : ${incidenciasTotal > 0 ? totalApps - sinIncidencias : 0}`);
  console.log(`   🔴 Urgentes     : ${criticas.length} apps`);
  console.log(`   🟡 Altas        : ${altas.length} apps`);
  console.log(`   🟢 Normales     : ${normales.length} apps`);
  console.log();

  // ── Urgentes ──
  if (criticas.length > 0) {
    console.log('─────────────────────────────────────────────────────────');
    console.log('🔴 URGENTES — Corregir antes del próximo deploy');
    console.log('─────────────────────────────────────────────────────────');
    for (const r of criticas) {
      console.log(`\n  app/${r.slug}/`);
      console.log(`  Suite(s): [${r.suites.join(', ')}]  →  Nivel esperado: ${r.nivelEsperado}`);
      console.log(`  Actual:   variant="${r.variant}" severity="${r.severity}" collapsible=${r.collapsible}`);
      for (const inc of r.incidencias.filter(i => i.prioridad === '🔴')) {
        console.log(`  🔴 ${inc.mensaje}`);
      }
      for (const inc of r.incidencias.filter(i => i.prioridad !== '🔴')) {
        console.log(`  ${inc.prioridad} ${inc.mensaje}`);
      }
    }
    console.log();
  }

  // ── Altas ──
  if (!soloCriticos && altas.length > 0) {
    console.log('─────────────────────────────────────────────────────────');
    console.log('🟡 ALTA PRIORIDAD');
    console.log('─────────────────────────────────────────────────────────');
    for (const r of altas) {
      console.log(`\n  app/${r.slug}/`);
      console.log(`  Suite(s): [${r.suites.join(', ')}]  →  Nivel esperado: ${r.nivelEsperado}`);
      console.log(`  Actual:   variant="${r.variant}" severity="${r.severity}" collapsible=${r.collapsible}`);
      for (const inc of r.incidencias) {
        console.log(`  ${inc.prioridad} ${inc.mensaje}`);
      }
    }
    console.log();
  }

  // ── Normales ──
  if (!soloCriticos && normales.length > 0) {
    console.log('─────────────────────────────────────────────────────────');
    console.log('🟢 NORMAL — Recomendadas');
    console.log('─────────────────────────────────────────────────────────');
    for (const r of normales) {
      console.log(`\n  app/${r.slug}/`);
      for (const inc of r.incidencias) {
        console.log(`  🟢 ${inc.mensaje}`);
      }
    }
    console.log();
  }

  // ── Apps correctas ──
  if (!soloCriticos) {
    const correctas = resultados.filter(r => r.incidencias.length === 0 && r.tieneDisclaimer);
    if (correctas.length > 0) {
      console.log('─────────────────────────────────────────────────────────');
      console.log(`✅ CONFORMES CON LA POLÍTICA (${correctas.length} apps)`);
      console.log('─────────────────────────────────────────────────────────');
      console.log('  ' + correctas.map(r => r.slug).join(', '));
      console.log();
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Fin de auditoría · ${incidenciasTotal} incidencias totales`);
  if (criticas.length > 0) {
    console.log(`  ⚠️  Hay ${criticas.length} apps urgentes que requieren corrección inmediata`);
  } else {
    console.log('  ✅ No hay incidencias urgentes');
  }
  console.log('═══════════════════════════════════════════════════════════\n');
}

main();
