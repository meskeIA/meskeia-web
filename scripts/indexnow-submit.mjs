/**
 * IndexNow — Notifica a Bing de todas las URLs de meskeIA
 *
 * Uso: node scripts/indexnow-submit.mjs
 * Uso (solo nuevas): node scripts/indexnow-submit.mjs --since 2026-05-20
 *
 * Ejecutar después de cada deploy con apps nuevas.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const KEY = '80da70e0cb13494ab83244ace915415e';
const HOST = 'meskeia.com';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const INDEXNOW_ENDPOINT = 'https://www.bing.com/indexnow';
const BATCH_SIZE = 500; // Bing recomienda lotes de ≤500

// Páginas estáticas principales (no están en ai-index.json)
const STATIC_PAGES = [
  `https://${HOST}/`,
  `https://${HOST}/apps/`,
  `https://${HOST}/acerca/`,
  `https://${HOST}/privacidad/`,
  `https://${HOST}/terminos/`,
  `https://${HOST}/contacto/`,
  `https://${HOST}/guia/comprar-casa/`,
  `https://${HOST}/guia/freelance/`,
  `https://${HOST}/guia/invertir/`,
];

function extractUrls() {
  const indexPath = resolve(ROOT, 'public', 'ai-index.json');
  const raw = JSON.parse(readFileSync(indexPath, 'utf-8'));

  const urls = new Set(STATIC_PAGES);

  for (const tool of raw.tools ?? []) {
    if (tool.url) urls.add(tool.url);
  }

  return [...urls];
}

async function submitBatch(urls, batchIndex, total) {
  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    }),
  });

  const label = `Lote ${batchIndex} (${urls.length} URLs)`;
  if (response.ok || response.status === 202) {
    console.log(`✅ ${label} — enviado (${response.status})`);
  } else {
    const text = await response.text().catch(() => '');
    console.error(`❌ ${label} — error ${response.status}: ${text}`);
  }
}

async function main() {
  const urls = extractUrls();
  console.log(`\n📡 IndexNow — meskeIA`);
  console.log(`   Host:  ${HOST}`);
  console.log(`   URLs:  ${urls.length}`);
  console.log(`   Lotes: ${Math.ceil(urls.length / BATCH_SIZE)}\n`);

  let batchIndex = 1;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    await submitBatch(batch, batchIndex++, urls.length);
    if (i + BATCH_SIZE < urls.length) {
      await new Promise(r => setTimeout(r, 1000)); // pausa entre lotes
    }
  }

  console.log('\n✅ Envío completado. Bing procesará las URLs en las próximas horas.');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
