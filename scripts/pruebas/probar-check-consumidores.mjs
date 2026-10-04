#!/usr/bin/env node
/**
 * probar-check-consumidores.mjs — le reinyecta a `check:consumidores` los casos de los que nació
 *
 * Ejecutar:  npm run consumidores:probar-candado   (con `-- --ver`, enseña la salida de cada caso)
 *
 * Un candado que nunca se ha visto fallar no ha demostrado nada. Cada caso altera una COPIA de
 * los ficheros de `data/` en un directorio temporal (no toca el repositorio), ejecuta el candado
 * con `--raiz` sobre ella y exige el veredicto esperado:
 *
 *   0. LA COPIA SIN TOCAR — el caso sano. NO debe fallar: comprueba además que `--raiz` lee la
 *      copia y no el repositorio, sin lo cual todos los casos siguientes pasarían por error.
 *   1. EL CATÁLOGO PASA A SER DERIVADO — es el 28/07/2026: el export sigue existiendo, pero ya no
 *      contiene literales que leer, y los consumidores se quedaron mudos. Aquí le pasa a
 *      COQUINUM_APPS, que pasa a derivarse de un array base. FALLA.
 *   2. UNA SOLA ENTRADA CON OTRO FORMATO — el parser saca 144 de 145. Es el que un umbral no ve,
 *      y por eso el candado exige igualdad exacta. FALLA.
 *   3. EL NOMBRE SE LEE COMO RUTA — es S0154 (20/09/2026): el parser no reconoce el `name:` y cae
 *      al fallback `|| url` sin dar error. Aquí, con un nombre entre backticks. FALLA.
 *   4. UNA URL CON COMILLAS SIMPLES — la app desaparece del catálogo que leen semilla-diaria y el
 *      pool de «Apps del día». FALLA.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CANDADO = path.join(RAIZ, 'scripts/check-consumidores.mjs');
const FICHEROS = [
  'data/stemum.ts',
  'data/coquinum.ts',
  'data/delegum/soluciones.ts',
  'data/implemented-apps.ts',
  'data/applications.ts',
  'data/suites.ts',
  'data/guides-journey.ts',
];

/** Sustituye exactamente una vez; si el texto no está, la prueba se ha quedado vieja. */
function sustituir(txt, viejo, nuevo, donde) {
  if (!txt.includes(viejo)) throw new Error(`La prueba ya no encuentra «${viejo.slice(0, 50)}» en ${donde}: actualízala.`);
  return txt.replace(viejo, nuevo);
}

const CASOS = [
  { n: 0, nombre: 'la copia sin tocar (el caso sano)', debeFallar: false },
  {
    n: 1,
    nombre: 'COQUINUM_APPS pasa a ser DERIVADO (el 28/07/2026)',
    fichero: 'data/coquinum.ts',
    alterar: (t) => {
      const base = sustituir(t, 'export const COQUINUM_APPS: CoquinumApp[] = [', 'const COQUINUM_APPS_BASE: CoquinumApp[] = [', 'coquinum.ts');
      const cierre = base.indexOf('\n];', base.indexOf('const COQUINUM_APPS_BASE')) + 3;
      return `${base.slice(0, cierre)}\nexport const COQUINUM_APPS: CoquinumApp[] = COQUINUM_APPS_BASE.map((a) => a);${base.slice(cierre)}`;
    },
    debeFallar: true,
    esperado: /\[COQUINUM_APPS\]/,
  },
  {
    n: 2,
    nombre: 'UNA sola entrada de STEMUM_APPS con comillas dobles',
    fichero: 'data/stemum.ts',
    alterar: (t) => sustituir(t, "slug: 'visualizador-algoritmos',", 'slug: "visualizador-algoritmos",', 'stemum.ts'),
    debeFallar: true,
    esperado: /No ve: visualizador-algoritmos/,
  },
  {
    n: 3,
    nombre: 'un `name:` que el parser no reconoce y cae a la ruta (S0154)',
    fichero: 'data/applications.ts',
    alterar: (t) => sustituir(t, 'name: "Calculadora de Propinas"', 'name: `Calculadora de Propinas`', 'applications.ts'),
    debeFallar: true,
    esperado: /campo «name»/,
  },
  {
    n: 4,
    nombre: 'una `url:` con comillas simples en applications.ts',
    fichero: 'data/applications.ts',
    alterar: (t) => sustituir(t, 'url: "/calculadora-propinas/"', "url: '/calculadora-propinas/'", 'applications.ts'),
    debeFallar: true,
    esperado: /No ve: calculadora-propinas/,
  },
];

function prepararCopia() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'probar-consumidores-'));
  for (const rel of FICHEROS) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.copyFileSync(path.join(RAIZ, rel), path.join(dir, rel));
  }
  return dir;
}

function ejecutar(dir) {
  try {
    const salida = execFileSync(process.execPath, [CANDADO, '--raiz', dir], { cwd: RAIZ, stdio: 'pipe' });
    return { falla: false, salida: String(salida) };
  } catch (e) {
    return { falla: true, salida: String(e.stdout ?? '') + String(e.stderr ?? '') };
  }
}

let fallos = 0;
console.log('Reinyectando al candado los casos de los que nació:\n');

for (const caso of CASOS) {
  const dir = prepararCopia();
  try {
    if (caso.alterar) {
      const ruta = path.join(dir, caso.fichero);
      fs.writeFileSync(ruta, caso.alterar(fs.readFileSync(ruta, 'utf8')), 'utf8');
    }
    const r = ejecutar(dir);
    const bien = r.falla === caso.debeFallar && (!caso.esperado || caso.esperado.test(r.salida));
    console.log(`  ${bien ? '✅' : '❌'} ${caso.n}. ${caso.nombre} → ${r.falla ? 'FALLA' : 'pasa'}` +
      ` (se esperaba que ${caso.debeFallar ? 'fallara' : 'pasara'})`);
    if (!bien) fallos++;
    if (!bien || process.argv.includes('--ver')) {
      console.log(r.salida.split('\n').map((l) => `       ${l}`).join('\n'));
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

if (fallos) {
  console.error(`\n❌ ${fallos} caso(s) con el veredicto equivocado: el candado no vigila lo que dice vigilar.`);
  process.exit(1);
}
console.log(`\n✅ Los ${CASOS.length} casos dan el veredicto esperado.`);
