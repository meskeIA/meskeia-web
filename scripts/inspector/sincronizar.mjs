#!/usr/bin/env node
/**
 * inspector:sync — pone al día la base del Inspector con la realidad del repositorio
 *
 * Ejecutar:  npm run inspector:sync
 *
 * Reconstruye, para cada app del catálogo: su segmento, su nivel de riesgo, la huella
 * de su código y de los datos de los que depende, y su uso real cruzado con el dump
 * de Turso. NO inspecciona nada ni llama a ningún modelo: solo prepara el terreno.
 *
 * Es idempotente y no destructivo: se puede ejecutar cuantas veces se quiera, y nunca
 * toca el histórico de inspecciones ni de hallazgos.
 *
 * LAS DOS HUELLAS, Y POR QUÉ SON DOS
 * ──────────────────────────────────
 * `hash_codigo` cubre los ficheros de la app. `hash_deps` cubre los módulos de
 * `data/fiscal/` y `lib/calculadoras/` que importa. Si cambia cualquiera de las dos
 * después de haberla inspeccionado, la app vuelve a la cola: es la forma de que un
 * cambio en un dato normativo reencole SOLO las apps que lo usan, en vez de las 1.172.
 *
 * Los componentes compartidos (`components/`) quedan FUERA de la huella a propósito:
 * cambian con mucha frecuencia y harían que todo el catálogo se invalidase cada semana.
 * Lo que se rompe por ahí lo ve la Ronda cada noche, que es más barata que el Inspector.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { abrir, RAIZ } from './db.mjs';

// ─── Riesgo por suite ─────────────────────────────────────────────────────────
// Derivado de _private/DISCLAIMER-POLICY.md. Cuando una app pertenece a varias
// suites manda SIEMPRE la más alta, igual que con los disclaimers.
const RIESGO_SUITE = {
  'legal-fiscal': 1,
  finanzas: 2,
  salud: 2,
  freelance: 2,
  inmobiliaria: 2,
  accesibilidad: 2,
  tecnicas: 3,
  productividad: 3,
  estudiantes: 3,
  viajes: 3,
  cultura: 4,
  diseno: 4,
  juegos: 4,
};

const huella = txt => crypto.createHash('sha256').update(txt).digest('hex').slice(0, 16);

// ─── Catálogo ─────────────────────────────────────────────────────────────────

function leerCatalogo() {
  const txt = fs.readFileSync(path.join(RAIZ, 'data', 'applications.ts'), 'utf8');
  const apps = new Map();
  for (const m of txt.matchAll(/\{\s*name:\s*"((?:[^"\\]|\\.)*)"[^}]*?suites:\s*\[([^\]]*)\][^}]*?url:\s*"([^"]+)"/g)) {
    const url = m[3];
    const slug = url.replace(/^\/|\/$/g, '');
    if (!slug || slug.includes('/')) continue; // subrutas y portales quedan fuera
    apps.set(slug, {
      slug,
      nombre: m[1].replace(/\\"/g, '"'),
      url,
      suites: [...m[2].matchAll(/["']([^"']+)["']/g)].map(s => s[1]),
    });
  }
  return apps;
}

// ─── Segmento y huellas ───────────────────────────────────────────────────────

const FICHEROS_APP = ['page.tsx', 'layout.tsx', 'metadata.ts'];

function analizarApp(slug) {
  const dir = path.join(RAIZ, 'app', slug);
  if (!fs.existsSync(dir)) return null;

  let codigo = '';
  let page = '';
  for (const f of FICHEROS_APP) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) continue;
    const t = fs.readFileSync(p, 'utf8');
    codigo += t;
    if (f === 'page.tsx') page = t;
  }
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.module.css')) codigo += fs.readFileSync(path.join(dir, f), 'utf8');
  }
  if (!page) return null;

  const deps = [
    ...[...page.matchAll(/@\/data\/fiscal\/?([\w-]*)/g)].map(m => `data/fiscal/${m[1] || 'index'}`),
    ...[...page.matchAll(/@\/lib\/calculadoras\/([\w-]+)/g)].map(m => `lib/calculadoras/${m[1]}`),
  ];
  const unicas = [...new Set(deps)];

  let hashDeps = '';
  if (unicas.length) {
    let acum = '';
    for (const d of unicas) {
      for (const ext of ['.ts', '.tsx', '/index.ts']) {
        const p = path.join(RAIZ, d + ext);
        if (fs.existsSync(p) && fs.statSync(p).isFile()) { acum += fs.readFileSync(p, 'utf8'); break; }
      }
    }
    hashDeps = huella(acum);
  }

  // El segmento decide CÓMO se inspecciona, no si se inspecciona.
  let segmento;
  if (/@\/data\/fiscal/.test(page)) segmento = 'fiscal';
  else if (/@\/lib\/calculadoras/.test(page)) segmento = 'motor';
  else if (/type=["']number["']|parseSpanishNumber|formatCurrency|toFixed\(/.test(page)) segmento = 'calculo';
  else if (/useState|onClick|onChange/.test(page)) segmento = 'interactiva';
  else segmento = 'contenido';

  return { hash_codigo: huella(codigo), deps: unicas, hash_deps: hashDeps, segmento };
}

// ─── Uso real (dump de Turso) ─────────────────────────────────────────────────

function leerUso() {
  const dir = path.join(RAIZ, '_backups', 'turso');
  if (!fs.existsSync(dir)) return { porSlug: new Map(), porNombre: new Map(), fecha: null };
  const dumps = fs.readdirSync(dir).filter(f => /^turso-dump-.*\.sql$/.test(f)).sort();
  if (!dumps.length) return { porSlug: new Map(), porNombre: new Map(), fecha: null };

  const ultimo = dumps[dumps.length - 1];
  const txt = fs.readFileSync(path.join(dir, ultimo), 'utf8');
  const porSlug = new Map(), porNombre = new Map();
  const re = /INSERT INTO "rollup_app_acum" \([^)]*\) VALUES \('((?:[^']|'')*)', (\d+), (\d+), ([\d.]+), (\d+),/g;
  for (const m of txt.matchAll(re)) {
    if (m[2] === '1') continue; // es_miip: visitas de la IP propia, no cuentan
    const clave = m[1].replace(/''/g, "'");
    const usos = Number(m[3]);
    const media = Number(m[5]) ? Number(m[4]) / Number(m[5]) : 0;
    const dest = /^[a-z0-9-]+$/.test(clave) ? porSlug : porNombre;
    const prev = dest.get(clave);
    dest.set(clave, prev ? { usos: prev.usos + usos, media: (prev.media + media) / 2 } : { usos, media });
  }
  return { porSlug, porNombre, fecha: (ultimo.match(/(\d{4}-\d{2}-\d{2})/) || [])[1] || null };
}

// ─── Fecha de alta en el repositorio ──────────────────────────────────────────

function fechasDeAlta() {
  const salida = execFileSync('git', [
    'log', '--diff-filter=A', '--format=%ad', '--date=short', '--name-only', '--', 'app/',
  ], { cwd: RAIZ, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const fechas = new Map();
  let actual = null;
  for (const linea of salida.split('\n')) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(linea.trim())) { actual = linea.trim(); continue; }
    const m = linea.match(/^app\/([^/]+)\//);
    if (m && actual && !fechas.has(m[1])) fechas.set(m[1], actual);
  }
  return fechas;
}

// ─── Principal ────────────────────────────────────────────────────────────────

const db = abrir();
const catalogo = leerCatalogo();
const uso = leerUso();
const altas = fechasDeAlta();

const upsert = db.prepare(`
  INSERT INTO apps (slug, nombre, url, suites, segmento, riesgo, usos, duracion_media,
                    hash_codigo, deps, hash_deps, creada)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(slug) DO UPDATE SET
    nombre = excluded.nombre, url = excluded.url, suites = excluded.suites,
    segmento = excluded.segmento, riesgo = excluded.riesgo, usos = excluded.usos,
    duracion_media = excluded.duracion_media, hash_codigo = excluded.hash_codigo,
    deps = excluded.deps, hash_deps = excluded.hash_deps, creada = excluded.creada
`);

let n = 0, sinCarpeta = 0, sinUso = 0;
for (const [slug, app] of catalogo) {
  const a = analizarApp(slug);
  if (!a) { sinCarpeta++; continue; }
  const riesgo = Math.min(...app.suites.map(s => RIESGO_SUITE[s] ?? 4), 4);
  const u = uso.porSlug.get(slug) || uso.porNombre.get(app.nombre) || null;
  if (!u) sinUso++;
  upsert.run(
    slug, app.nombre, app.url, JSON.stringify(app.suites), a.segmento,
    // Todo lo que toca data/fiscal es crítico, venga de la suite que venga
    a.segmento === 'fiscal' ? 1 : riesgo,
    u ? u.usos : 0, u ? Number(u.media.toFixed(1)) : 0,
    a.hash_codigo, JSON.stringify(a.deps), a.hash_deps || null,
    altas.get(slug) || null,
  );
  n++;
}

// ─── Apps que ya no están en el catálogo ──────────────────────────────────────
// El bucle de arriba solo hace UPSERT, así que una app ELIMINADA se quedaba en la base
// para siempre: seguía contando en el total, en los usos por segmento y en la cola, y un
// día habría propuesto inspeccionar una URL que ya devuelve 404. Se vio el 16/08/2026 al
// retirar radio-meskeia, la primera app que se elimina del catálogo (la cola decía 985
// apps y este script 984, y esa diferencia de uno era la app fantasma).
//
// Solo se retiran las que NUNCA se inspeccionaron. Si una app con histórico desaparece se
// avisa pero no se toca: sus hallazgos son la memoria de por qué se decidió lo que se
// decidió, y valen más que la pulcritud del recuento.
const vivas = new Set(catalogo.keys());
const huerfanas = db
  .prepare('SELECT slug, ultima_inspeccion FROM apps')
  .all()
  .filter(r => !vivas.has(r.slug));
const retirables = huerfanas.filter(r => !r.ultima_inspeccion);
const conHistorico = huerfanas.filter(r => r.ultima_inspeccion);

if (retirables.length) {
  const borrar = db.prepare('DELETE FROM apps WHERE slug = ?');
  for (const r of retirables) borrar.run(r.slug);
}

const cuenta = q => db.prepare(q).get().n;
console.log(`\nBase del Inspector · _private/inspector/inspector.db`);
console.log(`  ${n} apps sincronizadas` + (sinCarpeta ? ` · ${sinCarpeta} en el catálogo sin carpeta en app/` : ''));
if (retirables.length) {
  console.log(`  🗑️  ${retirables.length} retirada(s) del catálogo, sin inspeccionar: ${retirables.map(r => r.slug).join(', ')}`);
}
if (conHistorico.length) {
  console.log(`  ⚠️  ${conHistorico.length} ya no está(n) en el catálogo pero CONSERVAN inspecciones, así que no se borran: ${conHistorico.map(r => r.slug).join(', ')}`);
}
console.log(`  uso cruzado con el dump de ${uso.fecha || 'ninguno'}` + (sinUso ? ` · ${sinUso} sin datos de uso` : ''));
console.log('\n  por segmento:');
for (const r of db.prepare('SELECT segmento, COUNT(*) n, SUM(usos) u FROM apps GROUP BY segmento ORDER BY n DESC').all())
  console.log(`    ${String(r.segmento).padEnd(12)} ${String(r.n).padStart(4)} apps · ${Number(r.u).toLocaleString('es-ES')} usos`);
console.log('\n  por riesgo:');
for (const r of db.prepare('SELECT riesgo, COUNT(*) n FROM apps GROUP BY riesgo ORDER BY riesgo').all())
  console.log(`    nivel ${r.riesgo}      ${String(r.n).padStart(4)} apps`);
console.log(`\n  sin inspeccionar todavía: ${cuenta('SELECT COUNT(*) n FROM apps WHERE ultima_inspeccion IS NULL')}`);
