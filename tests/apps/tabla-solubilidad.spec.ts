import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * tabla-solubilidad — buscador (/reparar del 06/11/2026, cabo C0607)
 *
 * El buscador comparaba la consulta ENTERA como una subcadena seguida en las tres secciones
 * (reglas, iones y Kps). Medido el 06/11/2026 contra next dev, antes de reparar: «carbonato
 * calcio» → 0 fichas, aunque la ficha del CaCO₃ se llama «Carbonato de calcio». Ahora usa el
 * modo fórmulas de lib/buscadorTablas.ts: cada palabra por separado y los subíndices como
 * cifras (CaCO3 = CaCO₃), casando todavía dentro de una fórmula («Cl» encuentra AgCl).
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

const RUTA = '/tabla-solubilidad/';
const BUSCADOR = '#buscador-solubilidad';

async function cargar(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [BUSCADOR]);
}

async function buscar(page: Page, termino: string): Promise<void> {
  await page.locator(BUSCADOR).fill(termino);
  await esperarValorEnReact(page, BUSCADOR, termino);
}

/** El destino de cada ficha visible (regla, ion o Kps), en su orden. */
async function fichas(page: Page): Promise<string[]> {
  return page
    .locator('button[aria-controls^="detalle-"][aria-expanded]')
    .evaluateAll((els) => els.map((b) => (b.getAttribute('aria-controls') ?? '').replace(/^detalle-/, '')));
}

test.describe('Buscador (cabo C0607)', () => {
  test('dos palabras sin el «de» y en cualquier orden encuentran la ficha', async ({ page }) => {
    await cargar(page);
    for (const termino of ['carbonato de calcio', 'carbonato calcio', 'calcio carbonato']) {
      await buscar(page, termino);
      expect.soft(await fichas(page), termino).toContain('kps-caco3');
    }
    for (const termino of ['cloruro plata', 'plata cloruro']) {
      await buscar(page, termino);
      expect.soft(await fichas(page), termino).toContain('kps-agcl');
    }
  });

  test('una fórmula sin subíndices es la misma que con ellos', async ({ page }) => {
    await cargar(page);
    await buscar(page, 'CaCO₃');
    const conSubindice = await fichas(page);
    expect(conSubindice).toEqual(expect.arrayContaining(['carbonatos', 'kps-caco3']));
    await buscar(page, 'CaCO3');
    expect(await fichas(page)).toEqual(conSubindice);
  });

  test('sigue casando dentro de una fórmula: «AgCl» y «Cl» encuentran el cloruro de plata', async ({ page }) => {
    await cargar(page);
    for (const termino of ['AgCl', 'Cl']) {
      await buscar(page, termino);
      expect.soft(await fichas(page), termino).toContain('kps-agcl');
    }
  });
});
