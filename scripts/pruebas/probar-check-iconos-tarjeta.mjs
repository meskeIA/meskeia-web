#!/usr/bin/env node
/**
 * probar-check-iconos-tarjeta.mjs — le reinyecta a `check:iconos-tarjeta` los casos de los que
 * nació y las formas que NO debe encender.
 *
 * Ejecutar:  npm run iconos-tarjeta:probar-candado
 *
 * Un candado que nunca ha fallado no ha demostrado nada. Tres bloques:
 *
 *   A. El detector (`iconosSinOcultar`) sobre fragmentos, con los casos que ya distinguía el
 *      tema C del turno de noche (07/11/2026) y los de las tres clases sin prefijo (C0723). Se
 *      repiten con el detector ESTROPEADO (sin mirar aria-hidden, sin exclusiones) y tienen que
 *      fallar: si no, los casos no prueban nada.
 *   B. El candado entero (el proceso, con `--raiz`) sobre mini-catálogos temporales con el código
 *      REAL sacado de git:
 *        · CASO DE ORIGEN C0723: calculadora-notas antes de 0521446c7 (10 iconos `escenarioIcon` y
 *          `tipIcono` sin aria-hidden, hallazgo 4556). Debe FALLAR. Y después: CALLAR.
 *        · CASO DE ORIGEN C0661: limpiador-texto antes de 9b86f89d (`eduTipIcon`). FALLAR / CALLAR.
 *      Y el escape con razón (calla), sin razón (falla), y que se planta sin fuentes.
 *   C. Que la lista de clases incluye las tres sin prefijo: quitarlas es volver al hueco de C0723.
 *
 * Trabaja sobre directorios temporales: no escribe NADA en `app/`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { iconosSinOcultar, CLASES_ICONO } from '../check-iconos-tarjeta.mjs';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-iconos-tarjeta.mjs');
const deGit = (rev, ruta) => execFileSync('git', ['show', `${rev}:${ruta}`], { cwd: RAIZ, encoding: 'utf8', maxBuffer: 64 << 20 });

let fallos = 0;
const marca = (ok, texto) => { if (!ok) fallos++; console.log(`${ok ? '✓' : '✗'} ${texto}`); };

// ─── A. el detector ──────────────────────────────────────────────────────────
const W = 'app/x/page.tsx';
const casos = [
  ['ORIGEN C0088 · icono de aviso sin aria-hidden', W, '<p>a</p>\n<span className={styles.warningIcon}>⚠️</span>', [2]],
  ['ORIGEN C0723 · escenarioIcon sin prefijo', W, '<div className={styles.escenarioCard}>\n<span className={styles.escenarioIcon}>📚</span>\n<h4>Estudiante</h4>', [2]],
  ['ORIGEN C0723 · tipIcono sin prefijo', W, '<span className={styles.tipIcono}>⚖️</span><h4>x</h4>', [1]],
  ['C0723 · tipIcon en un div', W, '<div className={styles.tipIcon}>💡</div>', [1]],
  ['con aria-hidden no cuenta', W, '<span className={styles.tipIcon} aria-hidden="true">💡</span>', []],
  ['aria-hidden en otra línea de la etiqueta', W, '<span\n  className={styles.eduTipIcon}\n  aria-hidden="true"\n>💡</span>', []],
  ['aria-hidden={true}', W, '<span aria-hidden={true} className={styles.escenarioIcon}>💡</span>', []],
  ["styles['eduEscenarioIcon'] en un div", W, "<div className={styles['eduEscenarioIcon']}>🏢</div>", [1]],
  ['con «>» dentro de las llaves', W, '<span className={styles.warningIcono} onClick={() => f(a > b)}>⚠️</span>', [1]],
  ['ya oculto por dentro (calculadora-suscripciones)', W, '<span className={styles.warningIcon}><span aria-hidden="true">⚠️</span></span>', []],
  ['un span por dentro con texto que se lee sí cuenta', W, '<span className={styles.warningIcon}><span aria-hidden="true">⚠️</span> Ojo</span>', [1]],
  ['clase parecida no es del tema (tipIconBox)', W, '<span className={styles.tipIconBox}>⚠️</span>', []],
  ['un emoji suelto sin la clase no es del tema', W, '<span className={styles.otro}>⚠️</span>', []],
  ['citado en un comentario no cuenta', W, '/* antes: <span className={styles.tipIcon}>💡</span> */\n// <span className={styles.escenarioIcon}>📚</span>\n<p />', []],
  ['excluido: el 🚫 de generador-hashes', 'app/generador-hashes/page.tsx', '<span className={styles.warningIcon}>🚫</span>', []],
  ['el mismo 🚫 en otra app sí cuenta', W, '<span className={styles.warningIcon}>🚫</span>', [1]],
  ['en generador-hashes, un tipIcon con ✅ sí cuenta (la exclusión es de su clase)', 'app/generador-hashes/page.tsx', '<span className={styles.tipIcon}>✅</span>', [1]],
];
const correr = (estropear) => casos.filter(([, rel, texto, esperado]) =>
  JSON.stringify(iconosSinOcultar(texto, rel, estropear).map((c) => c.linea)) !== JSON.stringify(esperado));
const malSano = correr(null);
for (const c of casos) marca(!malSano.includes(c), `A · ${c[0]}`);
for (const [estropear, minimo] of [['sin-aria', 4], ['sin-exclusiones', 1]]) {
  const n = correr(estropear).length;
  marca(n >= minimo, `A · con el detector estropeado (${estropear}) fallan ${n} caso(s) (al menos ${minimo})`);
}

// ─── B. el candado entero ────────────────────────────────────────────────────
function catalogo(ficheros) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iconos-tarjeta-'));
  for (const [rel, txt] of Object.entries(ficheros)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), txt);
  }
  const r = spawnSync(process.execPath, [CANDADO, '--raiz', dir], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  return r;
}
const NOTAS = 'app/calculadora-notas/page.tsx';
const LIMPIADOR = 'app/limpiador-texto/page.tsx';
const casosB = [
  ['CASO DE ORIGEN C0723 · calculadora-notas antes de 0521446c7', true, { [NOTAS]: deGit('0521446c7~1', NOTAS) }, /calculadora-notas\/page\.tsx:\d+ «📚»/],
  ['CASO DE ORIGEN C0723 REPARADO · calculadora-notas en 0521446c7', false, { [NOTAS]: deGit('0521446c7', NOTAS) }],
  ['CASO DE ORIGEN C0661 · limpiador-texto antes de 9b86f89d', true, { [LIMPIADOR]: deGit('9b86f89df~1', LIMPIADOR) }],
  ['CASO DE ORIGEN C0661 REPARADO · limpiador-texto en 9b86f89d', false, { [LIMPIADOR]: deGit('9b86f89df', LIMPIADOR) }],
  ['escape con razón', false, { [W]: '// iconos-tarjeta-ok: el icono es el resultado del dado, no decoración\n<span className={styles.tipIcon}>🎲</span>' }],
  ['escape SIN razón', true, { [W]: '// iconos-tarjeta-ok:\n<span className={styles.tipIcon}>🎲</span>' }, /SIN razón/],
  ['en components/ también', true, { 'components/Tarjeta.tsx': '<span className={styles.escenarioIcon}>📚</span>' }],
  ['SE PLANTA · ninguna fuente que leer', true, { 'README.md': 'nada' }, /no he encontrado/],
];
for (const [nombre, debeFallar, ficheros, salida] of casosB) {
  const r = catalogo(ficheros);
  const fallo = r.status !== 0;
  const texto = `${r.stdout}${r.stderr}`;
  marca(fallo === debeFallar && (!salida || salida.test(texto)), `B · ${nombre} → ${fallo ? 'FALLA' : 'calla'}${debeFallar ? ' (debe fallar)' : ' (debe callar)'}`);
}

// ─── C. la lista ─────────────────────────────────────────────────────────────
for (const c of ['escenarioIcon', 'tipIcon', 'tipIcono']) marca(CLASES_ICONO.includes(c), `C · la lista incluye «${c}» (C0723)`);

console.log(fallos ? `\n${fallos} comprobación(es) mal: check:iconos-tarjeta NO es fiable` : '\ncheck:iconos-tarjeta distingue los casos y falla con los de origen.');
process.exit(fallos ? 1 : 0);
