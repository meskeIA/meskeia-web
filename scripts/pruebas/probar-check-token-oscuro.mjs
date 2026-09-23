#!/usr/bin/env node
/**
 * probar-check-token-oscuro.mjs — le reinyecta a `check:token-oscuro` los dos casos de los
 * que nació y las formas que NO debe encender.
 *
 * Ejecutar:  npm run oscuro:probar-candado
 *
 * Un candado que nunca ha fallado no ha demostrado nada. Los cuatro primeros casos son el
 * código REAL, sacado de git en el commit anterior y en el posterior a su reparación:
 *
 *   1. `calculadora-z-score-altman` tras dd66add0 — `--text-muted: #6E6E6E` en `.container`
 *      y un `[data-theme='dark'] .container` sin él: 2,81:1 en oscuro. Debe FALLAR.
 *   2. El mismo, reparado en 00d698d6. Debe CALLAR.
 *   3. `selector-canal-venta` antes de dfa0ba98 — un `:root` de módulo con la paleta clara,
 *      que en oscuro pisaba los tokens de globals en toda la página. Debe FALLAR.
 *   4. El mismo, reparado. Debe CALLAR.
 *
 * Lo que NO debe encender, que es donde un candado se vuelve inútil por gritar de más:
 *
 *   5. Variante oscura dentro de `@media (prefers-color-scheme: dark)`. La primera versión
 *      del prototipo (con regex) perdía el contexto del @media y la daba por clara.
 *   6. Variante oscura escrita `:global([data-theme='dark']) .container`.
 *   7. Un valor `var(--otro)`, que se resuelve en cada tema.
 *   8. `--primary` sin variante oscura: marca, campaña aparte (472 módulos).
 *   9. Un selector que solo vale en claro, `[data-theme='light'] .caja`.
 *  10. La regla dentro de `@media (max-width)` con su variante oscura fuera del @media.
 *  11. `oscuro-ok: <razón>` con razón escrita.
 *
 * Y lo que SÍ debe encender aunque parezca cubierto:
 *
 *  12. Una lista de selectores `.a, .b` con variante oscura solo para `.a`.
 *  13. `oscuro-ok:` a secas, sin razón.
 *  14. Variante oscura de OTRO token del mismo selector (`--text-secondary` sí, `--text-muted`
 *      no), que es exactamente la forma del caso 1.
 *
 * Y las dos maneras de dar verde sin mirar, que deben PLANTARLO:
 *
 *  15. Un globals.css sin bloque oscuro: la lista de tokens sale vacía.
 *  16. Un árbol sin ningún `.module.css`.
 *
 * Trabaja sobre mini-catálogos en directorios temporales: no escribe NADA en `app/`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-token-oscuro.mjs');
const GLOBALS = fs.readFileSync(path.join(RAIZ, 'app', 'globals.css'), 'utf8');

const deGit = (rev, ruta) => execFileSync('git', ['show', `${rev}:${ruta}`], { cwd: RAIZ, encoding: 'utf8' });
const ZSCORE = 'app/calculadora-z-score-altman/CalculadoraZScoreAltman.module.css';
const CANAL = 'app/selector-canal-venta/SelectorCanalVenta.module.css';

const modulo = (css) => ({ 'app/prueba/Prueba.module.css': css });

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · z-score-altman tras dd66add0', debeFallar: true, ficheros: { [ZSCORE]: deGit('00d698d6^', ZSCORE) } },
  { n: 2, nombre: 'CASO DE ORIGEN REPARADO · z-score-altman en 00d698d6', debeFallar: false, ficheros: { [ZSCORE]: deGit('00d698d6', ZSCORE) } },
  { n: 3, nombre: 'CASO DE ORIGEN · el :root de módulo de selector-canal-venta', debeFallar: true, ficheros: { [CANAL]: deGit('dfa0ba98^', CANAL) } },
  { n: 4, nombre: 'CASO DE ORIGEN REPARADO · selector-canal-venta en dfa0ba98', debeFallar: false, ficheros: { [CANAL]: deGit('dfa0ba98', CANAL) } },
  {
    n: 5, nombre: 'variante oscura dentro de @media (prefers-color-scheme: dark)', debeFallar: false,
    ficheros: modulo('.container { --text-muted: #6E6E6E; }\n@media (prefers-color-scheme: dark) {\n  .container { --text-muted: #9B9B9B; }\n}\n'),
  },
  {
    n: 6, nombre: "variante oscura con :global([data-theme='dark'])", debeFallar: false,
    ficheros: modulo(".container { --bg-card: #FFFFFF; }\n:global([data-theme='dark']) .container { --bg-card: #2A2A2A; }\n"),
  },
  {
    n: 7, nombre: 'valor var(--otro), que se resuelve en cada tema', debeFallar: false,
    ficheros: modulo('.container { --text-muted: var(--text-secondary); }\n'),
  },
  {
    n: 8, nombre: '--primary sin variante oscura: marca, campaña aparte', debeFallar: false,
    ficheros: modulo('.container { --primary: #2E86AB; --secondary: #48A9A6; }\n'),
  },
  {
    n: 9, nombre: "selector que solo vale en claro, [data-theme='light']", debeFallar: false,
    ficheros: modulo("[data-theme='light'] .caja { --text-muted: #6E6E6E; }\n"),
  },
  {
    n: 10, nombre: 'regla en @media (max-width) con su variante oscura fuera', debeFallar: false,
    ficheros: modulo("@media (max-width: 640px) {\n  .caja { --border: #E5E5E5; }\n}\n[data-theme='dark'] .caja { --border: #404040; }\n"),
  },
  {
    n: 11, nombre: 'oscuro-ok: con razón escrita', debeFallar: false,
    ficheros: modulo('/* oscuro-ok: esta caja es siempre clara, lleva texto oscuro fijo en los dos temas */\n.papel { --bg-card: #FFFFFF; }\n'),
  },
  {
    n: 12, nombre: 'lista .a, .b con variante oscura solo para .a', debeFallar: true,
    ficheros: modulo(".a, .b { --text-muted: #6E6E6E; }\n[data-theme='dark'] .a { --text-muted: #9B9B9B; }\n"),
  },
  {
    n: 13, nombre: 'oscuro-ok: a secas, sin razón', debeFallar: true,
    ficheros: modulo('/* oscuro-ok: */\n.papel { --bg-card: #FFFFFF; }\n'),
  },
  {
    n: 14, nombre: 'variante oscura de OTRO token del mismo selector (la forma del caso 1)', debeFallar: true,
    ficheros: modulo(".container {\n  --text-secondary: #666666;\n  --text-muted: #6E6E6E;\n}\n[data-theme='dark'] .container {\n  --text-secondary: #B0B0B0;\n}\n"),
  },
  {
    n: 15, nombre: 'SE PLANTA · globals.css sin bloque oscuro', debeFallar: true,
    globals: GLOBALS.replace(/\[data-theme="dark"\]\s*\{/g, '.ya-no-es-oscuro {'),
    ficheros: modulo('.container { --text-muted: var(--text-secondary); }\n'),
  },
  { n: 16, nombre: 'SE PLANTA · ningún .module.css que leer', debeFallar: true, ficheros: {} },
];

let fallos = 0;
for (const c of CASOS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'candado-oscuro-'));
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
