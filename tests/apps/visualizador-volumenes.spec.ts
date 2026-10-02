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
 * FORMATO DEL RESULTADO (`formatVolumen`, desde 67de72aa del 22/09/2026): (0, 0,01) → notación
 * científica con seis decimales de mantisa («4,188790×10⁻³») · <10 → 4 decimales · <100 → 2 ·
 * <100.000 → 1 · resto → 0. Y `es-ES` NO agrupa los números de cuatro cifras: 8181,2 va sin
 * punto de miles, 7.238.229 sí lo lleva.
 *
 * Los hallazgos del acta del 20/08/2026 —etiquetas del dibujo en formato inglés (r=12.5),
 * fórmula redondeada a 2 decimales mientras el cálculo usaba todas, entrada inválida
 * ignorada sin avisar, relleno del deslizador clavado al 50 % y, en móvil, control y
 * resultado bajo el pliegue— se repararon el 21/08/2026 y ya SÍ se afirman aquí, cada uno
 * en su bloque de regresión.
 *
 * RE-INSPECCIÓN del 30/08/2026 (la cola marcó la app «invalidada» porque su código había
 * cambiado): tres casos nuevos resueltos a mano, sin dar por bueno nada de lo anterior, en
 * su bloque, junto a los hallazgos que esa re-inspección dejó abiertos (518-521), REPARADOS el
 * 30/08/2026 (d749e6ac) y que hoy son de regresión.
 *
 * RE-INSPECCIONES del 22/09/2026 (hallazgos 1222-1225, REPARADOS el mismo día en 67de72aa) y
 * del 02/10/2026 (bloques del final: casos nuevos y los hallazgos que deja abiertos, escritos
 * contra lo que DEBERÍA ocurrir y marcados con `test.fail()`).
 */

import { test, expect, type Locator, type Page } from '@playwright/test';
import {
  esperarHidratacion,
  esperarPaginaAsentada,
  esperarValorEnReact,
  sembrarValor,
} from './_hidratacion';

/**
 * stemum.com → el servidor local, para ver la app como la sirve el portal (data-brand="stemum"
 * y la píldora «Stemum › Matemáticas» en la barra fija). Va al NIVEL DEL FICHERO porque
 * `launchOptions` fuerza un worker nuevo; al resto de tests no les afecta: solo resuelve ese host.
 * (Re-inspección del 02/10/2026, bloque «stemum.com» del final.)
 */
test.use({ launchOptions: { args: ['--host-resolver-rules=MAP stemum.com 127.0.0.1:3050'] } });

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
// HALLAZGOS de la re-inspección del 30/08/2026 — REPARADOS el 30/08/2026 (d749e6ac)
// ═══════════════════════════════════════════════════════════════════════════

// HALLAZGO 518 (cálculo/operativa, medio) — REPARADO. Por debajo de 0,0001 la app dejaba de
// dar resultado y decía «≈0»: formatNumber() devuelve «≈0» para todo |v| < 0,0001 y tanto
// formatVolumen() como medExacta() lo llamaban sin más, así que el defecto salía por tres
// sitios: el volumen, la caja «Fórmula aplicada» —que llegaba a mostrar «V = (4/3) × π × ≈0³»—
// y la etiqueta del dibujo, que rotulaba «r=≈0». Y era su propio bloque educativo el que
// llevaba a ese caso: la tarjeta «Ciencias y laboratorio» propone «Célula esférica: r=0,01mm →
// V=4,19×10⁻⁶ mm³ → 4,19 picolitros».
// Caso de entonces: esfera r=0,01 → esperado 4,188790×10⁻⁶ · obtenido «≈0», y con r=0,00005
//       la fórmula mostraba «(4/3) × π × ≈0³» y el dibujo «r=≈0».
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

// HALLAZGO 519 (contenido, bajo) — REPARADO. La guía «Cómo usar el visualizador» se había
// quedado desfasada tras la reparación del 19-21/08/2026: el campo de medida exacta —única vía
// para r=12,5 o r=120— no se mencionaba en ningún texto, y el subtítulo, la metadata y el
// JSON-LD hablaban solo de sliders.
// Caso de entonces: abrir la guía y buscar cualquier mención al campo → esperado ≥ 1 · obtenido 0.
test('519 (reparado) · la guía de uso ya explica el campo de medida exacta', async ({ page }) => {
  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const guia = page.locator('section').filter({ hasText: 'Cómo usar el visualizador' }).first();
  const texto = (await guia.textContent()) ?? '';
  expect(texto).toMatch(/escrib|teclea|campo|casilla/i);
});

// HALLAZGO 520 (contenido, bajo) — REPARADO. El recuadro de errores frecuentes titulaba uno
// «Usar la altura slant en vez de la altura perpendicular», cuando el término español es el
// que el propio párrafo cita dos líneas después: generatriz (cono) o apotema lateral (pirámide).
// Caso de entonces: texto visible de la página → esperado sin «slant» · obtenido «la altura slant».
test('520 (reparado) · el texto docente ya no deja «slant» sin traducir', async ({ page }) => {
  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const cuerpo = (await page.locator('body').textContent()) ?? '';
  expect(cuerpo).not.toMatch(/\bslant\b/i);
});

// HALLAZGO 521 (contenido, bajo) — REPARADO. La figura de la caja se llamaba «Paralelepípedo»
// con V = a × b × h, fórmula que solo vale para un ORTOEDRO (prisma rectangular), que es lo que
// la app dibuja y calcula; la metadata la llamaba además «cubo».
// Caso de entonces: fila de la tabla con V = a × b × h → esperado «ortoedro» o «paralelepípedo
//       recto» · obtenido «📦 Paralelepípedo» a secas.
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
// HALLAZGOS de la re-inspección del 22/09/2026 — REPARADOS el 22/09/2026 (67de72aa)
// ═══════════════════════════════════════════════════════════════════════════

// HALLAZGO 1223 (dato, medio) — REPARADO. La caja «Fórmula aplicada» PEGABA el exponente del
// cubo al de la notación científica que entró con la reparación del 518: con r = 0,00005
// escribía «V = (4/3) × π × 5,000×10⁻⁵³», que se lee 10⁻⁵³ —cuarenta y ocho órdenes de
// magnitud por debajo de lo que la app calculaba—. Le pasaba igual al cuadrado del cilindro y
// del cono. Desde 67de72aa la medida va entre paréntesis en cuanto se escribe en notación.
// Caso de entonces: esfera r=0,00005 → esperado «(4/3) × π × (5,000×10⁻⁵)³» · obtenido
//       «(4/3) × π × 5,000×10⁻⁵³».
test('1223 (regresión) · la fórmula parentiza la medida en notación científica', async ({
  page,
}) => {
  await escribir(campo(page, 'Radio (r)'), '0,00005');
  await expect(formulaAplicada(page)).toContainText('(5,000×10⁻⁵)³');
});

// HALLAZGO 1224 (dato, medio) — REPARADO. Justo POR ENCIMA de la frontera de 0,0001 el volumen
// perdía de golpe seis cifras significativas, porque formatVolumen imprimía ese tramo con cuatro
// decimales fijos: r=0,033 → «0,0002» cuando el volumen real es 1,505326×10⁻⁴. Desde 67de72aa
// la notación científica empieza por debajo de 0,01 (lo vigila también el CASO 2 del
// 02/10/2026, en la frontera nueva).
// Caso de entonces: esfera r=0,033 → esperado 1,505326×10⁻⁴ · obtenido «0,0002».
test('1224 (regresión) · un volumen de 1,5×10⁻⁴ no se muestra como 0,0002', async ({ page }) => {
  await escribir(campo(page, 'Radio (r)'), '0,033');
  // (4/3) × π × 0,033³ = (4/3) × π × 3,5937×10⁻⁵ = 1,505326×10⁻⁴
  await expect(valorVolumen(page)).toContainText('1,50');
});

// HALLAZGO 1225 (dato, bajo) — REPARADO. El ECO de la medida pasaba por med(), que redondeaba a
// dos decimales y escribía «≈0» por debajo de 0,0001: en el pie del deslizador, en su
// aria-label y, al cambiar de figura y volver, en el propio campo, mientras la app seguía
// calculando con la medida real. Desde 67de72aa el campo usa medEditable() y los rótulos
// medExacta(); med() se retiró.
// Caso de entonces: esfera r=0,00005 → Cilindro → Esfera → esperado campo «0,00005» ·
//       obtenido «≈0», con el volumen en 5,235988×10⁻¹³ (correcto) y el pie diciendo «≈0».
test('1225 (regresión) · el eco de la medida no se convierte en «≈0»', async ({ page }) => {
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

// HALLAZGO 1222 (operativa, medio) — REPARADO el 22/09/2026 (67de72aa) y vuelto a ajustar el
// 27/09/2026 (f0e61b70), cuando los 80 px del hueco del logo (586a4d61) empujaron la tarjeta
// 6 px bajo el pliegue. En móvil el <svg> del dibujo nacía a 993 px en 390×844 y la tarjeta de
// resultado se cortaba por el pliegue (752-871). Medido el 02/10/2026: tarjeta 734-830 y caja
// del <svg> desde 837.
// ⚠️ Este testigo mide la CAJA del <svg>, y la caja asoma 7 px VACÍOS: la figura (290 px de
// lienzo con el dibujo centrado) empieza ~117 px más abajo, a 954 px. Lo que ve el usuario en la
// primera pantalla no tiene dibujo: es el hallazgo abierto de la re-inspección del 02/10/2026,
// más abajo, que mide la figura y no su caja. Y este testigo solo mira la ESFERA a 390 px.
// Caso de entonces: viewport 390×844 → esperado que el dibujo asome en la primera pantalla y que
//       la tarjeta de resultado quepa entera · obtenido dibujo a 993 px y tarjeta cortada en 844.
test.describe('en móvil (390×844) — re-inspección 22/09/2026', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('1222 (regresión) · el dibujo asoma sin scroll y el resultado cabe entero', async ({
    page,
  }) => {
    const ALTO = 844;
    const caja = async (selector: string) => {
      const c = await page.locator(selector).first().boundingBox();
      return c ?? { y: Number.POSITIVE_INFINITY, height: 0 };
    };

    // Lo que ya se reparó en agosto y sigue en pie: control y resultado empiezan sin scroll
    expect((await caja('input[type=range]')).y).toBeLessThan(ALTO);
    expect((await caja('[class*=resultCard]')).y).toBeLessThan(ALTO);

    // Reparado el 22/09 (y el 27/09 tras el hueco del logo): la tarjeta cabe entera…
    const resultado = await caja('[class*=resultCard]');
    expect(resultado.y + resultado.height).toBeLessThanOrEqual(ALTO);
    // …y la caja del <svg> empieza sobre el pliegue (la CAJA: ver el aviso de arriba)
    expect((await caja('svg[role="img"]')).y).toBeLessThan(ALTO);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 02/10/2026 — casos NUEVOS resueltos a mano
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Motivo: desde la re-inspección del 22/09/2026 cambiaron `page.tsx` y el módulo de CSS
 * (67de72aa, la reparación de 1222-1225), el módulo otra vez el 27/09 (f0e61b70: el resultado
 * vuelve a caber en móvil tras el hueco del logo) y el hero en los lotes 586a4d61 y a1d72a9c
 * (80 px arriba hasta 1023 px). Ninguna cifra de aquí se ha copiado de la app: la aritmética va
 * escrita abajo y se hizo ANTES de abrir el navegador.
 *
 *   CASO 1 (normal) — decimales en las cuatro figuras que el bloque del 22/09 no llevó ahí
 *     cono     r=6   h=4,5  → (1/3)·π·36·4,5 = 54 π = 169,6460032938   → «169,6»
 *     cilindro r=6   h=4,5  → π·36·4,5       = 162 π = 508,9380098815  → «508,9» (= 3 × 169,646)
 *     cilindro r=0,5 h=2    → π·0,25·2       = π/2  = 1,5707963268     → tramo [0,01, 10) → «1,5708»
 *     ortoedro 2,5 × 3,2 × 7 = 8 × 7 = 56                              → tramo [10, 100) → «56,00»
 *     pirámide l=1,2 h=0,9  → 1,44 × 0,9 = 1,296 ; / 3 = 0,432         → «0,4320»
 *
 *   CASO 2 (límite) — la frontera NUEVA de la notación científica del volumen, 0,01 (67de72aa
 *   la subió desde 0,0001), atacada con las figuras que dan potencias de diez exactas:
 *     ortoedro 0,1 × 0,1 × 1    = 0,01   → justo en la frontera, en decimal → «0,0100»
 *     ortoedro 0,1 × 0,1 × 0,99 = 0,0099 → por debajo → «9,900000×10⁻³»
 *     pirámide l=0,3 h=0,1 → 0,09 × 0,1 / 3 = 0,003 → «3,000000×10⁻³»
 *     cono r=4 h=0,001 (altura mínima) → 16 π × 0,001 / 3 = 0,0167551608 → «0,0168»
 *     cono r=0,001 h=0,001 → π × 10⁻⁹ / 3 = 1,0471975512×10⁻⁹ → «1,047198×10⁻⁹»
 *     esfera r=0,1 → (4/3)·π·0,001 = 4,1887902048×10⁻³ → «4,188790×10⁻³»
 *     esfera r=0,2 → (4/3)·π·0,008 = 0,0335103216      → «0,0335»
 *     esfera r=100.000 (tope del campo) → (4/3)·π·10¹⁵ = 4.188.790.204.786.390,98
 *                                                       → «4.188.790.204.786.391»
 *     esfera r=0,00001234 → 1,234³ = 1,879080904 ; × 4,18879020479 = 7,8710757
 *                         → «7,871076×10⁻¹⁵», y la medida entre paréntesis (1223): «(1,234×10⁻⁵)³»
 *     cono r=0,00005 h=20 → (1/3)·π·2,5×10⁻⁹·20 = 5×10⁻⁸ × 1,0471975512 = 5,235987756×10⁻⁸
 *                         → «5,235988×10⁻⁸», con el CUADRADO también entre paréntesis
 *
 *   CASO 3 (rechazo) — lo que no es una medida deja el cálculo en r=5 → «523,6» y lo dice:
 *     «1,5 m», «5 cm», «Infinity», «½», «1/2»  → «Escribe un número: …»
 *     «-0», «0,00000», «100000,5»              → «La medida debe estar entre 0 y 100.000: …»
 *     En cambio SÍ son medidas: « 7 » (espacios) → (4/3)·π·343 = 1.436,7550402 → «1436,8»
 *     y «1.5» (punto suelto, que no agrupa millares) → 1,5 → (4/3)·π·3,375 = 14,1371669 → «14,14»
 *
 *   TECLEAR (la forma transversal del 02/10: un estado intermedio reescrito bajo el cursor).
 *   El campo es type="text" y guarda su propio texto, así que «12,» no se normaliza a «12»:
 *     «1» → r=1 → 4,18879 → «4,1888» · «12» → (4/3)·π·1.728 = 7.238,229 → «7238,2» ·
 *     «12,» → sigue en 12 → «7238,2» · «12,5» → «8181,2» (8.181,2308687, CASO 2 de agosto)
 */
test.describe('re-inspección 02/10/2026', () => {
  test('CASO 1 · decimales en cono, cilindro, ortoedro y pirámide', async ({ page }) => {
    await elegirFigura(page, /Cono/);
    await escribir(campo(page, 'Radio de la base (r)'), '6');
    await escribir(campo(page, 'Altura (h)'), '4,5');
    await expect(valorVolumen(page)).toHaveText('169,6'); // 54 π = 169,646
    await expect(formulaAplicada(page)).toHaveText('V = (1/3) × π × r² × h = (1/3) × π × 6² × 4,5');

    // El cilindro de la misma base y altura vale el triple: 162 π = 508,938
    await elegirFigura(page, /Cilindro/);
    await escribir(campo(page, 'Radio (r)'), '6');
    await escribir(campo(page, 'Altura (h)'), '4,5');
    await expect(valorVolumen(page)).toHaveText('508,9');

    await escribir(campo(page, 'Radio (r)'), '0,5');
    await escribir(campo(page, 'Altura (h)'), '2');
    await expect(valorVolumen(page)).toHaveText('1,5708'); // π/2
    await expect(formulaAplicada(page)).toHaveText('V = π × r² × h = π × 0,5² × 2');

    await elegirFigura(page, /Ortoedro/);
    await escribir(campo(page, 'Anchura (a)'), '2,5');
    await escribir(campo(page, 'Profundidad (b)'), '3,2');
    await escribir(campo(page, 'Altura (h)'), '7');
    await expect(valorVolumen(page)).toHaveText('56,00'); // 8 × 7
    await expect(formulaAplicada(page)).toHaveText('V = a × b × h = 2,5 × 3,2 × 7');

    await elegirFigura(page, /Pirámide/);
    await escribir(campo(page, 'Lado de la base (l)'), '1,2');
    await escribir(campo(page, 'Altura (h)'), '0,9');
    await expect(valorVolumen(page)).toHaveText('0,4320'); // 1,296 / 3
    await expect(formulaAplicada(page)).toHaveText('V = (1/3) × l² × h = (1/3) × 1,2² × 0,9');
  });

  test('CASO 2 · la frontera de 0,01 del volumen, alturas mínimas y el tope del campo', async ({
    page,
  }) => {
    await elegirFigura(page, /Ortoedro/);
    await escribir(campo(page, 'Anchura (a)'), '0,1');
    await escribir(campo(page, 'Profundidad (b)'), '0,1');
    await escribir(campo(page, 'Altura (h)'), '1');
    await expect(valorVolumen(page)).toHaveText('0,0100'); // en la frontera: decimal
    await escribir(campo(page, 'Altura (h)'), '0,99');
    await expect(valorVolumen(page)).toHaveText('9,900000×10⁻³'); // por debajo: notación

    await elegirFigura(page, /Pirámide/);
    await escribir(campo(page, 'Lado de la base (l)'), '0,3');
    await escribir(campo(page, 'Altura (h)'), '0,1');
    await expect(valorVolumen(page)).toHaveText('3,000000×10⁻³'); // 0,009 / 3

    await elegirFigura(page, /Cono/);
    await escribir(campo(page, 'Radio de la base (r)'), '4');
    await escribir(campo(page, 'Altura (h)'), '0,001');
    await expect(valorVolumen(page)).toHaveText('0,0168'); // 16 π × 0,001 / 3 = 0,016755
    await escribir(campo(page, 'Radio de la base (r)'), '0,001');
    await expect(valorVolumen(page)).toHaveText('1,047198×10⁻⁹'); // π × 10⁻⁹ / 3
    await expect(formulaAplicada(page)).toHaveText(
      'V = (1/3) × π × r² × h = (1/3) × π × 0,001² × 0,001',
    );
    // 1223 en el cono: el cuadrado de una medida en notación va entre paréntesis
    await escribir(campo(page, 'Radio de la base (r)'), '0,00005');
    await escribir(campo(page, 'Altura (h)'), '20');
    await expect(valorVolumen(page)).toHaveText('5,235988×10⁻⁸');
    await expect(formulaAplicada(page)).toHaveText(
      'V = (1/3) × π × r² × h = (1/3) × π × (5,000×10⁻⁵)² × 20',
    );

    await elegirFigura(page, /Esfera/);
    await escribir(campo(page, 'Radio (r)'), '0,1');
    await expect(valorVolumen(page)).toHaveText('4,188790×10⁻³');
    await escribir(campo(page, 'Radio (r)'), '0,2');
    await expect(valorVolumen(page)).toHaveText('0,0335');
    await escribir(campo(page, 'Radio (r)'), '100000');
    await expect(valorVolumen(page)).toHaveText('4.188.790.204.786.391');
    await escribir(campo(page, 'Radio (r)'), '0,00001234');
    await expect(valorVolumen(page)).toHaveText('7,871076×10⁻¹⁵');
    await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × (1,234×10⁻⁵)³');
  });

  test('CASO 3 · unidades, fracciones y ceros se rechazan; espacios y «1.5» se aceptan', async ({
    page,
  }) => {
    const radio = campo(page, 'Radio (r)');
    const aviso = page.locator('p[role="alert"]'); // el de la app, no el anunciador de Next
    await expect(valorVolumen(page)).toHaveText('523,6');

    for (const noEsUnNumero of ['1,5 m', '5 cm', 'Infinity', '½', '1/2']) {
      await escribir(radio, noEsUnNumero);
      await expect(aviso).toHaveText(
        'Escribe un número: se sigue calculando con la última medida válida.',
      );
      await expect(radio).toHaveAttribute('aria-invalid', 'true');
      await expect(valorVolumen(page)).toHaveText('523,6');
      await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 5³');
    }
    for (const fueraDeRango of ['-0', '0,00000', '100000,5']) {
      await escribir(radio, fueraDeRango);
      await expect(aviso).toHaveText(
        'La medida debe estar entre 0 y 100.000: se sigue calculando con la última válida.',
      );
      await expect(valorVolumen(page)).toHaveText('523,6');
    }

    await escribir(radio, ' 7 ');
    await expect(aviso).toHaveCount(0);
    await expect(valorVolumen(page)).toHaveText('1436,8'); // (4/3)·π·343
    await escribir(radio, '1.5');
    await expect(valorVolumen(page)).toHaveText('14,14'); // (4/3)·π·3,375
    await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 1,5³');
  });

  test('TECLEAR · «12,5» tecla a tecla: el campo no se reescribe y el volumen sigue a cada tecla', async ({
    page,
  }) => {
    const radio = campo(page, 'Radio (r)');
    await radio.fill('');
    for (const [tecla, enCampo, volumen] of [
      ['1', '1', '4,1888'],
      ['2', '12', '7238,2'],
      [',', '12,', '7238,2'],
      ['5', '12,5', '8181,2'],
    ] as const) {
      await radio.pressSequentially(tecla);
      await expect(radio).toHaveValue(enCampo);
      await expect(valorVolumen(page)).toHaveText(volumen);
      await expect(page.locator('p[role="alert"]')).toHaveCount(0);
    }
  });
});

/** Cuántos puntos del texto del <h1> (muestreo de 4 en 4 px) caen bajo la barra fija del logo. */
async function tituloBajoLaBarra(page: Page): Promise<{ total: number; tapados: number }> {
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );
  return page.locator('h1').evaluate((h1) => {
    const barra = document.querySelector('[class*="headerBar"]');
    const rango = document.createRange();
    rango.selectNodeContents(h1);
    let total = 0;
    let tapados = 0;
    for (const q of Array.from(rango.getClientRects())) {
      for (let x = q.left + 2; x < q.right - 1; x += 4) {
        for (let y = q.top + 4; y < q.bottom - 3; y += 4) {
          total++;
          const e = document.elementFromPoint(x, y);
          if (e && barra?.contains(e)) tapados++;
        }
      }
    }
    return { total, tapados };
  });
}

/**
 * Bajo stemum.com, el `next dev` local rechaza el WebSocket de HMR (`allowedDevOrigins` solo
 * admite meskeia.com) y, sin él, la página NO se hidrata: la píldora «Stemum › Matemáticas» no
 * llega a montarse (useStemumHost corre en un efecto). El puente reenvía el socket a
 * localhost:3050, que sí se acepta; no toca ninguna petición HTTP. Copiado de
 * `simulador-punnett.spec.ts` (01/10/2026). Bajo `next start` no hay HMR y no hace nada.
 */
async function puenteHmr(page: Page): Promise<void> {
  const abiertos: WebSocket[] = [];
  page.on('close', () => abiertos.forEach((s) => s.close()));
  await page.routeWebSocket(/\/_next\/(webpack-)?hmr/, (ws) => {
    const u = new URL(ws.url());
    const arriba = new WebSocket(`ws://localhost:3050${u.pathname}${u.search}`);
    arriba.binaryType = 'arraybuffer';
    abiertos.push(arriba);
    const cola: (string | Buffer)[] = [];
    arriba.onopen = () => {
      for (const m of cola) arriba.send(m);
      cola.length = 0;
    };
    ws.onMessage((m) => {
      if (arriba.readyState === WebSocket.OPEN) arriba.send(m);
      else cola.push(m);
    });
    arriba.onmessage = (e: MessageEvent) =>
      ws.send(typeof e.data === 'string' ? e.data : Buffer.from(e.data as ArrayBuffer));
    ws.onClose(() => arriba.close());
  });
}

// ============================================================
// HERO — ni el logo ni la píldora de Stemum tapan el título (02/10/2026)
// ============================================================
/**
 * a1d72a9c deja el hueco de 80 px hasta 1023 px, medido con el logo de meskeia.com (hasta
 * x = 203). Medido el 02/10/2026 en meskeia.com (localhost): 0 puntos del h1 tapados a 360, 390,
 * 800 y de 1024 a 1064 px (el título centrado empieza en x = 247 a 1024 px). Bajo stemum.com,
 * también 0 a 360, 390, 800 y 1023 px (los 80 px de arriba lo salvan). Lo que no pasa: ver el
 * hallazgo abierto del bloque del final.
 */
test.describe('hero en meskeia.com — re-inspección 02/10/2026', () => {
  test('a 360, 390, 800 y de 1024 a 1064 px el logo no tapa el título', async ({ page }) => {
    for (const ancho of [360, 390, 800, 1024, 1032, 1044, 1052, 1064, 1280]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      const m = await tituloBajoLaBarra(page);
      expect(m.total).toBeGreaterThan(100);
      expect(m.tapados, `${ancho} px: puntos del título bajo el logo`).toBe(0);
    }
  });
});

test.describe('hero bajo stemum.com — re-inspección 02/10/2026', () => {
  test.beforeEach(async ({ page }) => {
    await puenteHmr(page);
    await page.goto('http://stemum.com/visualizador-volumenes/');
    await esperarPaginaAsentada(page);
    await expect(page.locator('html')).toHaveAttribute('data-brand', 'stemum');
    await expect(page.locator('[class*="stemumPill"]')).toBeVisible();
  });

  test('a 360, 390, 800 y 1023 px la píldora «Stemum › Matemáticas» no tapa el título', async ({
    page,
  }) => {
    for (const ancho of [360, 390, 800, 1023, 1120, 1280]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      const m = await tituloBajoLaBarra(page);
      expect(m.total).toBeGreaterThan(100);
      expect(m.tapados, `${ancho} px: puntos del título bajo la píldora`).toBe(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS de la re-inspección del 02/10/2026 — FALLAN a propósito
// ═══════════════════════════════════════════════════════════════════════════

// HALLAZGO (accesibilidad, bajo) — Bajo stemum.com, de 1024 a 1105 px, la píldora fija
// «Stemum › Matemáticas» pisa el 🔷 del principio del h1. Es el corte de a1d72a9c (80 px de
// hueco solo hasta 1023 px, medido con el logo de meskeia.com, que llega a x = 203) y el mismo
// defecto que 2589 en simulador-punnett, pero más ancho: «Matemáticas» lleva la píldora hasta
// x = 287 (la de «Biología» llegaba a 253), así que el rango tapado sube de 1024-1052 a
// 1024-1105 px. Las letras quedan libres por 4-7 px; con un título más largo, no.
// Caso: http://stemum.com/visualizador-volumenes/ a 1024×900 → esperado 0 puntos del h1 bajo la
//       barra fija (como a 1023 px) · obtenido 160 de 1287 a 1024 px, 142 a 1040, 104 a 1060 y
//       14 a 1100; 0 desde 1106.
test.describe('hero bajo stemum.com — hallazgo abierto 02/10/2026', () => {
  test.beforeEach(async ({ page }) => {
    await puenteHmr(page);
    await page.goto('http://stemum.com/visualizador-volumenes/');
    await esperarPaginaAsentada(page);
    await expect(page.locator('[class*="stemumPill"]')).toBeVisible();
  });

  test('de 1024 a 1105 px la píldora «Stemum › Matemáticas» no pisa el título', async ({ page }) => {
    test.fail();
    const tapados: string[] = [];
    for (const ancho of [1024, 1040, 1060, 1080, 1100]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      const m = await tituloBajoLaBarra(page);
      expect(m.total).toBeGreaterThan(100);
      if (m.tapados > 0) tapados.push(`${ancho} px: ${m.tapados}/${m.total}`);
    }
    expect(tapados).toEqual([]);
  });
});

// HALLAZGO (operativa, medio) — La promesa de f0e61b70 («el resultado vuelve a caber sin scroll
// en móvil») solo se cumple en el caso exacto que mide su testigo, la ESFERA a 390×844. Con las
// otras cuatro figuras cada medida añade un control de 84 px encima de la tarjeta: a 390×844
// cilindro, cono y pirámide la dejan en 818-914 —el NÚMERO, en 852-880, entero bajo el pliegue,
// mientras el segundo deslizador (684-768) está a la vista: se mueve y no se ve qué cambia— y el
// ortoedro en 902-998. A 360×800, el ancho Android más común, ni siquiera la esfera: el hero y el
// aviso legal crecen 44 px y la tarjeta queda en 778-875, con el número (812-840) fuera. Un
// aviso del campo (p. ej. al teclear el «0» de «0,5») empuja la tarjeta 65 px más.
// Caso: 390×844, Cilindro → esperado tarjeta de resultado entera en la primera pantalla ·
//       obtenido 818-914 (número 852-880); Cono y Pirámide igual, Ortoedro 902-998; y a
//       360×800, Esfera → obtenido 778-875.
// HALLAZGO (operativa, bajo) — Y el DIBUJO sigue sin verse en la primera pantalla: lo que asoma
// a 390×844 son 7 px VACÍOS de la caja del <svg> (desde 837), porque el lienzo mide 290 px y la
// figura va centrada: la esfera empieza a 954 px. El testigo de 1222 mide la caja y pasa en verde.
// Caso: 390×844, Esfera → esperado la figura asoma sobre el pliegue (y < 844) · obtenido el
//       <circle> empieza en y = 954; a 360×800 la caja del <svg> ni asoma (881).
test.describe('en móvil (390×844) — hallazgos abiertos 02/10/2026', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('con la esfera, tras escribir una medida, la tarjeta sigue entera a la vista', async ({
    page,
  }) => {
    // Lo que SÍ cumple f0e61b70: medido el 02/10/2026, tarjeta 734-830 con el pliegue en 844
    await escribir(campo(page, 'Radio (r)'), '12,5');
    await expect(valorVolumen(page)).toHaveText('8181,2');
    const tarjeta = await page.locator('[class*=resultCard]').boundingBox();
    expect(tarjeta).not.toBeNull();
    expect((tarjeta?.y ?? 0) + (tarjeta?.height ?? Infinity)).toBeLessThanOrEqual(844);
  });

  test('con cilindro, cono, pirámide y ortoedro la tarjeta de resultado también cabe', async ({
    page,
  }) => {
    test.fail();
    const cortadas: string[] = [];
    for (const figura of [/Cilindro/, /Cono/, /Pirámide/, /Ortoedro/]) {
      await elegirFigura(page, figura);
      await page.evaluate(() => window.scrollTo(0, 0));
      const t = await page.locator('[class*=resultCard]').boundingBox();
      const fin = t ? t.y + t.height : Infinity;
      if (fin > 844) cortadas.push(`${figura.source}: ${Math.round(t?.y ?? 0)}-${Math.round(fin)}`);
    }
    expect(cortadas).toEqual([]);
  });

  test('la FIGURA asoma en la primera pantalla, no solo la caja vacía del <svg>', async ({
    page,
  }) => {
    test.fail();
    await page.evaluate(() => window.scrollTo(0, 0));
    // La caja del <svg> sí empieza sobre el pliegue (837 < 844): eso es lo que mide 1222…
    expect((await dibujo(page).boundingBox())?.y ?? Infinity).toBeLessThan(844);
    // …pero la esfera, no (954)
    const esfera = await dibujo(page).locator('circle').boundingBox();
    expect(esfera?.y ?? Infinity).toBeLessThan(844);
  });
});

test.describe('en móvil (360×800) — hallazgo abierto 02/10/2026', () => {
  test.use({
    viewport: { width: 360, height: 800 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('con la esfera, el control y la tarjeta de resultado caben en la primera pantalla', async ({
    page,
  }) => {
    test.fail();
    await escribir(campo(page, 'Radio (r)'), '12,5');
    await expect(valorVolumen(page)).toHaveText('8181,2');
    await page.evaluate(() => window.scrollTo(0, 0));
    // El control sí (deslizador hasta 729)…
    const deslizador = await page.locator('input[type=range]').first().boundingBox();
    expect((deslizador?.y ?? Infinity) + (deslizador?.height ?? 0)).toBeLessThanOrEqual(800);
    // …la tarjeta no (778-875)
    const tarjeta = await page.locator('[class*=resultCard]').boundingBox();
    expect((tarjeta?.y ?? 0) + (tarjeta?.height ?? Infinity)).toBeLessThanOrEqual(800);
  });
});

/**
 * Qué parte de cada rótulo BLANCO del dibujo cae sobre la figura (y no sobre el fondo blanco de
 * la tarjeta). Se mide en coordenadas del propio SVG con `isPointInFill` sobre las formas
 * pintadas (sin la sombra), muestreando la caja del texto de píxel en píxel.
 */
async function rotulosBlancos(page: Page): Promise<{ texto: string; sobreFigura: number }[]> {
  return dibujo(page).evaluate((svg) => {
    const formas = Array.from(
      svg.querySelectorAll<SVGGeometryElement>('circle, ellipse, polygon, rect'),
    ).filter((f) => {
      const relleno = f.getAttribute('fill') ?? '';
      return relleno !== 'none' && !relleno.startsWith('rgba(0,0,0');
    });
    return Array.from(svg.querySelectorAll<SVGTextElement>('text'))
      .filter((t) => t.getAttribute('fill') === 'white')
      .map((t) => {
        const b = t.getBBox();
        let dentro = 0;
        let total = 0;
        for (let x = b.x + 0.5; x < b.x + b.width; x += 1) {
          for (let y = b.y + b.height * 0.25; y < b.y + b.height * 0.85; y += 1) {
            total++;
            const p = new DOMPoint(x, y);
            if (formas.some((f) => f.isPointInFill(p))) dentro++;
          }
        }
        return { texto: t.textContent ?? '', sobreFigura: Math.round((100 * dentro) / total) };
      });
  });
}

// HALLAZGO (accesibilidad, medio) — Los rótulos BLANCOS del dibujo («r=» de la esfera y del
// cilindro, «h=» de la pirámide) se colocan con un desplazamiento fijo y se salen de la figura:
// lo que cae fuera es blanco sobre el blanco de la tarjeta (1:1) en tema claro. Pasa YA en el
// arranque: la pirámide l=6 h=8 se rotula «=8» (la «h», fuera de la cara: 51 % del rótulo sobre
// la figura) y al «r=4» del cilindro le falta la mitad de arriba (55 %). Y con figuras pequeñas
// o estrechas desaparecen enteros: cilindro r=1 h=50 → «r=1» 0 %; pirámide l=1 h=50 → «h=50»
// 0 %; la célula de la guía, esfera r=0,01 → 21 %. Las demás etiquetas van en
// var(--text-primary) y no tienen el problema. En oscuro el fondo es oscuro y se leen.
// Caso: tema claro, Pirámide de arranque (l=6, h=8) → esperado «h=8» legible · obtenido «=8»
//       (51 % del rótulo sobre la cara; el resto, blanco sobre rgb(255, 255, 255)).
test('los rótulos blancos del dibujo caen sobre la figura, no sobre el fondo blanco', async ({
  page,
}) => {
  test.fail();
  const fuera: string[] = [];
  const anotar = async (caso: string) => {
    for (const r of await rotulosBlancos(page)) {
      if (r.sobreFigura < 90) fuera.push(`${caso}: «${r.texto}» ${r.sobreFigura} % sobre la figura`);
    }
  };
  await elegirFigura(page, /Pirámide/);
  await anotar('pirámide l=6 h=8');
  await elegirFigura(page, /Cilindro/);
  await escribir(campo(page, 'Radio (r)'), '1');
  await escribir(campo(page, 'Altura (h)'), '50');
  await anotar('cilindro r=1 h=50');
  await elegirFigura(page, /Esfera/);
  await escribir(campo(page, 'Radio (r)'), '0,01');
  await anotar('esfera r=0,01');
  expect(fuera).toEqual([]);
});

/**
 * Contraste WCAG, en el PEOR punto de cada texto, del blanco de la tarjeta de resultado contra
 * su degradado (135deg, --primary → --secondary), con la opacidad del texto aplicada. El color
 * del fondo bajo cada punto sale de la geometría del degradado CSS: el cálculo se contrastó el
 * 02/10/2026 con los píxeles de una captura (cota optimista por fila: 3,24-3,93:1 en claro y
 * 2,34-2,72:1 en oscuro, del mismo orden que esto).
 */
async function contrasteTarjeta(page: Page): Promise<Record<string, number>> {
  return page.locator('[class*=resultCard]').evaluate((tarjeta) => {
    const colores = Array.from(getComputedStyle(tarjeta).backgroundImage.matchAll(/rgba?\(([^)]+)\)/g)).map(
      (m) => m[1].split(',').map((x) => parseFloat(x)),
    );
    const [c0, c1] = colores;
    const caja = tarjeta.getBoundingClientRect();
    const ang = (135 * Math.PI) / 180;
    const largo = Math.abs(caja.width * Math.sin(ang)) + Math.abs(caja.height * Math.cos(ang));
    const fondoEn = (x: number, y: number): number[] => {
      const dx = x - caja.width / 2;
      const dy = y - caja.height / 2;
      const t = Math.min(1, Math.max(0, (dx * Math.sin(ang) - dy * Math.cos(ang)) / largo + 0.5));
      return [0, 1, 2].map((i) => c0[i] + (c1[i] - c0[i]) * t);
    };
    const canal = (c: number): number => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (c: number[]): number => 0.2126 * canal(c[0]) + 0.7152 * canal(c[1]) + 0.0722 * canal(c[2]);
    const salida: Record<string, number> = {};
    for (const [nombre, sel] of [
      ['etiqueta', '[class*=resultLabel]'],
      ['valor', '[class*=resultValor]'],
      ['unidad', '[class*=resultUnidad]'],
    ]) {
      const el = tarjeta.querySelector(sel) as HTMLElement;
      const rango = document.createRange();
      rango.selectNodeContents(el);
      const t = rango.getBoundingClientRect();
      const op = parseFloat(getComputedStyle(el).opacity);
      const color = (getComputedStyle(el).color.match(/[\d.]+/g) ?? []).map(Number);
      let peor = 99;
      for (let x = t.left; x <= t.right; x += 2) {
        const fondo = fondoEn(x - caja.left, (t.top + t.bottom) / 2 - caja.top);
        const texto = [0, 1, 2].map((i) => color[i] * op + fondo[i] * (1 - op));
        const a = lum(texto);
        const b = lum(fondo);
        peor = Math.min(peor, (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05));
      }
      salida[nombre] = +peor.toFixed(2);
    }
    return salida;
  });
}

// HALLAZGO (accesibilidad, medio) — La tarjeta del resultado pone texto BLANCO sobre un degradado
// de --primary a --secondary (el teal, 2,80:1 con blanco según el CLAUDE.md), y encima rebaja la
// etiqueta y la unidad con opacidad 0,9 y 0,85. Medido en el peor punto de cada texto: en claro,
// «VOLUMEN» (13 px, seminegrita) 3,04:1 y «unidades³» (13,6 px) 2,78:1, por debajo de 4,5:1; el
// número (32 px, negrita: texto grande) 3,28:1, que pasa por poco. En OSCURO el degradado se
// aclara (#3FA5D1 → #5ABDB9) y el propio NÚMERO, que es el resultado de la app, cae a 2,46:1, por
// debajo incluso del 3:1 del texto grande; etiqueta 2,29:1 y unidad 2,15:1. El candado de
// contraste solo vigila cabeceras de tabla (los fondos de marca con blanco son «campaña aparte»);
// los tokens --primary-boton / --secondary-boton existen para esto.
// Caso: tema oscuro, resultado de arranque «523,6» → esperado ≥ 3:1 (texto grande) · obtenido
//       2,46:1; tema claro, «VOLUMEN» → esperado ≥ 4,5:1 · obtenido 3,04:1.
test('el texto de la tarjeta de resultado llega al contraste mínimo en los dos temas', async ({
  page,
}) => {
  test.fail();
  await page.addStyleTag({
    content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
  });
  const fallan: string[] = [];
  for (const tema of ['claro', 'oscuro']) {
    if (tema === 'oscuro') {
      await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).first().click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    }
    const c = await contrasteTarjeta(page);
    if (c.etiqueta < 4.5) fallan.push(`${tema} · etiqueta ${c.etiqueta}:1`);
    if (c.unidad < 4.5) fallan.push(`${tema} · unidad ${c.unidad}:1`);
    if (c.valor < 3) fallan.push(`${tema} · número ${c.valor}:1`);
  }
  expect(fallan).toEqual([]);
});

// HALLAZGO (operativa, bajo) — Con medidas pequeñas, cuatro de las cinco figuras se reducen a una
// mota y sus rótulos se montan unos sobre otros. La escala del dibujo tiene un TOPE de 13 px por
// unidad (`Math.min(…, 13)` en SvgCubo, SvgCilindro, SvgCono y SvgPiramide), así que por debajo de
// ~8 unidades la figura deja de ajustarse al lienzo: el ortoedro de 1 × 1 × 1, que está DENTRO del
// recorrido del deslizador, mide 26 px y sus rótulos «a=1» y «b=1» se pisan 9 px; una caja de
// 0,5 × 0,5 × 0,5 (50 cm medidos en metros) mide 13 px y «a=0,5»/«b=0,5» se pisan 24 px; un
// cilindro r=0,01 h=0,02 mide 0,4 px. La esfera sí tiene un mínimo (12 px de radio desde la
// reparación del 19/08), y el campo de la guía propone medir justo así («r = 0,01»).
// Caso: Ortoedro 0,5 × 0,5 × 0,5 → esperado una figura visible (≥ 24 px, el mínimo de la esfera)
//       con sus tres rótulos legibles · obtenido 13 px de alto y «a=0,5» y «b=0,5» solapados 24 px.
test('con medidas pequeñas el ortoedro se sigue viendo y sus rótulos no se pisan', async ({
  page,
}) => {
  test.fail();
  const medir = () =>
    dibujo(page).evaluate((svg) => {
      const rotulos = Array.from(svg.querySelectorAll<SVGTextElement>('text')).map((t) => t.getBBox());
      const [a, b] = rotulos;
      const solape = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
      let arriba = Infinity;
      let abajo = -Infinity;
      for (const p of Array.from(svg.querySelectorAll<SVGPolygonElement>('polygon'))) {
        const c = p.getBBox();
        arriba = Math.min(arriba, c.y);
        abajo = Math.max(abajo, c.y + c.height);
      }
      return { solape: +solape.toFixed(1), alto: +(abajo - arriba).toFixed(1) };
    });
  const fallos: string[] = [];
  await elegirFigura(page, /Ortoedro/);
  for (const medida of ['1', '0,5']) {
    for (const nombre of ['Anchura (a)', 'Profundidad (b)', 'Altura (h)']) {
      await escribir(campo(page, nombre), medida);
    }
    const m = await medir();
    if (m.solape > 0) fallos.push(`${medida}³: «a=» y «b=» se pisan ${m.solape} px`);
    if (m.alto < 24) fallos.push(`${medida}³: la figura mide ${m.alto} px`);
  }
  expect(fallos).toEqual([]);
});

// HALLAZGO (dato, bajo) — La fórmula, el rótulo del dibujo, el pie y el aria-label del deslizador
// escriben la medida con medExacta(), que la corta a SEIS decimales («hasta seis decimales, que es
// donde el campo deja de admitir más», dice su comentario, y es falso: el campo admite cualquier
// número). Entre 0,0001 y 0,001 eso deja tres cifras significativas mientras el volumen sale con
// siete, así que rehacer la operación que la app enseña no da el número que la app muestra —el
// hallazgo 108 de agosto, que se cerró para dos decimales—: r = 0,0009999 se escribe «0,001000»
// (que además aparenta cuatro cifras exactas), y r = 0,0001234 y r = 0,00012345 enseñan la misma
// fórmula, «0,000123³», con volúmenes distintos (7,871076 y 7,880647 ×10⁻¹²).
// Caso: esfera r=0,0009999 → esperado «(4/3) × π × 0,0009999³» (V = 4,187534×10⁻⁹) · obtenido
//       «(4/3) × π × 0,001000³», que rehecha da 4,188790×10⁻⁹.
test('la fórmula escribe la medida entera, no cortada a seis decimales', async ({ page }) => {
  test.fail();
  // 0,9999³ = 0,99970003 ; × 4,18879020479 = 4,1875336934 → 4,187534×10⁻⁹
  await escribir(campo(page, 'Radio (r)'), '0,0009999');
  await expect(valorVolumen(page)).toHaveText('4,187534×10⁻⁹');
  await expect(formulaAplicada(page)).toHaveText('V = (4/3) × π × r³ = (4/3) × π × 0,0009999³');
});

// HALLAZGO (accesibilidad, bajo) — Al TECLEAR cualquier medida menor que 1 salta un aviso de error
// a mitad de escritura: el «0» inicial (y «0,», «0,0»…) ya se valida como medida, cae en «≤ 0» y
// monta un <p role="alert"> que el lector de pantalla anuncia —«La medida debe estar entre 0 y
// 100.000…»— mientras el usuario está escribiendo justo lo que la guía propone (r = 0,01). En
// pantalla, además, empuja la tarjeta de resultado 65 px (en 390×844 la saca del pliegue). Con
// «12,5» no pasa: el problema es solo el cero de delante, que es un prefijo válido de un número.
// Caso: campo del radio vacío, teclear «0,5» tecla a tecla → esperado ningún aviso y 0,5236 al
//       final · obtenido el aviso se monta en «0», sigue en «0,» y se retira en «0,5».
test('teclear «0,5» no anuncia un error a mitad de escritura', async ({ page }) => {
  test.fail();
  const radio = campo(page, 'Radio (r)');
  await radio.fill('');
  await page.evaluate(() => {
    const w = window as unknown as { __avisos: string[] };
    w.__avisos = [];
    new MutationObserver((cambios) => {
      for (const c of cambios) {
        for (const n of Array.from(c.addedNodes)) {
          if (n instanceof HTMLElement && n.matches('p[role="alert"]')) w.__avisos.push(n.textContent ?? '');
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  });
  await radio.pressSequentially('0,5');
  await expect(radio).toHaveValue('0,5');
  await expect(valorVolumen(page)).toHaveText('0,5236'); // (4/3)·π·0,125 = 0,5235988
  const avisos = await page.evaluate(() => (window as unknown as { __avisos: string[] }).__avisos);
  expect(avisos).toEqual([]);
});
