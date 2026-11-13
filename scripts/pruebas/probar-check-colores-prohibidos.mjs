#!/usr/bin/env node
/**
 * probar-check-colores-prohibidos.mjs — le reinyecta a `check:colores-prohibidos` el caso del
 * que nació (C0635) y las formas que NO debe encender.
 *
 * Ejecutar:  npm run colores-prohibidos:probar-candado
 *
 * Cada caso monta un repositorio git temporal con el candado y su ayudante: `antes` se commitea,
 * `despues` queda en el árbol de trabajo (o en un segundo commit, para `--desde`).
 *
 *   1. CASO DE ORIGEN · tablero-comunicacion con «Personas» en #7C3AED, como fichero NUEVO. FALLA.
 *   2. El mismo ya commiteado, y el commit solo añade un comentario arriba. CALLA: es pasivo.
 *   3. El commit cambia esa línea por un token de la marca. CALLA.
 *   4. Una línea nueva con #2DD4BF en un .module.css. FALLA.
 *   5. «colores-ok: <razón>» en la línea anterior. CALLA.
 *   6. «colores-ok:» a secas. FALLA.
 *   7. El color citado en una línea que es solo comentario. CALLA.
 *   8. Un hexadecimal más largo que contiene los seis dígitos (#7C3AEDFF no, #7C3AED0 tampoco
 *      es el color): «#7C3AED80» con alfa SÍ es el violeta. FALLA.
 *   9. `--desde <ref>`: el caso de origen ya commiteado sobre la base. FALLA (el modo de la tarea).
 *
 * No escribe NADA en el repositorio: todo vive en directorios temporales.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPTS = ['scripts/check-colores-prohibidos.mjs', 'scripts/lineas-anadidas.mjs'];
const TABLERO = 'app/tablero-comunicacion/page.tsx';
const ORIGEN = fs.readFileSync(path.join(RAIZ, TABLERO), 'utf8');
const LINEA = "  { id: 'personas',   nombre: 'Personas',    icono: '👨‍👩‍👧', color: '#7C3AED', colorFondo: '#F5F3FF' },";
if (!ORIGEN.includes(LINEA)) {
  console.error('❌ El caso de origen ya no es el que era: tablero-comunicacion no pinta «Personas» en #7C3AED.');
  console.error('   Si se reparó, fija aquí su versión de antes con git show <sha>^:' + TABLERO);
  process.exit(1);
}
const CSS = 'app/prueba/Prueba.module.css';
const TSX = 'app/prueba/page.tsx';

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · tablero-comunicacion, fichero nuevo', falla: true, despues: { [TABLERO]: ORIGEN } },
  { n: 2, nombre: 'pasivo: el commit solo añade un comentario', falla: false, antes: { [TABLERO]: ORIGEN }, despues: { [TABLERO]: `// retocado\n${ORIGEN}` } },
  { n: 3, nombre: 'la línea pasa a un token de la marca', falla: false, antes: { [TABLERO]: ORIGEN }, despues: { [TABLERO]: ORIGEN.replace("color: '#7C3AED'", "color: 'var(--primary-texto)'") } },
  { n: 4, nombre: '#2DD4BF nuevo en un .module.css', falla: true, antes: { [CSS]: '.a { color: red; }\n' }, despues: { [CSS]: '.a { color: red; }\n.b { background: #2dd4bf; }\n' } },
  { n: 5, nombre: 'colores-ok: con razón', falla: false, despues: { [TSX]: "// colores-ok: serie del X observado en el gráfico, color de datos\nconst SERIE = '#7C3AED';\n" } },
  { n: 6, nombre: 'colores-ok: a secas', falla: true, despues: { [TSX]: "// colores-ok:\nconst SERIE = '#7C3AED';\n" } },
  { n: 7, nombre: 'citado en un comentario', falla: false, despues: { [TSX]: "// antes era #7C3AED, el violeta prohibido\nconst A = 1;\n" } },
  { n: 8, nombre: '#7C3AED con alfa pegado (#7C3AED80)', falla: true, despues: { [TSX]: "const SOMBRA = '#7C3AED80';\n" } },
  { n: 9, nombre: '--desde: el origen ya commiteado sobre la base', falla: true, desde: true, despues: { [TABLERO]: ORIGEN } },
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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'colores-prohibidos-'));
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
