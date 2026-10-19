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
 * encenderlo código nuevo.
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
 *     el testigo de familia, que traduce, pulsa y vuelve.
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
        const clases = new Set(hojas(nodo.expression).map(clase));
        if (clases.has('texto') && clases.has('jsx')) {
          const linea = fuente.getLineAndCharacterOfPosition(nodo.getStart(fuente)).line + 1;
          const escape = escapeEn(lineas, linea);
          if (escape === 'firmado') exentos.push(`${rel}:${linea}`);
          else {
            const porQue = escape === 'sin razón' ? ' — lleva `traduccion-ok:` SIN razón escrita' : '';
            errores.push(`${rel}:${linea} — un ternario alterna texto suelto y JSX: con la página traducida, al cambiar de rama React retira un nodo de texto que ya no está y la app cae (NotFoundError). Pon cada rama en su elemento con \`key\`: <span key="a">…</span> : <span key="b">…</span>.${porQue}`);
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
