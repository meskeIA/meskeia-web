import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Simulador de Lentes Ópticas — regresión del motor de óptica geométrica.
 *
 * CONVENIO DE SIGNOS que declara la propia app (bloque educativo y tarjeta de descripción):
 *   ecuación de Gauss para lentes delgadas   1/s + 1/s' = 1/f
 *   aumento lateral                          M = −s'/s          ·   h' = M · h
 *   s  > 0  objeto a la IZQUIERDA de la lente (siempre positivo aquí)
 *   s' > 0  imagen a la DERECHA  → real     ·   s' < 0 imagen a la izquierda → virtual
 *   f  > 0  convergente                      ·   f < 0 divergente
 *   P = 1/f con f en METROS (la app trabaja en cm, así que P = 100/f_cm)
 * NO es el convenio DIN/europeo (que toma s negativa); los valores esperados de abajo están
 * resueltos a mano con el convenio que la app declara, que es el que usa de verdad.
 *
 * Los tres controles son <input type="range">, así que no admiten texto: el clamp del propio
 * control impide f = 0 (mínimo 2 cm) y distancias negativas (mínimo 2 cm). Los valores iniciales
 * son f = 8 cm, s = 15 cm, h = 2 cm; h NO se siembra en ningún caso porque ya vale 2 y sembrar
 * el valor que un input ya tiene no probaría nada.
 */

const SLIDER_F = 'input[aria-label="Distancia focal"]';
const SLIDER_S = 'input[aria-label="Distancia objeto"]';
const SLIDER_H = 'input[aria-label="Altura del objeto"]';

/** El valor de una tarjeta de resultados, localizado por su etiqueta (no por clase CSS). */
function valorDe(page: Page, etiqueta: string) {
  return page.getByText(etiqueta, { exact: true }).locator('xpath=following-sibling::span[1]');
}

/** El banner de clasificación (role="status"): título + chips. */
function clasificacion(page: Page) {
  return page.locator('[role="status"]');
}

test.describe('simulador-lentes-opticas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-lentes-opticas/');
    await esperarHidratacion(page, [SLIDER_F, SLIDER_S, SLIDER_H]);
  });

  test('convergente con el objeto fuera del foco: imagen real, invertida y reducida', async ({ page }) => {
    // f = +10 cm, s = 30 cm, h = 2 cm
    //   1/s' = 1/f − 1/s = 1/10 − 1/30 = 1/15  →  s' = +15,00 cm (real, al otro lado)
    //   M = −s'/s = −15/30 = −0,500  (invertida, la mitad de tamaño)
    //   h' = M · h = −0,500 · 2 = −1,00 cm
    //   P = 1/0,10 m = +10,00 dioptrías
    await sembrarValor(page, SLIDER_F, 10);
    await sembrarValor(page, SLIDER_S, 30);

    await expect(valorDe(page, "Distancia imagen (s')")).toHaveText('15,00 cm');
    await expect(valorDe(page, 'Aumento (M = −s\'/s)')).toHaveText('−0,500');
    await expect(valorDe(page, "Altura imagen (h')")).toHaveText('−1,00 cm');
    await expect(valorDe(page, 'Potencia P = 1/f')).toHaveText('10,00 D');

    await expect(clasificacion(page)).toContainText('Imagen real');
    await expect(clasificacion(page)).toContainText('Invertida');
    await expect(clasificacion(page)).toContainText('Reducida (×0,50)');
  });

  test('convergente con el objeto dentro del foco (lupa): imagen virtual, derecha y doble', async ({ page }) => {
    // f = +10 cm, s = 5 cm, h = 2 cm  →  el objeto está DENTRO de la distancia focal
    //   1/s' = 1/10 − 1/5 = −1/10  →  s' = −10,00 cm (virtual, al MISMO lado que el objeto)
    //   M = −s'/s = −(−10)/5 = +2,000  (derecha, el doble de tamaño)
    //   h' = +2,000 · 2 = +4,00 cm
    // Es el caso que distingue una lupa de un proyector: si aquí saliera «real», el signo de s'
    // estaría mal leído.
    await sembrarValor(page, SLIDER_F, 10);
    await sembrarValor(page, SLIDER_S, 5);

    await expect(valorDe(page, "Distancia imagen (s')")).toHaveText('−10,00 cm');
    await expect(valorDe(page, 'Aumento (M = −s\'/s)')).toHaveText('2,000');
    await expect(valorDe(page, "Altura imagen (h')")).toHaveText('4,00 cm');

    await expect(clasificacion(page)).toContainText('Imagen virtual');
    await expect(clasificacion(page)).toContainText('Derecha');
    await expect(clasificacion(page)).toContainText('Aumentada (×2,00)');
  });

  test('divergente: siempre imagen virtual, derecha y menor, con potencia negativa', async ({ page }) => {
    // Lente divergente  →  f = −10 cm, s = 30 cm, h = 2 cm
    //   1/s' = 1/(−10) − 1/30 = −4/30  →  s' = −7,50 cm (virtual)
    //   M = −s'/s = 7,5/30 = +0,250  (derecha, la cuarta parte)
    //   h' = +0,250 · 2 = +0,50 cm
    //   P = 1/(−0,10 m) = −10,00 dioptrías
    // Una divergente NUNCA da imagen real con un objeto real: si apareciera «Real», sería un
    // error de signo de f.
    await page.getByRole('button', { name: /Divergente/ }).click();
    await sembrarValor(page, SLIDER_F, 10);
    await sembrarValor(page, SLIDER_S, 30);

    await expect(valorDe(page, 'Distancia focal f')).toHaveText('−10,00 cm');
    await expect(valorDe(page, "Distancia imagen (s')")).toHaveText('−7,50 cm');
    await expect(valorDe(page, 'Aumento (M = −s\'/s)')).toHaveText('0,250');
    await expect(valorDe(page, "Altura imagen (h')")).toHaveText('0,50 cm');
    await expect(valorDe(page, 'Potencia P = 1/f')).toHaveText('−10,00 D');

    await expect(clasificacion(page)).toContainText('Imagen virtual');
    await expect(clasificacion(page)).toContainText('Derecha');
    await expect(clasificacion(page)).toContainText('Reducida (×0,25)');
  });

  test('objeto en el foco (s = f): imagen al infinito, sin colgar la pestaña', async ({ page }) => {
    // f = +10 cm, s = 10 cm  →  1/s' = 1/10 − 1/10 = 0: los rayos salen paralelos y NO hay
    // imagen que situar. Es la división por cero del motor; esta guarda comprueba que la app la
    // nombra, no imprime una cifra inventada y sigue respondiendo después.
    await sembrarValor(page, SLIDER_F, 10);
    await sembrarValor(page, SLIDER_S, 10);

    await expect(clasificacion(page)).toContainText('Imagen al infinito');
    await expect(valorDe(page, "Distancia imagen (s')")).toHaveText('∞ cm');

    // La pestaña sigue viva y el simulador vuelve a calcular al mover el objeto fuera del foco.
    await sembrarValor(page, SLIDER_S, 30);
    await expect(valorDe(page, "Distancia imagen (s')")).toHaveText('15,00 cm');
  });
});
