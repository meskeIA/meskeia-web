#!/usr/bin/env node
/**
 * check-colores-prohibidos.mjs — que ninguna línea NUEVA escriba #7C3AED ni #2DD4BF
 *
 * Ejecutar:  npm run check:colores-prohibidos              (lo ejecuta también `npm run build`)
 *            npm run check:colores-prohibidos -- --todo    (catálogo entero: informa, NO rompe)
 *            npm run check:colores-prohibidos -- --desde <ref>
 *
 * QUÉ BUSCA
 * El violeta #7C3AED y el turquesa #2DD4BF, que el CLAUDE.md prohíbe «sin excepciones»: no son
 * la marca. En .ts, .tsx y .css de app/, components/ y styles/, en las líneas que el commit
 * añade. Una línea que es solo comentario no cuenta.
 *
 * DE DÓNDE SALE (cabo C0635, inspector 04/11/2026)
 * tablero-comunicacion pinta la pestaña de la categoría «Personas» con `color: '#7C3AED'`, que
 * llega al `style` por datos (`style={{ color: cat.color }}`), y ningún candado lo veía:
 * check:contraste-marca busca la marca literal en el style y check:semanticos-claro solo barre
 * .module.css. Ni siquiera había un candado de los dos colores prohibidos.
 *
 * POR QUÉ SOLO LAS LÍNEAS AÑADIDAS
 * El 04/11/2026 un Grep los daba en 22 ficheros de app/ (28 apariciones), y no todos son color de
 * marca: en simulador-test-hipotesis el violeta es la serie del X observado en un gráfico, un
 * color de datos legítimo (nota del 06/11 en el cabo). Decidirlo es de cada app, así que el
 * pasivo lo drena el Inspector app por app y aquí solo se impide que entre otro.
 *
 * Escape: «colores-ok: <razón>» en la línea o en la anterior (un color de datos de un gráfico).
 * La marca a secas no vale.
 * La razón es obligatoria: `escapada()` de lineas-anadidas.mjs exige al menos tres caracteres
 * tras «colores-ok:», así que la marca a secas también rompe el build.
 *
 * Pruebas: `npm run colores-prohibidos:probar-candado`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ, argumentos, lineasTocadas, objetivos, escapada, esComentario } from './lineas-anadidas.mjs';

if (process.env.VERCEL) {
  console.log('✓ colores prohibidos: omitido en Vercel (se valida en local antes de subir)');
  process.exit(0);
}

// Con alfa de dos cifras (#7C3AED80) sigue siendo el violeta; con una sola cifra más no es un color
const PROHIBIDO = /#(7c3aed|2dd4bf)([0-9a-f]{2})?(?![0-9a-f])/i;
const args = argumentos();
const barrido = args.todo || args.sueltos.length > 0;
const relevante = (f) => /^(app|components|styles)\//.test(f) && /\.(tsx?|css)$/.test(f);

let ficheros;
try { ficheros = objetivos(args, { dirs: ['app', 'components', 'styles'], relevante }); } catch {
  console.log('✓ colores prohibidos: omitido (no se pudo consultar git)');
  process.exit(0);
}

const rompen = [];
const pasivo = [];
for (const rel of ficheros) {
  const abs = path.resolve(RAIZ, rel);
  if (!fs.existsSync(abs)) continue;
  const lineas = fs.readFileSync(abs, 'utf8').split('\n');
  const tocadas = barrido ? null : lineasTocadas(rel, args.base);
  lineas.forEach((texto, i) => {
    const m = texto.match(PROHIBIDO);
    if (!m || esComentario(texto) || escapada(lineas, i, 'colores-ok')) return;
    const caso = { rel, n: i + 1, color: m[0], texto: texto.trim().slice(0, 100) };
    (!barrido && (tocadas === null || tocadas.has(i + 1)) ? rompen : pasivo).push(caso);
  });
}

if (rompen.length) {
  console.error('\n✗ Colores prohibidos — el build se detiene\n');
  for (const c of rompen) console.error(`  ${c.rel}:${c.n}  ${c.color}\n      ${c.texto}`);
  console.error('\n#7C3AED (violeta) y #2DD4BF (turquesa) no son la marca: el CLAUDE.md los prohíbe.');
  console.error('Usa los tokens (var(--primary), var(--secondary)…). Si es un color de DATOS (la serie');
  console.error('de un gráfico), escribe «colores-ok: <razón>» en esa línea o en la anterior.\n');
  process.exit(1);
}

if (barrido) {
  const n = new Set(pasivo.map((c) => c.rel)).size;
  console.log(pasivo.length ? `· colores prohibidos — ${pasivo.length} aparición(es) en ${n} fichero(s) (pasivo, no rompe):` : '✓ colores prohibidos: ninguno en lo revisado');
  for (const c of pasivo) console.log(`  ${c.rel}:${c.n}  ${c.color}`);
  process.exit(0);
}
console.log(pasivo.length
  ? `✓ colores prohibidos: lo que añade este commit está limpio (${pasivo.length} anterior(es) sin tocar)`
  : '✓ colores prohibidos: ninguno en lo que toca este commit');
