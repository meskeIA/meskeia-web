import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { PLUSVALIA_MUNICIPAL_META } from '../../data/fiscal/inmuebles';
import { parseSpanishNumber } from '../../lib/formatters';

/**
 * estimador-plusvalia-municipal — el coeficiente del método objetivo del IIVTNU
 * Escrito el 24/09/2026, al reparar los hallazgos 1559 y 1560 del Inspector.
 *
 * QUÉ DEFECTOS TENÍA
 * ──────────────────
 *  · 1559 — la tabla de coeficientes máximos era la que el RDL 26/2021 dio al art. 107.4
 *    TRLRHL (vigente del 10/11/2021 al 31/12/2022): 7 años → 0,12, 20 o más → 0,45. La vigente
 *    es la del art. 24 del RDL 8/2023, cotejada ese día en el BOE (BOE-A-2004-4214, bloque
 *    a107, versión del 28/01/2026: las actualizaciones posteriores decayeron):
 *        <1 año 0,15 · 1 0,15 · 2 0,14 · 3 0,14 · 4 0,16 · 5 0,18 · 6 0,19 · 7 0,20 · 8 0,19 ·
 *        9 0,15 · 10 0,12 · 11 0,10 · 12-15 0,09 · 16 0,10 · 17 0,13 · 18 0,17 · 19 0,23 ·
 *        igual o superior a 20 años 0,40
 *  · 1560 — por debajo del año, el art. 107.4 manda prorratear el coeficiente anual «teniendo
 *    en cuenta el número de meses completos». La FAQ de la app lo prometía y el cálculo
 *    aplicaba el 0,15 entero a cualquier reventa dentro del año. Desde la reparación, al elegir
 *    «Menos de 1 año» aparece un selector de meses completos y sin él no se calcula.
 *
 * Todas las cifras esperadas de este fichero están resueltas A MANO con la tabla de arriba y
 * escritas literales, tal como las pinta `formatCurrency` (es-ES: los importes de cuatro
 * cifras enteras van SIN punto de millar, «2000,00 €»).
 */

const RUTA = '/estimador-plusvalia-municipal/';

const SUELO = 'input[aria-label="Valor catastral del suelo (€)"]';
const TIPO = 'input[aria-label="Tipo impositivo municipal (%)"]';
const ANIOS = 'select[aria-label="Años de tenencia del inmueble"]';
const MESES = '#meses-tenencia';

/** Abre la app y espera a que React haya montado los dos campos de texto. */
async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [SUELO, TIPO]);
}

/** Escribe en un NumberInput y comprueba que el ESTADO de React lo recogió. */
async function escribir(page: Page, selector: string, valor: string): Promise<void> {
  const campo = page.locator(selector);
  await campo.fill(valor);
  await esperarValorEnReact(page, campo, valor);
}

/** Valor que pinta la tarjeta de resultado cuyo título es `titulo` (la primera, la del objetivo). */
async function tarjeta(page: Page, titulo: string): Promise<string> {
  const card = page.locator('h3', { hasText: titulo }).first().locator('xpath=../..');
  return (await card.locator('p').first().innerText()).replace(/\s+/g, ' ').trim();
}

/** El distintivo «Coeficiente: …» que acompaña a la etiqueta de los años. */
function distintivo(page: Page) {
  return page.locator('label', { hasText: 'Años de tenencia' }).locator('span');
}

const BOTON = 'button[aria-label="Obtener estimación orientativa"]';

test.describe('Estimador de plusvalía municipal — coeficientes del art. 107.4 TRLRHL', () => {
  /**
   * CASO NORMAL — 7 años, el coeficiente más alto de la tabla por debajo de los 20.
   *
   *   Valor catastral del suelo 40.000 €, 7 años de tenencia, tipo municipal 25 %
   *   Coeficiente (art. 107.4, 7 años)       0,20
   *   Base imponible = 40.000 × 0,20        = 8.000,00 €
   *   Cuota          = 8.000 × 25 %         = 2.000,00 €
   *
   * Con la tabla caducada del RDL 26/2021 (0,12) salían 4.800,00 € de base y 1.200,00 € de
   * cuota: 800,00 € menos de lo que la ley vigente permite liquidar al Ayuntamiento.
   */
  test('CASO NORMAL — 40.000 € de suelo, 7 años y tipo del 25 %: 40.000 × 0,20 × 25 % = 2000,00 €', async ({
    page,
  }) => {
    await abrir(page);

    await escribir(page, SUELO, '40000');
    await escribir(page, TIPO, '25');
    await page.locator(ANIOS).selectOption('7');
    // El distintivo sale del estado de React: si lo pinta, la selección llegó
    await expect(distintivo(page)).toHaveText('Coeficiente: 0,20');
    // Y el desplegable enseña el mismo coeficiente junto a la opción
    await expect(page.locator(`${ANIOS} option[value="7"]`)).toHaveText('7 años (coef. 0,20)');

    await page.locator(BOTON).click();

    expect(await tarjeta(page, 'Base imponible estimada')).toBe('8000,00 €');
    expect(await tarjeta(page, 'Cuota orientativa')).toBe('2000,00 €');
    await expect(page.locator('p', { hasText: 'Coeficiente aplicado:' })).toContainText(
      'Coeficiente aplicado: 0,20'
    );
    // Sin meses que pedir: el selector solo existe por debajo del año
    await expect(page.locator(MESES)).toHaveCount(0);
  });

  /**
   * CASO BAJO EL AÑO — 6 meses completos: el coeficiente se PRORRATEA (hallazgo 1560).
   *
   *   Valor catastral del suelo 40.000 €, «Menos de 1 año» y 6 meses completos, tipo 25 %
   *   Coeficiente = 0,15 × 6/12              = 0,075 → el distintivo lo pinta con cuatro
   *                                            decimales: «0,0750»
   *   Base imponible = 40.000 × 0,075        = 3.000,00 €
   *   Cuota          = 3.000 × 25 %          =   750,00 €
   *
   * Antes de la reparación se aplicaba el 0,15 entero (0,14 con la tabla caducada): 6.000,00 €
   * de base y 1.500,00 € de cuota, el DOBLE de lo que la ley permite con seis meses.
   */
  test('CASO BAJO EL AÑO — 6 meses: 0,15 × 6/12 = 0,075 → 40.000 × 0,075 × 25 % = 750,00 €', async ({
    page,
  }) => {
    await abrir(page);

    await escribir(page, SUELO, '40000');
    await escribir(page, TIPO, '25');
    await page.locator(ANIOS).selectOption('0');
    await expect(page.locator(`${ANIOS} option[value="0"]`)).toHaveText('Menos de 1 año (coef. 0,15)');

    // El selector de meses aparece solo con «Menos de 1 año»
    await expect(page.locator(MESES)).toBeVisible();
    await page.locator(MESES).selectOption('6');
    await expect(distintivo(page)).toHaveText('Coeficiente: 0,0750');

    await page.locator(BOTON).click();

    expect(await tarjeta(page, 'Base imponible estimada')).toBe('3000,00 €');
    expect(await tarjeta(page, 'Cuota orientativa')).toBe('750,00 €');
  });

  /**
   * CASO DE RECHAZO — «Menos de 1 año» sin decir cuántos meses: no se calcula.
   *
   * Sin los meses el prorrateo no tiene con qué hacerse, y aplicar el coeficiente anual
   * entero (lo que hacía la app antes del hallazgo 1560) daría una cuota por encima de la
   * que la ley admite para CUALQUIER número de meses por debajo de doce. La app tiene que
   * pedir el dato y no pintar ninguna cifra: ni resultado, ni el distintivo del coeficiente.
   *
   * Se parte de un resultado YA calculado (el del caso normal, 2000,00 €) para que «ninguna
   * cifra» signifique algo: el rechazo tiene que retirar la que había, no solo no pintar una.
   */
  test('CASO DE RECHAZO — menos de 1 año sin meses: aviso y ninguna cifra', async ({ page }) => {
    await abrir(page);

    await escribir(page, SUELO, '40000');
    await escribir(page, TIPO, '25');
    await page.locator(ANIOS).selectOption('7');
    await expect(distintivo(page)).toHaveText('Coeficiente: 0,20');
    await page.locator(BOTON).click();
    expect(await tarjeta(page, 'Cuota orientativa')).toBe('2000,00 €');

    await page.locator(ANIOS).selectOption('0');
    await expect(page.locator(MESES)).toBeVisible();
    await expect(page.locator(MESES)).toHaveValue('');
    // Sin meses no hay coeficiente que enseñar
    await expect(distintivo(page)).toHaveCount(0);

    await page.locator(BOTON).click();

    const aviso = page.locator('[role="alert"]', { hasText: 'Con menos de 1 año' });
    await expect(aviso).toContainText(
      'Con menos de 1 año, indica los meses completos: el coeficiente se prorratea por ellos.'
    );
    await expect(page.locator('h2', { hasText: 'Estimación orientativa' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Cuota orientativa' })).toHaveCount(0);
  });

  /**
   * LA TABLA DE COEFICIENTES del bloque educativo — la que el usuario consulta para
   * contrastar el coeficiente con la ordenanza de su Ayuntamiento.
   *
   *   «20 o más años» → 0,40 (art. 107.4 vigente: «Igual o superior a 20 años. 0,40»).
   *   Con la tabla caducada del RDL 26/2021 ponía 0,45.
   *
   * Y los dos extremos del desplegable dicen lo mismo que la tabla.
   */
  test('TABLA — «20 o más años» = 0,40, en la tabla y en el desplegable', async ({ page }) => {
    await abrir(page);

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const tabla = page.locator('table', { has: page.locator('th', { hasText: 'Coeficiente máximo' }) });
    const fila = tabla.locator('tr', { has: page.locator('td', { hasText: '20 o más años' }) });
    await expect(fila.locator('td').nth(1)).toHaveText('0,40');
    // 21 filas: menos de 1 año, de 1 a 19 años, y 20 o más
    await expect(tabla.locator('tbody tr')).toHaveCount(21);

    await expect(page.locator(`${ANIOS} option[value="20"]`)).toHaveText('20 o más años (coef. 0,40)');
  });
});

/* ════════════════════════════════════════════════════════════════════════════════════════
 * PRIMERA INSPECCIÓN — 25/09/2026 (Inspector, segmento FISCAL, riesgo 1)
 *
 * De dónde salen las cifras: TODAS resueltas a mano ANTES de ejecutar la app, con
 *   · `COEFICIENTES_IIVTNU_2025` / `coeficienteIIVTNU()` de data/fiscal/inmuebles.ts
 *     (art. 107.4 TRLRHL, redacción del art. 24 del RDL 8/2023; años completos, tope en
 *     «igual o superior a 20 años» y prorrateo por meses completos por debajo del año);
 *   · método real = (transmisión − adquisición) × VC suelo / VC total (art. 104.5 y 107.5
 *     TRLRHL, dentro de los arts. 104-110 que cita PLUSVALIA_MUNICIPAL_META.baseNormativa):
 *     si ese incremento es MENOR que la base objetiva, es la base; si no hay incremento,
 *     no hay sujeción;
 *   · tipo municipal ≤ PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal (30 %);
 *   · la escala de recargo extemporáneo de ESCALA_RECARGO_EXTEMPORANEO en
 *     lib/calculadoras/recargoPresentacionTardia.ts (art. 27.2 LGT, Ley 11/2021).
 * Los importes se escriben como los pinta `formatCurrency` (es-ES: cuatro cifras enteras
 * SIN punto de millar, «2970,00 €»; cinco o más, con él, «10.800,00 €»).
 *
 * QUÉ ESTÁ BIEN Y NO HAY QUE ROMPER (casos NORMAL, LÍMITE y RECHAZO de abajo, en verde)
 *   Los dos métodos calculan bien, el objetivo con `coeficienteIIVTNU()` también cuando se
 *   prorratea, y la comparación marca como «Más favorable» el de menor cuota en los dos
 *   sentidos; el tope de 20 años, el 30 % como máximo aceptado y el rechazo de un tipo por
 *   encima o de un importe ilegible («2.000.50») funcionan y retiran la cifra anterior.
 *
 * HALLAZGOS ABIERTOS: al final, con `test.fail()`. Afirman lo que DEBERÍA pasar, así que hoy
 * fallan a propósito; al repararlos se les quita la marca y quedan como candado. ⚠️ Dentro de
 * un `test.fail()` cualquier fallo cuenta como «esperado», también un selector roto: antes de
 * quitar la marca, comprobar que el test falla POR la afirmación que dice su título.
 * ════════════════════════════════════════════════════════════════════════════════════════ */

const REAL = 'input[aria-label="Activar comparación con método real"]';
const ADQUISICION = 'input[aria-label="Precio de adquisición (€)"]';
const TRANSMISION = 'input[aria-label="Precio de transmisión (€)"]';
const VC_TOTAL = 'input[aria-label="Valor catastral total del inmueble (€)"]';
/** El botón de calcular, por su texto VISIBLE: el `aria-label` es objeto de un hallazgo abierto. */
const CALCULAR = (page: Page) => page.locator('button', { hasText: 'Obtener orientación' });

interface DatosMetodoReal {
  adquisicion: string;
  transmision: string;
  total: string;
}

/** Activa el método real y rellena sus tres campos, comprobando cada uno en el estado de React. */
async function rellenarMetodoReal(page: Page, d: DatosMetodoReal): Promise<void> {
  await page.locator(REAL).check();
  await expect(page.locator(ADQUISICION)).toBeVisible();
  await escribir(page, ADQUISICION, d.adquisicion);
  await escribir(page, TRANSMISION, d.transmision);
  await escribir(page, VC_TOTAL, d.total);
}

/**
 * El encabezado de resultados de un método. Anclado al principio: sin ancla, «Método real»
 * casa también con «📊 Datos para el método real» del formulario (hasText no distingue
 * mayúsculas) y el localizador resuelve a dos elementos.
 */
function encabezado(page: Page, metodo: 'Método objetivo' | 'Método real'): Locator {
  return page.locator('h3', { hasText: new RegExp(`^${metodo}`) });
}

/** El bloque de resultados de un método, a partir de su encabezado. */
function seccion(page: Page, metodo: 'Método objetivo' | 'Método real'): Locator {
  return encabezado(page, metodo).locator('xpath=..');
}

/** Valor de la tarjeta `titulo` DENTRO del bloque de un método. */
async function cifraDe(bloque: Locator, titulo: string): Promise<string> {
  const card = bloque.locator('h3', { hasText: titulo }).locator('xpath=../..');
  return (await card.locator('p').first().innerText()).replace(/\s+/g, ' ').trim();
}

/** Abre la guía educativa (nace plegada). */
async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.locator('h2', { hasText: 'Preguntas frecuentes (FAQ)' })).toBeVisible();
}

test.describe('Estimador de plusvalía municipal — inspección del 25/09/2026: los dos métodos', () => {
  /**
   * CASO NORMAL — gana el método REAL (art. 107.5: su incremento es menor que la base objetiva).
   *
   *   VC suelo 60.000 € · VC total 100.000 € (suelo = 60 %) · 5 años · tipo 27,5 %
   *   Adquisición 200.000 € · transmisión 215.000 €
   *   Objetivo: coeficiente (5 años) 0,18 → base 60.000 × 0,18 = 10.800,00 €
   *             cuota 10.800 × 27,5 % = 2.970,00 €
   *   Real:     incremento 15.000 × 60 % = 9.000,00 € (< 10.800 → es la base)
   *             cuota 9.000 × 27,5 % = 2.475,00 €
   *   → «Más favorable» en el real, no en el objetivo. El tipo con coma decimal («27,5») es
   *     parte del caso: se lee con parseSpanishNumber.
   */
  test('NORMAL — 60.000 € de suelo, 5 años, 27,5 %: objetivo 2970,00 €, real 2475,00 € y gana el real', async ({ page }) => {
    await abrir(page);
    await escribir(page, SUELO, '60000');
    await escribir(page, TIPO, '27,5');
    await page.locator(ANIOS).selectOption('5');
    await expect(distintivo(page)).toHaveText('Coeficiente: 0,18');
    await rellenarMetodoReal(page, { adquisicion: '200000', transmision: '215000', total: '100000' });

    await CALCULAR(page).click();

    const objetivo = seccion(page, 'Método objetivo');
    const real = seccion(page, 'Método real');
    expect(await cifraDe(objetivo, 'Base imponible estimada')).toBe('10.800,00 €');
    expect(await cifraDe(objetivo, 'Cuota orientativa')).toBe('2970,00 €');
    expect(await cifraDe(real, 'Base imponible estimada')).toBe('9000,00 €');
    expect(await cifraDe(real, 'Cuota orientativa')).toBe('2475,00 €');
    await expect(encabezado(page, 'Método real')).toContainText('Más favorable');
    await expect(encabezado(page, 'Método objetivo')).not.toContainText('Más favorable');
  });

  /**
   * CASO LÍMITE — PRORRATEO por meses DENTRO de la comparación: 3 meses completos.
   *
   *   VC suelo 80.000 € · VC total 160.000 € (suelo = 50 %) · «Menos de 1 año» + 3 meses · 30 %
   *   Adquisición 300.000 € · transmisión 310.000 €
   *   Objetivo: coeficienteIIVTNU(0, 3) = 0,15 × 3/12 = 0,0375 → base 80.000 × 0,0375 = 3.000,00 €
   *             cuota 3.000 × 30 % = 900,00 €
   *   Real:     incremento 10.000 × 50 % = 5.000,00 € → cuota 1.500,00 €
   *   → gana el OBJETIVO. El caso discrimina el prorrateo en la comparación: con el 0,15 entero
   *     la base objetiva sería 12.000,00 € (cuota 3.600,00 €) y ganaría el real.
   *   El 30 % es además el máximo legal (PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal): se acepta.
   */
  test('LÍMITE — 3 meses: 0,15 × 3/12 = 0,0375, objetivo 900,00 € frente a real 1500,00 €, gana el objetivo', async ({ page }) => {
    await abrir(page);
    await escribir(page, SUELO, '80000');
    await escribir(page, TIPO, '30');
    await page.locator(ANIOS).selectOption('0');
    await page.locator(MESES).selectOption('3');
    await expect(distintivo(page)).toHaveText('Coeficiente: 0,0375');
    await rellenarMetodoReal(page, { adquisicion: '300000', transmision: '310000', total: '160000' });

    await CALCULAR(page).click();

    const objetivo = seccion(page, 'Método objetivo');
    const real = seccion(page, 'Método real');
    expect(await cifraDe(objetivo, 'Base imponible estimada')).toBe('3000,00 €');
    expect(await cifraDe(objetivo, 'Cuota orientativa')).toBe('900,00 €');
    expect(await cifraDe(real, 'Base imponible estimada')).toBe('5000,00 €');
    expect(await cifraDe(real, 'Cuota orientativa')).toBe('1500,00 €');
    await expect(encabezado(page, 'Método objetivo')).toContainText('Más favorable');
    await expect(encabezado(page, 'Método real')).not.toContainText('Más favorable');
    await expect(page.locator('p', { hasText: 'Coeficiente aplicado:' })).toContainText('Coeficiente aplicado: 0,0375');
  });

  /**
   * CASO LÍMITE — TOPE de 20 años («igual o superior a 20 años», art. 107.4).
   *
   *   VC suelo 30.000 € · «20 o más años» · tipo 30 %
   *   Coeficiente 0,40 → base 30.000 × 0,40 = 12.000,00 € · cuota 12.000 × 30 % = 3.600,00 €
   *   (Con la tabla caducada del RDL 26/2021, 0,45: 13.500,00 € y 4.050,00 €.)
   */
  test('LÍMITE — 20 o más años: 30.000 × 0,40 × 30 % = 3600,00 €', async ({ page }) => {
    await abrir(page);
    await escribir(page, SUELO, '30000');
    await escribir(page, TIPO, '30');
    await page.locator(ANIOS).selectOption('20');
    await expect(distintivo(page)).toHaveText('Coeficiente: 0,40');

    await CALCULAR(page).click();

    const objetivo = seccion(page, 'Método objetivo');
    expect(await cifraDe(objetivo, 'Base imponible estimada')).toBe('12.000,00 €');
    expect(await cifraDe(objetivo, 'Cuota orientativa')).toBe('3600,00 €');
  });

  /**
   * CASO LÍMITE — PÉRDIDA: sin incremento real no hay sujeción (art. 104.5 TRLRHL).
   *
   *   VC suelo 50.000 € · VC total 100.000 € · 10 años · 30 % · 180.000 € → 130.000 €
   *   Real: incremento −50.000 € → no sujeción, cuota 0.
   *   Lo que la app hace bien (y fija este test): el bloque del método real lo dice y no pinta
   *   ninguna cuota. Lo que no: ver el hallazgo «PÉRDIDA» al final.
   */
  test('LÍMITE — pérdida (180.000 → 130.000 €): el método real declara que no se devenga', async ({ page }) => {
    await abrir(page);
    await escribir(page, SUELO, '50000');
    await escribir(page, TIPO, '30');
    await page.locator(ANIOS).selectOption('10');
    await rellenarMetodoReal(page, { adquisicion: '180000', transmision: '130000', total: '100000' });

    await CALCULAR(page).click();

    const real = seccion(page, 'Método real');
    await expect(real).toContainText('Sin incremento real de valor');
    await expect(real).toContainText('no se devenga el impuesto');
    await expect(real.locator('h3', { hasText: 'Cuota orientativa' })).toHaveCount(0);
  });

  /**
   * CASO DE RECHAZO — tipo por encima del máximo legal y valor ilegible.
   *
   *   · Tipo 30,5 % > 30 % (PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal) → aviso, sin cifra.
   *   · VC suelo «2.000.50» (dos puntos, el último no agrupa millares): parseSpanishNumber da
   *     NaN → aviso, sin cifra.
   * Se parte de un resultado YA calculado (40.000 € · 7 años · 30 % → 40.000 × 0,20 × 30 % =
   * 2.400,00 €) para que «sin cifra» signifique que el rechazo RETIRA la que había.
   */
  test('RECHAZO — tipo 30,5 % y suelo «2.000.50»: aviso y ninguna cifra', async ({ page }) => {
    await abrir(page);
    await escribir(page, SUELO, '40000');
    await escribir(page, TIPO, '30');
    await page.locator(ANIOS).selectOption('7');
    await CALCULAR(page).click();
    expect(await cifraDe(seccion(page, 'Método objetivo'), 'Cuota orientativa')).toBe('2400,00 €');

    await escribir(page, TIPO, '30,5');
    await CALCULAR(page).click();
    await expect(page.locator('[role="alert"]', { hasText: 'tipo impositivo municipal' })).toContainText(
      'El tipo impositivo municipal debe estar entre 0,01% y 30%.'
    );
    await expect(page.locator('h2', { hasText: 'Estimación orientativa' })).toHaveCount(0);

    await escribir(page, TIPO, '30');
    await escribir(page, SUELO, '2.000.50');
    await CALCULAR(page).click();
    await expect(page.locator('[role="alert"]', { hasText: 'valor catastral del suelo' })).toContainText(
      'Introduce el valor catastral del suelo (mayor que 0).'
    );
    await expect(page.locator('h2', { hasText: 'Estimación orientativa' })).toHaveCount(0);
  });

  /**
   * TESTIGO del dato escrito a mano (hallazgo `dato` de esta inspección): el valor por defecto
   * del tipo (page.tsx: `useState('25')`) y el tope de la validación (`tipoNum > 30`) están
   * escritos a mano, pero existen en data/fiscal como PLUSVALIA_MUNICIPAL_META.tipoOrientativo
   * (25) y .tipoMaximoLegal (30). Hoy coinciden, así que este test pasa; el día que el módulo
   * cambie y la app no le siga, se pone rojo. Leer la cifra del MÓDULO es lo que lo hace testigo.
   */
  test('TESTIGO — el tipo por defecto y el máximo aceptado son los de PLUSVALIA_MUNICIPAL_META', async ({ page }) => {
    await abrir(page);
    await expect(page.locator(TIPO)).toHaveValue(String(PLUSVALIA_MUNICIPAL_META.tipoOrientativo));

    await escribir(page, SUELO, '40000');
    await page.locator(ANIOS).selectOption('7');
    const maximo = String(PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal);
    await escribir(page, TIPO, maximo);
    await CALCULAR(page).click();
    await expect(page.locator('h2', { hasText: 'Estimación orientativa' })).toHaveCount(1);

    await escribir(page, TIPO, `${maximo},5`);
    await CALCULAR(page).click();
    await expect(page.locator('h2', { hasText: 'Estimación orientativa' })).toHaveCount(0);
  });
});

test.describe('Estimador de plusvalía municipal — hallazgos abiertos del 25/09/2026', () => {
  /**
   * HALLAZGO (sospecha de SOSPECHAS.md, 1.ª parte) — escala de recargo DEROGADA en tres sitios.
   *
   * La FAQ «¿Puedo aplazar el pago si heredo…?» dice «5% (1-3 meses), 10% (3-6 meses) o 15%
   * (6-12 meses)»; el paso 6 «Presenta en plazo», «desde el 5% hasta el 20%»; y el error
   * frecuente «No autoliquidar en plazo», «5% (hasta 3 meses tarde), 10% (hasta 6 meses), 15%
   * (hasta 12 meses) o 20% (más de 12 meses)». Es la escala anterior a la Ley 11/2021.
   *
   * DEBERÍA decir la de ESCALA_RECARGO_EXTEMPORANEO (art. 27.2 LGT): 1 % más 1 % por cada mes
   * completo de retraso por debajo de 12 meses; transcurridos 12, 15 % más intereses de demora.
   * Sobre la cuota del caso NORMAL (2.970,00 €): 4 meses tarde → 5 % = 148,50 € (la FAQ dice
   * 10 % = 297,00 €); más de 12 meses → 15 % = 445,50 € + intereses (el aviso dice 20 % =
   * 594,00 €); menos de un mes → 1 % = 29,70 € (el aviso dice 5 % = 148,50 €).
   */
  test.fail('RECARGOS — ningún texto sirve la escala 5/10/15/20 % anterior a la Ley 11/2021', async ({ page }) => {
    await abrir(page);
    await abrirGuia(page);
    const textos = [
      page.locator('dd', { hasText: 'aplazamiento o fraccionamiento' }),
      page.locator('li', { hasText: 'Presenta en plazo' }),
      page.locator('li', { hasText: 'No autoliquidar en plazo' }),
    ];
    for (const t of textos) {
      await expect(t).toHaveCount(1);
      const texto = (await t.innerText()).replace(/\s+/g, ' ');
      // Ni el 5 % como suelo ni el 20 % como techo: el suelo vigente es el 1 %, el techo el 15 %
      expect(texto).not.toMatch(/(^|[^\d,])5\s?%/);
      expect(texto).not.toMatch(/20\s?%/);
    }
  });

  /**
   * HALLAZGO (sospecha de SOSPECHAS.md, 2.ª parte) — el aviso dice «puede ser inferior al 30%
   * que fijamos por defecto», pero el campo arranca en 25 (page.tsx, `useState('25')`, igual
   * que PLUSVALIA_MUNICIPAL_META.tipoOrientativo). El texto hace creer que la cifra es un TECHO
   * y no lo es: con 40.000 € de suelo y 7 años la app da 2.000,00 € al 25 % por defecto, y un
   * Ayuntamiento al máximo legal cobraría 40.000 × 0,20 × 30 % = 2.400,00 €.
   * DEBERÍA: el porcentaje del texto y el valor inicial del campo, el mismo.
   */
  test.fail('TIPO POR DEFECTO — el texto «…% que fijamos por defecto» dice el valor con que arranca el campo', async ({ page }) => {
    await abrir(page);
    const inicial = parseSpanishNumber(await page.locator(TIPO).inputValue());
    const aviso = await page.locator('li', { hasText: 'que fijamos por defecto' }).innerText();
    const m = aviso.match(/(\d+(?:,\d+)?)\s?% que fijamos por defecto/);
    expect(m).not.toBeNull();
    expect(parseSpanishNumber(m![1])).toBe(inicial);
  });

  /**
   * HALLAZGO — PÉRDIDA: la comparación no da veredicto y la única cuota en pantalla es la del
   * objetivo. Con 50.000 € de suelo, 10 años, 30 % y 180.000 → 130.000 €, el bloque objetivo
   * pinta «Cuota orientativa 1800,00 €» (50.000 × 0,12 × 30 %) y NINGÚN método lleva «Más
   * favorable», porque `metodoRecomendado` solo se decide si hay incremento real. Sin incremento
   * no hay sujeción (art. 104.5 TRLRHL), la cuota es 0 y la propia regla de la app («aplica el
   * que resulte en una cuota menor») señala al real.
   * DEBERÍA: si el objetivo sigue a la vista, el real lleva «Más favorable».
   */
  test.fail('PÉRDIDA — con 180.000 → 130.000 € el método real (no sujeción) sale como el más favorable', async ({ page }) => {
    await abrir(page);
    await escribir(page, SUELO, '50000');
    await escribir(page, TIPO, '30');
    await page.locator(ANIOS).selectOption('10');
    await rellenarMetodoReal(page, { adquisicion: '180000', transmision: '130000', total: '100000' });
    await CALCULAR(page).click();

    await expect(seccion(page, 'Método real')).toContainText('Sin incremento real de valor');
    if ((await encabezado(page, 'Método objetivo').count()) > 0) {
      await expect(encabezado(page, 'Método real')).toContainText('Más favorable', { timeout: 2000 });
    }
  });

  /**
   * HALLAZGO — el resultado no se retira al cambiar los datos y «Coeficiente aplicado» se
   * recalcula solo: con 40.000 €, 7 años y 30 % la app da base 8.000,00 € (× 0,20); al pasar
   * a «20 o más años» SIN volver a calcular, la base sigue en 8.000,00 € y la nota dice
   * «Coeficiente aplicado: 0,40». 40.000 × 0,40 = 16.000,00 € ≠ 8.000,00 €.
   * DEBERÍA: lo que haya en pantalla cuadrar consigo mismo (base = suelo × coeficiente
   * aplicado), sea retirando el resultado, recalculando o dejando la nota del cálculo hecho.
   */
  test.fail('DESCUADRE — tras cambiar los años sin recalcular, base = suelo × «Coeficiente aplicado»', async ({ page }) => {
    await abrir(page);
    await escribir(page, SUELO, '40000');
    await escribir(page, TIPO, '30');
    await page.locator(ANIOS).selectOption('7');
    await CALCULAR(page).click();
    expect(await cifraDe(seccion(page, 'Método objetivo'), 'Base imponible estimada')).toBe('8000,00 €');

    await page.locator(ANIOS).selectOption('20');
    await expect(distintivo(page)).toHaveText('Coeficiente: 0,40');

    if ((await page.locator('h2', { hasText: 'Estimación orientativa' }).count()) > 0) {
      const base = parseSpanishNumber(await cifraDe(seccion(page, 'Método objetivo'), 'Base imponible estimada'));
      const nota = await page.locator('p', { hasText: 'Coeficiente aplicado:' }).innerText();
      const coef = parseSpanishNumber(nota.match(/Coeficiente aplicado:\s*([\d,]+)/)![1]);
      // Precisión de céntimo: el defecto que vigila es de miles de euros (8.000 frente a 16.000)
      expect(base).toBeCloseTo(40000 * coef, 2);
    }
  });

  /**
   * HALLAZGO — valor catastral del suelo MAYOR que el total: la app no lo rechaza como
   * incoherente, sino que pide «Rellena todos los datos del método real» con los tres rellenos.
   * VC suelo 60.000 €, VC total 50.000 €, 100.000 → 150.000 €: el suelo no puede superar al
   * inmueble entero. (Lo mismo con un precio ilegible como «2.000.50».)
   * DEBERÍA: un aviso que nombre la incoherencia (el valor catastral total) y no el genérico.
   */
  test.fail('SUELO > TOTAL — el aviso nombra la incoherencia en vez de pedir que se rellene lo ya relleno', async ({ page }) => {
    await abrir(page);
    await escribir(page, SUELO, '60000');
    await escribir(page, TIPO, '30');
    await page.locator(ANIOS).selectOption('7');
    await rellenarMetodoReal(page, { adquisicion: '100000', transmision: '150000', total: '50000' });
    await CALCULAR(page).click();

    await expect(page.locator('p', { hasText: 'Rellena todos los datos del método real' })).toHaveCount(0, { timeout: 2000 });
    await expect(page.locator('[role="alert"]', { hasText: /valor catastral total/i })).toHaveCount(1, { timeout: 2000 });
  });

  /**
   * HALLAZGO — «Si ya lo pagaste antes de 2021, tienes hasta 4 años para reclamar» (tarjeta
   * «Venta con pérdida (crisis 2008)») y «No reclamar plusvalías pagadas antes de 2021 […]
   * tienes hasta 4 años desde el pago […] no lo dejes para después» (errores frecuentes). Con
   * la regla de los 4 años que la propia app enuncia, cualquier pago anterior al 01/01/2021
   * prescribió a más tardar el 31/12/2024; el de su ejemplo (venta de 2015), en 2019.
   * DEBERÍA: no presentar como vía abierta una reclamación que, por su misma regla, ya no cabe.
   */
  test.fail('PRESCRIPCIÓN — no se ofrece reclamar pagos «antes de 2021» con un plazo de 4 años ya vencido', async ({ page }) => {
    await abrir(page);
    await abrirGuia(page);
    await expect(page.locator('li', { hasText: 'Si ya lo pagaste antes de 2021' })).toHaveCount(0, { timeout: 2000 });
    await expect(page.locator('li', { hasText: 'No reclamar plusvalías pagadas antes de 2021' })).toHaveCount(0, { timeout: 2000 });
    // La FAQ «¿Qué pasa si vendí con pérdida durante la crisis de 2008?» dice lo mismo
    await expect(page.locator('dd', { hasText: 'te cobró la plusvalía antes de 2021' })).toHaveCount(0, { timeout: 2000 });
  });

  /**
   * HALLAZGO — «Aspectos que esta orientación NO contempla: inmuebles adquiridos antes de 1997
   * con coeficientes de actualización diferentes». En el IIVTNU no los hay: el art. 107.4 tiene
   * un último tramo «igual o superior a 20 años» (coeficienteIIVTNU lo topa en 20), y la app lo
   * contempla. Adquirido en 1990 y vendido en 2026 → 36 años → «20 o más años», 0,40.
   * (Los coeficientes de actualización por adquisición anterior a 1994/1997 son cosa del IRPF.)
   */
  test.fail('ANTES DE 1997 — no se anuncia como no contemplado un coeficiente que el IIVTNU no tiene', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('li', { hasText: 'coeficientes de actualización' })).toHaveCount(0, { timeout: 2000 });
  });

  /**
   * HALLAZGO — erratas a la vista: «firmsr», y cuatro espacios que el salto de línea del JSX
   * se come delante o detrás de un <strong>: «recargos del5%», «método real(basado»,
   * «menos de 1 año(0,15» y «precaución.El pacto».
   */
  test.fail('ERRATAS — «firmsr», «del5%», «real(basado», «año(0,15» y «precaución.El»', async ({ page }) => {
    await abrir(page);
    await abrirGuia(page);
    const cuerpo = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(cuerpo).not.toContain('firmsr');
    expect(cuerpo).not.toContain('del5%');
    expect(cuerpo).not.toContain('real(basado');
    expect(cuerpo).not.toContain('año(0,15');
    expect(cuerpo).not.toContain('precaución.El');
  });

  /**
   * HALLAZGO (accesibilidad, CLAUDE.md global §5) — los avisos de error llevan «⚠️» pegado al
   * texto sin `aria-hidden` (page.tsx: `<p …>⚠️ {e}</p>`), así que el lector de pantalla
   * anuncia el emoji delante de cada error del `role="alert"`. Igual el «ℹ️» de «Rellena todos
   * los datos…».
   * DEBERÍA: el texto accesible del aviso empezar por «Introduce…».
   */
  test.fail('A11Y — el texto accesible del aviso de error no empieza por el emoji', async ({ page }) => {
    await abrir(page);
    await CALCULAR(page).click();
    const aviso = page.locator('[role="alert"] p', { hasText: 'Introduce el valor catastral del suelo' });
    await expect(aviso).toHaveCount(1);
    const accesible = await aviso.evaluate((el) => {
      const partes: string[] = [];
      const recorrer = (n: Node): void => {
        if (n.nodeType === Node.TEXT_NODE) partes.push(n.textContent ?? '');
        else if (n instanceof HTMLElement && n.getAttribute('aria-hidden') === 'true') return;
        else n.childNodes.forEach(recorrer);
      };
      recorrer(el);
      return partes.join('').trim();
    });
    expect(accesible.startsWith('Introduce')).toBe(true);
  });

  /**
   * HALLAZGO (accesibilidad, WCAG 2.5.3 «Etiqueta en el nombre») — el botón se ve «Obtener
   * orientación» pero se llama «Obtener estimación orientativa» (aria-label), y la casilla se
   * ve «Comparar también con el método real» pero se llama «Activar comparación con método
   * real». Quien maneja la página por voz dice lo que ve y no la encuentra.
   * DEBERÍA: el nombre accesible contener el texto visible.
   */
  test.fail('A11Y — el nombre accesible del botón y de la casilla contiene su texto visible', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('button', { name: 'Obtener orientación' })).toHaveCount(1, { timeout: 2000 });
    await expect(page.getByRole('checkbox', { name: 'Comparar también con el método real' })).toHaveCount(1, { timeout: 2000 });
  });
});
