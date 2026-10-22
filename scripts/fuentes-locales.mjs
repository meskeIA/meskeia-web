#!/usr/bin/env node
/**
 * Fuentes de los portales, guardadas en el repositorio: el build ya no va a Google.
 *
 * POR QUÉ (22/10/2026): con `next/font/google`, CADA build descargaba de Google las fuentes de
 * los cuatro portales, y un fallo de esa descarga tumbaba el despliegue entero aunque nadie
 * hubiera tocado una fuente (pasó días antes con Sora). Ahora los .woff2 viven junto a su portal
 * y el build solo lee ficheros del repositorio. Lo frágil —ir a internet— queda en este script,
 * que se ejecuta a mano y muy de vez en cuando: si falla, no escribe nada y no rompe nada.
 *
 * QUÉ GENERA, por portal: `app/<portal>/fuentes/<fuente>-<alfabeto>.woff2` y un
 * `<fuente>.module.css` con las mismas reglas que emitía next/font: una `@font-face` por
 * alfabeto con su `unicode-range` (el navegador solo descarga los que la página necesita),
 * la cara «Fallback» con las métricas ajustadas sobre Arial o Times New Roman para que el texto
 * no salte al llegar la fuente, y la clase `.variable` que define la variable CSS del portal.
 *
 * Lo que se pierde a propósito es la precarga automática. Con next/font, TODAS las páginas del
 * catálogo precargaban Fraunces (la de Coquinum) además de Geist y Geist Mono, unos 89 KB de
 * fuentes que no usaban. Geist y Geist Mono se retiraron el mismo día: nada las usaba, el cuerpo
 * de la página va con las fuentes del sistema.
 *
 * Uso:   node scripts/fuentes-locales.mjs            (descarga y reescribe las cuatro)
 *        node scripts/fuentes-locales.mjs sora       (solo una, por su `id`)
 * Después: revisar el `git diff`, `npm run build` y mirar el portal. Las métricas de la cara
 * Fallback son las que calculaba next/font para cada fuente; si se cambia de fuente (no de
 * versión), hay que recalcularlas.
 */
import { mkdir, writeFile, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// El MISMO agente que usa next/font (fetch-resource.js): Google sirve ficheros algo distintos
// según el sistema que declare el navegador, y con éste salen idénticos byte a byte a los que
// servía el build hasta el 22/10/2026 (comprobado con sha1 sobre los 15).
const AGENTE = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36';

const FUENTES = [
  {
    id: 'sora', familia: 'Sora', pesos: [400, 600, 700], portal: 'delegum', variable: '--font-sora',
    fallback: { local: 'Arial', ascent: '85.29%', descent: '25.5%', lineGap: '0.0%', sizeAdjust: '113.73%' },
  },
  {
    id: 'lora', familia: 'Lora', pesos: [400, 500, 600, 700], portal: 'cronicum', variable: '--font-lora',
    fallback: { local: 'Times New Roman', ascent: '87.33%', descent: '23.78%', lineGap: '0.0%', sizeAdjust: '115.2%' },
  },
  {
    id: 'fraunces', familia: 'Fraunces', pesos: [400, 500, 600, 700], portal: 'coquinum', variable: '--font-coquinum',
    fallback: { local: 'Times New Roman', ascent: '84.71%', descent: '22.09%', lineGap: '0.0%', sizeAdjust: '115.45%' },
  },
  {
    id: 'space-grotesk', familia: 'Space Grotesk', pesos: [400, 500, 600, 700], portal: 'stemum', variable: '--font-stemum',
    fallback: { local: 'Arial', ascent: '89.71%', descent: '26.62%', lineGap: '0.0%', sizeAdjust: '109.69%' },
  },
];

/** Trocea la hoja de Google en caras: alfabeto (del comentario que la precede), peso, url y rango. */
function leerCaras(css) {
  const caras = [];
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  for (const [, alfabeto, cuerpo] of css.matchAll(re)) {
    const campo = (nombre) => cuerpo.match(new RegExp(`${nombre}:\\s*([^;]+);`))?.[1].trim();
    const url = cuerpo.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
    const peso = campo('font-weight');
    const rango = campo('unicode-range');
    const estilo = campo('font-style');
    if (!url || !peso || !rango) throw new Error(`cara incompleta en el alfabeto ${alfabeto}`);
    caras.push({ alfabeto, url, peso, rango, estilo: estilo ?? 'normal' });
  }
  return caras;
}

async function descargar(url, como) {
  const r = await fetch(url, { headers: { 'User-Agent': AGENTE } });
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
  return como === 'texto' ? r.text() : Buffer.from(await r.arrayBuffer());
}

async function generar(f) {
  const consulta = `https://fonts.googleapis.com/css2?family=${f.familia.replace(/ /g, '+')}:wght@${f.pesos.join(';')}&display=swap`;
  const caras = leerCaras(await descargar(consulta, 'texto'));
  if (caras.length === 0) throw new Error(`${f.familia}: Google no devolvió ninguna cara`);
  const pesosVistos = new Set(caras.map((c) => c.peso));
  for (const p of f.pesos) {
    if (!pesosVistos.has(String(p))) throw new Error(`${f.familia}: falta el peso ${p}`);
  }

  // Las fuentes variables dan el MISMO fichero para todos los pesos de un alfabeto: uno por url
  const porUrl = new Map();
  for (const c of caras) {
    if (porUrl.has(c.url)) continue;
    const mismosAlfabeto = caras.filter((o) => o.alfabeto === c.alfabeto);
    const unico = new Set(mismosAlfabeto.map((o) => o.url)).size === 1;
    porUrl.set(c.url, unico ? `${f.id}-${c.alfabeto}.woff2` : `${f.id}-${c.alfabeto}-${c.peso}.woff2`);
  }

  // Todo en memoria antes de escribir nada: una descarga a medias no deja el portal a medias
  const ficheros = new Map();
  for (const [url, nombre] of porUrl) ficheros.set(nombre, await descargar(url, 'binario'));

  const carpeta = path.join(RAIZ, 'app', f.portal, 'fuentes');
  await mkdir(carpeta, { recursive: true });
  for (const viejo of await readdir(carpeta)) {
    if (viejo.startsWith(`${f.id}-`) && viejo.endsWith('.woff2') && !ficheros.has(viejo)) {
      await unlink(path.join(carpeta, viejo));
    }
  }
  for (const [nombre, datos] of ficheros) await writeFile(path.join(carpeta, nombre), datos);

  const fb = f.fallback;
  const reglas = caras.map((c) => [
    `/* ${c.alfabeto} */`,
    '@font-face {',
    `  font-family: '${f.familia}';`,
    `  font-style: ${c.estilo};`,
    `  font-weight: ${c.peso};`,
    '  font-display: swap;',
    `  src: url('./${porUrl.get(c.url)}') format('woff2');`,
    `  unicode-range: ${c.rango};`,
    '}',
  ].join('\n'));
  const css = [
    `/* Generado por scripts/fuentes-locales.mjs el ${new Date().toLocaleDateString('es-ES')}: no editar a mano. */`,
    `/* ${f.familia} (${f.pesos.join(', ')}), descargada de Google Fonts. Licencia SIL Open Font License 1.1. */`,
    '',
    ...reglas,
    '',
    '/* Métricas ajustadas de la fuente de reserva, las que calculaba next/font: el texto no salta */',
    '@font-face {',
    `  font-family: '${f.familia} Fallback';`,
    `  src: local('${fb.local}');`,
    `  ascent-override: ${fb.ascent};`,
    `  descent-override: ${fb.descent};`,
    `  line-gap-override: ${fb.lineGap};`,
    `  size-adjust: ${fb.sizeAdjust};`,
    '}',
    '',
    '.variable {',
    `  ${f.variable}: '${f.familia}', '${f.familia} Fallback';`,
    '}',
    '',
  ].join('\n');
  await writeFile(path.join(carpeta, `${f.id}.module.css`), css);

  const kb = [...ficheros.values()].reduce((s, b) => s + b.length, 0) / 1024;
  console.log(`✓ ${f.familia}: ${caras.length} caras, ${ficheros.size} ficheros (${kb.toFixed(0)} KB) → app/${f.portal}/fuentes/`);
}

const pedidas = process.argv.slice(2);
const elegidas = pedidas.length ? FUENTES.filter((f) => pedidas.includes(f.id)) : FUENTES;
if (elegidas.length === 0) {
  console.error(`Ninguna fuente con ese id. Disponibles: ${FUENTES.map((f) => f.id).join(', ')}`);
  process.exit(1);
}
let fallos = 0;
for (const f of elegidas) {
  try {
    await generar(f);
  } catch (e) {
    fallos++;
    console.error(`✗ ${f.familia}: ${e.message} — no se ha tocado nada de esta fuente`);
  }
}
process.exit(fallos ? 1 : 0);
