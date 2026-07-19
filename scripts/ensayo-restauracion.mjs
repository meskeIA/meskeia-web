#!/usr/bin/env node
/**
 * Ensayo de restauración de Turso — meskeIA
 * ---------------------------------------------------------------------------
 * Cadencia: SEMESTRAL (Agenda Operativa → restauracion-turso-semestral)
 * Runbook:  _private/RUNBOOK-RESTAURACION-TURSO.md
 *
 * Qué problema resuelve
 * ---------------------
 * El Verificador de Backups (diario) comprueba que el dump CARGA, y compara
 * sus cifras contra su propio histórico. Eso valida el fichero, no la vuelta
 * atrás: nunca contrasta con producción ni ejecuta las consultas de la app.
 *
 * Este ensayo valida el PROCEDIMIENTO completo:
 *   1. Selección del dump         — cuál se usaría y qué antigüedad tiene
 *   2. Restauración cronometrada  — a una base SQLite en disco, no en memoria
 *   3. Integridad y esquema       — integrity_check, claves ajenas, índices
 *   4. Contraste con producción   — deriva de esquema y recuentos reales
 *   5. Prueba funcional           — las consultas del dashboard sobre la copia
 *
 * Uso:
 *   npm run ensayo:restauracion                       ensayo completo
 *   npm run ensayo:restauracion -- --sin-produccion   sin tocar Turso (offline)
 *   npm run ensayo:restauracion -- --conservar        no borra la base restaurada
 *
 * Solo lectura sobre producción. Nunca escribe en Turso.
 * Códigos de salida: 0 = ensayo superado (con o sin avisos) · 1 = ensayo fallido
 * ---------------------------------------------------------------------------
 */

import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@libsql/client';
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, '..');
const DIR_DUMPS = join(RAIZ, '_backups', 'turso');
const DIR_ENSAYOS = join(RAIZ, '_backups', 'ensayos');
const PREFIJO_DUMP = 'turso-dump-';

const SIN_PRODUCCION = process.argv.includes('--sin-produccion');
const CONSERVAR = process.argv.includes('--conservar');

/**
 * Tablas cuyo recuento puede BAJAR en producción sin que sea un problema
 * (se purgan periódicamente). En el resto, prod < dump es señal de pérdida.
 */
const TABLAS_VOLATILES = ['csp_violations'];

/**
 * Consultas reales del dashboard de analytics. Si alguna falla sobre la copia
 * restaurada, la restauración sería inservible aunque las filas cuadren.
 * Mantener alineadas con server/routers/analytics.ts al cambiar el esquema.
 */
const CONSULTAS_APLICACION = [
  { nombre: 'Total de usos registrados', sql: 'SELECT COUNT(*) AS total FROM uso_aplicaciones' },
  // Ordenar por «timestamp» daría un rango falso: es TEXT en formato español
  // (DD/MM/YYYY) y MIN/MAX lo comparan alfabéticamente. created_at es ISO.
  { nombre: 'Ventana temporal de los datos', sql: 'SELECT MIN(created_at) AS primero, MAX(created_at) AS ultimo FROM uso_aplicaciones' },
  { nombre: 'Último día consolidado (rollup)', sql: 'SELECT MAX(fecha_ord) AS m FROM rollup_control' },
  { nombre: 'Ranking de apps acumulado', sql: 'SELECT aplicacion, SUM(usos) AS usos FROM rollup_app_acum GROUP BY aplicacion ORDER BY usos DESC LIMIT 5' },
  { nombre: 'Serie diaria de usos', sql: 'SELECT fecha_ord, SUM(usos) AS usos FROM rollup_dia GROUP BY fecha_ord ORDER BY fecha_ord DESC LIMIT 7' },
  { nombre: 'Apps por día (rollup_dia_app)', sql: 'SELECT aplicacion, SUM(usos) AS usos FROM rollup_dia_app GROUP BY aplicacion ORDER BY usos DESC LIMIT 5' },
  { nombre: 'Orígenes de tráfico', sql: 'SELECT origen, SUM(usos) AS total FROM rollup_dia_origen GROUP BY origen ORDER BY total DESC LIMIT 5' },
  { nombre: 'Distribución por país', sql: 'SELECT pais, SUM(usos) AS usos FROM rollup_pais_acum GROUP BY pais ORDER BY usos DESC LIMIT 5' },
  { nombre: 'Distribución por ciudad', sql: 'SELECT ciudad, SUM(usos) AS usos FROM rollup_ciudad_acum GROUP BY ciudad ORDER BY usos DESC LIMIT 5' },
];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const color = {
  rojo: (t) => `\x1b[31m${t}\x1b[0m`,
  amarillo: (t) => `\x1b[33m${t}\x1b[0m`,
  verde: (t) => `\x1b[32m${t}\x1b[0m`,
  azul: (t) => `\x1b[36m${t}\x1b[0m`,
  gris: (t) => `\x1b[90m${t}\x1b[0m`,
  negrita: (t) => `\x1b[1m${t}\x1b[0m`,
};

const num = (n) => Number(n).toLocaleString('es-ES');
const mb = (bytes) => `${(bytes / 1024 / 1024).toLocaleString('es-ES', { maximumFractionDigits: 1 })} MB`;

/** Hallazgos acumulados del ensayo. */
const hallazgos = [];
function anotar(nivel, texto, detalle) {
  hallazgos.push({ nivel, texto, detalle });
  const marca =
    nivel === 'error' ? color.rojo('  ✖') : nivel === 'aviso' ? color.amarillo('  ⚠') : color.verde('  ✓');
  console.log(`${marca} ${texto}${detalle ? color.gris(`\n      ${detalle}`) : ''}`);
}

function titulo(n, texto) {
  console.log(`\n${color.azul(color.negrita(`FASE ${n} — ${texto}`))}`);
}

/** Lee una clave de .env.local sin dependencias externas. */
function leerEnv(clave) {
  const contenido = readFileSync(join(RAIZ, '.env.local'), 'utf8');
  for (const linea of contenido.split(/\r?\n/)) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith('#')) continue;
    const idx = limpia.indexOf('=');
    if (idx === -1) continue;
    if (limpia.slice(0, idx).trim() === clave) {
      return limpia.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// FASE 1 — Selección del dump
// ---------------------------------------------------------------------------

function seleccionarDump() {
  titulo(1, 'Selección del dump');

  if (!existsSync(DIR_DUMPS)) {
    anotar('error', 'No existe la carpeta de dumps', DIR_DUMPS);
    return null;
  }

  const dumps = readdirSync(DIR_DUMPS)
    .filter((f) => f.startsWith(PREFIJO_DUMP) && f.endsWith('.sql'))
    .sort();

  if (dumps.length === 0) {
    anotar('error', 'No hay ningún dump disponible', 'comprobar la tarea programada «Backup Turso meskeIA»');
    return null;
  }

  const archivo = dumps[dumps.length - 1];
  const ruta = join(DIR_DUMPS, archivo);
  const info = statSync(ruta);
  const horas = (Date.now() - info.mtimeMs) / 3_600_000;

  anotar('ok', `Dump seleccionado: ${archivo}`, `${mb(info.size)} · ${dumps.length} copias disponibles`);

  if (horas > 48) {
    anotar('error', `El dump tiene ${Math.round(horas)} horas de antigüedad`, 'la cadena de backup diaria está rota');
  } else if (horas > 26) {
    anotar('aviso', `El dump tiene ${Math.round(horas)} horas`, 'se esperaría uno de menos de 26 h');
  } else {
    anotar('ok', `Antigüedad del dump: ${horas < 1 ? 'menos de 1 hora' : `${Math.round(horas)} horas`}`);
  }

  return { archivo, ruta, tamBytes: info.size, horas };
}

// ---------------------------------------------------------------------------
// FASE 2 — Restauración cronometrada
// ---------------------------------------------------------------------------

function restaurar(dump) {
  titulo(2, 'Restauración cronometrada en disco');

  mkdirSync(DIR_ENSAYOS, { recursive: true });
  const destino = join(DIR_ENSAYOS, 'ensayo-restaurado.db');
  if (existsSync(destino)) rmSync(destino, { force: true });

  const sql = readFileSync(dump.ruta, 'utf8');
  const inicio = Date.now();
  let db;

  try {
    db = new DatabaseSync(destino);
    // Carga del script SQL completo (multi-sentencia) vía referencia al método,
    // igual que el Verificador de Backups.
    const cargarSql = db.exec.bind(db);
    cargarSql(sql);
  } catch (error) {
    anotar('error', 'El dump NO restaura', error instanceof Error ? error.message : String(error));
    try { db?.close(); } catch { /* ignorar */ }
    return null;
  }

  const ms = Date.now() - inicio;
  const tamRestaurado = statSync(destino).size;

  anotar('ok', `Restauración completada en ${num(ms)} ms`, `base resultante: ${mb(tamRestaurado)} en ${destino}`);
  if (ms > 120_000) {
    anotar('aviso', 'La restauración supera los 2 minutos', 'tenerlo en cuenta al estimar el tiempo de recuperación');
  }

  return { db, destino, ms, tamRestaurado };
}

// ---------------------------------------------------------------------------
// FASE 3 — Integridad y esquema
// ---------------------------------------------------------------------------

function verificarIntegridad(db) {
  titulo(3, 'Integridad y esquema de la copia');

  const integridad = db.prepare('PRAGMA integrity_check').all();
  const resultado = integridad[0]?.integrity_check ?? 'desconocido';
  if (resultado === 'ok') {
    anotar('ok', 'PRAGMA integrity_check: sin corrupción');
  } else {
    anotar('error', 'PRAGMA integrity_check ha detectado problemas', JSON.stringify(integridad).slice(0, 300));
  }

  const clavesAjenas = db.prepare('PRAGMA foreign_key_check').all();
  if (clavesAjenas.length === 0) {
    anotar('ok', 'Claves ajenas coherentes');
  } else {
    anotar('aviso', `${clavesAjenas.length} violación(es) de clave ajena`, 'revisar si el esquema declara claves ajenas reales');
  }

  const tablas = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()
    .map((f) => f.name);
  const indices = db
    .prepare("SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()
    .map((f) => f.name);

  const filasPorTabla = {};
  let total = 0;
  for (const tabla of tablas) {
    const n = db.prepare(`SELECT COUNT(*) AS n FROM "${tabla.replace(/"/g, '""')}"`).get().n;
    filasPorTabla[tabla] = n;
    total += n;
  }

  anotar('ok', `${tablas.length} tablas · ${num(indices.length)} índices · ${num(total)} filas`, tablas.join(', '));

  return { tablas, filasPorTabla, total, indices };
}

// ---------------------------------------------------------------------------
// FASE 4 — Contraste con producción
// ---------------------------------------------------------------------------

async function contrastarConProduccion(copia) {
  titulo(4, 'Contraste con producción (solo lectura)');

  if (SIN_PRODUCCION) {
    anotar('nota', 'Omitido por --sin-produccion', 'el ensayo no valida la deriva de esquema');
    return null;
  }

  const url = leerEnv('TURSO_DATABASE_URL');
  const authToken = leerEnv('TURSO_AUTH_TOKEN');
  if (!url || !authToken) {
    anotar('aviso', 'Faltan credenciales de Turso en .env.local', 'no se puede contrastar con producción');
    return null;
  }

  const cliente = createClient({ url, authToken });
  let tablasProd;

  try {
    const res = await cliente.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );
    tablasProd = res.rows.map((f) => String(f.name));
  } catch (error) {
    anotar('error', 'No se pudo consultar producción', error instanceof Error ? error.message : String(error));
    cliente.close();
    return null;
  }

  // Deriva de esquema: el fallo silencioso más grave del backup
  const faltanEnDump = tablasProd.filter((t) => !copia.tablas.includes(t));
  const sobranEnDump = copia.tablas.filter((t) => !tablasProd.includes(t));

  if (faltanEnDump.length > 0) {
    anotar('error', `${faltanEnDump.length} tabla(s) existen en producción y NO están en el dump`, faltanEnDump.join(', '));
  } else {
    anotar('ok', `Esquema alineado: las ${tablasProd.length} tablas de producción están en la copia`);
  }
  if (sobranEnDump.length > 0) {
    anotar('nota', `${sobranEnDump.length} tabla(s) en la copia ya no existen en producción`, sobranEnDump.join(', '));
  }

  // Índices: su ausencia no rompe la aplicación, pero deja la base restaurada
  // recorriendo tablas enteras. Es un fallo silencioso del backup.
  try {
    const res = await cliente.execute(
      "SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );
    const indicesProd = res.rows.map((f) => String(f.name));
    const faltanIndices = indicesProd.filter((i) => !copia.indices.includes(i));

    if (faltanIndices.length > 0) {
      anotar(
        'error',
        `Faltan ${faltanIndices.length} de los ${indicesProd.length} índices de producción`,
        `${faltanIndices.join(', ')}\n      → la base restaurada funcionaría, pero con escaneos completos de tabla`
      );
    } else if (indicesProd.length > 0) {
      anotar('ok', `Los ${indicesProd.length} índices de producción están en la copia`);
    }
  } catch {
    anotar('aviso', 'No se pudieron consultar los índices de producción');
  }

  // Recuentos: producción crece continuamente, así que prod >= dump es lo normal
  const comparacion = [];
  for (const tabla of tablasProd) {
    if (!copia.tablas.includes(tabla)) continue;
    let filasProd;
    try {
      const res = await cliente.execute(`SELECT COUNT(*) AS n FROM "${tabla.replace(/"/g, '""')}"`);
      filasProd = Number(res.rows[0].n);
    } catch {
      continue;
    }
    const filasCopia = copia.filasPorTabla[tabla];
    const delta = filasProd - filasCopia;
    comparacion.push({ tabla, filasProd, filasCopia, delta });

    if (delta < 0 && !TABLAS_VOLATILES.includes(tabla)) {
      const caidaPct = Math.abs(delta) / Math.max(filasCopia, 1) * 100;
      anotar(
        caidaPct > 5 ? 'error' : 'aviso',
        `«${tabla}»: producción tiene ${num(Math.abs(delta))} filas MENOS que la copia`,
        `posible pérdida de datos en producción (${caidaPct.toFixed(1)} % por debajo del dump)`
      );
    }
  }

  const conCrecimiento = comparacion.filter((c) => c.delta > 0).length;
  anotar(
    'ok',
    `Recuentos contrastados en ${comparacion.length} tablas`,
    `${conCrecimiento} con crecimiento normal desde el dump · detalle en el informe`
  );

  cliente.close();
  return comparacion;
}

// ---------------------------------------------------------------------------
// FASE 5 — Prueba funcional
// ---------------------------------------------------------------------------

function probarConsultasAplicacion(db) {
  titulo(5, 'Prueba funcional: consultas del dashboard sobre la copia');

  let fallos = 0;
  let vacias = 0;

  for (const { nombre, sql } of CONSULTAS_APLICACION) {
    try {
      const filas = db.prepare(sql).all();
      const primera = filas[0] ?? {};
      const valores = Object.values(primera);
      const sinDatos = filas.length === 0 || valores.every((v) => v === null);
      if (sinDatos) {
        vacias++;
        anotar('aviso', `${nombre}: la consulta funciona pero no devuelve datos`, sql.slice(0, 80));
      } else {
        const muestra = filas.length === 1
          ? Object.entries(primera).map(([k, v]) => `${k}=${typeof v === 'number' ? num(v) : v}`).join(' · ')
          : `${filas.length} filas · primera: ${JSON.stringify(primera).slice(0, 90)}`;
        anotar('ok', nombre, muestra);
      }
    } catch (error) {
      fallos++;
      anotar('error', `${nombre}: la consulta FALLA sobre la copia`, error instanceof Error ? error.message : String(error));
    }
  }

  if (fallos === 0 && vacias === 0) {
    anotar('ok', 'La aplicación funcionaría contra esta copia restaurada');
  }
  return { fallos, vacias };
}

// ---------------------------------------------------------------------------
// FASE 6 — Informe
// ---------------------------------------------------------------------------

function emitirInforme(datos) {
  titulo(6, 'Informe y registro');

  mkdirSync(DIR_ENSAYOS, { recursive: true });
  const ahora = new Date();
  const errores = hallazgos.filter((h) => h.nivel === 'error').length;
  const avisos = hallazgos.filter((h) => h.nivel === 'aviso').length;
  const estado = errores > 0 ? 'error' : avisos > 0 ? 'aviso' : 'ok';

  const registro = {
    fecha: ahora.toISOString(),
    estado,
    errores,
    avisos,
    dump: datos.dump?.archivo ?? null,
    dumpHoras: datos.dump ? Math.round(datos.dump.horas * 10) / 10 : null,
    msRestauracion: datos.restauracion?.ms ?? null,
    tablas: datos.copia?.tablas.length ?? null,
    totalFilas: datos.copia?.total ?? null,
    indices: datos.copia?.indices.length ?? null,
    consultasFallidas: datos.funcional?.fallos ?? null,
    comparacion: datos.comparacion ?? null,
  };

  const rutaHistorial = join(DIR_ENSAYOS, 'historial.jsonl');
  appendFileSync(rutaHistorial, `${JSON.stringify(registro)}\n`, 'utf8');

  const rutaUltimo = join(DIR_ENSAYOS, 'ultimo-ensayo.json');
  writeFileSync(rutaUltimo, JSON.stringify({ ...registro, hallazgos }, null, 2), 'utf8');

  anotar('ok', 'Informe guardado', `${rutaUltimo}\n      histórico acumulado: ${rutaHistorial}`);

  // Comparativa con el ensayo anterior: detecta degradación del tiempo de restauración
  try {
    const lineas = readFileSync(rutaHistorial, 'utf8').trim().split('\n').filter(Boolean);
    if (lineas.length > 1) {
      const previo = JSON.parse(lineas[lineas.length - 2]);
      if (previo.msRestauracion && registro.msRestauracion) {
        const variacion = ((registro.msRestauracion - previo.msRestauracion) / previo.msRestauracion) * 100;
        const signo = variacion >= 0 ? '+' : '';
        anotar(
          Math.abs(variacion) > 100 ? 'aviso' : 'ok',
          `Tiempo de restauración frente al ensayo anterior: ${signo}${variacion.toFixed(0)} %`,
          `anterior ${num(previo.msRestauracion)} ms (${previo.fecha.slice(0, 10)}) → actual ${num(registro.msRestauracion)} ms`
        );
      }
    }
  } catch { /* el histórico es informativo: nunca bloquea */ }

  return estado;
}

// ---------------------------------------------------------------------------
// Programa principal
// ---------------------------------------------------------------------------

console.log(color.negrita('\n═══ ENSAYO DE RESTAURACIÓN DE TURSO ═══'));
console.log(color.gris(`  ${new Date().toLocaleString('es-ES')}${SIN_PRODUCCION ? ' · modo sin producción' : ''}`));

const dump = seleccionarDump();
let restauracion = null;
let copia = null;
let comparacion = null;
let funcional = null;

if (dump) {
  restauracion = restaurar(dump);
  if (restauracion) {
    copia = verificarIntegridad(restauracion.db);
    comparacion = await contrastarConProduccion(copia);
    funcional = probarConsultasAplicacion(restauracion.db);
    restauracion.db.close();
  }
}

const estado = emitirInforme({ dump, restauracion, copia, comparacion, funcional });

// Limpieza: la copia restaurada ocupa espacio y no debe quedarse por olvido
if (restauracion && !CONSERVAR) {
  rmSync(restauracion.destino, { force: true });
  console.log(color.gris('\n  Copia restaurada eliminada (usa --conservar para inspeccionarla).'));
} else if (restauracion) {
  console.log(color.gris(`\n  Copia conservada en ${restauracion.destino}`));
}

const resumen = {
  ok: color.verde(color.negrita('  ENSAYO SUPERADO — el procedimiento de restauración funciona')),
  aviso: color.amarillo(color.negrita('  ENSAYO SUPERADO CON AVISOS — revisar los puntos marcados')),
  error: color.rojo(color.negrita('  ENSAYO FALLIDO — la vuelta atrás NO está garantizada')),
}[estado];

console.log(`\n${'─'.repeat(70)}`);
console.log(resumen);
console.log(color.gris('  Al terminar: actualizar «ultimaVez» en la Agenda Operativa del Centro de Mando'));
console.log(`${'─'.repeat(70)}\n`);

process.exit(estado === 'error' ? 1 : 0);
