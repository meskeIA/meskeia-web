import { test, expect, Page } from '@playwright/test';

/**
 * estimador-irpf-pensionista — candado del método del art. 63.1.2.º LIRPF
 * Escrita el 12/09/2026.
 *
 * QUÉ VIGILA
 * ──────────
 * Esta app YA aplicaba bien el art. 63.1.2.º —escala sobre la base completa menos escala sobre
 * el mínimo— cuando se auditaron las 19 que iteran la escala a mano. No tenía el defecto, pero
 * sí tenía la fórmula COPIADA, que es de donde salieron los otros siete casos: cada copia puede
 * divergir por su cuenta y nada avisa. El 12/09/2026 pasó a llamar a `calcularCuotaIntegraGeneral`
 * de `data/fiscal/irpf.ts`, y este spec es el candado de que la migración no cambió el resultado.
 *
 * De paso se corrigió un borde real: la app aplicaba la escala al mínimo ENTERO sin acotarlo a
 * la base, de modo que con una pensión por debajo del mínimo la resta daba negativo y solo un
 * `Math.max(0, …)` lo tapaba. La función canónica acota el mínimo a la base (art. 56.2: el
 * mínimo forma parte de la base «hasta el importe de esta última»), que es lo que dice la norma.
 *
 * DE DÓNDE SALE CADA CIFRA — de la norma, NO de lo que devuelve la app
 * ───────────────────────────────────────────────────────────────────
 *   · escala art. 63: 12.450 @19 % · 20.200 @24 % · 35.200 @30 % …
 *   · mínimo del contribuyente, art. 57: 5.550 € · 6.700 € desde 65 años · 8.100 € desde 75
 *   · gastos art. 19.2.f: 2.000 €
 *   · reducción art. 20 (redacción RDL 4/2024): 7.302 € hasta 14.852 € de RNT; entre 14.852 y
 *     17.673,52 €, 7.302 − 1,75 × (RNT − 14.852); entre 17.673,52 y 19.747,5 €,
 *     2.364,34 − 1,14 × (RNT − 17.673,52); desde 19.747,5 €, cero.
 */

const RUTA = '/estimador-irpf-pensionista/';

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/** Importe de una fila del resultado, localizada por su etiqueta exacta. */
async function fila(page: Page, etiqueta: string): Promise<string> {
  const f = page.locator(`css=div:has(> span:text-is("${etiqueta}"))`).first();
  return limpiar(await f.locator('span').nth(1).innerText());
}

async function estimar(page: Page, pension: string, edad: string): Promise<void> {
  await page.locator('#tramoEdad').selectOption(edad);
  await page.getByLabel('Pensión mensual bruta (€/mes)').fill(pension);
  await page.getByRole('button', { name: 'Estimar IRPF pensionista' }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estimador IRPF Pensionista');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 · 1.500 €/mes, 67 años — el mínimo de 6.700 € a tipo cero', async ({ page }) => {
  // Rendimientos íntegros = 1.500 × 14 = 21.000,00 €
  // Rendimiento neto tras art. 19 = 21.000 − 2.000 = 19.000,00 €
  // Reducción art. 20 (tramo 17.673,52-19.747,5): 2.364,34 − 1,14 × (19.000 − 17.673,52)
  //   = 2.364,34 − 1,14 × 1.326,48 = 2.364,34 − 1.512,1872 = 852,1528 → 852,15 €
  // Base imponible = 19.000 − 852,15 = 18.147,85 €, CON el mínimo de 6.700 € dentro.
  //   escala(18.147,85) = 12.450×19 % + 5.697,85×24 % = 2.365,50 + 1.367,484 = 3.732,984 €
  //   escala(6.700)     = 6.700×19 %                  = 1.273,00 €
  //   cuota íntegra     = 2.459,984 → 2.459,98 €
  // IRPF mensual en 14 pagas = 175,713… → pensión neta 1.324,29 €/mes
  //
  // Si el mínimo se restara de la base: escala(18.147,85 − 6.700) = escala(11.447,85)
  //   = 2.175,09 €, es decir 284,89 € menos. El error es pequeño aquí porque casi todo el
  //   mínimo cae en el primer tramo; crece con la pensión.
  await estimar(page, '1500', '65_74');

  expect(await fila(page, 'Rendimientos íntegros totales (anuales)')).toBe('21.000,00 €');
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-852,15 €');
  expect(await fila(page, 'Base imponible estimada')).toBe('18.147,85 €');
  expect(await fila(page, 'Mínimo personal (edad)')).toBe('6700,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('2459,98 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1324,29 €/mes');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 (borde) · pensión por debajo del mínimo: cuota cero, nunca negativa', async ({ page }) => {
  // 400 €/mes × 14 = 5.600,00 € íntegros. Tras los 2.000 € del art. 19 quedan 3.600,00 €, y
  // la reducción del art. 20 (7.302 € por estar bajo 14.852 €) se los come enteros:
  // base imponible 0,00 €.
  //
  // Art. 56.2: el mínimo se aplica «hasta el importe de esta última», así que sobre una base
  // de 0 € la cuota es 0 €. Aplicar la escala al mínimo de 8.100 € sin acotarlo daría una
  // resta negativa, que es justo lo que la función canónica evita acotando el mínimo a la base.
  await estimar(page, '400', '75_mas');

  expect(await fila(page, 'Base imponible estimada')).toBe('0,00 €');
  expect(await fila(page, 'Mínimo personal (edad)')).toBe('8100,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('0,00 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('400,00 €/mes');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 3 · el mínimo por edad mueve la cuota, y lo hace al 19 %', async ({ page }) => {
  // Misma pensión, dos edades. La diferencia entre el mínimo de 65-74 (6.700 €) y el de 75+
  // (8.100 €) son 1.400 €, que bajo el art. 63.1.2.º se valoran SIEMPRE al tipo del tramo en
  // que cae el mínimo — aquí el primero, 19 % — y no al marginal del pensionista.
  //   1.400 × 19 % = 266,00 € exactos de diferencia en la cuota.
  // Con el método defectuoso la diferencia habría sido 1.400 × 24 % = 336,00 €, porque el
  // marginal de esta base está en el segundo tramo.
  await estimar(page, '1800', '65_74');
  const con67 = await fila(page, 'Cuota IRPF estimada anual');

  await estimar(page, '1800', '75_mas');
  const con76 = await fila(page, 'Cuota IRPF estimada anual');

  const num = (s: string) => Number(s.replace(' €', '').replace(/\./g, '').replace(',', '.'));
  expect(num(con67) - num(con76)).toBeCloseTo(266, 2);
});
