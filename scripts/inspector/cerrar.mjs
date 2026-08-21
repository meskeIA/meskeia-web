#!/usr/bin/env node
/**
 * inspector:hallazgos — leer lo que está abierto y cerrarlo cuando se repare
 *
 * Ejecutar:  npm run inspector:hallazgos                 (los abiertos, por severidad)
 *            npm run inspector:hallazgos -- --app lupa-digital
 *            npm run inspector:hallazgos -- --arreglado 12,13
 *            npm run inspector:hallazgos -- --descartado 27 --motivo "es correcto: lo confirma la ONCE"
 *            npm run inspector:hallazgos -- --revalidar lupa-digital,conversor-braille
 *            npm run inspector:hallazgos -- --revalidar-reparadas
 *
 * El Inspector NO repara: deja los hallazgos abiertos y el usuario decide el lote. Falta
 * entonces la otra mitad del ciclo — cerrarlos cuando se arreglen. Sin esto, la base
 * acumula hallazgos ya resueltos y en dos meses su lista deja de significar nada.
 *
 * Un hallazgo se DESCARTA cuando resulta que no era un defecto (el modelo se equivocó, o
 * la app hacía bien lo que parecía mal). Exige `--motivo`: un descarte sin razón escrita
 * es indistinguible de haberlo barrido debajo de la alfombra.
 */

import { abrir, SQL_INVALIDADA } from './db.mjs';

const args = process.argv.slice(2);
const valorDe = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const APP = valorDe('app', '');
const ARREGLADO = valorDe('arreglado', '');
const DESCARTADO = valorDe('descartado', '');
/**
 * Devuelve un hallazgo a «abierto». Existe porque cerrar el id equivocado es un error
 * fácil y silencioso —pasó el mismo día que se estrenó esto— y sin vuelta atrás la base
 * empieza a mentir: dice que algo está arreglado cuando sigue en producción.
 */
const REABRIR = valorDe('reabrir', '');
/**
 * Da por vigente la inspección de una app sobre su código ACTUAL.
 *
 * Reparar cambia el código, así que la app vuelve a la cola como INVALIDADA y se coloca
 * por delante de las que nadie ha mirado nunca: tras la tanda del 21/08/2026, la cola
 * ofrecía las mismas diez apps que se acababan de arreglar. Pero INVALIDADA está pensada
 * para cambios que nadie ha verificado, y una reparación sale con sus tests de regresión
 * —son el producto del Inspector—, así que ahí ya no queda nada que volver a mirar.
 *
 * No toca la fecha de la inspección ni su veredicto: solo dice «lo que se verificó es
 * esto». Si mañana alguien cambia la app por otro motivo, vuelve a invalidarse sola.
 */
const REVALIDAR = valorDe('revalidar', '');
const REVALIDAR_REPARADAS = args.includes('--revalidar-reparadas');
const MOTIVO = valorDe('motivo', '');
const TODOS = args.includes('--todos');

const db = abrir();
const hoy = new Date().toISOString().slice(0, 10);

// ─── Cerrar ───────────────────────────────────────────────────────────────────

function cerrar(ids, estado) {
  const lista = ids.split(',').map(s => s.trim()).filter(Boolean);
  if (estado === 'descartado' && !MOTIVO) {
    console.error('\n✗ Descartar exige --motivo. Un descarte sin razón escrita no se puede revisar después.\n');
    process.exit(1);
  }
  const leer = db.prepare('SELECT id, slug, severidad, descripcion, estado FROM hallazgos WHERE id = ?');
  const upd = db.prepare('UPDATE hallazgos SET estado = ?, descripcion = ? WHERE id = ?');
  let n = 0;
  for (const id of lista) {
    const h = leer.get(Number(id));
    if (!h) { console.error(`  · id ${id}: no existe`); continue; }
    if (h.estado !== 'abierto') { console.error(`  · id ${id}: ya estaba "${h.estado}"`); continue; }
    const nota = estado === 'descartado'
      ? `${h.descripcion} [DESCARTADO ${hoy}: ${MOTIVO}]`
      : `${h.descripcion} [ARREGLADO ${hoy}]`;
    upd.run(estado, nota, h.id);
    console.log(`  ✓ ${id} · ${h.slug} · ${estado}`);
    n++;
  }
  const quedan = db.prepare("SELECT COUNT(*) n FROM hallazgos WHERE estado = 'abierto'").get().n;
  console.log(`\n${n} cerrado(s) · quedan ${quedan} abiertos`);
  // Un hallazgo arreglado suele venir con un test.fail() que ahora sobra
  if (estado === 'arreglado')
    console.log(`\nRecuerda: si el hallazgo estaba documentado con test.fail(), ese test se pondrá\nen ROJO al corregirlo. Hay que retirar la marca y dejarlo como test normal.`);
}

if (REABRIR) {
  const leer = db.prepare('SELECT id, slug, estado, descripcion FROM hallazgos WHERE id = ?');
  const upd = db.prepare("UPDATE hallazgos SET estado = 'abierto', descripcion = ? WHERE id = ?");
  for (const id of REABRIR.split(',').map(s => s.trim()).filter(Boolean)) {
    const h = leer.get(Number(id));
    if (!h) { console.error(`  · id ${id}: no existe`); continue; }
    // Retirar la marca de cierre para que la descripción no contradiga al estado
    const limpia = h.descripcion.replace(/\s*\[(ARREGLADO|DESCARTADO) \d{4}-\d{2}-\d{2}[^\]]*\]/g, '');
    upd.run(limpia, h.id);
    console.log(`  ↩ ${id} · ${h.slug} · vuelve a abierto (estaba "${h.estado}")`);
  }
  console.log(`\nabiertos: ${db.prepare("SELECT COUNT(*) n FROM hallazgos WHERE estado='abierto'").get().n}`);
  process.exit(0);
}
function revalidar(slugs) {
  const upd = db.prepare(
    `UPDATE apps SET hash_inspeccionado = hash_codigo || '|' || COALESCE(hash_deps, '')
     WHERE slug = ? AND ultima_inspeccion IS NOT NULL`,
  );
  const leer = db.prepare('SELECT slug, ultima_inspeccion, veredicto FROM apps WHERE slug = ?');
  let n = 0;
  for (const slug of slugs) {
    const app = leer.get(slug);
    if (!app) { console.error(`  · ${slug}: no está en el catálogo`); continue; }
    if (!app.ultima_inspeccion) { console.error(`  · ${slug}: nunca se ha inspeccionado`); continue; }
    upd.run(slug);
    console.log(`  ✓ ${slug} · la inspección del ${app.ultima_inspeccion} vale para el código de hoy`);
    n++;
  }
  const inval = db
    .prepare(`SELECT COUNT(*) n FROM apps WHERE ${SQL_INVALIDADA}`)
    .get().n;
  console.log(`\n${n} revalidada(s) · quedan ${inval} invalidadas en la cola`);
}

if (REVALIDAR || REVALIDAR_REPARADAS) {
  const slugs = REVALIDAR
    ? REVALIDAR.split(',').map(s => s.trim()).filter(Boolean)
    : db
        .prepare(`SELECT slug FROM apps WHERE ${SQL_INVALIDADA}`)
        .all()
        .map(r => r.slug)
        .filter(slug =>
          // Solo las que no arrastran hallazgos abiertos: si queda algo por reparar, la
          // app tiene que seguir en la cola.
          db.prepare("SELECT COUNT(*) n FROM hallazgos WHERE slug = ? AND estado = 'abierto'").get(slug).n === 0,
        );
  if (!slugs.length) { console.log('\nNo hay nada que revalidar.\n'); process.exit(0); }
  revalidar(slugs);
  process.exit(0);
}

if (ARREGLADO) { cerrar(ARREGLADO, 'arreglado'); process.exit(0); }
if (DESCARTADO) { cerrar(DESCARTADO, 'descartado'); process.exit(0); }

// ─── Listar ───────────────────────────────────────────────────────────────────

const orden = `CASE severidad WHEN 'critico' THEN 1 WHEN 'alto' THEN 2 WHEN 'medio' THEN 3 ELSE 4 END`;
const filas = APP
  ? db.prepare(`SELECT * FROM hallazgos WHERE slug = ? ${TODOS ? '' : "AND estado = 'abierto'"} ORDER BY ${orden}`).all(APP)
  : db.prepare(`SELECT * FROM hallazgos ${TODOS ? '' : "WHERE estado = 'abierto'"} ORDER BY ${orden}, slug`).all();

if (!filas.length) {
  console.log(`\nNo hay hallazgos ${TODOS ? '' : 'abiertos '}${APP ? `en ${APP}` : ''}.\n`);
  process.exit(0);
}

console.log(`\n${filas.length} hallazgo(s)${APP ? ` en ${APP}` : ''}:\n`);
let sevActual = '';
for (const f of filas) {
  if (f.severidad !== sevActual) { sevActual = f.severidad; console.log(`── ${sevActual.toUpperCase()} ──`); }
  const marca = f.estado === 'abierto' ? ' ' : f.estado === 'arreglado' ? '✓' : '×';
  console.log(`${marca} [${String(f.id).padStart(3)}] ${f.slug} · ${f.tipo}`);
  console.log(`      ${f.descripcion.slice(0, 150).replace(/\s+/g, ' ')}…`);
}

const porApp = db.prepare(`SELECT slug, COUNT(*) n FROM hallazgos WHERE estado='abierto' GROUP BY slug ORDER BY n DESC`).all();
console.log(`\nPor app: ${porApp.map(r => `${r.slug} (${r.n})`).join(' · ')}`);
console.log(`\nCerrar:  npm run inspector:hallazgos -- --arreglado 1,2,3`);
console.log(`         npm run inspector:hallazgos -- --descartado 4 --motivo "por qué no era un defecto"`);
console.log(`Tras reparar: npm run inspector:hallazgos -- --revalidar-reparadas\n`);
