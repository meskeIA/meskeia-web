import { test, expect } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * visualizador-sonido-ondas — las cuatro secciones, servidas · 05/09/2026 (semilla S0119)
 *
 * Hasta hoy la app tenía cuatro pestañas y solo la activa llegaba al DOM, así que tres
 * cuartas partes de su contenido no existían para ningún índice: 150 visitas en 90 días
 * con 2 impresiones de buscador, la desproporción mayor del cuadrante STEM.
 *
 * Lo que este test protege es justamente eso, y por eso comprueba la presencia SIMULTÁNEA
 * de los cuatro encabezados: si alguien vuelve a esconder secciones tras un estado de
 * cliente, la regresión es invisible en pantalla (la app se ve igual de bien) y solo se
 * nota meses después en Search Console.
 */

const URL_APP = '/visualizador-sonido-ondas/';

const SECCIONES = [
  { ancla: 'anatomia', titulo: 'Anatomía de una onda sonora' },
  { ancla: 'frecuencia', titulo: 'Frecuencia y tono' },
  { ancla: 'decibelios', titulo: 'Escala de decibelios' },
  { ancla: 'timbre', titulo: 'Timbre y armónicos' },
];

test.describe('visualizador-sonido-ondas', () => {
  test('las cuatro secciones están en la página a la vez, con su h2 y su ancla', async ({ page }) => {
    await page.goto(URL_APP);

    for (const s of SECCIONES) {
      await expect(page.getByRole('heading', { level: 2, name: s.titulo })).toBeVisible();
      await expect(page.locator(`section#${s.ancla}`)).toHaveCount(1);
    }
  });

  test('el índice lleva a cada sección por su ancla', async ({ page }) => {
    await page.goto(URL_APP);

    const indice = page.getByRole('navigation', { name: 'Secciones del visualizador' });
    for (const s of SECCIONES) {
      await expect(indice.locator(`a[href="#${s.ancla}"]`)).toHaveCount(1);
    }

    await indice.locator('a[href="#decibelios"]').click();
    await expect(page).toHaveURL(new RegExp('#decibelios$'));
    await expect(page.getByRole('heading', { level: 2, name: 'Escala de decibelios' })).toBeInViewport();
  });

  test('el contenido de las secciones viaja en el HTML servido, no solo tras hidratar', async ({ page }) => {
    // Se lee la respuesta del servidor directamente: si el contenido volviera a depender
    // de un estado de cliente, aquí faltarían tres de los cuatro títulos.
    const respuesta = await page.request.get(URL_APP);
    expect(respuesta.ok()).toBeTruthy();
    const html = await respuesta.text();

    for (const s of SECCIONES) {
      expect(html).toContain(s.titulo);
      expect(html).toContain(`id="${s.ancla}"`);
    }
  });

  /**
   * ⚠️ Este test aparecía en rojo de forma INTERMITENTE (1 de cada 3 corridas) hasta el
   * 12/09/2026: el botón de 880 Hz no llegaba a existir. No era la app, era la carrera de
   * hidratación descrita en `_hidratacion.ts` — reproducida a voluntad estrangulando la CPU
   * (`Emulation.setCPUThrottlingRate`, factor 20), que deja el `fill` por delante de React:
   * el DOM del deslizador se queda en 880 y el estado en 200, así que el `aria-label`, que
   * se deriva del estado, sigue diciendo «Escuchar tono a 200 hercios».
   * Por eso se espera a la hidratación ANTES de tocar el deslizador.
   */
  test('la onda sigue siendo interactiva tras el cambio', async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['input[aria-label="Frecuencia en hercios"]']);
    const slider = page.getByLabel('Frecuencia en hercios');
    await expect(slider).toHaveValue('200');
    await slider.fill('880');
    // El nombre accesible del botón sale de su aria-label, no del texto visible
    await expect(page.getByRole('button', { name: 'Escuchar tono a 880 hercios' })).toBeVisible();
  });
});
