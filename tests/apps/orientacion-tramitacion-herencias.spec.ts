/**
 * Orientación para tramitar una herencia — plazos del ISD y color de marca (cabo C0063)
 *
 * Hermana de `estimador-impuesto-sucesiones`, donde el hallazgo 2331 llevó el plazo de la
 * prórroga a PLAZO_ISD. Aquí seguía tecleado en cinco sitios y decía dos cosas distintas:
 * «antes del mes 5» (se lee como un mes menos) y, en la lista de errores, que la prórroga se
 * pide «mientras aún no ha vencido el plazo original» (un mes de más). El art. 68.1 RISD dice
 * «dentro de los cinco primeros meses». Y el módulo fijaba --primary y --secondary con el valor
 * del claro en su .container (la forma del 2326), así que en oscuro no seguían al tema.
 */

import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { PLAZO_ISD } from '../../data/fiscal/sucesiones';

const RUTA = '/orientacion-tramitacion-herencias/';

async function textoCompleto(page: Page): Promise<string> {
  // Sin <script> ni <style>: el payload de React contiene cualquier cadena que uno busque.
  const t = await page.evaluate(() => {
    const clon = document.body.cloneNode(true) as HTMLElement;
    clon.querySelectorAll('script, style').forEach((n) => n.remove());
    return clon.textContent ?? '';
  });
  return t.replace(/\s+/g, ' ');
}

test.describe('orientacion-tramitacion-herencias — C0063', () => {
  test('la prórroga del ISD se pide dentro de los cinco primeros meses, en todas partes', async ({ page }) => {
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    const texto = await textoCompleto(page);

    expect(texto).toContain(`dentro de los ${PLAZO_ISD.mesesParaPedirProrroga} primeros meses`);
    expect(texto, '«antes del mes 5» es un mes de menos').not.toMatch(/antes del (mes \d|\d\.º mes)/);
    expect(texto, 'hasta el vencimiento del plazo original es un mes de más').not.toMatch(
      /mientras aún no ha vencido el plazo original/,
    );
    expect(texto).not.toContain('Pasado el mes 5');
  });

  test('el contenedor no fija --primary ni --secondary: siguen al tema oscuro', async ({ page }) => {
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const valores = await page.evaluate(() => {
      const raiz = getComputedStyle(document.documentElement);
      const cont = document.querySelector('[class*="OrientacionHerencias"][class*="container"]');
      if (!cont) throw new Error('no encuentro el .container del módulo');
      const c = getComputedStyle(cont);
      return {
        raizPrimary: raiz.getPropertyValue('--primary').trim(),
        contPrimary: c.getPropertyValue('--primary').trim(),
        raizSecondary: raiz.getPropertyValue('--secondary').trim(),
        contSecondary: c.getPropertyValue('--secondary').trim(),
      };
    });
    expect(valores.contPrimary.toLowerCase()).not.toBe('#2e86ab');
    expect(valores.contPrimary).toBe(valores.raizPrimary);
    expect(valores.contSecondary).toBe(valores.raizSecondary);
  });
});
