#!/usr/bin/env node
/**
 * probar-check-ternario-traducido.mjs — le reinyecta a `check:ternario-traducido` los casos de
 * los que nació y las formas que NO debe encender.
 *
 * Ejecutar:  npm run ternario:probar-candado
 *
 * Un candado que nunca ha fallado no ha demostrado nada. Los primeros casos son el código REAL,
 * sacado de git en el commit anterior y en el posterior a su reparación:
 *
 *   1. ShareCard antes de ecebbe72 — el Copiar del hallazgo 3314. Debe FALLAR.
 *   2. El mismo, reparado en ecebbe72. Debe CALLAR.
 *   3. cara-o-cruz antes de 9a553aee — la forma de una línea del cabo C0262. Debe FALLAR.
 *   4. calculadora-algebra-booleana antes de 9a553aee — la de varias líneas, con paréntesis.
 *      Debe FALLAR.
 *   5. simulador-fluidos-bernoulli antes de 9a553aee — ternario anidado. Debe FALLAR.
 *   6. Las tres, reparadas en 9a553aee. Deben CALLAR.
 *
 * Lo que NO debe encender:
 *
 *   7. Dos textos (`{a ? 'Copiar' : 'Copiado'}`): React cambia el texto, no retira el nodo.
 *   8. Un ternario en un atributo (`title={a ? 'x' : <b />}` no crea nodos de texto).
 *   9. La forma citada en un comentario.
 *  10. Una hoja que es una variable (`{a ? 'Cargando…' : resultado}`): no se sabe qué guarda.
 *  11. `traduccion-ok: <razón>` con razón escrita.
 *
 * Y lo que SÍ debe encender aunque parezca cubierto:
 *
 *  12. Una plantilla `` `${n} de ${t}` `` frente a un fragmento: es texto suelto igual (lo que
 *      el censo de la tanda no vio en los tres checklist).
 *  13. `traduccion-ok:` a secas, sin razón.
 *  14. SE PLANTA · ningún .tsx que leer.
 *
 * Y la ampliación a dos fragmentos (cabo C0438, 25/10/2026):
 *
 *  15. nave industrial antes de 5ed0e98e (hallazgo 3476). Debe FALLAR.
 *  16. La misma, reparada en 5ed0e98e. Debe CALLAR.
 *  17. terreno rústico antes de 8c473228 (hallazgo 3480). Debe FALLAR.
 *  18. La forma de conversor-colores, medida con la página traducida: cae. Debe FALLAR.
 *  19. Dos fragmentos con la MISMA forma. Debe CALLAR.
 *  20. Fragmento con texto frente a null. Callaba hasta C0312; desde el 31/10/2026 debe FALLAR.
 *  21. La receta, cada fragmento en su span con key. Debe CALLAR.
 *
 * Y el texto que aparece y desaparece (cabo C0312, 31/10/2026):
 *
 *  22. visualizador-germinacion antes de dc07fd4d — `{germinaOK && '…'}`. Debe FALLAR.
 *  23. generador-gitignore antes de c1a69d37 — el plural, medido: cae al quitar y al poner. FALLAR.
 *  24. simulador-grafos antes de 48639006 — fragmentos por modo, medido: cae. Debe FALLAR.
 *  25. Las dos, reparadas en la campaña. Deben CALLAR.
 *  26. `{a ? ' (aprox.)' : null}` con hermanos. Debe FALLAR.
 *  27-31. Lo que NO debe encender: el hijo único, la receta (span siempre montado), el fragmento
 *      hecho span dentro de otro, la plantilla única de un <option> y una variable frente a vacío.
 *
 * Y las tres variantes de generador-anagramas (cabo C0566, 03/11/2026):
 *
 *  32-33. generador-anagramas antes y después de 01b6e467 (hallazgo 3885). FALLAR / CALLAR.
 *  34-38. Cada forma sola: texto del fragmento en una expresión, concatenación, && anidado en un
 *      ternario (frente a texto y frente a un elemento). Deben FALLAR.
 *  39-41. Lo que NO: concatenación como hijo único, una suma de números, la receta. CALLAR.
 *
 * Trabaja sobre mini-catálogos en directorios temporales: no escribe NADA en `app/`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-ternario-traducido.mjs');

const deGit = (rev, ruta) => execFileSync('git', ['show', `${rev}:${ruta}`], { cwd: RAIZ, encoding: 'utf8' });
const SHARE = 'components/ShareCard.tsx';
const MONEDA = 'app/cara-o-cruz/page.tsx';
const BOOLEANA = 'app/calculadora-algebra-booleana/page.tsx';
const BERNOULLI = 'app/simulador-fluidos-bernoulli/page.tsx';
const NAVE = 'app/simulador-gastos-compraventa-nave-industrial/page.tsx';
const RUSTICO = 'app/simulador-gastos-compraventa-terreno-rustico/page.tsx';
const GERMINACION = 'app/visualizador-germinacion/page.tsx';
const GITIGNORE = 'app/generador-gitignore/page.tsx';
const GRAFOS = 'app/simulador-grafos/page.tsx';
const ANAGRAMAS = 'app/generador-anagramas/page.tsx';

const pagina = (cuerpo) => ({ 'app/prueba/page.tsx': `export default function P() {\n  return (\n    <div>\n${cuerpo}\n    </div>\n  );\n}\n` });

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · ShareCard antes de ecebbe72 (hallazgo 3314)', debeFallar: true, ficheros: { [SHARE]: deGit('ecebbe72^', SHARE) } },
  { n: 2, nombre: 'CASO DE ORIGEN REPARADO · ShareCard en ecebbe72', debeFallar: false, ficheros: { [SHARE]: deGit('ecebbe72', SHARE) } },
  { n: 3, nombre: 'CASO DE ORIGEN · cara-o-cruz antes de 9a553aee (una línea)', debeFallar: true, ficheros: { [MONEDA]: deGit('9a553aee^', MONEDA) } },
  { n: 4, nombre: 'CASO DE ORIGEN · algebra-booleana antes de 9a553aee (varias líneas)', debeFallar: true, ficheros: { [BOOLEANA]: deGit('9a553aee^', BOOLEANA) } },
  { n: 5, nombre: 'CASO DE ORIGEN · fluidos-bernoulli antes de 9a553aee (anidado)', debeFallar: true, ficheros: { [BERNOULLI]: deGit('9a553aee^', BERNOULLI) } },
  {
    // booleana y bernoulli, ya sin la forma de C0312 que 9a553aee aún les dejaba (c3843ed6, aac8b3dd)
    n: 6, nombre: 'CASO DE ORIGEN REPARADO · las tres en 9a553aee', debeFallar: false,
    ficheros: { [MONEDA]: deGit('9a553aee', MONEDA), [BOOLEANA]: deGit('c3843ed6', BOOLEANA), [BERNOULLI]: deGit('aac8b3dd', BERNOULLI) },
  },
  { n: 7, nombre: 'dos textos', debeFallar: false, ficheros: pagina("      <button type=\"button\">{a ? 'Copiado' : 'Copiar'}</button>") },
  { n: 8, nombre: 'ternario en un atributo', debeFallar: false, ficheros: pagina("      <Tip contenido={a ? 'x' : <b>y</b>} />") },
  {
    n: 9, nombre: 'la forma citada en un comentario', debeFallar: false,
    ficheros: pagina("      {/* antes: {a ? 'Copiado' : <><span aria-hidden=\"true\">📋</span> Copiar</>} */}\n      <p>hola</p>"),
  },
  { n: 10, nombre: 'una hoja que es una variable', debeFallar: false, ficheros: pagina("      <p>{cargando ? 'Cargando…' : resultado}</p>") },
  {
    n: 11, nombre: 'traduccion-ok: con razón escrita', debeFallar: false,
    ficheros: pagina("      {/* traduccion-ok: el rótulo se fija al montar y no cambia de rama en la misma carga */}\n      <p>{a ? 'Hola' : <><b>!</b> Adiós</>}</p>"),
  },
  {
    n: 12, nombre: 'plantilla frente a fragmento (los checklist)', debeFallar: true,
    ficheros: pagina("      <span>\n        {todo\n          ? <><span aria-hidden=\"true\">✅</span> ¡Listo!</>\n          : `${n} de ${t} verificados`}\n      </span>"),
  },
  {
    n: 13, nombre: 'traduccion-ok: a secas, sin razón', debeFallar: true,
    ficheros: pagina("      {/* traduccion-ok: */}\n      <p>{a ? 'Hola' : <><b>!</b> Adiós</>}</p>"),
  },
  { n: 14, nombre: 'SE PLANTA · ningún .tsx que leer', debeFallar: true, ficheros: {} },
  // Cabo C0438 (25/10/2026): dos fragmentos con texto suelto y distinta forma
  { n: 15, nombre: 'CASO DE ORIGEN · nave industrial antes de 5ed0e98e (hallazgo 3476)', debeFallar: true, ficheros: { [NAVE]: deGit('5ed0e98e^', NAVE) } },
  { n: 16, nombre: 'CASO DE ORIGEN REPARADO · nave industrial en 5ed0e98e', debeFallar: false, ficheros: { [NAVE]: deGit('5ed0e98e', NAVE) } },
  { n: 17, nombre: 'CASO DE ORIGEN · terreno rústico antes de 8c473228 (hallazgo 3480)', debeFallar: true, ficheros: { [RUSTICO]: deGit('8c473228^', RUSTICO) } },
  {
    n: 18, nombre: 'dos fragmentos con texto y distinta forma (conversor-colores, medido: cae)', debeFallar: true,
    ficheros: pagina("      <p>\n        {png ? (\n          <>PNG conserva el color <strong>exacto</strong>.</>\n        ) : (\n          <><span aria-hidden=\"true\">⚠️</span> JPEG remuestrea el color {hex}.</>\n        )}\n      </p>"),
  },
  {
    n: 19, nombre: 'dos fragmentos con la MISMA forma (reescribe el texto en su sitio)', debeFallar: false,
    ficheros: pagina("      <p>{a ? <>Hay <b>{n}</b> filas</> : <>Sin <b>{m}</b> datos</>}</p>"),
  },
  {
    n: 20, nombre: 'fragmento con texto frente a null (C0312: cae aunque no tenga hermanos)', debeFallar: true,
    ficheros: pagina("      <p>{a ? <>Hola <b>!</b></> : null}</p>"),
  },
  {
    n: 21, nombre: 'la receta: cada fragmento en su span con key', debeFallar: false,
    ficheros: pagina("      <p>\n        {png ? (\n          <span key=\"rama-1\">PNG conserva el color <strong>exacto</strong>.</span>\n        ) : (\n          <span key=\"rama-2\"><span aria-hidden=\"true\">⚠️</span> JPEG remuestrea el color {hex}.</span>\n        )}\n      </p>"),
  },
  // Cabo C0312 (31/10/2026): texto suelto que aparece y desaparece junto a hermanos
  { n: 22, nombre: 'CASO DE ORIGEN · visualizador-germinacion antes de dc07fd4d (&&)', debeFallar: true, ficheros: { [GERMINACION]: deGit('dc07fd4d^', GERMINACION) } },
  { n: 23, nombre: 'CASO DE ORIGEN · generador-gitignore antes de c1a69d37 (plural, medido: cae)', debeFallar: true, ficheros: { [GITIGNORE]: deGit('c1a69d37^', GITIGNORE) } },
  { n: 24, nombre: 'CASO DE ORIGEN · simulador-grafos antes de 48639006 (fragmentos, medido: cae)', debeFallar: true, ficheros: { [GRAFOS]: deGit('48639006^', GRAFOS) } },
  {
    n: 25, nombre: 'CASO DE ORIGEN REPARADO · gitignore y grafos tras la campaña', debeFallar: false,
    ficheros: { [GITIGNORE]: deGit('c1a69d37', GITIGNORE), [GRAFOS]: deGit('48639006', GRAFOS) },
  },
  { n: 26, nombre: 'ternario texto frente a null, con hermanos', debeFallar: true, ficheros: pagina("      <p>Total{a ? ' (aprox.)' : null}: {n}</p>") },
  { n: 27, nombre: 'texto con && como hijo ÚNICO (textContent, medido: no cae)', debeFallar: false, ficheros: pagina("      <span>{a && '✓'}</span>") },
  { n: 28, nombre: 'la receta: span siempre montado con la condición dentro', debeFallar: false, ficheros: pagina("      <p>{n} tecnología<span>{n !== 1 ? 's' : ''}</span> seleccionada</p>") },
  { n: 29, nombre: 'la receta: el fragmento pasa a span, dentro de otro siempre montado', debeFallar: false, ficheros: pagina("      <p>Hola <span>{a && <span>y <b>adiós</b></span>}</span></p>") },
  { n: 30, nombre: 'la variante: todo en una plantilla (un <option>)', debeFallar: false, ficheros: pagina("      <select><option>{`${n} hijo${n > 1 ? 's' : ''}`}</option></select>") },
  { n: 31, nombre: 'una hoja que es una variable frente a vacío', debeFallar: false, ficheros: pagina("      <p>Hola {a ? resultado : ''}</p>") },
  // Cabo C0566 (03/11/2026): las tres formas de generador-anagramas (hallazgo 3885) que el
  // candado no veía. Cada una, sola, en su caso sintético; y el fichero real, antes y después.
  { n: 32, nombre: 'CASO DE ORIGEN · generador-anagramas antes de 01b6e467 (hallazgo 3885)', debeFallar: true, ficheros: { [ANAGRAMAS]: deGit('01b6e467^', ANAGRAMAS) } },
  { n: 33, nombre: 'CASO DE ORIGEN REPARADO · generador-anagramas en 01b6e467', debeFallar: false, ficheros: { [ANAGRAMAS]: deGit('01b6e467', ANAGRAMAS) } },
  { n: 34, nombre: 'forma 1 · fragmento cuyo texto va en una expresión, junto a hermanos', debeFallar: true, ficheros: pagina("      <p>Letras: {n}{c > 0 && (<>{' + '}<strong>{c}</strong> comodines</>)}</p>") },
  { n: 35, nombre: 'forma 1 · ...y solo con el texto en expresión, sin JsxText', debeFallar: true, ficheros: pagina("      <p>Letras {c > 0 && (<>{' + '}<strong>{c}</strong></>)}</p>") },
  { n: 36, nombre: 'forma 2 · concatenación de texto que aparece y desaparece', debeFallar: true, ficheros: pagina("      <p>Atril {excedido && `Máximo ${m} letras` + ': se ignoran las demás'}</p>") },
  { n: 37, nombre: 'forma 3 · && anidado en la rama de un ternario', debeFallar: true, ficheros: pagina("      <p>Frase {excedida ? `Máximo ${m}` : largo > 20 && 'Frase larga'}</p>") },
  { n: 38, nombre: 'forma 3 · ...con un elemento en la otra rama', debeFallar: true, ficheros: pagina("      <p>{a ? 'Texto' : b && <b>ojo</b>}</p>") },
  { n: 39, nombre: 'NO debe encender · concatenación como hijo único', debeFallar: false, ficheros: pagina("      <span>{x && 'Hola ' + nombre}</span>") },
  { n: 40, nombre: 'NO debe encender · suma de números', debeFallar: false, ficheros: pagina("      <p>Total {a && n + 1}</p>") },
  { n: 41, nombre: 'NO debe encender · la receta de 01b6e467: span siempre montado', debeFallar: false, ficheros: pagina("      <p>Letras: {n}<span>{c > 0 && <span>{' + '}<strong>{c}</strong></span>}</span></p>") },
];

let fallos = 0;
for (const c of CASOS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'candado-ternario-'));
  try {
    fs.mkdirSync(path.join(dir, 'app'), { recursive: true });
    for (const [rel, contenido] of Object.entries(c.ficheros)) {
      fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
      fs.writeFileSync(path.join(dir, rel), contenido);
    }
    let fallo = false;
    let salida = '';
    try {
      salida = execFileSync(process.execPath, [CANDADO, '--raiz', dir], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
      fallo = true;
      salida = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    }
    const bien = fallo === c.debeFallar;
    if (!bien) fallos++;
    console.log(`${bien ? '✅' : '❌'} ${String(c.n).padStart(2)}. ${c.nombre} — ${c.debeFallar ? 'debe FALLAR' : 'debe CALLAR'}, ${fallo ? 'falla' : 'calla'}`);
    if (!bien || process.env.VER) console.log(salida.split('\n').map((l) => `      ${l}`).join('\n'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

console.log(fallos ? `\n❌ ${fallos} caso(s) no se comportan como deben` : `\n✅ Los ${CASOS.length} casos se comportan como deben`);
process.exit(fallos ? 1 : 0);
