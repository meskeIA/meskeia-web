import { test, expect, Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Inspector — test-tipo-lector (segmento interactiva, riesgo 4)
 *
 * Primera inspección: 31/08/2026 (552 usos reales), veredicto `ok`.
 * Re-inspección: 02/10/2026 (842 usos). La invalidaron tres lotes de CSS transversales, no la
 * lógica: b7733c6d (cabeceras de tabla con --primary-boton), 586a4d61 y a1d72a9c (80 px arriba
 * en el hero hasta 1023 px para que la barra fija del logo no tape el título). Los tres se
 * comprueban abajo («Lotes de CSS»), y la inspección se hizo entera: salieron diez hallazgos.
 *
 * Resuelto a mano ANTES de abrir el navegador, leyendo `app/test-tipo-lector/page.tsx` (no hay
 * motor en `lib/`: preguntas, puntuación y los 5 arquetipos están inline en el componente).
 *
 * LA ARITMÉTICA
 *   8 preguntas (`PREGUNTAS`), 5 opciones cada una, SIEMPRE en el mismo orden de arquetipo:
 *     A = detective · B = explorador · C = empatico · D = esteta · E = pensador
 *   Cada respuesta suma 2 puntos a su arquetipo (`handleSiguiente`). Máximo posible en un
 *   arquetipo: 8×2 = 16 (si se elige la misma letra las 8 veces). Total repartido siempre 16.
 *
 *   Ganador (`resultado`, con `Object.entries(puntos).reduce`, comparación estricta `>`):
 *     recorre las categorías en el orden en que se declaran en `puntuacionInicial()` —
 *     detective, explorador, empatico, esteta, pensador— y sustituye el máximo solo si el
 *     candidato es ESTRICTAMENTE mayor. En un empate exacto gana quien aparece ANTES en ese
 *     orden, y la pantalla no lo dice.
 *
 *   La primera inspección lo dio por bueno («es determinista y siempre da un único arquetipo»).
 *   La segunda lo contó: de las 5^8 = 390.625 combinaciones de respuestas, 114.100 (29,21 %)
 *   acaban en empate en cabeza (51.100 dobles, 50.400 triples, 12.600 cuádruples). Con
 *   respuestas al azar, un test simétrico daría el 20 % a cada perfil; este da Detective
 *   29,71 % · Explorador 22,60 % · Empático 18,06 % · Esteta 15,47 % · Pensador 14,16 %, y el
 *   Pensador no gana un solo empate. Hallazgo de hoy: ver «Empates» abajo.
 */

const RUTA = '/test-tipo-lector/';

/** Los 5 botones de respuesta de la pregunta activa (CSS Modules: clase con hash). */
const opcion = (page: Page, i: number) => page.locator('button[class*="opcion"]').nth(i);
const botonSiguiente = (page: Page) => page.locator('button[class*="btnSiguiente"]');
const nombreResultado = (page: Page) => page.locator('[class*="resultadoNombre"]');
const seccionResultado = (page: Page) => page.locator('section[class*="resultado"]');
const etiquetaPregunta = (page: Page) => page.locator('[class*="progresoLabel"]').nth(0);
const etiquetaPorcentaje = (page: Page) => page.locator('[class*="progresoLabel"]').nth(1);

const LETRA: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };

/** Abre la app y espera a que React haya hidratado: un clic anterior se pierde. */
async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

/** Contesta el test entero. `indices` son 0=A(detective) 1=B(explorador) 2=C(empatico) 3=D(esteta) 4=E(pensador). */
async function responder(page: Page, indices: number[]): Promise<void> {
  for (const i of indices) {
    await opcion(page, i).click();
    await botonSiguiente(page).click();
  }
}

/** Igual que `responder`, con las letras: 'BEBCBEAD'. */
const responderLetras = (page: Page, letras: string): Promise<void> =>
  responder(page, [...letras].map((l) => LETRA[l]));

/**
 * Contraste del texto de `selector` contra su fondo EFECTIVO: compone los fondos rgba de los
 * ancestros sobre el del <body> y aplica la opacidad acumulada al color del texto.
 */
async function contraste(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return 0;
    type C = { r: number; g: number; b: number; a: number };
    const leer = (s: string): C | null => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const sobre = (t: C, b: C): C => ({
      r: t.r * t.a + b.r * (1 - t.a),
      g: t.g * t.a + b.g * (1 - t.a),
      b: t.b * t.a + b.b * (1 - t.a),
      a: 1,
    });
    const lum = (c: C): number => {
      const f = (v: number): number => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const capas: C[] = [];
    let n: Element | null = el;
    while (n) {
      const c = leer(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) capas.push(c);
      if (c && c.a === 1) break;
      n = n.parentElement;
    }
    let fondo: C = { r: 255, g: 255, b: 255, a: 1 };
    if (!capas.length || capas[capas.length - 1].a < 1) {
      fondo = leer(getComputedStyle(document.body).backgroundColor) ?? fondo;
    }
    for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
    let opacidad = 1;
    for (let m: Element | null = el; m; m = m.parentElement) opacidad *= Number(getComputedStyle(m).opacity);
    const t = leer(getComputedStyle(el).color) as C;
    const texto = sobre({ ...t, a: t.a * opacidad }, fondo);
    const [a, b] = [lum(texto), lum(fondo)];
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }, selector);
}

/**
 * Área (px²) en la que las líneas de TEXTO de `selector` se cruzan con lo que lleva la barra
 * fija del logo (la píldora y el conmutador de tema). 0 = la barra no tapa nada.
 */
async function solapeConBarra(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const barra = document.querySelector('[class*="headerBar"]');
    if (!el || !barra) return -1;
    const rango = document.createRange();
    rango.selectNodeContents(el);
    const lineas = Array.from(rango.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
    const fijos = Array.from(barra.children)
      .map((c) => c.getBoundingClientRect())
      .filter((r) => r.width > 0);
    let area = 0;
    for (const l of lineas)
      for (const f of fijos) {
        const ancho = Math.min(l.right, f.right) - Math.max(l.left, f.left);
        const alto = Math.min(l.bottom, f.bottom) - Math.max(l.top, f.top);
        if (ancho > 0 && alto > 0) area += ancho * alto;
      }
    return Math.round(area);
  }, selector);
}

test.describe('Caso 1: perfil A claro — todo Detective', () => {
  test('las 8 respuestas A dan detective 16-0-0-0-0 → El Detective', async ({ page }) => {
    await abrir(page);
    await expect(page.getByText('Pregunta 1 de 8')).toBeVisible();
    // Cálculo a mano: 8 × (opción A = detective, +2) = 16 puntos detective, 0 el resto.
    // Object.entries recorre detective primero y 16 > 0 (el máximo inicial), así que gana.
    await responder(page, [0, 0, 0, 0, 0, 0, 0, 0]);

    await expect(nombreResultado(page)).toHaveText('El Detective');
    // Bloques del resultado propios de ARQUETIPOS.detective
    await expect(page.locator('[class*="generoTag"]').first()).toHaveText('Thriller');
    await expect(page.locator('[class*="autorItem"]').first()).toHaveText('Agatha Christie');
    await expect(page.locator('[class*="lecturaTitulo"]').first()).toHaveText('El nombre de la rosa');
  });
});

test.describe('Caso 2: perfil B claro — todo Empático', () => {
  test('las 8 respuestas C dan empatico 16-0-0-0-0 → El Empático', async ({ page }) => {
    await abrir(page);
    // Cálculo a mano: 8 × (opción C = empatico, +2) = 16 puntos empatico, 0 el resto.
    await responder(page, [2, 2, 2, 2, 2, 2, 2, 2]);

    await expect(nombreResultado(page)).toHaveText('El Empático');
    await expect(page.locator('[class*="generoTag"]').first()).toHaveText('Novela contemporánea');
    await expect(page.locator('[class*="autorItem"]').first()).toHaveText('Elena Ferrante');
  });
});

test.describe('Caso 3: empate exacto en el límite — Esteta vs Pensador', () => {
  // Desde el 02/10/2026 el desempate silencioso es un hallazgo (ver «Empates»). Estos dos casos
  // solo fijan lo que seguirá siendo cierto tras repararlo: que El Esteta, primero en el orden
  // de declaración, está en el resultado. Por eso `toContainText` y no `toHaveText`.
  test('4×D + 4×E empata esteta=8 y pensador=8 → sale El Esteta por orden de declaración', async ({
    page,
  }) => {
    await abrir(page);
    // Cálculo a mano: preguntas 1-4 opción D (esteta, +2 cada una) = 8 puntos esteta.
    // Preguntas 5-8 opción E (pensador, +2 cada una) = 8 puntos pensador. Empate 8-8.
    // El reduce compara con `>` estricto y recorre detective→explorador→empatico→esteta→
    // pensador: cuando llega a esteta (8 > 0 del máximo previo) lo adopta como ganador;
    // cuando llega a pensador, 8 no es > 8, así que NO lo sustituye. Gana esteta.
    await responder(page, [3, 3, 3, 3, 4, 4, 4, 4]);

    await expect(nombreResultado(page)).toContainText('El Esteta');
    await expect(page.locator('[class*="generoTag"]').first()).toHaveText('Novela literaria');
    await expect(page.locator('[class*="autorItem"]').first()).toHaveText('Vladimir Nabokov');
  });

  test('el orden inverso del mismo empate (4×E + 4×D) también da El Esteta', async ({ page }) => {
    // Confirma que el criterio de desempate depende del ORDEN DE DECLARACIÓN de los
    // arquetipos, no del orden en que se contestan las preguntas: aquí se responde
    // primero pensador y luego esteta, y el resultado es idéntico al caso anterior.
    await abrir(page);
    await responder(page, [4, 4, 4, 4, 3, 3, 3, 3]);
    await expect(nombreResultado(page)).toContainText('El Esteta');
  });
});

test.describe('Operativa: navegación, accesibilidad y reinicio', () => {
  test('progreso, aria-pressed y type="button" se comportan como exige el proyecto', async ({
    page,
  }) => {
    await abrir(page);
    // `\s?` admite el «0%» de hoy y el «0 %» con espacio duro que pide el hallazgo de formato
    // (ver «Formato del porcentaje»): este caso vigila la cifra, no el espacio.
    await expect(etiquetaPorcentaje(page)).toHaveText(/^0\s?%$/);
    await expect(botonSiguiente(page)).toBeDisabled(); // nada seleccionado aún

    await opcion(page, 1).click();
    // Toggle: solo la opción pulsada lleva aria-pressed="true"
    await expect(opcion(page, 1)).toHaveAttribute('aria-pressed', 'true');
    await expect(opcion(page, 0)).toHaveAttribute('aria-pressed', 'false');
    await expect(botonSiguiente(page)).toBeEnabled();

    // Las 5 opciones y el botón "Siguiente" son type="button" (regla obligatoria del proyecto)
    const sinTypeButton = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button[class*="opcion"], button[class*="btnSiguiente"]')).filter(
        (b) => b.getAttribute('type') !== 'button',
      ).length,
    );
    expect(sinTypeButton).toBe(0);

    await botonSiguiente(page).click();
    await expect(page.getByText('Pregunta 2 de 8')).toBeVisible();
    await expect(etiquetaPorcentaje(page)).toHaveText(/^13\s?%$/); // Math.round(1/8*100) = 13

    // La última pregunta cambia el texto del botón
    await responder(page, [0, 0, 0, 0, 0, 0]); // preguntas 2-7
    await expect(etiquetaPregunta(page)).toHaveText('Pregunta 8 de 8');
    await expect(etiquetaPorcentaje(page)).toHaveText(/^88\s?%$/); // Math.round(7/8*100) = 88
    await expect(botonSiguiente(page)).toHaveText('Ver mi resultado');
    await responder(page, [0]);
    await expect(nombreResultado(page)).toBeVisible();

    await page.locator('button[class*="btnReiniciar"]').click();
    await expect(page.getByText('Pregunta 1 de 8')).toBeVisible();
    await expect(page.locator('button[class*="opcion"][aria-pressed="true"]')).toHaveCount(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════
// Re-inspección 02/10/2026 — casos nuevos, resueltos a mano antes de ejecutar
// ═══════════════════════════════════════════════════════════════════════════════════════

test.describe('Cálculo: secuencias mixtas, extremos y recuento', () => {
  test('B,E,B,C,B,E,A,D → explorador 6, pensador 4, el resto 2 → El Explorador', async ({ page }) => {
    await abrir(page);
    // A mano: B en las preguntas 1, 3 y 5 = 3×2 = 6 explorador · E en la 2 y la 6 = 4 pensador ·
    // C (4) = 2 empático · A (7) = 2 detective · D (8) = 2 esteta. Suma 16. Máximo único: 6.
    await responderLetras(page, 'BEBCBEAD');
    await expect(nombreResultado(page)).toHaveText('El Explorador');
    await expect(page.locator('[class*="generoTag"]').first()).toHaveText('Fantasía épica');
  });

  test('las 8 en E → pensador 16: el ÚLTIMO arquetipo declarado también puede ganar', async ({ page }) => {
    await abrir(page);
    // A mano: 8 × 2 = 16 pensador, 0 el resto. 16 > 0 aunque pensador se recorra el último.
    await responderLetras(page, 'EEEEEEEE');
    await expect(nombreResultado(page)).toHaveText('El Pensador');
    await expect(page.locator('[class*="autorItem"]').first()).toHaveText('Fiódor Dostoievski');
  });

  test('cambiar de opción antes de «Siguiente» cuenta solo la última elegida', async ({ page }) => {
    await abrir(page);
    // Preguntas 1-5: se pulsa A y luego E (cuenta E) → pensador 10. Preguntas 6-8: A → detective 6.
    // Si contara la primera pulsada, saldría detective 16 → El Detective.
    for (let q = 0; q < 5; q++) {
      await opcion(page, LETRA.A).click();
      await opcion(page, LETRA.E).click();
      await expect(opcion(page, LETRA.A)).toHaveAttribute('aria-pressed', 'false');
      await botonSiguiente(page).click();
    }
    await responderLetras(page, 'AAA');
    await expect(nombreResultado(page)).toHaveText('El Pensador');
  });

  test('«Repetir el test» recuenta desde cero', async ({ page }) => {
    await abrir(page);
    await responderLetras(page, 'AAAAAAAA'); // detective 16
    await expect(nombreResultado(page)).toHaveText('El Detective');
    await page.locator('button[class*="btnReiniciar"]').click();
    await expect(etiquetaPregunta(page)).toHaveText('Pregunta 1 de 8');
    // A mano: pensador 16 y detective 0. Si los puntos no se reiniciaran, detective 16 =
    // pensador 16 y el desempate por orden daría El Detective.
    await responderLetras(page, 'EEEEEEEE');
    await expect(nombreResultado(page)).toHaveText('El Pensador');
  });

  test('sin contestar no se avanza, ni forzando el clic', async ({ page }) => {
    await abrir(page);
    await expect(botonSiguiente(page)).toBeDisabled();
    await botonSiguiente(page).dispatchEvent('click'); // un clic sintético salta el `disabled`
    await expect(etiquetaPregunta(page)).toHaveText('Pregunta 1 de 8');
  });

  test('doble clic en «Siguiente» avanza UNA pregunta y suma una sola vez', async ({ page }) => {
    await abrir(page);
    await opcion(page, LETRA.E).click();
    await botonSiguiente(page).dblclick();
    await expect(etiquetaPregunta(page)).toHaveText('Pregunta 2 de 8');
    // A mano: pensador 2 (la pregunta 1) + 7×A = detective 14 → El Detective, con 7 respuestas
    // más exactas hasta el resultado (si el doble clic hubiera saltado una, sobraría un clic).
    await responderLetras(page, 'AAAAAAA');
    await expect(nombreResultado(page)).toHaveText('El Detective');
  });
});

test.describe('Empates — hallazgo ABIERTO del 02/10/2026', () => {
  // E,E,E,A,A,A,C,D → pensador 6 = detective 6, empático 2, esteta 2. El reduce se queda con
  // detective (primero declarado) y la pantalla dice «Tu perfil lector es El Detective» sin
  // mencionar al Pensador. El FAQ promete «el perfil dominante» «en función de la suma de tus
  // respuestas»: en un empate no lo hay. Lo correcto es decir el empate (o mostrar los dos).
  test.fail('un empate 6-6 entre Detective y Pensador se dice en el resultado', async ({ page }) => {
    await abrir(page);
    await responderLetras(page, 'EEEAAACD');
    await expect(seccionResultado(page)).toContainText('Pensador', { timeout: 2000 });
    await expect(seccionResultado(page)).toContainText('Detective');
  });
});

test.describe('Foco — hallazgo ABIERTO del 02/10/2026', () => {
  test.fail('tras «Siguiente» con teclado el foco sigue en el cuestionario, no en <body>', async ({
    page,
  }) => {
    await abrir(page);
    await opcion(page, LETRA.B).click();
    await botonSiguiente(page).focus();
    await page.keyboard.press('Enter');
    await expect(etiquetaPregunta(page)).toHaveText('Pregunta 2 de 8');
    // El botón pulsado se desactiva (la pregunta 2 aún no tiene respuesta) y el foco cae a
    // <body>; el siguiente Tab sale del test hacia «Ver Guía Completa».
    const dentro = await page.evaluate(() => {
      const a = document.activeElement;
      return Boolean(a && a !== document.body && a.closest('section[class*="testBox"]'));
    });
    expect(dentro).toBe(true);
  });

  test.fail('al pulsar «Ver mi resultado» el foco va al resultado', async ({ page }) => {
    await abrir(page);
    await responderLetras(page, 'BBBBBBB');
    await opcion(page, LETRA.B).click();
    await botonSiguiente(page).focus();
    await page.keyboard.press('Enter');
    await expect(nombreResultado(page)).toHaveText('El Explorador');
    const dentro = await page.evaluate(() => {
      const a = document.activeElement;
      return Boolean(a && a.closest('section[class*="resultado"]'));
    });
    expect(dentro).toBe(true);
  });
});

test.describe('Móvil 360 px con toque', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('doble toque en «Siguiente» avanza una sola pregunta y el empate D/E da El Esteta', async ({ page }) => {
    await abrir(page);
    await opcion(page, LETRA.D).tap();
    const caja = await botonSiguiente(page).boundingBox();
    if (!caja) throw new Error('«Siguiente» no tiene caja');
    await page.touchscreen.tap(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.touchscreen.tap(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await expect(etiquetaPregunta(page)).toHaveText('Pregunta 2 de 8');
    // A mano: D en la 1 + D,D,D en la 2-4 = esteta 8 · E en la 5-8 = pensador 8. Empate:
    // gana esteta por orden de declaración.
    for (const l of 'DDDEEEE') {
      await opcion(page, LETRA[l]).tap();
      await botonSiguiente(page).tap();
    }
    await expect(nombreResultado(page)).toContainText('El Esteta');
  });

  // Hallazgo ABIERTO del 02/10/2026. Con «Ver mi resultado» a media pantalla (como queda al
  // desplazar con el pulgar), el cuestionario se sustituye por un resultado ~1.000 px más alto
  // y el anclaje de desplazamiento de Chrome (overflow-anchor) mantiene en pantalla lo que había
  // DEBAJO: se ve «Repetir el test» y el nombre del perfil queda 1.114 px por encima del borde
  // (medido). Con el botón abajo del todo no pasa; a 1280×800, botón centrado, queda a −409 px.
  test.fail('al pulsar «Ver mi resultado» a media pantalla, el perfil queda a la vista', async ({ page }) => {
    await abrir(page);
    for (const l of 'CCCCCCC') {
      await opcion(page, LETRA[l]).tap();
      await botonSiguiente(page).tap();
    }
    await opcion(page, LETRA.C).tap();
    await botonSiguiente(page).evaluate((b) => b.scrollIntoView({ block: 'center' }));
    const caja = await botonSiguiente(page).boundingBox();
    if (!caja) throw new Error('«Ver mi resultado» no tiene caja');
    await page.touchscreen.tap(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await expect(nombreResultado(page)).toHaveText('El Empático');
    await expect(nombreResultado(page)).toBeInViewport({ ratio: 1, timeout: 2000 });
  });
});

test.describe('Lotes de CSS (b7733c6d, 586a4d61, a1d72a9c): barra del logo y cabeceras', () => {
  for (const tema of ['light', 'dark'] as const) {
    test(`tema ${tema}: la barra fija no tapa el h1 ni la pregunta, y la cabecera de tabla cumple 4,5:1`, async ({
      page,
    }) => {
      await page.addInitScript((t) => window.localStorage.setItem('meskeia-theme', t), tema);
      await abrir(page);
      // Sin esto el caso podría medir el tema claro creyendo medir el oscuro.
      await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
      for (const ancho of [360, 390, 800, 1024, 1280]) {
        await page.setViewportSize({ width: ancho, height: 800 });
        await page.evaluate(() => window.scrollTo(0, 0));
        expect(await solapeConBarra(page, 'h1'), `h1 a ${ancho} px`).toBe(0);
        expect(await solapeConBarra(page, 'h2[class*="pregunta"]'), `pregunta a ${ancho} px`).toBe(0);
      }
      // b7733c6d: <th> blanco sobre --primary-boton (#26718F) = 5,47:1 en los dos temas.
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      await expect
        .poll(() => contraste(page, '[class*="comparativaTable"] th'), { timeout: 3000 })
        .toBeGreaterThanOrEqual(4.5);
    });
  }
});

test.describe('Contraste — hallazgos ABIERTOS del 02/10/2026', () => {
  // «Siguiente →» (16 px/600, no es texto grande) pone blanco sobre var(--primary): 4,11:1 en
  // claro (#2E86AB) y 2,79:1 en oscuro (#3FA5D1). Existe --primary-boton (5,47:1 en ambos).
  test.fail('«Siguiente» cumple 4,5:1 en tema claro', async ({ page }) => {
    await abrir(page);
    await opcion(page, 0).click();
    await page.mouse.move(0, 0);
    await expect
      .poll(() => contraste(page, 'button[class*="btnSiguiente"]'), { timeout: 3000 })
      .toBeGreaterThanOrEqual(4.5);
  });

  // Las etiquetas de género del resultado llevan `color: resultado.color` en línea, pensado
  // para el fondo claro. En oscuro, sobre #1A1A1A: 1,58:1 (Detective) a 3,32:1 (Esteta).
  test.fail('tema oscuro: las etiquetas de género del resultado cumplen 4,5:1', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('meskeia-theme', 'dark'));
    await abrir(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await responderLetras(page, 'AAAAAAAA');
    await expect(nombreResultado(page)).toHaveText('El Detective');
    await expect
      .poll(() => contraste(page, '[class*="generoTag"]'), { timeout: 3000 })
      .toBeGreaterThanOrEqual(4.5);
  });
});

test.describe('Contenido — hallazgos ABIERTOS del 02/10/2026', () => {
  // Formato del porcentaje: CLAUDE.md global §2 (25/09/2026) pide «0 %» con espacio duro U+00A0.
  test.fail('el progreso escribe el porcentaje con espacio duro', async ({ page }) => {
    await abrir(page);
    await expect(etiquetaPorcentaje(page)).toHaveText('0 %', { timeout: 2000 });
  });

  test.fail('«¿Cómo lees según tu perfil?» trae una tarjeta por cada uno de los 5 perfiles', async ({
    page,
  }) => {
    await abrir(page);
    // Hoy hay 4: Detective, Explorador, Empático y Pensador. Falta El Esteta.
    await expect(page.locator('[class*="escenarioCard"]')).toHaveCount(5, { timeout: 2000 });
  });

  test.fail('sin erratas en los rasgos y lecturas: «glosarios», «Millennium»', async ({ page }) => {
    await abrir(page);
    await responderLetras(page, 'BBBBBBBB');
    await expect(seccionResultado(page)).not.toContainText('glossarios', { timeout: 2000 });
    await page.locator('button[class*="btnReiniciar"]').click();
    await responderLetras(page, 'AAAAAAAA');
    await expect(page.locator('[class*="lecturaTitulo"]').nth(1)).toHaveText(/^Millennium/);
  });

  test.fail('el FAQPage no promete géneros ni funciones que el resultado no da', async ({ page }) => {
    await abrir(page);
    const ldJson = await page.locator('script[type="application/ld+json"]').allTextContents();
    const todo = ldJson.join('\n');
    // El resultado del Pensador da ficción (Dostoievski, Saramago, Kundera, Sebald), no
    // «ciencia divulgativa»; el del Explorador no incluye «literatura de viajes»; las lecturas
    // son fijas por arquetipo, no «adaptadas a tus respuestas»; y ShareCard comparte la URL de
    // la herramienta, no el resultado.
    expect(todo).not.toContain('ciencia divulgativa');
    expect(todo).not.toContain('literatura de viajes');
    expect(todo).not.toContain('adaptadas a tus respuestas');
    expect(todo).not.toContain('Resultado compartible');
  });
});
