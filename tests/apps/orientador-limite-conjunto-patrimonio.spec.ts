import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * orientador-limite-conjunto-patrimonio — Inspector, primera inspección (16/11/2026)
 *
 * Motor: `orientarLimiteConjunto` de data/fiscal/patrimonio.ts (LIMITE_CONJUNTO_PORCENTAJE = 0,60,
 * TOPE_REDUCCION_PORCENTAJE = 0,80, ITSGF_UMBRAL = 3.000.000, BONIFICACIONES_CCAA_PATRIMONIO).
 *
 * Norma (BOE, leída el 16/11/2026):
 *   · Ley 19/1991, art. 31 (BOE-A-1991-14392):
 *       Uno: cuota íntegra IP + cuotas del IRPF ≤ «60 por 100» de la suma de las bases imponibles
 *       del IRPF; c) si se supera, «se reducirá la cuota del Impuesto sobre el Patrimonio hasta
 *       alcanzar el límite indicado», sin que la reducción exceda del 80 por 100.
 *       a) «No se tendrá en cuenta la parte de la base imponible del ahorro derivada de ganancias y
 *       pérdidas patrimoniales que corresponda al saldo positivo de las obtenidas por las
 *       transmisiones de elementos patrimoniales adquiridos […] con más de un año de antelación […],
 *       ni la parte de las cuotas íntegras del IRPF correspondientes a dicha parte».
 *       Dos: con IRPF conjunto, «el límite […] se calculará acumulando las cuotas íntegras» de IP, y
 *       «la reducción […] se prorrateará entre los sujetos pasivos en proporción a sus respectivas
 *       cuotas íntegras en el Impuesto sobre el Patrimonio».
 *   · Ley 38/2022, art. 3 (ITSGF, BOE-A-2022-22684): Nueve, mínimo exento de 700.000 €; Once,
 *       tarifa con la base liquidable «Hasta 3.000.000,00» al «0,00» % y el resto, hasta
 *       2.347.998,03 €, al 1,7 %; Quince, se deduce la cuota de IP «efectivamente satisfecha»;
 *       Diecinueve, declaran quienes tienen cuota a ingresar.
 *
 * Los esperados se calcularon a mano ANTES de abrir el navegador. Los casos «HALLAZGO (…, ABIERTO)»
 * llevan test.fail(): describen lo que DEBERÍA pasar y hoy no pasa. Al reparar cada uno se quita su
 * test.fail() —comprobando antes que lo que afirma sigue siendo lo correcto— y el título pasa a
 * REPARADO.
 */

const RUTA = '/orientador-limite-conjunto-patrimonio/';
const BI = '#bi-irpf';
const IRPF = '#cuota-irpf';
const IP = '#cuota-patrimonio';
const PATRIMONIO = '#patrimonio-neto';

interface Datos {
  ccaa: string;
  bi: string;
  irpf: string;
  ip: string;
  patrimonio?: string;
  conjunta?: boolean;
}

async function rellenar(page: Page, d: Datos) {
  if (d.conjunta) await page.getByRole('button', { name: 'Conjunta (matrimonio)' }).click();
  await page.locator('#ccaa').selectOption(d.ccaa);
  for (const [sel, valor] of [[BI, d.bi], [IRPF, d.irpf], [IP, d.ip]] as const) {
    await page.locator(sel).fill(valor);
    await esperarValorEnReact(page, sel, valor);
  }
  if (d.patrimonio) {
    await page.locator(PATRIMONIO).fill(d.patrimonio);
    await esperarValorEnReact(page, PATRIMONIO, d.patrimonio);
  }
}

const boton = (page: Page) => page.getByRole('button', { name: 'Comprobar mi situación' });
const resultado = (page: Page) => page.locator('#resultado-orientacion');

async function comprobar(page: Page, d: Datos) {
  await rellenar(page, d);
  await boton(page).click();
  await expect(resultado(page)).toBeVisible();
}

/** Formato de formatCurrency (es-ES): espacio duro antes del €. */
const eur = (s: string) => `${s} €`;

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, [BI, IRPF, IP, PATRIMONIO]);
});

test.describe('Art. 31 Ley 19/1991: casos resueltos a mano', () => {
  test('CASO 1 (normal, el ejemplo de la FAQ): Cataluña, BI 100.000, IRPF 35.000, IP 40.000 → reducción 15.000 €', async ({ page }) => {
    // 35.000 + 40.000 = 75.000 > 0,60 × 100.000 = 60.000 → exceso 15.000; tope 0,80 × 40.000 = 32.000.
    // Reducción = min(15.000, 32.000) = 15.000; cuota tras reducción = 40.000 − 15.000 = 25.000.
    await comprobar(page, { ccaa: 'cataluna', bi: '100.000', irpf: '35.000', ip: '40.000' });
    await expect(resultado(page)).toContainText('Podrías beneficiarte de la reducción');
    await expect(resultado(page)).toContainText(eur('15.000,00'));
    await expect(resultado(page)).toContainText(eur('25.000,00'));
  });

  test('CASO 2a (límite): la suma justo en el 60 % no reduce nada («no podrá exceder»)', async ({ page }) => {
    // Aragón, BI 50.000 → límite 30.000; 10.000 + 20.000 = 30.000 → exceso 0 → sin reducción.
    await comprobar(page, { ccaa: 'aragon', bi: '50.000', irpf: '10.000', ip: '20.000' });
    await expect(resultado(page)).toContainText('La reducción no se activa en tu caso');
    await expect(resultado(page)).toContainText(/\(30\.000\s€\)[^]*\(30\.000\s€\)/);
  });

  test('CASO 2b (límite): un euro por encima del 60 % reduce un euro', async ({ page }) => {
    // 10.000 + 20.001 = 30.001 − 30.000 = 1 € de exceso; tope 16.000,80 → reducción 1 €, cuota 20.000 €.
    await comprobar(page, { ccaa: 'aragon', bi: '50.000', irpf: '10.000', ip: '20.001' });
    await expect(resultado(page)).toContainText(eur('1,00'));
    await expect(resultado(page)).toContainText(eur('20.000,00'));
  });

  test('CASO 2c (límite): cuota IRPF 0 y el tope del 80 % — siempre se paga el 20 % de la cuota de IP', async ({ page }) => {
    // Cataluña, BI 5.000 → límite 3.000; 0 + 20.000 = 20.000 → exceso 17.000 > tope 0,80 × 20.000 = 16.000.
    // Reducción 16.000 €; cuota 4.000 € (formato es-ES de cuatro cifras: «4000,00 €», sin punto).
    await comprobar(page, { ccaa: 'cataluna', bi: '5.000', irpf: '0', ip: '20.000' });
    await expect(resultado(page)).toContainText(eur('16.000,00'));
    await expect(resultado(page)).toContainText(eur('4000,00'));
  });

  test('CASO 2d: con IRPF conjunto el límite se calcula ACUMULANDO las cuotas de IP (art. 31.Dos)', async ({ page }) => {
    // BI conjunta 60.000 → límite 36.000; IRPF 12.000 + IP (30.000 + 10.000) = 52.000 → exceso 16.000;
    // tope 0,80 × 40.000 = 32.000 → reducción 16.000 € (12.000 y 4.000 prorrateados por cuota de IP);
    // cuota tras reducción 24.000 €. El agregado de la app ES el método de la ley.
    await comprobar(page, { ccaa: 'aragon', bi: '60.000', irpf: '12.000', ip: '40.000', conjunta: true });
    await expect(resultado(page)).toContainText(eur('16.000,00'));
    await expect(resultado(page)).toContainText(eur('24.000,00'));
  });

  test('CASO 2e: con las cifras del art. 31.Uno.a (sin la ganancia a más de un año) el motor da la reducción', async ({ page }) => {
    // Base general 20.000 con mínimo 5.550: calcularCuotaIntegraGeneral = 4.177,50 − 1.054,50 = 3.123 €.
    // Aragón, IP 30.000: 3.123 + 30.000 = 33.123 > 12.000 → exceso 21.123 < tope 24.000 → 21.123 €;
    // cuota 8.877 € («8877,00 €»).
    await comprobar(page, { ccaa: 'aragon', bi: '20.000', irpf: '3.123', ip: '30.000' });
    await expect(resultado(page)).toContainText(eur('21.123,00'));
    await expect(resultado(page)).toContainText(eur('8877,00'));
  });

  test('ITSGF: Madrid (bonificación total) con patrimonio neto de 5.000.000 € avisa del ITSGF', async ({ page }) => {
    // Base liquidable ITSGF = 5.000.000 − 700.000 = 4.300.000 → (4.300.000 − 3.000.000) × 1,7 % = 22.100 €
    // de cuota íntegra, sin IP satisfecha que deducir: el aviso procede.
    await comprobar(page, { ccaa: 'madrid', bi: '60.000', irpf: '15.000', ip: '1', patrimonio: '5.000.000' });
    await expect(resultado(page)).toContainText('No aplica en tu CCAA');
    await expect(resultado(page)).toContainText('Atención al ITSGF');
  });

  test('CASO 3 (rechazo): cuota IRPF negativa o base imponible 0 no se calculan, y el aviso dice por qué', async ({ page }) => {
    // Desde el hallazgo 4883 el botón no se apaga: se pulsa y sale el aviso de lo que falla.
    const aviso = page.locator('main').getByRole('alert');
    await rellenar(page, { ccaa: 'cataluna', bi: '100.000', irpf: '-5.000', ip: '40.000' });
    await boton(page).click();
    await expect(aviso).toContainText('no puede ser negativa');
    await expect(resultado(page)).toHaveCount(0);
    await page.locator(IRPF).fill('35.000');
    await esperarValorEnReact(page, IRPF, '35.000');
    await boton(page).click();
    await expect(resultado(page)).toBeVisible();
    await page.locator(BI).fill('0');
    await esperarValorEnReact(page, BI, '0');
    await boton(page).click();
    await expect(aviso).toContainText('base imponible del IRPF debe ser mayor que 0');
    await expect(resultado(page)).toHaveCount(0);
  });
});

test.describe('Hallazgos de la inspección del 16/11/2026', () => {
  test('REPARADO (hallazgo 4877) · la pista de la base imponible no excluía la ganancia a más de un año (art. 31.Uno.a)', async ({ page }) => {
    // Base general 20.000 y una ganancia de 400.000 € por un inmueble con 10 años. Siguiendo la pista
    // vieja («Suma de la base general + base del ahorro»): BI 420.000 e IRPF 3.123 + 101.880 (escala
    // del ahorro de data/fiscal) = 105.003 → la app dice «no se activa». Con el art. 31.Uno.a: BI
    // 20.000, IRPF 3.123 → reducción 21.123 € (CASO 2e). La pista, el panel y la FAQ lo advierten.
    await comprobar(page, { ccaa: 'aragon', bi: '420.000', irpf: '105.003', ip: '30.000' });
    await expect(resultado(page)).toContainText('La reducción no se activa en tu caso');
    const pista = page.locator(`${BI} ~ span`);
    await expect(pista).toContainText(/ganancias/i);
    await expect(pista).toContainText('más de un año');
    await expect(page.locator('main').getByText(/art\. 31\.Uno\.a/).first()).toBeVisible();
  });

  test('REPARADO (hallazgo 4885) · «¿Qué es el límite conjunto?» tiene UNA respuesta para la FAQ visible y el FAQPage', async ({ page }) => {
    interface Pregunta { name: string; acceptedAnswer: { text: string } }
    interface BloqueLd { '@type'?: string; mainEntity?: Pregunta[] }
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b) as BloqueLd).find((j) => j['@type'] === 'FAQPage');
    const pregunta = faq?.mainEntity?.find((q) => /Qué es el límite conjunto/.test(q.name));
    const visible = await page
      .locator('h4', { hasText: '¿Qué es exactamente el límite conjunto IRPF-Patrimonio?' })
      .locator('xpath=following-sibling::p[1]')
      .textContent();
    expect(visible).toBe(pregunta?.acceptedAnswer.text);
    expect(visible).toMatch(/más de un año/);
  });

  test('REPARADO (hallazgo 4878) · con IRPF conjunto la app decía que el cálculo exacto es individual, y la ley acumula (art. 31.Dos)', async ({ page }) => {
    await page.getByRole('button', { name: 'Conjunta (matrimonio)' }).click();
    const pista = page.getByText(/En IRPF conjunta: indica los datos sumados/);
    await expect(pista).toBeVisible();
    await expect(pista).not.toContainText('requiere prorrateo individual');
    await expect(pista).toContainText('acumulando las cuotas íntegras');
    // Ni la FAQ, ni la tabla, ni el escenario, ni los consejos describen ya límites individuales por rentas
    const textoGuia = (await page.locator('[data-guia-educativa]').textContent()) ?? '';
    expect(textoGuia).not.toMatch(/prorrateando|prorrateo individual|según sus rentas individuales/);
    expect(textoGuia).toContain('acumulando las cuotas íntegras de Patrimonio');
  });

  test('REPARADO (hallazgo 4879) · con 3.500.000 € de patrimonio neto, que no dan cuota, no avisa del ITSGF', async ({ page }) => {
    // 3.500.000 − 700.000 = 2.800.000 € de base liquidable, todo en el tramo «Hasta 3.000.000,00» al
    // 0,00 %: cuota 0 y sin obligación de declarar (art. 3.Nueve, Once y Diecinueve Ley 38/2022).
    // Decidido por el usuario el 16/11/2026 (C0792): el aviso salta por encima de 3.700.000 €.
    await comprobar(page, { ccaa: 'madrid', bi: '60.000', irpf: '15.000', ip: '1', patrimonio: '3.500.000' });
    await expect(resultado(page)).toContainText('No aplica en tu CCAA');
    await expect(resultado(page)).not.toContainText('ITSGF');
  });

  test('REPARADO (hallazgo 4880) · el patrimonio neto cuenta también fuera de las CCAA con bonificación total: Galicia con 6.000.000 €', async ({ page }) => {
    // Galicia (bonificación 50 % en data/fiscal), base liquidable 6.000.000 − 700.000 = 5.300.000:
    // IP con la escala estatal = 70.546,37 €, satisfecha tras el 50 % = 35.273,19 €.
    // ITSGF = (5.300.000 − 3.000.000) × 1,7 % = 39.100 € − 35.273,19 = 3.826,81 € a ingresar
    // (su límite conjunto no actúa: 450.000 + 70.546,37 + 39.100 < 0,60 × 1.000.000).
    // Decidido por el usuario el 16/11/2026 (C0792): aviso en cualquier CCAA no foral.
    await comprobar(page, { ccaa: 'galicia', bi: '1.000.000', irpf: '450.000', ip: '70.546,37', patrimonio: '6.000.000' });
    await expect(resultado(page)).toContainText('La reducción no se activa en tu caso');
    await expect(resultado(page)).toContainText('ITSGF');
  });

  test('REPARADO (hallazgos 4879 y 4880) · los bordes: 3.700.000 € justos no avisan, 3.700.001 sí, y en Navarra (foral) no', async ({ page }) => {
    // Base liquidable = patrimonio neto − 700.000: con 3.700.000 € queda en 3.000.000, todo al 0,00 %.
    await comprobar(page, { ccaa: 'madrid', bi: '60.000', irpf: '15.000', ip: '1', patrimonio: '3.700.000' });
    await expect(resultado(page)).not.toContainText('ITSGF');
    await comprobar(page, { ccaa: 'madrid', bi: '60.000', irpf: '15.000', ip: '1', patrimonio: '3.700.001' });
    await expect(resultado(page)).toContainText('Atención al ITSGF');
    await comprobar(page, { ccaa: 'navarra', bi: '1.000.000', irpf: '450.000', ip: '70.546,37', patrimonio: '6.000.000' });
    await expect(resultado(page)).not.toContainText('ITSGF');
  });

  test('REPARADO (hallazgo 4881) · el texto daba a Galicia por bonificada al 100 % y olvidaba La Rioja; ahora sale de data/fiscal', async ({ page }) => {
    const totales = (await page.locator('#ccaa option').allInnerTexts())
      .filter((t) => /\(bonificación 100\s?%\)/.test(t))
      .map((t) => t.replace(/\s*\(.*$/, ''));
    expect(totales.length).toBeGreaterThan(0);
    expect(totales).toContain('La Rioja');
    const paso2 = page.getByText(/La CCAA es clave/);
    for (const nombre of totales) await expect(paso2).toContainText(nombre);
    await expect(paso2).not.toContainText('Galicia');
    // La tabla y el consejo «Conoce las bonificaciones de tu CCAA», igual
    const guia = page.locator('[data-guia-educativa]');
    // La guía nace plegada (oculta por CSS): se localiza por etiqueta, no por rol.
    const fila = guia.locator('tr', { hasText: 'Descartado por CCAA' });
    await expect(fila).toContainText('La Rioja');
    await expect(fila).not.toContainText('Galicia');
    const consejo = guia.locator('h4', { hasText: 'Conoce las bonificaciones de tu CCAA' }).locator('xpath=following-sibling::p[1]');
    await expect(consejo).toContainText('La Rioja');
    await expect(consejo).not.toContainText('Galicia');
  });

  test('REPARADO (hallazgo 4886) · las cifras normativas del texto salen de data/fiscal (con su formato: espacio duro antes de € y %)', async ({ page }) => {
    // Los literales («2.000.000 €» con espacio normal, «3M€», «60%») pasan a interpolarse de
    // UMBRAL_OBLIGACION_DECLARAR, MINIMO_EXENTO_ESTATAL, getMinimoExentoPatrimonio('cataluna'),
    // EXENCION_VIVIENDA_HABITUAL, ITSGF_UMBRAL, LIMITE_CONJUNTO_PORCENTAJE y TOPE_REDUCCION_PORCENTAJE.
    const guia = (await page.locator('[data-guia-educativa]').textContent()) ?? '';
    expect(guia).toContain('supera 2.000.000 €');
    expect(guia).toContain('es 700.000 €');
    expect(guia).toContain('Cataluña: 500.000 €');
    expect(guia).toContain('hasta 300.000 €');
    expect(guia).toContain('(3400 € en matrimonios)');
    expect(guia).not.toContain('3M€');
    expect(guia).toContain('3.000.000 €');
    const panel = (await page.getByRole('heading', { name: /¿Qué es el límite conjunto IRPF-Patrimonio\?/ }).locator('..').textContent()) ?? '';
    expect(panel).toContain('el 60 % de tu base imponible');
    expect(panel).toContain('La regla del 60 %');
    expect(panel).toContain('El tope del 80 %');
    expect(panel).toContain('al menos el 20 %');
  });

  test('REPARADO (hallazgo 4882) · «35000.5» se leía 350.005: la reducción salía 32.000 € en vez de 15.000,50 €', async ({ page }) => {
    // parseSpanishNumber('35000.5') = 35.000,5 (un solo punto que no agrupa de tres en tres es decimal).
    // 35.000,5 + 40.000 − 60.000 = 15.000,5 < tope 32.000 → reducción 15.000,50 €, cuota 24.999,50 €.
    await comprobar(page, { ccaa: 'cataluna', bi: '100000', irpf: '35000.5', ip: '40000' });
    await expect(resultado(page)).toContainText(eur('15.000,50'));
    await expect(resultado(page)).toContainText(eur('24.999,50'));
  });

  test('REPARADO (hallazgo 4882) · una cuota IRPF ilegible («abc») se calculaba como 0 sin avisar', async ({ page }) => {
    await rellenar(page, { ccaa: 'cataluna', bi: '100.000', irpf: 'abc', ip: '40.000' });
    await boton(page).click();
    await expect(resultado(page)).toHaveCount(0);
    await expect(page.locator('main').getByRole('alert')).toContainText('cuota íntegra del IRPF: no es un número válido');
  });

  test('REPARADO (hallazgo 4883) · con cuota de IP 0 el botón se apagaba sin decir por qué (el aviso que trae el código no salía nunca)', async ({ page }) => {
    await rellenar(page, { ccaa: 'aragon', bi: '50.000', irpf: '10.000', ip: '0' });
    await boton(page).click();
    await expect(page.locator('main').getByRole('alert')).toContainText(/mayor que 0/);
    await expect(resultado(page)).toHaveCount(0);
  });

  test('REPARADO (hallazgo 4884) · la FAQ de buscadores restaba «la diferencia» sin el tope del 80 %', async ({ page }) => {
    // Con BI 5.000, IRPF 0 e IP 20.000 «la diferencia» son 17.000 €; la ley y el motor dan 16.000 (CASO 2c).
    interface Pregunta { name: string; acceptedAnswer: { text: string } }
    interface BloqueLd { '@type'?: string; mainEntity?: Pregunta[] }
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b) as BloqueLd).find((j) => j['@type'] === 'FAQPage');
    const pregunta = faq?.mainEntity?.find((q) => /Cómo se calcula/.test(q.name));
    expect(pregunta, 'la pregunta «¿Cómo se calcula…?» del FAQPage').toBeTruthy();
    expect(pregunta?.acceptedAnswer.text).toMatch(/80/);
  });

  test('REPARADO (hallazgo 4887) · formato: «60%» iba pegado en el mensaje del resultado, el selector, la FAQ y el JSON-LD', async ({ page }) => {
    await comprobar(page, { ccaa: 'aragon', bi: '50.000', irpf: '10.000', ip: '20.000' });
    expect(await resultado(page).textContent()).toContain('no supera el 60 % de tu base imponible');
    const opciones = await page.locator('#ccaa option').allTextContents();
    expect(opciones).toContain('Madrid (bonificación 100 %)');
    const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    expect(jsonLd).not.toMatch(/\d%/);
    const guia = (await page.locator('[data-guia-educativa]').textContent()) ?? '';
    expect(guia).not.toMatch(/\d%/);
    await page.locator('#ccaa').selectOption('madrid');
    await boton(page).click();
    expect(await resultado(page).textContent()).toContain('bonificado al 100 %');  });
});

/**
 * Cabo C0784 (17/11/2026) — el alcance del hallazgo 4879 en la ficha de Delegum del mismo dato.
 * Su tabla y su texto se corrigieron el 16/11 (884445f56); su FAQPage seguía diciendo que el ITSGF
 * grava «los patrimonios netos superiores a 3.000.000 €», y /api/datos solo servía ese número con
 * el nombre «umbralITSGF». Ley 38/2022 (BOE, ELI consolidado, leído el 17/11/2026), art. 3.Nueve:
 * «La base imponible se reducirá, en concepto de mínimo exento, en 700.000 euros»; art. 3.Once: la
 * escala grava al 0 % la base liquidable hasta 3.000.000 €. Con cuota: patrimonio neto > 3.700.000 €.
 */
test.describe('Cabo C0784: la ficha de Delegum del Impuesto sobre el Patrimonio', () => {
  test('REPARADO (cabo C0784) · el FAQPage de la ficha no dice que el ITSGF grave a partir de 3.000.000 € de patrimonio', async ({ page }) => {
    await page.goto('/delegum/datos-fiscales/impuesto-patrimonio/');
    const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    expect(jsonLd).toContain('FAQPage');
    expect(jsonLd).not.toMatch(/patrimonios? netos? superiores? a 3\.000\.000/);
    expect(jsonLd).not.toMatch(/patrimonio supere los 3\.000\.000/);
    expect(jsonLd).toMatch(/patrimonio neto superior a 3\.700\.000/);
    expect(jsonLd).not.toContain('Umbral ITSGF');
  });

  test('REPARADO (cabo C0784) · /api/datos sirve, junto al tramo al 0 %, el mínimo exento y el patrimonio con cuota', async ({ page }) => {
    const r = await page.request.get('/api/datos/impuesto-patrimonio/');
    expect(r.ok()).toBe(true);
    const cuerpo = (await r.json()) as { datos: Record<string, unknown> };
    expect(cuerpo.datos.umbralITSGF).toBe(3_000_000);
    expect(cuerpo.datos.itsgfMinimoExento).toBe(700_000);
    expect(cuerpo.datos.itsgfPatrimonioNetoConCuota).toBe(3_700_000);
  });
});

/**
 * Cabo C0789 — comprobación puntual del 17/11/2026 (dos sospechas sin caso de la primera inspección).
 *
 * Norma (BOE, leída el 17/11/2026):
 *   · Ley Foral 13/1992 de Navarra, del Impuesto sobre el Patrimonio (BOE-A-1993-2877, consolidada a
 *     31/12/2025), art. 31 en la redacción del art. 2.1 de la Ley Foral 22/2023 (en vigor el 30/12/2023):
 *       1. la suma de cuotas «no podrá exceder, para los sujetos pasivos sometidos al impuesto por
 *          obligación personal, del 65 por 100 de la suma de la base imponible de este último»;
 *       2. «se reducirá la cuota íntegra de este impuesto hasta alcanzar dicho límite, sin que tal
 *          reducción pueda exceder del 55 por 100»;
 *       3. en unidades familiares «los límites referidos en los números anteriores se calcularán
 *          individualmente, con independencia de la tributación, individual o conjunta».
 *     El art. 31 estatal (Ley 19/1991, BOE-A-1991-14392) dice «60 por 100» y «80 por 100», y acumula en
 *     la conjunta (31.Dos). La app calcula Navarra con el estatal: LIMITE_CONJUNTO_PORCENTAJE y
 *     TOPE_REDUCCION_PORCENTAJE no distinguen CCAA, y el resultado no lleva ningún aviso foral.
 *   · Ley 12/2002, Concierto Económico con el País Vasco (BOE-A-2002-9969), art. 24: «El Impuesto sobre
 *     el Patrimonio es un tributo concertado de normativa autónoma.» Las Normas Forales de Álava,
 *     Bizkaia y Gipuzkoa no se pudieron leer en la red de fuentes: el caso pide el aviso, no una cifra.
 *
 * Los esperados se resolvieron a mano ANTES de abrir el navegador.
 */
test.describe('Cabo C0789 (17/11/2026): territorios forales y la STS de marzo de 2024', () => {
  // ABIERTO: la app aplica el 60 % estatal a Navarra; con el 65 % foral la suma no supera el límite.
  test.fail('ABIERTO (cabo C0789) · Navarra, BI 100.000, IRPF 30.000, IP 32.000: con el 65 % foral no hay reducción, y la app ofrece 2000 €', async ({ page }) => {
    // LF 13/1992, art. 31.1: límite 0,65 × 100.000 = 65.000; 30.000 + 32.000 = 62.000 ≤ 65.000 → sin
    // reducción (31.2 solo reduce si «la suma de ambas cuotas supere el límite»); cuota IP 32.000 €.
    // Con el estatal (lo que hace la app): 62.000 − 60.000 = 2.000 € de reducción, cuota 30.000 €.
    await comprobar(page, { ccaa: 'navarra', bi: '100.000', irpf: '30.000', ip: '32.000' });
    await expect(resultado(page)).not.toContainText('Podrías beneficiarte');
    await expect(resultado(page)).not.toContainText(eur('2000,00'));
  });

  // ABIERTO: la app aplica el tope estatal del 80 % a Navarra, donde la reducción no pasa del 55 %.
  test.fail('ABIERTO (cabo C0789) · Navarra, BI 5.000, IRPF 0, IP 20.000: el tope foral es el 55 % (11.000 €) y la app reduce 16.000 €', async ({ page }) => {
    // LF 13/1992: límite 0,65 × 5.000 = 3.250; exceso 20.000 − 3.250 = 16.750; tope 0,55 × 20.000 =
    // 11.000 → reducción 11.000 €, cuota 9000 € (se paga el 45 %). La app: tope 0,80 × 20.000 = 16.000 €,
    // cuota 4000 €. Lo que no puede salir es la cifra estatal; si la app calcula la foral, 11.000 / 9000.
    await comprobar(page, { ccaa: 'navarra', bi: '5.000', irpf: '0', ip: '20.000' });
    await expect(resultado(page)).not.toContainText(eur('16.000,00'));
    await expect(resultado(page)).not.toContainText(eur('4000,00'));
  });

  // ABIERTO: la pista de la conjunta afirma que «la ley» acumula, y la Ley Foral 13/1992 manda calcularlo
  // individualmente (art. 31.3).
  test.fail('ABIERTO (cabo C0789) · Navarra en IRPF conjunta: la pista dice que la ley acumula las cuotas, y la foral calcula cada límite por separado', async ({ page }) => {
    await page.getByRole('button', { name: 'Conjunta (matrimonio)' }).click();
    await page.locator('#ccaa').selectOption('navarra');
    const pista = page.getByText(/En IRPF conjunta: indica los datos sumados/);
    await expect(pista).toBeVisible();
    await expect(pista).not.toContainText('Así es como lo calcula la ley');
  });

  // ABIERTO: País Vasco se calcula con el art. 31 estatal sin avisar de que el IP es allí de normativa
  // autónoma (Concierto, art. 24). No se exige una cifra: o avisa del régimen foral o no da la estatal.
  test.fail('ABIERTO (cabo C0789) · País Vasco, BI 100.000, IRPF 30.000, IP 32.000: da la reducción estatal (2000 €) sin aviso de normativa foral', async ({ page }) => {
    await comprobar(page, { ccaa: 'pais-vasco', bi: '100.000', irpf: '30.000', ip: '32.000' });
    const texto = (await resultado(page).textContent()) ?? '';
    const avisaForal = /foral|normativa propia|Diputaci[oó]n|Concierto/i.test(texto);
    const daCifraEstatal = texto.includes('Podrías beneficiarte') && texto.includes(eur('2000,00'));
    expect(avisaForal || !daCifraEstatal, 'aviso de régimen foral o sin la cifra estatal').toBe(true);
  });

  // REPARADO (17/11/2026): la «STS de marzo 2024» no se ha podido anclar en ninguna fuente de la red
  // (CENDOJ fuera, la sede de la AEAT da 403), y tal como estaba escrita era una obviedad: el
  // art. 31.Uno.b solo excluye los elementos que «no sean susceptibles de producir los rendimientos
  // gravados», y una acción que reparte dividendos los produce. Criterio C0203: retirada en sus cuatro
  // sitios; queda el criterio literal de la ley.
  test('REPARADO (hallazgo 4938) · «la STS de marzo 2024 … las acciones que reparten dividendos NO son improductivas» sin fuente que la ancle', async ({ page }) => {
    const sinAnclar = /acciones (que reparten dividendos|con dividendos) NO son improductivas/i;
    const guia = (await page.locator('[data-guia-educativa]').textContent()) ?? '';
    expect(guia).not.toMatch(sinAnclar);
    expect(guia).not.toMatch(/STS/);
    expect(guia).toContain('susceptible de producir los');
    await comprobar(page, { ccaa: 'cataluna', bi: '100.000', irpf: '35.000', ip: '40.000' });
    const texto = (await resultado(page).textContent()) ?? '';
    expect(texto).not.toMatch(sinAnclar);
    expect(texto).not.toMatch(/STS/);
  });
});
