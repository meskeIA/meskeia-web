/**
 * Script: check-sitemap.mjs
 *
 * Candado de cobertura del sitemap. Se ejecuta antes de cada build
 * (`npm run build`) y a mano con `npm run check:sitemap`.
 *
 * Existe por un fallo real (13/08/2026): `app/sitemap.ts` derivaba sus URLs SOLO de
 * `applicationsDatabase`, así que las 14 guías-journey de `data/guides-journey.ts`
 * —landings de decisión, 200 OK, `index, follow`, canonical propia— no se anunciaban
 * en ningún sitio. Ni el build ni `check:verticales` tenían nada que decir al
 * respecto: el sitemap se generaba correctamente, solo que sobre una fuente
 * incompleta. Se descubrió por casualidad, tirando del hilo de un aviso de Bing
 * ("Faltan páginas importantes en los mapas del sitio") que iba de otra cosa.
 *
 * Lo que vigila: que toda ruta con `page.tsx` bajo `app/` esté anunciada en el
 * sitemap, o bien exenta POR UN MOTIVO ESCRITO. La lista de exenciones es la parte
 * importante del fichero: convierte "esto no se indexa" en una decisión declarada
 * en vez de en un efecto colateral de cómo se construye el sitemap.
 *
 * Vigila también el reverso: que ninguna guía-journey anuncie una carpeta que no
 * existe (sería un 404 anunciado en el sitemap, el fallo de 2026-07-18 al revés).
 *
 * Los datos se leen con expresiones regulares sobre los .ts (mismo enfoque que
 * `check-verticales.mjs`) para no depender de cargar TypeScript en el build. Si el
 * formato cambia y el parseo se desincroniza, el script falla en vez de dar un OK
 * vacío.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = (rel) => fs.readFileSync(path.join(RAIZ, rel), 'utf8');

const errores = [];

// ---------------------------------------------------------------------------
// 1. Rutas reales: toda carpeta bajo app/ con su propio page.tsx
// ---------------------------------------------------------------------------
const rutasReales = [];
(function recorrer(dirAbs, url) {
  for (const entrada of fs.readdirSync(dirAbs, { withFileTypes: true })) {
    if (!entrada.isDirectory()) continue;
    // `api` no son páginas; `_*` es convención de carpeta privada; `[slug]` son
    // rutas dinámicas cuyas URLs concretas no se deducen del árbol de ficheros.
    if (entrada.name === 'api' || entrada.name.startsWith('_') || entrada.name.startsWith('[')) continue;
    const sub = path.join(dirAbs, entrada.name);
    const suUrl = `${url}${entrada.name}/`;
    if (fs.existsSync(path.join(sub, 'page.tsx')) || fs.existsSync(path.join(sub, 'page.ts'))) {
      rutasReales.push(suUrl);
    }
    recorrer(sub, suUrl);
  }
})(path.join(RAIZ, 'app'), '/');

if (rutasReales.length < 500) {
  errores.push(`Solo he encontrado ${rutasReales.length} rutas bajo app/: el recorrido está roto.`);
}

// ---------------------------------------------------------------------------
// 2. URLs que el sitemap anuncia, leídas de sus MISMAS fuentes
// ---------------------------------------------------------------------------
const anunciadas = new Set();

// Apps del catálogo (app/sitemap.ts excluye el prefijo /visualizador-historia/).
const urlsApplications = [...leer('data/applications.ts').matchAll(/url:\s*"(\/[^"]*)"/g)].map((m) => m[1]);
if (urlsApplications.length < 500) {
  errores.push(`Solo he leído ${urlsApplications.length} urls de data/applications.ts: el parseo está roto.`);
}
for (const url of urlsApplications) {
  if (!url.startsWith('/visualizador-historia/')) anunciadas.add(url);
}

// Guías-journey (solo las disponibles, igual que el sitemap).
const guias = [
  ...leer('data/guides-journey.ts').matchAll(
    /url:\s*'(\/guia\/[^']*)',\s*\n\s*toolsCount:\s*\d+,\s*\n\s*available:\s*(true|false)/g,
  ),
];
if (guias.length < 10) {
  errores.push(`Solo he leído ${guias.length} guías de data/guides-journey.ts: el parseo está roto.`);
}
for (const [, url, disponible] of guias) {
  if (disponible === 'true') anunciadas.add(url);
}

// Páginas sueltas escritas a mano en app/sitemap.ts. Se leen del propio fichero en
// vez de copiarlas aquí: una lista duplicada acabaría contradiciendo al sitemap, que
// es justo la clase de fallo que este candado persigue.
const sitemapSrc = leer('app/sitemap.ts');

// Este script da por hecho que el sitemap se alimenta de las mismas dos fuentes que
// él lee. Si alguien retira una, el candado seguiría dando OK sobre una fuente que
// ya nadie usa — un candado que aprueba lo que no vigila es peor que no tenerlo.
for (const fuente of ['applicationsDatabase', 'guidesJourney']) {
  if (!sitemapSrc.includes(fuente)) {
    errores.push(
      `app/sitemap.ts ya no usa "${fuente}", pero este candado sigue contando sus URLs como anunciadas.`,
    );
  }
}
const fijas = [...sitemapSrc.matchAll(/url:\s*`\$\{baseUrl\}(\/[^`]*)`/g)].map((m) => m[1]);
if (fijas.length < 4) {
  errores.push(`Solo he leído ${fijas.length} páginas fijas de app/sitemap.ts: el parseo está roto.`);
}
for (const url of fijas) anunciadas.add(url);
anunciadas.add('/'); // la home se emite como `baseUrl` a secas

// ---------------------------------------------------------------------------
// 3. Exenciones declaradas — cada una con su motivo
// ---------------------------------------------------------------------------
const EXENTAS = [
  {
    motivo: 'Cronologías migradas a cronicum.com con 301 (no se anuncia lo que redirige)',
    aplica: (url) => url.startsWith('/visualizador-historia/'),
  },
  {
    motivo: 'Portales verticales: canonical o 301 al dominio propio (stemum/coquinum/cronicum/delegum)',
    aplica: (url) => /^\/(stemum|coquinum|cronicum|delegum)(\/|$)/.test(url),
  },
  {
    motivo:
      'Lecciones internas de los cursos: decisión del 13/08/2026 — se indexa la portada del curso y desde ' +
      'ella se navega a las lecciones por enlace interno',
    aplica: (url) => /^\/curso-[^/]+\/.+/.test(url),
  },
  {
    motivo: 'Subpáginas de /guia-cuidado-mascota/: mismo criterio que las lecciones de curso (hub → capítulos)',
    aplica: (url) => /^\/guia-cuidado-mascota\/.+/.test(url),
  },
  {
    motivo: 'Formulario de contacto: sirve noindex, nofollow',
    aplica: (url) => url === '/contacto/',
  },
  {
    motivo: 'Panel de analítica privado (protegido por ANALYTICS_SECRET)',
    aplica: (url) => url === '/dashboard-analytics/',
  },
];

// ---------------------------------------------------------------------------
// 4. Comprobaciones
// ---------------------------------------------------------------------------
const huerfanas = rutasReales.filter(
  (url) => !anunciadas.has(url) && !EXENTAS.some((e) => e.aplica(url)),
);

if (huerfanas.length) {
  errores.push(
    `${huerfanas.length} página(s) con page.tsx no aparecen en el sitemap y no están exentas:\n` +
      huerfanas.map((u) => `      · ${u}`).join('\n') +
      '\n      → o se registra la ruta (applications.ts / guides-journey.ts / página fija en app/sitemap.ts)' +
      '\n        o se añade una exención CON MOTIVO en scripts/check-sitemap.mjs.',
  );
}

// El reverso: una guía anunciada sin carpeta detrás sería un 404 en el sitemap.
for (const [, url] of guias) {
  const carpeta = path.join(RAIZ, 'app', url.replace(/^\/|\/$/g, ''));
  if (!fs.existsSync(path.join(carpeta, 'page.tsx'))) {
    errores.push(`La guía ${url} está en data/guides-journey.ts pero no existe app${url}page.tsx.`);
  }
}

// ---------------------------------------------------------------------------
// 5. Resultado
// ---------------------------------------------------------------------------
if (errores.length) {
  console.error('\n❌ check-sitemap: cobertura del sitemap incoherente\n');
  for (const e of errores) console.error(`   • ${e}`);
  console.error('');
  process.exit(1);
}

const exentas = rutasReales.length - rutasReales.filter((u) => anunciadas.has(u)).length;
console.log(
  `✅ check-sitemap: ${rutasReales.length} rutas bajo app/ — ` +
    `${rutasReales.length - exentas} en el sitemap, ${exentas} exentas con motivo declarado.`,
);
