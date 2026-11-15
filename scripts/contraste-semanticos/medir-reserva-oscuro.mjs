#!/usr/bin/env node
/**
 * medir-reserva-oscuro.mjs — medición POR PÍXEL del cabo C0681: ¿qué pasaría si los cuatro
 * tokens semánticos de texto (`--rojo-texto`, `--naranja-texto`, `--ambar-texto`,
 * `--verde-texto`) tuvieran un valor en oscuro en lugar de `initial`?
 *
 *   npx next start -p 3055   (con un build hecho)
 *   node scripts/contraste-semanticos/medir-reserva-oscuro.mjs [--puerto 3055] [--solo slug,slug]
 *        [--salida fichero.json]
 *
 * Hoy globals pone los cuatro a `initial` en oscuro y manda la reserva de la receta
 * `var(--rojo-texto, X)`: el color que cada módulo tenía antes. El censo estático
 * (`censo-reserva-oscuro.mjs`) contó 455 usos bajo 4,5:1 contra los fondos planos, pero no ve
 * los tintes ni el fondo que pone el TSX. Y el comentario de globals avisa del riesgo contrario:
 * un tono claro iría encima de los tintes claros que muchos módulos no cambian en oscuro.
 *
 * Por eso se mide así, en cada ruta de `app/` cuyo CSS usa la receta, en oscuro y con lo
 * colapsado abierto:
 *   1. Se inyectan los candidatos con una cifra cambiada (CENTINELA): el texto cuyo color
 *      calculado es un centinela es exactamente el que pinta la receta.
 *   2. Se compone su fondo capa a capa (mismo criterio que `tests/_contraste.ts`) y se mide con
 *      el candidato y, desactivando la inyección, con la reserva de hoy.
 *   3. Cada texto cae en una casilla: mejora (falla hoy y cumple con el candidato), empeora
 *      (cumple hoy y falla con él), fallan las dos, cumplen las dos.
 *
 * Límite: solo ve lo que está en la página al cargar (con acordeones abiertos). Un aviso de
 * error que sale al interactuar no se mide.
 *
 * Medido el 15/11/2026 contra el build de 9d9b12e0a: 531 rutas, 841 textos en 132 apps; 398
 * mejoran, 0 empeoran, 4 fallan con los dos (las insignias de checklist-coberturas-seguros, de
 * fondo claro fijo) y 439 cumplen con los dos. Con eso globals pasó a dar a los cuatro tokens
 * los CANDIDATOS en oscuro. Sigue sirviendo para medir otro valor: se cambia CANDIDATOS.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (n, d) => {
  const i = process.argv.indexOf(n);
  return i > 0 ? process.argv[i + 1] : d;
};
const PUERTO = arg('--puerto', '3055');
const SALIDA = arg('--salida', null);
const SOLO = arg('--solo', null)?.split(',');
const PARALELO = Number(arg('--paralelo', '6'));

/** Candidatos: los tonos que ya usa el oscuro para --danger, --success y --warning (C0226). */
export const CANDIDATOS = {
  rojo: '#FCA5A5',
  naranja: '#FDBA74',
  ambar: '#FCD34D',
  verde: '#86EFAC',
};
/** El mismo tono con el azul una unidad abajo: imposible confundirlo con un literal. */
const centinela = (hex) => '#' + hex.slice(1, 5) + (parseInt(hex.slice(5), 16) - 1).toString(16).padStart(2, '0');
const CENTINELAS = Object.fromEntries(Object.entries(CANDIDATOS).map(([k, v]) => [k, centinela(v)]));

function rutas() {
  const RE = /var\(\s*--(rojo|naranja|ambar|verde)-texto\s*,/;
  const slugs = new Set();
  const recorrer = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) recorrer(p);
      else if (e.name.endsWith('.css') && RE.test(fs.readFileSync(p, 'utf8'))) {
        const rel = path.relative(path.join(RAIZ, 'app'), path.dirname(p)).split(path.sep);
        if (rel[0] && rel[0] !== '..' && !rel[0].startsWith('(') && !rel[0].startsWith('_')) slugs.add(rel[0]);
      }
    }
  };
  recorrer(path.join(RAIZ, 'app'));
  return [...slugs].sort();
}

async function medirRuta(contexto, slug) {
  const page = await contexto.newPage();
  try {
    const r = await page.goto(`http://localhost:${PUERTO}/${slug}/`, { waitUntil: 'load', timeout: 45000 });
    if (!r || r.status() >= 400) return { slug, error: `HTTP ${r?.status()}` };
    // El clic antes de hidratar no hace nada: se reintenta hasta que el tema cambie (≤ 10 s).
    const oscuro = async () => (await page.locator('html').getAttribute('data-theme')) === 'dark';
    for (let intento = 0; intento < 20 && !(await oscuro()); intento++) {
      await page.waitForTimeout(500);
      if (await oscuro()) break;
      await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click({ timeout: 3000 }).catch(() => {});
    }
    if (!(await oscuro())) return { slug, error: 'no pasa a oscuro' };
    await page.addStyleTag({
      content: 'nextjs-portal{display:none!important}*,*::before,*::after{animation:none!important;transition:none!important}',
    });
    for (let vuelta = 0; vuelta < 3; vuelta++) {
      const cerrados = page.locator('[aria-expanded="false"]');
      const n = await cerrados.count();
      if (!n) break;
      for (let i = 0; i < n; i++) {
        const b = cerrados.nth(i);
        if (await b.isVisible().catch(() => false)) await b.click({ timeout: 2000 }).catch(() => {});
      }
    }
    // Un clic puede haber navegado fuera: se vuelve a comprobar.
    if (!page.url().includes(`/${slug}/`)) return { slug, error: 'un desplegable navegó fuera' };
    await page.waitForTimeout(300);
    return { slug, medidas: await page.evaluate(medirEnPagina, CENTINELAS) };
  } catch (e) {
    return { slug, error: String(e.message ?? e).slice(0, 120) };
  } finally {
    await page.close();
  }
}

/** Se ejecuta en el navegador. */
function medirEnPagina(centinelas) {
  const estilo = document.createElement('style');
  estilo.textContent = `html[data-theme="dark"]{${Object.entries(centinelas).map(([k, v]) => `--${k}-texto:${v}`).join(';')}}`;
  document.head.appendChild(estilo);

  const lienzo = document.createElement('canvas');
  lienzo.width = lienzo.height = 1;
  const ctx = lienzo.getContext('2d', { willReadFrequently: true });
  const normalizar = (css) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000';
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const canal = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = (p) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const hex = (p) => '#' + p.slice(0, 3).map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');
  const porCentinela = new Map(Object.entries(centinelas).map(([k, v]) => [hex(normalizar(v)), k]));

  const fondosDe = (el) => {
    const pila = [];
    let m = el;
    while (m) {
      const cs = getComputedStyle(m);
      const img = cs.backgroundImage;
      const capas = img && /gradient/i.test(img) ? img.split(/,\s*(?=(?:repeating-)?(?:linear|radial|conic)-gradient\()/) : [];
      const paradasDe = (capa) => (capa.match(/(rgba?|color)\([^)]*\)/g) ?? []).map(normalizar);
      const arriba = capas.length ? paradasDe(capas[0]) : [];
      const paradas = arriba.length && arriba.every((p) => p[3] >= 1) ? arriba : capas.flatMap(paradasDe);
      if (paradas.length) pila.push(paradas);
      const c = normalizar(cs.backgroundColor);
      if (c[3] > 0) pila.push([c]);
      if (c[3] >= 1 || (paradas.length && paradas.every((p) => p[3] >= 1))) break;
      m = m.parentElement;
    }
    let bases = [[26, 26, 26]];
    for (let i = pila.length - 1; i >= 0; i--) {
      bases = bases.flatMap((b) => pila[i].map((c) => [0, 1, 2].map((k) => c[k] * c[3] + b[k] * (1 - c[3]))));
    }
    return bases;
  };

  const candidatos = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('nextjs-portal, canvas, svg')) continue;
    const propio = Array.from(el.childNodes).some((x) => x.nodeType === 3 && (x.textContent ?? '').trim().length > 0);
    if (!propio) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const token = porCentinela.get(hex(normalizar(cs.color)));
    if (!token) continue;
    const px = parseFloat(cs.fontSize);
    const grande = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700);
    candidatos.push({ el, token, umbral: grande ? 3 : 4.5, fondos: fondosDe(el), cand: normalizar(cs.color) });
  }
  // «Antes» es la reserva: con `initial`, como estaba globals hasta C0681 (desactivar la inyección
  // daría el valor que globals tenga hoy, no la reserva)
  estilo.textContent = `html[data-theme="dark"]{${Object.keys(centinelas).map((k) => `--${k}-texto:initial`).join(';')}}`;
  const salida = candidatos.map(({ el, token, umbral, fondos, cand }) => {
    const res = normalizar(getComputedStyle(el).color);
    const peor = (fg) => Math.min(...fondos.map((f) => ratio(fg, f)));
    const clase = (el.className && typeof el.className === 'string' ? el.className : '').split(' ')[0] ?? '';
    return {
      token,
      texto: (el.textContent ?? '').trim().slice(0, 50),
      clase: clase.replace(/__[A-Za-z0-9_-]+$/, '').slice(0, 60),
      umbral,
      reserva: hex(res),
      antes: +peor(res).toFixed(2),
      despues: +peor(cand).toFixed(2),
      fondo: hex(fondos.reduce((a, f) => (ratio(cand, f) < ratio(cand, a) ? f : a), fondos[0])),
    };
  });
  estilo.remove();
  return salida;
}

async function main() {
  const lista = SOLO ?? rutas();
  console.log(`Midiendo ${lista.length} rutas en el ${PUERTO}, ${PARALELO} a la vez…`);
  const navegador = await chromium.launch();
  const contexto = await navegador.newContext({ colorScheme: 'dark', viewport: { width: 1280, height: 900 } });
  const resultados = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: PARALELO }, async () => {
      while (i < lista.length) {
        const slug = lista[i++];
        resultados.push(await medirRuta(contexto, slug));
        if (resultados.length % 50 === 0) console.log(`  ${resultados.length}/${lista.length}`);
      }
    }),
  );
  await navegador.close();

  const errores = resultados.filter((r) => r.error);
  const todas = resultados.flatMap((r) => (r.medidas ?? []).map((m) => ({ slug: r.slug, ...m })));
  const ok = (v, m) => v >= m.umbral;
  const casilla = {
    mejora: todas.filter((m) => !ok(m.antes, m) && ok(m.despues, m)),
    empeora: todas.filter((m) => ok(m.antes, m) && !ok(m.despues, m)),
    fallanLasDos: todas.filter((m) => !ok(m.antes, m) && !ok(m.despues, m)),
    cumplenLasDos: todas.filter((m) => ok(m.antes, m) && ok(m.despues, m)),
  };
  const apps = (l) => new Set(l.map((m) => m.slug)).size;
  console.log(`\nRutas medidas: ${resultados.length - errores.length} · con error: ${errores.length}`);
  console.log(`Textos pintados por la receta en oscuro: ${todas.length} en ${apps(todas)} apps`);
  for (const [k, l] of Object.entries(casilla)) console.log(`  ${k.padEnd(14)} ${String(l.length).padStart(5)} en ${apps(l)} apps`);
  for (const k of ['empeora', 'fallanLasDos']) {
    if (!casilla[k].length) continue;
    console.log(`\n── ${k}`);
    for (const m of casilla[k]) console.log(`  ${m.slug} · ${m.token} · «${m.texto}» · ${m.clase} · fondo ${m.fondo} · ${m.antes} → ${m.despues} (umbral ${m.umbral})`);
  }
  if (errores.length) console.log(`\n── errores\n${errores.map((e) => `  ${e.slug}: ${e.error}`).join('\n')}`);
  if (SALIDA) fs.writeFileSync(SALIDA, JSON.stringify({ CANDIDATOS, resultados }, null, 1));
}

main();
