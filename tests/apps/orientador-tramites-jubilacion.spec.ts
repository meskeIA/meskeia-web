/**
 * orientador-tramites-jubilacion — la FAQ (reparar 03/11/2026, cabo C0570).
 *
 * Hasta este día la FAQ estaba escrita dos veces, en el FAQPage de metadata.ts y en page.tsx, y
 * las copias divergían. La visible decía que el mínimo personal y la reducción por rendimientos
 * del trabajo «reducen la base imponible»: el mínimo NO la reduce, se grava a tipo cero
 * (art. 63.1.2.º LIRPF; es lo que vigila check:minimo-irpf en el código). Ahora las dos salen de
 * PREGUNTAS_FRECUENTES. Lo que se mide aquí: que cada respuesta visible es la del FAQPage, y que
 * la del IRPF no presenta el mínimo como una reducción de la base.
 */
import { test, expect } from '@playwright/test';

const norm = (t: string) => t.replace(/\s+/g, ' ').trim();

/** La FAQ vive dentro de la guía educativa, que nace plegada. */
async function abrirGuia(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/orientador-tramites-jubilacion/');
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.locator('[class*="faqItem"]').first()).toBeVisible();
}

test('la FAQ visible dice lo mismo que el FAQPage, pregunta a pregunta', async ({ page }) => {
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await abrirGuia(page);
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
  const preguntas: { name: string; acceptedAnswer: { text: string } }[] = faq.mainEntity;
  expect(preguntas).toHaveLength(5);
  for (const q of preguntas) {
    const item = page.locator('[class*="faqItem"]').filter({ has: page.getByRole('heading', { name: q.name, exact: true }) });
    await expect(item, q.name).toHaveCount(1);
    expect(norm((await item.locator('p').textContent()) ?? ''), q.name).toBe(norm(q.acceptedAnswer.text));
  }
  expect(errores).toEqual([]);
});

test('la respuesta del IRPF no dice que el mínimo personal reduzca la base imponible', async ({ page }) => {
  await abrirGuia(page);
  const item = page.locator('[class*="faqItem"]').filter({ has: page.getByRole('heading', { name: '¿Cómo tributa la pensión en el IRPF?' }) });
  const texto = norm((await item.locator('p').textContent()) ?? '');
  expect(texto).not.toMatch(/que reducen la base imponible/);
  expect(texto).toContain('el mínimo no, se grava a tipo cero');
});
