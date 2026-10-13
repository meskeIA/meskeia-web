#!/usr/bin/env node
/**
 * check-features-jsonld.mjs — que ninguna app nueva ni retocada declare su WebApplication sin
 * características
 *
 * Ejecutar:  npm run check:features                  (lo ejecuta también `npm run build`)
 *            npm run check:features -- --todo        (catálogo entero: informa, NO rompe)
 *            node scripts/check-features-jsonld.mjs app/x/metadata.ts   (ficheros sueltos)
 *            … --raiz <dir>                          (otro repositorio: lo usan las pruebas)
 *
 * QUÉ BUSCA
 * ─────────
 * Una lista `features: [...]` o `featureList: [...]` escrita con literales y con MENOS DE 4,
 * en un `metadata.ts` o un `layout.tsx` de `app/`. `generateWebAppSchema` la copia tal cual al
 * `featureList` del JSON-LD WebApplication, y §1.ter del CLAUDE.md pide 4-8 características
 * reales: es lo que leen Bing Copilot, ChatGPT, Perplexity y Gemini para saber qué HACE la app.
 *
 * DE DÓNDE SALE
 * ─────────────
 * Cabo C0137 (Inspector, 04/10/2026): etiqueta-dgt llevaba `features: []` —y una category que
 * contradecía su meta—, reparado en a97f92ab. Al contarlo (/reparar del 13/10/2026) eran 297
 * `metadata.ts` con la lista vacía y 9 con 1-3, y en el que se abrió no había características
 * en ningún otro sitio: no vivían en otra parte, no estaban.
 *
 * QUÉ NO HACE, Y POR QUÉ
 * ──────────────────────
 * NO obliga a rellenar el pasivo. Escribir 297 listas a ciegas crearía PROMESAS: cada lista
 * tiene que decir lo que la app hace, y eso se comprueba abriéndola (es la palanca de la
 * promesa incumplida del Inspector). Se rellenan cuando el Inspector pasa por cada app.
 * Así que este candado juzga, como `check:parser` y `check:a11y-jsx`, lo que cada commit
 * AÑADE: un fichero nuevo, o una lista cuyas líneas toca el commit. Tocar el `title` de una
 * app antigua no obliga a rellenar su lista; tocar la lista, sí.
 *
 * Fuera, a propósito: las listas que no son literales (`features: FUNCIONES`,
 * `[...BASE, 'x']`), que se resuelven en otro sitio; el tope de 8, que no daña a nadie; y que
 * las características sean CIERTAS, que es trabajo del Inspector.
 *
 * Escape: «features-ok: <razón>» en la línea de la lista o en la anterior. La razón es
 * obligatoria: la marca a secas también rompe.
 * Pruebas: npm run features:probar-candado (reinyecta etiqueta-dgt antes de a97f92ab).
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ_DEFECTO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const iRaiz = process.argv.indexOf('--raiz');
const RAIZ = iRaiz !== -1 ? path.resolve(process.argv[iRaiz + 1]) : RAIZ_DEFECTO;
const TODO = process.argv.includes('--todo');
const SUELTOS = process.argv.slice(2).filter((a, i, todos) => !a.startsWith('--') && todos[i - 1] !== '--raiz');

const MINIMO = 4;
// La razón, en la MISMA línea: con `\s*` el escape saltaba al renglón siguiente y tomaba la
// propia lista por razón (lo cazó el caso 10 de las pruebas).
const ESCAPE = /features-ok:[ \t]*\S[^\n]{2,}/;
const MARCA = /features-ok:/;
const CABECERA_HUNK = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/;

// En Vercel no se ejecuta: el clon es shallow y `git diff HEAD` no significa lo mismo; el build
// local, que es donde manda el flujo del proyecto, ya lo ha pasado antes del push.
if (process.env.VERCEL) {
  console.log('✓ features JSON-LD: omitido en Vercel (se valida en local antes de subir)');
  process.exit(0);
}

const relevante = (f) =>
  f.startsWith('app/') && (f.endsWith('/metadata.ts') || f.endsWith('/layout.tsx'));

function git(args) {
  return execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8' })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Líneas que el commit añade o modifica (numeración actual). `null` = todas (fichero nuevo). */
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
    const m = linea.match(CABECERA_HUNK);
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
        else todos.push(path.relative(RAIZ, abs).replace(/\\/g, '/'));
      }
    };
    rec(path.join(RAIZ, 'app'));
    return todos.filter(relevante);
  }
  try {
    const cambiados = git(['diff', '--name-only', '--diff-filter=ACM', 'HEAD']);
    const nuevos = git(['ls-files', '--others', '--exclude-standard']);
    return [...new Set([...cambiados, ...nuevos])].filter(relevante);
  } catch {
    console.log('✓ features JSON-LD: omitido (no se pudo consultar git)');
    process.exit(0);
  }
}

/** Cambia los comentarios por espacios sin mover ninguna línea ni columna. */
function sinComentarios(texto) {
  let salida = '';
  let i = 0;
  let cadena = null;
  while (i < texto.length) {
    const c = texto[i];
    if (cadena) {
      salida += c;
      if (c === '\\') { salida += texto[i + 1] ?? ''; i += 2; continue; }
      if (c === cadena) cadena = null;
      i++;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { cadena = c; salida += c; i++; continue; }
    if (c === '/' && texto[i + 1] === '/') {
      while (i < texto.length && texto[i] !== '\n') { salida += ' '; i++; }
      continue;
    }
    if (c === '/' && texto[i + 1] === '*') {
      while (i < texto.length && !(texto[i] === '*' && texto[i + 1] === '/')) {
        salida += texto[i] === '\n' ? '\n' : ' ';
        i++;
      }
      salida += '  ';
      i += 2;
      continue;
    }
    salida += c;
    i++;
  }
  return salida;
}

/**
 * Las listas de características del fichero: línea de la clave, líneas que ocupa y cuántos
 * literales tiene. `null` en `literales` si lleva algo que no es un literal (una constante, un
 * spread): esa lista se resuelve en otro sitio y no se juzga aquí.
 */
function listas(texto) {
  const limpio = sinComentarios(texto);
  const lineaDe = (pos) => limpio.slice(0, pos).split('\n').length;
  const encontradas = [];
  for (const m of limpio.matchAll(/\b(features|featureList)\s*:\s*\[/g)) {
    let i = m.index + m[0].length;
    let profundidad = 1;
    let cadena = null;
    let literales = 0;
    let resto = '';
    for (; i < limpio.length && profundidad > 0; i++) {
      const c = limpio[i];
      if (cadena) {
        if (c === '\\') i++;
        else if (c === cadena) cadena = null;
        continue;
      }
      if (c === "'" || c === '"' || c === '`') { cadena = c; literales++; continue; }
      if (c === '[') profundidad++;
      else if (c === ']') { profundidad--; if (profundidad === 0) break; }
      resto += c;
    }
    const soloLiterales = /^[\s,]*$/.test(resto);
    encontradas.push({
      clave: m[1],
      desde: lineaDe(m.index),
      hasta: lineaDe(i),
      literales: soloLiterales ? literales : null,
    });
  }
  return encontradas;
}

// ─── Análisis ─────────────────────────────────────────────────────────────────

const rompen = [];
const pasivo = [];
const barrido = TODO || SUELTOS.length > 0;

for (const rel of objetivos()) {
  const abs = path.join(RAIZ, rel);
  if (!fs.existsSync(abs)) continue;
  const texto = fs.readFileSync(abs, 'utf8');
  const lineas = texto.split('\n');
  const tocadas = barrido ? null : lineasTocadas(rel);

  for (const l of listas(texto)) {
    if (l.literales === null || l.literales >= MINIMO) continue;

    const enLaLista = lineas.slice(Math.max(0, l.desde - 2), l.hasta).join('\n');
    if (ESCAPE.test(enLaLista)) continue;
    const marcaSinRazon = MARCA.test(enLaLista);

    let esDelCommit = false;
    if (!barrido) {
      if (tocadas === null) esDelCommit = true;
      else for (let n = l.desde; n <= l.hasta; n++) if (tocadas.has(n)) { esDelCommit = true; break; }
    }
    const caso = {
      rel,
      n: l.desde,
      queja: `${l.clave} con ${l.literales} característica(s)${marcaSinRazon ? ' · «features-ok:» sin razón' : ''}`,
    };
    (esDelCommit ? rompen : pasivo).push(caso);
  }
}

// ─── Salida ───────────────────────────────────────────────────────────────────

if (rompen.length) {
  console.error('\n✗ Características del JSON-LD — el build se detiene\n');
  for (const c of rompen) console.error(`  ${c.rel}:${c.n}  ${c.queja} (mínimo ${MINIMO})`);
  console.error('\n§1.ter del CLAUDE.md: `features` con 4-8 características REALES, lo que la app');
  console.error('hace de verdad. Es el featureList del WebApplication que leen los asistentes de IA.');
  console.error('Si no aplica, «features-ok: <razón>» en la línea de la lista o en la anterior.\n');
  process.exit(1);
}

if (barrido) {
  if (!pasivo.length) {
    console.log('✓ features JSON-LD: todas las listas revisadas llegan a 4');
  } else {
    const vacias = pasivo.filter((c) => / con 0 /.test(c.queja)).length;
    console.log(`\n· features JSON-LD — ${pasivo.length} lista(s) bajo ${MINIMO} (${vacias} vacías):\n`);
    for (const c of pasivo) console.log(`  ${c.rel}:${c.n}  ${c.queja}`);
    console.log('\nEs el PASIVO: no rompe nada. Se rellena cuando el Inspector pasa por cada app,');
    console.log('que es donde se comprueba qué hace de verdad.\n');
  }
  process.exit(0);
}

console.log(
  pasivo.length
    ? `✓ features JSON-LD: lo que toca este commit está completo (${pasivo.length} lista(s) anteriores bajo ${MINIMO}, sin tocar)`
    : '✓ features JSON-LD: sin listas cortas en lo que toca este commit',
);
