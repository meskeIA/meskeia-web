#!/usr/bin/env node
/**
 * check-parser-numerico.mjs — que ninguna app NUEVA vuelva a parsear números a mano
 *
 * Ejecutar:  npm run check:parser                (lo ejecuta también `npm run build`)
 *            npm run check:parser -- --todo      (catálogo entero: informa, NO rompe)
 *            node scripts/check-parser-numerico.mjs app/x/page.tsx   (ficheros sueltos)
 *
 * QUÉ BUSCA
 * ─────────
 * `parseFloat(algo.replace(',', '.'))` y sus variantes: el parseo casero de números en
 * formato español, que el proyecto tiene prohibido desde que existe `parseSpanishNumber`.
 *
 * POR QUÉ IMPORTA
 * ───────────────
 * `parseFloat` se queda con el PREFIJO numérico de lo que le des y descarta el resto sin
 * avisar, así que cuela como número lo que no lo es:
 *
 *     parseFloat('12abc')  → 12          ← basura aceptada
 *     parseFloat('1e3')    → 1000        ← notación científica donde nadie la espera
 *     parseFloat('10.5.3') → 10.5        ← dos separadores, se traga el primero
 *
 * y el `.replace(',', '.')` de delante lee el millar español mil veces más pequeño: «1.500»
 * (mil quinientos) se convierte en 1,5. `parseSpanishNumber` devuelve `NaN` para los tres
 * primeros y 1500 para el cuarto, que es lo correcto.
 *
 * Lo destapó el Inspector dos veces: en `conversor-numeros-letras` (24/08/2026), que es con
 * lo que se rellenan pagarés, y en `calculadora-masa-madre` (hallazgo 290, 25/08/2026).
 *
 * QUÉ NO HACE, Y POR QUÉ
 * ──────────────────────
 * NO obliga a arreglar el pasivo. A 25/08/2026 son 85 ficheros y 185 usos, y de una muestra
 * de 60 **35 no validan el resultado del parseo**: cambiarlos en bloque haría aparecer «NaN»
 * en pantalla en más de la mitad, porque `parseSpanishNumber` devuelve NaN donde `parseFloat`
 * devolvía un número. Sería cambiar un defecto silencioso por uno visible, en 85 apps a la vez.
 *
 * Así que este candado juzga **las líneas que cada commit añade**, igual que `check:a11y-jsx`
 * y `check:secrets`, y por la misma razón: un candado por fichero rompería el build al tocar
 * cualquier app antigua por un motivo que nada tiene que ver, y un candado que estorba se
 * acaba desactivando. Lo que el fichero ya arrastraba se cuenta y se nombra, pero no detiene
 * nada. El pasivo lo drena el Inspector app por app, que es donde se puede comprobar en
 * navegador si esa app maneja el `NaN` o si hay que añadirle la guarda.
 *
 * Escape para el falso positivo: «parser-ok: <razón>» en la línea o en la anterior.
 * Los hay de verdad: parsear un valor que genera la propia app —un `dataset`, el `value` de
 * un `<input type="range">`, una cadena de una constante propia— no es entrada de usuario.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TODO = process.argv.includes('--todo');
const SUELTOS = process.argv.slice(2).filter((a) => !a.startsWith('--'));

// En Vercel no se ejecuta: allí el clon es shallow y `git diff HEAD` no significa lo mismo,
// y el build local —que es donde manda el flujo del proyecto— ya lo ha pasado antes del push.
if (process.env.VERCEL) {
  console.log('✓ parser numérico: omitido en Vercel (se valida en local antes de subir)');
  process.exit(0);
}

/**
 * El parseo casero, en sus formas conocidas.
 *
 * Se busca por TEXTO y no por AST —al revés que `check-a11y-jsx`— porque aquí el patrón es
 * una llamada concreta, no una estructura JSX: no hay `<` ni `>` que confundir con genéricos
 * de TypeScript, que es lo que hacía inservible el grep allí.
 */
/** El `.replace(...)` que convierte la coma decimal, en sus dos escrituras. */
const REPLACE_DE_LA_COMA = /\.replace\s*\(\s*(?:['"],['"]|\/,\/[gu]*\s*,)/;

const PATRONES = [
  {
    // La conversión y el parseo en la misma línea. NO se exige que estén anidados sin
    // paréntesis por medio: la forma más común del catálogo es encadenar dos replaces
    // —`x.replace(/\./g, '').replace(',', '.')`, que además quita el millar—, y el paréntesis
    // del primero rompía un patrón que exigiera `[^)]*`. Se comprobó contra el pasivo: con
    // aquel patrón el candado veía 153 de los 188 usos reales, o sea que era ciego a la forma
    // MÁS habitual y habría dejado pasar usos nuevos.
    re: /parseFloat\s*\(/,
    conversion: true,
    queja: 'parseFloat sobre un número convertido a mano',
  },
  {
    re: /\bNumber\s*\(/,
    conversion: true,
    queja: 'Number sobre un número convertido a mano',
  },
];

const ESCAPE = /parser-ok:/;

const relevante = (f) =>
  (f.endsWith('.ts') || f.endsWith('.tsx')) &&
  (f.startsWith('app/') || f.startsWith('components/') || f.startsWith('lib/')) &&
  !f.endsWith('formatters.ts'); // es quien IMPLEMENTA el parser canónico

function git(args) {
  return execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8' })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Líneas que el commit añade o modifica en un fichero, en su numeración ACTUAL.
 * `null` significa «todas»: fichero sin seguir, suelto o barrido completo.
 */
function lineasTocadas(rel) {
  let diff;
  try {
    diff = git(['diff', '--unified=0', '--no-color', 'HEAD', '--', rel]);
  } catch {
    return null;
  }
  if (!diff.length) return null;
  const tocadas = new Set();
  for (const linea of diff) {
    const m = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(linea);
    if (!m) continue;
    const desde = Number(m[1]);
    const cuantas = m[2] === undefined ? 1 : Number(m[2]);
    for (let i = 0; i < cuantas; i++) tocadas.add(desde + i);
  }
  return tocadas;
}

function objetivos() {
  if (SUELTOS.length) return SUELTOS.map((f) => f.replace(/\\/g, '/'));
  if (TODO) {
    const todos = [];
    const rec = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, e.name);
        if (e.isDirectory()) rec(abs);
        else if (e.name.endsWith('.ts') || e.name.endsWith('.tsx'))
          todos.push(path.relative(RAIZ, abs).replace(/\\/g, '/'));
      }
    };
    for (const dir of ['app', 'components', 'lib']) rec(path.join(RAIZ, dir));
    return todos.filter(relevante);
  }
  try {
    const cambiados = git(['diff', '--name-only', '--diff-filter=ACM', 'HEAD']);
    const nuevos = git(['ls-files', '--others', '--exclude-standard']);
    return [...new Set([...cambiados, ...nuevos])].filter(relevante);
  } catch {
    console.log('✓ parser numérico: omitido (no se pudo consultar git)');
    process.exit(0);
  }
}

// ─── Análisis ─────────────────────────────────────────────────────────────────

const rompen = [];   // en líneas que este commit añade → detienen el build
const pasivo = [];   // ya estaban ahí → se cuentan y se nombran, no detienen nada

for (const rel of objetivos()) {
  const abs = path.join(RAIZ, rel);
  if (!fs.existsSync(abs)) continue;
  const lineas = fs.readFileSync(abs, 'utf8').split('\n');
  const barrido = TODO || SUELTOS.length > 0;
  const tocadas = barrido ? null : lineasTocadas(rel);

  lineas.forEach((texto, i) => {
    // Las dos piezas tienen que estar en la línea: el parseo y la conversión de la coma.
    // Por separado no dicen nada — `Number(x)` a secas es correcto y `.replace` también.
    if (!REPLACE_DE_LA_COMA.test(texto)) return;
    const patron = PATRONES.find((p) => p.re.test(texto));
    if (!patron) return;
    if (ESCAPE.test(texto) || (i > 0 && ESCAPE.test(lineas[i - 1]))) return;

    const n = i + 1;
    const caso = { rel, n, queja: patron.queja, texto: texto.trim().slice(0, 90) };
    // En un barrido nada rompe. Fuera del barrido, `tocadas === null` es fichero sin seguir:
    // todo lo suyo es nuevo.
    const esDelCommit = barrido ? false : tocadas === null || tocadas.has(n);
    (esDelCommit ? rompen : pasivo).push(caso);
  });
}

// ─── Salida ───────────────────────────────────────────────────────────────────

if (rompen.length) {
  console.error('\n✗ Parser numérico — el build se detiene\n');
  for (const c of rompen) {
    console.error(`  ${c.rel}`);
    console.error(`    L${c.n}  ${c.queja} → usa parseSpanishNumber de @/lib`);
    console.error(`          ${c.texto}`);
  }
  console.error('\n`parseFloat` acepta «12abc» como 12 y lee «1.500» como 1,5.');
  console.error('`parseSpanishNumber` devuelve NaN para lo que no es un número y entiende el');
  console.error('millar español. Si es un falso positivo —un valor que genera la propia app y');
  console.error('no el usuario—, escribe «parser-ok: <razón>» en esa línea o en la anterior.\n');
  process.exit(1);
}

if (TODO || SUELTOS.length) {
  if (!pasivo.length) {
    console.log('✓ parser numérico: sin parseo casero en lo revisado');
  } else {
    const ficheros = new Set(pasivo.map((c) => c.rel));
    console.log(`\n· parser numérico — ${pasivo.length} uso(s) en ${ficheros.size} fichero(s):\n`);
    for (const c of pasivo) console.log(`  ${c.rel}:${c.n}  ${c.queja}`);
    console.log('\nEs el PASIVO: no rompe nada. Lo drena el Inspector app por app, que es');
    console.log('donde se puede comprobar en navegador si esa app maneja el NaN.\n');
  }
  process.exit(0);
}

if (pasivo.length) {
  const ficheros = new Set(pasivo.map((c) => c.rel));
  console.log(
    '✓ parser numérico: lo que añade este commit está limpio ' +
      `(${pasivo.length} uso(s) anteriores en ${ficheros.size} fichero(s), sin tocar)`,
  );
} else {
  console.log('✓ parser numérico: sin parseo casero en lo que toca este commit');
}
