/**
 * specs-afectados.mjs — qué specs hay que pasar ANTES de cerrar un cambio, para que no los
 * descubra después la suite entera.
 *
 *   node scripts/inspector/specs-afectados.mjs                    # desde merge-base(main, HEAD), sin commitear incluido
 *   node scripts/inspector/specs-afectados.mjs --desde <ref> [--hasta <ref>]
 *   node scripts/inspector/specs-afectados.mjs --json             # para otro script
 *   node scripts/inspector/specs-afectados.mjs --probar           # reinyecta los casos de origen
 *
 * Saca cuatro grupos, de lo tocado hacia fuera:
 *   1. los specs que el cambio ha tocado;
 *   2. el spec ENTERO de cada app tocada (tests/apps/<slug>.spec.ts);
 *   3. los specs que importan algo afectado (el módulo tocado o lo que depende de él);
 *   4. el spec de cada app que CONSUME un módulo compartido tocado (lib/, components/, data/…),
 *      siguiendo los imports en cadena y los barriles nombre a nombre, más el testigo de su familia.
 * `lista` es lo que puede pasar una tanda de /reparar contra `next dev`: 1 y 2 siempre, 3 si son
 * pocos (MAX_IMPORTAN_TANDA). `listaCompleta`, los cuatro, para pasarla contra un build de
 * producción con varios workers. Lo que queda fuera lo cubre la suite entera de la tarea.
 *
 * DE DÓNDE SALE (12/11/2026)
 * ─────────────────────────
 * La tanda de /reparar de las 07:55 cambió a propósito `lib/calculadoras/correctorCasosAula.ts`,
 * que usan 27 apps, y pasó los specs de 4. Los de simulador-conservacion-energia y
 * simulador-titulacion afirmaban la regla antigua; los vio la suite entera de la tarea cuando ya
 * no había quién los retocara, y la recogida automática se paró (con razón: un rojo que la tanda
 * provoca no se integra solo). Segundo caso de la misma familia, 07/11/2026 13:46: la tanda pasó
 * el % de estimador-sueldo-neto a espacio duro y no pasó entero el spec de esa misma app.
 * Recuento de las 36 tandas con rojos aislados (21/10-12/11): 7 con rojos reproducibles, todas
 * paradas con razón; 3 de esta familia (un spec que la tanda no pasó entero). La de sueldo-neto
 * la cubre `lista`; la del corrector, solo `listaCompleta` (47 specs lo prueban: no caben en la
 * tanda). La tercera (anio-fecha-legal-hidratacion, `networkidle` en producción) es de
 * `check:specs-produccion`, no de aquí.
 *
 * Lo que NO hace: decidir si el rojo es del test o del código. Eso es juicio, y por eso la
 * recogida automática sigue parándose igual. Esto solo adelanta el momento en que se ve.
 *
 * Un import en un comentario no cuenta (scripts/CLAUDE.md: este repo cita código en los
 * comentarios a propósito). `import type` tampoco: no cambia lo que se ejecuta, y los tipos los
 * mira `check:tipos`.
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { familiaDe } from './familias.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
// La tanda pasa sus specs contra `next dev` con 1 worker y cada orden de Bash corta a los 10 min:
// la lista completa del 12/11 eran 2.687 tests en 59 specs, horas. Los del grupo 3 entran en la
// lista de la tanda solo si son pocos; el resto queda en `listaCompleta`, para quien pase specs
// contra el build de producción con varios workers.
const MAX_IMPORTAN_TANDA = 10;
const POR_TANDA = 3; // specs por orden de playwright, para no rozar los 10 minutos
const ARBOLES = ['app', 'components', 'lib', 'data', 'hooks', 'types', 'styles', 'server'];
const COMPARTIDO = /^(components|lib|data|hooks|styles|server)\//;
// Lo que no cambia el comportamiento de ninguna app aunque viva en data/
const SIN_EFECTO = /^data\/(app-dates\.json$|historias\/CLAUDE\.md$)|\.md$/;

const rel = (p) => path.relative(RAIZ, p).split(path.sep).join('/');

function git(args) {
  return execFileSync('git', ['-C', RAIZ, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
}
const lineas = (t) => t.split('\n').map((l) => l.trim()).filter(Boolean);

/* ───────────────────────── El grafo de imports ───────────────────────── */

function recorrer(dir, salida) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p, salida);
    else if (/\.(tsx?|mjs|js)$/.test(e.name)) salida.push(rel(p));
  }
}

/** Retira comentarios de bloque y de línea (estos, solo tras inicio o espacio: no rompe «https://»). */
const sinComentarios = (t) => t.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|\s)\/\/.*$/gm, '$1');

const cacheTexto = new Map();
function texto(f) {
  if (!cacheTexto.has(f)) {
    let t = '';
    try { t = sinComentarios(fs.readFileSync(path.join(RAIZ, f), 'utf8')); } catch { /* borrado */ }
    cacheTexto.set(f, t);
  }
  return cacheTexto.get(f);
}

/** Resuelve un especificador de import a un fichero del repositorio, o null (paquete, inexistente). */
function resolver(desde, spec) {
  let base;
  if (spec.startsWith('@/')) base = spec.slice(2);
  else if (spec.startsWith('.')) base = path.posix.normalize(path.posix.join(path.posix.dirname(desde), spec));
  else return null;
  for (const c of [base, `${base}.ts`, `${base}.tsx`, `${base}.mjs`, `${base}.js`, `${base}/index.ts`, `${base}/index.tsx`]) {
    const p = path.join(RAIZ, c);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return c;
  }
  return null;
}

/** Nombres que pide una cláusula de import: { todos: true } o { nombres: [...] } (el original, no el alias). */
function nombresDe(clausula) {
  const llaves = clausula.match(/\{([^}]*)\}/);
  const fuera = clausula.replace(/\{[^}]*\}/, '').replace(/,/g, ' ').trim();
  if (/\*\s+as\s+/.test(fuera) || (fuera && !/^type$/.test(fuera))) return { todos: true }; // default o namespace
  const nombres = [];
  if (llaves) {
    for (const trozo of llaves[1].split(',')) {
      const t = trozo.trim();
      if (!t || /^type\s/.test(t)) continue;
      nombres.push(t.split(/\s+as\s+/)[0].trim());
    }
  }
  return { nombres };
}

/** Las reexportaciones de un módulo: nombre → [fuente, nombre original] y la lista de `export *`. */
const cacheReexport = new Map();
function reexportaciones(f) {
  if (cacheReexport.has(f)) return cacheReexport.get(f);
  const t = texto(f);
  const porNombre = new Map();
  const estrella = [];
  for (const m of t.matchAll(/\bexport\s+(type\s+)?(\*(?:\s+as\s+\w+)?|\{[^}]*\})\s*from\s*['"]([^'"]+)['"]/g)) {
    if (m[1]) continue;
    const fuente = resolver(f, m[3]);
    if (!fuente) continue;
    if (m[2].startsWith('*')) {
      const ns = m[2].match(/\*\s+as\s+(\w+)/);
      if (ns) porNombre.set(ns[1], [fuente, null]);
      else estrella.push(fuente);
      continue;
    }
    for (const trozo of m[2].slice(1, -1).split(',')) {
      const tr = trozo.trim();
      if (!tr || /^type\s/.test(tr)) continue;
      const [orig, alias] = tr.split(/\s+as\s+/).map((s) => s.trim());
      porNombre.set(alias || orig, [fuente, orig]);
    }
  }
  const r = { porNombre, estrella };
  cacheReexport.set(f, r);
  return r;
}

const exportaNombre = (f, nombre) =>
  new RegExp(`\\bexport\\s+(?:declare\\s+)?(?:const|let|var|async\\s+function\\*?|function\\*?|class|enum)\\s+${nombre}\\b|\\bexport\\s*\\{[^}]*\\b${nombre}\\b[^}]*\\}`).test(texto(f));

/** Ficheros de los que depende de verdad quien importa `nombres` de `m` (los barriles, nombre a nombre). */
function destinos(m, pedido, visto = new Set()) {
  const clave = `${m}|${pedido.todos ? '*' : pedido.nombres.join(',')}`;
  if (visto.has(clave)) return [];
  visto.add(clave);
  const { porNombre, estrella } = reexportaciones(m);
  if (!porNombre.size && !estrella.length) return [m];
  if (pedido.todos) {
    const fuentes = new Set([m]);
    for (const [fuente, orig] of porNombre.values()) for (const d of destinos(fuente, orig === null || orig === 'default' ? { todos: true } : { nombres: [orig] }, visto)) fuentes.add(d);
    for (const s of estrella) for (const d of destinos(s, { todos: true }, visto)) fuentes.add(d);
    return [...fuentes];
  }
  const salida = new Set();
  for (const n of pedido.nombres) {
    const re = porNombre.get(n);
    if (re) {
      const [fuente, orig] = re;
      for (const d of destinos(fuente, orig === null || orig === 'default' ? { todos: true } : { nombres: [orig] }, visto)) salida.add(d);
      continue;
    }
    const s = estrella.find((e) => exportaNombre(e, n));
    if (s) for (const d of destinos(s, { nombres: [n] }, visto)) salida.add(d);
    else salida.add(m); // definido en el propio módulo
  }
  return [...salida];
}

/** Dependencias directas de un fichero (lo que se ejecuta: sin `import type` ni las reexportaciones propias). */
function dependencias(f) {
  const t = texto(f);
  const deps = new Set();
  for (const m of t.matchAll(/\bimport\s+(type\s+)?([\w$*{}\s,]+?)\s+from\s*['"]([^'"]+)['"]/g)) {
    if (m[1]) continue;
    const mod = resolver(f, m[3]);
    if (mod) for (const d of destinos(mod, nombresDe(m[2]))) deps.add(d);
  }
  for (const m of t.matchAll(/\bimport\s*['"]([^'"]+)['"]/g)) {
    const mod = resolver(f, m[1]);
    if (mod) deps.add(mod);
  }
  for (const m of t.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    const mod = resolver(f, m[1]);
    if (mod) for (const d of destinos(mod, { todos: true })) deps.add(d);
  }
  // `export { x } from './y'` en un fichero que NO es barril puro también ejecuta y
  const { porNombre, estrella } = reexportaciones(f);
  if (!f.endsWith('/index.ts') && !f.endsWith('/index.tsx')) {
    for (const [fuente] of porNombre.values()) deps.add(fuente);
    for (const s of estrella) deps.add(s);
  }
  deps.delete(f);
  return deps;
}

function grafoInverso(ficheros) {
  const inverso = new Map();
  for (const f of ficheros) {
    for (const d of dependencias(f)) {
      if (!inverso.has(d)) inverso.set(d, new Set());
      inverso.get(d).add(f);
    }
  }
  return inverso;
}

/* ───────────────────────── Los specs ───────────────────────── */

export function specsAfectados({ desde, hasta } = {}) {
  const base = desde || git(['merge-base', 'main', 'HEAD']);
  const tocados = hasta
    ? lineas(git(['diff', '--name-only', base, hasta]))
    : [...new Set([...lineas(git(['diff', '--name-only', base])), ...lineas(git(['ls-files', '--others', '--exclude-standard']))])];

  const codigo = [];
  for (const a of ARBOLES) recorrer(path.join(RAIZ, a), codigo);
  const specsTodos = [];
  recorrer(path.join(RAIZ, 'tests'), specsTodos);
  const specs = specsTodos.filter((f) => f.endsWith('.spec.ts'));
  const inverso = grafoInverso([...codigo, ...specs]);

  const existe = (f) => fs.existsSync(path.join(RAIZ, f));
  const slugDe = (f) => {
    const m = f.match(/^app\/([^/]+)\/./);
    return m && !m[1].startsWith('(') ? m[1] : null;
  };
  const specDeApp = (slug) => `tests/apps/${slug}.spec.ts`;

  // 1 · specs tocados
  const g1 = new Set(tocados.filter((f) => /^tests\/.*\.spec\.ts$/.test(f) && existe(f)));
  // 2 · spec entero de cada app tocada
  const appsTocadas = new Set(tocados.map(slugDe).filter(Boolean));
  const g2 = new Set([...appsTocadas].map(specDeApp).filter(existe));

  // Lo afectado: lo tocado más todo lo que depende de ello, en cadena
  const compartidos = tocados.filter((f) => COMPARTIDO.test(f) && !SIN_EFECTO.test(f) && existe(f));
  const afectados = new Set(tocados.filter((f) => !/^tests\//.test(f)));
  const cola = [...afectados];
  while (cola.length) {
    const f = cola.pop();
    for (const quien of inverso.get(f) || []) {
      if (!afectados.has(quien)) { afectados.add(quien); cola.push(quien); }
    }
  }
  // 3 · specs que importan algo afectado (el motor que prueba la regla, aunque su app no se toque)
  const g3 = new Set([...afectados].filter((f) => /^tests\/.*\.spec\.ts$/.test(f)));
  // 4 · consumidores de lo compartido: sus apps y el testigo de su familia
  const consumidoras = new Set();
  if (compartidos.length) {
    const desdeCompartido = new Set(compartidos);
    const c = [...compartidos];
    while (c.length) {
      const f = c.pop();
      for (const quien of inverso.get(f) || []) if (!desdeCompartido.has(quien)) { desdeCompartido.add(quien); c.push(quien); }
    }
    for (const f of desdeCompartido) { const s = slugDe(f); if (s && !appsTocadas.has(s)) consumidoras.add(s); }
  }
  const g4 = new Set([...consumidoras].map(specDeApp).filter(existe));
  for (const s of [...appsTocadas, ...consumidoras]) {
    const fam = familiaDe(s);
    if (fam?.testigo && existe(fam.testigo)) (appsTocadas.has(s) ? g2 : g4).add(fam.testigo);
  }

  const unir = (...gs) => {
    const orden = [];
    for (const g of gs) for (const f of [...g].sort()) if (!orden.includes(f)) orden.push(f);
    return orden;
  };
  // La lista de la tanda: lo suyo entero, y los que prueban el módulo tocado solo si son pocos
  const g3Cabe = g3.size <= MAX_IMPORTAN_TANDA;
  const lista = g3Cabe ? unir(g1, g2, g3) : unir(g1, g2);
  const listaCompleta = unir(g1, g2, g3, g4);

  return {
    base: base.slice(0, 9), hasta: hasta || '(árbol de trabajo)',
    tocados: tocados.length, appsTocadas: [...appsTocadas].sort(), compartidos,
    consumidoras: [...consumidoras].sort(),
    grupos: { tocados: [...g1].sort(), appsTocadas: [...g2].sort(), importan: [...g3].sort(), consumidoras: [...g4].sort() },
    lista, listaCompleta, fueraDeLista: listaCompleta.length - lista.length,
  };
}

/* ───────────────────────── Prueba: los casos de origen ───────────────────────── */

function probar() {
  const casos = [
    {
      nombre: '12/11/2026 07:55 · el corrector compartido de Casos para clase (a6f65b119)',
      desde: 'a6f65b119^', hasta: 'a6f65b119',
      deben: ['tests/apps/simulador-conservacion-energia.spec.ts', 'tests/apps/simulador-titulacion.spec.ts'],
    },
    {
      nombre: '07/11/2026 13:46 · el % del FAQPage de estimador-sueldo-neto (64d8c2d5c)',
      desde: '64d8c2d5c^', hasta: '64d8c2d5c',
      deben: ['tests/apps/estimador-sueldo-neto.spec.ts'],
    },
  ];
  let fallos = 0;
  for (const c of casos) {
    const r = specsAfectados(c);
    const faltan = c.deben.filter((s) => !r.listaCompleta.includes(s));
    // La trampa: con la práctica antigua (solo los specs que el cambio tocó), ¿se habrían visto?
    const antes = c.deben.filter((s) => r.grupos.tocados.includes(s));
    const enTanda = c.deben.filter((s) => r.lista.includes(s));
    const ok = !faltan.length;
    if (!ok) fallos += 1;
    console.log(`${ok ? '✓' : '✗'} ${c.nombre}: ${r.listaCompleta.length} specs en la lista completa, ${r.lista.length} en la de la tanda` +
      `${faltan.length ? ` · FALTAN ${faltan.join(', ')}` : ''} · los del caso: ${antes.length} de ${c.deben.length} con solo los specs tocados,` +
      ` ${enTanda.length} en la lista de la tanda, ${c.deben.length - faltan.length} en la completa`);
  }
  if (fallos) { console.error(`✗ ${fallos} caso(s) de origen sin cubrir`); process.exit(1); }
  console.log('✓ los casos de origen salen en la lista');
}

/* ───────────────────────── CLI ───────────────────────── */

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const valor = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  if (args.includes('--probar')) { probar(); process.exit(0); }
  const r = specsAfectados({ desde: valor('--desde'), hasta: valor('--hasta') });
  if (args.includes('--json')) { console.log(JSON.stringify(r, null, 2)); process.exit(0); }
  console.log(`Specs afectados desde ${r.base} hasta ${r.hasta} · ${r.tocados} ficheros tocados`);
  if (r.compartidos.length) console.log(`  compartidos tocados: ${r.compartidos.join(', ')} → ${r.consumidoras.length} apps consumidoras`);
  const g = r.grupos;
  for (const [titulo, lista] of [['tocados por el cambio', g.tocados], ['apps tocadas, enteros', g.appsTocadas], ['importan algo afectado', g.importan], ['apps consumidoras', g.consumidoras]]) {
    if (lista.length) console.log(`  ${titulo} (${lista.length}): ${lista.map((s) => s.replace(/^tests\/(apps\/)?/, '')).join(' ')}`);
  }
  if (!r.lista.length) { console.log('Ningún spec afectado para la tanda.'); }
  if (r.fueraDeLista) {
    console.log(`  ⚠ ${r.fueraDeLista} specs de consumidores quedan fuera de la lista de la tanda (más de ${MAX_IMPORTAN_TANDA} prueban el módulo` +
      ` o son apps que lo consumen): los cubre la suite entera. Dilo en el acta con este número.`);
  }
  if (!r.lista.length) process.exit(0);
  console.log(`\nLista de la tanda: ${r.lista.length} specs, en órdenes de ${POR_TANDA} (una por llamada; si una pasa de 10 min, pártela):`);
  for (let i = 0; i < r.lista.length; i += POR_TANDA) console.log(`npx playwright test ${r.lista.slice(i, i + POR_TANDA).join(' ')}`);
}
