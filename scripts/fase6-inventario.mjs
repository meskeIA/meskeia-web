/**
 * FASE 6 - paso 1: inventario actual de apps en suites cultura/estudiantes.
 * Solo lectura. No modifica nada.
 */

import { readFileSync } from 'fs';

const content = readFileSync('data/applications.ts', 'utf8');

// Cada app es una línea con `{ name: "...", suites: [...], ...`
const lineRegex = /^\s*\{\s*name:\s*"([^"]+)",\s*suites:\s*\[([^\]]*)\]/;

let total = 0;
let conCultura = 0;
let conEstudiantes = 0;
let conAmbas = 0;
let soloCultura = 0;
let soloEstudiantes = 0;

const lines = content.split('\n');
for (const line of lines) {
  const m = line.match(lineRegex);
  if (!m) continue;
  total++;
  const suites = m[2].match(/"([^"]+)"/g) || [];
  const arr = suites.map(s => s.slice(1, -1));
  const tieneCultura = arr.includes('cultura');
  const tieneEstudiantes = arr.includes('estudiantes');
  if (tieneCultura) conCultura++;
  if (tieneEstudiantes) conEstudiantes++;
  if (tieneCultura && tieneEstudiantes) conAmbas++;
  if (tieneCultura && !tieneEstudiantes) soloCultura++;
  if (!tieneCultura && tieneEstudiantes) soloEstudiantes++;
}

console.log('═══════════════════════════════════════════════');
console.log('  Inventario actual');
console.log('═══════════════════════════════════════════════');
console.log(`Total apps en applications.ts: ${total}`);
console.log(`Con suite "cultura":           ${conCultura}`);
console.log(`Con suite "estudiantes":       ${conEstudiantes}`);
console.log(`Solo cultura (sin estudiantes): ${soloCultura}`);
console.log(`Solo estudiantes (sin cultura): ${soloEstudiantes}`);
console.log(`En ambas:                       ${conAmbas}`);
console.log(`Total tocadas por una u otra:   ${conCultura + soloEstudiantes}`);
