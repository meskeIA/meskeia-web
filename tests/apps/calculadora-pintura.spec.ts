import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector — calculadora-pintura (segmento interactiva, riesgo 2, 47 usos, 43 s de estancia)
 * Inspección del 20/09/2026 (Opus 5), contra producción y contra el código del repositorio,
 * que el deploy de las 11:25 deja idénticos.
 *
 * QUÉ PROMETE
 *   <h1> «Calculadora de Pintura» y subtítulo: «Calcula cuántos litros necesitas según
 *   superficie, capas y tipo de pared». La metadata añade el coste total. El bloque educativo
 *   publica una tabla de rendimientos por tipo de pintura (6 a 16 m²/L), una FAQ que cuantifica
 *   el gotelé y un recuadro de «errores frecuentes» que empieza por «no restar puertas y
 *   ventanas: pueden representar el 10–15 % de la superficie total de la pared».
 *
 * DÓNDE VIVE EL CÁLCULO
 *   Todo en la propia vista, `calcular()` de app/calculadora-pintura/page.tsx. No hay motor
 *   aparte ni módulo de datos: los cuatro rendimientos son un objeto literal del fichero.
 *     m² (modo habitación) = 2 × (largo + ancho) × alto          ← perímetro × altura
 *     m² (modo directo)    = parseFloat(x.replace(',', '.')) || 0
 *     si m² ≤ 0 → return, sin tocar nada y sin decir nada
 *     litros = m² × capas / rendimiento     lisa 12 · gotelé 8 · rugosa 7 · porosa 6 (m²/L)
 *     litros mostrados = ceil(litros × 10) / 10        ← redondeo AL ALZA a la décima
 *     botes de 4 L = ceil(litros/4)   ·   botes de 15 L = ceil(litros/15)   ← también al alza
 *     coste = litros × precio por litro
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal, en MÓVIL) — dormitorio de 4 × 3 m con 2,5 m de altura, 2 manos, pared lisa
 *     perímetro   = 2 × (4 + 3) = 14 m
 *     superficie  = 14 × 2,5 = 35,0 m²
 *     litros      = 35 × 2 / 12 = 5,8333… → al alza a la décima → 5,9 L
 *     botes 4 L   = ⌈5,9 / 4⌉ = ⌈1,475⌉ = 2 botes  (8 L: cubre los 5,9 con margen)
 *     botes 15 L  = ⌈5,9 / 15⌉ = 1 bote
 *     coste       = 5,9 × 8 €/L = 47,20 €
 *
 *   CASO 2 (límite) — la fachada de 1.500 m² a UNA sola mano, y el extremo contrario
 *     litros     = 1500 × 1 / 12 = 125,0 L exactos
 *     botes 4 L  = ⌈125 / 4⌉ = ⌈31,25⌉ = 32 botes   ·   botes 15 L = ⌈8,333⌉ = 9 botes
 *     coste      = 125 × 8 = 1.000,00 €
 *     Por abajo: 0,5 m² × 1 / 12 = 0,0417 L → 0,1 L y 1 bote. Lo que importa aquí es que
 *     NINGUNO de los tres redondeos vaya a la baja: quedarse corto a mitad de pared es el
 *     defecto con consecuencia real de esta app, y no lo tiene.
 *
 *   CASO 3 (debe rechazarse) — medida negativa, texto y campo vacío
 *     Una pared no mide −5 m² ni «abc» m². Esperado: mensaje de error y NINGUNA cifra
 *     publicada. Obtenido: silencio absoluto y el resultado ANTERIOR intacto en pantalla
 *     (ver los testigos). Y en modo habitación un largo negativo ni siquiera llega a esa
 *     puerta: 2 × (−1 + 5) × 2,5 = 20 m² positivos, que la app calcula tan ricamente.
 *
 * RESULTADO. La aritmética prometida —perímetro × altura, × manos, ÷ rendimiento— sale
 * EXACTA en los tres casos, y los tres redondeos van al alza, que es lo que debe ocurrir en
 * una calculadora de obra. Lo que falla está alrededor de la cuenta: cómo se leen los números
 * que entran, qué se hace con los imposibles, de dónde salen los rendimientos y qué se valora
 * en el coste. Va todo abajo, como testigos.
 *
 * HALLAZGOS (20/09/2026) — el detalle, en cada testigo
 *   1. ALTO   · «1.500» m² se lee como 1,5 m²: parseFloat(x.replace(',', '.')) no entiende el
 *               separador de millar español que el propio proyecto exige (CLAUDE.md §2).
 *   2. MEDIO  · texto, vacío, negativo y cero no se rechazan: Calcular no hace NADA y deja en
 *               pantalla la cifra anterior, que ya no corresponde a lo que se ve en el campo.
 *   3. MEDIO  · «12abc» entra como 12 m² sin avisar (parseFloat se queda con el prefijo).
 *   4. MEDIO  · largo negativo aceptado en modo habitación: −1 y 5 dan 20 m² «válidos».
 *   5. MEDIO  · la FAQ promete «+20 % a 40 %» para el gotelé y el paso 2 «hasta el doble»; el
 *               motor aplica exactamente +50 % (12 → 8 m²/L). Tres cifras, ninguna coincide.
 *   6. MEDIO  · los cuatro rendimientos están escritos a mano sin fuente ni fecha, y «lisa 12»
 *               es el extremo OPTIMISTA de la propia tabla de la app (plástica mate 10–12).
 *   7. MEDIO  · el «Coste estimado» valora litros sueltos, no los botes que la app manda
 *               comprar en la línea de encima.
 *   8. MEDIO  · modo habitación sin campo de huecos ni de techo, y la cifra se rotula
 *               «Superficie total» — el mismo error que el recuadro de la app llama frecuente.
 *   9. BAJO   · el JSON-LD anuncia una «sugerencia de litros con margen del 10 %» que la app
 *               no calcula: solo hay un consejo de texto.
 *  10. BAJO   · los cuatro botones de la app sin type="button" (CLAUDE.md §5).
 * ══════════════════════════════════════════════════════════════════════════════════════════ */

const RUTA = '/calculadora-pintura/';

/** El panel de resultados, que es el único role="status" de la página. */
const panel = (page: Page) => page.locator('[role="status"]');

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
    // Las 2 manos y los 8 €/L son los valores por defecto: sembrarlos no probaría nada.
    await expect(page.locator('#numCapasSelect')).toHaveValue('2');
    await expect(page.locator('#precioLitroInput')).toHaveValue('8');
    await calcular(page);

    // 2 × (4 + 3) × 2,5 = 35 m²: perímetro por altura, las cuatro paredes.
    await expect(fila(page, 'Superficie total')).toContainText('35,0 m²');
    // 35 × 2 manos / 12 m²/L = 5,8333… → al alza a la décima → 5,9 L
    await expect(litros(page)).toContainText('5,9 L');
    // ⌈5,9/4⌉ = 2 botes (8 L) y ⌈5,9/15⌉ = 1 bote: el envase INMEDIATAMENTE SUPERIOR en ambos.
    await expect(fila(page, 'Botes de 4L')).toContainText('2 botes');
    await expect(fila(page, 'Botes de 15L')).toContainText('1 bote');
    // 5,9 L × 8 €/L = 47,20 €
    await expect(fila(page, 'Coste estimado')).toContainText('47,20 €');
  });

  test('CASO 1 · en 412 px la página no desborda a lo ancho', async ({ page }) => {
    await sembrarValor(page, '#largoInput', '4');
    await sembrarValor(page, '#anchoInput', '3');
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
    await expect(fila(page, 'Coste estimado')).toContainText('1000,00 €');
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

/* ── HALLAZGOS ABIERTOS, escritos como TESTIGO ─────────────────────────────────────────────
 * Documentan lo que la app hace HOY. Cuando se reparen, estos bloques fallarán y habrá que
 * invertirlos. NO se corrigen desde el test: el Inspector no repara.
 * ─────────────────────────────────────────────────────────────────────────────────────────*/
test.describe('TESTIGOS de los hallazgos del 20/09/2026', () => {
  test('TESTIGO 1 · «1.500» m² se calculan como 1,5 m²: el millar español se pierde', async ({
    page,
  }) => {
    await abrir(page);
    // Es la escritura que el propio CLAUDE.md §2 declara obligatoria para las cifras, y la que
    // sale sola al teclear una fachada. parseFloat('1.500') = 1,5 y nadie lo dice.
    await sembrarValor(page, '#metrosCuadradosInput', '1.500');
    await calcular(page);

    // Esperado: 1500 × 2 / 12 = 250,0 L y 63 botes de 4 L. Obtenido, mil veces menos:
    await expect(fila(page, 'Superficie total')).toContainText('1,5 m²');
    await expect(litros(page)).toContainText('0,3 L'); // 1,5 × 2 / 12 = 0,25 → 0,3
    await expect(fila(page, 'Botes de 4L')).toContainText('1 bote');

    // Y con el decimal español detrás, lo mismo: '1.234,56' → parseFloat('1.234.56') = 1,234.
    await sembrarValor(page, '#metrosCuadradosInput', '1.234,56');
    await calcular(page);
    await expect(fila(page, 'Superficie total')).toContainText('1,2 m²');

    // Lo que SÍ funciona, y por eso el defecto pasa desapercibido: sin separador de millar
    // la cifra entra bien, con punto o con coma decimal.
    for (const escritura of ['1500', '2.5', '2,5']) {
      await sembrarValor(page, '#metrosCuadradosInput', escritura);
      await calcular(page);
      await expect(fila(page, 'Superficie total')).toContainText(
        escritura === '1500' ? '1500,0 m²' : '2,5 m²',
      );
    }
  });

  test('TESTIGO 2 · texto, vacío, negativo y cero no se rechazan: sigue en pantalla la cifra anterior', async ({
    page,
  }) => {
    await abrir(page);
    await sembrarValor(page, '#metrosCuadradosInput', '45');
    await calcular(page);
    await expect(litros(page)).toContainText('7,5 L'); // 45 × 2 / 12

    // `if (m2Total <= 0) return;` — sin estado de error, sin mensaje y sin borrar lo anterior.
    // El usuario ve «abc» en el campo y «7,5 L» de respuesta, que son de otra pared.
    for (const entrada of ['abc', '-5', '0', '']) {
      await sembrarValor(page, '#metrosCuadradosInput', entrada);
      await calcular(page);
      await expect(litros(page)).toContainText('7,5 L');
      await expect(fila(page, 'Superficie total')).toContainText('45,0 m²');
      // Y en todo el panel no hay una palabra sobre que la entrada no valga.
      await expect(panel(page)).not.toContainText(/no vál|inválid|revisa|corrige/i);
    }
  });

  test('TESTIGO 3 · «12abc» entra como 12 m²: parseFloat se queda con el prefijo', async ({
    page,
  }) => {
    await abrir(page);
    await sembrarValor(page, '#metrosCuadradosInput', '12abc');
    await calcular(page);
    // Esperado: rechazo. Obtenido: 12 m² y una cifra de compra con toda naturalidad.
    await expect(fila(page, 'Superficie total')).toContainText('12,0 m²');
    await expect(litros(page)).toContainText('2,0 L'); // 12 × 2 / 12
  });

  test('TESTIGO 4 · un largo NEGATIVO da una superficie positiva y se calcula', async ({
    page,
  }) => {
    await abrirModoHabitacion(page);
    // 2 × (−1 + 5) × 2,5 = 20 m². La suma del perímetro tapa el signo: la guarda `m² ≤ 0` no
    // llega a enterarse, así que una medida imposible se convierte en un supuesto válido.
    await sembrarValor(page, '#largoInput', '-1');
    await sembrarValor(page, '#anchoInput', '5');
    await sembrarValor(page, '#altoInput', '2,5');
    await calcular(page);

    await expect(fila(page, 'Superficie total')).toContainText('20,0 m²');
    await expect(litros(page)).toContainText('3,4 L'); // 20 × 2 / 12 = 3,333… → 3,4
    await expect(fila(page, 'Coste estimado')).toContainText('27,20 €');
  });

  test('TESTIGO 5 · el gotelé cuesta +50 %, no el «20 % a 40 %» que promete la FAQ', async ({
    page,
  }) => {
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

    // El motor aplica 12/8 = 1,5 exacto. La FAQ dice «entre un 20% y 40%» y el paso 2 de la
    // guía dice «hasta el doble». Una décima de tolerancia basta y sobra para discriminar
    // entre 1,4 (el techo prometido), 1,5 (lo que hace) y 2,0 (lo que anuncia el paso 2).
    expect(conGotele / conLisa).toBeCloseTo(1.5, 1);
    expect(conGotele / conLisa).toBeGreaterThan(1.4);

    // Y «hasta el doble» es en realidad lo que hace la superficie POROSA: 12 → 6.
    await page.locator('#tipoSuperficieSelect').selectOption('porosa');
    await calcular(page);
    await expect(litros(page)).toContainText('15,0 L'); // 45 × 2 / 6 = exactamente el doble
  });

  test('TESTIGO 6 · los rendimientos son cuatro números sin fuente, y el de la pared lisa es el extremo optimista', async ({
    page,
  }) => {
    await abrir(page);
    // Los cuatro valores se publican en el propio selector, que es lo bueno que tiene...
    const opciones = await page.locator('#tipoSuperficieSelect option').allInnerTexts();
    expect(opciones).toEqual([
      'Pared lisa, yeso o pladur (~12 m²/L)',
      'Gotelé o textura media (~8 m²/L)',
      'Ladrillo visto o estuco (~7 m²/L)',
      'Hormigón o superficie muy absorbente (~6 m²/L)',
    ]);
    // ...pero en ninguna parte de la página se dice de DÓNDE salen ni a qué fecha responden.
    await expect(page.locator('body')).not.toContainText(/Fuente:|según la norma|ficha técnica/i);

    // Y 12 m²/L es el techo de la propia tabla de la app para una plástica mate (10–12 m²/L).
    // Con el suelo de esa misma tabla, los 35 m² a dos manos serían 35×2/10 = 7,0 L en vez de
    // 5,9 L: más de un cuarto de bote de diferencia, y no hay forma de introducirlo porque el
    // tipo de PINTURA no es un campo de la calculadora.
    await sembrarValor(page, '#metrosCuadradosInput', '35');
    await calcular(page);
    await expect(litros(page)).toContainText('5,9 L');
    const etiquetas = await page.locator('label').allInnerTexts();
    expect(etiquetas.join(' | ')).not.toMatch(/tipo de pintura|acabado|mate|satinad/i);
  });

  test('TESTIGO 7 · el «Coste estimado» valora litros sueltos, no los botes que manda comprar', async ({
    page,
  }) => {
    await abrir(page);
    await sembrarValor(page, '#metrosCuadradosInput', '35');
    await calcular(page);

    // La app dice, en el mismo panel y a dos líneas de distancia: «2 botes de 4L» y «47,20 €».
    // Los 2 botes son 8 L, que a 8 €/L son 64,00 €: el presupuesto se queda un 26 % corto,
    // porque la pintura no se vende por litros sueltos. Y eso antes del 10 % extra que la
    // propia app aconseja comprar justo debajo.
    await expect(fila(page, 'Botes de 4L')).toContainText('2 botes');
    await expect(fila(page, 'Coste estimado')).toContainText('47,20 €'); // 5,9 × 8
    await expect(fila(page, 'Coste estimado')).not.toContainText('64,00 €');
  });

  test('TESTIGO 8 · en modo habitación no hay huecos ni techo, y la cifra se llama «Superficie total»', async ({
    page,
  }) => {
    await abrirModoHabitacion(page);
    // Los campos son exactamente seis, y ninguno pregunta por una puerta, una ventana ni el techo.
    const etiquetas = await page.locator('label').allInnerTexts();
    expect(etiquetas).toEqual([
      'Largo (m)',
      'Ancho (m)',
      'Alto (m)',
      'Número de capas',
      'Tipo de superficie',
      'Precio por litro (opcional)',
    ]);

    await sembrarValor(page, '#largoInput', '4');
    await sembrarValor(page, '#anchoInput', '3');
    await calcular(page);
    // 35,0 m² son solo las cuatro paredes: el techo (4 × 3 = 12 m²) no está, y con una puerta
    // de 1,8 m² y una ventana de 1,5 —las medidas que da la propia FAQ de la app— la pared
    // real serían 31,7 m² y 5,3 L, no 5,9. El rótulo, aun así, dice «Superficie total».
    await expect(fila(page, 'Superficie total')).toContainText('35,0 m²');
    // El consejo que sí aparece manda hacer a mano lo que la herramienta no ofrece.
    await expect(panel(page)).toContainText('Resta puertas y ventanas si no las vas a pintar');
  });

  test('TESTIGO 9 · no hay ninguna cifra con el 10 % de margen que anuncia el JSON-LD', async ({
    page,
  }) => {
    await abrir(page);
    await sembrarValor(page, '#metrosCuadradosInput', '35');
    await calcular(page);

    // metadata.ts enumera entre las características «Sugerencia de litros a comprar con margen
    // del 10% para repasos». En pantalla solo hay un consejo de texto: el 10 % de 5,9 L serían
    // 6,5 L, y esa cifra no se calcula en ninguna parte.
    await expect(panel(page)).toContainText('Compra un 10% extra para retoques y reserva');
    await expect(panel(page)).not.toContainText('6,5 L');
  });

  test('TESTIGO 10 · el resultado no caduca al cambiar la superficie, y los botones no llevan type', async ({
    page,
  }) => {
    await abrir(page);
    await sembrarValor(page, '#metrosCuadradosInput', '45');
    await calcular(page);
    await expect(litros(page)).toContainText('7,5 L');

    // Se corrige la medición a 90 m²: la respuesta correcta pasa a 15,0 L y la pantalla sigue
    // publicando 7,5 L sin ninguna marca de que ya no vale.
    await sembrarValor(page, '#metrosCuadradosInput', '90');
    await expect(litros(page)).toContainText('7,5 L');
    await expect(fila(page, 'Superficie total')).toContainText('45,0 m²');
    await expect(page.locator('body')).not.toContainText(/recalcul|obsolet|desactualiz/i);

    // CLAUDE.md §5: todo <button> lleva type="button". Los cuatro de la app, no.
    for (const nombre of ['Por m² directos', 'Por habitación', 'Calcular', 'Limpiar']) {
      const boton = page.getByRole('button', { name: nombre });
      expect(await boton.getAttribute('type'), `botón «${nombre}»`).toBeNull();
    }
    // Los dos del selector de modo sí declaran su estado, que es lo que pide la misma regla.
    await expect(page.getByRole('button', { name: 'Por m² directos' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
