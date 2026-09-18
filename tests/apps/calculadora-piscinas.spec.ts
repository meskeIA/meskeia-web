import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — calculadora-piscinas (segmento CÁLCULO, riesgo 2, 58 usos/90 d)
 * Primera inspección: 18/09/2026. Banco de pruebas: producción.
 * Reparación de los 9 hallazgos: 18/09/2026, misma fecha.
 *
 * QUÉ PROMETE LA APP
 *   · <h1> «Calculadora de Piscinas, Albercas y Piletas» y subtítulo «Volumen y dosis de
 *     cloro, pH, alguicida y sal para tu piscina, alberca o pileta». Son DOS promesas:
 *     un volumen geométrico y una DOSIFICACIÓN DE PRODUCTO QUÍMICO. La segunda es la de
 *     riesgo, y por eso aquí se contrasta cifra a cifra contra lo que la propia página
 *     afirma en su guía, en sus escenarios resueltos y en su FAQPage.
 *
 * DÓNDE VIVE EL CÁLCULO — no hay motor aparte: `calcularVolumen` y `calcularDosis`, dos
 * funciones puras al principio de app/calculadora-piscinas/page.tsx.
 *   · La entrada la lee parseSpanishNumber() de @/lib — el parser CANÓNICO, no el
 *     parseFloat(x.replace(',', '.')) que el catálogo arrastra. Los CASOS 1.bis y 1.ter
 *     son justo los dos que ese defecto y su reverso romperían.
 *   · Los cuatro campos son type="text" + inputMode="decimal", así que el navegador NO
 *     normaliza lo tecleado: «1,500» llega a la app tal cual y vale 1,5. (En un
 *     type="number" el navegador lo convertiría a «1.500» y el parser lo leería como
 *     millar español: 1.500 m de profundidad. Aquí no ocurre.)
 *
 * ── CÓMO SE DOSIFICA DESDE LA REPARACIÓN DEL 18/09/2026 ──
 *
 * El cloro se dosifica por CLORO LIBRE objetivo en ppm (= mg/L), no por gramos de producto
 * sin procedencia: 1 ppm en 1 m³ son 1.000 L × 1 mg/L = 1 g de cloro activo, y el producto
 * necesario es ese gramo dividido por su riqueza. Constantes declaradas en page.tsx:
 *     PPM_CHOQUE = 10 · PPM_MANTENIMIENTO_SEMANA = 7 (repone ~1 ppm/día)
 *     RIQUEZA_GRANULADO = 0,65 · RIQUEZA_LIQUIDO_G_ML = 0,156 (13 % p/p × 1,2 kg/L)
 *     SAL_G_L = 5 · ALGUICIDA 10 mL/m³ de choque y 2 mL/m³ preventivo
 *     MAX_DIMENSION_M = 100 · MAX_PROFUNDIDAD_M = 5
 *
 * Esto es lo que se reparó, y por qué el «esperado» no siempre es el que escribió el acta:
 *
 *   · ALGUICIDA (hallazgo 919, alto) — el código multiplicaba por 100 y 20 mL/m³, DIEZ
 *     VECES lo que la propia app documenta en tres sitios que coincidían entre sí. Aquí el
 *     acta y la reparación coinciden: 10 y 2 mL/m³.
 *
 *   · CLORO (hallazgo 923) — el acta pedía «una sola cifra» y su test exigía ≥150 g en
 *     50 m³, deducido del FAQPage («150-300 g diariamente»). Pero ninguna de las tres
 *     cifras que la página publicaba tenía procedencia: eran tres números sueltos. La
 *     reparación no elige entre ellos, sino que los DERIVA de los ppm, que es lo único
 *     comprobable con una división; el FAQPage y la guía se reescribieron sobre esa base.
 *     50 m³ pasan de 100 g a 539 g semanales, así que el umbral del acta se cumple, pero
 *     por la razón correcta y no por haber programado hacia su aserción.
 *
 *   · pH 8 (hallazgo 926) — el acta esperaba el «20 %» del FAQPage frente al «3 %» de la
 *     guía. Ninguno de los dos es el número: la curva de disociación del ácido hipocloroso
 *     (pKa 7,54 a 25 °C) da 100/(1+10^(pH−7,54)) = 25,7 % a pH 8 y 68,6 % a pH 7,2. La
 *     página dice ahora 26 %, 47 % (pH 7,6) y 69 %, y cita de dónde sale.
 *
 *   · SAL (hallazgo 922) — dosificaba 6 g/L con el FAQPage anunciando «3-5 g/L». Se
 *     dosifica a 5 g/L, centro del rango 4-6 g/L que declaran los electrolizadores
 *     domésticos, y la tarjeta remite al manual del clorador, que es quien lo fija.
 *
 *   · DISCLAIMER (hallazgo 924) — el acta proponía la variante `technical`, cuyo texto
 *     estándar dice «dirigida a profesionales del dominio que conocen sus limitaciones»:
 *     falso en una app doméstica. Se monta `general` con severidad alta y texto propio
 *     sobre productos químicos, que es el riesgo que esta app sí tiene.
 *
 * LOS CASOS, RESUELTOS A MANO
 *
 *   CASO 1 (normal) — rectangular 10 × 5 × 1,5 m = 75 m³ exactos = 75.000 litros.
 *       cloro granulado   ceil(75×7/0,65) = 808 g  ·  choque ceil(75×10/0,65) = 1154 g
 *       cloro líquido     ceil(75×7/0,156) = 3366 mL ·  choque ceil(75×10/0,156) = 4808 mL
 *       pH+ 15 g/m³ → 1125 g  ·  pH− 12 g/m³ → 900 g
 *       alguicida 2 mL/m³ → 150 mL · choque 10 mL/m³ → 750 mL
 *       sal 5 kg/m³ → 375 kg · reposición 20 % → 75 kg
 *       (1 m³ a 1 g/L es 1 kg, así que kg de sal = m³ × g/L.)
 *
 *   CASO 2 (las otras dos formas) — circular Ø 6 m y 1,2 m: π · 3² · 1,2 = 33,92920065… m³
 *       → «33,9 m³» y 33.929 litros. Ovalada 10 × 5 × 1,5: π · 5 · 2,5 · 1,5 = 58,90486… m³
 *       → «58,9 m³» y 58.905 litros (área de elipse, no el 0,89 aproximado de otras).
 *
 *   CASO 3 (rechazo) — lo que NO puede ser una piscina: lados negativos, medidas por
 *       encima del tope y texto que no es número. Los tres salen con aviso en role="alert"
 *       y RETIRAN el resultado anterior.
 */

/** El volumen que la app muestra: «75,0 m³ (75.000 litros)». */
const volumen = (page: Page) => page.locator('[class*="volumenValue"]');

/** Una dosis concreta: tarjeta (0 cloro, 1 pH, 2 alguicida, 3 sal) y posición dentro. */
const dosis = (page: Page, tarjeta: number, fila: number) =>
  page.locator('[class*="productoCard"]').nth(tarjeta).locator('[class*="dosisValue"]').nth(fila);

/** El aviso de por qué no se ha podido calcular. */
const aviso = (page: Page) => page.locator('[class*="errorBox"]');

/** El botón que dispara el cálculo (la app NO calcula al teclear). */
const botonCalcular = (page: Page) =>
  page.getByRole('button', { name: 'Calcular volumen y dosis de productos' });

/**
 * Escribe TECLEANDO, que es como entra el dato de verdad: vacía el campo y pulsa tecla a
 * tecla. Luego comprueba que el estado de React lo recogió, no solo el DOM.
 */
async function teclear(page: Page, selector: string, texto: string): Promise<void> {
  const campo = page.locator(selector);
  await campo.fill('');
  await campo.pressSequentially(texto, { delay: 15 });
  await esperarValorEnReact(page, selector, texto);
}

/** Cambia de forma y espera a que el campo de esa forma esté hidratado. */
async function elegirForma(page: Page, nombre: RegExp, campo: string): Promise<void> {
  await page.getByRole('button', { name: nombre }).click();
  await esperarHidratacion(page, [campo, '#prof']);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/calculadora-piscinas/');
  await esperarHidratacion(page, ['#largo', '#ancho', '#prof']);
});

test.describe('Volumen (la primera promesa del h1)', () => {
  test('CASO 1 · rectangular 10 × 5 × 1,5 son 75 m³ exactos, y de ahí salen las dosis', async ({ page }) => {
    // El campo de profundidad arranca en «1,5»: los controles que este caso MUEVE de
    // verdad son largo y ancho, que empiezan vacíos.
    await teclear(page, '#largo', '10');
    await teclear(page, '#ancho', '5');
    await botonCalcular(page).click();

    // 10 × 5 × 1,5 = 75 m³ · 1 m³ = 1.000 L → 75.000 litros (lo dice el propio FAQPage).
    await expect(volumen(page)).toHaveText('75,0 m³ (75.000 litros)');

    // Cloro granulado al 65 %: 7 ppm/semana y 10 ppm de choque, divididos por la riqueza.
    await expect(dosis(page, 0, 0)).toHaveText('808 g');   // ceil(75 × 7 / 0,65)
    await expect(dosis(page, 0, 1)).toHaveText('1154 g');  // ceil(75 × 10 / 0,65)
    // Cloro líquido al 13 % (0,156 g de cloro activo por mL): los MISMOS ppm.
    await expect(dosis(page, 0, 2)).toHaveText('3366 mL'); // ceil(75 × 7 / 0,156)
    await expect(dosis(page, 0, 3)).toHaveText('4808 mL'); // ceil(75 × 10 / 0,156)
    // Corrector de pH: 15 y 12 g/m³ por cada ~0,2 unidades (no los tocó la reparación).
    await expect(dosis(page, 1, 0)).toHaveText('1125 g');  // 75 × 15
    await expect(dosis(page, 1, 1)).toHaveText('900 g');   // 75 × 12
    // Sal: 5 kg/m³ = 5 g/L. 75 × 5 = 375 kg, y la reposición anual es el 20 %.
    await expect(dosis(page, 3, 0)).toHaveText('375 kg');
    await expect(dosis(page, 3, 1)).toHaveText('75 kg');   // ceil(375 × 0,2)
  });

  test('CASO 1.bis · una profundidad tecleada «1,500» son 1,5 m, no 1.500', async ({ page }) => {
    // El reverso del defecto del millar: si el campo fuese type="number", el navegador
    // normalizaría «1,500» a «1.500» y parseSpanishNumber lo leería como millar español,
    // devolviendo 1500. Aquí es type="text", llega «1,500» y vale 1,5.
    await teclear(page, '#largo', '10');
    await teclear(page, '#ancho', '5');
    await teclear(page, '#prof', '1,500');
    await botonCalcular(page).click();

    // Sigue siendo 10 × 5 × 1,5 = 75 m³. Con el defecto saldrían 75.000 m³.
    await expect(volumen(page)).toHaveText('75,0 m³ (75.000 litros)');
  });

  test('CASO 1.ter · lee el separador de millar español en vez de comérselo', async ({ page }) => {
    // Hasta la reparación esto se comprobaba en el volumen: «1.000» de largo daba 7.500 m³
    // y con parseFloat(x.replace(',', '.')) habría dado 7,5 m³, mil veces menos. Ahora
    // 1.000 m es una medida imposible y la app la rechaza, así que la prueba de que el
    // parser LEE el millar está en el aviso: nombra 1.000,0 m. Si se comiera el punto, el
    // largo valdría 1 m, sería plausible y no habría aviso ninguno.
    await teclear(page, '#largo', '1.000');
    await teclear(page, '#ancho', '5');
    await botonCalcular(page).click();

    // Ojo al formato: es-ES NO agrupa los millares hasta las cinco cifras, así que
    // formatNumber(1000, 1) es «1000,0» y no «1.000,0». Es el mismo detalle que mantuvo
    // oculto durante meses el fallo del parser en estimador-compraventa-inmueble.
    await expect(aviso(page)).toContainText('1000,0 m');
    await expect(volumen(page)).toHaveCount(0);
  });

  test('CASO 2 · circular Ø 6 m y 1,2 m de fondo son 33,9 m³', async ({ page }) => {
    await elegirForma(page, /Circular/, '#diametro');
    await teclear(page, '#diametro', '6');
    await teclear(page, '#prof', '1,2');
    await botonCalcular(page).click();

    // π · (6/2)² · 1,2 = π · 9 · 1,2 = 33,92920065… m³ → «33,9 m³» y 33.929 litros.
    await expect(volumen(page)).toHaveText('33,9 m³ (33.929 litros)');
    // Y las dosis se derivan de ESE volumen, sin redondear antes de multiplicar.
    await expect(dosis(page, 0, 0)).toHaveText('366 g');  // ceil(33,9292 × 7 / 0,65)
    await expect(dosis(page, 3, 0)).toHaveText('170 kg'); // ceil(33,9292 × 5)
  });

  test('CASO 2.bis · ovalada 10 × 5 × 1,5 usa el área de elipse, no una aproximación', async ({ page }) => {
    await elegirForma(page, /Ovalada/, '#largo-oval');
    await teclear(page, '#largo-oval', '10');
    await teclear(page, '#ancho-oval', '5');
    await botonCalcular(page).click();

    // π · (10/2) · (5/2) · 1,5 = π · 18,75 = 58,90486225… m³ → «58,9 m³», 58.905 litros.
    // La regla práctica «largo × ancho × prof × 0,89» daría 66,75 m³, un 13 % más.
    await expect(volumen(page)).toHaveText('58,9 m³ (58.905 litros)');
  });

  test('cambiar de forma retira el resultado anterior en vez de dejarlo colgado', async ({ page }) => {
    await teclear(page, '#largo', '10');
    await teclear(page, '#ancho', '5');
    await botonCalcular(page).click();
    await expect(volumen(page)).toHaveText('75,0 m³ (75.000 litros)');

    // cambiarForma() hace setVolumen(null): las dimensiones de una forma no valen para otra.
    await elegirForma(page, /Circular/, '#diametro');
    await expect(volumen(page)).toHaveCount(0);
  });
});

test.describe('Dosificación y rechazos (los 9 hallazgos del 18/09/2026, ya reparados)', () => {
  test('919 · la dosis de alguicida es la que la propia app enseña, no diez veces más', async ({ page }) => {
    // calcularDosis usaba 20 mL/m³ preventivo y 100 mL/m³ de choque. La MISMA página decía
    // tres veces otra cosa, y las tres coincidían entre sí:
    //   · paso 5 de la guía: «100 mL/10 m³» de choque y «20 mL/10 m³» semanales → 10 y 2;
    //   · escenario «Agua verde», 40 m³: «Alguicida de choque: 400 mL» → 10 mL/m³;
    //   · FAQPage: choque «1 L por cada 100 m³» y preventivo «0,2 L por cada 100 m³».
    // Eran 7,5 litros de alguicida en una piscina familiar en vez de 750 mL: espuma
    // persistente y, con los alguicidas de amonio cuaternario, irritación de ojos y piel.
    await teclear(page, '#largo', '10');
    await teclear(page, '#ancho', '5');
    await botonCalcular(page).click();
    await expect(volumen(page)).toHaveText('75,0 m³ (75.000 litros)');

    await expect(dosis(page, 2, 1)).toHaveText('750 mL');  // 75 m³ a 10 mL/m³
    await expect(dosis(page, 2, 0)).toHaveText('150 mL');  // 75 m³ a 2 mL/m³
  });

  test('920 · rechaza los lados negativos, que el producto volvía positivos', async ({ page }) => {
    // La única guarda era `vol <= 0`, y el producto de DOS negativos es positivo: −10 × −5
    // × 1,5 = 75 y la app dosificaba 750 g de cloro de choque para una piscina imposible.
    // Se valida cada dimensión, no el producto.
    await teclear(page, '#largo', '-10');
    await teclear(page, '#ancho', '-5');
    await botonCalcular(page).click();

    await expect(volumen(page)).toHaveCount(0);
    await expect(aviso(page)).toContainText('mayor que cero');
  });

  test('925 · rechaza por arriba lo que no puede ser una piscina', async ({ page }) => {
    // Una profundidad de «1.500» —millar español legítimo para parseSpanishNumber, y la
    // forma en que se escribe 1,5 en buena parte de Latinoamérica, donde esta app se
    // presenta como «alberca» y «pileta»— daba 75.000 m³ y 450.000 kg de sal en silencio.
    await teclear(page, '#largo', '10');
    await teclear(page, '#ancho', '5');
    await teclear(page, '#prof', '1.500');
    await botonCalcular(page).click();

    await expect(volumen(page)).toHaveCount(0);
    // Y el aviso dice qué hacer, porque el tecleo más probable detrás de esto es un decimal
    // a la americana: el punto está ahí para separar 1 de 5, no para agrupar millares.
    await expect(aviso(page)).toContainText('usa la coma');
  });

  test('921 · un recálculo inválido retira el resultado en vez de dejarlo en pantalla', async ({ page }) => {
    await teclear(page, '#largo', '10');
    await teclear(page, '#ancho', '5');
    await botonCalcular(page).click();
    await expect(volumen(page)).toHaveText('75,0 m³ (75.000 litros)');

    // Ahora el largo deja de ser un número. Antes `calcular` hacía `return` sin tocar el
    // estado: no borraba el volumen, no borraba las dosis y no mostraba ningún aviso. El
    // usuario se quedaba leyendo «75,0 m³ · 750 g de cloro de choque» con otros datos en
    // los campos, y el botón parecía no responder.
    await teclear(page, '#largo', 'abc');
    await botonCalcular(page).click();

    await expect(volumen(page)).toHaveCount(0);
    await expect(dosis(page, 0, 0)).toHaveCount(0);
    await expect(aviso(page)).toContainText('escribe un número');
  });

  test('921.bis · con los campos vacíos dice qué falta, en vez de no hacer nada', async ({ page }) => {
    // Primera visita: pulsar «Calcular» sin escribir nada no hacía absolutamente nada.
    await botonCalcular(page).click();
    await expect(aviso(page)).toContainText('Faltan medidas');
    await expect(aviso(page)).toContainText('largo');
  });

  test('el aviso de rechazo es anunciable por un lector de pantalla', async ({ page }) => {
    // Un aviso que sustituye al resultado y no se anuncia deja a quien no ve la pantalla
    // creyendo que el botón está roto.
    await teclear(page, '#largo', '-10');
    await botonCalcular(page).click();
    await expect(aviso(page)).toHaveAttribute('role', 'alert');
  });

  test('922 · la sal que dosifica cabe en el rango que su propio FAQPage declara', async ({ page }) => {
    // La tarjeta decía «Nivel objetivo: 5 – 7 g/L» y dosificaba 6 g/L; el FAQPage de la
    // MISMA página —el que leen Bing Copilot, ChatGPT y Perplexity— decía «3-5 g/L». El
    // valor usado quedaba fuera del rango que la página anunciaba. Ahora dosifica 5 g/L y
    // publica 4-6 g/L, y este test comprueba que sigue cabiendo: es la relación entre las
    // dos cifras lo que se vigila, no un número suelto.
    await teclear(page, '#largo', '10');
    await teclear(page, '#ancho', '5');
    await botonCalcular(page).click();
    await expect(volumen(page)).toHaveText('75,0 m³ (75.000 litros)');

    const kg = Number((await dosis(page, 3, 0).innerText()).replace(/[^\d]/g, ''));
    const gramosPorLitro = kg / 75; // kg totales / m³ = g/L

    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    const rango = faq.match(/recomendada es de (\d+)-(\d+) g\/L/);
    expect(rango).not.toBeNull();
    expect(gramosPorLitro).toBeGreaterThanOrEqual(Number(rango?.[1]));
    expect(gramosPorLitro).toBeLessThanOrEqual(Number(rango?.[2]));
  });

  test('923 · la dosis de cloro y los ppm que la página declara son la misma cosa', async ({ page }) => {
    // La página publicaba TRES cifras de mantenimiento incompatibles: la calculadora 2 g/m³
    // semanales, el FAQPage «150-300 g diariamente» en 50 m³ y el escenario de fiesta una
    // dosis entera de 180 g en 30 m³. Ninguna tenía procedencia. Ahora la dosis se deriva
    // de los ppm declarados en la propia tarjeta, así que este test la RECALCULA desde el
    // texto que el usuario lee, en vez de fijar un número que envejecería solo.
    await teclear(page, '#largo', '10');
    await teclear(page, '#ancho', '5');
    await teclear(page, '#prof', '1');
    await botonCalcular(page).click();
    await expect(volumen(page)).toHaveText('50,0 m³ (50.000 litros)');

    const tarjetaCloro = page.locator('[class*="productoCard"]').first();
    const leyenda = await tarjetaCloro.innerText();
    const ppmChoque = Number(leyenda.match(/cloro libre a (\d+) ppm/)?.[1]);
    const ppmSemana = Number(leyenda.match(/repone (\d+) ppm/)?.[1]);
    expect(ppmChoque).toBe(10);
    expect(ppmSemana).toBe(7);

    // 1 ppm en 1 m³ = 1 g de cloro activo; el granulado es del 65 %, así que el producto
    // es ppm × m³ / 0,65, redondeado hacia arriba.
    const mantenimiento = Number((await dosis(page, 0, 0).innerText()).replace(/[^\d]/g, ''));
    const choque = Number((await dosis(page, 0, 1).innerText()).replace(/[^\d]/g, ''));
    expect(mantenimiento).toBe(Math.ceil((50 * ppmSemana) / 0.65)); // 539 g
    expect(choque).toBe(Math.ceil((50 * ppmChoque) / 0.65));        // 770 g

    // Y el FAQPage cita ese mismo 539, no otra cifra suya.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).toContain(`${mantenimiento} g de granulado a la semana`);
  });

  test('926 · la eficacia del cloro por pH sale de la curva, y es una sola cifra', async ({ page }) => {
    // El bloque educativo afirmaba «A pH 8,0, el cloro solo tiene un 3% de eficacia. A pH
    // 7,2, tiene un 73%», y el FAQPage «a pH 8 solo el 20 % del cloro añadido es activo».
    // El acta pedía quedarse con el 20 %; no es el número. La fracción de ácido
    // hipocloroso, que es la forma que desinfecta, es 100/(1+10^(pH−pKa)) con pKa 7,54 a
    // 25 °C: 68,6 % a pH 7,2, 46,6 % a pH 7,6 y 25,7 % a pH 8,0. Un «3 %» empuja a
    // sobredosificar cloro «porque no hace nada».
    // El botón de la sección educativa lleva aria-label, así que su nombre accesible es
    // «Ver guía educativa», no el «⬇️ Ver Guía Completa» que se lee en pantalla.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const consejo = page.locator('[class*="tipCard"]').filter({ hasText: 'Ajusta el pH siempre antes del cloro' });
    await expect(consejo).toContainText('26%');
    await expect(consejo).toContainText('69%');
    await expect(consejo).not.toContainText('3% de eficacia');

    // Y el FAQPage servido dice lo mismo que la guía, que es donde estaba la contradicción.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).toContain('a pH 8,0 solo un 26 %');
  });

  test('924 · el aviso legal habla del riesgo real de esta app', async ({ page }) => {
    // Montaba <DisclaimerCard variant="financial" severity="critical">, así que se titulaba
    // «Información Importante sobre Herramientas Financieras» y remitía a un «asesor
    // fiscal, gestor, abogado o entidad financiera regulada». Aquí no se decide ninguna
    // inversión: se decide cuántos gramos de hipoclorito echar a un agua donde se bañan
    // niños. Es el antipatrón 10 del CLAUDE.md, disclaimer incoherente con el riesgo real.
    const avisoLegal = page.locator('[class*="disclaimerCard"]').first();
    await expect(avisoLegal).toContainText(/químic/i);
    await expect(avisoLegal).toContainText(/etiqueta del fabricante/i);
    await expect(avisoLegal).not.toContainText(/asesor fiscal|entidad financiera/i);
  });

  test('927 · los emojis decorativos no se leen en voz alta', async ({ page }) => {
    // Pasivo anterior al candado check:a11y-jsx, que solo juzga las líneas que un commit
    // añade. Eran 13 incumplimientos de la regla unívoca, empezando por el <h1>. El emoji
    // sigue viéndose (textContent lo lleva); lo que cambia es el NOMBRE ACCESIBLE, que ya
    // no empieza por «piscina» dicho en voz alta antes del título.
    const titulo = page.getByRole('heading', { level: 1 });
    await expect(titulo).toHaveAccessibleName('Calculadora de Piscinas, Albercas y Piletas');
  });
});
