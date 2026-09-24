import { test, expect, Page } from '@playwright/test';

/**
 * Asesor de Mascota (selector-mascota) — generado por /inspector el 24/09/2026
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Asesor de Mascota» y el subtítulo «10 preguntas para saber qué mascota se
 *   adapta a tu vida real». La intro promete «tipo de mascota recomendada con perfil concreto»,
 *   «coste inicial y mensual orientativo» y «pros y contras adaptados a tu situación»; la
 *   metadata anuncia perro, gato, roedor, pez, PÁJARO o reptil.
 *
 * EL MOTOR
 *   `calcularResultado()` de `app/selector-mascota/page.tsx` suma pesos por respuesta a ocho
 *   candidatas y se queda con la primera tras ordenar de mayor a menor. `Array.sort` es estable,
 *   así que un EMPATE lo gana la que se declaró antes en el objeto de puntos:
 *   perro-pequeño, perro-mediano, perro-grande, gato, roedor, pez, pájaro, reptil.
 *   La puntuación no se muestra; solo el nombre de la ganadora y sus fichas.
 *
 *   Enumeradas las 589.824 combinaciones posibles de respuestas con una réplica del motor:
 *     · el pájaro NO gana en ninguna (su mejor margen es 0: empate a cuatro que pierde por orden);
 *     · con «Alergia al pelo animal» sale perro o gato en 28.841 de 147.456 perfiles (19,6 %);
 *     · con «Menos de 30 €/mes» sale un perro en 13.389 perfiles, con ficha de 80 – 200 €/mes.
 *
 * CASOS
 *   1) normal       — perfil de jornada completa en piso normal → Gato (11 puntos).
 *   2) límite       — el perfil más restrictivo (mínimo tiempo, viajes, piso < 50 m², alergia,
 *                     presupuesto mínimo) → Peces (20 puntos).
 *   3) incompleto   — sin responder no se avanza; al volver se conserva la respuesta.
 *   Los demás documentan hallazgos con test.fail(): pasan HOY porque el defecto existe y se
 *   pondrán en rojo («expected to fail») cuando se repare — entonces hay que quitar la marca.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Ayudantes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La app no tiene ningún <input>, así que `esperarHidratacion` de `_hidratacion.ts` (que
 * sondea el rastreador de valor de un input) no tiene testigo. El equivalente para una app de
 * solo botones es que React haya colgado sus props del botón de inicio: antes de eso, el clic
 * se pierde. Mismo criterio que `selector-smartphone.spec.ts`.
 */
async function esperarHidratacionBotones(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const boton = Array.from(document.querySelectorAll('button')).find((b) =>
        /Empezar el test/.test(b.textContent ?? ''),
      );
      if (!boton) return false;
      return Object.keys(boton).some(
        (k) => k.startsWith('__reactProps$') || k.startsWith('__reactFiber$'),
      );
    },
    null,
    { timeout: 20_000 },
  );
}

/** Las 10 respuestas de un perfil, cada una por un trozo ÚNICO del texto de su botón. */
type Perfil = readonly [string, string, string, string, string, string, string, string, string, string];

async function abrirTest(page: Page): Promise<void> {
  await page.goto('/selector-mascota/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
}

async function responder(page: Page, perfil: Perfil): Promise<void> {
  for (let i = 0; i < perfil.length; i++) {
    const opcion = page.locator('[role="radiogroup"] button', { hasText: perfil[i] });
    await expect(opcion, `P${i + 1}: «${perfil[i]}» debe casar con UNA opción`).toHaveCount(1);
    await opcion.click();
    await page
      .getByRole('button', { name: i === perfil.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' })
      .click();
  }
}

interface Ficha {
  mascota: string;
  inicial: string;
  mensual: string;
  vida: string;
  texto: string;
}

async function leerFicha(page: Page): Promise<Ficha> {
  await page.getByRole('heading', { name: 'Tu mascota ideal' }).waitFor();
  const [inicial, mensual, vida] = await page.locator('[class*="costeValor"]').allInnerTexts();
  return {
    mascota: (await page.locator('[class*="recomendacionValor"]').innerText()).trim(),
    inicial: inicial.trim(),
    mensual: mensual.trim(),
    vida: vida.trim(),
    texto: (await page.locator('[class*="consejosSection"]').innerText()).replace(/\s+/g, ' '),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Perfiles (los puntos, calculados a mano con la tabla de pesos de calcularResultado)
// ─────────────────────────────────────────────────────────────────────────────

// gato 3+3+2+0+0+0+1+2 = 11 · perro-pequeño 2+0+2+1+2+1 = 8 · perro-mediano 1+1+2 = 4 ·
// pez 2 · pájaro 1 · reptil 1 · perro-grande 0 · roedor 0. «300 – 1.000 €» y «80 – 180 €/mes»
// no suman nada a nadie. Ganador sin empate: Gato.
const NORMAL: Perfil = [
  'Bastante — 1-2 h', '6 – 10 horas', 'Piso normal', 'Moderado', 'No, solo adultos',
  'Sin restricciones', 'Compañía constante', 'Para toda la vida', '300 – 1.000 €', '80 – 180 €/mes',
];

// pez 3+3+2+2+4+2+1+3 = 20 · roedor 1+1+2+3+2+2 = 11 · reptil 2+2+1+3+1 = 9 ·
// gato −1+3+2−3+2+2 = 5 · pájaro 1+1+1 = 3 · perro-pequeño −3 · perro-mediano −3+1−1 = −3 ·
// perro-grande −3−3 = −6. Ganador: Peces, con 9 puntos de ventaja.
const RESTRICTIVO: Perfil = [
  'Mínimo — solo fines', 'Varios días seguidos', 'Piso pequeño', 'Sedentario', 'No, solo adultos',
  'Alergia al pelo', 'Presencia tranquila', 'ciclo de vida más corto', 'Lo mínimo', 'Menos de 30 €/mes',
];

// Alergia al pelo CONFIRMADA y todo lo demás de perfil perruno:
// perro-mediano 3+2+2+2+2−3+2+1+1 = 12 · perro-grande 3+2+3+2−3+2 = 9 · roedor 1+1+2 = 4 ·
// pez 4 · reptil 3 · gato 1+1−3+1+2 = 2 · pájaro 1 · perro-pequeño 2−3 = −1. Gana Perro mediano.
const ALERGICO_ACTIVO: Perfil = [
  'Mucho — más de 2 h', 'Casi nunca está vacía', 'Casa con jardín', 'Muy activo', 'Sí, de 5 a 12 años',
  'Alergia al pelo', 'Juego e interacción', 'Varios años con posibilidad', 'Lo mínimo', 'Más de 180 €/mes',
];

// «Menos de 30 €/mes»: perro-mediano 3+2+2+2+2+1−1 = 11 · perro-grande 3+2+3+2−3 = 7 ·
// gato 1+1+2+2 = 6 · perro-pequeño 2+2+1 = 5 · roedor 2+2 = 4 · pez 3. Gana Perro mediano,
// cuya ficha dice 100 – 200 €/mes.
const ACTIVO_SIN_DINERO: Perfil = [
  'Mucho — más de 2 h', 'Casi nunca está vacía', 'Casa con jardín', 'Muy activo', 'No, solo adultos',
  'Sin restricciones', 'Compañía constante', 'Para toda la vida', 'Lo mínimo', 'Menos de 30 €/mes',
];

// «Poco — menos de 1 h» + «Sedentario»: perro-mediano 2+2+1+2+1 = 8 · gato 3+2+1+1 = 7 ·
// pez 2+2+2+1 = 7 · perro-grande 2+3−2−1+2 = 4. Gana Perro mediano por 1.
const SEDENTARIO: Perfil = [
  'Poco — menos de 1 h', 'Casi nunca está vacía', 'Casa con jardín', 'Sedentario', 'Sí, menores de 5 años',
  'La comunidad restringe', 'Compañía constante', 'Varios años con posibilidad', 'Hasta 300 €', 'Más de 180 €/mes',
];

// El mejor perfil posible para el pájaro (búsqueda exhaustiva): EMPATE A CUATRO en 4 puntos —
// perro-mediano 3+2+1+1−3 = 4 · pez 4 · pájaro 1+1+2 = 4 · reptil −2+3+3 = 4 — que gana
// Perro mediano solo porque se declaró antes en el objeto de puntos.
const EMPATE_PAJARO: Perfil = [
  'Mucho — más de 2 h', 'Casi nunca está vacía', 'Piso normal', 'Moderado', 'Sí, menores de 5 años',
  'Alergia al pelo', 'Algo diferente', 'Varios años con posibilidad', '300 – 1.000 €', '30 – 80 €/mes',
];

const PERROS_Y_GATOS = ['Perro pequeño', 'Perro mediano', 'Perro grande', 'Gato'];

// ─────────────────────────────────────────────────────────────────────────────
// 1. CASO NORMAL
// ─────────────────────────────────────────────────────────────────────────────

test('caso normal: jornada completa fuera, piso normal y compañía → Gato con sus fichas', async ({ page }) => {
  await abrirTest(page);
  await responder(page, NORMAL);
  const ficha = await leerFicha(page);

  // Gato 11 frente a perro pequeño 8 (cuentas en la constante NORMAL).
  expect(ficha.mascota).toBe('Gato');
  // Fichas literales de MASCOTAS.gato en page.tsx.
  expect(ficha.inicial).toBe('100 – 1.500 €');
  expect(ficha.mensual).toBe('50 – 120 €');
  expect(ficha.vida).toBe('12 – 20 años');
  // Respondió «Piso normal (50-80 m²)»: sale la razón del espacio.
  expect(ficha.texto).toContain('Tu espacio es ideal para un gato');
  // La razón repite las cifras de la ficha, y deben coincidir.
  expect(ficha.texto).toContain('Coste mensual estimado para Gato: 50 – 120 €. Esperanza de vida: 12 – 20 años.');
  // El consejo específico de gato, no los de perro.
  expect(ficha.texto).toContain('entre 100 y 250 €');
  expect(ficha.texto).not.toContain('licencia PPP');
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CASO LÍMITE — el perfil más restrictivo
// ─────────────────────────────────────────────────────────────────────────────

test('caso límite: sin tiempo, viajes, piso < 50 m², alergia y presupuesto mínimo → Peces', async ({ page }) => {
  await abrirTest(page);
  await responder(page, RESTRICTIVO);
  const ficha = await leerFicha(page);

  // Peces 20 frente a roedor 11 (cuentas en la constante RESTRICTIVO).
  expect(ficha.mascota).toBe('Peces');
  expect(ficha.inicial).toBe('50 – 500 €');
  expect(ficha.mensual).toBe('10 – 30 €'); // cabe en «Menos de 30 €/mes»
  expect(ficha.vida).toBe('1 – 15 años (según especie)');
  expect(ficha.texto).toContain('los peces son la opción más compatible');
  // Nada de pelo para quien declaró alergia.
  expect(PERROS_Y_GATOS).not.toContain(ficha.mascota);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. CASO INCOMPLETO — sin respuesta no se avanza
// ─────────────────────────────────────────────────────────────────────────────

test('caso incompleto: sin responder no se puede avanzar, y volver atrás conserva la respuesta', async ({ page }) => {
  await abrirTest(page);
  const siguiente = page.getByRole('button', { name: 'Siguiente pregunta' });
  const anterior = page.getByRole('button', { name: 'Pregunta anterior' });

  await expect(siguiente).toBeDisabled();
  await expect(anterior).toBeDisabled();

  await page.locator('[role="radiogroup"] button', { hasText: 'Poco — menos de 1 h' }).click();
  await expect(siguiente).toBeEnabled();
  await siguiente.click();

  // Pregunta 2 sin responder: de nuevo bloqueado; nunca se llega al resultado.
  await expect(page.getByText('Pregunta 2 de 10').first()).toBeVisible();
  await expect(siguiente).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Tu mascota ideal' })).toHaveCount(0);

  await anterior.click();
  await expect(page.getByText('Pregunta 1 de 10').first()).toBeVisible();
  await expect(page.locator('[role="radiogroup"] [aria-pressed="true"]')).toHaveText(/Poco — menos de 1 h/);
  await expect(siguiente).toBeEnabled();
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. HALLAZGOS DEL MOTOR (test.fail: el defecto existe hoy)
// ─────────────────────────────────────────────────────────────────────────────

test('hallazgo: con alergia al pelo confirmada no debería recomendarse un perro', async ({ page }) => {
  // HOY: Perro mediano (12 puntos). La alergia resta 3 a perros y gato, pero el resto del
  // perfil suma más, y la ficha no menciona la alergia. Al repararlo, quitar test.fail().
  test.fail();
  await abrirTest(page);
  await responder(page, ALERGICO_ACTIVO);
  const ficha = await leerFicha(page);
  expect(PERROS_Y_GATOS).not.toContain(ficha.mascota);
});

test('hallazgo: con menos de 30 €/mes la ficha recomendada no debería costar 100 – 200 €/mes', async ({ page }) => {
  // HOY: Perro mediano, «Coste mensual 100 – 200 €», sin una línea sobre el desfase con el
  // presupuesto declarado. Al repararlo, quitar test.fail().
  test.fail();
  await abrirTest(page);
  await responder(page, ACTIVO_SIN_DINERO);
  const ficha = await leerFicha(page);
  expect(ficha.mensual).not.toBe('100 – 200 €');
});

test('hallazgo: a quien se declara sedentario y con poco tiempo no se le atribuye un «perfil activo»', async ({ page }) => {
  // HOY: Perro mediano (8 frente a 7) y la razón fija «Tu perfil activo y el tiempo que puedes
  // dedicarle…», que contradice «Poco — menos de 1 h» y «Sedentario». Al repararlo, quitar test.fail().
  test.fail();
  await abrirTest(page);
  await responder(page, SEDENTARIO);
  const ficha = await leerFicha(page);
  expect(ficha.mascota).toBe('Perro mediano');
  expect(ficha.texto).not.toContain('Tu perfil activo y el tiempo que puedes dedicarle');
});

test('hallazgo: un empate se resuelve en silencio por el orden del código (el pájaro nunca gana)', async ({ page }) => {
  // HOY: empate a cuatro en 4 puntos (perro mediano, peces, pájaro, reptil) y sale Perro
  // mediano sin mencionar el empate — a alguien con alergia al pelo. Es el mejor perfil
  // posible para el pájaro: en las 589.824 combinaciones no gana nunca. Al repararlo
  // (desempate explícito o aviso), quitar test.fail().
  test.fail();
  await abrirTest(page);
  await responder(page, EMPATE_PAJARO);
  const ficha = await leerFicha(page);
  expect(ficha.mascota).not.toBe('Perro mediano');
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. HALLAZGOS DE CONTENIDO Y ACCESIBILIDAD
// ─────────────────────────────────────────────────────────────────────────────

test('hallazgo: la guía cita bien la ley y no afirma lo contrario sobre mascotas en alquiler', async ({ page }) => {
  // HOY dice «Ley de Bienestar Animal (5/2023)» — es la Ley 7/2023, de 28 de marzo (BOE-A-2023-7936) —,
  // «esterilización obligatoria de perros y gatos» — el art. 26.i solo la impone a gatos —,
  // «abandono con penas de hasta 18 meses de prisión» — el art. 340 ter CP (LO 3/2023) castiga
  // el abandono con multa de 1 a 6 meses; los 18 meses son del maltrato —, y que «el propietario
  // no puede prohibir mascotas de compañía en contratos nuevos», cuando la LAU no lo impide y la
  // cláusula expresa es válida. Al repararlo, quitar test.fail().
  test.fail();
  await abrirTest(page);
  await responder(page, NORMAL);
  await leerFicha(page);
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const cuerpo = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  expect(cuerpo).not.toContain('(5/2023)');
  expect(cuerpo).not.toContain('esterilización obligatoria de perros y gatos');
  expect(cuerpo).not.toContain('abandono con penas de hasta 18 meses de prisión');
  expect(cuerpo).not.toContain('el propietario no puede prohibir mascotas');
});

test('hallazgo: el grupo de opciones tiene radios de verdad dentro', async ({ page }) => {
  // HOY: role="radiogroup" con cuatro <button aria-pressed> y ningún role="radio"; la elección
  // es única entre cuatro, no un conmutador (mismo defecto que selector-smartphone, hallazgo 950).
  test.fail();
  await abrirTest(page);
  const grupo = page.locator('[role="radiogroup"]').first();
  await expect(grupo.locator('[role="radio"]')).toHaveCount(4, { timeout: 1000 });
});

test('hallazgo: la barra de progreso anuncia lo mismo que pinta', async ({ page }) => {
  // HOY: en la pregunta 1 anuncia aria-valuenow=1 de 10 (10 %) y pinta un relleno de 0 %
  // (width = paso / total). Mismo desfase que selector-smartphone, hallazgo 951.
  test.fail();
  await abrirTest(page);
  const barra = page.locator('[role="progressbar"]');
  const anunciado = Number(await barra.getAttribute('aria-valuenow')) / Number(await barra.getAttribute('aria-valuemax'));
  const pintado = parseFloat(
    await page.locator('[class*="progresoRelleno"]').evaluate((e) => (e as HTMLElement).style.width),
  ) / 100;
  expect(anunciado).toBeCloseTo(pintado, 6);
});

test('hallazgo: los costes en euros declaran su ámbito geográfico', async ({ page }) => {
  // HOY: todas las fichas en €, guía «elegir mascota en España» y licencia PPP, sin
  // <RegionBadge variant="es-data" /> (CLAUDE.md §1.bis). Al repararlo, quitar test.fail().
  test.fail();
  await page.goto('/selector-mascota/');
  await esperarHidratacionBotones(page);
  await expect(page.getByText(/Datos de referencia: España/)).toBeVisible({ timeout: 1000 });
});
