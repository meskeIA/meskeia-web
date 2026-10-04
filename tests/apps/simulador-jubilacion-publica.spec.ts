import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';

/**
 * Inspector — simulador-jubilacion-publica (segmento FISCAL, RIESGO 1 CRÍTICO)
 * Inspeccionada el 21/09/2026. REPARADA el 21/09/2026 (hallazgos 1089-1100).
 * RE-INSPECCIONADA el 04/10/2026 tras 30cd3e24 (escala del porcentaje por año de
 * jubilación, DT 9.ª LGSS) y b7ec248c (año del título desde META.vigencia): casos 8 a 19.
 * Los casos 1-7 siguen en verde: los hallazgos 1089-1100 siguen REPARADOS.
 *
 * La fecha se FIJA (04/10/2026) en el beforeEach: la jubilación parcial calcula la edad de
 * hoy con `new Date().getFullYear()` (caso 6), y sin fijarla el test caducaría en enero de
 * 2027, cuando la fila de TABLA_EDAD_JUBILACION y la edad del nacido en 1964 cambian.
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
 *     · getEscalaPorcentajePension(año de jubilación) (DT 9.ª LGSS). Todos los casos se
 *       jubilan en 2030 o después, así que les toca la de 2027: 50 % a los 180 meses ·
 *       +0,19 %/mes en los 248 siguientes (meses 181-428) · +0,18 %/mes en los 16
 *       posteriores (429-444) · 100 % a los 444 meses = 37 años. (La de 2023-2026 era
 *       +0,21 % en 181-229 y +0,19 % en 230-438.)
 *     · BASE_REGULADORA.factor = 300/350 = 0,857142857…
 *     · SISTEMA_DUAL_TRANSICION[2026] (DT 40.ª LGSS) → basesSeleccionadas 302 / divisor
 *       352,33 = 0,857150…
 *     · LIMITES_PENSION_2025 → maximaMensual 3.359,60 € · maximaAnual 47.034,40 €
 *       · minimaSinConyuge 888,70 €.
 *     · COMPLEMENTO_MINIMOS_LIMITES_2026 → 9.442 € sin cónyuge a cargo · 11.013 € con él.
 *     · COTIZACION_MINIMA.anosMinimosAcceso = 15. El 100 % lo fija la escala del año (444 meses).
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
 *       %          jubilación en 2030 → escala de 2027: 480 meses pasa del mes 444 → 100,00 %
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
 *       %          456 meses pasa del mes 444 → 100,00 %
 *       BR         5.000 × 300/350 = 4.285,71 €
 *       pensión    las DOS fórmulas superan el tope → 3.359,60 €/mes, y ahora la app lo DICE
 *       anual      3.359,60 × 14 = 47.034,40 € = LIMITES_PENSION_2025.maximaAnual clavado
 *
 *   CASO 3 (escala, hallazgos 1093 y S0163) — 1965 · 28 años (336 meses) · base 1.200 €/mes
 *       año        se jubila en 2032 (336 meses < 462 → 67 años): escala de 2027
 *       %          50 + (336 − 180) × 0,19 = 50 + 29,64 = 79,64 %
 *                  Es la cifra que delata la escala: con la de 2026 salía 80,62 %, con el
 *                  tramo del 0,21 % llegando al mes 276, 81,56 %, y con la resta que contaba
 *                  un mes corto, 81,16 %.
 *       BR         1.200 × 300/350 = 1.028,571… → «1028,57 €»
 *       pensión    el escalón dual de 2032, 314/366,33, gana por céntimos
 *                  → 1.028,58 × 79,64 % = 819,16 €/mes
 *       mínimo     819,16 < 888,70 → NO se eleva (hallazgo 1089): se avisa de que el
 *                  complemento a mínimos depende de rentas y de situación familiar.
 *
 *   CASO 4 (el suelo que se deshacía, hallazgo 1094) — 1965 · 35 años · base 1.000 €/mes
 *       %          420 meses, jubilación en 2032 → 50 + 240 × 0,19 = 95,60 %
 *       pensión    1.000 × 314/366,33 × 95,60 % = 819,44 €/mes — por debajo del mínimo,
 *                  y AUN ASÍ no se eleva
 *       anticipada 35 años → tramo «< 38,5» = 2,00 %/trim × 8 = 16,00 % → 688,33 €/mes.
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
 *
 * ── RE-INSPECCIÓN 04/10/2026 · resueltos a mano con ESCALAS_PORCENTAJE_PENSION ───────
 *   Escala 2023-2026: 50 % a los 180 meses · +0,21 × (meses 181-229) · +0,19 × (230-438).
 *   Escala 2027+:     50 % a los 180 meses · +0,19 × (meses 181-428) · +0,18 × (429-444).
 *   Entre los meses 230 y 428 la de 2026 va SIEMPRE 0,98 puntos por encima
 *   (10,29 − 49 × 0,19 = 0,98): es el tamaño del defecto que vigilan los casos 8-11.
 *
 *   CASO 8 (normal, 2027+) — 1970 · 30 años (360 m) · 2.000 € → 67 años en 2037
 *       %   50 + 180 × 0,19 = 84,20 (con la de 2026, 85,18) · BR 2.000 × 300/350 = 1.714,29
 *       pensión 1.714,2857 × 84,20 % = 1.443,43 · anual × 14 = 20.208,00
 *       (dual 2037 = 324/378 = 300/350 exacto: las dos fórmulas coinciden)
 *       faltan 444 − 360 = 84 meses = «7 años más de cotización (37 años en total)»
 *     y el de la sospecha S0163: 1975 · 25 años (300 m) · 1.800 € → 72,80 % (73,78 en 2026)
 *       → 1.542,857 × 72,80 % = 1.123,20 €/mes · faltan 144 meses = 12 años.
 *
 *   CASO 9 (frontera 2026/2027, mismos meses) — la app solo llega a un año de jubilación
 *     anterior a 2027 con menos de 438 meses si se nace en 1959 o antes; el nacido en 1960
 *     se jubila (en la aproximación por años de la app) en 2027 a los 67.
 *       25 años:     1959 → 73,78 % · 1960 → 72,80 %
 *       36,5 años:   1959 → 100,00 % · 1960 → 97,12 + 10 × 0,18 = 98,92 % (faltan 6 meses)
 *       37 años:     1980 → 444 meses → 100,00 % justo, sin fila «Para llegar al 100 %»
 *       36,92 años:  1980 → 443 meses → 97,12 + 15 × 0,18 = 99,82 % (falta 1 mes)
 *
 *   CASO 10 (el tope depende de la escala) — 1980 · 26,5 años (318 m) · 5.101,20 €
 *       BR 5.101,20 × 300/350 = 4.372,4571 · % 2027: 50 + 138 × 0,19 = 76,22
 *       pensión 3.332,69 €/mes, SIN tope. Con la de 2026 (77,20 %) saldrían 3.375,54 y la
 *       app recortaría a LIMITES_PENSION_2025.maximaMensual = 3.359,60 con su aviso.
 *
 *   CASO 11 (mínimo de acceso justo) — 1985 · 15 años (180 m) · 1.500 €
 *       50,00 % · BR 1.285,71 · pensión 642,86 < 888,70 → aviso de mínimos · faltan 264 m = 22 años.
 *
 *   CASO 12 (móvil 390 px, pulsación a pulsación) — «-» en años → «Introduce los años
 *       cotizados (entre 1 y 50).» · base «1.234,56» + 30 años (1970) → 1.058,1943 × 84,20 %
 *       = 891,00 €/mes, que queda 2,30 € POR ENCIMA de 888,70: sin aviso de mínimos.
 *
 *   CASOS 13-18 documentan hallazgos ABIERTOS el 04/10/2026 (test.fail con su motivo).
 *   CASO 19 comprueba que título, JSON-LD y DataReference dicen el mismo año.
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

/**
 * El porcentaje se pinta con `formatNumber` + «%» pegado (hallazgo abierto, caso 17). Las
 * aserciones de cifra admiten el espacio duro para no romperse el día que se repare.
 */
const pct = (cifra: string) => new RegExp(`^${cifra.replace(/[-,]/g, (c) => `\\${c}`)}\\s?%$`);

test.beforeEach(async ({ page }) => {
  // El primer acceso a una ruta en `next dev` la compila: holgura sobre los 30 s del config.
  test.setTimeout(120_000);
  // Fecha fija: la parcial (caso 6) lee el año de hoy con Date. Ver la cabecera.
  await page.clock.setFixedTime(new Date('2026-10-04T10:00:00+02:00'));
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

  // ── Porcentaje: jubilación en 2030, escala de 2027; 480 meses pasa del mes 444 ──
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('100,00'));

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
  await expect(valorDe(page, 'Reducción total')).toHaveText(pct('-14,96'));
  expect(await importeDe(page, 'Pensión con reducción')).toBeCloseTo(1822.29, 2);
  // Precisión 1: vigila que la pérdida salga del importe reducido y no de otra cosa; un
  // error de tramo la movería decenas de euros, no céntimos.
  expect(await importeDe(page, 'Pérdida mensual permanente')).toBeCloseTo(-320.57, 1);

  // ── El mismo caso como INVOLUNTARIA: 1,750 %/trim × 8 = 14,00 % ──
  // Si la app cruzara las dos tablas de coeficientes, estos dos valores saldrían al revés.
  await page.selectOption('#tipoAnticipada', 'involuntaria');
  await page.locator(SEL.btnAnticipada).click();
  await expect(valorDe(page, 'Reducción total')).toHaveText(pct('-14,00'));
  expect(await importeDe(page, 'Pensión con reducción')).toBeCloseTo(1842.86, 2);
});

test('CASO 2 · límite: sin cotización suficiente son 67 años, y la pensión topa en el máximo — y se dice', async ({ page }) => {
  await simular(page, 1962, 38, 5000);

  // ── La OTRA rama de la edad: 456 meses < 462 → edadSinCotizacion de la fila 2027 ──
  const edad = page.getByRole('status').first();
  await expect(edad).toContainText('67 años');
  await expect(edad).toContainText('Te jubilarías en 2029');
  await expect(edad).toContainText('no alcanzas el umbral de 38 años y 6 meses');

  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('100,00'));
  await expect(valorDe(page, 'Base reguladora (25 años / 350)')).toContainText('4285,71');

  // ── …y la pensión se corta en LIMITES_PENSION_2025.maximaMensual = 3.359,60 € ──
  expect(await importeDe(page, 'Pensión mensual estimada (bruta)')).toBeCloseTo(3359.60, 2);
  // 3.359,60 × 14 = LIMITES_PENSION_2025.maximaAnual, clavado.
  expect(await importeDe(page, 'Pensión anual (14 pagas)')).toBeCloseTo(47034.40, 2);

  // Hallazgo 1097: el recorte se ANUNCIA. Antes la única pista era que la cifra no cuadrase
  // con la base reguladora que la propia página estaba mostrando encima.
  await expect(valorDe(page, 'Tope máximo aplicado')).toContainText('pensión máxima');
});

test('CASO 3 · escala del porcentaje: 28 años son el 79,64 % jubilándose en 2032, y quedar bajo el mínimo NO lo eleva', async ({ page }) => {
  await simular(page, 1965, 28, 1200);

  // ── S0163 (30/09/2026) · nacido en 1965 con 28 años cotizados → edad 67 → jubilación en
  //    2032, y desde 2027 rige la escala nueva de la DT 9.ª LGSS: 0,19 % por cada mes
  //    adicional entre el 1 y el 248. 336 meses = 156 adicionales → 50 + 156 × 0,19 = 79,64 %.
  //    Con la escala de 2026, que el simulador aplicaba a cualquier año, salía 80,62 %
  //    (hallazgo 1093: 50 + 49 × 0,21 + 107 × 0,19); con la escala vieja, 81,56 %.
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('79,64'));
  await expect(valorDe(page, 'Base reguladora (25 años / 350)')).toContainText('1028,57');

  // ── Hallazgo 1089 · la pensión NO se eleva a minimaSinConyuge (888,70 €) ──
  // Clásica 1.028,57 × 79,64 % = 819,15 · dual 2032 (314 / 366,33) 1.028,58 × 79,64 % = 819,16.
  const pension = await importeDe(page, 'Pensión mensual estimada (bruta)');
  expect(pension).toBeCloseTo(819.16, 2);
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

  // ── Hallazgo 1097 · lo que falta para el 100 % se pinta. Desde 2027 el 100 % llega en el
  //    mes 444 (37 años): 444 − 336 = 108 meses (con la escala de 2026 eran 102).
  await expect(valorDe(page, 'Para llegar al 100 %')).toContainText('9 años más de cotización');
  await expect(valorDe(page, 'Para llegar al 100 %')).toContainText('(37 años en total)');
});

test('CASO 4 · el suelo ya no se deshace: la anticipada parte de la pensión real, no de una elevada', async ({ page }) => {
  await simular(page, 1965, 35, 1000);

  // 420 meses, jubilación en 2032 (escala de 2027, S0163) → 50 + 240 × 0,19 = 95,60 %
  // (con la de 2026 eran 96,58 %). Dual 2032: 1.000 × 314 / 366,33 × 95,60 % = 819,44.
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('95,60'));
  expect(await importeDe(page, 'Pensión mensual estimada (bruta)')).toBeCloseTo(819.44, 2);

  // ── Hallazgo 1094 · 35 años → tramo «< 38,5» = 2,00 %/trim × 8 = 16,00 % ──
  await calcularAnticipada(page, 24);
  await expect(valorDe(page, 'Reducción total')).toHaveText(pct('-16,00'));
  // 819,44 × 0,84 = 688,33. Con el suelo viejo la ordinaria valía 888,70 y esta salía
  // 746,51: una pensión anticipada por debajo del mínimo recién «garantizado».
  expect(await importeDe(page, 'Pensión con reducción')).toBeCloseTo(688.33, 2);
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

// ════════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 04/10/2026 — la escala del porcentaje por AÑO de jubilación (30cd3e24)
// ════════════════════════════════════════════════════════════════════════════════

/** La fila «Para llegar al 100 %». */
const filaCien = (page: Page) => valorDe(page, 'Para llegar al 100 %');

test('CASO 8 · escala de 2027 en el caso normal: 30 años son el 84,20 % y 25 años el 72,80 %', async ({ page }) => {
  // 1970 · 30 años (360 meses) · 2.000 € → 67 años en 2037 → escala de 2027
  await simular(page, 1970, 30, 2000);
  await expect(page.getByRole('status').first()).toContainText('Te jubilarías en 2037');
  // 50 + 180 × 0,19. Con la escala de 2026 saldría 85,18 (+0,98).
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('84,20'));
  await expect(valorDe(page, 'Base reguladora (25 años / 350)')).toContainText('1714,29');
  // 1.714,2857 × 84,20 % = 1.443,43. Con la de 2026, 1.460,23: el defecto mueve ~17 €,
  // así que precisión 2 (medio céntimo) es holgada para lo que vigila.
  expect(await importeDe(page, 'Pensión mensual estimada (bruta)')).toBeCloseTo(1443.43, 2);
  expect(await importeDe(page, 'Pensión anual (14 pagas)')).toBeCloseTo(20208.00, 2);
  // 444 − 360 = 84 meses. Con la de 2026 serían 78 sobre «36 años y 6 meses en total».
  await expect(filaCien(page)).toHaveText('7 años más de cotización (37 años en total)');

  // El caso de la sospecha S0163: 25 años (300 meses) → 72,80 % desde 2027 (73,78 % en 2026).
  await simular(page, 1975, 25, 1800);
  await expect(page.getByRole('status').first()).toContainText('Te jubilarías en 2042');
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('72,80'));
  // 1.800 × 300/350 = 1.542,857 × 72,80 % = 1.123,20
  expect(await importeDe(page, 'Pensión mensual estimada (bruta)')).toBeCloseTo(1123.20, 2);
  await expect(filaCien(page)).toHaveText('12 años más de cotización (37 años en total)');
});

test('CASO 9 · frontera 2026/2027: los mismos meses dan porcentajes distintos según el año, y el 100 % llega justo a los 37 años', async ({ page }) => {
  // ── 25 años (300 meses) ──
  // 1959 → año de jubilación anterior a 2027 → escala 2023-2026: 60,29 + 71 × 0,19 = 73,78
  await simular(page, 1959, 25, 2000);
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('73,78'));
  await expect(filaCien(page)).toHaveText('11 años y 6 meses más de cotización (36 años y 6 meses en total)');
  // 1960 → 67 años en 2027 → escala de 2027: 50 + 120 × 0,19 = 72,80
  await simular(page, 1960, 25, 2000);
  await expect(page.getByRole('status').first()).toContainText('Te jubilarías en 2027');
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('72,80'));
  // 1.714,2857 × 72,80 % = 1.248,00 (la dual de 2027, 304/354,67, queda por debajo)
  expect(await importeDe(page, 'Pensión mensual estimada (bruta)')).toBeCloseTo(1248.00, 2);

  // ── 36 años y 6 meses (438 meses) ──
  await simular(page, 1959, '36,5', 2000);
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('100,00'));
  await expect(page.getByText('Para llegar al 100 %', { exact: true })).toHaveCount(0);
  await simular(page, 1960, '36,5', 2000);
  // 97,12 + (438 − 428) × 0,18 = 98,92
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('98,92'));
  await expect(filaCien(page)).toHaveText('6 meses más de cotización (37 años en total)');
  // 1.714,2857 × 98,92 % = 1.695,77
  expect(await importeDe(page, 'Pensión mensual estimada (bruta)')).toBeCloseTo(1695.77, 2);

  // ── Empezar a cotizar a los 30 y jubilarse a los 67 con 37 años (444 meses) ──
  await simular(page, 1980, 37, 2000);
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('100,00'));
  await expect(page.getByText('Para llegar al 100 %', { exact: true })).toHaveCount(0);
  // Un mes menos (443): 97,12 + 15 × 0,18 = 99,82, y falta exactamente 1 mes.
  await simular(page, 1980, '36,92', 2000);
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('99,82'));
  await expect(filaCien(page)).toHaveText('1 mes más de cotización (37 años en total)');
});

test('CASO 10 · el tope máximo depende de la escala: 26,5 años sobre la base máxima NO topan desde 2027', async ({ page }) => {
  // 1980 · 26,5 años (318 meses) · base máxima BASES_SS_2026.maxima = 5.101,20, con millar.
  await simular(page, 1980, '26,5', '5.101,20');
  await expect(valorDe(page, 'Base reguladora (25 años / 350)')).toContainText('4372,46');
  // 50 + 138 × 0,19 = 76,22 % (con la de 2026, 77,20 %)
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('76,22'));
  // 4.372,4571 × 76,22 % = 3.332,69 < 3.359,60. Con la escala de 2026 saldría 3.375,54 y la app
  // recortaría a 3.359,60: el defecto movería la cifra 26,91 €.
  expect(await importeDe(page, 'Pensión mensual estimada (bruta)')).toBeCloseTo(3332.69, 2);
  await expect(page.getByText('Tope máximo aplicado', { exact: true })).toHaveCount(0);
});

test('CASO 11 · mínimo de acceso justo: 15 años son el 50 % y quedan bajo la mínima, con aviso', async ({ page }) => {
  // 1985 · 15 años (180 meses = COTIZACION_MINIMA.mesesMinimosAcceso) · 1.500 €
  await simular(page, 1985, 15, '1.500');
  await expect(page.getByRole('alert').filter({ hasText: 'Se necesitan al menos' })).toHaveCount(0);
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('50,00'));
  // 1.500 × 300/350 = 1.285,71 × 50 % = 642,86 < minimaSinConyuge 888,70
  expect(await importeDe(page, 'Pensión mensual estimada (bruta)')).toBeCloseTo(642.86, 2);
  await expect(page.getByText(/queda por debajo de la pensión mínima/)).toHaveCount(1);
  // 444 − 180 = 264 meses = 22 años
  await expect(filaCien(page)).toHaveText('22 años más de cotización (37 años en total)');
});

test.describe('CASO 12 · móvil (390 px), tecleando pulsación a pulsación', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('un «-» suelto se rechaza, y «1.234,56» con 30 años da 891,00 € sin aviso de mínimos', async ({ page }) => {
    await page.selectOption(SEL.anio, '1970');
    const anos = page.locator(SEL.anos);
    const base = page.locator(SEL.base);

    // ── «-» suelto: el control lo deja escribir (es el principio de un negativo) ──
    await anos.tap();
    await anos.pressSequentially('-', { delay: 50 });
    await esperarValorEnReact(page, SEL.anos, '-');
    await base.tap();
    await base.pressSequentially('1.234,56', { delay: 50 });
    await esperarValorEnReact(page, SEL.base, '1.234,56');
    await page.locator(SEL.btnCalcular).tap();
    await expect(page.getByRole('alert').filter({ hasText: 'Introduce los años cotizados' }))
      .toContainText('Introduce los años cotizados (entre 1 y 50).');
    await expect(page.getByText('Pensión mensual estimada (bruta)', { exact: true })).toHaveCount(0);

    // ── 30 años ──
    await anos.fill('');
    await anos.tap();
    await anos.pressSequentially('30', { delay: 50 });
    await esperarValorEnReact(page, SEL.anos, '30');
    await page.locator(SEL.btnCalcular).tap();
    // 1.234,56 × 300/350 = 1.058,1943 × 84,20 % = 891,00. Si el millar se leyera como
    // decimal (1,23456 €) la base no pasaría el mínimo de 100 € y saldría un error.
    await expect(valorDe(page, 'Base reguladora (25 años / 350)')).toContainText('1058,19');
    expect(await importeDe(page, 'Pensión mensual estimada (bruta)')).toBeCloseTo(891.00, 2);
    // 891,00 > 888,70: por 2,30 € NO hay aviso de mínimos (con la escala de 2026, 901,37).
    await expect(page.getByText(/queda por debajo de la pensión mínima/)).toHaveCount(0);
    const pension = valorDe(page, 'Pensión mensual estimada (bruta)');
    await pension.scrollIntoViewIfNeeded();
    await expect(pension).toBeInViewport();
    // Nada desborda en horizontal a 390 px.
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

// ── Hallazgos ABIERTOS el 04/10/2026 ─────────────────────────────────────────────

test('CASO 13 · tras un error, el resultado anterior NO debe seguir publicado', async ({ page }) => {
  test.fail(true, 'ABIERTO (04/10/2026): calcular() pone el error y sale sin borrar resultadoEdad/resultadoPension; la tarjeta de edad además interpola el campo VIVO («Con 12 años cotizados, no alcanzas…») junto a una pensión de 1.443,43 €.');
  await simular(page, 1970, 30, 2000);
  expect(await importeDe(page, 'Pensión mensual estimada (bruta)')).toBeCloseTo(1443.43, 2);

  // 12 años: por debajo de COTIZACION_MINIMA.anosMinimosAcceso. Preparación verificada:
  await sembrarValor(page, SEL.anos, 12);
  await page.locator(SEL.btnCalcular).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Se necesitan al menos' }))
    .toContainText('Se necesitan al menos 15 años cotizados para acceder a pensión.');

  // Lo que debe pasar (como en el caso 7 sobre página limpia): ninguna pensión a la vista.
  await expect(page.getByText('Pensión mensual estimada (bruta)', { exact: true })).toHaveCount(0);
});

test('CASO 14 · nacido en 1959: la edad del titular y la «Edad ordinaria» deben salir de la misma fila de la tabla', async ({ page }) => {
  test.fail(true, 'ABIERTO (04/10/2026): calcularEdadJubilacion toma la edad de la fila de 2026 (66a10m) pero devuelve anioJubilacion = 1959 + 66 = 2025, y la fila «Edad ordinaria» se calcula con 2025 (66a8m). Para 1955-1956 llega a decir «67 años» en 2022-2023 (getEdadJubilacion devuelve la fila de 2027 para años anteriores a 2024).');
  await simular(page, 1959, 25, 2000);
  // Preparación: el cálculo se hizo (el porcentaje de la escala 2023-2026 es correcto).
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('73,78'));
  await expect(page.getByRole('status').first()).toContainText('66 años y 10 meses');

  // TABLA_EDAD_JUBILACION: 66a10m es la edad de 2026 (2025 era 66a8m). Lo coherente:
  await expect(valorDe(page, 'Edad ordinaria de jubilación')).toHaveText('66 años y 10 meses');
  await expect(page.getByRole('status').first()).toContainText('Te jubilarías en 2026');
});

test('CASO 15 · el escenario de Carlos debe dar lo que la propia calculadora da para él (escala de 2027)', async ({ page }) => {
  test.fail(true, 'ABIERTO (04/10/2026): el escenario «Carlos, 64 años, 28 cotizados, 1.200 €» sigue con la escala de 2026 (80,62 %, 829,23 €, 85,18 %). Nacido en 1962, se jubila en 2029: 79,64 %, 819,16 €, y con 2 años más 84,20 %.');
  // Lo que la app calcula para Carlos (nacido en 1962: 64 años en 2026):
  await simular(page, 1962, 28, 1200);
  await expect(valorDe(page, 'Porcentaje por años cotizados')).toHaveText(pct('79,64'));
  expect(await importeDe(page, 'Pensión mensual estimada (bruta)')).toBeCloseTo(819.16, 2);

  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const carlos = page.locator('[class*="escenarioCard"]').filter({ hasText: 'Carlos' });
  await expect(carlos).toHaveCount(1);
  await expect(carlos).toContainText('79,64');
});

test('CASO 16 · el punto de equilibrio de la anticipada no puede dar dos cifras distintas en la misma página', async ({ page }) => {
  test.fail(true, 'ABIERTO (04/10/2026): la FAQ dice «entre 10 y 15 años» y la tarjeta «Evalúa el break-even», «del orden de 15 a 20 años». A mano: 2 × (1 − r) / r = 10,5 años (r = 16 %) y 13,3 (r = 13,04 %) desde la edad ordinaria; 12,5-15,3 desde la anticipada.');
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByText('El punto de equilibrio suele estar entre 10 y 15 años.', { exact: false })).toHaveCount(1);
  const tarjeta = page.locator('[class*="tipCard"]').filter({ hasText: 'Evalúa el break-even' });
  await expect(tarjeta).toHaveCount(1);
  await expect(tarjeta).not.toContainText('15 a 20 años');
});

test('CASO 17 · el porcentaje va separado de su signo por un espacio duro (CLAUDE.md §2, 25/09/2026)', async ({ page }) => {
  test.fail(true, 'ABIERTO (04/10/2026): la app pega el «%» con `formatNumber(x, 2)}%` (porcentaje, reducción, barra, % sobre sueldo) en vez de usar formatPercentage.');
  await simular(page, 1970, 30, 2000);
  const valor = valorDe(page, 'Porcentaje por años cotizados');
  await expect(valor).toHaveText(pct('84,20'));
  expect(await valor.textContent()).toBe('84,20 %');
});

test('CASO 18 · el DataReference debe acreditar el sello propio de la escala del porcentaje', async ({ page }) => {
  test.fail(true, 'ABIERTO (04/10/2026): solo muestra FISCAL_PENSIONES_META (21/09/2026). La escala de 2027, la que aplica a casi todo usuario, se transcribió del BOE el 30/09/2026 con sello propio (ESCALA_PORCENTAJE_PENSION_META), que el módulo separó porque el general no la ampara; el motor del MCP sí lo cita en fuenteDatos.');
  const ref = page.getByRole('note', { name: 'Datos de referencia normativos' });
  await expect(ref).toContainText('Última verificación');
  await expect(ref).toContainText('30/09/2026');
});

test('CASO 19 · título, JSON-LD y DataReference dicen el mismo año (b7ec248c)', async ({ page }) => {
  // FISCAL_PENSIONES_META.vigencia = '2026'
  await expect(page).toHaveTitle('Simulador de Jubilación Pública 2026 — Edad, pensión y anticipada | meskeIA');
  const ref = page.getByRole('note', { name: 'Datos de referencia normativos' });
  await expect(ref).toContainText('Jubilación y Pensiones 2026');

  const ld = (await page.evaluate(() =>
    [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent ?? '{}')),
  )) as Array<Record<string, unknown>>;
  const faq = ld.find((j) => j['@type'] === 'FAQPage') as
    | { mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }> }
    | undefined;
  expect(faq).toBeTruthy();
  expect(faq!.mainEntity[0].name).toBe('¿A qué edad me puedo jubilar en España en 2026?');
  // La FAQ del JSON-LD da las DOS escalas, como la de la página: no promete el 100 % a los
  // 36 años y 6 meses a quien se jubila desde 2027.
  expect(faq!.mainEntity[1].acceptedAnswer.text).toContain('Desde 2027 la escala cambia');
  expect(faq!.mainEntity[1].acceptedAnswer.text).toContain('hasta el 100% a los 37 años');
  const web = ld.find((j) => j['@type'] === 'WebApplication');
  expect(web?.name).toBe('Simulador de Jubilación Pública');
});
