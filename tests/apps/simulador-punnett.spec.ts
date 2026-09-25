import { test, expect, devices } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Cuadro de Punnett — Inspector, 11/09/2026 (PRIMERA inspección)
 *
 * Motor bajo prueba: `cruzarMonohibrido`, `cruzarDihibrido`, `gametosDihibridoP`,
 * `ordenarAlelos`, `calcularProporciones`, `formatRatio`, `interpretarMonohibrido` e
 * `interpretarDihibrido`, todas en `app/simulador-punnett/page.tsx`. NO hay módulo
 * aparte en `lib/`: el cálculo vive inline en el componente, aunque sí está escrito
 * como funciones puras fuera de él (se puede razonar sin montar React).
 *
 * Aquí la verdad NO sale de una fuente normativa: sale de las leyes de Mendel, así que
 * los tres casos se resolvieron A MANO antes de abrir el navegador.
 *
 * CASO 1 (normal) — Monohíbrido Aa × Aa, el estado por defecto de la app.
 *   Gametos P1: A, a · Gametos P2: A, a
 *   Rejilla 2×2:   A×A = AA   A×a = Aa
 *                  a×A = Aa   a×a = aa      (aA y Aa son EL MISMO genotipo)
 *   Genotípica: 1 AA : 2 Aa : 1 aa  ·  Fenotípica (dominancia completa): 3 : 1
 *   Porcentajes: 25 % + 50 % + 25 % = 100 %
 *
 * CASO 2 (límite) — Dihíbrido AaBb × AaBb, lo más exigente que la app ofrece.
 *   Gametos de cada progenitor (3.ª ley): AB, Ab, aB, ab → 4 × 4 = 16 celdas.
 *   Fenotípica: A_B_ = 9 · A_bb = 3 · aaB_ = 3 · aabb = 1 → 9:3:3:1
 *   Genotípica: AABB 1 · AABb 2 · AAbb 1 · AaBB 2 · AaBb 4 · Aabb 2 ·
 *               aaBB 1 · aaBb 2 · aabb 1   (suma 16)
 *   Porcentajes EXACTOS: 6,25 % · 12,5 % · 25 % → suman 100 %.
 *
 * CASO 3 (rechazo) — La app no tiene ningún campo de texto libre: los cuatro genotipos
 *   se eligen en <select> con exactamente tres opciones (AA / Aa / aa y BB / Bb / bb),
 *   así que la clase entera de entradas inválidas —«Ab» como genotipo de un gen, cadena
 *   vacía, tres alelos, mayúsculas incoherentes— es inalcanzable por teclado y ratón.
 *   El test fija esa garantía (si alguien añade un input libre, se pone en rojo) y
 *   documenta aparte qué pasa si se fuerza un valor inválido desde el DOM.
 *
 * HALLAZGOS ABIERTOS, escritos como TESTIGO (documentan lo que la app hace HOY; si se
 * reparan, estos bloques fallarán y habrá que invertirlos). NO se corrigen desde el test:
 *   A. La columna «Proporción (%)» del recuento suma 101 % en el dihíbrido clásico:
 *      redondea 6,25 → 6 % y 12,5 → 13 % con Math.round y no muestra decimales.
 *   B. La interpretación de Aa × aa dice «proporción 2:2» — sin simplificar a 1:1 — en
 *      la misma pantalla donde la tarjeta de proporciones ya dice «1 dominante : 1 recesivo».
 *   C. El subtítulo, el <title>, la description y el JSON-LD prometen «trihíbrido
 *      (3 genes)», y la app solo ofrece Monohíbrido y Dihíbrido.
 *   D. Forzar un valor inválido en un <select> desde el DOM deja el desplegable mostrando
 *      «AA» mientras la rejilla calcula con un progenitor «aa» (fallback silencioso).
 *
 * RE-INSPECCIÓN 25/09/2026 (invalidada por df61f210, el enlace de la tarjeta ABO): ver el
 * bloque del final del fichero, con sus casos resueltos a mano y tres hallazgos abiertos.
 */

const RUTA = '/simulador-punnett/';

const CUADRO = 'table[aria-label="Cuadro de Punnett"]';
const RECUENTO = 'table[aria-label="Recuento por genotipo"]';

/** Devuelve la rejilla de Punnett como matriz de textos, fila a fila. */
async function rejilla(page: import('@playwright/test').Page): Promise<string[][]> {
  const filas = page.locator(`${CUADRO} tbody tr`);
  const total = await filas.count();
  const salida: string[][] = [];
  for (let i = 0; i < total; i++) {
    salida.push(await filas.nth(i).locator('td').allInnerTexts());
  }
  return salida;
}

/** Devuelve la tabla de recuento como matriz [genotipo, fenotipo, nº celdas, %]. */
async function recuento(page: import('@playwright/test').Page): Promise<string[][]> {
  const filas = page.locator(`${RECUENTO} tbody tr`);
  const total = await filas.count();
  const salida: string[][] = [];
  for (let i = 0; i < total; i++) {
    salida.push(await filas.nth(i).locator('td').allInnerTexts());
  }
  return salida;
}

/** Texto de una de las dos tarjetas de proporciones (0 = genotípicas, 1 = fenotípicas). */
async function proporcion(page: import('@playwright/test').Page, indice: number): Promise<string> {
  return (await page.locator('[class*="propRatio"]').nth(indice).innerText()).trim();
}

test.describe('Cuadro de Punnett', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Cuadro de Punnett online');
  });

  // ============================================================
  // CASO 1 — Normal: monohíbrido Aa × Aa
  // ============================================================
  test('CASO 1 — Aa × Aa da 1 AA : 2 Aa : 1 aa y fenotipos 3:1', async ({ page }) => {
    await page.selectOption('#p1gA', 'Aa');
    await page.selectOption('#p2gA', 'Aa');

    // Gametos en los ejes: A, a en filas (P1) y A, a en columnas (P2).
    // Calculado a mano: 2.ª ley de Mendel, el heterocigoto produce dos tipos de gameto.
    await expect(page.locator(`${CUADRO} thead th`)).toHaveText(['P1 \\ P2', 'A', 'a']);
    await expect(page.locator(`${CUADRO} tbody th`)).toHaveText(['A', 'a']);

    // Rejilla resuelta a mano. Clave: la celda a×A se escribe «Aa», NO «aA»: es el mismo
    // genotipo heterocigoto y contarlo aparte estropearía el recuento.
    expect(await rejilla(page)).toEqual([
      ['AA', 'Aa'],
      ['Aa', 'aa'],
    ]);

    // Proporciones a mano: genotípica 1:2:1 · fenotípica 3:1 (AA y Aa comparten fenotipo).
    expect(await proporcion(page, 0)).toBe('1 AA : 2 Aa : 1 aa');
    expect(await proporcion(page, 1)).toBe('3 dominante : 1 recesivo');

    // Recuento a mano: 1/4 = 25 %, 2/4 = 50 %, 1/4 = 25 %. Suman 100 %.
    expect(await recuento(page)).toEqual([
      ['AA', 'Dominante (A_)', '1', '25 %'],
      ['Aa', 'Dominante (A_)', '2', '50 %'],
      ['aa', 'Recesivo (aa)', '1', '25 %'],
    ]);

    await expect(page.locator('[class*="interpretacionText"]')).toContainText(
      'El 75 % de la descendencia mostrará el fenotipo dominante y el 25 % el fenotipo recesivo (proporción 3:1).',
    );
  });

  test('CASO 1bis — AA × aa da el 100 % de F1 heterocigota (1.ª ley)', async ({ page }) => {
    await page.selectOption('#p1gA', 'AA');
    await page.selectOption('#p2gA', 'aa');

    // A mano: gametos A,A × a,a → las cuatro celdas son Aa. Uniformidad de la F1.
    expect(await rejilla(page)).toEqual([
      ['Aa', 'Aa'],
      ['Aa', 'Aa'],
    ]);
    expect(await proporcion(page, 0)).toBe('1 Aa');
    expect(await recuento(page)).toEqual([['Aa', 'Dominante (A_)', '4', '100 %']]);
    await expect(page.locator('[class*="interpretacionText"]')).toContainText(
      'El 100 % de la descendencia mostrará el fenotipo dominante (ningún individuo recesivo).',
    );
  });

  // ============================================================
  // CASO 2 — Límite: dihíbrido AaBb × AaBb (9:3:3:1)
  // ============================================================
  test('CASO 2 — AaBb × AaBb da 16 celdas y la proporción fenotípica 9:3:3:1', async ({ page }) => {
    await page.getByRole('button', { name: 'Dihíbrido (2 genes)' }).click();
    await page.selectOption('#p1gA', 'Aa');
    await page.selectOption('#p1gB', 'Bb');
    await page.selectOption('#p2gA', 'Aa');
    await page.selectOption('#p2gB', 'Bb');

    // Gametos a mano (3.ª ley, distribución independiente): AB, Ab, aB, ab en cada eje.
    // Es el punto donde más falla este tipo de simulador: si generase A, a, B, b la
    // rejilla saldría de 16 celdas igualmente, pero con genotipos imposibles.
    await expect(page.locator(`${CUADRO} thead th`)).toHaveText([
      'P1 \\ P2',
      'AB',
      'Ab',
      'aB',
      'ab',
    ]);
    await expect(page.locator(`${CUADRO} tbody th`)).toHaveText(['AB', 'Ab', 'aB', 'ab']);

    // Rejilla de 16 resuelta a mano, locus a locus y con la mayúscula siempre delante.
    expect(await rejilla(page)).toEqual([
      ['AABB', 'AABb', 'AaBB', 'AaBb'],
      ['AABb', 'AAbb', 'AaBb', 'Aabb'],
      ['AaBB', 'AaBb', 'aaBB', 'aaBb'],
      ['AaBb', 'Aabb', 'aaBb', 'aabb'],
    ]);

    // Recuento fenotípico a mano: A_B_ = 9 · A_bb = 3 · aaB_ = 3 · aabb = 1.
    expect(await proporcion(page, 1)).toBe(
      '9 dominante-dominante : 3 dominante-recesivo : 3 recesivo-dominante : 1 recesivo-recesivo',
    );

    // Recuento genotípico a mano (suma 16): 1:2:2:4:1:2:1:2:1.
    expect(await proporcion(page, 0)).toBe(
      '1 AABB : 2 AABb : 2 AaBB : 4 AaBb : 1 AAbb : 2 Aabb : 1 aaBB : 2 aaBb : 1 aabb',
    );

    // Porcentajes fenotípicos: 9/16 = 56,25 % · 3/16 = 18,75 % · 1/16 = 6,25 %.
    // Hasta el 25/09/2026 esta línea fijaba la salida defectuosa (enteros y «%» pegado,
    // 56/19/19/6); reparada con el hallazgo 1668, ahora exige los valores exactos.
    await expect(page.locator('[class*="interpretacionText"]')).toContainText(
      'De las 16 combinaciones: 9 (56,25 %) dominante-dominante, 3 (18,75 %) dominante-recesivo, 3 (18,75 %) recesivo-dominante, 1 (6,25 %) recesivo-recesivo.',
    );
  });

  test('CASO 2bis — el botón «Dihíbrido clásico» carga el cruce AaBb × AaBb entero', async ({
    page,
  }) => {
    // El escenario predefinido debe cambiar el tipo de herencia Y los cuatro genotipos.
    await page.getByRole('button', { name: /Dihíbrido clásico/ }).click();
    await expect(page.getByRole('button', { name: 'Dihíbrido (2 genes)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await proporcion(page, 1)).toBe(
      '9 dominante-dominante : 3 dominante-recesivo : 3 recesivo-dominante : 1 recesivo-recesivo',
    );
  });

  // ============================================================
  // CASO 3 — Rechazo: la app no admite genotipos inválidos
  // ============================================================
  test('CASO 3 — no hay forma de teclear un genotipo inválido', async ({ page }) => {
    // Ningún campo de texto libre en la página: ni «Ab», ni cadena vacía, ni «AAa»
    // pueden llegar al motor por la vía del usuario.
    expect(await page.locator('input[type="text"], textarea').count()).toBe(0);

    // Gen A: exactamente AA / Aa / aa en los dos progenitores.
    await expect(page.locator('#p1gA option')).toHaveText(['AA', 'Aa', 'aa']);
    await expect(page.locator('#p2gA option')).toHaveText(['AA', 'Aa', 'aa']);

    // Gen B: exactamente BB / Bb / bb, y solo visible en modo dihíbrido.
    await expect(page.locator('#p1gB')).toHaveCount(0);
    await page.getByRole('button', { name: 'Dihíbrido (2 genes)' }).click();
    await expect(page.locator('#p1gB option')).toHaveText(['BB', 'Bb', 'bb']);
    await expect(page.locator('#p2gB option')).toHaveText(['BB', 'Bb', 'bb']);
  });

  // ============================================================
  // TESTIGOS de los hallazgos abiertos (ver cabecera)
  // ============================================================
  test('REPARADO 11/09 (751) — la columna «Proporción (%)» suma 100 % y da los valores exactos', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Dihíbrido clásico/ }).click();
    const filas = await recuento(page);

    // A mano: 1/16 = 6,25 % y 2/16 = 12,5 %. Con Math.round y sin decimales la app escribía
    // «6%» y «13%» —Math.round(12,5) redondea hacia arriba— y la columna sumaba 101 % en el
    // caso de aula por excelencia de esta app, que además pide al alumno «verifica siempre el
    // recuento: si la suma no coincide, has cometido un error».
    expect(filas.map(f => f[3])).toEqual([
      '6,25 %', // AABB
      '12,5 %', // AABb
      '12,5 %', // AaBB
      '25 %',   // AaBb
      '6,25 %', // AAbb
      '12,5 %', // Aabb
      '6,25 %', // aaBB
      '12,5 %', // aaBb
      '6,25 %', // aabb
    ]);

    const suma = filas.reduce(
      (acc, f) => acc + Number(f[3].replace(' %', '').replace(',', '.')),
      0,
    );
    expect(suma).toBeCloseTo(100, 6);
  });

  test('REPARADO 11/09 (752) — Aa × aa se interpreta como «proporción 1:1», ya simplificada', async ({
    page,
  }) => {
    // Es uno de los cinco escenarios de un clic: «Portador × Recesivo (Aa×aa)».
    await page.getByRole('button', { name: /Portador × Recesivo/ }).click();

    // La tarjeta de proporciones SÍ simplifica (formatRatio divide por el mcd).
    expect(await proporcion(page, 1)).toBe('1 dominante : 1 recesivo');

    // Y la interpretación de debajo también, que antes imprimía los conteos crudos: el bloque
    // educativo de la misma página enseña «Aa × aa → 1 dom : 1 rec (1:1)» y el paso 5 pide
    // «expresa como razón simplificada», así que un alumno copiaba «2:2» a su examen.
    await expect(page.locator('[class*="interpretacionText"]')).toContainText('(proporción 1:1)');
  });

  test('REPARADO 11/09 (750) — no se promete un trihíbrido que la herramienta no hace', async ({ page }) => {
    // El subtítulo del hero anuncia exactamente lo que hay...
    const subtitulo = page.locator('[class*="subtitle"]').first();
    await expect(subtitulo).toContainText('monohíbrido (1 gen) y dihíbrido (2 genes)');
    await expect(subtitulo).not.toContainText('trihíbrido');

    // ...y el selector de tipo de herencia solo ofrece dos opciones.
    const tipos = page.locator('[role="group"][aria-label="Tipo de herencia"] button');
    await expect(tipos).toHaveCount(2);
    await expect(tipos).toHaveText([
      /Monohíbrido \(1 gen\)/,
      /Dihíbrido \(2 genes\)/,
    ]);

    // Tampoco hay selector para un tercer gen en el modo más completo.
    await page.getByRole('button', { name: 'Dihíbrido (2 genes)' }).click();
    await expect(page.locator('#p1gC')).toHaveCount(0);
    await expect(page.locator('#p2gC')).toHaveCount(0);
  });

  test('REPARADO 11/09 (754) — un valor inválido forzado en el <select> no entra en el estado', async ({
    page,
  }) => {
    await page.selectOption('#p1gA', 'AA');
    await page.selectOption('#p2gA', 'AA');
    expect(await rejilla(page)).toEqual([
      ['AA', 'AA'],
      ['AA', 'AA'],
    ]);

    // Vía NO alcanzable por teclado ni ratón: se escribe el valor con el setter nativo,
    // como haría una extensión o un script. El navegador rechaza el valor (el desplegable
    // se queda en AA) y el evento change llega a React con la cadena vacía, que hasta el
    // 11/09/2026 se casteaba a ciegas y hacía caer a `gametosMonohibrido` en su
    // `return ['a','a']` final: la rejilla pasaba a calcularse con un P1 homocigoto
    // recesivo mientras el desplegable seguía enseñando AA (hallazgo 754).
    const valorVisible = await page.evaluate(() => {
      const sel = document.querySelector<HTMLSelectElement>('#p1gA');
      if (!sel) return 'sin select';
      const setterNativo = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        'value',
      )?.set;
      setterNativo?.call(sel, 'Ab');
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      return sel.value;
    });

    // El desplegable sigue diciendo AA...
    expect(valorVisible).toBe('AA');
    // ...y la rejilla también: lo que no se reconoce no entra en el estado, así que se
    // mantiene el valor anterior y lo que se ve sigue siendo lo que se calcula.
    await expect(page.locator(`${CUADRO} tbody th`)).toHaveText(['A', 'A']);
    expect(await rejilla(page)).toEqual([
      ['AA', 'AA'],
      ['AA', 'AA'],
    ]);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN 25/09/2026 — vuelve a la cola INVALIDADA por df61f210 (24/09), que añadió a
 * la tarjeta ABO del bloque educativo un enlace al Simulador de Genética Mendeliana.
 *
 * Casos resueltos A MANO antes de abrir el navegador. Gametos en el orden en que los genera
 * la app (para cada alelo del gen A, cada alelo del gen B); P1 en filas y P2 en columnas.
 *
 * CASO 4 (normal) — cruce de prueba dihíbrido AaBb × aabb.
 *   Gametos P1: AB, Ab, aB, ab · P2 (aabb): ab, ab, ab, ab.
 *   Fila AB → AaBb ×4 · Ab → Aabb ×4 · aB → aaBb ×4 · ab → aabb ×4.
 *   Genotípica 4:4:4:4 = 1 AaBb : 1 Aabb : 1 aaBb : 1 aabb · fenotípica 1:1:1:1, 25 % cada una.
 *
 * CASO 5 (normal) — AaBb × AaBB.
 *   Gametos P2 (AaBB): AB, AB, aB, aB.
 *   Por loci: Aa × Aa = 1 AA : 2 Aa : 1 aa · Bb × BB = 1 BB : 1 Bb. Producto sobre 16:
 *   AABB 2 · AaBB 4 · AABb 2 · AaBb 4 · aaBB 2 · aaBb 2 → simplificada 1:2:1:2:1:1.
 *   Fenotípica: todo es B_, así que A_B_ 12 : aaB_ 4 = 3:1. Porcentajes 12,5 % y 25 %.
 *
 * CASO 6 (límite) — homocigotos. AA × Aa: gametos A, A × A, a → 2 AA : 2 Aa = 1:1, 100 %
 *   dominante. aa × aa: 4 aa, 100 % recesivo. CASO 6bis: AABB × aabb → las 16 celdas AaBb
 *   (1.ª ley también en dihíbrido).
 *
 * CASO 7 (límite) — AaBb × Aabb, el que destapa el redondeo del «Resultado:».
 *   Gametos P2 (Aabb): Ab, Ab, ab, ab.
 *   Fila AB → AABb, AABb, AaBb, AaBb · fila Ab → AAbb, AAbb, Aabb, Aabb
 *   Fila aB → AaBb, AaBb, aaBb, aaBb · fila ab → Aabb, Aabb, aabb, aabb
 *   Genotípica: AABb 2 · AaBb 4 · AAbb 2 · Aabb 4 · aaBb 2 · aabb 2 → 1:2:1:2:1:1
 *   Fenotípica: A_B_ 6 · A_bb 6 · aaB_ 2 · aabb 2 → 3:3:1:1
 *   Porcentajes EXACTOS: 37,5 % + 37,5 % + 12,5 % + 12,5 % = 100 %.
 *
 * Dominancia incompleta y codominancia: la app NO las ofrece (solo dominancia completa y
 *   dos modos, ver el test 750). La tarjeta ABO manda al Simulador de Genética, y eso es lo
 *   que se verifica en el test ENLACE.
 *
 * CASO 8 (rechazo) — una <option> INYECTADA que el navegador sí acepta (distinto del test
 *   754, donde el navegador rechazaba el valor y React recibía cadena vacía): «AAa» en el gen
 *   A de P1 y «Bx» en el gen B de P2. Esperado: no entra en el estado, React repone el
 *   desplegable al valor anterior y la rejilla no cambia.
 *
 * ENLACE df61f210 — Iᴬi × Iᴮi a mano: gametos Iᴬ, i × Iᴮ, i → IᴬIᴮ (grupo AB), Iᴬi (A),
 *   Iᴮi (B), ii (O): cuatro grupos a 1/4 = 1:1:1:1, como dice la tarjeta.
 *
 * REPARADOS el 25/09/2026 (eran test.fail; hoy son de regresión):
 *   A. El «Resultado:» del dihíbrido redondea a entero y pega el «%»: AaBb × Aabb dice
 *      38 % + 38 % + 13 % + 13 % = 102 %, y AaBb × AaBb 56/19/19/6 en vez de
 *      56,25/18,75/18,75/6,25. Es el defecto de 751/755, que sobrevive en interpretarDihibrido.
 *   B. El caso literal del hallazgo 755 sigue en pie: la fila AA × aa de la tabla educativa
 *      escribe «100 % Aa» junto a «100% portadores», y el resto del bloque, «25% (aa)».
 *   C. Las cabeceras de las dos tablas ponen texto blanco sobre var(--primary, #2E86AB):
 *      4,11:1 en claro y 2,79:1 en oscuro, por debajo de 4,5:1. El candado
 *      check:contraste-cabeceras no lo ve: su regex exige `var(--primary)` SIN fallback.
 *      Reparado: `.punnettHeader` y `.tabla th` pasan a `var(--primary-boton)` (5,47:1).
 *   D. (1671) La tarjeta de esta app en los RelatedApps de simulador-genetica la describía
 *      «(EBAU/Bachillerato)», términos España-only (regla 1.bis). Reparado en app-relations.ts.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

const RESULTADO = '[class*="interpretacionText"]';
const ENLACE_ABO = 'Crúzalo en el Simulador de Genética Mendeliana';

/** Monta un cruce desde la interfaz, como lo haría el alumno. */
async function montarCruce(
  page: import('@playwright/test').Page,
  tipo: 'mono' | 'di',
  gA: [string, string],
  gB?: [string, string],
): Promise<void> {
  await page
    .getByRole('button', { name: tipo === 'mono' ? 'Monohíbrido (1 gen)' : 'Dihíbrido (2 genes)' })
    .click();
  await page.selectOption('#p1gA', gA[0]);
  await page.selectOption('#p2gA', gA[1]);
  if (tipo === 'di' && gB) {
    await page.selectOption('#p1gB', gB[0]);
    await page.selectOption('#p2gB', gB[1]);
  }
}

/** Contraste WCAG entre el texto de un elemento y su fondo propio (opaco en estas tablas). */
async function contrasteDe(locator: import('@playwright/test').Locator): Promise<number> {
  return locator.evaluate((el) => {
    const canal = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (css: string) => {
      const [r, g, b] = (css.match(/[\d.]+/g) ?? []).map(Number);
      return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
    };
    const cs = getComputedStyle(el);
    const a = lum(cs.color);
    const b = lum(cs.backgroundColor);
    return +((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2);
  });
}

/** La rejilla del CASO 7 (AaBb × Aabb), resuelta a mano en la cabecera de este bloque. */
const REJILLA_CASO_7 = [
  ['AABb', 'AABb', 'AaBb', 'AaBb'],
  ['AAbb', 'AAbb', 'Aabb', 'Aabb'],
  ['AaBb', 'AaBb', 'aaBb', 'aaBb'],
  ['Aabb', 'Aabb', 'aabb', 'aabb'],
];

test.describe('Cuadro de Punnett · re-inspección 25/09/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
  });

  test('CASO 4 — cruce de prueba AaBb × aabb: 1:1:1:1 en genotipos y en fenotipos', async ({ page }) => {
    await montarCruce(page, 'di', ['Aa', 'aa'], ['Bb', 'bb']);

    // Gametos a mano: P1 AB, Ab, aB, ab · P2 (aabb) cuatro veces ab.
    await expect(page.locator(`${CUADRO} thead th`)).toHaveText(['P1 \\ P2', 'ab', 'ab', 'ab', 'ab']);
    await expect(page.locator(`${CUADRO} tbody th`)).toHaveText(['AB', 'Ab', 'aB', 'ab']);
    expect(await rejilla(page)).toEqual([
      ['AaBb', 'AaBb', 'AaBb', 'AaBb'],
      ['Aabb', 'Aabb', 'Aabb', 'Aabb'],
      ['aaBb', 'aaBb', 'aaBb', 'aaBb'],
      ['aabb', 'aabb', 'aabb', 'aabb'],
    ]);

    // 4:4:4:4 simplificado por el mcd, que es 4.
    expect(await proporcion(page, 0)).toBe('1 AaBb : 1 Aabb : 1 aaBb : 1 aabb');
    expect(await proporcion(page, 1)).toBe(
      '1 dominante-dominante : 1 dominante-recesivo : 1 recesivo-dominante : 1 recesivo-recesivo',
    );

    // 4/16 = 25 % cada fila.
    expect(await recuento(page)).toEqual([
      ['AaBb', 'Doble dominante (A_B_)', '4', '25 %'],
      ['Aabb', 'Dom. A / Rec. B (A_bb)', '4', '25 %'],
      ['aaBb', 'Rec. A / Dom. B (aaB_)', '4', '25 %'],
      ['aabb', 'Doble recesivo (aabb)', '4', '25 %'],
    ]);

    // Los conteos del «Resultado:». El formato del porcentaje es el hallazgo A, así que aquí se
    // admite con espacio y sin él: este test mide los conteos, no el formato.
    await expect(page.locator(RESULTADO)).toHaveText(
      /De las 16 combinaciones: 4 \(25 ?%\) dominante-dominante, 4 \(25 ?%\) dominante-recesivo, 4 \(25 ?%\) recesivo-dominante, 4 \(25 ?%\) recesivo-recesivo\./,
    );
  });

  test('CASO 5 — AaBb × AaBB: genotípica 1:2:1:2:1:1 y fenotípica 3:1, sumando 100 %', async ({ page }) => {
    await montarCruce(page, 'di', ['Aa', 'Aa'], ['Bb', 'BB']);

    // Gametos de AaBB a mano: AB, AB, aB, aB (el gen B solo aporta B).
    await expect(page.locator(`${CUADRO} thead th`)).toHaveText(['P1 \\ P2', 'AB', 'AB', 'aB', 'aB']);
    expect(await rejilla(page)).toEqual([
      ['AABB', 'AABB', 'AaBB', 'AaBB'],
      ['AABb', 'AABb', 'AaBb', 'AaBb'],
      ['AaBB', 'AaBB', 'aaBB', 'aaBB'],
      ['AaBb', 'AaBb', 'aaBb', 'aaBb'],
    ]);

    // Conteos a mano 2:4:2:4:2:2 → entre 2; fenotípica 12:4 → entre 4.
    expect(await proporcion(page, 0)).toBe('1 AABB : 2 AaBB : 1 AABb : 2 AaBb : 1 aaBB : 1 aaBb');
    expect(await proporcion(page, 1)).toBe('3 dominante-dominante : 1 recesivo-dominante');

    // 2/16 = 12,5 % y 4/16 = 25 %.
    const filas = await recuento(page);
    expect(filas).toEqual([
      ['AABB', 'Doble dominante (A_B_)', '2', '12,5 %'],
      ['AaBB', 'Doble dominante (A_B_)', '4', '25 %'],
      ['AABb', 'Doble dominante (A_B_)', '2', '12,5 %'],
      ['AaBb', 'Doble dominante (A_B_)', '4', '25 %'],
      ['aaBB', 'Rec. A / Dom. B (aaB_)', '2', '12,5 %'],
      ['aaBb', 'Rec. A / Dom. B (aaB_)', '2', '12,5 %'],
    ]);
    expect(filas.reduce((acc, f) => acc + Number(f[2]), 0)).toBe(16);
    const suma = filas.reduce((acc, f) => acc + Number(f[3].replace(' %', '').replace(',', '.')), 0);
    expect(suma).toBeCloseTo(100, 6);
  });

  test('CASO 6 — homocigotos: AA × Aa da 100 % dominante y aa × aa, 100 % recesivo', async ({ page }) => {
    await montarCruce(page, 'mono', ['AA', 'Aa']);
    // A mano: gametos A, A × A, a → cada fila es AA, Aa.
    expect(await rejilla(page)).toEqual([
      ['AA', 'Aa'],
      ['AA', 'Aa'],
    ]);
    expect(await proporcion(page, 0)).toBe('1 AA : 1 Aa');
    expect(await proporcion(page, 1)).toBe('1 dominante');
    expect(await recuento(page)).toEqual([
      ['AA', 'Dominante (A_)', '2', '50 %'],
      ['Aa', 'Dominante (A_)', '2', '50 %'],
    ]);
    await expect(page.locator(RESULTADO)).toContainText(
      'El 100 % de la descendencia mostrará el fenotipo dominante (ningún individuo recesivo).',
    );

    await montarCruce(page, 'mono', ['aa', 'aa']);
    // A mano: a, a × a, a → las cuatro celdas aa.
    expect(await rejilla(page)).toEqual([
      ['aa', 'aa'],
      ['aa', 'aa'],
    ]);
    expect(await recuento(page)).toEqual([['aa', 'Recesivo (aa)', '4', '100 %']]);
    await expect(page.locator(RESULTADO)).toContainText(
      'El 100 % de la descendencia mostrará el fenotipo recesivo.',
    );
  });

  test('CASO 6bis — AABB × aabb: las 16 celdas AaBb (1.ª ley en dihíbrido)', async ({ page }) => {
    await montarCruce(page, 'di', ['AA', 'aa'], ['BB', 'bb']);
    // A mano: P1 solo produce AB y P2 solo ab → todas AaBb.
    expect(await rejilla(page)).toEqual(Array.from({ length: 4 }, () => ['AaBb', 'AaBb', 'AaBb', 'AaBb']));
    expect(await proporcion(page, 0)).toBe('1 AaBb');
    expect(await recuento(page)).toEqual([['AaBb', 'Doble dominante (A_B_)', '16', '100 %']]);
  });

  test('CASO 7 — AaBb × Aabb: rejilla, 3:3:1:1 y recuento exacto que suma 100 %', async ({ page }) => {
    await montarCruce(page, 'di', ['Aa', 'Aa'], ['Bb', 'bb']);

    await expect(page.locator(`${CUADRO} thead th`)).toHaveText(['P1 \\ P2', 'Ab', 'Ab', 'ab', 'ab']);
    expect(await rejilla(page)).toEqual(REJILLA_CASO_7);
    expect(await proporcion(page, 0)).toBe('1 AABb : 2 AaBb : 1 AAbb : 2 Aabb : 1 aaBb : 1 aabb');
    expect(await proporcion(page, 1)).toBe(
      '3 dominante-dominante : 3 dominante-recesivo : 1 recesivo-dominante : 1 recesivo-recesivo',
    );
    const filas = await recuento(page);
    expect(filas).toEqual([
      ['AABb', 'Doble dominante (A_B_)', '2', '12,5 %'],
      ['AaBb', 'Doble dominante (A_B_)', '4', '25 %'],
      ['AAbb', 'Dom. A / Rec. B (A_bb)', '2', '12,5 %'],
      ['Aabb', 'Dom. A / Rec. B (A_bb)', '4', '25 %'],
      ['aaBb', 'Rec. A / Dom. B (aaB_)', '2', '12,5 %'],
      ['aabb', 'Doble recesivo (aabb)', '2', '12,5 %'],
    ]);
    const suma = filas.reduce((acc, f) => acc + Number(f[3].replace(' %', '').replace(',', '.')), 0);
    expect(suma).toBeCloseTo(100, 6);
    // Los CONTEOS del «Resultado:» (6, 6, 2, 2) sí son correctos; sus porcentajes, no (hallazgo A).
    await expect(page.locator(RESULTADO)).toHaveText(
      /6 \([\d,]+ ?%\) dominante-dominante, 6 \([\d,]+ ?%\) dominante-recesivo, 2 \([\d,]+ ?%\) recesivo-dominante, 2 \([\d,]+ ?%\) recesivo-recesivo\./,
    );
  });

  test('CASO 8 — una <option> inyectada que el navegador acepta no entra en el estado', async ({ page }) => {
    await montarCruce(page, 'mono', ['AA', 'AA']);
    // Vía NO alcanzable por teclado ni ratón: se añade al <select> una opción que la app no
    // ofrece y se elige. A diferencia del test 754, aquí el navegador SÍ acepta el valor, así
    // que el evento change llega a React con «AAa» y no con cadena vacía.
    await page.locator('#p1gA').evaluate((sel) => {
      const opcion = document.createElement('option');
      opcion.value = 'AAa';
      opcion.textContent = 'AAa';
      sel.appendChild(opcion);
    });
    await page.selectOption('#p1gA', 'AAa');
    // El type guard lo descarta y React repone el desplegable controlado al valor del estado.
    await expect(page.locator('#p1gA')).toHaveValue('AA');
    expect(await rejilla(page)).toEqual([
      ['AA', 'AA'],
      ['AA', 'AA'],
    ]);

    // Lo mismo en el gen B, en dihíbrido: AABB × AABB → 16 celdas AABB antes y después.
    await montarCruce(page, 'di', ['AA', 'AA'], ['BB', 'BB']);
    await page.locator('#p2gB').evaluate((sel) => {
      const opcion = document.createElement('option');
      opcion.value = 'Bx';
      opcion.textContent = 'Bx';
      sel.appendChild(opcion);
    });
    await page.selectOption('#p2gB', 'Bx');
    await expect(page.locator('#p2gB')).toHaveValue('BB');
    await expect(page.locator(`${CUADRO} thead th`)).toHaveText(['P1 \\ P2', 'AB', 'AB', 'AB', 'AB']);
    expect(await rejilla(page)).toEqual(Array.from({ length: 4 }, () => ['AABB', 'AABB', 'AABB', 'AABB']));
  });

  test('ENLACE df61f210 — la tarjeta ABO lleva a Humanos → Grupo sanguíneo ABO, donde Iᴬi × Iᴮi da 1:1:1:1', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const enlace = page.getByRole('link', { name: ENLACE_ABO });
    await expect(enlace).toHaveCount(1);
    await expect(enlace).toHaveAttribute('href', '/simulador-genetica/');
    await expect(enlace).toBeVisible();

    // La tarjeta nombra el camino y pone el ejemplo; 753 (codominancia bien enunciada) sigue.
    const tarjeta = page.locator('[class*="scenarioCard"]').filter({ has: enlace });
    await expect(tarjeta).toContainText('(Humanos → Grupo sanguíneo ABO), también junto al factor Rh.');
    await expect(tarjeta).toContainText('produce grupos A, B, AB y O en proporción 1:1:1:1');
    await expect(tarjeta).toContainText('son codominantes entre sí');

    await enlace.click();
    await expect(page).toHaveURL(/\/simulador-genetica\/$/);
    await esperarPaginaAsentada(page);

    // El camino existe tal cual lo escribe la tarjeta: Humanos → «Grupo sanguíneo ABO».
    await page.getByRole('button', { name: /Humanos/ }).click();
    const rasgo = page.locator('select[class*="select"]').first();
    await expect(rasgo.locator('option', { hasText: 'Grupo sanguíneo ABO' })).toHaveCount(1);
    await rasgo.selectOption({ label: 'Grupo sanguíneo ABO' });

    // Se plantea el cruce del ejemplo de la tarjeta, Iᴬi × Iᴮi (en el motor, AO × BO).
    const padres = page.locator('[class*="genotypeSelect"]');
    await padres.nth(0).selectOption('AO');
    await padres.nth(1).selectOption('BO');
    await expect(padres.nth(0).locator('option:checked')).toHaveText('Iᴬi');
    await expect(padres.nth(1).locator('option:checked')).toHaveText('Iᴮi');
    await page.getByRole('button', { name: /Realizar Cruce/ }).click();

    // A mano: columnas Iᴬ, i (padre) × filas Iᴮ, i (madre) → IᴬIᴮ, Iᴮi, Iᴬi, ii.
    await expect(page.locator('[class*="cellGenotype"]')).toHaveText(['IᴬIᴮ', 'Iᴮi', 'Iᴬi', 'ii']);
    await expect(page.locator('[class*="cellPhenotype"]')).toHaveText([
      'Grupo AB',
      'Grupo B',
      'Grupo A',
      'Grupo O',
    ]);
    // 1/4 cada celda. El formato del % es cosa de simulador-genetica; aquí se mide el valor.
    await expect(page.locator('[class*="cellProbability"]')).toHaveText([
      /^25(,0)? ?%$/,
      /^25(,0)? ?%$/,
      /^25(,0)? ?%$/,
      /^25(,0)? ?%$/,
    ]);
    await page.getByRole('tab', { name: 'Estadísticas', exact: true }).click();
    await expect(
      page.locator('[class*="ratioSummary"]').filter({ hasText: 'Grupo AB' }),
    ).toContainText('1:1:1:1');

    // «También junto al factor Rh»: el dihíbrido admite el Rh como segunda característica.
    await page.getByRole('button', { name: 'Dihíbrido', exact: true }).click();
    await expect(
      page.locator('select[class*="select"]').nth(1).locator('option', { hasText: 'Factor Rh' }),
    ).toHaveCount(1);
  });

  // ============================================================
  // REPARADOS el 25/09/2026 (hallazgos 1668-1671; eran `test.fail`, ver la cabecera del bloque)
  // ============================================================
  test('REPARADO 25/09 (1668) — el «Resultado:» del dihíbrido da los % exactos: AaBb × Aabb suma 100 %', async ({
    page,
  }) => {
    await montarCruce(page, 'di', ['Aa', 'Aa'], ['Bb', 'bb']);
    // A mano (CASO 7): 6/16 = 37,5 % · 6/16 = 37,5 % · 2/16 = 12,5 % · 2/16 = 12,5 %. Debería
    // decirlo con los decimales exactos y el espacio del formato español, como ya lo dice la
    // tabla de recuento de la misma pantalla (aaBb, único genotipo aaB_, «12,5 %»).
    await expect(page.locator(RESULTADO)).toContainText(
      'De las 16 combinaciones: 6 (37,5 %) dominante-dominante, 6 (37,5 %) dominante-recesivo, 2 (12,5 %) recesivo-dominante, 2 (12,5 %) recesivo-recesivo.',
      { timeout: 2000 },
    );
    // Y el dihíbrido clásico, a mano: 9/16 = 56,25 % · 3/16 = 18,75 % · 1/16 = 6,25 %.
    await montarCruce(page, 'di', ['Aa', 'Aa'], ['Bb', 'Bb']);
    await expect(page.locator(RESULTADO)).toContainText(
      'De las 16 combinaciones: 9 (56,25 %) dominante-dominante, 3 (18,75 %) dominante-recesivo, 3 (18,75 %) recesivo-dominante, 1 (6,25 %) recesivo-recesivo.',
      { timeout: 2000 },
    );
  });

  test('REPARADO 25/09 (1669) — la tabla educativa escribe «100 % portadores», con el espacio (755)', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    // A mano: AA × aa → gametos A × a → las 4 celdas Aa → 100 % Aa, 100 % portadores.
    const filaAAxaa = page.locator('table[aria-label="Cruces y proporciones"] tbody tr').nth(3);
    await expect(filaAAxaa.locator('td')).toHaveText(
      ['AA × aa', '100 % Aa', '100 % dominante', '100 % portadores'],
      { timeout: 2000 },
    );
    // Y en el resto del bloque, ningún porcentaje pegado a su número («25% (aa)», «El 50%…»).
    for (const zona of ['table[aria-label="Cruces y proporciones"]', '[class*="scenariosGrid"]', '[class*="warningBox"]']) {
      await expect(page.locator(zona)).not.toContainText(/\d%/, { timeout: 2000 });
    }
  });

  test('REPARADO 25/09 (1670) — las cabeceras de tabla con texto blanco llegan a 4,5:1 en claro y en oscuro', async ({
    page,
  }) => {
    // Sin transiciones: en oscuro, medir durante la animación da un color intermedio.
    await page.addStyleTag({
      content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
    });
    // «A»: gameto en la cabecera del cuadro, 17,6 px en negrita (no llega a «texto grande»,
    // 18,66 px en negrita). «Genotipo»: cabecera del recuento, 14,72 px en negrita.
    const gameto = page.locator(`${CUADRO} thead th`).nth(1);
    const genotipo = page.locator(`${RECUENTO} thead th`).first();
    expect(await contrasteDe(gameto)).toBeGreaterThanOrEqual(4.5);
    expect(await contrasteDe(genotipo)).toBeGreaterThanOrEqual(4.5);

    // Oscuro con el botón real: poner `data-theme` a mano lo pisa el gestor de tema.
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await contrasteDe(gameto)).toBeGreaterThanOrEqual(4.5);
    expect(await contrasteDe(genotipo)).toBeGreaterThanOrEqual(4.5);
  });

  test('REPARADO 25/09 (1671) — la tarjeta de Punnett en simulador-genetica no dice EBAU ni Bachillerato', async ({
    page,
  }) => {
    await page.goto('/simulador-genetica/');
    const tarjeta = page.getByRole('link', { name: 'Ir a Cuadro de Punnett' });
    await expect(tarjeta.first()).toBeVisible();
    await expect(tarjeta.first()).toContainText('educación media');
    await expect(tarjeta.first()).not.toContainText(/EBAU|Bachillerato/);
  });
});

// ============================================================
// Móvil — Pixel 7 enumerado campo a campo (un `...devices[...]` dentro de un describe
// arrastraría `defaultBrowserType` y forzaría un worker nuevo).
// ============================================================
test.describe('Cuadro de Punnett · móvil · re-inspección 25/09/2026', () => {
  test.use({
    viewport: devices['Pixel 7'].viewport,
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test('el dihíbrido AaBb × Aabb cabe sin scroll horizontal y el enlace ABO se abre con el dedo', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    await montarCruce(page, 'di', ['Aa', 'Aa'], ['Bb', 'bb']);

    // La misma rejilla del CASO 7, resuelta a mano.
    expect(await rejilla(page)).toEqual(REJILLA_CASO_7);

    // 5 columnas (esquina + 4 gametos) en 412 px: la página no se desborda.
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);

    await page.getByRole('button', { name: 'Ver guía educativa' }).tap();
    const enlace = page.getByRole('link', { name: ENLACE_ABO });
    await enlace.scrollIntoViewIfNeeded();
    await enlace.tap();
    await expect(page).toHaveURL(/\/simulador-genetica\/$/);
  });
});
