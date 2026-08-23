import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — calculadora-cocina (segmento cálculo, riesgo 2, 224 usos reales · vertical Coquinum)
 *
 * Primera inspección: 21/08/2026. La app promete en su <h1> «Calculadora de Cocina» y en su
 * subtítulo «Convierte unidades, escala recetas, consulta tiempos y encuentra sustitutos».
 * La metadata añade «convertir tazas a gramos, ml, onzas» y «escalar recetas según comensales».
 * Hay, por tanto, verdad comprobable: las dos primeras pestañas calculan.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/calculadora-cocina/page.tsx
 *     · unidadesCocina          ← factor de cada unidad (campo `aGramos`: g si es peso, ml si es volumen)
 *     · densidadesIngredientes  ← g/ml de cada ingrediente, para el cruce peso↔volumen
 *     · convertirUnidades()     ← misma categoría: (cantidad × factorOrigen) / factorDestino
 *                                 volumen→peso: ml × densidad · peso→volumen: g ÷ densidad
 *     · escalarReceta()         ← factor = deseadas / originales, aplicado línea a línea con
 *                                 la regex /^([\d.,]+)\s*(.+)$/
 *   lib/formatters.ts           ← parseSpanishNumber (entrada) y formatNumber (salida en es-ES)
 *
 * LA TABLA QUE PUBLICA LA PROPIA APP (manda sobre cualquier memoria):
 *   1 taza = 240 ml · 1 cucharada = 15 ml · 1 cucharadita = 5 ml
 *   1 oz = 28,3495 g · 1 lb = 453,592 g · 1 fl oz = 29,5735 ml
 *   densidades (g/ml): agua 1 · leche 1,03 · aceite 0,92 · harina 0,53 · azúcar 0,85 ·
 *                      azúcar glass 0,48 · sal 1,2 · arroz 0,75 · miel 1,42 ·
 *                      mantequilla 0,946 · cacao 0,52 · avena 0,4
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — 2 tazas de harina a gramos
 *       2 tazas × 240 ml/taza = 480 ml
 *       480 ml × 0,53 g/ml    = 254,4 g          → «254,40 Gramos (g)»
 *     Contraste de la densidad con fuente estándar: 0,53 g/ml × 240 ml = 127,20 g por taza,
 *     dentro de los 120–130 g que citan King Arthur Baking y la propia FAQ de la app. VÁLIDA.
 *     Y dos conversiones de la misma categoría, que no dependen de densidad:
 *       1 lb  → 1 × 453,592 / 1  = 453,592 g     → «453,59 Gramos (g)»
 *       10 oz → 10 × 28,3495 / 1 = 283,495 g     → «283,50 Gramos (g)»
 *     Y la vuelta atrás (peso→volumen), que divide en vez de multiplicar:
 *       500 g de harina → 500 / 0,53 = 943,396 ml ; 943,396 / 240 = 3,9308 tazas → «3,93 Tazas (cup)»
 *
 *   CASO 2 (límite) — el cero, el negativo y el salto al separador de millar
 *       0 y −5 no tienen sentido físico como cantidad: deben rechazarse, no dar 0,00 ni un negativo.
 *       1.000 tazas de harina (mil, en formato español) = 1000 × 240 × 0,53 = 127.200 g
 *         → «127.200,00 Gramos (g)», con punto de millar y coma decimal.
 *         Ojo: el eco de la entrada sale «1000,00» sin punto, y ES CORRECTO — es-ES no agrupa
 *         los números de cuatro cifras (minimumGroupingDigits = 2). Por eso el caso mira el
 *         resultado, de seis cifras, donde el separador de millar sí tiene que aparecer.
 *
 *   CASO 3 (rechazo) — texto y vacío
 *       «abc» y «» → parseSpanishNumber devuelve NaN → mensaje de aviso.
 *       Lo que NO debe aparecer nunca: «NaN», «Infinity», «undefined» ni «No definido».
 *
 *   ESCALADOR, resuelto a mano con la receta que trae por defecto (200g harina / 100g azúcar /
 *   2 huevos / 150ml leche):
 *       4 → 6 porciones, factor 1,5 : 300 g harina · 150 g azúcar · 3 huevos · 225 ml leche
 *       4 → 5 porciones, factor 1,25: 250 g harina · 125 g azúcar · 2,5 huevos · 187,5 ml leche
 *         (2 × 1,25 = 2,5 → sale con COMA decimal, no con punto)
 *       4 → 0 porciones: rechazo, sin división por cero ni factor 0.
 *
 * HALLAZGOS CONOCIDOS (se documentan aquí como testigo, NO se corrigen desde el test):
 *   1. Las cantidades en fracción se rompen: «1/2 cebolla» × 2 devuelve «2 /2 cebolla», porque la
 *      regex solo captura el numerador y deja «/2» dentro del resto de la línea.
 *   2. Ningún <button> lleva type="button" y las cuatro pestañas no exponen aria-pressed ni
 *      role="tab"+aria-selected: el estado activo viaja solo por la clase CSS.
 *   Si algún día se arreglan, los dos bloques marcados TESTIGO fallarán y habrá que invertirlos.
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

  test('TESTIGO · líneas sin número intactas, decimal español bien, fracción rota', async ({
    page,
  }) => {
    const texto = await escalar(page, '4', '8', '1/2 cebolla\n1,5 tazas harina\nSal al gusto');
    // Bien: la línea sin cantidad se devuelve tal cual y el decimal con coma se escala
    expect(texto).toContain('Sal al gusto');
    expect(texto).toContain('3 tazas harina'); // 1,5 × 2 = 3
    // HALLAZGO ABIERTO: lo esperado sería «1 cebolla» (media cebolla × 2). La regex captura solo
    // el «1» y arrastra el «/2» al resto de la línea. Si se arregla, este expect fallará.
    // REPARADO (hallazgo 143): la fracción se escala entera. «1/2» ×2 = «1», no «2 /2».
    expect(texto).toContain('1 cebolla');
    expect(texto).not.toContain('2 /2');
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
      // HALLAZGO ABIERTO: sin aria-pressed ni role="tab"+aria-selected, y sin type="button"
      // (regla obligatoria del proyecto). Cuando se corrija, hay que invertir estos dos expect.
      expect(await boton.getAttribute('aria-pressed')).not.toBeNull();
      expect(await boton.getAttribute('type')).toBe('button');
    }
  });
});
