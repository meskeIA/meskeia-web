/**
 * parsers-catalogo.mjs — los parsers por regex de los catálogos de `data/`, en UN solo sitio
 *
 * Varios scripts leen `data/*.ts` como TEXTO, sin importarlos (la mayoría corre fuera de Next y
 * con el dump de Turso). Si cambia el formato del fichero, el regex deja de hacer match y el
 * consumidor se queda con cero items, o con unos pocos menos, sin dar ningún error. Pasó el
 * 28/07/2026: el refactor de verticales dejó mudos a TRES consumidores a la vez y se descubrió
 * por casualidad (scripts/CLAUDE.md).
 *
 * Cada función recibe el TEXTO del fichero y devuelve lo que extrae: no lee disco, para que el
 * candado `npm run check:consumidores` pueda pasarle el mismo texto y comparar el resultado con
 * el catálogo IMPORTADO de verdad. Por eso los consumidores no deben llevar su propia copia del
 * regex: el candado solo vigila el que está aquí.
 *
 * Consumidores: cuadrante-stem · cuadrante-catalogo · semilla-diaria · detectar-duplicados ·
 * generate-apps-demandadas. Fuera, a propósito: `generador-posts-x/servidor.js` (otro repositorio,
 * herramienta de uso esporádico; sus parsers avisan solos por consola), `covisita-crosscheck` y
 * `faq-progress`.
 */

/** Trozo de `export const NOMBRE` hasta el cierre `\n];` del array. Vacío si no existe. */
export function bloqueExport(txt, nombre) {
  const desde = txt.indexOf(`export const ${nombre}`);
  if (desde === -1) return '';
  const hasta = txt.indexOf('\n];', desde);
  return txt.slice(desde, hasta === -1 ? txt.length : hasta);
}

/**
 * Claves `slug:` declaradas en un bloque. Se cuenta la clave a secas y no su valor: exigiendo el
 * valor, un cambio de formato bajaría a la vez este contador y el del parser.
 */
export function contarClavesSlug(bloque) {
  return (bloque.match(/^\s*slug:/gm) ?? []).length;
}

const desescapar = (s) => s.replace(/\\(.)/g, '$1');

// ── Stemum ─────────────────────────────────────────────────────────────────

const REGEX_ENTRADA_STEMUM = new RegExp(
  "\\{\\s*slug:\\s*'([^']+)',\\s*icon:\\s*'([^']*)',\\s*titulo:\\s*'((?:[^'\\\\]|\\\\.)*)'," +
    "\\s*desc:\\s*'((?:[^'\\\\]|\\\\.)*)',\\s*disciplina:\\s*'([^']*)',\\s*\\}",
  'g',
);

/** `STEMUM_APPS` → Map slug → disciplina. Sin el material de apoyo, que no cuenta en disciplina. */
export function stemumDisciplinas(txt) {
  const bloque = bloqueExport(txt, 'STEMUM_APPS');
  return new Map([...bloque.matchAll(REGEX_ENTRADA_STEMUM)].map((m) => [m[1], m[5]]));
}

const slugsDelArray = (txt, nombre) =>
  [...bloqueExport(txt, nombre).matchAll(/^\s*slug:\s*'([a-z0-9-]+)'/gm)].map((m) => m[1]);

/** Universo de Stemum: `STEMUM_APPS` + `STEMUM_MATERIAL_APOYO`. */
export function slugsStemum(txt) {
  return [...slugsDelArray(txt, 'STEMUM_APPS'), ...slugsDelArray(txt, 'STEMUM_MATERIAL_APOYO')];
}

// ── Coquinum y Delegum ─────────────────────────────────────────────────────

/** Universo de Coquinum: `COQUINUM_APPS`. */
export function slugsCoquinum(txt) {
  return slugsDelArray(txt, 'COQUINUM_APPS');
}

/** Universo de Delegum: las `url: '/slug/'` de las puertas de `data/delegum/soluciones.ts`. */
export function slugsDelegum(txt) {
  return [...txt.matchAll(/url:\s*'\/([a-z0-9-]+)\/'/g)].map((m) => m[1]);
}

// ── Catálogo de meskeIA ────────────────────────────────────────────────────

/** `implementedAppsUrls` → slugs, sin barras. */
export function slugsImplementadas(txt) {
  return [...txt.matchAll(/^\s*"\/([^"]*?)\/?"\s*,/gm)].map((m) => m[1]).filter(Boolean);
}

/** Literales de URL en `implemented-apps.ts`, contados aparte para detectar un parseo menguado. */
export function contarUrlsImplementadas(txt) {
  return (txt.match(/^\s*"\//gm) ?? []).length;
}

/**
 * `applicationsDatabase` → [{ name, url, slug, description, keywords, suites }].
 *
 * Objetos planos, sin llaves anidadas. `name` admite las dos comillas y en este orden: el
 * catálogo lo escribe con dobles salvo un puñado de entradas con simples, y pedir solo dobles NO
 * daba error, caía al fallback `|| url` (S0154, 20/09/2026). Dos `match` y no un backreference,
 * porque hay nombres con apóstrofe DENTRO de comillas dobles («Baker's Percentage»).
 */
export function parsearApplications(txt) {
  const bloques = txt.match(/\{[^{}]*url:\s*"[^"]*"[^{}]*\}/g) || [];
  const apps = [];
  for (const b of bloques) {
    const url = b.match(/url:\s*"([^"]+)"/)?.[1];
    if (!url) continue;
    const name = (b.match(/name:\s*"([^"]+)"/) || b.match(/name:\s*'([^']+)'/))?.[1] || url;
    const description = desescapar(b.match(/description:\s*"((?:[^"\\]|\\.)*)"/)?.[1] || '');
    const kwRaw = b.match(/keywords:\s*\[([^\]]*)\]/)?.[1] || '';
    const keywords = [...kwRaw.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    const suitesRaw = b.match(/suites:\s*\[([^\]]*)\]/)?.[1] || '';
    const suites = [...suitesRaw.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    apps.push({ name, url, slug: url.replace(/^\/|\/$/g, ''), description, keywords, suites });
  }
  return apps;
}

/** `guidesJourney` → [{ id, name }]. */
export function parsearGuiasJourney(txt) {
  return [...txt.matchAll(/id:\s*'([^']+)',\s*\n\s*name:\s*'([^']+)'/g)].map((m) => ({ id: m[1], name: m[2] }));
}
