/**
 * La base del Inspector — qué app se ha verificado, cuándo y con qué resultado
 *
 * Vive en `_private/inspector/inspector.db` (fuera de git, ya cubierto por el Backup
 * Crítico). Usa `node:sqlite`, incluido en Node desde la v22: sin dependencias nuevas.
 *
 * POR QUÉ UNA BASE Y NO UN JSON
 * ─────────────────────────────
 * Lo que se le pregunta no es "dame el estado", sino cosas como *¿qué toca hoy, ordenado
 * por uso real y riesgo, descontando lo ya visto y lo que no ha cambiado desde entonces?*
 * Eso es una consulta. Con 1.172 apps, varias vueltas y un histórico de hallazgos, un
 * fichero plano obliga a reimplementar a mano lo que SQL ya hace.
 *
 * QUÉ ES ANDAMIAJE Y QUÉ ES PRODUCTO
 * ──────────────────────────────────
 * Esta base es andamiaje: se reconstruye entera con `npm run inspector:sync`, salvo el
 * histórico de inspecciones y hallazgos, que es lo único irrecuperable — de ahí que
 * importe que esté dentro del backup.
 * El PRODUCTO del Inspector son los tests que deja en `tests/apps/`, y ésos SÍ se
 * versionan: son lo que impide que un fallo ya corregido vuelva a colarse.
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DIR_BASE = path.join(RAIZ, '_private', 'inspector');
export const RUTA_BASE = path.join(DIR_BASE, 'inspector.db');

const TABLAS = [
  `CREATE TABLE IF NOT EXISTS apps (
    slug                TEXT PRIMARY KEY,
    nombre              TEXT,
    url                 TEXT,
    suites              TEXT,           -- JSON
    segmento            TEXT,           -- fiscal | motor | calculo | interactiva | contenido
    riesgo              INTEGER,        -- 1 critico · 2 alto · 3 medio · 4 informativo
    usos                INTEGER DEFAULT 0,
    duracion_media      REAL    DEFAULT 0,
    hash_codigo         TEXT,           -- huella de page/layout/metadata/css de la app
    deps                TEXT,           -- JSON: modulos de data/fiscal y lib/calculadoras
    hash_deps           TEXT,           -- huella de esos modulos
    creada              TEXT,           -- alta en el repositorio (git)
    ultima_inspeccion   TEXT,
    hash_inspeccionado  TEXT,           -- hash_codigo|hash_deps en el momento de inspeccionar
    veredicto           TEXT,           -- ok | con_hallazgos | no_inspeccionable
    test_path           TEXT,
    test_estado         TEXT            -- verde | rojo | nulo si aun no tiene test
  )`,
  `CREATE TABLE IF NOT EXISTS inspecciones (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    slug      TEXT NOT NULL,
    fecha     TEXT NOT NULL,
    modelo    TEXT,
    veredicto TEXT,
    resumen   TEXT,
    test_path TEXT,
    segundos  INTEGER
  )`,
  // `caso` no es opcional por diseño: un hallazgo sin caso reproducible es una opinion
  // de un modelo, no un defecto. Es la regla que hace verificable todo lo que sale de aqui.
  `CREATE TABLE IF NOT EXISTS hallazgos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    inspeccion_id INTEGER,
    slug          TEXT NOT NULL,
    tipo          TEXT,     -- calculo | dato | operativa | accesibilidad | contenido
    severidad     TEXT,     -- critico | alto | medio | bajo
    descripcion   TEXT,
    caso          TEXT NOT NULL,
    estado        TEXT DEFAULT 'abierto',   -- abierto | arreglado | descartado
    fecha         TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_insp_slug ON inspecciones(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_hall_slug ON hallazgos(slug, estado)`,
];

export function abrir() {
  fs.mkdirSync(DIR_BASE, { recursive: true });
  const db = new DatabaseSync(RUTA_BASE);
  for (const t of TABLAS) db.prepare(t).run();
  return db;
}

/**
 * Una app está INVALIDADA si se inspeccionó pero su código o sus datos han cambiado
 * desde entonces. Es el criterio que sustituye a "revisar cada X meses": una app que
 * nadie ha tocado no se estropea sola; lo que la estropea es un cambio.
 */
export const SQL_INVALIDADA = `
  ultima_inspeccion IS NOT NULL
  AND hash_inspeccionado IS NOT NULL
  AND hash_inspeccionado <> (hash_codigo || '|' || COALESCE(hash_deps, ''))
`;
