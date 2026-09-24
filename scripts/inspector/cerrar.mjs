#!/usr/bin/env node
/**
 * inspector:hallazgos — leer lo que está abierto y cerrarlo cuando se repare
 *
 * Ejecutar:  npm run inspector:hallazgos                 (los abiertos, por severidad)
 *            npm run inspector:hallazgos -- --app lupa-digital
 *            npm run inspector:hallazgos -- --app lupa-digital --detalle   (ficha entera + caso)
 *            npm run inspector:hallazgos -- --arreglado 12,13
 *            npm run inspector:hallazgos -- --descartado 27 --motivo "es correcto: lo confirma la ONCE"
 *            npm run inspector:hallazgos -- --revalidar lupa-digital,conversor-braille
 *            npm run inspector:hallazgos -- --revalidar-reparadas   (solo las que tienen un
 *                                              hallazgo ARREGLADO después de darse por buenas)
 *
 * El Inspector NO repara: deja los hallazgos abiertos y el usuario decide el lote. Falta
 * entonces la otra mitad del ciclo — cerrarlos cuando se arreglen. Sin esto, la base
 * acumula hallazgos ya resueltos y en dos meses su lista deja de significar nada.
 *
 * Un hallazgo se DESCARTA cuando resulta que no era un defecto (el modelo se equivocó, o
 * la app hacía bien lo que parecía mal). Exige `--motivo`: un descarte sin razón escrita
 * es indistinguible de haberlo barrido debajo de la alfombra.
 *
 * ── `--revalidar-reparadas` solo revalida lo que la reparación explica (24/09/2026) ──
 * Hasta ese día revalidaba TODAS las INVALIDADAS sin hallazgos abiertos. Pero una app se
 * invalida por cualquier cambio, no solo por reparar: otra sesión había añadido una función
 * nueva (el grupo sanguíneo ABO en simulador-genetica y simulador-punnett) y retocado cuatro
 * apps de compraventa sin hallazgo que cerrar. La tanda revalidó 16 apps en vez de 10 y sacó
 * de la cola una función que nadie había inspeccionado. Se deshizo a mano ese día
 * (`hash_inspeccionado = 'reinvalidada-2026-09-24'`).
 *
 * Criterio desde entonces: una INVALIDADA se revalida sola si no tiene hallazgos abiertos Y
 * tiene al menos uno cerrado como ARREGLADO **después** de la última vez que se dio por buena
 * (`apps.validada`: su inspección o su revalidación anterior). Ése es el rastro de la
 * reparación que explica el cambio. Las demás se listan como «sin reparación registrada» y se
 * quedan en la cola; si se sabe que el cambio está verificado, `--revalidar <slug>` lo dice a
 * mano, que es la vía explícita.
 *
 * Por qué hacen falta horas y no fechas: se inspecciona y se repara el MISMO día (lo normal),
 * y con días no hay orden. Con «>=» el caso de origen vuelve a colarse —punnett se inspeccionó
 * y reparó el 11/09 y cambió el 24/09—; con «>» se pierde cada reparación del mismo día. Por
 * eso `hallazgos.cerrado` y `apps.validada` llevan hora. Lo cerrado antes del 24/09/2026 solo
 * tiene la marca de día `[ARREGLADO AAAA-MM-DD]`, y ahí se compara con «>» estricto: ante la
 * duda, la app se queda en la cola (el error que cuesta una inspección, no el que la esconde).
 *
 * Límite que NO cubre: si el mismo intervalo mezcla una reparación y un cambio ajeno, la
 * revalidación da por bueno el conjunto. Por eso se revalida al terminar de reparar, no días
 * después. Casos: `npm run inspector:probar-revalidar`.
 */

import { abrir, ahora, SQL_INVALIDADA } from './db.mjs';

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
/**
 * Imprime la ficha ENTERA —descripción y caso reproducible— en vez del resumen de 150
 * caracteres. Quien va a reparar necesita el caso: el resumen dice QUÉ falla y el caso dice
 * cómo reproducirlo y qué se esperaba, que es lo único con lo que se puede verificar la
 * reparación. Sin esto había que leer la base a mano, y eso invita a reparar de oído.
 */
const DETALLE = args.includes('--detalle');

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
  // `cerrado` con hora: lo lee `--revalidar-reparadas` (ver la cabecera)
  const upd = db.prepare('UPDATE hallazgos SET estado = ?, descripcion = ?, cerrado = ? WHERE id = ?');
  let n = 0;
  for (const id of lista) {
    const h = leer.get(Number(id));
    if (!h) { console.error(`  · id ${id}: no existe`); continue; }
    if (h.estado !== 'abierto') { console.error(`  · id ${id}: ya estaba "${h.estado}"`); continue; }
    const nota = estado === 'descartado'
      ? `${h.descripcion} [DESCARTADO ${hoy}: ${MOTIVO}]`
      : `${h.descripcion} [ARREGLADO ${hoy}]`;
    upd.run(estado, nota, ahora(), h.id);
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
  const upd = db.prepare("UPDATE hallazgos SET estado = 'abierto', descripcion = ?, cerrado = NULL WHERE id = ?");
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
    `UPDATE apps SET hash_inspeccionado = hash_codigo || '|' || COALESCE(hash_deps, ''), validada = ?
     WHERE slug = ? AND ultima_inspeccion IS NOT NULL`,
  );
  const leer = db.prepare('SELECT slug, ultima_inspeccion, veredicto FROM apps WHERE slug = ?');
  let n = 0;
  for (const slug of slugs) {
    const app = leer.get(slug);
    if (!app) { console.error(`  · ${slug}: no está en el catálogo`); continue; }
    if (!app.ultima_inspeccion) { console.error(`  · ${slug}: nunca se ha inspeccionado`); continue; }
    upd.run(ahora(), slug);
    console.log(`  ✓ ${slug} · la inspección del ${app.ultima_inspeccion} vale para el código de hoy`);
    n++;
  }
  const inval = db
    .prepare(`SELECT COUNT(*) n FROM apps WHERE ${SQL_INVALIDADA}`)
    .get().n;
  console.log(`\n${n} revalidada(s) · quedan ${inval} invalidadas en la cola`);
}

/**
 * Momento en que se cerró un hallazgo. `cerrado` lleva hora desde el 24/09/2026; lo anterior
 * solo tiene la marca de día que `cerrar()` deja en la descripción.
 */
function momentoCierre(h) {
  if (h.cerrado) return h.cerrado;
  const m = (h.descripcion || '').match(/\[ARREGLADO (\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

/**
 * ¿Hay una reparación registrada DESPUÉS de la última vez que la app se dio por buena?
 * Las cadenas ISO se ordenan como fechas. Día contra día compara con «>» estricto (mismo día
 * = no se sabe = no); una hora contra un día cuenta desde el principio de ese día, que es lo
 * único que se sabe de una inspección registrada antes de que existiera `validada`.
 */
const arreglados = db.prepare("SELECT descripcion, cerrado FROM hallazgos WHERE slug = ? AND estado = 'arreglado'");
function reparadaDespues(app) {
  const referencia = app.validada || app.ultima_inspeccion;
  return arreglados.all(app.slug).some(h => {
    const c = momentoCierre(h);
    return c !== null && c > referencia;
  });
}

if (REVALIDAR) {
  // La vía explícita: quien la usa dice que el cambio está verificado
  revalidar(REVALIDAR.split(',').map(s => s.trim()).filter(Boolean));
  process.exit(0);
}

if (REVALIDAR_REPARADAS) {
  const invalidadas = db
    .prepare(`SELECT slug, ultima_inspeccion, validada FROM apps WHERE ${SQL_INVALIDADA} ORDER BY slug`)
    .all();
  const abiertos = db.prepare("SELECT COUNT(*) n FROM hallazgos WHERE slug = ? AND estado = 'abierto'");
  const reparadas = [], conAbiertos = [], sinReparacion = [];
  for (const app of invalidadas) {
    // Si queda algo por reparar, la app tiene que seguir en la cola
    if (abiertos.get(app.slug).n > 0) conAbiertos.push(app.slug);
    else if (reparadaDespues(app)) reparadas.push(app.slug);
    else sinReparacion.push(app.slug);
  }
  if (reparadas.length) revalidar(reparadas);
  else console.log('\nNo hay ninguna reparación registrada que revalidar.');
  if (conAbiertos.length)
    console.log(`\nInvalidadas con hallazgos abiertos (${conAbiertos.length}): se quedan en la cola\n  ${conAbiertos.join(' · ')}`);
  if (sinReparacion.length) {
    console.log(`\nInvalidadas sin reparación registrada (${sinReparacion.length}): se quedan en la cola\n  ${sinReparacion.join(' · ')}`);
    console.log('  Cambiaron por otro motivo que nadie ha verificado. Si consta que lo está:\n  npm run inspector:hallazgos -- --revalidar <slug,slug…>');
  }
  console.log('');
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
  if (DETALLE) {
    console.log(`\n${f.descripcion.trim()}\n`);
    if (f.caso) console.log(`      CASO: ${f.caso.trim()}\n`);
  } else {
    console.log(`      ${f.descripcion.slice(0, 150).replace(/\s+/g, ' ')}…`);
  }
}

const porApp = db.prepare(`SELECT slug, COUNT(*) n FROM hallazgos WHERE estado='abierto' GROUP BY slug ORDER BY n DESC`).all();
console.log(`\nPor app: ${porApp.map(r => `${r.slug} (${r.n})`).join(' · ')}`);
console.log(`\nCerrar:  npm run inspector:hallazgos -- --arreglado 1,2,3`);
console.log(`         npm run inspector:hallazgos -- --descartado 4 --motivo "por qué no era un defecto"`);
console.log(`Tras reparar: npm run inspector:hallazgos -- --revalidar-reparadas\n`);
