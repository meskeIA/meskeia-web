import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { ejercicioPorNumero, explicacion, formaCorrecta } from '../../app/preposiciones-ingles/motor';

/**
 * preposiciones-ingles (03/11/2026). Lo que es correcto —la respuesta de cada ejercicio— lo fija
 * el CANON escrito a mano de tests/preposiciones-ingles-motor.spec.ts. Aquí se mide lo que el
 * motor no puede: que la vista pregunte el ejercicio pedido, corrija y explique con el motor, que
 * el foco vaya donde debe y que la selección por números juegue exactamente esos.
 */

const tarjeta = (page: Page) => page.locator('[data-numero]');
const veredicto = (page: Page) => page.locator('[class*="feedbackBanner"]');
const siguiente = (page: Page) => page.getByRole('button', { name: /^(Siguiente pregunta|Ver resultados)/ });

async function abrir(page: Page) {
  await page.goto('/preposiciones-ingles/');
  await esperarPaginaAsentada(page);
}

/** Juega por números: escribe la lista en «Ejercicios por número» y pulsa el botón. */
async function jugarNumeros(page: Page, lista: string) {
  await page.getByLabel('Ejercicios por número').fill(lista);
  await page.getByRole('button', { name: 'Jugar estos ejercicios' }).click();
}

test.describe('preposiciones-ingles', () => {
  test('carga: título, tabla de reglas y configuración', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Preposiciones en inglés');
    await expect(page.getByRole('heading', { name: 'Las reglas de in, on y at' })).toBeVisible();
    for (const nombre of [/Tiempo/, /Lugar/, /Sin preposición/]) {
      await expect(page.getByRole('button', { name: nombre }).first()).toHaveAttribute('aria-pressed', 'true');
    }
    await expect(page.getByRole('button', { name: '10 preguntas' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /^Elegir/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('las categorías conmutan, y la última no se puede quitar', async ({ page }) => {
    await abrir(page);
    const tiempo = page.getByRole('button', { name: /^Tiempo/ });
    const lugar = page.getByRole('button', { name: /^Lugar/ });
    const sin = page.getByRole('button', { name: /^Sin preposición/ });
    await lugar.click();
    await sin.click();
    await expect(lugar).toHaveAttribute('aria-pressed', 'false');
    await expect(sin).toHaveAttribute('aria-pressed', 'false');
    await tiempo.click();
    await expect(tiempo).toHaveAttribute('aria-pressed', 'true');
  });

  test('un acierto, un fallo con su regla, el foco y el resultado', async ({ page }) => {
    await abrir(page);
    await jugarNumeros(page, '8, 4');

    // Ejercicio 8: The concert is ___ Friday. → on
    await expect(tarjeta(page)).toHaveAttribute('data-numero', '8');
    await expect(tarjeta(page)).toContainText('Ejercicio 8');
    await expect(tarjeta(page)).toBeFocused();
    await page.getByRole('button', { name: /^Opción B: on/ }).click();
    await expect(veredicto(page)).toContainText('¡Correcto!');
    await expect(veredicto(page)).toContainText('The concert is on Friday.');
    await expect(page.getByRole('button', { name: /^Opción B: on \(respuesta correcta\)/ })).toBeDisabled();
    await expect(siguiente(page)).toBeFocused();

    // Tras «Siguiente», el foco va al enunciado del ejercicio nuevo
    await siguiente(page).click();
    await expect(tarjeta(page)).toHaveAttribute('data-numero', '4');
    await expect(tarjeta(page)).toBeFocused();

    // Ejercicio 4: Owls hunt ___ night. → at; se elige «in» (el error de «in the night»)
    await page.getByRole('button', { name: /^Opción A: in/ }).click();
    const v = veredicto(page);
    await expect(v).toContainText('Incorrecto');
    await expect(v).toContainText('Has elegido «in».');
    const ej4 = ejercicioPorNumero(4)!;
    await expect(v).toContainText(formaCorrecta(ej4));
    await expect(v).toContainText(explicacion(ej4));
    await expect(page.getByRole('button', { name: /tu respuesta, incorrecta/ })).toHaveCount(1);
    await expect(page.getByRole('button', { name: /^Opción C: at \(respuesta correcta\)/ })).toHaveCount(1);

    await page.getByRole('button', { name: 'Ver resultados' }).click();
    const resultado = page.locator('[class*="resultadoPanel"]');
    await expect(resultado).toBeFocused();
    await expect(resultado).toContainText('1 de 2');
    await expect(resultado).toContainText(/50\s%\sde acierto/);
    await expect(resultado).toContainText('Ejercicios fallados: 4.');
    await expect(page.getByRole('button', { name: /Jugar de nuevo/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Cambiar ejercicios/ })).toBeVisible();
  });

  test('«3, 7» juega exactamente esos, en ese orden, y «Jugar de nuevo» los repite', async ({ page }) => {
    await abrir(page);
    await jugarNumeros(page, '3, 7');
    await expect(page.getByText('1/2', { exact: true })).toBeVisible();
    await expect(tarjeta(page)).toHaveAttribute('data-numero', '3');
    await page.getByRole('button', { name: /^Opción C: at/ }).click();
    await siguiente(page).click();
    await expect(tarjeta(page)).toHaveAttribute('data-numero', '7');
    // El 7 admite at y on (at the weekend británico, on the weekend americano)
    await page.getByRole('button', { name: /^Opción B: on/ }).click();
    await expect(veredicto(page)).toContainText('¡Correcto!');
    await expect(veredicto(page)).toContainText('What are you doing at / on the weekend?');
    await page.getByRole('button', { name: 'Ver resultados' }).click();
    await expect(page.locator('[class*="resultadoPanel"]')).toContainText('2 de 2');
    await expect(page.locator('[class*="resultadoPanel"]')).toContainText('No has fallado ningún ejercicio.');

    await page.getByRole('button', { name: /Jugar de nuevo/ }).click();
    await expect(tarjeta(page)).toHaveAttribute('data-numero', '3');
  });

  test('un número que no existe da un error accesible y no empieza', async ({ page }) => {
    await abrir(page);
    await jugarNumeros(page, '3, 99');
    const campo = page.getByLabel('Ejercicios por número');
    await expect(page.getByRole('alert').filter({ hasText: 'El ejercicio 99 no existe' })).toBeVisible();
    await expect(campo).toHaveAttribute('aria-invalid', 'true');
    await expect(campo).toBeFocused();
    await expect(tarjeta(page)).toHaveCount(0);
  });

  test('modo escribir: mayúsculas y punto se admiten, el guion vale por «sin preposición»', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /^Escribir/ }).click();
    await jugarNumeros(page, '1, 42');
    const input = page.getByLabel(/Tu respuesta/);
    await expect(input).toBeFocused();

    // Vacío: no se corrige, se avisa
    await input.press('Enter');
    await expect(page.getByRole('alert').filter({ hasText: 'Escribe in, on, at' })).toBeVisible();
    await expect(veredicto(page)).toHaveCount(0);

    await input.fill('AT.');
    await input.press('Enter');
    await expect(veredicto(page)).toContainText('¡Correcto!');
    await siguiente(page).click();

    await expect(tarjeta(page)).toHaveAttribute('data-numero', '42');
    await expect(input).toBeFocused();
    await input.fill('on');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(veredicto(page)).toContainText('Incorrecto');
    await expect(veredicto(page)).toContainText("I'll call you next week.");
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
