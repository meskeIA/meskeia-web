import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import {
  porNumero, explicar, fraseCompleta, TOTAL_EJERCICIOS, type Ejercicio,
} from '../../app/condicionales-ingles/motor';

/**
 * condicionales-ingles: lo que el motor no puede medir. Que la vista pregunte los ejercicios
 * pedidos por número y en su orden, corrija con el motor, explique la regla, lleve el foco donde
 * debe y cuente bien el resultado. Lo que es correcto en cada ejercicio lo fija el CANON escrito
 * a mano de tests/condicionales-ingles-motor.spec.ts.
 */

const ej = (n: number): Ejercicio => {
  const e = porNumero(n);
  if (!e) throw new Error(`no hay ejercicio ${n}`);
  return e;
};

const veredicto = (page: Page) => page.locator('[class*="veredicto"][role="alert"]');
const enunciado = (page: Page) => page.locator('[class*="enunciado"][tabindex="-1"]');

async function abrir(page: Page) {
  await page.goto('/condicionales-ingles/');
  await esperarPaginaAsentada(page);
}

async function jugarNumeros(page: Page, texto: string) {
  await page.getByLabel('Ejercicios por número').fill(texto);
  await page.getByRole('button', { name: 'Jugar estos ejercicios' }).click();
}

test.describe('condicionales-ingles', () => {
  test('carga con el título, la configuración y la tabla de las cuatro estructuras', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Condicionales en inglés');
    await expect(page.getByRole('heading', { name: 'Elige qué practicar' })).toBeVisible();
    const tabla = page.locator('section[aria-labelledby="titulo-estructuras"] table');
    await expect(tabla.locator('tbody tr')).toHaveCount(4);
    await expect(tabla).toContainText('If + past perfect, would have + participio');
    // Los conmutadores llevan aria-pressed; todos los tipos, activos al cargar
    for (const t of [0, 1, 2, 3]) {
      await expect(page.getByRole('button', { name: new RegExp(`^Tipo ${t}`) })).toHaveAttribute('aria-pressed', 'true');
    }
    await expect(page.getByRole('button', { name: /^Escribir la forma/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('«3, 7» juega exactamente esos: uno acertado, uno fallado con su regla, foco y resultado', async ({ page }) => {
    await abrir(page);
    await jugarNumeros(page, '3, 7');

    // 1.ª: el ejercicio 3, acertado (mayúscula y punto final se admiten)
    await expect(page.getByText('Pregunta 1 de 2', { exact: true })).toBeVisible();
    await expect(page.getByText('Ejercicio 3', { exact: true })).toBeVisible();
    await expect(enunciado(page)).toBeFocused();
    const input = page.getByLabel('Tu respuesta para el hueco');
    await input.fill('Mix.');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(veredicto(page)).toContainText('¡Correcto!');
    await expect(veredicto(page)).toContainText(fraseCompleta(ej(3)));
    const siguiente = page.getByRole('button', { name: 'Siguiente →' });
    await expect(siguiente).toBeFocused();

    // Tras «Siguiente», el foco va al enunciado del ejercicio nuevo
    await siguiente.click();
    await expect(page.getByText('Ejercicio 7', { exact: true })).toBeVisible();
    await expect(page.getByText('Pregunta 2 de 2', { exact: true })).toBeVisible();
    await expect(enunciado(page)).toBeFocused();

    // 2.ª: el ejercicio 7, fallado con el error típico «If it will rain»
    await input.fill('will rain');
    await input.press('Enter');
    const v = veredicto(page);
    await expect(v).toContainText('No es correcto');
    await expect(v).toContainText('Tu respuesta: «will rain».');
    await expect(v).toContainText('no se usa will');
    await expect(v).toContainText(fraseCompleta(ej(7)));
    await expect(v).toContainText(explicar(ej(7)));
    await expect(input).toHaveAttribute('aria-invalid', 'true');

    // Resultado
    await page.getByRole('button', { name: 'Ver resultados' }).click();
    await expect(page.getByText('1 de 2', { exact: true })).toBeVisible();
    await expect(page.getByText(/^50\s%\sde acierto$/)).toBeVisible();
    await expect(page.getByText('Ejercicios fallados: 7', { exact: true })).toBeVisible();

    // «Jugar de nuevo» repite los mismos números, en el mismo orden
    await page.getByRole('button', { name: /Jugar de nuevo/ }).click();
    await expect(page.getByText('Ejercicio 3', { exact: true })).toBeVisible();
    await expect(page.getByText('Pregunta 1 de 2', { exact: true })).toBeVisible();
  });

  test('«¿Qué tipo es?» se responde con las opciones A-D, sin aria-pressed', async ({ page }) => {
    await abrir(page);
    await jugarNumeros(page, '38');
    const opciones = page.locator('[class*="opcionesGrid"] button');
    await expect(opciones).toHaveCount(4);
    await expect(page.locator('[class*="opcionesGrid"] button[aria-pressed]')).toHaveCount(0);
    await page.getByRole('button', { name: /^Opción D: Tipo 3/ }).click();
    await expect(veredicto(page)).toContainText('¡Correcto!');
    await expect(veredicto(page)).toContainText(explicar(ej(38)));
    await expect(page.getByRole('button', { name: /respuesta correcta/ })).toBeDisabled();
  });

  test('en el modo elegir, los de completar también se responden con opciones', async ({ page }) => {
    await abrir(page);
    const elegir = page.getByRole('button', { name: /^Elegir entre 4 opciones/ });
    await elegir.click();
    await expect(elegir).toHaveAttribute('aria-pressed', 'true');
    await jugarNumeros(page, '18');
    await expect(page.getByLabel('Tu respuesta para el hueco')).toHaveCount(0);
    await page.getByRole('button', { name: /^Opción [A-D]: will buy$/ }).click();
    await expect(veredicto(page)).toContainText('No es correcto');
    await expect(veredicto(page)).toContainText('lleva would');
    await expect(page.getByRole('button', { name: /would buy \(respuesta correcta\)$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /tu respuesta, incorrecta/ })).toHaveCount(1);
  });

  test('un número que no existe da un error accesible y no empieza', async ({ page }) => {
    await abrir(page);
    await jugarNumeros(page, '3, 99');
    await expect(page.getByRole('alert').filter({ hasText: 'No hay ejercicio 99' }))
      .toHaveText(`No hay ejercicio 99: los números van del 1 al ${TOTAL_EJERCICIOS}.`);
    await expect(page.getByLabel('Ejercicios por número')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('heading', { name: 'Elige qué practicar' })).toBeVisible();
  });

  test('un intervalo «27-29» juega los tres en orden', async ({ page }) => {
    await abrir(page);
    await jugarNumeros(page, '27-29');
    await expect(page.getByText('Pregunta 1 de 3', { exact: true })).toBeVisible();
    await expect(page.getByText('Ejercicio 27', { exact: true })).toBeVisible();
  });
});
