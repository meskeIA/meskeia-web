import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * estimador-riesgo-osteoporosis — regresión del 18/09/2026
 *
 * Este fichero NO nace de una inspección de esta app: nace de grepear en sus hermanas el
 * hallazgo 895, que el Inspector encontró en `test-fragilidad`. Allí, pulsar «Evaluar» sin
 * responder nada devolvía «Robusto — Sin fragilidad detectada»; aquí devolvía «🟢 Riesgo bajo
 * · No acumulas factores de riesgo significativos». El defecto es el mismo y tiene la misma
 * causa: con una sola casilla por factor, «no me aplica ninguno» y «todavía no he contestado»
 * son el mismo estado, y el veredicto tranquilizador sale igual.
 *
 * La reparación es distinta porque la app es distinta: en FRAIL los ítems son 5 y se
 * convirtieron en radios Sí/No; aquí son 12 y obligar a marcar doce «No» sería peor remedio
 * que la enfermedad, así que el primer clic sin nada marcado pide confirmación y el segundo
 * emite. Lo que se fija aquí es exactamente esa diferencia entre el silencio y la respuesta.
 */

const RUTA = '/estimador-riesgo-osteoporosis/';

const botonEvaluar = (page: Page) =>
  page.getByRole('button', { name: 'Evaluar riesgo de osteoporosis' });
const veredicto = (page: Page) => page.locator('[role="status"]');
const avisoSinFactores = (page: Page) => page.locator('[class*="avisoSinFactores"]');

async function abrir(page: Page) {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[type="checkbox"]']);
}

test('sin marcar nada, el primer clic pide confirmación en vez de tranquilizar', async ({
  page,
}) => {
  await abrir(page);
  await botonEvaluar(page).click();

  await expect(veredicto(page)).toHaveCount(0);
  await expect(avisoSinFactores(page)).toContainText('No has marcado ningún factor de riesgo');
  await expect(avisoSinFactores(page)).toHaveAttribute('role', 'alert');
  // Y lo que NO puede haber salido es el veredicto de riesgo bajo.
  await expect(page.getByText('No acumulas factores de riesgo significativos')).toHaveCount(0);
});

test('confirmando, sí se emite el resultado de riesgo bajo', async ({ page }) => {
  await abrir(page);
  await botonEvaluar(page).click();
  await expect(avisoSinFactores(page)).toBeVisible();

  // El segundo clic es la respuesta explícita «ninguno me aplica»: ahí el veredicto sí
  // corresponde a algo que el usuario ha dicho.
  await botonEvaluar(page).click();
  await expect(veredicto(page)).toContainText('Riesgo bajo');
  await expect(avisoSinFactores(page)).toHaveCount(0);
});

test('con un factor marcado el veredicto sale a la primera, sin confirmación', async ({ page }) => {
  await abrir(page);
  await page.locator('input[type="checkbox"]').first().check();

  await botonEvaluar(page).click();

  await expect(avisoSinFactores(page)).toHaveCount(0);
  await expect(veredicto(page)).toBeVisible();
});
