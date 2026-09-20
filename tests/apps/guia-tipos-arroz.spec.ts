import { test, expect, devices, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — guia-tipos-arroz (segmento interactiva, riesgo 2, 48 usos, 76 s de estancia)
 *
 * Primera inspección: 20/09/2026 (Opus 5), contra producción y contra el código del repositorio,
 * que el deploy de las 11:25 deja idénticos.
 *
 * QUÉ PROMETE
 *   <h1> «Guía de Tipos de Arroz del Mundo» y subtítulo: «30 variedades de arroz: tipo de grano,
 *   origen, tiempo de cocción, proporción de agua y uso culinario ideal». La metadata repite la
 *   cifra («30 Variedades Explicadas») y el bloque educativo publica una tabla comparativa de 6
 *   variedades con su proporción de agua. No calcula nada: no hay conversión tazas↔gramos ni
 *   raciones, así que la verdad comprobable es (a) que los filtros devuelvan EXACTAMENTE su
 *   conjunto, (b) que la proporción y el tiempo de cada ficha no se contradigan entre sí ni con
 *   la tabla educativa, y (c) el contenido.
 *
 * DÓNDE VIVEN LOS DATOS
 *   app/guia-tipos-arroz/page.tsx — array `arroces` (líneas 49-665, 30 entradas literales, sin
 *   importar nada de data/), filtrado en `arrocesFiltrados` (línea 692: cuatro igualdades exactas
 *   más un `includes` sobre la concatenación en minúsculas de nombre, nombreOriginal, origen,
 *   descripción, platos y características). Los conjuntos de abajo se calcularon leyendo ese
 *   array ANTES de abrir el navegador.
 *
 * LOS CONJUNTOS ESPERADOS, CONTADOS A MANO SOBRE EL ARRAY
 *   Grano Corto ................ 11  (de 30: Largo 7, Medio 9, Corto 11, Glutinoso 2, Salvaje 1)
 *   Corto + Mediterráneo ........ 7  (las 11 de arriba menos sushi, Koshihikari, Ponni y la
 *                                    californiana «Arroz Bomba sushi americano»)
 *   Uso = Paella ................ 3  (Bomba, Senia, Bahía — y ninguno más: ni Arborio ni Calrose)
 *   Uso Risotto + Almidón «Muy alto» ... 2  (Arborio y Carnaroli; Vialone Nano, «aborio Italiano»
 *                                    y Padano son Risotto pero almidón «Alto»)
 *   Región = Europa ............. 0  ← ninguna de las 30 lleva región 'Europa' (HALLAZGO D)
 *
 * PROPORCIONES Y TIEMPOS CONTRASTADOS (3 variedades, ficha ↔ tabla educativa de la propia app,
 * que es la ÚNICA referencia interna que publica; fuente externa no hay ninguna — HALLAZGO G)
 *   Basmati ......... ficha 1:1.5 · 15-18 min   ↔ tabla 1:1.5      ✔ cuadran
 *   Arroz Bomba ..... ficha 1:2.5-3 · 16-18 min ↔ tabla 1:2.5-3    ✔ cuadran
 *   Arroz de sushi .. ficha 1:1.2 · 20-25 min   ↔ tabla 1:1.2      ✔ cuadran
 *   Las tres son plausibles para el método que cada una supone (olla tapada por absorción para
 *   basmati y sushi, paella para el bomba), pero NINGUNA ficha dice de qué método habla: la
 *   página no contiene ni una vez las palabras «fuente» ni «método» (verificado en el test).
 *
 * HALLAZGOS ABIERTOS, escritos como TESTIGO (documentan lo que la app hace HOY; cuando se
 * reparen, estos bloques fallarán y habrá que invertirlos). NO se corrigen desde el test:
 *   A. La MISMA variedad está dos veces con proporciones distintas: «Arroz rojo de Camarga»
 *      (línea 137, «Riz rouge de Camargue», 1:2) y «Arroz Camargue rojo» (línea 544, «Riz Rouge
 *      IGP», 1:2.5). Mismo origen, mismo tiempo (30-40 min), misma región y mismos usos. Buscar
 *      «camarga» devuelve las dos y el lector no tiene forma de saber cuál creer.
 *   B. El buscador no normaliza acentos: «jazmin» devuelve 0 y pinta «No se encontraron arroces»
 *      —una negación FALSA— mientras «jazmín» devuelve 2. La propia metadata de la app usa la
 *      forma sin tilde en sus keywords («basmati jazmin bomba»).
 *   C. Las «30 variedades» del <h1> están infladas por duplicados: Camarga×2 (A), el arroz de
 *      sushi japonés×2 («Arroz de sushi», cuyo nombreOriginal ya es «Sushi-meshi / Koshihikari»,
 *      y «Arroz japonés Koshihikari», ambos 1:1.2 y 20-25 min) y el arroz de sushi californiano×2
 *      («Arroz Calrose», grano Medio 1:1.5, y «Arroz Bomba sushi americano», grano Corto 1:1.2,
 *      los dos de California y los dos diciendo ser el 90 % del sushi de EE.UU.). Variedades
 *      distintas de verdad hay 27, y una de ellas se llama «Bomba» sin serlo.
 *   D. El desplegable Región ofrece «Europa», que no puede devolver nada: las 10 fichas europeas
 *      (España, Italia, Francia) están clasificadas como «Mediterráneo». REGIONES es una
 *      constante escrita a mano (línea 671) en vez de derivarse del array.
 *   E. Dos rankings mundiales falsos y uno ambiguo, en las curiosidades: Tailandia «primer
 *      exportador mundial de arroz» (lo es India desde 2012, ~20 Mt frente a ~7-8 Mt),
 *      «EE.UU. es el quinto productor mundial» (produce ~7-8 Mt y ronda el puesto 12; quinto es
 *      como EXPORTADOR) y «India produce el 70% mundial» bajo la ficha de Basmati, que leído
 *      como producción de arroz es falso (India ~25 %): el 70 % es su cuota de basmati.
 *   F. «La Camarga es el límite norte mundial del cultivo del arroz» es falso y además lo
 *      desmiente otra ficha de la propia app: la llanura del Po (~45° N) está al NORTE de la
 *      Camarga (~43,5° N), y hay arroz en Hokkaido y en Heilongjiang aún más arriba.
 *   G. Ni una fuente ni un método de cocción declarados, pese a que la proporción de agua es la
 *      promesa del <h1>. Tampoco cifras populares atribuidas: «más antioxidantes que los
 *      arándanos», «4x más fibra y 3x más vitamina B1», «50 €/kg», «1.500 hectáreas».
 *   H. Asimetría territorial valorativa (antipatrón 6 del CLAUDE.md): el Calrose es «más
 *      asequible que el sushi rice auténtico», es decir, el californiano no es «auténtico».
 *   I. El contador de resultados no es región viva: al filtrar cambia de «30 de 30» a «11 de 30»
 *      sin anunciarlo, y el estado vacío tampoco lleva role="status".
 *
 * LO QUE SÍ ESTÁ BIEN, y por eso se fija aquí: el contexto colonial del arroz Carolina está
 * escrito y nombrado (trabajo forzado de personas esclavizadas de la Costa del Arroz africana),
 * que es justo el antipatrón 8 del CLAUDE.md; y los cuatro filtros devuelven conjuntos exactos.
 */

const RUTA = '/guia-tipos-arroz/';
const BUSCADOR = 'input[aria-label="Buscar arroz"]';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  // Sin esto, un selectOption anterior a la hidratación movería el DOM sin llegar a React.
  await esperarHidratacion(page, [BUSCADOR]);
}

/** Los nombres de las fichas que se están mostrando, en el orden del array. */
const fichas = (page: Page) => page.locator('article h2');

/** El párrafo «Mostrando N de 30 variedades de arroz». */
const contador = (page: Page) => page.locator('p').filter({ hasText: /^Mostrando/ }).first();

/** La tarjeta de una variedad concreta, por su título exacto. */
const ficha = (page: Page, nombre: string) =>
  page.locator('article').filter({ has: page.getByRole('heading', { name: nombre, exact: true }) });

/** Escribe en el buscador y espera a que el ESTADO de React lo haya recogido. */
async function buscar(page: Page, texto: string): Promise<void> {
  await page.getByLabel('Buscar arroz').fill(texto);
  await esperarValorEnReact(page, BUSCADOR, texto);
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 (Pixel 7) — filtros, estado combinado, vuelta atrás y buscador
// ═══════════════════════════════════════════════════════════════════════════
test.describe('en móvil (Pixel 7): los filtros y el buscador devuelven lo que prometen', () => {
  // Se enumeran las opciones en vez de esparcir `...devices['Pixel 7']` porque el device
  // trae `defaultBrowserType` y Playwright no lo admite dentro de un describe.
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  test.beforeEach(async ({ page }) => {
    await abrir(page);
    expect(page.viewportSize()).toEqual({ width: 412, height: 839 }); // devices['Pixel 7']
  });

  test('CASO 1 — «Corto» devuelve las 11 de grano corto y ninguna más; combinar y limpiar cuadran', async ({
    page,
  }) => {
    await expect(contador(page)).toContainText('Mostrando 30 de 30 variedades de arroz');
    await expect(fichas(page)).toHaveCount(30);

    // Las 11 entradas con tipoGrano 'Corto' del array, en su orden (líneas 49-665).
    await page.getByLabel('Tipo de grano').selectOption('Corto');
    await expect(fichas(page)).toHaveText([
      'Arroz de sushi',
      'Arroz Bomba',
      'Arroz Senia',
      'Arroz Bahía',
      'Arborio',
      'Carnaroli',
      'Vialone Nano',
      'Arroz aborio Italiano',
      'Arroz japonés Koshihikari',
      'Arroz Ponni',
      'Arroz Bomba sushi americano',
    ]);
    await expect(contador(page)).toContainText('Mostrando 11 de 30');
    // Y lo que la insignia de cada tarjeta declara coincide con el filtro pedido: 11 «Grano corto».
    await expect(page.getByText('Grano corto', { exact: true })).toHaveCount(11);

    // ESTADO COMBINADO: de esas 11, las 7 del Mediterráneo (fuera sushi, Koshihikari, Ponni y la
    // californiana «Arroz Bomba sushi americano»).
    await page.getByLabel('Región').selectOption('Mediterráneo');
    await expect(fichas(page)).toHaveText([
      'Arroz Bomba',
      'Arroz Senia',
      'Arroz Bahía',
      'Arborio',
      'Carnaroli',
      'Vialone Nano',
      'Arroz aborio Italiano',
    ]);
    await expect(contador(page)).toContainText('Mostrando 7 de 30');

    // VOLVER ATRÁS: el botón de limpiar es de acción, no de estado, así que NO debe llevar
    // aria-pressed (un aria-pressed aquí sería una regresión, CLAUDE.md global §5).
    const limpiar = page.getByRole('button', { name: 'Limpiar todos los filtros' });
    await expect(limpiar).toHaveAttribute('type', 'button');
    expect(await limpiar.getAttribute('aria-pressed')).toBeNull();
    await limpiar.click();
    await expect(fichas(page)).toHaveCount(30);
    await expect(page.getByLabel('Tipo de grano')).toHaveValue('');
    await expect(page.getByLabel('Región')).toHaveValue('');
    await expect(limpiar).toHaveCount(0); // el botón se retira cuando no queda filtro

    // Un filtro de uso: «Paella» son exactamente los tres arroces españoles de paella.
    await page.getByLabel('Uso culinario').selectOption('Paella');
    await expect(fichas(page)).toHaveText(['Arroz Bomba', 'Arroz Senia', 'Arroz Bahía']);

    // Cruce de dos ejes distintos: Risotto + almidón «Muy alto» deja solo Arborio y Carnaroli.
    await page.getByLabel('Uso culinario').selectOption('Risotto');
    await page.getByLabel('Nivel de almidón').selectOption('Muy alto');
    await expect(fichas(page)).toHaveText(['Arborio', 'Carnaroli']);

    // Lo que no encuentra nada lo DICE en vez de quedarse en blanco.
    await page.getByRole('button', { name: 'Limpiar todos los filtros' }).click();
    await buscar(page, 'zzz');
    await expect(fichas(page)).toHaveCount(0);
    await expect(page.getByText('No se encontraron arroces')).toBeVisible();
    await expect(contador(page)).toContainText('Mostrando 0 de 30');

    // TESTIGO (hallazgo B) — el buscador no normaliza acentos: «jazmin» niega en falso.
    await buscar(page, 'jazmín');
    await expect(fichas(page)).toHaveText(['Jazmín / Tailandés', 'Arroz Jasmin tailandés americano']);
    await buscar(page, 'jazmin');
    await expect(fichas(page)).toHaveCount(0);
    await expect(page.getByText('No se encontraron arroces')).toBeVisible();

    // TESTIGO (hallazgo D) — «Europa» es una opción que no puede devolver nada.
    await buscar(page, '');
    await page.getByLabel('Región').selectOption('Europa');
    await expect(contador(page)).toContainText('Mostrando 0 de 30');
    await expect(page.getByText('No se encontraron arroces')).toBeVisible();
    // Mientras que las 10 fichas europeas sí salen bajo «Mediterráneo».
    await page.getByLabel('Región').selectOption('Mediterráneo');
    await expect(fichas(page)).toHaveCount(10);

    // TESTIGO (hallazgo I) — al cambiar de 10 a 30 resultados nadie lo anuncia.
    expect(await contador(page).getAttribute('aria-live')).toBeNull();
    expect(await contador(page).getAttribute('role')).toBeNull();
    await expect(page.locator('[role="status"]')).toHaveCount(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 — proporciones y tiempos: ficha ↔ tabla educativa, y la variedad duplicada
// ═══════════════════════════════════════════════════════════════════════════
test.describe('las proporciones y los tiempos que publica', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 2 — basmati, bomba y sushi cuadran con la tabla educativa; la Camarga se contradice', async ({
    page,
  }) => {
    // Las tres fichas, con el par (proporción, tiempo) que declara cada una.
    await expect(ficha(page, 'Basmati')).toContainText('1:1.5');
    await expect(ficha(page, 'Basmati')).toContainText('15-18 min');
    await expect(ficha(page, 'Arroz Bomba')).toContainText('1:2.5-3');
    await expect(ficha(page, 'Arroz Bomba')).toContainText('16-18 min');
    await expect(ficha(page, 'Arroz de sushi')).toContainText('1:1.2');
    await expect(ficha(page, 'Arroz de sushi')).toContainText('20-25 min (con reposo)');

    // La tabla comparativa del bloque educativo es la única referencia interna de la app:
    // debe decir lo MISMO que las fichas para esas tres variedades.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const tabla = page.getByRole('table');
    await expect(tabla.getByRole('row').filter({ hasText: 'Basmati' })).toContainText('1:1.5');
    await expect(tabla.getByRole('row').filter({ hasText: 'Bomba' })).toContainText('1:2.5-3');
    await expect(
      tabla.getByRole('row').filter({ hasText: 'Sushi (Koshihikari)' }),
    ).toContainText('1:1.2');

    // TESTIGO (hallazgo A) — la misma variedad, dos veces y con proporciones distintas.
    await buscar(page, 'camarga');
    await expect(fichas(page)).toHaveText(['Arroz rojo de Camarga', 'Arroz Camargue rojo']);
    await expect(ficha(page, 'Arroz rojo de Camarga')).toContainText('Riz rouge de Camargue');
    await expect(ficha(page, 'Arroz rojo de Camarga')).toContainText('1:2');
    await expect(ficha(page, 'Arroz Camargue rojo')).toContainText('Riz Rouge IGP');
    await expect(ficha(page, 'Arroz Camargue rojo')).toContainText('1:2.5');
    // Las dos dicen el mismo origen y el mismo tiempo: no son dos arroces, es uno repetido.
    await expect(ficha(page, 'Arroz rojo de Camarga')).toContainText('Camarga (Francia)');
    await expect(ficha(page, 'Arroz Camargue rojo')).toContainText('Camarga (Francia)');
    await expect(ficha(page, 'Arroz rojo de Camarga')).toContainText('30-40 min');
    await expect(ficha(page, 'Arroz Camargue rojo')).toContainText('30-40 min');

    // TESTIGO (hallazgo C) — el arroz de sushi californiano también está dos veces, con grano y
    // proporción distintos, y las dos fichas se atribuyen el 90 % del sushi de EE.UU.
    await buscar(page, 'california');
    await expect(ficha(page, 'Arroz Calrose')).toContainText('1:1.5');
    await expect(ficha(page, 'Arroz Calrose')).toContainText('Grano medio');
    await expect(ficha(page, 'Arroz Bomba sushi americano')).toContainText('1:1.2');
    await expect(ficha(page, 'Arroz Bomba sushi americano')).toContainText('Grano corto');

    // TESTIGO (hallazgo G) — ni fuente ni método de cocción en toda la página, con la guía
    // educativa ya desplegada (el contenido está siempre en el DOM, así que esto lo cubre).
    await expect(page.getByText(/fuente/i)).toHaveCount(0);
    await expect(page.getByText(/m[ée]todo/i)).toHaveCount(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 — contenido: contexto histórico, asimetría territorial y cifras
// ═══════════════════════════════════════════════════════════════════════════
test.describe('el contenido frente a los antipatrones editoriales del proyecto', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 3 — el contexto colonial del Carolina está escrito; los rankings mundiales no cuadran', async ({
    page,
  }) => {
    // BIEN (antipatrón 8, contexto colonial omitido): la ficha del Carolina lo nombra sin
    // romantizar y explica de dónde salió la técnica. Esto se fija para que no se pierda.
    const carolina = ficha(page, 'Arroz Carolina');
    await expect(carolina).toContainText('personas esclavizadas');
    await expect(carolina).toContainText('Costa del Arroz africana');
    await expect(carolina).toContainText('Su trabajo forzado fue el motor del sistema rizícola sureño');

    // TESTIGO (hallazgo H, antipatrón 6) — «auténtico» reservado al japonés.
    await expect(ficha(page, 'Arroz Calrose')).toContainText(
      'Más asequible que el sushi rice auténtico',
    );

    // TESTIGO (hallazgo E) — dos rankings mundiales falsos y uno ambiguo.
    // India es el primer exportador mundial de arroz desde 2012 (~20 Mt; Tailandia ~7-8 Mt).
    await expect(ficha(page, 'Jazmín / Tailandés')).toContainText(
      'siendo el primer exportador mundial de arroz',
    );
    // EE.UU. produce ~7-8 Mt y ronda el puesto 12 mundial; quinto lo es como EXPORTADOR.
    await expect(ficha(page, 'Arroz blanco largo')).toContainText(
      'EE.UU. es el quinto productor mundial',
    );
    // Bajo la ficha de Basmati, «el 70% mundial» se lee como producción de arroz (India ~25 %).
    await expect(ficha(page, 'Basmati')).toContainText('India produce el 70% mundial');

    // TESTIGO (hallazgo F) — la app se desmiente a sí misma: el Po (~45° N) está al norte de la
    // Camarga (~43,5° N), y las dos fichas conviven en la misma página.
    await expect(ficha(page, 'Arroz rojo de Camarga')).toContainText(
      'La Camarga es el límite norte mundial del cultivo del arroz',
    );
    await expect(ficha(page, 'Arroz Padano')).toContainText(
      'La llanura del Po es la mayor zona arrocera de Europa',
    );

    // TESTIGO (hallazgo G) — cifras populares redondas sin atribuir a nadie.
    await expect(ficha(page, 'Arroz negro / Forbidden rice')).toContainText('más que los arándanos');
    await expect(ficha(page, 'Arroz integral / Brown rice')).toContainText(
      'Tiene 4x más fibra y 3x más vitamina B1 que el arroz blanco',
    );
    await expect(ficha(page, 'Arroz de sushi')).toContainText('puede costar 50€/kg en Japón');
    await expect(ficha(page, 'Arroz Bomba')).toContainText('Solo se cultivan 1.500 hectáreas');
  });
});
