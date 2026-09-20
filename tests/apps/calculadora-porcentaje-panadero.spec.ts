import { test, expect, Locator, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * calculadora-porcentaje-panadero — el prefermento como ingrediente compuesto (S0134, 10/09/2026)
 *
 * QUÉ SE ARREGLÓ. El campo de ingrediente es de nombre libre, así que escribir «Masa madre 200»
 * es lo natural. Hasta hoy esos 200 g entraban como un ingrediente plano: ni su harina contaba
 * como harina, ni su agua como agua. La app enseñaba entonces una hidratación FALSA y encima la
 * etiquetaba («hidratación estándar, equilibrada»), que es justo lo que prohíbe la regla de no
 * dar una cifra bajo un aviso. La app hermana /calculadora-masa-madre/ ya explicaba el problema
 * en su bloque educativo y sí lo resolvía; la que lo necesitaba, no.
 *
 * EL CASO, RESUELTO A MANO ANTES DE ABRIR EL NAVEGADOR
 *   Receta: 1000 g harina · 650 g agua · 20 g sal · 3 g levadura · 200 g masa madre al 100 %
 *   La masa madre al 100 % son partes iguales: 200 / (1 + 100/100) = 100 g de harina, y el
 *   resto, 100 g, de agua.
 *     harina total = 1000 + 100 = 1100 g      agua total = 650 + 100 = 750 g
 *     hidratación  = 750 / 1100 = 68,18 %  →  68,2 %   (antes: 650/1000 = 65,0 %)
 *     sal          =  20 / 1100 =  1,818 % →   1,8 %   (antes: 20/1000 = 2,0 %)
 *     harina prefermentada = 100 / 1100 = 9,09 % → 9,1 %
 *     peso de masa = 1000 + 650 + 20 + 3 + 200 = 1873 g  (no cambia: el prefermento pesa igual)
 *   En MODO GRAMOS la balanza no cambia —lo que se teclea es lo que se pesa: 1000 de harina,
 *   650 de agua y los 200 de masa madre enteros—; lo que cambia son los porcentajes, porque el
 *   100 % pasa a ser la harina TOTAL. El descuento de harina y agua se ve en el modo inverso,
 *   donde los porcentajes son los de la fórmula total (cubierto en panaderia-motores.spec.ts).
 *
 *   68,2 % NO cambia de categoría: la escala de la app pone «estándar» en 60-70. La primera
 *   versión de este fichero afirmaba que sí y el test lo tumbó — la desviación cruza la
 *   frontera con más prefermento: 400 g de la misma masa madre dan 70,8 %, ya «alta».
 *
 * La aritmética del motor la cubre tests/panaderia-motores.spec.ts (11 casos). Aquí se
 * comprueba lo que el motor no puede ver: que la vista marque sola el prefermento por su
 * nombre, que enseñe la cifra buena y que la lista de la balanza siga cuadrando.
 */

const RUTA = '/calculadora-porcentaje-panadero/';

/** Rellena la fila n-ésima de la lista de ingredientes (0 = la primera). */
async function escribirIngrediente(page: Page, indice: number, nombre: string, valor: string) {
  const fila = page.getByRole('listitem').nth(indice);
  await fila.getByLabel('Nombre del ingrediente').fill(nombre);
  await fila.getByRole('textbox').nth(1).fill(valor);
}

async function anadirMasaMadre(page: Page, gramos: string) {
  await page.getByRole('button', { name: '+ Añadir ingrediente' }).click();
  await escribirIngrediente(page, 3, 'Masa madre', gramos);
}

const calcular = (page: Page) =>
  page.getByRole('button', { name: 'Calcular porcentajes' }).click();

test.describe('Prefermento: la hidratación que se enseña es la real', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
  });

  test('SIN prefermento nada cambia: 1000 g de harina y 650 de agua siguen siendo el 65,0 %', async ({ page }) => {
    await calcular(page);
    await expect(page.getByText('65,0 %').first()).toBeVisible();
    await expect(page.getByRole('note')).toContainText('hidratación estándar, equilibrada');
    // La segunda tabla es solo para prefermentos: sin ellos no debe aparecer.
    await expect(page.getByRole('region', { name: 'Lo que se pesa en la balanza' })).toHaveCount(0);
  });

  test('«Masa madre» se marca sola como prefermento al escribir el nombre', async ({ page }) => {
    await anadirMasaMadre(page, '200');
    const fila = page.getByRole('listitem').nth(3);
    await expect(
      fila.getByRole('button', { name: /Tratar Masa madre como prefermento/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    // Y aparece su hidratación, al 100 % por defecto y editable.
    await expect(fila.getByLabel(/Hidratación de Masa madre/)).toHaveValue('100');
  });

  test('EL CASO: con la masa madre declarada, la hidratación es 68,2 % y la sal 1,8 %', async ({ page }) => {
    await anadirMasaMadre(page, '200');
    await calcular(page);

    const nota = page.getByRole('note');
    await expect(nota).toContainText('68,2 %');
    // Y dice cuál era la cifra vieja, para que se entienda cuál de las dos creer.
    await expect(nota).toContainText('65,0 %');

    const formulaTotal = page.getByRole('region', { name: 'Tabla de porcentajes del panadero' });
    await expect(formulaTotal.getByRole('row', { name: /Harina \(total\)/ })).toContainText('1100 g');
    await expect(formulaTotal.getByRole('row', { name: /Agua \(total\)/ })).toContainText('750 g');
    await expect(formulaTotal.getByRole('row', { name: /Sal/ })).toContainText('1,8 %');

    // La tarjeta de resumen, no la mención del bloque educativo (que también dice el término).
    const tarjeta = page.getByText('Harina prefermentada', { exact: true }).locator('..');
    await expect(tarjeta).toContainText('9,1 %');
  });

  test('CAMBIO DE CATEGORÍA: con 400 g de masa madre, 65,0 % declarado son 70,8 % reales', async ({ page }) => {
    await anadirMasaMadre(page, '400');
    await calcular(page);

    const nota = page.getByRole('note');
    await expect(nota).toContainText('70,8 %');
    await expect(nota).toContainText('hidratación alta, miga abierta');
    await expect(nota).toContainText('65,0 %');
  });

  test('La balanza cuadra: lo que se pesa es lo que se tecleó, y el prefermento entero', async ({ page }) => {
    await anadirMasaMadre(page, '200');
    await calcular(page);

    const balanza = page.getByRole('region', { name: 'Lo que se pesa en la balanza' });
    await expect(balanza.getByRole('row', { name: /Harina/ })).toContainText('1000 g');
    await expect(balanza.getByRole('row', { name: /Agua/ })).toContainText('650 g');
    // El prefermento va entero, con el desglose de lo que aporta a cada lado.
    const filaPref = balanza.getByRole('row', { name: /Masa madre/ });
    await expect(filaPref).toContainText('200 g');
    await expect(filaPref).toContainText('100 g harina + 100 g agua');

    // El peso total de la masa no cambia por declarar el prefermento.
    await expect(page.getByText('1873 g')).toBeVisible();
  });

  test('Una madre FIRME al 50 % reparte distinto: 300 g son 200 de harina y 100 de agua', async ({ page }) => {
    await anadirMasaMadre(page, '300');
    await page.getByLabel(/Hidratación de Masa madre/).fill('50');
    await calcular(page);

    const filaPref = page
      .getByRole('region', { name: 'Lo que se pesa en la balanza' })
      .getByRole('row', { name: /Masa madre/ });
    await expect(filaPref).toContainText('200 g harina + 100 g agua');
    // harina total 1200, agua total 750 → 62,5 %
    await expect(page.getByRole('note')).toContainText('62,5 %');
  });

  test('Desmarcarlo a mano vuelve a la cuenta plana, y el usuario manda sobre la detección', async ({ page }) => {
    await anadirMasaMadre(page, '200');
    const fila = page.getByRole('listitem').nth(3);
    await fila.getByRole('button', { name: /Tratar Masa madre como prefermento/ }).click();
    await expect(
      fila.getByRole('button', { name: /Tratar Masa madre como prefermento/ }),
    ).toHaveAttribute('aria-pressed', 'false');

    await calcular(page);
    await expect(page.getByRole('note')).toContainText('65,0 %');
    await expect(page.getByRole('region', { name: 'Lo que se pesa en la balanza' })).toHaveCount(0);
  });

  test('DOS AGUAS: las filas de agua se suman, no se coge solo la primera', async ({ page }) => {
    // 1000 g de harina, 400 + 250 de agua → 65,0 %, no 40,0 %.
    await escribirIngrediente(page, 0, 'Agua', '400');
    await page.getByRole('button', { name: '+ Añadir ingrediente' }).click();
    await escribirIngrediente(page, 3, 'Agua tibia', '250');
    await calcular(page);
    await expect(page.getByRole('note')).toContainText('65,0 %');
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector — calculadora-porcentaje-panadero (segmento motor, riesgo 3, 159 usos)
 * Inspección del 20/09/2026 (Opus 5), contra producción y contra el código del repositorio,
 * que el deploy de las 11:25 deja idénticos.
 *
 * QUÉ PROMETE
 *   <h1> «Porcentaje del Panadero» y subtítulo: «cada ingrediente como porcentaje del peso de
 *   la harina». El bloque educativo lo vuelve aritmética comprobable: la harina es SIEMPRE el
 *   100 %, la hidratación es agua/harina, y «la suma de todos los porcentajes supera el 100 %.
 *   Eso es normal y correcto». La metadata añade el modo inverso (peso final de masa → gramos)
 *   y las porciones.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   Motor compartido lib/calculadoras/cocina.ts: calcularBakersPercentage (modo gramos),
 *   calcularBakersPercentageDesdePeso (modo inverso) y calcularDDT. Los tiempos de levado, en
 *   lib/calculadoras/fermentacionTemperatura.ts (ajustarFermentacion). La aritmética pura de
 *   los tres ya la cubre tests/panaderia-motores.spec.ts; lo de aquí es el circuito completo en
 *   navegador, que es donde se ve si la vista publica lo que el motor calcula.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — 1.200 g de harina al 70 % de hidratación, 2 % de sal, 1 % de levadura
 *     agua      = 840 / 1200 = 0,70   → 70,0 %
 *     sal       =  24 / 1200 = 0,02   →  2,0 %
 *     levadura  =  12 / 1200 = 0,01   →  1,0 %
 *     hidratación = 70,0 %  ·  suma de % = 100 + 70 + 2 + 1 = 173 % (NO 100: es la promesa)
 *     peso de masa = 1200 + 840 + 24 + 12 = 2.076 g, y las cuatro filas mostradas suman eso.
 *
 *   CASO 2 (límite) — el camino inverso, con hidratación extrema y porciones que no dividen
 *     Peso final 1.200 g · agua 100 % · sal 2,2 % · levadura 1 % · porción 300 g
 *     Σ % = 103,2  →  harina = 1200 / (1 + 1,032) = 1200 / 2,032 = 590,551… → 591 g
 *     agua     = 591 × 1,000 = 591,0   → 591 g
 *     sal      = 591 × 0,022 =  13,002 →  13 g
 *     levadura = 591 × 0,010 =   5,91  →   6 g
 *     peso real = 591 + 591 + 13 + 6 = 1.201 g, UN gramo por encima del objetivo por redondear
 *       cada fila a gramos enteros: la app tiene que DECIRLO, no callarlo.
 *     porciones = ⌊1201 / 300⌋ = 4 (sobran 101 g)
 *
 *   CASO 3 (debe rechazarse) — harina 0, negativa o texto
 *     Sin harina no hay sistema del panadero: el 100 % no existe y todo porcentaje sería una
 *     división entre cero. Esperado: mensaje de error y NINGUNA tabla publicada.
 *
 * RESULTADO: los tres salieron exactos, cifra a cifra, y también el prefermento (1.200 + 780 +
 * 24 + 6 + 240 g de masa madre al 100 % → 68,2 % de hidratación real frente al 65,0 % que sale
 * sin descomponerla, 9,1 % de harina prefermentada y balanza cuadrada en 2.250 g). La
 * aritmética del porcentaje del panadero está BIEN en los dos sentidos. Los hallazgos abiertos
 * son de la VISTA y de lo que la vista deja pasar; van abajo como testigos.
 * ══════════════════════════════════════════════════════════════════════════════════════════ */

/** «2.076» / «1.201» / «13 g» → número. El formato es español: el punto es millar. */
function aNumero(texto: string): number {
  const limpio = texto.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.');
  return Number(limpio);
}

/** Suma la columna «Gramos» de la tabla de la fórmula, tal como se muestra en pantalla. */
async function sumarGramosMostrados(page: Page): Promise<number> {
  const celdas = page
    .getByRole('region', { name: 'Tabla de porcentajes del panadero' })
    .locator('tbody tr td:nth-child(2)');
  const textos = await celdas.allInnerTexts();
  return textos.reduce((suma, t) => suma + aNumero(t), 0);
}

/** El campo de gramos (o de porcentaje) de la fila n-ésima de la lista de ingredientes. */
const valorDeFila = (page: Page, indice: number): Locator =>
  page.getByRole('listitem').nth(indice).getByRole('textbox').nth(1);

/** El campo de nombre de la fila n-ésima. */
const nombreDeFila = (page: Page, indice: number): Locator =>
  page.getByRole('listitem').nth(indice).getByLabel('Nombre del ingrediente');

const pesoTotalAnunciado = (page: Page): Locator =>
  page.getByText('Peso total de la masa', { exact: true }).locator('..');

/**
 * El aviso de la PROPIA app. Next monta siempre su anunciador de rutas
 * (`#__next-route-announcer__`), que también declara role="alert", así que un
 * `getByRole('alert')` a secas resuelve a dos elementos y rompe el modo estricto.
 */
const avisoDeLaApp = (page: Page): Locator =>
  page.locator('[role="alert"]:not(#__next-route-announcer__)');

test.describe('Inspector 20/09/2026 — la aritmética del porcentaje del panadero', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#harina']);
  });

  test('CASO 1 — 1.200 g de harina al 70/2/1 %: los porcentajes son sobre la HARINA, no sobre el total', async ({
    page,
  }) => {
    await sembrarValor(page, '#harina', '1200');
    await sembrarValor(page, valorDeFila(page, 0), '840'); // Agua
    await sembrarValor(page, valorDeFila(page, 1), '24'); // Sal
    await sembrarValor(page, valorDeFila(page, 2), '12'); // Levadura
    await calcular(page);

    const formula = page.getByRole('region', { name: 'Tabla de porcentajes del panadero' });
    // La harina es siempre el 100 %: es la definición del sistema, no un resultado.
    await expect(formula.getByRole('row', { name: /Harina/ })).toContainText('100,0 %');
    await expect(formula.getByRole('row', { name: /Agua/ })).toContainText('70,0 %'); // 840/1200
    await expect(formula.getByRole('row', { name: /Sal/ })).toContainText('2,0 %'); //  24/1200
    await expect(formula.getByRole('row', { name: /Levadura/ })).toContainText('1,0 %'); //  12/1200
    await expect(page.getByRole('note')).toContainText('70,0 %');

    // 1200 + 840 + 24 + 12 = 2.076 g, y las filas de la tabla suman EXACTAMENTE ese total:
    // con gramos enteros no se pierde ni se gana masa por el camino.
    await expect(pesoTotalAnunciado(page)).toContainText('2076 g');
    expect(await sumarGramosMostrados(page)).toBe(2076);
  });

  test('CASO 2 (límite) — desde 1.200 g de masa al 100 % de hidratación: 591 g de harina y 4 porciones', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Por peso final de masa' }).click();
    await sembrarValor(page, '#harina', '1200'); // aquí el campo es el PESO FINAL de masa
    await sembrarValor(page, valorDeFila(page, 0), '100'); // Agua — hidratación extrema
    await sembrarValor(page, valorDeFila(page, 1), '2,2'); // Sal
    await sembrarValor(page, valorDeFila(page, 2), '1'); // Levadura
    await sembrarValor(page, '#porcion', '300');
    await calcular(page);

    // harina = 1200 / (1 + 103,2/100) = 590,551… → 591 g, y de ahí el resto:
    const formula = page.getByRole('region', { name: 'Tabla de porcentajes del panadero' });
    await expect(formula.getByRole('row', { name: /Harina/ })).toContainText('591 g');
    await expect(formula.getByRole('row', { name: /Agua/ })).toContainText('591 g'); // 591 × 1,000
    await expect(formula.getByRole('row', { name: /Sal/ })).toContainText('13 g'); // 591 × 0,022 = 13,002
    await expect(formula.getByRole('row', { name: /Levadura/ })).toContainText('6 g'); // 591 × 0,010 = 5,91

    // 591 + 591 + 13 + 6 = 1.201 g: un gramo por encima del objetivo, y la app lo DECLARA
    // en vez de dejar creer que la masa pesará justo lo que se pidió.
    await expect(pesoTotalAnunciado(page)).toContainText('1201 g');
    await expect(pesoTotalAnunciado(page)).toContainText('objetivo: 1200 g');
    expect(await sumarGramosMostrados(page)).toBe(1201);

    // ⌊1201 / 300⌋ = 4 piezas, y sobran 101 g: la división no es exacta y se trunca.
    await expect(page.getByText('Porciones', { exact: true }).locator('..')).toContainText('4');
  });

  test('CASO 3 — sin harina no hay 100 %: 0, negativo y texto se rechazan sin publicar tabla', async ({
    page,
  }) => {
    for (const entrada of ['0', '-500', 'abc']) {
      await sembrarValor(page, '#harina', entrada);
      await calcular(page);
      await expect(avisoDeLaApp(page)).toContainText(
        'Introduce un peso de harina válido (mayor que 0).',
      );
      // Y no se publica NINGÚN porcentaje: la tabla entera desaparece.
      await expect(
        page.getByRole('region', { name: 'Tabla de porcentajes del panadero' }),
      ).toHaveCount(0);
    }
  });
});

/* ── HALLAZGOS ABIERTOS, escritos como TESTIGO ─────────────────────────────────────────────
 * Documentan lo que la app hace HOY. Cuando se reparen, estos bloques fallarán y habrá que
 * invertirlos. NO se corrigen desde el test: el Inspector no repara.
 * ─────────────────────────────────────────────────────────────────────────────────────────*/
test.describe('TESTIGOS de los hallazgos del 20/09/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#harina']);
  });

  test('TESTIGO · el resultado se queda obsoleto sin decirlo al cambiar un ingrediente', async ({
    page,
  }) => {
    await sembrarValor(page, '#harina', '1200');
    await sembrarValor(page, valorDeFila(page, 0), '840');
    await calcular(page);
    await expect(page.getByRole('note')).toContainText('70,0 %'); // 840/1200

    // Ahora el panadero sube el agua a 1.080 g: la hidratación real pasa a 90,0 % y la masa
    // a 2.316 g. Sin volver a pulsar «Calcular», la pantalla sigue publicando lo anterior.
    await sembrarValor(page, valorDeFila(page, 0), '1080');
    await expect(page.getByRole('note')).toContainText('70,0 %'); // ← debería avisar de que ya no vale
    // 2.063 g = 1.200 harina + 840 agua + 20 sal + 3 levadura: aquí NO se siembran sal ni
    // levadura, que se quedan en los valores por defecto del formulario.
    await expect(pesoTotalAnunciado(page)).toContainText('2063 g'); // ← lo correcto sería 2.303 g
    // Y no hay ninguna marca de resultado caducado en toda la página.
    await expect(page.getByText(/recalcul|obsolet|desactualiz/i)).toHaveCount(0);
  });

  test('TESTIGO · cambiar de modo borra la receta tecleada, sin confirmación', async ({ page }) => {
    await sembrarValor(page, '#harina', '1200');
    await sembrarValor(page, valorDeFila(page, 0), '840');
    await page.getByRole('button', { name: '+ Añadir ingrediente' }).click();
    await sembrarValor(page, nombreDeFila(page, 3), 'Aceite de oliva');
    await sembrarValor(page, valorDeFila(page, 3), '50');
    await expect(page.getByRole('listitem')).toHaveCount(4);

    await page.getByRole('button', { name: 'Por peso final de masa' }).click();

    // La fila añadida desaparece y las tres que quedan vuelven a los valores de ejemplo,
    // aunque la app acababa de calcular los porcentajes con los que podría haberlas rellenado.
    await expect(page.getByRole('listitem')).toHaveCount(3);
    await expect(page.locator('#harina')).toHaveValue('1000');
    await expect(valorDeFila(page, 0)).toHaveValue('65');
  });

  test('TESTIGO · con la fórmula imposible sigue publicando agua NEGATIVA en la balanza', async ({
    page,
  }) => {
    // Modo inverso: se declara un 20 % de agua total, pero un 60 % de masa madre al 100 %
    // aporta ella sola un 30 % de agua. Sobra agua: no queda nada que pesar aparte.
    // A mano: harina 1000/1,22 = 820 g · agua 164 g · masa madre 492 g = 246 harina + 246 agua
    //         → agua a pesar = 164 − 246 = −82 g   ·   −82 / (820 − 246) = −14,3 %
    await page.getByRole('button', { name: 'Por peso final de masa' }).click();
    await sembrarValor(page, valorDeFila(page, 0), '20'); // Agua, en %
    await sembrarValor(page, nombreDeFila(page, 2), 'Masa madre'); // se marca sola como prefermento
    await sembrarValor(page, valorDeFila(page, 2), '60');
    await calcular(page);

    // El aviso está, y es correcto...
    await expect(avisoDeLaApp(page)).toContainText('no queda nada que pesar aparte');
    // ...pero debajo la lista de la balanza sigue mandando pesar −82 g de agua, y la nota
    // remata con una hidratación negativa. Lo correcto sería suprimir esas dos cifras.
    const balanza = page.getByRole('region', { name: 'Lo que se pesa en la balanza' });
    await expect(balanza.getByRole('row', { name: /Agua/ })).toContainText('-82 g');
    await expect(page.getByRole('note')).toContainText('-14,3 %');
  });

  test('TESTIGO · el levado se extrapola fuera del rango en el que el propio motor dice que vale', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Cuánto va a tardar en fermentar/ }).click();
    // 2 h pensadas para 24 °C, levando a 45 °C: factor 2^((24−45)/10) = 0,23 → 28 min.
    // La cuenta es la del Q10, pero a 45 °C la levadura no fermenta más rápido: se muere.
    // ajustarRangoFermentacion, en el MISMO fichero del motor, se niega a extrapolar fuera de
    // TEMP_MODELO_MIN = 4 y TEMP_MODELO_MAX = 32 por esta razón exacta; esta vista no lo usa.
    await sembrarValor(page, '#ferm-temp-real', '45');
    await expect(page.locator('#paso-fermentacion')).toContainText('28 min');
    await expect(page.locator('#paso-fermentacion')).toContainText('0,23');

    // Y por el otro extremo: a −18 °C la masa está congelada, no levando en 36 h 46 min.
    await sembrarValor(page, '#ferm-temp-real', '-18');
    await expect(page.locator('#paso-fermentacion')).toContainText('36 h 46 min');
  });

  test('TESTIGO · un ingrediente con peso pero sin nombre se descuenta en silencio', async ({
    page,
  }) => {
    await sembrarValor(page, '#harina', '1200');
    await sembrarValor(page, valorDeFila(page, 0), '840');
    await page.getByRole('button', { name: '+ Añadir ingrediente' }).click();
    await sembrarValor(page, valorDeFila(page, 3), '100'); // 100 g de algo, sin nombre
    await calcular(page);

    // Los 100 g no entran en el peso de la masa (2.063 en vez de 2.163) y no se avisa de que
    // se han descartado, mientras que el mismo hueco en el campo de harina SÍ se rechaza.
    // 2.063 g = 1.200 harina + 840 agua + 20 sal + 3 levadura (los dos últimos, por defecto).
    await expect(pesoTotalAnunciado(page)).toContainText('2063 g');
    await expect(avisoDeLaApp(page)).toHaveCount(0);
  });
});
