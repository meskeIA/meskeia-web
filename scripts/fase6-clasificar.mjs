/**
 * FASE 6 - paso 2: clasificar apps según criterio Estudiantes/Cultura/Ambas.
 * Solo ANALIZA y propone cambios. No modifica nada todavía.
 */

import { readFileSync } from 'fs';

const content = readFileSync('data/applications.ts', 'utf8');
const allLineRegex = /^\s*\{\s*name:\s*"([^"]+)",\s*suites:\s*\[([^\]]*)\],?(?:\s*icon:\s*"[^"]*",)?\s*description:\s*"([^"]*(?:\\"[^"]*)*)",\s*url:\s*"([^"]+)"/;

const apps = [];
const lines = content.split('\n');
for (const line of lines) {
  const m = line.match(allLineRegex);
  if (!m) continue;
  const [, name, suitesStr, description, url] = m;
  const suites = (suitesStr.match(/"([^"]+)"/g) || []).map(s => s.slice(1, -1));
  apps.push({ name, suites, description, url });
}

function clasificar(app) {
  const url = app.url.toLowerCase();

  // ── ESTUDIANTES SOLO ─────────────────────────────────────
  if (/^\/quiz-/.test(url)) return { destino: 'estudiantes', motivo: 'quiz curricular' };
  if (/^\/ejercicios-/.test(url)) return { destino: 'estudiantes', motivo: 'ejercicio práctico' };

  if (/^\/calculadora-(matematica|algebra-booleana|trigonometria|geometria|estadistica|estadistica-medica|distribuciones|probabilidad|teoria-numeros|teoria-colas|sistemas-numericos|notas|movimiento|ecuaciones)/.test(url)) {
    return { destino: 'estudiantes', motivo: 'calculadora académica' };
  }

  if (/^\/glosario-(fisica-quimica|programacion)/.test(url)) {
    return { destino: 'estudiantes', motivo: 'glosario académico' };
  }
  if (/^\/conjugador-verbos/.test(url)) return { destino: 'estudiantes', motivo: 'lengua escolar' };
  if (/^\/contador-silabas/.test(url)) return { destino: 'estudiantes', motivo: 'lengua escolar' };
  if (/^\/algebra-ecuaciones/.test(url)) return { destino: 'estudiantes', motivo: 'mat. escolar' };

  if (/^\/simulador-(genetica|fisica|puertas-logicas|electricidad|circuitos)/.test(url)) {
    return { destino: 'estudiantes', motivo: 'simulador académico' };
  }

  if (/^\/tabla-periodica/.test(url)) return { destino: 'estudiantes', motivo: 'temario química' };
  if (/^\/tablas-multiplicar/.test(url)) return { destino: 'estudiantes', motivo: 'temario primaria' };
  if (/^\/inferencia-bayesiana/.test(url)) return { destino: 'estudiantes', motivo: 'mat. avanzada' };

  if (/^\/visualizador-(transformada-fourier|topologia|grafos|inferencial|trigonometria|estructuras-datos|algoritmos)/.test(url)) {
    return { destino: 'estudiantes', motivo: 'matemáticas/CS universidad' };
  }

  if (/^\/curso-(pensamiento-cientifico|redaccion-academica)/.test(url)) {
    return { destino: 'estudiantes', motivo: 'curso académico' };
  }

  // ── CULTURA SOLO ─────────────────────────────────────────
  if (/^\/visualizador-historia\//.test(url)) return { destino: 'cultura', motivo: 'cronología histórica' };
  if (/^\/visualizador-(arte-movimientos|musica-movimientos|filosofia|literatura-movimientos|arquitectura-estilos|historia-medicina|historia-internet|derechos-humanos|revoluciones-industriales)/.test(url)) {
    return { destino: 'cultura', motivo: 'cronología cultural' };
  }

  if (/^\/cifrado-(clasico|vigenere|playfair|transposicion)/.test(url)) {
    return { destino: 'cultura', motivo: 'criptografía clásica/divulgación' };
  }

  if (/^\/(paises-del-mundo|enchufes-por-pais|constelaciones-del-cielo|minerales-del-mundo|instrumentos-musicales|huesos-cuerpo-humano)/.test(url)) {
    return { destino: 'cultura', motivo: 'referencia/divulgación' };
  }

  if (/^\/guia-/.test(url)) return { destino: 'cultura', motivo: 'guía directorio divulgativa' };

  if (/^\/(generador-anagramas|conversor-numeros-romanos|conversor-braille|conversor-morse)/.test(url)) {
    return { destino: 'cultura', motivo: 'curiosidad lingüística' };
  }

  // ── AMBAS (ciencia frontera + temario) ───────────────────
  if (/^\/visualizador-/.test(url)) {
    if (/(microbioma|inmunidad|vacunas|epidemiolog|cancer|diabetes|alzheimer|parkinson|inflamacion|hipertension|osteoporosis|tiroides|testosterona|sistema-linfatico|ciclo-viral|adn|genoma|polimerasa|epigenetica|evolucion|biologia)/.test(url)) {
      return { destino: 'ambas', motivo: 'biología frontera' };
    }
    if (/(agujeros-negros|cosmologia|exoplanetas|vida-estrella|relatividad|cuantica|termodinamica(?!-quimica)|fisica)/.test(url)) {
      return { destino: 'ambas', motivo: 'física frontera' };
    }
    if (/(termodinamica-quimica|cinetica|electroquimica|quimica-organica)/.test(url)) {
      return { destino: 'ambas', motivo: 'química universidad' };
    }
    if (/(geologia|terremotos|tipos-rocas|placas-tectonicas|ciclo-(agua|nitrogeno|carbono))/.test(url)) {
      return { destino: 'ambas', motivo: 'geología/medio ambiente' };
    }
    if (app.suites.includes('cultura') && app.suites.includes('estudiantes')) {
      return { destino: 'ambas', motivo: 'visualizador genérico (mantener ambas)' };
    }
  }

  if (/^\/curso-(pensamiento-sistemico|optimizacion-ia|nutrisalud|negociacion|criptografia-seguridad|emprendimiento|estrategia-empresarial|empresa-familiar|decisiones-inversion|teoria-politica|marketing-digital)/.test(url)) {
    if (app.suites.includes('cultura') && app.suites.includes('estudiantes')) {
      return { destino: 'ambas', motivo: 'curso (mantener ambas)' };
    }
  }

  // ── SIN REGLA: NO TOCAR (mantener exactamente como está)
  return { destino: 'mantener', motivo: 'sin regla, no tocar' };
}

const cambios = [];
const sinCambio = [];

for (const app of apps) {
  const tieneCultura = app.suites.includes('cultura');
  const tieneEstudiantes = app.suites.includes('estudiantes');
  if (!tieneCultura && !tieneEstudiantes) continue;

  const result = clasificar(app);
  const otras = app.suites.filter(s => s !== 'cultura' && s !== 'estudiantes');
  let finales;

  if (result.destino === 'estudiantes') {
    finales = ['estudiantes', ...otras];
  } else if (result.destino === 'cultura') {
    finales = ['cultura', ...otras];
  } else if (result.destino === 'ambas') {
    finales = ['cultura', 'estudiantes', ...otras];
  } else {
    // 'mantener' o 'ninguna': no tocar
    finales = [...app.suites];
  }

  const antesSet = [...app.suites].sort().join(',');
  const despuesSet = [...finales].sort().join(',');

  if (antesSet === despuesSet) {
    sinCambio.push(app.url);
  } else {
    cambios.push({
      url: app.url,
      name: app.name,
      antes: app.suites,
      despues: finales,
      motivo: result.motivo,
    });
  }
}

console.log('═══════════════════════════════════════════════');
console.log('  Análisis de reclasificación FASE 6');
console.log('═══════════════════════════════════════════════\n');
console.log(`Total apps tocadas (cultura o estudiantes): ${cambios.length + sinCambio.length}`);
console.log(`Sin cambios:                                ${sinCambio.length}`);
console.log(`Con cambios propuestos:                     ${cambios.length}\n`);

const aEstudiantesOnly = cambios.filter(c => c.despues.includes('estudiantes') && !c.despues.includes('cultura'));
const aCulturaOnly = cambios.filter(c => c.despues.includes('cultura') && !c.despues.includes('estudiantes'));
const aAmbas = cambios.filter(c => c.despues.includes('cultura') && c.despues.includes('estudiantes'));

console.log(`→ A solo "estudiantes":  ${aEstudiantesOnly.length} apps`);
console.log(`→ A solo "cultura":      ${aCulturaOnly.length} apps`);
console.log(`→ A "ambas":             ${aAmbas.length} apps (añade la suite que faltaba)`);

console.log('\n═══════════════════════════════════════════════');
console.log('  A "estudiantes" únicamente');
console.log('═══════════════════════════════════════════════');
aEstudiantesOnly.forEach(c => console.log(`  ${c.url.padEnd(55)} | ${c.motivo}`));

console.log('\n═══════════════════════════════════════════════');
console.log('  A "cultura" únicamente');
console.log('═══════════════════════════════════════════════');
aCulturaOnly.forEach(c => console.log(`  ${c.url.padEnd(55)} | ${c.motivo}`));

if (aAmbas.length > 0) {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  A "ambas" (añade la suite que faltaba)');
  console.log('═══════════════════════════════════════════════');
  aAmbas.forEach(c => console.log(`  ${c.url.padEnd(55)} | antes: [${c.antes.filter(s => s === 'cultura' || s === 'estudiantes').join(',')}] → motivo: ${c.motivo}`));
}

// Recuento final
const futuroSoloEst = cambios.filter(c => c.despues.includes('estudiantes') && !c.despues.includes('cultura')).length
                    + sinCambio.filter(u => {
                      const a = apps.find(a => a.url === u);
                      return a && a.suites.includes('estudiantes') && !a.suites.includes('cultura');
                    }).length;
const futuroSoloCult = cambios.filter(c => c.despues.includes('cultura') && !c.despues.includes('estudiantes')).length
                    + sinCambio.filter(u => {
                      const a = apps.find(a => a.url === u);
                      return a && a.suites.includes('cultura') && !a.suites.includes('estudiantes');
                    }).length;
const futuroAmbas = cambios.filter(c => c.despues.includes('cultura') && c.despues.includes('estudiantes')).length
                  + sinCambio.filter(u => {
                    const a = apps.find(a => a.url === u);
                    return a && a.suites.includes('cultura') && a.suites.includes('estudiantes');
                  }).length;

console.log('\n═══════════════════════════════════════════════');
console.log('  Distribución FUTURA (si se aplican los cambios)');
console.log('═══════════════════════════════════════════════');
console.log(`Solo estudiantes: ${futuroSoloEst}  (antes: 91)`);
console.log(`Solo cultura:     ${futuroSoloCult}  (antes: 127)`);
console.log(`Ambas:            ${futuroAmbas}  (antes: 296)`);
console.log(`Total estudiantes: ${futuroSoloEst + futuroAmbas}  (antes: 387)`);
console.log(`Total cultura:     ${futuroSoloCult + futuroAmbas}  (antes: 423)`);
