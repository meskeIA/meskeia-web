/**
 * Contraste del TEXTO BLANCO SOBRE LA MARCA (botones, pestañas, números de paso, distintivos),
 * medido en navegador en los DOS temas. Tanda 1 de la campaña del cabo C0070 (18/10/2026).
 *
 * La campaña cambió `var(--primary)` / `var(--secondary)` (y sus hexadecimales escritos a mano)
 * por `var(--primary-boton)` / `var(--secondary-boton)` en 2.844 reglas de 868 ficheros con
 * `scripts/contraste-marca/campana.mjs`, y 18 a mano. El candado
 * `scripts/check-contraste-marca.mjs` lo comprueba por la FORMA del código; esto lo comprueba
 * por el PÍXEL en una muestra de una app por forma:
 *
 *   · fondo sólido var(--primary)          → simulador-genetica
 *   · degradado primary → secondary        → calculadora-fov-video
 *   · hexadecimal #2E86AB escrito a mano   → afinador-instrumentos
 *   · override oscuro que reponía --primary → ajustar-ecuaciones-quimicas
 *   · bloque en una sola línea             → visualizador-vida-estrella
 *   · un botón con texto blanco cualquiera → generador-fichas-calculo, selector-modalidad-trabajo
 *
 * y dos de los 18 resueltos a mano, en el estado donde estaba el defecto:
 *
 *   · visualizador-piramide-poblacion: en OSCURO, `.btnAno:hover` pintaba el año en --primary
 *     sobre fondo --primary (1:1): `[data-theme='dark'] .btnAno` tiene su misma especificidad
 *     y va detrás.
 *   · falsos-amigos-ingles: el chip en HOVER, blanco sobre --accent (~2,2:1).
 *
 * Mide todo elemento VISIBLE con texto propio cuyo color pintado es blanco y cuyo fondo
 * —compuesto capa a capa, o cada parada si es un degradado— es un color de marca. Las trampas
 * de medir con navegador (ficha de memoria `reference_contraste_marca_tokens_texto`):
 *   1. `<nextjs-portal>` existe en `next dev`: se oculta.
 *   2. Las transiciones hacen leer colores intermedios: se desactivan.
 *   3. Un color leído con regex miente (`color(srgb …)` sale como rgb(1,1,1)): se normaliza
 *      pintándolo en un canvas de 1×1.
 *   4. `data-theme` a mano lo pisa el gestor de tema: se pulsa el botón real y se AFIRMA.
 */
import { test, expect, type Page } from '@playwright/test';

const UMBRAL = 4.5;

const APPS = [
  { slug: 'simulador-genetica', forma: 'fondo sólido var(--primary)' },
  { slug: 'calculadora-fov-video', forma: 'degradado primary → secondary' },
  { slug: 'afinador-instrumentos', forma: 'hexadecimal #2E86AB escrito a mano' },
  { slug: 'ajustar-ecuaciones-quimicas', forma: 'override oscuro que reponía --primary' },
  { slug: 'visualizador-vida-estrella', forma: 'bloque en una sola línea' },
  { slug: 'generador-fichas-calculo', forma: 'botón con texto blanco' },
  { slug: 'selector-modalidad-trabajo', forma: 'botón con texto blanco' },
] as const;

async function prepararParaMedir(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      nextjs-portal { display: none !important; }
      *, *::before, *::after { animation: none !important; transition: none !important; }
    `,
  });
}

async function desplegarTodo(page: Page): Promise<void> {
  for (let vuelta = 0; vuelta < 3; vuelta++) {
    const cerrados = page.locator('[aria-expanded="false"]');
    const n = await cerrados.count();
    if (n === 0) break;
    for (let i = 0; i < n; i++) {
      const b = cerrados.nth(i);
      if (await b.isVisible().catch(() => false)) await b.click().catch(() => {});
    }
  }
}

async function activarTemaOscuro(page: Page): Promise<void> {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
}

type Medida = { ratio: number; texto: string; fondo: string; vistos: number };

/**
 * Peor contraste entre los elementos con texto BLANCO sobre un fondo de MARCA. `selector`
 * restringe la búsqueda (para medir un estado concreto, como un hover).
 */
async function peorBlancoSobreMarca(page: Page, selector = '*'): Promise<Medida> {
  return page.evaluate((sel) => {
    const lienzo = document.createElement('canvas');
    lienzo.width = lienzo.height = 1;
    const ctx = lienzo.getContext('2d', { willReadFrequently: true })!;
    /** Color CSS cualquiera → [r, g, b, a] leyendo el píxel (getImageData NO premultiplica). */
    const normalizar = (css: string): number[] | null => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const canal = (c: number) => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
    const ratio = (a: number[], b: number[]) => {
      const l1 = lum(a), l2 = lum(b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    // Marca de meskeIA antes y después de la campaña, en los dos temas, y el acento
    const MARCA = ['#2E86AB', '#48A9A6', '#3FA5D1', '#5ABDB9', '#26718F', '#327874', '#7FB3D3'].map((h) => normalizar(h)!);
    const esMarca = (p: number[]) => MARCA.some((m) => Math.abs(m[0] - p[0]) + Math.abs(m[1] - p[1]) + Math.abs(m[2] - p[2]) < 24);

    const fondosDe = (el: Element): number[][] => {
      let n: Element | null = el;
      while (n) {
        const img = getComputedStyle(n).backgroundImage;
        if (img && /gradient/i.test(img)) {
          const paradas = img.match(/(rgba?|color)\([^)]*\)/g) ?? [];
          if (paradas.length) return paradas.map((p) => normalizar(p)!.slice(0, 3));
        }
        const propio = normalizar(getComputedStyle(n).backgroundColor)!;
        if (propio[3] >= 1) break;
        n = n.parentElement;
      }
      const capas: number[][] = [];
      let m: Element | null = el;
      while (m) {
        const c = normalizar(getComputedStyle(m).backgroundColor)!;
        if (c[3] > 0) {
          capas.push(c);
          if (c[3] >= 1) break;
        }
        m = m.parentElement;
      }
      let base = [255, 255, 255];
      for (let i = capas.length - 1; i >= 0; i--) {
        const c = capas[i];
        base = [0, 1, 2].map((k) => c[k] * c[3] + base[k] * (1 - c[3]));
      }
      return [base];
    };

    let peor: Medida | null = null;
    let vistos = 0;
    for (const el of Array.from(document.querySelectorAll(sel))) {
      if (el.closest('nextjs-portal, canvas, svg')) continue;
      const propio = Array.from(el.childNodes).some((x) => x.nodeType === 3 && (x.textContent ?? '').trim().length > 0);
      if (!propio) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
      const r = (el as HTMLElement).getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const fg = normalizar(cs.color)!;
      if (fg[0] < 250 || fg[1] < 250 || fg[2] < 250) continue;
      const fondos = fondosDe(el);
      if (!fondos.some(esMarca)) continue;
      vistos++;
      for (const f of fondos) {
        const v = ratio(fg, f);
        if (!peor || v < peor.ratio) {
          peor = { ratio: +v.toFixed(2), texto: (el.textContent ?? '').trim().slice(0, 40), fondo: `rgb(${f.map(Math.round).join(', ')})`, vistos: 0 };
        }
      }
    }
    return peor ? { ...peor, vistos } : { ratio: -1, texto: 'NINGÚN TEXTO BLANCO SOBRE LA MARCA', fondo: '', vistos };
  }, selector);
}

for (const { slug, forma } of APPS) {
  test(`${slug} (${forma}): el texto blanco sobre la marca cumple 4,5:1 en claro y en oscuro`, async ({ page }) => {
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    await desplegarTodo(page);

    const claro = await peorBlancoSobreMarca(page);
    expect(claro.ratio, `claro: ${JSON.stringify(claro)}`).toBeGreaterThan(0);
    expect(claro.ratio, `claro, peor: «${claro.texto}» sobre ${claro.fondo}`).toBeGreaterThanOrEqual(UMBRAL);

    await activarTemaOscuro(page);
    await desplegarTodo(page);
    const oscuro = await peorBlancoSobreMarca(page);
    expect(oscuro.ratio, `oscuro: ${JSON.stringify(oscuro)}`).toBeGreaterThan(0);
    expect(oscuro.ratio, `oscuro, peor: «${oscuro.texto}» sobre ${oscuro.fondo}`).toBeGreaterThanOrEqual(UMBRAL);
  });
}

test('visualizador-piramide-poblacion: el año en HOVER se lee también en oscuro', async ({ page }) => {
  await page.goto('/visualizador-piramide-poblacion/');
  await prepararParaMedir(page);
  await activarTemaOscuro(page);
  // un año que NO sea el activo: el activo tiene su propia regla
  const botones = page.locator('button[class*="btnAno"]:not([class*="btnAnoActivo"])');
  await expect(botones.first()).toBeVisible();
  await botones.first().hover();
  const m = await peorBlancoSobreMarca(page, 'button[class*="btnAno"]');
  expect(m.ratio, `hover oscuro: ${JSON.stringify(m)}`).toBeGreaterThanOrEqual(UMBRAL);
});

test('falsos-amigos-ingles: el chip en HOVER ya no es blanco sobre el acento', async ({ page }) => {
  await page.goto('/falsos-amigos-ingles/');
  await prepararParaMedir(page);
  const chip = page.locator('button[class*="chip"]:not([class*="chipActivo"])').first();
  await expect(chip).toBeVisible();
  await chip.hover();
  const m = await peorBlancoSobreMarca(page, 'button[class*="chip"]');
  // -1 = no queda texto blanco sobre la marca en los chips: es lo esperado tras la reparación
  expect(m.ratio === -1 || m.ratio >= UMBRAL, `chip en hover: ${JSON.stringify(m)}`).toBe(true);
});
