#!/usr/bin/env node
/**
 * probar-check-footer-tracker.mjs — le reinyecta a `check:footer-tracker` los casos de los que
 * nació y las formas que NO debe encender.
 *
 * Ejecutar:  npm run footer-tracker:probar-candado
 *
 * Un candado que nunca ha fallado no ha demostrado nada. Los seis primeros casos son el código
 * REAL, sacado de git en el commit anterior y en el posterior a su reparación:
 *
 *   1. test-perfil-inversor antes de bbb70c9b — tres `return` con su `<Footer appName>` cada
 *      uno (hallazgos 2175 y 2176: seis visitas por carga). Debe FALLAR.
 *   2. El mismo, reparado en bbb70c9b (un solo árbol). Debe CALLAR.
 *   3. selector-vehiculo antes de 090b9eb0 — tres Footer sin `key` (cabo C0042). Debe FALLAR.
 *   4. El mismo, con `key="pie"` en 090b9eb0. Debe CALLAR.
 *   5. quiz-tipos-plantas antes de 498e33d6 — dos Footer sin `key` (C0224). Debe FALLAR.
 *   6. El mismo, con el tracker fuera del Footer en 498e33d6. Debe CALLAR.
 *
 * Lo que NO debe encender:
 *
 *   7. `key={'pie'}` en uno y `key="pie"` en otro: la misma clave escrita de dos formas.
 *   8. `<Footer appName>` citado en un comentario (lo que tiene test-perfil-inversor hoy).
 *   9. Varios `<Footer />` SIN appName, que no montan tracker.
 *  10. `footer-ok: <razón>` con razón escrita.
 *
 * Y lo que SÍ debe encender aunque parezca cubierto:
 *
 *  11. Dos `key` distintas: React los trata como componentes distintos.
 *  12. `footer-ok:` a secas, sin razón.
 *  13. SE PLANTA · ningún .tsx que leer.
 *
 * La segunda forma (27/10/2026, cabo C0472), un `<AnalyticsTracker>` suelto junto al del pie:
 *
 *  14. calculadora-propinas antes de 8cc9f09a. Debe FALLAR.  15. Reparada. Debe CALLAR.
 *  16. Tracker suelto con un `<Footer />` sin appName (quiz-tipos-plantas). Debe CALLAR.
 *  17. `footer-ok: <razón>` en el tracker. Debe CALLAR.  18. El tracker en un comentario. CALLAR.
 *
 * Trabaja sobre mini-catálogos en directorios temporales: no escribe NADA en `app/`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-footer-tracker.mjs');

const deGit = (rev, ruta) => execFileSync('git', ['show', `${rev}:${ruta}`], { cwd: RAIZ, encoding: 'utf8' });
const PERFIL = 'app/test-perfil-inversor/page.tsx';
const VEHICULO = 'app/selector-vehiculo/page.tsx';
const PLANTAS = 'app/quiz-tipos-plantas/page.tsx';
const PROPINAS = 'app/calculadora-propinas/page.tsx';

const pagina = (cuerpo) => ({ 'app/prueba/page.tsx': `export default function P() {\n${cuerpo}\n}\n` });

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · test-perfil-inversor antes de bbb70c9b', debeFallar: true, ficheros: { [PERFIL]: deGit('bbb70c9b^', PERFIL) } },
  { n: 2, nombre: 'CASO DE ORIGEN REPARADO · test-perfil-inversor en bbb70c9b', debeFallar: false, ficheros: { [PERFIL]: deGit('bbb70c9b', PERFIL) } },
  { n: 3, nombre: 'CASO DE ORIGEN · selector-vehiculo antes de 090b9eb0', debeFallar: true, ficheros: { [VEHICULO]: deGit('090b9eb0^', VEHICULO) } },
  { n: 4, nombre: 'CASO DE ORIGEN REPARADO · selector-vehiculo en 090b9eb0', debeFallar: false, ficheros: { [VEHICULO]: deGit('090b9eb0', VEHICULO) } },
  { n: 5, nombre: 'CASO DE ORIGEN · quiz-tipos-plantas antes de 498e33d6', debeFallar: true, ficheros: { [PLANTAS]: deGit('498e33d6^', PLANTAS) } },
  { n: 6, nombre: 'CASO DE ORIGEN REPARADO · quiz-tipos-plantas en 498e33d6', debeFallar: false, ficheros: { [PLANTAS]: deGit('498e33d6', PLANTAS) } },
  {
    n: 7, nombre: "key={'pie'} y key=\"pie\": la misma clave", debeFallar: false,
    ficheros: pagina("  if (a) return <div><Footer key={'pie'} appName=\"x\" /></div>;\n  return <div><p /><Footer key=\"pie\" appName=\"x\" /></div>;"),
  },
  {
    n: 8, nombre: '<Footer appName> citado en un comentario', debeFallar: false,
    ficheros: pagina("  /* antes: `<Footer appName=\"x\" />` en cada fase */\n  // <Footer appName=\"x\" />\n  return <div><Footer appName=\"x\" /></div>;"),
  },
  {
    n: 9, nombre: 'varios <Footer /> sin appName', debeFallar: false,
    ficheros: pagina('  if (a) return <div><Footer /></div>;\n  return <div><p /><Footer /></div>;'),
  },
  {
    n: 10, nombre: 'footer-ok: con razón escrita', debeFallar: false,
    ficheros: pagina("  if (a) return (\n    <div>\n      {/* footer-ok: rama de error de ruta, nunca sigue a otra fase en la misma carga */}\n      <Footer appName=\"x\" />\n    </div>\n  );\n  return <div><p /><Footer key=\"pie\" appName=\"x\" /></div>;"),
  },
  {
    n: 11, nombre: 'dos key distintas', debeFallar: true,
    ficheros: pagina("  if (a) return <div><Footer key=\"pie\" appName=\"x\" /></div>;\n  return <div><p /><Footer key=\"pie2\" appName=\"x\" /></div>;"),
  },
  {
    n: 12, nombre: 'footer-ok: a secas, sin razón', debeFallar: true,
    ficheros: pagina("  if (a) return (\n    <div>\n      {/* footer-ok: */}\n      <Footer appName=\"x\" />\n    </div>\n  );\n  return <div><p /><Footer key=\"pie\" appName=\"x\" /></div>;"),
  },
  { n: 13, nombre: 'SE PLANTA · ningún .tsx que leer', debeFallar: true, ficheros: {} },
  // Segunda forma (cabo C0472): un <AnalyticsTracker> suelto junto al del <Footer appName>
  // La forma de calculadora-propinas antes y después de su reparación, escrita aquí y no sacada
  // de git: el commit se hizo en la rama de /reparar y su sha puede cambiar al integrarlo
  {
    n: 14, nombre: 'CASO DE ORIGEN · la forma de calculadora-propinas (tracker suelto + Footer appName)', debeFallar: true,
    ficheros: { [PROPINAS]: "import AnalyticsTracker from '@/components/AnalyticsTracker';\nexport default function P() {\n  return (\n    <>\n      {/* Analytics v2.1 */}\n      <AnalyticsTracker applicationName=\"calculadora-propinas\" />\n      <ShareCard appName=\"Calculadora de Propinas\" />\n      <Footer appName=\"Calculadora de Propinas\" />\n    </>\n  );\n}\n" },
  },
  {
    n: 15, nombre: 'CASO DE ORIGEN REPARADO · calculadora-propinas con solo el tracker del pie', debeFallar: false,
    ficheros: { [PROPINAS]: "export default function P() {\n  return (\n    <>\n      <ShareCard appName=\"calculadora-propinas\" />\n      <Footer appName=\"calculadora-propinas\" />\n    </>\n  );\n}\n" },
  },
  {
    n: 16, nombre: 'tracker suelto con un <Footer /> SIN appName (la forma de quiz-tipos-plantas)', debeFallar: false,
    ficheros: pagina('  return <div><AnalyticsTracker appName="x" /><Footer /></div>;'),
  },
  {
    n: 17, nombre: 'tracker suelto + Footer appName con footer-ok: y razón', debeFallar: false,
    ficheros: pagina('  return (\n    <div>\n      {/* footer-ok: el suelto registra otra aplicación, la ficha de la puerta */}\n      <AnalyticsTracker appName="y" />\n      <Footer appName="x" />\n    </div>\n  );'),
  },
  {
    n: 18, nombre: '<AnalyticsTracker> citado en un comentario junto a un Footer appName', debeFallar: false,
    ficheros: pagina('  // antes: <AnalyticsTracker appName="x" /> suelto\n  return <div><Footer appName="x" /></div>;'),
  },
];

let fallos = 0;
for (const c of CASOS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'candado-footer-'));
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
