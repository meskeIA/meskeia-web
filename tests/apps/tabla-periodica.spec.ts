import { test, expect, devices, Page } from '@playwright/test';

/**
 * Inspector — tabla-periodica (segmento interactiva, riesgo 3, 1.055 usos reales)
 *
 * Primera inspección: 21/08/2026. Es una de las apps más visitadas del catálogo, así que
 * cualquier dato o cálculo torcido llega a mucha gente.
 *
 * QUÉ PROMETE
 *   <h1>      «⚛️ Tabla Periódica Interactiva»
 *   subtítulo «Explora los 118 elementos químicos con información detallada y calculadora
 *              de masa molar»
 *   metadata  «Propiedades, masas molares y electronegatividad de cada elemento. Filtros
 *              por familia y estado.»
 *   jsonLd    features: visualización de los 118 · filtros por familia · filtros por estado
 *              físico · detalle al hacer clic · calculadora de masa molar · búsqueda por
 *              nombre, símbolo o número atómico
 *   Hay, por tanto, verdad comprobable: los DATOS de cada elemento y la SUMA de la calculadora.
 *
 * DÓNDE VIVE LA VERDAD
 *   app/tabla-periodica/elementos-data.ts   ← los 118 elementos (masa, grupo, período,
 *                                             familia, estado, electronegatividad, radio,
 *                                             configuración electrónica). Sin metadatos de
 *                                             fuente: el módulo no cita de dónde salen.
 *   app/tabla-periodica/page.tsx            ← getPosicion() (rejilla), filtro (useMemo),
 *                                             calcularMasaMolar() (parser de fórmulas)
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 — DATO. Tres elementos contrastados contra los valores estándar (masas atómicas
 *     IUPAC/CIAAW 2021, configuraciones del estado fundamental, electronegatividad Pauling):
 *
 *       Fe (26, Hierro) · 55,845 u · [Ar] 3d⁶ 4s² · χ 1,83 · grupo 8, período 4
 *       Au (79, Oro)    · 196,97 u · [Xe] 4f¹⁴ 5d¹⁰ 6s¹ · χ 2,54 · grupo 11, período 6
 *       Cu (29, Cobre)  · 63,546 u · [Ar] 3d¹⁰ 4s¹ · χ 1,90 · grupo 11, período 4
 *                         (Cu es una de las dos excepciones clásicas al Aufbau, junto con Cr:
 *                          3d¹⁰4s¹ y no 3d⁹4s², por la estabilidad del subnivel d lleno)
 *
 *     Y la calculadora, que no es más que sumar esas mismas masas:
 *       H2O      = 2 × 1,008 + 15,999                        = 18,015   g/mol
 *       C6H12O6  = 6 × 12,011 + 12 × 1,008 + 6 × 15,999       = 180,156  g/mol
 *       H2SO4    = 2 × 1,008 + 32,065 + 4 × 15,999            = 98,077   g/mol
 *       CaCO3    = 40,078 + 12,011 + 3 × 15,999               = 100,086  g/mol
 *
 *   CASO 2 — OPERATIVA. Los recuentos salen de contar el propio elementos-data.ts:
 *       familia «Halógenos»    → 6  (F, Cl, Br, I, At, Ts)
 *       familia «Gases Nobles» → 7  (He, Ne, Ar, Kr, Xe, Rn, Og)
 *       familia «Lantánidos»   → 15 (La…Lu, Z=57-71 son quince, no catorce)
 *       estado  «Líquido»      → 2  (Br y Hg, los dos únicos líquidos a 25 °C)
 *       estado  «Gas»          → 11 (H, He, N, O, F, Ne, Cl, Ar, Kr, Xe, Rn)
 *       búsqueda «79»          → 1  (Au; el buscador compara el número como texto)
 *       El contador «Mostrando N de 118» tiene que cuadrar con las celdas NO atenuadas.
 *
 *   CASO 3 — MÓVIL (devices['Pixel 7'], 412×839). La rejilla mide 900 px fijos
 *     (.tablaPeriodica { min-width: 900px }), así que la pregunta no es si cabe —no cabe—
 *     sino si el desbordamiento se queda DENTRO de .tablaContainer (overflow-x: auto) en
 *     lugar de empujar la página entera. Y si, tocando una celda, la ficha se abre y se lee.
 *
 * HALLAZGOS ABIERTOS: al final, marcados con `test.fail()` — afirman lo que debería pasar y
 * hoy fallan a propósito. El día que se reparen, quitar la línea `test.fail()` y quedan como
 * regresión.
 */

const RUTA = '/tabla-periodica/';

// Los nombres de clase de un CSS Module llevan un hash que cambia en cada build
// (TablaPeriodica-module__P-1TeG__elemento), así que se busca por el sufijo estable.
const CELDA = '[class*="__elemento"]';
const CELDA_ACTIVA = '[class*="__elemento"]:not([class*="__filtrado"])';
const CONTENEDOR_TABLA = '[class*="__tablaContainer"]';
const MODAL = '[class*="__modal"]:not([class*="Overlay"])';

/** Abre la ficha de un elemento por su atributo title («Hierro (Fe)») y devuelve su texto. */
async function fichaDe(page: Page, titulo: string): Promise<string> {
  await page.locator(`[title="${titulo}"]`).click();
  const modal = page.locator(MODAL).first();
  await expect(modal).toBeVisible();
  return (await modal.innerText()).replace(/\s+/g, ' ');
}

async function cerrarFicha(page: Page): Promise<void> {
  await page.locator('button:has-text("✕")').click();
  await expect(page.locator(MODAL)).toHaveCount(0);
}

/** Escribe una fórmula en la calculadora y devuelve la masa molar tal como se muestra. */
async function masaMolarDe(page: Page, formula: string): Promise<string> {
  await page.locator('input[placeholder^="Ej:"]').fill(formula);
  await page.getByRole('button', { name: 'Calcular' }).click();
  const total = page.locator('[class*="__masaTotal"]');
  await expect(total).toBeVisible();
  return (await total.innerText()).replace(/\s+/g, ' ');
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 — DATO: tres elementos y la suma de sus masas
// ═══════════════════════════════════════════════════════════════════════════
test.describe('CASO 1 · los datos de los elementos y la calculadora de masa molar', () => {
  test('la ficha de Fe, Au y Cu coincide con los valores estándar', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.locator(CELDA)).toHaveCount(118); // los 118 que promete el <h1>

    // Hierro. Masa atómica IUPAC/CIAAW 2021: 55,845(2) u.
    // Configuración del estado fundamental: [Ar] 3d⁶ 4s². Electronegatividad Pauling: 1,83.
    const hierro = await fichaDe(page, 'Hierro (Fe)');
    expect(hierro).toContain('Número atómico: 26');
    expect(hierro).toContain('Masa atómica: 55,845 u');
    expect(hierro).toContain('[Ar] 3d⁶ 4s²');
    expect(hierro).toContain('Electronegatividad: 1,83');
    expect(hierro).toContain('Grupo: 8');
    expect(hierro).toContain('Período: 4');
    await cerrarFicha(page);

    // Oro. Masa atómica IUPAC/CIAAW 2021: 196,966570(4) u → 196,97, que la ficha muestra
    // con tres decimales: «196,970 u». Configuración: [Xe] 4f¹⁴ 5d¹⁰ 6s¹ (excepción al
    // Aufbau, subnivel d lleno). Electronegatividad Pauling: 2,54, la mayor de un metal.
    const oro = await fichaDe(page, 'Oro (Au)');
    expect(oro).toContain('Número atómico: 79');
    expect(oro).toContain('Masa atómica: 196,970 u');
    expect(oro).toContain('[Xe] 4f¹⁴ 5d¹⁰ 6s¹');
    expect(oro).toContain('Electronegatividad: 2,54');
    await cerrarFicha(page);

    // Cobre. Masa atómica IUPAC/CIAAW 2021: 63,546(3) u.
    // Configuración: [Ar] 3d¹⁰ 4s¹ — la otra excepción clásica al Aufbau, junto con el cromo.
    const cobre = await fichaDe(page, 'Cobre (Cu)');
    expect(cobre).toContain('Número atómico: 29');
    expect(cobre).toContain('Masa atómica: 63,546 u');
    expect(cobre).toContain('[Ar] 3d¹⁰ 4s¹');
    expect(cobre).toContain('Electronegatividad: 1,90');
    await cerrarFicha(page);

    // Y el cromo, la excepción que la propia app menciona en su bloque educativo
    // («Cr([Ar]3d⁵4s¹) y Cu([Ar]3d¹⁰4s¹)»): la ficha tiene que decir lo mismo que el texto.
    const cromo = await fichaDe(page, 'Cromo (Cr)');
    expect(cromo).toContain('[Ar] 3d⁵ 4s¹');
    await cerrarFicha(page);
  });

  test('la masa molar de las cuatro fórmulas de ejemplo sale a mano igual', async ({ page }) => {
    await page.goto(RUTA);

    // H2O = 2 × 1,008 + 15,999 = 18,015 g/mol
    // (la app muestra 4 decimales y separador decimal español: «18,0150»)
    expect(await masaMolarDe(page, 'H2O')).toContain('18,0150 g/mol');

    // C6H12O6 = 6 × 12,011 + 12 × 1,008 + 6 × 15,999 = 72,066 + 12,096 + 95,994 = 180,156
    expect(await masaMolarDe(page, 'C6H12O6')).toContain('180,1560 g/mol');

    // H2SO4 = 2 × 1,008 + 32,065 + 4 × 15,999 = 2,016 + 32,065 + 63,996 = 98,077
    expect(await masaMolarDe(page, 'H2SO4')).toContain('98,0770 g/mol');

    // CaCO3 = 40,078 + 12,011 + 3 × 15,999 = 40,078 + 12,011 + 47,997 = 100,086
    expect(await masaMolarDe(page, 'CaCO3')).toContain('100,0860 g/mol');

    // El desglose tiene que enseñar la aritmética, no solo el total:
    // en H2SO4 el oxígeno pesa 4 × 15,999 = 63,996 g/mol.
    await masaMolarDe(page, 'H2SO4');
    const desglose = (await page.locator('[class*="__desgloseMasa"]').innerText()).replace(/\s+/g, ' ');
    expect(desglose).toContain('×4');
    expect(desglose).toContain('63,9960');

    // Un símbolo inventado se rechaza en vez de sumar cero.
    await page.locator('input[placeholder^="Ej:"]').fill('Xz2');
    await page.getByRole('button', { name: 'Calcular' }).click();
    await expect(page.locator('[class*="__errorMasa"]')).toContainText('no reconocido');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 — OPERATIVA: los filtros filtran de verdad y el recuento cuadra
// ═══════════════════════════════════════════════════════════════════════════
test.describe('CASO 2 · filtros, buscador y recuento', () => {
  test('cada filtro deja exactamente los elementos que le tocan', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByText('Mostrando 118 de 118 elementos')).toBeVisible();
    await expect(page.locator(CELDA_ACTIVA)).toHaveCount(118);

    // Halógenos: son 6 en el grupo 17 — F, Cl, Br, I, At y el sintético Ts (teneso, Z=117).
    await page.selectOption('#filtroFamilia', 'halogenos');
    await expect(page.getByText('Mostrando 6 de 118 elementos')).toBeVisible();
    await expect(page.locator(CELDA_ACTIVA)).toHaveCount(6);
    expect(
      await page.locator(CELDA_ACTIVA).evaluateAll((ns) => ns.map((n) => n.getAttribute('title'))),
    ).toEqual(['Flúor (F)', 'Cloro (Cl)', 'Bromo (Br)', 'Yodo (I)', 'Astato (At)', 'Teneso (Ts)']);
    // Y el hierro, que NO es halógeno, tiene que quedar atenuado.
    await expect(page.locator('[title="Hierro (Fe)"]')).toHaveClass(/__filtrado/);

    // Gases nobles: 7 — He, Ne, Ar, Kr, Xe, Rn y el sintético Og (oganesón, Z=118).
    await page.selectOption('#filtroFamilia', 'gases-nobles');
    await expect(page.getByText('Mostrando 7 de 118 elementos')).toBeVisible();
    await expect(page.locator(CELDA_ACTIVA)).toHaveCount(7);

    // Lantánidos: Z=57 a Z=71 son QUINCE elementos (La, Ce, Pr, Nd, Pm, Sm, Eu, Gd, Tb, Dy,
    // Ho, Er, Tm, Yb, Lu). El propio bloque educativo de la app dice «14»; el filtro, 15.
    await page.selectOption('#filtroFamilia', 'lantanidos');
    await expect(page.getByText('Mostrando 15 de 118 elementos')).toBeVisible();

    // Estado líquido: solo dos elementos son líquidos a temperatura ambiente,
    // el bromo (único no metal líquido) y el mercurio (único metal líquido).
    await page.selectOption('#filtroFamilia', 'todos');
    await page.selectOption('#filtroEstado', 'liquido');
    await expect(page.getByText('Mostrando 2 de 118 elementos')).toBeVisible();
    expect(
      await page.locator(CELDA_ACTIVA).evaluateAll((ns) => ns.map((n) => n.getAttribute('title'))),
    ).toEqual(['Bromo (Br)', 'Mercurio (Hg)']);

    // Estado gas: 11 — H, He, N, O, F, Ne, Cl, Ar, Kr, Xe, Rn.
    await page.selectOption('#filtroEstado', 'gas');
    await expect(page.getByText('Mostrando 11 de 118 elementos')).toBeVisible();
  });

  test('el buscador encuentra por nombre, por símbolo y por número atómico', async ({ page }) => {
    await page.goto(RUTA);

    // Por número atómico: «79» solo lo contiene el 79 (ningún otro Z de 1 a 118 lleva «79»
    // como subcadena), así que queda el oro y nada más.
    await page.fill('#busqueda', '79');
    await expect(page.getByText('Mostrando 1 de 118 elementos')).toBeVisible();
    expect(
      await page.locator(CELDA_ACTIVA).evaluateAll((ns) => ns.map((n) => n.getAttribute('title'))),
    ).toEqual(['Oro (Au)']);

    // Por símbolo exacto.
    await page.fill('#busqueda', 'Xe');
    await expect(page.getByText('Mostrando 1 de 118 elementos')).toBeVisible();
    expect(
      await page.locator(CELDA_ACTIVA).evaluateAll((ns) => ns.map((n) => n.getAttribute('title'))),
    ).toEqual(['Xenón (Xe)']);

    // Por nombre. La búsqueda es por subcadena, así que «oro» devuelve cuatro:
    // Boro, Fósforo, Cloro y Oro. No es un fallo, es lo que hace `includes()`.
    await page.fill('#busqueda', 'oro');
    await expect(page.getByText('Mostrando 4 de 118 elementos')).toBeVisible();

    // Filtro y búsqueda se combinan (AND): halógenos + «cl» = solo el cloro.
    await page.selectOption('#filtroFamilia', 'halogenos');
    await page.fill('#busqueda', 'cl');
    await expect(page.getByText('Mostrando 1 de 118 elementos')).toBeVisible();

    // Sin resultados: el contador tiene que decir 0, no quedarse en el número anterior.
    await page.selectOption('#filtroFamilia', 'todos');
    await page.fill('#busqueda', 'zzz');
    await expect(page.getByText('Mostrando 0 de 118 elementos')).toBeVisible();
    await expect(page.locator(CELDA_ACTIVA)).toHaveCount(0);

    // «Limpiar» devuelve los tres controles a su estado inicial.
    await page.selectOption('#filtroEstado', 'gas');
    await page.getByRole('button', { name: /Limpiar/ }).click();
    await expect(page.getByText('Mostrando 118 de 118 elementos')).toBeVisible();
    await expect(page.locator('#busqueda')).toHaveValue('');
    await expect(page.locator('#filtroFamilia')).toHaveValue('todos');
    await expect(page.locator('#filtroEstado')).toHaveValue('todos');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 — MÓVIL (Pixel 7): la tabla se usa, y el desbordamiento se queda dentro
// ═══════════════════════════════════════════════════════════════════════════
test.describe('CASO 3 · en móvil (Pixel 7)', () => {
  // Se enumeran las opciones en vez de esparcir `...devices['Pixel 7']` porque el device
  // trae `defaultBrowserType`, y Playwright no lo admite dentro de un describe.
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  test('la rejilla de 900 px desborda dentro de su contenedor, no de la página', async ({ page }) => {
    await page.goto(RUTA);
    expect(page.viewportSize()).toEqual({ width: 412, height: 839 }); // devices['Pixel 7']

    // La página NO puede tener scroll horizontal: es la regla de meskeIA para contenido ancho
    // (las tablas y rejillas scrollean dentro de su propio contenedor overflow-x: auto).
    const pagina = await page.evaluate(() => ({
      ancho: window.innerWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(pagina.scroll).toBeLessThanOrEqual(pagina.ancho + 1);

    // Y el contenedor de la tabla sí scrollea: 900 px de rejilla dentro de ~396 px de hueco.
    const contenedor = await page.locator(CONTENEDOR_TABLA).evaluate((el) => ({
      visible: el.clientWidth,
      contenido: el.scrollWidth,
      overflowX: getComputedStyle(el).overflowX,
    }));
    expect(contenedor.overflowX).toBe('auto');
    expect(contenedor.contenido).toBeGreaterThan(contenedor.visible);
    expect(contenedor.contenido).toBe(900); // .tablaPeriodica { min-width: 900px }
  });

  test('tocando una celda se abre la ficha, se lee entera y se cierra', async ({ page }) => {
    await page.goto(RUTA);

    const hierro = page.locator('[title="Hierro (Fe)"]');
    await hierro.scrollIntoViewIfNeeded();
    await hierro.click();

    const modal = page.locator(MODAL).first();
    await expect(modal).toBeVisible();

    // La ficha tiene que caber a lo ancho de los 412 px, no salirse.
    const caja = await modal.boundingBox();
    expect(caja).not.toBeNull();
    expect(caja!.width).toBeLessThanOrEqual(412);
    expect(caja!.x).toBeGreaterThanOrEqual(0);

    // Y tiene que ser LEGIBLE: los mismos valores verificados en el CASO 1.
    await expect(page.getByText('Masa atómica: 55,845 u')).toBeVisible();
    await expect(page.locator('code', { hasText: '[Ar] 3d⁶ 4s²' })).toBeVisible();
    const texto = (await modal.innerText()).replace(/\s+/g, ' ');
    expect(texto).toContain('Electronegatividad: 1,83');
    expect(texto).toContain('Radio atómico: 156 pm');
    expect(texto).toContain('Dato curioso');

    // El botón de cerrar es alcanzable con el dedo (24 px es el mínimo de WCAG 2.2 AA).
    const cerrar = page.locator('button:has-text("✕")');
    const cajaCerrar = await cerrar.boundingBox();
    expect(cajaCerrar!.width).toBeGreaterThanOrEqual(24);
    expect(cajaCerrar!.height).toBeGreaterThanOrEqual(24);
    await cerrar.click();
    await expect(page.locator(MODAL)).toHaveCount(0);

    // Los filtros siguen operando en móvil (el panel pasa a columna, no desaparece).
    await page.selectOption('#filtroFamilia', 'gases-nobles');
    await expect(page.getByText('Mostrando 7 de 118 elementos')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS — afirman lo correcto y hoy fallan a propósito (test.fail)
// ═══════════════════════════════════════════════════════════════════════════
test.describe('hallazgos abiertos', () => {
  test('HALLAZGO 1 · la calculadora ignora los paréntesis y devuelve un número falso', async ({ page }) => {
    test.fail(); // Reparado el día que esto pase en verde.
    await page.goto(RUTA);

    // Ca(OH)2, hidróxido de calcio — de las fórmulas más frecuentes en secundaria.
    // A mano: 40,078 + 2 × (15,999 + 1,008) = 40,078 + 34,014 = 74,092 g/mol.
    // El parser es /([A-Z][a-z]?)(\d*)/g: no entiende «(» ni «)», y el «2» que va DESPUÉS
    // del paréntesis no queda pegado a ningún símbolo, así que se pierde entero.
    // Resultado de hoy: Ca×1 + O×1 + H×1 = 57,085 g/mol — un 23 % por debajo, sin ningún aviso.
    expect(await masaMolarDe(page, 'Ca(OH)2')).toContain('74,0920 g/mol');

    // Mg(NO3)2 = 24,305 + 2 × (14,007 + 3 × 15,999) = 148,313 g/mol (hoy da 86,309).
    expect(await masaMolarDe(page, 'Mg(NO3)2')).toContain('148,3130 g/mol');

    // Al2(SO4)3 = 2 × 26,982 + 3 × (32,065 + 4 × 15,999) = 342,147 g/mol (hoy da 150,025).
    expect(await masaMolarDe(page, 'Al2(SO4)3')).toContain('342,1470 g/mol');
  });

  test('HALLAZGO 2 · ninguna de las 118 celdas se puede abrir con el teclado', async ({ page }) => {
    test.fail(); // Reparado el día que esto pase en verde.
    await page.goto(RUTA);

    // Las celdas son <div onClick> sin role, sin tabIndex y sin onKeyDown: quien no usa
    // ratón no llega a NINGUNA ficha, y la ficha es donde vive todo el detalle (configuración
    // electrónica, usos, dato curioso). WCAG 2.1.1 Teclado, nivel A.
    const focalizables = await page
      .locator(CELDA)
      .evaluateAll((ns) => ns.filter((n) => (n as HTMLElement).tabIndex >= 0 || ['BUTTON', 'A'].includes(n.tagName)).length);
    expect(focalizables).toBe(118);

    // Y una vez abierta, la ficha debería cerrarse con Escape y anunciarse como diálogo.
    await page.locator('[title="Hierro (Fe)"]').click();
    const modal = page.locator(MODAL).first();
    await expect(modal).toHaveAttribute('role', 'dialog');
    await page.keyboard.press('Escape');
    await expect(page.locator(MODAL)).toHaveCount(0);
  });

  test('HALLAZGO 3 · el bloque educativo se contradice con los datos de la propia app', async ({ page }) => {
    test.fail(); // Reparado el día que esto pase en verde.
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const cuerpo = page.locator('body');

    // (a) «Los 14 lantánidos (Z=57-71)» — de 57 a 71 hay QUINCE elementos, y el propio
    //     filtro «Lantánidos» de esta app muestra «Mostrando 15 de 118».
    await expect(cuerpo).not.toContainText('Los 14 lantánidos');

    // (b) «(misma configuración exterior 5d¹6s²)» — falso para la mayoría: solo La, Ce, Gd
    //     y Lu tienen 5d¹. La configuración general del bloque f es [Xe] 4fⁿ 6s², y la ficha
    //     del praseodimio de esta misma app muestra «[Xe] 4f³ 6s²», sin 5d.
    await expect(cuerpo).not.toContainText('misma configuración exterior 5d¹6s²');

    // (c) «El mayor radio es Cs (262 pm)» — la ficha de esta app da Cs = 298 pm, y el mayor
    //     radio de su propia tabla es el francio, 348 pm. Mezcla dos escalas de radio.
    await expect(cuerpo).not.toContainText('El mayor radio es Cs (262 pm)');

    // (d) «el cerio (Ce) sigue al bario (Ba) en el período 6» — al bario (56) le sigue el
    //     lantano (57); el cerio es el 58.
    await expect(cuerpo).not.toContainText('el cerio (Ce) sigue al bario (Ba)');
  });
});
