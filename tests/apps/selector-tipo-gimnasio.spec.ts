import { test, expect, Page, devices } from '@playwright/test';

/**
 * Selector de Tipo de Gimnasio (selector-tipo-gimnasio) — inspección del 10/10/2026
 *
 * QUÉ PROMETE LA APP
 *   <h1> «¿Qué tipo de gimnasio te conviene?» · «Responde 10 preguntas y descubre el
 *   entrenamiento que mejor se adapta a ti». Cinco salidas: gimnasio tradicional, CrossFit /
 *   funcional, yoga o pilates, en casa y al aire libre. Riesgo 2 (salud/hábitos).
 *
 * EL MOTOR (inline en page.tsx, sin motor.ts)
 *   Cada opción suma pesos a las cinco modalidades; gana la de más puntos, y en un empate
 *   `reduce((a, b) => puntos[a] >= puntos[b] ? a : b)` se queda con la PRIMERA declarada
 *   (gimnasio_tradicional, crossfit_funcional, yoga_pilates, casa, aire_libre). Ninguna
 *   respuesta descarta: el presupuesto, las lesiones o el espacio solo suman puntos.
 *   Todos los valores esperados de abajo se resolvieron a mano con la tabla de pesos de
 *   page.tsx ANTES de abrir el navegador, y se cotejaron después con el motor real.
 *
 * BARRIDO DEL MOTOR (7 · 5^9 = 13.671.875 perfiles, script del inspector):
 *   · empate en cabeza: 1.859.349 perfiles (13,6 %), deshechos en silencio por el orden;
 *   · «Nada, prefiero opciones gratuitas»: 1.157.441 de 2.734.375 (42,3 %) acaban en una
 *     modalidad de pago (gimnasio 756.170 · yoga/pilates 244.081 · CrossFit 157.190);
 *   · «lesiones crónicas o limitaciones importantes» → CrossFit: 273.719 (10,0 %);
 *     «Principiante absoluto» → CrossFit: 110.671 (4,0 %);
 *   · «No tengo espacio en casa» → «Entrenamiento en Casa»: 135.675 (5,0 %).
 *
 * FAMILIA «selectores» (no declarada; cabo C0005): el INVARIANTE se cumple (radios de verdad,
 * barra que anuncia lo que pinta). Lo que NO ha llegado son las recetas de la referencia
 * selector-smartphone (b0f31109): foco al enunciado y al resultado, teclado APG con tabindex
 * itinerante y guarda de doble toque. Esos casos van con test.fail.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Ayudantes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La app no tiene ningún <input>: el testigo de hidratación es que React haya colgado sus
 * props del primer botón del grupo (mismo criterio que selector-smartphone y el testigo de
 * familia). Antes de eso, un clic cambia el DOM y no llega al estado.
 */
async function esperarHidratacionBotones(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const boton = document.querySelector('[role="radiogroup"] button');
      return !!boton && Object.keys(boton).some((k) => k.startsWith('__reactProps$') || k.startsWith('__reactFiber$'));
    },
    null,
    { timeout: 20_000 },
  );
}

async function abrir(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/selector-tipo-gimnasio/');
  await esperarHidratacionBotones(page);
}

type Perfil = readonly [string, string, string, string, string, string, string, string, string, string];

const radios = (page: Page) => page.locator('[role="radiogroup"] [role="radio"]');
const nombreBoton = (i: number) => (i === 9 ? 'Ver mi resultado' : 'Siguiente pregunta');

/** Marca cada respuesta (por un trozo ÚNICO de su texto) y avanza, con 500 ms para leer. */
async function responder(page: Page, perfil: Perfil): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(`Pregunta ${i + 1} de 10`).first()).toBeVisible();
    await radios(page).filter({ hasText: perfil[i] }).click();
    await page.getByRole('button', { name: nombreBoton(i) }).click();
    await page.waitForTimeout(500);
  }
  await page.getByRole('heading', { name: 'Tu resultado', level: 1 }).waitFor();
}

interface Fila { etiqueta: string; puntos: string; ancho: string; ganador: boolean }

async function marcador(page: Page): Promise<Fila[]> {
  return page.locator('[class*="barraResultado"]').evaluateAll((els) =>
    els.map((e) => {
      const relleno = e.querySelector('[role="progressbar"]')?.firstElementChild as HTMLElement | null;
      return {
        etiqueta: e.querySelector('[class*="barraLabel"]')?.textContent ?? '',
        puntos: e.querySelector('[class*="barraPuntos"]')?.textContent ?? '',
        ancho: relleno?.style.width ?? '',
        ganador: /ganador/.test(relleno?.className ?? ''),
      };
    }),
  );
}

const nombreResultado = (page: Page) => page.locator('[class*="resultadoCard"] h2');

// ─────────────────────────────────────────────────────────────────────────────
// Perfiles (pesos de page.tsx; la cuenta a mano va en cada uno)
// ─────────────────────────────────────────────────────────────────────────────

// yoga 3+1+3+3+1+3+2+0+3+2 = 21 · aire 2+2+0+0+0+1+0+0+1+1 = 7 · gimnasio 0+2+1+0+0+0+1+2+0+0 = 6
// · CrossFit 0+0+0+2+0+0+0+2+0+0 = 4 · casa 0+0+0+0+2+0+0+0+0+0 = 2
const NORMAL_YOGA: Perfil = [
  'Reducir el estrés', 'Básico, entreno de vez en cuando', 'Disfruto de clases dirigidas', 'Entre 50 € y 100 €',
  'Tengo espacio básico', 'La competición me estresa', 'He tenido lesiones pero estoy recuperado', 'Por la tarde',
  'La conexión mente-cuerpo', 'Prefiero el interior pero cerca',
];
// gimnasio 2+2+1+0+1+0+1+2+3+0 = 12 · aire 2+2+1+3+1+2+0+0+0+1 = 12 · yoga 1+1+0+0+0+1+1+0+1+2 = 7
// · casa 2+0+1+2+0+0+0+1+0+0 = 6 · CrossFit 0. Empate 12-12 entre una de pago y la gratuita,
// con «Nada, prefiero opciones gratuitas».
const EMPATE_NADA: Perfil = [
  'Mantener mi forma física actual', 'Básico, entreno de vez en cuando', 'Me da igual, me adapto', 'Nada, prefiero opciones gratuitas',
  'No lo he considerado', 'Me motiva más el disfrute', 'No lo sé, nunca me he evaluado', 'A mediodía',
  'Una rutina estructurada', 'Prefiero el interior pero cerca',
];
// CrossFit 3+3+3+0+1+3+0+2+3+0 = 20 · gimnasio 2+0+0+0+3+0+1+2+1+3 = 12 · aire 0+2+0+3+2+2+1+0+0+0 = 10
// · casa 1+0+0+2+0+0+0+0+0+2 = 5 · yoga 0+0+1+0+0+0+0+0+0+0 = 1
const NADA_CROSSFIT: Perfil = [
  'Perder peso', 'Muy activo', 'Me encanta el ambiente grupal', 'Nada, prefiero opciones gratuitas',
  'No tengo espacio en casa', 'Sí, me encanta competir', 'Estoy en perfectas condiciones', 'Por la tarde',
  'La variedad de ejercicios', 'Siempre en interior',
];
// CrossFit 3+0+3+3+1+3+0+2+3+0 = 18 · gimnasio 2+2+0+0+3+0+0+2+1+1 = 11 · yoga 0+2+1+2+0+0+3+0+0+0 = 8
// · casa 1+2+0+0+0+0+1+0+0+1 = 5 · aire 0+0+0+0+2+2+0+0+0+1 = 5
const PRINCIPIANTE_LESION: Perfil = [
  'Perder peso', 'Principiante absoluto', 'Me encanta el ambiente grupal', 'Más de 100 €',
  'No tengo espacio en casa', 'Sí, me encanta competir', 'Sí, tengo lesiones crónicas', 'Por la tarde',
  'La variedad de ejercicios', 'Me da igual, adapto según',
];
// casa 2+2+3+3+0+2+1+3+0+2 = 18 · gimnasio 2+2+0+0+3+0+0+1+3+3 = 14 · yoga 1+2+0+0+0+3+3+0+1+0 = 10
// · aire 2+0+2+2+2+0+0+0+0+0 = 8 · CrossFit 1
const SIN_ESPACIO: Perfil = [
  'Mantener mi forma física actual', 'Principiante absoluto', 'Prefiero entrenar completamente solo', 'Hasta 20 €',
  'No tengo espacio en casa', 'Prefiero avanzar a mi propio ritmo', 'Sí, tengo lesiones crónicas', 'Por la noche',
  'Una rutina estructurada', 'Siempre en interior',
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. Casos resueltos a mano
// ─────────────────────────────────────────────────────────────────────────────

test.describe('casos resueltos a mano', () => {
  test('caso normal: perfil de bienestar → Yoga o Pilates, 21 puntos, y el marcador ordenado', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    await responder(page, NORMAL_YOGA);
    await expect(nombreResultado(page)).toHaveText('Yoga o Pilates');
    // Anchos: round(p / 21 · 100) → 100 %, 33 %, 29 %, 19 %, 10 %.
    expect(await marcador(page)).toEqual([
      { etiqueta: 'Yoga / Pilates', puntos: '21', ancho: '100%', ganador: true },
      { etiqueta: 'Al Aire Libre', puntos: '7', ancho: '33%', ganador: false },
      { etiqueta: 'Gimnasio Tradicional', puntos: '6', ancho: '29%', ganador: false },
      { etiqueta: 'CrossFit / Funcional', puntos: '4', ancho: '19%', ganador: false },
      { etiqueta: 'En Casa', puntos: '2', ancho: '10%', ganador: false },
    ]);
    // Riesgo 2: el aviso médico no colapsable acompaña al resultado.
    await expect(page.getByText('Aviso Médico Importante')).toBeVisible();
  });

  test('caso límite (empate 12-12): el marcador lo muestra, pero la tarjeta nombra una sola ganadora', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    await responder(page, EMPATE_NADA);
    // Comportamiento OBSERVADO, que es el de la tabla de pesos: gimnasio por ir declarado antes.
    await expect(nombreResultado(page)).toHaveText('Gimnasio Tradicional');
    expect(await marcador(page)).toEqual([
      { etiqueta: 'Gimnasio Tradicional', puntos: '12', ancho: '100%', ganador: true },
      { etiqueta: 'Al Aire Libre', puntos: '12', ancho: '100%', ganador: false },
      { etiqueta: 'Yoga / Pilates', puntos: '7', ancho: '58%', ganador: false },
      { etiqueta: 'En Casa', puntos: '6', ancho: '50%', ganador: false },
      { etiqueta: 'CrossFit / Funcional', puntos: '0', ancho: '0%', ganador: false },
    ]);
  });

  test('ABIERTO: el empate se dice (o se deshace con un criterio declarado) en vez de ganarlo el orden', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). 1.859.349 perfiles (13,6 %) empatan en cabeza y la app
    // proclama la primera declarada sin decirlo. Aquí, además, con «Nada, prefiero opciones
    // gratuitas», la de pago gana a la gratuita solo por ir antes en el objeto.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await responder(page, EMPATE_NADA);
    const tarjeta = (await page.locator('[class*="resultadoCard"]').innerText()).replace(/\s+/g, ' ');
    expect(tarjeta).toMatch(/empat|mismos puntos|misma puntuaci/i);
  });

  test('rechazo: sin responder no se avanza ni se llega al resultado; «Anterior» conserva y «Repetir» borra', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    await expect(page.getByRole('button', { name: 'Siguiente pregunta' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Pregunta anterior' })).toBeDisabled();
    await radios(page).filter({ hasText: 'Mejorar flexibilidad' }).click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    await expect(page.getByText('Pregunta 2 de 10').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Siguiente pregunta' })).toBeDisabled();
    await radios(page).filter({ hasText: 'Muy activo' }).click();
    await page.getByRole('button', { name: 'Pregunta anterior' }).click();
    await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveText('Mejorar flexibilidad y movilidad');
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveText('Muy activo, busco superar mis límites');

    // «Repetir el test» deja las diez preguntas sin respuesta y la barra a cero.
    await page.goto('/selector-tipo-gimnasio/');
    await esperarHidratacionBotones(page);
    await responder(page, NORMAL_YOGA);
    await page.getByRole('button', { name: 'Repetir el test' }).click();
    await expect(page.getByText('Pregunta 1 de 10').first()).toBeVisible();
    await expect(page.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '0');
    await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Siguiente pregunta' })).toBeDisabled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Respuestas que deberían descartar y solo suman (hallazgos ABIERTOS)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('respuestas que deberían descartar', () => {
  test('ABIERTO: con «Nada, prefiero opciones gratuitas» no gana CrossFit sin una palabra del presupuesto', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Forma del 1678 de selector-smartphone: el presupuesto suma
    // puntos (aire +3, casa +2) pero no descarta. CrossFit 20 · gimnasio 12 · aire 10 · casa 5 ·
    // yoga 1 → «CrossFit / Entrenamiento Funcional», cuyo precio la propia guía pone en
    // «60-120 €/mes». Esperado: una modalidad gratuita, o CrossFit con el desfase dicho.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await responder(page, NADA_CROSSFIT);
    const nombre = await nombreResultado(page).innerText();
    const tarjeta = await page.locator('[class*="resultadoCard"]').innerText();
    expect(nombre !== 'CrossFit / Entrenamiento Funcional' || /presupuesto|gratu/i.test(tarjeta),
      `recomendado «${nombre}» con presupuesto «Nada»`).toBe(true);
  });

  test('ABIERTO: a un principiante absoluto con lesiones crónicas no se le recomienda CrossFit sin más', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). CrossFit 18 · gimnasio 11 · yoga 8 · casa 5 · aire 5. El
    // propio FAQPage dice que CrossFit «no es la opción más adecuada para personas sedentarias o
    // con lesiones articulares», y la guía, que es «ideal para personas con buena condición
    // física». La tarjeta solo dice «Sesiones intensas en grupo… para quienes buscan retos»; el
    // recuadro «Recuerda» es genérico y sale con cualquier resultado.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await responder(page, PRINCIPIANTE_LESION);
    const nombre = await nombreResultado(page).innerText();
    const tarjeta = await page.locator('[class*="resultadoCard"]').innerText();
    expect(nombre !== 'CrossFit / Entrenamiento Funcional' || /lesi[oó]n|principiante/i.test(tarjeta),
      `recomendado «${nombre}» a un principiante con lesiones crónicas`).toBe(true);
  });

  test('ABIERTO: con «No tengo espacio en casa» no se recomienda «Entrenamiento en Casa» sin más', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). casa 18 · gimnasio 14 · yoga 10 · aire 8 · CrossFit 1 →
    // «Entrenamiento en Casa». «No tengo espacio» es una imposibilidad, no una preferencia, y
    // la respuesta no le resta nada a casa: solo suma a gimnasio, aire y CrossFit.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await responder(page, SIN_ESPACIO);
    const nombre = await nombreResultado(page).innerText();
    const tarjeta = await page.locator('[class*="resultadoCard"]').innerText();
    expect(nombre !== 'Entrenamiento en Casa' || /espacio/i.test(tarjeta), `recomendado «${nombre}» sin espacio en casa`).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Invariante de la familia «selectores» (se cumple) y lo que falta de la referencia
// ─────────────────────────────────────────────────────────────────────────────

test.describe('invariante de familia y accesibilidad', () => {
  test('las opciones son radios de verdad: aria-checked, sin aria-pressed, una sola marcada', async ({ page }) => {
    await abrir(page);
    const grupo = page.locator('[role="radiogroup"]').first();
    await expect(grupo.locator('[role="radio"]')).toHaveCount(7); // la pregunta 1 tiene 7 opciones
    await expect(grupo.locator('[aria-pressed]')).toHaveCount(0);
    await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(0);
    await grupo.locator('[role="radio"]').nth(1).click();
    await expect(grupo.locator('[aria-checked="true"]')).toHaveText('Perder peso y quemar calorías');
    await grupo.locator('[role="radio"]').nth(0).click();
    await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(1);
    await expect(grupo.locator('[role="radio"]').nth(0)).toHaveAttribute('aria-checked', 'true');
  });

  test('la barra de progreso anuncia la misma fracción que pinta (0 → 10 % → 10 %)', async ({ page }) => {
    await abrir(page);
    const barra = page.locator('[role="progressbar"]');
    const anunciada = async () => {
      const [v, mi, ma] = await Promise.all(['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].map(async (a) => Number(await barra.getAttribute(a))));
      return (v - mi) / (ma - mi);
    };
    const pintada = () => barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth);
    // progresoPct = round((pregunta + respondida) / 10 · 100): 0 sin responder, 10 tras responder
    // la 1, y 10 en la 2 todavía sin responder.
    expect(await anunciada()).toBe(0);
    await expect.poll(pintada).toBeCloseTo(0, 2);
    await radios(page).first().click();
    expect(await anunciada()).toBeCloseTo(0.1, 6);
    await expect.poll(pintada).toBeCloseTo(0.1, 2);
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    await expect(page.getByText('Pregunta 2 de 10').first()).toBeVisible();
    expect(await anunciada()).toBeCloseTo(0.1, 6);
    await expect.poll(pintada).toBeCloseTo(0.1, 2);
  });

  test('ABIERTO: las barras tienen nombre accesible (cuestionario y «Compatibilidad con cada opción»)', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). La del cuestionario no lleva aria-label ni aria-valuetext
    // (ariaSnapshot: «- progressbar»), y las cinco del marcador del resultado son role="progressbar"
    // sin nombre: un lector anuncia «barra de progreso, 100 %», «… 33 %», desligado de la
    // modalidad y como si fuera un progreso. La fracción sí casa con lo pintado.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    const sinNombre = async () => page.locator('[role="progressbar"]').evaluateAll((els) =>
      els.filter((e) => !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby') && !e.getAttribute('aria-valuetext')).length);
    const enCuestionario = await sinNombre();
    await responder(page, NORMAL_YOGA);
    const enResultado = await sinNombre();
    expect({ enCuestionario, enResultado }).toEqual({ enCuestionario: 0, enResultado: 0 });
  });

  test('ABIERTO (C0016): las flechas mueven la selección y el grupo es una sola parada de Tab', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Patrón de radios del WAI-ARIA APG, como la referencia
    // selector-smartphone (1681, b0f31109). Medido: ArrowDown y ArrowRight sobre «Ganar fuerza»
    // no mueven el foco ni marcan nada; las 7 opciones tienen tabIndex 0 y el Tab desde la
    // marcada va a la opción siguiente.
    test.fail();
    await abrir(page);
    const r = radios(page);
    await r.nth(0).click();
    await r.nth(0).focus();
    await page.keyboard.press('ArrowDown');
    await expect(r.nth(1)).toBeFocused({ timeout: 1_000 });
    await expect(r.nth(1)).toHaveAttribute('aria-checked', 'true', { timeout: 1_000 });
    expect(await r.evaluateAll((els) => els.map((e) => (e as HTMLElement).tabIndex))).toEqual([-1, 0, -1, -1, -1, -1, -1]);
  });

  test('ABIERTO: tras «Siguiente» con teclado el foco sigue en el cuestionario (no cae a <body>)', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). «Siguiente» se desactiva al llegar la pregunta nueva sin
    // responder y el foco, que estaba en él, cae a <body>: medidos 17 Tab (Apps relacionadas,
    // catálogo, Delegum…) hasta la primera opción de la pregunta 2. Igual con «Anterior» en la 1.
    test.fail();
    await abrir(page);
    await radios(page).first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 2 de 10').first()).toBeVisible();
    const dentro = await page.evaluate(() => !!document.activeElement?.closest('[class*="quiz"]'));
    expect(dentro, 'el foco sigue dentro del cuestionario').toBe(true);
  });

  test('ABIERTO: «Repetir el test» deja a la vista la pregunta 1', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). A 1.280 × 720, pulsando «Repetir el test» con la página en
    // scrollY 623, la pregunta 1 aparece con el enunciado en y −189 (por encima del borde) y el
    // foco en <body>.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await responder(page, NORMAL_YOGA);
    await page.getByRole('button', { name: 'Repetir el test' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 1 de 10').first()).toBeAttached();
    await expect(page.locator('[class*="pregunta"] h2')).toBeInViewport({ timeout: 1_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Móvil 360 px: doble toque, enunciado y resultado frente a la barra del logo
// ─────────────────────────────────────────────────────────────────────────────

/** ¿Pisa alguna pieza de la barra fija del logo las letras del elemento? (función de la Ronda) */
async function bajoLaBarra(page: Page, selector: string): Promise<{ tapado: boolean; top: number; barra: number }> {
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
    return {
      tapado: piezas.some((p) => letras.some((c) => !(p.right <= c.left || p.left >= c.right || p.bottom <= c.top || p.top >= c.bottom))),
      top: Math.round(el.getBoundingClientRect().top),
      barra: Math.round(barra.getBoundingClientRect().bottom),
    };
  }, selector);
}

/** Deja el botón a media pantalla y devuelve su centro. */
async function centrar(page: Page, nombre: string): Promise<{ x: number; y: number }> {
  const boton = page.getByRole('button', { name: nombre });
  await boton.evaluate((e) => { const r = e.getBoundingClientRect(); window.scrollBy(0, r.top + r.height / 2 - innerHeight / 2); });
  await page.waitForTimeout(80);
  const caja = (await boton.boundingBox())!;
  return { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 };
}

/** Responde las k primeras con la PRIMERA opción y marca la ÚLTIMA en la pregunta k + 1. */
async function prepararTransicion(page: Page, k: number): Promise<void> {
  for (let i = 0; i < k; i++) {
    await radios(page).first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    await expect(page.getByText(`Pregunta ${i + 2} de 10`).first()).toBeVisible();
  }
  await page.waitForTimeout(500);
  await radios(page).last().tap();
}

test.describe('móvil 360 px', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('el <h1> de la portada y el del resultado (con scroll 0) quedan por debajo de la barra del logo', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    expect((await bajoLaBarra(page, 'h1')).tapado, 'portada').toBe(false);
    await responder(page, NORMAL_YOGA);
    await page.evaluate(() => window.scrollTo(0, 0));
    expect((await bajoLaBarra(page, 'h1')).tapado, 'resultado').toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });

  test('un doble toque en «Ver mi resultado» no saca de la app', async ({ page }) => {
    // Medido: el segundo toque cae en el recuadro «Recuerda», que no tiene acción.
    test.setTimeout(60_000);
    await abrir(page);
    await prepararTransicion(page, 9);
    const p = await centrar(page, 'Ver mi resultado');
    await page.mouse.dblclick(p.x, p.y);
    await expect(page.getByRole('heading', { name: 'Tu resultado', level: 1 })).toBeAttached();
    await page.waitForTimeout(700);
    expect(new URL(page.url()).pathname).toBe('/selector-tipo-gimnasio/');
  });

  test('ABIERTO: un doble toque en «Siguiente» de la 2 no contesta la pregunta 3', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Sin guarda de doble toque (receta del 2659 en la
    // referencia). La pregunta 3 es más alta que la 2 (sus opciones ocupan dos líneas a 360 px)
    // y la botonera baja: el segundo toque, en el mismo punto, cae en «Me da igual, me adapto a
    // cualquier situación». Medido igual con el botón a media pantalla y abajo del todo.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await prepararTransicion(page, 1);
    const p = await centrar(page, 'Siguiente pregunta');
    await page.mouse.dblclick(p.x, p.y);
    await expect(page.getByText('Pregunta 3 de 10').first()).toBeVisible();
    await page.waitForTimeout(300);
    await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0, { timeout: 1_000 });
  });

  test('ABIERTO: un doble toque en «Siguiente» de la 3 no devuelve a la pregunta 3', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). La pregunta 4 es más baja que la 3 y la botonera sube: el
    // segundo toque cae en «← Anterior» (a ≤ 480 px va debajo de «Siguiente») y deshace el avance.
    // A 390 px pasa también en las transiciones 6→7 y 7→8; la 8→9 marca «La comodidad y poder
    // entrenar sin desplazarme» (casa +3) a 360 y 390 px.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await prepararTransicion(page, 2);
    const p = await centrar(page, 'Siguiente pregunta');
    await page.mouse.dblclick(p.x, p.y);
    await page.waitForTimeout(500);
    await expect(page.getByText('Pregunta 4 de 10').first()).toBeVisible({ timeout: 1_000 });
  });

  test('ABIERTO: tras tocar «Siguiente» a media pantalla, el enunciado nuevo queda a la vista y fuera de la barra', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). La app no mueve ni el foco ni la vista: con el botón a
    // media pantalla, el enunciado de las preguntas 2 a 10 queda POR ENCIMA del borde en 9 de 9
    // transiciones (P2 en y −242..−191). A 390 px, P3 y P9 quedan bajo la barra del logo.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await radios(page).last().tap();
    const p = await centrar(page, 'Siguiente pregunta');
    await page.touchscreen.tap(p.x, p.y);
    await expect(page.getByText('Pregunta 2 de 10').first()).toBeAttached();
    await page.waitForTimeout(200);
    const m = await bajoLaBarra(page, '[class*="pregunta"] h2');
    expect(m.top, `enunciado en y ${m.top}, barra hasta ${m.barra}`).toBeGreaterThanOrEqual(m.barra);
  });

  test('ABIERTO: al tocar «Ver mi resultado» se ve el nombre del resultado y tiene (o lleva) el foco', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). El resultado sustituye al cuestionario en el sitio: con el
    // botón a media pantalla se aterriza en scrollY 595, con el <h1> «Tu resultado» en y −515 y
    // el nombre (h2) en y −151, y el foco en <body>.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await prepararTransicion(page, 9);
    const p = await centrar(page, 'Ver mi resultado');
    await page.touchscreen.tap(p.x, p.y);
    await page.getByRole('heading', { name: 'Tu resultado', level: 1 }).waitFor({ state: 'attached' });
    await expect(nombreResultado(page)).toBeInViewport({ timeout: 1_000 });
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Contraste, formato y lo que se sirve a buscadores
// ─────────────────────────────────────────────────────────────────────────────

/** Contraste mínimo del texto contra su fondo real (función de selector-smartphone.spec.ts). */
async function contrasteMinimo(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((el) => {
    type RGBA = { r: number; g: number; b: number; a: number };
    const parse = (s: string): RGBA => {
      const p = (s.match(/rgba?\(([^)]+)\)/)?.[1] ?? '0,0,0,0').split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
    };
    const lum = (c: RGBA) => {
      const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const ratio = (x: RGBA, y: RGBA) => { const [a, b] = [lum(x), lum(y)].sort((p, q) => q - p); return (a + 0.05) / (b + 0.05); };
    const sobre = (arriba: RGBA, abajo: RGBA): RGBA => ({
      r: arriba.r * arriba.a + abajo.r * (1 - arriba.a),
      g: arriba.g * arriba.a + abajo.g * (1 - arriba.a),
      b: arriba.b * arriba.a + abajo.b * (1 - arriba.a),
      a: 1,
    });
    const degradadoEn = (n: Element, x: number, y: number): RGBA => {
      const img = getComputedStyle(n).backgroundImage;
      const paradas = [...img.matchAll(/rgba?\([^)]+\)/g)].map((m) => parse(m[0]));
      const ang = (Number(img.match(/(-?[\d.]+)deg/)?.[1] ?? 180) * Math.PI) / 180;
      const c = n.getBoundingClientRect();
      const L = Math.abs(c.width * Math.sin(ang)) + Math.abs(c.height * Math.cos(ang));
      const u = Math.min(1, Math.max(0, 0.5 + ((x - (c.left + c.width / 2)) * Math.sin(ang) - (y - (c.top + c.height / 2)) * Math.cos(ang)) / L));
      const [p0, p1] = [paradas[0], paradas[paradas.length - 1]];
      return { r: p0.r + (p1.r - p0.r) * u, g: p0.g + (p1.g - p0.g) * u, b: p0.b + (p1.b - p0.b) * u, a: 1 };
    };
    const fondoEn = (x: number, y: number): RGBA => {
      const capas: RGBA[] = [];
      for (let n: Element | null = el; n; n = n.parentElement) {
        if (getComputedStyle(n).backgroundImage.includes('gradient')) { capas.push(degradadoEn(n, x, y)); break; }
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c.a > 0) { capas.push(c); if (c.a >= 1) break; }
      }
      let f: RGBA = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = capas.length - 1; i >= 0; i--) f = sobre(capas[i], f);
      return f;
    };
    let op = 1;
    for (let n: Element | null = el; n; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
    const color = parse(getComputedStyle(el).color);
    const rango = document.createRange();
    rango.selectNodeContents(el);
    let min = Infinity;
    for (const t of [...rango.getClientRects()].filter((q) => q.width > 0)) {
      for (const [x, y] of [[t.left + 1, t.top + 1], [t.right - 1, t.bottom - 1], [t.left + 1, t.bottom - 1], [t.right - 1, t.top + 1]]) {
        const bg = fondoEn(x, y);
        min = Math.min(min, ratio(sobre({ ...color, a: color.a * op }, bg), bg));
      }
    }
    return min;
  });
}

test('ABIERTO: «Siguiente», la opción marcada y «Anterior» llegan a 4,5:1', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). Ninguno es texto grande (15,2-16 px, 600-700): exigen 4,5:1.
  // Medido: «Siguiente →» blanco sobre el degradado --primary→--secondary 3,27:1 en claro y
  // 2,45:1 en oscuro · opción marcada (--primary sobre su tinte) 3,56:1 · «← Anterior» (--primary)
  // 3,93:1 en claro. «Repetir el test», con el mismo color, también da 3,93:1 (medido aparte; aquí
  // no se recorre el test entero). La referencia lo resolvió con --primary-boton / --primary-texto (1682).
  test.fail();
  test.setTimeout(60_000);
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/selector-tipo-gimnasio/');
  await esperarHidratacionBotones(page);
  const medidas: Record<string, number> = {};
  await radios(page).first().click();
  await page.mouse.move(0, 0);
  medidas['opción marcada'] = await contrasteMinimo(page, '[class*="seleccionada"]');
  medidas['Siguiente, claro'] = await contrasteMinimo(page, '[class*="btnPrimary"]');
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForFunction(() => document.getAnimations().every((a) => !(a instanceof CSSTransition) || a.playState !== 'running'));
  medidas['Siguiente, oscuro'] = await contrasteMinimo(page, '[class*="btnPrimary"]');
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
  await page.waitForFunction(() => document.getAnimations().every((a) => !(a instanceof CSSTransition) || a.playState !== 'running'));
  medidas['Anterior, claro'] = await contrasteMinimo(page, '[class*="btnSecundario"]');
  const bajos = Object.entries(medidas).filter(([, r]) => r < 4.5).map(([k, r]) => `${k}: ${r.toFixed(2)}:1`);
  expect(bajos, 'textos por debajo de 4,5:1').toEqual([]);
});

test('ABIERTO: el porcentaje del progreso lleva espacio duro antes del «%» (CLAUDE.md §2)', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). `{progresoPct}% completado` pinta «10% completado» pegado.
  test.fail();
  await abrir(page);
  await radios(page).first().click();
  const etiqueta = await page.locator('[class*="progresoLabel"]').evaluate((e) => e.textContent ?? '');
  expect(etiqueta).toContain('10 % completado');
});

test('ABIERTO: el JSON-LD WebApplication lleva entre 4 y 8 featureList (§1.ter)', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). metadata.ts pasa `features: []` y el HTML servido sale con
  // «featureList»: [].
  test.fail();
  const html = await (await page.request.get('/selector-tipo-gimnasio/')).text();
  const app = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => JSON.parse(m[1]) as Record<string, unknown>)
    .find((b) => b['@type'] === 'WebApplication');
  const n = ((app?.featureList ?? []) as unknown[]).length;
  expect(n).toBeGreaterThanOrEqual(4);
  expect(n).toBeLessThanOrEqual(8);
});

test('ABIERTO: la guía educativa está en el HTML servido', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). <EducationalSection> va dentro de `if (mostrarResultado)`:
  // el HTML servido (el cuestionario) no lleva ni una línea de «¿Cómo elegir el entrenamiento
  // adecuado?», y quien no termina las 10 preguntas no la ve. La referencia lo reparó (2663).
  test.fail();
  const html = await (await page.request.get('/selector-tipo-gimnasio/')).text();
  expect(html).toContain('¿Cómo elegir el entrenamiento adecuado?');
});

test('ABIERTO: la guía describe clases por sus características, no por marcas registradas', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). «clases colectivas (zumba, spinning, bodypump...)»: tres
  // marcas registradas en la guía, cuando la pauta del catálogo es características, no marcas
  // (selector-smartphone retiró los modelos comerciales). «CrossFit», también marca, es además
  // el nombre de una de las cinco salidas y una keyword: eso lo decide el usuario (neutralidad
  // editorial, nivel 3), y este caso no lo fija.
  test.fail();
  test.setTimeout(60_000);
  await abrir(page);
  await responder(page, NORMAL_YOGA);
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByRole('heading', { name: 'Gimnasio tradicional' })).toBeVisible();
  const guia = (await page.locator('body').innerText()).toLowerCase();
  expect(guia).not.toMatch(/zumba|spinning|bodypump/);
});
