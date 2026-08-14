#!/usr/bin/env node
/**
 * check-tipos.mjs — validación de tipos que además comprueba que está mirando
 *
 * Ejecutar:  npm run check:tipos
 *            npm run check:tipos -- --autocomprobar   (verificación reforzada)
 *
 * Lo ejecuta también `npm run build` EN LOCAL. En Vercel se salta: allí el build tiene
 * `ignoreBuildErrors: true` por límite de RAM y añadir un type-check encarecería cada
 * despliegue sin aportar nada que no se pueda comprobar antes de subir.
 *
 * ── El problema que resuelve (14/08/2026) ─────────────────────────────────────
 * `npx tsc --noEmit` llevaba tiempo SIN COMPROBAR NADA, y devolviendo cero errores.
 *
 * Next escribe `.next/dev/types/routes.d.ts` y `validator.ts` de forma no atómica y sin
 * truncar: si la versión nueva es más corta que la anterior, quedan restos de la vieja
 * pegados al final. El resultado es un `.d.ts` con líneas partidas —«redes": never»— cuyos
 * cientos de errores de SINTAXIS abortan el análisis semántico de todo el proyecto.
 *
 * Y no basta con excluirlos del tsconfig: `next-env.d.ts` los IMPORTA explícitamente, así
 * que ningún `exclude` los evita. Se comprobó inyectando `const x: number = "texto"` en
 * app/: tsc devolvía 0 errores. Con `ignoreBuildErrors: true` en producción, eso dejaba el
 * proyecto sin ninguna red de tipos.
 *
 * ── Por qué no basta con limpiar ──────────────────────────────────────────────
 * Un validador que devuelve «0 errores» puede estar diciendo dos cosas muy distintas:
 * «está todo bien» o «no he mirado». Este script distingue entre las dos: si al terminar
 * quedara un solo error de sintaxis en los ficheros generados, no da por buena la
 * validación — la declara ciega y falla. Es el mismo principio que el `--autocomprobar`
 * de la Ronda.
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GENERADOS = path.join(RAIZ, '.next', 'dev', 'types');
const AUTOCOMPROBAR = process.argv.includes('--autocomprobar');

// En Vercel no se ejecuta: ver cabecera
if (process.env.VERCEL) {
  console.log('✓ tipos: omitido en Vercel (se valida en local antes de subir)');
  process.exit(0);
}

/** Ejecuta tsc y devuelve sus líneas de error, vengan de donde vengan */
function tsc() {
  try {
    execFileSync('npx', ['tsc', '--noEmit'], { cwd: RAIZ, encoding: 'utf8', stdio: 'pipe', shell: true });
    return [];
  } catch (e) {
    return String(e.stdout || '').split('\n').filter(l => l.includes('error TS'));
  }
}

const esGenerado = l => l.startsWith('.next/') || l.startsWith('.next\\');

let errores = tsc();
let limpiados = [];

// 1. Si los ficheros generados están corruptos, se borran: son regenerables y su única
//    función —tipar las rutas— ya no la cumplen cuando no parsean.
if (errores.some(esGenerado)) {
  for (const f of ['routes.d.ts', 'validator.ts', 'root-params.d.ts']) {
    const p = path.join(GENERADOS, f);
    if (fs.existsSync(p)) { fs.rmSync(p); limpiados.push(f); }
  }
  if (limpiados.length) {
    console.log(`  · ficheros generados corruptos, retirados: ${limpiados.join(', ')}`);
    console.log('    (los regenera Next en el siguiente dev/build)');
    errores = tsc();
  }
}

// 2. Si TODAVÍA quedan errores en los generados, la validación no es de fiar
const restanGenerados = errores.filter(esGenerado);
if (restanGenerados.length) {
  console.error('\n✗ TIPOS: la validación está CIEGA, no limpia.\n');
  console.error(`  Quedan ${restanGenerados.length} errores de sintaxis en ficheros generados:`);
  for (const l of restanGenerados.slice(0, 3)) console.error('    ' + l);
  console.error('\n  Mientras existan, tsc aborta el análisis del proyecto y "0 errores" NO');
  console.error('  significa que el código esté bien: significa que no se ha mirado.');
  console.error('  Borrar .next/dev/types/ a mano y repetir.\n');
  process.exit(1);
}

// 3. Verificación reforzada: ¿sabría tsc encontrar un error si lo hubiera?
if (AUTOCOMPROBAR) {
  const cebo = path.join(RAIZ, 'app', '__comprobacion-de-tipos.ts');
  fs.writeFileSync(cebo, 'export const x: number = "esto no es un número";\n', 'utf8');
  const conCebo = tsc();
  fs.rmSync(cebo);
  const cazado = conCebo.some(l => l.includes('__comprobacion-de-tipos'));
  if (!cazado) {
    console.error('\n✗ TIPOS: se ha inyectado un error a propósito y tsc NO lo ha detectado.');
    console.error('  La validación no vale nada. Revisar tsconfig.json y next-env.d.ts.\n');
    process.exit(1);
  }
  console.log('  · autocomprobación: tsc detecta un error inyectado ✓');
}

// 4. Errores reales del proyecto
const propios = errores.filter(l => !esGenerado(l));
if (propios.length) {
  console.error(`\n✗ TIPOS: ${propios.length} error(es) en el código del proyecto\n`);
  for (const l of propios.slice(0, 25)) console.error('  ' + l);
  if (propios.length > 25) console.error(`  … y ${propios.length - 25} más`);
  console.error('');
  process.exit(1);
}

console.log(`✓ tipos: 0 errores${limpiados.length ? ' (tras limpiar los generados corruptos)' : ''}`);
