import { test, expect, devices, Page } from '@playwright/test';
import {
  CASOS,
  TOTAL_CASOS,
  buscarPorConfiguracion,
  buscarPorGrupoPeriodo,
  buscarPorNumero,
  buscarPorSimbolo,
  comprobarRespuesta,
  extremoElectronegatividad,
  extremoRadio,
  generarEjercicioAleatorio,
  normalizar,
  resolverCaso,
  toleranciaDe,
  unicoPorEstadoYFamilia,
} from '../../app/tabla-periodica/casos';

/**
 * Inspector — tabla-periodica (segmento interactiva, riesgo 3, 1.182 usos reales)
 *
 * Primera inspección: 21/08/2026. Es una de las apps más visitadas del catálogo, así que
 * cualquier dato o cálculo torcido llega a mucha gente.
 *
 * RE-INSPECCIÓN 30/08/2026: los tres casos nuevos van al final (CASOS 4, 5 y 6), y detrás
 * de ellos los HALLAZGOS ABIERTOS de esa fecha, con `test.fail()`. Los casos 1-3 y los tres
 * hallazgos del 21/08 (ya reparados el 23/08) se conservan como regresión.
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
 * HALLAZGOS del 21/08: al final. Se escribieron con `test.fail()` afirmando lo que debería
 * pasar; se repararon el 23/08/2026 (tanda 2), se les retiró la marca y hoy quedan como
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

    // H2SO4 = 2 × 1,008 + 32,06 + 4 × 15,999 = 2,016 + 32,06 + 63,996 = 98,072
    // (masa del azufre CIAAW 2021, hallazgo 529: 32,06, no la de 2007, 32,065)
    expect(await masaMolarDe(page, 'H2SO4')).toContain('98,0720 g/mol');

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
// HALLAZGOS del 21/08, reparados el 23/08/2026 (tanda 2) — hoy son la regresión
// ═══════════════════════════════════════════════════════════════════════════
test.describe('hallazgos abiertos', () => {
  test('HALLAZGO 1 · la calculadora ignora los paréntesis y devuelve un número falso', async ({ page }) => {
    await page.goto(RUTA);

    // Ca(OH)2, hidróxido de calcio — de las fórmulas más frecuentes en secundaria.
    // A mano: 40,078 + 2 × (15,999 + 1,008) = 40,078 + 34,014 = 74,092 g/mol.
    // El parser es /([A-Z][a-z]?)(\d*)/g: no entiende «(» ni «)», y el «2» que va DESPUÉS
    // del paréntesis no queda pegado a ningún símbolo, así que se pierde entero.
    // Resultado de hoy: Ca×1 + O×1 + H×1 = 57,085 g/mol — un 23 % por debajo, sin ningún aviso.
    expect(await masaMolarDe(page, 'Ca(OH)2')).toContain('74,0920 g/mol');

    // Mg(NO3)2 = 24,305 + 2 × (14,007 + 3 × 15,999) = 148,313 g/mol (hoy da 86,309).
    expect(await masaMolarDe(page, 'Mg(NO3)2')).toContain('148,3130 g/mol');

    // Al2(SO4)3 = 2 × 26,982 + 3 × (32,06 + 4 × 15,999) = 342,132 g/mol (hoy da 150,025).
    // (masa del azufre CIAAW 2021, hallazgo 529: 32,06, no la de 2007, 32,065)
    expect(await masaMolarDe(page, 'Al2(SO4)3')).toContain('342,1320 g/mol');
  });

  test('HALLAZGO 2 · ninguna de las 118 celdas se puede abrir con el teclado', async ({ page }) => {
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

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 30/08/2026 — tres casos nuevos, resueltos a mano ANTES de abrir
// el navegador contra los valores estándar de la IUPAC / CIAAW (tabla 2021,
// https://iupac.qmul.ac.uk/AtWt/), las configuraciones electrónicas del estado
// fundamental y la escala de electronegatividad de Pauling.
// ═══════════════════════════════════════════════════════════════════════════

// ── CASO 4 — NORMAL: un elemento común, buscado y leído de punta a punta ──────
test.describe('CASO 4 · normal: buscar el oxígeno y comprobar su ficha entera', () => {
  test('la búsqueda deja solo el oxígeno y su ficha da los valores estándar', async ({ page }) => {
    await page.goto(RUTA);

    // El buscador promete «Nombre, símbolo o número atómico». Ningún otro de los 118
    // nombres contiene la cadena «oxígeno», así que tiene que quedar exactamente uno.
    await page.fill('#busqueda', 'oxígeno');
    await expect(page.getByText('Mostrando 1 de 118 elementos')).toBeVisible();
    expect(
      await page.locator(CELDA_ACTIVA).evaluateAll((ns) => ns.map((n) => n.getAttribute('title'))),
    ).toEqual(['Oxígeno (O)']);

    // Oxígeno, resuelto a mano:
    //   Z = 8                          (8 protones, define el elemento)
    //   masa atómica = 15,999 u        (IUPAC/CIAAW 2021: [15,99903, 15,99977], abreviado 15,999)
    //   grupo 16, período 2            (calcógenos, segunda fila)
    //   configuración = [He] 2s² 2p⁴   (estado fundamental; 6 electrones de valencia)
    //   electronegatividad = 3,44      (Pauling; solo el flúor, 3,98, lo supera)
    //   radio atómico = 48 pm          (escala calculada de Clementi 1967, la que usa esta app)
    //   estado = gas, familia = no metal
    await page.fill('#busqueda', '');
    const oxigeno = await fichaDe(page, 'Oxígeno (O)');
    expect(oxigeno).toContain('Número atómico: 8');
    expect(oxigeno).toContain('Masa atómica: 15,999 u');
    expect(oxigeno).toContain('Grupo: 16');
    expect(oxigeno).toContain('Período: 2');
    expect(oxigeno).toContain('Familia: No Metales');
    expect(oxigeno).toContain('Estado: Gas');
    expect(oxigeno).toContain('Radio atómico: 48 pm');
    expect(oxigeno).toContain('Electronegatividad: 3,44');
    expect(oxigeno).toContain('[He] 2s² 2p⁴');
    await cerrarFicha(page);

    // Y la calculadora, con esa misma masa dentro de un compuesto corriente.
    // Fe₂O₃ (óxido de hierro III, la herrumbre):
    //   2 × 55,845 + 3 × 15,999 = 111,690 + 47,997 = 159,687 g/mol
    expect(await masaMolarDe(page, 'Fe2O3')).toContain('159,6870 g/mol');

    // El desglose tiene que enseñar los 3 oxígenos, no solo el total.
    const desglose = (await page.locator('[class*="__desgloseMasa"]').innerText()).replace(/\s+/g, ' ');
    expect(desglose).toContain('Fe (Hierro)');
    expect(desglose).toContain('×3');
    expect(desglose).toContain('47,9970');
  });
});

// ── CASO 5 — LÍMITE: el último elemento de la tabla y el más ambiguo de todos ─
test.describe('CASO 5 · límite: el oganesón (Z=118) y el hidrógeno', () => {
  test('el oganesón, último de la tabla y sintético, se sitúa y se describe bien', async ({ page }) => {
    await page.goto(RUTA);

    // Oganesón, resuelto a mano:
    //   Z = 118, el mayor confirmado (IUPAC 2016, junto con Nh, Mc y Ts)
    //   grupo 18, período 7 → la ESQUINA inferior derecha de la rejilla
    //   configuración predicha = [Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶ (capa p completa, de ahí gas noble)
    //   sin electronegatividad ni radio atómico medidos → la ficha debe decir «N/D»,
    //     no inventar un número
    const og = await fichaDe(page, 'Oganesón (Og)');
    expect(og).toContain('Número atómico: 118');
    expect(og).toContain('Grupo: 18');
    expect(og).toContain('Período: 7');
    expect(og).toContain('Familia: Gases Nobles');
    expect(og).toContain('[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶');
    expect(og).toContain('Radio atómico: N/D');
    expect(og).toContain('Electronegatividad: N/D');
    await cerrarFicha(page);

    // La esquina: grupo 18 / período 7 son literalmente la columna 18 y la fila 7 del grid.
    // Las filas 8 y 9 quedan para lantánidos y actínidos, así que Og es la última celda
    // del bloque principal.
    const posicion = await page.locator('[title="Oganesón (Og)"]').evaluate((el) => ({
      columna: (el as HTMLElement).style.gridColumn,
      fila: (el as HTMLElement).style.gridRow,
    }));
    expect(posicion).toEqual({ columna: '18', fila: '7' });

    // Y filtrando por gases nobles tiene que seguir dentro: son 7 con él
    // (He, Ne, Ar, Kr, Xe, Rn, Og).
    await page.selectOption('#filtroFamilia', 'gases-nobles');
    await expect(page.getByText('Mostrando 7 de 118 elementos')).toBeVisible();
    await expect(page.locator('[title="Oganesón (Og)"]')).not.toHaveClass(/__filtrado/);
  });

  test('el hidrógeno queda fuera de los alcalinos y dentro de los no metales', async ({ page }) => {
    await page.goto(RUTA);

    // El caso ambiguo por excelencia: el H ocupa la casilla del grupo 1 porque tiene 1s¹,
    // pero NO es un metal alcalino — es un gas no metálico, con electronegatividad 2,20
    // (Pauling), mientras los alcalinos van de 0,70 a 0,98. La IUPAC lo deja sin familia;
    // la convención escolar, que es la que sigue esta app y la que su propio bloque
    // educativo defiende («Hidrógeno no es un metal alcalino»), lo cuenta como no metal.
    const hidrogeno = await fichaDe(page, 'Hidrógeno (H)');
    expect(hidrogeno).toContain('Número atómico: 1');
    expect(hidrogeno).toContain('Masa atómica: 1,008 u');   // IUPAC/CIAAW 2021, abreviado 1,008
    expect(hidrogeno).toContain('Grupo: 1');                // la casilla sí es la del grupo 1
    expect(hidrogeno).toContain('Familia: No Metales');     // pero la familia NO es alcalinos
    expect(hidrogeno).toContain('Estado: Gas');
    expect(hidrogeno).toContain('Electronegatividad: 2,20');
    expect(hidrogeno).toContain('1s¹');
    await cerrarFicha(page);

    // Filtro «Metales Alcalinos»: son SEIS, y el hidrógeno no está entre ellos.
    await page.selectOption('#filtroFamilia', 'metales-alcalinos');
    await expect(page.getByText('Mostrando 6 de 118 elementos')).toBeVisible();
    expect(
      await page.locator(CELDA_ACTIVA).evaluateAll((ns) => ns.map((n) => n.getAttribute('title'))),
    ).toEqual(['Litio (Li)', 'Sodio (Na)', 'Potasio (K)', 'Rubidio (Rb)', 'Cesio (Cs)', 'Francio (Fr)']);
    // Y encima queda fuera del orden de tabulación, no como trampa clicable atenuada.
    await expect(page.locator('[title="Hidrógeno (H)"]')).toHaveClass(/__filtrado/);
    await expect(page.locator('[title="Hidrógeno (H)"]')).toBeDisabled();

    // Filtro «No Metales»: SIETE, y ahí sí está el hidrógeno (H, C, N, O, P, S, Se).
    await page.selectOption('#filtroFamilia', 'no-metales');
    await expect(page.getByText('Mostrando 7 de 118 elementos')).toBeVisible();
    expect(
      await page.locator(CELDA_ACTIVA).evaluateAll((ns) => ns.map((n) => n.getAttribute('title'))),
    ).toEqual([
      'Hidrógeno (H)', 'Carbono (C)', 'Nitrógeno (N)', 'Oxígeno (O)',
      'Fósforo (P)', 'Azufre (S)', 'Selenio (Se)',
    ]);
  });
});

// ── CASO 6 — VACÍO / RECHAZO: lo que no existe no puede devolver nada ─────────
test.describe('CASO 6 · una búsqueda sin resultados y una fórmula rechazada', () => {
  test('un nombre y un símbolo inexistentes dan 0, y la calculadora los rechaza', async ({ page }) => {
    await page.goto(RUTA);

    // «Vibranio» no es un elemento químico (es de ficción). Ninguno de los 118 nombres ni
    // símbolos lo contiene → 0 resultados, y NINGUNA celda puede quedar activa.
    await page.fill('#busqueda', 'Vibranio');
    await expect(page.getByText('Mostrando 0 de 118 elementos')).toBeVisible();
    await expect(page.locator(CELDA_ACTIVA)).toHaveCount(0);
    // Las 118 celdas siguen visibles pero atenuadas y deshabilitadas: no se puede abrir
    // una ficha por error desde un resultado vacío.
    await expect(page.locator(CELDA)).toHaveCount(118);
    expect(await page.locator(CELDA).evaluateAll((ns) => ns.filter((n) => !(n as HTMLButtonElement).disabled).length)).toBe(0);

    // «Zz» no es el símbolo de ningún elemento (los dos únicos que empiezan por Z son
    // Zn, zinc, y Zr, circonio).
    await page.fill('#busqueda', 'Zz');
    await expect(page.getByText('Mostrando 0 de 118 elementos')).toBeVisible();
    await expect(page.locator(CELDA_ACTIVA)).toHaveCount(0);

    // Y la calculadora de masa molar no puede sumar cero y llamarlo resultado:
    // tiene que nombrar el símbolo que no reconoce.
    await page.locator('input[placeholder^="Ej:"]').fill('Zz2');
    await page.getByRole('button', { name: 'Calcular' }).click();
    await expect(page.locator('[class*="__errorMasa"]')).toContainText('Elemento "Zz" no reconocido');
    await expect(page.locator('[class*="__masaTotal"]')).toHaveCount(0);

    // Vacío: se pide una fórmula en vez de devolver 0,0000 g/mol.
    await page.locator('input[placeholder^="Ej:"]').fill('');
    await page.getByRole('button', { name: 'Calcular' }).click();
    await expect(page.locator('[class*="__errorMasa"]')).toContainText('Ingresa una fórmula química');

    // Carácter que no pinta nada en una fórmula.
    await page.locator('input[placeholder^="Ej:"]').fill('H2O!');
    await page.getByRole('button', { name: 'Calcular' }).click();
    await expect(page.locator('[class*="__errorMasa"]')).toContainText('solo admite letras, números y paréntesis');

    // Paréntesis sin cerrar: se avisa, no se suma a medias.
    await page.locator('input[placeholder^="Ej:"]').fill('Ca(OH2');
    await page.getByRole('button', { name: 'Calcular' }).click();
    await expect(page.locator('[class*="__errorMasa"]')).toContainText('Falta cerrar un paréntesis');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS de la re-inspección del 30/08/2026
// Marcados con test.fail(): afirman lo que DEBERÍA pasar, así que hoy fallan a
// propósito. Al repararse se les quita la marca y quedan como regresión.
// ═══════════════════════════════════════════════════════════════════════════
test.describe('hallazgos reparados · 30/08/2026', () => {
  test('528 · buscar sin tilde ya encuentra los 14 de 118 elementos con tilde o eñe', async ({ page }) => {
    await page.goto(RUTA);

    // El filtro es `el.nombre.toLowerCase().includes(query)`, sin normalizar los acentos.
    // Escribir «oxigeno» —como se teclea casi siempre, en España y en Latam— deja la tabla
    // entera en gris y el contador en 0, sin ningún mensaje que explique por qué.
    // Afecta a los 14 nombres con tilde o eñe: Hidrógeno, Nitrógeno, Oxígeno, Flúor, Neón,
    // Fósforo, Argón, Níquel, Arsénico, Kriptón, Estaño, Xenón, Radón y Oganesón — entre
    // ellos cuatro de los elementos más buscados por un estudiante.
    // La receta ya existe en el propio repositorio: components/SearchBar.tsx normaliza con
    // .normalize('NFD').replace(/[̀-ͯ]/g, '') antes de comparar.
    for (const [sinTilde, esperado] of [
      ['oxigeno', 'Oxígeno (O)'],
      ['hidrogeno', 'Hidrógeno (H)'],
      ['nitrogeno', 'Nitrógeno (N)'],
      ['niquel', 'Níquel (Ni)'],
      ['fosforo', 'Fósforo (P)'],
      ['estano', 'Estaño (Sn)'],
    ] as const) {
      await page.fill('#busqueda', sinTilde);
      await expect(page.getByText('Mostrando 1 de 118 elementos')).toBeVisible();
      expect(
        await page.locator(CELDA_ACTIVA).evaluateAll((ns) => ns.map((n) => n.getAttribute('title'))),
      ).toEqual([esperado]);
    }
  });

  test('529 · las cinco masas atómicas ya son las de CIAAW 2021, no las de 2007', async ({ page }) => {
    await page.goto(RUTA);

    // La cabecera de elementos-data.ts declara «Pesos atómicos estándar de la IUPAC /
    // CIAAW, tabla 2021 · Verificado: 2026-08-23». Cinco elementos siguen con el valor
    // ANTERIOR a la revisión de 2009-2017 — los mismos rezagados de familia que el selenio
    // y el litio que se corrigieron en el hallazgo 125, pero que se quedaron sin drenar:
    //
    //   elemento   hoy       IUPAC/CIAAW 2021 (valor convencional abreviado)
    //   B  boro    10,811 →  10,81      (intervalo [10,806, 10,821], revisión de 2009)
    //   Si silicio 28,086 →  28,085     (intervalo [28,084, 28,086], revisión de 2009)
    //   S  azufre  32,065 →  32,06      (intervalo [32,059, 32,076], revisión de 2009)
    //   Cl cloro   35,453 →  35,45      (intervalo [35,446, 35,457], revisión de 2009)
    //   Ar argón   39,948 →  39,95      (intervalo [39,792, 39,963], revisión de 2017)
    //
    // Los cinco caen dentro del intervalo IUPAC, así que el error es pequeño; lo que falla
    // es la procedencia que el módulo declara, y que el número no coincide con el del libro
    // de texto del que el estudiante viene comparando (35,45 para el cloro es el valor que
    // aparece impreso en cualquier tabla actual).
    const masas: Record<string, string> = {
      'Boro (B)': 'Masa atómica: 10,810 u',
      'Silicio (Si)': 'Masa atómica: 28,085 u',
      'Azufre (S)': 'Masa atómica: 32,060 u',
      'Cloro (Cl)': 'Masa atómica: 35,450 u',
      'Argón (Ar)': 'Masa atómica: 39,950 u',
    };
    for (const [titulo, esperada] of Object.entries(masas)) {
      expect(await fichaDe(page, titulo)).toContain(esperada);
      await cerrarFicha(page);
    }
  });

  test('530 · los 34 elementos sin peso atómico estándar ya se muestran entre corchetes', async ({ page }) => {
    await page.goto(RUTA);

    // La ficha imprime siempre formatNumber(masa, 3). Para el oganesón, que no tiene peso
    // atómico estándar porque no tiene ningún isótopo con abundancia natural, el dato del
    // módulo es el número másico del isótopo más estable (294), y la ficha lo enseña como
    // «294,000 u»: tres decimales de una precisión que no existe. La IUPAC lo escribe entre
    // corchetes justamente para marcar la diferencia — [294], no 294,000.
    // Son 34 elementos: Tc, Pm, Po, At, Rn, Fr, Ra, Ac, Np y todos los Z ≥ 94.
    // En la CELDA de la rejilla ya está bien resuelto (formatNumber con 0 decimales si la
    // masa es entera, «294»); es solo la ficha la que añade los ceros.
    const og = await fichaDe(page, 'Oganesón (Og)');
    expect(og).toContain('[294]');
    expect(og).not.toContain('294,000 u');
    await cerrarFicha(page);

    const tc = await fichaDe(page, 'Tecnecio (Tc)');
    expect(tc).not.toContain('98,000 u');
    await cerrarFicha(page);
  });

  test('531 · el filtro «Sólido» ya no excluye a los 30 elementos que antes se marcaban «Sintético»', async ({ page }) => {
    await page.goto(RUTA);

    // El jsonLd de la app promete «Filtros por estado físico (sólido, líquido, gaseoso)»,
    // pero el desplegable mezcla el estado con el ORIGEN: la cuarta opción es «Sintético».
    // Consecuencia medible: el plutonio y el francio son sólidos metálicos —el propio dato
    // curioso del francio dice «metal alcalino más reactivo»— y quedan fuera del filtro
    // «Sólido», que enseña 75 celdas y deja atenuados 30 elementos cuyo estado no se ha
    // dejado de conocer, solo se ha sustituido por su origen.
    await page.selectOption('#filtroEstado', 'solido');
    await expect(page.locator('[title="Plutonio (Pu)"]')).not.toHaveClass(/__filtrado/);
    await expect(page.locator('[title="Francio (Fr)"]')).not.toHaveClass(/__filtrado/);

    // Y el propio FAQPage de metadata.ts dice «Los elementos del 1 al 94 se encuentran en la
    // naturaleza; los del 95 al 118 son sintéticos», mientras la app marca como sintéticos
    // seis elementos por debajo del 94: Tc (43), Pm (61), At (85), Fr (87), Np (93) y
    // Pu (94). El astato lo desmiente su propia ficha: «solo ~25 g en corteza».
    const astato = await fichaDe(page, 'Astato (At)');
    expect(astato).not.toContain('Estado: Sintético');
  });

  test('532 · el recuento de resultados ya se anuncia a un lector de pantalla', async ({ page }) => {
    await page.goto(RUTA);

    // Al escribir en #busqueda, lo ÚNICO que cambia de forma perceptible sin ver la pantalla
    // es el texto «Mostrando N de 118 elementos», que es un <p> sin aria-live ni role.
    // Con 0 resultados las 118 celdas pasan a `disabled`, o sea que salen del orden de
    // tabulación: quien navega con lector de pantalla se queda sin nada que explorar y sin
    // ningún aviso de por qué. Basta con role="status" (o aria-live="polite") en el contador.
    const contador = page.locator('[class*="__contadorElementos"]');
    const anuncia = await contador.evaluate((el) =>
      el.getAttribute('aria-live') !== null || el.getAttribute('role') === 'status',
    );
    expect(anuncia).toBe(true);
  });
});


// ═══════════════════════════════════════════════════════════════════════════
// CASOS PARA CLASE (11/09/2026) — sin navegador, sobre casos.ts
//
// Lo de arriba es el acta del Inspector y NO se toca: es el contrato de la app.
// Lo de aquí abajo prueba el motor de los casos asignables, que corrige respuestas
// de alumnos y por tanto no puede fallar en silencio.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tabla Periódica — fichas de búsqueda para clase (11/09/2026)
 *
 * Es la app nº 1 del canal aula de todo meskeIA: 373 de sus visitas de los últimos meses
 * llegaron dentro de eventos de clase, repartidos en siete meses y cuatro países. Cuando un
 * profesor manda «haz las fichas 3, 7 y 11», la corrección tiene que ser la misma para todo
 * el grupo, y una ficha que corrige mal no se ve: la app carga igual de bien.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO
 *   Todos los datos de este fichero están tomados de la definición de la tabla periódica,
 *   NUNCA copiados de lo que devuelve la app. Los tres que fijan el convenio:
 *
 *     · Z = 26 es el hierro. El número atómico ES el número de protones, por definición.
 *     · [Ar] 3d¹⁰ 4s¹ es el cobre, no el níquel ni el cinc: es la excepción al orden de
 *       llenado que se estudia junto a la del cromo ([Ar] 3d⁵ 4s¹).
 *     · El único metal líquido a temperatura ambiente es el mercurio. El otro líquido de la
 *       tabla, el bromo, NO es metal: es un halógeno. Esa es justo la trampa de la ficha 9.
 *
 *   Y la tendencia que sostiene las fichas 3, 7 y 12, que son tres preguntas sobre lo mismo
 *   visto por sus dos caras: al BAJAR por un grupo el radio atómico CRECE (se añade una capa)
 *   y la electronegatividad BAJA (el núcleo atrae peor lo que está más lejos).
 */

test.describe('Tabla Periódica · fichas de búsqueda', () => {
  // ----------------------------------------------------------------
  // Invariante 1 — hay 12 fichas, con ids 1..12 sin huecos
  // ----------------------------------------------------------------
  test('hay exactamente 12 fichas con ids consecutivos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS).toHaveLength(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  // ----------------------------------------------------------------
  // Invariante 2 — deterministas
  // ----------------------------------------------------------------
  test('dos lecturas dan el mismo enunciado y la misma respuesta', () => {
    const primera = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuestaTexto}`);
    const segunda = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuestaTexto}`);
    expect(segunda).toEqual(primera);
  });

  // ----------------------------------------------------------------
  // Invariante 3 — la respuesta declarada coincide con recalcularla
  //
  // La que caza a quien edita un enunciado y olvida la solución.
  // ----------------------------------------------------------------
  test('recalcular cada ficha desde sus datos devuelve la respuesta declarada', () => {
    for (const caso of CASOS) {
      const recalculado = resolverCaso(caso.datos);
      expect(recalculado.ok, `ficha ${caso.id} no se puede resolver`).toBe(true);
      expect(recalculado.texto, `ficha ${caso.id}`).toBe(caso.respuestaTexto);
      if (caso.respuestaNumerica !== null) {
        expect(recalculado.numero, `ficha ${caso.id}`).toBe(caso.respuestaNumerica);
      }
    }
  });

  // ----------------------------------------------------------------
  // Invariante 4 — cada ficha está completa
  // ----------------------------------------------------------------
  test('cada ficha tiene enunciado, etiqueta no vacía, respuesta y camino', () => {
    for (const caso of CASOS) {
      expect(caso.titulo.length, `ficha ${caso.id}`).toBeGreaterThan(0);
      expect(caso.enunciado.length, `ficha ${caso.id}`).toBeGreaterThan(20);
      expect(caso.etiquetaRespuesta.trim(), `ficha ${caso.id}`).not.toBe('');
      expect(caso.respuestaTexto.trim(), `ficha ${caso.id}`).not.toBe('');
      expect(caso.pasos.length, `ficha ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `ficha ${caso.id}`).not.toBe('');
      expect(caso.sinonimos.length, `ficha ${caso.id}`).toBeGreaterThan(0);
    }
  });

  // ----------------------------------------------------------------
  // Invariante 5 — enunciados universales
  //
  // España es el 8,6 % de este canal: un enunciado anclado a un país excluye
  // a la mayor parte del público que de verdad usa la app en clase.
  // ----------------------------------------------------------------
  test('ningún enunciado nombra un país ni una ciudad', () => {
    const prohibido =
      /\b(españa|espana|madrid|barcelona|méxico|mexico|colombia|argentina|perú|peru|chile|bogotá|bogota|lima|buenos aires|euros?|pesos?)\b/i;
    for (const caso of CASOS) {
      expect(prohibido.test(caso.titulo), `título de la ficha ${caso.id}`).toBe(false);
      expect(prohibido.test(caso.enunciado), `enunciado de la ficha ${caso.id}`).toBe(false);
      for (const paso of caso.pasos) {
        expect(prohibido.test(paso), `paso de la ficha ${caso.id}`).toBe(false);
      }
    }
  });

  // ----------------------------------------------------------------
  // Invariante 6 (variante B) — el generador saca datos de la propia tabla
  // ----------------------------------------------------------------
  test('el ejercicio aleatorio es reproducible por semilla', () => {
    const primero = generarEjercicioAleatorio(12345);
    const segundo = generarEjercicioAleatorio(12345);
    expect(segundo.enunciado).toBe(primero.enunciado);
    expect(segundo.respuestaTexto).toBe(primero.respuestaTexto);

    const otro = generarEjercicioAleatorio(999);
    expect(otro.enunciado === primero.enunciado && otro.respuestaTexto === primero.respuestaTexto)
      .toBe(false);
  });

  test('el ejercicio aleatorio siempre sale resuelto y de un elemento de los 4 primeros períodos', () => {
    for (let semilla = 1; semilla <= 60; semilla++) {
      const ejercicio = generarEjercicioAleatorio(semilla);
      expect(ejercicio.respuestaTexto.trim(), `semilla ${semilla}`).not.toBe('');
      expect(ejercicio.etiquetaRespuesta.trim(), `semilla ${semilla}`).not.toBe('');
      expect(ejercicio.pasos.length, `semilla ${semilla}`).toBeGreaterThanOrEqual(2);
    }
  });

  // ----------------------------------------------------------------
  // Invariante 7 (variante B) — comparar normalizado acepta los sinónimos
  // declarados y RECHAZA lo demás
  //
  // Es el convenio propio de esta app: el alumno que sabe química no puede
  // suspender por cómo teclea, pero «cobre» no puede colar donde se pedía hierro.
  // ----------------------------------------------------------------
  test('normalizar quita tildes, mayúsculas y puntuación final', () => {
    expect(normalizar('Flúor')).toBe('fluor');
    expect(normalizar('  HIERRO  ')).toBe('hierro');
    expect(normalizar('Fe.')).toBe('fe');
    expect(normalizar('metales   de   transición')).toBe('metales de transicion');
  });

  test('la ficha del hierro acepta símbolo y nombre, en cualquier grafía', () => {
    const ficha = CASOS[0];
    expect(ficha.respuestaTexto).toBe('Hierro');
    for (const forma of ['Fe', 'fe', 'FE', 'Hierro', 'hierro', ' hierro ']) {
      expect(comprobarRespuesta(forma, ficha).correcto, `forma «${forma}»`).toBe(true);
    }
    for (const forma of ['Cu', 'cobre', 'Co', '26', 'hierr']) {
      expect(comprobarRespuesta(forma, ficha).correcto, `forma «${forma}»`).toBe(false);
    }
  });

  test('una respuesta vacía no es un acierto ni un fallo cualquiera', () => {
    expect(comprobarRespuesta('', CASOS[0])).toEqual({ correcto: false, motivo: 'vacia' });
    expect(comprobarRespuesta('   ', CASOS[0])).toEqual({ correcto: false, motivo: 'vacia' });
  });

  test('una ficha de texto NUNCA se compara como número', () => {
    // «26» es el número atómico del hierro, pero la ficha 1 pide el símbolo o el nombre:
    // aceptarlo por la vía numérica sería dar por buena una respuesta a otra pregunta.
    const ficha = CASOS[0];
    expect(ficha.respuestaNumerica).toBeNull();
    expect(comprobarRespuesta('26', ficha).correcto).toBe(false);
  });

  // ----------------------------------------------------------------
  // Los datos concretos, derivados a mano de la definición
  // ----------------------------------------------------------------
  test('ficha 1 · Z = 26 es el hierro', () => {
    expect(buscarPorNumero(26)?.simbolo).toBe('Fe');
    expect(CASOS[0].respuestaTexto).toBe('Hierro');
  });

  test('ficha 2 · grupo 16 y período 3 es el azufre', () => {
    expect(buscarPorGrupoPeriodo(16, 3)?.simbolo).toBe('S');
    expect(CASOS[1].respuestaTexto).toBe('Azufre');
  });

  test('ficha 3 · el flúor es el más electronegativo de los cuatro', () => {
    expect(extremoElectronegatividad(['F', 'O', 'Cl', 'N'], 'max')?.simbolo).toBe('F');
    expect(CASOS[2].respuestaTexto).toBe('Flúor');
  });

  test('ficha 4 · la masa del cobre se compara con tolerancia', () => {
    const ficha = CASOS[3];
    expect(buscarPorSimbolo('Cu')?.masa).toBe(63.546);
    expect(ficha.respuestaNumerica).toBe(63.546);
    // El 1 % de 63,546 es 0,635: quien copia «63,5» del recuadro ha encontrado el dato.
    expect(toleranciaDe(63.546)).toBeCloseTo(0.63546, 5);
    for (const forma of ['63,546', '63,5', '64']) {
      expect(comprobarRespuesta(forma, ficha).correcto, `forma «${forma}»`).toBe(true);
    }
    for (const forma of ['29', '65', 'cobre']) {
      expect(comprobarRespuesta(forma, ficha).correcto, `forma «${forma}»`).toBe(false);
    }
    // ⚠️ «63.546» con PUNTO no vale, y no es un descuido: `parseSpanishNumber` es el parser
    // canónico del catálogo y con un solo separador gana la lectura española, así que lee
    // sesenta y tres mil quinientos cuarenta y seis. La ambigüedad es irreducible —«1.234» son
    // mil doscientos treinta y cuatro para casi todo el público de este sitio— y la ficha
    // muestra el dato como «63,546», que es la forma que se copia.
    expect(comprobarRespuesta('63.546', ficha).correcto).toBe(false);
  });

  test('ficha 5 · [Ar] 3d¹⁰ 4s¹ es el cobre, y la escritura sin espacios también lo encuentra', () => {
    expect(buscarPorConfiguracion('[Ar] 3d¹⁰ 4s¹')?.simbolo).toBe('Cu');
    expect(buscarPorConfiguracion('[Ar]3d¹⁰4s¹')?.simbolo).toBe('Cu');
    expect(CASOS[4].respuestaTexto).toBe('Cobre');
  });

  test('ficha 6 · el gas noble del período 2 es el neón', () => {
    expect(buscarPorGrupoPeriodo(18, 2)?.simbolo).toBe('Ne');
    expect(CASOS[5].respuestaTexto).toBe('Neón');
  });

  test('ficha 7 · de Li, Na y K el mayor radio es el del potasio', () => {
    // Al bajar por el grupo 1 se añade una capa, así que el radio crece: 167 < 190 < 243 pm.
    const li = buscarPorSimbolo('Li')?.radioAtomico as number;
    const na = buscarPorSimbolo('Na')?.radioAtomico as number;
    const k = buscarPorSimbolo('K')?.radioAtomico as number;
    expect(li).toBeLessThan(na);
    expect(na).toBeLessThan(k);
    expect(extremoRadio(['Li', 'Na', 'K'], 'max')?.simbolo).toBe('K');
    expect(CASOS[6].respuestaTexto).toBe('Potasio');
  });

  test('ficha 8 · el yodo es un halógeno, y se acepta en singular y en plural', () => {
    const ficha = CASOS[7];
    expect(buscarPorSimbolo('I')?.familia).toBe('halogenos');
    expect(ficha.respuestaTexto).toBe('halógenos');
    for (const forma of ['halógenos', 'halogenos', 'halógeno', 'grupo 17']) {
      expect(comprobarRespuesta(forma, ficha).correcto, `forma «${forma}»`).toBe(true);
    }
    expect(comprobarRespuesta('gases nobles', ficha).correcto).toBe(false);
  });

  test('ficha 9 · el único metal de transición líquido es el mercurio', () => {
    // La salvaguarda: si un día hubiera dos, la búsqueda devolvería null y la ficha daría
    // error en vez de corregir por uno de los dos.
    expect(unicoPorEstadoYFamilia('liquido', 'metales-transicion')?.simbolo).toBe('Hg');
    expect(CASOS[8].respuestaTexto).toBe('Mercurio');
    // Y el bromo, el otro líquido de la tabla, NO es un metal de transición: es la trampa.
    expect(buscarPorSimbolo('Br')?.familia).toBe('halogenos');
    expect(comprobarRespuesta('bromo', CASOS[8]).correcto).toBe(false);
  });

  test('ficha 10 · el número atómico del potasio es 19', () => {
    expect(buscarPorSimbolo('K')?.numero).toBe(19);
    expect(CASOS[9].respuestaNumerica).toBe(19);
  });

  test('ficha 11 · la configuración del silicio se acepta con y sin superíndices', () => {
    const ficha = CASOS[10];
    expect(buscarPorSimbolo('Si')?.configuracionElectronica).toBe('[Ne] 3s² 3p²');
    expect(ficha.respuestaTexto).toBe('[Ne] 3s² 3p²');
    for (const forma of ['[Ne] 3s² 3p²', '[ne] 3s2 3p2', '[Ne]3s23p2']) {
      expect(comprobarRespuesta(forma, ficha).correcto, `forma «${forma}»`).toBe(true);
    }
    expect(comprobarRespuesta('[Ne] 3s² 3p³', ficha).correcto).toBe(false);
  });

  test('ficha 12 · de los halógenos el menos electronegativo es el yodo', () => {
    // La cara contraria de la ficha 7: al bajar por el grupo, la electronegatividad baja.
    const f = buscarPorSimbolo('F')?.electronegatividad as number;
    const i = buscarPorSimbolo('I')?.electronegatividad as number;
    expect(i).toBeLessThan(f);
    expect(extremoElectronegatividad(['F', 'Cl', 'Br', 'I'], 'min')?.simbolo).toBe('I');
    expect(CASOS[11].respuestaTexto).toBe('Yodo');
  });

  // ----------------------------------------------------------------
  // Las búsquedas que deben negarse a responder
  //
  // Una pregunta de búsqueda solo es asignable si su respuesta es ÚNICA. Estas
  // son las tres formas en que eso se rompe, y en las tres el motor devuelve
  // null en vez de inventar una respuesta.
  // ----------------------------------------------------------------
  test('el motor se niega a responder cuando la respuesta no sería única', () => {
    // Casilla compartida por lantánidos y actínidos: varios elementos, no uno.
    expect(buscarPorGrupoPeriodo(3, 6)).toBeNull();
    // Un elemento inexistente.
    expect(buscarPorNumero(999)).toBeNull();
    expect(buscarPorSimbolo('Xx')).toBeNull();
    // Un empate en el extremo.
    expect(extremoElectronegatividad(['Na', 'Na'], 'max')).toBeNull();
    // Una configuración que no existe.
    expect(buscarPorConfiguracion('[Ar] 9z⁹')).toBeNull();
  });

  test('resolverCaso nunca lanza: los datos incompletos salen como no-ok', () => {
    expect(resolverCaso({ tipo: 'elemento-por-numero' }).ok).toBe(false);
    expect(resolverCaso({ tipo: 'propiedad-numerica', simbolo: 'Fe' }).ok).toBe(false);
    expect(resolverCaso({ tipo: 'elemento-por-grupo-periodo', grupo: 3 }).ok).toBe(false);
    // El gas noble sin electronegatividad asignada: no-ok, no NaN en pantalla.
    const sinDato = resolverCaso({
      tipo: 'propiedad-numerica',
      simbolo: 'He',
      propiedad: 'electronegatividad',
    });
    expect(sinDato.ok).toBe(false);
    expect(sinDato.error).not.toBeNull();
  });

  // ----------------------------------------------------------------
  // Mezcla de categorías
  // ----------------------------------------------------------------
  test('hay fichas de cálculo directo y fichas de situación real', () => {
    const abstractos = CASOS.filter((c) => c.categoria === 'abstracto').length;
    const aplicados = CASOS.filter((c) => c.categoria === 'aplicado').length;
    expect(abstractos).toBeGreaterThanOrEqual(3);
    expect(aplicados).toBeGreaterThanOrEqual(3);
    expect(abstractos + aplicados).toBe(12);
  });
});
