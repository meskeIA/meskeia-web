import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Test de Fragilidad (Escala FRAIL) — test de regresión (Inspector, 18/09/2026)
 *
 * La app es riesgo 1 CRÍTICO: emite un juicio sobre el estado de salud de una persona
 * mayor. Lo que aquí se fija es la ARITMÉTICA del instrumento y los tres cortes, que es
 * lo único que un test puede demostrar; el juicio clínico no.
 *
 * DE DÓNDE SALE CADA VALOR ESPERADO (para auditar este fichero sin ejecutarlo)
 *   `calcularFragilidad` (page.tsx) suma 1 punto por ítem marcado como «Sí» —el tamaño del
 *   Set de respuestas— y parte en tres:
 *       0 puntos    → 'robusto'   → «Robusto — Sin fragilidad detectada»
 *       1 o 2       → 'prefragil' → «Pre-frágil — Riesgo moderado»
 *       3, 4 o 5    → 'fragil'    → «Frágil — Riesgo alto»
 *   Coincide con los cortes publicados de la escala FRAIL (0 robusto · 1-2 prefrágil ·
 *   3-5 frágil). Cada caso de abajo se resolvió a mano ANTES de abrir el navegador:
 *       F + L                    = 2 puntos → prefrágil, «2 / 5»
 *       F + R                    = 2 puntos → prefrágil, «2 / 5»   ← lado bajo de la frontera
 *       F + R + A                = 3 puntos → frágil,    «3 / 5»   ← lado alto de la frontera
 *       los cinco                = 5 puntos → frágil,    «5 / 5»
 *       ninguno                  = 0 puntos → robusto,   «0 / 5»
 *
 * ⚠️ POR QUÉ EL CASO DE 0 PUNTOS MARCA Y DESMARCA EN VEZ DE NO TOCAR NADA
 *   Las cinco casillas nacen sin marcar, así que un caso que se limitara a pulsar «Evaluar»
 *   daría verde aunque todos los clics se hubieran perdido (ver `_hidratacion.ts`). El CASO 1
 *   llega al 0 por un cambio real: marca Fatiga, comprueba el contador, y la desmarca.
 *   El único caso que sí parte del estado inicial es el HALLAZGO de las respuestas
 *   incompletas, porque ahí la ausencia de respuesta ES el escenario; su prueba de que la
 *   app está viva es que el panel de resultado aparece, y solo aparece si React atendió el
 *   clic del botón.
 *
 * QUÉ ESTÁ BIEN Y NO HAY QUE ROMPER (fijado por los CASOS 1 a 5)
 *   La puntuación es el número de ítems marcados; los tres cortes caen donde deben, incluida
 *   la frontera 2/3 y los dos extremos; el resumen por ítem coincide con lo marcado; cambiar
 *   una respuesta borra el resultado anterior en vez de dejarlo obsoleto en pantalla; el
 *   aviso médico es `severity="critical"` y NO es colapsable, como exige la política para el
 *   nivel 1; y la app no guarda ni envía a ninguna parte las respuestas de salud.
 *
 * HALLAZGOS ABIERTOS: los tests marcados con `test.fail()` afirman lo que la app debería
 * hacer y hoy fallan a propósito. El día que se reparen pasarán a ROJO («expected to fail,
 * but passed») y habrá que quitarles la marca, no rebajar lo que afirman.
 */

const RUTA = '/test-fragilidad/';

/**
 * Las cinco preguntas, literales de `ITEMS_FRAIL` (page.tsx). Son el `aria-label` de cada
 * casilla, así que sirven de localizador y a la vez de guardián: si alguien reformula un
 * ítem, el CASO 6 lo dice por su nombre en vez de fallar con «locator not found».
 */
const PREGUNTAS = {
  fatiga:
    '¿Se ha sentido cansado/a o agotado/a la mayor parte del tiempo durante las últimas 4 semanas?',
  resistencia:
    '¿Tiene dificultad para subir un tramo de escaleras (unos 10 escalones) sin detenerse ni ayuda?',
  ambulacion:
    '¿Tiene dificultad para caminar unos 100 metros (aproximadamente una manzana) por terreno llano?',
  enfermedades: '¿Tiene 5 o más enfermedades crónicas diagnosticadas por un médico?',
  peso: '¿Ha perdido más del 5% de su peso corporal en el último año sin habérselo propuesto?',
} as const;

/** Las cinco casillas. Se pasan a `esperarHidratacion`: sin ellas no hay app que probar. */
const CASILLAS = Object.values(PREGUNTAS).map((p) => `input[aria-label="${p}"]`);

const casilla = (page: Page, pregunta: string) => page.getByRole('checkbox', { name: pregunta });

/** El botón que dispara el cálculo (su `aria-label`, no su texto visible). */
const botonEvaluar = (page: Page) =>
  page.getByRole('button', { name: 'Evaluar nivel de fragilidad' });

/** La caja del veredicto: icono + título + descripción. Es el único `role="status"` de la app. */
const veredicto = (page: Page) => page.locator('[role="status"]');

/** El contador de ítems marcados, bajo el botón. */
const contador = (page: Page) =>
  page.getByText(/^(Ningún ítem marcado como Sí|\d de 5 ítems marcados como Sí)$/);

async function abrir(page: Page) {
  await page.goto(RUTA);
  // Esta app se rellena a CLICS, y un clic anterior a la hidratación también se pierde.
  await esperarHidratacion(page, CASILLAS);
}

/** Marca los ítems indicados y comprueba que el contador los ha recogido de verdad. */
async function marcar(page: Page, preguntas: readonly string[]) {
  for (const p of preguntas) await casilla(page, p).click();
  await expect(contador(page)).toHaveText(`${preguntas.length} de 5 ítems marcados como Sí`);
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 — 0 puntos: el extremo bajo
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 1 — ningún ítem positivo da 0 / 5 y «Robusto»', async ({ page }) => {
  await abrir(page);

  // Se llega al 0 por un cambio real (marcar y desmarcar), no dejando la app quieta.
  await casilla(page, PREGUNTAS.fatiga).click();
  await expect(contador(page)).toHaveText('1 de 5 ítems marcados como Sí');
  await casilla(page, PREGUNTAS.fatiga).click();
  await expect(contador(page)).toHaveText('Ningún ítem marcado como Sí');

  await botonEvaluar(page).click();

  await expect(veredicto(page)).toContainText('Robusto — Sin fragilidad detectada');
  await expect(page.getByText('0 / 5', { exact: true })).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 — 2 puntos: el caso corriente
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 2 — Fatiga + Pérdida de peso dan 2 / 5 y «Pre-frágil»', async ({ page }) => {
  await abrir(page);
  await marcar(page, [PREGUNTAS.fatiga, PREGUNTAS.peso]); // 1 + 1 = 2 puntos

  await botonEvaluar(page).click();

  await expect(veredicto(page)).toContainText('Pre-frágil — Riesgo moderado');
  await expect(page.getByText('2 / 5', { exact: true })).toBeVisible();

  // El resumen por ítem tiene que decir exactamente lo que el usuario marcó.
  const resumen = page.getByText('Puntuación FRAIL').locator('xpath=../following-sibling::div[1]');
  await expect(resumen).toContainText('Fatiga');
  await expect(resumen).toHaveText(
    /Fatiga\s*Sí\s*R\s*Resistencia\s*No\s*A\s*Ambulación\s*No\s*I\s*Enfermedades\s*No\s*L\s*Pérdida de peso\s*Sí/,
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 — la FRONTERA 2/3, que es donde cambia la categoría
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 3 — el corte está entre 2 y 3: el tercer ítem cambia «Pre-frágil» por «Frágil»', async ({
  page,
}) => {
  await abrir(page);

  // Lado bajo: 2 puntos siguen siendo pre-fragilidad.
  await marcar(page, [PREGUNTAS.fatiga, PREGUNTAS.resistencia]);
  await botonEvaluar(page).click();
  await expect(veredicto(page)).toContainText('Pre-frágil — Riesgo moderado');
  await expect(page.getByText('2 / 5', { exact: true })).toBeVisible();

  // Un solo ítem más cruza la frontera: 3 puntos ya es fragilidad.
  await casilla(page, PREGUNTAS.ambulacion).click();
  await expect(contador(page)).toHaveText('3 de 5 ítems marcados como Sí');
  await botonEvaluar(page).click();
  await expect(veredicto(page)).toContainText('Frágil — Riesgo alto');
  await expect(page.getByText('3 / 5', { exact: true })).toBeVisible();

  // Y el resultado de 3 puntos manda al usuario a una valoración profesional, que es la
  // ruta de actuación que un veredicto de este nivel no puede dejar de dar.
  await expect(page.getByText(/Valoración Geriátrica Integral \(VGI\) a tu médico/)).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 4 — 5 puntos: el extremo alto
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 4 — los cinco ítems positivos dan 5 / 5 y «Frágil»', async ({ page }) => {
  await abrir(page);
  await marcar(page, Object.values(PREGUNTAS)); // 5 ítems = 5 puntos, el máximo de la escala

  await botonEvaluar(page).click();

  await expect(veredicto(page)).toContainText('Frágil — Riesgo alto');
  await expect(page.getByText('5 / 5', { exact: true })).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 5 — cambiar una respuesta no puede dejar en pantalla el veredicto anterior
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 5 — al cambiar una respuesta se retira el resultado obsoleto', async ({ page }) => {
  await abrir(page);
  await marcar(page, [PREGUNTAS.fatiga, PREGUNTAS.resistencia]);
  await botonEvaluar(page).click();
  await expect(veredicto(page)).toContainText('Pre-frágil — Riesgo moderado');

  // Marcar un tercer ítem invalida el «Pre-frágil» que hay en pantalla: tiene que irse, no
  // quedarse contradiciendo a las respuestas que ahora se ven marcadas.
  await casilla(page, PREGUNTAS.ambulacion).click();
  await expect(veredicto(page)).toHaveCount(0);
  await expect(page.getByText('Responde las 5 preguntas de la escala FRAIL')).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 6 — los cinco ítems siguen preguntando lo que preguntan
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 6 — los 5 ítems y sus umbrales son los que la app declara', async ({ page }) => {
  await abrir(page);

  // `getByRole(..., { name })` casa el nombre accesible ENTERO, así que esto fija la
  // redacción completa de las cinco preguntas, con sus umbrales dentro: 10 escalones,
  // 100 metros, 5 enfermedades y 5 % de peso en un año. Cambiar cualquiera de esos números
  // cambia el instrumento, no el estilo, y este caso se pondrá rojo.
  for (const pregunta of Object.values(PREGUNTAS)) {
    await expect(casilla(page, pregunta)).toBeVisible();
  }
  await expect(page.getByText('Escala FRAIL — 5 preguntas')).toBeVisible();
  await expect(page.locator('h1')).toHaveText('Test de Fragilidad');
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 7 — el aviso de nivel 1: crítico y no colapsable
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 7 — el aviso médico es crítico, no se puede plegar y dice que no sustituye a la VGI', async ({
  page,
}) => {
  await abrir(page);

  const aviso = page.locator('[role="alert"]').first();
  await expect(aviso).toContainText('Aviso Médico Importante');
  await expect(aviso).toContainText('No sustituye');
  await expect(aviso).toContainText('Valoración Geriátrica Integral');
  // Nivel 1 CRÍTICO (_private/DISCLAIMER-POLICY.md §5): nunca colapsable, así que el
  // DisclaimerCard no puede montar su botón de plegado.
  await expect(aviso.locator('button[aria-expanded]')).toHaveCount(0);
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 8 — datos de salud: no salen del navegador
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 8 — las respuestas de salud no se guardan ni se envían a ninguna parte', async ({
  page,
}) => {
  const peticiones: string[] = [];
  page.on('request', (r) => {
    if (r.method() === 'POST') peticiones.push(r.url());
  });

  await abrir(page);
  await marcar(page, [PREGUNTAS.fatiga, PREGUNTAS.enfermedades, PREGUNTAS.peso]);
  await botonEvaluar(page).click();
  await expect(veredicto(page)).toContainText('Frágil — Riesgo alto');

  // Son datos de salud: categoría especial del RGPD. Lo que el navegador guarde puede ser
  // solo de los componentes comunes (`meskeia_share_visits_*` de ShareCard y
  // `meskeia_recent_apps`), nunca las respuestas ni la puntuación.
  const almacenado = await page.evaluate(() => ({
    local: Object.entries(localStorage),
    sesion: Object.entries(sessionStorage),
  }));
  expect(almacenado.local.map(([clave]) => clave).filter((c) => !c.startsWith('meskeia_'))).toEqual(
    [],
  );
  expect(almacenado.sesion).toEqual([]);

  // Y en los VALORES no puede aparecer ningún identificador de ítem. (No se miran las
  // claves: `meskeia_share_visits_test-fragilidad` lleva el slug dentro y no es un dato
  // de salud, es el contador de visitas del componente de compartir.)
  const valores = almacenado.local.map(([, valor]) => valor).join(' ');
  for (const rastro of ['fatiga', 'resistencia', 'ambulacion', 'enfermedades', 'puntuacion']) {
    expect(valores, `«${rastro}» no puede quedar guardado en el navegador`).not.toContain(rastro);
  }

  // Y ninguna de las respuestas puede haber viajado en un POST.
  const conRespuestas = peticiones.filter((u) => !u.includes('/api/analytics'));
  expect(conRespuestas).toEqual([]);
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS
// ═══════════════════════════════════════════════════════════════════════════

test('HALLAZGO — con CERO respuestas emite «Sin fragilidad detectada» sin avisar de que no se ha contestado', async ({
  page,
}) => {
  test.fail();
  // La app solo ofrece una casilla por ítem: marcada = «Sí», sin marcar = «No». No hay
  // forma de distinguir «he contestado que no a las cinco» de «no he contestado nada», y
  // pulsar «Evaluar fragilidad» nada más llegar devuelve «🟢 Robusto — Sin fragilidad
  // detectada» y «Mantén tus hábitos saludables», que es una tranquilización activa.
  // Además la app promete otra cosa dos veces: la instrucción del cuestionario dice
  // «Responde Sí o No» (y el «No» no existe) y el panel vacío dice «Responde las 5
  // preguntas … y pulsa Evaluar», promesa que el botón no hace cumplir.
  // Este es el único caso que parte del estado inicial a propósito; que el clic del botón
  // sí llegó lo demuestra el propio panel de resultado, que solo aparece si React lo atendió.
  await abrir(page);
  await botonEvaluar(page).click();
  await expect(veredicto(page)).toBeVisible();

  // Sin una sola respuesta, lo que no puede salir es una tranquilización: «Sin fragilidad
  // detectada» afirma un resultado negativo que nadie ha declarado.
  await expect(veredicto(page)).not.toContainText('Sin fragilidad detectada');
});

test('CASO 9 — la app monta su aviso legal, como las otras 20 apps `app/test-*`', async ({
  page,
}) => {
  // `LegalNotice` es uno de los cinco componentes obligatorios en TODA app (CLAUDE.md), y
  // _private/DISCLAIMER-POLICY.md lo repite: «LegalNotice sigue siendo obligatorio en todas
  // las apps». Esta era la ÚNICA de las 21 apps `app/test-*` que no lo montaba, y justo la que
  // recoge datos de categoría especial del RGPD: cinco preguntas sobre la salud del usuario.
  //
  // REPARADO el 18/09/2026 en el mismo commit que crea `scripts/check-legal-notice.mjs`, que
  // desde entonces rompe el build si una app nace sin aviso legal. El test deja de ser un
  // hallazgo abierto y pasa a ser la regresión que impide que vuelva a caerse.
  //
  // ⚠️ La asercion se ancla a «Términos de Uso», que es la marca INEQUÍVOCA de LegalNotice:
  // el Footer no lo lleva, y el pie de DisclaimerCard solo lo monta con showTermsLink, que
  // esta app no activa. Medido el 18/09/2026 sobre el HTML de producción: test-fragilidad
  // da 0 y sus hermanas test-bienestar-who5 y test-burnout-laboral dan 1.
  //
  // NO vale buscar /privacidad/i: el TransparencyBanner del layout raíz (app/layout.tsx:102)
  // pinta «Tu privacidad es importante» en TODAS las apps, así que esa versión del test
  // pasaba en verde sin que LegalNotice existiera. Se descubrió porque `test.fail()` avisó
  // de «Expected to fail, but passed» — el banner solo sale en la primera visita (guarda su
  // cierre en localStorage) y no se sirve en el HTML, de ahí que no se viera con curl.
  await abrir(page);
  await expect(page.getByRole('link', { name: 'Términos de Uso' })).toBeVisible();
});

test('HALLAZGO — el JSON-LD clasifica un test de salud geriátrica como «FinanceApplication»', async ({
  page,
}) => {
  test.fail();
  // metadata.ts: `category: 'FinanceApplication'` y `features: []`. Lo que se sirve a Google
  // y a las IAs dice que esto es una aplicación financiera sin ninguna característica
  // declarada. De las categorías que admite `BaseAppConfig` (Utility / Business / Finance /
  // Educational), la que corresponde a un cribado orientativo es `EducationalApplication`.
  await page.goto(RUTA);
  const webApp = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .evaluate((s) => JSON.parse(s.textContent ?? '{}') as Record<string, unknown>);

  expect(webApp.applicationCategory).not.toBe('FinanceApplication');
  expect(webApp.featureList).not.toEqual([]);
});
