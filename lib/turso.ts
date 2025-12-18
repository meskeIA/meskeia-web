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

/**
 * Inicializa la base de datos creando las tablas necesarias
 * Se ejecuta automáticamente en el primer request
 */
export async function initializeDatabase() {
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
