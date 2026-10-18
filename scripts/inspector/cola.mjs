#!/usr/bin/env node
/**
 * inspector:cola — qué apps toca inspeccionar ahora, y por qué
 *
 * Ejecutar:  npm run inspector:cola            (las 10 siguientes)
 *            npm run inspector:cola -- 25
 *            npm run inspector:cola -- --resumen
 *
 * No llama a ningún modelo: es una consulta. La skill `/inspector` empieza leyendo
 * esto, para que la decisión de "qué toca hoy" sea reproducible y auditable en vez de
 * quedar al criterio de lo que el modelo recuerde de la sesión anterior.
 *
 * LAS CUATRO COLAS, EN ORDEN DE PRIORIDAD
 * ───────────────────────────────────────
 *   1. TEST EN ROJO   — algo que se verificó se ha roto. Es el caso que justifica todo
 *                       esto: `lupa-digital` funcionaba en el móvil del usuario y dejó
 *                       de hacerlo sin que nadie tocara la app.
 *   2. FIRMA          — ya inspeccionada, pero DESPUÉS apareció en Analytics la firma de
 *                       una app que la gente no consigue usar (visitas cortas seguidas de
 *                       recarga; ver `firma.mjs`). Es la vía para lo que rompe una app sin
 *                       tocar su código —una cabecera, un navegador nuevo— y que por eso
 *                       nunca la invalidaría. Sale de la cola al volver a inspeccionarla.
 *   3. INVALIDADA     — cambió su código o un dato de `data/fiscal` del que depende
 *      O CON CABO       DESPUÉS de inspeccionarla. Lo que rompe una app es un cambio,
 *                       no el paso del tiempo: por eso la cola no va por calendario.
 *                       En el mismo tramo, y por la misma prioridad, las apps que nombra un
 *                       cabo abierto de destino `inspector` (una sospecha sin caso que dejó
 *                       otra sesión). Ver «LOS CABOS COMPITEN», abajo.
 *   4. NUNCA VISTA    — por prioridad (uso real × riesgo), no por orden alfabético.
 *
 * LOS CABOS COMPITEN POR SU PRIORIDAD (18/10/2026)
 * ────────────────────────────────────────────────
 * Hasta ese día la cola no leía los cabos: la skill mandaba meter sus apps «detrás de las
 * FIRMA e INVALIDADA» y lo hacía Claude a mano. Con 146 INVALIDADAS y 5 apps por tanda, ese
 * bloque no se alcanzaba nunca y la bandeja crecía 6:1. La cola larga debía esperar (mediana
 * de 17 usos, frente a 111 en las INVALIDADAS); lo malo eran las excepciones: `lupa-digital`
 * (4.310 usos) y `conversor-braille` (3.714) esperaban detrás de 146 apps de menos uso.
 * Decidido por el usuario: compiten en el tramo 3 por la prioridad de siempre, sin bonificación.
 * Un cabo cuenta para una app si su sujeto ES el slug, si lo NOMBRA (`simulador-regresion/
 * page.tsx:444`, «a y b») o si es `familia:<id>` de una familia declarada. Prueba:
 * `npm run inspector:probar-cola-cabos`.
 *
 * LAS FAMILIAS SALEN JUNTAS
 * ─────────────────────────
 * Si una app pertenece a una familia declarada en `familias.mjs`, la cola saca el grupo
 * ENTERO y no la app suelta. Sale de haber medido (23/09/2026) que reparar en lote no
 * cierra el problema: el commit `cfe091a7` reparó el clúster de compraventa «en las SIETE
 * apps» y aun así dejó cuatro huecos, uno de ellos reintroduciendo en una hermana el mismo
 * defecto que corregía en otra. Verlas de una en una, con meses de separación, es lo que
 * hace que eso no se detecte. El detalle, en la cabecera de `familias.mjs`.
 *
 * POR QUÉ EL ORDEN IMPORTA TANTO (medido el 14/08/2026 sobre el dump de Turso)
 * ───────────────────────────────────────────────────────────────────────────
 * El 50 % del uso del catálogo está en 22 apps y el 80 % en 114; hay 410 apps con dos
 * usos o menos en toda su vida. Recorrer las 985 en orden dedicaría el grueso del
 * esfuerzo al 20 % del uso. Con 114 apps se cubre el 80 % de lo que la gente toca.
 */

import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { abrir, SQL_INVALIDADA } from './db.mjs';
import { FAMILIAS, familiaDe, slugsHuerfanos } from './familias.mjs';
import { RUTA_BASE as RUTA_CABOS, codigo } from '../cabos/cabos.mjs';

const args = process.argv.slice(2);
const RESUMEN = args.includes('--resumen');
const CUANTAS = Number(args.find(a => /^\d+$/.test(a))) || 10;
// --json: solo el total que saldrá de verdad y sus familias, para `inspector-tarea.mjs lanzar`,
// que avisa cuando una familia desborda el cupo pedido (13/10/2026: cupo bajado de 10 a 5)
const JSON_SALIDA = args.includes('--json');
const log = JSON_SALIDA ? () => {} : console.log;

const db = abrir();

/**
 * slug → códigos de sus cabos abiertos de destino `inspector`. Solo lectura: la base de cabos
 * se abre aparte y no se crea si no existe (una máquina sin `_private/` sigue teniendo cola).
 */
function cabosPorApp() {
  const ruta = process.env.CABOS_DB || RUTA_CABOS;
  const mapa = new Map();
  if (!fs.existsSync(ruta)) return mapa;
  const cabos = new DatabaseSync(ruta, { readOnly: true });
  try {
    const slugs = new Set(db.prepare('SELECT slug FROM apps').all().map((a) => a.slug));
    const filas = cabos.prepare("SELECT id, sujeto FROM cabos WHERE estado = 'abierto' AND destino = 'inspector' ORDER BY id").all();
    for (const c of filas) {
      const sujeto = c.sujeto.trim();
      const fam = sujeto.startsWith('familia:') ? FAMILIAS.find((f) => f.id === sujeto.slice('familia:'.length).trim()) : null;
      const nombra = fam ? fam.slugs : slugs.has(sujeto) ? [sujeto] : sujeto.split(/[^a-z0-9-]+/).filter((t) => slugs.has(t));
      for (const s of new Set(nombra)) {
        if (!mapa.has(s)) mapa.set(s, []);
        mapa.get(s).push(codigo(c.id));
      }
    }
  } finally {
    cabos.close();
  }
  return mapa;
}

const CABOS = cabosPorApp();
// Los slugs son [a-z0-9-] (los da la propia base): se pueden escribir en el SQL sin escapar
const SQL_CABO = `slug IN (${[...CABOS.keys()].filter((s) => /^[a-z0-9-]+$/.test(s)).map((s) => `'${s}'`).join(', ') || "''"})`;

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

const COLAS = [
  {
    clave: 'ROJO',
    titulo: 'Test en rojo — se ha roto algo que ya estaba verificado',
    sql: `SELECT *, ${PRIORIDAD} AS p FROM apps WHERE test_estado = 'rojo' ORDER BY p DESC`,
  },
  {
    clave: 'FIRMA',
    titulo: 'Firma de rotura — la gente entra, no lo consigue y recarga (apareció tras la inspección)',
    sql: `SELECT *, ${PRIORIDAD} AS p FROM apps
          WHERE ${SQL_FIRMA_NUEVA} AND COALESCE(test_estado, '') <> 'rojo' AND NOT (${SQL_INVALIDADA})
          ORDER BY p DESC`,
  },
  {
    clave: 'INVALIDADA',
    titulo: 'Invalidada o con cabo — su código o sus datos han cambiado desde la inspección, o una sesión dejó una sospecha sobre ella',
    // Las de cabo que ya salen arriba (rojo o firma) no se repiten aquí
    sql: `SELECT *, ${PRIORIDAD} AS p FROM apps
          WHERE (${SQL_INVALIDADA})
             OR (${SQL_CABO} AND COALESCE(test_estado, '') <> 'rojo' AND NOT (${SQL_FIRMA_NUEVA}))
          ORDER BY p DESC`,
  },
  {
    clave: 'NUEVA',
    titulo: 'Nunca inspeccionada — por uso real y riesgo',
    sql: `SELECT *, ${PRIORIDAD} AS p FROM apps WHERE ultima_inspeccion IS NULL AND NOT (${SQL_CABO}) ORDER BY p DESC`,
  },
];

if (RESUMEN) {
  const t = db.prepare('SELECT COUNT(*) n FROM apps').get().n;
  const vistas = db.prepare('SELECT COUNT(*) n FROM apps WHERE ultima_inspeccion IS NOT NULL').get().n;
  const conTest = db.prepare('SELECT COUNT(*) n FROM apps WHERE test_path IS NOT NULL').get().n;
  const abiertos = db.prepare("SELECT COUNT(*) n FROM hallazgos WHERE estado = 'abierto'").get().n;
  log(`\nEstado del Inspector`);
  log(`  catálogo:        ${t} apps`);
  log(`  inspeccionadas:  ${vistas} (${(100 * vistas / t).toFixed(1)} %)`);
  log(`  con test propio: ${conTest}`);
  log(`  hallazgos abiertos: ${abiertos}`);
  for (const c of COLAS) {
    const n = db.prepare(c.sql.replace('SELECT *,', 'SELECT COUNT(*) AS n,').replace(/ORDER BY p DESC/, '')).get()?.n ?? 0;
    if (c.clave !== 'INVALIDADA') {
      log(`  cola ${c.clave.padEnd(11)} ${n}`);
      continue;
    }
    // El tramo 3 mezcla dos poblaciones: que la cifra de INVALIDADAS siga diciendo solo eso
    const inv = db.prepare(`SELECT COUNT(*) AS n FROM apps WHERE ${SQL_INVALIDADA}`).get().n;
    log(`  cola ${c.clave.padEnd(11)} ${inv}${n > inv ? `  (+ ${n - inv} que entran por un cabo)` : ''}`);
  }
  // Cobertura del uso: la cifra que de verdad dice cuánto se ha protegido
  const total = db.prepare('SELECT SUM(usos) s FROM apps').get().s || 1;
  const cubierto = db.prepare('SELECT SUM(usos) s FROM apps WHERE ultima_inspeccion IS NOT NULL').get().s || 0;
  const nCabos = [...CABOS.values()].reduce((s, l) => s + l.length, 0);
  log(`  con cabo del Inspector: ${CABOS.size} apps (${nCabos} cabos; compiten en el tramo 3 por su prioridad)`);
  log(`\n  uso del catálogo ya inspeccionado: ${(100 * cubierto / total).toFixed(1)} %`);
  log(`  (es la cifra que importa, no el % de apps: el 80 % del uso está en 114 apps)`);

  const huerf = slugsHuerfanos(db);
  log(`\n  familias declaradas: ${FAMILIAS.length} (salen JUNTAS de la cola)`);
  for (const f of FAMILIAS) {
    const pend = f.slugs.filter((s) => {
      const r = db.prepare(
        `SELECT 1 x FROM apps WHERE slug = ? AND (test_estado = 'rojo' OR ${SQL_INVALIDADA} OR ultima_inspeccion IS NULL OR ${SQL_CABO})`,
      ).get(s);
      return !!r;
    }).length;
    log(`    ${f.id.padEnd(14)} ${f.slugs.length} apps · ${pend} pendientes · ${f.testigo}`);
  }
  if (huerf.length) {
    log(`  ⚠ ${huerf.length} slug(s) declarados que ya no existen — corrige familias.mjs:`);
    for (const h of huerf) log(`      ${h.familia} → ${h.slug}`);
  }
  process.exit(0);
}

/** Una línea de app, con su prioridad, uso y avisos. */
function linea(f, sangria = '  ') {
  const deps = JSON.parse(f.deps || '[]');
  return (
    `${sangria}${String(Math.round(f.p)).padStart(3)}  ${f.slug.padEnd(44)} ` +
    `${f.segmento.padEnd(11)} riesgo ${f.riesgo}  ${String(f.usos).padStart(5)} usos` +
    (deps.length ? `  [${deps.length} dep]` : '') +
    (CABOS.has(f.slug) ? `  · cabo ${CABOS.get(f.slug).join(', ')}` : '') +
    (f.firma ? `\n${sangria}     ⚠ firma de rotura (${f.firma}): ${f.firma_detalle}` : '')
  );
}

/** En qué cola está un slug ahora mismo, o null si está al día. */
const SQL_ESTADO = db.prepare(`
  SELECT slug, ${PRIORIDAD} AS p, segmento, riesgo, usos, duracion_media, deps, ultima_inspeccion,
         firma, firma_detalle,
         CASE WHEN test_estado = 'rojo' THEN 'ROJO'
              WHEN ${SQL_FIRMA_NUEVA} AND NOT (${SQL_INVALIDADA}) THEN 'FIRMA'
              WHEN ${SQL_INVALIDADA} THEN 'INVALIDADA'
              WHEN ultima_inspeccion IS NULL THEN 'NUEVA'
              WHEN ${SQL_CABO} THEN 'CABO'
              ELSE 'al día' END AS estado
  FROM apps WHERE slug = ?`);

const huerfanos = slugsHuerfanos(db);
if (huerfanos.length) {
  log('\n⚠ Familias con slugs que ya no existen en el catálogo (corrige familias.mjs):');
  for (const h of huerfanos) log(`    ${h.familia} → ${h.slug}`);
}

let quedan = CUANTAS;
let mostradas = 0;
const familiasYaSacadas = new Set();
const familiasSacadas = [];

for (const c of COLAS) {
  if (quedan <= 0) break;
  const todas = db.prepare(c.sql).all();
  const elegidas = [];

  for (const f of todas) {
    if (quedan <= 0) break;
    const fam = familiaDe(f.slug);

    if (!fam) {
      elegidas.push({ tipo: 'app', fila: f });
      quedan -= 1;
      continue;
    }
    if (familiasYaSacadas.has(fam.id)) continue;   // ya salió entera más arriba

    // La familia sale ENTERA: las que están pendientes cuentan contra el cupo; las que
    // están al día se listan como contexto, porque el testigo las mide igualmente.
    const miembros = fam.slugs.map((s) => SQL_ESTADO.get(s)).filter(Boolean);
    elegidas.push({ tipo: 'familia', familia: fam, miembros });
    familiasYaSacadas.add(fam.id);
    quedan -= miembros.filter((m) => m.estado !== 'al día').length;
  }

  if (!elegidas.length) continue;
  log(`\n${c.titulo}`);

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
    for (const m of e.miembros) {
      log(linea(m, '      ') + `  · ${m.estado}`);
    }
    mostradas += pendientes;
    familiasSacadas.push({ nombre: e.familia.nombre, pendientes, miembros: e.miembros.length });
  }
}

if (JSON_SALIDA) {
  console.log(JSON.stringify({ pedidas: CUANTAS, apps: mostradas, familias: familiasSacadas }));
  process.exit(0);
}

if (!mostradas) log('\nNada en cola: todo el catálogo está inspeccionado y sin cambios desde entonces.');
else log(`\n${mostradas} apps · npm run inspector:cola -- --resumen para el estado global`);
