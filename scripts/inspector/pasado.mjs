/**
 * pasado.mjs — un lector de ficheros que ve el repositorio como estaba ANTES de unos commits
 * concretos, y como está HOY en todo lo demás (cabo C0161).
 *
 * Lo usa `cerrar.mjs --revalidar-commits`: con la receta de `huella.mjs` y este lector, la
 * huella de una app sale como si esos commits no se hubieran hecho. Si coincide con la huella
 * que tenía cuando se inspeccionó, esos commits explican TODO lo que ha cambiado desde
 * entonces, y nada más.
 *
 * Cómo se construye el pasado: `base` es el padre del commit más antiguo de la lista. Para cada
 * fichero que tocaron los commits dados, su contenido «de antes» es el de `base` (o no existía).
 * Eso solo es verdad si DESDE `base` ningún commit AJENO a la lista tocó ese fichero: si no, el
 * pasado escondería también ese otro cambio, que nadie ha verificado. Esos ficheros salen en
 * `noExplicados` y la app que los lea se queda en la cola. Lo mismo si el fichero tiene cambios
 * sin commitear: lo que hay en disco no es lo que dicen los commits.
 *
 * Solo admite commits de la historia de primer padre de HEAD, que es como se trabaja aquí.
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const git = (raiz, args) => execFileSync('git', args, { cwd: raiz, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });

export function lectorEnElPasado(raiz, shas) {
  if (!shas.length) throw new Error('hace falta al menos un commit');
  const historia = git(raiz, ['rev-list', '--first-parent', 'HEAD']).trim().split('\n');
  const commits = shas.map((s) => {
    const completo = git(raiz, ['rev-parse', '--verify', `${s}^{commit}`]).trim();
    const pos = historia.indexOf(completo);
    if (pos === -1) throw new Error(`${s} no está en la historia de primer padre de HEAD`);
    return { sha: completo, pos };
  });
  const dados = new Set(commits.map((c) => c.sha));
  const masAntiguo = commits.reduce((a, b) => (b.pos > a.pos ? b : a));
  const base = git(raiz, ['rev-parse', `${masAntiguo.sha}^`]).trim();

  // Qué ficheros tocó cada commit desde base, en una sola llamada
  const porFichero = new Map();
  let actual = null;
  for (const linea of git(raiz, ['log', '--format=@@%H', '--name-only', '--no-renames', `${base}..HEAD`]).split('\n')) {
    if (linea.startsWith('@@')) { actual = linea.slice(2); continue; }
    if (!linea.trim() || !actual) continue;
    const s = porFichero.get(linea) ?? new Set();
    s.add(actual);
    porFichero.set(linea, s);
  }
  const tocados = new Set([...porFichero].filter(([, cs]) => [...cs].some((c) => dados.has(c))).map(([f]) => f));
  const sucios = new Set(git(raiz, ['diff', '--name-only', 'HEAD']).trim().split('\n').filter(Boolean));
  const noExplicados = new Map();
  for (const f of tocados) {
    const ajenos = [...porFichero.get(f)].filter((c) => !dados.has(c));
    if (ajenos.length) noExplicados.set(f, `también lo tocó ${ajenos.map((c) => c.slice(0, 8)).join(', ')}`);
    else if (sucios.has(f)) noExplicados.set(f, 'tiene cambios sin commitear');
  }
  const enBase = new Set(git(raiz, ['ls-tree', '-r', '--name-only', base]).split('\n').filter(Boolean));

  const cache = new Map();
  const rel = (p) => path.relative(raiz, p).replace(/\\/g, '/');
  const contenidoBase = (r) => {
    if (!cache.has(r)) cache.set(r, git(raiz, ['show', `${base}:${r}`]));
    return cache.get(r);
  };
  const ficheroVirtual = (nombre) => ({ name: nombre, isDirectory: () => false, isFile: () => true });

  const fsv = {
    existsSync(p) {
      const r = rel(p);
      return tocados.has(r) ? enBase.has(r) : fs.existsSync(p);
    },
    statSync(p) {
      return tocados.has(rel(p)) ? { isFile: () => true, isDirectory: () => false } : fs.statSync(p);
    },
    readFileSync(p) {
      const r = rel(p);
      if (!tocados.has(r)) return fs.readFileSync(p, 'utf8');
      if (!enBase.has(r)) throw new Error(`${r} no existía antes de esos commits`);
      return contenidoBase(r);
    },
    readdirSync(d, opciones) {
      const dr = rel(d);
      const reales = fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : [];
      // Lo que añadieron los commits no estaba; lo que borraron, sí
      const entradas = reales.filter((e) => {
        const r = dr ? `${dr}/${e.name}` : e.name;
        return !(e.isFile() && tocados.has(r) && !enBase.has(r));
      });
      for (const r of tocados) {
        if (path.posix.dirname(r) !== dr || !enBase.has(r)) continue;
        const nombre = path.posix.basename(r);
        if (!entradas.some((e) => e.name === nombre)) entradas.push(ficheroVirtual(nombre));
      }
      return opciones?.withFileTypes ? entradas : entradas.map((e) => e.name);
    },
  };

  return { fsv, base, tocados, noExplicados, commits: commits.map((c) => c.sha) };
}
