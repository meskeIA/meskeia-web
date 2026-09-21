import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Inspector — simulador-jubilacion-publica (segmento FISCAL, RIESGO 1 CRÍTICO)
 * Inspeccionada el 21/09/2026. NO reparada: el acta recoge los hallazgos.
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
 *   TODAS de `data/fiscal/pensiones.ts` (sello FISCAL_PENSIONES_META, verificado el
 *   12/08/2026: LGSS RDL 8/2015 + Ley 21/2021 + RD 241/2026). Ninguna de memoria.
 *
 *     · TABLA_EDAD_JUBILACION[2027] → edadSinCotizacion 67a0m · cotizacionPara65 38a6m
 *       (= 462 meses). `getEdadJubilacion` devuelve esa fila para cualquier año ≥ 2027,
 *       que es lo que aplica a todo nacido a partir de 1962.
 *     · TRAMOS_PORCENTAJE_PENSION_2025 → 50 % a los 180 meses · +0,21 %/mes hasta el 276
 *       · +0,19 %/mes desde el 277 · tope 100 %.
 *     · BASE_REGULADORA.factor = 300/350 = 0,857142857…
 *     · SISTEMA_DUAL_TRANSICION[2026] (DT 40.ª LGSS) → basesSeleccionadas 302 / divisor
 *       352,33 = 0,857150…
 *     · LIMITES_PENSION_2025 → maximaMensual 3.359,60 € · maximaAnual 47.034,40 €
 *       · minimaSinConyuge 888,70 €.
 *     · COTIZACION_MINIMA.anosMinimosAcceso = 15.
 *     · COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025 → 2,00 / 1,87 / 1,75 / 1,63 %/trimestre
 *       según se tengan menos de 38a6m, 41a6m, 44a6m o más años cotizados.
 *     · COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025 → 1,875 / 1,750 / 1,625 / 1,500.
 *     · REQUISITOS_ANTICIPADA_VOLUNTARIA → 35 años cotizados, hasta 24 meses de antelación.
 *
 * Nota de formato: `formatCurrency` usa es-ES, que NO agrupa los millares de un número de
 * cuatro cifras (2.142,88 → «2142,88 €») y sí los de cinco o más (30.000,28 €), y separa la
 * cifra del € con un espacio duro (U+00A0), que aquí se normaliza.
 *
 * CASOS (resueltos a mano ANTES de abrir el navegador)
 * ───────────────────────────────────────────────────
 *   CASO 1 (normal) — nacido en 1965 · 40 años cotizados · base media 2.500 €/mes
 *       edad       480 meses ≥ 462 → 65 años, en 1965 + 65 = 2030
 *       %          480 meses pasa del tope → 100,00 %
 *       BR clásica 2.500 × 300/350     = 2.142,857… → «2142,86 €»
 *       BR dual    2.500 × 302/352,33  = 2.142,877… → «2142,88 €»
 *       pensión    BR × 100 %, dentro de [888,70 · 3.359,60] → 2.142,88 €/mes
 *       anual      × 14 = 30.000,28 €
 *       anticipada VOLUNTARIA 24 meses = 8 trimestres; 40 años cae en el tramo «< 41,5»
 *                  → 1,87 %/trim × 8 = 14,96 % → 2.142,877 × 0,8504 = 1.822,30 €/mes
 *                  y una pérdida vitalicia de 320,57 €/mes
 *       anticipada INVOLUNTARIA, el MISMO caso → 1,750 %/trim × 8 = 14,00 % → 1.842,87 €.
 *                  Es el testigo de que la app no confunde las dos tablas de coeficientes:
 *                  si las intercambiara, los dos importes saldrían cruzados.
 *
 *   CASO 2 (límite) — nacido en 1962 · 38 años cotizados · base media 5.000 €/mes
 *       edad       456 meses < 462 → la OTRA rama del sistema dual de edad: 67 años,
 *                  en 1962 + 67 = 2029 (el caso 1 cubre la rama de los 65)
 *       %          456 meses pasa del tope → 100,00 %
 *       BR         5.000 × 300/350 = 4.285,71 € · 5.000 × 302/352,33 = 4.285,75 €
 *       pensión    las DOS superan el tope → 3.359,60 €/mes (LIMITES_PENSION_2025)
 *       anual      3.359,60 × 14 = 47.034,40 € = LIMITES_PENSION_2025.maximaAnual clavado
 *       empate     al topar las dos fórmulas, gana la clásica y desaparece la fila de
 *                  «Diferencia entre fórmulas»
 *
 *   CASO 3 (rechazo) — los dos noes que la app tiene que decir
 *       3a  1965 · 12 años · 2.000 € → por debajo de COTIZACION_MINIMA.anosMinimosAcceso:
 *           aviso «Se necesitan al menos 15 años cotizados para acceder a pensión» y
 *           NINGUNA cifra de pensión en pantalla.
 *       3b  1965 · 34 años · 2.500 € + anticipada voluntaria → por debajo de los 35 años
 *           de REQUISITOS_ANTICIPADA_VOLUNTARIA: «No cumples los requisitos · Se necesitan
 *           35 años cotizados. Tienes 34», y sin fila de reducción ni pensión reducida.
 *
 * Lo que este fichero NO afirma (hallazgos del acta, deliberadamente sin assert para que
 * el test no se quede en rojo ni congele el defecto)
 * ──────────────────────────────────────────────────────────────────────────────────────
 *   · El tramo de 0,21 %/mes se cuenta un mes corto: `min(m,276) − 181` da 95 meses donde
 *     TRAMOS_PORCENTAJE_PENSION_2025[2].porcentajeBase (70,16 = 50 + 96 × 0,21) dice 96.
 *     Todo porcentaje por debajo del 100 % sale 0,21 puntos corto (28 años → 81,16 % en vez
 *     de 81,37 %). Por eso los dos casos con cifras usan carreras que TOPAN en el 100 %:
 *     ahí el porcentaje es correcto y el importe verificable.
 *   · `aplicarLimites` sube al mínimo de 888,70 € cualquier pensión menor, sin condición.
 *   · Los importes se parsean con `parseFloat(x.replace(',', '.'))` y no con
 *     `parseSpanishNumber`, así que el millar español rompe el campo.
 */

const RUTA = '/simulador-jubilacion-publica/';

const SEL = {
  anio: '#anioNacimiento',
  anos: 'input[aria-label^="Años cotizados"]',
  base: 'input[aria-label^="Base de cotización"]',
  meses: 'input[aria-label^="Meses de anticipación"]',
  btnCalcular: 'button[aria-label="Calcular jubilación"]',
  btnAnticipada: 'button[aria-label="Calcular jubilación anticipada"]',
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
async function simular(page: Page, anio: number, anos: number, base: number): Promise<void> {
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

  // ── Porcentaje: 480 meses pasa del tope de TRAMOS_PORCENTAJE_PENSION_2025 ──
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText('100,00%');

  // ── Las dos bases reguladoras, a 1 céntimo ──
  // BASE_REGULADORA.factor: 2.500 × 300/350 = 2.142,857…
  await expect(valorDe(page, 'Fórmula clásica (25 años / 350)')).toContainText('BR 2142,86');
  // SISTEMA_DUAL_TRANSICION[2026]: 2.500 × 302/352,33 = 2.142,877…
  await expect(valorDe(page, 'Fórmula ampliada 2026 (sistema dual)')).toContainText('BR 2142,88');

  // ── Pensión: BR × 100 %, dentro de [minimaSinConyuge · maximaMensual] ──
  // Precisión 2: el importe se pinta con dos decimales y aquí no hay redondeo que perdonar.
  expect(await importeDe(page, 'Pensión mensual (sistema ampliado)')).toBeCloseTo(2142.88, 2);
  expect(await importeDe(page, 'Pensión anual (14 pagas)')).toBeCloseTo(30000.28, 2);

  // ── Anticipada VOLUNTARIA 24 meses = 8 trimestres ──
  // 40 años cotizados → tramo «< 41,5» de COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025 = 1,87 %.
  await calcularAnticipada(page, 24);
  await expect(valorDe(page, 'Anticipación')).toHaveText('24 meses (8 trim.)');
  await expect(valorDe(page, 'Reducción total')).toHaveText('-14,96%');
  expect(await importeDe(page, 'Pensión con reducción')).toBeCloseTo(1822.30, 2);
  // Precisión 1: vigila que la pérdida salga del importe reducido y no de otra cosa; un
  // error de tramo la movería decenas de euros, no céntimos.
  expect(await importeDe(page, 'Pérdida mensual permanente')).toBeCloseTo(-320.57, 1);

  // ── El mismo caso como INVOLUNTARIA: 1,750 %/trim × 8 = 14,00 % ──
  // Si la app cruzara las dos tablas de coeficientes, estos dos valores saldrían al revés.
  await page.selectOption('#tipoAnticipada', 'involuntaria');
  await page.locator(SEL.btnAnticipada).click();
  await expect(valorDe(page, 'Reducción total')).toHaveText('-14,00%');
  expect(await importeDe(page, 'Pensión con reducción')).toBeCloseTo(1842.87, 2);
});

test('CASO 2 · límite: sin cotización suficiente son 67 años, y la pensión topa en el máximo de LIMITES_PENSION_2025', async ({ page }) => {
  await simular(page, 1962, 38, 5000);

  // ── La OTRA rama de la edad: 456 meses < 462 → edadSinCotizacion de la fila 2027 ──
  const edad = page.getByRole('status').first();
  await expect(edad).toContainText('67 años');
  await expect(edad).toContainText('Te jubilarías en 2029');
  await expect(edad).toContainText('no alcanzas el umbral de 38 años y 6 meses');

  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText('100,00%');

  // ── Las dos bases reguladoras quedan MUY por encima del tope ──
  await expect(valorDe(page, 'Fórmula clásica (25 años / 350)')).toContainText('BR 4285,71');
  await expect(valorDe(page, 'Fórmula ampliada 2026 (sistema dual)')).toContainText('BR 4285,75');

  // ── …y las dos se cortan en LIMITES_PENSION_2025.maximaMensual = 3.359,60 € ──
  expect(await importeDe(page, 'Pensión mensual (sistema clásico)')).toBeCloseTo(3359.60, 2);
  // 3.359,60 × 14 = LIMITES_PENSION_2025.maximaAnual, clavado.
  expect(await importeDe(page, 'Pensión anual (14 pagas)')).toBeCloseTo(47034.40, 2);

  // Topadas las dos, la diferencia entre fórmulas es cero y su fila no se pinta.
  await expect(page.getByText('Diferencia entre fórmulas', { exact: true })).toHaveCount(0);
});

test('CASO 3 · rechazos: sin los 15 años de acceso no hay pensión, y sin los 35 no hay anticipada voluntaria', async ({ page }) => {
  // ── 3a · por debajo de COTIZACION_MINIMA.anosMinimosAcceso = 15 ──
  await simular(page, 1965, 12, 2000);

  // `getByRole('alert')` casa también con el DisclaimerCard de la app: hay que acotar.
  const aviso = page.getByRole('alert').filter({ hasText: 'Se necesitan al menos' });
  await expect(aviso).toContainText('Se necesitan al menos 15 años cotizados para acceder a pensión.');

  // Y lo que de verdad importa: NO se publica ninguna pensión para quien no tiene derecho.
  await expect(page.getByText(/^Pensión mensual/)).toHaveCount(0);
  await expect(page.getByText('Porcentaje por años cotizados', { exact: true })).toHaveCount(0);

  // ── 3b · 34 años cotizados frente a los 35 de REQUISITOS_ANTICIPADA_VOLUNTARIA ──
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
