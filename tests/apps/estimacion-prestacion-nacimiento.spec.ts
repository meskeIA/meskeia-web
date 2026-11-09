import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — estimacion-prestacion-nacimiento (segmento fiscal, riesgo 1 · primera inspección
 * 09/11/2026).
 *
 * La app promete en su <h1> «Estimacion de Prestacion por Nacimiento» y en el subtítulo
 * «Calcula una estimacion de la prestacion que cobraras de la Seguridad Social durante el
 * permiso por nacimiento y cuidado del menor en Espana». Hay verdad comprobable: base
 * reguladora diaria, duración y total.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/estimacion-prestacion-nacimiento/page.tsx (useMemo `resultado`), sin motor aparte.
 *   data/fiscal/maternidad.ts → PERMISO_NACIMIENTO (19 / 32 semanas), AMPLIACION_POR_ID,
 *   PRESTACION_NACIMIENTO (carencia, no contributiva, bases) · data/fiscal/irpf.ts →
 *   BASES_SS_2026 (mínima 1.424,40 · máxima 5.101,20) · data/fiscal/iprem.ts → IPREM_2026
 *   (600 €/mes, 20 €/día).
 *
 * FUENTES OFICIALES CONSULTADAS (09/11/2026)
 *   · ET art. 48.4 (BOE-A-2015-11430, redacción del RDL 9/2025): «diecinueve semanas»; con
 *     monoparentalidad «treinta y dos semanas»; hospitalización de más de siete días: «se
 *     ampliará en tantos días como el nacido se encuentre hospitalizado, con un máximo de
 *     trece semanas adicionales».
 *   · ET art. 48.5: adopción internacional, la suspensión «podrá iniciarse hasta cuatro
 *     semanas antes de la resolución»; NO hay semanas adicionales.
 *   · ET art. 48.6: parto múltiple, «duración adicional de dos semanas, una para cada una de
 *     las personas progenitoras», «por cada hijo o hija distinta del primero»; «En caso de
 *     haber una única persona progenitora, esta podrá disfrutar de las ampliaciones completas
 *     previstas en este apartado para el caso de familias con dos personas progenitoras».
 *   · seg-social.es, «Nacimiento y cuidado de menor», Prestación económica / Importe: BR = base
 *     del mes «se dividirá entre treinta»; a tiempo parcial, suma de doce meses «entre
 *     trescientos sesenta y cinco»; en parto múltiple «se reconocerá un subsidio especial por
 *     cada hijo […] a partir del segundo, igual al que corresponda percibir por el primero,
 *     durante el período de 6 semanas», que «únicamente podrá percibirse por uno de los
 *     progenitores». Nacimiento: «Se tendrá derecho al subsidio a partir del mismo día en que
 *     dé comienzo el período de descanso».
 *   · LGSS art. 182.2-3 (RDL 9/2025, BOE-A-2025-15741): no contributiva al 100 % del IPREM
 *     «salvo» que la base reguladora «fuese de cuantía inferior, en cuyo caso se estará a
 *     esta»; duración del descanso obligatorio, «se incrementará en catorce días naturales»,
 *     una sola vez.
 *   · LGSS art. 53.1: el derecho prescribe «a los cinco años» y los efectos se producen «a
 *     partir de los tres meses anteriores a la fecha en que se presente la correspondiente
 *     solicitud».
 *
 * ══ CASOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR ══
 *   CASO 1 (normal) · biparental, 26+, base 2.000 €: BR = 2000 / 30 = 66,67 €/día;
 *     19 × 7 = 133 días; total = 66,6667 × 133 = 8866,67 € (es-ES no agrupa cuatro cifras).
 *   CASO 2 (límite) · base 6.000 € → tope 5.101,20: BR = 170,04 €; × 133 = 22.615,32 €.
 *     Monoparental, gemelos, base 2.000: 32 + 2 = 34 semanas = 238 días → 15.866,67 €.
 *     Sin carencia (26+, 179 / 359 días) → no contributiva: 42 días × 20 € = 840,00 €;
 *     monoparental: 56 días (8 semanas) × 20 € = 1120,00 €.
 *     Base 1.000 €/mes: BR = 1000 / 30 = 33,33 € (no la mínima: la BR es la base real).
 *     Base «1850.40» (punto decimal, el que da el teclado decimal de muchos móviles):
 *     parseSpanishNumber = 1850,4 → BR 61,68 €, total 8203,44 €.
 *   CASO 3 (rechazo) · base vacía, 0 o negativa: ninguna cifra, y un aviso que lo diga.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS de esta inspección: el día que se reparen,
 * fallarán por pasar y habrá que quitarles el test.fail() (y cambiar ABIERTO por REPARADO).
 */

const normalizar = (t: string) =>
  t.replace(/[  ]/g, ' ').replace(/\n+/g, ' | ');

interface Opciones {
  base: string;
  monoparental?: boolean;
  edad?: 'Menor de 21 anos' | '21 a 25 anos' | '26 o mas anos';
  dias7?: string;
  diasVida?: string;
  situacion?: 'Adopcion' | 'Acogimiento';
  hijos?: 2 | 3;
  hospitalizacion?: boolean;
}

const BASE = 'Base de cotizacion mensual';

async function rellenar(page: Page, o: Opciones): Promise<void> {
  if (o.monoparental) await page.getByLabel('Monoparental (1 progenitor)').check();
  if (o.edad) await page.getByLabel(o.edad, { exact: true }).check();
  if (o.dias7 !== undefined) {
    const d7 = page.getByLabel('Dias cotizados en los ultimos 7 anos');
    await d7.fill(o.dias7);
    await esperarValorEnReact(page, d7, o.dias7);
  }
  if (o.diasVida !== undefined) {
    const dv = page.getByLabel('Dias cotizados en toda tu vida laboral');
    await dv.fill(o.diasVida);
    await esperarValorEnReact(page, dv, o.diasVida);
  }
  const base = page.getByLabel(BASE);
  await base.fill(o.base);
  await esperarValorEnReact(page, base, o.base);
  await base.blur();
  if (o.situacion) await page.getByLabel(o.situacion, { exact: true }).check();
  if (o.hijos) {
    await page.getByLabel('Parto multiple (gemelos, trillizos...)').check();
    await page.getByLabel(o.hijos === 2 ? '2 (gemelos)' : '3 o mas (trillizos+)').check();
  }
  if (o.hospitalizacion) await page.getByLabel('Hospitalizacion neonatal o parto prematuro').check();
}

function seccionResultado(page: Page) {
  return page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: /Resultado de la estimacion/ }) });
}

/** Rellena, pulsa «Estimar prestacion» y devuelve el texto del bloque de resultados. */
async function estimar(page: Page, o: Opciones): Promise<string> {
  await rellenar(page, o);
  await page.getByRole('button', { name: 'Estimar prestacion' }).click();
  const seccion = seccionResultado(page);
  await expect(seccion).toBeVisible();
  return normalizar(await seccion.innerText());
}

test.describe('estimacion-prestacion-nacimiento', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/estimacion-prestacion-nacimiento/');
    await esperarHidratacion(page, [`input[aria-label="${BASE}"]`]);
  });

  test('CASO 1 (normal) · biparental, 26+, base 2.000 € → 66,67 €/día, 19 semanas, 8866,67 €', async ({
    page,
  }) => {
    const texto = await estimar(page, { base: '2.000' });
    expect(texto).toContain('Base reguladora diaria | 66,67 €');
    expect(texto).toContain('Prestacion diaria (100% BR) | 66,67 €');
    expect(texto).toContain('Duracion total | 19 semanas (133 dias)');
    expect(texto).toContain('EXENTA IRPF | 8866,67 €');
    // ET 48.4: 6 obligatorias + 11 flexibles + 2 de cuidado hasta los 8 años = 19
    expect(texto).toContain('Semanas obligatorias (ininterrumpidas tras el parto) | 6 semanas');
    expect(texto).toMatch(/hasta los 12 meses \/ 8 anos del menor\) \| 13 semanas/);
  });

  test('CASO 1b (carencia, art. 178.1 LGSS) · los dos umbrales son alternativos', async ({ page }) => {
    // 26+: 180 días en 7 años basta, aunque la vida laboral quede vacía
    let texto = await estimar(page, { base: '2.000', dias7: '180', diasVida: '' });
    expect(texto).not.toContain('No contributiva');
    expect(texto).toContain('EXENTA IRPF | 8866,67 €');

    // 26+: 179 y 359 no llegan → no contributiva, 42 días × 20 € (IPREM_2026.diario) = 840 €
    await page.reload();
    await esperarHidratacion(page, [`input[aria-label="${BASE}"]`]);
    texto = await estimar(page, { base: '2.000', dias7: '179', diasVida: '359' });
    expect(texto).toContain('(No contributiva)');
    expect(texto).toContain('EXENTA IRPF | 840,00 €');

    // 21-25: 89 en 7 años, pero 180 en la vida laboral → contributiva
    await page.reload();
    await esperarHidratacion(page, [`input[aria-label="${BASE}"]`]);
    texto = await estimar(page, { base: '2.000', edad: '21 a 25 anos', dias7: '89', diasVida: '180' });
    expect(texto).not.toContain('No contributiva');
    expect(texto).toContain('EXENTA IRPF | 8866,67 €');
  });

  test('CASO 1c · menor de 21: sin período mínimo, la app no pide días cotizados', async ({ page }) => {
    await page.getByLabel('Menor de 21 anos', { exact: true }).check();
    await expect(page.getByLabel('Dias cotizados en los ultimos 7 anos')).toHaveCount(0);
    const texto = await estimar(page, { base: '2.000' });
    expect(texto).toContain('EXENTA IRPF | 8866,67 €');
  });

  test('CASO 2 (límite) · base 6.000 € → tope 5.101,20 (BASES_SS_2026): 170,04 €/día, 22.615,32 €', async ({
    page,
  }) => {
    const texto = await estimar(page, { base: '6.000' });
    expect(texto).toContain('Base reguladora diaria | 170,04 €');
    expect(texto).toContain('EXENTA IRPF | 22.615,32 €');
  });

  test('CASO 2b (límite) · gemelos biparental: +1 semana por progenitor (ET 48.6) → 20 semanas, 9333,33 €', async ({
    page,
  }) => {
    const texto = await estimar(page, { base: '2.000', hijos: 2 });
    expect(texto).toContain('Duracion total | 20 semanas (140 dias)');
    expect(texto).toContain('EXENTA IRPF | 9333,33 €');
  });

  test('CASO 2c (límite) · no contributiva monoparental: 42 + 14 días × 20 € = 1120,00 €', async ({ page }) => {
    const texto = await estimar(page, { base: '1.500', monoparental: true, dias7: '100', diasVida: '200' });
    expect(texto).toContain('(No contributiva)');
    expect(texto).toContain('EXENTA IRPF | 1120,00 €');
    expect(texto).toContain('(56 dias)');
  });

  test('CASO 3 (rechazo) · base vacía, 0 o negativa: no publica ninguna cifra', async ({ page }) => {
    for (const base of ['', '0', '-500']) {
      await page.reload();
      await esperarHidratacion(page, [`input[aria-label="${BASE}"]`]);
      await rellenar(page, { base });
      await page.getByRole('button', { name: 'Estimar prestacion' }).click();
      await expect(seccionResultado(page)).toHaveCount(0);
    }
  });

  // ══════════════════════ HALLAZGOS ABIERTOS (inspector 09/11/2026) ══════════════════════

  test('HALLAZGO (09/11/2026, ABIERTO) · «1850.40» con punto decimal se lee 185.040 y sale el tope', async ({
    page,
  }) => {
    // El parser casero quita TODOS los puntos: «1850.40» → 185040 → tope 5.101,20 → 170,04 €/día.
    // parseSpanishNumber (y el blur del propio NumberInput) lo leen 1850,4 → 61,68 €/día.
    test.fail();
    const texto = await estimar(page, { base: '1850.40' });
    expect(texto).toContain('Base reguladora diaria | 61,68 €');
    expect(texto).toContain('EXENTA IRPF | 8203,44 €');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · una base por debajo de la mínima se sube a 1.424,40 en silencio', async ({
    page,
  }) => {
    // Tiempo parcial: base real 1.000 €/mes. La BR es la base real (seg-social.es: «se dividirá
    // entre treinta»; a tiempo parcial, 12 meses entre 365 = 32,88). Hoy: 1424,40 / 30 = 47,48.
    test.fail();
    const texto = await estimar(page, { base: '1.000' });
    expect(texto).toContain('Base reguladora diaria | 33,33 €');
    expect(texto).toContain('EXENTA IRPF | 4433,33 €');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · no contributiva: no aplica la BR inferior al IPREM (art. 182.2)', async ({
    page,
  }) => {
    // Base 450 €/mes → BR 15,00 €/día < 20 € → se estará a esta: 15 × 42 = 630,00 €. Hoy: 840,00 €.
    test.fail();
    const texto = await estimar(page, { base: '450', dias7: '100', diasVida: '200' });
    expect(texto).toContain('EXENTA IRPF | 630,00 €');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · no contributiva con +14 días: «6 semanas (56 dias)»', async ({ page }) => {
    // 56 días son 8 semanas. Hoy la tarjeta y el total dicen «6 semanas (56 dias)».
    test.fail();
    const texto = await estimar(page, { base: '1.500', monoparental: true, dias7: '100', diasVida: '200' });
    expect(texto).toContain('8 semanas (56 dias)');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · monoparental con gemelos: +1 semana en vez de las 2 (ET 48.6)', async ({
    page,
  }) => {
    // «una única persona progenitora […] podrá disfrutar de las ampliaciones completas»:
    // 32 + 2 = 34 semanas = 238 días → 66,6667 × 238 = 15.866,67 €. Hoy 33 semanas, 15.400,00 €.
    test.fail();
    const texto = await estimar(page, { base: '2.000', monoparental: true, hijos: 2 });
    expect(texto).toContain('Duracion total | 34 semanas (238 dias)');
    expect(texto).toContain('EXENTA IRPF | 15.866,67 €');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · parto múltiple: no menciona el subsidio especial de 6 semanas', async ({
    page,
  }) => {
    // seg-social.es: subsidio especial por cada hijo a partir del segundo, igual al del primero,
    // 6 semanas, para uno de los progenitores: 42 × 66,67 = 2800,00 € que la app no nombra.
    test.fail();
    const texto = await estimar(page, { base: '2.000', hijos: 2 });
    expect(texto).toMatch(/subsidio especial/i);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · hospitalización: suma siempre las 13 semanas máximas', async ({
    page,
  }) => {
    // ET 48.4: se amplía «en tantos días como el nacido se encuentre hospitalizado» (más de 7),
    // con un máximo de 13 semanas. La app no pregunta los días y estima 224 días, 14.933,33 €.
    test.fail();
    const texto = await estimar(page, { base: '2.000', hospitalizacion: true });
    expect(texto).not.toContain('(224 dias)');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · adopción: anuncia «+2 semanas» por adopción internacional', async ({
    page,
  }) => {
    // ET 48.5: la suspensión «podrá iniciarse hasta cuatro semanas antes de la resolución»; no
    // hay semanas adicionales (el dato viene de AMPLIACION_POR_ID['adopcion-internacional']).
    test.fail();
    const texto = await estimar(page, { base: '2.000', situacion: 'Adopcion' });
    expect(texto).not.toContain('+2 semanas');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · el rechazo de la base vacía es mudo: ningún aviso', async ({ page }) => {
    test.fail();
    await rellenar(page, { base: '' });
    await page.getByRole('button', { name: 'Estimar prestacion' }).click();
    // Acotado al formulario: el anunciador de rutas de Next también es role="alert".
    await expect(page.locator('form').getByRole('alert')).toBeVisible({ timeout: 2000 });
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · «cobras desde la fecha de solicitud»: LGSS 53.1 da tres meses', async ({
    page,
  }) => {
    test.fail();
    const texto = await page.evaluate(() => document.body.textContent ?? '');
    expect(texto).not.toContain('cobras desde la fecha de solicitud');
    expect(texto).not.toContain('Cada dia de retraso es un dia sin prestacion');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · el FAQPage contradice a la fuente y a la página', async ({ page }) => {
    test.fail();
    const respuestas = await page.evaluate(() => {
      const salida: string[] = [];
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as {
          '@type'?: string;
          mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
        };
        if (j['@type'] === 'FAQPage') for (const q of j.mainEntity ?? []) salida.push(q.acceptedAnswer.text);
      }
      return salida;
    });
    expect(respuestas.length).toBe(5);
    // BR general: base del mes entre 30 (la de 12 meses entre 365 es la de tiempo parcial)
    expect(respuestas[0]).not.toContain('365');
    // Hospitalización: se amplía en DÍAS, no en semanas por día
    expect(respuestas[3]).not.toContain('tantas semanas de ampliación como días');
    // No contributiva: la BR inferior manda (182.2) y hay +14 días (182.3)
    expect(respuestas[4]).not.toContain('cuantía fija');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · riesgo 1: el aviso no es severity="critical"', async ({ page }) => {
    // DisclaimerCard solo pone aria-label="Aviso importante" con severity="critical".
    test.fail();
    await expect(page.locator('[aria-label="Aviso importante"]')).toHaveCount(1);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · sin tildes ni eñes: «Menor de 21 anos», «Espana»', async ({ page }) => {
    test.fail();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Estimación');
    await expect(page.getByLabel('Menor de 21 años', { exact: true })).toHaveCount(1);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · la región aria-live nace con el resultado y no se anuncia', async ({
    page,
  }) => {
    test.fail();
    await page.evaluate(() =>
      document.querySelectorAll('[aria-live]').forEach((n) => n.setAttribute('data-previa', '1')),
    );
    await rellenar(page, { base: '2.000' });
    await page.getByRole('button', { name: 'Estimar prestacion' }).click();
    const previa = await page
      .getByRole('heading', { name: /Resultado de la estimacion/ })
      .evaluate((h) => h.closest('[aria-live]')?.getAttribute('data-previa') ?? 'no');
    expect(previa).toBe('1');
  });
});
