#!/usr/bin/env node
/**
 * inspector:hallazgos — leer lo que está abierto y cerrarlo cuando se repare
 *
 * Ejecutar:  npm run inspector:hallazgos                 (los abiertos, por severidad)
 *            npm run inspector:hallazgos -- --app lupa-digital
 *            npm run inspector:hallazgos -- --app lupa-digital --detalle   (ficha entera + caso)
 *            npm run inspector:hallazgos -- --ultima --detalle   (los del último día con abiertos)
 *            npm run inspector:hallazgos -- --desde 2026-10-01
 *            npm run inspector:hallazgos -- --arreglado 12,13
 *            npm run inspector:hallazgos -- --descartado 27 --motivo "es correcto: lo confirma la ONCE"
 *            npm run inspector:hallazgos -- --revalidar lupa-digital,conversor-braille
 *            npm run inspector:hallazgos -- --revalidar-reparadas   (solo las que tienen un
 *                                              hallazgo ARREGLADO después de darse por buenas)
 *            npm run inspector:hallazgos -- --revalidar-commits dfaf84a2,4488bd1d --informe <json>
 *                                             (las que SOLO cambiaron por esos commits, con su
 *                                              spec en verde en ese informe de Playwright)
 *
 * ── `--revalidar-commits` (18/10/2026, cabo C0161) ──
 * Un cambio a escala (el refactor 99e1ee7e de las relacionadas el 08/10; las campañas de
 * contraste del 18/10) cambia la huella de cientos de apps y, en el siguiente sync, todas las ya
 * inspeccionadas vuelven a la cola por delante de las nunca vistas, aunque su código de cálculo
 * no se haya movido. El 08/10 se arregló a mano: suite de sus specs y `--revalidar` de una lista.
 *
 * Ahora lo hace este comando, con dos condiciones que tienen que cumplirse las dos:
 *   1. Esos commits explican TODO el cambio: la huella de la app calculada como si no se hubieran
 *      hecho (`pasado.mjs` + la receta de `huella.mjs`, la misma del sync) es igual a la que
 *      tenía al inspeccionarse. Si otro commit tocó también la app, o un fichero que tocaron
 *      esos commits, no cuadra y se queda en la cola.
 *   2. Su spec (`apps.test_path`) pasó en verde en el informe JSON de Playwright que se da con
 *      `--informe` (`npx playwright test <specs> --reporter=json > informe.json`). Que un
 *      commit sea «solo de color» no lo garantiza: un spec puede comprobar colores.
 * Va DESPUÉS de `inspector:sync`, que es el que invalida. Casos: `npm run inspector:probar-revalidar-commits`.
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

import fs from 'fs';
import path from 'path';
import { abrir, ahora, RAIZ, SQL_INVALIDADA } from './db.mjs';
import { crearHuella } from './huella.mjs';
import { lectorEnElPasado } from './pasado.mjs';

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
const REVALIDAR_COMMITS = valorDe('revalidar-commits', '');
const INFORME = valorDe('informe', '');
/** Raíz del repositorio para git: la de siempre, u otra en la prueba (repo desechable). */
const RAIZ_REPO = process.env.INSPECTOR_RAIZ ? path.resolve(process.env.INSPECTOR_RAIZ) : RAIZ;
const MOTIVO = valorDe('motivo', '');
const TODOS = args.includes('--todos');
/**
 * Imprime la ficha ENTERA —descripción y caso reproducible— en vez del resumen de 150
 * caracteres. Quien va a reparar necesita el caso: el resumen dice QUÉ falla y el caso dice
 * cómo reproducirlo y qué se esperaba, que es lo único con lo que se puede verificar la
 * reparación. Sin esto había que leer la base a mano, y eso invita a reparar de oído.
 */
const DETALLE = args.includes('--detalle');
/**
 * Acotar por fecha de inspección (03/10/2026). Lo pide la skill `/reparar`, que por defecto
 * repara «lo de la última inspección»: `--ultima` toma el último DÍA que aún tiene hallazgos
 * abiertos —no el último día con inspección, que puede estar ya reparado entero— y dice cuál
 * es. `hallazgos.fecha` es de día, así que dos tandas del mismo día salen juntas.
 */
const DESDE = valorDe('desde', '');
const ULTIMA = args.includes('--ultima');
if (DESDE && !/^\d{4}-\d{2}-\d{2}$/.test(DESDE)) {
  console.error(`\n✗ --desde espera AAAA-MM-DD (la base guarda las fechas así); llegó "${DESDE}".\n`);
  process.exit(1);
}

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
  // Desde el 26/10/2026 no todas vuelven: las que reposan esperan un mes (cabecera de cola.mjs)
  console.log(`\n${n} revalidada(s) · quedan ${inval} invalidadas, contadas las que reposan (inspector:cola -- --resumen)`);
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

/**
 * Specs en verde según un informe JSON de Playwright: ruta absoluta del spec → ¿todo verde?
 * Verde = cada test `expected` o `skipped`. Un `flaky` (pasó al reintentar) no cuenta: aquí se
 * decide sacar una app de la cola sin mirarla, y ante la duda se queda.
 */
function specsDelInforme(ruta) {
  const j = JSON.parse(fs.readFileSync(ruta, 'utf8'));
  const raizTests = j.config?.rootDir;
  if (!raizTests) throw new Error(`${ruta} no parece un informe JSON de Playwright (falta config.rootDir)`);
  // 'verde' | 'inestable' | 'rojo' por fichero; manda el peor de sus tests
  const peso = { verde: 0, inestable: 1, rojo: 2 };
  const verde = new Map();
  const recorrer = (s) => {
    for (const sp of s.specs ?? []) {
      const f = path.resolve(raizTests, sp.file).toLowerCase();
      for (const t of sp.tests) {
        const e = t.status === 'expected' || t.status === 'skipped' ? 'verde' : t.status === 'flaky' ? 'inestable' : 'rojo';
        if (peso[e] >= peso[verde.get(f) ?? 'verde']) verde.set(f, e);
      }
    }
    for (const hija of s.suites ?? []) recorrer(hija);
  };
  for (const s of j.suites ?? []) recorrer(s);
  return verde;
}

if (REVALIDAR_COMMITS) {
  if (!INFORME) {
    console.error('\n✗ --revalidar-commits exige --informe <json de Playwright> con los specs de esas apps en verde.\n');
    process.exit(1);
  }
  const shas = REVALIDAR_COMMITS.split(',').map((s) => s.trim()).filter(Boolean);
  const pasado = lectorEnElPasado(RAIZ_REPO, shas);
  const { analizarApp } = crearHuella({ raiz: RAIZ_REPO, fsv: pasado.fsv });
  const verde = specsDelInforme(INFORME);
  const invalidadas = db
    .prepare(`SELECT slug, hash_inspeccionado, deps, test_path FROM apps WHERE ${SQL_INVALIDADA} ORDER BY slug`)
    .all();

  const explicadas = [], ajenas = [], otroCambio = [], sinSpec = [], noTocadas = [];
  for (const app of invalidadas) {
    const deps = JSON.parse(app.deps || '[]');
    const lee = (f) => f.startsWith(`app/${app.slug}/`) || deps.some((d) => ['.ts', '.tsx', '/index.ts'].some((e) => f === d + e));
    if (![...pasado.tocados].some(lee)) { noTocadas.push(app.slug); continue; }
    const ajeno = [...pasado.noExplicados].find(([f]) => lee(f));
    if (ajeno) { ajenas.push(`${app.slug} (${ajeno[0]}: ${ajeno[1]})`); continue; }
    const a = analizarApp(app.slug);
    if (!a || `${a.hash_codigo}|${a.hash_deps || ''}` !== app.hash_inspeccionado) { otroCambio.push(app.slug); continue; }
    const spec = app.test_path ? verde.get(path.resolve(RAIZ_REPO, app.test_path).toLowerCase()) : undefined;
    if (spec !== 'verde') {
      const por = !app.test_path ? 'sin test_path' : spec === 'rojo' ? 'spec en ROJO' : spec === 'inestable' ? 'spec INESTABLE: pasó al reintentar' : 'su spec no está en el informe';
      sinSpec.push(`${app.slug} (${por})`);
      continue;
    }
    explicadas.push(app.slug);
  }

  console.log(`\nRevalidar por commits ${pasado.commits.map((c) => c.slice(0, 8)).join(', ')} (pasado = ${pasado.base.slice(0, 8)})`);
  console.log(`  ${invalidadas.length} invalidadas · ${noTocadas.length} no las tocan esos commits`);
  if (explicadas.length) revalidar(explicadas);
  else console.log('\nNinguna se puede revalidar por esos commits.');
  const listar = (titulo, xs) => xs.length && console.log(`\n${titulo} (${xs.length}): se quedan en la cola\n  ${xs.join(' · ')}`);
  listar('Un fichero que esos commits tocaron lo tocó también otro commit', ajenas);
  listar('Esos commits no explican todo el cambio desde su inspección', otroCambio);
  listar('Sin su spec en verde en el informe', sinSpec);
  console.log('');
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
const condiciones = [], parametros = [];
if (APP) { condiciones.push('slug = ?'); parametros.push(APP); }
if (!TODOS) condiciones.push("estado = 'abierto'");
let desde = DESDE;
if (ULTIMA) {
  // El último día DE ESTA APP si se ha pedido una, no el de toda la base
  desde = (APP
    ? db.prepare("SELECT MAX(fecha) f FROM hallazgos WHERE estado = 'abierto' AND slug = ?").get(APP)
    : db.prepare("SELECT MAX(fecha) f FROM hallazgos WHERE estado = 'abierto'").get()).f || '';
  if (!desde) { console.log(`\nNo hay hallazgos abiertos${APP ? ` en ${APP}` : ''} de ninguna fecha.\n`); process.exit(0); }
}
if (desde) { condiciones.push('fecha >= ?'); parametros.push(desde); }
const donde = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
const filas = db.prepare(`SELECT * FROM hallazgos ${donde} ORDER BY ${orden}, slug`).all(...parametros);

const ambito = `${APP ? ` en ${APP}` : ''}${desde ? ` desde el ${desde}${ULTIMA ? ' (último día con abiertos)' : ''}` : ''}`;
if (!filas.length) {
  console.log(`\nNo hay hallazgos${TODOS ? '' : ' abiertos'}${ambito}.\n`);
  process.exit(0);
}

console.log(`\n${filas.length} hallazgo(s)${ambito}:\n`);
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

// Del mismo conjunto que se ha listado, no de toda la base
const porApp = Object.entries(filas.reduce((m, f) => ({ ...m, [f.slug]: (m[f.slug] || 0) + 1 }), {}))
  .sort((a, b) => b[1] - a[1]);
console.log(`\nPor app: ${porApp.map(([slug, n]) => `${slug} (${n})`).join(' · ')}`);
const restantes = db.prepare("SELECT COUNT(*) n FROM hallazgos WHERE estado = 'abierto'").get().n;
if (desde && !TODOS && restantes > filas.length)
  console.log(`(fuera de este filtro quedan ${restantes - filas.length} abiertos más: sin --desde/--ultima se ven todos)`);
console.log(`\nCerrar:  npm run inspector:hallazgos -- --arreglado 1,2,3`);
console.log(`         npm run inspector:hallazgos -- --descartado 4 --motivo "por qué no era un defecto"`);
console.log(`Tras reparar: npm run inspector:hallazgos -- --revalidar-reparadas\n`);
