import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, desplegarTodo, prepararParaMedir } from './_contraste';

/**
 * El texto de un SVG contra lo que tiene detrás — cabo C0297 (parte de los `fill` de SVG).
 *
 * Ni los candados de contraste ni los testigos por píxel miran el `<text>` de un SVG: el color
 * va en `fill`, no en `color`, y el fondo no es el `background` de un antepasado sino las formas
 * que el propio SVG pinta debajo (el tinte de una zona del diagrama de fases, la caja de un
 * bloque). Aquí se mide lo que se ve: se ocultan los `<text>`, se fotografía cada SVG visible y,
 * para cada texto, el fondo es el color MÁS FRECUENTE dentro de su caja (una línea que lo cruce no
 * cuenta como fondo). Se compone el `fill-opacity` sobre ese fondo, y el umbral es 4,5:1, o 3:1
 * si el texto se pinta a 24 px o más (18,66 en negrita) tras la escala del viewBox.
 *
 * Fuera, a propósito: un `fill` con degradado o patrón (`url(…)`), el texto de opacidad 0 y el
 * que no tiene caja. Las apps salen de la nota del 08/11/2026 del cabo (candidatas con caso).
 */

interface App {
  slug: string;
  /** Botones que cambian de sección; sin él, solo la carga */
  secciones?: string;
  /** Además, en cada sección, cada deslizador a su mínimo y a su máximo (otros regímenes) */
  extremos?: boolean;
}

const SECCIONES = "nav[aria-label*='ecciones'] button";

/**
 * Una fila por app REPARADA (las cinco candidatas de la nota del 08/11/2026 del cabo C0297, más
 * las que se añadan). Control: sin la reparación, cada una cae con los textos de su comentario.
 * Mide el estado de carga de cada sección: los rótulos que cambian con un deslizador (otro
 * régimen, otra fase) se cubren porque toman el tono de la misma tabla que los medidos.
 */
const APPS: App[] = [
  // Sólido, Líquido y Gas en el color de su zona sobre el tinte de la propia zona (2,01-2,52:1 en
  // claro), Punto triple (3,40 en claro, 2,12 en oscuro) y Punto crítico (2,28 en oscuro)
  { slug: 'visualizador-estados-materia', secciones: SECCIONES, extremos: true },
  // Los rótulos del esquema en el color de su zona sobre el tinte de la zona: la marca 3,19-3,62:1
  // en claro y 2,59-3,03 en oscuro, el teal 2,76 y el naranja 2,74 en claro, y «Ventana oval» en
  // #666 a 2,39 en oscuro
  { slug: 'visualizador-oido-equilibrio', secciones: SECCIONES, extremos: true },
  // Blanco sobre el Sol (1,96:1 en claro, 2,51 en oscuro), las moléculas sobre su círculo al 40 %
  // (1,06-2,30 en oscuro), la superficie sobre su franja (1,34-1,53 en oscuro), los rojos y el
  // ámbar como texto con opacidad (1,86-3,81) y la leyenda en #666 a 1,90 en oscuro
  { slug: 'visualizador-efecto-invernadero', secciones: SECCIONES, extremos: true },
  // El rótulo de Reynolds, las presiones de Magnus, las velocidades del perfil, el aviso del mito y
  // el régimen de Mach en su color de datos sobre el tinte de ese color: 1,87-3,60:1 en claro y
  // 2,40-3,04 en oscuro
  { slug: 'visualizador-mecanica-fluidos', secciones: SECCIONES, extremos: true },
  // Blanco sobre el color de cada bloque al 80 % (2,36-2,97:1 en claro, 3,16-4,27 en oscuro), el
  // pie en #aaa (2,30) y el bloque del bus en NEGRO por un fill inválido ('#666CC'), con su rótulo
  // desbordado tapando «Buses»
  { slug: 'visualizador-arquitectura-computador', secciones: SECCIONES, extremos: true },
];

interface TextoSvg {
  texto: string;
  fill: number[];
  /** Caja relativa al SVG, en px CSS */
  x: number;
  y: number;
  w: number;
  h: number;
  px: number;
  negrita: boolean;
}

/** Los `<text>` visibles de cada SVG visible, con su color y su caja; marca cada SVG con un índice. */
async function textosDeSvgs(page: Page): Promise<TextoSvg[][]> {
  return page.evaluate(() => {
    const lz = document.createElement('canvas');
    lz.width = lz.height = 1;
    const ctx = lz.getContext('2d', { willReadFrequently: true })!;
    const norm = (css: string): number[] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const salida: TextoSvg[][] = [];
    const svgs = Array.from(document.querySelectorAll('svg')).filter((s) => {
      const r = s.getBoundingClientRect();
      return r.width > 40 && r.height > 40 && s.querySelector('text') && getComputedStyle(s).visibility !== 'hidden';
    });
    svgs.forEach((svg, i) => {
      svg.setAttribute('data-svg-medido', String(i));
      const caja = svg.getBoundingClientRect();
      const lista: TextoSvg[] = [];
      for (const t of Array.from(svg.querySelectorAll('text'))) {
        const cs = getComputedStyle(t);
        if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
        if (cs.fill.startsWith('url(') || cs.fill === 'none') continue;
        const contenido = (t.textContent ?? '').trim();
        // Un emoji suelto se pinta con sus propios colores, no con el fill
        if (!contenido || /^[\p{Extended_Pictographic}️‍\s]+$/u.test(contenido)) continue;
        const r = t.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        const fill = norm(cs.fill);
        fill[3] *= +cs.fillOpacity * +cs.opacity;
        const escala = (t.getScreenCTM()?.a ?? 1);
        lista.push({
          texto: contenido.slice(0, 40),
          fill,
          x: r.left - caja.left,
          y: r.top - caja.top,
          w: r.width,
          h: r.height,
          px: parseFloat(cs.fontSize) * escala,
          negrita: +cs.fontWeight >= 700 || cs.fontWeight === 'bold',
        });
      }
      salida.push(lista);
    });
    return salida;
  });
}

/** Mide los SVG visibles ahora mismo y devuelve los textos por debajo de su umbral. */
async function suspensos(page: Page): Promise<string[]> {
  const porSvg = await textosDeSvgs(page);
  const fuera: string[] = [];
  const oculto = await page.addStyleTag({ content: '[data-svg-medido] text { visibility: hidden !important; }' });
  for (let i = 0; i < porSvg.length; i++) {
    if (!porSvg[i].length) continue;
    const svg = page.locator(`[data-svg-medido="${i}"]`);
    const png = await svg.screenshot({ animations: 'disabled' }).catch(() => null);
    if (!png) continue;
    const malos = await page.evaluate(
      async ({ b64, textos, indice }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const lienzo = document.createElement('canvas');
        lienzo.width = img.width;
        lienzo.height = img.height;
        const c = lienzo.getContext('2d', { willReadFrequently: true })!;
        c.drawImage(img, 0, 0);
        const svgEl = document.querySelector(`[data-svg-medido="${indice}"]`);
        const anchoCss = (svgEl?.getBoundingClientRect().width ?? img.width) || img.width;
        const k = img.width / anchoCss;
        const can = (v: number) => {
          const s = v / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        const lum = (p: number[]) => 0.2126 * can(p[0]) + 0.7152 * can(p[1]) + 0.0722 * can(p[2]);
        const ratio = (a: number[], b: number[]) => {
          const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
          return (x + 0.05) / (y + 0.05);
        };
        const res: string[] = [];
        for (const t of textos) {
          const x0 = Math.max(0, Math.floor(t.x * k));
          const y0 = Math.max(0, Math.floor(t.y * k));
          const w = Math.min(img.width - x0, Math.ceil(t.w * k));
          const h = Math.min(img.height - y0, Math.ceil(t.h * k));
          if (w < 1 || h < 1) continue;
          const d = c.getImageData(x0, y0, w, h).data;
          const cuenta = new Map<string, number>();
          for (let p = 0; p < d.length; p += 4) {
            const clave = `${d[p] >> 2},${d[p + 1] >> 2},${d[p + 2] >> 2}`;
            cuenta.set(clave, (cuenta.get(clave) ?? 0) + 1);
          }
          const [moda] = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0];
          const fondo = moda.split(',').map((v) => +v * 4 + 2);
          const a = t.fill[3];
          const tinta = [0, 1, 2].map((i) => t.fill[i] * a + fondo[i] * (1 - a));
          const umbral = t.px >= 24 || (t.px >= 18.66 && t.negrita) ? 3 : 4.5;
          const v = ratio(tinta, fondo);
          if (v < umbral) {
            res.push(`«${t.texto}» rgb(${tinta.map(Math.round)}) sobre rgb(${fondo}) a ${t.px.toFixed(1)} px: ${v.toFixed(2)}:1`);
          }
        }
        return res;
      },
      { b64: png.toString('base64'), textos: porSvg[i], indice: i },
    );
    fuera.push(...malos.map((m) => `svg ${i + 1}: ${m}`));
  }
  await oculto.evaluate((n) => (n as Element).remove());
  await page.evaluate(() => document.querySelectorAll('[data-svg-medido]').forEach((s) => s.removeAttribute('data-svg-medido')));
  return Array.from(new Set(fuera));
}

/**
 * Formas con un `fill` que el navegador no entiende y pinta en NEGRO: visualizador-arquitectura-
 * computador le pegaba el alfa a '#666' y salía '#666CC' (cabo C0297, 08/11/2026).
 */
async function rellenosInvalidos(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const malos: string[] = [];
    for (const f of Array.from(document.querySelectorAll('svg [fill]'))) {
      const v = (f.getAttribute('fill') ?? '').trim();
      if (!v || /^(none|currentColor|url\(|var\(|transparent|inherit)/i.test(v)) continue;
      if (!CSS.supports('color', v)) malos.push(`<${f.tagName.toLowerCase()} fill="${v}">`);
    }
    return Array.from(new Set(malos));
  });
}

async function medirAqui(page: Page, etiqueta: string, extremos: boolean): Promise<string[]> {
  const todo = [
    ...(await suspensos(page)).map((s) => `${etiqueta}: ${s}`),
    ...(await rellenosInvalidos(page)).map((s) => `${etiqueta}: relleno inválido ${s}`),
  ];
  if (!extremos) return todo;
  const deslizadores = page.locator('input[type="range"]:visible');
  const n = await deslizadores.count();
  for (let i = 0; i < n; i++) {
    for (const tecla of ['End', 'Home'] as const) {
      await deslizadores.nth(i).press(tecla);
      todo.push(...(await suspensos(page)).map((s) => `${etiqueta}, deslizador ${i + 1} en ${tecla}: ${s}`));
    }
  }
  return todo;
}

async function recorrer(page: Page, secciones?: string, extremos = false): Promise<string[]> {
  const todo: string[] = [];
  const botones = secciones ? page.locator(secciones) : null;
  const n = botones ? await botones.count() : 0;
  await desplegarTodo(page);
  if (!n) return medirAqui(page, 'carga', extremos);
  for (let i = 0; i < n; i++) {
    await botones!.nth(i).click();
    await desplegarTodo(page);
    todo.push(...(await medirAqui(page, `sección ${i + 1}`, extremos)));
  }
  return Array.from(new Set(todo));
}

for (const { slug, secciones, extremos } of APPS) {
  test(`${slug}: el texto de sus SVG se lee contra lo que tiene detrás, en claro y en oscuro (C0297)`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    if (secciones) await expect(page.locator(secciones).first()).toBeVisible();
    expect.soft(await recorrer(page, secciones, extremos), 'claro').toEqual([]);
    await activarTemaOscuro(page);
    expect.soft(await recorrer(page, secciones, extremos), 'oscuro').toEqual([]);
  });
}
