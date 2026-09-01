import { test, expect, Page } from '@playwright/test';

/**
 * teclado-barrido-switch — verificación de creación · 01/09/2026 (S0109)
 *
 * A diferencia del resto de ficheros de esta carpeta (que escribe /inspector al re-verificar
 * apps ya publicadas), este test nació en el PASO 4.bis de /nueva-app-meskeia, ANTES del
 * primer deploy — la app no tiene motor de cálculo que verificar (no da un resultado
 * numérico), tiene una MÁQUINA DE ESTADOS: barrido automático fila→columna con un temporizador,
 * un listener de teclado remapeable y una selección que depende de en qué fase se esté. Ese
 * tipo de lógica es exactamente donde un clic manual no basta: dos fallos reales aparecieron
 * aquí y ninguno se veía "raro" con la app abierta en el navegador:
 *
 *   1) La fila fijada perdía su resaltado al pasar a recorrer columnas — visualmente sutil
 *      (queda la celda iluminada), pero el usuario pierde la referencia de en qué fila está.
 *   2) Bug de foco: tras remapear el switch, el botón «Cambiar» se quedaba con el foco. La
 *      primera vez que se pulsaba una tecla que NO coincidía con el switch (Espacio o Enter,
 *      justo las más probables como switch real) no se llamaba a `preventDefault`, así que el
 *      navegador ejecutaba su propio comportamiento nativo de "esa tecla activa el botón
 *      enfocado" y reabría la captura por su cuenta.
 *
 * Ninguno de los dos es un fallo de cálculo: son de INTERACCIÓN, la clase de bug que este
 * fichero existe para atrapar antes del primer deploy.
 */

const RUTA = '/teclado-barrido-switch/';

async function irYArrancarBarrido(page: Page, velocidadMs = 400) {
  await page.goto(RUTA);
  await page
    .locator('#velocidad')
    .evaluate((el, v) => {
      (el as HTMLInputElement).value = String(v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, velocidadMs);
  await page.getByRole('button', { name: /Iniciar barrido/ }).click();
}

const filaResaltada = (page: Page) => page.locator('[class*="filaResaltada"]');
const celdaResaltada = (page: Page) => page.locator('[class*="teclaResaltada"]');
const salida = (page: Page) => page.locator('textarea[aria-label="Texto escrito con el barrido"]');

test.describe('teclado-barrido-switch', () => {
  test('el clic directo en una tecla escribe al instante, sin esperar al barrido', async ({ page }) => {
    // Atajo de prueba deliberado (page.tsx): cada celda es un <button> con su propio onClick,
    // independiente del ciclo de barrido — así se puede probar el resultado sin cronometrar.
    await page.goto(RUTA);
    await expect(salida(page)).toHaveValue('');

    await page.getByRole('button', { name: 'Letra E' }).click();
    await page.getByRole('button', { name: 'Letra A' }).click();
    await page.getByRole('button', { name: 'Espacio' }).click();
    await expect(salida(page)).toHaveValue('EA ');

    await page.getByRole('button', { name: 'Borrar el último carácter' }).click();
    await expect(salida(page)).toHaveValue('EA');

    await page.getByRole('button', { name: 'Borrar todo el texto' }).click();
    await expect(salida(page)).toHaveValue('');
  });

  test('el barrido avanza solo, fija la fila con el switch y selecciona la letra con una segunda pulsación', async ({
    page,
  }) => {
    await irYArrancarBarrido(page);

    await expect(filaResaltada(page)).toHaveCount(1);
    const filaInicial = await filaResaltada(page).locator('button').first().getAttribute('aria-label');

    // El barrido avanza SOLO, sin intervención — es el temporizador, no un clic.
    await expect
      .poll(async () => filaResaltada(page).locator('button').first().getAttribute('aria-label'))
      .not.toBe(filaInicial);

    // Primera pulsación del switch (Espacio, por defecto): fija la fila y pasa a fase columna.
    await page.keyboard.press('Space');
    await expect(celdaResaltada(page)).toHaveCount(1);
    // REGRESIÓN — la fila fijada debe seguir resaltada mientras se recorren sus columnas
    // (si se apaga, se pierde la referencia de en qué fila se está buscando la letra).
    await expect(filaResaltada(page)).toHaveCount(1);

    const celdaInicial = await celdaResaltada(page).getAttribute('aria-label');
    await expect.poll(async () => celdaResaltada(page).getAttribute('aria-label')).not.toBe(celdaInicial);
    const letraElegida = await celdaResaltada(page).getAttribute('aria-label');

    // Segunda pulsación: selecciona la celda resaltada EN ESE MOMENTO y vuelve a fase fila.
    await page.keyboard.press('Space');
    await expect(celdaResaltada(page)).toHaveCount(0);
    await expect(filaResaltada(page)).toHaveCount(1);

    if (letraElegida?.startsWith('Letra ')) {
      await expect(salida(page)).toHaveValue(letraElegida.replace('Letra ', ''));
    } else if (letraElegida === 'Espacio') {
      await expect(salida(page)).toHaveValue(' ');
    }
    // Si cayó en Borrar/Leer/Limpiar no se compara texto: es una acción, no un carácter.
  });

  test('REGRESIÓN · remapear el switch a otra tecla no deja el foco activando el botón «Cambiar»', async ({
    page,
  }) => {
    await irYArrancarBarrido(page);
    await expect(filaResaltada(page)).toHaveCount(1);
    await expect(celdaResaltada(page)).toHaveCount(0);

    await page.getByRole('button', { name: 'Cambiar', exact: true }).click();
    await page.keyboard.press('KeyF');
    await expect(page.locator('[class*="teclaActual"]')).toHaveText('F');

    // Espacio (el switch ANTERIOR) ya no debe activar nada — y tampoco debe reabrir la
    // captura por su cuenta vía el comportamiento nativo de "Espacio activa el botón
    // enfocado" (el bug real: el botón «Cambiar» se quedaba con el foco tras capturar).
    await page.keyboard.press('Space');
    await expect(celdaResaltada(page)).toHaveCount(0);
    await expect(page.locator('[class*="teclaActual"]')).toHaveText('F'); // no se recapturó

    // La tecla nueva (F) sí debe activar el switch.
    await page.keyboard.press('KeyF');
    await expect(celdaResaltada(page)).toHaveCount(1);
  });

  test('el orden de las letras (frecuencia vs. alfabético) reordena de verdad la cuadrícula', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const primeraTecla = () => page.locator('[class*="teclado"] button').first();

    // Por defecto, frecuencia del español (RAE/CREA): la E es la letra más usada.
    await expect(primeraTecla()).toHaveText('E');

    await page.getByRole('button', { name: 'Alfabético' }).click();
    await expect(primeraTecla()).toHaveText('A');
  });
});
