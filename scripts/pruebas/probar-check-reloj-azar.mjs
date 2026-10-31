#!/usr/bin/env node
/**
 * probar-check-reloj-azar.mjs — le reinyecta a `check:reloj-azar` los casos de los que nació y
 * las formas que NO debe encender.
 *
 * Ejecutar:  npm run reloj-azar:probar-candado
 *
 * El candado juzga lo que el commit AÑADE, así que cada caso monta un repositorio git temporal:
 * `antes` se commitea, `despues` se deja en el árbol de trabajo, y el candado mira el diff.
 *
 *   1. CASO DE ORIGEN · control-gastos antes de 8a4c1c03 (la fecha de hoy en el inicializador
 *      de useState), como fichero NUEVO. Debe FALLAR.
 *   2. El mismo, reparado en 8a4c1c03 (la fecha se pone al montar). Debe CALLAR.
 *   3. El de antes ya commiteado, y el commit solo añade un comentario. Debe CALLAR: es pasivo.
 *   4. planificador-mascota antes de e3ba909f: el `max` del input de fecha calculado en el
 *      render (forma B), fichero nuevo. Debe FALLAR.
 *   5. El mismo, reparado en e3ba909f. Debe CALLAR.
 *   6. generador-actas reparado (e3ba909f) y el commit le devuelve la fecha del build DENTRO del
 *      objeto multilínea del useState, la forma que el grep de una línea no veía. Debe FALLAR.
 *   7. simulador-kmeans antes de a59e60ca (hallazgo alto del 29/09/2026): el azar llega al
 *      useState a través de una función local. Debe FALLAR.
 *   8. El mismo, reparado en a59e60ca (PRNG sembrado). Debe CALLAR.
 *   9. `new Date(2026, 0, 1)`, con argumentos, en el inicializador. Debe CALLAR.
 *  10. Math.random en un manejador de clic, no en el inicializador. Debe CALLAR.
 *  11. La receta: `max={hoy || undefined}` con `hoy` en un estado que se fija al montar. CALLAR.
 *  12. Un parámetro tapa a una constante de módulo con la fecha: no es la misma. Debe CALLAR.
 *  13. `max` de un input NUMÉRICO con el año en curso: fuera del alcance, a propósito. CALLAR.
 *  14. `reloj-ok: <razón>` en la línea anterior. Debe CALLAR.
 *  15. `reloj-ok:` a secas. Debe FALLAR.
 *  16. `hoyISOLocal()` sin argumentos en el inicializador: el ayudante canónico también lee el
 *      reloj. Debe FALLAR.
 *
 * No escribe NADA en el repositorio: todo vive en directorios temporales.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-reloj-azar.mjs');

const deGit = (rev, ruta) => execFileSync('git', ['show', `${rev}:${ruta}`], { cwd: RAIZ, encoding: 'utf8' });
const version = (rev, ruta) => ({ [ruta]: deGit(rev, ruta) });

const GASTOS = 'app/control-gastos/page.tsx';
const MASCOTA = 'app/planificador-mascota/page.tsx';
const ACTAS = 'app/generador-actas/page.tsx';
const KMEANS = 'app/simulador-kmeans/page.tsx';

const GASTOS_ANTES = version('8a4c1c03^', GASTOS);
const ACTAS_REPARADO = version('e3ba909f', ACTAS);
if (!GASTOS_ANTES[GASTOS].includes("useState(() => new Date().toISOString().split('T')[0])")) {
  console.error('❌ El caso de origen ya no es el que era: control-gastos antes de 8a4c1c03 no inicializa la fecha con new Date()');
  process.exit(1);
}
if (!ACTAS_REPARADO[ACTAS].includes("    fecha: '',\n")) {
  console.error("❌ generador-actas en e3ba909f ya no trae «fecha: ''» en su estado inicial");
  process.exit(1);
}

const TSX = 'app/prueba/page.tsx';
const pagina = (cuerpo, arriba = '') => ({
  [TSX]: `'use client';\nimport { useState, useEffect } from 'react';\nimport { hoyISOLocal } from '@/lib';\n${arriba}\nexport default function Prueba() {\n${cuerpo}\n}\n`,
});

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · control-gastos antes de 8a4c1c03, fichero nuevo', debeFallar: true, despues: GASTOS_ANTES },
  { n: 2, nombre: 'CASO DE ORIGEN REPARADO · control-gastos en 8a4c1c03', debeFallar: false, despues: version('8a4c1c03', GASTOS) },
  {
    n: 3, nombre: 'pasivo: el commit solo añade un comentario', debeFallar: false,
    antes: GASTOS_ANTES,
    despues: { [GASTOS]: GASTOS_ANTES[GASTOS].replace("'use client';", "'use client';\n// retocado") },
  },
  { n: 4, nombre: 'planificador-mascota antes de e3ba909f: max del input de fecha en el render', debeFallar: true, despues: version('e3ba909f^', MASCOTA) },
  { n: 5, nombre: 'planificador-mascota reparado en e3ba909f', debeFallar: false, despues: version('e3ba909f', MASCOTA) },
  {
    n: 6, nombre: 'generador-actas: la fecha del build vuelve al objeto multilínea del useState', debeFallar: true,
    antes: ACTAS_REPARADO,
    despues: { [ACTAS]: ACTAS_REPARADO[ACTAS].replace("    fecha: '',\n", "    fecha: new Date().toISOString().split('T')[0],\n") },
  },
  { n: 7, nombre: 'simulador-kmeans antes de a59e60ca: el azar llega por una función local', debeFallar: true, despues: version('a59e60ca^', KMEANS) },
  { n: 8, nombre: 'simulador-kmeans reparado en a59e60ca (PRNG sembrado)', debeFallar: false, despues: version('a59e60ca', KMEANS) },
  {
    n: 9, nombre: 'new Date con argumentos en el inicializador', debeFallar: false,
    despues: pagina('  const [d] = useState(() => new Date(2026, 0, 1).getMonth());\n  return <p>{d}</p>;'),
  },
  {
    n: 10, nombre: 'Math.random en un manejador, no en el inicializador', debeFallar: false,
    despues: pagina('  const [n, setN] = useState(0);\n  return <button type="button" onClick={() => setN(Math.random())}>{n}</button>;'),
  },
  {
    n: 11, nombre: 'la receta: el tope se fija al montar', debeFallar: false,
    despues: pagina("  const [hoy, setHoy] = useState('');\n  useEffect(() => { setHoy(hoyISOLocal()); }, []);\n  return <input type=\"date\" max={hoy || undefined} />;"),
  },
  {
    n: 12, nombre: 'un parámetro tapa a la constante de módulo con la fecha', debeFallar: false,
    despues: pagina('  const f = (hoy: string) => useState(hoy);\n  return <p>{String(f)}</p>;', 'const hoy = new Date().toISOString();\n'),
  },
  {
    n: 13, nombre: 'max de un input numérico con el año en curso (fuera del alcance)', debeFallar: false,
    despues: pagina('  return <input type="number" max={new Date().getFullYear()} />;'),
  },
  {
    n: 14, nombre: 'reloj-ok: con razón', debeFallar: false,
    despues: pagina('  // reloj-ok: lo que depende del mes espera a montado, el HTML servido no lo pinta\n  const [mes] = useState(() => new Date().getMonth());\n  return <p>{mes}</p>;'),
  },
  {
    n: 15, nombre: 'reloj-ok: a secas', debeFallar: true,
    despues: pagina('  // reloj-ok:\n  const [mes] = useState(() => new Date().getMonth());\n  return <p>{mes}</p>;'),
  },
  {
    n: 16, nombre: 'hoyISOLocal() sin argumentos en el inicializador', debeFallar: true,
    despues: pagina('  const [fecha] = useState(hoyISOLocal());\n  return <input type="date" value={fecha} readOnly />;'),
  },
];

const escribir = (dir, ficheros) => {
  for (const [rel, contenido] of Object.entries(ficheros)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), contenido);
  }
};
const gitEn = (dir, args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

let fallos = 0;
for (const c of CASOS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'candado-reloj-azar-'));
  try {
    gitEn(dir, ['init', '-q']);
    gitEn(dir, ['config', 'user.email', 'pruebas@localhost']);
    gitEn(dir, ['config', 'user.name', 'pruebas']);
    gitEn(dir, ['config', 'core.autocrlf', 'false']);
    escribir(dir, { 'LEEME.txt': 'base\n', ...(c.antes ?? {}) });
    gitEn(dir, ['add', '-A']);
    gitEn(dir, ['commit', '-q', '-m', 'base']);
    escribir(dir, c.despues);

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
