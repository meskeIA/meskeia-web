import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { ejercicioDe, explicarConstruccion, fraseCompleta, TOTAL_EJERCICIOS } from '../../app/tiempos-verbales-ingles/motor';

/**
 * tiempos-verbales-ingles: ejercicios numerados de tiempos verbales y conjugador.
 *
 * Lo que es correcto en cada hueco lo fija el CANON escrito a mano de
 * tests/tiempos-verbales-ingles-motor.spec.ts. Aquí se mide lo que el motor no puede: que la
 * vista juegue exactamente los números pedidos, corrija y explique con el motor, que el foco
 * vaya donde debe y que el resultado nombre los fallados por su número.
 */

const ej = (n: number) => {
  const e = ejercicioDe(n);
  if (!e) throw new Error(`no existe el ejercicio ${n}`);
  return e;
};

/** La tarjeta del enunciado: recibe el foco por programa (tabIndex -1). */
const enunciado = (page: Page) => page.locator('[class*="enunciado"][tabindex="-1"]');

async function abrir(page: Page) {
  await page.goto('/tiempos-verbales-ingles/');
  await esperarPaginaAsentada(page);
}

async function jugarNumeros(page: Page, texto: string) {
  const campo = page.getByLabel('Ejercicios por número');
  await campo.fill(texto);
  await page.getByRole('button', { name: 'Hacer estos ejercicios' }).click();
}

test.describe('Tiempos verbales en inglés', () => {
  test('carga con su título, la configuración y el conjugador', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Tiempos verbales en inglés');
    await expect(page.getByRole('heading', { name: 'Practica los tiempos verbales' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Conjugador de tiempos verbales' })).toBeVisible();
    for (const nombre of ['Present simple o continuous', 'Past simple o continuous', 'Past simple o present perfect', 'Will o be going to']) {
      await expect(page.getByRole('button', { name: new RegExp(nombre) })).toHaveAttribute('aria-pressed', 'true');
    }
  });

  test('«3, 7» juega exactamente esos dos: uno acertado, otro fallado con su regla, y el resultado', async ({ page }) => {
    await abrir(page);
    await jugarNumeros(page, '3, 7');

    // Ejercicio 3: acertado
    await expect(page.getByText('Pregunta 1 de 2', { exact: true })).toBeVisible();
    await expect(enunciado(page)).toContainText('Ejercicio 3');
    await expect(enunciado(page)).toBeFocused();
    const input = page.getByLabel('Lo que va en el hueco');
    await input.fill('Is singing.');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    const alerta = page.locator('[role="alert"]:not(#__next-route-announcer__)');
    await expect(alerta).toContainText('¡Correcto!');
    await expect(alerta).toContainText(fraseCompleta(ej(3)));
    await expect(page.getByRole('button', { name: 'Siguiente ejercicio →' })).toBeFocused();

    // El foco tras «Siguiente» va al enunciado del ejercicio nuevo
    await page.getByRole('button', { name: 'Siguiente ejercicio →' }).click();
    await expect(enunciado(page)).toBeFocused();
    await expect(enunciado(page)).toContainText('Ejercicio 7');
    await expect(page.getByText('Pregunta 2 de 2', { exact: true })).toBeVisible();

    // Ejercicio 7: fallado («go» sin la -es), con la forma correcta y la regla
    await input.fill('go');
    await input.press('Enter');
    await expect(alerta).toContainText('No es correcto');
    await expect(alerta).toContainText('Has escrito «go».');
    await expect(alerta).toContainText(fraseCompleta(ej(7)));
    await expect(alerta).toContainText(ej(7).regla);
    await expect(alerta).toContainText(explicarConstruccion(ej(7)));
    await expect(input).toHaveAttribute('aria-invalid', 'true');

    await page.getByRole('button', { name: 'Ver el resultado' }).click();
    await expect(page.getByText('1 de 2', { exact: true })).toBeVisible();
    await expect(page.getByText(/50\s%\sde aciertos/)).toBeVisible();
    await expect(page.getByText('Ejercicios fallados: 7.', { exact: true })).toBeVisible();

    // «Repetir los fallados» juega solo el 7
    await page.getByRole('button', { name: 'Repetir los fallados' }).click();
    await expect(page.getByText('Pregunta 1 de 1', { exact: true })).toBeVisible();
    await expect(enunciado(page)).toContainText('Ejercicio 7');
  });

  test('un número que no existe da un error accesible y no empieza la partida', async ({ page }) => {
    await abrir(page);
    await jugarNumeros(page, `3, ${TOTAL_EJERCICIOS + 1}`);
    await expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).toHaveText(`No existe el ejercicio ${TOTAL_EJERCICIOS + 1}: hay del 1 al ${TOTAL_EJERCICIOS}.`);
    await expect(page.getByLabel('Ejercicios por número')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('heading', { name: 'Practica los tiempos verbales' })).toBeVisible();
  });

  test('modo elegir: cuatro opciones con letra, sin aria-pressed, y la buena marcada', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Elegir entre 4 opciones/ }).click();
    await jugarNumeros(page, '1');
    const opciones = page.getByRole('button', { name: /^Opción [A-D]:/ });
    await expect(opciones).toHaveCount(4);
    await expect(page.locator('button[aria-pressed][aria-label^="Opción"]')).toHaveCount(0);
    await page.getByRole('button', { name: /^Opción [A-D]: visits$/ }).click();
    await expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).toContainText('¡Correcto!');
    await expect(page.getByRole('button', { name: /: visits \(respuesta correcta\)$/ })).toBeDisabled();
  });

  test('al azar: la partida tiene el número de ejercicios elegido', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: '15 ejercicios', exact: true }).click();
    await expect(page.getByRole('button', { name: '15 ejercicios', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /^Empezar — 15 ejercicios al azar/ }).click();
    await expect(page.getByText('Pregunta 1 de 15', { exact: true })).toBeVisible();
  });

  test('conjugador: swim en present continuous dobla la m', async ({ page }) => {
    await abrir(page);
    await page.getByLabel('Verbo').selectOption('swim');
    await page.getByRole('button', { name: 'Present continuous', exact: true }).click();
    const tabla = page.locator('table').filter({ hasText: 'Sujeto' });
    await expect(tabla.getByRole('row', { name: /^she / })).toContainText('she is swimming');
    await expect(tabla.getByRole('row', { name: /^I / })).toContainText("I'm not swimming");
    await expect(tabla.getByRole('row', { name: /^he / })).toContainText('Is he swimming?');
  });
});
