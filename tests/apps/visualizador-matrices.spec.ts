import { test, expect } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { activarTemaOscuro, medirContraste, prepararParaMedir } from '../_contraste';

/**
 * Visualizador de matrices. Nace con /reparar del 20/11/2026 (cabo C0798).
 *
 * El texto en color de datos de las secciones que tests/contraste-marca-datos.spec.ts no recorre
 * (allí se miden los cuatro tipos de matriz de la carga): b y c del determinante iban en #e67e22,
 * 2,85:1 sobre la tarjeta en claro. Se mide el texto en el naranja de antes Y en los tonos de
 * texto de ahora (--naranja-texto en claro y en oscuro), y se exige haber visto alguno: un caso que
 * no encuentra nada que medir no prueba nada.
 */

const NARANJAS = ['#e67e22', '#B93E0B', '#FDBA74'];

async function abrirDeterminante(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('navigation', { name: 'Secciones' }).getByRole('button', { name: /Operaciones/ }).click();
  await page.getByRole('button', { name: 'Determinante', exact: true }).click();
  await expect(page.getByText('det = 0')).toBeVisible();
}

test.describe('Visualizador de matrices', () => {
  test('«Escala ×0,5» aplica la matriz de una escala y la escribe con coma decimal', async ({ page }) => {
    // A mano: escalar por 0,5 es [[0,5 0][0 0,5]]; el cuadrado de vértices (±1, ±1) pasa a (±0,5,
    // ±0,5), que en el SVG (centro 150, 50 px por unidad, y hacia arriba) son 125 y 175. La matriz
    // de antes, [[0,5 0][0,5 0,5]], llevaba (1, 1) a (0,5, 1): un rombo cizallado, no un cuadrado.
    await page.goto('/visualizador-matrices/');
    await esperarPaginaAsentada(page);
    await page.getByRole('navigation', { name: 'Secciones' }).getByRole('button', { name: /Transformaciones/ }).click();
    await page.getByRole('button', { name: /Escala ×0,5/ }).click();
    const celdas = page.getByText('Matriz aplicada').locator('xpath=following-sibling::*[1]').locator('span');
    await expect(celdas).toHaveText(['0,5', '0', '0', '0,5']);
    const figura = page.locator('svg[aria-label^="Plano cartesiano"] polygon').last();
    await expect(figura).toHaveAttribute('points', '175,125 175,175 125,175 125,125');
  });

  test('b y c del determinante se leen en naranja en claro y en oscuro (C0798)', async ({ page }) => {
    await page.goto('/visualizador-matrices/');
    await esperarPaginaAsentada(page);
    await prepararParaMedir(page);
    await abrirDeterminante(page);
    for (const tema of ['claro', 'oscuro']) {
      if (tema === 'oscuro') await activarTemaOscuro(page);
      const m = await medirContraste(page, { texto: NARANJAS });
      expect(m.vistos, `${tema}: texto naranja medido`).toBeGreaterThan(0);
      expect(m.ratio, `${tema}: «${m.texto}» ${m.color} sobre ${m.fondo}`).toBeGreaterThanOrEqual(m.umbral);
    }
  });
});
