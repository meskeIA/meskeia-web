import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — visualizador-celula (segmento interactiva, riesgo 2, 46 usos reales)
 *
 * Primera inspección: 21/09/2026. La app promete en su <h1> «La Célula por Dentro» y en su
 * subtítulo «Animal vs Vegetal — orgánulos, funciones y datos fascinantes». La metadata repite
 * la promesa: «orgánulos clickables, comparativa visual y datos fascinantes». No hay ninguna
 * cifra que calcular, pero SÍ hay verdad comprobable, y de dos clases:
 *
 *   a) OPERATIVA — cada orgánulo es un <button> que abre un panel; el panel debe mostrar SIEMPRE
 *      la ficha del orgánulo pulsado y ninguna traza del anterior (estado que no se limpia).
 *   b) EXACTITUD DEL CONTENIDO — el reparto animal/vegetal lo fija la biología, no la app.
 *
 * DÓNDE VIVEN LOS DATOS
 *   app/visualizador-celula/page.tsx, todo dentro del propio componente: ORGANULOS_ANIMAL
 *   (líneas 54-125), ORGANULOS_VEGETAL (127-191) y COMPARATIVA (204-217). No hay módulo
 *   externo ni motor separado. Cada sección tiene su propio useState, así que cambiar de
 *   pestaña desmonta el componente y la selección nace limpia.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (escritorio — higiene del panel al cambiar de selección)
 *     Al cargar no hay orgánulo activo: 0 paneles. Pulsando «Núcleo» el panel debe traer su
 *     ficha: tamaño «~5-10 μm de diámetro» (un núcleo eucariota mide 5-10 μm, biología estándar)
 *     y el dato del ADN de 2 metros. Pulsando después «Mitocondria», el panel debe pasar a
 *     «~1-10 μm de largo» (rango estándar de la mitocondria) y NO puede quedar ni una palabra
 *     de la ficha del núcleo — es el fallo clásico de estado que no se limpia. Un segundo clic
 *     sobre el mismo orgánulo lo deselecciona (el onClick es un toggle) y el panel desaparece.
 *     Con teclado, Enter sobre «Ribosomas» debe abrir su ficha: «~20-30 nm» (el ribosoma
 *     eucariota 80S mide unos 25-30 nm, de ahí el rango).
 *
 *   CASO 2 (escritorio — reparto animal/vegetal, la verdad la pone la biología)
 *     Exclusivos de la célula VEGETAL: pared celular (celulosa), cloroplastos (fotosíntesis) y
 *     vacuola central. Exclusivos de la ANIMAL, por el convenio de secundaria: centriolos y
 *     lisosomas. Comunes a ambas: núcleo, mitocondrias, ribosomas, retículo endoplasmático,
 *     aparato de Golgi, membrana plasmática y citoplasma. Por tanto: el dibujo de la animal no
 *     puede ofrecer botón de pared/cloroplastos/vacuola, el de la vegetal no puede ofrecer
 *     centriolos/lisosomas, y la tabla comparativa debe marcar 7 filas ✅✅, 2 filas ✅❌
 *     (lisosomas, centriolos) y 3 filas ❌✅ (pared, cloroplastos, vacuola). Verificado: los
 *     tres bloques (dibujo animal, dibujo vegetal, tabla y Venn) coinciden con la biología.
 *
 *   CASO 3 (Pixel 7 — operativa táctil y alcance real de los botones)
 *     Con el dedo, en la célula vegetal: tocar «Cloroplastos» abre su ficha («~3-10 μm»), y
 *     tocar después «Vacuola central» debe sustituirla por la suya («Puede ocupar hasta el 90%
 *     del volumen celular») sin dejar rastro de la fotosíntesis. Los objetivos táctiles de los
 *     orgánulos etiquetados deben llegar al mínimo de 24×24 px CSS (WCAG 2.5.8 AA); el dibujo
 *     se capa a 320 px en móvil, así que el más pequeño (ribosomas, 8% × 8%) sale a 25,6 px y
 *     entra justo. En cambio «Pared celular» ocupa el 100% × 100% con z-index 0 y queda tapada
 *     por la vacuola (z-index 2) en todo su centro: predicho a mano y confirmado en navegador.
 *
 * Los tres casos se ejecutaron contra http://localhost:3050/visualizador-celula/ con Playwright
 * vía node_modules/playwright (no MCP) y coincidieron con la resolución a mano.
 */

const RUTA = '/visualizador-celula/';

/** Botón de un orgánulo del dibujo: su aria-label es «<nombre>: toca para ver función». */
function organulo(page: Page, nombre: string) {
  return page.getByRole('button', { name: `${nombre}: toca para ver función` });
}

/** Contenedor del panel de información (los hijos comparten prefijo de clase: el primero es él). */
function panelInfo(page: Page) {
  return page.locator('[class*="infoPanel"]').first();
}

/** Título del panel: existe 0 o 1 veces, así que sirve de contador de paneles abiertos. */
function tituloPanel(page: Page) {
  return page.locator('[class*="infoPanelTitulo"]');
}

async function abrirSeccion(page: Page, seccion: string) {
  await page.getByRole('button', { name: seccion }).click();
  await page.getByRole('heading', { level: 2, name: new RegExp(seccion) }).waitFor();
}

async function irAlVisualizador(page: Page) {
  // En `next dev` la primera carga compila la ruta: margen amplio, no es lentitud sospechosa.
  await page.goto(RUTA, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('La Célula por Dentro', {
    timeout: 60_000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CASO 1 — escritorio: el panel cambia entero al cambiar de orgánulo
// ─────────────────────────────────────────────────────────────────────────────

test('CASO 1: el panel muestra la ficha del orgánulo pulsado y borra la del anterior', async ({ page }) => {
  test.setTimeout(90_000);
  await irAlVisualizador(page);

  // Sin selección inicial: ningún panel abierto.
  await expect(tituloPanel(page)).toHaveCount(0);

  // Núcleo — ficha de ORGANULOS_ANIMAL[0]; 5-10 μm es el diámetro estándar del núcleo eucariota.
  await organulo(page, 'Núcleo').click();
  await expect(tituloPanel(page)).toHaveText('Núcleo');
  await expect(panelInfo(page)).toContainText('Centro de control');
  await expect(panelInfo(page)).toContainText('~5-10 μm de diámetro');
  await expect(panelInfo(page)).toContainText('2 metros'); // ADN estirado de una célula
  await expect(organulo(page, 'Núcleo')).toHaveAttribute('aria-pressed', 'true');
  await expect(organulo(page, 'Mitocondria')).toHaveAttribute('aria-pressed', 'false');

  // Mitocondria — 1-10 μm de largo es el rango estándar; la ficha del núcleo debe desaparecer.
  await organulo(page, 'Mitocondria').click();
  await expect(tituloPanel(page)).toHaveText('Mitocondria');
  await expect(panelInfo(page)).toContainText('~1-10 μm de largo');
  await expect(panelInfo(page)).toContainText('se hereda solo de la madre');
  await expect(panelInfo(page)).not.toContainText('~5-10 μm de diámetro');
  await expect(panelInfo(page)).not.toContainText('Centro de control');
  await expect(organulo(page, 'Núcleo')).toHaveAttribute('aria-pressed', 'false');

  // El onClick es un toggle: el segundo clic sobre el mismo orgánulo cierra el panel.
  await organulo(page, 'Mitocondria').click();
  await expect(tituloPanel(page)).toHaveCount(0);
  await expect(organulo(page, 'Mitocondria')).toHaveAttribute('aria-pressed', 'false');

  // Teclado: el ribosoma eucariota 80S mide ~25-30 nm, de ahí el «~20-30 nm» de la ficha.
  await organulo(page, 'Ribosomas').focus();
  await page.keyboard.press('Enter');
  await expect(tituloPanel(page)).toHaveText('Ribosomas');
  await expect(panelInfo(page)).toContainText('~20-30 nm');
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 2 — escritorio: el reparto animal/vegetal lo fija la biología
// ─────────────────────────────────────────────────────────────────────────────

/** Nombres de los orgánulos ofrecidos en el dibujo de la sección activa, en orden de DOM. */
async function inventarioDelDibujo(page: Page): Promise<string[]> {
  const botones = await page.getByRole('button', { name: /: toca para ver función$/ }).all();
  const nombres: string[] = [];
  for (const b of botones) {
    const etiqueta = (await b.getAttribute('aria-label')) ?? '';
    nombres.push(etiqueta.replace(': toca para ver función', ''));
  }
  return nombres;
}

test('CASO 2: exclusivos vegetales y animales repartidos según la biología', async ({ page }) => {
  test.setTimeout(90_000);
  await irAlVisualizador(page);

  // La sección inicial es «Célula Animal».
  const animal = await inventarioDelDibujo(page);
  expect(animal).toEqual([
    'Núcleo', 'Mitocondria', 'Ribosomas', 'RE Rugoso', 'RE Liso',
    'Aparato de Golgi', 'Lisosomas', 'Centriolos', 'Membrana plasmática', 'Citoplasma',
  ]);

  await abrirSeccion(page, 'Célula Vegetal');
  const vegetal = await inventarioDelDibujo(page);
  expect(vegetal).toEqual([
    'Pared celular', 'Núcleo', 'Cloroplastos', 'Vacuola central', 'Mitocondria',
    'Aparato de Golgi', 'Retículo Endoplasmático', 'Ribosomas', 'Membrana plasmática',
  ]);

  // Pared celular, cloroplastos y vacuola central son exclusivos de la célula VEGETAL.
  for (const exclusivoVegetal of ['Pared celular', 'Cloroplastos', 'Vacuola central']) {
    expect(vegetal).toContain(exclusivoVegetal);
    expect(animal).not.toContain(exclusivoVegetal);
  }
  // Centriolos y lisosomas se atribuyen a la ANIMAL en el convenio de secundaria.
  for (const exclusivoAnimal of ['Centriolos', 'Lisosomas']) {
    expect(animal).toContain(exclusivoAnimal);
    expect(vegetal).not.toContain(exclusivoAnimal);
  }
  // Orgánulos comunes a las dos.
  for (const comun of ['Núcleo', 'Mitocondria', 'Ribosomas', 'Aparato de Golgi', 'Membrana plasmática']) {
    expect(animal).toContain(comun);
    expect(vegetal).toContain(comun);
  }

  // Tabla comparativa: primera marca = animal, segunda = vegetal. Valores de biología estándar.
  await abrirSeccion(page, 'Comparativa');
  const filas = page.locator('[class*="comparativaRow"]');
  await expect(filas).toHaveCount(12);

  const esperado: Record<string, string> = {
    'Núcleo': '✅✅',
    'Mitocondrias': '✅✅',
    'Ribosomas': '✅✅',
    'Retículo Endoplasmático': '✅✅',
    'Aparato de Golgi': '✅✅',
    'Membrana plasmática': '✅✅',
    'Citoplasma': '✅✅',
    'Lisosomas': '✅❌',   // digestión celular: se atribuye a la animal
    'Centriolos': '✅❌',  // huso mitótico: ausentes en plantas superiores
    'Pared celular': '❌✅',    // celulosa
    'Cloroplastos': '❌✅',     // fotosíntesis
    'Vacuola central': '❌✅',  // turgencia
  };
  for (const [nombre, marcas] of Object.entries(esperado)) {
    const fila = filas.filter({ has: page.getByText(nombre, { exact: true }) }).first();
    const obtenido = (await fila.locator('[class*="comparativaCheck"]').allInnerTexts())
      .map(t => t.trim())
      .join('');
    expect(obtenido, `fila «${nombre}»`).toBe(marcas);
  }

  // Resumen visual (Venn): los tres exclusivos vegetales y los dos animales, literales.
  // Se lee con innerText porque los items van separados por <br>, que textContent se come.
  const venn = page.locator('[class*="vennItems"]');
  const soloAnimal = (await venn.nth(0).innerText()).split('\n').map(t => t.trim());
  expect(soloAnimal).toEqual(['Centriolos', 'Lisosomas']);
  const soloVegetal = (await venn.nth(2).innerText()).split('\n').map(t => t.trim());
  expect(soloVegetal).toEqual(['Pared celular', 'Cloroplastos', 'Vacuola central']);
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 3 — Pixel 7: operativa táctil y alcance real de los botones
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Móvil (Pixel 7)', () => {
  // Enumerado en vez de `...devices['Pixel 7']`: dentro de un describe no puede arrastrar
  // defaultBrowserType, que forzaría un worker nuevo.
  test.use({
    viewport: { width: 412, height: 839 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.34 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 3: el toque cambia de orgánulo y los objetivos táctiles llegan a 24 px', async ({ page }) => {
    test.setTimeout(90_000);
    await irAlVisualizador(page);
    await abrirSeccion(page, 'Célula Vegetal');
    await expect(tituloPanel(page)).toHaveCount(0);

    // Cloroplasto: 3-10 μm es su rango estándar; la fotosíntesis es su función definitoria.
    await organulo(page, 'Cloroplastos').tap();
    await expect(tituloPanel(page)).toHaveText('Cloroplastos');
    await expect(panelInfo(page)).toContainText('fotosíntesis');
    await expect(panelInfo(page)).toContainText('~3-10 μm');

    // Vacuola central: llega al 90% del volumen celular. No puede quedar nada del cloroplasto.
    await organulo(page, 'Vacuola central').tap();
    await expect(tituloPanel(page)).toHaveText('Vacuola central');
    await expect(panelInfo(page)).toContainText('Puede ocupar hasta el 90% del volumen celular');
    await expect(panelInfo(page)).not.toContainText('fotosíntesis');
    await expect(organulo(page, 'Cloroplastos')).toHaveAttribute('aria-pressed', 'false');

    // WCAG 2.5.8 (AA): 24×24 px CSS de mínimo. Con el dibujo capado a 320 px en móvil, el
    // orgánulo más pequeño (ribosomas, 8% de 320) sale a 25,6 px y entra por poco.
    for (const nombre of ['Cloroplastos', 'Vacuola central', 'Núcleo', 'Ribosomas', 'Mitocondria']) {
      const caja = await organulo(page, nombre).boundingBox();
      expect(caja, `caja de ${nombre}`).not.toBeNull();
      expect(caja!.width, `ancho táctil de ${nombre}`).toBeGreaterThanOrEqual(24);
      expect(caja!.height, `alto táctil de ${nombre}`).toBeGreaterThanOrEqual(24);
    }

    // HALLAZGO del Inspector (21/09/2026), documentado aquí para que se note al repararlo:
    // «Pared celular» es un botón del 100% × 100% con z-index 0, tapado en todo su centro por
    // la vacuola (z-index 2). Tocar el centro del botón selecciona la VACUOLA, no la pared.
    // Cuando se repare (p. ej. dándole un objetivo propio), este aserto pasará a rojo: hay que
    // invertirlo entonces, no relajarlo.
    // Se deja el cloroplasto seleccionado: si el activo fuese la vacuola, tocar su área la
    // deseleccionaría (toggle) y el panel se cerraría, escondiendo a quién pertenece el punto.
    await organulo(page, 'Cloroplastos').tap();
    await expect(tituloPanel(page)).toHaveText('Cloroplastos');

    const pared = organulo(page, 'Pared celular');
    await pared.scrollIntoViewIfNeeded();
    const cajaPared = await pared.boundingBox();
    await page.touchscreen.tap(cajaPared!.x + cajaPared!.width / 2, cajaPared!.y + cajaPared!.height / 2);
    await expect(tituloPanel(page)).toHaveText('Vacuola central');
    await expect(pared).toHaveAttribute('aria-pressed', 'false');

    // Su contenido sí está y sí es alcanzable con teclado: la pared es de celulosa.
    await pared.focus();
    await page.keyboard.press('Enter');
    await expect(tituloPanel(page)).toHaveText('Pared celular');
    await expect(panelInfo(page)).toContainText('celulosa');
  });
});
