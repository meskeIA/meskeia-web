import { test, expect, devices, Locator, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * Simulador de Baja Visión — inspección del 20/09/2026 · re-inspección del 03/10/2026
 *
 * RE-INSPECCIÓN DEL 03/10/2026 (lo nuevo está en los casos 4 a 8, al final del fichero)
 *   · Las seis matrices de `lib/calculadoras/daltonismo.ts` se cotejaron con la Tabla 1
 *     descargada ese día de la página de los autores (UFRGS, la `urlOficial` de CVD_META):
 *     diferencia máxima 0 en los 54 coeficientes (severidad 1,0 y 0,6). La de severidad 0,0
 *     es la identidad, que en esta app es el botón «Visión normal» (filter `none`).
 *   · Los colores PINTADOS bajo los tres filtros se resolvieron a mano antes de abrir el
 *     navegador (IEC 61966-2-1 ida y vuelta + la Tabla 1, recortando a [0, 1]) y coinciden
 *     con lo medido a ±1 nivel: negro, blanco y grises intactos, primarios puros recortados,
 *     y los pares de confusión protán y deután FUNDIDOS en el mismo color. Los commits
 *     2aa674b3 y de1a7007 (Machado, en RGB lineal, desde el módulo compartido) se
 *     comprueban por comportamiento, no porque existan.
 *   · El logo fijo no pisa el título a 360, 390, 800 ni 1.000 px (586a4d61 y a1d72a9c).
 *   · Lo que sigue ABIERTO va en `test.fail()`, con su caso escrito al lado.
 *   · Los tests del caso 1 que comparaban la prevalencia con el «%» pegado se reescribieron
 *     para admitir el espacio duro que manda el CLAUDE.md desde el 25/09/2026: tal como
 *     estaban, fijaban como correcto ese defecto.
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
 *   ⚠️ ACTUALIZADO el 03/10/2026: «coherente» no es «con fuente». El 17 % de cataratas y el
 *     2 % de glaucoma son cifras de EE. UU. (Eye Diseases Prevalence Research Group, Arch
 *     Ophthalmol 2004: 17,2 % y 1,86 % en mayores de 40 años), mostradas sin fuente ni
 *     territorio; la cifra mundial de glaucoma es 3,54 % entre 40 y 80 años (Tham et al.,
 *     Ophthalmology 2014). La de DMAE, «~8% mayores de 60», no casa con el tramo de su
 *     referencia mundial (Wong et al., Lancet Glob Health 2014: 8,69 % entre 45 y 85 años).
 *     Ver el caso 8.
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
 *   ⚠️ ACTUALIZADO el 20/09/2026 (tarde): las matrices pasaron a ser las de Machado et al.
 *   (2009), que operan en RGB LINEAL, así que estos filtros ya NO declaran
 *   `color-interpolation-filters` — el defecto de SVG es justo el espacio que hacen falta.
 *   Lo de abajo describe la situación anterior, con las matrices HCIRN/Wickline.
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

/**
 * El texto con su «%», admitiendo el espacio duro (U+00A0) que pide el CLAUDE.md desde el
 * 25/09/2026. Sin esto, los casos que comparan cifras fijaban como correcto el «%» pegado,
 * y la reparación de ese hallazgo los rompería sin que hubiera regresión ninguna.
 */
const conPct = (texto: string, { entero = false }: { entero?: boolean } = {}): RegExp => {
  const cuerpo = texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '[\\u00a0 ]?%');
  return new RegExp(entero ? `^${cuerpo}` : cuerpo);
};

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

    // Literal de data del page.tsx, cotejado en la cabecera de este fichero. Desde el
    // 03/10/2026 se compara por el PRINCIPIO del texto y con el «%» separable: así no fija
    // como correcto el «%» pegado ni impide añadir detrás la fuente que falta (caso 8).
    //
    // REPARADO el 03/10/2026 (hallazgo 2764): las tres de abajo cambian de texto porque
    // ahora dicen de qué población son, y glaucoma y DMAE pasan a la cifra MUNDIAL. Cotejadas
    // con el resumen en PubMed: Congdon 2004 «20.5 million (17.2%) Americans older than 40
    // years have cataract»; Tham 2014 «3.54% … population aged 40-80 years»; Wong 2014
    // «any age-related macular degeneration … 8.69%», «mapped to an age range of 45-85 years».
    const esperado: ReadonlyArray<readonly [string, string]> = [
      ['Visión normal', 'Base de referencia'],
      ['Cataratas', '~17% de los mayores de 40 años en EE. UU.'],
      ['Glaucoma', '~3,5% entre los 40 y los 80 años, en todo el mundo'],
      ['Degeneración macular', '~8,7% entre los 45 y los 85 años, en todo el mundo'],
      ['Protanopia (rojo)', '~1% hombres'],
      ['Deuteranopia (verde)', '~1% hombres'],
      ['Tritanopia (azul)', '~0,01% de la población'],
    ];
    for (const [condicion, prevalencia] of esperado) {
      await elegirCondicion(page, condicion);
      await expect(page.locator('[class*="infoPrevalencia"]')).toHaveText(
        conPct(prevalencia, { entero: true }),
      );
    }

    // El «~2,2 % de la población mundial» no salía de ninguna fuente: la OMS cuenta 2.200
    // MILLONES DE PERSONAS con deficiencia visual (≈28 %), y el FAQPage de esta misma app
    // da 217 millones con baja visión moderada o grave, que sobre 7.700 millones es el
    // 2,8 %. Parecía «2,2 mil millones» con la unidad cambiada (hallazgo 954).
    //
    // ⚠️ CORREGIDO el 03/10/2026 (hallazgo 2770): aquel 2,8 % dividía los 216,6 millones de
    // 2015 entre la población de 2019, y la atribución a la OMS no era la de la cifra. La
    // fuente es Bourne et al. (Lancet Glob Health 2017), que publica la prevalencia bruta:
    // «216·6 million … had moderate to severe visual impairment (2·95%…)», datos de 2015.
    await elegirCondicion(page, 'Baja visión general');
    await expect(page.locator('[class*="infoPrevalencia"]')).toContainText(conPct('2,95%'));
    await expect(page.locator('[class*="infoPrevalencia"]')).toContainText('Bourne');
    await expect(page.locator('[class*="infoPrevalencia"]')).toContainText('2015');

    // El 30 % era la miopía de CUALQUIER grado (Holden 2016: 28,3 %); la miopía alta, que
    // es la que el botón llama «severa», está en el 4,0 % (hallazgo 955).
    await elegirCondicion(page, 'Miopía severa');
    await expect(page.locator('[class*="infoPrevalencia"]')).toContainText(conPct('4%'));
    await expect(page.locator('[class*="infoPrevalencia"]')).toContainText('Holden');
    await expect(page.locator('[class*="tabla"] tbody tr').nth(1)).toContainText(
      conPct('4% (miopía alta)'),
    );
  });

  test('son 9 condiciones, de las cuales 3 son daltonismos', async ({ page }) => {
    await abrir(page);

    // El jsonLd anunciaba «9 condiciones … y 4 TIPOS DE DALTONISMO» y el FAQPage remataba
    // con «algunas formas de daltonismo (protanopia, deuteranopia)». Ni son 4 ni son 2:
    // son 3. Y de los 9 botones uno es «Visión normal», que es la referencia sin condición,
    // mientras que «Baja visión general» —la que da nombre a la app— no aparecía en esa
    // enumeración. Son las cifras que alimentan el grounding de las IAs (hallazgo 957).
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

  test('el aviso de «no es diagnóstico» se ve sin abrir nada', async ({ page }) => {
    await abrir(page);

    // El CLAUDE.md prohíbe expresamente esconder una advertencia de responsabilidad dentro
    // de <EducationalSection>: «es responsabilidad jurídica, no maquetación». La app no
    // monta DisclaimerCard (lleva `// @disclaimer: exempt`, defendible por sus suites), así
    // que esta frase es lo ÚNICO que acota el alcance de una herramienta que nombra cinco
    // enfermedades oculares con su prevalencia — y nacía tras DOS pliegues: la sección
    // educativa cerrada y, dentro, un <details> también cerrado (hallazgo 956).
    const aviso = page.getByText('No uses este simulador para fines diagnósticos').first();
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('aproximación visual para diseñadores');

    // Y sigue estando antes de que nadie despliegue la guía educativa.
    await expect(page.getByRole('button', { name: /guía educativa/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    // El aviso legal, que es obligatorio, también se ve de entrada.
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
    await expect(page.locator('label[for="slider-intensidad"]')).toContainText(conPct('10%'));

    // i = 100 → blur 3px · sepia 0,6 · brightness 1−0,25 = 0,75 · contrast 1−0,3 = 0,7
    await sembrarValor(page, DESLIZADOR, 100);
    expect(await leerSimulacion(page)).toEqual({
      filtro: 'blur(3px) sepia(0.6) brightness(0.75) contrast(0.7)',
      overlay: null,
    });
    await expect(page.locator('label[for="slider-intensidad"]')).toContainText(conPct('100%'));
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

  test('los tres daltonismos pintan lo que dicen sus matrices', async ({
    page,
  }) => {
    await abrir(page);
    const pildoraRoja = page.locator('[class*="badgeRojo"]').first();

    // Sin filtro, la píldora es su propio #dc2626 = rgb(220,38,38).
    await elegirCondicion(page, 'Visión normal');
    expect(await colorPintado(page, pildoraRoja)).toBe('220,38,38');

    // Las matrices salen de `@/lib/calculadoras/daltonismo` —Machado et al. (2009)— y se
    // aplican en RGB LINEAL, que es donde el modelo está definido y lo que la especificación
    // SVG usa por defecto: por eso estos tres <filter> NO declaran
    // `color-interpolation-filters`, y ponerles "sRGB" sería el fallo.
    //
    // Los tres valores coinciden con `simularColor([220, 38, 38], …)` del motor, que está
    // probado aparte en tests/daltonismo-motor.spec.ts con casos resueltos a mano.
    //
    // Historia de esta línea (20/09/2026): aquí hubo antes otras matrices, el juego
    // HCIRN/Wickline, que daban rgb(141,140,38) en sRGB y rgb(172,171,38) en lineal. Aquella
    // mañana se eligió sRGB para que lo pintado coincidiera con la matriz escrita al lado; por
    // la tarde, el Inspector encontró que la app hermana usaba esas MISMAS cifras en lineal
    // —de modo que las dos pintaban distinto— y, sobre todo, que aquel juego es INVERTIBLE:
    // no puede fundir dos colores en uno, así que nunca enseñaba una confusión cromática.
    const esperado: ReadonlyArray<readonly [string, string]> = [
      ['Protanopia (rojo)', '99,89,35'],
      ['Deuteranopia (verde)', '143,128,27'],
      ['Tritanopia (azul)', '243,0,42'],
    ];
    for (const [condicion, pintado] of esperado) {
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
      // AUSENTE es lo correcto: sin el atributo, SVG usa linearRGB, que es donde opera
      // Machado. Declarar "sRGB" multiplicaría la matriz contra la señal con gamma y el
      // resultado dejaría de ser el del modelo.
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
      await expect(page.locator('label[for="slider-intensidad"]')).toContainText(conPct(`${aceptado}%`));
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

    // Por debajo de 640 px el CSS ocultaba la cuarta columna, «Solución en diseño», que es
    // justo la accionable para un diseñador. Y no hacía falta: el contenedor ya tiene
    // `overflow-x: auto`, así que la alternativa disponible era desplazarla (hallazgo 960).
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
    expect(columnas[3].display).not.toBe('none');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Los dos hallazgos de accesibilidad, ya reparados
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Accesibilidad de la vista simulada', () => {
  test('la maqueta decorativa no captura el foco ni se lee', async ({ page }) => {
    await abrir(page);

    // Sus enlaces no llevan a ninguna parte, su botón es inerte y sus cifras («Retención
    // 4.750 €») son inventadas: 7 elementos tabulables que llevaban al usuario de teclado
    // por una navegación que no existe (hallazgo 958).
    const maqueta = page.locator('[class*="demoContenido"]').first();
    await expect(maqueta).toHaveAttribute('aria-hidden', 'true');
    expect(await maqueta.evaluate((el) => el.hasAttribute('inert'))).toBe(true);

    const tabulables = await maqueta.evaluate(
      (el) => el.querySelectorAll('a, button, input, select, textarea').length,
    );
    expect(tabulables).toBeGreaterThan(0); // los elementos siguen ahí, para que se vean
    // pero ninguno recibe el foco, porque el contenedor es inert
    const recibenFoco = await maqueta.evaluate((el) => {
      const candidatos = [...el.querySelectorAll<HTMLElement>('a, button, input')];
      return candidatos.filter((c) => {
        c.focus();
        return document.activeElement === c;
      }).length;
    });
    expect(recibenFoco).toBe(0);
  });

  test('el subtítulo no anuncia cada paso del deslizador', async ({ page }) => {
    await abrir(page);
    await elegirCondicion(page, 'Cataratas');

    // Interpolaba el valor del deslizador dentro de un role="status" aria-live, así que
    // arrastrarlo disparaba un anuncio por paso, encima del que ya emite el propio control
    // de rango y del aria-label del input: tres fuentes diciendo lo mismo (hallazgo 959).
    const subtitulo = page.locator('[class*="demoSubtitulo"]').first();
    await expect(subtitulo).not.toHaveAttribute('aria-live', /.*/);
    await expect(subtitulo).not.toHaveAttribute('role', /.*/);

    // Y el cambio de CONDICIÓN, que es lo que sí necesita anunciarse, sigue en un status.
    await expect(page.locator('[class*="infoCondicion"]')).toHaveAttribute('role', 'status');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DEL 03/10/2026
// ═════════════════════════════════════════════════════════════════════════════

type Rgb = readonly [number, number, number];

/** Lado de cada muestra inyectada, en px CSS. */
const LADO_MUESTRA = 30;

/**
 * Pinta una fila de muestras de color DENTRO de la maqueta, para que pasen por el mismo
 * `filter` que la app aplica a `.demoContenido`, y devuelve el color pintado en el centro de
 * cada una. No toca ningún fichero de la app: es DOM de la prueba, y se rehace en cada
 * condición para no depender de cómo reconcilie React.
 */
async function pintarMuestras(page: Page, colores: readonly Rgb[]): Promise<Rgb[]> {
  await page.evaluate(
    ({ lista, lado }) => {
      document.getElementById('muestras-inspector')?.remove();
      const fila = document.createElement('div');
      fila.id = 'muestras-inspector';
      fila.style.cssText = `display:flex;width:${lista.length * lado}px;height:${lado}px`;
      for (const [r, g, b] of lista) {
        const muestra = document.createElement('div');
        muestra.style.cssText = `width:${lado}px;height:${lado}px;flex:none;background:rgb(${r},${g},${b})`;
        fila.appendChild(muestra);
      }
      document.querySelector('[class*="demoContenido"]')!.prepend(fila);
    },
    { lista: colores.map((c) => [...c]), lado: LADO_MUESTRA },
  );
  // Dos fotogramas: que el filtro ya se haya aplicado a lo recién insertado.
  await page.evaluate(
    () => new Promise<void>((listo) => requestAnimationFrame(() => requestAnimationFrame(() => listo()))),
  );
  const png = (await page.locator('#muestras-inspector').screenshot()).toString('base64');
  return page.evaluate(
    async ({ b64, n, lado }) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const lienzo = document.createElement('canvas');
      lienzo.width = img.width;
      lienzo.height = img.height;
      const ctx = lienzo.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const escala = img.width / (n * lado);
      return Array.from({ length: n }, (_, i) => {
        const d = ctx.getImageData(
          Math.floor((i + 0.5) * lado * escala),
          Math.floor(0.5 * lado * escala),
          1,
          1,
        ).data;
        return [d[0], d[1], d[2]] as [number, number, number];
      });
    },
    { b64: png, n: colores.length, lado: LADO_MUESTRA },
  );
}

/**
 * ±1 nivel de 255 por canal: lo que separa el redondeo del cálculo a mano del de la tubería
 * del navegador. El defecto que vigila —matrices de otro modelo, o aplicadas en el espacio
 * equivocado— mueve los canales decenas de niveles (#dc2626 en protanopia: 99 frente a 141 o
 * 172 con las matrices viejas), así que ±1 no lo tapa.
 */
function esperarCercano(obtenido: Rgb, esperado: Rgb, etiqueta: string): void {
  for (let canal = 0; canal < 3; canal++) {
    expect(
      Math.abs(obtenido[canal] - esperado[canal]),
      `${etiqueta}: pintado ${obtenido.join(',')}, esperado ${esperado.join(',')}`,
    ).toBeLessThanOrEqual(1);
  }
}

const aRgb = (texto: string): Rgb => {
  const [r, g, b] = texto.split(',').map(Number);
  return [r, g, b];
};

// ─────────────────────────────────────────────────────────────────────────────
// CASO 4 · MOTOR — cada filtro pinta lo que dice Machado, en RGB lineal
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 4 · motor: lo pintado bajo los tres filtros, resuelto a mano', () => {
  test('color de marca, primarios que se salen de [0, 1] y grises que no cambian', async ({ page }) => {
    // Resuelto a mano el 03/10/2026, ANTES de abrir el navegador: cada canal se lleva a luz
    // lineal con IEC 61966-2-1 (C/12,92 hasta 0,04045; ((C+0,055)/1,055)^2,4 por encima), se
    // multiplica por la Tabla 1 de Machado et al. (2009) a severidad 1,0 —cotejada ese día con
    // la página de los autores—, se recorta a [0, 1] como hace feColorMatrix y vuelve a sRGB.
    // Ejemplo, #2E86AB en protanopia:
    //   lineal (0,027321 · 0,238398 · 0,407240)
    //   R = 0,152286·0,027321 + 1,052583·0,238398 − 0,204868·0,407240 = 0,171663 → 115,07 → 115
    //   G = 0,114503·0,027321 + 0,786281·0,238398 + 0,099216·0,407240 = 0,230981 → 132,06 → 132
    //   B = −0,003882·0,027321 − 0,048116·0,238398 + 1,051998·0,407240 = 0,416839 → 172,81 → 173
    // Los primarios puros SE SALEN de [0, 1] y se recortan: el rojo en tritanopia da R = 1,2555
    // (→ 255) y G = −0,0784 (→ 0); el azul en protanopia, R = −0,2049 (→ 0) y B = 1,0520 (→ 255).
    // Cada fila de la tabla suma 1, así que negro, blanco y grises salen iguales; también el
    // gris 10, que cae en el tramo LINEAL de la curva (0,003035 < 0,0031308).
    // Deuteranopia sobre el azul puro da G = 61,50, en el filo del redondeo: por eso ±1.
    const MUESTRAS: ReadonlyArray<readonly [string, Rgb]> = [
      ['#2E86AB', [46, 134, 171]],
      ['rojo puro', [255, 0, 0]],
      ['verde puro', [0, 255, 0]],
      ['azul puro', [0, 0, 255]],
      ['negro', [0, 0, 0]],
      ['blanco', [255, 255, 255]],
      ['gris 200', [200, 200, 200]],
      ['gris 128', [128, 128, 128]],
      ['gris 64', [64, 64, 64]],
      ['gris 10', [10, 10, 10]],
    ];
    const GRISES: readonly Rgb[] = MUESTRAS.slice(4).map(([, c]) => c);
    const ESPERADO: ReadonlyArray<readonly [string, readonly Rgb[]]> = [
      ['Visión normal', MUESTRAS.map(([, c]) => c)],
      ['Protanopia (rojo)', [[115, 132, 173], [109, 95, 0], [255, 229, 0], [0, 89, 255], ...GRISES]],
      ['Deuteranopia (verde)', [[98, 120, 170], [163, 144, 0], [239, 214, 58], [0, 61, 251], ...GRISES]],
      ['Tritanopia (azul)', [[0, 144, 146], [255, 0, 15], [0, 247, 217], [0, 107, 150], ...GRISES]],
    ];

    await abrir(page);
    for (const [condicion, esperados] of ESPERADO) {
      await elegirCondicion(page, condicion);
      const pintados = await pintarMuestras(page, MUESTRAS.map(([, c]) => c));
      pintados.forEach((p, i) => esperarCercano(p, esperados[i], `${MUESTRAS[i][0]} en ${condicion}`));
    }
  });

  test('protanopia y deuteranopia FUNDEN su par de confusión en un solo color', async ({ page }) => {
    // Es lo que las matrices anteriores (HCIRN/Wickline, invertibles) no podían enseñar nunca.
    // El núcleo de la matriz de protanopia (det ≈ −1,4·10⁻⁷) es la dirección
    // (1 · −0,145253 · −0,002954) en luz lineal: dos colores que solo difieren en ella se ven
    // iguales. Partiendo de lineal (0,05 · 0,2 · 0,1) = rgb(63,124,89), un verde apagado, y
    // avanzando 0,55 por ese eje → lineal (0,6 · 0,1201 · 0,0984) = rgb(203,97,88), un rojo
    // teja. A mano, protanopia los lleva a (123,342 · 115,825 · 86,954) y (122,627 · 115,192 ·
    // 86,683): rgb(123,116,87) y rgb(123,115,87). En deuteranopia el eje es
    // (1 · −0,418651 · 0,030757); avanzando 0,40 sale rgb(179,51,94), un granate, y los dos
    // dan rgb(114,109,91).
    const verde: Rgb = [63, 124, 89];
    const teja: Rgb = [203, 97, 88];
    const granate: Rgb = [179, 51, 94];

    await abrir(page);
    await elegirCondicion(page, 'Visión normal');
    expect(await pintarMuestras(page, [verde, teja, granate])).toEqual([verde, teja, granate]);

    await elegirCondicion(page, 'Protanopia (rojo)');
    const [protVerde, protTeja] = await pintarMuestras(page, [verde, teja]);
    esperarCercano(protVerde, [123, 116, 87], 'verde apagado en protanopia');
    esperarCercano(protTeja, [123, 115, 87], 'rojo teja en protanopia');
    esperarCercano(protVerde, protTeja, 'el par protán, fundido');

    await elegirCondicion(page, 'Deuteranopia (verde)');
    const [deutVerde, deutGranate] = await pintarMuestras(page, [verde, granate]);
    esperarCercano(deutVerde, [114, 109, 91], 'verde apagado en deuteranopia');
    esperarCercano(deutGranate, [114, 109, 91], 'granate en deuteranopia');
  });

  test('las píldoras verde, amarilla y azul de la maqueta, y adónde las lleva la tritanopia', async ({
    page,
  }) => {
    // Mismo cálculo que arriba sobre los fondos reales de las píldoras: #16a34a, #ca8a04 y
    // #2563eb. La roja (#dc2626) ya la fija el caso 2.
    const ESPERADO: ReadonlyArray<readonly [string, Rgb, Rgb, Rgb]> = [
      //  condición               verde            amarillo          azul
      ['Protanopia (rojo)', [164, 148, 66], [161, 141, 0], [0, 118, 240]],
      ['Deuteranopia (verde)', [149, 137, 81], [176, 157, 16], [0, 100, 232]],
      ['Tritanopia (azul)', [0, 160, 143], [221, 121, 117], [0, 134, 157]],
    ];
    await abrir(page);
    const pildora = (clase: string): Locator => page.locator(`[class*="${clase}"]`).first();
    const pintadas: Record<string, readonly [Rgb, Rgb, Rgb]> = {};
    for (const [condicion, verde, amarillo, azul] of ESPERADO) {
      await elegirCondicion(page, condicion);
      const v = aRgb(await colorPintado(page, pildora('badgeVerde')));
      const a = aRgb(await colorPintado(page, pildora('badgeAmarillo')));
      const z = aRgb(await colorPintado(page, pildora('badgeAzul')));
      esperarCercano(v, verde, `píldora verde en ${condicion}`);
      esperarCercano(a, amarillo, `píldora amarilla en ${condicion}`);
      esperarCercano(z, azul, `píldora azul en ${condicion}`);
      pintadas[condicion] = [v, a, z];
    }

    // Lo que la propia simulación enseña de la tritanopia: el azul se acerca al VERDE
    // (distancia RGB √(0² + 26² + 14²) = 29,5) y se queda lejísimos del amarillo
    // (√(221² + 13² + 40²) = 225,0). Es el dato contra el que se mide el texto del caso 8.
    const distancia = (p: Rgb, q: Rgb): number => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
    const [tVerde, tAmarillo, tAzul] = pintadas['Tritanopia (azul)'];
    expect(distancia(tAzul, tVerde)).toBeLessThan(distancia(tAzul, tAmarillo) / 4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 5 · OPERATIVA — el logo fijo no tapa el título (586a4d61 y a1d72a9c)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 5 · operativa: el logo fijo frente al título', () => {
  test('a 360, 390, 800 y 1.000 px las letras del h1 empiezan por debajo de la barra', async ({ page }) => {
    // Calculado antes de medir: hasta 1.023 px el hero lleva 80 px arriba (el bloque del final
    // del módulo CSS), y las piezas de la barra fija de MeskeiaLogo acaban a ~52 px en móvil y
    // a ~77 px desde 769 px, cuando el logo pasa a su tamaño de escritorio. La primera línea
    // del h1 tiene que empezar por debajo. Medido el 03/10/2026: letras desde y = 79; piezas
    // hasta 53 (360), 52 (390) y 77 (800 y 1.000). A 800 y 1.000 el margen es de 2 px.
    // Se mide contra las cajas del TEXTO, como la Ronda (`tituloTapado` de scripts/ronda.mjs).
    await abrir(page);
    for (const [ancho, alto] of [
      [360, 780],
      [390, 844],
      [800, 1112],
      [1000, 800],
    ] as const) {
      await page.setViewportSize({ width: ancho, height: alto });
      await page.evaluate(
        () => new Promise<void>((listo) => requestAnimationFrame(() => requestAnimationFrame(() => listo()))),
      );
      const m = await page.evaluate(() => {
        const barra = [...document.querySelectorAll('body *')].find((e) => {
          const cs = getComputedStyle(e);
          const r = e.getBoundingClientRect();
          return (
            cs.position === 'fixed' &&
            r.top <= 1 &&
            r.height < 120 &&
            r.width > 300 &&
            e.querySelector('a[href="/"]') !== null
          );
        });
        const h1 = document.querySelector('h1');
        if (!barra || !h1) return null;
        const rango = document.createRange();
        rango.selectNodeContents(h1);
        const letras = [...rango.getClientRects()].filter((c) => c.width > 0);
        const piezas = [...barra.children].map((c) => c.getBoundingClientRect()).filter((c) => c.width > 0);
        return {
          solapa: piezas.some((p) =>
            letras.some((c) => !(p.right <= c.left || p.left >= c.right || p.bottom <= c.top || p.top >= c.bottom)),
          ),
          letrasArriba: Math.min(...letras.map((c) => c.top)),
          piezasAbajo: Math.max(...piezas.map((p) => p.bottom)),
          scrollW: document.documentElement.scrollWidth,
        };
      });
      expect(m, `a ${ancho} px no se encontró la barra o el h1`).not.toBeNull();
      expect(m!.solapa, `a ${ancho} px el logo o el botón de tema pisan el título`).toBe(false);
      expect(m!.letrasArriba, `a ${ancho} px`).toBeGreaterThanOrEqual(m!.piezasAbajo);
      expect(m!.scrollW, `a ${ancho} px hay scroll horizontal`).toBe(ancho);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 6 · RECHAZO con teclado — el deslizador no sale de [10, 100]
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 6 · rechazo: el teclado en los extremos del deslizador', () => {
  test('Inicio, Fin y las flechas más allá del extremo no sacan el valor de [10, 100]', async ({ page }) => {
    // La app no carga imágenes ni usa la cámara: no hay archivo que rechazar. Lo que puede
    // recibir un valor imposible es el deslizador, y por teclado eso es pulsar ← en el mínimo
    // o → en el máximo. A mano: Inicio → 10 y su filtro (caso 2); ← se queda en 10; Fin → 100;
    // → se queda en 100.
    await abrir(page);
    await elegirCondicion(page, 'Cataratas');
    const etiqueta = page.locator('label[for="slider-intensidad"]');
    await page.locator(DESLIZADOR).focus();

    await page.keyboard.press('Home');
    await expect(etiqueta).toContainText(conPct('10%'));
    await page.keyboard.press('ArrowLeft');
    await expect(etiqueta).toContainText(conPct('10%'));
    expect((await leerSimulacion(page)).filtro).toBe('blur(0.3px) sepia(0.06) brightness(0.97) contrast(0.97)');

    await page.keyboard.press('End');
    await expect(etiqueta).toContainText(conPct('100%'));
    await page.keyboard.press('ArrowRight');
    await expect(etiqueta).toContainText(conPct('100%'));
    expect((await leerSimulacion(page)).filtro).toBe('blur(3px) sepia(0.6) brightness(0.75) contrast(0.7)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 7 · ACCESIBILIDAD — contraste de la prevalencia y nombre del deslizador
// ─────────────────────────────────────────────────────────────────────────────

/** Contraste WCAG entre el color de la prevalencia y el fondo (opaco) de su ficha. */
async function contrastePrevalencia(page: Page): Promise<number> {
  return page.evaluate(() => {
    const p = document.querySelector('[class*="infoPrevalencia"]')!;
    const ficha = p.closest('[class*="infoCondicion"]')!;
    const rgb = (s: string): number[] => (s.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
    const lum = (c: number[]): number => {
      const [r, g, b] = c.map((v) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const l1 = lum(rgb(getComputedStyle(p).color));
    const l2 = lum(rgb(getComputedStyle(ficha).backgroundColor));
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  });
}

test.describe('Caso 7 · accesibilidad de la ficha y del deslizador', () => {
  test('la prevalencia se lee con 4,5:1 en el tema claro', async ({ page }) => {
    // REPARADO el 03/10/2026 (hallazgo 2766).
    // Texto de 13,6 px y peso 500: no es «texto grande», así que exige 4,5:1. A mano:
    // #2E86AB tiene luminancia 0,2057 y el blanco 1 → (1 + 0,05)/(0,2057 + 0,05) = 4,11.
    // El token para texto de marca es --primary-texto (#26718F, 5,47:1 sobre blanco).
    await abrir(page);
    await elegirCondicion(page, 'Cataratas');
    // Sondeo y no lectura única: globals.css anima color y fondo 0,3 s, y leer en mitad de la
    // transición del cambio de tema dio 2,26:1, un color que no es de ninguno de los dos temas.
    await expect.poll(() => contrastePrevalencia(page)).toBeGreaterThanOrEqual(4.5);
  });

  test('la prevalencia se lee con 4,5:1 en el tema oscuro', async ({ page }) => {
    // #3FA5D1 (luminancia 0,3255) sobre #2D2D2D (0,0262) → 0,3755/0,0762 = 4,93. Cumple: el
    // hallazgo de arriba es solo del tema claro, y su reparación no debe romper este.
    await abrir(page);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await elegirCondicion(page, 'Cataratas');
    // Sondeo y no lectura única: globals.css anima color y fondo 0,3 s, y leer en mitad de la
    // transición del cambio de tema dio 2,26:1, un color que no es de ninguno de los dos temas.
    await expect.poll(() => contrastePrevalencia(page)).toBeGreaterThanOrEqual(4.5);
  });

  test('el nombre accesible del deslizador contiene su etiqueta visible', async ({ page }) => {
    // REPARADO el 03/10/2026 (hallazgo 2767).
    // WCAG 2.5.3 (Etiqueta en el nombre, nivel A): quien maneja la página por voz dice lo que
    // ve. La etiqueta visible es «Intensidad de la simulación: 60%», pero el aria-label la
    // sustituye por «Intensidad de simulación: 60%» —sin «la»— y además repite el valor, que
    // el control de rango ya anuncia por su cuenta.
    await abrir(page);
    await elegirCondicion(page, 'Cataratas');
    await expect(page.getByRole('slider')).toHaveAccessibleName(/Intensidad de la simulación/);
    // El valor no va en el nombre: lo anuncia el propio control, con su «%» separado.
    await expect(page.getByRole('slider')).toHaveAttribute('aria-valuetext', '60\u00A0%');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 8 · CONTENIDO Y DATOS — cifras de salud con fuente, y lo que dice cada texto
// ─────────────────────────────────────────────────────────────────────────────

/** Abre la guía educativa: sus <details> se leen por textContent aunque sigan cerrados. */
async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: /guía educativa/i }).click();
  await expect(page.getByRole('button', { name: /guía educativa/i })).toHaveAttribute('aria-expanded', 'true');
}

const respuestaFaq = (page: Page, pregunta: string): Locator =>
  page.locator('details').filter({ hasText: pregunta }).locator('p');

test.describe('Caso 8 · contenido y datos', () => {
  test('el «%» va separado de la cifra con espacio duro (U+00A0)', async ({ page }) => {
    // REPARADO el 03/10/2026 (hallazgo 2768).
    // CLAUDE.md §2 (decidido el 25/09/2026): «15 %», con U+00A0. Hoy son 0 de ~20 apariciones:
    // prevalencias, etiqueta del deslizador, subtítulo, tabla, FAQ y pasos de la auditoría.
    await abrir(page);
    await elegirCondicion(page, 'Cataratas');
    const crudo = (l: Locator): Promise<string> => l.evaluate((el) => el.textContent ?? '');
    expect(await crudo(page.locator('[class*="infoPrevalencia"]'))).toContain('17 %');
    expect(await crudo(page.locator('label[for="slider-intensidad"]'))).toContain('60 %');
    // Y en el resto de la página, guía y FAQ incluidas (se leen por textContent aunque estén
    // plegadas): ni una cifra con el «%» pegado ni con un espacio normal que lo deje caer solo
    // a la línea siguiente. Con Cataratas elegida son 13 apariciones; el suelo evita que esto pase en
    // falso si la guía dejara de montarse.
    await abrirGuia(page);
    // Solo las regiones de esta app: RelatedApps y ShareCard, también dentro de <main>,
    // traen textos de otras apps que no son de este hallazgo.
    const pagina = await page.evaluate(() =>
      [...document.querySelectorAll(
        '[class*="intensidadSeccion"], [class*="infoCondicion"], [class*="demoSubtitulo"], [class*="warningBox"], [class*="educativo"]',
      )]
        .map((el) => el.textContent ?? '')
        .join(' '),
    );
    expect(pagina.match(/\d ?%/g) ?? []).toEqual([]);
    expect((pagina.match(/\d\u00a0%/g) ?? []).length).toBeGreaterThanOrEqual(13);
  });

  test('cataratas, glaucoma y degeneración macular citan fuente y año, como miopía y baja visión', async ({
    page,
  }) => {
    // REPARADO el 03/10/2026 (hallazgo 2764).
    // Las dos reparadas el 20/09 llevan su fuente entre paréntesis: «(… Holden et al.,
    // Ophthalmology 2016)» y «(OMS, 2019)». Las otras tres no, y no son cifras neutras:
    //   · «~17% mayores de 40 años» es el 17,2 % de EE. UU. (Congdon et al., Eye Diseases
    //     Prevalence Research Group, Arch Ophthalmol 2004).
    //   · «~2% mayores de 40 años» es el 1,86 % de glaucoma de ángulo abierto en EE. UU.
    //     (Friedman et al., misma serie, 2004). La cifra mundial es 3,54 % entre 40 y 80 años
    //     (Tham et al., Ophthalmology 2014): casi el doble, en una web con medio tráfico latino.
    //   · «~8% mayores de 60 años»: la referencia mundial (Wong et al., Lancet Glob Health
    //     2014) da 8,69 % para el tramo de 45 a 85 años, no para mayores de 60.
    await abrir(page);
    for (const condicion of ['Cataratas', 'Glaucoma', 'Degeneración macular']) {
      await elegirCondicion(page, condicion);
      await expect(page.locator('[class*="infoPrevalencia"]'), condicion).toHaveText(/\d{4}\)/);
    }
  });

  test('la ficha de la tritanopia describe la confusión que la propia simulación enseña', async ({ page }) => {
    // REPARADO el 03/10/2026 (hallazgo 2765).
    // National Eye Institute (NIH), «Types of Color Vision Deficiency»: la tritanopia impide
    // distinguir «blue and green, purple and red, and yellow and pink». Lo mismo enseña la
    // simulación de la app (caso 4): la píldora azul pasa a rgb(0,134,157) y la verde a
    // rgb(0,160,143) —a 29,5 de distancia— mientras la amarilla queda en rgb(221,121,117), a
    // 225. La ficha dice justo lo contrario en dos sitios: «Azul y amarillo se confunden» y
    // «Azul y amarillo indistinguibles».
    await abrir(page);
    await elegirCondicion(page, 'Tritanopia (azul)');
    const ficha = page.locator('[class*="infoCondicion"]');
    await expect(ficha).not.toContainText(/azul y amarillo (se confunden|indistinguibles)/i);
    await expect(ficha).toContainText(/azul con el verde/i);
    // Y el otro par del NEI que la simulación también enseña: la píldora amarilla #ca8a04
    // queda en rgb(221,121,117), un rosa salmón (caso 4).
    await expect(ficha).toContainText(/amarillo con el rosa/i);
    await expect(ficha).toContainText(/amarillos que viran a rosa/i);
  });

  test('la prevalencia del daltonismo es la de Birch (2012), con su población', async ({ page }) => {
    // REPARADO el 03/10/2026 (hallazgo 2769).
    // Birch, J. (2012), JOSA A 29(3): «about 8% in men and about 0.4% in women» en
    // EUROPEOS, y entre el 4 % y el 6,5 % en hombres de ascendencia china y japonesa. Es la
    // fuente que cita la app hermana `simulador-daltonismo`, que comparte motor con esta y
    // corrigió el 0,5 → 0,4 en el mismo commit (de1a7007); aquí quedó sin tocar.
    await abrir(page);
    await abrirGuia(page);
    const respuesta = respuestaFaq(page, '¿El daltonismo afecta igual a hombres y mujeres?');
    await expect(respuesta).toContainText(conPct('0,4%'));
    await expect(respuesta).toContainText(/europe/i);
    await expect(respuesta).toContainText('Birch (2012)');
    await expect(respuesta).not.toContainText(conPct('0,5%'));
    // Y la tabla dice de qué población es el 8 %.
    await expect(
      page.locator('[class*="tabla"] tbody tr').filter({ hasText: 'Daltonismo' }),
    ).toContainText(/ascendencia europea/);
  });

  test('el FAQPage no llama «algún grado» de discapacidad visual a los 253 millones', async ({ page }) => {
    // REPARADO el 03/10/2026 (hallazgo 2770).
    // Bourne et al., Lancet Glob Health 2017 (datos de 2015, los que recoge la OMS): 36,0
    // millones de ciegos + 216,6 millones con discapacidad visual moderada o grave = 252,6
    // millones. La LEVE suma otros 188,5 millones, y la OMS (Informe mundial sobre la visión,
    // 2019) habla de 2.200 millones con alguna deficiencia de visión de cerca o de lejos. El
    // JSON-LD es lo que leen los buscadores y las IA.
    await page.goto(RUTA);
    const respuestas = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((s) => JSON.parse(s.textContent ?? '{}') as { '@type'?: string; mainEntity?: { acceptedAnswer: { text: string } }[] })
        .filter((d) => d['@type'] === 'FAQPage')
        .flatMap((d) => (d.mainEntity ?? []).map((q) => q.acceptedAnswer.text)),
    );
    expect(respuestas.length).toBe(5);
    expect(respuestas.join(' ')).not.toMatch(/253 millones[^.]*algún grado/);
    // Y lo que dice en su lugar: las tres cifras de Bourne con su año, y la de la OMS aparte.
    const primera = respuestas[0];
    expect(primera).toContain('Bourne');
    expect(primera).toMatch(/en 2015/);
    expect(primera).toContain('216,6 millones con discapacidad visual moderada o grave');
    expect(primera).toContain('188,5 millones con discapacidad visual leve');
    expect(primera).toContain('2.200 millones');
  });

  test('el Real Decreto 1112/2018 se presenta como lo que es: norma del sector público', async ({ page }) => {
    // REPARADO el 03/10/2026 (hallazgo 2771).
    // Título en el BOE (BOE-A-2018-12699): «Real Decreto 1112/2018, de 7 de septiembre, sobre
    // accesibilidad de los sitios web y aplicaciones para dispositivos móviles del SECTOR
    // PÚBLICO». La FAQ, dirigida a diseñadores, dice «WCAG 2.1 nivel AA es el mínimo legal en
    // España (Real Decreto 1112/2018)», sin ese alcance.
    await abrir(page);
    await abrirGuia(page);
    const respuesta = respuestaFaq(page, '¿Qué estándar de accesibilidad debo seguir?');
    await expect(respuesta).toContainText('1112/2018');
    await expect(respuesta).toContainText(/sector público/i);
    // El privado, con la norma que de verdad lo alcanza (BOE-A-2023-11022, título I en vigor
    // desde el 28/06/2025, art. 2.2: comercio electrónico, banca, transporte…).
    await expect(respuesta).toContainText('Ley 11/2023');
    await expect(respuesta).not.toContainText(/mínimo legal en España/i);
  });
});
