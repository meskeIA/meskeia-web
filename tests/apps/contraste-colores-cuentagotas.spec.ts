import { test, expect, type Page } from '@playwright/test';

/**
 * contraste-colores · cuentagotas de pantalla (S0261, 08/11/2026).
 *
 * La EyeDropper API abre una lupa del sistema que Playwright no puede manejar, así que se
 * SUSTITUYE por una falsa antes de cargar la página: devuelve el color que el caso pide, o se
 * cancela como con Esc. Lo que se comprueba es lo de la app: que el botón solo sale donde hay
 * API, que el color cogido entra en su campo y mueve el ratio, y que cancelar no cambia nada.
 */

type Modo = { tipo: 'color'; valor: string } | { tipo: 'cancelar' } | { tipo: 'sin-api' };

async function preparar(page: Page, modo: Modo) {
  await page.addInitScript((m: Modo) => {
    const w = window as unknown as { EyeDropper?: unknown };
    if (m.tipo === 'sin-api') {
      delete w.EyeDropper;
      return;
    }
    w.EyeDropper = class {
      open() {
        if (m.tipo === 'cancelar') return Promise.reject(new DOMException('cancelado', 'AbortError'));
        return Promise.resolve({ sRGBHex: m.valor });
      }
    };
  }, modo);
  await page.goto('/contraste-colores/');
  const campo = page.getByLabel('Código hexadecimal del color de texto');
  await expect(campo).toBeVisible();
  await expect
    .poll(() => campo.evaluate((el) => Object.keys(el).some((k) => k.startsWith('__reactProps$'))))
    .toBe(true);
}

test('coge el color del texto de la pantalla y recalcula el ratio', async ({ page }) => {
  await preparar(page, { tipo: 'color', valor: '#767676' });
  await expect(page.getByText('¿Quieres comprobar una web que ya existe?')).toBeVisible();
  await page.getByRole('button', { name: /Coger el color de texto de la pantalla/ }).click();
  await expect(page.getByLabel('Código hexadecimal del color de texto')).toHaveValue('#767676');
  // #767676 sobre blanco: 4,54:1, el gris más claro que aún pasa AA (cálculo WCAG a mano)
  await expect(page.getByText(/^4[.,]54:1$/)).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Color de texto tomado de la pantalla: #767676' })).toBeVisible();
});

test('coge el fondo y normaliza un rgb() a hexadecimal', async ({ page }) => {
  await preparar(page, { tipo: 'color', valor: 'rgb(26, 26, 26)' });
  await page.getByRole('button', { name: /Coger el color de fondo de la pantalla/ }).click();
  await expect(page.getByLabel('Código hexadecimal del color de fondo')).toHaveValue('#1A1A1A');
});

test('Esc no cambia nada ni da aviso', async ({ page }) => {
  await preparar(page, { tipo: 'cancelar' });
  await page.getByRole('button', { name: /Coger el color de texto de la pantalla/ }).click();
  await expect(page.getByRole('button', { name: /Coger el color de texto de la pantalla/ })).toBeEnabled();
  await expect(page.getByLabel('Código hexadecimal del color de texto')).toHaveValue('#000000');
  await expect(page.getByRole('status').filter({ hasText: /pantalla|cuentagotas/ })).toHaveCount(0);
});

test('sin la API (Firefox, Safari, móvil) no hay botón ni explicación', async ({ page }) => {
  await preparar(page, { tipo: 'sin-api' });
  await expect(page.getByRole('button', { name: /Coger el color/ })).toHaveCount(0);
  await expect(page.getByText('¿Quieres comprobar una web que ya existe?')).toHaveCount(0);
});
