import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — calculadora-masa-madre (segmento motor, riesgo 3, 232 usos reales · vertical Coquinum)
 *
 * Primera inspección: 25/08/2026. La app promete en su <h1> «Calculadora de Masa Madre» y en su
 * subtítulo «Sustituye la levadura comercial por masa madre en cualquier receta con ajuste
 * automático de harina y agua». La metadata repite «ajuste automático de harina y agua». Hay,
 * por tanto, verdad comprobable con lápiz: la dosis de fermento y el descuento de harina y agua.
 *
 * OJO CON EL NOMBRE: esto NO es un formulador por porcentaje del panadero. No pide harina, ni
 * agua, ni sal, ni peso de masa: convierte gramos de levadura comercial en gramos de masa madre
 * y dice cuánta harina y cuánta agua hay que RESTAR de la receta original. La aritmética del
 * panadero se comprueba aquí de forma indirecta: si lo que se resta es exactamente lo que el
 * fermento aporta, la harina total, el agua total y por tanto la hidratación de la receta no
 * cambian. El porcentaje del panadero propiamente dicho vive en /calculadora-porcentaje-panadero/
 * y la sal no aparece en ninguna pantalla de esta app.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   lib/calculadoras/cocina.ts → calcularSustitucionMasaMadre(tipo, levadura_g, hidratacion_pct)
 *     · equivalencia a levadura seca: fresca ÷ 3 · seca = seca · instantánea = seca
 *     · masa_madre_g   = round(equivalente_seca × 20)      ← 20 g de MM por 1 g de levadura seca
 *     · harina_en_mm_g = round(masa_madre_g × 100 / (100 + hidratación))
 *     · agua_en_mm_g   = masa_madre_g − harina_en_mm_g      ← por construcción, la suma cuadra
 *   app/calculadora-masa-madre/page.tsx → solo vista; el parseo de la entrada es
 *     parseFloat(valor.replace(',', '.')) y se descarta el resultado si es 0, negativo o NaN.
 *
 * El motor está SEPARADO de la vista (bien) y lo comparten tres superficies: esta app, la Action
 * de ChatGPT (app/api/chatgpt/masa-madre/route.ts) y la tool del MCP (app/api/mcp/route.ts).
 * Pero NO tenía ningún test: tests/panaderia-motores.spec.ts cubre DDT y fermentación, no esta
 * función. Este fichero es el primer candado que ve la sustitución.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — 15 g de levadura FRESCA, masa madre al 100 %
 *       equivalente seca = 15 / 3        = 5 g
 *       masa madre       = 5 × 20        = 100 g
 *       harina en la MM  = 100 × 100/200 = 50 g
 *       agua en la MM    = 100 − 50      = 50 g          (50 + 50 = 100 ✔ la suma cuadra)
 *       comprobación de la aritmética del panadero, sobre una receta de 500 g harina + 350 g
 *       agua (70 % de hidratación) + 15 g de levadura fresca:
 *         harina añadida = 500 − 50 = 450 · agua añadida = 350 − 50 = 300
 *         harina TOTAL   = 450 + 50 (la del fermento) = 500 ✔
 *         agua TOTAL     = 300 + 50 (la del fermento) = 350 ✔
 *         hidratación    = 350 / 500 = 70 % ✔ — la receta conserva su hidratación.
 *       El descuento es, pues, CORRECTO: es justo lo que el fermento mete en la masa.
 *
 *     Y los cuatro escenarios que la propia app publica en su bloque educativo, que son la
 *     misma fórmula y sirven de control cruzado texto ↔ motor:
 *       baguette 2 g seca    → 2 × 20 = 40 g MM, 20 harina / 20 agua
 *       pizza 5 g fresca     → 5/3 = 1,6667 ; × 20 = 33,33 → 33 g MM
 *                              harina = round(33 × 100/200) = round(16,5) = 17 ; agua = 33 − 17 = 16
 *       pan de molde 7 g seca→ 140 g MM, 70 / 70
 *       brioche 10 g fresca  → 10/3 = 3,3333 ; × 20 = 66,67 → 67 g MM
 *
 *   CASO 2 (límite) — el deslizador en sus dos extremos, con 3 g de levadura seca
 *       masa madre = 3 × 20 = 60 g  ← LA MISMA a cualquier hidratación (ver HALLAZGO 1)
 *       al  50 %: harina = round(60 × 100/150) = 40 ; agua = 60 − 40 = 20   (20/40 = 50 % ✔)
 *       al 150 %: harina = round(60 × 100/250) = 24 ; agua = 60 − 24 = 36   (36/24 = 150 % ✔)
 *       En los dos, harina + agua = 60 = el total de masa madre: el redondeo no descuadra
 *       la suma, porque el agua se calcula por diferencia y no por su propia fórmula.
 *       El deslizador está acotado a 50–150 y el navegador recorta cualquier valor forzado
 *       desde el DOM, así que la división por (100 + hidratación) nunca puede anularse:
 *       no hay división por cero ni Infinity alcanzables desde la interfaz.
 *       Peso mínimo: 0,05 g de fresca → 0,05/3 × 20 = 0,333 → round = 0 → 0 g de masa madre.
 *
 *   CASO 3 (rechazo) — «-5», «abc», «0» y el campo vacío no deben producir resultado:
 *       ni cantidades negativas, ni NaN, ni «0 g» presentado como respuesta válida.
 *
 * HALLAZGOS del 25/08/2026 — REPARADOS ese mismo día. Los bloques que los documentaban como
 * TESTIGO —afirmando el comportamiento DEFECTUOSO, de modo que reparar los ponía en rojo—
 * están ya invertidos y afirman lo correcto:
 *   1. La dosis de masa madre NO depende de la hidratación del fermento, aunque la equivalencia
 *      que la propia app declara está anclada al 100 % («20 g de masa madre activa al 100 % de
 *      hidratación»). 3 g de seca dan 60 g de MM tanto al 50 % como al 150 %, y esos 60 g llevan
 *      40 g de harina prefermentada al 50 % frente a 30 g al 100 % y 24 g al 150 %: +33 % y −20 %
 *      respecto del ancla declarada. El deslizador solo cambia el REPARTO de lo que se resta.
 *   2. Los gramos salen sin separador de millar: 500 g de levadura seca → «10000 g», no «10.000 g».
 *      La app imprime el número crudo sin pasar por formatNumber de lib/formatters.
 *   3. El parseo es parseFloat y no parseSpanishNumber, así que cuela basura con prefijo numérico:
 *      «12abc» → 240 g · «1e3» → 20000 g · «10.5.3» → 210 g. Y «1.500» (mil quinientos en formato
 *      español) se lee 1,5 → 30 g de masa madre en vez de 30.000.
 *   4. Una cantidad positiva pero minúscula devuelve la caja de resultado completa con 0 g de masa
 *      madre y «Resta 0g de harina y 0g de agua», en vez de avisar de que no hay conversión posible.
 *   5. Los tres botones de tipo de levadura no llevan type="button" (sí llevan aria-pressed), y
 *      varios emojis decorativos en nodo propio van sin aria-hidden (💡 de la nota, ⏱️ del bloque
 *      de fermentación, los 4 iconos de escenario y los de consejos).
 */

const RUTA = '/calculadora-masa-madre/';

/** Escribe en el campo de gramos como lo haría el usuario (React escucha el evento input). */
async function ponerGramos(page: Page, valor: string): Promise<void> {
  await page.locator('#levadura-g').fill(valor);
}

/** Mueve el deslizador de hidratación: un input[type=range] necesita el setter nativo. */
async function ponerHidratacion(page: Page, valor: string): Promise<void> {
  await page.evaluate((v) => {
    const el = document.querySelector('#hidratacion-mm') as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )!.set!;
    setter.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, valor);
}

/** Gramos de masa madre a añadir (primera cifra grande del resultado). */
async function masaMadre(page: Page): Promise<string> {
  return (await page.locator('[class*="resultValorGrande"]').first().innerText())
    .replace(/\s+/g, ' ')
    .trim();
}

/** Hidratación aplicada (segunda cifra grande del resultado). */
async function hidratacionAplicada(page: Page): Promise<string> {
  return (await page.locator('[class*="resultValorGrande"]').nth(1).innerText())
    .replace(/\s+/g, ' ')
    .trim();
}

/** Las dos restas: [harina, agua]. El signo es un menos tipográfico (U+2212). */
async function restas(page: Page): Promise<string[]> {
  const textos = await page.locator('[class*="ajusteValor"]').allInnerTexts();
  return textos.map(t => t.replace(/\s+/g, ' ').trim());
}

/** Texto completo de la región viva, sea el resultado o el mensaje de espera. */
async function estado(page: Page): Promise<string> {
  return (await page.locator('[role="status"]').first().innerText())
    .replace(/\s+/g, ' ')
    .trim();
}

test.describe('Sustitución de levadura por masa madre — lo que promete el <h1>', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('🍞 Calculadora de Masa Madre');
  });

  test('CASO 1 (normal) · 15 g de levadura fresca al 100 % = 100 g de masa madre, −50 g harina y −50 g agua', async ({ page }) => {
    // 15 / 3 = 5 g de seca equivalente ; 5 × 20 = 100 g de masa madre
    // harina = round(100 × 100/200) = 50 ; agua = 100 − 50 = 50 ; 50 + 50 = 100 (la suma cuadra)
    await page.getByRole('button', { name: /Levadura fresca/ }).click();
    await ponerGramos(page, '15');
    await ponerHidratacion(page, '100');

    expect(await masaMadre(page)).toBe('100 g');
    expect(await hidratacionAplicada(page)).toBe('100 %');
    expect(await restas(page)).toEqual(['− 50 g', '− 50 g']);
  });

  test('CASO 1 (normal) · la aritmética del panadero: lo que se resta es exactamente lo que el fermento aporta', async ({ page }) => {
    // Receta de partida: 500 g harina + 350 g agua (70 %) + 15 g levadura fresca.
    // Siguiendo a la app: harina añadida 450, agua añadida 300, más 100 g de MM (50 harina + 50 agua).
    // harina TOTAL = 450 + 50 = 500 · agua TOTAL = 300 + 50 = 350 · hidratación = 350/500 = 70 %.
    await page.getByRole('button', { name: /Levadura fresca/ }).click();
    await ponerGramos(page, '15');
    await ponerHidratacion(page, '100');

    const mm = parseInt((await masaMadre(page)).replace(/\D/g, ''), 10);
    const [hRestar, aRestar] = (await restas(page)).map(t => parseInt(t.replace(/\D/g, ''), 10));

    expect(mm).toBe(100);
    expect(hRestar + aRestar).toBe(mm);              // el reparto agota la masa madre, sin sobrantes
    expect(500 - hRestar + hRestar).toBe(500);       // harina total intacta
    expect(350 - aRestar + aRestar).toBe(350);       // agua total intacta
    expect((350 / 500) * 100).toBe(70);              // la hidratación pedida se conserva
    expect(aRestar / hRestar).toBe(1);               // 50/50 = 100 %, la hidratación del fermento
  });

  test('CASO 1 (normal) · los cuatro escenarios del bloque educativo coinciden con el motor al gramo', async ({ page }) => {
    await ponerHidratacion(page, '100');

    // Baguette: 2 g de seca × 20 = 40 g de MM ; 40 × 100/200 = 20 harina ; 40 − 20 = 20 agua
    await page.getByRole('button', { name: /Levadura seca/ }).click();
    await ponerGramos(page, '2');
    expect(await masaMadre(page)).toBe('40 g');
    expect(await restas(page)).toEqual(['− 20 g', '− 20 g']);

    // Pan de molde: 7 × 20 = 140 g de MM ; 70 / 70
    await ponerGramos(page, '7');
    expect(await masaMadre(page)).toBe('140 g');
    expect(await restas(page)).toEqual(['− 70 g', '− 70 g']);

    // Pizza: 5/3 = 1,6667 ; × 20 = 33,33 → 33 g. harina = round(16,5) = 17 ; agua = 33 − 17 = 16
    await page.getByRole('button', { name: /Levadura fresca/ }).click();
    await ponerGramos(page, '5');
    expect(await masaMadre(page)).toBe('33 g');
    expect(await restas(page)).toEqual(['− 17 g', '− 16 g']);

    // Brioche: 10/3 = 3,3333 ; × 20 = 66,67 → 67 g de MM
    await ponerGramos(page, '10');
    expect(await masaMadre(page)).toBe('67 g');

    // Y la coma decimal española en la entrada: 10,5 / 3 = 3,5 ; × 20 = 70 g ; 35 / 35
    await ponerGramos(page, '10,5');
    expect(await masaMadre(page)).toBe('70 g');
    expect(await restas(page)).toEqual(['− 35 g', '− 35 g']);
  });

  test('CASO 2 (límite) · deslizador al 50 % y al 150 %: el reparto cambia, la suma sigue cuadrando', async ({ page }) => {
    await page.getByRole('button', { name: /Levadura seca/ }).click();
    await ponerGramos(page, '3');

    // Desde el 25/08/2026 la DOSIS escala con la hidratación para que la harina prefermentada
    // sea siempre la misma (hallazgo 288): 3 g de seca anclan 30 g de harina.
    //
    // Al 50 %: MM = 30 × 150/100 = 45 ; harina = round(45 × 100/150) = 30 ; agua = 15 → 15/30 = 50 %
    await ponerHidratacion(page, '50');
    expect(await masaMadre(page)).toBe('45 g');
    expect(await hidratacionAplicada(page)).toBe('50 %');
    expect(await restas(page)).toEqual(['− 30 g', '− 15 g']);

    // Al 150 %: MM = 30 × 250/100 = 75 ; harina = round(75 × 100/250) = 30 ; agua = 45 → 45/30 = 150 %
    await ponerHidratacion(page, '150');
    expect(await masaMadre(page)).toBe('75 g');
    expect(await hidratacionAplicada(page)).toBe('150 %');
    expect(await restas(page)).toEqual(['− 30 g', '− 45 g']);

    // En los dos extremos, harina + agua = el total de masa madre (30+15 = 45 ; 30+45 = 75)
    const [h, a] = (await restas(page)).map(t => parseInt(t.replace(/\D/g, ''), 10));
    expect(h + a).toBe(75);
  });

  test('CASO 2 (límite) · el deslizador recorta a 50–150 aunque se fuerce desde el DOM: sin división por cero', async ({ page }) => {
    await page.getByRole('button', { name: /Levadura seca/ }).click();
    await ponerGramos(page, '3');

    await ponerHidratacion(page, '0');               // por debajo del mínimo → el navegador lo sube a 50
    expect(await page.locator('#hidratacion-mm').inputValue()).toBe('50');
    expect(await hidratacionAplicada(page)).toBe('50 %');

    await ponerHidratacion(page, '300');             // por encima del máximo → el navegador lo baja a 150
    expect(await page.locator('#hidratacion-mm').inputValue()).toBe('150');
    expect(await hidratacionAplicada(page)).toBe('150 %');

    const texto = await estado(page);
    expect(texto).not.toMatch(/NaN|Infinity|undefined|−\s*-|-\d/);
  });

  test('CASO 3 (rechazo) · negativo, texto, cero y vacío no producen resultado', async ({ page }) => {
    for (const entrada of ['-5', 'abc', '0', '']) {
      await ponerGramos(page, entrada);
      expect(await estado(page)).toBe(
        'Introduce los gramos de levadura de tu receta original para ver el resultado.',
      );
      await expect(page.locator('[class*="resultValorGrande"]')).toHaveCount(0);
    }
  });

  test('REGRESIÓN 288 · la dosis de masa madre escala con la hidratación del fermento', async ({ page }) => {
    // La app declara «20 g de masa madre activa AL 100 % de hidratación» por gramo de levadura
    // seca. Lo que ancla esa equivalencia es la HARINA PREFERMENTADA —donde vive el fermento—,
    // que en esos 20 g son 10. Para aportar los mismos 10 g de harina hacen falta 15 g de un
    // fermento al 50 % y 25 g de uno al 150 %.
    //
    // Hasta el 25/08/2026 devolvía los mismos 60 g en los tres casos, así que la harina
    // prefermentada que de verdad entraba se desviaba del ancla: 40 g al 50 % (+33 %) y 24 g
    // al 150 % (−20 %) frente a los 30 del 100 %.
    await page.getByRole('button', { name: /Levadura seca/ }).click();
    await ponerGramos(page, '3');

    await ponerHidratacion(page, '50');
    const al50 = await masaMadre(page);
    const restas50 = await restas(page);
    await ponerHidratacion(page, '100');
    const al100 = await masaMadre(page);
    const restas100 = await restas(page);
    await ponerHidratacion(page, '150');
    const al150 = await masaMadre(page);
    const restas150 = await restas(page);

    // 3 g de levadura seca → 30 g de harina prefermentada, y la masa madre sale de ahí:
    //   al 50 %  → 30 × 150/100 = 45 g   al 100 % → 30 × 200/100 = 60 g
    //   al 150 % → 30 × 250/100 = 75 g
    expect([al50, al100, al150]).toEqual(['45 g', '60 g', '75 g']);

    // Y lo que de verdad importa: la harina prefermentada es LA MISMA en los tres.
    expect(restas50[0], 'harina al 50 %').toBe('− 30 g');
    expect(restas100[0], 'harina al 100 %').toBe('− 30 g');
    expect(restas150[0], 'harina al 150 %').toBe('− 30 g');
    // El agua sí cambia: es lo único que distingue una hidratación de otra.
    expect([restas50[1], restas100[1], restas150[1]]).toEqual(['− 15 g', '− 30 g', '− 45 g']);
  });

  test('REGRESIÓN 289 · los gramos salen con separador de millar', async ({ page }) => {
    // 500 g de levadura seca → 5.000 g de harina prefermentada, y al 100 % de hidratación
    // eso son 10.000 g de masa madre: 5.000 de harina y 5.000 de agua.
    // El formato español obligatorio (CLAUDE.md §2) pide «10.000 g», no el número crudo.
    await page.getByRole('button', { name: /Levadura seca/ }).click();
    await ponerHidratacion(page, '100');
    await ponerGramos(page, '500');
    expect(await masaMadre(page)).toBe('10.000 g');
    // Sin punto en las restas, y no es un descuido: es-ES NO agrupa los millares de un número
    // de CUATRO cifras y sí los de cinco o más, así que «5000» y «10.000» son ambos correctos.
    expect(await restas(page)).toEqual(['− 5000 g', '− 5000 g']);

    // Y la nota escribe el espacio antes de la unidad, como las dos fichas de al lado: antes
    // decía «5000g» pegado mientras las fichas ponían «- 5000 g».
    await expect(page.locator('[class*="notaBox"]')).toContainText('5000 g de harina');
  });

  test('REGRESIÓN 290 · el parseo rechaza la basura y lee bien el millar español', async ({ page }) => {
    await page.getByRole('button', { name: /Levadura seca/ }).click();
    await ponerHidratacion(page, '100');

    // Lo que no es un número se rechaza y no produce resultado. Antes «12abc» daba 240 g,
    // «1e3» daba 20.000 g y «10.5.3» daba 210 g, porque `parseFloat` se queda con el prefijo.
    for (const basura of ['12abc', '1e3', '10.5.3']) {
      await ponerGramos(page, basura);
      await expect(
        page.locator('[class*="resultValorGrande"]'),
        `«${basura}» no debería producir un resultado`,
      ).toHaveCount(0);
    }

    // Y el millar español se lee como millar: «1.500» es mil quinientos, no 1,5.
    await ponerGramos(page, '1.500');
    expect(await masaMadre(page)).toBe('30.000 g');

    // La coma decimal sigue funcionando, que es lo que la mayoría escribe.
    await ponerGramos(page, '10,5');
    expect(await masaMadre(page)).toBe('210 g');
  });

  test('REGRESIÓN 291 · una cantidad minúscula avisa en vez de devolver 0 g como respuesta', async ({ page }) => {
    // 0,05 g de levadura fresca / 3 = 0,01667 de seca ; × 10 de harina prefermentada = 0,167 ;
    // al 100 % son 0,33 g de masa madre, que redondean a 0. Presentar «Masa madre: 0 g» con
    // sus restas de «− 0 g» era dar por buena una respuesta que no lo es.
    await page.getByRole('button', { name: /Levadura fresca/ }).click();
    await ponerHidratacion(page, '100');
    await ponerGramos(page, '0,05');

    await expect(page.locator('[class*="resultValorGrande"]')).toHaveCount(0);
    // Por su clase, no por `getByRole('alert')`: en la página hay otros dos role="alert" que
    // no son de la app —el aviso legal y el `__next-route-announcer__` de Next, que además va
    // vacío—, y el segundo se cuela con `.last()`.
    await expect(page.locator('[class*="equivalenciasBox"][role="alert"]')).toContainText(
      'demasiado pequeña',
    );
  });

  test('REGRESIÓN 292 · los botones de tipo de levadura llevan type="button"', async ({ page }) => {
    const tipos = page.locator('[class*="tipoBtn"]');
    await expect(tipos).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      expect(await tipos.nth(i).getAttribute('type'), `botón ${i}`).toBe('button');
      // El aria-pressed ya estaba bien puesto: son conmutadores, no botones de acción.
      expect(await tipos.nth(i).getAttribute('aria-pressed')).not.toBeNull();
    }
  });
});
