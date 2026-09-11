import { test, expect } from '@playwright/test';

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
      ['AA', 'Dominante (A_)', '1', '25%'],
      ['Aa', 'Dominante (A_)', '2', '50%'],
      ['aa', 'Recesivo (aa)', '1', '25%'],
    ]);

    await expect(page.locator('[class*="interpretacionText"]')).toContainText(
      'El 75% de la descendencia mostrará el fenotipo dominante y el 25% el fenotipo recesivo (proporción 3:1).',
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
    expect(await recuento(page)).toEqual([['Aa', 'Dominante (A_)', '4', '100%']]);
    await expect(page.locator('[class*="interpretacionText"]')).toContainText(
      'El 100% de la descendencia mostrará el fenotipo dominante (ningún individuo recesivo).',
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
    await expect(page.locator('[class*="interpretacionText"]')).toContainText(
      'De las 16 combinaciones: 9 (56%) dominante-dominante, 3 (19%) dominante-recesivo, 3 (19%) recesivo-dominante, 1 (6%) recesivo-recesivo.',
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
  test('TESTIGO A — la columna «Proporción (%)» suma 101 % en el dihíbrido clásico', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Dihíbrido clásico/ }).click();
    const filas = await recuento(page);

    // A mano: 1/16 = 6,25 % y 2/16 = 12,5 %. La app usa Math.round y no muestra decimales,
    // así que escribe 6 % y 13 % (Math.round(12.5) = 13, redondeo hacia arriba).
    expect(filas.map(f => f[3])).toEqual([
      '6%', // AABB — exacto 6,25 %
      '13%', // AABb — exacto 12,5 %
      '13%', // AaBB — exacto 12,5 %
      '25%', // AaBb — exacto 25 %
      '6%', // AAbb — exacto 6,25 %
      '13%', // Aabb — exacto 12,5 %
      '6%', // aaBB — exacto 6,25 %
      '13%', // aaBb — exacto 12,5 %
      '6%', // aabb — exacto 6,25 %
    ]);

    const suma = filas.reduce((acc, f) => acc + parseInt(f[3].replace('%', ''), 10), 0);
    // Esperado: 100. Obtenido hoy: 101. Y el propio bloque educativo pide al alumno
    // «verifica el recuento» y «la suma debe coincidir»: aquí no coincide.
    expect(suma).toBe(101);
  });

  test('TESTIGO B — Aa × aa se interpreta como «proporción 2:2» en vez de 1:1', async ({
    page,
  }) => {
    // Es uno de los cinco escenarios de un clic: «Portador × Recesivo (Aa×aa)».
    await page.getByRole('button', { name: /Portador × Recesivo/ }).click();

    // La tarjeta de proporciones SÍ simplifica (formatRatio divide por el mcd).
    expect(await proporcion(page, 1)).toBe('1 dominante : 1 recesivo');

    // La interpretación de debajo NO: imprime los conteos crudos (2 y 2). El bloque
    // educativo de la misma página enseña «Aa × aa → 1 dom : 1 rec (1:1)» y el paso 5
    // pide «expresa como razón simplificada».
    await expect(page.locator('[class*="interpretacionText"]')).toContainText('(proporción 2:2)');
  });

  test('TESTIGO C — se promete «trihíbrido (3 genes)» y solo hay dos modos', async ({ page }) => {
    // El subtítulo del hero lo anuncia...
    await expect(page.locator('[class*="subtitle"]').first()).toContainText('trihíbrido (3 genes)');

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

  test('TESTIGO D — un valor inválido forzado en el <select> se calcula como «aa»', async ({
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
    // se queda en AA), pero el evento change sí llega a React con la cadena vacía y
    // `gametosMonohibrido` cae en su `return ['a','a']` final.
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
    // ...pero la rejilla ya se calcula con un P1 homocigoto recesivo: gametos a, a.
    // Esperado: rechazo o mantener AA × AA. Obtenido: Aa en las cuatro celdas.
    await expect(page.locator(`${CUADRO} tbody th`)).toHaveText(['a', 'a']);
    expect(await rejilla(page)).toEqual([
      ['Aa', 'Aa'],
      ['Aa', 'Aa'],
    ]);
  });
});
