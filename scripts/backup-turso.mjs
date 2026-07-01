/**
 * backup-turso.mjs
 * ------------------------------------------------------------------
 * Vuelca TODA la base de datos Turso (analytics de meskeIA) a un
 * fichero .sql con fecha, dentro de _backups/turso/.
 *
 * Es el único dato de producción NO reproducible desde GitHub, así que
 * conviene ejecutarlo antes del backup semanal al disco externo. Como el
 * fichero cae dentro de meskeia-web, el .bat de backup ya se lo lleva a D:.
 *
 * Uso:   node scripts/backup-turso.mjs
 *
 * Requisitos: TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en .env.local
 *             (ya presentes; se usa el cliente @libsql/client del proyecto).
 * ------------------------------------------------------------------
 */

import { createClient } from '@libsql/client';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, '..');
const DIR_DESTINO = join(RAIZ, '_backups', 'turso');
const MAX_DUMPS = 14; // conservar las últimas 14 copias (cadencia diaria ≈ 2 semanas)

// --- Leer credenciales desde .env.local (sin dependencias externas) ---
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

// --- Escapar valores para SQL ---
function escaparValor(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number' || typeof v === 'bigint') return String(v);
  if (v instanceof ArrayBuffer || ArrayBuffer.isView(v)) {
    const hex = Buffer.from(v).toString('hex');
    return `X'${hex}'`;
  }
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function main() {
  const url = leerEnv('TURSO_DATABASE_URL');
  const authToken = leerEnv('TURSO_AUTH_TOKEN');

  if (!url) {
    console.error('❌ No se encontró TURSO_DATABASE_URL en .env.local');
    process.exit(1);
  }

  const cliente = createClient({ url, authToken });
  mkdirSync(DIR_DESTINO, { recursive: true });

  // Fecha YYYY-MM-DD para el nombre del fichero
  const hoy = new Date().toISOString().slice(0, 10);
  const ficheroSalida = join(DIR_DESTINO, `turso-dump-${hoy}.sql`);

  const partes = [];
  partes.push(`-- Backup Turso meskeIA — ${new Date().toISOString()}`);
  partes.push('PRAGMA foreign_keys=OFF;');
  partes.push('BEGIN TRANSACTION;');

  // Listar tablas de usuario (excluir internas de SQLite)
  const tablas = await cliente.execute(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream%' ORDER BY name"
  );

  let totalFilas = 0;
  for (const tabla of tablas.rows) {
    const nombre = tabla.name;
    partes.push(`\n-- Tabla: ${nombre}`);
    partes.push(`DROP TABLE IF EXISTS "${nombre}";`);
    partes.push(`${tabla.sql};`);

    const datos = await cliente.execute(`SELECT * FROM "${nombre}"`);
    for (const fila of datos.rows) {
      const cols = datos.columns.map((c) => `"${c}"`).join(', ');
      const vals = datos.columns.map((c) => escaparValor(fila[c])).join(', ');
      partes.push(`INSERT INTO "${nombre}" (${cols}) VALUES (${vals});`);
    }
    totalFilas += datos.rows.length;
    console.log(`  · ${nombre}: ${datos.rows.length} filas`);
  }

  partes.push('COMMIT;');
  partes.push('PRAGMA foreign_keys=ON;');

  writeFileSync(ficheroSalida, partes.join('\n'), 'utf8');
  console.log(`\n✅ Dump completado: ${ficheroSalida}`);
  console.log(`   ${tablas.rows.length} tablas · ${totalFilas} filas`);

  // Rotación: conservar solo los últimos MAX_DUMPS
  const dumps = readdirSync(DIR_DESTINO)
    .filter((f) => f.startsWith('turso-dump-') && f.endsWith('.sql'))
    .sort();
  if (dumps.length > MAX_DUMPS) {
    for (const viejo of dumps.slice(0, dumps.length - MAX_DUMPS)) {
      unlinkSync(join(DIR_DESTINO, viejo));
      console.log(`   🗑️  Eliminado dump antiguo: ${viejo}`);
    }
  }
}

main().catch((err) => {
  console.error('❌ Error durante el backup de Turso:', err.message);
  process.exit(1);
});
