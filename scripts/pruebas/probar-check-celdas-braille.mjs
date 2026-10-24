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
 * Reescritas el 24/10/2026 con el candado (hallazgo 3456): la tabla `brailleDots` ya no existe y
 * el dibujo sale de los bits del código. Los casos de origen se reinyectan en su forma de hoy:
 *   1. La hoja vuelve a buscar en una tabla con caída a vacío (`tabla[c] ?? []`), que es la
 *      forma de los tres defectos (21/08, 1183 y 3456).
 *   2. La vista de celdas, igual con `|| []`, que era la forma de `renderBrailleCell`.
 *   3. `puntosDeCelda` calcula mal los bits (un patrón «mal tecleado», regla C).
 *   4. `puntosDeCelda` se queda sin puntos para parte del bloque: las celdas emitibles salen en
 *      blanco (regla B), que es el efecto del 3456 visto desde el cálculo.
 *   5. El código de hoy CALLA.
 *   6. y 7. El candado SE PLANTA si no entiende el fichero: sin `textToBraille`, o sin el dibujo
 *      con `puntosDeCelda` (alguien renombra la función), en vez de dar verde por no haber mirado.
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PAGINA = 'app/conversor-braille/page.tsx';
const CELDAS = 'app/conversor-braille/celdas.ts';
const CANDADO = 'scripts/check-celdas-braille.mjs';
const src = readFileSync(PAGINA, 'utf8');
const celdas = readFileSync(CELDAS, 'utf8');
const dir = mkdtempSync(join(tmpdir(), 'braille-candado-'));

/** Corre el candado sobre una página y unas celdas, y devuelve si ha fallado y qué ha dicho. */
function correr(pagina, modulo, nombre) {
  const rutaPagina = join(dir, `${nombre}.tsx`);
  const rutaCeldas = join(dir, `${nombre}-celdas.ts`);
  writeFileSync(rutaPagina, pagina, 'utf8');
  writeFileSync(rutaCeldas, modulo, 'utf8');
  try {
    const salida = execFileSync('node', [CANDADO, rutaPagina, '--celdas', rutaCeldas], { encoding: 'utf8', stdio: 'pipe' });
    return { fallo: false, salida };
  } catch (e) {
    return { fallo: true, salida: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

const exigir = (texto, patron, caso) => {
  if (!texto.includes(patron)) throw new Error(`trampa ${caso}: no encuentro «${patron}» en el original`);
  return texto;
};

const casos = [
  {
    nombre: '1-la-hoja-vuelve-a-la-tabla',
    debeFallar: true,
    pagina: exigir(src, 'const activos = puntosDeCelda(caracter);', 1).replace(
      'const activos = puntosDeCelda(caracter);',
      'const activos = brailleDots[caracter] ?? [];',
    ),
    modulo: celdas,
    espera: 'cae a vacío',
  },
  {
    nombre: '2-la-vista-vuelve-a-la-tabla',
    debeFallar: true,
    pagina: exigir(src, 'const dots = puntosDeCelda(char);', 2).replace(
      'const dots = puntosDeCelda(char);',
      'const dots = brailleDots[char] || []; const otra = puntosDeCelda(char);',
    ),
    modulo: celdas,
    espera: 'cae a vacío',
  },
  {
    nombre: '3-bits-mal-calculados',
    debeFallar: true,
    modulo: exigir(celdas, 'bits & (1 << (p - 1))', 3).replace('bits & (1 << (p - 1))', 'bits & (1 << p)'),
    pagina: src,
    espera: 'no cuadran con su código',
  },
  {
    nombre: '4-celdas-emitibles-en-blanco',
    debeFallar: true,
    modulo: exigir(celdas, "if (!esCeldaBraille(celda)) return [];", 4).replace(
      "if (!esCeldaBraille(celda)) return [];",
      "if (!esCeldaBraille(celda) || (celda.codePointAt(0) ?? 0) > 0x2810) return [];",
    ),
    pagina: src,
    espera: 'se dibujaría en blanco',
  },
  {
    nombre: '5-el-codigo-de-hoy-debe-callar',
    debeFallar: false,
    pagina: src,
    modulo: celdas,
    espera: 'se pueden dibujar',
  },
  {
    nombre: '6-parser-mudo-sin-textToBraille',
    debeFallar: true,
    pagina: exigir(src, 'const textToBraille', 6).replace('const textToBraille', 'const textToBrailleRenombrado'),
    modulo: celdas,
    espera: 'no se encuentra',
  },
  {
    nombre: '7-parser-mudo-sin-el-dibujo',
    debeFallar: true,
    pagina: src.replaceAll('puntosDeCelda', 'puntosDeLaCelda'),
    modulo: celdas,
    espera: 'no se encuentra',
  },
];

let fallos = 0;
console.log('\nTrampas de check:braille\n');

for (const caso of casos) {
  const r = correr(caso.pagina, caso.modulo, caso.nombre);
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
