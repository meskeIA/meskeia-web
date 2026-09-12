#!/usr/bin/env node
/**
 * Script: probar-check-hidratacion.mjs  (`npm run hidratacion:probar-candado`)
 *
 * Le reinyecta a `check-hidratacion-tests.mjs` las siembras a mano REALES que tenían los diez
 * specs antes del 12/09/2026 y exige que falle en cada una. Un candado que nunca se ha visto
 * fallar no es un candado: es un adorno que devuelve OK.
 *
 * Tres mitades, y las tres importan igual:
 *   · `scripts/pruebas/hidratacion-tests.ts` — cuatro formas de la siembra copiadas de los
 *     specs tal y como estaban, y cinco que deben pasar (el helper, un fill() con testigo,
 *     una lectura, el escape y otro prototipo).
 *   · El árbol de pruebas entero — que después de la migración tiene que estar en CERO, que es
 *     la condición que permite a este candado romper el build en vez de solo avisar.
 *   · El defecto reinyectado en un spec de verdad —`tests/apps/simulador-vsepr.spec.ts`, el
 *     caso que destapó todo esto—, para comprobar que el barrido que ejecuta `npm run build`
 *     lo caza donde de verdad puede aparecer. El fichero se restaura siempre.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const abs = (p) => path.join(RAIZ, p);
const CANDADO = abs('scripts/check-hidratacion-tests.mjs');

/** Ejecuta el candado (sobre los ficheros dados, o sobre todo el árbol) y devuelve su salida. */
function candado(...ficheros) {
  const r = spawnSync(process.execPath, [CANDADO, ...ficheros], { encoding: 'utf8' });
  return { codigo: r.status, salida: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

const casos = [];
const anotar = (nombre, ok, detalle = '') => casos.push({ nombre, ok, detalle });

// ── 1. Las cuatro siembras del fichero de pruebas, una a una ──────────────────

const FIXTURE = 'scripts/pruebas/hidratacion-tests.ts';
const { codigo, salida } = candado(abs(FIXTURE));

const lineas = fs.readFileSync(abs(FIXTURE), 'utf8').split('\n');
const lineaDe = (fragmento) => {
  const i = lineas.findIndex((l) => l.includes(fragmento));
  return i === -1 ? null : i + 1;
};

anotar('el fichero de pruebas hace fallar al candado', codigo === 1, `código ${codigo}`);

const DEBEN_CAZARSE = [
  ['1 · descriptor partido en tres líneas', '      window.HTMLInputElement.prototype,'],
  ['2 · descriptor en una sola línea', "Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;"],
  ['3 · con espacios alrededor del punto', 'window . HTMLInputElement . prototype'],
  ['4 · el prototipo guardado en una variable', 'const proto = window.HTMLInputElement.prototype;'],
];

for (const [nombre, fragmento] of DEBEN_CAZARSE) {
  const n = lineaDe(fragmento);
  anotar(
    `caza ${nombre}`,
    n !== null && salida.includes(`:${n}\n`),
    n === null ? 'fragmento no hallado' : `línea ${n}`,
  );
}

const DEBEN_PASAR = [
  ['5 · el helper', "await sembrarValor(page, '#slider-enlaces', 2);"],
  ['6 · fill() con testigo de estado', "await esperarValorEnReact(page, campo, '12,5');"],
  ['7 · leer el valor no es sembrarlo', 'return page.locator(`#${id}`).inputValue();'],
  ['8 · el escape hidratacion-ok', '// hidratacion-ok: caso de prueba del propio candado'],
  ['9 · otro prototipo', 'window.HTMLSelectElement.prototype'],
];

for (const [nombre, fragmento] of DEBEN_PASAR) {
  const n = lineaDe(fragmento);
  anotar(
    `deja pasar ${nombre}`,
    n !== null && !salida.includes(`:${n}\n`),
    n === null ? 'fragmento no hallado' : `línea ${n}`,
  );
}

// Y que no cace nada MÁS de lo esperado, que es como un candado se vuelve insufrible.
const cazadas = [...salida.matchAll(/hidratacion-tests\.ts:(\d+)/g)].map((m) => Number(m[1]));
anotar(
  'no caza nada de más',
  cazadas.length === DEBEN_CAZARSE.length,
  `${cazadas.length} de ${DEBEN_CAZARSE.length}`,
);

// ── 2. El árbol de pruebas, que tiene que estar a cero ────────────────────────

const limpio = candado();
anotar('el árbol de pruebas está en cero', limpio.codigo === 0, limpio.salida.trim().split('\n')[0] ?? '');

// ── 3. La siembra reinyectada en un spec real, cazada por el barrido del build ─

const VICTIMA = 'tests/apps/simulador-vsepr.spec.ts';
const original = fs.readFileSync(abs(VICTIMA));
try {
  const roto = original
    .toString('utf8')
    .replace(
      'await sembrarValor(page, `#${id}`, valor);',
      'await page.evaluate(({ id, valor }) => {\n' +
        '    const el = document.getElementById(id) as HTMLInputElement;\n' +
        "    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;\n" +
        '    setter.call(el, String(valor));\n' +
        "    el.dispatchEvent(new Event('input', { bubbles: true }));\n" +
        '  }, { id, valor });',
    );
  if (roto === original.toString('utf8')) {
    anotar('la siembra se pudo reinyectar en un spec', false, `no se encontró la línea en ${VICTIMA}`);
  } else {
    fs.writeFileSync(abs(VICTIMA), roto);
    const conDefecto = candado();
    anotar(
      'el barrido del árbol caza la siembra reinyectada en un spec',
      conDefecto.codigo === 1 && conDefecto.salida.includes(VICTIMA),
      `código ${conDefecto.codigo}`,
    );
  }
} finally {
  fs.writeFileSync(abs(VICTIMA), original);
}

const traRestaurar = candado();
anotar('el árbol queda restaurado', traRestaurar.codigo === 0, `código ${traRestaurar.codigo}`);

// ── Resultado ─────────────────────────────────────────────────────────────────

let fallos = 0;
for (const c of casos) {
  if (!c.ok) fallos++;
  console.log(`  ${c.ok ? '✓' : '✗'} ${c.nombre}${c.detalle ? `  (${c.detalle})` : ''}`);
}

if (fallos > 0) {
  console.error(`\n✗ candado de hidratación: ${fallos} de ${casos.length} comprobaciones fallan\n`);
  process.exit(1);
}
console.log(`\n✓ candado de hidratación: ${casos.length} comprobaciones en verde\n`);
