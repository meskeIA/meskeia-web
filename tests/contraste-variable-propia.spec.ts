/**
 * La marca que llega por una VARIABLE PROPIA del módulo, medida por píxel (cabo C0502, 30/10/2026).
 *
 * `check:contraste-marca` buscaba la marca en la declaración y no seguía `var(--propia)`: el
 * hallazgo 3683 (quiz-complejidad-algoritmos, blanco sobre `--cat-notacion: #2E86AB`) pasó el
 * candado. Al ampliarlo, el censo dio cuatro casos más en tres apps, que se repararon cambiando el
 * VALOR de la variable en claro:
 *
 *   · orientador-iva-espana — la insignia del mecanismo (12,5 px en negrita sobre --bg-card):
 *     #2E86AB 4,11 · #48A9A6 2,80 → #26718F 5,47 · #327874 5,15, y de paso los dos semánticos de la
 *     misma insignia, #16a34a 3,30 · #E87722 2,96 → #15803d 5,02 · #c2410c 5,18.
 *   · orientador-tipos-renta-irpf — la insignia de la base: los mismos tres tonos.
 *   · simulador-hashing-colisiones — el número en blanco de la celda ocupada: sobre #2e86ab
 *     4,11 → sobre #26718F 5,47.
 *
 * El candado comprueba la FORMA; esto, el contraste del píxel en los dos temas.
 */
import { test, expect } from '@playwright/test';
import { activarTemaOscuro, medirContraste, prepararParaMedir } from './_contraste';

/** Los tonos de las insignias antes y después, en los dos temas: lo que se mide como texto. */
const TONOS_INSIGNIA = [
  '#2E86AB', '#48A9A6', '#16A34A', '#E87722', '#26718F', '#327874', '#15803D', '#C2410C',
  '#5BA3C7', '#6BC4C0', '#4ADE80', '#FB923C',
];

for (const slug of ['orientador-iva-espana', 'orientador-tipos-renta-irpf']) {
  test(`${slug}: la insignia del resultado llega a 4,5:1 en claro y en oscuro`, async ({ page }) => {
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    const insignia = page.locator('[class*="resultadoBadge"]').first();
    await expect(insignia).toBeVisible();

    const claro = await medirContraste(page, { selector: '[class*="resultadoBadge"]', texto: TONOS_INSIGNIA });
    expect(claro.ratio, `claro: ${JSON.stringify(claro)}`).toBeGreaterThan(0);
    expect(claro.ratio, `claro: ${JSON.stringify(claro)}`).toBeGreaterThanOrEqual(4.5);

    await activarTemaOscuro(page);
    const oscuro = await medirContraste(page, { selector: '[class*="resultadoBadge"]', texto: TONOS_INSIGNIA });
    expect(oscuro.ratio, `oscuro: ${JSON.stringify(oscuro)}`).toBeGreaterThan(0);
    expect(oscuro.ratio, `oscuro: ${JSON.stringify(oscuro)}`).toBeGreaterThanOrEqual(4.5);
  });
}

test('simulador-hashing-colisiones: el número blanco de la celda ocupada llega a 4,5:1 en claro y en oscuro', async ({ page }) => {
  await page.goto('/simulador-hashing-colisiones/');
  await prepararParaMedir(page);
  await page.getByRole('button', { name: /^Insertar todas/ }).click();
  await expect(page.locator('[class*="celdaOcupada"]').first()).toBeVisible();
  // El texto vive en los hijos: el índice y los chips de las palabras (encadenamiento, por defecto).
  // Se mide el BLANCO sobre el fondo que tenga, no solo sobre la marca: el chip pone su tinte
  // encima, y con el blanco al 20 % de antes daba 3,68:1 sobre un fondo que ya no es de marca.
  const CELDA = '[class*="celdaOcupada"] *, [class*="celdaColision"] *';
  await expect(page.locator('[class*="celdaOcupada"] [class*="chip"]').first()).toBeVisible();
  // El instrumento no compone la OPACIDAD: el índice a 0,75 se quedaba en 3,83:1 y lo midió 5,47.
  expect(await page.locator('[class*="celdaOcupada"] [class*="celdaIndice"]').first().evaluate((el) => getComputedStyle(el).opacity)).toBe('1');

  const claro = await medirContraste(page, { selector: CELDA, texto: ['#FFFFFF'] });
  expect(claro.vistos, `claro: ${JSON.stringify(claro)}`).toBeGreaterThan(4);
  expect(claro.ratio, `claro: ${JSON.stringify(claro)}`).toBeGreaterThan(0);
  expect(claro.ratio, `claro: ${JSON.stringify(claro)}`).toBeGreaterThanOrEqual(4.5);

  await activarTemaOscuro(page);
  const oscuro = await medirContraste(page, { selector: CELDA, texto: ['#FFFFFF'] });
  expect(oscuro.ratio, `oscuro: ${JSON.stringify(oscuro)}`).toBeGreaterThan(0);
  expect(oscuro.ratio, `oscuro: ${JSON.stringify(oscuro)}`).toBeGreaterThanOrEqual(4.5);
});
