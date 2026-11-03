import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { buscarEjercicio, explicacion, fraseResuelta, EJERCICIOS } from '../../app/pronombres-ingles/motor';

/**
 * pronombres-ingles (03/11/2026).
 *
 * Lo que es correcto (cada forma de la tabla y la respuesta de cada ejercicio) lo fija el CANON
 * escrito a mano de tests/pronombres-ingles-motor.spec.ts. Aquí se mide lo que el motor no
 * puede: que la vista pinte la tabla y la resalte, que juegue exactamente los ejercicios pedidos
 * por número, que corrija y explique con el motor, que el foco vaya donde debe y el resultado.
 */

const ej = (n: number) => {
  const e = buscarEjercicio(n);
  if (!e) throw new Error(`no existe el ejercicio ${n}`);
  return e;
};

async function abrir(page: Page) {
  await page.goto('/pronombres-ingles/');
  await esperarPaginaAsentada(page);
}

async function jugarNumeros(page: Page, texto: string) {
  await page.getByLabel('Números de los ejercicios').fill(texto);
  await page.getByRole('button', { name: 'Jugar estos ejercicios' }).click();
}

const opcion = (page: Page, forma: string) =>
  page.getByRole('button', { name: new RegExp(`^Opción [A-D]: ${forma.replace(/[.*+?^${}()|[\]\\']/g, '\\$&')}$`) });

const veredicto = (page: Page) => page.locator('[class*="feedback"][role="alert"]');

test.describe('pronombres-ingles', () => {
  test('carga con el título, la tabla de siete personas y cinco tipos', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Pronombres en inglés');
    const tabla = page.locator('table[class*="tablaPronombres"]');
    await expect(tabla.locator('thead th')).toHaveCount(6);
    await expect(tabla.locator('tbody tr')).toHaveCount(7);
    await expect(tabla.locator('tbody tr').nth(3)).toContainText('hers');
    await expect(tabla.locator('tbody tr').nth(1)).toContainText('yourself / yourselves');
  });

  test('elegir persona y tipo resalta la fila y la columna, y la ficha da el ejemplo', async ({ page }) => {
    await abrir(page);
    const she = page.getByRole('button', { name: 'she', exact: true });
    await she.click();
    await expect(she).toHaveAttribute('aria-pressed', 'true');
    const fila = page.locator('table[class*="tablaPronombres"] tbody tr').nth(3);
    await expect(fila).toHaveClass(/filaActiva/);
    const ficha = page.locator('[class*="ficha"][aria-live="polite"]');
    await expect(ficha).toContainText('Las cinco formas de she');
    await expect(ficha).toContainText('This seat is hers.');

    const reflexivo = page.getByRole('button', { name: 'Reflexivo', exact: true });
    await reflexivo.click();
    await expect(reflexivo).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('table[class*="tablaPronombres"] thead th').nth(5)).toHaveClass(/colActiva/);
    await expect(ficha).toContainText('Reflexivo de she');
    await expect(ficha).toContainText('She looked at herself in the mirror.');

    // Pulsar otra vez quita el resaltado
    await she.click();
    await expect(she).toHaveAttribute('aria-pressed', 'false');
    await expect(fila).not.toHaveClass(/filaActiva/);
  });

  test('por número «3, 7» juega exactamente esos dos, en ese orden', async ({ page }) => {
    await abrir(page);
    await jugarNumeros(page, '3, 7');
    await expect(page.getByText('Pregunta 1 de 2', { exact: true })).toBeVisible();
    await expect(page.locator('[class*="ejercicioNumero"]')).toHaveText(/^Ejercicio 3 · /);
    await opcion(page, ej(3).admitidas[0]).click();
    await page.getByRole('button', { name: 'Siguiente →' }).click();
    await expect(page.locator('[class*="ejercicioNumero"]')).toHaveText(/^Ejercicio 7 · /);
    await opcion(page, ej(7).admitidas[0]).click();
    await expect(page.getByRole('button', { name: 'Ver resultados' })).toBeVisible();
    await page.getByRole('button', { name: 'Ver resultados' }).click();
    await expect(page.getByText('2 de 2 aciertos', { exact: true })).toBeVisible();
  });

  test('un acierto y un fallo con su explicación, el foco y el resultado', async ({ page }) => {
    await abrir(page);
    await jugarNumeros(page, '23, 33');

    // 1.º: el 23 acertado (hers)
    await expect(page.locator('[class*="enunciado"]')).toContainText('This book belongs to her.');
    await opcion(page, 'hers').click();
    await expect(veredicto(page)).toContainText('¡Correcto!');
    await expect(veredicto(page)).toContainText(fraseResuelta(ej(23)));
    await expect(veredicto(page)).toContainText(explicacion(ej(23)));
    const siguienteBtn = page.getByRole('button', { name: 'Siguiente →' });
    await expect(siguienteBtn).toBeFocused();
    await siguienteBtn.click();

    // Tras «Siguiente», el foco va al enunciado (tabIndex -1), no al <body>
    await expect(page.locator('[class*="preguntaCard"]')).toBeFocused();
    await expect(page.locator('[class*="ejercicioNumero"]')).toHaveText(/^Ejercicio 33 · /);

    // 2.º: el 33 fallado con «hisself»
    await opcion(page, 'hisself').click();
    await expect(veredicto(page)).toContainText('No es esa');
    await expect(veredicto(page)).toContainText('Has respondido «hisself».');
    await expect(veredicto(page)).toContainText('Respuesta correcta: himself');
    await expect(veredicto(page)).toContainText(explicacion(ej(33)));
    await expect(page.getByRole('button', { name: /^Opción [A-D]: himself \(respuesta correcta\)$/ })).toBeDisabled();
    await expect(page.getByRole('button', { name: /tu respuesta, incorrecta/ })).toHaveCount(1);

    await page.getByRole('button', { name: 'Ver resultados' }).click();
    const resultado = page.locator('section[class*="resultadoPanel"]');
    await expect(resultado).toBeFocused();
    await expect(resultado).toContainText('1 de 2 aciertos');
    await expect(resultado).toContainText(/50\s%\sde acierto/);
    await expect(resultado).toContainText('Ejercicios fallados: 33');
    await expect(resultado).toContainText(fraseResuelta(ej(33)));

    // «Jugar de nuevo» repite los mismos números
    await page.getByRole('button', { name: 'Jugar de nuevo' }).click();
    await expect(page.locator('[class*="ejercicioNumero"]')).toHaveText(/^Ejercicio 23 · /);
  });

  test('modo escribir: apóstrofo tipográfico admitido y error sin regla aplicada', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Escribir la respuesta/ }).click();
    await jugarNumeros(page, '41, 19');

    const input = page.getByLabel('Tu respuesta');
    await expect(input).toBeFocused();
    await input.fill('it’s.');
    await input.press('Enter');
    await expect(veredicto(page)).toContainText('¡Correcto!');
    await expect(veredicto(page)).toContainText('También vale: It is');
    await page.getByRole('button', { name: 'Siguiente →' }).click();

    await expect(input).toBeFocused();
    await input.fill("it's");
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(veredicto(page)).toContainText('No es esa');
    await expect(veredicto(page)).toContainText(explicacion(ej(19)));
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  test('un número que no existe da un error accesible y no empieza la partida', async ({ page }) => {
    await abrir(page);
    await jugarNumeros(page, `3, ${EJERCICIOS.length + 49}`);
    await expect(page.locator('#error-numeros')).toHaveText(
      `El ejercicio ${EJERCICIOS.length + 49} no existe: hay del 1 al ${EJERCICIOS.length}.`,
    );
    await expect(page.getByLabel('Números de los ejercicios')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[class*="preguntaCard"]')).toHaveCount(0);
  });

  test('al azar: las categorías conmutan con aria-pressed y «Cambiar ejercicios» vuelve a la configuración', async ({ page }) => {
    await abrir(page);
    const trampas = page.getByRole('button', { name: /^Trampas típicas/ });
    await expect(trampas).toHaveAttribute('aria-pressed', 'true');
    for (const nombre of [/^Personales de sujeto/, /^Personales de objeto/, /^Adjetivos posesivos/, /^Pronombres posesivos/, /^Reflexivos/]) {
      await page.getByRole('button', { name: nombre }).click();
    }
    await expect(page.getByRole('button', { name: /^Reflexivos/ })).toHaveAttribute('aria-pressed', 'false');
    // La última que queda no se puede desmarcar
    await trampas.click();
    await expect(trampas).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: '10 preguntas', exact: true }).click();
    await page.getByRole('button', { name: /^Empezar — 10 preguntas al azar$/ }).click();
    for (let i = 0; i < 10; i++) {
      await expect(page.locator('[class*="ejercicioNumero"]')).toContainText('Trampas típicas');
      await page.locator('[class*="opcionesGrid"] button').first().click();
      await page.getByRole('button', { name: /Siguiente →|Ver resultados/ }).click();
    }
    await page.getByRole('button', { name: 'Cambiar ejercicios' }).click();
    await expect(page.getByRole('heading', { name: 'Ejercicios numerados' })).toBeFocused();
  });
});
