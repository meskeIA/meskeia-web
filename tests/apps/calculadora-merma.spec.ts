import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — calculadora-merma (segmento motor · vertical Coquinum, categoría Costes)
 *
 * Primera inspección: 03/11/2026. La app promete en su <h1> «Calculadora de merma» y en el
 * subtítulo «cuánto pierde un alimento al limpiarlo y cocinarlo, su rendimiento real y cuánto
 * cuesta de verdad el producto útil». La metadata y el JSON-LD añaden el factor de corrección
 * (bruto / neto) y el coste real por kilo útil. Hay verdad comprobable con lápiz.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   lib/calculadoras/merma.ts → calcularMerma(bruto, limpieza %, cocción %, precio €/kg | null)
 *     · peso limpio = bruto × (1 − limpieza/100)
 *     · peso neto   = limpio × (1 − cocción/100)      ← la cocción se aplica sobre el LIMPIO
 *     · rendimiento = neto / bruto · merma total = 100 − rendimiento
 *     · factor      = bruto / neto = 1 / (1 − merma total)   (0 si el neto es 0)
 *     · coste útil  = precio × factor                       (null si no hay precio > 0)
 *     · las mermas se recortan a 0–100 en silencio (Math.min/Math.max)
 *   app/calculadora-merma/page.tsx → solo vista; el parseo es `parseFloat(v.replace(',', '.')) || 0`.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — 2000 g, limpieza 25 %, cocción 20 %, 12 €/kg
 *       limpio = 2000 × 0,75 = 1500 g · neto = 1500 × 0,80 = 1200 g
 *       rendimiento = 1200/2000 = 60 % · merma = 40 %
 *       factor = 2000/1200 = 1,6667 → ×1,67
 *       coste útil = 12 × 1,6667 = 12 / 0,60 = 20,00 €/kg
 *       (la confusión clásica, 12 × (1 + 0,40) = 16,80 €, NO es el coste: con 16,80 € se pagan
 *       1,4 kg brutos, que rinden 0,84 kg útiles, no uno)
 *       Con 12,5 €/kg: 12,5 / 0,6 = 20,8333 → 20,83 €.
 *       Encadenado 1000 g, 20 % + 30 %: 1000 × 0,8 × 0,7 = 560 g → 56,0 % y 44,0 % (no 50 %),
 *       factor 1/0,56 = 1,7857 → ×1,79.
 *       Control cruzado con la FAQ del JSON-LD («10 € por kilo de un producto que rinde medio
 *       kilo útil → 20 € por kilo»): 1000 g, 50 %, 10 €/kg → 500 g, ×2,00, 20,00 €.
 *
 *   CASO 2 (límite)
 *       0 % + 0 %, 1000 g, 8 €/kg → 1000 g · 100,0 % · 0,0 % de merma · ×1,00 · 8,00 €
 *       99 % + 0 %, 1000 g, 8 €/kg → 10 g · 1,0 % · 99,0 % · ×100,00 · 800,00 €
 *       100 % (de limpieza o de cocción) → 0 g útiles: el factor bruto/neto NO EXISTE (división
 *       por cero; tiende a infinito). Nunca puede ser «×0,00», que diría «no hace falta comprar».
 *       peso bruto 0 → sin resultado, con el texto de espera.
 *       precio 0 → sin tarjeta de coste (el precio es opcional: no inventa un coste).
 *
 *   CASO 3 (rechazo)
 *       «2.000» g es dos mil en formato español → 1200 g útiles, como el CASO 1.
 *       Merma «-10», «150», «abc» o «12abc» y cocción «-20» no son mermas posibles: la app no
 *       debe presentar un resultado como si lo fueran.
 *       Peso «-500», «abc» o vacío → sin resultado (esto sí lo hace).
 *
 * HALLAZGOS del 03/11/2026 — ABIERTOS. Sus casos van con test.fail(): afirman lo CORRECTO y hoy
 * fallan. Al repararse pasarán, y entonces se quita el test.fail() y se escribe REPARADO.
 *   A. Parser casero: «2.000» g → 1 g útil (lee 2 g); «12abc» % → 12 %; «abc» % → 0 %.
 *   B. Merma negativa o mayor que 100 se recorta en silencio (−10 → 0 %, 150 → 100 %), y un
 *      precio negativo o ilegible hace desaparecer la tarjeta de coste sin aviso.
 *   C. Merma total del 100 %: factor «×0,00» y la tarjeta de coste desaparece sin explicación.
 *   D. El JSON-LD promete «Peso limpio y peso neto» y la página no muestra nunca el peso limpio.
 *   E. El «%» va pegado a la cifra («60,0%»): la regla del 25/09/2026 pide espacio duro.
 *   Sin caso ejecutable aquí (van en el acta): referencias de merma y cifras de la FAQ sin
 *   fuente · moneda fija en € (regla Latam) · ningún texto dice que la cocción se mide sobre el
 *   peso ya limpio.
 */

const RUTA = '/calculadora-merma/';

const BRUTO = '#pesoBruto';
const LIMPIEZA = '#mermaLimpieza';
const COCCION = '#mermaCoccion';
const PRECIO = '#precio';

/** Escribe como el usuario y comprueba que el valor llegó al estado de React. */
async function poner(page: Page, selector: string, valor: string): Promise<void> {
  await page.locator(selector).fill(valor);
  await esperarValorEnReact(page, selector, valor);
}

async function ponerTodo(
  page: Page,
  bruto: string,
  limpieza: string,
  coccion: string,
  precio: string,
): Promise<void> {
  await poner(page, BRUTO, bruto);
  await poner(page, LIMPIEZA, limpieza);
  await poner(page, COCCION, coccion);
  await poner(page, PRECIO, precio);
}

/**
 * Las tarjetas de resultado, en orden: peso neto, rendimiento, factor y (si hay precio) coste.
 * El espacio antes del «%» se retira para que estos casos de cálculo no dependan del hallazgo E
 * (formato): ese se mide aparte.
 */
async function tarjetas(page: Page): Promise<string[]> {
  const textos = await page.locator('[class*="resCard"]').allInnerTexts();
  return textos.map((t) => t.replace(/\s+/g, ' ').trim().replace(/ %/g, '%'));
}

async function resultadoOEspera(page: Page): Promise<string> {
  return (await page.locator('main').innerText()).replace(/\s+/g, ' ');
}

test.describe('calculadora-merma · lo que promete el <h1>', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Calculadora de merma');
    await esperarHidratacion(page, [BRUTO, LIMPIEZA, COCCION, PRECIO]);
  });

  test('CASO 1 (normal) · 2000 g, 25 % + 20 %, 12 €/kg → 1200 g, 60 %, ×1,67 y 20,00 € el kilo útil', async ({ page }) => {
    // limpio 2000 × 0,75 = 1500 · neto 1500 × 0,80 = 1200 · 1200/2000 = 60 % · 2000/1200 = 1,667
    // coste útil = 12 / 0,60 = 20,00 € (no 12 × 1,40 = 16,80 €, que es dividir por 1 + merma)
    await ponerTodo(page, '2000', '25', '20', '12');
    const t = await tarjetas(page);
    expect(t).toEqual([
      '1200 g peso neto aprovechable',
      '60,0% rendimiento (40,0% de merma)',
      '×1,67 factor de corrección (bruto / neto)',
      '20,00 € coste real por kilo útil',
    ]);
    expect(t.join(' ')).not.toContain('16,80');
  });

  test('CASO 1 (normal) · el precio admite coma decimal: 12,5 €/kg con rendimiento del 60 % → 20,83 €', async ({ page }) => {
    // 12,5 / 0,6 = 20,8333… → 20,83 €
    await ponerTodo(page, '2000', '25', '20', '12,5');
    expect((await tarjetas(page))[3]).toBe('20,83 € coste real por kilo útil');
  });

  test('CASO 1 (normal) · las dos mermas se encadenan: 20 % + 30 % son 44 % de merma total, no 50 %', async ({ page }) => {
    // 1000 × 0,8 = 800 limpios · 800 × 0,7 = 560 útiles · 1000/560 = 1,7857 → ×1,79
    await ponerTodo(page, '1000', '20', '30', '');
    expect(await tarjetas(page)).toEqual([
      '560 g peso neto aprovechable',
      '56,0% rendimiento (44,0% de merma)',
      '×1,79 factor de corrección (bruto / neto)',
    ]);
  });

  test('CASO 1 (normal) · cuadra con la FAQ: 10 €/kg que rinde medio kilo útil cuesta 20 € el kilo útil', async ({ page }) => {
    // FAQ del JSON-LD: «Si pagas 10 € por kilo de un producto que rinde solo medio kilo útil,
    // ese medio kilo te cuesta 20 € por kilo». 1000 g, 50 % → 500 g, factor 2, 10 × 2 = 20 €.
    await ponerTodo(page, '1000', '50', '0', '10');
    expect(await tarjetas(page)).toEqual([
      '500 g peso neto aprovechable',
      '50,0% rendimiento (50,0% de merma)',
      '×2,00 factor de corrección (bruto / neto)',
      '20,00 € coste real por kilo útil',
    ]);
  });

  test('CASO 2 (límite) · merma 0 %: todo se aprovecha, factor ×1,00 y el coste útil es el de compra', async ({ page }) => {
    // Se parte del 20 % inicial, así que poner 0 sí mueve el estado.
    await ponerTodo(page, '1000', '0', '0', '8');
    expect(await tarjetas(page)).toEqual([
      '1000 g peso neto aprovechable',
      '100,0% rendimiento (0,0% de merma)',
      '×1,00 factor de corrección (bruto / neto)',
      '8,00 € coste real por kilo útil',
    ]);
  });

  test('CASO 2 (límite) · merma del 99 %: 10 g útiles, factor ×100,00 y 800,00 € el kilo útil', async ({ page }) => {
    // 1000 × 0,01 = 10 g · 1000/10 = 100 · 8 × 100 = 800 €
    await ponerTodo(page, '1000', '99', '0', '8');
    expect(await tarjetas(page)).toEqual([
      '10 g peso neto aprovechable',
      '1,0% rendimiento (99,0% de merma)',
      '×100,00 factor de corrección (bruto / neto)',
      '800,00 € coste real por kilo útil',
    ]);
  });

  test('CASO 2 (límite) · peso bruto 0 no da resultado y dice qué falta', async ({ page }) => {
    await ponerTodo(page, '0', '20', '0', '8');
    await expect(page.locator('[class*="resCard"]')).toHaveCount(0);
    await expect(page.locator('[class*="placeholder"]')).toHaveText('Introduce un peso bruto para calcular la merma.');
  });

  test('CASO 2 (límite) · precio 0 no inventa un coste: sin tarjeta de coste', async ({ page }) => {
    await ponerTodo(page, '1000', '20', '0', '0');
    expect(await tarjetas(page)).toEqual([
      '800 g peso neto aprovechable',
      '80,0% rendimiento (20,0% de merma)',
      '×1,25 factor de corrección (bruto / neto)',
    ]);
  });

  test('CASO 3 (rechazo) · peso negativo, texto o vacío no producen resultado', async ({ page }) => {
    for (const entrada of ['-500', 'abc', '']) {
      await poner(page, BRUTO, entrada);
      await expect(page.locator('[class*="resCard"]'), `peso «${entrada}»`).toHaveCount(0);
      await expect(page.locator('[class*="placeholder"]')).toBeVisible();
    }
  });

  test('HALLAZGO A (03/11/2026, ABIERTO) · «2.000» g es dos mil: 1200 g útiles, no 1 g', async ({ page }) => {
    // `parseFloat('2.000')` = 2 → 2 × 0,75 × 0,8 = 1,2 → «1 g». El rendimiento, el factor y el
    // coste no cambian (dependen solo de los porcentajes), así que el error queda en el peso.
    test.fail();
    await ponerTodo(page, '2.000', '25', '20', '12');
    expect((await tarjetas(page))[0]).toBe('1200 g peso neto aprovechable');
  });

  test('HALLAZGO A (03/11/2026, ABIERTO) · una merma ilegible no se toma por 0 % ni por su prefijo', async ({ page }) => {
    // Hoy «abc» → 0 % (por el `|| 0`) y «12abc» → 12 % (parseFloat se queda con el prefijo),
    // y en los dos se presenta un resultado completo como si la merma fuera válida.
    test.fail();
    await ponerTodo(page, '1000', '20', '0', '8');
    for (const basura of ['abc', '12abc']) {
      await poner(page, LIMPIEZA, basura);
      await expect(page.locator('[class*="resCard"]'), `merma «${basura}»`).toHaveCount(0);
    }
  });

  test('HALLAZGO B (03/11/2026, ABIERTO) · una merma negativa o mayor que 100 % no se recorta en silencio', async ({ page }) => {
    // Hoy «-10» se calcula como 0 % (1000 g, 100,0 %, 8,00 €), «150» como 100 % y una cocción
    // de «-20» como 0 %: un resultado con aspecto de válido para una merma imposible.
    test.fail();
    await ponerTodo(page, '1000', '20', '0', '8');
    for (const [campo, valor] of [[LIMPIEZA, '-10'], [LIMPIEZA, '150'], [COCCION, '-20']] as const) {
      await poner(page, LIMPIEZA, '20');
      await poner(page, COCCION, '0');
      await poner(page, campo, valor);
      await expect(page.locator('[class*="resCard"]'), `${campo} = «${valor}»`).toHaveCount(0);
    }
  });

  test('HALLAZGO C (03/11/2026, ABIERTO) · con una merma total del 100 % el factor no puede ser ×0,00', async ({ page }) => {
    // Con 0 g útiles, bruto / neto es una división por cero: no hay factor (tiende a infinito).
    // «×0,00» diría que no hace falta comprar nada, y la tarjeta de coste desaparece sin decir por qué.
    test.fail();
    await ponerTodo(page, '1000', '100', '0', '8');
    expect(await resultadoOEspera(page)).not.toContain('×0,00');
    await poner(page, LIMPIEZA, '0');
    await poner(page, COCCION, '100');
    expect(await resultadoOEspera(page)).not.toContain('×0,00');
  });

  test('HALLAZGO D (03/11/2026, ABIERTO) · lo que promete el JSON-LD («peso limpio») se ve en la página', async ({ page }) => {
    // features[0] = «Peso limpio y peso neto tras limpieza y cocción». El motor calcula
    // pesoLimpio, pero ninguna tarjeta lo muestra. Se cumple mostrándolo o retirando la promesa.
    test.fail();
    const features = await page.$$eval('script[type="application/ld+json"]', (nodos) =>
      nodos
        .map((n) => JSON.parse(n.textContent || '{}') as { featureList?: unknown; features?: unknown })
        .flatMap((j) => [j.featureList, j.features])
        .flat()
        .filter((f): f is string => typeof f === 'string'),
    );
    const prometePesoLimpio = features.join(' ').toLowerCase().includes('peso limpio');
    await ponerTodo(page, '2000', '25', '20', '12');
    const muestraPesoLimpio = (await resultadoOEspera(page)).toLowerCase().includes('peso limpio');
    expect(prometePesoLimpio && !muestraPesoLimpio, 'promete el peso limpio y no lo muestra').toBe(false);
  });

  test('HALLAZGO E (03/11/2026, ABIERTO) · el «%» va separado de la cifra con espacio duro', async ({ page }) => {
    // CLAUDE.md global §2 (decidido el 25/09/2026): «15 %», con U+00A0. Hoy sale «60,0%».
    test.fail();
    await ponerTodo(page, '2000', '25', '20', '12');
    const rendimiento = await page.locator('[class*="resCardDestacado"]').innerText();
    expect(rendimiento).toContain('60,0 %');
    expect(rendimiento).toContain('40,0 %');
  });
});
