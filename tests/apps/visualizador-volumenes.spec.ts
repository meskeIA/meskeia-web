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
 * Los hallazgos del acta del 20/08/2026 —etiquetas del dibujo en formato inglés (r=12.5),
 * fórmula redondeada a 2 decimales mientras el cálculo usaba todas, entrada inválida
 * ignorada sin avisar, relleno del deslizador clavado al 50 % y, en móvil, control y
 * resultado bajo el pliegue— se repararon el 21/08/2026 y ya SÍ se afirman aquí, cada uno
 * en su bloque de regresión.
 *
 * RE-INSPECCIÓN del 30/08/2026 (la cola marcó la app «invalidada» porque su código había
 * cambiado): tres casos nuevos resueltos a mano, sin dar por bueno nada de lo anterior, en
 * el bloque del final del fichero, junto a los hallazgos que esa re-inspección deja
 * abiertos —esos últimos escritos contra lo que DEBERÍA ocurrir, así que hoy fallan.
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
    await page.getByRole('button', { name: /Ortoedro|Paralelepípedo|Prisma|Cubo/ }).first().click();
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

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 30/08/2026 — tres casos NUEVOS resueltos a mano
// ═══════════════════════════════════════════════════════════════════════════
/**
 * La cola marcó la app «invalidada» (su código cambió tras la inspección del 14/08/2026),
 * así que estos tres casos se plantearon desde cero, con fórmulas geométricas estándar y
 * sin reutilizar ninguna cifra de los bloques de arriba.
 *
 *   CASO 1 (normal) — CILINDRO r = 12,5 · h = 20, tecleado en el campo:
 *       r² = 156,25 · ×20 = 3.125 · ×π = 9.817,477042468103
 *       tramo [100, 100.000) → 1 decimal → «9817,5» (es-ES no agrupa cuatro cifras)
 *     Y los cinco valores de arranque, que son los que promete la tabla educativa:
 *       esfera   r=5      (4/3)·π·125    = 523,5987755982989  → «523,6»
 *       cubo     6×4×5                   = 120                → «120,0»
 *       cilindro r=4 h=8  π·16·8         = 402,1238596594935  → «402,1»
 *       cono     r=4 h=10 (1/3)·π·16·10  = 167,55160819145562 → «167,6»
 *       pirámide l=6 h=8  (1/3)·36·8     = 96                 → «96,00»
 *     Y la relación 2/3 de Arquímedes, que la app enuncia en su FAQ:
 *       cilindro r=5 h=10 = π·25·10 = 785,3981633974483 → «785,4»
 *       785,3981634 × 2/3 = 523,5987756 = la esfera de r=5 ✔
 *
 *   CASO 2 (límite) — medidas que el deslizador no alcanza, para ver si su tope contamina
 *   el cálculo, y proporciones extremas para ver si el dibujo se sale del lienzo:
 *       cubo 100.000³ = 1e15 → «1.000.000.000.000.000» (ni ∞ ni notación científica)
 *       cilindro r=100.000 h=1 → π × 1e10 = 31.415.926.535,89793 → «31.415.926.536»
 *
 *   CASO 3 (rechazo) — «12abc»: parseSpanishNumber ya no acepta prefijos numéricos, así
 *   que devuelve NaN. Si lo leyera como 12, el volumen sería (4/3)·π·1.728 = 7.238,2; debe
 *   quedarse en los 523,6 de r=5 y decir por qué.
 */
test.describe('re-inspección 30/08/2026', () => {
  test('CASO 1 · cilindro r=12,5 h=20 → 9817,5, y los cinco valores de arranque', async ({ page }) => {
    await elegirFigura(page, /Cilindro/);
    await campo(page, 'Radio (r)').fill('12,5');
    await campo(page, 'Altura (h)').fill('20');
    // π · 12,5² · 20 = 3.125 π = 9.817,477042468103 → un decimal
    await expect(valorVolumen(page)).toHaveText('9817,5');
    await expect(formulaAplicada(page)).toHaveText('V = π × r² × h = π × 12,5² × 20');
    await expect(dibujo(page).locator('text').first()).toHaveText('r=12,5');

    // Los cinco valores de arranque, uno por figura, contra la tabla de la guía
    await page.reload();
    await expect(valorVolumen(page)).toHaveText('523,6'); // esfera r=5
    await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 5³');
    await elegirFigura(page, /Ortoedro/);
    await expect(valorVolumen(page)).toHaveText('120,0'); // 6 × 4 × 5
    await expect(formulaAplicada(page)).toHaveText('V = a × b × h = 6 × 4 × 5');
    await elegirFigura(page, /Cilindro/);
    await expect(valorVolumen(page)).toHaveText('402,1'); // π·16·8
    await elegirFigura(page, /Cono/);
    await expect(valorVolumen(page)).toHaveText('167,6'); // (1/3)·π·16·10
    await elegirFigura(page, /Pirámide/);
    await expect(valorVolumen(page)).toHaveText('96,00'); // (1/3)·36·8, exacto
    await expect(formulaAplicada(page)).toHaveText('V = (1/3) × l² × h = (1/3) × 6² × 8');
  });

  test('CASO 1.bis · la esfera es 2/3 del cilindro que la circunscribe', async ({ page }) => {
    await elegirFigura(page, /Cilindro/);
    await campo(page, 'Radio (r)').fill('5');
    await campo(page, 'Altura (h)').fill('10');
    await expect(valorVolumen(page)).toHaveText('785,4'); // π·25·10 = 785,3981634
    await elegirFigura(page, /Esfera/);
    await campo(page, 'Radio (r)').fill('5');
    await expect(valorVolumen(page)).toHaveText('523,6'); // = 785,3981634 × 2/3
  });

  test('CASO 2 · el tope del deslizador no contamina el cálculo ni el dibujo', async ({ page }) => {
    // Cubo de 100.000 de arista: 1e15, sin ∞ ni notación científica
    await elegirFigura(page, /Ortoedro/);
    await campo(page, 'Anchura (a)').fill('100000');
    await campo(page, 'Profundidad (b)').fill('100000');
    await campo(page, 'Altura (h)').fill('100000');
    await expect(valorVolumen(page)).toHaveText('1.000.000.000.000.000');

    // Cilindro plano y enorme: π × 100.000² × 1 = 31.415.926.535,89793
    await elegirFigura(page, /Cilindro/);
    await campo(page, 'Radio (r)').fill('100000');
    await campo(page, 'Altura (h)').fill('1');
    await expect(valorVolumen(page)).toHaveText('31.415.926.536');

    // Y con esa proporción extrema el dibujo sigue dentro del viewBox «0 0 300 290»
    const caja = await dibujo(page).evaluate((svg: SVGSVGElement) => {
      const b = svg.getBBox();
      return { x: b.x, y: b.y, x2: b.x + b.width, y2: b.y + b.height };
    });
    expect(caja.x).toBeGreaterThanOrEqual(0);
    expect(caja.y).toBeGreaterThanOrEqual(0);
    expect(caja.x2).toBeLessThanOrEqual(300);
    expect(caja.y2).toBeLessThanOrEqual(290);
  });

  test('CASO 3 · «12abc» se rechaza entero, no se lee como 12', async ({ page }) => {
    const radio = campo(page, 'Radio (r)');
    // El aviso de la app, no el route announcer de Next, que también es role="alert"
    const aviso = page.locator('p[role="alert"]');
    await expect(valorVolumen(page)).toHaveText('523,6');

    await radio.fill('12abc');
    await expect(aviso).toHaveText(
      'Escribe un número: se sigue calculando con la última medida válida.',
    );
    await expect(radio).toHaveAttribute('aria-invalid', 'true');
    await expect(valorVolumen(page)).toHaveText('523,6');
    // Si lo hubiera leído como 12 saldría (4/3)·π·12³ = 7.238,2. No puede salir.
    await expect(valorVolumen(page)).not.toHaveText('7238,2');
    await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 5³');

    // Por encima del tope del campo (100.000) también se avisa
    await radio.fill('100001');
    await expect(aviso).toHaveText(
      'La medida debe estar entre 0 y 100.000: se sigue calculando con la última válida.',
    );
    await expect(valorVolumen(page)).toHaveText('523,6');

    // Y una medida válida limpia el aviso y mueve el resultado:
    // (4/3)·π·10³ = 4.188,790204786391 → un decimal → «4188,8»
    await radio.fill('10');
    await expect(aviso).toHaveCount(0);
    await expect(valorVolumen(page)).toHaveText('4188,8');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS de la re-inspección del 30/08/2026 — FALLAN a propósito
// ═══════════════════════════════════════════════════════════════════════════

// HALLAZGO (cálculo/operativa, medio) — Por debajo de 0,0001 la app deja de dar resultado y
// dice «≈0». formatNumber() devuelve «≈0» para todo |v| < 0,0001 y formatVolumen() lo llama
// sin más, pero medExacta() TAMBIÉN, así que el defecto sale por tres sitios: el volumen, la
// caja «Fórmula aplicada» —que llega a mostrar «V = (4/3) × π × ≈0³», que ya no es una
// fórmula— y la etiqueta del dibujo, que rotula «r=≈0». El campo acepta esas medidas sin
// ningún aviso (solo rechaza ≤ 0 y > 100.000): la app admite la entrada y luego no responde.
// Y es su propio bloque educativo el que lleva a ese caso: la tarjeta «Ciencias y
// laboratorio» propone «Célula esférica: r=0,01mm → V=4,19×10⁻⁶ mm³ → 4,19 picolitros»,
// que es exactamente lo que la herramienta contesta con «≈0». Le pasa igual a quien mida en
// metros algo pequeño: un cucurucho de r=0,03 y h=0,05 da 4,7×10⁻⁵ → «≈0».
// Caso: esfera r=0,01 → esperado 4,188790×10⁻⁶ (o su notación científica) · obtenido «≈0»,
//       y con r=0,00005 la fórmula muestra «(4/3) × π × ≈0³» y el dibujo «r=≈0».
test('518 (reparado) · un volumen diminuto ya se muestra en notación científica, no «≈0»', async ({ page }) => {
  await campo(page, 'Radio (r)').fill('0,01');
  // (4/3)·π·0,01³ = 4,1887902047863905e-6
  await expect(valorVolumen(page)).not.toHaveText('≈0');
  await expect(valorVolumen(page)).toContainText(/[1-9]/);

  // Y la medida nunca puede llegar a la fórmula ni al dibujo convertida en «≈0»
  await campo(page, 'Radio (r)').fill('0,00005');
  await expect(formulaAplicada(page)).not.toContainText('≈0');
  await expect(dibujo(page).locator('text').first()).not.toContainText('≈0');
});

// HALLAZGO (contenido, bajo) — La guía «Cómo usar el visualizador» se quedó desfasada tras
// la reparación del 19-21/08/2026: el campo de medida exacta —única vía para r=12,5 o r=120,
// y lo que convierte la app en una herramienta de medir y no solo de explorar— no se
// menciona en ningún texto. El paso 2 dice «Mueve los sliders del panel derecho para cambiar
// el radio, altura o lado» y el paso 3 «El resultado se actualiza instantáneamente al mover
// cualquier slider»; el subtítulo del hero, la metadata y el JSON-LD hablan también solo de
// sliders. Quien lea la guía concluye que la herramienta llega hasta 50 y avanza de 0,5 en
// 0,5, que es justo la limitación que la reparación levantó.
// Caso: abrir la guía y buscar cualquier mención al campo → esperado ≥ 1 · obtenido 0.
test('519 (reparado) · la guía de uso ya explica el campo de medida exacta', async ({ page }) => {
  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const guia = page.locator('section').filter({ hasText: 'Cómo usar el visualizador' }).first();
  const texto = (await guia.textContent()) ?? '';
  expect(texto).toMatch(/escrib|teclea|campo|casilla/i);
});

// HALLAZGO (contenido, bajo) — Anglicismos sin traducir en el texto docente de una app en
// español (CLAUDE.md §1). El recuadro de errores frecuentes titula uno «Usar la altura slant
// en vez de la altura perpendicular», cuando el término español es el que el propio párrafo
// cita dos líneas después: generatriz (cono) o apotema lateral (pirámide). Un estudiante
// hispanohablante no reconoce «altura slant», que es «slant height» a medio traducir. En la
// misma línea, toda la prosa dice «slider» mientras el aria-label del control dice «control
// deslizante»: la app llama de dos maneras a su propio mando.
// Caso: texto visible de la página → esperado sin «slant» · obtenido «la altura slant».
test('520 (reparado) · el texto docente ya no deja «slant» sin traducir', async ({ page }) => {
  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const cuerpo = (await page.locator('body').textContent()) ?? '';
  expect(cuerpo).not.toMatch(/\bslant\b/i);
});

// HALLAZGO (contenido, bajo) — La figura de la caja se llama «Paralelepípedo» y su fila de
// la tabla enuncia V = a × b × h. Un paralelepípedo es cualquier prisma de bases
// paralelogramos, oblicuos incluidos, y ahí esa fórmula NO vale: el volumen es el área de la
// base por la altura PERPENDICULAR, no el producto de las tres aristas. Lo que la app dibuja
// y calcula es un ORTOEDRO (prisma rectangular). La metadata, además, lo llama por un tercer
// nombre —«cubo»—, que solo es exacto cuando a = b = h. En una app cuyo recuadro final trata
// precisamente de los errores frecuentes de geometría, el nombre debería ser el exacto.
// Caso: fila de la tabla con V = a × b × h → esperado «ortoedro» o «paralelepípedo recto» ·
//       obtenido «📦 Paralelepípedo» a secas.
test('521 (reparado) · la caja ya se nombra con el término geométrico exacto (ortoedro)', async ({ page }) => {
  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const fila = page.getByRole('row').filter({ hasText: 'V = a × b × h' });
  await expect(fila).toContainText(/ortoedro|prisma rectangular|paralelep[íi]pedo recto/i);
});
