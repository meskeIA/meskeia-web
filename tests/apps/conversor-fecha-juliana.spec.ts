import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * conversor-fecha-juliana — Conversor de Fecha Juliana (S0271, 12/11/2026)
 *
 * Tres modos sobre el motor lib/calculadoras/fechaJuliana.ts, cuyos casos (con los ejemplos
 * publicados de Meeus) están en tests/fecha-juliana-motor.spec.ts. Aquí se comprueba que la
 * vista lee los campos y pinta lo que el motor devuelve.
 *
 * La fecha de hoy y el año de referencia los pone un efecto al montar, así que los casos
 * escriben su propia fecha y su propio año: no dependen del día en que se ejecuten.
 *
 * Casos resueltos a mano:
 *   12/11/2026            → día 316 · 26316 · 2026316 · 6316 · 2026-316 · jueves
 *   «6316», ref. 2026     → 12/11/2026 · también 11/11/2016 · 11/11/2036 (bisiestos)
 *   «2025366»             → error: 2025 no es bisiesto
 *   1/1/2000 12:00:00 UT  → JD 2.451.545,00000 · sábado (época J2000.0, el valor de partida)
 *   JD «2436116,31»       → 04/10/1957 19:26:24 (Meeus, ejemplo 7.c)
 *   10/10/1582            → error: esos días no existieron
 */

async function abrir(page: Page): Promise<void> {
  await page.goto('/conversor-fecha-juliana/');
  await esperarHidratacion(page, ['#fecha-entrada']);
}

const estado = (page: Page) => page.getByRole('status');

test.describe('Fecha → código juliano', () => {
  test('12/11/2026 es el día 316 y se escribe 26316, 2026316, 6316 y 2026-316', async ({ page }) => {
    await abrir(page);
    await page.locator('#fecha-entrada').fill('2026-11-12');
    await esperarValorEnReact(page, '#fecha-entrada', '2026-11-12');
    const r = estado(page);
    await expect(r).toContainText('316');
    await expect(r).toContainText('jueves 12/11/2026');
    await expect(r).toContainText('día 316 de 365');
    await expect(r).toContainText('faltan 49');
    for (const codigo of ['26316', '2026316', '6316', '2026-316']) await expect(r).toContainText(codigo);
  });
});

test.describe('Código juliano → fecha', () => {
  test('«6316» con referencia 2026 → 12/11/2026, y las décadas vecinas', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Código juliano → fecha' }).click();
    await esperarHidratacion(page, ['#codigo-entrada', '#anio-referencia']);
    await page.locator('#anio-referencia').fill('2026');
    await esperarValorEnReact(page, '#anio-referencia', '2026');
    await page.locator('#codigo-entrada').fill('6316');
    await esperarValorEnReact(page, '#codigo-entrada', '6316');
    const r = estado(page);
    await expect(r).toContainText('12/11/2026');
    await expect(r).toContainText('ADDD');
    await expect(r).toContainText('11/11/2016 · 11/11/2036');
  });

  test('«2025366» se rechaza: 2025 no es bisiesto', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Código juliano → fecha' }).click();
    await esperarHidratacion(page, ['#codigo-entrada']);
    await page.locator('#codigo-entrada').fill('2025366');
    await esperarValorEnReact(page, '#codigo-entrada', '2025366');
    await expect(estado(page)).toContainText('2025 no es bisiesto');
  });
});

test.describe('Día juliano astronómico', () => {
  test('parte de J2000.0 y convierte en los dos sentidos', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Día juliano (astronomía)' }).click();
    await esperarHidratacion(page, ['input[aria-label="Día"]']);
    await expect(estado(page)).toContainText('2.451.545,00000');
    await expect(estado(page)).toContainText('sábado');

    await page.getByRole('button', { name: 'JD → fecha y hora' }).click();
    await esperarHidratacion(page, ['#jd-entrada']);
    await page.locator('#jd-entrada').fill('2436116,31');
    await esperarValorEnReact(page, '#jd-entrada', '2436116,31');
    await expect(estado(page)).toContainText('04/10/1957 19:26:24');
    await expect(estado(page)).toContainText('calendario gregoriano');
  });

  test('del 5 al 14 de octubre de 1582 no hubo días', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Día juliano (astronomía)' }).click();
    await esperarHidratacion(page, ['input[aria-label="Día"]']);
    for (const [campo, valor] of [['Día', '10'], ['Mes', '10'], ['Año', '1582'], ['Hora', '0']] as const) {
      const sel = `input[aria-label="${campo}"]`;
      await page.locator(sel).fill(valor);
      await esperarValorEnReact(page, sel, valor);
    }
    await expect(estado(page)).toContainText('no hubo días');
  });
});
