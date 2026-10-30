#!/usr/bin/env node
/**
 * Auditoría de TRAZABILIDAD de las fuentes de `data/fiscal/`
 *
 * Ejecutar:  npm run audit:fiscal-fuentes
 *            npm run audit:fiscal-fuentes -- --solo-enlaces   (solo la parte 2)
 *            npm run audit:fiscal-fuentes -- --probar          (reinyecta los casos de origen)
 *
 * QUÉ COMPRUEBA
 * ─────────────
 * 1. Que cada identificador `BOE-A-XXXX-XXXXX` citado en `data/fiscal/` abra de verdad la norma
 *    que el módulo dice estar citando. Descarga la ficha del BOE y muestra el título real junto
 *    al contexto de la cita, para compararlos a ojo.
 * 2. Que cada URL externa escrita a mano en `data/fiscal/`, `app/` y `components/` siga abriendo:
 *    los `urlOficial` que pinta el <DataReference> y los enlaces fijos de las apps. Lista los 404
 *    y 410 (rotos: cuentan para la salida 1) y, aparte, lo que no se puede concluir desde aquí
 *    (403, 5xx, errores de red o de certificado, redirección a la portada), que se abre a mano.
 *    Escape: `enlace-ok: <razón>` en la línea o en la anterior, para lo que no es un enlace que se
 *    visite (la base de una API, un `$schema`, los dominios inventados de un ejercicio). Razón
 *    obligatoria: la marca a secas no escapa.
 *
 * Salida: 0 todo bien · 1 identificador sin respuesta o enlace roto · 2 INSTRUMENTO ROTO (la red
 * no llega ni al BOE: no interpretar ningún resultado de esa ejecución).
 *
 * POR QUÉ NO ES UN CANDADO DEL BUILD
 * ──────────────────────────────────
 * Depende de la red. Un candado que rompe el build porque el BOE tarda en responder se acaba
 * desactivando, y entonces no protege de nada. Este script se ejecuta en el triaje mensual
 * (`/triaje-fiscal`) y en el barrido de trazabilidad; la §1.0 del manifiesto lo referencia.
 *
 * DE DÓNDE SALE (2026-08-13)
 * ──────────────────────────
 * `iprem.ts` citaba «Ley 31/2022 de PGE 2023» con la referencia BOE-A-2022-22685, que es el
 * RDL 20/2022 — otra norma. Las cifras del IPREM eran correctas (DA 90.ª de la Ley 31/2022,
 * BOE-A-2022-22128), así que nada delataba el error: el dato era bueno, la cita parecía formal
 * y el módulo se había sellado el día anterior. Solo se cazó abriendo el identificador.
 *
 * LA PARTE 2 (2026-10-30, S0238)
 * ──────────────────────────────
 * La parte 1 abría los identificadores BOE-A- y nada miraba las demás URL. Una sonda de ese día
 * encontró 7 `urlOficial` de `data/fiscal/` en 404 (la sede de la AEAT reorganizó las páginas de
 * Sociedades, ISD, Patrimonio, ITSGF y el calendario; además IMSERSO y nómadas digitales), que
 * son la «Fuente oficial» del <DataReference> de ~20 páginas de riesgo 1, más 3 enlaces fijos de
 * apps y el de feedback de `app/error.tsx`. Cabo C0526. Lo que NO ve: una página que responde 200
 * con un «no encontrado» dentro (soft 404) y una que sigue viva pero ya no dice lo que se cita.
 */

import { execFile } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { devNull } from 'node:os';
import path from 'node:path';

const DIR_FISCAL = 'data/fiscal';
const DIRS_ENLACES = ['data/fiscal', 'app', 'components'];
const SOLO_ENLACES = process.argv.includes('--solo-enlaces');
const PROBAR = process.argv.includes('--probar');

const rojo = (s) => `\x1b[31m${s}\x1b[0m`;
const verde = (s) => `\x1b[32m${s}\x1b[0m`;
const gris = (s) => `\x1b[90m${s}\x1b[0m`;
const amarillo = (s) => `\x1b[33m${s}\x1b[0m`;

// ─── Parte 1 · identificadores BOE-A- ──────────────────────────────────────────

async function auditarBOE() {
  const ficheros = readdirSync(DIR_FISCAL).filter((f) => f.endsWith('.ts') || f.endsWith('.md'));
  const citas = new Map(); // identificador → [{ fichero, linea, contexto }]

  for (const fichero of ficheros) {
    const lineas = readFileSync(path.join(DIR_FISCAL, fichero), 'utf8').split('\n');
    lineas.forEach((linea, i) => {
      for (const m of linea.matchAll(/BOE-A-\d{4}-\d+/g)) {
        if (!citas.has(m[0])) citas.set(m[0], []);
        citas.get(m[0]).push({
          fichero,
          linea: i + 1,
          contexto: linea.trim().slice(0, 160),
        });
      }
    });
  }

  if (citas.size === 0) {
    console.error(rojo('✗ [fuentes] Ningún identificador BOE-A- en data/fiscal/.'));
    console.error(gris('    Con la §1.0 del manifiesto en vigor, eso es una anomalía: revisa la ruta.'));
    return 1;
  }

  console.log(gris(`Consultando el BOE para ${citas.size} identificador(es) citado(s) en ${DIR_FISCAL}/…\n`));

  let sinRespuesta = 0;

  for (const [id, usos] of [...citas].sort()) {
    let titulo;
    try {
      const r = await fetch(`https://www.boe.es/diario_boe/txt.php?id=${id}`, {
        headers: { 'User-Agent': 'meskeIA/auditoria-fuentes-fiscales' },
      });
      const html = await r.text();
      const m = html.match(/<title>([^<]+)<\/title>/i);
      titulo = m ? m[1].replace(/\s+/g, ' ').replace(id, '').trim() : null;
      if (!titulo) sinRespuesta++;
    } catch (e) {
      titulo = null;
      sinRespuesta++;
      console.log(amarillo(`${id} — no se pudo consultar (${e.message})`));
      continue;
    }

    console.log(`${verde(id)} → ${titulo ?? amarillo('(sin título en la respuesta)')}`);
    for (const uso of usos) {
      console.log(gris(`    ${uso.fichero}:${uso.linea}  ${uso.contexto}`));
    }
    console.log();
  }

  console.log(
    gris(
      'Compara el título real con lo que dice cada cita. Un identificador que abre otra norma es el\n' +
        'fallo que busca esta auditoría, y no lo delata ni el dato (puede ser correcto) ni el sello\n' +
        '(puede ser de ayer). La comparación es humana a propósito: "Ley 31/2022" y "RDL 20/2022" solo\n' +
        'se distinguen leyendo.\n',
    ),
  );

  if (sinRespuesta > 0) {
    console.log(amarillo(`⚠ ${sinRespuesta} identificador(es) sin respuesta del BOE: repite la consulta antes de darlos por buenos.`));
    return 1;
  }
  console.log(verde(`✓ [fuentes] ${citas.size} identificador(es) consultado(s) en el BOE.\n`));
  return 0;
}

// ─── Parte 2 · ¿siguen abriendo las URL escritas a mano? ───────────────────────

/** Dominios propios, espacios de nombres y marcadores de ejemplo: no son enlaces que se visiten. */
const NO_SE_VISITAN =
  /^https?:\/\/([a-z0-9-]+\.)*(meskeia|delegum|stemum|coquinum|cronicum)\.com|^https?:\/\/(www\.)?(schema\.org|w3\.org|sitemaps\.org)|fonts\.(googleapis|gstatic)\.com|localhost|127\.0\.0\.1|(ejemplo|example|tudominio|tuempresa|tusitio)\.(com|org|es|net)/;

/** Escape: `enlace-ok: <razón>` en la línea o en la anterior. La marca sin razón no escapa. */
const ESCAPE = /enlace-ok:\s*\S/;

/**
 * URL literales de un fichero TS/TSX, sin las de los comentarios (scripts/CLAUDE.md: este
 * repositorio cita código en los comentarios), los `placeholder=` de un input, ni los prefijos
 * que se completan concatenando o con `${}`: esos no se pueden abrir tal cual. Una URL que es
 * base de una API o un identificador (`$schema`) se escapa en su línea con `enlace-ok:`.
 */
export function extraerUrls(texto) {
  // Los comentarios se vacían sin quitar sus saltos de línea, para que el número de línea cuadre.
  const limpio = texto
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
  const lineas = texto.split('\n');
  const urls = [];
  for (const m of limpio.matchAll(/(["'`])(https?:\/\/[^"'`\s]+)\1/g)) {
    const url = m[2];
    if (url.includes('${') || NO_SE_VISITAN.test(url)) continue;
    if (!/^https?:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(url)) continue; // «https://...»
    if (/^\s*\+/.test(limpio.slice(m.index + m[0].length))) continue;
    if (/placeholder=\{?\s*$/.test(limpio.slice(Math.max(0, m.index - 20), m.index))) continue;
    const n = limpio.slice(0, m.index).split('\n').length - 1;
    if (ESCAPE.test(lineas[n]) || (n > 0 && ESCAPE.test(lineas[n - 1]))) continue;
    urls.push(url);
  }
  return urls;
}

function recorrer(dir, salida = []) {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) {
      if (f !== 'node_modules' && !f.startsWith('.')) recorrer(p, salida);
    } else if (/\.(ts|tsx)$/.test(f)) salida.push(p);
  }
  return salida;
}

function recogerEnlaces() {
  const enlaces = new Map(); // url → Set de ficheros
  for (const dir of DIRS_ENLACES) {
    for (const fichero of recorrer(dir)) {
      for (const url of extraerUrls(readFileSync(fichero, 'utf8'))) {
        if (!enlaces.has(url)) enlaces.set(url, new Set());
        enlaces.get(url).add(fichero.split(path.sep).join('/'));
      }
    }
  }
  return enlaces;
}

const NAVEGADOR = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

/**
 * Segunda vía cuando `fetch` ni siquiera recibe respuesta. Medido el 30/10/2026: Node no abre
 * www.agenciatributaria.es (UNSPECIFIED), ni páginas con cabeceras enormes (openai, yahoo), ni
 * certificados cuya cadena no completa (bonosocial); curl usa el almacén de Windows y sí, y así
 * salieron dos 404 de la AEAT que con Node quedaban en «no concluyente».
 */
function pedirConCurl(url) {
  return new Promise((resolver) => {
    execFile(
      'curl',
      ['-s', '-L', '-o', devNull, '-w', '%{http_code} %{url_effective}', '--max-time', '20', '-A', NAVEGADOR, url],
      (_error, salida) => {
        const [codigo, final] = String(salida ?? '').trim().split(' ');
        resolver(Number(codigo) > 0 ? { estado: Number(codigo), final } : null);
      },
    );
  });
}

async function pedir(url) {
  try {
    // GET y no HEAD: hay servidores que contestan 404 o 405 a HEAD y 200 a GET.
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': NAVEGADOR } });
    await r.body?.cancel();
    return { estado: r.status, final: r.url };
  } catch (e) {
    const error = e.cause?.code || e.name;
    return (await pedirConCurl(url)) ?? { estado: null, error };
  }
}

/** rota (404/410: cuenta) · dudosa (no concluyente desde aquí: se abre a mano) · viva */
export function clasificar(url, { estado, final, error }) {
  if (estado === 404 || estado === 410) return { clase: 'rota', motivo: String(estado) };
  if (estado === null) {
    const cert = /CERT|SIGNATURE|SELF_SIGNED/.test(error ?? '');
    const cabeceras = error === 'UND_ERR_HEADERS_OVERFLOW';
    return {
      clase: 'dudosa',
      motivo: cert
        ? `${error} (Node no completa la cadena; en el navegador suele abrir)`
        : cabeceras
          ? `${error} (cabeceras demasiado grandes para Node; en el navegador suele abrir)`
          : `sin respuesta: ${error}`,
    };
  }
  if (estado >= 400) return { clase: 'dudosa', motivo: `${estado}${estado === 403 || estado === 429 ? ' (puede ser un bloqueo a robots)' : ''}` };
  const origen = new URL(url);
  const destino = new URL(final);
  // Solo en el mismo dominio: openai.com/chatgpt → chatgpt.com es un cambio de marca, no una baja.
  if (destino.host === origen.host && destino.pathname === '/' && origen.pathname !== '/' && !destino.search) {
    return { clase: 'dudosa', motivo: `redirige a la portada (${destino.host}): la página ya no existe con esa dirección` };
  }
  return { clase: 'viva' };
}

async function comprobar(url) {
  let r = await pedir(url);
  let c = clasificar(url, r);
  // Un fallo de red o un 5xx pueden ser de un momento: un reintento antes de informar.
  if (c.clase === 'dudosa' && (r.estado === null || r.estado >= 500)) {
    await new Promise((ok) => setTimeout(ok, 2000));
    r = await pedir(url);
    c = clasificar(url, r);
  }
  return c;
}

async function enParalelo(items, n, fn) {
  const salida = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) {
        const j = i++;
        salida[j] = await fn(items[j]);
      }
    }),
  );
  return salida;
}

async function auditarEnlaces() {
  // Control del instrumento: si ni el BOE contesta, el roto es la red y no los enlaces.
  const control = await pedir('https://www.boe.es/');
  if (control.estado !== 200) {
    console.error(rojo(`🚨 INSTRUMENTO ROTO: https://www.boe.es/ no responde 200 (${control.estado ?? control.error}).`));
    console.error(gris('   Ningún resultado de enlaces de esta ejecución vale nada. Comprueba la red y repite.'));
    return 2;
  }

  const enlaces = recogerEnlaces();
  console.log(gris(`Abriendo ${enlaces.size} URL externa(s) escrita(s) a mano en ${DIRS_ENLACES.join(', ')}…\n`));
  const urls = [...enlaces.keys()].sort();
  const clases = await enParalelo(urls, 10, comprobar);

  const rotas = urls.map((u, i) => [u, clases[i]]).filter(([, c]) => c.clase === 'rota');
  const dudosas = urls.map((u, i) => [u, clases[i]]).filter(([, c]) => c.clase === 'dudosa');
  const donde = (u) => {
    const fs = [...enlaces.get(u)];
    return fs.slice(0, 4).join(', ') + (fs.length > 4 ? ` y ${fs.length - 4} más` : '');
  };

  for (const [u, c] of rotas) {
    console.log(`${rojo(`✗ ${c.motivo}`)}  ${u}`);
    console.log(gris(`    ${donde(u)}`));
  }
  if (dudosas.length) console.log(amarillo(`\nNo concluyentes desde aquí (ábrelas en el navegador):`));
  for (const [u, c] of dudosas) {
    console.log(`${amarillo('?')} ${u}\n${gris(`    ${c.motivo} · ${donde(u)}`)}`);
  }

  console.log(
    gris(
      '\nUn urlOficial roto es la «Fuente oficial» que enseña el <DataReference>: la dirección nueva se\n' +
        'busca en la web del organismo y, en data/fiscal, se cambia con el OK del usuario (frontera fiscal).\n' +
        'Lo que no ve: una página que responde 200 con un «no encontrado» dentro, o que ya no dice lo citado.\n',
    ),
  );

  if (rotas.length) {
    console.log(rojo(`✗ [enlaces] ${rotas.length} rota(s) de ${urls.length} · ${dudosas.length} no concluyente(s).`));
    return 1;
  }
  console.log(verde(`✓ [enlaces] ${urls.length} URL abiertas, ninguna rota · ${dudosas.length} no concluyente(s).`));
  return 0;
}

// ─── --probar: reinyectar los casos de origen y exigir que se detecten ──────────

async function probar() {
  let fallos = 0;
  const caso = (ok, texto) => {
    if (!ok) fallos++;
    console.log(`${ok ? '✅' : '❌'} ${texto}`);
  };

  // Extracción: solo las URL que se abrirían tal cual.
  const muestra = [
    '/* <a href="https://comentario.gob.es/x">no</a> */',
    "// const v = 'https://linea.gob.es/x';",
    '{/* <a href="https://jsx.gob.es/x"> */}',
    '<a href="https://vivo.gob.es/a">vivo</a>',
    "export const META = { urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/impuestos-tasas/isd.html' };",
    "const prefijo = 'https://www.boe.es/diario_boe/txt.php?id=' + id;",
    'const plantilla = `https://x.com/${usuario}`;',
    "const propia = 'https://meskeia.com/calculadora/';",
    "const ejemplo = 'https://www.ejemplo.com/';",
    '<input placeholder="https://tienda.com/producto" />',
    "const API = 'https://api.base.org/v2'; // enlace-ok: base de la API, no se abre sola",
    '// enlace-ok: dominio inventado del ejercicio',
    "  url: 'http://inventado.online',",
    "const sinRazon = 'https://sin-razon.gob.es/x'; // enlace-ok:",
  ].join('\n');
  const esperadas = [
    'https://vivo.gob.es/a',
    'https://sede.agenciatributaria.gob.es/Sede/impuestos-tasas/isd.html',
    'https://sin-razon.gob.es/x',
  ];
  const sacadas = extraerUrls(muestra);
  caso(
    JSON.stringify(sacadas) === JSON.stringify(esperadas),
    'extracción: saca el enlace, el urlOficial y el escape sin razón; calla comentarios, prefijos, plantillas,' +
      ` propias, ejemplos, placeholders y escapes con razón → ${JSON.stringify(sacadas)}`,
  );

  // Clasificación contra un servidor local, sin depender de la red.
  const servidor = createServer((req, res) => {
    const rutas = {
      '/vivo': [200],
      '/Sede/impuestos-tasas/isd.html': [404], // el caso de origen, 30/10/2026
      '/retirada': [410],
      '/mudada': [301, { Location: '/' }],
      '/': [200],
      '/prohibida': [403],
    };
    const [estado, cabeceras] = rutas[req.url] ?? [404];
    res.writeHead(estado, cabeceras);
    res.end('x');
  });
  await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const espera = [
    ['/vivo', 'viva', 'una página que abre'],
    ['/Sede/impuestos-tasas/isd.html', 'rota', '30/10: urlOficial del ISD en 404 (sede AEAT reorganizada)'],
    ['/retirada', 'rota', 'una página retirada (410)'],
    ['/mudada', 'dudosa', 'una dirección que redirige a la portada'],
    ['/prohibida', 'dudosa', 'un 403, que puede ser un bloqueo a robots'],
  ];
  for (const [ruta, clase, texto] of espera) {
    const c = clasificar(base + ruta, await pedir(base + ruta));
    caso(c.clase === clase, `${texto}: debe salir «${clase}» → «${c.clase}»`);
  }
  servidor.close();
  const sinServidor = clasificar('http://127.0.0.1:9/', await pedir('http://127.0.0.1:9/'));
  caso(sinServidor.clase === 'dudosa', `sin servidor detrás: debe salir «dudosa», no «rota» → «${sinServidor.clase}»`);

  console.log(fallos ? `\n❌ ${fallos} caso(s) mal: el auditor no ve lo que debería ver` : '\n✅ el auditor detecta los casos de origen y calla en los limpios');
  return fallos ? 1 : 0;
}

// ─── Ejecución ─────────────────────────────────────────────────────────────────

// process.exitCode y no process.exit(): en Windows, salir con sockets de fetch abiertos hace
// saltar una aserción de libuv y el proceso devuelve 127 en vez del código previsto.
if (PROBAR) {
  process.exitCode = await probar();
} else {
  const boe = SOLO_ENLACES ? 0 : await auditarBOE();
  const enlaces = await auditarEnlaces();
  process.exitCode = enlaces === 2 ? 2 : Math.max(boe, enlaces);
}
