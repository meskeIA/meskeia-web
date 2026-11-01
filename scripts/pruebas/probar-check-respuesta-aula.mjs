#!/usr/bin/env node
/**
 * probar-check-respuesta-aula.mjs — le reinyecta a `check:respuesta-aula` el caso del que nació
 * y las formas que NO debe encender.
 *
 * Ejecutar:  npm run respuesta-aula:probar-candado
 *
 * Un candado que nunca ha fallado no ha demostrado nada. Los cuatro primeros casos son el código
 * REAL de dos de las 27 apps del cabo C0558, sacado de git antes y después de la campaña:
 *
 *   1. simulador-reacciones-quimicas antes — `parseSpanishNumber(respuesta)`, la forma que
 *      suspendía «2.493» para 2,493 (hallazgo 3866, en su hermana estequiometria). Debe FALLAR.
 *   2. El mismo, con leerRespuestaAula. Debe CALLAR.
 *   3. simulador-distribucion-normal antes — la llamada con limpiezas encadenadas de % y signo.
 *      Debe FALLAR.
 *   4. El mismo, reparado. Debe CALLAR.
 *
 * Lo que NO debe encender:
 *
 *   5. `parseSpanishNumber(` citado en un comentario.
 *   6. `parseSpanishNumber` pasado como argumento (simulador-punnett: su casos.ts decide).
 *   7. `respuesta-aula-ok: <razón>` con razón escrita.
 *   8. `parseSpanishNumber(` en un `page.tsx`: fuera del alcance del candado.
 *
 * Y lo que SÍ debe encender aunque parezca cubierto:
 *
 *   9. El CasosAula en `components/` de su app (simulador-genetica lo tiene ahí).
 *  10. `respuesta-aula-ok:` a secas, sin razón.
 *  11. SE PLANTA · ningún CasosAula.tsx que leer.
 *
 * Trabaja sobre mini-catálogos en directorios temporales: no escribe NADA en `app/`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-respuesta-aula.mjs');

const deGit = (rev, ruta) => execFileSync('git', ['show', `${rev}:${ruta}`], { cwd: RAIZ, encoding: 'utf8' });
const ANTES = '54a1d3a9';
const DESPUES = '447183de';
const REACCIONES = 'app/simulador-reacciones-quimicas/CasosAula.tsx';
const NORMAL = 'app/simulador-distribucion-normal/CasosAula.tsx';
const AULA = 'app/prueba/CasosAula.tsx';

const componente = (cuerpo, ruta = AULA) => ({ [ruta]: `export default function C() {\n${cuerpo}\n}\n` });

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · simulador-reacciones-quimicas antes de la campaña', debeFallar: true, ficheros: { [REACCIONES]: deGit(ANTES, REACCIONES) } },
  { n: 2, nombre: 'CASO DE ORIGEN REPARADO · simulador-reacciones-quimicas con leerRespuestaAula', debeFallar: false, ficheros: { [REACCIONES]: deGit(DESPUES, REACCIONES) } },
  { n: 3, nombre: 'CASO DE ORIGEN · simulador-distribucion-normal antes (limpiezas encadenadas)', debeFallar: true, ficheros: { [NORMAL]: deGit(ANTES, NORMAL) } },
  { n: 4, nombre: 'CASO DE ORIGEN REPARADO · simulador-distribucion-normal', debeFallar: false, ficheros: { [NORMAL]: deGit(DESPUES, NORMAL) } },
  {
    n: 5, nombre: 'parseSpanishNumber( citado en comentarios', debeFallar: false,
    ficheros: componente('  /** antes: `parseSpanishNumber(respuesta)` */\n  // parseSpanishNumber(respuesta) leía «2.493» como 2493\n  const valor = leerRespuestaAula(respuesta, esperado);\n  return <div />;'),
  },
  {
    n: 6, nombre: 'parseSpanishNumber pasado como argumento (simulador-punnett)', debeFallar: false,
    ficheros: componente('  const valor = leerRespuesta(respuesta, datos, parseSpanishNumber);\n  return <div />;'),
  },
  {
    n: 7, nombre: 'respuesta-aula-ok: con razón escrita', debeFallar: false,
    ficheros: componente('  // respuesta-aula-ok: lee el número de filas del enunciado, no la respuesta\n  const filas = parseSpanishNumber(enunciado.filas);\n  return <div />;'),
  },
  {
    n: 8, nombre: 'parseSpanishNumber( en un page.tsx, fuera del alcance', debeFallar: false,
    ficheros: {
      ...componente('  const valor = leerRespuestaAula(respuesta, esperado);\n  return <div />;'),
      'app/prueba/page.tsx': 'export default function P() {\n  const n = parseSpanishNumber(texto);\n  return <div />;\n}\n',
    },
  },
  {
    n: 9, nombre: 'el CasosAula en components/ de su app (simulador-genetica)', debeFallar: true,
    ficheros: componente('  const valor = parseSpanishNumber(respuesta);\n  return <div />;', 'app/prueba/components/CasosAula.tsx'),
  },
  {
    n: 10, nombre: 'respuesta-aula-ok: a secas, sin razón', debeFallar: true,
    ficheros: componente('  // respuesta-aula-ok:\n  const valor = parseSpanishNumber(respuesta);\n  return <div />;'),
  },
  { n: 11, nombre: 'SE PLANTA · ningún CasosAula.tsx que leer', debeFallar: true, ficheros: { 'app/prueba/page.tsx': 'export default function P() { return <div />; }\n' } },
];

let fallos = 0;
for (const c of CASOS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'candado-respuesta-aula-'));
  try {
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
