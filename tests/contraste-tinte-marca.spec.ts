import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, desplegarTodo, MARCA, medirContraste, prepararParaMedir, type Medida } from './_contraste';

/**
 * Texto de marca sobre un TINTE de marca, en los dos temas — cabo C0278 (19/10/2026).
 *
 * tests/contraste-marca-botones.spec.ts mide el texto de marca y aparta en `tinte` el que va sobre
 * un tinte translúcido de marca, solo para ANOTARLO («C0278 · texto de marca sobre tinte»). Aquí
 * se EXIGE en las apps donde se midió y se reparó: con la marca de texto ya en --primary-texto,
 * un tinte del 10-15 % la dejaba en 4,36-4,48:1 en claro y 3,73-4,06:1 en oscuro.
 * Fuera, a propósito: curso-negociacion (los cursos están congelados desde el 16/10/2026).
 */

const APPS = ['visualizador-adaptaciones-plantas', 'estimador-hipoteca'] as const;

async function peorSobreTinte(page: Page): Promise<Medida['tinte']> {
  const sinAcento = MARCA.slice(0, 6);
  const m = await medirContraste(page, { texto: sinAcento, separarTinteDe: sinAcento });
  return m.tinte;
}

for (const slug of APPS) {
  test(`${slug}: el texto de marca sobre su tinte cumple en claro y en oscuro (C0278)`, async ({ page }) => {
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    await desplegarTodo(page);
    const claro = await peorSobreTinte(page);
    if (claro) expect(claro.ratio, `claro: «${claro.texto}» sobre ${claro.fondo}`).toBeGreaterThanOrEqual(claro.umbral);

    await activarTemaOscuro(page);
    await desplegarTodo(page);
    const oscuro = await peorSobreTinte(page);
    if (oscuro) expect(oscuro.ratio, `oscuro: «${oscuro.texto}» sobre ${oscuro.fondo}`).toBeGreaterThanOrEqual(oscuro.umbral);
  });
}
