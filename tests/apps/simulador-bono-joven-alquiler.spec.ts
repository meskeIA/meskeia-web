import { test, expect, Page } from '@playwright/test';
import { BONO_ALQUILER_JOVEN_2026, UMBRAL_IPREM_VIVIENDA_JOVEN } from '../../data/fiscal/vivienda-joven';

/**
 * Inspector — simulador-bono-joven-alquiler (segmento fiscal, riesgo 1 CRÍTICO)
 *
 * Escrito el 23/08/2026 al reparar los hallazgos 147-155 de la inspección del 21/08.
 * AMPLIADO el 27/08/2026 en la re-inspección: los once casos anteriores siguen en verde
 * (la reparación cerró de verdad) y se añaden los casos que aquella no miró, más siete
 * hallazgos nuevos marcados con `test.fail()`.
 * AMPLIADO de nuevo el 28/08/2026 en la re-inspección de cierre del commit e1a42c65: los 24
 * casos anteriores siguen en verde —incluidos los siete que aquel commit reparó— y al final
 * hay tres casos nuevos y tres hallazgos abiertos, otra vez con `test.fail()`.
 *
 * POR QUÉ SE REESCRIBIÓ ENTERO EN SU DÍA Y NO SE LE QUITARON LAS MARCAS
 * ────────────────────────────────────────────────────────────────────
 * La versión anterior fijaba como contrato los umbrales que la app declaraba, y al ir a
 * repararla resultó que **esos umbrales eran de la convocatoria derogada**. La app decía
 * «la renta no supera 600 € (o 900 € en zonas tensionadas)», que es el RD 42/2022 (Plan
 * 2022-2025); el RD 326/2026 que la propia app cita en su hero fija otra cosa. Un test que
 * hereda el error de la app no protege de nada: lo consagra.
 *
 * DE DÓNDE SALE AHORA CADA CIFRA
 * ──────────────────────────────
 * De `data/fiscal/vivienda-joven.ts`, sellado el 23/08/2026 artículo por artículo contra el
 * texto del BOE (RD 326/2026, BOE-A-2026-8872). Los valores, con su artículo:
 *
 *   · art. 137     — ayuda máxima 300 €/mes (vivienda) y 200 €/mes (habitación),
 *                    SIEMPRE con el límite del 60 % de la renta mensual.
 *   · art. 133.1.e — renta máxima del contrato: 1.000 € vivienda · 600 € habitación,
 *                    y 500 / 250 € en municipios o núcleos de 10.000 habitantes o menos.
 *                    Es «igual o inferior»: el importe exacto del tope SÍ da derecho.
 *   · art. 134     — dos años, prorrogables por otros dos como máximo → 48 meses.
 *   · art. 133.1.b — «menos de treinta y cinco años, incluida la edad de treinta y cinco»,
 *                    y mayor de edad → 18 a 35 inclusive.
 *   · art. 133.1.d — rentas anuales ≤ 5 veces el IPREM (5,5 y 6 según discapacidad).
 *   · art. 136     — INCOMPATIBLE con cualquier otra ayuda al pago del alquiler o la cesión.
 *
 * Los casos se resuelven a mano ANTES de ejecutar la app; el cálculo va junto a cada aserción.
 * Los valores esperados van LITERALES para que se puedan leer sin abrir el módulo, y el
 * primer test comprueba que el módulo sigue diciendo exactamente eso: si el RD cambia, este
 * fichero avisa en vez de seguir pasando contra unas cifras que ya no son.
 *
 * REGRESIÓN de la re-inspección: al final. Estaban con `test.fail()` y hoy están reparados;
 * hoy fallan a propósito. El día que se reparen se les quita la línea `test.fail()` y quedan
 * como regresión.
 *
 * Nota de formato: es-ES NO agrupa los millares de un número de cuatro cifras
 * (8.640 → «8640,00 €») y sí los de cinco o más (14.400 → «14.400,00 €»). No es un fallo de
 * formato, es la regla de la RAE, y así lo hace Intl: no «corregirlo».
 * Además separa la cifra del € con espacio duro (U+00A0).
 */

const RUTA = '/simulador-bono-joven-alquiler/';

/** El formato de moneda es-ES separa la cifra del € con un espacio duro (U+00A0). */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');

/**
 * Los SEIS requisitos de la checklist, con el texto literal de `REQUISITOS` en page.tsx.
 * El de la renta ya no está: la app tiene el importe tecleado y el tope del RD, así que lo
 * comprueba ella en vez de preguntárselo al usuario (hallazgo 150).
 */
const REQUISITOS = {
  edad: 'Tienes entre 18 y 35 años (inclusive)',
  ingresos: 'Tus rentas anuales no superan 5 veces el IPREM',
  propietario: 'No eres propietario de una vivienda en España',
  habitual: 'La vivienda es tu residencia habitual y permanente',
  contrato: 'El contrato de arrendamiento está registrado (o lo estará)',
  comunidad: 'Tu Comunidad Autónoma tiene el Bono Joven activo',
} as const;

/** Valor de una de las tres tarjetas del panel de ahorro, buscada por su etiqueta. */
async function valorPanel(page: Page, etiqueta: string): Promise<string> {
  const tarjeta = page.locator('[class*="ahorroCard"]').filter({ hasText: etiqueta }).first();
  const valor = tarjeta.locator('[class*="ahorroValor"]').first();
  return (await valor.innerText()).replace(ESPACIO_DURO, ' ').trim();
}

/** Responde «Sí» o «No» a uno de los requisitos de la checklist. */
async function responder(page: Page, requisito: string, valor: 'Sí' | 'No'): Promise<void> {
  const tarjeta = page.locator('[class*="checkCard"]').filter({ hasText: requisito }).first();
  await tarjeta.getByRole('button', { name: valor, exact: true }).click();
}

/** Marca «Sí» en los seis requisitos. */
async function responderTodoSi(page: Page): Promise<void> {
  for (const texto of Object.values(REQUISITOS)) await responder(page, texto, 'Sí');
}

/** Texto de la tarjeta de veredicto (apto / casi / no-apto). */
async function textoResultado(page: Page): Promise<string> {
  const tarjeta = page.locator('[class*="resultadoCard"]').first();
  return (await tarjeta.innerText()).replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();
}

/** Escribe la renta mensual del contrato. */
async function ponerRenta(page: Page, valor: string): Promise<void> {
  await page.fill('#alquiler', valor);
  await page.waitForTimeout(150);
}

/**
 * Teclea carácter a carácter, que es lo único que reproduce lo que hace un usuario real con
 * un `input[type=number]`: `fill()` se niega a escribir lo que el campo rechazaría.
 */
async function teclearRenta(page: Page, valor: string): Promise<void> {
  const campo = page.locator('#alquiler');
  await campo.click();
  await campo.press('Control+a');
  await page.keyboard.type(valor);
  await page.waitForTimeout(150);
}

/**
 * Despliega el `<EducationalSection>`, que llega plegado.
 *
 * ⚠️ La primera versión recorría `nth(i)` sobre `button[aria-expanded="false"]`, que es un
 * locator VIVO: al pulsar el primero deja de casar y la lista encoge, así que `nth(1)` se
 * quedaba esperando a un elemento que ya no existe hasta agotar el timeout. Se resuelve
 * pulsando siempre el PRIMERO que quede, con un tope por si alguno no llega a abrirse.
 */
async function abrirGuia(page: Page): Promise<void> {
  const plegados = page.locator('button[aria-expanded="false"]');
  for (let i = 0; i < 20; i++) {
    if ((await plegados.count()) === 0) break;
    await plegados.first().click();
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(400);
}

/** Todo el texto visible de la página, con los espacios normalizados. */
async function textoVisible(page: Page): Promise<string> {
  return (await page.locator('body').innerText()).replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();
}

test.describe('Simulador Bono Joven Alquiler — promesa y encuadre legal', () => {
  /**
   * Candado del módulo. Los valores esperados de todo el fichero van escritos a mano para que
   * se puedan leer; esto comprueba que siguen siendo los del módulo sellado. Si el RD cambia y
   * el módulo se re-sella, este test cae PRIMERO y dice qué cifra hay que revisar aquí, en vez
   * de dejar pasar un fichero entero que ya no fija nada.
   */
  test('el módulo sellado sigue diciendo lo que este fichero da por supuesto', async () => {
    expect(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda).toBe(300);   // art. 137
    expect(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.habitacion).toBe(200); // art. 137
    expect(BONO_ALQUILER_JOVEN_2026.limiteSobreRenta).toBe(0.6);              // art. 137
    expect(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.vivienda).toBe(1000);  // art. 133.1.e
    expect(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.habitacion).toBe(600); // art. 133.1.e
    expect(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.municipioPequeno.vivienda).toBe(500);
    expect(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.municipioPequeno.habitacion).toBe(250);
    expect(BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses).toBe(48);         // art. 134
    expect(BONO_ALQUILER_JOVEN_2026.edad.minima).toBe(18);                    // art. 133.1.b
    expect(BONO_ALQUILER_JOVEN_2026.edad.maxima).toBe(35);                    // art. 133.1.b
    expect(UMBRAL_IPREM_VIVIENDA_JOVEN.general).toBe(5);                      // art. 133.1.d
    // art. 136 — incompatible con cualquier otra ayuda al pago del alquiler o la cesión
    expect(BONO_ALQUILER_JOVEN_2026.compatibleConOtrasAyudasAlquiler).toBe(false);
  });

  test('anuncia la ayuda, la norma vigente y lleva el disclaimer de riesgo 1', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Bono Joven Alquiler');
    await expect(page.locator('body')).toContainText('Real Decreto 326/2026');
    // Riesgo 1: el disclaimer crítico no puede plegarse
    const disclaimer = page.locator('[class*="disclaimerCard"]').first();
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer.getByRole('button')).toHaveCount(0);
  });

  /** Hallazgo 151 — riesgo 1 con datos caducables y sin declarar fuente ni fecha. */
  test('declara la fuente y la fecha de verificación de los datos normativos', async ({ page }) => {
    await page.goto(RUTA);
    const datos = page.getByRole('note', { name: /Datos de referencia/i });
    await expect(datos).toBeVisible();
    await expect(datos).toContainText('326/2026');
  });

  /**
   * Hallazgo 152 — el catálogo anunciaba la convocatoria anterior mientras la app servía la
   * nueva. Aquí se fija lo contrario: que en la página no reaparezcan las cifras derogadas.
   *
   * Ampliado el 27/08/2026: se mira la página ENTERA con la guía educativa desplegada y el
   * JSON-LD incluido, porque la trampa de una reparación de motor es dejar los restos en el
   * bloque educativo y en los datos estructurados, que es justo donde no se mira.
   */
  test('no queda rastro de la convocatoria derogada (RD 42/2022), ni plegado ni en el JSON-LD', async ({ page }) => {
    await page.goto(RUTA);
    await abrirGuia(page);
    const cuerpo = await textoVisible(page);
    const estructurado = (await page.locator('script[type="application/ld+json"]').allInnerTexts()).join(' ');

    for (const texto of [cuerpo, estructurado]) {
      expect(texto).not.toContain('42/2022');
      // El «900 € en zona tensionada» es la marca del plan viejo: esa figura no existe en el nuevo
      expect(texto).not.toMatch(/tensionad/i);
      expect(texto).not.toContain('900 €');
      // 250 €/mes era la cuantía de la ayuda en el plan derogado (hallazgos 152 y 153)
      expect(texto).not.toContain('250 €/mes');
      expect(texto).not.toContain('3.000 € anuales');
    }
    // Y la guía se ha abierto de verdad: si no, los `not.toContain` de arriba no prueban nada
    expect(cuerpo).toContain('Preguntas frecuentes sobre el Bono Joven');
  });

  /** Hallazgo 155 — regla de oro del proyecto: todo <button> lleva type. */
  test('todos los botones de la checklist declaran type="button"', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.locator('button[class*="radioBtn"]:not([type])')).toHaveCount(0);
  });

  /**
   * Los textos de la pantalla tienen que decir las mismas cifras que el motor aplica. Hoy
   * coinciden, pero están tecleados a mano en vez de salir del módulo (ver el hallazgo abierto
   * del final), así que este test es el que se enterará el día que uno de los dos se mueva.
   */
  test('los textos visibles anuncian las mismas cuantías que aplica el motor', async ({ page }) => {
    await page.goto(RUTA);
    await abrirGuia(page);
    const cuerpo = await textoVisible(page);
    expect(cuerpo).toContain('300 €/mes');            // art. 137 · vivienda
    expect(cuerpo).toContain('200 €/mes');            // art. 137 · habitación
    // «1000» y no «1.000»: la cifra ya no está tecleada, sale de
    // BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual por toLocaleString('es-ES'), y el español
    // NO agrupa los millares de un número de cuatro cifras. El punto era anglosajón.
    expect(cuerpo).toContain('1000 €/mes');           // art. 133.1.e · tope vivienda
    expect(cuerpo).toContain('600 €/mes');            // art. 133.1.e · tope habitación
    // «500 € y 250 €»: los dos importes salen de rentaMaximaMensual.municipioPequeno y cada
    // uno lleva su unidad, en vez del «500 y 250 €» que estaba escrito a mano.
    expect(cuerpo).toContain('500 € y 250 €');        // art. 133.1.e · municipio pequeño
    expect(cuerpo).toContain('entre 18 y 35 años');   // art. 133.1.b
    expect(cuerpo).toContain('5 veces el IPREM');     // art. 133.1.d
    expect(cuerpo).toContain('hasta 4 años');         // art. 134 · 24 + 24 meses
  });
});

test.describe('Simulador Bono Joven Alquiler — casos resueltos a mano', () => {
  /**
   * CASO 1 (NORMAL) — vivienda completa a 600 €/mes, los seis requisitos cumplidos.
   *
   * Tope del 60 %: 600 × 0,6 = 360 € · ayuda máxima del art. 137: 300 €
   *   → manda la menor: 300 €/mes.
   * Pago real: 600 − 300 = 300 €/mes.
   * Acumulado máximo: 300 × 48 meses = 14.400 €.
   * Renta 600 € ≤ 1.000 € (art. 133.1.e), así que da derecho.
   */
  test('CASO 1 NORMAL — vivienda a 600 €/mes: la ayuda es el tope de 300 €', async ({ page }) => {
    await page.goto(RUTA);
    await ponerRenta(page, '600');
    expect(await valorPanel(page, 'Ayuda mensual')).toBe('300,00 €');
    expect(await valorPanel(page, 'Tu pago real')).toBe('300,00 €');
    expect(await valorPanel(page, 'Máximo en 4 años')).toBe('14.400,00 €');

    await responderTodoSi(page);
    const veredicto = await textoResultado(page);
    expect(veredicto).toContain('¡Cumples todos los requisitos!');
    expect(veredicto).toContain('300,00 €');
  });

  /**
   * CASO 2 (LÍMITE) — el tope del 60 % muerde: vivienda a 300 €/mes.
   *
   * 300 × 0,6 = 180 € < 300 € de ayuda máxima → la ayuda es 180 €/mes.
   * Pago real: 300 − 180 = 120 €/mes.
   * Acumulado: 180 × 48 = 8.640 € (impreso «8640,00 €»: es-ES no agrupa cuatro cifras).
   *
   * Hallazgos 147 y 148: la tarjeta del acumulado usaba la ayuda MÁXIMA del programa
   * (300 × 48 = 14.400 €, 5.760 € de más) y el veredicto anunciaba 300 €/mes mientras el
   * panel de al lado decía 180 €. Las tres cifras tienen que hablar del mismo caso.
   */
  test('CASO 2 LÍMITE — el tope del 60 % manda y arrastra al acumulado y al veredicto', async ({ page }) => {
    await page.goto(RUTA);
    await ponerRenta(page, '300');
    expect(await valorPanel(page, 'Ayuda mensual')).toBe('180,00 €');
    expect(await valorPanel(page, 'Tu pago real')).toBe('120,00 €');
    expect(await valorPanel(page, 'Máximo en 4 años')).toBe('8640,00 €');

    await responderTodoSi(page);
    const veredicto = await textoResultado(page);
    expect(veredicto).toContain('180,00 €');
    expect(veredicto).not.toContain('300,00 €');
  });

  /**
   * CASO 3 (RECHAZO) — renta por encima del máximo del art. 133.1.e.
   *
   * Hallazgo 150: el requisito de renta estaba marcado como NO bloqueante y la app nunca
   * cruzaba el importe tecleado con su propio límite, así que 1.200 €/mes —el doble del tope
   * que la app declaraba— devolvía «Cumples los requisitos básicos».
   */
  test('CASO 3 RECHAZO — 1.200 €/mes supera el máximo de 1.000 € y se deniega', async ({ page }) => {
    await page.goto(RUTA);
    await responderTodoSi(page);
    await ponerRenta(page, '1200');

    const veredicto = await textoResultado(page);
    expect(veredicto).toContain('No cumples los requisitos obligatorios');
    expect(veredicto).toContain('1000,00 €');   // el tope que declara el RD, dicho al usuario

    // Hallazgo 149: y las cifras de la ayuda desaparecen, no conviven con la denegación
    await expect(page.locator('[class*="ahorroPanel"]')).toHaveCount(0);
  });

  /**
   * El tope es «igual o inferior» (art. 133.1.e): el importe exacto SÍ da derecho.
   * Es el borde que separa conceder de denegar, así que se fija en los dos sentidos.
   */
  test('LÍMITE EXACTO — 1.000 €/mes concede y 1.000,01 € deniega', async ({ page }) => {
    await page.goto(RUTA);
    await responderTodoSi(page);

    await ponerRenta(page, '1000');
    expect(await textoResultado(page)).toContain('¡Cumples todos los requisitos!');
    // 1.000 × 0,6 = 600 > 300 → manda la ayuda máxima
    expect(await valorPanel(page, 'Ayuda mensual')).toBe('300,00 €');

    await ponerRenta(page, '1000.01');
    expect(await textoResultado(page)).toContain('No cumples los requisitos obligatorios');
  });

  /**
   * HABITACIÓN — otra cuantía (200 €) y otro tope de renta (600 €), art. 137 y 133.1.e.
   * Una renta de 700 € da derecho en vivienda completa y NO en habitación: es justo el par
   * de casos que un tope único no distinguiría.
   */
  test('HABITACIÓN — 200 €/mes de ayuda y tope de renta de 600 €', async ({ page }) => {
    await page.goto(RUTA);
    await responderTodoSi(page);
    await page.getByRole('button', { name: /Habitación/ }).click();

    // 400 × 0,6 = 240 > 200 → manda el máximo de habitación
    await ponerRenta(page, '400');
    expect(await valorPanel(page, 'Ayuda mensual')).toBe('200,00 €');
    expect(await textoResultado(page)).toContain('¡Cumples todos los requisitos!');

    // 700 € supera el tope de 600 € de habitación...
    await ponerRenta(page, '700');
    expect(await textoResultado(page)).toContain('No cumples los requisitos obligatorios');

    // ...pero la misma renta en vivienda completa está por debajo de sus 1.000 €
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    expect(await textoResultado(page)).toContain('¡Cumples todos los requisitos!');
  });

  /**
   * HABITACIÓN BARATA (nuevo el 27/08/2026) — el 60 % muerde de verdad, no como tope teórico.
   *
   * Habitación a 100 €/mes: 100 × 0,6 = 60 € < 200 € de máximo (art. 137) → ayuda 60 €/mes.
   * Pago real: 100 − 60 = 40 €/mes.
   * Acumulado: 60 × 48 = 2.880 € (impreso «2880,00 €», cuatro cifras sin agrupar).
   * Renta 100 € ≤ 600 € (art. 133.1.e) → da derecho.
   *
   * Es el caso que separa «el 60 % se aplica» de «el 60 % se aplica también cuando la ayuda
   * queda ridícula»: la app no puede redondear al alza ni saltar al máximo del programa.
   */
  test('HABITACIÓN BARATA — a 100 €/mes la ayuda es 60 € y el acumulado 2.880 €', async ({ page }) => {
    await page.goto(RUTA);
    await responderTodoSi(page);
    await page.getByRole('button', { name: /Habitación/ }).click();
    await ponerRenta(page, '100');

    expect(await valorPanel(page, 'Ayuda mensual')).toBe('60,00 €');
    expect(await valorPanel(page, 'Tu pago real')).toBe('40,00 €');
    expect(await valorPanel(page, 'Máximo en 4 años')).toBe('2880,00 €');
    const veredicto = await textoResultado(page);
    expect(veredicto).toContain('¡Cumples todos los requisitos!');
    expect(veredicto).toContain('60,00 €');
  });

  /**
   * MUNICIPIO PEQUEÑO — en municipios o núcleos de 10.000 habitantes o menos el tope baja a
   * 500 € (vivienda) y 250 € (habitación), art. 133.1.e. La app no lo contemplaba en absoluto,
   * así que daba por elegible a todo el público rural con rentas que no dan derecho.
   */
  test('MUNICIPIO PEQUEÑO — el tope de vivienda baja de 1.000 € a 500 €', async ({ page }) => {
    await page.goto(RUTA);
    await responderTodoSi(page);
    await ponerRenta(page, '600');
    expect(await textoResultado(page)).toContain('¡Cumples todos los requisitos!');

    await page.getByRole('button', { name: /10\.000 habitantes o menos/ }).click();
    expect(await textoResultado(page)).toContain('No cumples los requisitos obligatorios');
    expect(await textoResultado(page)).toContain('500,00 €');

    // 500 € exactos sí dan derecho, y el tope del 60 % pasa a mandar: 500 × 0,6 = 300
    await ponerRenta(page, '500');
    expect(await textoResultado(page)).toContain('¡Cumples todos los requisitos!');
    expect(await valorPanel(page, 'Ayuda mensual')).toBe('300,00 €');
  });

  /**
   * MUNICIPIO PEQUEÑO + HABITACIÓN (nuevo el 27/08/2026) — la esquina donde los dos ejes se
   * cruzan, que es la que un tope leído de una tabla plana se dejaría.
   *
   * Tope: 250 €/mes (art. 133.1.e, habitación en municipio de ≤10.000 habitantes).
   * Renta 250 € (el tope exacto, «igual o inferior» → da derecho):
   *   250 × 0,6 = 150 € < 200 € de máximo → ayuda 150 €/mes · pago real 100 € ·
   *   acumulado 150 × 48 = 7.200 € («7200,00 €»).
   * Renta 251 € → un euro por encima del tope: se deniega, y el aviso cita 250 €, no 600 €
   *   (habitación en municipio normal) ni 500 € (vivienda en municipio pequeño).
   */
  test('MUNICIPIO PEQUEÑO + HABITACIÓN — tope de 250 €, ayuda de 150 € y denegación en 251 €', async ({ page }) => {
    await page.goto(RUTA);
    await responderTodoSi(page);
    await page.getByRole('button', { name: /Habitación/ }).click();
    await page.getByRole('button', { name: /10\.000 habitantes o menos/ }).click();

    await ponerRenta(page, '250');
    expect(await valorPanel(page, 'Ayuda mensual')).toBe('150,00 €');
    expect(await valorPanel(page, 'Tu pago real')).toBe('100,00 €');
    expect(await valorPanel(page, 'Máximo en 4 años')).toBe('7200,00 €');
    expect(await textoResultado(page)).toContain('¡Cumples todos los requisitos!');

    await ponerRenta(page, '251');
    const veredicto = await textoResultado(page);
    expect(veredicto).toContain('No cumples los requisitos obligatorios');
    expect(veredicto).toContain('250,00 €');
    expect(veredicto).not.toContain('600,00 €');
    expect(veredicto).not.toContain('500,00 €');
    await expect(page.locator('[class*="ahorroPanel"]')).toHaveCount(0);

    // El aviso en línea explica el porqué con la combinación correcta y cita el artículo
    const aviso = page.locator('[role="alert"]').filter({ hasText: 'La renta supera' }).first();
    const textoAviso = (await aviso.innerText()).replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ');
    expect(textoAviso).toContain('una habitación en un municipio de 10.000 habitantes o menos');
    expect(textoAviso).toContain('250,00 €');
    expect(textoAviso).toContain('133.1.e');
  });

  /**
   * RECHAZO por requisito imprescindible — ser propietario de una vivienda (art. 133.2.a).
   * Hallazgo 149: el panel de cifras seguía en pantalla junto a la denegación, que es
   * exactamente el riesgo del segmento — creer que se tiene derecho a lo que se acaba de negar.
   */
  test('RECHAZO por propietario — deniega, explica y retira las cifras', async ({ page }) => {
    await page.goto(RUTA);
    await ponerRenta(page, '600');
    await responderTodoSi(page);
    await responder(page, REQUISITOS.propietario, 'No');

    const veredicto = await textoResultado(page);
    expect(veredicto).toContain('No cumples los requisitos obligatorios');
    expect(veredicto).not.toContain('NaN');
    await expect(page.locator('[class*="ahorroPanel"]')).toHaveCount(0);
  });

  /**
   * ENTRADA BASURA (nuevo el 27/08/2026) — «abc» tecleado en el campo de la renta.
   *
   * El campo es `type="number"`, así que el navegador no deja que las letras lleguen al valor:
   * queda en cadena vacía. Lo que se fija aquí es lo que la app hace ENTONCES: no inventar una
   * ayuda, no imprimir NaN y no dar por buena una renta que no conoce.
   */
  test('ENTRADA BASURA — «abc» no llega al campo, no hay panel y no aparece NaN', async ({ page }) => {
    await page.goto(RUTA);
    await responderTodoSi(page);
    await teclearRenta(page, 'abc');

    expect(await page.locator('#alquiler').inputValue()).toBe('');
    await expect(page.locator('[class*="ahorroPanel"]')).toHaveCount(0);
    expect(await textoVisible(page)).not.toContain('NaN');
    // Sin renta no se puede juzgar el art. 133.1.e, así que el veredicto no es «apto»
    const veredicto = await textoResultado(page);
    expect(veredicto).toContain('Cumples los requisitos básicos');
    expect(veredicto).not.toContain('¡Cumples todos los requisitos!');
  });

  /**
   * CONTROL del hallazgo abierto de más abajo — la MISMA cantidad sin separador de millar sí
   * se deniega. Sirve para demostrar que lo que falla no es el umbral, sino la lectura del
   * número: 1500 se deniega y «1.500» se concede.
   */
  test('CONTROL — 1500 €/mes sin separador de millar se deniega correctamente', async ({ page }) => {
    await page.goto(RUTA);
    await responderTodoSi(page);
    await ponerRenta(page, '1500');

    const veredicto = await textoResultado(page);
    expect(veredicto).toContain('No cumples los requisitos obligatorios');
    expect(veredicto).toContain('1500,00 €');
    expect(veredicto).toContain('1000,00 €');
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * REGRESIÓN — los siete hallazgos de la re-inspección del 27/08/2026, REPARADOS ese mismo
 * día. Estaban escritos con `test.fail()` afirmando lo que debería ocurrir; al repararlos se
 * les quitó la marca y ahora sujetan la reparación.
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */
test.describe('Simulador Bono Joven Alquiler — hallazgos del 27/08/2026, reparados', () => {
  /**
   * REPARADO 1 (calculo, alto) — la renta escrita a la española se lee mil veces más pequeña.
   *
   * `page.tsx:89` hace `parseFloat(alquilMensual.replace(',', '.'))`, que es exactamente el
   * patrón que persigue `npm run check:parser`: «1.500» → 1,5. Y el navegador normaliza la
   * coma del teclado español al punto, así que tanto «1.500» como «1,500» acaban en 1,5.
   *
   * Esperado (art. 133.1.e): 1.500 € > 1.000 € → «No cumples los requisitos obligatorios».
   * El parser canónico del proyecto es `parseSpanishNumber` de `@/lib`.
   */
  test('REGRESIÓN 1 — «1.500» debe leerse como mil quinientos y denegar, no como 1,50 €', async ({ page }) => {
    await page.goto(RUTA);
    await responderTodoSi(page);
    await ponerRenta(page, '1.500');
    expect(await textoResultado(page)).toContain('No cumples los requisitos obligatorios');
  });

  /**
   * REPARADO 2 (contenido, alto) — la FAQ del bloque educativo contradice el art. 136.
   *
   * El módulo sella `compatibleConOtrasAyudasAlquiler: false`: la ayuda es INCOMPATIBLE con
   * cualquier otra ayuda al pago del alquiler o la cesión. La FAQ dice que «depende de cada
   * CA» y que «algunas permiten compatibilidad con ayudas autonómicas al alquiler».
   * En una app cuyo propio bloque de advertencias avisa de que el fraude conlleva devolución
   * más sanción, decirle a alguien que puede acumular ayudas que el RD prohíbe no es menor.
   */
  test('REGRESIÓN 2 — la FAQ debe decir que es incompatible con otras ayudas al alquiler (art. 136)', async ({ page }) => {
    await page.goto(RUTA);
    await abrirGuia(page);
    const cuerpo = await textoVisible(page);
    const i = cuerpo.indexOf('¿Es compatible el bono con otras ayudas?');
    expect(i).toBeGreaterThan(-1);
    const respuesta = cuerpo.slice(i, i + 260);
    expect(respuesta).toMatch(/incompatible/i);
    expect(respuesta).not.toContain('Algunas permiten compatibilidad con ayudas autonómicas al alquiler');
  });

  /**
   * REPARADO 3 (dato, medio) — el mismo error del art. 136, pero en el FAQPage JSON-LD.
   *
   * Es el mecanismo del hallazgo 153: el bloque estructurado se sirve a Bing Copilot, ChatGPT,
   * Perplexity y Gemini, así que la afirmación equivocada viaja fuera del sitio y ya no la
   * corrige el disclaimer de la página.
   */
  test('REGRESIÓN 3 — el FAQPage JSON-LD no puede afirmar compatibilidad contra el art. 136', async ({ page }) => {
    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allInnerTexts();
    const faq = bloques.map(b => JSON.parse(b)).find(b => b['@type'] === 'FAQPage');
    expect(faq).toBeTruthy();
    const respuestas: string = (faq.mainEntity as Array<{ acceptedAnswer: { text: string } }>)
      .map(q => q.acceptedAnswer.text).join(' ');
    expect(respuestas).not.toContain('Ambas ayudas pueden ser compatibles');
  });

  /**
   * REPARADO 4 (contenido, medio) — la FAQ deja la habitación «a criterio de la CA» mientras la
   * app la calcula.
   *
   * El RD 326/2026 incluye expresamente la modalidad de habitación (art. 137: 200 €/mes, y art.
   * 133.1.e: tope de 600 €), y la propia página lo dice en su tarjeta de escenario y la ofrece
   * como botón. La FAQ, tres pantallas más abajo, sigue con el texto del RD 42/2022, donde la
   * habitación sí quedaba a discreción de cada convocatoria autonómica.
   */
  test('REGRESIÓN 4 — la FAQ de la habitación debe ser coherente con el art. 137', async ({ page }) => {
    await page.goto(RUTA);
    await abrirGuia(page);
    const cuerpo = await textoVisible(page);
    const i = cuerpo.indexOf('¿Se puede pedir si tengo contrato de habitación?');
    expect(i).toBeGreaterThan(-1);
    const respuesta = cuerpo.slice(i, i + 240);
    expect(respuesta).not.toContain('otras solo pisos completos');
  });

  /**
   * REPARADO 5 (contenido, bajo) — el veredicto intermedio sigue listando la renta entre los
   * «aspectos adicionales» que pueden condicionar la aprobación.
   *
   * Es texto de antes de reparar el hallazgo 150: hoy la renta ya no es un aspecto que matice
   * nada, es una exclusión dura que la app calcula ella con el tope del art. 133.1.e, y si
   * fallara el usuario no vería este veredicto sino la denegación.
   */
  test('REGRESIÓN 5 — el veredicto «casi» ya no debe citar la renta como aspecto pendiente', async ({ page }) => {
    await page.goto(RUTA);
    await ponerRenta(page, '600');   // 600 ≤ 1.000: la app YA la ha validado
    for (const req of [REQUISITOS.edad, REQUISITOS.ingresos, REQUISITOS.propietario, REQUISITOS.habitual]) {
      await responder(page, req, 'Sí');
    }
    const veredicto = await textoResultado(page);
    expect(veredicto).toContain('Cumples los requisitos básicos');
    expect(veredicto).not.toContain('(renta, contrato registrado, disponibilidad en tu CA)');
  });

  /**
   * REPARADO 6 (accesibilidad, bajo) — emojis decorativos sin `aria-hidden` en el control que
   * decide la cuantía.
   *
   * `node scripts/check-a11y-jsx.mjs app/simulador-bono-joven-alquiler/page.tsx` señala tres:
   * L172 «🏠 Vivienda completa», L180 «🛏️ Habitación (piso compartido)» y L521 «⚠️ Advertencias
   * importantes». Es pasivo (líneas de marzo y mayo de 2026, anteriores al candado), pero las
   * dos primeras son los botones que eligen entre 300 y 200 €/mes, y el lector de pantalla los
   * anuncia empezando por el emoji.
   */
  test('REGRESIÓN 6 — el nombre accesible de los botones de modalidad no debe empezar por el emoji', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('button', { name: /Vivienda completa/ })).toHaveAccessibleName(/^Vivienda completa/);
    await expect(page.getByRole('button', { name: /Habitación/ })).toHaveAccessibleName(/^Habitación/);
  });

  /**
   * REPARADO 7 (dato, medio) — el motor lee del módulo sellado, pero los textos no.
   *
   * `page.tsx` importa `BONO_ALQUILER_JOVEN_2026` para calcular y deja tecleadas a mano las
   * mismas cifras en la prosa: la franja «entre 18 y 35 años» (existe
   * `BONO_ALQUILER_JOVEN_2026.edad`), el «5 veces el IPREM / 5,5 / 6» (existe
   * `UMBRAL_IPREM_VIVIENDA_JOVEN`, que la app ni siquiera importa), el hero, las etiquetas de
   * los dos botones de modalidad, la tabla comparativa, la tarjeta de escenario y el consejo
   * con los topes de renta.
   *
   * Es exactamente la grieta por la que se coló el defecto original: una reparación mueve el
   * motor y deja la prosa hablando de la convocatoria anterior. El módulo se creó para que la
   * cifra viva en un solo sitio; mientras haya dos, el candado no sirve de nada.
   */
  test('REGRESIÓN 7 — la edad y el umbral de IPREM deben salir del módulo, no estar tecleados', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const fuente = readFileSync(
      join(process.cwd(), 'app', 'simulador-bono-joven-alquiler', 'page.tsx'),
      'utf8',
    );
    expect(fuente).toContain('UMBRAL_IPREM_VIVIENDA_JOVEN');
    expect(fuente).not.toContain('Tienes entre 18 y 35 años (inclusive)');
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN DE CIERRE del 28/08/2026 — casos nuevos.
 *
 * Los 24 casos de arriba pasan: la reparación del commit e1a42c65 cerró de verdad los siete
 * hallazgos del 27/08 (440-446) y no ha movido ninguno de los once del 23/08. Lo que se añade
 * aquí es lo que aquella tanda no miró, sobre la parte del motor que el commit tocó.
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */
test.describe('Simulador Bono Joven Alquiler — casos nuevos del 28/08/2026', () => {
  /**
   * CASO NUEVO 1 (LÍMITE) — el punto exacto donde se cruzan los DOS topes del art. 137.
   *
   * El art. 137 pone dos techos a la vez: 300 €/mes de ayuda máxima en vivienda y el 60 % de
   * la renta. Se cruzan en una renta de 500 €/mes (500 × 0,6 = 300), que es el borde donde la
   * app cambia de un techo al otro. Los tests anteriores probaban los dos lados lejos del
   * cruce (300 € y 600 €), nunca el euro de antes y el de después.
   *
   * Resuelto a mano antes de ejecutar:
   *   · 499 € → 499 × 0,6 = 299,40 € < 300 → manda el 60 %: ayuda 299,40 € · pago 199,60 € ·
   *     acumulado 299,40 × 48 = 14.371,20 € · Y la nota «Límite: 60% de la renta» SÍ sale.
   *   · 500 € → 500 × 0,6 = 300,00 € = el máximo del art. 137: ayuda 300,00 € · pago 200,00 € ·
   *     acumulado 14.400,00 € · la nota NO sale (no hay recorte que anunciar).
   *   · 501 € → 501 × 0,6 = 300,60 € > 300 → manda el máximo: ayuda 300,00 € · pago 201,00 € ·
   *     acumulado 14.400,00 €.
   *
   * Las tres rentas están por debajo del tope del art. 133.1.e (1.000 €), así que las tres
   * conceden. Lo que se fija es que la ayuda sea continua en el borde y que el acumulado la
   * siga (es donde vivía el hallazgo 147).
   */
  test('CRUCE DE LOS DOS TOPES — 499 € recorta al 60 %, 500 € es el punto exacto y 501 € ya no', async ({ page }) => {
    await page.goto(RUTA);
    await responderTodoSi(page);
    const nota = page.locator('[class*="ahorroNota"]');

    await ponerRenta(page, '499');
    expect(await valorPanel(page, 'Ayuda mensual')).toBe('299,40 €');
    expect(await valorPanel(page, 'Tu pago real')).toBe('199,60 €');
    expect(await valorPanel(page, 'Máximo en 4 años')).toBe('14.371,20 €');
    await expect(nota).toHaveCount(1);   // el 60 % está mordiendo y se dice

    await ponerRenta(page, '500');
    expect(await valorPanel(page, 'Ayuda mensual')).toBe('300,00 €');
    expect(await valorPanel(page, 'Tu pago real')).toBe('200,00 €');
    expect(await valorPanel(page, 'Máximo en 4 años')).toBe('14.400,00 €');
    await expect(nota).toHaveCount(0);   // los dos topes coinciden: no hay recorte que anunciar

    await ponerRenta(page, '501');
    expect(await valorPanel(page, 'Ayuda mensual')).toBe('300,00 €');
    expect(await valorPanel(page, 'Tu pago real')).toBe('201,00 €');
    expect(await valorPanel(page, 'Máximo en 4 años')).toBe('14.400,00 €');
    await expect(nota).toHaveCount(0);
  });

  /**
   * CASO NUEVO 2 (RECHAZO) — la renta excluye ella sola, sin checklist.
   *
   * El art. 133.1.e es una condición del propio Real Decreto, no un aspecto que la comunidad
   * autónoma matice: una renta por encima del tope deniega aunque el usuario no haya
   * contestado todavía a ningún requisito. Todos los rechazos anteriores contestaban los seis
   * primero, así que la precedencia de la renta sobre «pendiente» no estaba fijada por nadie.
   *
   * Resuelto a mano: vivienda completa, 1.200 €/mes, checklist intacta (los seis en ⬜) →
   * 1.200 > 1.000 → «No cumples los requisitos obligatorios», el aviso cita el tope 1000,00 €
   * y lo introducido 1200,00 €, y el panel de cifras no llega a aparecer.
   */
  test('RECHAZO SIN CHECKLIST — 1.200 €/mes deniega antes de responder a ningún requisito', async ({ page }) => {
    await page.goto(RUTA);
    await ponerRenta(page, '1200');

    const veredicto = await textoResultado(page);
    expect(veredicto).toContain('No cumples los requisitos obligatorios');
    expect(veredicto).toContain('1000,00 €');
    expect(veredicto).toContain('1200,00 €');
    await expect(page.locator('[class*="ahorroPanel"]')).toHaveCount(0);

    // Y ningún requisito se ha respondido: el rechazo no viene de la checklist
    await expect(page.locator('button[class*="radioBtnActive"]')).toHaveCount(0);
  });

  /**
   * CASO NUEVO 3 (PARSER, el que tocó el commit) — la renta tecleada como la teclea un usuario.
   *
   * El hallazgo 440 decía «campo de renta = "1.500" … idéntico tecleando "1,500"», y la
   * REGRESIÓN 1 de arriba solo prueba la primera forma, y con `fill()`, que escribe en el DOM
   * sin pasar por el teclado. Aquí se teclea carácter a carácter y en un navegador con locale
   * español, que es donde el `input[type=number]` decide qué hace con el separador.
   *
   * Resuelto a mano: las tres formas son la misma cantidad, mil quinientos euros, y las tres
   * superan el tope del art. 133.1.e (1.000 €) → las tres deben denegar.
   */
  test.describe('con el navegador en español', () => {
    test.use({ locale: 'es-ES' });

    test('PARSER TECLEADO — «1500», «1.500» y «1,500» son la misma renta y las tres deniegan', async ({ page }) => {
      await page.goto(RUTA);
      await responderTodoSi(page);

      for (const tecleado of ['1500', '1.500', '1,500']) {
        await teclearRenta(page, tecleado);
        const veredicto = await textoResultado(page);
        expect(veredicto, `tecleando «${tecleado}»`).toContain('No cumples los requisitos obligatorios');
        expect(veredicto, `tecleando «${tecleado}»`).toContain('1500,00 €');
      }
    });
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * HALLAZGOS ABIERTOS de la re-inspección del 28/08/2026.
 *
 * Cada uno con UNA sola aserción de fondo: con `test.fail()` basta con fallar en algún punto,
 * así que dos aserciones pueden tapar que la que documenta el hallazgo ni se evalúa.
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */
test.describe('Simulador Bono Joven Alquiler — hallazgos abiertos (28/08/2026)', () => {
  /**
   * HALLAZGO A (contenido, medio) — el veredicto afirma haber comprobado una renta que no existe.
   *
   * Lo escribió el propio commit e1a42c65 al reparar el hallazgo 445: donde antes la nota
   * listaba la renta entre los aspectos pendientes, ahora afirma «La renta ya está comprobada
   * aquí arriba contra el tope del art. 133.1.e». Es cierto cuando hay una renta tecleada y
   * FALSO cuando no la hay, que es justo el caso en que este veredicto aparece con los seis
   * requisitos contestados: sin renta, `rentaDentroDelLimite` es `null` y la app no ha
   * comprobado nada.
   *
   * Con el campo vacío y los seis «Sí»: esperado que el veredicto no dé por hecha una
   * comprobación que no ha ocurrido. La misma frase sale con «-500» tecleado —el campo se ve
   * lleno y `Math.max(0, …)` lo convierte en 0 sin decirlo—, que es la versión silenciosa.
   */
  test('HALLAZGO A — sin renta tecleada, el veredicto no puede decir que la renta ya está comprobada', async ({ page }) => {
    test.fail();
    await page.goto(RUTA);
    await responderTodoSi(page);
    expect(await textoResultado(page)).not.toContain('La renta ya está comprobada');
  });

  /**
   * HALLAZGO B (dato, medio) — el FAQPage y la página contestan distinto a quién fija el
   * umbral de ingresos.
   *
   * La reparación derivó el requisito visible de `UMBRAL_IPREM_VIVIENDA_JOVEN` y hoy la
   * checklist dice «El RD 326/2026 fija el umbral en 5 veces el IPREM … Cada Comunidad
   * Autónoma concreta el CÓMPUTO en su convocatoria». El FAQPage JSON-LD, que no se tocó,
   * sigue contestando a la pregunta «¿Cuáles son los requisitos de ingresos…?» con «cada
   * Comunidad Autónoma concreta ese UMBRAL en su propia convocatoria», sin la cifra del art.
   * 133.1.d que el módulo sella.
   *
   * Es el mecanismo del hallazgo 442, reparado en la respuesta de al lado ocho días antes: el
   * bloque estructurado es el que citan Bing Copilot, ChatGPT, Perplexity y Gemini, donde ya
   * no va acompañado ni del disclaimer ni de la checklist que sí lleva la cifra.
   *
   * Esperado: la respuesta del FAQPage sobre ingresos nombra el umbral sellado (5 veces el
   * IPREM). Obtenido: no menciona el IPREM en ningún punto.
   */
  test('HALLAZGO B — el FAQPage debe dar el umbral de ingresos del art. 133.1.d, no remitirlo a la CA', async ({ page }) => {
    test.fail();
    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allInnerTexts();
    const faq = bloques.map(b => JSON.parse(b)).find(b => b['@type'] === 'FAQPage');
    const preguntas = (faq?.mainEntity ?? []) as Array<{ name: string; acceptedAnswer: { text: string } }>;
    const ingresos = preguntas.find(q => /requisitos de ingresos/i.test(q.name));
    expect(ingresos?.acceptedAnswer.text ?? '').toContain('IPREM');
  });

  /**
   * HALLAZGO C (dato, bajo) — la deduplicación no llegó a `metadata.ts`.
   *
   * El commit e1a42c65 hizo que ocho literales normativos de `page.tsx` salieran del módulo
   * sellado, y en la app hermana de la misma tanda (`simulador-heredar-vivienda`) derivó
   * también el `metadata.ts`, importando `TRAMOS_GANANCIAS_PATRIMONIALES_2025`. Aquí no:
   * `metadata.ts` mantiene la segunda copia entera a mano —300 €/mes, 200 €/mes, 4 años, el
   * 60 %, la franja 18-35 y los 3.600 / 2.400 € anuales— en `description`, `twitter`, las
   * `features` del WebApplication y tres respuestas del FAQPage.
   *
   * Hoy las dos copias dicen lo mismo, así que es riesgo de deriva y no un error a la vista.
   * Pero es exactamente la deriva de los hallazgos 152 y 153 en esta misma app, que sirvió
   * durante meses «hasta 250 €/mes durante 2 años» y «máximo 3.000 € anuales» del RD 42/2022
   * mientras el motor ya calculaba con el RD 326/2026.
   *
   * Esperado: ningún importe del art. 137 tecleado en `metadata.ts` (que se derive, como en
   * `page.tsx`). Obtenido: «300 €/mes» escrito a mano cuatro veces.
   */
  test('HALLAZGO C — metadata.ts no debe conservar la copia tecleada de las cuantías del art. 137', async () => {
    test.fail();
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const fuente = readFileSync(
      join(process.cwd(), 'app', 'simulador-bono-joven-alquiler', 'metadata.ts'),
      'utf8',
    );
    expect(fuente).not.toContain('300 €/mes');
  });
});
