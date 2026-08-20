import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — test-perfil-inversor (segmento interactiva, riesgo 2, 524 usos reales)
 *
 * Primera inspección: 20/08/2026. Aunque el segmento sea «interactiva», la app SÍ tiene
 * verdad comprobable: la puntuación es determinista y el tramo es verificable a mano. Los
 * tres casos de abajo se resolvieron a mano ANTES de ejecutar la app, leyendo la tabla de
 * `app/test-perfil-inversor/page.tsx`. No hay motor en `lib/` ni módulo en `data/`: las
 * preguntas, las puntuaciones y los tramos están inline en el componente.
 *
 * LA ARITMÉTICA
 *   10 preguntas (`QUESTIONS`), 4 opciones cada una, siempre en el mismo orden:
 *     opción A = 1 punto · B = 2 · C = 3 · D = 4
 *   Puntuación = suma de las 10 respuestas → mínimo 10 (todo A), máximo 40 (todo D).
 *
 *   Tramos (`getProfile`, y los `range` declarados en `PROFILES`, que coinciden):
 *     10–16 Conservador · 17–22 Moderado · 23–28 Equilibrado · 29–34 Dinámico · 35–40 Agresivo
 *   Son contiguos y disjuntos, y cubren exactamente 10..40: ninguna puntuación posible se
 *   queda sin perfil ni cae en dos, y ningún tramo es inalcanzable. Los cortes son cerrados
 *   por arriba (`score <= 16` es Conservador), así que 16, 22, 28 y 34 pertenecen al tramo
 *   de ABAJO — eso es lo que ancla el caso 2.
 *
 *   Nota: el campo `range` de `PROFILES` no se pinta en ninguna parte ni lo lee `getProfile`;
 *   es dato muerto. Si alguien lo edita creyendo mover un corte, no se moverá nada. Por eso
 *   aquí los tramos se anclan por la PANTALLA, no por esa constante.
 *
 *   Barra del resultado: `getBarPosition(score) = (score - 10) / 30 * 100`, sobre cinco
 *   segmentos del 20 % cada uno.
 *
 * LAS CARTERAS (`PROFILES[*].allocation`, RV/RF/Liquidez/Alternativos)
 *   Conservador 15/60/20/5 · Moderado 30/50/15/5 · Equilibrado 50/35/10/5
 *   Dinámico 70/20/5/5 · Agresivo 90/5/0/5
 *   Son las mismas que `PERFILES_PREDEFINIDOS` de `app/estimador-cartera-inversion`, que es
 *   adonde apunta el botón «Simular esta Cartera» con `?perfil=<slug>`: comprobado que el
 *   traspaso existe y cuadra.
 *
 * HALLAZGOS ABIERTOS: al final, marcados con `test.fail()` — afirman lo que debería pasar y
 * hoy fallan a propósito. El día que se reparen se ponen en verde: quitar entonces la línea
 * `test.fail()` y quedan como regresión.
 */

const RUTA = '/test-perfil-inversor/';

/** Los nombres de clase de CSS Modules van con hash: se localiza por subcadena. */
const opcion = (page: Page, i: number) => page.locator('[class*="optionButton"]').nth(i);
const botonAnterior = (page: Page) => page.locator('[class*="navButton"]').nth(0);
/** El mismo botón dice «Siguiente →» en las nueve primeras y «Ver Resultado» en la décima. */
const botonSiguiente = (page: Page) => page.locator('[class*="navButton"]').nth(1);
const perfilMostrado = (page: Page) => page.locator('[class*="resultProfile"]');
/** 0 = riesgo · 1 = horizonte ideal · 2 = volatilidad esperada · 3 = objetivo. */
const rasgo = (page: Page, i: number) => page.locator('[class*="traitValue"]').nth(i);
const flecha = (page: Page) => page.locator('[class*="profileArrow"]');
const enunciado = (page: Page) => page.locator('[class*="questionText"]');

async function empezar(page: Page): Promise<void> {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Comenzar Test/ }).click();
}

/**
 * Contesta el test entero. `indices` son los índices de opción: 0 = A (1 punto) … 3 = D (4).
 * La puntuación es, por tanto, la suma de los índices + 10.
 */
async function responder(page: Page, indices: number[]): Promise<void> {
  for (const i of indices) {
    await opcion(page, i).click();
    await botonSiguiente(page).click();
  }
}

/** Reparto de la cartera tal y como lo pinta la leyenda del resultado. */
async function reparto(page: Page): Promise<string[]> {
  return page.locator('[class*="legendItem"]').allInnerTexts();
}

// ============================================================
// CASO 1 — Recorrido normal, puntuación intermedia
// ============================================================
test.describe('Caso normal: un recorrido de 26 puntos', () => {
  test('C,B,C,A,D,B,C,C,B,C suma 26 y da Equilibrado con su cartera 50/35/10/5', async ({ page }) => {
    await empezar(page);
    // Sumado a mano antes de abrir el navegador, con A=1 B=2 C=3 D=4:
    //   3 + 2 + 3 + 1 + 4 + 2 + 3 + 3 + 2 + 3 = 26  →  tramo 23–28  →  Equilibrado
    await responder(page, [2, 1, 2, 0, 3, 1, 2, 2, 1, 2]);

    await expect(perfilMostrado(page)).toHaveText('Equilibrado');
    // Rasgos declarados en PROFILES.equilibrado.traits
    await expect(rasgo(page, 0)).toHaveText('Medio');
    await expect(rasgo(page, 1)).toHaveText('5-10 años');
    await expect(rasgo(page, 2)).toHaveText('12-15%');
    await expect(rasgo(page, 3)).toHaveText('Crecimiento sostenido');
    // PROFILES.equilibrado.allocation = { rv: 50, rf: 35, liq: 10, alt: 5 }
    expect(await reparto(page)).toEqual([
      'Renta Variable (50%)',
      'Renta Fija (35%)',
      'Liquidez (10%)',
      'Alternativos (5%)',
    ]);
    // getBarPosition(26) = (26 - 10) / 30 * 100 = 53,333…%
    await expect(flecha(page)).toHaveAttribute('style', /left: 53\.3333%/);
  });

  test('el botón «Simular esta Cartera» arrastra el perfil al estimador', async ({ page }) => {
    await empezar(page);
    await responder(page, [2, 1, 2, 0, 3, 1, 2, 2, 1, 2]); // los mismos 26 puntos
    // El slug del perfil, no su nombre: así lo lee PERFILES_PREDEFINIDOS del estimador.
    await expect(page.getByRole('link', { name: /Simular esta Cartera/ })).toHaveAttribute(
      'href',
      '/estimador-cartera-inversion/?perfil=equilibrado',
    );
  });
});

// ============================================================
// CASO 2 — El límite exacto entre dos perfiles, y los dos extremos
// ============================================================
test.describe('Caso límite: el corte 22 / 23 y los extremos de la escala', () => {
  test('22 puntos es el tope de Moderado y 23 ya es Equilibrado', async ({ page }) => {
    await empezar(page);
    // B ocho veces + C + C = 8×2 + 3 + 3 = 22. El corte de getProfile es `score <= 22`,
    // así que 22 tiene que caer del lado de ABAJO: Moderado.
    await responder(page, [1, 1, 1, 1, 1, 1, 1, 1, 2, 2]);
    await expect(perfilMostrado(page)).toHaveText('Moderado');
    await expect(rasgo(page, 1)).toHaveText('3-5 años'); // PROFILES.moderado.traits.horizonte
    // getBarPosition(22) = (22 - 10) / 30 * 100 = 40%
    await expect(flecha(page)).toHaveAttribute('style', /left: 40%/);
  });

  test('volver atrás y subir un punto recalcula: 22 → 23 pasa a Equilibrado', async ({ page }) => {
    await empezar(page);
    // Mismas nueve primeras (B×8 + C = 19) y la décima C (22), pero antes de pedir el
    // resultado se retrocede a la 9 y se sube de C (3) a D (4): 23, primer punto de Equilibrado.
    for (const i of [1, 1, 1, 1, 1, 1, 1, 1, 2]) {
      await opcion(page, i).click();
      await botonSiguiente(page).click();
    }
    await opcion(page, 2).click(); // pregunta 10 = C
    await botonAnterior(page).click();
    await expect(enunciado(page)).toHaveText(
      '¿Cómo reaccionas normalmente ante noticias económicas negativas?',
    );
    // La respuesta anterior sigue marcada al volver: una sola opción con la clase «selected».
    await expect(page.locator('[class*="optionButton"][class*="selected"]')).toHaveCount(1);
    await opcion(page, 3).click(); // pregunta 9: C → D, +1 punto
    await botonSiguiente(page).click();
    // Y la décima conserva lo ya contestado (C), sin volver a pedirla.
    await expect(page.locator('[class*="optionButton"][class*="selected"]')).toContainText(
      'Estoy dispuesto a asumir volatilidad por mayores rendimientos',
    );
    await botonSiguiente(page).click();

    await expect(perfilMostrado(page)).toHaveText('Equilibrado');
    // getBarPosition(23) = (23 - 10) / 30 * 100 = 43,333…%
    await expect(flecha(page)).toHaveAttribute('style', /left: 43\.3333%/);
  });

  test('el mínimo posible (10) y el máximo posible (40) caen dentro de un tramo', async ({ page }) => {
    // Todo A = 10 puntos, el suelo de la escala: primer punto del tramo Conservador (10–16).
    await empezar(page);
    await responder(page, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    await expect(perfilMostrado(page)).toHaveText('Conservador');
    expect(await reparto(page)).toEqual([
      'Renta Variable (15%)', // PROFILES.conservador.allocation = 15/60/20/5
      'Renta Fija (60%)',
      'Liquidez (20%)',
      'Alternativos (5%)',
    ]);
    await expect(flecha(page)).toHaveAttribute('style', /left: 0%/); // (10-10)/30 = 0

    // Todo D = 40 puntos, el techo: último punto del tramo Agresivo (35–40).
    await empezar(page);
    await responder(page, [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
    await expect(perfilMostrado(page)).toHaveText('Agresivo');
    expect(await reparto(page)).toEqual([
      'Renta Variable (90%)', // PROFILES.agresivo.allocation = 90/5/0/5
      'Renta Fija (5%)',
      'Liquidez (0%)',
      'Alternativos (5%)',
    ]);
    await expect(flecha(page)).toHaveAttribute('style', /left: 100%/); // (40-10)/30 = 1
  });
});

// ============================================================
// CASO 3 — Lo que debe rechazarse: no hay resultado sin las 10 respuestas
// ============================================================
test.describe('Caso a rechazar: cuestionario incompleto', () => {
  test('sin contestar no se puede avanzar, y con 9 de 10 no se llega al resultado', async ({ page }) => {
    await empezar(page);
    await expect(page.getByText('Pregunta 1 de 10')).toBeVisible();
    // Nada seleccionado todavía: «Siguiente →» está deshabilitado (selectedAnswer === undefined).
    await expect(botonSiguiente(page)).toBeDisabled();
    // Y «← Anterior» también, porque no hay pregunta anterior.
    await expect(botonAnterior(page)).toBeDisabled();

    // Nueve respuestas B (18 puntos) y la décima en blanco.
    await responder(page, [1, 1, 1, 1, 1, 1, 1, 1, 1]);
    await expect(page.getByText('Pregunta 10 de 10')).toBeVisible();
    await expect(botonSiguiente(page)).toHaveText('Ver Resultado');
    await expect(botonSiguiente(page)).toBeDisabled();

    // Forzar el clic sobre el botón deshabilitado no abre el resultado: sigue en la pregunta 10.
    await botonSiguiente(page).click({ force: true }).catch(() => {});
    await expect(perfilMostrado(page)).toHaveCount(0);
    await expect(enunciado(page)).toHaveText('¿Qué afirmación te representa mejor?');
  });

  test('el disclaimer financiero sale entero y fuera de la guía educativa', async ({ page }) => {
    // Riesgo 2 (nivel ALTO de _private/DISCLAIMER-POLICY.md): no colapsable y siempre visible.
    await page.goto(RUTA);
    const aviso = page.locator('[class*="disclaimer"]').first();
    await expect(aviso).toContainText('no constituye asesoramiento financiero');
    await expect(aviso.locator('button')).toHaveCount(0); // sin control de plegado
    expect(
      await page.evaluate(() =>
        Boolean(
          document
            .querySelector('[class*="disclaimer"]')
            ?.closest('details, [class*="educational"], [class*="Educational"]'),
        ),
      ),
    ).toBe(false);

    // Y también acompaña al resultado, que es donde el usuario se lleva un perfil puesto.
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responder(page, [2, 1, 2, 0, 3, 1, 2, 2, 1, 2]);
    await expect(page.locator('[class*="disclaimer"]').first()).toContainText(
      'no constituye asesoramiento financiero',
    );
  });
});

// ============================================================
// HALLAZGOS ABIERTOS del 20/08/2026. Todos fallan HOY a propósito.
// ============================================================
test.describe('Test de perfil inversor — hallazgos abiertos', () => {
  test('los datos estructurados prometen tres perfiles y la app asigna cinco', async ({ page }) => {
    test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
    await page.goto(RUTA);
    // La app puede devolver Equilibrado (23–28) y Dinámico (29–34) —el caso 1 saca Equilibrado
    // con 26 puntos—, pero el `description` que se sirve a Google y el `jsonLd.features` que
    // leen las IAs siguen diciendo solo «conservador, moderado o agresivo». El `faqJsonLd` del
    // MISMO fichero sí habla de «cinco perfiles»: los dos bloques se contradicen entre sí.
    const descripcion = await page.locator('meta[name="description"]').getAttribute('content');
    expect(descripcion?.toLowerCase()).toContain('equilibrado');
    const estructurados = (
      await page.locator('script[type="application/ld+json"]').allInnerTexts()
    ).join(' ');
    expect(estructurados).not.toContain('Resultado: perfil conservador, moderado o agresivo');
  });

  test('la opción elegida no se anuncia: solo cambia la clase CSS', async ({ page }) => {
    test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
    await empezar(page);
    await opcion(page, 1).click(); // pregunta 1, opción B
    // Regla obligatoria del proyecto: todo botón que cambie un estado visual lleva
    // `aria-pressed`. Quien no ve la pantalla no puede saber qué respuesta tiene marcada.
    await expect(opcion(page, 1)).toHaveAttribute('aria-pressed', 'true');
    await expect(opcion(page, 0)).toHaveAttribute('aria-pressed', 'false');
    // Y todos los botones propios de la app deben ser `type="button"`: hoy solo lo lleva
    // «Repetir Test»; las 4 opciones, «Anterior», «Siguiente» y «Comenzar Test» no.
    expect(
      await page.evaluate(() =>
        Array.from(document.querySelectorAll('[class*="optionButton"], [class*="navButton"]')).filter(
          (b) => b.getAttribute('type') !== 'button',
        ).length,
      ),
    ).toBe(0);
  });

  test('el resultado nunca enseña la puntuación obtenida', async ({ page }) => {
    test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
    await empezar(page);
    await responder(page, [1, 1, 1, 1, 1, 1, 1, 1, 2, 2]); // 22 puntos, tope justo de Moderado
    // La propia app explica en su FAQ «¿Qué pasa si mis respuestas están en el límite entre dos
    // perfiles?» y su FAQPage dice «cinco perfiles según la puntuación obtenida», pero la
    // pantalla de resultado no enseña ni la puntuación ni el tramo: el usuario no puede saber
    // que está exactamente en el borde.
    await expect(page.locator('[class*="resultScreen"]')).toContainText('22');
  });

  test('con la puntuación tope del tramo la flecha se pinta sobre la línea divisoria', async ({
    page,
  }) => {
    test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
    await empezar(page);
    await responder(page, [1, 1, 1, 1, 1, 1, 1, 1, 2, 2]); // 22 puntos → Moderado
    // El segmento Moderado ocupa del 20 % al 40 % de la barra. getBarPosition(22) = 40 % y la
    // flecha va centrada (`translateX(-50%)`), así que el resultado dice «Moderado» mientras
    // la punta cae justo en la frontera con Equilibrado. Pasa igual con 16, 28 y 34.
    const izquierda = await flecha(page).evaluate((el) => parseFloat((el as HTMLElement).style.left));
    expect(izquierda).toBeLessThan(40);
  });

  test('un escenario de la guía recomienda un perfil con horizonte más corto que el suyo', async ({
    page,
  }) => {
    test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const familia = page.locator('[class*="escenarioCard"]').nth(1);
    await expect(familia).toContainText('Horizonte de 20–25 años');
    // La tabla comparativa de esta misma página da «Horizonte mínimo» 3–5 años al Moderado y
    // 5–10 al Equilibrado; los que llegan a 20–25 años son Dinámico (10–15) y Agresivo (+15).
    // Y en el propio test, «Más de 10 años» es la respuesta de 4 puntos de la pregunta 1.
    await expect(familia).toContainText(/Perfil recomendado:.*(Dinámico|Agresivo)/);
  });

  test('el resultado nombra un índice concreto dentro de «Recomendaciones»', async ({ page }) => {
    test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
    await empezar(page);
    await responder(page, [2, 1, 2, 0, 3, 1, 2, 2, 1, 2]); // 26 puntos → Equilibrado
    // El bloque se titula «Recomendaciones para tu perfil» y lista «Fondos indexados globales
    // (MSCI World)» y «Cartera 60/40 clásica» sin marcarlos como ejemplo orientativo. Una app
    // de perfil de riesgo orienta; nombrar el índice concreto ya es señalar dónde poner el
    // dinero (y arrastra el sesgo anglosajón del 60/40).
    await expect(page.locator('[class*="resultScreen"]')).not.toContainText('MSCI World');
  });
});
