/**
 * Script: probar-check-og-image.mjs  (`npm run og:probar-candado`)
 *
 * Le reinyecta a `check-og-image.mjs` los defectos REALES del 29/08/2026 y exige
 * que falle en cada uno. Un candado que nunca se ha visto fallar no es un
 * candado: es un adorno que devuelve OK.
 *
 * Los cuatro casos que debe cazar salen todos de lo que de verdad pasó:
 *   1. Una app de portal sin `images` (las 54 de Coquinum nacidas de la plantilla).
 *   2. Una app de portal con la og genérica de meskeIA (las otras 30).
 *   3. Una og servida desde meskeia.com bajo un prefijo que `next.config.ts`
 *      redirige a otro dominio — el defecto de Cronicum, reinyectado sobre
 *      Coquinum, que hoy no tiene ese redirect pero puede tenerlo mañana.
 *   4. Una og que no existe en `public/`.
 *
 * Y los dos que debe dejar pasar, que importan igual: el estado actual del
 * repositorio, y el pasivo de meskeIA (105 apps sin imagen), que avisa pero NO
 * puede romper el build.
 *
 * Cada caso muta ficheros reales y los restaura siempre, pase lo que pase.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const abs = (p) => path.join(RAIZ, p);

/** Ejecuta el candado y devuelve { codigo, salida }. */
function candado() {
  const r = spawnSync(process.execPath, [abs('scripts/check-og-image.mjs')], { encoding: 'utf8' });
  return { codigo: r.status, salida: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

/** Ejecuta `fn` con los ficheros indicados salvaguardados y los restaura siempre. */
function conRespaldo(ficheros, fn) {
  const copia = new Map();
  for (const f of ficheros) copia.set(f, fs.readFileSync(abs(f)));
  try {
    return fn();
  } finally {
    for (const [f, buf] of copia) fs.writeFileSync(abs(f), buf);
  }
}

const casos = [];
const anotar = (nombre, ok, detalle) => {
  casos.push({ nombre, ok, detalle });
  console.log(`   ${ok ? '✓' : '✗'} ${nombre}${ok ? '' : `\n       ${detalle}`}`);
};

console.log('\nProbando el candado de la tarjeta social\n');
console.log('  Debe DEJAR PASAR:');

// ── 0. Estado actual ────────────────────────────────────────────────────────
{
  const { codigo, salida } = candado();
  anotar('el repositorio tal cual está', codigo === 0, `esperaba exit 0 y ha dado ${codigo}:\n${salida}`);
  anotar(
    'el catálogo entero, ya sin pasivo',
    codigo === 0 && /todas las apps con/.test(salida),
    `esperaba el resumen del catálogo sin pasivo; exit ${codigo}`,
  );
}

// El escape, que solo sirve si de verdad deja pasar.
conRespaldo(['app/generador-anagramas/metadata.ts'], () => {
  const f = abs('app/generador-anagramas/metadata.ts');
  const t = fs.readFileSync(f, 'utf8')
    .replace(/\n\s*images: \[\{[\s\S]*?\}\]\n?(?=\s*\},)/, '\n    // og-ok: prueba del escape\n');
  fs.writeFileSync(f, t);
  const { codigo } = candado();
  anotar('una app exenta con `og-ok:`', codigo === 0, `exit ${codigo}: el escape no funciona`);
});

console.log('\n  Debe CAZAR:');

// ── 1. App de portal sin `images` ───────────────────────────────────────────
conRespaldo(['app/escandallo-food-cost/metadata.ts'], () => {
  const f = abs('app/escandallo-food-cost/metadata.ts');
  const t = fs.readFileSync(f, 'utf8').replace(/\n\s*images: \[\n[\s\S]*?\n\s*\],(?=\n\s*\},)/, '');
  fs.writeFileSync(f, t);
  const { codigo, salida } = candado();
  anotar(
    'app de Coquinum sin `images` (las 54 de la plantilla)',
    codigo === 1 && /escandallo-food-cost/.test(salida),
    `exit ${codigo}; la app no aparece entre los errores`,
  );
});

// ── 2. App de portal con la og genérica de meskeIA ──────────────────────────
conRespaldo(['app/escandallo-food-cost/metadata.ts'], () => {
  const f = abs('app/escandallo-food-cost/metadata.ts');
  const t = fs.readFileSync(f, 'utf8').replaceAll('https://meskeia.com/coquinum/og-image.png', 'https://meskeia.com/og-image.png');
  fs.writeFileSync(f, t);
  const { codigo, salida } = candado();
  anotar(
    'app de Coquinum con la og de meskeIA (las otras 30)',
    codigo === 1 && /escandallo-food-cost/.test(salida),
    `exit ${codigo}; la app no aparece entre los errores`,
  );
});

// ── 3. Un redirect se lleva la imagen por delante (el caso Cronicum) ────────
conRespaldo(['next.config.ts'], () => {
  const f = abs('next.config.ts');
  const t = fs.readFileSync(f, 'utf8').replace(
    /(\{ source: '\/cronicum\/:path\+', has,)/,
    "{ source: '/coquinum/:path+', has, destination: 'https://coquinum.com/:path+/', permanent: true },\n      $1",
  );
  fs.writeFileSync(f, t);
  const { codigo, salida } = candado();
  anotar(
    'redirect de next.config.ts que desvía la og (defecto de Cronicum)',
    codigo === 1 && /cae bajo el redirect/.test(salida),
    `exit ${codigo}; no ha detectado el desvío:\n${salida}`,
  );
});

// ── 4. Página propia de un portal sin imagen (las 20 de Delegum) ────────────
conRespaldo(['app/delegum/datos-fiscales/iva-tipos/metadata.ts'], () => {
  const f = abs('app/delegum/datos-fiscales/iva-tipos/metadata.ts');
  const t = fs.readFileSync(f, 'utf8').replace(/\n\s*images: \[\n[\s\S]*?\n\s*\],(?=\n\s*\},)/, '');
  fs.writeFileSync(f, t);
  const { codigo, salida } = candado();
  anotar(
    'página del árbol de un portal sin `images` (las 20 de Delegum)',
    codigo === 1 && /iva-tipos/.test(salida),
    `exit ${codigo}; la página no aparece entre los errores`,
  );
});

// ── 5. App corriente del catálogo sin `images` (el pasivo, ya cerrado) ──────
conRespaldo(['app/generador-anagramas/metadata.ts'], () => {
  const f = abs('app/generador-anagramas/metadata.ts');
  const t = fs.readFileSync(f, 'utf8').replace(/\n\s*images: \[\{[\s\S]*?\}\]\n?(?=\s*\},)/, '\n');
  fs.writeFileSync(f, t);
  const { codigo, salida } = candado();
  anotar(
    'app de meskeIA sin `images` (las 96 que arrastraba el catálogo)',
    codigo === 1 && /generador-anagramas/.test(salida),
    `exit ${codigo}; la app no aparece entre los errores`,
  );
});

// ── 6. La imagen no existe en public/ ───────────────────────────────────────
{
  const png = abs('public/coquinum/og-image.png');
  const escondida = `${png}.prueba`;
  fs.renameSync(png, escondida);
  try {
    const { codigo, salida } = candado();
    anotar(
      'og declarada que no existe en public/',
      codigo === 1 && /no existe en el repositorio/.test(salida),
      `exit ${codigo}; no ha detectado la imagen ausente`,
    );
  } finally {
    fs.renameSync(escondida, png);
  }
}

// ── Resultado ───────────────────────────────────────────────────────────────
const fallos = casos.filter((c) => !c.ok);
const { codigo: cierre } = candado();
if (cierre !== 0) {
  console.error('\n❌ El repositorio ha quedado en un estado sucio tras las pruebas: revisa `git status`.\n');
  process.exit(1);
}
if (fallos.length) {
  console.error(`\n❌ ${fallos.length} de ${casos.length} comprobaciones han fallado.\n`);
  process.exit(1);
}
console.log(`\n✅ El candado dispara donde debe y calla donde debe (${casos.length}/${casos.length}).\n`);
