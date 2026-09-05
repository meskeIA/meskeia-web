import { test, expect, type Page } from '@playwright/test';

/**
 * simulador-monticulo-binario — 05/09/2026
 *
 * El motor está probado aparte con 20 casos a mano (tests/monticulo-motor.spec.ts). Aquí
 * se comprueba que la pantalla usa ese motor y no una copia suya, con el ejemplo con el
 * que casi todos los libros explican el heapify.
 *
 * CASO RESUELTO A MANO — «El arreglo de clase» [4, 10, 3, 5, 1] a montículo de MÁXIMOS:
 *
 *   Primer nodo con hijos: ⌊5/2⌋ − 1 = 1 (valor 10)
 *   i=1 → hijos 5 y 1; el mayor es 5 < 10 → no se mueve
 *   i=0 → valor 4, hijos 10 y 3; 10 > 4 → intercambio → [10,4,3,5,1], bajo al índice 1
 *         hijos del 1: 5 y 1; 5 > 4 → intercambio → [10,5,3,4,1], bajo al 3: es hoja
 *   Resultado: [10, 5, 3, 4, 1]
 *
 *   Y su heapsort deja [1, 3, 4, 5, 10]: ASCENDENTE, pese a ser un montículo de máximos.
 *   Es lo que más descoloca la primera vez, y por eso está aquí.
 *
 * Detalle de manejo: la app comprueba la propiedad de montículo sobre el paso VISIBLE, no
 * sobre el resultado final. Es deliberado y correcto —a media construcción la propiedad
 * todavía no se cumple, y decir lo contrario sería mentir—, así que los tests que miran el
 * resultado saltan antes al último paso con «Final».
 */

const URL_APP = '/simulador-monticulo-binario/';

/** Salta al último paso de la animación, que es donde está el resultado. */
async function irAlFinal(page: Page) {
  const final = page.getByRole('button', { name: 'Final', exact: true });
  if (await final.isEnabled()) await final.click();
}

/** Texto de la página con los espacios colapsados, para buscar secuencias. */
async function textoPlano(page: Page): Promise<string> {
  return (await page.locator('main').innerText()).replace(/\s+/g, ' ');
}

test.describe('simulador-monticulo-binario', () => {
  test('A MANO: [4,10,3,5,1] se convierte en el montículo de máximos [10,5,3,4,1]', async ({ page }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: /El arreglo de clase/ }).click();
    await irAlFinal(page);

    expect(await textoPlano(page)).toContain('10 [0] 5 [1] 3 [2] 4 [3] 1 [4]');
    await expect(page.getByText(/montículo de máximos válido/i).first()).toBeVisible();
  });

  test('A MANO: el heapsort de ese arreglo deja 1, 3, 4, 5, 10 — ascendente con un max-heap', async ({ page }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: /El arreglo de clase/ }).click();
    await page.getByRole('button', { name: 'Heapsort', exact: true }).click();
    await irAlFinal(page);

    expect(await textoPlano(page)).toContain('1 [0] 3 [1] 4 [2] 5 [3] 10 [4]');
  });

  test('cambiar a mínimos reconstruye el montículo con los mismos valores', async ({ page }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: /El arreglo de clase/ }).click();

    const botonMin = page.getByRole('button', { name: /Mínimos \(min-heap\)/ });
    await botonMin.click();
    await expect(botonMin).toHaveAttribute('aria-pressed', 'true');
    await irAlFinal(page);

    await expect(page.getByText(/montículo de mínimos válido/i).first()).toBeVisible();
    // Con mínimos la raíz es el 1, no el 10
    expect(await textoPlano(page)).toContain('1 [0]');
  });

  test('lo que no es un número se descarta y se DICE, sin pintar NaN', async ({ page }) => {
    await page.goto(URL_APP);
    await page.locator('#entrada-construir').fill('8, abc, 3, --, 12');
    await page.getByRole('button', { name: /^Construir/ }).click();

    const texto = await page.locator('main').innerText();
    expect(texto).not.toContain('NaN');
    expect(texto).toMatch(/descartad/i);
  });

  test('extraer la raíz saca el mayor y deja un montículo válido', async ({ page }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: /El arreglo de clase/ }).click();
    await irAlFinal(page);
    await page.getByRole('button', { name: 'Extraer raíz' }).click();
    await irAlFinal(page);

    // Tras sacar el 10, la raíz pasa a ser el 5 y la propiedad se mantiene
    await expect(page.getByText(/montículo de máximos válido/i).first()).toBeVisible();
    expect(await textoPlano(page)).toContain('5 [0] 4 [1] 3 [2] 1 [3]');
  });

  test('la guía educativa está en el HTML servido, no solo tras hidratar', async ({ page }) => {
    const respuesta = await page.request.get(URL_APP);
    expect(respuesta.ok()).toBeTruthy();
    const html = await respuesta.text();
    expect(html).toContain('heapify');
    expect(html.toLowerCase()).toContain('cola de prioridad');
  });
});
