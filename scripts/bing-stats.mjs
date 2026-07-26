#!/usr/bin/env node
/**
 * bing-stats.mjs — Lector de Bing Webmaster Tools para los verticales meskeIA
 *
 * Análogo a gsc-stats.mjs pero para Bing (índice que alimenta el grounding de
 * ChatGPT y Copilot). Usa la API key de WMT (a nivel de cuenta: una sola clave
 * cubre las 5 propiedades verificadas).
 *
 * Requisitos:
 *   .env.local con MWT=<api key de Bing Webmaster Tools>
 *
 * Uso:
 *   node scripts/bing-stats.mjs              # las 5 propiedades
 *   node scripts/bing-stats.mjs delegum      # filtra por subcadena
 *
 * Qué imprime por propiedad:
 *   TOTAL    clics e impresiones de la ventana que entrega Bing
 *   ÍNDICE   páginas en el índice (termómetro del grounding IA) y su delta
 *   RASTREO  códigos de respuesta que Bing recibe: 4xx, 5xx, 301, bloqueadas
 *            por robots, fallos de red — con la tendencia de los últimos 28 días
 *            frente a los 28 previos. Es la ÚNICA fuente automática de 404/5xx:
 *            GSC no expone el informe de Indexación por API, solo el export
 *            manual. Aquí no hay lista de URLs, pero sí la señal de cuándo
 *            merece la pena pedirla.
 *   Top consultas y top páginas
 *
 * Nota: la API de Bing devuelve ventanas fijas (~6 meses), no admite rango de
 * fechas configurable como GSC. Se reporta lo que Bing entrega.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API = 'https://ssl.bing.com/webmaster/api.svc/json';
const KEY = process.env.MWT;

const SITES = [
  'https://meskeia.com/',
  'https://cronicum.com/',
  'https://delegum.com/',
  'https://stemum.com/',
  'https://coquinum.com/',
];

const filtro = (process.argv[2] || '').toLowerCase();

// Formato español
const nf = new Intl.NumberFormat('es-ES');
const nf1 = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

if (!KEY) {
  console.error('❌ Falta MWT en .env.local');
  process.exit(1);
}

// Las fechas de Bing llegan como "/Date(1719446400000)/" (epoch ms).
function parseMsDate(s) {
  const m = String(s).match(/\d+/);
  return m ? new Date(parseInt(m[0], 10)) : null;
}

async function bing(method, siteUrl) {
  const url = `${API}/${method}?apikey=${encodeURIComponent(KEY)}&siteUrl=${encodeURIComponent(siteUrl)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${method}`);
  const json = await res.json();
  return json.d || [];
}

function tabla(titulo, rows, campoLabel) {
  if (!rows.length) {
    console.log(`\n  ${titulo}: (sin datos)`);
    return;
  }
  // Bing entrega filas por día → agregar por etiqueta (query/página). La posición
  // se promedia ponderada por impresiones (más fiel que la media simple).
  const grupos = new Map();
  for (const r of rows) {
    const k = String(r[campoLabel] ?? '');
    const g = grupos.get(k) || { clicks: 0, impr: 0, posImpr: 0 };
    g.clicks += r.Clicks ?? 0;
    g.impr += r.Impressions ?? 0;
    if (r.AvgImpressionPosition != null) g.posImpr += (r.AvgImpressionPosition) * (r.Impressions ?? 0);
    grupos.set(k, g);
  }
  const top = [...grupos.entries()]
    .map(([label, g]) => ({ label, ...g, pos: g.impr ? g.posImpr / g.impr : null }))
    .sort((a, b) => (b.clicks - a.clicks) || (b.impr - a.impr))
    .slice(0, 10);
  console.log(`\n  ${titulo}`);
  for (const r of top) {
    const clics = nf.format(r.clicks).padStart(5);
    const impr = nf.format(r.impr).padStart(7);
    const pos = r.pos != null ? nf1.format(r.pos).padStart(5) : '   — ';
    let label = r.label;
    if (label.length > 48) label = label.slice(0, 47) + '…';
    console.log(`    ${clics} clics  ${impr} impr  pos ${pos}  ${label}`);
  }
}

async function analizarSitio(siteUrl) {
  console.log('\n' + '═'.repeat(78));
  console.log(`📊 ${siteUrl}`);
  console.log('═'.repeat(78));

  let trafico = [];
  try {
    trafico = await bing('GetRankAndTrafficStats', siteUrl);
  } catch (e) {
    console.log('  Error:', e.message);
    return;
  }

  const totalClicks = trafico.reduce((a, r) => a + (r.Clicks ?? 0), 0);
  const totalImpr = trafico.reduce((a, r) => a + (r.Impressions ?? 0), 0);
  const fechas = trafico.map((r) => parseMsDate(r.Date)).filter(Boolean).sort((a, b) => a - b);
  const rango =
    fechas.length > 1
      ? `${fechas[0].toLocaleDateString('es-ES')} → ${fechas[fechas.length - 1].toLocaleDateString('es-ES')}`
      : '(periodo que entrega Bing)';

  console.log(
    `  TOTAL → ${nf.format(totalClicks)} clics · ${nf.format(totalImpr)} impresiones  [${rango}]`,
  );

  // Rastreo e indexación (GetCrawlStats): InIndex es el termómetro de cobertura
  // — cuántas páginas mantiene Bing en su índice (el que alimenta el grounding IA).
  try {
    const crawl = await bing('GetCrawlStats', siteUrl);
    const conFecha = crawl
      .map((r) => ({ ...r, d: parseMsDate(r.Date) }))
      .filter((r) => r.d)
      .sort((a, b) => a.d - b.d);
    if (conFecha.length) {
      const prim = conFecha[0];
      const ult = conFecha[conFecha.length - 1];
      const crawledTot = crawl.reduce((a, r) => a + (r.CrawledPages ?? 0), 0);
      const errTot = crawl.reduce((a, r) => a + (r.CrawlErrors ?? 0), 0);
      const delta = ult.InIndex != null && prim.InIndex != null ? ult.InIndex - prim.InIndex : null;
      const flecha = delta == null ? '' : delta > 0 ? ' ▲' : delta < 0 ? ' ▼' : ' =';
      console.log(
        `  ÍNDICE → ${nf.format(ult.InIndex ?? 0)} págs en índice` +
          (delta != null ? ` (${delta >= 0 ? '+' : ''}${nf.format(delta)}${flecha} desde ${prim.d.toLocaleDateString('es-ES')})` : '') +
          `  ·  rastreadas ${nf.format(crawledTot)} · errores ${nf.format(errTot)}`,
      );

      // Salud de rastreo: los códigos que Bing recibe al rastrear el sitio.
      // Es la ÚNICA fuente automática de 404/5xx del ecosistema — GSC no expone
      // el informe de Indexación por API (solo el export manual). Aquí no hay
      // lista de URLs, pero sí la SEÑAL: si sube, entonces toca pedir el export.
      const suma = (filas, campo) => filas.reduce((a, r) => a + (r[campo] ?? 0), 0);
      const c4xx = suma(conFecha, 'Code4xx');
      const c5xx = suma(conFecha, 'Code5xx');
      const c301 = suma(conFecha, 'Code301');
      const robots = suma(conFecha, 'BlockedByRobotsTxt');
      const fallosRed = suma(conFecha, 'ConnectionTimeout') + suma(conFecha, 'DnsFailures');
      const malware = suma(conFecha, 'ContainsMalware');

      const partes = [`${nf.format(c4xx)} 4xx`, `${nf.format(c5xx)} 5xx`];
      if (c301) partes.push(`${nf.format(c301)} 301`);
      if (robots) partes.push(`${nf.format(robots)} bloqueadas por robots`);
      if (fallosRed) partes.push(`${nf.format(fallosRed)} fallos de red`);
      if (malware) partes.push(`⛔ ${nf.format(malware)} con malware`);
      console.log(`  RASTREO → ${partes.join(' · ')}  [${conFecha.length} días]`);

      // Tendencia: sin serie, un número absoluto no dice nada. Se comparan los
      // últimos 28 días con los 28 previos (si Bing entrega bastante historia).
      const VENTANA = 28;
      const recientes = conFecha.slice(-VENTANA);
      const previas = conFecha.slice(-VENTANA * 2, -VENTANA);
      if (previas.length >= VENTANA / 2) {
        const r4 = suma(recientes, 'Code4xx');
        const p4 = suma(previas, 'Code4xx');
        const r5 = suma(recientes, 'Code5xx');
        const variacion = p4 > 0 ? ((r4 - p4) / p4) * 100 : null;
        const signo = variacion == null ? '' : variacion > 0 ? '▲ +' : variacion < 0 ? '▼ ' : '= ';
        const alerta = r5 > 0 || (variacion != null && variacion > 25);
        console.log(
          `     últimos ${VENTANA} d: ${nf.format(r4)} 4xx` +
            (variacion != null ? ` (${signo}${nf1.format(Math.abs(variacion))} % vs ${VENTANA} d previos)` : '') +
            ` · ${nf.format(r5)} 5xx${alerta ? '   ⚠️' : ''}`,
        );
        if (alerta) {
          console.log(
            '     → señal activa: pedir el export de URLs en GSC → Indexación → Páginas' +
              (r5 > 0 ? ' (los 5xx son errores de servidor: mirar primero)' : ''),
          );
        }
      }
    }
  } catch {
    /* GetCrawlStats puede no estar disponible en alguna propiedad; se omite en silencio */
  }

  if (totalImpr === 0) {
    console.log('  (sin actividad en Bing todavía)');
    return;
  }

  const [queries, pages] = await Promise.all([
    bing('GetQueryStats', siteUrl).catch(() => []),
    bing('GetPageStats', siteUrl).catch(() => []),
  ]);
  tabla('Top consultas (queries)', queries, 'Query');
  // GetPageStats reutiliza el tipo QueryStats: la URL de la página viene en `Query`.
  tabla('Top páginas', pages, 'Query');
}

(async () => {
  const objetivo = filtro ? SITES.filter((s) => s.toLowerCase().includes(filtro)) : SITES;
  console.log(`\n🔎 Bing Webmaster Tools — ${objetivo.length} propiedad(es)`);
  if (filtro) console.log(`   Filtrando por: "${filtro}"`);
  for (const s of objetivo) {
    await analizarSitio(s);
  }
  console.log('\n✅ Hecho.\n');
})();
