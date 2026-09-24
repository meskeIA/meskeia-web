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
    expect(genotipos.ratio).toContain('Ratio: 1:2:1');
    // Amarillo agrupa AA y Aa (3 de 4 celdas) → 75 % · Verde solo aa → 25 %.
    expect(fenotipos.filas).toEqual(['🟡 Amarillo 75%', '🟢 Verde 25%']);
    expect(fenotipos.ratio).toContain('Ratio: 3:1');
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
    // 22/09/2026 (hallazgo 1206): el panel imprime la proporción EXACTA. El dihíbrido 9:3:3:1
    // da 56,25 · 18,75 · 18,75 · 6,25, y redondearlo a entero era perder justo la precisión que
    // la sección «Casos para clase» de la misma página pide calcular.
    expect(fenotipos.filas).toEqual([
      '🟡⚪ Amarillo / Lisa 56,25%',
      '🟡🔘 Amarillo / Rugosa 18,75%',
      '🟢⚪ Verde / Lisa 18,75%',
      '🟢🔘 Verde / Rugosa 6,25%',
    ]);
    expect(fenotipos.ratio).toContain('Ratio: 9:3:3:1');
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
    expect(fenotipos.ratio).toContain('Ratio: 1:2:1');
  });
});

// ============================================================
// CASO 3 — Lo que la app debe rechazar
// ============================================================
test.describe('Caso 3 — rechazos', () => {
  test('el tamaño de población no simula con 1000, 0 ni -5', async ({ page }) => {
    await page.goto(RUTA);
    await pestana(page, 'Población').click();
    const campo = campoPoblacion(page);
    // El propio campo declara su rango.
    await expect(campo).toHaveAttribute('min', '10');
    await expect(campo).toHaveAttribute('max', '500');
    await expect(campo).toHaveValue('100');

    /*
      ⚠️ 22/09/2026 (hallazgo 1203) — este testigo pedía `toHaveValue('100')` tras escribir un
      valor inválido, y esa reversión era el defecto: el input estaba controlado por el NÚMERO,
      así que cada pulsación se juzgaba por separado y al teclear «50» el «5» intermedio lo
      devolvía a 100, dejando el campo sin admitir NINGÚN valor. Ahora el texto se conserva, el
      aviso explica qué falta y lo que se bloquea es la SIMULACIÓN, que es lo que de verdad
      importaba: antes el botón seguía activo y simulaba 100 con otro número en pantalla.
    */
    for (const valorInvalido of ['1000', '0', '-5', '501']) {
      await campo.fill(valorInvalido);
      // Lo escrito se conserva —si no, no se puede teclear—, pero no se simula.
      await expect(campo).toHaveValue(valorInvalido);
      await expect(campo).toHaveAttribute('aria-invalid', 'true');
      await expect(page.getByRole('button', { name: /Simular/ })).toBeDisabled();
    }

    // Y el valor máximo declarado sí se acepta.
    await campo.fill('500');
    await expect(campo).toHaveValue('500');
    await expect(page.getByRole('button', { name: /Simular/ })).toBeEnabled();
    await expect(page.locator('#aviso-tamano-poblacion')).toHaveCount(0);
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
    expect((await estadisticas(page)).genotipos.ratio).toContain('Ratio: 1:1:1:1');
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
    expect((await estadisticas(page)).fenotipos.ratio).toContain('Ratio: 3:3:1:1');
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

  test('el tamaño de población no simula 7 aunque el campo declare min=10', async ({ page }) => {
    await page.goto(RUTA);
    await pestana(page, 'Población').click();
    const campo = campoPoblacion(page);
    await campo.fill('7');
    // El validador comprobaba > 0 y <= 500 mientras el campo declara min=10: el 7 entraba y
    // se simulaban 7 individuos. Ahora se rechaza y se dice por qué.
    await expect(page.locator('#aviso-tamano-poblacion')).toContainText('entre 10 y 500');
    await expect(page.getByRole('button', { name: /Simular/ })).toBeDisabled();

    // El límite superior se rechaza igual…
    await campo.fill('1000');
    await expect(page.locator('#aviso-tamano-poblacion')).toBeVisible();
    await expect(page.getByRole('button', { name: /Simular/ })).toBeDisabled();
    // …y un valor válido no deja aviso ninguno.
    await campo.fill('50');
    await expect(page.locator('#aviso-tamano-poblacion')).toHaveCount(0);
    await expect(campo).toHaveValue('50');
    // Y se simula ESE tamaño, no el último aceptado (hallazgo 1203).
    await page.getByRole('button', { name: /Simular/ }).click();
    await expect(page.locator('[class*="populationIndividual"]')).toHaveCount(50);
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

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE (añadido el 14/09/2026) — va DETRÁS del acta del Inspector a propósito:
 * el acta de arriba es el contrato de la app y no se toca.
 *
 * Estas pruebas NO abren el navegador: importan `casos.ts` y comprueban la genética a pelo.
 * El build compila la página sin mirar si un cruce está bien resuelto, así que esto es lo
 * único que impide que la app corrija mal a un alumno.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO — a mano desde las leyes de Mendel, NUNCA copiado de
 * lo que devuelve la app (si se copiara, el test bendeciría cualquier error del motor):
 *
 *   1  Aa × Aa → verdes (aa)            1 de 4 casillas          = 25 %
 *   2  Aa × Aa → genotipo Aa            2 de 4 (Aa y aA)         = 50 %
 *   3  AA × aa → amarillas              4 de 4, toda la F1 es Aa = 100 %
 *   4  Aa × aa → verdes                 2 de 4                   = 50 %
 *   5  Tt × Tt → enanas de 240          1/4 × 240                = 60 plantas
 *   6  AaRr × AaRr → amarilla y lisa    9 de 16                  = 56,25 %
 *   7  AaRr × AaRr → verde y rugosa     1 de 16                  = 6,25 %
 *   8  AaRr × AaRr → amar. rugosa/320   3/16 × 320               = 60 semillas
 *   9  Rr × Rr → rosas (incompleta)     2 de 4; aquí es 1:2:1    = 50 %
 *  10  RR × rr → rosas                  4 de 4, toda la F1 es Rr = 100 %
 *  11  Xd Y × XD Xd → hijas daltónicas  1 de 4 (Xd Xd)           = 25 %
 *  12  XD Y × Xd Xd → hijos daltónicos  2 de 4 (Xd Y)            = 50 %
 *  13  Iᴬi × Iᴮi → grupo O (ii)         1 de 4 (IᴬIᴮ, Iᴬi, Iᴮi, ii) = 25 %
 *  14  IᴬIᴮ × ii → grupo A              2 de 4 (Iᴬi, Iᴬi, Iᴮi, Iᴮi) = 50 %
 *  15  IᴬIᴮ × Iᴬi → genotipo Iᴬi        1 de 4 (IᴬIᴬ, Iᴬi, IᴬIᴮ, Iᴮi) = 25 %
 *  16  Iᴬi Dd × Iᴮi Dd → O y Rh−        1/4 (ii) × 1/4 (dd) = 1/16  = 6,25 %
 *
 * Los del 6 al 8 son el 9:3:3:1 clásico; el 9 y el 10 son el contraejemplo de dominancia
 * incompleta, donde el heterocigoto NO se parece al dominante.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import {
  CASOS,
  TOTAL_CASOS,
  resolverCaso,
  toleranciaDe,
  comprobarRespuesta,
  generarEjercicioAleatorio,
} from '../../app/simulador-genetica/casos';

/** Resueltos a mano arriba. Si el motor discrepa, manda esta tabla hasta demostrar lo contrario. */
const A_MANO: Readonly<Record<number, number>> = {
  1: 25,
  2: 50,
  3: 100,
  4: 50,
  5: 60,
  6: 56.25,
  7: 6.25,
  8: 60,
  9: 50,
  10: 100,
  11: 25,
  12: 50,
  13: 25,
  14: 50,
  15: 25,
  16: 6.25,
};

test.describe('simulador-genetica · casos para clase', () => {
  test('1 · hay 16 casos con ids 1..16 sin huecos', async () => {
    // 12 hasta el 24/09/2026; del 13 al 16 son el grupo sanguíneo ABO y el factor Rh.
    expect(TOTAL_CASOS).toBe(16);
    expect(CASOS.map((c) => c.id)).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
  });

  test('2 · son deterministas: dos lecturas dan lo mismo', async () => {
    // Es lo único que hace que «resuelve los casos 3, 7 y 11» funcione como consigna.
    for (const caso of CASOS) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok).toBe(true);
      expect(b.valor).toBe(a.valor);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', async () => {
    // Caza a quien edite un enunciado y olvide actualizar la solución.
    for (const caso of CASOS) {
      const recalculado = resolverCaso(caso.datos);
      expect(recalculado.ok, `caso ${caso.id}: ${recalculado.error ?? ''}`).toBe(true);
      expect(Math.round(recalculado.valor * 100) / 100, `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta no vacía, respuesta finita y desarrollo', async () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThan(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    // El 91,4 % de este canal es de fuera de España: un enunciado anclado excluye a la mayoría.
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Madrid|Barcelona|Bogotá|Lima|Ciudad de México|euros?|dólares?|pesos?)\b/i;
    for (const caso of CASOS) {
      expect(PROHIBIDO.test(`${caso.titulo} ${caso.enunciado}`), `caso ${caso.id}`).toBe(false);
    }
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', async () => {
    // Reproducible por semilla…
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);

    // …y la respuesta sale del MISMO resolverCaso que los fijos, no de otra cuenta.
    expect(Math.round(resolverCaso(a.datos).valor * 100) / 100).toBe(a.respuesta);

    // La variedad se comprueba a propósito: la primera versión era reproducible y aun así
    // devolvía SIEMPRE el mismo ejercicio (xorshift32 sembrado con enteros pequeños daba
    // el índice 0 una y otra vez). Reproducible no implica variado.
    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.map((m) => m.respuesta)).size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      expect(Number.isFinite(m.respuesta)).toBe(true);
      expect(m.respuesta).toBeGreaterThan(0); // preguntar por un fenotipo que el cruce no da no enseña nada
    }
  });

  test('7 · el convenio de la app queda fijado: proporciones sobre el TOTAL y sexo en el fenotipo', async () => {
    // (a) Todas las respuestas, contra la tabla resuelta a mano de la cabecera.
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO[caso.id]);
    }

    // (b) Ligado al X: el sexo forma parte de la clave del fenotipo. «Daltónico» a secas no
    // existe —son dos casillas distintas—, y pedirlo debe fallar limpio, no lanzar.
    const sinSexo = resolverCaso({
      tipo: 'ligado-sexo',
      organismo: 'humanos',
      rasgo: 'daltonismo',
      padre: 'Xd Y',
      madre: 'XD Xd',
      busca: { clase: 'fenotipo', clave: 'Daltónico', magnitud: 'porcentaje' },
    });
    expect(sinSexo.ok).toBe(false);
    expect(sinSexo.error).toContain('Daltónico (♀)');

    // (c) Y el total de ese cruce reparte 25 % a cada una de las cuatro casillas.
    const conSexo = (clave: string) =>
      resolverCaso({
        tipo: 'ligado-sexo',
        organismo: 'humanos',
        rasgo: 'daltonismo',
        padre: 'Xd Y',
        madre: 'XD Xd',
        busca: { clase: 'fenotipo', clave, magnitud: 'porcentaje' },
      }).valor;
    expect(conSexo('Daltónico (♀)')).toBe(25);
    expect(conSexo('Daltónico (♂)')).toBe(25);
    expect(conSexo('Visión normal (♀)')).toBe(25);
    expect(conSexo('Visión normal (♂)')).toBe(25);

    // (d) Dominancia incompleta: el heterocigoto tiene fenotipo propio, así que Rr × Rr es
    // 1:2:1 y NO 3:1. Es el contraejemplo que distingue los dos modos de herencia.
    const rosa = resolverCaso(CASOS[8].datos).valor;
    expect(rosa).toBe(50);
    const rojo = resolverCaso({
      tipo: 'monohibrido',
      organismo: 'flores',
      rasgo: 'color-flor',
      padre: 'Rr',
      madre: 'Rr',
      busca: { clase: 'fenotipo', clave: 'Rojo', magnitud: 'porcentaje' },
    }).valor;
    expect(rojo).toBe(25); // con dominancia COMPLETA habrían sido 75

    // (e) Genotipo ≠ fenotipo en el mismo cruce: 75 % amarillas pero solo 50 % Aa.
    const fenotipo = resolverCaso({
      tipo: 'monohibrido',
      organismo: 'guisantes',
      rasgo: 'color-semilla',
      padre: 'Aa',
      madre: 'Aa',
      busca: { clase: 'fenotipo', clave: 'Amarillo', magnitud: 'porcentaje' },
    }).valor;
    expect(fenotipo).toBe(75);
    expect(CASOS[1].respuesta).toBe(50);
  });

  test('8 · corregir no lanza nunca, ni con entradas que no son números', async () => {
    // Un throw dentro del render tumbaría la app entera; aquí todo sale como veredicto.
    // 22/09/2026 (1207): la magnitud es un argumento OBLIGATORIO, para que nadie pueda volver
    // a corregir sin saber en qué unidad está la respuesta.
    expect(comprobarRespuesta(25, 25, 'porcentaje').correcto).toBe(true);
    expect(comprobarRespuesta(25.2, 25, 'porcentaje').correcto).toBe(true); // dentro del 1 %
    expect(comprobarRespuesta(30, 25, 'porcentaje').correcto).toBe(false);
    expect(comprobarRespuesta(NaN, 25, 'porcentaje').correcto).toBe(false);
    expect(comprobarRespuesta(NaN, 25, 'porcentaje').motivo).toContain('número');

    // La tolerancia nunca baja de 0,01, para que el 6,25 del caso 7 no se corrija a ciegas.
    expect(toleranciaDe(0)).toBe(0.01);
    expect(toleranciaDe(6.25)).toBe(0.0625);
    expect(toleranciaDe(100)).toBe(1);

    // Y un cruce que no produce el fenotipo pedido informa de lo que sí produce.
    const imposible = resolverCaso({
      tipo: 'monohibrido',
      organismo: 'guisantes',
      rasgo: 'color-semilla',
      padre: 'AA',
      madre: 'AA',
      busca: { clase: 'fenotipo', clave: 'Verde', magnitud: 'porcentaje' },
    });
    expect(imposible.ok).toBe(false);
    expect(imposible.error).toContain('Amarillo');

    // Un organismo inexistente tampoco lanza.
    const inventado = resolverCaso({
      tipo: 'monohibrido',
      organismo: 'unicornios',
      rasgo: 'color-cuerno',
      padre: 'Aa',
      madre: 'Aa',
      busca: { clase: 'fenotipo', clave: 'Dorado', magnitud: 'porcentaje' },
    });
    expect(inventado.ok).toBe(false);
    expect(Number.isNaN(inventado.valor)).toBe(true);
  });
});

/* ───────────────────────────────────────────────────────────────────────────────────────
 * La sección en el NAVEGADOR. Lo de arriba prueba la genética; esto prueba que la sección
 * existe, corrige de verdad y no rompe la app (PASO 4.bis de /nueva-app-meskeia: tiene
 * estado interactivo, así que no basta con que compile).
 * ─────────────────────────────────────────────────────────────────────────────────────── */

test.describe('simulador-genetica · la sección de casos en el navegador', () => {
  const CAMPO = '#casos-respuesta';
  /** La app ya tenía su propio role="alert" (el aviso del tamaño de población), así que el
   *  veredicto se localiza ACOTADO a la sección de casos y no por rol a secas. */
  const veredicto = (page: Page) => page.locator('[class*="casoVeredicto"]');

  test('corrige bien la respuesta correcta y la equivocada', async ({ page }) => {
    await page.goto(RUTA);
    // Sin esta espera el fill escribiría en el DOM sin llegar al estado de React, y el test
    // pasaría midiendo otro escenario (ver tests/apps/_hidratacion.ts).
    await esperarHidratacion(page, [CAMPO]);

    await expect(page.getByRole('heading', { name: /Casos para clase/ })).toBeVisible();

    // Caso 1: Aa × Aa → 25 % de semillas verdes.
    await page.getByRole('button', { name: /^Caso 1:/ }).click();
    await page.locator(CAMPO).fill('25');
    await esperarValorEnReact(page, CAMPO, '25');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(veredicto(page)).toContainText('¡Correcto!');

    // Y la equivocada no cuela.
    await page.locator(CAMPO).fill('75'); // 75 es el % de AMARILLAS, el error clásico
    await esperarValorEnReact(page, CAMPO, '75');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(veredicto(page)).toContainText('No es correcto');
  });

  test('admite la coma decimal española y rechaza lo que no es un número', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO]);

    // Caso 6: dihíbrido 9/16 = 56,25 %. Con coma, que es como lo escribe el alumno.
    await page.getByRole('button', { name: /^Caso 6:/ }).click();
    await page.locator(CAMPO).fill('56,25');
    await esperarValorEnReact(page, CAMPO, '56,25');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(veredicto(page)).toContainText('¡Correcto!');

    // Y una entrada que no es número pide un número, sin pintar «NaN» en ninguna parte.
    await page.locator(CAMPO).fill('no sé');
    await esperarValorEnReact(page, CAMPO, 'no sé');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(veredicto(page)).toContainText('Escribe un número');
    await expect(page.locator('body')).not.toContainText('NaN');
  });

  test('la solución se despliega y el caso elegido se anuncia', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO]);

    const caso3 = page.getByRole('button', { name: /^Caso 3:/ });
    await caso3.click();
    await expect(caso3).toHaveAttribute('aria-pressed', 'true');

    const verSolucion = page.getByRole('button', { name: /Ver solución/ });
    await expect(verSolucion).toHaveAttribute('aria-expanded', 'false');
    await verSolucion.click();
    await expect(page.getByRole('button', { name: /Ocultar solución/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    // Caso 3: AA × aa, toda la F1 es amarilla.
    await expect(page.locator('[class*="casoSolucion"]')).toContainText('100');
  });

  test('el simulador de arriba sigue funcionando con la sección añadida', async ({ page }) => {
    // La regresión que importa: añadir una sección no puede haber roto la app.
    await page.goto(RUTA);
    await expect(genotiposDeCelda(page)).toHaveText(['AA', 'Aa', 'Aa', 'aa']);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN · 14/09/2026 (Opus 5)
 *
 * Contexto: la app se inspeccionó el 20/08/2026 con 10 hallazgos (uno crítico, uno alto) y
 * todos constan reparados; el 12/09/2026 se le añadieron los 12 casos de aula (`casos.ts`),
 * que eran código sin inspeccionar. Esta tanda vuelve a resolver la genética A MANO y la
 * compara con la pantalla, y añade lo que la primera inspección no llegó a tocar: el árbol
 * genealógico, la combinación dihíbrido + rasgo ligado al X, y la coherencia entre el bloque
 * educativo y lo que la herramienta imprime.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 * (tabla de rasgos: organisms.ts — A/a amarillo-verde, R/r lisa-rugosa, XD/Xd daltonismo)
 *
 *   CASO 1 (normal) — Aa × Aa, guisantes, color de semilla
 *       gametos A,a × gametos A,a →   |  A  |  a
 *                                  A  | AA  | Aa
 *                                  a  | Aa  | aa
 *       genotipos  AA 1/4=25 % · Aa 2/4=50 % · aa 1/4=25 %   (1:2:1)
 *       fenotipos  Amarillo (AA+Aa) 3/4=75 % · Verde (aa) 1/4=25 %   (3:1)
 *       cada celda 1/4 = 25,0 %; cada gameto 50 %
 *       Y el caso de aula 1 pregunta justo el 25 % de verdes.
 *
 *   CASO 2 (límite) — dihíbrido con un progenitor HOMOCIGOTO: AA Rr × aa Rr
 *       gametos del padre AA Rr: A×{R,r} = AR, Ar   → la rejilla los repite: AR AR Ar Ar
 *       gametos de la madre aa Rr: a×{R,r} = aR, ar →                          aR aR ar ar
 *       el rasgo 1 es invariable: A del padre + a de la madre = Aa en las 16 casillas
 *       el rasgo 2 es un Rr × Rr corriente: RR 4/16 · Rr 8/16 · rr 4/16
 *       genotipos  Aa RR 25 % · Aa Rr 50 % · Aa rr 25 %   (1:2:1)
 *       fenotipos  Amarillo/Lisa (RR+Rr) 12/16 = 75 % · Amarillo/Rugosa 4/16 = 25 %   (3:1)
 *       cada celda 1/16 = 6,25 % → «6,3%»
 *     Y el otro límite, la herencia ligada al X con la MADRE afectada (caso de aula 12):
 *       padre XD Y × madre Xd Xd → la madre solo puede dar Xd
 *          |  XD     |  Y
 *       Xd | XD Xd   | Xd Y
 *       Xd | XD Xd   | Xd Y
 *       todas las hijas portadoras sanas (50 %) y todos los hijos daltónicos (50 %)
 *
 *   CASO 3 (rechazo) — no hay campo libre de genotipo (todo son <select>), así que lo
 *       rechazable es: (a) el tamaño de población, declarado min=10 max=500 → 5 y 600 deben
 *       rechazarse CON aviso y sin simular; (b) la respuesta del alumno en Casos para clase,
 *       donde «9/16» no es un número y debe decirse, sin que aparezca «NaN» en pantalla.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

/** Quita el icono del principio de una fila de Estadísticas: el emoji no es lo que se juzga. */
const sinIcono = (filas: string[]) => filas.map((f) => f.replace(/^\S+\s/, ''));

test.describe('Re-inspección 14/09/2026 · los tres casos', () => {
  test('CASO 1 (normal) · Aa × Aa da 1:2:1 genotípico y 3:1 fenotípico', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta']);
    // Arranque por defecto: Guisantes · Color de semilla · Aa × Aa.
    await expect(selectorGenotipo(page, 0)).toHaveValue('Aa');
    await expect(selectorGenotipo(page, 1)).toHaveValue('Aa');

    // Cuadro resuelto a mano en la cabecera, leído por filas.
    await expect(genotiposDeCelda(page)).toHaveText(['AA', 'Aa', 'Aa', 'aa']);
    await expect(fenotiposDeCelda(page)).toHaveText([
      'Amarillo',
      'Amarillo',
      'Amarillo',
      'Verde',
    ]);
    // Las cuatro casillas son igual de probables: 1/4 = 25,0 % (coma decimal española).
    expect(await probabilidadesDeCelda(page).allInnerTexts()).toEqual([
      '25,0%',
      '25,0%',
      '25,0%',
      '25,0%',
    ]);
    const [columnas, filas] = await cabeceras(page);
    expect(columnas).toEqual(['A (50%)', 'a (50%)']);
    expect(filas).toEqual(['A (50%)', 'a (50%)']);

    // Proporciones: 25/50/25 y 75/25, calculadas arriba.
    const { genotipos, fenotipos } = await estadisticas(page);
    expect(genotipos.filas).toEqual(['Aa 50%', 'AA 25%', 'aa 25%']);
    expect(sinIcono(fenotipos.filas)).toEqual(['Amarillo 75%', 'Verde 25%']);
    expect(fenotipos.ratio).toContain('Ratio: 3:1');

    // Y el caso de aula 1 pregunta ese mismo 25 % de semillas verdes.
    await page.getByRole('button', { name: /^Caso 1:/ }).click();
    await page.locator('#casos-respuesta').fill('25');
    await esperarValorEnReact(page, '#casos-respuesta', '25');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(page.locator('[class*="casoVeredicto"]')).toContainText('¡Correcto!');
  });

  test('CASO 2 (límite) · dihíbrido con un progenitor homocigoto, y ligado al X con la madre afectada', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta']);

    // ── (a) AA Rr × aa Rr. Es el caso que rompía el cuadro antes del 21/08/2026: con un
    // progenitor homocigoto la rejilla NO se colapsa, repite el gameto.
    await page.getByRole('button', { name: 'Dihíbrido', exact: true }).click();
    await expect(selectorRasgo(page, 1)).toHaveValue('forma-semilla');
    await selectorGenotipo(page, 0).selectOption('AA'); // padre, rasgo 1
    await selectorGenotipo(page, 1).selectOption('aa'); // madre, rasgo 1
    // Rasgo 2 se queda en Rr × Rr, que es el valor por defecto.
    await expect(selectorGenotipo(page, 2)).toHaveValue('Rr');
    await expect(selectorGenotipo(page, 3)).toHaveValue('Rr');

    // Sin pulsar «Realizar Cruce»: el recálculo automático es la reparación (c) del 21/08.
    const [columnas, filas] = await cabeceras(page);
    expect(columnas).toEqual(['AR (25%)', 'AR (25%)', 'Ar (25%)', 'Ar (25%)']);
    expect(filas).toEqual(['aR (25%)', 'aR (25%)', 'ar (25%)', 'ar (25%)']);
    // Rasgo 1 invariable (Aa en las 16) y rasgo 2 con el 1:2:1 de un Rr × Rr, leído por filas.
    await expect(genotiposDeCelda(page)).toHaveText([
      'Aa RR', 'Aa RR', 'Aa Rr', 'Aa Rr',
      'Aa RR', 'Aa RR', 'Aa Rr', 'Aa Rr',
      'Aa Rr', 'Aa Rr', 'Aa rr', 'Aa rr',
      'Aa Rr', 'Aa Rr', 'Aa rr', 'Aa rr',
    ]);
    expect(await probabilidadesDeCelda(page).allInnerTexts()).toEqual(Array(16).fill('6,3%'));

    const dihibrido = await estadisticas(page);
    expect(dihibrido.genotipos.filas).toEqual(['Aa Rr 50%', 'Aa RR 25%', 'Aa rr 25%']);
    // 12/16 lisas y 4/16 rugosas: el 3:1 del rasgo 2, con el rasgo 1 fijado en amarillo.
    expect(sinIcono(dihibrido.fenotipos.filas)).toEqual([
      'Amarillo / Lisa 75%',
      'Amarillo / Rugosa 25%',
    ]);
    expect(dihibrido.fenotipos.ratio).toContain('Ratio: 3:1');

    // ── (b) Ligado al X con la madre afectada: XD Y × Xd Xd (caso de aula 12).
    await page.getByRole('button', { name: 'Monohíbrido', exact: true }).click();
    await abreDaltonismo(page);
    await selectorGenotipo(page, 1).selectOption('Xd Xd');
    // `estadisticas()` deja abierta la pestaña Estadísticas: hay que volver al cuadro.
    await pestana(page, 'Punnett').click();

    // La madre solo da Xd, así que toda hija es portadora y todo hijo es daltónico.
    await expect(genotiposDeCelda(page)).toHaveText(['XD Xd', 'Xd Y', 'XD Xd', 'Xd Y']);
    await expect(fenotiposDeCelda(page)).toHaveText([
      'Visión normal (♀)',
      'Daltónico (♂)',
      'Visión normal (♀)',
      'Daltónico (♂)',
    ]);
    const ligado = await estadisticas(page);
    expect(ligado.genotipos.filas).toEqual(['XD Xd 50%', 'Xd Y 50%']);
    expect(sinIcono(ligado.fenotipos.filas)).toEqual([
      'Visión normal (♀) 50%',
      'Daltónico (♂) 50%',
    ]);

    // Y el caso de aula 12 pregunta ese 50 % de hijos varones daltónicos sobre el TOTAL.
    await page.getByRole('button', { name: /^Caso 12:/ }).click();
    await page.locator('#casos-respuesta').fill('50');
    await esperarValorEnReact(page, '#casos-respuesta', '50');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(page.locator('[class*="casoVeredicto"]')).toContainText('¡Correcto!');
  });

  test('CASO 3 (rechazo) · población fuera de [10, 500] y respuesta que no es un número', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta']);

    // ── (a) Tamaño de población. El campo declara su propio rango.
    await pestana(page, 'Población').click();
    const campo = campoPoblacion(page);
    await expect(campo).toHaveAttribute('min', '10');
    await expect(campo).toHaveAttribute('max', '500');
    await expect(campo).toHaveValue('100');

    // 5 está por debajo del mínimo declarado: se rechaza, se DICE por qué y no se simula.
    await campo.fill('5');
    await expect(page.locator('#aviso-tamano-poblacion')).toHaveText(
      'El tamaño de la población debe estar entre 10 y 500 individuos.',
    );
    await expect(campo).toHaveAttribute('aria-invalid', 'true');
    // 22/09/2026 (1203): lo escrito se conserva y lo que se bloquea es simular.
    await expect(campo).toHaveValue('5');
    await expect(page.getByRole('button', { name: /Simular/ })).toBeDisabled();

    // 600 está por encima del máximo: mismo trato.
    await campo.fill('600');
    await expect(page.locator('#aviso-tamano-poblacion')).toBeVisible();
    await expect(page.getByRole('button', { name: /Simular/ })).toBeDisabled();

    // Y un valor dentro del rango entra sin aviso y se simula con ese tamaño exacto.
    await campo.fill('200');
    await expect(page.locator('#aviso-tamano-poblacion')).toHaveCount(0);
    await expect(campo).toHaveValue('200');
    await page.getByRole('button', { name: /Simular/ }).click();
    await expect(page.locator('[class*="populationIndividual"]')).toHaveCount(200);

    // ── (b) Respuesta del alumno que no es un número.
    await page.getByRole('button', { name: /^Caso 6:/ }).click();
    await page.locator('#casos-respuesta').fill('9/16');
    await esperarValorEnReact(page, '#casos-respuesta', '9/16');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(page.locator('[class*="casoVeredicto"]')).toContainText('Escribe un número');
    // Y en ninguna parte de la pantalla aparece «NaN».
    await expect(page.locator('body')).not.toContainText('NaN');

    // La misma casilla, con la respuesta buena escrita a la española, sí se acepta.
    await page.locator('#casos-respuesta').fill('56,25');
    await esperarValorEnReact(page, '#casos-respuesta', '56,25');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(page.locator('[class*="casoVeredicto"]')).toContainText('¡Correcto!');
  });
});

/**
 * HALLAZGOS ABIERTOS del 14/09/2026. Todos fallan HOY a propósito: afirman lo que debería
 * pasar. El día que se reparen, quitar el `test.fail()` y quedan como regresión.
 */
test.describe('Re-inspección 14/09/2026 · hallazgos abiertos', () => {
  test('el árbol genealógico se rehace al cambiar el genotipo de un progenitor', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await pestana(page, 'Pedigree').click();
    const genotiposArbol = page.locator('[class*="pedigreeGenotype"]');
    await expect(genotiposArbol.first()).toHaveText('Aa'); // cruce de partida Aa × Aa

    // El cruce pasa a ser AA × Aa: ningún hijo puede salir aa, y el padre ya no es Aa.
    await selectorGenotipo(page, 0).selectOption('AA');

    // Que el Punnett sí se rehace se comprueba en SU pestaña: estando en Pedigree, las
    // celdas del cuadro no están en el DOM y el localizador resolvía a 0 elementos.
    await pestana(page, 'Punnett').click();
    await expect(genotiposDeCelda(page)).toHaveText(['AA', 'AA', 'Aa', 'Aa']);
    await pestana(page, 'Pedigree').click();

    // `generatePedigree()` solo se llama al pulsar la pestaña y solo si aún no hay árbol, y
    // nada vuelve a nulo `pedigreeChart` cuando cambia un genotipo: el árbol se queda con el
    // cruce anterior, diciendo «padre Aa» mientras el selector de al lado dice AA.
    const genotipos = await genotiposArbol.allInnerTexts();
    expect(genotipos[0]).toBe('AA');
    expect(genotipos).not.toContain('aa');
  });

  test('el árbol genealógico no se queda colgado al cambiar de característica', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await pestana(page, 'Pedigree').click();
    await expect(page.locator('[class*="pedigreeGenotype"]').first()).toBeVisible();

    // Cambiar de rasgo pone `pedigreeChart` a null, pero nadie lo regenera mientras no se
    // vuelva a pulsar la pestaña: el panel se queda en «Generando árbol genealógico…» para
    // siempre (comprobado 4 s después), y hay que salir a otra pestaña y volver.
    await selectorRasgo(page, 0).selectOption('altura-planta');
    await expect(page.locator('[class*="pedigreeGenotype"]').first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('body')).not.toContainText('Generando árbol genealógico');
  });

  test('un rasgo ligado al X no puede quedarse dentro de un cruce dihíbrido', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Humanos/ }).click();
    await page.getByRole('button', { name: 'Dihíbrido', exact: true }).click();

    // Elegir Daltonismo como Característica 1 sin salir de dihíbrido: `crossType` se queda en
    // 'dihybrid' y `selectedTrait2` también, así que el motor parte «XD Y» por caracteres y
    // fabrica genotipos que no existen («XX DD», «YX dL»), todos con fenotipo Desconocido.
    // Además desaparece el conmutador Monohíbrido/Dihíbrido, así que no hay vuelta evidente.
    await selectorRasgo(page, 0).selectOption('daltonismo');
    const genotipos = await genotiposDeCelda(page).allInnerTexts();
    expect(genotipos).not.toContain('XX DD');
    await expect(fenotiposDeCelda(page).first()).not.toHaveText('Desconocido / Desconocido');
  });

  /**
   * ⚠️ REPARADO el 14/09/2026 de otra forma que la que proponía el acta, y por qué.
   *
   * El defecto: las barras salen ordenadas de mayor a menor (Aa 50 %, AA 25 %, aa 25 %) y la
   * línea «Ratio:» se arma en el orden en que el motor descubre los genotipos (AA, Aa, aa),
   * así que decía «1:2:1» con el primer «1» cayendo sobre la barra de Aa, que vale 2. Sin
   * etiquetas, el único orden que el lector puede suponer es el de las barras.
   *
   * El acta esperaba «2:1:1», es decir, reordenar el ratio como las barras. Eso alinea las
   * dos lecturas pero destruye la forma en que el ratio se enseña: «1:2:1» es la 1.ª ley de
   * Mendel y «9:3:3:1» la 2.ª, y son las cifras que el alumno tiene que reconocer de un
   * vistazo. Lo que sobraba no era el orden —el del motor ES el canónico— sino que los
   * números fueran anónimos. Con la leyenda detrás, el ratio se lee solo y da igual el orden
   * de las barras, que se quedan de mayor a menor porque así se comparan mejor.
   *
   * Este caso comprueba las dos cosas: que la cifra canónica sigue intacta y que cada número
   * va nombrado, que es lo que cierra la ambigüedad.
   */
  test('la línea «Ratio:» dice a qué genotipo corresponde cada número', async ({ page }) => {
    await page.goto(RUTA);
    const { genotipos } = await estadisticas(page);
    expect(genotipos.filas).toEqual(['Aa 50%', 'AA 25%', 'aa 25%']);

    // La cifra canónica, en el orden del motor (AA : Aa : aa)
    expect(genotipos.ratio).toContain('Ratio: 1:2:1');
    // Y la leyenda que dice cuál es cuál, sin la que «1:2:1» no se puede casar con las barras
    expect(genotipos.ratio).toContain('AA · Aa · aa');
  });

  test('los decimales se escriben con coma también en los casos y en el chi-cuadrado', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta']);

    // (1) El desarrollo de la solución interpola el número a pelo: «9/16 = 56.25 %».
    await page.getByRole('button', { name: /^Caso 6:/ }).click();
    await page.getByRole('button', { name: /Ver solución/ }).click();
    await expect(page.locator('[class*="casoPasos"]')).toContainText('56,25');
    await expect(page.locator('[class*="casoPasos"]')).not.toContainText('56.25');

    // (2) El mensaje de corrección, igual: «Te has desviado 0.75 de la respuesta».
    await page.locator('#casos-respuesta').fill('57');
    await esperarValorEnReact(page, '#casos-respuesta', '57');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(page.locator('[class*="casoVeredicto"]')).toContainText('0,75');

    // (3) Y el p-valor del chi-cuadrado, que era una cadena fija en population.ts: «p > 0.5».
    //
    // ⚠️ El cruce es Aa × Aa —el de partida— y NO AA × aa como se escribió primero: con un
    // solo fenotipo no hay grados de libertad y desde la reparación del hallazgo 832 la app
    // dice que el test no procede, en vez de fingir un ajuste excelente. Los dos hallazgos
    // se cruzaban en el mismo caso. El valor concreto del p depende del azar de la
    // simulación, así que lo que se fija es el SEPARADOR, que es de lo que trata este caso.
    await pestana(page, 'Población').click();
    await page.getByRole('button', { name: /Simular/ }).click();
    const interpretacion = page.locator('[class*="chiSquareInterpretation"]');
    await expect(interpretacion).toContainText(/p [<>] 0,\d/);
    await expect(interpretacion).not.toContainText(/0\.\d/);
  });

  test('la respuesta de un caso porcentual conserva el símbolo %', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta']);
    await page.getByRole('button', { name: /^Caso 1:/ }).click();
    await page.getByRole('button', { name: /Ver solución/ }).click();

    // `etiqueta.replace(/^%\s*/, '')` recorta el «%» del rótulo para no repetirlo… y con él se
    // va la unidad: queda «Respuesta: 25 de semillas verdes», que se lee como 25 semillas.
    // (`respuestaTexto` de casos.ts sí lo conserva, pero la vista no lo usa.)
    await expect(page.locator('[class*="casoResultado"]')).toContainText('%');
  });

  test('el bloque educativo no promete un porcentaje distinto del que imprime la app', async ({
    page,
  }) => {
    await page.goto(RUTA);

    // Lo que la app calcula para «hija portadora × marido sano» (XD Y × XD Xd, el cruce por
    // defecto del rasgo Daltonismo): sobre el TOTAL de la descendencia, un 25 % son hijos
    // varones daltónicos, porque la mitad de la descendencia son varones.
    await abreDaltonismo(page);
    const { fenotipos } = await estadisticas(page);
    expect(sinIcono(fenotipos.filas)).toContain('Daltónico (♂) 25%');

    // La tarjeta «Asesoramiento genético familiar» promete 50 % para ese mismo cruce (cuenta
    // sobre los varones, no sobre el total), mientras la primera tarjeta del mismo bloque usa
    // el convenio contrario («¿Probabilidad de hija daltónica? → 25 %», sobre el total). Es la
    // ambigüedad que casos.ts documenta y resuelve diciendo «del total de la descendencia».
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const guia = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(guia).not.toContain('50% hijos varones daltónicos');
  });

  test('la guía describe los ejes del cuadro como los dibuja la app', async ({ page }) => {
    await page.goto(RUTA);
    // El progenitor 1 (el padre, AA) ocupa las COLUMNAS y el progenitor 2 (la madre, Aa) las
    // filas: `gametesColumna = punnett.gametes1` en PunnettSquare.tsx.
    await selectorGenotipo(page, 0).selectOption('AA');
    const [columnas, filas] = await cabeceras(page);
    expect(columnas).toEqual(['A (50%)', 'A (50%)']);
    expect(filas).toEqual(['A (50%)', 'a (50%)']);

    // Y el paso 4 de la guía dice lo contrario, rematando con «El simulador hace esto
    // automáticamente en la pestaña Punnett».
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const guia = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(guia).not.toContain('gametos del progenitor 1 en las filas');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN · 22/09/2026 (Opus 5)
 *
 * Contexto: la tanda del 14/09/2026 dejó los 12 casos de aula resueltos a mano y en verde, y
 * el 22/09 solo se tocó el CSS (b7733c6d, contraste de cabeceras). Así que esta vuelta no
 * repite cruces ya cubiertos: va a lo que el spec anterior NO llega a tocar — el cruce 1:1,
 * la frecuencia que vale 1 (y la que ni existe), el panel de población frente a su propia
 * población, y el teclado sobre los dos controles editables de la página.
 *
 * QUÉ CRUCES CUBRÍA YA EL SPEC (para no repetirlos): Aa × Aa, AA × aa, aa+Aa en dihíbrido,
 * AaRr × AaRr, AA Rr × aa Rr, Rr × Rr y RR × rr de flores, y los tres cruces de daltonismo.
 * Los ratios ya fijados eran 3:1, 1:2:1, 9:3:3:1, 3:3:1:1 y 1:1:1:1.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 * (tabla de rasgos de organisms.ts: T = Alta dominante / t = Enana · A = Amarillo / a = Verde)
 *
 *   CASO 1 (normal) — EL RETROCRUZAMIENTO Tt × tt, guisantes, altura de planta.
 *       Es el cruce de prueba con el que se destapa un heterocigoto, y su ratio 1:1 no
 *       aparecía en ninguna parte del spec.
 *       gametos del padre Tt: T, t (columnas) · gametos de la madre tt: t, t (filas)
 *             |  T   |  t
 *          t  | Tt   | tt
 *          t  | Tt   | tt
 *       genotípica  Tt 2/4 = 50 % · tt 2/4 = 50 %            → 1:1
 *       fenotípica  Alta (Tt) 50 % · Enana (tt) 50 %          → 1:1
 *       cada casilla 1/4 = 25,0 % · cada gameto 50 %
 *       Lo que enseña: aquí genotipo y fenotipo coinciden en proporción, al revés que en
 *       Aa × Aa (75/25 fenotípico contra 25/50/25 genotípico).
 *
 *   CASO 2 (límite) — LA FRECUENCIA QUE VALE 1: aa × aa, el homocigoto recesivo consigo mismo.
 *       la madre y el padre solo pueden dar a  →  las cuatro casillas son aa
 *       genotípica  aa 4/4 = 100 %   ·   fenotípica  Verde 100 %
 *       y «Amarillo» NO es una casilla de este cuadro: su frecuencia no es 0, es que no
 *       existe como clave, que es justo lo que `resolverCaso` tiene que distinguir.
 *       En el panel de población: un solo fenotipo → 0 grados de libertad → el test χ² no
 *       procede (reparación del hallazgo 832), y observado = esperado = 100 % por construcción.
 *
 *   CASO 3 (rechazo) — LO QUE EL CORRECTOR DEBE RECHAZAR Y LO QUE DEBE ADMITIR.
 *       Caso 1 (Aa × Aa → 25 % de verdes) respondido de cinco formas:
 *         «25»    → correcto          «25%» y «25 %» → correcto (el alumno escribe la unidad,
 *                                       y `partesNumericas` recorta el símbolo pegado)
 *         «-25»   → incorrecto (una proporción negativa no existe)
 *         «1e3»   → no es un número: ni NaN en pantalla ni excepción
 *       El tamaño de población ya se probó con `fill()` el 14/09; aquí se teclea, que es lo
 *       que hace una persona (ver el primer hallazgo abierto de abajo).
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test.describe('Re-inspección 22/09/2026 · los tres casos', () => {
  test('CASO 1 (normal) · el retrocruzamiento Tt × tt da 1:1, que no es ni 3:1 ni 1:2:1', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta']);

    await selectorRasgo(page, 0).selectOption('altura-planta');
    await selectorGenotipo(page, 0).selectOption('Tt');
    await selectorGenotipo(page, 1).selectOption('tt');

    // Cuadro resuelto a mano en la cabecera, leído por filas.
    await expect(genotiposDeCelda(page)).toHaveText(['Tt', 'tt', 'Tt', 'tt']);
    await expect(fenotiposDeCelda(page)).toHaveText(['Alta', 'Enana', 'Alta', 'Enana']);
    expect(await probabilidadesDeCelda(page).allInnerTexts()).toEqual([
      '25,0%',
      '25,0%',
      '25,0%',
      '25,0%',
    ]);
    // La madre homocigota aporta el MISMO gameto en las dos filas: la rejilla no se colapsa.
    const [columnas, filas] = await cabeceras(page);
    expect(columnas).toEqual(['T (50%)', 't (50%)']);
    expect(filas).toEqual(['t (50%)', 't (50%)']);

    const { genotipos, fenotipos } = await estadisticas(page);
    expect(genotipos.filas).toEqual(['Tt 50%', 'tt 50%']);
    expect(genotipos.ratio).toContain('Ratio: 1:1');
    expect(genotipos.ratio).toContain('Tt · tt');
    expect(sinIcono(fenotipos.filas)).toEqual(['Alta 50%', 'Enana 50%']);
    expect(fenotipos.ratio).toContain('Ratio: 1:1');
    // Y las dos proporciones suman 100 %, que es lo que hace legible un cuadro de Punnett.
    const porcentajes = (f: string[]) =>
      f.reduce((s, x) => s + Number(x.match(/(\d+)%$/)?.[1] ?? 0), 0);
    expect(porcentajes(genotipos.filas)).toBe(100);
    expect(porcentajes(fenotipos.filas)).toBe(100);
  });

  test('CASO 2 (límite) · aa × aa: una frecuencia vale 1 y la otra ni siquiera existe', async ({
    page,
  }) => {
    // (a) Sin navegador: el motor de los casos de aula distingue «frecuencia 0» de «esa
    //     casilla no está en el cuadro», que es lo que impide corregir con un 0 inventado.
    const verde = resolverCaso({
      tipo: 'monohibrido',
      organismo: 'guisantes',
      rasgo: 'color-semilla',
      padre: 'aa',
      madre: 'aa',
      busca: { clase: 'fenotipo', clave: 'Verde', magnitud: 'porcentaje' },
    });
    expect(verde.ok).toBe(true);
    expect(verde.valor).toBe(100);

    const amarillo = resolverCaso({
      tipo: 'monohibrido',
      organismo: 'guisantes',
      rasgo: 'color-semilla',
      padre: 'aa',
      madre: 'aa',
      busca: { clase: 'fenotipo', clave: 'Amarillo', magnitud: 'porcentaje' },
    });
    expect(amarillo.ok).toBe(false);
    expect(amarillo.error).toContain('Verde');
    expect(Number.isNaN(amarillo.valor)).toBe(true);

    // Y el retrocruzamiento del caso 1, también por la vía sin navegador: 50 % de enanas.
    const enanas = resolverCaso({
      tipo: 'monohibrido',
      organismo: 'guisantes',
      rasgo: 'altura-planta',
      padre: 'Tt',
      madre: 'tt',
      busca: { clase: 'fenotipo', clave: 'Enana', magnitud: 'porcentaje' },
    });
    expect(enanas.valor).toBe(50);

    // (b) En pantalla: las cuatro casillas son aa y no hay más fenotipo que Verde.
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta']);
    await selectorGenotipo(page, 0).selectOption('aa');
    await selectorGenotipo(page, 1).selectOption('aa');
    await expect(genotiposDeCelda(page)).toHaveText(['aa', 'aa', 'aa', 'aa']);
    await expect(fenotiposDeCelda(page)).toHaveText(['Verde', 'Verde', 'Verde', 'Verde']);

    const { genotipos, fenotipos } = await estadisticas(page);
    expect(genotipos.filas).toEqual(['aa 100%']);
    expect(sinIcono(fenotipos.filas)).toEqual(['Verde 100%']);
    // Con una sola categoría el ratio es «1», no «1:0»: el amarillo no es una casilla vacía.
    expect(genotipos.ratio).toContain('Ratio: 1 (aa)');
    expect(fenotipos.ratio).not.toContain('Amarillo');

    // (c) Y el panel de población dice que el χ² no procede, en vez de fingir ajuste perfecto.
    await pestana(page, 'Población').click();
    await page.getByRole('button', { name: /Simular/ }).click();
    await expect(page.locator('[class*="populationIndividual"]')).toHaveCount(100);
    const chi = page.locator('[class*="chiSquare"]').first();
    await expect(chi).toContainText('no hay grados de libertad');
    await expect(chi).not.toContainText('Ajuste excelente');
  });

  test('CASO 3 (rechazo) · el corrector admite el símbolo % y rechaza lo que no es proporción', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta']);
    const campo = page.locator('#casos-respuesta');
    const veredicto = page.locator('[class*="casoVeredicto"]');
    const comprobar = page.getByRole('button', { name: 'Comprobar' });

    await page.getByRole('button', { name: /^Caso 1:/ }).click();

    // El alumno escribe la unidad que le pide el propio rótulo del campo.
    for (const escrito of ['25', '25%', '25 %']) {
      await campo.fill(escrito);
      await esperarValorEnReact(page, '#casos-respuesta', escrito);
      await comprobar.click();
      await expect(veredicto, `respuesta «${escrito}»`).toContainText('¡Correcto!');
    }

    // Una proporción negativa no existe: se rechaza, y desde el 1207 se dice POR QUÉ es
    // imposible en vez de cuánto se ha desviado, que es lo que se responde a una imprecisión.
    await campo.fill('-25');
    await esperarValorEnReact(page, '#casos-respuesta', '-25');
    await comprobar.click();
    await expect(veredicto).toContainText('no puede ser negativo');

    // Notación científica: `parseSpanishNumber` la da por no-número a propósito, y eso tiene
    // que llegar al alumno como una frase, nunca como «NaN» ni como una excepción.
    await campo.fill('1e3');
    await esperarValorEnReact(page, '#casos-respuesta', '1e3');
    await comprobar.click();
    await expect(veredicto).toContainText('Escribe un número');
    await expect(page.locator('body')).not.toContainText('NaN');
  });
});

/**
 * HALLAZGOS ABIERTOS del 22/09/2026. Todos fallan HOY a propósito: afirman lo que debería
 * pasar. El día que se reparen, quitar el `test.fail()` y quedan como regresión.
 */
test.describe('Re-inspección 22/09/2026 · hallazgos abiertos', () => {
  test('el campo «Tamaño de población» admite que se teclee un valor de su propio rango', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta']);
    await pestana(page, 'Población').click();
    const campo = campoPoblacion(page);
    await expect(campo).toHaveValue('100');

    // Seleccionar todo y teclear 50, que es lo que hace una persona. `handleSizeChange`
    // juzga cada pulsación por separado: el «5» intermedio cae fuera de [10, 500], se
    // rechaza, y React restaura el valor controlado, así que el siguiente dígito ya no se
    // pega a él. El 14/09 esto no se vio porque el spec usa `fill()`, que entrega el valor
    // entero en un solo evento — el único camino que la app deja abierto.
    await campo.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type('50', { delay: 50 });
    await expect(campo).toHaveValue('50');
    // Y el aviso no debe acusar de salirse de un rango en el que 50 sí está.
    await expect(page.locator('#aviso-tamano-poblacion')).toHaveCount(0);
  });

  test('la columna «Esperado» reparte exactamente la población que se ha simulado', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta']);
    await page.getByRole('button', { name: 'Dihíbrido', exact: true }).click();
    await page.getByRole('button', { name: /Realizar Cruce/ }).click();
    await pestana(page, 'Población').click();
    await campoPoblacion(page).fill('200');
    await page.getByRole('button', { name: /Simular/ }).click();
    await expect(page.locator('[class*="populationIndividual"]')).toHaveCount(200);

    // AaRr × AaRr sobre 200 individuos: 9/16, 3/16, 3/16 y 1/16 valen 112,5 · 37,5 · 37,5 ·
    // 12,5, y suman exactamente 200. `simulatePopulation` redondeaba cada uno por su cuenta
    // (Math.round, que sube los medios) y salía 113 + 38 + 38 + 13 = 202: dos individuos más de
    // los que hay, frente a una columna «Observado» que suma 200 porque cuenta individuos
    // reales. La frecuencia esperada no es un número de individuos sino una esperanza, así que
    // se publica con su decimal y el χ² se calcula con ella, no con la entera (hallazgo 1204).
    const totales = await page.evaluate(() =>
      [...document.querySelectorAll('[class*="resultColumn"]')].map((col) => ({
        titulo: (col as HTMLElement).innerText.split('\n')[0],
        total: [...col.querySelectorAll('[class*="resultRow"]')].reduce((s, f) => {
          // 22/09/2026: la esperanza lleva decimal (112,5 de 200), así que la regex tiene que
          // leerlo, y en español la coma es el separador decimal. Con `/^(\d+)/` la suma daba
          // 198 sobre una columna que suma exactamente 200.
          const texto = (f.querySelectorAll('span')[1] as HTMLElement | undefined)?.innerText ?? '';
          const n = Number((texto.match(/^([\d.]+(?:,\d+)?)/)?.[1] ?? '0').replace(/\./g, '').replace(',', '.'));
          return s + n;
        }, 0),
      })),
    );
    expect(totales.map((t) => t.total)).toEqual([200, 200]);
  });

  test('las dos columnas del panel de población enfrentan el mismo fenotipo en la misma fila', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta']);
    await page.getByRole('button', { name: 'Dihíbrido', exact: true }).click();
    await page.getByRole('button', { name: /Realizar Cruce/ }).click();
    await pestana(page, 'Población').click();
    await campoPoblacion(page).fill('200');

    // «Esperado» sale en el orden del cuadro de Punnett; «Observado» en el orden en que cada
    // fenotipo APARECIÓ en el sorteo, que cambia en cada corrida. Las dos columnas están
    // pegadas para leerse fila a fila y en 5 de 6 corridas no coinciden: se acaba comparando
    // «Verde / Lisa 48» con «Amarillo / Lisa 113». Seis corridas seguidas para que la
    // coincidencia por azar (~10 % cada una) no dé un verde falso.
    const ordenes: Array<[string[], string[]]> = [];
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: /Simular/ }).click();
      await expect(page.locator('[class*="populationIndividual"]')).toHaveCount(200);
      const lectura = await page.evaluate(() =>
        [...document.querySelectorAll('[class*="resultColumn"]')].map((col) =>
          [...col.querySelectorAll('[class*="resultRow"]')].map(
            (f) => (f.querySelectorAll('span')[0] as HTMLElement).innerText.trim(),
          ),
        ),
      );
      ordenes.push([lectura[0], lectura[1]]);
    }
    for (const [observado, esperado] of ordenes) {
      expect(observado).toEqual(esperado);
    }
  });

  test('1206 (regresión) — el corrector acepta la proporción que la propia app imprime', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta']);

    /*
      ⚠️ 22/09/2026 — el acta dejaba dos salidas («aceptada, o coherencia entre el panel y el
      corrector») y el testigo estaba escrito para la primera: relajar el corrector hasta que
      admitiera el «6» redondeado. Se elige la segunda, por el lado de la CIFRA: 6,25 % es lo
      que da el cuadro de Punnett de un dihíbrido, y el panel lo imprimía como «6 %» con
      `formatNumber(x, 0)`, perdiendo justo la precisión que el ejercicio pide calcular. Relajar
      el corrector a 0,5 habría hecho pasar por bueno un 56 donde toca 56,25 en un ejercicio de
      cálculo, que es lo contrario de lo que la sección enseña.
    */
    await page.getByRole('button', { name: 'Dihíbrido', exact: true }).click();
    await page.getByRole('button', { name: /Realizar Cruce/ }).click();
    const { fenotipos } = await estadisticas(page);
    const filas = sinIcono(fenotipos.filas);
    expect(filas).toContain('Verde / Rugosa 6,25%');
    expect(filas).toContain('Amarillo / Lisa 56,25%');
    // Y un porcentaje sin decimales sigue saliendo sin ellos: 25 %, no «25,00 %».
    await page.getByRole('button', { name: 'Monohíbrido', exact: true }).click();
    await page.getByRole('button', { name: /Realizar Cruce/ }).click();
    expect(sinIcono((await estadisticas(page)).fenotipos.filas).join(' ')).toContain('75%');

    // La sección dice «Resuélvelos con el cuadro de Punnett de arriba», y ahora lo que pone
    // arriba es exactamente lo que el corrector espera, en los dos casos del acta.
    await page.getByRole('button', { name: /^Caso 6:/ }).click();
    await page.locator('#casos-respuesta').fill('56,25');
    await esperarValorEnReact(page, '#casos-respuesta', '56,25');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(page.locator('[class*="casoVeredicto"]')).toContainText('¡Correcto!');

    await page.getByRole('button', { name: /^Caso 7:/ }).click();
    await page.locator('#casos-respuesta').fill('6,25');
    await esperarValorEnReact(page, '#casos-respuesta', '6,25');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(page.locator('[class*="casoVeredicto"]')).toContainText('¡Correcto!');
  });

  test('1207 (regresión) — el corrector no da por buena una proporción imposible', async () => {
    // Sin navegador: es aritmética de `comprobarRespuesta`. La tolerancia sigue siendo el mayor
    // entre 0,01 y el 1 % del valor esperado —con esperado = 100 vale 1—, y eso NO se ha
    // tocado: lo que se ha añadido es el DOMINIO de la magnitud, que se comprueba antes, porque
    // un «101 %» de la descendencia no es una respuesta imprecisa sino una que no puede existir.
    expect(toleranciaDe(100)).toBe(1);
    expect(comprobarRespuesta(101, 100, 'porcentaje').correcto).toBe(false);
    expect(comprobarRespuesta(-1, 100, 'porcentaje').correcto).toBe(false);
    // Y el 99, que sí entra en la tolerancia, sigue aceptándose: el dominio no la sustituye.
    expect(comprobarRespuesta(99, 100, 'porcentaje').correcto).toBe(true);

    // El mismo techo, en el caso 3 de verdad (AA × aa, toda la F1 amarilla).
    const caso3 = CASOS.find((c) => c.id === 3);
    expect(caso3?.respuesta).toBe(100);
    expect(caso3?.datos.busca.magnitud).toBe('porcentaje');
    expect(comprobarRespuesta(101, caso3?.respuesta ?? 0, 'porcentaje').correcto).toBe(false);

    // Y donde la unidad es un individuo entero no hay medias plantas (caso 5, 240 guisantes).
    const caso5 = CASOS.find((c) => c.id === 5);
    expect(caso5?.datos.busca.magnitud).toBe('individuos');
    expect(caso5?.respuesta).toBe(60);
    expect(comprobarRespuesta(60, 60, 'individuos').correcto).toBe(true);
    expect(comprobarRespuesta(60.5, 60, 'individuos').correcto).toBe(false);
  });

  test('1208 (regresión) — en modo Practicar no se ofrece un botón de pista sin pista', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta']);

    // En los casos numerados el botón está y despliega su pista.
    const pista = page.getByRole('button', { name: /pista/ });
    await expect(pista).toHaveCount(1);
    await expect(pista).toHaveAttribute('aria-expanded', 'false');
    await pista.click();
    await expect(page.locator('[class*="casoPista"]')).toHaveCount(1);

    /*
      ⚠️ 22/09/2026 — el acta dejaba las dos salidas abiertas («o no ofrecer el botón en este
      modo, o mostrar una pista») y el testigo estaba escrito para la segunda. Se elige la
      primera: el ejercicio aleatorio se genera con `generarEjercicioAleatorio`, cuyo tipo
      `Ejercicio` no tiene el campo, así que inventarle una pista sería escribir contenido
      nuevo para el hueco en vez de cerrar el hueco. Un control de despliegue no se ofrece
      cuando no hay nada que desplegar, y eso es lo que arregla el anuncio falso.
    */
    await page.getByRole('button', { name: /Practicar/ }).click();
    await expect(page.getByRole('button', { name: /pista/ })).toHaveCount(0);
    await expect(page.locator('[class*="casoPista"]')).toHaveCount(0);
    // La solución sí sigue estando, que es lo que el modo práctica ofrece de verdad.
    await expect(page.getByRole('button', { name: /solución/ })).toHaveCount(1);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * GRUPO SANGUÍNEO ABO Y FACTOR RH (añadido el 24/09/2026, semilla S0161)
 *
 * Hasta ese día la app contaba la codominancia «como referencia conceptual» y no la
 * simulaba: el ejercicio estándar del tema no se podía resolver. Tres alelos —Iᴬ e Iᴮ
 * codominantes, los dos dominantes sobre i—, que el motor guarda como A, B y O y la vista
 * escribe Iᴬ, Iᴮ, i.
 *
 * RESUELTOS A MANO, antes de mirar lo que da el motor:
 *
 *   Iᴬi × Iᴮi   gametos Iᴬ, i × Iᴮ, i
 *          |  Iᴬ   |  i
 *       Iᴮ | IᴬIᴮ  | Iᴮi       → AB · B
 *       i  | Iᴬi   | ii        → A  · O          → 25 % cada grupo (1:1:1:1)
 *
 *   Seis genotipos posibles: IᴬIᴬ, Iᴬi, IᴮIᴮ, Iᴮi, IᴬIᴮ, ii (tres alelos → 3·4/2 = 6).
 *
 *   Iᴬi Dd × Iᴮi Dd (ABO × Rh, independientes):
 *       O = 1/4 · Rh− = 1/4 → O y Rh− = 1/16 = 6,25 %
 *       AB y Rh+ = 1/4 · 3/4 = 3/16 = 18,75 %
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

import {
  HUMANOS,
  GUISANTES,
  getPossibleGenotypes,
  normalizeGenotype,
  generateMonohybridPunnett,
  generateDihybridPunnett,
  generateSimplePedigree,
  genotiposPorDefecto,
  notacionGenotipo,
} from '../../app/simulador-genetica/components/genetics';

const rasgoHumano = (id: string) => {
  const t = HUMANOS.traits.find((r) => r.id === id);
  if (!t) throw new Error(`No existe el rasgo ${id}`);
  return t;
};

test.describe('simulador-genetica · grupo sanguíneo ABO en el motor', () => {
  const abo = rasgoHumano('grupo-abo');
  const rh = rasgoHumano('factor-rh');

  test('tres alelos dan seis genotipos, normalizados con el alelo que manda delante', async () => {
    expect(getPossibleGenotypes(abo)).toEqual(['AA', 'AO', 'BB', 'BO', 'AB', 'OO']);
    expect(normalizeGenotype('OA', abo)).toBe('AO');
    expect(normalizeGenotype('BA', abo)).toBe('AB');
    expect(normalizeGenotype('OB', abo)).toBe('BO');
    // El cruce arranca en el de libro, el único que da los cuatro grupos.
    expect(genotiposPorDefecto(abo)).toEqual(['AO', 'BO']);
  });

  test('Iᴬi × Iᴮi da los cuatro grupos al 25 %', async () => {
    const cuadro = generateMonohybridPunnett('AO', 'BO', abo);
    const fenotipos = Object.fromEntries(
      Object.entries(cuadro.phenotypeRatios).map(([k, v]) => [k, v.count])
    );
    expect(fenotipos).toEqual({ 'Grupo AB': 0.25, 'Grupo B': 0.25, 'Grupo A': 0.25, 'Grupo O': 0.25 });
    // Ninguna casilla sin fenotipo: sería la marca de un genotipo mal ordenado.
    expect(cuadro.cells.every((c) => c.phenotype !== 'Desconocido')).toBe(true);
  });

  test('ABO × Rh es un dihíbrido independiente: O y Rh− = 1/16, AB y Rh+ = 3/16', async () => {
    const cuadro = generateDihybridPunnett('AO', 'Dd', 'BO', 'Dd', abo, rh);
    expect(cuadro.phenotypeRatios['Grupo O / Rh negativo'].count).toBe(1 / 16);
    expect(cuadro.phenotypeRatios['Grupo AB / Rh positivo'].count).toBe(3 / 16);
    expect(cuadro.cells.every((c) => !c.phenotype.includes('Desconocido'))).toBe(true);
  });

  test('en el árbol, el grupo O no es un «afectado» y el portador de i sí se marca', async () => {
    for (let i = 0; i < 5; i++) {
      const arbol = generateSimplePedigree('AO', 'BO', abo, 4);
      expect(arbol.individuals.some((ind) => ind.isAffected)).toBe(false);
      const padre = arbol.individuals.find((ind) => ind.id === 'p1');
      expect(padre?.isCarrier).toBe(true); // Iᴬi esconde un i
    }
    const sinI = generateSimplePedigree('AB', 'AA', abo, 4);
    expect(sinI.individuals.some((ind) => ind.isCarrier)).toBe(false);
  });

  test('la notación se traduce solo donde el rasgo la declara', async () => {
    expect(notacionGenotipo('AO', [abo])).toBe('Iᴬi');
    expect(notacionGenotipo('AB', [abo])).toBe('IᴬIᴮ');
    expect(notacionGenotipo('OO', [abo])).toBe('ii');
    // Genotipo dihíbrido y gameto dihíbrido: cada posición con su rasgo.
    expect(notacionGenotipo('AO Dd', [abo, rh])).toBe('Iᴬi Dd');
    expect(notacionGenotipo('Od', [abo, rh])).toBe('id');
    // El resto del catálogo de rasgos pasa intacto, incluido el ligado al sexo.
    expect(notacionGenotipo('Aa', [GUISANTES.traits[0]])).toBe('Aa');
    expect(notacionGenotipo('XD Y', [rasgoHumano('daltonismo')])).toBe('XD Y');
  });
});

test.describe('simulador-genetica · grupo sanguíneo ABO en el navegador', () => {
  async function abreABO(page: Page): Promise<void> {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Humanos/ }).click();
    await selectorRasgo(page, 0).selectOption('grupo-abo');
    await expect(selectorGenotipo(page, 0)).toHaveValue('AO');
    await expect(selectorGenotipo(page, 1)).toHaveValue('BO');
  }

  test('Iᴬi × Iᴮi se escribe con la notación de los libros y da 1:1:1:1', async ({ page }) => {
    await abreABO(page);

    // Los seis genotipos en el selector, escritos Iᴬ/Iᴮ/i.
    const opciones = await selectorGenotipo(page, 0).locator('option').allInnerTexts();
    expect(opciones.map((o) => o.trim())).toEqual(['IᴬIᴬ', 'Iᴬi', 'IᴮIᴮ', 'Iᴮi', 'IᴬIᴮ', 'ii']);

    // Columnas = gametos del padre (Iᴬ, i); filas = gametos de la madre (Iᴮ, i).
    const [columnas, filas] = await cabeceras(page);
    expect(columnas.map((c) => c.split(' ')[0])).toEqual(['Iᴬ', 'i']);
    expect(filas.map((f) => f.split(' ')[0])).toEqual(['Iᴮ', 'i']);
    await expect(genotiposDeCelda(page)).toHaveText(['IᴬIᴮ', 'Iᴮi', 'Iᴬi', 'ii']);
    await expect(fenotiposDeCelda(page)).toHaveText(['Grupo AB', 'Grupo B', 'Grupo A', 'Grupo O']);

    const { genotipos, fenotipos } = await estadisticas(page);
    expect(fenotipos.filas).toHaveLength(4);
    for (const fila of fenotipos.filas) expect(fila).toMatch(/Grupo (A|B|AB|O) 25%$/);
    expect(genotipos.ratio).toContain('Iᴬi');
    expect(genotipos.ratio).not.toMatch(/\bAO\b/);
  });

  test('ABO × Rh en dihíbrido: grupo O y Rh negativo al 6,25 %', async ({ page }) => {
    await abreABO(page);
    await page.getByRole('button', { name: 'Dihíbrido', exact: true }).click();
    await selectorRasgo(page, 1).selectOption('factor-rh');
    await expect(selectorGenotipo(page, 2)).toHaveValue('Dd');
    await expect(selectorGenotipo(page, 3)).toHaveValue('Dd');

    await expect(genotiposDeCelda(page)).toHaveCount(16);
    const { fenotipos } = await estadisticas(page);
    expect(fenotipos.filas.some((f) => f.includes('Grupo O / Rh negativo') && f.endsWith('6,25%'))).toBe(true);
    expect(fenotipos.filas.some((f) => f.includes('Grupo AB / Rh positivo') && f.endsWith('18,75%'))).toBe(true);
  });

  test('el árbol no pinta a nadie como «afectado» por ser del grupo O', async ({ page }) => {
    await abreABO(page);
    await selectorGenotipo(page, 0).selectOption('OO');
    await selectorGenotipo(page, 1).selectOption('OO');
    await pestana(page, 'Pedigree').click();
    const individuos = page.locator('[class*="pedigreeIndividual"]');
    await expect(individuos).toHaveCount(6);
    await expect(page.locator('[class*="pedigreeGenotype"]').first()).toHaveText('ii');
    // Todos son ii, grupo O: ninguno lleva el símbolo relleno de afectado.
    await expect(individuos.locator('[class*="affected"]')).toHaveCount(0);
  });
});
