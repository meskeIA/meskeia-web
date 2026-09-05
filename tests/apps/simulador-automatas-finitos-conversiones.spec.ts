import { test, expect } from '@playwright/test';

/**
 * simulador-automatas-finitos — conversiones · 05/09/2026
 *
 * Fichero APARTE del de regresión del Inspector (simulador-automatas-finitos.spec.ts,
 * 31/08/2026), que cubre la validación de cadenas y no se toca aquí.
 *
 * El motor (motor-conversiones.ts) ya está probado a mano en tests/automatas-motor.spec.ts.
 * Lo que se comprueba AQUÍ es que la pantalla usa ese motor de verdad y que el resultado
 * llega al lienzo: que los dos algoritmos no se queden, otra vez, en texto explicativo.
 *
 * CASO RESUELTO A MANO — ejemplo «NFA — Contiene "01"» de la propia app:
 *   q0 --0--> q0 · q0 --1--> q0 · q0 --0--> q1 · q1 --1--> q2 ; q2 final y absorbente
 *   (q2 --0--> q2 y q2 --1--> q2: una vez visto «01», la cadena ya se acepta pase lo que pase)
 *
 *   Tabla de subconjuntos desde {q0}:
 *     {q0}        0 → {q0,q1}     (nuevo)          1 → {q0}
 *     {q0,q1}     0 → {q0,q1}                      1 → {q0,q2}     (nuevo, FINAL)
 *     {q0,q2}     0 → {q0,q1,q2}  (nuevo, FINAL)   1 → {q0,q2}
 *     {q0,q1,q2}  0 → {q0,q1,q2}                   1 → {q0,q2}
 *
 *   CUATRO estados, dos finales: {q0,q2} y {q0,q1,q2}. La primera versión de este test
 *   decía tres y se olvidaba de que q2 es absorbente: el bucle q2--0-->q2 obliga a que
 *   {q0,q2} con 0 arrastre también a q1, creando {q0,q1,q2}. El motor lo tenía bien; el
 *   equivocado era el cálculo escrito aquí.
 */

const URL_APP = '/simulador-automatas-finitos/';

test.describe('simulador-automatas-finitos · conversiones', () => {
  test('determinizar el NFA «Contiene 01» da los cuatro conjuntos calculados a mano', async ({ page }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: /Contiene "01"/ }).click();

    await page.getByRole('button', { name: /Determinizar/ }).click();

    // La tabla de subconjuntos aparece con las filas del algoritmo
    await expect(page.getByRole('heading', { name: 'Tabla de subconjuntos' })).toBeVisible();
    const resumen = page.getByText(/El AFD resultante tiene/);
    await expect(resumen).toContainText('4');
    await expect(resumen).toContainText('{q0,q2}');
    await expect(resumen).toContainText('{q0,q1,q2}');

    // Y el resultado se puede llevar al lienzo
    await page.getByRole('button', { name: 'Cargar el AFD en el lienzo' }).click();
    // El lienzo, no el SVG del logotipo, que es el primero de la página
    await expect(page.locator('svg[class*="editorSvg"]')).toContainText('{q0,q2}');
  });

  test('minimizar avisa en vez de mentir cuando el autómata no es determinista', async ({ page }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: /Contiene "01"/ }).click();

    await page.getByRole('button', { name: /Minimizar/ }).click();
    const alerta = page.getByRole('alert').first();
    await expect(alerta).toContainText('AFND');
    await expect(alerta).toContainText('Determinízalo');
  });

  test('un AFD que ya es mínimo se reconoce como tal', async ({ page }) => {
    await page.goto(URL_APP);
    // «DFA — Pares de 0»: dos estados distinguibles, no hay nada que fusionar
    await page.getByRole('button', { name: /Pares de 0/ }).click();

    await page.getByRole('button', { name: /Minimizar/ }).click();
    await expect(page.getByRole('heading', { name: 'Refinamiento de particiones' })).toBeVisible();
    await expect(page.getByText(/ya era mínimo/)).toBeVisible();
  });

  test('editar el autómata retira el resultado anterior', async ({ page }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: /Pares de 0/ }).click();
    await page.getByRole('button', { name: /Minimizar/ }).click();
    await expect(page.getByRole('heading', { name: 'Refinamiento de particiones' })).toBeVisible();

    // Cargar otro ejemplo cambia el autómata: la partición de antes ya no describe nada
    await page.getByRole('button', { name: /Termina en "ab"/ }).click();
    await expect(page.getByRole('heading', { name: 'Refinamiento de particiones' })).toHaveCount(0);
  });
});
