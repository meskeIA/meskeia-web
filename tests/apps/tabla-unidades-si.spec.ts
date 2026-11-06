import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * tabla-unidades-si — buscador (/reparar del 06/11/2026, cabo C0607)
 *
 * El buscador comparaba la consulta ENTERA como una subcadena seguida de nombre + magnitud +
 * sinónimos. Medido el 06/11/2026 contra next dev, antes de reparar: «m» → 62 de 65 entradas y
 * «s» → 56 (la letra dentro de cualquier palabra); «kg·m/s²», la expresión que pinta la fila
 * del newton, → 0. Ahora usa lib/buscadorTablas.ts (la receta de tabla-derivadas): cada palabra
 * de la consulta tiene que EMPEZAR una palabra de la entrada, una letra sola tiene que SER ese
 * símbolo, y la entrada incluye su símbolo y su expresión en SI.
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

const RUTA = '/tabla-unidades-si/';
const BUSCADOR = '#buscador-unidades';

async function cargar(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [BUSCADOR]);
}

async function buscar(page: Page, termino: string): Promise<void> {
  await page.locator(BUSCADOR).fill(termino);
  await esperarValorEnReact(page, BUSCADOR, termino);
}

async function idsDeFilas(page: Page): Promise<string[]> {
  return page
    .locator('button[aria-controls^="detalle-"][aria-expanded]')
    .evaluateAll((els) => els.map((b) => (b.getAttribute('aria-controls') ?? '').replace(/^detalle-/, '')));
}

test.describe('Buscador (cabo C0607)', () => {
  test('el símbolo de una letra da SU unidad primero, no todas las que llevan la letra', async ({ page }) => {
    await cargar(page);
    for (const [simbolo, id] of [['m', 'metro'], ['s', 'segundo']] as const) {
      await buscar(page, simbolo);
      const ids = await idsDeFilas(page);
      expect(ids[0], simbolo).toBe(id);
      // Antes 62 y 56 de 65. Ahora la unidad y las derivadas que la llevan en su expresión.
      expect(ids.length, simbolo).toBeLessThan(30);
      expect(ids, simbolo).not.toContain('kelvin');
    }
  });

  test('la expresión de la fila y dos palabras en otro orden encuentran la unidad', async ({ page }) => {
    await cargar(page);
    await buscar(page, 'kg·m/s²');
    expect(await idsDeFilas(page)).toContain('newton');
    for (const termino of ['fuerza newton', 'newton fuerza', 'presion pascal', 'pascal presión']) {
      await buscar(page, termino);
      expect.soft(await idsDeFilas(page), termino).toEqual([termino.includes('newton') ? 'newton' : 'pascal']);
    }
  });
});
