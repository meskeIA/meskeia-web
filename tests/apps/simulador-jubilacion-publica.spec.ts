import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Inspector — simulador-jubilacion-publica (segmento FISCAL, RIESGO 1 CRÍTICO)
 * Inspeccionada el 21/09/2026. REPARADA el 21/09/2026 (hallazgos 1089-1100).
 *
 * Qué promete la app
 * ──────────────────
 *   <h1>  «Simulador de Jubilación Pública»
 *   sub.  «Edad, pensión estimada, anticipada y parcial · Sistema dual 2026»
 *   meta. «Simula tu jubilación pública completa: edad de jubilación, pensión estimada
 *          (sistema dual 2026), jubilación anticipada con coeficientes reductores y
 *          jubilación parcial.»
 *
 * De dónde sale cada cifra esperada
 * ─────────────────────────────────
 *   TODAS de `data/fiscal/pensiones.ts` (sello FISCAL_PENSIONES_META, reverificado el
 *   21/09/2026 contra la Seguridad Social y la DT 9.ª LGSS). Ninguna de memoria.
 *
 *     · TABLA_EDAD_JUBILACION[2027] → edadSinCotizacion 67a0m · cotizacionPara65 38a6m
 *       (= 462 meses). `getEdadJubilacion` devuelve esa fila para cualquier año ≥ 2027,
 *       que es lo que aplica a todo nacido a partir de 1962.
 *     · TRAMOS_PORCENTAJE_PENSION_2025 → 50 % a los 180 meses · +0,21 %/mes en los 49
 *       siguientes (meses 181-229) · +0,19 %/mes en los 209 posteriores (230-438) · 100 %
 *       a los 438 meses = 36 años y 6 meses.
 *     · BASE_REGULADORA.factor = 300/350 = 0,857142857…
 *     · SISTEMA_DUAL_TRANSICION[2026] (DT 40.ª LGSS) → basesSeleccionadas 302 / divisor
 *       352,33 = 0,857150…
 *     · LIMITES_PENSION_2025 → maximaMensual 3.359,60 € · maximaAnual 47.034,40 €
 *       · minimaSinConyuge 888,70 €.
 *     · COMPLEMENTO_MINIMOS_LIMITES_2026 → 9.442 € sin cónyuge a cargo · 11.013 € con él.
 *     · COTIZACION_MINIMA.anosMinimosAcceso = 15 · mesesParaCien = 438.
 *     · COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025 → 2,00 / 1,87 / 1,75 / 1,63 %/trimestre
 *       según se tengan menos de 38a6m, 41a6m, 44a6m o más años cotizados.
 *     · COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025 → 1,875 / 1,750 / 1,625 / 1,500.
 *     · REQUISITOS_ANTICIPADA_VOLUNTARIA → 35 años cotizados, hasta 24 meses de antelación.
 *     · REQUISITOS_JUBILACION_PARCIAL → 33 años cotizados, anticipación máxima de 3 años
 *       sobre la edad ordinaria, reducción de jornada del 25 % al 75 %.
 *
 * Nota de formato: `formatCurrency` usa es-ES, que NO agrupa los millares de un número de
 * cuatro cifras (2.142,88 → «2142,88 €») y sí los de cinco o más (30.000,28 €), y separa la
 * cifra del € con un espacio duro (U+00A0), que aquí se normaliza.
 *
 * CASOS (resueltos a mano ANTES de abrir el navegador)
 * ───────────────────────────────────────────────────
 *   CASO 1 (normal) — nacido en 1965 · 40 años cotizados · base media 2.500 €/mes
 *       edad       480 meses ≥ 462 → 65 años, en 1965 + 65 = 2030
 *       %          480 meses pasa del mes 438 → 100,00 %
 *       BR         2.500 × 300/350 = 2.142,857… → «2142,86 €»
 *       pensión    se jubila en 2030, y el escalón del sistema dual de ese año
 *                  (310/361,67 = 0,857134) es PEOR que el 300/350 clásico: gana la
 *                  clásica → 2.142,86 €/mes. El caso 2 cubre el escalón de 2029.
 *       anual      × 14 = 30.000,00 €
 *       anticipada VOLUNTARIA 24 meses = 8 trimestres; 40 años cae en el tramo «< 41,5»
 *                  → 1,87 %/trim × 8 = 14,96 % → 2.142,857 × 0,8504 = 1.822,29 €/mes
 *                  y una pérdida vitalicia de 320,57 €/mes
 *       anticipada INVOLUNTARIA, el MISMO caso → 1,750 %/trim × 8 = 14,00 % → 1.842,86 €.
 *                  Es el testigo de que la app no confunde las dos tablas de coeficientes:
 *                  si las intercambiara, los dos importes saldrían cruzados.
 *
 *   CASO 2 (límite) — nacido en 1962 · 38 años cotizados · base media 5.000 €/mes
 *       edad       456 meses < 462 → la OTRA rama: 67 años, en 1962 + 67 = 2029
 *       %          456 meses pasa del mes 438 → 100,00 %
 *       BR         5.000 × 300/350 = 4.285,71 €
 *       pensión    las DOS fórmulas superan el tope → 3.359,60 €/mes, y ahora la app lo DICE
 *       anual      3.359,60 × 14 = 47.034,40 € = LIMITES_PENSION_2025.maximaAnual clavado
 *
 *   CASO 3 (escala, hallazgo 1093) — 1965 · 28 años (336 meses) · base 1.200 €/mes
 *       %          50 + 49 × 0,21 + (336 − 229) × 0,19 = 50 + 10,29 + 20,33 = 80,62 %
 *                  Es la cifra que delata la escala: con el tramo del 0,21 % llegando al
 *                  mes 276 salían 81,56 %, y con la resta que contaba un mes corto, 81,16 %.
 *       BR         1.200 × 300/350 = 1.028,571… → «1028,57 €»
 *       pensión    se jubila en 2032 (336 meses < 462 → 67 años): el escalón dual de ese
 *                  año, 314/366,33, gana por céntimos → 1.028,57 × 80,62 % = 829,24 €/mes
 *       mínimo     829,24 < 888,70 → NO se eleva (hallazgo 1089): se avisa de que el
 *                  complemento a mínimos depende de rentas y de situación familiar.
 *
 *   CASO 4 (el suelo que se deshacía, hallazgo 1094) — 1965 · 35 años · base 1.000 €/mes
 *       %          420 meses → 50 + 10,29 + 191 × 0,19 = 96,58 %
 *       pensión    1.000 × 314/366,33 × 96,58 % = 827,84 €/mes — por debajo del mínimo,
 *                  y AUN ASÍ no se eleva
 *       anticipada 35 años → tramo «< 38,5» = 2,00 %/trim × 8 = 16,00 % → 695,38 €/mes.
 *                  Antes la ordinaria subía a 888,70 € y la anticipada caía a 746,51 €,
 *                  es decir, por debajo del mínimo que la propia app acababa de garantizar.
 *
 *   CASO 5 (millar español, hallazgos 1090 y 1098) — el placeholder dice «Ej: 2.500»
 *       base «2.500» → 2.500 €/mes, no 2,5. Antes el campo se rechazaba a sí mismo con
 *       su propio ejemplo: «Introduce una base de cotización válida».
 *
 *   CASO 6 (dos ejes temporales, hallazgo 1095) — nacido en 1964 · 39 años PROYECTADOS
 *       pero 34 acreditados hoy. La parcial se juzga con lo cotizado HOY: sin los 38 años
 *       y 3 meses de 2026 la edad ordinaria es 66a10m, así que el mínimo son 63a10m y a
 *       los 62 de hoy NO procede. Antes los 39 proyectados rebajaban el requisito a 62 y
 *       concedían la parcial sobre cotizaciones que todavía no existen.
 *
 *   CASO 7 (rechazos) — los dos noes que la app tiene que decir
 *       7a  1965 · 12 años · 2.000 € → por debajo de COTIZACION_MINIMA.anosMinimosAcceso.
 *       7b  1965 · 34 años · 2.500 € + anticipada voluntaria → por debajo de los 35 años.
 */

const RUTA = '/simulador-jubilacion-publica/';

const SEL = {
  anio: '#anioNacimiento',
  anos: 'input[aria-label^="Años cotizados (estimados"]',
  base: 'input[aria-label^="Base de cotización"]',
  meses: 'input[aria-label^="Meses de anticipación"]',
  reduccion: 'input[aria-label^="Reducción de jornada"]',
  salario: 'input[aria-label^="Salario bruto"]',
  cotizadosHoy: 'input[aria-label^="Años cotizados acreditados"]',
  btnCalcular: 'button[aria-label="Calcular jubilación"]',
  btnAnticipada: 'button[aria-label="Calcular jubilación anticipada"]',
  btnParcial: 'button[aria-label="Calcular jubilación parcial"]',
} as const;

/** El formato de moneda es-ES separa la cifra del € con un espacio duro (U+00A0). */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/** «30.000,28 €/mes» → 30000.28, para comparar importes sin depender del formato. */
function aNumero(texto: string): number {
  const limpio = limpiar(texto)
    .replace(/\/(mes|año)/g, '')
    .replace(/[€%\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return Number(limpio);
}

/** El valor de una fila de resultados: el <span> que va justo detrás de su etiqueta. */
function valorDe(page: Page, etiqueta: string) {
  return page.getByText(etiqueta, { exact: true }).locator('xpath=following-sibling::span[1]');
}

async function importeDe(page: Page, etiqueta: string): Promise<number> {
  return aNumero(await valorDe(page, etiqueta).innerText());
}

/** Rellena el formulario principal y pulsa «Simular mi jubilación». */
async function simular(page: Page, anio: number, anos: number | string, base: number | string): Promise<void> {
  await page.selectOption(SEL.anio, String(anio));
  await sembrarValor(page, SEL.anos, anos);
  await sembrarValor(page, SEL.base, base);
  await page.locator(SEL.btnCalcular).click();
}

/** Despliega «¿Puedo jubilarme antes?», fija los meses y calcula. */
async function calcularAnticipada(page: Page, meses: number): Promise<void> {
  await page.getByRole('button', { name: /¿Puedo jubilarme antes\?/ }).click();
  await sembrarValor(page, SEL.meses, meses);
  await page.locator(SEL.btnAnticipada).click();
}

test.beforeEach(async ({ page }) => {
  // El primer acceso a una ruta en `next dev` la compila: holgura sobre los 30 s del config.
  test.setTimeout(120_000);
  await page.goto(RUTA, { waitUntil: 'load' });
  // Un clic anterior a la hidratación también se pierde: los dos inputs de testigo.
  await esperarHidratacion(page, [SEL.anos, SEL.base]);
});

test('CASO 1 · carrera completa: 65 años, base reguladora 300/350 y anticipada al coeficiente de su tramo', async ({ page }) => {
  await simular(page, 1965, 40, 2500);

  // ── Edad: 480 meses cotizados superan los 462 de TABLA_EDAD_JUBILACION[2027] ──
  const edad = page.getByRole('status').first();
  await expect(edad).toContainText('65 años');
  await expect(edad).toContainText('Te jubilarías en 2030');
  await expect(edad).toContainText('38 años y 6 meses');

  // ── Porcentaje: 480 meses pasa del mes 438 de TRAMOS_PORCENTAJE_PENSION_2025 ──
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText('100,00%');

  // ── Base reguladora clásica, a 1 céntimo: 2.500 × 300/350 = 2.142,857… ──
  await expect(valorDe(page, 'Base reguladora (25 años / 350)')).toContainText('2142,86');

  // ── Pensión: BR × 100 %, sin tope ni mínimo de por medio ──
  // Precisión 2: el importe se pinta con dos decimales y aquí no hay redondeo que perdonar.
  expect(await importeDe(page, 'Pensión mensual estimada (bruta)')).toBeCloseTo(2142.86, 2);
  expect(await importeDe(page, 'Pensión anual (14 pagas)')).toBeCloseTo(30000.00, 2);

  // Con carrera completa no falta nada para el 100 % y esa fila no se pinta.
  await expect(page.getByText('Para llegar al 100 %', { exact: true })).toHaveCount(0);
  // Ni se topa, ni queda bajo el mínimo: ninguno de los dos avisos aparece.
  await expect(page.getByText('Tope máximo aplicado', { exact: true })).toHaveCount(0);
  await expect(page.getByText(/queda por debajo de la pensión mínima/)).toHaveCount(0);

  // ── Anticipada VOLUNTARIA 24 meses = 8 trimestres ──
  // 40 años cotizados → tramo «< 41,5» de COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025 = 1,87 %.
  await calcularAnticipada(page, 24);
  await expect(valorDe(page, 'Anticipación')).toHaveText('24 meses (8 trim.)');
  await expect(valorDe(page, 'Reducción total')).toHaveText('-14,96%');
  expect(await importeDe(page, 'Pensión con reducción')).toBeCloseTo(1822.29, 2);
  // Precisión 1: vigila que la pérdida salga del importe reducido y no de otra cosa; un
  // error de tramo la movería decenas de euros, no céntimos.
  expect(await importeDe(page, 'Pérdida mensual permanente')).toBeCloseTo(-320.57, 1);

  // ── El mismo caso como INVOLUNTARIA: 1,750 %/trim × 8 = 14,00 % ──
  // Si la app cruzara las dos tablas de coeficientes, estos dos valores saldrían al revés.
  await page.selectOption('#tipoAnticipada', 'involuntaria');
  await page.locator(SEL.btnAnticipada).click();
  await expect(valorDe(page, 'Reducción total')).toHaveText('-14,00%');
  expect(await importeDe(page, 'Pensión con reducción')).toBeCloseTo(1842.86, 2);
});

test('CASO 2 · límite: sin cotización suficiente son 67 años, y la pensión topa en el máximo — y se dice', async ({ page }) => {
  await simular(page, 1962, 38, 5000);

  // ── La OTRA rama de la edad: 456 meses < 462 → edadSinCotizacion de la fila 2027 ──
  const edad = page.getByRole('status').first();
  await expect(edad).toContainText('67 años');
  await expect(edad).toContainText('Te jubilarías en 2029');
  await expect(edad).toContainText('no alcanzas el umbral de 38 años y 6 meses');

  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText('100,00%');
  await expect(valorDe(page, 'Base reguladora (25 años / 350)')).toContainText('4285,71');

  // ── …y la pensión se corta en LIMITES_PENSION_2025.maximaMensual = 3.359,60 € ──
  expect(await importeDe(page, 'Pensión mensual estimada (bruta)')).toBeCloseTo(3359.60, 2);
  // 3.359,60 × 14 = LIMITES_PENSION_2025.maximaAnual, clavado.
  expect(await importeDe(page, 'Pensión anual (14 pagas)')).toBeCloseTo(47034.40, 2);

  // Hallazgo 1097: el recorte se ANUNCIA. Antes la única pista era que la cifra no cuadrase
  // con la base reguladora que la propia página estaba mostrando encima.
  await expect(valorDe(page, 'Tope máximo aplicado')).toContainText('pensión máxima');
});

test('CASO 3 · escala del porcentaje: 28 años son el 80,62 %, y quedar bajo el mínimo NO lo eleva', async ({ page }) => {
  await simular(page, 1965, 28, 1200);

  // ── Hallazgo 1093 · 336 meses: 50 + 49 × 0,21 + 107 × 0,19 ──
  // Con la escala vieja (0,21 % hasta el mes 276) salía 81,56 %; con la resta que contaba
  // un mes corto, 81,16 %. Los tres valores son distintos, así que esta cifra los separa.
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText('80,62%');
  await expect(valorDe(page, 'Base reguladora (25 años / 350)')).toContainText('1028,57');

  // ── Hallazgo 1089 · la pensión NO se eleva a minimaSinConyuge (888,70 €) ──
  const pension = await importeDe(page, 'Pensión mensual estimada (bruta)');
  expect(pension).toBeCloseTo(829.24, 2);
  expect(pension).toBeLessThan(888.70);

  // …y a cambio se explica qué hace falta de verdad para cobrar el mínimo.
  const aviso = page.getByText(/queda por debajo de la pensión mínima/);
  await expect(aviso).toHaveCount(1);
  // El aviso vive en un warningBox: el div[1] es su cabecera y el div[2], el bloque entero.
  const bloque = aviso.locator('xpath=ancestor::div[2]');
  // es-ES no agrupa los millares de un número de cuatro cifras: 9.442 se pinta «9442,00».
  await expect(bloque).toContainText('9442,00');   // COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge
  await expect(bloque).toContainText('11.013,00'); // …conConyuge
  await expect(bloque).toContainText('1256,60');   // minimaConConyuge

  // ── Hallazgo 1097 · lo que falta para el 100 % se pinta: 438 − 336 = 102 meses ──
  await expect(valorDe(page, 'Para llegar al 100 %')).toContainText('8 años y 6 meses');
});

test('CASO 4 · el suelo ya no se deshace: la anticipada parte de la pensión real, no de una elevada', async ({ page }) => {
  await simular(page, 1965, 35, 1000);

  // 420 meses → 50 + 10,29 + 191 × 0,19 = 96,58 %
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText('96,58%');
  expect(await importeDe(page, 'Pensión mensual estimada (bruta)')).toBeCloseTo(827.84, 2);

  // ── Hallazgo 1094 · 35 años → tramo «< 38,5» = 2,00 %/trim × 8 = 16,00 % ──
  await calcularAnticipada(page, 24);
  await expect(valorDe(page, 'Reducción total')).toHaveText('-16,00%');
  // 827,84 × 0,84 = 695,38. Con el suelo viejo la ordinaria valía 888,70 y esta salía
  // 746,51: una pensión anticipada por debajo del mínimo recién «garantizado».
  expect(await importeDe(page, 'Pensión con reducción')).toBeCloseTo(695.38, 2);
});

test('CASO 5 · el campo acepta su propio ejemplo: «2.500» son dos mil quinientos, no dos y medio', async ({ page }) => {
  // Hallazgos 1090 y 1098: el placeholder dice «Ej: 2.500» y el parseo casero lo leía 2,5,
  // por debajo del mínimo de 100 → la app rechazaba su propio ejemplo.
  await simular(page, 1965, 40, '2.500');

  await expect(page.getByRole('alert').filter({ hasText: 'base de cotización válida' })).toHaveCount(0);
  expect(await importeDe(page, 'Pensión mensual estimada (bruta)')).toBeCloseTo(2142.86, 2);
});

test('CASO 6 · jubilación parcial: se juzga con lo cotizado HOY, no con lo proyectado', async ({ page }) => {
  // Nacido en 1964 → 62 años en 2026. 39 años proyectados al jubilarse, 34 acreditados hoy.
  await simular(page, 1964, 39, 2000);

  await page.getByRole('button', { name: /¿Puedo trabajar y cobrar pensión a la vez\?/ }).click();
  await sembrarValor(page, SEL.salario, 2000);
  await sembrarValor(page, SEL.cotizadosHoy, 34);
  await page.locator(SEL.btnParcial).click();

  // ── Hallazgo 1095 ──
  // Con 34 años acreditados no hay cotización suficiente (38a3m en 2026), así que la edad
  // ordinaria es 66a10m y el mínimo de la parcial, 63a10m. A los 62 de hoy: no procede.
  const rechazo = page.getByRole('alert').filter({ hasText: 'No cumples los requisitos' });
  await expect(rechazo).toContainText('63 años y 10 meses');
  await expect(page.getByText(/Edad \(≥ 63 años y 10 meses\)/)).toHaveCount(1);
  // Con los 39 proyectados la edad mínima habría bajado a 62 y la parcial se habría
  // concedido sobre cotizaciones que todavía no existen.
  await expect(page.getByText(/Edad \(≥ 62 años\)/)).toHaveCount(0);

  // Y el campo no acepta un «hoy» mayor que el «al jubilarte» del formulario principal.
  await sembrarValor(page, SEL.cotizadosHoy, 45);
  await page.locator(SEL.btnParcial).click();
  await expect(page.getByRole('alert').filter({ hasText: 'más años cotizados' })).toHaveCount(1);
});

test('CASO 7 · rechazos: sin los 15 años de acceso no hay pensión, y sin los 35 no hay anticipada voluntaria', async ({ page }) => {
  // ── 7a · por debajo de COTIZACION_MINIMA.anosMinimosAcceso = 15 ──
  await simular(page, 1965, 12, 2000);

  // `getByRole('alert')` casa también con el DisclaimerCard de la app: hay que acotar.
  const aviso = page.getByRole('alert').filter({ hasText: 'Se necesitan al menos' });
  await expect(aviso).toContainText('Se necesitan al menos 15 años cotizados para acceder a pensión.');

  // Y lo que de verdad importa: NO se publica ninguna pensión para quien no tiene derecho.
  await expect(page.getByText(/^Pensión mensual/)).toHaveCount(0);
  await expect(page.getByText('Porcentaje por años cotizados', { exact: true })).toHaveCount(0);

  // ── 7b · 34 años cotizados frente a los 35 de REQUISITOS_ANTICIPADA_VOLUNTARIA ──
  await sembrarValor(page, SEL.anos, 34);
  await sembrarValor(page, SEL.base, 2500);
  await page.locator(SEL.btnCalcular).click();
  await expect(page.getByText('Porcentaje por años cotizados', { exact: true })).toHaveCount(1);

  await calcularAnticipada(page, 24);

  const rechazo = page.getByRole('alert').filter({ hasText: 'No cumples los requisitos' });
  await expect(rechazo).toContainText('Se necesitan 35 años cotizados. Tienes 34.');

  // Ni reducción ni pensión reducida: a quien no cumple no se le enseña una cifra.
  await expect(page.getByText('Reducción total', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Pensión con reducción', { exact: true })).toHaveCount(0);
});
