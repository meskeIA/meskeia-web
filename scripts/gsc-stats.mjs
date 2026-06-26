#!/usr/bin/env node
/**
 * gsc-stats.mjs — Lector de Google Search Console para los verticales meskeIA
 *
 * Usa una cuenta de servicio (solo lectura) para consultar la Search Console API
 * de todas las propiedades a las que tenga acceso el email de la SA.
 *
 * Requisitos previos:
 *   1. .credentials/gsc-service-account.json  (clave de la cuenta de servicio, gitignored)
 *   2. .env.local con GSC_SA_KEY_FILE=.credentials/gsc-service-account.json
 *   3. El email de la SA añadido como usuario (Restringido) en cada propiedad de GSC.
 *
 * Uso:
 *   node scripts/gsc-stats.mjs                # últimos 28 días, todas las propiedades
 *   node scripts/gsc-stats.mjs 90             # últimos 90 días
 *   node scripts/gsc-stats.mjs 28 delegum     # filtra propiedades que contengan "delegum"
 *   node scripts/gsc-stats.mjs 28 all json    # vuelca JSON crudo (para análisis posterior)
 */

import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';

dotenv.config({ path: '.env.local' });

const API = 'https://www.googleapis.com/webmasters/v3';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

// --- Argumentos -----------------------------------------------------------
const dias = parseInt(process.argv[2], 10) || 28;
const filtro = (process.argv[3] || 'all').toLowerCase();
const formatoJson = (process.argv[4] || '').toLowerCase() === 'json';

// --- Fechas (la API de GSC tiene ~2-3 días de retardo) --------------------
function ymd(d) {
  return d.toISOString().slice(0, 10);
}
const hoy = new Date();
const fin = new Date(hoy);
fin.setDate(fin.getDate() - 3); // margen por el retardo de datos
const inicio = new Date(fin);
inicio.setDate(inicio.getDate() - dias);
const startDate = ymd(inicio);
const endDate = ymd(fin);

// --- Formato español ------------------------------------------------------
const nf = new Intl.NumberFormat('es-ES');
const nf1 = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const pf = new Intl.NumberFormat('es-ES', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });

// --- Cliente autenticado --------------------------------------------------
function crearCliente() {
  const keyFile = process.env.GSC_SA_KEY_FILE;
  if (!keyFile) {
    console.error('❌ Falta GSC_SA_KEY_FILE en .env.local');
    process.exit(1);
  }
  const key = JSON.parse(readFileSync(keyFile, 'utf8'));
  return new JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: [SCOPE],
  });
}

async function apiGet(client, path) {
  const res = await client.request({ url: `${API}${path}` });
  return res.data;
}

async function apiPost(client, path, body) {
  const res = await client.request({ url: `${API}${path}`, method: 'POST', data: body });
  return res.data;
}

async function consultar(client, siteUrl, dimensions, rowLimit = 10) {
  const enc = encodeURIComponent(siteUrl);
  const data = await apiPost(client, `/sites/${enc}/searchAnalytics/query`, {
    startDate,
    endDate,
    dimensions,
    rowLimit,
  });
  return data.rows || [];
}

// --- Render ---------------------------------------------------------------
function tabla(titulo, rows, etiquetaDim) {
  if (!rows.length) {
    console.log(`\n  ${titulo}: (sin datos)`);
    return;
  }
  console.log(`\n  ${titulo}`);
  for (const r of rows) {
    const k = r.keys[0];
    const clics = nf.format(r.clicks).padStart(6);
    const impr = nf.format(r.impressions).padStart(8);
    const ctr = pf.format(r.ctr).padStart(7);
    const pos = nf1.format(r.position).padStart(5);
    const label = String(k).length > 48 ? String(k).slice(0, 47) + '…' : k;
    console.log(`    ${clics} clics  ${impr} impr  CTR ${ctr}  pos ${pos}  ${label}`);
  }
}

async function analizarSitio(client, siteUrl) {
  const [total] = await consultar(client, siteUrl, [], 1);
  console.log('\n' + '═'.repeat(78));
  console.log(`📊 ${siteUrl}`);
  console.log('═'.repeat(78));
  if (!total) {
    console.log('  (sin datos en el periodo)');
    return null;
  }
  console.log(
    `  TOTAL → ${nf.format(total.clicks)} clics · ${nf.format(total.impressions)} impresiones · ` +
      `CTR ${pf.format(total.ctr)} · posición media ${nf1.format(total.position)}`,
  );

  const [queries, pages, countries] = await Promise.all([
    consultar(client, siteUrl, ['query'], 10),
    consultar(client, siteUrl, ['page'], 10),
    consultar(client, siteUrl, ['country'], 8),
  ]);
  tabla('Top consultas (queries)', queries);
  tabla('Top páginas', pages);
  tabla('Top países', countries);

  return { siteUrl, total, queries, pages, countries };
}

// --- Main -----------------------------------------------------------------
(async () => {
  const client = crearCliente();

  // Lista de propiedades accesibles por la cuenta de servicio
  let sites;
  try {
    const data = await apiGet(client, '/sites');
    sites = (data.siteEntry || []).filter((s) => s.permissionLevel !== 'siteUnverifiedUser');
  } catch (e) {
    console.error('❌ Error autenticando o listando propiedades:', e.response?.data?.error?.message || e.message);
    console.error('   ¿Has añadido el email de la cuenta de servicio como usuario en GSC?');
    process.exit(1);
  }

  if (!sites.length) {
    console.error('⚠️  La cuenta de servicio no tiene acceso a ninguna propiedad todavía.');
    console.error('   Añádela en GSC → Ajustes → Usuarios y permisos → Añadir usuario.');
    process.exit(1);
  }

  let objetivo = sites.map((s) => s.siteUrl);
  if (filtro !== 'all') {
    objetivo = objetivo.filter((u) => u.toLowerCase().includes(filtro));
  }

  console.log(`\n🔎 Periodo: ${startDate} → ${endDate} (${dias} días)`);
  console.log(`🌐 Propiedades accesibles: ${sites.map((s) => s.siteUrl).join(', ')}`);
  if (filtro !== 'all') console.log(`   Filtrando por: "${filtro}"`);

  const resultados = [];
  for (const siteUrl of objetivo) {
    const r = await analizarSitio(client, siteUrl);
    if (r) resultados.push(r);
  }

  if (formatoJson) {
    console.log('\n' + '─'.repeat(78));
    console.log('JSON_CRUDO_INICIO');
    console.log(JSON.stringify({ periodo: { startDate, endDate, dias }, resultados }, null, 2));
    console.log('JSON_CRUDO_FIN');
  }

  console.log('\n✅ Hecho.\n');
})();
