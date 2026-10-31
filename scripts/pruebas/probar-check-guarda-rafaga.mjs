#!/usr/bin/env node
/**
 * probar-check-guarda-rafaga.mjs — le reinyecta a `check:guarda-rafaga` los casos de los que
 * nació y las formas que NO debe encender.
 *
 * Ejecutar:  npm run guarda-rafaga:probar-candado
 *
 * Un candado que nunca ha fallado no ha demostrado nada. Los seis primeros casos son el código
 * REAL de las tres variantes de la copia (cabo C0317), sacado de git antes y después de la campaña:
 *
 *   1. selector-tablet antes de la campaña — guarda en captura sobre window. Debe FALLAR.
 *   2. El mismo, con useGuardaRafaga. Debe CALLAR.
 *   3. selector-smartphone antes — `clicDeMas` por botón, la copia original (hallazgo 2659).
 *      Debe FALLAR.
 *   4. El mismo, reparado. Debe CALLAR.
 *   5. selector-calefaccion antes — `onClickCapture` en el contenedor. Debe FALLAR.
 *   6. El mismo, reparado. Debe CALLAR.
 *
 * Lo que NO debe encender:
 *
 *   7. `detail` > 1 citado en un comentario (lo hacen las cabeceras de la receta).
 *   8. `e.detail === 2`: un manejador que SÍ quiere el doble clic.
 *   9. `rafaga-ok: <razón>` con razón escrita.
 *
 * Y lo que SÍ debe encender aunque parezca cubierto:
 *
 *  10. `e.detail >= 2`, la misma guarda escrita de otra forma.
 *  11. La guarda en un componente de `components/`.
 *  12. `rafaga-ok:` a secas, sin razón.
 *  13. SE PLANTA · ningún .tsx que leer.
 *
 * Trabaja sobre mini-catálogos en directorios temporales: no escribe NADA en `app/`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-guarda-rafaga.mjs');

const deGit = (rev, ruta) => execFileSync('git', ['show', `${rev}:${ruta}`], { cwd: RAIZ, encoding: 'utf8' });
const ANTES = '4c4bbada';
const DESPUES = 'fb3095e8';
const TABLET = 'app/selector-tablet/page.tsx';
const SMARTPHONE = 'app/selector-smartphone/page.tsx';
const CALEFACCION = 'app/selector-calefaccion/page.tsx';

const pagina = (cuerpo, ruta = 'app/prueba/page.tsx') => ({ [ruta]: `export default function P() {\n${cuerpo}\n}\n` });

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · selector-tablet antes de la campaña (captura sobre window)', debeFallar: true, ficheros: { [TABLET]: deGit(ANTES, TABLET) } },
  { n: 2, nombre: 'CASO DE ORIGEN REPARADO · selector-tablet con useGuardaRafaga', debeFallar: false, ficheros: { [TABLET]: deGit(DESPUES, TABLET) } },
  { n: 3, nombre: 'CASO DE ORIGEN · selector-smartphone antes (clicDeMas por botón)', debeFallar: true, ficheros: { [SMARTPHONE]: deGit(ANTES, SMARTPHONE) } },
  { n: 4, nombre: 'CASO DE ORIGEN REPARADO · selector-smartphone con useGuardaRafaga', debeFallar: false, ficheros: { [SMARTPHONE]: deGit(DESPUES, SMARTPHONE) } },
  { n: 5, nombre: 'CASO DE ORIGEN · selector-calefaccion antes (onClickCapture del contenedor)', debeFallar: true, ficheros: { [CALEFACCION]: deGit(ANTES, CALEFACCION) } },
  { n: 6, nombre: 'CASO DE ORIGEN REPARADO · selector-calefaccion con useGuardaRafaga', debeFallar: false, ficheros: { [CALEFACCION]: deGit(DESPUES, CALEFACCION) } },
  {
    n: 7, nombre: '`detail` > 1 citado en comentarios', debeFallar: false,
    ficheros: pagina('  /** el 2.º de una ráfaga: `e.detail > 1` */\n  // if (e.detail > 1) return;\n  return <div />;'),
  },
  {
    n: 8, nombre: 'e.detail === 2: un manejador que quiere el doble clic', debeFallar: false,
    ficheros: pagina('  const f = (e: MouseEvent) => { if (e.detail === 2) seleccionarPalabra(); };\n  return <div onClick={f} />;'),
  },
  {
    n: 9, nombre: 'rafaga-ok: con razón escrita', debeFallar: false,
    ficheros: pagina('  // rafaga-ok: cuenta los clics de un juego de reflejos, no filtra nada\n  const f = (e: MouseEvent) => { if (e.detail > 1) sumar(); };\n  return <div onClick={f} />;'),
  },
  {
    n: 10, nombre: 'e.detail >= 2, la misma guarda escrita de otra forma', debeFallar: true,
    ficheros: pagina('  const f = (e: MouseEvent) => { if (e.detail >= 2 && marca.current) e.stopPropagation(); };\n  return <div onClickCapture={f} />;'),
  },
  {
    n: 11, nombre: 'la guarda en un componente de components/', debeFallar: true,
    ficheros: pagina('  const f = (e: MouseEvent) => { if (e.detail > 1) return; };\n  return <button type="button" onClick={f} />;', 'components/Prueba.tsx'),
  },
  {
    n: 12, nombre: 'rafaga-ok: a secas, sin razón', debeFallar: true,
    ficheros: pagina('  // rafaga-ok:\n  const f = (e: MouseEvent) => { if (e.detail > 1) return; };\n  return <div onClick={f} />;'),
  },
  { n: 13, nombre: 'SE PLANTA · ningún .tsx que leer', debeFallar: true, ficheros: {} },
];

let fallos = 0;
for (const c of CASOS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'candado-rafaga-'));
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
