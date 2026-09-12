#!/usr/bin/env node
/**
 * Script: probar-check-minimo.mjs  (`npm run minimo:probar-candado`)
 *
 * Le reinyecta a `check-minimo-irpf.mjs` los defectos REALES del 12/09/2026 y exige que
 * falle en cada uno. Un candado que nunca se ha visto fallar no es un candado: es un adorno
 * que devuelve OK.
 *
 * Dos mitades, y las dos importan igual:
 *   · `scripts/pruebas/minimo-irpf.tsx` — seis formas del defecto copiadas del código tal y
 *     como estaba, y siete que deben pasar (el método correcto, la reducción del art. 84.2,
 *     el slug de Delegum y el escape).
 *   · El repositorio entero — que después de la reparación tiene que estar en CERO, porque
 *     es la condición que permite a este candado romper el build en vez de solo avisar.
 *
 * Y un tercer caso, el que de verdad demuestra que el candado mira: reinyectar el defecto en
 * un fichero de producción —`lib/calculadoras/sueldoNeto.ts`— y comprobar que el barrido del
 * repositorio, el mismo que ejecuta `npm run build`, lo caza. El fichero se restaura siempre.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const abs = (p) => path.join(RAIZ, p);
const CANDADO = abs('scripts/check-minimo-irpf.mjs');

/** Ejecuta el candado (sobre los ficheros dados, o sobre todo el repo) y devuelve su salida. */
function candado(...ficheros) {
  const r = spawnSync(process.execPath, [CANDADO, ...ficheros], { encoding: 'utf8' });
  return { codigo: r.status, salida: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

const casos = [];
const anotar = (nombre, ok, detalle = '') => casos.push({ nombre, ok, detalle });

// ── 1. Los seis defectos del fichero de pruebas, uno a uno ────────────────────

const FIXTURE = 'scripts/pruebas/minimo-irpf.tsx';
const { codigo, salida } = candado(abs(FIXTURE));

const lineas = fs.readFileSync(abs(FIXTURE), 'utf8').split('\n');
const lineaDe = (fragmento) => {
  const i = lineas.findIndex((l) => l.includes(fragmento));
  return i === -1 ? null : i + 1;
};

anotar('el fichero de pruebas hace fallar al candado', codigo === 1, `código ${codigo}`);

const DEBEN_CAZARSE = [
  ['1 · constante canónica directa', 'baseImponible - MINIMOS_IRPF_2025.personal'],
  ['2 · variable camelCase', 'baseImponible - minimoPersonal'],
  ['3 · constante en MAYÚSCULAS', 'rendimientoNetoReducido - MINIMO_PERSONAL'],
  ['4 · mínimos familiares en plural', 'baseImponibleGeneral - minimosPersonalesFamiliares'],
  ['5 · sin Math.max alrededor', 'baseGeneralBruta - minimoPorEdad'],
  ['6 · dentro de la llamada, sin variable', 'rendimientoNeto - MINIMOS_IRPF_2025.personal'],
];

for (const [nombre, fragmento] of DEBEN_CAZARSE) {
  const n = lineaDe(fragmento);
  anotar(`caza ${nombre}`, n !== null && salida.includes(`:${n}\n`), n === null ? 'fragmento no hallado' : `línea ${n}`);
}

const DEBEN_PASAR = [
  ['7 · función canónica', 'return calcularCuotaIntegraGeneral(baseLiquidableGeneral, minimo);'],
  ['8 · resta entre cuotas', 'Math.max(0, cuotaEscala - cuotaMinimo)'],
  ['9 · reducción del art. 84.2', 'REDUCCION_TRIBUTACION_CONJUNTA_2025.biparental'],
  ['10 · Math.min para acotar', 'Math.min(minimoPersonalFamiliar, base)'],
  ['11 · slug en cadena simple', "'https://delegum.com/datos-fiscales/irpf-tramos-minimos/'"],
  ['12 · slug en atributo JSX', 'data-slug="irpf-tramos-minimos"'],
  ['13 · escape minimo-ok', 'baseImponible - minimoRaro'],
];

for (const [nombre, fragmento] of DEBEN_PASAR) {
  const n = lineaDe(fragmento);
  anotar(`deja pasar ${nombre}`, n !== null && !salida.includes(`:${n}\n`), n === null ? 'fragmento no hallado' : `línea ${n}`);
}

// Y que no cace nada MÁS de lo esperado, que es como un candado se vuelve insufrible.
const cazadas = [...salida.matchAll(/minimo-irpf\.tsx:(\d+)/g)].map((m) => Number(m[1]));
anotar('no caza nada de más', cazadas.length === DEBEN_CAZARSE.length, `${cazadas.length} de ${DEBEN_CAZARSE.length}`);

// ── 2. El repositorio, que tiene que estar a cero ─────────────────────────────

const limpio = candado();
anotar('el repositorio está en cero', limpio.codigo === 0, limpio.salida.trim().split('\n')[0] ?? '');

// ── 3. El defecto reinyectado en producción, cazado por el barrido del build ──

const VICTIMA = 'lib/calculadoras/sueldoNeto.ts';
const original = fs.readFileSync(abs(VICTIMA));
try {
  const roto = original
    .toString('utf8')
    .replace(
      'const cuotaIntegra = calcularCuotaIntegraGeneral(baseLiquidableGeneral, minimoPersonalFamiliar);',
      'const cuotaIntegra = cuotaEscalaGeneral(Math.max(0, baseLiquidableGeneral - minimoPersonalFamiliar));'
    );
  if (roto === original.toString('utf8')) {
    anotar('el defecto se pudo reinyectar en producción', false, `no se encontró la línea en ${VICTIMA}`);
  } else {
    fs.writeFileSync(abs(VICTIMA), roto);
    const conDefecto = candado();
    anotar(
      'el barrido del repositorio caza el defecto reinyectado en producción',
      conDefecto.codigo === 1 && conDefecto.salida.includes(VICTIMA),
      `código ${conDefecto.codigo}`
    );
  }
} finally {
  fs.writeFileSync(abs(VICTIMA), original);
}

const traRestaurar = candado();
anotar('el repositorio queda restaurado', traRestaurar.codigo === 0, `código ${traRestaurar.codigo}`);

// ── Resultado ─────────────────────────────────────────────────────────────────

let fallos = 0;
for (const c of casos) {
  if (!c.ok) fallos++;
  console.log(`  ${c.ok ? '✓' : '✗'} ${c.nombre}${c.detalle ? `  (${c.detalle})` : ''}`);
}

if (fallos > 0) {
  console.error(`\n✗ candado del mínimo: ${fallos} de ${casos.length} comprobaciones fallan\n`);
  process.exit(1);
}
console.log(`\n✓ candado del mínimo: ${casos.length} comprobaciones en verde\n`);
