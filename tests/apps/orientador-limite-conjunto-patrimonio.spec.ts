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
  test('HALLAZGO (16/11/2026, ABIERTO) · la pista de la base imponible no excluye la ganancia a más de un año (art. 31.Uno.a)', async ({ page }) => {
    // Base general 20.000 y una ganancia de 400.000 € por un inmueble con 10 años. Siguiendo la pista
    // («Suma de la base general + base del ahorro»): BI 420.000 e IRPF 3.123 + 101.880 (escala del
    // ahorro de data/fiscal) = 105.003 → la app dice «no se activa». Con el art. 31.Uno.a: BI 20.000,
    // IRPF 3.123 → reducción 21.123 € (CASO 2e). La pista tiene que advertir de la exclusión.
    test.fail();
    await comprobar(page, { ccaa: 'aragon', bi: '420.000', irpf: '105.003', ip: '30.000' });
    await expect(resultado(page)).toContainText('La reducción no se activa en tu caso');
    const pista = page.locator(`${BI} ~ span`);
    await expect(pista).toContainText(/ganancias/i);
  });

  test('HALLAZGO (16/11/2026, ABIERTO) · con IRPF conjunto la app dice que el cálculo exacto es individual, y la ley acumula (art. 31.Dos)', async ({ page }) => {
    test.fail();
    await page.getByRole('button', { name: 'Conjunta (matrimonio)' }).click();
    await expect(page.getByText(/En IRPF conjunta: indica los datos sumados/)).toBeVisible();
    await expect(page.getByText(/En IRPF conjunta: indica los datos sumados/)).not.toContainText(
      'requiere prorrateo individual',
    );
  });

  test('HALLAZGO (16/11/2026, ABIERTO) · avisa del ITSGF con 3.500.000 € de patrimonio neto, que no dan cuota', async ({ page }) => {
    // 3.500.000 − 700.000 = 2.800.000 € de base liquidable, todo en el tramo «Hasta 3.000.000,00» al
    // 0,00 %: cuota 0 y sin obligación de declarar (art. 3.Nueve, Once y Diecinueve Ley 38/2022).
    test.fail();
    await comprobar(page, { ccaa: 'madrid', bi: '60.000', irpf: '15.000', ip: '1', patrimonio: '3.500.000' });
    await expect(resultado(page)).toContainText('No aplica en tu CCAA');
    await expect(resultado(page)).not.toContainText('ITSGF');
  });

  test('HALLAZGO (16/11/2026, ABIERTO) · el patrimonio neto se ignora fuera de las CCAA con bonificación total: Galicia con 6.000.000 €', async ({ page }) => {
    // Galicia (bonificación 50 % en data/fiscal), base liquidable 6.000.000 − 700.000 = 5.300.000:
    // IP con la escala estatal = 70.546,37 €, satisfecha tras el 50 % = 35.273,19 €.
    // ITSGF = (5.300.000 − 3.000.000) × 1,7 % = 39.100 € − 35.273,19 = 3.826,81 € a ingresar
    // (su límite conjunto no actúa: 450.000 + 70.546,37 + 39.100 < 0,60 × 1.000.000).
    test.fail();
    await comprobar(page, { ccaa: 'galicia', bi: '1.000.000', irpf: '450.000', ip: '70.546,37', patrimonio: '6.000.000' });
    await expect(resultado(page)).toContainText('La reducción no se activa en tu caso');
    await expect(resultado(page)).toContainText('ITSGF');
  });

  test('HALLAZGO (16/11/2026, ABIERTO) · el texto da a Galicia por bonificada al 100 % y olvida La Rioja; el selector (data/fiscal) dice otra cosa', async ({ page }) => {
    test.fail();
    const totales = (await page.locator('#ccaa option').allInnerTexts())
      .filter((t) => t.includes('(bonificación 100%)'))
      .map((t) => t.replace(/\s*\(.*$/, ''));
    expect(totales.length).toBeGreaterThan(0);
    const paso2 = page.getByText(/La CCAA es clave/);
    for (const nombre of totales) await expect(paso2).toContainText(nombre);
    await expect(paso2).not.toContainText('Galicia');
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

  test('HALLAZGO (16/11/2026, ABIERTO) · la FAQ de buscadores resta «la diferencia» sin el tope del 80 %', async ({ page }) => {
    // Con BI 5.000, IRPF 0 e IP 20.000 «la diferencia» son 17.000 €; la ley y el motor dan 16.000 (CASO 2c).
    test.fail();
    interface Pregunta { name: string; acceptedAnswer: { text: string } }
    interface BloqueLd { '@type'?: string; mainEntity?: Pregunta[] }
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b) as BloqueLd).find((j) => j['@type'] === 'FAQPage');
    const pregunta = faq?.mainEntity?.find((q) => /Cómo se calcula/.test(q.name));
    expect(pregunta, 'la pregunta «¿Cómo se calcula…?» del FAQPage').toBeTruthy();
    expect(pregunta?.acceptedAnswer.text).toMatch(/80/);
  });

  test('HALLAZGO (16/11/2026, ABIERTO) · formato: «60%» pegado en el mensaje del resultado', async ({ page }) => {
    test.fail();
    await comprobar(page, { ccaa: 'aragon', bi: '50.000', irpf: '10.000', ip: '20.000' });
    await expect(resultado(page)).toContainText('60 %');
  });
});
