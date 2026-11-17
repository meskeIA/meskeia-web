import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Test de Fragilidad (Escala FRAIL) — test de regresión (Inspector, 18/09/2026)
 * Los 7 hallazgos de esa inspección se repararon el mismo día; sus casos están al final.
 *
 * Re-inspección en modo CAMBIO (16/11/2026) sobre `git diff 885242c3 HEAD`: la reparación de
 * esos 7 hallazgos (radios Sí/No, aviso de cuestionario incompleto, lista cerrada de
 * enfermedades, DataReference, salvedad en el veredicto, JSON-LD) y las tandas de contraste
 * C0070, C0226 y C0296. Sus casos son los CASOS 10 a 14 y los HALLAZGO (16/11/2026, ABIERTO)
 * del final, que llevan test.fail(): describen lo que DEBERÍA pasar y hoy no pasa. Al reparar
 * cada uno se quita su test.fail() —comprobando antes que lo que afirma sigue siendo lo
 * correcto— y el título pasa a REPARADO.
 *
 * Comprobación PUNTUAL del cabo C0787 (17/11/2026): la frase de «Errores frecuentes» sobre el
 * umbral de pérdida de peso de Fried. Su caso es el último del fichero.
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

  const aviso = page.getByRole('note', { name: 'Aviso importante' });
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

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DEL 16/11/2026 (modo cambio)
// ═══════════════════════════════════════════════════════════════════════════
//
// ESCALA CONTRA LA QUE SE RESOLVIERON LOS CASOS, A MANO Y ANTES DE ABRIR EL NAVEGADOR
//   La que la propia app declara en cuatro sitios que coinciden entre sí —bloque educativo
//   («Con 0 puntos: robusto; 1-2: pre-frágil; 3-5: frágil»), tabla comparativa, FAQPage y
//   `features` del JSON-LD—: 1 punto por ítem en «Sí», 0 robusto, 1-2 pre-frágil, 3-5 frágil.
//   El artículo de Morley et al. (2012) que cita no está en la lista de fuentes que puede
//   leer el Inspector; la app ya declara ese límite en su DataReference.

/** Abre la app con el tema pedido (next-themes lo lee de `meskeia-theme` antes de pintar). */
async function abrirConTema(page: Page, tema: 'light' | 'dark') {
  await page.addInitScript((t) => localStorage.setItem('meskeia-theme', t), tema);
  await abrir(page);
  // Sembrar el tema puede no prender: sin esta comprobación el caso mediría el otro tema.
  await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
}

/**
 * Contraste WCAG del texto de un elemento contra el fondo de su caja, CON la opacidad del
 * propio elemento y de sus ancestros hasta esa caja. `contrasteSobreFondoReal` (_contraste.ts)
 * no mira `opacity`, y aquí es justo lo que cuenta: `.nivelSalvedad` lleva `opacity: 0.85`, que
 * compone el color del texto al 85 % sobre el tinte de la caja del veredicto.
 */
async function contrasteConOpacidad(elemento: Locator): Promise<number> {
  return elemento.evaluate((el) => {
    const rgba = (s: string): number[] => {
      const n = (s.match(/[\d.]+/g) ?? []).map(Number);
      return [n[0], n[1], n[2], n.length > 3 ? n[3] : 1];
    };
    const lum = ([r, g, b]: number[]): number => {
      const f = (c: number) => {
        const x = c / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const capas: number[][] = [];
    let opacidad = 1;
    let caja: Element | null = null;
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) {
        capas.push(c);
        if (c[3] >= 1) {
          caja = n;
          break;
        }
      }
    }
    // La opacidad que separa el texto de su fondo: la de los nodos ENTRE el texto y la caja.
    for (let n: Element | null = el; n && n !== caja; n = n.parentElement) {
      opacidad *= Number(getComputedStyle(n).opacity);
    }
    let fondo = [255, 255, 255];
    for (let i = capas.length - 1; i >= 0; i--) {
      const [r, g, b, a] = capas[i];
      fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
    }
    const t = rgba(getComputedStyle(el).color);
    const alfa = t[3] * opacidad;
    const texto = [0, 1, 2].map((i) => t[i] * alfa + fondo[i] * (1 - alfa));
    const a = lum(texto);
    const b = lum(fondo);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

/** La salvedad «No es un diagnóstico» de la caja del veredicto (el único <p> de esa caja). */
const salvedad = (page: Page) => veredicto(page).locator('p');

/** Las respuestas que dan cada nivel: 0, 1 y 3 «Sí». */
const RESPUESTAS_POR_NIVEL = {
  robusto: { conSi: [] as ItemId[], titulo: 'Robusto — Sin fragilidad detectada' },
  prefragil: { conSi: ['fatiga'] as ItemId[], titulo: 'Pre-frágil — Riesgo moderado' },
  fragil: { conSi: ['fatiga', 'resistencia', 'ambulacion'] as ItemId[], titulo: 'Frágil — Riesgo alto' },
} as const;

test('CASO 10 — la frontera baja: un solo «Sí» ya es 1 / 5 y «Pre-frágil»', async ({ page }) => {
  // Resuelto a mano: solo Pérdida de peso en «Sí» = 1 punto → 1-2 → pre-frágil. Los CASOS 1 a
  // 4 fijan 0, 2, 3 y 5; faltaba el lado alto de la frontera 0/1.
  await abrir(page);
  await responderTodo(page, ['peso']);
  await botonEvaluar(page).click();

  await expect(veredicto(page)).toContainText('Pre-frágil — Riesgo moderado');
  await expect(page.getByText('1 / 5', { exact: true })).toBeVisible();
});

test('CASO 11 — pasar un «Sí» a «No» resta: 5 → 4 → 0', async ({ page }) => {
  // Con la casilla única, desmarcar era quitar del conjunto; con dos radios, cambiar de «Sí» a
  // «No» tiene que SUSTITUIR la respuesta, no sumar otra. Resuelto a mano:
  //   los cinco a Sí            = 5 → frágil
  //   Resistencia pasa a No     = 4 → frágil   (y el veredicto de 5 se retira al cambiar)
  //   los cinco a No            = 0 → robusto
  await abrir(page);
  await responderTodo(page, IDS);
  await botonEvaluar(page).click();
  await expect(page.getByText('5 / 5', { exact: true })).toBeVisible();

  await opcion(page, 'resistencia', 'no').click();
  await expect(veredicto(page)).toHaveCount(0);
  await expect(contador(page)).toHaveText('Las 5 preguntas respondidas · 4 con «Sí»');
  await botonEvaluar(page).click();
  await expect(veredicto(page)).toContainText('Frágil — Riesgo alto');
  await expect(page.getByText('4 / 5', { exact: true })).toBeVisible();
  const resumen = page
    .getByText('Puntuación FRAIL', { exact: true })
    .locator('xpath=../following-sibling::div[1]');
  await expect(resumen).toHaveText(
    /F\s*Fatiga\s*Sí\s*R\s*Resistencia\s*No\s*A\s*Ambulación\s*Sí\s*I\s*Enfermedades\s*Sí\s*L\s*Pérdida de peso\s*Sí/,
  );

  await responderTodo(page, []);
  await botonEvaluar(page).click();
  await expect(veredicto(page)).toContainText('Robusto — Sin fragilidad detectada');
  await expect(page.getByText('0 / 5', { exact: true })).toBeVisible();
});

test('CASO 12 — con 4 de 5 respondidas no hay veredicto y el aviso nombra la que falta', async ({
  page,
}) => {
  // Las cuatro primeras a «No» y Pérdida de peso sin tocar: sin el quinto ítem la puntuación
  // podría ser 0 (robusto) o 1 (pre-frágil), así que la app no puede elegir por el usuario.
  await abrir(page);
  for (const id of IDS.slice(0, 4)) await opcion(page, id, 'no').click();
  await expect(contador(page)).toHaveText('4 de 5 preguntas respondidas');
  await botonEvaluar(page).click();

  await expect(veredicto(page)).toHaveCount(0);
  const aviso = page.locator('[class*="avisoIncompleto"]');
  await expect(aviso).toHaveAttribute('role', 'alert');
  await expect(aviso).toContainText('Pérdida de peso');
  await expect(aviso).not.toContainText('Fatiga');

  // Responder la que falta retira el aviso.
  await opcion(page, 'peso', 'no').click();
  await expect(aviso).toHaveCount(0);
});

test('CASO 13 — los radios se manejan con el teclado', async ({ page }) => {
  // El cambio sustituyó la casilla por dos radios nativos con el mismo `name`: Espacio marca,
  // las flechas mueven dentro del grupo y Tab salta al grupo siguiente.
  await abrir(page);
  await opcion(page, 'fatiga', 'si').focus();
  await page.keyboard.press('Space');
  await expect(opcion(page, 'fatiga', 'si')).toBeChecked();
  await page.keyboard.press('ArrowRight');
  await expect(opcion(page, 'fatiga', 'no')).toBeChecked();
  await expect(contador(page)).toHaveText('1 de 5 preguntas respondidas');
  await page.keyboard.press('Tab');
  await expect(opcion(page, 'resistencia', 'si')).toBeFocused();
});

// Medido el 16/11/2026, con la opacidad 0,85 de `.nivelSalvedad` (texto de 13,12 px, así que el
// mínimo es 4,5:1): oscuro 6,98 · 6,35 · 6,36; claro en Frágil, 4,74. Robusto y Pre-frágil en
// claro NO llegaban: hallazgo 4864, REPARADO quitando la opacidad.
test('CASO 14 — la salvedad del veredicto se lee en oscuro, en los tres niveles', async ({ page }) => {
  await abrirConTema(page, 'dark');
  for (const nivel of Object.values(RESPUESTAS_POR_NIVEL)) {
    await responderTodo(page, nivel.conSi);
    await botonEvaluar(page).click();
    await expect(veredicto(page)).toContainText(nivel.titulo);
    expect(await contrasteConOpacidad(salvedad(page)), `oscuro · ${nivel.titulo}`).toBeGreaterThanOrEqual(4.5);
  }
});

test('CASO 14 bis — la salvedad del veredicto se lee en claro en «Frágil»', async ({ page }) => {
  await abrirConTema(page, 'light');
  await responderTodo(page, RESPUESTAS_POR_NIVEL.fragil.conSi);
  await botonEvaluar(page).click();
  await expect(veredicto(page)).toContainText(RESPUESTAS_POR_NIVEL.fragil.titulo);
  expect(await contrasteConOpacidad(salvedad(page))).toBeGreaterThanOrEqual(4.5);
});

test.describe('CASO 15 — en móvil', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('el aviso médico se ve sin plegar, nada desborda y el cuestionario se contesta a toques', async ({
    page,
  }) => {
    // Riesgo 1: el aviso crítico no puede quedar plegado tampoco en un móvil de 360 px, y los
    // radios Sí/No (39 × 62 px medidos) tienen que poder pulsarse con el dedo.
    await abrir(page);
    const aviso = page.getByRole('note', { name: 'Aviso importante' });
    await expect(aviso).toBeVisible();
    await expect(aviso.locator('button[aria-expanded]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);

    for (const id of IDS) await opcion(page, id, id === 'fatiga' || id === 'peso' ? 'si' : 'no').tap();
    await expect(contador(page)).toHaveText('Las 5 preguntas respondidas · 2 con «Sí»');
    await botonEvaluar(page).tap();
    await expect(veredicto(page)).toContainText('Pre-frágil — Riesgo moderado');
    await expect(veredicto(page)).toContainText('No es un diagnóstico');
  });
});

// ── Hallazgos de la re-inspección del 16/11/2026 ──

test('REPARADO (hallazgo 4863) · cada grupo Sí/No se anunciaba sin su pregunta', async ({
  page,
}) => {
  // Antes del cambio la casilla llevaba `aria-label={item.pregunta}`; ahora el <fieldset> tiene
  // por <legend> solo el título («Resistencia») y los radios se llaman «Sí» y «No», sin
  // aria-describedby. Quien rellena el test con lector de pantalla y tabulador oye
  // «Resistencia, agrupación, Sí, botón de opción», sin «10 escalones», «100 metros», «5 de
  // estas enfermedades» ni «más del 5 % en el último año», que son los umbrales del ítem.
  // Esperado: la pregunta llega en el nombre o la descripción accesible del grupo o de sus
  // radios. Antes: grupo «Resistencia» sin descripción. Ahora el <fieldset> lleva
  // aria-describedby a la pregunta.
  await abrir(page);
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = (await cdp.send('Accessibility.getFullAXTree')) as {
    nodes: { role?: { value?: string }; name?: { value?: string }; description?: { value?: string } }[];
  };
  const anunciado = nodes
    .filter((n) => n.role?.value === 'group' || n.role?.value === 'radio')
    .map((n) => `${n.name?.value ?? ''} ${n.description?.value ?? ''}`)
    .join(' | ');
  for (const pregunta of Object.values(PREGUNTAS)) {
    expect(anunciado, `«${pregunta}» no llega al lector de pantalla`).toContain(pregunta);
  }
});

test('REPARADO (hallazgo 4864) · la salvedad del veredicto no llegaba a 4,5:1 en claro en Robusto y Pre-frágil', async ({
  page,
}) => {
  // `.nivelSalvedad` hereda el color de la caja (--verde-texto #136E35 / --naranja-texto
  // #B93E0B, que dan 5,93 y 5,30 sobre sus tintes) pero lleva `opacity: 0.85`, que compone el
  // texto al 85 % sobre el tinte. Medido el 16/11/2026: Robusto 4,35:1 (4,41 por píxel) y
  // Pre-frágil 4,12:1 (4,16 por píxel), con texto de 13,12 px que pide 4,5:1. Es el aviso
  // «No es un diagnóstico» que la reparación del hallazgo 897 puso ahí para que viajara con el
  // veredicto. check:semanticos-claro mide el color de la regla y no ve la opacidad. Reparado
  // quitando la opacidad (también la de .nivelDescripcion, en el filo con 4,498:1).
  await abrirConTema(page, 'light');
  for (const nivel of [RESPUESTAS_POR_NIVEL.robusto, RESPUESTAS_POR_NIVEL.prefragil]) {
    await responderTodo(page, nivel.conSi);
    await botonEvaluar(page).click();
    await expect(veredicto(page)).toContainText(nivel.titulo);
    expect(await contrasteConOpacidad(salvedad(page)), `claro · ${nivel.titulo}`).toBeGreaterThanOrEqual(4.5);
  }
});

test('REPARADO (hallazgo 4865) · el FAQPage seguía contando cualquier enfermedad crónica', async ({
  page,
}) => {
  // La reparación del hallazgo 893 cerró el ítem de enfermedades a la lista del instrumento en
  // la página («El recuento es solo sobre esta lista: hipertensión, diabetes, […] Ninguna otra
  // enfermedad cuenta para este ítem»), pero la respuesta del FAQPage —lo que leen buscadores
  // y asistentes— sigue diciendo «Illnesses (presencia de 5 o más enfermedades crónicas)».
  // Con cinco crónicas ajenas a la lista más Fatiga y Resistencia, el FAQPage da 3 → frágil y
  // la página 2 → pre-frágil. Ahora sale de la misma constante ENFERMEDADES_FRAIL.
  await page.goto(RUTA);
  const faq = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((ss) =>
      ss
        .map((s) => JSON.parse(s.textContent ?? '{}') as Record<string, unknown>)
        .find((x) => x['@type'] === 'FAQPage'),
    );
  const preguntas = (faq?.mainEntity ?? []) as { name: string; acceptedAnswer: { text: string } }[];
  const frail = preguntas.find((p) => p.name.includes('escala FRAIL'));
  expect(frail, 'el FAQPage tiene la pregunta sobre la escala FRAIL').toBeTruthy();
  // La lista cerrada tiene que estar dicha: al menos un miembro que no sea genérico y la idea
  // de que el recuento es sobre esa lista.
  expect(frail?.acceptedAnswer.text ?? '').toMatch(/hipertensión/);
  expect(frail?.acceptedAnswer.text ?? '').toMatch(/lista|\b11\b/);
});

test('REPARADO (hallazgo 4866) · «Faltan 1 de 5 preguntas»: la concordancia fallaba con una sola', async ({
  page,
}) => {
  // El aviso se construye siempre en plural: con una sola sin responder dice «Faltan 1 de 5
  // preguntas por responder: Pérdida de peso.». Esperado en singular: «Falta 1 …» (o «Falta
  // una …»).
  await abrir(page);
  for (const id of IDS.slice(0, 4)) await opcion(page, id, 'no').click();
  await botonEvaluar(page).click();
  const aviso = page.locator('[class*="avisoIncompleto"]');
  await expect(aviso).toContainText('Pérdida de peso');
  await expect(aviso).toHaveText(/^Falta (1|una)\b/);
});

test('REPARADO (hallazgo 4867) · «unos 3,5 kg en una persona de 70» no decía 70 qué', async ({
  page,
}) => {
  // En un test para mayores, «una persona de 70» se lee como edad, y el 5 % depende del PESO:
  // es justo la confusión que el párrafo quiere deshacer frente a los 4,5 kg fijos de Fried.
  // La ayuda del propio ítem lo dice bien: «más de 3,5 kg si se pesa 70 kg» (5 % de 70 kg).
  await abrir(page);
  await page.getByRole('button', { name: /Ver guía|guía educativa/i }).first().click();
  const parrafo = page.getByText(/unos 3,5 kg/).first();
  await expect(parrafo).toContainText(/70 kg/);
});

// ═══════════════════════════════════════════════════════════════════════════
// CABO C0787 (modo cabo, 17/11/2026) — el umbral de Fried «con independencia del peso»
// ═══════════════════════════════════════════════════════════════════════════
//
// LO QUE SE COMPROBÓ
//   · Dónde sale: SOLO en la caja «Errores frecuentes ante la fragilidad» del bloque educativo
//     (page.tsx, 4.º <li> de la lista de avisos). No está en la FAQ visible ni en el FAQPage, y
//     el JSON-LD WebApplication solo nombra «criterios de Fried» en `featureList`.
//   · Qué decide: nada del resultado. El motor (`calcularFragilidad`) no aplica Fried: suma los
//     «Sí» de los cinco ítems FRAIL, y el de peso pregunta por «más del 5%» del peso en el último
//     año (CASO 6). La frase es informativa y coherente con ese 5 %.
//   · La fuente: Fried et al. (2001), J Gerontol A Biol Sci Med Sci 56(3):M146-56, sigue sin poder
//     leerse. Ni la revista, ni PubMed, ni el Documento de consenso del Ministerio de Sanidad
//     (2014) están en la red de fuentes del Inspector; el buscador del BOE rechaza la consulta
//     por URL («Los valores de búsqueda enviados son incorrectos») y el de la OMS se pinta en el
//     cliente y no devuelve resultados. Así que no se pudo comprobar si el criterio original lleva
//     también un umbral relativo al peso (un porcentaje), que es justo lo que la frase niega.
test('REPARADO (hallazgo 4934, cabo C0787) · «con independencia del peso de partida» no se puede anclar a una fuente accesible', async ({
  page,
}) => {
  // REPARADO 17/11/2026: la frase se queda en que Fried es otra escala y de ahí viene la cifra.
  // Antes: la frase afirmaba en absoluto que Fried fija 4,5 kg «con independencia del peso de
  // partida», y no hay fuente accesible que lo sostenga (criterio C0203: lo que no se puede
  // anclar se matiza o se retira). Esperado: la frase sin esa afirmación absoluta, que se quede
  // en que Fried es otra escala y de ahí viene la cifra de 4,5 kg. Si la reparación prefiere
  // ANCLARLA a una fuente que pueda leerse y citarse en la página, esta aserción se cambia por
  // la cita, no se borra.
  await abrir(page);
  await page.getByRole('button', { name: /Ver guía|guía educativa/i }).first().click();

  // La caja existe y está a la vista: sin esto, el toHaveCount(0) de abajo pasaría en verde con
  // la página sin cargar.
  await expect(page.getByText('Errores frecuentes ante la fragilidad', { exact: true })).toBeVisible();
  const aviso = page.getByRole('listitem').filter({ hasText: 'No informar al médico de la pérdida de peso' });
  await expect(aviso).toBeVisible();
  await expect(aviso).toContainText('el umbral que usa este test');

  await expect(page.getByText(/con independencia del peso de partida/)).toHaveCount(0);
  await expect(aviso).toContainText('Los criterios de Fried son otra escala, y de ellos viene la cifra de 4,5 kg');
});
