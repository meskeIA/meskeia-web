#!/usr/bin/env node
/**
 * check-catalogo-cliente.mjs — que los catálogos enteros no viajen al navegador
 *
 * Ejecutar:  npm run check:catalogo-cliente      (lo ejecuta también `npm run build`)
 *            npm run catalogo:probar-candado     (reinyecta los casos de origen)
 *
 * QUÉ EXIGE
 * ─────────
 * Sigue los imports de forma TRANSITIVA (no basta mirar el fichero: el catálogo llegaba a
 * través de `lib/dailyApps.ts`) y rompe si:
 *
 *   1. Un fichero `'use client'` de `app/`, `components/` o `lib/` alcanza
 *      `data/app-relations.ts`. Las relacionadas se resuelven en el servidor: el layout de
 *      cada app monta `<ConRelacionadas slug="…">` y la página pinta `<RelatedApps />`.
 *   2. El barrel `components/index.ts` alcanza `data/applications.ts` o `data/app-relations.ts`.
 *      Lo importan casi todas las apps, y Turbopack lo funde en UN módulo: lo que alcance
 *      uno de sus componentes lo descargan todas. Un componente que necesite el catálogo
 *      (Sidebar, DailyApps) se importa por su ruta, fuera del barrel.
 *
 * `data/applications.ts` en un fichero cliente que NO pasa por el barrel sí se permite: la
 * portada y `/apps/` lo necesitan de verdad para buscar en el catálogo.
 *
 * DE DÓNDE SALE
 * ─────────────
 * De la P1 del digest del 08/10/2026. Dos chunks comunes a casi todo el catálogo:
 *   · 692.214 B (221.110 B en brotli) en 925 de 1.021 páginas: el barrel exportaba Sidebar,
 *     SidebarMobile y DailyApps, que importan `data/applications.ts`.
 *   · 733.730 B (158.392 B en brotli) en 1.005 páginas: `getRelatedApps('slug')` dentro de
 *     cada página `'use client'`, para pintar 4 tarjetas.
 * Juntos eran el 52 % del JS comprimido de `generador-tonos`, y 7 de los 9 ficheros con
 * `ChunkLoadError` desde el 01/09 pesaban entre 689 y 730 KB. No son la causa de esas caídas
 * (la red: `lupa-digital` cayó con un fichero de 34 KB), pero sí su mayor exposición. Nada lo
 * delataba: el build pasaba y las apps se veían igual.
 *
 * SIN PASIVO · ESCAPE
 * ───────────────────
 * Nace con los dos casos corregidos en el mismo cambio. Escape: `catalogo-ok: <razón>` en la
 * línea del import (o en la anterior); ese import no se recorre. La razón es obligatoria.
 *
 * QUÉ NO MIRA
 * ───────────
 * Solo los imports de la CABECERA del fichero (hasta la primera línea que no es import,
 * export-from, comentario o directiva) y los `import('…')` dinámicos. Así un import citado en
 * una cadena —`conversor-markdown-html` tenía uno en el texto de ejemplo— no cuenta. Un import
 * estático escrito a mitad de fichero se escaparía; en este repositorio no hay ninguno.
 * Ignora `import type` y los imports cuyos nombres son todos `type X`: no generan código.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function raizPedida() {
  const i = process.argv.indexOf('--raiz');
  return i !== -1 && process.argv[i + 1] ? path.resolve(process.argv[i + 1]) : null;
}
const RAIZ = raizPedida() ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (f) => path.relative(RAIZ, f).split(path.sep).join('/');

const RELACIONES = path.join(RAIZ, 'data/app-relations.ts');
const CATALOGO = path.join(RAIZ, 'data/applications.ts');
const BARREL = path.join(RAIZ, 'components/index.ts');

for (const f of [RELACIONES, CATALOGO, BARREL]) {
  if (!fs.existsSync(f)) {
    // Si cambia de sitio, el candado se quedaría mirando a la nada en verde
    console.error(`✗ check:catalogo-cliente — no existe ${rel(f)}: actualiza las rutas del candado`);
    process.exit(1);
  }
}

// ── Lectura de imports ─────────────────────────────────────────────────────────
const cacheImports = new Map();
const errores = [];

/** Recorre la cabecera sentencia a sentencia y devuelve { espec, linea } de cada import. */
function importsDe(fichero) {
  if (cacheImports.has(fichero)) return cacheImports.get(fichero);
  const src = fs.readFileSync(fichero, 'utf8').replace(/\r\n/g, '\n');
  const lineas = src.split('\n');
  const lineaDe = (pos) => src.slice(0, pos).split('\n').length - 1;
  const res = [];
  let pos = 0;
  const RE_HUECO = /^(?:\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/|(['"])use (?:client|server)\1;?)/;
  // La cláusula solo admite lo que cabe en un import (nombres, llaves, comas, `* as`): con
  // `[\s\S]*?`, un `export default function` saltaba hasta el siguiente «from» del fichero
  const RE_SENT = /^(import|export)\s+(type\s+)?([\w\s{},*$]*?)\bfrom\s*(['"])([^'"]+)\4;?|^import\s*(['"])([^'"]+)\6;?/;
  for (;;) {
    const resto = src.slice(pos);
    const h = resto.match(RE_HUECO);
    if (h && h[0].length) { pos += h[0].length; continue; }
    const m = resto.match(RE_SENT);
    if (!m) break;
    const espec = m[5] ?? m[7];
    const soloTipos = Boolean(m[2]) ||
      (m[3] && /^\{[\s\S]*\}\s*$/.test(m[3].trim()) &&
        m[3].trim().slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean)
          .every((x) => x.startsWith('type ')));
    // `export { x }` sin from es código local; RE_SENT solo casa con from, así que no llega aquí
    if (!soloTipos) res.push({ espec, linea: lineaDe(pos) });
    pos += m[0].length;
  }
  // Dinámicos, en todo el fichero
  for (const m of src.matchAll(/\bimport\(\s*(['"])([^'"]+)\1\s*\)/g)) {
    res.push({ espec: m[2], linea: lineaDe(m.index) });
  }
  // Escapes
  const filtrados = res.filter(({ linea }) => {
    for (const l of [lineas[linea], lineas[linea - 1]]) {
      const e = l?.match(/catalogo-ok:[ \t]*([^\n]*)/);
      if (!e) continue;
      if (e[1].replace(/\*\/\s*$/, '').trim()) return false;
      errores.push(`${rel(fichero)}:${linea + 1} — \`catalogo-ok:\` sin razón escrita`);
    }
    return true;
  });
  cacheImports.set(fichero, filtrados);
  return filtrados;
}

function resolver(desde, espec) {
  let base;
  if (espec.startsWith('@/')) base = path.join(RAIZ, espec.slice(2));
  else if (espec.startsWith('.')) base = path.resolve(path.dirname(desde), espec);
  else return null; // paquete de npm
  for (const c of [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')]) {
    if (/\.(ts|tsx|js|mjs|jsx)$/.test(c) && fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

/** Cadena de imports desde `raiz` hasta alguno de `objetivos`, o null. */
function cadenaHasta(raiz, objetivos) {
  const padre = new Map([[raiz, null]]);
  const cola = [raiz];
  while (cola.length) {
    const f = cola.shift();
    if (objetivos.includes(f)) {
      const camino = [];
      for (let x = f; x; x = padre.get(x)) camino.unshift(rel(x));
      return camino;
    }
    if (!/\.(ts|tsx)$/.test(f)) continue;
    for (const { espec } of importsDe(f)) {
      const r = resolver(f, espec);
      if (r && !padre.has(r)) { padre.set(r, f); cola.push(r); }
    }
  }
  return null;
}

// ── Universo ───────────────────────────────────────────────────────────────────
function ficheros(dir) {
  const abs = path.join(RAIZ, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const e of fs.readdirSync(abs, { withFileTypes: true, recursive: true })) {
    if (e.isFile() && /\.(ts|tsx)$/.test(e.name)) out.push(path.join(e.parentPath ?? e.path, e.name));
  }
  return out;
}
const esCliente = (f) => /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*(['"])use client\1/.test(fs.readFileSync(f, 'utf8'));

const clientes = ['app', 'components', 'lib'].flatMap(ficheros).filter(esCliente);
const fallos = [];

for (const f of clientes) {
  const c = cadenaHasta(f, [RELACIONES]);
  if (c) fallos.push(`RELACIONADAS EN EL CLIENTE — ${c.join(' → ')}`);
}
const cb = cadenaHasta(BARREL, [CATALOGO, RELACIONES]);
if (cb) fallos.push(`CATÁLOGO EN EL BARREL — ${cb.join(' → ')}`);

if (errores.length || fallos.length) {
  console.error(`✗ check:catalogo-cliente — ${fallos.length + errores.length} problema(s):`);
  for (const x of [...fallos, ...errores]) console.error(`   · ${x}`);
  console.error('\n  Las relacionadas se resuelven en el layout con <ConRelacionadas slug="…">, y la');
  console.error('  página pinta <RelatedApps /> sin prop. Un componente que necesite el catálogo se');
  console.error('  importa por su ruta, nunca desde el barrel @/components. Ver la cabecera de este fichero.');
  process.exit(1);
}
console.log(`✓ catálogo en el cliente: ${clientes.length} ficheros 'use client' y el barrel, sin catálogos enteros`);
