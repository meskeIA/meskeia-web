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
    // El cambio de modo convierte la receta que hubiera (desde el 20/09/2026 ya no la borra),
    // así que el peso final llega en 1.673 g; aquí se fija el del caso.
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

/* ── LOS NUEVE HALLAZGOS, YA REPARADOS (20/09/2026) ────────────────────────────────────────
 * Estos bloques nacieron como TESTIGOS: documentaban lo que la app hacía mal y por eso
 * afirmaban lo contrario de lo que se lee ahora. Al repararse, cada uno se ha invertido para
 * exigir el comportamiento bueno, con el caso y la cuenta a mano intactos — que es lo que
 * convierte un testigo en una prueba de regresión.
 * ─────────────────────────────────────────────────────────────────────────────────────────*/
test.describe('Reparación del 20/09/2026 — la vista ya no publica lo que no puede sostener', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#harina']);
  });

  test('El resultado SIGUE al formulario: subir el agua recalcula sin volver a pulsar', async ({
    page,
  }) => {
    await sembrarValor(page, '#harina', '1200');
    await sembrarValor(page, valorDeFila(page, 0), '840');
    await calcular(page);
    await expect(page.getByRole('note')).toContainText('70,0 %'); // 840/1200
    // 2.063 g = 1.200 harina + 840 agua + 20 sal + 3 levadura (los dos últimos, por defecto).
    await expect(pesoTotalAnunciado(page)).toContainText('2063 g');

    // El panadero sube el agua a 1.080 g. SIN volver a pulsar «Calcular», la pantalla pasa a
    // 1080/1200 = 90,0 % y a 1.200 + 1.080 + 20 + 3 = 2.303 g: nunca hay una cifra vieja con
    // aspecto de fresca, que era el fallo que más tiempo costaba (790 s de estancia media).
    await sembrarValor(page, valorDeFila(page, 0), '1080');
    await expect(page.getByRole('note')).toContainText('90,0 %');
    await expect(pesoTotalAnunciado(page)).toContainText('2303 g');

    // Y cuando lo escrito NO se puede calcular, el resultado que queda en pantalla se marca
    // como lo que es —el de los valores anteriores— en vez de seguir callado.
    await sembrarValor(page, '#harina', '0');
    await expect(
      page.locator('[role="status"]').filter({ hasText: /desactualizado/i }),
    ).toHaveCount(1);
    await expect(avisoDeLaApp(page)).toContainText('Introduce un peso de harina válido');
  });

  test('Cambiar de modo CONVIERTE la receta, y la vuelta devuelve los mismos gramos', async ({
    page,
  }) => {
    await sembrarValor(page, '#harina', '1200');
    await sembrarValor(page, valorDeFila(page, 0), '840');
    await page.getByRole('button', { name: '+ Añadir ingrediente' }).click();
    await sembrarValor(page, nombreDeFila(page, 3), 'Aceite de oliva');
    await sembrarValor(page, valorDeFila(page, 3), '50');
    await expect(page.getByRole('listitem')).toHaveCount(4);

    await page.getByRole('button', { name: 'Por peso final de masa' }).click();

    // No se pierde ninguna fila, y los gramos pasan a porcentajes sobre la harina:
    //   masa = 1.200 + 840 + 20 + 3 + 50 = 2.113 g
    //   agua 840/1200 = 70 %  ·  sal 20/1200 = 1,67 %  ·  levadura 3/1200 = 0,25 %
    //   aceite 50/1200 = 4,17 %
    await expect(page.getByRole('listitem')).toHaveCount(4);
    await expect(page.locator('#harina')).toHaveValue('2113');
    await expect(valorDeFila(page, 0)).toHaveValue('70');
    await expect(valorDeFila(page, 1)).toHaveValue('1,67');
    await expect(valorDeFila(page, 2)).toHaveValue('0,25');
    await expect(valorDeFila(page, 3)).toHaveValue('4,17');
    await expect(nombreDeFila(page, 3)).toHaveValue('Aceite de oliva');
    await expect(
      page.locator('[role="status"]').filter({ hasText: /convertida/i }),
    ).toHaveCount(1);

    // Y a la vuelta se recupera la receta de partida, gramo a gramo: Σ % = 76,09 →
    // harina = 2113 / 1,7609 = 1.199,95 → 1.200 g, y de ahí 840 / 20 / 3 / 50.
    await page.getByRole('button', { name: 'Por gramos' }).click();
    await expect(page.locator('#harina')).toHaveValue('1200');
    await expect(valorDeFila(page, 0)).toHaveValue('840');
    await expect(valorDeFila(page, 1)).toHaveValue('20');
    await expect(valorDeFila(page, 2)).toHaveValue('3');
    await expect(valorDeFila(page, 3)).toHaveValue('50');
  });

  test('Con la fórmula imposible NO se publica agua negativa: se suprime la fila', async ({
    page,
  }) => {
    // Modo inverso: se declara un 20 % de agua total, pero un 60 % de masa madre al 100 %
    // aporta ella sola un 30 % de agua. Sobra agua: no queda nada que pesar aparte.
    // A mano: harina 1000/1,22 = 820 g · agua 164 g · masa madre 492 g = 246 harina + 246 agua
    //         → agua a pesar = 164 − 246 = −82 g   ·   −82 / (820 − 246) = −14,3 %
    await page.getByRole('button', { name: 'Por peso final de masa' }).click();
    // Cambiar de modo ya no borra: convierte la receta por defecto (1.000 + 650 + 20 + 3 g),
    // así que el peso final llega convertido en 1.673 g y aquí se fija el del caso.
    await sembrarValor(page, '#harina', '1000');
    await sembrarValor(page, valorDeFila(page, 0), '20'); // Agua, en %
    await sembrarValor(page, nombreDeFila(page, 2), 'Masa madre'); // se marca sola como prefermento
    await sembrarValor(page, valorDeFila(page, 2), '60');
    await calcular(page);

    // El aviso está, y es correcto...
    await expect(avisoDeLaApp(page)).toContainText('no queda nada que pesar aparte');
    // ...y debajo ya no hay ninguna cifra negativa: ni la fila de agua de la balanza ni la
    // nota de hidratación, porque una cantidad negativa no es una cantidad. Lo que sí queda
    // es lo que sí se puede pesar: 820 − 246 = 574 g de harina y los 492 g de masa madre.
    const balanza = page.getByRole('region', { name: 'Lo que se pesa en la balanza' });
    // El emoji de cada fila va con aria-hidden, así que el nombre accesible es «Agua …»; la
    // fila del prefermento dice «246 g agua» en minúscula y no la pesca esta expresión.
    await expect(balanza.getByRole('row', { name: /Agua/ })).toHaveCount(0);
    await expect(balanza.getByText(/-\d/)).toHaveCount(0);
    await expect(balanza.getByRole('row', { name: /Harina/ })).toContainText('574 g');
    await expect(balanza.getByRole('row', { name: /Masa madre/ })).toContainText(
      '246 g harina + 246 g agua',
    );
    await expect(page.getByRole('note')).toHaveCount(0);
  });

  test('El levado NO se extrapola fuera de 4-32 °C, y se explica por qué', async ({ page }) => {
    await page.getByRole('button', { name: /Cuánto va a tardar en fermentar/ }).click();
    // 2 h pensadas para 24 °C, levando a 45 °C: el Q10 daría factor 0,23 → 28 min, pero a
    // 45 °C la levadura no fermenta más rápido: se muere. El motor devuelve null y la vista
    // lo DICE, que es lo que distingue una negativa de un hueco vacío por un fallo.
    await sembrarValor(page, '#ferm-temp-real', '45');
    const paso = page.locator('#paso-fermentacion');
    await expect(paso).toContainText('Aquí no se puede estimar');
    await expect(paso).toContainText('4 y 32 °C');
    await expect(paso).toContainText('se estresa');
    await expect(paso).not.toContainText('28 min');

    // Y por el otro extremo: a −18 °C la masa está congelada, no levando en 36 h 46 min.
    await sembrarValor(page, '#ferm-temp-real', '-18');
    await expect(paso).toContainText('casi parada');
    await expect(paso).not.toContainText('36 h 46 min');

    // Dentro del rango la cifra sigue saliendo: 2 h a 22 °C pensadas para 24 °C → ×1,15.
    await sembrarValor(page, '#ferm-temp-real', '22');
    await expect(paso).toContainText('2 h 18 min');
  });

  test('Un ingrediente con peso pero SIN NOMBRE se rechaza, como el mismo hueco en la harina', async ({
    page,
  }) => {
    await sembrarValor(page, '#harina', '1200');
    await sembrarValor(page, valorDeFila(page, 0), '840');
    await page.getByRole('button', { name: '+ Añadir ingrediente' }).click();
    await sembrarValor(page, valorDeFila(page, 3), '100'); // 100 g de algo, sin nombre
    await calcular(page);

    // Ni se descuentan en silencio ni se cuelan: se dice que falta el nombre y no se publica
    // ninguna tabla, igual que cuando el hueco está en el campo de harina.
    await expect(avisoDeLaApp(page)).toContainText('sin nombre');
    await expect(
      page.getByRole('region', { name: 'Tabla de porcentajes del panadero' }),
    ).toHaveCount(0);

    // Y en cuanto tiene nombre, los 100 g entran: 1.200 + 840 + 20 + 3 + 100 = 2.163 g.
    await sembrarValor(page, nombreDeFila(page, 3), 'Aceite');
    await expect(pesoTotalAnunciado(page)).toContainText('2163 g');
  });

  test('Un peso ILEGIBLE se rechaza en vez de convertirse en 0 g', async ({ page }) => {
    // La harina se queda en los 1.000 g por defecto: sembrar el valor que el campo YA tiene
    // es justo lo que ningún testigo puede detectar (ver la cabecera de _hidratacion.ts).
    await sembrarValor(page, valorDeFila(page, 0), 'setecientos');
    await calcular(page);

    // Antes salía «Agua 0 g · 0,0 %», hidratación «—» y peso total 1.030 g sin un solo aviso,
    // mientras el mismo texto en el campo de harina sí se rechazaba.
    await expect(avisoDeLaApp(page)).toContainText('no es un número');
    await expect(
      page.getByRole('region', { name: 'Tabla de porcentajes del panadero' }),
    ).toHaveCount(0);
  });

  test('El DDT no publica un agua que no se puede verter', async ({ page }) => {
    await page.getByRole('button', { name: /A qué temperatura pongo el agua/ }).click();
    const paso = page.locator('#paso-ddt');
    // Caso normal: objetivo 24 °C, cocina 22 °C, harina a temperatura de cocina, a mano →
    // 24 × 3 − 22 − 22 − 0 = 28,0 °C. La cifra sale, porque existe.
    await expect(paso).toContainText('28,0 °C');

    // Caso imposible: cocina a 35 °C y Thermomix (+12) → 24 × 3 − 35 − 35 − 12 = −10 °C.
    // No hay agua líquida a −10 °C: no se publica la cifra, se dice que no se puede.
    await sembrarValor(page, '#ddt-ambiente', '35');
    await page.locator('#ddt-amasado').selectOption('thermomix');
    await expect(paso).toContainText('no se puede conseguir');
    await expect(paso).toContainText('hielo');
    await expect(paso).not.toContainText('-10,0 °C');
    await expect(paso).not.toContainText('−10,0 °C');
  });

  test('Con gramos decimales las filas SUMAN el total anunciado', async ({ page }) => {
    // 1.000,4 + 700,4 + 20,4 + 10,4 = 1.731,6 g → el total redondea a 1.732 y los dos gramos
    // que faltan se reparten entre las filas. Antes cada fila redondeaba por su cuenta y la
    // tabla sumaba 1.730 bajo un total de 1.732: dos gramos que no estaban en ninguna parte.
    await sembrarValor(page, '#harina', '1000,4');
    await sembrarValor(page, valorDeFila(page, 0), '700,4');
    await sembrarValor(page, valorDeFila(page, 1), '20,4');
    await sembrarValor(page, valorDeFila(page, 2), '10,4');
    await calcular(page);

    await expect(pesoTotalAnunciado(page)).toContainText('1732 g');
    expect(await sumarGramosMostrados(page)).toBe(1732);
  });

  test('Las hidrataciones del JSON-LD son las MISMAS que las de la tabla visible', async ({
    page,
  }) => {
    // El FAQPage es lo que consumen Bing Copilot, ChatGPT y Perplexity para fundamentar sus
    // respuestas: si contradice a la tabla, la app responde una cosa al lector y otra a la IA.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find(b => b.includes('FAQPage')) ?? '';
    expect(faq).not.toBe('');

    for (const rango of ['60–65%', '65–68%', '75–80%']) {
      expect(faq).toContain(rango); // los de la tabla de la página
    }
    for (const viejo of ['65–70%', '68–75%', '80–90%']) {
      expect(faq).not.toContain(viejo); // los que contradecían a la tabla
    }
  });
});
