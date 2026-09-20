import { test, expect, devices, Locator, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * Simulador de Baja Visión — inspección del 20/09/2026
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Simulador de Baja Visión» y el subtítulo «Experimenta cómo ven las
 *   personas con distintas condiciones visuales». No es una app de cribado: no pregunta
 *   nada sobre quien la usa ni emite juicio alguno sobre su vista. Lo que hace es aplicar
 *   un filtro sobre una maqueta de interfaz fija, para que un diseñador vea su propio
 *   trabajo con esa condición encima. Nueve botones: «Visión normal» (referencia),
 *   cataratas, miopía severa, glaucoma, degeneración macular, baja visión general,
 *   y tres daltonismos (protanopia, deuteranopia, tritanopia).
 *
 *   No publica NINGUNA cifra de agudeza visual (ni decimal, ni Snellen, ni logMAR) ni de
 *   campo visual en grados, y no atribuye criterio alguno a la OMS ni a la ONCE en la
 *   página. Lo único cuantitativo que afirma son PREVALENCIAS, y eso es lo que se coteja.
 *
 * LAS CIFRAS, COTEJADAS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   · Cataratas «~17% mayores de 40 años» — el 17,2 % del Eye Diseases Prevalence
 *     Research Group (2004) para ≥40 años. Coherente.
 *   · Glaucoma «~2% mayores de 40 años» y D. macular «~8% mayores de 60 años» —
 *     órdenes de magnitud habituales en la literatura. Coherentes.
 *   · Protanopia y deuteranopia «~1% hombres» cada una, y la tabla «Daltonismo 8%
 *     hombres» (dicromacias + tricromacias anómalas). No se contradicen.
 *   · Tritanopia «~0,01% de la población». Coherente.
 *   · ⚠️ Baja visión general «~2,2% de la población mundial» — NO lo respalda ninguna
 *     fuente. La OMS (World Report on Vision, 2019) cuenta 2.200 MILLONES DE PERSONAS con
 *     deficiencia visual, que son ≈28 % de la población, no el 2,2 %. Y el propio FAQPage
 *     de esta app (metadata.ts) dice «253 millones … de las cuales 217 millones presentan
 *     baja visión moderada o grave» → 217/7.700 = 2,8 %. La cifra no cuadra ni con la
 *     fuente ni consigo misma: parece «2,2 mil millones» con la unidad cambiada.
 *   · ⚠️ Miopía severa «~30% de la población (algún grado)» — el 30 % es la miopía DE
 *     CUALQUIER GRADO (Holden et al., Ophthalmology 2016: 28,3 % en 2020). La miopía alta,
 *     que es la que el botón llama «severa», está en el 4,0 %. Siete veces menos.
 *
 * EL FILTRO DE DALTONISMO, CALCULADO A MANO
 *   Las tres matrices del page.tsx son las que circulan en la literatura de accesibilidad
 *   web, que se aplican a valores sRGB de 8 bits tal cual. NO son las de Viénot et al.
 *   (1999) para RGB lineal: recomponiendo esa cadena (RGB→LMS de Smith-Pokorny, proyección
 *   dicromática, vuelta) sale [0,112 0,888 0] para protanopia, no [0,567 0,433 0].
 *
 *   Pero un <filter> de SVG sin `color-interpolation-filters="sRGB"` opera, POR DEFECTO DE
 *   LA ESPECIFICACIÓN, en linearRGB: el navegador lineariza, multiplica y vuelve a
 *   comprimir. Sobre la píldora roja de la maqueta (#dc2626 = 220,38,38):
 *
 *     protanopia, la matriz aplicada en sRGB  →  0,567·220 + 0,433·38 = 141,19 → 141
 *                                                0,558·220 + 0,442·38 = 139,56 → 140
 *                                                0,242·38  + 0,758·38 = 38,00  →  38
 *                                             =  rgb(141, 140, 38)
 *     protanopia, la misma matriz en linearRGB → rgb(172, 171, 38)   ← lo que se pinta
 *
 *   Y lo mismo para las otras dos: deuteranopia rgb(152,165,38) frente a rgb(180,189,38),
 *   tritanopia rgb(211,38,38) frente a rgb(215,38,38). La consecuencia cae justo en la
 *   métrica que la propia app enseña («Contraste mínimo WCAG AA: 4,5:1»): la píldora roja
 *   con texto blanco da 4,83:1 sin filtro, 3,55:1 con lo que dice la matriz y 2,44:1 con
 *   lo que el navegador pinta. La app hereda esos números sin declarar el espacio de color.
 *   El vecino `simulador-daltonismo` sí lo resuelve a propósito, en canvas y con un
 *   comentario que lo explica; aquí no hay atributo ninguno.
 *
 * LOS EXTREMOS DEL DESLIZADOR, CALCULADOS A MANO
 *   `min=10 max=100 step=5`, arranca en 60. No hay 0 %: la referencia intacta es el botón
 *   «Visión normal» (filter `none`, sin superposición y sin deslizador).
 *     cataratas i=10  → blur((10/100)·3)=0,30px · sepia(0,06) · brightness(1−0,025)=0,97
 *                       (0,975 en coma flotante es 0,97499…, y toFixed(2) da «0.97») ·
 *                       contrast(0,97)
 *     cataratas i=100 → blur(3px) sepia(0,6) brightness(0,75) contrast(0,7)
 *     glaucoma/macular → el filtro se queda en `none` y lo que se mueve es la opacidad de
 *                       la capa superpuesta: i/100, o sea 0,1 en el mínimo y 1 en el máximo.
 *
 * LO QUE ESTOS TRES CASOS FIJAN
 *   1) dato: las nueve prevalencias publicadas y el recuento real de condiciones, más la
 *      ausencia de cifras de agudeza/campo (que es lo que evita atribuir a OMS/ONCE un
 *      criterio que no es suyo), más el aviso de «no diagnóstico» que hoy nace invisible.
 *   2) operativa/límite: los dos extremos del deslizador medidos de verdad sobre el estilo
 *      computado, y el COLOR realmente pintado bajo los tres daltonismos.
 *   3) rechazo, en móvil (Pixel 7): vaciar el control y meterle valores imposibles.
 */

const RUTA = '/simulador-baja-vision/';
const DESLIZADOR = '#slider-intensidad';

/**
 * El deslizador sólo se monta al elegir una condición con intensidad, así que el testigo
 * de hidratación tiene que ser otro input de la página: los dos campos de sólo lectura de
 * la maqueta, que React monta desde el primer render.
 */
const TESTIGO = 'input[aria-label="Campo de demostración"]';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [TESTIGO]);
}

const botonCondicion = (page: Page, nombre: string): Locator =>
  page.getByRole('button', { name: nombre, exact: true });

async function elegirCondicion(page: Page, nombre: string): Promise<void> {
  await botonCondicion(page, nombre).click();
  await expect(botonCondicion(page, nombre)).toHaveAttribute('aria-pressed', 'true');
}

/** El `filter` computado de la maqueta y la opacidad de la capa superpuesta, si la hay. */
async function leerSimulacion(page: Page): Promise<{ filtro: string; overlay: string | null }> {
  return page.evaluate(() => {
    const demo = document.querySelector('[class*="demoContenido"]')!;
    const capa = document.querySelector('[class*="overlay"]');
    return {
      filtro: getComputedStyle(demo).filter,
      overlay: capa ? getComputedStyle(capa).opacity : null,
    };
  });
}

/**
 * El color que de verdad se pinta en un elemento con el filtro encima. No vale
 * `getComputedStyle`, que devuelve el color ANTES del filtro: hay que capturar el píxel.
 * Se hace una captura del elemento y se decodifica en el propio navegador con un canvas,
 * quedándose con el color más repetido (el fondo de la píldora, frente al texto blanco).
 */
async function colorPintado(page: Page, elemento: Locator): Promise<string> {
  const png = (await elemento.screenshot()).toString('base64');
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const lienzo = document.createElement('canvas');
    lienzo.width = img.width;
    lienzo.height = img.height;
    const ctx = lienzo.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, lienzo.width, lienzo.height).data;
    const cuenta = new Map<string, number>();
    for (let i = 0; i < d.length; i += 4) {
      const clave = `${d[i]},${d[i + 1]},${d[i + 2]}`;
      cuenta.set(clave, (cuenta.get(clave) ?? 0) + 1);
    }
    return [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }, png);
}

// ─────────────────────────────────────────────────────────────────────────────
// CASO 1 · DATO — las cifras que la app publica
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 1 · dato: las cifras publicadas', () => {
  test('cada condición muestra la prevalencia que tiene escrita', async ({ page }) => {
    await abrir(page);

    // Literal de data del page.tsx, cotejado en la cabecera de este fichero.
    const esperado: ReadonlyArray<readonly [string, string]> = [
      ['Visión normal', 'Base de referencia'],
      ['Cataratas', '~17% mayores de 40 años'],
      ['Glaucoma', '~2% mayores de 40 años'],
      ['Degeneración macular', '~8% mayores de 60 años'],
      ['Protanopia (rojo)', '~1% hombres'],
      ['Deuteranopia (verde)', '~1% hombres'],
      ['Tritanopia (azul)', '~0,01% de la población'],
    ];
    for (const [condicion, prevalencia] of esperado) {
      await elegirCondicion(page, condicion);
      await expect(page.locator('[class*="infoPrevalencia"]')).toHaveText(prevalencia);
    }

    // ⚠️ HALLAZGO (dato) — la OMS cuenta 2.200 MILLONES DE PERSONAS con deficiencia visual
    // (≈28 % de la población), y el FAQPage de esta misma app da 217 millones con baja
    // visión moderada o grave (2,8 %). El «2,2 % de la población mundial» no sale de
    // ninguna de las dos. Se fija el texto actual para que una corrección se note aquí.
    await elegirCondicion(page, 'Baja visión general');
    await expect(page.locator('[class*="infoPrevalencia"]')).toHaveText(
      '~2,2% de la población mundial',
    );

    // ⚠️ HALLAZGO (dato) — el 30 % es la miopía de cualquier grado (Holden 2016: 28,3 %);
    // la miopía alta, que es la que el botón llama «severa», está en el 4,0 %.
    await elegirCondicion(page, 'Miopía severa');
    await expect(page.locator('[class*="infoPrevalencia"]')).toHaveText(
      '~30% de la población (algún grado)',
    );
    await expect(page.locator('[class*="tabla"] tbody tr').nth(1)).toContainText('30% algún grado');
  });

  test('son 9 condiciones, de las cuales 3 son daltonismos', async ({ page }) => {
    await abrir(page);

    // ⚠️ HALLAZGO (dato) — el jsonLd de metadata.ts anuncia «9 condiciones: cataratas,
    // miopía severa, glaucoma, degeneración macular y 4 TIPOS DE DALTONISMO», y el FAQPage
    // remata con «algunas formas de daltonismo (protanopia, deuteranopia)». Ni son 4 ni
    // son 2: son 3. Y de los 9 botones uno es «Visión normal», que es la referencia sin
    // condición, mientras que «Baja visión general» —la que da nombre a la app— no aparece
    // en esa enumeración. Estas cifras son las que alimentan el grounding de las IAs.
    await expect(page.locator('[class*="condicionesGrid"] button')).toHaveCount(9);
    for (const daltonismo of ['Protanopia (rojo)', 'Deuteranopia (verde)', 'Tritanopia (azul)']) {
      await expect(botonCondicion(page, daltonismo)).toBeVisible();
    }
    await expect(botonCondicion(page, 'Visión normal')).toBeVisible();
  });

  test('no publica agudeza visual ni campo visual, así que no atribuye criterios a la OMS ni a la ONCE', async ({
    page,
  }) => {
    await abrir(page);
    const texto = (await page.locator('main').innerText()) + (await page.locator('header').innerText());

    // La app se mantiene en el terreno del diseño: ni escala decimal (0,1 · 0,3 · 0,05),
    // ni Snellen (20/200 · 20/60), ni logMAR, ni grados de campo visual. Por eso no puede
    // atribuir a la OMS (CIE-11: baja visión < 0,3; ceguera < 0,05 o campo < 10°) ni a la
    // ONCE (≤ 0,1 o campo ≤ 10°) un criterio que no sea suyo. Si algún día aparece una de
    // estas cadenas, hay que volver a cotejarla contra la fuente.
    for (const patron of [/\b20\s*\/\s*\d{2,3}\b/, /logMAR/i, /agudeza visual/i, /\bONCE\b/, /\d+\s*°\s*(de\s*)?campo/i]) {
      expect(texto).not.toMatch(patron);
    }
  });

  test('el único aviso de «no es diagnóstico» nace invisible, doblemente plegado', async ({
    page,
  }) => {
    await abrir(page);

    // ⚠️ HALLAZGO (contenido) — CLAUDE.md prohíbe expresamente esconder una advertencia de
    // responsabilidad dentro de <EducationalSection>: «es responsabilidad jurídica, no
    // maquetación». La frase «No uses este simulador para fines diagnósticos» está en el
    // DOM (bien para el buscador), pero de origen queda tras DOS pliegues: la sección
    // educativa arranca con aria-expanded=false y su contenido va a display:none, y dentro
    // hay además un <details> cerrado. La app no monta DisclaimerCard (lleva
    // `// @disclaimer: exempt`), así que esa frase es lo ÚNICO que acota el alcance de una
    // herramienta que nombra cinco enfermedades oculares con su prevalencia.
    const aviso = page.getByText('No uses este simulador para fines diagnósticos');
    await expect(aviso).toHaveCount(1); // está en el DOM
    await expect(aviso).not.toBeVisible(); // pero no se ve

    await expect(page.getByRole('button', { name: /guía educativa/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(
      await page.evaluate(() =>
        [...document.querySelectorAll('details')].some((d) =>
          d.textContent?.includes('No uses este simulador para fines diagnósticos') ? d.open : false,
        ),
      ),
    ).toBe(false);

    // Lo que sí se ve de entrada es el aviso legal, que es obligatorio y está.
    await expect(page.getByRole('link', { name: /Términos de Uso/ })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 2 · OPERATIVA / LÍMITE — los dos extremos, medidos de verdad
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 2 · operativa: los extremos de la simulación', () => {
  test('«Visión normal» es la referencia intacta: sin filtro, sin capa y sin deslizador', async ({
    page,
  }) => {
    await abrir(page);
    await elegirCondicion(page, 'Visión normal');
    // Arranca aquí, así que es el estado por defecto de la app.
    expect(await leerSimulacion(page)).toEqual({ filtro: 'none', overlay: null });
    // El deslizador NO existe con esta condición: el mínimo del control es 10 %, no 0 %,
    // de modo que la imagen intacta sólo se consigue por este botón.
    await expect(page.locator(DESLIZADOR)).toHaveCount(0);
  });

  test('cataratas: el mínimo y el máximo del deslizador dan filtros distintos y calculados', async ({
    page,
  }) => {
    await abrir(page);
    await elegirCondicion(page, 'Cataratas');
    await expect(page.locator(DESLIZADOR)).toHaveAttribute('min', '10');
    await expect(page.locator(DESLIZADOR)).toHaveAttribute('max', '100');

    // i = 10 → blur 0,1·3 = 0,30px · sepia 0,1·0,6 = 0,06 · brightness 1−0,025 = 0,97
    // (0,975 es 0,97499… en coma flotante, así que toFixed(2) baja a 0.97) · contrast 0,97
    await sembrarValor(page, DESLIZADOR, 10);
    expect(await leerSimulacion(page)).toEqual({
      filtro: 'blur(0.3px) sepia(0.06) brightness(0.97) contrast(0.97)',
      overlay: null,
    });
    await expect(page.locator('label[for="slider-intensidad"]')).toContainText('10%');

    // i = 100 → blur 3px · sepia 0,6 · brightness 1−0,25 = 0,75 · contrast 1−0,3 = 0,7
    await sembrarValor(page, DESLIZADOR, 100);
    expect(await leerSimulacion(page)).toEqual({
      filtro: 'blur(3px) sepia(0.6) brightness(0.75) contrast(0.7)',
      overlay: null,
    });
    await expect(page.locator('label[for="slider-intensidad"]')).toContainText('100%');
  });

  test('glaucoma y degeneración macular no filtran: mueven la opacidad de su capa (i/100)', async ({
    page,
  }) => {
    await abrir(page);

    for (const condicion of ['Glaucoma', 'Degeneración macular']) {
      await elegirCondicion(page, condicion);
      await sembrarValor(page, DESLIZADOR, 10);
      expect(await leerSimulacion(page)).toEqual({ filtro: 'none', overlay: '0.1' });
      await sembrarValor(page, DESLIZADOR, 100);
      expect(await leerSimulacion(page)).toEqual({ filtro: 'none', overlay: '1' });
    }

    // Cada una usa su propio degradado, no el mismo con otro nombre.
    await elegirCondicion(page, 'Glaucoma');
    await expect(page.locator('[class*="overlayGlaucoma"]')).toHaveCount(1);
    await elegirCondicion(page, 'Degeneración macular');
    await expect(page.locator('[class*="overlayMacular"]')).toHaveCount(1);
  });

  test('los tres daltonismos pintan un color distinto del que dicen sus matrices', async ({
    page,
  }) => {
    await abrir(page);
    const pildoraRoja = page.locator('[class*="badgeRojo"]').first();

    // Sin filtro, la píldora es su propio #dc2626 = rgb(220,38,38).
    await elegirCondicion(page, 'Visión normal');
    expect(await colorPintado(page, pildoraRoja)).toBe('220,38,38');

    // ⚠️ HALLAZGO (cálculo) — ninguno de los tres <filter> declara
    // `color-interpolation-filters="sRGB"`, así que el navegador aplica sus matrices en el
    // linearRGB que manda la especificación SVG por defecto. Resultado: lo pintado no es lo
    // que la matriz del page.tsx calcula. Sobre rgb(220,38,38), hecho a mano:
    //
    //   condición      matriz en sRGB (lo que dice)   linearRGB (lo que se pinta)
    //   protanopia     rgb(141, 140, 38)              rgb(172, 171, 38)
    //   deuteranopia   rgb(152, 165, 38)              rgb(180, 189, 38)
    //   tritanopia     rgb(211,  38, 38)              rgb(215,  38, 38)
    //
    // Se fija lo MEDIDO. El día que se añada el atributo, estos tres valores pasarán a los
    // de la columna de la izquierda y este test lo dirá.
    const medido: ReadonlyArray<readonly [string, string, string]> = [
      ['Protanopia (rojo)', '172,171,38', 'la matriz dice 141,140,38'],
      ['Deuteranopia (verde)', '180,189,38', 'la matriz dice 152,165,38'],
      ['Tritanopia (azul)', '215,38,38', 'la matriz dice 211,38,38'],
    ];
    for (const [condicion, pintado] of medido) {
      await elegirCondicion(page, condicion);
      expect(await colorPintado(page, pildoraRoja)).toBe(pintado);
    }

    // El filtro sí llega a aplicarse (la <svg> de los defs va oculta con width/height 0,
    // no con display:none, que es lo que lo habría desactivado).
    await elegirCondicion(page, 'Protanopia (rojo)');
    expect((await leerSimulacion(page)).filtro).toBe('url("#protanopia")');
    expect(
      await page.evaluate(() =>
        [...document.querySelectorAll('filter')].map(
          (f) => f.id + '=' + (f.getAttribute('color-interpolation-filters') ?? 'AUSENTE'),
        ),
      ),
    ).toEqual(['protanopia=AUSENTE', 'deuteranopia=AUSENTE', 'tritanopia=AUSENTE']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 3 · RECHAZO, en móvil — el control ante valores imposibles
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Pixel 7 sin su `defaultBrowserType`: Playwright no lo admite dentro de un `describe`
 * porque forzaría otro worker, y el proyecto corre con uno solo (`playwright.config.ts`).
 */
const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = devices['Pixel 7'];
const PIXEL_7 = { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch };

test.describe('Caso 3 · rechazo en móvil (Pixel 7)', () => {
  test.use(PIXEL_7);

  test('vaciar el deslizador o darle valores fuera de rango no rompe la simulación', async ({
    page,
  }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await abrir(page);
    await elegirCondicion(page, 'Cataratas');

    // El control es `<input type="range">`, no `type="number"`: el navegador NUNCA le deja
    // un valor vacío ni fuera de [min, max], así que el `Number(e.target.value)` del
    // onChange no puede recibir '' ni texto. Los valores aceptados, calculados a mano:
    //   ''     → inválido: el navegador repone el punto medio, min + (max−min)/2 = 55
    //   '0'    → por debajo del mínimo: capa a 10
    //   '200'  → por encima del máximo: capa a 100
    //   '-50'  → capa a 10
    //   'abc'  → inválido: repone 55
    // Se piden en este orden para que cada siembra CAMBIE el valor (60→55→10→100→10→55):
    // sembrar el valor que el input ya tiene no probaría nada.
    const casos: ReadonlyArray<readonly [string, string]> = [
      ['', '55'],
      ['0', '10'],
      ['200', '100'],
      ['-50', '10'],
      ['abc', '55'],
    ];
    for (const [entrada, aceptado] of casos) {
      expect(await sembrarValorAcotado(page, DESLIZADOR, entrada)).toBe(aceptado);
      const { filtro } = await leerSimulacion(page);
      // Ni NaN ni Infinity: el filtro siempre queda con cuatro funciones y números finitos.
      expect(filtro).toMatch(/^blur\([\d.]+px\) sepia\([\d.]+\) brightness\([\d.]+\) contrast\([\d.]+\)$/);
      expect(filtro).not.toMatch(/NaN|Infinity/);
      await expect(page.locator('label[for="slider-intensidad"]')).toContainText(`${aceptado}%`);
    }
    expect(errores).toEqual([]);
  });

  test('en móvil la simulación sigue aplicándose y la página no se desborda', async ({ page }) => {
    await abrir(page);
    expect(page.viewportSize()!.width).toBe(412);

    // El mismo máximo que en escritorio: el filtro no depende del tamaño de la ventana.
    await elegirCondicion(page, 'Cataratas');
    await sembrarValor(page, DESLIZADOR, 100);
    expect((await leerSimulacion(page)).filtro).toBe(
      'blur(3px) sepia(0.6) brightness(0.75) contrast(0.7)',
    );

    // La capa del glaucoma cubre la maqueta entera (va con `inset: 0` sobre el contenedor).
    // Se baja a 10 en vez de repetir 100: la intensidad se conserva al cambiar de condición,
    // así que sembrar otra vez 100 no movería nada y el caso daría verde sin probar nada.
    await elegirCondicion(page, 'Glaucoma');
    await sembrarValor(page, DESLIZADOR, 10);
    expect((await leerSimulacion(page)).overlay).toBe('0.1');
    const cajas = await page.evaluate(() => {
      const w = document.querySelector('[class*="demoWrapper"]')!.getBoundingClientRect();
      const o = document.querySelector('[class*="overlay"]')!.getBoundingClientRect();
      return { anchoW: Math.round(w.width), anchoO: Math.round(o.width), altoO: Math.round(o.height) };
    });
    expect(cajas.anchoO).toBeGreaterThan(cajas.anchoW - 8); // los 2px de borde a cada lado
    expect(cajas.altoO).toBeGreaterThan(100);

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(412); // sin scroll horizontal

    // ⚠️ HALLAZGO (contenido) — por debajo de 640 px el CSS oculta la cuarta columna de la
    // tabla comparativa, «Solución en diseño», que es justo la accionable para un
    // diseñador. Y no hace falta: el contenedor ya tiene `overflow-x: auto`, así que la
    // alternativa era desplazarla, no borrarla.
    await page.getByRole('button', { name: /guía educativa/i }).click();
    const columnas = await page.evaluate(() =>
      [...document.querySelectorAll('[class*="tabla"] thead th')].map((t) => ({
        texto: t.textContent,
        display: getComputedStyle(t).display,
      })),
    );
    expect(columnas.map((c) => c.texto)).toEqual([
      'Condición',
      'Prevalencia',
      'Principal dificultad',
      'Solución en diseño',
    ]);
    expect(columnas[3].display).toBe('none');
  });
});
