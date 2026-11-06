import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, prepararParaMedir } from '../_contraste';

/**
 * Testigo de familia — el texto de una fila de las tablas de consulta de Stemum se lee con el ratón
 * encima, en los dos temas (cabo C0607, 06/11/2026).
 *
 * Hallazgo 3993 de tabla-limites-notables (03/11/2026): el tinte de `.filaBtn:hover` (rgba de marca
 * al 6 % en claro y al 14 % en oscuro) bajaba el texto de la fila a 4,44:1 en claro y 4,23:1 en
 * oscuro. El subagente sospechaba la regla en las hermanas; /reparar la midió por píxel en las diez
 * que la tienen: en oscuro caían TODAS, 4,22-4,24:1 (la fórmula en #3FA5D1, el gris de la categoría),
 * y en claro solo limites-notables, por su insignia de tendencia (marca sobre un tinte del 12 %).
 * Reparado cambiando el FONDO (receta de ec3a8adb): el hover oscuro al 5 % (4,67-4,69:1) y la
 * insignia al 6 % en claro. Se miden las tres primeras filas de cada tabla; con el ratón encima de
 * cada una, todo texto propio contra su fondo compuesto. Umbral 4,5:1 (3:1 en texto grande).
 */
const TABLAS = [
  'tabla-areas-volumenes',
  'tabla-constantes-fisicas',
  'tabla-derivadas',
  'tabla-grupos-funcionales',
  'tabla-integrales',
  'tabla-ka-kb',
  'tabla-limites-notables',
  'tabla-potenciales-redox',
  'tabla-solubilidad',
  'tabla-unidades-si',
];

async function peorConRaton(page: Page): Promise<{ margen: number; detalle: string }> {
  const filas = page.locator('[class*="filaBtn"]');
  const n = await filas.count();
  expect(n, 'filas de la tabla').toBeGreaterThan(0);
  let peor = { margen: Infinity, detalle: '' };
  for (let i = 0; i < Math.min(3, n); i++) {
    await filas.nth(i).hover();
    const m = await filas.nth(i).evaluate((boton) => {
      const lienzo = document.createElement('canvas');
      lienzo.width = lienzo.height = 1;
      const ctx = lienzo.getContext('2d', { willReadFrequently: true })!;
      const norm = (css: string) => {
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
        const x = lum(a);
        const y = lum(b);
        return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
      };
      const fondo = (el: Element) => {
        const pila: number[][] = [];
        for (let a: Element | null = el; a; a = a.parentElement) {
          const c = norm(getComputedStyle(a).backgroundColor);
          if (c[3] > 0) pila.push(c);
          if (c[3] >= 1) break;
        }
        let b = [255, 255, 255];
        for (let i = pila.length - 1; i >= 0; i--) b = [0, 1, 2].map((k) => pila[i][k] * pila[i][3] + b[k] * (1 - pila[i][3]));
        return b;
      };
      let peor = { margen: Infinity, detalle: '' };
      for (const el of [boton, ...Array.from(boton.querySelectorAll('*'))]) {
        if (!Array.from(el.childNodes).some((x) => x.nodeType === 3 && (x.textContent ?? '').trim())) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const bg = fondo(el);
        const px = parseFloat(cs.fontSize);
        const umbral = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700) ? 3 : 4.5;
        const r = ratio(norm(cs.color), bg);
        if (r / umbral < peor.margen) {
          peor = { margen: r / umbral, detalle: `${r.toFixed(2)}:1 (umbral ${umbral}) «${(el.textContent ?? '').trim().slice(0, 30)}» ${cs.color} sobre rgb(${bg.map(Math.round).join(', ')})` };
        }
      }
      return peor;
    });
    if (m.margen < peor.margen) peor = m;
  }
  return peor;
}

for (const slug of TABLAS) {
  test(`${slug}: con el ratón encima, el texto de la fila llega a 4,5:1 en claro y en oscuro (C0607)`, async ({ page }) => {
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    const claro = await peorConRaton(page);
    expect(claro.margen, `claro: ${claro.detalle}`).toBeGreaterThanOrEqual(1);
    await activarTemaOscuro(page);
    const oscuro = await peorConRaton(page);
    expect(oscuro.margen, `oscuro: ${oscuro.detalle}`).toBeGreaterThanOrEqual(1);
  });
}
