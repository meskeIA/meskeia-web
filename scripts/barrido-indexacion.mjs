#!/usr/bin/env node
/**
 * barrido-indexacion.mjs — Estado de indexación del catálogo en Google, ORDENADO POR DEMANDA.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────
 * De qué caso sale (19/09/2026, semilla S0150)
 * ────────────────────────────────────────────────────────────────────────────────────────────
 * La sonda de keywords de la semilla diaria encontró que `metronomo` tiene 15.189 impresiones
 * en Bing con un corpus 100 % de herramienta («metronome online», «metrónomo online gratuito»,
 * «bpm online»), y que /metronomo/ lleva desde el 04/04/2026 publicada con OCHO usos en toda su
 * vida. La URL Inspection API dio la causa: «Google no reconoce esta URL» — no indexada y nunca
 * rastreada, pese a devolver 200, estar en el sitemap y no estar tapada por robots.txt.
 *
 * No era un hallazgo nuevo: el baseline del 28/07/2026 ya dejó 61 URLs en ese estado. Lo que NO
 * existía es el CRUCE: esa lista nunca se ha ordenado por demanda tecleada, así que las 61 valen
 * hoy lo mismo, y no lo valen. Rescatar a mano una URL que nadie busca no cambia nada; dejar
 * fuera la que tiene 15.000 impresiones de intención de herramienta, sí.
 *
 * Por eso este script hace las DOS cosas en una pasada: pregunta a Google en qué estado está cada
 * URL y, de las que siguen fuera, pregunta a Bing cuánto se busca su palabra.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────
 * Lo que NO hace, a propósito
 * ────────────────────────────────────────────────────────────────────────────────────────────
 * NO emite veredicto sobre si una demanda «vale». Imprime el volumen y las primeras keywords, y
 * la lectura la hace un humano — es la regla de la skill /semilla-diaria: volumen SIN intención
 * de herramienta no es señal. `acordes` da 31.090 impresiones y su corpus entero son marcas
 * ajenas (cifra club, ultimate guitar, la cuerda); `escalera` da 9.033 y son Buero Vallejo y
 * escaleras de aluminio. Un script no puede distinguir eso, y fingir que sí sería peor que callar.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────
 * Uso
 * ────────────────────────────────────────────────────────────────────────────────────────────
 *   node scripts/barrido-indexacion.mjs                    # las «Google no reconoce» del baseline
 *   node scripts/barrido-indexacion.mjs --fuera           # las TRES clases que estaban fuera (258)
 *   node scripts/barrido-indexacion.mjs --estado=rastreada # o descubierta | indexada | 404
 *   node scripts/barrido-indexacion.mjs --todo             # sitemap completo (el barrido del 28/09)
 *   node scripts/barrido-indexacion.mjs --demanda          # + sonda de Bing de las que sigan fuera
 *   node scripts/barrido-indexacion.mjs --limite=20        # recorta la lista (pruebas)
 *
 * Requisitos: GSC_SA_KEY_FILE (cuenta de servicio de Search Console) y MWT (Bing Webmaster Tools)
 * en .env.local. Cuota de la URL Inspection API: 2.000 URLs/día por propiedad.
 *
 * ⚠️ La barra final NO es opcional: el sitio es `trailingSlash: true` y sin ella Google responde
 * «no reconoce esta URL» para CUALQUIER página, indexada o no. Un barrido sin barra devuelve un
 * catálogo entero fuera del índice y parece un incendio.
 */
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

dotenv.config({ path: '.env.local' });

const RAIZ = path.resolve(import.meta.dirname, '..');
const BASELINE = path.join(RAIZ, '_private', 'baseline-indexacion-gsc-2026-07-28.csv');
const SITIO = 'https://meskeia.com/';
const INSPECT_API = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';
const BING_API = 'https://ssl.bing.com/webmaster/api.svc/json';
const CONCURRENCIA = 8;

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const valor = (n, def) => (args.find((a) => a.startsWith(`--${n}=`)) || '').split('=')[1] || def;

const LIMITE = Number(valor('limite', 0)) || 0;
const CON_DEMANDA = flag('demanda');
const TODO = flag('todo');
const FUERA = flag('fuera');
const ESTADO = valor('estado', 'no-reconoce');

// Los nombres cortos que se pasan por --estado, contra el texto literal que devuelve Google.
const ESTADOS = {
  'no-reconoce': 'Google no reconoce esta URL',
  rastreada: 'Rastreada: actualmente sin indexar',
  descubierta: 'Descubierta: actualmente sin indexar',
  indexada: 'Enviada e indexada',
  '404': 'No se ha encontrado (404)',
};

// Un estado cuenta como DENTRO del índice solo si Google dice que la indexó. Todo lo demás
// —no reconoce, descubierta, rastreada sin indexar, 404— es una página que no existe para quien
// busca, por mucho que devuelva 200 en producción.
const estaDentro = (estado) => /indexada/i.test(estado || '');

// -------------------------------------------------------------------------------------------------
// Lectura del baseline (CSV con comillas) y del sitemap
// -------------------------------------------------------------------------------------------------
function leerCsv(ruta) {
  const texto = readFileSync(ruta, 'utf8').trim();
  const lineas = texto.split(/\r?\n/);
  const cabecera = partirLinea(lineas[0]);
  return lineas.slice(1).map((l) => {
    const campos = partirLinea(l);
    return Object.fromEntries(cabecera.map((c, i) => [c, campos[i] ?? '']));
  });
}

/** Partidor de línea CSV que respeta las comillas dobles (los campos del baseline las llevan). */
function partirLinea(linea) {
  const out = [];
  let actual = '';
  let dentro = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (c === '"') {
      if (dentro && linea[i + 1] === '"') { actual += '"'; i++; } else dentro = !dentro;
    } else if (c === ',' && !dentro) { out.push(actual); actual = ''; } else actual += c;
  }
  out.push(actual);
  return out;
}

async function urlsDelSitemap() {
  const r = await fetch(`${SITIO}sitemap.xml`);
  if (!r.ok) throw new Error(`El sitemap respondió HTTP ${r.status}`);
  const xml = await r.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((u) => u.startsWith(SITIO));
}

// -------------------------------------------------------------------------------------------------
// URL Inspection API
// -------------------------------------------------------------------------------------------------
async function inspeccionar(cliente, url) {
  try {
    const { data } = await cliente.request({
      url: INSPECT_API,
      method: 'POST',
      data: { inspectionUrl: url, siteUrl: SITIO, languageCode: 'es' },
    });
    const r = data?.inspectionResult?.indexStatusResult ?? {};
    return {
      url,
      estado: r.coverageState ?? '(sin respuesta)',
      veredicto: data?.inspectionResult?.verdict ?? '',
      ultimoRastreo: (r.lastCrawlTime ?? '').slice(0, 10),
      canonicalGoogle: r.googleCanonical ?? '',
    };
  } catch (e) {
    const msg = e?.response?.data?.error?.message ?? e.message ?? String(e);
    return { url, estado: `ERROR: ${msg.slice(0, 80)}`, veredicto: '', ultimoRastreo: '', canonicalGoogle: '' };
  }
}

/** Cola con concurrencia fija: la API admite 600 llamadas/minuto, 8 a la vez va sobrado. */
async function enCola(items, n, tarea) {
  const salida = new Array(items.length);
  let siguiente = 0;
  const trabajador = async () => {
    while (siguiente < items.length) {
      const i = siguiente++;
      salida[i] = await tarea(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, trabajador));
  return salida;
}

// -------------------------------------------------------------------------------------------------
// Sonda de demanda (Bing GetRelatedKeywords) — misma llamada que scratch/kw.mjs, control incluido
// -------------------------------------------------------------------------------------------------
const GENERICOS = new Set([
  'calculadora', 'conversor', 'simulador', 'visualizador', 'generador', 'test', 'quiz', 'guia',
  'selector', 'estimador', 'orientador', 'planificador', 'comparador', 'contador', 'analizador',
  'detector', 'buscador', 'verificador', 'evaluador', 'checklist', 'tabla', 'asistente', 'online',
  'de', 'del', 'la', 'el', 'los', 'las', 'por', 'para', 'con', 'y', 'en', 'un', 'una',
]);

const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ñ/g, 'n');

/**
 * Qué palabra se sonda por cada URL.
 *
 * Se sonda de UNA palabra porque la skill /semilla-diaria lo exige: las de dos devuelven un corpus
 * de relleno. Y esa palabra tiene que estar EN EL SLUG, aunque venga de las `keywords` declaradas
 * en data/applications.ts (que son mejores para la ortografía: «contraseñas» con ñ y tilde, no
 * «contrasenas»). La primera versión cogía la primera keyword de una palabra sin más, y el corpus
 * salía de otro planeta: para /generador-og-images/ sondó «facebook» y devolvió 777.761
 * impresiones de «facebook entrar». Una demanda que no es de la app infla la lista justo donde la
 * lista existe para ordenar por demanda.
 */
function sondaDe(slug, keywordsPorSlug) {
  const slugPlano = sinTildes(slug);
  const declaradas = keywordsPorSlug.get(slug) ?? [];
  const enElSlug = declaradas.find(
    (k) => !k.includes(' ') && !GENERICOS.has(k) && slugPlano.includes(sinTildes(k)),
  );
  if (enElSlug) return enElSlug;
  const trozos = slug.split('-').filter((t) => !GENERICOS.has(t) && t.length > 2);
  if (!trozos.length) return slug.split('-')[0];
  return trozos.sort((a, b) => b.length - a.length)[0];
}

function keywordsDelCatalogo() {
  const mapa = new Map();
  const ts = readFileSync(path.join(RAIZ, 'data', 'applications.ts'), 'utf8');
  // Cada app ocupa una línea y declara url y keywords con comillas DOBLES (un grep con comillas
  // simples devuelve vacío y parece que el fichero está vacío: aviso de la skill /semilla-diaria).
  for (const linea of ts.split(/\r?\n/)) {
    const url = linea.match(/url:\s*"\/([^"]+?)\/?"/);
    if (!url) continue;
    const kws = linea.match(/keywords:\s*\[([^\]]*)\]/);
    const lista = kws ? [...kws[1].matchAll(/"([^"]+)"/g)].map((m) => m[1].toLowerCase()) : [];
    mapa.set(url[1], lista);
  }
  return mapa;
}

async function sondarBing(termino, ventana) {
  const url = `${BING_API}/GetRelatedKeywords?apikey=${process.env.MWT}`
    + `&q=${encodeURIComponent(termino)}&${ventana}`;
  const r = await fetch(url);
  if (!r.ok) return { error: `HTTP ${r.status}`, filas: [] };
  const j = await r.json();
  return { filas: (j.d ?? []).map((x) => ({ kw: x.Query, impr: x.Impressions || 0 })) };
}

// -------------------------------------------------------------------------------------------------
// Programa
// -------------------------------------------------------------------------------------------------
const hoy = new Date().toISOString().slice(0, 10);
console.log(`\n=== BARRIDO DE INDEXACIÓN · ${hoy} · ${SITIO} ===\n`);

if (!process.env.GSC_SA_KEY_FILE || !existsSync(process.env.GSC_SA_KEY_FILE)) {
  console.error('❌ Falta GSC_SA_KEY_FILE en .env.local (clave de la cuenta de servicio de GSC).');
  process.exitCode = 1;
} else {
  const baseline = existsSync(BASELINE) ? leerCsv(BASELINE) : [];
  const estadoBaseline = new Map(baseline.map((f) => [f.url, f.estado]));

  let urls;
  if (TODO) {
    urls = await urlsDelSitemap();
    console.log(`Origen: sitemap de producción · ${urls.length} URLs`);
  } else if (FUERA) {
    // Las tres clases de «fuera» a la vez. Es el barrido que contesta la pregunta útil —de lo que
    // estaba fuera, ¿qué sigue fuera y de eso qué se busca?— sin gastar la cuota en las 723 que ya
    // estaban dentro. El metrónomo enseñó por qué hace falta mirar las tres: estaba «descubierta»
    // en julio y hoy ha RETROCEDIDO a «no reconoce», así que mirar solo un grupo pierde el flujo.
    const fuera = [ESTADOS['no-reconoce'], ESTADOS.descubierta, ESTADOS.rastreada];
    urls = baseline.filter((f) => fuera.includes(f.estado)).map((f) => f.url);
    console.log(`Origen: baseline del 28/07 · las tres clases de FUERA · ${urls.length} URLs`);
  } else {
    const literal = ESTADOS[ESTADO];
    if (!literal) {
      console.error(`❌ --estado=${ESTADO} no existe. Opciones: ${Object.keys(ESTADOS).join(' · ')}`);
      process.exit(1);
    }
    urls = baseline.filter((f) => f.estado === literal).map((f) => f.url);
    console.log(`Origen: baseline del 28/07 · estado «${literal}» · ${urls.length} URLs`);
  }
  if (LIMITE) urls = urls.slice(0, LIMITE);

  // ── Fase 1: preguntarle a Google ───────────────────────────────────────────────────────────
  const key = JSON.parse(readFileSync(process.env.GSC_SA_KEY_FILE, 'utf8'));
  const cliente = new JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  console.log(`Inspeccionando ${urls.length} URLs (concurrencia ${CONCURRENCIA})...\n`);
  let hechas = 0;
  const filas = await enCola(urls, CONCURRENCIA, async (url) => {
    const r = await inspeccionar(cliente, url);
    hechas++;
    if (hechas % 25 === 0 || hechas === urls.length) {
      process.stdout.write(`  ${hechas}/${urls.length}\r`);
    }
    return { ...r, slug: url.replace(SITIO, '').replace(/\/$/, ''), antes: estadoBaseline.get(url) ?? '' };
  });
  console.log(`  ${hechas}/${urls.length}  ✔\n`);

  // ── Movimiento contra el baseline ──────────────────────────────────────────────────────────
  const porEstado = new Map();
  for (const f of filas) porEstado.set(f.estado, (porEstado.get(f.estado) ?? 0) + 1);
  console.log('ESTADO HOY');
  for (const [e, n] of [...porEstado].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(5)}  ${e}`);
  }

  const rescatadas = filas.filter((f) => f.antes && !estaDentro(f.antes) && estaDentro(f.estado));
  const caidas = filas.filter((f) => f.antes && estaDentro(f.antes) && !estaDentro(f.estado));
  console.log(`\nMOVIMIENTO contra el baseline del 28/07`);
  console.log(`  entraron al índice: ${rescatadas.length}`);
  console.log(`  salieron del índice: ${caidas.length}`);
  for (const f of caidas.slice(0, 15)) console.log(`     ↓ /${f.slug}/  (${f.antes} → ${f.estado})`);

  // ── Fase 2: preguntarle a Bing cuánto se busca lo que sigue fuera ──────────────────────────
  const fuera = filas.filter((f) => !estaDentro(f.estado) && !f.estado.startsWith('ERROR'));
  const demanda = new Map();

  if (CON_DEMANDA && fuera.length) {
    if (!process.env.MWT) {
      console.error('\n⚠️  Falta MWT en .env.local: no se puede sondar la demanda. CSV sin esas columnas.');
    } else {
      const hasta = new Date();
      const desde = new Date(hasta.getTime() - 6 * 30 * 864e5);
      const iso = (d) => `${d.toISOString().slice(0, 19)}Z`;
      const ventana = `startDate=${iso(desde)}&endDate=${iso(hasta)}&country=es&language=es-ES`;

      // CONTROL DEL INSTRUMENTO, no negociable (el endpoint responde 200 con lista VACÍA cuando
      // la pregunta está mal formada, y un cero así se lee como «no hay demanda»).
      const control = await sondarBing('hipoteca', ventana);
      if (control.error || control.filas.length < 10) {
        console.error(`\n🚨 CONTROL FALLIDO: «hipoteca» devolvió ${control.error ?? `${control.filas.length} keywords`}.`);
        console.error('   El instrumento no está midiendo: NO interpretes ningún cero. Sonda omitida.');
        process.exitCode = 2;
      } else {
        console.log(`\n✅ control «hipoteca»: ${control.filas.length} keywords\n`);
        const kwCatalogo = keywordsDelCatalogo();
        console.log(`DEMANDA de las ${fuera.length} que siguen fuera del índice (Bing, 6 meses)\n`);
        for (const f of fuera) {
          const termino = sondaDe(f.slug, kwCatalogo);
          const r = await sondarBing(termino, ventana);
          const total = r.filas.reduce((a, b) => a + b.impr, 0);
          const top = r.filas.slice().sort((a, b) => b.impr - a.impr).slice(0, 3).map((x) => x.kw);
          demanda.set(f.url, { termino, total, n: r.filas.length, top });
        }
        const orden = [...demanda.entries()].sort((a, b) => b[1].total - a[1].total);
        for (const [url, d] of orden) {
          if (!d.total) continue;
          const slug = url.replace(SITIO, '').replace(/\/$/, '');
          console.log(`  ${String(d.total).padStart(8)} impr  «${d.termino}»`.padEnd(34)
            + `  /${slug}/`);
          console.log(`           ${d.top.join(' · ')}`);
        }
        const mudas = orden.filter(([, d]) => !d.total).length;
        console.log(`\n  (${mudas} sin ninguna demanda medible: ahí no hay nada que rescatar)`);
        console.log('  ⚠️  El volumen NO es el criterio: hay que LEER el corpus. Un corpus de marcas');
        console.log('      ajenas o de otro tema no es demanda de herramienta, por alto que sume.');
      }
    }
  }

  // ── CSV ────────────────────────────────────────────────────────────────────────────────────
  const destino = path.join(RAIZ, '_private', `indexacion-${hoy}.csv`);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const cab = 'url,slug,estado_hoy,estado_baseline,ultimo_rastreo,canonical_google,sonda,impresiones_bing,top_keywords';
  const cuerpo = filas.map((f) => {
    const d = demanda.get(f.url);
    return [f.url, f.slug, f.estado, f.antes, f.ultimoRastreo, f.canonicalGoogle,
      d?.termino ?? '', d?.total ?? '', (d?.top ?? []).join(' | ')].map(esc).join(',');
  });
  writeFileSync(destino, [cab, ...cuerpo].join('\n') + '\n', 'utf8');
  console.log(`\n→ ${path.relative(RAIZ, destino)}  (${filas.length} filas)\n`);
}
