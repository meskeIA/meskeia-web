import { test, expect, Page, devices } from '@playwright/test';
import { calcularResultado, MASCOTAS, TECHO_MENSUAL, type MascotaKey } from '../../app/selector-mascota/motor';

/**
 * Asesor de Mascota (selector-mascota) — generado por /inspector el 24/09/2026 y reescrito al
 * reparar sus 12 hallazgos (1332-1343) el mismo día.
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Asesor de Mascota» y el subtítulo «10 preguntas para saber qué mascota se
 *   adapta a tu vida real». La intro promete «tipo de mascota recomendada con perfil concreto»,
 *   «coste inicial y mensual orientativo» y «pros y contras adaptados a tu situación»; la
 *   metadata anuncia perro, gato, pequeño mamífero, pez, PÁJARO o reptil.
 *
 * EL MOTOR (app/selector-mascota/motor.ts)
 *   Suma pesos por respuesta a ocho candidatas (la tabla PESOS, la misma de antes salvo la
 *   resta por alergia). Después aplica como FILTRO lo que el usuario declara como límite:
 *     · alergia al pelo → fuera perros, gato y pequeños mamíferos;
 *     · niños menores de 5 años → fuera el reptil y el pequeño mamífero (CDC: reptiles no
 *       recomendados en hogares con niños pequeños; menores de 5 años, evitar el contacto con
 *       roedores; hallazgo 1441 del 24/09/2026, que amplió el filtro a los roedores);
 *     · presupuesto mensual → fuera todo animal cuyo coste mensual MÍNIMO no quede por debajo
 *       del techo del tramo (30 / 80 / 180 €, sin techo en «más de 180 €»; hallazgo 1438, que
 *       cambió «supere» por «no quede por debajo»).
 *   Los empates se deshacen por el vínculo buscado (P7), luego por el menor coste mensual
 *   mínimo y luego por el menor coste inicial mínimo, y se anuncian en pantalla.
 *
 * Los casos del navegador llevan las cuentas hechas a mano con la tabla PESOS. Los del bloque
 * «motor» enumeran las 589.824 combinaciones de respuestas.
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

/**
 * Las opciones de la pregunta en pantalla: radios, o casillas en la pregunta 6, que admite varias
 * respuestas desde la reparación del hallazgo 2666 (02/10/2026).
 */
const OPCIONES_EN_PANTALLA = '[class*="opcionesGrid"] :is([role="radio"], [role="checkbox"])';
const MARCADAS_EN_PANTALLA = '[class*="opcionesGrid"] [aria-checked="true"]';

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
    const opcion = page.locator(OPCIONES_EN_PANTALLA, { hasText: perfil[i] });
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
  /** Todo el texto de la pantalla de resultado (sin la guía, que nace plegada). */
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
    texto: (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' '),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Perfiles (los puntos, calculados a mano con la tabla PESOS de motor.ts)
// ─────────────────────────────────────────────────────────────────────────────

// gato 3+3+2+0+0+0+1+2 = 11 · perro-pequeño 2+0+2+1+2+1 = 8 · perro-mediano 1+1+2 = 4 ·
// pez 2 · pájaro 1 · reptil 1 · perro-grande 0 · roedor 0. «300 – 1.000 €» y «80 – 180 €/mes»
// no suman nada a nadie, y con 180 € de techo el gato (50 €/mes mínimo) cabe. Ganador: Gato.
// Razones: las tres preguntas que más le suman — P1 (+3), P2 (+3) y P3 (+2; empata con P8,
// va antes por número de pregunta).
const NORMAL: Perfil = [
  'Bastante — 1-2 h', '6 – 10 horas', 'Piso normal', 'Moderado', 'No, solo adultos',
  'Sin restricciones', 'Compañía constante', 'Para toda la vida', '300 – 1.000 €', '80 – 180 €/mes',
];

// pez 3+3+2+2+4+2+1+3 = 20 · roedor 1+1+2+3+2+2 = 11 · reptil 2+2+1+3+1 = 9 (la alergia ya no
// resta a perros y gato: los descarta). Ganador: Peces, con 9 puntos de ventaja.
const RESTRICTIVO: Perfil = [
  'Mínimo — solo fines', 'Varios días seguidos', 'Piso pequeño', 'Sedentario', 'No, solo adultos',
  'Alergia al pelo', 'Presencia tranquila', 'ciclo de vida más corto', 'Lo mínimo', 'Menos de 30 €/mes',
];

// Alergia al pelo CONFIRMADA y todo lo demás de perfil perruno (hallazgo 1332):
// perro-mediano 3+2+2+2+2+2+1+1 = 15 gana por estilo de vida, pero tiene pelo. Sin pelo quedan
// pez 4, reptil 3 y pájaro 1 → Peces, y el aviso nombra al perro mediano y la alergia.
const ALERGICO_ACTIVO: Perfil = [
  'Mucho — más de 2 h', 'Casi nunca está vacía', 'Casa con jardín', 'Muy activo', 'Sí, de 5 a 12 años',
  'Alergia al pelo', 'Juego e interacción', 'Varios años con posibilidad', 'Lo mínimo', 'Más de 180 €/mes',
];

// El mismo perfil SIN alergia: gana Perro mediano (15), y con «Lo mínimo (adopción…)» el coste
// inicial debe ser el de adoptar, no el de compra 300 – 1.500 € (hallazgo 1339).
const ACTIVO_ADOPTA: Perfil = [
  'Mucho — más de 2 h', 'Casi nunca está vacía', 'Casa con jardín', 'Muy activo', 'Sí, de 5 a 12 años',
  'Sin restricciones', 'Juego e interacción', 'Varios años con posibilidad', 'Lo mínimo', 'Más de 180 €/mes',
];

// «Menos de 30 €/mes» (hallazgo 1333): perro-mediano 3+2+2+2+2+1−1 = 11 gana por estilo de
// vida, pero su mínimo es 100 €/mes. Caben pez (10), pequeño mamífero (15), pájaro (20) y
// reptil (20): roedor 2+2 = 4 · pez 3 · pájaro 1 · reptil 1 → Pequeño mamífero, 15 – 40 €.
const ACTIVO_SIN_DINERO: Perfil = [
  'Mucho — más de 2 h', 'Casi nunca está vacía', 'Casa con jardín', 'Muy activo', 'No, solo adultos',
  'Sin restricciones', 'Compañía constante', 'Para toda la vida', 'Lo mínimo', 'Menos de 30 €/mes',
];

// «Poco — menos de 1 h» + «Sedentario» (hallazgo 1335): perro-mediano 2+2+1+2+1 = 8 · gato
// 3+2+1+1 = 7 · pez 2+2+2+1 = 7. Gana Perro mediano por 1, y su ficha ya no puede decir
// «perfil activo»: debe decir lo que juega en contra (poco tiempo, sedentario).
const SEDENTARIO: Perfil = [
  'Poco — menos de 1 h', 'Casi nunca está vacía', 'Casa con jardín', 'Sedentario', 'Sí, menores de 5 años',
  'La comunidad restringe', 'Compañía constante', 'Varios años con posibilidad', 'Hasta 300 €', 'Más de 180 €/mes',
];

// El antiguo mejor perfil del pájaro (hallazgo 1334): empate a 4 entre perro-mediano, pez,
// pájaro y reptil que ganaba el perro por el orden del código. Ahora: perro-mediano fuera por
// la alergia, reptil fuera por los niños menores de 5 años, y pez 4 = pájaro 4 lo deshace el
// vínculo buscado («Algo diferente»: pájaro +2, pez 0) → Pájaro, con el empate anunciado.
const EMPATE_PAJARO: Perfil = [
  'Mucho — más de 2 h', 'Casi nunca está vacía', 'Piso normal', 'Moderado', 'Sí, menores de 5 años',
  'Alergia al pelo', 'Algo diferente', 'Varios años con posibilidad', '300 – 1.000 €', '30 – 80 €/mes',
];

// El caso del acta del hallazgo 1338: roedor 1+2+1+1+1+3+2+2 = 13 · pez 3+2+2+1+3 = 11 → Pequeño mamífero.
const CICLO_CORTO: Perfil = [
  'Mínimo — solo fines', '3 – 5 horas', 'Piso pequeño', 'Moderado', 'Sí, de 5 a 12 años',
  'La comunidad restringe', 'Juego e interacción', 'ciclo de vida más corto', 'Lo mínimo', 'Menos de 30 €/mes',
];

const CON_PELO = ['Perro pequeño', 'Perro mediano', 'Perro grande', 'Gato', 'Pequeño mamífero'];

// ─────────────────────────────────────────────────────────────────────────────
// 1. CASO NORMAL
// ─────────────────────────────────────────────────────────────────────────────

test('caso normal: jornada completa fuera, piso normal y compañía → Gato con sus fichas', async ({ page }) => {
  await abrirTest(page);
  await responder(page, NORMAL);
  const ficha = await leerFicha(page);

  expect(ficha.mascota).toBe('Gato');
  expect(ficha.inicial).toBe('100 – 1.500 €');
  expect(ficha.mensual).toBe('50 – 120 €');
  expect(ficha.vida).toBe('12 – 20 años');
  // Las razones citan las respuestas que más han sumado (P1, P2, P3).
  expect(ficha.texto).toContain('Con 1 – 2 horas al día cubres bien lo que necesita un gato.');
  expect(ficha.texto).toContain('La casa se queda vacía 6 – 10 horas: un gato lo tolera mejor que un perro.');
  expect(ficha.texto).toContain('Un piso de 50 – 80 m² es suficiente para un gato.');
  expect(ficha.texto).toContain('Coste mensual estimado para Gato: 50 – 120 €. Esperanza de vida: 12 – 20 años.');
  // El consejo específico de gato, con la obligación legal bien atribuida; no los de perro.
  expect(ficha.texto).toContain('Ley 7/2023, art. 26.i');
  expect(ficha.texto).not.toContain('licencia y seguro');
  // Sin recorte ni empate, no hay avisos.
  await expect(page.locator('[class*="avisoRecorte"]')).toHaveCount(0);
  await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CASO LÍMITE — el perfil más restrictivo
// ─────────────────────────────────────────────────────────────────────────────

test('caso límite: sin tiempo, viajes, piso < 50 m², alergia y presupuesto mínimo → Peces', async ({ page }) => {
  await abrirTest(page);
  await responder(page, RESTRICTIVO);
  const ficha = await leerFicha(page);

  expect(ficha.mascota).toBe('Peces');
  // Los peces no se adoptan: el coste inicial es el del acuario, y se dice.
  expect(ficha.inicial).toBe('50 – 500 €');
  expect(ficha.texto).toContain('el coste inicial es sobre todo la instalación (acuario)');
  expect(ficha.mensual).toBe('10 – 30 €'); // cabe en «Menos de 30 €/mes»
  expect(ficha.vida).toBe('1 – 15 años (según especie)');
  // Concordancia en plural.
  expect(ficha.texto).toContain('unos peces lo llevan mejor que otros animales');
  expect(ficha.texto).toContain('Has declarado alergia al pelo');
  expect(CON_PELO).not.toContain(ficha.mascota);
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

  await page.locator(OPCIONES_EN_PANTALLA, { hasText: 'Poco — menos de 1 h' }).click();
  await expect(siguiente).toBeEnabled();
  await siguiente.click();

  await expect(page.getByText('Pregunta 2 de 10').first()).toBeVisible();
  await expect(siguiente).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Tu mascota ideal' })).toHaveCount(0);

  await anterior.click();
  await expect(page.getByText('Pregunta 1 de 10').first()).toBeVisible();
  await expect(page.locator(MARCADAS_EN_PANTALLA)).toHaveText(/Poco — menos de 1 h/);
  await expect(siguiente).toBeEnabled();
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. REGRESIONES DEL MOTOR (hallazgos 1332-1335, 1338, 1339)
// ─────────────────────────────────────────────────────────────────────────────

test('1332: con alergia al pelo no se recomienda un animal con pelo, y se dice por qué', async ({ page }) => {
  await abrirTest(page);
  await responder(page, ALERGICO_ACTIVO);
  const ficha = await leerFicha(page);
  expect(ficha.mascota).toBe('Peces');
  const aviso = page.locator('[class*="avisoRecorte"]');
  await expect(aviso).toContainText('Por estilo de vida encajaría un perro mediano');
  await expect(aviso).toContainText('has declarado alergia al pelo');
});

test('1333: con menos de 30 €/mes la recomendación cabe en el presupuesto, y se dice', async ({ page }) => {
  await abrirTest(page);
  await responder(page, ACTIVO_SIN_DINERO);
  const ficha = await leerFicha(page);
  expect(ficha.mascota).toBe('Pequeño mamífero');
  expect(ficha.mensual).toBe('15 – 40 €');
  const aviso = page.locator('[class*="avisoRecorte"]');
  await expect(aviso).toContainText('Por estilo de vida encajaría un perro mediano');
  await expect(aviso).toContainText('(100 – 200 €) no cabe en tu presupuesto de menos de 30 €/mes');
  // Y avisa de que la parte alta de la horquilla (40 €) se sale del tramo.
  expect(ficha.texto).toContain('La parte alta de la horquilla de un pequeño mamífero (15 – 40 €) supera tu tramo');
});

test('1334: un empate se anuncia y se deshace por un criterio explícito (el pájaro puede ganar)', async ({ page }) => {
  await abrirTest(page);
  await responder(page, EMPATE_PAJARO);
  const ficha = await leerFicha(page);
  expect(ficha.mascota).toBe('Pájaro');
  const empate = page.locator('[class*="avisoEmpate"]');
  await expect(empate).toContainText('un pájaro y unos peces encajan exactamente igual');
  await expect(empate).toContainText('porque encaja mejor con el vínculo que buscas');
  // La alergia declarada no se olvida con un pájaro: las plumas también son alérgenos.
  expect(ficha.texto).toContain('Las plumas y el polvo que desprenden también son alérgenos');
  // El reptil empataba y ha caído por los niños menores de 5 años: se explica.
  expect(ficha.texto).toContain('se ha descartado el reptil');
});

test('1335: las razones salen de las respuestas, no de un texto fijo por animal', async ({ page }) => {
  await abrirTest(page);
  await responder(page, SEDENTARIO);
  const ficha = await leerFicha(page);
  expect(ficha.mascota).toBe('Perro mediano');
  expect(ficha.texto).not.toContain('Tu perfil activo');
  // A favor: las tres que más le suman (P2 +2, P3 +2, P7 +2).
  expect(ficha.texto).toContain('Casi siempre hay alguien en casa, y un perro mediano lo agradece');
  expect(ficha.texto).toContain('Tienes casa con jardín o patio');
  // En contra: lo que el usuario declaró y el perro no casa.
  expect(ficha.texto).toContain('Has dicho que tienes menos de una hora al día');
  expect(ficha.texto).toContain('Te declaras sedentario');
});

test('1338: la ficha de pequeños mamíferos no llama roedor al conejo y cubre la vida de la chinchilla', async ({ page }) => {
  await abrirTest(page);
  await responder(page, CICLO_CORTO);
  const ficha = await leerFicha(page);
  expect(ficha.mascota).toBe('Pequeño mamífero');
  // Chinchilla: hasta 20 años (Manual Veterinario Merck, «Chinchillas»).
  expect(ficha.vida).toBe('2 – 20 años (según especie)');
  expect(ficha.texto).toContain('conejo, que es un lagomorfo');
  // Pidió ciclo corto: se le dice qué especies lo son.
  expect(ficha.texto).toContain('Si buscas un ciclo corto, el hámster o la rata');
});

test('1339: con «Lo mínimo (adopción)» el coste inicial es el de adoptar, no el de compra', async ({ page }) => {
  await abrirTest(page);
  await responder(page, ACTIVO_ADOPTA);
  const ficha = await leerFicha(page);
  expect(ficha.mascota).toBe('Perro mediano');
  expect(ficha.inicial).toBe('Tasa de adopción');
  await expect(page.locator('[class*="costeNota"]')).toContainText('Comprando: 300 – 1.500 €.');
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. CONTENIDO Y ACCESIBILIDAD (hallazgos 1336, 1337, 1340-1343)
// ─────────────────────────────────────────────────────────────────────────────

test('1336 y 1337: la guía cita bien la Ley 7/2023, el Código Penal y la LAU', async ({ page }) => {
  await abrirTest(page);
  await responder(page, NORMAL);
  await leerFicha(page);
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const cuerpo = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  // Lo que decía y era falso.
  expect(cuerpo).not.toContain('(5/2023)');
  expect(cuerpo).not.toContain('esterilización obligatoria de perros y gatos');
  expect(cuerpo).not.toContain('abandono con penas de hasta 18 meses de prisión');
  expect(cuerpo).not.toContain('el propietario no puede prohibir mascotas');
  // Lo que dice ahora (BOE-A-2023-7936, art. 26.i y 26.d; art. 340 ter CP tras la LO 3/2023).
  expect(cuerpo).toContain('Ley 7/2023, de 28 de marzo');
  expect(cuerpo).toContain('esterilizarlos antes de los seis meses');
  expect(cuerpo).toContain('multa de uno a seis meses o trabajos en beneficio de la comunidad');
  expect(cuerpo).toContain('una cláusula del contrato que prohíba tener animales es válida');
});

test('1341: el grupo de opciones tiene radios de verdad dentro', async ({ page }) => {
  await abrirTest(page);
  const grupo = page.locator('[role="radiogroup"]').first();
  await expect(grupo.locator('[role="radio"]')).toHaveCount(4);
  await expect(grupo.locator('[aria-pressed]')).toHaveCount(0);
  await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(0);
  await grupo.locator('[role="radio"]').nth(2).click();
  await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(1);
});

test('1342: la barra de progreso anuncia lo mismo que pinta', async ({ page }) => {
  await abrirTest(page);
  const barra = page.locator('[role="progressbar"]');
  for (let paso = 0; paso < 2; paso++) {
    const anunciado = Number(await barra.getAttribute('aria-valuenow')) / Number(await barra.getAttribute('aria-valuemax'));
    const pintado = Number(await page.locator('[class*="progresoRelleno"]').getAttribute('data-progreso')) / 100;
    expect(anunciado).toBeCloseTo(pintado, 6);
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
  }
});

test('1340: los costes en euros declaran su ámbito geográfico', async ({ page }) => {
  await page.goto('/selector-mascota/');
  await esperarHidratacionBotones(page);
  await expect(page.getByText(/Datos de referencia: España/)).toBeVisible();
});

/** Contraste del color de texto de un elemento contra su fondo real (componiendo capas). */
async function contraste(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((el) => {
    const rgba = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const capas: number[][] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const [r, g, b, a = 1] = rgba(getComputedStyle(n).backgroundColor);
      if (a > 0) capas.push([r, g, b, a]);
      if (a >= 1) break;
    }
    let fondo = [255, 255, 255];
    for (const [r, g, b, a] of capas.reverse()) fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
    const texto = rgba(getComputedStyle(el).color);
    const [l1, l2] = [lum(texto), lum(fondo)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  });
}

test('1343: los textos pequeños de marca llegan a 4,5:1 en tema claro', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await abrirTest(page);
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
  expect(await contraste(page, '[class*="progresoPaso"]')).toBeGreaterThanOrEqual(4.5);
  await responder(page, NORMAL);
  await leerFicha(page);
  for (const clase of ['recomendacionPerfil', 'prosTitulo', 'contrasTitulo', 'costeValor']) {
    expect(await contraste(page, `[class*="${clase}"]`), clase).toBeGreaterThanOrEqual(4.5);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. EL MOTOR, SOBRE LAS 589.824 COMBINACIONES (sin navegador)
// ─────────────────────────────────────────────────────────────────────────────

test('motor: ninguna combinación rompe un límite declarado, y todo empate se explica', () => {
  const OPCIONES: string[][] = [
    ['mucho', 'medio', 'poco', 'minimo'], ['siempre', 'pocas', 'muchas', 'viajes'],
    ['jardin', 'piso_grande', 'piso_normal', 'piso_pequeno'], ['mucho', 'medio', 'poco'],
    ['si_pequenos', 'si_mayores', 'no', 'adolescentes'], ['alergia_pelo', 'comunidad', 'sin_ruido', 'ninguna'],
    ['compania', 'juego', 'tranquilidad', 'novedad'], ['largo', 'medio', 'corto'],
    ['minimo', 'bajo', 'medio', 'alto'], ['muy_bajo', 'bajo', 'medio', 'alto'],
  ];
  const victorias: Partial<Record<MascotaKey, number>> = {};
  let total = 0;
  const infracciones: string[] = [];
  const idx = new Array(10).fill(0);
  for (;;) {
    const r: Record<number, string> = {};
    OPCIONES.forEach((o, i) => { r[i + 1] = o[idx[i]]; });
    const res = calcularResultado(r);
    const info = MASCOTAS[res.mascota];
    total++;
    victorias[res.mascota] = (victorias[res.mascota] ?? 0) + 1;
    // Se anotan las infracciones y se afirma UNA vez al final: un `expect` por combinación
    // (tres millones) bloquea el worker durante decenas de minutos, y el timeout del test no
    // puede interrumpir un bucle síncrono.
    const clave = JSON.stringify(r);
    if (r[6] === 'alergia_pelo' && info.tienePelo) infracciones.push(`pelo con alergia: ${clave}`);
    if (r[5] === 'si_pequenos' && res.mascota === 'reptil') infracciones.push(`reptil con < 5 años: ${clave}`);
    // Desde la reparación del 1441 (24/09/2026), también el pequeño mamífero
    if (r[5] === 'si_pequenos' && res.mascota === 'roedor') infracciones.push(`roedor con < 5 años: ${clave}`);
    // Desde la reparación del 1438: el mínimo tiene que quedar POR DEBAJO del techo, no igualarlo
    if (info.costeMensualMin >= TECHO_MENSUAL[r[10]]) infracciones.push(`fuera de presupuesto: ${clave}`);
    if (res.empatadas.length > 0 && res.criterioDesempate === '') infracciones.push(`empate mudo: ${clave}`);
    if (res.razones.join(' ').includes('Tu perfil activo')) infracciones.push(`razón fija: ${clave}`);
    let i = 9;
    while (i >= 0 && ++idx[i] === OPCIONES[i].length) { idx[i] = 0; i--; }
    if (i < 0) break;
  }
  expect(total).toBe(589_824);
  expect(infracciones.slice(0, 5)).toEqual([]);
  expect(infracciones.length).toBe(0);
  // Las ocho fichas son alcanzables; el pájaro, que antes no ganaba nunca, también.
  for (const k of Object.keys(MASCOTAS) as MascotaKey[]) expect(victorias[k] ?? 0, k).toBeGreaterThan(0);
});

test('motor: el desempate por coste mensual cuando el vínculo no decide', () => {
  // Pez y gato empatan a 14 (tabla PESOS):
  //   gato: P1 poco 3 + P2 muchas 3 + P3 piso_pequeno 3 + P4 poco 2 + P6 sin_ruido 1 + P7 2 = 14
  //   pez:  P1 poco 2 + P2 muchas 2 + P3 piso_pequeno 2 + P4 poco 2 + P6 sin_ruido 3 + P7 2
  //         + P8 corto 1 = 14
  // Con «80 – 180 €/mes» caben los dos. El vínculo («Presencia tranquila») les suma +2 a ambos,
  // así que no decide; decide el coste mensual mínimo: peces 10 € frente a gato 50 €.
  const e = calcularResultado({ 1: 'poco', 2: 'muchas', 3: 'piso_pequeno', 4: 'poco', 5: 'no', 6: 'sin_ruido', 7: 'tranquilidad', 8: 'corto', 9: 'medio', 10: 'medio' });
  expect(e.puntos.gato).toBe(14);
  expect(e.puntos.pez).toBe(14);
  expect(e.mascota).toBe('pez');
  expect(e.empatadas).toEqual(['gato']);
  expect(e.criterioDesempate).toBe('se muestran primero unos peces porque su coste mensual mínimo es el más bajo');
});

// ─────────────────────────────────────────────────────────────────────────────
// SOSPECHA DEL INSPECTOR (24/09/2026), CONFIRMADA Y REPARADA el mismo día — §1.quinquies
// Cifras populares sin fuente en consejos, guía y FAQPage: «una operación puede costar entre
// 500 y 3.000 €» (consejo del perro), «entre 500 y 4.000 €» y «seguro desde ~15-25 €/mes»
// (guía), «esterilización entre 100 y 250 €» (consejo del gato), «entre 2 y 4 salidas al día» y
// «ansiedad si se quedan solos más de 6-8 horas» (FAQPage), y las horquillas de coste de las
// fichas presentadas como dato. Ninguna tenía fuente; las dos primeras ni coincidían entre sí.
// Ahora: las cifras de precio sin fuente se quitan (dependen del país y de la clínica); lo que
// queda cita la encuesta de la OCU de 05/04/2022 (1.131 €/año por perro, 986 € por gato; 45 % y
// 24 % de urgencias en el último año) o las guías de RSPCA y PDSA (no dejar al perro solo de
// forma habitual más de cuatro horas); y las horquillas de las fichas, que usa el filtro de
// presupuesto y por eso se quedan, se declaran estimación orientativa para España.
// ─────────────────────────────────────────────────────────────────────────────

const CIFRA_DE_PRECIO_SIN_FUENTE = /(entre|desde)\s+~?\d[\d.]*\s*(y|–|-)?\s*[\d.]*\s*€/;

test('sospecha §1.quinquies (motor): ningún consejo da un precio sin fuente', () => {
  const OPCIONES: string[][] = [
    ['mucho', 'medio', 'poco', 'minimo'], ['siempre', 'pocas', 'muchas', 'viajes'],
    ['jardin', 'piso_grande', 'piso_normal', 'piso_pequeno'], ['mucho', 'medio', 'poco'],
    ['si_pequenos', 'si_mayores', 'no', 'adolescentes'], ['alergia_pelo', 'comunidad', 'sin_ruido', 'ninguna'],
    ['compania', 'juego', 'tranquilidad', 'novedad'], ['largo', 'medio', 'corto'],
    ['minimo', 'bajo', 'medio', 'alto'], ['muy_bajo', 'bajo', 'medio', 'alto'],
  ];
  const consejos = new Set<string>();
  const ganadoras = new Set<MascotaKey>();
  const idx = new Array(10).fill(0);
  for (;;) {
    const r: Record<number, string> = {};
    OPCIONES.forEach((o, i) => { r[i + 1] = o[idx[i]]; });
    const res = calcularResultado(r);
    ganadoras.add(res.mascota);
    res.consejos.forEach((c) => consejos.add(c.texto));
    let k = 9;
    while (k >= 0 && ++idx[k] === OPCIONES[k].length) { idx[k] = 0; k--; }
    if (k < 0) break;
  }
  // Recorre de verdad los consejos del perro y del gato, que eran los que llevaban las cifras
  expect(ganadoras.has('gato')).toBe(true);
  expect([...ganadoras].some((m) => m.startsWith('perro'))).toBe(true);
  for (const c of consejos) expect(c, c).not.toMatch(CIFRA_DE_PRECIO_SIN_FUENTE);
  expect([...consejos].some((c) => c.includes('OCU (España, 2022)'))).toBe(true);
  for (const info of Object.values(MASCOTAS)) {
    for (const t of info.contras) expect(t).not.toMatch(/\d+\s*-\s*\d+\s*min/);
  }
});

test('sospecha §1.quinquies (app): guía, horquillas y FAQPage sin cifras populares sin fuente', async ({ page }) => {
  await abrirTest(page);
  await responder(page, NORMAL);
  await leerFicha(page);
  // Las horquillas de la ficha se declaran estimación, con la media medida por la OCU al lado
  await expect(page.locator('[class*="notaCostes"]')).toContainText('estimación de meskeIA, 2026');
  await expect(page.locator('[class*="notaCostes"]')).toContainText('1.131 € al año por perro');

  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const cuerpo = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  expect(cuerpo).not.toContain('entre 500 y 4.000 €');
  expect(cuerpo).not.toContain('15-25 €/mes');
  expect(cuerpo).not.toContain('entre 100 y 250 €');
  expect(cuerpo).not.toContain('entre 500 y 3.000 €');
  expect(cuerpo).toContain('el 45 % de los dueños de perro y el 24 % de los de gato');

  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
  expect(ld).toContain('"FAQPage"');
  expect(ld).not.toContain('entre 2 y 4 salidas');
  expect(ld).not.toContain('6-8 horas');
  expect(ld).not.toContain('entre 80 y 280 €');
  expect(ld).toContain('RSPCA y la PDSA');
  expect(ld).toContain('OCU de 2022');
});

// ─────────────────────────────────────────────────────────────────────────────
// INSPECCIÓN 24/09/2026 — RE-INSPECCIÓN tras 934e57bc y 3de61f3c
//
// Los 12 hallazgos 1332-1343 siguen arreglados en el navegador: los cubren los tests de
// arriba, que se han vuelto a ejecutar en verde con los casos literales de sus actas. No se
// duplican aquí. Lo que sigue es lo que la reparación dejó a medias o no tocó.
//
// REPARADOS el 24/09/2026 (hallazgos 1437-1444): los test.fail() se han retirado. Cada test
// recorre su caso en el navegador (respuestas literales, puntos hechos a mano con la tabla
// PESOS de motor.ts) y después exige 0 perfiles afectados en las 589.824 combinaciones. Donde
// la reparación cambia la recomendación del caso de la ficha (1438, 1441), el test fija la
// nueva y lo dice; donde el caso de la ficha ya no reproducía el defecto con el motor reparado
// por otra vía (1437, 1443), se ha buscado otro perfil que sí lo reproducía con el motor viejo.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspección 24/09/2026 — re-inspección: lo que la reparación dejó a medias', () => {
  const OPCIONES_24: string[][] = [
    ['mucho', 'medio', 'poco', 'minimo'], ['siempre', 'pocas', 'muchas', 'viajes'],
    ['jardin', 'piso_grande', 'piso_normal', 'piso_pequeno'], ['mucho', 'medio', 'poco'],
    ['si_pequenos', 'si_mayores', 'no', 'adolescentes'], ['alergia_pelo', 'comunidad', 'sin_ruido', 'ninguna'],
    ['compania', 'juego', 'tranquilidad', 'novedad'], ['largo', 'medio', 'corto'],
    ['minimo', 'bajo', 'medio', 'alto'], ['muy_bajo', 'bajo', 'medio', 'alto'],
  ];
  const PERROS_24: MascotaKey[] = ['perro-pequeno', 'perro-mediano', 'perro-grande'];
  /** Esperanza de vida de 5 años o más en su ficha (todo menos peces y pequeños mamíferos). */
  const LONGEVOS: MascotaKey[] = [...PERROS_24, 'gato', 'reptil', 'pajaro'];

  interface Recuento {
    inicialFueraSinAviso: number;
    fronteraMensual: number;
    silencioPerroMudo: number;
    cortoLongevoMudo: number;
    roedorNinosSinCdc: number;
    criterioCosteFalso: number;
    razon35hPerro: number;
  }
  let cache: Recuento | null = null;

  /** Una sola pasada por las 589.824 combinaciones; se reutiliza dentro del worker. */
  function recontar(): Recuento {
    if (cache) return cache;
    const c: Recuento = {
      inicialFueraSinAviso: 0, fronteraMensual: 0, silencioPerroMudo: 0, cortoLongevoMudo: 0,
      roedorNinosSinCdc: 0, criterioCosteFalso: 0, razon35hPerro: 0,
    };
    const idx = new Array(10).fill(0);
    for (;;) {
      const r: Record<number, string> = {};
      OPCIONES_24.forEach((o, i) => { r[i + 1] = o[idx[i]]; });
      const res = calcularResultado(r);
      const m = res.mascota;
      const info = MASCOTAS[m];
      const textos = [...res.razones, ...res.aTenerEnCuenta];
      const techo = TECHO_MENSUAL[r[10]];

      if (r[9] === 'bajo' && res.costeInicial.valor === info.costeInicial && info.costeInicialMin > 300
        && !textos.some((t) => t.includes('300 €'))) c.inicialFueraSinAviso++;
      if (info.costeMensualMin >= techo
        && textos.some((t) => t.includes('puedes mantener') || t.startsWith('La parte alta de la horquilla'))) c.fronteraMensual++;
      if (r[6] === 'sin_ruido' && PERROS_24.includes(m) && !textos.some((t) => /ruido|ladr/i.test(t))) c.silencioPerroMudo++;
      if (r[8] === 'corto' && LONGEVOS.includes(m) && !res.aTenerEnCuenta.some((t) => /ciclo|corto|vida|viv/i.test(t))) c.cortoLongevoMudo++;
      if (r[5] === 'si_pequenos' && m === 'roedor' && !textos.some((t) => t.includes('CDC'))) c.roedorNinosSinCdc++;
      if (res.criterioDesempate.includes('coste mensual mínimo es el más bajo')
        && res.empatadas.some((k) => MASCOTAS[k].costeMensualMin <= info.costeMensualMin)) c.criterioCosteFalso++;
      if (res.razones.some((t) => t.startsWith('La casa se queda vacía 3 – 5 horas: un perro'))) c.razon35hPerro++;

      let i = 9;
      while (i >= 0 && ++idx[i] === OPCIONES_24[i].length) { idx[i] = 0; i--; }
      if (i < 0) break;
    }
    cache = c;
    return c;
  }

  /** Espera a que no quede ninguna transición CSS en marcha (el cambio de tema dura 0,3 s). */
  async function esperarSinTransiciones(page: Page): Promise<void> {
    await page.waitForFunction(() =>
      document.getAnimations().every((a) => !(a instanceof CSSTransition) || a.playState !== 'running'));
  }

  /**
   * Contraste del texto blanco de un elemento con fondo en degradado lineal de 135°, en el
   * punto del degradado MENOS favorable dentro de la caja real del texto (un Range, no la del
   * bloque). Si el fondo deja de ser un degradado, mide contra el color de fondo liso.
   */
  async function contrasteSobreDegradado(page: Page, contenedor: string, texto: string): Promise<number> {
    return page.evaluate(([selC, selT]) => {
      const caja = document.querySelector(selC) as HTMLElement;
      const el = (selT ? caja.querySelector(selT) : caja) as HTMLElement;
      const nums = (c: string) => c.split(',').map(Number);
      const cols = [...getComputedStyle(caja).backgroundImage.matchAll(/rgba?\(([^)]+)\)/g)].map((x) => nums(x[1]));
      const liso = (getComputedStyle(caja).backgroundColor.match(/[\d.]+/g) ?? []).map(Number);
      const [c0, c1] = cols.length >= 2 ? cols : [liso, liso];
      const lum = ([r, g, b]: number[]) => {
        const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const hb = caja.getBoundingClientRect();
      const rango = document.createRange();
      rango.selectNodeContents(el);
      const tb = rango.getBoundingClientRect();
      const L = (hb.width + hb.height) * Math.SQRT1_2;
      const cx = hb.left + hb.width / 2;
      const cy = hb.top + hb.height / 2;
      const t = Math.min(1, Math.max(0, ((tb.right - cx) + (tb.bottom - cy)) * Math.SQRT1_2 / L + 0.5));
      const fondo = c0.map((v, i) => v + (c1[i] - v) * t);
      const cs = getComputedStyle(el);
      const alfa = Number(cs.opacity) * Number(caja === el ? 1 : getComputedStyle(caja).opacity);
      const [tr, tg, tbl] = (cs.color.match(/[\d.]+/g) ?? []).map(Number);
      const color = [tr, tg, tbl].map((v, i) => v * alfa + fondo[i] * (1 - alfa));
      const [l1, l2] = [lum(color), lum(fondo)].sort((x, y) => y - x);
      return (l1 + 0.05) / (l2 + 0.05);
    }, [contenedor, texto] as const);
  }

  // Alergia + niños menores de 5 + menos de 30 €/mes: los tres filtros a la vez.
  // pez 2+2+2+2+4+2+1+3 = 18 · gato 3+3+3+2+2 = 13 (fuera, pelo) · pájaro 1+1+1+1+1 = 5 ·
  // roedor 2−1+1+2 = 4 (fuera, pelo) · reptil 1−2+3+1 = 3 (fuera, niños < 5).
  // La que gana por estilo de vida ya es la pez (18 > 13): no hay aviso de recorte, y el
  // reptil iba por detrás, así que tampoco se menciona su descarte.
  const LIMITE_TRES_FILTROS: Perfil = [
    'Poco — menos de 1 h', '6 – 10 horas', 'Piso pequeño', 'Sedentario', 'Sí, menores de 5 años',
    'Alergia al pelo', 'Presencia tranquila', 'Varios años con posibilidad', 'Hasta 300 €', 'Menos de 30 €/mes',
  ];

  test('caso límite: con los tres filtros a la vez sigue habiendo candidata (Peces) y no se inventa un aviso', async ({ page }) => {
    await abrirTest(page);
    await responder(page, LIMITE_TRES_FILTROS);
    const ficha = await leerFicha(page);
    expect(ficha.mascota).toBe('Peces');
    expect(ficha.mensual).toBe('10 – 30 €');
    expect(ficha.texto).toContain('Has declarado alergia al pelo');
    expect(ficha.texto).not.toContain('se ha descartado el reptil');
    await expect(page.locator('[class*="avisoRecorte"]')).toHaveCount(0);
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
  });

  test('1343 en tema oscuro: los textos pequeños del resultado llegan a 4,5:1 (y el título a 3:1)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/selector-mascota/');
    await esperarHidratacionBotones(page);
    // El conmutador real, no el atributo a mano
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: /Empezar el test/ }).click();
    await page.getByText('Pregunta 1 de 10').first().waitFor();
    await esperarSinTransiciones(page);
    expect(await contraste(page, '[class*="progresoPaso"]'), 'progresoPaso').toBeGreaterThanOrEqual(4.5);
    // Perfil con aviso de recorte y aviso de empate, para medir los dos
    await responder(page, [
      'Mucho — más de 2 h', 'Casi nunca está vacía', 'Casa con jardín', 'Muy activo', 'No, solo adultos',
      'Necesidad de silencio', 'Juego e interacción', 'ciclo de vida más corto', '300 – 1.000 €', '30 – 80 €/mes',
    ]);
    await leerFicha(page);
    await esperarSinTransiciones(page);
    for (const clase of ['recomendacionPerfil', 'prosTitulo', 'contrasTitulo', 'consejosTitulo', 'costeValor',
      'costeLabel', 'notaCostes', 'avisoRecorte', 'avisoEmpate']) {
      expect(await contraste(page, `[class*="${clase}"]`), clase).toBeGreaterThanOrEqual(4.5);
    }
    // 1,6rem en negrita es texto grande: 3:1
    expect(await contraste(page, '[class*="recomendacionValor"]'), 'recomendacionValor').toBeGreaterThanOrEqual(3);
  });

  // ── 1437: el presupuesto INICIAL no acotaba ni avisaba ────────────────────────
  // El caso de la ficha (… Hasta 300 € · 30 – 80 €/mes) ya no da perro pequeño: con el 1438
  // reparado, su mínimo (80 €) no queda por debajo de 80 y gana el gato. Se usa el mismo perfil
  // con «80 – 180 €/mes», donde el motor viejo enseñaba la compra de 500 – 2.000 € sin más:
  // P1 Mucho · P2 3 – 5 h · P3 Piso normal · P4 Moderado · P5 Sin niños · P6 Sin restricciones ·
  // P7 Compañía · P8 Toda la vida · P9 HASTA 300 € · P10 80 – 180 €/mes
  // perro-pequeño 2+1+2+1+2+1 = 9 · gato 1+1+2+1+2 = 7 · perro-mediano 3+1+2 = 6 → Perro pequeño
  // (80 € < 180). Su compra empieza en 500 €, por encima de 300: se enseña la tasa de adopción y
  // la nota nombra los 300 € declarados.
  test('1437: con «Hasta 300 €» no se enseña una compra de 500 – 2.000 € sin decirlo', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [
      'Mucho — más de 2 h', '3 – 5 horas', 'Piso normal', 'Moderado', 'No, solo adultos',
      'Sin restricciones', 'Compañía constante', 'Para toda la vida', 'Hasta 300 €', '80 – 180 €/mes',
    ]);
    const ficha = await leerFicha(page);
    expect(ficha.mascota).toBe('Perro pequeño');
    expect(ficha.inicial).toBe('Tasa de adopción');
    await expect(page.locator('[class*="costeNota"]')).toHaveText(
      'Comprar un perro pequeño cuesta 500 – 2.000 €, por encima de los 300 € que has indicado; la tasa de adopción la fija cada protectora y suele incluir chip y vacunas.',
    );
    // Motor viejo: 1.356 perfiles (perro pequeño 1.272 · perro grande 84)
    expect(recontar().inicialFueraSinAviso).toBe(0);
  });

  // ── 1438: la frontera del tramo mensual ──────────────────────────────────────
  // El caso literal de la ficha: P1 Mucho · P2 Casi nunca vacía · P3 Jardín · P4 Muy activo ·
  // P5 Niños < 5 · P6 Comunidad · P7 Compañía · P8 Varios años · P9 Hasta 300 € · P10 30 – 80 €/mes
  // perro-mediano 3+2+2+2+1+2 = 12 (fuera: 100 € no queda por debajo de 80) · perro-grande 5
  // (fuera: 150 €) · perro-pequeño 2+2+1 = 5 (fuera: su mínimo, 80 €, ES el techo) · gato
  // 1+1+1+1 = 4 (50 € < 80) · pez 2+1 = 3 → Gato. Antes: perro pequeño, «Con 30 – 80 €/mes puedes
  // mantener un perro pequeño». Ahora el gato, avisando de que su parte alta se sale del tramo.
  test('1438: un animal cuyo mínimo es el techo del tramo no «cabe», y se recomienda uno que sí', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [
      'Mucho — más de 2 h', 'Casi nunca está vacía', 'Casa con jardín', 'Muy activo', 'Sí, menores de 5 años',
      'La comunidad restringe', 'Compañía constante', 'Varios años con posibilidad', 'Hasta 300 €', '30 – 80 €/mes',
    ]);
    const ficha = await leerFicha(page);
    expect(ficha.mascota).toBe('Gato');
    expect(ficha.mensual).toBe('50 – 120 €');
    await expect(page.locator('[class*="avisoRecorte"]')).toContainText('encajaría un perro mediano');
    await expect(page.locator('[class*="avisoRecorte"]')).toContainText('(100 – 200 €) no cabe en tu presupuesto de 30 – 80 €/mes');
    expect(ficha.texto).not.toContain('Con 30 – 80 €/mes puedes mantener un perro pequeño');
    expect(ficha.texto).not.toContain('La parte alta de la horquilla de un perro pequeño (80 – 150 €)');
    expect(ficha.texto).toContain('La parte alta de la horquilla de un gato (50 – 120 €) supera tu tramo de 30 – 80 €/mes');
    // Motor viejo: 3.195 perfiles con el perro pequeño en «30 – 80 €/mes»
    expect(recontar().fronteraMensual).toBe(0);
  });

  // ── 1439: «Necesidad de silencio» y perro ────────────────────────────────────
  // P1 Mucho · P2 Casi nunca vacía · P3 Jardín · P4 Muy activo · P5 Niños 5-12 · P6 SILENCIO ·
  // P7 Juego · P8 Varios años · P9 Sin límite · P10 Más de 180 €/mes
  // perro-mediano 3+2+2+2+2+2+1 = 14 · perro-grande 3+2+3+2+2 = 12 → Perro mediano. Es una
  // preferencia (un perro puede ladrar o no), no una imposibilidad: se cita, no se filtra.
  test('1439: a quien necesita silencio, el perro se le recomienda mencionando los ladridos', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [
      'Mucho — más de 2 h', 'Casi nunca está vacía', 'Casa con jardín', 'Muy activo', 'Sí, de 5 a 12 años',
      'Necesidad de silencio', 'Juego e interacción', 'Varios años con posibilidad', 'Sin límite especial', 'Más de 180 €/mes',
    ]);
    const ficha = await leerFicha(page);
    expect(ficha.mascota).toBe('Perro mediano');
    expect(ficha.texto).toContain('Has indicado que necesitas silencio: un perro mediano puede ladrar, sobre todo cuando se queda solo o se aburre; el ejercicio diario y el adiestramiento lo reducen, pero no lo eliminan.');
    // Motor viejo: 15.866 perfiles (perro mediano 15.035 · grande 497 · pequeño 334)
    expect(recontar().silencioPerroMudo).toBe(0);
  });

  // ── 1440: «ciclo de vida más corto» y animal de 12 – 20 años ─────────────────
  // P1 Bastante · P2 6 – 10 h · P3 Piso normal · P4 Moderado · P5 Sin niños · P6 Sin restricciones ·
  // P7 Compañía · P8 CICLO CORTO · P9 300 – 1.000 € · P10 80 – 180 €/mes
  // gato 3+3+2+1 = 9 · perro-pequeño 2+2+1+2 = 7 → Gato, «12 – 20 años», y ahora lo dice.
  test('1440: a quien pide un ciclo de vida corto, el gato de 12 – 20 años se le recomienda diciéndolo', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [
      'Bastante — 1-2 h', '6 – 10 horas', 'Piso normal', 'Moderado', 'No, solo adultos',
      'Sin restricciones', 'Compañía constante', 'ciclo de vida más corto', '300 – 1.000 €', '80 – 180 €/mes',
    ]);
    const ficha = await leerFicha(page);
    expect(ficha.mascota).toBe('Gato');
    expect(ficha.vida).toBe('12 – 20 años');
    expect(ficha.texto).toContain('Prefieres un compromiso más corto, pero la esperanza de vida de un gato es de 12 – 20 años: es un compromiso de muchos años.');
    // Motor viejo: 75.333 perfiles (gato 50.485 · perro mediano 19.768 · reptil 3.088 · …)
    expect(recontar().cortoLongevoMudo).toBe(0);
  });

  // ── 1441: los CDC incluyen a los roedores en la recomendación sobre menores de 5 años ──
  // cdc.gov/healthy-pets/risk-factors: «CDC recommends that children under 5 years old avoid
  // contact with reptiles, amphibians, poultry (including chicks and ducklings), and rodents.»
  // El caso literal: P1 Mucho · P2 Casi nunca vacía · P3 Jardín · P4 Muy activo · P5 NIÑOS < 5 ·
  // P6 Comunidad · P7 Compañía · P8 Ciclo corto · P9 Lo mínimo · P10 Menos de 30 €/mes
  // perro-mediano 12 (fuera, 100 €/mes) · roedor −1+1+3+2+2 = 7 (fuera AHORA, CDC) ·
  // pez 2+1+3 = 6 → Peces. Antes: Pequeño mamífero con «Buena primera mascota para niños».
  // Como el pequeño mamífero sumaba más que los peces, el descarte se explica.
  test('1441: con niños menores de 5 años no se recomiendan roedores, y se cita a los CDC', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [
      'Mucho — más de 2 h', 'Casi nunca está vacía', 'Casa con jardín', 'Muy activo', 'Sí, menores de 5 años',
      'La comunidad restringe', 'Compañía constante', 'ciclo de vida más corto', 'Lo mínimo', 'Menos de 30 €/mes',
    ]);
    const ficha = await leerFicha(page);
    expect(ficha.mascota).toBe('Peces');
    expect(ficha.texto).toContain('Con niños menores de 5 años se ha descartado el pequeño mamífero: los CDC de Estados Unidos recomiendan que a esa edad eviten el contacto con roedores');
    await expect(page.locator('[class*="prosCard"]')).not.toContainText('Buena primera mascota para niños');
    // Motor viejo: 953 perfiles con niños < 5 años y pequeño mamífero, sin la advertencia
    expect(recontar().roedorNinosSinCdc).toBe(0);
    // Y el FAQPage, que es lo que leen las IA, ya no limita la advertencia a los reptiles
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    expect(ld).toContain('recomiendan que eviten el contacto con roedores');
  });

  // ── 1442: el criterio de desempate anunciado es el que decide ────────────────
  // P1 Mucho · P2 Casi nunca vacía · P3 Jardín · P4 Muy activo · P5 Sin niños · P6 Silencio ·
  // P7 Juego · P8 Ciclo corto · P9 300 – 1.000 € · P10 30 – 80 €/mes
  // gato 1+1+1+1 = 4 · roedor 1+3 = 4 · pez 3+1 = 4 (perros fuera por 80 €/mes). Vínculo «Juego»:
  // roedor +1, gato +1, pez 0 → los peces quedan detrás por el vínculo; entre roedor y gato
  // decide el coste mensual (15 € < 50 €). Los peces (10 €) cuestan menos que el roedor: el
  // superlativo «el más bajo» era falso; ahora cada criterio nombra a quien deja detrás.
  test('1442: el empate dice qué criterio deja detrás a cada empatada', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [
      'Mucho — más de 2 h', 'Casi nunca está vacía', 'Casa con jardín', 'Muy activo', 'No, solo adultos',
      'Necesidad de silencio', 'Juego e interacción', 'ciclo de vida más corto', '300 – 1.000 €', '30 – 80 €/mes',
    ]);
    const ficha = await leerFicha(page);
    expect(ficha.mascota).toBe('Pequeño mamífero');
    const empate = (await page.locator('[class*="avisoEmpate"]').innerText()).replace(/\s+/g, ' ');
    expect(empate).toContain('un pequeño mamífero, un gato y unos peces encajan exactamente igual; se muestra primero un pequeño mamífero porque encaja mejor que unos peces con el vínculo que buscas, y su coste mensual mínimo es más bajo que el de un gato.');
    expect(empate).not.toContain('es el más bajo');
    // Motor viejo: 506 perfiles de los 21.637 en que se anunciaba ese criterio
    expect(recontar().criterioCosteFalso).toBe(0);
  });

  // ── 1443: las 3 – 5 horas a solas no son una razón «a favor» de un perro ─────
  // El caso de la ficha ya no da perro con el 1438 reparado (30 – 80 €/mes aparta al perro
  // pequeño); este es uno de los perfiles en que el motor viejo SÍ daba la razón al perro:
  // P1 Mucho · P2 3 – 5 h · P3 Piso amplio · P4 Moderado · P5 Sin niños · P6 Comunidad ·
  // P7 Compañía · P8 Toda la vida · P9 Hasta 300 € · P10 80 – 180 €/mes
  // perro-pequeño 2+1+1+1+2+1 = 8 · perro-mediano 3+2+1+2 = 8 · gato 1+1+2+1+1+2 = 8. Empate a 8:
  // el vínculo (Compañía: pequeño 2 = mediano 2 > gato 1) deja detrás al gato, y el coste
  // mensual (80 € < 100 €) al mediano → Perro pequeño. Aportes: P1 +2, P7 +2 y, entre los +1,
  // P2 era el primero por número; ahora P2 no es razón a favor y sale P3. La recomendación de
  // RSPCA y PDSA (no dejarlo solo más de cuatro horas) va a «Lo que juega en contra».
  test('1443: con 3 – 5 horas fuera no se dice que un perro «lo lleva mejor que otras opciones»', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [
      'Mucho — más de 2 h', '3 – 5 horas', 'Piso amplio', 'Moderado', 'No, solo adultos',
      'La comunidad restringe', 'Compañía constante', 'Para toda la vida', 'Hasta 300 €', '80 – 180 €/mes',
    ]);
    const ficha = await leerFicha(page);
    expect(ficha.mascota).toBe('Perro pequeño');
    expect(ficha.texto).not.toContain('un perro pequeño lo lleva mejor que otras opciones');
    expect(ficha.texto).toContain('Un piso de más de 80 m² deja sitio de sobra para un perro pequeño.');
    expect(ficha.texto).toContain('La casa se queda vacía 3 – 5 horas: las guías de bienestar animal (RSPCA, PDSA) aconsejan no dejar a un perro solo más de cuatro horas seguidas, así que los días largos alguien tendrá que sacar a un perro pequeño.');
    await expect(page.locator('[class*="avisoEmpate"]')).toContainText(
      'se muestra primero un perro pequeño porque encaja mejor que un gato con el vínculo que buscas, y su coste mensual mínimo es más bajo que el de un perro mediano',
    );
    // Motor viejo: 1.134 perfiles
    expect(recontar().razon35hPerro).toBe(0);
  });

  // ── 1444 (de familia): hero de resultado y botones de avance ─────────────────
  // Antes: degradado --primary→--secondary con texto blanco; subtítulo 2,82 en claro y 2,19 en
  // oscuro, <h1> 2,45 en oscuro, «Empezar el test» 3,20 / 2,42 y «Siguiente» 3,26 / 2,44. Ahora
  // el hero usa var(--hero-bg) (#1a5278 en los dos temas) y los botones var(--primary-boton)
  // (#26718F en los dos temas). Se mide en claro y en oscuro con el conmutador real.
  test('1444: el hero del resultado y los botones de avance llegan al contraste mínimo en los dos temas', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/selector-mascota/');
    await esperarHidratacionBotones(page);
    const cambiarTema = async (a: 'oscuro' | 'claro') => {
      await page.getByRole('button', { name: a === 'oscuro' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro' }).click();
      if (a === 'oscuro') await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      else await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
      await esperarSinTransiciones(page);
    };
    const medir = async (tema: string) => {
      await esperarSinTransiciones(page);
      expect(await contrasteSobreDegradado(page, '[class*="btnStart"]', ''), `btnStart, ${tema}`).toBeGreaterThanOrEqual(4.5);
    };
    await medir('claro');
    await cambiarTema('oscuro');
    await medir('oscuro');
    await page.getByRole('button', { name: /Empezar el test/ }).click();
    await page.locator('[role="radio"]').first().click();
    await esperarSinTransiciones(page);
    expect(await contrasteSobreDegradado(page, '[class*="btnSiguiente"]', ''), 'btnSiguiente, oscuro').toBeGreaterThanOrEqual(4.5);
    await cambiarTema('claro');
    expect(await contrasteSobreDegradado(page, '[class*="btnSiguiente"]', ''), 'btnSiguiente, claro').toBeGreaterThanOrEqual(4.5);
    await responder(page, NORMAL);
    await leerFicha(page);
    await esperarSinTransiciones(page);
    const fondoHero = () => page.locator('[class*="heroResultados"]').evaluate((el) => [getComputedStyle(el).backgroundColor, getComputedStyle(el).backgroundImage]);
    for (const tema of ['claro', 'oscuro'] as const) {
      if (tema === 'oscuro') await cambiarTema('oscuro');
      expect(await fondoHero(), tema).toEqual(['rgb(26, 82, 120)', 'none']);
      // Subtítulo 1rem al 88 %: 4,5:1 · <h1> 2rem en negrita (texto grande): 3:1
      expect(await contrasteSobreDegradado(page, '[class*="heroResultados"]', 'p'), `heroSubtitleSm, ${tema}`).toBeGreaterThanOrEqual(4.5);
      expect(await contrasteSobreDegradado(page, '[class*="heroResultados"]', 'h1'), `heroTitleSm, ${tema}`).toBeGreaterThanOrEqual(3);
    }
  });

  // ── Familia (regla g): al pulsar «Ver resultado» el foco no cae a <body> ──
  test('familia g: tras «Ver resultado» el foco está en el título del resultado', async ({ page }) => {
    await abrirTest(page);
    await responder(page, NORMAL);
    await leerFicha(page);
    await expect(page.getByRole('heading', { name: 'Tu mascota ideal' })).toBeFocused();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DEL 02/10/2026 — hermana de la familia «selectores» (referencia: selector-smartphone)
// ═════════════════════════════════════════════════════════════════════════════
//
// Invalidada por los lotes de CSS 586a4d61 (27/09, móvil) y a1d72a9c (28/09, tableta), que dieron
// 80 px arriba al `.hero` para que la barra fija de MeskeiaLogo no tapara el título. El motor
// (motor.ts) no ha cambiado desde a3c2066c: las cuentas de abajo usan su tabla PESOS y se
// resolvieron a mano ANTES de abrir el navegador, cada una para el flujo de su propio test.
//
// Lo que la referencia ya tiene (b0f31109) y aquí no ha llegado: foco al enunciado tras «Empezar»
// y «Siguiente» (forma del 1680) y teclado de radios con tabindex itinerante (forma del 1681).
// Lo que solo existe en esta hermana: la pregunta 6, que mete en UNA elección única tres
// condiciones independientes (alergia, comunidad, silencio).
//
// Hallazgos que fija este bloque, REPARADOS el 02/10/2026 (2664-2673; se retiraron los test.fail):
//   · «La comunidad restringe ciertas mascotas» y sale un perro sin una palabra de la restricción;
//   · menos de 1 h al día y la casa vacía 6 – 10 h, y sale un perro como «Tu mascota ideal»;
//   · la pregunta 6 no deja declarar a la vez la alergia y la comunidad;
//   · foco a <body> tras «Empezar» y «Siguiente»; flechas sin efecto entre radios;
//   · el <h1> del resultado bajo el logo a 360 y 390 px (el lote solo tocó `.hero`);
//   · a 360 px, tras «Siguiente», el enunciado nuevo queda bajo la barra o fuera de la pantalla;
//   · a 412 px, doble toque en «Siguiente» de la pregunta 8 contesta la 9;
//   · emojis de los consejos leídos por el lector; porcentajes sin espacio duro.
// ─────────────────────────────────────────────────────────────────────────────

/** ¿Pisa alguna pieza de la barra fija del logo las letras del elemento? (la función de la Ronda) */
async function bajoLaBarraLogo(page: Page, selector: string): Promise<{ tapado: boolean; top: number; bottom: number; barra: number }> {
  return page.evaluate((sel) => {
    const barra = [...document.querySelectorAll('body *')].find((e) => {
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return cs.position === 'fixed' && r.top <= 1 && r.height < 120 && r.width > 300
        && !!e.querySelector('a[href="/"], a[href="https://meskeia.com/"]');
    });
    const el = document.querySelector(sel);
    if (!barra || !el) throw new Error(`sin barra (${!!barra}) o sin ${sel} (${!!el})`);
    const rango = document.createRange();
    rango.selectNodeContents(el);
    const letras = [...rango.getClientRects()].filter((c) => c.width > 0);
    const piezas = [...barra.children].map((c) => c.getBoundingClientRect()).filter((c) => c.width > 0);
    const r = el.getBoundingClientRect();
    return {
      tapado: piezas.some((p) => letras.some((c) =>
        !(p.right <= c.left || p.left >= c.right || p.bottom <= c.top || p.top >= c.bottom))),
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      barra: Math.round(Math.max(...piezas.map((p) => p.bottom))),
    };
  }, selector);
}

/** Recorre las 10 preguntas tocando (móvil) en vez de hacer clic. */
async function responderTocando(page: Page, perfil: Perfil): Promise<void> {
  for (let i = 0; i < perfil.length; i++) {
    const opcion = page.locator(OPCIONES_EN_PANTALLA, { hasText: perfil[i] });
    await expect(opcion, `P${i + 1}: «${perfil[i]}» debe casar con UNA opción`).toHaveCount(1);
    await opcion.tap();
    await page
      .getByRole('button', { name: i === perfil.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' })
      .tap();
    // Medio segundo antes del toque siguiente: dos toques cercanos y seguidos son una ráfaga
    // para Chrome, y desde el 2671 el 2.º de una ráfaga que cambió de pantalla se ignora. Una
    // persona que lee la pregunta nueva tarda más que eso.
    await page.waitForTimeout(500);
  }
}

// ── Perfiles del 02/10/2026 (puntos a mano con la tabla PESOS) ────────────────

// P1 Bastante: gato 3, perro-pequeño 2, perro-mediano 1 · P2 3 – 5 h: perro-pequeño 1, gato 1 ·
// P3 Piso amplio: perro-mediano 2, gato 2, perro-pequeño 1 · P4 Moderado: perro-mediano 1,
// perro-pequeño 1 · P5 Niños 5-12: perro-mediano 2, gato 1, roedor 1 · P6 Sin restricciones: — ·
// P7 Juego: perro-mediano 2, gato 1, roedor 1 · P8 Toda la vida: gato 2, perro-pequeño 1, reptil 1 ·
// P9 300 – 1.000 € y P10 80 – 180 €/mes: nada a nadie (techo 180: caben todos).
// gato 3+1+2+1+1+2 = 10 · perro-mediano 1+2+1+2+2 = 8 · perro-pequeño 2+1+1+1+1 = 6 · roedor 2 ·
// reptil 1 → Gato, sin empate ni recorte. Razones: P1 (+3), P3 (+2) y P8 (+2, detrás de P3 por número).
const NORMAL_0210: Perfil = [
  'Bastante — 1-2 h', '3 – 5 horas', 'Piso amplio', 'Moderado', 'Sí, de 5 a 12 años',
  'Sin restricciones', 'Juego e interacción', 'Para toda la vida', '300 – 1.000 €', '80 – 180 €/mes',
];

// P1 Mucho: perro-mediano 3, perro-grande 3, perro-pequeño 2, gato 1 · P2 Casi nunca vacía:
// perro-mediano 2, perro-grande 2 · P3 Jardín: perro-grande 3, perro-mediano 2 · P4 Muy activo:
// perro-mediano 2, perro-grande 2 · P5 Sin niños: — · P6 COMUNIDAD: pez 2, gato 1, roedor 1,
// perro-grande −2 · P7 Compañía: perro-mediano 2, perro-pequeño 2, gato 1 · P8 Varios años: — ·
// P9 Sin límite: — · P10 Más de 180 €/mes: perro-grande 2, perro-mediano 1.
// perro-mediano 3+2+2+2+2+1 = 12 · perro-grande 3+2+3+2−2+2 = 10 · perro-pequeño 4 · gato 3 ·
// pez 2 · roedor 1 → Perro mediano. Razones: P1 (+3), P2 (+2), P3 (+2). La restricción de la
// comunidad solo ha restado 2 al perro grande; ningún texto la menciona.
const COMUNIDAD_PERRO: Perfil = [
  'Mucho — más de 2 h', 'Casi nunca está vacía', 'Casa con jardín', 'Muy activo', 'No, solo adultos',
  'La comunidad restringe', 'Compañía constante', 'Varios años con posibilidad', 'Sin límite especial', 'Más de 180 €/mes',
];

// P1 POCO (menos de 1 h): gato 3, pez 2, pájaro 1 · P2 6 – 10 H: gato 3, pez 2, pájaro 1 ·
// P3 Jardín: perro-grande 3, perro-mediano 2 · P4 Muy activo: perro-mediano 2, perro-grande 2 ·
// P5 Niños 5-12: perro-mediano 2, gato 1, roedor 1 · P6 Sin restricciones: — · P7 Juego:
// perro-mediano 2, gato 1, roedor 1 · P8 Varios años: — · P9 300 – 1.000 €: — · P10 Más de
// 180 €/mes: perro-grande 2, perro-mediano 1.
// perro-mediano 2+2+2+2+1 = 9 · gato 3+3+1+1 = 8 · perro-grande 3+2+2 = 7 · pez 4 · roedor 2 ·
// pájaro 2 → hoy Perro mediano, con dos avisos que lo descalifican: «necesita salir varias veces
// al día, todos los días» y «la casa vacía 6 – 10 horas: un perro lo lleva mal». Lo correcto:
// la mejor sin esa incompatibilidad, Gato (8).
const SIN_TIEMPO_NI_CASA: Perfil = [
  'Poco — menos de 1 h', '6 – 10 horas', 'Casa con jardín', 'Muy activo', 'Sí, de 5 a 12 años',
  'Sin restricciones', 'Juego e interacción', 'Varios años con posibilidad', '300 – 1.000 €', 'Más de 180 €/mes',
];

test.describe('re-inspección 02/10/2026 · motor y casos resueltos a mano', () => {
  const PERROS_0210: MascotaKey[] = ['perro-pequeno', 'perro-mediano', 'perro-grande'];
  const OPCIONES_0210: string[][] = [
    ['mucho', 'medio', 'poco', 'minimo'], ['siempre', 'pocas', 'muchas', 'viajes'],
    ['jardin', 'piso_grande', 'piso_normal', 'piso_pequeno'], ['mucho', 'medio', 'poco'],
    ['si_pequenos', 'si_mayores', 'no', 'adolescentes'], ['alergia_pelo', 'comunidad', 'sin_ruido', 'ninguna'],
    ['compania', 'juego', 'tranquilidad', 'novedad'], ['largo', 'medio', 'corto'],
    ['minimo', 'bajo', 'medio', 'alto'], ['muy_bajo', 'bajo', 'medio', 'alto'],
  ];
  interface Cuentas {
    empates: number;
    empatesPorCosteInicial: number;
    empatesPorOrdenDeDeclaracion: number;
    comunidadConPerroMudo: number;
    perroSinTiempoNiCasa: number;
  }
  let cuentas: Cuentas | null = null;
  /** Una pasada por las 589.824 combinaciones (≈3 s), reutilizada dentro del worker. */
  function contar(): Cuentas {
    if (cuentas) return cuentas;
    const c: Cuentas = { empates: 0, empatesPorCosteInicial: 0, empatesPorOrdenDeDeclaracion: 0, comunidadConPerroMudo: 0, perroSinTiempoNiCasa: 0 };
    const idx = new Array(10).fill(0);
    for (;;) {
      const r: Record<number, string> = {};
      OPCIONES_0210.forEach((o, i) => { r[i + 1] = o[idx[i]]; });
      const res = calcularResultado(r);
      const info = MASCOTAS[res.mascota];
      if (res.empatadas.length > 0) {
        c.empates++;
        if (res.criterioDesempate.includes('coste inicial')) c.empatesPorCosteInicial++;
        if (res.empatadas.some((k) => MASCOTAS[k].costeMensualMin === info.costeMensualMin
          && MASCOTAS[k].costeInicialMin === info.costeInicialMin)) c.empatesPorOrdenDeDeclaracion++;
      }
      const textos = [...res.razones, ...res.aTenerEnCuenta, ...res.consejos.map((k) => k.texto)].join(' ');
      if (r[6] === 'comunidad' && PERROS_0210.includes(res.mascota) && !/comunidad|contrato/i.test(textos)) c.comunidadConPerroMudo++;
      if (PERROS_0210.includes(res.mascota) && ['poco', 'minimo'].includes(r[1]) && ['muchas', 'viajes'].includes(r[2])) c.perroSinTiempoNiCasa++;
      let i = 9;
      while (i >= 0 && ++idx[i] === OPCIONES_0210[i].length) { idx[i] = 0; i--; }
      if (i < 0) break;
    }
    cuentas = c;
    return c;
  }

  test('motor: los empates (53.325) se explican todos y ninguno lo decide el orden de declaración', () => {
    // Cuentas del 02/10/2026. Eran 54.462 sobre motor.ts sin cambios desde a3c2066c; la reparación
    // del 2665 (sin tiempo y con la casa vacía, fuera los perros) cambia la ganadora de esos
    // perfiles y con ella sus empates: 53.325, medido tras la reparación. El tercer criterio
    // (coste inicial) no llega a decidir nunca: el único par con el mismo mínimo mensual (pájaro y
    // reptil, 20 €) siempre se separa antes por el vínculo.
    const c = contar();
    expect(c.empates).toBe(53_325);
    expect(c.empatesPorCosteInicial).toBe(0);
    expect(c.empatesPorOrdenDeDeclaracion).toBe(0);
  });

  test('caso normal: 1-2 h, casa vacía 3 – 5 h, piso amplio, niños 5-12 y juego → Gato (10 frente a 8)', async ({ page }) => {
    const motor = calcularResultado({ 1: 'medio', 2: 'pocas', 3: 'piso_grande', 4: 'medio', 5: 'si_mayores', 6: 'ninguna', 7: 'juego', 8: 'largo', 9: 'medio', 10: 'medio' });
    expect([motor.puntos.gato, motor.puntos['perro-mediano'], motor.puntos['perro-pequeno']]).toEqual([10, 8, 6]);
    await abrirTest(page);
    await responder(page, NORMAL_0210);
    const ficha = await leerFicha(page);
    expect(ficha.mascota).toBe('Gato');
    expect([ficha.inicial, ficha.mensual, ficha.vida]).toEqual(['100 – 1.500 €', '50 – 120 €', '12 – 20 años']);
    const razones = await page.locator('[class*="consejosSection"]').first().locator('[class*="consejoItem"]').allInnerTexts();
    expect(razones).toEqual([
      'Con 1 – 2 horas al día cubres bien lo que necesita un gato.',
      'Un piso de más de 80 m² deja sitio de sobra para un gato.',
      'Piensas en un compromiso para toda la vida, y un gato es longevo.',
      'Coste mensual estimado para Gato: 50 – 120 €. Esperanza de vida: 12 – 20 años.',
    ]);
    // Nada juega en contra: ni tensiones ni horquilla por encima del tramo (120 < 180)
    // innerText devuelve los títulos en mayúsculas (text-transform): se compara sin caja
    expect(ficha.texto.toLowerCase()).not.toContain('lo que juega en contra');
    await expect(page.locator('[class*="avisoRecorte"]')).toHaveCount(0);
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
  });

  test('HALLAZGO: con «La comunidad restringe ciertas mascotas», si sale un perro, el resultado lo dice', async ({ page }) => {
    // REPARADO (02/10/2026, hallazgo 2664). P6 «La comunidad restringe ciertas mascotas — Normas del edificio o
    // alquiler con límites» solo resta 2 puntos al perro grande. Con el perfil de arriba gana el
    // perro mediano (12) y ni las razones ni «Lo que juega en contra» mencionan la comunidad o el
    // contrato, aunque la propia guía avisa de que una cláusula que prohíba animales es válida y
    // puede resolver el contrato. Motor: 17.430 de los 147.456 perfiles con esa respuesta salen
    // con perro (17.052 mediano, 378 pequeño), todos sin una palabra de la restricción.
    // Correcto: si se recomienda un perro, se dice que hay que comprobar que la comunidad o el
    // contrato lo admiten (como ya se hace con el silencio o el ciclo corto).
    // La reparación avisa, no filtra: la respuesta dice «ciertas mascotas» sin decir cuáles, y
    // descartar a todos los perros castigaría a las comunidades que solo limitan los grandes. El
    // aviso sale para toda recomendada que esa respuesta no favorece (perros, pájaro y reptil).
    const motor = calcularResultado({ 1: 'mucho', 2: 'siempre', 3: 'jardin', 4: 'mucho', 5: 'no', 6: 'comunidad', 7: 'compania', 8: 'medio', 9: 'alto', 10: 'alto' });
    expect([motor.puntos['perro-mediano'], motor.puntos['perro-grande']]).toEqual([12, 10]);
    await abrirTest(page);
    await responder(page, COMUNIDAD_PERRO);
    const ficha = await leerFicha(page);
    expect(ficha.mascota).toBe('Perro mediano');
    expect(ficha.texto).toMatch(/comprueba en los estatutos y en el contrato que admiten a un perro mediano/);
    expect(contar().comunidadConPerroMudo).toBe(0);
  });

  test('HALLAZGO: con menos de 1 h al día y la casa vacía 6 – 10 h no se recomienda un perro', async ({ page }) => {
    // REPARADO (02/10/2026, hallazgo 2665). La forma del 1678 (lo declarado no descarta, solo suma) con el tiempo:
    // gana el perro mediano por 9 a 8 y la misma pantalla dice que «necesita salir varias veces
    // al día, todos los días» y que «un perro lo lleva mal» 6 – 10 h solo (la FAQ cita a RSPCA y
    // PDSA: no más de cuatro horas). Motor: 3.430 perfiles dan perro con «Poco» o «Mínimo» de
    // tiempo Y la casa vacía 6 – 10 h o varios días seguidos. Correcto: la mejor sin esa
    // incompatibilidad, Gato (8 puntos, ver la cuenta de SIN_TIEMPO_NI_CASA).
    // Reparación: esa combinación descarta a los tres perros (motivo «atencion» del motor) y el
    // aviso de recorte nombra al perro mediano y las dos respuestas.
    await abrirTest(page);
    await responder(page, SIN_TIEMPO_NI_CASA);
    const ficha = await leerFicha(page);
    expect(ficha.mascota).toBe('Gato');
    await expect(page.locator('[class*="avisoRecorte"]')).toContainText('un perro mediano');
    await expect(page.locator('[class*="avisoRecorte"]')).toContainText('menos de una hora al día');
    await expect(page.locator('[class*="avisoRecorte"]')).toContainText('6 – 10 horas');
    expect(ficha.texto).toContain('se han descartado los perros');
    expect(contar().perroSinTiempoNiCasa).toBe(0);
  });

  test('HALLAZGO: la pregunta 6 deja declarar a la vez la alergia y la restricción de la comunidad', async ({ page }) => {
    // REPARADO (02/10/2026, hallazgo 2666). Pregunta exclusiva de esta hermana: «¿Hay alguna alergia o
    // restricción en casa?» junta en UNA elección única la alergia al pelo (que el motor aplica
    // como filtro duro), la comunidad y el silencio, que no se excluyen. Tocar «Alergia al pelo» y
    // después «La comunidad restringe» deja marcada solo la segunda, y con el resto del perfil
    // COMUNIDAD_PERRO el hogar alérgico recibe «Perro mediano». Correcto: la alergia declarada
    // sigue valiendo, así que el resultado no es un animal con pelo.
    // Reparación: la pregunta 6 es un grupo de casillas (role="checkbox"); «Sin restricciones»
    // desmarca a las demás y cualquiera de las demás la desmarca a ella.
    await abrirTest(page);
    for (let i = 0; i < 5; i++) {
      await page.locator(OPCIONES_EN_PANTALLA, { hasText: COMUNIDAD_PERRO[i] }).click();
      await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    }
    const casilla = (texto: string) => page.locator('[role="group"] [role="checkbox"]', { hasText: texto });
    await casilla('Sin restricciones').click();
    await casilla('Alergia al pelo').click();
    await casilla('La comunidad restringe').click();
    await expect(casilla('Alergia al pelo')).toHaveAttribute('aria-checked', 'true');
    await expect(casilla('La comunidad restringe')).toHaveAttribute('aria-checked', 'true');
    await expect(casilla('Sin restricciones'), 'marcar otra desmarca «Sin restricciones»').toHaveAttribute('aria-checked', 'false');
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    for (let i = 6; i < 10; i++) {
      await page.locator(OPCIONES_EN_PANTALLA, { hasText: COMUNIDAD_PERRO[i] }).click();
      await page.getByRole('button', { name: i === 9 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
    }
    const ficha = await leerFicha(page);
    expect(CON_PELO).not.toContain(ficha.mascota);
    // Y la comunidad también cuenta: la ganadora sin pelo (pez 2+2 = 4 frente a reptil 3, motor
    // abajo) recibe además los 2 puntos de «comunidad».
    const motor = calcularResultado({ 1: 'mucho', 2: 'siempre', 3: 'jardin', 4: 'mucho', 5: 'no', 6: 'alergia_pelo,comunidad', 7: 'compania', 8: 'medio', 9: 'alto', 10: 'alto' });
    expect(MASCOTAS[motor.mascota].nombre).toBe(ficha.mascota);
    expect(motor.puntos.pez).toBe(6);
  });
});

test('motor (2666): con varias restricciones a la vez, cada una sigue valiendo (8 combinaciones × el resto)', () => {
  // La pregunta 6 admite desde el 02/10/2026 cualquier subconjunto de {alergia, comunidad,
  // silencio}, o «Sin restricciones». Se recorren las 8 respuestas posibles con TODAS las demás
  // (147.456 cada una) y se exige, en cada perfil, lo mismo que con una restricción suelta:
  //   · alergia → ningún animal con pelo;
  //   · comunidad → si sale un perro, el pájaro o el reptil, se pide comprobar la comunidad;
  //   · silencio → si sale un perro, se mencionan los ladridos;
  //   · poco tiempo y la casa vacía muchas horas → ningún perro (2665).
  const SEIS = ['ninguna', 'alergia_pelo', 'comunidad', 'sin_ruido', 'alergia_pelo,comunidad',
    'alergia_pelo,sin_ruido', 'comunidad,sin_ruido', 'alergia_pelo,comunidad,sin_ruido'];
  const RESTO: string[][] = [
    ['mucho', 'medio', 'poco', 'minimo'], ['siempre', 'pocas', 'muchas', 'viajes'],
    ['jardin', 'piso_grande', 'piso_normal', 'piso_pequeno'], ['mucho', 'medio', 'poco'],
    ['si_pequenos', 'si_mayores', 'no', 'adolescentes'], SEIS,
    ['compania', 'juego', 'tranquilidad', 'novedad'], ['largo', 'medio', 'corto'],
    ['minimo', 'bajo', 'medio', 'alto'], ['muy_bajo', 'bajo', 'medio', 'alto'],
  ];
  const PERROS: MascotaKey[] = ['perro-pequeno', 'perro-mediano', 'perro-grande'];
  const infracciones: string[] = [];
  let total = 0;
  const idx = new Array(10).fill(0);
  for (;;) {
    const r: Record<number, string> = {};
    RESTO.forEach((o, i) => { r[i + 1] = o[idx[i]]; });
    const res = calcularResultado(r);
    total++;
    const seis = r[6].split(',');
    const textos = [...res.razones, ...res.aTenerEnCuenta].join(' ');
    const clave = JSON.stringify(r);
    if (seis.includes('alergia_pelo') && MASCOTAS[res.mascota].tienePelo) infracciones.push(`pelo con alergia: ${clave}`);
    if (seis.includes('comunidad') && [...PERROS, 'pajaro', 'reptil'].includes(res.mascota) && !/comunidad/.test(textos)) infracciones.push(`comunidad muda: ${clave}`);
    if (seis.includes('sin_ruido') && PERROS.includes(res.mascota) && !/ladrar/.test(textos)) infracciones.push(`silencio mudo: ${clave}`);
    if (['poco', 'minimo'].includes(r[1]) && ['muchas', 'viajes'].includes(r[2]) && PERROS.includes(res.mascota)) infracciones.push(`perro sin tiempo: ${clave}`);
    let i = 9;
    while (i >= 0 && ++idx[i] === RESTO[i].length) { idx[i] = 0; i--; }
    if (i < 0) break;
  }
  expect(total).toBe(8 * 147_456);
  expect(infracciones.slice(0, 5)).toEqual([]);
  expect(infracciones.length).toBe(0);
  // Una restricción suelta da lo mismo escrita sola que como lista de una
  const base = { 1: 'mucho', 2: 'siempre', 3: 'jardin', 4: 'mucho', 5: 'no', 7: 'compania', 8: 'medio', 9: 'alto', 10: 'alto' };
  expect(calcularResultado({ ...base, 6: 'ninguna' }).puntos).toEqual(calcularResultado({ ...base, 6: '' }).puntos);
  // Y las restricciones SUMAN: alergia + comunidad = pez 4 + 2
  expect(calcularResultado({ ...base, 6: 'alergia_pelo,comunidad' }).puntos.pez).toBe(6);
});

test.describe('re-inspección 02/10/2026 · teclado (lo que b0f31109 no trajo de la referencia)', () => {
  test('HALLAZGO: tras «Empezar el test» y tras «Siguiente» el foco queda en el cuestionario', async ({ page }) => {
    // REPARADO (02/10/2026, hallazgo 2667). Forma del 1680 de selector-smartphone, reparado allí en b0f31109 (el
    // foco va al enunciado). Aquí el useEffect solo enfoca el título del resultado: «Empezar» se
    // desmonta y «Siguiente» se desactiva (la pregunta nueva no tiene respuesta), y en los dos
    // casos el foco cae a <body>. Medido a 1280 px: tras «Siguiente», el siguiente Tab va a «Ir a
    // Guía de Razas de Perros» (Apps relacionadas), fuera del cuestionario.
    // Reparación: el foco va al enunciado <h2 tabIndex={-1}> de la pregunta nueva.
    await page.goto('/selector-mascota/');
    await esperarHidratacionBotones(page);
    const dentro = () => page.evaluate(() => !!document.activeElement?.closest('[class*="testContainer"]'));
    await page.getByRole('button', { name: /Empezar el test/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 1 de 10').first()).toBeVisible();
    expect(await dentro(), 'tras «Empezar», el foco está en el cuestionario').toBe(true);
    const radios = page.locator(OPCIONES_EN_PANTALLA);
    await radios.first().focus();
    await page.keyboard.press('Space');
    await expect(radios.first()).toHaveAttribute('aria-checked', 'true');
    await page.getByRole('button', { name: 'Siguiente pregunta' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 2 de 10').first()).toBeVisible();
    expect(await dentro(), 'tras «Siguiente», el foco está en el cuestionario').toBe(true);
    await expect(page.locator('[class*="preguntaTexto"]')).toBeFocused();
    await expect(page.locator('[class*="preguntaTexto"]')).toHaveText('¿Cuántas horas al día está la casa vacía habitualmente?');
    await page.keyboard.press('Tab');
    await expect(radios.first()).toBeFocused();
  });

  test('HALLAZGO: las flechas mueven foco y selección entre radios, y el grupo es una parada de Tab', async ({ page }) => {
    // REPARADO (02/10/2026, hallazgo 2668). Forma del 1681 de selector-smartphone (reparado allí en b0f31109). Las
    // opciones son role="radio" pero sin el teclado del patrón (WAI-ARIA APG): ArrowDown sobre
    // «Mucho — más de 2 h» deja el foco donde estaba y no marca nada, y las cuatro opciones son
    // paradas de Tab (tabindex sin declarar en las cuatro).
    // Reparación: teclaEnOpcion y tabindex itinerante, como la referencia.
    await abrirTest(page);
    const radios = page.locator(OPCIONES_EN_PANTALLA);
    const tabindex = () => radios.evaluateAll((els) => els.map((e) => (e as HTMLElement).tabIndex));
    expect(await tabindex(), 'sin marcar, solo la primera es parada de Tab').toEqual([0, -1, -1, -1]);
    await radios.first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(radios.nth(1)).toBeFocused({ timeout: 1_000 });
    await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'true', { timeout: 1_000 });
    expect(await tabindex()).toEqual([-1, 0, -1, -1]);
    // Vuelta al principio hacia arriba, y Fin/Inicio a los extremos
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect(radios.nth(3)).toBeFocused();
    await expect(radios.nth(3)).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Home');
    await expect(radios.nth(0)).toBeFocused();
    await page.keyboard.press('End');
    await expect(radios.nth(3)).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator(MARCADAS_EN_PANTALLA)).toHaveCount(1);
  });
});

test.describe('re-inspección 02/10/2026 · móvil 360 px', () => {
  test.use({
    viewport: { width: 360, height: 780 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('el <h1> de la intro no queda bajo la barra del logo a 360, 390, 800, 1000 ni 1024 px (lotes 586a4d61 y a1d72a9c)', async ({ page }) => {
    // El mismo <header> sigue en pantalla durante el test. Medido el 02/10/2026 también en oscuro
    // (con el conmutador): la geometría no cambia con el tema.
    await page.goto('/selector-mascota/');
    await esperarHidratacionBotones(page);
    expect((await bajoLaBarraLogo(page, 'header h1')).tapado, 'intro').toBe(false);
    for (const [ancho, alto] of [[390, 844], [800, 900], [1000, 900], [1024, 900]]) {
      await page.setViewportSize({ width: ancho, height: alto });
      await page.evaluate(() => window.scrollTo(0, 0));
      expect((await bajoLaBarraLogo(page, 'header h1')).tapado, `intro, ${ancho} px`).toBe(false);
    }
  });

  test('descarte de la sospecha: a 360 px un doble toque en «Siguiente» o «Ver resultado» no contesta nada', async ({ page }) => {
    // SOSPECHA del 25/09/2026, DESCARTADA a 360 px el 02/10/2026: «Siguiente» no se mueve al
    // avanzar y el segundo toque cae en el propio botón (ya desactivado) o en el hueco entre la
    // tarjeta y la navegación, en las 9 transiciones y en «Ver resultado». (A 412 px sí pasa en la
    // transición 8 → 9: bloque de abajo.)
    test.setTimeout(60_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-mascota/');
    await esperarHidratacionBotones(page);
    await page.getByRole('button', { name: /Empezar el test/ }).tap();
    const contestadas: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const radios = page.locator(OPCIONES_EN_PANTALLA);
      await radios.last().tap();
      const boton = page.locator('[class*="btnSiguiente"]');
      await boton.evaluate((e) => e.scrollIntoView({ block: 'center' }));
      const caja = (await boton.boundingBox())!;
      await page.touchscreen.tap(caja.x + caja.width / 2, caja.y + caja.height / 2);
      await page.waitForTimeout(150);
      await page.touchscreen.tap(caja.x + caja.width / 2, caja.y + caja.height / 2);
      // Medio segundo antes de contestar la pregunta nueva: así ese toque no entra en la ráfaga
      // del doble toque, que desde el 2671 se ignora entera tras un cambio de pantalla.
      await page.waitForTimeout(500);
      if (i < 10) {
        await expect(page.getByText(`Pregunta ${i + 1} de 10`).first()).toBeVisible();
        const marcadas = await page.locator(MARCADAS_EN_PANTALLA).count();
        if (marcadas > 0) contestadas.push(`P${i + 1}`);
      }
    }
    await expect(page.getByRole('heading', { name: 'Tu mascota ideal' })).toBeVisible();
    expect(contestadas).toEqual([]);
  });

  test('HALLAZGO: el <h1> del resultado no queda bajo la barra del logo a 360 ni a 390 px', async ({ page }) => {
    // REPARADO (02/10/2026, hallazgo 2669). De familia (la referencia también lo tiene). Los lotes 586a4d61 y
    // a1d72a9c dieron 80 px arriba a `.hero`, pero el resultado usa `.heroResultados` (2rem
    // arriba). Al llegar, scrollY 0 y el <h1> «Tu mascota ideal» en y 32-61; la píldora del logo
    // llega a y 52 y tapa «Tu m» (1.019 px² de letras a 360 px, 704 a 390). A 800, 1000 y 1024 px
    // no pisa. La Ronda no lo ve: mide el <h1> con el que carga la página, que es el de la intro.
    // Reparación: `.heroResultados` entra en la misma regla de 80 px hasta 1023 px, y el título
    // lleva scroll-margin-top de 80 px por si el foco tiene que subirlo.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-mascota/');
    await esperarHidratacionBotones(page);
    await page.getByRole('button', { name: /Empezar el test/ }).tap();
    await responderTocando(page, NORMAL_0210);
    await expect(page.getByRole('heading', { name: 'Tu mascota ideal' })).toBeFocused();
    const a360 = await bajoLaBarraLogo(page, 'header h1');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    const a390 = await bajoLaBarraLogo(page, 'header h1');
    expect({ a360: a360.tapado, a390: a390.tapado }).toEqual({ a360: false, a390: false });
  });

  test('HALLAZGO: tras «Siguiente», el enunciado de la pregunta nueva queda a la vista, bajo la barra', async ({ page }) => {
    // REPARADO (02/10/2026, hallazgo 2670). A 360 × 780 no cabe a la vez el enunciado entero y «Siguiente», así que
    // para tocarlo hay que bajar. Al avanzar la página no se mueve y el enunciado nuevo se queda
    // donde estaba el viejo: medido bajando lo justo para ver «Siguiente», las preguntas 2 y 3
    // empiezan en y −18 (fuera de la pantalla) y de la 4 a la 10 en y 9, con la píldora del logo
    // (hasta y 52) encima. Correcto: el enunciado nuevo, entero y por debajo de la barra.
    // (En la referencia el foco al enunciado lo sube a y 0, también bajo la barra.)
    // Reparación: si el enunciado no está entero a la vista y por debajo de 80 px, se sube con
    // scrollIntoView y su scroll-margin-top de 80 px, y luego se enfoca sin volver a desplazar.
    test.setTimeout(60_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-mascota/');
    await esperarHidratacionBotones(page);
    await page.getByRole('button', { name: /Empezar el test/ }).tap();
    const malas: string[] = [];
    for (let i = 1; i <= 4; i++) {
      await expect(page.getByText(`Pregunta ${i} de 10`).first()).toBeVisible();
      // Bajar lo justo para ver «Siguiente» en el borde inferior, y tocar la última opción
      await page.locator('[class*="btnSiguiente"]').evaluate((e) => {
        const r = e.getBoundingClientRect();
        if (r.bottom > window.innerHeight) window.scrollBy(0, r.bottom - window.innerHeight + 8);
      });
      await page.locator(OPCIONES_EN_PANTALLA).last().tap();
      await page.getByRole('button', { name: 'Siguiente pregunta' }).tap();
      await expect(page.getByText(`Pregunta ${i + 1} de 10`).first()).toBeVisible();
      // Medio segundo: mide la posición asentada y deja fuera de la ráfaga del doble toque (2671)
      // el toque de la opción siguiente.
      await page.waitForTimeout(500);
      const m = await bajoLaBarraLogo(page, '[class*="preguntaTexto"]');
      if (m.tapado || m.top < m.barra) malas.push(`P${i + 1}: enunciado en y ${m.top}, barra hasta ${m.barra}`);
    }
    expect(malas, 'enunciados bajo la barra del logo o fuera de la pantalla').toEqual([]);
  });
});

test.describe('re-inspección 02/10/2026 · móvil 412 px (Pixel 7)', () => {
  test.use({
    viewport: { width: 412, height: 839 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('HALLAZGO: un doble toque en «Siguiente» de la pregunta 8 no contesta la pregunta 9', async ({ page }) => {
    // REPARADO (02/10/2026, hallazgo 2671). La pregunta 8 tiene tres opciones y la 9 cuatro: al avanzar, el bloque
    // crece hacia abajo y, con «Siguiente» a media pantalla (y 360), el segundo toque cae en la
    // cuarta opción de la 9, «Sin límite especial», que queda marcada sin que nadie la elija.
    // Medido 3 de 3 veces con 150 ms entre toques; también con el botón en y 520 y en el borde
    // inferior. A 360 y 390 px no pasa (el texto parte en otras líneas).
    // Reparación: receta de quiz-literatura-universal (ce0ad0bc), el 2.º clic de una ráfaga
    // (event.detail > 1) se ignora si el anterior cambió de pantalla.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-mascota/');
    await esperarHidratacionBotones(page);
    await page.getByRole('button', { name: /Empezar el test/ }).tap();
    for (let i = 1; i <= 7; i++) {
      await page.locator(OPCIONES_EN_PANTALLA).first().tap();
      await page.getByRole('button', { name: 'Siguiente pregunta' }).tap();
      // Medio segundo entre preguntas: el toque de la opción siguiente no debe entrar en la
      // ráfaga del «Siguiente», que es justo lo que este test mide en la pregunta 8.
      await page.waitForTimeout(500);
    }
    await expect(page.getByText('Pregunta 8 de 10').first()).toBeVisible();
    await page.locator(OPCIONES_EN_PANTALLA).first().tap();
    const boton = page.getByRole('button', { name: 'Siguiente pregunta' });
    await boton.evaluate((e) => { const r = e.getBoundingClientRect(); window.scrollBy(0, r.top + r.height / 2 - 360); });
    const caja = (await boton.boundingBox())!;
    const x = caja.x + caja.width / 2;
    const y = caja.y + caja.height / 2;
    await page.touchscreen.tap(x, y);
    await expect(page.getByText('Pregunta 9 de 10').first()).toBeVisible();
    await page.waitForTimeout(150);
    await page.touchscreen.tap(x, y);
    await page.waitForTimeout(300);
    await expect(page.locator(MARCADAS_EN_PANTALLA)).toHaveCount(0);
    // El testigo de que el 2.º toque de verdad cayó sobre una opción: medio segundo después, un
    // toque en el mismo punto ya es una intención nueva y sí la marca.
    await page.waitForTimeout(500);
    await page.touchscreen.tap(x, y);
    await expect(page.locator(MARCADAS_EN_PANTALLA)).toHaveCount(1);
  });
});

test.describe('re-inspección 02/10/2026 · contenido y lectores de pantalla', () => {
  test('el JSON-LD WebApplication declara entre 4 y 8 features (hoy 6)', async ({ page }) => {
    await page.goto('/selector-mascota/');
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents())
      .map((t) => JSON.parse(t) as { '@type'?: string; featureList?: string[] });
    const web = ld.find((x) => x['@type'] === 'WebApplication');
    expect(web?.featureList?.length).toBe(6);
  });

  test('HALLAZGO: los emojis de los consejos no llegan al lector de pantalla', async ({ page }) => {
    // REPARADO (02/10/2026, hallazgo 2672). Los consejos («🏥 Antes de decidir…», «✂️ La esterilización…», «⏳ Una
    // mascota es un compromiso…», y en perros «💉» y «📋») llevan el emoji dentro de la cadena de
    // motor.ts y la vista la pinta en un <p>: el árbol de accesibilidad los expone y el lector
    // los lee (CLAUDE.md §5: emoji junto a texto, en <span aria-hidden="true">). El candado
    // check:a11y-jsx no lo ve porque no es JSX. La referencia lo repite en sus consejos.
    // Reparación: el motor devuelve { icono, texto } y la vista pinta el icono con aria-hidden.
    await abrirTest(page);
    await responder(page, NORMAL);
    await leerFicha(page);
    const seccion = page.locator('[class*="consejosSection"]').last();
    const arbol = await seccion.ariaSnapshot();
    expect(arbol).not.toMatch(/\p{Extended_Pictographic}/u);
    // Y siguen pintándose: el icono se ve, solo no se lee
    await expect(seccion.locator('[aria-hidden="true"]', { hasText: '🏥' })).toHaveCount(1);
    // En los perros también (💉, 📋): los consejos son fijos por animal, así que basta un perfil
    // de perro.
    const perro = calcularResultado({ 1: 'mucho', 2: 'siempre', 3: 'jardin', 4: 'mucho', 5: 'no', 6: 'ninguna', 7: 'compania', 8: 'medio', 9: 'alto', 10: 'alto' });
    expect(perro.mascota.startsWith('perro')).toBe(true);
    for (const c of perro.consejos) expect(c.texto).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  test('HALLAZGO: los porcentajes van con espacio duro y ninguno pegado', async ({ page }) => {
    // REPARADO (02/10/2026, hallazgo 2673). CLAUDE.md global §2 (25/09/2026): «15 %» con U+00A0. La guía dice «el
    // 45 % … el 24 %» con espacio normal (U+0020), igual que el consejo del perro, y la meta
    // schema:WebApplication del HTML servido anuncia «100% en el navegador», pegado.
    await abrirTest(page);
    await responder(page, NORMAL);
    await leerFicha(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const separadores = await page.evaluate(() =>
      [...document.body.innerText.matchAll(/\d(\s)%/g)].map((m) => m[1].codePointAt(0)));
    expect(separadores.length).toBeGreaterThan(0);
    expect(separadores.every((c) => c === 0xa0), `separadores: ${separadores.join(', ')}`).toBe(true);
    const meta = (await page.locator('meta[name="schema:WebApplication"]').getAttribute('content')) ?? '';
    expect(meta).not.toMatch(/\d%/);
    expect(meta).toContain('100\u00A0% en el navegador');
    // El consejo del perro, también
    const perro = calcularResultado({ 1: 'mucho', 2: 'siempre', 3: 'jardin', 4: 'mucho', 5: 'no', 6: 'ninguna', 7: 'compania', 8: 'medio', 9: 'alto', 10: 'alto' });
    expect(perro.consejos.map((c) => c.texto).join(' ')).toContain('el 45\u00A0% de los dueños de perro');
  });
});
