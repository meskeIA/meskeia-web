#!/usr/bin/env node
/**
 * probar-check-blanco-semantico.mjs — le reinyecta a `check:blanco-semantico` el caso del que
 * nació (C0659) y las formas que NO debe encender.
 *
 * Ejecutar:  npm run blanco-semantico:probar-candado
 *
 * Cada caso monta un repositorio git temporal con el candado y su ayudante: `antes` se commitea,
 * `despues` queda en el árbol de trabajo (o en un segundo commit, para `--desde`).
 *
 *   1. CASO DE ORIGEN · Cronometro.module.css antes de 10185e81a (.btnPausar, blanco sobre
 *      #f59e0b, 2,15:1), como fichero NUEVO. FALLA.
 *   2. El mismo, reparado en 10185e81a. CALLA.
 *   3. El de antes ya commiteado, y el commit toca otra regla. CALLA: es pasivo.
 *   4. El de antes ya commiteado, y el commit cambia el fondo de .btnPausar por otro ámbar claro
 *      (#fbbf24). FALLA: toca la línea del fondo.
 *   5. Regla nueva con blanco sobre la marca (#2E86AB). CALLA: es de check:contraste-marca.
 *   6. Regla nueva con blanco sobre un ámbar oscuro que llega a 4,5:1 (#b45309, 5,02:1). CALLA.
 *   7. Regla nueva con blanco sobre un azul (#3b82f6): no es semántico. CALLA.
 *   8. «blanco-ok: <razón>» dentro de la regla. CALLA.
 *   9. «blanco-ok:» a secas. FALLA.
 *  10. `--desde <ref>`: el caso de origen ya commiteado sobre la base. FALLA (el modo de la tarea).
 *
 * No escribe NADA en el repositorio: todo vive en directorios temporales.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPTS = ['scripts/check-blanco-semantico.mjs', 'scripts/lineas-anadidas.mjs'];
const CRONO = 'app/cronometro/Cronometro.module.css';
const deGit = (rev, ruta) => execFileSync('git', ['show', `${rev}:${ruta}`], { cwd: RAIZ, encoding: 'utf8' });
const ANTES = deGit('10185e81a^', CRONO);
if (!/\.btnPausar \{[^}]*background: #f59e0b;\s*color: white;/.test(ANTES)) {
  console.error('❌ El caso de origen ya no es el que era: Cronometro.module.css antes de 10185e81a no pone blanco sobre #f59e0b en .btnPausar');
  process.exit(1);
}
const CSS = 'app/prueba/Prueba.module.css';
const regla = (fondo, dentro = '') => `.a {\n  color: var(--text-primary);\n}\n.b {\n${dentro}  background: ${fondo};\n  color: #fff;\n}\n`;

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · cronometro antes de 10185e81a, fichero nuevo', falla: true, despues: { [CRONO]: ANTES } },
  { n: 2, nombre: 'cronometro reparado en 10185e81a', falla: false, despues: { [CRONO]: deGit('10185e81a', CRONO) } },
  { n: 3, nombre: 'pasivo: el commit toca otra regla', falla: false, antes: { [CRONO]: ANTES }, despues: { [CRONO]: `${ANTES}\n.nueva {\n  margin: 0;\n}\n` } },
  { n: 4, nombre: 'el commit cambia el fondo de .btnPausar por otro ámbar claro', falla: true, antes: { [CRONO]: ANTES }, despues: { [CRONO]: ANTES.replace(/(\.btnPausar \{[^}]*background: )#f59e0b/, '$1#fbbf24') } },
  { n: 5, nombre: 'blanco sobre la marca #2E86AB', falla: false, despues: { [CSS]: regla('#2E86AB') } },
  { n: 6, nombre: 'blanco sobre ámbar oscuro #b45309 (5,02:1)', falla: false, despues: { [CSS]: regla('#b45309') } },
  { n: 7, nombre: 'blanco sobre azul #3b82f6, no semántico', falla: false, despues: { [CSS]: regla('#3b82f6') } },
  { n: 8, nombre: 'blanco-ok: con razón dentro de la regla', falla: false, despues: { [CSS]: regla('#22c55e', '  /* blanco-ok: ficha de 32 px en negrita, texto grande a 3:1 */\n') } },
  { n: 9, nombre: 'blanco-ok: a secas', falla: true, despues: { [CSS]: regla('#22c55e', '  /* blanco-ok: */\n') } },
  { n: 10, nombre: '--desde: el origen ya commiteado sobre la base', falla: true, desde: true, despues: { [CRONO]: ANTES } },
];

const escribir = (dir, ficheros) => {
  for (const [rel, txt] of Object.entries(ficheros)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), txt);
  }
};
const g = (dir, ...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

let mal = 0;
for (const c of CASOS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'blanco-semantico-'));
  try {
    g(dir, 'init', '-q', '-b', 'main');
    g(dir, 'config', 'user.name', 'prueba'); g(dir, 'config', 'user.email', 'prueba@local'); g(dir, 'config', 'core.autocrlf', 'false');
    for (const s of SCRIPTS) escribir(dir, { [s]: fs.readFileSync(path.join(RAIZ, s), 'utf8') });
    escribir(dir, c.antes || {});
    g(dir, 'add', '-A'); g(dir, 'commit', '-q', '-m', 'antes');
    const base = g(dir, 'rev-parse', 'HEAD').trim();
    escribir(dir, c.despues);
    const extra = [];
    if (c.desde) { g(dir, 'add', '-A'); g(dir, 'commit', '-q', '-m', 'despues'); extra.push('--desde', base); }
    const r = spawnSync(process.execPath, [path.join(dir, SCRIPTS[0]), ...extra], { cwd: dir, encoding: 'utf8', env: { ...process.env, VERCEL: '' } });
    const fallo = r.status !== 0;
    const ok = fallo === c.falla;
    if (!ok) mal++;
    console.log(`${ok ? '✓' : '✖'} ${c.n}. ${c.nombre} → ${fallo ? 'FALLA' : 'calla'}${ok ? '' : ` (se esperaba ${c.falla ? 'FALLA' : 'calla'})\n${r.stdout}${r.stderr}`}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
console.log(mal ? `\n❌ ${mal} caso(s) mal: el candado NO es fiable` : `\n✅ ${CASOS.length} casos como se esperaba`);
process.exit(mal ? 1 : 0);
