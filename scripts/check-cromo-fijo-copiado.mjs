#!/usr/bin/env node
/**
 * Script: check-cromo-fijo-copiado.mjs
 *
 * Candado de los AYUDANTES DEL CROMO FIJO COPIADOS. Se ejecuta antes de cada build
 * (`npm run build`) y a mano con `npm run check:cromo-fijo`.
 *
 * QUÉ PROHÍBE
 * ───────────
 * Que un `.tsx` de `app/` o `components/` declare una función o constante con el nombre de uno de
 * los ayudantes de `lib/cromoFijo.ts` (`traerALaVista`, `traerTramoALaVista`, `enfocarALaVista`,
 * `enfocarSinCentrar`, `margenBarraLogo`…): eso es una copia. Se importan de `@/lib`.
 * La lista de nombres NO está escrita aquí: se lee de los `export function` de `lib/cromoFijo.ts`,
 * así que un ayudante nuevo queda cubierto sin tocar el candado (y se planta si no lee ninguno).
 *
 * DE DÓNDE SALE
 * ─────────────
 * Del cabo C0546 (31/10/2026). `traerALaVista(bloque, clave)` —subir el panel bajo la barra del
 * logo solo si el enunciado no se ve entero— nació en quiz-literatura-universal (hallazgo 1716) y
 * cada reparación posterior la COPIÓ en la app siguiente: diez apps, en tres variantes (la clave
 * entera, el tramo del borde del bloque al pie de la clave en geografía e historia, y varias
 * claves en países-capitales). Mientras, la familia de los quizzes ya había llevado a
 * `lib/cromoFijo.ts` sus gemelas `enfocarALaVista` (C0018) y `enfocarSinCentrar` (hallazgo 3770),
 * que las apps sí importaban. La C0317 dejó las copias fuera porque no son `enfocarALaVista`
 * (suben un elemento y miran OTRO, y no mueven el foco); la campaña del 31/10/2026 las cambió por
 * `traerALaVista` y `traerTramoALaVista` de `lib/cromoFijo.ts`, y este candado impide la 11.ª.
 *
 * SIN PASIVO
 * ──────────
 * Barre `app/` y `components/` enteros. Tras la campaña no queda ninguna copia: solo puede
 * encenderlo código nuevo.
 *
 * QUÉ NO MIRA, Y POR QUÉ
 * ──────────────────────
 *   · Una copia RENOMBRADA (`subirPanel` con el mismo cuerpo): no tiene forma fija que la separe
 *     del código legítimo que mide la barra con `margenBarraLogo()` y decide otra cosa (lo hace
 *     simulador-teorema-central-limite). El caso de origen fue siempre la copia con su nombre,
 *     traída de la app hermana.
 *   · Los comentarios, que citan los nombres a menudo para explicar la receta.
 *   · `lib/`, donde viven los originales.
 *
 * ESCAPE
 * ──────
 * `cromo-ok: <razón>` en la línea o en las tres anteriores. **La razón es obligatoria**: la marca
 * a secas también rompe el build.
 *
 * Sus casos de prueba se le reinyectan con `npm run cromo-fijo:probar-candado`.
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
  const m = trozo.match(/cromo-ok:([^\n]*)/);
  if (!m) return null;
  const razon = m[1].replace(/\*\/.*$/, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
  return /\p{L}{3,}/u.test(razon) ? 'firmado' : 'sin razón';
}

const ORIGEN = path.join(RAIZ, 'lib', 'cromoFijo.ts');
if (!fs.existsSync(ORIGEN)) {
  console.error(`\n❌ Ayudantes del cromo fijo copiados: no encuentro ${ORIGEN}\n`);
  process.exit(1);
}
const NOMBRES = [...sinComentarios(fs.readFileSync(ORIGEN, 'utf8'))
  .matchAll(/export\s+function\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]);
if (NOMBRES.length === 0) {
  console.error('\n❌ Ayudantes del cromo fijo copiados: no he leído ningún `export function` en lib/cromoFijo.ts\n');
  process.exit(1);
}

const DECLARACION = new RegExp(
  `(?:\\bfunction\\s+(${NOMBRES.join('|')})\\b|\\b(?:const|let|var)\\s+(${NOMBRES.join('|')})\\s*[=:])`, 'g');

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
    for (const m of limpio.matchAll(DECLARACION)) {
      const nombre = m[1] ?? m[2];
      const linea = limpio.slice(0, m.index).split('\n').length;
      const escape = escapeEn(lineas, linea);
      if (escape === 'firmado') { exentos.push(`${rel}:${linea}`); continue; }
      const porQue = escape === 'sin razón' ? ' — lleva `cromo-ok:` SIN razón escrita' : '';
      errores.push(`${rel}:${linea} — copia de \`${nombre}\`, que vive en lib/cromoFijo.ts. Impórtala de @/lib.${porQue}`);
    }
  }
}

if (ficheros === 0) {
  console.error(`\n❌ Ayudantes del cromo fijo copiados: no he leído ningún .tsx en app/ ni components/ de ${RAIZ}\n`);
  process.exit(1);
}

if (errores.length) {
  console.error(`\n❌ Ayudantes del cromo fijo copiados: ${errores.length} sitio(s)\n`);
  for (const e of errores) console.error(`   · ${e}`);
  console.error('');
  process.exit(1);
}

console.log('✅ Ayudantes del cromo fijo copiados: correcto');
console.log(`   · ${ficheros} ficheros .tsx de app/ y components/, ${NOMBRES.length} ayudantes (${NOMBRES.join(', ')}), sin pasivo`);
if (exentos.length) console.log(`   · ${exentos.length} exento(s) con \`cromo-ok\`: ${exentos.slice(0, 5).join(', ')}`);
