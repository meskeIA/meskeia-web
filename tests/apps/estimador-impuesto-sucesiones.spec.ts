/**
 * Estimador del Impuesto de Sucesiones — rama de Cataluña
 *
 * Esta app NO llama a `calcularSucesion`: tiene su propia aritmética, porque además del ISD
 * modela el porcentaje de herencia, el usufructo y la nuda propiedad. Eso significa que los
 * tests del motor (`tests/sucesiones-cataluna-motor.spec.ts`) no la cubren, y que cada regla
 * que vive en los dos sitios puede divergir — ya pasó tres veces (hallazgos 277, 461 y 500).
 *
 * Hasta el 08/09/2026 la app no tenía ningún test, así que las dos correcciones que se le
 * aplicaron ese día no tenían red debajo:
 *   · la reducción de parentesco del HIJO catalán (100.000 €, no los 50.000 € del nieto);
 *   · el tope del incremento del Grupo I, que aquí se sumaba MAL —`reduccionParentesco + MAX`
 *     en vez de topar el total—, así que un recién nacido en régimen común llegaba a
 *     63.815,46 € cuando el art. 20.2.a LISD corta en 47.858,59 €.
 *
 * ⚠️ La app añade ajuar doméstico (3 %) a la masa, cosa que el motor solo hace si se le pide:
 * por eso las bases de aquí no coinciden con las del test del motor aunque el caso sea el mismo.
 */

import { test, expect, type Page } from '@playwright/test';

const RUTA = '/estimador-impuesto-sucesiones/';

/** Los 10 campos de importe (7 bienes + 3 deudas), en el orden en que se pintan. */
const CAMPO = { saldos: 0, acciones: 1, viviendaHabitual: 2, otrosInmuebles: 3 } as const;

/** Los tres desplegables de la columna de datos, en orden. */
const SELECT = { ccaa: 0, parentesco: 1, patrimonio: 2 } as const;

async function importe(page: Page, campo: number, valor: string) {
  await page.locator('input[inputmode="decimal"]').nth(campo).fill(valor);
}

/** El importe destacado del panel: «Impuesto estimado en …». */
async function cuota(page: Page): Promise<string> {
  const texto = await page
    .getByText(/^Impuesto estimado en/)
    .locator('xpath=following-sibling::span[1]')
    .innerText();
  return texto.replace(/ /g, ' ');
}

/** Todo el texto de la página, con los espacios duros normalizados. */
/**
 * Todo el texto del documento, INCLUIDO el que <EducationalSection> mantiene plegado: lo
 * oculta por CSS sin desmontarlo, así que está en el DOM pero fuera del innerText.
 */
async function textoCompleto(page: Page): Promise<string> {
  // Se clona el body y se le quitan <script> y <style>: el textContent del documento incluye
  // el payload de React, y ahi dentro aparece cualquier cadena que uno busque.
  const t = await page.evaluate(() => {
    const clon = document.body.cloneNode(true) as HTMLElement;
    clon.querySelectorAll('script, style').forEach((n) => n.remove());
    return clon.textContent ?? '';
  });
  return t.split(' ').join(' ').replace(/\s+/g, ' ');
}

async function textoPagina(page: Page): Promise<string> {
  return (await page.locator('body').innerText()).replace(/ /g, ' ');
}

test.describe('Estimador ISD — Cataluña (Ley 19/2010)', () => {
  /**
   * EL CASO QUE ORIGINÓ LA REPARACIÓN. Un hijo de 45 años hereda 250.000 €, de los que
   * 180.000 € son la vivienda habitual del padre. La app respondía 23.000 € y la Agència
   * Tributària de Catalunya, 0 €.
   *
   *   Activos          250.000,00  (180.000 de vivienda + 70.000 en cuentas)
   *   + ajuar 3 %        7.500,00
   *   = base imponible 257.500,00
   *   − parentesco     100.000,00  (hijo, art. 2 Ley 19/2010)
   *   − vivienda       171.000,00  (95 % de 180.000, tope catalán 500.000)
   *   = base liquidable      0,00  → cuota 0,00 €
   */
  test('el hijo que hereda la vivienda habitual no paga: 0,00 €, no 23.000,00 €', async ({ page }) => {
    await page.goto(RUTA);

    await page.locator('select').nth(SELECT.ccaa).selectOption('cataluna');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II');
    await importe(page, CAMPO.viviendaHabitual, '180000');
    await importe(page, CAMPO.saldos, '70000');

    expect(await cuota(page)).toBe('0,00 €');

    // Y el desglose enseña las DOS reducciones, no una sola con un aviso al lado
    const panel = await textoPagina(page);
    expect(panel).toContain('100.000,00 €');  // parentesco del hijo
    expect(panel).toContain('171.000,00 €');  // 95 % de la vivienda
  });

  /**
   * El mismo caso con un NIETO, que sí reduce 50.000 €. Existe para que el test anterior no
   * pueda pasar por un cero que también daría una reducción desbocada.
   *
   *   257.500 − 50.000 − 171.000 = 36.500 de base liquidable
   *   Primer tramo de la tarifa catalana: 7 % de 36.500 = 2.555,00 € de cuota íntegra
   *   Bonificación del art. 58 bis sobre la base IMPONIBLE de 257.500 €:
   *     (100.000 × 60 % + 100.000 × 55 % + 57.500 × 50 %) / 257.500 = 55,8252…  %
   *     2.555 × (1 − 0,558252…) = 1.128,67 €
   */
  test('el nieto reduce 50.000 € y con los mismos datos sí paga 1128,67 €', async ({ page }) => {
    await page.goto(RUTA);

    await page.locator('select').nth(SELECT.ccaa).selectOption('cataluna');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II-descendiente');
    await importe(page, CAMPO.viviendaHabitual, '180000');
    await importe(page, CAMPO.saldos, '70000');

    expect(await cuota(page)).toBe('1128,67 €');
  });

  test('el ascendiente catalán reduce 30.000 €, no 50.000 €', async ({ page }) => {
    await page.goto(RUTA);

    await page.locator('select').nth(SELECT.ccaa).selectOption('cataluna');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II-ascendiente');
    await importe(page, CAMPO.saldos, '250000');

    // 257.500 − 30.000 = 227.500 → 14.500 + 17 % de 77.500 = 27.675,00 € de cuota íntegra.
    // El ascendiente es Grupo II a efectos del art. 58 bis: 55,8252… % sobre los 257.500 €
    // de base imponible → 27.675 × (1 − 0,558252…) = 12.225,36 €
    expect(await cuota(page)).toBe('12.225,36 €');
  });
});

test.describe('Estimador ISD — el tope del Grupo I es del TOTAL', () => {
  /**
   * Régimen común, recién nacido en Madrid con 250.000 € en cuentas (base 257.500 con ajuar).
   * La reducción es 15.956,87 + 3.990,72 × 21 = 99.762,00, que el art. 20.2.a LISD topa en
   * 47.858,59 €. La app sumaba `reduccionParentesco + MAX` y llegaba a 63.815,46 €.
   *
   *   Bien:  257.500 − 47.858,59 = 209.641,41 de base liquidable
   *          23.063,25 + (209.641,41 − 159.634,83) × 21,25 % = 33.689,64825
   *          × 1,0000 − 99 % (Madrid) = 336,8964825                    → «336,90 €»
   *   Mal:   257.500 − 63.815,46 = 193.684,54 → … → «302,99 €»
   */
  test('en régimen común corta en 47.858,59 €, no en 63.815,46 €', async ({ page }) => {
    await page.goto(RUTA);

    await page.locator('select').nth(SELECT.ccaa).selectOption('madrid');
    await page.locator('select').nth(SELECT.parentesco).selectOption('I-descendiente');
    await page.locator('input[type="number"]').first().fill('0');
    await importe(page, CAMPO.saldos, '250000');

    expect(await cuota(page)).toBe('336,90 €');
  });

  /**
   * Cataluña, mismo heredero con 400.000 € (base 412.000 con ajuar): sus cuantías son otras
   * —12.000 €/año, tope 196.000 €— y hasta esta reparación se le aplicaban las estatales
   * estando en Cataluña, que le habrían dado 47.858,59 € de reducción en vez de 196.000 €.
   *
   *   412.000 − 196.000 = 216.000 → 14.500 + (216.000 − 150.000) × 17 % = 25.720,00 €
   *
   * Y encima la escala del GRUPO I del art. 58 bis, que no es la del Grupo II: sobre los
   * 412.000 € de base imponible sale 95,0971… %, así que 25.720 × 0,0490291… = 1.261,03 €.
   * Con la escala del Grupo II habrían sido 12.474,20 €: diez veces más.
   */
  test('en Cataluña corta en 196.000 €, con sus 12.000 € por año', async ({ page }) => {
    await page.goto(RUTA);

    await page.locator('select').nth(SELECT.ccaa).selectOption('cataluna');
    await page.locator('select').nth(SELECT.parentesco).selectOption('I-descendiente');
    await page.locator('input[type="number"]').first().fill('0');
    await importe(page, CAMPO.saldos, '400000');

    expect(await cuota(page)).toBe('1261,03 €');
  });
});

test.describe('Estimador ISD — que la corrección no se lleve por delante el régimen común', () => {
  test('el nieto conserva la bonificación del 99 % de Madrid', async ({ page }) => {
    await page.goto(RUTA);

    await page.locator('select').nth(SELECT.ccaa).selectOption('madrid');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II-descendiente');
    await importe(page, CAMPO.saldos, '250000');

    // Si 'II-descendiente' no se colapsara sobre 'II' al buscar la bonificación, aquí
    // aparecería la cuota íntegra entera en vez del 1 % que deja el 99 % de Madrid.
    await expect(page.getByText(/Bonificación autonómica: 99,0%/)).toBeVisible();
  });

  test('Cataluña ya no se presenta como territorio foral', async ({ page }) => {
    await page.goto(RUTA);
    // Los forales son País Vasco y Navarra; Cataluña es régimen común con ley propia.
    await expect(page.locator('optgroup[label="Normativa propia"]')).toBeAttached();
    await expect(page.locator('optgroup[label="Régimen Foral"]')).toHaveCount(0);
  });
});

/**
 * ─── Primera inspección completa de la app (11/09/2026) ───────────────────────
 *
 * Los tres casos de abajo son los de la inspección: uno normal, uno en el límite y uno que
 * la app debe rechazar. Todos los importes salen de `data/fiscal/sucesiones.ts` y están
 * resueltos a mano antes de ejecutarlos, con el tramo y la constante citados en cada paso.
 *
 * ✅ TARIFA UNIFICADA el 11/09/2026 (hallazgo 735, crítico). `TARIFA_ESTATAL_IS` tenía SIETE
 * tramos y se quedaba en el 25,50 %, cuando la escala del art. 21 LISD tiene DIECISÉIS y llega
 * al 34 %. Estaba transcrita bien en `data/fiscal/donaciones.ts` —a un directorio de
 * distancia— y el propio `faqJsonLd` de esta app ya la describía así («7,65 %… 34 % para
 * importes superiores a 797.555 €»), de modo que la app le contaba a las IAs una escala que
 * no liquidaba. Hoy las dos ramas son el MISMO array y lo vigila
 * `tests/tarifa-isd-motor.spec.ts`, que la compara fila a fila con el BOE.
 *
 * Los valores de los dos primeros casos cambiaron al repararlo, y son exactamente los que el
 * acta había anticipado: 154,74 € y 3.306,56 €. Los de abajo ya están recalculados.
 */
test.describe('Estimador ISD — inspección: caso normal, caso límite y caso a rechazar', () => {
  /**
   * CASO NORMAL — Madrid, hijo de 21 años o más (Grupo II), que hereda la vivienda habitual.
   *
   *   Activos            250.000,00   (50.000 en cuentas + 200.000 de vivienda habitual)
   *   + ajuar 3 %          7.500,00   PORC_AJUAR_DOMESTICO_IS
   *   = base imponible   257.500,00
   *   − parentesco        15.956,87   REDUCCIONES_PARENTESCO_IS['II']
   *   − vivienda 95 %    122.606,47   min(200.000 × 0,95 ; REDUCCION_VIVIENDA_MAX_IS)
   *   = base liquidable  118.936,66
   *   cuota íntegra       15.473,63   TARIFA_ESTATAL_IS, tramo «hasta 119.757,67»:
   *                                   9.166,06 + 16,15 % × (118.936,66 − 79.880,52)
   *   × coeficiente          1,0000   COEFICIENTES_IS['II'][0] (patrimonio < 402.678 €)
   *   − bonificación 99 % 15.318,89   BONIFICACIONES_CCAA_IS['madrid'].bonificaciones['II']
   *   = cuota final          154,74 €
   */
  test('caso normal: hijo ≥21 en Madrid con vivienda habitual paga 154,74 €', async ({ page }) => {
    await page.goto(RUTA);

    await page.locator('select').nth(SELECT.ccaa).selectOption('madrid');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II');
    await importe(page, CAMPO.saldos, '50000');
    await importe(page, CAMPO.viviendaHabitual, '200000');

    expect(await cuota(page)).toBe('154,74 €');

    const panel = await textoPagina(page);
    expect(panel).toContain('257.500,00 €');   // base imponible con ajuar
    expect(panel).toContain('122.606,47 €');   // tope estatal de la reducción por vivienda
    expect(panel).toContain('118.936,66 €');   // base liquidable
    expect(panel).toContain('15.473,63 €');    // cuota íntegra
  });

  /**
   * CASO LÍMITE — sobrino (Grupo III) en Asturias, la única comunidad cuyo beneficio se
   * aplica como reducción EN BASE, y con el coeficiente multiplicador que sí incrementa.
   * Se comprueban los dos extremos de la columna de patrimonio preexistente.
   *
   *   Activos             80.000,00   (cuentas)
   *   + ajuar 3 %          2.400,00
   *   = base imponible    82.400,00
   *   − parentesco         7.993,46   REDUCCIONES_PARENTESCO_IS['III']
   *   − Asturias base     50.000,00   BONIFICACIONES_CCAA_IS['asturias']…['III'].reduccionBase
   *   = base liquidable   24.406,54
   *   cuota íntegra        2.081,95   TARIFA_ESTATAL_IS, tramo «hasta 31.955,81»:
   *                                   2.037,26 + 10,20 % × (24.406,54 − 23.968,36)
   *   × 1,5882 → 3.306,56 €   COEFICIENTES_IS['III'][0], patrimonio < 402.678 €
   *   × 1,9059 → 3.968,00 €   COEFICIENTES_IS['III'][3], patrimonio > 4.020.770 €
   *
   *   Sin bonificación en cuota: en Asturias el beneficio ya se gastó en la base.
   *
   * ⚠️ La tarjeta «Sobrino hereda cuenta bancaria» del bloque educativo describe ESTE mismo
   * caso y anuncia «~17.200 € (21,5 %)» porque se salta los 50.000 € de reducción. Es el
   * hallazgo de contenido del acta: la app se contradice a sí misma por 5,4 veces.
   */
  test('caso límite: Grupo III en Asturias, 3.306,56 € y 3.968,00 € según patrimonio', async ({ page }) => {
    await page.goto(RUTA);

    await page.locator('select').nth(SELECT.ccaa).selectOption('asturias');
    await page.locator('select').nth(SELECT.parentesco).selectOption('III');
    await importe(page, CAMPO.saldos, '80000');

    expect(await cuota(page)).toBe('3306,56 €');

    const panel = await textoPagina(page);
    expect(panel).toContain('50.000,00 €');   // la reducción en base de Asturias, que existe
    expect(panel).toContain('24.406,54 €');   // base liquidable
    expect(panel).toContain('2081,95 €');     // cuota íntegra antes del coeficiente

    // El coeficiente multiplicador del Grupo III sí crece con el patrimonio preexistente
    await page.locator('select').nth(SELECT.patrimonio).selectOption('4');
    expect(await cuota(page)).toBe('3968,00 €');
  });

  /**
   * CASO A RECHAZAR — «1.2.3» no es un número.
   *
   * `parseSpanishNumber` devuelve NaN desde el 24/08/2026 (antes `parseFloat` lo leía como
   * 1,2), el total de activos se queda en cero y la app no ofrece ninguna estimación: enseña
   * el texto de espera en vez de una cifra inventada.
   *
   * ⚠️ Lo que este test NO puede afirmar, y va en el acta: si el campo inválido convive con
   * otro válido —«1.2.3» en cuentas y 200.000 € en vivienda— la app lo cuenta como 0,00 € y
   * liquida 59,66 € sin avisar de que ha descartado un importe.
   */
  test('caso a rechazar: «1.2.3» no produce estimación', async ({ page }) => {
    await page.goto(RUTA);

    await page.locator('select').nth(SELECT.ccaa).selectOption('madrid');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II');
    await importe(page, CAMPO.saldos, '1.2.3');

    // Desde el 11/09/2026 el aviso NOMBRA el campo en vez de caer en el placeholder genérico
    await expect(page.getByRole('alert').filter({ hasText: /no se puede/ })).toContainText('Saldos en cuentas bancarias');
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// REPARACIÓN 11/09/2026 — los ocho hallazgos de la inspección de esta app que no
// eran la tarifa. Cada test reproduce el caso del acta y comprueba lo reparado.
// ════════════════════════════════════════════════════════════════════════════

test.describe('Reparación 11/09/2026 — formulario, contenido y señal estructurada', () => {
  /**
   * HALLAZGO 736 (alto) — el campo principal pedía «Comunidad autónoma de residencia del
   * HEREDERO», cuando el ISD se liquida donde el CAUSANTE tuvo su residencia habitual los 5
   * años anteriores (art. 32.2.c de la Ley 22/2009). La propia página lo decía bien tres veces
   * más abajo, así que quien hacía caso a la etiqueta cometía el error del que la app avisaba:
   * sobrino en Madrid con tía fallecida en Asturias, 80.000 € → 2.068,39 € de diferencia.
   */
  test('736 — el campo de CCAA pide la del fallecido, no la del heredero', async ({ page }) => {
    await page.goto(RUTA);

    const etiqueta = page.locator('label[for="ccaa-causante"]');
    const texto = await etiqueta.innerText();
    expect(texto).toMatch(/fallecido|causante/i);
    expect(texto).not.toMatch(/heredero/i);

    // Y el select está asociado a esa etiqueta, que es lo que le da nombre accesible
    await expect(page.locator('#ccaa-causante')).toHaveCount(1);
  });

  /**
   * HALLAZGO 741 (alto) — 14 controles sin nombre accesible: los <label> se pintaban como
   * hermanos del control, sin htmlFor y sin id, y no lo envolvían. Un lector de pantalla
   * anunciaba «cuadro combinado» y «edición, 0,00» sin decir de qué concepto de la masa
   * hereditaria se trataba.
   */
  test('741 — ningún control del formulario se queda sin nombre accesible', async ({ page }) => {
    await page.goto(RUTA);

    const sinNombre = await page.evaluate(() => {
      const fuera: string[] = [];
      document.querySelectorAll('select, input').forEach((el) => {
        const c = el as HTMLInputElement;
        if (c.type === 'hidden') return;
        if (c.getAttribute('aria-label') || c.getAttribute('aria-labelledby')) return;
        if (c.id && document.querySelector('label[for="' + CSS.escape(c.id) + '"]')) return;
        if (c.closest('label')) return;
        fuera.push(c.tagName.toLowerCase() + '#' + (c.id || '(sin id)'));
      });
      return fuera;
    });

    expect(sinNombre, 'controles sin nombre accesible: ' + sinNombre.join(', ')).toEqual([]);
  });

  /**
   * HALLAZGO 740 (alto) — un importe NEGATIVO en las deudas no se rechazaba ni se tomaba en
   * valor absoluto: se restaba con su signo, así que AUMENTABA la masa hereditaria. Madrid,
   * Grupo II, 250.000 € en cuentas y «-500000» de hipoteca daban 750.000 € de masa, 772.500 €
   * de base imponible y una cuota de 1.238,24 € sobre una herencia que nunca existió.
   */
  test('740 — una deuda negativa no triplica la herencia: se rechaza y se dice', async ({ page }) => {
    await page.goto(RUTA);

    await page.locator('select').nth(SELECT.ccaa).selectOption('madrid');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II');
    await importe(page, CAMPO.saldos, '250000');
    await page.locator('#hipotecas').fill('-500000');

    await expect(page.getByRole('alert').filter({ hasText: /no se puede/ })).toContainText('Hipotecas y préstamos hipotecarios');
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);
    expect(await textoPagina(page)).not.toContain('750.000,00 €');
  });

  /**
   * HALLAZGO 742 (medio) — un importe inválido conviviendo con uno válido se descartaba en
   * silencio: el parser devolvía NaN, el «|| 0» lo convertía en cero y la app daba una cifra
   * completa sin ninguna marca sobre el campo que había tirado.
   */
  test('742 — un importe ilegible junto a uno válido no se descarta en silencio', async ({ page }) => {
    await page.goto(RUTA);

    await page.locator('select').nth(SELECT.ccaa).selectOption('madrid');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II');
    await importe(page, CAMPO.saldos, '1.2.3');
    await importe(page, CAMPO.viviendaHabitual, '200000');

    // Antes: «Total activos 200.000,00 €» y cuota 59,66 € sin avisar de nada.
    await expect(page.getByRole('alert').filter({ hasText: /no se puede/ })).toContainText('Saldos en cuentas bancarias');
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);
    expect(await textoPagina(page)).not.toContain('200.000,00 €');
  });

  /**
   * HALLAZGO 743 (medio) — el porcentaje de herencia 0 se convertía en 100 (el 0 es falsy), y
   * la pantalla se contradecía: «Porcentaje de herencia 0%» encima de «Base ajustada
   * 257.500,00 €», que es el 100 % de la herencia, con su cuota de 237,39 € debajo.
   */
  test('743 — el porcentaje de herencia 0 no se convierte en el 100 %', async ({ page }) => {
    await page.goto(RUTA);

    await page.locator('select').nth(SELECT.ccaa).selectOption('madrid');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II');
    await importe(page, CAMPO.saldos, '250000');
    await page.locator('#porcentaje-herencia').fill('0');

    // Los 257.500 € siguen viéndose como base imponible de la herencia COMPLETA, que es
    // correcto; lo que no puede ser la herencia entera es la base ajustada de este heredero.
    const baseAjustada = (await page.locator('text=Base ajustada').locator('..').innerText()).split(' ').join(' ');
    expect(baseAjustada).toContain('0,00 €');
    expect(baseAjustada).not.toContain('257.500,00 €');
    expect(await cuota(page)).toBe('0,00 €');
  });

  /**
   * HALLAZGO 737 (alto) — la tarjeta «Sobrino hereda cuenta bancaria — Asturias — Grupo III —
   * 80.000 €» desarrollaba el cálculo saltándose la reducción en base de 50.000 € que la
   * herramienta SÍ aplica: anunciaba ~17.200 € donde la app liquida 3.306,56 €, en un ejemplo
   * que el usuario lee como confirmación del número que acaba de obtener.
   */
  test('737 — la tarjeta del sobrino de Asturias dice lo que la herramienta calcula', async ({ page }) => {
    await page.goto(RUTA);

    await page.locator('select').nth(SELECT.ccaa).selectOption('asturias');
    await page.locator('select').nth(SELECT.parentesco).selectOption('III');
    await importe(page, CAMPO.saldos, '80000');
    expect(await cuota(page)).toBe('3306,56 €');

    const tarjeta = await textoCompleto(page);
    expect(tarjeta).toContain('3.306,56 €');   // la tarjeta del bloque educativo
    expect(tarjeta).not.toContain('17.200');
    expect(tarjeta).toContain('50.000 € en la base');
  });

  /**
   * HALLAZGO 738 (alto) — dos afirmaciones sobre Asturias que los propios datos desmentían, y
   * que además eran la asimetría territorial valorativa que el CLAUDE.md prohíbe. Con la misma
   * herencia del caso normal, Asturias sale a 0,00 € y Madrid a 154,74 €: la comunidad que el
   * texto ponía como «la de mayor recaudación efectiva» era la más barata de las dos.
   */
  test('738 — el texto sobre Asturias ya no la califica ni contradice al motor', async ({ page }) => {
    await page.goto(RUTA);
    const texto = await textoCompleto(page);

    expect(texto).not.toContain('mayor recaudación efectiva');
    expect(texto).not.toContain('menor bonificación para colaterales');

    // Y el caso que lo desmentía, calculado en la propia app: Asturias 0,00 €
    await page.locator('select').nth(SELECT.ccaa).selectOption('asturias');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II');
    await importe(page, CAMPO.saldos, '50000');
    await importe(page, CAMPO.viviendaHabitual, '200000');
    expect(await cuota(page)).toBe('0,00 €');
  });

  /**
   * HALLAZGO 739 (alto) — el bloque educativo usaba la escala de recargos DEROGADA (5/10/15/20 %
   * por tramos). El art. 27.2 LGT, en la redacción de la Ley 11/2021 vigente desde el
   * 11/07/2021, es 1 % más 1 % por mes completo, y 15 % fijo pasados 12 meses. El ejemplo que
   * daba la propia página —10.000 € con 8 meses de retraso— asustaba con 1.500 € cuando la ley
   * cobra 900 €.
   */
  test('739 — el recargo por presentación tardía es el del art. 27.2 vigente', async ({ page }) => {
    await page.goto(RUTA);
    const texto = (await textoCompleto(page)).replace(/\s+/g, ' ');

    // 1 % + 1 % × 8 meses = 9 % de 10.000 € = 900,00 €
    expect(texto).toContain('900,00 €');
    expect(texto).not.toContain('1.500 €');
    expect(texto).not.toMatch(/5% si tardas hasta 3 meses/);
  });

  /**
   * HALLAZGO 744 (medio) — el bloque educativo metía al cónyuge en el Grupo I y lo dejaba fuera
   * del Grupo II, contra el art. 20.2.a LISD y contra el faqJsonLd de la propia app, que sí lo
   * decía bien. La misma URL afirmaba las dos cosas.
   */
  test('744 — el cónyuge está en el Grupo II, como dice el art. 20.2.a', async ({ page }) => {
    await page.goto(RUTA);
    const texto = (await textoCompleto(page)).replace(/\s+/g, ' ');

    expect(texto).toContain('Descendientes y adoptados menores de 21 años');
    expect(texto).toContain('Descendientes de 21 años o más, cónyuge y ascendientes');
  });

  /**
   * HALLAZGOS 746 y 747 (bajos) — el coeficiente multiplicador y los porcentajes de bonificación
   * se imprimían con toFixed, es decir con punto decimal inglés, conviviendo en la misma columna
   * con importes que sí iban en formato español; y DataReference recibía la misma cadena en
   * «normativa» y en «fuente», así que la pintaba dos veces seguidas.
   */
  test('746 y 747 — formato español en el desglose y sin fuente duplicada', async ({ page }) => {
    await page.goto(RUTA);

    await page.locator('select').nth(SELECT.ccaa).selectOption('asturias');
    await page.locator('select').nth(SELECT.parentesco).selectOption('III');
    await importe(page, CAMPO.saldos, '80000');

    const panel = await textoPagina(page);
    expect(panel).toContain('×1,5882');
    expect(panel).not.toContain('×1.5882');

    // La tarjeta de datos de referencia ya no repite la misma cadena dos veces
    const referencia = await page.getByText('Normativa aplicada').locator('..').innerText();
    expect(referencia).toContain('ISD 2025');
    const vecesFuente = referencia.split('Ley 29/1987 ISD + normativas autonómicas 2025').length - 1;
    expect(vecesFuente, 'la fuente completa se imprime UNA vez').toBe(1);
  });

  /**
   * HALLAZGO 748 (bajo) — el WebApplication de Schema.org se publicaba con features vacío, es
   * decir con featureList vacío, en una app cuyo canal declarado son las IAs.
   */
  test('748 — el WebApplication publica sus características', async ({ page }) => {
    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const nodos = bloques.flatMap((b) => {
      const j = JSON.parse(b);
      return (j['@graph'] ?? [j]) as Array<Record<string, unknown>>;
    });
    const webApp = nodos.find((n) => n['@type'] === 'WebApplication');

    expect(webApp, 'hay un WebApplication en el JSON-LD').toBeTruthy();
    const caracteristicas = webApp!.featureList as string[];
    expect(Array.isArray(caracteristicas)).toBe(true);
    expect(caracteristicas.length).toBeGreaterThanOrEqual(4);
  });
});
