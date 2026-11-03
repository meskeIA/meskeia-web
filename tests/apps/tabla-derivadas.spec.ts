/**
 * Tabla de derivadas — buscador y fracciones (cabo C0591)
 *
 * Hermana de tabla-integrales, con el mismo buscador y el mismo componente Frac. Medido el
 * 03/11/2026 sobre el código: la consulta entera se buscaba como UNA subcadena seguida, así que
 *   · «sen x», «e^x», «x²» o «x sen» daban 0 fórmulas y el aviso de que no existe (forma 3937);
 *   · «tan» traía Constante (cons-TAN-te) y «sin» traía el coseno hiperbólico por la
 *     preposición de «derivada sin signo negativo» (forma 3938);
 *   · Frac apilaba numerador y denominador sin nada en medio: el lector leía «1 x²» (forma 3939).
 */

import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

const RUTA = '/tabla-derivadas/';
const BUSCADOR = '#buscador-derivadas';

async function buscar(page: Page, texto: string): Promise<string[]> {
  await page.locator(BUSCADOR).fill(texto);
  // El contador es la señal de que el filtro ya corrió.
  await expect(page.locator('[role="status"]').filter({ hasText: 'fórmulas' })).toBeVisible();
  return page.locator('li button[aria-expanded]').evaluateAll((botones) =>
    botones.map((b) => (b.querySelector('[class*="filaNombre"]')?.firstChild?.textContent ?? '').trim()),
  );
}

test.describe('tabla-derivadas — C0591', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [BUSCADOR]);
  });

  test('una fórmula escrita como en la tabla encuentra su fila, y la primera es la suya', async ({ page }) => {
    expect((await buscar(page, 'sen x'))[0]).toBe('Seno');
    expect(await buscar(page, 'x sen')).toContain('Seno');
    expect((await buscar(page, 'e^x'))[0]).toBe('Exponencial de base e');
    expect((await buscar(page, 'x^n'))[0]).toBe('Potencia');
    expect((await buscar(page, 'xⁿ'))[0]).toBe('Potencia');
    expect((await buscar(page, '1/x'))[0]).toBe('Inverso de x');
    expect((await buscar(page, '√x'))[0]).toBe('Raíz cuadrada');
    expect((await buscar(page, 'ln x'))[0]).toBe('Logaritmo neperiano');
    expect((await buscar(page, 'tan x'))[0]).toBe('Tangente');
    expect(await buscar(page, 'hiperbolico coseno')).toContain('Coseno hiperbólico');
  });

  test('«tan» y «sin» no casan dentro de otras palabras', async ({ page }) => {
    const tan = await buscar(page, 'tan');
    expect(tan).toContain('Tangente');
    expect(tan).not.toContain('Constante');
    expect(tan).not.toContain('Constante por función');
    const sin = await buscar(page, 'sin');
    expect(sin).toContain('Seno');
    expect(sin).not.toContain('Coseno hiperbólico');
  });

  test('lo que antes se encontraba se sigue encontrando', async ({ page }) => {
    expect(await buscar(page, 'raíz')).toContain('Raíz cuadrada');
    expect(await buscar(page, 'logaritmo')).toContain('Logaritmo neperiano');
    expect(await buscar(page, 'cociente')).toContain('Regla del cociente');
    expect(await buscar(page, 'arctan')).toContain('Arcotangente');
    expect(await buscar(page, 'zzz')).toEqual([]);
    await expect(page.getByText('No hay ninguna fórmula que coincida')).toBeVisible();
  });

  test('una fracción se anuncia con «entre» entre numerador y denominador', async ({ page }) => {
    await buscar(page, 'inverso de x');
    const fila = page.locator('li button[aria-expanded]').first();
    // La derivada de 1/x es −1/x²: el nombre accesible lleva «1 entre x²».
    const texto = (await fila.textContent())?.replace(/\s+/g, ' ') ?? '';
    expect(texto).toMatch(/1 entre x/);
    expect(texto).toMatch(/1 entre x²/);
  });
});
