/**
 * FASE 6 - paso 3: APLICA los cambios a data/applications.ts.
 * Usa la misma lógica de clasificación que fase6-clasificar.mjs.
 *
 * IMPORTANTE: este script SÍ modifica el archivo. Hace una copia de
 * seguridad mental: el git diff post-ejecución es la verificación.
 */

import { readFileSync, writeFileSync } from 'fs';

const PATH = 'data/applications.ts';
const original = readFileSync(PATH, 'utf8');

// Regex para extraer name + suites + url de una línea de app
const lineDataRegex = /\{\s*name:\s*"([^"]+)",\s*suites:\s*\[([^\]]*)\],?(?:\s*icon:\s*"[^"]*",)?\s*description:\s*"(?:[^"]|\\")*",\s*url:\s*"([^"]+)"/;

// Lógica de clasificación (idéntica a fase6-clasificar.mjs)
function clasificar(url, suitesActuales) {
  const u = url.toLowerCase();

  // ── ESTUDIANTES SOLO ─────────────────────────────────────
  if (/^\/quiz-/.test(u)) return 'estudiantes';
  if (/^\/ejercicios-/.test(u)) return 'estudiantes';
  if (/^\/calculadora-(matematica|algebra-booleana|trigonometria|geometria|estadistica|estadistica-medica|distribuciones|probabilidad|teoria-numeros|teoria-colas|sistemas-numericos|notas|movimiento|ecuaciones)/.test(u)) return 'estudiantes';
  if (/^\/glosario-(fisica-quimica|programacion)/.test(u)) return 'estudiantes';
  if (/^\/conjugador-verbos/.test(u)) return 'estudiantes';
  if (/^\/contador-silabas/.test(u)) return 'estudiantes';
  if (/^\/algebra-ecuaciones/.test(u)) return 'estudiantes';
  if (/^\/simulador-(genetica|fisica|puertas-logicas|electricidad|circuitos)/.test(u)) return 'estudiantes';
  if (/^\/tabla-periodica/.test(u)) return 'estudiantes';
  if (/^\/tablas-multiplicar/.test(u)) return 'estudiantes';
  if (/^\/inferencia-bayesiana/.test(u)) return 'estudiantes';
  if (/^\/visualizador-(transformada-fourier|topologia|grafos|inferencial|trigonometria|estructuras-datos|algoritmos)/.test(u)) return 'estudiantes';
  if (/^\/curso-(pensamiento-cientifico|redaccion-academica)/.test(u)) return 'estudiantes';

  // ── CULTURA SOLO ─────────────────────────────────────────
  if (/^\/visualizador-historia\//.test(u)) return 'cultura';
  if (/^\/visualizador-(arte-movimientos|musica-movimientos|filosofia|literatura-movimientos|arquitectura-estilos|historia-medicina|historia-internet|derechos-humanos|revoluciones-industriales)/.test(u)) return 'cultura';
  if (/^\/cifrado-(clasico|vigenere|playfair|transposicion)/.test(u)) return 'cultura';
  if (/^\/(paises-del-mundo|enchufes-por-pais|constelaciones-del-cielo|minerales-del-mundo|instrumentos-musicales|huesos-cuerpo-humano)/.test(u)) return 'cultura';
  if (/^\/guia-/.test(u)) return 'cultura';
  if (/^\/(generador-anagramas|conversor-numeros-romanos|conversor-braille|conversor-morse)/.test(u)) return 'cultura';

  // ── AMBAS (ciencia frontera + temario) ───────────────────
  if (/^\/visualizador-/.test(u)) {
    if (/(microbioma|inmunidad|vacunas|epidemiolog|cancer|diabetes|alzheimer|parkinson|inflamacion|hipertension|osteoporosis|tiroides|testosterona|sistema-linfatico|ciclo-viral|adn|genoma|polimerasa|epigenetica|evolucion|biologia)/.test(u)) return 'ambas';
    if (/(agujeros-negros|cosmologia|exoplanetas|vida-estrella|relatividad|cuantica|termodinamica(?!-quimica)|fisica)/.test(u)) return 'ambas';
    if (/(termodinamica-quimica|cinetica|electroquimica|quimica-organica)/.test(u)) return 'ambas';
    if (/(geologia|terremotos|tipos-rocas|placas-tectonicas|ciclo-(agua|nitrogeno|carbono))/.test(u)) return 'ambas';
  }

  // Sin regla: NO TOCAR
  return 'mantener';
}

let cambiosAplicados = 0;
let totalLineasApp = 0;

const lines = original.split('\n');
const newLines = lines.map(line => {
  const m = line.match(lineDataRegex);
  if (!m) return line;

  totalLineasApp++;
  const [, , suitesStr, url] = m;
  const suitesActuales = (suitesStr.match(/"([^"]+)"/g) || []).map(s => s.slice(1, -1));

  const tieneCultura = suitesActuales.includes('cultura');
  const tieneEstudiantes = suitesActuales.includes('estudiantes');
  if (!tieneCultura && !tieneEstudiantes) return line;

  const decision = clasificar(url, suitesActuales);
  const otras = suitesActuales.filter(s => s !== 'cultura' && s !== 'estudiantes');

  let suitesNuevas;
  if (decision === 'estudiantes') {
    suitesNuevas = ['estudiantes', ...otras];
  } else if (decision === 'cultura') {
    suitesNuevas = ['cultura', ...otras];
  } else if (decision === 'ambas') {
    suitesNuevas = ['cultura', 'estudiantes', ...otras];
  } else {
    return line; // 'mantener': no tocar
  }

  // Si las suites resultantes son las mismas (mismo set), no cambiar
  const antesSet = [...suitesActuales].sort().join(',');
  const despuesSet = [...suitesNuevas].sort().join(',');
  if (antesSet === despuesSet) return line;

  cambiosAplicados++;

  // Reordenar para mantener un orden consistente: cultura/estudiantes primero (alfabético), luego el resto
  const orden = [];
  if (suitesNuevas.includes('cultura')) orden.push('cultura');
  if (suitesNuevas.includes('estudiantes')) orden.push('estudiantes');
  for (const s of suitesNuevas) {
    if (s !== 'cultura' && s !== 'estudiantes' && !orden.includes(s)) orden.push(s);
  }

  const nuevoArray = orden.map(s => `"${s}"`).join(', ');
  const nuevaSuitesStr = `suites: [${nuevoArray}]`;
  const nuevaLinea = line.replace(/suites:\s*\[[^\]]*\]/, nuevaSuitesStr);
  return nuevaLinea;
});

// Verificar integridad
const before = original.match(/^\s*\{\s*name:\s*"/gm)?.length || 0;
const newContent = newLines.join('\n');
const after = newContent.match(/^\s*\{\s*name:\s*"/gm)?.length || 0;

console.log(`Líneas con apps detectadas: ${totalLineasApp}`);
console.log(`Integridad: ${before} entradas antes, ${after} después`);

if (before !== after) {
  console.error('❌ ALERTA: el número de entradas cambió. NO escribiendo.');
  process.exit(1);
}

if (cambiosAplicados === 0) {
  console.log('Sin cambios que aplicar. Saliendo.');
  process.exit(0);
}

writeFileSync(PATH, newContent);
console.log(`✅ Aplicados ${cambiosAplicados} cambios en ${PATH}`);
