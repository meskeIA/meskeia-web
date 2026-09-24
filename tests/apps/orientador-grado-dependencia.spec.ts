import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * orientador-grado-dependencia — la escala propia frente al BVD del RD 174/2011
 * Generado por /inspector el 24/09/2026.
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * «Cuestionario orientativo para estimar el grado de dependencia (I, II o III) según el Baremo
 * de Valoración de la Dependencia». Suma unos pesos propios (0-49 puntos, 16 casillas) y corta
 * en ≤4 autonomía · ≤12 Grado I · ≤22 Grado II · resto Grado III. El texto del resultado dice
 * «Según el baremo BVD…» y «Corresponde orientativamente al Grado X del BVD».
 *
 * LA NORMA (RD 174/2011, anexo I, BOE-A-2011-3174, consultado en sesión el 24/09/2026)
 * ─────────────────────────────────────────────────────────────────────────────────────
 *   · Escala: 0-24 sin grado · 25-49 Grado I · 50-74 Grado II · 75-100 Grado III
 *     (los mismos cortes que GRADOS_DEPENDENCIA en data/fiscal/dependencia.ts).
 *   · Puntuación = Σ (peso de la tarea en su actividad × peso de la actividad) × coeficiente de
 *     apoyo, redondeada al entero. Coeficientes (anexo C): supervisión 0,90 · física parcial
 *     0,90 · sustitución máxima 0,95 · apoyo especial 1,00.
 *   · Pesos de actividad, escala general, 18 años y más (anexo A): comer y beber 16,8 · higiene
 *     de micción y defecación 14,8 · lavarse 8,8 · otros cuidados corporales 2,9 · vestirse 11,9
 *     · mantenimiento de la salud 2,9 · cambiar y mantener la posición 9,4 · desplazarse dentro
 *     del hogar 12,3 · fuera del hogar 12,2 · tareas domésticas 8,0 (suman 100).
 *     La escala específica (anexo B, deterioro mental) no aplica a los perfiles de abajo, que
 *     son de personas lúcidas; y en esas actividades pesa menos, así que no cambia ninguna cota.
 *
 * Como una actividad no puede aportar más que su peso × 1,00, todo lo que la persona haga sola
 * pone un TECHO a la puntuación BVD que no depende de cómo se interprete cada casilla.
 */

const RUTA = '/orientador-grado-dependencia/';

const CASILLA = {
  comer1: 'Necesita que otra persona le prepare o le corte los alimentos antes de comer',
  comer2: 'Necesita ayuda física directa para llevarse la comida a la boca o beber',
  aseo1: 'Necesita supervisión o indicaciones para ducharse o bañarse de forma segura',
  aseo2: 'Necesita ayuda física parcial o total para el aseo (ducha, lavarse, afeitarse)',
  vestir1: 'Necesita supervisión o ayuda parcial para elegir y ponerse la ropa',
  vestir2: 'Necesita ayuda física total o casi total para vestirse y desvestirse',
  contin2: 'Presenta incontinencia habitual que requiere ayuda para el cambio de absorbentes o cuidado',
  medic1: 'Necesita que otra persona le prepare y/o administre la medicación',
  hogar1: 'No puede realizar tareas básicas del hogar (cocinar, limpiar, comprar) y necesita que otro las haga',
} as const;

type Clave = keyof typeof CASILLA;

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[type="checkbox"]']);
}

async function marcarYEstimar(page: Page, claves: readonly Clave[]): Promise<void> {
  for (const c of claves) await page.getByRole('checkbox', { name: CASILLA[c] }).check();
  // Nombre accesible actual del botón (su aria-label). Ver el caso de accesibilidad de abajo.
  await page.getByRole('button', { name: 'Estimar grado de dependencia' }).click();
}

/** La caja del resultado de la app (role="status"), no el anunciador de rutas de Next. */
function resultado(page: Page): Locator {
  return page.locator('[role="status"]').filter({ hasText: /Grado|autonomía/ });
}

test.describe('orientador-grado-dependencia', () => {
  test('monta el aviso legal y un disclaimer crítico visible fuera del bloque educativo', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('link', { name: /Términos/ }).first()).toBeVisible();
    // Severidad critical → DisclaimerCard se pinta con role="alert"; se acota por su texto.
    const aviso = page.getByRole('alert').filter({ hasText: 'SOLO indicativo' });
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('solo puede determinarlo un técnico');
  });

  /*
   * CASO NORMAL — persona lúcida que camina, se levanta y se desplaza sola, pero necesita apoyo
   * de otra persona (como mínimo supervisión, como máximo apoyo especial) en TODAS las tareas de
   * comer y beber, higiene de micción/defecación, lavarse, otros cuidados corporales, vestirse,
   * mantenimiento de la salud y tareas domésticas.
   *
   *   Pesos implicados: 16,8 + 14,8 + 8,8 + 2,9 + 11,9 + 2,9 + 8,0 = 66,1
   *   Suelo: 66,1 × 0,90 = 59,49 → 59     Techo: 66,1 × 1,00 = 66,1 → 66
   *   BVD ∈ [59, 66] → Grado II (50-74), con independencia del tipo de apoyo.
   *
   * La app suma 2+4 (comer) + 2+4 (aseo) + 2+4 (vestir) + 4 (incontinencia habitual)
   * + 2 (medicación) + 2 (hogar) = 26 > 22 y responde «Posible Grado III — Gran Dependencia…
   * requiere presencia y/o supervisión continua». HALLAZGO del 24/09/2026: marcado como fallo
   * esperado; se pondrá verde (y habrá que quitar test.fail) cuando la escala respete el BVD.
   */
  test('perfil de autocuidado sin problemas de movilidad → Grado II (BVD 59-66)', async ({ page }) => {
    test.fail(true, 'Hallazgo 24/09/2026: la app da Grado III con 26 de sus puntos; el BVD no pasa de 66.');
    await abrir(page);
    await marcarYEstimar(page, ['comer1', 'comer2', 'aseo1', 'aseo2', 'vestir1', 'vestir2', 'contin2', 'medic1', 'hogar1']);
    await expect(resultado(page)).toContainText('Posible Grado II — Dependencia Severa');
  });

  /*
   * CASO LÍMITE 24/25 — persona lúcida que no puede de ningún modo (sustitución máxima, 0,95)
   * realizar ninguna tarea de comer y beber ni de tareas domésticas, y hace sola todo lo demás.
   *
   *   (16,8 + 8,0) × 0,95 = 23,56 → 24 puntos → «sin grado reconocido» (0-24)
   *   (Solo con apoyo especial, 1,00, llegaría a 24,8 → 25, Grado I: el umbral exacto.)
   *
   * La app suma 2 + 4 + 2 = 8 (entre 5 y 12) y responde «Posible Grado I — Dependencia
   * Moderada», con la lista de prestaciones. HALLAZGO del 24/09/2026 → fallo esperado.
   */
  test('comer y tareas domésticas en sustitución máxima → sin grado (BVD 24)', async ({ page }) => {
    test.fail(true, 'Hallazgo 24/09/2026: la app da Grado I con 8 de sus puntos; el BVD da 24, sin grado.');
    await abrir(page);
    await marcarYEstimar(page, ['comer1', 'comer2', 'hogar1']);
    await expect(resultado(page)).toContainText('Probable situación de autonomía');
    await expect(resultado(page)).not.toContainText('Grado I');
  });

  /*
   * CUESTIONARIO VACÍO O CAMBIADO — sin ninguna casilla, la puntuación BVD equivalente es 0
   * (0-24, sin grado), así que «Probable situación de autonomía» es coherente. Lo que la app
   * debe garantizar es que, si se cambia una respuesta después de estimar, el resultado viejo
   * desaparezca en vez de quedarse en pantalla con respuestas que ya no son las suyas.
   */
  test('sin marcar nada → autonomía; cambiar una respuesta retira el resultado anterior', async ({ page }) => {
    await abrir(page);
    await expect(page.getByText('Ninguna situación marcada')).toBeVisible();
    await marcarYEstimar(page, []);
    await expect(resultado(page)).toContainText('Probable situación de autonomía');

    await page.getByRole('checkbox', { name: CASILLA.comer1 }).check();
    await expect(resultado(page)).toHaveCount(0);
    await expect(page.getByText(/Marca las situaciones que se aplican y pulsa el botón/)).toBeVisible();
  });

  /*
   * CONTADOR — «3 situaciones marcadas». La app escribe «situaciónes» (concatena «es» a
   * «situación» sin quitar la tilde). HALLAZGO del 24/09/2026 → fallo esperado.
   */
  test('el contador dice «3 situaciones marcadas»', async ({ page }) => {
    test.fail(true, 'Hallazgo 24/09/2026: el contador escribe «situaciónes».');
    await abrir(page);
    for (const c of ['comer1', 'comer2', 'hogar1'] as const) {
      await page.getByRole('checkbox', { name: CASILLA[c] }).check();
    }
    await expect(page.getByText('3 situaciones marcadas')).toBeVisible();
  });

  /*
   * ACCESIBILIDAD — el nombre accesible del botón debe contener su texto visible (WCAG 2.5.3).
   * Se ve «Estimar grado orientativo» y el aria-label dice «Estimar grado de dependencia», así
   * que quien lo pida por voz con el texto que ve no lo encuentra. HALLAZGO → fallo esperado.
   */
  test('el botón se encuentra por su texto visible', async ({ page }) => {
    test.fail(true, 'Hallazgo 24/09/2026: aria-label distinto del texto visible.');
    await abrir(page);
    await expect(page.getByRole('button', { name: 'Estimar grado orientativo' })).toHaveCount(1, { timeout: 2000 });
  });

  /*
   * DATO — la tabla «Prestación económica máx. (2025)» escribe 291 €/mes para la vinculada al
   * servicio de Grado I. data/fiscal/dependencia.ts (PRESTACIONES_DEPENDENCIA_2025, PEVS grado 1)
   * da 300 €/mes, y la app no importa ese módulo. HALLAZGO → fallo esperado.
   */
  test('la tabla de prestaciones toma la PEVS de Grado I de data/fiscal (300 €/mes)', async ({ page }) => {
    test.fail(true, 'Hallazgo 24/09/2026: 291 €/mes escrito a mano frente a 300 €/mes de data/fiscal.');
    await abrir(page);
    const celda = page.locator('table td').filter({ hasText: 'vinculada servicio' }).first();
    await expect(celda).toHaveText(/^300\s€\/mes/, { timeout: 2000 });
  });
});
