import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada, esperarValorEnReact } from './_hidratacion';

/**
 * numeros-en-ingles: el conversor y los ejercicios numerados.
 *
 * Lo que es correcto (cómo se escribe y se lee cada cifra, y la respuesta de cada ejercicio) lo
 * fija el CANON escrito a mano de tests/numeros-en-ingles-motor.spec.ts. Aquí se mide lo que el
 * motor no puede: que la vista convierta lo que se teclea, que pregunte justo los ejercicios
 * pedidos y en ese orden, que corrija y explique con la regla, y que el foco vaya donde debe.
 *
 * Ejercicios del banco que usa este fichero (su número es su posición, estable):
 *   1 → 13 en palabras (thirteen) · 3 → 15 en palabras (fifteen) · 6 → 40 en palabras (forty)
 *   7 → 21 en palabras (twenty-one)
 */

const CIFRA = '#cifra';
const NUMEROS = '#numeros-ejercicios';

async function abrir(page: Page) {
  await page.goto('/numeros-en-ingles/');
  await esperarPaginaAsentada(page);
}

async function teclearCifra(page: Page, valor: string) {
  await page.locator(CIFRA).fill(valor);
  await esperarValorEnReact(page, CIFRA, valor);
}

async function jugarNumeros(page: Page, texto: string) {
  await page.locator(NUMEROS).fill(texto);
  await esperarValorEnReact(page, NUMEROS, texto);
  await page.getByRole('button', { name: 'Jugar estos ejercicios' }).click();
}

const conversor = (page: Page) => page.locator('section[aria-labelledby="titulo-conversor"]');
const enunciado = (page: Page) => page.locator('#enunciado-ejercicio');

test.describe('numeros-en-ingles', () => {
  test('carga con su título, el conversor y la configuración', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Números en inglés');
    await expect(page.getByLabel('Escribe una cifra (en formato español)')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Practica con ejercicios' })).toBeVisible();
  });

  test('conversor: centenas, decimales, año y escala corta', async ({ page }) => {
    await abrir(page);
    const c = conversor(page);

    await teclearCifra(page, '105');
    await expect(c).toContainText('one hundred five');
    await expect(c).toContainText('one hundred and five');
    await expect(c).toContainText('105th');
    await expect(c).toContainText('one hundred fifth');

    await teclearCifra(page, '1.234,5');
    await expect(c).toContainText('one thousand two hundred thirty-four point five');
    await expect(c).toContainText('1,234.5');
    await expect(c.getByText('Ordinal', { exact: true })).toHaveCount(0);

    await teclearCifra(page, '1999');
    await expect(c).toContainText('nineteen ninety-nine');

    await teclearCifra(page, '1.000.000.000');
    await expect(c).toContainText('one billion');
    await expect(c).toContainText('Billion no es un billón');

    await teclearCifra(page, '12abc');
    await expect(page.locator('#cifra-error')).toContainText('No se reconoce esa cifra');
    await expect(page.locator(CIFRA)).toHaveAttribute('aria-invalid', 'true');
  });

  test('escribir: un acierto, un fallo con su regla, y el resultado por número', async ({ page }) => {
    await abrir(page);
    await jugarNumeros(page, '1, 6');

    await expect(page.getByText('Pregunta 1 de 2', { exact: true })).toBeVisible();
    await expect(enunciado(page)).toContainText('Ejercicio 1');
    const input = page.getByLabel('Tu respuesta');
    await expect(input).toBeFocused();

    // Acierto, con mayúscula y punto final, que el corrector admite
    await input.fill('Thirteen.');
    await esperarValorEnReact(page, '#respuesta', 'Thirteen.');
    await input.press('Enter');
    const alerta = page.getByRole('alert').filter({ hasText: /Correcto|Incorrecto/ });
    await expect(alerta).toContainText('¡Correcto!');
    await expect(alerta).toContainText('thir-');
    await expect(page.getByRole('button', { name: 'Siguiente ejercicio →' })).toBeFocused();
    await page.getByRole('button', { name: 'Siguiente ejercicio →' }).click();

    // Fallo: «fourty»
    await expect(enunciado(page)).toContainText('Ejercicio 6');
    await expect(input).toBeFocused();
    await input.fill('fourty');
    await esperarValorEnReact(page, '#respuesta', 'fourty');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(alerta).toContainText('Incorrecto');
    await expect(alerta).toContainText('Has escrito «fourty».');
    await expect(alerta).toContainText('forty');
    await expect(alerta).toContainText('sin u');
    await expect(input).toHaveAttribute('aria-invalid', 'true');

    await page.getByRole('button', { name: 'Ver resultados' }).click();
    await expect(page.getByText('1 de 2', { exact: true })).toBeVisible();
    await expect(page.getByText(/50\s%\sde aciertos/)).toBeVisible();
    await expect(page.getByText('Ejercicio fallado: 6.')).toBeVisible();
  });

  test('elegir: «3, 7» juega exactamente esos, el foco vuelve al enunciado, y jugar de nuevo repite', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /^Elegir entre 4 opciones/ }).click();
    await expect(page.getByRole('button', { name: /^Elegir entre 4 opciones/ })).toHaveAttribute('aria-pressed', 'true');
    await jugarNumeros(page, '3, 7');

    await expect(page.getByText('Pregunta 1 de 2', { exact: true })).toBeVisible();
    await expect(enunciado(page)).toContainText('Ejercicio 3');
    await expect(enunciado(page)).toBeFocused();
    // Las opciones de respuesta no son conmutadores: sin aria-pressed
    await expect(page.locator('[class*="opcionesGrid"] button[aria-pressed]')).toHaveCount(0);

    await page.getByRole('button', { name: /^Opción [A-D]: fifteen$/ }).click();
    await expect(page.getByRole('alert').filter({ hasText: /Correcto|Incorrecto/ })).toContainText('¡Correcto!');
    await expect(page.getByRole('button', { name: /respuesta correcta/ })).toBeDisabled();
    await page.getByRole('button', { name: 'Siguiente ejercicio →' }).click();

    await expect(enunciado(page)).toContainText('Ejercicio 7');
    await expect(enunciado(page)).toBeFocused();
    await page.getByRole('button', { name: /^Opción [A-D]: one-twenty$/ }).click();
    const alerta = page.getByRole('alert').filter({ hasText: /Correcto|Incorrecto/ });
    await expect(alerta).toContainText('Incorrecto');
    await expect(alerta).toContainText('twenty-one');
    await expect(alerta).toContainText('guion');
    await expect(page.getByRole('button', { name: /tu respuesta, incorrecta/ })).toHaveCount(1);

    await page.getByRole('button', { name: 'Ver resultados' }).click();
    await expect(page.getByText('1 de 2', { exact: true })).toBeVisible();
    await expect(page.getByText('Ejercicio fallado: 7.')).toBeVisible();

    await page.getByRole('button', { name: 'Jugar de nuevo' }).click();
    await expect(enunciado(page)).toContainText('Ejercicio 3');
    await expect(page.getByText('Pregunta 1 de 2', { exact: true })).toBeVisible();
  });

  test('un número que no existe da un error accesible y no empieza', async ({ page }) => {
    await abrir(page);
    await jugarNumeros(page, '3, 99');
    await expect(page.locator('#numeros-error')).toContainText('No existe el ejercicio 99');
    await expect(page.locator(NUMEROS)).toHaveAttribute('aria-invalid', 'true');
    await expect(enunciado(page)).toHaveCount(0);
  });
});
