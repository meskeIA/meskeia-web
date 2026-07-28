#!/usr/bin/env node
/**
 * generate-app-dates.mjs — fecha real de última modificación de cada app
 *
 * Genera `data/app-dates.json` con { slug: 'YYYY-MM-DD' } a partir del historial
 * de git (último commit que tocó `app/<slug>/`).
 *
 * POR QUÉ (2026-07-28): `app/sitemap.ts` emitía `lastModified: new Date()` en las
 * 983 URLs, así que TODAS cambiaban de fecha en cada deploy — el sitemap declaraba
 * a diario que el catálogo entero se había modificado. Un `lastmod` que siempre
 * miente es un `lastmod` que Google acaba ignorando, y con él se pierde la única
 * vía de señalar qué ha cambiado de verdad.
 *
 * El JSON se COMMITEA y el build solo lo lee: en Vercel el clon puede ser shallow
 * y `git log` no devolvería fechas fiables. Si git falla aquí, se conserva el JSON
 * anterior en vez de escribir datos peores.
 *
 * Uso:  node scripts/generate-app-dates.mjs
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(import.meta.dirname, '..');
const SALIDA = path.join(RAIZ, 'data', 'app-dates.json');

// Guarda: en un clon shallow (Vercel usa --depth por defecto) `git log` solo ve los
// últimos commits y devolvería fechas falsamente recientes para todo el catálogo.
// En ese caso NO se toca el JSON commiteado, que es la fuente buena.
try {
  const shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
    cwd: RAIZ,
    encoding: 'utf8',
  }).trim();
  if (shallow === 'true') {
    console.log('ℹ️  Repositorio shallow (CI): se conserva data/app-dates.json commiteado.');
    process.exit(0);
  }
} catch {
  console.log('ℹ️  git no disponible: se conserva data/app-dates.json commiteado.');
  process.exit(0);
}

let salidaGit;
try {
  // execFileSync (sin shell) y argumentos literales: no hay interpolación posible.
  // Una sola invocación: git log va del commit más reciente al más antiguo, así que
  // la PRIMERA vez que aparece una carpeta es su última modificación.
  salidaGit = execFileSync('git', ['log', '--format=C|%cs', '--name-only', '--', 'app/'], {
    cwd: RAIZ,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
} catch (e) {
  console.error('⚠️  No se pudo leer el historial de git:', e.message);
  console.error('    Se conserva data/app-dates.json tal cual estaba.');
  process.exit(0);
}

const fechas = {};
let fechaActual = null;
for (const linea of salidaGit.split('\n')) {
  if (linea.startsWith('C|')) {
    fechaActual = linea.slice(2).trim();
    continue;
  }
  if (!linea.startsWith('app/') || !fechaActual) continue;
  const slug = linea.split('/')[1];
  if (!slug) continue;
  // Solo la primera aparición (= commit más reciente que tocó esa carpeta)
  if (!fechas[slug]) fechas[slug] = fechaActual;
}

// Aviso si alguna carpeta de app se queda sin fecha (p.ej. nunca commiteada)
const carpetas = readdirSync(path.join(RAIZ, 'app'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && d.name !== 'api')
  .map((d) => d.name);
const sinFecha = carpetas.filter((c) => !fechas[c]);

const anterior = existsSync(SALIDA) ? JSON.parse(readFileSync(SALIDA, 'utf8')) : {};
const ordenado = Object.fromEntries(Object.entries(fechas).sort(([a], [b]) => a.localeCompare(b)));

writeFileSync(SALIDA, JSON.stringify(ordenado, null, 0) + '\n', 'utf8');

const cambiadas = Object.keys(ordenado).filter((k) => anterior[k] !== ordenado[k]).length;
console.log(`✅ data/app-dates.json: ${Object.keys(ordenado).length} carpetas (${cambiadas} con fecha nueva)`);
if (sinFecha.length) {
  console.log(`   ℹ️  sin fecha en git (usarán la del build): ${sinFecha.slice(0, 5).join(', ')}${sinFecha.length > 5 ? '…' : ''}`);
}
