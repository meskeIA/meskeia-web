/**
 * Un solo FAQPage por página, y que pregunte lo que pregunta la FAQ visible (cabo C0593).
 *
 * La forma salió del hallazgo 3948 de calculadora-movimiento: un FAQPage dentro del @graph de
 * jsonLd, copia a mano de la FAQ visible, y otro, el faqJsonLd, con preguntas redactadas otra
 * vez o que la página no muestra. El censo del 02/11/2026 la dio en calculadora-cocina,
 * calculadora-notas y simulador-titulacion.
 */

import { expect, type Page } from '@playwright/test';

export async function comprobarFaqPageUnico(page: Page): Promise<void> {
  const { bloques, preguntas } = await page.evaluate(() => {
    let bloques = 0;
    const preguntas: string[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      const nodos = (j['@graph'] as Record<string, unknown>[] | undefined) ?? [j];
      for (const n of nodos) {
        if (n['@type'] !== 'FAQPage') continue;
        bloques++;
        for (const q of n.mainEntity as { name: string }[]) preguntas.push(q.name);
      }
    }
    return { bloques, preguntas };
  });
  expect(bloques, 'un solo FAQPage').toBe(1);
  expect(preguntas.length, 'al menos cinco preguntas (CLAUDE.md §1.ter)').toBeGreaterThanOrEqual(5);
  // Cada pregunta del FAQPage está en la página (aunque la guía esté plegada, su texto está).
  const texto = await page.evaluate(() => {
    const clon = document.body.cloneNode(true) as HTMLElement;
    clon.querySelectorAll('script, style').forEach((n) => n.remove());
    return (clon.textContent ?? '').replace(/\s+/g, ' ');
  });
  for (const p of preguntas) expect(texto, `«${p}» está en la FAQ visible`).toContain(p);
}
