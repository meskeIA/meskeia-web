#!/usr/bin/env node
/**
 * detectar-candidatas-latam.mjs
 *
 * Escanea el catalogo de apps (app/<slug>/metadata.ts + page.tsx) y lo cruza
 * con scripts/seo-latam/glosario-es-latam.json para detectar apps que usan
 * SOLO una variante regional de un termino de dominio y, por tanto, podrian ser
 * invisibles en el otro mercado hispanohablante.
 *
 * NO modifica nada. Solo informa. La priorizacion final (que candidatas tocar)
 * se hace cruzando esta lista con las impresiones reales de Search Console.
 *
 * Uso:
 *   node scripts/seo-latam/detectar-candidatas-latam.mjs              (todo)
 *   node scripts/seo-latam/detectar-candidatas-latam.mjs --falta-latam (solo apps ES sin variante Latam)
 *   node scripts/seo-latam/detectar-candidatas-latam.mjs --falta-es    (solo apps Latam sin variante ES)
 *   node scripts/seo-latam/detectar-candidatas-latam.mjs --dominio=cocina
 *   node scripts/seo-latam/detectar-candidatas-latam.mjs --json        (salida JSON para pipe)
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const APP_DIR = join(ROOT, 'app');

// --- args -------------------------------------------------------------------
const args = process.argv.slice(2);
const soloFaltaLatam = args.includes('--falta-latam');
const soloFaltaEs = args.includes('--falta-es');
const salidaJson = args.includes('--json');
const dominioFiltro = (args.find((a) => a.startsWith('--dominio=')) || '').split('=')[1] || null;

// --- glosario ---------------------------------------------------------------
const glosario = JSON.parse(readFileSync(join(__dirname, 'glosario-es-latam.json'), 'utf8'));
let pares = glosario.pares;
if (dominioFiltro) pares = pares.filter((p) => p.dominio === dominioFiltro);

// --- helpers ----------------------------------------------------------------
// Normaliza: minusculas + quita acentos para comparar de forma robusta.
const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

// Busca un termino como palabra (con limites no alfabeticos) dentro del texto.
function contiene(textoNorm, termino) {
  const t = norm(termino).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|[^a-z0-9])${t}([^a-z0-9]|$)`, 'i');
  return re.test(textoNorm);
}

function primeraCoincidencia(textoNorm, variantes) {
  return variantes.find((v) => contiene(textoNorm, v)) || null;
}

// Extrae las SENALES FUERTES de SEO: lo que define de que va la app para Google
// (title, og/twitter title, name del JSON-LD, keywords y los H1 visibles).
// Una mencion casual en el cuerpo educativo NO cuenta como senal fuerte.
function extraerSenalFuerte(metaTxt, pageTxt) {
  const partes = [];
  for (const m of metaTxt.matchAll(/\b(?:title|name)\s*:\s*(['"`])([^'"`]+)\1/g)) partes.push(m[2]);
  const kwStr = metaTxt.match(/keywords\s*:\s*(['"`])([\s\S]*?)\1/);
  if (kwStr) partes.push(kwStr[2]);
  const kwArr = metaTxt.match(/keywords\s*:\s*\[([\s\S]*?)\]/);
  if (kwArr) partes.push(kwArr[1]);
  for (const m of pageTxt.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)) partes.push(m[1]);
  return partes.join(' \n ');
}

// --- escaneo ----------------------------------------------------------------
const apps = readdirSync(APP_DIR).filter((name) => {
  const dir = join(APP_DIR, name);
  return (
    statSync(dir).isDirectory() &&
    existsSync(join(dir, 'page.tsx')) &&
    !name.startsWith('[') // rutas dinamicas
  );
});

const candidatas = []; // { slug, dominio, tipo, usa, falta, esOnly }
let appsConAlgunTermino = 0;

for (const slug of apps) {
  const dir = join(APP_DIR, slug);
  const metaTxt = existsSync(join(dir, 'metadata.ts')) ? readFileSync(join(dir, 'metadata.ts'), 'utf8') : '';
  const pageTxt = existsSync(join(dir, 'page.tsx')) ? readFileSync(join(dir, 'page.tsx'), 'utf8') : '';
  const texto = metaTxt + '\n' + pageTxt;
  const textoNorm = norm(texto); // documento completo (para comprobar AUSENCIA de la otra variante)
  const senalNorm = norm(extraerSenalFuerte(metaTxt, pageTxt)); // solo title/H1/keywords/name
  const esOnly = /regionbadge[^>]*es-only/i.test(texto);
  let tocada = false;

  for (const par of pares) {
    // El termino DEFINE la app solo si esta en una senal fuerte.
    const hitEsFuerte = primeraCoincidencia(senalNorm, par.es);
    const hitLatamFuerte = primeraCoincidencia(senalNorm, par.latam);
    // La otra variante se considera ausente si no aparece NI en cuerpo.
    const hayLatam = primeraCoincidencia(textoNorm, par.latam);
    const hayEs = primeraCoincidencia(textoNorm, par.es);

    if (hitEsFuerte && !hayLatam) {
      candidatas.push({
        slug,
        dominio: par.dominio,
        tipo: 'falta-latam',
        usa: hitEsFuerte,
        falta: par.latam.join(', '),
        nota: par.nota,
        esOnly,
      });
      tocada = true;
    } else if (hitLatamFuerte && !hayEs) {
      candidatas.push({
        slug,
        dominio: par.dominio,
        tipo: 'falta-es',
        usa: hitLatamFuerte,
        falta: par.es.join(', '),
        nota: par.nota,
        esOnly,
      });
      tocada = true;
    } else if (hitEsFuerte || hitLatamFuerte) {
      tocada = true; // identifica el par y ya cubre ambas variantes
    }
  }
  if (tocada) appsConAlgunTermino++;
}

// --- filtro por tipo --------------------------------------------------------
let resultado = candidatas;
if (soloFaltaLatam) resultado = resultado.filter((c) => c.tipo === 'falta-latam');
if (soloFaltaEs) resultado = resultado.filter((c) => c.tipo === 'falta-es');

// --- salida -----------------------------------------------------------------
if (salidaJson) {
  console.log(JSON.stringify(resultado, null, 2));
  process.exit(0);
}

const faltaLatam = resultado.filter((c) => c.tipo === 'falta-latam');
const faltaEs = resultado.filter((c) => c.tipo === 'falta-es');

function imprimirGrupo(titulo, lista, etiquetaFalta) {
  console.log(`\n${'='.repeat(72)}`);
  console.log(titulo);
  console.log('='.repeat(72));
  if (lista.length === 0) {
    console.log('  (ninguna)');
    return;
  }
  // ordenar por dominio y luego por slug
  lista.sort((a, b) => a.dominio.localeCompare(b.dominio) || a.slug.localeCompare(b.slug));
  let dominioActual = null;
  for (const c of lista) {
    if (c.dominio !== dominioActual) {
      dominioActual = c.dominio;
      console.log(`\n  [${dominioActual}]`);
    }
    const flag = c.esOnly ? ' ⚠ es-only (revisar: quiza no aplica)' : '';
    console.log(`    /${c.slug}/`);
    console.log(`        usa "${c.usa}"  ->  ${etiquetaFalta}: ${c.falta}${flag}`);
  }
}

console.log(`\nDeteccion de candidatas LATAM <-> ES`);
console.log(`Apps escaneadas: ${apps.length}  |  con algun termino del glosario: ${appsConAlgunTermino}`);
console.log(`Pares de glosario activos: ${pares.length}${dominioFiltro ? ` (dominio=${dominioFiltro})` : ''}`);

if (!soloFaltaEs) {
  imprimirGrupo(
    `FALTA VARIANTE LATAM  (usan termino Espana, no el de Latam)  -  ${faltaLatam.length}`,
    faltaLatam,
    'anadir sinonimo Latam',
  );
}
if (!soloFaltaLatam) {
  imprimirGrupo(
    `FALTA VARIANTE ES  (usan termino Latam, no el de Espana)  -  ${faltaEs.length}`,
    faltaEs,
    'anadir sinonimo ES',
  );
}

console.log(`\n${'-'.repeat(72)}`);
console.log('SIGUIENTE PASO: cruzar esta lista con el informe de Consultas de');
console.log('Search Console. Tocar SOLO las candidatas con impresiones reales.');
console.log('Fix barato y aditivo (title + subtitulo + keywords + JSON-LD + FAQ');
console.log('de terminologia). NO tocar apps marcadas es-only sin verificar.');
console.log('-'.repeat(72));
