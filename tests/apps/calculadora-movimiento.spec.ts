import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * calculadora-movimiento — simulador de MRU / MRUA / caída libre (S0179, 05/10/2026).
 *
 * Los números de cada caso están resueltos a mano en tests/cinematica-motor.spec.ts; aquí se
 * comprueba que la PANTALLA dice lo mismo que el motor: tarjetas, aviso de parada, lectura del
 * simulador en cada instante y el final de la animación.
 *
 * El caso que motivó el cambio: v₀ = 20 m/s, a = −5 m/s², t = 6 s. La app imprimía
 * «Distancia 30 m» (el desplazamiento) cuando el móvil recorre 50 m: 40 hasta pararse en
 * t = 4 s y 10 de vuelta.
 */

const RUTA = '/calculadora-movimiento/';

async function rellenar(page: Page, id: string, valor: string) {
  const campo = page.locator(`#${id}`);
  await campo.fill(valor);
  await esperarValorEnReact(page, `#${id}`, valor);
}

/** Valor de una tarjeta de resultado por su etiqueta exacta. */
function tarjeta(page: Page, etiqueta: string) {
  return page
    .locator('[class*="resultCard"]')
    .filter({ has: page.locator('[class*="resultLabel"]', { hasText: new RegExp(`^${etiqueta}$`) }) })
    .locator('[class*="resultValue"]');
}

const lectura = (page: Page) => page.locator('[class*="simLectura"]');

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#mov-v0', '#mov-t']);
});

test.describe('MRUA que frena, se para y vuelve', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole('button', { name: /MRUA/ }).click();
    await rellenar(page, 'mov-v0', '20');
    await rellenar(page, 'mov-a', '-5');
    await rellenar(page, 'mov-t', '6');
  });

  test('las tarjetas separan desplazamiento (30 m) y distancia recorrida (50 m)', async ({ page }) => {
    await expect(tarjeta(page, 'Desplazamiento \\(x\\)')).toHaveText('30,00');
    await expect(tarjeta(page, 'Distancia recorrida')).toHaveText('50,00');
    await expect(tarjeta(page, 'Velocidad final')).toHaveText('-10,00');
    await expect(page.locator('[class*="notaParada"]')).toContainText('Se detiene en t = 4,00 s, a 40,00 m');
  });

  test('el simulador arranca en el estado final y el deslizador lleva a cualquier instante', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Simulación del movimiento/ })).toBeVisible();
    await expect(lectura(page)).toContainText('t = 6,00 s');
    await expect(lectura(page)).toContainText('x = 30,00 m');
    await expect(lectura(page)).toContainText('v = -10,00 m/s');

    // En la parada: x = 40 m, v = 0
    const deslizador = page.getByRole('slider');
    await deslizador.fill('4');
    await expect(lectura(page)).toContainText('t = 4,00 s');
    await expect(lectura(page)).toContainText('x = 40,00 m');
    await expect(lectura(page)).toContainText('v = 0,00 m/s');

    await page.getByRole('button', { name: /Al inicio/ }).click();
    await expect(lectura(page)).toContainText('t = 0,00 s');
    await expect(lectura(page)).toContainText('x = 0,00 m');
    await expect(lectura(page)).toContainText('v = 20,00 m/s');
  });

  test('la animación avanza y se detiene sola al llegar a t = 6 s', async ({ page }) => {
    await page.getByRole('button', { name: /Al inicio/ }).click();
    await page.getByRole('button', { name: /^Reproducir$/ }).click();
    await expect(page.getByRole('button', { name: /Pausa/ })).toBeVisible();
    // 6 s de movimiento se animan en 6 s reales (entre 3 y 8)
    await expect(page.getByRole('button', { name: /Reproducir de nuevo/ })).toBeVisible({ timeout: 12_000 });
    await expect(lectura(page)).toContainText('t = 6,00 s');
    await expect(lectura(page)).toContainText('x = 30,00 m');
  });

  test('aviso de vuelta y tres gráficas con descripción accesible', async ({ page }) => {
    await expect(page.locator('[class*="simAviso"]')).toContainText('se detiene en t = 4,00 s');
    const graficas = page.locator('[class*="simGraficas"] svg[role="img"]');
    await expect(graficas).toHaveCount(3);
    await expect(graficas.nth(0)).toHaveAttribute('aria-label', /Posición–tiempo .*parábola/);
    await expect(graficas.nth(1)).toHaveAttribute('aria-label', /pasa de 20,00 m\/s a -10,00 m\/s/);
    await expect(graficas.nth(2)).toHaveAttribute('aria-label', /a vale -5,00 m\/s²/);
  });
});

test('MRU: sin aceleración, la gráfica x-t es una recta', async ({ page }) => {
  await rellenar(page, 'mov-v0', '10');
  await rellenar(page, 'mov-t', '5');
  await expect(tarjeta(page, 'Desplazamiento \\(x\\)')).toHaveText('50,00');
  await expect(tarjeta(page, 'Distancia recorrida')).toHaveText('50,00');
  await expect(page.locator('[class*="notaParada"]')).toHaveCount(0);
  await expect(page.locator('[class*="simGraficas"] svg[role="img"]').first()).toHaveAttribute('aria-label', /en línea recta/);
});

test('caída libre lanzada hacia arriba a 10 m/s durante 2 s: sigue 0,38 m por encima y recorre 9,81 m', async ({ page }) => {
  await page.getByRole('button', { name: /Caída/ }).click();
  await rellenar(page, 'mov-v0', '-10');
  await rellenar(page, 'mov-t', '2');
  // Eje hacia abajo · subida v₀²/(2g) = 100/19,62 = 5,0968 m · y(2) = −20 + 19,62 = −0,38 m
  // distancia = 5,0968 (sube) + 5,0968 − 0,38 (baja) = 9,8137 m
  // (No t = 3 s: y(3) = 14,145 justo en la mitad, y en coma flotante es 14,1449… → «14,14»)
  await expect(tarjeta(page, 'Desplazamiento vertical \\(y\\)')).toHaveText('-0,38');
  await expect(tarjeta(page, 'Distancia recorrida')).toHaveText('9,81');
  await expect(tarjeta(page, 'Aceleración')).toHaveText('9,81');
  await expect(lectura(page)).toContainText('y = -0,38 m');
  await expect(page.locator('[class*="simAviso"]')).toContainText('se detiene en t = 1,02 s');
});

test('tiro parabólico: sin simulador propio, enlaza al de proyectiles', async ({ page }) => {
  await page.getByRole('button', { name: /Parabólico/ }).click();
  await rellenar(page, 'mov-v0', '20');
  await rellenar(page, 'mov-angulo', '45');
  await expect(tarjeta(page, 'Alcance')).toHaveText('40,77');
  await expect(page.getByRole('heading', { name: /Simulación del movimiento/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'simulador de tiro parabólico' })).toHaveAttribute('href', '/simulador-proyectiles/');
});

test('un tiempo no válido no deja simulador colgado', async ({ page }) => {
  await rellenar(page, 'mov-t', '0');
  await expect(page.getByText('Introduce la velocidad inicial y un tiempo mayor que 0')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Simulación del movimiento/ })).toHaveCount(0);
});
