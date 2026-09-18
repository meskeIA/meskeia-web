import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — calculadora-piscinas (segmento CÁLCULO, riesgo 2, 58 usos/90 d)
 * Primera inspección: 18/09/2026. Banco de pruebas: producción.
 *
 * QUÉ PROMETE LA APP
 *   · <h1> «Calculadora de Piscinas, Albercas y Piletas» y subtítulo «Volumen y dosis de
 *     cloro, pH, alguicida y sal para tu piscina, alberca o pileta». Son DOS promesas:
 *     un volumen geométrico y una DOSIFICACIÓN DE PRODUCTO QUÍMICO. La segunda es la de
 *     riesgo, y por eso aquí se contrasta cifra a cifra contra lo que la propia página
 *     afirma en su guía, en sus escenarios resueltos y en su FAQPage.
 *   · metadata.ts / FAQPage (servido, comprobado abajo): «largo × ancho × profundidad
 *     media», «1 m³ = 1.000 litros», «(prof. mínima + prof. máxima) / 2», pH 7,2–7,6,
 *     alguicida «0,5-1 L por cada 50 m³» de choque y «0,1-0,2 L por cada 50 m³» de
 *     mantenimiento, sal «3-5 g/L», cloro «150-300 g ... diariamente» en 50 m³.
 *
 * DÓNDE VIVE EL CÁLCULO — no hay motor aparte: `calcularVolumen` y `calcularDosis`, dos
 * funciones puras al principio de app/calculadora-piscinas/page.tsx.
 *   · La entrada la lee `parseNum` = parseSpanishNumber() de @/lib — el parser CANÓNICO,
 *     no el parseFloat(x.replace(',', '.')) que el catálogo arrastra. Los CASOS 1.bis y
 *     1.ter son justo los dos que ese defecto y su reverso romperían.
 *   · Los cuatro campos son type="text" + inputMode="decimal", así que el navegador NO
 *     normaliza lo tecleado: «1,500» llega a la app tal cual y vale 1,5. (En un
 *     type="number" el navegador lo convertiría a «1.500» y el parser lo leería como
 *     millar español: 1.500 m de profundidad. Aquí no ocurre.)
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — rectangular 10 × 5 × 1,5 m
 *       V = 10 × 5 × 1,5 = 75 m³ exactos = 75.000 litros.
 *       Dosis derivadas (los coeficientes están escritos en calcularDosis, y cada uno se
 *       redondea hacia arriba con Math.ceil):
 *         cloro granulado   2 g/m³ → 150 g  ·  choque 10 g/m³ → 750 g
 *         cloro líquido    15 mL/m³ → 1125 mL ·  choque 60 mL/m³ → 4500 mL
 *         pH+ 15 g/m³ → 1125 g  ·  pH− 12 g/m³ → 900 g
 *         alguicida 20 mL/m³ → 1500 mL · choque 100 mL/m³ → 7500 mL   ← véase HALLAZGO 1
 *         sal 6 kg/m³ → 450 kg · reposición 20 % → 90 kg
 *       La sal SÍ cuadra en unidades: 6 kg/m³ = 6 kg por 1.000 L = 6 g/L, que es lo que
 *       la tarjeta promete, y coincide con el escenario de la propia app («40 × 6 = 240 kg»).
 *
 *   CASO 2 (las otras dos formas, con valor cerrado)
 *       Circular Ø 6 m (radio 3) y 1,2 m: V = π · 3² · 1,2 = 33,92920065… m³ → «33,9 m³»
 *       y 33.929 litros.
 *       Ovalada 10 × 5 × 1,5: V = π · 5 · 2,5 · 1,5 = 58,90486225… m³ → «58,9 m³» y
 *       58.905 litros (área de elipse, no el 0,89 aproximado que usan otras calculadoras).
 *
 *   CASO 3 (límite y rechazo) — lo que NO puede ser una piscina
 *       −10 × −5 × 1,5: el producto de dos negativos es positivo, así que la guarda
 *       `vol <= 0` no lo ve y la app da 75 m³ y 750 g de cloro de choque para una piscina
 *       de lados negativos. Y una profundidad de «1.500» (millar español legítimo para el
 *       parser) da 75.000 m³ y 450.000 kg de sal sin un solo aviso. Lo esperado en ambos
 *       casos es un rechazo. → HALLAZGO 2.
 *       Con una entrada que no es número («abc») o con un volumen negativo, la app hace
 *       `return` sin tocar el estado: no borra el resultado anterior ni avisa. → HALLAZGO 3.
 *
 * EL VOLUMEN ESTÁ SANO (18/09/2026): las tres formas, el parser y el litro cuadran. Lo que
 * no cuadra es la DOSIFICACIÓN, y la propia página lo dice en tres sitios distintos.
 *
 * HALLAZGOS ABIERTOS — al final, con `test.fail()`. Afirman lo que DEBERÍA pasar, así que
 * hoy fallan a propósito; cuando se reparen se les quita el `test.fail()` y quedan como
 * candado de regresión.
 */

/** El volumen que la app muestra: «75,0 m³ (75.000 litros)». */
const volumen = (page: Page) => page.locator('[class*="volumenValue"]');

/** Una dosis concreta: tarjeta (0 cloro, 1 pH, 2 alguicida, 3 sal) y posición dentro. */
const dosis = (page: Page, tarjeta: number, fila: number) =>
  page.locator('[class*="productoCard"]').nth(tarjeta).locator('[class*="dosisValue"]').nth(fila);

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

    // Cloro granulado: 2 g/m³ mantenimiento y 10 g/m³ choque (los coeficientes de
    // calcularDosis, y el choque coincide con el paso 4 de la guía: «10 g/m³»).
    await expect(dosis(page, 0, 0)).toHaveText('150 g');   // 75 × 2
    await expect(dosis(page, 0, 1)).toHaveText('750 g');   // 75 × 10
    // Cloro líquido: 15 y 60 mL/m³.
    await expect(dosis(page, 0, 2)).toHaveText('1125 mL'); // 75 × 15
    await expect(dosis(page, 0, 3)).toHaveText('4500 mL'); // 75 × 60
    // Corrector de pH: 15 y 12 g/m³ por cada ~0,2 unidades.
    await expect(dosis(page, 1, 0)).toHaveText('1125 g');  // 75 × 15
    await expect(dosis(page, 1, 1)).toHaveText('900 g');   // 75 × 12
    // Sal: 6 kg/m³ = 6 g/L, el objetivo que la tarjeta declara. 75 × 6 = 450 kg.
    await expect(dosis(page, 3, 0)).toHaveText('450 kg');
    await expect(dosis(page, 3, 1)).toHaveText('90 kg');   // ceil(450 × 0,2)
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
    await teclear(page, '#largo', '1.000');
    await teclear(page, '#ancho', '5');
    await botonCalcular(page).click();

    // 1.000 × 5 × 1,5 = 7.500 m³. Con parseFloat(x.replace(',', '.')) el largo habría
    // valido 1 m y el resultado habría sido 7,5 m³ — mil veces menos, sin ningún aviso.
    await expect(volumen(page)).toHaveText('7500,0 m³ (7.500.000 litros)');
  });

  test('CASO 2 · circular Ø 6 m y 1,2 m de fondo son 33,9 m³', async ({ page }) => {
    await elegirForma(page, /Circular/, '#diametro');
    await teclear(page, '#diametro', '6');
    await teclear(page, '#prof', '1,2');
    await botonCalcular(page).click();

    // π · (6/2)² · 1,2 = π · 9 · 1,2 = 33,92920065… m³ → «33,9 m³» y 33.929 litros.
    await expect(volumen(page)).toHaveText('33,9 m³ (33.929 litros)');
    // Y las dosis se derivan de ESE volumen: ceil(33,9292 × 2) = 68 g de mantenimiento.
    await expect(dosis(page, 0, 0)).toHaveText('68 g');
    await expect(dosis(page, 3, 0)).toHaveText('204 kg'); // ceil(33,9292 × 6)
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

test.describe('HALLAZGOS ABIERTOS (18/09/2026)', () => {
  // Los siete usan test.fail(): afirman lo que DEBERÍA pasar y hoy no pasa. El día que se
  // reparen saldrán en rojo («expected to fail, but passed») y habrá que quitarles la
  // marca, no reescribir el valor esperado.

  test.fail('HALLAZGO 1 · la dosis de alguicida debe ser la que la propia app enseña', async ({ page }) => {
    // calcularDosis usa 20 mL/m³ preventivo y 100 mL/m³ de choque. La MISMA página dice
    // tres veces otra cosa, y las tres coinciden entre sí:
    //   · paso 5 de la guía: «dosis de choque de alguicida (100 mL/10 m³)» y «dosis
    //     semanales de 20 mL/10 m³» → 10 y 2 mL/m³;
    //   · escenario «Agua verde», piscina de 40 m³: «Alguicida de choque: 400 mL»
    //     (= 10 mL/m³; la calculadora da 4.000 mL para esa misma piscina);
    //   · FAQPage servido: choque «0,5-1 L por cada 50 m³» y mantenimiento «0,1-0,2 L por
    //     cada 50 m³» → 10-20 y 2-4 mL/m³.
    // La calculadora multiplica por DIEZ la dosis de su propia documentación. En 75 m³ eso
    // son 7,5 litros de alguicida en vez de 750 mL: espuma persistente y, con los
    // alguicidas de amonio cuaternario, irritación de ojos y piel.
    await teclear(page, '#largo', '10');
    await teclear(page, '#ancho', '5');
    await botonCalcular(page).click();
    await expect(volumen(page)).toHaveText('75,0 m³ (75.000 litros)');

    await expect(dosis(page, 2, 1)).toHaveText('750 mL');  // 75 m³ a 100 mL/10 m³
    await expect(dosis(page, 2, 0)).toHaveText('150 mL');  // 75 m³ a 20 mL/10 m³
  });

  test.fail('HALLAZGO 2 · debe rechazar lo que no puede ser una piscina', async ({ page }) => {
    // (a) Lados negativos. La única guarda es `vol <= 0`, y el producto de DOS negativos
    // es positivo: −10 × −5 × 1,5 = 75 y la app dosifica 750 g de cloro de choque para
    // una piscina imposible. Lo correcto es rechazar la dimensión, no el producto.
    await teclear(page, '#largo', '-10');
    await teclear(page, '#ancho', '-5');
    await botonCalcular(page).click();
    await expect(volumen(page)).toHaveCount(0);

    // (b) Sin control de plausibilidad tampoco por arriba: una profundidad de «1.500»
    // —millar español legítimo para parseSpanishNumber, y la forma en que un usuario de
    // México o Argentina puede escribir 1,5— da 75.000 m³ y 450.000 kg de sal en silencio.
    await teclear(page, '#largo', '10');
    await teclear(page, '#ancho', '5');
    await teclear(page, '#prof', '1.500');
    await botonCalcular(page).click();
    await expect(volumen(page)).not.toHaveText('75.000,0 m³ (75.000.000 litros)');
  });

  test.fail('HALLAZGO 3 · un recálculo inválido debe retirar el resultado, no dejarlo en pantalla', async ({ page }) => {
    await teclear(page, '#largo', '10');
    await teclear(page, '#ancho', '5');
    await botonCalcular(page).click();
    await expect(volumen(page)).toHaveText('75,0 m³ (75.000 litros)');

    // Ahora el largo deja de ser un número. `calcular` hace `return` sin tocar el estado:
    // no borra el volumen, no borra las dosis y no muestra ningún aviso. El usuario se
    // queda mirando «75,0 m³ · 750 g de cloro de choque» con unos datos que ya no son
    // esos, y el botón parece no responder. Lo mismo pasa con un volumen negativo
    // (largo −10, ancho 5) y con los campos vacíos al entrar.
    await teclear(page, '#largo', 'abc');
    await botonCalcular(page).click();
    await expect(volumen(page)).toHaveCount(0);
  });

  test.fail('HALLAZGO 4 · la sal que dosifica debe caber en el rango que su FAQ declara', async ({ page }) => {
    // La tarjeta de la app dice «Nivel objetivo: 5 – 7 g/L» y dosifica a 6 g/L
    // (6 kg/m³ → 450 kg en 75 m³). El FAQPage de la MISMA página, el que leen Bing
    // Copilot, ChatGPT y Perplexity, dice «La concentración de sal recomendada es de
    // 3-5 g/L». Con 4 g/L —el centro de ese rango— una piscina de 75 m³ pediría 300 kg,
    // no 450: 150 kg de sal de más, y por encima del rango de trabajo de buena parte de
    // los electrolizadores, que obliga a diluir vaciando y rellenando.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    const rango = faq.match(/recomendada es de (\d+)-(\d+) g\/L/);
    expect(rango).not.toBeNull();
    expect(Number(rango?.[1])).toBeLessThanOrEqual(6);
    expect(Number(rango?.[2])).toBeGreaterThanOrEqual(6);
  });

  test.fail('HALLAZGO 5 · la dosis de cloro y la que el FAQ declara deben ser la misma', async ({ page }) => {
    // calcularDosis usa 2 g/m³ a la SEMANA. El FAQPage servido dice, para ese mismo
    // volumen de referencia: «En una piscina de 50 m³, eso equivale a añadir
    // aproximadamente 150-300 g de cloro granulado al 70 % DIARIAMENTE». Entre las dos
    // cifras hay un factor de 10 a 20 (100 g/semana frente a 1.050-2.100 g/semana), y el
    // FAQPage es justamente lo que Bing Copilot, ChatGPT y Perplexity leen para responder.
    // El escenario «fiesta» de la propia guía añade una tercera cifra: «+90 g (media dosis
    // extra)» en 30 m³, cuando la dosis ENTERA de mantenimiento para 30 m³ son 60 g.
    await teclear(page, '#largo', '10');
    await teclear(page, '#ancho', '5');
    await teclear(page, '#prof', '1');
    await botonCalcular(page).click();
    await expect(volumen(page)).toHaveText('50,0 m³ (50.000 litros)');

    // Hoy da «100 g». Sea cual sea la cifra buena, la app no puede sostener las dos.
    const mantenimiento = Number((await dosis(page, 0, 0).innerText()).replace(/[^\d]/g, ''));
    expect(mantenimiento).toBeGreaterThanOrEqual(150);
  });

  test.fail('HALLAZGO 6 · la eficacia del cloro a pH 8 debe ser una sola cifra', async ({ page }) => {
    // El bloque educativo afirma «A pH 8,0, el cloro solo tiene un 3% de eficacia. A pH
    // 7,2, tiene un 73%». El FAQPage de la misma página dice «a pH 8 solo el 20 % del
    // cloro añadido es activo». La curva de disociación del ácido hipocloroso da ~22 % a
    // pH 8 y ~66-73 % a pH 7,2: el 73 % encaja y el 3 % no. Un 3 % invita a corregir el pH
    // con prisa y a sobredosificar cloro «porque no hace nada».
    // El botón de la sección educativa lleva aria-label, así que su nombre accesible es
    // «Ver guía educativa», no el «⬇️ Ver Guía Completa» que se lee en pantalla.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const consejo = page.locator('[class*="tipCard"]').filter({ hasText: 'Ajusta el pH siempre antes del cloro' });
    await expect(consejo).toContainText('20%');
  });

  test.fail('HALLAZGO 7 · el disclaimer debe hablar del riesgo real de esta app', async ({ page }) => {
    // La app monta <DisclaimerCard variant="financial" severity="critical">, así que su
    // aviso legal se titula «Información Importante sobre Herramientas Financieras» y
    // remite a un «asesor fiscal, gestor, abogado o entidad financiera regulada». Aquí no
    // se decide ninguna inversión: se decide cuántos gramos de hipoclorito echar a un agua
    // donde se bañan niños. La variante que corresponde es `technical`. (La app sí tiene
    // arriba un warningBox propio con role="alert" que advierte de los químicos, pero el
    // aviso legal formal apunta a otro riesgo.)
    const aviso = page.locator('[class*="disclaimerCard"]').first();
    await expect(aviso).toContainText(/químic|producto|seguridad/i);
  });
});
