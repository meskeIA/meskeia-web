#!/usr/bin/env node
/**
 * probar-check-cromo-fijo.mjs — le reinyecta a `check:cromo-fijo` los casos de los que nació y
 * las formas que NO debe encender.
 *
 * Ejecutar:  npm run cromo-fijo:probar-candado
 *
 * Un candado que nunca ha fallado no ha demostrado nada. Los seis primeros casos son el código
 * REAL de las tres variantes de la copia (cabo C0546), sacado de git antes y después de la campaña,
 * con el `lib/cromoFijo.ts` de después (el de antes no tenía `traerALaVista`: no habría nada que
 * copiar):
 *
 *   1. selector-ejercicio antes — la clave entera. Debe FALLAR.
 *   2. El mismo, importándolo de @/lib. Debe CALLAR.
 *   3. quiz-geografia-espana antes — el tramo del bloque a la clave. Debe FALLAR.
 *   4. El mismo, con traerTramoALaVista. Debe CALLAR.
 *   5. quiz-paises-capitales antes — varias claves. Debe FALLAR.
 *   6. El mismo, reparado. Debe CALLAR.
 *
 * Lo que NO debe encender:
 *
 *   7. Los nombres citados en comentarios.
 *   8. Medir la barra con margenBarraLogo() importado para decidir otra cosa
 *      (simulador-teorema-central-limite, tal cual está).
 *   9. `cromo-ok: <razón>` con razón escrita.
 *
 * Y lo que SÍ debe encender aunque parezca cubierto:
 *
 *  10. `const enfocarSinCentrar = (…) => …`: la copia escrita como flecha.
 *  11. La copia en un componente de `components/`.
 *  12. `cromo-ok:` a secas, sin razón.
 *  13. SE PLANTA · sin lib/cromoFijo.ts no sabe qué nombres buscar.
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
const CANDADO = path.join(RAIZ, 'scripts', 'check-cromo-fijo-copiado.mjs');

const deGit = (rev, ruta) => execFileSync('git', ['show', `${rev}:${ruta}`], { cwd: RAIZ, encoding: 'utf8' });
const ANTES = '5171810e';
const DESPUES = '064409f5';
const LIB = 'lib/cromoFijo.ts';
const EJERCICIO = 'app/selector-ejercicio/page.tsx';
const GEOGRAFIA = 'app/quiz-geografia-espana/page.tsx';
const PAISES = 'app/quiz-paises-capitales/page.tsx';
const TCL = 'app/simulador-teorema-central-limite/page.tsx';

const conLib = (ficheros) => ({ [LIB]: deGit(DESPUES, LIB), ...ficheros });
const pagina = (cuerpo, ruta = 'app/prueba/page.tsx') => conLib({ [ruta]: `${cuerpo}\nexport default function P() {\n  return <div />;\n}\n` });

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · selector-ejercicio antes de la campaña (la clave entera)', debeFallar: true, ficheros: conLib({ [EJERCICIO]: deGit(ANTES, EJERCICIO) }) },
  { n: 2, nombre: 'CASO DE ORIGEN REPARADO · selector-ejercicio importándolo de @/lib', debeFallar: false, ficheros: conLib({ [EJERCICIO]: deGit(DESPUES, EJERCICIO) }) },
  { n: 3, nombre: 'CASO DE ORIGEN · quiz-geografia-espana antes (el tramo del bloque a la clave)', debeFallar: true, ficheros: conLib({ [GEOGRAFIA]: deGit(ANTES, GEOGRAFIA) }) },
  { n: 4, nombre: 'CASO DE ORIGEN REPARADO · quiz-geografia-espana con traerTramoALaVista', debeFallar: false, ficheros: conLib({ [GEOGRAFIA]: deGit(DESPUES, GEOGRAFIA) }) },
  { n: 5, nombre: 'CASO DE ORIGEN · quiz-paises-capitales antes (varias claves)', debeFallar: true, ficheros: conLib({ [PAISES]: deGit(ANTES, PAISES) }) },
  { n: 6, nombre: 'CASO DE ORIGEN REPARADO · quiz-paises-capitales', debeFallar: false, ficheros: conLib({ [PAISES]: deGit(DESPUES, PAISES) }) },
  {
    n: 7, nombre: 'los nombres citados en comentarios', debeFallar: false,
    ficheros: pagina('/** Como la vieja `function traerALaVista(bloque, clave)` de las apps. */\n// const enfocarSinCentrar = …'),
  },
  { n: 8, nombre: 'margenBarraLogo() importado para decidir otra cosa (simulador del TCL)', debeFallar: false, ficheros: conLib({ [TCL]: deGit(DESPUES, TCL) }) },
  {
    n: 9, nombre: 'cromo-ok: con razón escrita', debeFallar: false,
    ficheros: pagina('// cromo-ok: demostración del algoritmo en la propia página, no es la receta\nfunction margenBarraLogo() { return 0; }'),
  },
  {
    n: 10, nombre: 'const enfocarSinCentrar = (…) => …, la copia como flecha', debeFallar: true,
    ficheros: pagina('const enfocarSinCentrar = (b: HTMLElement | null) => { b?.focus({ preventScroll: true }); };'),
  },
  {
    n: 11, nombre: 'la copia en un componente de components/', debeFallar: true,
    ficheros: pagina('function traerALaVista(bloque: HTMLElement | null, clave: HTMLElement | null) {\n  if (!bloque || !clave) return;\n}', 'components/Prueba.tsx'),
  },
  {
    n: 12, nombre: 'cromo-ok: a secas, sin razón', debeFallar: true,
    ficheros: pagina('// cromo-ok:\nfunction traerTramoALaVista() {}'),
  },
  { n: 13, nombre: 'SE PLANTA · sin lib/cromoFijo.ts', debeFallar: true, ficheros: { [EJERCICIO]: deGit(DESPUES, EJERCICIO) } },
  { n: 14, nombre: 'SE PLANTA · ningún .tsx que leer', debeFallar: true, ficheros: conLib({}) },
];

let fallos = 0;
for (const c of CASOS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'candado-cromo-'));
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
