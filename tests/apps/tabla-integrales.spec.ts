import { test, expect, Page } from '@playwright/test';

/**
 * tabla-integrales — formulario para imprimir (semilla S0234, 28/10/2026)
 *
 * Quien teclea «tabla de integrales» (6.331 impresiones en 90 días, posición 5,4, CTR 0,93 %)
 * quiere la hoja: la búsqueda devuelve casi solo PDF. La app la imprime ahora en dos modos:
 *
 *   · completo → las 40 fórmulas y la regla de Barrow en UNA cara.
 *   · en blanco → la misma hoja con la primitiva vacía, y el solucionario en una SEGUNDA página.
 *
 * La promesa que se mide es la del texto de la sección: «en una sola cara, en tamaño Carta o
 * A4». Carta es más baja que A4 (279 frente a 297 mm) y es el formato de buena parte de
 * Latinoamérica, así que es la que decide. El margen es el del diálogo de Chrome por defecto
 * (~10 mm), y la hoja añade sus 8 mm propios (styles/impresion.module.css).
 *
 * Lo que NO mide: cómo se ve el papel. Eso lo valida el usuario en el navegador
 * (styles/CLAUDE.md); aquí solo se cuenta que no se desborde.
 */

const URL = '/tabla-integrales/';

/** Páginas de un PDF: cada página es un objeto /Type /Page (el árbol es /Pages). */
function contarPaginas(pdf: Buffer): number {
  return (pdf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
}

async function imprimir(page: Page, formato: 'Letter' | 'A4'): Promise<number> {
  const pdf = await page.pdf({
    format: formato,
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    printBackground: false,
  });
  return contarPaginas(pdf);
}

async function abrir(page: Page) {
  await page.goto(URL);
  await expect(page.getByRole('button', { name: 'Formulario completo' })).toBeVisible();
}

test.describe('Formulario para imprimir', () => {
  for (const formato of ['Letter', 'A4'] as const) {
    test(`completo: cabe en UNA cara en ${formato}`, async ({ page }) => {
      await abrir(page);
      expect(await imprimir(page, formato)).toBe(1);
    });

    test(`en blanco: hoja + solucionario son DOS páginas en ${formato}`, async ({ page }) => {
      await abrir(page);
      await page.getByRole('button', { name: 'En blanco, para practicar' }).click();
      await expect(page.getByRole('button', { name: /Imprimir hoja y solucionario/ })).toBeVisible();
      expect(await imprimir(page, formato)).toBe(2);
    });
  }

  test('la hoja lleva las 40 fórmulas más Barrow, y en blanco vacía todas menos las dos descriptivas', async ({ page }) => {
    await abrir(page);
    await page.emulateMedia({ media: 'print' });
    const hoja = page.locator('[data-hoja-formulario]');
    await expect(hoja).toBeVisible();
    // 40 de la tabla + la regla de Barrow
    await expect(hoja.locator('[class*="hojaFila"]')).toHaveCount(41);
    await expect(hoja.locator('[class*="hojaHueco"]')).toHaveCount(0);

    await page.emulateMedia({ media: 'screen' });
    await page.getByRole('button', { name: 'En blanco, para practicar' }).click();
    await page.emulateMedia({ media: 'print' });
    // Hoja (41 filas) + solucionario (41): 82, de las que 38 tienen hueco (40 − fracciones − cambios trig.)
    await expect(hoja.locator('[class*="hojaFila"]')).toHaveCount(82);
    await expect(hoja.locator('[class*="hojaHueco"]')).toHaveCount(38);
    await expect(hoja).toContainText('solucionario');
  });

  test('en pantalla la hoja no se ve y el resto de la app no sale por la impresora', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('[data-hoja-formulario]')).toBeHidden();
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('#buscador-integrales')).toBeHidden();
    await expect(page.getByRole('heading', { name: /Formulario para imprimir/ })).toBeHidden();
  });

  test('los dos modos son un conmutador con aria-pressed', async ({ page }) => {
    await abrir(page);
    const completo = page.getByRole('button', { name: 'Formulario completo' });
    const blanco = page.getByRole('button', { name: 'En blanco, para practicar' });
    await expect(completo).toHaveAttribute('aria-pressed', 'true');
    await expect(blanco).toHaveAttribute('aria-pressed', 'false');
    await blanco.click();
    await expect(completo).toHaveAttribute('aria-pressed', 'false');
    await expect(blanco).toHaveAttribute('aria-pressed', 'true');
  });
});
