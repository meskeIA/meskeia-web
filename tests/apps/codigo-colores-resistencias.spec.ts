/**
 * codigo-colores-resistencias — origen: /nueva-app-meskeia (PASO 4.bis), 05/11/2026, S0251.
 * También cubre el cambio de calculadora-resistencias-led, que pasó a usar el mismo motor.
 *
 * El cálculo está probado aparte (tests/codigo-colores-resistencias-motor.spec.ts). Aquí se
 * miran las TRANSICIONES de la vista: los dos modos, el cambio de número de bandas (cada uno
 * guarda sus colores), la lectura al revés que aparece y desaparece, y el botón «Ver colores»
 * del paso inverso, que reescribe la caja de texto. Valores esperados, a mano:
 *   amarillo-violeta-rojo-dorado = 47 × 100 = 4,7 kΩ ±5 %
 *   con el multiplicador naranja = 47 × 1.000 = 47 kΩ
 *   amarillo-marrón-rojo-dorado = 41 × 100 = 4,1 kΩ: no está en E24 (39, 43), aviso
 *   5 bandas marrón-negro-negro-marrón-marrón = 1 kΩ ±1 %; al revés, 110 Ω
 *   3 bandas rojo-rojo-naranja = 22 kΩ ±20 %
 *   1234 con 4 bandas → 12 × 100 = 1,2 kΩ (redondeo); su E12 más cercano es 1,2 kΩ, que está en
 *   E12 y E24 pero NO en E6 (1,0 · 1,5 · 2,2…)
 *   LED: (5 − 2) / 0,02 = 150 Ω → E12 150 Ω = marrón-verde-marrón-dorado
 */
import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

const URL = '/codigo-colores-resistencias/';

/** Clic que se repite hasta que React lo atiende (el modo «leer» no tiene input de testigo). */
async function pulsarHastaQue(page: Page, nombre: string | RegExp, comprobar: () => Promise<void>) {
  await expect(async () => {
    await page.getByRole('button', { name: nombre, exact: typeof nombre === 'string' }).first().click();
    await comprobar();
  }).toPass({ timeout: 15000 });
}

function banda(page: Page, leyenda: string) {
  return page.locator('fieldset').filter({ has: page.locator('legend', { hasText: leyenda }) });
}

test.describe('De los colores al valor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('arranca en 4 bandas con 4,7 kΩ ±5 % y sin lectura al revés', async ({ page }) => {
    const resultado = page.locator('[aria-live="polite"]').first();
    await expect(resultado).toContainText(/4,7\s*kΩ/);
    await expect(resultado).toContainText(/±5\s*%/);
    await expect(resultado).toContainText('E6, E12 y E24');
    await expect(page.getByText('Leída desde el otro extremo')).toHaveCount(0);
  });

  test('cambiar el multiplicador a naranja da 47 kΩ', async ({ page }) => {
    const resultado = page.locator('[aria-live="polite"]').first();
    await expect(async () => {
      await banda(page, 'Banda 3 · Multiplicador').getByRole('button', { name: /^Naranja/ }).click();
      await expect(resultado).toContainText(/47\s*kΩ/);
    }).toPass({ timeout: 15000 });
    await expect(banda(page, 'Banda 3 · Multiplicador').getByRole('button', { name: /^Naranja/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('un valor fuera de las series avisa de una posible mala lectura', async ({ page }) => {
    const resultado = page.locator('[aria-live="polite"]').first();
    await expect(async () => {
      await banda(page, 'Banda 2 · 2.ª cifra').getByRole('button', { name: /^Marrón/ }).click();
      await expect(resultado).toContainText(/4,1\s*kΩ/);
    }).toPass({ timeout: 15000 });
    await expect(resultado).toContainText('no está en ninguna serie normalizada');
  });

  test('5 bandas: 1 kΩ ±1 % y la lectura al revés de 110 Ω; al volver a 4, desaparece', async ({ page }) => {
    const resultado = page.locator('[aria-live="polite"]').first();
    await pulsarHastaQue(page, '5 bandas', async () => {
      await expect(resultado).toContainText(/^1\s*kΩ/);
    });
    await expect(resultado).toContainText(/±1\s*%/);
    await expect(page.getByText('Leída desde el otro extremo')).toBeVisible();
    await expect(resultado).toContainText(/Sería 110\s*Ω/);

    await page.getByRole('button', { name: '4 bandas', exact: true }).click();
    await expect(resultado).toContainText(/4,7\s*kΩ/);
    await expect(page.getByText('Leída desde el otro extremo')).toHaveCount(0);
  });

  test('3 bandas: 22 kΩ con el ±20 % implícito', async ({ page }) => {
    const resultado = page.locator('[aria-live="polite"]').first();
    await pulsarHastaQue(page, '3 bandas', async () => {
      await expect(resultado).toContainText(/22\s*kΩ/);
    });
    await expect(resultado).toContainText(/±20\s*%/);
    await expect(resultado).toContainText('Sin banda de tolerancia');
  });
});

test.describe('Del valor a los colores', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await pulsarHastaQue(page, /Del valor a los colores/, async () => {
      await expect(page.locator('#valorResistencia')).toBeVisible();
    });
    await esperarHidratacion(page, ['#valorResistencia']);
  });

  test('4k7 da amarillo, violeta, rojo y dorado', async ({ page }) => {
    const lista = page.locator('ol li');
    await expect(lista).toHaveCount(4);
    await expect(lista.nth(0)).toContainText('Amarillo');
    await expect(lista.nth(1)).toContainText('Violeta');
    await expect(lista.nth(2)).toContainText('Rojo');
    await expect(lista.nth(3)).toContainText('Dorado');
  });

  test('1234 se redondea a 1,2 kΩ y «Ver colores» del E12 reescribe la caja', async ({ page }) => {
    const caja = page.locator('#valorResistencia');
    await caja.fill('1234');
    await esperarValorEnReact(page, caja, '1234');
    await expect(page.getByText(/se redondea a 1,2\s*kΩ/)).toBeVisible();
    await expect(page.getByText(/no es un valor normalizado/)).toBeVisible();

    await page.locator('tr', { hasText: 'E12' }).getByRole('button', { name: /Ver los colores de 1,2\s*kΩ/ }).click();
    await expect(caja).toHaveValue('1,2k');
    await expect(page.getByText(/es un valor normalizado de la serie E12 y E24\./)).toBeVisible();
    await expect(page.locator('ol li').nth(1)).toContainText('Rojo');
  });

  test('un texto que no es un valor avisa en el role=alert', async ({ page }) => {
    const caja = page.locator('#valorResistencia');
    await caja.fill('abc');
    await esperarValorEnReact(page, caja, 'abc');
    // getByRole('alert') a secas casa también con el anunciador de rutas de Next
    await expect(page.getByRole('region', { name: 'Escribe el valor' }).getByRole('alert')).toContainText('No reconozco');
    await expect(page.locator('ol li')).toHaveCount(0);
  });
});

test.describe('calculadora-resistencias-led usa el mismo motor', () => {
  test('5 V, 2 V y 20 mA: 150 Ω, sus colores y la fórmula en formato español', async ({ page }) => {
    await page.goto('/calculadora-resistencias-led/');
    await esperarHidratacion(page, ['#vcc']);
    await expect(page.getByText(/Colores de una de 150\s*Ω/)).toBeVisible();
    await expect(page.getByText('Fórmula:').locator('..')).toContainText('(5,00 − 2,00) / 0,020');
    const nombres = await page.locator('[class*="listaColores"] li').allTextContents();
    expect(nombres).toEqual(['Marrón', 'Verde', 'Marrón', 'Dorado']);
  });

  test('97 Ω exactos recomiendan 100 Ω de la década siguiente, no 82 Ω', async ({ page }) => {
    // (5 − 2) / I = 97 → I = 3/97 A ≈ 30,93 mA; con 30,928 mA sale 97,0 Ω
    await page.goto('/calculadora-resistencias-led/');
    await esperarHidratacion(page, ['#iled']);
    const corriente = page.locator('#iled');
    await corriente.fill('30,928');
    await esperarValorEnReact(page, corriente, '30,928');
    await expect(page.getByText(/Colores de una de 100\s*Ω/)).toBeVisible();
  });
});
