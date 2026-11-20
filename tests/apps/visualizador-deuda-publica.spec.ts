import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, prepararParaMedir } from '../_contraste';

/**
 * visualizador-deuda-publica — el color de los datos como texto (cabo C0798, 20/11/2026).
 *
 * El título de cada instrumento (Bonos soberanos) y el del tenedor elegido (Quién la tiene) se
 * pintaban con style={{ color }} en el color del dato: en claro, «Bonos del Estado» en #48A9A6 a
 * 2,80:1 y «Obligaciones del Estado» en #7FB3D3 a 2,26:1 sobre la tarjeta blanca; los tenedores,
 * de #2E86AB (4,11:1) a #A8D5E2 (≈1,6:1). Ahora el título va en el texto del tema y el color del
 * dato se queda en el borde. Las chips y los consejos de la guía, que en oscuro daban 3,71 y
 * 3,92:1, los mide la fila de la app en tests/contraste-marca-datos.spec.ts; el detalle de cada
 * tenedor solo aparece al elegirlo, y ese estado no lo recorre el testigo: se mide aquí.
 */

const TENEDORES = [
  ['BCE / Banco de España', 'rgb(46, 134, 171)'],
  ['Inversores extranjeros', 'rgb(72, 169, 166)'],
  ['Bancos nacionales', 'rgb(127, 179, 211)'],
  ['Fondos de inversión y seguros', 'rgb(91, 163, 201)'],
  ['Inversores minoristas', 'rgb(168, 213, 226)'],
] as const;

async function textoDelTema(page: Page): Promise<string> {
  return page.evaluate(() => {
    const prueba = document.createElement('span');
    prueba.style.color = 'var(--text-primary)';
    document.body.appendChild(prueba);
    const c = getComputedStyle(prueba).color;
    prueba.remove();
    return c;
  });
}

async function comprobarTenedores(page: Page): Promise<void> {
  const texto = await textoDelTema(page);
  for (const [nombre, color] of TENEDORES) {
    // El botón de la leyenda (el sector de la tarta también es role=button con el mismo nombre)
    const boton = page.locator('button[aria-pressed]', { hasText: nombre });
    if ((await boton.getAttribute('aria-pressed')) !== 'true') await boton.click();
    const detalle = page.locator('[class*="tenedorDetalle"]');
    await expect(detalle.getByRole('heading', { name: nombre })).toHaveCSS('color', texto);
    await expect(detalle).toHaveCSS('border-left-color', color);
  }
}

test.describe('visualizador-deuda-publica — títulos en el texto del tema, el color del dato en el borde', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/visualizador-deuda-publica/');
    await prepararParaMedir(page);
  });

  test('C0798 · los títulos de los instrumentos no van en el color del dato', async ({ page }) => {
    const texto = await textoDelTema(page);
    for (const nombre of ['Letras del Tesoro', 'Bonos del Estado', 'Obligaciones del Estado']) {
      await expect(page.getByRole('heading', { name: nombre, exact: true })).toHaveCSS('color', texto);
    }
  });

  test('C0798 · el detalle de cada tenedor, en claro y en oscuro', async ({ page }) => {
    await page.getByRole('button', { name: /Quién la tiene/ }).click();
    await comprobarTenedores(page);
    await activarTemaOscuro(page);
    await comprobarTenedores(page);
  });
});
