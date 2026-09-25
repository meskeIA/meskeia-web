import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * estimador-irpf-pensionista — candado del método del art. 63.1.2.º LIRPF y de la ENTRADA
 * Escrita el 12/09/2026. Ampliada el 20/09/2026 por el Inspector (casos 4 a 6) y convertida
 * ese mismo día en candado de la reparación (casos 7 a 11).
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
 *     (`REDUCCION_RENDIMIENTOS_TRABAJO_2025` / `calcularReduccionRendimientosTrabajo`)
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

/** Los tres campos numéricos. Sin ellos hidratados, escribir no llegaría al estado de React. */
const CAMPOS = [
  'input[aria-label="Pensión mensual bruta (€/mes)"]',
  'input[aria-label="Rescate de plan de pensiones este año (€)"]',
  'input[aria-label="Otras rentas anuales distintas del trabajo (€/año)"]',
] as const;

const SEL_PENSION = CAMPOS[0];
const SEL_RESCATE = CAMPOS[1];
const SEL_OTRAS = CAMPOS[2];

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
  expect(await fila(page, 'Base imponible estimada')).toBe('19.000,00 €');
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
  expect(await fila(page, 'Base imponible estimada')).toBe('17.431,85 €');
  expect(await fila(page, 'Mínimo personal (edad)')).toBe('6700,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('2288,14 €');
  expect(await fila(page, 'Tipo efectivo estimado')).toBe('11,7%');
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
  expect(await fila(page, 'Base imponible estimada')).toBe('8096,50 €');
  expect(await fila(page, 'Mínimo personal (edad)')).toBe('8100,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('0,00 €');
  expect(await fila(page, 'Pensión neta mensual estimada')).toBe('1127,00 €/mes');

  // Un euro más al mes y la cuota deja de ser cero, al 19 % del primer tramo:
  //   1.128 × 14 = 15.792 → reducción 7.302 − 1,75 × 940 = 5.657,00 €
  //   base 13.792 − 5.657 = 8.135,00 € → cuota (8.135 − 8.100) × 19 % = 6,65 €
  // Se comprueba que el borde es ese y no otro: si la app acotara mal el mínimo, o si lo
  // restara de la base, este euro no produciría exactamente 6,65 €.
  await estimar(page, '1128', '75_mas');
  expect(await fila(page, 'Base imponible estimada')).toBe('8135,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('6,65 €');
});

test('CASO 6 (rechazo) · un dato imposible NO se convierte en un supuesto fiscal', async ({ page }) => {
  // Una app fiscal no puede inventarse una cifra cuando falta el dato o cuando el dato es
  // imposible: o calcula, o no da número. Aquí se comprueban las dos mitades — que avisa, y
  // que NO publica resultado.
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

  // ── La guarda de rango, que hasta el 20/09/2026 no llegaba a rechazar NUNCA ──
  // `NumberInput` reescribía el valor a [min, max] al perder el foco, y el foco se pierde
  // justo al pulsar el botón: «12» pasaba a 100 y la app publicaba «Pensión neta mensual
  // estimada 100,00 €/mes» sin una palabra. Con `acotarAlSalir={false}` el dato se queda
  // como se escribió y la guarda sí lo ve.
  for (const imposible of ['12', '-500', '99999']) {
    await page.locator(SEL_PENSION).fill(imposible);
    await esperarValorEnReact(page, SEL_PENSION, imposible);
    await page.getByRole('button', { name: 'Estimar IRPF pensionista' }).click();

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
  expect(await fila(page, 'Base imponible estimada')).toBe('44.800,00 €');
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
  expect(await fila(page, 'Base imponible estimada')).toBe('17.431,85 €');
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
  expect(await fila(page, 'Otras rentas distintas del trabajo')).toBe('7000,00 €');
  expect(await fila(page, 'Base imponible estimada')).toBe('16.200,00 €');
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
  expect(await fila(page, 'Base imponible estimada')).toBe('8398,00 €');
  expect(await fila(page, 'Cuota IRPF estimada anual')).toBe('322,62 €');

  await estimar(page, '800', '65_74', { otrasRentas: '6501' });
  expect(await fila(page, 'Reducción por rendimientos del trabajo')).toBe('-0,00 €');
  expect(await fila(page, 'Base imponible estimada')).toBe('15.701,00 €');
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
