#!/usr/bin/env node
/**
 * Script: check-guarda-rafaga.mjs
 *
 * Candado de la GUARDA DE DOBLE TOQUE COPIADA. Se ejecuta antes de cada build (`npm run build`)
 * y a mano con `npm run check:guarda-rafaga`.
 *
 * QUÉ PROHÍBE
 * ───────────
 * Que un `.tsx` de `app/` o `components/` escriba a mano la guarda de doble toque: una
 * comparación `.detail > 1` (o `>= 2`) sobre un evento de clic. La guarda vive en UN sitio,
 * `lib/useGuardaRafaga.ts`: `const marcarCambioPantalla = useGuardaRafaga();` y llamarla en cada
 * manejador que cambia de pantalla.
 *
 * DE DÓNDE SALE
 * ─────────────
 * Del cabo C0317 (19/10/2026): la guarda —ignorar el 2.º clic de una ráfaga cuando el 1.º cambió
 * de pantalla— nació en quiz-literatura-universal (hallazgo 2507) y en selector-smartphone
 * (2659), y cada reparación posterior la COPIÓ en la app siguiente. El cabo contó 9 copias el
 * 19/10, 11 ese mismo día y 16 selectores el 31/10, en cuatro variantes (por botón con
 * `clicDeMas`, en captura sobre window, las dos a la vez, o en `onClickCapture` del contenedor).
 * Mientras tanto la receta compartida aprendió tres cosas que ninguna copia tenía: frenar el
 * mousedown que movía el foco (hallazgo 3768), devolver el foco que caía a <body> al tocar un
 * control deshabilitado (C0514) y el modo `soloMismoPunto` (3679). La campaña del 31/10/2026
 * cambió las 16 copias por el hook; este candado impide la 17.ª.
 *
 * SIN PASIVO
 * ──────────
 * Barre `app/` y `components/` enteros. Tras la campaña no queda ninguna copia: solo puede
 * encenderlo código nuevo.
 *
 * QUÉ NO MIRA, Y POR QUÉ
 * ──────────────────────
 *   · `detail === 2` (un manejador de doble clic que SÍ quiere el doble clic) ni `detail` de un
 *     CustomEvent comparado con otra cosa: no son la guarda.
 *   · Una guarda escrita con otro reloj (un temporizador, `Date.now()` entre clics): no tiene
 *     forma fija. La familia la mide con su testigo (tests/familias/selectores.spec.ts y
 *     quizzes.spec.ts, el caso «doble toque»), no con este candado.
 *   · Los comentarios, que citan `detail` > 1 a menudo para explicar la receta.
 *
 * ESCAPE
 * ──────
 * `rafaga-ok: <razón>` en la línea o en las tres anteriores. **La razón es obligatoria**: la
 * marca a secas también rompe el build.
 *
 * Sus casos de prueba se le reinyectan con `npm run guarda-rafaga:probar-candado`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ_DEFECTO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const iRaiz = process.argv.indexOf('--raiz');
const RAIZ = iRaiz !== -1 ? path.resolve(process.argv[iRaiz + 1]) : RAIZ_DEFECTO;

function recorrer(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') recorrer(p, out); }
    else if (e.name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

/** Quita comentarios conservando los saltos de línea, para no mover los números de línea. */
const sinComentarios = (txt) => txt
  .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

function escapeEn(lineas, n) {
  const trozo = lineas.slice(Math.max(0, n - 4), n).join('\n');
  const m = trozo.match(/rafaga-ok:([^\n]*)/);
  if (!m) return null;
  const razon = m[1].replace(/\*\/.*$/, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
  return /\p{L}{3,}/u.test(razon) ? 'firmado' : 'sin razón';
}

const GUARDA = /\.detail\s*(?:>\s*1(?!\d)|>=\s*2(?!\d))/g;

const errores = [];
const exentos = [];
let ficheros = 0;
for (const dir of ['app', 'components']) {
  for (const ruta of recorrer(path.join(RAIZ, dir))) {
    ficheros++;
    const txt = fs.readFileSync(ruta, 'utf8');
    const limpio = sinComentarios(txt);
    const lineas = txt.split('\n');
    const rel = path.relative(RAIZ, ruta).replace(/\\/g, '/');
    for (const m of limpio.matchAll(GUARDA)) {
      const linea = limpio.slice(0, m.index).split('\n').length;
      const escape = escapeEn(lineas, linea);
      if (escape === 'firmado') { exentos.push(`${rel}:${linea}`); continue; }
      const porQue = escape === 'sin razón' ? ' — lleva `rafaga-ok:` SIN razón escrita' : '';
      errores.push(`${rel}:${linea} — guarda de doble toque escrita a mano (\`${m[0].trim()}\`). Usa \`const marcarCambioPantalla = useGuardaRafaga();\` de @/lib/useGuardaRafaga y llámala en cada manejador que cambia de pantalla.${porQue}`);
    }
  }
}

if (ficheros === 0) {
  console.error(`\n❌ Guarda de doble toque copiada: no he leído ningún .tsx en app/ ni components/ de ${RAIZ}\n`);
  process.exit(1);
}

if (errores.length) {
  console.error(`\n❌ Guarda de doble toque copiada: ${errores.length} sitio(s)\n`);
  for (const e of errores) console.error(`   · ${e}`);
  console.error('');
  process.exit(1);
}

console.log('✅ Guarda de doble toque copiada: correcto');
console.log(`   · ${ficheros} ficheros .tsx de app/ y components/, sin pasivo`);
if (exentos.length) console.log(`   · ${exentos.length} exento(s) con \`rafaga-ok\`: ${exentos.slice(0, 5).join(', ')}`);
