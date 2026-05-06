/**
 * FASE 1+2: transformación de data/applications.ts
 *
 * Cambios:
 *  - "marketing"   → "diseno"  (con dedup si ya tenía "diseno")
 *  - "jubilacion"  → "legal-fiscal" (con dedup si ya tenía "legal-fiscal")
 *  - eliminar campo contexts: [...] de cada app
 */

import { readFileSync, writeFileSync } from 'fs';

const PATH = 'data/applications.ts';
const original = readFileSync(PATH, 'utf8');

let stats = {
  marketingChanged: 0,
  jubilacionChanged: 0,
  duplicatesAfterMarketing: 0,
  duplicatesAfterJubilacion: 0,
  contextsRemoved: 0,
  totalLines: 0,
};

const lines = original.split('\n');

const transformed = lines.map((line) => {
  // Solo procesar líneas que tengan { name: ... y sean entradas de app
  if (!line.includes('{ name:') && !line.includes('suites:')) {
    return line;
  }

  let newLine = line;

  // 1. Renombrar marketing → diseno dentro del array suites
  if (newLine.includes('"marketing"')) {
    newLine = newLine.replace(/"marketing"/g, '"diseno"');
    stats.marketingChanged++;
    // Dedup: si ahora hay "diseno" más de una vez en la lista de suites
    const suitesMatch = newLine.match(/suites:\s*\[([^\]]+)\]/);
    if (suitesMatch) {
      const arr = suitesMatch[1].split(',').map(s => s.trim());
      const seen = new Set();
      const dedup = [];
      for (const item of arr) {
        if (!seen.has(item)) {
          seen.add(item);
          dedup.push(item);
        }
      }
      if (dedup.length !== arr.length) {
        stats.duplicatesAfterMarketing++;
        newLine = newLine.replace(/suites:\s*\[[^\]]+\]/, `suites: [${dedup.join(', ')}]`);
      }
    }
  }

  // 2. Renombrar jubilacion → legal-fiscal
  if (newLine.includes('"jubilacion"')) {
    newLine = newLine.replace(/"jubilacion"/g, '"legal-fiscal"');
    stats.jubilacionChanged++;
    const suitesMatch = newLine.match(/suites:\s*\[([^\]]+)\]/);
    if (suitesMatch) {
      const arr = suitesMatch[1].split(',').map(s => s.trim());
      const seen = new Set();
      const dedup = [];
      for (const item of arr) {
        if (!seen.has(item)) {
          seen.add(item);
          dedup.push(item);
        }
      }
      if (dedup.length !== arr.length) {
        stats.duplicatesAfterJubilacion++;
        newLine = newLine.replace(/suites:\s*\[[^\]]+\]/, `suites: [${dedup.join(', ')}]`);
      }
    }
  }

  // 3. Eliminar contexts: [...] del campo (con la coma que le sigue)
  // Patrón: contexts: ["x", "y"], (con su coma final, o sin ella si es el último)
  if (/contexts:\s*\[[^\]]*\]\s*,?/.test(newLine)) {
    newLine = newLine.replace(/contexts:\s*\[[^\]]*\]\s*,\s*/g, '');
    // Si quedó sin coma final (caso raro de contexts al final del objeto), limpiar
    newLine = newLine.replace(/contexts:\s*\[[^\]]*\]\s*/g, '');
    stats.contextsRemoved++;
  }

  return newLine;
});

const result = transformed.join('\n');

// Verificar que no se rompió nada obvio
const before = original.match(/\{\s*name:/g)?.length || 0;
const after = result.match(/\{\s*name:/g)?.length || 0;
console.log(`\nIntegridad: ${before} entradas antes, ${after} después.`);

if (before !== after) {
  console.error('❌ ALERTA: el número de entradas cambió. Abortando sin escribir.');
  process.exit(1);
}

// Verificación post: ¿quedan referencias a marketing/jubilacion/contexts?
const remainsMarketing = (result.match(/"marketing"/g) || []).length;
const remainsJubilacion = (result.match(/"jubilacion"/g) || []).length;
const remainsContexts = (result.match(/contexts:\s*\[/g) || []).length;
console.log(`Referencias restantes: marketing=${remainsMarketing}, jubilacion=${remainsJubilacion}, contexts=${remainsContexts}`);

if (remainsMarketing > 0 || remainsJubilacion > 0 || remainsContexts > 0) {
  console.error('❌ ALERTA: quedan referencias después del transform. Inspeccionar antes de aplicar.');
  process.exit(1);
}

writeFileSync(PATH, result);

console.log('\n✅ Transformaciones aplicadas:');
console.log(`   marketing → diseno:        ${stats.marketingChanged} apps`);
console.log(`     ├─ duplicados depurados: ${stats.duplicatesAfterMarketing}`);
console.log(`   jubilacion → legal-fiscal: ${stats.jubilacionChanged} apps`);
console.log(`     ├─ duplicados depurados: ${stats.duplicatesAfterJubilacion}`);
console.log(`   contexts eliminados:       ${stats.contextsRemoved} apps`);
