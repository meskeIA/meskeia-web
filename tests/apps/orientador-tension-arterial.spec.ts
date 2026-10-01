import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { CONDUCTA_GRADO_3 } from '../../app/orientador-tension-arterial/motor';

/**
 * Orientador Tensión Arterial — test de regresión (Inspector; 1.ª pasada 25/08/2026)
 *
 * Segmento «cálculo», riesgo 1 (el máximo del catálogo): la app clasifica una lectura de
 * tensión arterial y emite una recomendación de conducta. Un corte mal puesto tranquiliza a
 * quien debería ir al médico, o alarma a quien no lo necesita.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * QUÉ PROMETE (de aquí salen los valores esperados de este fichero)
 *   (Texto tal como estaba en la 1.ª pasada. Desde la reparación 296 —25/08/2026— la página
 *   cita una sola guía, «ESH 2023», sin «/ESC»: lo vigila la REGRESIÓN 296 de más abajo.)
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
 *   (Tabla tal como estaba en la 1.ª pasada. Desde el 01/10/2026 —hallazgos 2562 y 2563— la app
 *   aplica la tabla ESH 2023 tal cual: sin «crisis hipertensiva», con grado 3 ≥ 180 y/o ≥ 110 y
 *   la HTA diastólica aislada; la hipotensión queda como criterio propio solo dentro del tramo
 *   «óptima». Ver la sección «RE-INSPECCIÓN · 01/10/2026» al final.)
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
 *            de crisis con ≥, y así lo aplica; su tabla de referencia decía otra cosa →
 *            hallazgo 295, reparado el 25/08/2026).
 *
 *   CASO 3 (discordante) — EL QUE DE VERDAD IMPORTA
 *          135/95 → sistólica normal-alta, diastólica grado 1. Manda la más alta →
 *            «HTA Grado 1». Si la app se quedara con la sistólica diría «Normal-Alta» y si
 *            promediara (115) diría «Tensión Óptima»: las dos respuestas son peligrosas.
 *          150/85 → sistólica grado 1, diastólica normal-alta → hipertensión, y como la
 *            diastólica es < 90 la etiqueta correcta es «HTA Sistólica Aislada (Grado 1)».
 *          175/55 → sistólica de grado 2 con diastólica baja. Es el perfil clásico de la
 *            persona mayor con rigidez arterial, el que la propia app describe en su tarjeta
 *            «👴 Persona mayor» y en su fila «HTA Sistólica Aislada ≥ 140 / < 90». Debe salir
 *            «HTA Sistólica Aislada (Grado 2)» — el patrón lleva el GRADO de su sistólica,
 *            que es lo que fija la urgencia. HASTA EL 25/08/2026 SALÍA «Hipotensión».
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
 * HALLAZGOS DE LA 1.ª PASADA (25/08/2026) — LOS CUATRO REPARADOS EL MISMO DÍA
 *
 * Lo que la reparación decidió y no estaba en el acta: la HTA sistólica aislada dejó de ser
 * una rama de `clasificarTension()` y pasó a ser un MATIZ sobre el grado. El acta pedía que
 * 175/55 saliera «HTA Sistólica Aislada», pero esa categoría tenía urgencia «Alerta»
 * cableada, así que rotularla a secas habría rebajado un grado 2 —urgencia «Urgente»— a
 * alerta: se arreglaba el nombre y se estropeaba la conducta. La guía ESH gradúa el patrón
 * por la sistólica, y eso es lo que hace ahora la app.
 *
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
 * Los cuatro quedan al final como tests de REGRESIÓN (ya sin `test.fail()`), más uno que la
 * reparación exigió y el acta no tenía: 294d comprueba que mover la rama de hipotensión no
 * la dejó inalcanzable, que es el hueco que ese arreglo podía abrir en silencio.
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

test('CASO 2c · el techo de la tabla ESH es el grado 3: 179/119 y 180/120 son HTA Grado 3', async ({ page }) => {
  // Reescrito el 01/10/2026 (hallazgo 2562). Antes fijaba 180/120 como «Crisis Hipertensiva»,
  // una categoría que la ESH 2023 no tiene: su tabla termina en grado 3 (≥ 180 y/o ≥ 110).
  // 179/119: S grado 2, D grado 3 → manda la más alta. No es aislada: S ≥ 140.
  await medir(page, '179', '119');
  await expect(categoria(page)).toHaveText('HTA Grado 3');

  await medir(page, '180', '120');
  await expect(categoria(page)).toHaveText('HTA Grado 3');
  await expect(categoria(page)).not.toContainText('Crisis');
});

// ─── CASO 3 · el discordante ────────────────────────────────────────────────────────────

test('CASO 3 · 135/95 manda la diastólica: es HTA Grado 1, no Normal-Alta ni un promedio', async ({ page }) => {
  await medir(page, '135', '95');

  // Sistólica 135 (normal-alta) + diastólica 95 (grado 1) → manda la MÁS ALTA: grado 1.
  // Quedarse con la sistólica daría «Normal-Alta»; promediar (115/…) daría «Óptima».
  // Desde el 01/10/2026 (hallazgo 2562) el patrón se nombra: S < 140 y D ≥ 90 es la fila ESH
  // «HTA diastólica aislada», graduada por la diastólica.
  await expect(categoria(page)).toHaveText('HTA Diastólica Aislada (Grado 1)');
  await expect(recomendacion(page)).toContainText('Consulta a tu médico');

  // TAM = 95 + (135 − 95)/3 = 108,33 → 108 · presión de pulso = 40
  await expect(derivadoValor(page, 0)).toContainText('108');
  await expect(derivadoValor(page, 1)).toContainText('40');
});

test('CASO 3b · 150/85 es hipertensión sistólica aislada (≥ 140 con diastólica < 90)', async ({ page }) => {
  await medir(page, '150', '85');

  // El patrón se rotula con su grado, que la guía ESH fija por la SISTÓLICA: 150 → grado 1.
  await expect(categoria(page)).toHaveText('HTA Sistólica Aislada (Grado 1)');
  await expect(urgencia(page)).toContainText('Alerta');
  await expect(recomendacion(page)).toContainText('Consulta a tu médico');

  // TAM = 85 + (150 − 85)/3 = 106,67 → 107 · presión de pulso = 65 → elevada
  await expect(derivadoValor(page, 0)).toContainText('107');
  await expect(derivadoValor(page, 1)).toContainText('65');
  await expect(derivadoNota(page, 1)).toHaveText('Elevada (> 60 mmHg)');
});

test('CASO 3c · 165/85: la sistólica de grado 2 manda sobre una diastólica normal-alta', async ({ page }) => {
  await medir(page, '165', '85');
  // Con diastólica < 90 el patrón es sistólico aislado, pero el GRADO —y con él la
  // urgencia— sale de la sistólica: 165 está en 160-179, o sea grado 2.
  await expect(categoria(page)).toHaveText('HTA Sistólica Aislada (Grado 2)');
  await expect(urgencia(page)).toContainText('Urgente');
});

// ─── CASO 4 · crisis hipertensiva ───────────────────────────────────────────────────────

test('CASO 4 · 185/125 es HTA Grado 3 y su conducta separa con síntomas (112) de sin síntomas (médico hoy)', async ({ page }) => {
  // Reescrito el 01/10/2026 (hallazgos 2562 y 2564). Antes fijaba «Crisis Hipertensiva» con
  // «Emergencia» y el 112 sin condición. La ESH 2023 llama a esto grado 3, y lo que lo hace
  // emergencia es el daño agudo de órgano, que se ve en los síntomas (van den Born et al., ESC
  // Council on Hypertension 2019): con ellos, 112; sin ellos, repetir y médico en el día.
  await medir(page, '185', '125');

  await expect(categoria(page)).toHaveText('HTA Grado 3');
  await expect(urgencia(page)).toContainText('Muy urgente');

  // Lo que NO puede pasar aquí es que la app recomiende dieta o ejercicio, ni que se pierda
  // la salida al 112 para quien tiene síntomas.
  await expect(recomendacion(page)).toContainText('urgencias');
  await expect(recomendacion(page)).toContainText('112');
  await expect(recomendacion(page)).toContainText('dolor en el pecho');
  await expect(recomendacion(page)).toContainText('hoy mismo con tu médico');
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
  await expect(page.locator('h1 + p')).toContainText('ESH 2023');

  await page.getByRole('button', { name: /tabla de clasificación/i }).click();
  await expect(page.locator('[class*="tablaFuente"]')).toContainText(
    'Guías ESH 2023 para el manejo de la hipertensión arterial',
  );
});

test('MARCO LEGAL · aplica los cortes europeos (≥ 140/90), no los de la AHA (≥ 130/80)', async ({ page }) => {
  // La diferencia entre guías no es cosmética: la AHA/ACC 2017 llamaría hipertensión a
  // 132/82, la ESC/ESH lo llama normal-alta. La app cita la europea, así que debe aplicarla.
  await medir(page, '132', '82');
  await expect(categoria(page)).toHaveText('Normal-Alta');
  await expect(categoria(page)).not.toHaveText(/HTA Grado/);
});

// ─── REGRESIÓN · los hallazgos de la 1.ª pasada, reparados el 25/08/2026 ────────────────

test('REGRESIÓN 294 (CRÍTICO) · 175/55 es hipertensión sistólica aislada, no hipotensión', async ({ page }) => {
  await medir(page, '175', '55');

  // La propia app declara la fila «HTA Sistólica Aislada ≥ 140 / < 90» y describe este perfil
  // en su tarjeta «Persona mayor». 175 es sistólica de grado 2 (160-179), y el grado del
  // patrón aislado lo fija la sistólica, así que la urgencia tiene que ser la del grado 2.
  await expect(categoria(page)).toHaveText('HTA Sistólica Aislada (Grado 2)');
  await expect(categoria(page)).not.toContainText('Hipotensión');
  await expect(urgencia(page)).toContainText('Urgente');
});

test('REGRESIÓN 294b (CRÍTICO) · con diastólica < 60, la sistólica alta sigue mandando', async ({ page }) => {
  // Cada uno con el grado que le da su sistólica: 145 → grado 1; 160 y 179 → grado 2.
  const casos: Array<[string, string, string]> = [
    ['145', '58', 'HTA Sistólica Aislada (Grado 1)'],
    ['160', '55', 'HTA Sistólica Aislada (Grado 2)'],
    ['179', '59', 'HTA Sistólica Aislada (Grado 2)'],
  ];
  for (const [sis, dia, esperado] of casos) {
    await medir(page, sis, dia);
    await expect(categoria(page)).toHaveText(esperado);
  }
});

test('REGRESIÓN 294c (CRÍTICO) · una presión de pulso «Muy elevada» no puede rotularse hipotensión', async ({ page }) => {
  await medir(page, '175', '55');
  // La app calcula 175 − 55 = 120 mmHg y lo llama «Muy elevada (> 80 mmHg)» — signo de
  // rigidez arterial — mientras la cabecera decía «por debajo de los valores normales».
  await expect(derivadoNota(page, 1)).toHaveText('Muy elevada (> 80 mmHg)');
  await expect(recomendacion(page)).not.toContainText('mareos, cansancio o desmayos');
});

test('REGRESIÓN 294d · la hipotensión se sigue emitiendo cuando NADA está elevado', async ({ page }) => {
  // Mover la rama al final no puede haberla dejado inalcanzable: es el riesgo de la
  // reparación, y sin este caso el arreglo del crítico crearía un hueco silencioso.
  await medir(page, '85', '55');
  await expect(categoria(page)).toHaveText('Hipotensión');

  // Hipotensión diastólica aislada, con la sistólica todavía por debajo de lo normal.
  await medir(page, '110', '55');
  await expect(categoria(page)).toHaveText('Hipotensión');

  // Reescrito el 01/10/2026 (hallazgo 2563). Antes fijaba 125/58 como «Hipotensión»; pero la
  // hipotensión no es de la tabla ESH, y S 125 es «normal» en ella (manda la más alta). El
  // criterio propio de la app ya solo actúa dentro del tramo «óptima», que la ESH deja sin suelo:
  // nunca rebautiza una lectura que la guía citada clasifica.
  await medir(page, '125', '58');
  await expect(categoria(page)).toHaveText('Tensión Normal');

  // El límite: a partir de normal-alta ya manda lo elevado, no la diastólica baja.
  await medir(page, '135', '58');
  await expect(categoria(page)).toHaveText('Normal-Alta');
});

test('REGRESIÓN 295 (MEDIO) · la tabla visible usa el mismo corte de grado 3 que el código', async ({ page }) => {
  // Reescrito el 01/10/2026 (hallazgo 2562). El 295 era que la fila de crisis decía «> 180»
  // y el código aplicaba ≥. La fila de crisis ya no existe (no es de la ESH 2023); lo que se
  // vigila ahora es el techo de la tabla, el grado 3, contra el código.
  await page.getByRole('button', { name: /tabla de clasificación/i }).click();
  const tabla = page.locator('table[aria-label*="Clasificación"] tbody');
  await expect(tabla.locator('tr', { hasText: 'Crisis' })).toHaveCount(0);
  const filaG3 = tabla.locator('tr', { hasText: 'HTA Grado 3' });
  await expect(filaG3.locator('td').nth(1)).toHaveText('≥ 180');
  await expect(filaG3.locator('td').nth(2)).toHaveText('y/o ≥ 110');

  await expect(page.locator('[class*="tablaNotas"]')).toContainText('se superponen');
  await expect(page.locator('[class*="tablaNotas"]')).toContainText('manda la más alta');

  // Y el código da grado 3 en los dos bordes que la tabla anuncia.
  await medir(page, '180', '100');
  await expect(categoria(page)).toHaveText('HTA Grado 3');
  await medir(page, '150', '110');
  await expect(categoria(page)).toHaveText('HTA Grado 3');
});

test('REGRESIÓN 296 (MEDIO) · la app cita UNA sola versión de la guía en toda la página', async ({ page }) => {
  const html = await page.content();
  // La ESH 2023 es un documento real; «ESH/ESC 2023» no lo es (la conjunta fue la de 2018).
  expect(html).toContain('ESH 2023');
  expect(html).not.toContain('ESH/ESC 2018');
  expect(html).not.toContain('ESH/ESC 2023');
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN · 25/09/2026
// ═════════════════════════════════════════════════════════════════════════════════════════
/**
 * DE DÓNDE SALEN LOS CORTES DE ESTA TANDA
 *   ESH 2023, tabla de clasificación de la PA en consulta (citada literalmente por la sinopsis
 *   de la ERA, PMC11139525): óptima < 120 y < 80 · normal 120–129 y/o 80–84 · normal-alta
 *   130–139 y/o 85–89 · grado 1 140–159 y/o 90–99 · grado 2 160–179 y/o 100–109 · grado 3
 *   ≥ 180 y/o ≥ 110 · HTA sistólica aislada ≥ 140 y < 90 · HTA diastólica aislada < 140 y ≥ 90.
 *   Nota de la tabla: «la categoría la define el nivel MÁS ALTO, sistólico o diastólico», y la
 *   HTA sistólica/diastólica aislada se gradúa 1, 2 o 3 por el valor de la que está alta.
 *   Lo que NO sale de la ESH 2023 y la app declara como propio: la fila «Hipotensión < 90/60»
 *   y la «Crisis hipertensiva ≥ 180 y/o ≥ 120», que la app muestra por delante del grado 3
 *   (nota bajo su tabla). Los casos de crisis se juzgan contra esa regla declarada.
 *
 * TAM = D + (S − D)/3 redondeada (fórmula publicada por la app) · PP = S − D con los tramos
 * de `valorarPresionPulso` (< 25 muy baja · < 40 baja · 40–60 normal · ≤ 80 elevada · > 80
 * muy elevada).
 *
 * HALLAZGOS DE ESTA TANDA — los siete REPARADOS el mismo 25/09/2026 (Ronda 15), ids 1717-1723
 * (A=1717, B=1718, C=1719, D=1720, E=1721, F=1722, G=1723). Lo que decidió la reparación:
 *   A · se REDONDEA al mmHg entero (no se rechaza): la app pide «la media», y rechazarla
 *       empujaba a truncarla a mano. La vista dice qué se tecleó y con qué valor se clasificó.
 *   B · la categoría ya no se guarda: se deriva al pintar. Lo guardado ilegible (no numérico,
 *       fuera de rango, sistólica ≤ diastólica) sale «Lectura ilegible», sin color de categoría.
 *   C · el tope de 20 sigue, pero a la vista, y la lectura expulsada se nombra al salir.
 *   E · los --cl-* pasan a tonos 700 (≥ 4,9:1 con blanco) y la pastilla oscurece en vez de aclarar.
 *   F · la recomendación va pegada a la cabecera y se desplaza a la vista tras calcular.
 * Descripción original de cada hallazgo:
 *   A · decimales truncados hacia abajo: 179,67/100 (media de 179, 180 y 180, que es lo que
 *       la propia app pide introducir) sale «HTA Grado 2» en vez de crisis o de rechazo.
 *   B · el historial pinta la clasificación GUARDADA, no la recalcula: una 175/55 guardada
 *       antes del 25/08 sigue rotulada «Hipotensión» (el crítico 294 sobrevive en el historial).
 *   C · el tope de 20 lecturas descarta la más antigua en silencio (la sospecha de page.tsx
 *       ~225 y ~441, confirmada). No hay media ni tendencia sobre el historial.
 *   D · los botones «Eliminar» de dos lecturas del mismo día tienen el mismo nombre accesible.
 *   E · texto blanco sobre el color de categoría: la descripción del resultado de Normal-Alta
 *       queda a 2,72:1 (AA exige 4,5:1 a 15 px).
 *   F · en móvil, tras pulsar Calcular con una crisis, la instrucción del 112 queda fuera de
 *       la pantalla (≈ 580 px por debajo del botón) y la app no desplaza hasta ella.
 *   G · la tarjeta «Embarazada» define la preeclampsia solo por ≥ 140/90 tras la semana 20;
 *       la ESH 2023 exige además proteinuria u otra disfunción orgánica/uteroplacentaria.
 */

const CLAVE_HISTORIAL = 'meskeia-tension-historial';

interface LecturaGuardada {
  id: string;
  fecha: string;
  sistolica: number;
  diastolica: number;
  pulso: number | null;
  clasificacionId: string;
}

/** Como `medir`, pero esperando a que React haya recogido cada valor antes de pulsar. */
async function medirHidratado(page: Page, sistolica: string, diastolica: string, pulso = ''): Promise<void> {
  await esperarHidratacion(page, ['#sistolica', '#diastolica', '#pulso']);
  const campos: Array<[string, string]> = [['#sistolica', sistolica], ['#diastolica', diastolica], ['#pulso', pulso]];
  for (const [selector, valor] of campos) {
    await page.fill(selector, valor);
    await esperarValorEnReact(page, selector, valor);
  }
  await page.getByRole('button', { name: 'Calcular', exact: true }).click();
}

function filasHistorial(page: Page) {
  return page.locator('table[aria-label*="Historial"] tbody tr');
}

/** Siembra el historial ANTES de que la app arranque y recarga; espera a verlo en pantalla. */
async function abrirConHistorial(page: Page, lecturas: LecturaGuardada[]): Promise<void> {
  await page.addInitScript(
    ([clave, valor]) => {
      window.localStorage.setItem(clave, valor);
    },
    [CLAVE_HISTORIAL, JSON.stringify(lecturas)] as const,
  );
  await page.goto(RUTA);
  // La app lee el almacenamiento en un useEffect: hasta que las filas no están, no ha leído.
  await expect(filasHistorial(page)).toHaveCount(lecturas.length);
}

test.describe('Re-inspección 25/09/2026', () => {
  test('ESH 2023 · con sistólica y diastólica en categorías distintas manda la MÁS ALTA', async ({ page }) => {
    // [sistólica, diastólica, categoría, urgencia] — cada fila resuelta con la tabla ESH 2023
    const casos: Array<[string, string, string, string]> = [
      // Desde el 01/10/2026 (hallazgo 2562) la HTA diastólica aislada se NOMBRA, como la
      // sistólica; el grado y la urgencia no cambian. El nivel máximo se rotula «Muy urgente»
      // y no «Emergencia» (hallazgo 2564).
      ['128', '92', 'HTA Diastólica Aislada (Grado 1)', 'Alerta'],       // S normal (120–129), D grado 1
      ['112', '86', 'Normal-Alta', 'Atención'],     // S óptima, D normal-alta (85–89)
      ['105', '82', 'Tensión Normal', 'Normal'],    // S óptima, D normal (80–84)
      ['115', '104', 'HTA Diastólica Aislada (Grado 2)', 'Urgente'],     // D grado 2 (100–109)
      ['125', '112', 'HTA Diastólica Aislada (Grado 3)', 'Muy urgente'], // D grado 3 (≥ 110) con S normal
      ['139', '90', 'HTA Diastólica Aislada (Grado 1)', 'Alerta'],       // < 140 y ≥ 90 → grado 1
      ['159', '89', 'HTA Sistólica Aislada (Grado 1)', 'Alerta'],   // aislada, S 140–159
      ['160', '89', 'HTA Sistólica Aislada (Grado 2)', 'Urgente'],  // aislada, S 160–179
    ];
    for (const [sis, dia, esperada, urg] of casos) {
      await medirHidratado(page, sis, dia);
      await expect(categoria(page), `${sis}/${dia}`).toHaveText(esperada);
      await expect(urgencia(page), `${sis}/${dia}`).toContainText(urg);
    }
  });

  test('Límites altos · 179/109 grado 2; 179/110 y todo ≥ 180 o ≥ 110 grado 3, con la conducta por síntomas', async ({ page }) => {
    // Reescrito el 01/10/2026 (hallazgos 2562 y 2564). Antes fijaba ≥ 180 o ≥ 120 como «Crisis
    // Hipertensiva» con «Acude a urgencias inmediatamente o llama al 112» sin condición. La ESH
    // 2023 los llama grado 3 (185/55: sistólica aislada de grado 3), y la conducta es la de
    // CONDUCTA_GRADO_3, la misma para todo el grado 3.
    const conducta = `Recomendación: ${CONDUCTA_GRADO_3.conSintomas}${CONDUCTA_GRADO_3.sinSintomas}`;

    await medirHidratado(page, '179', '109');
    await expect(categoria(page)).toHaveText('HTA Grado 2');

    // D = 110 entra en grado 3 (≥ 110). TAM = 110 + 69/3 = 133.
    await medirHidratado(page, '179', '110');
    await expect(categoria(page)).toHaveText('HTA Grado 3');
    await expect(urgencia(page)).toContainText('Muy urgente');
    await expect(recomendacion(page)).toHaveText(conducta);
    await expect(derivadoValor(page, 0)).toContainText('133');

    const grado3: Array<[string, string, string]> = [
      ['180', '110', 'HTA Grado 3'],
      ['150', '120', 'HTA Grado 3'],                      // S grado 1, D grado 3; no aislada (S ≥ 140)
      ['185', '55', 'HTA Sistólica Aislada (Grado 3)'],   // antes inalcanzable
    ];
    for (const [sis, dia, esperada] of grado3) {
      await medirHidratado(page, sis, dia);
      await expect(categoria(page), `${sis}/${dia}`).toHaveText(esperada);
      await expect(recomendacion(page), `${sis}/${dia}`).toHaveText(conducta);
    }
    // 185/55: PP = 130 → «Muy elevada (> 80 mmHg)»; TAM = 55 + 130/3 = 98,33 → 98.
    await expect(derivadoValor(page, 0)).toContainText('98');
    await expect(derivadoNota(page, 1)).toHaveText('Muy elevada (> 80 mmHg)');
  });

  test('Lecturas normales · 118/76 óptima, 90/60 aún no es hipotensión, 88/62 sí', async ({ page }) => {
    // 118/76: TAM = 76 + 42/3 = 90 · PP = 42 → normal.
    await medirHidratado(page, '118', '76');
    await expect(categoria(page)).toHaveText('Tensión Óptima');
    await expect(derivadoValor(page, 0)).toContainText('90');
    await expect(derivadoNota(page, 1)).toHaveText('Normal (40–60 mmHg)');

    // La app declara hipotensión «< 90/60»: 90/60 queda fuera. TAM = 60 + 30/3 = 70 · PP 30.
    await medirHidratado(page, '90', '60');
    await expect(categoria(page)).toHaveText('Tensión Óptima');
    await expect(derivadoValor(page, 0)).toContainText('70');
    await expect(derivadoNota(page, 1)).toHaveText('Baja (< 40 mmHg)');

    await medirHidratado(page, '88', '62');
    await expect(categoria(page)).toHaveText('Hipotensión');
  });

  test('Rechazos · iguales, vacío, fuera de rango, pulso imposible y texto: sin resultado ni historial', async ({ page }) => {
    await medirHidratado(page, '120', '120');
    await expect(page.locator('#error-sis')).toHaveText('La sistólica debe ser mayor que la diastólica');

    await medirHidratado(page, '', '');
    await expect(page.locator('#error-sis')).toHaveText('Introduce la tensión sistólica');
    await expect(page.locator('#error-dia')).toHaveText('Introduce la tensión diastólica');

    await medirHidratado(page, '301', '80');
    await expect(page.locator('#error-sis')).toHaveText('Valor fuera de rango (50–300 mmHg)');

    await medirHidratado(page, '120', '29');
    await expect(page.locator('#error-dia')).toHaveText('Valor fuera de rango (30–200 mmHg)');

    await medirHidratado(page, '120', '80', '10');
    await expect(page.locator('#error-pulso')).toHaveText('Valor fuera de rango (20–300 ppm)');

    // Texto tecleado en la sistólica (con 80 en la diastólica): el navegador lo deja vacío y la
    // app lo pide. Venimos de un estado sin #error-sis, así que el aviso es de este paso.
    await expect(page.locator('#error-sis')).toHaveCount(0);
    for (const selector of ['#pulso', '#sistolica']) {
      await page.fill(selector, '');
      await esperarValorEnReact(page, selector, '');
    }
    await page.locator('#sistolica').pressSequentially('abc');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(page.locator('#error-sis')).toHaveText('Introduce la tensión sistólica');
    await expect(page.locator('#error-dia')).toHaveCount(0);

    await expect(categoria(page)).toHaveCount(0);
    await expect(page.locator('table[aria-label*="Historial"]')).toHaveCount(0);
  });

  test('Siembra · el historial guardado aparece en pantalla (control de los test.fail B y C)', async ({ page }) => {
    await abrirConHistorial(page, [
      { id: 'a', fecha: '2026-09-20T08:00:00.000Z', sistolica: 131, diastolica: 81, pulso: 70, clasificacionId: 'normal-alta' },
    ]);
    await expect(filasHistorial(page).first()).toContainText('131');
    await expect(filasHistorial(page).first()).toContainText('Normal-Alta');
  });

  // ─── Reparados el 25/09/2026 (Ronda 15): ya sin test.fail ──────────────────────────────

  // 1717 (A) — `parseInt` truncaba: 179,67 se quedaba en 179, siempre hacia la categoría menos
  // grave. La reparación REDONDEA al mmHg entero (la ESH fija sus cortes en enteros) y lo dice.
  // Se eligió redondear y no rechazar porque la propia app pide «la media de tus mediciones»:
  // rechazarla empujaba a truncarla a mano, que es el mismo error hecho por la persona.
  test('REPARADO 1717 · 179,67/100 se redondea a 180 → HTA Grado 3, y la app lo dice', async ({ page }) => {
    await medirHidratado(page, '179.67', '100');
    // Media de 179, 180 y 180 = 179,67 → 180 → grado 3 de la ESH (≥ 180). Hasta el 01/10/2026
    // la app lo rotulaba «Crisis Hipertensiva», categoría ajena a la ESH (hallazgo 2562).
    await expect(categoria(page)).toHaveText('HTA Grado 3');
    await expect(recomendacion(page)).toContainText('112');
    await expect(page.locator('[class*="metricaValor"]').first()).toContainText('180');
    await expect(page.locator('[class*="resultadoRedondeo"]')).toContainText('sistólica 179,67 → 180');
  });

  test('REPARADO 1717b · redondeo al entero más próximo, en los dos sentidos y en la diastólica', async ({ page }) => {
    // 139,5 → 140 → grado 1 (con truncado quedaba normal-alta). Con 85 de diastólica el
    // patrón es sistólico aislado, graduado por la sistólica.
    await medirHidratado(page, '139.5', '85');
    await expect(categoria(page)).toHaveText('HTA Sistólica Aislada (Grado 1)');
    // 129/89,5 → 129/90: HTA diastólica aislada → grado 1 (nombrada desde el 01/10, hallazgo 2562).
    await medirHidratado(page, '129', '89.5');
    await expect(categoria(page)).toHaveText('HTA Diastólica Aislada (Grado 1)');
    await expect(page.locator('[class*="resultadoRedondeo"]')).toContainText('diastólica 89,5 → 90');
    // 139,4 → 139: redondear no es subir siempre; sigue siendo normal-alta.
    await medirHidratado(page, '139.4', '85');
    await expect(categoria(page)).toHaveText('Normal-Alta');
    // Con enteros no aparece ninguna nota de redondeo.
    await medirHidratado(page, '135', '82');
    await expect(page.locator('[class*="resultadoRedondeo"]')).toHaveCount(0);
    // Y el historial guarda el valor con el que se clasificó.
    await expect(filasHistorial(page).nth(1)).toContainText('139');
    await expect(filasHistorial(page).nth(3)).toContainText('140');
  });

  // 1718 (B) — el historial pintaba `clasificacionId` tal cual se guardó. Ahora la categoría se
  // deriva de los valores al pintarla y ya no se guarda.
  test('REPARADO 1718 · una 175/55 guardada antes del 25/08 se rotula con la clasificación de hoy', async ({ page }) => {
    await abrirConHistorial(page, [
      // Exactamente lo que guardaba la versión anterior (git show 5a2b7f35: la hipotensión con OR).
      { id: 'v1', fecha: '2026-08-10T08:00:00.000Z', sistolica: 175, diastolica: 55, pulso: 68, clasificacionId: 'hipotension' },
    ]);
    await expect(filasHistorial(page).first()).toContainText('175');
    // La misma lectura introducida hoy sale «HTA Sistólica Aislada (Grado 2)» (REGRESIÓN 294).
    await expect(filasHistorial(page).first().locator('[class*="historialBadge"]')).toHaveText(
      'HTA Sistólica Aislada (Grado 2)',
    );
  });

  test('REPARADO 1718b · una lectura guardada ilegible no recibe una categoría inventada', async ({ page }) => {
    await page.addInitScript(
      ([clave, valor]) => {
        window.localStorage.setItem(clave, valor);
      },
      [
        CLAVE_HISTORIAL,
        JSON.stringify([
          // sistólica que no es un número, con una categoría guardada que NO debe pintarse
          { id: 'x1', fecha: '2026-09-01T08:00:00.000Z', sistolica: 'abc', diastolica: 80, pulso: null, clasificacionId: 'optima' },
          // sistólica ≤ diastólica: el formulario la rechazaría
          { id: 'x2', fecha: '2026-09-02T08:00:00.000Z', sistolica: 80, diastolica: 120, pulso: null, clasificacionId: 'normal' },
          // fuera del rango que admite el formulario
          { id: 'x3', fecha: 'no es fecha', sistolica: 400, diastolica: 80, pulso: null },
          // y una buena, para ver que las ilegibles no arrastran a las demás
          { id: 'x4', fecha: '2026-09-03T08:00:00.000Z', sistolica: 150, diastolica: 95, pulso: 70 },
        ]),
      ] as const,
    );
    await page.goto(RUTA);
    await expect(filasHistorial(page)).toHaveCount(4);
    for (const i of [0, 1, 2]) {
      await expect(filasHistorial(page).nth(i)).toContainText('Lectura ilegible');
      await expect(filasHistorial(page).nth(i).locator('[class*="historialBadge"]')).toHaveCount(0);
    }
    await expect(filasHistorial(page).nth(0)).toContainText('—');
    await expect(filasHistorial(page).nth(2)).toContainText('Fecha desconocida');
    await expect(filasHistorial(page).nth(3).locator('[class*="historialBadge"]')).toHaveText('HTA Grado 1');
    // Y se pueden borrar: el nombre accesible se construye aunque falte la fecha.
    await page.getByRole('button', { name: 'Eliminar medición 400/80 de fecha desconocida' }).click();
    await expect(filasHistorial(page)).toHaveCount(3);
  });

  // 1719 (C) — `[nueva, ...lista].slice(0, 20)`: la lectura 21 borraba la más antigua sin decirlo.
  test('REPARADO 1719 · el tope de 20 está a la vista y la lectura descartada se nombra', async ({ page }) => {
    const veinte: LecturaGuardada[] = Array.from({ length: 20 }, (_, i) => ({
      id: `s${i}`,
      // i = 0 → 20/09 (la más reciente, primera) … i = 19 → 01/09 (la más antigua, última)
      fecha: new Date(Date.UTC(2026, 8, 20 - i, 8, 0)).toISOString(),
      sistolica: i === 19 ? 131 : 122,
      diastolica: i === 19 ? 81 : 78,
      pulso: 70,
      clasificacionId: i === 19 ? 'normal-alta' : 'normal',
    }));
    await abrirConHistorial(page, veinte);
    await expect(filasHistorial(page).last()).toContainText('01/09/2026');
    // El tope se ve ANTES de perder nada.
    await expect(page.locator('[class*="historialTope"]')).toContainText('últimas 20 mediciones');

    await medirHidratado(page, '135', '82');
    await expect(categoria(page)).toHaveText('Normal-Alta');
    await expect(filasHistorial(page)).toHaveCount(20);
    // Y al perderla, se dice cuál: 131/81 del 01/09/2026.
    const aviso = page.locator('[class*="historialDescartada"]');
    await expect(aviso).toContainText('más antigua');
    await expect(aviso).toContainText('131/81 mmHg del 01/09/2026');
  });

  // 1720 (D) — aria-label «Eliminar medición del <fecha>», sin hora ni valores.
  test('REPARADO 1720 · dos lecturas del mismo día tienen botones «Eliminar» distinguibles', async ({ page }) => {
    await medirHidratado(page, '135', '82');
    await medirHidratado(page, '150', '95');
    await expect(filasHistorial(page)).toHaveCount(2);
    const nombres = await page
      .locator('table[aria-label*="Historial"] tbody button')
      .evaluateAll((botones) => botones.map((b) => b.getAttribute('aria-label')));
    expect(new Set(nombres).size).toBe(2);
    expect(nombres[0]).toMatch(/^Eliminar medición 150\/95 del \d{2}\/\d{2}\/\d{4} a las \d{2}:\d{2}$/);
  });

  // 1721 (E) — texto blanco sobre el color de categoría. Se mide TODO el texto blanco (pastilla
  // de urgencia, nombre, descripción) en las OCHO categorías, en claro y en oscuro, sobre el
  // fondo real compuesto (la pastilla lleva un velo semitransparente encima de la cabecera).
  test('REPARADO 1721 · la cabecera del resultado cumple AA (≥ 4,5:1) en todas las categorías y en los dos temas', async ({ page }) => {
    // Desde el 01/10/2026 (hallazgo 2562) no hay categoría «crisis»: son siete colores. La
    // octava fila es un grado 3 aislado, para que sigan saliendo 8 × 2 = 16 pastillas abajo.
    const casos: Array<[string, string, string]> = [
      ['85', '55', 'Hipotensión'],
      ['115', '75', 'Tensión Óptima'],
      ['125', '82', 'Tensión Normal'],
      ['135', '82', 'Normal-Alta'],
      ['150', '95', 'HTA Grado 1'],
      ['165', '102', 'HTA Grado 2'],
      ['175', '112', 'HTA Grado 3'],
      ['190', '85', 'HTA Sistólica Aislada (Grado 3)'],
    ];
    for (const tema of ['light', 'dark'] as const) {
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
      for (const [sis, dia, nombre] of casos) {
        await medirHidratado(page, sis, dia);
        await expect(categoria(page)).toHaveText(nombre);
        const ratios = await page.evaluate(() => {
          const canal = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
          const lin = (v: number) => {
            const x = v / 255;
            return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
          };
          const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
          const ratio = (a: number[], b: number[]) => {
            const [l1, l2] = [lum(a), lum(b)].sort((p, q) => q - p);
            return (l1 + 0.05) / (l2 + 0.05);
          };
          const sobre = (capa: number[], base: number[]) => {
            const alfa = capa.length > 3 ? capa[3] : 1;
            return base.slice(0, 3).map((v, i) => capa[i] * alfa + v * (1 - alfa));
          };
          const cab = document.querySelector('[class*="resultadoCabecera"]') as HTMLElement;
          const fondo = canal(getComputedStyle(cab).backgroundColor).slice(0, 3);
          const medir = (sel: string) => {
            const el = document.querySelector(sel) as HTMLElement;
            const cs = getComputedStyle(el);
            const bg = canal(cs.backgroundColor);
            const fondoReal = bg.length > 3 && bg[3] === 0 ? fondo : sobre(bg, fondo);
            const texto = sobre([...canal(cs.color).slice(0, 3), Number(cs.opacity)], fondoReal);
            return ratio(texto, fondoReal);
          };
          return {
            urgencia: medir('[class*="resultadoUrgencia"]'),
            nombre: medir('[class*="resultadoNombre"]'),
            descripcion: medir('[class*="resultadoDescripcion"]'),
          };
        });
        for (const [parte, r] of Object.entries(ratios)) {
          expect(r, `${tema} · ${nombre} · ${parte}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
    // Las pastillas del historial (12 px) usan el mismo color de fondo con texto blanco.
    const badges = await page.locator('[class*="historialBadge"]').evaluateAll((els) =>
      els.map((el) => {
        const canal = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
        const lin = (v: number) => {
          const x = v / 255;
          return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        };
        const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
        const cs = getComputedStyle(el);
        const [l1, l2] = [lum(canal(cs.color)), lum(canal(cs.backgroundColor))].sort((p, q) => q - p);
        return (l1 + 0.05) / (l2 + 0.05);
      }),
    );
    expect(badges.length).toBe(16);
    for (const r of badges) expect(r).toBeGreaterThanOrEqual(4.5);
  });

  // 1723 (G) — ESH 2023 (capítulo de embarazo, que adopta la definición ISSHP 2018): ≥ 140/90
  // tras la semana 20 es HTA gestacional; la preeclampsia añade proteinuria u otra disfunción
  // orgánica materna o uteroplacentaria.
  test('REPARADO 1723 · la tarjeta «Embarazada» no define la preeclampsia solo por la cifra', async ({ page }) => {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const tarjeta = page.locator('[class*="escenarioCard"]', { hasText: 'Embarazada' });
    await expect(tarjeta).toBeVisible();
    await expect(tarjeta).toContainText('hipertensión gestacional');
    await expect(tarjeta).toContainText(/proteinuria/);
    await expect(tarjeta).toContainText(/disfunción orgánica/);
  });

  test.describe('en móvil (Pixel 7)', () => {
    // Enumeradas: `...devices['Pixel 7']` trae defaultBrowserType, que no se admite en un describe.
    const PIXEL_7 = devices['Pixel 7'];
    test.use({
      viewport: PIXEL_7.viewport,
      userAgent: PIXEL_7.userAgent,
      deviceScaleFactor: PIXEL_7.deviceScaleFactor,
      isMobile: PIXEL_7.isMobile,
      hasTouch: PIXEL_7.hasTouch,
    });

    test('Móvil · 185/125 muestra la cabecera de grado 3 y la página no desborda en horizontal', async ({ page }) => {
      await medirHidratado(page, '185', '125');
      // «HTA Grado 3» y «Muy urgente» desde el 01/10/2026 (hallazgos 2562 y 2564).
      await expect(categoria(page)).toHaveText('HTA Grado 3');
      await expect(urgencia(page)).toContainText('Muy urgente');
      await expect(categoria(page)).toBeInViewport();
      const desborde = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(desborde).toBe(0);
    });

    // 1722 (F) — la recomendación (la única frase que dice QUÉ hacer) iba detrás de las métricas
    // y los derivados. Reparado: va pegada a la cabecera y la app la desplaza a la vista.
    test('REPARADO 1722 · tras pulsar Calcular con una crisis, la instrucción del 112 está a la vista', async ({ page }) => {
      await medirHidratado(page, '185', '125');
      await expect(recomendacion(page)).toContainText('112');
      await expect(recomendacion(page)).toBeInViewport();
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN · 01/10/2026
// ═════════════════════════════════════════════════════════════════════════════════════════
/**
 * Cambios desde la anterior: f51cfe8d (25/09, redondeo, historial recalculado y contraste) y dos
 * lotes de catálogo sobre el hero, d056b066 (27/09, el logo tapaba el título en móvil) y
 * a1d72a9c (28/09, ídem en tableta de 769 a 1.023 px).
 *
 * LA GUÍA QUE LA APP CITA, Y SU TABLA — ESH 2023, clasificación de la PA en consulta, tal como
 * la reproduce «from [1], with permission» la sinopsis de la ERA (PMC11139525, leída el
 * 01/10/2026): óptima < 120 y < 80 · normal 120–129 / 80–84 · normal-alta 130–139 y/o 85–89 ·
 * grado 1 140–159 y/o 90–99 · grado 2 160–179 y/o 100–109 · grado 3 ≥ 180 y/o ≥ 110 · HTA
 * sistólica aislada ≥ 140 y < 90 · HTA diastólica aislada < 140 y ≥ 90 (las dos aisladas se
 * gradúan 1, 2 o 3 por el valor que está alto). «The BP category is defined by the highest level
 * of BP, whether systolic or diastolic.» En esa tabla NO hay «hipotensión» ni «crisis
 * hipertensiva»: las dos filas son de la app, aunque su tabla las rotule «Fuente: Guías ESH 2023».
 *
 * LOS CASOS DE ESTA TANDA, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   Normal — 124/83, pulso 66: S y D normales → «Tensión Normal». TAM = 83 + 41/3 = 96,67 → 97 ·
 *     PP = 41 → «Normal (40–60 mmHg)».
 *   Límites con S y D en categorías distintas —
 *     130/79 → S normal-alta (borde inclusivo), D óptima → «Normal-Alta». TAM = 79 + 51/3 = 96.
 *     119/85 → S óptima, D normal-alta (borde 85) → «Normal-Alta». TAM = 85 + 34/3 = 96,33 → 96 ·
 *       PP 34 → «Baja (< 40 mmHg)».
 *     159/100 → S grado 1 (borde alto), D grado 2 (borde bajo) → «HTA Grado 2», «Urgente»; no es
 *       aislada porque D ≥ 90. TAM = 100 + 59/3 = 119,67 → 120 · PP 59 → normal.
 *     129,5/84,4 → redondeo 130/84 → «Normal-Alta», con la nota de los dos redondeos.
 *   Rechazos — 90/110 (D > S) · S vacía con D 80 · 100,4/100 (redondea a 100/100) · 300,6/80
 *     (redondea a 301, fuera de 50–300): aviso y ningún resultado.
 *
 * LA SOSPECHA DE LA BARRA FIJA (SOSPECHAS.md, 30/09/2026) — DESCARTADA EN ESTA APP
 *   El único desplazamiento es `scrollIntoView({ block: 'nearest' })` sobre la recomendación, y
 *   la recomendación nace siempre POR DEBAJO del botón que la dispara: con `nearest` el navegador
 *   alinea su borde INFERIOR con el de la pantalla, nunca el superior con la barra. Medido con el
 *   botón pegado al pie de la pantalla (el peor caso, el que obliga a desplazar) en 390×664,
 *   390×844, 800×1.100, 800×600, 844×390 y 1.280×800, con y sin movimiento reducido: la cabecera
 *   del resultado queda a ≥ 161 px por debajo de la barra (apaisado 844×390: h2 en 238 px,
 *   barra hasta 77). Los dos tests de abajo lo fijan a 390 y a 800 px.
 *
 * HALLAZGOS DE ESTA TANDA — cinco (ids 2562-2566), REPARADOS el 01/10/2026. Lo que decidió la
 * reparación:
 *   2562 · la categoría es la de la tabla ESH 2023, sin añadidos: grado 3 ≥ 180 y/o ≥ 110, y las
 *          dos aisladas (sistólica y diastólica) nombradas y graduadas por la cifra alta. La
 *          «crisis hipertensiva» desaparece como categoría: el documento de posición de la ESC
 *          Council on Hypertension (van den Born et al., Eur Heart J Cardiovasc Pharmacother
 *          2019;5:37-46, publicado por la ESH) define la emergencia por el daño agudo de órgano,
 *          no por la cifra, y da el término «hypertensive crisis» por obsoleto. Lo que la app
 *          añade al grado 3 es la CONDUCTA, declarada aparte y con esa fuente.
 *   2563 · la hipotensión (< 90/60, umbral habitual; NHS) sigue, declarada criterio propio fuera
 *          de la tabla, pero solo dentro del tramo «óptima», que la ESH deja sin suelo. Se eligió
 *          así y no sacarla del todo porque 85/55 rotulado «Tensión Óptima · Excelente» sería
 *          tranquilizar a quien puede necesitar consultar; y no se dejó como estaba porque
 *          rebautizaba lecturas que la guía citada clasifica (125/58 es «normal»).
 *   2564 · una sola conducta para el grado 3, en el motor (CONDUCTA_GRADO_3), que pintan el
 *          resultado, la FAQ visible y el FAQPage: con síntomas de alarma (los «emergency
 *          symptoms» de van den Born 2019) 112; sin ellos, repetir en reposo y médico en el día.
 *          El rótulo de urgencia pasa de «Emergencia» a «Muy urgente»: sin síntomas no lo es.
 *   2565 · TAM normal «entre 70 y 100 mmHg» en los dos sitios. Se eligió 100 y no 105 porque es
 *          lo que dice la propia tabla de la app (TAM normal 93–99, normal-alta desde 100); el
 *          techo varía entre fuentes y la página lo dice.
 *   2566 · una entrada rechazada pone el resultado a null: no queda tarjeta ni la región
 *          role=status anuncia la lectura vieja.
 * Tests anteriores reescritos por consagrar el criterio viejo (no borrados): CASO 2c, CASO 3,
 * CASO 4, REGRESIÓN 294d, REGRESIÓN 295, la tabla ESH del 25/09, «Límites altos», REPARADO
 * 1717, 1717b y 1721, y los dos de móvil. Cada uno dice qué fijaba y por qué cambió.
 */
test.describe('Re-inspección 01/10/2026', () => {
  test('Normal · 124/83 con pulso 66 es «Tensión Normal», TAM 97 y presión de pulso 41', async ({ page }) => {
    await medirHidratado(page, '124', '83', '66');
    // S 124 (120–129) y D 83 (80–84): las dos en «normal» de la ESH 2023.
    await expect(categoria(page)).toHaveText('Tensión Normal');
    await expect(urgencia(page)).toContainText('Normal');
    await expect(recomendacion(page)).toHaveText(
      'Recomendación: Bien. Continúa con hábitos saludables y revisiones periódicas.',
    );
    // TAM = 83 + (124 − 83)/3 = 96,67 → 97 · PP = 124 − 83 = 41
    await expect(derivadoValor(page, 0)).toHaveText('97 mmHg');
    await expect(derivadoValor(page, 1)).toHaveText('41 mmHg');
    await expect(derivadoNota(page, 1)).toHaveText('Normal (40–60 mmHg)');
    await expect(page.locator('[class*="metricaValor"]').nth(2)).toHaveText('66ppm');
    await expect(page.locator('[class*="resultadoRedondeo"]')).toHaveCount(0);
  });

  test('Límites · con S y D en categorías distintas y justo en el borde, manda la más alta', async ({ page }) => {
    // [S, D, categoría, TAM, PP, valoración de la PP] — resueltos con la tabla ESH 2023
    const casos: Array<[string, string, string, string, string, string]> = [
      ['130', '79', 'Normal-Alta', '96 mmHg', '51 mmHg', 'Normal (40–60 mmHg)'],  // S 130 borde inclusivo
      ['119', '85', 'Normal-Alta', '96 mmHg', '34 mmHg', 'Baja (< 40 mmHg)'],     // D 85 borde inclusivo
      ['159', '100', 'HTA Grado 2', '120 mmHg', '59 mmHg', 'Normal (40–60 mmHg)'], // S G1 tope, D G2 suelo
    ];
    for (const [sis, dia, esperada, tam, pp, nota] of casos) {
      await medirHidratado(page, sis, dia);
      await expect(categoria(page), `${sis}/${dia}`).toHaveText(esperada);
      await expect(derivadoValor(page, 0), `${sis}/${dia}`).toHaveText(tam);
      await expect(derivadoValor(page, 1), `${sis}/${dia}`).toHaveText(pp);
      await expect(derivadoNota(page, 1), `${sis}/${dia}`).toHaveText(nota);
    }
    // 159/100 no es «aislada»: D ≥ 90. La urgencia es la del grado 2.
    await expect(urgencia(page)).toContainText('Urgente');

    // Decimales justo en el borde: 129,5 → 130 (normal-alta) y 84,4 → 84 (normal).
    await medirHidratado(page, '129.5', '84.4');
    await expect(categoria(page)).toHaveText('Normal-Alta');
    await expect(page.locator('[class*="resultadoRedondeo"]')).toContainText(
      'sistólica 129,5 → 130 · diastólica 84,4 → 84',
    );
  });

  test('Rechazos · D > S, sistólica vacía y redondeos que salen de la regla: aviso y ningún resultado', async ({ page }) => {
    await medirHidratado(page, '90', '110');
    await expect(page.locator('#error-sis')).toHaveText('La sistólica debe ser mayor que la diastólica');

    await medirHidratado(page, '', '80');
    await expect(page.locator('#error-sis')).toHaveText('Introduce la tensión sistólica');
    await expect(page.locator('#error-dia')).toHaveCount(0);

    // 100,4 se clasifica como 100 (cortes enteros): 100/100 no es una lectura.
    await medirHidratado(page, '100.4', '100');
    await expect(page.locator('#error-sis')).toHaveText('La sistólica debe ser mayor que la diastólica');

    // 300,6 redondea a 301, fuera de 50–300.
    await medirHidratado(page, '300.6', '80');
    await expect(page.locator('#error-sis')).toHaveText('Valor fuera de rango (50–300 mmHg)');

    await expect(categoria(page)).toHaveCount(0);
    await expect(page.locator('table[aria-label*="Historial"]')).toHaveCount(0);
  });

  test('Hero · a 1.280 px el logo y el botón de tema no tocan el <h1>', async ({ page }) => {
    await esperarHidratacion(page, ['#sistolica']);
    await expect(page.locator('[class*="themeToggle"]')).toBeVisible();
    expect(await tituloTapado(page)).toBe(false);
  });

  // ─── Hallazgos de esta tanda: REPARADOS el 01/10/2026 ────────────────────────────────────

  // REPARADO (01/10/2026), hallazgo 2562: «Crisis Hipertensiva ≥ 180 y/o ≥ 120» no es una
  // categoría de la ESH 2023 y desplazaba al grado 3 que esa guía da a toda sistólica ≥ 180 con
  // diastólica < 120 (y dejaba inalcanzable «HTA Sistólica Aislada (Grado 3)»).
  test('REPARADO (01/10/2026) 2562 · 185/100 y 190/85 son grado 3 en la ESH 2023 que la app cita, no «Crisis Hipertensiva»', async ({ page }) => {
    // S 185 → grado 3 (≥ 180); D 100 → grado 2. Manda la más alta: HTA Grado 3.
    await medirHidratado(page, '185', '100');
    await expect(categoria(page)).toHaveText('HTA Grado 3');
    // S 190 con D 85 (< 90): HTA sistólica aislada, graduada por la sistólica → grado 3.
    await medirHidratado(page, '190', '85');
    await expect(categoria(page)).toHaveText('HTA Sistólica Aislada (Grado 3)');
    // La fila ESH «HTA diastólica aislada» (< 140 y ≥ 90) se nombra: 135/105 → grado 2 por la D.
    await medirHidratado(page, '135', '105');
    await expect(categoria(page)).toHaveText('HTA Diastólica Aislada (Grado 2)');
    await expect(urgencia(page)).toContainText('Urgente');

    // La tabla rotulada «ESH 2023» solo tiene filas ESH, incluida la diastólica aislada; lo que
    // la app añade va fuera, con su fuente.
    await page.getByRole('button', { name: /tabla de clasificación/i }).click();
    const filas = page.locator('table[aria-label*="Clasificación"] tbody tr');
    await expect(filas).toHaveCount(8);
    await expect(filas.filter({ hasText: /Crisis|Hipotensión/ })).toHaveCount(0);
    await expect(filas.filter({ hasText: 'HTA Diastólica Aislada' })).toHaveCount(1);
    const propios = page.locator('[class*="criteriosPropios"]').first();
    await expect(propios).toContainText('Fuera de la tabla ESH');
    await expect(propios).toContainText('van den Born');
  });

  // REPARADO (01/10/2026), hallazgo 2563: la fila «Hipotensión < 90/60» no está en la tabla ESH
  // 2023 y, como la app la evaluaba antes que «normal», rotulaba hipotensión lecturas que esa guía
  // llama normales. Ahora es criterio propio declarado, y solo dentro del tramo «óptima».
  test('REPARADO (01/10/2026) 2563 · 125/58 es «Tensión Normal» en la tabla ESH 2023, no «Hipotensión»', async ({ page }) => {
    // S 125 → normal (120–129); D 58 → óptima (< 80). Manda la más alta: normal.
    await medirHidratado(page, '125', '58');
    await expect(categoria(page)).toHaveText('Tensión Normal');

    // Donde sigue saliendo (tramo «óptima» de la ESH), el resultado dice que es criterio propio.
    await medirHidratado(page, '85', '55');
    await expect(categoria(page)).toHaveText('Hipotensión');
    await expect(page.locator('[class*="resultadoCriterio"]')).toContainText('fuera de la tabla ESH 2023');
    await expect(page.locator('[class*="resultadoCriterio"]')).toContainText('NHS');
  });

  // REPARADO (01/10/2026), hallazgo 2564: ante una lectura muy elevada el resultado mandaba «a
  // urgencias inmediatamente o al 112» sin condición, la FAQ visible decía que sin síntomas se
  // repite tras 15-30 min de reposo y el FAQPage, que sin síntomas se llama al médico en el día.
  // Ahora las tres pintan CONDUCTA_GRADO_3 del motor (fuente: van den Born et al., 2019).
  test('REPARADO (01/10/2026) 2564 · la conducta ante una lectura de grado 3 es la misma en el resultado, la FAQ y el FAQPage', async ({ page }) => {
    await medirHidratado(page, '185', '125');
    await expect(categoria(page)).toHaveText('HTA Grado 3');
    const textoRecomendacion = (await recomendacion(page).textContent()) ?? '';
    const textoFaq = (await page.locator('[class*="faqItem"]', { hasText: '¿Cuándo debo ir a urgencias' }).textContent()) ?? '';
    const textoLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    // La comprobación neutra del acta: si las otras separan por síntomas, el resultado también.
    const otrasDistinguenSinSintomas = /sin síntomas|ninguno de esos síntomas/i.test(textoFaq + textoLd);
    expect(
      otrasDistinguenSinSintomas && !/síntomas/i.test(textoRecomendacion),
      'la FAQ y el FAQPage separan «con síntomas» de «sin síntomas»; la recomendación del resultado no',
    ).toBe(false);
    // Y la fuerte: las dos ramas, literales, en los tres sitios.
    for (const rama of [CONDUCTA_GRADO_3.conSintomas, CONDUCTA_GRADO_3.sinSintomas]) {
      expect(textoRecomendacion, 'resultado').toContain(rama);
      expect(textoFaq, 'FAQ visible').toContain(rama);
      expect(textoLd, 'FAQPage').toContain(rama);
    }
    // Ninguna versión vieja sobrevive: ni el 112 incondicional ni la espera de 15-30 minutos.
    expect(textoFaq + textoLd).not.toContain('15-30 minutos');
    expect(textoRecomendacion).not.toContain('Acude a urgencias inmediatamente');
    // El rótulo no llama «Emergencia» a lo que sin síntomas no lo es.
    await expect(urgencia(page)).toContainText('Muy urgente');
    // Y el aviso médico (no colapsable) dice lo mismo: 112 con síntomas, médico ese día sin ellos.
    const aviso = page.locator('[class*="disclaimerCard"]').first();
    await expect(aviso).toContainText('112');
    await expect(aviso).toContainText('ese mismo día');
  });

  // REPARADO (01/10/2026), hallazgo 2565: el FAQPage (lo que leen buscadores e IAs) daba la TAM
  // normal entre 70 y 100 mmHg y la página, en su FAQ y en su sección «¿Qué es la TAM?», entre
  // 70 y 105. Ahora 70–100 en todos (coherente con la columna de TAM de la propia tabla).
  test('REPARADO (01/10/2026) 2565 · el rango normal de la TAM es el mismo en el FAQPage y en la página', async ({ page }) => {
    const textoLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    const textoFaq = (await page.locator('[class*="faqItem"]', { hasText: '¿Qué es la TAM' }).textContent()) ?? '';
    const enLd = textoLd.match(/TAM[^"]*?entre (\d+) y (\d+) mmHg/)?.slice(1);
    const enPagina = textoFaq.match(/entre (\d+) y (\d+) mmHg/)?.slice(1);
    // Hoy: página 70–105, FAQPage 70–100. Vale cualquiera de los dos, pero el mismo en ambos.
    expect(enPagina, 'la FAQ visible da un rango normal de TAM').toBeTruthy();
    expect(enLd, 'el FAQPage da un rango normal de TAM').toBeTruthy();
    expect(enLd).toEqual(enPagina);
    // También la sección «¿Qué es la Tensión Arterial Media (TAM)?», fuera de la FAQ.
    expect(await page.content()).not.toContain('entre 70 y 105');
  });

  // REPARADO (01/10/2026), hallazgo 2566: una entrada rechazada dejaba en pantalla la
  // clasificación de la lectura ANTERIOR. Con 190 tecleado en la sistólica y la diastólica mal
  // escrita, debajo seguía «Tensión Normal · Bien. Continúa con hábitos saludables».
  test('REPARADO (01/10/2026) 2566 · tras una entrada rechazada no queda a la vista la clasificación de la lectura anterior', async ({ page }) => {
    await medirHidratado(page, '124', '83');
    await expect(categoria(page)).toHaveText('Tensión Normal');
    await medirHidratado(page, '190', '1200');
    await expect(page.locator('#error-dia')).toHaveText('Valor fuera de rango (30–200 mmHg)');
    // Lo rechazado no se clasifica, y lo que se ve debajo no puede ser la respuesta a otra lectura.
    await expect(categoria(page)).toHaveCount(0);
    await expect(recomendacion(page)).toHaveCount(0);
    // La región que anuncia el resultado queda vacía: el lector de pantalla oye solo el aviso.
    await expect(page.locator('div[role="status"][aria-atomic="true"]')).toHaveText('');
    // Y una lectura válida después vuelve a clasificarse.
    await medirHidratado(page, '150', '95');
    await expect(categoria(page)).toHaveText('HTA Grado 1');
  });

  test.describe('en móvil de 390 px (iPhone 13)', () => {
    const IPHONE_13 = devices['iPhone 13'];
    test.use({
      viewport: IPHONE_13.viewport, // 390 × 664
      userAgent: IPHONE_13.userAgent,
      deviceScaleFactor: IPHONE_13.deviceScaleFactor,
      isMobile: IPHONE_13.isMobile,
      hasTouch: IPHONE_13.hasTouch,
    });

    test('Hero · a 390 px el logo y el botón de tema no tocan el <h1> (d056b066)', async ({ page }) => {
      await esperarHidratacion(page, ['#sistolica']);
      await expect(page.locator('[class*="themeToggle"]')).toBeVisible();
      expect(await tituloTapado(page)).toBe(false);
    });

    test('Barra fija · con el botón al pie, tras Calcular la cabecera y la recomendación quedan bajo la barra, no debajo de ella', async ({ page }) => {
      await calcularConBotonAlPie(page, '185', '125');
      await comprobarResultadoLibreDeBarra(page);
    });
  });

  test.describe('en tableta de 800 px', () => {
    test.use({
      viewport: { width: 800, height: 1100 },
      userAgent: devices['iPad Mini'].userAgent,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    test('Hero · a 800 px el logo y el botón de tema no tocan el <h1> (a1d72a9c)', async ({ page }) => {
      await esperarHidratacion(page, ['#sistolica']);
      await expect(page.locator('[class*="themeToggle"]')).toBeVisible();
      expect(await tituloTapado(page)).toBe(false);
    });

    test('Barra fija · con el botón al pie, tras Calcular la cabecera y la recomendación quedan bajo la barra, no debajo de ella', async ({ page }) => {
      await calcularConBotonAlPie(page, '185', '125');
      await comprobarResultadoLibreDeBarra(page);
    });
  });
});

/**
 * ¿Algún renglón del <h1> se cruza con la píldora del logo o con el botón de tema? Son las dos
 * piezas opacas de la barra fija de MeskeiaLogo; el resto de la barra es transparente.
 */
async function tituloTapado(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const barra = document.querySelector('[class*="headerBar"]');
    const piezas = [
      barra?.querySelector('[class*="logoContainer"]')?.getBoundingClientRect(),
      barra?.querySelector('[class*="themeToggle"]')?.getBoundingClientRect(),
    ];
    const h1 = document.querySelector('h1');
    if (!h1 || piezas.some((p) => !p)) throw new Error('Falta el <h1> o una pieza de la barra fija');
    const rango = document.createRange();
    rango.selectNodeContents(h1);
    return Array.from(rango.getClientRects()).some((l) =>
      piezas.some((p) => p && !(l.right <= p.left || p.right <= l.left || l.bottom <= p.top || p.bottom <= l.top)),
    );
  });
}

/**
 * El peor caso del `scrollIntoView`: el botón «Calcular» pegado al pie de la pantalla, de modo que
 * el resultado nace entero bajo el pliegue y la app TIENE que desplazar. Espera a que el
 * desplazamiento (suave) termine.
 */
async function calcularConBotonAlPie(page: Page, sistolica: string, diastolica: string): Promise<void> {
  await esperarHidratacion(page, ['#sistolica', '#diastolica']);
  for (const [selector, valor] of [['#sistolica', sistolica], ['#diastolica', diastolica]] as const) {
    await page.fill(selector, valor);
    await esperarValorEnReact(page, selector, valor);
  }
  await page.evaluate(() => {
    const boton = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Calcular');
    if (!boton) throw new Error('No está el botón «Calcular»');
    const r = boton.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + r.bottom - window.innerHeight + 4, behavior: 'instant' });
  });
  const antes = await page.evaluate(() => window.scrollY);
  await page.getByRole('button', { name: 'Calcular', exact: true }).click();
  // 185/125 es grado 3 de la ESH desde el 01/10/2026 (antes «Crisis Hipertensiva», hallazgo 2562).
  await expect(categoria(page)).toHaveText('HTA Grado 3');
  await page.evaluate(
    () =>
      new Promise<void>((resolver) => {
        let ultimo = window.scrollY;
        let quietos = 0;
        const paso = (): void => {
          if (window.scrollY === ultimo) quietos += 1;
          else {
            quietos = 0;
            ultimo = window.scrollY;
          }
          if (quietos >= 12) resolver();
          else requestAnimationFrame(paso);
        };
        requestAnimationFrame(paso);
      }),
  );
  // Control: la app ha desplazado de verdad (si no, el caso no mediría la barra).
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(antes);
}

/** La cabecera del resultado (h2) y la recomendación empiezan por debajo de la barra y caben en pantalla. */
async function comprobarResultadoLibreDeBarra(page: Page): Promise<void> {
  const m = await page.evaluate(() => {
    const barra = document.querySelector('[class*="headerBar"]');
    const pill = barra?.querySelector('[class*="logoContainer"]')?.getBoundingClientRect();
    const tema = barra?.querySelector('[class*="themeToggle"]')?.getBoundingClientRect();
    const h2 = document.querySelector('[class*="resultadoNombre"]')?.getBoundingClientRect();
    const rec = document.querySelector('[class*="resultadoRecomendacion"]')?.getBoundingClientRect();
    if (!pill || !tema || !h2 || !rec) throw new Error('Falta la barra fija o el resultado');
    return {
      finBarra: Math.max(pill.bottom, tema.bottom),
      h2Arriba: h2.top,
      recArriba: rec.top,
      recAbajo: rec.bottom,
      alto: window.innerHeight,
    };
  });
  expect(m.h2Arriba, 'el nombre de la categoría empieza bajo la barra fija').toBeGreaterThanOrEqual(m.finBarra);
  expect(m.recArriba, 'la recomendación empieza bajo la barra fija').toBeGreaterThanOrEqual(m.finBarra);
  expect(m.recAbajo, 'la recomendación cabe en pantalla').toBeLessThanOrEqual(m.alto + 1);
}
