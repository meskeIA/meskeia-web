#!/usr/bin/env node
/**
 * probar-check-var-css.mjs — le reinyecta a `check:var-css` el caso del que nació y las
 * formas que NO debe encender.
 *
 * Ejecutar:  npm run var-css:probar-candado
 *
 * Un candado que nunca ha fallado no ha demostrado nada. Los dos primeros casos son el código
 * REAL, sacado de git en el commit anterior y en el posterior a su reparación:
 *
 *   1. `transportador-angulos` antes de 48c24779 — `background: var(--card-bg)` en sus tres
 *      tarjetas, con `--card-bg` sin declarar en ningún sitio. Debe FALLAR.
 *   2. El mismo, reparado en 48c24779. Debe CALLAR.
 *
 * Lo que NO debe encender, que es donde un candado se vuelve inútil por gritar de más:
 *
 *   3. `var(--x, reserva)`: con reserva la declaración no se anula.
 *   4. Variable declarada en el propio módulo.
 *   5. Variable puesta en línea desde el TSX de la app (`['--pos' as string]`).
 *   6. Variable de next/font declarada en un `layout.tsx` (`variable: '--font-sora'`).
 *   7. `var(--x)` dentro de un comentario CSS.
 *   8. `var-ok: <razón>` con razón escrita.
 *
 * Y lo que SÍ debe encender aunque parezca cubierto:
 *
 *   9. Variable puesta en línea por el TSX de OTRA app: no llega a esta.
 *  10. `var-ok:` a secas, sin razón.
 *
 * Y las dos maneras de dar verde (o rojo) sin mirar, que deben PLANTARLO:
 *
 *  11. Un globals.css sin `--primary`: el parser ya no encuentra las variables.
 *  12. Un árbol sin ningún `.module.css`.
 *
 * Trabaja sobre mini-catálogos en directorios temporales: no escribe NADA en `app/`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-var-css.mjs');
const GLOBALS = fs.readFileSync(path.join(RAIZ, 'app', 'globals.css'), 'utf8');

const deGit = (rev, ruta) => execFileSync('git', ['show', `${rev}:${ruta}`], { cwd: RAIZ, encoding: 'utf8' });
const TRANSPORTADOR = 'app/transportador-angulos/TransportadorAngulos.module.css';

const modulo = (css, extra = {}) => ({ 'app/prueba/Prueba.module.css': css, ...extra });

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · transportador-angulos antes de 48c24779 (--card-bg)', debeFallar: true, ficheros: { [TRANSPORTADOR]: deGit('48c24779^', TRANSPORTADOR) } },
  { n: 2, nombre: 'CASO DE ORIGEN REPARADO · transportador-angulos en 48c24779', debeFallar: false, ficheros: { [TRANSPORTADOR]: deGit('48c24779', TRANSPORTADOR) } },
  { n: 3, nombre: 'var(--x, reserva)', debeFallar: false, ficheros: modulo('.caja { background: var(--card-bg, #fff); }\n') },
  { n: 4, nombre: 'declarada en el propio módulo', debeFallar: false, ficheros: modulo('.caja { --ancho: 4px; }\n.caja .barra { width: var(--ancho); }\n') },
  {
    n: 5, nombre: 'puesta en línea desde el TSX de la app', debeFallar: false,
    ficheros: modulo('.punto { left: var(--pos); }\n', {
      'app/prueba/page.tsx': "export default function P() { return <div style={{ ['--pos' as string]: '10%' }} />; }\n",
    }),
  },
  {
    n: 6, nombre: 'variable de next/font en un layout.tsx', debeFallar: false,
    ficheros: modulo('.titulo { font-family: var(--font-sora); }\n', {
      'app/layout.tsx': "const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });\n",
    }),
  },
  { n: 7, nombre: 'var(--x) dentro de un comentario', debeFallar: false, ficheros: modulo('/* antes era var(--card-bg) */\n.caja { background: var(--bg-card); }\n') },
  {
    n: 8, nombre: 'var-ok: con razón escrita', debeFallar: false,
    ficheros: modulo('.caja {\n  /* var-ok: la pone un script externo que inyecta el widget del proveedor */\n  color: var(--widget-color);\n}\n'),
  },
  {
    n: 9, nombre: 'puesta en línea por el TSX de OTRA app', debeFallar: true,
    ficheros: modulo('.punto { left: var(--pos); }\n', {
      'app/otra/page.tsx': "export default function P() { return <div style={{ ['--pos' as string]: '10%' }} />; }\n",
    }),
  },
  { n: 10, nombre: 'var-ok: a secas, sin razón', debeFallar: true, ficheros: modulo('.caja {\n  /* var-ok: */\n  color: var(--widget-color);\n}\n') },
  {
    n: 11, nombre: 'SE PLANTA · globals.css sin --primary', debeFallar: true,
    globals: GLOBALS.replace(/--primary\b/g, '--ya-no-es-primary'),
    ficheros: modulo('.caja { background: var(--bg-card); }\n'),
  },
  { n: 12, nombre: 'SE PLANTA · ningún .module.css que leer', debeFallar: true, ficheros: {} },
];

let fallos = 0;
for (const c of CASOS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'candado-var-css-'));
  try {
    fs.mkdirSync(path.join(dir, 'app'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'app', 'globals.css'), c.globals ?? GLOBALS);
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
