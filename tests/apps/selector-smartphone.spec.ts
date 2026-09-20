import { test, expect, Page } from '@playwright/test';

/**
 * Asesor de Smartphone (selector-smartphone) — inspección del 20/09/2026
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Asesor de Smartphone» y el subtítulo «10 preguntas para saber qué móvil te
 *   conviene de verdad». La pantalla de intro enumera lo que va a entregar: sistema operativo
 *   (iOS o Android), «gama recomendada con precio orientativo», características técnicas a
 *   buscar y consejos de compra. NO nombra modelos comerciales — el commit 2026-05-18
 *   («sustituir modelos hardcodeados por características técnicas») los retiró, y así sigue.
 *
 * LA VERDAD COMPROBABLE DE UN RECOMENDADOR
 *   No hay fórmula física que contrastar, pero sí hay una propiedad que se verifica: la
 *   COHERENCIA entre lo que el usuario responde y lo que se le recomienda. El motor está en
 *   `calcularResultado()` de `app/selector-smartphone/page.tsx` y es una suma de pesos que
 *   se puede calcular a mano ANTES de abrir el navegador:
 *
 *     puntosiOS      P4 «Sí, varios» +3 · «Alguno» +1     P5 macOS +2 · Windows −1
 *                    os = puntosiOS >= 3 ? iOS : Android
 *
 *     puntosGamaAlta P1 foto +2 · trabajo +1              P2 intenso +2 · frecuente +1
 *                    P3 >7 h +2 · 4-7 h +1                P6 cámara +2 · rendimiento +1
 *                    P7 «4 años o más» +2                 P9 500-900 € +2 · >900 € +4 · ≤250 € −3
 *                    gama = >=7 pro · >=4 alta · >=1 media · resto básica
 *
 *     AJUSTE FINAL   P9 «Hasta 250 €» → básica          P9 «Más de 900 €» → pro
 *
 *   Ese ajuste final es el nudo de la inspección: SOLO existe en los dos extremos. Con los
 *   tramos intermedios («250 – 500 €» y «500 – 900 €») el presupuesto declarado no acota
 *   nada, y la gama la fija el recuento de puntos sin tope de ningún tipo.
 *
 * LO QUE ESTOS CASOS FIJAN
 *   1) coherente — necesidades inequívocas y mínimas: la recomendación baja, como debe.
 *   2) contradictorio con presupuesto MÍNIMO: el tope funciona, pero en silencio, y la
 *      justificación que imprime describe un perfil que el usuario no declaró.
 *   3) contradictorio con presupuesto MEDIO: no hay tope, y la app recomienda una gama de
 *      900 – 1.500+ € a quien acaba de declarar 250 – 500 €, sin mencionar el conflicto.
 *   4) estabilidad — repetir el mismo perfil da el mismo resultado (correcto), pero cambiar
 *      UNA sola respuesta salta los cuatro escalones de la escala con una razón inventada.
 *
 * ⚠️ Los casos 2, 3 y 4 fijan el comportamiento OBSERVADO, no el deseable: si algún día se
 *    repara el motor, estas comprobaciones fallarán, y ese fallo es precisamente el aviso.
 *    Cada una lleva anotado al lado qué debería pasar cuando se repare.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Ayudantes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La app no tiene ningún <input>, así que el ayudante de `_hidratacion.ts` (que sondea el
 * rastreador de valor de React sobre un input) no sirve aquí. El testigo equivalente para
 * una app de solo botones es que React haya colgado sus props del nodo: hasta que eso no
 * ocurre, un clic cambia el DOM y no llega al estado, que es el mismo fallo silencioso.
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

/** Las 10 respuestas de un perfil, cada una identificada por un trozo único de su texto. */
type Perfil = readonly [string, string, string, string, string, string, string, string, string, string];

async function abrirTest(page: Page): Promise<void> {
  await page.goto('/selector-smartphone/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
}

/** Marca una opción de la pregunta en pantalla y avanza. */
async function responder(page: Page, perfil: Perfil): Promise<void> {
  for (let i = 0; i < perfil.length; i++) {
    await page.locator('[role="radiogroup"] button', { hasText: perfil[i] }).first().click();
    await page
      .getByRole('button', { name: i === perfil.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' })
      .click();
  }
}

/** El texto completo de la pantalla de resultado, ya normalizado. */
async function leerResultado(page: Page): Promise<string> {
  await page.getByRole('heading', { name: 'Tu smartphone ideal' }).waitFor();
  const texto = await page.locator('body').innerText();
  return texto.replace(/\s+/g, ' ');
}

// Perfiles usados. Los tramos de presupuesto se identifican por su descripción, porque las
// etiquetas comparten cifras entre sí («250 – 500 €» y «500 – 900 €»).
const SOLO_LLAMAR: Perfil = [
  'Uso básico', 'No juego o muy poco', 'Menos de 2 horas', 'No, ninguno', 'Windows',
  'Batería larga', '3 años', 'Me da igual', 'Precio mínimo', 'Sí, con garantía',
];
const EXIGENTE_SIN_DINERO: Perfil = [
  'Fotografía y vídeo', 'Gaming intenso', 'Más de 7 horas', 'No, ninguno', 'Windows',
  'Cámara de calidad', '4 años o más', 'Resistente', 'Precio mínimo', 'No, prefiero nuevo',
];
const EXIGENTE_PRESUPUESTO_MEDIO: Perfil = [
  'Fotografía y vídeo', 'Gaming intenso', 'Más de 7 horas', 'No, ninguno', 'Windows',
  'Cámara de calidad', '4 años o más', 'Resistente', 'Relación calidad-precio óptima', 'No, prefiero nuevo',
];
const SOLO_LLAMAR_CON_DINERO: Perfil = [
  'Uso básico', 'No juego o muy poco', 'Menos de 2 horas', 'No, ninguno', 'Windows',
  'Batería larga', '3 años', 'Me da igual', 'Quiero lo mejor disponible', 'Sí, con garantía',
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. CASO COHERENTE — el perfil mínimo debe bajar la recomendación, y la baja
// ─────────────────────────────────────────────────────────────────────────────

test('caso coherente: quien solo quiere llamar y que dure la batería recibe gama básica Android', async ({ page }) => {
  // Calculado a mano antes de ejecutar:
  //   puntosiOS      = −1 (Windows)                    → Android
  //   puntosGamaAlta = −3 (solo el tramo «Hasta 250 €») → básica, y el ajuste la confirma
  // Esperado: «Android» · «Gama básica» · «100 – 250 €».
  await abrirTest(page);
  await responder(page, SOLO_LLAMAR);
  const texto = await leerResultado(page);

  expect(texto).toContain('Android');
  expect(texto).toContain('Gama básica');
  expect(texto).toContain('100 – 250 €');
  expect(texto).not.toContain('iPhone (iOS)');
  expect(texto).not.toContain('Gama pro / flagship');

  // El pliego de características que corresponde a este perfil, íntegro y sin sobras.
  expect(texto).toContain('Actualizaciones del sistema operativo garantizadas: mínimo 3 años');
  expect(texto).toContain('Batería ≥ 5.000 mAh con carga rápida ≥ 45 W'); // pidió «Batería larga»
  expect(texto).toContain('Almacenamiento interno ≥ 128 GB');
  expect(texto).not.toContain('Procesador de gama alta'); // no juega: no debe pedirlo, y no lo pide

  // Y la razón que imprime SÍ describe lo que el usuario contestó.
  expect(texto).toContain('Para un uso básico, la gama de entrada cubre perfectamente');
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CASO CONTRADICTORIO (presupuesto mínimo) — el tope actúa, pero en silencio
// ─────────────────────────────────────────────────────────────────────────────

test('caso contradictorio: con 250 € y exigencias máximas la app recorta sin decirlo y justifica con un perfil que no se declaró', async ({ page }) => {
  // Calculado a mano: foto +2, gaming intenso +2, >7 h +2, cámara +2, 4 años o más +2,
  // «Hasta 250 €» −3  →  7 puntos = «pro», y el ajuste final lo derriba a «básica».
  //
  // LO QUE DEBERÍA PASAR: decir que no hay opción que cumpla todo, o priorizar explicando
  // que el presupuesto manda sobre cámara y potencia.
  // LO QUE PASA: recorta a gama básica, no menciona el conflicto, y la razón que imprime
  // («uso básico») contradice punto por punto lo que el usuario acaba de responder.
  await abrirTest(page);
  await responder(page, EXIGENTE_SIN_DINERO);
  const texto = await leerResultado(page);

  expect(texto).toContain('Gama básica');
  expect(texto).toContain('100 – 250 €');

  // ⚠️ Razón falsa: el usuario declaró fotografía, gaming intenso y más de 7 h al día.
  //    Al repararse, esta frase debe desaparecer de este caso y fallará aquí.
  expect(texto).toContain('Para un uso básico, la gama de entrada cubre perfectamente llamadas, mensajería y navegación');

  // ⚠️ Pliego incompatible con la propia gama recomendada: un procesador de gama alta de
  //    última generación y una pantalla de 120 Hz no caben en 100 – 250 €.
  expect(texto).toContain('Procesador de gama alta de la generación más reciente disponible');
  expect(texto).toContain('Pantalla con tasa de refresco ≥ 120 Hz');
  expect(texto).toContain('Actualizaciones del sistema operativo garantizadas: mínimo 5 años');

  // ⚠️ Y al revés: 5G y NFC están condicionados a `gama !== 'basica'`, así que desaparecen
  //    justo en el perfil de gaming intenso con más de 7 h diarias.
  expect(texto).not.toContain('Conectividad 5G');
  expect(texto).not.toContain('NFC para pagos sin contacto');

  // ⚠️ En ninguna parte de la pantalla se avisa de que las exigencias se han descartado.
  //    Al repararse aparecerá un aviso y esta comprobación fallará.
  expect(texto).not.toMatch(/no (hay|existe|es posible)|incompatible|no caben|hemos priorizado|prevalece/i);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. CASO LÍMITE (presupuesto medio) — el tope no existe y la app se desborda
// ─────────────────────────────────────────────────────────────────────────────

test('caso límite: con un presupuesto de 250 – 500 € la app recomienda una gama de 900 – 1.500+ € sin avisar', async ({ page }) => {
  // Mismo perfil exigente que el caso 2, cambiando SOLO el tramo de presupuesto al
  // intermedio. Calculado a mano: 2+2+2+2+2+0 = 10 puntos → «pro». El ajuste final solo
  // contempla «Hasta 250 €» y «Más de 900 €», así que aquí no interviene nadie.
  //
  // LO QUE DEBERÍA PASAR: acotar la gama al tramo declarado, o decir expresamente que
  // cumplir esas exigencias cuesta más de lo que el usuario ha dicho que puede gastar.
  // LO QUE PASA: recomienda «Gama pro / flagship — 900 – 1.500+ €», entre dos y seis veces
  // el presupuesto declarado, sin una sola línea sobre el desfase.
  await abrirTest(page);
  await responder(page, EXIGENTE_PRESUPUESTO_MEDIO);
  const texto = await leerResultado(page);

  expect(texto).toContain('Gama pro / flagship');
  expect(texto).toContain('900 – 1.500+ €');
  expect(texto).not.toContain('250 – 500 €'); // el tramo que el usuario eligió no se menciona
  // ⚠️ La palabra «presupuesto» no llega a aparecer en la pantalla de resultado: nada
  //    relaciona la gama propuesta con el tramo que el usuario declaró. Al repararse,
  //    aparecerá ese aviso y esta comprobación fallará.
  expect(texto).not.toMatch(/presupuesto|excede|no cabe en/i);

  // El mismo desbordamiento con el tramo «500 – 900 €» sería idéntico: ese tramo suma +2,
  // de modo que aún es más fácil llegar a «pro» por encima de lo declarado.
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. CASO DE ESTABILIDAD — repetir es estable; cambiar una respuesta, no
// ─────────────────────────────────────────────────────────────────────────────

test('caso de estabilidad: el mismo perfil repite resultado, pero una sola respuesta distinta salta los cuatro escalones', async ({ page }) => {
  test.setTimeout(90_000); // recorre el cuestionario de diez preguntas tres veces

  // 4.a — Sin responder nada no se puede avanzar ni llegar al resultado.
  await abrirTest(page);
  const siguiente = page.getByRole('button', { name: 'Siguiente pregunta' });
  const anterior = page.getByRole('button', { name: 'Pregunta anterior' });
  await expect(siguiente).toBeDisabled();
  await expect(anterior).toBeDisabled();
  await expect(page.getByText('Pregunta 1 de 10').first()).toBeVisible();

  // 4.b — Volver atrás conserva la respuesta marcada y permite cambiarla.
  await page.locator('[role="radiogroup"] button', { hasText: 'Uso básico' }).first().click();
  await siguiente.click();
  await page.locator('[role="radiogroup"] button', { hasText: 'No juego o muy poco' }).first().click();
  await anterior.click();
  await expect(page.locator('[role="radiogroup"] button[aria-pressed="true"]')).toHaveText(/Uso básico/);

  // 4.c — El mismo perfil, dos veces seguidas, da exactamente el mismo resultado.
  await page.goto('/selector-smartphone/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
  await responder(page, SOLO_LLAMAR);
  const primera = await leerResultado(page);

  await page.getByRole('button', { name: 'Repetir el test' }).click();
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
  await responder(page, SOLO_LLAMAR);
  const segunda = await leerResultado(page);

  expect(segunda).toContain('Gama básica');
  expect(segunda).toContain('100 – 250 €');
  expect(primera.includes('Gama básica')).toBe(segunda.includes('Gama básica'));

  // 4.d — Desde ese mismo perfil se cambia UNA sola respuesta: el tramo de presupuesto pasa
  // de «Hasta 250 €» a «Más de 900 €». Todo lo demás sigue diciendo uso básico, sin juegos,
  // menos de dos horas al día.
  //
  // LO QUE DEBERÍA PASAR: subir un escalón, o a lo sumo dos, y justificarlo por el
  // presupuesto — que es lo único que ha cambiado.
  // LO QUE PASA: salta de «Gama básica (100 – 250 €)» a «Gama pro / flagship
  // (900 – 1.500+ €)», los cuatro escalones de la escala, y además inventa el motivo: la
  // razón se genera a partir de la gama de salida, no de las respuestas.
  await page.getByRole('button', { name: 'Repetir el test' }).click();
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
  await responder(page, SOLO_LLAMAR_CON_DINERO);
  const tercera = await leerResultado(page);

  expect(tercera).toContain('Gama pro / flagship');
  expect(tercera).toContain('900 – 1.500+ €');

  // ⚠️ Perfil inventado: este usuario respondió «Uso básico», «No juego o muy poco» y
  //    «Menos de 2 horas». Al repararse, esta frase no debe salir y fallará aquí.
  expect(tercera).toContain('Tu perfil de uso intenso o de fotografía avanzada justifica la inversión en un flagship');
});
