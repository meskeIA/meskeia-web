/**
 * Familia «fecha ISO leída en UTC» (cabo C0299, 26/10/2026)
 *
 * `new Date('AAAA-MM-DD')` es medianoche UTC: en un huso negativo (América) `formatDate` da el
 * día ANTERIOR. Y su gemelo, `new Date().toISOString().split('T')[0]`, da la fecha de hoy en
 * UTC: por la tarde en América ya es MAÑANA. Es el gotcha del hallazgo 482, reparado en las
 * fichas de Delegum (3337, a282f246); aquí, en las dos apps de cliente que imprimen la fecha
 * que el usuario teclea en un `<input type="date">`.
 *
 * Caso: Ciudad de México (UTC−6, sin horario de verano desde 2022), 16/10/2026 a las 20:00, que
 * en UTC ya es el 17 a las 02:00.
 *   - Fecha propuesta al abrir: 2026-10-16 (antes, 2026-10-17).
 *   - Fecha tecleada 2026-03-05 → «05/03/2026» en el documento (antes, «04/03/2026»).
 *   - Presupuesto con 30 días de validez desde el 05/03/2026 → «04/04/2026» (antes, «03/04/2026»).
 */
import { test, expect } from '@playwright/test';

test.use({ timezoneId: 'America/Mexico_City', locale: 'es-ES' });

const TARDE_EN_MEXICO = new Date('2026-10-17T02:00:00Z'); // 16/10/2026 20:00 en México

test.describe('C0299 · generador-facturas', () => {
  test('propone la fecha de hoy en local, no la de UTC', async ({ page }) => {
    await page.clock.setFixedTime(TARDE_EN_MEXICO);
    await page.goto('/generador-facturas/');
    await expect(page.locator('#configFecha')).toHaveValue('2026-10-16');
  });

  test('la fecha tecleada sale el mismo día en el resumen', async ({ page }) => {
    await page.clock.setFixedTime(TARDE_EN_MEXICO);
    await page.goto('/generador-facturas/');
    const fecha = page.locator('#configFecha');
    // La fecha se rellena al montar: con valor, React ya ha hidratado
    await expect(fecha).not.toHaveValue('');
    await fecha.fill('2026-03-05');
    await expect(page.locator('[class*="summaryFecha"]')).toHaveText('05/03/2026');
  });
});

/**
 * C0468 · control-gastos (27/10/2026). La fecha propuesta salía de un inicializador de useState
 * con toISOString (C0074: el prerender lleva la del build, y además en UTC), y la lista leía la
 * fecha del movimiento con new Date('AAAA-MM-DD'): en México un gasto del 05/03 salía «04 mar».
 */
test.describe('C0468 · control-gastos', () => {
  test('propone la fecha de hoy en local y lista el movimiento el día tecleado', async ({ page }) => {
    await page.clock.setFixedTime(TARDE_EN_MEXICO);
    await page.goto('/control-gastos/');
    const fecha = page.locator('input[type="date"]');
    await expect(fecha).toHaveValue('2026-10-16');
    await page.getByPlaceholder('Ej: Supermercado').fill('Pan');
    await page.getByPlaceholder('0,00').fill('3');
    await fecha.fill('2026-03-05');
    await page.getByRole('button', { name: 'Alimentación' }).click();
    await page.getByRole('button', { name: '+ Añadir Gasto' }).click();
    await expect(page.locator('[class*="movimientoMeta"]').first()).toHaveText(/^05 mar/);
  });
});

/**
 * C0074/C0468 · calendario-fiscal-emprendedor (27/10/2026). Las fechas límite se guardan como
 * AAAA-MM-DD y se leían con new Date(): en México el 303 del 1T salía «19 de abril» en vez del
 * 20. Y en España, la lista de próximos vencimientos comparaba con la hora actual: el
 * vencimiento de HOY salía de la lista nada más empezar el día y el «¡HOY!» no se veía nunca.
 */
test.describe('C0468 · calendario-fiscal-emprendedor', () => {
  test('las fechas límite salen el mismo día en México', async ({ page }) => {
    await page.clock.setFixedTime(TARDE_EN_MEXICO);
    await page.goto('/calendario-fiscal-emprendedor/');
    await expect(page.getByText('Calculando los vencimientos pendientes…')).toHaveCount(0);
    await page.getByRole('button', { name: 'Modelos' }).click();
    await page.getByText('Modelo 303', { exact: true }).first().click();
    await expect(page.getByText('1T: 20 de abril de 2026')).toBeVisible();
  });
});

test.describe('C0468 · calendario-fiscal-emprendedor en España', () => {
  test.use({ timezoneId: 'Europe/Madrid' });

  test('el vencimiento de hoy sigue en la lista con «¡HOY!»', async ({ page }) => {
    // 20/04/2026 a las 10:00 en Madrid: vence el 303 del 1T
    await page.clock.setFixedTime(new Date('2026-04-20T08:00:00Z'));
    await page.goto('/calendario-fiscal-emprendedor/');
    await expect(page.locator('[class*="diasNumero"]').first()).toHaveText('¡HOY!');
  });
});

test.describe('C0299 · calculadora-presupuestos', () => {
  test('propone la fecha de hoy en local y la imprime igual', async ({ page }) => {
    await page.clock.setFixedTime(TARDE_EN_MEXICO);
    await page.goto('/calculadora-presupuestos/');
    const fecha = page.locator('input[type="date"]');
    await expect(fecha).toHaveValue('2026-10-16');
    await expect(page.getByText('Fecha:', { exact: true }).locator('..')).toHaveText('Fecha: 16/10/2026');
  });

  test('fecha y validez del documento salen el día tecleado', async ({ page }) => {
    await page.clock.setFixedTime(TARDE_EN_MEXICO);
    await page.goto('/calculadora-presupuestos/');
    const fecha = page.locator('input[type="date"]');
    await expect(fecha).not.toHaveValue('');
    await fecha.fill('2026-03-05');
    await expect(page.getByText('Fecha:', { exact: true }).locator('..')).toHaveText('Fecha: 05/03/2026');
    await expect(page.getByText('Válido hasta:', { exact: true }).locator('..')).toHaveText(
      'Válido hasta: 04/04/2026',
    );
  });
});
