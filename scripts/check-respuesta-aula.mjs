#!/usr/bin/env node
/**
 * Script: check-respuesta-aula.mjs
 *
 * Candado de la RESPUESTA DE AULA LEÍDA A CIEGAS. Se ejecuta antes de cada build
 * (`npm run build`) y a mano con `npm run check:respuesta-aula`.
 *
 * QUÉ PROHÍBE
 * ───────────
 * Que un `CasosAula.tsx` de `app/` lea la respuesta del alumno con `parseSpanishNumber(…)`. Se
 * lee con `leerRespuestaAula(texto, esperado)` de `lib/calculadoras/correctorCasosAula.ts`, que
 * resuelve la única forma ambigua («2.493»: 2,493 o 2493) quedándose con la lectura más cercana
 * a la respuesta esperada. Pasar `parseSpanishNumber` como ARGUMENTO no lo enciende, y así se
 * escapó simulador-punnett (`leerRespuesta(respuesta, datos, parseSpanishNumber)`): se creyó que
 * su `casos.ts` ya decidía que un punto solo es decimal, y no lo decidía; «6.250» para un 6,25 %
 * se leía 6250 (hallazgo 4161, 07/11/2026). Hoy le pasa `(s) => leerRespuestaAula(s, esperado)`.
 *
 * DE DÓNDE SALE
 * ─────────────
 * Del hallazgo 3866 de simulador-estequiometria (01/11/2026): el caso 1 pide 2,493 mol con tres
 * decimales y `parseSpanishNumber` lee «2.493» como dos mil cuatrocientos noventa y tres (un punto
 * con tres cifras detrás agrupa millares en español). Quien escribe el decimal con punto —México,
 * buena parte de Latinoamérica— recibía «Te has desviado 2490,507 mol» con la respuesta correcta.
 * La misma llamada estaba en 27 `CasosAula.tsx` (cabo C0558); la campaña del 01/11/2026 las cambió
 * todas por `leerRespuestaAula` y este candado impide la 28.ª, porque cada `CasosAula` nuevo nace
 * copiando el de su app hermana.
 *
 * SIN PASIVO
 * ──────────
 * Barre todos los `CasosAula.tsx` de `app/`. Tras la campaña no queda ninguna llamada: solo puede
 * encenderlo código nuevo. `--todo` se admite y hace lo mismo, por simetría con los demás.
 *
 * QUÉ NO MIRA, Y POR QUÉ
 * ──────────────────────
 *   · Los comentarios, que nombran `parseSpanishNumber` para explicar qué admite la casilla.
 *   · Las tareas de aula que leen la respuesta en su `page.tsx` o en `casos.ts` (algebra-ecuaciones,
 *     calculadora-escalas, tabla-periodica…): no tienen la forma fija de un `CasosAula.tsx` y en
 *     varias la respuesta no es un número suelto. Se miran app a app (anotado en la entrada de
 *     cabos al cerrar C0558).
 *   · Si `esperado` es de verdad la respuesta: lo comprueban los specs de cada app.
 *
 * ESCAPE
 * ──────
 * `respuesta-aula-ok: <razón>` en la línea o en las tres anteriores. **La razón es obligatoria**:
 * la marca a secas también rompe el build.
 *
 * Sus casos de prueba se le reinyectan con `npm run respuesta-aula:probar-candado`.
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
    else if (e.name === 'CasosAula.tsx') out.push(p);
  }
  return out;
}

/** Quita comentarios conservando los saltos de línea, para no mover los números de línea. */
const sinComentarios = (txt) => txt
  .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

function escapeEn(lineas, n) {
  const trozo = lineas.slice(Math.max(0, n - 4), n).join('\n');
  const m = trozo.match(/respuesta-aula-ok:([^\n]*)/);
  if (!m) return null;
  const razon = m[1].replace(/\*\/.*$/, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
  return /\p{L}{3,}/u.test(razon) ? 'firmado' : 'sin razón';
}

const LLAMADA = /\bparseSpanishNumber\s*\(/g;

const errores = [];
const exentos = [];
const rutas = recorrer(path.join(RAIZ, 'app'));
for (const ruta of rutas) {
  const txt = fs.readFileSync(ruta, 'utf8');
  const limpio = sinComentarios(txt);
  const lineas = txt.split('\n');
  const rel = path.relative(RAIZ, ruta).replace(/\\/g, '/');
  for (const m of limpio.matchAll(LLAMADA)) {
    const linea = limpio.slice(0, m.index).split('\n').length;
    const escape = escapeEn(lineas, linea);
    if (escape === 'firmado') { exentos.push(`${rel}:${linea}`); continue; }
    const porQue = escape === 'sin razón' ? ' — lleva `respuesta-aula-ok:` SIN razón escrita' : '';
    errores.push(`${rel}:${linea} — la respuesta se lee con parseSpanishNumber, que toma «2.493» por dos mil cuatrocientos noventa y tres. Usa \`leerRespuestaAula(texto, esperado)\` de @/lib/calculadoras/correctorCasosAula.${porQue}`);
  }
}

if (rutas.length === 0) {
  console.error(`\n❌ Respuesta de aula: no he encontrado ningún CasosAula.tsx en app/ de ${RAIZ}\n`);
  process.exit(1);
}

if (errores.length) {
  console.error(`\n❌ Respuesta de aula leída con parseSpanishNumber: ${errores.length} sitio(s)\n`);
  for (const e of errores) console.error(`   · ${e}`);
  console.error('');
  process.exit(1);
}

console.log('✅ Respuesta de aula: correcto');
console.log(`   · ${rutas.length} CasosAula.tsx de app/, sin pasivo`);
if (exentos.length) console.log(`   · ${exentos.length} exento(s) con \`respuesta-aula-ok\`: ${exentos.slice(0, 5).join(', ')}`);
