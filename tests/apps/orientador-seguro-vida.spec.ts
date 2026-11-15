import { test, expect } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * orientador-seguro-vida — spec nacido en /reparar el 15/11/2026 (cabo C0570).
 *
 * «¿Cuánto cuesta un seguro de vida?» tenía dos respuestas con precios distintos y sin fuente:
 * 150.000 € por 15-35 € al mes a los 35 años en el FAQPage, 200.000 € por 15-25 € en la FAQ
 * visible. No hay precios públicos por perfil (UNESPA e ICEA publican volúmenes del sector) y la
 * app no calcula primas, así que la respuesta, ahora una sola constante (RESPUESTA_FAQ_COSTE),
 * explica de qué depende la prima sin dar una cifra.
 */

const RUTA = '/orientador-seguro-vida/';

test('C0570 · la FAQ del coste dice lo mismo en la página y en el FAQPage, y no da precios sin fuente', async ({ page }) => {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
    (t) => JSON.parse(t) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] },
  );
  const faq = ld.find((x) => x['@type'] === 'FAQPage');
  const enLd = faq?.mainEntity?.find((q) => q.name === '¿Cuánto cuesta un seguro de vida al mes?')?.acceptedAnswer.text;
  const visible = await page
    .locator('h4', { hasText: '¿Cuánto cuesta un seguro de vida?' })
    .locator('xpath=following-sibling::p[1]')
    .textContent();
  expect(enLd).toBeTruthy();
  expect(visible?.trim()).toBe(enLd);
  expect(enLd).not.toMatch(/€/);
  expect(enLd).toContain('pedir presupuesto a varias aseguradoras');
});
