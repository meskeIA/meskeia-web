import { test, expect, type Page } from '@playwright/test';

/**
 * Orientador Tensión Arterial — test de regresión (Inspector; 1.ª pasada 25/08/2026)
 *
 * Segmento «cálculo», riesgo 1 (el máximo del catálogo): la app clasifica una lectura de
 * tensión arterial y emite una recomendación de conducta. Un corte mal puesto tranquiliza a
 * quien debería ir al médico, o alarma a quien no lo necesita.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * QUÉ PROMETE (de aquí salen los valores esperados de este fichero)
 *   - <h1> «Orientador Tensión Arterial» + subtítulo: «Clasifica tu presión según las guías
 *     ESH/ESC 2023 · Calcula TAM y presión de pulso».
 *   - Tabla de referencia de la propia app (botón «Ver tabla de clasificación ESH/ESC 2023»)
 *     y tabla del bloque educativo, ambas rotuladas «Fuente: Guías ESH/ESC 2023 para el
 *     manejo de la hipertensión arterial».
 *   - metadata.ts → jsonLd.features: «Clasificación … (hipotensión, óptima, normal,
 *     normal-alta, HTA grados 1-3, crisis)», «TAM con fórmula diastólica + (sistólica −
 *     diastólica) / 3», «presión de pulso (normal 40-60 mmHg)», «Aviso inmediato de crisis
 *     hipertensiva (≥ 180/120 mmHg)», «Detección de HTA sistólica aislada (≥ 140 / < 90)».
 *
 * LA GUÍA CLÍNICA QUE LA APP DECLARA, Y DE DÓNDE SALE CADA CORTE
 *   La app se acoge al marco EUROPEO (ESC/ESH), NO al americano. La diferencia importa: la
 *   AHA/ACC 2017 llama hipertensión a partir de 130/80 mmHg, mientras que la europea llama a
 *   130-139/85-89 «normal-alta» y reserva «hipertensión» para ≥ 140/90. La app aplica los
 *   cortes europeos de forma consistente — NO mezcla criterios — y la tabla que muestra es la
 *   clásica ESC/ESH, idéntica en la ESC/ESH 2018 y en la ESH 2023:
 *
 *     Hipotensión ............ < 90 / < 60
 *     Óptima ................. < 120 / < 80
 *     Normal ................. 120-129 / 80-84
 *     Normal-alta ............ 130-139 / 85-89
 *     HTA grado 1 ............ 140-159 / 90-99
 *     HTA grado 2 ............ 160-179 / 100-109
 *     HTA grado 3 ............ ≥ 180 / ≥ 110
 *     HTA sistólica aislada .. ≥ 140 con diastólica < 90
 *     Crisis hipertensiva .... ≥ 180 o ≥ 120  (definición propia declarada por la app)
 *
 *   REGLA CLÍNICA QUE GOBIERNA TODO ESTE FICHERO: cuando sistólica y diastólica caen en
 *   categorías distintas, manda LA MÁS ALTA de las dos. Nunca la sistólica por defecto, nunca
 *   el promedio. Es la regla de la propia tabla ESC/ESH y la que hace que 135/95 sea grado 1.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (intermedia) — 135/82
 *          Sistólica 135 → normal-alta (130-139). Diastólica 82 → normal (80-84).
 *          Manda la más alta → «Normal-Alta».
 *          TAM = 82 + (135 − 82)/3 = 82 + 17,67 = 99,67 → 100 mmHg.
 *          Presión de pulso = 135 − 82 = 53 → «Normal (40–60 mmHg)».
 *
 *   CASO 2 (límite) — el corte 140/90, por los dos lados, y el resto de bordes
 *          140/90 → «HTA Grado 1». El operador tiene que ser >=, no >: la ESC/ESH define
 *            hipertensión como «≥ 140 y/o ≥ 90», así que 140/90 YA es hipertensión. Con > se
 *            iría a normal-alta y un hipertenso saldría de la app tranquilo.
 *          139/89 → «Normal-Alta». Un punto por debajo NO puede ser hipertensión.
 *          119/79 → «Tensión Óptima» · 120/80 → «Tensión Normal» (mismo criterio, borde
 *            inferior inclusivo).
 *          179/119 → «HTA Grado 3» · 180/120 → «Crisis Hipertensiva» (la app declara el corte
 *            de crisis con ≥, y así lo aplica; su tabla de referencia dice otra cosa →
 *            hallazgo abierto 2).
 *
 *   CASO 3 (discordante) — EL QUE DE VERDAD IMPORTA
 *          135/95 → sistólica normal-alta, diastólica grado 1. Manda la más alta →
 *            «HTA Grado 1». Si la app se quedara con la sistólica diría «Normal-Alta» y si
 *            promediara (115) diría «Tensión Óptima»: las dos respuestas son peligrosas.
 *          150/85 → sistólica grado 1, diastólica normal-alta → hipertensión, y como la
 *            diastólica es < 90 la etiqueta correcta es «HTA Sistólica Aislada».
 *          175/55 → sistólica de grado 2 con diastólica baja. Es el perfil clásico de la
 *            persona mayor con rigidez arterial, el que la propia app describe en su tarjeta
 *            «👴 Persona mayor» y en su fila «HTA Sistólica Aislada ≥ 140 / < 90». Debe salir
 *            «HTA Sistólica Aislada». HOY SALE «Hipotensión» → hallazgo abierto 1, CRÍTICO.
 *
 *   CASO 4 (crisis) — 185/125 → «Crisis Hipertensiva», rótulo de urgencia «Emergencia» y una
 *          recomendación que manda a urgencias / al 112, NO un consejo de estilo de vida.
 *
 *   CASO 5 (rechazo) — entradas que no describen a ninguna persona
 *          80/120 (diastólica > sistólica) · 0/0 · −120/−80. Las tres deben rechazarse con
 *          aviso y NO emitir clasificación.
 *
 *   MARCO LEGAL — DisclaimerCard médico de severidad «critical», NO colapsable, con role
 *          «alert», sin botón de ocultar, y con la frase «no constituyen ni sustituyen un
 *          diagnóstico médico». La política de disclaimers de meskeIA prohíbe colapsar los
 *          niveles 1 y 2.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * HALLAZGOS DE LA 1.ª PASADA (25/08/2026)
 *   1 CRÍTICO — `clasificarTension()` evalúa la hipotensión ANTES que la hipertensión y con
 *     OR: `if (sis < 90 || dia < 60) return 'hipotension'`. Cualquier lectura con diastólica
 *     < 60 y sistólica < 180 sale como «Hipotensión», incluidas 145/58, 160/55 y 179/59.
 *     1.200 combinaciones válidas con sistólica ≥ 140 quedan rotuladas «Hipotensión» con la
 *     recomendación «Consulta con tu médico si presentas síntomas como mareos», mientras la
 *     propia app calcula a su lado una presión de pulso de 120 mmHg «Muy elevada».
 *   2 MEDIO — la tabla de referencia visible dice «Crisis Hipertensiva > 180 / > 120», pero
 *     el código aplica ≥, y la tabla del bloque educativo dice ≥. Además «HTA Grado 3 ≥ 180»
 *     es inalcanzable por vía sistólica, porque toda sistólica ≥ 180 se resuelve antes como
 *     crisis.
 *   3 MEDIO — la app declara dos versiones distintas de la misma guía: la página y el
 *     WebApplication JSON-LD dicen «ESH/ESC 2023» (11 apariciones) y la meta description y el
 *     FAQPage JSON-LD dicen «ESH/ESC 2018» (6 apariciones), igual que la ficha del catálogo.
 *   4 BAJO — 14 emojis junto a texto sin `aria-hidden` (`node scripts/check-a11y-jsx.mjs
 *     app/orientador-tension-arterial/page.tsx`); no se duplican aquí.
 *
 * HALLAZGOS ABIERTOS: al final, marcados con `test.fail()`. Afirman lo que DEBERÍA pasar, así
 * que hoy fallan a propósito; cuando se reparen, se les quita el `test.fail()` y quedan como
 * regresión.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

const RUTA = '/orientador-tension-arterial/';

/** Introduce una medición y pulsa «Calcular». */
async function medir(page: Page, sistolica: string, diastolica: string): Promise<void> {
  await page.fill('#sistolica', '');
  await page.fill('#diastolica', '');
  if (sistolica !== '') await page.fill('#sistolica', sistolica);
  if (diastolica !== '') await page.fill('#diastolica', diastolica);
  await page.getByRole('button', { name: 'Calcular', exact: true }).click();
}

/** Nombre de la categoría que la app muestra en el resultado. */
function categoria(page: Page) {
  return page.locator('[class*="resultadoNombre"]');
}

/** Rótulo de urgencia (Normal / Atención / Alerta / Urgente / Emergencia). */
function urgencia(page: Page) {
  return page.locator('[class*="resultadoUrgencia"]');
}

/** Recomendación de conducta. */
function recomendacion(page: Page) {
  return page.locator('[class*="resultadoRecomendacion"]');
}

/** Los dos derivados: [0] TAM, [1] presión de pulso. */
function derivadoValor(page: Page, indice: number) {
  return page.locator('[class*="derivadoValor"]').nth(indice);
}

/** La nota bajo cada derivado: [1] es la valoración de la presión de pulso. */
function derivadoNota(page: Page, indice: number) {
  return page.locator('[class*="derivadoNota"]').nth(indice);
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.locator('#sistolica')).toBeVisible();
});

// ─── CASO 1 · lectura intermedia ────────────────────────────────────────────────────────

test('CASO 1 · 135/82 es Normal-Alta, con TAM 100 mmHg y presión de pulso 53 mmHg', async ({ page }) => {
  await medir(page, '135', '82');

  // ESC/ESH: sistólica 130-139 → normal-alta; diastólica 80-84 → normal. Manda la más alta.
  await expect(categoria(page)).toHaveText('Normal-Alta');
  await expect(urgencia(page)).toContainText('Atención');

  // TAM = 82 + (135 − 82)/3 = 99,67 → 100 (la fórmula que la propia app publica)
  await expect(derivadoValor(page, 0)).toContainText('100');
  // Presión de pulso = 135 − 82 = 53, dentro del rango normal 40-60 que la app declara
  await expect(derivadoValor(page, 1)).toContainText('53');
  await expect(derivadoNota(page, 1)).toHaveText('Normal (40–60 mmHg)');
});

// ─── CASO 2 · los cortes, por los dos lados ─────────────────────────────────────────────

test('CASO 2 · el corte 140/90 es inclusivo: 140/90 ya es HTA Grado 1 y 139/89 todavía no', async ({ page }) => {
  // ESC/ESH define hipertensión como sistólica ≥ 140 y/o diastólica ≥ 90. El operador es >=.
  await medir(page, '140', '90');
  await expect(categoria(page)).toHaveText('HTA Grado 1');
  await expect(urgencia(page)).toContainText('Alerta');
  await expect(recomendacion(page)).toContainText('Consulta a tu médico');

  // Un punto por debajo del corte NO puede ser hipertensión.
  await medir(page, '139', '89');
  await expect(categoria(page)).toHaveText('Normal-Alta');
});

test('CASO 2b · los bordes inferiores también son inclusivos: 119/79 óptima, 120/80 normal', async ({ page }) => {
  // ESC/ESH: óptima < 120/80; normal 120-129 / 80-84.
  await medir(page, '119', '79');
  await expect(categoria(page)).toHaveText('Tensión Óptima');

  await medir(page, '120', '80');
  await expect(categoria(page)).toHaveText('Tensión Normal');
});

test('CASO 2c · el corte de crisis: 179/119 es Grado 3 y 180/120 ya es Crisis', async ({ page }) => {
  // La app declara la crisis como «sistólica ≥ 180 y/o diastólica ≥ 120».
  await medir(page, '179', '119');
  await expect(categoria(page)).toHaveText('HTA Grado 3');

  await medir(page, '180', '120');
  await expect(categoria(page)).toHaveText('Crisis Hipertensiva');
});

// ─── CASO 3 · el discordante ────────────────────────────────────────────────────────────

test('CASO 3 · 135/95 manda la diastólica: es HTA Grado 1, no Normal-Alta ni un promedio', async ({ page }) => {
  await medir(page, '135', '95');

  // Sistólica 135 (normal-alta) + diastólica 95 (grado 1) → manda la MÁS ALTA.
  // Quedarse con la sistólica daría «Normal-Alta»; promediar (115/…) daría «Óptima».
  await expect(categoria(page)).toHaveText('HTA Grado 1');
  await expect(recomendacion(page)).toContainText('Consulta a tu médico');

  // TAM = 95 + (135 − 95)/3 = 108,33 → 108 · presión de pulso = 40
  await expect(derivadoValor(page, 0)).toContainText('108');
  await expect(derivadoValor(page, 1)).toContainText('40');
});

test('CASO 3b · 150/85 es hipertensión sistólica aislada (≥ 140 con diastólica < 90)', async ({ page }) => {
  await medir(page, '150', '85');

  await expect(categoria(page)).toHaveText('HTA Sistólica Aislada');
  await expect(urgencia(page)).toContainText('Alerta');
  await expect(recomendacion(page)).toContainText('Consulta a tu médico');

  // TAM = 85 + (150 − 85)/3 = 106,67 → 107 · presión de pulso = 65 → elevada
  await expect(derivadoValor(page, 0)).toContainText('107');
  await expect(derivadoValor(page, 1)).toContainText('65');
  await expect(derivadoNota(page, 1)).toHaveText('Elevada (> 60 mmHg)');
});

test('CASO 3c · 165/85: la sistólica de grado 2 manda sobre una diastólica normal-alta', async ({ page }) => {
  await medir(page, '165', '85');
  await expect(categoria(page)).toHaveText('HTA Grado 2');
  await expect(urgencia(page)).toContainText('Urgente');
});

// ─── CASO 4 · crisis hipertensiva ───────────────────────────────────────────────────────

test('CASO 4 · 185/125 es Crisis Hipertensiva y deriva a urgencias, no a un consejo de hábitos', async ({ page }) => {
  await medir(page, '185', '125');

  await expect(categoria(page)).toHaveText('Crisis Hipertensiva');
  await expect(urgencia(page)).toContainText('Emergencia');

  // Lo que NO puede pasar aquí es que la app recomiende dieta o ejercicio.
  await expect(recomendacion(page)).toContainText('urgencias');
  await expect(recomendacion(page)).toContainText('112');
  await expect(recomendacion(page)).not.toContainText(/sodio|ejercicio|hábitos/i);

  // TAM = 125 + (185 − 125)/3 = 145
  await expect(derivadoValor(page, 0)).toContainText('145');
});

// ─── CASO 5 · entradas imposibles ───────────────────────────────────────────────────────

test('CASO 5 · rechaza diastólica mayor que sistólica sin emitir clasificación', async ({ page }) => {
  await medir(page, '80', '120');
  await expect(page.locator('#error-sis')).toHaveText('La sistólica debe ser mayor que la diastólica');
  await expect(categoria(page)).toHaveCount(0);
});

test('CASO 5b · rechaza ceros y negativos sin emitir clasificación', async ({ page }) => {
  await medir(page, '0', '0');
  await expect(page.locator('#error-sis')).toContainText('fuera de rango');
  await expect(page.locator('#error-dia')).toContainText('fuera de rango');
  await expect(categoria(page)).toHaveCount(0);

  await medir(page, '-120', '-80');
  await expect(page.locator('#error-sis')).toContainText('fuera de rango');
  await expect(page.locator('#error-dia')).toContainText('fuera de rango');
  await expect(categoria(page)).toHaveCount(0);
});

// ─── MARCO LEGAL ────────────────────────────────────────────────────────────────────────

test('MARCO LEGAL · el aviso médico es crítico, no colapsable y niega el diagnóstico', async ({ page }) => {
  const aviso = page.locator('[class*="disclaimerCard"]').first();

  // Política de disclaimers de meskeIA: salud orientativa → nivel 1, jamás colapsable.
  await expect(aviso).toBeVisible();
  await expect(aviso).toHaveAttribute('role', 'alert');
  await expect(aviso).toHaveClass(/severity-critical/);
  await expect(aviso).toHaveClass(/variant-medical/);
  await expect(aviso.getByRole('button')).toHaveCount(0);

  await expect(aviso).toContainText('no constituyen ni sustituyen un diagnóstico médico');
  await expect(aviso).toContainText('consulta siempre a tu médico');
  await expect(aviso).toContainText('112');
});

test('MARCO LEGAL · el subtítulo y la fuente de la tabla nombran la guía que la app aplica', async ({ page }) => {
  await expect(page.locator('h1')).toHaveText('Orientador Tensión Arterial');
  await expect(page.locator('h1 + p')).toContainText('ESH/ESC 2023');

  await page.getByRole('button', { name: /tabla de clasificación/i }).click();
  await expect(page.locator('[class*="tablaFuente"]')).toContainText(
    'Guías ESH/ESC 2023 para el manejo de la hipertensión arterial',
  );
});

test('MARCO LEGAL · aplica los cortes europeos (≥ 140/90), no los de la AHA (≥ 130/80)', async ({ page }) => {
  // La diferencia entre guías no es cosmética: la AHA/ACC 2017 llamaría hipertensión a
  // 132/82, la ESC/ESH lo llama normal-alta. La app cita la europea, así que debe aplicarla.
  await medir(page, '132', '82');
  await expect(categoria(page)).toHaveText('Normal-Alta');
  await expect(categoria(page)).not.toHaveText(/HTA Grado/);
});

// ─── HALLAZGOS ABIERTOS ─────────────────────────────────────────────────────────────────

test('ABIERTO 1 (CRÍTICO) · 175/55 es hipertensión sistólica aislada, no hipotensión', async ({ page }) => {
  test.fail(); // hoy devuelve «Hipotensión»

  await medir(page, '175', '55');

  // La propia app declara la fila «HTA Sistólica Aislada ≥ 140 / < 90» y describe este perfil
  // en su tarjeta «Persona mayor». 175 es sistólica de grado 2 (160-179).
  await expect(categoria(page)).toHaveText('HTA Sistólica Aislada');
  await expect(categoria(page)).not.toHaveText('Hipotensión');
});

test('ABIERTO 1b (CRÍTICO) · con diastólica < 60, la sistólica alta sigue mandando', async ({ page }) => {
  test.fail(); // hoy las tres devuelven «Hipotensión»

  for (const [sis, dia] of [['145', '58'], ['160', '55'], ['179', '59']]) {
    await medir(page, sis, dia);
    await expect(categoria(page)).toHaveText('HTA Sistólica Aislada');
  }
});

test('ABIERTO 1c (CRÍTICO) · una presión de pulso «Muy elevada» no puede rotularse hipotensión', async ({ page }) => {
  test.fail(); // hoy convive «Hipotensión» con una presión de pulso de 120 mmHg

  await medir(page, '175', '55');
  // La app calcula 175 − 55 = 120 mmHg y lo llama «Muy elevada (> 80 mmHg)» — signo de
  // rigidez arterial — mientras la cabecera dice «por debajo de los valores normales».
  await expect(derivadoNota(page, 1)).toHaveText('Muy elevada (> 80 mmHg)');
  await expect(recomendacion(page)).not.toContainText('mareos, cansancio o desmayos');
});

test('ABIERTO 2 (MEDIO) · la tabla visible debe usar el mismo corte de crisis que el código', async ({ page }) => {
  test.fail(); // la tabla dice «> 180 / > 120»; el código y la tabla educativa usan ≥

  await page.getByRole('button', { name: /tabla de clasificación/i }).click();
  const filaCrisis = page.locator('table[aria-label*="Clasificación"] tbody tr', {
    hasText: 'Crisis Hipertensiva',
  });
  await expect(filaCrisis.locator('td').nth(1)).toHaveText('≥ 180');
  await expect(filaCrisis.locator('td').nth(2)).toHaveText('≥ 120');
});

test('ABIERTO 3 (MEDIO) · la app debe citar UNA sola versión de la guía en toda la página', async ({ page }) => {
  test.fail(); // la meta description y el FAQPage JSON-LD siguen diciendo «ESH/ESC 2018»

  const html = await page.content();
  expect(html).toContain('ESH/ESC 2023');
  expect(html).not.toContain('ESH/ESC 2018');
});
