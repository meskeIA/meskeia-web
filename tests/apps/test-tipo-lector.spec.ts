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
 *   Ganador, HASTA el 02/10/2026 (`Object.entries(puntos).reduce`, comparación estricta `>`):
 *     recorría las categorías en el orden de declaración —detective, explorador, empatico,
 *     esteta, pensador— y en un empate exacto ganaba quien aparecía ANTES, sin decirlo.
 *
 *   La primera inspección lo dio por bueno («es determinista y siempre da un único arquetipo»).
 *   La segunda lo contó: de las 5^8 = 390.625 combinaciones de respuestas, 114.100 (29,21 %)
 *   acaban en empate en cabeza (51.100 dobles, 50.400 triples, 12.600 cuádruples). Con
 *   respuestas al azar, un test simétrico daría el 20 % a cada perfil; este daba Detective
 *   29,71 % · Explorador 22,60 % · Empático 18,06 % · Esteta 15,47 % · Pensador 14,16 %, y el
 *   Pensador no ganaba un solo empate.
 *
 *   REPARADO (hallazgo 2616): `ganadores` = todos los perfiles con la puntuación máxima. Si hay
 *   más de uno, el resultado dice «Tu perfil lector es mixto», nombra a todos en el <h2>
 *   («El Esteta y El Pensador»), y unos botones con aria-pressed dejan ver la ficha de cada uno
 *   (abierta por defecto la del primero en el orden fijo, que ya no se presenta como ganador).
 *   Debajo, el reparto de puntos de los cinco hace visible el criterio.
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
  // Desde la reparación del hallazgo 2616 (02/10/2026) el empate se DICE: perfil mixto con los
  // dos nombres. La ficha que se abre por defecto es la del primero en el orden fijo (Esteta),
  // pero ya no se presenta como ganador.
  test('4×D + 4×E empata esteta=8 y pensador=8 → perfil mixto «El Esteta y El Pensador»', async ({
    page,
  }) => {
    await abrir(page);
    // Cálculo a mano: preguntas 1-4 opción D (esteta, +2 cada una) = 8 puntos esteta.
    // Preguntas 5-8 opción E (pensador, +2 cada una) = 8 puntos pensador. Empate 8-8.
    await responder(page, [3, 3, 3, 3, 4, 4, 4, 4]);

    await expect(nombreResultado(page)).toHaveText('El Esteta y El Pensador');
    await expect(seccionResultado(page)).toContainText('Tu perfil lector es mixto');
    await expect(seccionResultado(page)).toContainText('mismos puntos (8 de 16) a 2 perfiles');
    // Ficha abierta por defecto: la del Esteta.
    await expect(page.locator('[class*="generoTag"]').first()).toHaveText('Novela literaria');
    await expect(page.locator('[class*="autorItem"]').first()).toHaveText('Vladimir Nabokov');
  });

  test('el orden inverso del mismo empate (4×E + 4×D) da el mismo perfil mixto', async ({ page }) => {
    // El resultado no depende del orden en que se contestan las preguntas.
    await abrir(page);
    await responder(page, [4, 4, 4, 4, 3, 3, 3, 3]);
    await expect(nombreResultado(page)).toHaveText('El Esteta y El Pensador');
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

test.describe('Empates — hallazgo 2616, REPARADO el 02/10/2026', () => {
  // E,E,E,A,A,A,C,D → pensador 6 = detective 6, empático 2, esteta 2. Antes el reduce se quedaba
  // con detective (primero declarado) y la pantalla decía «Tu perfil lector es El Detective» sin
  // mencionar al Pensador, aunque el FAQ prometía «el perfil dominante». Ahora el empate se dice.
  test('un empate 6-6 entre Detective y Pensador se dice en el resultado', async ({ page }) => {
    await abrir(page);
    await responderLetras(page, 'EEEAAACD');
    await expect(nombreResultado(page)).toHaveText('El Detective y El Pensador');
    await expect(seccionResultado(page)).toContainText('Tu perfil lector es mixto');
    await expect(seccionResultado(page)).toContainText('mismos puntos (6 de 16) a 2 perfiles');
  });

  test('los botones del empate cambian la ficha y llevan aria-pressed', async ({ page }) => {
    await abrir(page);
    await responderLetras(page, 'EEEAAACD');
    const boton = (nombre: string) => page.locator('button[class*="btnEmpate"]', { hasText: nombre });
    await expect(page.locator('button[class*="btnEmpate"]')).toHaveCount(2);
    await expect(boton('El Detective')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[class*="generoTag"]').first()).toHaveText('Thriller');
    await boton('El Pensador').click();
    await expect(boton('El Pensador')).toHaveAttribute('aria-pressed', 'true');
    await expect(boton('El Detective')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[class*="generoTag"]').first()).toHaveText('Ficción filosófica');
    // El encabezado sigue diciendo el empate: elegir ficha no elige ganador.
    await expect(nombreResultado(page)).toHaveText('El Detective y El Pensador');
  });

  test('empate cuádruple A,B,C,D,A,B,C,D: los cuatro en el encabezado y en los botones', async ({ page }) => {
    await abrir(page);
    // A mano: detective 4, explorador 4, empático 4, esteta 4, pensador 0.
    await responderLetras(page, 'ABCDABCD');
    await expect(nombreResultado(page)).toHaveText('El Detective, El Explorador, El Empático y El Esteta');
    await expect(page.locator('button[class*="btnEmpate"]')).toHaveCount(4);
  });

  test('con un ganador único no hay perfil mixto ni botones de empate', async ({ page }) => {
    await abrir(page);
    // A mano: B,E,B,C,B,E,A,D → explorador 6, pensador 4, el resto 2.
    await responderLetras(page, 'BEBCBEAD');
    await expect(nombreResultado(page)).toHaveText('El Explorador');
    await expect(seccionResultado(page)).toContainText('Tu perfil lector es');
    await expect(seccionResultado(page)).not.toContainText('mixto');
    await expect(page.locator('button[class*="btnEmpate"]')).toHaveCount(0);
    // El reparto de puntos, de mayor a menor: explorador 6 primero.
    await expect(page.locator('[class*="repartoFila"]').first()).toContainText('El Explorador');
    await expect(page.locator('[class*="repartoFila"]').first()).toContainText('6 de 16');
  });
});

test.describe('Clave de puntuación — hallazgo 2625, REPARADO el 02/10/2026', () => {
  // La opción «Abierto o ambiguo» de la pregunta 6 sumaba al Esteta, pero es la tarjeta del
  // Pensador la que dice «Un final sin respuestas es un regalo» (y la del Detective, «Sufres con
  // los finales abiertos»). Ahora el final abierto es la opción E (pensador) y la D del Esteta
  // habla de la última frase por cómo está escrita. Se mantiene una opción por perfil y el
  // orden A-E de todas las preguntas.
  test('el final abierto puntúa al Pensador: E,E,D,D,A,<abierto>,B,C → El Pensador', async ({ page }) => {
    await abrir(page);
    await responderLetras(page, 'EEDDA'); // pensador 4, esteta 4, detective 2
    await expect(etiquetaPregunta(page)).toHaveText('Pregunta 6 de 8');
    await page.locator('button[class*="opcion"]', { hasText: 'Abierto o ambiguo' }).click();
    await botonSiguiente(page).click();
    await responderLetras(page, 'BC');
    // A mano: pensador 6, esteta 4, detective 2, explorador 2, empático 2.
    await expect(nombreResultado(page)).toHaveText('El Pensador');
    await expect(seccionResultado(page)).toContainText('Un final sin respuestas es un regalo');
  });
});

test.describe('Foco — hallazgo 2618, REPARADO el 02/10/2026', () => {
  // Antes el foco caía a <body> en cada cambio de pantalla. Ahora va al enunciado de la pregunta
  // nueva (<h2 tabIndex={-1}>) o al encabezado del resultado.
  test('tras «Siguiente» con teclado el foco sigue en el cuestionario, no en <body>', async ({
    page,
  }) => {
    await abrir(page);
    await opcion(page, LETRA.B).click();
    await botonSiguiente(page).focus();
    await page.keyboard.press('Enter');
    await expect(etiquetaPregunta(page)).toHaveText('Pregunta 2 de 8');
    const dentro = await page.evaluate(() => {
      const a = document.activeElement;
      return Boolean(a && a !== document.body && a.closest('section[class*="testBox"]'));
    });
    expect(dentro).toBe(true);
    // Y el siguiente Tab va a la primera opción de la pregunta 2, no fuera del test.
    await page.keyboard.press('Tab');
    await expect(opcion(page, 0)).toBeFocused();
  });

  test('al pulsar «Ver mi resultado» el foco va al resultado', async ({ page }) => {
    await abrir(page);
    await responderLetras(page, 'BBBBBBB');
    await opcion(page, LETRA.B).click();
    await botonSiguiente(page).focus();
    await page.keyboard.press('Enter');
    await expect(nombreResultado(page)).toHaveText('El Explorador');
    await expect(nombreResultado(page)).toBeFocused();
  });

  test('tras «Repetir el test» el foco va a la pregunta 1', async ({ page }) => {
    await abrir(page);
    await responderLetras(page, 'AAAAAAAA');
    await page.locator('button[class*="btnReiniciar"]').focus();
    await page.keyboard.press('Enter');
    await expect(etiquetaPregunta(page)).toHaveText('Pregunta 1 de 8');
    await expect(page.locator('h2[class*="pregunta"]')).toBeFocused();
    await expect(page.locator('h2[class*="pregunta"]')).toBeInViewport({ ratio: 1 });
  });

  test('al cargar la página el foco NO se mueve al cuestionario', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('h2[class*="pregunta"]')).not.toBeFocused();
  });
});

test.describe('Vista del resultado — hallazgo 2617, REPARADO el 02/10/2026 (escritorio)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test('1280×800, «Ver mi resultado» centrado: el perfil queda a la vista', async ({ page }) => {
    await abrir(page);
    await responderLetras(page, 'CCCCCCC');
    await opcion(page, LETRA.C).click();
    await botonSiguiente(page).evaluate((b) => b.scrollIntoView({ block: 'center' }));
    await botonSiguiente(page).click();
    await expect(nombreResultado(page)).toHaveText('El Empático');
    await expect(nombreResultado(page)).toBeInViewport({ ratio: 1, timeout: 3000 });
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

  test('doble toque en «Siguiente» avanza una sola pregunta y el empate D/E da el perfil mixto', async ({ page }) => {
    await abrir(page);
    await opcion(page, LETRA.D).tap();
    const caja = await botonSiguiente(page).boundingBox();
    if (!caja) throw new Error('«Siguiente» no tiene caja');
    await page.touchscreen.tap(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.touchscreen.tap(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await expect(etiquetaPregunta(page)).toHaveText('Pregunta 2 de 8');
    // A mano: D en la 1 + D,D,D en la 2-4 = esteta 8 · E en la 5-8 = pensador 8. Empate:
    // perfil mixto (hallazgo 2616 reparado).
    for (const l of 'DDDEEEE') {
      await opcion(page, LETRA[l]).tap();
      await botonSiguiente(page).tap();
    }
    await expect(nombreResultado(page)).toHaveText('El Esteta y El Pensador');
  });

  // Hallazgo 2617, REPARADO el 02/10/2026. Con «Ver mi resultado» a media pantalla (como queda al
  // desplazar con el pulgar), el cuestionario se sustituye por un resultado ~1.000 px más alto
  // y el anclaje de desplazamiento de Chrome (overflow-anchor) mantenía en pantalla lo que había
  // DEBAJO: se veía «Repetir el test» y el nombre del perfil quedaba 1.114 px por encima del
  // borde. Ahora el resultado se lleva a la vista con scrollIntoView y scroll-margin-top: 80px.
  test('al pulsar «Ver mi resultado» a media pantalla, el perfil queda a la vista', async ({ page }) => {
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
    await expect(nombreResultado(page)).toBeInViewport({ ratio: 1, timeout: 3000 });
    // Y la barra fija del logo no tapa el nombre del perfil.
    await expect.poll(() => solapeConBarra(page, 'h2[class*="resultadoNombre"]'), { timeout: 3000 }).toBe(0);
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

test.describe('Contraste — hallazgos 2619 y 2620, REPARADOS el 02/10/2026', () => {
  for (const tema of ['light', 'dark'] as const) {
    // 2619: «Siguiente →» (16 px/600, no es texto grande), la letra de la opción elegida y los
    // números de «Cómo usar tu resultado» ponían blanco sobre var(--primary): 4,11:1 en claro y
    // 2,79:1 en oscuro. Ahora van sobre --primary-boton (#26718F, 5,47:1 en los dos temas).
    test(`tema ${tema}: «Siguiente», la letra elegida y los pasos de la guía cumplen 4,5:1`, async ({ page }) => {
      await page.addInitScript((t) => window.localStorage.setItem('meskeia-theme', t), tema);
      await abrir(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
      await opcion(page, 0).click();
      await page.mouse.move(0, 0);
      await expect
        .poll(() => contraste(page, 'button[class*="btnSiguiente"]'), { timeout: 3000 })
        .toBeGreaterThanOrEqual(4.5);
      await expect
        .poll(() => contraste(page, '[class*="opcionSeleccionada"] [class*="opcionLetra"]'), { timeout: 3000 })
        .toBeGreaterThanOrEqual(4.5);
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      await expect
        .poll(() => contraste(page, '[class*="stepNumber"]'), { timeout: 3000 })
        .toBeGreaterThanOrEqual(4.5);
      // 2620: el título del aviso (#c0392b fijo) daba 2,21:1 en oscuro.
      await expect
        .poll(() => contraste(page, '[class*="warningHeader"] h4'), { timeout: 3000 })
        .toBeGreaterThanOrEqual(4.5);
    });

    // 2620: las etiquetas de género llevaban `color: resultado.color` en línea, pensado para el
    // fondo claro (en oscuro, 1,58:1 a 3,32:1). Ahora cada perfil define --perfil-acento con su
    // variante oscura. Se miden los cinco perfiles y también el texto blanco de la cabecera.
    test(`tema ${tema}: las etiquetas de género y la cabecera de los 5 perfiles cumplen 4,5:1`, async ({ page }) => {
      await page.addInitScript((t) => window.localStorage.setItem('meskeia-theme', t), tema);
      await abrir(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
      const perfiles: [string, string][] = [
        ['A', 'El Detective'],
        ['B', 'El Explorador'],
        ['C', 'El Empático'],
        ['D', 'El Esteta'],
        ['E', 'El Pensador'],
      ];
      for (const [letra, nombre] of perfiles) {
        await responderLetras(page, letra.repeat(8));
        await expect(nombreResultado(page)).toHaveText(nombre);
        await expect
          .poll(() => contraste(page, '[class*="generoTag"]'), { timeout: 3000, message: `${nombre}: género` })
          .toBeGreaterThanOrEqual(4.5);
        await expect
          .poll(() => contraste(page, '[class*="resultadoNombre"]'), { timeout: 3000, message: `${nombre}: cabecera` })
          .toBeGreaterThanOrEqual(4.5);
        await page.locator('button[class*="btnReiniciar"]').click();
      }
    });
  }
});

test.describe('Contenido — hallazgos 2621 a 2624, REPARADOS el 02/10/2026', () => {
  // 2621. Formato del porcentaje: CLAUDE.md global §2 (25/09/2026) pide «0 %» con espacio duro U+00A0.
  test('el progreso escribe el porcentaje con espacio duro', async ({ page }) => {
    await abrir(page);
    await expect(etiquetaPorcentaje(page)).toHaveText('0 %');
    await opcion(page, 0).click();
    await botonSiguiente(page).click();
    await expect(etiquetaPorcentaje(page)).toHaveText('13 %');
  });

  // 2623. Antes había 4: Detective, Explorador, Empático y Pensador. Faltaba El Esteta.
  test('«¿Cómo lees según tu perfil?» trae una tarjeta por cada uno de los 5 perfiles', async ({
    page,
  }) => {
    await abrir(page);
    await expect(page.locator('[class*="escenarioCard"]')).toHaveCount(5);
    await expect(page.locator('[class*="escenarioCard"]', { hasText: 'El Esteta elige un libro' })).toHaveCount(1);
  });

  // 2624.
  test('sin erratas en los rasgos y lecturas: «glosarios», «Millennium», «Gente normal»', async ({ page }) => {
    await abrir(page);
    await responderLetras(page, 'BBBBBBBB');
    await expect(seccionResultado(page)).toContainText('Lees con mapas, glosarios e índices');
    await page.locator('button[class*="btnReiniciar"]').click();
    await responderLetras(page, 'AAAAAAAA');
    await expect(page.locator('[class*="lecturaTitulo"]').nth(1)).toHaveText('Millennium');
    await page.locator('button[class*="btnReiniciar"]').click();
    await responderLetras(page, 'CCCCCCCC');
    await expect(page.locator('[class*="lecturaTitulo"]').nth(1)).toHaveText('Gente normal');
  });

  // 2622.
  test('el FAQPage no promete géneros ni funciones que el resultado no da', async ({ page }) => {
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
    // Lo que el FAQ sí atribuye a cada perfil está en su tarjeta.
    expect(todo).toContain('ficción filosófica');
    expect(todo).toContain('perfil mixto');
    expect(todo).toContain('"@type":"FAQPage"');
  });
});
