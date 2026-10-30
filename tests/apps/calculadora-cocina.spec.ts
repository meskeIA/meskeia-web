import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { activarTema, prepararParaMedir } from '../contraste-text-muted-auxiliares';

/**
 * Inspector — calculadora-cocina (segmento cálculo, riesgo 2, 243 usos reales · vertical Coquinum)
 *
 * Primera inspección: 21/08/2026 (hallazgos 141-146). RE-INSPECCIONES: 30/08/2026 (545-549)
 * y 30/10/2026 (bloque final del fichero, con sus casos resueltos a mano).
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
 * HALLAZGOS DE LA RE-INSPECCIÓN DEL 30/08/2026, REPARADOS ese mismo día (1a743d87) y
 * re-verificados el 30/10/2026 con los tests «545…549 (reparado)» de abajo:
 *   A. (545) El escalador destrozaba los RANGOS: «2-3 dientes de ajo» ×2 devolvía «4 -3
 *      dientes de ajo». Hoy da «4-6 dientes de ajo».
 *   B. (547) Las fracciones UNICODE («½ cebolla») se devolvían SIN escalar y sin aviso. Hoy se
 *      escalan como las ASCII («1/2 cebolla», hallazgo 143).
 *   C. (546) El escenario «Persona con dieta» decía «30 g de avena ≈ 3/4 cup» y el conversor
 *      de la misma página devolvía 0,31 tazas. Hoy el texto deriva del motor.
 *   D. (548) La tarjeta «Medidas sin báscula» daba valores COLMADOS que el motor no reproducía
 *      (arroz 180 g, azúcar 180 g, harina 10 g). Hoy la TARJETA deriva del motor; la FAQ
 *      «¿Cómo medir ingredientes secos sin báscula?» conserva aún esas cifras (re-inspección
 *      del 30/10/2026, al final del fichero).
 *   E. (549) Gramos y mililitros salían en fracción al escalar hacia abajo («12 1/2 g»). Hoy,
 *      en decimal.
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
    // de la cup US exacta) y lo declara en su propia FAQ. Es coherente con su cucharada de
    // 15 ml, pero NO con su onza líquida de 29,5735 ml: ver la re-inspección del 30/10/2026.
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

  test('545 (reparado) · un RANGO de receta («2-3 dientes de ajo») escala los dos extremos', async ({ page }) => {
    // «2-3 dientes de ajo» es sintaxis corriente en receta española. Antes la regex
    // /^([\d.,]+)\s*(.+)$/ capturaba solo el «2» y arrastraba el «-3» al resto de la línea.
    const texto = await escalar(page, '4', '8', '2-3 dientes de ajo');
    expect(texto).toContain('4-6 dientes de ajo');
    expect(texto).not.toContain('4 -3 dientes de ajo');
  });

  test('547 (reparado) · la fracción UNICODE (½) ya se escala como la ASCII', async ({ page }) => {
    // «½ cebolla» no empezaba por dígito, así que caía en el `return linea` de reserva y
    // volvía idéntica, sin avisar de que esa línea no se había escalado.
    const texto = await escalar(page, '4', '8', '½ cebolla');
    expect(texto).toContain('1 cebolla');
    expect(texto).not.toContain('½ cebolla');
  });

  test('549 (reparado) · bajo el tope, gramos y mililitros salen en decimal, no en fracción', async ({ page }) => {
    // 4 → 0,5 porciones, factor 0,125: 100 × 0,125 = 12,5 g y 150 × 0,125 = 18,75 ml.
    // Por debajo de TOPE_FRACCIONES (20) formatearCantidad usaba la MAGNITUD como sustituto
    // de «unidad que se cuenta», y escribía «12 1/2 g» y «18 3/4 ml» — «187 1/2 ml» no lo
    // escribe nadie, y por debajo de 20 el sustituto fallaba igual con gramos y mililitros.
    const texto = await escalar(page, '4', '0,5');
    expect(texto).toContain('1/4 huevos'); // lo que SÍ se cuenta conserva la fracción: 2 × 0,125 = 1/4
    expect(texto).toContain('12,5 g azúcar');
    expect(texto).toContain('18,8 ml leche');
    expect(texto).not.toContain('12 1/2 g azúcar');
    expect(texto).not.toContain('18 3/4 ml leche');
  });
});

test.describe('El bloque educativo frente al motor de la misma página', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
  });

  test('546 (reparado) · «30 g de avena» ya deriva del mismo conversor, no de un «3/4 cup» a mano', async ({ page }) => {
    // Motor: 30 g ÷ 0,4 g/ml = 75 ml ; 75 ÷ 240 = 0,3125 tazas → «0,31 Tazas (cup)».
    // Referencia externa: King Arthur Baking, 1 taza de copos de avena = 89 g → 30 g ≈ 1/3 cup.
    expect(await convertir(page, '30', 'gramos', 'tazas', 'avena')).toContain(
      '30,00 Gramos (g) de avena = 0,31 Tazas (cup)',
    );
    // El <EducationalSection> monta siempre su contenido pero lo oculta por CSS, así que hay
    // que desplegarlo para que innerText lo vea. Su botón toma el nombre del aria-label.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    // El escenario «Persona con dieta que ajusta cantidades» ya deriva del conversor: 0,31
    // tazas, con la aproximación ≈ 1/3 cup en vez del «3/4 cup» que no cuadraba con nada.
    await expect(page.getByText(/30 g de avena en tazas \(0,31 tazas, ≈ 1\/3 cup\)/)).toBeVisible();
    await expect(page.getByText(/≈ 3\/4 cup/)).toHaveCount(0);
  });

  test('548 (reparado) · las «medidas sin báscula» ya derivan del mismo motor del conversor', async ({ page }) => {
    // Antes eran valores COLMADOS escritos a mano (arroz 180 g, azúcar 180 g, harina 10 g),
    // que contradecían tanto al motor como a la tarjeta «La cuchara rasa, no colmada» de al
    // lado. Se comprueban primero contra el conversor y luego contra la tarjeta misma.
    expect(await convertir(page, '200', 'mililitros', 'gramos', 'arroz')).toContain(
      '= 150,00 Gramos (g)',
    );
    expect(await convertir(page, '200', 'mililitros', 'gramos', 'azucar')).toContain(
      '= 170,00 Gramos (g)',
    );
    // 15 ml × 0,53 = 7,95 g de harina, que Math.round dobla a 8 g — la propia referencia
    // externa (King Arthur) da 1 tbsp de harina = 8 g.
    expect(await convertir(page, '15', 'mililitros', 'gramos', 'harina')).toContain(
      '= 7,95 Gramos (g)',
    );

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const tarjetaCuchara = page.locator('h4', { hasText: 'Con una cuchara sopera' }).locator('xpath=..');
    await expect(tarjetaCuchara).toContainText('Harina: 8g');
    await expect(tarjetaCuchara).not.toContainText('Harina: 10g');
    const tarjetaVaso = page.locator('h4', { hasText: 'Con un vaso de agua' }).locator('xpath=..');
    await expect(tarjetaVaso).toContainText('Azúcar: 170g');
    await expect(tarjetaVaso).toContainText('Arroz: 150g');
    await expect(tarjetaVaso).not.toContainText('Azúcar: 180g');
    await expect(tarjetaVaso).not.toContainText('Arroz: 180g');
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

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 30/10/2026
// ═══════════════════════════════════════════════════════════════════════════════
/*
 * La cola la devolvió INVALIDADA por cuatro commits que solo tocaron el CSS (b7733c6d,
 * dfaf84a2 y 4488bd1d: contraste de marca) y el montaje de las relacionadas (99e1ee7e). Las
 * reparaciones 141-146 y 545-549 se re-verifican con los tests de arriba, y la 145 aquí abajo.
 *
 * DEFINICIONES (galón US = 231 in³ = 231 × 16,387064 cm³ = 3785,411784 ml):
 *   taza = 1/16 gal = 236,588 ml · fl oz = 1/128 gal = 29,5735 ml
 *   cucharada = 1/2 fl oz = 14,787 ml · cucharadita = 1/6 fl oz = 4,929 ml
 * Elija la app la taza que elija (236,588 ml la tradicional; 240 ml la del etiquetado
 * nutricional de EE. UU., que va con una fl oz de 30 ml), las RELACIONES no cambian:
 *   1 taza = 8 fl oz = 16 cucharadas · 1 fl oz = 2 cucharadas
 * Y la tabla comparativa de la propia app imprime «240 ml · 8 fl oz · 1 cup = 240 ml».
 *
 * CASOS, resueltos a mano ANTES de abrir el navegador:
 *   CASO 1 (normal)
 *     2 lb → kg            : 2 × 453,592 g = 907,184 g          → «0,91 Kilogramos (kg)»
 *     8 oz → g             : 8 × 28,3495 = 226,796              → «226,80 Gramos (g)»
 *     3 cucharadas de miel : 45 ml × 1,42 g/ml = 63,9 g         → «63,90 Gramos (g)»
 *     100 g de mantequilla : 100 ÷ 0,946 = 105,71 ml ÷ 15 = 7,047 → «7,05 Cucharadas (tbsp)»
 *     16 cucharadas → taza : 16 × 15 ÷ 240 = 1                  → «1,00 Tazas (cup)»
 *     1 taza → fl oz       : 8 por definición y por la tabla    → la app da 8,12 (HALLAZGO)
 *     1 fl oz → cucharadas : 2 por definición                   → la app da 1,97 (HALLAZGO)
 *   CASO 2 (límite: millar, escala grande, cantidades pequeñas)
 *     «1.500» g de harina → tazas: 1500 ÷ 0,53 = 2830,19 ml ÷ 240 = 11,79; el eco es «1500,00»
 *        porque es-ES no agrupa cuatro cifras (leído como 1,5 habría dado 0,01 tazas)
 *     «12.500» ml → L      : 12,5                               → «12.500,00 … = 12,50 Litros (L)»
 *     escalador 4 → 400, «1.500 g harina»: × 100 = 150.000 g     → «150.000 g harina»
 *     escalador 4 → 4, «0,25 l nata»: identidad, 0,25 l          → la app da «0,3 l» (HALLAZGO)
 *     escalador 4 → 5, «0,2 l aceite»: × 1,25 = 0,25 l           → la app da «0,3 l» (HALLAZGO)
 *     1 cucharadita → L    : 5 ml = 0,005 L                     → la app da «0,01» (HALLAZGO)
 *     1 cucharadita de harina → kg: 5 × 0,53 = 2,65 g = 0,00265 kg → la app da «0,00» (HALLAZGO)
 *   CASO 3 (rechazo)
 *     «12abc», «1e3» y vacío en el conversor, «12abc» en porciones → aviso, nunca un número
 *     « 200 g harina» (espacio delante, típico al pegar) × 2 = 400 g → la app la devuelve tal
 *        cual, sin escalar y sin avisar (HALLAZGO)
 *
 * Los hallazgos nuevos van con test.fail(): cuando se reparen, el test «pasará» y Playwright
 * lo marcará como fallo inesperado; entonces se quita el test.fail() y se escribe REPARADO.
 */

/** Abre la app y espera a que React haya montado el conversor (un clic antes se pierde). */
async function abrirHidratada(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#cantidadOrigen']);
}

/** Como `convertir`, pero comprobando que el estado de React recogió la cantidad. */
async function convertirHidratado(
  page: Page,
  cantidad: string,
  origen: string,
  destino: string,
  ingrediente?: string,
): Promise<string> {
  await page.fill('#cantidadOrigen', cantidad);
  await esperarValorEnReact(page, '#cantidadOrigen', cantidad);
  await page.selectOption('#unidadOrigen', origen);
  await page.selectOption('#unidadDestino', destino);
  if (ingrediente) await page.selectOption('#ingrediente', ingrediente);
  await page.getByRole('button', { name: 'Convertir' }).click();
  return (await page.locator('[role="status"]').first().innerText()).replace(/\s+/g, ' ');
}

/** Como `escalar`, pero comprobando que el estado de React recogió los tres campos. */
async function escalarHidratado(
  page: Page,
  originales: string,
  deseadas: string,
  receta: string,
): Promise<string> {
  await page.fill('#porcionesOriginales', originales);
  await esperarValorEnReact(page, '#porcionesOriginales', originales);
  await page.fill('#porcionesDeseadas', deseadas);
  await esperarValorEnReact(page, '#porcionesDeseadas', deseadas);
  await page.fill('#ingredientesReceta', receta);
  await esperarValorEnReact(page, '#ingredientesReceta', receta);
  await page.getByRole('button', { name: 'Escalar Receta' }).click();
  return (await page.locator('[role="status"]').first().innerText()).trim();
}

interface PreguntaLd {
  pregunta: string;
  respuesta: string;
}

/** Las preguntas de TODOS los FAQPage de la página (los lee el buscador, no el usuario). */
async function faqPagesJsonLd(page: Page): Promise<{ bloques: number; preguntas: PreguntaLd[] }> {
  return page.evaluate(() => {
    let bloques = 0;
    const preguntas: { pregunta: string; respuesta: string }[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      const nodos = (j['@graph'] as Record<string, unknown>[] | undefined) ?? [j];
      for (const n of nodos) {
        if (n['@type'] !== 'FAQPage') continue;
        bloques++;
        for (const q of n.mainEntity as { name: string; acceptedAnswer: { text: string } }[]) {
          preguntas.push({ pregunta: q.name, respuesta: q.acceptedAnswer.text });
        }
      }
    }
    return { bloques, preguntas };
  });
}

/** El featureList del WebApplication del JSON-LD. */
async function featuresJsonLd(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      const nodos = (j['@graph'] as Record<string, unknown>[] | undefined) ?? [j];
      for (const n of nodos) {
        if (n['@type'] === 'WebApplication') return (n.featureList as string[] | undefined) ?? [];
      }
    }
    return [];
  });
}

/**
 * Contraste WCAG del texto de un elemento contra su fondo REAL: compone las capas
 * translúcidas de los antepasados hasta la primera opaca. Se planta si un color no viene en
 * rgb()/rgba(), en vez de medir a ciegas.
 */
async function contrasteDe(
  page: Page,
  selector: string,
): Promise<{ ratio: number; color: string; fondo: string }> {
  return page.locator(selector).first().evaluate((el) => {
    const leer = (c: string): number[] => {
      const m = c.match(/^rgba?\(([^)]+)\)$/);
      if (!m) throw new Error(`Color no legible: ${c}`);
      const p = m[1].split(',').map((x) => parseFloat(x));
      return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
    };
    const canal = (v: number) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = (c: number[]) => 0.2126 * canal(c[0]) + 0.7152 * canal(c[1]) + 0.0722 * canal(c[2]);
    const capas: number[][] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = leer(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) {
        capas.push(c);
        if (c[3] >= 1) break;
      }
    }
    let f = [255, 255, 255];
    for (const c of capas.reverse()) f = [0, 1, 2].map((i) => c[i] * c[3] + f[i] * (1 - c[3]));
    const color = getComputedStyle(el).color;
    const t = leer(color);
    const l1 = lum(t);
    const l2 = lum(f);
    return {
      ratio: (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05),
      color,
      fondo: `rgb(${f.map((x) => Math.round(x)).join(', ')})`,
    };
  });
}

test.describe('Re-inspección 30/10/2026 — conversor y escalador', () => {
  test.beforeEach(async ({ page }) => {
    await abrirHidratada(page);
  });

  test('CASO 1 (normal) · peso, volumen→peso y peso→volumen con la densidad declarada', async ({
    page,
  }) => {
    // 2 × 453,592 g = 907,184 g = 0,907 kg
    expect(await convertirHidratado(page, '2', 'libras', 'kilogramos')).toContain(
      '2,00 Libras (lb) = 0,91 Kilogramos (kg)',
    );
    // 8 × 28,3495 g = 226,796 g
    expect(await convertirHidratado(page, '8', 'onzas', 'gramos')).toContain(
      '8,00 Onzas (oz) = 226,80 Gramos (g)',
    );
    // 3 × 15 ml × 1,42 g/ml (miel) = 63,9 g
    expect(await convertirHidratado(page, '3', 'cucharadas', 'gramos', 'miel')).toContain(
      '3,00 Cucharadas (tbsp) de miel = 63,90 Gramos (g)',
    );
    // 100 g ÷ 0,946 g/ml (mantequilla) = 105,71 ml ÷ 15 ml = 7,047 cucharadas
    expect(await convertirHidratado(page, '100', 'gramos', 'cucharadas', 'mantequilla')).toContain(
      '100,00 Gramos (g) de mantequilla = 7,05 Cucharadas (tbsp)',
    );
    // 16 × 15 ml ÷ 240 ml = 1: la relación taza-cucharada SÍ es coherente
    expect(await convertirHidratado(page, '16', 'cucharadas', 'tazas')).toContain(
      '16,00 Cucharadas (tbsp) = 1,00 Tazas (cup)',
    );
  });

  test('HALLAZGO (30/10/2026, ABIERTO) · la onza líquida no cuadra con la taza ni con la cucharada', async ({
    page,
  }) => {
    // La app mezcla dos sistemas: taza de 240 ml y cucharada de 15 ml (los del etiquetado de
    // EE. UU., cuya fl oz es de 30 ml) con la fl oz TRADICIONAL de 29,5735 ml (cuya taza es de
    // 236,588 ml). En cualquiera de los dos, 1 taza = 8 fl oz y 1 fl oz = 2 cucharadas; la
    // tabla comparativa de la propia app dice «8 fl oz». Hoy: 240 ÷ 29,5735 = 8,12 y
    // 29,5735 ÷ 15 = 1,97.
    test.fail();
    expect(await convertirHidratado(page, '1', 'tazas', 'onzas-liquidas')).toMatch(
      /= 8(,0+)? Onzas líquidas/,
    );
    expect(await convertirHidratado(page, '1', 'onzas-liquidas', 'cucharadas')).toMatch(
      /= 2(,0+)? Cucharadas/,
    );
  });

  test('CASO 2 (límite) · separador de millar en la entrada, en la salida y en el escalador', async ({
    page,
  }) => {
    // «1.500» es mil quinientos: 1500 g ÷ 0,53 g/ml = 2830,19 ml ÷ 240 ml = 11,79 tazas.
    // El eco sale «1500,00» porque es-ES no agrupa cuatro cifras (no es un defecto).
    expect(await convertirHidratado(page, '1.500', 'gramos', 'tazas', 'harina')).toContain(
      '1500,00 Gramos (g) de harina = 11,79 Tazas (cup)',
    );
    // 12.500 ml = 12,5 L; con cinco cifras sí va el punto de millar
    expect(await convertirHidratado(page, '12.500', 'mililitros', 'litros')).toContain(
      '12.500,00 Mililitros (ml) = 12,50 Litros (L)',
    );
    await page.getByRole('button', { name: 'Escalador' }).click();
    // 4 → 400 porciones, factor 100: 1500 g × 100 = 150.000 g · 2 × 100 = 200 huevos
    const texto = await escalarHidratado(page, '4', '400', '1.500 g harina\n2 huevos');
    expect(texto).toContain('150.000 g harina');
    expect(texto).toContain('200 huevos');
  });

  test('HALLAZGO (30/10/2026, ABIERTO) · el escalador redondea litros y kilos a una cifra: 0,25 l pasa a 0,3 l', async ({
    page,
  }) => {
    // formatearCantidad escribe las unidades medibles con UNA cifra decimal (hallazgo 549).
    // Para g y ml es 0,1 g; para kg y l son 100 g o 100 ml, y la cantidad cambia aunque no se
    // escale. Hoy: «0,25 l nata» ×1 → «0,3 l nata» (+20 %), «0,125 kg» ×1 → «0,1 kg» (−20 %),
    // «0,2 l aceite» ×1,25 = 0,25 → «0,3 l aceite».
    test.fail();
    await page.getByRole('button', { name: 'Escalador' }).click();
    const identidad = await escalarHidratado(page, '4', '4', '0,25 l nata\n0,125 kg mantequilla');
    expect(identidad).toMatch(/^(0,25 l|250 ml) nata$/m);
    expect(identidad).toMatch(/^(0,125 kg|125 g) mantequilla$/m);
    const cinco = await escalarHidratado(page, '4', '5', '0,2 l aceite');
    expect(cinco).toMatch(/^(0,25 l|250 ml) aceite$/m);
  });

  test('HALLAZGO (30/10/2026, ABIERTO) · con dos decimales fijos, una cantidad pequeña sale doblada o a cero', async ({
    page,
  }) => {
    // 1 cucharadita = 5 ml = 0,005 L; con dos decimales, «0,01» (el doble).
    // 1 cucharadita de harina = 5 ml × 0,53 = 2,65 g = 0,00265 kg; con dos decimales, «0,00».
    // Y el eco de la entrada se recorta: «0,125» L se repite como «0,13 Litros».
    test.fail();
    expect(await convertirHidratado(page, '1', 'cucharaditas', 'litros')).toMatch(
      /= 0,005\d* Litros/,
    );
    expect(
      await convertirHidratado(page, '1', 'cucharaditas', 'kilogramos', 'harina'),
    ).not.toContain('= 0,00 Kilogramos');
    expect(await convertirHidratado(page, '0,125', 'litros', 'mililitros')).toMatch(
      /0,125 Litros \(L\) = 125/,
    );
  });

  test('CASO 3 (rechazo) · «12abc», «1e3» y vacío avisan; «12abc» en porciones también', async ({
    page,
  }) => {
    // parseSpanishNumber devuelve NaN para las tres, y la guarda isNaN/<= 0 lo convierte en aviso
    for (const malo of ['12abc', '1e3', '']) {
      expect(await convertirHidratado(page, malo, 'tazas', 'gramos', 'harina')).toContain(
        'Introduce una cantidad válida',
      );
    }
    await page.getByRole('button', { name: 'Escalador' }).click();
    expect(await escalarHidratado(page, '4', '12abc', '200 g harina')).toContain(
      'Introduce valores válidos para las porciones',
    );
    await expect(page.locator('body')).not.toContainText(/NaN|Infinity|undefined|No definido/);
  });

  test('HALLAZGO (30/10/2026, ABIERTO) · una línea con espacio o viñeta delante se devuelve sin escalar y sin avisar', async ({
    page,
  }) => {
    // Las regex de escalarReceta anclan en ^\d sin recortar la línea: « 200 g harina» o
    // «- 100 g azúcar» (lo habitual al pegar una receta) salen idénticas entre las escaladas.
    // 4 → 8, factor 2: 200 g → 400 g · 100 g → 200 g.
    test.fail();
    await page.getByRole('button', { name: 'Escalador' }).click();
    const texto = await escalarHidratado(page, '4', '8', ' 200 g harina\n- 100 g azúcar');
    expect(texto).toContain('400 g harina');
    expect(texto).toMatch(/200 g azúcar|sin escalar/);
  });

  test('HALLAZGO (30/10/2026, ABIERTO) · el resultado escribe «azucar» sin tilde', async ({ page }) => {
    // convertirUnidades usa la CLAVE del ingrediente (`azucar-glass`.replace('-', ' ')) en
    // vez de su nombre. 240 ml × 0,85 = 204 g · 240 ml × 0,48 = 115,2 g.
    test.fail();
    expect(await convertirHidratado(page, '1', 'tazas', 'gramos', 'azucar')).toMatch(
      /de azúcar = 204,00 Gramos/i,
    );
    expect(await convertirHidratado(page, '1', 'tazas', 'gramos', 'azucar-glass')).toMatch(
      /de azúcar glass = 115,20 Gramos/i,
    );
  });

  test('145 (reparado) · el featureList no promete un conversor de temperaturas que no existe', async ({
    page,
  }) => {
    const features = await featuresJsonLd(page);
    expect(features.length).toBeGreaterThanOrEqual(4);
    expect(features.join(' ')).not.toMatch(/temperatura/i);
    await expect(
      page.locator('#unidadOrigen option', { hasText: /°[CF]|Celsius|Fahrenheit/ }),
    ).toHaveCount(0);
  });
});

test.describe('Re-inspección 30/10/2026 — bloque educativo y FAQPage', () => {
  test.beforeEach(async ({ page }) => {
    await abrirHidratada(page);
  });

  test('HALLAZGO (30/10/2026, ABIERTO) · la FAQ «secos sin báscula» conserva las cifras colmadas que el 548 quitó de la tarjeta', async ({
    page,
  }) => {
    // La tarjeta deriva del motor: vaso de 200 ml → harina 200 × 0,53 = 106 g, azúcar 170 g,
    // arroz 150 g; cuchara de 15 ml → harina 8 g, azúcar 13 g, aceite 14 g. La FAQ visible y
    // el FAQPage del @graph siguen diciendo 110 / 180 / 180 g y 10 / 15 / 14 g.
    test.fail();
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(
      page.locator('h4', { hasText: 'Con un vaso de agua' }).locator('xpath=..'),
    ).toContainText('Harina: 106');
    const colmadas =
      /(?<!\d)110 g harina|(?<!\d)180 g azúcar|(?<!\d)180 g arroz|(?<!\d)10 g harina|(?<!\d)15 g azúcar/;
    await expect(page.locator('li', { hasText: 'secos sin báscula' })).not.toContainText(colmadas);
    const { preguntas } = await faqPagesJsonLd(page);
    for (const p of preguntas) expect(p.respuesta).not.toMatch(colmadas);
  });

  test('HALLAZGO (30/10/2026, ABIERTO) · dos FAQPage y dos cifras distintas para reducir la levadura', async ({
    page,
  }) => {
    // La FAQ se escribe tres veces (page.tsx, faqSchema del @graph y faqJsonLd) y la página
    // emite DOS FAQPage. «¿Cómo multiplico una receta para 8 personas si es para 4?» (visible y
    // @graph) dice «la levadura puede reducirse un 20-25 %»; «¿Cómo se escala una receta para
    // más comensales?» (faqJsonLd) dice «reducirla un 15-20 %». La tarjeta de consejos da
    // 1,75× para ×2 y 2,5× para ×3 (12,5 % y 16,7 %).
    test.fail();
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const { bloques, preguntas } = await faqPagesJsonLd(page);
    const visible = await page.locator('li', { hasText: 'multiplico una receta' }).innerText();
    const cifras = new Set<string>();
    for (const t of [visible, ...preguntas.map((p) => p.respuesta)]) {
      for (const m of t.matchAll(/levadura[^.]*?(\d+)\s*[-–]\s*(\d+)\s*%/g)) cifras.add(`${m[1]}-${m[2]}`);
    }
    expect(cifras.size).toBeLessThanOrEqual(1);
    expect(bloques).toBe(1);
  });

  test('HALLAZGO (30/10/2026, ABIERTO) · el FAQPage da otro tiempo y otra temperatura para la pechuga al horno que la tabla', async ({
    page,
  }) => {
    // Tabla de la app: «Pechuga de pollo · Horno · 25-30 min · 200°C».
    // faqJsonLd: «20-25 minutos a 180 °C»: menos tiempo a menos temperatura.
    test.fail();
    await page.getByRole('button', { name: 'Tiempos', exact: true }).click();
    const fila = await page
      .locator('[class*="tablaRow"]')
      .filter({ hasText: 'Pechuga de pollo' })
      .filter({ hasText: 'Horno' })
      .innerText();
    const tiempo = fila.match(/(\d+)\s*-\s*(\d+)\s*min/);
    const grados = fila.match(/(\d+)\s*°C/);
    expect(tiempo).not.toBeNull();
    expect(grados).not.toBeNull();
    const { preguntas } = await faqPagesJsonLd(page);
    const pechuga = preguntas.find((p) => /pechuga/i.test(p.pregunta));
    if (!pechuga) return; // sin la pregunta ya no hay contradicción
    expect(pechuga.respuesta).toContain(`${tiempo![1]}-${tiempo![2]}`);
    expect(pechuga.respuesta).toMatch(new RegExp(`${grados![1]}\\s*°C`));
  });

  test('HALLAZGO (30/10/2026, ABIERTO) · el «truco» de °F a °C da 160 °C para 350 °F, 17 °C por debajo', async ({
    page,
  }) => {
    // La misma respuesta da la fórmula: (350 − 32) × 5/9 = 176,7 → 177 °C. El truco
    // «divide °F entre 2 y resta 15»: 350 ÷ 2 − 15 = 160 °C (−17 °C; a 400 °F, 185 frente a 204).
    test.fail();
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const visible = page.locator('li', { hasText: '¿Cómo convierto °F a °C en el horno?' });
    await expect(visible).toContainText(/350\s?°F = 177\s?°C/);
    await expect(visible).not.toContainText(/entre 2 y resta 15/);
    const { preguntas } = await faqPagesJsonLd(page);
    for (const p of preguntas) expect(p.respuesta).not.toMatch(/entre 2 y resta 15/);
  });

  test('HALLAZGO (30/10/2026, ABIERTO, el mismo de la onza líquida) · «la taza americana tiene exactamente 240 ml», y la de la definición tiene 236,588', async ({
    page,
  }) => {
    // Es la cara de texto del hallazgo de la onza líquida (bloque «conversor y escalador»):
    // 1 taza = 1/16 galón US = 236,588 ml (= 8 × 29,5735, la fl oz que usa la propia app);
    // 240 ml es la taza redondeada del etiquetado nutricional. El paso 3 de la guía dice a la
    // vez «1 cup = 240 ml» y «1 pint US = 473 ml», y una pinta son dos tazas (480 ≠ 473).
    // Se repara eligiendo UN sistema y haciendo que motor y textos digan lo mismo.
    test.fail();
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.locator('li', { hasText: 'taza americana y la española' })).not.toContainText(
      /exactamente 240 ml/,
    );
    await expect(page.locator('li', { hasText: 'Confundir la taza española' })).not.toContainText(
      /exactamente 240 ml/,
    );
    const { preguntas } = await faqPagesJsonLd(page);
    for (const p of preguntas) expect(p.respuesta).not.toMatch(/exactamente 240 ml/);
  });

  test('HALLAZGO (30/10/2026, ABIERTO) · formato: «2.5 partes agua», «180°C», «70%» y «8g»', async ({
    page,
  }) => {
    // Coma decimal y espacio entre la cifra y la unidad o el % (CLAUDE.md global §2).
    // Al repararlo, el test «548 (reparado)» de arriba, que busca «Harina: 8g», cambia también.
    test.fail();
    await page.getByRole('button', { name: 'Tiempos', exact: true }).click();
    await expect(
      page.locator('[class*="tablaRow"]').filter({ hasText: 'Arroz integral' }),
    ).not.toContainText('2.5');
    await expect(
      page.locator('[class*="tablaRow"]').filter({ hasText: 'Pollo entero' }),
    ).toContainText(/180\s°C/);
    await page.getByRole('button', { name: 'Sustitutos', exact: true }).click();
    await expect(page.locator('li', { hasText: 'Eritritol' })).toContainText(/70\s%/);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(
      page.locator('h4', { hasText: 'Con una cuchara sopera' }).locator('xpath=..'),
    ).toContainText(/Harina: \d+\sg/);
  });
});

test.describe('Re-inspección 30/10/2026 — contraste de los colores escritos a mano en el módulo', () => {
  test('HALLAZGO (30/10/2026, ABIERTO) · claro: la temperatura de la tabla de tiempos (#e67e22) da 2,85:1', async ({
    page,
  }) => {
    // .temperatura { color: #e67e22 } sobre la tarjeta blanca: 2,85:1. Es texto de 13,6 px
    // seminegrita (pequeño), así que pide 4,5:1. En oscuro, sobre #2D2D2D, da 4,83:1.
    test.fail();
    await page.goto(RUTA);
    await prepararParaMedir(page);
    await activarTema(page, 'light');
    await page.getByRole('button', { name: 'Tiempos', exact: true }).click();
    const m = await contrasteDe(page, '[class*="temperatura"]');
    expect(m.ratio, `${m.color} sobre ${m.fondo}`).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO (30/10/2026, ABIERTO) · oscuro: el rojo #e74c3c de «Errores comunes» da 2,70:1 sobre su tinte', async ({
    page,
  }) => {
    // [data-theme='dark'] .warningList li strong { color: #e74c3c } sobre el tinte rojo de la
    // caja compuesto con la tarjeta: 2,70:1; el título de la caja, 3,14:1. Ninguno es texto
    // grande (13,9 px y 16 px en negrita): piden 4,5:1. En claro, #c0392b da 4,64-5,11:1.
    test.fail();
    await page.goto(RUTA);
    await prepararParaMedir(page);
    await activarTema(page, 'dark');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const lista = await contrasteDe(page, '[class*="warningList"] li strong');
    expect(lista.ratio, `${lista.color} sobre ${lista.fondo}`).toBeGreaterThanOrEqual(4.5);
    const titulo = await contrasteDe(page, '[class*="warningHeader"] strong');
    expect(titulo.ratio, `${titulo.color} sobre ${titulo.fondo}`).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO (30/10/2026, ABIERTO) · oscuro: las «Clave:» de los escenarios dan 4,18:1 (familia C0278)', async ({
    page,
  }) => {
    // .escenarioTip en --primary-texto (#3FA5D1) sobre rgba(46,134,171,0.15) compuesto con la
    // tarjeta oscura: 4,18:1 en texto de 13,1 px. Receta de la familia (ec3a8adb): cambiar el
    // FONDO, no el texto. En claro da 4,97:1.
    test.fail();
    await page.goto(RUTA);
    await prepararParaMedir(page);
    await activarTema(page, 'dark');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const m = await contrasteDe(page, '[class*="escenarioTip"]');
    expect(m.ratio, `${m.color} sobre ${m.fondo}`).toBeGreaterThanOrEqual(4.5);
  });
});
