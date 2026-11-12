import { test, expect } from '@playwright/test';

/**
 * estimador-coste-vivienda — cabo C0717 (turno de noche del 12/11/2026).
 *
 * La app presentaba la «regla del 1 %» de mantenimiento anual como regla general, sin fuente ni
 * año (CLAUDE.md §1.quinquies, punto 1: cifras populares sin fuente), en cuatro sitios: la FAQ,
 * la pregunta de la guía, el consejo del fondo separado y la tarjeta «Fondo de reserva del 1%».
 * No hay una fuente oficial que dé esa cifra (es una pauta de divulgación financiera), así que se
 * presenta como pauta orientativa y se dice de qué depende el gasto real. Además el % iba pegado
 * a la cifra: ahora con espacio duro (CLAUDE.md global §2).
 *
 * El contenido de la guía se monta siempre en el DOM (EducationalSection), así que se lee con
 * textContent sin desplegarla.
 */

const RUTA = '/estimador-coste-vivienda/';

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('C0717 · el 1 % de mantenimiento sale como pauta orientativa, no como regla, y con espacio duro', async ({
  page,
}) => {
  // El texto visible de la página, sin los <script> (el JSON-LD y el payload de Next).
  const texto = await page.evaluate(() => {
    const copia = document.body.cloneNode(true) as HTMLElement;
    copia.querySelectorAll('script, style').forEach((n) => n.remove());
    return copia.textContent ?? '';
  });
  expect(texto).not.toMatch(/regla (general|del 1)/i);
  expect(texto).not.toMatch(/Fondo de reserva del 1/);
  // Sin coger el «0,4%-1,1% del valor catastral» del IBI, que es otra cifra.
  expect(texto).not.toMatch(/(^|[^,\d])1% (del valor|anual)/);
  const pautas = texto.match(/pauta orientativa[^.]*1 %/g) ?? [];
  expect(pautas.length, 'los cuatro sitios dicen «pauta orientativa» con «1 %» y espacio duro').toBe(4);
});
