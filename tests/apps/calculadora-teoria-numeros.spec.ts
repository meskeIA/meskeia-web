import { test, expect, Page } from '@playwright/test';

/**
 * calculadora-teoria-numeros — el modo Divisores ya dice si el número es un antiprimo
 *
 * Absorción del 04/09/2026, en vez de abrir una app propia: la sonda de Bing dio 0
 * impresiones para «antiprimo», «antiprimos» y «número altamente compuesto», mientras que
 * «divisores» sí tiene demanda real (23 keywords, 1.399 impresiones) y en forma de consulta
 * concreta — divisores de 36, de 24, de 18, de 12…, que casualmente son antiprimos. La
 * capacidad va donde ya está la puerta.
 *
 * La matemática vive en `motor-antiprimos.ts` y se prueba aparte, con casos a mano, en
 * `tests/antiprimos-motor.spec.ts`. Aquí solo se comprueba que la vista dice lo que el motor
 * calcula, que los ejemplos rellenan el campo y que el veredicto se recalcula al cambiarlo.
 */

const RUTA = '/calculadora-teoria-numeros/';

async function irADivisores(page: Page) {
  await page.getByRole('button', { name: /Divisores/ }).first().click();
}

async function escribirNumero(page: Page, n: string) {
  // NumberInput es type="text" con inputMode="decimal", no un input numérico del navegador
  await page.getByLabel('Número', { exact: true }).fill(n);
}

const veredicto = (page: Page) => page.locator('[class*="antiprimoPanel"]');

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Teoría de Números');
  await irADivisores(page);
});

test('60 sale como antiprimo, con sus 12 divisores y sus vecinos 48 y 120', async ({ page }) => {
  await escribirNumero(page, '60');
  await expect(veredicto(page)).toContainText('60 es un antiprimo');
  await expect(veredicto(page)).toContainText('12 divisores');
  await expect(veredicto(page)).toContainText('48');
  await expect(veredicto(page)).toContainText('120');
});

test('40 sale como NO antiprimo, y la explicación nombra al 24 que ya llegaba a 8', async ({ page }) => {
  await escribirNumero(page, '40');
  await expect(veredicto(page)).toContainText('40 no es un antiprimo');
  await expect(veredicto(page)).toContainText('24');
  await expect(veredicto(page)).toContainText('8');
});

test('100 tampoco lo es: empatar con el 36 en 9 divisores no basta', async ({ page }) => {
  await escribirNumero(page, '100');
  await expect(veredicto(page)).toContainText('100 no es un antiprimo');
  await expect(veredicto(page)).toContainText('36');
});

test('5040 es antiprimo, y los números de cuatro cifras van sin punto', async ({ page }) => {
  await escribirNumero(page, '5040');
  // En español los números de cuatro dígitos se escriben sin separador de millar, que es
  // lo que hace formatNumber en es-ES. El bloque educativo debe decirlo igual que la app.
  await expect(veredicto(page)).toContainText('5040 es un antiprimo');
  await expect(veredicto(page)).toContainText('60 divisores');
  await expect(veredicto(page)).toContainText('2520'); // el anterior
});

test('los ejemplos rellenan el campo y el veredicto cambia con ellos', async ({ page }) => {
  await page.getByRole('button', { name: '360', exact: true }).click();
  await expect(veredicto(page)).toContainText('360 es un antiprimo');
  await expect(veredicto(page)).toContainText('24 divisores');

  // Y el ejemplo pulsado queda marcado como el activo
  const ejemplo = (n: string) => page.locator('[class*="antiprimoBtn"]', { hasText: new RegExp(`^${n}$`) });
  await expect(ejemplo('360')).toHaveAttribute('aria-pressed', 'true');
  await expect(ejemplo('720')).toHaveAttribute('aria-pressed', 'false');
});

test('desde el veredicto se salta al antiprimo anterior y al siguiente', async ({ page }) => {
  await escribirNumero(page, '60');
  // Los saltos del veredicto se nombran por su destino, para no confundirse con los ejemplos
  await veredicto(page).getByRole('button', { name: /antiprimo siguiente, 120/ }).click();
  await expect(veredicto(page)).toContainText('120 es un antiprimo');
  await expect(veredicto(page)).toContainText('16 divisores');
});

test('un número enorme calcula divisores pero NO afirma nada sobre el récord', async ({ page }) => {
  await escribirNumero(page, '9999999'); // por encima del millón que se criba
  await expect(page.getByText('Divisores de 9999999')).toBeVisible();
  await expect(veredicto(page)).toContainText('no si es un antiprimo');
  await expect(veredicto(page)).not.toContainText('es un antiprimo,');
});

test('el bloque educativo explica el concepto y sus ejemplos cotidianos', async ({ page }) => {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();

  await expect(page.getByRole('heading', { name: /Antiprimos: los números con más divisores/ })).toBeVisible();
  await expect(page.getByText('60 minutos, 60 segundos')).toBeVisible();
  await expect(page.getByText('Los 5040 vecinos de Platón')).toBeVisible();
  await expect(page.getByText(/Tener muchos divisores no basta/)).toBeVisible();
});
