#!/usr/bin/env node
/**
 * Procesa el lemario de Olea (dominio público) y genera un diccionario
 * optimizado para el generador de anagramas.
 *
 * Fuente: https://github.com/olea/lemarios/blob/master/lemario-general-del-espanol.txt
 * Licencia: Dominio público
 *
 * Filtros aplicados:
 * - Sin espacios (anagramas son palabras únicas)
 * - Sin guiones, comillas o caracteres especiales
 * - Solo letras españolas (a-z, á-ú, ñ, ü)
 * - Mínimo 2 letras
 * - Deduplicado y ordenado alfabéticamente (mejor compresión gzip)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ENTRADA = path.join(ROOT, 'scripts', 'lemario-temp.txt');
const SALIDA = path.join(ROOT, 'public', 'data', 'diccionario-es.txt');

const LETRAS_VALIDAS = /^[a-záéíóúüñ]+$/;

const lineas = fs.readFileSync(ENTRADA, 'utf8').split('\n');

const palabrasSet = new Set();
let descartadasEspacios = 0;
let descartadasGuiones = 0;
let descartadasCortas = 0;
let descartadasCaracteres = 0;

for (const lineaRaw of lineas) {
  const palabra = lineaRaw.trim().toLowerCase();

  if (!palabra) continue;

  if (palabra.includes(' ')) {
    descartadasEspacios++;
    continue;
  }

  if (palabra.includes('-') || palabra.includes("'")) {
    descartadasGuiones++;
    continue;
  }

  if (palabra.length < 2) {
    descartadasCortas++;
    continue;
  }

  if (!LETRAS_VALIDAS.test(palabra)) {
    descartadasCaracteres++;
    continue;
  }

  palabrasSet.add(palabra);
}

const palabras = Array.from(palabrasSet).sort();

const dirSalida = path.dirname(SALIDA);
if (!fs.existsSync(dirSalida)) {
  fs.mkdirSync(dirSalida, { recursive: true });
}

fs.writeFileSync(SALIDA, palabras.join('\n'), 'utf8');

const tamañoBytes = fs.statSync(SALIDA).size;
const tamañoKB = (tamañoBytes / 1024).toFixed(1);

console.log('Procesamiento completo.');
console.log('---');
console.log(`Líneas leídas:           ${lineas.length}`);
console.log(`Descartadas (espacios):  ${descartadasEspacios}`);
console.log(`Descartadas (guiones):   ${descartadasGuiones}`);
console.log(`Descartadas (cortas):    ${descartadasCortas}`);
console.log(`Descartadas (caracteres): ${descartadasCaracteres}`);
console.log(`Palabras finales:        ${palabras.length}`);
console.log(`Archivo:                 ${path.relative(ROOT, SALIDA)}`);
console.log(`Tamaño:                  ${tamañoKB} KB`);
console.log('---');
console.log('Distribución por longitud:');
const porLongitud = {};
for (const p of palabras) {
  porLongitud[p.length] = (porLongitud[p.length] || 0) + 1;
}
Object.keys(porLongitud)
  .sort((a, b) => Number(a) - Number(b))
  .forEach((len) => {
    console.log(`  ${len} letras: ${porLongitud[len]}`);
  });
