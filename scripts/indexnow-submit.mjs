/**
 * IndexNow — Notifica a Bing de las URLs de meskeIA y sus 4 verticales.
 *
 * Fuente de verdad: el sitemap EN VIVO de cada dominio (así nunca se
 * desincroniza del catálogo real). Cada dominio recibe SOLO las URLs cuyo
 * canonical le pertenece:
 *   - meskeia.com  → todo el catálogo de apps
 *   - delegum.com  → portal fiscal (datos-fiscales, soluciones, blog…)
 *   - cronicum.com → home + puertas + cronologías
 *   - stemum.com   → home + disciplinas
 *   - coquinum.com → home + categorías
 *
 * La misma clave (public/<KEY>.txt) se sirve en los 5 dominios (el proxy deja
 * pasar los .txt estáticos), así que valida todos los hosts.
 *
 * Uso:
 *   node scripts/indexnow-submit.mjs                  → los 5 dominios
 *   node scripts/indexnow-submit.mjs delegum.com      → solo ese dominio
 *   node scripts/indexnow-submit.mjs --dry            → previsualiza, no envía
 *
 * Ejecutar después de un deploy con apps/páginas nuevas.
 */

const KEY = '80da70e0cb13494ab83244ace915415e';
const INDEXNOW_ENDPOINT = 'https://www.bing.com/indexnow';
const BATCH_SIZE = 500; // Bing recomienda lotes de ≤500

// Dominios cuyo sitemap propio define su conjunto de URLs canónicas.
const HOSTS = ['meskeia.com', 'delegum.com', 'cronicum.com', 'stemum.com', 'coquinum.com'];

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const hostFilter = args.filter((a) => !a.startsWith('--'));
const hosts = hostFilter.length ? hostFilter : HOSTS;

/** Descarga el sitemap del host y extrae las URLs (<loc>). */
async function urlsForHost(host) {
  const res = await fetch(`https://${host}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  return [...new Set(locs)];
}

/** Envía un lote de URLs de un host concreto a Bing IndexNow. */
async function submitBatch(host, urls, batchIndex) {
  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: KEY,
      keyLocation: `https://${host}/${KEY}.txt`,
      urlList: urls,
    }),
  });

  const label = `   Lote ${batchIndex} (${urls.length} URLs)`;
  if (response.ok || response.status === 202) {
    console.log(`   ✅ ${label} — enviado (${response.status})`);
  } else {
    const text = await response.text().catch(() => '');
    console.error(`   ❌ ${label} — error ${response.status}: ${text}`);
  }
}

async function processHost(host) {
  let urls;
  try {
    urls = await urlsForHost(host);
  } catch (err) {
    console.error(`\n❌ ${host} — no se pudo leer el sitemap: ${err.message}`);
    return;
  }

  const lotes = Math.ceil(urls.length / BATCH_SIZE);
  console.log(`\n📡 ${host} — ${urls.length} URLs (${lotes} lote${lotes === 1 ? '' : 's'})`);

  if (DRY) {
    console.log(`   🔎 dry-run: no se envía nada. Ejemplos:`);
    urls.slice(0, 3).forEach((u) => console.log(`      · ${u}`));
    return;
  }

  let batchIndex = 1;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    await submitBatch(host, urls.slice(i, i + BATCH_SIZE), batchIndex++);
    if (i + BATCH_SIZE < urls.length) {
      await new Promise((r) => setTimeout(r, 1000)); // pausa entre lotes
    }
  }
}

async function main() {
  console.log(`\n📡 IndexNow${DRY ? ' (dry-run)' : ''} — ${hosts.length} dominio(s)`);
  for (const host of hosts) {
    await processHost(host);
  }
  console.log(
    DRY
      ? '\n🔎 dry-run completado (sin envíos).'
      : '\n✅ Envío completado. Bing procesará las URLs en las próximas horas.',
  );
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
