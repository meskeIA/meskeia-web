import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * tabla-constantes-fisicas — buscador (/reparar del 06/11/2026, cabo C0607)
 *
 * El buscador comparaba la consulta ENTERA como una subcadena seguida de nombre + símbolo +
 * valor + sinónimos. Medido el 06/11/2026 contra next dev, antes de reparar:
 *   · «c» → 52 de 52 (la letra está en «constante»), «h» → 23, «tan» → 21;
 *   · «masa protón», «carga electron» y «planck constante» → 0 de 52.
 * Ahora usa lib/buscadorTablas.ts (la receta de tabla-derivadas): cada palabra de la consulta
 * tiene que EMPEZAR una palabra de la entrada, y una letra sola tiene que SER ese símbolo.
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

const RUTA = '/tabla-constantes-fisicas/';
const BUSCADOR = '#buscador-constantes';
const TOTAL = 52;

async function cargar(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [BUSCADOR]);
}

async function buscar(page: Page, termino: string): Promise<void> {
  await page.locator(BUSCADOR).fill(termino);
  await esperarValorEnReact(page, BUSCADOR, termino);
}

const contador = (page: Page) => page.locator('p[role="status"]');

/** El id de cada fila visible, en su orden (sale de aria-controls="detalle-<id>"). */
async function idsDeFilas(page: Page): Promise<string[]> {
  return page
    .locator('ul li button[aria-expanded]')
    .evaluateAll((els) => els.map((b) => (b.getAttribute('aria-controls') ?? '').replace(/^detalle-/, '')));
}

test.describe('Buscador (cabo C0607)', () => {
  test('un símbolo de una letra da SU constante primero, no todas las que llevan esa letra', async ({ page }) => {
    await cargar(page);
    await buscar(page, 'c');
    const conC = await idsDeFilas(page);
    expect(conC[0]).toBe('c');
    // Antes 52 de 52. Ahora las que llevan c como símbolo o factor (c, h·c·R∞, mₑ·c²…).
    expect(conC.length).toBeLessThan(10);
    await buscar(page, 'h');
    const conH = await idsDeFilas(page);
    expect(conH[0]).toBe('h');
    expect(conH).toContain('h-barra');
    expect(conH.length).toBeLessThan(10);
  });

  test('dos palabras en cualquier orden y sin tildes encuentran la constante', async ({ page }) => {
    await cargar(page);
    const casos: [string, string][] = [
      ['masa protón', 'masa-proton'],
      ['masa proton', 'masa-proton'],
      ['proton masa', 'masa-proton'],
      ['planck constante', 'h'],
      ['carga electron', 'e'],
      ['fina estructura', 'estructura-fina'],
    ];
    for (const [termino, id] of casos) {
      await buscar(page, termino);
      expect.soft(await idsDeFilas(page), termino).toContain(id);
    }
  });

  test('«tan» ya no casa dentro de «constante», y el símbolo se encuentra con y sin guion bajo y en griego', async ({ page }) => {
    await cargar(page);
    await buscar(page, 'tan');
    await expect(contador(page)).toHaveText(`0 de ${TOTAL} constantes`);
    for (const termino of ['k_B', 'kB']) {
      await buscar(page, termino);
      expect.soft(await idsDeFilas(page), termino).toContain('k-boltzmann');
    }
    await buscar(page, 'α');
    expect(await idsDeFilas(page)).toEqual(['estructura-fina']);
  });

  test('el valor se encuentra como lo pinta la tabla', async ({ page }) => {
    await cargar(page);
    await buscar(page, '299.792.458');
    expect(await idsDeFilas(page)).toEqual(['c']);
    await buscar(page, '6,626');
    expect(await idsDeFilas(page)).toEqual(['h']);
  });
});
