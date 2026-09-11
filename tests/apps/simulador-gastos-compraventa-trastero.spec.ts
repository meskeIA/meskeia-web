/**
 * Inspector — simulador-gastos-compraventa-trastero (segmento FISCAL, riesgo 1 CRÍTICO)
 *
 * Primera inspección: 20/08/2026, posterior a la reparación de la factura notarial y del
 * arancel registral (commit 44a5dc7d). App hermana de simulador-gastos-compraventa-garaje:
 * comparten los motores de notaría y registro, y se han vuelto a verificar aquí desde cero.
 *
 * RE-INSPECCIÓN 27/08/2026 (la cola la reabrió porque `data/fiscal` cambió después de la
 * reparación del 21/08). Y RE-INSPECCIÓN DE CIERRE 28/08/2026, que verifica esa reparación y
 * añade las partes 5 a 7. El fichero tiene siete partes:
 *   1. CASOS 1-3 — los de la primera inspección, intactos y en verde.
 *   2. REGRESIONES — los 9 hallazgos del 20/08, reparados el 21/08 y hoy reproducidos uno a
 *      uno: los 9 siguen cerrados en lo que estas aserciones afirman.
 *   3. CASOS 4-7 (MITAD B, 27/08) — zonas que ninguna inspección anterior tocó: la plusvalía
 *      municipal del vendedor con sus dos métodos, la venta con pérdida y no sujeción, la
 *      bonificación de Ceuta y la escala progresiva catalana en un tramo alto de verdad, y
 *      el rechazo de una cifra malformada.
 *   4. REGRESIÓN 27/08 — los seis hallazgos de la re-inspección, reparados ese mismo día.
 *      Estaban escritos con `test.fail()` afirmando lo que DEBERÍA pasar; al repararlos se
 *      les quitó la marca y ahora sujetan la reparación.
 *   5. MITAD A (28/08) — el cierre de esa reparación por sus dos caras: en Canarias la obra
 *      nueva NO liquida IVA (IGIC sin cifra, total parcial) y la segunda mano SÍ liquida ITP
 *      al 6,5 %, que es donde una reparación así se pasa de largo.
 *   6. CASOS 8-9 (MITAD B, 28/08) — el método REAL de la plusvalía ganando al objetivo por la
 *      proporción catastral, y el tope del coeficiente del IIVTNU a los 20 años.
 *   7. HALLAZGOS ABIERTOS 28/08 — cuatro, con `test.fail()` y UNA sola aserción de fondo cada
 *      uno. Tres son reparaciones que llegaron a las apps hermanas y no a esta. Reparados el
 *      30/08 (commit 0828da3e) y hoy convertidos en regresión.
 *   8. RE-INSPECCIÓN 30/08 — la cola invalidó lo anterior tras esa reparación. CASOS 11-13,
 *      en territorio y precio que ninguna ronda había usado (Murcia 40.000 € y Melilla
 *      30.000 €), que además vuelven a cerrar de cero los cinco defectos de la tanda 2. Al
 *      final, UN hallazgo abierto con `test.fail()`.
 *   9. RE-INSPECCIÓN 02/09/2026 — CASOS 14-16, otra vez en territorio virgen: el País Vasco
 *      con un perfil de comprador que ninguna ronda había elegido, la escala de Baleares en
 *      su tramo MÁS ALTO (el 13 %, el techo de toda la tabla) y la plusvalía municipal a la
 *      que le falta UN solo dato. Al final, UN hallazgo abierto con `test.fail()`.
 *  10. RE-INSPECCIÓN 07/09/2026 — CASOS 17-19, posterior a la reparación del clúster de
 *      compraventa (commit 0dba12c9) y a la del recargo del art. 27.2 LGT (13d2181b).
 *      Territorio y perfil nuevos otra vez: Cantabria con familia numerosa, la FRONTERA
 *      exacta de la escala de Aragón (400.000 €, donde un `<` en vez de `<=` se lleva el
 *      segundo tramo por delante) y unos años de propiedad NEGATIVOS. Al final, los CINCO
 *      hallazgos de esa ronda (637-641), REPARADOS el 09/09/2026: se les quitó el
 *      `test.fail()` y hoy quedan como REGRESIÓN de la reparación.
 *  11. RE-INSPECCIÓN 10/09/2026 — CASOS 20-22, posterior al refactor de motores
 *      (commits 3a507acb y 1808419c). Comunidad y precio nuevos otra vez (Comunidad
 *      Valenciana, 24.000 €, con el tipo general del 9 % vigente desde el 01/06/2026), la
 *      REVENTA ANTES DEL AÑO —el coeficiente 0,14 de `COEFICIENTES_IIVTNU_2025`, que esta
 *      app no puede alcanzar— y un precio de compra malformado. Al final, UN hallazgo
 *      abierto con `test.fail()`.
 *
 *  12. RE-INSPECCIÓN 11/09/2026 — CASOS 23-25, posterior a la reparación de la reventa
 *      antes del año (bc437470) y al triaje fiscal que reescribió la escala de Aragón
 *      (7a02470c). Territorio y perfil nuevos otra vez —Castilla y León con perfil joven,
 *      la comunidad del reducido del 0,01 %—, el TERCER escalón de la escala aragonesa
 *      (500.000 € → 40.750 €) y unos años de propiedad MALFORMADOS, que es el camino que
 *      la reparación del 10/09 estrenó. Al final, CUATRO hallazgos abiertos con
 *      `test.fail()`: tres son EFECTO FAMILIA del commit bc437470 —las correcciones 670 y
 *      671 se aplicaron en la hermana garaje y la 683 en nave-industrial, y ninguna llegó
 *      aquí— y el cuarto es una divergencia entre las dos tablas de ITP del repositorio.
 *
 *      ⚠️ El CASO 16 (02/09) se REESCRIBIÓ ese día. Verificaba el rechazo escribiendo un
 *      «0» en los años de propiedad y daba por buena la reescritura del `min={1}` a «1»:
 *      eso era cierto cuando se escribió, y desde la reparación del motor del 07/09
 *      (hallazgo 666, `calcularPlusvaliaMunicipal` acota en 0 y no en 1) ya no lo es. Un
 *      test de regresión que fija el contrato anterior impide ver la reparación pendiente,
 *      así que el mismo rechazo se comprueba ahora con el campo VACÍO —que es el dato que
 *      de verdad falta— y el 0 pasa a ser el caso abierto de la parte 11.
 *
 * De dónde sale CADA cifra esperada (ninguna de memoria):
 *  - Tipo general de ITP por CCAA → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
 *    leído por `tipoGeneralDe()` en `data/itp-ccaa.ts` (Madrid = 6 %, Cataluña = 10 %,
 *    Galicia = 8 %).
 *  - Escala progresiva y AJD por CCAA → `ITP_CCAA` en `data/itp-ccaa.ts`
 *    (Cataluña 10/11/12/13 % y `ajd: 1.5` · Madrid `ajd: 0.75` · País Vasco `ajd: 0`).
 *  - IVA del trastero de obra nueva → `IVA_INMUEBLES_2025` en `data/fiscal/inmuebles.ts`.
 *    La app usa `anejoVinculado: 10` para el trastero VINCULADO (anejo transmitido junto con la
 *    vivienda, art. 91.Uno.1.7º LIVA) y `garaje: 21` para el INDEPENDIENTE (finca registral
 *    propia, operación separada → tipo general).
 *  - Arancel notarial → `ARANCELES_NOTARIO` (RD 1426/1989, número 2: matriz + una copia) y
 *    la FACTURA que se muestra → `FACTURA_NOTARIAL` (horquilla ×1,5 a ×2, que cubre los
 *    números 4, 6 y 7 —copias, folios y suplidos—; la tarjeta enseña el punto medio ×1,75).
 *  - Arancel registral → `ARANCELES_REGISTRO` (RD 1427/1989, número 2) MÁS los dos importes
 *    fijos de `REGISTRO_CONCEPTOS`: asiento de presentación 6,010121 € (número 1) y nota
 *    simple 3,005061 € (número 4). Al registro NO se le aplica la horquilla de la notaría.
 *  - El 21 % de IVA sobre honorarios notariales y registrales va DENTRO de
 *    `calcularArancelNotarial` y `calcularRegistro` (ambas terminan en `* 1.21`).
 *  - Ganancia patrimonial e IRPF → `calcularGananciaInmueble` (`data/fiscal/ganancia-inmueble.ts`,
 *    arts. 34-36 LIRPF) sobre `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 ·
 *    21 % hasta 50.000 · 23 % hasta 200.000 · 27 % hasta 300.000 · 30 % resto).
 *  - Plusvalía municipal → `calcularPlusvaliaMunicipal` (`data/itp-ccaa.ts`) sobre
 *    `COEFICIENTES_IIVTNU_2025` y `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` = 25 %
 *    (`data/fiscal/inmuebles.ts`, RDL 26/2021 y arts. 104.5 y 107.4-5 TRLHL).
 *  - Bonificación del 50 % de la cuota en Ceuta y Melilla → `ITP_CCAA.ceuta` /
 *    `aplicarBonificacionCiudad` (art. 57 bis TRLITPAJD).
 *  - Territorios donde NO rige el IVA español → `TERRITORIOS_SIN_IVA` (`data/itp-ccaa.ts`):
 *    Canarias (IGIC) y Ceuta y Melilla (IPSI).
 *  - Escala de recargos por presentación extemporánea → `lib/calculadoras/recargoPresentacionTardia.ts`
 *    (LGT art. 27.2 en la redacción de la Ley 11/2021).
 *
 * Todos los casos están resueltos a mano ANTES de ejecutar la app; el desarrollo va comentado
 * junto a cada aserción, con los importes sin redondear.
 *
 * Nota de formato: `formatCurrency` usa es-ES, que NO agrupa los millares de un número de
 * cuatro cifras («1535,59 €») y sí los de cinco o más («16.535,59 €»).
 *
 * Los hallazgos de la re-inspección van al final. Estaban marcados con `test.fail()` y hoy
 * están REPARADOS, así que la marca se retiró y las aserciones sujetan la reparación.
 */
import { test, expect, Page } from '@playwright/test';

const RUTA = '/simulador-gastos-compraventa-trastero/';

/**
 * Repite una medición hasta que dos lecturas consecutivas coinciden.
 *
 * Leer un color computado justo después de cambiar de tema devuelve un fotograma
 * INTERMEDIO de la transición CSS: un número que no existe en ninguno de los dos temas.
 * El 09/09/2026 este test daba 1,72:1 midiendo texto ya oscuro (rgb(176,176,176)) sobre un
 * panel a medio camino (rgb(132,132,132)), cuando el valor real con la transición
 * terminada es 6,6:1 sobre rgb(42,42,42). El fallo estaba en la medición, no en el color.
 *
 * No sirve esperar `getAnimations()`: consultarlo en el mismo tick del clic devuelve una
 * lista vacía —el navegador aún no ha creado las transiciones— y, con margen de fotogramas,
 * nacen escalonadas. Lo único que no depende de cómo esté implementada la animación es
 * esperar a que la medida deje de moverse.
 */
async function esperarEstable<T>(leer: () => Promise<T>): Promise<T> {
  let anterior = await leer();
  for (let intento = 0; intento < 30; intento++) {
    await new Promise((r) => setTimeout(r, 100));
    const actual = await leer();
    if (JSON.stringify(actual) === JSON.stringify(anterior)) return actual;
    anterior = actual;
  }
  return anterior;
}


/** El formato de moneda es-ES separa la cifra del € con un espacio duro (U+00A0). */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');

/** Valor de una ResultCard, con el espacio duro del formato español normalizado. */
async function valorTarjeta(page: Page, titulo: string | RegExp): Promise<string> {
  const valor = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::div[1]/p');
  return (await valor.innerText()).replace(ESPACIO_DURO, ' ').trim();
}

/** Texto de un elemento, con el espacio duro del formato español normalizado. */
async function texto(locator: ReturnType<Page['getByText']>): Promise<string> {
  return (await locator.innerText()).replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();
}

/** Texto descriptivo bajo el valor de una ResultCard. */
async function descripcionTarjeta(page: Page, titulo: string | RegExp): Promise<string> {
  const desc = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::p[1]');
  return (await desc.innerText()).replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();
}

async function rellenar(page: Page, etiqueta: string, valor: string): Promise<void> {
  const campo = page.locator(`input[aria-label="${etiqueta}"]`);
  await campo.fill(valor);
  await campo.blur();
}

/**
 * Los dos desplegables ya tienen id desde la reparación del 21/08/2026 (#select-ccaa y
 * #select-perfil), pero se siguen localizando por posición para que el test no dependa de
 * un identificador: el de comunidad autónoma siempre existe; el de perfil solo se pinta en
 * la rama de segunda mano.
 */
const selectCcaa = (page: Page) => page.locator('select').nth(0);
const selectPerfil = (page: Page) => page.locator('select').nth(1);

test.describe('Simulador de gastos de compraventa de trastero — inspección 20/08/2026', () => {
  /**
   * CASO 1 (NORMAL) — segunda mano en una CCAA concreta, con el precio que la propia app
   * propone como placeholder (15.000 €) y la gestoría que trae por defecto (300 €).
   */
  test('CASO 1 (normal) — Madrid, segunda mano, 15.000 €, comprador general', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('madrid');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '15000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP = 15.000 × 6 % = 900. El 6 % es TIPOS_ITP_CCAA_2025 → { ccaa: 'Madrid', tipo: 6 }.
    // Madrid no tiene escala progresiva, así que el tipo efectivo coincide con el nominal.
    // `elegirTipoITP` recibe `viviendaHabitual: false` (un trastero suelto nunca lo es), y
    // los tres reducidos de Madrid exigen vivienda habitual o municipio pequeño, así que
    // ninguno se aplica: el general es lo correcto.
    expect(await valorTarjeta(page, 'ITP (6,00%)')).toBe('900,00 €');
    expect(await descripcionTarjeta(page, 'ITP (6,00%)')).toContain('Comunidad de Madrid');

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO):
    //   tramo 1 (hasta 6.010,12 €)            →                             90,15
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)  →  8.989,88 × 0,0045 =        40,45446
    //   arancel sin IVA                       =                           130,60446
    //   con el 21 % de IVA                    = 130,60446 × 1,21 =        158,0313966
    // FACTURA_NOTARIAL (números 4, 6 y 7 aparte): ×1,5 = 237,0470949 · ×2 = 316,0627932
    //   punto medio ×1,75, que es lo que suma la app =                    276,55494405
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('276,55 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('237,05 €');
    expect(notaria).toContain('316,06 €');

    // Registro — RD 1427/1989, números 1, 2 y 4 (ARANCELES_REGISTRO + REGISTRO_CONCEPTOS):
    //   tramo 1 (hasta 6.010,12 €)             →                            24,04
    //   tramo 2 (6.010,12→30.050,61, 0,175 %)  →  8.989,88 × 0,00175 =      15,73229
    //   inscripción (número 2)                 =                            39,77229
    //   + asiento de presentación (número 1)   →                             6,010121
    //   + nota simple (número 4)               →                             3,005061
    //                                          =                            48,787472
    //   con el 21 % de IVA                     = 48,787472 × 1,21 =         59,03284112
    // Al registro NO se le aplica el factor 1,5-2 de la notaría: son importes fijos.
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('59,03 €');

    // En segunda mano no hay AJD: la operación tributa por ITP y ambos son incompatibles.
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

    // Total gastos = 900 + 276,55494405 + 59,03284112 + 300 = 1.535,58778517
    //   % sobre el precio = 1.535,58778517 / 15.000 = 10,237252 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1535,58 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('10,24%');

    // Coste total = 15.000 + 1.535,58778517 = 16.535,58778517
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('16.535,58 €');
  });

  /**
   * CASO 2 (LÍMITE) — lo PROPIO del trastero: el mismo inmueble de obra nueva tributa al
   * 10 % si se transmite como anejo junto con la vivienda y al 21 % si es finca registral
   * independiente (art. 91.Uno.1.7º LIVA). Se comprueba el salto en los dos sentidos, y
   * sobre un precio tan bajo (3.000 €) que los importes fijos de notaría y registro
   * (230,89 €) pesan casi tanto como el propio impuesto del caso vinculado (300 €).
   */
  test('CASO 2 (límite) — obra nueva en Madrid, 3.000 €: IVA 10 % vinculado vs 21 % independiente', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await selectCcaa(page).selectOption('madrid');
    await rellenar(page, 'Precio del trastero', '3000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // --- Trastero VINCULADO (es la modalidad por defecto) ---
    // IVA = 3.000 × 10 % = 300 — IVA_INMUEBLES_2025.anejoVinculado = 10 (anejo con la vivienda).
    await expect(page.getByRole('button', { name: /Vinculado a vivienda/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await valorTarjeta(page, 'IVA (10,00%)')).toBe('300,00 €');
    expect(await descripcionTarjeta(page, 'IVA (10,00%)')).toContain('anejo transmitido con la vivienda');

    // AJD = 3.000 × 0,75 % = 22,50 — ITP_CCAA.madrid.ajd = 0.75. Solo hay AJD en obra nueva.
    expect(await valorTarjeta(page, 'AJD (0,75%)')).toBe('22,50 €');

    // Notaría — por debajo de 6.010,12 € solo se devenga la cuota fija del primer tramo:
    //   90,15 × 1,21 (IVA) = 109,0815 de arancel
    //   horquilla FACTURA_NOTARIAL: ×1,5 = 163,62225 · ×2 = 218,163 · medio = 190,892625
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('190,89 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('163,62 €');
    expect(notaria).toContain('218,16 €');

    // Registro — cuota fija 24,04 + presentación 6,010121 + nota simple 3,005061 = 33,055182
    //   con el 21 % de IVA = 39,99677022
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('40,00 €');

    // Total vinculado = 300 + 22,5 + 190,892625 + 39,99677022 + 300 = 853,38939522
    //   % sobre el precio = 28,446313 %  ·  coste total = 3.853,38939522
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('853,39 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('28,45%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('3853,39 €');

    // --- Mismo trastero, ahora INDEPENDIENTE ---
    await page.getByRole('button', { name: /Independiente/ }).click();

    // IVA = 3.000 × 21 % = 630 — IVA_INMUEBLES_2025.garaje = 21 (tipo general).
    // El salto respecto al vinculado es de 330 €, el 11 % del precio del trastero.
    expect(await valorTarjeta(page, 'IVA (21,00%)')).toBe('630,00 €');
    expect(await descripcionTarjeta(page, 'IVA (21,00%)')).toContain('trastero independiente');

    // El aviso tiene que explicar la CONDICIÓN, no solo el tipo: el 10 % es para los anejos
    // transmitidos junto con la vivienda.
    await expect(page.getByText(/solo se aplica a los anejos/)).toBeVisible();

    // Los fijos no se mueven (dependen del precio, no del tipo de IVA):
    expect(await valorTarjeta(page, 'AJD (0,75%)')).toBe('22,50 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('190,89 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('40,00 €');

    // Total independiente = 630 + 22,5 + 190,892625 + 39,99677022 + 300 = 1.183,38939522
    //   % sobre el precio = 39,446313 %  ·  coste total = 4.183,38939522
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1183,39 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('39,45%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('4183,39 €');

    // El 10 %/21 % es estatal (Ley 37/1992), no autonómico: cambiar de comunidad mueve el
    // AJD (Cataluña 1,5 % → 45 €) pero NO el IVA.
    await selectCcaa(page).selectOption('cataluna');
    expect(await valorTarjeta(page, 'IVA (21,00%)')).toBe('630,00 €');
    expect(await valorTarjeta(page, 'AJD (1,50%)')).toBe('45,00 €');

    // País Vasco tiene ITP_CCAA['pais-vasco'].ajd = 0, y entonces la tarjeta desaparece.
    await selectCcaa(page).selectOption('pais-vasco');
    expect(await valorTarjeta(page, 'IVA (21,00%)')).toBe('630,00 €');
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);
  });

  /**
   * CASO 3 (DEBE RECHAZARSE) — un precio cero o negativo no puede producir presupuesto:
   * un ITP negativo (−3.000 × 6 % = −180 €) sería un «ahorro» inexistente, y un
   * «No definido» en la tarjeta de COSTE TOTAL sería peor que no responder.
   */
  test('CASO 3 (debe rechazarse) — precio negativo o cero: la app pide el dato en vez de calcular', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const precio = page.locator('input[aria-label="Precio del trastero"]');
    const aviso = page.getByText(
      'Introduce el precio del trastero para ver el desglose de gastos del comprador',
    );

    // Sin escribir nada: parseSpanishNumber('') devuelve NaN y la guarda lo atrapa
    // (`!Number.isFinite(precio)`), así que no puede colarse ningún «No definido».
    await expect(aviso).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);

    // Con un negativo y SIN salir del campo: la guarda `precio <= 0` corta el cálculo.
    await precio.fill('-3000');
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'ITP' })).toHaveCount(0);
    await expect(aviso).toBeVisible();

    // Al perder el foco, NumberInput normaliza al mínimo declarado (min = 0)...
    await precio.blur();
    await expect(precio).toHaveValue('0');

    // ...y con 0 tampoco calcula: nada de ITP de 0 €, ni notaría de 190,89 €, ni «0,00 %».
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Gastos de notaría' })).toHaveCount(0);
    await expect(aviso).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);

    // La pestaña del vendedor tiene la misma guarda sobre el mismo precio.
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await expect(
      page.getByText('Introduce el precio de venta y los datos adicionales'),
    ).toBeVisible();
    await expect(page.locator('h3', { hasText: 'IMPORTE NETO VENDEDOR' })).toHaveCount(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESIONES — hallazgos del 20/08/2026, reparados el 21/08/2026. Afirman lo que debe
// pasar y hoy PASAN: si alguien reintroduce el defecto, saltan aquí.
// ─────────────────────────────────────────────────────────────────────────────

// ✅ REPARADO 21/08/2026 — cálculo.
// Hay UN solo campo de gestoría, en el panel «Datos de la operación» junto al precio y la
// CCAA, y su importe se cobra al COMPRADOR (tarjeta «Gastos de gestoría» dentro del COSTE
// TOTAL DE ADQUISICIÓN) y ADEMÁS se pasa como `gastosTransmision` del vendedor, donde resta
// del valor de transmisión. El art. 35.1 LIRPF solo admite como menor valor de transmisión
// los gastos «satisfechos por el transmitente»: los mismos 300 € no pueden ser a la vez
// coste del comprador y gasto deducible del vendedor. Rebaja el IRPF.
// Caso: 15.000 € de venta · 8.000 € de compra · gestoría 300 € (valor por defecto) →
//       esperado ganancia 6.550,00 € e IRPF 1.255,50 € (solo la comisión del 3 %, 450 €,
//       la paga el vendedor) · obtenido 6.250,00 € y 1.192,50 €, 63,00 € menos de IRPF.
//       Poniendo la gestoría a 0 la app da exactamente los valores esperados, lo que
//       confirma que el desvío viene de ese campo.
test('REGRESIÓN (cálculo) — la gestoría del comprador no puede reducir la ganancia del vendedor', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '8000');

  // valor de transmisión = 15.000 − 450 de comisión = 14.550 (la gestoría es del comprador)
  // ganancia = 14.550 − 8.000 = 6.550 → IRPF = 6.000×19 % + 550×21 % = 1.140 + 115,50
  expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('14.550,00 €');
  expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('6550,00 €');
  expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1255,50 €');
});

// ✅ REPARADO 21/08/2026 — contenido.
// Las tarjetas se titulan «Gastos de notaría (+ IVA)» y «Registro de la Propiedad (+ IVA)»,
// pero el importe YA lleva el 21 %: `calcularArancelNotarial` y `calcularRegistro` terminan
// en `total * 1.21`. «+ IVA» significa en castellano «IVA aparte», así que quien presupuesta
// suma un 21 % que ya está dentro. Vale cualquiera de las dos salidas —rotular «IVA
// incluido» o publicar la base sin IVA—; lo que no puede quedarse es el «+».
// Caso: Madrid · segunda mano · 15.000 € → «Gastos de notaría (+ IVA)» = 276,55 €
//       (130,60446 de arancel × 1,21 de IVA × 1,75 de factura) y «Registro de la Propiedad
//       (+ IVA)» = 59,03 € (48,787472 × 1,21). Esperado un rótulo que no prometa un IVA
//       aparte · obtenido el «(+ IVA)», que lleva a presupuestar 334,63 € y 71,43 €.
test('REGRESIÓN (contenido) — el rótulo «(+ IVA)» contradice a unos importes que ya llevan el 21 %', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');

  expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('276,55 €');
  expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('59,03 €');
  const tituloNotaria = await page.locator('h3', { hasText: 'Gastos de notaría' }).first().innerText();
  const tituloRegistro = await page
    .locator('h3', { hasText: 'Registro de la Propiedad' })
    .first()
    .innerText();
  expect(tituloNotaria).not.toMatch(/\+\s*IVA/);
  expect(tituloRegistro).not.toMatch(/\+\s*IVA/);
});

// ✅ REPARADO 21/08/2026 — dato.
// La fila «AJD en primera mano» de la tabla comparativa dice «0,5% – 1,5% según CCAA» en sus
// tres columnas, escrito a mano. En la misma página, ITP_CCAA['pais-vasco'].ajd = 0: al
// elegir País Vasco el recuadro imprime «AJD 0%» y la tarjeta de AJD desaparece. El 1,5 %
// del extremo alto sí es correcto (es el máximo de la tabla); el que falla es el mínimo.
// Caso: primera mano · independiente · País Vasco · 3.000 € → esperado que la fila de AJD
//       incluya el 0 % que la propia app aplica · obtenido «0,5% – 1,5% según CCAA» y
//       cero tarjetas de AJD en el resultado.
test('REGRESIÓN (dato) — el rango de AJD de la tabla deja fuera el 0 % del País Vasco', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await selectCcaa(page).selectOption('pais-vasco');
  await rellenar(page, 'Precio del trastero', '3000');
  await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  await expect(page.locator('tr', { hasText: 'AJD en primera mano' })).toContainText('0%');
});

// ✅ REPARADO 21/08/2026 — contenido.
// La tarjeta «Trastero de segunda mano» del bloque educativo se quedó con las cifras de
// notaría y registro de antes de la reparación del 20/08/2026: dice «notaría (~160 €) y
// registro (~90 €)» y «un coste adicional de ~2.350 €». El ITP sí cuadra (10 % del primer
// tramo de la escala catalana = 1.800 €), pero los otros dos no, y en sentidos opuestos.
// Caso: Cataluña · segunda mano · 18.000 € → la app calcula notaría 305,14 € (144,10446 ×
//       1,21 × 1,75) y registro 65,39 € (54,037472 × 1,21); ITP + notaría + registro =
//       2.170,53 €. Esperado que el ejemplo repita esas cifras · obtenido ~160 €, ~90 € y
//       ~2.350 €, con la notaría casi al doble.
test('REGRESIÓN (contenido) — el ejemplo de Cataluña publica una notaría que el motor ya no da', async ({
  page,
}) => {
  await page.goto(RUTA);
  await selectCcaa(page).selectOption('cataluna');
  await rellenar(page, 'Precio del trastero', '18000');
  expect(await valorTarjeta(page, 'ITP (10,00%)')).toBe('1800,00 €');
  expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('305,14 €');
  expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('65,39 €');

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const ejemplo = await texto(
    page.getByText(/Una persona compra un trastero independiente en Cataluña/),
  );
  expect(ejemplo).toContain('305,14 €');
  expect(ejemplo).toContain('65,39 €');
});

// ✅ REPARADO 21/08/2026 — contenido.
// La tarjeta «Vender un trastero» anuncia una ganancia que el motor no produce: dice que
// comprado por 8.000 € y vendido por 15.000 € «la ganancia de 7.000 € tributará al 19 % en
// la base del ahorro (1.330 €)». El motor del art. 35 LIRPF descuenta del valor de
// transmisión los gastos de la venta, y con los valores por defecto de la propia app
// (comisión 3 % y gestoría 300 €) la ganancia no es 7.000 €. Además el tipo no es plano:
// los últimos 250 € van al 21 %, así que ni siquiera un 19 % sobre 7.000 daría la cifra.
// Caso: precio de venta 15.000 € · compra 8.000 € · comisión 3 % · gestoría 300 € (todo por
//       defecto) → esperado que el ejemplo diga lo mismo que la calculadora, 6.250,00 € de
//       ganancia y 1.192,50 € de IRPF · obtenido «7.000 €» y «1.330 €», 137,50 € de más.
test('REGRESIÓN (contenido) — la tarjeta de venta anuncia una ganancia que el motor no produce', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '8000');
  expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('6550,00 €');
  expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1255,50 €');

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const ejemplo = await texto(page.getByText(/El vendedor debe calcular la plusvalía municipal/));
  // es-ES no agrupa los millares en cifras de cuatro dígitos: «1255,50 €», no «1.255,50 €»
  expect(ejemplo).toContain('1255,50 €');
});

// ✅ REPARADO 21/08/2026 — contenido.
// La tarjeta «Tipos reducidos de ITP» promete un «Ahorro de 600 € con el tipo reducido del
// 3%» para un joven que compra un trastero en Galicia por 12.000 €, y remite solo a «los
// requisitos de la Xunta para jóvenes compradores». El reducido gallego del 3 % exige
// «Vivienda habitual» (ITP_CCAA.galicia), y la app pasa `viviendaHabitual: false` a
// `elegirTipoITP` a propósito porque un trastero suelto no lo es nunca. La propia app lo
// dice tres pantallas más arriba: «Un trastero comprado por separado no es vivienda
// habitual, así que los tipos que exigen esa condición no suelen aplicarse».
// Caso: Galicia · segunda mano · joven · 12.000 € → esperado que el ejemplo nombre la
//       condición de vivienda habitual · obtenido una promesa de 360 € de ITP mientras la
//       calculadora cobra 960,00 € (8 %) y saca el aviso «Podrías pagar menos».
test('REGRESIÓN (contenido) — el ejemplo del reducido gallego omite la condición que lo bloquea', async ({
  page,
}) => {
  await page.goto(RUTA);
  await selectCcaa(page).selectOption('galicia');
  await rellenar(page, 'Precio del trastero', '12000');
  await selectPerfil(page).selectOption('joven');
  expect(await valorTarjeta(page, 'ITP (8,00%)')).toBe('960,00 €');
  await expect(page.getByText(/Podrías pagar menos/)).toBeVisible();

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const ejemplo = await texto(page.getByText(/Un joven de 30 años que compra un trastero en Galicia/));
  expect(ejemplo).toMatch(/vivienda habitual/i);
});

// ✅ REPARADO 21/08/2026 — contenido.
// La nota que encabeza la app dice del trastero independiente que «puede tributar diferente
// según la comunidad autónoma». La diferencia que la app aplica —y la única que hay— es
// ESTATAL: el 10 % del anejo transmitido con la vivienda frente al 21 % general del
// art. 91.Uno.1.7º LIVA. El selector de comunidad no mueve ese tipo ni un punto, y en la
// rama de segunda mano la modalidad no cambia absolutamente nada del cálculo.
// Caso: primera mano · independiente · 3.000 € → IVA 630,00 € (21 %) en Madrid, en Cataluña
//       y en País Vasco; y en segunda mano · Madrid · 15.000 €, alternar vinculado ↔
//       independiente deja el ITP en 900,00 € y el coste total en 16.535,59 €. Esperado que
//       la nota nombre el 21 % estatal · obtenido la remisión a la comunidad autónoma.
test('REGRESIÓN (contenido) — la nota atribuye a la CCAA una diferencia que es estatal', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await page.getByRole('button', { name: /Independiente/ }).click();
  await rellenar(page, 'Precio del trastero', '3000');
  for (const comunidad of ['madrid', 'cataluna', 'pais-vasco']) {
    await selectCcaa(page).selectOption(comunidad);
    expect(await valorTarjeta(page, 'IVA (21,00%)')).toBe('630,00 €');
  }

  const nota = await page.locator('[class*="trasteroNote"]').first().innerText();
  expect(nota).toContain('21%');
});

// ✅ REPARADO 21/08/2026 — operativa.
// Cuando faltan los datos de la plusvalía municipal (años de propiedad y valor catastral del
// suelo), la app imprime «0,00 €» en la tarjeta y suma ese 0 al total de gastos y al neto del
// vendedor, aunque su propia descripción diga «No calculada (faltan datos)». Un importe de
// cero y un importe desconocido no son lo mismo: el neto sale más alto de lo que será.
// Caso: 15.000 € de venta · 8.000 € de compra · sin años ni valor catastral → esperado que
//       la tarjeta no dé una cifra (o que el neto avise de que le falta la plusvalía) ·
//       obtenido «Plusvalía municipal 0,00 €» y un «IMPORTE NETO VENDEDOR 13.057,50 €»
//       presentado como «Lo que realmente recibes tras los gastos».
test('REGRESIÓN (operativa) — una plusvalía no calculada no puede presentarse como 0,00 €', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '8000');
  // Desde el hallazgo 590 el aviso NOMBRA los campos que faltan, uno a uno, en vez de decir
  // «faltan datos» a secas.
  expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('No calculada (falta');
  expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('los años de propiedad');
  expect(await valorTarjeta(page, 'Plusvalía municipal')).not.toBe('0,00 €');
});

// ✅ REPARADO 21/08/2026 — accesibilidad.
// Los dos <select> de la app («Comunidad Autónoma» y «Perfil del comprador») no tienen id,
// ni aria-label, ni aria-labelledby, y el <label> que los precede no lleva htmlFor ni los
// envuelve: son labels huérfanos. Un lector de pantalla anuncia «cuadro combinado» sin decir
// de qué. La CCAA es el dato que más mueve el resultado (del 4 % al 13 % de ITP). Los labels
// de «Modalidad del trastero» y «Tipo de transmisión» están igual de sueltos sobre sus
// grupos de botones.
// Caso: abrir la app → los dos selects devuelven nombre accesible vacío (id null, aria-label
//       null, aria-labelledby null, ningún label[for]) · esperado «Comunidad Autónoma
//       (ubicación del trastero)» y «Perfil del comprador (para tipos reducidos)».
test('REGRESIÓN (accesibilidad) — los desplegables deben tener nombre accesible', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await expect(selectCcaa(page)).toHaveAccessibleName(/Comunidad Autónoma/);
  await expect(selectPerfil(page)).toHaveAccessibleName(/Perfil del comprador/);
});

// ═════════════════════════════════════════════════════════════════════════════
// MITAD B — casos nuevos de la re-inspección del 27/08/2026, en zonas que ninguna
// inspección anterior tocó: la plusvalía municipal por sus dos métodos, la venta con
// pérdida, la bonificación de Ceuta, la escala progresiva catalana y el rechazo de una
// cifra malformada. Resueltos a mano ANTES de abrir el navegador.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('MITAD B — zonas no cubiertas por la inspección del 20/08/2026', () => {
  /**
   * CASO 4 (NORMAL, pestaña Vendedor) — la plusvalía municipal con TODOS sus datos, que es
   * la parte del vendedor que la inspección anterior solo tocó por su ausencia (hallazgo 88).
   * Se elige a propósito un caso donde el método objetivo gana al real, para comprobar que
   * la app aplica el mínimo del art. 107.5 TRLHL y lo dice.
   */
  test('CASO 4 (normal) — vendedor con plusvalía calculada: 15.000/8.000, 5 años, suelo 4.000 de 9.000', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '8000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo', '1000');
    await rellenar(page, 'Años de propiedad', '5');
    await rellenar(page, 'Valor catastral del suelo', '4000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '9000');

    // Plusvalía municipal — calcularPlusvaliaMunicipal (data/itp-ccaa.ts):
    //   método OBJETIVO (art. 107.4 TRLHL): COEFICIENTES_IIVTNU_2025 da 0,17 a los 5 años
    //     base = 4.000 × 0,17 = 680 · cuota = 680 × 25 % = 170,00
    //     (el 25 % es PLUSVALIA_MUNICIPAL_META.tipoOrientativo, no el 30 % máximo legal)
    //   método REAL (art. 107.5 TRLHL): el incremento se reparte en la proporción catastral
    //     (15.000 − 8.000) × (4.000 / 9.000) × 25 % = 7.000 × 0,4444… × 0,25 = 777,777…
    //   el contribuyente elige el más favorable → 170,00 €, y el método se nombra.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('170,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

    // Valor de adquisición (art. 35.1 LIRPF) = 8.000 + 1.000 de impuestos y gastos = 9.000
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('9000,00 €');

    // Valor de transmisión (art. 35.2 LIRPF) = 15.000 − 450 de comisión (3 % por defecto)
    //   − 0 de gestoría del vendedor − 170 de plusvalía municipal = 14.380
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('14.380,00 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria (3%)')).toBe('450,00 €');

    // Ganancia = 14.380 − 9.000 = 5.380 → cabe entera en el primer tramo del ahorro
    //   (TRAMOS_GANANCIAS_PATRIMONIALES_2025: 19 % hasta 6.000) → 5.380 × 19 % = 1.022,20
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('5380,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1022,20 €');

    // Total gastos vendedor = 170 + 450 + 0 de gestoría + 1.022,20 = 1.642,20
    // Neto = 15.000 − 1.642,20 = 13.357,80
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1642,20 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.357,80 €');
    // Con la plusvalía ya calculada, el neto deja de ser un techo (reparación del hallazgo 88)
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain('realmente recibes');
  });

  /**
   * CASO 5 (LÍMITE) — vender por DEBAJO de lo que se pagó. Toca a la vez las dos ramas que
   * se salen del camino normal: la no sujeción del art. 104.5 TRLHL (sin incremento de valor
   * no hay plusvalía municipal) y la pérdida patrimonial del art. 33 LIRPF (sin cuota).
   * Es el caso en el que un cero mal puesto se convierte en un impuesto inexistente.
   */
  test('CASO 5 (límite) — venta con pérdida: plusvalía no sujeta y cero IRPF', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '8000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '12000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '5000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '10000');

    // incremento real = 8.000 − 12.000 = −4.000 ≤ 0 → `exento` en calcularPlusvaliaMunicipal.
    // No puede salir la cuota objetiva (5.000 × 0,08 × 25 % = 100,00 €): sin incremento de
    // valor el impuesto no se devenga, y el rótulo tiene que decirlo con palabras.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('EXENTO');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('No sujeta');

    // valor de transmisión = 8.000 − 240 (comisión 3 %) = 7.760 · valor de adquisición = 12.000
    // ganancia = 7.760 − 12.000 = −4.240 → pérdida patrimonial, sin cuota
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('12.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('7760,00 €');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('4240,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('SIN CUOTA');
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);

    // Total gastos = 0 de plusvalía + 240 de comisión + 0 de gestoría + 0 de IRPF = 240
    // Neto = 8.000 − 240 = 7.760
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('240,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('7760,00 €');
  });

  /**
   * CASO 6 (LÍMITE) — las dos comunidades cuyo ITP NO es un porcentaje plano del precio:
   * Ceuta, donde el art. 57 bis TRLITPAJD bonifica la cuota al 50 % por el SITIO del
   * inmueble (y por tanto se aplica también a un trastero, que nunca es vivienda habitual),
   * y Cataluña, cuya escala progresiva solo se separa del tipo plano por encima de 600.000 €.
   */
  test('CASO 6 (límite) — Ceuta bonificada al 50 % y la escala progresiva catalana por encima de 600.000 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await selectCcaa(page).selectOption('ceuta');
    await rellenar(page, 'Precio del trastero', '20000');

    // ITP_CCAA.ceuta: tipoGeneral 6 y un reducido «Bonificación general 50%» del 3 % cuyas
    // condiciones son ['Inmueble situado en Ceuta', 'Bonificación automática 50%'] — las dos
    // de UBICACIÓN, así que `elegirTipoITP` las da por cumplidas con el perfil general.
    //   20.000 × 3 % = 600,00 (la mitad de los 1.200 del tipo general)
    expect(await valorTarjeta(page, 'ITP (3,00%)')).toBe('600,00 €');

    // Cataluña, 700.000 € — tramosProgresivos 10/11/12/13 %:
    //   600.000 × 10 % = 60.000 · (700.000 − 600.000) × 11 % = 11.000 → 71.000,00
    //   tipo EFECTIVO = 71.000 / 700.000 = 10,142857 % (NO el 10 % nominal del primer tramo:
    //   el tipo plano daría 70.000 €, mil euros menos)
    await selectCcaa(page).selectOption('cataluna');
    await rellenar(page, 'Precio del trastero', '700000');
    expect(await valorTarjeta(page, 'ITP (10,14%)')).toBe('71.000,00 €');
    await expect(page.getByText(/aplica escala progresiva/)).toBeVisible();

    // Notaría a ese precio — ARANCELES_NOTARIO acumulado hasta 700.000 = 588,63583 sin IVA;
    //   × 1,21 = 712,2493543 de arancel · factura media × 1,75 = 1.246,43637
    // Registro — ARANCELES_REGISTRO acumulado 326,3132735 (por debajo del tope de 2.181,67)
    //   + 6,010121 de presentación + 3,005061 de nota simple = 335,3284555 · × 1,21 = 405,747…
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1246,44 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('405,75 €');
  });

  /**
   * CASO 7 (DEBE RECHAZARSE) — una cifra malformada. `NumberInput` filtra las letras con su
   * regex `/^-?[\d.,]*$/`, así que lo que de verdad puede llegar al motor es un número con
   * dos separadores mal puestos. `parseSpanishNumber` devuelve NaN para «1.2.3» (está en su
   * propia documentación), y la app tiene que pedir el dato en vez de calcular sobre NaN.
   */
  test('CASO 7 (debe rechazarse) — «1.2.3» no es un precio: ni cálculo ni «No definido»', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '1.2.3');

    await expect(
      page.getByText('Introduce el precio del trastero para ver el desglose de gastos del comprador'),
    ).toBeVisible();
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Gastos de notaría' })).toHaveCount(0);
    await expect(page.getByText('No definido')).toHaveCount(0);
    // Sobre el texto completo y con mayúsculas: `getByText('NaN')` es una búsqueda de
    // subcadena SIN distinguir mayúsculas y casaría con «ganancia», que lleva «nan» dentro.
    expect(await page.locator('body').innerText()).not.toContain('NaN');

    // Lo mismo en el campo de gestoría: `parseSpanishNumberOr` devuelve su valor por defecto
    // (0) en vez de contaminar el total. Con un precio válido, el total no puede llevar NaN.
    await rellenar(page, 'Precio del trastero', '15000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '1.2.3');
    // 900 de ITP + 276,55494405 de notaría + 59,03284112 de registro + 0 de gestoría
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1235,58 €');
    await expect(page.locator('h3', { hasText: 'Gastos de gestoría' })).toHaveCount(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS — re-inspección del 27/08/2026.
// Marcados con `test.fail()`: afirman lo que DEBERÍA pasar, así que hoy fallan a propósito.
// Cuando se reparen, se les quita la marca y quedan como regresión.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('REGRESIÓN — hallazgos del 27/08/2026, reparados', () => {
  // ✅ REPARADO 27/08 (alto) — cálculo. REPARACIÓN A MEDIAS del commit c47189ca.
  // En Canarias, Ceuta y Melilla no rige el IVA español: `TERRITORIOS_SIN_IVA`
  // (data/itp-ccaa.ts) los declara como IGIC e IPSI. La app RENDERIZA el componente
  // `AvisoTerritorioSinIva`, que dice literalmente «Esta herramienta no lo calcula, así que
  // el importe del impuesto indirecto no es el tuyo»… y la tarjeta de al lado liquida un IVA
  // que allí no existe y lo suma a un total rotulado «Precio del trastero + todos los gastos».
  // A esta app llegó el aviso pero NO el cálculo: `page.tsx` ni siquiera importa
  // `TERRITORIOS_SIN_IVA`. Las tres hermanas del clúster (nave-industrial, solar y
  // terreno-rústico) lo resolvieron con una bandera `impuestoNoCalculado` que deja el
  // impuesto sin cifra y rotula «COSTE TOTAL (PARCIAL)».
  // Caso: Canarias · primera mano · vinculado · 15.000 € · gestoría 300 € → esperado ninguna
  //       cifra de impuesto indirecto y el total marcado como parcial · obtenido
  //       «IVA (10,00%) 1500,00 €», «Total gastos adicionales 2248,09 € — 14,99% sobre el
  //       precio» y «COSTE TOTAL DE ADQUISICIÓN 17.248,09 € — Precio del trastero + todos los
  //       gastos». En Ceuta con trastero independiente: «IVA (21,00%) 3150,00 €» y 18.823,09 €.
  test('REGRESIÓN (cálculo) — en Canarias, Ceuta y Melilla no puede liquidarse IVA', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await selectCcaa(page).selectOption('canarias');
    await rellenar(page, 'Precio del trastero', '15000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // El aviso SÍ está: es el cálculo el que no se enteró.
    await expect(page.getByText(/no se aplica el IVA/)).toBeVisible();

    // Ninguna tarjeta puede titularse «IVA» ni poner cifra a ese impuesto…
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    // …y el total no puede presentarse como completo mientras falte el impuesto indirecto.
    const total = await page.locator('h3', { hasText: /COSTE TOTAL/ }).first().innerText();
    expect(total).toMatch(/PARCIAL/i);
  });

  // ✅ REPARADO 27/08 (medio) — dato.
  // El único `<DataReference>` de la página declara «ITP/AJD/IVA 2026» con
  // FISCAL_INMUEBLES_META (verificado 17/06/2026), pero la pestaña Vendedor emite dos cifras
  // normativas más con vigencia y verificación PROPIAS y sin ninguna referencia: la plusvalía
  // municipal, calculada con COEFICIENTES_IIVTNU_2025 y PLUSVALIA_MUNICIPAL_META
  // (RDL 26/2021; ese módulo declara `verificado: '2025-01-15'` y `vigencia: '2025'`, y avisa
  // de que los coeficientes se actualizan cada Ley de Presupuestos), y el IRPF de la ganancia
  // con TRAMOS_GANANCIAS_PATRIMONIALES_2025. La página presenta datos de 2025 bajo un sello
  // de 2026. La app hermana del garaje cerró exactamente esto (hallazgo 35) añadiendo un
  // segundo DataReference con PLUSVALIA_MUNICIPAL_META; aquí no llegó.
  // Caso: pestaña Vendedor · 15.000/8.000 · 5 años · suelo 4.000 · total 9.000 → plusvalía
  //       170,00 € (coeficiente 0,17 de 2025) e IRPF 1022,20 € (tramos de 2025) · esperado un
  //       bloque de referencia que nombre la plusvalía municipal · obtenido un solo bloque
  //       «DATOS DE REFERENCIA — Normativa aplicada: ITP/AJD/IVA 2026 · última verificación
  //       17/06/2026», que no cubre ninguna de las dos.
  test('REGRESIÓN (dato) — la plusvalía municipal y el IRPF se publican sin su propia referencia', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '8000');
    await rellenar(page, 'Años de propiedad', '5');
    await rellenar(page, 'Valor catastral del suelo', '4000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '9000');
    // Plusvalía, método objetivo: 4.000 × 0,17 (coeficiente de 5 años, COEFICIENTES_IIVTNU_2025)
    //   = 680 de base × 25 % (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 170,00 €.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('170,00 €');

    // ⚠️ El acta anotaba aquí 1022,20 €, y esa cifra NO sale de ningún camino: estaba dentro
    // de un `test.fail()`, donde basta con que el test falle en ALGÚN punto, así que la
    // aserción nunca llegó a comprobarse. Resuelto a mano con el art. 35 LIRPF:
    //   comisión (3 % por defecto)  = 15.000 × 0,03            =    450,00
    //   valor de transmisión        = 15.000 − 450 − 170       = 14.380,00
    //   valor de adquisición        = 8.000 (sin gastos declarados)
    //   ganancia                    = 14.380 − 8.000           =  6.380,00
    //   IRPF (TRAMOS_GANANCIAS_PATRIMONIALES_2025)
    //        6.000 × 19 %           =                             1.140,00
    //          380 × 21 %           =                                79,80
    //                               =                             1.219,80
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1219,80 €');

    // Debe existir una referencia que cubra el IIVTNU, además de la de ITP/AJD/IVA.
    await expect(page.getByText(/Normativa aplicada:.*(IIVTNU|[Pp]lusval)/)).toBeVisible();
  });

  // ✅ REPARADO 27/08 (medio) — dato.
  // El consejo «Liquida los impuestos a tiempo» del bloque educativo lleva escrita a mano una
  // escala de recargos por presentación extemporánea que contradice a la calculadora canónica
  // del propio catálogo: `lib/calculadoras/recargoPresentacionTardia.ts` aplica el art. 27.2
  // LGT en la redacción de la Ley 11/2021 —1 % por cada mes completo hasta 12 meses, y 15 %
  // más intereses de demora desde el mes 13— mientras esta app anuncia «recargos automáticos
  // del 5% al 20%», que es la escala ANTERIOR a esa reforma. No hay módulo en data/fiscal con
  // este dato, así que el número vive inline pudiendo derivarse de la lógica ya existente.
  // Caso: desplegar la guía educativa → consejo «Liquida los impuestos a tiempo»: obtenido
  //       «El incumplimiento genera recargos automáticos del 5% al 20%» · esperado la escala
  //       vigente. Sobre el ITP de 900,00 € del caso de Madrid que la propia página publica,
  //       un mes de retraso son 9,00 € y la app hace temer entre 45,00 € y 180,00 €.
  test('REGRESIÓN (dato) — la escala de recargos del bloque educativo es la anterior a la Ley 11/2021', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    // 07/09/2026 — el localizador buscaba la palabra «recargos» EN PLURAL, y la reparación
    // del art. 27.2 LGT (commit 13d2181b) reescribió el consejo en singular: «genera recargo
    // desde el primer día: un 1% de partida más otro 1% por cada mes completo». El texto es
    // hoy MÁS correcto que cuando se escribió esta aserción —antes se comía el 1% de partida—,
    // así que lo que se corrige es el localizador, no la app: se ancla en el título del
    // consejo, que no depende de cómo esté redactada la escala.
    const consejo = await texto(page.getByText(/Liquida los impuestos a tiempo/i).first().locator('xpath=..'));
    expect(consejo).not.toMatch(/5\s*%?\s*al\s*20\s*%/);
    expect(consejo).toMatch(/1\s*%.*mes|15\s*%/);
    // Y el 1 % de partida, que es lo que faltaba hasta el 07/09/2026 en los cuatro sitios
    // que componían el texto desde la constante.
    expect(consejo).toMatch(/1\s*%\s*de partida/);
  });

  // ✅ REPARADO 27/08 (medio) — accesibilidad. REPARACIÓN A MEDIAS del hallazgo 85 (21/08/2026).
  // Aquel hallazgo nombraba dos cosas: los `<select>` sin nombre accesible —reparados, ver la
  // regresión de más arriba— y que «los labels de "Modalidad del trastero" y "Tipo de
  // transmisión" están igualmente sueltos sobre sus grupos de botones». Esa segunda mitad
  // sigue igual: los dos `<label>` no tienen `for` ni envuelven ningún control, y el par de
  // botones no va dentro de ningún `role="group"` ni `<fieldset>`, así que quien navega por
  // voz oye «Vinculado a vivienda» y «Segunda mano» sin saber de qué pregunta son opciones.
  // No lo cubre `npm run check:a11y-jsx`, que vigila type=, aria-hidden y aria-pressed: los
  // tres están correctos en esta página.
  // Caso: abrir la app y evaluar en el DOM →
  //       document.querySelectorAll('[role="group"],[role="radiogroup"],fieldset').length
  //       esperado ≥ 2 · obtenido 0; y los labels sin destino son
  //       ["Modalidad del trastero", "Tipo de transmisión"] (los otros dos labels huérfanos
  //       son de NumberInput, cuyo input sí lleva aria-label).
  test('REGRESIÓN (accesibilidad) — los dos grupos de botones deben tener nombre accesible', async ({
    page,
  }) => {
    await page.goto(RUTA);
    // En segunda mano solo hay UN grupo: desde el hallazgo 595 el selector de modalidad se
    // oculta ahí, porque no cambia nada del cálculo. En primera mano vuelven a ser dos.
    expect(await page.locator('[role="group"], [role="radiogroup"], fieldset').count()).toBe(1);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    const grupos = await page.locator('[role="group"], [role="radiogroup"], fieldset').count();
    expect(grupos).toBeGreaterThanOrEqual(2);
  });

  // ✅ REPARADO 27/08 (bajo) — contenido.
  // El título de la tarjeta de comisión del vendedor interpola el TEXTO CRUDO del input
  // —`Comisión inmobiliaria (${comisionInmobiliaria}%)`— en vez de pasarlo por `formatNumber`,
  // así que un porcentaje tecleado con punto decimal se publica en formato estadounidense,
  // contra la regla de formato español obligatoria. El importe sí es correcto. Es el mismo
  // resto que el garaje tiene abierto (hallazgo 438).
  // Caso: pestaña Vendedor · precio de venta 15.000 € · compra 8.000 € · «Comisión
  //       inmobiliaria (%)» = 3.5 → esperado el título «Comisión inmobiliaria (3,5%)» ·
  //       obtenido «Comisión inmobiliaria (3.5%)», con el importe 525,00 €, que sí es
  //       correcto (15.000 × 3,5 %).
  test('REGRESIÓN (contenido) — el porcentaje de comisión se publica en formato estadounidense', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '8000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3.5');

    const titulo = await page.locator('h3', { hasText: 'Comisión inmobiliaria' }).first().innerText();
    expect(titulo).toContain('3,5%');
    expect(titulo).not.toContain('3.5%');
  });

  // ✅ REPARADO 27/08 (bajo) — operativa.
  // Mientras el campo de gestoría tiene el foco, un importe negativo se suma tal cual al total
  // y su tarjeta ni se pinta (la guarda es `gastosGestoria > 0`), así que el total en pantalla
  // no cuadra con las líneas visibles. El `min={0}` de NumberInput solo actúa en el blur. La
  // hermana `nave-industrial` cerró esto el 23/08/2026 acotando con `Math.max(0, …)` dentro
  // del useMemo, y el comentario de su código explica por qué no basta con el blur.
  // Caso: Madrid · segunda mano · 15.000 € · escribir «-500» en «Gastos de gestoría del
  //       comprador (€)» SIN salir del campo → esperado que el total siga siendo la suma de
  //       lo que se ve, 1235,59 € (900 de ITP + 276,55 de notaría + 59,03 de registro) ·
  //       obtenido «Total gastos adicionales 735,59 € — 4,90% sobre el precio» y «COSTE TOTAL
  //       DE ADQUISICIÓN 15.735,59 €», 500 € por debajo de sus propias líneas.
  test('REGRESIÓN (operativa) — una gestoría negativa con el foco puesto descuadra el total', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    const gestoria = page.locator('input[aria-label="Gastos de gestoría del comprador (€)"]');
    await gestoria.fill('-500'); // sin blur: el min={0} de NumberInput aún no ha actuado

    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1235,58 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('16.235,58 €');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DE CIERRE — 28/08/2026.
//
// MITAD A: comprobar que la reparación del commit d787b81b (el IVA que no existe en
// Canarias, Ceuta y Melilla) es correcta Y que no se ha pasado de largo: en SEGUNDA mano
// esos territorios sí liquidan ITP, y ahí no hay nada que dejar «sin calcular».
// MITAD B: casos nuevos sobre la parte del motor que ninguna ronda había tocado — el
// método REAL de la plusvalía ganando al objetivo (art. 107.5 TRLHL), el tope del
// coeficiente del IIVTNU a los 20 años y las partidas del vendedor sin acotar.
//
// Cifras: `TIPOS_ITP_CCAA_2025` (Canarias = 6,5 %), `ITP_CCAA` (Canarias `ajd: 0.75`,
// Ceuta `ajd: 0.5` + bonificación del 50 % del art. 57 bis TRLITPAJD),
// `COEFICIENTES_IIVTNU_2025`, `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` (25 %) y
// `TRAMOS_GANANCIAS_PATRIMONIALES_2025`. Aranceles: RD 1426/1989 y RD 1427/1989.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('MITAD A (28/08/2026) — cierre de la reparación del impuesto que no existe', () => {
  /**
   * La reparación es CORRECTA: en Canarias la obra nueva no devenga IVA sino IGIC, así que
   * el impuesto indirecto se queda sin cifra y el total se rotula parcial. Lo que sí se
   * sigue cobrando es todo lo demás, y eso es lo que se verifica línea a línea.
   */
  test('CIERRE (normal) — Canarias, primera mano, 25.000 €: IGIC sin cifra y el resto completo', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await selectCcaa(page).selectOption('canarias');
    await rellenar(page, 'Precio del trastero', '25000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // TERRITORIOS_SIN_IVA.canarias = IGIC: ninguna tarjeta puede titularse «IVA»…
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    expect(await descripcionTarjeta(page, 'IGIC')).toContain('no rige el IVA');

    // …pero el AJD SÍ se devenga en Canarias, y sin bonificación de ciudad autónoma:
    //   25.000 × 0,75 % (ITP_CCAA.canarias.ajd) = 187,50
    expect(await valorTarjeta(page, 'AJD (0,75%)')).toBe('187,50 €');

    // Notaría — RD 1426/1989 nº 2: 90,15 + (25.000 − 6.010,12) × 0,45 % = 175,60446
    //   × 1,21 de IVA = 212,4813966 · factura media × 1,75 = 371,84244405
    //   horquilla: × 1,5 = 318,7220949 y × 2 = 424,9627932
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('371,84 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('318,72 €');
    expect(notaria).toContain('424,96 €');

    // Registro — RD 1427/1989: 24,04 + (25.000 − 6.010,12) × 0,175 % = 57,27229
    //   + 6,010121 de presentación + 3,005061 de nota simple = 66,287472 · × 1,21 = 80,20784112
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('80,21 €');

    // Total = 0 de impuesto indirecto + 187,50 + 371,84244405 + 80,20784112 + 300 = 939,55028517
    //   % sobre el precio = 939,55028517 / 25.000 = 3,758201 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('939,55 €');
    const desglose = await descripcionTarjeta(page, 'Total gastos adicionales');
    expect(desglose).toContain('3,76%');
    expect(desglose).toContain('SIN el IGIC');

    // Y el total tiene que decir que está incompleto, no rotularse como coste de adquisición.
    const tituloTotal = await page.locator('h3', { hasText: /COSTE TOTAL/ }).first().innerText();
    expect(tituloTotal).toMatch(/PARCIAL/i);
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('25.939,55 €');
  });

  /**
   * La contrapartida, que es donde una reparación de este tipo se pasa de largo: en SEGUNDA
   * mano no hay IVA que quitar —la operación tributa por ITP— y Canarias tiene tipo propio.
   * Si la bandera de «territorio sin IVA» se hubiera aplicado a las dos ramas, aquí saldría
   * «No calculado» y el simulador dejaría de servir para el caso más frecuente.
   */
  test('CIERRE (contrapartida) — en Canarias la SEGUNDA mano sigue pagando ITP al 6,50 %', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('canarias');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '25000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // TIPOS_ITP_CCAA_2025 → { ccaa: 'Canarias', tipo: 6.5 }. Sin escala progresiva y sin
    // bonificación de ciudad, el tipo efectivo coincide con el nominal:
    //   25.000 × 6,5 % = 1.625,00
    // Ninguno de los cuatro reducidos de Canarias es aplicable: los tres primeros exigen
    // vivienda habitual (un trastero suelto nunca lo es) y el cuarto, VPO.
    expect(await valorTarjeta(page, 'ITP (6,50%)')).toBe('1625,00 €');
    expect(await descripcionTarjeta(page, 'ITP (6,50%)')).toContain('Canarias');

    // El aviso de territorio sin IVA NO debe salir aquí: en ITP no hay nada que advertir.
    await expect(page.getByText(/no se aplica el IVA/)).toHaveCount(0);

    // Total = 1.625 + 371,84244405 + 80,20784112 + 300 = 2.377,05028517 → 9,508201 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2377,05 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,51%');
    // Y el rótulo del total vuelve a ser el completo, sin «(PARCIAL)».
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('27.377,05 €');
  });
});

test.describe('MITAD B (28/08/2026) — zonas del motor que ninguna ronda anterior tocó', () => {
  /**
   * CASO 8 (NORMAL) — la rama de la plusvalía que faltaba: el método REAL ganando al
   * objetivo. El caso 4 del 27/08 eligió a propósito uno donde ganaba el objetivo, así que
   * la proporción catastral suelo/total del art. 107.5 TRLHL nunca había decidido el
   * resultado. De paso entra por primera vez la gestoría del VENDEDOR, que solo desde la
   * reparación del 20/08 es un campo distinto del de la gestoría del comprador.
   */
  test('CASO 8 (normal) — el método real gana al objetivo y la gestoría del vendedor resta en el art. 35.2', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '20000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '18000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo', '500');
    await rellenar(page, 'Años de propiedad', '15');
    await rellenar(page, 'Valor catastral del suelo', '6000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '30000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '4');
    await rellenar(page, 'Gestoría y certificados del vendedor (€)', '250');

    // Plusvalía municipal — los dos métodos, con el suelo pesando solo un 20 % del catastro:
    //   OBJETIVO  6.000 × 0,12 (coeficiente de 15 años) × 25 % =            180,00
    //   REAL      (20.000 − 18.000) × (6.000 / 30.000) × 25 % =            100,00
    //   el contribuyente elige el menor (art. 107.5 TRLHL) →               100,00
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('100,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método real');

    // Valor de adquisición = 18.000 + 500 de impuestos y gastos de aquella compra = 18.500
    // Valor de transmisión = 20.000 − 800 (comisión 4 %) − 250 (gestoría propia) − 100 = 18.850
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('18.500,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('18.850,00 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria (4%)')).toBe('800,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('250,00 €');

    // Ganancia = 18.850 − 18.500 = 350 → primer tramo del ahorro: 350 × 19 % = 66,50
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('350,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('66,50 €');

    // Total gastos = 100 + 800 + 250 + 66,50 = 1.216,50 · neto = 20.000 − 1.216,50 = 18.783,50
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1216,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('18.783,50 €');
  });

  /**
   * CASO 9 (LÍMITE) — el tope del coeficiente del IIVTNU. `COEFICIENTES_IIVTNU_2025` llega
   * hasta «20 o más años» y `calcularPlusvaliaMunicipal` acota con
   * `Math.min(Math.max(anios, 1), 20)`; el campo admite hasta 50, así que 30 años tienen que
   * dar exactamente lo mismo que 20 y no un `undefined` que caiga en el 0,45 por defecto.
   * La ganancia, además, cruza al segundo tramo de la base del ahorro.
   */
  test('CASO 9 (límite) — 30 años de propiedad: el coeficiente se topa en el de 20 años', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '25000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '5000');
    await rellenar(page, 'Años de propiedad', '30');
    await rellenar(page, 'Valor catastral del suelo', '10000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '20000');

    // OBJETIVO  10.000 × 0,45 (coeficiente de «20 o más años») × 25 % =  1.125,00
    // REAL      (25.000 − 5.000) × (10.000 / 20.000) × 25 % =            2.500,00
    // gana el objetivo → 1.125,00
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1125,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

    // Valor de transmisión = 25.000 − 750 (comisión 3 % por defecto) − 1.125 = 23.125
    // Ganancia = 23.125 − 5.000 = 18.125 → 6.000 × 19 % = 1.140 · 12.125 × 21 % = 2.546,25
    //   cuota = 3.686,25
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('23.125,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('18.125,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('3686,25 €');

    // Total gastos = 1.125 + 750 + 0 + 3.686,25 = 5.561,25 · neto = 25.000 − 5.561,25
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('5561,25 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('19.438,75 €');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Hallazgos 483-486 de la re-inspección del 28/08/2026 — reparados.
// ═════════════════════════════════════════════════════════════════════════════

// Hallazgo 484 — reparado. El rótulo del AJD da ahora el tipo EFECTIVO
// (`ajd / precioInmueble`), no el nominal de la tabla, igual que ya hacían nave-industrial
// y estimador-compraventa-inmueble.
test('REGRESIÓN — el rótulo del AJD en Ceuta anuncia el tipo bonificado, no el nominal', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await selectCcaa(page).selectOption('ceuta');
  await rellenar(page, 'Precio del trastero', '30000');

  const titulo = await page.locator('h3', { hasText: 'AJD' }).first().innerText();
  expect(titulo).toContain('0,25%');
});

// Hallazgo 483 — reparado. Sin precio de compra original, `irpfCalculado` es falso y la
// tarjeta dice «Sin calcular» en variante neutra (no «SIN CUOTA» en verde), y el neto nombra
// también el IRPF entre lo que falta, igual que ya hacía estimador-compraventa-inmueble.
test('REGRESIÓN — sin precio de compra, el IRPF no se anuncia «SIN CUOTA» en verde', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await page.getByRole('button', { name: /Vendedor/ }).click();

  expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
});

// Hallazgo 485 — reparado. El botón «Primera mano» y el aviso de modalidad independiente
// nombran ahora el impuesto local (IGIC/IPSI) en vez de prometer un IVA que allí no existe.
test('REGRESIÓN — en Canarias el botón no ofrece un tipo de IVA', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await selectCcaa(page).selectOption('canarias');

  const rotulo = await texto(page.getByRole('button', { name: /Primera mano/ }));
  expect(rotulo).not.toMatch(/IVA\s*\d/);
});

// Hallazgo 486 — reparado. La comisión y la gestoría del VENDEDOR se acotan ahora con
// `Math.max(0, …)` dentro del useMemo, igual que el 457 ya acotó la gestoría del comprador.
test('CASO 10 (debe rechazarse) — una comisión negativa con el foco puesto ya no infla el neto', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '8000');
  const comision = page.locator('input[aria-label="Comisión inmobiliaria (%)"]');
  await comision.fill('-10'); // sin blur: el min={0} de NumberInput aún no ha actuado

  expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.650,00 €');
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 30/08/2026 — la cola invalidó la anterior tras la reparación del
// clúster de compraventa (commit 0828da3e, «tanda 2»). Se re-verifica DESDE CERO que
// los cinco hallazgos de aquella tanda están cerrados en ESTA app y se abren tres
// casos nuevos, resueltos a mano ANTES de tocar el navegador.
//
// Los tres casos eligen a propósito territorio y precio que ninguna ronda anterior
// había usado (Murcia y Melilla; 40.000 € y 30.000 €), para que las cifras no puedan
// venir copiadas de un caso ya escrito.
//
// De dónde sale cada cifra esperada:
//  - Tipo general de Murcia (7,75 %) → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
//    leído por `tipoGeneralDe()`. La Ley 3/2025 lo bajó del 8 % con efectos 25/07/2025.
//  - Melilla → `ITP_CCAA.melilla` (tipoGeneral 6, reducido «Bonificación general 50%» del
//    3 %, `ajd: 0.5`) y `aplicarBonificacionCiudad` (art. 57 bis TRLITPAJD, 50 % de la
//    cuota gradual de AJD cuando el Registro radica allí) → AJD efectivo 0,25 %.
//  - Melilla no liquida IVA sino IPSI → `TERRITORIOS_SIN_IVA` en `data/itp-ccaa.ts`.
//  - Aranceles → `ARANCELES_NOTARIO` (RD 1426/1989 nº 2) × `FACTURA_NOTARIAL` (×1,5-×2,
//    tarjeta = punto medio ×1,75) y `ARANCELES_REGISTRO` (RD 1427/1989 nº 2) +
//    `REGISTRO_CONCEPTOS` (presentación 6,010121 € y nota simple 3,005061 €). Ambos
//    terminan en `× 1.21` de IVA.
//  - IRPF de la ganancia → `calcularGananciaInmueble` (art. 35 LIRPF) sobre
//    `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 · 21 % hasta 50.000).
// ═════════════════════════════════════════════════════════════════════════════

test.describe('RE-INSPECCIÓN 30/08/2026 — casos nuevos y cierre de la tanda 2', () => {
  /**
   * CASO 11 (NORMAL, península) — Murcia, la comunidad cuyo tipo general se movió en 2025
   * (8 % → 7,75 %) y que ninguna ronda anterior había ejercitado. Precio 40.000 €, que cruza
   * el tercer tramo de los dos aranceles y por tanto los ejercita más allá de la cuota fija.
   */
  test('CASO 11 (normal) — Murcia, segunda mano, 40.000 €, comprador general', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('murcia');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '40000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP = 40.000 × 7,75 % = 3.100,00. El 7,75 % es TIPOS_ITP_CCAA_2025 → { ccaa: 'Murcia',
    // tipo: 7.75 }. Murcia NO tiene escala progresiva, así que el tipo efectivo que rotula la
    // tarjeta coincide con el nominal. Ninguno de sus cuatro reducidos se aplica: los tres de
    // colectivo exigen «Vivienda habitual» (y la app pasa `viviendaHabitual: false`, porque un
    // trastero suelto nunca lo es) y el cuarto es VPO.
    expect(await valorTarjeta(page, 'ITP (7,75%)')).toBe('3100,00 €');
    expect(await descripcionTarjeta(page, 'ITP (7,75%)')).toContain('Región de Murcia');

    // Con perfil general y ningún reducido al alcance de cualquiera, no hay oportunidad que
    // ofrecer: el aviso «Podrías pagar menos» NO debe salir.
    await expect(page.getByText(/Podrías pagar menos/)).toHaveCount(0);

    // Notaría — RD 1426/1989 nº 2 (ARANCELES_NOTARIO), tres tramos:
    //   tramo 1 (hasta 6.010,12 €)                →                            90,15
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)      → 24.040,49 × 0,0045 =      108,182205
    //   tramo 3 (30.050,61→40.000, 0,15 %)        →  9.949,39 × 0,0015 =       14,924085
    //   arancel sin IVA                           =                           213,25629
    //   con el 21 % de IVA                        = 213,25629 × 1,21 =        258,0401109
    // FACTURA_NOTARIAL: ×1,5 = 387,06016635 · ×2 = 516,0802218 · medio ×1,75 = 451,570194075
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('451,57 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('387,06 €');
    expect(notaria).toContain('516,08 €');

    // Registro — RD 1427/1989 nº 2 (ARANCELES_REGISTRO) + los dos fijos de REGISTRO_CONCEPTOS:
    //   tramo 1                                   →                            24,04
    //   tramo 2 (0,175 %)                         → 24.040,49 × 0,00175 =      42,0708575
    //   tramo 3 (0,125 %)                         →  9.949,39 × 0,00125 =      12,4367375
    //   inscripción                               =                            78,547595
    //   + presentación 6,010121 + nota simple 3,005061 =                       87,562777
    //   con el 21 % de IVA                        = 87,562777 × 1,21 =        105,95096017
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('105,95 €');

    // En segunda mano no hay AJD: ITP y AJD son incompatibles en la misma transmisión.
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

    // Total = 3.100 + 451,570194075 + 105,95096017 + 300 = 3.957,521154245
    //   % sobre el precio = 3.957,521154245 / 40.000 = 9,893803 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3957,52 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,89%');

    // Coste total = 40.000 + 3.957,521154245 = 43.957,521154245
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('43.957,52 €');

    // Cierre de la tanda 2 (hallazgo 457/477): con la gestoría en negativo y SIN salir del
    // campo, el total tiene que seguir siendo la suma de las líneas visibles —la tarjeta de
    // gestoría desaparece— y no bajar 500 € por debajo de ellas.
    const gestoria = page.locator('input[aria-label="Gastos de gestoría del comprador (€)"]');
    await gestoria.fill('-500'); // sin blur: el min={0} de NumberInput aún no ha actuado
    // 3.100 + 451,570194075 + 105,95096017 + 0 = 3.657,521154245
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3657,52 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('43.657,52 €');
    await expect(page.locator('h3', { hasText: 'Gastos de gestoría' })).toHaveCount(0);
  });

  /**
   * CASO 12 (RÉGIMEN ESPECIAL) — Melilla, el territorio donde se cruzan los tres arreglos de
   * la tanda 2 a la vez: allí no rige el IVA sino el IPSI (TERRITORIOS_SIN_IVA), el AJD va
   * bonificado al 50 % por el art. 57 bis TRLITPAJD y la cuota de ITP también. Se comprueban
   * las dos ramas, porque una reparación de «aquí no hay IVA» se pasa de largo justo en la
   * segunda mano, donde sí hay un ITP que liquidar.
   */
  test('CASO 12 (régimen especial) — Melilla, 30.000 €: IPSI sin cifra, AJD bonificado e ITP al 3 %', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await selectCcaa(page).selectOption('melilla');
    await rellenar(page, 'Precio del trastero', '30000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // El botón no puede ofrecer un tipo de IVA donde no hay IVA (hallazgo 485/490):
    // `Paga ${TERRITORIOS_SIN_IVA[ccaa].impuesto}` → «Paga IPSI», ni «Paga IVA 10%».
    const rotulo = await texto(page.getByRole('button', { name: /Primera mano/ }));
    expect(rotulo).toContain('Paga IPSI');
    expect(rotulo).not.toMatch(/IVA/);

    // Y el impuesto indirecto se queda SIN CIFRA, no se inventa un 10 % ni un 21 %.
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
    expect(await descripcionTarjeta(page, 'IPSI')).toContain('no rige el IVA');
    await expect(page.getByText(/no se aplica el IVA/)).toBeVisible();

    // AJD — ITP_CCAA.melilla.ajd = 0.5, y `calcularAJD` aplica la bonificación del 50 %
    // del art. 57 bis.1 TRLITPAJD: 30.000 × 0,5 % = 150 → × 0,5 = 75,00.
    // El rótulo tiene que dar el tipo EFECTIVO (75 / 30.000 = 0,25 %), no el 0,5 % nominal
    // de la tabla, que era el hallazgo 484 de la tanda 2.
    expect(await valorTarjeta(page, 'AJD (0,25%)')).toBe('75,00 €');

    // Notaría 30.000 € — 90,15 + (30.000 − 6.010,12) × 0,45 % = 198,10446 sin IVA
    //   × 1,21 = 239,7063966 · ×1,5 = 359,5595949 · ×2 = 479,4127932 · medio = 419,48619405
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('419,49 €');
    // Registro — 24,04 + 23.989,88 × 0,175 % = 66,02229 · + 6,010121 + 3,005061 = 75,037472
    //   × 1,21 = 90,79534112
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('90,80 €');

    // Total = 0 (IPSI, sin cifra) + 75 + 419,48619405 + 90,79534112 + 300 = 885,28153517
    //   % sobre el precio = 885,28153517 / 30.000 = 2,950938 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('885,29 €');
    const desglose = await descripcionTarjeta(page, 'Total gastos adicionales');
    expect(desglose).toContain('2,95%');
    expect(desglose).toContain('SIN el IPSI');
    // Y el total no puede presentarse como completo mientras falte el impuesto indirecto.
    const tituloTotal = await page.locator('h3', { hasText: /COSTE TOTAL/ }).first().innerText();
    expect(tituloTotal).toMatch(/PARCIAL/i);
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('30.885,29 €');

    // La modalidad vinculado/independiente no mueve nada aquí, así que desde el hallazgo 595
    // el selector directamente NO se pinta en los territorios sin IVA: antes se mostraba y su
    // aviso hablaba del 21 % del art. 91.Uno.1.7º LIVA, que en Melilla no rige.
    await expect(page.getByRole('button', { name: /Independiente/ })).toHaveCount(0);
    await expect(page.getByText('Modalidad del trastero')).toHaveCount(0);

    // --- La contrapartida: en SEGUNDA mano sí hay impuesto que liquidar ---
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    // `elegirTipoITP` da por cumplidas las dos condiciones del reducido melillense
    // («Inmueble situado en Melilla» y «Bonificación automática 50%»), que son de UBICACIÓN:
    //   30.000 × 3 % = 900,00 — la mitad de los 1.800 € del tipo general del 6 %.
    expect(await valorTarjeta(page, 'ITP (3,00%)')).toBe('900,00 €');
    // El aviso de territorio sin IVA desaparece: en una transmisión por ITP no advierte nada.
    await expect(page.getByText(/no se aplica el IVA/)).toHaveCount(0);
    // Total = las líneas YA redondeadas (hallazgo 594): 900 + 419,49 + 90,80 + 300 = 1.710,29
    //   % sobre el precio = 1.710,29 / 30.000 = 5,700967 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1710,29 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('5,70%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('31.710,29 €');
  });

  /**
   * CASO 13 (LÍMITE) — el precio de compra vacío o a cero en la pestaña del vendedor. Es el
   * hallazgo 483 de la tanda 2 por su cara más peligrosa: un 0 € de IRPF anunciado en verde
   * como «SIN CUOTA» se lee como una exención, cuando lo que pasa es que falta el dato con el
   * que se calcula. Se comprueba además que el neto se rotula como TECHO y nombra las DOS
   * cosas que le faltan, y que en cuanto llega el dato el cálculo aparece completo.
   */
  test('CASO 13 (límite) — sin precio de compra el IRPF no se calcula y el neto es un techo', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();

    // Campo VACÍO: `parseSpanishNumber('')` es NaN y `precioC > 0` es falso, así que
    // `irpfCalculado` es falso. Ni «SIN CUOTA» ni «0,00 €» ni «No definido» ni «NaN».
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain(
      'NO está incluido en el neto',
    );
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    // Sin valor de adquisición no se pintan las tarjetas del art. 35 LIRPF.
    await expect(page.locator('h3', { hasText: 'Valor de adquisición' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);
    await expect(page.getByText('No definido')).toHaveCount(0);
    expect(await page.locator('body').innerText()).not.toContain('NaN');

    // El neto SOLO lleva la comisión del 3 % que trae por defecto: 15.000 × 3 % = 450
    //   total gastos = 0 (plusvalía sin calcular) + 450 + 0 + 0 (IRPF sin calcular) = 450
    //   neto = 15.000 − 450 = 14.550
    expect(await valorTarjeta(page, 'Comisión inmobiliaria (3%)')).toBe('450,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('450,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('14.550,00 €');
    // …y tiene que decir que es un techo, nombrando las DOS cosas que faltan.
    const neto = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(neto).toContain('Techo');
    expect(neto).toContain('plusvalía municipal');
    expect(neto).toContain('IRPF');

    // Un 0 escrito a mano es lo mismo que el campo vacío: sigue faltando el dato.
    await rellenar(page, 'Precio de compra original', '0');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('14.550,00 €');

    // Y con el dato puesto, el cálculo aparece entero (art. 35 LIRPF):
    //   valor de adquisición = 8.000 · valor de transmisión = 15.000 − 450 = 14.550
    //   ganancia = 6.550 → 6.000 × 19 % + 550 × 21 % = 1.140 + 115,50 = 1.255,50
    //   total gastos = 0 + 450 + 0 + 1.255,50 = 1.705,50 · neto = 15.000 − 1.705,50
    await rellenar(page, 'Precio de compra original', '8000');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('8000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('14.550,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('6550,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1255,50 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1705,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.294,50 €');
    // El neto sigue siendo techo, pero ya SOLO por la plusvalía.
    const neto2 = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(neto2).toContain('plusvalía municipal');
    expect(neto2).not.toContain('IRPF');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Reparados el 30/08/2026 (Inspector, ronda 8, hallazgos 526-527).
// ═════════════════════════════════════════════════════════════════════════════

test('526 — el ejemplo de Galicia ya publica el reducido real (3 %), no un 0 % inventado', async ({
  page,
}) => {
  await page.goto(RUTA);
  await selectCcaa(page).selectOption('galicia');
  await rellenar(page, 'Precio del trastero', '12000');
  await selectPerfil(page).selectOption('joven');
  // Lo que la app SÍ hace bien: cobra el tipo general y ofrece el reducido real como
  // oportunidad, con su cifra correcta.
  expect(await valorTarjeta(page, 'ITP (8,00%)')).toBe('960,00 €');
  expect(await texto(page.locator('[class*="avisoReducidos"]').first())).toContain('3,00%');

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const ejemplo = await texto(
    page.getByText(/Un joven de 30 años que compra un trastero en Galicia/),
  );
  expect(ejemplo).toContain('3%');
  expect(ejemplo).not.toContain('0%');
});

test('527 — la nota de cabecera ya no contradice el aviso de IGIC/IPSI en Melilla', async ({
  page,
}) => {
  await page.goto(RUTA);
  await selectCcaa(page).selectOption('melilla');
  const nota = await texto(page.locator('[class*="trasteroNote"]').first());
  expect(nota).toMatch(/Canarias, Ceuta y Melilla/i);
  expect(nota).not.toMatch(/que no depende de la comunidad autónoma/i);
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 02/09/2026 — tres casos en zonas que ninguna ronda anterior pisó.
//
// Territorio y perfil elegidos a propósito para que las cifras no puedan venir copiadas de
// un caso ya escrito: el País Vasco (el ITP más bajo de la tabla, 4 %, y el único con
// `ajd: 0`) con el perfil «discapacidad», que ninguna ronda había seleccionado; y Baleares
// en su QUINTO tramo, el 13 %, que es el techo de todas las escalas del catálogo y hasta hoy
// no lo había ejercitado ningún test de esta app.
//
// De dónde sale cada cifra esperada (ninguna de memoria):
//  - País Vasco 4 % y Baleares 8 % → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
//    leído por `tipoGeneralDe()` en `data/itp-ccaa.ts`.
//  - Escala progresiva de Baleares (8/9/10/12/13 %) y `ajd: 0` del País Vasco → `ITP_CCAA`
//    en `data/itp-ccaa.ts`, aplicada por `calcularITPProgresivo` a través de `importeITP`.
//  - Reducidos y su elección → `elegirTipoITP` (mismo fichero), con `viviendaHabitual: false`
//    porque un trastero suelto nunca lo es.
//  - Aranceles → `ARANCELES_NOTARIO` (RD 1426/1989 nº 2) × `FACTURA_NOTARIAL` (horquilla
//    ×1,5-×2; la tarjeta enseña el punto medio ×1,75) y `ARANCELES_REGISTRO` (RD 1427/1989
//    nº 2) + `REGISTRO_CONCEPTOS` (presentación 6,010121 € y nota simple 3,005061 €). Los
//    dos terminan en `× 1.21` de IVA.
//  - Plusvalía municipal → `calcularPlusvaliaMunicipal` sobre `COEFICIENTES_IIVTNU_2025`
//    (1 año → 0,13) y `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` = 25 %.
//  - IRPF → `calcularGananciaInmueble` (art. 35 LIRPF) sobre
//    `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 · 21 % hasta 50.000).
// ═════════════════════════════════════════════════════════════════════════════

test.describe('RE-INSPECCIÓN 02/09/2026 — País Vasco, el tramo del 13 % y la plusvalía incompleta', () => {
  /**
   * CASO 14 (NORMAL) — País Vasco, segunda mano, 22.000 €, perfil «Persona con discapacidad».
   *
   * Dos cosas que ninguna ronda anterior había comprobado a la vez: el tipo general más bajo
   * de la tabla (4 %) y un perfil de comprador para el que esa comunidad NO tiene ningún
   * reducido con ese nombre. `elegirTipoITP` no encuentra candidatos por perfil, así que cae
   * al tipo general — y aun así tiene que ofrecer como oportunidad el reducido que no es de
   * colectivo y que un trastero sí podría alcanzar (zonas despobladas de Álava, 1,5 %, cuyas
   * condiciones no incluyen «Vivienda habitual»).
   */
  test('CASO 14 (normal) — País Vasco, segunda mano, 22.000 €, comprador con discapacidad', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('pais-vasco');
    await selectPerfil(page).selectOption('discapacidad');
    await rellenar(page, 'Precio del trastero', '22000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP = 22.000 × 4 % = 880,00. El 4 % es TIPOS_ITP_CCAA_2025 → { ccaa: 'País Vasco',
    // tipo: 4 }. El País Vasco no tiene escala progresiva, así que el tipo efectivo que
    // rotula la tarjeta coincide con el nominal.
    // Ninguno de sus tres reducidos se aplica: «Vivienda habitual (hasta 120 m²)» (2,5 %) y
    // «Familia numerosa» (2,5 %) exigen vivienda habitual —y la app pasa
    // `viviendaHabitual: false`—, y «Zonas despobladas (Álava)» (1,5 %) exige un municipio
    // que la herramienta no pregunta. Además NINGUNO se llama «discapacidad», así que la
    // lista de candidatos por perfil sale vacía y manda el tipo general.
    expect(await valorTarjeta(page, 'ITP (4,00%)')).toBe('880,00 €');
    expect(await descripcionTarjeta(page, 'ITP (4,00%)')).toContain('País Vasco');

    // El reducido que no es de colectivo y que no exige vivienda habitual sí tiene que
    // enseñarse como oportunidad, con su cifra: es el criterio de `elegirTipoITP`, que lo
    // ofrece «como oportunidad, nunca como cifra» del importe liquidado.
    const aviso = await texto(page.locator('[class*="avisoReducidos"]').first());
    expect(aviso).toContain('1,50%');
    expect(aviso).toContain('Zonas despobladas (Álava)');

    // Notaría — RD 1426/1989 nº 2 (ARANCELES_NOTARIO), dos tramos:
    //   tramo 1 (hasta 6.010,12 €)             →                            90,15
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)   → 15.989,88 × 0,0045 =       71,95446
    //   arancel sin IVA                        =                          162,10446
    //   con el 21 % de IVA                     = 162,10446 × 1,21 =       196,1463966
    // FACTURA_NOTARIAL: ×1,5 = 294,2195949 · ×2 = 392,2927932 · medio ×1,75 = 343,25619405
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('343,26 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('294,22 €');
    expect(notaria).toContain('392,29 €');

    // Registro — RD 1427/1989 nº 2 (ARANCELES_REGISTRO) + los dos fijos de REGISTRO_CONCEPTOS:
    //   tramo 1                                →                            24,04
    //   tramo 2 (0,175 %)                      → 15.989,88 × 0,00175 =      27,98229
    //   inscripción                            =                            52,02229
    //   + presentación 6,010121 + nota simple 3,005061 =                     61,037472
    //   con el 21 % de IVA                     = 61,037472 × 1,21 =         73,85534112
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('73,86 €');

    // ITP_CCAA['pais-vasco'].ajd = 0, y además es segunda mano: no hay tarjeta de AJD.
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

    // Total = 880 + 343,25619405 + 73,85534112 + 300 = 1.597,11153517
    //   % sobre el precio = 1.597,11153517 / 22.000 = 7,259598 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1597,12 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('7,26%');

    // Coste total = 22.000 + 1.597,11153517 = 23.597,11153517
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('23.597,12 €');
  });

  /**
   * CASO 15 (LÍMITE) — Baleares, 2.500.000 €: el TRAMO MÁS ALTO de todas las escalas del
   * catálogo. `ITP_CCAA.baleares.tramosProgresivos` es la única escala de cinco tramos, y su
   * quinto (13 %) marca el máximo que cita `FISCAL_INMUEBLES_META.nota`. Es también donde más
   * se separan el tipo plano y el progresivo: el 8 % nominal daría 200.000 € y la escala da
   * 275.000 €, 75.000 € de diferencia.
   *
   * El precio es deliberadamente absurdo para un trastero: lo que se prueba es la ARITMÉTICA
   * de la escala, y solo por encima de 2.000.000 € se alcanza el quinto tramo.
   */
  test('CASO 15 (límite) — Baleares, 2.500.000 €: los cinco tramos hasta el 13 %', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('baleares');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '2500000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // La app tiene que ANUNCIAR la escala que va a aplicar, con sus cinco tipos.
    await expect(page.getByText('8% → 9% → 10% → 12% → 13%')).toBeVisible();

    // ITP progresivo (calcularITPProgresivo sobre ITP_CCAA.baleares.tramosProgresivos):
    //         0 →   400.000  (  400.000) ×  8 % =  32.000
    //   400.000 →   600.000  (  200.000) ×  9 % =  18.000
    //   600.000 → 1.000.000  (  400.000) × 10 % =  40.000
    // 1.000.000 → 2.000.000  (1.000.000) × 12 % = 120.000
    // 2.000.000 → 2.500.000  (  500.000) × 13 % =  65.000
    //                                     TOTAL = 275.000,00
    //   tipo EFECTIVO = 275.000 / 2.500.000 = 11,00 % — y tiene que ser el efectivo el que
    //   rotule la tarjeta: el 8 % nominal de la tabla desmentiría a la cifra de al lado.
    expect(await valorTarjeta(page, 'ITP (11,00%)')).toBe('275.000,00 €');
    expect(await descripcionTarjeta(page, 'ITP (11,00%)')).toContain('Islas Baleares');

    // Ningún reducido de Baleares está al alcance: los cuatro llevan `valorMaximo: 270151`,
    // muy por debajo de este precio, así que ni se aplican ni se ofrecen como oportunidad.
    await expect(page.getByText(/Podrías pagar menos/)).toHaveCount(0);

    // Notaría — ARANCELES_NOTARIO, seis tramos acumulados hasta 2.500.000 €:
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 %
    //         + 450.759,07×0,05 % + 1.898.987,90×0,03 %
    //   = 90,15 + 108,182205 + 45,0759 + 90,15182 + 225,379535 + 569,69637 = 1.128,63583
    //   con el 21 % de IVA = 1.365,6493543 · medio ×1,75 = 2.389,886370025
    //   horquilla: ×1,5 = 2.048,47403145 · ×2 = 2.731,2987086
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2389,89 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('2048,47 €');
    expect(notaria).toContain('2731,30 €');

    // Registro — ARANCELES_REGISTRO, seis tramos acumulados:
    //   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 %
    //         + 450.759,07×0,030 % + 1.898.987,90×0,020 %
    //   = 24,04 + 42,0708575 + 37,56325 + 67,613865 + 135,227721 + 379,79758 = 686,3132735
    //   sigue por DEBAJO del tope REGISTRO_MAXIMO (2.181,67), así que no se recorta
    //   + presentación 6,010121 + nota simple 3,005061 = 695,3284555
    //   con el 21 % de IVA = 841,34743116
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('841,35 €');

    // Total = 275.000 + 2.389,886370025 + 841,34743116 + 300 = 278.531,23380119
    //   % sobre el precio = 278.531,2338 / 2.500.000 = 11,141249 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('278.531,24 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,14%');

    // Coste total = 2.500.000 + 278.531,2338 = 2.778.531,2338
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.778.531,24 €');
  });

  /**
   * CASO 16 (DEBE RECHAZARSE) — la plusvalía municipal con UN solo dato ausente.
   *
   * Los años de propiedad son el multiplicador de la base objetiva (art. 107.4 TRLHL) y no
   * admiten valor por defecto: `COEFICIENTES_IIVTNU_2025` va de 0,08 a 0,45, más de cinco
   * veces de diferencia. Con el campo a 0 la app no puede inventar un coeficiente ni escribir
   * «0,00 €» —que se leería como «no pagas nada»—, y el neto no puede presentarse como
   * definitivo mientras esa partida falte.
   *
   * Se prueban las dos caras: sin el dato la plusvalía se declara SIN CALCULAR y el neto se
   * rotula como techo; con el dato puesto (1 año) aparece la cifra exacta y el neto deja de
   * ser un techo.
   *
   * ⚠️ REESCRITO el 10/09/2026. Hasta hoy este caso escribía un «0» en el campo y lo daba por
   * equivalente a «no hay dato», que es exactamente el defecto que la parte 11 deja abierto:
   * desde la reparación del motor del 07/09 (hallazgo 666) el 0 es un dato VÁLIDO —la reventa
   * antes del año, coeficiente 0,14— y lo único que falta de verdad es el campo VACÍO. Lo que
   * este caso verifica sigue siendo lo mismo; lo que cambia es que el dato ausente se
   * representa como ausente.
   */
  test('CASO 16 (debe rechazarse) — sin años de propiedad no hay plusvalía: ni 0,00 € ni NaN', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '20000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '12000');
    await rellenar(page, 'Valor catastral del suelo', '6000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '15000');

    // Los años de propiedad son lo ÚNICO que falta, y faltan de la única forma en que un dato
    // puede faltar en un campo de texto: vacío.
    const anios = page.locator('input[aria-label="Años de propiedad"]');
    await anios.fill('');
    await anios.blur();
    await expect(anios).toHaveValue('');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    await expect(page.getByText('No definido')).toHaveCount(0);
    // Sobre el texto completo y en mayúsculas: `getByText('NaN')` no distingue mayúsculas y
    // casaría con «ganancia», que lleva «nan» dentro.
    expect(await page.locator('body').innerText()).not.toContain('NaN');

    // El resto del art. 35 LIRPF sí se calcula, SIN plusvalía en el valor de transmisión:
    //   comisión 3 % (la que trae por defecto) = 20.000 × 3 % = 600
    //   valor de transmisión = 20.000 − 600 − 0 = 19.400 · valor de adquisición = 12.000
    //   ganancia = 7.400 → 6.000 × 19 % + 1.400 × 21 % = 1.140 + 294 = 1.434,00
    //   total gastos = 0 (plusvalía sin calcular) + 600 + 0 + 1.434 = 2.034
    //   neto = 20.000 − 2.034 = 17.966,00
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('19.400,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('7400,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1434,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2034,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('17.966,00 €');
    // …y ese neto TIENE que anunciarse como techo, no como lo que se recibe.
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain('Techo');

    // Con el dato puesto (1 año de tenencia):
    await rellenar(page, 'Años de propiedad', '1');
    await expect(anios).toHaveValue('1');
    // Plusvalía — COEFICIENTES_IIVTNU_2025 da 0,13 a 1 año:
    //   objetivo (art. 107.4): 6.000 × 0,13 = 780 → × 25 % = 195,00
    //     (el 25 % es PLUSVALIA_MUNICIPAL_META.tipoOrientativo, no el 30 % máximo legal)
    //   real (art. 107.5): (20.000 − 12.000) × (6.000/15.000) × 25 % = 8.000 × 0,4 × 0,25 = 800
    //   el contribuyente elige el más favorable → 195,00 €
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('195,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');
    //   valor de transmisión = 20.000 − 600 − 195 = 19.205 · ganancia = 19.205 − 12.000 = 7.205
    //   IRPF = 6.000 × 19 % + 1.205 × 21 % = 1.140 + 253,05 = 1.393,05
    //   total gastos = 195 + 600 + 0 + 1.393,05 = 2.188,05 · neto = 20.000 − 2.188,05
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('19.205,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('7205,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1393,05 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2188,05 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('17.811,95 €');
    // Ya no falta nada: el neto deja de ser un techo.
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain('realmente recibes');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — el hallazgo 590 de la re-inspección del 02/09/2026, REPARADO ese mismo día.
// Estaba escrito con `test.fail()` afirmando lo que DEBERÍA pasar; al repararlo se le quitó
// la marca y se queda como regresión.
// ═════════════════════════════════════════════════════════════════════════════

// ✅ REPARADO (medio) — operativa.
// Cuando la plusvalía no se puede calcular, la app manda al usuario a rellenar campos que YA
// tiene rellenos y no nombra el que de verdad falta. El texto de la tarjeta es fijo —«No
// calculada (faltan datos)»— y el del neto también: «añade los años de propiedad y el valor
// catastral del suelo». La guarda del `useMemo`, en cambio, exige TRES cosas
// (`valorSuelo > 0 && anios > 0 && precioC > 0`), y el precio de compra original no aparece
// en ninguno de los dos mensajes.
// Es el hallazgo 437, que la app hermana `simulador-gastos-compraventa-garaje` reparó
// construyendo la lista `faltan` con lo que de verdad está vacío («No calculada (falta el
// valor catastral del suelo)», etc.). A esta app no llegó.
// Caso: 20.000 € de venta · 12.000 € de compra · suelo 6.000 · total catastral 15.000 · años
//       de propiedad VACÍO → esperado que el aviso nombre los años de propiedad y NO mande a
//       rellenar el valor catastral del suelo, que ya vale 6.000 · obtenido «No calculada
//       (faltan datos)» en la tarjeta y «Techo: aún NO incluye la plusvalía municipal (añade
//       los años de propiedad y el valor catastral del suelo)» sobre un neto de 17.966,00 €.
test(
  'REGRESIÓN (operativa) — el aviso de plusvalía nombra el campo que de verdad falta',
  async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '20000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '12000');
    await rellenar(page, 'Valor catastral del suelo', '6000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '15000');
    // Los años de propiedad son lo ÚNICO que falta.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');

    // La aserción de fondo: no se puede pedir un dato que el usuario ya ha dado.
    const neto = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(neto).not.toContain('valor catastral del suelo');
  },
);

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 07/09/2026 — la cola la reabrió tras la reparación del clúster de
// compraventa (commit 0dba12c9) y la del recargo del art. 27.2 LGT (13d2181b), que
// tocó el bloque educativo de esta app.
//
// Tres casos NUEVOS, resueltos a mano ANTES de tocar el navegador, en territorio y
// perfil que ninguna ronda anterior había usado (Cantabria y Aragón; 55.000 €,
// 400.000 € y 450.000 €), para que ninguna cifra pueda venir copiada de un caso ya
// escrito.
//
// De dónde sale cada cifra esperada (ninguna de memoria):
//  - Tipo general de Cantabria (9 %) y de Aragón (8 %) → `TIPOS_ITP_CCAA_2025` en
//    `data/fiscal/inmuebles.ts`, leído por `tipoGeneralDe()` en `data/itp-ccaa.ts`.
//  - Escala progresiva de Aragón → `ITP_CCAA.aragon.tramosProgresivos`
//    ([{ hasta: 400000, tipo: 8 }, { hasta: Infinity, tipo: 10 }]).
//  - Tipos reducidos de Cantabria y sus condiciones → `ITP_CCAA.cantabria.tiposReducidos`.
//    Ninguno se aplica: los tres que casan con «familia numerosa» exigen «Vivienda
//    habitual», y `elegirTipoITP` recibe `viviendaHabitual: false` porque un trastero
//    suelto nunca lo es.
//  - Aranceles → `ARANCELES_NOTARIO` (RD 1426/1989 nº 2) × `FACTURA_NOTARIAL`
//    (×1,5 a ×2; la tarjeta enseña el punto medio ×1,75) y `ARANCELES_REGISTRO`
//    (RD 1427/1989 nº 2) + `REGISTRO_CONCEPTOS` (presentación 6,010121 € y nota simple
//    3,005061 €). Ambos terminan en `× 1.21` de IVA.
//  - Ganancia patrimonial e IRPF → `calcularGananciaInmueble` (arts. 34-36 LIRPF) sobre
//    `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 · 21 % hasta 50.000).
//  - Plusvalía municipal → `calcularPlusvaliaMunicipal` sobre `COEFICIENTES_IIVTNU_2025`
//    y `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` (25 %).
// ═════════════════════════════════════════════════════════════════════════════

test.describe('RE-INSPECCIÓN 07/09/2026 — Cantabria, la frontera de la escala de Aragón y unos años negativos', () => {
  /**
   * CASO 17 (NORMAL) — Cantabria, comunidad que ninguna ronda había ejercitado, con el
   * perfil «Familia numerosa», que hasta hoy solo se había probado en el País Vasco con
   * discapacidad. Precio 55.000 €, dentro del tercer tramo de los dos aranceles, y una
   * gestoría distinta de la que trae por defecto (250 € en vez de 300 €).
   *
   * Lo que se comprueba de fondo: que un perfil con derecho a un 4 % NO se lo lleve, porque
   * los tres reducidos de Cantabria que casan con «familia» exigen vivienda habitual y un
   * trastero suelto no lo es. Equivocarse aquí por defecto son 2.750 € de menos en el
   * presupuesto (55.000 × 4 % = 2.200 frente a 55.000 × 9 % = 4.950).
   */
  test('CASO 17 (normal) — Cantabria, segunda mano, 55.000 €, familia numerosa', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('cantabria');
    await selectPerfil(page).selectOption('familia-numerosa');
    await rellenar(page, 'Precio del trastero', '55000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '250');

    // ITP = 55.000 × 9 % = 4.950. El 9 % es TIPOS_ITP_CCAA_2025 → { ccaa: 'Cantabria', tipo: 9 }.
    // Cantabria no tiene escala progresiva, así que el tipo efectivo coincide con el nominal.
    expect(await valorTarjeta(page, 'ITP (9,00%)')).toBe('4950,00 €');
    expect(await descripcionTarjeta(page, 'ITP (9,00%)')).toContain('Cantabria');

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO):
    //   tramo 1 (hasta 6.010,12 €)             →                              90,15
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)   → 24.040,49 × 0,0045 =        108,182205
    //   tramo 3 (30.050,61→55.000, 0,15 %)     → 24.949,39 × 0,0015 =         37,424085
    //   arancel sin IVA                        =                             235,75629
    //   con el 21 % de IVA                     = 235,75629 × 1,21 =          285,2651109
    // FACTURA_NOTARIAL: ×1,5 = 427,89766635 · ×2 = 570,5302218 · medio ×1,75 = 499,213944075
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('499,21 €');
    const notaria17 = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria17).toContain('427,90 €');
    expect(notaria17).toContain('570,53 €');

    // Registro — RD 1427/1989, números 1, 2 y 4:
    //   tramo 1 (hasta 6.010,12 €)             →                              24,04
    //   tramo 2 (6.010,12→30.050,61, 0,175 %)  → 24.040,49 × 0,00175 =         42,0708575
    //   tramo 3 (30.050,61→55.000, 0,125 %)    → 24.949,39 × 0,00125 =         31,1867375
    //   inscripción (número 2)                 =                              97,297595
    //   + presentación 6,010121 + nota simple 3,005061 =                     106,312777
    //   con el 21 % de IVA                     = 106,312777 × 1,21 =         128,63846017
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('128,64 €');

    // En segunda mano no hay AJD: ITP y cuota gradual de AJD son incompatibles.
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('250,00 €');

    // Total = 4.950 + 499,21 + 128,64 + 250 = 5.827,85 (líneas ya redondeadas al céntimo)
    //   % sobre el precio = 5.827,85 / 55.000 = 10,5960909 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('5827,85 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('10,60%');
    // Coste total = 55.000 + 5.827,85 = 60.827,85
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('60.827,85 €');

    // Y el 4 % que NO se ha aplicado tiene que enseñarse como oportunidad, con sus
    // requisitos: los dos de «familia» (que exigen vivienda habitual) y el de municipios
    // despoblados, que no la exige y por eso también entra en `alAlcanceDeCualquiera`.
    const aviso = await texto(page.locator('p', { hasText: 'Podrías pagar menos' }).first().locator('xpath=..'));
    expect(aviso).toContain('4,00% — Familia numerosa');
    expect(aviso).toContain('4,00% — Familia monoparental');
    expect(aviso).toContain('4,00% — Municipios despoblados');
    expect(aviso).toContain('Vivienda habitual');
  });

  /**
   * CASO 18 (LÍMITE) — la FRONTERA exacta de una escala progresiva, que es donde un `<` en
   * lugar de un `<=` se lleva por delante el tramo siguiente o cobra de más. Aragón parte
   * en 400.000 € (8 % → 8,5 %), así que se prueba justo encima de la raya y 50.000 € más
   * arriba, donde el segundo tramo ya tiene que morder.
   *
   * A 400.000 € el tipo efectivo debe seguir siendo 8,00 % clavado; a 450.000 €, 8,06 %.
   * Si la app aplicara el tipo plano del primer tramo a todo (el defecto que `importeITP`
   * vino a cerrar), a 450.000 € cobraría 36.000 € en vez de 36.250 €.
   *
   * ⚠️ 11/09/2026: hasta ese día la escala de Aragón que aplicaba esta app tenía DOS tramos
   * (8 % hasta 400.000 € y 10 % por encima) y le faltaban los tres escalones intermedios
   * del art. 121-1. El triaje fiscal la corrigió contra el consolidado del BOE, así que el
   * segundo tramo pasó del 10 % al 8,5 % y el caso de 450.000 € bajó de 37.000 a 36.250 €.
   * La frontera que vigila este caso sigue siendo la misma; lo que cambió es cuánto muerde
   * el tramo de después — y ahora la diferencia con el tipo plano es de solo 250 €, que es
   * justamente lo que hace el caso más exigente, no menos.
   */
  test('CASO 18 (límite) — Aragón, la raya de los 400.000 € entre el 8 % y el 8,5 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('aragon');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '400000');

    // El recuadro de la comunidad tiene que anunciar la escala que luego aplica.
    expect(await texto(page.locator('p', { hasText: 'escala progresiva (' }).first())).toContain(
      '8% → 8,5% → 9% → 9,5% → 10%',
    );

    // ITP a 400.000 € exactos = 400.000 × 8 % = 32.000. El segundo tramo empieza DESPUÉS:
    // `calcularITPProgresivo` agota el primero (baseTramo = 400.000 − 0) y sale del bucle
    // porque al segundo le queda base 0.
    expect(await valorTarjeta(page, 'ITP (8,00%)')).toBe('32.000,00 €');

    // Notaría — ARANCELES_NOTARIO hasta el quinto tramo:
    //   90,15 + 24.040,49×0,0045 + 30.050,60×0,0015 + 90.151,82×0,001 + 249.746,97×0,0005
    //   = 90,15 + 108,182205 + 45,0759 + 90,15182 + 124,873485 = 458,43341
    //   con IVA = 554,7044261 · ×1,5 = 832,05663915 · ×2 = 1.109,4088522 · medio = 970,732745675
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('970,73 €');
    const notaria18 = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria18).toContain('832,06 €');
    expect(notaria18).toContain('1109,41 €');

    // Registro — ARANCELES_REGISTRO hasta el quinto tramo:
    //   24,04 + 24.040,49×0,00175 + 30.050,60×0,00125 + 90.151,82×0,00075 + 249.746,97×0,0003
    //   = 24,04 + 42,0708575 + 37,56325 + 67,613865 + 74,924091 = 246,2120635
    //   + 6,010121 + 3,005061 = 255,2272455 · con IVA = 308,8249671
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('308,82 €');

    // Total = 32.000 + 970,73 + 308,82 + 300 (gestoría por defecto) = 33.579,55
    //   % sobre el precio = 33.579,55 / 400.000 = 8,3948875 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('33.579,55 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,39%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('433.579,55 €');

    // Los cinco reducidos de Aragón son todos de colectivo (joven, discapacidad, víctimas
    // de violencia de género, familia numerosa y familia numerosa en medio rural) y ninguno
    // queda «al alcance de cualquiera», así que con perfil general no hay nada que ofrecer:
    // la caja de oportunidades NO debe pintarse.
    await expect(page.locator('p', { hasText: 'Podrías pagar menos' })).toHaveCount(0);

    // 50.000 € por encima de la raya, el segundo tramo ya muerde:
    //   400.000 × 8 % + 50.000 × 8,5 % = 32.000 + 4.250 = 36.250
    //   tipo EFECTIVO = 36.250 / 450.000 = 8,0555 % (el nominal, 8 %, mentiría)
    //   y coincide con la cuota acumulada que la tabla del art. 121-1 fija a los 450.000 €.
    await rellenar(page, 'Precio del trastero', '450000');
    expect(await valorTarjeta(page, 'ITP (8,06%)')).toBe('36.250,00 €');
    // Notaría: 483,43341 × 1,21 = 584,9544261 → medio ×1,75 = 1.023,669245675
    // Registro: 261,2120635 + 9,015182 = 270,2272455 → ×1,21 = 326,97496706
    // Total = 36.250 + 1.023,67 + 326,97 + 300 = 37.900,64
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('37.900,64 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('487.900,64 €');
  });

  /**
   * CASO 19 (DEBE RECHAZARSE) — años de propiedad NEGATIVOS, tecleados mientras el campo
   * conserva el foco, que es cuando el `min={1}` de NumberInput todavía no ha actuado.
   *
   * Por qué importa: `aniosPropiedad` se lee con `parseInt`, y el motor de la plusvalía
   * acota con `Math.min(Math.max(anios, 1), 20)`. Si la guarda del `useMemo` dejara pasar
   * un −5, el −5 se convertiría en el coeficiente de UN año (0,13) y la app publicaría una
   * plusvalía de aspecto normal a partir de un dato imposible. Lo correcto es tratarlo como
   * dato que falta —igual que el campo vacío del CASO 16— y decirlo.
   *
   * El resto de la pestaña sí tiene que calcular: el IRPF no depende de los años.
   */
  test('CASO 19 (debe rechazarse) — unos años de propiedad negativos no son un año de tenencia', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '24000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '14000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo', '1200');
    await rellenar(page, 'Valor catastral del suelo', '5000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '12000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '4');
    await rellenar(page, 'Gestoría y certificados del vendedor (€)', '350');
    // Sin blur: el min del NumberInput (0 desde el hallazgo 682) aún no ha corregido el valor.
    const anios = page.locator('input[aria-label="Años de propiedad"]');
    await anios.fill('-5');

    // La plusvalía NO se calcula, y no se calcula con el coeficiente de 1 año (0,13), que
    // habría dado 5.000 × 0,13 × 25 % = 162,50 €. Tampoco con el de «menos de 1 año» (0,14):
    // un año negativo se RECHAZA, no se acota a 0. Acotarlo lo convertiría en una reventa
    // antes del año y liquidaría un impuesto a partir de un dato imposible.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('años de propiedad');

    // Lo que sí se calcula (art. 35 LIRPF), con la plusvalía a 0 porque falta:
    //   valor de adquisición = 14.000 + 1.200 = 15.200
    //   comisión = 24.000 × 4 % = 960 · gestoría del vendedor = 350
    //   valor de transmisión = 24.000 − 960 − 350 − 0 = 22.690
    //   ganancia = 22.690 − 15.200 = 7.490
    //   IRPF = 6.000 × 19 % + 1.490 × 21 % = 1.140 + 312,90 = 1.452,90
    //   total gastos = 0 + 960 + 350 + 1.452,90 = 2.762,90 · neto = 24.000 − 2.762,90
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('15.200,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('22.690,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('7490,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1452,90 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria (4%)')).toBe('960,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2762,90 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('21.237,10 €');
    // Y el neto se anuncia como techo, nombrando el campo que de verdad falta.
    const neto19 = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(neto19).toContain('Techo');
    expect(neto19).toContain('los años de propiedad');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los CINCO hallazgos de la re-inspección del 07/09/2026 (637-641),
// REPARADOS el 09/09/2026. Estaban escritos con `test.fail()` afirmando lo que DEBERÍA
// pasar; al repararlos se les quitó la marca y hoy sujetan la reparación.
// ═════════════════════════════════════════════════════════════════════════════

// ✅ REPARADO 09/09/2026 (637, medio) — accesibilidad.
// El aviso de la modalidad «Independiente» lleva el color escrito a mano en un `style`
// inline (`color: '#856404'`, page.tsx:516) en vez del token `var(--text-secondary)` que usa
// su hermana del mismo panel. En modo oscuro ese marrón queda rgb(133,100,4) sobre el
// rgb(42,42,42) del panel: contraste 2,61:1, cuando WCAG AA pide 4,5:1 para texto normal
// (0,85rem). La nota hermana, con el token, rinde rgb(176,176,176) sobre el mismo fondo.
// No es decorativo: es el párrafo que avisa de que el trastero independiente paga el 21 %
// y no el 10 %, o sea la diferencia entre 1.200 € y 2.520 € en un trastero de 12.000 €.
// El CLAUDE.md global §6 exige el modo oscuro completo, y un color literal no lo tiene.
// Caso: modo oscuro (botón «Cambiar a modo oscuro») · Primera mano · Modalidad
//       «Independiente» → esperado contraste ≥ 4,5:1 · obtenido 2,61:1.
// Reparado retirando el literal: el párrafo se queda con el token del `.infoCcaaNote`,
// que en oscuro rinde rgb(176,176,176) sobre el rgb(42,42,42) del panel (6,6:1).
test(
  'REGRESIÓN 637 (accesibilidad) — el aviso de modalidad es legible en modo oscuro',
  async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.getByRole('button', { name: /Independiente/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    const medirRatio = () =>
      page.evaluate(() => {
      const luminancia = (css: string) => {
        const [r, g, b] = (css.match(/[\d.]+/g) as string[]).slice(0, 3).map(Number).map((v) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const p = Array.from(document.querySelectorAll('p')).find((e) =>
        /el trastero independiente tributa al/.test(e.textContent || ''),
      );
      if (!p) return 0;
      let fondo: string | null = null;
      let el: HTMLElement | null = p.parentElement;
      while (el && !fondo) {
        const bg = getComputedStyle(el).backgroundColor;
        if (bg && !/rgba\(0, 0, 0, 0\)/.test(bg) && !/, 0\)$/.test(bg)) fondo = bg;
        el = el.parentElement;
      }
      const l1 = luminancia(getComputedStyle(p).color);
      const l2 = luminancia(fondo || 'rgb(255, 255, 255)');
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      });

    const ratio = await esperarEstable(medirRatio);

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  },
);

// ✅ REPARADO 09/09/2026 (638, bajo) — contenido.
// La tarjeta de plusvalía compone el aviso como «No calculada (falta ...)» y le pega detrás
// una lista, así que en cuanto lo que falta es un plural —o son dos campos— el verbo no
// concuerda: «No calculada (falta los años de propiedad)» y «No calculada (falta el valor
// catastral del suelo, los años de propiedad)». Es el texto que se lee al lado de un
// «SIN CALCULAR» en una app fiscal.
// Caso: pestaña Vendedor · venta 24.000 € · compra 14.000 € · suelo 5.000 € · total
//       catastral 12.000 € · años de propiedad VACÍOS → esperado «faltan los años de
//       propiedad» · obtenido «No calculada (falta los años de propiedad)».
// Reparado marcando el número gramatical de cada campo (`CampoQueFalta`) y componiendo el
// verbo y la enumeración aparte: «faltan» con dos o más campos o con uno solo en plural, y
// «y» antes del último en vez de una coma.
test(
  'REGRESIÓN 638 (contenido) — el verbo del aviso concuerda con lo que falta',
  async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '24000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '14000');
    await rellenar(page, 'Valor catastral del suelo', '5000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '12000');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    // Un solo campo, pero PLURAL: «faltan los años de propiedad».
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toMatch(/faltan los años de propiedad/);

    // Y con DOS campos vacíos, el verbo sigue en plural y la lista se cierra con «y», no
    // con una coma: «faltan el valor catastral del suelo y los años de propiedad».
    await rellenar(page, 'Valor catastral del suelo', '');
    const dos = await descripcionTarjeta(page, 'Plusvalía municipal');
    expect(dos).toContain('faltan el valor catastral del suelo y los años de propiedad');
  },
);

// ✅ REPARADO 09/09/2026 (639, bajo) — contenido.
// Cuando lo único que falta es el precio de compra original, ese campo bloquea a la vez la
// plusvalía y el IRPF, y el aviso del neto lo pide DOS VECES en la misma frase: «Techo: aún
// NO incluye la plusvalía municipal (añade el precio de compra original) ni el IRPF de la
// ganancia (añade el precio de compra original)». Se construye concatenando dos avisos que
// nombran cada uno sus campos, sin mirar si coinciden.
// Caso: pestaña Vendedor · venta 24.000 € · suelo 5.000 € · años 10 · precio de compra
//       VACÍO → esperado que el campo se pida una sola vez · obtenido dos veces en la
//       misma descripción, sobre un neto de 23.280,00 €.
// Reparado separando los CONCEPTOS que faltan de los CAMPOS que hay que rellenar: los dos
// conceptos se siguen nombrando («la plusvalía municipal ni el IRPF de la ganancia») y el
// campo se pide una sola vez al final.
test(
  'REGRESIÓN 639 (contenido) — el aviso del neto no pide dos veces el mismo campo',
  async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '24000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Valor catastral del suelo', '5000');
    await rellenar(page, 'Años de propiedad', '10');

    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('23.280,00 €');
    const neto = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    const veces = neto.split('el precio de compra original').length - 1;
    expect(veces).toBe(1);
    // Y sin perder ninguno de los dos conceptos que quedan fuera del neto.
    expect(neto).toContain('la plusvalía municipal');
    expect(neto).toContain('el IRPF de la ganancia');
  },
);

// ✅ REPARADO 09/09/2026 (640, bajo) — dato.
// El sello `DataReference` de la plusvalía cierra su nota con «El IRPF de la ganancia usa
// los tramos del ahorro de 2025 (19 % a 30 %)», con el rango TECLEADO A MANO, mientras la
// propia página ya lo deriva de `TRAMOS_GANANCIAS_PATRIMONIALES_2025` en `TIPO_AHORRO_MIN`
// y `TIPO_AHORRO_MAX` y lo publica cuatro tarjetas más abajo («Tributación en base del
// ahorro (19%-30%)») y en la tabla comparativa. Hoy los dos dicen lo mismo; el día que se
// mueva el tramo del 30 % se moverán los derivados y el sello se quedará atrás, que es
// justo lo que un sello de verificación no puede hacer. Es el hallazgo 592 sin terminar de
// drenar: aquella reparación derivó los extremos y dejó fuera el sello.
// Caso: `app/simulador-gastos-compraventa-trastero/page.tsx` → esperado que el rango salga
//       de TIPO_AHORRO_MIN/TIPO_AHORRO_MAX · obtenido el literal «(19 % a 30 %)» en el
//       `nota` del segundo DataReference, visible en pantalla junto al sello de la IIVTNU.
// Reparado interpolando `TIPO_AHORRO_MIN` y `TIPO_AHORRO_MAX` en la nota del sello: el
// rango sale ya de `TRAMOS_GANANCIAS_PATRIMONIALES_2025`, como las otras tres veces que
// aparece en la página.
test('REGRESIÓN 640 (dato) — el sello de la plusvalía deriva el rango del ahorro', async ({ page }) => {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const fuente = readFileSync(
    join(process.cwd(), 'app', 'simulador-gastos-compraventa-trastero', 'page.tsx'),
    'utf8',
  );
  // Ningún extremo tecleado a mano en el `nota` del sello…
  expect(fuente).not.toContain('(19 % a 30 %)');
  expect(fuente).toContain('formatNumber(TIPO_AHORRO_MIN, 0)');
  expect(fuente).toContain('formatNumber(TIPO_AHORRO_MAX, 0)');

  // …y en pantalla el sello sigue publicando el rango vigente, el mismo que la tarjeta del
  // IRPF, que ya lo derivaba (19 % a 30 % con los tramos de 2025).
  await page.goto(RUTA);
  await expect(
    page.getByText('El IRPF de la ganancia usa los tramos del ahorro de 2025 (19 % a 30 %)').first(),
  ).toBeVisible();
});

// ✅ REPARADO 09/09/2026 (641, bajo) — dato.
// El IVA del trastero VINCULADO se calculaba con la constante del garaje —`garageCon`, «IVA
// garaje incluido con la vivienda (hasta 2 plazas)», una regla del garaje con su propio
// límite de plazas— mientras el botón «Primera mano», la nota de cabecera, la tabla
// comparativa, la FAQ y el JSON-LD de `metadata.ts` anunciaban ese mismo tipo desde
// `obraNueva`. La propia tabla repartía las dos constantes al revés de como calculaba: fila
// «Trastero vinculado a vivienda» → `obraNueva`; fila «Garaje / Plaza de parking» →
// `garageCon`. Las dos valen 10 hoy, así que no había divergencia visible; existen separadas
// precisamente para poder divergir.
// Caso: Primera mano · Vinculado · Madrid · 12.000 € → la tarjeta cobra 1.200,00 € y se
//       describe «IVA 10% — anejo transmitido con la vivienda» leyendo una constante, mientras
//       el botón de al lado decía «Paga IVA 10%» leyendo la otra. Esperado: una sola
//       constante para el anejo residencial · obtenido: dos.
// REPARADO en dos mitades: en `data/fiscal/inmuebles.ts`, `garageCon` pasó a llamarse
// `anejoVinculado` y su comentario cubre ya el art. 91.Uno.1.7º LIVA entero (garajes de hasta
// dos plazas Y trasteros transmitidos con la vivienda); y aquí, el cálculo y TODOS los textos
// —botón, nota de cabecera, tabla, FAQ y JSON-LD— leen esa única constante.
test('REGRESIÓN 641 (dato) — el anejo residencial se calcula y se anuncia con la MISMA constante', async ({
  page,
}) => {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const carpeta = join(process.cwd(), 'app', 'simulador-gastos-compraventa-trastero');
  const fuente = readFileSync(join(carpeta, 'page.tsx'), 'utf8');
  const meta = readFileSync(join(carpeta, 'metadata.ts'), 'utf8');

  // El motor sigue liquidando el vinculado con `anejoVinculado`…
  const inicio = fuente.indexOf('porcentaje = modalidadTrastero');
  expect(inicio).toBeGreaterThan(-1);
  expect(fuente.slice(inicio, inicio + 160)).toContain('IVA_INMUEBLES_2025.anejoVinculado');

  // …y ni la página ni el JSON-LD pueden volver a anunciar el anejo desde `obraNueva`, que
  // es el IVA de la VIVIENDA y no el del anejo que esta app calcula.
  expect(fuente).not.toContain('IVA_INMUEBLES_2025.obraNueva');
  expect(meta).not.toContain('IVA_INMUEBLES_2025.obraNueva');
  expect(meta).toContain('IVA_INMUEBLES_2025.anejoVinculado');

  // Y en pantalla el botón y la tarjeta dicen lo mismo sobre el mismo caso:
  // Madrid (por defecto) · Primera mano · Vinculado · 12.000 € → 12.000 × 10 % = 1.200.
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await page.getByRole('button', { name: /Vinculado a vivienda/ }).click();
  await rellenar(page, 'Precio del trastero', '12000');
  expect(await valorTarjeta(page, 'IVA (10,00%)')).toBe('1200,00 €');
  await expect(page.getByRole('button', { name: /Primera mano/ })).toContainText('Paga IVA 10%');
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 10/09/2026 — CASOS 20-22.
// La cola reabrió la app tras el refactor de motores (3a507acb, 1808419c) y con una PISTA
// de efecto familia: en `simulador-gastos-compraventa-garaje` el campo «Años de propiedad»
// lleva `min={1}` y el motor lee `parseInt(aniosPropiedad) || 0`, de modo que la reventa
// antes del año es inalcanzable. La hermana `local-comercial` ya está reparada. Este bloque
// averigua de qué lado está el trastero (CASO 21) y estrena territorio y precio (CASO 20).
// ═════════════════════════════════════════════════════════════════════════════

test.describe('RE-INSPECCIÓN 10/09/2026 — Comunidad Valenciana, la reventa antes del año y un precio de compra malformado', () => {
  /**
   * CASO 20 (NORMAL) — Comunidad Valenciana, comunidad que ninguna ronda anterior había
   * elegido, y en la que además el tipo general se movió hace tres meses: `TIPOS_ITP_CCAA_2025`
   * la trae al 9 % «desde el 01/06/2026 (antes 10%)». Tiene escala progresiva declarada
   * (`tramosProgresivos` 9 % hasta 1.000.000 € y 11 % por encima), así que a 24.000 € el
   * tipo efectivo tiene que coincidir con el nominal del primer tramo y ni un céntimo más.
   */
  test('CASO 20 (normal) — Comunidad Valenciana, segunda mano, 24.000 €, comprador general', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('valencia');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '24000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP — `calcularITPProgresivo` sobre ITP_CCAA.valencia.tramosProgresivos:
    //   los 24.000 € caben enteros en el primer tramo (hasta 1.000.000 €, 9 %)
    //   24.000 × 9 % = 2.160,00 · tipo efectivo = 2.160 / 24.000 = 9,00 %
    // Ninguno de los siete reducidos de Valencia se aplica: seis son de colectivo (joven,
    // familia, discapacidad, VPO) y el séptimo —víctimas de violencia de género, 3 %— exige
    // «Vivienda habitual», y `elegirTipoITP` recibe `viviendaHabitual: false` porque un
    // trastero suelto nunca lo es. Por eso tampoco sale el aviso «Podrías pagar menos».
    expect(await valorTarjeta(page, 'ITP (9,00%)')).toBe('2160,00 €');
    expect(await descripcionTarjeta(page, 'ITP (9,00%)')).toContain('Comunidad Valenciana');
    await expect(page.getByText(/Podrías pagar menos/)).toHaveCount(0);
    // La escala SÍ se anuncia, aunque a este precio no se separe del tipo plano.
    await expect(page.getByText(/aplica escala progresiva/)).toBeVisible();

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO):
    //   tramo 1 (hasta 6.010,12 €)             →                              90,15
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)   →  17.989,88 × 0,0045 =        80,95446
    //   arancel sin IVA                        =                             171,10446
    //   con el 21 % de IVA                     = 171,10446 × 1,21 =          207,0363966
    // FACTURA_NOTARIAL: ×1,5 = 310,5545949 · ×2 = 414,0727932 · medio ×1,75 = 362,31369405
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('362,31 €');
    const notaria20 = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria20).toContain('310,55 €');
    expect(notaria20).toContain('414,07 €');

    // Registro — RD 1427/1989, números 1, 2 y 4 (ARANCELES_REGISTRO + REGISTRO_CONCEPTOS):
    //   tramo 1 (hasta 6.010,12 €)             →                              24,04
    //   tramo 2 (6.010,12→30.050,61, 0,175 %)  →  17.989,88 × 0,00175 =       31,48229
    //   inscripción (número 2)                 =                              55,52229
    //   + asiento de presentación (número 1)   →                               6,010121
    //   + nota simple (número 4)               →                               3,005061
    //                                          =                              64,537472
    //   con el 21 % de IVA                     = 64,537472 × 1,21 =           78,09014112
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('78,09 €');

    // En segunda mano no hay AJD: ITP y AJD-cuota gradual son incompatibles.
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

    // Total gastos — `sumarLineasVisibles` redondea cada línea al céntimo ANTES de sumar,
    // que es como las ve el usuario: 2.160,00 + 362,31 + 78,09 + 300,00 = 2.900,40
    //   % sobre el precio = 2.900,40 / 24.000 = 12,085 %, que el redondeo binario del doble
    //   deja justo por debajo de la mitad y `formatNumber(x, 2)` imprime como 12,08 %.
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2900,40 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('12,08%');

    // Coste total = 24.000 + 2.900,40 = 26.900,40
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('26.900,40 €');
  });

  /**
   * CASO 22 (DEBE RECHAZARSE) — un precio de compra original malformado.
   *
   * `NumberInput` filtra las letras con su regex `/^-?[\d.,]*$/`, así que lo que de verdad
   * puede llegar al motor es un número con dos separadores mal puestos. `parseSpanishNumber`
   * devuelve NaN para «1.2.3» (está en su propia documentación) y ese NaN NO puede leerse
   * como un 0: si lo fuera, el valor de adquisición sería 0, el precio de venta entero se
   * convertiría en ganancia y la app publicaría una cuota de IRPF de 3.546,60 € que no debe
   * nadie (6.000 × 19 % + 11.460 × 21 % sobre una ganancia inventada de 17.460 €). Tampoco
   * puede leerse como el 1,2 que devolvería `parseFloat`.
   *
   * Es la contrapartida del CASO 7, que probaba lo mismo en el precio del comprador.
   */
  test('CASO 22 (debe rechazarse) — «1.2.3» no es un precio de compra: ni 0 € ni 1,2 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '18000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '1.2.3');
    await rellenar(page, 'Años de propiedad', '6');
    await rellenar(page, 'Valor catastral del suelo', '5000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '12000');

    // El campo conserva lo escrito (el `handleBlur` de NumberInput solo acota min/max).
    await expect(page.locator('input[aria-label="Precio de compra original"]')).toHaveValue('1.2.3');

    // Sin precio de compra no hay incremento de valor que comparar, así que la plusvalía
    // tampoco se calcula — y el aviso nombra ESE campo, no los otros dos, que están puestos.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    const metodo22 = await descripcionTarjeta(page, 'Plusvalía municipal');
    expect(metodo22).toContain('falta el precio de compra original');
    expect(metodo22).not.toContain('valor catastral del suelo');
    expect(metodo22).not.toContain('años de propiedad');

    // El IRPF se declara sin calcular, y NO como «SIN CUOTA» en verde (hallazgo 483): un 0
    // ahí se leería como una exención. Las tarjetas de ganancia/pérdida y de valor de
    // adquisición no se pintan: no hay base sobre la que calcularlas.
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
    await expect(page.locator('h3', { hasText: 'Valor de adquisición' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Pérdida patrimonial' })).toHaveCount(0);

    // Lo único que sí se puede calcular es la comisión: 18.000 × 3 % (por defecto) = 540,00
    //   total gastos = 0 de plusvalía + 540 + 0 de gestoría + 0 de IRPF = 540,00
    //   neto = 18.000 − 540 = 17.460,00 — y se anuncia como TECHO, con los dos conceptos
    //   que faltan y el ÚNICO campo que hay que rellenar (hallazgo 639: no se pide dos veces).
    expect(await valorTarjeta(page, 'Comisión inmobiliaria (3%)')).toBe('540,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('540,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('17.460,00 €');
    const neto22 = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(neto22).toContain('Techo');
    expect(neto22).toContain('la plusvalía municipal ni el IRPF de la ganancia');
    expect(neto22).toContain('añade el precio de compra original');

    // Y en ninguna parte de la página puede haber NaN. Se busca sobre el texto completo y
    // con mayúsculas: `getByText('NaN')` no distingue mayúsculas y casaría con «ganancia».
    expect(await page.locator('body').innerText()).not.toContain('NaN');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// HALLAZGO 682 de la re-inspección del 10/09/2026 — REPARADO ese mismo día (bc437470).
// Estaba marcado con `test.fail()`, afirmando lo que DEBERÍA pasar; al repararlo se le
// quitó la marca y hoy sujeta la reparación.
// ═════════════════════════════════════════════════════════════════════════════

// ❌ ABIERTO 10/09/2026 (alto) — cálculo. La reventa antes del año es INALCANZABLE, y la
// app liquida de menos sin decirlo.
//
// `COEFICIENTES_IIVTNU_2025` (data/fiscal/inmuebles.ts) tiene fila propia para la tenencia
// de menos de un año —`{ anios: 0, label: 'Menos de 1 año', coeficiente: 0.14 }`, el TERCERO
// más alto de toda la tabla, por encima del 0,13 de un año— porque desde el RDL 26/2021 esa
// transmisión SÍ tributa. El motor ya sabe atenderla: `calcularPlusvaliaMunicipal` acota con
// `Math.min(Math.max(aniosPropiedad, 0), 20)` desde la reparación del 07/09/2026 (hallazgo
// 666), y su comentario dice literalmente «las apps que usan el 0 como campo vacío filtran
// antes de llamar».
//
// Esta app es una de esas, y no ha filtrado: sigue leyendo `parseInt(aniosPropiedad) || 0`
// (page.tsx:318), que confunde el 0 explícito con el campo vacío, y su `NumberInput` declara
// `min={1}` (page.tsx:831), que al salir del campo REESCRIBE el 0 a 1 sin avisar. Las dos
// mitades se tapan la una a la otra: mientras el foco está puesto, el 0 desactiva la
// plusvalía («SIN CALCULAR»); al salir, el campo ya no dice 0 sino 1 y la app liquida con el
// coeficiente equivocado presentándolo como firme («Lo que realmente recibes tras los
// gastos»). El usuario no tiene forma de introducir el dato que la ley contempla.
//
// La hermana `simulador-gastos-compraventa-local-comercial` ya está reparada con este mismo
// patrón (`min={0}`, los años leídos del STRING y el campo vacío distinguido del 0);
// `simulador-gastos-compraventa-garaje` arrastra el defecto igual que esta.
//
// Y el error va A LA BAJA, que es el sentido irrecuperable en una herramienta fiscal: el
// contribuyente presupuesta menos de lo que la oficina liquidadora le va a pedir.
//
// Caso: Precio 15.000 € · Vendedor · compra 12.000 € · años 0 · suelo 4.000 · total 9.000
//       (comisión 3 % por defecto)
//       → esperado plusvalía 140,00 € (4.000 × 0,14 × 25 %) y neto 13.952,10 €
//       → obtenido plusvalía 130,00 € (4.000 × 0,13 × 25 %) y neto 13.960,20 €
// REPARADO el 10/09/2026 (hallazgo 682): los años se leen del STRING —el «0» explícito ya no
// se confunde con el campo vacío— y el NumberInput baja a `min={0}`, así que el blur deja de
// reescribir el 0 a «1».
test(
  'REGRESIÓN 682 (cálculo) — la reventa antes del año liquida con su coeficiente (0,14)',
  async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '12000');
    await rellenar(page, 'Valor catastral del suelo', '4000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '9000');

    // Cero años de tenencia: el trastero se revende antes de cumplir el año. Se sale del
    // campo a propósito, porque es el estado en el que el usuario deja el formulario.
    const anios = page.locator('input[aria-label="Años de propiedad"]');
    await anios.fill('0');
    await anios.blur();

    // ⚠️ La aserción de FONDO va primero a propósito: dentro de un `test.fail()` basta con
    // que el test falle en algún punto, así que lo que se ejecuta de verdad es la primera
    // que falla. Si la primera fuera la del valor del campo, la cifra fiscal —que es el
    // hallazgo— nunca llegaría a comprobarse (es el aviso que dejó el CASO 8 el 28/08).
    // Las tres de abajo están resueltas a mano y verificadas en navegador por separado.
    //
    // Plusvalía — calcularPlusvaliaMunicipal con COEFICIENTES_IIVTNU_2025:
    //   objetivo (art. 107.4 TRLHL): 4.000 × 0,14 («Menos de 1 año») = 560 → × 25 % = 140,00
    //     (el 25 % es PLUSVALIA_MUNICIPAL_META.tipoOrientativo, no el 30 % máximo legal)
    //   real (art. 107.5): (15.000 − 12.000) × (4.000/9.000) × 25 % = 3.000 × 0,4444… × 0,25
    //     = 333,33… → el contribuyente elige el más favorable: 140,00 €
    //   Lo que la app publica hoy son 130,00 € — el coeficiente 0,13 de UN año.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('140,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

    // Y el error se propaga al art. 35 LIRPF, porque la plusvalía resta del valor de
    // transmisión: 10 € menos de plusvalía son 10 € más de ganancia.
    //   comisión = 15.000 × 3 % = 450 · valor de adquisición = 12.000
    //   valor de transmisión = 15.000 − 450 − 140 = 14.410 · ganancia = 2.410
    //   IRPF = 2.410 × 19 % (primer tramo del ahorro) = 457,90
    //   total gastos = 140 + 450 + 0 + 457,90 = 1.047,90 · neto = 15.000 − 1.047,90
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('14.410,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('2410,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('457,90 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1047,90 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.952,10 €');

    // Segunda cara del defecto, y la que lo hace invisible: el `min={1}` reescribe a «1» el
    // dato que el usuario ha escrito, sin decir nada. Al reparar, este campo debe conservar
    // el 0 (es lo que `local-comercial` ya hace con `min={0}`).
    await expect(anios).toHaveValue('0');
  },
);

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 11/09/2026 — CASOS 23-25.
// La cola reabrió la app tras DOS commits que tocan lo que calcula:
//   · bc437470 — «la reventa antes del año ya se puede liquidar, y con su coeficiente»
//     (hallazgo 682 de esta app; el test de más arriba ya sujeta la reparación).
//   · 7a02470c — «Aragón no tiene tipos reducidos de ITP, tiene bonificaciones en cuota»,
//     que reescribió la escala del art. 121-1 de DOS tramos a CINCO (8 / 8,5 / 9 / 9,5 /
//     10 %) y los tipos efectivos de las bonificaciones en cuota.
// Territorio y perfil nuevos otra vez (Castilla y León con perfil joven, que es donde vive
// el tipo del 0,01 % —el análogo del 0 % de Madrid que dio origen a `elegirTipoITP`—), el
// TERCER escalón de la escala aragonesa recién corregida, al que ningún caso llegaba, y
// unos años de propiedad MALFORMADOS, que es el camino que la reparación del 10/09 estrenó.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('RE-INSPECCIÓN 11/09/2026 — Castilla y León, el tercer escalón de Aragón y unos años malformados', () => {
  /**
   * CASO 23 (NORMAL) — Castilla y León con perfil JOVEN, la combinación que ninguna ronda
   * había ejercitado y que aquí importa por un motivo concreto: `ITP_CCAA['castilla-leon']`
   * declara un reducido del **0,01 %** («Municipios poco poblados (< 36 años)»), que es el
   * tipo más bajo de toda la tabla después del 0 % de Madrid. Es exactamente la forma del
   * defecto que hizo nacer `elegirTipoITP` el 14/08/2026: aplicar el primer reducido que
   * casa por nombre sin mirar sus condiciones dejaba el ITP en 0 en la comunidad que viene
   * por defecto. Aquí se comprueba que ese 0,01 % NO se aplica —ni el 4 % de jóvenes, que
   * exige vivienda habitual y un trastero suelto nunca lo es— y que ambos salen como
   * OPORTUNIDAD, que es el contrato de la función («se enseña como oportunidad, nunca como
   * cifra»).
   */
  test('CASO 23 (normal) — Castilla y León, segunda mano, 20.000 €, comprador joven', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('castilla-leon');
    await selectPerfil(page).selectOption('joven');
    await rellenar(page, 'Precio del trastero', '20000');

    // ITP — `calcularITPProgresivo` sobre ITP_CCAA['castilla-leon'].tramosProgresivos
    // (8 % hasta 250.000 €, 10 % por encima): los 20.000 € caben enteros en el primero.
    //   20.000 × 8 % = 1.600,00 · tipo efectivo = 1.600 / 20.000 = 8,00 %
    // El tipo general (8 %) sale de `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
    // leído por `tipoGeneralDe('Castilla y León')`.
    expect(await valorTarjeta(page, 'ITP (8,00%)')).toBe('1600,00 €');
    expect(await descripcionTarjeta(page, 'ITP (8,00%)')).toContain('Castilla y León');
    expect(await texto(page.locator('p', { hasText: 'escala progresiva (' }).first())).toContain(
      '8% → 10%',
    );

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO):
    //   tramo 1 (hasta 6.010,12 €)            →                            90,15
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)  → 13.989,88 × 0,0045 =        62,95446
    //   arancel sin IVA                       =                           153,10446
    //   con el 21 % de IVA                    = 153,10446 × 1,21 =        185,2563966
    // FACTURA_NOTARIAL: ×1,5 = 277,8845949 · ×2 = 370,5127932 · medio ×1,75 = 324,19869405
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('324,20 €');
    const notaria23 = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria23).toContain('277,88 €');
    expect(notaria23).toContain('370,51 €');

    // Registro — RD 1427/1989, números 1, 2 y 4 (ARANCELES_REGISTRO + REGISTRO_CONCEPTOS):
    //   tramo 1 (hasta 6.010,12 €)            →                            24,04
    //   tramo 2 (6.010,12→30.050,61, 0,175 %) → 13.989,88 × 0,00175 =       24,48229
    //   inscripción (número 2)                =                            48,52229
    //   + asiento de presentación 6,010121 + nota simple 3,005061 =         57,537472
    //   con el 21 % de IVA                    = 57,537472 × 1,21 =         69,62034112
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('69,62 €');

    // Gestoría: la que trae el formulario por defecto.
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');

    // En segunda mano no hay AJD (ITP y cuota gradual de AJD son incompatibles).
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    // Total — `sumarLineasVisibles` redondea cada línea al céntimo ANTES de sumar:
    //   1.600,00 + 324,20 + 69,62 + 300,00 = 2.293,82
    //   % sobre el precio = 2.293,82 / 20.000 = 11,4691 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2293,82 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,47%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('22.293,82 €');

    // Y lo que de verdad vigila este caso: los dos reducidos salen como OPORTUNIDAD y
    // ninguno se ha cobrado. Con el 0,01 % aplicado, el ITP habrían sido 2,00 € en vez de
    // 1.600,00 €; con el 4 %, 800,00 €.
    const oportunidades = page.locator('div[class*="avisoReducidos"] li');
    await expect(oportunidades).toHaveCount(2);
    expect(await texto(oportunidades.nth(0))).toContain('4,00% — Jóvenes < 36 años');
    expect(await texto(oportunidades.nth(1))).toContain(
      '0,01% — Municipios poco poblados (< 36 años)',
    );
    // El de municipios poco poblados enseña además su tope de valor, que sí es comprobable.
    expect(await texto(oportunidades.nth(1))).toContain('Valor máximo 150.000,00 €');
  });

  /**
   * CASO 24 (LÍMITE) — el TERCER escalón de la escala de Aragón, que es el tramo al que
   * ningún caso de este fichero llegaba: el CASO 18 se queda en la raya de los 400.000 € y
   * 50.000 € más arriba.
   *
   * Importa porque esa escala se reescribió hace dos días (commit 7a02470c, triaje fiscal
   * del 11/09/2026): tenía DOS tramos —8 % hasta 400.000 € y 10 % por encima— y el art.
   * 121-1 tiene CINCO. Con la tabla vieja, 500.000 € liquidaban 42.000 €. El comentario de
   * `ITP_CCAA['aragon']` fija los cortes contra la tabla oficial de cuota acumulada, y
   * 500.000 € es uno de los cuatro que nombra: **40.750 €**.
   */
  test('CASO 24 (límite) — Aragón, 500.000 €: el tercer escalón del art. 121-1 (40.750 €)', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('aragon');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '500000');

    // El recuadro anuncia los CINCO tramos, con la coma decimal del formato español
    // (`formatTipoNominal`, reparado en este mismo commit para las 6 apps del clúster).
    expect(await texto(page.locator('p', { hasText: 'escala progresiva (' }).first())).toContain(
      '8% → 8,5% → 9% → 9,5% → 10%',
    );

    // ITP — calcularITPProgresivo sobre los cinco tramos:
    //   400.000 × 8 %  = 32.000
    //    50.000 × 8,5 % =  4.250   (400.000 → 450.000)
    //    50.000 × 9 %   =  4.500   (450.000 → 500.000)
    //                    = 40.750,00 — la cuota acumulada que la tabla del art. 121-1
    //                      fija a los 500.000 €, y que la escala de DOS tramos daba como
    //                      42.000 € hasta el 11/09/2026.
    //   tipo EFECTIVO = 40.750 / 500.000 = 8,15 % (el nominal, 8 %, mentiría)
    expect(await valorTarjeta(page, 'ITP (8,15%)')).toBe('40.750,00 €');
    expect(await descripcionTarjeta(page, 'ITP (8,15%)')).toContain('Aragón');

    // Notaría — ARANCELES_NOTARIO hasta el quinto tramo:
    //   90,15 + 24.040,49×0,0045 + 30.050,60×0,0015 + 90.151,82×0,001 + 349.746,97×0,0005
    //   = 90,15 + 108,182205 + 45,0759 + 90,15182 + 174,873485 = 508,43341
    //   con IVA = 615,2044261 · ×1,5 = 922,80663915 · ×2 = 1.230,4088522
    //   medio ×1,75 = 1.076,607745675
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1076,61 €');
    const notaria24 = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria24).toContain('922,81 €');
    expect(notaria24).toContain('1230,41 €');

    // Registro — ARANCELES_REGISTRO hasta el quinto tramo:
    //   24,04 + 24.040,49×0,00175 + 30.050,60×0,00125 + 90.151,82×0,00075 + 349.746,97×0,0003
    //   = 24,04 + 42,0708575 + 37,56325 + 67,613865 + 104,924091 = 276,2120635
    //   (por debajo del REGISTRO_MAXIMO de 2.181,67)
    //   + 6,010121 + 3,005061 = 285,2272455 · con IVA = 345,1249671
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('345,12 €');

    // Total = 40.750,00 + 1.076,61 + 345,12 + 300,00 = 42.471,73
    //   % sobre el precio = 42.471,73 / 500.000 = 8,494346 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('42.471,73 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,49%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('542.471,73 €');

    // Las cinco bonificaciones de Aragón exigen vivienda habitual (las tres del art. 121-4
    // y las dos de familia numerosa), y además topan el inmueble en 100.000 €: a este
    // precio no hay nada que ofrecer y la caja de oportunidades NO debe pintarse.
    await expect(page.locator('p', { hasText: 'Podrías pagar menos' })).toHaveCount(0);
  });

  /**
   * CASO 25 (DEBE RECHAZARSE) — unos años de propiedad MALFORMADOS.
   *
   * Es el camino que la reparación del 10/09/2026 (hallazgo 682) estrenó y que ningún caso
   * cubría: desde entonces los años se leen del STRING con `parseSpanishNumber` en vez de
   * con `parseInt(...) || 0`, y el `NumberInput` bajó a `min={0}` porque el **0 es ahora un
   * dato válido** —la reventa antes del año, coeficiente 0,14—. Justamente por eso un valor
   * ilegible no puede caer en 0: sería liquidar el tercer coeficiente más alto de
   * `COEFICIENTES_IIVTNU_2025` a partir de algo que el usuario no ha escrito. Tampoco puede
   * caer en el 1 que devolvería `parseFloat('1.2.3')`.
   *
   * `NumberInput` filtra las letras con su regex `/^-?[\d.,]*$/`, así que lo que de verdad
   * llega al motor es un número con dos separadores mal puestos; y su `handleBlur`, que sí
   * usa `parseFloat`, lee 1,2 —dentro de min/max— y deja el campo tal cual.
   */
  test('CASO 25 (debe rechazarse) — «1.2.3» no son años de propiedad: ni 0 ni 1', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '20000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '14000');
    await rellenar(page, 'Años de propiedad', '1.2.3');
    await rellenar(page, 'Valor catastral del suelo', '5000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '11000');

    // El campo conserva lo escrito: el blur solo acota min/max.
    await expect(page.locator('input[aria-label="Años de propiedad"]')).toHaveValue('1.2.3');

    // La plusvalía NO se calcula, y el aviso nombra ESE campo y solo ese: los otros dos
    // están puestos. El verbo concuerda en plural («faltan los años»), hallazgo 638.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    const metodo25 = await descripcionTarjeta(page, 'Plusvalía municipal');
    expect(metodo25).toBe('No calculada (faltan los años de propiedad)');

    // Y ni rastro de las dos lecturas equivocadas:
    //   · como 0 años → objetivo 5.000 × 0,14 × 25 % = 175,00 · real (20.000−14.000) ×
    //     (5.000/11.000) × 25 % = 681,8181… → recomendado 175,00 €
    //   · como 1 año  → 5.000 × 0,13 × 25 % = 162,50 €
    const cuerpo25 = (await page.locator('body').innerText()).replace(ESPACIO_DURO, ' ');
    expect(cuerpo25).not.toContain('175,00 €');
    expect(cuerpo25).not.toContain('162,50 €');

    // El resto del vendedor SÍ se calcula, y con la plusvalía en 0 el IRPF sale AL ALZA,
    // que es el sentido recuperable: art. 35 LIRPF con `calcularGananciaInmueble`.
    //   comisión = 20.000 × 3 % (por defecto) = 600,00 · gestoría del vendedor = 0
    //   valor de adquisición = 14.000 (sin gastos de adquisición declarados)
    //   valor de transmisión = 20.000 − 600 − 0 = 19.400,00
    //   ganancia = 19.400 − 14.000 = 5.400,00
    //   IRPF (TRAMOS_GANANCIAS_PATRIMONIALES_2025, primer tramo hasta 6.000 al 19 %):
    //        5.400 × 19 % = 1.026,00
    //   total gastos = 0 + 600,00 + 0 + 1.026,00 = 1.626,00 · neto = 20.000 − 1.626,00
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('14.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('19.400,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('5400,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1026,00 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria (3%)')).toBe('600,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1626,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('18.374,00 €');

    // El neto se presenta como TECHO, nombrando el concepto que falta y el campo que lo
    // desbloquea (hallazgos 483 y 639).
    const neto25 = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(neto25).toBe('Techo: aún NO incluye la plusvalía municipal (añade los años de propiedad)');

    // Y en ninguna parte de la página puede haber NaN. Mayúsculas incluidas: `getByText`
    // no distingue y casaría con «ganancia».
    expect(await page.locator('body').innerText()).not.toContain('NaN');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS — re-inspección del 11/09/2026.
// Marcados con `test.fail()`: afirman lo que DEBERÍA pasar, así que hoy fallan a propósito.
// Cuando se reparen, se les quita la marca y quedan como regresión.
//
// Los tres primeros son EFECTO FAMILIA del commit bc437470 (10/09/2026), que reparó los 13
// hallazgos del clúster inmobiliario: las correcciones 670 y 671 se aplicaron en
// `simulador-gastos-compraventa-garaje` y la 683 en `simulador-gastos-compraventa-nave-industrial`,
// y ninguna de las tres llegó a esta app, que tiene el mismo defecto en el mismo sitio.
// ═════════════════════════════════════════════════════════════════════════════

// ❌ ABIERTO 11/09/2026 (medio) — contenido. EFECTO FAMILIA del hallazgo 670.
// La FAQ visible y los DOS bloques FAQPage de `metadata.ts` afirman sin ninguna excepción
// territorial que un trastero nuevo paga IVA (10 % como anejo, 21 % independiente), mientras
// la calculadora responde «IGIC — No calculado» en Canarias y «IPSI» en Ceuta y Melilla.
// La nota de cabecera de la página SÍ lleva la excepción desde el hallazgo 527; la FAQ y el
// JSON-LD se quedaron fuera, y el JSON-LD es justo lo que leen los asistentes de IA.
// Caso: Canarias · Primera mano · 12.000 € → la tarjeta dice «IGIC / No calculado» y «En
//       Canarias no rige el IVA», y dos pantallas más abajo la pregunta «¿Qué IVA paga un
//       trastero nuevo?» responde «tributa al tipo general del 21%» sin matiz.
//       Esperado: la misma excepción que la hermana garaje añadió el 10/09 («En Canarias,
//       Ceuta y Melilla no rige el IVA sino el IGIC o el IPSI, con sus propios tipos»).
//       Obtenido: ni «IGIC» ni «IPSI» aparecen en la FAQ ni en ninguno de los dos FAQPage.
test('ABIERTO 11/09 (contenido) — la FAQ y el FAQPage afirman IVA sin la excepción de Canarias', async ({
  page,
}) => {
  test.fail();
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await selectCcaa(page).selectOption('canarias');
  await rellenar(page, 'Precio del trastero', '12000');

  // Lo que la calculadora responde de verdad (esto ya está bien y pasa):
  expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
  expect(await descripcionTarjeta(page, 'IGIC')).toContain('no rige el IVA');

  // …y lo que la FAQ visible contesta a la misma pregunta, en la misma página.
  const respuesta = page
    .locator('h4', { hasText: '¿Qué IVA paga un trastero nuevo?' })
    .locator('xpath=following-sibling::p[1]');
  expect(await texto(respuesta)).toMatch(/IGIC|IPSI/);

  // Y los dos FAQPage de metadata.ts, que es lo que citan los asistentes de IA.
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const meta = readFileSync(
    join(process.cwd(), 'app', 'simulador-gastos-compraventa-trastero', 'metadata.ts'),
    'utf8',
  );
  expect(meta).toContain('IGIC');
});

// ❌ ABIERTO 11/09/2026 (medio) — dato. EFECTO FAMILIA del hallazgo 671.
// El ÚNICO tipo de plusvalía municipal que la página publica es el 30 % máximo legal, que
// llega por `PLUSVALIA_MUNICIPAL_META.nota` dentro del segundo `DataReference`. El tipo que
// el motor APLICA es el 25 % orientativo (`PLUSVALIA_MUNICIPAL_META.tipoOrientativo`, que es
// el valor por defecto de `calcularPlusvaliaMunicipal`), y no aparece en ninguna parte: ni en
// la página, ni en la FAQ visible, ni en los dos FAQPage. El usuario no puede reconstruir la
// cifra que se le da, y quien la recalcule con el único tipo publicado obtendrá un 20 % más.
// La hermana garaje lo cerró el 10/09 añadiendo «Esta calculadora aplica un tipo del 25 %
// como referencia orientativa habitual; cada ayuntamiento fija el suyo, con un máximo legal
// del 30 %» a la FAQ visible y a los dos FAQPage.
// Caso: Vendedor · venta 20.000 € · compra 14.000 € · 5 años · suelo 5.000 · total 11.000
//       → la app publica 212,50 € de plusvalía (5.000 × 0,17 × 25 %; el método real daría
//         (20.000−14.000) × 5.000/11.000 × 25 % = 681,82 €, así que gana el objetivo)
//       → con el 30 % que la propia página anuncia serían 255,00 €
//       Esperado: que la página diga qué tipo aplica · obtenido: «25 %» no aparece en
//       ninguna parte del documento, y «30%» sí.
test('ABIERTO 11/09 (dato) — la página publica el 30 % máximo y aplica el 25 % orientativo', async ({
  page,
}) => {
  test.fail();
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '20000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '14000');
  await rellenar(page, 'Años de propiedad', '5');
  await rellenar(page, 'Valor catastral del suelo', '5000');
  await rellenar(page, 'Valor catastral total (suelo + construcción)', '11000');

  // La cifra que el motor da, resuelta a mano (esto ya está bien y pasa):
  //   objetivo: 5.000 × 0,17 (coeficiente de 5 años) = 850 × 25 % = 212,50
  //   real: (20.000 − 14.000) × (5.000/11.000) × 25 % = 681,8181…
  //   recomendado = el más favorable = 212,50 €
  expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('212,50 €');
  expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

  // Con el 30 % que la página anuncia, esa misma base daría 255,00 €. El tipo aplicado
  // tiene que estar escrito en alguna parte del documento.
  const cuerpo = (await page.locator('body').innerText()).replace(ESPACIO_DURO, ' ');
  expect(cuerpo).toMatch(/25\s?%/);
});

// ❌ ABIERTO 11/09/2026 (medio) — accesibilidad. EFECTO FAMILIA del hallazgo 683.
// El azul de MARCA `--primary` (#2E86AB) se sigue usando como color de TEXTO en esta app, en
// los mismos tres selectores que `simulador-gastos-compraventa-nave-industrial` pasó a
// `--primary-texto` el 10/09/2026. `app/globals.css` documenta el motivo en su propia
// cabecera: «como TEXTO sobre fondo claro no llegan al 4,5:1 que exige WCAG 2.1 AA —el azul
// da 4,11—», y para eso existe `--primary-texto` (#26718F, 5,47:1 sobre blanco), que en
// oscuro resuelve al mismo #3FA5D1 que ya se usa, de modo que allí no cambia nada.
// Caso (tema claro, medido en navegador sobre el fondo efectivo ya compuesto):
//   · .catastroLink («🔗 Consultar valor de referencia catastral…», 16 px / peso 500)
//       → esperado ≥ 4,5:1 · obtenido 4,11:1 (#2E86AB sobre #FFFFFF)
//   · .infoCcaaNombre («Comunidad de Madrid», 16 px / peso 600)
//       → esperado ≥ 4,5:1 · obtenido 3,74:1 (#2E86AB sobre #EEF5F8, la tarjeta con su
//         rgba(46,134,171,0.08) ya compuesto)
//   · .casoTag («Trastero con vivienda nueva», 12,8 px / peso 600)
//       → esperado ≥ 4,5:1 · obtenido 3,65:1
// Queda FUERA .infoCcaaValue (19,2 px / peso 700): ahí 3,74:1 sí cumple, porque la WCAG
// admite 3:1 para texto grande (≥18,66 px en negrita). No todo el azul de la página falla.
test('ABIERTO 11/09 (accesibilidad) — el azul de marca como texto no llega a 4,5:1 en claro', async ({
  page,
}) => {
  test.fail();
  await page.goto(RUTA);
  await page.waitForTimeout(300);

  const contraste = (selector: string) =>
    page.evaluate((sel) => {
      const canal = (c: number) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      const partes = (s: string) => (s.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]: number[]) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
      const mezcla = (fg: number[], bg: number[], a: number) => fg.map((c, i) => a * c + (1 - a) * bg[i]);

      const el = document.querySelector(sel);
      if (!el) return null;
      // Fondo EFECTIVO: compone todas las capas semitransparentes hasta la primera opaca.
      const capas: { rgb: number[]; a: number }[] = [];
      let n: Element | null = el;
      while (n) {
        const p = partes(getComputedStyle(n).backgroundColor);
        const a = p.length === 4 ? p[3] : 1;
        if (a > 0) capas.push({ rgb: p.slice(0, 3), a });
        if (a === 1) break;
        n = n.parentElement;
      }
      if (!capas.length || capas[capas.length - 1].a !== 1) capas.push({ rgb: [255, 255, 255], a: 1 });
      let fondo = capas[capas.length - 1].rgb;
      for (let i = capas.length - 2; i >= 0; i--) fondo = mezcla(capas[i].rgb, fondo, capas[i].a);

      const l1 = lum(partes(getComputedStyle(el).color).slice(0, 3));
      const l2 = lum(fondo);
      return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
    }, selector);

  // El enlace primero: un enlace es justo el texto que hay que poder leer.
  expect(await contraste('[class*="catastroLink"]')).toBeGreaterThanOrEqual(4.5);
  expect(await contraste('[class*="infoCcaaNombre"]')).toBeGreaterThanOrEqual(4.5);
  expect(await contraste('[class*="casoTag"]')).toBeGreaterThanOrEqual(4.5);
});

// ❌ ABIERTO 11/09/2026 (bajo) — dato. Las dos tablas de ITP del repositorio no dicen lo
// mismo sobre el reducido de Castilla y León, y la app publica la versión sin tope.
// `TIPOS_ITP_CCAA_2025` (data/fiscal/inmuebles.ts), que es de donde esta app saca el tipo
// GENERAL de la comunidad, dice: «Reducido 4% (≤150.000 €) o 6% (resto) para jóvenes <36,
// familia numerosa/monoparental, discapacidad ≥65%, VPO o zonas rurales». La entrada
// equivalente de `ITP_CCAA['castilla-leon']` (data/itp-ccaa.ts) declara el 4 % SIN
// `valorMaximo` y sin el escalón del 6 %, así que la caja «Podrías pagar menos» ofrece el
// 4 % a cualquier precio. El cotejo del triaje del 11/09 comparaba los VALORES de las dos
// tablas —y ahí ambas dicen 4— pero no el tope, que vive en el texto de `notaReducido`.
// No cambia ninguna cifra cobrada: el reducido nunca se aplica en esta app (exige vivienda
// habitual y un trastero suelto no lo es), solo se enseña como oportunidad. De ahí el «bajo».
// Caso: Castilla y León · segunda mano · perfil joven · 200.000 €
//       → esperado: la oportunidad del 4 % con su tope («Valor ≤ 150.000 €» / «Valor máximo
//         150.000,00 €»), como ya hace la del 0,01 % dos líneas más abajo
//       → obtenido: «4,00% — Jóvenes < 36 años · Requisitos: Menor de 36 años · Vivienda
//         habitual», sin tope, a 200.000 € (a ese precio la propia data/fiscal dice 6 %).
test('ABIERTO 11/09 (dato) — el reducido de Castilla y León se ofrece sin el tope de 150.000 €', async ({
  page,
}) => {
  test.fail();
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('castilla-leon');
  await selectPerfil(page).selectOption('joven');
  await rellenar(page, 'Precio del trastero', '200000');

  // A 200.000 € el de municipios poco poblados ya ha desaparecido de la caja por su
  // `valorMaximo` de 150.000 €: queda una sola oportunidad, la del 4 % (esto pasa).
  const oportunidades = page.locator('div[class*="avisoReducidos"] li');
  await expect(oportunidades).toHaveCount(1);
  expect(await texto(oportunidades.first())).toContain('4,00% — Jóvenes < 36 años');

  // Y esa, a 200.000 €, o no debería ofrecerse o debería llevar su tope escrito.
  expect(await texto(oportunidades.first())).toContain('150.000');
});
