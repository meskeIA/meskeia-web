#!/usr/bin/env node
/**
 * cola-indexacion.mjs — Cola diaria de «Solicitar indexación» en Search Console.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────
 * De qué caso sale (11/11/2026)
 * ────────────────────────────────────────────────────────────────────────────────────────────
 * El barrido del 26/09/2026 encontró 98 URLs que habían salido del índice (último rastreo de
 * antes del 26/05, cuando servían el título de la home). El usuario pidió su indexación a mano,
 * ~10 al día, y el 02/11 habían vuelto 91. El mismo barrido destapó una segunda ola de 65
 * salidas, ahora con último rastreo de mayo-junio: Google va soltando lo que lleva meses sin
 * rastrear, por oleadas. Pedidas las 72 de esa ola (02-11/11), el 11/11 había 65 dentro.
 * Las que estaban fuera y NO se pidieron entraron 16 de 149 en el mismo periodo.
 *
 * Dos cosas faltaban: enterarse de una ola en días y no en el barrido del mes siguiente, y no
 * depender de que alguien prepare la lista. De las 37 apps publicadas entre agosto y octubre,
 * 7 no entraron solas —6 de una misma tanda del 05-08/09—: tampoco las nuevas están a salvo.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────
 * Qué hace cada mañana (paso de la Rutina Matinal, detrás de la Ronda)
 * ────────────────────────────────────────────────────────────────────────────────────────────
 * Pregunta a la URL Inspection API por tres grupos, ~300 de las 2.000 consultas diarias:
 *   · las URLs de la cola (fuera del índice y con algo que pedir),
 *   · las URLs nuevas del sitemap (las que la cola no había visto nunca),
 *   · una séptima parte del resto, por turno: el catálogo entero se revisa cada semana, y así
 *     una página que SALE del índice entra en la cola a los pocos días.
 *
 * Y elige las 10 del día (el límite diario aproximado de GSC), en este orden:
 *   1. las propuestas hoy (si la pasada se repite, la lista no cambia),
 *   2. las propuestas que no se rastrearon desde entonces (no se pidieron, o GSC no lo recogió),
 *   3. las nuevas, de la más antigua a la más reciente,
 *   4. las que salieron del índice, por impresiones,
 *   5. las que estaban fuera, SOLO si tienen señal (impresiones en Google o en Bing),
 *   6. la segunda solicitud de las que se rastrearon tras pedirlas y siguen fuera.
 * La señal solo filtra al grupo 5: las nuevas y las salidas entran siempre (decidido por el
 * usuario el 11/11/2026).
 *
 * El usuario NO confirma nada: una solicitud hace rastrear la URL ese mismo día (en las 98, la
 * fecha del último rastreo coincidía con el día en que se pidió), así que la pasada siguiente
 * lo ve en la API. Una URL sale de la cola al indexarse, y se RETIRA tras dos solicitudes
 * rastreadas sin entrar o cuatro sin que Google llegue a rastrearla: insistir más es gastar
 * cupo del usuario en lo que Google ya ha juzgado.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────
 * Uso
 * ────────────────────────────────────────────────────────────────────────────────────────────
 *   node scripts/cola-indexacion.mjs                 # la pasada diaria (la lanza la Rutina Matinal)
 *   node scripts/cola-indexacion.mjs --seco          # la misma pasada sin escribir el estado
 *   node scripts/cola-indexacion.mjs --parte         # el resumen para el /parte (sin API)
 *   node scripts/cola-indexacion.mjs marcar-pedidas <url…>   # anota solicitudes hechas fuera de la lista
 *   node scripts/cola-indexacion.mjs --probar        # casos de la elección del día (sin API)
 *
 * Estado: `indexacion/cola.json` dentro de la carpeta privada del repositorio. La primera pasada
 * lo siembra con el último barrido completo (`indexacion-AAAA-MM-DD.csv`, de barrido-indexacion.mjs).
 *
 * Se planta (código 1, sin escribir) si GSC devuelve menos de 50 páginas con impresiones o si
 * falla más del 10 % de las inspecciones: una pasada ciega daría por salidas del índice a
 * páginas que siguen dentro. Bing es secundario: si falla, la señal se queda en Google y se avisa.
 *
 * Requisitos: GSC_SA_KEY_FILE y MWT en .env.local. ⚠️ Barra final en cada URL: sin ella Google
 * responde «no reconoce esta URL» para cualquier página (cabecera de barrido-indexacion.mjs).
 */
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync } from 'node:fs';
import path from 'node:path';

dotenv.config({ path: '.env.local', quiet: true });

const RAIZ = path.resolve(import.meta.dirname, '..');
const PRIVADO = path.join(RAIZ, '_private');
const CARPETA = path.join(PRIVADO, 'indexacion');
const ESTADO = path.join(CARPETA, 'cola.json');
const SITIO = 'https://meskeia.com/';
const INSPECT_API = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';
const GSC_API = 'https://www.googleapis.com/webmasters/v3/sites';
const BING_API = 'https://ssl.bing.com/webmaster/api.svc/json';

const POR_DIA = 10;            // límite diario aproximado de «Solicitar indexación» en GSC
const CONCURRENCIA = 8;
const TURNOS_ROTACION = 7;     // el resto del catálogo se revisa entero cada 7 pasadas
const DIAS_ESPERA = 21;        // tras un rastreo sin entrar, cuánto se espera antes de pedirla otra vez
const MAX_RASTREADAS = 2;      // solicitudes rastreadas sin entrar → se retira
const MAX_SIN_RASTREO = 4;     // solicitudes seguidas que Google no rastrea → se retira
const DIAS_SENAL = 240;        // ventana de impresiones de Google para la señal
const MIN_PAGINAS_GSC = 50;
const MAX_ERRORES = 0.1;

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);

const hoyLocal = () => new Date().toLocaleDateString('sv-SE'); // AAAA-MM-DD en hora local
const diasEntre = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const dentro = (estado) => /indexada/i.test(estado || '');
const slugDe = (url) => url.replace(SITIO, '/');
const fechaEs = (iso) => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '—');

// -------------------------------------------------------------------------------------------------
// La elección del día — pura, sin E/S, para poder probarla (--probar)
// -------------------------------------------------------------------------------------------------

/** Cuántas solicitudes se rastrearon y cuántas seguidas, al final, no se han rastreado. */
function recuento(ficha) {
  const p = ficha.propuestas ?? [];
  const rastreadas = p.filter((x) => x.rastreada).length;
  let sinRastreo = 0;
  for (let i = p.length - 1; i >= 0 && !p[i].rastreada; i--) sinRastreo++;
  return { rastreadas, sinRastreo, ultima: p.at(-1) ?? null };
}

const conSenal = (f) => (f.senal?.google ?? 0) + (f.senal?.bing ?? 0) > 0;

/**
 * Marca como rastreada la última solicitud si Google ha pasado después, retira las agotadas y
 * devuelve las URLs del día con el motivo de cada una. Modifica `urls` (el estado) en el sitio.
 */
export function elegirDelDia(urls, hoy) {
  const grupos = [[], [], [], [], [], []];
  const retiradasHoy = [];

  for (const [url, f] of Object.entries(urls)) {
    if (!f.clase || f.retirada || dentro(f.estado)) continue;
    const ult = f.propuestas?.at(-1);
    if (ult && !ult.rastreada && f.rastreo && f.rastreo >= ult.fecha) ult.rastreada = true;
    const { rastreadas, sinRastreo, ultima } = recuento(f);

    if (ultima?.fecha === hoy) { grupos[0].push({ url, motivo: 'propuesta hoy' }); continue; }

    if (ultima && !ultima.rastreada) {
      if (sinRastreo >= MAX_SIN_RASTREO) {
        f.retirada = { fecha: hoy, motivo: `Google no la rastrea tras ${sinRastreo} solicitudes` };
        retiradasHoy.push(url);
      } else {
        grupos[1].push({ url, motivo: `sin rastrear desde la solicitud del ${fechaEs(ultima.fecha)}` });
      }
      continue;
    }

    if (ultima?.rastreada) {
      if (rastreadas >= MAX_RASTREADAS) {
        f.retirada = { fecha: hoy, motivo: `sigue fuera tras ${rastreadas} solicitudes rastreadas` };
        retiradasHoy.push(url);
      } else if (diasEntre(ultima.fecha, hoy) >= DIAS_ESPERA) {
        grupos[5].push({ url, motivo: `${rastreadas + 1}.ª solicitud: la anterior se rastreó y no entró` });
      }
      continue;
    }

    if (f.clase === 'nueva') grupos[2].push({ url, motivo: `nueva, en el sitemap desde el ${fechaEs(f.alta)}` });
    else if (f.clase === 'salida') grupos[3].push({ url, motivo: `salió del índice (visto el ${fechaEs(f.salio)})` });
    else if (f.clase === 'fuera' && conSenal(f)) grupos[4].push({ url, motivo: 'fuera del índice, con señal' });
  }

  const peso = (u) => (urls[u].senal?.google ?? 0) + (urls[u].senal?.bing ?? 0);
  grupos[2].sort((a, b) => (urls[a.url].alta ?? '').localeCompare(urls[b.url].alta ?? ''));
  for (const g of [grupos[1], grupos[3], grupos[4], grupos[5]]) g.sort((a, b) => peso(b.url) - peso(a.url));

  const lista = grupos.flat().slice(0, POR_DIA);
  for (const { url } of lista) {
    const f = urls[url];
    f.propuestas ??= [];
    if (f.propuestas.at(-1)?.fecha !== hoy) f.propuestas.push({ fecha: hoy, rastreada: false });
  }
  return { lista, retiradasHoy };
}

/** Aplica la inspección de hoy a una ficha y dice qué movimiento hubo. */
export function aplicarInspeccion(f, res, hoy) {
  const antes = f.estado;
  f.estado = res.estado;
  f.rastreo = res.rastreo || f.rastreo || '';
  f.visto = hoy;
  if (dentro(res.estado) && f.clase) {
    f.ultimoEpisodio = { clase: f.clase, solicitudes: f.propuestas?.length ?? 0, entro: hoy };
    f.clase = null; f.propuestas = []; f.retirada = null; delete f.salio;
    return 'entra';
  }
  if (!dentro(res.estado) && dentro(antes)) {
    f.clase = 'salida'; f.salio = hoy; f.propuestas = []; f.retirada = null;
    return 'sale';
  }
  return null;
}

// -------------------------------------------------------------------------------------------------
// Casos de la elección (--probar)
// -------------------------------------------------------------------------------------------------
function probar() {
  const hoy = '2026-11-20';
  const fallos = [];
  const caso = (nombre, cond) => { if (!cond) fallos.push(nombre); };
  const u = (s) => `${SITIO}${s}/`;
  const fuera = 'Rastreada: actualmente sin indexar';

  // Orden por grupos y tope de 10
  const urls = {};
  for (let i = 0; i < 12; i++) urls[u(`fuera-${i}`)] = { clase: 'fuera', estado: fuera, senal: { google: i, bing: 0 } };
  urls[u('fuera-muda')] = { clase: 'fuera', estado: fuera, senal: { google: 0, bing: 0 } };
  urls[u('nueva')] = { clase: 'nueva', estado: 'Google no reconoce esta URL', alta: '2026-11-18' };
  urls[u('salida')] = { clase: 'salida', estado: fuera, salio: '2026-11-19', senal: { google: 1 } };
  urls[u('no-tomada')] = { clase: 'fuera', estado: fuera, rastreo: '2026-06-01', senal: { google: 5 },
    propuestas: [{ fecha: '2026-11-19', rastreada: false }] };
  urls[u('dentro')] = { clase: null, estado: 'Enviada e indexada' };
  let { lista } = elegirDelDia(urls, hoy);
  caso('el tope diario es 10', lista.length === 10);
  caso('primero la no rastreada desde su solicitud', lista[0].url === u('no-tomada'));
  caso('luego la nueva', lista[1].url === u('nueva'));
  caso('luego la salida', lista[2].url === u('salida'));
  caso('las de fuera por señal, de más a menos', lista[3].url === u('fuera-11'));
  caso('la de fuera sin señal no entra', !lista.some((x) => x.url === u('fuera-muda')));
  caso('la indexada no entra', !lista.some((x) => x.url === u('dentro')));
  caso('la no tomada no duplica la solicitud de hoy', urls[u('no-tomada')].propuestas.length === 2);

  // Repetir la pasada el mismo día no cambia la lista
  const segunda = elegirDelDia(urls, hoy).lista.map((x) => x.url).sort();
  caso('repetir el mismo día da la misma lista', JSON.stringify(segunda) === JSON.stringify(lista.map((x) => x.url).sort()));

  // Rastreada tras la solicitud: espera, segunda solicitud, retirada
  const r = { clase: 'salida', estado: fuera, rastreo: '2026-11-11', propuestas: [{ fecha: '2026-11-10', rastreada: false }] };
  let res = elegirDelDia({ [u('r')]: r }, '2026-11-20');
  caso('rastreada hace menos de 21 días: espera', res.lista.length === 0 && r.propuestas[0].rastreada);
  res = elegirDelDia({ [u('r')]: r }, '2026-12-01');
  caso('a los 21 días: segunda solicitud', res.lista.length === 1 && /2\.ª/.test(res.lista[0].motivo));
  r.rastreo = '2026-12-01';
  res = elegirDelDia({ [u('r')]: r }, '2026-12-03');
  caso('dos solicitudes rastreadas sin entrar: retirada', res.retiradasHoy.length === 1 && r.retirada);

  // Cuatro solicitudes seguidas sin rastreo: retirada
  const n = { clase: 'nueva', estado: 'Google no reconoce esta URL',
    propuestas: ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19'].map((fecha) => ({ fecha, rastreada: false })) };
  res = elegirDelDia({ [u('n')]: n }, hoy);
  caso('cuatro sin rastreo: retirada', res.retiradasHoy.length === 1 && /no la rastrea/.test(n.retirada?.motivo ?? ''));

  // Movimientos de la inspección
  const e = { clase: 'salida', estado: fuera, propuestas: [{ fecha: '2026-11-10', rastreada: true }] };
  caso('entra: sale de la cola', aplicarInspeccion(e, { estado: 'Enviada e indexada', rastreo: '2026-11-12' }, hoy) === 'entra' && e.clase === null);
  const s = { clase: null, estado: 'Enviada e indexada' };
  caso('sale: entra en la cola como salida', aplicarInspeccion(s, { estado: fuera, rastreo: '2026-06-01' }, hoy) === 'sale' && s.clase === 'salida');

  if (fallos.length) { console.error(`❌ ${fallos.length} casos fallan:\n  ${fallos.join('\n  ')}`); process.exit(1); }
  console.log('✅ elección del día: todos los casos pasan');
}

// -------------------------------------------------------------------------------------------------
// E/S: estado, siembra, sitemap y APIs
// -------------------------------------------------------------------------------------------------
function leerEstado() {
  return existsSync(ESTADO) ? JSON.parse(readFileSync(ESTADO, 'utf8')) : null;
}

/** Escritura atómica: temporal y renombrado, para no dejar un JSON a medias si algo corta. */
function guardarEstado(estado) {
  mkdirSync(CARPETA, { recursive: true });
  const tmp = `${ESTADO}.tmp`;
  writeFileSync(tmp, JSON.stringify(estado, null, 1) + '\n', 'utf8');
  JSON.parse(readFileSync(tmp, 'utf8'));
  renameSync(tmp, ESTADO);
}

function partirLinea(linea) {
  const out = []; let actual = ''; let comillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (c === '"') { if (comillas && linea[i + 1] === '"') { actual += '"'; i++; } else comillas = !comillas; }
    else if (c === ',' && !comillas) { out.push(actual); actual = ''; } else actual += c;
  }
  out.push(actual);
  return out;
}

/** Primera pasada: el último barrido completo da el estado de partida de cada URL. */
function sembrar() {
  const csvs = readdirSync(PRIVADO).filter((f) => /^indexacion-\d{4}-\d{2}-\d{2}\.csv$/.test(f)).sort();
  if (!csvs.length) throw new Error('no hay ningún barrido indexacion-AAAA-MM-DD.csv para sembrar la cola');
  const nombre = csvs.at(-1);
  const fecha = nombre.slice(11, 21);
  const lineas = readFileSync(path.join(PRIVADO, nombre), 'utf8').trim().split(/\r?\n/);
  const cab = partirLinea(lineas[0]);
  const urls = {};
  for (const l of lineas.slice(1)) {
    const r = Object.fromEntries(cab.map((c, i) => [c, partirLinea(l)[i] ?? '']));
    urls[r.url] = { estado: r.estado_hoy, rastreo: r.ultimo_rastreo, visto: fecha, alta: null, clase: dentro(r.estado_hoy) ? null : 'fuera' };
  }
  console.log(`Cola sembrada con ${nombre}: ${Object.keys(urls).length} URLs`);
  return { version: 1, sembrada: nombre, actualizado: null, rotacion: 0, urls, ultimaPasada: null };
}

async function urlsDelSitemap() {
  const r = await fetch(`${SITIO}sitemap.xml`);
  if (!r.ok) throw new Error(`el sitemap respondió HTTP ${r.status}`);
  const xml = await r.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()).filter((u) => u.startsWith(SITIO));
}

async function inspeccionar(cliente, url) {
  try {
    const { data } = await cliente.request({
      url: INSPECT_API, method: 'POST',
      data: { inspectionUrl: url, siteUrl: SITIO, languageCode: 'es' },
    });
    const r = data?.inspectionResult?.indexStatusResult ?? {};
    return { url, estado: r.coverageState ?? '', rastreo: (r.lastCrawlTime ?? '').slice(0, 10), error: !r.coverageState };
  } catch (e) {
    return { url, estado: '', rastreo: '', error: e?.response?.data?.error?.message ?? e.message ?? String(e) };
  }
}

async function enCola(items, n, tarea) {
  const salida = new Array(items.length);
  let siguiente = 0;
  const trabajador = async () => { while (siguiente < items.length) { const i = siguiente++; salida[i] = await tarea(items[i]); } };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, trabajador));
  return salida;
}

async function impresionesGoogle(cliente, hoy) {
  const fin = new Date(Date.parse(hoy) - 3 * 864e5);
  const ini = new Date(fin.getTime() - DIAS_SENAL * 864e5);
  const d = (x) => x.toISOString().slice(0, 10);
  const { data } = await cliente.request({
    url: `${GSC_API}/${encodeURIComponent(SITIO)}/searchAnalytics/query`, method: 'POST',
    data: { startDate: d(ini), endDate: d(fin), dimensions: ['page'], rowLimit: 25000 },
  });
  return new Map((data.rows ?? []).map((f) => [f.keys[0], f.impressions]));
}

/** Impresiones por página en Bing (GetPageStats: la URL viene en `Query`, filas por día). */
async function impresionesBing() {
  if (!process.env.MWT) throw new Error('falta MWT en .env.local');
  const r = await fetch(`${BING_API}/GetPageStats?apikey=${encodeURIComponent(process.env.MWT)}&siteUrl=${encodeURIComponent(SITIO)}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const m = new Map();
  for (const f of (await r.json()).d ?? []) m.set(f.Query, (m.get(f.Query) ?? 0) + (f.Impressions ?? 0));
  return m;
}

// -------------------------------------------------------------------------------------------------
// La pasada diaria
// -------------------------------------------------------------------------------------------------
async function pasada({ seco }) {
  const hoy = hoyLocal();
  if (!process.env.GSC_SA_KEY_FILE || !existsSync(process.env.GSC_SA_KEY_FILE)) {
    throw new Error('falta GSC_SA_KEY_FILE en .env.local (clave de la cuenta de servicio de GSC)');
  }
  const estado = leerEstado() ?? sembrar();
  const { urls } = estado;

  const key = JSON.parse(readFileSync(process.env.GSC_SA_KEY_FILE, 'utf8'));
  const cliente = new JWT({ email: key.client_email, key: key.private_key, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });

  // 1. Sitemap: las URLs que la cola no conocía son nuevas; las que ya no están, salen del estado
  const sitemap = await urlsDelSitemap();
  if (sitemap.length < 500) throw new Error(`el sitemap solo trae ${sitemap.length} URLs: no se fía de él`);
  const enSitemap = new Set(sitemap);
  const nuevasHoy = [];
  for (const url of sitemap) {
    if (!urls[url]) { urls[url] = { estado: '', rastreo: '', visto: null, alta: hoy, clase: 'nueva' }; nuevasHoy.push(url); }
  }
  const retiradasDelSitemap = Object.keys(urls).filter((u) => !enSitemap.has(u));
  for (const u of retiradasDelSitemap) delete urls[u];

  // 2. Señal: impresiones en Google (obligatoria) y en Bing (si falla, se sigue con Google)
  const google = await impresionesGoogle(cliente, hoy);
  if (google.size < MIN_PAGINAS_GSC) throw new Error(`GSC devolvió ${google.size} páginas con impresiones: el instrumento no mide`);
  let bing = new Map(); let avisoBing = '';
  try { bing = await impresionesBing(); } catch (e) { avisoBing = `Bing no respondió (${e.message}): la señal sale solo de Google`; }
  for (const [url, f] of Object.entries(urls)) {
    if (f.clase) f.senal = { google: google.get(url) ?? 0, bing: bing.get(url) ?? 0 };
  }

  // 3. Qué se inspecciona hoy: la cola con algo que pedir, las nuevas y un turno del resto
  const diarias = Object.entries(urls)
    .filter(([, f]) => f.clase && !f.retirada && (f.clase !== 'fuera' || conSenal(f) || f.propuestas?.length))
    .map(([u]) => u);
  const resto = Object.keys(urls).filter((u) => !diarias.includes(u)).sort();
  const turno = estado.rotacion % TURNOS_ROTACION;
  const deTurno = resto.filter((_, i) => i % TURNOS_ROTACION === turno);
  const aInspeccionar = [...diarias, ...deTurno];

  const resultados = await enCola(aInspeccionar, CONCURRENCIA, (u) => inspeccionar(cliente, u));
  const errores = resultados.filter((r) => r.error);
  if (errores.length > aInspeccionar.length * MAX_ERRORES) {
    throw new Error(`fallaron ${errores.length} de ${aInspeccionar.length} inspecciones (p. ej. ${errores[0].error}): no se escribe nada`);
  }

  // 4. Movimientos
  const entraronHoy = []; const salieronHoy = [];
  for (const r of resultados) {
    if (r.error) continue;
    const mov = aplicarInspeccion(urls[r.url], r, hoy);
    if (mov === 'entra') entraronHoy.push(r.url);
    if (mov === 'sale') salieronHoy.push(r.url);
  }
  // Una «nueva» que ya estaba indexada al verla por primera vez no es un movimiento: sale sin más
  for (const u of nuevasHoy) if (dentro(urls[u].estado)) { urls[u].clase = null; const i = entraronHoy.indexOf(u); if (i >= 0) entraronHoy.splice(i, 1); }

  // 5. Las del día
  const { lista, retiradasHoy } = elegirDelDia(urls, hoy);

  estado.rotacion = (estado.rotacion + 1) % TURNOS_ROTACION;
  estado.actualizado = new Date().toISOString();
  estado.ultimaPasada = {
    fecha: hoy, inspeccionadas: aInspeccionar.length, errores: errores.length, avisoBing,
    lista, nuevas: nuevasHoy, entraron: entraronHoy, salieron: salieronHoy, retiradas: retiradasHoy,
    fueraDelSitemap: retiradasDelSitemap,
  };
  if (!seco) guardarEstado(estado);

  console.log(`Cola de indexación ${hoy}: ${aInspeccionar.length} inspeccionadas (${errores.length} errores) · ` +
    `para pedir hoy: ${lista.length} · entraron ${entraronHoy.length} · salieron ${salieronHoy.length} · nuevas ${nuevasHoy.length}` +
    (seco ? ' · [SECO: estado sin escribir]' : ''));
  if (avisoBing) console.log(`AVISO: ${avisoBing}`);
}

// -------------------------------------------------------------------------------------------------
// Resumen para el /parte (sin API)
// -------------------------------------------------------------------------------------------------
function resumenParte() {
  const estado = leerEstado();
  if (!estado?.ultimaPasada) { console.log('Cola de indexación: aún no ha corrido ninguna pasada.'); return; }
  const { urls, ultimaPasada: p } = estado;
  const hoy = hoyLocal();
  const fichas = Object.values(urls);
  const enCola = fichas.filter((f) => f.clase && !f.retirada && !dentro(f.estado));
  const cuenta = (c) => enCola.filter((f) => f.clase === c).length;
  const sinSenal = enCola.filter((f) => f.clase === 'fuera' && !conSenal(f) && !f.propuestas?.length).length;
  const esperando = enCola.filter((f) => f.propuestas?.at(-1)?.rastreada).length;
  const retiradas = fichas.filter((f) => f.retirada && !dentro(f.estado)).length;
  const hora = new Date(estado.actualizado).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  if (p.fecha === hoy) console.log(`Cola de indexación · actualizada hoy a las ${hora}`);
  else console.log(`⚠️ Cola de indexación · NO se actualizó hoy: la última pasada es del ${fechaEs(p.fecha)} (mira el paso «Cola de indexacion» de la Rutina Matinal)`);
  console.log(`En cola: ${enCola.length - sinSenal} con algo que pedir (nuevas ${cuenta('nueva')} · salidas ${cuenta('salida')} · fuera con señal ${cuenta('fuera') - sinSenal}) · ` +
    `esperando el veredicto de Google: ${esperando} · retiradas: ${retiradas} · fuera sin señal (no se piden): ${sinSenal}`);
  console.log(`Última pasada: entraron ${p.entraron.length} · salieron ${p.salieron.length} · nuevas en el sitemap ${p.nuevas.length}` +
    (p.retiradas.length ? ` · retiradas hoy ${p.retiradas.length}` : ''));
  if (p.salieron.length) console.log(`  Salieron del índice: ${p.salieron.map(slugDe).join(' · ')}`);
  for (const u of p.retiradas) console.log(`  Retirada: ${slugDe(u)} — ${urls[u]?.retirada?.motivo ?? ''}`);
  if (p.avisoBing) console.log(`  Aviso: ${p.avisoBing}`);

  if (!p.lista.length) { console.log('\nPARA PEDIR HOY: ninguna'); return; }
  console.log(`\nPARA PEDIR HOY (${p.lista.length}) — Search Console → «Inspeccionar cualquier URL» → «Solicitar indexación»:`);
  p.lista.forEach(({ url, motivo }, i) => {
    const s = urls[url]?.senal;
    const senal = s && (s.google || s.bing) ? ` · ${s.google} impr. Google, ${s.bing} Bing` : '';
    console.log(`  ${String(i + 1).padStart(2)}. ${url} — ${motivo}${senal}`);
  });
}

/** Anota como pedidas hoy URLs que el usuario solicitó fuera de la lista del día. */
function marcarPedidas(lista) {
  const estado = leerEstado();
  if (!estado) throw new Error('la cola aún no existe: corre antes una pasada');
  const hoy = hoyLocal();
  for (const url of lista) {
    const f = estado.urls[url];
    if (!f) { console.log(`  ?  ${url} — no está en la cola (¿barra final?)`); continue; }
    if (dentro(f.estado)) { console.log(`  =  ${slugDe(url)} — ya consta indexada`); continue; }
    f.clase ??= 'fuera';
    f.propuestas ??= [];
    if (f.propuestas.at(-1)?.fecha !== hoy) f.propuestas.push({ fecha: hoy, rastreada: false });
    console.log(`  ✓  ${slugDe(url)} — anotada como pedida hoy`);
  }
  guardarEstado(estado);
}

// -------------------------------------------------------------------------------------------------
if (flag('probar')) probar();
else if (flag('parte')) resumenParte();
else if (args[0] === 'marcar-pedidas') marcarPedidas(args.slice(1));
else {
  try { await pasada({ seco: flag('seco') }); }
  catch (e) { console.error(`❌ Cola de indexación: ${e.message}`); process.exitCode = 1; }
}
