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
 * que delata una app rota es la RECARGA: una visita corta seguida de otra carga de la misma
 * app, en la misma sesión, en menos de diez minutos y SIN haber pasado por otra app entre
 * medias. La persona no ha conseguido lo que venía a buscar y lo reintenta. Dos señales, las
 * dos contra el catálogo del mismo periodo:
 *
 *   NIVEL   — 30 días: % de visitas cortas ≥ catálogo + 8 puntos
 *             Y % de recargas ≥ 2 × catálogo. Mínimo 60 visitas.
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
 * permiso. Medido sobre el dump, la lupa rota tenía 76 % de visitas cortas y 14-15 % de
 * recargas, frente al 67 % y 4-5 % del catálogo; reparada, 55 % y 3-6 %.
 * Calibración, en doce cortes semanales del 06/07 al 21/09/2026:
 *   - La lupa sale en las dos ventanas en que estaba rota (06/07 y 20/07) y en ninguna
 *     posterior al arreglo del 21/07. En la del 13/07 se queda a 1,3 puntos del umbral de
 *     cortas.
 *   - El nivel marca 0 o 1 apps por semana; el cambio, 0 o 1.
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
 * SIN OTRA APP EN MEDIO
 * ─────────────────────
 * La segunda versión, el mismo 24/09, contaba cualquier vuelta a la app en diez minutos, y
 * marcó cinco apps. Al abrir los casos, entre el 80 % y el 100 % de sus «reintentos» tenían
 * otra app visitada en medio: la persona iba a otra herramienta (o a la portada) y volvía con
 * «atrás», que es navegación sana, no un fallo. En la lupa sana es al revés: 36 de 54 son
 * recargas puras. Con la condición de no haber pasado por otra app, las cinco dejan de salir
 * y la lupa rota sigue saliendo, con más margen (3 × el catálogo en vez de 1,8 ×).
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
  FACTOR_REINTENTO: 2,     // veces el catálogo
  DIAS_RECIENTE: 14,
  DIAS_BASE: 42,
  MIN_RECIENTE: 30,
  SUBIDA_CORTAS: 10,       // puntos sobre su propia base
  Z_MIN: 3,
  SEGUNDOS_CORTA: 30,
  MINUTOS_REINTENTO: 10,
};

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
// `TURSO_DUMPS`: la copia del Inspector (tarea de Windows) no tiene `_backups/`, que no se
// versiona, y lee los dumps de meskeia-web.
export const DIR_DUMPS = process.env.TURSO_DUMPS || path.join(RAIZ, '_backups', 'turso');

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
 * Filtro de persona: sin bots, sin la IP propia y sin los agentes que renderizan para llevarse
 * el texto. Deja dentro las pseudo-apps, porque para saber si alguien pasó por OTRA página entre
 * dos cargas cuentan también Términos, Privacidad o Contacto (`pag:*`).
 */
function filtroPersona(db) {
  const tieneConfig = db.prepare(`SELECT 1 x FROM sqlite_master WHERE name = 'analytics_config'`).get();
  const ip = tieneConfig ? db.prepare(`SELECT valor v FROM analytics_config WHERE clave = 'ip_excluida'`).get()?.v : null;
  const ipSegura = ip ? String(ip).replace(/'/g, "''") : null;
  return `modo <> 'bot' AND COALESCE(es_propio, 0) = 0
    AND COALESCE(navegador, '') NOT LIKE '%NotebookLM%'
    ${ipSegura ? `AND (ip_address IS NULL OR ip_address <> '${ipSegura}')` : ''}`;
}

/**
 * Filtro humano, el mismo que el digest diario: el de persona y sin las pseudo-apps (`mcp:`,
 * `pag:`, `meskeIA`), que no son apps del catálogo.
 */
function filtroHumano(db) {
  return `${filtroPersona(db)}
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
 * el dump se congela de madrugada (Rutina Matinal, 05:50) y su último día va a medias).
 */
export function calcularFirma(db, { slugs, hasta } = {}) {
  const U = UMBRALES;
  const HUM = filtroHumano(db);
  const PERSONA = filtroPersona(db);
  if (!hasta) {
    hasta = db.prepare(`SELECT date(MAX(created_at), '-1 day') d FROM uso_aplicaciones`).get().d;
  }
  db.prepare('CREATE INDEX IF NOT EXISTS ix_firma ON uso_aplicaciones(sesion_id, aplicacion, created_at)').run();
  db.prepare('CREATE INDEX IF NOT EXISTS ix_firma_ip ON uso_aplicaciones(ip_address, created_at)').run();
  const tieneHost = db.prepare(`SELECT 1 x FROM pragma_table_info('uso_aplicaciones') WHERE name = 'host'`).get();
  const dentro = slugs ? new Set(slugs) : null;

  /**
   * SIN OTRA PÁGINA EN MEDIO, AUNQUE SEA DE OTRO DOMINIO (cabo C0155, 16/10/2026)
   * En simulador-potencial-accion, 4 de sus 14 «recargas» eran idas y vueltas que el detector no
   * veía: a Términos, Privacidad o Contacto (`pag:*`, que el filtro humano quita, así que tampoco
   * contaban como «otra app en medio») o a stemum.com desde DescubreVertical, que es otro origen y
   * por eso otro `sesion_id`. Sin ellas, 10/219 = 4,6 %, bajo el umbral. Ahora la página de en
   * medio se busca en `nav` (con las `pag:*`) y, para el salto de dominio, por la misma IP,
   * navegador y resolución en OTRO `host`. Esto último no puede inventar recargas, solo
   * descontarlas: en un aula con veinte equipos iguales, la visita de un compañero a otro
   * dominio puede tapar una recarga de verdad, que es el lado seguro.
   */
  const otroDominio = tieneHost ? `
          OR EXISTS (
            SELECT 1 FROM nav y
            WHERE y.ip_address = v.ip_address AND y.navegador IS v.navegador AND y.resolucion IS v.resolucion
              AND y.created_at >= w.created_at AND y.created_at <= v.created_at
              AND y.sesion_id IS NOT v.sesion_id
              AND COALESCE(y.host, '') <> COALESCE(v.host, '')
          )` : '';

  // ── Nivel: 30 días, visitas cortas y recargas tras visita corta ──
  const nivel = db.prepare(`
    WITH nav AS (
      SELECT id, aplicacion, created_at, sesion_id, ip_address, navegador, resolucion${tieneHost ? ', host' : ''}
      FROM uso_aplicaciones
      WHERE ${PERSONA}
        AND created_at >= date(:hasta, '-${U.DIAS_NIVEL} days')
        AND created_at < date(:hasta, '+1 day')
    ),
    v AS (
      SELECT id, aplicacion, created_at, sesion_id, duracion_segundos, ip_address, navegador, resolucion${tieneHost ? ', host' : ''}
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
          -- Sin otra página entre las dos cargas: ir a otra herramienta (o a Términos, o a otro
          -- dominio) y volver es navegación
          AND NOT (
            EXISTS (
              SELECT 1 FROM nav x
              WHERE x.sesion_id = v.sesion_id AND x.id > w.id AND x.id < v.id AND x.aplicacion <> v.aplicacion
            )${otroDominio}
          )
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
    if (esNivel) partes.push(`${p(cortas)} cortas (catálogo ${p(catalogo.cortas)}) y ${p(reintentos)} recargas (catálogo ${p(catalogo.reintentos)}) en ${f.n} visitas`);
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
  console.log(`  catálogo: ${r.catalogo.visitas.toLocaleString('es-ES', { useGrouping: 'always' })} visitas · ${p(r.catalogo.cortas)} cortas · ${p(r.catalogo.reintentos)} recargas tras visita corta`);
  console.log(`  umbral de nivel: ≥ ${p(r.catalogo.cortas + UMBRALES.EXCESO_CORTAS)} cortas y ≥ ${p(UMBRALES.FACTOR_REINTENTO * r.catalogo.reintentos)} recargas, con ≥ ${UMBRALES.MIN_VISITAS} visitas\n`);

  if (pedidas.length) {
    for (const s of pedidas) {
      const a = r.apps.get(s);
      if (!a) { console.log(`  ${s.padEnd(44)} sin visitas en la ventana (o no está en el catálogo)`); continue; }
      console.log(`  ${s.padEnd(44)} ${String(a.visitas).padStart(5)} visitas · ${p(a.cortas).padStart(7)} cortas · ${p(a.reintentos).padStart(7)} recargas  ${a.firma ? `⚠ ${a.firma}` : '· sin firma'}`);
      if (a.detalle) console.log(`  ${''.padEnd(44)} ${a.detalle}`);
    }
  } else {
    const marcadas = [...r.apps.values()].filter(a => a.firma).sort((a, b) => b.reintentos - a.reintentos);
    if (!marcadas.length) console.log('  Ninguna app con firma de rotura.');
    for (const a of marcadas) console.log(`  ⚠ ${a.slug.padEnd(42)} ${a.firma.padEnd(13)} ${a.detalle}`);
  }
}
