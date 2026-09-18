import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Test de Fragilidad (Escala FRAIL) — test de regresión (Inspector, 18/09/2026)
 * Los 7 hallazgos de esa inspección se repararon el mismo día; sus casos están al final.
 *
 * La app es riesgo 1 CRÍTICO: emite un juicio sobre el estado de salud de una persona
 * mayor. Lo que aquí se fija es la ARITMÉTICA del instrumento y los tres cortes, que es
 * lo único que un test puede demostrar; el juicio clínico no.
 *
 * DE DÓNDE SALE CADA VALOR ESPERADO (para auditar este fichero sin ejecutarlo)
 *   `calcularFragilidad` (page.tsx) suma 1 punto por ítem respondido «Sí» y parte en tres:
 *       0 puntos    → 'robusto'   → «Robusto — Sin fragilidad detectada»
 *       1 o 2       → 'prefragil' → «Pre-frágil — Riesgo moderado»
 *       3, 4 o 5    → 'fragil'    → «Frágil — Riesgo alto»
 *   Coincide con los cortes publicados de la escala FRAIL (0 robusto · 1-2 prefrágil ·
 *   3-5 frágil). Cada caso de abajo se resolvió a mano ANTES de abrir el navegador:
 *       las cinco a No           = 0 puntos → robusto,   «0 / 5»
 *       F + L                    = 2 puntos → prefrágil, «2 / 5»
 *       F + R                    = 2 puntos → prefrágil, «2 / 5»   ← lado bajo de la frontera
 *       F + R + A                = 3 puntos → frágil,    «3 / 5»   ← lado alto de la frontera
 *       los cinco a Sí           = 5 puntos → frágil,    «5 / 5»
 *
 * ── LO QUE CAMBIÓ AL REPARAR EL HALLAZGO 895 ──
 *   Antes había UNA casilla por ítem: marcada valía «Sí» y sin marcar valía a la vez «No» y
 *   «todavía no he contestado». Por eso entrar y pulsar «Evaluar» sin tocar nada devolvía
 *   «Robusto — Sin fragilidad detectada · 0/5», que es una tranquilización sobre un
 *   cuestionario en blanco. Ahora cada ítem tiene dos radios (Sí / No) y el botón no emite
 *   veredicto hasta que están los cinco: el 0 se alcanza respondiendo «No» cinco veces, que
 *   es un acto del usuario y no la ausencia de acto.
 *   Efecto colateral bienvenido: ya no hace falta el rodeo de «marcar y desmarcar» que este
 *   fichero usaba para que el caso de 0 puntos no pasara en verde con los clics perdidos.
 *
 * QUÉ ESTÁ BIEN Y NO HAY QUE ROMPER (fijado por los CASOS 1 a 9)
 *   La puntuación es el número de ítems en «Sí»; los tres cortes caen donde deben, incluida
 *   la frontera 2/3 y los dos extremos; el resumen por ítem coincide con lo respondido;
 *   cambiar una respuesta borra el resultado anterior en vez de dejarlo obsoleto en pantalla;
 *   el aviso médico es `severity="critical"` y NO es colapsable, como exige la política para
 *   el nivel 1; y la app no guarda ni envía a ninguna parte las respuestas de salud.
 */

const RUTA = '/test-fragilidad/';

/**
 * Las cinco preguntas, literales de `ITEMS_FRAIL` (page.tsx). Fijan los umbrales del
 * instrumento —10 escalones, 100 metros, 5 enfermedades, 5 % del peso—, así que si alguien
 * reformula un ítem el CASO 6 lo dice por su nombre.
 */
const PREGUNTAS = {
  fatiga:
    '¿Se ha sentido cansado/a o agotado/a la mayor parte del tiempo durante las últimas 4 semanas?',
  resistencia:
    '¿Tiene dificultad para subir un tramo de escaleras (unos 10 escalones) sin detenerse ni ayuda?',
  ambulacion:
    '¿Tiene dificultad para caminar unos 100 metros (aproximadamente una manzana) por terreno llano?',
  enfermedades: '¿Le ha diagnosticado un médico 5 o más de estas enfermedades crónicas?',
  peso: '¿Ha perdido más del 5% de su peso corporal en el último año sin habérselo propuesto?',
} as const;

type ItemId = keyof typeof PREGUNTAS;
const IDS = Object.keys(PREGUNTAS) as ItemId[];

/** Los diez radios. Se pasan a `esperarHidratacion`: sin ellos no hay app que probar. */
const RADIOS = IDS.flatMap((id) => [
  `input[name="frail-${id}"][value="si"]`,
  `input[name="frail-${id}"][value="no"]`,
]);

/** Un radio concreto. Los cinco «Sí» comparten nombre accesible, así que se localiza por name. */
const opcion = (page: Page, id: ItemId, valor: 'si' | 'no') =>
  page.locator(`input[name="frail-${id}"][value="${valor}"]`);

/** El botón que dispara el cálculo (su `aria-label`, no su texto visible). */
const botonEvaluar = (page: Page) =>
  page.getByRole('button', { name: 'Evaluar nivel de fragilidad' });

/** La caja del veredicto: icono + título + descripción. Es el único `role="status"` de la app. */
const veredicto = (page: Page) => page.locator('[role="status"]');

/** El contador de preguntas respondidas, bajo el botón. */
const contador = (page: Page) =>
  page.getByText(/^(\d de 5 preguntas respondidas|Las 5 preguntas respondidas · \d con «Sí»)$/);

async function abrir(page: Page) {
  await page.goto(RUTA);
  // Esta app se rellena a CLICS, y un clic anterior a la hidratación también se pierde.
  await esperarHidratacion(page, RADIOS);
}

/**
 * Responde las CINCO preguntas: «Sí» a las indicadas y «No» a las demás, que es lo que el
 * instrumento pide y lo que el botón exige. Comprueba además que el contador las ha recogido
 * de verdad: si un clic se hubiera perdido, aquí se ve.
 */
async function responderTodo(page: Page, conSi: readonly ItemId[]) {
  for (const id of IDS) {
    await opcion(page, id, conSi.includes(id) ? 'si' : 'no').click();
  }
  await expect(contador(page)).toHaveText(
    `Las 5 preguntas respondidas · ${conSi.length} con «Sí»`,
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 — 0 puntos: el extremo bajo
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 1 — cinco «No» dan 0 / 5 y «Robusto»', async ({ page }) => {
  await abrir(page);
  await responderTodo(page, []);

  await botonEvaluar(page).click();

  await expect(veredicto(page)).toContainText('Robusto — Sin fragilidad detectada');
  await expect(page.getByText('0 / 5', { exact: true })).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 — 2 puntos: el caso corriente
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 2 — Fatiga + Pérdida de peso dan 2 / 5 y «Pre-frágil»', async ({ page }) => {
  await abrir(page);
  await responderTodo(page, ['fatiga', 'peso']); // 1 + 1 = 2 puntos

  await botonEvaluar(page).click();

  await expect(veredicto(page)).toContainText('Pre-frágil — Riesgo moderado');
  await expect(page.getByText('2 / 5', { exact: true })).toBeVisible();

  // El resumen por ítem tiene que decir exactamente lo que el usuario respondió.
  const resumen = page.getByText('Puntuación FRAIL').locator('xpath=../following-sibling::div[1]');
  await expect(resumen).toContainText('Fatiga');
  await expect(resumen).toHaveText(
    /F\s*Fatiga\s*Sí\s*R\s*Resistencia\s*No\s*A\s*Ambulación\s*No\s*I\s*Enfermedades\s*No\s*L\s*Pérdida de peso\s*Sí/,
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
  await responderTodo(page, ['fatiga', 'resistencia']);
  await botonEvaluar(page).click();
  await expect(veredicto(page)).toContainText('Pre-frágil — Riesgo moderado');
  await expect(page.getByText('2 / 5', { exact: true })).toBeVisible();

  // Un solo ítem más cruza la frontera: 3 puntos ya es fragilidad.
  await opcion(page, 'ambulacion', 'si').click();
  await expect(contador(page)).toHaveText('Las 5 preguntas respondidas · 3 con «Sí»');
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
  await responderTodo(page, IDS); // 5 ítems = 5 puntos, el máximo de la escala

  await botonEvaluar(page).click();

  await expect(veredicto(page)).toContainText('Frágil — Riesgo alto');
  await expect(page.getByText('5 / 5', { exact: true })).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 5 — cambiar una respuesta no puede dejar en pantalla el veredicto anterior
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 5 — al cambiar una respuesta se retira el resultado obsoleto', async ({ page }) => {
  await abrir(page);
  await responderTodo(page, ['fatiga', 'resistencia']);
  await botonEvaluar(page).click();
  await expect(veredicto(page)).toContainText('Pre-frágil — Riesgo moderado');

  // Cambiar un ítem invalida el «Pre-frágil» que hay en pantalla: tiene que irse, no
  // quedarse contradiciendo a las respuestas que ahora se ven.
  await opcion(page, 'ambulacion', 'si').click();
  await expect(veredicto(page)).toHaveCount(0);
  await expect(page.getByText('Responde las 5 preguntas de la escala FRAIL')).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 6 — los cinco ítems siguen preguntando lo que preguntan
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 6 — los 5 ítems y sus umbrales son los que la app declara', async ({ page }) => {
  await abrir(page);

  // Esto fija la redacción completa de las cinco preguntas, con sus umbrales dentro: 10
  // escalones, 100 metros, 5 enfermedades y 5 % de peso en un año. Cambiar cualquiera de
  // esos números cambia el instrumento, no el estilo, y este caso se pondrá rojo.
  for (const pregunta of Object.values(PREGUNTAS)) {
    await expect(page.getByText(pregunta, { exact: true })).toBeVisible();
  }
  await expect(page.getByText('Escala FRAIL — 5 preguntas')).toBeVisible();
  await expect(page.locator('h1')).toHaveText('Test de Fragilidad');
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 7 — el aviso de nivel 1: crítico, no colapsable y con el texto que la política fija
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 7 — el aviso médico es crítico, no se puede plegar y trae las piezas del Nivel 1', async ({
  page,
}) => {
  await abrir(page);

  const aviso = page.locator('[role="alert"]').first();
  await expect(aviso).toContainText('Aviso Médico Importante');
  await expect(aviso).toContainText('Valoración Geriátrica Integral');
  // Nivel 1 CRÍTICO (_private/DISCLAIMER-POLICY.md §5): nunca colapsable, así que el
  // DisclaimerCard no puede montar su botón de plegado.
  await expect(aviso.locator('button[aria-expanded]')).toHaveCount(0);

  // HALLAZGO 896 · el texto propio SUSTITUYE al estándar del componente, así que tiene que
  // traer él las tres piezas de la política §4 para la variante médica. No las traía: ni la
  // fórmula de «no constituye diagnóstico», ni la de responsabilidad, ni el bloque de
  // emergencias que el componente añade solo cuando monta su texto por defecto.
  await expect(aviso).toContainText('no constituye diagnóstico médico');
  await expect(aviso).toContainText('TÚ ERES RESPONSABLE');
  await expect(aviso).toContainText('EMERGENCIAS MÉDICAS');
  await expect(aviso).toContainText('112');
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
  await responderTodo(page, ['fatiga', 'enfermedades', 'peso']);
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
// CASO 9 — el aviso legal, que esta app fue la única de sus 21 hermanas en no montar
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 9 — la app monta su aviso legal, como las otras 20 apps `app/test-*`', async ({
  page,
}) => {
  // `LegalNotice` es uno de los cinco componentes obligatorios en TODA app (CLAUDE.md), y
  // _private/DISCLAIMER-POLICY.md lo repite: «LegalNotice sigue siendo obligatorio en todas
  // las apps». Esta era la ÚNICA de las 21 apps `app/test-*` que no lo montaba, y justo la que
  // recoge datos de categoría especial del RGPD: cinco preguntas sobre la salud del usuario.
  //
  // REPARADO el 18/09/2026 en el mismo commit que crea `scripts/check-legal-notice.mjs`, que
  // desde entonces rompe el build si una app nace sin aviso legal.
  //
  // ⚠️ La asercion se ancla a «Términos de Uso», que es la marca INEQUÍVOCA de LegalNotice:
  // el Footer no lo lleva, y el pie de DisclaimerCard solo lo monta con showTermsLink, que
  // esta app no activa.
  //
  // NO vale buscar /privacidad/i: el TransparencyBanner del layout raíz pinta «Tu privacidad
  // es importante» en TODAS las apps, así que esa versión del test pasaba en verde sin que
  // LegalNotice existiera.
  await abrir(page);
  await expect(page.getByRole('link', { name: 'Términos de Uso' })).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════════════
// LOS 7 HALLAZGOS DEL 18/09/2026, ya como candados de regresión
// ═══════════════════════════════════════════════════════════════════════════

test('895 · sin responder las cinco no se emite ningún veredicto', async ({ page }) => {
  // Pulsar «Evaluar fragilidad» nada más llegar devolvía «🟢 Robusto — Sin fragilidad
  // detectada» y «Mantén tus hábitos saludables»: una tranquilización activa sobre un
  // cuestionario en blanco, en una app de riesgo 1. Ahora dice qué falta y no juzga.
  await abrir(page);
  await botonEvaluar(page).click();

  await expect(veredicto(page)).toHaveCount(0);
  // Ojo al localizador: `[role="alert"]`.last() cae en el <div id="__next-route-announcer__">
  // que Next monta vacío al final del body. El aviso propio se busca por su clase.
  const aviso = page.locator('[class*="avisoIncompleto"]');
  await expect(aviso).toHaveAttribute('role', 'alert');
  await expect(aviso).toContainText('Todavía no has respondido ninguna pregunta');

  // Con el cuestionario a medias tampoco: y el aviso nombra las que faltan, en vez de
  // limitarse a no hacer nada (que es lo que el botón hacía antes de existir el aviso).
  await opcion(page, 'fatiga', 'si').click();
  await opcion(page, 'resistencia', 'no').click();
  await botonEvaluar(page).click();
  await expect(veredicto(page)).toHaveCount(0);
  await expect(aviso).toContainText('Faltan 3 de 5 preguntas');
  await expect(aviso).toContainText('Ambulación');
});

test('893 · el ítem de enfermedades cuenta sobre una lista cerrada', async ({ page }) => {
  // La pregunta era «¿Tiene 5 o más enfermedades crónicas diagnosticadas por un médico?» con
  // una lista ABIERTA de ejemplos que acababa en «…», y que además metía osteoporosis,
  // demencia y depresión —ajenas al instrumento— y omitía infarto, angina y asma. Medido: con
  // cinco crónicas fuera de la escala, la app devolvía «Frágil» donde toca «Pre-frágil».
  await abrir(page);

  const ficha = page.getByText(PREGUNTAS.enfermedades, { exact: true }).locator('..');
  await expect(ficha).toContainText('El recuento es solo sobre esta lista');
  await expect(ficha).toContainText('infarto de miocardio');
  await expect(ficha).toContainText('angina de pecho');
  await expect(ficha).toContainText('asma');
  await expect(ficha).toContainText('Ninguna otra enfermedad cuenta para este ítem');
  // Y las tres que no son del instrumento ya no se ofrecen como ejemplo.
  await expect(ficha).not.toContainText('osteoporosis');
  await expect(ficha).not.toContainText('demencia');
});

test('894 · la escala declara su fuente, con referencia comprobable', async ({ page }) => {
  // La app nombraba «Morley et al., 2012» tres veces sin un enlace, un DOI ni un
  // DataReference: la afirmación de validez no era auditable por quien la lee. Lo que se
  // exige aquí es que exista la referencia, no una redacción concreta.
  await abrir(page);

  const referencia = page.locator('[class*="dataReference"]');
  await expect(referencia).toContainText('Morley');
  await expect(referencia).toContainText('J Nutr Health Aging. 2012;16(7):601-608');
  await expect(page.locator('a[href*="doi.org/10.1007/s12603-012-0084-2"]')).toHaveCount(1);
  // Y dice el límite que tiene: la enumeración del ítem de enfermedades no se pudo
  // contrastar con el artículo original, y eso se declara en vez de darse por cerrado.
  await expect(referencia).toContainText(/no ha podido contrastarse|muro de pago/);
});

test('897 · la salvedad viaja dentro de la caja del veredicto', async ({ page }) => {
  // «No sustituye a una Valoración Geriátrica Integral» vivía solo en el aviso de arriba del
  // todo, a una pantalla larga del bloque que se lee al final, se captura y se le enseña a un
  // familiar. Allí la etiqueta «Frágil — Riesgo alto» viajaba sola.
  await abrir(page);
  await responderTodo(page, ['fatiga', 'resistencia', 'ambulacion']);
  await botonEvaluar(page).click();

  await expect(veredicto(page)).toContainText('Frágil — Riesgo alto');
  await expect(veredicto(page)).toContainText('No es un diagnóstico');
  await expect(veredicto(page)).toContainText('Valoración Geriátrica Integral');
});

test('898 · el JSON-LD dice que esto es una app educativa, no financiera', async ({ page }) => {
  // metadata.ts declaraba `category: 'FinanceApplication'` y `features: []`. Eso es lo que se
  // sirve a Google y a las IAs para entender qué es esta página.
  await page.goto(RUTA);
  const webApp = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .evaluate((s) => JSON.parse(s.textContent ?? '{}') as Record<string, unknown>);

  expect(webApp.applicationCategory).toBe('EducationalApplication');
  // CLAUDE.md §1.ter pide entre 4 y 8 características reales.
  const caracteristicas = webApp.featureList as string[];
  expect(caracteristicas.length).toBeGreaterThanOrEqual(4);
  expect(caracteristicas.length).toBeLessThanOrEqual(8);
});

test('899 · el bloque educativo no se contradice consigo mismo', async ({ page }) => {
  // Dos incoherencias internas: el mismo ítem se llamaba «Ambulación» en la herramienta y
  // «Aerobic» en el plan de acción, y convivían dos umbrales de pérdida de peso —el >5 % que
  // usa FRAIL y los 4,5 kg de los criterios de Fried— sin decir que son de escalas distintas.
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Ver guía|guía educativa/i }).first().click();

  const plan = page.getByText(/Los 5 ítems \(/);
  await expect(plan).toContainText('Ambulation');
  await expect(plan).not.toContainText('Aerobic');

  // Y donde aparecen los 4,5 kg, se dice de qué escala vienen.
  const fried = page.getByText(/4,5 kg/).first();
  await expect(fried).toContainText('Fried');
});
