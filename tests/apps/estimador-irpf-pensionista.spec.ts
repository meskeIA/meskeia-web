import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * estimador-irpf-pensionista — candado del método del art. 63.1.2.º LIRPF y de la ENTRADA
 * Escrita el 12/09/2026. Ampliada el 20/09/2026 por el Inspector (casos 4 a 6) y convertida
 * ese mismo día en candado de la reparación (casos 7 a 11). Reinspeccionada el 25/09/2026,
 * tras el cambio del art. 20 en `data/fiscal` (8a6fb75b): casos 12 a 23. Reinspeccionada el
 * 03/10/2026, tras dbdaa228 (base del ahorro y contraste, hallazgos 2131-2136) y el re-sellado
 * de `data/fiscal/irpf.ts` (9bbc5c19): casos 25 a 41, con el texto de los arts. 7, 17, 20, 46,
 * 56 a 61, 82 y 96 y la DT 12.ª de la Ley 35/2006 cotejado ese día en el consolidado del BOE
 * (BOE-A-2006-20764).
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
 *   · escala art. 63: 12.450 @19 % · 20.200 @24 % · 35.200 @30 % · 60.000 @37 % …
 *     (`TRAMOS_IRPF_2025` de `data/fiscal/irpf.ts`)
 *   · mínimo del contribuyente, art. 57: 5.550 € · 6.700 € desde 65 años · 8.100 € desde 75
 *     (`MINIMOS_IRPF_2025.personal` / `.personal_65` / `.personal_75`)
 *   · gastos art. 19.2.f: 2.000 € (`GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral`)
 *   · reducción art. 20 (redacción RDL 4/2024): 7.302 € hasta 14.852 € de RNT; entre 14.852 y
 *     17.673,52 €, 7.302 − 1,75 × (RNT − 14.852); entre 17.673,52 y 19.747,5 €,
 *     2.364,34 − 1,14 × (RNT − 17.673,52); desde 19.747,5 €, cero.
 *     (`REDUCCION_RENDIMIENTOS_TRABAJO_2025` / `calcularRendimientoNetoTrabajo`). El rendimiento
 *     que decide el tramo es el íntegro menos los gastos de las letras a) a e) del art. 19.2 —una
 *     pensión no tiene ninguno—, SIN restar antes los 2.000 € de la letra f) (art. 20, último
 *     párrafo; hallazgo 1687, reparado el 25/09/2026). Casos 12 a 16.
 *   · límite de rentas ajenas al trabajo que exige esa reducción: 6.500 €
 *   · obligación de declarar, art. 96: 22.000 € con un pagador; 15.876 € con varios y un
 *     segundo por encima de 1.500 € (`OBLIGACION_DECLARAR_2025.trabajo`)
 *
 * LOS CUATRO DEFECTOS QUE EL INSPECTOR NOMBRÓ Y AQUÍ QUEDAN FIJADOS (20/09/2026)
 * ─────────────────────────────────────────────────────────────────────────────
 * Cuando se escribieron los casos 4 a 6 estos defectos estaban vivos y quedaron NOMBRADOS sin
 * caso, porque un test no debe consagrar el defecto. Reparados el mismo día, ahora cada uno
 * tiene su caso y este spec es lo que impide que vuelvan:
 *   1. El millar español se leía como decimal (`parseFloat(x.replace(',', '.'))` en vez de
 *      `parseSpanishNumber`): un rescate escrito «30.000» valía 30 € → CASO 7 y CASO 8.
 *   2. La reducción del art. 20 se aplicaba aunque hubiera rentas ajenas al trabajo por encima
 *      de 6.500 €, y esas rentas además engordaban el RNT que la gradúa → CASO 9.
 *   3. La guarda «entre 100 y 10.000 €» no rechazaba nunca, porque el control acotaba el valor
 *      al límite al perder el foco y el foco se pierde al pulsar el botón → CASO 6.
 *   4. La tabla y el FAQPage publicaban la redacción del art. 20 derogada por el RDL 4/2024
 *      —6.498 / 13.115 / 16.825 y una «reducción mínima de 2.364 €» inexistente— más un límite
 *      de 15.000 € y un mínimo de 75 años cifrado en 1.215 € → CASO 10 y CASO 11.
 */

const RUTA = '/estimador-irpf-pensionista/';

/**
 * El botón de calcular, por su nombre accesible. Admite el de hoy («Estimar IRPF pensionista»,
 * un `aria-label` que NO contiene el texto visible) y el que tendrá cuando se repare el CASO 32
 * («Estimar mi IRPF como pensionista»): así arreglar la etiqueta no rompe el resto del spec.
 */
const BOTON_ESTIMAR = /Estimar (mi )?IRPF (como )?pensionista/;

/**
 * Los cuatro campos numéricos. Sin ellos hidratados, escribir no llegaría al estado de React.
 * Hasta el 26/09/2026 eran tres: «Otras rentas anuales distintas del trabajo» mezclaba los
 * alquileres (base general) con intereses y dividendos (base del ahorro). Hallazgo 2131.
 */
const CAMPOS = [
  'input[aria-label="Pensión mensual bruta (€/mes)"]',
  'input[aria-label="Rescate de plan de pensiones este año (€)"]',
  'input[aria-label="Alquileres y otras rentas de la base general (€/año)"]',
  'input[aria-label="Intereses y dividendos (€/año)"]',
] as const;

const SEL_PENSION = CAMPOS[0];
const SEL_RESCATE = CAMPOS[1];
const SEL_OTRAS = CAMPOS[2];
const SEL_AHORRO = CAMPOS[3];

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/** Importe de una fila del resultado, localizada por su etiqueta exacta. */
async function fila(page: Page, etiqueta: string): Promise<string> {
  const f = page.locator(`css=div:has(> span:text-is("${etiqueta}"))`).first();
  return limpiar(await f.locator('span').nth(1).innerText());
}

interface Extras {
  rescate?: string;
  otrasRentas?: string;
  /** Intereses y dividendos: base del ahorro. */
  ahorro?: string;
}

async function estimar(page: Page, pension: string, edad: string, extras: Extras = {}): Promise<void> {
  await page.locator('#tramoEdad').selectOption(edad);
  await page.getByLabel('Pensión mensual bruta (€/mes)').fill(pension);
  // `fill()` llega a React por el navegador, pero no si la app aún no responde: sin este
  // testigo el test seguiría adelante midiendo la pensión anterior.
  await esperarValorEnReact(page, SEL_PENSION, pension);

  if (extras.rescate !== undefined) {
    await page.locator(SEL_RESCATE).fill(extras.rescate);
    await esperarValorEnReact(page, SEL_RESCATE, extras.rescate);
  }
  if (extras.otrasRentas !== undefined) {
    await page.locator(SEL_OTRAS).fill(extras.otrasRentas);
    await esperarValorEnReact(page, SEL_OTRAS, extras.otrasRentas);
  }
  if (extras.ahorro !== undefined) {
    await page.locator(SEL_AHORRO).fill(extras.ahorro);
    await esperarValorEnReact(page, SEL_AHORRO, extras.ahorro);
  }

  await page.getByRole('button', { name: BOTON_ESTIMAR }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estimador IRPF Pensionista');
  await esperarHidratacion(page, CAMPOS);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 · 1.500 €/mes, 67 años — el mínimo de 6.700 € a tipo cero', async ({ page }) => {
  // Rendimientos íntegros = 1.500 × 14 = 21.000,00 €
  // Reducción art. 20: se mide sobre los íntegros menos los gastos de las letras a) a e) del
  //   art. 19.2 (una pensión no tiene), SIN restar los 2.000 € de la letra f): 21.000 ≥
  //   19.747,5 → 0 €. Hasta el 25/09/2026 se medía sobre 19.000 y daba 852,15 € (hallazgo 1687).
  // Base imponible = 21.000 − 2.000 = 19.000,00 €, CON el mínimo de 6.700 € dentro.
  //   escala(19.000) = 12.450×19 % + 6.550×24 % = 2.365,50 + 1.572,00 = 3.937,50 €
  //   escala(6.700)  = 6.700×19 %               = 1.273,00 €
  //   cuota íntegra  = 2.664,50 €
  // IRPF mensual en 14 pagas = 190,321… → pensión neta 1.309,68 €/mes
  //
  // Si el mínimo se restara de la base: escala(19.000 − 6.700) = escala(12.300)
  //   = 2.337,00 €, es decir 327,50 € menos. El error es pequeño aquí porque casi todo el
  //   mínimo cae en el primer tramo; crece con la pensión.
  await estimar(page, '1500', '65_74');

  expect(await fila(page, 'Rendimientos íntegros del trabajo (anuales)')).toBe('21.000,00 €');
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-0,00 €');
  expect(await fila(page, 'Base imponible general')).toBe('19.000,00 €');
  expect(await fila(page, 'Mínimo personal (edad)')).toBe('6700,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('2664,50 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1309,68 €/mes');
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

  expect(await fila(page, 'Base imponible general')).toBe('0,00 €');
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
  //   − reducción art. 20, medida sobre los íntegros (art. 20: solo se restan antes los gastos
  //     de las letras a) a e), que una pensión no tiene; hallazgo 1687). 19.600 cae entre
  //     17.673,52 y 19.747,5 → segundo tramo decreciente:
  //       2.364,34 − 1,14 × (19.600 − 17.673,52) = 2.364,34 − 2.196,19 =    168,15 €
  //   − gastos art. 19.2.f                                     =  2.000,00 €
  //   Base imponible (CON el mínimo dentro, art. 63.1.2.º)     = 17.431,85 €
  //   Mínimo del contribuyente de 65 a 74 años (art. 57.2)     =  6.700,00 €
  //
  //   escala(17.431,85) = 12.450×19 % + 4.981,85×24 % = 2.365,50 + 1.195,644 = 3.561,144 €
  //   escala(6.700,00)  = 6.700×19 %                                          = 1.273,00 €
  //   cuota íntegra     = 3.561,144 − 1.273,00                                = 2.288,14 €
  //
  //   Tipo efectivo = 2.288,14 / 19.600 = 11,674… % → 11,7 %
  //   Pensión neta  = 1.400 − 2.288,144/14 = 1.400 − 163,439 = 1.236,56 €/mes
  //
  // Hasta el 25/09/2026 la reducción se medía sobre 17.600 € y daba 2.493,00 € (base
  // 15.107,00 €, cuota 1.730,18 €): 557,96 € de cuota de menos.
  // Si el mínimo se restara de la base —el defecto que vigila `npm run check:minimo-irpf`—
  // saldría escala(17.431,85 − 6.700) = escala(10.731,85) = 2.039,05 €, o sea 249,09 € menos.
  await estimar(page, '1400', '65_74');

  expect(await fila(page, 'Rendimientos íntegros del trabajo (anuales)')).toBe('19.600,00 €');
  expect(await fila(page, 'Gastos deducibles generales')).toBe('-2000,00 €');
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-168,15 €');
  expect(await fila(page, 'Base imponible general')).toBe('17.431,85 €');
  expect(await fila(page, 'Mínimo personal (edad)')).toBe('6700,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('2288,14 €');
  // El espacio antes del % se admite con o sin él: su forma correcta (espacio duro, regla del
  // 25/09/2026) la vigila el CASO 19, y este caso no debe romperse cuando se repare.
  expect(await fila(page, 'Tipo efectivo estimado')).toMatch(/^11,7 ?%$/);
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1236,56 €/mes');
});

test('CASO 5 (borde) · 75 años: el euro mensual en que la base cruza el mínimo de 8.100 €', async ({ page }) => {
  // El punto en que un pensionista de 75 años empieza a pagar. No se elige por tanteo: se
  // despeja de la propia norma.
  //
  // Con íntegros P entre 14.852 y 17.673,52, la reducción del art. 20 se mide sobre P (una
  // pensión no tiene gastos de las letras a) a e); hallazgo 1687) y vale 7.302 − 1,75 × (P −
  // 14.852), así que la base es P − 2.000 − reducción = 2,75 × P − 35.293. Igualada al mínimo
  // del art. 57.2 para 75 años o más (8.100 €): P = 15.779,27 €, es decir 1.127,09 €/mes en 14
  // pagas. El borde en euros enteros está entre 1.127 € y 1.128 € al mes.
  //
  // (Hasta el 25/09/2026 la reducción se medía sobre P − 2.000 y el borde caía en 1.218 €/mes.)
  //
  //   1.127 × 14 = 15.778,00 € → reducción 7.302 − 1,75 × 926 = 5.681,50 €
  //   base = 15.778 − 2.000 − 5.681,50 = 8.096,50 € < 8.100 → cuota 0,00 € → pensión íntegra.
  await estimar(page, '1127', '75_mas');

  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-5681,50 €');
  expect(await fila(page, 'Base imponible general')).toBe('8096,50 €');
  expect(await fila(page, 'Mínimo personal (edad)')).toBe('8100,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('0,00 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1127,00 €/mes');

  // Un euro más al mes y la cuota deja de ser cero, al 19 % del primer tramo:
  //   1.128 × 14 = 15.792 → reducción 7.302 − 1,75 × 940 = 5.657,00 €
  //   base 13.792 − 5.657 = 8.135,00 € → cuota (8.135 − 8.100) × 19 % = 6,65 €
  // Se comprueba que el borde es ese y no otro: si la app acotara mal el mínimo, o si lo
  // restara de la base, este euro no produciría exactamente 6,65 €.
  await estimar(page, '1128', '75_mas');
  expect(await fila(page, 'Base imponible general')).toBe('8135,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('6,65 €');
});

test('CASO 6 (rechazo) · un dato imposible NO se convierte en un supuesto fiscal', async ({ page }) => {
  // Una app fiscal no puede inventarse una cifra cuando falta el dato o cuando el dato es
  // imposible: o calcula, o no da número. Aquí se comprueban las dos mitades — que avisa, y
  // que NO publica resultado.
  const aviso = page.locator('[role="alert"]').filter({ hasText: 'Introduce tu pensión mensual bruta' });
  const cuotaEnPantalla = page.locator('css=span:text-is("Cuota IRPF estimada anual")');

  await page.getByRole('button', { name: BOTON_ESTIMAR }).click();

  await expect(aviso).toBeVisible();
  await expect(aviso).toHaveAttribute('aria-live', 'polite');

  // El bloque de resultados sigue sin montarse: no hay ninguna cuota en pantalla.
  await expect(page.getByText('Introduce tus datos y pulsa el botón')).toBeVisible();
  expect(await cuotaEnPantalla.count()).toBe(0);

  // Las letras no llegan siquiera al campo: el control solo admite /^-?[\d.,]*$/, así que
  // teclear «abc» lo deja vacío y se vuelve a rechazar igual.
  await page.locator(SEL_PENSION).pressSequentially('abc');
  await esperarValorEnReact(page, SEL_PENSION, '');
  await page.getByRole('button', { name: BOTON_ESTIMAR }).click();
  await expect(aviso).toBeVisible();
  expect(await cuotaEnPantalla.count()).toBe(0);

  // ── La guarda de rango, que hasta el 20/09/2026 no llegaba a rechazar NUNCA ──
  // `NumberInput` reescribía el valor a [min, max] al perder el foco, y el foco se pierde
  // justo al pulsar el botón: «12» pasaba a 100 y la app publicaba «Pensión neta mensual
  // estimada 100,00 €/mes» sin una palabra. Con `acotarAlSalir={false}` el dato se queda
  // como se escribió y la guarda sí lo ve.
  for (const imposible of ['12', '-500', '99999']) {
    await page.locator(SEL_PENSION).fill(imposible);
    await esperarValorEnReact(page, SEL_PENSION, imposible);
    await page.getByRole('button', { name: BOTON_ESTIMAR }).click();

    await expect(aviso).toBeVisible();
    // Ni resultado ni reescritura silenciosa del dato: lo que se ve es lo que se tecleó.
    expect(await cuotaEnPantalla.count()).toBe(0);
    await expect(page.locator(SEL_PENSION)).toHaveValue(imposible);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Casos 7 a 11 — candado de la reparación del 20/09/2026.
// ─────────────────────────────────────────────────────────────────────────────

test('CASO 7 (crítico) · el millar español NO es un decimal: rescate «30.000» son 30.000 €', async ({ page }) => {
  // El importe es el que la propia app propone en su bloque educativo («Rescata 30.000 € del
  // plan en el año de jubilación»), y el campo de rescate tiene min=0, así que ni siquiera se
  // reescribía: el usuario veía «30.000» mientras la app calculaba con 30 €.
  //
  //   Rendimientos íntegros del trabajo  1.200 × 14 + 30.000     = 46.800,00 €
  //   − gastos art. 19.2.f                                       =  2.000,00 €
  //   RNT                                                        = 44.800,00 €
  //   − reducción art. 20 (RNT ≥ 19.747,5 → se agota)             =      0,00 €
  //   Base imponible                                             = 44.800,00 €
  //   Mínimo 75+ (art. 57.2)                                     =  8.100,00 €
  //
  //   escala(44.800) = 12.450×19 % + 7.750×24 % + 15.000×30 % + 9.600×37 %
  //                  = 2.365,50 + 1.860,00 + 4.500,00 + 3.552,00 = 12.277,50 €
  //   escala(8.100)  = 8.100×19 %                                =  1.539,00 €
  //   cuota íntegra  = 12.277,50 − 1.539,00                      = 10.738,50 €
  //
  // Con el parser roto salían 16.830,00 € de íntegros y 0,00 € de cuota. La diferencia no es
  // un redondeo: es toda la cuota.
  await estimar(page, '1200', '75_mas', { rescate: '30.000' });

  expect(await fila(page, 'Rendimientos íntegros del trabajo (anuales)')).toBe('46.800,00 €');
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-0,00 €');
  expect(await fila(page, 'Base imponible general')).toBe('44.800,00 €');
  expect(await fila(page, 'Mínimo personal (edad)')).toBe('8100,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('10.738,50 €');

  // Y el campo sigue mostrando lo que el usuario escribió, sin reescrituras.
  await expect(page.locator(SEL_RESCATE)).toHaveValue('30.000');
});

test('CASO 8 (alto) · «1.400» en la pensión es 1.400 €/mes, que es lo que enseña su placeholder', async ({ page }) => {
  // El agravante del caso anterior: el placeholder del propio campo dice «Ej: 1.400», justo el
  // formato que la app malinterpretaba. Aquí sí había reescritura visible (1,4 < min 100 → el
  // control lo llevaba a 100), pero ocurría al pulsar el botón y el resultado se publicaba
  // igual: «Pensión neta mensual estimada 100,00 €/mes».
  //
  // Los valores son exactamente los del CASO 4, que es la misma pensión escrita sin punto.
  await estimar(page, '1.400', '65_74');

  expect(await fila(page, 'Rendimientos íntegros del trabajo (anuales)')).toBe('19.600,00 €');
  expect(await fila(page, 'Base imponible general')).toBe('17.431,85 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('2288,14 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1236,56 €/mes');

  await expect(page.locator(SEL_PENSION)).toHaveValue('1.400');
});

test('CASO 9 (alto) · el límite de 6.500 € de rentas ajenas al trabajo apaga la reducción del art. 20', async ({ page }) => {
  // `data/fiscal/irpf.ts` lo advierte literalmente: «La reducción exige además NO tener rentas
  // distintas de las del trabajo superiores a 6.500 € … Esa condición no la modela este módulo:
  // quien la necesite debe comprobarla antes de llamar a
  // `calcularReduccionRendimientosTrabajo`». La app no la comprobaba, y además sumaba esas
  // rentas a los rendimientos ÍNTEGROS DEL TRABAJO, con lo que entraban en el RNT que gradúa
  // la propia reducción.
  //
  //   Pensión 800 €/mes → íntegros del trabajo  800 × 14        = 11.200,00 €
  //   − gastos art. 19.2.f                                      =  2.000,00 €
  //   RNT (SIN los alquileres: no son rendimiento del trabajo)  =  9.200,00 €
  //   Otras rentas 7.000 € > 6.500 € → reducción art. 20        =      0,00 €
  //   Base general = 9.200 + 7.000                              = 16.200,00 €
  //   Mínimo 65-74 (art. 57.2)                                  =  6.700,00 €
  //
  //   escala(16.200) = 12.450×19 % + 3.750×24 % = 2.365,50 + 900,00 = 3.265,50 €
  //   escala(6.700)  = 1.273,00 €
  //   cuota íntegra  = 1.992,50 €
  //
  // Antes daba reducción −4.943,00 €, base 11.257,00 € y cuota 865,83 €: 1.126,67 € de menos.
  await estimar(page, '800', '65_74', { otrasRentas: '7000' });

  expect(await fila(page, 'Rendimientos íntegros del trabajo (anuales)')).toBe('11.200,00 €');
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-0,00 €');
  expect(await fila(page, 'Alquileres y otras rentas de la base general')).toBe('7000,00 €');
  expect(await fila(page, 'Base imponible general')).toBe('16.200,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('1992,50 €');

  // Y se DICE por qué la reducción vale cero, en vez de dejar un 0 inexplicado.
  await expect(page.getByText('la reducción del art. 20 LIRPF no procede')).toBeVisible();
});

test('CASO 9.bis (borde) · el filo está en 6.500 €: con eso aplica, con un euro más no', async ({ page }) => {
  // El límite es «superiores a 6.500 €», así que 6.500 € exactos NO lo superan.
  //
  //   Con 6.500 €: RNT 9.200 ≤ 14.852 → reducción 7.302,00 €; base 1.898 + 6.500 = 8.398,00 €
  //     cuota = (8.398 − 6.700) × 19 % = 1.698 × 0,19 = 322,62 €
  //   Con 6.501 €: reducción 0; base 9.200 + 6.501 = 15.701,00 €
  //     cuota = escala(15.701) − escala(6.700)
  //           = (2.365,50 + 3.251×24 %) − 1.273,00 = 3.145,74 − 1.273,00 = 1.872,74 €
  //
  // Un solo euro de alquiler mueve la cuota 1.550,12 €: por eso el umbral tiene que estar en
  // el sitio exacto y no «por ahí».
  await estimar(page, '800', '65_74', { otrasRentas: '6500' });
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-7302,00 €');
  expect(await fila(page, 'Base imponible general')).toBe('8398,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('322,62 €');

  await estimar(page, '800', '65_74', { otrasRentas: '6501' });
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-0,00 €');
  expect(await fila(page, 'Base imponible general')).toBe('15.701,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('1872,74 €');
});

test('CASO 10 (dato) · en pantalla solo vive la redacción VIGENTE del art. 20', async ({ page }) => {
  // El bloque educativo se monta siempre en el DOM aunque esté colapsado (lo exige el SEO), así
  // que se lee con textContent y no con innerText.
  const texto = (await page.locator('body').textContent()) ?? '';
  const plano = texto.replace(ESPACIO_DURO, ' ');

  // La redacción derogada por el RDL 4/2024, y la anterior a 2023, no pueden volver.
  for (const derogado of ['6.498', '13.115', '16.825', '5.565', '13.435', '1.215 €']) {
    expect(plano, `«${derogado}» es la redacción derogada del art. 20 / del mínimo por edad`).not.toContain(derogado);
  }
  // Y el límite de obligación con varios pagadores ya no es 15.000 €.
  expect(plano).not.toContain('15.000 €');

  // Lo que sí tiene que estar, salido de `REDUCCION_RENDIMIENTOS_TRABAJO_2025` y de
  // `OBLIGACION_DECLARAR_2025`:
  expect(plano).toContain('7302,00 €');    // reducción máxima
  expect(plano).toContain('14.852,00 €');  // RNT hasta el que se aplica entera
  expect(plano).toContain('19.747,50 €');  // RNT desde el que vale cero
  expect(plano).toContain('15.876,00 €');  // obligación de declarar, varios pagadores
  expect(plano).toContain('22.000,00 €');  // obligación de declarar, un pagador
  expect(plano).toContain('6500,00 €');    // rentas ajenas al trabajo que admite el art. 20

  // El escenario de pensión única, que publicaba «19.000 − 5.565 = 13.435 €», ahora lo resuelve
  // el mismo motor. Con la reducción del art. 20 medida sobre los íntegros (hallazgo 1687):
  // 2.364,34 − 1,14 × (19.000 − 17.673,52) = 852,15 € → 19.000 − 2.000 − 852,15 = 16.147,85 €.
  // (Hasta el 25/09/2026 se medía sobre 17.000 y publicaba 3.543 € y 13.457 €.)
  expect(plano).toContain('852,15 €');
  expect(plano).toContain('16.147,85 €');
  expect(plano).not.toContain('13.457,00 €');
});

test('CASO 11 (dato) · el FAQPage que leen las IAs lleva las mismas cifras que el motor', async ({ page }) => {
  // El FAQPage se sirve a Bing Copilot, ChatGPT, Perplexity y Gemini para grounding: sus cifras
  // son tan publicables como las de la pantalla, y llevaban la redacción derogada más un mínimo
  // por edad de 75 años cifrado en «1.215 € de descuento en la cuota íntegra» cuando la escala
  // vigente da 8.100 × 19 % = 1.539,00 €.
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = scripts.find((s) => s.includes('FAQPage') && s.includes('pensionista')) ?? '';
  expect(faq, 'la app debe servir un FAQPage').not.toBe('');

  for (const derogado of ['6.498', '13.115', '16.825', '2.364', '1.215', '15.000']) {
    expect(faq, `«${derogado}» no puede publicarse a las IAs`).not.toContain(derogado);
  }

  expect(faq).toContain('7302,00');    // reducción máxima vigente
  expect(faq).toContain('19.747,50');  // donde se agota, sin residual
  expect(faq).toContain('15.876,00');  // varios pagadores
  expect(faq).toContain('1539,00');    // valor real del mínimo de 75 años en la cuota
});

// ─────────────────────────────────────────────────────────────────────────────
// Casos 12 a 23 — reinspección del 25/09/2026, tras 8a6fb75b (la reducción del art. 20 se mide
// antes de los 2.000 € de la letra f). Resueltos a mano ANTES de abrir la app con
// `REDUCCION_RENDIMIENTOS_TRABAJO_2025`, `GASTOS_DEDUCIBLES_TRABAJO_2025`, `MINIMOS_IRPF_2025` y
// `TRAMOS_IRPF_2025` de `data/fiscal/irpf.ts`. Los casos 12 a 16 usan importes en los que medir el
// tramo del art. 20 antes o después de los 2.000 € da cifras distintas: si el defecto 1687
// volviera, cada uno lo delataría con su propio número.
// ─────────────────────────────────────────────────────────────────────────────

const NBSP = String.fromCharCode(160);

/** Prefijo de las clases del módulo de ESTA app: deja fuera los componentes compartidos. */
const MOD = '[class*="EstimadorIrpfPensionista-module"]';

/** Pasa la página al tema oscuro y espera a que el fondo del contenedor lo refleje. */
async function temaOscuro(page: Page): Promise<void> {
  await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
  await expect
    .poll(() => page.locator(`div${MOD}[class$="__container"]`).first().evaluate((e) => getComputedStyle(e).backgroundColor))
    .toBe('rgb(26, 26, 26)');
}

/**
 * Peor contraste WCAG entre el color del texto y su fondo REAL (fondos semitransparentes
 * compuestos y, si hay un degradado, contra cada una de sus paradas), en los elementos del
 * selector. `n` es cuántos casaron: con 0 la medida no dice nada.
 */
async function peorContraste(page: Page, selector: string): Promise<{ n: number; ratio: number }> {
  return page.evaluate((sel) => {
    interface Rgba { r: number; g: number; b: number; a: number }
    const leer = (c: string): Rgba | null => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const sobre = (arriba: Rgba, abajo: Rgba): Rgba => ({
      r: arriba.r * arriba.a + abajo.r * (1 - arriba.a),
      g: arriba.g * arriba.a + abajo.g * (1 - arriba.a),
      b: arriba.b * arriba.a + abajo.b * (1 - arriba.a),
      a: 1,
    });
    const lum = (c: Rgba): number => {
      const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const fondos = (el: Element): Rgba[] => {
      const capas: Rgba[] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        const cs = getComputedStyle(e);
        const paradas = [...cs.backgroundImage.matchAll(/rgba?\([^)]+\)/g)]
          .map((m) => leer(m[0]))
          .filter((c): c is Rgba => c !== null);
        if (paradas.length) return paradas.map((p) => capas.reduceRight((acc, capa) => sobre(capa, acc), p));
        const c = leer(cs.backgroundColor);
        if (c && c.a > 0) { capas.push(c); if (c.a >= 1) break; }
      }
      return [capas.reduceRight((acc, capa) => sobre(capa, acc), { r: 255, g: 255, b: 255, a: 1 })];
    };
    let ratio = Infinity;
    let n = 0;
    document.querySelectorAll(sel).forEach((el) => {
      n++;
      const texto = leer(getComputedStyle(el).color);
      if (!texto) return;
      for (const bg of fondos(el)) {
        const fg = texto.a < 1 ? sobre(texto, bg) : texto;
        const l1 = lum(fg);
        const l2 = lum(bg);
        ratio = Math.min(ratio, (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
      }
    });
    return { n, ratio };
  }, selector);
}

test('CASO 12 · art. 20, primer tramo decreciente: lo decide el íntegro, no el íntegro − 2.000', async ({ page }) => {
  // 1.150 €/mes × 14 = 16.100,00 € íntegros, menos de 65 años (mínimo 5.550 €).
  //   Rendimiento del art. 20 = 16.100 (una pensión no tiene gastos de las letras a) a e)),
  //   entre 14.852 y 17.673,52:
  //     7.302 − 1,75 × (16.100 − 14.852) = 7.302 − 1,75 × 1.248 = 7.302 − 2.184 = 5.118,00 €
  //   Rendimiento neto = 16.100 − 2.000 = 14.100 → base = 14.100 − 5.118 = 8.982,00 €
  //   cuota = escala(8.982) − escala(5.550) = (8.982 − 5.550) × 19 % = 3.432 × 0,19 = 652,08 €
  //   neta = 1.150 − 652,08 / 14 = 1.150 − 46,577 = 1.103,42 €/mes
  // Con el defecto 1687 (tramo medido sobre 14.100 ≤ 14.852) saldrían 7.302,00 € de reducción,
  // base 6.798,00 € y cuota 237,12 €: 414,96 € de menos.
  await estimar(page, '1150', 'menos65');

  expect(await fila(page, 'Rendimientos íntegros del trabajo (anuales)')).toBe('16.100,00 €');
  expect(await fila(page, 'Gastos deducibles generales')).toBe('-2000,00 €');
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-5118,00 €');
  expect(await fila(page, 'Base imponible general')).toBe('8982,00 €');
  expect(await fila(page, 'Mínimo personal (edad)')).toBe('5550,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('652,08 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1103,42 €/mes');
});

test('CASO 13 (borde) · el umbral de 14.852 € del art. 20 se cruza con el íntegro, al euro', async ({ page }) => {
  // Pensión 1.000 €/mes (14.000 €) + rescate del plan, que también es rendimiento del trabajo
  // (art. 17.2.a.3.ª), para caer justo en el umbral. Menos de 65 años (mínimo 5.550 €).
  //   Rescate 852 → íntegros 14.852,00 € ≤ 14.852 → reducción 7.302,00 €
  //     base = 14.852 − 2.000 − 7.302 = 5.550,00 € = mínimo → cuota 0,00 €
  //   Rescate 853 → íntegros 14.853,00 € → reducción 7.302 − 1,75 × 1 = 7.300,25 €
  //     base = 12.853 − 7.300,25 = 5.552,75 € → cuota (5.552,75 − 5.550) × 19 % = 0,5225 → 0,52 €
  // Con el defecto 1687 las dos darían 7.302,00 €: el umbral estaría 2.000 € más arriba.
  await estimar(page, '1000', 'menos65', { rescate: '852' });
  expect(await fila(page, 'Rendimientos íntegros del trabajo (anuales)')).toBe('14.852,00 €');
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-7302,00 €');
  expect(await fila(page, 'Base imponible general')).toBe('5550,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('0,00 €');

  await estimar(page, '1000', 'menos65', { rescate: '853' });
  expect(await fila(page, 'Rendimientos íntegros del trabajo (anuales)')).toBe('14.853,00 €');
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-7300,25 €');
  expect(await fila(page, 'Base imponible general')).toBe('5552,75 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('0,52 €');
});

test('CASO 14 · art. 20, segundo tramo decreciente, con 75 años', async ({ page }) => {
  // 1.350 €/mes × 14 = 18.900,00 € → entre 17.673,52 y 19.747,5:
  //   2.364,34 − 1,14 × (18.900 − 17.673,52) = 2.364,34 − 1,14 × 1.226,48
  //   = 2.364,34 − 1.398,1872 = 966,1528 → 966,15 €
  //   base = 18.900 − 2.000 − 966,15 = 15.933,85 €
  //   cuota = escala(15.933,85) − escala(8.100)
  //         = 2.365,50 + 3.483,85 × 24 % − 8.100 × 19 % = 2.365,50 + 836,124 − 1.539,00 = 1.662,62 €
  //   neta = 1.350 − 1.662,624 / 14 = 1.350 − 118,759 = 1.231,24 €/mes
  // Con el defecto 1687 (tramo medido sobre 16.900, el PRIMER tramo) serían 3.718,00 € de
  // reducción y 1.002,18 € de cuota.
  await estimar(page, '1350', '75_mas');

  expect(await fila(page, 'Rendimientos íntegros del trabajo (anuales)')).toBe('18.900,00 €');
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-966,15 €');
  expect(await fila(page, 'Base imponible general')).toBe('15.933,85 €');
  expect(await fila(page, 'Mínimo personal (edad)')).toBe('8100,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('1662,62 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1231,24 €/mes');
});

test('CASO 15 · la reducción se agota con el íntegro en 19.747,5 €, aunque el neto quede por debajo', async ({ page }) => {
  // 1.450 €/mes × 14 = 20.300,00 € ≥ 19.747,5 → reducción 0,00 €, aunque 20.300 − 2.000 = 18.300
  // quede por debajo del umbral. 65-74 años.
  //   base = 18.300,00 €
  //   cuota = escala(18.300) − escala(6.700) = 2.365,50 + 5.850 × 24 % − 1.273,00
  //         = 2.365,50 + 1.404,00 − 1.273,00 = 2.496,50 €
  //   neta = 1.450 − 2.496,50 / 14 = 1.450 − 178,32 = 1.271,68 €/mes
  // Con el defecto 1687: reducción 2.364,34 − 1,14 × 626,48 = 1.650,15 € y cuota 2.100,46 €.
  await estimar(page, '1450', '65_74');

  expect(await fila(page, 'Rendimientos íntegros del trabajo (anuales)')).toBe('20.300,00 €');
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-0,00 €');
  expect(await fila(page, 'Base imponible general')).toBe('18.300,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('2496,50 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1271,68 €/mes');
});

test('CASO 16 · pensión + alquiler bajo 6.500 €: la reducción la gradúa solo el trabajo', async ({ page }) => {
  // 1.150 €/mes (16.100 €) + 6.000 € de alquiler neto, 65-74 años.
  //   6.000 ≤ 6.500 → la reducción procede, medida sobre los 16.100 € del TRABAJO: 5.118,00 €
  //   (no sobre 22.100 €, que la anularía, ni sobre 14.100 €, que daría 7.302 €).
  //   base = 16.100 − 2.000 − 5.118 + 6.000 = 14.982,00 €
  //   cuota = escala(14.982) − escala(6.700) = 2.365,50 + 2.532 × 24 % − 1.273,00
  //         = 2.365,50 + 607,68 − 1.273,00 = 1.700,18 €
  //   neta = 1.150 − 1.700,18 / 14 = 1.150 − 121,44 = 1.028,56 €/mes
  await estimar(page, '1150', '65_74', { otrasRentas: '6000' });

  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-5118,00 €');
  expect(await fila(page, 'Alquileres y otras rentas de la base general')).toBe('6000,00 €');
  expect(await fila(page, 'Base imponible general')).toBe('14.982,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('1700,18 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1028,56 €/mes');
  await expect(page.getByText('la reducción del art. 20 LIRPF no procede')).toHaveCount(0);
});

test('CASO 17 · un alquiler va a la base GENERAL: con 5.000 € la escala general es la correcta', async ({ page }) => {
  // 1.500 €/mes (21.000 €, reducción 0) + 5.000 € de alquiler neto (rendimiento del capital
  // inmobiliario, que se integra en la base general). 65-74 años.
  //   base = 21.000 − 2.000 + 5.000 = 24.000,00 €
  //   escala(24.000) = 12.450 × 19 % + 7.750 × 24 % + 3.800 × 30 %
  //                  = 2.365,50 + 1.860,00 + 1.140,00 = 5.365,50 €
  //   cuota = 5.365,50 − 1.273,00 = 4.092,50 €
  // Es la cifra correcta porque esos 5.000 € son alquiler. Los dividendos o intereses tienen su
  // propio campo desde el 26/09/2026 y van a la base del ahorro: ver CASO 18.
  await estimar(page, '1500', '65_74', { otrasRentas: '5000' });

  expect(await fila(page, 'Base imponible general')).toBe('24.000,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('4092,50 €');
});

test('CASO 18 (hallazgo 2131, reparado) · intereses y dividendos van a la base del AHORRO, con su escala', async ({ page }) => {
  // HALLAZGO 2131 (reinspección 25/09/2026). Un único campo, «Otras rentas anuales distintas del
  // trabajo», invitaba a poner «Alquileres, intereses o dividendos» y lo sumaba todo a la base
  // GENERAL. Intereses y dividendos son rendimientos del capital mobiliario (art. 25.1-3) y el
  // art. 46.a LIRPF los lleva a la base del AHORRO, gravada con la escala del art. 66 (combinada
  // estatal + autonómica: 19 % hasta 6.000 €, 21 % hasta 50.000 €… —
  // TRAMOS_GANANCIAS_PATRIMONIALES_2025 de data/fiscal/inmuebles.ts).
  //
  // Reparado el 26/09/2026 con un campo aparte, «Intereses y dividendos», que va a la base del
  // ahorro. El de alquileres sigue en la base general (CASO 17) y ya no invita a mezclarlos.
  const ayudaId = await page.locator(SEL_OTRAS).getAttribute('aria-describedby');
  const ayuda = ayudaId ? ((await page.locator(`[id="${ayudaId}"]`).textContent()) ?? '') : '';
  expect(ayuda).not.toMatch(/intereses|dividendos/i);

  // El caso del acta. 1.500 €/mes, 65-74 años, 5.000 € de dividendos:
  //   base general = 21.000 − 2.000 − 0 (reducción agotada: 21.000 ≥ 19.747,5) = 19.000,00 €
  //   cuota general = escala(19.000) − escala(6.700) = 3.937,50 − 1.273,00 = 2.664,50 €
  //   cuota del ahorro = 5.000 × 19 % = 950,00 € (la base general agota el mínimo: nada pasa
  //     al ahorro por el art. 56.2)
  //   cuota = 3.614,50 € · tipo efectivo 3.614,50 / 26.000 = 13,90 % → «13,9 %»
  //   neta = 1.500 − 3.614,50 / 14 = 1.500 − 258,18 = 1.241,82 €/mes
  // Con el defecto: base 24.000 €, cuota 4.092,50 € (478,00 € de más) y 1.207,68 €/mes.
  await estimar(page, '1500', '65_74', { ahorro: '5000' });
  expect(await fila(page, 'Base imponible general')).toBe('19.000,00 €');
  expect(await fila(page, 'Base imponible del ahorro')).toBe('5000,00 €');
  expect(await fila(page, 'Cuota de la base general')).toBe('2664,50 €');
  expect(await fila(page, 'Cuota de la base del ahorro')).toBe('950,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('3614,50 €');
  expect(await fila(page, 'Tipo efectivo estimado')).toBe('13,9 %');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1241,82 €/mes');

  // Con 20.000 € de dividendos se ve el segundo tramo del ahorro:
  //   ahorro = 6.000 × 19 % + 14.000 × 21 % = 1.140,00 + 2.940,00 = 4.080,00 €
  //   cuota = 2.664,50 + 4.080,00 = 6.744,50 € (con el defecto, 8.858,50 €)
  //   neta = 1.500 − 6.744,50 / 14 = 1.500 − 481,75 = 1.018,25 €/mes
  await estimar(page, '1500', '65_74', { ahorro: '20000' });
  expect(await fila(page, 'Cuota de la base del ahorro')).toBe('4080,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('6744,50 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1018,25 €/mes');
});

test('CASO 18.bis (hallazgo 2131) · el límite de 6.500 € del art. 20 cuenta alquileres Y dividendos', async ({ page }) => {
  // El art. 20 exige no tener «rentas, excluidas las exentas, distintas de las del trabajo
  // superiores a 6.500 euros»: todas, también las del ahorro. Separar el campo no puede sacar
  // los dividendos de ese límite.
  //   800 €/mes (11.200 €), 65-74, alquiler 5.000 € + dividendos 2.000 € = 7.000 € > 6.500
  //     → reducción del art. 20 = 0
  //   base general = 11.200 − 2.000 + 5.000 = 14.200,00 €
  //   cuota general = escala(14.200) − escala(6.700) = 2.365,50 + 1.750 × 24 % − 1.273,00
  //                 = 2.365,50 + 420,00 − 1.273,00 = 1.512,50 €
  //   cuota del ahorro = 2.000 × 19 % = 380,00 € → total 1.892,50 €
  // Si solo contara el alquiler (5.000 ≤ 6.500) la reducción valdría 7.302 € y la cuota caería a
  // (6.898 − 6.700) × 19 % + 380 = 417,62 €.
  await estimar(page, '800', '65_74', { otrasRentas: '5000', ahorro: '2000' });
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-0,00 €');
  await expect(page.getByText('la reducción del art. 20 LIRPF no procede')).toBeVisible();
  expect(await fila(page, 'Base imponible general')).toBe('14.200,00 €');
  expect(await fila(page, 'Cuota de la base general')).toBe('1512,50 €');
  expect(await fila(page, 'Cuota de la base del ahorro')).toBe('380,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('1892,50 €');
});

test('CASO 18.ter (hallazgo 2131) · el mínimo que la base general no agota pasa a la del ahorro (art. 56.2)', async ({ page }) => {
  // Art. 56.2 LIRPF: «Cuando la base liquidable general sea inferior al importe del mínimo
  // personal y familiar, éste formará parte de la base liquidable general por el importe de esta
  // última y de la base liquidable del ahorro por el resto». El art. 66.1.2.º grava entonces la
  // base del ahorro con su escala y resta la misma escala aplicada a esa parte del mínimo.
  //
  //   700 €/mes (9.800 €), 75 años o más (mínimo 8.100 €), 10.000 € de intereses
  //     10.000 > 6.500 → sin reducción del art. 20
  //     base general = 9.800 − 2.000 = 7.800,00 € < 8.100 → cuota general 0,00 €
  //     mínimo sobrante = 8.100 − 7.800 = 300,00 € → a la base del ahorro
  //     cuota del ahorro = escala(10.000) − escala(300)
  //                      = (1.140,00 + 4.000 × 21 %) − 300 × 19 % = 1.980,00 − 57,00 = 1.923,00 €
  //     neta = 700 − 1.923 / 14 = 700 − 137,36 = 562,64 €/mes
  // Sin el art. 56.2 la cuota del ahorro sería 1.980,00 €: 57,00 € de más.
  await estimar(page, '700', '75_mas', { ahorro: '10000' });
  expect(await fila(page, 'Base imponible general')).toBe('7800,00 €');
  expect(await fila(page, 'Cuota de la base general')).toBe('0,00 €');
  expect(await fila(page, 'Cuota de la base del ahorro')).toBe('1923,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('1923,00 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('562,64 €/mes');
  await expect(page.getByText(/300,00\s€ de él se aplican a la base del ahorro/)).toBeVisible();

  // Borde: pensión que la reducción deja en base general 0 y unos intereses por debajo del
  // mínimo entero. 400 €/mes (5.600 €), 75+, 3.000 € de intereses (≤ 6.500: la reducción
  // procede y se come los 3.600 € de rendimiento neto). Todo el mínimo pasa al ahorro y cubre
  // los 3.000 €: cuota 0,00 €. Sin el art. 56.2 serían 3.000 × 19 % = 570,00 €.
  await estimar(page, '400', '75_mas', { ahorro: '3000' });
  expect(await fila(page, 'Base imponible general')).toBe('0,00 €');
  expect(await fila(page, 'Cuota de la base del ahorro')).toBe('0,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('0,00 €');
});

test('CASO 24 (hallazgo 2133, reparado) · la FAQ de ascendientes toma el límite de rentas de data/fiscal', async ({ page }) => {
  // HALLAZGO 2133: la FAQ escribía a mano «8.000 € anuales» y «65 años», que data/fiscal publica
  // en DEDUCCIONES_IRPF_DISCAPACIDAD_2025.requisitosAscendiente (art. 59 LIRPF: mayor de 65 años o
  // con discapacidad, y rentas, excluidas las exentas, no superiores a 8.000 €). Ahora sale de
  // allí, con formatCurrency como el resto de cifras de la página: «8000,00 €».
  const faq = page.locator(`${MOD}[class$="__faqItem"]`).filter({ hasText: 'ascendiente a cargo' });
  const texto = limpiar((await faq.textContent()) ?? '');
  expect(texto).toContain('superiores a 8000,00 €');
  expect(texto).toContain('más de 65 años');
  expect(texto).not.toContain('8.000 €');
});

test('CASO 19 (hallazgo 2134, reparado) · los porcentajes llevan espacio duro antes del %', async ({ page }) => {
  // HALLAZGO 2134 (25/09/2026), REPARADO el 26/09/2026 (dbdaa228). Formato español del CLAUDE.md
  // global §2 (regla del 25/09/2026): «15 %» separado con espacio duro U+00A0. El tipo efectivo
  // salía pegado (`{formatNumber(resultado.tipoEfectivo, 1)}%`); la FAQ de ascendientes escribía
  // «≥33%» y la de discapacidad «33 %» y «65 %» con espacio normal. Hoy salen de formatPercentage.
  //   1.400 €/mes, 65-74 → 2.288,14 / 19.600 = 11,67 % → esperado «11,7 %» con U+00A0
  //   (antes de la reparación, «11,7%»).
  await estimar(page, '1400', '65_74');
  const valor = page.locator('css=div:has(> span:text-is("Tipo efectivo estimado"))').first().locator('span').nth(1);
  expect(await valor.textContent()).toBe(`11,7${NBSP}%`);

  const faqs = (await page.locator(`${MOD}[class$="__faqItem"]`).allTextContents()).join(' ');
  expect(faqs, 'ningún porcentaje pegado a la cifra').not.toMatch(/\d%/);
  expect(faqs, 'ningún porcentaje con espacio normal').not.toMatch(/\d %/);
});

test('CASO 20 (hallazgo 2132, reparado) · la tabla mide los umbrales del art. 20 con la misma vara que el motor', async ({ page }) => {
  // HALLAZGO 2132 (25/09/2026), REPARADO el 26/09/2026 (dbdaa228). Reparación incompleta de
  // 8a6fb75b en esta app: la lista del bloque educativo y el FAQPage pasaron a decir que los
  // umbrales se miden sobre la pensión «sin restar los 2.000 €», pero la tabla comparativa seguía
  // con «RNT ≤ 14.852 €», «RNT entre…» y «RNT ≥ 19.747,50 €» sin decir de qué RNT se trataba. El
  // único neto que la pantalla enseña es íntegros − 2.000 («Gastos deducibles generales»).
  //   1.150 €/mes → 16.100 − 2.000 = 14.100 € ≤ 14.852 → por la tabla, 7.302 € de reducción
  //   · la app aplica 5.118,00 € (CASO 12), que es lo que dice el art. 20. Hoy la tabla rotula
  //   «Pensión anual íntegra (sin restar los 2000,00 € de gastos)».
  const tabla = (await page.locator('table').first().textContent()) ?? '';
  expect(tabla).toContain('14.852');
  const rntSinDefinir = /RNT/.test(tabla) && !/sin restar/i.test(tabla);
  expect(rntSinDefinir, 'la tabla usa «RNT» sin decir que se mide sin restar los 2.000 €').toBe(false);
});

test('CASO 21 (hallazgo 2135, reparado) · las cifras del resultado se leen con contraste suficiente, en claro y en oscuro', async ({ page }) => {
  // HALLAZGO 2135 (25/09/2026), REPARADO el 26/09/2026 (dbdaa228): las cifras pasaron a
  // `--primary-texto` y la pensión neta a `--exito-texto`, con variante oscura. Remedido el
  // 03/10/2026 en los dos temas: ninguna cifra del resultado por debajo de su umbral.
  // Lo que había: el módulo redeclaraba `--primary: #2E86AB` y `--success: #27AE60` en
  // `.container`, sin variante oscura, y pintaba con ellos las cifras (`.resultValue`,
  // `.resultValueBig`). Medido entonces en Chromium:
  //   .resultValue (1,1rem = 17,6 px en negrita: texto normal, exige 4,5:1)
  //     claro  3,93:1 sobre #FAFAFA · 3,79:1 en la fila resaltada (#F0F7FB)
  //     oscuro 4,24:1 sobre #1A1A1A · 3,59:1 en la fila resaltada (#1A2A33)
  //   .resultValueBig (1,4rem = 22,4 px en negrita: texto grande, exige 3:1)
  //     claro  2,69:1 (#27AE60 sobre #F0FAF0)
  await estimar(page, '1500', '65_74');
  const cifras = `span${MOD}[class$="__resultValue"]`;
  const neta = `span${MOD}[class$="__resultValueBig"]`;
  const claro = await peorContraste(page, cifras);
  const netaClaro = await peorContraste(page, neta);
  await temaOscuro(page);
  const oscuro = await peorContraste(page, cifras);
  const netaOscuro = await peorContraste(page, neta);

  expect(claro.n).toBeGreaterThan(5);
  expect(netaClaro.n).toBe(1);
  expect(claro.ratio, 'cifras del resultado, tema claro').toBeGreaterThanOrEqual(4.5);
  expect(oscuro.ratio, 'cifras del resultado, tema oscuro').toBeGreaterThanOrEqual(4.5);
  expect(netaClaro.ratio, 'pensión neta, tema claro').toBeGreaterThanOrEqual(3);
  expect(netaOscuro.ratio, 'pensión neta, tema oscuro').toBeGreaterThanOrEqual(3);
});

test('CASO 22 (hallazgo 2136, reparado) · botón, preguntas y pasos del bloque educativo con contraste suficiente', async ({ page }) => {
  // HALLAZGO 2136 (25/09/2026), REPARADO el 26/09/2026 (dbdaa228): botón y pasos con
  // `--primary-boton`/`--secondary-boton`, preguntas con `--primary-texto`. Remedido el 03/10/2026
  // en los dos temas. Mismo origen que el CASO 21 (tokens de marca redeclarados en el módulo).
  // Medido entonces en Chromium:
  //   botón «Estimar mi IRPF…»: blanco sobre degradado #2E86AB → #48A9A6, 17,6 px en
  //     negrita (texto normal, 4,5:1): 4,11:1 en el extremo azul y 2,80:1 en el teal
  //   preguntas de la FAQ (`.faqItem strong`): 3,77:1 en claro y 3,21:1 en oscuro
  //   números de la guía paso a paso (`.stepNumber`): 4,11:1 en los dos temas
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const selBoton = `button${MOD}[class$="__btn"]`;
  const selPreguntas = `${MOD}[class$="__faqItem"] > strong`;
  const selPasos = `${MOD}[class$="__stepNumber"]`;
  const boton = await peorContraste(page, selBoton);
  const preguntas = await peorContraste(page, selPreguntas);
  const pasos = await peorContraste(page, selPasos);
  await temaOscuro(page);
  const preguntasOscuro = await peorContraste(page, selPreguntas);
  const pasosOscuro = await peorContraste(page, selPasos);

  expect(boton.n).toBe(1);
  expect(preguntas.n).toBeGreaterThan(5);
  expect(pasos.n).toBe(6);
  expect(boton.ratio, 'botón principal').toBeGreaterThanOrEqual(4.5);
  expect(preguntas.ratio, 'preguntas de la FAQ, claro').toBeGreaterThanOrEqual(4.5);
  expect(preguntasOscuro.ratio, 'preguntas de la FAQ, oscuro').toBeGreaterThanOrEqual(4.5);
  expect(pasos.ratio, 'números de los pasos, claro').toBeGreaterThanOrEqual(4.5);
  expect(pasosOscuro.ratio, 'números de los pasos, oscuro').toBeGreaterThanOrEqual(4.5);
});

test('CASO 23 · reparaciones del 20/09 sin caso propio (#1024, #1025, #1026) y escenarios con el art. 20 vigente', async ({ page }) => {
  const texto = limpiar((await page.locator('body').textContent()) ?? '');

  // #1024: la FAQ de discapacidad ya no promete los 7.750 € del gasto incrementado del
  // art. 19.2.f (de trabajadores en ACTIVO, y que no es la reducción del art. 20).
  expect(texto).not.toContain('7.750');
  expect(texto).toContain('no aplica a un pensionista');

  // #1025: el escenario de pensión + alquiler ya no dice «supera 22.000 € no aplica aquí».
  expect(texto).not.toContain('22.000 € no aplica');
  //   Y su cifra la da el motor: 14.000 € ≤ 14.852 → reducción 7.302 €; base 14.000 − 2.000
  //   − 7.302 + 6.000 = 10.698,00 €; cuota (10.698 − 6.700) × 19 % = 759,62 €.
  expect(texto).toContain('Base 10.698,00 € → cuota 759,62 €');
  //   Escenario del rescate: 15.000 + 30.000 = 45.000 € ≥ 19.747,5 → reducción 0; base 43.000 €;
  //   cuota = 2.365,50 + 1.860,00 + 4.500,00 + 7.800 × 37 % (2.886,00) − 1.273,00 = 10.338,50 €.
  expect(texto).toContain('= 45.000,00 € → reducción art. 20 0,00 € y cuota 10.338,50 €');
  //   Escenario de pensión única: base 16.147,85 € (CASO 10) → 2.365,50 + 3.697,85 × 24 %
  //   − 1.273,00 = 1.979,98 €.
  expect(texto).toContain('16.147,85 € de base → cuota 1979,98 €');

  // #1026: el emoji del aviso de error va en un nodo aria-hidden; lo anunciable no lleva emoji.
  await page.getByRole('button', { name: BOTON_ESTIMAR }).click();
  const aviso = page.locator('[role="alert"]').filter({ hasText: 'Introduce tu pensión mensual bruta' });
  await expect(aviso).toBeVisible();
  await expect(aviso.locator('[aria-hidden="true"]')).toContainText('⚠');
  const anunciable = await aviso.evaluate((el) => {
    const copia = el.cloneNode(true) as HTMLElement;
    copia.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
    return copia.textContent ?? '';
  });
  expect(anunciable).toContain('Introduce tu pensión mensual bruta');
  expect(anunciable).not.toMatch(/\p{Extended_Pictographic}/u);
});

// ─────────────────────────────────────────────────────────────────────────────
// Casos 25 a 41 — reinspección del 03/10/2026. Resueltos a mano ANTES de abrir la app con
// `TRAMOS_IRPF_2025`, `MINIMOS_IRPF_2025`, `GASTOS_DEDUCIBLES_TRABAJO_2025`,
// `REDUCCION_RENDIMIENTOS_TRABAJO_2025` (data/fiscal/irpf.ts) y `TRAMOS_GANANCIAS_PATRIMONIALES_2025`
// (data/fiscal/inmuebles.ts: 19 % hasta 6.000 €, 21 % hasta 50.000 €). Los textos normativos, del
// consolidado del BOE (BOE-A-2006-20764) consultado ese día.
// ─────────────────────────────────────────────────────────────────────────────

/** «1.309,68 €/mes» o «2664,50 €» → número. */
const importe = (s: string): number =>
  // parser-ok: relee una cifra que la propia app escribe con formatCurrency, no lo que teclea un usuario
  Number(s.replace(/\s*€(\/mes)?$/, '').replace(/\./g, '').replace(',', '.'));

test('CASO 25 (normal) · 1.300 €/mes, 67 años, 400 € de intereses: la cadena entera con las dos bases', async ({ page }) => {
  //   Íntegros del trabajo 1.300 × 14                                    = 18.200,00 €
  //   Rentas distintas del trabajo: 400 € de intereses ≤ 6.500 → la reducción procede (art. 20)
  //   Reducción art. 20 sobre 18.200 (entre 17.673,52 y 19.747,5):
  //     2.364,34 − 1,14 × (18.200 − 17.673,52) = 2.364,34 − 600,1872     =  1.764,15 €
  //   Base general = 18.200 − 2.000 − 1.764,15                           = 14.435,85 €
  //   Cuota general = escala(14.435,85) − escala(6.700)
  //     = (2.365,50 + 1.985,85 × 24 %) − 1.273,00 = 2.842,104 − 1.273,00   =  1.569,10 €
  //   Base del ahorro 400 € (art. 46.a); el mínimo lo agota la general → 400 × 19 % =  76,00 €
  //   Cuota = 1.645,104 → 1.645,10 € · tipo efectivo 1.645,10 / 18.600 = 8,84 % → «8,8 %»
  //   Neta = 1.300 − 1.645,104 / 14 = 1.300 − 117,507                    =  1.182,49 €/mes
  await estimar(page, '1300', '65_74', { ahorro: '400' });

  expect(await fila(page, 'Rendimientos íntegros del trabajo (anuales)')).toBe('18.200,00 €');
  expect(await fila(page, 'Gastos deducibles generales')).toBe('-2000,00 €');
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-1764,15 €');
  expect(await fila(page, 'Base imponible general')).toBe('14.435,85 €');
  expect(await fila(page, 'Base imponible del ahorro')).toBe('400,00 €');
  expect(await fila(page, 'Mínimo personal (edad)')).toBe('6700,00 €');
  expect(await fila(page, 'Cuota de la base general')).toBe('1569,10 €');
  expect(await fila(page, 'Cuota de la base del ahorro')).toBe('76,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('1645,10 €');
  expect(await fila(page, 'Tipo efectivo estimado')).toBe('8,8 %');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1182,49 €/mes');
});

test('CASO 26 (borde) · 75 años, el salto de 6.000 € de la base del ahorro y el art. 20 perdido por las otras rentas', async ({ page }) => {
  //   1.600 €/mes → 22.400 € íntegros (≥ 19.747,5: reducción 0 de todos modos), alquiler 600 € +
  //   dividendos 6.000 € = 6.600 € > 6.500 → la app debe DECIR que la reducción no procede.
  //   Base general = 22.400 − 2.000 + 600 = 21.000,00 €
  //   escala(21.000) = 2.365,50 + 1.860,00 + 800 × 30 % = 4.465,50 € · escala(8.100) = 1.539,00 €
  //   Cuota general = 2.926,50 €
  //   Ahorro 6.000 × 19 % = 1.140,00 € → cuota 4.066,50 € · neta 1.600 − 290,464 = 1.309,54 €/mes
  //   Con 6.001 €: el euro de más ya va al 21 % → 1.140,21 € · cuota 4.066,71 € · neta 1.309,52 €/mes
  await estimar(page, '1600', '75_mas', { otrasRentas: '600', ahorro: '6000' });
  expect(await fila(page, 'Base imponible general')).toBe('21.000,00 €');
  expect(await fila(page, 'Mínimo personal (edad)')).toBe('8100,00 €');
  expect(await fila(page, 'Cuota de la base general')).toBe('2926,50 €');
  expect(await fila(page, 'Cuota de la base del ahorro')).toBe('1140,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('4066,50 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1309,54 €/mes');
  await expect(page.getByText('la reducción del art. 20 LIRPF no procede')).toBeVisible();

  await estimar(page, '1600', '75_mas', { otrasRentas: '600', ahorro: '6001' });
  expect(await fila(page, 'Cuota de la base del ahorro')).toBe('1140,21 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('4066,71 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1309,52 €/mes');
});

test('CASO 27 (borde) · el euro en que la base general pasa del 24 % al 30 % (20.200 €)', async ({ page }) => {
  //   1.500 €/mes (21.000 €) + rescate 1.200 € = 22.200 € → reducción 0 → base 20.200,00 €
  //   escala(20.200) = 2.365,50 + 7.750 × 24 % = 4.225,50 € − escala(8.100) 1.539,00 = 2.686,50 €
  //   neta = 1.500 − 2.686,50 / 14 = 1.308,11 €/mes
  //   Con rescate 1.201 €: base 20.201 € → + 1 × 30 % → 2.686,80 € · neta 1.308,09 €/mes
  await estimar(page, '1500', '75_mas', { rescate: '1200' });
  expect(await fila(page, 'Rendimientos íntegros del trabajo (anuales)')).toBe('22.200,00 €');
  expect(await fila(page, 'Base imponible general')).toBe('20.200,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('2686,50 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1308,11 €/mes');

  await estimar(page, '1500', '75_mas', { rescate: '1201' });
  expect(await fila(page, 'Base imponible general')).toBe('20.201,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('2686,80 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1308,09 €/mes');
});

test('CASO 28 (rechazo) · estados intermedios TECLEADOS y bordes del rango: o calcula bien o no da número', async ({ page }) => {
  // `fill()` no ve si el campo se reescribe al teclear: aquí se escribe tecla a tecla.
  const cuotaEnPantalla = page.locator('css=span:text-is("Cuota IRPF estimada anual")');
  const aviso = (texto: string) => page.locator('[role="alert"]').filter({ hasText: texto });
  const boton = page.getByRole('button', { name: BOTON_ESTIMAR });
  async function teclear(sel: string, texto: string): Promise<void> {
    await page.locator(sel).fill('');
    await esperarValorEnReact(page, sel, '');
    await page.locator(sel).pressSequentially(texto);
    await esperarValorEnReact(page, sel, texto);
  }

  // Un resultado válido delante, para comprobar que el rechazo lo RETIRA.
  await estimar(page, '1500', '65_74');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('2664,50 €');

  for (const imposible of ['-', '12.', '1.2.3', '10000,01']) {
    await teclear(SEL_PENSION, imposible);
    await boton.click();
    await expect(aviso('Introduce tu pensión mensual bruta (entre 100 y 10.000 €)')).toBeVisible();
    expect(await cuotaEnPantalla.count(), `«${imposible}» no puede publicar cuota`).toBe(0);
    await expect(page.locator(SEL_PENSION)).toHaveValue(imposible);
  }

  // Los dos bordes del rango sí se calculan.
  //   100 €/mes → 1.400 € íntegros; los gastos de la letra f) se topan en 1.400 (no pueden dejar
  //   negativo el rendimiento) → base 0 → cuota 0,00 € y neta 100,00 €/mes.
  await teclear(SEL_PENSION, '100');
  await boton.click();
  expect(await fila(page, 'Gastos deducibles generales')).toBe('-1400,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('0,00 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('100,00 €/mes');
  //   10.000 €/mes → 140.000 € → base 138.000 € → escala = 17.901,50 + 78.000 × 45 % = 53.001,50
  //   − 1.273,00 = 51.728,50 € · neta 10.000 − 3.694,89 = 6.305,11 €/mes
  await teclear(SEL_PENSION, '10.000');
  await boton.click();
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('51.728,50 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('6305,11 €/mes');

  // Los campos opcionales: un «-» suelto o un negativo no valen 0, se rechazan.
  await teclear(SEL_PENSION, '1500');
  await teclear(SEL_RESCATE, '-');
  await boton.click();
  await expect(aviso('El rescate de plan de pensiones debe ser un importe entre 0 y 500.000 €')).toBeVisible();
  expect(await cuotaEnPantalla.count()).toBe(0);

  await teclear(SEL_RESCATE, '0');
  await teclear(SEL_AHORRO, '-50');
  await boton.click();
  await expect(aviso('Los intereses y dividendos deben ser un importe entre 0 y 500.000 €')).toBeVisible();
  expect(await cuotaEnPantalla.count()).toBe(0);

  await teclear(SEL_AHORRO, '0');
  for (const imposible of ['-', '100.001']) {
    await teclear(SEL_OTRAS, imposible);
    await boton.click();
    await expect(aviso('Los alquileres y otras rentas de la base general deben ser un importe entre 0 y 100.000 €')).toBeVisible();
    expect(await cuotaEnPantalla.count()).toBe(0);
  }
});

test.describe('móvil (390 px)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 29 (móvil) · el CASO 25 tecleado con punto de millar, sin desbordar la pantalla', async ({ page }) => {
    // Mismas cifras que el CASO 25: «1.300» es 1.300 €/mes (parseSpanishNumber).
    await page.locator('#tramoEdad').selectOption('65_74');
    await page.locator(SEL_PENSION).tap();
    await page.locator(SEL_PENSION).pressSequentially('1.300');
    await esperarValorEnReact(page, SEL_PENSION, '1.300');
    await page.locator(SEL_AHORRO).fill('400');
    await esperarValorEnReact(page, SEL_AHORRO, '400');
    await page.getByRole('button', { name: BOTON_ESTIMAR }).tap();

    expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('1645,10 €');
    expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1182,49 €/mes');
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(ancho, 'sin scroll horizontal a 390 px').toBeLessThanOrEqual(390);
  });
});

test('CASO 30 (sospecha del 28/09, DESCARTADA con medida) · las notas del resultado se leen en los dos temas', async ({ page }) => {
  // SOSPECHA (28/09/2026): `.resultNota` declara `background: var(--bg-secondary)`, variable que no
  // existe en globals.css ni en el módulo. Medido el 03/10/2026 en Chromium: la declaración queda
  // anulada (fondo `rgba(0, 0, 0, 0)`), así que en claro la nota se pinta sobre el blanco de la
  // tarjeta: texto #666666 sobre #FFFFFF = 5,74:1, y la distingue su borde izquierdo de 3 px. En
  // oscuro la regla `[data-theme='dark'] .resultNota` le da #1E293B y el texto #B0B0B0 cumple.
  // No deja texto sin contraste ni nada sin distinguir: no es hallazgo. Este caso vigila lo que
  // importa —que se lea— y no el valor del fondo, para no romperse cuando se declare la variable.
  //   700 €/mes, 75+, 10.000 € de intereses → salen las tres notas (art. 20, art. 56.2 y «TODAS»).
  await estimar(page, '700', '75_mas', { ahorro: '10000' });
  const notas = `p${MOD}[class$="__resultNota"]`;
  const claro = await peorContraste(page, notas);
  await temaOscuro(page);
  const oscuro = await peorContraste(page, notas);
  expect(claro.n).toBe(3);
  expect(claro.ratio, 'notas del resultado, claro').toBeGreaterThanOrEqual(4.5);
  expect(oscuro.ratio, 'notas del resultado, oscuro').toBeGreaterThanOrEqual(4.5);
});

test('CASO 31 · ABIERTO, hallazgo (inspector 03/10/2026) · el aviso de error se lee en el tema oscuro', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo (inspector 03/10/2026): .errorMsg es #c0392b literal, sin variante oscura');
  // `.errorMsg { color: #c0392b }` (EstimadorIrpfPensionista.module.css) no tiene variante oscura.
  // Medido el 03/10/2026: 5,44:1 sobre la tarjeta blanca en claro, pero 2,64:1 sobre la tarjeta
  // #2A2A2A en oscuro (0,9 rem = texto normal, exige 4,5:1). Es el único texto que el usuario TIENE
  // que leer cuando la app rechaza un dato. `check:token-oscuro` no lo ve: no es un token.
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none !important}' });
  await page.getByRole('button', { name: BOTON_ESTIMAR }).click();
  const sel = `div${MOD}[class$="__errorMsg"]`;
  await expect(page.locator(sel)).toBeVisible();
  const claro = await peorContraste(page, sel);
  await temaOscuro(page);
  const oscuro = await peorContraste(page, sel);
  expect(claro.n).toBe(1);
  expect(claro.ratio, 'aviso de error, claro').toBeGreaterThanOrEqual(4.5);
  expect(oscuro.ratio, 'aviso de error, oscuro').toBeGreaterThanOrEqual(4.5);
});

test('CASO 32 · ABIERTO, hallazgo (inspector 03/10/2026) · el nombre accesible del botón contiene su texto visible', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo (inspector 03/10/2026): aria-label «Estimar IRPF pensionista» ≠ texto visible');
  // WCAG 2.5.3 (Label in Name, nivel A): quien maneja el navegador por voz dice lo que VE, «pulsa
  // Estimar mi IRPF como pensionista», y el aria-label lo sustituye por «Estimar IRPF pensionista».
  const boton = page.locator(`button${MOD}[class$="__btn"]`);
  const visible = (await boton.innerText()).trim();
  expect(visible).toBe('Estimar mi IRPF como pensionista');
  await expect(boton).toHaveAccessibleName(new RegExp(visible));
});

test('CASO 33 · ABIERTO, hallazgo (inspector 03/10/2026) · la «pensión neta» no se come el impuesto del rescate ni del alquiler', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo (inspector 03/10/2026): la pensión neta resta la cuota de TODAS las rentas');
  // La app calcula «Pensión neta mensual estimada» = pensión − cuota de TODAS las rentas / 14, y
  // debajo avisa de que «es un suelo, no lo que cobrarás cada mes». Su propio FAQPage la define
  // como «la pensión bruta menos las retenciones de IRPF que aplica la Seguridad Social», que solo
  // miran la pensión: el IRPF del rescate lo retiene la gestora y el del alquiler no sale de la
  // pensión. Una cifra rotulada que no es lo que dice el rótulo, con un aviso debajo, es un aviso
  // bajo cifra falsa: o se calcula lo que dice, o no se publica.
  //   Referencia: la pensión neta de 1.500 €/mes sin más rentas es 1.309,68 €/mes (CASO 1).
  //   Rescate de 30.000 € (el importe del propio bloque educativo): cuota 12.558,50 € (escala de
  //     49.000 = 13.831,50 − 1.273,00), correcta como cuota; la app publica 602,96 €/mes de pensión.
  //   Alquiler de 100.000 €: cuota 43.178,50 €; la app publica 0,00 €/mes de pensión.
  const netaPublicada = async (): Promise<number | null> => {
    const f = page.locator('css=div:has(> span:text-is("Pensión neta mensual estimada"))');
    return (await f.count()) === 0 ? null : importe(await fila(page, 'Pensión neta mensual estimada'));
  };

  await estimar(page, '1500', '65_74', { rescate: '30.000' });
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('12.558,50 €');
  const conRescate = await netaPublicada();
  if (conRescate !== null) expect(conRescate, 'pensión neta con rescate').toBeGreaterThanOrEqual(1309.68);

  await estimar(page, '1500', '65_74', { rescate: '0', otrasRentas: '100.000' });
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('43.178,50 €');
  const conAlquiler = await netaPublicada();
  if (conAlquiler !== null) expect(conAlquiler, 'pensión neta con alquiler').toBeGreaterThanOrEqual(1309.68);
});

test('CASO 34 · ABIERTO, hallazgo (inspector 03/10/2026) · ascendientes: el límite de 1.800 € del art. 61.2.ª, no una «conjunta con tus hijos»', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo (inspector 03/10/2026): FAQ y tarjeta omiten el art. 61.2.ª y hablan de declaración conjunta');
  // Art. 61.2.ª LIRPF (BOE, consolidado): «No procederá la aplicación del mínimo por descendientes,
  // ascendientes o discapacidad, cuando los ascendientes o descendientes que generen el derecho a
  // los mismos presenten declaración por este Impuesto con rentas superiores a 1.800 euros».
  // Art. 82: la unidad familiar son los cónyuges y los hijos MENORES (o incapacitados judicialmente):
  // un padre y un hijo mayor de edad no pueden declarar juntos nunca, no «en este caso».
  // La app dice: «En este caso tú no puedes presentar declaración conjunta con tus hijos, pero ellos
  // sí pueden aplicar ese mínimo» y «Pero entonces tú no puedes declarar conjuntamente con tus hijos
  // ni obtener esa deducción». Y en otra FAQ aconseja declarar sin estar obligado para pedir la
  // devolución: un pensionista con 7.000 € de rentas que convive con su hijo y lo hace le quita al
  // hijo el mínimo por ascendiente (1.150 €, art. 59.1).
  const faq = page.locator(`${MOD}[class$="__faqItem"]`).filter({ hasText: 'ascendiente a cargo' });
  const tarjeta = page.locator(`${MOD}[class$="__tipCard"]`).filter({ hasText: 'Coordina con la familia' });
  const texto = limpiar(`${(await faq.textContent()) ?? ''} ${(await tarjeta.textContent()) ?? ''}`);
  expect(texto).toMatch(/1\.?800/);
  expect(texto).not.toMatch(/conjunta(mente)? con tus hijos/);
});

test('CASO 35 · ABIERTO, hallazgo (inspector 03/10/2026) · varios pagadores: la excepción de los pensionistas del art. 96.3.a.2.º', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo (inspector 03/10/2026): falta el procedimiento especial del art. 96.3.a.2.º');
  // Art. 96.3.a LIRPF: con más de un pagador el límite es 15.876 €, «No obstante, el límite será de
  // 22.000 euros anuales en los siguientes supuestos: […] 2.º Cuando se trate de contribuyentes
  // cuyos únicos rendimientos del trabajo consistan en las prestaciones pasivas a que se refiere el
  // artículo 17.2.a) de esta Ley y la determinación del tipo de retención aplicable se hubiera
  // realizado de acuerdo con el procedimiento especial que reglamentariamente se establezca».
  // Las prestaciones del art. 17.2.a incluyen las de mutualidades y planes de pensiones: justo el
  // ejemplo del FAQPage («también de una mutualidad … el límite baja a 15.876 €»).
  //   Pensión de 14.000 € + 3.000 € de una mutualidad, retención por el procedimiento especial →
  //   límite 22.000 € → NO obligado. La app lo da por obligado en cuatro sitios y en el FAQPage.
  const texto = limpiar((await page.locator('body').textContent()) ?? '');
  expect(texto).toMatch(/procedimiento especial/i);
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = scripts.find((s) => s.includes('FAQPage')) ?? '';
  expect(faq).toMatch(/procedimiento especial/i);
});

test('CASO 36 · ABIERTO, hallazgo (inspector 03/10/2026) · los escenarios conectan la obligación de declarar con lo que dice el art. 96.2', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo (inspector 03/10/2026): consejos de los escenarios ajenos al art. 96.2');
  // Art. 96.2: no declara quien obtiene rentas «exclusivamente» del trabajo (22.000 €), del capital
  // mobiliario con retención (1.600 €) o imputadas (1.000 €); el alquiler no está en la lista, y el
  // único otro límite es el conjunto de 1.000 € del penúltimo párrafo. Un pensionista con 14.000 €
  // de pensión y 6.000 € de alquiler ESTÁ obligado; la app dice que «el alquiler tiene sus propios
  // umbrales en el art. 96, y conviene comprobarlos aparte».
  // Y con 19.000 € de un solo pagador no hay obligación sea cual sea la retención (art. 96.2.a); la
  // app la hace depender de ella: «Si la retención aplicada es exacta, puede no ser obligatorio».
  const texto = limpiar((await page.locator(`${MOD}[class$="__escenariosGrid"]`).textContent()) ?? '');
  expect(texto).not.toContain('tiene sus propios umbrales en el art. 96');
  expect(texto).not.toContain('Si la retención aplicada es exacta, puede no ser obligatorio declarar');
});

test('CASO 37 · ABIERTO, hallazgo (inspector 03/10/2026) · el rescate del plan menciona el régimen transitorio de la DT 12.ª', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo (inspector 03/10/2026): «se suma íntegramente» y «rescatar en años posteriores» sin la DT 12.ª');
  // DT 12.ª.2 LIRPF: por la parte de aportaciones hasta el 31/12/2006 se puede aplicar la reducción
  // del art. 17 del TRLIRPF vigente a esa fecha; DT 12.ª.4: solo en el ejercicio de la contingencia
  // o en los dos siguientes. La app dice «El rescate se suma íntegramente a los rendimientos del
  // trabajo», aconseja rescatar «en años posteriores» y «en forma de renta», y no avisa de que eso
  // puede hacer perder la reducción de esa parte. (`lib/calculadoras/rescatePlanPensiones.ts` ya la
  // modela.)
  const parrafo = page.locator('h3', { hasText: 'Rescate del plan de pensiones' }).locator('xpath=following-sibling::p[1]');
  const escenario = page.locator(`${MOD}[class$="__escenarioCard"]`).filter({ hasText: 'plan de pensiones rescatado' });
  const consejo = page.locator(`${MOD}[class$="__tipCard"]`).filter({ hasText: 'Planifica el rescate' });
  const texto = limpiar(`${await parrafo.textContent()} ${await escenario.textContent()} ${await consejo.textContent()}`);
  expect(texto).toMatch(/2006|2007|transitori/i);
});

test('CASO 38 · ABIERTO, hallazgo (inspector 03/10/2026) · las pensiones exentas no son «solo» las de incapacidad absoluta o gran invalidez', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo (inspector 03/10/2026): la FAQ dice «solo» y el art. 7 exime más pensiones');
  // Art. 7 LIRPF: también están exentas, entre otras, las pensiones por actos de terrorismo (a), las
  // de lesiones de la Guerra Civil (c), las de inutilidad de clases pasivas (g) y las de orfandad de
  // la Seguridad Social de menores de 22 años (h). Un huérfano de 20 años con pensión de orfandad
  // de la SS no tributa por ella; la FAQ dice que las únicas exentas son las de incapacidad.
  const faq = page.locator(`${MOD}[class$="__faqItem"]`).filter({ hasText: 'siempre tributan' });
  expect(limpiar((await faq.textContent()) ?? '')).not.toMatch(/exenciones totales solo para/);
});

test('CASO 39 · ABIERTO, hallazgo (inspector 03/10/2026) · discapacidad ≥ 65 %: el mínimo lleva además los gastos de asistencia', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo (inspector 03/10/2026): la FAQ omite los 3.000 € de gastos de asistencia del art. 60.1');
  // Art. 60.1 LIRPF: 9.000 € con grado ≥ 65 %, «Dicho mínimo se aumentará, en concepto de gastos de
  // asistencia, en 3.000 euros anuales cuando acredite […] un grado de discapacidad igual o superior
  // al 65 por ciento» (DEDUCCIONES_IRPF_DISCAPACIDAD_2025.contribuyente.gastosAsistencia65oMas).
  //   Pensionista con el 65 % → mínimo por discapacidad 12.000 €; la FAQ dice 9.000 €.
  const faq = page.locator(`${MOD}[class$="__faqItem"]`).filter({ hasText: 'discapacidad al IRPF' });
  expect(limpiar((await faq.textContent()) ?? '')).toMatch(/asistencia/i);
});

test('CASO 40 · ABIERTO, hallazgo (inspector 03/10/2026) · el plazo de la campaña no lleva fechas de un año concreto escritas a mano', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo (inspector 03/10/2026): «del 2 de abril al 30 de junio … hasta el 25 de junio» a mano');
  // data/fiscal/calendario.ts: «Campaña de abril a finales de junio; las fechas exactas se publican
  // cada ejercicio». El paso 6 de la guía fija «El plazo es del 2 de abril al 30 de junio. Si sale a
  // pagar y domicilias el pago, puedes presentar hasta el 25 de junio».
  const paso = page.locator(`${MOD}[class$="__step"]`).filter({ hasText: 'Presenta antes' });
  const texto = limpiar((await paso.textContent()) ?? '');
  expect(texto).not.toContain('2 de abril');
  expect(texto).not.toContain('25 de junio');
});

test('CASO 41 · ABIERTO, hallazgo (inspector 03/10/2026) · ni el año ni el tipo del primer tramo se escriben a mano', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo (inspector 03/10/2026): «2026» y «al 19 %» escritos a mano');
  // El aviso y DataReference leen `FISCAL_IRPF_META.vigencia`, y el título de metadata también
  // (b7ec248c), pero el subtítulo del hero, el del bloque educativo y el título de la tabla llevan
  // «2026» tecleado: al re-sellar el módulo, el título cambiaría y ellos no. Y el FAQPage escribe
  // «al 19 %» (con espacio normal) en vez de leer TRAMOS_IRPF_2025[0].tipo con formatPercentage.
  const fuente = readFileSync(join(process.cwd(), 'app', 'estimador-irpf-pensionista', 'page.tsx'), 'utf8');
  expect(fuente).not.toMatch(/·\s*20\d\d|\(20\d\d\)/);
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = scripts.find((s) => s.includes('FAQPage')) ?? '';
  expect(faq).not.toMatch(/\d %/);
});
