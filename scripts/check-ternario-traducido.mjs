#!/usr/bin/env node
/**
 * Script: check-ternario-traducido.mjs
 *
 * Candado del TERNARIO QUE TUMBA LA PÁGINA TRADUCIDA. Se ejecuta antes de cada build
 * (`npm run build`) y a mano con `npm run check:ternario-traducido`.
 *
 * QUÉ PROHÍBE
 * ───────────
 * Un ternario en posición de hijo JSX que alterna un TEXTO SUELTO y JSX:
 *
 *   {copiado ? '✓ Copiado' : <><span aria-hidden="true">📋</span> Copiar</>}
 *
 * El traductor del navegador (Chrome, Edge) cambia cada nodo de texto por un `<font>`. React
 * sigue guardando el nodo de texto original, y al cambiar de rama lo retira con `removeChild`
 * de un padre que ya no lo contiene: NotFoundError y la pantalla «Algo salió mal». La receta
 * es cada rama en su elemento con `key`:
 *
 *   {copiado ? <span key="si">✓ Copiado</span> : <span key="no"><span aria-hidden="true">📋</span> Copiar</span>}
 *
 * Se miran las HOJAS del ternario, también anidado y entre paréntesis: basta con que una sea
 * un literal de texto no vacío (comillas o plantilla) y otra sea JSX (elemento o fragmento).
 *
 * Y, desde el cabo C0438 (25/10/2026), dos FRAGMENTOS que alternan cuando al menos uno lleva
 * texto suelto entre sus hijos directos y no tienen la misma forma (la secuencia de texto,
 * etiquetas y expresiones):
 *
 *   {png ? <>PNG conserva el color <strong>exacto</strong>.</> : <><span>⚠️</span> JPEG …</>}
 *
 * El fragmento no lleva key ni etiqueta: React compara sus hijos por posición y, donde la otra
 * rama pone otra cosa, retira el nodo de texto. Es la forma de los hallazgos 3476 y 3480
 * (compraventa de nave y de terreno rústico); medida el 25/10/2026 en conversor-colores, que
 * caía al pasar de PNG a JPEG. Dos fragmentos con la MISMA forma reescriben el texto en su
 * sitio y no caen (se quedan viejos: cabo C0243, que esto no mira).
 *
 * Y, desde el cabo C0312 (31/10/2026), el TEXTO QUE APARECE Y DESAPARECE junto a hermanos:
 *
 *   {n} tecnología{n !== 1 ? 's' : ''} seleccionada   ·   {modo === 'move' && <>Modo mover…</>}
 *
 * Un `&&` o un ternario cuyas hojas son texto suelto (o un fragmento con texto) y vacías
 * (`''`, `null`, `false`, `undefined`), en un elemento con más hijos. Al retirarlo, React quita
 * un nodo de texto que ya es un <font> (removeChild); al AÑADIRLO, lo inserta delante del
 * hermano de texto siguiente, que tampoco está (insertBefore). Las dos caen: medido el
 * 31/10/2026 en generador-gitignore (de 3 a 1 tecnologías y de 1 a 2) y simulador-grafos
 * (cambiar de modo). Un fragmento con texto cae aunque no tenga hermanos: sus hijos son varios
 * nodos. Como hijo ÚNICO de su elemento, un texto no cae: React lo cambia con textContent.
 * Receta: un elemento SIEMPRE montado con la condición dentro, `<span>{n !== 1 ? 's' : ''}</span>`
 * (`<tspan>` dentro de un `<text>` de SVG), y el fragmento pasa a `<span>`. Donde no cabe un
 * span (un `<option>`, un padre flex con `gap`), todo el contenido en una sola plantilla:
 * `{`${n} hijo${n > 1 ? 's' : ''}`}`. ⚠️ `{x && <span>texto</span>}` NO basta: arregla retirar
 * pero no insertar (era la receta de dc07fd4d, y gitignore seguía cayendo al pasar de 1 a 2).
 *
 * DE DÓNDE SALE
 * ─────────────
 * Del hallazgo 3314 (cabo C0233): Copiar de ShareCard y los cuatro pies de portal tumbaban la
 * app con la página traducida, reparados en ecebbe72. El cabo C0262 buscó la forma en el
 * catálogo: un grep aproximado daba 75 ficheros, pero el censo exacto dio 20 apariciones en
 * 19 apps, reparadas en 9a553aee (19/10/2026), con su testigo de comportamiento
 * `tests/apps/ternario-traducido-familia.spec.ts`.
 *
 * La forma del texto que aparece y desaparece, del cabo C0312: dc07fd4d (visualizador-germinacion
 * y analizador-titulos-seo) y los hallazgos 3407 (simulador-fluidos-bernoulli), 3491, 3494,
 * 3502 (compraventa) y 3541 (sonometro). Censo el 31/10/2026: 591 apariciones en 222 ficheros,
 * reparadas en la campaña c3843ed6…d34e9b8f, con texto visible y captura iguales antes y
 * después en las 221 rutas afectadas.
 *
 * SIN PASIVO
 * ──────────
 * Barre `app/` y `components/` enteros. Tras 9a553aee no queda ninguna aparición: solo puede
 * encenderlo código nuevo. La forma de los fragmentos dio 49 apariciones en 40 ficheros al
 * nacer, reparadas en la misma tanda con la receta (cada fragmento-hoja en un <span key>, o un
 * <div key> si sus hijos son bloques).
 *
 * QUÉ NO MIRA, Y POR QUÉ
 * ──────────────────────
 *   · Un ELEMENTO que aparece y desaparece delante de un texto (`{x && <b>…</b>} sigue`):
 *     insertarlo cae igual (insertBefore sobre un texto traducido), pero la forma está en todo el
 *     catálogo y no se ha medido cuánto. Va a su cabo, no aquí.
 *   · Una hoja que es una VARIABLE o una llamada (`{cargando ? 'Cargando…' : resultado}`): por la
 *     forma del código no se sabe si guarda texto o JSX.
 *   · Dos elementos del mismo tipo SIN `key` y con hijos distintos (`<span>A</span>` frente a
 *     `<span><b /> B</span>`): React reutiliza el `<span>` y retira el texto de dentro. Lo mide
 *     el testigo de familia, que traduce, pulsa y vuelve. (Con fragmentos sí lo mira: arriba.)
 *   · Un texto o un fragmento frente a una VARIABLE (`{a ? 'x' : resultado}`): no se sabe qué guarda.
 *   · Los ternarios de un atributo (`title={a ? 'x' : 'y'}`): no crean nodos de texto.
 *
 * ESCAPE
 * ──────
 * `traduccion-ok: <razón>` en la línea del ternario o en las tres anteriores (un comentario
 * JSX). **La razón es obligatoria**: la marca a secas también rompe el build.
 *
 * Sus casos de prueba se le reinyectan con `npm run ternario:probar-candado`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const RAIZ_DEFECTO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const iRaiz = process.argv.indexOf('--raiz');
const RAIZ = iRaiz !== -1 ? path.resolve(process.argv[iRaiz + 1]) : RAIZ_DEFECTO;
const CARPETAS = ['app', 'components'];

function recorrer(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') recorrer(p, out); }
    else if (e.name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

// ─── Hojas del ternario ────────────────────────────────────────────────────────
function sinParentesis(n) {
  while (ts.isParenthesizedExpression(n)) n = n.expression;
  return n;
}

function hojas(n) {
  n = sinParentesis(n);
  return ts.isConditionalExpression(n) ? [...hojas(n.whenTrue), ...hojas(n.whenFalse)] : [n];
}

function clase(n) {
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text.trim() ? 'texto' : 'otro';
  if (ts.isTemplateExpression(n)) return 'texto';
  if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) return 'jsx';
  return 'otro';
}

// Un fragmento con texto suelto entre sus hijos directos (C0438). El fragmento no lleva `key` ni
// etiqueta propia: al cambiar de rama React compara sus hijos por posición, y donde la otra rama
// tiene otra cosa retira el nodo de texto, que con la página traducida ya es un <font>.
function hijosConTexto(n) {
  return ts.isJsxFragment(n) && n.children.some((h) => ts.isJsxText(h) && h.text.trim() !== '');
}

// La forma de los hijos de una rama: «T» por texto, la etiqueta por elemento, «{}» por
// expresión. Dos fragmentos con la misma forma reescriben su texto en el sitio y no caen (lo que
// sí pasa es que el texto se queda viejo, cabo C0243, que este candado no mira).
function forma(n) {
  if (!ts.isJsxFragment(n)) return `<${clase(n)}>`;
  return n.children
    .filter((h) => !(ts.isJsxText(h) && h.text.trim() === ''))
    .map((h) => {
      if (ts.isJsxText(h)) return 'T';
      if (ts.isJsxExpression(h)) return h.expression ? '{}' : '';
      if (ts.isJsxElement(h)) return h.openingElement.tagName.getText();
      if (ts.isJsxSelfClosingElement(h)) return h.tagName.getText();
      return '<>';
    })
    .filter(Boolean)
    .join(' ');
}

// ¿Cae al cambiar de rama? Texto suelto frente a JSX (la forma de origen), o un fragmento con
// texto suelto frente a otra rama que se pinta (texto o JSX) con otra forma. Una rama vacía la
// mira `apareceYDesaparece` (C0312); una variable (`resultado`), nadie.
function cae(ramas) {
  const clases = new Set(ramas.map(clase));
  if (clases.has('texto') && clases.has('jsx')) return 'texto';
  const pintadas = ramas.filter((r) => clase(r) !== 'otro');
  if (!pintadas.some(hijosConTexto)) return null;
  return new Set(pintadas.map(forma)).size > 1 ? 'fragmento' : null;
}

// ─── Texto que aparece y desaparece (C0312) ───────────────────────────────────
const vacia = (n) => n.kind === ts.SyntaxKind.NullKeyword || n.kind === ts.SyntaxKind.FalseKeyword
  || (ts.isIdentifier(n) && n.text === 'undefined')
  || ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && n.text === '');
const sinVacios = (hijos) => hijos.filter((h) => !(ts.isJsxText(h) && h.text.trim() === '') && !(ts.isJsxExpression(h) && !h.expression));

// `{x && 'texto'}`, `{x ? 'texto' : null}` o lo mismo con un fragmento con texto: lo que se pinta
// es texto suelto y la otra posibilidad es nada. Cae si comparte padre con otros hijos (React
// retira o inserta un nodo de texto entre hermanos), o siempre si es un fragmento (sus hijos ya
// son varios nodos). Como hijo único, el texto se cambia con textContent y no cae.
function apareceYDesaparece(nodo) {
  const e = sinParentesis(nodo.expression);
  let pintadas;
  if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
    pintadas = [sinParentesis(e.right)];
  } else if (ts.isConditionalExpression(e)) {
    const hs = hojas(e);
    pintadas = hs.filter((h) => !vacia(h));
    if (pintadas.length === hs.length) return false;
  } else return false;
  if (!pintadas.every((h) => clase(h) === 'texto' || hijosConTexto(h))) return false;
  return pintadas.some(hijosConTexto) || sinVacios(nodo.parent.children).length > 1;
}

// ─── Escape ────────────────────────────────────────────────────────────────────
function escapeEn(lineas, n) {
  const trozo = lineas.slice(Math.max(0, n - 4), n).join('\n');
  const m = trozo.match(/traduccion-ok:([^\n]*)/);
  if (!m) return null;
  const razon = m[1].replace(/\*\/.*$/, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
  return /\p{L}{3,}/u.test(razon) ? 'firmado' : 'sin razón';
}

// ─── Barrido ───────────────────────────────────────────────────────────────────
const errores = [];
const exentos = [];
let ficheros = 0;
for (const carpeta of CARPETAS) {
  for (const ruta of recorrer(path.join(RAIZ, carpeta))) {
    ficheros++;
    const txt = fs.readFileSync(ruta, 'utf8');
    // Prefiltro barato: sin «?» ni «&&» no hay nada que mirar
    if (!txt.includes('?') && !txt.includes('&&')) continue;
    const fuente = ts.createSourceFile(ruta, txt, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const lineas = txt.split('\n');
    const rel = path.relative(RAIZ, ruta).replace(/\\/g, '/');
    const visitar = (nodo) => {
      if (
        ts.isJsxExpression(nodo) && nodo.expression
        && (ts.isJsxElement(nodo.parent) || ts.isJsxFragment(nodo.parent))
      ) {
        const esTernario = ts.isConditionalExpression(sinParentesis(nodo.expression));
        const tipo = (esTernario && cae(hojas(nodo.expression))) || (apareceYDesaparece(nodo) ? 'aparece' : null);
        if (tipo) {
          const linea = fuente.getLineAndCharacterOfPosition(nodo.getStart(fuente)).line + 1;
          const escape = escapeEn(lineas, linea);
          if (escape === 'firmado') exentos.push(`${rel}:${linea}`);
          else {
            const porQue = escape === 'sin razón' ? ' — lleva `traduccion-ok:` SIN razón escrita' : '';
            if (tipo === 'aparece') {
              errores.push(`${rel}:${linea} — un texto suelto aparece y desaparece junto a otros hijos: con la página traducida, React lo retira o lo inserta junto a un nodo de texto que ya no está y la app cae (NotFoundError). Pon la condición DENTRO de un elemento siempre montado: <span>{n !== 1 ? 's' : ''}</span> (y un fragmento, como <span>); en un <option> o un padre flex con gap, todo el contenido en una plantilla. {x && <span>…</span>} no basta: sigue cayendo al insertar.${porQue}`);
            } else {
              const que = tipo === 'texto'
                ? 'un ternario alterna texto suelto y JSX'
                : 'un ternario alterna un fragmento con texto suelto y otra rama de distinta forma';
              errores.push(`${rel}:${linea} — ${que}: con la página traducida, al cambiar de rama React retira un nodo de texto que ya no está y la app cae (NotFoundError). Pon cada rama en su elemento con \`key\`: <span key="a">…</span> : <span key="b">…</span>.${porQue}`);
            }
          }
        }
      }
      ts.forEachChild(nodo, visitar);
    };
    visitar(fuente);
  }
}

if (ficheros === 0) {
  console.error(`\n❌ Ternario que tumba la página traducida: no he leído ningún .tsx en ${CARPETAS.join('/ ni ')}/ de ${RAIZ}\n`);
  process.exit(1);
}

if (errores.length) {
  console.error(`\n❌ Ternario que tumba la página traducida: ${errores.length} problema(s)\n`);
  for (const e of errores) console.error(`   · ${e}`);
  console.error('');
  process.exit(1);
}

console.log('✅ Ternario que tumba la página traducida: correcto');
console.log(`   · ${ficheros} ficheros .tsx de ${CARPETAS.join('/ y ')}/, sin pasivo`);
if (exentos.length) console.log(`   · ${exentos.length} exento(s) con \`traduccion-ok\`: ${exentos.slice(0, 5).join(', ')}`);
