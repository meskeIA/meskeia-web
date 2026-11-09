import { test, expect, Locator, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — estimador-break-even (segmento CÁLCULO, disclaimer financiero `high`)
 * Primera inspección: 09/11/2026.
 *
 * Qué promete la app
 * ──────────────────
 *   <h1>  «Estimador Break-Even»
 *   sub.  «Calcula el punto de equilibrio de tus productos y descubre cuántas unidades necesitas
 *          vender para empezar a ganar dinero»
 *   Entradas: precio de venta, coste variable y costes fijos mensuales; opcionales, ventas
 *   actuales y objetivo de ganancia. Salidas: punto de equilibrio en unidades/mes y su
 *   facturación, margen de contribución (€ y % del precio), unidades para el objetivo,
 *   situación actual (ingresos, costes, ganancia o pérdida, % del equilibrio y margen de
 *   seguridad), desglose en el punto de equilibrio y escenarios what-if (+10 % precio,
 *   −10 % coste variable, −20 % costes fijos y uno personalizado).
 *
 * FUENTE de los esperados: no hay dato normativo (nada de data/fiscal). La fórmula es la del
 * análisis coste-volumen-beneficio que la propia app enseña en su guía (pasos 4, 5 y 7):
 *   margen de contribución MC = P − CV · equilibrio = CF ÷ MC, redondeado HACIA ARRIBA a la
 *   unidad · facturación = unidades × P · objetivo = ⌈(CF + objetivo) ÷ MC⌉.
 * Las cifras se calcularon a mano, en céntimos exactos, ANTES de ejecutar la app.
 *
 * Nota de formato: es-ES no agrupa los millares de un número de cuatro cifras («7200,00 €») y
 * sí los de cinco o más («12.000,00 €»), como manda la Ortografía de la RAE.
 *
 * CASOS (resueltos a mano)
 * ────────────────────────
 *   CASO 1 (normal) — P 60 €, CV 24 €, CF 7.200 €, ventas 250, objetivo 1.800 €:
 *       MC = 36,00 €/ud (36/60 = 60,0 %) · equilibrio 7.200/36 = 200 uds exactas → 12.000,00 €
 *       objetivo (7.200 + 1.800)/36 = 250 uds · ingresos 250 × 60 = 15.000,00 €
 *       costes 7.200 + 250 × 24 = 13.200,00 € · ganancia +1800,00 € · 250/200 = 125 %
 *       margen de seguridad 250 − 200 = 50 uds · desglose 12.000 − 7.200 − 4.800 = 0 €
 *       +10 % precio: 66 − 24 = 42 → ⌈171,43⌉ = 172 (28 menos) · −10 % CV: 60 − 21,6 = 38,4 →
 *       ⌈187,5⌉ = 188 (12 menos) · −20 % CF: 5.760/36 = 160 (40 menos).
 *
 *   CASO 2 (límite) — P = CV = 20 €, CF 5.000 €, ventas 200: MC = 0. NO HAY punto de equilibrio:
 *       cada unidad aporta 0 € a los fijos y la pérdida es siempre de 5.000 € (ingresos 4000,00 €,
 *       costes 9000,00 €). La app pinta «0 unidades/mes», «0,00 € en ventas» y «Margen de
 *       seguridad: 200 uds» (HALLAZGO). Con P 15 €: MC −5,00 € (−33,3 %), pérdida −6000,00 €.
 *   CASO 2b (límite) — CF 0: equilibrio 0 uds y 0,00 € (correcto); objetivo ⌈2.000/30⌉ = 67;
 *       ganancia 200 × 30 = +6000,00 €. La barra dice «0 % del punto de equilibrio» (HALLAZGO).
 *   CASO 2c (límite, coma flotante) — P 2,30 €, CV 1,10 €, CF 1.200 €: MC 1,20 € y
 *       1.200/1,20 = 1.000 uds EXACTAS → 2300,00 €. La app da 1001 y 2302,30 € (HALLAZGO).
 *
 *   CASO 3 (rechazo) — una letra tecleada en un importe se rechaza (CF «7200abc» → 7200 →
 *       ⌈7.200/30⌉ = 240 uds, 12.000,00 €). Un importe ilegible («5.000.50») o negativo no
 *       debería dar resultado: la app los lee como 0 o como −100 uds (HALLAZGOS).
 *
 * Los hallazgos van con test.fail(): cuando se reparen, el test «pasará» y Playwright lo
 * marcará como fallo inesperado; entonces se quita el test.fail() y se escribe REPARADO.
 */

const RUTA = '/estimador-break-even/';

const ROTULO = {
  precio: 'Precio de venta (por unidad)',
  costeVariable: 'Costo variable (por unidad)',
  fijos: 'Costos fijos mensuales',
  ventas: 'Ventas actuales (unidades/mes)',
  objetivo: 'Objetivo de ganancia mensual',
} as const;

/** El espacio duro (U+00A0) que la regla del % exige entre la cifra y el signo. */
const ESPACIO_DURO = String.fromCharCode(0xa0);

function campo(page: Page, rotulo: string): Locator {
  return page.getByLabel(rotulo, { exact: true });
}

/** Escribe un valor, comprueba que el ESTADO de React lo recogió y, si se pide, sale del campo. */
async function poner(page: Page, rotulo: string, valor: string, salir = true): Promise<void> {
  const c = campo(page, rotulo);
  await c.fill(valor);
  await esperarValorEnReact(page, c, valor);
  if (salir) await c.press('Tab');
}

/** La cifra grande del punto de equilibrio: el primer <span> del bloque que sigue al <h2>. */
function cifraEquilibrio(page: Page): Locator {
  return page
    .getByRole('heading', { level: 2, name: 'Punto de Equilibrio', exact: true })
    .locator('xpath=following-sibling::div[1]/span[1]');
}

function equivalente(page: Page): Locator {
  return page.getByText(/^Equivalente a/);
}

/** Una tarjeta de resultado (ResultCard), por su título. */
function tarjeta(page: Page, titulo: string): Locator {
  return page.getByRole('heading', { level: 3, name: titulo, exact: true }).locator('xpath=../..');
}

function situacion(page: Page): Locator {
  return page.getByRole('heading', { name: 'Tu situación actual' }).locator('xpath=..');
}

function desgloseEquilibrio(page: Page): Locator {
  return page.getByRole('heading', { level: 4, name: 'En el punto de equilibrio' }).locator('xpath=..');
}

function escenario(page: Page, nombre: string | RegExp): Locator {
  return page.getByRole('heading', { level: 4, name: nombre }).locator('xpath=..');
}

function personalizado(page: Page): Locator {
  return escenario(page, 'Escenario Personalizado');
}

interface PreguntaLd {
  pregunta: string;
  respuesta: string;
}

/** Lee los bloques JSON-LD servidos: la lista de características y las preguntas del FAQPage. */
async function jsonLdServido(page: Page): Promise<{ features: string[] | null; faq: PreguntaLd[] }> {
  return page.evaluate(() => {
    let features: string[] | null = null;
    const faq: { pregunta: string; respuesta: string }[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      if (j['@type'] === 'WebApplication') {
        features = (j.featureList as string[] | undefined) ?? [];
      }
      if (j['@type'] === 'FAQPage') {
        for (const q of j.mainEntity as { name: string; acceptedAnswer: { text: string } }[]) {
          faq.push({ pregunta: q.name, respuesta: q.acceptedAnswer.text });
        }
      }
    }
    return { features, faq };
  });
}

/** Respuesta de la FAQ VISIBLE (montada aunque la guía esté plegada), o null si no existe. */
async function respuestaVisible(page: Page, pregunta: string): Promise<string | null> {
  return page.evaluate((p) => {
    const h = Array.from(document.querySelectorAll('h3')).find((n) => n.textContent?.trim() === p);
    const parrafo = h?.nextElementSibling;
    return parrafo ? (parrafo.textContent ?? '').replace(/\s+/g, ' ').trim() : null;
  }, pregunta);
}

const normalizar = (t: string): string => t.replace(/\s+/g, ' ').trim();

test.describe('estimador-break-even', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input']);
  });

  test('CASO 1 (normal) · 60 € / 24 € / 7.200 €, ventas 250, objetivo 1.800 € → 200 uds y 12.000,00 €', async ({
    page,
  }) => {
    await poner(page, ROTULO.precio, '60');
    await poner(page, ROTULO.costeVariable, '24');
    await poner(page, ROTULO.fijos, '7.200');
    await poner(page, ROTULO.ventas, '250');
    await poner(page, ROTULO.objetivo, '1.800');

    // 7.200 ÷ (60 − 24) = 200 exactas; 200 × 60 = 12.000 €
    await expect(cifraEquilibrio(page)).toHaveText('200');
    await expect(equivalente(page)).toContainText('12.000,00 €');

    // MC = 36 €/ud = 60,0 % del precio
    await expect(tarjeta(page, 'Margen de Contribución')).toContainText('36,00');
    await expect(tarjeta(page, 'Margen de Contribución')).toContainText(/60,0\s?%\s+del precio/);
    // (7.200 + 1.800) ÷ 36 = 250
    await expect(tarjeta(page, 'Para tu objetivo')).toContainText('250');
    await expect(tarjeta(page, 'Para tu objetivo')).toContainText('1800,00 €');

    // Situación: 15.000 − (7.200 + 6.000) = +1.800 €; 250/200 = 125 %; 250 − 200 = 50 uds
    const s = situacion(page);
    await expect(s).toContainText('250 uds');
    await expect(s).toContainText('15.000,00 €');
    await expect(s).toContainText('13.200,00 €');
    await expect(s).toContainText('Ganancia');
    await expect(s).toContainText('+1800,00 €');
    await expect(s).toContainText(/125\s?%\s+del punto de equilibrio/);
    await expect(s).toContainText('Margen de seguridad: 50 uds');

    // Desglose: aquí el equilibrio es exacto, así que 12.000 − 7.200 − 4.800 = 0 €
    const d = desgloseEquilibrio(page);
    await expect(d).toContainText('12.000,00 €');
    await expect(d).toContainText('-7200,00 €');
    await expect(d).toContainText('Costos variables (200 uds)');
    await expect(d).toContainText('-4800,00 €');

    // Escenarios what-if
    await page.getByRole('button', { name: 'Escenarios What-If' }).click();
    await expect(escenario(page, 'Actual')).toContainText('200 uds');
    await expect(escenario(page, 'Actual')).toContainText('12.000,00 €');
    // 66 − 24 = 42 → ⌈171,43⌉ = 172, 28 menos
    await expect(escenario(page, /\+\s?10\s?%\s?Precio/)).toContainText('172 uds');
    await expect(escenario(page, /\+\s?10\s?%\s?Precio/)).toContainText('28 uds menos');
    // 60 − 21,6 = 38,4 → ⌈187,5⌉ = 188, 12 menos
    await expect(escenario(page, /10\s?%\s?Cost[oe] Var/i)).toContainText('188 uds');
    await expect(escenario(page, /10\s?%\s?Cost[oe] Var/i)).toContainText('12 uds menos');
    // 5.760 ÷ 36 = 160, 40 menos
    await expect(escenario(page, /20\s?%\s?Cost[oe]s Fijos/i)).toContainText('160 uds');
    await expect(escenario(page, /20\s?%\s?Cost[oe]s Fijos/i)).toContainText('40 uds menos');
  });

  test('CASO 2 (límite) · precio = coste variable (20 €): margen 0,00 € y pérdida de los 5.000 € fijos', async ({
    page,
  }) => {
    await poner(page, ROTULO.precio, '20');
    await expect(tarjeta(page, 'Margen de Contribución')).toContainText('0,00');
    const s = situacion(page);
    // 200 × 20 = 4.000 € de ingresos; 5.000 + 200 × 20 = 9.000 € de costes
    await expect(s).toContainText('4000,00 €');
    await expect(s).toContainText('9000,00 €');
    await expect(s).toContainText('Pérdida');
    await expect(s).toContainText('-5000,00 €');

    // Precio 15 € < coste variable 20 €: MC −5 € (−33,3 %), pérdida 3.000 − 9.000 = −6.000 €
    await poner(page, ROTULO.precio, '15');
    await expect(tarjeta(page, 'Margen de Contribución')).toContainText('-5,00');
    await expect(tarjeta(page, 'Margen de Contribución')).toContainText('-33,3');
    await expect(s).toContainText('-6000,00 €');
  });

  test('REPARADO (hallazgo 4313) · con precio ≤ coste variable dice que no hay punto de equilibrio, sin «0 unidades» ni margen de seguridad', async ({
    page,
  }) => {
    await poner(page, ROTULO.precio, '20');
    await expect(tarjeta(page, 'Margen de Contribución')).toContainText('0,00');
    // Con MC = 0 no hay punto de equilibrio: ninguna cantidad cubre los 5.000 € fijos.
    await expect(cifraEquilibrio(page)).toHaveText('—');
    await expect(page.getByText('no hay punto de equilibrio', { exact: true })).toBeVisible();
    await expect(page.getByText(/ninguna cantidad de ventas cubre los 5000,00\s€/)).toBeVisible();
    await expect(equivalente(page)).toHaveCount(0);
    await expect(situacion(page)).toContainText('-5000,00 €');
    await expect(situacion(page)).toContainText('Sin punto de equilibrio');
    await expect(situacion(page)).not.toContainText('Margen de seguridad');
    await expect(tarjeta(page, 'Para tu objetivo')).toContainText('Inalcanzable');

    // Escenarios: +10 % de precio (22 €) sí da equilibrio, ⌈5.000 ÷ 2⌉ = 2.500; −10 % de CV
    // (18 €), también 2.500; −20 % de fijos sigue sin equilibrio. Nada de «2500 uds más».
    await page.getByRole('button', { name: 'Escenarios What-If' }).click();
    await expect(escenario(page, 'Actual')).toContainText('Sin equilibrio');
    await expect(escenario(page, /\+\s?10\s?%\s?Precio/)).toContainText('2500 uds');
    await expect(escenario(page, /\+\s?10\s?%\s?Precio/)).toContainText('ahora sí hay punto de equilibrio');
    await expect(escenario(page, /20\s?%\s?Cost[oe]s Fijos/i)).toContainText('Sin equilibrio');

    // P 15 €: margen −5 €. El personalizado con precio 15 tampoco tiene equilibrio, y no sale en verde.
    await poner(page, 'Nuevo precio', '15');
    await expect(personalizado(page)).toContainText('sin equilibrio');
    await expect(personalizado(page)).not.toContainText('↓');
  });

  test('CASO 2b (límite) · costes fijos 0: equilibrio en 0 unidades y objetivo en 67', async ({ page }) => {
    await poner(page, ROTULO.fijos, '0');
    await expect(cifraEquilibrio(page)).toHaveText('0');
    await expect(equivalente(page)).toContainText('0,00 €');
    // ⌈2.000 ÷ 30⌉ = ⌈66,67⌉ = 67
    await expect(tarjeta(page, 'Para tu objetivo')).toContainText('67');
    // 200 × 50 − 200 × 20 = +6.000 €
    await expect(situacion(page)).toContainText('+6000,00 €');
  });

  test('REPARADO (hallazgo 4318) · con costes fijos 0 la barra dice que el equilibrio está superado, no «0 %»', async ({
    page,
  }) => {
    await poner(page, ROTULO.fijos, '0');
    await expect(situacion(page)).toContainText('+6000,00 €');
    await expect(situacion(page)).not.toContainText(/(^|\D)0\s?%\s+del punto de equilibrio/);
    await expect(situacion(page)).toContainText('Equilibrio superado');
  });

  test('REPARADO (hallazgo 4315) · coma flotante: 2,30 € / 1,10 € / 1.200 € da 1000 uds exactas', async ({
    page,
  }) => {
    await poner(page, ROTULO.precio, '2,30');
    await poner(page, ROTULO.costeVariable, '1,10');
    await poner(page, ROTULO.fijos, '1.200');
    await expect(tarjeta(page, 'Margen de Contribución')).toContainText('1,20');
    // 1.200 ÷ 1,20 = 1.000 EXACTAS (en 1.000 uds: 2.300 = 1.200 + 1.100); 1.000 × 2,30 = 2.300 €
    await expect(cifraEquilibrio(page)).toHaveText('1000');
    await expect(equivalente(page)).toContainText('2300,00 €');
    // Y el otro par del acta: 2.300 ÷ (4,60 − 2,30) = 1.000 exactas → 4600,00 €
    await poner(page, ROTULO.precio, '4,60');
    await poner(page, ROTULO.costeVariable, '2,30');
    await poner(page, ROTULO.fijos, '2.300');
    await expect(cifraEquilibrio(page)).toHaveText('1000');
    await expect(equivalente(page)).toContainText('4600,00 €');
  });

  test('CASO 3 (rechazo) · una letra tecleada en un importe se rechaza: «7200abc» queda en 7200 → 240 uds', async ({
    page,
  }) => {
    const c = campo(page, ROTULO.fijos);
    await c.fill('');
    await esperarValorEnReact(page, c, '');
    await c.pressSequentially('7200abc');
    await esperarValorEnReact(page, c, '7200');
    // ⌈7.200 ÷ 30⌉ = 240; 240 × 50 = 12.000 €
    await expect(cifraEquilibrio(page)).toHaveText('240');
    await expect(equivalente(page)).toContainText('12.000,00 €');
  });

  test('REPARADO (hallazgo 4316) · costes fijos ilegibles «5.000.50» se nombran y no dan resultado', async ({
    page,
  }) => {
    await poner(page, ROTULO.fijos, '5.000.50');
    await expect(campo(page, ROTULO.fijos)).toHaveValue('5.000.50');
    // Aviso de importe ilegible y ningún punto de equilibrio inventado
    await expect(page.getByRole('alert').filter({ hasText: 'No se ha podido leer los costes fijos' })).toBeVisible();
    await expect(cifraEquilibrio(page)).toHaveText('—');
    await expect(page.getByText('Tu situación actual')).toHaveCount(0);
  });

  test('REPARADO (hallazgo 4316) · costes fijos negativos se rechazan con el foco dentro y también al salir', async ({
    page,
  }) => {
    await poner(page, ROTULO.fijos, '-3000', false);
    await expect(cifraEquilibrio(page)).toHaveText('—');
    await expect(page.getByRole('alert').filter({ hasText: 'no pueden ser negativos' })).toBeVisible();
    // Al salir del campo ya no se reescribe a 0 en silencio: sigue el «-3000» y el aviso.
    await campo(page, ROTULO.fijos).press('Tab');
    await expect(campo(page, ROTULO.fijos)).toHaveValue('-3000');
    await expect(cifraEquilibrio(page)).toHaveText('—');
  });

  test('REPARADO (hallazgo 4314) · el escenario personalizado respeta un 0: costes fijos 0 → 0 uds', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Escenarios What-If' }).click();
    await expect(escenario(page, 'Actual')).toContainText('167 uds');
    // Con 50 / 20 por defecto y CF 0: ⌈0 ÷ 30⌉ = 0 uds
    await poner(page, 'Nuevos costos fijos', '0');
    await expect(personalizado(page)).toContainText(/equilibrio:\s*0 unidades/);
    // Con CV 0: ⌈5.000 ÷ 50⌉ = 100 uds
    await poner(page, 'Nuevos costos fijos', '');
    await poner(page, 'Nuevo costo variable', '0');
    await expect(personalizado(page)).toContainText(/equilibrio:\s*100 unidades/);
    await expect(personalizado(page)).toContainText('↓ 67 uds menos que el actual');
    // Vacío = el valor actual: igual que el actual, sin clase de «empeora»
    await poner(page, 'Nuevo costo variable', '');
    await expect(personalizado(page)).toContainText('(igual que el actual)');
  });

  test('REPARADO (hallazgo 4317) · el desglose suma sus líneas: +3.000 € al redondear a 3 uds', async ({
    page,
  }) => {
    await poner(page, ROTULO.precio, '10.000');
    await poner(page, ROTULO.costeVariable, '4.000');
    await poner(page, ROTULO.fijos, '15.000');
    // ⌈15.000 ÷ 6.000⌉ = 3 uds: 30.000 − 15.000 − 12.000 = +3.000 €
    await expect(cifraEquilibrio(page)).toHaveText('3');
    const d = desgloseEquilibrio(page);
    await expect(d).toContainText('30.000,00 €');
    await expect(d).toContainText('-15.000,00 €');
    await expect(d).toContainText('-12.000,00 €');
    await expect(d).not.toContainText('0 € (equilibrio)');
    await expect(d).toContainText('+3000,00 €');
  });

  test('REPARADO (hallazgo 4319) · con el objetivo vacío la tarjeta no dice «No definido»', async ({
    page,
  }) => {
    await poner(page, ROTULO.objetivo, '');
    await expect(cifraEquilibrio(page)).toHaveText('167');
    await expect(tarjeta(page, 'Para tu objetivo')).not.toContainText('No definido');
    await expect(tarjeta(page, 'Para tu objetivo')).toContainText('Sin objetivo de ganancia');
  });

  test('REPARADO (hallazgo 4323) · el % lleva espacio duro: «60,0 % del precio», barra y escenarios', async ({ page }) => {
    await expect(tarjeta(page, 'Margen de Contribución')).toContainText('30,00');
    const texto = await tarjeta(page, 'Margen de Contribución').evaluate((n) => n.textContent ?? '');
    // Regla del 25/09/2026 (CLAUDE.md global §2): «60,0 %», con espacio duro U+00A0
    expect(texto).toContain(`60,0${ESPACIO_DURO}% del precio`);
    const barra = await situacion(page).evaluate((n) => n.textContent ?? '');
    expect(barra).toContain(`120${ESPACIO_DURO}% del punto de equilibrio`);
    await page.getByRole('button', { name: 'Escenarios What-If' }).click();
    const titulo = await escenario(page, /\+\s?10\s?%\s?Precio/).locator('h4').textContent();
    expect(titulo ?? '').toContain(`+10${ESPACIO_DURO}% Precio`);
  });

  test('REPARADO (hallazgo 4324) · el recuadro ESTÁTICO «Errores frecuentes» ya no lleva role="alert"', async ({
    page,
  }) => {
    const titulo = page.locator('h3', { hasText: 'Errores frecuentes al calcular el break-even' });
    await expect(titulo).toHaveCount(1);
    await expect(titulo.locator('xpath=ancestor::*[@role="alert"]')).toHaveCount(0);
  });

  test('REPARADO (hallazgo 4320) · `features` del JSON-LD con 4-8 características', async ({ page }) => {
    const { features } = await jsonLdServido(page);
    expect(features).not.toBeNull();
    expect((features ?? []).length).toBeGreaterThanOrEqual(4);
    expect((features ?? []).length).toBeLessThanOrEqual(8);
  });

  test('REPARADO (hallazgo 4321) · «costes fijos y variables» tiene una sola respuesta en el FAQPage y en la FAQ visible', async ({
    page,
  }) => {
    const { faq } = await jsonLdServido(page);
    const enLd = faq.find((q) => /costes fijos y costes variables/i.test(q.pregunta));
    expect(enLd).toBeDefined();
    const visible = await respuestaVisible(page, enLd?.pregunta ?? '');
    expect(visible).not.toBeNull();
    expect(normalizar(enLd?.respuesta ?? '')).toBe(normalizar(visible ?? ''));
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · la FAQ da a la tienda física 18–36 meses y la tabla 12–24', async ({
    page,
  }) => {
    test.fail();
    const plazos = await page.evaluate(() => {
      const fila = Array.from(document.querySelectorAll('tr')).find((tr) =>
        tr.textContent?.includes('Retail físico'),
      );
      const celdas = fila ? Array.from(fila.querySelectorAll('td')) : [];
      const h = Array.from(document.querySelectorAll('h3')).find((n) =>
        n.textContent?.includes('¿Cuánto tiempo es normal tardar'),
      );
      return {
        tabla: celdas[4]?.textContent?.trim() ?? null,
        faq: (h?.nextElementSibling?.textContent ?? '').replace(/\s+/g, ' '),
      };
    });
    expect(plazos.tabla).not.toBeNull();
    const m = plazos.faq.match(/tienda física puede tardar ([\d–-]+) meses/);
    if (m) expect(`${m[1]} meses`).toBe(plazos.tabla);
  });
});
