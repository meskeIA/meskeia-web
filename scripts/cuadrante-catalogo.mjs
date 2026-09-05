#!/usr/bin/env node
/**
 * cuadrante-catalogo.mjs — ¿de dónde vive una app? Oferta (buscadores) x demanda (uso real),
 * para CUALQUIER app del catálogo, no solo las STEM.
 *
 * Hermano de cuadrante-stem.mjs, que hace el mismo cruce pero solo sobre el universo de
 * data/stemum.ts. Cuando la pregunta es sobre una app de Delegum, de Coquinum o de ninguna
 * parte, aquel no puede responder y la consulta acababa montándose a mano: tres sondas
 * sueltas (dump de Turso, GSC por página, Bing GetPageStats) escritas en scratch/ y tiradas
 * después. Ese fue el caso del 05/09/2026 (semilla S0120), donde además la respuesta cambió
 * el diagnóstico dos veces: el clúster de simuladores de informática resultó no recibir NADA
 * de buscadores, y simulador-hashing-colisiones no estaba muerta por mal enlazado sino
 * porque su tema tiene 32 impresiones en 90 días.
 *
 * NO se refactoriza cuadrante-stem.mjs para compartir código: es una herramienta que
 * funciona y que otros rituales ya leen. La duplicación de la capa de fetch es deliberada
 * y está acotada a este fichero.
 *
 *   Eje OFERTA  = impresiones GSC + impresiones Bing (visibilidad externa)
 *   Eje DEMANDA = visitas internas (Turso uso_aplicaciones, sin bots ni IP propia)
 *
 * Dos modos:
 *
 *   node scripts/cuadrante-catalogo.mjs                      cuadrante de TODO el catálogo
 *   node scripts/cuadrante-catalogo.mjs --vertical=stemum    ... acotado a un vertical
 *   node scripts/cuadrante-catalogo.mjs <slug> [<slug>...]   ficha por app, con veredicto
 *                                                            de canal y las top queries
 *
 *   --dias=N   ventana de GSC (por defecto 90)
 *
 * Requisitos (.env.local): GSC_SA_KEY_FILE, MWT, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
 */

import { JWT } from 'google-auth-library';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

dotenv.config({ path: '.env.local', quiet: true });

const GSC_API = 'https://www.googleapis.com/webmasters/v3';
const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const BING_API = 'https://ssl.bing.com/webmaster/api.svc/json';
const BING_SITE = 'https://meskeia.com/';
const MWT = process.env.MWT;

// --- Argumentos ---------------------------------------------------------------
const argv = process.argv.slice(2);
const DIAS_GSC = Number((argv.find((a) => a.startsWith('--dias=')) || '').split('=')[1]) || 90;
const VERTICAL = (argv.find((a) => a.startsWith('--vertical=')) || '').split('=')[1] || null;
const SLUGS = argv.filter((a) => !a.startsWith('--')).map((s) => s.replace(/^\/+|\/+$/g, ''));

// --- Universo: el catálogo implementado ---------------------------------------
//
// Control anti-falso-OK, mismo criterio que cuadrante-stem.mjs: un universo vacío
// significa que el fichero cambió de formato, NO que no haya apps. Clasificar el
// vacío sin protestar es precisamente el fallo que estas comprobaciones evitan.
function cargarCatalogo() {
  const txt = readFileSync('data/implemented-apps.ts', 'utf8');
  const slugs = [...txt.matchAll(/^\s*"\/([^"]*?)\/?"\s*,/gm)].map((m) => m[1]).filter(Boolean);
  if (slugs.length === 0) {
    throw new Error('El catálogo ha salido vacío: no he sabido leer data/implemented-apps.ts.');
  }
  const literales = (txt.match(/^\s*"\//gm) ?? []).length;
  if (slugs.length !== literales) {
    throw new Error(
      `Parseo desincronizado: ${literales} URLs en data/implemented-apps.ts, ${slugs.length} reconocidas.`,
    );
  }
  return [...new Set(slugs)];
}

/**
 * Vertical de cada app, por adjudicación EXCLUSIVA y en este orden. Es informativo
 * (no entra en ningún umbral), así que un portal ilegible NO detiene el cruce; pero sí
 * se avisa, porque este parseo es por regex sobre el texto de `data/` y ese es el fallo
 * que describe scripts/CLAUDE.md: si cambia el formato del catálogo, el regex deja de
 * hacer match y el consumidor se queda con cero items sin dar ningún error. Un portal
 * que devuelve 0 slugs no está vacío, está roto.
 */
function cargarVerticales() {
  const de = new Map();
  const marcar = (slug, vertical) => { if (slug && !de.has(slug)) de.set(slug, vertical); };
  const leer = (ruta) => (existsSync(ruta) ? readFileSync(ruta, 'utf8') : '');
  const cuenta = { stemum: 0, coquinum: 0, delegum: 0 };

  for (const m of leer('data/stemum.ts').matchAll(/slug:\s*'([^']+)'/g)) { marcar(m[1], 'stemum'); cuenta.stemum++; }
  for (const m of leer('data/coquinum.ts').matchAll(/slug:\s*'([^']+)'/g)) { marcar(m[1], 'coquinum'); cuenta.coquinum++; }
  for (const m of leer('data/delegum/soluciones.ts').matchAll(/url:\s*'\/([^']+?)\/?'/g)) { marcar(m[1], 'delegum'); cuenta.delegum++; }

  const mudos = Object.entries(cuenta).filter(([, n]) => n === 0).map(([v]) => v);
  if (mudos.length) {
    console.log(
      `  ⚠️  Sin reconocer ninguna app de: ${mudos.join(', ')}. Es un parseo por regex sobre data/*.ts;\n` +
        '      si el formato ha cambiado, la columna «vertical» de esas apps sale mal. Ver scripts/CLAUDE.md.',
    );
  }
  return de;
}

// --- Utilidades ---------------------------------------------------------------
function slugDeUrl(url) {
  try {
    const p = new URL(url).pathname;
    return p === '/' ? '(home)' : p.replace(/^\/|\/$/g, '');
  } catch {
    return String(url);
  }
}
const ymd = (d) => d.toISOString().slice(0, 10);
const mediana = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  if (!s.length) return 0;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};
const nf = new Intl.NumberFormat('es-ES');
const nf1 = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const hoy = new Date();
const finVentana = new Date(hoy); finVentana.setDate(finVentana.getDate() - 3); // retardo de GSC
const iniVentana = new Date(finVentana); iniVentana.setDate(iniVentana.getDate() - DIAS_GSC);
const startDate = ymd(iniVentana);
const endDate = ymd(finVentana);

// --- Google Search Console ----------------------------------------------------
function gscClient() {
  const keyFile = process.env.GSC_SA_KEY_FILE;
  if (!keyFile) throw new Error('Falta GSC_SA_KEY_FILE en .env.local');
  const key = JSON.parse(readFileSync(keyFile, 'utf8'));
  return new JWT({ email: key.client_email, key: key.private_key, scopes: [GSC_SCOPE] });
}

async function gscSitioMeskeia(client) {
  const res = await client.request({ url: `${GSC_API}/sites` });
  const sitios = (res.data.siteEntry || []).map((s) => s.siteUrl);
  // Ojo: la propiedad de meskeia.com es de prefijo de URL, no sc-domain. Pedirla como
  // sc-domain devuelve 403 y se lee como «sin datos» si no se mira el error.
  const elegido = sitios.find((u) => u.toLowerCase().includes('meskeia'));
  if (!elegido) {
    throw new Error(`La cuenta de servicio no ve ninguna propiedad de meskeia.com (ve: ${sitios.join(', ') || 'ninguna'})`);
  }
  return elegido;
}

async function gscPaginas(client, siteUrl) {
  const res = await client.request({
    url: `${GSC_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    method: 'POST',
    data: { startDate, endDate, dimensions: ['page'], rowLimit: 25000 },
  });
  return res.data.rows || [];
}

async function gscQueriesDe(client, siteUrl, slug, limite = 6) {
  const res = await client.request({
    url: `${GSC_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    method: 'POST',
    data: {
      startDate, endDate, dimensions: ['query'], rowLimit: limite,
      dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'contains', expression: `/${slug}/` }] }],
    },
  });
  return res.data.rows || [];
}

// --- Bing Webmaster Tools -----------------------------------------------------
async function bingPaginas() {
  const url = `${BING_API}/GetPageStats?apikey=${encodeURIComponent(MWT)}&siteUrl=${encodeURIComponent(BING_SITE)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} en GetPageStats`);
  return (await res.json()).d || [];
}

// --- Turso: demanda real ------------------------------------------------------
async function tursoVisitas() {
  const c = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  const ipRow = await c.execute(`SELECT valor FROM analytics_config WHERE clave = 'ip_excluida'`);
  const ip = ipRow.rows[0]?.valor || '';
  const filtro = ip
    ? ` AND (es_propio IS NULL OR es_propio = 0) AND (ip_address IS NULL OR ip_address != '${ip}')`
    : '';
  // created_at es ISO UTC; `timestamp` es texto español y NO se puede ordenar.
  const r = await c.execute(`
    SELECT aplicacion,
           COUNT(*) AS visitas,
           SUM(CASE WHEN es_recurrente = 1 THEN 1 ELSE 0 END) AS recurrentes,
           COUNT(DISTINCT sesion_id) AS sesiones,
           SUM(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 ELSE 0 END) AS visitas30,
           MIN(created_at) AS primera
    FROM uso_aplicaciones
    WHERE (modo IS NULL OR modo != 'bot')
      AND created_at >= datetime('now', '-${DIAS_GSC} days') ${filtro}
    GROUP BY aplicacion
  `);
  const map = new Map();
  for (const row of r.rows) {
    map.set(String(row.aplicacion), {
      visitas: Number(row.visitas),
      recurrentes: Number(row.recurrentes || 0),
      sesiones: Number(row.sesiones || 0),
      visitas30: Number(row.visitas30 || 0),
      primera: String(row.primera || ''),
    });
  }
  return map;
}

// --- Veredicto de canal -------------------------------------------------------
//
// La pregunta que motivó el script: ¿esta app no la usan porque nadie la encuentra,
// o porque nadie busca lo que hace? Son diagnósticos opuestos y llevan a acciones
// opuestas (enlazado y superficie indexable frente a no invertir más en ella).
function veredictoCanal(f) {
  const { oferta, demanda, gscClicks, bingClicks } = f;
  const clicsBuscador = gscClicks + bingClicks;
  if (demanda === 0 && oferta === 0) {
    return ['SIN SEÑAL', 'ni la buscan ni la usan: no hay nada que diagnosticar todavía'];
  }
  if (demanda === 0) {
    return ['NO CONVIERTE', `sale en buscadores (${nf.format(oferta)} impr) y aun así no se usa: mirar título y descripción`];
  }
  if (oferta < 30) {
    return ['FUERA DE BUSCADORES', `${nf.format(demanda)} visitas con solo ${nf.format(oferta)} impresiones: el tráfico NO viene de buscar; o el tema no se busca, o la página no tiene superficie indexable`];
  }
  const proporcion = clicsBuscador / demanda;
  if (proporcion >= 0.5) {
    return ['VIVE DE BUSCADOR', `${nf.format(clicsBuscador)} clics de buscador sobre ${nf.format(demanda)} visitas`];
  }
  if (proporcion >= 0.15) {
    return ['MIXTO', `${nf.format(clicsBuscador)} clics de buscador explican parte de sus ${nf.format(demanda)} visitas`];
  }
  return ['DIRECTO / IA', `solo ${nf.format(clicsBuscador)} clics de buscador para ${nf.format(demanda)} visitas: llega por otra vía`];
}

// --- Main ---------------------------------------------------------------------
(async () => {
  if (!MWT) {
    console.error('Falta MWT en .env.local');
    process.exit(1);
  }

  let catalogo;
  try {
    catalogo = cargarCatalogo();
  } catch (e) {
    console.error(`\n[cuadrante-catalogo] ${e.message}\n`);
    process.exit(1);
  }
  const verticalDe = cargarVerticales();

  const client = gscClient();
  let sitio;
  try {
    sitio = await gscSitioMeskeia(client);
  } catch (e) {
    console.error(`\n[cuadrante-catalogo] ${e.message}\n`);
    process.exit(1);
  }

  const [paginas, bingRaw, visitas] = await Promise.all([
    gscPaginas(client, sitio),
    bingPaginas().catch((e) => { console.log(`  (Bing no responde: ${e.message})`); return []; }),
    tursoVisitas().catch((e) => { console.log(`  (Turso no responde: ${e.message})`); return new Map(); }),
  ]);

  // Una respuesta vacía de GSC para el sitio ENTERO no es «no hay datos»: es que la
  // consulta está mal hecha. Distinguirlo importa, porque un cero mal leído se
  // interpreta como «nadie la encuentra» y manda a arreglar lo que no está roto.
  if (paginas.length === 0) {
    console.error(
      `\n[cuadrante-catalogo] GSC ha devuelto CERO páginas para ${sitio} en ${startDate}->${endDate}.\n` +
        'Eso no es una lectura, es una consulta fallida: no interpretes ningún cero de esta ejecución.\n',
    );
    process.exit(2);
  }

  // Agregar GSC y Bing por slug
  const gsc = new Map();
  for (const r of paginas) {
    const slug = slugDeUrl(r.keys[0]);
    const g = gsc.get(slug) || { impr: 0, clicks: 0, posImpr: 0 };
    g.impr += r.impressions;
    g.clicks += r.clicks;
    g.posImpr += (r.position || 0) * r.impressions;
    gsc.set(slug, g);
  }
  const bing = new Map();
  for (const r of bingRaw) {
    const url = String(r.Query ?? '');
    if (!url.startsWith('http')) continue;
    const slug = slugDeUrl(url);
    const b = bing.get(slug) || { impr: 0, clicks: 0 };
    b.impr += r.Impressions ?? 0;
    b.clicks += r.Clicks ?? 0;
    bing.set(slug, b);
  }

  const filaDe = (slug) => {
    const g = gsc.get(slug) || { impr: 0, clicks: 0, posImpr: 0 };
    const b = bing.get(slug) || { impr: 0, clicks: 0 };
    const v = visitas.get(slug) || { visitas: 0, recurrentes: 0, sesiones: 0, visitas30: 0, primera: '' };
    return {
      slug,
      vertical: verticalDe.get(slug) || 'meskeIA',
      gscImpr: g.impr,
      gscClicks: g.clicks,
      gscPos: g.impr ? +(g.posImpr / g.impr).toFixed(1) : null,
      bingImpr: b.impr,
      bingClicks: b.clicks,
      oferta: g.impr + b.impr,
      demanda: v.visitas,
      demanda30: v.visitas30,
      recurrentes: v.recurrentes,
      sesiones: v.sesiones,
      primera: v.primera ? v.primera.slice(0, 10) : '',
    };
  };

  // ─── Modo ficha: una o varias apps concretas ───
  if (SLUGS.length > 0) {
    console.log(`\nVentana: ${startDate} -> ${endDate} (${DIAS_GSC} días)\n`);
    for (const slug of SLUGS) {
      const conocida = catalogo.includes(slug);
      const f = filaDe(slug);
      const [etiqueta, porque] = veredictoCanal(f);
      console.log('='.repeat(78));
      console.log(`${slug}${conocida ? '' : '   ⚠️  NO está en data/implemented-apps.ts'}`);
      console.log('='.repeat(78));
      console.log(`  vertical    ${f.vertical}`);
      console.log(
        `  DEMANDA     ${nf.format(f.demanda)} visitas (${nf.format(f.demanda30)} en 30 d) · ` +
          `${nf.format(f.recurrentes)} recurrentes · ${nf.format(f.sesiones)} sesiones` +
          (f.primera ? ` · primera visita ${f.primera}` : ''),
      );
      console.log(
        `  OFERTA      ${nf.format(f.oferta)} impresiones = GSC ${nf.format(f.gscImpr)} (${nf.format(f.gscClicks)} clics` +
          `${f.gscPos !== null ? `, pos ${nf1.format(f.gscPos)}` : ''}) + Bing ${nf.format(f.bingImpr)} (${nf.format(f.bingClicks)} clics)`,
      );
      console.log(`  CANAL       ${etiqueta} — ${porque}`);

      const queries = await gscQueriesDe(client, sitio, slug).catch(() => []);
      if (queries.length) {
        console.log('  QUERIES     (top de Google en la ventana)');
        for (const q of queries) {
          console.log(
            `      ${String(q.clicks).padStart(4)} clics ${String(q.impressions).padStart(6)} impr ` +
              `pos ${nf1.format(q.position).padStart(5)}  ${q.keys[0]}`,
          );
        }
      } else if (f.gscImpr > 0) {
        // No es lo mismo «no sale» que «sale poco»: con impresiones pero sin filas por
        // consulta, lo que pasa es que ninguna búsqueda llega al umbral de anonimizacion
        // de GSC. Leerlo como ausencia de visibilidad es un diagnóstico equivocado.
        console.log(
          `  QUERIES     ninguna por encima del umbral de anonimización de GSC, pese a ${nf.format(f.gscImpr)} impresiones`,
        );
      } else {
        console.log('  QUERIES     ninguna: Google no la muestra para ninguna búsqueda en la ventana');
      }
      console.log('');
    }
    return;
  }

  // ─── Modo cuadrante: todo el catálogo (o un vertical) ───
  let filas = catalogo.map(filaDe);
  if (VERTICAL) filas = filas.filter((f) => f.vertical.toLowerCase() === VERTICAL.toLowerCase());
  if (filas.length === 0) {
    console.error(`\n[cuadrante-catalogo] Ninguna app en el vertical «${VERTICAL}».\n`);
    process.exit(1);
  }

  const cutO = mediana(filas.map((f) => f.oferta));
  const cutD = mediana(filas.map((f) => f.demanda));
  for (const f of filas) {
    const altaO = f.oferta > cutO;
    const altaD = f.demanda > cutD;
    f.cuadrante = altaO && altaD ? 'estrella' : altaO ? 'embajadora' : altaD ? 'invisible' : 'muerto';
  }

  const orden = { estrella: 0, embajadora: 1, invisible: 2, muerto: 3 };
  filas.sort((a, b) => orden[a.cuadrante] - orden[b.cuadrante] || b.demanda - a.demanda || b.oferta - a.oferta);

  const cont = { estrella: 0, embajadora: 0, invisible: 0, muerto: 0 };
  filas.forEach((f) => cont[f.cuadrante]++);

  const etiqueta = {
    estrella: 'ESTRELLA (la buscan y la usan)',
    embajadora: 'EMBAJADORA-FOSO (citada, no usada)',
    invisible: 'INVISIBLE (usada, no citada)',
    muerto: 'PESO MUERTO',
  };

  console.log(
    `\nUniverso: ${filas.length} apps${VERTICAL ? ` del vertical ${VERTICAL}` : ' del catálogo'} · ` +
      `ventana ${startDate}->${endDate} (${DIAS_GSC} d)`,
  );
  console.log(`Umbrales (mediana del conjunto) -> oferta>${cutO} impr · demanda>${cutD} visitas`);
  console.log(
    `RESUMEN: ESTRELLA=${cont.estrella}  EMBAJADORA=${cont.embajadora}  ` +
      `INVISIBLE=${cont.invisible}  MUERTO=${cont.muerto}`,
  );

  // Las invisibles primero en la lectura: son las que tienen arreglo barato.
  for (const grupo of ['invisible', 'estrella', 'embajadora', 'muerto']) {
    const g = filas.filter((f) => f.cuadrante === grupo);
    if (!g.length) continue;
    console.log(`\n${'='.repeat(90)}\n${etiqueta[grupo]}  (${g.length})\n${'='.repeat(90)}`);
    console.log('slug'.padEnd(44), 'ofer'.padStart(6), 'gsc'.padStart(6), 'bng'.padStart(5), 'pos'.padStart(5), 'dem'.padStart(6), 'd30'.padStart(5), ' vertical');
    // El peso muerto no se lista entero: son cientos de líneas que nadie lee.
    for (const f of grupo === 'muerto' ? g.slice(0, 30) : g) {
      console.log(
        f.slug.padEnd(44),
        String(f.oferta).padStart(6),
        String(f.gscImpr).padStart(6),
        String(f.bingImpr).padStart(5),
        String(f.gscPos ?? '-').padStart(5),
        String(f.demanda).padStart(6),
        String(f.demanda30).padStart(5),
        ' ' + f.vertical,
      );
    }
    if (grupo === 'muerto' && g.length > 30) console.log(`   ... y ${g.length - 30} más (están en el JSON)`);
  }

  if (!existsSync('scratch')) mkdirSync('scratch', { recursive: true });
  const salida = {
    meta: { generado: endDate, diasGSC: DIAS_GSC, universo: filas.length, vertical: VERTICAL, cutOferta: cutO, cutDemanda: cutD },
    resumen: cont,
    filas,
  };
  writeFileSync('scratch/cuadrante-catalogo.json', JSON.stringify(salida, null, 2));
  console.log('\nVolcado a scratch/cuadrante-catalogo.json');
  console.log('Ficha de una app concreta: node scripts/cuadrante-catalogo.mjs <slug>');
})();
