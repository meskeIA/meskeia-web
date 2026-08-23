import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-bono-joven-alquiler (segmento cálculo, riesgo 1 CRÍTICO)
 *
 * Reescrito el 23/08/2026 al reparar los hallazgos 147-155 de la inspección del 21/08.
 *
 * POR QUÉ SE REESCRIBIÓ ENTERO Y NO SE LE QUITARON LAS MARCAS
 * ──────────────────────────────────────────────────────────
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
 *
 * Los casos se resuelven a mano ANTES de ejecutar la app; el cálculo va junto a cada aserción.
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

test.describe('Simulador Bono Joven Alquiler — promesa y encuadre legal', () => {
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
   */
  test('no queda rastro de la convocatoria derogada (RD 42/2022)', async ({ page }) => {
    await page.goto(RUTA);
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('42/2022');
    // El «900 € en zona tensionada» es la marca del plan viejo: esa figura no existe en el nuevo
    expect(cuerpo).not.toContain('zonas tensionadas');
    expect(cuerpo).not.toContain('900 €');
  });

  /** Hallazgo 155 — regla de oro del proyecto: todo <button> lleva type. */
  test('todos los botones de la checklist declaran type="button"', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.locator('button[class*="radioBtn"]:not([type])')).toHaveCount(0);
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
});
