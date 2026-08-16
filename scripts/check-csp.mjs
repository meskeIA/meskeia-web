#!/usr/bin/env node
/**
 * check-csp.mjs — ningún recurso externo sin permiso en la CSP
 *
 * Ejecutar:  npm run check:csp        (lo ejecuta también `npm run build`)
 *
 * QUÉ HACE
 * ────────
 * Busca en el código las CARGAS de recursos externos (fetch, <link>, .src, @import,
 * url() en CSS, new Audio/Image/WebSocket…), extrae el dominio de cada una y comprueba
 * que la Content-Security-Policy lo permite en la directiva que le corresponde.
 * Si algo no está permitido, rompe el build.
 *
 * Verifica además que `next.config.ts` y `vercel.json` sirven la MISMA política: la CSP
 * vive en dos ficheros y una de las dos copias puede quedarse atrás sin que se note.
 *
 * QUÉ NO HACE
 * ───────────
 * No mira los `<a href>`: un enlace no consume CSP. Tampoco entiende URLs construidas
 * enteramente en tiempo de ejecución (`fetch(variable)`), así que un dominio que solo
 * exista dentro de una variable se le escapa. Por eso este candado NO sustituye a la
 * Ronda: uno mira el código, la otra mira el navegador.
 *
 * DE DÓNDE SALE (2026-08-13)
 * ──────────────────────────
 * El 23/02/2026 la CSP pasó a enforcement y dejó rotas, en silencio, cuatro apps:
 * generador-tipografias y adaptador-dislexia (Google Fonts), radio-meskeia (la API de
 * emisoras) y cronometro (audio en `data:`). Se descubrieron el 13/08/2026 —casi seis
 * meses después— en la primera Ronda. La misma decisión de febrero ya había roto los
 * sensores (nivel-burbuja, reparada el 25/07) y la cámara (reparada el 21/07), y las dos
 * también se encontraron por casualidad, meses tarde.
 *
 * (radio-meskeia se eliminó del catálogo el 16/08/2026: no era reparable de forma estable
 * porque los mirrors del tercero desaparecían del DNS sin aviso. Se cita aquí tal como
 * estaba en febrero, que es de lo que habla este apartado.)
 *
 * Tres roturas de la misma causa, descubiertas de una en una. Esto es el candado que
 * convierte esa clase de fallo en un error de build.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['app', 'components', 'lib', 'data'];
const EXTENSIONES = ['.ts', '.tsx', '.css', '.js', '.jsx'];

/**
 * Código de servidor: sus peticiones salen de Vercel, no del navegador, así que no
 * pasan por la CSP. Meterlo aquí produciría avisos de apps que funcionan.
 */
const ES_SERVIDOR = p => /[/\\]app[/\\]api[/\\]/.test(p) || /[/\\]route\.tsx?$/.test(p);

// ─── Patrones de CARGA de recurso (no de enlace) ──────────────────────────────
// Cada patrón declara a qué directiva de la CSP se somete lo que carga.

/** `null` = no consume CSP (preconnect y dns-prefetch abren conexión, no cargan recurso) */
function linkSegunRel(etiqueta) {
  const rel = (etiqueta.match(/rel=[`'"]?([\w-]+)/) || [])[1] || '';
  if (/preconnect|dns-prefetch/i.test(rel)) return null;
  if (/stylesheet/i.test(rel)) return 'style-src';
  if (/icon|apple-touch/i.test(rel)) return 'img-src';
  if (/preload|prefetch/i.test(rel)) {
    const as = (etiqueta.match(/\bas=[`'"]?(\w+)/) || [])[1] || '';
    return { font: 'font-src', style: 'style-src', script: 'script-src', image: 'img-src' }[as] || 'default-src';
  }
  return 'style-src';
}

const PATRONES = [
  { re: /fetch\s*\(\s*[`'"](https?:\/\/[^`'"\s)]+)/g, directiva: 'connect-src' },
  { re: /new\s+WebSocket\s*\(\s*[`'"](wss?:\/\/[^`'"\s)]+)/g, directiva: 'connect-src' },
  { re: /axios\s*\.\s*\w+\s*\(\s*[`'"](https?:\/\/[^`'"\s)]+)/g, directiva: 'connect-src' },
  { re: /new\s+Audio\s*\(\s*[`'"](https?:\/\/[^`'"\s)]+)/g, directiva: 'media-src' },
  // Un <link> se somete a una directiva u otra según su `rel`: una hoja de estilo
  // consume style-src, una fuente precargada font-src, y un preconnect no carga nada.
  { re: /<link[^>]*>/g, directiva: linkSegunRel, urlEn: /href=[`'"{\s]*(https?:\/\/[^`'"\s>}]+)/ },
  { re: /<script[^>]*src=[`'"{\s]*(https?:\/\/[^`'"\s>}]+)/g, directiva: 'script-src' },
  { re: /<iframe[^>]*src=[`'"{\s]*(https?:\/\/[^`'"\s>}]+)/g, directiva: 'frame-src' },
  { re: /<img[^>]*src=[`'"{\s]*(https?:\/\/[^`'"\s>}]+)/g, directiva: 'img-src' },
  { re: /\.href\s*=\s*[`'"](https:\/\/fonts\.googleapis\.com[^`'"\s]*)/g, directiva: 'style-src' },
  { re: /@import\s+(?:url\()?[`'"]?(https?:\/\/[^`'")\s;]+)/g, directiva: 'style-src' },
  { re: /url\(\s*[`'"]?(https?:\/\/[^`'")\s]+)/g, directiva: 'img-src' },
];

// Dominios que no consumen CSP aunque aparezcan en cargas: son metadatos o enlaces
const EXENTOS = [
  /^https?:\/\/schema\.org/i,
  /^https?:\/\/(www\.)?meskeia\.com/i,
  /^https?:\/\/(www\.)?(delegum|stemum|coquinum|cronicum)\.com/i,
];

// ─── Lectura de la CSP ────────────────────────────────────────────────────────

function cspDeNextConfig() {
  const txt = fs.readFileSync(path.join(RAIZ, 'next.config.ts'), 'utf8');
  const i = txt.indexOf("key: 'Content-Security-Policy'");
  if (i < 0) throw new Error('No se encuentra la CSP en next.config.ts');
  const bloque = txt.slice(i, txt.indexOf('].join', i));
  return (bloque.match(/"([^"]+)"/g) || []).map(s => s.slice(1, -1)).join('; ');
}

function cspDeVercel() {
  const json = JSON.parse(fs.readFileSync(path.join(RAIZ, 'vercel.json'), 'utf8'));
  for (const h of json.headers || [])
    for (const c of h.headers || [])
      if (c.key === 'Content-Security-Policy') return c.value;
  throw new Error('No se encuentra la CSP en vercel.json');
}

/** "style-src 'self' https://x" → { 'style-src': ["'self'", 'https://x'] } */
function parsear(csp) {
  const out = {};
  for (const parte of csp.split(';')) {
    const [dir, ...valores] = parte.trim().split(/\s+/);
    if (dir) out[dir] = valores;
  }
  return out;
}

function permitido(dominio, directiva, dirs) {
  const lista = dirs[directiva] || dirs['default-src'] || [];
  return lista.some(v => {
    if (v === '*') return true;
    if (v.startsWith("'")) return false; // 'self', 'unsafe-inline'… no autorizan dominios externos
    const limpio = v.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (limpio.startsWith('*.')) return dominio.endsWith(limpio.slice(1));
    return limpio === dominio;
  });
}

// ─── Recorrido de ficheros ────────────────────────────────────────────────────

function* ficheros(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* ficheros(p);
    else if (EXTENSIONES.includes(path.extname(e.name))) yield p;
  }
}

// ─── Principal ────────────────────────────────────────────────────────────────

const cspNext = cspDeNextConfig();
const cspVercel = cspDeVercel();
const dirs = parsear(cspNext);

const problemas = [];

// 1. Las dos copias de la política deben coincidir
const norm = s => s.split(';').map(x => x.trim().replace(/\s+/g, ' ')).filter(Boolean).sort().join(' | ');
if (norm(cspNext) !== norm(cspVercel)) {
  const a = new Set(cspNext.split(';').map(s => s.trim()));
  const b = new Set(cspVercel.split(';').map(s => s.trim()));
  problemas.push({
    tipo: 'desincronizada',
    detalle: [
      'next.config.ts y vercel.json sirven CSP distintas.',
      ...[...a].filter(x => !b.has(x)).map(x => `  solo en next.config.ts: ${x}`),
      ...[...b].filter(x => !a.has(x)).map(x => `  solo en vercel.json:   ${x}`),
    ].join('\n'),
  });
}

// 2. Todo recurso externo cargado desde el código debe estar permitido
const vistos = new Map(); // dominio+directiva → primer fichero donde aparece
for (const dir of DIRS) {
  const abs = path.join(RAIZ, dir);
  if (!fs.existsSync(abs)) continue;
  for (const f of ficheros(abs)) {
    if (ES_SERVIDOR(f)) continue;
    const txt = fs.readFileSync(f, 'utf8');
    for (const { re, directiva: reglaDirectiva, urlEn } of PATRONES) {
      for (const m of txt.matchAll(re)) {
        // Los patrones con `urlEn` capturan la etiqueta entera y sacan la URL después
        const url = urlEn ? (m[0].match(urlEn) || [])[1] : m[1];
        if (!url) continue;
        const directiva = typeof reglaDirectiva === 'function' ? reglaDirectiva(m[0]) : reglaDirectiva;
        if (!directiva) continue; // no consume CSP
        if (EXENTOS.some(r => r.test(url))) continue;
        let dominio;
        try { dominio = new URL(url).hostname; } catch { continue; }
        const clave = `${dominio}|${directiva}`;
        if (vistos.has(clave)) continue;
        vistos.set(clave, path.relative(RAIZ, f));
        if (!permitido(dominio, directiva, dirs))
          problemas.push({ tipo: 'sin permiso', dominio, directiva, fichero: path.relative(RAIZ, f) });
      }
    }
  }
}

if (!problemas.length) {
  console.log(`✓ CSP: ${vistos.size} recursos externos, todos permitidos, y las dos copias coinciden`);
  process.exit(0);
}

console.error('\n✗ CSP — el build se detiene\n');
for (const p of problemas) {
  if (p.tipo === 'desincronizada') console.error(p.detalle + '\n');
  else console.error(`  ${p.dominio} se carga en ${p.fichero}\n    y ${p.directiva} no lo permite → la app está rota en producción\n`);
}
console.error('Añade el dominio a la CSP en next.config.ts Y en vercel.json (los dos), o retira el recurso.\n');
process.exit(1);
