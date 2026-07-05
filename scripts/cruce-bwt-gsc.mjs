#!/usr/bin/env node
/**
 * cruce-bwt-gsc.mjs — Cruce Bing Webmaster Tools × Google Search Console
 *
 * Objetivo: mapear "qué consultas reales llevan a meskeia.com" cruzando ambos
 * índices a nivel de PÁGINA/APP (unidad estable) con ejemplos de consulta debajo.
 * No filtra por volumen (el foso es cola larga = bajo volumen); solo normaliza
 * y marca artefactos para curación posterior.
 *
 * Uso:
 *   node scripts/cruce-bwt-gsc.mjs [dominio] [diasGSC] [salida.json]
 *   node scripts/cruce-bwt-gsc.mjs meskeia 90 scratch/cruce.json
 *
 * Requisitos (.env.local): GSC_SA_KEY_FILE, MWT
 */

import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'node:fs';

dotenv.config({ path: '.env.local' });

const DOMINIO = (process.argv[2] || 'meskeia').toLowerCase();
const DIAS_GSC = parseInt(process.argv[3], 10) || 90;
const SALIDA = process.argv[4] || null;

const GSC_API = 'https://www.googleapis.com/webmasters/v3';
const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const BING_API = 'https://ssl.bing.com/webmaster/api.svc/json';
const MWT = process.env.MWT;

// --- Normalización de consultas ------------------------------------------
function norm(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .replace(/\s+/g, ' ')
    .trim();
}
// slug de app desde una URL
function appDe(url) {
  try {
    const p = new URL(url).pathname;
    return p === '/' ? '(home)' : p.replace(/^\/|\/$/g, '');
  } catch {
    return url;
  }
}

// --- GSC ------------------------------------------------------------------
function ymd(d) { return d.toISOString().slice(0, 10); }
const hoy = new Date();
const fin = new Date(hoy); fin.setDate(fin.getDate() - 3);
const inicio = new Date(fin); inicio.setDate(inicio.getDate() - DIAS_GSC);
const startDate = ymd(inicio), endDate = ymd(fin);

function gscClient() {
  const key = JSON.parse(readFileSync(process.env.GSC_SA_KEY_FILE, 'utf8'));
  return new JWT({ email: key.client_email, key: key.private_key, scopes: [GSC_SCOPE] });
}
async function gscQuery(client, siteUrl, dimensions, rowLimit = 25000) {
  const enc = encodeURIComponent(siteUrl);
  const res = await client.request({
    url: `${GSC_API}/sites/${enc}/searchAnalytics/query`,
    method: 'POST',
    data: { startDate, endDate, dimensions, rowLimit },
  });
  return res.data.rows || [];
}
async function gscSites(client) {
  const res = await client.request({ url: `${GSC_API}/sites` });
  return (res.data.siteEntry || []).map((s) => s.siteUrl);
}

// --- Bing -----------------------------------------------------------------
async function bing(method, siteUrl) {
  const url = `${BING_API}/${method}?apikey=${encodeURIComponent(MWT)}&siteUrl=${encodeURIComponent(siteUrl)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${method}`);
  return (await res.json()).d || [];
}
// Bing entrega filas por día → agregar por etiqueta
function bingAgg(rows, campo) {
  const m = new Map();
  for (const r of rows) {
    const k = String(r[campo] ?? '');
    const g = m.get(k) || { clicks: 0, impr: 0, posImpr: 0 };
    g.clicks += r.Clicks ?? 0;
    g.impr += r.Impressions ?? 0;
    if (r.AvgImpressionPosition != null) g.posImpr += r.AvgImpressionPosition * (r.Impressions ?? 0);
    m.set(k, g);
  }
  return [...m.entries()].map(([label, g]) => ({
    label, clicks: g.clicks, impr: g.impr, pos: g.impr ? +(g.posImpr / g.impr).toFixed(1) : null,
  }));
}

(async () => {
  if (!MWT) { console.error('❌ Falta MWT'); process.exit(1); }
  const client = gscClient();

  // Resolver la siteUrl de GSC que corresponde al dominio pedido
  const sites = await gscSites(client);
  const gscSite = sites.find((u) => u.toLowerCase().includes(DOMINIO));
  const bingSite = `https://${DOMINIO}.com/`;
  console.log(`GSC site: ${gscSite || '(no encontrada)'} | Bing site: ${bingSite}`);
  console.log(`Ventana GSC: ${startDate} → ${endDate} (${DIAS_GSC}d) · Bing: ventana fija ~6m\n`);

  // --- Pulls en paralelo ---
  const [gscPages, gscQ, gscQP, bingQraw, bingPraw] = await Promise.all([
    gscSite ? gscQuery(client, gscSite, ['page'], 5000) : [],
    gscSite ? gscQuery(client, gscSite, ['query'], 25000) : [],
    gscSite ? gscQuery(client, gscSite, ['query', 'page'], 25000) : [],
    bing('GetQueryStats', bingSite).catch((e) => { console.log('Bing Q err:', e.message); return []; }),
    bing('GetPageStats', bingSite).catch((e) => { console.log('Bing P err:', e.message); return []; }),
  ]);

  const bingQ = bingAgg(bingQraw, 'Query');
  const bingP = bingAgg(bingPraw, 'Query'); // en GetPageStats la URL viene en Query

  console.log(`GSC → ${gscQ.length} queries, ${gscPages.length} pages, ${gscQP.length} pares q+p`);
  console.log(`Bing → ${bingQ.length} queries, ${bingP.length} pages`);

  // --- Cruce a nivel de APP ---
  const apps = new Map(); // slug → { gsc:{clicks,impr}, bing:{clicks,impr}, queriesGSC:[], url }
  function get(slug, url) {
    if (!apps.has(slug)) apps.set(slug, { slug, url, gscClicks: 0, gscImpr: 0, bingClicks: 0, bingImpr: 0, queriesGSC: [] });
    return apps.get(slug);
  }
  for (const r of gscPages) {
    const url = r.keys[0]; const a = get(appDe(url), url);
    a.gscClicks += r.clicks; a.gscImpr += r.impressions;
  }
  for (const r of bingP) {
    const url = r.label; if (!url.startsWith('http')) continue;
    const a = get(appDe(url), url);
    a.bingClicks += r.clicks; a.bingImpr += r.impr;
  }
  // queries GSC mapeadas a su app (query+page)
  for (const r of gscQP) {
    const [q, url] = r.keys; const a = get(appDe(url), url);
    a.queriesGSC.push({ q, clicks: r.clicks, impr: r.impressions, pos: +r.position.toFixed(1), ctr: +(r.ctr).toFixed(3) });
  }
  for (const a of apps.values()) a.queriesGSC.sort((x, y) => y.clicks - x.clicks || y.impr - x.impr);

  const appList = [...apps.values()].map((a) => ({
    ...a,
    enAmbos: a.gscImpr > 0 && a.bingImpr > 0,
    totalClicks: a.gscClicks + a.bingClicks,
  })).sort((x, y) => (y.enAmbos - x.enAmbos) || (y.totalClicks - x.totalClicks));

  // --- Listas de consultas normalizadas para curación ---
  const gscQueries = gscQ.map((r) => ({
    q: r.keys[0], qn: norm(r.keys[0]), clicks: r.clicks, impr: r.impressions,
    pos: +r.position.toFixed(1), ctr: +(r.ctr).toFixed(3), motor: 'google',
  }));
  const bingQueries = bingQ.map((r) => ({
    q: r.label, qn: norm(r.label), clicks: r.clicks, impr: r.impr, pos: r.pos,
    ctr: r.impr ? +(r.clicks / r.impr).toFixed(3) : null, motor: 'bing',
  }));

  // Consultas que aparecen (normalizadas) en AMBOS motores → señal fuerte
  const setBing = new Map(bingQueries.map((b) => [b.qn, b]));
  const enAmbosQ = gscQueries.filter((g) => setBing.has(g.qn)).map((g) => ({
    qn: g.qn, google: { clicks: g.clicks, impr: g.impr, pos: g.pos },
    bing: { clicks: setBing.get(g.qn).clicks, impr: setBing.get(g.qn).impr, pos: setBing.get(g.qn).pos },
  }));

  const out = {
    meta: { dominio: DOMINIO, gscSite, bingSite, startDate, endDate, diasGSC: DIAS_GSC, generado: endDate },
    resumen: {
      appsConGSC: appList.filter((a) => a.gscImpr > 0).length,
      appsConBing: appList.filter((a) => a.bingImpr > 0).length,
      appsEnAmbos: appList.filter((a) => a.enAmbos).length,
      queriesGoogle: gscQueries.length, queriesBing: bingQueries.length,
      queriesEnAmbos: enAmbosQ.length,
    },
    appList,
    gscQueries: gscQueries.sort((a, b) => b.clicks - a.clicks || b.impr - a.impr),
    bingQueries: bingQueries.sort((a, b) => b.clicks - a.clicks || b.impr - a.impr),
    enAmbosQ,
  };

  console.log('\nRESUMEN:', JSON.stringify(out.resumen, null, 2));

  if (SALIDA) {
    writeFileSync(SALIDA, JSON.stringify(out, null, 2));
    console.log(`\n✅ Volcado a ${SALIDA}`);
  }
})();
