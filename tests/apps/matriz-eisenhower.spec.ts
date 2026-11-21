import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, prepararParaMedir } from '../_contraste';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * matriz-eisenhower — el contador de cada cuadrante en la barra de estadísticas (cabo C0645,
 * 21/11/2026).
 *
 * La barra que aparece al añadir tareas pintaba el número de cada cuadrante en el color del
 * cuadrante con style: «Delegar» en #f39c12 (2,19:1 sobre la tarjeta blanca), «Eliminar» en
 * #95a5a6 (2,5:1), «Hacer» en #e74c3c (3,82:1) y «Planificar» en la marca (4,11:1). Ahora cada
 * cuadrante tiene su tono de texto por tema y el color queda para los bordes.
 *
 * El «Por qué funciona» de los escenarios lo mide la fila de tests/contraste-marca-datos.spec.ts.
 */

const RUTA = '/matriz-eisenhower/';
const ENTRADA = 'input[aria-label="Nueva tarea"]';

async function contadoresFueraDeUmbral(page: Page): Promise<string[]> {
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
    const can = (c: number) => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = (p: number[]) => 0.2126 * can(p[0]) + 0.7152 * can(p[1]) + 0.0722 * can(p[2]);
    const ratio = (a: number[], b: number[]) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    const fondo = (el: Element): number[] => {
      const capas: number[][] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        const c = norm(getComputedStyle(e).backgroundColor);
        if (c[3] > 0) capas.push(c);
        if (c[3] >= 1) break;
      }
      let b = [255, 255, 255];
      for (let i = capas.length - 1; i >= 0; i--) b = [0, 1, 2].map((k) => capas[i][k] * capas[i][3] + b[k] * (1 - capas[i][3]));
      return b;
    };
    const items = Array.from(document.querySelectorAll('[class*="statItem"]'));
    if (items.length < 5) return [`solo ${items.length} contadores en la barra`];
    const fuera: string[] = [];
    for (const el of items) {
      const fg = norm(getComputedStyle(el).color);
      const v = ratio(fg, fondo(el));
      if (v < 4.5) fuera.push(`«${(el.textContent ?? '').trim()}» rgb(${fg.slice(0, 3)}): ${v.toFixed(2)}:1`);
    }
    return fuera;
  });
}

test('C0645 — el contador de cada cuadrante se lee sobre la barra, en claro y en oscuro', async ({ page }) => {
  await page.goto(RUTA);
  await prepararParaMedir(page);
  await esperarHidratacion(page, [ENTRADA]);
  for (const cuadrante of ['hacer', 'planificar', 'delegar', 'eliminar']) {
    await page.getByLabel('Seleccionar cuadrante').selectOption(cuadrante);
    await page.locator(ENTRADA).fill(`Tarea ${cuadrante}`);
    await esperarValorEnReact(page, ENTRADA, `Tarea ${cuadrante}`);
    await page.getByRole('button', { name: 'Añadir tarea' }).click();
  }
  await expect(page.getByText('tareas totales')).toBeVisible();
  await expect(page.locator('[class*="statsBar"]')).toContainText('4');
  expect.soft(await contadoresFueraDeUmbral(page), 'claro').toEqual([]);
  await activarTemaOscuro(page);
  expect.soft(await contadoresFueraDeUmbral(page), 'oscuro').toEqual([]);
});
