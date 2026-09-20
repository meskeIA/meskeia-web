import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector — calculadora-pintura (segmento interactiva, riesgo 2, 47 usos, 43 s de estancia)
 * Inspección del 20/09/2026 (Opus 5) · REPARACIÓN del 20/09/2026, en este mismo fichero.
 *
 * QUÉ PROMETE
 *   <h1> «Calculadora de Pintura» y subtítulo: «Calcula cuántos litros necesitas según
 *   superficie, capas y tipo de pared». La metadata añade el coste total. El bloque educativo
 *   publica una tabla de rendimientos por tipo de pintura (6 a 16 m²/L), una FAQ que cuantifica
 *   el gotelé y un recuadro de «errores frecuentes» que empieza por «no restar puertas y
 *   ventanas: pueden representar el 10–15 % de la superficie total de la pared».
 *
 * DÓNDE VIVE EL CÁLCULO
 *   Todo en la propia vista, `calcular()` de app/calculadora-pintura/page.tsx. Los rendimientos
 *   por soporte son un objeto del fichero, ahora con rango declarado y editables en pantalla.
 *     m² (modo habitación) = 2 × (largo + ancho) × alto  + techo opcional − huecos
 *     m² (modo directo)    = parseSpanishNumber(entrada)      ← entiende «1.500» y rechaza «12abc»
 *     entrada imposible → mensaje en role="alert" y el panel se vacía
 *     litros = m² × capas / rendimiento     lisa 10-12 · gotelé 7-8 · rugosa 6-7 · porosa 5-6
 *     litros mostrados = ceil(litros × 10) / 10        ← redondeo AL ALZA a la décima
 *     botes de 4 L = ceil(litros/4)   ·   botes de 15 L = ceil(litros/15)   ← también al alza
 *     coste = litros DEL ENVASE × precio por litro     ← lo que se paga, no los litros sueltos
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal, en MÓVIL) — dormitorio de 4 × 3 m con 2,5 m de altura, 2 manos, pared lisa
 *     perímetro   = 2 × (4 + 3) = 14 m
 *     superficie  = 14 × 2,5 = 35,0 m²
 *     litros      = 35 × 2 / 12 = 5,8333… → al alza a la décima → 5,9 L
 *     botes 4 L   = ⌈5,9 / 4⌉ = ⌈1,475⌉ = 2 botes  (8 L: cubre los 5,9 con margen)
 *     botes 15 L  = ⌈5,9 / 15⌉ = 1 bote
 *     coste       = 8 L comprados × 8 €/L = 64,00 €   ← los 2 botes, no los 5,9 L sueltos
 *
 *   CASO 2 (límite) — la fachada de 1.500 m² a UNA sola mano, y el extremo contrario
 *     litros     = 1500 × 1 / 12 = 125,0 L exactos
 *     botes 4 L  = ⌈125 / 4⌉ = ⌈31,25⌉ = 32 botes   ·   botes 15 L = ⌈8,333⌉ = 9 botes
 *     coste      = 32 × 4 L × 8 €/L = 1.024,00 €  (con envase de 15 L serían 135 L = 1.080,00 €)
 *     Por abajo: 0,5 m² × 1 / 12 = 0,0417 L → 0,1 L y 1 bote. Lo que importa aquí es que
 *     NINGUNO de los tres redondeos vaya a la baja: quedarse corto a mitad de pared es el
 *     defecto con consecuencia real de esta app, y no lo tiene.
 *
 *   CASO 3 (debe rechazarse) — medida negativa, texto y campo vacío
 *     Una pared no mide −5 m² ni «abc» m². Esperado: mensaje de error y NINGUNA cifra
 *     publicada. Y en modo habitación, un largo negativo se rechaza POR SÍ MISMO: sumar
 *     primero el perímetro dejaba que −1 y 5 se compensaran en 20 m² «válidos».
 *
 * LOS 10 HALLAZGOS DEL 20/09/2026, Y CÓMO SE REPARARON
 *   1. ALTO   · «1.500» valía 1,5 m². Ahora se parsea con `parseSpanishNumber`.
 *   2. MEDIO  · texto, vacío, negativo y cero no se rechazaban y quedaba en pantalla la cifra
 *               anterior. Ahora hay role="alert" y el panel se vacía; y si se cambian los
 *               datos sin recalcular, el resultado se marca como caducado.
 *   3. MEDIO  · «12abc» entraba como 12 m². Ahora es NaN y se rechaza.
 *   4. MEDIO  · largo negativo aceptado. Ahora se valida CADA medida, no el perímetro sumado.
 *   5. MEDIO  · la FAQ prometía «+20 % a 40 %» y el paso 2 «hasta el doble» para el gotelé,
 *               mientras el motor aplica +50 %. Los textos dicen ya lo que el motor hace.
 *   6. MEDIO  · rendimientos sin fuente. Ahora se declara el rango de cada soporte, hay
 *               <DataReference> y el rendimiento es un campo editable.
 *   7. MEDIO  · el coste valoraba litros sueltos. Ahora valora los envases que se compran.
 *   8. MEDIO  · modo habitación sin huecos ni techo. Ahora tiene los dos campos.
 *   9. BAJO   · el JSON-LD anunciaba la cifra con 10 % de margen y no existía. Ahora se calcula.
 *  10. BAJO   · los cuatro botones sin type="button" (CLAUDE.md §5). Ya lo llevan.
 * ══════════════════════════════════════════════════════════════════════════════════════════ */

const RUTA = '/calculadora-pintura/';

/** El panel de resultados, que es el único role="status" de la página. */
const panel = (page: Page) => page.locator('[role="status"]');

/** El mensaje de entrada rechazada. */
/**
 * El aviso de la PROPIA app. Next monta siempre su anunciador de rutas
 * (`#__next-route-announcer__`), que también declara role="alert", así que un
 * `[role="alert"]` a secas resuelve a dos elementos y rompe el modo estricto.
 */
const aviso = (page: Page) => page.locator('[role="alert"]:not(#__next-route-announcer__)');

/** La cifra grande de litros, con su rótulo. */
const litros = (page: Page) => panel(page).getByText('de pintura necesarios').locator('..');

/** Una fila del desglose: «Superficie total», «Botes de 4L», «Botes de 15L», «Coste estimado». */
const fila = (page: Page, etiqueta: string) =>
  panel(page).getByText(etiqueta, { exact: true }).locator('..');

const calcular = (page: Page) => page.getByRole('button', { name: 'Calcular' }).click();

/** «11,3 L» → 11.3. Formato español: el punto es millar y la coma, decimal. */
function aLitros(texto: string): number {
  const encontrado = texto.match(/(-?[\d.]*\d(?:,\d+)?)\s*L\b/);
  if (!encontrado) throw new Error(`No hay litros en «${texto}»`);
  return Number(encontrado[1].replace(/\./g, '').replace(',', '.'));
}

async function abrir(page: Page) {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#metrosCuadradosInput']);
}

/** Cambia al modo «Por habitación» y espera a que sus tres campos estén vivos. */
async function abrirModoHabitacion(page: Page) {
  await abrir(page);
  await page.getByRole('button', { name: 'Por habitación' }).click();
  await esperarHidratacion(page, ['#largoInput', '#anchoInput', '#altoInput']);
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// CASO 1 — en MÓVIL (Pixel 7), que es donde se usa una calculadora de obra
// ═══════════════════════════════════════════════════════════════════════════════════════════
test.describe('CASO 1 en móvil (Pixel 7) — el dormitorio de 4 × 3 × 2,5 m', () => {
  // Se enumeran las opciones en vez de esparcir `...devices['Pixel 7']` porque el device trae
  // `defaultBrowserType` y Playwright no lo admite dentro de un describe.
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  test.beforeEach(async ({ page }) => {
    await abrirModoHabitacion(page);
    expect(page.viewportSize()).toEqual({ width: 412, height: 839 }); // devices['Pixel 7']
  });

  test('CASO 1 — 35,0 m² de perímetro × altura, 5,9 L y 2 botes de 4 L', async ({ page }) => {
    await sembrarValor(page, '#largoInput', '4');
    await sembrarValor(page, '#anchoInput', '3');
    // El campo nace con «2.5»: se siembra con la coma española, que también es entrada válida.
    await sembrarValor(page, '#altoInput', '2,5');
    // Las 2 manos, los 12 m²/L y los 8 €/L son los valores por defecto: sembrarlos no probaría nada.
    await expect(page.locator('#numCapasSelect')).toHaveValue('2');
    await expect(page.locator('#rendimientoInput')).toHaveValue('12');
    await expect(page.locator('#precioLitroInput')).toHaveValue('8');
    await calcular(page);

    // 2 × (4 + 3) × 2,5 = 35 m²: perímetro por altura, las cuatro paredes.
    await expect(fila(page, 'Superficie total')).toContainText('35,0 m²');
    // 35 × 2 manos / 12 m²/L = 5,8333… → al alza a la décima → 5,9 L
    await expect(litros(page)).toContainText('5,9 L');
    // ⌈5,9/4⌉ = 2 botes (8 L) y ⌈5,9/15⌉ = 1 bote: el envase INMEDIATAMENTE SUPERIOR en ambos.
    await expect(fila(page, 'Botes de 4L')).toContainText('2 botes');
    await expect(fila(page, 'Botes de 15L')).toContainText('1 bote');
    // El coste es el de los 2 botes de 4 L —8 L cerrados— a 8 €/L, no el de los 5,9 L sueltos.
    await expect(fila(page, 'Coste estimado')).toContainText(/64,00\s*€/);
    await expect(fila(page, 'Coste estimado')).not.toContainText('47,20');
  });

  test('CASO 1 · en 412 px la página no desborda a lo ancho', async ({ page }) => {
    await sembrarValor(page, '#largoInput', '4');
    await sembrarValor(page, '#anchoInput', '3');
    await sembrarValor(page, '#huecosInput', '3,3');
    await calcular(page);
    const ancho = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(ancho.scroll).toBeLessThanOrEqual(ancho.cliente);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// CASO 2 — el límite por arriba y por abajo: ningún redondeo puede ir a la baja
// ═══════════════════════════════════════════════════════════════════════════════════════════
test.describe('CASO 2 (límite) — la fachada de 1.500 m² a una sola mano, y los 0,5 m²', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 2 — 1500 m² × 1 mano = 125,0 L, 32 botes de 4 L y 9 de 15 L', async ({ page }) => {
    await sembrarValor(page, '#metrosCuadradosInput', '1500');
    await page.locator('#numCapasSelect').selectOption('1');
    await calcular(page);

    // 1500 × 1 / 12 = 125 L exactos, sin nada que redondear.
    await expect(fila(page, 'Superficie total')).toContainText('1500,0 m²');
    await expect(litros(page)).toContainText('125,0 L');
    // ⌈125/4⌉ = ⌈31,25⌉ = 32 botes. Con 31 botes (124 L) se acaba la pintura antes que la pared.
    await expect(fila(page, 'Botes de 4L')).toContainText('32 botes');
    // ⌈125/15⌉ = ⌈8,333⌉ = 9 botes.
    await expect(fila(page, 'Botes de 15L')).toContainText('9 botes');
    // 32 × 4 = 128 L comprados × 8 €/L. Con el envase grande serían 135 L, o sea 1.080 €:
    // el coste que se publica es el de la compra con menos sobrante.
    await expect(fila(page, 'Coste estimado')).toContainText(/1\.?024,00\s*€/);
  });

  test('CASO 2 · por abajo, 0,5 m² siguen siendo 0,1 L y un bote, nunca cero', async ({ page }) => {
    await sembrarValor(page, '#metrosCuadradosInput', '0,5');
    await page.locator('#numCapasSelect').selectOption('1');
    await calcular(page);

    // 0,5 / 12 = 0,0417 L → al alza a la décima → 0,1 L, y ⌈0,1/4⌉ = 1 bote.
    await expect(litros(page)).toContainText('0,1 L');
    await expect(fila(page, 'Botes de 4L')).toContainText('1 bote');
  });

  test('CASO 2 · las tres manos escalan la cuenta, no el rendimiento', async ({ page }) => {
    // 45 m² de pared lisa: 45/12 = 3,75 L por mano → 3,8 · 7,5 · 11,3 L al ir de 1 a 3 manos.
    await sembrarValor(page, '#metrosCuadradosInput', '45');
    for (const [manos, esperado] of [
      ['1', '3,8 L'], // 3,75 → al alza
      ['2', '7,5 L'], // exacto
      ['3', '11,3 L'], // 11,25 → al alza
    ] as const) {
      await page.locator('#numCapasSelect').selectOption(manos);
      await calcular(page);
      await expect(litros(page)).toContainText(esperado);
    }
  });
});

/* ── LOS 10 HALLAZGOS, ya reparados, escritos como REGRESIÓN ───────────────────────────────
 * Cada bloque era un TESTIGO de lo que la app hacía mal el 20/09/2026 y ahora exige el
 * comportamiento correcto, con la cifra vieja nombrada para que se vea qué cambió.
 * ─────────────────────────────────────────────────────────────────────────────────────────*/
test.describe('REPARACIÓN de los hallazgos del 20/09/2026', () => {
  test('1 · «1.500» m² son mil quinientos: el millar español entra bien', async ({ page }) => {
    await abrir(page);
    // Es la escritura que el propio CLAUDE.md §2 declara obligatoria para las cifras, y la que
    // sale sola al teclear una fachada. Antes: parseFloat('1.500') = 1,5 y nadie lo decía.
    await sembrarValor(page, '#metrosCuadradosInput', '1.500');
    await calcular(page);

    // 1500 × 2 / 12 = 250,0 L y ⌈250/4⌉ = 63 botes de 4 L.
    await expect(fila(page, 'Superficie total')).toContainText('1500,0 m²');
    await expect(litros(page)).toContainText('250,0 L');
    await expect(fila(page, 'Botes de 4L')).toContainText('63 botes');

    // Y con el decimal español detrás: «1.234,56» son mil doscientos treinta y cuatro con 56.
    await sembrarValor(page, '#metrosCuadradosInput', '1.234,56');
    await calcular(page);
    await expect(fila(page, 'Superficie total')).toContainText('1234,6 m²');
    await expect(litros(page)).toContainText('205,8 L'); // 1234,56 × 2 / 12 = 205,76 → 205,8

    // Lo que ya funcionaba antes sigue funcionando: sin separador de millar, con punto o con
    // coma decimal.
    for (const escritura of ['1500', '2.5', '2,5']) {
      await sembrarValor(page, '#metrosCuadradosInput', escritura);
      await calcular(page);
      await expect(fila(page, 'Superficie total')).toContainText(
        escritura === '1500' ? '1500,0 m²' : '2,5 m²',
      );
    }
  });

  test('2 · texto, vacío, negativo y cero se rechazan y el panel se vacía', async ({ page }) => {
    await abrir(page);

    for (const entrada of ['abc', '-5', '0', '']) {
      // Se parte siempre de un cálculo válido en pantalla, que es lo que antes se quedaba
      // publicado bajo una entrada nueva: el usuario veía «abc» en el campo y 7,5 L debajo.
      await sembrarValor(page, '#metrosCuadradosInput', '45');
      await calcular(page);
      await expect(litros(page)).toContainText('7,5 L'); // 45 × 2 / 12

      await sembrarValor(page, '#metrosCuadradosInput', entrada);
      await calcular(page);

      // Se dice en voz alta que no vale, y la cifra anterior desaparece.
      await expect(aviso(page)).toBeVisible();
      await expect(aviso(page)).toContainText(/Revisa/i);
      await expect(panel(page)).not.toContainText('7,5 L');
      await expect(panel(page)).toContainText('Introduce los datos para calcular');
    }
  });

  test('3 · «12abc» no es un número y se rechaza', async ({ page }) => {
    await abrir(page);
    await sembrarValor(page, '#metrosCuadradosInput', '12abc');
    await calcular(page);
    // Antes: parseFloat se quedaba con el prefijo y publicaba «12,0 m²» y 2,0 L.
    await expect(aviso(page)).toContainText(/Revisa/i);
    await expect(panel(page)).not.toContainText('m²');
    await expect(panel(page)).toContainText('Introduce los datos para calcular');
  });

  test('4 · un largo NEGATIVO se rechaza por sí mismo, sin esperar al perímetro', async ({
    page,
  }) => {
    await abrirModoHabitacion(page);
    // Antes: 2 × (−1 + 5) × 2,5 = 20 m². La suma del perímetro tapaba el signo y una medida
    // imposible se convertía en un supuesto válido de 3,4 L y 27,20 €.
    await sembrarValor(page, '#largoInput', '-1');
    await sembrarValor(page, '#anchoInput', '5');
    await sembrarValor(page, '#altoInput', '2,5');
    await calcular(page);

    await expect(aviso(page)).toContainText(/largo/i);
    await expect(panel(page)).not.toContainText('20,0 m²');
    await expect(panel(page)).toContainText('Introduce los datos para calcular');

    // Corregida la medida, la misma habitación sí calcula: 2 × (1 + 5) × 2,5 = 30 m².
    await sembrarValor(page, '#largoInput', '1');
    await calcular(page);
    await expect(fila(page, 'Superficie total')).toContainText('30,0 m²');
    await expect(aviso(page)).toHaveCount(0);
  });

  test('5 · el gotelé cuesta +50 % y el texto de la app dice eso mismo', async ({ page }) => {
    await abrir(page);
    await sembrarValor(page, '#metrosCuadradosInput', '45');

    await page.locator('#tipoSuperficieSelect').selectOption('lisa');
    await calcular(page);
    await expect(litros(page)).toContainText('7,5 L'); // 45 × 2 / 12
    const conLisa = aLitros(await litros(page).innerText());

    await page.locator('#tipoSuperficieSelect').selectOption('gotele');
    await calcular(page);
    await expect(litros(page)).toContainText('11,3 L'); // 45 × 2 / 8 = 11,25 → 11,3
    const conGotele = aLitros(await litros(page).innerText());

    // El motor aplica 12/8 = 1,5 exacto, que es lo que ahora prometen la FAQ y la guía.
    expect(conGotele / conLisa).toBeCloseTo(1.5, 1);

    // «Hasta el doble» es lo que hace la superficie POROSA: 12 → 6.
    await page.locator('#tipoSuperficieSelect').selectOption('porosa');
    await calcular(page);
    await expect(litros(page)).toContainText('15,0 L'); // 45 × 2 / 6 = exactamente el doble

    // Y el bloque educativo ya no da tres cifras distintas para el mismo factor.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const cuerpo = page.locator('body');
    await expect(cuerpo).toContainText('50% más');
    await expect(cuerpo).not.toContainText('entre un 20% y 40%');
    await expect(cuerpo).not.toContainText('hasta el doble de pintura que una lisa');
  });

  test('6 · los rendimientos declaran su rango, su origen y se pueden cambiar', async ({
    page,
  }) => {
    await abrir(page);
    // El selector publica el RANGO de cada soporte, no un único número optimista.
    const opciones = await page.locator('#tipoSuperficieSelect option').allInnerTexts();
    expect(opciones).toEqual([
      'Pared lisa, yeso o pladur (10–12 m²/L)',
      'Gotelé o textura media (7–8 m²/L)',
      'Ladrillo visto o estuco (6–7 m²/L)',
      'Hormigón o superficie muy absorbente (5–6 m²/L)',
    ]);

    // Y la página dice de dónde salen y a qué fecha responden (<DataReference>).
    const cuerpo = page.locator('body');
    await expect(cuerpo).toContainText('Datos de referencia');
    await expect(cuerpo).toContainText('Normativa aplicada:');
    await expect(cuerpo).toContainText('Última verificación:');
    await expect(cuerpo).toContainText('ficha técnica');

    // 12 m²/L es el extremo favorable del rango, así que el panel publica también los litros
    // del extremo bajo: 35 × 2 / 10 = 7,0 L frente a los 5,9 L de la cuenta principal.
    await sembrarValor(page, '#metrosCuadradosInput', '35');
    await calcular(page);
    await expect(litros(page)).toContainText('5,9 L');
    await expect(fila(page, 'Rendimiento aplicado')).toContainText('12,0 m²/L');
    await expect(fila(page, 'Si la pintura rinde menos')).toContainText('7,0 L');

    // Y el rendimiento es un campo: el de la ficha técnica del bote manda sobre el supuesto.
    const etiquetas = await page.locator('label').allInnerTexts();
    expect(etiquetas).toContain('Rendimiento de la pintura (m²/L)');
    await sembrarValor(page, '#rendimientoInput', '10');
    await calcular(page);
    await expect(litros(page)).toContainText('7,0 L');
  });

  test('7 · el «Coste estimado» valora los botes que hay que comprar', async ({ page }) => {
    await abrir(page);
    await sembrarValor(page, '#metrosCuadradosInput', '35');
    await calcular(page);

    // 2 botes de 4 L son 8 L cerrados: a 8 €/L, 64,00 €. Antes se publicaban 47,20 € (5,9 × 8),
    // un 26 % por debajo de lo que se va a pagar, con «2 botes» dos líneas más arriba.
    await expect(fila(page, 'Botes de 4L')).toContainText('2 botes');
    await expect(fila(page, 'Coste estimado')).toContainText(/64,00\s*€/);
    await expect(fila(page, 'Coste estimado')).not.toContainText('47,20');
    // Y se dice sobre qué envase se ha valorado, porque el de 15 L costaría 120,00 €.
    await expect(fila(page, 'Coste estimado')).toContainText('2 botes de 4 L');
    await expect(fila(page, 'Botes de 15L')).toContainText(/120,00\s*€/);
  });

  test('8 · el modo habitación descuenta huecos e incluye el techo si se le pide', async ({
    page,
  }) => {
    await abrirModoHabitacion(page);
    // Los campos del modo habitación, con los dos que faltaban.
    const etiquetas = await page.locator('label').allInnerTexts();
    expect(etiquetas).toEqual([
      'Largo (m)',
      'Ancho (m)',
      'Alto (m)',
      'Puertas y ventanas a descontar (m²)',
      'Incluir el techo (largo × ancho)',
      'Número de capas',
      'Tipo de superficie',
      'Rendimiento de la pintura (m²/L)',
      'Precio por litro (opcional)',
    ]);

    await sembrarValor(page, '#largoInput', '4');
    await sembrarValor(page, '#anchoInput', '3');
    await calcular(page);
    await expect(fila(page, 'Superficie total')).toContainText('35,0 m²');

    // Una puerta de 1,8 m² y una ventana de 1,5 —las medidas que da la propia FAQ de la app—
    // son 3,3 m² menos: 31,7 m² y 5,3 L (31,7 × 2 / 12 = 5,2833… → 5,3).
    await sembrarValor(page, '#huecosInput', '3,3');
    await calcular(page);
    await expect(fila(page, 'Superficie total')).toContainText('31,7 m²');
    await expect(litros(page)).toContainText('5,3 L');

    // Y el techo (4 × 3 = 12 m²) entra cuando se marca: 31,7 + 12 = 43,7 m² → 7,3 L.
    await page.locator('#techoInput').check();
    await calcular(page);
    await expect(fila(page, 'Superficie total')).toContainText('43,7 m²');
    await expect(litros(page)).toContainText('7,3 L');
    // El rótulo «Superficie total» ya no promete lo que no hacía: el desglose lo explica.
    await expect(fila(page, 'Superficie total')).toContainText('techo');
    await expect(fila(page, 'Superficie total')).toContainText('huecos');
  });

  test('9 · la cifra con el 10 % de margen que anuncia el JSON-LD existe en pantalla', async ({
    page,
  }) => {
    await abrir(page);
    await sembrarValor(page, '#metrosCuadradosInput', '35');
    await calcular(page);

    // metadata.ts enumera entre las características la «sugerencia de litros a comprar con
    // margen del 10% para repasos»: 5,9 × 1,10 = 6,49 → 6,5 L, y ahora se calcula.
    await expect(panel(page)).toContainText('6,5 L');
    await expect(panel(page)).toContainText('10 % de reserva');
  });

  test('10 · el resultado caduca al cambiar la superficie, y los botones llevan type', async ({
    page,
  }) => {
    await abrir(page);
    await sembrarValor(page, '#metrosCuadradosInput', '45');
    await calcular(page);
    await expect(litros(page)).toContainText('7,5 L');

    // Se corrige la medición a 90 m²: la cifra en pantalla ya no corresponde, y se dice.
    await sembrarValor(page, '#metrosCuadradosInput', '90');
    await expect(panel(page)).toContainText(/recalcul/i);
    await calcular(page);
    await expect(litros(page)).toContainText('15,0 L'); // 90 × 2 / 12
    await expect(panel(page)).not.toContainText(/recalcul/i);

    // CLAUDE.md §5: todo <button> lleva type="button". Los cuatro de la app, también.
    for (const nombre of ['Por m² directos', 'Por habitación', 'Calcular', 'Limpiar']) {
      const boton = page.getByRole('button', { name: nombre });
      expect(await boton.getAttribute('type'), `botón «${nombre}»`).toBe('button');
    }
    // Los dos del selector de modo siguen declarando su estado, que pide la misma regla.
    await expect(page.getByRole('button', { name: 'Por m² directos' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
