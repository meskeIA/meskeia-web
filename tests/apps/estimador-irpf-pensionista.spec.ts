import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * estimador-irpf-pensionista — candado del método del art. 63.1.2.º LIRPF
 * Escrita el 12/09/2026. Ampliada el 20/09/2026 por el Inspector (casos 4 a 6).
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
 *     (`TRAMOS_IRPF_2025` de `data/fiscal/irpf.ts`)
 *   · mínimo del contribuyente, art. 57: 5.550 € · 6.700 € desde 65 años · 8.100 € desde 75
 *     (`MINIMOS_IRPF_2025.personal` / `.personal_65` / `.personal_75`)
 *   · gastos art. 19.2.f: 2.000 € (`GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral`)
 *   · reducción art. 20 (redacción RDL 4/2024): 7.302 € hasta 14.852 € de RNT; entre 14.852 y
 *     17.673,52 €, 7.302 − 1,75 × (RNT − 14.852); entre 17.673,52 y 19.747,5 €,
 *     2.364,34 − 1,14 × (RNT − 17.673,52); desde 19.747,5 €, cero.
 *     (`REDUCCION_RENDIMIENTOS_TRABAJO_2025` / `calcularReduccionRendimientosTrabajo`)
 *
 * LO QUE ESTE SPEC **NO** CUBRE — hallazgos abiertos del Inspector (20/09/2026)
 * ───────────────────────────────────────────────────────────────────────────
 * Aquí no hay caso que los fije porque el Inspector no repara y un test no debe consagrar el
 * defecto. Quedan nombrados para quien los repare:
 *   1. El millar español se lee como decimal. La app parsea con
 *      `parseFloat(x.replace(',', '.'))` en vez de `parseSpanishNumber` de `@/lib`: un rescate
 *      escrito «30.000» se computa como 30 € y el campo NO se reescribe, así que nada avisa.
 *   2. La reducción del art. 20 se aplica aunque el contribuyente declare rentas distintas de
 *      las del trabajo por encima de los 6.500 € que exige la norma — condición que
 *      `data/fiscal/irpf.ts` advierte expresamente que NO modela.
 *   3. La guarda «entre 100 y 10.000 €» de `calcular()` no llega a rechazar nada: el control
 *      acota el valor al límite al perder el foco, y el foco se pierde al pulsar el botón.
 *      Detalle y casos, al final del CASO 6.
 */

const RUTA = '/estimador-irpf-pensionista/';

/** Los tres campos numéricos. Sin ellos hidratados, escribir no llegaría al estado de React. */
const CAMPOS = [
  'input[aria-label="Pensión mensual bruta (€/mes)"]',
  'input[aria-label="Rescate de plan de pensiones este año (€)"]',
  'input[aria-label="Otros ingresos anuales sujetos a IRPF (€/año)"]',
] as const;

const SEL_PENSION = CAMPOS[0];

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
  // `fill()` llega a React por el navegador, pero no si la app aún no responde: sin este
  // testigo el test seguiría adelante midiendo la pensión anterior.
  await esperarValorEnReact(page, SEL_PENSION, pension);
  await page.getByRole('button', { name: 'Estimar IRPF pensionista' }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estimador IRPF Pensionista');
  await esperarHidratacion(page, CAMPOS);
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

// ─────────────────────────────────────────────────────────────────────────────
// Casos 4 a 6 — Inspector, 20/09/2026. Resueltos a mano ANTES de abrir la app, con la escala
// y los mínimos leídos de `data/fiscal/irpf.ts`.
// ─────────────────────────────────────────────────────────────────────────────

test('CASO 4 (normal) · 1.400 €/mes, 68 años — la cadena completa art. 19 → art. 20 → art. 63.1.2.º', async ({ page }) => {
  // Pensión de jubilación en 14 pagas (12 mensualidades + 2 extraordinarias).
  //
  //   Rendimientos íntegros    1.400 × 14                      = 19.600,00 €
  //   − gastos art. 19.2.f                                     =  2.000,00 €
  //   Rendimiento neto del trabajo (RNT)                       = 17.600,00 €
  //   − reducción art. 20 (RNT entre 14.852 y 17.673,52 → primer tramo decreciente):
  //       7.302 − 1,75 × (17.600 − 14.852) = 7.302 − 4.809,00  =  2.493,00 €
  //   Base imponible (CON el mínimo dentro, art. 63.1.2.º)     = 15.107,00 €
  //   Mínimo del contribuyente de 65 a 74 años (art. 57.2)     =  6.700,00 €
  //
  //   escala(15.107,00) = 12.450×19 % + 2.657,00×24 % = 2.365,50 + 637,68 = 3.003,18 €
  //   escala(6.700,00)  = 6.700×19 %                                      = 1.273,00 €
  //   cuota íntegra     = 3.003,18 − 1.273,00                             = 1.730,18 €
  //
  //   Tipo efectivo = 1.730,18 / 19.600 = 8,8274… % → 8,8 %
  //   Pensión neta  = 1.400 − 1.730,18/14 = 1.400 − 123,5843 = 1.276,42 €/mes
  //
  // Si el mínimo se restara de la base —el defecto que vigila `npm run check:minimo-irpf`—
  // saldría escala(15.107 − 6.700) = escala(8.407) = 1.597,33 €, o sea 132,85 € menos.
  await estimar(page, '1400', '65_74');

  expect(await fila(page, 'Rendimientos íntegros totales (anuales)')).toBe('19.600,00 €');
  expect(await fila(page, 'Gastos deducibles generales')).toBe('-2000,00 €');
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-2493,00 €');
  expect(await fila(page, 'Base imponible estimada')).toBe('15.107,00 €');
  expect(await fila(page, 'Mínimo personal (edad)')).toBe('6700,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('1730,18 €');
  expect(await fila(page, 'Tipo efectivo estimado')).toBe('8,8%');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1276,42 €/mes');
});

test('CASO 5 (borde) · 75 años: la base cae EXACTAMENTE en el mínimo de 8.100 €', async ({ page }) => {
  // El punto en que un pensionista de 75 años empieza a pagar. No se elige por tanteo: se
  // despeja de la propia norma.
  //
  // Con RNT entre 14.852 y 17.673,52 la base vale RNT − [7.302 − 1,75 × (RNT − 14.852)],
  // es decir 2,75 × RNT − 33.293. Igualada al mínimo del art. 57.2 para 75 años o más
  // (8.100 €): RNT = 15.052,00 €, o sea 17.052,00 € íntegros = 1.218,00 €/mes en 14 pagas.
  //
  //   Rendimientos íntegros    1.218 × 14                      = 17.052,00 €
  //   − gastos art. 19.2.f                                     =  2.000,00 €
  //   RNT                                                      = 15.052,00 €
  //   − reducción art. 20: 7.302 − 1,75 × (15.052 − 14.852) = 7.302 − 350,00 = 6.952,00 €
  //   Base imponible                                           =  8.100,00 €
  //   Mínimo 75+ (art. 57.2)                                   =  8.100,00 €
  //   cuota = escala(8.100) − escala(8.100) = 0,00 € exactos → la pensión sale íntegra.
  await estimar(page, '1218', '75_mas');

  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-6952,00 €');
  expect(await fila(page, 'Base imponible estimada')).toBe('8100,00 €');
  expect(await fila(page, 'Mínimo personal (edad)')).toBe('8100,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('0,00 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1218,00 €/mes');

  // Un euro más al mes y la cuota deja de ser cero, al 19 % del primer tramo:
  //   1.219 × 14 = 17.066 → RNT 15.066 → reducción 7.302 − 1,75 × 214 = 6.927,50 €
  //   base 8.138,50 € → cuota (8.138,50 − 8.100) × 19 % = 38,50 × 0,19 = 7,315 → 7,32 €
  // Se comprueba que el borde es ese y no otro: si la app acotara mal el mínimo, o si lo
  // restara de la base, este euro no produciría exactamente 7,32 €.
  await estimar(page, '1219', '75_mas');
  expect(await fila(page, 'Base imponible estimada')).toBe('8138,50 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('7,32 €');
});

test('CASO 6 (rechazo) · sin pensión no se estima nada: aviso y ningún número', async ({ page }) => {
  // Una app fiscal no puede inventarse una cifra cuando falta el dato: o calcula, o no da
  // número. Aquí se comprueban las dos mitades — que avisa, y que NO publica resultado.
  const aviso = page.locator('[role="alert"]').filter({ hasText: 'Introduce tu pensión mensual bruta' });
  const cuotaEnPantalla = page.locator('css=span:text-is("Cuota IRPF estimada anual")');

  await page.getByRole('button', { name: 'Estimar IRPF pensionista' }).click();

  await expect(aviso).toBeVisible();
  await expect(aviso).toHaveAttribute('aria-live', 'polite');

  // El bloque de resultados sigue sin montarse: no hay ninguna cuota en pantalla.
  await expect(page.getByText('Introduce tus datos y pulsa el botón')).toBeVisible();
  expect(await cuotaEnPantalla.count()).toBe(0);

  // Las letras no llegan siquiera al campo: el control solo admite /^-?[\d.,]*$/, así que
  // teclear «abc» lo deja vacío y se vuelve a rechazar igual.
  await page.locator(SEL_PENSION).pressSequentially('abc');
  await esperarValorEnReact(page, SEL_PENSION, '');
  await page.getByRole('button', { name: 'Estimar IRPF pensionista' }).click();
  await expect(aviso).toBeVisible();
  expect(await cuotaEnPantalla.count()).toBe(0);

  // ⚠️ El campo vacío es el ÚNICO rechazo que esta app llega a ejecutar, y el test no
  // puede fijar más. `NumberInput` acota el valor a [min, max] al perder el foco, y el
  // foco se pierde justo al pulsar el botón, así que la guarda «entre 100 y 10.000 €» de
  // `calcular()` recibe siempre un valor ya dentro del rango y nunca rechaza nada:
  //   «12» → el campo pasa a 100 y se publica «Pensión neta mensual estimada 100,00 €/mes»
  //   «-500» → idéntico, 100,00 €/mes
  //   «99999» → el campo pasa a 10.000 y se publica una cuota de 51.728,50 €
  // Medido el 20/09/2026 por el Inspector. Queda nombrado, no fijado: fijarlo consagraría
  // el defecto.
});
