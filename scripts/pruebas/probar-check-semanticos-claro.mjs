#!/usr/bin/env node
/**
 * probar-check-semanticos-claro.mjs — le reinyecta a `check:semanticos-claro` los casos de los
 * que nació (cabo C0296) y las formas que NO debe encender.
 *
 * Ejecutar:  npm run semanticos-claro:probar-candado
 *
 * Un candado que nunca ha fallado no ha demostrado nada. Los cuatro primeros son el código
 * REAL, sacado de git antes y después de su reparación a mano (f9af2556, 19/10/2026):
 *
 *   1. `mi-ip` antes: `--success: #28A745` usado como texto (3,13:1) y los avisos en #b38600
 *      sobre su tinte (3,07:1). Debe FALLAR.
 *   2. El mismo, reparado. Debe CALLAR.
 *   3. `adaptacion-hogar` antes: «Prioritario» #E74C3C sobre #fdf2f2 (3,6:1). Debe FALLAR.
 *   4. El mismo, reparado (f9af2556 se dejó dos verdes a 2,87:1 que el candado vio en su
 *      primera ejecución y reparó la campaña: el reparado es el del lote 1). Debe CALLAR.
 *   5. La forma del hallazgo 3600 (calculadora-legibilidad, 30/10): el semántico como texto
 *      sobre su propio tinte al 20 %. Debe FALLAR.
 *
 * Lo que NO debe encender:
 *
 *   6. La receta: `var(--rojo-texto, #ef4444)`.
 *   7. El color dentro de `[data-theme='dark']` y de `@media (prefers-color-scheme: dark)`.
 *   8. Texto sobre un fondo oscuro de la misma regla, o de una clase antecesora del selector
 *      que el módulo pinta oscura (la consola de simulador-git-ramas, 31/10).
 *   9. Un color que ya cumple (#b91c1c) y uno que no es semántico (un gris, un azul).
 *  10. `semanticos-ok: <razón>` con su razón.
 *  11. Un `::before` (viñeta) que llega a 3:1 aunque no llegue a 4,5.
 *
 * Y lo que SÍ debe encender aunque parezca cubierto:
 *
 *  12. `var(--error)`: el token global sin variante de texto (#F44336, 3,68:1).
 *  13. `var(--rojo-texto)` SIN reserva: en oscuro el token no existe y el color cae a lo heredado.
 *  14. `semanticos-ok:` a secas, sin razón.
 *  15. Un `rgba()` de fondo, que se compone sobre blanco y no se toma por oscuro.
 *
 * Y la manera de dar verde sin mirar, que debe PLANTARLO:
 *
 *  16. Un árbol sin ningún `.module.css`.
 *
 * Trabaja en un directorio temporal: no escribe NADA en `app/`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-semanticos-claro.mjs');
const deGit = (rev, ruta) => execFileSync('git', ['show', `${rev}:${ruta}`], { cwd: RAIZ, encoding: 'utf8' });
const MI_IP = 'app/mi-ip/MiIp.module.css';
const ADAPT = 'app/adaptacion-hogar/AdaptacionHogar.module.css';

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · mi-ip antes de f9af2556', falla: true, css: deGit('f9af2556^', MI_IP) },
  { n: 2, nombre: 'CASO DE ORIGEN REPARADO · mi-ip en f9af2556', falla: false, css: deGit('f9af2556', MI_IP) },
  { n: 3, nombre: 'CASO DE ORIGEN · adaptacion-hogar antes de f9af2556', falla: true, css: deGit('f9af2556^', ADAPT) },
  // f9af2556 reparó los badges pero dejó dos verdes más (.statNumberSuccess, .ayudasCardTitulo,
  // 2,87:1); los reparó el lote 1 de la campaña. La prueba es la que dio la primera ejecución.
  { n: 4, nombre: 'CASO DE ORIGEN REPARADO · adaptacion-hogar tras el lote 1 (b74dc2b6)', falla: false, css: deGit('b74dc2b6', ADAPT) },
  { n: 5, nombre: 'hallazgo 3600 · semántico sobre su propio tinte al 20 %', falla: true, css: '.nivelDificil { background: rgba(239, 68, 68, 0.2); color: #ef4444; }\n' },
  { n: 6, nombre: 'la receta, con reserva', falla: false, css: '.error { color: var(--rojo-texto, #ef4444); }\n.ok { color: var(--verde-texto, var(--success)) !important; }\n' },
  {
    n: 7, nombre: 'el color del tema oscuro', falla: false,
    css: "[data-theme='dark'] .error { color: #ef4444; }\n@media (prefers-color-scheme: dark) {\n  .aviso { color: #f59e0b; }\n}\n",
  },
  {
    n: 8, nombre: 'fondo oscuro en la regla o en una clase antecesora', falla: false,
    css: '.consola { background: #1a1a1a; }\n.consola .linea { color: #4ade80; }\n.terminal { background: #0d1117; color: #3fb950; }\n',
  },
  { n: 9, nombre: 'un rojo que ya cumple y colores no semánticos', falla: false, css: '.a { color: #b91c1c; }\n.b { color: #999999; }\n.c { color: #7FB3D3; }\n' },
  { n: 10, nombre: 'escape con razón', falla: false, css: '/* semanticos-ok: va sobre el lienzo oscuro que pinta el TSX */\n.marca { color: #ef4444; }\n' },
  { n: 11, nombre: 'viñeta ::before entre 3:1 y 4,5:1', falla: false, css: '.lista li::before { content: "•"; color: #e74c3c; }\n' },
  { n: 12, nombre: 'var(--error), token global sin variante de texto', falla: true, css: '.mensaje { color: var(--error); }\n' },
  { n: 13, nombre: 'token de texto SIN reserva', falla: true, css: '.error { color: var(--rojo-texto); }\n' },
  { n: 14, nombre: 'escape sin razón', falla: true, css: '.marca { color: #ef4444; } /* semanticos-ok: */\n' },
  { n: 15, nombre: 'fondo rgba() claro, compuesto sobre blanco', falla: true, css: '.badge { background: rgba(16, 185, 129, 0.1); color: #10b981; }\n' },
];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'semanticos-claro-'));
let mal = 0;
const ejecutar = (args) => spawnSync(process.execPath, [CANDADO, ...args], { cwd: RAIZ, encoding: 'utf8' });
for (const c of CASOS) {
  const f = path.join(tmp, `Caso${c.n}.module.css`);
  fs.writeFileSync(f, c.css);
  const r = ejecutar([f]);
  const fallo = r.status !== 0;
  const bien = fallo === c.falla;
  if (!bien) mal++;
  console.log(`${bien ? '✅' : '❌'} ${String(c.n).padStart(2)}. ${c.nombre} — ${fallo ? 'FALLA' : 'calla'}${bien ? '' : ` (debía ${c.falla ? 'fallar' : 'callar'})`}`);
  if (!bien) console.log((r.stdout + r.stderr).split('\n').slice(0, 8).map((l) => `      ${l}`).join('\n'));
}

// 16. Un árbol sin hojas: el detector, copiado en una raíz vacía, debe plantarse
const vacio = path.join(tmp, 'arbol');
fs.mkdirSync(path.join(vacio, 'scripts', 'contraste-marca'), { recursive: true });
fs.mkdirSync(path.join(vacio, 'scripts', 'contraste-semanticos'), { recursive: true });
fs.mkdirSync(path.join(vacio, 'scripts', 'inspector'), { recursive: true });
fs.mkdirSync(path.join(vacio, 'app'), { recursive: true });
for (const r of ['scripts/check-semanticos-claro.mjs', 'scripts/contraste-marca/clasificar.mjs', 'scripts/contraste-marca/congelados.mjs', 'scripts/contraste-semanticos/censo.mjs', 'scripts/inspector/sincronizar.mjs']) {
  fs.copyFileSync(path.join(RAIZ, r), path.join(vacio, r));
}
const r16 = spawnSync(process.execPath, [path.join(vacio, 'scripts', 'check-semanticos-claro.mjs')], { cwd: vacio, encoding: 'utf8' });
const bien16 = r16.status === 2;
if (!bien16) mal++;
console.log(`${bien16 ? '✅' : '❌'} 16. árbol sin ninguna hoja — salida ${r16.status}${bien16 ? ' (se planta)' : ' (debía plantarse con 2)'}`);

fs.rmSync(tmp, { recursive: true, force: true });
if (mal) {
  console.error(`\n❌ ${mal} caso(s) no se comportan como deben: el candado no es de fiar.`);
  process.exit(1);
}
console.log(`\n✅ check:semanticos-claro — ${CASOS.length + 1} casos como deben (los de origen fallan).`);
