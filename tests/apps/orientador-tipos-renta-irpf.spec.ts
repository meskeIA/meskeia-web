import { test, expect } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { TRAMOS_GANANCIAS_PATRIMONIALES_2025 } from '../../data/fiscal/inmuebles';

/**
 * orientador-tipos-renta-irpf — creado por /reparar el 13/11/2026 (cabo C0570).
 *
 * La pregunta de las criptomonedas estaba en la FAQ visible y en el FAQPage con otra redacción
 * («en el IRPF» de más en el JSON-LD) y dos respuestas, y la del FAQPage daba la base del ahorro
 * «19 % a 28 % en 2025». Desde el 01/01/2025 el tramo de más de 300.000 € es del 30 %: 15 estatal
 * (art. 66.1) + 15 autonómico (art. 76) de la Ley 35/2006, en la redacción de la disposición final
 * séptima de la Ley 7/2024, de 20 de diciembre (BOE-A-2024-26694, cotejado el 13/11/2026). Es lo
 * que ya decían la tabla y el resto de la app, y lo que da TRAMOS_GANANCIAS_PATRIMONIALES_2025.
 */

const RUTA = '/orientador-tipos-renta-irpf/';
const limpiar = (s: string) => s.replace(/\s+/g, ' ').trim();

interface BloqueFaq { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] }

test('C0570 · las criptomonedas se contestan igual en la FAQ visible y en el FAQPage, con la escala del ahorro de 2025 (19 a 30 %)', async ({ page }) => {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = bloques.map((t) => JSON.parse(t) as BloqueFaq).find((b) => b['@type'] === 'FAQPage');
  const enLd = faq?.mainEntity?.find((q) => /criptomonedas/.test(q.name))?.acceptedAnswer.text ?? '';
  const visible = (await page.locator('dt', { hasText: '¿Cómo tributan las criptomonedas?' }).locator('xpath=following-sibling::dd[1]').textContent()) ?? '';
  expect(enLd).not.toBe('');
  expect(limpiar(visible)).toBe(limpiar(enLd));

  const minimo = TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo;
  const maximo = TRAMOS_GANANCIAS_PATRIMONIALES_2025[TRAMOS_GANANCIAS_PATRIMONIALES_2025.length - 1].tipo;
  expect([minimo, maximo]).toEqual([19, 30]);
  expect(limpiar(enLd)).toContain(`del ${minimo} % al ${maximo} % en 2025`);
  expect(enLd).not.toContain('28');
  // Lo que solo decía la visible: minar de forma habitual va a la base general
  expect(enLd).toContain('actividad económica, que tributa en la base general');
});
