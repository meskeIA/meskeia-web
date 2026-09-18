#!/usr/bin/env node
/**
 * Aviso de commits sin pushear — el contador del push en lote.
 *
 * POR QUÉ EXISTE (18/09/2026)
 *
 * Desde el 18/09/2026 la política es reparar en el momento y **pushear en lote** con `/push`
 * (ver CLAUDE.md §Flujo de Despliegue y memoria feedback_agrupar_deploys_push): el coste de
 * Vercel lo fija el push, no el commit, y el build es el 65 % de la factura.
 *
 * El precio de diferir el envío es que se puede olvidar, y entonces pasan dos cosas, no una:
 * el trabajo no llega a producción **y se queda sin copia remota** — un commit local no es un
 * respaldo. Este script es el contador que lo dice en voz alta.
 *
 * QUÉ HACE, Y QUÉ NO
 * Cuenta y avisa. **No pushea nada**: automatizar el push se evaluó el 18/09/2026 y se
 * descartó (o va sin build local delante y pierde la red que hace seguro el lote, o lo lleva y
 * choca con «un solo build a la vez» en cuanto hay dos conversaciones abiertas).
 *
 * ⚠️ NO está enganchado a ningún hook, y es deliberado (18/09/2026). Se evaluó ponerlo en
 * `SessionEnd` y lo descartó el usuario con el argumento correcto: hace 5-7 sesiones al día y
 * ya tiene el hábito de pushear al cerrar la jornada, así que el aviso saldría 5-7 veces
 * diarias diciendo lo que él ya sabe. **Un aviso que sale siempre deja de informar**
 * (memoria: feedback_semaforo_color_que_informa) — el mismo motivo por el que el semáforo de la
 * sección 9 del digest dejó de decir nada tras 21 lecturas iguales.
 *
 * Se invoca a mano cuando se quiera saber qué hay sin subir. El paso 1 de `/push` ya hace esta
 * misma comprobación con más detalle, así que en el flujo normal no hace falta.
 *
 * Calla cuando no hay nada que decir, y el toast tiene su propio umbral (>=8 commits o más de
 * 12 h), por si algún día se decide colgarlo de un ritual que corra UNA vez al día.
 *
 * Nunca falla hacia fuera: cualquier error sale en silencio con código 0. Un hook de cierre no
 * puede estropear el cierre de una sesión.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const RAIZ = path.join(process.env.USERPROFILE || process.env.HOME || '', 'meskeia-web');
const TOAST = path.join(process.env.USERPROFILE || process.env.HOME || '', '.claude', 'scripts', 'toast-notify.ps1');

/** Umbrales del toast. El texto no los usa: se imprime siempre que haya algo pendiente. */
const COMMITS_PARA_TOAST = 8;
const HORAS_PARA_TOAST = 12;

function git(...args) {
  return execFileSync('git', ['-C', RAIZ, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    timeout: 10000,
  }).trim();
}

function toast(mensaje) {
  if (!fs.existsSync(TOAST)) return;
  try {
    spawnSync(
      'powershell',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', TOAST, '-Message', mensaje.slice(0, 180)],
      { stdio: 'ignore', windowsHide: true, timeout: 20000 },
    );
  } catch {
    /* que no falle el cierre de sesión porque no haya podido salir una notificación */
  }
}

try {
  if (!fs.existsSync(path.join(RAIZ, '.git'))) process.exit(0);

  // origin/main tal como lo conoce el repo local. NO se hace fetch: este script corre al cerrar
  // sesión y no puede permitirse la latencia ni fallar si no hay red. Como el push a main lo
  // hacemos siempre nosotros, la referencia local va al día salvo que alguien empuje por fuera.
  // Argumento opcional = base contra la que comparar, SOLO para probarlo con commits ya subidos
  // (`node scripts/aviso-push-pendiente.mjs HEAD~5`). Un contador que nunca se ha visto avisar
  // no está probado: sin esto solo se puede comprobar que calla.
  const base = process.argv[2] || 'origin/main';
  const rango = `${base}..HEAD`;

  const pendientes = git('log', '--oneline', rango).split('\n').filter(Boolean);
  if (pendientes.length === 0) process.exit(0);

  const n = pendientes.length;
  // Antigüedad del commit pendiente MÁS VIEJO: es el que lleva más tiempo sin respaldo remoto.
  const masViejo = git('log', '--reverse', '--format=%ct', rango).split('\n')[0];
  const horas = masViejo ? Math.floor((Date.now() / 1000 - Number(masViejo)) / 3600) : 0;

  const tocaApp = git('diff', '--name-only', rango, '--', 'app/').length > 0;
  const plural = n === 1 ? 'commit sin subir' : 'commits sin subir';
  const anti = horas >= 1 ? ` · el más viejo lleva ${horas} h` : '';
  const nota = tocaApp ? ' · el lote toca app/, así que /push refrescará app-dates' : '';

  console.log(`[push pendiente] ${n} ${plural} a Vercel${anti}.${nota}`);
  console.log(`[push pendiente] sin subir no hay copia remota ni despliegue. Lanza /push cuando cierres el lote.`);

  if (n >= COMMITS_PARA_TOAST || horas >= HORAS_PARA_TOAST) {
    toast(`meskeIA: ${n} ${plural}${anti}. Lanza /push.`);
  }
} catch {
  process.exit(0);
}
