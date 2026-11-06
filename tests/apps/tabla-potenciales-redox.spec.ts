import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * tabla-potenciales-redox — buscador (/reparar del 06/11/2026, cabo C0607)
 *
 * El buscador comparaba la consulta ENTERA como una subcadena seguida. Medido el 06/11/2026
 * contra next dev, antes de reparar: «Cu2+» → 0 filas y «Cu²⁺» → 3; «permanganato acido» → 0.
 * Ahora usa el modo fórmulas de lib/buscadorTablas.ts: cada palabra por separado, índices y
 * cargas como caracteres planos, y el resultado conserva el orden de la tabla (de mayor a
 * menor E°), que es su contenido.
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

const RUTA = '/tabla-potenciales-redox/';
const BUSCADOR = '#buscador-redox';

async function cargar(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [BUSCADOR]);
}

async function buscar(page: Page, termino: string): Promise<void> {
  await page.locator(BUSCADOR).fill(termino);
  await esperarValorEnReact(page, BUSCADOR, termino);
}

/** El id de cada fila visible de la tabla, en su orden. */
async function idsDeFilas(page: Page): Promise<string[]> {
  return page
    .locator('button[aria-controls^="detalle-"][aria-expanded]')
    .evaluateAll((els) => els.map((b) => (b.getAttribute('aria-controls') ?? '').replace(/^detalle-/, '')));
}

test.describe('Buscador (cabo C0607)', () => {
  test('una carga escrita con teclado es la misma que con superíndices', async ({ page }) => {
    await cargar(page);
    await buscar(page, 'Cu²⁺');
    const conSuperindice = await idsDeFilas(page);
    expect(conSuperindice).toEqual(expect.arrayContaining(['cobre', 'cobre-ii-i']));
    for (const termino of ['Cu2+', 'cu2+']) {
      await buscar(page, termino);
      expect(await idsDeFilas(page), termino).toEqual(conSuperindice);
    }
  });

  test('dos palabras en cualquier orden, y el resultado sigue ordenado por E°', async ({ page }) => {
    await cargar(page);
    for (const termino of ['permanganato manganeso', 'manganeso permanganato']) {
      await buscar(page, termino);
      expect.soft(await idsDeFilas(page), termino).toContain('permanganato');
    }
    // Cu⁺/Cu (+0,52 V), Cu²⁺/Cu (+0,34 V) y Cu²⁺/Cu⁺ (+0,15 V): de mayor a menor, como la tabla.
    await buscar(page, 'cobre');
    const ids = await idsDeFilas(page);
    const posiciones = ['cobre-i', 'cobre', 'cobre-ii-i'].map((id) => ids.indexOf(id));
    expect(posiciones.every((p) => p >= 0)).toBe(true);
    expect([...posiciones].sort((a, b) => a - b)).toEqual(posiciones);
  });

  test('sigue casando dentro de una fórmula: «Cl» encuentra el clorato y el cloro', async ({ page }) => {
    await cargar(page);
    await buscar(page, 'Cl');
    expect(await idsDeFilas(page)).toEqual(expect.arrayContaining(['clorato', 'cloro', 'hipoclorito']));
  });
});
