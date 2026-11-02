#!/usr/bin/env node
/**
 * skills:historial — el historial de las skills de meskeIA, en un repositorio local sin remoto
 *
 * Ejecutar:  npm run -s skills:historial -- estado
 *            npm run -s skills:historial -- commit "qué cambió y por qué"
 *            npm run -s skills:historial -- log [skill]
 *            npm run -s skills:historial -- diff [skill]
 *
 * POR QUÉ (01/11/2026, auditoría de los procesos de revisión)
 * ───────────────────────────────────────────────────────────
 * `.claude/skills/` está en `.gitignore` porque este repositorio es público y diez skills citan
 * rutas privadas. La consecuencia era que las skills del ciclo (inspector, reparar, parte, campana,
 * turno-noche: ~120 KB, editadas casi a diario, tres el mismo 01/11) no tenían historial: un cambio
 * que rompía una skill no se podía ver ni revertir. Se versionan aquí, en un repositorio local con
 * el directorio de git en `_private/skills-git` (fuera de este repositorio, dentro de la copia
 * crítica diaria) y el árbol de trabajo en `.claude/skills/`. Sin `.git` en la carpeta de las
 * skills: así el repositorio público no la toma por un repositorio anidado y sigue versionando
 * `cuadre` y `trpc-meskeia` como siempre.
 *
 * Es un repositorio sin remoto: el commit no sale del PC (nivel 1 del CLAUDE.md global, §9) y se
 * hace al terminar la conversación que edita una skill. Lo que quede de un día anterior lo barre
 * `/parte` (`barrido-commits.mjs` del Centro de Mando, que conoce este repositorio).
 *
 * EL TAMAÑO SE DICE EN CADA COMMIT
 * ────────────────────────────────
 * Las skills crecían por capas: cada incidente añadía una regla con su crónica, y las tareas
 * desatendidas leen el fichero entero. Desde el 01/11/2026 la crónica va al `HISTORIAL.md` de la
 * carpeta de cada skill, que no se carga, y en el SKILL.md queda la regla con su caso de origen en
 * una línea. `commit` imprime el tamaño de cada SKILL.md tocado y su variación, y avisa por encima
 * de UMBRAL_KB: no rompe nada, pero el número se ve cada vez que una skill crece.
 *
 * Una skill que ya pasó su crónica al HISTORIAL.md y sigue por encima entra en UMBRAL_ACEPTADO,
 * con el tamaño medido y la razón: el aviso de los 25 KB dejaría de informar (siempre saldría y
 * su consejo ya no aplica), pero el de su propio techo sigue cazando que vuelva a crecer. Por
 * skill y no subiendo UMBRAL_KB: con 50 KB para todas callaría audit-meskeia (30,3 KB), cuyo
 * tamaño es procedimiento y no crónica, y que por eso no pasó por el HISTORIAL.md (02/11/2026).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GIT_DIR = path.join(RAIZ, '_private', 'skills-git');
const ARBOL = path.join(RAIZ, '.claude', 'skills');
const UMBRAL_KB = 25;
const UMBRAL_ACEPTADO = {
  // 02/11/2026: crónica movida al HISTORIAL.md (54,8 → 44,6 KB); lo que queda es método y descartes.
  'casos-aula-meskeia': 50,
  // 02/11/2026: casos de origen y Evolución al HISTORIAL.md (39,7 → 33,4 KB); queda kill-list y pasos.
  'semilla-diaria': 40,
};

const git = (...a) => execFileSync('git', [`--git-dir=${GIT_DIR}`, `--work-tree=${ARBOL}`, ...a], {
  encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
});

const kb = (bytes) => (bytes / 1024).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Tamaño de un SKILL.md en el último commit (0 si no estaba). */
function tamanoEnHead(ruta) {
  try { return Buffer.byteLength(git('show', `HEAD:${ruta}`), 'utf8'); } catch { return 0; }
}

function cambiados() {
  return git('status', '--porcelain=v1', '-uall').split('\n').filter(Boolean).map((l) => l.slice(3).replace(/^"|"$/g, ''));
}

function informeTamanos(rutas) {
  const lineas = [];
  for (const r of rutas.filter((x) => x.endsWith('SKILL.md'))) {
    const abs = path.join(ARBOL, r);
    const ahora = fs.existsSync(abs) ? fs.statSync(abs).size : 0;
    const antes = tamanoEnHead(r);
    const delta = ahora - antes;
    const signo = delta > 0 ? '+' : delta < 0 ? '−' : '±';
    const aceptado = UMBRAL_ACEPTADO[r.split('/')[0]];
    const aviso = aceptado
      ? (ahora > aceptado * 1024 ? `  ⚠ pasa de su techo aceptado (${aceptado} KB): ha vuelto a crecer, ¿crónica en el SKILL.md?` : '')
      : (ahora > UMBRAL_KB * 1024 ? `  ⚠ pasa de ${UMBRAL_KB} KB: la crónica, al HISTORIAL.md de su carpeta` : '');
    lineas.push(`${r}: ${kb(ahora)} KB (${signo}${kb(Math.abs(delta))} KB)${aviso}`);
  }
  return lineas;
}

if (!fs.existsSync(GIT_DIR)) {
  console.error(`No existe el repositorio de las skills (${GIT_DIR}). Para crearlo en un PC nuevo:`);
  console.error('  git init --separate-git-dir=_private/skills-git <carpeta temporal> y después');
  console.error('  git --git-dir=_private/skills-git config core.worktree <ruta absoluta de .claude/skills>');
  process.exit(2);
}

const [orden = 'estado', ...resto] = process.argv.slice(2);

if (orden === 'estado') {
  const c = cambiados();
  console.log(c.length ? `Skills sin commit: ${c.length} ficheros\n${c.map((x) => `  ${x}`).join('\n')}` : 'Skills: sin cambios pendientes');
  for (const l of informeTamanos(c)) console.log(`  ${l}`);
} else if (orden === 'commit') {
  const mensaje = resto.join(' ').trim();
  if (!mensaje) { console.error('Falta el mensaje: commit "qué cambió y por qué"'); process.exit(1); }
  const c = cambiados();
  if (!c.length) { console.log('Skills: sin cambios pendientes, nada que commitear'); process.exit(0); }
  const tamanos = informeTamanos(c);
  const skills = [...new Set(c.map((x) => x.split('/')[0]))];
  git('add', '-A');
  git('commit', '-q', '-m', `${skills.join(', ')}: ${mensaje}\n\n${tamanos.join('\n')}`.trim());
  console.log(`Skills: commit ${git('rev-parse', '--short', 'HEAD').trim()} · ${skills.join(', ')}`);
  for (const l of tamanos) console.log(`  ${l}`);
} else if (orden === 'log') {
  console.log(git('log', '--oneline', '-20', '--', ...(resto[0] ? [resto[0]] : [])));
} else if (orden === 'diff') {
  console.log(git('diff', '--stat', ...(resto[0] ? ['--', resto[0]] : [])) || 'Sin cambios');
} else {
  console.error(`Orden desconocida: ${orden}. Usa estado · commit "<mensaje>" · log [skill] · diff [skill]`);
  process.exit(1);
}
