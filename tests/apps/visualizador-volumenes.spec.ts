/**
 * Test de regresión — /visualizador-volumenes/
 *
 * Verifica que el motor de cálculo sigue devolviendo los volúmenes correctos
 * y que el formato español y los límites de los sliders se mantienen.
 *
 * Los tres casos están resueltos A MANO antes de ejecutarse (desarrollo en cada
 * bloque). Si un cambio futuro altera `calcVolumen` o `formatVolumen`, estos
 * números dejarán de cuadrar y el test lo dirá.
 *
 * Controles: 5 figuras, sliders `input[type=range]` con min=1, max=50, step=1.
 * No hay entrada numérica libre, así que no existe un caso de "entrada inválida":
 * el caso 3 comprueba el recorte a los límites, que es la única defensa que tiene.
 */

import { test, expect, type Page } from '@playwright/test';

const RESULTADO = '[aria-label="Resultado del volumen"]';

/** Valor numérico mostrado en la tarjeta de resultado (2º span: etiqueta, valor, unidad). */
function valorVolumen(page: Page) {
  return page.locator(RESULTADO).locator('span').nth(1);
}

/** Fórmula aplicada: es el primer <code> del DOM (va antes del bloque educativo). */
function formulaAplicada(page: Page) {
  return page.locator('code').first();
}

async function elegirFigura(page: Page, nombre: RegExp) {
  const boton = page.getByRole('button', { name: nombre });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/**
 * Escribe un valor en el slider como lo haría el navegador.
 * Importante: el setter nativo RECORTA a [min, max]; eso es justo lo que mide el caso 3.
 */
async function ponerSlider(page: Page, indice: number, valor: number) {
  await page.locator('input[type=range]').nth(indice).evaluate((elemento, v) => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )!.set!;
    setter.call(elemento, String(v));
    elemento.dispatchEvent(new Event('input', { bubbles: true }));
  }, valor);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/visualizador-volumenes/');
  await expect(page.locator('h1')).toContainText('Visualizador de Volúmenes 3D');
});

test.describe('visualizador-volumenes — volúmenes calculados a mano', () => {
  /**
   * CASO 1 — NORMAL · Cilindro r=4, h=8
   *
   *   V = π · r² · h = π · 4² · 8 = 128 π
   *   100 π = 314,159265359
   *    28 π =  87,964594300
   *   ---------------------------
   *   128 π = 402,123859659
   *
   *   El formateador usa 1 decimal en el tramo [100, 100.000) → "402,1"
   */
  test('caso normal: cilindro r=4 h=8 → 402,1 unidades³', async ({ page }) => {
    await elegirFigura(page, /Cilindro/);

    // Son los valores por defecto de la figura; se fijan igualmente para no depender de ellos.
    await ponerSlider(page, 0, 4); // radio
    await ponerSlider(page, 1, 8); // altura

    await expect(valorVolumen(page)).toHaveText('402,1');
    await expect(page.locator(RESULTADO)).toContainText('unidades³');
    await expect(formulaAplicada(page)).toHaveText('V = π × r² × h = π × 4² × 8');

    // El cono con la misma base y altura debe ser exactamente un tercio (128π/3 = 134,041286…),
    // que es la relación que el bloque educativo invita a comprobar.
    await elegirFigura(page, /Cono/);
    await ponerSlider(page, 0, 4);
    await ponerSlider(page, 1, 8);
    await expect(valorVolumen(page)).toHaveText('134,0');
  });

  /**
   * CASO 2 — LÍMITE SUPERIOR · Esfera r=50 (máximo del slider)
   *
   *   V = (4/3) · π · 50³ = (4/3) · π · 125.000 = 500.000 π / 3
   *   500.000 π = 1.570.796,32679
   *          /3 =   523.598,775598
   *
   *   Tramo ≥ 100.000 → 0 decimales → redondea a 523.599
   *   Formato español: punto de miles → "523.599"
   */
  test('caso límite: esfera en el máximo r=50 → 523.599 unidades³', async ({ page }) => {
    await elegirFigura(page, /Esfera/);
    await ponerSlider(page, 0, 50);

    await expect(page.locator('input[type=range]').first()).toHaveValue('50');
    await expect(valorVolumen(page)).toHaveText('523.599');
    await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 50³');

    // El máximo declarado en el control es 50: nada debería permitir superarlo.
    await expect(page.locator('input[type=range]').first()).toHaveAttribute('max', '50');
  });

  /**
   * CASO 3 — DEBE RECHAZARSE · valores fuera de rango (0, negativo, 100)
   *
   *   Los sliders declaran min=1 / max=50, así que un 0, un -20 o un 100 tienen que
   *   quedar recortados antes de llegar al cálculo. Nunca debe salir un volumen 0,
   *   negativo, "No definido" (NaN) ni "∞".
   *
   *   r=0 y r=-20 → recortados a 1  → V = (4/3)π = 4,188790204…
   *                                   tramo < 10 → 4 decimales → "4,1888"
   *   r=100       → recortado a 50  → "523.599"
   */
  test('caso a rechazar: 0, negativo y 100 se recortan a [1, 50]', async ({ page }) => {
    await elegirFigura(page, /Esfera/);
    const slider = page.locator('input[type=range]').first();

    await ponerSlider(page, 0, 0);
    await expect(slider).toHaveValue('1');
    await expect(valorVolumen(page)).toHaveText('4,1888');
    await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 1³');

    await ponerSlider(page, 0, -20);
    await expect(slider).toHaveValue('1');
    await expect(valorVolumen(page)).toHaveText('4,1888');

    await ponerSlider(page, 0, 100);
    await expect(slider).toHaveValue('50');
    await expect(valorVolumen(page)).toHaveText('523.599');

    // Ni con el teclado se baja del mínimo.
    await ponerSlider(page, 0, 1);
    await slider.focus();
    await slider.press('ArrowLeft');
    await slider.press('ArrowLeft');
    await expect(slider).toHaveValue('1');

    // En ningún momento un resultado degenerado.
    const mostrado = await valorVolumen(page).innerText();
    expect(mostrado).not.toMatch(/No definido|∞|NaN|^-|^0,0+$/);
  });
});
