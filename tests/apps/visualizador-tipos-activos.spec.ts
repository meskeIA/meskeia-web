import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, prepararParaMedir } from '../_contraste';

/**
 * visualizador-tipos-activos — el nombre de cada clase de activo en su detalle (cabo C0645,
 * 21/11/2026).
 *
 * El título del detalle se pintaba en el color puro de la clase con style: en claro, Bonos
 * (#48A9A6) 2,80:1, Inmobiliario (#E07B54) 2,95, Materias Primas (#C9A84C) 2,29 y Criptomonedas
 * (#F7931A) 2,30 sobre la tarjeta blanca (en oscuro llegaban). Es texto grande (1,6 rem en
 * negrita), así que el umbral es 3:1. Ahora lleva el tono de su color que llega a 3:1 en cada tema.
 *
 * Las insignias de la parrilla y la pestaña de correlación las mide la fila de
 * tests/contraste-marca-datos.spec.ts.
 */

const RUTA = '/visualizador-tipos-activos/';

async function contrasteDelTitulo(page: Page): Promise<{ texto: string; ratio: number }> {
  return page.locator('h2[class*="detalleNombre"]').evaluate((el) => {
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
    const can = (c: number) => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = (p: number[]) => 0.2126 * can(p[0]) + 0.7152 * can(p[1]) + 0.0722 * can(p[2]);
    const capas: number[][] = [];
    for (let e: Element | null = el; e; e = e.parentElement) {
      const c = norm(getComputedStyle(e).backgroundColor);
      if (c[3] > 0) capas.push(c);
      if (c[3] >= 1) break;
    }
    let b = [255, 255, 255];
    for (let i = capas.length - 1; i >= 0; i--) b = [0, 1, 2].map((k) => capas[i][k] * capas[i][3] + b[k] * (1 - capas[i][3]));
    const fg = norm(getComputedStyle(el).color);
    const [x, y] = [lum(fg), lum(b)].sort((m, n) => n - m);
    return { texto: (el.textContent ?? '').trim(), ratio: (x + 0.05) / (y + 0.05) };
  });
}

async function recorrerDetalles(page: Page): Promise<string[]> {
  const fuera: string[] = [];
  await page.getByRole('tab', { name: /clases/i }).first().click();
  await page.locator('button[aria-label^="Ver detalle de"]').first().click();
  for (let i = 0; i < 6; i++) {
    await expect(page.locator('h2[class*="detalleNombre"]')).toBeVisible();
    const { texto, ratio } = await contrasteDelTitulo(page);
    if (ratio < 3) fuera.push(`«${texto}»: ${ratio.toFixed(2)}:1`);
    const siguiente = page.getByRole('button', { name: 'Clase de activo siguiente' });
    if (i < 5) await siguiente.click();
  }
  return fuera;
}

test('C0645 — el nombre de cada clase en su detalle se lee en claro y en oscuro', async ({ page }) => {
  await page.goto(RUTA);
  await prepararParaMedir(page);
  await expect(page.locator('button[aria-label^="Ver detalle de"]').first()).toBeVisible();
  expect.soft(await recorrerDetalles(page), 'claro').toEqual([]);
  await activarTemaOscuro(page);
  expect.soft(await recorrerDetalles(page), 'oscuro').toEqual([]);
});
