#!/usr/bin/env node
/**
 * check-bailout-prerender.mjs — que ninguna página prerenderizada caiga a renderizado en cliente
 * sin que se haya decidido
 *
 * Ejecutar:  npm run check:bailout          (lo ejecuta `npm run build` DESPUÉS de `next build`)
 *            … --dir <carpeta>              (otro árbol de HTML: lo usan las pruebas)
 *
 * QUÉ BUSCA
 * ─────────
 * En los HTML que `next build` deja en `.next/server/app/`, la frontera de Suspense que React
 * marca con `data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"`: lo que va dentro NO está en el HTML
 * servido, se pinta en el navegador. Para un buscador o un asistente de IA que lee el HTML, ese
 * contenido no existe.
 *
 * POR QUÉ DESPUÉS DEL BUILD, Y NO EN LOS TESTS
 * ────────────────────────────────────────────
 * `next dev` renderiza cada petición al vuelo y NO genera el bailout: un spec que comprueba «esto
 * está en el HTML servido» pasa en verde bajo dev y falla en producción. Pasó con el CASO 15 de
 * estimador-cartera-inversion (cabo C0160, 08/10/2026): el <Suspense fallback={null}> de la
 * reparación del 2970 dejó una frontera en el prerender que dev no enseñaba. El Inspector y
 * /reparar trabajan contra dev; el único momento en que existe el HTML de producción es el build
 * de /push. Medido el 13/10/2026: de 1.632 HTML prerenderizados, 1 con bailout (ese).
 *
 * QUÉ NO HACE
 * ───────────
 * No distingue una frontera vacía e inocente (un lector de ?parametro= que no pinta nada) de una
 * que esconde contenido: en el HTML las dos son `<template data-dgst=…></template>` y nada más.
 * Por eso cada página con bailout se DECLARA abajo con su razón, y una nueva rompe el build hasta
 * que alguien mire qué queda fuera del HTML y lo decida.
 *
 * Sin escape en el código de la app: el sitio para decidirlo es ACEPTADOS.
 * Pruebas: npm run bailout:probar-candado.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const iDir = process.argv.indexOf('--dir');
const DIR = iDir !== -1 ? path.resolve(process.argv[iDir + 1]) : path.join(RAIZ, '.next', 'server', 'app');

/** Páginas (ruta relativa del .html, sin extensión) con bailout ya mirado y aceptado. */
const ACEPTADOS = {
  'estimador-cartera-inversion':
    'frontera vacía: <LectorPerfilURL> solo lee ?perfil= (lo envía test-perfil-inversor) y no pinta nada; ' +
    'el contenido de la app está fuera del Suspense (C0160, 08/10/2026)',
};

const MARCA = 'BAILOUT_TO_CLIENT_SIDE_RENDERING';
/** Por debajo de esto no es el árbol de un build completo, y callar sería mentir. */
const MINIMO_HTML = 50;

// En Vercel no se ejecuta: allí `next build` no deja los .html del prerender en .next/server/app
// (el primer deploy con este candado, 13/10/2026, encontró 0 y se plantó). El build local de
// /push, que es donde manda el flujo del proyecto, ya lo ha pasado antes del push.
if (process.env.VERCEL && iDir === -1) {
  console.log('✓ bailout del prerender: omitido en Vercel (se valida en el build local de /push)');
  process.exit(0);
}

if (!fs.existsSync(DIR)) {
  console.error(`\n✗ bailout del prerender: no existe ${DIR} — ¿ha corrido next build?\n`);
  process.exit(1);
}

const html = [];
const rec = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) rec(abs);
    else if (e.name.endsWith('.html')) html.push(abs);
  }
};
rec(DIR);

if (html.length < MINIMO_HTML) {
  console.error(`\n✗ bailout del prerender: solo ${html.length} HTML en ${DIR}; no parece un build completo\n`);
  process.exit(1);
}

const conBailout = [];
for (const abs of html) {
  if (!fs.readFileSync(abs, 'utf8').includes(MARCA)) continue;
  conBailout.push(path.relative(DIR, abs).replace(/\\/g, '/').replace(/\.html$/, ''));
}

const nuevos = conBailout.filter((p) => !(p in ACEPTADOS));
const caducados = Object.keys(ACEPTADOS).filter((p) => !conBailout.includes(p));

if (nuevos.length) {
  console.error('\n✗ Bailout en el prerender — el build se detiene\n');
  for (const p of nuevos) console.error(`  ${p}.html  tiene una frontera BAILOUT_TO_CLIENT_SIDE_RENDERING`);
  console.error('\nLo que va dentro de esa frontera NO está en el HTML servido: lo pinta el navegador,');
  console.error('y buscadores y asistentes de IA no lo ven. `next dev` no lo enseña. Suele venir de un');
  console.error('<Suspense> alrededor de algo que lee useSearchParams, o de dynamic(…, { ssr: false }).');
  console.error('Si lo de dentro no pinta contenido, declara la página en ACEPTADOS de');
  console.error('scripts/check-bailout-prerender.mjs con su razón; si lo pinta, sácalo del Suspense.\n');
  process.exit(1);
}

for (const p of caducados) {
  console.log(`· bailout del prerender: ${p} está en ACEPTADOS y ya no tiene bailout; retírala de la lista`);
}
console.log(`✓ bailout del prerender: ${html.length} HTML, ${conBailout.length} con bailout, todos declarados`);
