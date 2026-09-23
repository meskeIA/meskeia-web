#!/usr/bin/env node
/**
 * check-familias.mjs — que el testigo de cada familia de apps siga en verde
 *
 * Ejecutar:  npm run check:familias               (lo ejecuta también `npm run build`)
 *            npm run check:familias -- --estatico  (solo la declaración, sin navegador: 0,1 s)
 *
 * QUÉ EXIGE
 * ─────────
 * Para cada familia declarada en `scripts/inspector/familias.mjs` —la MISMA lista de la que
 * come la cola del Inspector; aquí no se declara ninguna segunda—:
 *
 *   A. Que la declaración y el testigo cuadren, sin abrir un navegador:
 *      · el testigo existe y la app de referencia es una de las hermanas;
 *      · cada hermana tiene `app/<slug>/page.tsx` y su bloque `slug: '…'` en la tabla del
 *        testigo, y el testigo no mide ninguna app que la familia no declare;
 *      · cada `<NumberInput>` de cada hermana tiene su fila `etiqueta: '…'`, y cada fila su
 *        campo. Es lo que dejó pasar el hueco A2: un campo EXCLUSIVO de una hermana
 *        (las amortizaciones de local-comercial), que un lote hecho mirando a las demás no
 *        podía ver. Una octava hermana o un campo nuevo sin fila rompen aquí;
 *      · cada `falla:` —un hueco abierto y declarado— lleva su razón escrita.
 *
 *   B. Que el testigo PASE. Se ejecuta con Playwright (arranca y cierra el servidor solo, o
 *      reutiliza el del 3050). Un caso que falla rompe el build, y un `falla` cuyo caso ya
 *      pasa también: Playwright lo da por fallido («expected to fail»), así que una marca
 *      muerta no puede sobrevivir a una reparación que se olvidó de quitarla.
 *
 * DE DÓNDE SALE
 * ─────────────
 * El 22/09/2026 el clúster de compraventa se reparó en lote, a propósito y con el patrón
 * delante (`cfe091a7`, «un importe ilegible se nombra en las SIETE apps del clúster, y el
 * aviso dice en qué dirección falta»). Al día siguiente se midieron cuatro huecos, y el más
 * grave (A1) era ese mismo defecto de dirección invertida REINTRODUCIDO en local-comercial
 * por la reparación que lo corregía en trastero: «No descuenta los impuestos y gastos de
 * aquella compra: el neto real será menor», cuando al leerlos el neto SUBE 3.404,00 €.
 * Al repararlos apareció un quinto que la medición del 23/09 había dado por sano en tres
 * hermanas porque su caso base no podía moverlo (C1: delta 0,00 €, verde sin probar nada).
 *
 * ⚠️ POR QUÉ EJECUTA EL TESTIGO Y NO LEE EL CÓDIGO
 * ───────────────────────────────────────────────
 * A1 es un defecto de DIRECCIÓN: el campo estaba guardado, tenía su bandera y su aviso, y el
 * aviso decía lo contrario de lo que pasa. Ninguna forma del código lo delata; solo se ve
 * ejecutando con el dato y sin él y comparando la cifra, que es lo que hace el testigo.
 * Y la versión estática tentadora —«existe `esLegible()`»— habría marcado en rojo tres apps
 * SANAS (nave, solar y terreno escriben la guarda inline): `grep -c esLegible` da 0 en las
 * tres y miente. Así es como mueren los candados. Lo estático de la parte A no juzga la
 * protección: solo exige que el testigo no se haya quedado sin mirar algo.
 *
 * PASIVO
 * ──────
 * Nace a cero: el testigo de compraventa en 52/52 sin ninguna marca `falla`, y los 46
 * `NumberInput` de sus siete apps con su fila. Es la condición que lo hace viable
 * (cabecera de `check-motores-consumidos.mjs`): puede romper el build de verdad en vez de
 * solo avisar, como `check:parser`, que arrastra pasivo y por eso solo mira líneas nuevas.
 *
 * ESCAPES
 * ───────
 *   · `falla: '<razón>'` en una fila del testigo: el hueco se declara abierto, con el caso
 *     escrito ANTES de repararlo, que es como trabaja el Inspector. No rompe el build; se
 *     imprime en cada ejecución con su cuenta.
 *   · `familia-ok: <razón>` en el propio `<NumberInput …>` o en las tres líneas anteriores:
 *     un campo que de verdad no mueve ninguna cifra publicada. La razón es obligatoria.
 *
 * COSTE: ~20 s (52 casos en 4 workers). En Vercel la parte B se omite: allí no hay navegador,
 * y el build de producción se valida en local antes de subir, igual que `check:tipos`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const ESTATICO = args.includes('--estatico');
const valorDe = (bandera) => {
  const i = args.indexOf(bandera);
  return i >= 0 ? args[i + 1] : null;
};
// Solo para las trampas (`npm run familias:probar-candado`): otra declaración y un filtro.
const DECLARACION = valorDe('--declaracion') ?? path.join(RAIZ, 'scripts/inspector/familias.mjs');
const GREP = valorDe('--grep');

const { FAMILIAS } = await import(pathToFileURL(path.resolve(RAIZ, DECLARACION)).href);

const errores = [];
const abiertos = [];
let nHermanas = 0;
let nCampos = 0;
const leer = (rel) => fs.readFileSync(path.resolve(RAIZ, rel), 'utf8');

/**
 * El código sin comentarios y con la MISMA longitud, para que los índices sigan valiendo: los
 * comentarios de este repositorio citan JSX a propósito, y un `<NumberInput` dentro de uno no
 * es un campo (`scripts/CLAUDE.md`, el caso de las 607 líneas dentro de un `<h1>`).
 */
const sinComentarios = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
    .replace(/^[ \t]*\/\/.*$/gm, (c) => c.replace(/[^\n]/g, ' '));

/**
 * Las etiquetas que puede llevar un `<NumberInput>`: todos los literales de su `label`, que
 * puede ser condicional (el estimador cambia «vivienda» por «inmueble»). `(?<![\w-])` para
 * no confundirlo con un `aria-label`.
 */
function etiquetasDe(elemento) {
  const m = elemento.match(/(?<![\w-])label=(?:"([^"]*)"|\{([\s\S]{0,400}?)\}(?=\s+[\w-]+=|\s*\/?>))/);
  if (!m) return null;
  if (m[1] !== undefined) return [m[1]];
  const literales = [...m[2].matchAll(/'([^']*)'|"([^"]*)"|`([^`$]*)`/g)].map((x) => x[1] ?? x[2] ?? x[3]);
  return literales.length > 0 ? literales : null;
}

/** Los bloques `slug: '…'` de la tabla del testigo, con las etiquetas de sus filas. */
function bloquesDelTestigo(src) {
  const marcas = [...src.matchAll(/^\s*slug: '([a-z0-9-]+)',/gm)];
  const bloques = new Map();
  marcas.forEach((m, i) => {
    const fin = i + 1 < marcas.length ? marcas[i + 1].index : src.length;
    const cuerpo = src.slice(m.index, fin);
    bloques.set(m[1], new Set([...cuerpo.matchAll(/etiqueta: '([^']+)'/g)].map((x) => x[1])));
  });
  return bloques;
}

for (const f of FAMILIAS) {
  const pre = `[${f.id}]`;
  if (!fs.existsSync(path.resolve(RAIZ, f.testigo))) {
    errores.push(`${pre} el testigo ${f.testigo} no existe`);
    continue;
  }
  if (!f.slugs.includes(f.referencia)) {
    errores.push(`${pre} la app de referencia «${f.referencia}» no es una de sus hermanas`);
  }

  // Sin comentarios también aquí: la cabecera del testigo explica cómo se escribe un
  // `falla: '<razón>'`, y eso no es un hueco abierto.
  const testigo = sinComentarios(leer(f.testigo));
  const bloques = bloquesDelTestigo(testigo);

  // Un testigo cuya tabla no se entiende no puede dar verde por no haber mirado.
  if (bloques.size === 0) {
    errores.push(`${pre} no se encuentra ningún bloque «slug: '…'» en ${f.testigo}: el candado no entiende la tabla`);
    continue;
  }

  for (const slug of bloques.keys()) {
    if (!f.slugs.includes(slug)) {
      errores.push(`${pre} el testigo mide «${slug}», que la familia no declara en familias.mjs`);
    }
  }

  for (const slug of f.slugs) {
    const rel = `app/${slug}/page.tsx`;
    if (!fs.existsSync(path.join(RAIZ, rel))) {
      errores.push(`${pre} «${slug}» está declarada y no existe ${rel}`);
      continue;
    }
    const filas = bloques.get(slug);
    if (!filas) {
      errores.push(`${pre} la hermana «${slug}» no tiene bloque en la tabla del testigo: nadie la mide`);
      continue;
    }

    nHermanas++;
    const src = leer(rel);
    const codigo = sinComentarios(src);
    const lineas = src.split('\n');
    const cubiertas = new Set();
    // Captura ACOTADA, y contada: si un `<NumberInput` no se deja leer entero, ese campo no
    // puede quedarse fuera en silencio — es el parser mudo de `scripts/CLAUDE.md`.
    const apariciones = (codigo.match(/<NumberInput\b/g) ?? []).length;
    const elementos = [...codigo.matchAll(/<NumberInput\b[\s\S]{0,2000}?\/>/g)];
    if (elementos.length !== apariciones) {
      errores.push(`${pre} ${rel} · hay ${apariciones} <NumberInput> y solo se han podido leer ${elementos.length}: el candado no entiende el fichero`);
    }
    for (const m of elementos) {
      const linea = src.slice(0, m.index).split('\n').length;
      // El escape es un comentario: se busca en el original, no en el código limpio.
      const original = src.slice(m.index, m.index + m[0].length);
      const contexto = lineas.slice(Math.max(0, linea - 4), linea - 1).join('\n') + original;
      const escape = contexto.match(/familia-ok:\s*(\S.*)?/);
      if (escape) {
        if (!escape[1]) errores.push(`${pre} ${rel}:${linea} · «familia-ok:» sin razón escrita`);
        continue;
      }
      const posibles = etiquetasDe(m[0]);
      if (!posibles) {
        errores.push(`${pre} ${rel}:${linea} · no se puede leer el label de este NumberInput: el candado no sabe qué fila le toca`);
        continue;
      }
      const suya = posibles.find((e) => filas.has(e));
      if (suya) {
        cubiertas.add(suya);
        nCampos++;
      } else {
        errores.push(`${pre} ${rel}:${linea} · el campo «${posibles[0]}» no tiene fila en el testigo`);
      }
    }
    for (const e of filas) {
      if (!cubiertas.has(e)) {
        errores.push(`${pre} el testigo tiene una fila «${e}» para ${slug}, y la app no tiene ese campo`);
      }
    }
  }

  // Los huecos declarados: con razón, y contados. `falla:` solo aparece en las filas de la
  // tabla (el tipo es `falla?:`), y su razón es un literal, a veces partido en varias líneas.
  for (const m of testigo.matchAll(/\bfalla:\s*/g)) {
    const linea = testigo.slice(0, m.index).split('\n').length;
    const literal = testigo.slice(m.index + m[0].length).match(/^(['"`])([^'"`]*)\1/);
    if (!literal || !literal[2].trim()) {
      errores.push(`${pre} ${f.testigo}:${linea} · un «falla» sin razón escrita`);
    } else {
      abiertos.push(`${pre} ${f.testigo}:${linea} — ${literal[2].trim().slice(0, 70)}…`);
    }
  }
}

const nFamilias = FAMILIAS.length;
const alcance = `${nFamilias} familia(s), ${nHermanas} apps, ${nCampos} campos con fila`;
if (errores.length > 0) {
  console.error(`\n✗ familias: ${errores.length} problema(s) en la declaración o en su testigo\n`);
  for (const e of errores) console.error(`  · ${e}`);
  console.error('\n  La lista vive en scripts/inspector/familias.mjs; la tabla, en el testigo de cada familia.\n');
  process.exit(1);
}
if (abiertos.length > 0) {
  console.log(`⚠ familias: ${abiertos.length} hueco(s) declarado(s) abierto(s) con «falla»:`);
  for (const a of abiertos) console.log(`    ${a}`);
}

if (ESTATICO) {
  console.log(`✓ familias: la declaración cuadra con su testigo — ${alcance} (sin ejecutarlo)`);
  process.exit(0);
}
if (process.env.VERCEL) {
  console.log('✓ familias: declaración correcta; el testigo se omite en Vercel (se ejecuta en local antes de subir)');
  process.exit(0);
}

// ── B. El testigo, ejecutado ─────────────────────────────────────────────────
const CLI = path.join(RAIZ, 'node_modules/@playwright/test/cli.js');
const testigos = FAMILIAS.map((f) => f.testigo);
const r = spawnSync(
  process.execPath,
  [CLI, 'test', ...testigos, '--fully-parallel', '--workers=4', '--reporter=line', ...(GREP ? ['-g', GREP] : [])],
  { cwd: RAIZ, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 8 * 60 * 1000 },
);
const salida = `${r.stdout ?? ''}${r.stderr ?? ''}`;
const cuenta = (re) => Number(salida.match(re)?.[1] ?? 0);
const pasados = cuenta(/(\d+) passed/);
const fallidos = cuenta(/(\d+) failed/);

if (r.status === 0 && fallidos === 0 && pasados > 0) {
  console.log(`✓ familias: testigo en verde — ${pasados} casos · ${alcance}${abiertos.length ? ` · ${abiertos.length} hueco(s) declarado(s)` : ''}`);
  process.exit(0);
}

console.error(`\n✗ familias: el testigo NO está en verde (${fallidos} fallido(s), ${pasados} en verde)\n`);
// Si Playwright ni siquiera llegó a contar, lo que hay que ver es el proceso, no los casos.
if (pasados + fallidos === 0) {
  console.error(`  Playwright no ha ejecutado ningún caso (código ${r.status}, señal ${r.signal ?? '—'}${r.error ? `, ${r.error.message}` : ''}).`);
  console.error(`  Últimas líneas de su salida:\n${salida.trim().split('\n').slice(-25).map((l) => `    ${l}`).join('\n') || '    (ninguna)'}\n`);
}
if (/Timed out waiting \d+ms from config\.webServer/.test(salida)) {
  console.error('  El servidor del 3050 no respondió. Si hay uno colgado: npx kill-port 3050\n');
}
const desde = salida.search(/^\s+1\) \[/m);
// Sin las líneas de progreso («[28/52] …») que el reporter intercala entre los errores.
const detalle = (desde >= 0 ? salida.slice(desde) : salida)
  .split('\n')
  .filter((l) => l.trim() && !/^\s*\[\d+\/\d+\] /.test(l));
console.error(detalle.slice(0, 120).map((l) => `  ${l}`).join('\n'));
console.error(
  '\n  Un caso rojo es una hermana que ha dejado de cumplir el invariante de su familia (o una' +
    '\n  marca «falla» cuyo caso ya pasa: quítala). Para ver el motivo de los huecos declarados:' +
    `\n    VER_HUECOS=1 npx playwright test ${testigos.join(' ')}\n`,
);
process.exit(1);
