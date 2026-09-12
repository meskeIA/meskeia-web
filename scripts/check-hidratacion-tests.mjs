#!/usr/bin/env node
/**
 * check-hidratacion-tests.mjs — que un test no vuelva a sembrar un input a mano
 *
 * Ejecutar:  npm run check:hidratacion                       (lo ejecuta también `npm run build`)
 *            node scripts/check-hidratacion-tests.mjs tests/apps/x.spec.ts   (ficheros sueltos)
 *
 * QUÉ BUSCA
 * ─────────
 * La escritura directa en un input desde un test, con el setter nativo del prototipo:
 *
 *     const setter = Object.getOwnPropertyDescriptor(
 *       window.HTMLInputElement.prototype, 'value')!.set!;
 *     setter.call(el, '880');
 *     el.dispatchEvent(new Event('input', { bubbles: true }));
 *
 * Es la única forma de mover un `<input type="range">` (fill() lanza «Malformed value»), así
 * que no se puede prohibir: lo que se exige es que viva en UN solo sitio,
 * `tests/apps/_hidratacion.ts`, donde va acompañada de las dos esperas que la hacen válida.
 * Cualquier otra copia en `tests/` rompe el build.
 *
 * POR QUÉ IMPORTA
 * ───────────────
 * Esa escritura, hecha antes de que React haya montado el input, cambia el DOM y NO llega al
 * estado de React. El test no falla: el deslizador se mueve, el campo muestra el texto, y lo
 * único que se queda atrás es todo lo que React deriva del estado —la etiqueta, el resultado
 * calculado—, así que el test sigue adelante midiendo un escenario distinto del que cree y
 * pasa en verde. Medido el 12/09/2026 con la CPU al 5 %: pedir 2 enlaces en `simulador-vsepr`
 * deja DOM=2 y React=4, y sigue así un segundo después de que la página termine de hidratar.
 *
 * Y tiene un agravante que lo vuelve indepurable: el intento perdido deja el rastreador de
 * valor de React apuntando al valor que nunca se aplicó, de modo que React DESCARTA por
 * duplicado cualquier reintento con ese mismo valor. Dos specs llegaron a llevar un bucle de
 * 20 reintentos que no podía funcionar ni en teoría —y que además comparaba el DOM consigo
 * mismo, así que salía a la primera vuelta sin comprobar nada.
 *
 * DE DÓNDE SALE
 * ─────────────
 * · 12/09/2026 (4ba094cd) — `simulador-vsepr` en rojo de forma determinista (pedir X=2,E=2
 *   devolvía AX₄E₂) y `visualizador-sonido-ondas` en rojo 1 de cada 3 corridas, los dos sin
 *   que la app ni el spec se hubieran tocado desde agosto.
 * · 12/09/2026 — los 10 specs restantes con la misma siembra (151 tests), migrados al helper.
 *   Ese día el pasivo quedó a CERO, que es lo que permite a este candado romper el build de
 *   verdad en vez de solo avisar (como `check:parser` o `check:a11y-jsx`, que arrastran miles
 *   de casos y por eso juzgan solo lo que el commit añade).
 *
 * QUÉ NO HACE, Y POR QUÉ
 * ──────────────────────
 * No mira los `fill()` ni los `click()` anteriores a la hidratación, que corren el MISMO
 * riesgo. Dos razones: el pasivo sería de cientos de ficheros, y sobre todo que ahí no hay
 * candado posible por la forma del código — un `fill()` es correcto o no según lo que el test
 * haya esperado antes, y eso exige criterio. Para esos casos el helper exporta
 * `esperarValorEnReact`, que comprueba el estado después de escribir.
 *
 * Tampoco entra en `app/`, `components/` ni `lib/`: el setter nativo en código de producción
 * es otra cosa (y otra discusión). Este candado es sobre pruebas.
 *
 * Se comprueba que dispara donde debe y calla donde debe con
 * `npm run hidratacion:probar-candado`, que le reinyecta los casos de
 * `scripts/pruebas/hidratacion-tests.txt`.
 *
 * FALSO POSITIVO
 * ──────────────
 * `hidratacion-ok: <razón>` en esa línea o en la anterior. Lo hay de verdad: el test que
 * REPRODUCE la carrera (`tests/hidratacion-carrera.spec.ts`) tiene que sembrar mal a propósito.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SUELTOS = process.argv.slice(2).filter((a) => !a.startsWith('--'));

/** El único fichero al que se le permite tener la escritura: el helper. */
const HELPER = 'tests/apps/_hidratacion.ts';

/**
 * La escritura a mano en un input. Se busca por el prototipo, que es lo que hay que tocar sí
 * o sí para saltarse la propiedad de instancia que React redefine en cada input controlado:
 * sin eso el evento ni siquiera llegaría a React, así que no hay variante sin esta cadena.
 */
const SIEMBRA_A_MANO = /HTMLInputElement\s*\.\s*prototype/;

/** El escape, en la propia línea o en la anterior. */
const ESCAPE = /hidratacion-ok:/;

function objetivos() {
  if (SUELTOS.length > 0) return SUELTOS.map((p) => p.replace(/\\/g, '/'));
  const todos = [];
  const rec = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules') continue;
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) rec(abs);
      else if (e.name.endsWith('.ts') || e.name.endsWith('.tsx'))
        todos.push(path.relative(RAIZ, abs).replace(/\\/g, '/'));
    }
  };
  // Sin pasivo, así que se barre el árbol de pruebas entero y no solo lo que el commit toca.
  rec(path.join(RAIZ, 'tests'));
  return todos;
}

const fallos = [];
let analizados = 0;

for (const rel of objetivos()) {
  const normalizado = rel.replace(/\\/g, '/');
  if (normalizado.endsWith(HELPER) || normalizado === HELPER) continue;
  const abs = path.isAbsolute(rel) ? rel : path.join(RAIZ, rel);
  if (!fs.existsSync(abs)) continue;
  analizados++;

  const lineas = fs.readFileSync(abs, 'utf8').split('\n');
  lineas.forEach((texto, i) => {
    if (!SIEMBRA_A_MANO.test(texto)) return;
    if (ESCAPE.test(texto) || (i > 0 && ESCAPE.test(lineas[i - 1]))) return;
    fallos.push({ rel: normalizado, n: i + 1, texto: texto.trim().slice(0, 100) });
  });
}

if (fallos.length === 0) {
  console.log(
    `✓ hidratación en tests: 0 siembras a mano fuera del helper (${analizados} ficheros de prueba)`,
  );
  process.exit(0);
}

console.error(`\n✗ HIDRATACIÓN EN TESTS: ${fallos.length} siembra(s) a mano fuera del helper\n`);
for (const f of fallos) {
  console.error(`  ${f.rel}:${f.n}`);
  console.error(`    ${f.texto}`);
}
console.error(
  '\n  Escribir en un input con el setter nativo antes de que React lo haya montado cambia el\n' +
    '  DOM y NO llega al estado de React: el test no falla, pero mide otro escenario. Y el\n' +
    '  intento perdido envenena el rastreador de React, así que reintentar con el mismo valor\n' +
    '  ya no lo arregla nunca.\n\n' +
    '  Usa `sembrarValor` (o `sembrarValorAcotado`, si el control capa el valor) de\n' +
    '  tests/apps/_hidratacion.ts: esperan a la hidratación y comprueban que el estado de React\n' +
    '  recogió el valor. Para un `fill()`, `esperarValorEnReact`.\n' +
    '  Falso positivo: escribe `hidratacion-ok: <razón>` en esa línea o en la anterior.\n',
);
process.exit(1);
