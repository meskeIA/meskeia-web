/**
 * Script: check-verticales.mjs
 *
 * Candado de coherencia de los portales verticales. Se ejecuta antes de cada
 * build (`npm run build`) y a mano con `npm run check:verticales`.
 *
 * Existe por un fallo real (28/07/2026): en Stemum cada app se registraba en DOS
 * listas — el mapa de `data/stemum.ts` (breadcrumb, proxy, contadores) y el array
 * `APPS` hardcodeado dentro de cada `app/stemum/[disciplina]/page.tsx` (la
 * parrilla). Registrar solo la primera dejaba la app contada en el hero pero sin
 * tarjeta que la enlazase, y el build pasaba sin una queja: le ocurrió a
 * `simulador-logica-secuencial` y a `ajustar-ecuaciones-quimicas`. Coquinum tenía
 * el mismo patrón con TRES listas, y sus nombres e iconos ya habían divergido en
 * 21 títulos y 17 iconos.
 *
 * Ahora las parrillas se derivan del catálogo, así que ese desajuste es
 * imposible. Este script vigila lo que sigue siendo posible: un slug mal escrito,
 * una app del catálogo sin carpeta en `app/` o sin registrar en meskeIA, una
 * disciplina/categoría inventada, una cronología que se queda sin puerta en
 * Cronicum, o que alguien vuelva a hardcodear una parrilla.
 *
 * Los datos se leen con expresiones regulares sobre los .ts (mismo enfoque que
 * `generate-llm-index.js`) para no depender de la carga de TypeScript en el
 * entorno de build. Si el formato cambia y el parseo se desincroniza, el script
 * falla en vez de dar un OK vacío.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = (rel) => fs.readFileSync(path.join(RAIZ, rel), 'utf8');
const existe = (rel) => fs.existsSync(path.join(RAIZ, rel));

const errores = [];
const resumen = [];

// Registros de meskeIA, comunes a los tres portales.
const implementadas = leer('data/implemented-apps.ts');
const applications = leer('data/applications.ts');

const trozo = (src, desde, hasta, fichero) => {
  const i = src.indexOf(desde);
  if (i < 0) throw new Error(`No encuentro "${desde}" en ${fichero}`);
  const j = hasta ? src.indexOf(hasta, i) : src.length;
  return src.slice(i, j < 0 ? src.length : j);
};

/**
 * Comprueba un portal con parrillas derivadas de catálogo (Stemum y Coquinum,
 * que comparten arquitectura: catálogo de tarjetas + una página por sección).
 */
function revisarPortalDeParrillas({
  nombre,
  fichero,
  catalogo,
  finCatalogo,
  secciones,
  finSecciones,
  campoSeccion,
  rutaSeccion,
  helper,
  extras = [],
}) {
  const src = leer(fichero);

  // Secciones: 'slug': 'Etiqueta visible'
  const nombresSeccion = [
    ...trozo(src, secciones, finSecciones, fichero).matchAll(/'([a-z-]+)':\s*'([^']+)'/g),
  ].map((m) => m[1]);

  // Entradas del catálogo: { slug, icon, titulo, desc, <campoSeccion> }
  const regexEntrada = new RegExp(
    "\\{\\s*slug:\\s*'([^']+)',\\s*icon:\\s*'([^']*)',\\s*titulo:\\s*'((?:[^'\\\\]|\\\\.)*)'," +
      "\\s*desc:\\s*'((?:[^'\\\\]|\\\\.)*)',\\s*" +
      campoSeccion +
      ":\\s*'([^']*)',\\s*\\}",
    'g',
  );

  const parsear = (bloque, etiqueta) => {
    const lista = [...bloque.matchAll(regexEntrada)].map((m) => ({
      slug: m[1],
      icon: m[2],
      titulo: m[3],
      desc: m[4],
      seccion: m[5],
    }));
    // Control anti-falso-OK: tantas entradas parseadas como slugs hay en el
    // bloque. Se cuenta la clave `slug:` a secas: si se exigiera su valor en la
    // misma línea, un cambio de formato bajaría los dos contadores a la vez y el
    // descuadre pasaría desapercibido.
    const slugs = (bloque.match(/^\s*slug:/gm) ?? []).length;
    if (lista.length !== slugs) {
      errores.push(
        `[${nombre}] Parseo desincronizado en ${etiqueta}: ${slugs} entradas en el fichero, ` +
          `${lista.length} reconocidas. Revisa regexEntrada en scripts/check-verticales.mjs.`,
      );
    }
    return lista;
  };

  const apps = parsear(trozo(src, catalogo, finCatalogo, fichero), catalogo.replace('export const ', ''));
  if (!apps.length) errores.push(`[${nombre}] El catálogo está vacío o no se ha podido leer.`);

  // Listas auxiliares del mismo fichero con idéntica forma (material de apoyo).
  const auxiliares = extras.flatMap((e) =>
    parsear(trozo(src, e.desde, e.hasta, fichero), e.desde.replace('export const ', '')).map((a) => ({
      ...a,
      lista: e.desde.replace('export const ', ''),
    })),
  );

  const vistos = new Map();
  for (const app of [...apps.map((a) => ({ ...a, lista: 'el catálogo' })), ...auxiliares]) {
    const { slug, icon, titulo, desc, seccion, lista } = app;
    if (vistos.has(slug)) {
      errores.push(`[${nombre}] Slug duplicado: "${slug}" (${vistos.get(slug)} y ${lista}).`);
    }
    vistos.set(slug, lista);

    if (!nombresSeccion.includes(seccion)) {
      errores.push(`[${nombre}] "${slug}" declara "${seccion}", que no existe en ${secciones.replace('export const ', '')}.`);
    }
    if (!icon.trim()) errores.push(`[${nombre}] "${slug}" no tiene icon: la tarjeta saldría sin emoji.`);
    if (!titulo.trim()) errores.push(`[${nombre}] "${slug}" no tiene titulo.`);
    if (!desc.trim()) errores.push(`[${nombre}] "${slug}" no tiene desc.`);

    if (!existe(`app/${slug}/page.tsx`)) {
      errores.push(`[${nombre}] "${slug}" está en ${lista} pero no existe app/${slug}/page.tsx: enlace roto.`);
    }
    if (!implementadas.includes(`"/${slug}/"`)) {
      errores.push(`[${nombre}] "${slug}" no está en data/implemented-apps.ts.`);
    }
    if (!applications.includes(`url: "/${slug}/"`)) {
      errores.push(
        `[${nombre}] "${slug}" no está en data/applications.ts: quedaría sin descripción en el llms.txt del portal.`,
      );
    }
  }

  // Cada sección necesita su página, al menos una app, y derivar su parrilla.
  for (const seccion of nombresSeccion) {
    const pagina = `${rutaSeccion}/${seccion}/page.tsx`;
    if (!existe(pagina)) {
      errores.push(`[${nombre}] La sección "${seccion}" no tiene su página ${pagina}.`);
      continue;
    }
    if (!apps.some((a) => a.seccion === seccion)) {
      errores.push(`[${nombre}] La sección "${seccion}" no tiene ninguna app en el catálogo.`);
    }
    const pag = leer(pagina);
    if (/const APPS = \[/.test(pag)) {
      errores.push(
        `[${nombre}] ${pagina} vuelve a llevar una lista APPS hardcodeada. Usa ${helper}('${seccion}'): ` +
          'una segunda lista es justo el fallo que este candado evita.',
      );
    } else if (!pag.includes(`${helper}('${seccion}')`)) {
      errores.push(`[${nombre}] ${pagina} no pinta su parrilla con ${helper}('${seccion}').`);
    }
  }

  const detalle = nombresSeccion
    .map((s) => `${s} ${apps.filter((a) => a.seccion === s).length}`)
    .join(' · ');
  resumen.push(
    `${nombre}: ${apps.length} apps (${detalle})` +
      (auxiliares.length ? ` + ${auxiliares.length} auxiliares` : ''),
  );
}

// ─── Stemum ─────────────────────────────────────────────────────────────────
revisarPortalDeParrillas({
  nombre: 'Stemum',
  fichero: 'data/stemum.ts',
  secciones: 'export const STEMUM_DISCIPLINAS',
  finSecciones: 'export type StemumApp',
  catalogo: 'export const STEMUM_APPS',
  finCatalogo: 'export function appsDeDisciplina',
  campoSeccion: 'disciplina',
  rutaSeccion: 'app/stemum',
  helper: 'appsDeDisciplina',
  extras: [
    {
      desde: 'export const STEMUM_MATERIAL_APOYO',
      hasta: 'export const STEMUM_MATERIAL_DISCIPLINA',
    },
  ],
});

/**
 * Stemum tiene TRES capas y un slug solo puede estar en una:
 *   1. STEMUM_APPS          — simuladores del portal (parrilla, breadcrumb, contadores)
 *   2. STEMUM_MATERIAL_APOYO — tablas de consulta, sección material-apoyo
 *   3. STEMUM_ADYACENTES    — apps STEM-afines que solo muestran la banda hacia su disciplina
 *
 * DescubreVertical las consulta en ese orden, así que una app en dos capas no
 * rompe la página: simplemente la entrada de la capa inferior queda muerta y las
 * disciplinas pueden divergir sin que nadie se entere. Pasó con
 * `calculadora-algebra-booleana` (portal como Computación, adyacente como
 * Matemáticas) y con `tabla-periodica` (material y adyacente a la vez).
 */
{
  const stemumSrc = leer('data/stemum.ts');
  const slugsDe = (desde, hasta) =>
    [...trozo(stemumSrc, desde, hasta, 'data/stemum.ts').matchAll(/slug: '([^']+)'/g)].map((m) => m[1]);

  const capas = [
    ['STEMUM_APPS', slugsDe('export const STEMUM_APPS', 'export function appsDeDisciplina')],
    ['STEMUM_MATERIAL_APOYO', slugsDe('export const STEMUM_MATERIAL_APOYO', 'export const STEMUM_MATERIAL_DISCIPLINA')],
    ['STEMUM_ADYACENTES', [...leer('data/stemum-adyacentes.ts').matchAll(/^\s*'([a-z0-9-]+)':\s*'[a-z-]+'/gm)].map((m) => m[1])],
  ];

  const donde = new Map();
  for (const [capa, slugs] of capas) {
    for (const slug of slugs) {
      if (donde.has(slug)) {
        errores.push(
          `Stemum: "${slug}" está en ${donde.get(slug)} y en ${capa}. ` +
          `Un slug pertenece a UNA sola capa — elige la que corresponde a su naturaleza y bórralo de la otra.`
        );
      } else {
        donde.set(slug, capa);
      }
    }
  }
  resumen.push(`Stemum capas: ${capas.map(([c, s]) => `${c.replace('STEMUM_', '').toLowerCase()} ${s.length}`).join(' · ')} (sin solapes)`);
}

// ─── Coquinum ───────────────────────────────────────────────────────────────
// `finSecciones` corta en la interfaz de la ficha de categoría, NO en `export type
// CoquinumApp`: entre medias está COQUINUM_CATEGORIAS_RETIRADAS, cuyas entradas
// ('conservacion': 'coccion') tienen la misma forma que una sección y se colarían
// en la lista, haciendo que el candado exigiese la carpeta de tres categorías que
// se acaban de retirar a propósito.
revisarPortalDeParrillas({
  nombre: 'Coquinum',
  fichero: 'data/coquinum.ts',
  secciones: 'export const COQUINUM_CATEGORIAS',
  finSecciones: 'export interface CoquinumCategoriaInfo',
  catalogo: 'export const COQUINUM_APPS',
  finCatalogo: 'export function appsDeCategoria',
  campoSeccion: 'categoria',
  rutaSeccion: 'app/coquinum',
  helper: 'appsDeCategoria',
});

/**
 * La home del portal DERIVA sus tarjetas de COQUINUM_CATEGORIAS + la ficha de cada
 * categoría (icono y descripción). Aquí se vigila esa pareja en los dos sentidos, y
 * que las categorías retiradas queden bien retiradas:
 *
 *   - Categoría sin ficha → la home reventaría al leer `.icon` de undefined.
 *   - Ficha huérfana → texto que ya no pinta nadie, y el próximo que lo lea creerá
 *     que esa sección sigue viva.
 *   - Retirada que apunta a una categoría inexistente, o que sigue teniendo carpeta
 *     → el 301 de proxy.ts llevaría a un 404, o la carpeta ganaría al redirect.
 *
 * Sale del mismo sitio que el resto del candado: mientras la home llevó su lista de
 * secciones a mano, su comentario decía «las 5 categorías pobladas» con nueve ya
 * publicadas y nada avisaba.
 */
{
  const src = leer('data/coquinum.ts');
  const clavesDe = (desde, hasta) =>
    [...trozo(src, desde, hasta, 'data/coquinum.ts').matchAll(/^\s*'?([a-z-]+)'?:/gm)]
      .map((m) => m[1])
      .filter((k) => !['icon', 'desc'].includes(k));

  const categorias = clavesDe('export const COQUINUM_CATEGORIAS', 'export interface CoquinumCategoriaInfo');
  const fichas = clavesDe('export const COQUINUM_CATEGORIA_INFO', 'export const COQUINUM_CATEGORIAS_RETIRADAS');
  const retiradas = [
    ...trozo(src, 'export const COQUINUM_CATEGORIAS_RETIRADAS', '\n};', 'data/coquinum.ts')
      .matchAll(/'([a-z-]+)':\s*'([a-z-]+)'/g),
  ].map((m) => ({ slug: m[1], absorbe: m[2] }));

  for (const cat of categorias) {
    if (!fichas.includes(cat)) {
      errores.push(
        `[Coquinum] La categoría "${cat}" no tiene ficha en COQUINUM_CATEGORIA_INFO: ` +
          'su tarjeta de la home saldría sin icono ni descripción.',
      );
    }
  }
  for (const ficha of fichas) {
    if (!categorias.includes(ficha)) {
      errores.push(
        `[Coquinum] COQUINUM_CATEGORIA_INFO describe "${ficha}", que ya no está en ` +
          'COQUINUM_CATEGORIAS: ficha huérfana, bórrala.',
      );
    }
  }
  for (const { slug, absorbe } of retiradas) {
    if (categorias.includes(slug)) {
      errores.push(`[Coquinum] "${slug}" está a la vez viva en COQUINUM_CATEGORIAS y en las retiradas.`);
    }
    if (!categorias.includes(absorbe)) {
      errores.push(
        `[Coquinum] La categoría retirada "${slug}" redirige a "${absorbe}", que no existe: ` +
          'el 301 de proxy.ts acabaría en un 404.',
      );
    }
    if (existe(`app/coquinum/${slug}/page.tsx`)) {
      errores.push(
        `[Coquinum] "${slug}" figura como retirada pero conserva app/coquinum/${slug}/page.tsx: ` +
          'la página ganaría al 301 y la categoría seguiría viva a medias.',
      );
    }
  }
  resumen.push(
    `Coquinum home: ${categorias.length} categorías con ficha · ${retiradas.length} retiradas con 301`,
  );
}

// ─── Cronicum ───────────────────────────────────────────────────────────────
// Arquitectura distinta: las puertas NO duplican el contenido de la cronología
// (título, icono y descripción viven en data/historias/[slug].ts), solo asignan
// cada slug a una puerta. Lo que se vigila es esa asignación: una cronología sin
// puerta existe en meskeIA pero es inalcanzable desde cronicum.com.
{
  const idx = leer('data/historias/index.ts');
  const bloque = trozo(idx, 'const registry: Record<string, HistoriaData> = {', '\n};', 'data/historias/index.ts');

  const registry = [];
  for (const linea of bloque.split('\n').slice(1)) {
    const t = linea.trim();
    if (!t || t.startsWith('//')) continue;
    // Formas válidas: `slug,` · `'mi-slug': valor,` · `slug: valor,`
    const m =
      t.match(/^'([^']+)':/) ?? t.match(/^([A-Za-z][A-Za-z0-9]*):/) ?? t.match(/^([A-Za-z][A-Za-z0-9]*),$/);
    if (m) registry.push(m[1]);
    else errores.push(`[Cronicum] Línea no reconocida en el registry de historias: ${t}`);
  }

  const puertasSrc = leer('data/cronicum/puertas.ts');
  const puertas = puertasSrc.split(/\n  \{\n/).slice(1);
  const puertaDe = new Map(); // cronología → puertas que la reclaman
  const slugsPuerta = [];
  for (const p of puertas) {
    const slugPuerta = (p.match(/slug: '([^']+)'/) ?? [])[1];
    if (!slugPuerta) continue;
    slugsPuerta.push(slugPuerta);
    const arr = (p.match(/slugs: \[([\s\S]*?)\]/) ?? [])[1] ?? '';
    const dentro = [...arr.matchAll(/'([^']+)'/g)].map((m) => m[1]);
    if (!dentro.length) errores.push(`[Cronicum] La puerta "${slugPuerta}" no tiene ninguna cronología.`);
    for (const s of dentro) {
      if (!puertaDe.has(s)) puertaDe.set(s, []);
      puertaDe.get(s).push(slugPuerta);
    }
  }

  const ficheros = fs
    .readdirSync(path.join(RAIZ, 'data/historias'))
    .filter((f) => f.endsWith('.ts') && !['index.ts', 'types.ts'].includes(f))
    .map((f) => f.replace(/\.ts$/, ''));

  for (const slug of registry) {
    if (!puertaDe.has(slug)) {
      errores.push(
        `[Cronicum] La cronología "${slug}" no está asignada a ninguna puerta de data/cronicum/puertas.ts: ` +
          'no aparecería en cronicum.com.',
      );
    } else if (puertaDe.get(slug).length > 1) {
      errores.push(
        `[Cronicum] La cronología "${slug}" está en varias puertas (${puertaDe.get(slug).join(', ')}); ` +
          'cada una pertenece a exactamente una.',
      );
    }
    if (!ficheros.includes(slug)) {
      errores.push(`[Cronicum] "${slug}" está en el registry pero no existe data/historias/${slug}.ts.`);
    }
    if (!implementadas.includes(`"/visualizador-historia/${slug}/"`)) {
      errores.push(`[Cronicum] "${slug}" no está en data/implemented-apps.ts.`);
    }
    if (!applications.includes(`url: "/visualizador-historia/${slug}/"`)) {
      errores.push(`[Cronicum] "${slug}" no está en data/applications.ts.`);
    }
  }

  for (const slug of puertaDe.keys()) {
    if (!registry.includes(slug)) {
      errores.push(
        `[Cronicum] La puerta "${puertaDe.get(slug).join(', ')}" apunta a "${slug}", que no está en el ` +
          'registry de data/historias/index.ts: enlace roto.',
      );
    }
  }

  for (const f of ficheros) {
    if (!registry.includes(f)) {
      errores.push(
        `[Cronicum] data/historias/${f}.ts existe pero no está en el registry de index.ts: no se publica.`,
      );
    }
  }

  resumen.push(`Cronicum: ${registry.length} cronologías en ${slugsPuerta.length} puertas`);
}

// ─── Resultado ──────────────────────────────────────────────────────────────
if (errores.length) {
  console.error(`\n❌ Verticales: ${errores.length} problema(s) de coherencia\n`);
  for (const e of errores) console.error(`   · ${e}`);
  console.error('');
  process.exit(1);
}

console.log('✅ Verticales coherentes');
for (const r of resumen) console.log(`   · ${r}`);
