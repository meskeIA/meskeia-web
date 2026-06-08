/**
 * Configuración de conexión a Turso (SQLite en la nube)
 * Base de datos: meskeia-analytics
 * Región: EU West (Irlanda) - Cumple RGPD
 */

import { createClient } from '@libsql/client';

// Cliente singleton para reutilizar conexión
let tursoClient: ReturnType<typeof createClient> | null = null;

/**
 * Obtiene el cliente de Turso (singleton)
 * En producción usa las variables de entorno de Vercel
 */
export function getTursoClient() {
  if (tursoClient) {
    return tursoClient;
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error(
      'Faltan variables de entorno TURSO_DATABASE_URL o TURSO_AUTH_TOKEN'
    );
  }

  tursoClient = createClient({
    url,
    authToken,
  });

  return tursoClient;
}

// Promesa de inicialización cacheada: garantiza que los CREATE TABLE/INDEX
// se ejecutan UNA sola vez por instancia de función serverless (cold start),
// no en cada llamada a un procedure. Antes costaba ~863ms por cada query.
let initPromise: Promise<boolean> | null = null;

/**
 * Inicializa la base de datos creando las tablas necesarias.
 * Idempotente y cacheado: solo hace el trabajo real la primera vez.
 */
export function initializeDatabase(): Promise<boolean> {
  if (!initPromise) {
    initPromise = doInitializeDatabase().catch((err) => {
      // Si falla, permitir reintento en la siguiente llamada
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

/**
 * Trabajo real de inicialización (CREATE TABLE / INDEX).
 * No llamar directamente — usar initializeDatabase().
 */
async function doInitializeDatabase(): Promise<boolean> {
  const client = getTursoClient();

  // Crear tabla de uso de aplicaciones (compatible con esquema anterior)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS uso_aplicaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aplicacion TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      navegador TEXT,
      sistema_operativo TEXT,
      resolucion TEXT,
      tipo_dispositivo TEXT,
      es_recurrente INTEGER DEFAULT 0,
      duracion_segundos INTEGER,
      ip_address TEXT,
      pais TEXT,
      ciudad TEXT,
      modo TEXT,
      sesion_id TEXT,
      datos_adicionales TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // Crear índices para mejorar rendimiento
  await client.execute(
    'CREATE INDEX IF NOT EXISTS idx_aplicacion ON uso_aplicaciones(aplicacion)'
  );
  await client.execute(
    'CREATE INDEX IF NOT EXISTS idx_timestamp ON uso_aplicaciones(timestamp)'
  );
  await client.execute(
    'CREATE INDEX IF NOT EXISTS idx_created_at ON uso_aplicaciones(created_at)'
  );
  await client.execute(
    'CREATE INDEX IF NOT EXISTS idx_ip_address ON uso_aplicaciones(ip_address)'
  );

  // Tabla de configuración (para IP excluida, etc.)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS analytics_config (
      clave TEXT PRIMARY KEY,
      valor TEXT,
      actualizado TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // Tabla de violaciones CSP (Content-Security-Policy)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS csp_violations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pagina TEXT,
      bloqueado TEXT,
      directiva TEXT,
      archivo TEXT,
      linea INTEGER,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);
  await client.execute(
    'CREATE INDEX IF NOT EXISTS idx_csp_created_at ON csp_violations(created_at)'
  );
  await client.execute(
    'CREATE INDEX IF NOT EXISTS idx_csp_directiva ON csp_violations(directiva)'
  );

  // Migración: añadir columna es_propio para marcar visitas del propietario
  // Permite filtrar historial aunque la IP dinámica haya cambiado
  try {
    await client.execute(
      `ALTER TABLE uso_aplicaciones ADD COLUMN es_propio INTEGER DEFAULT 0`
    );
  } catch {
    // Columna ya existe — ignorar
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Tablas de AGREGADOS (rollup) — pre-calculan métricas por día CERRADO.
  // Motivo: los GROUP BY/AVG sobre la tabla cruda cuestan 3-5 s cada uno
  // (cold start hasta 23 s → roza el timeout de Vercel). El dashboard lee estos
  // agregados (cientos de filas) en lugar de escanear los registros crudos.
  // El día en curso NO se pre-agrega: se consulta en vivo (pocas filas) y se
  // combina, para que "hoy" siga en tiempo real.
  //
  // Dimensión `es_miip` (0 = resto, 1 = IP del propietario): permite reconstruir
  // tanto "excluir mi IP" (es_miip=0) como "incluir todo" (suma de ambos) con
  // paridad exacta frente al getStats actual.
  // Clave de fecha: `fecha_ord` = YYYYMMDD (mismo reordenamiento que el router).
  // ─────────────────────────────────────────────────────────────────────────

  // Métricas globales del día
  await client.execute(`
    CREATE TABLE IF NOT EXISTS rollup_dia (
      fecha_ord TEXT NOT NULL,
      es_miip INTEGER NOT NULL DEFAULT 0,
      usos INTEGER NOT NULL DEFAULT 0,
      movil INTEGER NOT NULL DEFAULT 0,
      escritorio INTEGER NOT NULL DEFAULT 0,
      recurrentes INTEGER NOT NULL DEFAULT 0,
      nuevos INTEGER NOT NULL DEFAULT 0,
      suma_dur REAL NOT NULL DEFAULT 0,
      count_dur INTEGER NOT NULL DEFAULT 0,
      por_compartir INTEGER NOT NULL DEFAULT 0,
      b_sinreg INTEGER NOT NULL DEFAULT 0,
      b_rebote INTEGER NOT NULL DEFAULT 0,
      b_corta INTEGER NOT NULL DEFAULT 0,
      b_media INTEGER NOT NULL DEFAULT 0,
      b_larga INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (fecha_ord, es_miip)
    )
  `);
  // Migración idempotente: columnas de buckets de duración (BD de producción ya existente)
  for (const col of ['b_sinreg', 'b_rebote', 'b_corta', 'b_media', 'b_larga']) {
    try { await client.execute(`ALTER TABLE rollup_dia ADD COLUMN ${col} INTEGER NOT NULL DEFAULT 0`); } catch { /* ya existe */ }
  }

  // Conteo por origen (web / claude.ai / … / mcp / bot / mi-ip) — para getResumen.
  // El origen 'mi-ip' YA representa la porción propia → no necesita es_miip.
  await client.execute(`
    CREATE TABLE IF NOT EXISTS rollup_dia_origen (
      fecha_ord TEXT NOT NULL,
      origen TEXT NOT NULL,
      usos INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (fecha_ord, origen)
    )
  `);

  // Conteo por aplicación (ranking) — duración con cap 7200 s como el router
  await client.execute(`
    CREATE TABLE IF NOT EXISTS rollup_dia_app (
      fecha_ord TEXT NOT NULL,
      es_miip INTEGER NOT NULL DEFAULT 0,
      aplicacion TEXT NOT NULL,
      usos INTEGER NOT NULL DEFAULT 0,
      suma_dur_cap REAL NOT NULL DEFAULT 0,
      count_dur_cap INTEGER NOT NULL DEFAULT 0,
      max_dur INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (fecha_ord, es_miip, aplicacion)
    )
  `);
  try { await client.execute(`ALTER TABLE rollup_dia_app ADD COLUMN max_dur INTEGER NOT NULL DEFAULT 0`); } catch { /* ya existe */ }

  // Conteo por país (ISO normalizado) y por ciudad
  await client.execute(`
    CREATE TABLE IF NOT EXISTS rollup_dia_pais (
      fecha_ord TEXT NOT NULL,
      es_miip INTEGER NOT NULL DEFAULT 0,
      pais TEXT NOT NULL,
      usos INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (fecha_ord, es_miip, pais)
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS rollup_dia_ciudad (
      fecha_ord TEXT NOT NULL,
      es_miip INTEGER NOT NULL DEFAULT 0,
      ciudad TEXT NOT NULL,
      usos INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (fecha_ord, es_miip, ciudad)
    )
  `);

  // Control: qué días cerrados ya están computados (idempotencia + detección de huecos)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS rollup_control (
      fecha_ord TEXT PRIMARY KEY,
      computado_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // ── Tablas ACUMULADAS (all-time) — derivadas de las diarias en el cron/backfill ──
  // Motivo: el ranking/geografía de getStats son all-time. Re-agregar las tablas
  // diarias (~miles de filas) en cada carga sería lento. Estas tablas tienen una
  // fila por (entidad, es_miip) → pocas filas → lectura instantánea. Se recalculan
  // en background (no en la ruta de lectura del dashboard).
  await client.execute(`
    CREATE TABLE IF NOT EXISTS rollup_app_acum (
      aplicacion TEXT NOT NULL,
      es_miip INTEGER NOT NULL DEFAULT 0,
      usos INTEGER NOT NULL DEFAULT 0,
      suma_dur_cap REAL NOT NULL DEFAULT 0,
      count_dur_cap INTEGER NOT NULL DEFAULT 0,
      ultimo_ord TEXT,
      max_dur INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (aplicacion, es_miip)
    )
  `);
  try { await client.execute(`ALTER TABLE rollup_app_acum ADD COLUMN max_dur INTEGER NOT NULL DEFAULT 0`); } catch { /* ya existe */ }
  await client.execute(`
    CREATE TABLE IF NOT EXISTS rollup_pais_acum (
      pais TEXT NOT NULL,
      es_miip INTEGER NOT NULL DEFAULT 0,
      usos INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (pais, es_miip)
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS rollup_ciudad_acum (
      ciudad TEXT NOT NULL,
      es_miip INTEGER NOT NULL DEFAULT 0,
      usos INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (ciudad, es_miip)
    )
  `);

  return true;
}

/**
 * Formatea segundos en formato legible (Xm Ys)
 */
export function formatearDuracion(segundos: number | null): string {
  if (segundos === null || segundos === 0) {
    return '0s';
  }

  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;

  if (minutos > 0) {
    return `${minutos}m ${segs}s`;
  }

  return `${segs}s`;
}
