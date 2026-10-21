import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Calculadora de Legibilidad — test de regresión (cabo C0276, 17/10/2026)
 *
 * QUÉ SE REPARÓ
 *   · El índice Flesch-Szigriszt llevaba 1,02 como coeficiente de palabras/frase. La fórmula
 *     publicada (Barrio-Cantalejo y otros, An. Sist. Sanit. Navar. 2008;31(2):135-152, apdo.
 *     «Material y métodos») es IFSZ = 206,835 − 62,3 × (sílabas/palabra) − palabras/frases.
 *   · «INFLESZ» se pintaba como un tercer índice con el MISMO número que Flesch-Szigriszt y se
 *     leía con una escala inventada de seis tramos (80/65/50/35/20). INFLESZ es la escala de
 *     cinco tramos del mismo artículo: Muy difícil <40 · Algo difícil 40-55 · Normal 55-65 ·
 *     Bastante fácil 65-80 · Muy fácil >80, con 55 como umbral para textos de salud.
 *
 * DE DÓNDE SALE CADA VALOR ESPERADO (calculado antes de abrir el navegador)
 *   CASO 1 — 20 palabras en UNA frase: 15 de dos sílabas sin diptongo (casa, perro, mesa, gato,
 *   libro, verde, lado, mano, pelo, rojo, sopa, cama, taza, vaso, nube) y 5 de tres (camino,
 *   pelota, ventana, zapato, cabeza) → 45 sílabas · sílabas/palabra = 2,25 · palabras/frase = 20
 *       IFSZ = 206,835 − 62,3 × 2,25 − 20 = 206,835 − 140,175 − 20 = 46,66 → «46,7»
 *       (con el 1,02 de antes: 46,26 → «46,3»)
 *       Fernández Huerta = 206,84 − 60 × 2,25 − 1,02 × 20 = 51,44 → «51,4»
 *       INFLESZ: 46,66 cae en 40-55 → «Algo difícil», por debajo del umbral de 55
 *   CASO 2 — las 10 primeras palabras de dos sílabas en UNA frase → 20 sílabas · 2 · 10
 *       IFSZ = 206,835 − 124,6 − 10 = 72,235 → «72,2» (antes: 72,035 → «72,0»)
 *       Fernández Huerta = 206,84 − 120 − 10,2 = 76,64 → «76,6»
 *       INFLESZ: 72,235 cae en 65-80 → «Bastante fácil» (la escala vieja decía «Fácil»)
 */

const AREA = 'textarea';

const CASO_1 =
  'Casa perro mesa gato libro verde lado mano pelo rojo sopa cama taza vaso nube camino pelota ventana zapato cabeza.';
const CASO_2 = 'Casa perro mesa gato libro verde lado mano pelo rojo.';

async function analizar(page: Page, texto: string) {
  await page.locator(AREA).fill(texto);
  await esperarValorEnReact(page, AREA, texto);
  // El panel de resultados es el bloque más interno que contiene su encabezado
  return page
    .locator('div', { has: page.getByRole('heading', { name: 'Análisis de legibilidad' }) })
    .last();
}

test.describe('calculadora-legibilidad', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-legibilidad/');
    await esperarHidratacion(page, [AREA]);
  });

  test('CASO 1: Flesch-Szigriszt con coeficiente 1 y grado INFLESZ «Algo difícil»', async ({ page }) => {
    const panel = await analizar(page, CASO_1);
    await expect(panel).toContainText('20'); // palabras
    await expect(panel).toContainText('45'); // sílabas
    await expect(panel).toContainText('46,7');
    await expect(panel).not.toContainText('46,3');
    await expect(panel).toContainText('51,4');
    await expect(panel).toContainText('Algo difícil');
    await expect(panel).toContainText('Por debajo de 55');
  });

  test('CASO 2: escala INFLESZ de cinco tramos («Bastante fácil», no «Fácil»)', async ({ page }) => {
    const panel = await analizar(page, CASO_2);
    await expect(panel).toContainText('72,2');
    await expect(panel).not.toContainText('72,0');
    await expect(panel).toContainText('76,6');
    await expect(panel).toContainText('Bastante fácil');
    await expect(panel).toContainText('Supera 55');
  });

  /*
   * S0218 (21/10/2026) — la app SEÑALA dónde está la dificultad y compara dos versiones.
   *   Texto: una frase de 30 palabras de dos sílabas + «Casa perro mesa gato maravilla.»
   *   (maravilla = 4 sílabas) → P = 35 · F = 2 · S = 72
   *     IFSZ = 206,835 − 62,3 × 72/35 − 35/2 = 61,175 → «61,2»
   *     partida la de 30 en 2: F = 3 → 206,835 − 128,16 − 11,667 = 67,008 → «67,0», «+5,8»
   *   Al reescribirla de verdad en dos de 15, la comparación debe dar lo mismo que predijo.
   */
  const DIEZ = 'casa perro mesa gato libro verde lado mano pelo rojo'.split(' ');
  const trozo = (desde: number, n: number) =>
    Array.from({ length: n }, (_, i) => DIEZ[(desde + i) % 10]).join(' ');
  const frase = (desde: number, n: number) => {
    const t = trozo(desde, n);
    return t.charAt(0).toUpperCase() + t.slice(1) + '.';
  };
  const CORTA = 'Casa perro mesa gato maravilla.';
  const ORIGINAL = `${frase(0, 30)} ${CORTA}`;
  const REESCRITO = `${frase(0, 15)} ${frase(15, 15)} ${CORTA}`;

  test('CASO 4 (S0218): señala la frase de 30 palabras, lo que ganaría al partirla y «maravilla»', async ({ page }) => {
    const panel = await analizar(page, ORIGINAL);
    await expect(panel).toContainText('61,2');
    const seccion = page.locator('section', { has: page.getByRole('heading', { name: 'Dónde está la dificultad' }) });
    await expect(seccion).toContainText('1 frase de más de 25 palabras');
    await expect(seccion).toContainText('30 palabras. Partida en 2 frases de 20 palabras como mucho');
    await expect(seccion).toContainText('pasaría de 61,2 a 67,0 (+5,8)');
    await expect(seccion).toContainText('1 palabra de 4 sílabas o más: maravilla');
    // El texto resaltado es el texto entero, y la frase larga va en su propia marca
    const marcado = page.getByTestId('texto-marcado');
    await expect(marcado).toHaveText(ORIGINAL);
    await expect(marcado.locator('span', { hasText: frase(0, 30) })).toHaveCount(1);
  });

  test('CASO 5 (S0218): guardar, reescribir y comparar da lo que se había predicho', async ({ page }) => {
    await analizar(page, ORIGINAL);
    await page.getByRole('button', { name: 'Guardar esta versión para comparar' }).click();
    await analizar(page, REESCRITO);
    const tabla = page.locator('table', { has: page.getByRole('columnheader', { name: 'Guardada' }) });
    await expect(tabla.getByRole('row', { name: /Flesch-Szigriszt/ })).toContainText('61,267,0+5,8');
    await expect(tabla.getByRole('row', { name: /Frases de más de 25/ })).toContainText('10−1');
    await expect(tabla.getByRole('row', { name: /Palabras por frase/ })).toContainText('17,511,7−5,8');
    await expect(tabla.getByRole('row', { name: /Grado INFLESZ/ })).toContainText('NormalBastante fácilcambia');
    // Ya no queda frase larga que señalar
    const seccion = page.locator('section', { has: page.getByRole('heading', { name: 'Dónde está la dificultad' }) });
    await expect(seccion).not.toContainText('frase de más de 25 palabras');
    await page.getByRole('button', { name: 'Olvidar la guardada' }).click();
    await expect(tabla).toHaveCount(0);
  });

  test('CASO 3: la guía muestra los cinco tramos INFLESZ', async ({ page }) => {
    const guia = page
      .locator('div', { has: page.getByRole('heading', { name: /escala INFLESZ/ }) })
      .last();
    for (const tramo of ['80-100', '65-79', '55-64', '40-54', '0-39']) {
      await expect(guia).toContainText(tramo);
    }
    await expect(guia).not.toContainText('20-34');
  });
});
