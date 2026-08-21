import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-genetica (segmento interactiva, riesgo 2, 662 usos reales)
 *
 * Primera inspección: 20/08/2026. La app promete en su <h1> y en su metadata «cuadro de
 * Punnett, cruce monohíbrido (3:1) y dihíbrido (9:3:3:1) con sus proporciones fenotípicas»,
 * así que SÍ tiene verdad comprobable y se trata como verificable.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/simulador-genetica/components/genetics/crosses.ts    ← gametos, Punnett y fenotipos
 *   app/simulador-genetica/components/genetics/organisms.ts  ← TABLA DE RASGOS (fuente de verdad
 *                                                              de qué fenotipo tiene cada genotipo)
 *   app/simulador-genetica/components/PunnettSquare.tsx      ← pinta el cuadro
 *   app/simulador-genetica/components/StatisticsPanel.tsx    ← pinta las proporciones
 *
 * LA TABLA QUE PUBLICA LA PROPIA APP (organisms.ts), que manda sobre cualquier memoria:
 *   Guisantes · Color de semilla: A = Amarillo (dominante), a = Verde · AA y Aa → Amarillo, aa → Verde
 *   Guisantes · Forma de semilla: R = Lisa (dominante), r = Rugosa · RR y Rr → Lisa, rr → Rugosa
 *   Humanos   · Daltonismo (ligado al X): XD XD, XD Xd y XD Y → Visión normal · Xd Xd y Xd Y → Daltónico
 *   Flores    · Color (dominancia INCOMPLETA): RR → Rojo, Rr → Rosa, rr → Blanco
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — Aa × Aa, el monohíbrido clásico
 *       gametos padre A, a  ×  gametos madre A, a
 *          |  A  |  a
 *       A  | AA  | Aa
 *       a  | Aa  | aa
 *       genotípica  1 AA : 2 Aa : 1 aa  →  1/4, 2/4, 1/4  →  25 %, 50 %, 25 %
 *       fenotípica  3 Amarillo : 1 Verde →  3/4, 1/4      →  75 %, 25 %
 *       cada celda del cuadro: 1/4 = 25 %
 *     Y su versión dihíbrida AaRr × AaRr (2 rasgos independientes, 3ª ley):
 *       Amarillo/Lisa 9/16 = 56,25 % · Amarillo/Rugosa 3/16 = 18,75 %
 *       Verde/Lisa 3/16 = 18,75 %    · Verde/Rugosa 1/16 = 6,25 %   → 9:3:3:1
 *
 *   CASO 2 (límite) — ambos progenitores HOMOCIGOTOS, AA × aa (1ª ley, uniformidad de la F1)
 *       el padre solo puede dar A, la madre solo a  →  TODA la descendencia es Aa
 *       genotípica  100 % Aa   ·   fenotípica  100 % Amarillo
 *       la probabilidad de la única combinación posible es 4/4 = 100 %, NO 25 %
 *     Y el límite del otro lado, la herencia ligada al X (el resultado difiere por sexo):
 *       Xd Y (padre daltónico) × XD Xd (madre portadora)
 *          |  Xd    |  Y
 *       XD | XD Xd  | XD Y     → hija portadora sana · hijo sano
 *       Xd | Xd Xd  | Xd Y     → hija DALTÓNICA      · hijo daltónico
 *       25 % cada uno: es el ejemplo que la propia app publica en «Casos de Uso»
 *       («¿Probabilidad de hija daltónica? → 25 %»).
 *
 *   CASO 3 (rechazo) — no hay campo libre de genotipo (todo son <select>), así que lo único
 *       que se puede escribir mal es el tamaño de población, declarado min=10 max=500:
 *       1000, 0 y -5 deben rechazarse; y un rasgo ligado al sexo NO debe admitir cruce
 *       dihíbrido (la app retira el conmutador).
 *
 * HALLAZGOS ABIERTOS: al final, marcados con `test.fail()` — afirman lo que debería pasar y
 * hoy fallan a propósito. El día que se reparen se ponen en verde: quitar entonces la línea
 * `test.fail()` y quedan como regresión.
 */

const RUTA = '/simulador-genetica/';

/** Los nombres de clase de CSS Modules van con hash: se localiza por subcadena. */
const genotiposDeCelda = (page: Page) => page.locator('[class*="cellGenotype"]');
const fenotiposDeCelda = (page: Page) => page.locator('[class*="cellPhenotype"]');
const probabilidadesDeCelda = (page: Page) => page.locator('[class*="cellProbability"]');
/** 0 y 1 = rasgo 1 (padre, madre); 2 y 3 = rasgo 2 en el cruce dihíbrido. */
const selectorGenotipo = (page: Page, i: number) => page.locator('[class*="genotypeSelect"]').nth(i);
const selectorRasgo = (page: Page, i: number) => page.locator('select[class*="select"]').nth(i);
/** Las cuatro pestañas de resultados son `role="tab"` desde la reparación del 21/08/2026. */
const pestana = (page: Page, nombre: string) =>
  page.getByRole('tab', { name: nombre, exact: true });
const campoPoblacion = (page: Page) => page.locator('input[type="number"]');

/** Cabeceras del cuadro: [gametos en columnas, gametos en filas]. */
async function cabeceras(page: Page): Promise<[string[], string[]]> {
  const columnas = await page.locator('[class*="punnettTable"] thead th').allInnerTexts();
  const filas = await page.locator('[class*="punnettTable"] tbody th').allInnerTexts();
  const limpia = (t: string) => t.replace(/\s+/g, ' ').trim();
  return [columnas.slice(1).map(limpia), filas.map(limpia)];
}

/** Las dos columnas del panel Estadísticas: proporciones genotípicas y fenotípicas. */
async function estadisticas(page: Page) {
  await pestana(page, 'Estadísticas').click();
  const secciones = page.locator('[class*="statsSection"]:not([class*="SectionTitle"])');
  const leer = async (i: number) => {
    const seccion = secciones.nth(i);
    const etiquetas = await seccion.locator('[class*="ratioLabel"]').allInnerTexts();
    const valores = await seccion.locator('[class*="ratioValue"]').allInnerTexts();
    return {
      filas: etiquetas.map((e, j) => `${e.replace(/\s+/g, ' ').trim()} ${valores[j].trim()}`),
      ratio: (await seccion.locator('[class*="ratioSummary"]').innerText()).trim(),
    };
  };
  return { genotipos: await leer(0), fenotipos: await leer(1) };
}

/** Deja la app en Humanos → Daltonismo (el único rasgo ligado al X con nombre de examen). */
async function abreDaltonismo(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Humanos/ }).click();
  await selectorRasgo(page, 0).selectOption('daltonismo');
  await expect(selectorGenotipo(page, 0)).toHaveValue('XD Y');
}

// ============================================================
// CASO 1 — El cruce monohíbrido clásico y su versión dihíbrida
// ============================================================
test.describe('Caso 1 — Aa × Aa, el cruce que da 3:1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    // Arranque por defecto: Guisantes · Color de semilla · Aa × Aa, cruzado solo al montar.
    await expect(selectorGenotipo(page, 0)).toHaveValue('Aa');
    await expect(selectorGenotipo(page, 1)).toHaveValue('Aa');
  });

  test('el cuadro de Punnett tiene las cuatro combinaciones en su sitio', async ({ page }) => {
    // Calculado a mano arriba: A×A=AA, a×A=Aa, A×a=Aa, a×a=aa, leído por filas.
    await expect(genotiposDeCelda(page)).toHaveText(['AA', 'Aa', 'Aa', 'aa']);
    // Fenotipos según la tabla de organisms.ts: solo aa es Verde.
    await expect(fenotiposDeCelda(page)).toHaveText(['Amarillo', 'Amarillo', 'Amarillo', 'Verde']);
    // Los gametos y su frecuencia: cada progenitor heterocigoto da A y a al 50 %.
    const [columnas, filas] = await cabeceras(page);
    expect(columnas).toEqual(['A (50%)', 'a (50%)']);
    expect(filas).toEqual(['A (50%)', 'a (50%)']);
  });

  test('las proporciones son 1:2:1 genotípica y 3:1 fenotípica', async ({ page }) => {
    const { genotipos, fenotipos } = await estadisticas(page);
    // 1 AA : 2 Aa : 1 aa sobre 4 celdas → 25 %, 50 %, 25 % (la app ordena de mayor a menor).
    expect(genotipos.filas).toEqual(['Aa 50%', 'AA 25%', 'aa 25%']);
    expect(genotipos.ratio).toBe('Ratio: 1:2:1');
    // Amarillo agrupa AA y Aa (3 de 4 celdas) → 75 % · Verde solo aa → 25 %.
    expect(fenotipos.filas).toEqual(['🟡 Amarillo 75%', '🟢 Verde 25%']);
    expect(fenotipos.ratio).toBe('Ratio: 3:1');
  });

  test('el dihíbrido AaRr × AaRr da 9:3:3:1', async ({ page }) => {
    await page.getByRole('button', { name: 'Dihíbrido', exact: true }).click();
    // Rasgo 2 por defecto: forma de semilla, Rr × Rr.
    await expect(selectorRasgo(page, 1)).toHaveValue('forma-semilla');
    await expect(selectorGenotipo(page, 2)).toHaveValue('Rr');
    await expect(selectorGenotipo(page, 3)).toHaveValue('Rr');
    await page.getByRole('button', { name: /Realizar Cruce/ }).click();

    // 4 gametos × 4 gametos = 16 celdas.
    await expect(genotiposDeCelda(page)).toHaveCount(16);
    const { fenotipos } = await estadisticas(page);
    // 3/4 × 3/4 = 9/16 = 56,25 % → «56%» · 3/16 = 18,75 % → «19%» · 1/16 = 6,25 % → «6%».
    expect(fenotipos.filas).toEqual([
      '🟡⚪ Amarillo / Lisa 56%',
      '🟡🔘 Amarillo / Rugosa 19%',
      '🟢⚪ Verde / Lisa 19%',
      '🟢🔘 Verde / Rugosa 6%',
    ]);
    expect(fenotipos.ratio).toBe('Ratio: 9:3:3:1');
  });
});

// ============================================================
// CASO 2 — Los límites: homocigotos, ligada al X y dominancia incompleta
// ============================================================
test.describe('Caso 2 — límites', () => {
  test('AA × aa: toda la F1 es Aa amarilla (1ª ley de Mendel)', async ({ page }) => {
    await page.goto(RUTA);
    await selectorGenotipo(page, 0).selectOption('AA');
    await selectorGenotipo(page, 1).selectOption('aa');

    // Un padre que solo da A y una madre que solo da a: no hay más resultado posible que Aa.
    // El cuadro se dibuja 2×2 (cabeceras A|A y a|a), así que las cuatro celdas son Aa.
    await expect(genotiposDeCelda(page)).toHaveText(['Aa', 'Aa', 'Aa', 'Aa']);
    const { genotipos, fenotipos } = await estadisticas(page);
    expect(genotipos.filas).toEqual(['Aa 100%']);
    expect(fenotipos.filas).toEqual(['🟡 Amarillo 100%']);
  });

  test('AA × aa: los cuatro hijos del árbol genealógico son Aa', async ({ page }) => {
    await page.goto(RUTA);
    await selectorGenotipo(page, 0).selectOption('AA');
    await selectorGenotipo(page, 1).selectOption('aa');
    await pestana(page, 'Pedigree').click();

    const genotiposArbol = await page.locator('[class*="pedigreeGenotype"]').allInnerTexts();
    // Dos progenitores (AA y aa) y cuatro hijos, todos Aa porque no hay otra combinación.
    expect(genotiposArbol).toEqual(['AA', 'aa', 'Aa', 'Aa', 'Aa', 'Aa']);
  });

  test('daltonismo: madre portadora × padre sano deja sanas a todas las hijas', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await abreDaltonismo(page);
    // Por defecto: padre XD Y (sano) × madre XD Xd (portadora).
    await expect(selectorGenotipo(page, 1)).toHaveValue('XD Xd');
    // Calculado a mano: XD Y × XD Xd → XD XD ♀ · XD Y ♂ · XD Xd ♀ portadora · Xd Y ♂ daltónico.
    await expect(fenotiposDeCelda(page)).toHaveText([
      'Visión normal (♀)',
      'Visión normal (♂)',
      'Visión normal (♀)',
      'Daltónico (♂)',
    ]);
    // La regla que la propia app enseña: el padre pasa su X solo a las hijas, nunca a los hijos.
    // Por eso el único afectado posible aquí es un varón, y hereda el Xd de su MADRE.
    const { genotipos } = await estadisticas(page);
    expect(genotipos.filas).toContain('Xd Y 25%');
  });

  test('daltonismo: padre daltónico × madre portadora da una hija daltónica al 25 %', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await abreDaltonismo(page);
    await selectorGenotipo(page, 0).selectOption('Xd Y');

    // Cuadro resuelto a mano arriba. Es el ejemplo que la app publica en «Casos de Uso»:
    // «Mujer portadora (X^R X^r) × hombre daltónico (X^r Y) → hija daltónica: 25 %».
    await expect(genotiposDeCelda(page)).toHaveText(['XD Xd', 'XD Y', 'Xd Xd', 'Xd Y']);
    await expect(fenotiposDeCelda(page)).toHaveText([
      'Visión normal (♀)',
      'Visión normal (♂)',
      'Daltónico (♀)',
      'Daltónico (♂)',
    ]);
    const { genotipos } = await estadisticas(page);
    // La hija afectada necesita DOS Xd, uno de cada progenitor: 1 de las 4 celdas.
    expect(genotipos.filas).toContain('Xd Xd 25%');
  });

  test('dominancia incompleta: el heterocigoto tiene fenotipo propio y el ratio pasa a 1:2:1', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Flores/ }).click();
    await selectorGenotipo(page, 0).selectOption('Rr');
    await selectorGenotipo(page, 1).selectOption('Rr');

    // Mismo cuadro que Aa × Aa, pero Rr ya no se parece a RR: rojo, rosa, rosa, blanco.
    await expect(fenotiposDeCelda(page)).toHaveText(['Rojo', 'Rosa', 'Rosa', 'Blanco']);
    const { fenotipos } = await estadisticas(page);
    expect(fenotipos.filas).toEqual(['🩷 Rosa 50%', '🔴 Rojo 25%', '⚪ Blanco 25%']);
    // Aquí el fenotípico coincide con el genotípico: 1:2:1, no 3:1.
    expect(fenotipos.ratio).toBe('Ratio: 1:2:1');
  });
});

// ============================================================
// CASO 3 — Lo que la app debe rechazar
// ============================================================
test.describe('Caso 3 — rechazos', () => {
  test('el tamaño de población no acepta 1000, 0 ni -5', async ({ page }) => {
    await page.goto(RUTA);
    await pestana(page, 'Población').click();
    const campo = campoPoblacion(page);
    // El propio campo declara su rango.
    await expect(campo).toHaveAttribute('min', '10');
    await expect(campo).toHaveAttribute('max', '500');
    await expect(campo).toHaveValue('100');

    for (const valorInvalido of ['1000', '0', '-5', '501']) {
      await campo.fill(valorInvalido);
      await expect(campo).toHaveValue('100'); // se ignora y se queda en el último válido
    }

    // Y el valor máximo declarado sí se acepta.
    await campo.fill('500');
    await expect(campo).toHaveValue('500');
  });

  test('un rasgo ligado al sexo no ofrece cruce dihíbrido ni genotipos de dos X al padre', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await abreDaltonismo(page);
    // La app retira el conmutador Monohíbrido/Dihíbrido con un rasgo ligado al X.
    await expect(page.getByRole('button', { name: 'Dihíbrido', exact: true })).toHaveCount(0);
    // Y al padre solo se le ofrecen genotipos con Y; a la madre, solo con dos X.
    expect(await selectorGenotipo(page, 0).locator('option').allInnerTexts()).toEqual([
      'XD Y',
      'Xd Y',
    ]);
    expect(await selectorGenotipo(page, 1).locator('option').allInnerTexts()).toEqual([
      'XD XD',
      'XD Xd',
      'Xd Xd',
    ]);
  });
});

/**
 * HALLAZGOS ABIERTOS del 20/08/2026. Todos fallan HOY a propósito.
 */
// REGRESIONES — los diez hallazgos del 20/08/2026, reparados el 21/08/2026. Afirman lo que
// debe pasar y hoy PASAN: si alguien reintroduce el defecto, saltan aquí.
test.describe('Simulador de genética — regresiones de los hallazgos reparados', () => {
  test('el dihíbrido con un progenitor homocigoto coloca mal TODAS las celdas', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Dihíbrido', exact: true }).click();
    await selectorGenotipo(page, 0).selectOption('AA'); // padre AA RR: un solo gameto, AR
    await selectorGenotipo(page, 2).selectOption('RR');
    await page.getByRole('button', { name: /Realizar Cruce/ }).click();

    // AA RR × Aa Rr: el padre solo aporta AR (sus 4 columnas son iguales); la madre aporta
    // AR, Ar, aR, ar, una por fila. Resuelto a mano, cada fila da el mismo genotipo en sus
    // cuatro columnas: fila AR → AA RR · fila Ar → AA Rr · fila aR → Aa RR · fila ar → Aa Rr.
    // Antes se indexaban las celdas con el nº de gametos ÚNICOS mientras se generaban sobre la
    // rejilla entera, así que se leían las 4 primeras de las 16 y «AA RR» salía repetido en
    // todo el cuadro, contradiciendo al panel Estadísticas (que sí decía 1:1:1:1).
    await expect(genotiposDeCelda(page)).toHaveText([
      'AA RR', 'AA RR', 'AA RR', 'AA RR',
      'AA Rr', 'AA Rr', 'AA Rr', 'AA Rr',
      'Aa RR', 'Aa RR', 'Aa RR', 'Aa RR',
      'Aa Rr', 'Aa Rr', 'Aa Rr', 'Aa Rr',
    ]);

    // Y las 16 celdas suman 100 %: 4/16 de cada genotipo, que es el 1:1:1:1 de Estadísticas.
    expect((await estadisticas(page)).genotipos.ratio).toBe('Ratio: 1:1:1:1');
  });

  test('el cuadro de un homocigoto se dibuja completo y sus celdas suman 100 %', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await selectorGenotipo(page, 0).selectOption('AA');
    await selectorGenotipo(page, 1).selectOption('aa');

    // AA × aa se dibuja 2×2 con las cabeceras A|A y a|a: es el cuadro de Punnett canónico y
    // la 1.ª ley de Mendel que la propia app enseña («todos Aa»). Las cuatro celdas son Aa al
    // 25 % y suman el 100 % que anuncia Estadísticas. Lo que estaba roto no era el número de
    // celdas, sino que las cabeceras se colapsaban mientras las celdas no, dejando cada una
    // bajo una fila y una columna que no le correspondían.
    const [columnas, filas] = await cabeceras(page);
    expect(columnas).toHaveLength(2);
    expect(filas).toHaveLength(2);

    const probabilidades = await probabilidadesDeCelda(page).allInnerTexts();
    expect(probabilidades).toEqual(['25,0%', '25,0%', '25,0%', '25,0%']);
    await expect(genotiposDeCelda(page)).toHaveText(['Aa', 'Aa', 'Aa', 'Aa']);

    // Las cuatro celdas son el mismo genotipo: Estadísticas dice «Aa 100%», sin contradicción.
    expect((await estadisticas(page)).genotipos.filas).toEqual(['Aa 100%']);
  });

  test('el cuadro no se rehace al pasar a dihíbrido ni al cambiar el segundo rasgo', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Dihíbrido', exact: true }).click();
    // El useEffect que recruza solo mira parent1Genotype, parent2Genotype y selectedTrait1:
    // ni el tipo de cruce ni los genotipos del rasgo 2 lo disparan. Hasta pulsar «Realizar
    // Cruce» se sigue enseñando el cuadro 2×2 del cruce anterior, sin avisar de que está viejo.
    await expect(genotiposDeCelda(page)).toHaveCount(16);

    // Y lo mismo al cambiar el rasgo 2 con el dihíbrido ya en pantalla: Aa rr × Aa Rr da
    // 3:3:1:1 (3/4 amarillos × 1/2 lisas), pero se queda el 9:3:3:1 anterior.
    await page.getByRole('button', { name: /Realizar Cruce/ }).click();
    await selectorGenotipo(page, 2).selectOption('rr');
    expect((await estadisticas(page)).fenotipos.ratio).toBe('Ratio: 3:3:1:1');
  });

  test('en herencia ligada al sexo las estadísticas enseñan dos filas idénticas', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await abreDaltonismo(page);

    // XD Y × XD Xd reparte los fenotipos por sexo: ♀ visión normal 50 %, ♂ visión normal 25 %,
    // ♂ daltónico 25 %. StatisticsPanel corta la etiqueta en « (» para quitar el símbolo de
    // sexo, así que salen DOS filas «👁️ Visión normal» (50 % y 25 %) imposibles de distinguir,
    // y un «Ratio: 2:1:1» que no se puede leer sin el sexo que se acaba de borrar.
    const { fenotipos } = await estadisticas(page);
    expect(new Set(fenotipos.filas.map((f) => f.replace(/ \d+%$/, ''))).size).toBe(
      fenotipos.filas.length
    );
  });

  test('los porcentajes se imprimen con punto decimal en vez de coma', async ({ page }) => {
    await page.goto(RUTA);
    // Formato español obligatorio: antes se usaba toFixed(1) directamente y salía «25.0%».
    await expect(probabilidadesDeCelda(page)).toHaveCount(4);
    const probabilidades = await probabilidadesDeCelda(page).allInnerTexts();
    expect(probabilidades).toEqual(['25,0%', '25,0%', '25,0%', '25,0%']);
  });

  test('los botones de selección no llevan type ni anuncian qué está activo', async ({ page }) => {
    await page.goto(RUTA);
    const organismos = page.locator('[class*="organismButton"]');
    await expect(organismos).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      // Regla universal del proyecto: todo <button> lleva type="button"…
      await expect(organismos.nth(i)).toHaveAttribute('type', 'button');
      // …y todo botón que cambia el estado visual expone aria-pressed. Sin él, un lector de
      // pantalla no puede saber que «Guisantes» es el organismo seleccionado. Lo mismo pasa
      // en el conmutador Monohíbrido/Dihíbrido y en las cuatro pestañas de resultados.
      await expect(organismos.nth(i)).toHaveAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    }
  });

  test('la guía no promete nada que la herramienta no haga', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const guia = (await page.locator('body').innerText()).replace(/\s+/g, ' ');

    // Prometía 1.000 individuos, tres generaciones de pedigree y una opción «Herencia ligada
    // al sexo» inexistente. Se alinea el texto con la herramienta, no al revés: el pedigree de
    // tres generaciones existe (`generatePedigree`) pero exige los cuatro genotipos de los
    // abuelos, que la app no pregunta, así que conectarlo sería interfaz nueva.
    expect(guia).not.toContain('1.000 individuos');
    expect(guia).not.toContain('3 generaciones');
    expect(guia).toContain('hasta');
    expect(guia).toContain('500 individuos');

    // Y el tope que anuncia es el que declara el campo…
    await pestana(page, 'Población').click();
    expect(Number(await campoPoblacion(page).getAttribute('max'))).toBe(500);

    // …y el árbol genealógico sigue siendo de padres e hijos, como ahora dice el texto.
    await pestana(page, 'Pedigree').click();
    await expect(page.locator('[class*="pedigreeGenerationLabel"]')).toHaveCount(2);
  });

  test('el bloque chi-cuadrado desaparece justo cuando el ajuste es perfecto', async ({ page }) => {
    await page.goto(RUTA);
    // AA × aa da un solo fenotipo: lo observado SIEMPRE coincide con lo esperado y χ² = 0.
    await selectorGenotipo(page, 0).selectOption('AA');
    await selectorGenotipo(page, 1).selectOption('aa');
    await pestana(page, 'Población').click();
    await page.getByRole('button', { name: /Simular/ }).click();
    await expect(page.locator('[class*="populationIndividual"]')).toHaveCount(100);

    // `simulation?.chiSquare ? …` trata el 0 como «no hay dato» y esconde el panel entero,
    // que es justo el caso que la FAQ describe como «ajuste excelente».
    await expect(page.locator('[class*="chiSquare"]').first()).toBeVisible();
  });

  test('el tamaño de población acepta 7 aunque el campo declare min=10', async ({ page }) => {
    await page.goto(RUTA);
    await pestana(page, 'Población').click();
    const campo = campoPoblacion(page);
    await campo.fill('7');
    // El validador comprobaba > 0 y <= 500 mientras el campo declara min=10: el 7 entraba y
    // se simulaban 7 individuos. Ahora se rechaza, y además se dice por qué en vez de
    // revertir en silencio.
    await expect(campo).toHaveValue('100');
    await expect(page.locator('#aviso-tamano-poblacion')).toContainText('entre 10 y 500');

    // El límite superior se rechaza igual…
    await campo.fill('1000');
    await expect(page.locator('#aviso-tamano-poblacion')).toBeVisible();
    // …y un valor válido no deja aviso ninguno.
    await campo.fill('50');
    await expect(page.locator('#aviso-tamano-poblacion')).toHaveCount(0);
    await expect(campo).toHaveValue('50');
  });

  test('en ligada al sexo el genotipo se escribe con el alelo recesivo delante', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await abreDaltonismo(page);
    // La hija portadora sale como «Xd XD» porque el gameto materno se escribe primero. La guía
    // de la propia app dice «el alelo dominante siempre va primero (Aa, no aA)», y su tabla de
    // fenotipos declara «XD Xd»: esa cadena exacta no existe en organisms.ts.
    await expect(genotiposDeCelda(page)).toHaveText(['XD XD', 'XD Y', 'XD Xd', 'Xd Y']);
  });
});
