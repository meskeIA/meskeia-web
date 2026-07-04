#!/usr/bin/env node
/**
 * gsc-inspect.mjs — Inspector de URLs de Google Search Console
 *
 * Usa la URL Inspection API (v1) para pedir a Google el estado de indexación,
 * canonical detectado, estado de rastreo y verdict de una o varias URLs.
 *
 * Uso:
 *   node scripts/gsc-inspect.mjs sc-domain:cronicum.com https://cronicum.com/ https://www.cronicum.com/
 */
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';

dotenv.config({ path: '.env.local' });
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const INSPECT_API = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';

const key = JSON.parse(readFileSync(process.env.GSC_SA_KEY_FILE, 'utf8'));
const client = new JWT({ email: key.client_email, key: key.private_key, scopes: [SCOPE] });

const siteUrl = process.argv[2];
const urls = process.argv.slice(3);
if (!siteUrl || !urls.length) {
  console.error('Uso: node scripts/gsc-inspect.mjs <siteUrl> <url1> [url2 ...]');
  process.exit(1);
}

async function inspect(inspectionUrl) {
  try {
    const res = await client.request({
      url: INSPECT_API,
      method: 'POST',
      data: { inspectionUrl, siteUrl, languageCode: 'es' },
    });
    return res.data.inspectionResult;
  } catch (e) {
    return { error: e.response?.data?.error?.message || e.message };
  }
}

for (const u of urls) {
  const r = await inspect(u);
  console.log('\n' + '─'.repeat(70));
  console.log('URL:', u);
  if (r.error) { console.log('  ERROR:', r.error); continue; }
  const idx = r.indexStatusResult || {};
  console.log('  verdict            :', idx.verdict);
  console.log('  coverageState      :', idx.coverageState);
  console.log('  robotsTxtState     :', idx.robotsTxtState);
  console.log('  indexingState      :', idx.indexingState);
  console.log('  pageFetchState     :', idx.pageFetchState);
  console.log('  crawledAs          :', idx.crawledAs);
  console.log('  lastCrawlTime      :', idx.lastCrawlTime);
  console.log('  googleCanonical    :', idx.googleCanonical);
  console.log('  userCanonical      :', idx.userCanonical);
  if (idx.referringUrls) console.log('  referringUrls      :', idx.referringUrls);
  if (idx.sitemap) console.log('  sitemap            :', idx.sitemap);
}
console.log('');
