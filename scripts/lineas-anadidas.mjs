/**
 * lineas-anadidas.mjs — lo común de los candados que juzgan «las líneas que el commit añade»
 *
 * Lo usan check-colores-prohibidos, check-blanco-semantico y check-alfa-tres-cifras (13/11/2026).
 * Los anteriores (check-parser-numerico, check-reloj-azar, check-clases-css…) llevan su propia
 * copia de lo mismo; no se migran aquí por migrar: funcionan y tienen su batería.
 *
 * Argumentos que entienden todos:
 *   (nada)          lo que el árbol de trabajo añade frente a HEAD (lo que ejecuta el build)
 *   --desde <ref>   lo añadido desde <ref>, commits incluidos (cabo C0571: la tarea de /reparar
 *                   los pasa así sobre su rama, porque commitea sin build)
 *   --todo          barrido del catálogo entero: informa, NO rompe
 *   <ficheros>      solo esos, enteros: informa, NO rompe
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function argumentos(argv = process.argv.slice(2)) {
  const iDesde = argv.indexOf('--desde');
  return {
    todo: argv.includes('--todo'),
    base: iDesde !== -1 ? argv[iDesde + 1] : 'HEAD',
    sueltos: argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--desde').map((f) => f.replace(/\\/g, '/')),
  };
}

const git = (args, cwd = RAIZ) =>
  // stderr fuera: los avisos de LF/CRLF de git se colaban en la salida del candado
  execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').map((s) => s.trim()).filter(Boolean);

/**
 * Líneas (numeración ACTUAL, 1-based) que el diff frente a `base` añade o modifica en `rel`.
 * `null` = todas: fichero sin seguir o sin diff legible.
 */
export function lineasTocadas(rel, base, cwd = RAIZ) {
  let diff;
  try { diff = git(['diff', '--unified=0', '--no-color', base, '--', rel], cwd); } catch { return null; }
  if (!diff.length) return null;
  const tocadas = new Set();
  for (const l of diff) {
    const m = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(l);
    if (!m) continue;
    const desde = Number(m[1]);
    const cuantas = m[2] === undefined ? 1 : Number(m[2]);
    for (let i = 0; i < cuantas; i++) tocadas.add(desde + i);
  }
  return tocadas;
}

/** Ficheros a juzgar: los cambiados y los nuevos sin seguir, o el árbol entero con --todo. */
export function objetivos({ todo, base, sueltos }, { dirs, relevante, cwd = RAIZ }) {
  if (sueltos.length) return sueltos;
  if (todo) {
    const todos = [];
    const rec = (dir) => {
      if (!fs.existsSync(dir)) return;
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, e.name);
        if (e.isDirectory()) { if (e.name !== 'node_modules') rec(abs); } else todos.push(path.relative(cwd, abs).replace(/\\/g, '/'));
      }
    };
    for (const d of dirs) rec(path.join(cwd, d));
    return todos.filter(relevante);
  }
  const cambiados = git(['diff', '--name-only', '--diff-filter=ACM', base], cwd);
  const nuevos = git(['ls-files', '--others', '--exclude-standard'], cwd);
  return [...new Set([...cambiados, ...nuevos])].filter(relevante);
}

/**
 * ¿Lleva la línea `i` (0-based), o la anterior, la marca de escape CON razón? «marca:» a secas no
 * vale: un escape sin razón no se puede revisar después (igual que legal-ok, marca-ok…).
 */
export function escapada(lineas, i, marca) {
  const re = new RegExp(`${marca}:\\s*\\S{3,}`);
  return re.test(lineas[i]) || (i > 0 && re.test(lineas[i - 1]));
}

/** Línea que es solo comentario (//, /*, * de un bloque, {/* de JSX): no pinta nada. */
export const esComentario = (texto) => /^\s*(\/\/|\/\*|\*|\{\s*\/\*)/.test(texto);
