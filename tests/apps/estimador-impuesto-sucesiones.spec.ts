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
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  BONIFICACIONES_CCAA_IS,
  FISCAL_SUCESIONES_CATALUNA_META,
  FISCAL_SUCESIONES_META,
  PLAZO_ISD,
} from '../../data/fiscal/sucesiones';
import { calcularSucesion } from '../../lib/calculadoras/sucesiones';

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
    await expect(page.getByText(/Bonificación autonómica: 99,0\s%/)).toBeVisible();
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
    expect(texto).not.toMatch(/5\s?% si tardas hasta 3 meses/);
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
    expect(panel).toContain('Tipo efectivo: 64,85 %');

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
   *   (1.000.000 + 10.000 de seguro + 30.000 de ajuar de las CUENTAS) × 50 % = 520.000,00
   *   — hasta el 25/09/2026 el seguro también generaba ajuar y daba 520.150,00 (hallazgo 1824)
   *   − 15.956,87 (parentesco II) − 5.000 (seguro) − 300.000 (Asturias) = 199.043,13
   *   tarifa estatal, tramo «hasta 239.389,13»:
   *     23.063,25 + 21,25 % × (199.043,13 − 159.634,83) = 31.437,51
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
    expect(texto).toContain('Tipo efectivo: 0,00 %');
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
    expect(texto).toContain('100,00 %');
    expect(texto).toContain('capado al 100');
    expect(texto).not.toMatch(/Porcentaje de herencia\s*150(,00)?\s?%/);
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
    expect(fuente).not.toMatch(/4,0625\s?%/);
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
    expect(panel).toContain('Tipo efectivo: 0,02 %');
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
    expect(sobreElLimite).toContain('Tipo efectivo: 31,50 %');
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
    expect(panel).toContain('Tipo efectivo: 0,97 %');
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
    // Desde el 27/09/2026 (hallazgo 2331) la página lo redacta como el art. 68.1 RISD y el
    // faqJsonLd, «dentro de los 5 primeros meses»; «antes de los primeros 5 meses» y, sobre todo,
    // «antes del mes 5» —que es un mes menos— quedan fuera.
    const visible = await textoCompleto(page);
    expect(visible).toContain(`dentro de los ${PLAZO_ISD.mesesParaPedirProrroga} primeros meses`);
    expect(visible).not.toMatch(/antes del mes \d/);
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
    expect(texto).not.toMatch(/4,1\s?% del valor heredado/);
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
 * Y dos testigos de lo que esta re-inspección encontró roto (1193 y 1194+1195), que iban
 * marcados con `test.fail()` mientras estuvieron abiertos. REPARADOS: ya sin la marca, siguen
 * aquí como testigos de regresión (la base no tiene ningún hallazgo abierto de esta app a
 * 30/09/2026).
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
    expect(panel).toContain('Tipo efectivo: 1,58 %');
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
    expect(await panelResultados(page)).toContain('Tipo efectivo: 4,01 %');
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
    expect(panel, 'el tipo de adquisición aplicado es el 70 % del art. 26.a').toContain('70,0 %');
    expect(panel, 'la base ajustada es 103.000 × 70 %').toContain('72.100,00 €');
    // El 74 % que salía de la fórmula sin techo, y su base.
    expect(panel).not.toMatch(/74,0\s?%/);
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
    expect(await panelResultados(page)).toContain('69,0 %');

    await sembrarValor(page, page.locator('#edad-usufructuario'), '79');
    expect(await panelResultados(page)).toContain('10,0 %');

    // El suelo del 10 % no se perfora pasados los 79.
    await sembrarValor(page, page.locator('#edad-usufructuario'), '89');
    expect(await panelResultados(page)).toContain('10,0 %');
  });

  /** El helper del campo cita la norma, como el resto de los datos normativos de la página. */
  test('el campo de la edad cita el art. 26.a y dice el techo, no solo la fórmula', async ({ page }) => {
    await page.locator('#parentesco').selectOption('II');
    await page.getByLabel('Usufructo', { exact: true }).check();

    const helper = await page.locator('#edad-usufructuario').locator('xpath=following-sibling::span[1]').innerText();
    expect(helper).toContain('art. 26.a) de la Ley 29/1987 del ISD');
    expect(helper.replace(/\u00a0/g, ' ')).toContain('70 % hasta los 20 años');
    expect(helper.replace(/\u00a0/g, ' ')).toContain('mínimo del 10 %');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Inspector 25/09/2026 — re-inspección: tres casos propios y un testigo por hallazgo
// ═══════════════════════════════════════════════════════════════════════════════
//
// Los tres casos estrenan comunidad: Región de Murcia (la bonificación del 50 % al Grupo III,
// que ningún test ejecutaba), Extremadura (el Grupo I con la reducción por edad a CERO años,
// la discapacidad del 65 % y el tramo del 34 %, todo a la vez) y Galicia con el Grupo III, sin
// bonificación. Cada cifra esperada sale de `data/fiscal/sucesiones.ts`, con la constante y el
// tramo citados en el desarrollo, y se resolvió a mano ANTES de abrir la app.
//
// Lo que esta re-inspección encontró roto iba con `test.fail()` y afirmaba lo CORRECTO. Los 13
// hallazgos (1821-1833) se repararon el mismo 25/09/2026 y las marcas se retiraron: cada testigo
// sigue vigilando su caso. Donde el testigo exigía una grafía (el «3.990,72» del 1826), se
// ajustó a la del catálogo y se dice en su línea.
test.describe('Inspector 25/09/2026', () => {
  /** SOLO la columna de resultados, con los espacios duros normalizados a espacio. */
  const panel = async (page: Page): Promise<string> =>
    (await page.locator('[class*="resultsPanel"]').innerText()).split(' ').join(' ');

  /** El importe destacado: «Impuesto estimado en …». */
  const cuotaDestacada = async (page: Page): Promise<string> =>
    (
      await page
        .getByText(/^Impuesto estimado en/)
        .locator('xpath=following-sibling::span[1]')
        .innerText()
    )
      .split(' ')
      .join(' ');

  /** El importe (columna derecha) de la línea del desglose cuyo concepto casa con `concepto`. */
  const importeDeLinea = async (page: Page, concepto: RegExp): Promise<string> =>
    (
      await page
        .locator('[class*="resultsPanel"] div[class*="linea"]')
        .filter({ hasText: concepto })
        .first()
        .locator('span')
        .last()
        .innerText()
    )
      .split(' ')
      .join(' ');

  /** «18.437,27 €» → 18437.27, para comparar magnitudes y no cadenas. */
  const aNumero = (texto: string): number =>
    Number(texto.replace(/[^\d.,-]/g, '').split('.').join('').replace(',', '.'));

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#saldos-cuentas', '#porcentaje-herencia']);
  });

  /**
   * CASO NORMAL — sobrino (Grupo III) en la REGIÓN DE MURCIA, 100.000 € en cuentas,
   * patrimonio preexistente < 402.678 €. Murcia es, con Madrid, la única del régimen común
   * que bonifica al Grupo III en cuota: `BONIFICACIONES_CCAA_IS['murcia']…['III'] = 0,50`.
   *
   *   Activos            100.000,00
   *   + ajuar 3 %          3000,00   PORC_AJUAR_DOMESTICO_IS (art. 15 LISD)
   *   = base imponible   103.000,00
   *   − parentesco         7993,46   REDUCCIONES_PARENTESCO_IS['III'] (art. 20.2.a LISD)
   *   = base liquidable   95.006,54
   *   cuota íntegra       11.608,91  TARIFA_ESTATAL_IS, tramo «hasta 119.757,67»:
   *                                  9.166,06 + 16,15 % × (95.006,54 − 79.880,52) = 11.608,91223
   *   × 1,5882                       COEFICIENTES_IS['III'][0]
   *   = cuota tributaria  18.437,27  (11.608,91 × 1,5882 = 18.437,270862)
   *   − bonificación 50 %  9218,64   (9218,635431, se publica redondeada)
   *   = cuota final       9218,63 €  (18.437,27 − 9218,64), que es lo que da `calcularSucesion`
   *
   * La cuota final se compara con precisión de 0,05 €: lo que este caso vigila —el tramo, el
   * coeficiente del Grupo III, el 50 % de Murcia— mueve cientos de euros, y el céntimo de
   * diferencia que daba la app (9218,64 €) fue un hallazgo aparte (1823, REPARADO el
   * 25/09/2026 en d8b01146) con su propio testigo.
   */
  test('caso normal: sobrino en Murcia con 100.000 € paga 9218,63 € tras la bonificación del 50 %', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('murcia');
    await page.locator('#parentesco').selectOption('III');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');

    const texto = await panel(page);
    expect(texto).toContain('103.000,00 €');   // base imponible con el ajuar
    expect(texto).toContain('7993,46 €');      // reducción del Grupo III
    expect(texto).toContain('95.006,54 €');    // base liquidable
    expect(texto).toContain('11.608,91 €');    // cuota íntegra, tramo del 16,15 %
    expect(texto).toContain('×1,5882');        // coeficiente del Grupo III
    expect(texto).toContain('18.437,27 €');    // cuota tributaria
    expect(texto).toContain('Bonificación 50,0 % (Región de Murcia)');
    expect(texto).toMatch(/Tipo efectivo: 8,95 ?%/); // 9218,64 / 103.000
    expect(aNumero(await cuotaDestacada(page))).toBeCloseTo(9218.63, 1);
  });

  /**
   * CASO LÍMITE — EXTREMADURA, descendiente de CERO años (Grupo I) con discapacidad del 65 % o
   * más, que hereda 2.000.000 € en cuentas: el límite inferior de la edad, el tope del art.
   * 20.2.a y el tramo más alto de la tarifa, a la vez.
   *
   *   Activos          2.000.000,00
   *   + ajuar 3 %         60.000,00
   *   = base imponible 2.060.000,00
   *   − parentesco        15.956,87   REDUCCIONES_PARENTESCO_IS['I-descendiente']
   *   − edad              31.901,72   min(15.956,87 + 21 × 3990,72 ; 47.858,59) − 15.956,87
   *                                   REDUCCION_EDAD_MENOR_21_IS / …_MAX_IS (el tope es del TOTAL)
   *   − discapacidad     150.253,03   REDUCCION_DISCAPACIDAD_65_IS
   *   = base liquidable 1.861.888,38
   *   cuota íntegra     561.164,72   TARIFA_ESTATAL_IS, último tramo:
   *                                   199.291,40 + 34 % × (1.861.888,38 − 797.555,08)
   *   × 1,0000                        COEFICIENTES_IS['I'][0]
   *   − bonificación 99 % 555.553,07  BONIFICACIONES_CCAA_IS['extremadura']…['I-descendiente']
   *   = cuota final        5611,65 €  (561.164,72 × 1 %, = 561.164,72 − 555.553,07)
   */
  test('caso límite: en Extremadura un heredero de 0 años con discapacidad ≥65 % y 2 M€ paga 5611,65 €', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('extremadura');
    await page.locator('#parentesco').selectOption('I-descendiente');
    await sembrarValor(page, page.locator('#edad-heredero'), '0');
    await page.getByRole('radio', { name: /≥\s*65\s*%/ }).check();
    await sembrarValor(page, page.locator('#saldos-cuentas'), '2000000');

    expect(await cuotaDestacada(page)).toBe('5611,65 €');
    const texto = await panel(page);
    expect(texto).toContain('2.060.000,00 €');   // base imponible con ajuar
    expect(texto).toContain('31.901,72 €');      // edad, ya topada en el total de 47.858,59 €
    expect(texto).toContain('150.253,03 €');     // discapacidad del 65 % o más
    expect(texto).toContain('1.861.888,38 €');   // base liquidable
    expect(texto).toContain('561.164,72 €');     // cuota íntegra, tramo del 34 %
    expect(texto).toContain('555.553,07 €');     // bonificación del 99 %
    expect(texto).toContain('Bonificación 99,0 % (Extremadura)');
  });

  /**
   * CASO A RECHAZAR — un porcentaje de herencia NEGATIVO.
   *
   * Galicia no bonifica al Grupo III (`BONIFICACIONES_CCAA_IS['galicia']…['III'] = 0`), así que
   * con el 100 % un hermano que hereda 100.000 € en cuentas paga la cuota tributaria entera:
   *   103.000,00 − 7993,46 = 95.006,54 → 11.608,91 × 1,5882 = 18.437,27 €
   * Con «-50» el campo no dice nada legible: la app debe abstenerse y nombrar el campo, como hace
   * con los importes negativos desde el hallazgo 740 («o se lee el importe, o no se da número»).
   *
   * REPARADO — hallazgo 1822 (medio, Inspector 25/09/2026; d8b01146): lo capaba a 0 en
   * silencio, enseñaba «Porcentaje de herencia 0,00 %», base ajustada 0,00 € y publicaba
   * «Impuesto estimado en Galicia 0,00 €». Re-verificado en el navegador el 27/09/2026.
   */
  test('caso a rechazar: un porcentaje de herencia negativo no da cuota cero, da un aviso', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('galicia');
    await page.locator('#parentesco').selectOption('III');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');
    // Con el 100 % del campo (su valor inicial) sí hay cifra, y es la cuota tributaria entera
    expect(await cuotaDestacada(page)).toBe('18.437,27 €');

    await sembrarValor(page, page.locator('#porcentaje-herencia'), '-50');
    const aviso = page.getByRole('alert').filter({ hasText: /porcentaje/i });
    await expect(aviso).toBeVisible();
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);
  });

  /**
   * REPARADO — hallazgo 1830 (bajo, Inspector 25/09/2026; d8b01146): la fecha del hero iba en ISO.
   *
   * page.tsx pintaba `FISCAL_SUCESIONES_META.verificado` tal cual —«Datos verificados:
   * 2025-01-01»—, mientras el <DataReference> de la MISMA página formatea el mismo campo y dice
   * «Última verificación: 01/01/2025». Es la forma del hallazgo 1657 de estimador-sueldo-neto.
   * Lo esperado se deriva del sello (hoy '2025-01-01' → '01/01/2025') para que re-sellar el
   * módulo no rompa el testigo.
   */
  test('la fecha de verificación del hero va en DD/MM/AAAA, como la del DataReference', async ({ page }) => {
    const [anio, mes, dia] = FISCAL_SUCESIONES_META.verificado.split('-');
    const esperada = `${dia}/${mes}/${anio}`;

    const referencia = await page.getByRole('note', { name: 'Datos de referencia normativos' }).innerText();
    expect(referencia, 'el DataReference ya la formatea bien').toContain(esperada);

    const hero = await page.locator('[class*="metaVerificado"]').innerText();
    expect(hero).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(hero).toContain(`Datos verificados: ${esperada}`);
  });

  /**
   * REPARADO — hallazgo 1823 (bajo, Inspector 25/09/2026; d8b01146): el desglose no cuadraba
   * consigo mismo por un céntimo.
   *
   * El 1195 hizo que el coeficiente se aplicara a la cuota íntegra REDONDEADA, pero la
   * bonificación seguía restándose sin redondear: con el caso normal de Murcia el panel imprimía
   * «Cuota tributaria 18.437,27 €», «– Bonificación 9218,64 €» y «CUOTA A INGRESAR 9218,64 €»,
   * y 18.437,27 − 9218,64 = 9218,63. `calcularSucesion` —el que escribe las tarjetas de esta
   * misma página y la tool del MCP— resta la bonificación publicada y da 9218,63 €.
   */
  test('la cuota final es la cuota tributaria menos la bonificación que se publica, al céntimo', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('murcia');
    await page.locator('#parentesco').selectOption('III');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');

    const tributaria = aNumero(await importeDeLinea(page, /^Cuota tributaria/));
    const bonificacion = aNumero(await importeDeLinea(page, /Bonificación 50/));
    const final = aNumero(await importeDeLinea(page, /^CUOTA A INGRESAR/));
    expect(tributaria).toBe(18437.27);
    expect(bonificacion).toBe(9218.64);
    expect(Math.round((tributaria - bonificacion) * 100), 'tributaria − bonificación = final').toBe(
      Math.round(final * 100),
    );
    expect(await cuotaDestacada(page)).toBe('9218,63 €');
  });

  /**
   * REPARADO — hallazgo 1821 (alto, Inspector 25/09/2026; d8b01146): en NUDA PROPIEDAD la
   * reducción por vivienda habitual se calculaba sobre el valor PLENO de la vivienda, no sobre el
   * de la nuda propiedad adquirida. Re-verificado el 27/09/2026 también en Baleares, donde el tope
   * no aplana el defecto (describe «Re-inspección 27/09/2026», más abajo).
   *
   * Art. 20.2.c LISD (BOE, texto consolidado): «Del mismo porcentaje de reducción [95 %], con el
   * límite de 122.606,47 euros para cada sujeto pasivo […], gozarán las adquisiciones "mortis
   * causa" de la vivienda habitual». Lo adquirido es la nuda propiedad, y la propia app la valora
   * al 81 % (art. 26.a, usufructuario de 70 años): 120.000 × 81 % = 97.200 €. Pero le reducía
   * 95 % × 120.000 = 114.000 €, un 117 % de la vivienda por la que le hace tributar. Es la forma
   * de los hallazgos 796 (seguro) y 1193 (tope catalán): la reducción superaba la parte gravada.
   *
   * Castilla y León · hermano de 70 años que convivió (Grupo III, art. 20.2.c) · nuda propiedad,
   * usufructuario de 70 años (el valor por defecto del campo) · 100.000 € en cuentas +
   * 120.000 € de vivienda habitual · patrimonio < 402.678 €:
   *   base imponible  226.600,00 (220.000 + ajuar 6600) × 81 % = 183.546,00 de base ajustada
   *   − parentesco      7993,46   REDUCCIONES_PARENTESCO_IS['III']
   *   − vivienda       92.340,00   95 % × 97.200 (la app daba: 114.000,00)
   *   = base liquid.   83.212,54   (la app daba: 61.552,54)
   *   cuota íntegra     9704,18    9.166,06 + 16,15 % × (83.212,54 − 79.880,52)
   *   × 1,5882, sin bonificación en CyL para el Grupo III → 15.412,18 €   (la app daba: 10.275,29 €)
   *
   * La app se quedaba 5136,89 € por debajo, un 33 %. Tolerancia de medio euro.
   */
  test('en nuda propiedad la reducción por vivienda va sobre el valor de la nuda propiedad', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('castilla-leon');
    await page.locator('#parentesco').selectOption('III');
    await sembrarValor(page, page.locator('#edad-heredero'), '70');
    await page.getByLabel('Conviví con el fallecido los 2 años anteriores').check();
    await page.getByRole('radio', { name: 'Nuda propiedad' }).check();
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');
    await sembrarValor(page, page.locator('#vivienda-habitual'), '120000');

    const texto = await panel(page);
    expect(texto).toMatch(/Tipo adquisición \(nuda\)\s*81,0 ?%/); // 1 − (89 − 70) / 100
    expect(texto).toContain('183.546,00 €');                      // base ajustada

    expect(await importeDeLinea(page, /Vivienda habitual/)).toBe('92.340,00 €');
    expect(aNumero(await cuotaDestacada(page))).toBeCloseTo(15412.18, 0);
  });

  /**
   * REPARADO — hallazgo 1831 (bajo, Inspector 25/09/2026; d8b01146): el concepto de la reducción
   * por edad parecía la edad.
   *
   * Imprimía `${21 - edad} años < 21`: a un heredero de 15 años le ponía «Por edad (6 años < 21)»,
   * que se lee como que tiene 6 años; con 0 años, «(21 años < 21)», que es falso literalmente.
   * El importe sí es correcto: 6 × 3990,72 = 23.944,32 € (REDUCCION_EDAD_MENOR_21_IS; con los
   * 15.956,87 del parentesco suman 39.901,19, por debajo del tope de 47.858,59).
   */
  test('el concepto de la reducción por edad no presenta los años que faltan como la edad', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('extremadura');
    await page.locator('#parentesco').selectOption('I-descendiente');
    await sembrarValor(page, page.locator('#edad-heredero'), '15');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '50000');

    expect(await importeDeLinea(page, /Por edad/)).toBe('23.944,32 €');
    const concepto = await page
      .locator('[class*="resultsPanel"] div[class*="linea"]')
      .filter({ hasText: /Por edad/ })
      .first()
      .locator('span')
      .first()
      .innerText();
    expect(concepto).not.toMatch(/\(\d+ años < 21\)/);
  });

  /**
   * Contraste (pasa hoy): con la MISMA herencia —hijo de 21 o más, 300.000 € en cuentas—
   *   Asturias:  309.000 − 15.956,87 − 300.000 (reducción propia en base) < 0 → 0,00 €
   *   Andalucía: base liquidable 293.043,13 < 1.000.000 → exención total    → 0,00 €
   *   Canarias:  40.011,04 + 25,50 % × (293.043,13 − 239.389,13) = 53.692,81 × 0,1 % = 53,69 €
   * Es el caso que desmiente las dos notas del hallazgo de abajo.
   */
  test('contraste: 300.000 € de un hijo liquidan 0,00 € en Asturias y Andalucía y 53,69 € en Canarias', async ({ page }) => {
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '300000');
    for (const [ccaa, esperado] of [
      ['asturias', '0,00 €'],
      ['andalucia', '0,00 €'],
      ['canarias', '53,69 €'],
    ] as const) {
      await page.locator('#ccaa-causante').selectOption(ccaa);
      expect(await cuotaDestacada(page), ccaa).toBe(esperado);
    }
  });

  /**
   * REPARADO — hallazgo 1825 (medio, Inspector 25/09/2026; d8b01146): la ficha de la comunidad
   * seguía calificándolas.
   *
   * El 738 quitó de la prosa «la de mayor recaudación efectiva», pero la caja informativa que
   * aparece al elegir la comunidad imprime `BONIFICACIONES_CCAA_IS[…].notas` y decía de Asturias
   * «Tributación más alta del régimen común» y de Canarias «La más favorable del régimen
   * común». El contraste de arriba, calculado por la propia app, desmiente las dos: Asturias sale
   * a 0,00 € y Canarias a 53,69 €, por encima de Andalucía. Es la asimetría territorial
   * valorativa del §1.quinquies.6 del CLAUDE.md del proyecto, y contradice al faqJsonLd de la
   * app («conviene calcular el caso concreto en vez de guiarse por la fama de cada comunidad»).
   */
  test('la ficha de Asturias y la de Canarias no las califican de más cara o más favorable', async ({ page }) => {
    const info = page.locator('[class*="infoCcaa"]');
    await page.locator('#ccaa-causante').selectOption('asturias');
    await expect(info).toContainText('Principado de Asturias');
    expect(await info.innerText()).not.toContain('Tributación más alta');

    await page.locator('#ccaa-causante').selectOption('canarias');
    await expect(info).toContainText('Canarias');
    expect(await info.innerText()).not.toContain('La más favorable');
  });

  /**
   * REPARADO — hallazgo 1829 (bajo, Inspector 25/09/2026; d8b01146): cifras tecleadas donde hay
   * constante, y una ya divergía.
   *
   * El consejo de la tarjeta del sobrino decía «doce comunidades del régimen común no le dan nada»
   * al Grupo III. En `BONIFICACIONES_CCAA_IS` son DIEZ: de las catorce de régimen común, Madrid y
   * Murcia bonifican el 50 %, Canarias el 99,9 % y Asturias reduce 50.000 € en base. La misma
   * frase tecleaba esas otras tres cifras, y la tabla comparativa tecleaba «1,0000», «2,0000» y
   * «0 €» mientras su fila del Grupo III sí leía `COEFICIENTES_IS` y `REDUCCIONES_PARENTESCO_IS`.
   * (Quedan tecleados en la misma tabla los «99 %–100 %» de los Grupos I y II y los «5 meses» de
   * la prórroga: residuo que la re-inspección del 27/09/2026 deja con su propio testigo.)
   */
  test('el consejo del Grupo III cuenta las comunidades con data/fiscal, y la tabla no teclea', async ({ page }) => {
    const sinNada = Object.values(BONIFICACIONES_CCAA_IS).filter((c) => {
      const iii = c.bonificaciones['III'];
      return c.regimen === 'comun' && !(iii?.porcentaje ?? 0) && !(iii?.reduccionBase ?? 0);
    }).length;
    expect(sinNada, 'comunidades de régimen común sin nada para el Grupo III').toBe(10);

    const texto = await textoCompleto(page);
    expect(texto).toContain('Lo que cambia mucho de una comunidad a otra es qué recibe');
    expect(texto).not.toContain('doce comunidades del régimen común');

    const jsx = readFileSync(join(process.cwd(), 'app/estimador-impuesto-sucesiones/page.tsx'), 'utf8');
    for (const tecleada of ['<td>1,0000 (patrimonio', '<td>2,0000 (patrimonio', '<td>0 €</td>']) {
      expect(jsx, `sigue tecleada en la tabla: ${tecleada}`).not.toContain(tecleada);
    }
  });

  /**
   * REPARADO — hallazgo 1827 (medio, Inspector 25/09/2026; d8b01146): la tarjeta del hijo con
   * discapacidad emparejaba mal la cifra estatal: «más generosas que la estatal (47.858,59 € al
   * 65%)». 47.858,59 € es la del
   * 33 % al 64 % (`REDUCCION_DISCAPACIDAD_33_IS`); la del 65 % o más son 150.253,03 €
   * (`REDUCCION_DISCAPACIDAD_65_IS`), como dice bien la FAQ de la misma página y como aplica el
   * propio panel en el caso límite de arriba. La tarjeta rebaja a un tercio la estatal justo
   * donde la compara con las forales.
   */
  test('la tarjeta del hijo con discapacidad no atribuye 47.858,59 € al grado del 65 %', async ({ page }) => {
    const texto = await textoCompleto(page);
    const desde = texto.indexOf('Hijo menor con discapacidad');
    const hasta = texto.indexOf('Preguntas frecuentes sobre el Impuesto');
    const tarjeta = texto.slice(desde, hasta);
    expect(tarjeta).toContain('reducciones por discapacidad');
    expect(tarjeta).not.toMatch(/47\.858,59\s*€\s*al\s*65/);
  });

  /**
   * REPARADO — hallazgo 1832 (bajo, Inspector 25/09/2026; d8b01146): el selector de comunidad,
   * dos restos.
   *
   *  · La opción vacía decía «— Selecciona tu CCAA —» debajo de una etiqueta que pide la del
   *    FALLECIDO y encima de un helper que dice «No es donde vives tú»: era el residuo del 736.
   *  · Con País Vasco o Navarra la misma nota se imprimía DOS veces seguidas: en la alerta foral
   *    y en la caja informativa, las dos con `ccaaInfo.notas`.
   */
  test('el selector de comunidad no pide «tu» CCAA y la nota foral sale una vez', async ({ page }) => {
    const vacia = await page.locator('#ccaa-causante option').first().innerText();
    expect(vacia).not.toMatch(/tu CCAA/i);

    await page.locator('#ccaa-causante').selectOption('pais-vasco');
    const columna = await page.locator('[class*="inputsPanel"]').innerText();
    expect(columna.split('Las 3 Haciendas Forales').length - 1, 'veces que sale la nota foral').toBe(1);
  });

  /**
   * REPARADO — hallazgo 1826 (medio, Inspector 25/09/2026; d8b01146): el faqJsonLd daba la
   * reducción del Grupo I SIN su tope.
   *
   * «15.956,87 € más 3.990,72 € por cada año por debajo de 21», sin «sin que la reducción pueda
   * exceder de 47.858,59 euros» (art. 20.2.a LISD, `REDUCCION_EDAD_MENOR_21_MAX_IS`). Leída así,
   * un recién nacido reduciría 15.956,87 + 21 × 3990,72 = 99.761,99 €, el doble del máximo: era
   * el defecto que se reparó en el cálculo el 08/09/2026, vivo en el canal que leen las IAs. Las
   * cifras iban tecleadas en metadata.ts; ahora salen de data/fiscal.
   */
  test('el faqJsonLd da el tope de 47.858,59 € de la reducción del Grupo I', async ({ page }) => {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
    const pregunta = (faq.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>).find((q) =>
      /reducciones existen por parentesco/.test(q.name),
    );
    expect(pregunta, 'la pregunta de las reducciones por parentesco').toBeTruthy();
    // Sale de formatCurrency: con cuatro cifras enteras no se agrupa el millar («3990,72 €»).
    expect(pregunta!.acceptedAnswer.text).toMatch(/3\.?990,72/);
    expect(pregunta!.acceptedAnswer.text).toContain('47.858,59');
  });

  /**
   * REPARADO — hallazgo 1833 (bajo, Inspector 25/09/2026; d8b01146): el % iba pegado a la cifra
   * (CLAUDE.md global §2, desde el 25/09/2026: separado con espacio duro). El 27/09/2026 no queda
   * ninguno pegado ni en el HTML servido ni en el JSON-LD. Eran, en el panel: «Bonificación autonómica: 50,0%»,
   * «Tipo efectivo: 8,95%», «Ajuar doméstico (3%)», «Porcentaje de herencia …%», «Tipo
   * adquisición …%», «Vivienda habitual (95%)», «Discapacidad ≥65%», «Bonificación 56,00% por
   * escala del art. 58 bis». En el formulario: «33%–64%», «≥65%», «100% si eres el único
   * heredero», el helper del usufructo («70% … 10% → 19%»), y las notas de cada comunidad. En la
   * guía, unas cuarenta más. En metadata, la característica «vivienda habitual (95%)».
   */
  test('ningún porcentaje del formulario ni del panel va pegado a su cifra', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('murcia');
    await page.locator('#parentesco').selectOption('III');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');

    expect(await panel(page)).not.toMatch(/\d%/);
    expect(await page.locator('[class*="inputsPanel"]').innerText()).not.toMatch(/\d%/);
  });

  /**
   * REPARADO — hallazgo 1828 (medio, Inspector 25/09/2026, accesibilidad / modo oscuro;
   * d8b01146): las líneas de reducciones y de bonificación usaban `--bonif: #1A7A3E`, que el
   * módulo no redeclaraba en oscuro: sobre el #2A2A2A de la tarjeta daban 2,66:1, por debajo del
   * 4,5:1 del texto de 0,85rem. En claro, sobre blanco, 5,39:1. El candado check:token-oscuro no
   * lo ve porque `--bonif` no es un token de globals.css. Medido el 27/09/2026: 7,55:1.
   */
  test('en oscuro las líneas de reducción y bonificación llegan a 4,5:1', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('murcia');
    await page.locator('#parentesco').selectOption('III');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.waitForTimeout(700); // transición de 0,3 s de globals.css

    const ratios = await page.locator('[class*="resultsPanel"] [class*="lineaBonif"]').evaluateAll((nodos) => {
      const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const lum = (c: number[]) => {
        const [r, g, b] = c.map((v) => {
          const x = v / 255;
          return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      return nodos.map((n) => {
        const tarjeta = n.closest('[class*="desglose"]') as HTMLElement;
        const a = lum(rgb(getComputedStyle(n).color));
        const b = lum(rgb(getComputedStyle(tarjeta).backgroundColor));
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
    });
    expect(ratios.length, 'hay líneas de reducción y de bonificación').toBeGreaterThanOrEqual(2);
    for (const r of ratios) expect(r).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * REPARADO — hallazgo 1824 (bajo, Inspector 25/09/2026; d8b01146): el ajuar se calculaba
   * también sobre el SEGURO DE VIDA.
   *
   * Art. 15 LISD (BOE): el ajuar «se valorará en el tres por ciento del importe del caudal
   * relicto del causante». El seguro de vida no es caudal relicto —la propia página lo dice: «no
   * forman parte de la herencia civil»—, pero la app lo sumaba a la masa y le añadía su 3 %.
   *
   * Galicia · amigo (Grupo IV, sin reducción de parentesco ni de seguro) · solo un seguro de
   * vida de 100.000 € · patrimonio < 402.678 €:
   *   base imponible 100.000,00 (ajuar 0: no hay caudal relicto)   — la app daba: 103.000,00
   *   cuota íntegra   12.415,36  9.166,06 + 16,15 % × (100.000 − 79.880,52)
   *   × 2,0000, sin bonificación para el Grupo IV en Galicia → 24.830,72 €   — la app daba: 25.799,72 €
   * La app cobraba 969,00 € de más (12.899,86 × 2 = 25.799,72). Re-verificado el 27/09/2026 con
   * un seguro que convive con caudal relicto (Castilla-La Mancha, describe de abajo).
   */
  test('el ajuar doméstico no se calcula sobre el seguro de vida', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('galicia');
    await page.locator('#parentesco').selectOption('IV');
    await sembrarValor(page, page.locator('#seguros-vida'), '100000');

    expect(await importeDeLinea(page, /^Base imponible total/)).toBe('100.000,00 €');
    expect(await cuotaDestacada(page)).toBe('24.830,72 €');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Re-inspección 27/09/2026 — tras la reparación d8b01146 de los hallazgos 1821-1833
// ═══════════════════════════════════════════════════════════════════════════════
//
// Tres casos propios en comunidades que ningún test ejecutaba con estas ramas: la Comunitat
// Valenciana (99 % y el coeficiente 1,0500 del segundo tramo de patrimonio), Baleares (nuda
// propiedad con la vivienda por DEBAJO del tope, donde la reparación del 1821 sí se ve) y
// Castilla-La Mancha (seguro de vida con caudal relicto: el 1824 y el tope del art. 20.2.b).
// Cada cifra sale de `data/fiscal/sucesiones.ts` y se resolvió a mano ANTES de abrir la app.
//
// Lo que esta re-inspección encontró roto (hallazgos 2325-2332) iba con `test.fail()` y un
// comentario «ABIERTO», afirmando lo CORRECTO. REPARADO en af90d4f3 (27/09/2026): las marcas se
// retiraron y cada testigo lo dice en su cabecera; el Inspector del 30/09 lo comprobó en verde.

/** Una línea del desglose de la columna de resultados, por su concepto. */
const lineaDelPanel = (page: Page, concepto: RegExp) =>
  page.locator('[class*="resultsPanel"] div[class*="linea"]').filter({ hasText: concepto }).first();

/** El importe (columna derecha) de esa línea, con los espacios duros normalizados. */
async function importeDelPanel(page: Page, concepto: RegExp): Promise<string> {
  return (await lineaDelPanel(page, concepto).locator('span').last().innerText()).replace(/ /g, ' ');
}

/** El importe destacado «Impuesto estimado en …», con los espacios duros normalizados. */
async function cuotaEstimada(page: Page): Promise<string> {
  return (
    await page.getByText(/^Impuesto estimado en/).locator('xpath=following-sibling::span[1]').innerText()
  ).replace(/ /g, ' ');
}

/**
 * Contraste WCAG del texto de cada selector sobre su fondo EFECTIVO: compone los fondos rgba de
 * todos los ancestros, de la raíz hacia el nodo. No aplica la opacidad de los ancestros (la guía
 * plegada la anima y daría 1:1 en falso); sí la del propio nodo cuando `conOpacidad`. Devuelve
 * el primer nodo de cada selector.
 */
async function contrastes(
  page: Page,
  selectores: string[],
): Promise<Array<{ sel: string; ratio: number; px: number; peso: number }>> {
  return page.evaluate((sels) => {
    type Rgba = { r: number; g: number; b: number; a: number };
    const leer = (s: string): Rgba => {
      const p = (s.match(/rgba?\(([^)]+)\)/)?.[1] ?? '0,0,0,0').split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const sobre = (f: Rgba, b: Rgba): Rgba => ({
      r: f.r * f.a + b.r * (1 - f.a),
      g: f.g * f.a + b.g * (1 - f.a),
      b: f.b * f.a + b.b * (1 - f.a),
      a: 1,
    });
    const lum = (c: Rgba) => {
      const t = (v: number) => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * t(c.r) + 0.7152 * t(c.g) + 0.0722 * t(c.b);
    };
    return sels.map((sel) => {
      const nodo = document.querySelector(sel) as HTMLElement | null;
      if (!nodo) return { sel, ratio: 0, px: 0, peso: 0 };
      const cadena: HTMLElement[] = [];
      for (let e: HTMLElement | null = nodo; e; e = e.parentElement) cadena.unshift(e);
      let fondo: Rgba = { r: 255, g: 255, b: 255, a: 1 };
      for (const e of cadena) {
        const c = leer(getComputedStyle(e).backgroundColor);
        if (c.a > 0) fondo = sobre(c, fondo);
      }
      const cs = getComputedStyle(nodo);
      const texto = sobre(leer(cs.color), fondo);
      const [a, b] = [lum(texto), lum(fondo)];
      return {
        sel,
        ratio: Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100,
        px: parseFloat(cs.fontSize),
        peso: Number(cs.fontWeight),
      };
    });
  }, selectores);
}

test.describe('Re-inspección 27/09/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#saldos-cuentas', '#porcentaje-herencia']);
  });

  /**
   * CASO NORMAL — hijo de 35 años (Grupo II) en la COMUNITAT VALENCIANA, con patrimonio
   * preexistente entre 402.678 € y 2.007.380 € (segundo tramo): 150.000 € de vivienda habitual
   * y 60.000 € en cuentas.
   *
   *   Activos            210.000,00
   *   + ajuar 3 %          6300,00   PORC_AJUAR_DOMESTICO_IS × caudal relicto (art. 15 LISD)
   *   = base imponible   216.300,00
   *   − parentesco        15.956,87  REDUCCIONES_PARENTESCO_IS['II'] (art. 20.2.a)
   *   − vivienda         122.606,47  min(95 % × 150.000 = 142.500 ; REDUCCION_VIVIENDA_MAX_IS)
   *   = base liquidable   77.736,66
   *   cuota íntegra        8838,05   TARIFA_ESTATAL_IS, tramo «hasta 79.880,52»:
   *                                  7.943,98 + 15,30 % × (77.736,66 − 71.893,07) = 8838,04927
   *   × 1,0500                       COEFICIENTES_IS['II'][1] (art. 22 LISD)
   *   = cuota tributaria   9279,95   (8838,05 × 1,05 = 9279,9525)
   *   − bonificación 99 %  9187,15   BONIFICACIONES_CCAA_IS['valencia']…['II'] = 0,99
   *   = cuota final          92,80 €
   *
   * Todo es aritmética a céntimo sin redondeos dudosos: se compara el literal.
   */
  test('caso normal: hijo de 35 en la Comunitat Valenciana con patrimonio del segundo tramo paga 92,80 €', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('valencia');
    await page.locator('#parentesco').selectOption('II');
    await page.locator('#patrimonio-preexistente').selectOption('2');
    await sembrarValor(page, page.locator('#vivienda-habitual'), '150.000');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '60000');

    expect(await cuotaEstimada(page)).toBe('92,80 €');
    expect(await importeDelPanel(page, /Ajuar doméstico/)).toBe('6300,00 €');
    expect(await importeDelPanel(page, /^Base imponible total/)).toBe('216.300,00 €');
    expect(await importeDelPanel(page, /Vivienda habitual/)).toBe('122.606,47 €');
    expect(await importeDelPanel(page, /^Base liquidable/)).toBe('77.736,66 €');
    expect(await importeDelPanel(page, /^Cuota íntegra/)).toBe('8838,05 €');
    expect(await importeDelPanel(page, /Coeficiente multiplicador/)).toBe('×1,0500');
    expect(await importeDelPanel(page, /^Cuota tributaria/)).toBe('9279,95 €');
    expect(await importeDelPanel(page, /Bonificación 99,0\s%\s\(Comunitat Valenciana\)/)).toBe('9187,15 €');
  });

  /**
   * CASO LÍMITE — nuda propiedad en BALEARES con la vivienda POR DEBAJO del tope, que es donde la
   * reparación del 1821 se ve: en el caso de origen (Castilla y León) el tope no llegaba a morder,
   * pero en muchos otros la reducción mal calculada lo alcanzaba y lo tapaba.
   *
   * Hijo de 40 años (Grupo II) · nuda propiedad, usufructuario de 60 años · 100.000 € de
   * vivienda habitual + 200.000 € en acciones · patrimonio < 402.678 €:
   *   usufructo 89 − 60 = 29 % → nuda propiedad 71 %   `porcentajeUsufructoVitalicio` (art. 26.a)
   *   base imponible   309.000,00  (300.000 + ajuar 9000) × 71 % = 219.390,00 de base ajustada
   *   − parentesco      15.956,87
   *   − vivienda        67.450,00  95 % × (100.000 × 71 %) — art. 20.2.c sobre el DERECHO adquirido
   *   = base liquid.   135.983,13
   *   cuota íntegra     18.640,38  15.606,22 + 18,70 % × (135.983,13 − 119.757,67)
   *   − bonificación 95 % 17.708,36 BONIFICACIONES_CCAA_IS['baleares']…['II'] = 0,95
   *   = cuota final        932,02 €
   * Con la regla anterior (95 % del valor pleno, 95.000 €) la app habría liquidado 688,87 €.
   */
  test('caso límite: en nuda propiedad en Baleares la vivienda reduce 67.450,00 € y la cuota es 932,02 €', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('baleares');
    await page.locator('#parentesco').selectOption('II');
    await page.getByRole('radio', { name: 'Nuda propiedad' }).check();
    await sembrarValor(page, page.locator('#edad-usufructuario'), '60');
    await sembrarValor(page, page.locator('#vivienda-habitual'), '100000');
    await sembrarValor(page, page.locator('#acciones-fondos'), '200000');

    expect(await importeDelPanel(page, /Tipo adquisición \(nuda\)/)).toBe('71,0 %');
    expect(await importeDelPanel(page, /^Base ajustada/)).toBe('219.390,00 €');
    expect(await importeDelPanel(page, /Vivienda habitual/)).toBe('67.450,00 €');
    expect(await importeDelPanel(page, /^Base liquidable/)).toBe('135.983,13 €');
    expect(await importeDelPanel(page, /^Cuota íntegra/)).toBe('18.640,38 €');
    expect(await importeDelPanel(page, /Bonificación 95,0\s%/)).toBe('17.708,36 €');
    expect(await cuotaEstimada(page)).toBe('932,02 €');
  });

  /**
   * CASO LÍMITE — seguro de vida que CONVIVE con caudal relicto, en CASTILLA-LA MANCHA (bonificación
   * escalonada por base liquidable). El testigo del 1824 solo tenía un seguro sin nada más.
   *
   * Hijo (Grupo II) · 200.000 € en cuentas + 50.000 € de seguro de vida · patrimonio < 402.678 €:
   *   ajuar             6000,00   3 % de 200.000: el seguro no es caudal relicto (art. 15 LISD)
   *   base imponible  256.000,00  (el seguro SÍ tributa: art. 3.1.c)
   *   − parentesco     15.956,87
   *   − seguro          9195,49   min(50.000 ; REDUCCION_SEGURO_VIDA_MAX_IS), art. 20.2.b
   *   = base liquid.  230.847,64
   *   cuota íntegra    38.195,97  23.063,25 + 21,25 % × (230.847,64 − 159.634,83)
   *   − bonificación 90 % 34.376,37  escalón «hasta 275.000» de BONIFICACIONES_CCAA_IS['castilla-mancha']
   *   = cuota final      3819,60 €
   * Con el ajuar sobre el seguro (antes del 1824): base 257.500 y 3851,47 €.
   */
  test('caso límite: en Castilla-La Mancha el seguro de vida no genera ajuar y reduce su tope: 3819,60 €', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('castilla-mancha');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '200000');
    await sembrarValor(page, page.locator('#seguros-vida'), '50000');

    expect(await importeDelPanel(page, /Ajuar doméstico/)).toBe('6000,00 €');
    expect(await importeDelPanel(page, /^Base imponible total/)).toBe('256.000,00 €');
    expect(await importeDelPanel(page, /Seguro de vida/)).toBe('9195,49 €');
    expect(await importeDelPanel(page, /^Base liquidable/)).toBe('230.847,64 €');
    expect(await importeDelPanel(page, /^Cuota íntegra/)).toBe('38.195,97 €');
    expect(await importeDelPanel(page, /Bonificación 90/)).toBe('34.376,37 €');
    expect(await cuotaEstimada(page)).toBe('3819,60 €');
  });

  /**
   * CASO A RECHAZAR — REPARADO 27/09/2026 (hallazgo 2325, operativa, medio): «Descendiente menor
   * de 21 años» llegaba con la edad PRELLENADA en 35, y la app liquidaba sin decir nada: sin
   * reducción por edad (art. 20.2.a) y, en Cataluña, con la escala de bonificación del GRUPO I del
   * art. 58 bis (99 % → 20 %), que la ley reserva a los menores de 21. Con 300.000 € en cuentas:
   *   base imponible 309.000 − 100.000 (REDUCCIONES_PARENTESCO_CATALUNA_IS) = 209.000 de base
   *   liquidable → TARIFA_CATALUNA_IS: 14.500 + 17 % × 59.000 = 24.530,00 de cuota
   *   · escala del Grupo I sobre 309.000 € → 96,80 % → la app publicaba 785,91 €
   *   · un hijo de 35 años es Grupo II: escala del Grupo II → 54,71 % → 11.109,95 €
   *   · un menor de 10 años reduce 196.000 € (tope del art. 2 Ley 19/2010) → otra cifra
   * Los 785,91 € no correspondían a ninguna situación posible.
   *
   * El testigo del acta empezaba afirmando `toHaveValue('35')`: consagraba el prellenado, que es
   * la mitad del defecto. Ahora el campo llega VACÍO, y la app exige para ese grupo una edad de 0
   * a 20: vacía o 35 → aviso que la nombra y ninguna cifra; 10 → cifra, con la reducción rotulada.
   */
  test('caso a rechazar: «menor de 21» sin edad o con 35 no da una cuota imposible', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('cataluna');
    await page.locator('#parentesco').selectOption('I-descendiente');
    await expect(page.locator('#edad-heredero'), 'la edad no llega prellenada').toHaveValue('');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '300000');

    const aviso = page.locator('[class*="resultsPanel"]').getByRole('alert');
    await expect(aviso).toContainText(/edad del heredero/i);
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);

    await sembrarValor(page, page.locator('#edad-heredero'), '35');
    await expect(aviso).toContainText('contradice el parentesco');
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);
    await expect(page.getByText('785,91 €')).toHaveCount(0);

    // Con una edad del Grupo I la estimación vuelve, y la reducción dice la edad escrita.
    await sembrarValor(page, page.locator('#edad-heredero'), '10');
    await expect(page.getByText(/^Impuesto estimado en/)).toBeVisible();
    await expect(aviso).toHaveCount(0);
    await expect(lineaDelPanel(page, /Por edad/)).toContainText('heredero de 10 años, menor de 21');
  });

  /**
   * REPARADO 27/09/2026 (hallazgo 2332, operativa, bajo): edades imposibles sin aviso. La edad del
   * usufructuario «-5» se liquidaba con el 70 % de usufructo (el techo del art. 26.a para menores
   * de 20), vacía se tomaba como 70 años sin decirlo (19 %) y con «150» salía el 10 %; la del
   * heredero «-3» se rotulaba «heredero de -3 años, menor de 21». Los importes negativos se
   * rechazan con aviso desde el 740; las edades siguen ahora la misma regla.
   *
   * Galicia · Grupo III · 100.000 € · usufructo con «-5»: la app publicaba 10.829,65 €
   * (103.000 × 70 % = 72.100 − 7993,46 = 64.106,54 → 6818,82 × 1,5882).
   */
  test('una edad del usufructuario negativa, vacía o absurda no se liquida con un porcentaje supuesto', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('galicia');
    await page.locator('#parentesco').selectOption('III');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');
    await page.getByRole('radio', { name: 'Usufructo' }).check();
    const aviso = page.locator('[class*="resultsPanel"]').getByRole('alert');
    const helper = page.locator('#edad-usufructuario').locator('xpath=following-sibling::span[1]');

    for (const edad of ['-5', '', '150']) {
      await sembrarValor(page, page.locator('#edad-usufructuario'), edad);
      await expect(aviso, `edad del usufructuario «${edad}»`).toContainText(/edad del usufructuario/i);
      await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);
      // El helper tampoco enseña el porcentaje de una edad que no existe.
      await expect(helper).not.toContainText('→');
    }
    await expect(page.getByText('10.829,65 €')).toHaveCount(0);

    // Con una edad posible, la cifra vuelve: 60 años → 89 − 60 = 29 %.
    await sembrarValor(page, page.locator('#edad-usufructuario'), '60');
    await expect(aviso).toHaveCount(0);
    expect(await importeDelPanel(page, /Tipo adquisición \(usufructo\)/)).toBe('29,0 %');
  });

  /** Y el heredero con edad negativa, que el desglose rotulaba tal cual (hallazgo 2332). */
  test('una edad del heredero negativa o imposible no llega al desglose', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('extremadura');
    await page.locator('#parentesco').selectOption('I-descendiente');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');
    await sembrarValor(page, page.locator('#edad-heredero'), '-3');

    const aviso = page.locator('[class*="resultsPanel"]').getByRole('alert');
    await expect(aviso).toContainText(/edad del heredero/i);
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);
    await expect(page.getByText(/heredero de -\d/)).toHaveCount(0);

    // Y un colateral con una edad imposible tampoco se liquida.
    await page.locator('#parentesco').selectOption('III');
    await sembrarValor(page, page.locator('#edad-heredero'), '200');
    await expect(aviso).toContainText(/edad del heredero/i);
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);
  });

  /**
   * REPARADO 27/09/2026 (hallazgo 2328, contenido, medio): la FAQ «¿Tengo que pagar si heredo en
   * Madrid o Canarias?» respondía
   * «En la práctica, casi nunca […] La cuota resultante es de céntimos». La herramienta de la
   * misma página lo desmiente con una herencia modesta:
   *   Madrid · hijo · 50.000 € en cuentas → 51.500 − 15.956,87 = 35.543,13 de base liquidable
   *   2.851,98 + 11,05 % × (35.543,13 − 31.955,81) = 3248,38 → − 99 % (3215,90) = 32,48 €
   * Y con 250.000 € y vivienda habitual, 154,74 € (caso normal del 11/09). Para que fueran
   * céntimos la base liquidable tendría que quedar por debajo de ~1.300 €.
   */
  test('la FAQ de Madrid y Canarias no promete una cuota «de céntimos» que la herramienta no da', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('madrid');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '50000');
    expect(await cuotaEstimada(page)).toBe('32,48 €');

    const texto = await textoCompleto(page);
    const desde = texto.indexOf('¿Tengo que pagar si heredo en Madrid o Canarias?');
    expect(desde, 'la pregunta sigue en la FAQ').toBeGreaterThan(-1);
    const respuesta = texto.slice(desde, desde + 900);
    expect(respuesta).not.toContain('céntimos');
    expect(respuesta).not.toContain('casi nunca');
    // Y dice lo que la herramienta liquida: el 1 % de la cuota, con la cifra del caso normal del
    // 11/09 (Madrid, hijo, 250.000 € con 200.000 € de vivienda habitual).
    expect(respuesta).toMatch(/1\s%\sde la cuota/);
    expect(respuesta).toContain('154,74 €');
  });

  /**
   * REPARADO 27/09/2026 (hallazgo 2329, contenido, bajo) — residuo del 1824. El consejo «Declara el ajuar doméstico
   * correctamente» dice «Hacienda presume el 3 % del valor de la masa hereditaria neta», y la
   * «Masa hereditaria neta» del panel INCLUYE los seguros de vida, sobre los que la app ya no
   * calcula ajuar (art. 15 LISD: «caudal relicto»). Galicia · Grupo IV · solo 100.000 € de seguro:
   * el panel dice «Masa hereditaria neta 100.000,00 €» y «Ajuar doméstico 0,00 €»; el consejo,
   * 3000 €. Los pasos del cálculo y la lista de errores de la misma guía ya dicen «caudal relicto».
   */
  test('el consejo del ajuar habla del caudal relicto, como el cálculo, y no de la masa neta', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('galicia');
    await page.locator('#parentesco').selectOption('IV');
    await sembrarValor(page, page.locator('#seguros-vida'), '100000');
    expect(await importeDelPanel(page, /^Masa hereditaria neta/)).toBe('100.000,00 €');
    expect(await importeDelPanel(page, /Ajuar doméstico/)).toBe('0,00 €');

    const texto = await textoCompleto(page);
    const desde = texto.indexOf('Declara el ajuar doméstico correctamente');
    expect(desde).toBeGreaterThan(-1);
    expect(texto.slice(desde, desde + 300)).not.toContain('masa hereditaria neta');
    expect(texto.slice(desde, desde + 300)).toContain('caudal relicto');
  });

  /**
   * REPARADO 27/09/2026 (hallazgo 2330, contenido, bajo) — era la SOSPECHA S1. Con Cataluña elegida la app liquida con la
   * rama catalana de `data/fiscal` (Ley 19/2010: tarifa 7-32 %, 100.000 € al hijo, escala del
   * art. 58 bis), que tiene su propio sello —`FISCAL_SUCESIONES_CATALUNA_META`, verificado el
   * 08/09/2026, fuente Agència Tributària de Catalunya—, pero el hero y el DataReference solo dan
   * el del módulo (01/01/2025, «Fuente: Agencia Tributaria»). `calcularSucesion`, con los mismos
   * datos, devuelve en `fuenteDatos` el sello catalán: la web y el MCP citan fuentes distintas
   * para el mismo cálculo. Lo esperado se deriva del sello, para que re-sellar no rompa el testigo.
   */
  test('con Cataluña elegida la página da el sello de la rama catalana que liquida', async ({ page }) => {
    const [anio, mes, dia] = FISCAL_SUCESIONES_CATALUNA_META.verificado.split('-');
    await page.locator('#ccaa-causante').selectOption('cataluna');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '250000');
    // 257.500 − 100.000 = 157.500 → 14.500 + 17 % × 7.500 = 15.775,00; escala del Grupo II
    // sobre 257.500 € → 55,83 % → 15.775 − 8806,43 = 6968,57 €
    expect(await cuotaEstimada(page)).toBe('6968,57 €');

    const sello = `${dia}/${mes}/${anio}`;
    const texto = await textoCompleto(page);
    expect(texto.includes(sello), `la página no da el sello de la rama catalana (${sello})`).toBe(true);

    // El hero y el DataReference dan el sello y la fuente que `calcularSucesion` pone en
    // `fuenteDatos` para ese mismo cálculo: la web y el MCP no pueden volver a citar dos fuentes.
    const selloDelMotor = (ccaa: string) => {
      const [fuente, iso] = calcularSucesion({ baseImponible: 250000, ccaa, grupo: 'II' }).fuenteDatos.split(' — verificado ');
      const [a, m, d] = iso.split('-');
      return { fuente, fecha: `${d}/${m}/${a}` };
    };
    const catalan = selloDelMotor('cataluna');
    const referencia = page.getByRole('note', { name: 'Datos de referencia normativos' });
    await expect(referencia).toContainText(catalan.fuente);
    await expect(referencia).toContainText(catalan.fecha);
    const hero = page.locator('[class*="metaVerificado"]');
    await expect(hero).toContainText(`Datos verificados: ${catalan.fecha}`);
    await expect(hero).toContainText('Agència Tributària de Catalunya');

    // Con otra comunidad, el sello del módulo, y el catalán desaparece.
    await page.locator('#ccaa-causante').selectOption('madrid');
    const general = selloDelMotor('madrid');
    await expect(referencia).toContainText(general.fuente);
    await expect(referencia).toContainText(general.fecha);
    await expect(hero).toContainText(`Datos verificados: ${general.fecha}`);
    await expect(hero).not.toContainText('Agència');
    await expect(referencia).not.toContainText(catalan.fecha);
  });

  /**
   * REPARADO 27/09/2026 (hallazgo 2331, dato, bajo) — residuo del 1829: datos normativos TECLEADOS donde hay constante.
   *  · «5 meses» para pedir la prórroga en cuatro sitios (tarjeta de plazos, paso 6, consejo «antes
   *    del mes 5» y lista de errores «primeros 5 meses… mes 6»), con `PLAZO_ISD.mesesParaPedirProrroga`
   *    sellado desde el 13/09/2026 y usado en el párrafo de al lado. «Antes del mes 5» además dice
   *    otra cosa que «dentro de los cinco primeros meses» (art. 68.1 RISD).
   *  · «99 %–100 %» de bonificación en las filas de los Grupos I y II de la tabla comparativa y en
   *    el consejo «Liquida aunque la cuota sea cero», con `BONIFICACIONES_CCAA_IS` en la misma
   *    tabla para Asturias y para el Grupo III. Hoy cuadran; es la forma que ya divergió en el 1829.
   */
  test('los plazos y bonificaciones de la guía no van tecleados', async () => {
    const jsx = readFileSync(join(process.cwd(), 'app/estimador-impuesto-sucesiones/page.tsx'), 'utf8');
    const lineas = jsx.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*|\{\/\*)/.test(l));
    const codigo = lineas.join('\n');
    for (const tecleada of ['primeros 5 meses', 'antes del mes 5', 'mes 6', '99&nbsp;%–100&nbsp;%']) {
      expect(codigo, `sigue tecleado: ${tecleada}`).not.toContain(tecleada);
    }
    // Y lo que los sustituye sale de data/fiscal.
    expect(codigo).toContain('PLAZO_ISD.mesesParaPedirProrroga');
    expect(codigo).toMatch(/rangoBonificacion\(CCAA_BONIF_GRUPO_I,/);
  });

  /**
   * REPARADO 27/09/2026 (hallazgo 2326, accesibilidad, medio) — era la SOSPECHA S3, MEDIDA. El módulo redeclara
   * `--primary: #2E86AB` en `.container` y NO en `[data-theme='dark'] .container`, así que el
   * `--primary` oscuro de globals.css (#3FA5D1) nunca llega: en oscuro sigue el azul del claro.
   * Texto en color de marca, medido con getComputedStyle sobre el fondo efectivo:
   *   · «CUOTA A INGRESAR (estimada)» y su importe (.lineaFinal, 16 px / 600): 4,11:1 en claro
   *     sobre #FFF, 3,50:1 en oscuro sobre #2A2A2A — la cifra que el usuario se lleva.
   *   · títulos de sección del formulario (16 px / 600), h4 de los grupos, consejos de las
   *     tarjetas (13 px) y h3 de la guía (16,8 px / 600, 3,77:1 y 3,21:1 sobre #F5F5F5 / #303030).
   *   · la pista de la FAQ (.faqTip, 13 px / 600) en `--secondary` sobre su tinte: 2,40:1 en claro.
   * Ninguno llega a 18,66 px en negrita: el umbral es 4,5:1. El candado check:token-oscuro
   * excluye `--primary` a propósito, y check:contraste-cabeceras solo mira <th>. Se resuelve con
   * `--primary-texto` (5,47:1 sobre blanco en globals.css). El tema se aplica tras hidratar y se
   * comprueba que el estilo cambió de verdad antes de medir.
   */
  test('el texto en color de marca llega a 4,5:1 en claro y en oscuro', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('murcia');
    await page.locator('#parentesco').selectOption('III');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');
    expect(await cuotaEstimada(page)).toBe('9218,63 €');

    const comunes = [
      '[class*="lineaFinal"] span',
      '[class*="seccionTitulo"]',
      '[class*="conceptCard"] h4',
      '[class*="escenarioTip"]',
      '[class*="guideSection"] h3',
    ];
    const claro = await contrastes(page, [...comunes, '[class*="faqTip"]']);

    const contenedor = page.locator('header[class*="hero"]').locator('xpath=..');
    const fondoClaro = await contenedor.evaluate((e) => getComputedStyle(e).backgroundColor);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect
      .poll(() => contenedor.evaluate((e) => getComputedStyle(e).backgroundColor), { message: 'el tema oscuro se aplicó' })
      .not.toBe(fondoClaro);
    await page.waitForTimeout(700); // transición de 0,3 s de globals.css
    expect(await cuotaEstimada(page), 'el cálculo no depende del tema').toBe('9218,63 €');
    const oscuro = await contrastes(page, comunes);

    const fallos = [
      ...claro.map((c) => ({ ...c, tema: 'claro' })),
      ...oscuro.map((c) => ({ ...c, tema: 'oscuro' })),
    ].filter((c) => c.ratio < 4.5);
    expect(fallos.map((f) => `${f.tema} ${f.sel} ${f.ratio}:1`)).toEqual([]);
  });

  /**
   * REPARADO 27/09/2026 (hallazgo 2327, accesibilidad, medio): el bloque «Impuesto estimado»
   * pintaba texto BLANCO sobre el degradado de marca (#2E86AB → #48A9A6, igual en los dos temas
   * porque el módulo fijaba los dos colores en `.container`). En el extremo teal:
   *   · la cifra (35 px / 700, texto grande, umbral 3:1): 2,80:1
   *   · «Impuesto estimado en …» (14,4 px, opacidad 0,9): 2,55:1; en el azul, 3,65:1
   *   · «Tipo efectivo» (13 px, opacidad 0,8): 2,32:1; en el azul, 3,22:1
   * Ahora el fondo es `--hero-bg` liso y sin opacidades en los rótulos.
   *
   * El testigo del acta medía SOLO contra las paradas del `background-image`: con un fondo liso
   * no hay paradas, `Math.min()` de nada es `Infinity` y el test habría pasado en verde sin medir.
   * Ahora mide contra las paradas si hay degradado y contra el `background-color` si no, exige
   * al menos un fondo, compone el fondo propio de cada rótulo y lo hace en los DOS temas.
   */
  test('el importe destacado y sus rótulos se leen sobre su fondo, en claro y en oscuro', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('murcia');
    await page.locator('#parentesco').selectOption('III');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');
    await expect(page.getByText(/^Impuesto estimado en/)).toBeVisible();

    const medir = () => page.locator('[class*="resultadoDestacado"]').evaluate((caja) => {
      const rgba = (texto: string) => {
        const p = (texto.match(/rgba?\(([^)]+)\)/)?.[1] ?? '0,0,0,0').split(/[ ,/]+/).filter(Boolean).map(Number);
        return { c: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 };
      };
      const lum = (c: number[]) => {
        const t = (v: number) => {
          const x = v / 255;
          return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * t(c[0]) + 0.7152 * t(c[1]) + 0.0722 * t(c[2]);
      };
      const cs = getComputedStyle(caja);
      const degradado = [...cs.backgroundImage.matchAll(/rgba?\(([^)]+)\)/g)].map((m) => rgba(m[0]).c);
      const liso = rgba(cs.backgroundColor);
      const paradas = degradado.length > 0 ? degradado : liso.a > 0 ? [liso.c] : [];
      const hijos = [...caja.children].map((hijo) => {
        const h = getComputedStyle(hijo);
        const alfa = Number(h.opacity);
        const color = rgba(h.color).c;
        const propio = rgba(h.backgroundColor);
        const px = parseFloat(h.fontSize);
        const grande = px >= 24 || (px >= 18.66 && Number(h.fontWeight) >= 700);
        const peor = Math.min(
          ...paradas.map((p) => {
            const fondo = p.map((v, i) => propio.c[i] * propio.a + v * (1 - propio.a));
            const efectivo = color.map((v, i) => v * alfa + fondo[i] * (1 - alfa));
            const [a, b] = [lum(efectivo), lum(fondo)];
            return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          }),
        );
        return { texto: (hijo as HTMLElement).innerText.slice(0, 30), ratio: Math.round(peor * 100) / 100, umbral: grande ? 3 : 4.5 };
      });
      return { fondos: paradas.length, hijos };
    });

    const claro = await medir();
    const contenedor = page.locator('header[class*="hero"]').locator('xpath=..');
    const fondoClaro = await contenedor.evaluate((e) => getComputedStyle(e).backgroundColor);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect
      .poll(() => contenedor.evaluate((e) => getComputedStyle(e).backgroundColor), { message: 'el tema oscuro se aplicó' })
      .not.toBe(fondoClaro);
    await page.waitForTimeout(700); // transición de 0,3 s de globals.css
    const oscuro = await medir();

    for (const [tema, m] of [['claro', claro], ['oscuro', oscuro]] as const) {
      expect(m.fondos, `${tema}: el bloque tiene un fondo que medir`).toBeGreaterThanOrEqual(1);
      expect(m.hijos.length).toBeGreaterThanOrEqual(3);
      expect(m.hijos.filter((h) => h.ratio < h.umbral).map((h) => `${tema} ${h.texto}: ${h.ratio}:1`)).toEqual([]);
    }
  });
});

/**
 * MÓVIL 393×851 — el caso normal de arriba, escrito con el TECLADO en pantalla (toque + tecleo,
 * con los puntos de millar que teclea la gente) en vez de sembrado. Además: sin scroll
 * horizontal y el <h1> libre de la barra fija del logo, que es lo que tocó hoy el lote del logo
 * (586a4d61 y siguientes no modifican esta app: su hero ya lleva 80 px de margen superior).
 */
test.describe('Re-inspección 27/09/2026 — móvil 393×851', () => {
  // Enumerado en vez de `...devices[…]`: dentro de un describe, un `devices` forzaría un worker nuevo.
  test.use({
    viewport: { width: 393, height: 851 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.75,
    isMobile: true,
    hasTouch: true,
  });

  test('caso normal tecleado en el móvil: 92,80 €, sin scroll horizontal y con el título a la vista', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#saldos-cuentas', '#vivienda-habitual']);

    const tapado = await page.evaluate(() => {
      const h1 = document.querySelector('h1')!.getBoundingClientRect();
      return [...document.querySelectorAll('body *')]
        .filter((e) => getComputedStyle(e).position === 'fixed')
        .map((e) => e.getBoundingClientRect())
        .some((r) => r.height > 0 && r.bottom > h1.top && r.top < h1.bottom && r.right > h1.left && r.left < h1.right);
    });
    expect(tapado, 'la barra fija del logo no tapa el título').toBe(false);

    await page.locator('#ccaa-causante').selectOption('valencia');
    await page.locator('#parentesco').selectOption('II');
    await page.locator('#patrimonio-preexistente').selectOption('2');
    await page.locator('#vivienda-habitual').tap();
    await page.keyboard.type('150.000');
    await esperarValorEnReact(page, page.locator('#vivienda-habitual'), '150.000');
    await page.locator('#saldos-cuentas').tap();
    await page.keyboard.type('60.000');
    await esperarValorEnReact(page, page.locator('#saldos-cuentas'), '60.000');

    expect(await cuotaEstimada(page)).toBe('92,80 €');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
      'scroll horizontal',
    ).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Inspector 30/09/2026 — tras la reparación af90d4f3 de los hallazgos 2325-2332
// ═══════════════════════════════════════════════════════════════════════════════
//
// Entró por dos SOSPECHAS del 27/09/2026. Tres casos propios, resueltos a mano con
// `data/fiscal/sucesiones.ts` y el BOE delante ANTES de abrir la app: Castilla y León (cuatro
// bienes distintos a la vez y el tramo del 21,25 %), el umbral de 1.000.000 € de Andalucía al
// céntimo con el tramo del 34 %, y el borde del Grupo I (20 frente a 21 años). Y el coeficiente
// del art. 22.2 LISD en el segundo tramo de patrimonio, que es donde vive la otra sospecha.
//
// Lo que esta inspección encuentra roto va con `test.fail()` y un comentario «ABIERTO», afirmando
// lo CORRECTO: cuando se repare, el test empezará a pasar y la marca hay que quitarla.
//
// Lo que NO es hallazgo: que la app reste las deudas del caudal relicto ANTES de calcular el 3 %
// del ajuar. El art. 15 LISD dice «el tres por ciento del importe del caudal relicto» y el
// art. 34.3 RISD solo saca de ese caudal los bienes adicionados (arts. 25 a 28 RISD), las
// donaciones acumuladas y los seguros de vida; ninguno de los dos, ni los arts. 22 y 23 RISD,
// dice si las deudas se restan antes o después. Con el BOE delante no hay ancla: no se registra.

/** Texto de una respuesta del FAQPage del JSON-LD, por su pregunta, con los espacios duros normalizados. */
async function respuestaFaqJsonLd(page: Page, pregunta: RegExp): Promise<string> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
  const encontrada = (faq.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>).find((q) =>
    pregunta.test(q.name),
  );
  expect(encontrada, `la pregunta ${pregunta} sigue en el FAQPage`).toBeTruthy();
  return encontrada!.acceptedAnswer.text.split(' ').join(' ');
}

/** Código de un fichero sin sus líneas de comentario: las crónicas citan las cifras viejas a propósito. */
const codigoSinComentarios = (ruta: string): string =>
  readFileSync(join(process.cwd(), ruta), 'utf8')
    .split('\n')
    .filter((l) => !/^\s*(\/\/|\*|\/\*|\{\/\*)/.test(l))
    .join('\n');

test.describe('Inspector 30/09/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#saldos-cuentas', '#porcentaje-herencia']);
  });

  /**
   * CASO NORMAL — hijo de 30 años (Grupo II: la app no pide la edad a partir de 21) en CASTILLA Y
   * LEÓN, patrimonio preexistente del primer tramo y sin deudas, con CUATRO bienes distintos a la
   * vez (ningún testigo sumaba acciones, otros inmuebles y vehículos):
   *
   *   Activos           210.000,00   45.000 cuentas + 30.000 acciones + 120.000 inmuebles + 15.000 vehículos
   *   + ajuar 3 %         6300,00    PORC_AJUAR_DOMESTICO_IS × caudal relicto (art. 15 LISD)
   *   = base imponible  216.300,00
   *   − parentesco       15.956,87   REDUCCIONES_PARENTESCO_IS['II'] (art. 20.2.a LISD)
   *   = base liquidable 200.343,13
   *   cuota íntegra      31.713,76   TARIFA_ESTATAL_IS (art. 21.2), tramo «hasta 239.389,13»:
   *                                  23.063,25 + 21,25 % × (200.343,13 − 159.634,83) = 31.713,76375
   *   × 1,0000                       COEFICIENTES_IS['II'][0] (art. 22.2, patrimonio de 0 a 402.678,11)
   *   − bonificación 99 % 31.396,62  BONIFICACIONES_CCAA_IS['castilla-leon']…['II'] = 0,99
   *   = cuota final         317,14 €  (tipo efectivo 317,14 / 216.300 = 0,15 %)
   */
  test('caso normal: hijo en Castilla y León con 210.000 € en cuatro bienes paga 317,14 €', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('castilla-leon');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '45.000');
    await sembrarValor(page, page.locator('#acciones-fondos'), '30000');
    await sembrarValor(page, page.locator('#otros-inmuebles'), '120.000');
    await sembrarValor(page, page.locator('#vehiculos'), '15000');

    expect(await importeDelPanel(page, /^Total activos/)).toBe('210.000,00 €');
    expect(await importeDelPanel(page, /Ajuar doméstico/)).toBe('6300,00 €');
    expect(await importeDelPanel(page, /^Base imponible total/)).toBe('216.300,00 €');
    expect(await importeDelPanel(page, /Por parentesco/)).toBe('15.956,87 €');
    expect(await importeDelPanel(page, /^Base liquidable/)).toBe('200.343,13 €');
    expect(await importeDelPanel(page, /^Cuota íntegra/)).toBe('31.713,76 €');
    expect(await importeDelPanel(page, /Coeficiente multiplicador/)).toBe('×1,0000');
    expect(await importeDelPanel(page, /Bonificación 99,0\s%\s\(Castilla y León\)/)).toBe('31.396,62 €');
    expect(await cuotaEstimada(page)).toBe('317,14 €');
    await expect(page.locator('[class*="resultsPanel"]').getByText(/^Tipo efectivo:/)).toHaveText(/0,15\s%/);
  });

  /**
   * CASO LÍMITE — el umbral de ANDALUCÍA al céntimo, con el tramo más alto de la tarifa.
   * `BONIFICACIONES_CCAA_IS['andalucia']…['II'] = { porcentaje: 0,99, exencion: 1.000.000 }`, y su
   * nota: «Exención total si base liquidable < 1.000.000 €. Si supera, bonificación 99 %». La
   * desigualdad es ESTRICTA: con 1.000.000,00 € justos ya no hay exención.
   *
   * Hijo · 900.000 € en cuentas + 98.152,36 € de seguro de vida (el seguro no genera ajuar,
   * art. 34.3 RISD, y así la base liquidable cae en el millón exacto):
   *   ajuar              27.000,00   3 % de 900.000
   *   base imponible  1.025.152,36
   *   − parentesco       15.956,87
   *   − seguro            9195,49    REDUCCION_SEGURO_VIDA_MAX_IS (art. 20.2.b LISD)
   *   = base liquid.  1.000.000,00
   *   cuota íntegra    268.122,67    199.291,40 + 34 % × (1.000.000 − 797.555,08) = 268.122,6728
   *   − bonif. 99 %    265.441,44
   *   = cuota final       2681,23 €
   * Un céntimo menos de seguro (98.152,35) deja la base en 999.999,99 € → exención → 0,00 €.
   */
  test('caso límite: en Andalucía 1.000.000,00 € de base liquidable pagan 2681,23 € y un céntimo menos, 0,00 €', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('andalucia');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '900.000');
    await sembrarValor(page, page.locator('#seguros-vida'), '98.152,36');

    expect(await importeDelPanel(page, /Ajuar doméstico/)).toBe('27.000,00 €');
    expect(await importeDelPanel(page, /^Base imponible total/)).toBe('1.025.152,36 €');
    expect(await importeDelPanel(page, /Seguro de vida/)).toBe('9195,49 €');
    expect(await importeDelPanel(page, /^Base liquidable/)).toBe('1.000.000,00 €');
    expect(await importeDelPanel(page, /^Cuota íntegra/)).toBe('268.122,67 €');
    expect(await importeDelPanel(page, /Bonificación 99,0\s%\s\(Andalucía\)/)).toBe('265.441,44 €');
    expect(await cuotaEstimada(page)).toBe('2681,23 €');

    await sembrarValor(page, page.locator('#seguros-vida'), '98.152,35');
    expect(await importeDelPanel(page, /^Base liquidable/)).toBe('999.999,99 €');
    expect(await importeDelPanel(page, /Exención total/)).toBe('268.122,67 €');
    expect(await cuotaEstimada(page)).toBe('0,00 €');
  });

  /**
   * CASO LÍMITE — el coeficiente del art. 22.2 LISD en el SEGUNDO tramo de patrimonio, lejos del
   * umbral. Sobrino (Grupo III) en GALICIA, que no bonifica al Grupo III
   * (`BONIFICACIONES_CCAA_IS['galicia']…['III'] = 0`), con 100.000 € en cuentas y 1.000.000 € de
   * patrimonio preexistente (opción «402.678 € – 2.007.380 €»):
   *   base imponible 103.000,00 − 7993,46 (REDUCCIONES_PARENTESCO_IS['III']) = 95.006,54
   *   cuota íntegra   11.608,91   9166,06 + 16,15 % × (95.006,54 − 79.880,52) = 11.608,91223
   *   × 1,6676                    COEFICIENTES_IS['III'][1] («De más de 402.678,11 a 2.007.380,43»)
   *   = cuota         19.359,02 €
   * Con 1.000.000 € la corrección del salto (el ABIERTO de abajo) no actúa: la diferencia de cuota
   * entre 1,6676 y 1,5882, 921,75 €, es menor que lo que el patrimonio pasa del umbral, 597.321,89 €.
   */
  test('caso límite: un sobrino en Galicia con patrimonio del segundo tramo liquida ×1,6676: 19.359,02 €', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('galicia');
    await page.locator('#parentesco').selectOption('III');
    await page.locator('#patrimonio-preexistente').selectOption('2');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');

    expect(await importeDelPanel(page, /^Base liquidable/)).toBe('95.006,54 €');
    expect(await importeDelPanel(page, /^Cuota íntegra/)).toBe('11.608,91 €');
    expect(await importeDelPanel(page, /Coeficiente multiplicador/)).toBe('×1,6676');
    expect(await importeDelPanel(page, /^Cuota tributaria/)).toBe('19.359,02 €');
    expect(await cuotaEstimada(page)).toBe('19.359,02 €');
  });

  /**
   * CASO A RECHAZAR — el BORDE del Grupo I. «Descendiente menor de 21 años» con 21 años se rechaza
   * (el art. 20.2.a LISD pone a los de 21 en el Grupo II): aviso y ninguna cifra. Con 20 años sí, y
   * la reducción por edad es UN año: 3990,72 € (REDUCCION_EDAD_MENOR_21_IS), lejos del tope de
   * 47.858,59 € (REDUCCION_EDAD_MENOR_21_MAX_IS). Región de Murcia · 100.000 € en cuentas:
   *   103.000 − 15.956,87 − 3990,72 = 83.052,41 de base liquidable
   *   9166,06 + 16,15 % × (83.052,41 − 79.880,52) = 9678,32 − 99 % (9581,54) = 96,78 €
   * Y sin ningún bien —solo una hipoteca de 50.000 €— tampoco hay cifra: el panel pide los bienes.
   */
  test('caso a rechazar: «menor de 21» con 21 años no liquida; con 20 reduce 3990,72 € y paga 96,78 €', async ({ page }) => {
    await page.locator('#ccaa-causante').selectOption('murcia');
    await page.locator('#parentesco').selectOption('I-descendiente');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');
    await sembrarValor(page, page.locator('#edad-heredero'), '21');

    const aviso = page.locator('[class*="resultsPanel"]').getByRole('alert');
    await expect(aviso).toContainText('(21 años) contradice el parentesco');
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);

    await sembrarValor(page, page.locator('#edad-heredero'), '20');
    await expect(aviso).toHaveCount(0);
    expect(await importeDelPanel(page, /Por edad/)).toBe('3990,72 €');
    expect(await importeDelPanel(page, /^Base liquidable/)).toBe('83.052,41 €');
    expect(await importeDelPanel(page, /^Cuota íntegra/)).toBe('9678,32 €');
    expect(await cuotaEstimada(page)).toBe('96,78 €');

    // Sin bienes y con una deuda: ni cifra ni aviso de error; el panel pide los bienes.
    await sembrarValor(page, page.locator('#saldos-cuentas'), '');
    await sembrarValor(page, page.locator('#hipotecas'), '50000');
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);
    await expect(aviso).toHaveCount(0);
    await expect(page.locator('[class*="resultsPanel"]')).toContainText('introduce los bienes');
  });

  /**
   * ABIERTO — hallazgo (calculo, medio, Inspector 30/09/2026). El art. 22.2 LISD, tras la tabla de
   * coeficientes, CORRIGE EL SALTO: «Cuando la diferencia entre la cuota tributaria obtenida por la
   * aplicación del coeficiente multiplicador que corresponda y la que resultaría de aplicar a la
   * misma cuota íntegra el coeficiente multiplicador inmediato inferior sea mayor que la que exista
   * entre el importe del patrimonio preexistente tenido en cuenta para la liquidación y el importe
   * máximo del tramo de patrimonio preexistente que motivaría la aplicación del citado coeficiente
   * multiplicador inferior, aquélla se reducirá en el importe del exceso» (BOE-A-1987-28141).
   * La app pide el patrimonio por TRAMOS, así que no puede aplicarla: a quien pasa el umbral por
   * poco le cobra el coeficiente entero, sin avisar. El mismo sobrino del caso de arriba con
   * 402.700 € de patrimonio, 21,89 € por encima de 402.678,11:
   *   con 1,6676 → 19.359,02 · con 1,5882 → 18.437,27 · salto 921,75 > 21,89
   *   → cuota tributaria 18.437,27 + 21,89 = 18.459,16 € (la app: 19.359,02 €, 899,86 € de más)
   * Afirma lo correcto con un campo de IMPORTE para el patrimonio, que es lo que la regla necesita.
   */
  test('ABIERTO — con 402.700 € de patrimonio el art. 22.2 corrige el salto de coeficiente: 18.459,16 €', async ({ page }) => {
    test.fail(true, 'ABIERTO: el patrimonio se pide por tramos y no se aplica la corrección del salto del art. 22.2 LISD');
    await page.locator('#ccaa-causante').selectOption('galicia');
    await page.locator('#parentesco').selectOption('III');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');

    const campo = page.getByLabel(/Patrimonio preexistente/);
    expect(await campo.evaluate((e) => e.tagName), 'el patrimonio se pide por importe, no por tramo').toBe('INPUT');
    await sembrarValor(page, campo, '402.700');
    expect(await cuotaEstimada(page)).toBe('18.459,16 €');
  });

  /**
   * ABIERTO — hallazgo (dato, bajo, Inspector 30/09/2026) — era la sospecha del 27/09 sobre
   * `data/fiscal`. Los umbrales del art. 22.2 LISD («De 0 a 402.678,11 · De más de 402.678,11 a
   * 2.007.380,43 · De más de 2.007.380,43 a 4.020.770,98 · Más de 4.020.770,98») no están en
   * `data/fiscal/sucesiones.ts` —que sí tiene `COEFICIENTES_IS`, la otra mitad de la misma tabla—
   * y la página los TECLEA, truncados, en diez líneas: las cuatro opciones del selector, las
   * cuatro filas de la tabla comparativa y dos frases de la FAQ del coeficiente. Truncados dicen
   * otra cosa en el borde: con 402.678,11 € de patrimonio (tramo 1, ×1,0000) la única opción que
   * lo contiene es «402.678 € – 2.007.380 €» (×1,0500), porque la primera dice «Menos de 402.678 €».
   */
  test('ABIERTO — los umbrales de patrimonio del art. 22.2 salen de data/fiscal, con sus céntimos', async ({ page }) => {
    test.fail(true, 'ABIERTO: umbrales del art. 22.2 LISD tecleados y truncados, sin constante en data/fiscal');
    const modulo = readFileSync(join(process.cwd(), 'data/fiscal/sucesiones.ts'), 'utf8');
    for (const umbral of [/402_?678\.11/, /2_?007_?380\.43/, /4_?020_?770\.98/]) {
      expect(modulo, `data/fiscal no tiene el umbral ${umbral}`).toMatch(umbral);
    }
    const jsx = codigoSinComentarios('app/estimador-impuesto-sucesiones/page.tsx');
    for (const tecleado of ['402.678', '2.007.380', '4.020.770']) {
      expect(jsx, `sigue tecleado: ${tecleado}`).not.toContain(tecleado);
    }
    // Si el patrimonio se sigue pidiendo por tramos, el primero incluye su límite legal.
    const opciones = await page.locator('#patrimonio-preexistente option').allInnerTexts();
    if (opciones.length > 0) expect(opciones[0]).toContain('402.678,11');
  });

  /**
   * ABIERTO — hallazgo (contenido, bajo, Inspector 30/09/2026) — era la sospecha del 27/09. El
   * FAQPage del JSON-LD responde a «¿Cuánto se paga…?» que «Madrid o Andalucía bonifican el 99 % de
   * la CUOTA para cónyuge e hijos»: el 99 % sale de `bonifMadrid` y se le atribuye también a
   * Andalucía, cuando `BONIFICACIONES_CCAA_IS['andalucia']` le da exención TOTAL por debajo de
   * 1.000.000 € de base liquidable y el 99 % solo por encima. La herramienta de la misma página lo
   * desmiente: un hijo con 300.000 € en Andalucía liquida 0,00 €; siguiendo la FAQ, el 1 % de una
   * cuota de 53.692,81 € (293.043,13 € de base liquidable), 536,93 €. Es el canal que leen las IAs.
   */
  test('ABIERTO — el FAQPage no reduce Andalucía a «bonifica el 99 %»: por debajo de 1.000.000 € exime', async ({ page }) => {
    test.fail(true, 'ABIERTO: el FAQPage atribuye a Andalucía el 99 % de Madrid y calla la exención');
    await page.locator('#ccaa-causante').selectOption('andalucia');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '300000');
    expect(await cuotaEstimada(page)).toBe('0,00 €');

    const respuesta = await respuestaFaqJsonLd(page, /Cuánto se paga/);
    const hablaDeAndalucia = respuesta.includes('Andalucía');
    expect(!hablaDeAndalucia || /1\.000\.000|exen|exim/i.test(respuesta), respuesta).toBe(true);
  });

  /**
   * ABIERTO — hallazgo (dato, bajo, Inspector 30/09/2026) — era la sospecha del 27/09. El «2025» del
   * title, la tarjeta de Open Graph, la de Twitter y las keywords va TECLEADO en metadata.ts, y la
   * nota de la tabla comparativa dice «tarifa de 2025» a mano, con `FISCAL_SUCESIONES_META.vigencia`
   * sellado y usado por el DataReference de la misma página. Hoy coinciden; al re-sellar el módulo
   * en enero el DataReference dirá el año nuevo y el título seguirá en 2025 (la forma del 2331).
   * Y ya hoy, con Cataluña elegida, la página liquida con la vigencia 2026 de
   * `FISCAL_SUCESIONES_CATALUNA_META` bajo un título que dice 2025.
   */
  test('ABIERTO — el año del título, las tarjetas sociales y las keywords sale de la vigencia del sello', async ({ page }) => {
    test.fail(true, 'ABIERTO: el año va tecleado en metadata.ts y en la nota de la tabla');
    // En pantalla hoy coincide: 2025 es la vigencia del sello general.
    const anios = (await page.title()).match(/\b20\d\d\b/g) ?? [];
    expect(anios.every((a) => a === FISCAL_SUCESIONES_META.vigencia), await page.title()).toBe(true);

    const meta = codigoSinComentarios('app/estimador-impuesto-sucesiones/metadata.ts');
    expect(meta, 'año tecleado en metadata.ts').not.toMatch(/(Sucesiones|ISD) 20\d\d/);
    const jsx = codigoSinComentarios('app/estimador-impuesto-sucesiones/page.tsx');
    expect(jsx, 'año tecleado en la nota de la tabla comparativa').not.toMatch(/tarifa de 20\d\d/);
  });

  /**
   * ABIERTO — hallazgo (contenido, bajo, Inspector 30/09/2026). El WebApplication del JSON-LD
   * anuncia «Usufructo y nuda propiedad por la regla del 89 menos la edad», la forma abreviada que
   * `VALORACION_USUFRUCTO_IS` documenta como incompleta: solo vale desde los 20 años; por debajo el
   * art. 26.a LISD fija un 70 % plano, y el suelo es el 10 %. Con un usufructuario de 15 años la
   * regla anunciada da el 74 % y la herramienta, bien, el 70,0 %. El hallazgo 1196 arregló el
   * helper del campo y no llegó a esta línea del canal que leen las IAs.
   */
  test('ABIERTO — el WebApplication no anuncia el usufructo como «89 menos la edad» sin su techo del 70 %', async ({ page }) => {
    test.fail(true, 'ABIERTO: la característica del JSON-LD da la regla del usufructo sin su techo');
    await page.locator('#ccaa-causante').selectOption('madrid');
    await page.locator('#parentesco').selectOption('II');
    await sembrarValor(page, page.locator('#saldos-cuentas'), '100000');
    await page.getByRole('radio', { name: 'Usufructo' }).check();
    await sembrarValor(page, page.locator('#edad-usufructuario'), '15');
    expect(await importeDelPanel(page, /Tipo adquisición \(usufructo\)/)).toBe('70,0 %');

    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const webApp = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'WebApplication');
    const linea = ((webApp.featureList as string[]).find((c) => /usufructo/i.test(c)) ?? '').split(' ').join(' ');
    expect(!/89/.test(linea) || /70\s?%/.test(linea), linea).toBe(true);
  });

  /**
   * ABIERTO — hallazgo (accesibilidad, medio, Inspector 30/09/2026). El título «Qué no incluye esta
   * estimación» (16 px / 700, umbral 4,5:1) pinta `--danger` #C0392B, que el módulo declara en
   * `.container` y NO redeclara en `[data-theme='dark'] .container`, donde solo cambia el fondo
   * (`--danger-bg` #3D1A18): 4,76:1 en claro, 2,84:1 en oscuro. Es la forma del 1828 (`--success`
   * y `--bonif`), con un token semántico que `check:token-oscuro` deja fuera a propósito.
   */
  test('ABIERTO — en oscuro el título «Qué no incluye esta estimación» llega a 4,5:1', async ({ page }) => {
    test.fail(true, 'ABIERTO: --danger sin variante oscura en el módulo');
    const selector = '[class*="disclaimerTitulo"]';
    await expect(page.locator(selector)).toContainText('Qué no incluye esta estimación');
    const [claro] = await contrastes(page, [selector]);
    expect(claro.ratio, 'claro').toBeGreaterThanOrEqual(4.5);

    const contenedor = page.locator('header[class*="hero"]').locator('xpath=..');
    const fondoClaro = await contenedor.evaluate((e) => getComputedStyle(e).backgroundColor);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect
      .poll(() => contenedor.evaluate((e) => getComputedStyle(e).backgroundColor), { message: 'el tema oscuro se aplicó' })
      .not.toBe(fondoClaro);
    await page.waitForTimeout(700); // transición de 0,3 s de globals.css
    const [oscuro] = await contrastes(page, [selector]);
    expect(oscuro.ratio, 'oscuro').toBeGreaterThanOrEqual(4.5);
  });

  /**
   * ABIERTO — hallazgo (accesibilidad, bajo, Inspector 30/09/2026). El enlace «Agencia Tributaria»
   * del hero («Datos verificados: … — Fuente: …») solo se distingue del texto de al lado por el
   * color: sin subrayado (globals.css: `a { text-decoration: none }`) y a 1,14:1 de ese texto, cuando
   * WCAG 1.4.1 pide 3:1 o una marca que no sea el color. Y al pasar el ratón `a:hover` (0,1,1) gana a
   * `.linkFuente` (0,1,0) y lo pinta en `--primary-hover` #246B8A sobre el `--hero-bg` #1A5278: el
   * nombre de la fuente se queda a ~1,3:1 de su fondo.
   */
  test('ABIERTO — el enlace a la fuente del hero se distingue sin color y se lee al pasar el ratón', async ({ page }) => {
    test.fail(true, 'ABIERTO: enlace del hero sin subrayado y ilegible en hover');
    const enlace = page.locator('[class*="metaVerificado"] a');
    const medir = () =>
      enlace.evaluate((a) => {
        type Rgb = [number, number, number];
        const leer = (s: string): { c: Rgb; a: number } => {
          const p = (s.match(/rgba?\(([^)]+)\)/)?.[1] ?? '0,0,0,0').split(/[ ,/]+/).filter(Boolean).map(Number);
          return { c: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
        };
        const mezcla = (f: Rgb, b: Rgb, alfa: number): Rgb => [0, 1, 2].map((i) => f[i] * alfa + b[i] * (1 - alfa)) as Rgb;
        const lum = (c: Rgb) => {
          const t = (v: number) => {
            const x = v / 255;
            return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * t(c[0]) + 0.7152 * t(c[1]) + 0.0722 * t(c[2]);
        };
        const ratio = (x: Rgb, y: Rgb) => {
          const [l1, l2] = [lum(x), lum(y)];
          return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
        };
        const hero = a.closest('header') as HTMLElement;
        const fondo = leer(getComputedStyle(hero).backgroundColor).c;
        // Color efectivo de un nodo del hero: su color con su alfa, y la opacidad de sus ancestros.
        const efectivo = (el: Element): Rgb => {
          let opacidad = 1;
          for (let e: Element | null = el; e && e !== hero; e = e.parentElement) opacidad *= Number(getComputedStyle(e).opacity);
          const propio = leer(getComputedStyle(el).color);
          return mezcla(mezcla(propio.c, fondo, propio.a), fondo, opacidad);
        };
        const colorEnlace = efectivo(a);
        return {
          subrayado: getComputedStyle(a).textDecorationLine.includes('underline'),
          frenteAlTexto: ratio(colorEnlace, efectivo(a.parentElement as Element)),
          frenteAlFondo: ratio(colorEnlace, fondo),
        };
      });

    const reposo = await medir();
    expect(reposo.subrayado || reposo.frenteAlTexto >= 3, `en reposo: ${JSON.stringify(reposo)}`).toBe(true);
    await enlace.hover();
    await page.waitForTimeout(400); // transición de 0,2 s del color de los enlaces
    const encima = await medir();
    expect(encima.frenteAlFondo, `con el ratón encima: ${JSON.stringify(encima)}`).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * ABIERTO — hallazgo (contenido, bajo, Inspector 30/09/2026). La FAQ «¿Puedo deducir las deudas
   * del causante?» dice que no son deducibles las «garantizadas con cláusula de reserva de dominio».
   * Ni el art. 13 LISD ni el art. 32 RISD —las dos normas de las deudas deducibles— tienen esa
   * exclusión: deducen «con carácter general las deudas que dejare contraídas el causante» que se
   * acrediten, «salvo las que lo fuesen a favor de los herederos o de los legatarios de parte
   * alícuota y de los cónyuges, ascendientes, descendientes o hermanos de aquéllos», que es la
   * única, y que la FAQ recorta a «deudas contraídas con herederos». La herramienta, en cambio,
   * deduce cualquier deuda que se escriba en «Otros préstamos y deudas».
   */
  test('ABIERTO — la FAQ de las deudas no añade la exclusión de la «reserva de dominio», que la ley no tiene', async ({ page }) => {
    test.fail(true, 'ABIERTO: exclusión de deudas sin ancla en el art. 13 LISD ni en el art. 32 RISD');
    const texto = await textoCompleto(page);
    const desde = texto.indexOf('¿Puedo deducir las deudas del causante?');
    expect(desde, 'la pregunta sigue en la FAQ').toBeGreaterThan(-1);
    expect(texto.slice(desde, desde + 700)).not.toContain('reserva de dominio');
  });
});
