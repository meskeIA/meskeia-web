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
import { esperarHidratacion, sembrarValor } from './_hidratacion';

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
    // La receta ya existe en el propio repositorio: app/apps/page.tsx normaliza con
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


// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 12/09/2026 — la tarea de aula de `1d905afb`, EN EL NAVEGADOR
//
// La cola invalidó la inspección del 30/08 porque el commit `1d905afb` añadió las
// «Fichas de búsqueda para clase»: 12 fichas numeradas para que un profesor pueda
// decir «haz las fichas 3, 7 y 11». Lo de arriba (casos 1-6 y los hallazgos 528-532)
// NO se toca: es el contrato de la app y sigue en verde.
//
// El hueco que cubren estos tres casos: los tests del 11/09 prueban el MOTOR de las
// fichas importando `casos.ts` —12 ms para los 26—, pero nadie había comprobado el
// formulario: que escribir «hierro» en la ficha 1 y pulsar «Comprobar» dé ✅, que el
// contador suba, y que una respuesta equivocada se rechace. Un motor correcto cableado
// a un `onChange` roto corrige bien y no aprueba a nadie, y la app carga igual de bien.
//
// LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
//
//   CASO 7 — NORMAL (aula). Tres fichas de las 12, con la solución sacada de
//     `elementos-data.ts` y del convenio de `casos.ts`, no de lo que devuelva la app:
//
//       ficha 1 · «un átomo tiene 26 protones» → Z = 26 es { simbolo: "Fe",
//                 nombre: "Hierro" }. Sinónimos aceptados = símbolo y nombre
//                 normalizados → «fe» y «hierro». Se teclea «hierro».
//       ficha 6 · «el gas noble que cierra el período 2» → grupo 18 + período 2 es
//                 { numero: 10, simbolo: "Ne", nombre: "Neón" }. Se teclea «neon» SIN
//                 tilde, que es lo que se teclea de verdad: `normalizar` quita las
//                 tildes antes de comparar, así que debe valer.
//       ficha 8 · «a qué familia pertenece el yodo» → el yodo lleva
//                 familia: "halogenos", y NOMBRES_FAMILIA lo presenta como «halógenos».
//                 Se teclea «halogenos».
//
//     Y el contador «Has resuelto N de 12» tiene que ir a 1, 2 y 3: cuenta veredictos
//     correctos, así que es el único testigo de que el estado de React se enteró.
//
//   CASO 8 — LÍMITE. El último elemento de la tabla y de su período, sintético, sin
//     peso atómico estándar y sin radio ni electronegatividad medidos:
//
//       Og (118, Oganesón) · masa 294 ENTERA → la ficha escribe «[294] u», no
//         «294,000 u» (es el convenio IUPAC para los elementos sin isótopos con
//         abundancia natural, y es justo el hallazgo 530) · grupo 18 · período 7 ·
//         familia "gases-nobles" → «Gases Nobles» · estado "solido" → «Sólido» ·
//         radioAtomico null → «N/D» · electronegatividad null → «N/D» ·
//         configuración «[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶»
//         Se busca «oganeson» sin tilde: son 14 de 118 los nombres con tilde o eñe, y
//         el oganesón es uno de ellos (hallazgo 528).
//
//     Y el límite de la ficha numérica: la ficha 4 pide la masa del cobre, que en los
//     datos es 63.546. `comprobarRespuesta` la compara con `parseSpanishNumber`, así
//     que «63,546» con coma española debe entrar; y la propia app declara un margen del
//     1 % —max(0,01; 0,63546) = 0,63546—, así que «63,5» (diferencia 0,046) entra y
//     «29», el número atómico del cobre, que es el error que la pista nombra, no.
//
//   CASO 9 — LO QUE DEBE RECHAZARSE. Cuatro negativas y una búsqueda sin resultados:
//       · campo vacío        → motivo 'vacia': «Escribe una respuesta antes de
//                              comprobar», y el contador NO sube.
//       · ficha 1 con «Cu»   → un elemento real, pero no el de Z = 26.
//       · ficha 4 con texto  → `parseSpanishNumber('sesenta y tres')` es NaN, y NaN no
//                              puede colar como acierto por redondeo ni salir a pantalla.
//       · ficha 8 con «26»   → una ficha de TEXTO nunca cae a la rama numérica: 26
//                              tecleado donde se pide una familia es un fallo.
//       · buscar «kriptonita» → «Mostrando 0 de 118 elementos» y ninguna celda activa.
// ═══════════════════════════════════════════════════════════════════════════

/** La tarjeta de una ficha de aula, acotada por su campo de respuesta. */
const tarjetaFicha = (page: Page, id: number) =>
  page.locator('article').filter({ has: page.locator(`#respuesta-ficha-${id}`) });

/** Deja la app lista para que un clic o una siembra lleguen al estado de React. */
async function abrirHidratada(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#busqueda', '#respuesta-ficha-1']);
}

/**
 * Responde una ficha de aula y devuelve el veredicto tal como se lee en pantalla.
 * Con `respuesta === null` no siembra nada: es el caso del campo vacío.
 */
async function responderFicha(
  page: Page,
  id: number,
  respuesta: string | null,
): Promise<string> {
  if (respuesta !== null) await sembrarValor(page, `#respuesta-ficha-${id}`, respuesta);
  await tarjetaFicha(page, id).getByRole('button', { name: 'Comprobar' }).click();
  const veredicto = tarjetaFicha(page, id).locator('[class*="__aulaVeredicto"]');
  await expect(veredicto).toBeVisible();
  return (await veredicto.innerText()).replace(/\s+/g, ' ').trim();
}

const ACIERTO = '¡Correcto! Lo has encontrado.';
const FALLO = 'Todavía no. Vuelve a la tabla y fíjate en la pista.';
const VACIA = 'Escribe una respuesta antes de comprobar.';

/** El texto del contador de fichas resueltas, sin saltos de línea. */
async function contadorFichas(page: Page): Promise<string> {
  return (await page.locator('[class*="__aulaContadorTexto"]').innerText()).replace(/\s+/g, ' ');
}

test.describe('RE-INSPECCIÓN 12/09/2026 · la tarea de aula en el navegador', () => {
  // ─────────────────────────────────────────────────────────────────────────
  // CASO 7 — NORMAL: tres fichas resueltas de verdad en el formulario
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 7 · las fichas 1, 6 y 8 aceptan la respuesta correcta y el contador sube', async ({
    page,
  }) => {
    await abrirHidratada(page);

    // El contador arranca a cero: si ya viniera a 1, lo que mida después no probaría nada.
    expect(await contadorFichas(page)).toBe('Has resuelto 0 de 12');

    // ficha 1 · Z = 26 → Fe «Hierro» (elementos-data.ts, numero: 26). Vale el NOMBRE,
    // no solo el símbolo: `sinonimosDe` genera los dos.
    expect(await responderFicha(page, 1, 'hierro')).toContain(ACIERTO);
    expect(await contadorFichas(page)).toBe('Has resuelto 1 de 12');

    // ficha 6 · grupo 18 + período 2 → Ne «Neón». Se teclea SIN tilde a propósito:
    // `normalizar` hace NFD y borra los diacríticos antes de comparar.
    expect(await responderFicha(page, 6, 'neon')).toContain(ACIERTO);
    expect(await contadorFichas(page)).toBe('Has resuelto 2 de 12');

    // ficha 8 · el yodo lleva familia: "halogenos" → se presenta «halógenos».
    expect(await responderFicha(page, 8, 'halogenos')).toContain(ACIERTO);
    expect(await contadorFichas(page)).toBe('Has resuelto 3 de 12');

    // Y la solución desplegada dice exactamente la respuesta canónica, no otra: es lo
    // que un profesor lee para corregir a mano.
    await tarjetaFicha(page, 8).getByRole('button', { name: 'Ver solución' }).click();
    const solucion = (await page.locator('#solucion-ficha-8').innerText()).replace(/\s+/g, ' ');
    expect(solucion).toContain('Respuesta: halógenos');
    expect(solucion).toContain('Esa columna es la de los halógenos');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 8 — LÍMITE: el último de la tabla, y la ficha numérica en su margen
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 8 · el oganesón se encuentra sin tilde y su ficha no inventa precisión', async ({
    page,
  }) => {
    await abrirHidratada(page);

    // «oganeson» sin tilde: uno de los 14 nombres con tilde o eñe (hallazgo 528).
    await sembrarValor(page, '#busqueda', 'oganeson');
    await expect(page.getByText('Mostrando 1 de 118 elementos')).toBeVisible();
    expect(
      await page.locator(CELDA_ACTIVA).evaluateAll((ns) => ns.map((n) => n.getAttribute('title'))),
    ).toEqual(['Oganesón (Og)']);

    const og = await fichaDe(page, 'Oganesón (Og)');
    // masa: 294 (entera, número másico del isótopo más estable) → corchetes IUPAC.
    expect(og).toContain('Masa atómica: [294] u');
    expect(og).not.toContain('294,000');
    expect(og).toContain('Número atómico: 118');
    expect(og).toContain('Grupo: 18');
    expect(og).toContain('Período: 7');
    expect(og).toContain('Familia: Gases Nobles');
    // estado: "solido" — el oganesón NO es gas pese a estar en la columna de los nobles.
    expect(og).toContain('Estado: Sólido');
    // radioAtomico y electronegatividad son null en los datos: se dice «N/D», no un 0.
    expect(og).toContain('Radio atómico: N/D');
    expect(og).toContain('Electronegatividad: N/D');
    expect(og).not.toContain('Radio atómico: 0');
    expect(og).toContain('[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶');
  });

  test('CASO 8 bis · la ficha 4 lee la masa del cobre con coma española y dentro del 1 %', async ({
    page,
  }) => {
    await abrirHidratada(page);

    // Cu masa: 63.546 → respuestaNumerica 63,546 · tolerancia max(0,01; 1 % ) = 0,63546.
    expect(await responderFicha(page, 4, '63,546')).toContain(ACIERTO);
    // «63,5» es el ejemplo que la propia app declara en su párrafo de convenio
    // («copiar 63,5 de un recuadro que pone 63,546 es haber encontrado el dato»).
    expect(await responderFicha(page, 4, '63,5')).toContain(ACIERTO);
    // Y el número atómico del cobre, 29, es el error que la pista de la ficha nombra:
    // tiene que fallar, no aprobar por estar «cerca».
    expect(await responderFicha(page, 4, '29')).toContain(FALLO);
    expect(await contadorFichas(page)).toBe('Has resuelto 0 de 12');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 9 — LO QUE DEBE RECHAZARSE
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 9 · vacío, respuesta plausible pero falsa, texto en ficha numérica y número en ficha de texto', async ({
    page,
  }) => {
    await abrirHidratada(page);

    // Campo vacío: motivo 'vacia', mensaje propio, y el contador NO se mueve.
    expect(await responderFicha(page, 2, null)).toContain(VACIA);
    expect(await contadorFichas(page)).toBe('Has resuelto 0 de 12');

    // Un elemento que existe, pero no es el de Z = 26.
    expect(await responderFicha(page, 1, 'Cu')).toContain(FALLO);

    // `parseSpanishNumber('sesenta y tres')` es NaN: ni acierto ni «NaN» en pantalla.
    const textoEnNumerica = await responderFicha(page, 4, 'sesenta y tres');
    expect(textoEnNumerica).toContain(FALLO);
    expect(textoEnNumerica).not.toContain('NaN');

    // Una ficha de TEXTO nunca cae a la rama numérica: «26» donde se pide una familia
    // es un fallo, no un acierto por redondeo.
    expect(await responderFicha(page, 8, '26')).toContain(FALLO);

    expect(await contadorFichas(page)).toBe('Has resuelto 0 de 12');

    // Y una búsqueda que no existe deja la tabla en cero, anunciado por el contador.
    await sembrarValor(page, '#busqueda', 'kriptonita');
    await expect(page.getByText('Mostrando 0 de 118 elementos')).toBeVisible();
    await expect(page.locator(CELDA_ACTIVA)).toHaveCount(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS de la re-inspección del 12/09/2026
// Marcados con test.fail(): afirman lo que DEBERÍA pasar, así que hoy fallan a
// propósito. Al repararse se les quita la marca y quedan como regresión.
// ═══════════════════════════════════════════════════════════════════════════
test.describe('hallazgos abiertos · 12/09/2026', () => {
  test('533 · la tabla comparativa del bloque educativo contradice las fichas de la app', async ({
    page,
  }) => {
    await abrirHidratada(page);

    // Es el mismo defecto que el «radio de Cs» reparado el 23/08 —ese quedó bien: el
    // paso 5 nombra Fr 348 pm, Cs 298 pm y He 31 pm, que son los tres valores del
    // módulo—, pero la tabla comparativa de los grupos no se revisó y tres de sus siete
    // filas riñen con lo que la propia app enseña al abrir una casilla:
    //
    //   fila                        dice        la app muestra
    //   alcalinotérreos (Gp2)       0,9–1,3     Be 1,57 (y Mg 1,31): fuera del rango
    //   gases nobles (Gp18)         No aplicable Kr 3,00 · Xe 2,60 · Rn 2,20
    //   metales de transición       1,3–2,5     Au 2,54 · Y 1,22: fuera por los dos lados
    //
    // Un estudiante que abra el berilio lee 1,57 y cuatro pantallas más abajo lee que su
    // familia va de 0,9 a 1,3. El berilio es la excepción clásica del grupo 2, así que
    // el arreglo puede ser ampliar el rango o nombrar la excepción, pero no dejar las dos
    // cifras contradiciéndose en la misma página.
    const filas = await page
      .locator('[class*="__comparativaTable"] tbody tr')
      .evaluateAll((rs) => rs.map((r) => Array.from((r as HTMLTableRowElement).cells).map((c) => c.innerText.trim())));

    const alcalinoterreos = filas.find((f) => f[0].includes('alcalinotérreos'));
    const nobles = filas.find((f) => f[0].includes('Gases nobles'));

    // El berilio, en su ficha: electronegatividad 1,57.
    expect(await fichaDe(page, 'Berilio (Be)')).toContain('Electronegatividad: 1,57');
    await cerrarFicha(page);
    // El rango declarado tiene que cubrirlo.
    expect(alcalinoterreos?.[2]).not.toBe('0,9–1,3 (baja)');

    // El kriptón, en su ficha: electronegatividad 3,00.
    expect(await fichaDe(page, 'Kriptón (Kr)')).toContain('Electronegatividad: 3,00');
    await cerrarFicha(page);
    // …así que «No aplicable» para los gases nobles es falso en esta misma app.
    expect(nobles?.[2]).not.toBe('No aplicable');
  });

  test('534 · el origen sintético solo llega al JSON-LD, nunca a la pantalla', async ({ page }) => {
    await abrirHidratada(page);

    // La reparación del hallazgo 531 hizo lo correcto —sacar «Sintético» del filtro de
    // ESTADO, porque el origen no es un estado físico— y dejó el dato guardado aparte:
    // `origen: 'sintetico'` está en los 24 elementos con Z ≥ 95 de elementos-data.ts.
    // Pero ese campo no se lee en NINGÚN punto de page.tsx (solo `origenFocoRef`, que es
    // otra cosa), así que la información desapareció de la interfaz sin sustituto:
    //   · la ficha del americio no dice que sea artificial;
    //   · no hay filtro, insignia ni leyenda que lo diga;
    //   · y mientras tanto el faqJsonLd de metadata.ts SÍ lo afirma —«los del 95 al 118
    //     son sintéticos»—, de modo que la app se lo cuenta a Google y a las IAs y no al
    //     estudiante que la tiene delante. Medido: «sintétic» sale 3 veces en el HTML
    //     servido (las tres dentro del JSON-LD) y 0 veces en el texto visible.
    const am = await fichaDe(page, 'Americio (Am)');
    expect(am).toContain('Número atómico: 95');
    expect(am).toMatch(/sint[eé]tic/i);
  });

  test('535 · los doce botones «Comprobar» de las fichas comparten nombre accesible', async ({
    page,
  }) => {
    await abrirHidratada(page);

    // Llegó con `1d905afb`. Las 12 tarjetas son <article> sin nombre accesible (ni
    // aria-label ni aria-labelledby apuntando a su <h3>), y sus botones se llaman todos
    // «Comprobar» y todos «Ver solución». Quien navega por lista de botones con un lector
    // de pantalla —que es cómo se recorre una página de 12 formularios iguales— oye doce
    // «Comprobar» seguidos sin saber a qué ficha pertenece cada uno (WCAG 2.4.6). Basta
    // con aria-label="Comprobar la ficha 3" o con dar nombre al <article>.
    // ⚠️ 13/09/2026: el locator era { name: 'Comprobar', exact: true }, y tras la reparación
    // ya no casa con ninguno — que es justo la señal de que los doce dejaron de llamarse igual.
    // Se busca por el principio del nombre, que sigue siendo el texto visible del botón
    // (WCAG 2.5.3: el nombre accesible empieza por lo que se lee en pantalla).
    const comprobar = page.getByRole('button', { name: /^Comprobar/ });
    await expect(comprobar).toHaveCount(12);

    const nombres = await comprobar.evaluateAll((bs) =>
      bs.map((b) => b.getAttribute('aria-label') ?? b.textContent?.trim() ?? ''),
    );
    // Doce nombres, doce nombres DISTINTOS: hoy son doce veces el mismo.
    expect(new Set(nombres).size).toBe(12);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 14/09/2026 — tres casos nuevos, resueltos a mano ANTES de abrir
// el navegador. La verdad de esta app es DOCUMENTAL: los valores esperados salen
// de `app/tabla-periodica/elementos-data.ts`, que declara su fuente en cabecera
// (IUPAC/CIAAW 2021, https://iupac.qmul.ac.uk/AtWt/, verificado 2026-08-23), y de
// la definición de la tabla periódica. Ninguno está copiado de lo que devuelve la app.
//
// Los tres hallazgos del 13/09 (775 tabla comparativa · 776 origen sintético ·
// 777 doce «Comprobar» iguales) se comprobaron reparados antes de escribir esto:
// la fila Gp2 dice ya «0,9–1,57», la ficha del americio dice «Origen: Sintético» y
// los doce botones tienen doce nombres accesibles distintos. Sus tests siguen arriba.
//
//   CASO 13 — NORMAL. El COBALTO, elegido a propósito: es la casilla que discrimina
//     la afirmación «El Grupo 8 IUPAC incluye Fe, Co, Ni» del bloque educativo.
//     Resuelto a mano desde elementos-data.ts (numero: 27):
//       Z = 27 · masa 58,933 u · grupo 9 · período 4 · metales-transicion ·
//       estado sólido · χ 1,88 · radio 152 pm · [Ar] 3d⁷ 4s²
//     Y las TRES vías que un estudiante usa para llegar a él, que es lo que promete
//     el placeholder («Nombre, símbolo o número...») y el jsonLd («Búsqueda por
//     nombre, símbolo o número atómico»):
//       · «cobalto» → 1 (ningún otro de los 118 nombres contiene esa cadena)
//       · «27»      → 1 (ningún Z de 1 a 118 lleva «27» como subcadena, salvo el 27)
//       · «Co»      → 6, y no es un fallo: la comparación es por SUBCADENA y también
//                     mira el nombre, así que entran Cobalto (símbolo), Cobre,
//                     Arsénico, Circonio, Copernicio y Moscovio (nombre). Se cuentan
//                     a mano sobre el módulo: co-balto, co-bre, arséni-co, cir-co-nio,
//                     coperni-cio, mos-co-vio.
//
//   CASO 14 — LÍMITE. La FRONTERA natural/sintético, que es donde la clasificación
//     de esta app se juega el dato que el 13/09 volvió a la pantalla (hallazgo 776).
//     elementos-data.ts declara `origen: 'sintetico'` SOLO en los 24 elementos con
//     Z ≥ 95, y su comentario lo razona: los seis naturales-radiactivos (Tc, Pm, At,
//     Fr, Np, Pu) no lo llevan. El faqJsonLd de metadata.ts dice lo mismo: «los
//     elementos del 1 al 94 se encuentran en la naturaleza; los del 95 al 118 son
//     sintéticos». Tres fichas consecutivas, resueltas a mano:
//       Np (93) · [237] u · actínido · sólido · χ 1,36 · 221 pm · SIN fila «Origen»
//       Pu (94) · [244] u · actínido · sólido · χ 1,28 · 243 pm · SIN fila «Origen»
//       Am (95) · [243] u · actínido · sólido · χ 1,30 · 244 pm · CON «Origen: Sintético»
//     Nota de lectura, no defecto: la masa del americio (243) es MENOR que la del
//     plutonio (244) pese a tener un protón más. No hay peso atómico estándar para
//     ninguno de los dos —de ahí los corchetes—, y lo que se muestra es el número
//     másico del isótopo más estable de cada uno, que no tiene por qué crecer con Z.
//
//   CASO 15 — LO QUE DEBE RECHAZARSE. Dos búsquedas imposibles y tres fórmulas:
//       · «119» → 0 resultados. Es el primer elemento NO confirmado: la tabla llega
//         a 118, y ningún Z de 1 a 118 contiene «119» como subcadena.
//       · «Xx» → 0 resultados. No es el símbolo de ningún elemento.
//       · «NACL» → el error del estudiante que escribe en mayúsculas. El parser lee
//         /^([A-Z][a-z]?)/, así que ve N, luego A: «A» no es un símbolo → tiene que
//         nombrarlo, no sumar el sodio y el cloro por su cuenta ni devolver 14,007.
//       · «h2o» → todo en minúsculas: ningún símbolo empieza así, y el parser no
//         puede adivinar. Rechazo con mensaje, no un total.
//       · «Nx2O» → símbolo inventado de dos letras dentro de una fórmula plausible.
// ═══════════════════════════════════════════════════════════════════════════

// ── CASO 13 — NORMAL: el cobalto por las tres vías del buscador ───────────────
test.describe('CASO 13 · normal: el cobalto, buscado por nombre, símbolo y número', () => {
  test('las tres vías del buscador llegan al cobalto y su ficha da los valores del módulo', async ({
    page,
  }) => {
    await abrirHidratada(page);

    // Vía 1 — por NOMBRE. Solo «Cobalto» contiene la cadena «cobalto».
    await sembrarValor(page, '#busqueda', 'cobalto');
    await expect(page.getByText('Mostrando 1 de 118 elementos')).toBeVisible();
    expect(
      await page.locator(CELDA_ACTIVA).evaluateAll((ns) => ns.map((n) => n.getAttribute('title'))),
    ).toEqual(['Cobalto (Co)']);

    // Vía 2 — por NÚMERO ATÓMICO. «27» no es subcadena de ningún otro Z de 1 a 118.
    await sembrarValor(page, '#busqueda', '27');
    await expect(page.getByText('Mostrando 1 de 118 elementos')).toBeVisible();
    expect(
      await page.locator(CELDA_ACTIVA).evaluateAll((ns) => ns.map((n) => n.getAttribute('title'))),
    ).toEqual(['Cobalto (Co)']);

    // Vía 3 — por SÍMBOLO. La comparación es por subcadena y también mira el nombre,
    // así que «Co» devuelve SEIS: el cobalto por su símbolo y otros cinco por llevar
    // «co» dentro del nombre. El cobalto tiene que salir el primero, que es el orden
    // del módulo (por número atómico creciente).
    await sembrarValor(page, '#busqueda', 'Co');
    await expect(page.getByText('Mostrando 6 de 118 elementos')).toBeVisible();
    expect(
      await page.locator(CELDA_ACTIVA).evaluateAll((ns) => ns.map((n) => n.getAttribute('title'))),
    ).toEqual([
      'Cobalto (Co)', 'Cobre (Cu)', 'Arsénico (As)',
      'Circonio (Zr)', 'Copernicio (Cn)', 'Moscovio (Mc)',
    ]);

    // Y en mayúsculas también, que es como se teclea la mitad de las veces.
    await sembrarValor(page, '#busqueda', 'COBALTO');
    await expect(page.getByText('Mostrando 1 de 118 elementos')).toBeVisible();

    // La ficha, contra elementos-data.ts { numero: 27, simbolo: "Co", ... }.
    await sembrarValor(page, '#busqueda', '');
    const co = await fichaDe(page, 'Cobalto (Co)');
    expect(co).toContain('Número atómico: 27');
    expect(co).toContain('Masa atómica: 58,933 u');
    expect(co).toContain('Grupo: 9');       // grupo 9, NO 8: el grupo 8 es Fe-Ru-Os
    expect(co).toContain('Período: 4');
    expect(co).toContain('Familia: Metales de Transición');
    expect(co).toContain('Estado: Sólido');
    expect(co).toContain('Radio atómico: 152 pm');
    expect(co).toContain('Electronegatividad: 1,88');
    expect(co).toContain('[Ar] 3d⁷ 4s²');
    // Es natural, así que NO puede llevar la fila de origen que estrena el hallazgo 776.
    expect(co).not.toContain('Origen:');
    await cerrarFicha(page);

    // El mismo dato, dentro de la calculadora. CoCl₂ (cloruro de cobalto II, el papel
    // indicador de humedad que pasa de azul a rosa):
    //   58,933 + 2 × 35,45 = 58,933 + 70,90 = 129,833 g/mol
    expect(await masaMolarDe(page, 'CoCl2')).toContain('129,8330 g/mol');
  });
});

// ── CASO 14 — LÍMITE: la frontera natural / sintético ─────────────────────────
test.describe('CASO 14 · límite: dónde deja la app de considerar natural un elemento', () => {
  test('Np (93) y Pu (94) no llevan origen, y el americio (95) sí', async ({ page }) => {
    await abrirHidratada(page);

    // Neptunio, Z = 93. Radiactivo natural en trazas: el módulo NO le pone `origen`.
    const np = await fichaDe(page, 'Neptunio (Np)');
    expect(np).toContain('Número atómico: 93');
    expect(np).toContain('Masa atómica: [237] u');   // sin peso atómico estándar → corchetes
    expect(np).toContain('Familia: Actínidos');
    expect(np).toContain('Estado: Sólido');           // hallazgo 531: el estado no es el origen
    expect(np).toContain('Electronegatividad: 1,36');
    expect(np).not.toContain('Origen:');
    await cerrarFicha(page);

    // Plutonio, Z = 94. El último que el propio faqJsonLd cuenta como natural.
    const pu = await fichaDe(page, 'Plutonio (Pu)');
    expect(pu).toContain('Número atómico: 94');
    expect(pu).toContain('Masa atómica: [244] u');
    expect(pu).toContain('Radio atómico: 243 pm');
    expect(pu).toContain('Electronegatividad: 1,28');
    expect(pu).toContain('[Rn] 5f⁶ 7s²');
    expect(pu).not.toContain('Origen:');
    await cerrarFicha(page);

    // Americio, Z = 95. El PRIMERO con `origen: 'sintetico'` — la frontera exacta, y
    // la distinción que el hallazgo 776 devolvió a la pantalla: «un estudiante no podía
    // distinguir el americio del plutonio».
    const am = await fichaDe(page, 'Americio (Am)');
    expect(am).toContain('Número atómico: 95');
    expect(am).toContain('Masa atómica: [243] u');
    expect(am).toContain('Origen: Sintético');
    expect(am).toContain('se obtiene en reactor o acelerador');
    expect(am).toContain('Electronegatividad: 1,30');
    expect(am).toContain('[Rn] 5f⁷ 7s²');
    await cerrarFicha(page);

    // La frontera es 95, no 93: exactamente 24 fichas llevan la fila de origen, y las
    // 94 primeras no. Se comprueba sobre los dos vecinos, que es donde se ve.
    // Y los tres siguen contando como sólidos en el filtro de estado (hallazgo 531),
    // porque el origen no es un estado físico.
    await page.selectOption('#filtroEstado', 'solido');
    for (const titulo of ['Neptunio (Np)', 'Plutonio (Pu)', 'Americio (Am)']) {
      await expect(page.locator(`[title="${titulo}"]`)).not.toHaveClass(/__filtrado/);
    }
  });
});

// ── CASO 15 — RECHAZO: lo que no existe no puede devolver un número ───────────
test.describe('CASO 15 · rechazo: el elemento 119 y tres fórmulas imposibles', () => {
  test('una búsqueda imposible deja 0 celdas activas y la calculadora nombra lo que no entiende', async ({
    page,
  }) => {
    await abrirHidratada(page);

    // «119» — el primer elemento NO confirmado (la IUPAC llega al 118). Ningún Z de
    // 1 a 118 lo contiene como subcadena, así que la única respuesta posible es 0.
    await sembrarValor(page, '#busqueda', '119');
    await expect(page.getByText('Mostrando 0 de 118 elementos')).toBeVisible();
    await expect(page.locator(CELDA_ACTIVA)).toHaveCount(0);
    // Y ninguna de las 118 celdas queda clicable: no se puede abrir una ficha por
    // error desde un resultado vacío.
    expect(
      await page.locator(CELDA).evaluateAll((ns) => ns.filter((n) => !(n as HTMLButtonElement).disabled).length),
    ).toBe(0);

    // «Xx» — no es el símbolo de ningún elemento ni parte de ningún nombre.
    await sembrarValor(page, '#busqueda', 'Xx');
    await expect(page.getByText('Mostrando 0 de 118 elementos')).toBeVisible();
    await expect(page.locator(CELDA_ACTIVA)).toHaveCount(0);
    await sembrarValor(page, '#busqueda', '');

    const formula = page.locator('input[placeholder^="Ej:"]');
    const error = page.locator('[class*="__errorMasa"]');

    // «NACL» — todo en mayúsculas. El parser lee /^([A-Z][a-z]?)/: ve «N» (nitrógeno)
    // y después «A», que no es ningún símbolo. Tiene que DECIRLO, no quedarse con el
    // nitrógeno y devolver 14,007 g/mol, que es la forma silenciosa de equivocarse.
    await formula.fill('NACL');
    await page.getByRole('button', { name: 'Calcular' }).click();
    await expect(error).toContainText('Elemento "A" no reconocido');
    await expect(page.locator('[class*="__masaTotal"]')).toHaveCount(0);

    // «h2o» — todo en minúsculas. Ningún símbolo químico empieza por minúscula.
    await formula.fill('h2o');
    await page.getByRole('button', { name: 'Calcular' }).click();
    await expect(error).toContainText('No entiendo');
    await expect(page.locator('[class*="__masaTotal"]')).toHaveCount(0);

    // «Nx2O» — un símbolo inventado de dos letras dentro de una fórmula plausible.
    await formula.fill('Nx2O');
    await page.getByRole('button', { name: 'Calcular' }).click();
    await expect(error).toContainText('Elemento "Nx" no reconocido');
    await expect(page.locator('[class*="__masaTotal"]')).toHaveCount(0);

    // Y en cuanto la fórmula es válida vuelve a calcular: N₂O = 2 × 14,007 + 15,999
    // = 44,013 g/mol. Un rechazo no puede dejar la calculadora atascada.
    expect(await masaMolarDe(page, 'N2O')).toContain('44,0130 g/mol');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS de la re-inspección del 14/09/2026
// Marcados con test.fail(): afirman lo que DEBERÍA pasar, así que hoy fallan a
// propósito. Al repararse se les quita la marca y quedan como regresión.
//
// Los cinco son de CONTENIDO del bloque educativo, y cuatro tienen la misma forma
// que el hallazgo 775 reparado ayer: un texto que riñe con la ficha que el propio
// estudiante acaba de abrir. La reparación del 13/09 arregló las tres filas de la
// TABLA COMPARATIVA que se le señalaron; no se barrieron las otras cinco secciones
// del bloque, y ahí siguen.
// ═══════════════════════════════════════════════════════════════════════════
test.describe('hallazgos abiertos · 14/09/2026', () => {
  test('778 · «Confusiones frecuentes» asigna al grupo 8 tres elementos que la app pone en 8, 9 y 10', async ({
    page,
  }) => {
    await abrirHidratada(page);

    // La sección se titula «Confusiones frecuentes en la tabla periódica» y su cuarta
    // viñeta enseña justo la confusión que dice evitar:
    //   «Grupos 1-18 vs sistema A/B antiguo: El Grupo 8 IUPAC incluye Fe, Co, Ni.
    //    El Grupo VIII antiguo agrupaba nueve elementos en una sola columna:
    //    Fe-Co-Ni, Ru-Rh-Pd y Os-Ir-Pt.»
    // La frase se contradice a sí misma —Fe-Co-Ni es precisamente la agrupación
    // ANTIGUA que la segunda mitad describe— y contradice a las fichas de esta app.
    // En la numeración IUPAC 1-18, los grupos son COLUMNAS: el 8 es Fe-Ru-Os.
    const co = await fichaDe(page, 'Cobalto (Co)');
    expect(co).toContain('Grupo: 9');
    await cerrarFicha(page);
    const ni = await fichaDe(page, 'Níquel (Ni)');
    expect(ni).toContain('Grupo: 10');
    await cerrarFicha(page);
    // Y los que SÍ comparten el grupo 8 con el hierro, en esta misma app:
    for (const [titulo, grupo] of [
      ['Hierro (Fe)', 'Grupo: 8'],
      ['Rutenio (Ru)', 'Grupo: 8'],
      ['Osmio (Os)', 'Grupo: 8'],
    ] as const) {
      expect(await fichaDe(page, titulo)).toContain(grupo);
      await cerrarFicha(page);
    }

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.locator('body')).not.toContainText('El Grupo 8 IUPAC incluye Fe, Co, Ni');
  });

  test('779 · el escenario del físico nuclear borra la frontera natural/sintético que la app acaba de recuperar', async ({
    page,
  }) => {
    await abrirHidratada(page);

    // El escenario «Físico nuclear» afirma: «Elementos con Z>92 son sintéticos
    // (transuránidos), todos radiactivos». Pero el módulo de datos decidió lo
    // contrario y lo dejó escrito: los seis naturales-radiactivos (Tc, Pm, At, Fr,
    // Np, Pu) NO llevan `origen: 'sintetico'`, que empieza en Z = 95. Y el faqJsonLd
    // de esta misma app dice «los elementos del 1 al 94 se encuentran en la
    // naturaleza; los del 95 al 118 son sintéticos».
    // Resultado para quien la usa: el 13/09 se le devolvió a la ficha la distinción
    // entre el plutonio y el americio (hallazgo 776), y cuatro pantallas más abajo el
    // texto se la vuelve a quitar. Además mezcla dos cosas distintas: «transuránido»
    // (Z > 92) es un hecho de posición, «sintético» es un hecho de procedencia.
    const pu = await fichaDe(page, 'Plutonio (Pu)');
    expect(pu).toContain('Número atómico: 94');
    expect(pu).not.toContain('Origen:');      // la app NO lo llama sintético
    await cerrarFicha(page);

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.locator('body')).not.toContainText('Elementos con Z>92 son sintéticos');
  });

  test('780 · la fila de alcalinotérreos, reparada ayer, sigue dejando fuera al bario', async ({
    page,
  }) => {
    await abrirHidratada(page);

    // El hallazgo 775 subió el techo de la fila Gp2 de «0,9–1,3» a «0,9–1,57» para
    // que cupiera el berilio (1,57). El SUELO se quedó en 0,9 y el bario, que esta
    // misma app muestra con 0,89, sigue una centésima por debajo del rango que se le
    // declara a su propia familia. Es la misma comprobación de ayer aplicada al otro
    // extremo: el rango tiene que cubrir a los SEIS alcalinotérreos de la tabla
    // (Be 1,57 · Mg 1,31 · Ca 1,00 · Sr 0,95 · Ba 0,89 · Ra 0,90).
    const ba = await fichaDe(page, 'Bario (Ba)');
    expect(ba).toContain('Familia: Metales Alcalinotérreos');
    expect(ba).toContain('Electronegatividad: 0,89');
    await cerrarFicha(page);

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const filas = await page
      .locator('[class*="__comparativaTable"] tbody tr')
      .evaluateAll((rs) =>
        rs.map((r) => Array.from((r as HTMLTableRowElement).cells).map((c) => c.innerText.trim())),
      );
    const celda = filas.find((f) => f[0].includes('alcalinotérreos'))?.[2] ?? '';
    const declarados = (celda.match(/\d+,\d+|\d+/g) ?? []).map((n) => Number(n.replace(',', '.')));
    expect(declarados.length).toBeGreaterThan(0);
    // El menor número declarado en la celda es el suelo del rango: tiene que llegar
    // al bario, o el rango no describe a la familia que dice describir.
    expect(Math.min(...declarados)).toBeLessThanOrEqual(0.89);

    // Mismo defecto, misma tabla, otra fila: la de gases nobles declara «Estado a
    // 25°C: Gas» y el oganesón, que esta app clasifica como gas noble, tiene «Estado:
    // Sólido» en su ficha. Se deja anotado aquí, no como aserción: a diferencia de la
    // electronegatividad del bario, el estado del oganesón es una predicción y la
    // celda describe al grupo, no a cada uno de sus siete miembros.
  });

  test('781 · la guía de 7 pasos manda el helio al bloque p, y su propia ficha dice 1s²', async ({
    page,
  }) => {
    await abrirHidratada(page);

    // El paso 2 («Determinar el bloque») es una regla de deducción sin excepciones:
    //   «Grupos 1-2: bloque s. Grupos 3-12: bloque d. Grupos 13-18: bloque p.
    //    Lantánidos/Actínidos: bloque f.»
    // Aplicada al helio —grupo 18 en esta misma app— da «bloque p», y la ficha del
    // helio que el estudiante tiene a dos clics dice «1s²»: no hay ningún electrón p.
    // El helio es la excepción clásica de esa regla, y la app ya nombra la simétrica
    // (el hidrógeno en el grupo 1) en sus «Confusiones frecuentes»; a esta le falta.
    const he = await fichaDe(page, 'Helio (He)');
    expect(he).toContain('Grupo: 18');
    expect(he).toContain('1s²');
    await cerrarFicha(page);

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const paso2 = page.locator('[class*="__stepItem"]').filter({ hasText: 'Determinar el bloque' });
    await expect(paso2).toContainText('bloque p');
    // Si se enuncia la regla, hay que nombrar al helio, que es el único elemento al
    // que le falla dentro de esta tabla.
    await expect(paso2).toContainText(/helio|\bHe\b/);
  });

  test('782 · la ficha del neptunio escribe «transurámico»', async ({ page }) => {
    await abrirHidratada(page);

    // Errata en el `datoCurioso` del neptunio, dentro de elementos-data.ts: «Primer
    // elemento transurámico descubierto». Es «transuránico» (más allá del uranio), y
    // es además el término que el propio bloque educativo usa bien tres secciones más
    // abajo («transuránidos»). Una tabla de consulta que se proyecta en clase no puede
    // enseñar mal la palabra técnica que está definiendo. Es la única vez que aparece
    // en los 118 datos curiosos, así que no hay más que un sitio que corregir.
    const np = await fichaDe(page, 'Neptunio (Np)');
    expect(np).toContain('Primer elemento');
    expect(np).not.toContain('transurámico');
    expect(np).toContain('transuránico');
  });
});
