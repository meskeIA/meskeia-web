import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { comprobarFaqPageUnico } from './_faqpage-unico';

/**
 * Inspector — densidad-liquidos (segmento motor, riesgo 3 · vertical Coquinum)
 *
 * Primera inspección: 18/11/2026.
 *
 * La app promete en su <h1> «Conversor de líquidos (ml ↔ g)» y en la metadata «Convierte
 * mililitros a gramos (y al revés) según el líquido […] Para recetas precisas». Hay verdad
 * comprobable: masa = volumen × densidad, y al revés.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   lib/calculadoras/densidadLiquidos.ts (sin más consumidores que esta página ni tests previos)
 *     · LIQUIDOS               ← 12 líquidos con su densidad en g/ml, sin temperatura de referencia
 *     · convertirDensidad()    ← ml→g: cantidad × densidad · g→ml: cantidad ÷ densidad,
 *                                redondeado a UNA cifra decimal; null si cantidad no es > 0
 *   app/densidad-liquidos/page.tsx
 *     · num(v) = parseFloat(v.replace(',', '.')) || 0   ← parser casero (check:parser lo prohíbe
 *                                                         en código nuevo): lee «1.000» como 1
 *     · formatNumber(valor, entero ? 0 : 1)             ← es-ES: 4 cifras sin agrupar, 5 con punto
 *
 * LA TABLA DEL MOTOR (manda sobre cualquier memoria): agua 1 · leche 1,03 · nata 1 · aceite 0,92 ·
 * miel 1,42 · sirope/glucosa 1,33 · almíbar 1,3 · leche condensada 1,3 · vino 0,99 · vinagre 1,01 ·
 * zumo 1,05 · licor 0,94. El bloque educativo y el FAQPage repiten aceite 0,92, leche 1,03,
 * sirope 1,33 y miel 1,42.
 *
 * ══ LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR ══
 *
 *   CASO 1 (normal)
 *     250 ml de aceite (estado inicial) : 250 × 0,92 = 230          → «230 g»
 *     500 g de miel → ml                : 500 ÷ 1,42 = 352,1127     → «352,1 ml»
 *     100 ml de miel → g                : 100 × 1,42 = 142          → «142 g»
 *     1000 ml de leche → g              : 1000 × 1,03 = 1030        → «1030 g» (es-ES no agrupa
 *                                         cuatro cifras: no es un defecto)
 *   CASO 2 (límite)
 *     100000 ml de miel (el más denso)  : 100000 × 1,42 = 142000    → «142.000 g»
 *     920 g de aceite (el menos denso)  : 920 ÷ 0,92 = 1000         → «1000 ml»
 *     0 ml                              : no es una cantidad        → «Introduce una cantidad.»
 *     «1.000» ml de agua (mil en español): 1000 × 1 = 1000          → «1000 g»   · la app da «1 g»
 *     «12.500» ml de miel               : 12500 × 1,42 = 17750      → «17.750 g» · la app da «17,8 g»
 *     «1.234,5» ml de aceite            : 1234,5 × 0,92 = 1135,74   → «1135,7 g» · la app da «1,1 g»
 *     «142.000» g de miel (la salida de arriba, devuelta a la entrada): 142000 ÷ 1,42 = 100000
 *                                                                    → «100.000 ml» · la app da «100 ml»
 *   CASO 3 (rechazo)
 *     «-5», vacío y «abc»               →«Introduce una cantidad.», sin resultado ni NaN
 *     «12abc» y «1e3»                   → también rechazo (parseSpanishNumber da NaN)
 *                                         · la app da «11 g» y «920 g» (parseFloat)
 *
 * FUENTE DE LA TEMPERATURA: PubChem, agua (CID 962), «Density», con el Merck Index citado por el
 * HSDB: «1.000000 g/mL at 3.98 °C» y «0.999868 at 0 °C/4 °C». La densidad se da SIEMPRE con su
 * temperatura; la app no da ninguna, ni en el motor, ni en el selector, ni en la tabla educativa.
 *
 * Los hallazgos van con test.fail(): cuando se reparen, el test «pasará» y Playwright lo marcará
 * como fallo inesperado; entonces se quita el test.fail() y se escribe REPARADO.
 */

const RUTA = '/densidad-liquidos/';

type Direccion = 'ml-a-g' | 'g-a-ml';

const NOMBRE_PESTANA: Record<Direccion, string> = {
  'ml-a-g': 'Mililitros → gramos',
  'g-a-ml': 'Gramos → mililitros',
};

/** El panel del conversor (la <section aria-label="Conversor">). */
function panel(page: Page): Locator {
  return page.getByRole('region', { name: 'Conversor' });
}

/** Abre la app y espera a que React haya montado el campo (un clic antes se pierde). */
async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Conversor de líquidos (ml ↔ g)');
  await esperarHidratacion(page, ['#cantidad']);
}

/**
 * Elige líquido y dirección, escribe la cantidad, comprueba que el ESTADO de React la recogió y
 * devuelve el texto del resultado, o null si la app no pinta resultado (región role=status).
 */
async function convertir(
  page: Page,
  liquido: string,
  direccion: Direccion,
  cantidad: string,
): Promise<string | null> {
  await page.selectOption('#liquido', liquido);
  await esperarValorEnReact(page, '#liquido', liquido);
  const pestana = page.getByRole('tab', { name: NOMBRE_PESTANA[direccion] });
  await pestana.click();
  await expect(pestana).toHaveAttribute('aria-selected', 'true');
  await page.fill('#cantidad', cantidad);
  await esperarValorEnReact(page, '#cantidad', cantidad);
  const estado = panel(page).getByRole('status');
  if ((await estado.count()) === 0) return null;
  return (await estado.innerText()).replace(/\s+/g, ' ').trim();
}

/** Comprueba que la app NO pinta resultado y sí el aviso de cantidad. */
async function esperarRechazo(page: Page, liquido: string, cantidad: string): Promise<void> {
  expect(await convertir(page, liquido, 'ml-a-g', cantidad), `«${cantidad}» no es una cantidad`).toBeNull();
  await expect(panel(page).getByText('Introduce una cantidad.')).toBeVisible();
}

interface PreguntaLd {
  pregunta: string;
  respuesta: string;
}

/** Preguntas del FAQPage y features del WebApplication del JSON-LD. */
async function jsonLd(page: Page): Promise<{ preguntas: PreguntaLd[]; features: string[] }> {
  return page.evaluate(() => {
    const preguntas: { pregunta: string; respuesta: string }[] = [];
    let features: string[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      const nodos = (j['@graph'] as Record<string, unknown>[] | undefined) ?? [j];
      for (const n of nodos) {
        if (n['@type'] === 'WebApplication') features = (n.featureList as string[] | undefined) ?? [];
        if (n['@type'] !== 'FAQPage') continue;
        for (const q of n.mainEntity as { name: string; acceptedAnswer: { text: string } }[]) {
          preguntas.push({ pregunta: q.name, respuesta: q.acceptedAnswer.text });
        }
      }
    }
    return { preguntas, features };
  });
}

test.describe('Los tres casos resueltos a mano', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 (normal) · volumen → masa y masa → volumen con la densidad de la tabla', async ({ page }) => {
    // Estado inicial: aceite, ml → g, 250 ml. 250 × 0,92 = 230 g
    await expect(panel(page).getByRole('status')).toHaveText(/230 g\s*densidad 0,92 g\/ml/);
    // 500 g de miel ÷ 1,42 g/ml = 352,1127 ml → una cifra decimal
    expect(await convertir(page, 'miel', 'g-a-ml', '500')).toBe('352,1 ml densidad 1,42 g/ml');
    // 100 ml de miel × 1,42 g/ml = 142 g (la cifra que da el FAQPage: «unos 142 gramos»)
    expect(await convertir(page, 'miel', 'ml-a-g', '100')).toBe('142 g densidad 1,42 g/ml');
    // 1000 ml de leche × 1,03 = 1030 g; es-ES no agrupa cuatro cifras
    expect(await convertir(page, 'leche', 'ml-a-g', '1000')).toBe('1030 g densidad 1,03 g/ml');
  });

  test('CASO 2 (límite) · el más denso a gran escala, el menos denso y el cero', async ({ page }) => {
    // 100000 ml de miel × 1,42 = 142000 g; con cinco cifras o más sí va el punto de millar
    expect(await convertir(page, 'miel', 'ml-a-g', '100000')).toBe('142.000 g densidad 1,42 g/ml');
    // 920 g de aceite ÷ 0,92 = 1000 ml exactos (el redondeo a una cifra no deja «999,9»)
    expect(await convertir(page, 'aceite', 'g-a-ml', '920')).toBe('1000 ml densidad 0,92 g/ml');
    // 0 no es una cantidad que convertir
    await esperarRechazo(page, 'aceite', '0');
  });

  test('CASO 3 (rechazo) · negativo, vacío y texto no dan resultado ni NaN', async ({ page }) => {
    for (const malo of ['-5', '', 'abc']) await esperarRechazo(page, 'aceite', malo);
    await expect(page.locator('main')).not.toContainText(/NaN|Infinity|undefined|No definido|∞/);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · el punto de millar se lee como decimal: «1.000» ml de agua dan «1 g»', async ({
    page,
  }) => {
    // num() = parseFloat(v.replace(',', '.')): «1.000» → 1, «12.500» → 12,5, «1.234,5» → 1,234.
    // El canónico es parseSpanishNumber de @/lib (con un solo separador gana el español).
    test.fail();
    // 1000 ml × 1 g/ml = 1000 g
    expect(await convertir(page, 'agua', 'ml-a-g', '1.000')).toBe('1000 g densidad 1,00 g/ml');
    // 12500 ml × 1,42 = 17750 g
    expect(await convertir(page, 'miel', 'ml-a-g', '12.500')).toBe('17.750 g densidad 1,42 g/ml');
    // 1234,5 ml × 0,92 = 1135,74 g → una cifra decimal
    expect(await convertir(page, 'aceite', 'ml-a-g', '1.234,5')).toBe('1135,7 g densidad 0,92 g/ml');
    // La app no sabe leer su propia salida: «142.000 g» de miel ÷ 1,42 = 100000 ml
    expect(await convertir(page, 'miel', 'g-a-ml', '142.000')).toBe('100.000 ml densidad 1,42 g/ml');
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · «12abc» y «1e3» se aceptan como 12 y 1000', async ({ page }) => {
    // parseFloat se queda con el prefijo numérico y entiende la notación científica; con
    // parseSpanishNumber las dos son NaN. La app da «11 g» (12 × 0,92 = 11,04) y «920 g».
    test.fail();
    await esperarRechazo(page, 'aceite', '12abc');
    await esperarRechazo(page, 'aceite', '1e3');
  });
});

test.describe('Textos frente al motor de la misma página', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('el FAQPage da las mismas densidades y pesos que el conversor', async ({ page }) => {
    const { preguntas } = await jsonLd(page);
    const todo = preguntas.map((p) => p.respuesta).join(' ');
    // «Un litro de aceite pesa unos 920 gramos […] 0,92 g/ml»: 1000 × 0,92 = 920
    expect(todo).toContain('0,92 g/ml');
    expect(todo).toContain('920 gramos');
    expect(await convertir(page, 'aceite', 'ml-a-g', '1000')).toBe('920 g densidad 0,92 g/ml');
    // «100 ml de miel pesan unos 142 gramos»: 100 × 1,42 = 142
    expect(todo).toContain('1,42 g/ml');
    expect(todo).toContain('142 gramos');
    expect(await convertir(page, 'miel', 'ml-a-g', '100')).toBe('142 g densidad 1,42 g/ml');
    // «la leche tiene una densidad de alrededor de 1,03 g/ml»
    expect(todo).toContain('1,03 g/ml');
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · el bloque educativo dice que 100 ml de miel pesan «casi 145 gramos»; el conversor da 142', async ({
    page,
  }) => {
    // 100 ml × 1,42 g/ml = 142 g: lo que da el conversor y lo que dice el FAQPage («unos 142
    // gramos»). El párrafo «Mismo volumen, distinto peso» dice «casi 145 gramos».
    test.fail();
    expect(await convertir(page, 'miel', 'ml-a-g', '100')).toBe('142 g densidad 1,42 g/ml');
    const parrafo = (await page.locator('p', { hasText: '100 ml de miel' }).textContent()) ?? '';
    expect(parrafo).not.toContain('casi 145');
    expect(parrafo).toMatch(/100 ml de miel pesan[^.]*142/);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · las densidades no dicen a qué temperatura valen', async ({ page }) => {
    // PubChem (agua, CID 962; Merck Index vía HSDB): 1,000000 g/ml a 3,98 °C y 0,999868 a 0 °C.
    // Ni el selector, ni el resultado, ni la tabla «Densidades de cocina» dan la temperatura.
    test.fail();
    const texto = (await page.locator('main').textContent()) ?? '';
    expect(texto).toMatch(/\d\s?°C/);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · el FAQPage pregunta lo que la página no muestra', async ({ page }) => {
    // Las cinco preguntas de faqJsonLd no están en la página: no hay FAQ visible. §1.ter: el
    // FAQPage sale de PREGUNTAS_FRECUENTES, que la página pinta.
    test.fail();
    await comprobarFaqPageUnico(page);
  });

  test('las features del JSON-LD son al menos cuatro', async ({ page }) => {
    const { features } = await jsonLd(page);
    expect(features.length).toBeGreaterThanOrEqual(4);
  });
});

test.describe('Accesibilidad', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('las pestañas de dirección llevan type="button" y anuncian cuál está activa', async ({ page }) => {
    for (const direccion of ['ml-a-g', 'g-a-ml'] as const) {
      const pestana = page.getByRole('tab', { name: NOMBRE_PESTANA[direccion] });
      expect(await pestana.getAttribute('type')).toBe('button');
      expect(await pestana.getAttribute('aria-selected')).not.toBeNull();
    }
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · al rechazar la cantidad desaparece la región viva y el aviso no se anuncia', async ({
    page,
  }) => {
    // La región role="status" aria-live solo existe mientras hay resultado; con «-5» se
    // desmonta y «Introduce una cantidad.» es un <p> sin región viva.
    test.fail();
    await convertir(page, 'aceite', 'ml-a-g', '-5');
    const viva = panel(page).locator('[aria-live], [role="status"], [role="alert"]');
    await expect(viva).toHaveCount(1, { timeout: 1000 });
    await expect(viva).toContainText('Introduce una cantidad');
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · el lector lee el emoji de cada opción del selector', async ({ page }) => {
    // Las opciones se pintan como «{emoji} {nombre}»: el nombre accesible es «🫒 Aceite (oliva /
    // girasol) (0,92 g/ml)» y un <option> no admite <span aria-hidden>.
    test.fail();
    const arbol = await page.locator('#liquido').ariaSnapshot();
    expect(arbol).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
