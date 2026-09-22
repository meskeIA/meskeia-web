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
import { esperarHidratacion, sembrarValor } from './_hidratacion';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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
   *   × 1,5882 → 3.306,55 €   COEFICIENTES_IS['III'][0], patrimonio < 402.678 €
   *                          (2.081,95 × 1,5882 = 3.306,5534…; hasta el 1195 la app
   *                           multiplicaba por 2.081,95436 y publicaba 3.306,56)
   *   × 1,9059 → 3.967,99 €   COEFICIENTES_IS['III'][3], patrimonio > 4.020.770 €
   *
   *   Sin bonificación en cuota: en Asturias el beneficio ya se gastó en la base.
   *
   * ⚠️ La tarjeta «Sobrino hereda cuenta bancaria» del bloque educativo describe ESTE mismo
   * caso y anuncia «~17.200 € (21,5 %)» porque se salta los 50.000 € de reducción. Es el
   * hallazgo de contenido del acta: la app se contradice a sí misma por 5,4 veces.
   */
  test('caso límite: Grupo III en Asturias, 3.306,55 € y 3.967,99 € según patrimonio', async ({ page }) => {
    await page.goto(RUTA);

    await page.locator('select').nth(SELECT.ccaa).selectOption('asturias');
    await page.locator('select').nth(SELECT.parentesco).selectOption('III');
    await importe(page, CAMPO.saldos, '80000');

    /*
      ⚠️ 22/09/2026 (hallazgo 1195) — la cuota pasa de 3306,56 € a 3306,55 €. La app multiplicaba
      el coeficiente del art. 22 LISD por los 2081,95436 € de su aritmética interna mientras
      imprimía en pantalla «Cuota íntegra 2081,95 €», así que el desglose no cuadraba consigo
      mismo: 2081,95 × 1,5882 = 3306,55. Ahora parte del importe liquidado, como el motor y como
      las casillas del modelo 650.
    */
    expect(await cuota(page)).toBe('3306,55 €');

    const panel = await textoPagina(page);
    expect(panel).toContain('50.000,00 €');   // la reducción en base de Asturias, que existe
    expect(panel).toContain('24.406,54 €');   // base liquidable
    expect(panel).toContain('2081,95 €');     // cuota íntegra antes del coeficiente

    // El coeficiente multiplicador del Grupo III sí crece con el patrimonio preexistente.
    // 2081,95 × 1,9059 = 3967,9887… → 3967,99 (antes 3968,00, desde 2081,95436).
    await page.locator('select').nth(SELECT.patrimonio).selectOption('4');
    expect(await cuota(page)).toBe('3967,99 €');
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
    // 22/09/2026: 3306,55 € desde el redondeo del 1195 — 2081,95 × 1,5882.
    expect(await cuota(page)).toBe('3306,55 €');

    const tarjeta = await textoCompleto(page);
    /*
      ⚠️ 21/09/2026 — esta aserción pedía «3.306,56 €», CON punto de millar, y el panel de
      resultados imprime «3306,56 €», que es lo que da `formatCurrency`: en es-ES un número de
      cuatro cifras enteras no lleva separador de millar. Las dos grafías convivían en la misma
      página para la misma operación, y los propios tests encerraban una en cada aserción
      (hallazgo 1153). Al derivar la tarjeta del motor (hallazgo 1152) la escribe
      `formatCurrency`, así que la grafía es Única y el test exige la del panel.
    */
    expect(tarjeta).toContain('3306,55 €');   // la tarjeta del bloque educativo
    expect(tarjeta).not.toContain('3.306,56 €');
    expect(tarjeta).not.toContain('17.200');
    expect(tarjeta).toContain('50.000,00 € en la base');
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

// ════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 12/09/2026 — tres casos nuevos, resueltos a mano ANTES de
// ejecutarlos. Ninguno repite comunidad ni grupo de los de arriba: el caso normal
// estrena la única regla de tope de base del catálogo (La Rioja), el caso límite
// junta el ÚLTIMO tramo del art. 21.2 LISD con el coeficiente más alto del art. 22,
// y el caso a rechazar usa una forma de número que `parseSpanishNumber` desecha y
// que «1.2.3» no cubre.
//
// Cada cifra esperada sale de `data/fiscal/sucesiones.ts`, con el tramo y la
// constante citados en el desarrollo. La siembra pasa por `_hidratacion.ts`: el
// resto del fichero escribe con `fill()` nada más cargar, que es la ventana en la
// que el evento puede perderse sin que nada lo delate.
// ════════════════════════════════════════════════════════════════════════════

test.describe('Re-inspección 12/09/2026 — tarifa del art. 21, coeficiente del art. 22 y rechazo', () => {
  /**
   * SOLO la columna de resultados. `textoPagina` trae el body entero, y frases como
   * «Bonificación autonómica» también viven en el bloque educativo: una comprobación
   * NEGATIVA sobre el body no distinguiría el panel del material de apoyo.
   */
  const panelResultados = async (page: Page): Promise<string> =>
    (await page.locator('[class*="resultsPanel"]').innerText()).replace(/ /g, ' ');

  /**
   * CASO NORMAL — la madre (Grupo II-ascendiente) hereda 600.000 € en cuentas en LA RIOJA,
   * la única comunidad del catálogo cuya bonificación cambia de porcentaje al pasar un tope
   * de base liquidable (`{ porcentaje: 0,99, tope: 500.000, porcentajeMayor: 0,98 }`).
   *
   *   Activos             600.000,00   (saldos en cuentas)
   *   + ajuar 3 %          18.000,00   PORC_AJUAR_DOMESTICO_IS
   *   = base imponible    618.000,00
   *   − parentesco         15.956,87   REDUCCIONES_PARENTESCO_IS['II-ascendiente']
   *   = base liquidable   602.043,13
   *   cuota íntegra       141.126,59   TARIFA_ESTATAL_IS, tramo «hasta 797.555,08»:
   *                                    80.655,08 + 29,75 % × (602.043,13 − 398.777,54)
   *   × coeficiente           1,0000   COEFICIENTES_IS['II'][0] (patrimonio < 402.678 €)
   *   − bonificación 98 %  138.304,06  602.043,13 > tope de 500.000 € → `porcentajeMayor`
   *   = cuota final         2.822,53 €
   */
  test('caso normal: la madre en La Rioja pasa el tope de 500.000 € y paga 2822,53 €', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#porcentaje-herencia']);

    await page.locator('select').nth(SELECT.ccaa).selectOption('rioja');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II-ascendiente');
    await sembrarValor(page, page.locator('input[inputmode="decimal"]').nth(CAMPO.saldos), '600000');

    expect(await cuota(page)).toBe('2822,53 €');

    const panel = await textoPagina(page);
    expect(panel).toContain('618.000,00 €');    // base imponible con ajuar
    expect(panel).toContain('602.043,13 €');    // base liquidable
    expect(panel).toContain('141.126,59 €');    // cuota íntegra, tramo del 29,75 %
    expect(panel).toContain('138.304,06 €');    // bonificación del 98 %, no del 99 %
    // Y el rótulo dice POR QUÉ es el 98 %: la base ha superado el tope
    expect(panel).toContain('Bonificación 98 % (base supera 500.000,00 €)');
  });

  /**
   * CASO LÍMITE — el extremo superior de las dos escalas a la vez: un extraño (Grupo IV) que
   * hereda 1.000.000 € en la Comunitat Valenciana con más de 4.020.770 € de patrimonio
   * preexistente. Cae en el ÚLTIMO tramo del art. 21.2 —el del 34 %, que es el que
   * `e947fa55` restauró: la escala rota se quedaba en el 25,50 %— y se lleva el coeficiente
   * más alto del art. 22, 2,4000.
   *
   *   Activos           1.000.000,00   (saldos en cuentas)
   *   + ajuar 3 %          30.000,00
   *   = base imponible  1.030.000,00
   *   − reducciones             0,00   REDUCCIONES_PARENTESCO_IS['IV'] = 0
   *   = base liquidable 1.030.000,00
   *   cuota íntegra       278.322,67   TARIFA_ESTATAL_IS, tramo «Infinity»:
   *                                    199.291,40 + 34 % × (1.030.000 − 797.555,08)
   *   × coeficiente           2,4000   COEFICIENTES_IS['IV'][3] (patrimonio > 4.020.770 €)
   *   = cuota tributaria  667.974,41
   *   − bonificación            0,00   BONIFICACIONES_CCAA_IS['valencia']…['IV'] = 0 %
   *   = cuota final       667.974,41 €  (64,85 % de la base imponible)
   */
  test('caso límite: Grupo IV con el tramo del 34 % y el coeficiente 2,4000 paga 667.974,41 €', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#porcentaje-herencia']);

    await page.locator('select').nth(SELECT.ccaa).selectOption('valencia');
    await page.locator('select').nth(SELECT.parentesco).selectOption('IV');
    await page.locator('select').nth(SELECT.patrimonio).selectOption('4');
    await sembrarValor(page, page.locator('input[inputmode="decimal"]').nth(CAMPO.saldos), '1000000');

    expect(await cuota(page)).toBe('667.974,41 €');

    const panel = await textoPagina(page);
    expect(panel).toContain('1.030.000,00 €');  // base imponible = base liquidable: sin reducciones
    expect(panel).toContain('278.322,67 €');    // cuota íntegra del último tramo del art. 21.2
    expect(panel).toContain('×2,4000');         // COEFICIENTES_IS['IV'][3]
    expect(panel).toContain('Tipo efectivo: 64,85%');

    // El Grupo IV no tiene bonificación en Valencia: la cuota tributaria ES la final,
    // sin línea de bonificación por medio (se comprueba en el panel, no en el body)
    const columna = await panelResultados(page);
    expect(columna).not.toContain('Bonificación');
    expect(columna.split('667.974,41 €').length - 1, 'cuota tributaria y cuota final coinciden').toBe(3);
  });

  /**
   * CASO A RECHAZAR — «1e3» en un campo de importe.
   *
   * Es notación científica, no un número escrito en español, y `parseSpanishNumber` devuelve
   * NaN. Complementa al «1.2.3» de la inspección anterior por dos motivos: cae en OTRO campo
   * —la vivienda habitual, que además arrastra la reducción del 95 %— y es la forma que
   * `parseFloat` sí habría leído, como 1000, sin avisar de nada (§ candado del parser).
   *
   * Con 50.000 € válidos al lado, la app tiene que abstenerse igual: nombrar el campo
   * ilegible y no publicar ninguna cifra.
   */
  test('caso a rechazar: «1e3» en la vivienda habitual no se lee como 1000', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#porcentaje-herencia']);

    await page.locator('select').nth(SELECT.ccaa).selectOption('madrid');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II');
    await sembrarValor(page, page.locator('input[inputmode="decimal"]').nth(CAMPO.viviendaHabitual), '1e3');
    await sembrarValor(page, page.locator('input[inputmode="decimal"]').nth(CAMPO.saldos), '50000');

    await expect(page.getByRole('alert').filter({ hasText: /no se puede leer/ }))
      .toContainText('Vivienda habitual');
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);

    // Ni siquiera el importe válido se publica: el panel entero se abstiene
    expect(await textoPagina(page)).not.toContain('50.000,00 €');
  });
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * GUARDAS de la REPARACIÓN del 13/09/2026 — los ocho hallazgos de la tanda del
 * 12/09 (794 a 801). La tanda 3 de la ronda 8 los cerró; esto es lo que tiene
 * que seguir siendo cierto.
 * ─────────────────────────────────────────────────────────────────────────────
 */
test.describe('Estimador ISD — reparación 13/09/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[inputmode="decimal"]']);
  });

  /**
   * [796] La reducción por seguro de vida se prorratea por el porcentaje de herencia, igual
   * que la de vivienda habitual del mismo bloque.
   *
   * Asturias · hijo ≥21 · 1.000.000 € en cuentas · 10.000 € de seguros · 50 % de la herencia.
   * Este heredero percibe 5.000 € del seguro, así que su reducción son 5.000 €, no 9.195,49 €:
   *   base con ajuar 1.030.000 × 50 % = 515.000 … más el ajuar del seguro → 520.150,00
   *   − 15.956,87 (parentesco II) − 5.000 (seguro) − 300.000 (Asturias) = 199.193,13
   *   tarifa estatal, tramo «hasta 239.389,13»:
   *     23.063,25 + 21,25 % × (199.193,13 − 159.634,83) = 31.469,39
   *
   * Solo se ve en las comunidades SIN bonificación del 99 % en cuota: en las demás, el 99 %
   * aplana la diferencia y el defecto quedaba invisible.
   */
  test('[796] el seguro de vida se prorratea por el porcentaje de herencia', async ({ page }) => {
    await page.locator('select').nth(SELECT.ccaa).selectOption('asturias');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II');
    await importe(page, CAMPO.saldos, '1000000');

    await page.locator('#seguros-vida').fill('10000');
    await page.locator('#porcentaje-herencia').fill('50');

    // ⚠️ Acotado al PANEL DE RESULTADOS el 14/09/2026. Miraba el texto de la página entera y
    // pasaba por casualidad: el tope estatal iba tecleado en el bloque educativo como
    // «9.195,49 €» y el test lo buscaba sin el punto de millar. Al derivarlo de
    // REDUCCION_SEGURO_VIDA_MAX_IS (hallazgo 818), `formatCurrency` lo escribe «9195,49 €»
    // —en español un número de cuatro cifras no lleva separador de millar— y el caso saltaba
    // por una mención legítima: el bloque educativo SÍ tiene que nombrar el tope de la ley.
    // Lo que este caso vigila es el DESGLOSE, que es donde el tope no puede sustituir a la
    // parte prorrateada.
    const desglose = await page.locator('[class*="resultsPanel"], [class*="desglose"]').first().innerText();
    // Su mitad del capital, no el tope entero
    expect(desglose).toContain('5000,00');
    expect(desglose).not.toContain('9195,49');
  });

  /**
   * [797] Con el 0 % de herencia no hay base sobre la que calcular un tipo efectivo: la
   * guarda miraba `baseImponibleTotal` y la división usaba `baseAjustada`, así que salía
   * 0/0 = NaN y `formatNumber` lo imprimía como «No definido».
   */
  test('[797] el tipo efectivo sin base es 0,00 %, no «No definido»', async ({ page }) => {
    await page.locator('select').nth(SELECT.ccaa).selectOption('madrid');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II');
    await importe(page, CAMPO.saldos, '250000');
    await page.locator('#porcentaje-herencia').fill('0');

    const texto = await textoPagina(page);
    expect(texto).not.toContain('No definido');
    expect(texto).toContain('Tipo efectivo: 0,00%');
  });

  /**
   * [798] Por el otro extremo del mismo `Math.min(100, Math.max(0, …))`: un porcentaje mayor
   * que 100 se capaba en el cálculo y se imprimía crudo, así que la app afirmaba un
   * porcentaje y liquidaba otro.
   */
  test('[798] un porcentaje mayor que 100 se enseña capado al 100 %', async ({ page }) => {
    await page.locator('select').nth(SELECT.ccaa).selectOption('madrid');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II');
    await importe(page, CAMPO.saldos, '250000');
    await page.locator('#porcentaje-herencia').fill('150');

    const texto = await textoCompleto(page);
    expect(texto).toContain('100,00%');
    expect(texto).toContain('capado al 100');
    expect(texto).not.toMatch(/Porcentaje de herencia\s*150%/);
  });

  /**
   * [794] La tarjeta del bloque educativo sale del MOTOR, no de una tarifa derogada: decía
   * «cuota íntegra ~6.100 €» y «cuota final ~61 €» donde la propia herramienta liquida
   * 7.300,03 € y 73,00 € con esos mismos datos.
   */
  test('[794] la tarjeta de Madrid dice lo que la herramienta calcula', async ({ page }) => {
    const educativo = await textoCompleto(page);
    expect(educativo).not.toContain('~6.100');
    expect(educativo).not.toContain('~61 €');
    expect(educativo).toContain('7300,03');
    expect(educativo).toContain('73,00');

    // Y la herramienta, con esos mismos datos, da esa cifra
    await page.locator('select').nth(SELECT.ccaa).selectOption('madrid');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II');
    await importe(page, CAMPO.viviendaHabitual, '200000');
    expect(await cuota(page)).toContain('73,00');
  });

  /**
   * [795] Las dos bocas dicen lo mismo sobre los intereses de la prórroga, y dicen lo que
   * dice el art. 68.3 del Reglamento: que los devenga. La contradicción vivía entre el
   * faqJsonLd —que es lo que citan ChatGPT, Bing Copilot y Perplexity— y la tarjeta visible.
   */
  test('[795] la prórroga devenga intereses en las dos bocas', async ({ page }) => {
    const visible = await textoCompleto(page);
    expect(visible).not.toMatch(/no genera intereses/i);
    expect(visible).toMatch(/devenga intereses de demora/i);

    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).toContain('intereses de demora');
  });

  /**
   * [799] [800] [801] Los datos normativos de la prosa salen de data/fiscal, no del teclado.
   */
  test('[799] [800] [801] la prosa deriva sus cifras de data/fiscal', async ({ page }) => {
    const fuente = readFileSync(
      join(process.cwd(), 'app/estimador-impuesto-sucesiones/page.tsx'),
      'utf8',
    );
    // [801] el plazo, con su norma citada
    expect(fuente).toContain('PLAZO_ISD.mesesPresentacion');
    expect(fuente).toContain('PLAZO_ISD.norma');
    // [799] el interés de demora, de la escala de recargos y no a mano
    expect(fuente).not.toContain('4,0625%');
    // [800] las cifras del ISD que el fichero YA importaba y escribía a mano
    for (const literal of ['122.606,47 €', '47.858,59 €', '150.253,03 €', '15.956,87 €', '7.993,46 €']) {
      expect(fuente, `sigue tecleado: ${literal}`).not.toContain(`>${literal}<`);
    }

    // Y en pantalla, el plazo va acompañado de su norma
    const texto = await textoCompleto(page);
    expect(texto).toContain('RD 1629/1991');
  });
});


// ════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 14/09/2026 — tres casos nuevos, resueltos a mano ANTES de
// ejecutarlos, y ninguno repite comunidad ni grupo de los anteriores:
//
//   · el NORMAL estrena Canarias, la bonificación más alta del régimen común
//     (99,9 %), sobre el tramo del 25,50 % del art. 21.2;
//   · el LÍMITE estrena el acantilado de Aragón —la única comunidad cuyo
//     beneficio es todo o nada al pasar un límite de base liquidable— con la
//     base justo por debajo y justo por encima de los 3.000.000 €;
//   · el de RECHAZO estrena el importe NEGATIVO en un campo de BIENES (los
//     anteriores lo probaban en una DEUDA y con «1.2.3» / «1e3»).
//
// Cada cifra esperada sale de `data/fiscal/sucesiones.ts`, con el tramo y la
// constante citados en el desarrollo. La siembra pasa por `_hidratacion.ts`.
// ════════════════════════════════════════════════════════════════════════════

test.describe('Re-inspección 14/09/2026 — Canarias, el acantilado de Aragón y el importe negativo', () => {
  /** SOLO la columna de resultados: frases como «Bonificación» viven también en la guía. */
  const panelResultados = async (page: Page): Promise<string> =>
    (await page.locator('[class*="resultsPanel"]').innerText()).replace(/\u00a0/g, ' ');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#saldos-cuentas', '#porcentaje-herencia']);
  });

  /**
   * CASO NORMAL — hijo de 21 o más (Grupo II) que hereda 300.000 € en cuentas en CANARIAS,
   * la bonificación más generosa del régimen común: 99,9 % (`BONIFICACIONES_CCAA_IS`).
   * La base cae en el tramo del 25,50 % del art. 21.2, que es el penúltimo.
   *
   *   Activos            300.000,00   (saldos en cuentas)
   *   + ajuar 3 %          9.000,00   PORC_AJUAR_DOMESTICO_IS
   *   = base imponible   309.000,00
   *   − parentesco        15.956,87   REDUCCIONES_PARENTESCO_IS['II']
   *   = base liquidable  293.043,13
   *   cuota íntegra       53.692,81   TARIFA_ESTATAL_IS, tramo «hasta 398.777,54»:
   *                                   40.011,04 + 25,50 % × (293.043,13 − 239.389,13)
   *   × coeficiente          1,0000   COEFICIENTES_IS['II'][0] (patrimonio < 402.678 €)
   *   − bonificación 99,9 % 53.639,12 BONIFICACIONES_CCAA_IS['canarias']…['II'] = 0,999
   *   = cuota final           53,69 €  (tipo efectivo 0,02 %)
   */
  test('caso normal: hijo ≥21 en Canarias con 300.000 € paga 53,69 €', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('canarias');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '300000');

    expect(await cuota(page)).toBe('53,69 €');

    const panel = await panelResultados(page);
    expect(panel).toContain('9000,00 €');        // ajuar del 3 %
    expect(panel).toContain('309.000,00 €');     // base imponible
    expect(panel).toContain('15.956,87 €');      // reducción del art. 20.2.a
    expect(panel).toContain('293.043,13 €');     // base liquidable
    expect(panel).toContain('53.692,81 €');      // cuota íntegra, tramo del 25,50 %
    expect(panel).toContain('53.639,12 €');      // bonificación del 99,9 %
    expect(panel).toContain('Bonificación 99,9 % (Canarias)');
    expect(panel).toContain('Tipo efectivo: 0,02%');
  });

  /**
   * CASO LÍMITE — el acantilado de ARAGÓN. Su beneficio es
   * `{ porcentaje: 1,00, limite: 3.000.000 }`: exención TOTAL mientras la base liquidable no
   * pase de 3.000.000 €, y NADA en cuanto la pasa. No es una escala que decrece: es todo o
   * nada, así que 100.000 € más de herencia convierten una cuota de cero en casi un millón.
   *
   *   (a) Activos        2.900.000,00 → base imponible 2.987.000,00
   *       − parentesco      15.956,87   REDUCCIONES_PARENTESCO_IS['II']
   *       = base liquidable 2.971.043,13 ≤ 3.000.000 → bonificación del 100 %
   *       cuota íntegra    938.277,34   TARIFA_ESTATAL_IS, tramo «Infinity»:
   *                                     199.291,40 + 34 % × (2.971.043,13 − 797.555,08)
   *       = cuota final          0,00 €
   *
   *   (b) Activos        3.000.000,00 → base imponible 3.090.000,00
   *       = base liquidable 3.074.043,13 > 3.000.000 → SIN bonificación
   *       cuota íntegra    973.297,34   199.291,40 + 34 % × (3.074.043,13 − 797.555,08)
   *       = cuota final    973.297,34 €  (tipo efectivo 31,50 %)
   */
  test('caso límite: en Aragón 100.000 € más de herencia pasan de 0,00 € a 973.297,34 €', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('aragon');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '2900000');

    expect(await cuota(page)).toBe('0,00 €');
    const bajoElLimite = await panelResultados(page);
    expect(bajoElLimite).toContain('2.971.043,13 €');   // base liquidable, aún bajo el tope
    expect(bajoElLimite).toContain('938.277,34 €');     // cuota íntegra del último tramo
    expect(bajoElLimite).toContain('Bonificación 100,0 % (Aragón)');

    // Un euro por encima del límite no rebaja la bonificación: la suprime entera
    await sembrarValor(page, page.locator('#saldos-cuentas'), '3000000');

    expect(await cuota(page)).toBe('973.297,34 €');
    const sobreElLimite = await panelResultados(page);
    expect(sobreElLimite).toContain('3.074.043,13 €');  // base liquidable, ya sobre el tope
    expect(sobreElLimite).toContain('973.297,34 €');    // cuota íntegra = cuota final
    expect(sobreElLimite).toContain('Tipo efectivo: 31,50%');
    expect(sobreElLimite, 'sin bonificación al pasar el límite').not.toContain('Bonificación');
  });

  /**
   * CASO A RECHAZAR — un importe NEGATIVO en un campo de BIENES.
   *
   * El caso del 11/09 (hallazgo 740) probó el signo menos en una DEUDA, donde restaba con su
   * signo y AUMENTABA la masa. En un bien la aritmética es la contraria —la encogería— y el
   * campo es otro, así que es una rama distinta de la misma guarda: `leer()` rechaza todo
   * `n < 0`, nombre el campo que sea.
   *
   * La app tiene que nombrar el campo y ABSTENERSE de dar cifra, no tomarlo como cero.
   */
  test('caso a rechazar: un importe negativo en un bien no se toma como cero', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('madrid');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#acciones-fondos'), '-50000');

    await expect(page.getByRole('alert').filter({ hasText: /no se puede leer/ }))
      .toContainText('Acciones, fondos y productos financieros');
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);
  });

  /**
   * CONTRASTE del acta del 14/09/2026 — lo que la HERRAMIENTA calcula para el caso de la
   * tarjeta «Viuda hereda empresa familiar» (Cataluña · cónyuge · 500.000 €).
   *
   *   Activos           500.000,00   + ajuar 15.000,00 = base imponible 515.000,00
   *   − parentesco      100.000,00   REDUCCIONES_PARENTESCO_CATALUNA_IS['I-conyuge']
   *   = base liquidable 415.000,00
   *   cuota íntegra      60.600,00   TARIFA_CATALUNA_IS, tramo «hasta 800.000»:
   *                                  57.000 + 24 % × (415.000 − 400.000)
   *   × 1,0000 (COEFICIENTES_CATALUNA_IS['I'][0])
   *   − bonificación 99 % 59.994,00  BONIF_CONYUGE_CATALUNA_IS, art. 58 bis.1
   *   = cuota final         606,00 €
   *
   * ⚠️ La tarjeta del bloque educativo anuncia «la cuota, de 57.000 €» y la llama «el techo»:
   * se salta el ajuar del 3 % y, sobre todo, la bonificación del 99 % del cónyuge catalán que
   * la propia ficha de Cataluña anuncia dos bloques más arriba. Es el hallazgo de contenido
   * del acta —mismo patrón que los hallazgos 737 y 794—, y este test fija el lado que sí es
   * correcto: el de la herramienta.
   */
  test('contraste: el cónyuge catalán con 500.000 € paga 606,00 €', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('cataluna');
    await page.locator('#parentesco').selectOption('I-conyuge');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '500000');

    expect(await cuota(page)).toBe('606,00 €');

    const panel = await panelResultados(page);
    expect(panel).toContain('515.000,00 €');   // base imponible CON el ajuar del 3 %
    expect(panel).toContain('100.000,00 €');   // reducción del cónyuge, art. 2 Ley 19/2010
    expect(panel).toContain('415.000,00 €');   // base liquidable
    expect(panel).toContain('60.600,00 €');    // cuota íntegra, tarifa propia de Cataluña
    expect(panel).toContain('59.994,00 €');    // bonificación del 99 %, art. 58 bis.1
  });
});

// ════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 21/09/2026 — tres casos nuevos, resueltos a mano ANTES de
// ejecutarlos, y ninguno repite comunidad ni rama de bonificación de los
// anteriores:
//
//   · el NORMAL estrena BALEARES, la única comunidad del catálogo cuyo Grupo II
//     bonifica al 95 % (no al 99 % ni al 99,9 %), así que es la única donde la
//     cuota que sobrevive a la bonificación tiene cuatro cifras y un error en el
//     porcentaje se ve a simple vista;
//   · el LÍMITE estrena la rama `exencion` de `aplicarBonificacion` —Andalucía y
//     Galicia, exención TOTAL si la base liquidable no llega al millón—, que
//     ninguna corrida anterior había ejecutado, con la base a un lado y a otro
//     de los 1.000.000 €;
//   · el de RECHAZO estrena la forma «cifra + palabra» («300.000 aprox») en el
//     campo de Otros inmuebles. Los casos anteriores probaron «1.2.3» (dos
//     puntos), «1e3» (exponente) y el signo menos; éste es el que `parseFloat`
//     habría leído como 300 —mil veces menos— sin avisar de nada.
//
// Cada cifra esperada sale de `data/fiscal/sucesiones.ts`, con el tramo y la
// constante citados en el desarrollo. La siembra pasa por `_hidratacion.ts`.
// ════════════════════════════════════════════════════════════════════════════

test.describe('Re-inspección 21/09/2026 — Baleares al 95 %, el millón de Andalucía y el importe con palabra', () => {
  /** SOLO la columna de resultados: «Bonificación» y los importes viven también en la guía. */
  const panelResultados = async (page: Page): Promise<string> =>
    (await page.locator('[class*="resultsPanel"]').innerText()).replace(/ /g, ' ');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#saldos-cuentas', '#otros-inmuebles']);
  });

  /**
   * CASO NORMAL — hijo de 21 o más (Grupo II) que hereda 400.000 € en cuentas en las ISLAS
   * BALEARES. Es la única comunidad cuyo Grupo II se bonifica al 95 %
   * (`BONIFICACIONES_CCAA_IS['baleares'].bonificaciones['II'].porcentaje = 0.95`), frente al
   * 99 % de su propio Grupo I: si la app colapsara los dos grupos, la cuota bajaría a la
   * quinta parte y seguiría pareciendo plausible.
   *
   *   Activos            400.000,00   (saldos en cuentas)
   *   + ajuar 3 %          12.000,00   PORC_AJUAR_DOMESTICO_IS
   *   = base imponible   412.000,00
   *   − parentesco         15.956,87   REDUCCIONES_PARENTESCO_IS['II'] (art. 20.2.a LISD)
   *   = base liquidable  396.043,13
   *   cuota íntegra       79.957,81    TARIFA_ESTATAL_IS, tramo «hasta 398.777,54»:
   *                                    40.011,04 + 25,50 % × (396.043,13 − 239.389,13)
   *   × coeficiente           1,0000   COEFICIENTES_IS['II'][0] (patrimonio < 402.678 €)
   *   − bonificación 95 %  75.959,92
   *   = cuota final        3997,89 €   (tipo efectivo 0,97 %)
   */
  test('caso normal: hijo ≥21 en Baleares con 400.000 € paga 3997,89 €', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('baleares');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '400000');

    expect(await cuota(page)).toBe('3997,89 €');

    const panel = await panelResultados(page);
    expect(panel).toContain('12.000,00 €');    // ajuar del 3 %
    expect(panel).toContain('412.000,00 €');   // base imponible
    expect(panel).toContain('15.956,87 €');    // reducción del art. 20.2.a
    expect(panel).toContain('396.043,13 €');   // base liquidable
    expect(panel).toContain('79.957,81 €');    // cuota íntegra, tramo del 25,50 %
    expect(panel).toContain('75.959,92 €');    // bonificación del 95 %
    // El rótulo tiene que decir 95, no 99: es la diferencia entre 3997,89 € y 799,58 €
    expect(panel).toContain('Bonificación 95,0 % (Islas Baleares)');
    expect(panel).toContain('Tipo efectivo: 0,97%');
  });

  /**
   * CASO LÍMITE — el millón de ANDALUCÍA, que es la rama `exencion` de `aplicarBonificacion`
   * y no la había ejecutado ninguna corrida anterior: `{ porcentaje: 0.99, exencion: 1000000 }`
   * exime la cuota ENTERA mientras la base liquidable no llegue a 1.000.000 €, y por encima
   * deja el 99 % de siempre. No es una escala: es un escalón, y lo cruza el ajuar del 3 %
   * tanto como la herencia.
   *
   *   (a) Activos          985.000,00 → + ajuar 29.550,00 = base imponible 1.014.550,00
   *       − parentesco      15.956,87   REDUCCIONES_PARENTESCO_IS['II']
   *       = base liquidable 998.593,13 < 1.000.000 → EXENCIÓN TOTAL
   *       cuota íntegra     267.644,34  TARIFA_ESTATAL_IS, tramo «Infinity»:
   *                                     199.291,40 + 34 % × (998.593,13 − 797.555,08)
   *       = cuota final           0,00 €
   *
   *   (b) Activos          990.000,00 → + ajuar 29.700,00 = base imponible 1.019.700,00
   *       = base liquidable 1.003.743,13 ≥ 1.000.000 → sin exención, bonificación del 99 %
   *       cuota íntegra     269.395,34  199.291,40 + 34 % × (1.003.743,13 − 797.555,08)
   *       − bonificación    266.701,39   269.395,34 × 99 % sobre la cuota LIQUIDADA (1195)
   *       = cuota final        2693,95 €  (tipo efectivo 0,26 %)
   *
   * 5.000 € más de herencia convierten una cuota de cero en 2.693,95 €.
   */
  test('caso límite: en Andalucía 5.000 € más de herencia pasan de 0,00 € a 2693,95 €', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('andalucia');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '985000');

    expect(await cuota(page)).toBe('0,00 €');
    const bajoElMillon = await panelResultados(page);
    expect(bajoElMillon).toContain('998.593,13 €');   // base liquidable, aún bajo el millón
    expect(bajoElMillon).toContain('267.644,34 €');   // cuota íntegra del último tramo
    // El rótulo dice POR QUÉ es cero: no es que no haya cuota, es que está exenta
    expect(bajoElMillon).toContain('Exención total (base < 1.000.000,00 €)');

    await sembrarValor(page, page.locator('#saldos-cuentas'), '990000');

    expect(await cuota(page)).toBe('2693,95 €');
    const sobreElMillon = await panelResultados(page);
    expect(sobreElMillon).toContain('1.003.743,13 €');  // base liquidable, ya sobre el millón
    expect(sobreElMillon).toContain('269.395,34 €');    // cuota íntegra
    // 22/09/2026 (hallazgo 1195): la bonificación sale ahora de la cuota íntegra LIQUIDADA, y
    // con eso el desglose cuadra con lo que se lee — 269.395,34 − 266.701,39 = 2693,95, la
    // cuota final que esta misma prueba fija arriba. Antes daba 2693,96 y mostraba 2693,95.
    expect(sobreElMillon).toContain('266.701,39 €');    // bonificación del 99 %
    expect(sobreElMillon).toContain('Bonificación 99,0 % (Andalucía)');
    expect(sobreElMillon, 'ya no hay exención al llegar al millón').not.toContain('Exención total');
  });

  /**
   * CASO A RECHAZAR — «300.000 aprox» en Otros inmuebles, con 100.000 € válidos al lado.
   *
   * Es lo que escribe quien no sabe aún cuánto vale el piso, y es la forma más peligrosa de
   * las cuatro probadas: `partesNumericas` la desecha por la letra, pero `parseFloat` la
   * habría leído como **300** —el piso valdría trescientos euros— y el `|| 0` de antes del
   * 11/09/2026 la habría tomado como cero. En los dos casos sin decir nada.
   *
   * La app tiene que NOMBRAR el campo y abstenerse: ni siquiera publica el importe válido.
   */
  test('caso a rechazar: «300.000 aprox» no se lee como 300 ni como cero', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('baleares');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#otros-inmuebles'), '300.000 aprox');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');

    // Acotado al aviso de la app: `getByRole('alert')` casa también con el anunciador de
    // rutas de Next (#__next-route-announcer__) y rompería el modo estricto.
    await expect(page.getByRole('alert').filter({ hasText: /no se puede leer/ }))
      .toContainText('Otros inmuebles');
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);

    // Y el panel no publica NADA: ni el importe válido ni una masa hereditaria parcial
    const panel = await panelResultados(page);
    expect(panel).not.toContain('100.000,00');
    expect(panel).not.toContain('300,00');
  });

  /**
   * CONTRASTE de las dos reparaciones del 14/09/2026 (hallazgos 815 y 816). Las dos
   * consistieron en DERIVAR del motor un número que iba escrito a mano, y las dos podían
   * haber introducido el defecto simétrico: que la tarjeta pase a decir lo que calcula
   * `calcularSucesion` y la HERRAMIENTA —que tiene su propia aritmética, ver la cabecera de
   * este fichero— siga diciendo otra cosa. Aquí se comprueban las dos bocas a la vez.
   */
  test('815 y 816 — la tarjeta de la viuda y la comparativa de CCAA dicen lo que la herramienta liquida', async ({ page }) => {
    const educativo = await textoCompleto(page);

    // [815] La viuda catalana: ni «57.000 €» de cuota ni «400.000 €» de base liquidable
    expect(educativo).toContain('606,00 €');
    expect(educativo).toContain('515.000,00 €');   // base imponible CON el ajuar del 3 %
    expect(educativo).toContain('415.000,00 €');   // base liquidable
    expect(educativo).not.toMatch(/la cuota, de 57\.000/);

    // [816] La comparativa Asturias/Madrid: 0,00 € y 154,74 €, no «0,00 € y 111,11 €»
    expect(educativo).toContain('liquida 0,00 € en Asturias y 154,74 € en Madrid');
    expect(educativo).not.toContain('111,11');

    // La herramienta, con los datos de la tarjeta de la viuda
    await page.locator('#ccaa-causante').selectOption('cataluna');
    await page.locator('#parentesco').selectOption('I-conyuge');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '500000');
    expect(await cuota(page)).toBe('606,00 €');

    // Y con los de la comparativa: 250.000 €, de los que 200.000 € son la vivienda habitual
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#saldos-cuentas', '#vivienda-habitual']);
    await page.locator('#ccaa-causante').selectOption('asturias');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#vivienda-habitual'), '200000');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '50000');
    expect(await cuota(page)).toBe('0,00 €');

    await page.locator('#ccaa-causante').selectOption('madrid');
    expect(await cuota(page)).toBe('154,74 €');
  });

  /**
   * [817] El plazo de la PRÓRROGA en el faqJsonLd, que es lo que citan ChatGPT, Bing Copilot
   * y Perplexity. Decía «antes de que venza el primer plazo» —los seis meses— cuando el art.
   * 68.1 RISD da CINCO, y quien siguiera esa versión perdía la prórroga y entraba en recargo.
   * Las dos bocas leen ya `PLAZO_ISD`, así que basta con que digan el mismo número.
   */
  test('817 — el faqJsonLd y la página visible dan el mismo plazo de prórroga', async ({ page }) => {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    const json = JSON.parse(faq) as {
      mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }>;
    };
    const plazo = json.mainEntity.find((q) => /plazo/i.test(q.name));
    expect(plazo, 'el FAQPage tiene la pregunta del plazo').toBeTruthy();

    const respuesta = plazo!.acceptedAnswer.text;
    expect(respuesta).toContain('6 meses desde el fallecimiento');
    expect(respuesta).toContain('dentro de los 5 primeros meses');
    expect(respuesta).toContain('RD 1629/1991');
    expect(respuesta, 'la prórroga NO es gratis (art. 68.3)').toContain('intereses de demora');

    // Y la página visible dice lo mismo, no otra cosa
    const visible = await textoCompleto(page);
    expect(visible).toContain('los primeros 5 meses');
    expect(visible).not.toMatch(/prórroga[^.]{0,80}antes de que venza el (primer )?plazo/i);
  });

  /**
   * [818] Los cuatro datos normativos que el 14/09/2026 se importaban sin usar mientras sus
   * cifras iban tecleadas en la prosa. Se comprueba sobre la FUENTE, porque en pantalla los
   * dos caminos dan el mismo texto: lo que distingue a uno del otro es si el número puede
   * separarse del módulo sellado sin que nada lo delate.
   */
  test('818 — los datos normativos de la prosa siguen derivándose de data/fiscal', async () => {
    const fuente = readFileSync(
      join(process.cwd(), 'app/estimador-impuesto-sucesiones/page.tsx'),
      'utf8',
    );
    for (const constante of [
      'REDUCCION_VIVIENDA_MAX_IS',
      'REDUCCION_VIVIENDA_MAX_CATALUNA_IS',
      'REDUCCION_VIVIENDA_MIN_INDIVIDUAL_CATALUNA_IS',
      'REDUCCION_SEGURO_VIDA_MAX_IS',
      'REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_IS',
      'REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS',
    ]) {
      // Importada Y usada: dos apariciones como mínimo, la del import y la del uso.
      const usos = fuente.split(constante).length - 1;
      expect(usos, `${constante} se importa pero no se usa`).toBeGreaterThanOrEqual(2);
    }
  });

  /**
   * [1152 y 1153] La tarjeta del sobrino asturiano, la ÚLTIMA de las cuatro del bloque
   * educativo que seguía con su aritmética tecleada a mano: los 2.400 € de ajuar, los
   * 50.000 € de Asturias, los 24.406,54 € de base liquidable, los 2.081,95 € de cuota
   * íntegra, el 1,5882 y los 3.306,56 € finales. Solo la reducción de parentesco se
   * derivaba. Las cifras eran correctas —verificadas contra la herramienta—, y por eso el
   * testigo no es el VALOR sino la PROCEDENCIA: que la tarjeta salga del mismo
   * `calcularSucesion` que el panel, como ya salen la de Madrid (794), la de la viuda
   * catalana (815) y la comparativa de CCAA (816).
   *
   * El 1153 es la mitad visible del mismo defecto: escrita a mano, la tarjeta ponía punto
   * de millar donde el panel no lo pone, y anunciaba «4,1 % del valor heredado» dividiendo
   * entre los 80.000 € de la cuenta mientras el panel divide entre la base CON ajuar y da
   * 4,01 %. Derivada, las dos cifras salen del mismo sitio.
   */
  test('1152 y 1153 — la tarjeta del sobrino se deriva del motor y usa las cifras del panel', async ({
    page,
  }) => {
    const fuente = readFileSync(
      join(process.cwd(), 'app/estimador-impuesto-sucesiones/page.tsx'),
      'utf8',
    );
    // La tarjeta la escribe el motor, no la memoria: ninguna de sus seis cifras va tecleada.
    // Solo lo que llega al usuario: los comentarios del codigo quedan fuera, igual que en el
    // testigo del hallazgo 1156 en estimador-compraventa-inmueble.
    const jsx = fuente
      .split('\n')
      .map((linea) => linea.trim())
      .filter((linea) => !/^(\/\/|\*|\/\*)/.test(linea))
      .join('\n');
    for (const tecleada of ['24.406,54', '2.081,95', '3.306,56', '1,5882', '4,1%']) {
      expect(jsx, `sigue tecleada en el JSX: ${tecleada}`).not.toContain(tecleada);
    }
    expect(fuente).toContain('EJEMPLO_SOBRINO = calcularSucesion');

    // Y lo que la tarjeta publica es lo que la herramienta liquida con esos mismos datos.
    await page.goto(RUTA);
    await page.locator('select').nth(SELECT.ccaa).selectOption('asturias');
    await page.locator('select').nth(SELECT.parentesco).selectOption('III');
    await importe(page, CAMPO.saldos, '80000');
    // 22/09/2026: 3306,55 € desde el redondeo del 1195 — 2081,95 × 1,5882.
    expect(await cuota(page)).toBe('3306,55 €');

    const texto = await textoCompleto(page);
    // Un solo tipo efectivo para la misma operación, con el denominador del motor
    expect(texto).toContain('4,01');
    expect(texto).not.toContain('4,1% del valor heredado');
  });
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * OPERATIVA EN MÓVIL — 390x844, el viewport de la mitad del tráfico.
 *
 * ⚠️ Esto NO es un test de maquetación: es el testigo del hallazgo 819, que el
 * 14/09/2026 se dio por reparado y NO lo está. Medido el 21/09/2026:
 *
 *     h1 ................................  144 px
 *     LegalNotice .......................  524 px
 *     banda «Descubre Delegum» ..........  590 px  (142 px de alto)
 *     DisclaimerCard ....................  756 px  (725 px de alto)
 *     DataReference ..................... 1513 px  (167 px de alto)
 *     «Qué no incluye esta estimación» .. 1704 px  (473 px de alto)
 *     PRIMER CONTROL (select de CCAA) ... 2308 px  ← 2,73 pantallas
 *     primer campo de importe ........... 3030 px  ← 3,59 pantallas
 *     panel de resultados ............... 3884 px  ← 4,60 pantallas
 *
 * La reparación quitó 196 px de los 2.504 px que medía el acta anterior (un
 * 7,8 %) y el primer control sigue cayendo en la TERCERA pantalla, que es
 * exactamente lo que el hallazgo describía. La segunda pantalla entera
 * (844–1688 px) no contiene ni un encabezado, ni un control, ni un botón.
 *
 * Lo que este bloque fija es el TECHO: que no se vuelva a los 2.504 px de
 * antes. Cuando el hallazgo se repare de verdad, el margen se baja aquí.
 * ─────────────────────────────────────────────────────────────────────────────
 */
test.describe('Estimador ISD — lo que hay por delante del primer control en 390x844', () => {
  // Enumerado en vez de `...devices['Pixel 7']`: un `devices` dentro de un describe
  // forzaría un worker nuevo, y estas cinco opciones no.
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('el primer control no baja de donde ya estaba, y no hay scroll horizontal', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#saldos-cuentas']);

    const medidas = await page.evaluate(() => {
      const arriba = (sel: string): number => {
        const el = document.querySelector(sel);
        if (!el) return -1;
        return Math.round(el.getBoundingClientRect().top + window.scrollY);
      };
      return {
        h1: arriba('h1'),
        primerControl: arriba('#ccaa-causante'),
        primerImporte: arriba('#saldos-cuentas'),
        anchoScroll: document.documentElement.scrollWidth,
      };
    });

    // El h1 sí está en la primera pantalla (144 px medidos)
    expect(medidas.h1).toBeGreaterThan(0);
    expect(medidas.h1).toBeLessThan(400);

    // Sin desbordamiento lateral: el CLAUDE.md global exige 16 px de margen y 0 scroll
    expect(medidas.anchoScroll).toBe(390);

    /*
      TECHO, bajado a la medida real tras REPARAR el hallazgo 1151 el 21/09/2026: los avisos
      pasaron debajo de la herramienta —posición 6 de la estructura estándar— y el primer
      control subió de 2.308 px a 862 px. El margen que queda absorbe las diferencias de
      renderizado de la banda «Descubre Delegum», no es un colchón para volver a meter
      bloques por encima del formulario.
    */
    expect(
      medidas.primerControl,
      'algo ha vuelto a crecer por encima del formulario',
    ).toBeLessThan(900);
    expect(medidas.primerImporte).toBeLessThan(1700);
    /*
      Lo que el acta del 1151 pedía: algo accionable en la 1.ª o la 2.ª pantalla. El select de
      la CCAA cae a 862 px —18 px dentro de la segunda— y su encabezado «Datos del Heredero»
      queda ya en la primera. Lo que hay por delante es el hero, el LegalNotice y la banda
      «Descubre Delegum», que son componentes compartidos de todo el catálogo.
    */
    expect(medidas.primerControl, 'el primer control cae en la 2.ª pantalla').toBeLessThan(844 * 2);
  });
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * RE-INSPECCIÓN 22/09/2026
 *
 * Tres casos nuevos, resueltos a mano con las constantes de `data/fiscal/sucesiones.ts`
 * ANTES de ejecutar la app, sobre dos comunidades que ninguna corrida anterior había
 * tocado: Castilla-La Mancha y Cantabria, las dos únicas del catálogo cuya bonificación
 * es `escalonado` —tramos PLANOS sobre la base liquidable, no la escala ponderada de
 * Cataluña—, y que por tanto ejecutan una rama de `aplicarBonificacion` que hasta hoy no
 * había ejecutado ningún test.
 *
 * Y dos testigos de lo que esta re-inspección encontró roto, marcados con `test.fail()`
 * porque la reparación no es cosa del Inspector: cuando se arreglen, empezarán a pasar y
 * Playwright lo dirá («expected to fail, but passed»), que es justo el aviso que hace
 * falta para venir aquí a quitar la marca.
 * ─────────────────────────────────────────────────────────────────────────────
 */
test.describe('re-inspección 22/09/2026', () => {
  /** SOLO la columna de resultados: los mismos importes viven también en la guía. */
  const panelResultados = async (page: Page): Promise<string> =>
    (await page.locator('[class*="resultsPanel"]').innerText()).split(' ').join(' ');

  /** «4056,03 €» → 4056.03, para comparar magnitudes y no cadenas. */
  const aNumero = (texto: string): number =>
    Number(texto.replace(/[^\d.,-]/g, '').split('.').join('').replace(',', '.'));

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#saldos-cuentas', '#vivienda-habitual', '#porcentaje-herencia']);
  });

  /**
   * CASO NORMAL — hijo de 21 o más (Grupo II) que hereda 250.000 € en cuentas en
   * CASTILLA-LA MANCHA, cuya bonificación es la única del catálogo con CINCO tramos
   * planos (`BONIFICACIONES_CCAA_IS['castilla-mancha']...escalonado`): 100 % hasta
   * 175.000 €, 95 % hasta 225.000 €, 90 % hasta 275.000 €, 85 % hasta 300.000 € y 80 %
   * por encima, decidido por la base LIQUIDABLE. Elegido a propósito el tramo del 90 %,
   * que es interior: un fallo en la selección del tramo se iría al 100 % (cuota cero) o
   * al 80 % (el doble de cuota), y las dos cifras seguirían pareciendo plausibles.
   *
   *   Activos            250.000,00   (saldos en cuentas)
   *   + ajuar 3 %           7.500,00   PORC_AJUAR_DOMESTICO_IS
   *   = base imponible   257.500,00
   *   − parentesco         15.956,87   REDUCCIONES_PARENTESCO_IS['II'] (art. 20.2.a LISD)
   *   = base liquidable  241.543,13   → cae en el tramo «hasta 275.000» → 90 %
   *   cuota íntegra       40.560,31    TARIFA_ESTATAL_IS, tramo «hasta 398.777,54»:
   *                                    40.011,04 + 25,50 % × (241.543,13 − 239.389,13)
   *   × coeficiente           1,0000   COEFICIENTES_IS['II'][0] (patrimonio < 402.678 €)
   *   − bonificación 90 %  36.504,28
   *   = cuota final        4056,03 €   (tipo efectivo 1,58 %)
   */
  test('caso normal: hijo ≥21 en Castilla-La Mancha con 250.000 € paga 4056,03 €', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('castilla-mancha');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '250000');

    expect(await cuota(page)).toBe('4056,03 €');

    const panel = await panelResultados(page);
    expect(panel).toContain('7500,00 €');      // ajuar del 3 %
    expect(panel).toContain('257.500,00 €');   // base imponible
    expect(panel).toContain('15.956,87 €');    // reducción del art. 20.2.a
    expect(panel).toContain('241.543,13 €');   // base liquidable
    expect(panel).toContain('40.560,31 €');    // cuota íntegra, tramo del 25,50 %
    expect(panel).toContain('36.504,28 €');    // bonificación del 90 %
    // El rótulo tiene que decir 90: con el tramo de al lado serían 0,00 € u 8112,06 €
    expect(panel).toContain('Bonificación 90 % (Castilla-La Mancha)');
    expect(panel).toContain('Tipo efectivo: 1,58%');
  });

  /**
   * CASO LÍMITE — el escalón de CANTABRIA, que su ficha declara como
   * `escalonado: [{ hasta: 100000, porcentaje: 1.00 }, { desde: 100000, porcentaje: 0.99 }]`.
   * No es una escala ponderada: es un acantilado sobre la base LIQUIDABLE, y basta un
   * céntimo para caer por él.
   *
   * El céntimo se mete en los ACTIVOS, no en la base, porque así se comprueba de paso que
   * el ajuar del 3 % viaja con él: 1 cts. de herencia son 1,03 cts. de base liquidable.
   *
   *   (a) Activos        112.579,48 → + ajuar 3.377,38 = base imponible 115.956,86
   *       − parentesco    15.956,87   REDUCCIONES_PARENTESCO_IS['II']
   *       = base liquid.  99.999,99  ≤ 100.000 → EXENCIÓN TOTAL (tramo del 100 %)
   *       cuota íntegra   12.415,36   TARIFA_ESTATAL_IS, tramo «hasta 119.757,67»:
   *                                   9.166,06 + 16,15 % × (99.999,99 − 79.880,52)
   *       = cuota final        0,00 €
   *
   *   (b) Activos        112.579,49 → + ajuar 3.377,38 = base imponible 115.956,87
   *       = base liquid. 100.000,00  > 100.000 → ya no exime: bonificación del 99 %
   *       cuota íntegra   12.415,36
   *       − bonificación  12.291,21
   *       = cuota final      124,15 €  (tipo efectivo 0,11 %)
   *
   * UN CÉNTIMO de herencia convierte una cuota de cero en 124,15 €.
   */
  test('caso límite: en Cantabria un céntimo más de herencia pasa de 0,00 € a 124,15 €', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('cantabria');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '112579,48');

    expect(await cuota(page)).toBe('0,00 €');
    const bajoElEscalon = await panelResultados(page);
    expect(bajoElEscalon).toContain('112.579,48 €');  // el importe se leyó con coma decimal
    expect(bajoElEscalon).toContain('3377,38 €');     // ajuar del 3 %
    expect(bajoElEscalon).toContain('99.999,99 €');   // base liquidable, aún bajo el escalón
    expect(bajoElEscalon).toContain('12.415,36 €');   // cuota íntegra del tramo del 16,15 %
    expect(bajoElEscalon).toContain('Bonificación 100 % (Cantabria)');

    await sembrarValor(page, page.locator('#saldos-cuentas'), '112579,49');

    expect(await cuota(page)).toBe('124,15 €');
    const sobreElEscalon = await panelResultados(page);
    expect(sobreElEscalon).toContain('100.000,00 €');  // base liquidable, ya en el escalón
    // 22/09/2026 (hallazgo 1195): 12.415,36 − 12.291,21 = 124,15, la cuota final que esta misma
    // prueba fija arriba. Antes daba 124,16 y mostraba 124,15.
    expect(sobreElEscalon).toContain('12.291,21 €');   // bonificación del 99 %
    expect(sobreElEscalon).toContain('Bonificación 99 % (Cantabria)');
    expect(sobreElEscalon, 'sigue eximiendo pasado el escalón').not.toContain('Bonificación 100 %');
  });

  /**
   * CASO A RECHAZAR — DOS importes ilegibles a la vez, uno en los bienes y otro en las
   * deudas: «doscientos mil» en los saldos y «-1.000» en la hipoteca.
   *
   * Las cuatro corridas anteriores probaron un solo campo ilegible cada vez, así que la
   * rama PLURAL del aviso —«Hay importes que no se pueden leer»— y el `join` de la lista
   * no los había ejecutado nadie. Y los dos campos vienen de listas distintas
   * (`CAMPOS_BIENES` y `CAMPOS_DEUDAS`), que es donde un índice desplazado nombraría un
   * campo que en pantalla se llama de otra manera.
   *
   * Son además los dos motivos de rechazo que existen y no la misma forma dos veces: uno
   * no es un número (`parseSpanishNumber` devuelve NaN) y el otro es negativo, que el
   * 11/09/2026 AUMENTABA la masa hereditaria en vez de restarla (hallazgo 740).
   *
   * Y después, corregidos los dos, la app tiene que volver a dar cifra y haber restado
   * de verdad la deuda:
   *   Activos 200.000,00 − deudas 1.000,00 = masa 199.000,00
   *   + ajuar 5.970,00 = base imponible 204.970,00 − 15.956,87 = base liquidable 189.013,13
   *   cuota íntegra 29.306,14 = 23.063,25 + 21,25 % × (189.013,13 − 159.634,83)
   *   − bonificación 99 % de Madrid 29.013,08 = cuota final 293,06 €
   */
  test('caso a rechazar: dos importes ilegibles a la vez se nombran los DOS y no sale ninguna cifra', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('madrid');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), 'doscientos mil');
    await sembrarValor(page, page.locator('#hipotecas'), '-1.000');

    // Acotado al aviso de la app: `getByRole('alert')` casa también con el anunciador de
    // rutas de Next (#__next-route-announcer__) y rompería el modo estricto.
    const aviso = page.getByRole('alert').filter({ hasText: /no se puede[n]? leer/ });
    await expect(aviso).toContainText('Hay importes que no se pueden leer');
    await expect(aviso).toContainText('Saldos en cuentas bancarias');
    await expect(aviso).toContainText('Hipotecas y préstamos hipotecarios');
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);

    // Ni una cifra parcial: ni la masa, ni el ajuar, ni una deuda tomada como cero
    const panel = await panelResultados(page);
    expect(panel).not.toContain('Base imponible total');
    expect(panel).not.toContain('CUOTA A INGRESAR');

    // Corregidos los dos, vuelve la estimación y la deuda está REALMENTE restada
    await sembrarValor(page, page.locator('#saldos-cuentas'), '200000');
    await sembrarValor(page, page.locator('#hipotecas'), '1000');

    expect(await cuota(page)).toBe('293,06 €');
    const conCifra = await panelResultados(page);
    expect(conCifra).toContain('199.000,00 €');   // masa hereditaria NETA, ya sin la deuda
    expect(conCifra).toContain('204.970,00 €');   // base imponible con el ajuar
    expect(conCifra).toContain('189.013,13 €');   // base liquidable
    expect(conCifra).toContain('29.306,14 €');    // cuota íntegra, tramo del 21,25 %
  });

  /**
   * ⚠️ HALLAZGO 22/09/2026 — la reparación del 1152 (21/09) NO cerró la divergencia.
   *
   * La tarjeta «Sobrino hereda cuenta bancaria» pasó a derivarse de `calcularSucesion`
   * para dejar de teclear sus cifras, y con eso se arreglaron los separadores de millar.
   * Pero el número quedó igual de separado del panel, por dos motivos distintos:
   *
   *  1. El TIPO EFECTIVO. El motor lo calcula sobre `p.baseImponible`, que es la base SIN
   *     ajuar (80.000 €) → 4,13 %. La app lo calcula sobre `baseAjustada`, que sí lo
   *     lleva (82.400 €) → 4,01 %. La tarjeta publica el del motor y lo rotula «% de la
   *     base con ajuar», que es precisamente el denominador que NO ha usado: 3306,55 /
   *     82.400 = 4,01 %, no 4,13 %. El rótulo que el 1152 añadió para explicar la cifra
   *     es el que demuestra que la cifra es la otra.
   *  2. La CUOTA. El motor redondea a céntimo en cada paso y la app no: la cuota íntegra
   *     vale 2081,95436 €, que el motor deja en 2081,95 antes de multiplicar por el
   *     coeficiente 1,5882. De ahí 3306,55 € en la tarjeta y 3306,56 € en el panel, para
   *     los mismos 80.000 € de la misma comunidad. Derivar del motor una tarjeta que
   *     ilustra a la app NO puede hacerlas coincidir mientras las dos aritméticas
   *     redondeen en sitios distintos.
   */
  test('1194+1195 (regresión) — la tarjeta del sobrino publica el MISMO tipo efectivo y la misma cuota que el panel', async ({ page }) => {
    // Lo que la HERRAMIENTA liquida con esos datos.
    //
    // ⚠️ 22/09/2026 — la cuota pasa de 3306,56 € a 3306,55 € y el cambio es la reparación del
    // 1195: la app multiplicaba el coeficiente del art. 22 LISD por los 2081,95436 € de su
    // aritmética interna mientras imprimía en pantalla «Cuota íntegra 2081,95 €», así que su
    // propio desglose no cuadraba consigo mismo por un céntimo. El motor —y el modelo 650—
    // parten del importe liquidado. Este testigo fijaba la cifra vieja desde el 21/09.
    await page.locator('#ccaa-causante').selectOption('asturias');
    await page.locator('#parentesco').selectOption('III');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '80000');
    expect(await cuota(page)).toBe('3306,55 €');
    expect(await panelResultados(page)).toContain('Tipo efectivo: 4,01%');
    // El desglose cuadra con lo que se lee: 2081,95 × 1,5882 = 3306,5535… → 3306,55
    expect(await panelResultados(page)).toContain('2081,95 €');

    // Lo que la TARJETA del bloque educativo dice de esos mismos datos
    const todo = await textoCompleto(page);
    const desde = todo.indexOf('Sobrino hereda cuenta bancaria');
    const hasta = todo.indexOf('Viuda hereda empresa familiar');
    const tarjeta = todo.slice(desde, hasta);
    expect(tarjeta, 'la tarjeta no está donde se esperaba').toContain('Asturias');

    expect(tarjeta, 'la tarjeta publica la misma cuota que el panel').toContain('3306,55 €');
    expect(tarjeta, 'el tipo efectivo sobre la base CON ajuar es 4,01 %').toContain('4,01 %');
    // Y no queda rastro del denominador viejo: 3306,55 / 80.000 = 4,13 %, que es la división
    // que el rótulo «% de la base con ajuar» decía no haber hecho (hallazgo 1194).
    expect(tarjeta).not.toContain('4,13 %');
  });

  /**
   * ⚠️ HALLAZGO 22/09/2026 — Cataluña prorratea el VALOR de la vivienda entre herederos,
   * pero no su TOPE.
   *
   * El art. 17 de la Ley 19/2010 limita la reducción por vivienda habitual a 500.000 €
   * «sobre el valor conjunto» y reparte ese límite entre los sujetos pasivos en
   * proporción a su participación, con un suelo individual de 180.000 €. Que el
   * prorrateo existe lo dice `data/fiscal/sucesiones.ts` en el comentario de
   * `REDUCCION_VIVIENDA_MIN_INDIVIDUAL_CATALUNA_IS` («el límite individual resultante del
   * prorrateo no puede bajar de esta cifra»), y lo dice la PROSA de esta misma página:
   * «500.000,00 € sobre el valor conjunto de la vivienda, con un mínimo de 180.000,00 €
   * por heredero tras el prorrateo».
   *
   * El cálculo no lo hace. `evaluarReduccionVivienda` recibe la vivienda ya prorrateada
   * (`v_vivienda * porcHerencia`) y se le deja vacío `limiteViviendaCataluna`, de modo que
   * a CADA heredero se le aplica el tope CONJUNTO entero. El motor avisa de esto en su
   * propia firma: ese parámetro existe «para quien conoce el valor conjunto de la vivienda
   * y el reparto», y esta app conoce los dos.
   *
   *   Vivienda habitual 1.200.000,00 €, hijo ≥21 que recibe el 50 %
   *   base imponible 1.236.000,00 → base ajustada al 50 % = 618.000,00
   *   − parentesco 100.000,00                REDUCCIONES_PARENTESCO_CATALUNA_IS['II']
   *   − vivienda: 95 % × 600.000 = 570.000, topado en...
   *        · lo que hace la app:  500.000,00  (el tope CONJUNTO)
   *        · lo que dice el art. 17: 250.000,00  (500.000 × 50 %, por encima del suelo
   *          de 180.000 €)
   *   = base liquidable   18.000,00 (app)   frente a  268.000,00 (art. 17)
   *   cuota íntegra        1260,00          frente a   34.560,00   TARIFA_CATALUNA_IS
   *   − bonificación 48,90 % del art. 58 bis, ponderada sobre los 618.000 € de base
   *   = cuota final         643,86 €        frente a   17.660,27 €
   *
   * 27 veces menos impuesto del que resulta de la norma que la propia página cita. Y con
   * el 25 % la app liquida 0,00 € donde el prorrateo —ahí ya en su suelo de 180.000 €—
   * da 919,41 €: «no pagas nada» es la forma más cara de equivocarse en un riesgo 1.
   */
  test('1193 (regresión) — Cataluña prorratea entre herederos el tope de 500.000 € de la vivienda', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('cataluna');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#vivienda-habitual'), '1200000');
    await sembrarValor(page, page.locator('#porcentaje-herencia'), '50');

    const panel = await panelResultados(page);
    expect(panel, 'la base ajustada al 50 % sí se prorratea').toContain('618.000,00 €');

    // El tope individual es 500.000 × 50 % = 250.000 €, no los 500.000 € del conjunto
    expect(panel, 'el tope de la vivienda va sin prorratear').toContain('250.000,00 €');

    // Y la cuota que sale de ahí, con el mismo 48,90 % de bonificación del art. 58 bis.
    // Tolerancia de medio euro: el defecto que vigila son 17.016 €.
    expect(aNumero(await cuota(page))).toBeCloseTo(17660.27, 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Hallazgo 1196 del 22/09/2026 — la valoración del usufructo, con su norma y su techo
// ═══════════════════════════════════════════════════════════════════════════════
//
// La regla iba TECLEADA (`Math.max(0.10, (89 - edad) / 100)`) y sin norma al lado, en una app
// donde el plazo y los años de mantenimiento de la vivienda sí estaban sellados. Y sin el
// artículo delante se había quedado sin su techo: el «89 − edad» es la forma abreviada y solo
// vale desde los 20 años, mientras el campo admite escribir 10. Verificado el 22/09/2026 contra
// el texto consolidado del BOE (art. 26.a LISD): en los usufructos vitalicios el valor «es igual
// al 70 por 100 del valor total de los bienes cuando el usufructuario cuente menos de veinte
// años, minorando […] un 1 por 100 menos por cada año más, con el límite mínimo del 10 por 100».
test.describe('1196 — valoración del usufructo vitalicio (art. 26.a LISD)', () => {
  /** SOLO la columna de resultados: los porcentajes viven también en la guía de abajo. */
  const panelResultados = async (page: Page): Promise<string> =>
    (await page.locator('[class*="resultsPanel"]').innerText()).replace(/ /g, ' ');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#saldos-cuentas']);
  });

  /**
   * Con 15 años la app aplicaba el 74 % —(89 − 15) / 100—, por encima del máximo legal, y eso
   * sobrevalora la base del usufructuario e infravalora la del nudo propietario.
   *
   * Madrid · hijo ≥21 · 100.000 € en cuentas · usufructo, usufructuario de 15 años:
   *   base imponible con ajuar = 100.000 × 1,03 = 103.000,00
   *   × 70 % (art. 26.a, menor de 20 años)      =  72.100,00   ← antes 76.220,00 al 74 %
   */
  test('por debajo de los 20 años el porcentaje es el 70 %, no «89 − edad»', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('madrid');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');
    await page.getByLabel('Usufructo', { exact: true }).check();
    await sembrarValor(page, page.locator('#edad-usufructuario'), '15');

    const panel = await panelResultados(page);
    expect(panel, 'el tipo de adquisición aplicado es el 70 % del art. 26.a').toContain('70,0%');
    expect(panel, 'la base ajustada es 103.000 × 70 %').toContain('72.100,00 €');
    // El 74 % que salía de la fórmula sin techo, y su base.
    expect(panel).not.toContain('74,0%');
    expect(panel).not.toContain('76.220,00 €');
  });

  /**
   * Y desde los 20 la fórmula del artículo sigue valiendo: 89 − 20 = 69 %, que es justo un
   * punto por debajo del techo. Es el control que impide «reparar» poniendo un 70 % plano.
   */
  test('a partir de los 20 años se aplica «89 − edad», y a los 79 se topa en el 10 %', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('madrid');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');
    await page.getByLabel('Usufructo', { exact: true }).check();

    await sembrarValor(page, page.locator('#edad-usufructuario'), '20');
    expect(await panelResultados(page)).toContain('69,0%');

    await sembrarValor(page, page.locator('#edad-usufructuario'), '79');
    expect(await panelResultados(page)).toContain('10,0%');

    // El suelo del 10 % no se perfora pasados los 79.
    await sembrarValor(page, page.locator('#edad-usufructuario'), '89');
    expect(await panelResultados(page)).toContain('10,0%');
  });

  /** El helper del campo cita la norma, como el resto de los datos normativos de la página. */
  test('el campo de la edad cita el art. 26.a y dice el techo, no solo la fórmula', async ({ page }) => {
    await page.locator('#parentesco').selectOption('II');
    await page.getByLabel('Usufructo', { exact: true }).check();

    const helper = await page.locator('#edad-usufructuario').locator('xpath=following-sibling::span[1]').innerText();
    expect(helper).toContain('art. 26.a) de la Ley 29/1987 del ISD');
    expect(helper).toContain('70% hasta los 20 años');
    expect(helper).toContain('mínimo del 10%');
  });
});
