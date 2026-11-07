import { test, expect, devices, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — guia-frutas-exoticas (segmento interactiva, riesgo 2, modo primera)
 *
 * Primera inspección: 07/11/2026 (Opus 5.5), contra el servidor de la copia del Inspector.
 *
 * QUÉ PROMETE
 *   <h1> «Guía de Frutas Tropicales y Subtropicales del Mundo» y, debajo, «40 frutas con su
 *   origen, temporada, sabor y formas de consumo». No calcula nada: la verdad comprobable es
 *   (a) que el buscador y los cuatro desplegables devuelvan EXACTAMENTE su conjunto, (b) que la
 *   ficha muestre lo que dice el array, y (c) el contenido (avisos de salud, cifras, FAQ).
 *
 * DÓNDE VIVEN LOS DATOS
 *   app/guia-frutas-exoticas/page.tsx — array `frutas` inline: 39 objetos (no 40). El filtrado
 *   es `frutasFiltradas`: cuatro igualdades exactas más un `includes` sobre nombre, nombre
 *   científico y países de origen, pasados a minúsculas con `toLowerCase()` y SIN quitar los
 *   diacríticos. Los conjuntos de abajo se contaron leyendo ese array, antes de abrir la app.
 *
 * CONJUNTOS ESPERADOS, CONTADOS SOBRE EL ARRAY (39 fichas)
 *   «carambola» ..................... 1  Carambola / Star fruit (por nombre y por «Averrhoa
 *                                         carambola»; «Carambolo / Bilimbí» no casa: carambolo)
 *   Región África ................... 3  Marula, Baobab, Kiwano / Melón cornudo
 *   Sudeste Asiático + Verano ....... 8  de las 11 del Sudeste (fuera Carambola, Otoño; Pomelo,
 *                                         Invierno; Bilimbí, Todo el año)
 *   Oceanía + Otoño + Tropical + Especialidades ... 1 Feijoa; con «Común» en vez de
 *                                         «Especialidades» ... 0
 *   «perú» / «Perú» ................. 6  las seis con Perú entre sus países de origen
 *   «xyz123» ........................ 0  y el aviso «No se han encontrado frutas con esos filtros.»
 *
 * REPARADOS el 07/11/2026: el buscador quita los diacríticos de los dos lados (4171), y se
 * retiraron las fichas repetidas «Mangostino blanco» y «Chirimoya peruana» (4172). Sobre las 37
 * de ahora, Sudeste Asiático + Verano son 7 y «peru» con o sin tilde da 5: las cinco con Perú
 * entre sus países (la sexta casaba solo por el nombre de la ficha retirada).
 *
 * Los HALLAZGOS del final eran `test.fail()`; reparados, quedan como regresión.
 */

const RUTA = '/guia-frutas-exoticas/';
const BUSCADOR = 'input[aria-label="Buscar fruta exótica"]';

/**
 * Los objetos del array `frutas` de page.tsx: 39 en la inspección (la página prometía 40). El
 * 07/11/2026 se retiraron dos fichas repetidas de especies que ya tenían la suya, «Mangostino
 * blanco» y «Chirimoya peruana» (hallazgo 4172): quedan 37, y la página ya saca la cifra del array.
 */
const TOTAL = 37;

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  // Sin esto, un selectOption o un fill anterior a la hidratación movería el DOM sin llegar a React.
  await esperarHidratacion(page, [BUSCADOR]);
}

/** Los títulos de las fichas que se están mostrando, en el orden del array. */
const fichas = (page: Page) => page.locator('article').filter({ has: page.locator('em') }).locator('h2');

/** «Mostrando N de 39 frutas» (región viva de la app; el pie tiene otra con role=status). */
const contador = (page: Page) => page.locator('[role="status"]').filter({ hasText: 'Mostrando' });

/** La tarjeta de una fruta, por su título exacto. */
const ficha = (page: Page, nombre: string) =>
  page.locator('article').filter({ has: page.getByRole('heading', { name: nombre, exact: true }) });

const SIN_RESULTADOS = 'No se han encontrado frutas con esos filtros.';

/** Escribe en el buscador y espera a que el ESTADO de React lo haya recogido. */
async function buscar(page: Page, texto: string): Promise<void> {
  await page.getByLabel('Buscar fruta exótica').fill(texto);
  await esperarValorEnReact(page, BUSCADOR, texto);
}

async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
}

const SUDESTE_VERANO = [
  'Durian',
  'Mangostán',
  'Rambután',
  'Lichi',
  'Longan / Ojo de dragón',
  'Salak / Fruta serpiente',
  'Jackfruit / Yaca',
];

const CON_PERU = [
  'Cherimoya',
  'Maracuyá / Fruta de la pasión',
  'Pitahaya amarilla',
  'Granadilla',
  'Capulí / Cereza andina',
];

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 (normal, Pixel 7) — buscar una fruta, su ficha contra el array, y dos filtros
// ═══════════════════════════════════════════════════════════════════════════
test.describe('en móvil (Pixel 7): el buscador y los filtros se ven y responden', () => {
  // Se enumeran las opciones en vez de esparcir `...devices['Pixel 7']`: el device trae
  // `defaultBrowserType` y Playwright no lo admite dentro de un describe.
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

  test('CASO 1 — «carambola» da su ficha tal como está en el array; África y Sudeste+Verano cuadran', async ({
    page,
  }) => {
    await expect(contador(page)).toHaveText(`Mostrando ${TOTAL} de ${TOTAL} frutas`);
    await expect(fichas(page)).toHaveCount(TOTAL);

    // Los controles caben en los 412 px y no hay desbordamiento horizontal.
    for (const sel of [BUSCADOR, '#region', '#temporada', '#sabor', '#disponibilidad']) {
      const caja = await page.locator(sel).boundingBox();
      expect(caja, sel).not.toBeNull();
      expect(caja!.x, sel).toBeGreaterThanOrEqual(0);
      expect(caja!.x + caja!.width, sel).toBeLessThanOrEqual(412);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    ).toBe(0);

    // Buscar escribiendo con el teclado del móvil.
    await page.getByLabel('Buscar fruta exótica').tap();
    await buscar(page, 'carambola');
    await expect(fichas(page)).toHaveText(['Carambola / Star fruit']);
    await expect(contador(page)).toHaveText(`Mostrando 1 de ${TOTAL} frutas`);

    // La ficha, campo a campo contra el objeto del array (page.tsx, «Carambola / Star fruit»).
    const carambola = ficha(page, 'Carambola / Star fruit');
    await expect(carambola).toContainText('Averrhoa carambola');
    await expect(carambola).toContainText('Sudeste Asiático');
    await expect(carambola).toContainText('Dulce-ácido');
    await expect(carambola).toContainText('Común');
    await expect(carambola).toContainText('Temporada: Otoño');
    await expect(carambola).toContainText('Origen: Indonesia, Malasia, Filipinas');
    await expect(carambola).toContainText('Lavar y cortar en rodajas en forma de estrella');
    // BIEN: el aviso renal está en la propia ficha, visible sin abrir la guía.
    await expect(carambola.getByText(/contraindicada para personas con problemas renales/)).toBeVisible();

    // Filtros por desplegable.
    await buscar(page, '');
    await page.getByLabel('Región').selectOption('África');
    await expect(fichas(page)).toHaveText(['Marula', 'Baobab', 'Kiwano / Melón cornudo']);
    await expect(contador(page)).toHaveText(`Mostrando 3 de ${TOTAL} frutas`);

    await page.getByLabel('Región').selectOption('Sudeste Asiático');
    await page.getByLabel('Temporada').selectOption('Verano');
    await expect(fichas(page)).toHaveText(SUDESTE_VERANO);

    // Limpiar es un botón de acción: type=button y sin aria-pressed.
    const limpiar = page.getByRole('button', { name: 'Limpiar filtros' });
    await expect(limpiar).toHaveAttribute('type', 'button');
    expect(await limpiar.getAttribute('aria-pressed')).toBeNull();
    await limpiar.tap();
    await expect(contador(page)).toHaveText(`Mostrando ${TOTAL} de ${TOTAL} frutas`);
    await expect(page.getByLabel('Región')).toHaveValue('Todas');
    await expect(page.getByLabel('Temporada')).toHaveValue('Todas');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASOS 2 y 3 (escritorio) — el límite y lo que no debe encontrar nada
// ═══════════════════════════════════════════════════════════════════════════
test.describe('en escritorio: límites del filtrado y búsqueda sin resultados', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 2 — la combinación más estrecha deja solo la Feijoa; mayúsculas y tildes iguales a minúsculas', async ({
    page,
  }) => {
    // Los cuatro desplegables a la vez: la única fruta de Oceanía es la Feijoa, y cumple los otros tres.
    await page.getByLabel('Región').selectOption('Oceanía');
    await page.getByLabel('Temporada').selectOption('Otoño');
    await page.getByLabel('Sabor').selectOption('Tropical');
    await page.getByLabel('Disponibilidad').selectOption('Especialidades');
    await expect(fichas(page)).toHaveText(['Feijoa']);
    await expect(contador(page)).toHaveText(`Mostrando 1 de ${TOTAL} frutas`);

    // Un paso más allá: la Feijoa es «Especialidades», así que «Común» no deja ninguna, y lo dice.
    await page.getByLabel('Disponibilidad').selectOption('Común');
    await expect(fichas(page)).toHaveCount(0);
    await expect(page.getByText(SIN_RESULTADOS)).toBeVisible();
    await expect(contador(page)).toHaveText(`Mostrando 0 de ${TOTAL} frutas`);
    await page.getByRole('button', { name: 'Limpiar filtros' }).click();

    // Mayúsculas con la tilde escrita: toLowerCase() las iguala.
    await buscar(page, 'MARACUYÁ');
    await expect(fichas(page)).toHaveText(['Maracuyá / Fruta de la pasión']);
    await buscar(page, 'maracuyá');
    await expect(fichas(page)).toHaveText(['Maracuyá / Fruta de la pasión']);
    await buscar(page, 'DURIAN');
    await expect(fichas(page)).toHaveText(['Durian']);

    // Por país de origen, con la tilde: las seis que llevan Perú en `paisesOrigen`.
    await buscar(page, 'Perú');
    await expect(fichas(page)).toHaveText(CON_PERU);
    await buscar(page, 'perú');
    await expect(fichas(page)).toHaveText(CON_PERU);
  });

  test('CASO 3 — una búsqueda que no casa con nada da 0 y el aviso; limpiar vuelve a las 39', async ({
    page,
  }) => {
    await buscar(page, 'xyz123');
    await expect(fichas(page)).toHaveCount(0);
    await expect(page.getByText(SIN_RESULTADOS)).toBeVisible();
    await expect(contador(page)).toHaveText(`Mostrando 0 de ${TOTAL} frutas`);
    // El contador es región viva: el lector de pantalla oye el «0».
    await expect(contador(page)).toHaveAttribute('aria-live', 'polite');

    await page.getByRole('button', { name: 'Limpiar filtros' }).click();
    await expect(page.getByLabel('Buscar fruta exótica')).toHaveValue('');
    await expect(fichas(page)).toHaveCount(TOTAL);
    await expect(page.getByText(SIN_RESULTADOS)).toHaveCount(0);

    // El FAQPage servido tiene sus 5 preguntas.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((t) => JSON.parse(t)).find((j) => j['@type'] === 'FAQPage');
    expect(faq?.mainEntity).toHaveLength(5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS (inspector 07/11/2026) — afirman lo correcto y hoy fallan
// ═══════════════════════════════════════════════════════════════════════════
test.describe('hallazgos abiertos', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('HALLAZGO 4175 (07/11/2026, REPARADO) [contenido/bajo] · promete 40 frutas y el array tiene 39', async ({
    page,
  }) => {    // El contador, que sale de `frutas.length`, ya dice 39: el texto del hero tiene que decir lo mismo.
    await expect(contador(page)).toHaveText(`Mostrando ${TOTAL} de ${TOTAL} frutas`);
    await expect(page.locator('header p').first()).toContainText(`${TOTAL} frutas`);
    // La meta description ya no lleva cifra: la que sale del array solo puede vivir en la página
    await expect(page.locator('meta[name="description"]')).not.toHaveAttribute('content', /\d+ frutas/);
    await expect(page.getByText(/40 frutas/)).toHaveCount(0);
  });

  test('HALLAZGO 4171 (07/11/2026, REPARADO) [operativa/medio] · sin tilde no encuentra: «rambutan», «maracuya», «peru»', async ({
    page,
  }) => {    // Las palabras clave de la propia metadata van sin tilde («rambutan», «maracuya»).
    await buscar(page, 'rambutan');
    await expect(fichas(page)).toHaveText(['Rambután']); // hoy: 0 fichas
    await buscar(page, 'maracuya');
    await expect(fichas(page)).toHaveText(['Maracuyá / Fruta de la pasión']); // hoy: 0
    await buscar(page, 'peru');
    await expect(fichas(page)).toHaveText(CON_PERU); // hoy: solo «Chirimoya peruana», por su nombre
  });

  test('HALLAZGO 4176 (07/11/2026, REPARADO) [operativa/bajo] · el sabor «Aromático» no devuelve nunca nada', async ({
    page,
  }) => {    // Ninguna de las 39 lleva sabor 'Aromático' (el yuzu, «extremadamente aromático», es 'Ácido').
    const opciones = (await page.getByLabel('Sabor').locator('option').allTextContents()).filter(
      (t) => t !== 'Todos',
    );
    for (const opcion of opciones) {
      await page.getByLabel('Sabor').selectOption(opcion);
      await expect(contador(page), `Sabor = ${opcion}`).not.toHaveText(`Mostrando 0 de ${TOTAL} frutas`);
    }
  });

  test('HALLAZGO 4172 (07/11/2026, REPARADO) [contenido/medio] · dos fichas por especie: Annona muricata y Garcinia mangostana', async ({
    page,
  }) => {    // La app llama Annona muricata a la Guanábana y Annona cherimola a la Cherimoya; la
    // «Chirimoya peruana» lleva el binomio de la guanábana con otro sabor (Cremoso frente a Dulce-ácido).
    await buscar(page, 'muricata');
    await expect(fichas(page)).toHaveCount(1); // hoy: Chirimoya peruana + Guanábana / Soursop
    // «Mangostino blanco» es Garcinia mangostana, la misma especie que el Mangostán.
    await buscar(page, 'mangostana');
    await expect(fichas(page)).toHaveCount(1); // hoy: Mangostán + Mangostino blanco
  });

  test('HALLAZGO 4173 (07/11/2026, REPARADO) [contenido/medio] · carambola y pomelo sin aviso de interacción con medicamentos', async ({
    page,
  }) => {    // Ficha técnica de Venclyxto (venetoclax) en CIMA-AEMPS, secciones 4.2 y 4.5: «Los productos
    // que contengan pomelo, las naranjas amargas y la carambola (fruta estrella)» se deben evitar
    // durante el tratamiento, porque contienen inhibidores del CYP3A.
    await expect(ficha(page, 'Carambola / Star fruit')).toContainText(/medicament/i);
    await expect(ficha(page, 'Pomelo / Pummelo')).toContainText(/medicament/i);
  });

  test('HALLAZGO 4174 (07/11/2026, REPARADO) [contenido/medio] · exenta de disclaimer y con los avisos de salud plegados', async ({
    page,
  }) => {    // Suite «salud» → nivel 2 (_private/DISCLAIMER-POLICY.md §3): DisclaimerCard severity="high",
    // no plegable. Hoy la página lleva `// @disclaimer: exempt` y no hay ninguno.
    const aviso = page.getByRole('note').filter({ hasText: /profesional sanitario/i });
    await expect(aviso).toBeVisible();
    // La alergia cruzada látex-fruta solo existía dentro de la guía educativa, que nace plegada;
    // ahora va también en el aviso, visible sin abrir nada (y con la carambola y los medicamentos).
    await expect(aviso.getByText(/síndrome látex-fruta/)).toBeVisible();
    await expect(aviso).toContainText('insuficiencia renal');
    await expect(aviso).toContainText('medicamentos');
    // No vive dentro de la guía educativa
    expect(await aviso.evaluate((el) => Boolean(el.closest('[class*="contentHidden"]')))).toBe(false);
  });

  test('HALLAZGO 4177 (07/11/2026, REPARADO) [contenido/bajo] · el jsonLd sale con featureList vacía', async ({
    page,
  }) => {    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const app = bloques.map((t) => JSON.parse(t)).find((j) => j['@type'] === 'WebApplication');
    expect((app?.featureList ?? []).length).toBeGreaterThanOrEqual(4); // hoy: []
  });

  test('HALLAZGO 4178 (07/11/2026, REPARADO) [contenido/bajo] · cifras populares sin fuente (§1.quinquies.1)', async ({
    page,
  }) => {    await expect(page.getByText(/6\.000 años/)).toHaveCount(0); // baobab
    await expect(page.getByText(/a 7 km de distancia/)).toHaveCount(0); // elefantes y marula
    await expect(page.getByText(/menos de 100 toneladas al año/)).toHaveCount(0); // mangostino blanco
    await expect(page.getByText('Calcio 2x leche', { exact: true })).toHaveCount(0); // baobab en polvo vs leche
  });

  test('HALLAZGO 4179 (07/11/2026, REPARADO) [contenido/bajo] · propiedades de salud sin respaldo: antiinflamatorio, anticancerígenas', async ({
    page,
  }) => {    await expect(ficha(page, 'Mangostán').getByText('Antiinflamatorio', { exact: true })).toHaveCount(0);
    await expect(ficha(page, 'Guanábana / Soursop')).not.toContainText('anticancerígenas');
  });

  test('HALLAZGO 4180 (07/11/2026, REPARADO) [contenido/bajo] · la tabla por región contradice la disponibilidad de las fichas', async ({
    page,
  }) => {    await abrirGuia(page);
    const tabla = page.getByRole('table');
    // Kiwano (África) es «Especialidades»; Lichi, Carambola y Pomelo (Sudeste Asiático) son «Común».
    await expect(tabla.getByRole('row').filter({ hasText: 'África' })).toContainText('Especialidades');
    await expect(tabla.getByRole('row').filter({ hasText: 'Sudeste Asiático' })).toContainText('Común');
  });

  test('HALLAZGO 4181 (07/11/2026, REPARADO) [accesibilidad/bajo] · el borde del buscador y de los desplegables da 1,04:1 con la tarjeta', async ({
    page,
  }) => {    // WCAG 1.4.11: el límite de un control necesita 3:1 contra lo que tiene al lado.
    const medir = (sel: string) =>
      page.locator(sel).evaluate((el) => {
        const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
        const lum = (c: number[]) =>
          c
            .map((v) => {
              const x = v / 255;
              return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
            })
            .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
        const borde = lum(rgb(getComputedStyle(el).borderTopColor));
        const tarjeta = lum(rgb(getComputedStyle(el.closest('section')!).backgroundColor));
        return (Math.max(borde, tarjeta) + 0.05) / (Math.min(borde, tarjeta) + 0.05);
      });
    // Recién cargada, sin foco en ningún control (con foco el borde pasa a --primary).
    expect(await medir(BUSCADOR)).toBeGreaterThanOrEqual(3); // hoy: 1,04
    expect(await medir('#region')).toBeGreaterThanOrEqual(3); // hoy: 1,04
  });

  test('HALLAZGO 4182 (07/11/2026, REPARADO) [contenido/bajo] · el FAQPage dice «El pitahaya (pitaya) roja»', async ({
    page,
  }) => {    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(bloques.join('\n')).not.toContain('El pitahaya');
  });
});
