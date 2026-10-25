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
 * DE DÓNDE SALE
 * ─────────────
 * Del hallazgo 3314 (cabo C0233): Copiar de ShareCard y los cuatro pies de portal tumbaban la
 * app con la página traducida, reparados en ecebbe72. El cabo C0262 buscó la forma en el
 * catálogo: un grep aproximado daba 75 ficheros, pero el censo exacto dio 20 apariciones en
 * 19 apps, reparadas en 9a553aee (19/10/2026), con su testigo de comportamiento
 * `tests/apps/ternario-traducido-familia.spec.ts`.
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
 *   · El texto que APARECE y DESAPARECE (`{x && 'texto'}`, `{x ? 'texto' : null}`): retirarlo
 *     tiene el mismo riesgo, pero es una forma mucho más común y nadie la ha medido con la página
 *     traducida. Va aparte (cabo de la entrada), no aquí.
 *   · Una hoja que es una VARIABLE o una llamada (`{cargando ? 'Cargando…' : resultado}`): por la
 *     forma del código no se sabe si guarda texto o JSX.
 *   · Dos elementos del mismo tipo SIN `key` y con hijos distintos (`<span>A</span>` frente a
 *     `<span><b /> B</span>`): React reutiliza el `<span>` y retira el texto de dentro. Lo mide
 *     el testigo de familia, que traduce, pulsa y vuelve. (Con fragmentos sí lo mira: arriba.)
 *   · Un fragmento con texto frente a `null` o una variable: es la forma de C0312.
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
// texto suelto frente a otra rama que se pinta (texto o JSX) con otra forma. Una rama vacía o
// variable (`null`, `resultado`) es la forma de C0312, que va aparte.
function cae(ramas) {
  const clases = new Set(ramas.map(clase));
  if (clases.has('texto') && clases.has('jsx')) return 'texto';
  const pintadas = ramas.filter((r) => clase(r) !== 'otro');
  if (!pintadas.some(hijosConTexto)) return null;
  return new Set(pintadas.map(forma)).size > 1 ? 'fragmento' : null;
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
    // Prefiltro barato: sin «?» no hay ternario que mirar
    if (!txt.includes('?')) continue;
    const fuente = ts.createSourceFile(ruta, txt, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const lineas = txt.split('\n');
    const rel = path.relative(RAIZ, ruta).replace(/\\/g, '/');
    const visitar = (nodo) => {
      if (
        ts.isJsxExpression(nodo) && nodo.expression
        && (ts.isJsxElement(nodo.parent) || ts.isJsxFragment(nodo.parent))
        && ts.isConditionalExpression(sinParentesis(nodo.expression))
      ) {
        const tipo = cae(hojas(nodo.expression));
        if (tipo) {
          const linea = fuente.getLineAndCharacterOfPosition(nodo.getStart(fuente)).line + 1;
          const escape = escapeEn(lineas, linea);
          if (escape === 'firmado') exentos.push(`${rel}:${linea}`);
          else {
            const porQue = escape === 'sin razón' ? ' — lleva `traduccion-ok:` SIN razón escrita' : '';
            const que = tipo === 'texto'
              ? 'un ternario alterna texto suelto y JSX'
              : 'un ternario alterna un fragmento con texto suelto y otra rama de distinta forma';
            errores.push(`${rel}:${linea} — ${que}: con la página traducida, al cambiar de rama React retira un nodo de texto que ya no está y la app cae (NotFoundError). Pon cada rama en su elemento con \`key\`: <span key="a">…</span> : <span key="b">…</span>.${porQue}`);
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
