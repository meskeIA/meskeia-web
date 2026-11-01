#!/usr/bin/env node
/**
 * inspector:cola — qué apps toca inspeccionar ahora, por qué y de qué MODO
 *
 * Ejecutar:  npm run inspector:cola            (las 10 siguientes)
 *            npm run inspector:cola -- 25
 *            npm run inspector:cola -- --resumen
 *
 * No llama a ningún modelo: es una consulta. La skill `/inspector` empieza leyendo
 * esto, para que la decisión de "qué toca hoy" sea reproducible y auditable en vez de
 * quedar al criterio de lo que el modelo recuerde de la sesión anterior.
 *
 * LOS TRAMOS, EN ORDEN
 * ────────────────────
 *   1. TEST EN ROJO   — algo que se verificó se ha roto. Es el caso que justifica todo
 *                       esto: `lupa-digital` funcionaba en el móvil del usuario y dejó
 *                       de hacerlo sin que nadie tocara la app.
 *   2. FIRMA          — ya inspeccionada, pero DESPUÉS apareció en Analytics la firma de
 *                       una app que la gente no consigue usar (visitas cortas seguidas de
 *                       recarga; ver `firma.mjs`). Es la vía para lo que rompe una app sin
 *                       tocar su código —una cabecera, un navegador nuevo— y que por eso
 *                       nunca la invalidaría. Sale de la cola al volver a inspeccionarla.
 *   3. POR VALOR      — en UNA sola lista, las nunca vistas (modo `primera`) y las que
 *                       cambiaron desde su inspección y no reposan (modo `cambio`), por su
 *                       valor esperado (abajo). Lo que rompe una app es un cambio, no el paso
 *                       del tiempo: por eso la cola no va por calendario.
 *   4. CABO           — apps YA inspeccionadas sobre las que una sesión dejó una sospecha sin
 *                       caso (cabo de destino `inspector`): comprobación PUNTUAL de esa pregunta,
 *                       aparte del cupo, como mucho CABOS_POR_TANDA por tanda.
 *
 * LOS TRES MODOS (01/11/2026, auditoría de los procesos de revisión)
 * ──────────────────────────────────────────────────────────────────
 *   primera — la inspección entera de siempre: tres casos resueltos a mano, la promesa, la FAQ.
 *   cambio  — la app ya se inspeccionó y su código o sus datos cambiaron: se mira el DIFF desde
 *             su última validación (la cola imprime la orden `git diff`), se pasa su spec y se
 *             responde su cabo si lo tiene. Lo que no tocó el cambio no se vuelve a revisar
 *             salvo un alto que salte a la vista: lo ya verificado lo vigilan los specs.
 *   cabo    — solo la pregunta del cabo, sobre una app ya vista. NO revalida la app: no cambia
 *             su `ultima_inspeccion` ni su huella (`registrar.mjs`), así que si además cambió,
 *             su cambio sigue en la lista por valor.
 *
 * Por qué: desde que el Inspector es tarea de Windows (09/10) hasta el 01/11, 159 de sus 173
 * inspecciones (92 %) fueron repeticiones COMPLETAS de apps ya vistas, que encontraron 0,16
 * altos por inspección frente a 0,93 de las primeras. Como `ok` es casi inalcanzable en una
 * inspección entera, cada vuelta encontraba 4-5 menores nuevos en partes que nadie había tocado,
 * y el bucle Inspector → Reparar → Inspector se alimentaba solo. El reposo del 26/10 no cambió la
 * mezcla (71 repeticiones y 9 primeras en los seis días siguientes) porque los cabos de destino
 * `inspector` se lo saltaban: 125 abiertos, entrando 34 a la semana y saliendo 20.
 *
 * EL ORDEN POR VALOR ESPERADO (01/11/2026, decidido por el usuario)
 * ────────────────────────────────────────────────────────────────
 * Hasta ese día los tramos eran estrictos: cualquier INVALIDADA iba antes que cualquier NUEVA,
 * aunque rindiera cinco veces menos. Ahora compiten en una lista:
 *
 *     valor = prioridad + 10·log10(tasa · 1000 / segundos)      (por modo)
 *
 * `prioridad` es la de siempre (uso, riesgo, firma, contenido; abajo), y el sumando nuevo es el
 * rendimiento MEDIDO de cada modo en la base: altos o críticos por inspección, dividido por lo
 * que tarda, en los últimos VENTANA_DIAS días. Como la prioridad ya es logarítmica, sumar es
 * multiplicar: valor ∝ tasa × usos × riesgo / coste, que es lo que se aprobó, sin tocar los pesos
 * que ya ordenaban dentro de cada modo. Con los datos del 01/11 (primera 1,15 altos en 1.021 s;
 * repetición entera 0,24 en 1.137 s) una re-inspección vale unos 7 puntos menos que una primera
 * inspección de la misma app: `tabla-integrales` (436 usos, nunca vista) pasa por delante de la
 * invalidada de más uso, y una nunca vista de 20 usos sigue detrás.
 *
 * El modo `cambio` se mide con sus propias inspecciones en cuanto haya MIN_MUESTRA en la ventana;
 * hasta entonces, con las repeticiones enteras de antes, que tardaban lo mismo que una primera.
 * Así el modo nuevo empieza valiendo poco y sube solo si de verdad sale más barato: no hay ningún
 * coste escrito a mano. Las cifras de cada tanda salen impresas en la cabecera de la cola.
 *
 * LOS CABOS: COMPROBACIÓN PUNTUAL, NO RE-INSPECCIÓN (01/11/2026)
 * ──────────────────────────────────────────────────────────────
 * Del 18/10 al 01/11 un cabo sacaba su app al tramo de las INVALIDADAS por su prioridad, aunque
 * reposara (decidido el 18/10, porque `lupa-digital` y `conversor-braille` esperaban con su cabo
 * detrás de 146 apps de menos uso). Ese fin se conserva —un cabo no espera— pero sin una
 * inspección entera: las apps ya vistas que nombra un cabo van al carril CABO, por su prioridad,
 * fuera del cupo de la tanda. La de una nunca vista entra en su primera inspección, con la pregunta
 * a la vista. Un cabo `familia:<id>` es UNA comprobación, con el testigo de la familia, no 16.
 * Un cabo cuenta para una app si su sujeto ES el slug, si lo NOMBRA (`simulador-regresion/
 * page.tsx:444`, «a y b») o si es `familia:<id>` de una familia declarada.
 * Pruebas: `npm run inspector:probar-cola-cabos` y `npm run inspector:probar-cola-valor`.
 *
 * EL REPOSO DE UN MES (26/10/2026)
 * ────────────────────────────────
 * Si la ÚLTIMA inspección de una app no dejó ningún hallazgo alto ni crítico, la app no vuelve
 * por cambio de código en DIAS_REPOSO días: reparar sus bajos y medios ya no la devuelve a la
 * cola al día siguiente. Si dejó un alto, se repara y vuelve en cuanto cambia su código. El rojo,
 * la firma y los cabos no esperan: son exposición nueva o una pregunta concreta.
 * Sale de medir el bucle Inspector → Reparar → Inspector: `estimador-compraventa-inmueble` llevaba
 * 28 inspecciones sin un solo «ok», la familia de compraventa (7 apps) se llevaba el 25 % de las
 * inspecciones y en octubre el 92 % eran repeticiones. Decidido por el usuario ese día, con el mes.
 * Una FAMILIA reposa entera o no reposa: si una hermana no está en reposo, salen todas.
 * Prueba: `npm run inspector:probar-cola-reposo`.
 *
 * LAS FAMILIAS SALEN JUNTAS
 * ─────────────────────────
 * Si una app pertenece a una familia declarada en `familias.mjs`, la cola saca el grupo
 * ENTERO y no la app suelta. Sale de haber medido (23/09/2026) que reparar en lote no
 * cierra el problema: el commit `cfe091a7` reparó el clúster de compraventa «en las SIETE
 * apps» y aun así dejó cuatro huecos. El detalle, en la cabecera de `familias.mjs`.
 *
 * POR QUÉ EL USO PESA TANTO (medido el 14/08/2026 sobre el dump de Turso)
 * ──────────────────────────────────────────────────────────────────────
 * El 50 % del uso del catálogo está en 22 apps y el 80 % en 114; hay 410 apps con dos
 * usos o menos en toda su vida. Recorrer las 985 en orden dedicaría el grueso del
 * esfuerzo al 20 % del uso.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { abrir, SQL_INVALIDADA } from './db.mjs';
import { FAMILIAS, familiaDe, slugsHuerfanos, appsDelSujeto } from './familias.mjs';
import { RAIZ, RUTA_BASE as RUTA_CABOS, codigo } from '../cabos/cabos.mjs';

const args = process.argv.slice(2);
const RESUMEN = args.includes('--resumen');
const CUANTAS = Number(args.find(a => /^\d+$/.test(a))) || 10;
// --json: lo que saldrá de verdad, para `inspector-tarea.mjs lanzar`, que avisa cuando una
// familia desborda el cupo pedido (13/10/2026: cupo bajado de 10 a 5)
const JSON_SALIDA = args.includes('--json');
const log = JSON_SALIDA ? () => {} : console.log;

/** Comprobaciones puntuales de cabos por tanda, aparte del cupo. */
const CABOS_POR_TANDA = 3;
const VENTANA_DIAS = 90;
const MIN_MUESTRA = 10;
/** Si la ventana no llega a MIN_MUESTRA: lo medido el 01/11/2026 en los 90 días anteriores. */
const MEDIDO_01_11 = {
  primera: { tasa: 1.145, segundos: 1021 },
  cambio: { tasa: 0.241, segundos: 1137 },
};

const db = abrir();

/**
 * Los cabos abiertos de destino `inspector`: por app (slug → códigos) y cuáles son de familia.
 * Solo lectura: la base de cabos se abre aparte y no se crea si no existe.
 */
function leerCabos() {
  const ruta = process.env.CABOS_DB || RUTA_CABOS;
  const porApp = new Map();
  const deFamilia = new Map();   // id de familia → códigos
  if (!fs.existsSync(ruta)) return { porApp, deFamilia };
  const cabos = new DatabaseSync(ruta, { readOnly: true });
  try {
    const slugs = new Set(db.prepare('SELECT slug FROM apps').all().map((a) => a.slug));
    const filas = cabos.prepare("SELECT id, sujeto FROM cabos WHERE estado = 'abierto' AND destino = 'inspector' ORDER BY id").all();
    for (const c of filas) {
      const s = c.sujeto.trim();
      if (s.startsWith('familia:') && FAMILIAS.some((f) => f.id === s.slice(8).trim())) {
        const id = s.slice(8).trim();
        if (!deFamilia.has(id)) deFamilia.set(id, []);
        deFamilia.get(id).push(codigo(c.id));
      }
      for (const a of appsDelSujeto(c.sujeto, slugs)) {
        if (!porApp.has(a)) porApp.set(a, []);
        porApp.get(a).push(codigo(c.id));
      }
    }
  } finally {
    cabos.close();
  }
  return { porApp, deFamilia };
}

const { porApp: CABOS, deFamilia: CABOS_FAMILIA } = leerCabos();
// Los slugs son [a-z0-9-] (los da la propia base): se pueden escribir en el SQL sin escapar
const enSql = (lista) => `(${[...lista].filter((s) => /^[a-z0-9-]+$/.test(s)).map((s) => `'${s}'`).join(', ') || "''"})`;
const SQL_CABO = `slug IN ${enSql(CABOS.keys())}`;

/**
 * Apps en reposo: su última inspección tiene menos de DIAS_REPOSO días y no dejó ningún alto ni
 * crítico (ver «EL REPOSO DE UN MES»). Una familia reposa solo si reposan todas sus hermanas.
 * Una comprobación puntual de cabo cuenta como última inspección: si encuentra un alto, la app
 * deja de reposar y su cambio vuelve a la lista.
 */
const DIAS_REPOSO = 30;
function enReposo() {
  const filas = db.prepare(`
    SELECT slug FROM apps a
    WHERE ultima_inspeccion IS NOT NULL
      AND julianday('now') - julianday(substr(ultima_inspeccion, 1, 10)) < ${DIAS_REPOSO}
      AND NOT EXISTS (
        SELECT 1 FROM hallazgos h
        WHERE h.severidad IN ('critico', 'alto')
          AND h.inspeccion_id = (SELECT i.id FROM inspecciones i WHERE i.slug = a.slug ORDER BY i.fecha DESC, i.id DESC LIMIT 1)
      )`).all();
  const reposan = new Set(filas.map((f) => f.slug));
  for (const f of FAMILIAS) {
    if (!f.slugs.every((s) => reposan.has(s))) for (const s of f.slugs) reposan.delete(s);
  }
  return reposan;
}
const REPOSO = enReposo();
const SQL_REPOSO = `slug IN ${enSql(REPOSO)}`;
/** INVALIDADA que sí vuelve a la cola: la que está en reposo espera. */
const SQL_INVALIDADA_ACTIVA = `((${SQL_INVALIDADA}) AND NOT (${SQL_REPOSO}))`;

/**
 * El rendimiento medido de cada modo: altos o críticos por inspección y segundos por inspección,
 * en los últimos VENTANA_DIAS días. `primera` = la primera inspección de cada app; `cambio` = las
 * registradas con ese modo o, mientras no lleguen a MIN_MUESTRA, las repeticiones enteras de antes
 * del 01/11/2026 (sin modo). Las comprobaciones puntuales de cabo no entran: no son inspecciones
 * de la app entera ni de su cambio.
 */
function medirModos() {
  const filas = db.prepare(`
    WITH ord AS (
      SELECT i.id, i.fecha, i.segundos, i.modo,
             ROW_NUMBER() OVER (PARTITION BY i.slug ORDER BY i.fecha, i.id) AS n
      FROM inspecciones i)
    SELECT o.n, o.modo, o.segundos,
           (SELECT COUNT(*) FROM hallazgos h WHERE h.inspeccion_id = o.id AND h.severidad IN ('critico', 'alto')) AS altos
    FROM ord o WHERE o.fecha >= date('now', '-${VENTANA_DIAS} day')`).all();
  const medir = (lista, clave, origen) => {
    if (lista.length < MIN_MUESTRA) return { ...MEDIDO_01_11[clave], n: lista.length, origen: 'medido el 01/11/2026 (pocas en la ventana)' };
    const conSeg = lista.filter((f) => f.segundos > 0);
    return {
      tasa: lista.reduce((s, f) => s + f.altos, 0) / lista.length,
      segundos: conSeg.length ? conSeg.reduce((s, f) => s + f.segundos, 0) / conSeg.length : MEDIDO_01_11[clave].segundos,
      n: lista.length,
      origen,
    };
  };
  const primera = filas.filter((f) => f.modo === 'primera' || (f.modo == null && f.n === 1));
  const cambioNuevo = filas.filter((f) => f.modo === 'cambio');
  const cambio = cambioNuevo.length >= MIN_MUESTRA
    ? medir(cambioNuevo, 'cambio', 'inspecciones en modo cambio')
    : medir(filas.filter((f) => f.n > 1 && f.modo == null), 'cambio', 'repeticiones enteras de antes del 01/11/2026');
  return { primera: medir(primera, 'primera', 'primeras inspecciones'), cambio };
}
const MODOS = medirModos();
/** Lo que el modo suma a la prioridad: 10·log10(tasa · 1000 / segundos). */
const PLUS = Object.fromEntries(Object.entries(MODOS).map(([k, m]) => [k, 10 * Math.log10(Math.max(m.tasa, 0.001) * 1000 / m.segundos)]));

/**
 * Prioridad = uso real + riesgo + sospecha de estar rota.
 *
 * El uso entra en logaritmo a propósito: entre 5 y 50 usos hay una diferencia real,
 * entre 900 y 1.200 casi ninguna, y sin log las cuatro apps más visitadas coparían la
 * cola durante semanas.
 *
 * El tercer sumando es el que aporta el caso de lupa-digital: la firma de una app en la que
 * se entra, no se consigue nada y se recarga. Como indicio basta para mirarla antes; como
 * prueba no vale nada, y por eso solo ordena.
 *
 * Hasta el 24/09/2026 ese sumando era «≥ 50 usos y estancia media < 30 s». No podía ver la
 * lupa: la media de la estancia se calcula solo sobre las visitas con duración registrada, y
 * unas pocas visitas largas la suben por encima de 30 s aunque la mayoría se vaya a los
 * pocos segundos. La firma de `firma.mjs` se calibró sobre la lupa rota y la marca.
 */
const PRIORIDAD = `
  (LOG(usos + 1) * 10)
  + ((5 - riesgo) * 5)
  + (CASE WHEN firma IS NOT NULL THEN 20 ELSE 0 END)
  - (CASE WHEN segmento = 'contenido' THEN 15 ELSE 0 END)
`;

/** Inspeccionada ANTES de que apareciera la firma: la inspección no pudo tenerla en cuenta. */
const SQL_FIRMA_NUEVA = `
  firma IS NOT NULL AND ultima_inspeccion IS NOT NULL AND ultima_inspeccion < firma_desde
`;

const SQL_ROJO = `test_estado = 'rojo'`;
const SQL_LISTA_VALOR = `
  COALESCE(test_estado, '') <> 'rojo' AND NOT (${SQL_FIRMA_NUEVA})
  AND (ultima_inspeccion IS NULL OR ${SQL_INVALIDADA_ACTIVA})`;
/**
 * Ya vista y con cabo: comprobación puntual, si no sale en la tanda por otro tramo (la que cambió
 * y sale por valor lleva su cabo en la misma inspección). Una invalidada que no sale en la tanda
 * también va: el cabo no espera a que su cambio llegue por valor.
 */
const SQL_SOLO_CABO = `
  ${SQL_CABO} AND ultima_inspeccion IS NOT NULL
  AND COALESCE(test_estado, '') <> 'rojo' AND NOT (${SQL_FIRMA_NUEVA})`;

const conModo = (f) => {
  const modo = f.ultima_inspeccion == null ? 'primera' : 'cambio';
  return { ...f, modo, v: f.p + PLUS[modo] };
};

const TRAMOS = [
  {
    clave: 'ROJO',
    titulo: 'Test en rojo — se ha roto algo que ya estaba verificado',
    filas: () => db.prepare(`SELECT *, ${PRIORIDAD} AS p FROM apps WHERE ${SQL_ROJO} ORDER BY p DESC`).all()
      .map((f) => ({ ...f, modo: 'rojo', v: f.p })),
  },
  {
    clave: 'FIRMA',
    titulo: 'Firma de rotura — la gente entra, no lo consigue y recarga (apareció tras la inspección)',
    filas: () => db.prepare(`SELECT *, ${PRIORIDAD} AS p FROM apps
          WHERE ${SQL_FIRMA_NUEVA} AND COALESCE(test_estado, '') <> 'rojo' AND NOT ${SQL_INVALIDADA_ACTIVA}
          ORDER BY p DESC`).all().map((f) => ({ ...f, modo: 'firma', v: f.p })),
  },
  {
    clave: 'VALOR',
    titulo: 'Por valor esperado — nunca vistas (primera) y cambiadas desde su inspección (cambio), en una lista',
    filas: () => db.prepare(`SELECT *, ${PRIORIDAD} AS p FROM apps WHERE ${SQL_LISTA_VALOR}`).all()
      .map(conModo).sort((a, b) => b.v - a.v),
  },
];

/** Fecha DD/MM de un ISO. */
const ddmm = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '');

/**
 * La orden del diff de una app en modo `cambio`: desde el último commit anterior a su última
 * validación (o, si no la tiene, al día de su última inspección) hasta HEAD, sobre su carpeta y
 * sus dependencias. Una dependencia viene sin extensión (`data/fiscal/iva`): se resuelve al fichero
 * o la carpeta que exista.
 */
function ordenDiff(f) {
  const desde = f.validada || `${f.ultima_inspeccion}T00:00:00Z`;
  let base = null;
  try {
    base = execFileSync('git', ['-C', RAIZ, 'rev-list', '-1', `--before=${desde}`, 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().slice(0, 8) || null;
  } catch { /* sin git: se dice abajo */ }
  const deps = JSON.parse(f.deps || '[]').map((d) => {
    for (const c of [`${d}.ts`, `${d}.tsx`, `${d}.mjs`, d]) if (fs.existsSync(path.join(RAIZ, c))) return c;
    return d;
  });
  if (!base) return `cambio desde ${ddmm(desde)} (base no encontrada: git log --since=${desde.slice(0, 10)} -- app/${f.slug}/)`;
  return `cambio desde ${ddmm(desde)}: git diff ${base} HEAD -- app/${f.slug}/${deps.length ? ' ' + deps.join(' ') : ''}`;
}

/** La etiqueta de modo que va al final de la línea de una app. */
function etiqueta(f) {
  const cabos = CABOS.has(f.slug) ? ` · cabo ${CABOS.get(f.slug).join(', ')}` : '';
  if (f.modo === 'cambio') return `  · ${ordenDiff(f)}${cabos}`;
  if (f.modo === 'cabo') return `  · cabo ${(f.codigos ?? CABOS.get(f.slug)).join(', ')}: comprobación puntual`;
  return `  · ${f.modo}${cabos}`;
}

if (RESUMEN) {
  const t = db.prepare('SELECT COUNT(*) n FROM apps').get().n;
  const vistas = db.prepare('SELECT COUNT(*) n FROM apps WHERE ultima_inspeccion IS NOT NULL').get().n;
  const conTest = db.prepare('SELECT COUNT(*) n FROM apps WHERE test_path IS NOT NULL').get().n;
  const abiertos = db.prepare("SELECT COUNT(*) n FROM hallazgos WHERE estado = 'abierto'").get().n;
  const cuenta = (sql) => db.prepare(`SELECT COUNT(*) n FROM apps WHERE ${sql}`).get().n;
  log(`\nEstado del Inspector`);
  log(`  catálogo:        ${t} apps`);
  log(`  inspeccionadas:  ${vistas} (${(100 * vistas / t).toFixed(1)} %)`);
  log(`  con test propio: ${conTest}`);
  log(`  hallazgos abiertos: ${abiertos}`);
  log(`  cola ROJO        ${cuenta(SQL_ROJO)}`);
  log(`  cola FIRMA       ${cuenta(`${SQL_FIRMA_NUEVA} AND COALESCE(test_estado, '') <> 'rojo' AND NOT ${SQL_INVALIDADA_ACTIVA}`)}`);
  log(`  por valor:       ${cuenta(`(${SQL_LISTA_VALOR}) AND ultima_inspeccion IS NULL`)} nunca vistas (primera) · ${cuenta(`(${SQL_LISTA_VALOR}) AND ultima_inspeccion IS NOT NULL`)} cambiadas (cambio)`);
  log(`  cabos por comprobar: ${cuenta(SQL_SOLO_CABO)} apps ya vistas (comprobación puntual, ${CABOS_POR_TANDA} por tanda aparte del cupo)`);
  const reposan = cuenta(`(${SQL_INVALIDADA}) AND ${SQL_REPOSO}`);
  log(`  en reposo:       ${reposan} invalidadas que esperan (sin altos en su última inspección, < ${DIAS_REPOSO} días)`);
  const nCabos = [...CABOS.values()].reduce((s, l) => s + l.length, 0);
  log(`  con cabo del Inspector: ${CABOS.size} apps (${nCabos} cabos)`);
  log(`  rendimiento por modo (últimos ${VENTANA_DIAS} días): primera ${fmt(MODOS.primera)} · cambio ${fmt(MODOS.cambio)}`);
  // Cobertura del uso: la cifra que de verdad dice cuánto se ha protegido
  const total = db.prepare('SELECT SUM(usos) s FROM apps').get().s || 1;
  const cubierto = db.prepare('SELECT SUM(usos) s FROM apps WHERE ultima_inspeccion IS NOT NULL').get().s || 0;
  log(`\n  uso del catálogo ya inspeccionado: ${(100 * cubierto / total).toFixed(1)} %`);
  log(`  (es la cifra que importa, no el % de apps: el 80 % del uso está en 114 apps)`);

  const huerf = slugsHuerfanos(db);
  log(`\n  familias declaradas: ${FAMILIAS.length} (salen JUNTAS de la cola)`);
  for (const f of FAMILIAS) {
    const pend = f.slugs.filter((s) => !!db.prepare(
      `SELECT 1 x FROM apps WHERE slug = ? AND (test_estado = 'rojo' OR ${SQL_INVALIDADA_ACTIVA} OR ultima_inspeccion IS NULL)`,
    ).get(s)).length;
    log(`    ${f.id.padEnd(14)} ${f.slugs.length} apps · ${pend} pendientes · ${f.testigo}`);
  }
  if (huerf.length) {
    log(`  ⚠ ${huerf.length} slug(s) declarados que ya no existen — corrige familias.mjs:`);
    for (const h of huerf) log(`      ${h.familia} → ${h.slug}`);
  }
  process.exit(0);
}

/** «1,15 altos/insp. en 1.021 s (n=179)» */
function fmt(m) {
  const n = (x, d) => x.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
  return `${n(m.tasa, 2)} altos/insp. en ${n(m.segundos, 0)} s (${m.n}, ${m.origen})`;
}

/** Una línea de app, con su valor, uso y avisos. */
function linea(f, sangria = '  ') {
  const deps = JSON.parse(f.deps || '[]');
  return (
    `${sangria}${String(Math.round(f.v ?? f.p)).padStart(3)}  ${f.slug.padEnd(44)} ` +
    `${f.segmento.padEnd(11)} riesgo ${f.riesgo}  ${String(f.usos).padStart(5)} usos` +
    (deps.length ? `  [${deps.length} dep]` : '') +
    etiqueta(f) +
    (f.firma ? `\n${sangria}     ⚠ firma de rotura (${f.firma}): ${f.firma_detalle}` : '')
  );
}

/**
 * En qué estado está una hermana de una familia que ya sale. Mira la INVALIDADA sin reposo: si la
 * familia sale, salen todas.
 */
const SQL_ESTADO = db.prepare(`
  SELECT *, ${PRIORIDAD} AS p,
         CASE WHEN test_estado = 'rojo' THEN 'rojo'
              WHEN ${SQL_FIRMA_NUEVA} AND NOT (${SQL_INVALIDADA}) THEN 'firma'
              WHEN ultima_inspeccion IS NULL THEN 'primera'
              WHEN ${SQL_INVALIDADA} THEN 'cambio'
              ELSE 'al día' END AS estado
  FROM apps WHERE slug = ?`);

const huerfanos = slugsHuerfanos(db);
if (huerfanos.length) {
  log('\n⚠ Familias con slugs que ya no existen en el catálogo (corrige familias.mjs):');
  for (const h of huerfanos) log(`    ${h.familia} → ${h.slug}`);
}

log(`\nRendimiento por modo (últimos ${VENTANA_DIAS} días): primera ${fmt(MODOS.primera)} · cambio ${fmt(MODOS.cambio)}`);
log(`  → una inspección en modo cambio suma ${PLUS.cambio.toFixed(1).replace('.', ',')} a la prioridad y una primera ${PLUS.primera.toFixed(1).replace('.', ',')}`);

let quedan = CUANTAS;
let mostradas = 0;
const elegidosSlugs = new Set();
const familiasYaSacadas = new Set();
const familiasSacadas = [];

for (const t of TRAMOS) {
  if (quedan <= 0) break;
  const elegidas = [];

  for (const f of t.filas()) {
    if (quedan <= 0) break;
    const fam = familiaDe(f.slug);

    if (!fam) {
      elegidas.push({ tipo: 'app', fila: f });
      elegidosSlugs.add(f.slug);
      quedan -= 1;
      continue;
    }
    if (familiasYaSacadas.has(fam.id)) continue;   // ya salió entera más arriba

    // La familia sale ENTERA: las pendientes cuentan contra el cupo; las que están al día se
    // listan como contexto, porque el testigo las mide igualmente.
    const miembros = fam.slugs.map((s) => SQL_ESTADO.get(s)).filter(Boolean)
      .map((m) => ({ ...m, modo: m.estado === 'al día' ? 'al día' : m.estado, v: m.p + (PLUS[m.estado] ?? 0) }));
    elegidas.push({ tipo: 'familia', familia: fam, miembros });
    familiasYaSacadas.add(fam.id);
    for (const m of miembros) elegidosSlugs.add(m.slug);
    quedan -= miembros.filter((m) => m.estado !== 'al día').length;
  }

  if (!elegidas.length) continue;
  log(`\n${t.titulo}`);

  for (const e of elegidas) {
    if (e.tipo === 'app') {
      log(linea(e.fila));
      mostradas += 1;
      continue;
    }
    const pendientes = e.miembros.filter((m) => m.estado !== 'al día').length;
    log(`\n  👯 FAMILIA «${e.familia.nombre}» — se inspeccionan JUNTAS ` +
                `(${pendientes} de ${e.miembros.length} pendientes)`);
    log(`     testigo:    ${e.familia.testigo}`);
    log(`     referencia: ${e.familia.referencia} — el patrón correcto, no rediseñar`);
    log(`     invariante: ${e.familia.invariante}`);
    if (CABOS_FAMILIA.has(e.familia.id)) log(`     cabo de la familia: ${CABOS_FAMILIA.get(e.familia.id).join(', ')}`);
    for (const m of e.miembros) {
      log(linea(m, '      '));
    }
    mostradas += pendientes;
    familiasSacadas.push({ nombre: e.familia.nombre, pendientes, miembros: e.miembros.length });
  }
}

/**
 * El carril de los cabos: comprobaciones puntuales sobre apps ya vistas que no han salido arriba,
 * por su prioridad, como mucho CABOS_POR_TANDA. Un cabo `familia:<id>` es una sola entrada.
 */
const puntuales = [];
{
  const yaVista = (slug) => !elegidosSlugs.has(slug);
  for (const [famId, codigos] of CABOS_FAMILIA) {
    if (familiasYaSacadas.has(famId)) continue;
    const fam = FAMILIAS.find((f) => f.id === famId);
    // Una familia que nadie ha mirado lleva su cabo a su primera inspección, por valor
    if (!fam.slugs.some((s) => SQL_ESTADO.get(s)?.ultima_inspeccion)) continue;
    const p = Math.max(...fam.slugs.map((s) => SQL_ESTADO.get(s)?.p ?? 0));
    puntuales.push({ tipo: 'familia', familia: fam, codigos, p });
  }
  const filas = db.prepare(`SELECT *, ${PRIORIDAD} AS p FROM apps WHERE ${SQL_SOLO_CABO} ORDER BY p DESC`).all();
  for (const f of filas) {
    if (!yaVista(f.slug)) continue;
    const fam = familiaDe(f.slug);
    // Una hermana cuyo único cabo es el de su familia ya va en la entrada de la familia
    const propios = CABOS.get(f.slug).filter((c) => !(fam && (CABOS_FAMILIA.get(fam.id) ?? []).includes(c)));
    if (!propios.length) continue;
    puntuales.push({ tipo: 'app', fila: { ...f, modo: 'cabo', v: f.p, codigos: propios }, p: f.p });
  }
  puntuales.sort((a, b) => b.p - a.p);
}
const puntualesTanda = puntuales.slice(0, CABOS_POR_TANDA);
if (puntualesTanda.length) {
  log(`\nCabo — comprobación PUNTUAL de la pregunta del cabo, en apps ya vistas (aparte del cupo; ${puntuales.length} esperan)`);
  for (const e of puntualesTanda) {
    if (e.tipo === 'app') {
      log(linea(e.fila));
    } else {
      log(`  ${String(Math.round(e.p)).padStart(3)}  👯 familia «${e.familia.nombre}» (${e.familia.slugs.length} apps)  · cabo ${e.codigos.join(', ')}: comprobación puntual con su testigo, ${e.familia.testigo}`);
    }
  }
}

if (JSON_SALIDA) {
  console.log(JSON.stringify({ pedidas: CUANTAS, apps: mostradas, familias: familiasSacadas, cabos: puntualesTanda.length }));
  process.exit(0);
}

if (!mostradas && !puntualesTanda.length) log('\nNada en cola: todo el catálogo está inspeccionado y sin cambios desde entonces.');
else log(`\n${mostradas} apps${puntualesTanda.length ? ` + ${puntualesTanda.length} comprobaciones puntuales de cabo` : ''} · npm run inspector:cola -- --resumen para el estado global`);
