/**
 * Test de regresión — /visualizador-volumenes/
 *
 * Qué promete la app (h1 + subtítulo + metadata): «Selecciona una figura, ajusta las
 * dimensiones y observa cómo cambia el volumen en tiempo real». Contra eso se mide todo
 * lo de aquí abajo: que el número sea el correcto, que salga en formato español y que la
 * figura dibujada REACCIONE de verdad a la medida (se comprueba el atributo del SVG, no
 * que el elemento exista).
 *
 * Los tres casos están resueltos A MANO antes de ejecutarse; la aritmética va escrita en
 * el encabezado de cada bloque. Ninguna cifra esperada se ha copiado de la app.
 *
 * CONTROLES (tras la reparación del 19/08/2026): cada medida tiene DOS entradas
 * sincronizadas — un campo de texto que admite coma decimal (hasta 100.000) y un
 * deslizador de 1 a 50 con paso 0,5. El campo es el que permite medir de verdad:
 * r=12,5 y r=120 no caben en el deslizador.
 *
 * FORMATO DEL RESULTADO (`formatVolumen`): <10 → 4 decimales · <100 → 2 · <100.000 → 1 ·
 * resto → 0. Y `es-ES` NO agrupa los números de cuatro cifras: 8181,2 va sin punto de
 * miles, 7.238.229 sí lo lleva.
 *
 * HALLAZGOS ABIERTOS del acta del 20/08/2026, deliberadamente NO afirmados aquí para que
 * el spec siga en verde hasta que se reparen: las etiquetas del dibujo escriben la medida
 * en formato inglés (r=12.5); la fórmula redondea la medida a 2 decimales aunque calcule
 * con todas; una entrada inválida se ignora sin avisar; el relleno del deslizador está
 * clavado al 50 %; y en móvil el control y el resultado nacen bajo el pliegue.
 */

import { test, expect, type Page } from '@playwright/test';

const RESULTADO = '[aria-label="Resultado del volumen"]';

/** Valor numérico de la tarjeta de resultado (2º span: etiqueta, valor, unidad). */
const valorVolumen = (page: Page) => page.locator(RESULTADO).locator('span').nth(1);

/** Fórmula aplicada: es el primer <code> del DOM (va antes del bloque educativo). */
const formulaAplicada = (page: Page) => page.locator('code').first();

/** El SVG de la figura, para no confundirlo con el del logotipo de meskeIA. */
const dibujo = (page: Page) => page.locator('svg[role="img"]');

/** Campo de texto de una medida (el deslizador tiene otro nombre accesible). */
const campo = (page: Page, medida: string) => page.getByLabel(`${medida}, medida exacta`);

async function elegirFigura(page: Page, nombre: RegExp) {
  const boton = page.getByRole('button', { name: nombre }).first();
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/** Lee un atributo numérico del SVG (r, rx…) para comprobar que el dibujo reacciona. */
async function atributoSvg(page: Page, selector: string, atributo: string): Promise<number> {
  const valor = await dibujo(page).locator(selector).getAttribute(atributo);
  return Number(valor);
}

/**
 * Mueve el deslizador como lo haría el navegador.
 * El setter nativo RECORTA a [min, max]: eso es justo lo que mide el caso 3.
 */
async function ponerDeslizador(page: Page, indice: number, valor: number) {
  await page.locator('input[type=range]').nth(indice).evaluate((elemento, v) => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )!.set!;
    setter.call(elemento, String(v));
    elemento.dispatchEvent(new Event('input', { bubbles: true }));
  }, valor);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/visualizador-volumenes/');
  await expect(page.locator('h1')).toContainText('Visualizador de Volúmenes 3D');
});

// ============================================================
// CASO 1 — NORMAL · Cilindro r=4 h=8, y el cono equivalente
// ============================================================
/**
 *   V = π · r² · h = π · 4² · 8 = 128 π
 *     100 π = 314,159265359
 *      28 π =  87,964594300
 *     ------------------------
 *     128 π = 402,123859659      → tramo [100, 100.000) → 1 decimal → «402,1»
 *
 *   Subiendo el radio a 8 (misma altura):
 *     V = π · 64 · 8 = 512 π = 1.608,495438…  → «1608,5» (es-ES no agrupa 4 cifras)
 *
 *   El cono de la misma base y altura debe valer exactamente un tercio, que es la
 *   relación que el bloque educativo invita a comprobar:
 *     128 π / 3 = 134,041286553…  → «134,0»
 *
 *   DIBUJO. La base del cilindro es la 2ª elipse del SVG (la 1ª es la sombra) y su
 *   semieje mayor vale rx = r · s, con s = min(105/2r, 115/(h+0,76r), 13):
 *     r=4, h=8 → s = min(13,125 · 10,4166 · 13) = 10,41666…  → rx = 41,6666…
 *     r=8, h=8 → s = min( 6,5625 ·  8,1676 · 13) =  6,5625   → rx = 52,5
 */
test('caso normal: cilindro r=4 h=8 → 402,1, y el dibujo cambia al subir el radio', async ({ page }) => {
  await elegirFigura(page, /Cilindro/);

  await expect(valorVolumen(page)).toHaveText('402,1');
  await expect(page.locator(RESULTADO)).toContainText('unidades³');
  await expect(formulaAplicada(page)).toHaveText('V = π × r² × h = π × 4² × 8');
  expect(await atributoSvg(page, 'ellipse >> nth=1', 'rx')).toBeCloseTo(41.6667, 3);

  // Duplicar el radio cuadruplica el volumen (402,1 × 4 = 1.608,5) y redibuja la base.
  await campo(page, 'Radio (r)').fill('8');
  await expect(valorVolumen(page)).toHaveText('1608,5');
  await expect(formulaAplicada(page)).toHaveText('V = π × r² × h = π × 8² × 8');
  expect(await atributoSvg(page, 'ellipse >> nth=1', 'rx')).toBeCloseTo(52.5, 3);

  // Un tercio exacto con la misma base y altura.
  await elegirFigura(page, /Cono/);
  await campo(page, 'Radio de la base (r)').fill('4');
  await campo(page, 'Altura (h)').fill('8');
  await expect(valorVolumen(page)).toHaveText('134,0');
  await expect(formulaAplicada(page)).toHaveText('V = (1/3) × π × r² × h = (1/3) × π × 4² × 8');
});

// ============================================================
// CASO 2 — LÍMITE · Esfera de r=12,5 (decimal) y r=120 (fuera del deslizador)
// ============================================================
/**
 *   r = 12,5   →  12,5³ = 1.953,125
 *                 V = 4,18879020479 × 1.953,125
 *                   = 8.377,58040958 − 196,349540849   (= ×2000 − ×46,875)
 *                   = 8.181,23086873       → tramo [100, 100.000) → «8181,2»
 *
 *   r = 120    →  120³ = 1.728.000
 *                 V = 4,18879020479 × 1.728.000 = 7.238.229,47387
 *                                        → tramo ≥ 100.000 → 0 decimales → «7.238.229»
 *                 El deslizador solo llega a 50: debe quedarse en su tope y avisar de
 *                 que la medida se ha salido de su recorrido, sin tocar el cálculo.
 *
 *   DIBUJO (reparación del 19/08/2026). El radio en píxeles de la esfera es
 *   12 + 60 · √(r/50), continuo en todo el recorrido del deslizador:
 *       r=1    → 12 + 60·0,141421 = 20,485281…
 *       r=6    → 12 + 60·0,346410 = 32,784609…
 *       r=12,5 → 12 + 60·0,5      = 42          (exacto)
 *       r=25   → 12 + 60·0,707107 = 54,426407…
 *       r=50   → 12 + 60·1        = 72
 *   Antes de la reparación se quedaba clavado en 72 px desde r=6.
 */
test('caso límite: esfera r=12,5 → 8181,2 y r=120 → 7.238.229', async ({ page }) => {
  await elegirFigura(page, /Esfera/);
  const radio = campo(page, 'Radio (r)');
  const deslizador = page.locator('input[type=range]').first();

  // El campo admite coma decimal y conserva lo tecleado mientras se escribe.
  await radio.fill('12,5');
  await expect(radio).toHaveValue('12,5');
  await expect(valorVolumen(page)).toHaveText('8181,2');
  // La fórmula muestra la medida TAL COMO entra en el cálculo, sin rellenar ni recortar
  // decimales: antes usaba dos fijos mientras el volumen se calculaba con el valor
  // completo, así que rehacer a mano la operación que la app enseña no daba su resultado.
  await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 12,5³');
  expect(await atributoSvg(page, 'circle', 'r')).toBeCloseTo(42, 6);
  await expect(deslizador).toHaveValue('12.5');

  // Una medida real que no cabe en el deslizador: se calcula igual y se avisa.
  await radio.fill('120');
  await expect(valorVolumen(page)).toHaveText('7.238.229');
  await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 120³');
  await expect(deslizador).toHaveValue('50');
  await expect(page.getByText('120 · fuera del deslizador')).toBeVisible();

  // El dibujo responde en TODO el recorrido del deslizador, no solo al principio.
  const pixeles: number[] = [];
  for (const medida of ['1', '6', '25', '50']) {
    await radio.fill(medida);
    pixeles.push(await atributoSvg(page, 'circle', 'r'));
  }
  expect(pixeles[0]).toBeCloseTo(20.4853, 3);
  expect(pixeles[1]).toBeCloseTo(32.7846, 3);
  expect(pixeles[2]).toBeCloseTo(54.4264, 3);
  expect(pixeles[3]).toBeCloseTo(72, 6);
  for (let i = 1; i < pixeles.length; i++) expect(pixeles[i]).toBeGreaterThan(pixeles[i - 1]);
});

// ============================================================
// CASO 3 — DEBE RECHAZARSE · negativo, texto, vacío y cero
// ============================================================
/**
 *   Ninguna de estas entradas es una medida: un volumen negativo, nulo o «No definido»
 *   sería un resultado falso presentado como bueno. La app debe seguir calculando con la
 *   última medida válida —r=5— y decirlo en la fórmula:
 *       V = (4/3) · π · 5³ = 4,18879020479 × 125 = 523,598775598  → «523,6»
 *
 *   Por el deslizador tampoco: declara min=1 / max=50, así que un 0, un −20 o un 100
 *   quedan recortados antes de llegar al cálculo.
 *       recortado a 1  → V = (4/3)π = 4,188790205  → tramo <10 → 4 decimales → «4,1888»
 *       recortado a 50 → V = 500.000π/3 = 523.598,775598          → «523.599»
 */
test('caso a rechazar: negativo, texto, vacío y cero no producen un volumen', async ({ page }) => {
  await elegirFigura(page, /Esfera/);
  const radio = campo(page, 'Radio (r)');

  await radio.fill('5');
  await expect(valorVolumen(page)).toHaveText('523,6');

  for (const entradaMala of ['-5', 'abc', '', '0', '0,0', '-0,001']) {
    await radio.fill(entradaMala);
    // Ni resultado degenerado ni cálculo con la basura tecleada: sigue el último válido.
    await expect(valorVolumen(page)).toHaveText('523,6');
    await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 5³');
  }

  // Y se recupera en cuanto se vuelve a escribir una medida.
  await radio.fill('12,5');
  await expect(valorVolumen(page)).toHaveText('8181,2');

  // El deslizador recorta a su rango declarado.
  const deslizador = page.locator('input[type=range]').first();
  await ponerDeslizador(page, 0, 0);
  await expect(deslizador).toHaveValue('1');
  await expect(valorVolumen(page)).toHaveText('4,1888');

  await ponerDeslizador(page, 0, -20);
  await expect(deslizador).toHaveValue('1');
  await expect(valorVolumen(page)).toHaveText('4,1888');

  await ponerDeslizador(page, 0, 100);
  await expect(deslizador).toHaveValue('50');
  await expect(valorVolumen(page)).toHaveText('523.599');

  // Ni con el teclado se baja del mínimo.
  await ponerDeslizador(page, 0, 1);
  await deslizador.focus();
  await deslizador.press('ArrowLeft');
  await deslizador.press('ArrowLeft');
  await expect(deslizador).toHaveValue('1');

  const mostrado = await valorVolumen(page).innerText();
  expect(mostrado).not.toMatch(/No definido|∞|NaN|^-|^0,0+$/);
});

// ============================================================
// Reparaciones anteriores que no deben volver atrás (lote del 18/08/2026)
// ============================================================
test.describe('visualizador-volumenes — regresiones ya reparadas', () => {
  test('cada medida tiene su etiqueta asociada a un control', async ({ page }) => {
    await elegirFigura(page, /Cilindro/);
    await expect(page.locator('label:not([for])')).toHaveCount(0);
    expect(await page.locator('input[type=range][id]').count()).toBeGreaterThan(0);
  });

  test('el ejemplo de biología da picolitros, no femtolitros', async ({ page }) => {
    // r = 0,01 mm → V = (4/3)·π·10⁻⁶ = 4,19×10⁻⁶ mm³. Como 1 mm³ = 10⁻⁶ L, son
    // 4,19×10⁻¹² L = 4,19 picolitros (= 4.188,8 fL), no 4,19 femtolitros.
    await expect(page.locator('body')).toContainText('4,19 picolitros');
    await expect(page.locator('body')).not.toContainText('4,19 femtolitros');
  });

  test('los datos estructurados no prometen ni afirman lo que la app desmiente', async ({ page }) => {
    const jsonLd = (await page.locator('script[type="application/ld+json"]').allInnerTexts()).join(' ');
    // La app no tiene selector de unidades: el resultado sale como «unidades³».
    expect(jsonLd).not.toContain('Resultado en m³ y cm³');
    // El JSON-LD decía «esfera» donde la FAQ visible de la misma página dice «disco bicóncavo».
    expect(jsonLd).toContain('disco bicóncavo');
    expect(jsonLd).not.toMatch(/glóbulos rojos adoptan formas próximas a la esfera/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// REGRESIONES — los seis hallazgos del 20/08/2026, reparados el 21/08/2026
// ═══════════════════════════════════════════════════════════════════════════

test.describe('visualizador-volumenes — regresiones del 21/08/2026', () => {
  // Las etiquetas dibujadas sobre la figura interpolaban el number crudo y salían en
  // formato inglés («r=12.5») en la misma pantalla en la que el campo escribía «12,5».
  test('las etiquetas del dibujo usan la coma decimal española', async ({ page }) => {
    await page.locator('input[type=text]').first().fill('12,5');
    await expect(page.locator('svg text').filter({ hasText: /^r=/ })).toHaveText('r=12,5');

    // Y en las otras figuras, que tienen sus propias etiquetas
    await page.getByRole('button', { name: /Paralelepípedo|Prisma|Cubo/ }).first().click();
    await page.locator('input[type=text]').first().fill('2,5');
    await expect(page.locator('svg text').filter({ hasText: /^a=/ })).toHaveText('a=2,5');
  });

  // El relleno del deslizador estaba clavado al 50 %: el CSS lo pinta con
  // var(--slider-pct, 50%) y esa variable no se fijaba nunca en esta página.
  test('la barra del deslizador se rellena según el valor, no clavada al 50 %', async ({ page }) => {
    const deslizador = page.locator('input[type=range]').first();
    const pct = async () =>
      deslizador.evaluate((el) => el.style.getPropertyValue('--slider-pct'));

    await ponerDeslizador(page, 0, 1); // extremo izquierdo del rango (min = 1)
    expect(await pct()).toBe('0%');

    await ponerDeslizador(page, 0, 50); // extremo derecho (max = 50)
    expect(await pct()).toBe('100%');
  });

  // Una entrada inválida se ignoraba en silencio: el texto malo se quedaba escrito
  // mientras la app seguía calculando con la última medida válida.
  test('una medida inválida se avisa en vez de ignorarse', async ({ page }) => {
    const campo = page.locator('input[type=text]').first();
    await campo.fill('no es un número');
    await expect(page.getByRole('alert').filter({ hasText: 'Escribe un número' })).toBeVisible();
    await expect(campo).toHaveAttribute('aria-invalid', 'true');

    // Y al escribir algo válido, el aviso desaparece
    await campo.fill('7');
    await expect(page.getByRole('alert').filter({ hasText: 'Escribe un número' })).toHaveCount(0);
    await expect(campo).toHaveAttribute('aria-invalid', 'false');
  });

  // Por arriba sí avisaba («120 · fuera del deslizador») y por abajo no: el deslizador
  // marcaba el mínimo y el pie seguía anunciando el rango normal.
  test('por debajo del mínimo se avisa igual que por encima del máximo', async ({ page }) => {
    const limites = page.locator('[class*=sliderLimits]').first();
    const campo = page.locator('input[type=text]').first();

    await campo.fill('0,5');
    await expect(limites).toContainText('fuera del deslizador');

    await campo.fill('120');
    await expect(limites).toContainText('120 · fuera del deslizador');

    await campo.fill('25');
    await expect(limites).not.toContainText('fuera del deslizador');
  });
});

// En móvil la herramienta entera nacía por debajo del pliegue: la primera pantalla solo
// mostraba logo, hero, aviso legal, selector de figuras y el borde superior del dibujo,
// con el primer deslizador a 1.034 px y el resultado a 1.092 px (iPhone 14). Es la
// explicación medida de los 27,7 s de estancia, y contradice el subtítulo de la app.
test.describe('en móvil (iPhone 14)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('al menos un control y el resultado entran sin hacer scroll', async ({ page }) => {
    const alto = 844;
    const y = async (selector: string) => {
      const caja = await page.locator(selector).first().boundingBox();
      return caja ? caja.y : Number.POSITIVE_INFINITY;
    };
    expect(await y('input[type=range]')).toBeLessThan(alto);
    expect(await y('[class*=resultCard]')).toBeLessThan(alto);
  });
});
