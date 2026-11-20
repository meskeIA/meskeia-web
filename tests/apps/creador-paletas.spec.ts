import { test, expect, Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * creador-paletas — las cifras y la normativa de la guía.
 *
 * De dónde sale (cabo C0820, de C0385, 20/11/2026): la FAQ del daltonismo daba «El 8% de los
 * hombres y el 0,5% de las mujeres» sin fuente, con el % pegado y con 0,5 donde Birch (2012)
 * da 0,4 % en ascendencia europea; y llamaba «más común» a la deuteranopía, cuando lo es la
 * deuteranomalía. Se escribe como simulador-daltonismo (de1a7007 y 99711f32), con espacio
 * duro antes del %.
 *
 * La FAQ del contraste metía la EAA (Acta Europea de Accesibilidad, Directiva UE 2019/882) y
 * la ADA Title III entre las normas del «sector público»: la EAA alcanza a productos y
 * servicios de empresas privadas, y el Título III de la ADA a los establecimientos abiertos al
 * público, no a la administración. Y escribía la ratio «4.5:1», con punto decimal.
 */

const NBSP = ' ';

async function abrirGuia(page: Page): Promise<void> {
  await expect(async () => {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click({ timeout: 1000 });
    await expect(page.getByRole('button', { name: 'Ocultar guía educativa' })).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 10000 });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/creador-paletas/');
  await esperarPaginaAsentada(page);
  await abrirGuia(page);
});

test('C0820 · la prevalencia del daltonismo lleva fuente, el 0,4 % de Birch y el % separado', async ({ page }) => {
  const faq = page.locator('h4', { hasText: '¿Cómo saber si una paleta es accesible para personas daltónicas?' }).locator('..');
  const texto = (await faq.textContent()) ?? '';
  expect(texto).toContain(`8${NBSP}% de los hombres y al 0,4${NBSP}% de las mujeres de ascendencia europea (Birch, 2012)`);
  expect(texto).not.toContain('0,5');
  expect(texto).not.toMatch(/\d%/);
  expect(texto).toContain('deuteranomalía');
});

test('C0820 · la EAA no está entre las normas del sector público y la ratio va con coma', async ({ page }) => {
  const faq = page.locator('h4', { hasText: '¿Qué es el contraste de accesibilidad y por qué importa?' }).locator('..');
  const texto = (await faq.textContent()) ?? '';
  expect(texto).not.toMatch(/sector público \([^)]*EAA/);
  expect(texto).toContain('empresas privadas (Acta Europea de Accesibilidad, EAA)');
  expect(texto).not.toContain('4.5:1');
  expect(texto).toContain('4,5:1');
});
