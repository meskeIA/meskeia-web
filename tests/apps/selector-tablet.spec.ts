import { test, expect, Page, devices } from '@playwright/test';

/**
 * Selector de Tablet (selector-tablet) — primera inspección, 10/10/2026
 *
 * QUÉ PROMETE LA APP
 *   <h1> «¿Qué Tablet Necesitas?»: «Responde 10 preguntas y descubre qué tipo de tablet se adapta
 *   mejor a tu estilo de vida». La meta description, applications.ts y el JSON-LD prometen CINCO
 *   salidas: «tablet Android, iPad/iOS, tablet Windows, eReader o prescindir de tablet», y «una
 *   comparativa tablet vs portátil», que es un párrafo de la guía educativa.
 *
 * EL MOTOR (calcularResultado, dentro de app/selector-tablet/page.tsx)
 *   Suma de puntos por candidata; cada opción reparte puntos entre android, ios_ipad, windows,
 *   ereader y sin_tablet. Gana el máximo con `>` estricto partiendo de 'android', así que un
 *   EMPATE lo decide el orden de declaración: android > ios_ipad > windows > ereader > sin_tablet.
 *   «También podrías considerar» son las dos siguientes por puntos (sort estable: mismo orden).
 *   El presupuesto (P3) y los requisitos «imprescindible» (P4, P5, P7) solo SUMAN puntos: nada
 *   descarta una candidata.
 *
 * BARRIDO DEL MOTOR (copia literal en un script aparte, los 174.960 perfiles = 5·3·4·3^6·4)
 *   · sin_tablet no gana en NINGUNO; como mucho empata en 2, y el orden se los da a Android.
 *   · iPad con «Menos de 150 €»: 6.481 perfiles; con «Entre 150 € y 350 €»: 6.528.
 *   · 17.635 perfiles (10,1 %) con empate en cabeza, 11.321 de ellos Android = iPad.
 *   · «Software de escritorio: Sí, es imprescindible»: 51.890 de 58.320 salen sin Windows
 *     (29.407 Android, 20.422 iPad, 2.061 eReader).
 *
 * Índices de los perfiles: base 0 en el orden de las opciones de page.tsx. Cada valor esperado de
 * abajo se resolvió a mano con la tabla de puntos ANTES de abrir el navegador.
 * Los casos con test.fail() demuestran hallazgos ABIERTOS (inspector 10/10/2026).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Ayudantes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La app no tiene ningún <input>, así que el ayudante de `_hidratacion.ts` no tiene testigo. El
 * equivalente en una app de solo botones es que React haya colgado sus props del primer botón con
 * el que se va a interactuar (mismo criterio que tests/apps/selector-smartphone.spec.ts).
 */
async function esperarHidratacion(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const boton = Array.from(document.querySelectorAll('button')).find((b) => /Leer libros/.test(b.textContent ?? ''));
      if (!boton) return false;
      return Object.keys(boton).some((k) => k.startsWith('__reactProps$') || k.startsWith('__reactFiber$'));
    },
    null,
    { timeout: 20_000 },
  );
}

async function abrir(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/selector-tablet/');
  await esperarHidratacion(page);
}

/** Las 10 respuestas de un perfil, cada una por un trozo único del texto de su opción. */
type Perfil = readonly [string, string, string, string, string, string, string, string, string, string];

const opcion = (page: Page, texto: string) => page.locator('main button', { hasText: texto }).first();
/** La opción marcada, con la semántica de hoy (aria-pressed) o la de la familia (radio + aria-checked). */
const MARCADA = 'main button[aria-pressed="true"], main [role="radio"][aria-checked="true"]';
const siguiente = (page: Page) => page.getByRole('button', { name: /^Siguiente/ });
const verResultado = (page: Page) => page.getByRole('button', { name: 'Ver resultado' });

/** Contesta y avanza, con una pausa tras «Siguiente» (nadie contesta sin leer la pregunta). */
async function responder(page: Page, perfil: Perfil): Promise<void> {
  for (let i = 0; i < perfil.length; i++) {
    await opcion(page, perfil[i]).click();
    if (i < perfil.length - 1) {
      await siguiente(page).click();
      await page.waitForTimeout(500);
    } else {
      await verResultado(page).click();
    }
  }
}

async function leerResultado(page: Page): Promise<{ titulo: string; alternativas: string[]; texto: string }> {
  const h2 = page.locator('[class*="resultadoCard"] h2');
  await h2.waitFor();
  return {
    titulo: (await h2.innerText()).trim(),
    alternativas: (await page.locator('[class*="alternativaItem"]').allInnerTexts()).map((t) => t.trim()),
    // Solo lo que el usuario se lleva: tarjeta, avisos y alternativas, hasta la «Nota:» fija. Debajo
    // vive la guía, que habla de software de escritorio y precios en general.
    texto: (await page.locator('main').innerText()).replace(/\s+/g, ' ').split('Nota:')[0],
  };
}

// ── Perfiles (puntos resueltos a mano: android · ios_ipad · windows · ereader · sin_tablet) ──

// P1 Leer · P2 Android · P3 150-350 · P4 No · P5 No · P6 Leo mucho · P7 No necesito · P8 adulto
// · P9 viajo · P10 portátil Windows → 16 · 3 · 1 · 19 · 6 → eReader; después Android (16) y Sin tablet (6).
const LECTOR: Perfil = [
  'Leer libros', 'Sí, tengo Android', 'Entre 150', 'escribiré poco', 'No lo usaré',
  'Leo mucho', 'No necesito software', 'uso adulto', 'transporte y viajes', 'portátil Windows',
];
// P1 Trabajo · P2 Android · P3 >700 · P4 Sí · P5 No · P6 Leo poco · P7 Sí imprescindible · P8 adulto
// · P9 casa · P10 No tengo portátil → 8 · 12 · 19 · 3 · 5 → Windows; después iPad (12) y Android (8).
const PROFESIONAL: Perfil = [
  'Trabajo y productividad', 'Sí, tengo Android', 'Más de 700', 'fundamental para mí', 'No lo usaré',
  'Leo poco', 'Sí, es imprescindible', 'uso adulto', 'Prácticamente siempre', 'No tengo portátil',
];
// C0016. P1 Dibujo · P2 iPhone · P3 MENOS DE 150 € · P4 A veces · P5 Sí · P6 Leo poco · P7 móviles/web
// · P8 adolescente · P9 viajo · P10 Mac → 17 · 24 · 0 · 5 · 3 → iPad, con un presupuesto de menos de 150 €.
const IPAD_150: Perfil = [
  'Dibujo digital', 'tengo iPhone', 'Menos de 150', 'A veces, pero', 'razones principales',
  'Leo poco', 'versiones móviles', 'adolescente', 'transporte y viajes', 'tengo Mac',
];
// P1 Entretenimiento · P2 iPhone · P3 350-700 · P4 A veces · P5 No · P6 Leo poco · P7 móviles/web
// · P8 niño < 10 · P9 viajo · P10 No tengo portátil → 17 · 17 · 5 · 4 · 2: EMPATE Android = iPad.
const EMPATE: Perfil = [
  'Entretenimiento', 'tengo iPhone', 'Entre 350', 'A veces, pero', 'No lo usaré',
  'Leo poco', 'versiones móviles', 'menor de 10', 'transporte y viajes', 'No tengo portátil',
];
// El perfil que la guía de la propia app describe como «no necesitas tablet»: lee poco, no dibuja,
// adulto, en casa, con un portátil Windows de uso intenso. P1 Entretenimiento · P2 Android · P3 <150
// · P4 No · P5 No · P6 Leo poco · P7 No necesito · P8 adulto · P9 casa · P10 portátil Windows
// → 17 · 5 · 2 · 10 · 11 → Android; después Sin tablet (11) y eReader (10).
const SIN_TABLET: Perfil = [
  'Entretenimiento', 'Sí, tengo Android', 'Menos de 150', 'escribiré poco', 'No lo usaré',
  'Leo poco', 'No necesito software', 'uso adulto', 'Prácticamente siempre', 'portátil Windows',
];
// P1 Leer · P2 Android · P3 <150 · P4 No · P5 No · P6 Leo mucho · P7 SOFTWARE DE ESCRITORIO IMPRESCINDIBLE
// · P8 adulto · P9 viajo · P10 PC poco → 12 · 4 · 7 · 18 · 5 → eReader; después Android (12) y Windows (7).
const LECTOR_CON_SOFTWARE: Perfil = [
  'Leer libros', 'Sí, tengo Android', 'Menos de 150', 'escribiré poco', 'No lo usaré',
  'Leo mucho', 'Sí, es imprescindible', 'uso adulto', 'transporte y viajes', 'lo uso poco',
];

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
      tapado: piezas.some((p) => letras.some((c) =>
        !(p.right <= c.left || p.left >= c.right || p.bottom <= c.top || p.top >= c.bottom))),
      top: Math.round(el.getBoundingClientRect().top),
      barra: Math.round(barra.getBoundingClientRect().bottom),
    };
  }, selector);
}

/** El centro de un botón después de dejarlo a media pantalla. */
async function centrar(page: Page, nombre: string | RegExp): Promise<{ x: number; y: number }> {
  const boton = page.getByRole('button', { name: nombre });
  await boton.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  const caja = (await boton.boundingBox())!;
  return { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Casos resueltos a mano (escritorio)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('casos resueltos a mano', () => {
  test('caso normal: el lector declarado sale eReader, con Android y Sin tablet detrás', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    await responder(page, LECTOR);
    const r = await leerResultado(page);
    // 16 · 3 · 1 · 19 · 6 → eReader (19); alternativas por puntos: Android (16), Sin tablet (6).
    expect(r.titulo).toBe('eReader (lector de libros electrónicos)');
    expect(r.alternativas).toEqual(['🤖 Tablet Android', '📱 Sin tablet adicional']);
  });

  test('caso normal: quien necesita teclado y software de escritorio sale tablet Windows', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    await responder(page, PROFESIONAL);
    const r = await leerResultado(page);
    // 8 · 12 · 19 · 3 · 5 → Windows (19); alternativas: iPad (12), Android (8).
    expect(r.titulo).toBe('Tablet Windows (2 en 1)');
    expect(r.alternativas).toEqual(['🍎 iPad (iOS)', '🤖 Tablet Android']);
  });

  test('rechazo y robustez: sin respuesta no se avanza, «Anterior» conserva y recalcula, «Repetir» vuelve a cero', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    // Sin respuesta, «Siguiente» está desactivado y en la pregunta 1 no hay «Anterior».
    await expect(siguiente(page)).toBeDisabled();
    await expect(page.getByRole('button', { name: /Anterior/ })).toHaveCount(0);

    // LECTOR hasta la 10, vuelta a la 6 (cuatro «Anterior») y «Leo mucho» → «Leo poco».
    // A mano: 16 · 3 · 1 · 19 · 6 − (P6 Leo mucho: ereader 4, android 1) + (Leo poco: android 2,
    // ios 2, sin 1) = 17 · 5 · 1 · 15 · 7 → Android; alternativas eReader (15) y Sin tablet (7).
    for (let i = 0; i < 10; i++) {
      await opcion(page, LECTOR[i]).click();
      if (i < 9) { await siguiente(page).click(); await page.waitForTimeout(500); }
    }
    for (let k = 0; k < 4; k++) await page.getByRole('button', { name: /Anterior/ }).click();
    await expect(page.getByRole('heading', { name: '¿Cuánto lees actualmente (libros, artículos largos)?' })).toBeVisible();
    // Marcada hoy con aria-pressed; tras la receta de la familia, con role="radio" + aria-checked.
    await expect(page.locator(MARCADA)).toHaveText(/Leo mucho/);
    await opcion(page, 'Leo poco').click();
    for (let k = 0; k < 4; k++) { await siguiente(page).click(); await page.waitForTimeout(300); }
    // La 10 conserva lo que ya se había contestado.
    await expect(verResultado(page)).toBeEnabled();
    await verResultado(page).click();
    const r = await leerResultado(page);
    expect(r.titulo).toBe('Tablet Android');
    expect(r.alternativas).toEqual(['📚 eReader', '📱 Sin tablet adicional']);

    // «Repetir el test» vuelve a la pregunta 1 sin ninguna respuesta.
    await page.getByRole('button', { name: 'Repetir el test' }).click();
    await expect(page.getByRole('heading', { name: '¿Cuál será tu uso principal de la tablet?' })).toBeVisible();
    await expect(page.locator(MARCADA)).toHaveCount(0);
    await expect(siguiente(page)).toBeDisabled();
  });

  test('invariante de familia, mitad que SÍ cumple: la barra anuncia la misma fracción que pinta', async ({ page }) => {
    await abrir(page);
    // La barra es el contenedor role="progressbar" con el texto «N / 10» y la pista; el relleno es
    // `progresoFill`. A mano: P1 sin responder 0 · P1 respondida 0,1 · P2 sin responder 0,1.
    const leer = () => page.evaluate(() => {
      const b = document.querySelector('[role="progressbar"]')!;
      const fill = b.querySelector('[class*="progresoFill"]')!;
      const pista = b.querySelector('[class*="progresoBar"]') as HTMLElement;
      const n = (a: string) => Number(b.getAttribute(a));
      return {
        anunciada: (n('aria-valuenow') - n('aria-valuemin')) / (n('aria-valuemax') - n('aria-valuemin')),
        pintada: fill.getBoundingClientRect().width / pista.clientWidth,
      };
    });
    const comprobar = async (esperada: number, momento: string) => {
      await expect.poll(async () => (await leer()).pintada, { message: `${momento}: pintada` }).toBeCloseTo(esperada, 2);
      expect((await leer()).anunciada, `${momento}: anunciada`).toBeCloseTo(esperada, 6);
    };
    await comprobar(0, 'P1 sin responder');
    await opcion(page, 'Leer libros').click();
    await comprobar(0.1, 'P1 respondida');
    await siguiente(page).click();
    await comprobar(0.1, 'P2 sin responder');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Hallazgos del motor — ABIERTOS (inspector 10/10/2026)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('hallazgos del motor', () => {
  test('«Sin tablet» es inalcanzable: el perfil que la guía describe como «no la necesitas» sale Android', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). La guía de la app: «Una tablet aporta valor real cuando lees
    // mucho en pantalla grande, dibujas digitalmente, tienes hijos en edad escolar o necesitas un
    // segundo dispositivo más ligero para viajar». SIN_TABLET no cumple ninguna, y aun así:
    // 17 · 5 · 2 · 10 · 11 → Android. En el barrido, sin_tablet no gana en ninguno de 174.960.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await responder(page, SIN_TABLET);
    const r = await leerResultado(page);
    expect(r.titulo).toMatch(/sin tablet/i);
  });

  test('C0016: el presupuesto solo suma puntos — iPad con «Menos de 150 €» y sin una palabra del precio', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Forma del 1678 de selector-smartphone (GAMA_MINIMA_IPHONE_NUEVO)
    // y del 1407 de selector-portatil (MAC_GAMA_MINIMA): no hay iPad nuevo por debajo de 150 €, y la
    // app lo recomienda sin decirlo. IPAD_150: 17 · 24 · 0 · 5 · 3 → iPad (6.481 perfiles así con
    // «Menos de 150 €» y 6.528 con «Entre 150 € y 350 €»). Correcto: o no sale iPad, o la pantalla
    // dice que en ese tramo no hay iPad nuevo.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await responder(page, IPAD_150);
    const r = await leerResultado(page);
    const ipadSinAviso = r.titulo === 'iPad (iOS)' && !/presupuesto|150\s?€|reacondicionad|segunda mano/i.test(r.texto);
    expect(ipadSinAviso, `resultado «${r.titulo}»`).toBe(false);
  });

  test('un requisito «imprescindible» solo suma: eReader a quien necesita software de escritorio', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). P7 «Sí, es imprescindible» (Adobe CC, Office completo…) y la
    // app recomienda un eReader, que no ejecuta ningún programa de escritorio; la propia guía dice
    // que para eso «la mejor opción» es la tablet Windows, y el FAQPage, que «es más adecuada».
    // LECTOR_CON_SOFTWARE: 12 · 4 · 7 · 18 · 5 → eReader. Correcto: descartar lo que incumple el
    // requisito declarado, o decirlo en el resultado.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await responder(page, LECTOR_CON_SOFTWARE);
    const r = await leerResultado(page);
    const incumpleSinAviso = r.titulo.startsWith('eReader') && !/software|escritorio|programas/i.test(r.texto);
    expect(incumpleSinAviso, `resultado «${r.titulo}»`).toBe(false);
  });

  test('empate silencioso: con Android = iPad (17 y 17) gana Android por el orden del código', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). EMPATE: 17 · 17 · 5 · 4 · 2. El reduce con `>` estricto se
    // queda con 'android', la primera clave, y el iPad baja a «También podrías considerar» sin que
    // nada diga que empatan. 17.635 perfiles (10,1 %) tienen empate en cabeza. Medido hoy: «Tablet
    // Android» y, primera de «También podrías considerar», «🍎 iPad (iOS)».
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await responder(page, EMPATE);
    const r = await leerResultado(page);
    // Correcto: el resultado dice que hay empate (o lo deshace con un criterio que explica).
    expect(r.texto).toMatch(/empat|igual de adecuad|misma puntuaci/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Accesibilidad, foco y lo que se sirve — ABIERTOS (inspector 10/10/2026)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('accesibilidad y foco', () => {
  test('invariante de familia, mitad que NO cumple: las opciones son radios con aria-checked, sin aria-pressed', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Hoy: contenedor role="group" y cinco <button aria-pressed>
    // (un conmutador) para una elección ÚNICA. La referencia (selector-smartphone, hallazgo 950):
    // role="radiogroup" + role="radio" con aria-checked, uno solo marcado.
    test.fail();
    await abrir(page);
    const grupo = page.locator('[role="radiogroup"]');
    expect(await grupo.count(), 'hay un radiogroup').toBe(1);
    await expect(grupo.locator('[role="radio"]')).toHaveCount(5);
    await expect(grupo.locator('[aria-pressed]')).toHaveCount(0);
  });

  test('teclado del patrón de radios: flechas mueven y marcan, y el grupo es una sola parada de Tab', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Hoy cada opción es una parada de Tab (tabIndex 0 en las cinco)
    // y ArrowDown no mueve el foco ni marca nada (receta del 1681 de la referencia).
    test.fail();
    await abrir(page);
    const opciones = page.locator('main [class*="opciones"] button');
    expect(await opciones.evaluateAll((els) => els.map((e) => (e as HTMLElement).tabIndex))).toEqual([0, -1, -1, -1, -1]);
    await opciones.nth(0).focus();
    await page.keyboard.press('ArrowDown');
    await expect(opciones.nth(1)).toBeFocused({ timeout: 1_000 });
  });

  test('tras «Siguiente» el foco va al enunciado nuevo, no a <body>', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). «Siguiente» se desactiva al llegar la pregunta nueva y el foco
    // cae a <body>: el siguiente Tab va a «Selector de Smartphone» (Apps relacionadas), DESPUÉS del
    // cuestionario. Igual tras «Anterior» y «Ver resultado» (receta del 1680 de la referencia).
    test.fail();
    await abrir(page);
    await opcion(page, 'Leer libros').click();
    await siguiente(page).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: '¿Tienes ya smartphone y cuál es su sistema operativo?' })).toBeVisible();
    const dentro = await page.evaluate(() => !!document.activeElement?.closest('main'));
    expect(dentro, 'el foco sigue dentro del cuestionario').toBe(true);
  });

  test('al llegar al resultado, su título se ve y tiene el foco (escritorio 1280 × 720)', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). El resultado sustituye al cuestionario sin mover la página:
    // medido, scrollY 471 y el <h2> del resultado en y −20..13, cortado por arriba; foco en <body>.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await responder(page, PROFESIONAL);
    const h2 = page.locator('[class*="resultadoCard"] h2');
    await h2.waitFor();
    await expect(h2).toBeFocused({ timeout: 1_000 });
  });

  test('botones y textos de marca llegan a 4,5:1 en claro y oscuro', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Medido: «Siguiente →» (16 px/600, blanco sobre el degradado
    // --primary→--secondary) 3,26:1 claro · 2,45:1 oscuro · «← Anterior» (15,2 px/600, --primary)
    // 3,93:1 claro · píldora «Pregunta N» (12,5 px/700) 2,97 · 2,31 · «Repetir el test» 3,18 · 2,41.
    // Ninguno es texto grande. Reparado así en la referencia (1682): --primary-boton / --primary-texto.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await opcion(page, 'Leer libros').click();
    await siguiente(page).click();
    await page.waitForTimeout(300);
    await opcion(page, 'tengo iPhone').click();
    const medidas: Record<string, number> = {};
    for (const tema of ['light', 'dark'] as const) {
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => !(a instanceof CSSTransition) || a.playState !== 'running'));
      medidas[`Siguiente, ${tema}`] = await contrasteMinimo(page, '[class*="btnPrimary"]');
      medidas[`Anterior, ${tema}`] = await contrasteMinimo(page, '[class*="btnSecundario"]');
      medidas[`Pregunta N, ${tema}`] = await contrasteMinimo(page, '[class*="numeroPregunta"]');
    }
    const bajos = Object.entries(medidas).filter(([, v]) => v < 4.5).map(([k, v]) => `${k}: ${v.toFixed(2)}:1`);
    expect(bajos, 'textos por debajo de 4,5:1').toEqual([]);
  });
});

test.describe('contenido y HTML servido', () => {
  test('la guía educativa (con la «comparativa tablet vs portátil» que promete la description) está en el HTML servido', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). EducationalSection vive dentro de la rama del resultado: el HTML
    // servido no trae ni una línea de la guía, y quien no termina las 10 preguntas tampoco la ve.
    // Forma del 2663 de selector-smartphone.
    test.fail();
    const html = await (await page.request.get('/selector-tablet/')).text();
    expect(html).toContain('Tipos de tablets: diferencias clave');
  });

  test('el JSON-LD WebApplication lleva entre 4 y 8 featureList (§1.ter del CLAUDE.md)', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). metadata.ts pasa `features: []`; servido: "featureList":[].
    test.fail();
    const html = await (await page.request.get('/selector-tablet/')).text();
    const bloques = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]) as Record<string, unknown>);
    const app = bloques.find((b) => b['@type'] === 'WebApplication');
    expect(((app?.featureList ?? []) as unknown[]).length).toBeGreaterThanOrEqual(4);
  });

  test('«2025» no aparece como año en curso (cabo C0005): solo la fecha ISO del JSON-LD', async ({ page }) => {
    // Medido: page.tsx y metadata.ts no lo contienen; en el HTML solo sale "datePublished":"2025-01-22".
    const html = await (await page.request.get('/selector-tablet/')).text();
    const contextos = [...html.matchAll(/.{0,20}\b2025\b.{0,6}/g)].map((m) => m[0]);
    for (const c of contextos) expect(c).toMatch(/datePublished\\?":\\?"2025-01-22/);
  });

  test('el resultado no nombra marcas ni modelos (pauta del catálogo, commit 81fd4bea)', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). La tarjeta del eReader dice «Dispositivos como Kindle o Kobo
    // ofrecen la mejor experiencia de lectura posible» y la de Android «gamas altas como Samsung
    // Galaxy Tab»; la guía añade «Kindle Paperwhite», «Surface, HP Spectre», «Samsung Galaxy Tab,
    // Lenovo, Xiaomi», y el FAQPage «Surface» dos veces. La pauta: características a buscar, no
    // marcas ni modelos. iPadOS / Android como plataforma no cuentan (como iOS en la referencia).
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await responder(page, LECTOR);
    const tarjeta = await page.locator('[class*="resultadoCard"]').innerText();
    expect(tarjeta).not.toMatch(/Kindle|Kobo|Samsung|Galaxy|Surface|Spectre|Lenovo|Xiaomi/);
  });

  test('con el presupuesto en euros, la app declara el ámbito de sus datos (RegionBadge es-data)', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). P3 en euros («Menos de 150 €»…) y la tarjeta de Android
    // «desde 100 €», sin RegionBadge: forma del 949 de selector-smartphone.
    test.fail();
    await abrir(page);
    await expect(page.getByText(/Datos de referencia: España/)).toBeVisible({ timeout: 1_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Móvil: barra del logo, aterrizaje del resultado y doble toque
// ─────────────────────────────────────────────────────────────────────────────

test.describe('móvil 360 px', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('con toques: el <h1> no queda bajo la barra del logo y se llega al resultado sin desbordar', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    // El lote del hero (80 px arriba hasta 1.023 px) sí llegó: h1 en y 80, barra hasta y 62.
    const h1 = await bajoLaBarra(page, 'h1');
    expect(h1.tapado).toBe(false);
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(500);
      await opcion(page, LECTOR[i]).tap();
      await (i < 9 ? siguiente(page) : verResultado(page)).tap();
    }
    const r = await leerResultado(page);
    expect(r.titulo).toBe('eReader (lector de libros electrónicos)'); // mismo cálculo que el caso normal
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });

  test('tras tocar «Siguiente», el enunciado nuevo no queda fuera de pantalla ni bajo la barra', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). «Siguiente» está en y 920 con 740 de alto: hay que bajar para
    // tocarlo, y la pregunta nueva se pinta en el sitio sin mover la página. Medido tocando el botón a
    // media pantalla: P2 en y −161..−110 (fuera), P3-P7, P9 y P10 bajo la barra (hasta y 62).
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    const medidas: string[] = [];
    for (let i = 1; i <= 3; i++) {
      await page.waitForTimeout(500);
      await page.locator('main [class*="opciones"] button').first().tap();
      const p = await centrar(page, /^Siguiente/);
      await page.touchscreen.tap(p.x, p.y);
      await page.waitForTimeout(300);
      const m = await bajoLaBarra(page, 'main h2');
      if (m.tapado || m.top < m.barra) medidas.push(`P${i + 1}: enunciado en y ${m.top}, barra hasta ${m.barra}`);
    }
    expect(medidas, 'enunciados fuera o bajo la barra del logo').toEqual([]);
  });

  test('al tocar «Ver resultado», el título del resultado se ve, no queda bajo la barra y tiene el foco', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Medido: scrollY 481, <h2> del resultado en y −37..−5 (por
    // encima del borde) y la tarjeta en y −175..256; foco en <body>.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    for (let i = 0; i < 9; i++) {
      await opcion(page, LECTOR[i]).click();
      await siguiente(page).click();
      await page.waitForTimeout(300);
    }
    await opcion(page, LECTOR[9]).click();
    const p = await centrar(page, 'Ver resultado');
    await page.touchscreen.tap(p.x, p.y);
    const h2 = page.locator('[class*="resultadoCard"] h2');
    await h2.waitFor();
    await page.waitForTimeout(300);
    const m = await bajoLaBarra(page, '[class*="resultadoCard"] h2');
    expect(m.tapado || m.top < m.barra, `título en y ${m.top}, barra hasta ${m.barra}`).toBe(false);
    await expect(h2).toBeFocused({ timeout: 1_000 });
  });

  test('un doble toque en «Siguiente» de la pregunta 1 no saca de la app', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). P1 tiene 5 opciones y P2 tres: la botonera sube bajo el dedo y
    // el 2.º toque cae en la tarjeta «Selector de Smartphone» de Apps relacionadas. Medido con el
    // botón centrado (y 370): navega a /selector-smartphone/ y se pierde el test.
    test.fail();
    await abrir(page);
    await page.locator('main [class*="opciones"] button').last().tap();
    const p = await centrar(page, /^Siguiente/);
    await page.mouse.dblclick(p.x, p.y);
    await page.waitForTimeout(800);
    expect(new URL(page.url()).pathname).toBe('/selector-tablet/');
  });

  test('un doble toque en «Siguiente» de la pregunta 9 no contesta la 10', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). P9 tiene 3 opciones y P10 cuatro: la botonera baja y el 2.º
    // toque marca «No tengo portátil o mi PC está anticuado» (+3 Windows, +2 iPad, +2 Android) sin que
    // nadie lo elija. A 360 px pasa lo mismo de P6 a P7 («No necesito software de escritorio»), y de
    // P3 a P4 el 2.º toque cae en «Anterior» y devuelve a la P3.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    for (let i = 0; i < 8; i++) {
      await opcion(page, LECTOR[i]).click();
      await siguiente(page).click();
      await page.waitForTimeout(300);
    }
    await opcion(page, 'Prácticamente siempre').tap();
    const p = await centrar(page, /^Siguiente/);
    await page.mouse.dblclick(p.x, p.y);
    await expect(page.getByRole('heading', { name: '¿Ya tienes un portátil o PC que usas con frecuencia?' })).toBeVisible();
    await page.waitForTimeout(400);
    expect(await page.locator(MARCADA).allInnerTexts()).toEqual([]);
  });
});

test.describe('móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('al tocar «Ver resultado», el título del resultado no queda bajo la barra del logo', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Medido: scrollY 429 y el <h2> del resultado en y 15..47, bajo
    // la píldora del logo (y 10..52); la barra acaba en y 62. Foco en <body>.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    for (let i = 0; i < 9; i++) {
      await opcion(page, LECTOR[i]).click();
      await siguiente(page).click();
      await page.waitForTimeout(300);
    }
    await opcion(page, LECTOR[9]).click();
    const p = await centrar(page, 'Ver resultado');
    await page.touchscreen.tap(p.x, p.y);
    await page.locator('[class*="resultadoCard"] h2').waitFor();
    await page.waitForTimeout(300);
    const m = await bajoLaBarra(page, '[class*="resultadoCard"] h2');
    expect(m.tapado || m.top < m.barra, `título en y ${m.top}, barra hasta ${m.barra}`).toBe(false);
  });

  test('un doble toque en «Siguiente» de la pregunta 1 no saca de la app', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Igual que a 360 px: botón centrado en y 422 → /selector-smartphone/.
    test.fail();
    await abrir(page);
    await page.locator('main [class*="opciones"] button').last().tap();
    const p = await centrar(page, /^Siguiente/);
    await page.mouse.dblclick(p.x, p.y);
    await page.waitForTimeout(800);
    expect(new URL(page.url()).pathname).toBe('/selector-tablet/');
  });

  test('un doble toque en «Ver resultado» no saca de la app ni reinicia el test', async ({ page }) => {
    // Rechazo que SÍ se cumple: medido con cuatro perfiles (eReader, Windows, iPad, Android) a 360 y
    // 390 px, el 2.º toque cae en «También podrías considerar», que no es interactivo.
    test.setTimeout(60_000);
    await abrir(page);
    for (let i = 0; i < 9; i++) {
      await opcion(page, PROFESIONAL[i]).click();
      await siguiente(page).click();
      await page.waitForTimeout(300);
    }
    await opcion(page, PROFESIONAL[9]).click();
    const p = await centrar(page, 'Ver resultado');
    await page.mouse.dblclick(p.x, p.y);
    await page.waitForTimeout(600);
    expect(new URL(page.url()).pathname).toBe('/selector-tablet/');
    const r = await leerResultado(page);
    expect(r.titulo).toBe('Tablet Windows (2 en 1)'); // 8 · 12 · 19 · 3 · 5, como en escritorio
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Contraste (función del spec de selector-smartphone)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Contraste MÍNIMO del texto de un elemento contra su fondo real: en cada esquina de cada línea
 * del texto, con la opacidad acumulada, sobre las capas de fondo compuestas hasta la primera
 * opaca; un degradado lineal se evalúa en ese mismo punto.
 */
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
