#!/usr/bin/env node
/**
 * check-consumidores.mjs — los parsers por regex de `data/` devuelven lo que el catálogo contiene
 *
 * Ejecutar:  npm run check:consumidores        (también en `npm run build`)
 * Prueba:    npm run consumidores:probar-candado
 *
 * QUÉ VIGILA
 * ──────────
 * Varios scripts leen los catálogos de `data/*.ts` como TEXTO, con expresiones regulares, porque
 * corren fuera de Next (con el dump de Turso o las APIs de GSC y Bing). Si cambia el formato de
 * un fichero de datos —comillas, estructura de los objetos, nombre del `export`— el regex deja de
 * casar y el consumidor se queda con cero items, o con unos pocos menos, SIN DAR NINGÚN ERROR.
 * El build no lo ve: esos scripts no se ejecutan en él.
 *
 * Este candado pasa a cada parser de `scripts/parsers-catalogo.mjs` el texto real del fichero y
 * compara el resultado con el catálogo IMPORTADO (Node 24 carga los .ts quitando los tipos).
 * Exige igualdad exacta, no un umbral: un parser que devuelve 144 de 145 está tan roto como el
 * que devuelve 0, y uno que lee la ruta en lugar del nombre (S0154) también. No hay escape: si
 * el parser no coincide con el catálogo, el parser está mal.
 *
 * Por qué no EJECUTA los consumidores, que era la idea de partida: todos necesitan el dump de
 * Turso o credenciales de GSC, que en un build no hay, y escriben ficheros.
 *
 * Consumidores cubiertos: cuadrante-stem · cuadrante-catalogo · semilla-diaria ·
 * detectar-duplicados · generate-apps-demandadas. NO cubiertos, a propósito: el generador de posts
 * para X (otro repositorio, uso esporádico; sus parsers avisan por consola), `covisita-crosscheck`
 * y `faq-progress`. Un consumidor que copie su propio regex en vez de importarlo de
 * parsers-catalogo.mjs también se queda fuera: por eso no deben copiarlo.
 *
 * Si este Node no sabe cargar .ts (sin `process.features.typescript` o sin `registerHooks`), se
 * omite avisando: lo cubre el build local que hace /push.
 *
 * DE DÓNDE SALE (28/07/2026)
 * ──────────────────────────
 * El refactor de verticales convirtió STEMUM_APP_DISCIPLINA y COQUINUM_APP_CATEGORIA en Record
 * DERIVADOS del catálogo, y los consumidores que leían sus pares 'slug': 'valor' se quedaron
 * mudos —tres a la vez— sin que nada fallara. Coquinum adjudicó sus 84 apps a «meskeIA (resto)»
 * hasta que alguien abrió el generador de posts por casualidad. Detalle: scripts/CLAUDE.md.
 *
 * Opción `--raiz <dir>`: lee `data/` de otra carpeta. La usa la prueba, sobre copias.
 */

import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  parsearApplications, parsearGuiasJourney, slugsCoquinum, slugsDelegum, slugsImplementadas,
  slugsStemum, stemumDisciplinas,
} from './parsers-catalogo.mjs';

const RAIZ_REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const iRaiz = process.argv.indexOf('--raiz');
const RAIZ = iRaiz >= 0 ? path.resolve(process.argv[iRaiz + 1]) : RAIZ_REPO;

if (!process.features?.typescript || typeof registerHooks !== 'function') {
  console.log(`⏭️  check:consumidores omitido: Node ${process.version} no carga .ts de forma nativa.`);
  process.exit(0);
}

// `applications.ts` importa './suites' sin extensión, que el cargador de Node no resuelve solo.
// Y los .ts se declaran ES module, para que Node no avise de que tuvo que adivinarlo.
registerHooks({
  load(url, contexto, siguiente) {
    return siguiente(url, url.endsWith('.ts') ? { ...contexto, format: 'module-typescript' } : contexto);
  },
  resolve(especificador, contexto, siguiente) {
    try {
      return siguiente(especificador, contexto);
    } catch (e) {
      if (e?.code === 'ERR_MODULE_NOT_FOUND' && especificador.startsWith('.') && !/\.[cm]?[jt]s$/.test(especificador)) {
        return siguiente(`${especificador}.ts`, contexto);
      }
      throw e;
    }
  },
});

const leer = (rel) => fs.readFileSync(path.join(RAIZ, rel), 'utf8');
const importar = (rel) => import(pathToFileURL(path.join(RAIZ, rel)).href);
const sinBarras = (url) => url.replace(/^\/|\/$/g, '');

const errores = [];
const resumen = [];

/** Compara dos listas de claves como conjuntos y como recuentos. */
function compararConjuntos(nombre, consumidores, delParser, delCatalogo) {
  const p = new Set(delParser);
  const c = new Set(delCatalogo);
  const faltan = [...c].filter((x) => !p.has(x));
  const sobran = [...p].filter((x) => !c.has(x));
  const muestra = (l) => l.slice(0, 5).join(', ') + (l.length > 5 ? ` …y ${l.length - 5} más` : '');
  if (faltan.length || sobran.length || delParser.length !== delCatalogo.length) {
    errores.push(
      `[${nombre}] el parser saca ${delParser.length} y el catálogo tiene ${delCatalogo.length}.` +
        (faltan.length ? `\n     No ve: ${muestra(faltan)}` : '') +
        (sobran.length ? `\n     Se inventa: ${muestra(sobran)}` : '') +
        (!faltan.length && !sobran.length ? '\n     Mismos elementos, distinto recuento: lee alguno dos veces.' : '') +
        `\n     Lo usan: ${consumidores}`,
    );
    return false;
  }
  resumen.push(`${nombre} ${delCatalogo.length}`);
  return true;
}

/** Compara campo a campo los elementos que ambos lados comparten. */
function compararCampos(nombre, consumidores, delParser, delCatalogo, campos) {
  const porClave = new Map(delCatalogo.map((x) => [x.clave, x]));
  for (const campo of campos) {
    const distintos = delParser.filter((x) => porClave.has(x.clave)
      && JSON.stringify(x[campo]) !== JSON.stringify(porClave.get(x.clave)[campo]));
    if (distintos.length) {
      const x = distintos[0];
      errores.push(
        `[${nombre}] el campo «${campo}» no coincide en ${distintos.length} entrada(s).` +
          `\n     Ej. ${x.clave}: el parser lee ${JSON.stringify(x[campo])}` +
          `\n                     y el catálogo dice ${JSON.stringify(porClave.get(x.clave)[campo])}` +
          `\n     Lo usan: ${consumidores}`,
      );
    }
  }
}

// ── Stemum ─────────────────────────────────────────────────────────────────
const stemum = await importar('data/stemum.ts');
const txtStemum = leer('data/stemum.ts');
const disciplinas = stemumDisciplinas(txtStemum);
if (compararConjuntos('STEMUM_APPS → disciplina', 'cuadrante-stem', [...disciplinas.keys()], stemum.STEMUM_APPS.map((a) => a.slug))) {
  compararCampos('STEMUM_APPS → disciplina', 'cuadrante-stem',
    [...disciplinas].map(([clave, disciplina]) => ({ clave, disciplina })),
    stemum.STEMUM_APPS.map((a) => ({ clave: a.slug, disciplina: a.disciplina })),
    ['disciplina']);
}
compararConjuntos('Stemum (apps + material)', 'cuadrante-catalogo, semilla-diaria',
  slugsStemum(txtStemum), [...stemum.STEMUM_APPS, ...stemum.STEMUM_MATERIAL_APOYO].map((a) => a.slug));

// ── Coquinum y Delegum ─────────────────────────────────────────────────────
const coquinum = await importar('data/coquinum.ts');
compararConjuntos('COQUINUM_APPS', 'cuadrante-catalogo, semilla-diaria',
  slugsCoquinum(leer('data/coquinum.ts')), coquinum.COQUINUM_APPS.map((a) => a.slug));

const delegum = await importar('data/delegum/soluciones.ts');
compararConjuntos('Delegum (soluciones)', 'cuadrante-catalogo, semilla-diaria',
  slugsDelegum(leer('data/delegum/soluciones.ts')), [...delegum.DELEGUM_APP_SLUGS]);

// ── Catálogo de meskeIA ────────────────────────────────────────────────────
const implementadas = await importar('data/implemented-apps.ts');
compararConjuntos('implementedAppsUrls', 'cuadrante-catalogo',
  slugsImplementadas(leer('data/implemented-apps.ts')), [...implementadas.implementedAppsUrls].map(sinBarras));

const applications = await importar('data/applications.ts');
const appsParser = parsearApplications(leer('data/applications.ts')).map((a) => ({ ...a, clave: a.slug }));
const appsCatalogo = applications.applicationsDatabase.map((a) => ({
  clave: sinBarras(a.url),
  name: a.name,
  description: a.description ?? '',
  keywords: a.keywords ?? [],
  suites: a.suites ?? [],
}));
compararConjuntos('applicationsDatabase', 'semilla-diaria, detectar-duplicados, generate-apps-demandadas',
  appsParser.map((a) => a.clave), appsCatalogo.map((a) => a.clave));
compararCampos('applicationsDatabase', 'semilla-diaria, detectar-duplicados',
  appsParser, appsCatalogo, ['name', 'suites', 'description', 'keywords']);

const guias = await importar('data/guides-journey.ts');
const guiasParser = parsearGuiasJourney(leer('data/guides-journey.ts')).map((g) => ({ ...g, clave: g.id }));
const guiasCatalogo = guias.guidesJourney.map((g) => ({ clave: g.id, name: g.name }));
if (compararConjuntos('guidesJourney', 'semilla-diaria', guiasParser.map((g) => g.clave), guiasCatalogo.map((g) => g.clave))) {
  compararCampos('guidesJourney', 'semilla-diaria', guiasParser, guiasCatalogo, ['name']);
}

// ── Veredicto ──────────────────────────────────────────────────────────────
if (errores.length) {
  console.error(`\n❌ check:consumidores — ${errores.length} parser(es) de data/ no leen lo que el catálogo contiene:\n`);
  for (const e of errores) console.error(`  • ${e}\n`);
  console.error(
    '  Un formato nuevo en data/*.ts deja mudos a los scripts que lo leen con regex, sin error.\n' +
      '  Corrige el parser en scripts/parsers-catalogo.mjs (no en el consumidor). Ver scripts/CLAUDE.md.\n',
  );
  process.exit(1);
}
console.log(`✅ check:consumidores — los parsers de data/ coinciden con el catálogo (${resumen.join(' · ')}).`);
