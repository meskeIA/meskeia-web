import { test, expect, devices, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — guia-tipos-arroz (segmento interactiva, riesgo 2, 48 usos, 76 s de estancia)
 *
 * Primera inspección: 20/09/2026 (Opus 5), contra producción y contra el código del repositorio.
 * Reparación de los 10 hallazgos: 20/09/2026. Los bloques que antes documentaban el defecto como
 * TESTIGO están ahora invertidos: afirman el comportamiento correcto, y si alguien reintroduce
 * cualquiera de los diez, este spec se pone en rojo.
 *
 * QUÉ PROMETE
 *   <h1> «Guía de Tipos de Arroz del Mundo» y subtítulo: «N variedades de arroz: tipo de grano,
 *   origen, tiempo de cocción, proporción de agua y uso culinario ideal». No calcula nada: no hay
 *   conversión tazas↔gramos ni raciones, así que la verdad comprobable es (a) que los filtros
 *   devuelvan EXACTAMENTE su conjunto, (b) que la proporción y el tiempo de cada ficha no se
 *   contradigan entre sí ni con la tabla educativa, y (c) el contenido.
 *
 * DÓNDE VIVEN LOS DATOS
 *   app/guia-tipos-arroz/arroces.ts — array `arroces` (27 entradas literales tras fusionar las
 *   tres variedades que estaban repetidas), más `TOTAL_VARIEDADES` y las listas de opciones de
 *   los filtros, DERIVADAS del array. El filtrado vive en `arrocesFiltrados` (page.tsx): cuatro
 *   igualdades exactas más un `includes` sobre la concatenación normalizada —minúsculas y SIN
 *   diacríticos— de nombre, nombreOriginal, origen, descripción, platos y características.
 *   Los conjuntos de abajo se calcularon leyendo ese array, no observando la pantalla.
 *
 * LOS CONJUNTOS ESPERADOS, CONTADOS SOBRE EL ARRAY (27 fichas)
 *   Grano Corto ................. 9  (de 27: Largo 7, Medio 8, Corto 9, Glutinoso 2, Salvaje 1)
 *   Corto + Mediterráneo ........ 7  (las 9 de arriba menos el arroz de sushi japonés y el Ponni)
 *   Uso = Paella ................ 3  (Bomba, Senia, Bahía — y ninguno más: ni Arborio ni Calrose)
 *   Uso Risotto + Almidón «Muy alto» ... 2  (Arborio y Carnaroli; Vialone Nano, Roma y Padano son
 *                                    Risotto pero almidón «Alto»)
 *   Región = Mediterráneo ....... 9  (y «Europa» ya NO es una opción: no la lleva ninguna ficha)
 *
 * PROPORCIONES, TIEMPOS Y MÉTODOS (ficha ↔ tabla educativa de la propia app)
 *   Basmati ......... 1:1.5      · 15-18 min   · absorción en olla tapada
 *   Arroz Bomba ..... 1:2.5-3    · 16-18 min   · paella, evaporación en recipiente ancho
 *   Sushi japonés ... 1:1.2      · 20-25 min   · absorción en olla tapada, con reposo
 *   Carnaroli ....... 1:3 aprox. · 16-18 min   · risotto, caldo añadido en cazos
 *   Cada ficha declara ahora a QUÉ método corresponde su proporción, que es lo que hace que
 *   1:2.5-3 y 1:2 no se contradigan: son dos formas distintas de cocer.
 *
 * LOS DIEZ HALLAZGOS, Y LO QUE AQUÍ SE EXIGE DE CADA UNO
 *   A. Variedades duplicadas con datos contradictorios → una ficha por variedad. Buscar «camarga»
 *      devuelve UNA, y lo mismo «california» y «koshihikari». Además la nomenclatura: ya no hay
 *      ningún «Bomba» californiano, ni «aborio» mal escrito, ni una variedad española mezclada
 *      con una marca registrada de Texas.
 *   B. El buscador normaliza acentos: «jazmin», «jazmín» y «JAZMIN» devuelven las MISMAS fichas.
 *   C. La cifra sale del array: el <h1>, el contador y el bloque educativo dicen los mismos 27.
 *   D. Ningún desplegable ofrece una opción que no pueda devolver nada (se recorren TODAS).
 *   E, F. Los rankings mundiales falsos y el «límite norte mundial» ya no están, y lo que los
 *      sustituye se comprueba por su texto, no por su ausencia.
 *   G. Método declarado en cada ficha y en la tabla, y la página dice de dónde salen las cifras.
 *   H. Cifras populares sin fuente retiradas.
 *   I. «Más asequible que el sushi rice auténtico» → formulación neutra.
 *   J. El contador es región viva (role=status + aria-live), y el estado vacío también.
 *
 * LO QUE SÍ ESTABA BIEN, y por eso se fija aquí: el contexto colonial del arroz Carolina está
 * escrito y nombrado (trabajo forzado de personas esclavizadas de la Costa del Arroz africana),
 * que es justo el antipatrón 8 del CLAUDE.md; y los cuatro filtros devuelven conjuntos exactos.
 */

const RUTA = '/guia-tipos-arroz/';
const BUSCADOR = 'input[aria-label="Buscar arroz"]';

/** Las 27 del array, tras fusionar los tres duplicados. */
const TOTAL = 27;

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  // Sin esto, un selectOption anterior a la hidratación movería el DOM sin llegar a React.
  await esperarHidratacion(page, [BUSCADOR]);
}

/** Los nombres de las fichas que se están mostrando, en el orden del array. */
const fichas = (page: Page) => page.locator('article h2');

/** El párrafo «Mostrando N de 27 variedades de arroz». */
const contador = (page: Page) => page.locator('p').filter({ hasText: /^Mostrando/ }).first();

/** La tarjeta de una variedad concreta, por su título exacto. */
const ficha = (page: Page, nombre: string) =>
  page.locator('article').filter({ has: page.getByRole('heading', { name: nombre, exact: true }) });

/** Escribe en el buscador y espera a que el ESTADO de React lo haya recogido. */
async function buscar(page: Page, texto: string): Promise<void> {
  await page.getByLabel('Buscar arroz').fill(texto);
  await esperarValorEnReact(page, BUSCADOR, texto);
}

/** Los valores que ofrece un desplegable, sin la opción vacía («Todos» / «Todas»). */
async function opcionesDe(page: Page, etiqueta: string): Promise<string[]> {
  const textos = await page.getByLabel(etiqueta).locator('option').allTextContents();
  return textos.map((t) => t.trim()).filter((t) => t !== 'Todos' && t !== 'Todas');
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

  test('CASO 1 — «Corto» devuelve las 9 de grano corto y ninguna más; combinar y limpiar cuadran', async ({
    page,
  }) => {
    await expect(contador(page)).toContainText(`Mostrando ${TOTAL} de ${TOTAL} variedades de arroz`);
    await expect(fichas(page)).toHaveCount(TOTAL);

    // La cifra del encabezado sale del array (hallazgo C): promete lo mismo que el contador.
    // Antes prometía «30 variedades» con tres fichas repetidas dentro.
    await expect(
      page.getByText(new RegExp(`^${TOTAL} variedades de arroz:`)).first(),
    ).toBeVisible();
    await expect(page.getByText('30 variedades')).toHaveCount(0);

    // Las 9 entradas con tipoGrano 'Corto' del array, en su orden.
    await page.getByLabel('Tipo de grano').selectOption('Corto');
    await expect(fichas(page)).toHaveText([
      'Arroz de sushi japonés',
      'Arroz Bomba',
      'Arroz Senia',
      'Arroz Bahía',
      'Arborio',
      'Carnaroli',
      'Vialone Nano',
      'Arroz Roma',
      'Arroz Ponni',
    ]);
    await expect(contador(page)).toContainText(`Mostrando 9 de ${TOTAL}`);
    // Y lo que la insignia de cada tarjeta declara coincide con el filtro pedido: 9 «Grano corto».
    await expect(page.getByText('Grano corto', { exact: true })).toHaveCount(9);

    // ESTADO COMBINADO: de esas 9, las 7 del Mediterráneo (fuera el sushi japonés y el Ponni).
    await page.getByLabel('Región').selectOption('Mediterráneo');
    await expect(fichas(page)).toHaveText([
      'Arroz Bomba',
      'Arroz Senia',
      'Arroz Bahía',
      'Arborio',
      'Carnaroli',
      'Vialone Nano',
      'Arroz Roma',
    ]);
    await expect(contador(page)).toContainText(`Mostrando 7 de ${TOTAL}`);

    // VOLVER ATRÁS: el botón de limpiar es de acción, no de estado, así que NO debe llevar
    // aria-pressed (un aria-pressed aquí sería una regresión, CLAUDE.md global §5).
    const limpiar = page.getByRole('button', { name: 'Limpiar todos los filtros' });
    await expect(limpiar).toHaveAttribute('type', 'button');
    expect(await limpiar.getAttribute('aria-pressed')).toBeNull();
    await limpiar.click();
    await expect(fichas(page)).toHaveCount(TOTAL);
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
    await expect(contador(page)).toContainText(`Mostrando 0 de ${TOTAL}`);

    // REPARADO (hallazgo B) — el buscador normaliza los diacríticos en los DOS lados: con tilde,
    // sin ella y en mayúsculas se obtiene exactamente lo mismo. Ya no hay negación falsa.
    const conJazmin = ['Jazmín / Tailandés', 'Arroz Jasmin tailandés americano'];
    await buscar(page, 'jazmín');
    await expect(fichas(page)).toHaveText(conJazmin);
    await buscar(page, 'jazmin');
    await expect(fichas(page)).toHaveText(conJazmin);
    await buscar(page, 'JAZMIN');
    await expect(fichas(page)).toHaveText(conJazmin);
    await expect(page.getByText('No se encontraron arroces')).toHaveCount(0);

    // REPARADO (hallazgo J) — el contador es región viva y se anuncia al cambiar el filtrado.
    await buscar(page, '');
    await expect(contador(page)).toHaveAttribute('role', 'status');
    await expect(contador(page)).toHaveAttribute('aria-live', 'polite');
    await page.getByLabel('Región').selectOption('Mediterráneo');
    await expect(contador(page)).toContainText(`Mostrando 9 de ${TOTAL}`);
    // Y el estado vacío también se anuncia, en vez de aparecer en silencio.
    await buscar(page, 'zzz');
    await expect(page.locator('[role="status"]').filter({ hasText: 'No se encontraron arroces' })).toHaveCount(1);
  });

  test('CASO 1.bis — ningún desplegable ofrece una opción que no pueda devolver nada', async ({
    page,
  }) => {
    // REPARADO (hallazgo D). El desplegable Región ofrecía «Europa» y ninguna ficha la llevaba:
    // las europeas están clasificadas como «Mediterráneo». Las listas se derivan ahora del array.
    expect(await opcionesDe(page, 'Región')).toEqual([
      'Asia',
      'Mediterráneo',
      'América',
      'África',
    ]);

    // Y la propiedad general, que es la que impide que vuelva a pasar en cualquiera de los cuatro:
    // toda opción ofrecida devuelve al menos una ficha.
    for (const etiqueta of ['Tipo de grano', 'Nivel de almidón', 'Región', 'Uso culinario']) {
      const opciones = await opcionesDe(page, etiqueta);
      expect(opciones.length).toBeGreaterThan(0);

      for (const opcion of opciones) {
        await page.getByLabel(etiqueta).selectOption(opcion);
        await expect(
          contador(page),
          `«${etiqueta} = ${opcion}» no devuelve ninguna ficha`,
        ).not.toContainText(`Mostrando 0 de ${TOTAL}`);
        await expect(fichas(page)).not.toHaveCount(0);
      }

      await page.getByLabel(etiqueta).selectOption('');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 — proporciones, tiempos y método: ficha ↔ tabla educativa, sin duplicados
// ═══════════════════════════════════════════════════════════════════════════
test.describe('las proporciones y los tiempos que publica', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 2 — basmati, bomba y sushi cuadran con la tabla educativa; cada variedad sale UNA vez', async ({
    page,
  }) => {
    // Las tres fichas, con el trío (proporción, tiempo, método) que declara cada una.
    await expect(ficha(page, 'Basmati')).toContainText('1:1.5');
    await expect(ficha(page, 'Basmati')).toContainText('15-18 min');
    await expect(ficha(page, 'Basmati')).toContainText('Absorción en olla tapada');
    await expect(ficha(page, 'Arroz Bomba')).toContainText('1:2.5-3');
    await expect(ficha(page, 'Arroz Bomba')).toContainText('16-18 min');
    await expect(ficha(page, 'Arroz Bomba')).toContainText(
      'Paella: evaporación en recipiente ancho',
    );
    await expect(ficha(page, 'Arroz de sushi japonés')).toContainText('1:1.2');
    await expect(ficha(page, 'Arroz de sushi japonés')).toContainText('20-25 min (con reposo)');
    await expect(ficha(page, 'Arroz de sushi japonés')).toContainText(
      'Absorción en olla tapada, con reposo',
    );

    // La tabla comparativa del bloque educativo debe decir lo MISMO que las fichas, método incluido.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const tabla = page.getByRole('table');
    await expect(tabla.getByRole('columnheader', { name: 'Método' })).toBeVisible();
    await expect(tabla.getByRole('row').filter({ hasText: 'Basmati' })).toContainText('1:1.5');
    await expect(tabla.getByRole('row').filter({ hasText: 'Basmati' })).toContainText(
      'Absorción en olla tapada',
    );
    await expect(tabla.getByRole('row').filter({ hasText: 'Bomba' })).toContainText('1:2.5-3');
    await expect(tabla.getByRole('row').filter({ hasText: 'Bomba' })).toContainText(
      'Paella: evaporación en recipiente ancho',
    );
    await expect(
      tabla.getByRole('row').filter({ hasText: 'Sushi (Koshihikari)' }),
    ).toContainText('1:1.2');
    await expect(tabla.getByRole('row').filter({ hasText: 'Carnaroli' })).toContainText(
      '1:3 aprox., en cazos',
    );

    // REPARADO (hallazgo A) — la Camarga es UNA ficha con UNA proporción, no dos que se
    // contradicen. Antes salían «Arroz rojo de Camarga» (1:2) y «Arroz Camargue rojo» (1:2.5).
    await buscar(page, 'camarga');
    await expect(fichas(page)).toHaveText(['Arroz rojo de Camarga']);
    await expect(ficha(page, 'Arroz rojo de Camarga')).toContainText('1:2.5');
    await expect(ficha(page, 'Arroz rojo de Camarga')).toContainText('30-40 min');
    await expect(page.getByText('Arroz Camargue rojo')).toHaveCount(0);

    // REPARADO (hallazgo A) — el arroz de sushi californiano también era dos fichas, con grano y
    // proporción distintos, las dos atribuyéndose el 90 % del sushi de EE.UU. Ahora es una.
    await buscar(page, 'california');
    await expect(fichas(page)).toHaveText(['Arroz Calrose']);
    await expect(ficha(page, 'Arroz Calrose')).toContainText('Grano medio');
    await expect(ficha(page, 'Arroz Calrose')).toContainText(
      '1:1.2 para sushi · 1:1.5 como guarnición',
    );

    // Y el arroz japonés, que estaba como «Arroz de sushi» y otra vez como «Arroz japonés
    // Koshihikari», con los mismos 1:1.2 y 20-25 min.
    await buscar(page, 'koshihikari');
    await expect(fichas(page)).toHaveText(['Arroz de sushi japonés']);

    // NOMENCLATURA (hallazgo A) — buscar «bomba» ya no devuelve un arroz californiano junto al
    // que tiene D.O. Valencia: las tres que salen lo mencionan porque se comparan con él.
    await buscar(page, 'bomba');
    await expect(fichas(page)).toHaveText(['Arroz Bomba', 'Arroz Senia', 'Arroz Bahía']);
    await expect(page.getByText('Arroz Bomba sushi americano')).toHaveCount(0);
    // «Arroz aborio Italiano» era la variedad Roma con Arborio mal escrito.
    await buscar(page, '');
    await expect(page.getByText('Arroz aborio Italiano')).toHaveCount(0);
    await expect(ficha(page, 'Arroz Roma')).toContainText('Roma');
    // «Arroz Bahia / Mahatma» mezclaba una variedad española con una marca registrada de Texas:
    // la marca se conserva donde se pueda encontrar, pero ya no da nombre a la variedad.
    await expect(page.getByText('Arroz Bahia / Mahatma')).toHaveCount(0);
    await expect(ficha(page, 'Arroz largo de Texas')).toContainText('marca Mahatma');
    await expect(ficha(page, 'Arroz Bahía')).toContainText('Sevilla/Valencia');

    // REPARADO (hallazgo G) — la página dice ahora a qué método corresponde cada proporción y de
    // dónde salen las cifras. Antes las palabras «método» y «fuente» no aparecían ni una vez.
    await expect(page.getByText(/cada ficha indica el método de cocción/i).first()).toBeVisible();
    await expect(page.getByText(/no de una fuente normativa/i).first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 — contenido: contexto histórico, asimetría territorial y cifras
// ═══════════════════════════════════════════════════════════════════════════
test.describe('el contenido frente a los antipatrones editoriales del proyecto', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 3 — el contexto colonial del Carolina está escrito; los rankings mundiales cuadran', async ({
    page,
  }) => {
    // BIEN (antipatrón 8, contexto colonial omitido): la ficha del Carolina lo nombra sin
    // romantizar y explica de dónde salió la técnica. Esto se fija para que no se pierda.
    const carolina = ficha(page, 'Arroz Carolina');
    await expect(carolina).toContainText('personas esclavizadas');
    await expect(carolina).toContainText('Costa del Arroz africana');
    await expect(carolina).toContainText('Su trabajo forzado fue el motor del sistema rizícola sureño');

    // REPARADO (hallazgo I, antipatrón 6) — el arroz californiano ya no queda calificado como no
    // «auténtico»: la diferencia de origen es un hecho, «auténtico» era un juicio.
    await expect(page.getByText(/aut[ée]ntic/i)).toHaveCount(0);
    await expect(ficha(page, 'Arroz Calrose')).toContainText(
      'más asequible que el arroz de sushi importado de Japón',
    );
    // Y el Carnaroli deja de ser «la única opción» para la alta cocina.
    await expect(page.getByText(/[úu]nica opci[óo]n/i)).toHaveCount(0);
    await expect(ficha(page, 'Carnaroli')).toContainText(
      'Muchas cocinas italianas lo prefieren al Arborio',
    );

    // REPARADO (hallazgo E) — los dos rankings mundiales falsos y el ambiguo.
    // India es el primer exportador mundial de arroz desde 2012 (~20 Mt; Tailandia ~7-8 Mt).
    await expect(page.getByText('siendo el primer exportador mundial de arroz')).toHaveCount(0);
    await expect(ficha(page, 'Jazmín / Tailandés')).toContainText(
      'India la superó como mayor exportador mundial de arroz a partir de 2012',
    );
    // EE.UU. produce ~7-8 Mt y ronda el puesto 12 mundial; quinto lo es como EXPORTADOR.
    await expect(page.getByText('EE.UU. es el quinto productor mundial')).toHaveCount(0);
    await expect(ficha(page, 'Arroz blanco largo')).toContainText(
      'lejos de los grandes productores asiáticos',
    );
    // El 70 % es la cuota de India en el comercio de BASMATI, no en la producción de arroz.
    await expect(page.getByText('India produce el 70% mundial')).toHaveCount(0);
    await expect(ficha(page, 'Basmati')).toContainText('comercio mundial de basmati');

    // REPARADO (hallazgo F) — la app ya no se desmiente a sí misma: la llanura del Po (~45° N)
    // está al norte de la Camarga (~43,5° N), así que el «límite norte mundial» era falso.
    await expect(page.getByText(/l[íi]mite norte mundial/i)).toHaveCount(0);
    await expect(ficha(page, 'Arroz rojo de Camarga')).toContainText(
      'prácticamente la única zona arrocera de Francia',
    );
    await expect(ficha(page, 'Arroz Padano')).toContainText(
      'La llanura del Po es la mayor zona arrocera de Europa',
    );

    // REPARADO (hallazgo H) — cifras populares redondas sin atribuir a nadie, retiradas. Lo que
    // queda dice lo mismo sin inventarse una magnitud.
    await expect(page.getByText(/ar[áa]ndanos/i)).toHaveCount(0);
    await expect(ficha(page, 'Arroz negro / Forbidden rice')).toContainText(
      'los mismos pigmentos que dan color a moras y frutos rojos',
    );
    await expect(page.getByText('4x más fibra')).toHaveCount(0);
    await expect(ficha(page, 'Arroz integral / Brown rice')).toContainText(
      'más fibra, vitaminas del grupo B y minerales que el blanco refinado',
    );
    await expect(page.getByText(/50\s*€\/kg/)).toHaveCount(0);
    await expect(page.getByText('1.500 hectáreas')).toHaveCount(0);
    await expect(ficha(page, 'Arroz Bomba')).toContainText('Su rendimiento por hectárea es bajo');
    await expect(page.getByText('el arroz más exportado de España')).toHaveCount(0);
  });
});
