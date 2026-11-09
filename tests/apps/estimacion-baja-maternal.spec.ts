import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * estimacion-baja-maternal — hermana de estimacion-prestacion-nacimiento (misma fuente:
 * AMPLIACION_POR_ID de data/fiscal/maternidad.ts). Spec creado en /reparar el 09/11/2026 al
 * medir en esta app los hallazgos 4285 y 4287 de su hermana.
 *
 * FUENTE (consultada el 09/11/2026): ET art. 48.4 y 48.6 (BOE-A-2015-11430). Parto múltiple:
 * una semana por progenitor por cada hijo distinto del primero, y la única persona progenitora
 * disfruta «las ampliaciones completas». Hospitalización: solo «por un período superior a siete
 * días».
 *
 * CASOS A MANO
 *   · Monoparental, gemelos: 32 + 2 = 34 semanas (antes 33).
 *   · Biparental, gemelos: 19 + 1 = 20 semanas.
 *   · Biparental, hospitalización de 7 días (el valor por defecto): 19 semanas, sin ampliación
 *     (antes 20).
 *
 * HALLAZGO 4288 (decidido por el usuario el 09/11/2026, ET 48.5 y 48.6 en el BOE ese día):
 *   · Discapacidad, biparental: 19 + 1 = 20 semanas por progenitor (antes 21).
 *   · Discapacidad, monoparental: 32 + 2 = 34 semanas (las ampliaciones completas; daba 34
 *     por accidente: 2 por progenitor).
 *   · Adopción o acogimiento: 19 semanas (antes 21: sumaba 2 por un desplazamiento que el ET
 *     no da en semanas, solo adelanta el inicio hasta cuatro antes de la resolución).
 */

async function estimar(page: Page): Promise<string> {
  await page.getByRole('button', { name: 'Estimar duracion de la baja' }).click();
  const total = page.locator('p', { hasText: /^\d+$/ }).first();
  await expect(total).toBeVisible();
  return (await total.innerText()).trim();
}

test.describe('estimacion-baja-maternal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/estimacion-baja-maternal/');
    await esperarHidratacion(page, ['input[name="tipoFamilia"]']);
  });

  test('gemelos en familia biparental: 19 + 1 = 20 semanas', async ({ page }) => {
    await page.getByLabel('Parto/adopcion multiple').check();
    expect(await estimar(page)).toBe('20');
  });

  test('REPARADO (09/11/2026, hermana del 4285) · gemelos en familia monoparental: 32 + 2 = 34 semanas', async ({
    page,
  }) => {
    await page.getByLabel('Monoparental (1 progenitor): 32 semanas').check();
    await page.getByLabel('Parto/adopcion multiple').check();
    expect(await estimar(page)).toBe('34');
  });

  test('REPARADO (09/11/2026, hermana del 4287) · una hospitalización de 7 días no amplía el permiso', async ({
    page,
  }) => {
    await page.getByLabel('Hospitalizacion neonatal (parto prematuro u otra causa)').check();
    expect(await estimar(page)).toBe('19');
  });

  test('REPARADO (09/11/2026, 4288) · discapacidad en familia biparental: 19 + 1 = 20 semanas', async ({ page }) => {
    await page.getByLabel('El bebe tiene discapacidad reconocida').check();
    expect(await estimar(page)).toBe('20');
  });

  test('REPARADO (09/11/2026, 4288) · discapacidad en familia monoparental: 32 + 2 = 34 semanas', async ({ page }) => {
    await page.getByLabel('Monoparental (1 progenitor): 32 semanas').check();
    await page.getByLabel('El bebe tiene discapacidad reconocida').check();
    expect(await estimar(page)).toBe('34');
  });

  test('REPARADO (09/11/2026, 4288) · adopción y acogimiento no suman semanas: 19', async ({ page }) => {
    for (const situacion of ['Adopcion', 'Acogimiento']) {
      await page.getByLabel(situacion, { exact: true }).check();
      expect(await estimar(page), situacion).toBe('19');
    }
  });
});
