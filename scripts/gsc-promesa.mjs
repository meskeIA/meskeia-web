#!/usr/bin/env node
/**
 * gsc-promesa.mjs — Instrumento de la palanca «promesa incumplida»
 *
 * El patrón (descubierto el 20/07/2026 con `contador-silabas`): una app cuyo título
 * promete una capacidad que el motor NO implementa. Se manifiesta en GSC como CTR
 * anómalamente bajo PARA SU POSICIÓN — no bajo «en general», sino comparado con las
 * apps propias que están en la misma posición media.
 *
 * Tres modos, que son los tres pasos del método:
 *
 *   barrido [dias]              Curva de CTR por posición construida con el PROPIO catálogo
 *                               y páginas que caen muy por debajo de la mediana de su franja.
 *                               → candidatos, NO conclusiones.
 *
 *   pagina <slug> [dias]        Queries de una página con la CONCENTRACIÓN del top-12.
 *                               Filtro obligatorio antes de llamar a nada «promesa rota»:
 *                               si el top-12 es <10 % de las impresiones, lo que hay es
 *                               cola larga (caso `calculadora-notas`, descartado el 19/08/2026),
 *                               y no hay nada que arreglar.
 *
 *   partir <slug> <YYYY-MM-DD> [dias]
 *                               Ventanas simétricas antes/después de la fecha de un commit,
 *                               filtradas por página. NUNCA juzgar un cambio de metadata con
 *                               la ventana por defecto: si el cambio cae dentro, el resultado
 *                               sale diluido con el «antes».
 *
 * Requisitos: los mismos que scripts/gsc-stats.mjs (.credentials + GSC_SA_KEY_FILE).
 */

import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';

dotenv.config({ path: '.env.local' });

const API = 'https://www.googleapis.com/webmasters/v3';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const SITIO_POR_DEFECTO = 'meskeia.com';

// --- Formato español ------------------------------------------------------
const nf = new Intl.NumberFormat('es-ES');
const nf1 = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const pf = new Intl.NumberFormat('es-ES', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });

// --- Fechas ---------------------------------------------------------------
function ymd(d) {
  return d.toISOString().slice(0, 10);
}
function restarDias(fecha, dias) {
  const d = new Date(fecha);
  d.setDate(d.getDate() - dias);
  return d;
}
function sumarDias(fecha, dias) {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d;
}
/** GSC lleva ~2-3 días de retardo: el último día fiable es hoy-3. */
function ultimoDiaFiable() {
  return restarDias(new Date(), 3);
}

// --- Cliente --------------------------------------------------------------
function crearCliente() {
  const keyFile = process.env.GSC_SA_KEY_FILE;
  if (!keyFile) {
    console.error('❌ Falta GSC_SA_KEY_FILE en .env.local');
    process.exit(1);
  }
  const key = JSON.parse(readFileSync(keyFile, 'utf8'));
  return new JWT({ email: key.client_email, key: key.private_key, scopes: [SCOPE] });
}

async function consultar(client, siteUrl, cuerpo) {
  const enc = encodeURIComponent(siteUrl);
  const res = await client.request({
    url: `${API}/sites/${enc}/searchAnalytics/query`,
    method: 'POST',
    data: cuerpo,
  });
  return res.data.rows || [];
}

async function resolverSitio(client, filtro) {
  const res = await client.request({ url: `${API}/sites` });
  const sitios = (res.data.siteEntry || []).filter((s) => s.permissionLevel !== 'siteUnverifiedUser');
  const elegido = sitios.find((s) => s.siteUrl.toLowerCase().includes(filtro.toLowerCase()));
  if (!elegido) {
    console.error(`❌ Ninguna propiedad contiene "${filtro}". Accesibles: ${sitios.map((s) => s.siteUrl).join(', ')}`);
    process.exit(1);
  }
  return elegido.siteUrl;
}

/** Filtro por página: la URL canónica de una app del catálogo lleva barra final. */
function filtroPagina(slug) {
  const url = slug.startsWith('http') ? slug : `https://meskeia.com/${slug}/`;
  return [{ filters: [{ dimension: 'page', operator: 'equals', expression: url }] }];
}

function mediana(valores) {
  if (!valores.length) return 0;
  const orden = [...valores].sort((a, b) => a - b);
  const mitad = Math.floor(orden.length / 2);
  return orden.length % 2 ? orden[mitad] : (orden[mitad - 1] + orden[mitad]) / 2;
}

function slugDe(url) {
  return url.replace(/^https?:\/\/[^/]+\//, '').replace(/\/$/, '') || '(home)';
}

// ══════════════════════════════════════════════════════════════════════════
// MODO 1 — barrido: quién rinde por debajo de sus vecinas de posición
// ══════════════════════════════════════════════════════════════════════════
async function barrido(client, siteUrl, dias, minImpr) {
  const fin = ultimoDiaFiable();
  const inicio = restarDias(fin, dias);
  const filas = await consultar(client, siteUrl, {
    startDate: ymd(inicio),
    endDate: ymd(fin),
    dimensions: ['page'],
    rowLimit: 25000,
  });

  console.log(`\n🔎 ${siteUrl} · ${ymd(inicio)} → ${ymd(fin)} (${dias} días) · ${nf.format(filas.length)} páginas con impresiones`);

  // Curva de CTR por franja de posición, construida con el propio catálogo.
  // Solo páginas con impresiones suficientes: con 30 impresiones el CTR es ruido.
  const base = filas.filter((f) => f.impressions >= 200);
  const franjas = new Map();
  for (const f of base) {
    const franja = Math.min(20, Math.max(1, Math.round(f.position)));
    if (!franjas.has(franja)) franjas.set(franja, []);
    franjas.get(franja).push(f.ctr);
  }
  const medianaFranja = new Map();
  for (const [franja, ctrs] of franjas) {
    if (ctrs.length >= 8) medianaFranja.set(franja, mediana(ctrs));
  }

  console.log('\n  Curva propia (mediana de CTR por posición, páginas con ≥200 impr):');
  for (const franja of [...medianaFranja.keys()].sort((a, b) => a - b)) {
    const n = franjas.get(franja).length;
    console.log(`    pos ${String(franja).padStart(2)}  →  CTR mediano ${pf.format(medianaFranja.get(franja)).padStart(7)}   (${nf.format(n)} páginas)`);
  }

  // Candidatos: mucha impresión, CTR muy por debajo de la mediana de su franja.
  const candidatos = [];
  for (const f of filas) {
    if (f.impressions < minImpr) continue;
    const franja = Math.min(20, Math.max(1, Math.round(f.position)));
    const esperado = medianaFranja.get(franja);
    if (!esperado) continue;
    const ratio = esperado > 0 ? f.ctr / esperado : 1;
    if (ratio >= 0.4) continue;
    candidatos.push({
      slug: slugDe(f.keys[0]),
      clicks: f.clicks,
      impressions: f.impressions,
      ctr: f.ctr,
      position: f.position,
      esperado,
      ratio,
      perdidos: f.impressions * (esperado - f.ctr),
    });
  }
  candidatos.sort((a, b) => b.perdidos - a.perdidos);

  console.log(`\n  Candidatos (≥${nf.format(minImpr)} impr y CTR <40 % del mediano de su franja): ${candidatos.length}`);
  console.log('  ' + '─'.repeat(100));
  console.log('   clics     impr      CTR    esperado   ratio   pos   clics/ventana perdidos   página');
  for (const c of candidatos.slice(0, 30)) {
    console.log(
      `  ${nf.format(c.clicks).padStart(6)}  ${nf.format(c.impressions).padStart(7)}  ${pf.format(c.ctr).padStart(7)}  ` +
        `${pf.format(c.esperado).padStart(7)}  ${nf1.format(c.ratio * 100).padStart(5)}%  ${nf1.format(c.position).padStart(5)}  ` +
        `${nf.format(Math.round(c.perdidos)).padStart(10)}          ${c.slug}`,
    );
  }
  console.log('\n  ⚠️  Esto son CANDIDATOS. Antes de llamar a ninguno «promesa rota», pasar cada uno');
  console.log('      por `pagina <slug>`: si el top-12 de queries es <10 % de sus impresiones,');
  console.log('      lo que hay es cola larga y la palanca no aplica.');
}

// ══════════════════════════════════════════════════════════════════════════
// MODO 2 — pagina: concentración de queries y CTR por query
// ══════════════════════════════════════════════════════════════════════════
async function pagina(client, siteUrl, slug, dias) {
  const fin = ultimoDiaFiable();
  const inicio = restarDias(fin, dias);
  const rango = { startDate: ymd(inicio), endDate: ymd(fin) };

  const [totalFila] = await consultar(client, siteUrl, {
    ...rango,
    dimensions: [],
    dimensionFilterGroups: filtroPagina(slug),
    rowLimit: 1,
  });
  const queries = await consultar(client, siteUrl, {
    ...rango,
    dimensions: ['query'],
    dimensionFilterGroups: filtroPagina(slug),
    rowLimit: 500,
  });

  console.log(`\n📄 ${slug} · ${ymd(inicio)} → ${ymd(fin)} (${dias} días)`);
  if (!totalFila) {
    console.log('  (sin datos: ¿la URL lleva barra final? ¿la propiedad es la correcta?)');
    return;
  }
  console.log(
    `  TOTAL PÁGINA → ${nf.format(totalFila.clicks)} clics · ${nf.format(totalFila.impressions)} impr · ` +
      `CTR ${pf.format(totalFila.ctr)} · pos ${nf1.format(totalFila.position)}`,
  );

  const top = [...queries].sort((a, b) => b.impressions - a.impressions).slice(0, 12);
  const imprTop = top.reduce((s, q) => s + q.impressions, 0);
  const concentracion = totalFila.impressions ? imprTop / totalFila.impressions : 0;

  console.log(`\n  Top-12 queries por impresiones = ${nf.format(imprTop)} de ${nf.format(totalFila.impressions)} → ${pf.format(concentracion)} de la impresión de la página`);
  console.log(
    concentracion < 0.1
      ? '  ⛔ <10 % → COLA LARGA. La palanca NO aplica (regla salida de `calculadora-notas`, 19/08/2026).'
      : '  ✅ ≥10 % → hay query de cabeza: sigue el análisis, pero compárala con sus vecinas de la MISMA página.',
  );
  console.log('  ' + '─'.repeat(92));
  console.log('   clics     impr      CTR    pos   query');
  for (const q of top) {
    console.log(
      `  ${nf.format(q.clicks).padStart(6)}  ${nf.format(q.impressions).padStart(7)}  ${pf.format(q.ctr).padStart(7)}  ` +
        `${nf1.format(q.position).padStart(5)}   ${q.keys[0]}`,
    );
  }
  console.log('\n  Lectura: si una query de cabeza convierte MUY por debajo de sus vecinas de la misma');
  console.log('  página a posición igual o peor, el problema es esa SERP concreta, no el título.');
}

// ══════════════════════════════════════════════════════════════════════════
// MODO 3 — partir: ventanas simétricas antes/después de un cambio
// ══════════════════════════════════════════════════════════════════════════
async function partir(client, siteUrl, slug, fechaCorte, dias) {
  const corte = new Date(`${fechaCorte}T00:00:00Z`);
  const fin = ultimoDiaFiable();
  const disponibles = Math.floor((fin - corte) / 86400000) - 1;
  if (disponibles < dias) {
    console.log(`\n⚠️  Solo hay ${disponibles} días posteriores al corte con datos fiables; se acorta la ventana a ese tamaño.`);
    dias = Math.max(1, disponibles);
  }

  const ventanas = [
    ['ANTES ', ymd(restarDias(corte, dias)), ymd(restarDias(corte, 1))],
    ['DESPUÉS', ymd(sumarDias(corte, 1)), ymd(sumarDias(corte, dias))],
  ];
  const largo = ['LARGO ', ymd(sumarDias(corte, 1)), ymd(fin)];

  console.log(`\n✂️  ${slug} · corte ${fechaCorte} · ventanas simétricas de ${dias} días`);
  console.log('  ' + '─'.repeat(78));
  console.log('   ventana                        clics      impr      CTR    pos');
  for (const [etiqueta, ini, f] of [...ventanas, largo]) {
    const [fila] = await consultar(client, siteUrl, {
      startDate: ini,
      endDate: f,
      dimensions: [],
      dimensionFilterGroups: filtroPagina(slug),
      rowLimit: 1,
    });
    const txt = `${etiqueta} (${ini}→${f})`.padEnd(30);
    if (!fila) {
      console.log(`  ${txt}   (sin datos)`);
      continue;
    }
    console.log(
      `  ${txt} ${nf.format(fila.clicks).padStart(6)}  ${nf.format(fila.impressions).padStart(8)}  ` +
        `${pf.format(fila.ctr).padStart(7)}  ${nf1.format(fila.position).padStart(5)}`,
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════
// MODO 4 — demanda: ¿pide alguien de verdad lo que el título promete?
// ══════════════════════════════════════════════════════════════════════════
/**
 * Cuando el título promete una capacidad que falta, la palanca NO dice «recorta el
 * título»: dice implementar lo prometido SI la demanda medida lo justifica. Este modo
 * mide esa demanda a nivel de SITIO (no de página: lo que falta, por definición, puede
 * no estar atrayendo impresiones a esa página todavía).
 */
async function demanda(client, siteUrl, patron, dias) {
  const fin = ultimoDiaFiable();
  const inicio = restarDias(fin, dias);
  const filas = await consultar(client, siteUrl, {
    startDate: ymd(inicio),
    endDate: ymd(fin),
    dimensions: ['query'],
    dimensionFilterGroups: [
      { filters: [{ dimension: 'query', operator: 'includingRegex', expression: patron }] },
    ],
    rowLimit: 2000,
  });

  console.log(`\n🔦 Demanda en ${siteUrl} · queries que casan /${patron}/ · ${ymd(inicio)} → ${ymd(fin)}`);
  if (!filas.length) {
    console.log('  (ninguna query del sitio casa con ese patrón: demanda medida = 0)');
    return;
  }
  const tot = filas.reduce((s, f) => s + f.impressions, 0);
  console.log(`  ${nf.format(filas.length)} queries · ${nf.format(tot)} impresiones en total\n`);
  console.log('   clics     impr      CTR    pos   query');
  for (const f of filas.sort((a, b) => b.impressions - a.impressions).slice(0, 40)) {
    console.log(
      `  ${nf.format(f.clicks).padStart(6)}  ${nf.format(f.impressions).padStart(7)}  ${pf.format(f.ctr).padStart(7)}  ` +
        `${nf1.format(f.position).padStart(5)}   ${f.keys[0]}`,
    );
  }
}

// --- Main -----------------------------------------------------------------
(async () => {
  const modo = (process.argv[2] || 'barrido').toLowerCase();
  const client = crearCliente();
  const siteUrl = await resolverSitio(client, process.env.GSC_SITIO || SITIO_POR_DEFECTO);

  if (modo === 'barrido') {
    const dias = parseInt(process.argv[3], 10) || 90;
    const minImpr = parseInt(process.argv[4], 10) || 800;
    await barrido(client, siteUrl, dias, minImpr);
  } else if (modo === 'pagina') {
    const slug = process.argv[3];
    if (!slug) {
      console.error('Uso: node scripts/gsc-promesa.mjs pagina <slug> [dias]');
      process.exit(1);
    }
    await pagina(client, siteUrl, slug, parseInt(process.argv[4], 10) || 90);
  } else if (modo === 'partir') {
    const slug = process.argv[3];
    const fecha = process.argv[4];
    if (!slug || !/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) {
      console.error('Uso: node scripts/gsc-promesa.mjs partir <slug> <YYYY-MM-DD> [dias]');
      process.exit(1);
    }
    await partir(client, siteUrl, slug, fecha, parseInt(process.argv[5], 10) || 17);
  } else if (modo === 'demanda') {
    const patron = process.argv[3];
    if (!patron) {
      console.error('Uso: node scripts/gsc-promesa.mjs demanda <regex> [dias]');
      process.exit(1);
    }
    await demanda(client, siteUrl, patron, parseInt(process.argv[4], 10) || 90);
  } else {
    console.error(`Modo desconocido: "${modo}". Usa barrido | pagina | partir | demanda.`);
    process.exit(1);
  }

  console.log('');
})();
