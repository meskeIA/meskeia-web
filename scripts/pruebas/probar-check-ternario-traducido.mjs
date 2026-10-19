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

const pagina = (cuerpo) => ({ 'app/prueba/page.tsx': `export default function P() {\n  return (\n    <div>\n${cuerpo}\n    </div>\n  );\n}\n` });

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · ShareCard antes de ecebbe72 (hallazgo 3314)', debeFallar: true, ficheros: { [SHARE]: deGit('ecebbe72^', SHARE) } },
  { n: 2, nombre: 'CASO DE ORIGEN REPARADO · ShareCard en ecebbe72', debeFallar: false, ficheros: { [SHARE]: deGit('ecebbe72', SHARE) } },
  { n: 3, nombre: 'CASO DE ORIGEN · cara-o-cruz antes de 9a553aee (una línea)', debeFallar: true, ficheros: { [MONEDA]: deGit('9a553aee^', MONEDA) } },
  { n: 4, nombre: 'CASO DE ORIGEN · algebra-booleana antes de 9a553aee (varias líneas)', debeFallar: true, ficheros: { [BOOLEANA]: deGit('9a553aee^', BOOLEANA) } },
  { n: 5, nombre: 'CASO DE ORIGEN · fluidos-bernoulli antes de 9a553aee (anidado)', debeFallar: true, ficheros: { [BERNOULLI]: deGit('9a553aee^', BERNOULLI) } },
  {
    n: 6, nombre: 'CASO DE ORIGEN REPARADO · las tres en 9a553aee', debeFallar: false,
    ficheros: { [MONEDA]: deGit('9a553aee', MONEDA), [BOOLEANA]: deGit('9a553aee', BOOLEANA), [BERNOULLI]: deGit('9a553aee', BERNOULLI) },
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
