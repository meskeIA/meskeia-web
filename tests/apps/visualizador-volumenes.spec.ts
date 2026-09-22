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

import { test, expect, type Locator, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';

const RESULTADO = '[aria-label="Resultado del volumen"]';

/** Valor numérico de la tarjeta de resultado (2º span: etiqueta, valor, unidad). */
const valorVolumen = (page: Page) => page.locator(RESULTADO).locator('span').nth(1);

/** Fórmula aplicada: es el primer <code> del DOM (va antes del bloque educativo). */
const formulaAplicada = (page: Page) => page.locator('code').first();

/** El SVG de la figura, para no confundirlo con el del logotipo de meskeIA. */
const dibujo = (page: Page) => page.locator('svg[role="img"]');

/** Campo de texto de una medida (el deslizador tiene otro nombre accesible). */
const campo = (page: Page, medida: string) => page.getByLabel(`${medida}, medida exacta`);

/**
 * Selecciona una figura. Si la pedida ya es la activa —la app arranca en «Esfera»— pasa antes
 * por otra: hacer clic en el botón que ya está pulsado no prueba nada, porque su aria-pressed
 * valdría «true» igual aunque el clic se hubiera perdido por llegar antes de la hidratación.
 */
async function elegirFigura(page: Page, nombre: RegExp) {
  const boton = page.getByRole('button', { name: nombre }).first();
  if ((await boton.getAttribute('aria-pressed')) === 'true') {
    const otra = page.locator('[class*="figBtn"][aria-pressed="false"]').first();
    await otra.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'false');
  }
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/** Escribe una medida en el campo de texto y comprueba que llegó al estado de React. */
async function escribir(campoLoc: Locator, valor: string): Promise<void> {
  await campoLoc.fill(valor);
  await esperarValorEnReact(campoLoc.page(), campoLoc, valor);
}

/** Lee un atributo numérico del SVG (r, rx…) para comprobar que el dibujo reacciona. */
async function atributoSvg(page: Page, selector: string, atributo: string): Promise<number> {
  const valor = await dibujo(page).locator(selector).getAttribute(atributo);
  return Number(valor);
}

/**
 * Mueve el deslizador como lo haría el navegador. El setter nativo RECORTA a [min, max]: eso
 * es justo lo que mide el caso 3, y por eso hay que decir en `esperado` dónde acaba el valor
 * cuando no es el pedido. Los deslizadores no llevan id (`useId` los genera), así que se
 * localizan por posición.
 */
async function ponerDeslizador(page: Page, indice: number, valor: number, esperado = valor) {
  await sembrarValor(page, page.locator('input[type=range]').nth(indice), valor, { esperado });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/visualizador-volumenes/');
  await expect(page.locator('h1')).toContainText('Visualizador de Volúmenes 3D');
  // El <h1> viaja en el HTML servido: un clic o un `fill()` anterior a la hidratación se
  // perdería sin dejar rastro (ver tests/apps/_hidratacion.ts).
  await esperarHidratacion(page, ['input[type=range]']);
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
  await escribir(campo(page, 'Radio (r)'), '8');
  await expect(valorVolumen(page)).toHaveText('1608,5');
  await expect(formulaAplicada(page)).toHaveText('V = π × r² × h = π × 8² × 8');
  expect(await atributoSvg(page, 'ellipse >> nth=1', 'rx')).toBeCloseTo(52.5, 3);

  // Un tercio exacto con la misma base y altura.
  await elegirFigura(page, /Cono/);
  await escribir(campo(page, 'Radio de la base (r)'), '4');
  await escribir(campo(page, 'Altura (h)'), '8');
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
  await escribir(radio, '12,5');
  await expect(radio).toHaveValue('12,5');
  await expect(valorVolumen(page)).toHaveText('8181,2');
  // La fórmula muestra la medida TAL COMO entra en el cálculo, sin rellenar ni recortar
  // decimales: antes usaba dos fijos mientras el volumen se calculaba con el valor
  // completo, así que rehacer a mano la operación que la app enseña no daba su resultado.
  await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 12,5³');
  expect(await atributoSvg(page, 'circle', 'r')).toBeCloseTo(42, 6);
  await expect(deslizador).toHaveValue('12.5');

  // Una medida real que no cabe en el deslizador: se calcula igual y se avisa.
  await escribir(radio, '120');
  await expect(valorVolumen(page)).toHaveText('7.238.229');
  await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 120³');
  await expect(deslizador).toHaveValue('50');
  await expect(page.getByText('120 · fuera del deslizador')).toBeVisible();

  // El dibujo responde en TODO el recorrido del deslizador, no solo al principio.
  const pixeles: number[] = [];
  for (const medida of ['1', '6', '25', '50']) {
    await escribir(radio, medida);
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

  await escribir(radio, '5');
  await expect(valorVolumen(page)).toHaveText('523,6');

  for (const entradaMala of ['-5', 'abc', '', '0', '0,0', '-0,001']) {
    await escribir(radio, entradaMala);
    // Ni resultado degenerado ni cálculo con la basura tecleada: sigue el último válido.
    await expect(valorVolumen(page)).toHaveText('523,6');
    await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 5³');
  }

  // Y se recupera en cuanto se vuelve a escribir una medida.
  await escribir(radio, '12,5');
  await expect(valorVolumen(page)).toHaveText('8181,2');

  // El deslizador recorta a su rango declarado.
  const deslizador = page.locator('input[type=range]').first();
  await ponerDeslizador(page, 0, 0, 1);
  await expect(deslizador).toHaveValue('1');
  await expect(valorVolumen(page)).toHaveText('4,1888');

  // Volver a 10 antes del intento negativo no es adorno: sin esto el deslizador ya estaría en
  // 1, el navegador dejaría el −20 en 1 igualmente y React descartaría el evento por
  // duplicado, así que la comprobación pasaría sin que nada se hubiera movido.
  await ponerDeslizador(page, 0, 10);
  await ponerDeslizador(page, 0, -20, 1);
  await expect(deslizador).toHaveValue('1');
  await expect(valorVolumen(page)).toHaveText('4,1888');

  await ponerDeslizador(page, 0, 100, 50);
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
    await escribir(page.locator('input[type=text]').first(), '12,5');
    await expect(page.locator('svg text').filter({ hasText: /^r=/ })).toHaveText('r=12,5');

    // Y en las otras figuras, que tienen sus propias etiquetas
    await page.getByRole('button', { name: /Ortoedro|Paralelepípedo|Prisma|Cubo/ }).first().click();
    await escribir(page.locator('input[type=text]').first(), '2,5');
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
    await escribir(campo, 'no es un número');
    await expect(page.getByRole('alert').filter({ hasText: 'Escribe un número' })).toBeVisible();
    await expect(campo).toHaveAttribute('aria-invalid', 'true');

    // Y al escribir algo válido, el aviso desaparece
    await escribir(campo, '7');
    await expect(page.getByRole('alert').filter({ hasText: 'Escribe un número' })).toHaveCount(0);
    await expect(campo).toHaveAttribute('aria-invalid', 'false');
  });

  // Por arriba sí avisaba («120 · fuera del deslizador») y por abajo no: el deslizador
  // marcaba el mínimo y el pie seguía anunciando el rango normal.
  test('por debajo del mínimo se avisa igual que por encima del máximo', async ({ page }) => {
    const limites = page.locator('[class*=sliderLimits]').first();
    const campo = page.locator('input[type=text]').first();

    await escribir(campo, '0,5');
    await expect(limites).toContainText('fuera del deslizador');

    await escribir(campo, '120');
    await expect(limites).toContainText('120 · fuera del deslizador');

    await escribir(campo, '25');
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
    await escribir(campo(page, 'Radio (r)'), '12,5');
    await escribir(campo(page, 'Altura (h)'), '20');
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
    await escribir(campo(page, 'Radio (r)'), '5');
    await escribir(campo(page, 'Altura (h)'), '10');
    await expect(valorVolumen(page)).toHaveText('785,4'); // π·25·10 = 785,3981634
    await elegirFigura(page, /Esfera/);
    await escribir(campo(page, 'Radio (r)'), '5');
    await expect(valorVolumen(page)).toHaveText('523,6'); // = 785,3981634 × 2/3
  });

  test('CASO 2 · el tope del deslizador no contamina el cálculo ni el dibujo', async ({ page }) => {
    // Cubo de 100.000 de arista: 1e15, sin ∞ ni notación científica
    await elegirFigura(page, /Ortoedro/);
    await escribir(campo(page, 'Anchura (a)'), '100000');
    await escribir(campo(page, 'Profundidad (b)'), '100000');
    await escribir(campo(page, 'Altura (h)'), '100000');
    await expect(valorVolumen(page)).toHaveText('1.000.000.000.000.000');

    // Cilindro plano y enorme: π × 100.000² × 1 = 31.415.926.535,89793
    await elegirFigura(page, /Cilindro/);
    await escribir(campo(page, 'Radio (r)'), '100000');
    await escribir(campo(page, 'Altura (h)'), '1');
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

    await escribir(radio, '12abc');
    await expect(aviso).toHaveText(
      'Escribe un número: se sigue calculando con la última medida válida.',
    );
    await expect(radio).toHaveAttribute('aria-invalid', 'true');
    await expect(valorVolumen(page)).toHaveText('523,6');
    // Si lo hubiera leído como 12 saldría (4/3)·π·12³ = 7.238,2. No puede salir.
    await expect(valorVolumen(page)).not.toHaveText('7238,2');
    await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 5³');

    // Por encima del tope del campo (100.000) también se avisa
    await escribir(radio, '100001');
    await expect(aviso).toHaveText(
      'La medida debe estar entre 0 y 100.000: se sigue calculando con la última válida.',
    );
    await expect(valorVolumen(page)).toHaveText('523,6');

    // Y una medida válida limpia el aviso y mueve el resultado:
    // (4/3)·π·10³ = 4.188,790204786391 → un decimal → «4188,8»
    await escribir(radio, '10');
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
  await escribir(campo(page, 'Radio (r)'), '0,01');
  // (4/3)·π·0,01³ = 4,1887902047863905e-6
  await expect(valorVolumen(page)).not.toHaveText('≈0');
  await expect(valorVolumen(page)).toContainText(/[1-9]/);

  // Y la medida nunca puede llegar a la fórmula ni al dibujo convertida en «≈0»
  await escribir(campo(page, 'Radio (r)'), '0,00005');
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

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 22/09/2026 — tres casos NUEVOS resueltos a mano
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Motivo: `page.tsx` y `metadata.ts` cambiaron DESPUÉS de la re-inspección del 30/08/2026
 * (commit d749e6ac, que reparó los hallazgos 518-521). Lo que entró ahí —la notación
 * científica local para medidas y volúmenes por debajo de 0,0001— es código nuevo que
 * ningún test cubría, así que estos casos lo atacan junto a las dos figuras que los
 * bloques anteriores apenas tocan: la PIRÁMIDE y el ORTOEDRO. Ninguna cifra esperada se ha
 * copiado de la app: la aritmética va escrita aquí abajo, hecha antes de ejecutar nada.
 *
 *   CASO 1 (normal) — PIRÁMIDE l = 7,5 · h = 12,8
 *       l² = 56,25 ; 56,25 × 12,8 = 675 + 45 = 720 ; 720 / 3 = 240 exacto
 *       → tramo [100, 100.000) → 1 decimal → «240,0»
 *     El prisma de la misma base y altura vale el TRIPLE, que es lo que afirma el faqJsonLd
 *     («tres pirámides iguales llenan exactamente un prisma de la misma base y altura»):
 *       7,5 × 7,5 × 12,8 = 56,25 × 12,8 = 720 → «720,0» = 3 × 240 ✔
 *     Y un cono con decimales en LAS DOS medidas, que ningún bloque anterior mide:
 *       (1/3) × π × 2,5² × 9,6 = (1/3) × π × 60 = 20 π = 62,8318530718
 *       → tramo [10, 100) → 2 decimales → «62,83»
 *     Los dos ejemplos que la guía educativa promete POR ESCRITO, y que hasta ahora nadie
 *     había contrastado con la herramienta que los acompaña:
 *       depósito  r=3  h=5  → π × 9 × 5   = 45 π = 141,3716694115 → «141,4» (la guía: 141,4 m³)
 *       cucurucho r=3  h=12 → (1/3)π×9×12 = 36 π = 113,0973355292 → «113,1» (la guía: 113,1 cm³)
 *
 *     DIBUJO. En la pirámide manda el lienzo: s = min(105/(l·1,732), 115/(h + l/2), 13).
 *       l=7,5 h=12,8 → s = min(8,0831 · 6,9486 · 13) = 6,9486404834
 *       l=7,5 h=25,6 → s = min(8,0831 · 3,9182 · 13) = 3,9182282794
 *     La esquina izquierda de la base está en CX − l·s·0,866:
 *       150 − 7,5 × 6,9486404834 × 0,866 = 150 − 45,131 = 104,87
 *       150 − 7,5 × 3,9182282794 × 0,866 = 150 − 25,449 = 124,55
 *     mientras el vértice se queda CLAVADO en y = 90,5 siempre que mande la altura:
 *       apex_y = 148 − s·(h/2 + l/4) = 148 − [115/(h+3,75)]·(h+3,75)/2 = 148 − 57,5 = 90,5
 *     O sea: al subir la altura la pirámide no crece, se ESTRECHA — y eso es lo que hay que
 *     comprobar para afirmar que el dibujo reacciona. Con h=25,6 el volumen dobla:
 *       (1/3) × 56,25 × 25,6 = 480 → «480,0»
 *
 *   CASO 2 (límite) — la FRONTERA de la notación científica y el tope del campo
 *     r = 0,0001 es el primer valor que YA NO es «pequeño» para medExacta (la guarda es
 *     v < 0,0001, estricta), así que la medida sale en decimal —«0,0001»— mientras el
 *     volumen, que sí cae por debajo, sale en notación científica:
 *       V = (4/3) × π × (10⁻⁴)³ = 4,188790204786×10⁻¹² → «4,188790×10⁻¹²»
 *     Y la pirámide en el tope del campo, el tramo más alto que admite:
 *       (1/3) × 100.000² × 100.000 = 10¹⁵/3 = 333.333.333.333.333,33
 *       → ≥ 100.000 → 0 decimales → «333.333.333.333.333» (ni ∞ ni «No definido»)
 *
 *   CASO 3 (rechazo) — «1e3» NO es mil
 *     parseSpanishNumber rechaza los exponentes (lo que no son cifras y separadores no es un
 *     número), así que debe avisar y seguir en r=5 → 523,6. Si lo leyera como 1.000 —que es
 *     lo que haría Number('1e3')— saldría (4/3)π×10⁹ = 4.188.790.204,79 → «4.188.790.205».
 *     Igual con «2,5,3» y «+-4». En cambio «1.500» SÍ es una medida: en español el punto
 *     agrupa millares, así que son mil quinientos y no uno coma cinco:
 *       (4/3) × π × 1.500³ = 4,188790204786 × 3.375.000.000 = 14.137.166.941,15
 *       → «14.137.166.941» (leerlo a la inglesa daría «14,1», cuatro órdenes menos)
 */
test.describe('re-inspección 22/09/2026', () => {
  /** Los vértices del primer polígono del dibujo, para medir si la figura cambia de forma. */
  async function puntosPoligono(page: Page): Promise<number[][]> {
    const attr = await dibujo(page).locator('polygon').first().getAttribute('points');
    return (attr ?? '').trim().split(/\s+/).map((p) => p.split(',').map(Number));
  }

  test('CASO 1 · pirámide l=7,5 h=12,8 → 240,0, y tres pirámides llenan su prisma', async ({
    page,
  }) => {
    await elegirFigura(page, /Pirámide/);
    await escribir(campo(page, 'Lado de la base (l)'), '7,5');
    await escribir(campo(page, 'Altura (h)'), '12,8');

    // (1/3) × 56,25 × 12,8 = 720/3 = 240 exacto
    await expect(valorVolumen(page)).toHaveText('240,0');
    await expect(formulaAplicada(page)).toHaveText('V = (1/3) × l² × h = (1/3) × 7,5² × 12,8');
    await expect(dibujo(page).locator('text').filter({ hasText: /^l=/ })).toHaveText('l=7,5');

    // El vértice está clavado en 90,5 y la base llega hasta x = 104,87 (tolerancia ±0,5 px:
    // lo que vigila es que la figura se ESTRECHE 20 px al doblar la altura, no el subpíxel).
    const antes = await puntosPoligono(page);
    expect(antes[0][1]).toBeCloseTo(90.5, 1);
    expect(antes[1][0]).toBeCloseTo(104.87, 0);

    await escribir(campo(page, 'Altura (h)'), '25,6');
    await expect(valorVolumen(page)).toHaveText('480,0'); // (1/3) × 56,25 × 25,6 = 480
    const despues = await puntosPoligono(page);
    expect(despues[0][1]).toBeCloseTo(90.5, 1); // el vértice no se mueve…
    expect(despues[1][0]).toBeCloseTo(124.55, 0); // …y la base se estrecha 19,7 px
    expect(despues[1][0]).toBeGreaterThan(antes[1][0]);

    // Tres pirámides llenan el prisma de su misma base y altura (lo afirma el faqJsonLd)
    await escribir(campo(page, 'Altura (h)'), '12,8');
    await elegirFigura(page, /Ortoedro/);
    await escribir(campo(page, 'Anchura (a)'), '7,5');
    await escribir(campo(page, 'Profundidad (b)'), '7,5');
    await escribir(campo(page, 'Altura (h)'), '12,8');
    await expect(valorVolumen(page)).toHaveText('720,0'); // = 3 × 240
    await expect(formulaAplicada(page)).toHaveText('V = a × b × h = 7,5 × 7,5 × 12,8');
  });

  test('CASO 1.bis · el cono con decimales, y los dos ejemplos que promete la guía', async ({
    page,
  }) => {
    await elegirFigura(page, /Cono/);
    await escribir(campo(page, 'Radio de la base (r)'), '2,5');
    await escribir(campo(page, 'Altura (h)'), '9,6');
    // (1/3) × π × 6,25 × 9,6 = 20 π = 62,8318530718 → dos decimales
    await expect(valorVolumen(page)).toHaveText('62,83');
    await expect(formulaAplicada(page)).toHaveText(
      'V = (1/3) × π × r² × h = (1/3) × π × 2,5² × 9,6',
    );

    // «Cucurucho de helado: r=3cm, h=12cm → V=113,1 cm³», dice la guía. Que lo diga la app.
    await escribir(campo(page, 'Radio de la base (r)'), '3');
    await escribir(campo(page, 'Altura (h)'), '12');
    await expect(valorVolumen(page)).toHaveText('113,1'); // 36 π = 113,0973355292

    // «Depósito cilíndrico: r=3m, h=5m → V=141,4 m³ → 141.400 litros»
    await elegirFigura(page, /Cilindro/);
    await escribir(campo(page, 'Radio (r)'), '3');
    await escribir(campo(page, 'Altura (h)'), '5');
    await expect(valorVolumen(page)).toHaveText('141,4'); // 45 π = 141,3716694115
  });

  test('CASO 2 · la frontera de 0,0001 y el tope del campo en la pirámide', async ({ page }) => {
    // r = 0,0001 no entra en la rama de notación científica de la MEDIDA (la guarda es
    // estricta), pero su volumen sí: 4,188790204786×10⁻¹²
    await escribir(campo(page, 'Radio (r)'), '0,0001');
    await expect(valorVolumen(page)).toHaveText('4,188790×10⁻¹²');
    await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 0,0001³');

    // Y el tramo más alto que admite el campo, en la figura que nadie había llevado ahí:
    // (1/3) × 100.000² × 100.000 = 10¹⁵/3
    await elegirFigura(page, /Pirámide/);
    await escribir(campo(page, 'Lado de la base (l)'), '100000');
    await escribir(campo(page, 'Altura (h)'), '100000');
    await expect(valorVolumen(page)).toHaveText('333.333.333.333.333');
    await expect(formulaAplicada(page)).toHaveText(
      'V = (1/3) × l² × h = (1/3) × 100.000² × 100.000',
    );
    await expect(page.locator('[class*=sliderLimits]').first()).toContainText(
      '100.000 · fuera del deslizador',
    );
    const mostrado = await valorVolumen(page).innerText();
    expect(mostrado).not.toMatch(/∞|No definido|NaN|e\+/);

    // Con esa proporción el dibujo sigue dentro del lienzo «0 0 300 290»
    const caja = await dibujo(page).evaluate((svg: SVGSVGElement) => {
      const b = svg.getBBox();
      return { x: b.x, y: b.y, x2: b.x + b.width, y2: b.y + b.height };
    });
    expect(caja.x).toBeGreaterThanOrEqual(0);
    expect(caja.y).toBeGreaterThanOrEqual(0);
    expect(caja.x2).toBeLessThanOrEqual(300);
    expect(caja.y2).toBeLessThanOrEqual(290);
  });

  test('CASO 3 · «1e3» no es mil, y «1.500» sí es mil quinientos', async ({ page }) => {
    const radio = campo(page, 'Radio (r)');
    const aviso = page.locator('p[role="alert"]'); // el de la app, no el de Next
    await expect(valorVolumen(page)).toHaveText('523,6');

    for (const noEsUnNumero of ['1e3', '2,5,3', '+-4']) {
      await escribir(radio, noEsUnNumero);
      await expect(aviso).toHaveText(
        'Escribe un número: se sigue calculando con la última medida válida.',
      );
      await expect(radio).toHaveAttribute('aria-invalid', 'true');
      await expect(valorVolumen(page)).toHaveText('523,6');
      await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 5³');
    }
    // Si «1e3» se hubiera leído como 1.000 saldría (4/3)π×10⁹ = «4.188.790.205»
    await expect(valorVolumen(page)).not.toHaveText('4.188.790.205');

    // «1.500» en español es mil quinientos: (4/3) × π × 1.500³ = 14.137.166.941,15
    await escribir(radio, '1.500');
    await expect(aviso).toHaveCount(0);
    await expect(valorVolumen(page)).toHaveText('14.137.166.941');
    await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 1500³');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS de la re-inspección del 22/09/2026 — FALLAN a propósito
// ═══════════════════════════════════════════════════════════════════════════

// HALLAZGO (dato, medio) — La caja «Fórmula aplicada» PEGA el exponente del cubo al de la
// notación científica que entró con la reparación del 518: con r = 0,00005 escribe
// «V = (4/3) × π × 5,000×10⁻⁵³», que se lee 10⁻⁵³ — cuarenta y ocho órdenes de magnitud por
// debajo de lo que la app está calculando. Le pasa igual al cuadrado del cilindro y del cono
// («π × 5,000×10⁻⁵² × 20»). La medida necesita paréntesis en cuanto se escribe en notación
// científica, porque el exponente de la fórmula ya no puede distinguirse del de la medida.
// El paso 4 de la guía vende justamente eso: «ver exactamente qué operaciones se están
// realizando para obtener el volumen».
// Caso: esfera r=0,00005 → esperado «(4/3) × π × (5,000×10⁻⁵)³» · obtenido
//       «(4/3) × π × 5,000×10⁻⁵³».
test('HALLAZGO 22/09 · la fórmula debe parentizar la medida en notación científica', async ({
  page,
}) => {
  test.fail();
  await escribir(campo(page, 'Radio (r)'), '0,00005');
  await expect(formulaAplicada(page)).toContainText('(5,000×10⁻⁵)³');
});

// HALLAZGO (dato, medio) — Justo POR ENCIMA de la frontera de 0,0001 el volumen pierde de
// golpe seis cifras significativas, porque formatVolumen imprime ese tramo con cuatro
// decimales fijos. La discontinuidad es brutal y está medida: r=0,0287 → «9,902259×10⁻⁵»
// (siete cifras), r=0,03 → «0,0001» (una), r=0,033 → «0,0002» cuando el volumen real es
// 1,505326×10⁻⁴, un 33 % menos que lo que se muestra. Es el mismo caso de uso que motivó la
// reparación del 518 —medir algo pequeño en la unidad grande, la célula o el cucurucho en
// metros—, resuelto por debajo de la frontera y sin resolver justo por encima.
// Caso: esfera r=0,033 → esperado 1,505326×10⁻⁴ (o «0,000151») · obtenido «0,0002».
test('HALLAZGO 22/09 · un volumen de 1,5×10⁻⁴ no debe mostrarse como 0,0002', async ({ page }) => {
  test.fail();
  await escribir(campo(page, 'Radio (r)'), '0,033');
  // (4/3) × π × 0,033³ = (4/3) × π × 3,5937×10⁻⁵ = 1,505326×10⁻⁴
  await expect(valorVolumen(page)).toContainText('1,50');
});

// HALLAZGO (dato, bajo) — El ECO de la medida sigue pasando por med(), que la reparación del
// 21/08/2026 sustituyó por medExacta() solo en la fórmula y en el dibujo. med() redondea a
// dos decimales y delega en formatNumber, así que por debajo de 0,0001 escribe «≈0»:
//   · el pie del deslizador anuncia «≈0 · fuera del deslizador» con r=0,00005;
//   · el aria-label del deslizador dice «control deslizante: ≈0» (y «12.345,68» cuando la
//     medida es 12.345,678, que es lo mismo que ya se reparó en la caja de la fórmula);
//   · y al cambiar de figura y volver —el paso 5 de la guía, «Compara figuras»— el campo se
//     REMONTA con med(), de modo que pasa a mostrar «≈0» (r=0,00005) o «0,00» (r=0,0001)
//     mientras la app sigue calculando con la medida real. Vuelve a haber una pantalla que no
//     corresponde a lo que se calcula, que es el defecto que se cerró el 21/08/2026. Desde
//     «≈0» el campo tampoco se puede corregir de forma natural: borrar un carácter deja «≈».
// Caso: esfera r=0,00005 → Cilindro → Esfera → esperado campo «0,00005» · obtenido «≈0»,
//       con el volumen en 5,235988×10⁻¹³ (correcto) y el pie diciendo «≈0».
test('HALLAZGO 22/09 · el eco de la medida no debe convertirse en «≈0»', async ({ page }) => {
  test.fail();
  await escribir(campo(page, 'Radio (r)'), '0,00005');
  await expect(page.locator('[class*=sliderLimits]').first()).not.toContainText('≈0');
  expect(await page.locator('input[type=range]').first().getAttribute('aria-label')).not.toContain(
    '≈0',
  );

  await elegirFigura(page, /Cilindro/);
  await elegirFigura(page, /Esfera/);
  await expect(valorVolumen(page)).toHaveText('5,235988×10⁻¹³'); // el cálculo sí aguanta
  await expect(campo(page, 'Radio (r)')).toHaveValue('0,00005');
});

// HALLAZGO (operativa, medio) — En móvil el DIBUJO, que es lo que da nombre a la app y lo que
// su subtítulo invita a mirar, nace entero por debajo del pliegue: y = 993 px en 390×844, con
// 439 px de scroll para verlo completo. La reparación de agosto puso los controles delante
// (order: 1 / order: 2 en el CSS a ≤640 px) y resolvió lo que entonces se midió —un control y
// el resultado sin scroll—, pero dejó el visualizador detrás de todo. Medido hoy, en la
// primera pantalla: h1 40 · subtítulo 110 · aviso legal 245 · selector de figura 434-620 ·
// campo 660 · deslizador 694 · tarjeta de resultado 752-871, RECORTADA por el pliegue (92 de
// sus 119 px; «unidades³» se corta por la mitad) · caja de fórmula 891, fuera · dibujo
// 993-1283, fuera. Mover el deslizador y «observar cómo cambia el volumen en tiempo real»
// exige bajar primero, y nada en pantalla dice que haya un dibujo ahí abajo.
// Caso: viewport 390×844 → esperado que el dibujo asome en la primera pantalla y que la
//       tarjeta de resultado quepa entera · obtenido dibujo a 993 px y tarjeta cortada en 844.
test.describe('en móvil (390×844) — re-inspección 22/09/2026', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('HALLAZGO 22/09 · el dibujo debe asomar sin scroll, y el resultado caber entero', async ({
    page,
  }) => {
    test.fail();
    const ALTO = 844;
    const caja = async (selector: string) => {
      const c = await page.locator(selector).first().boundingBox();
      return c ?? { y: Number.POSITIVE_INFINITY, height: 0 };
    };

    // Lo que ya se reparó en agosto y sigue en pie: control y resultado empiezan sin scroll
    expect((await caja('input[type=range]')).y).toBeLessThan(ALTO);
    expect((await caja('[class*=resultCard]')).y).toBeLessThan(ALTO);

    // Lo que no: la tarjeta de resultado se corta por el pliegue…
    const resultado = await caja('[class*=resultCard]');
    expect(resultado.y + resultado.height).toBeLessThanOrEqual(ALTO);
    // …y el dibujo, que es el producto de un «visualizador», no asoma en absoluto
    expect((await caja('svg[role="img"]')).y).toBeLessThan(ALTO);
  });
});
