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

type Tinte = { ratio: number; umbral: number; texto: string; fondo: string } | null;
type Medida = { ratio: number; texto: string; fondo: string; vistos: number; umbral?: number; color?: string; tinte?: Tinte };

/**
 * Peor contraste entre los elementos con texto BLANCO sobre un fondo de MARCA. `selector`
 * restringe la búsqueda (para medir un estado concreto, como un hover).
 */
async function peorBlancoSobreMarca(page: Page, selector = '*'): Promise<Medida> {
  return medir(page, selector, 'blanco');
}

/**
 * Tanda 2: peor contraste entre los elementos cuyo TEXTO es de un color de marca, contra su
 * fondo compuesto. El umbral lo pone cada elemento: 3:1 si es texto grande (≥ 24 px, o
 * ≥ 18,66 px en negrita), 4,5:1 si no. Se devuelve el MARGEN peor (ratio / umbral).
 */
async function peorTextoDeMarca(page: Page): Promise<Medida & { umbral: number }> {
  return medir(page, '*', 'marca') as Promise<Medida & { umbral: number }>;
}

async function medir(page: Page, selector: string, modo: 'blanco' | 'marca'): Promise<Medida> {
  return page.evaluate(([sel, modo]) => {
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
    const cerca = (lista: number[][], p: number[]) => lista.some((m) => Math.abs(m[0] - p[0]) + Math.abs(m[1] - p[1]) + Math.abs(m[2] - p[2]) < 24);
    const esMarca = (p: number[]) => cerca(MARCA, p);
    // Como TEXTO no cuenta el acento: no tiene token y no entró en la campaña (se lista aparte)
    const esTextoDeMarca = (p: number[]) => cerca(MARCA.slice(0, 6), p);

    /**
     * Fondos que se ven detrás de un elemento: las capas desde él hacia arriba hasta la primera
     * opaca, compuestas de abajo arriba CON su alfa. Un degradado aporta cada parada (y multiplica
     * las variantes). La primera versión tomaba las paradas como opacas y acusó a
     * estimador-hipoteca de 1,33:1 por un rgba(46,134,171,0.06): la trampa 4 de la ficha.
     */
    /** Lo deja fondosDe: si detrás del último elemento medido hay un TINTE de marca translúcido. */
    let ultimoTenido = false;
    const fondosDe = (el: Element): number[][] => {
      const pila: number[][][] = [];
      let m: Element | null = el;
      while (m) {
        const cs = getComputedStyle(m);
        const img = cs.backgroundImage;
        // Varias capas: si la de ARRIBA es opaca, tapa las demás. Es el borde degradado de
        // estimador-hipoteca: `linear-gradient(--bg-card) padding-box, linear-gradient(marca)
        // border-box`; el degradado de marca solo asoma en el borde, nunca detrás del texto.
        const capasImg = img && /gradient/i.test(img) ? img.split(/,\s*(?=(?:repeating-)?(?:linear|radial|conic)-gradient\()/) : [];
        const paradasDe = (capa: string) => (capa.match(/(rgba?|color)\([^)]*\)/g) ?? []).map((p) => normalizar(p)!);
        const arriba = capasImg.length ? paradasDe(capasImg[0]) : [];
        const paradas = arriba.length && arriba.every((p) => p[3] >= 1) ? arriba : capasImg.flatMap(paradasDe);
        if (paradas.length) pila.push(paradas); // la imagen se pinta ENCIMA del color del mismo elemento
        const c = normalizar(cs.backgroundColor)!;
        if (c[3] > 0) pila.push([c]);
        if (c[3] >= 1 || (paradas.length && paradas.every((p) => p[3] >= 1))) break;
        m = m.parentElement;
      }
      ultimoTenido = pila.some((capa) => capa.some((c) => c[3] < 1 && esMarca(c)));
      let bases = [[255, 255, 255]];
      for (let i = pila.length - 1; i >= 0; i--) {
        bases = bases.flatMap((b) => pila[i].map((c) => [0, 1, 2].map((k) => c[k] * c[3] + b[k] * (1 - c[3]))));
      }
      return bases;
    };

    let peor: (Medida & { umbral: number; color: string }) | null = null;
    let peorTinte: { ratio: number; umbral: number; texto: string; fondo: string } | null = null;
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
      const fondos = fondosDe(el);
      if (modo === 'blanco') {
        if (fg[0] < 250 || fg[1] < 250 || fg[2] < 250) continue;
        if (!fondos.some(esMarca)) continue;
      } else if (!esTextoDeMarca(fg) || fg[3] < 1) continue;
      const px = parseFloat(cs.fontSize);
      const grande = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700);
      const umbral = modo === 'marca' && grande ? 3 : 4.5;
      // Texto de marca sobre un TINTE de marca: es la familia del cabo C0278 (medida hasta ahora
      // solo en oscuro), no la sustitución de C0070. Se informa aparte y no cuenta en el veredicto.
      if (modo === 'marca' && ultimoTenido) {
        for (const f of fondos) {
          const v = ratio(fg, f);
          if (!peorTinte || v / umbral < peorTinte.ratio / peorTinte.umbral) {
            peorTinte = { ratio: +v.toFixed(2), umbral, texto: (el.textContent ?? '').trim().slice(0, 40), fondo: `rgb(${f.map(Math.round).join(', ')})` };
          }
        }
        continue;
      }
      vistos++;
      for (const f of fondos) {
        const v = ratio(fg, f);
        // Se compara el MARGEN sobre el umbral de cada elemento; se informa del ratio y su umbral
        if (!peor || v / umbral < peor.ratio / peor.umbral) {
          peor = { ratio: +v.toFixed(2), umbral, texto: (el.textContent ?? '').trim().slice(0, 40), fondo: `rgb(${f.map(Math.round).join(', ')})`, color: `rgb(${fg.slice(0, 3).join(', ')})`, vistos: 0 };
        }
      }
    }
    return peor
      ? { ...peor, vistos, tinte: peorTinte }
      : { ratio: -1, umbral: 4.5, texto: modo === 'blanco' ? 'NINGÚN TEXTO BLANCO SOBRE LA MARCA' : 'NINGÚN TEXTO DE MARCA', fondo: '', color: '', vistos, tinte: peorTinte };
  }, [selector, modo] as const);
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

// ─── Tanda 2: la marca como color de texto ────────────────────────────────────

/**
 * Una app por forma de la tanda 2 (6.142 reglas en 1.046 ficheros, 18/10/2026). En claro el
 * texto pasa de #2E86AB a #26718F; en oscuro queda en #3FA5D1, y se aclara donde el módulo
 * fijaba #2E86AB. Se mide en los DOS temas: al cambiar un token en uno, se mide el otro.
 */
const APPS_TEXTO = [
  { slug: 'simulador-movimiento-circular', forma: 'caso de origen: los textos que 8f5eb9b7 dejó en --primary' },
  { slug: 'vitaminas-minerales', forma: 'hexadecimal #2E86AB como texto' },
  { slug: 'visualizador-adaptaciones-plantas', forma: 'var(--primary, #2e86ab) con valor de reserva' },
  { slug: 'selector-tipo-gimnasio', forma: 'color: var(--primary)' },
  { slug: 'estimador-hipoteca', forma: 'color: var(--primary) en muchos bloques' },
  { slug: 'cifrado-playfair', forma: 'color: var(--primary)' },
  { slug: 'calculadora-rentabilidad-alquiler', forma: 'estilo en línea style={{ color }}' },
  { slug: 'curso-negociacion', forma: 'fondo claro FIJO: el CTA blanco pasa a -boton' },
] as const;

for (const { slug, forma } of APPS_TEXTO) {
  test(`${slug} (${forma}): el texto de marca cumple en claro y en oscuro`, async ({ page }) => {
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    await desplegarTodo(page);

    const anotarTinte = (tema: string, m: Medida) => {
      if (m.tinte && m.tinte.ratio < m.tinte.umbral) {
        test.info().annotations.push({ type: 'C0278 · texto de marca sobre tinte', description: `${tema}: «${m.tinte.texto}» ${m.tinte.ratio}:1 sobre ${m.tinte.fondo}` });
      }
    };
    const claro = await peorTextoDeMarca(page);
    anotarTinte('claro', claro);
    expect(claro.ratio, `claro: ${JSON.stringify(claro)}`).toBeGreaterThan(0);
    expect(claro.ratio, `claro, peor: ${JSON.stringify(claro)}`).toBeGreaterThanOrEqual(claro.umbral);

    await activarTemaOscuro(page);
    await desplegarTodo(page);
    const oscuro = await peorTextoDeMarca(page);
    anotarTinte('oscuro', oscuro);
    expect(oscuro.ratio, `oscuro: ${JSON.stringify(oscuro)}`).toBeGreaterThan(0);
    expect(oscuro.ratio, `oscuro, peor: ${JSON.stringify(oscuro)}`).toBeGreaterThanOrEqual(oscuro.umbral);
  });
}
