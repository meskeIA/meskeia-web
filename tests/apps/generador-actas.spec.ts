/**
 * generador-actas — el acta impresa desde el tema OSCURO (cabo C0483, 27/10/2026)
 *
 * 4488bd1d (campaña C0070, 18/10/2026) cambió el color de los títulos del acta en `@media print`
 * de #2E86AB fijo a var(--primary-texto). En claro sube a #26718F (5,47:1), pero en oscuro el
 * token vale #3FA5D1 y el papel sigue blanco (la regla de impresión pone el documento en white):
 * 2,79:1. Es la forma del hallazgo 3546 del sonómetro; el censo de las reglas `@media print` del
 * catálogo que usan un token de texto que cambia con el tema solo dio estas tres:
 * .actaTitle, .actaSectionTitle y .actaPuntoContent strong. Receta: --primary-boton, igual en
 * los dos temas.
 */
import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';
import { activarTemaOscuro, prepararParaMedir } from '../_contraste';

const RUTA = '/generador-actas/';

/** Contraste del texto de `selector` contra el papel (el fondo opaco más cercano). */
async function contraste(page: Page, selector: string): Promise<{ ratio: number; color: string; fondo: string }> {
  return page.locator(selector).first().evaluate((el) => {
    const nums = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number);
    let fondo = [255, 255, 255];
    for (let m: Element | null = el; m; m = m.parentElement) {
      const c = nums(getComputedStyle(m).backgroundColor);
      if (c.length >= 3 && (c[3] ?? 1) >= 1) { fondo = c.slice(0, 3); break; }
    }
    const fg = nums(getComputedStyle(el).color).slice(0, 3);
    const canal = (v: number) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
    const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
    const [a, b] = [lum(fg), lum(fondo)].sort((x, y) => y - x);
    return { ratio: +((a + 0.05) / (b + 0.05)).toFixed(2), color: `rgb(${fg.join(', ')})`, fondo: `rgb(${fondo.join(', ')})` };
  });
}

test('C0483 — los títulos del acta impresa desde el tema oscuro se leen sobre el papel', async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[type="date"]']);
  await prepararParaMedir(page);
  await activarTemaOscuro(page);
  await page.getByRole('button', { name: 'Vista Previa' }).click();
  await page.emulateMedia({ media: 'print' });
  for (const selector of ['[class*="actaTitle"]', '[class*="actaSectionTitle"]']) {
    const m = await contraste(page, selector);
    expect(m.fondo, `${selector}: el papel`).toBe('rgb(255, 255, 255)');
    expect(m.ratio, `${selector}: ${m.color} sobre ${m.fondo}`).toBeGreaterThanOrEqual(4.5);
  }
});
