import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';
import { FISCAL_IRPF_META } from '../../data/fiscal/irpf';

/**
 * simulador-irpf-tramos — escala del IRPF por tramos, tipo marginal y medio, «¿qué pasa si subo X €?»
 * Escrita por el Inspector el 18/11/2026 (primera inspección, segmento fiscal).
 *
 * DE DÓNDE SALE CADA CIFRA — de `data/fiscal/irpf.ts`, NO de lo que devuelve la app
 * ─────────────────────────────────────────────────────────────────────────────────
 *   · TRAMOS_IRPF_2025 (estatal + autonómico medio; sello FISCAL_IRPF_META.verificado 2026-09-27,
 *     vigencia 2026): 19 % hasta 12.450 · 24 % hasta 20.200 · 30 % hasta 35.200 · 37 % hasta 60.000
 *     · 45 % hasta 300.000 · 47 % por encima.
 *   · MINIMOS_IRPF_2025.personal = 5.550 € (art. 57.1 LIRPF); personal_65 = 6.700 €.
 *   · `calcularCuotaIntegraGeneral(base, mínimo)` = escala(base) − escala(mínimo): el mínimo NO se
 *     resta de la base, se grava a tipo cero (art. 63.1.2.º LIRPF; el módulo cita literal el manual
 *     de Renta 2025 de la AEAT: «A la base liquidable general (sin descontar el importe del mínimo
 *     personal y familiar) se le aplicarán los tipos…»).
 *
 * Cuota acumulada de la escala en cada límite (a mano):
 *   12.450 → 2.365,50 · 20.200 → 4.225,50 · 35.200 → 8.725,50 · 60.000 → 17.901,50
 *   300.000 → 125.901,50
 *
 * CASO 1 (normal) · base 45.000 €, contribuyente sin hijos y menor de 65 (mínimo 5.550 €)
 *   escala(45.000) = 8.725,50 + 9.800 × 37 % (3.626,00)                         = 12.351,50 €
 *   escala(5.550)  = 5.550 × 19 %                                               =  1.054,50 €
 *   cuota íntegra  = 12.351,50 − 1.054,50                                       = 11.297,00 €
 *   tipo medio 11.297 / 45.000 = 25,10 % · marginal 37 % · renta neta 33.703,00 €
 *   +1.000 € → 46.000: la cuota sube 1.000 × 37 % = 370,00 € (37,0 % del incremento).
 * CASO 2 (límite, tramo más alto) · base 400.000 (máximo del deslizador) + 10.000 = 410.000 €
 *   tramo del 47 %: 110.000 × 47 % = 51.700,00 € · escala(410.000) = 177.601,50 €
 *   escala(400.000) = 172.901,50 € · diferencia 10.000 × 47 % = 4.700,00 € (47,0 %)
 *   Frontera 300.000 €: el último euro está en el tramo del 45 % (hasta 300.000 inclusive).
 *   Base 0: cuota 0,00 €, tipo medio 0,00 %, ningún tramo con importe.
 * CASO 3 (rechazo) · una base negativa no existe: el deslizador la acota a 0 (−5.000 → 0) y no
 *   pasa de 400.000 (450.000 → 400.000). Base 5.000 con incremento −10.000: la base final se
 *   queda en 0, así que la bajada REAL es de 5.000 € y la cuota baja 5.000 × 19 % = 950,00 €,
 *   el 19,0 % de lo que de verdad bajó la base.
 *
 * Los casos con `test.fail()` vigilan hallazgos ABIERTOS de esta inspección: el día que se reparen
 * darán «unexpectedly passed» y hay que quitarles la marca y dejar el caso como comprobación
 * normal (o reescribirlo si la reparación eligió otra salida, p. ej. renombrar «Cuota íntegra»).
 */

const RUTA = '/simulador-irpf-tramos/';

/** Texto con los espacios duros como espacios normales y el «%» pegado: tolera la reparación del
 *  espacio duro antes del «%» (hallazgo bajo de esta misma inspección). */
const normalizar = (s: string | null): string =>
  (s ?? '')
    .replace(/[  ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/ %/g, '%');

async function texto(loc: Locator): Promise<string> {
  return normalizar(await loc.first().textContent());
}

/** El panel que encabeza un <h2> (su padre directo). */
const panel = (page: Page, titulo: string | RegExp): Locator =>
  page.getByRole('heading', { level: 2, name: titulo }).locator('xpath=..');

/** La fila de la leyenda de un tramo («Tramo 47% (…)» + su cuenta), en la vista por tramos. */
const filaTramo = (page: Page, tipo: number): Locator =>
  panel(page, 'Cómo se reparte tu base entre los 6 tramos')
    .locator('strong')
    .filter({ hasText: new RegExp(`^Tramo ${tipo}\\s?%`) })
    .locator('xpath=..');

/** Valor de una tarjeta del «Resumen de la cuota IRPF» por su etiqueta. */
const valorResumen = (page: Page, etiqueta: string): Locator =>
  panel(page, 'Resumen de la cuota IRPF').locator(`css=div:has(> span:text-is("${etiqueta}")) > strong`);

async function faqPage(page: Page): Promise<{ name: string; acceptedAnswer: { text: string } }[]> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  for (const b of bloques) {
    const j = JSON.parse(b) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
    if (j['@type'] === 'FAQPage' && j.mainEntity) return j.mainEntity;
  }
  throw new Error('La página no lleva FAQPage');
}

/** Respuesta de la FAQ visible cuya pregunta (<strong>) casa con `pregunta`. */
async function respuestaVisible(page: Page, pregunta: RegExp): Promise<string> {
  const item = page.locator('strong', { hasText: pregunta }).first().locator('xpath=..');
  return texto(item.locator('p'));
}

test.describe('simulador-irpf-tramos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#baseSlider', '#incSlider']);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Lo que la app hace bien: la escala tramo a tramo y las diferencias
  // ═══════════════════════════════════════════════════════════════════════════

  test('CASO 1 · 45.000 €: desglose por tramos, marginal 37 % y +1.000 € → +370,00 € (37,0 %)', async ({ page }) => {
    await sembrarValor(page, '#baseSlider', 45000);
    const tramos = panel(page, 'Cómo se reparte tu base entre los 6 tramos');
    // 12.450 × 19 % · 7.750 × 24 % · 15.000 × 30 % · 9.800 × 37 % (cabecera, CASO 1)
    await expect.poll(() => texto(tramos)).toContain('9800,00 € × 37% = 3626,00 €');
    const t = await texto(tramos);
    expect(t).toContain('12.450,00 € × 19% = 2365,50 €');
    expect(t).toContain('7750,00 € × 24% = 1860,00 €');
    expect(t).toContain('15.000,00 € × 30% = 4500,00 €');
    expect(await texto(filaTramo(page, 45))).toContain('Sin importe en este tramo');
    expect(await texto(valorResumen(page, 'Tipo marginal'))).toBe('37%');

    await sembrarValor(page, '#incSlider', 1000);
    await page.getByRole('tab', { name: 'Comparativa' }).click();
    const aviso = panel(page, '¿Qué pasa si tu base cambia?').getByRole('status');
    await expect.poll(() => texto(aviso)).toContain('+370,00 € de cuota IRPF');
    expect(await texto(aviso)).toContain('(37,0% del incremento se va en impuestos)');
  });

  test('CASO 2 · tramo más alto: 400.000 + 10.000 → 110.000 € al 47 % = 51.700,00 €; diferencia 4.700,00 €', async ({ page }) => {
    await sembrarValor(page, '#baseSlider', 400000);
    await sembrarValor(page, '#incSlider', 10000);
    const tramos = panel(page, 'Cómo se reparte tu base entre los 6 tramos');
    await expect.poll(() => texto(filaTramo(page, 47))).toContain('110.000,00 € × 47% = 51.700,00 €');
    expect(await texto(filaTramo(page, 47))).toContain('(300.000,00 € – +∞)');
    expect(await texto(tramos)).toContain('240.000,00 € × 45% = 108.000,00 €');
    expect(await texto(valorResumen(page, 'Tipo marginal'))).toBe('47%');

    await page.getByRole('tab', { name: 'Comparativa' }).click();
    const comparativa = panel(page, '¿Qué pasa si tu base cambia?');
    // escala(400.000) = 172.901,50 € y escala(410.000) = 177.601,50 € (cabecera, CASO 2)
    await expect.poll(() => texto(comparativa)).toContain('Cuota íntegra: 172.901,50 €');
    expect(await texto(comparativa)).toContain('Cuota íntegra: 177.601,50 €');
    expect(await texto(comparativa.getByRole('status'))).toContain('+4700,00 € de cuota IRPF(47,0% del incremento');
  });

  test('CASO 2 · fronteras: 300.000 € tributa su último euro al 45 %; base 0 → cuota 0,00 €', async ({ page }) => {
    await sembrarValor(page, '#baseSlider', 300000);
    await expect.poll(() => texto(valorResumen(page, 'Tipo marginal'))).toBe('45%');
    expect(await texto(filaTramo(page, 47))).toContain('Sin importe en este tramo');
    expect(await texto(filaTramo(page, 45))).toContain('240.000,00 € × 45% = 108.000,00 €');

    await sembrarValor(page, '#baseSlider', 0);
    await expect.poll(() => texto(valorResumen(page, 'Cuota íntegra'))).toBe('0,00 €');
    expect(await texto(valorResumen(page, 'Tipo medio efectivo'))).toBe('0,00%');
    await expect(
      panel(page, 'Cómo se reparte tu base entre los 6 tramos').getByText('Sin importe en este tramo'),
    ).toHaveCount(6);
  });

  test('CASO 3 · rechazo: la base no admite negativos (−5.000 → 0) ni pasa de 400.000 (450.000 → 400.000)', async ({ page }) => {
    expect(await sembrarValorAcotado(page, '#baseSlider', -5000)).toBe('0');
    await expect.poll(() => texto(valorResumen(page, 'Cuota íntegra'))).toBe('0,00 €');
    expect(await texto(valorResumen(page, 'Renta neta tras IRPF'))).toBe('0,00 €');
    expect(await sembrarValorAcotado(page, '#baseSlider', 450000)).toBe('400000');

    // Base 5.000 con −10.000: la base final se queda en 0, nunca negativa (cabecera, CASO 3).
    await sembrarValor(page, '#baseSlider', 5000);
    await sembrarValorAcotado(page, '#incSlider', -10000);
    await expect.poll(() => texto(valorResumen(page, 'Cuota íntegra'))).toBe('0,00 €');
    expect(await texto(valorResumen(page, 'Renta neta tras IRPF'))).toBe('0,00 €');
  });

  test('la escala a 24.000 € da 5365,50 € (4.225,50 + 3.800 × 30 %)', async ({ page }) => {
    await sembrarValor(page, '#baseSlider', 24000);
    await expect.poll(() => texto(valorResumen(page, 'Cuota íntegra'))).toBe('5365,50 €');
    expect(await texto(valorResumen(page, 'Tipo medio efectivo'))).toBe('22,36%');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Inspección del 18/11/2026 — hallazgos ABIERTOS (test.fail hasta que se reparen)
  // ═══════════════════════════════════════════════════════════════════════════

  test('ABIERTO · la «Cuota íntegra» olvida el mínimo personal: 45.000 € → 11.297,00 €, no 12.351,50 €', async ({ page }) => {
    // Todo contribuyente tiene al menos el mínimo de 5.550 € (art. 57.1), que se grava a tipo cero
    // (art. 63.1.2.º; calcularCuotaIntegraGeneral(45.000, 5.550) = 11.297,00 €, CASO 1). La app
    // muestra escala(45.000) = 12.351,50 € como «Cuota íntegra», con tipo medio 27,45 % y renta neta
    // 32.648,50 €: 1.054,50 € de cuota de más para cualquier base que supere el mínimo.
    test.fail();
    await sembrarValor(page, '#baseSlider', 45000);
    await expect.poll(() => texto(valorResumen(page, 'Cuota íntegra')), { timeout: 3000 }).toBe('11.297,00 €');
    expect(await texto(valorResumen(page, 'Tipo medio efectivo'))).toBe('25,10%');
    expect(await texto(valorResumen(page, 'Renta neta tras IRPF'))).toBe('33.703,00 €');
  });

  test('ABIERTO · base 5.000 y −10.000: el porcentaje se mide sobre la bajada real (19,0 %), no sobre 10.000 (9,5 %)', async ({ page }) => {
    // La base final se acota a 0, así que solo bajó 5.000 € y la cuota bajó 950,00 € (CASO 3). La
    // app dice «Si bajas 10.000,00 € … −950,00 € (9,5% del incremento se va en impuestos)».
    test.fail();
    await sembrarValor(page, '#baseSlider', 5000);
    await sembrarValorAcotado(page, '#incSlider', -10000);
    await page.getByRole('tab', { name: 'Comparativa' }).click();
    const aviso = panel(page, '¿Qué pasa si tu base cambia?').getByRole('status');
    await expect.poll(() => texto(aviso), { timeout: 3000 }).toContain('(19,0% del incremento');
  });

  test('REPARADO (5158, 19/11/2026) · la FAQ visible no manda restar los mínimos de la base y dice lo mismo que el FAQPage', async ({ page }) => {
    // Art. 63.1.2.º LIRPF: el mínimo NO se resta de la base liquidable. Era: la FAQ visible decía
    // «…y restar los mínimos personales y familiares. Es la cifra a la que se aplican los tramos»;
    // el FAQPage, lo contrario. Ahora las dos salen de FAQ_BASE_LIQUIDABLE (faq.ts).
    const visible = await respuestaVisible(page, /Qué es la base liquidable/);
    expect(visible).not.toContain('restar los mínimos');
    const jsonLd = (await faqPage(page)).find((q) => /base liquidable/.test(q.name));
    expect(visible).toBe(normalizar(jsonLd?.acceptedAnswer.text ?? ''));
  });

  test('REPARADO (5158) · el paso 2 de «Cómo calcular tu IRPF a mano» no resta los mínimos para obtener la base liquidable', async ({ page }) => {
    // Era: «Resta los mínimos personales y familiares … El resultado es la base liquidable». Quien
    // lo siguiera con 45.050 € de base y el mínimo de 5.550 € metía 39.500 € y la app le daba
    // 10.316,50 €; por el art. 63.1.2.º son 12.370,00 − 1.054,50 = 11.315,50 € (999,00 € menos).
    const pasos = page.locator('h3', { hasText: 'Paso a Paso' }).locator('xpath=following-sibling::div[1]');
    const t = await texto(pasos);
    expect(t).not.toContain('Resta los mínimos personales y familiares');
    expect(t).toContain('El mínimo personal y familiar no se resta de ella (art. 63.1.2.º LIRPF)');
    expect(t).toContain('Aplica después la misma escala al importe del mínimo personal y familiar y resta esa cuota');
  });

  test('REPARADO (5158) · «Errores frecuentes» no da por error NO restar los mínimos de la base', async ({ page }) => {
    // Eran dos viñetas contra el art. 63.1.2.º: «No restar los mínimos personales y familiares de
    // la base imponible antes de aplicar tramos» y «la liquidable ya tiene restados los mínimos».
    await expect(page.locator('li', { hasText: 'No restar los mínimos' })).toHaveCount(0, { timeout: 2000 });
    await expect(page.locator('li', { hasText: 'ya tiene restados los mínimos' })).toHaveCount(0, { timeout: 2000 });
    await expect(page.locator('li', { hasText: 'Restar el mínimo personal y familiar de la base antes de aplicar los tramos' })).toHaveCount(1);
  });

  test('REPARADO (5159) · tipo marginal y medio: una sola respuesta, sin «siempre menor» ni «≈20 % con 40.000 €»', async ({ page }) => {
    // Con 40.000 € la escala da 10.501,50 € (26,25 %; 23,62 % con el mínimo de 5.550 €), no
    // «rondar el 20%». Y con base ≤ 12.450 € el medio IGUALA al marginal (19 %).
    const jsonLd = (await faqPage(page)).find((q) => /tipo marginal y (el )?tipo medio/.test(q.name));
    const respuesta = normalizar(jsonLd?.acceptedAnswer.text ?? '');
    expect(respuesta).not.toMatch(/rondar el 20%/);
    expect(respuesta).not.toContain('Siempre es menor');
    expect(respuesta).toContain('Con una base de hasta 12.450 € los dos coinciden (19%)');
    expect(respuesta).toContain('la escala da 10.501,50 € de cuota, un tipo medio del 26,25% (23,62% restando la cuota del mínimo personal de 5550 €)');
    expect(await respuestaVisible(page, /tipo marginal y (el )?tipo medio/)).toBe(respuesta);
  });

  test('REPARADO (5161) · «subo de tramo»: una sola respuesta en la FAQ visible y en el FAQPage', async ({ page }) => {
    // Las dos decían lo mismo con distintas palabras; ahora salen de FAQ_SUBIR_TRAMO (faq.ts),
    // con el ejemplo 35.000 → 36.000: 800 € al 37 %.
    const jsonLd = (await faqPage(page)).find((q) => /subo de tramo/.test(q.name));
    const respuesta = normalizar(jsonLd?.acceptedAnswer.text ?? '');
    expect(respuesta).toContain('solo los 800 € que entran en el tramo siguiente pagan el 37%');
    expect(await respuestaVisible(page, /subo de tramo/)).toBe(respuesta);
  });

  test('REPARADO (5160) · «Casos de uso»: jubilado de 24.000 € y familia con dos hijos cuadran con la escala', async ({ page }) => {
    // Jubilado: la escala da 5.365,50 € (22,36 %), con el mínimo de 65 años (6.700 €) 4.092,50 €
    // (17,05 %); la tarjeta decía «~3.866 €, tipo medio 16,1%». Familia: el soltero también tiene
    // su mínimo de 5.550 €; lo que ahorra la familia frente a él son los 5.100 € de los hijos al
    // 19 % = 969,00 €, no «2.023,50 € menos de cuota».
    const jubilado = await texto(page.locator('h4', { hasText: 'Jubilado con pensión' }).locator('xpath=..'));
    expect(jubilado).not.toContain('3.866');
    expect(jubilado).toContain('La escala da 5365,50 € (22,36%)');
    expect(jubilado).toContain('la cuota íntegra queda en 4092,50 €, un 17,05%');
    const familia = await texto(page.locator('h4', { hasText: 'Familia con un solo ingreso' }).locator('xpath=..'));
    expect(familia).not.toContain('2.023,50 € menos de cuota');
    expect(familia).toContain('la familia paga 969,00 € menos de cuota');
  });

  test('REPARADO (5164) · el <h1> lleva el año de la vigencia de data/fiscal, como el title y el FAQPage', async ({ page }) => {
    // Title, FAQPage y features dicen FISCAL_IRPF_META.vigencia (2026); el <h1>, la tabla y el
    // DataReference decían «2025» escrito a mano.
    await expect(page.locator('h1')).toContainText(FISCAL_IRPF_META.vigencia, { timeout: 2000 });
    await expect(page.locator('h3', { hasText: 'Tabla de Tramos IRPF' })).toContainText(FISCAL_IRPF_META.vigencia);
  });

  test('ABIERTO · el «%» del resumen va con espacio duro (U+00A0)', async ({ page }) => {
    // Norma de formato de meskeIA (25/09/2026). La app pega el «%»: «23,89%».
    test.fail();
    const crudo = (await valorResumen(page, 'Tipo medio efectivo').textContent()) ?? '';
    expect(crudo).toMatch(/\d %$/);
  });

  test('ABIERTO · las pestañas de vista enlazan con su panel (role="tabpanel" + aria-controls)', async ({ page }) => {
    // role="tablist"/"tab" sin ningún role="tabpanel" ni aria-controls: el lector anuncia
    // «pestaña 1 de 3» sin panel al que ir.
    test.fail();
    await expect(page.locator('[role="tabpanel"]')).toHaveCount(1, { timeout: 2000 });
    await expect(page.getByRole('tab').first()).toHaveAttribute('aria-controls', /.+/, { timeout: 2000 });
  });

  test('ABIERTO (cabo C0831, 19/11/2026) · «Mejores prácticas» no pone las donaciones entre lo que reduce la base liquidable', async ({ page }) => {
    // La tarjeta «Planifica antes de fin de año» dice: «Aportaciones a planes de pensiones (hasta
    // 1.500 €/año), donaciones, gastos deducibles… reducen tu base liquidable.» Los planes de
    // pensiones sí reducen la base (arts. 51-52 LIRPF; tope de 1.500 € en data/fiscal/pensiones.ts),
    // pero los donativos a entidades de la Ley 49/2002 se restan de la CUOTA: art. 19.1 de esa ley
    // (BOE-A-2002-25039, texto consolidado de 20/12/2023), literal: «Los contribuyentes del Impuesto
    // sobre la Renta de las Personas Físicas tendrán derecho a deducir de la cuota íntegra», con la
    // escala «250 euros. | 80» y «Resto base de deducción. | 40». Con 100 € donados son 80 € menos
    // de cuota; como reducción de base, a un marginal del 30 %, serían 30 €. Contradice además el
    // paso 4 de la guía de la propia app: «Cada deducción reduce directamente la cuota, no la base».
    // Se mira cada párrafo de las tarjetas: ninguno puede poner donaciones o donativos delante de
    // «reduce(n) tu/la base liquidable/imponible».
    test.fail();
    const tarjetas = page.locator('h3', { hasText: 'Mejores Prácticas' }).locator('xpath=following-sibling::div[1]');
    const parrafos = (await tarjetas.locator('p').allTextContents()).map(normalizar);
    expect(parrafos.length).toBeGreaterThan(0);
    const queMezclan = parrafos.filter((p) =>
      /(donaci|donativ)[^.]*reduc\w*\s+(tu|la)\s+base\s+(liquidable|imponible)/i.test(p),
    );
    expect(queMezclan).toEqual([]);
  });
});
