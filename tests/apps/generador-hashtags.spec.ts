import { test, expect, Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * generador-hashtags — spec nacido en /reparar el 15/11/2026 (cabo C0570).
 *
 * Qué se comprueba
 * ────────────────
 *   1. Desde diciembre de 2025 Instagram no admite más de 5 hashtags por publicación o reel
 *      (anuncio de Adam Mosseri del 19/12/2025; Social Media Today,
 *      socialmediatoday.com/news/instagram-implements-new-limits-on-hashtag-use/808309/). La
 *      herramienta recomendaba 10-15 y solo avisaba a partir de 16: dejaba copiar 15 hashtags
 *      que Instagram ya no acepta. Ahora recomienda 3-5 y avisa a partir de 6.
 *   2. «¿Cuántos hashtags debo usar en Instagram?» daba tres respuestas: 3-5 en la FAQ visible,
 *      5-15 «sin pasar de 10» en el FAQPage y 10-15 en la propia herramienta. Ahora una sola
 *      constante (RESPUESTA_FAQ_HASHTAGS_INSTAGRAM) que leen las dos FAQ.
 *
 * CASOS, resueltos a mano:
 *   CASO 1 — Instagram, 5 hashtags elegidos: está en el tope, sin aviso.
 *   CASO 2 — Instagram, 6 hashtags: «Para Instagram se recomiendan 3-5 hashtags. Tienes 6.»
 *            Antes: sin aviso (el umbral era 15).
 *   CASO 3 — el botón de Instagram rotula «3-5 hashtags» (antes «10-15 hashtags»).
 */

const RUTA = '/generador-hashtags/';
const PREGUNTA = '¿Cuántos hashtags debo usar en Instagram?';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

/** Pulsa los `n` primeros hashtags de la lista (botones «#…» con aria-pressed). */
async function elegir(page: Page, n: number): Promise<void> {
  const botones = page.getByRole('button', { name: /^#/ });
  for (let i = 0; i < n; i++) {
    const b = botones.nth(i);
    await b.click();
    await expect(b).toHaveAttribute('aria-pressed', 'true');
  }
}

test.describe('C0570 · Instagram admite como mucho 5 hashtags', () => {
  test('CASO 3 · el botón de Instagram recomienda 3-5', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('button', { name: /Instagram/ })).toContainText('3-5 hashtags');
  });

  test('CASO 1 · con 5 hashtags no hay aviso', async ({ page }) => {
    await abrir(page);
    await elegir(page, 5);
    await expect(page.getByText('Para Instagram se recomiendan')).toHaveCount(0);
  });

  test('CASO 2 · con 6 hashtags avisa del tope', async ({ page }) => {
    await abrir(page);
    await elegir(page, 6);
    await expect(page.getByText('Para Instagram se recomiendan 3-5 hashtags.')).toBeVisible();
    await expect(page.getByText('Tienes 6.')).toBeVisible();
  });

  test('la FAQ visible y el FAQPage dan la misma respuesta, con el tope de 5', async ({ page }) => {
    await abrir(page);
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (t) => JSON.parse(t) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] },
    );
    const faq = ld.find((x) => x['@type'] === 'FAQPage');
    const enLd = faq?.mainEntity?.find((q) => q.name === PREGUNTA)?.acceptedAnswer.text;
    const visible = await page.locator('h4', { hasText: PREGUNTA }).locator('xpath=following-sibling::p[1]').textContent();
    expect(enLd).toBeTruthy();
    expect(visible).toBe(enLd);
    expect(enLd).toContain('no admite más de 5 hashtags');
  });
});
