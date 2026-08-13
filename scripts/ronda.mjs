#!/usr/bin/env node
/**
 * La Ronda — barrido operativo de TODO el catálogo, sin modelo y sin coste
 *
 * Ejecutar:  npm run ronda                  (las 1.172 URLs anunciadas, build local)
 *            npm run ronda -- --produccion  (contra meskeia.com — la pasada nocturna)
 *            npm run ronda -- --url /cronometro/,/golden-hour/
 *            npm run ronda -- --autocomprobar
 *            npm run ronda -- --limite 40 --concurrencia 8 --filtro visualizador
 *
 * QUÉ HACE — y qué NO
 * ───────────────────
 * Abre cada URL del catálogo en Chromium, la deja hidratar y anota solo lo que
 * NINGUNA comprobación estática puede ver: excepciones de JavaScript, errores de
 * hidratación de React, recursos que no cargan, páginas que se quedan en blanco
 * y `<title>` heredados de la home.
 *
 * NO juzga si un cálculo es correcto, ni si la app hace lo que promete, ni si el
 * dato normativo está vigente. Eso exige criterio y es trabajo del Inspector.
 * Aquí solo se responde a una pregunta: ¿esta página SIGUE FUNCIONANDO?
 *
 * Tampoco sustituye a los candados del build (`check:verticales`, `check:sitemap`,
 * `check:enlaces`, `check:fiscal-manifiesto`): aquéllos miran el código y rompen el
 * build; ésta mira el navegador y levanta acta.
 *
 * DE DÓNDE SALE (2026-08-13)
 * ──────────────────────────
 * `nivel-burbuja` estuvo rota desde febrero hasta julio porque un `feature=()` en
 * Permissions-Policy desactivó los sensores en silencio; se descubrió cinco meses
 * después, y por casualidad. Antes, 438 apps servían el `<title>` de la home por
 * no tener `layout.tsx`, y el aviso llegó desde Search Console meses más tarde.
 * Los dos fallos eran invisibles al build y visibles al primer vistazo del
 * navegador. Ese vistazo cuesta ~10 minutos para el catálogo entero: no hay razón
 * para no darlo cada noche.
 *
 * IMPORTANTE: la ronda BLOQUEA las llamadas a /api/analytics/* — un barrido de
 * 1.172 páginas metería un día entero de visitas falsas en Turso.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUERTO = 3050;
const DIR_INFORMES = path.join(RAIZ, '_private', 'rondas');

// ─── Argumentos ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const valorDe = (nombre, pordefecto) => {
  const i = args.indexOf(`--${nombre}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : pordefecto;
};
const LIMITE = parseInt(valorDe('limite', '0'), 10);
const CONCURRENCIA = parseInt(valorDe('concurrencia', '6'), 10);
const FILTRO = valorDe('filtro', '');
/** URLs sueltas separadas por coma — para revisar una app concreta o para autocomprobar */
const URLS_SUELTAS = valorDe('url', '');
/**
 * Prueba de control. Mete a propósito dos URLs que DEBEN fallar. Si la ronda las
 * da por buenas, la ronda está rota y su "0 errores" no vale nada — que es
 * justamente lo que pasa cuando un indicador lleva semanas diciendo lo mismo.
 */
const AUTOCOMPROBAR = args.includes('--autocomprobar');
/**
 * Contra qué se mide. Por defecto el build local, para poder comprobar un arreglo
 * antes de desplegarlo. La pasada automática de cada noche usa `--produccion`: lo que
 * importa es si está roto lo que ve la gente, y así no depende de que .next esté fresco
 * (además de que ve fallos de despliegue y de CDN que en local no existen).
 */
const PRODUCCION = args.includes('--produccion');
const BASE = PRODUCCION ? 'https://meskeia.com' : `http://localhost:${PUERTO}`;
/**
 * Una pasada parcial NO puede pisar el acta ni la línea de base de la ronda completa:
 * si lo hiciera, revisar tres apps sueltas borraría el estado de las 1.172 y la
 * comparación entre rondas mentiría en la siguiente ejecución.
 */
const ES_PARCIAL = Boolean(URLS_SUELTAS || FILTRO || LIMITE > 0 || AUTOCOMPROBAR);

// ─── Ruido conocido ───────────────────────────────────────────────────────────
// Todo lo que se añada aquí deja de vigilarse. Añadir solo con una razón escrita.

/** Estado separado por entorno, por la misma razón que las actas */
const FICHERO_ESTADO = () => path.join(DIR_INFORMES, PRODUCCION ? 'ultima-produccion.json' : 'ultima.json');

const RUIDO = [
  /favicon/i,
  /Download the React DevTools/i,
  /\/api\/analytics\//i,          // las bloqueamos nosotros a propósito
  /net::ERR_ABORTED/i,            // consecuencia del bloqueo anterior
  /ERR_INTERNET_DISCONNECTED/i,
  /\/api\/csp-report/i,           // el reporte de CSP falla POR el bloqueo: es efecto, no causa
  /\[PWA\].*Service Worker/i,     // no se puede registrar porque la ronda lo bloquea a propósito
];
const esRuido = t => RUIDO.some(r => r.test(t));

/**
 * Fallos de hidratación: la página funciona, pero el HTML del servidor no coincide
 * con el del cliente. Van a avisos, no a errores, para no tapar lo que sí rompe la app.
 * En producción React los sirve minificados, así que hay que reconocerlos por número.
 */
const HIDRATACION = /hydrat|did not match|Text content does not match|server rendered HTML|React error #(418|419|421|422|423|425)/i;
const NOMBRE_REACT = {
  418: 'hidratación: el texto renderizado no coincide con el del servidor',
  419: 'hidratación: el servidor abortó el render',
  421: 'hidratación: suspense no resolvió a tiempo',
  422: 'hidratación: el árbol del servidor no se pudo reutilizar',
  423: 'hidratación: error recuperado re-renderizando en cliente',
  425: 'hidratación: el texto no coincide (desajuste de contenido)',
};
/** Traduce el error minificado a algo que se pueda leer en el acta */
function legible(t) {
  const m = t.match(/React error #(\d+)/);
  if (m && NOMBRE_REACT[m[1]]) return `React #${m[1]} — ${NOMBRE_REACT[m[1]]}`;
  return t.slice(0, 180);
}

// ─── Catálogo ─────────────────────────────────────────────────────────────────

/**
 * Git Bash reescribe los argumentos que empiezan por `/` como rutas de Windows
 * (`/cronometro/` → `C:/Program Files/Git/cronometro/`). Se deshace aquí en vez de
 * pedir al que lo usa que recuerde exportar MSYS_NO_PATHCONV.
 */
function normalizarUrl(s) {
  let u = s.trim();
  const m = u.match(/^[A-Za-z]:[/\\].*?[/\\]Git[/\\](.*)$/);
  if (m) u = '/' + m[1];
  if (!u.startsWith('/')) u = '/' + u;
  return u.endsWith('/') ? u : u + '/';
}

function leerCatalogo() {
  if (URLS_SUELTAS) return URLS_SUELTAS.split(',').map(normalizarUrl).filter(u => u !== '/');
  if (AUTOCOMPROBAR) return ['/', '/ruta-que-no-existe-prueba-de-ronda/', '/otra-ruta-inventada/'];
  const txt = fs.readFileSync(path.join(RAIZ, 'data', 'implemented-apps.ts'), 'utf8');
  const urls = (txt.match(/"\/[^"]*\/"/g) || []).map(s => s.slice(1, -1));
  const unicas = [...new Set(urls)];
  return FILTRO ? unicas.filter(u => u.includes(FILTRO)) : unicas;
}

// ─── Servidor ─────────────────────────────────────────────────────────────────

const dormir = ms => new Promise(r => setTimeout(r, ms));

async function responde() {
  try {
    const r = await fetch(BASE + '/', { signal: AbortSignal.timeout(3000) });
    return r.ok;
  } catch { return false; }
}

async function asegurarServidor() {
  if (PRODUCCION) return null; // no hay nada que levantar
  if (await responde()) return null; // ya estaba levantado: no lo tocamos
  if (!fs.existsSync(path.join(RAIZ, '.next', 'BUILD_ID'))) {
    console.error('✗ No hay build en .next/. Ejecuta `npm run build` antes de la ronda.');
    process.exit(1);
  }
  console.log('  levantando next start...');
  const proc = spawn('npx', ['next', 'start', '-p', String(PUERTO)], {
    cwd: RAIZ, stdio: 'ignore', shell: true,
  });
  for (let i = 0; i < 40; i++) {
    await dormir(1000);
    if (await responde()) return proc;
  }
  console.error('✗ El servidor no llegó a responder en 40 s.');
  proc.kill();
  process.exit(1);
}

// ─── Revisión de una página ───────────────────────────────────────────────────

async function revisar(ctx, url, tituloHome) {
  const page = await ctx.newPage();
  const errores = [];   // rompen la app
  const avisos = [];    // sospechoso, puede ser legítimo

  await page.route('**/api/analytics/**', r => r.abort());

  page.on('pageerror', e => {
    const t = String(e.message || e);
    if (esRuido(t)) return;
    (HIDRATACION.test(t) ? avisos : errores).push(`excepción: ${legible(t)}`);
  });
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (esRuido(t)) return;
    (HIDRATACION.test(t) ? avisos : errores).push(`consola: ${legible(t)}`);
  });
  page.on('requestfailed', r => {
    if (esRuido(r.url())) return;
    avisos.push(`recurso sin cargar: ${r.url().replace(BASE, '').slice(0, 120)}`);
  });
  /**
   * Un 404 de recurso NO dispara 'requestfailed' (es una respuesta válida), y en consola
   * llega como un genérico "Failed to load resource" que no dice cuál. Sin esta captura,
   * el acta avisa de que algo falta pero no de qué: así se quedó sin detectar que el
   * enlace del pie a `meskeia.com/aviso-legal` llevaba a una página inexistente.
   */
  page.on('response', r => {
    if (r.status() < 400 || esRuido(r.url())) return;
    const u = r.url().replace(BASE, '').replace(/[?&]_rsc=[^&]*/, '');
    errores.push(`recurso ${r.status()}: ${u.slice(0, 130)}`);
  });

  let meta = {};
  try {
    const resp = await page.goto(BASE + url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const estado = resp ? resp.status() : 0;
    if (estado >= 400 || estado === 0) errores.push(`HTTP ${estado || 'sin respuesta'}`);

    await page.waitForTimeout(1100); // margen de hidratación y efectos de montaje

    meta = await page.evaluate(() => ({
      titulo: document.title || '',
      texto: document.body.innerText.trim().length,
      h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim()).filter(Boolean),
      controles: document.querySelectorAll('input, select, textarea, button').length,
      imgsRotas: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length,
    }));

    if (meta.texto < 300) errores.push(`página casi vacía (${meta.texto} caracteres de texto)`);
    if (!meta.titulo) errores.push('sin <title>');
    else if (meta.titulo === tituloHome && url !== '/') errores.push('sirve el <title> de la home (¿falta layout.tsx?)');
    if (meta.h1.length === 0) avisos.push('sin <h1>');
    else if (meta.h1.length > 1) avisos.push(`${meta.h1.length} elementos <h1>`);
    if (meta.imgsRotas > 0) avisos.push(`${meta.imgsRotas} imagen(es) que no cargan`);
  } catch (e) {
    errores.push(`navegación: ${String(e.message).slice(0, 160)}`);
  }

  await page.close();
  return { url, errores: [...new Set(errores)], avisos: [...new Set(avisos)], meta };
}

// ─── Ejecución en cola ────────────────────────────────────────────────────────

async function barrer(ctx, urls, tituloHome, alAvanzar) {
  const cola = [...urls];
  const res = [];
  await Promise.all(Array.from({ length: CONCURRENCIA }, async () => {
    while (cola.length) {
      const u = cola.shift();
      res.push(await revisar(ctx, u, tituloHome));
      alAvanzar(res.length);
    }
  }));
  return res;
}

// ─── Informe ──────────────────────────────────────────────────────────────────

function comparar(actual, anterior) {
  if (!anterior) return null;
  const antes = new Set(anterior.conIncidencia || []);
  const ahora = new Set(actual.filter(r => r.errores.length || r.avisos.length).map(r => r.url));
  return {
    nuevas: [...ahora].filter(u => !antes.has(u)),
    resueltas: [...antes].filter(u => !ahora.has(u)),
    persistentes: [...ahora].filter(u => antes.has(u)),
  };
}

function escribirInforme(res, dif, segundos, fecha) {
  fs.mkdirSync(DIR_INFORMES, { recursive: true });
  const conError = res.filter(r => r.errores.length);
  const conAviso = res.filter(r => !r.errores.length && r.avisos.length);

  const L = [];
  L.push(`# Ronda del ${fecha}`);
  L.push('');
  L.push(`${res.length} URLs revisadas en ${segundos} s · **${conError.length} con error** · ${conAviso.length} con aviso`);
  L.push('');
  if (dif) {
    L.push(`Frente a la ronda anterior: ${dif.nuevas.length} nuevas · ${dif.resueltas.length} resueltas · ${dif.persistentes.length} persistentes`);
    if (dif.nuevas.length) {
      L.push('');
      L.push('**Nuevas desde la última ronda** (esto es lo que hay que mirar primero):');
      for (const u of dif.nuevas) L.push(`- ${u}`);
    }
    L.push('');
  }

  if (conError.length) {
    L.push('## Errores');
    L.push('');
    for (const r of conError) {
      L.push(`### ${r.url}`);
      for (const e of r.errores) L.push(`- ${e}`);
      for (const a of r.avisos) L.push(`- (aviso) ${a}`);
      L.push('');
    }
  } else {
    L.push('## Errores');
    L.push('');
    L.push('Ninguno.');
    L.push('');
  }

  if (conAviso.length) {
    L.push('## Avisos');
    L.push('');
    for (const r of conAviso) L.push(`- **${r.url}** — ${r.avisos.join(' · ')}`);
    L.push('');
  }

  // Local y producción llevan estado separado: mezclarlos haría que un arreglo aún
  // sin desplegar apareciese como "resuelto" en la ronda de producción.
  const sufijo = PRODUCCION ? '-produccion' : '';
  const nombre = ES_PARCIAL ? `parcial${sufijo}-${fecha}.md` : `ronda${sufijo}-${fecha}.md`;
  fs.writeFileSync(path.join(DIR_INFORMES, nombre), L.join('\n'), 'utf8');
  if (ES_PARCIAL) return { conError, conAviso, nombre };

  const estado = {
    fecha,
    revisadas: res.length,
    errores: conError.length,
    avisos: conAviso.length,
    segundos,
    conIncidencia: res.filter(r => r.errores.length || r.avisos.length).map(r => r.url),
    detalle: res.filter(r => r.errores.length || r.avisos.length)
      .map(r => ({ url: r.url, errores: r.errores, avisos: r.avisos })),
  };
  fs.writeFileSync(FICHERO_ESTADO(), JSON.stringify(estado, null, 2), 'utf8');
  return { conError, conAviso, nombre };
}

// ─── Principal ────────────────────────────────────────────────────────────────

const t0 = Date.now();
let urls = leerCatalogo();
if (LIMITE > 0) urls = urls.slice(0, LIMITE);
console.log(`\nRonda de ${urls.length} URLs · ${CONCURRENCIA} en paralelo\n`);

const proc = await asegurarServidor();
const navegador = await chromium.launch({ headless: true });
/**
 * `serviceWorkers: 'block'` no es opcional: el 13/08/2026, al verificar el arreglo de
 * la CSP en producción, el service worker siguió sirviendo de su caché las respuestas
 * fallidas de ANTES del despliegue, y dos apps ya reparadas seguían apareciendo rotas.
 * Una ronda que mide la caché del navegador no mide el estado del sitio.
 */
const ctx = await navegador.newContext({
  viewport: { width: 1280, height: 900 },
  serviceWorkers: 'block',
});

// El título de la home es la referencia para detectar metadata heredada
const paginaHome = await ctx.newPage();
await paginaHome.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
const tituloHome = await paginaHome.title();
await paginaHome.close();

let ultimoAviso = 0;
const primera = await barrer(ctx, urls, tituloHome, n => {
  if (n - ultimoAviso >= 100 || n === urls.length) {
    ultimoAviso = n;
    process.stdout.write(`  ${n}/${urls.length}\n`);
  }
});

// Segunda pasada solo sobre lo que falló: descarta intermitencias
const sospechosas = primera.filter(r => r.errores.length).map(r => r.url);
let res = primera;
if (sospechosas.length) {
  console.log(`\n  reintentando ${sospechosas.length} con error para descartar intermitencias...`);
  const repetidas = await barrer(ctx, sospechosas, tituloHome, () => { });
  const porUrl = Object.fromEntries(repetidas.map(r => [r.url, r]));
  res = primera.map(r => porUrl[r.url] || r);
}

await navegador.close();
if (proc) proc.kill();

const segundos = Math.round((Date.now() - t0) / 1000);

if (AUTOCOMPROBAR) {
  const home = res.find(r => r.url === '/');
  const falsas = res.filter(r => r.url !== '/');
  const detectadas = falsas.filter(r => r.errores.length).length;
  console.log(`\n${'─'.repeat(64)}`);
  console.log('PRUEBA DE CONTROL');
  console.log(`  home (debe estar sana):     ${home && !home.errores.length ? 'OK' : 'FALLA → ' + (home ? home.errores.join(', ') : 'sin resultado')}`);
  console.log(`  rutas inventadas detectadas: ${detectadas}/${falsas.length}`);
  for (const r of falsas) console.log(`    ${r.url} → ${r.errores.join(', ') || 'NO DETECTADA'}`);
  const vale = home && !home.errores.length && detectadas === falsas.length;
  console.log(`\n  ${vale ? 'La ronda distingue una página sana de una rota.' : 'LA RONDA NO SIRVE: revisar antes de fiarse de ningún "0 errores".'}`);
  process.exit(vale ? 0 : 1);
}

const fecha = new Date().toISOString().slice(0, 10);
let anterior = null;
// Una pasada parcial no se compara con la ronda completa: los "resueltos" serían falsos
if (!ES_PARCIAL) {
  try { anterior = JSON.parse(fs.readFileSync(FICHERO_ESTADO(), 'utf8')); } catch { }
}
const dif = comparar(res, anterior);
const { conError, conAviso, nombre } = escribirInforme(res, dif, segundos, fecha);

console.log(`\n${'─'.repeat(64)}`);
console.log(`${ES_PARCIAL ? 'Pasada parcial' : 'Ronda completa'}: ${res.length} URLs en ${segundos} s`);
console.log(`Errores: ${conError.length} · Avisos: ${conAviso.length}`);
if (dif) console.log(`Nuevas: ${dif.nuevas.length} · Resueltas: ${dif.resueltas.length} · Persistentes: ${dif.persistentes.length}`);
if (ES_PARCIAL) console.log('(parcial: no toca la línea de base de la ronda completa)');
console.log(`Acta: _private/rondas/${nombre}`);
for (const r of conError.slice(0, 20)) console.log(`  ✗ ${r.url} — ${r.errores[0]}`);
if (conError.length > 20) console.log(`  ... y ${conError.length - 20} más en el acta`);

process.exit(conError.length ? 1 : 0);
