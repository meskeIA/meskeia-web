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
import { execFileSync } from 'child_process';
import { abrir, RAIZ } from './db.mjs';
import { calcularFirma, cargarDump, dumpMasReciente, DIR_DUMPS } from './firma.mjs';
import { aCRLF, crearHuella, huella } from './huella.mjs';

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

// ─── Apps CONGELADAS: publicadas, pero fuera de la base ──────────────────────
// Los 13 cursos (`curso-*`, ~200 páginas de capítulo) se congelaron el 16/10/2026 (semilla
// S0208, decisión del usuario): 49 usos en 90 días entre todos y casi ninguna demanda de
// buscador, pero se quedan en la web. Congelar = no reciben trabajo DEDICADO. Al no entrar en
// la base, la limpieza de abajo los retira (ninguno se había inspeccionado nunca) y dejan de
// salir en las dos colas que leen de aquí: la del Inspector y la del turno nocturno de
// accesibilidad (`Vigilancia/ActasNocturnas/turno-a11y.mjs`), que es la que les dedicaba
// commits. Siguen vigilados por la Ronda (que cargan) y por los candados del build.
// Para descongelar: quitar el prefijo de la lista y `npm run inspector:sync`.
const PREFIJOS_CONGELADOS = ['curso-'];
const congelada = slug => PREFIJOS_CONGELADOS.some(p => slug.startsWith(p));

// ─── Catálogo ─────────────────────────────────────────────────────────────────

function leerCatalogo() {
  const txt = fs.readFileSync(path.join(RAIZ, 'data', 'applications.ts'), 'utf8');
  const apps = new Map();
  for (const m of txt.matchAll(/\{\s*name:\s*"((?:[^"\\]|\\.)*)"[^}]*?suites:\s*\[([^\]]*)\][^}]*?url:\s*"([^"]+)"/g)) {
    const url = m[3];
    const slug = url.replace(/^\/|\/$/g, '');
    if (!slug || slug.includes('/')) continue; // subrutas y portales quedan fuera
    if (congelada(slug)) continue; // publicadas pero congeladas (cabecera de PREFIJOS_CONGELADOS)
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

/**
 * ESQUEMA DE LA HUELLA (versión 2, 12/10/2026, cabos C0147 y C0045)
 * ──────────────────────────────────────────────────────────────────
 * Hasta entonces (versión 1) `hash_codigo` solo leía page.tsx, layout.tsx, metadata.ts y los
 * .module.css, y las dependencias solo se buscaban en page.tsx. Un motor.ts, casos.ts o
 * cifras.ts que cambiara solo NO devolvía la app a la cola (C0147: 70e88f7f cambió el MEI en
 * app/estimador-irpf/motor.ts y su hash_codigo no se movió), y es justo el patrón recomendado.
 * Ahora entra todo .ts/.tsx/.module.css del árbol app/<slug>/.
 *
 * Y un `import { X } from '@/data/fiscal'` (el barril) se huelleaba como `data/fiscal/index`,
 * cuyo contenido son solo las líneas `export * from './…'`: cambiar el módulo de verdad
 * (irpf.ts) no movía nada, y añadir una línea al barril invalidaba TODAS las apps fiscales
 * (C0045: conversor-cnae-iae volvió a la cola por `export * from './ayudas-vehiculo'`). Ahora
 * cada nombre importado se resuelve al módulo que lo exporta; si alguno no se encuentra, se
 * conserva el barril, que es lo prudente.
 *
 * Cambiar la receta cambia todas las huellas, y sin más volverían a la cola cientos de apps
 * que nadie ha tocado (la forma de C0161). Por eso `migrarEsquema` re-ancla, UNA vez, las
 * que seguían vigentes con la receta vieja: su hash_inspeccionado pasa a la receta nueva.
 * Salvo si `git log` dice que, desde su inspección, algún commit tocó un fichero que solo
 * mira la nueva (un motor.ts, el módulo de data/fiscal tras el barril): esas vuelven a la
 * cola, porque es exactamente el cambio que la versión 1 se tragaba.
 */
/*
 * VERSIÓN 3 (13/10/2026): finales de línea normalizados a LF antes de huellear.
 * Con `core.autocrlf=true`, meskeia-web tiene los ficheros en LF y la copia del Inspector
 * (C:\Users\jaceb\meskeia-inspector, creada con `git worktree add`) en CRLF. Las dos sincronizan
 * contra la MISMA base y `registrar.mjs` guarda como huella inspeccionada la que dejó el último
 * sync: lo inspeccionado en la tarea volvía a la cola al sincronizar desde meskeia-web y al
 * revés. Se vio porque la familia compraventa, inspeccionada entera a las 08:27, volvía a salir
 * 7 de 7 pendiente a las 12:20 sin un solo commit en sus apps. La migración re-ancla, una vez,
 * las apps cuya huella inspeccionada es la versión CRLF del código de hoy: el código es el
 * mismo, solo cambian los saltos de línea. Las demás siguen como estaban.
 */
const ESQUEMA_HUELLA = 3;
const FICHEROS_APP_V1 = ['page.tsx', 'layout.tsx', 'metadata.ts'];

// La receta vive en `huella.mjs` desde el 18/10/2026 (cabo C0161): la necesita también
// `cerrar.mjs --revalidar-commits`, que la calcula sobre el pasado. Una sola receta para los dos.
const { ficherosDeApp, hashDeDeps, analizarApp } = crearHuella({ raiz: RAIZ });

/** La receta de la versión 1, solo para migrar: ver ESQUEMA DE LA HUELLA. */
function huellasV1(slug) {
  const dir = path.join(RAIZ, 'app', slug);
  let codigo = '';
  let page = '';
  for (const f of FICHEROS_APP_V1) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) continue;
    const t = fs.readFileSync(p, 'utf8');
    codigo += t;
    if (f === 'page.tsx') page = t;
  }
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.module.css')) codigo += fs.readFileSync(path.join(dir, f), 'utf8');
  }
  const deps = [
    ...[...page.matchAll(/@\/data\/fiscal\/?([\w-]*)/g)].map(m => `data/fiscal/${m[1] || 'index'}`),
    ...[...page.matchAll(/@\/lib\/calculadoras\/([\w-]+)/g)].map(m => `lib/calculadoras/${m[1]}`),
  ];
  return `${huella(codigo)}|${hashDeDeps([...new Set(deps)], t => t)}`;
}

// ─── Uso real (dump de Turso) ─────────────────────────────────────────────────

function leerUso() {
  const dir = DIR_DUMPS;
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

// Migración de la receta de la huella (ver ESQUEMA DE LA HUELLA): una sola vez por base
const esquemaGuardado = Number(db.prepare("SELECT valor FROM meta WHERE clave = 'esquema_huella'").get()?.valor ?? 1);
const migrar = esquemaGuardado < 2;
const migrarLF = esquemaGuardado < 3;
let reancladasLF = 0;
const leerInspeccionado = db.prepare('SELECT hash_inspeccionado, ultima_inspeccion FROM apps WHERE slug = ?');
const reanclar = db.prepare('UPDATE apps SET hash_inspeccionado = ? WHERE slug = ?');
let reancladas = 0;
const destapadas = [];

/** ¿Algún commit desde la inspección tocó un fichero que la huella v1 no miraba? */
function cambioInvisibleV1(slug, depsV2, desde) {
  if (!desde) return true; // sin fecha no se puede descartar: a la cola, que es lo prudente
  const dir = path.join(RAIZ, 'app', slug);
  const rutas = ficherosDeApp(dir)
    .map(p => path.relative(RAIZ, p).replace(/\\/g, '/'))
    .filter(r => !FICHEROS_APP_V1.includes(r.split('/').slice(2).join('/')) && !/^app\/[^/]+\/[^/]+\.module\.css$/.test(r));
  for (const d of depsV2) {
    for (const ext of ['.ts', '.tsx', '/index.ts']) {
      if (fs.existsSync(path.join(RAIZ, d + ext))) { rutas.push(d + ext); break; }
    }
  }
  if (!rutas.length) return false;
  const salida = execFileSync('git', ['log', `--since=${desde.slice(0, 10)} 00:00`, '--format=%h', '--', ...rutas],
    { cwd: RAIZ, encoding: 'utf8' });
  return salida.trim() !== '';
}

let n = 0, sinCarpeta = 0, sinUso = 0;
for (const [slug, app] of catalogo) {
  const a = analizarApp(slug);
  if (!a) { sinCarpeta++; continue; }
  if (migrar) {
    const fila = leerInspeccionado.get(slug);
    if (fila?.hash_inspeccionado && fila.hash_inspeccionado === huellasV1(slug)) {
      // Vigente con la receta vieja. Antes de re-anclarla, git dice si desde la inspección
      // cambió algo que solo ve la nueva (un motor.ts, el módulo real tras el barril): entonces
      // vuelve a la cola, que es justo lo que la versión 1 se tragaba.
      if (cambioInvisibleV1(slug, a.deps, fila.ultima_inspeccion)) {
        destapadas.push(slug);
      } else {
        reanclar.run(`${a.hash_codigo}|${a.hash_deps || ''}`, slug);
        reancladas++;
      }
    }
  }
  if (migrarLF) {
    const fila = leerInspeccionado.get(slug);
    const actual = `${a.hash_codigo}|${a.hash_deps || ''}`;
    if (fila?.hash_inspeccionado && fila.hash_inspeccionado !== actual) {
      // Dos formas del MISMO código: todo en CRLF (lo inspeccionado en la copia) o los ficheros
      // tal cual están en esta carpeta, donde también hay apps con CRLF o mezclado fichero a
      // fichero (sonometro, calculadora-notas…): la normalización les cambia la huella sin más
      const formas = [aCRLF, t => t].map(f => analizarApp(slug, f)).map(c => `${c.hash_codigo}|${c.hash_deps || ''}`);
      if (formas.includes(fila.hash_inspeccionado)) {
        reanclar.run(actual, slug);
        reancladasLF++;
      }
    }
  }
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
if (migrarLF) {
  db.prepare("INSERT INTO meta (clave, valor) VALUES ('esquema_huella', ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor")
    .run(String(ESQUEMA_HUELLA));
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

// ─── Firma de rotura ──────────────────────────────────────────────────────────
// Visitas cortas seguidas de recarga: la huella de una app que la gente no consigue usar.
// El criterio y su calibración, en la cabecera de `firma.mjs`.
//
// `firma_desde` se CONSERVA mientras la firma siga saltando y se borra cuando deja de
// hacerlo: así una app inspeccionada después de que apareciera sale de la cola FIRMA y no
// vuelve cada mes por la misma señal ya revisada, pero sí vuelve si la firma desaparece y
// reaparece más tarde, que es una señal nueva.
let firma = null;
const rutaDump = dumpMasReciente();
if (rutaDump) {
  firma = calcularFirma(cargarDump(rutaDump), { slugs: [...vivas] });
  const marcar = db.prepare(`UPDATE apps SET firma = ?, firma_detalle = ?,
    firma_desde = COALESCE(firma_desde, ?) WHERE slug = ?`);
  const limpiar = db.prepare(`UPDATE apps SET firma = NULL, firma_detalle = NULL, firma_desde = NULL WHERE slug = ?`);
  for (const slug of vivas) {
    const f = firma.apps.get(slug);
    if (f?.firma) marcar.run(f.firma, f.detalle, firma.hasta, slug);
    else limpiar.run(slug);
  }
}

const cuenta = q => db.prepare(q).get().n;
console.log(`\nBase del Inspector · _private/inspector/inspector.db`);
console.log(`  ${n} apps sincronizadas` + (sinCarpeta ? ` · ${sinCarpeta} en el catálogo sin carpeta en app/` : ''));
if (migrar) {
  console.log(`  🔁 huella pasada a la versión 2 (todos los ficheros de la app y el barril de data/fiscal resuelto): ` +
    `${reancladas} app(s) que seguían vigentes se re-anclan y NO vuelven a la cola`);
  if (destapadas.length) {
    console.log(`  🔎 ${destapadas.length} vuelven a la cola por cambios posteriores a su inspección que la huella vieja no veía: ${destapadas.join(', ')}`);
  }
}
if (migrarLF) {
  console.log(`  🔁 huella pasada a la versión 3 (finales de línea en LF): ${reancladasLF} app(s) con el mismo código ` +
    `y otros saltos de línea se re-anclan y NO vuelven a la cola`);
}
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
if (firma) {
  const marcadas = db.prepare('SELECT slug, firma FROM apps WHERE firma IS NOT NULL ORDER BY slug').all();
  console.log(`  firma de rotura (30 días hasta el ${firma.hasta.split('-').reverse().join('/')}): ` +
    (marcadas.length ? `${marcadas.length} · ${marcadas.map(m => `${m.slug} (${m.firma})`).join(', ')}` : 'ninguna'));
} else {
  console.log('  ⚠️  sin dump en _backups/turso: la firma de rotura NO se ha recalculado');
}
