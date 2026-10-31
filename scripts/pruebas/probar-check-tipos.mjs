#!/usr/bin/env node
/**
 * probar-check-tipos.mjs — la trampa de `check:tipos`
 *
 * Ejecutar:  npm run tipos:probar-candado      (~30 s: tsc con poca memoria hasta que cae)
 *
 * Un candado se prueba REINYECTÁNDOLE su caso de origen y exigiendo que falle
 * ([[project_test_juicio_baseline]]).
 *
 *   1. EL CASO DE ORIGEN (31/10/2026, cabo C0537): tsc se queda sin memoria y aborta sin una
 *      sola línea «error TS». Del 25 al 31/10 eso salía como «✓ tipos: 0 errores». Se
 *      reproduce dándole 512 MB, que no le llegan ni para cargar el programa: el candado tiene
 *      que FALLAR diciendo que la validación está ciega, y no dar el verde.
 *
 * El caso «el código de hoy calla» no está aquí: es el propio `npm run build`, que lo ejecuta.
 */

import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CANDADO = path.join(RAIZ, 'scripts/check-tipos.mjs');

const casos = [
  {
    nombre: '1-origen-tsc-sin-memoria',
    env: { TIPOS_MEMORIA_MB: '512' },
    espera: 'la validación está CIEGA',
  },
];

let fallos = 0;
console.log('\nTrampas de check:tipos\n');
for (const caso of casos) {
  const r = spawnSync(process.execPath, [CANDADO], {
    cwd: RAIZ,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 8 * 60 * 1000,
    env: { ...process.env, ...caso.env },
  });
  const salida = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  const falla = r.status !== 0;
  if (falla && salida.includes(caso.espera) && !salida.includes('✓ tipos')) {
    console.log(`  ✓ ${caso.nombre} — falla, y por lo que debe`);
  } else {
    fallos++;
    console.log(`  ✗ ${caso.nombre} — ${falla ? 'falla, pero no por lo que debe' : 'CALLA: el candado da verde sin haber mirado'}`);
    console.log(salida.trim().split('\n').slice(-8).map((l) => `      ${l}`).join('\n'));
  }
}
console.log(fallos ? `\n✗ ${fallos} trampa(s) sin cumplir\n` : '\n✓ la trampa se cumple\n');
process.exit(fallos ? 1 : 0);
