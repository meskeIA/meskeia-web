#!/usr/bin/env node
/**
 * probar-check-celdas-braille.mjs — las trampas de `check:braille`
 *
 * Ejecutar:  npm run braille:probar-candado
 *
 * Un candado nuevo se prueba REINYECTÁNDOLE su caso de origen y exigiendo que falle
 * ([[project_test_juicio_baseline]]): si no se comprueba, lo único que se sabe es que calla, y
 * callar lo hace igual de bien un script vacío.
 *
 * Los casos 1 y 2 son los dos defectos REALES, tal y como estaban en el código:
 *   1. El estado del 21/08/2026 — sin los tres indicadores en `brailleDots`.
 *   2. El estado del 22/09/2026 (hallazgo 1183) — sin ⠠, la primera celda de la barra inclinada.
 * El 3 es un patrón mal teclado, que es lo que la regla B añade sobre la A. Y los dos últimos
 * son los que impiden que este candado se vuelva decorativo: tiene que CALLAR con el código
 * bueno y PLANTARSE cuando no ha entendido el fichero, en vez de dar verde por no haber mirado.
 *
 * El quinto (renombrar la tabla a `brailleDotsRenombrado`) fue el que destapó que el propio
 * regex del candado leía cualquier `brailleDotsLoQueSea`: con la tabla renombrada seguía
 * encontrándola y daba verde, en vez de plantarse.
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ORIGINAL = 'app/conversor-braille/page.tsx';
const CANDADO = 'scripts/check-celdas-braille.mjs';
const src = readFileSync(ORIGINAL, 'utf8');
const dir = mkdtempSync(join(tmpdir(), 'braille-candado-'));

/** Corre el candado sobre un .tsx y devuelve si ha fallado y qué ha dicho. */
function correr(contenido, nombre) {
  const ruta = join(dir, `${nombre}.tsx`);
  writeFileSync(ruta, contenido, 'utf8');
  try {
    const salida = execFileSync('node', [CANDADO, ruta], { encoding: 'utf8' });
    return { fallo: false, salida };
  } catch (e) {
    return { fallo: true, salida: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

const casos = [
  {
    nombre: '1-sin-los-tres-indicadores-21-08',
    debeFallar: true,
    // Tal como estaba antes de la reparación del 21/08/2026.
    //
    // ⚠️ El numeral NO empieza su línea —comparte línea con ⠣ y ⠜—, así que su regex no puede
    // anclarse a `\n`: la primera versión de esta trampa lo dejaba dentro y comprobaba dos
    // ausencias donde quería comprobar tres, sin que nada lo dijera.
    contenido: src
      .replace(/'⠼': \[3,4,5,6\],\s*/, '')
      .replace(/\n\s*'⠨': \[4,6\],[^\n]*/, '')
      .replace(/\n\s*'⠐': \[5\],[^\n]*/, ''),
    espera: 'U+283C',
  },
  {
    nombre: '2-sin-la-barra-inclinada-1183',
    debeFallar: true,
    // El hallazgo 1183 exacto: ⠠ emitible por SIGNOS_COMPUESTOS y ausente de brailleDots.
    contenido: src.replace(/\n\s*'⠠': \[6\],[^\n]*/, ''),
    espera: 'U+2820',
  },
  {
    nombre: '3-puntos-mal-tecleados',
    debeFallar: true,
    // ⠙ es U+2819 → puntos 1-4-5. Aquí se teclea 1-4-6, que es otra celda.
    contenido: src.replace("'⠙': [1,4,5]", "'⠙': [1,4,6]"),
    espera: 'no cuadran con su código',
  },
  {
    nombre: '4-el-codigo-de-hoy-debe-callar',
    debeFallar: false,
    contenido: src,
    espera: 'se pueden dibujar',
  },
  {
    nombre: '5-parser-mudo-no-puede-dar-verde',
    debeFallar: true,
    // Si `brailleDots` cambia de forma y el regex deja de encajar, el candado NO puede callar:
    // es la lección de scripts/CLAUDE.md y la del validador ciego del 14/08/2026.
    contenido: src.replace('const brailleDots', 'const brailleDotsRenombrado'),
    espera: 'no se encuentra',
  },
];

let fallos = 0;
console.log('\nTrampas de check:braille\n');

for (const caso of casos) {
  const r = correr(caso.contenido, caso.nombre);
  const bienElVeredicto = r.fallo === caso.debeFallar;
  const bienElMotivo = r.salida.includes(caso.espera);

  if (bienElVeredicto && bienElMotivo) {
    console.log(`  ✓ ${caso.nombre} — ${caso.debeFallar ? 'falla' : 'calla'}, y por lo que debe`);
  } else {
    fallos++;
    console.log(`  ✗ ${caso.nombre}`);
    if (!bienElVeredicto) {
      console.log(`      esperaba ${caso.debeFallar ? 'que FALLARA' : 'que CALLARA'} y no lo hizo`);
    }
    if (!bienElMotivo) console.log(`      no nombra «${caso.espera}»`);
    console.log(`      dijo: ${r.salida.trim().split('\n').slice(0, 4).join(' / ')}`);
  }
}

rmSync(dir, { recursive: true, force: true });

if (fallos > 0) {
  console.error(`\n✗ ${fallos} de ${casos.length} trampas no se cumplen: el candado no vale.\n`);
  process.exit(1);
}
console.log(`\n✓ las ${casos.length} trampas se cumplen\n`);
