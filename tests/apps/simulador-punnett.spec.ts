import { test, expect, devices, type Locator, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * stemum.com → el servidor local, para ver la app como la sirve el portal (data-brand="stemum"
 * y la píldora «Stemum › Biología» en la barra fija). Va al NIVEL DEL FICHERO porque
 * `launchOptions` fuerza un worker nuevo; al resto de tests no les afecta: solo resuelve ese host.
 */
test.use({ launchOptions: { args: ['--host-resolver-rules=MAP stemum.com 127.0.0.1:3050'] } });

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
 * HALLAZGOS de esta primera inspección, REPARADOS el 11/09/2026 (54108c4e): nacieron como
 * testigos de lo que la app hacía entonces y hoy son tests de regresión.
 *   A. (751) La columna «Proporción (%)» del recuento sumaba 101 % en el dihíbrido clásico:
 *      redondeaba 6,25 → 6 % y 12,5 → 13 % con Math.round y no mostraba decimales.
 *   B. (752) La interpretación de Aa × aa decía «proporción 2:2» —sin simplificar a 1:1— en
 *      la misma pantalla donde la tarjeta de proporciones ya decía «1 dominante : 1 recesivo».
 *   C. (750) El subtítulo, el <title>, la description y el JSON-LD prometían «trihíbrido
 *      (3 genes)», y la app solo ofrece Monohíbrido y Dihíbrido.
 *   D. (754) Forzar un valor inválido en un <select> desde el DOM dejaba el desplegable
 *      mostrando «AA» mientras la rejilla calculaba con un progenitor «aa» (fallback silencioso).
 *
 * RE-INSPECCIÓN 25/09/2026 (invalidada por df61f210, el enlace de la tarjeta ABO): ver el
 * bloque de más abajo, con sus casos resueltos a mano y los cuatro hallazgos que abrió
 * (1668-1671), reparados ese mismo día.
 *
 * RE-INSPECCIÓN 01/10/2026 (invalidada por 586a4d61 y a1d72a9c, el hueco del hero bajo el logo
 * fijo): bloque del final del fichero, con sus casos a mano, el hero medido y el contraste.
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
      ['AA', 'Dominante (A_)', '1', '25 %'],
      ['Aa', 'Dominante (A_)', '2', '50 %'],
      ['aa', 'Recesivo (aa)', '1', '25 %'],
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
    expect(await recuento(page)).toEqual([['Aa', 'Dominante (A_)', '4', '100 %']]);
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
  // REPARADOS el 11/09/2026 (ver cabecera): eran testigos, hoy son de regresión
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
      '6,25 %', // AABB
      '12,5 %', // AABb
      '12,5 %', // AaBB
      '25 %',   // AaBb
      '6,25 %', // AAbb
      '12,5 %', // Aabb
      '6,25 %', // aaBB
      '12,5 %', // aaBb
      '6,25 %', // aabb
    ]);

    const suma = filas.reduce(
      (acc, f) => acc + Number(f[3].replace(' %', '').replace(',', '.')),
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
 *   A. (1668) El «Resultado:» del dihíbrido redondeaba a entero y pegaba el «%»: AaBb × Aabb
 *      decía 38 % + 38 % + 13 % + 13 % = 102 %, y AaBb × AaBb 56/19/19/6 en vez de
 *      56,25/18,75/18,75/6,25. Era el defecto de 751/755, que sobrevivía en interpretarDihibrido.
 *   B. (1669) El caso literal del hallazgo 755 seguía en pie: la fila AA × aa de la tabla
 *      educativa escribía «100 % Aa» junto a «100% portadores», y el resto del bloque, «25% (aa)».
 *   C. (1670) Las cabeceras de las dos tablas ponían texto blanco sobre var(--primary, #2E86AB):
 *      4,11:1 en claro y 2,79:1 en oscuro, por debajo de 4,5:1. El candado
 *      check:contraste-cabeceras no lo veía: su regex exigía `var(--primary)` SIN fallback.
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
      ['AaBb', 'Doble dominante (A_B_)', '4', '25 %'],
      ['Aabb', 'Dom. A / Rec. B (A_bb)', '4', '25 %'],
      ['aaBb', 'Rec. A / Dom. B (aaB_)', '4', '25 %'],
      ['aabb', 'Doble recesivo (aabb)', '4', '25 %'],
    ]);

    // Los conteos del «Resultado:». El formato del porcentaje fue el hallazgo A (1668, REPARADO
    // el 25/09/2026, con su test propio más abajo): aquí se admite con espacio (normal o duro, 2588) y sin él porque
    // este test mide los conteos, no el formato.
    await expect(page.locator(RESULTADO)).toHaveText(
      /De las 16 combinaciones: 4 \(25\s?%\) dominante-dominante, 4 \(25\s?%\) dominante-recesivo, 4 \(25\s?%\) recesivo-dominante, 4 \(25\s?%\) recesivo-recesivo\./,
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
      ['AABB', 'Doble dominante (A_B_)', '2', '12,5 %'],
      ['AaBB', 'Doble dominante (A_B_)', '4', '25 %'],
      ['AABb', 'Doble dominante (A_B_)', '2', '12,5 %'],
      ['AaBb', 'Doble dominante (A_B_)', '4', '25 %'],
      ['aaBB', 'Rec. A / Dom. B (aaB_)', '2', '12,5 %'],
      ['aaBb', 'Rec. A / Dom. B (aaB_)', '2', '12,5 %'],
    ]);
    expect(filas.reduce((acc, f) => acc + Number(f[2]), 0)).toBe(16);
    const suma = filas.reduce((acc, f) => acc + Number(f[3].replace(' %', '').replace(',', '.')), 0);
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
      ['AA', 'Dominante (A_)', '2', '50 %'],
      ['Aa', 'Dominante (A_)', '2', '50 %'],
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
    expect(await recuento(page)).toEqual([['aa', 'Recesivo (aa)', '4', '100 %']]);
    await expect(page.locator(RESULTADO)).toContainText(
      'El 100 % de la descendencia mostrará el fenotipo recesivo.',
    );
  });

  test('CASO 6bis — AABB × aabb: las 16 celdas AaBb (1.ª ley en dihíbrido)', async ({ page }) => {
    await montarCruce(page, 'di', ['AA', 'aa'], ['BB', 'bb']);
    // A mano: P1 solo produce AB y P2 solo ab → todas AaBb.
    expect(await rejilla(page)).toEqual(Array.from({ length: 4 }, () => ['AaBb', 'AaBb', 'AaBb', 'AaBb']));
    expect(await proporcion(page, 0)).toBe('1 AaBb');
    expect(await recuento(page)).toEqual([['AaBb', 'Doble dominante (A_B_)', '16', '100 %']]);
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
      ['AABb', 'Doble dominante (A_B_)', '2', '12,5 %'],
      ['AaBb', 'Doble dominante (A_B_)', '4', '25 %'],
      ['AAbb', 'Dom. A / Rec. B (A_bb)', '2', '12,5 %'],
      ['Aabb', 'Dom. A / Rec. B (A_bb)', '4', '25 %'],
      ['aaBb', 'Rec. A / Dom. B (aaB_)', '2', '12,5 %'],
      ['aabb', 'Doble recesivo (aabb)', '2', '12,5 %'],
    ]);
    const suma = filas.reduce((acc, f) => acc + Number(f[3].replace(' %', '').replace(',', '.')), 0);
    expect(suma).toBeCloseTo(100, 6);
    // Los CONTEOS del «Resultado:» (6, 6, 2, 2). Sus porcentajes fueron el hallazgo A (1668,
    // REPARADO el 25/09/2026): los vigila el test «REPARADO 25/09 (1668)».
    await expect(page.locator(RESULTADO)).toHaveText(
      /6 \([\d,]+\s?%\) dominante-dominante, 6 \([\d,]+\s?%\) dominante-recesivo, 2 \([\d,]+\s?%\) recesivo-dominante, 2 \([\d,]+\s?%\) recesivo-recesivo\./,
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
    // `\s` y no ` `: desde 75d5db87 (25/09/2026) el % va separado con espacio duro U+00A0.
    await expect(page.locator('[class*="cellProbability"]')).toHaveText([
      /^25(,0)?\s?%$/,
      /^25(,0)?\s?%$/,
      /^25(,0)?\s?%$/,
      /^25(,0)?\s?%$/,
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

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN 01/10/2026 — vuelve a la cola INVALIDADA por dos commits de catálogo sobre el
 * hero: 586a4d61 (27/09, 80 px arriba hasta 768 px: el logo fijo tapaba el título en móvil) y
 * a1d72a9c (28/09, el corte sube a 1023 px por la tableta).
 *
 * Casos resueltos A MANO antes de abrir el navegador (gametos en el orden en que los genera la
 * app: para cada alelo del gen A, cada alelo del gen B; P1 en filas, P2 en columnas):
 *
 * CASO 9 (normal) — AaBb × aaBb.
 *   Gametos P1: AB, Ab, aB, ab · P2 (aaBb): aB, ab, aB, ab.
 *   Fila AB → AaBB, AaBb, AaBB, AaBb · Ab → AaBb, Aabb, AaBb, Aabb
 *   Fila aB → aaBB, aaBb, aaBB, aaBb · ab → aaBb, aabb, aaBb, aabb
 *   Por loci: Aa × aa = 1 Aa : 1 aa · Bb × Bb = 1 BB : 2 Bb : 1 bb. Producto sobre 16:
 *   AaBB 2 · AaBb 4 · Aabb 2 · aaBB 2 · aaBb 4 · aabb 2 → 1:2:1:1:2:1.
 *   Fenotípica: A_B_ 6 · A_bb 2 · aaB_ 6 · aabb 2 → 3:1:3:1 · 37,5 % / 12,5 % / 37,5 % / 12,5 %.
 *
 * CASO 10 (límite) — homocigotos opuestos en los dos genes. AAbb × aaBB: P1 solo da Ab y P2
 *   solo aB → las 16 celdas AaBb, 100 % A_B_ y 0 % de los otros tres fenotipos (la 1.ª ley con
 *   los dominantes repartidos entre los dos padres). aabb × aabb: 16 aabb, 100 % doble recesivo.
 *
 * CASO 11 (rechazo) — no hay campo de texto (CASO 3), así que lo que se intenta es teclear un
 *   genotipo en el desplegable: «bx» con el foco en el gen A de P2 (Aa). Ninguna opción empieza
 *   por «b» ni por «x»: el valor se queda en Aa y la rejilla, en la del Aa × Aa. Y el botón
 *   «Caso aleatorio», diez veces: los gametos de los ejes salen SIEMPRE de lo que dicen los
 *   desplegables (lo que se ve y lo que se calcula no se separan).
 *
 * HERO (lo que invalidó la app) — a 390, 800 y 1280 px ningún punto del texto del h1 queda bajo
 *   la barra fija (logo y botón de tema). Medido el 01/10: h1 desde y = 78 a 390 px (logo hasta
 *   52-53), desde y = 77 a 800 px (logo hasta 77, sin solape) y desde x = 367 a 1280 px (logo
 *   hasta x = 203). En meskeia.com, 0 anchos tapados barriendo de 360 a 1300 px de 4 en 4.
 *   Bajo stemum.com la píldora «Stemum › Biología» es 50 px más ancha (hasta x = 253) y de 1024
 *   a 1044 px pisaba el 🧬 del principio del título (hallazgo 2589, REPARADO el 01/10/2026).
 *
 * SOSPECHA del 28/09 (colores de marca EN LÍNEA, #48A9A6 y #7FB3D3): DESCARTADA para el texto.
 *   En esta app esos colores en línea solo pintan las cuatro manchas de la leyenda (sin texto).
 *   Pero el teal #48A9A6 SÍ pinta texto desde el CSS del módulo: el fondo de las celdas A_bb del
 *   dihíbrido, con el genotipo en blanco a 2,80:1 (2583). Y el contraste medido con el fondo
 *   real dejaba más texto de marca por debajo de 4,5:1 (2584-2586).
 *
 * HALLAZGOS 2583-2589 (abiertos en esta re-inspección), REPARADOS el 01/10/2026: eran test.fail
 *   y hoy son de regresión, con su medida de antes y de después en cada test.
 *
 * .punnettHeader (hallazgo 1670, reparado el 25/09 a mano): sigue en 5,47:1 en los dos temas en
 *   meskeia.com y en 8,72:1 bajo Stemum (--primary-boton es #6B21A8 también en oscuro).
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

/** Selector de un elemento de la app por su clase de CSS Module (el hash cambia, el nombre no). */
const clase = (nombre: string): string => `[class*="${nombre}"]`;

/**
 * Contraste WCAG del texto de un elemento contra el fondo QUE SE VE: mezcla los fondos
 * semitransparentes de los antecesores hasta el primero opaco y aplica la opacidad heredada.
 * `contrasteDe` (más arriba) solo mira el fondo propio, que en un botón transparente es nada.
 */
async function contrasteReal(locator: Locator): Promise<number> {
  return locator.evaluate((el) => {
    interface Rgba { r: number; g: number; b: number; a: number }
    const leer = (css: string): Rgba => {
      const p = (css.match(/[\d.]+/g) ?? []).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const sobre = (arriba: Rgba, abajo: Rgba): Rgba => ({
      r: arriba.r * arriba.a + abajo.r * (1 - arriba.a),
      g: arriba.g * arriba.a + abajo.g * (1 - arriba.a),
      b: arriba.b * arriba.a + abajo.b * (1 - arriba.a),
      a: 1,
    });
    const canal = (c: number): number => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (c: Rgba): number => 0.2126 * canal(c.r) + 0.7152 * canal(c.g) + 0.0722 * canal(c.b);
    const capas: Rgba[] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = leer(getComputedStyle(n).backgroundColor);
      if (c.a > 0) {
        capas.push(c);
        if (c.a >= 1) break;
      }
    }
    let fondo: Rgba = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
    let opacidad = 1;
    for (let n: Element | null = el; n; n = n.parentElement) opacidad *= Number(getComputedStyle(n).opacity);
    const color = leer(getComputedStyle(el).color);
    const texto = sobre({ ...color, a: color.a * opacidad }, fondo);
    const a = lum(texto);
    const b = lum(fondo);
    return +((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2);
  });
}

/** Cuántos puntos del texto del <h1> (muestreo de 4 en 4 px) caen bajo la barra fija del logo. */
async function tituloBajoLaBarra(page: Page): Promise<{ total: number; tapados: number }> {
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );
  return page.locator('h1').evaluate((h1) => {
    const barra = document.querySelector('[class*="headerBar"]');
    const rango = document.createRange();
    rango.selectNodeContents(h1);
    let total = 0;
    let tapados = 0;
    for (const q of Array.from(rango.getClientRects())) {
      for (let x = q.left + 2; x < q.right - 1; x += 4) {
        for (let y = q.top + 4; y < q.bottom - 3; y += 4) {
          total++;
          const e = document.elementFromPoint(x, y);
          if (e && barra?.contains(e)) tapados++;
        }
      }
    }
    return { total, tapados };
  });
}

/** Pasa a oscuro con el botón real (un `data-theme` a mano lo pisa el gestor de tema). */
async function aOscuro(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
}

const SIN_TRANSICIONES = '*, *::before, *::after { transition: none !important; animation: none !important; }';

test.describe('Cuadro de Punnett · re-inspección 01/10/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
  });

  test('CASO 9 — AaBb × aaBb: genotípica 1:2:1:1:2:1 y fenotípica 3:1:3:1, sumando 100 %', async ({ page }) => {
    await montarCruce(page, 'di', ['Aa', 'aa'], ['Bb', 'Bb']);

    // Gametos a mano: P1 AB, Ab, aB, ab · P2 (aaBb) aB, ab, aB, ab.
    await expect(page.locator(`${CUADRO} thead th`)).toHaveText(['P1 \\ P2', 'aB', 'ab', 'aB', 'ab']);
    await expect(page.locator(`${CUADRO} tbody th`)).toHaveText(['AB', 'Ab', 'aB', 'ab']);
    expect(await rejilla(page)).toEqual([
      ['AaBB', 'AaBb', 'AaBB', 'AaBb'],
      ['AaBb', 'Aabb', 'AaBb', 'Aabb'],
      ['aaBB', 'aaBb', 'aaBB', 'aaBb'],
      ['aaBb', 'aabb', 'aaBb', 'aabb'],
    ]);

    // Conteos a mano 2:4:2:2:4:2 → entre 2 · fenotípica 6:2:6:2 → entre 2.
    expect(await proporcion(page, 0)).toBe('1 AaBB : 2 AaBb : 1 Aabb : 1 aaBB : 2 aaBb : 1 aabb');
    expect(await proporcion(page, 1)).toBe(
      '3 dominante-dominante : 1 dominante-recesivo : 3 recesivo-dominante : 1 recesivo-recesivo',
    );

    // 2/16 = 12,5 % y 4/16 = 25 %.
    const filas = await recuento(page);
    expect(filas).toEqual([
      ['AaBB', 'Doble dominante (A_B_)', '2', '12,5 %'],
      ['AaBb', 'Doble dominante (A_B_)', '4', '25 %'],
      ['Aabb', 'Dom. A / Rec. B (A_bb)', '2', '12,5 %'],
      ['aaBB', 'Rec. A / Dom. B (aaB_)', '2', '12,5 %'],
      ['aaBb', 'Rec. A / Dom. B (aaB_)', '4', '25 %'],
      ['aabb', 'Doble recesivo (aabb)', '2', '12,5 %'],
    ]);
    expect(filas.reduce((acc, f) => acc + Number(f[2]), 0)).toBe(16);
    const suma = filas.reduce((acc, f) => acc + Number(f[3].replace(' %', '').replace(',', '.')), 0);
    expect(suma).toBeCloseTo(100, 6);

    // 6/16 = 37,5 % · 2/16 = 12,5 %.
    await expect(page.locator(RESULTADO)).toContainText(
      'De las 16 combinaciones: 6 (37,5 %) dominante-dominante, 2 (12,5 %) dominante-recesivo, 6 (37,5 %) recesivo-dominante, 2 (12,5 %) recesivo-recesivo.',
    );
  });

  test('CASO 10 — AAbb × aaBB da 16 AaBb (100 % A_B_) y aabb × aabb, 16 aabb', async ({ page }) => {
    await montarCruce(page, 'di', ['AA', 'aa'], ['bb', 'BB']);
    // A mano: P1 solo produce Ab y P2 solo aB.
    await expect(page.locator(`${CUADRO} thead th`)).toHaveText(['P1 \\ P2', 'aB', 'aB', 'aB', 'aB']);
    await expect(page.locator(`${CUADRO} tbody th`)).toHaveText(['Ab', 'Ab', 'Ab', 'Ab']);
    expect(await rejilla(page)).toEqual(Array.from({ length: 4 }, () => ['AaBb', 'AaBb', 'AaBb', 'AaBb']));
    expect(await proporcion(page, 0)).toBe('1 AaBb');
    expect(await proporcion(page, 1)).toBe('1 dominante-dominante');
    expect(await recuento(page)).toEqual([['AaBb', 'Doble dominante (A_B_)', '16', '100 %']]);
    // Los tres fenotipos ausentes salen con «0 (0 %)», no con «0,00» ni vacíos.
    await expect(page.locator(RESULTADO)).toContainText(
      'De las 16 combinaciones: 16 (100 %) dominante-dominante, 0 (0 %) dominante-recesivo, 0 (0 %) recesivo-dominante, 0 (0 %) recesivo-recesivo.',
    );

    await montarCruce(page, 'di', ['aa', 'aa'], ['bb', 'bb']);
    // A mano: ab × ab en las 16 celdas.
    expect(await rejilla(page)).toEqual(Array.from({ length: 4 }, () => ['aabb', 'aabb', 'aabb', 'aabb']));
    expect(await proporcion(page, 1)).toBe('1 recesivo-recesivo');
    expect(await recuento(page)).toEqual([['aabb', 'Doble recesivo (aabb)', '16', '100 %']]);
    await expect(page.locator(RESULTADO)).toContainText(
      'De las 16 combinaciones: 0 (0 %) dominante-dominante, 0 (0 %) dominante-recesivo, 0 (0 %) recesivo-dominante, 16 (100 %) recesivo-recesivo.',
    );
  });

  test('CASO 11 — teclear «bx» en el desplegable no cambia el genotipo, y el aleatorio cuadra con los ejes', async ({
    page,
  }) => {
    await montarCruce(page, 'mono', ['Aa', 'Aa']);
    await page.locator('#p2gA').focus();
    await page.keyboard.type('bx');
    // Ninguna opción (AA, Aa, aa) empieza por «b» ni por «x»: se queda en Aa.
    await expect(page.locator('#p2gA')).toHaveValue('Aa');
    expect(await rejilla(page)).toEqual([
      ['AA', 'Aa'],
      ['Aa', 'aa'],
    ]);

    // «Caso aleatorio» en dihíbrido: los gametos del eje de P2 se derivan, a mano, de los dos
    // desplegables de P2 (para cada alelo de A, cada alelo de B).
    await montarCruce(page, 'di', ['Aa', 'Aa'], ['Bb', 'Bb']);
    for (let i = 0; i < 10; i++) {
      await page.getByRole('button', { name: 'Generar caso aleatorio' }).click();
      const gA = await page.locator('#p2gA').inputValue();
      const gB = await page.locator('#p2gB').inputValue();
      const esperados: string[] = [];
      for (const a of [gA[0], gA[1]]) for (const b of [gB[0], gB[1]]) esperados.push(`${a}${b}`);
      await expect(page.locator(`${CUADRO} thead th`)).toHaveText(['P1 \\ P2', ...esperados]);
    }
  });

  test('HERO — a 390, 800 y 1280 px el logo fijo y el botón de tema no tapan el título', async ({ page }) => {
    // 586a4d61 + a1d72a9c: 80 px arriba hasta 1023 px; desde 1024, los 40 px de siempre.
    for (const [ancho, relleno] of [[390, '80px'], [800, '80px'], [1280, '40px']] as const) {
      await page.setViewportSize({ width: ancho, height: 900 });
      await expect(page.locator('header[class*="hero"]')).toHaveCSS('padding-top', relleno);
      const m = await tituloBajoLaBarra(page);
      expect(m.total, `${ancho} px: el muestreo tiene que haber mirado el título`).toBeGreaterThan(100);
      expect(m.tapados, `${ancho} px: puntos del título bajo la barra fija`).toBe(0);
    }
    // En oscuro la barra es la misma; se comprueba en móvil, donde el hueco es más justo.
    await aOscuro(page);
    await page.setViewportSize({ width: 390, height: 900 });
    expect((await tituloBajoLaBarra(page)).tapados).toBe(0);
  });

  test('SOSPECHA 28/09 descartada — los colores de marca EN LÍNEA no pintan ningún texto', async ({ page }) => {
    // En el DOM el estilo en línea queda como «background:#48A9A6» (SSR) o en rgb() (cliente).
    const enLinea = (modo: string) =>
      page.locator('[style]').evaluateAll(
        (els, m) =>
          els
            .filter((e) => /48a9a6|7fb3d3|rgb\(72, 169, 166\)|rgb\(127, 179, 211\)/i.test(e.getAttribute('style') ?? ''))
            .map((e) => ({ modo: m, texto: (e.textContent ?? '').trim(), clase: String(e.className) })),
        modo,
      );
    const mono = await enLinea('mono');
    await page.getByRole('button', { name: 'Dihíbrido (2 genes)' }).click();
    const di = await enLinea('di');
    // Monohíbrido: solo #7FB3D3 (Heterocigoto) · dihíbrido: #48A9A6 y #7FB3D3. Todos, manchas.
    expect(mono).toHaveLength(1);
    expect(di).toHaveLength(2);
    for (const e of [...mono, ...di]) {
      expect(e.texto, `${e.modo}: un color de marca en línea pinta texto`).toBe('');
      expect(e.clase).toContain('legendDot');
    }
  });

  // ============================================================
  // REPARADOS el 01/10/2026 (hallazgos 2583-2588; eran `test.fail`). Mismos casos del acta, con
  // los dos temas medidos donde el acta solo midió uno, y el hover de los botones.
  // ============================================================

  test('REPARADO (01/10/2026) 2583 — el genotipo de las celdas A_bb del dihíbrido llega a 4,5:1', async ({
    page,
  }) => {
    await page.addStyleTag({ content: SIN_TRANSICIONES });
    await page.getByRole('button', { name: /Dihíbrido clásico/ }).click();
    // Celda «AAbb» (fila Ab, columna Ab). 17,6 px en negrita: no es «texto grande» (18,66 px).
    // Obtenido el 01/10/2026: 2,80:1 (#fff sobre #48a9a6). Reparado dejando el teal (es el color
    // de A_bb en la rejilla y en la leyenda) y pasando el genotipo a #1a1a1a: 6,22:1. El color
    // está fijado en el módulo, así que da lo mismo en oscuro y bajo Stemum.
    const celda = page.locator(`${CUADRO} td`).filter({ hasText: /^AAbb$/ });
    await expect(celda).toHaveCount(1);
    expect(await contrasteReal(celda)).toBeGreaterThanOrEqual(4.5);
    await aOscuro(page);
    expect(await contrasteReal(celda)).toBeGreaterThanOrEqual(4.5);
  });

  test('REPARADO (01/10/2026) 2584 — el texto en color de marca llega a 4,5:1 en claro y en oscuro (proporciones, botones, guía)', async ({
    page,
  }) => {
    await page.addStyleTag({ content: SIN_TRANSICIONES });
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    // Obtenido el 01/10/2026 en claro (var(--primary) #2E86AB / var(--secondary) #48A9A6):
    //   .propRatio «1 AA : 2 Aa : 1 aa» (16 px, 700) sobre la tarjeta blanca → 4,11:1
    //   botón de tipo INACTIVO «Dihíbrido (2 genes)» (15,2 px, 600) sobre #FAFAFA → 3,93:1
    //   escenarios «Mendel original (Aa×Aa)»… (14,08 px, 600) en teal sobre #FAFAFA → 2,68:1
    //   .formulaBox (16 px, 700) sobre su fondo azulado → 3,36:1 (4,25:1 en oscuro)
    //   preguntas del FAQ (.faqItem strong, 15,5 px) → 4,11:1 · pasos (.stepContent strong) → 3,77:1
    // Reparado con --primary-texto / --secondary-texto y la fórmula sin tinte de fondo (con el
    // tinte al 10 % quedaba en 4,48 / 4,25:1). Medido tras reparar, claro / oscuro: 5,47 / 4,93 ·
    // 5,24 / 6,23 · 4,94 / 7,80 · 5,01 / 4,72 · 5,47 / 4,93 · 5,01 / 4,72.
    const medidas: Record<string, Locator> = {
      'proporciones genotípicas': page.locator(clase('propRatio')).first(),
      'botón Dihíbrido inactivo': page.getByRole('button', { name: 'Dihíbrido (2 genes)' }),
      'escenario Mendel original': page.getByRole('button', { name: 'Mendel original (Aa×Aa)' }),
      'fórmula de combinaciones': page.locator(clase('formulaBox')),
      'pregunta del FAQ': page.locator(`${clase('faqItem')} > strong`).first(),
      'paso 1 de la guía': page.locator(`${clase('stepContent')} strong`).first(),
    };
    const fallan: string[] = [];
    for (const tema of ['claro', 'oscuro']) {
      if (tema === 'oscuro') await aOscuro(page);
      for (const [nombre, loc] of Object.entries(medidas)) {
        const r = await contrasteReal(loc);
        if (r < 4.5) fallan.push(`${tema} · ${nombre} ${r}:1`);
      }
    }
    expect(fallan).toEqual([]);
  });

  test('REPARADO (01/10/2026) 2585 — el texto blanco sobre la marca llega a 4,5:1 (tipo activo, aleatorio, nº de paso y los hover)', async ({
    page,
  }) => {
    await page.addStyleTag({ content: SIN_TRANSICIONES });
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    // Obtenido el 01/10/2026 (claro / oscuro):
    //   «Monohíbrido (1 gen)» activo, blanco sobre var(--primary) → 4,11 / 2,79:1 (2,21 bajo Stemum)
    //   «Caso aleatorio», blanco sobre var(--secondary) → 2,80 / 2,23:1 (3,96 bajo Stemum)
    //   .stepNumber «1», blanco sobre var(--primary) → 4,11 / 2,79:1
    //   con el puntero encima, .tipoBtn y .scenarioBtn pasaban también a blanco sobre la marca,
    //   y «Caso aleatorio» bajaba a opacidad 0,85.
    // Reparado con --primary-boton / --secondary-boton (iguales en los dos temas): 5,47 · 5,15 ·
    // 5,47; con hover, 5,47 · 5,15 y el aleatorio cambia a --primary-boton (5,47) en vez de aclararse.
    const tipoActivo = page.getByRole('button', { name: 'Monohíbrido (1 gen)' });
    const tipoInactivo = page.getByRole('button', { name: 'Dihíbrido (2 genes)' });
    const aleatorio = page.getByRole('button', { name: 'Generar caso aleatorio' });
    const escenario = page.getByRole('button', { name: 'Mendel original (Aa×Aa)' });
    const numeroPaso = page.locator(clase('stepNumber')).first();
    const fallan: string[] = [];
    const anotar = (tema: string, nombre: string, r: number): void => {
      if (r < 4.5) fallan.push(`${tema} · ${nombre} ${r}:1`);
    };
    for (const tema of ['claro', 'oscuro']) {
      if (tema === 'oscuro') await aOscuro(page);
      await page.mouse.move(0, 0);
      anotar(tema, 'tipo activo', await contrasteReal(tipoActivo));
      anotar(tema, 'caso aleatorio', await contrasteReal(aleatorio));
      anotar(tema, 'número de paso', await contrasteReal(numeroPaso));
      // Con el puntero encima: comprobar que el hover se ha aplicado (fondo opaco) antes de medir.
      for (const [nombre, loc] of [
        ['hover tipo inactivo', tipoInactivo],
        ['hover escenario', escenario],
        ['hover caso aleatorio', aleatorio],
      ] as const) {
        await loc.hover();
        await expect(loc).toHaveCSS('color', 'rgb(255, 255, 255)');
        anotar(tema, nombre, await contrasteReal(loc));
      }
    }
    expect(fallan).toEqual([]);
  });

  test('REPARADO (01/10/2026) 2586 — el título «Errores frecuentes que debes evitar» llega a 4,5:1', async ({ page }) => {
    await page.addStyleTag({ content: SIN_TRANSICIONES });
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    // #e65100 a 16 px en negrita. Obtenido el 01/10/2026: 3,57:1 sobre #fff8e1 en claro y 3,76:1
    // sobre #332a00 en oscuro (el módulo oscurecía la caja pero no el título). Reparado: #a33900
    // en claro (6,29:1) y #ffb74d en oscuro (8,24:1), con los dos temas declarados en el módulo.
    const titulo = page.locator(clase('warningHeader'));
    expect(await contrasteReal(titulo)).toBeGreaterThanOrEqual(4.5);
    await aOscuro(page);
    expect(await contrasteReal(titulo)).toBeGreaterThanOrEqual(4.5);
  });

  test('REPARADO (01/10/2026) 2587 — las manchas de la leyenda se delimitan con un borde de ≥ 3:1 contra la página', async ({
    page,
  }) => {
    await page.addStyleTag({ content: SIN_TRANSICIONES });
    await page.getByRole('button', { name: 'Dihíbrido (2 genes)' }).click();
    // Objetos gráficos: umbral 3:1 (WCAG 1.4.11). Obtenido el 01/10/2026 con el RELLENO contra
    // #FAFAFA en claro: #48A9A6 2,68:1 · #7FB3D3 2,17:1 · #cccccc 1,54:1; en oscuro, contra
    // #1A1A1A, #1a5278 2,09:1.
    // Por qué la aserción mide ahora el BORDE y no el relleno: el relleno es el de las celdas de
    // la rejilla y no puede cambiar sin cambiar la rejilla (y ningún juego de cuatro colores
    // distinguibles entre sí pasa 3:1 contra el blanco Y contra el negro a la vez). Lo que 1.4.11
    // exige es que el objeto se pueda percibir, y lo delimita su contorno: un borde de 1 px con
    // el color del texto de la leyenda (--text-secondary). Medido tras reparar: 5,50:1 en claro y
    // 8,03:1 en oscuro, igual bajo Stemum. El acta proponía exactamente esto.
    const fallan: string[] = [];
    for (const tema of ['claro', 'oscuro']) {
      if (tema === 'oscuro') await aOscuro(page);
      const manchas = page.locator(clase('legendDot'));
      await expect(manchas).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        const borde = await bordeDeMancha(manchas.nth(i));
        if (borde.ancho < 1 || borde.estilo !== 'solid' || borde.contraste < 3) {
          fallan.push(`${tema} · mancha ${i + 1}: borde ${borde.ancho} px ${borde.estilo}, ${borde.contraste}:1`);
        }
      }
    }
    expect(fallan).toEqual([]);
  });

  test('REPARADO (01/10/2026) 2588 — el «%» va con espacio duro y no salta solo a la línea siguiente', async ({ page }) => {
    // CLAUDE.md §2 (25/09/2026): «15 %» con espacio DURO (U+00A0) para que el % no salte solo de
    // línea. Obtenido el 01/10/2026 a 390 px en el dihíbrido clásico: «… 1 (6,25» al final de una
    // línea del «Resultado:» y «%) recesivo-recesivo.» al principio de la siguiente; en el mismo
    // barrido (320-1280 px) el % salta en las cinco pasadas medidas, también en la guía.
    // Reparado en el helper porcentaje(), que ahora devuelve la cifra con « %» (U+00A0), y en
    // los 26 porcentajes escritos del bloque educativo. Ojo: las cadenas esperadas de abajo y las
    // de los recuentos de todo el fichero llevan un U+00A0 LITERAL entre la cifra y el «%».
    await page.setViewportSize({ width: 390, height: 900 });
    await page.getByRole('button', { name: /Dihíbrido clásico/ }).click();
    const resultado = (await page.locator(RESULTADO).textContent()) ?? '';
    expect(resultado).toContain('1 (6,25 %) recesivo-recesivo.');
    const recuentoTexto = (await page.locator(RECUENTO).textContent()) ?? '';
    expect(recuentoTexto).toContain('6,25 %');

    // Los dos casos de la guía que nombra el acta, y ningún porcentaje con espacio normal en
    // toda la página (cifra + U+0020 + «%»).
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const pagina = (await page.locator('body').textContent()) ?? '';
    expect(pagina).toContain('afectada es 25 % (aa)');
    expect(pagina).toContain('Aa × Aa → 25 % aa');
    expect(pagina.match(/\d %/g) ?? []).toEqual([]);

    // Y en pantalla: ningún «%» empieza una línea distinta de la de su cifra (barrido 320-1280).
    for (let ancho = 320; ancho <= 1280; ancho += 40) {
      await page.setViewportSize({ width: ancho, height: 900 });
      expect(await porcentajesHuerfanos(page), `${ancho} px: «%» separados de su cifra`).toEqual([]);
    }
  });

  test('2589 — en meskeia.com el hueco de Stemum no se aplica: a 1024 px el hero vuelve a sus 40 px', async ({
    page,
  }) => {
    // El corte que arregla 2589 va escrito SOLO para [data-brand='stemum']: en meskeia.com el
    // logo llega a x = 203 y el título empieza en x = 239, así que no hay nada que apartar.
    await page.setViewportSize({ width: 1024, height: 900 });
    await expect(page.locator('header[class*="hero"]')).toHaveCSS('padding-top', '40px');
    expect((await tituloBajoLaBarra(page)).tapados).toBe(0);
  });
});

/** Ancho, estilo y contraste del borde de una mancha de la leyenda contra el fondo que la rodea. */
async function bordeDeMancha(locator: Locator): Promise<{ ancho: number; estilo: string; contraste: number }> {
  return locator.evaluate((el) => {
    interface Rgba { r: number; g: number; b: number; a: number }
    const leer = (css: string): Rgba => {
      const p = (css.match(/[\d.]+/g) ?? []).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const canal = (c: number): number => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (c: Rgba): number => 0.2126 * canal(c.r) + 0.7152 * canal(c.g) + 0.0722 * canal(c.b);
    const cs = getComputedStyle(el);
    let alrededor: Rgba = { r: 255, g: 255, b: 255, a: 1 };
    for (let n: Element | null = el.parentElement; n; n = n.parentElement) {
      const c = leer(getComputedStyle(n).backgroundColor);
      if (c.a >= 1) {
        alrededor = c;
        break;
      }
    }
    const a = lum(leer(cs.borderTopColor));
    const b = lum(alrededor);
    return {
      ancho: parseFloat(cs.borderTopWidth),
      estilo: cs.borderTopStyle,
      contraste: +((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2),
    };
  });
}

/** Porcentajes cuyo «%» cae en otra línea que la última cifra de su número (texto de 10 caracteres). */
async function porcentajesHuerfanos(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const salida: string[] = [];
    const recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = recorrido.nextNode(); n; n = recorrido.nextNode()) {
      const t = n.nodeValue ?? '';
      for (let i = 2; i < t.length; i++) {
        if (t[i] !== '%' || !/\s/.test(t[i - 1]) || !/\d/.test(t[i - 2])) continue;
        const cifra = document.createRange();
        cifra.setStart(n, i - 2);
        cifra.setEnd(n, i - 1);
        const signo = document.createRange();
        signo.setStart(n, i);
        signo.setEnd(n, i + 1);
        const rc = cifra.getBoundingClientRect();
        const rs = signo.getBoundingClientRect();
        if (rs.height > 0 && Math.abs(rc.top - rs.top) > 2) salida.push(t.slice(Math.max(0, i - 8), i + 2));
      }
    }
    return salida;
  });
}

/**
 * Bajo stemum.com, el `next dev` local rechaza el WebSocket de HMR (`allowedDevOrigins` solo
 * admite meskeia.com) y, sin él, la página NO se hidrata: la píldora «Stemum › Biología» no
 * llega a montarse (useStemumHost corre en un efecto) y `esperarPaginaAsentada` agota su espera.
 * Medido el 01/10/2026: con el puente, la página hidrata y la píldora aparece; sin él, el bloque
 * entero de Stemum falla antes de medir nada. El puente reenvía el socket a localhost:3050, que
 * sí se acepta; no toca ninguna petición HTTP, así que lo que se mide es la página real.
 * (En producción no hay HMR: el puente solo existe para el servidor de desarrollo.)
 */
async function puenteHmr(page: Page): Promise<void> {
  const abiertos: WebSocket[] = [];
  page.on('close', () => abiertos.forEach((s) => s.close()));
  await page.routeWebSocket(/\/_next\/(webpack-)?hmr/, (ws) => {
    const u = new URL(ws.url());
    const arriba = new WebSocket(`ws://localhost:3050${u.pathname}${u.search}`);
    arriba.binaryType = 'arraybuffer';
    abiertos.push(arriba);
    const cola: (string | Buffer)[] = [];
    arriba.onopen = () => {
      for (const m of cola) arriba.send(m);
      cola.length = 0;
    };
    ws.onMessage((m) => {
      if (arriba.readyState === WebSocket.OPEN) arriba.send(m);
      else cola.push(m);
    });
    arriba.onmessage = (e: MessageEvent) =>
      ws.send(typeof e.data === 'string' ? e.data : Buffer.from(e.data as ArrayBuffer));
    ws.onClose(() => arriba.close());
  });
}

// ============================================================
// Bajo stemum.com: la marca del portal y su píldora «Stemum › Biología»
// ============================================================
test.describe('Cuadro de Punnett · stemum.com · re-inspección 01/10/2026', () => {
  test.beforeEach(async ({ page }) => {
    await puenteHmr(page);
    await page.goto('http://stemum.com/simulador-punnett/');
    await esperarPaginaAsentada(page);
    await expect(page.locator('html')).toHaveAttribute('data-brand', 'stemum');
    await expect(page.locator(clase('stemumPill'))).toBeVisible();
  });

  test('REPARADO 25/09 (1670) — bajo Stemum las cabeceras del cuadro y del recuento siguen en ≥ 4,5:1', async ({
    page,
  }) => {
    await page.addStyleTag({ content: SIN_TRANSICIONES });
    // --primary-boton de Stemum es #6B21A8 en los dos temas: blanco encima, 8,72:1 (01/10/2026).
    const gameto = page.locator(`${CUADRO} thead th`).nth(1);
    const genotipo = page.locator(`${RECUENTO} thead th`).first();
    expect(await contrasteReal(gameto)).toBeGreaterThanOrEqual(4.5);
    expect(await contrasteReal(genotipo)).toBeGreaterThanOrEqual(4.5);
    await aOscuro(page);
    expect(await contrasteReal(gameto)).toBeGreaterThanOrEqual(4.5);
    expect(await contrasteReal(genotipo)).toBeGreaterThanOrEqual(4.5);
  });

  test('HERO bajo Stemum — a 390, 800 y 1280 px la píldora tampoco tapa el título', async ({ page }) => {
    for (const ancho of [390, 800, 1280]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      const m = await tituloBajoLaBarra(page);
      expect(m.total).toBeGreaterThan(100);
      expect(m.tapados, `${ancho} px: puntos del título bajo la píldora`).toBe(0);
    }
  });

  test('REPARADO (01/10/2026) 2584 y 2585 bajo Stemum — escenarios, tipo activo y aleatorio llegan a 4,5:1 en los dos temas', async ({
    page,
  }) => {
    await page.addStyleTag({ content: SIN_TRANSICIONES });
    // El acta midió bajo Stemum: escenarios (var(--secondary) #A855F7 como texto) 3,79:1 en claro
    // y 4,40:1 en oscuro; tipo activo, blanco sobre #C99BF5, 2,21:1 en oscuro; aleatorio, blanco
    // sobre #A855F7, 3,96:1. Con los tokens -texto/-boton, que el bloque [data-brand='stemum'] de
    // globals redeclara: 5,52 / 6,73 · 8,72 · 5,76 (medido tras reparar, 01/10/2026).
    const medidas: Record<string, Locator> = {
      'escenario Mendel original': page.getByRole('button', { name: 'Mendel original (Aa×Aa)' }),
      'tipo activo': page.getByRole('button', { name: 'Monohíbrido (1 gen)' }),
      'caso aleatorio': page.getByRole('button', { name: 'Generar caso aleatorio' }),
      'proporciones genotípicas': page.locator(clase('propRatio')).first(),
    };
    const fallan: string[] = [];
    for (const tema of ['claro', 'oscuro']) {
      if (tema === 'oscuro') await aOscuro(page);
      for (const [nombre, loc] of Object.entries(medidas)) {
        const r = await contrasteReal(loc);
        if (r < 4.5) fallan.push(`${tema} · ${nombre} ${r}:1`);
      }
    }
    expect(fallan).toEqual([]);
  });

  test('REPARADO (01/10/2026) 2589 — de 1024 a 1059 px la píldora «Stemum › Biología» ya no pisa el título', async ({
    page,
  }) => {
    // a1d72a9c deja el hueco de 80 px hasta 1023 px, medido con el logo de meskeia.com (hasta
    // x = 203). La píldora de Stemum llega a x = 253 y el título centrado empieza en x = 239 a
    // 1024 px. Obtenido el 01/10/2026: 54 de 1639 puntos tapados a 1024 px, 16 a 1044 px, 0 a
    // 1048. Solo el 🧬 decorativo: las letras quedan libres (con un título más largo, no).
    // Reparado en el módulo de la app: bajo [data-brand='stemum'] el hueco llega hasta 1059 px.
    // A 1048 el muestreo ya daba 0, pero la CAJA del texto (x = 251) seguía cruzando la de la
    // píldora (x = 253) hasta 1052; a 1060 el título empieza en x = 257, 4 px de aire.
    for (const [ancho, relleno] of [
      [1024, '80px'],
      [1036, '80px'],
      [1044, '80px'],
      [1048, '80px'],
      [1059, '80px'],
      [1060, '40px'],
      [1100, '40px'],
    ] as const) {
      await page.setViewportSize({ width: ancho, height: 900 });
      await expect(page.locator('header[class*="hero"]')).toHaveCSS('padding-top', relleno);
      const m = await tituloBajoLaBarra(page);
      expect(m.total).toBeGreaterThan(100);
      expect(m.tapados, `${ancho} px: puntos del título bajo la píldora`).toBe(0);
      // Y las cajas: el borde derecho de la píldora no entra en la del texto del título.
      const cajas = await page.evaluate(() => {
        const pildora = document.querySelector('[class*="stemumPill"]')?.getBoundingClientRect();
        const rango = document.createRange();
        rango.selectNodeContents(document.querySelector('h1') as Element);
        const titulo = rango.getBoundingClientRect();
        return {
          seCruzan: !!pildora && pildora.right > titulo.left && pildora.bottom > titulo.top + 1,
          pildora: pildora ? [Math.round(pildora.right), Math.round(pildora.bottom)] : null,
          titulo: [Math.round(titulo.left), Math.round(titulo.top)],
        };
      });
      expect(cajas.seCruzan, `${ancho} px: píldora ${cajas.pildora} · título ${cajas.titulo}`).toBe(false);
    }
  });
});
