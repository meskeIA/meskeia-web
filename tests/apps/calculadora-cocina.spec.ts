import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — calculadora-cocina (segmento cálculo, riesgo 2, 243 usos reales · vertical Coquinum)
 *
 * Primera inspección: 21/08/2026 (hallazgos 141-144). RE-INSPECCIÓN: 30/08/2026.
 *
 * La app promete en su <h1> «Calculadora de Cocina» y en su subtítulo «Convierte unidades,
 * escala recetas, consulta tiempos y encuentra sustitutos». La metadata añade «convertir tazas
 * a gramos, ml, onzas» y «escalar recetas según comensales». Hay, por tanto, verdad
 * comprobable: las dos primeras pestañas calculan.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/calculadora-cocina/page.tsx
 *     · unidadesCocina          ← factor de cada unidad (campo `aGramos`: g si es peso, ml si es volumen)
 *     · densidadesIngredientes  ← g/ml de cada ingrediente, para el cruce peso↔volumen
 *     · convertirUnidades()     ← misma categoría: (cantidad × factorOrigen) / factorDestino
 *                                 volumen→peso: ml × densidad · peso→volumen: g ÷ densidad
 *     · escalarReceta()         ← factor = deseadas / originales, aplicado línea a línea:
 *                                 primero las fracciones («1 1/2 taza», «1/2 cebolla»),
 *                                 luego /^([\d.,]+)\s*(.+)$/
 *     · formatearCantidad()     ← entero exacto · fracción de cocina bajo TOPE_FRACCIONES (20)
 *                                 · decimal con una cifra en lo demás
 *   lib/formatters.ts           ← parseSpanishNumber (entrada) y formatNumber (salida en es-ES)
 *
 * LA TABLA QUE PUBLICA LA PROPIA APP (manda sobre cualquier memoria):
 *   1 taza = 240 ml · 1 cucharada = 15 ml · 1 cucharadita = 5 ml
 *   1 oz = 28,3495 g · 1 lb = 453,592 g · 1 fl oz = 29,5735 ml
 *   densidades (g/ml): agua 1 · leche 1,03 · aceite 0,92 · harina 0,53 · azúcar 0,85 ·
 *                      azúcar glass 0,48 · sal 1,2 · arroz 0,75 · miel 1,42 ·
 *                      mantequilla 0,946 · cacao 0,35 · avena 0,4
 *   (el cacao era 0,52 —valor COMPACTADO— hasta el hallazgo 144; hoy 0,35 = 84 g/taza)
 *
 * ⚠️ es-ES NO agrupa los números de cuatro cifras (minimumGroupingDigits = 2): 5000 se
 * escribe «5000» y 10000 se escribe «10.000». Los valores esperados de abajo lo respetan;
 * no es un defecto de formato.
 *
 * ══ LOS TRES CASOS DE LA RE-INSPECCIÓN, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR ══
 *
 *   CASO 1 (normal) — conversión directa de unidades comunes
 *       3 cucharaditas → cucharadas : (3 × 5) / 15   = 1        → «1,00 Cucharadas (tbsp)»
 *         Contraste externo: la FAQ de la propia app y el estándar culinario internacional
 *         dan 1 tbsp = 3 tsp. Cuadra.
 *       1 taza → cucharadas         : (1 × 240) / 15 = 16       → «16,00 Cucharadas (tbsp)»
 *         Contraste: la tabla comparativa de la propia app dice «16 cucharadas = 1 cup».
 *       250 ml → fl oz              : 250 / 29,5735  = 8,4535   → «8,45 Onzas líquidas (fl oz)»
 *       1 taza de cacao → g         : 240 ml × 0,35  = 84       → «84,00 Gramos (g)»
 *         Contraste: King Arthur Baking da 1/2 taza de cacao = 42 g, o sea 84 g por taza.
 *       2 cucharadas de aceite → g  : 30 ml × 0,92   = 27,6     → «27,60 Gramos (g)»
 *         Contraste: la propia app dice «1 tbsp de aceite = 14 g»; 27,6 / 2 = 13,8. Cuadra.
 *
 *   CASO 2 (límite) — escalado a un número de comensales muy alto y muy bajo
 *       Receta por defecto: 200g harina / 100g azúcar / 2 huevos / 150ml leche
 *       4 → 200 porciones, factor 50:
 *         200 × 50 = 10.000 g · 100 × 50 = 5000 g · 2 × 50 = 100 · 150 × 50 = 7500 ml
 *       4 → 1 porción, factor 0,25:
 *         200 × 0,25 = 50 g · 100 × 0,25 = 25 g · 2 × 0,25 = 0,5 → «1/2» (bajo TOPE_FRACCIONES)
 *         150 × 0,25 = 37,5 → «37,5» (por encima del tope, decimal con coma)
 *
 *   CASO 3 (rechazo) — lo que no debe calcularse
 *       Porciones originales 0 → división por cero: hay que rechazar, no dar ∞ ni «No definido».
 *       Porciones deseadas −3 y porciones «abc» → rechazo.
 *       Cantidad −2 en el conversor, «2 tazas» (número con letras) y «1.2.3» → rechazo.
 *       Lo que NO debe aparecer nunca: «NaN», «Infinity», «undefined» ni «No definido».
 *
 * HALLAZGOS ABIERTOS, escritos como TESTIGO (documentan lo que la app hace HOY; si se
 * reparan, estos bloques fallarán y habrá que invertirlos). NO se corrigen desde el test:
 *   A. El escalador destroza los RANGOS: «2-3 dientes de ajo» ×2 devuelve «4 -3 dientes de
 *      ajo». Misma familia que el hallazgo 143 (fracciones), ya reparado, con otra sintaxis.
 *   B. Las fracciones UNICODE («½ cebolla») se devuelven SIN escalar y sin aviso. La ASCII
 *      («1/2 cebolla») sí se escala desde el hallazgo 143.
 *   C. El bloque educativo se contradice con el motor: el escenario «Persona con dieta» dice
 *      «30 g de avena ≈ 3/4 cup», y el conversor de la misma página devuelve 0,31 tazas.
 *   D. La tarjeta «Medidas sin báscula» da valores COLMADOS que el motor no reproduce:
 *      1 vaso de 200 ml = «180 g de arroz» (motor: 150 g) y «180 g de azúcar» (motor: 170 g);
 *      1 cuchara sopera = «10 g de harina» (motor: 7,95 g).
 *
 * REPARACIONES YA VERIFICADAS (hallazgos 141-144, primera inspección):
 *   · Las cuatro pestañas llevan type="button" y aria-pressed.
 *   · «1/2 cebolla» ×2 = «1 cebolla» (antes «2 /2 cebolla»).
 *   · Cacao a 0,35 g/ml = 84 g por taza (antes 0,52 = 124,80 g, valor compactado).
 */

const RUTA = '/calculadora-cocina/';

/** Rellena el conversor, pulsa Convertir y devuelve el texto de la tarjeta de resultado. */
async function convertir(
  page: Page,
  cantidad: string,
  origen: string,
  destino: string,
  ingrediente?: string,
): Promise<string> {
  await page.fill('#cantidadOrigen', cantidad);
  await page.selectOption('#unidadOrigen', origen);
  await page.selectOption('#unidadDestino', destino);
  if (ingrediente) await page.selectOption('#ingrediente', ingrediente);
  await page.getByRole('button', { name: 'Convertir' }).click();
  return (await page.locator('[role="status"]').first().innerText()).replace(/\s+/g, ' ');
}

/** Rellena el escalador, pulsa Escalar Receta y devuelve el bloque de resultado. */
async function escalar(
  page: Page,
  originales: string,
  deseadas: string,
  receta?: string,
): Promise<string> {
  await page.fill('#porcionesOriginales', originales);
  await page.fill('#porcionesDeseadas', deseadas);
  if (receta !== undefined) await page.fill('#ingredientesReceta', receta);
  await page.getByRole('button', { name: 'Escalar Receta' }).click();
  return (await page.locator('[role="status"]').first().innerText()).trim();
}

test.describe('Conversor de unidades — lo que promete el <h1>', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Calculadora de Cocina');
  });

  test('CASO 1 (normal) · 2 tazas de harina = 254,40 g', async ({ page }) => {
    // 2 × 240 ml = 480 ml ; 480 ml × 0,53 g/ml = 254,4 g
    const texto = await convertir(page, '2', 'tazas', 'gramos', 'harina');
    expect(texto).toContain('2,00 Tazas (cup) de harina = 254,40 Gramos (g)');
  });

  test('CASO 1 (normal) · conversiones de peso sin densidad: 1 lb y 10 oz', async ({ page }) => {
    // 1 lb = 453,592 g, el factor que tabula la propia app
    expect(await convertir(page, '1', 'libras', 'gramos')).toContain(
      '1,00 Libras (lb) = 453,59 Gramos (g)',
    );
    // 10 oz = 10 × 28,3495 = 283,495 g → 283,50 al redondear a dos decimales
    expect(await convertir(page, '10', 'onzas', 'gramos')).toContain(
      '10,00 Onzas (oz) = 283,50 Gramos (g)',
    );
  });

  test('CASO 1 (normal) · la vuelta atrás: 500 g de harina = 3,93 tazas', async ({ page }) => {
    // 500 g ÷ 0,53 g/ml = 943,396 ml ; 943,396 ml ÷ 240 ml/taza = 3,9308 tazas
    const texto = await convertir(page, '500', 'gramos', 'tazas', 'harina');
    expect(texto).toContain('500,00 Gramos (g) de harina = 3,93 Tazas (cup)');
  });

  test('CASO 1 (normal) · las densidades tabuladas cuadran con la referencia culinaria', async ({
    page,
  }) => {
    // Agua: 240 ml × 1 g/ml = 240 g. La app define la taza como 240 ml (no como los 236,6 ml
    // de la cup US exacta) y lo declara en su propia FAQ, así que es coherente consigo misma.
    expect(await convertir(page, '1', 'tazas', 'gramos', 'agua')).toContain('= 240,00 Gramos (g)');
    // Azúcar blanco: 240 × 0,85 = 204 g/taza, frente a los ~200 g de referencia estándar.
    expect(await convertir(page, '1', 'tazas', 'gramos', 'azucar')).toContain('= 204,00 Gramos (g)');
    // Mantequilla: 240 × 0,946 = 227,04 g/taza = 2 sticks US (227 g). Cuadra al gramo.
    expect(await convertir(page, '1', 'tazas', 'gramos', 'mantequilla')).toContain(
      '= 227,04 Gramos (g)',
    );
  });

  test('CASO 2 (límite) · el separador de millar sale en formato español', async ({ page }) => {
    // 1.000 tazas (mil, en español) × 240 ml × 0,53 g/ml = 127.200 g
    const texto = await convertir(page, '1.000', 'tazas', 'gramos', 'harina');
    expect(texto).toContain('127.200,00 Gramos (g)');
    expect(texto).not.toContain('127200.00'); // nunca formato US
  });

  test('CASO 2 (límite) · cero y negativo se rechazan, no devuelven 0,00', async ({ page }) => {
    expect(await convertir(page, '0', 'tazas', 'gramos', 'harina')).toContain(
      'Introduce una cantidad válida',
    );
    expect(await convertir(page, '-5', 'tazas', 'gramos', 'harina')).toContain(
      'Introduce una cantidad válida',
    );
  });

  test('CASO 3 (rechazo) · texto y vacío avisan sin escupir NaN', async ({ page }) => {
    expect(await convertir(page, 'abc', 'tazas', 'gramos', 'harina')).toContain(
      'Introduce una cantidad válida',
    );
    expect(await convertir(page, '', 'tazas', 'gramos', 'harina')).toContain(
      'Introduce una cantidad válida',
    );
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toMatch(/NaN|Infinity|undefined|No definido/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 30/08/2026 — los tres casos nuevos, resueltos a mano en la cabecera
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Re-inspección 30/08/2026 — los tres casos', () => {
  test('CASO 1 (normal) · conversión directa entre unidades comunes de cocina', async ({ page }) => {
    await page.goto(RUTA);

    // 3 cucharaditas = (3 × 5 ml) / 15 ml = 1 cucharada.
    // La FAQ de la propia app: «1 cucharada = 15 ml = 3 cucharaditas».
    expect(await convertir(page, '3', 'cucharaditas', 'cucharadas')).toContain(
      '3,00 Cucharaditas (tsp) = 1,00 Cucharadas (tbsp)',
    );

    // 1 taza = (1 × 240 ml) / 15 ml = 16 cucharadas.
    // La tabla comparativa de la propia app: «16 cucharadas = 1 cup».
    expect(await convertir(page, '1', 'tazas', 'cucharadas')).toContain(
      '1,00 Tazas (cup) = 16,00 Cucharadas (tbsp)',
    );

    // 250 ml ÷ 29,5735 ml/fl oz = 8,4535 → 8,45 a dos decimales.
    expect(await convertir(page, '250', 'mililitros', 'onzas-liquidas')).toContain(
      '250,00 Mililitros (ml) = 8,45 Onzas líquidas (fl oz)',
    );

    // Volumen→peso con densidad. 1 taza de cacao = 240 ml × 0,35 g/ml = 84 g.
    // Referencia externa: King Arthur Baking, 1/2 taza de cacao = 42 g → 84 g por taza.
    // (Es el valor que dejó la reparación del hallazgo 144; con el 0,52 previo salían 124,80 g.)
    expect(await convertir(page, '1', 'tazas', 'gramos', 'cacao')).toContain(
      '1,00 Tazas (cup) de cacao = 84,00 Gramos (g)',
    );

    // 2 cucharadas de aceite = 30 ml × 0,92 g/ml = 27,6 g.
    // La propia app afirma «1 tbsp de aceite de oliva = 14 g»; 27,6 ÷ 2 = 13,8. Coherente.
    expect(await convertir(page, '2', 'cucharadas', 'gramos', 'aceite')).toContain(
      '2,00 Cucharadas (tbsp) de aceite = 27,60 Gramos (g)',
    );
  });

  test('CASO 2 (límite) · escalado a 200 comensales y a 1 comensal', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Escalador' }).click();

    // Receta por defecto, 4 → 200 porciones. Factor 50.
    // 200 × 50 = 10.000 · 100 × 50 = 5000 · 2 × 50 = 100 · 150 × 50 = 7500
    // es-ES no agrupa cuatro cifras: 5000 y 7500 van SIN punto; 10.000, CON punto.
    const alto = await escalar(page, '4', '200');
    expect(alto).toContain('10.000 g harina');
    expect(alto).toContain('5000 g azúcar');
    expect(alto).toContain('100 huevos');
    expect(alto).toContain('7500 ml leche');
    expect(alto).not.toContain('10000 g'); // el millar de seis cifras sí se separa

    // El otro extremo: 4 → 1 porción. Factor 0,25.
    // 200 × 0,25 = 50 · 100 × 0,25 = 25 · 2 × 0,25 = 0,5 → «1/2» (bajo TOPE_FRACCIONES = 20)
    // 150 × 0,25 = 37,5 → por encima del tope, decimal con COMA
    const bajo = await escalar(page, '4', '1');
    expect(bajo).toContain('50 g harina');
    expect(bajo).toContain('25 g azúcar');
    expect(bajo).toContain('1/2 huevos');
    expect(bajo).toContain('37,5 ml leche');
    expect(bajo).not.toContain('0,5 huevos'); // una receta escribe «1/2», no «0,5»
    expect(bajo).not.toContain('37.5'); // punto decimal = formato US, prohibido
  });

  test('CASO 3 (rechazo) · cero comensales, negativos y cantidades no numéricas', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Escalador' }).click();

    // Porciones ORIGINALES a cero: es el divisor del factor. Sin guarda daría ∞.
    expect(await escalar(page, '0', '8', '200g harina')).toContain(
      'Introduce valores válidos para las porciones',
    );
    // Porciones deseadas negativas: no existe media receta negativa.
    expect(await escalar(page, '4', '-3', '200g harina')).toContain(
      'Introduce valores válidos para las porciones',
    );
    // Porciones no numéricas.
    expect(await escalar(page, 'abc', '8', '200g harina')).toContain(
      'Introduce valores válidos para las porciones',
    );

    await page.getByRole('button', { name: 'Conversor' }).click();
    // Cantidad negativa en el conversor.
    expect(await convertir(page, '-2', 'tazas', 'gramos', 'harina')).toContain(
      'Introduce una cantidad válida',
    );
    // Número con letras pegadas: parseSpanishNumber devuelve NaN desde el 24/08/2026
    // (antes parseFloat se quedaba con el prefijo y «2 tazas» habría valido 2).
    expect(await convertir(page, '2 tazas', 'tazas', 'gramos', 'harina')).toContain(
      'Introduce una cantidad válida',
    );
    // Dos separadores decimales: tampoco es un número.
    expect(await convertir(page, '1.2.3', 'tazas', 'gramos', 'harina')).toContain(
      'Introduce una cantidad válida',
    );

    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toMatch(/NaN|Infinity|undefined|No definido/);
  });
});

test.describe('Escalador de recetas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Escalador' }).click();
  });

  test('CASO 1 (normal) · de 4 a 6 porciones, factor 1,5', async ({ page }) => {
    // 200 × 1,5 = 300 · 100 × 1,5 = 150 · 2 × 1,5 = 3 · 150 × 1,5 = 225
    const texto = await escalar(page, '4', '6');
    expect(texto).toContain('300 g harina');
    expect(texto).toContain('150 g azúcar');
    expect(texto).toContain('3 huevos');
    expect(texto).toContain('225 ml leche');
  });

  test('CASO 1 (normal) · de 4 a 5 porciones: el decimal sale con COMA', async ({ page }) => {
    // factor 1,25 → 200→250 · 100→125 · 2→2,5 · 150→187,5
    const texto = await escalar(page, '4', '5');
    expect(texto).toContain('250 g harina');
    expect(texto).toContain('125 g azúcar');
    // Desde el 23/08/2026 las cantidades se escriben como en una receta: «2 1/2», no «2,5»
    expect(texto).toContain('2 1/2 huevos');
    expect(texto).toContain('187,5 ml leche');
    expect(texto).not.toContain('2.5 huevos'); // punto decimal = formato US, prohibido
  });

  test('CASO 2 (límite) · factor grande: de 4 a 4.000 porciones', async ({ page }) => {
    // 200 g × (4000 ÷ 4) = 200.000 g, con punto de millar
    const texto = await escalar(page, '4', '4000', '200g harina');
    expect(texto).toContain('200.000 g harina');
  });

  test('CASO 3 (rechazo) · porciones a cero o en texto no escalan nada', async ({ page }) => {
    expect(await escalar(page, '4', '0', '200g harina')).toContain(
      'Introduce valores válidos para las porciones',
    );
    expect(await escalar(page, '4', 'abc', '200g harina')).toContain(
      'Introduce valores válidos para las porciones',
    );
  });

  test('la fracción ASCII se escala entera (hallazgo 143, REPARADO)', async ({ page }) => {
    const texto = await escalar(page, '4', '8', '1/2 cebolla\n1,5 tazas harina\nSal al gusto');
    // La línea sin cantidad se devuelve tal cual y el decimal con coma se escala
    expect(texto).toContain('Sal al gusto');
    expect(texto).toContain('3 tazas harina'); // 1,5 × 2 = 3
    // Antes del hallazgo 143 salía «2 /2 cebolla»: la regex capturaba solo el numerador.
    expect(texto).toContain('1 cebolla');
    expect(texto).not.toContain('2 /2');
    // Mixto: «1 1/2 taza» × 2 = 3 tazas
    expect(await escalar(page, '4', '8', '1 1/2 taza harina')).toContain('3 taza harina');
  });

  test('TESTIGO A · los RANGOS de una receta se destrozan al escalar', async ({ page }) => {
    // «2-3 dientes de ajo» es sintaxis corriente en receta española. La regex
    // /^([\d.,]+)\s*(.+)$/ captura solo el «2» y arrastra el «-3» al resto de la línea.
    // HALLAZGO ABIERTO: lo esperable sería «4-6 dientes de ajo». Si se repara, esto fallará.
    const texto = await escalar(page, '4', '8', '2-3 dientes de ajo');
    expect(texto).toContain('4 -3 dientes de ajo');
  });

  test('TESTIGO B · la fracción UNICODE no se escala, y no avisa', async ({ page }) => {
    // «½ cebolla» no empieza por dígito, así que cae en el `return linea` de reserva y vuelve
    // idéntica. Es el mismo fallback que deja intacto «Sal al gusto», pero aquí SÍ había una
    // cantidad que escalar, y el usuario no tiene forma de notar que esa línea se quedó atrás.
    // HALLAZGO ABIERTO: lo esperable sería «1 cebolla». Si se repara, esto fallará.
    const texto = await escalar(page, '4', '8', '½ cebolla');
    expect(texto).toContain('½ cebolla');
    expect(texto).not.toContain('1 cebolla');
  });

  test('TESTIGO · bajo el tope, gramos y mililitros salen en fracción', async ({ page }) => {
    // 4 → 0,5 porciones, factor 0,125: 100 × 0,125 = 12,5 g y 150 × 0,125 = 18,75 ml.
    // Como ambos quedan por debajo de TOPE_FRACCIONES (20), formatearCantidad los escribe
    // «12 1/2 g» y «18 3/4 ml». El propio comentario del código dice que «187 1/2 ml no lo
    // escribe nadie»; el tope usa la MAGNITUD como sustituto de «unidad que se cuenta»,
    // y por debajo de 20 el sustituto falla igual con gramos y mililitros.
    const texto = await escalar(page, '4', '0,5');
    expect(texto).toContain('1/4 huevos'); // esto sí es lo que se quería: 2 × 0,125 = 1/4
    expect(texto).toContain('12 1/2 g azúcar'); // HALLAZGO ABIERTO: se esperaría «12,5 g»
    expect(texto).toContain('18 3/4 ml leche'); // HALLAZGO ABIERTO: se esperaría «18,8 ml»
  });
});

test.describe('El bloque educativo frente al motor de la misma página', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
  });

  test('TESTIGO C · «30 g de avena ≈ 3/4 cup» contradice al conversor', async ({ page }) => {
    // Motor: 30 g ÷ 0,4 g/ml = 75 ml ; 75 ÷ 240 = 0,3125 tazas → «0,31 Tazas (cup)».
    // Referencia externa: King Arthur Baking, 1 taza de copos de avena = 89 g → 30 g ≈ 1/3 cup.
    // Las dos coinciden entre sí y contradicen al texto educativo, que dice 3/4 cup (≈ 2,4×).
    expect(await convertir(page, '30', 'gramos', 'tazas', 'avena')).toContain(
      '30,00 Gramos (g) de avena = 0,31 Tazas (cup)',
    );
    // El <EducationalSection> monta siempre su contenido pero lo oculta por CSS, así que hay
    // que desplegarlo para que innerText lo vea. Su botón toma el nombre del aria-label.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    // HALLAZGO ABIERTO: el escenario «Persona con dieta que ajusta cantidades» sigue diciendo
    // 3/4 cup. Cuando se corrija a 1/3, este expect fallará.
    await expect(page.getByText(/30 g de avena en tazas \(≈ 3\/4 cup\)/)).toBeVisible();
  });

  test('TESTIGO D · las «medidas sin báscula» no las reproduce el motor', async ({ page }) => {
    // La tarjeta «Con un vaso de agua (200ml)» declara arroz 180 g y azúcar 180 g;
    // la de «Con una cuchara sopera», harina 10 g. Son valores COLMADOS, y la tarjeta
    // «La cuchara rasa, no colmada» de más abajo dice justo lo contrario.
    // 200 ml × 0,75 = 150 g de arroz  (el 180 g declarado implicaría 0,90 g/ml)
    expect(await convertir(page, '200', 'mililitros', 'gramos', 'arroz')).toContain(
      '= 150,00 Gramos (g)',
    );
    // 200 ml × 0,85 = 170 g de azúcar (el 180 g declarado implicaría 0,90 g/ml)
    expect(await convertir(page, '200', 'mililitros', 'gramos', 'azucar')).toContain(
      '= 170,00 Gramos (g)',
    );
    // 15 ml × 0,53 = 7,95 g de harina (el 10 g declarado implicaría 0,67 g/ml).
    // King Arthur da 1 tbsp de harina = 8 g, o sea que el motor acierta y la tarjeta no.
    expect(await convertir(page, '15', 'mililitros', 'gramos', 'harina')).toContain(
      '= 7,95 Gramos (g)',
    );
  });
});

test.describe('Pestañas de consulta (tiempos y sustitutos)', () => {
  test('los dos buscadores filtran de verdad', async ({ page }) => {
    await page.goto(RUTA);

    await page.getByRole('button', { name: 'Tiempos' }).click();
    await page.fill('#filtroTiempo', 'huevo');
    // La tabla declara «Huevo duro · Hervir · 10-12 min · Desde ebullición»
    await expect(page.getByText('Huevo duro', { exact: true })).toBeVisible();
    await expect(page.getByText('10-12 min', { exact: true })).toBeVisible();
    await expect(page.getByText('Espaguetis', { exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: 'Sustitutos' }).click();
    await page.fill('#busquedaSustituto', 'huevo');
    await expect(page.getByRole('heading', { name: 'Huevo (1 unidad)' })).toBeVisible();
    await expect(page.getByText('Aquafaba')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Harina de trigo (100g)' })).toHaveCount(0);
  });
});

test.describe('Estructura y accesibilidad', () => {
  test('los cinco componentes obligatorios están presentes', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.locator('a[href="/"]').first()).toBeVisible(); // MeskeiaLogo
    await expect(page.getByText(/no almacena|privacidad/i).first()).toBeVisible(); // LegalNotice
    await expect(page.getByText(/relacionadas/i).first()).toBeVisible(); // RelatedApps
    await expect(page.getByText(/Compártela|Compartir esta/i).first()).toBeVisible(); // ShareCard
    await expect(page.locator('footer').first()).toBeVisible(); // Footer
  });

  test('HALLAZGO 141+142 (reparado) — las pestañas anuncian cuál está activa y llevan type', async ({
    page,
  }) => {
    await page.goto(RUTA);
    for (const nombre of ['Conversor', 'Escalador', 'Tiempos', 'Sustitutos']) {
      const boton = page.getByRole('button', { name: nombre, exact: true });
      // Antes de la reparación no había ni aria-pressed ni type="button": el estado activo
      // viajaba solo por la clase CSS.
      expect(await boton.getAttribute('aria-pressed')).not.toBeNull();
      expect(await boton.getAttribute('type')).toBe('button');
    }
  });
});
