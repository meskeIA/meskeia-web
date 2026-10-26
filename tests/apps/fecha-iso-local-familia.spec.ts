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
