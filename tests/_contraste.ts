/**
 * Instrumento compartido para MEDIR CONTRASTE POR PÍXEL en los specs de contraste de las
 * campañas C0070 (marca) y C0226 (semánticos en oscuro). Vive aparte para que los dos specs
 * midan con el mismo instrumento: corregirlo en un sitio lo corrige en los dos.
 *
 * Las trampas que cubre (ficha de memoria `reference_contraste_marca_tokens_texto`):
 *   1. `<nextjs-portal>` existe en `next dev`: se oculta.
 *   2. Las transiciones hacen leer colores intermedios: se desactivan.
 *   3. Un color leído con regex miente (`color(srgb …)` sale como rgb(1,1,1)): se normaliza
 *      pintándolo en un canvas de 1×1 (getImageData NO premultiplica).
 *   4. Un `rgba()` tomado como opaco inventa contrastes: cada capa se compone con su alfa, y un
 *      degradado aporta cada parada compuesta sobre lo que tiene debajo. Acusó a
 *      estimador-hipoteca de 1,33:1 el 18/10/2026 hasta que se corrigió.
 *   5. Un fondo de varias capas (`linear-gradient(--bg-card) padding-box, linear-gradient(marca)
 *      border-box`, el truco del borde degradado): si la capa de ARRIBA es opaca, tapa las demás.
 *   6. `data-theme` a mano lo pisa el gestor de tema: se pulsa el botón real y se AFIRMA.
 */
import { expect, type Page } from '@playwright/test';

export async function prepararParaMedir(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      nextjs-portal { display: none !important; }
      *, *::before, *::after { animation: none !important; transition: none !important; }
    `,
  });
}

/** Abre lo colapsado: buena parte del texto vive dentro de <EducationalSection>. */
export async function desplegarTodo(page: Page): Promise<void> {
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

export async function activarTemaOscuro(page: Page): Promise<void> {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
}

export type Tinte = { ratio: number; umbral: number; texto: string; fondo: string } | null;
export type Medida = {
  ratio: number;
  umbral: number;
  texto: string;
  fondo: string;
  color: string;
  vistos: number;
  tinte: Tinte;
};

/** Marca de meskeIA antes y después de la campaña C0070, en los dos temas, más el acento. */
export const MARCA = ['#2E86AB', '#48A9A6', '#3FA5D1', '#5ABDB9', '#26718F', '#327874', '#7FB3D3'];

export type Opciones = {
  /** Restringe la búsqueda (para medir un estado concreto, como un hover). */
  selector?: string;
  /**
   * Qué texto se mide: 'blanco' = texto blanco sobre un fondo de MARCA; una lista de
   * hexadecimales = el texto pintado en esos colores, sobre el fondo que tenga.
   */
  texto: 'blanco' | string[];
  /**
   * Si un tinte translúcido de alguno de estos colores queda detrás, el elemento se informa
   * aparte en `tinte` y no cuenta en el peor. Lo usa C0070: el texto de marca sobre tinte de
   * marca es de C0278.
   */
  separarTinteDe?: string[];
};

/**
 * Peor contraste de los elementos VISIBLES con texto propio que cumplen `texto`, contra su fondo
 * compuesto. El umbral lo pone cada elemento —3:1 si es texto grande (≥ 24 px, o ≥ 18,66 px en
 * negrita), 4,5:1 si no; el texto blanco de un botón se exige siempre a 4,5:1— y se devuelve el
 * de MENOR margen (ratio / umbral). `ratio: -1` si no hay ninguno.
 */
export async function medirContraste(page: Page, opciones: Opciones): Promise<Medida> {
  return page.evaluate(({ sel, texto, tinteDe, marca }) => {
    const lienzo = document.createElement('canvas');
    lienzo.width = lienzo.height = 1;
    const ctx = lienzo.getContext('2d', { willReadFrequently: true })!;
    const normalizar = (css: string): number[] => {
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
    const cerca = (lista: number[][], p: number[]) => lista.some((m) => Math.abs(m[0] - p[0]) + Math.abs(m[1] - p[1]) + Math.abs(m[2] - p[2]) < 24);
    const MARCA = marca.map(normalizar);
    const OBJETIVO = texto === 'blanco' ? [] : texto.map(normalizar);
    const TINTE = (tinteDe ?? []).map(normalizar);

    let tenido = false;
    const fondosDe = (el: Element): number[][] => {
      const pila: number[][][] = [];
      let m: Element | null = el;
      while (m) {
        const cs = getComputedStyle(m);
        const img = cs.backgroundImage;
        const capasImg = img && /gradient/i.test(img) ? img.split(/,\s*(?=(?:repeating-)?(?:linear|radial|conic)-gradient\()/) : [];
        const paradasDe = (capa: string) => (capa.match(/(rgba?|color)\([^)]*\)/g) ?? []).map(normalizar);
        const arriba = capasImg.length ? paradasDe(capasImg[0]) : [];
        const paradas = arriba.length && arriba.every((p) => p[3] >= 1) ? arriba : capasImg.flatMap(paradasDe);
        if (paradas.length) pila.push(paradas); // la imagen se pinta ENCIMA del color del mismo elemento
        const c = normalizar(cs.backgroundColor);
        if (c[3] > 0) pila.push([c]);
        if (c[3] >= 1 || (paradas.length && paradas.every((p) => p[3] >= 1))) break;
        m = m.parentElement;
      }
      tenido = TINTE.length > 0 && pila.some((capa) => capa.some((c) => c[3] < 1 && cerca(TINTE, c)));
      let bases = [[255, 255, 255]];
      for (let i = pila.length - 1; i >= 0; i--) {
        bases = bases.flatMap((b) => pila[i].map((c) => [0, 1, 2].map((k) => c[k] * c[3] + b[k] * (1 - c[3]))));
      }
      return bases;
    };

    type M = { ratio: number; umbral: number; texto: string; fondo: string; color: string };
    let peor: M | null = null;
    let peorTinte: M | null = null;
    let vistos = 0;
    for (const el of Array.from(document.querySelectorAll(sel))) {
      if (el.closest('nextjs-portal, canvas, svg')) continue;
      const propio = Array.from(el.childNodes).some((x) => x.nodeType === 3 && (x.textContent ?? '').trim().length > 0);
      if (!propio) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
      const r = (el as HTMLElement).getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const fg = normalizar(cs.color);
      const fondos = fondosDe(el);
      if (texto === 'blanco') {
        if (fg[0] < 250 || fg[1] < 250 || fg[2] < 250) continue;
        if (!fondos.some((f) => cerca(MARCA, f))) continue;
      } else if (fg[3] < 1 || !cerca(OBJETIVO, fg)) continue;
      const px = parseFloat(cs.fontSize);
      const grande = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700);
      const umbral = texto !== 'blanco' && grande ? 3 : 4.5;
      for (const f of fondos) {
        const v = ratio(fg, f);
        const m: M = { ratio: +v.toFixed(2), umbral, texto: (el.textContent ?? '').trim().slice(0, 40), fondo: `rgb(${f.map(Math.round).join(', ')})`, color: `rgb(${fg.slice(0, 3).join(', ')})` };
        if (tenido) {
          if (!peorTinte || v / umbral < peorTinte.ratio / peorTinte.umbral) peorTinte = m;
        } else if (!peor || v / umbral < peor.ratio / peor.umbral) peor = m;
      }
      if (!tenido) vistos++;
    }
    const tinte = peorTinte ? { ratio: peorTinte.ratio, umbral: peorTinte.umbral, texto: peorTinte.texto, fondo: peorTinte.fondo } : null;
    return peor
      ? { ...peor, vistos, tinte }
      : { ratio: -1, umbral: 4.5, texto: 'NINGÚN TEXTO QUE MEDIR', fondo: '', color: '', vistos, tinte };
  }, { sel: opciones.selector ?? '*', texto: opciones.texto, tinteDe: opciones.separarTinteDe ?? null, marca: MARCA });
}
