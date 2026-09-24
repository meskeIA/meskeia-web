#!/usr/bin/env node
/**
 * inspector:firma — la huella que deja en Analytics una app que la gente NO consigue usar
 *
 * Ejecutar:  npm run inspector:firma                        (todo el catálogo, dump más reciente)
 *            npm run inspector:firma -- lupa-digital quiz-tabla-periodica
 *            npm run inspector:firma -- --hasta 2026-07-20 lupa-digital
 *
 * Lo usa `inspector:sync` para marcar las apps sospechosas en la base del Inspector; la cola
 * las ordena antes y, si ya estaban inspeccionadas, las devuelve a la cola FIRMA.
 *
 * QUÉ MIDE
 * ────────
 * Una visita corta sola no dice nada: consultar un dato en quince segundos es un éxito. Lo
 * que delata una app rota es la visita corta SEGUIDA DE OTRA CARGA de la misma app, en la
 * misma sesión, en menos de diez minutos: la persona no ha conseguido lo que venía a buscar
 * y lo reintenta. Dos señales, las dos contra el catálogo del mismo periodo:
 *
 *   NIVEL   — 30 días: % de visitas cortas ≥ catálogo + 8 puntos
 *             Y % de reintentos tras visita corta ≥ 1,6 × catálogo. Mínimo 60 visitas.
 *   CAMBIO  — los últimos 14 días frente a los 42 anteriores: el % de visitas cortas sube
 *             10 puntos o más con z ≥ 3. Mínimo 30 visitas recientes y 60 de base.
 *
 * «Visita corta» = menos de 30 s O sin duración registrada. Sumar las dos cosas es a
 * propósito: el arreglo del emisor del 16/09/2026 pasó visitas de «sin registro» a «2-30 s»
 * y dejó la suma casi quieta, así que esta señal no sufre ese corte de instrumentación.
 *
 * DE DÓNDE SALE (24/09/2026)
 * ──────────────────────────
 * `Permissions-Policy: camera=()` tuvo rotas cinco meses `lupa-digital` y las demás apps de
 * cámara, y el fallo INFLABA su uso: la gente recargaba creyendo que había fallado el
 * permiso. Medido sobre el dump, la lupa rota tenía 76 % de visitas cortas y 14,6 % de
 * reintentos por sesión, frente al 67 % y 8,2 % del catálogo; reparada, 55 % y 4-7 %.
 * Calibración, en doce cortes semanales del 06/07 al 21/09/2026:
 *   - La lupa sale en las dos ventanas en que estaba rota (06/07 y 20/07) y en ninguna
 *     posterior al arreglo del 21/07. En la del 13/07 se queda a 7,4 puntos, bajo el umbral.
 *   - El nivel marca entre 0 y 5 apps por semana; el cambio, 0 o 1.
 * ⚠️ La parte de CAMBIO no tiene caso real con fecha dentro de los datos (en febrero, cuando
 *    se rompió la cámara, esas apps tenían 2-3 visitas al mes). Está probada con casos
 *    sintéticos en `probar-firma.mjs`, no con una rotura observada.
 *
 * POR SESIÓN Y NO POR HUELLA
 * ──────────────────────────
 * La primera versión identificaba a la persona por IP + navegador + resolución, y las aulas
 * la engañaban: veinte ordenadores idénticos detrás de la IP del colegio son veinte alumnos,
 * no uno recargando (`simulador-movimiento-circular` pasaba del 8 % al 58 % de «reintentos»
 * en una semana de clase). `sesion_id` vive en `sessionStorage`: sobrevive a una recarga en
 * la misma pestaña y es distinto para cada alumno.
 *
 * LO QUE NO PUEDE VER
 * ───────────────────
 * Solo los fallos que la persona NOTA. Un resultado falso con buena cara —el ×1.000 que tuvo
 * `simulador-circuitos-electricos`— no deja firma: se lleva la cifra y se va contenta. Eso es
 * trabajo del Inspector. Y la firma tampoco distingue una app rota de una que no es lo que la
 * persona buscaba: es un indicio para mirar antes, nunca una prueba.
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const UMBRALES = {
  DIAS_NIVEL: 30,
  MIN_VISITAS: 60,
  EXCESO_CORTAS: 8,        // puntos sobre el catálogo
  FACTOR_REINTENTO: 1.6,   // veces el catálogo
  DIAS_RECIENTE: 14,
  DIAS_BASE: 42,
  MIN_RECIENTE: 30,
  SUBIDA_CORTAS: 10,       // puntos sobre su propia base
  Z_MIN: 3,
  SEGUNDOS_CORTA: 30,
  MINUTOS_REINTENTO: 10,
};

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DIR_DUMPS = path.join(RAIZ, '_backups', 'turso');

/** El dump más reciente de `_backups/turso`, o null si no hay ninguno. */
export function dumpMasReciente(dir = DIR_DUMPS) {
  if (!fs.existsSync(dir)) return null;
  const dumps = fs.readdirSync(dir).filter(f => /^turso-dump-\d{4}-\d{2}-\d{2}\.sql$/.test(f)).sort();
  return dumps.length ? path.join(dir, dumps[dumps.length - 1]) : null;
}

/**
 * Carga en memoria SOLO las dos tablas que hacen falta. El dump pesa ~50 MB y trae decenas de
 * tablas de rollup; cargarlo entero cuesta el doble y no aporta nada aquí.
 */
export function cargarDump(ruta) {
  const txt = fs.readFileSync(ruta, 'utf8');
  const db = new DatabaseSync(':memory:');
  const cargarScript = db.exec.bind(db); // node:sqlite, no child_process
  for (const tabla of ['uso_aplicaciones', 'analytics_config']) {
    const ini = txt.indexOf(`-- Tabla: ${tabla}\n`);
    if (ini < 0) throw new Error(`El dump ${path.basename(ruta)} no tiene la tabla ${tabla}`);
    // Hasta la siguiente cabecera, sea de tabla o no: tras la última tabla viene el bloque de
    // «Índices, vistas y disparadores» de TODAS, que aquí fallaría por las tablas no cargadas
    const fin = txt.indexOf('\n-- ', ini + 10);
    cargarScript(txt.slice(ini, fin < 0 ? undefined : fin));
  }
  return db;
}

/**
 * Filtro humano, el mismo que el digest diario: sin bots, sin la IP propia, sin los agentes
 * que renderizan para llevarse el texto, y sin las pseudo-apps (`mcp:`, `pag:`, `meskeIA`).
 */
function filtroHumano(db) {
  const tieneConfig = db.prepare(`SELECT 1 x FROM sqlite_master WHERE name = 'analytics_config'`).get();
  const ip = tieneConfig ? db.prepare(`SELECT valor v FROM analytics_config WHERE clave = 'ip_excluida'`).get()?.v : null;
  const ipSegura = ip ? String(ip).replace(/'/g, "''") : null;
  return `modo <> 'bot' AND COALESCE(es_propio, 0) = 0
    AND COALESCE(navegador, '') NOT LIKE '%NotebookLM%'
    ${ipSegura ? `AND (ip_address IS NULL OR ip_address <> '${ipSegura}')` : ''}
    AND aplicacion NOT LIKE 'mcp:%' AND aplicacion NOT LIKE 'pag:%' AND aplicacion <> 'meskeIA'`;
}

const CORTA = `(duracion_segundos IS NULL OR duracion_segundos < ${UMBRALES.SEGUNDOS_CORTA})`;

/** z de la diferencia entre dos proporciones (x1/n1 frente a x2/n2). */
function zProporciones(x1, n1, x2, n2) {
  const p = (x1 + x2) / (n1 + n2);
  const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
  return se ? (x1 / n1 - x2 / n2) / se : 0;
}

const pct = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });
const p = x => `${pct.format(x)} %`;

/**
 * Calcula la firma de cada app del conjunto `slugs` (el catálogo: las portadas y los portales
 * quedan fuera, porque en una página de paso lo normal es entrar y salir). El catálogo de
 * referencia se calcula sobre ese mismo conjunto.
 *
 * `hasta` es el último día COMPLETO que entra (por defecto, el anterior al último registro:
 * el dump se congela a las 05:30 y su último día va a medias).
 */
export function calcularFirma(db, { slugs, hasta } = {}) {
  const U = UMBRALES;
  const HUM = filtroHumano(db);
  if (!hasta) {
    hasta = db.prepare(`SELECT date(MAX(created_at), '-1 day') d FROM uso_aplicaciones`).get().d;
  }
  db.prepare('CREATE INDEX IF NOT EXISTS ix_firma ON uso_aplicaciones(sesion_id, aplicacion, created_at)').run();
  const dentro = slugs ? new Set(slugs) : null;

  // ── Nivel: 30 días, visitas cortas y reintentos tras visita corta ──
  const nivel = db.prepare(`
    WITH v AS (
      SELECT id, aplicacion, created_at, sesion_id, duracion_segundos
      FROM uso_aplicaciones
      WHERE ${HUM}
        AND created_at >= date(:hasta, '-${U.DIAS_NIVEL - 1} days')
        AND created_at < date(:hasta, '+1 day')
    )
    SELECT aplicacion AS slug, COUNT(*) AS n,
      SUM(${CORTA}) AS cortas,
      SUM(sesion_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM v w
        WHERE w.sesion_id = v.sesion_id AND w.aplicacion = v.aplicacion AND w.id < v.id
          AND w.created_at >= datetime(v.created_at, '-${U.MINUTOS_REINTENTO} minutes')
          AND (w.duracion_segundos IS NULL OR w.duracion_segundos < ${U.SEGUNDOS_CORTA})
      )) AS reintentos
    FROM v GROUP BY aplicacion`).all({ hasta }).filter(f => !dentro || dentro.has(f.slug));

  // ── Cambio: últimos 14 días frente a los 42 anteriores ──
  const cambio = new Map(db.prepare(`
    SELECT aplicacion AS slug,
      SUM(created_at >= date(:hasta, '-${U.DIAS_RECIENTE - 1} days')) AS nR,
      SUM(created_at <  date(:hasta, '-${U.DIAS_RECIENTE - 1} days')) AS nB,
      SUM(created_at >= date(:hasta, '-${U.DIAS_RECIENTE - 1} days') AND ${CORTA}) AS cR,
      SUM(created_at <  date(:hasta, '-${U.DIAS_RECIENTE - 1} days') AND ${CORTA}) AS cB
    FROM uso_aplicaciones
    WHERE ${HUM}
      AND created_at >= date(:hasta, '-${U.DIAS_RECIENTE + U.DIAS_BASE - 1} days')
      AND created_at < date(:hasta, '+1 day')
    GROUP BY aplicacion`).all({ hasta }).map(f => [f.slug, f]));

  const total = nivel.reduce((a, f) => ({ n: a.n + f.n, c: a.c + f.cortas, r: a.r + f.reintentos }), { n: 0, c: 0, r: 0 });
  const catalogo = {
    visitas: total.n,
    cortas: total.n ? 100 * total.c / total.n : 0,
    reintentos: total.n ? 100 * total.r / total.n : 0,
  };

  const apps = new Map();
  for (const f of nivel) {
    const cortas = 100 * f.cortas / f.n;
    const reintentos = 100 * f.reintentos / f.n;
    const esNivel = f.n >= U.MIN_VISITAS
      && cortas >= catalogo.cortas + U.EXCESO_CORTAS
      && reintentos >= U.FACTOR_REINTENTO * catalogo.reintentos;

    let esCambio = null;
    const c = cambio.get(f.slug);
    if (c && c.nR >= U.MIN_RECIENTE && c.nB >= U.MIN_VISITAS) {
      const antes = 100 * c.cB / c.nB, ahora = 100 * c.cR / c.nR;
      const z = zProporciones(c.cR, c.nR, c.cB, c.nB);
      if (ahora - antes >= U.SUBIDA_CORTAS && z >= U.Z_MIN) esCambio = { antes, ahora, z };
    }

    const partes = [];
    if (esNivel) partes.push(`${p(cortas)} cortas (catálogo ${p(catalogo.cortas)}) y ${p(reintentos)} reintentos (catálogo ${p(catalogo.reintentos)}) en ${f.n} visitas`);
    if (esCambio) partes.push(`cortas ${p(esCambio.antes)} → ${p(esCambio.ahora)} en ${U.DIAS_RECIENTE} días (z ${pct.format(esCambio.z)})`);

    apps.set(f.slug, {
      slug: f.slug, visitas: f.n, cortas, reintentos,
      nivel: esNivel, cambio: esCambio,
      firma: esNivel && esCambio ? 'nivel+cambio' : esNivel ? 'nivel' : esCambio ? 'cambio' : null,
      detalle: partes.length ? partes.join(' · ') : null,
    });
  }
  return { hasta, catalogo, apps };
}

// ─── Ejecución directa ────────────────────────────────────────────────────────

const esPrincipal = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (esPrincipal) {
  const args = process.argv.slice(2);
  const valor = n => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
  const hasta = valor('hasta');
  const rutaDump = valor('dump') || dumpMasReciente();
  const pedidas = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
  if (!rutaDump) { console.error(`No hay dumps en ${DIR_DUMPS}`); process.exit(1); }

  // El catálogo sale de la base del Inspector, que ya excluye portadas y portales
  const { abrir } = await import('./db.mjs');
  const catalogo = abrir().prepare('SELECT slug FROM apps').all().map(r => r.slug);
  if (!catalogo.length) { console.error('La base del Inspector está vacía: npm run inspector:sync'); process.exit(1); }

  const r = calcularFirma(cargarDump(rutaDump), { slugs: catalogo, hasta });
  console.log(`\nFirma de rotura · ${path.basename(rutaDump)} · 30 días hasta el ${r.hasta.split('-').reverse().join('/')}`);
  console.log(`  catálogo: ${r.catalogo.visitas.toLocaleString('es-ES', { useGrouping: 'always' })} visitas · ${p(r.catalogo.cortas)} cortas · ${p(r.catalogo.reintentos)} reintentos tras visita corta`);
  console.log(`  umbral de nivel: ≥ ${p(r.catalogo.cortas + UMBRALES.EXCESO_CORTAS)} cortas y ≥ ${p(UMBRALES.FACTOR_REINTENTO * r.catalogo.reintentos)} reintentos, con ≥ ${UMBRALES.MIN_VISITAS} visitas\n`);

  if (pedidas.length) {
    for (const s of pedidas) {
      const a = r.apps.get(s);
      if (!a) { console.log(`  ${s.padEnd(44)} sin visitas en la ventana (o no está en el catálogo)`); continue; }
      console.log(`  ${s.padEnd(44)} ${String(a.visitas).padStart(5)} visitas · ${p(a.cortas).padStart(7)} cortas · ${p(a.reintentos).padStart(7)} reintentos  ${a.firma ? `⚠ ${a.firma}` : '· sin firma'}`);
      if (a.detalle) console.log(`  ${''.padEnd(44)} ${a.detalle}`);
    }
  } else {
    const marcadas = [...r.apps.values()].filter(a => a.firma).sort((a, b) => b.reintentos - a.reintentos);
    if (!marcadas.length) console.log('  Ninguna app con firma de rotura.');
    for (const a of marcadas) console.log(`  ⚠ ${a.slug.padEnd(42)} ${a.firma.padEnd(13)} ${a.detalle}`);
  }
}
