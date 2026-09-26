import { test, expect, Page, Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

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

/**
 * Índice (0-4) del segmento de la barra en el que cae la flecha.
 *
 * La barra tiene cinco segmentos del 20 %. Antes se comprobaba el `left` exacto que
 * producía el mapeo lineal 10-40 → 0-100, pero ese mapeo dejaba los topes de tramo
 * clavados en las fronteras (22 → 40 %), que es el hallazgo 102. Lo que hay que exigir
 * no es un número concreto, sino que la flecha esté DENTRO del segmento nombrado.
 */
async function segmentoDeLaFlecha(page: Page): Promise<number> {
  const izquierda = await flecha(page).evaluate((el) =>
    parseFloat((el as HTMLElement).style.left),
  );
  expect(izquierda).toBeGreaterThan(0);
  expect(izquierda).toBeLessThan(100);
  // Estrictamente dentro: nunca sobre una línea divisoria
  expect(izquierda % 20).not.toBe(0);
  return Math.floor(izquierda / 20);
}
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
    // Rasgos declarados en PROFILES.equilibrado.traits. Desde el 26/09/2026 (hallazgo 2180) el
    // % va separado de la cifra con espacio duro U+00A0, en los rasgos y en la leyenda: las
    // expectativas antiguas («12-15%», «Renta Variable (50%)») consagraban el defecto.
    await expect(rasgo(page, 0)).toHaveText('Medio');
    await expect(rasgo(page, 1)).toHaveText('5-10 años');
    await expect(rasgo(page, 2)).toHaveText('12-15\u00A0%');
    await expect(rasgo(page, 3)).toHaveText('Crecimiento sostenido');
    // PROFILES.equilibrado.allocation = { rv: 50, rf: 35, liq: 10, alt: 5 }
    expect(await reparto(page)).toEqual([
      'Renta Variable (50\u00A0%)',
      'Renta Fija (35\u00A0%)',
      'Liquidez (10\u00A0%)',
      'Alternativos (5\u00A0%)',
    ]);
    // getBarPosition(26) = (26 - 10) / 30 * 100 = 53,333…%
    expect(await segmentoDeLaFlecha(page)).toBe(2); // Equilibrado es el 3.er segmento
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
    expect(await segmentoDeLaFlecha(page)).toBe(1); // 22 es el tope de Moderado: 2.º segmento
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
    expect(await segmentoDeLaFlecha(page)).toBe(2); // 23 ya es Equilibrado: 3.er segmento
  });

  test('el mínimo posible (10) y el máximo posible (40) caen dentro de un tramo', async ({ page }) => {
    // Todo A = 10 puntos, el suelo de la escala: primer punto del tramo Conservador (10–16).
    await empezar(page);
    await responder(page, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    await expect(perfilMostrado(page)).toHaveText('Conservador');
    expect(await reparto(page)).toEqual([
      'Renta Variable (15\u00A0%)', // PROFILES.conservador.allocation = 15/60/20/5
      'Renta Fija (60\u00A0%)',
      'Liquidez (20\u00A0%)',
      'Alternativos (5\u00A0%)',
    ]);
    expect(await segmentoDeLaFlecha(page)).toBe(0); // el mínimo cae dentro de Conservador

    // Todo D = 40 puntos, el techo: último punto del tramo Agresivo (35–40).
    await empezar(page);
    await responder(page, [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
    await expect(perfilMostrado(page)).toHaveText('Agresivo');
    expect(await reparto(page)).toEqual([
      'Renta Variable (90\u00A0%)', // PROFILES.agresivo.allocation = 90/5/0/5
      'Renta Fija (5\u00A0%)',
      'Liquidez (0\u00A0%)',
      'Alternativos (5\u00A0%)',
    ]);
    expect(await segmentoDeLaFlecha(page)).toBe(4); // el máximo cae dentro de Agresivo
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
// REGRESIONES — los siete hallazgos del 20/08/2026, reparados el 21/08/2026.
test.describe('Test de perfil inversor — regresiones', () => {
  test('los datos estructurados prometen tres perfiles y la app asigna cinco', async ({ page }) => {
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
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const familia = page.locator('[class*="escenarioCard"]').nth(1);
    await expect(familia).toContainText('20–25 años');
    // La tabla comparativa de esta misma página da «Horizonte mínimo» 3–5 años al Moderado
    // y 5–10 al Equilibrado; con un horizonte de 20–25 años, recomendar Moderado usando el
    // plazo como argumento se contradecía con el propio baremo del test, donde «Más de 10
    // años» es la respuesta de 4 puntos —la más agresiva— de la pregunta 1.
    await expect(familia).toContainText(/Perfil recomendado:.*(Equilibrado|Dinámico|Agresivo)/);
    await expect(familia).not.toContainText(/Perfil recomendado: Moderado o Equilibrado/);

    // El pre-jubilado declara 10 años hasta el primer reintegro: tampoco puede salirle
    // Conservador, cuyo horizonte declarado es de menos de 3 años.
    const prejubilado = page.locator('[class*="escenarioCard"]').nth(2);
    await expect(prejubilado).not.toContainText(/Perfil recomendado: Conservador/);
  });

  test('el resultado no nombra índices ni productos concretos', async ({ page }) => {
    await empezar(page);
    await responder(page, [2, 1, 2, 0, 3, 1, 2, 2, 1, 2]); // 26 puntos → Equilibrado
    // El bloque se titula «Recomendaciones para tu perfil» y lista «Fondos indexados globales
    // (MSCI World)» y «Cartera 60/40 clásica» sin marcarlos como ejemplo orientativo. Una app
    // de perfil de riesgo orienta; nombrar el índice concreto ya es señalar dónde poner el
    // dinero (y arrastra el sesgo anglosajón del 60/40).
    const resultado = page.locator('[class*="resultScreen"]');
    await expect(resultado).not.toContainText('MSCI World');
    await expect(resultado).not.toContainText('60/40');
    // Y el bloque se presenta como ejemplos, no como recomendación de inversión
    await expect(resultado).toContainText('ejemplos ilustrativos');
  });
  test('recargar a mitad del test no borra lo contestado', async ({ page }) => {
    // El estado vivía solo en useState: un F5 en la pregunta 2 devolvía a la portada con
    // cero respuestas, sin previo aviso (Inspector, 20/08/2026). Ahora sobrevive en
    // sessionStorage —no en localStorage: es un test de una sentada, no debe reaparecer
    // semanas después con respuestas que ya no son las de esa persona—.
    await empezar(page);
    await page.getByRole('button', { name: /^B/ }).first().click();
    await page.getByRole('button', { name: /Siguiente/ }).click();
    await expect(enunciado(page)).toHaveCount(1);

    await page.reload();
    // Sigue en el cuestionario, no en la portada
    await expect(enunciado(page)).toHaveCount(1);
    await expect(page.getByRole('button', { name: /Comenzar Test/ })).toHaveCount(0);
    // Y con la respuesta de la pregunta 1 conservada
    await page.getByRole('button', { name: /Anterior/ }).click();
    await expect(page.locator('[class*="optionButton"][aria-pressed="true"]')).toHaveCount(1);
  });

  test('desde el resultado se puede volver a revisar sin rehacer las diez', async ({ page }) => {
    await empezar(page);
    await responder(page, [2, 1, 2, 0, 3, 1, 2, 2, 1, 2]); // 26 puntos
    await expect(perfilMostrado(page)).toHaveText('Equilibrado');

    // Antes las únicas salidas eran dos enlaces y «Repetir Test», que vacía las respuestas.
    await page.getByRole('button', { name: /Revisar mis respuestas/ }).click();
    await expect(enunciado(page)).toHaveCount(1);
    // La última pregunta conserva lo que se había contestado
    await expect(page.locator('[class*="optionButton"][aria-pressed="true"]')).toHaveCount(1);
  });
});

// ============================================================
// RE-INSPECCIÓN 22/09/2026
//
// La aritmética se volvió a resolver A MANO antes de tocar el navegador, con la misma
// tabla de `page.tsx` (A=1 · B=2 · C=3 · D=4, suma de las diez):
//   Caso normal   → 31 puntos (Dinámico, 29–34), que es el tramo que no tenía ni un caso.
//   Caso límite   → los TRES cortes que nadie había probado: 16/17, 28/29 y 34/35.
//                   El de 22/23 ya estaba cubierto arriba; estos tres, no.
//   Caso rechazo  → la sesión guardada que no se puede leer. El estado a medias pasó a
//                   `sessionStorage` en la reparación del 21/08/2026, así que desde
//                   entonces hay una entrada de datos que la app no controla y que su
//                   propio `leerSesion` dice cubrir («Ventana privada, almacenamiento
//                   bloqueado o JSON corrupto: se empieza de cero»).
//
// La posición de la flecha ya no es el mapeo lineal que documenta la cabecera de este
// fichero: desde la reparación del 21/08/2026 es
//   getBarPosition(score) = indice*20 + 2 + (score-min)/(max-min) * 16
// con `indice` = orden del perfil (0-4) y [min,max] su `range`. Calculada a mano para
// cada caso de abajo y comprobada al décimo.
// ============================================================
test.describe('re-inspección 22/09/2026', () => {
  /** Deja el almacenamiento de sesión limpio antes de cada caso. */
  async function conSesionLimpia(page: Page): Promise<void> {
    await page.goto(RUTA);
    await page.evaluate(() => {
      try {
        sessionStorage.clear();
      } catch {
        /* ventana privada: no había nada que limpiar */
      }
    });
  }

  /** El `<div id="__next-route-announcer__">` lo inyecta el cliente: mientras no está,
   *  React no ha hidratado y el efecto de recuperación de sesión NO ha corrido todavía.
   *  Sin esta espera, un `toHaveCount(0)` se da por bueno en el HTML del servidor y el
   *  test pasa en falso sobre una pantalla que un instante después es la de error. */
  async function esperarHidratacion(page: Page): Promise<void> {
    await page.waitForSelector('#__next-route-announcer__', { state: 'attached' });
  }

  /** El texto de la puntuación: «N puntos · tramo X–Y». El `<span>` del borde va aparte. */
  const puntuacion = (page: Page) => page.locator('p[class*="resultScore"]');
  const avisoDeBorde = (page: Page) => page.locator('[class*="resultScoreBorde"]');

  // ---------- CASO 1: recorrido normal, 31 puntos ----------
  test('caso normal: D,C,D,B,C,D,C,B,D,B suma 31 y da Dinámico con su cartera 70/20/5/5', async ({
    page,
  }) => {
    await conSesionLimpia(page);
    // 4 + 3 + 4 + 2 + 3 + 4 + 3 + 2 + 4 + 2 = 31 → tramo 29–34 → Dinámico.
    // Ninguno de los tres casos anteriores del fichero caía en Dinámico.
    await empezar(page);
    await responder(page, [3, 2, 3, 1, 2, 3, 2, 1, 3, 1]);

    await expect(perfilMostrado(page)).toHaveText('Dinámico');
    await expect(puntuacion(page)).toContainText('31 puntos');
    await expect(puntuacion(page)).toContainText('tramo 29–34');
    // PROFILES.dinamico.traits
    await expect(rasgo(page, 0)).toHaveText('Alto');
    await expect(rasgo(page, 1)).toHaveText('10-15 años');
    await expect(rasgo(page, 2)).toHaveText('15-20\u00A0%');
    await expect(rasgo(page, 3)).toHaveText('Maximizar crecimiento');
    // PROFILES.dinamico.allocation = { rv: 70, rf: 20, liq: 5, alt: 5 }
    expect(await reparto(page)).toEqual([
      'Renta Variable (70\u00A0%)',
      'Renta Fija (20\u00A0%)',
      'Liquidez (5\u00A0%)',
      'Alternativos (5\u00A0%)',
    ]);
    // getBarPosition(31) = 3*20 + 2 + (31-29)/(34-29) * 16 = 60 + 2 + 6,4 = 68,4 %
    expect(
      await flecha(page).evaluate((el) => parseFloat((el as HTMLElement).style.left)),
    ).toBeCloseTo(68.4, 1);
    expect(await segmentoDeLaFlecha(page)).toBe(3);
    // 31 no es extremo de su tramo: no debe salir el aviso de borde.
    await expect(avisoDeBorde(page)).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Simular esta Cartera/ })).toHaveAttribute(
      'href',
      '/estimador-cartera-inversion/?perfil=dinamico',
    );
  });

  // ---------- CASO 2: los tres cortes que faltaban ----------
  test('caso límite: los cortes 16/17, 28/29 y 34/35, resueltos a mano', async ({ page }) => {
    test.setTimeout(150_000); // seis recorridos completos de diez preguntas
    // Los seis recorridos, con su suma hecha antes de abrir el navegador:
    //   16 → B×6 + A×4 = 12 + 4  (tope de Conservador, `score <= 16`)
    //   17 → B×7 + A×3 = 14 + 3  (primer punto de Moderado)
    //   28 → C×8 + B×2 = 24 + 4  (tope de Equilibrado, `score <= 28`)
    //   29 → C×9 + B   = 27 + 2  (primer punto de Dinámico)
    //   34 → D×8 + A×2 = 32 + 2  (tope de Dinámico, `score <= 34`)
    //   35 → D×8 + B + A = 32 + 2 + 1 (primer punto de Agresivo)
    const cortes: Array<{
      indices: number[];
      puntos: number;
      perfil: string;
      tramo: string;
      izquierda: number;
      segmento: number;
    }> = [
      { indices: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0], puntos: 16, perfil: 'Conservador', tramo: '10–16', izquierda: 18, segmento: 0 },
      { indices: [1, 1, 1, 1, 1, 1, 1, 0, 0, 0], puntos: 17, perfil: 'Moderado', tramo: '17–22', izquierda: 22, segmento: 1 },
      { indices: [2, 2, 2, 2, 2, 2, 2, 2, 1, 1], puntos: 28, perfil: 'Equilibrado', tramo: '23–28', izquierda: 58, segmento: 2 },
      { indices: [2, 2, 2, 2, 2, 2, 2, 2, 2, 1], puntos: 29, perfil: 'Dinámico', tramo: '29–34', izquierda: 62, segmento: 3 },
      { indices: [3, 3, 3, 3, 3, 3, 3, 3, 0, 0], puntos: 34, perfil: 'Dinámico', tramo: '29–34', izquierda: 78, segmento: 3 },
      { indices: [3, 3, 3, 3, 3, 3, 3, 3, 1, 0], puntos: 35, perfil: 'Agresivo', tramo: '35–40', izquierda: 82, segmento: 4 },
    ];

    for (const corte of cortes) {
      await conSesionLimpia(page);
      await empezar(page);
      await responder(page, corte.indices);
      await expect(perfilMostrado(page)).toHaveText(corte.perfil);
      await expect(puntuacion(page)).toContainText(`${corte.puntos} puntos`);
      await expect(puntuacion(page)).toContainText(`tramo ${corte.tramo}`);
      // La flecha cae DENTRO del segmento nombrado, nunca sobre una divisoria.
      expect(
        await flecha(page).evaluate((el) => parseFloat((el as HTMLElement).style.left)),
      ).toBeCloseTo(corte.izquierda, 1);
      expect(await segmentoDeLaFlecha(page)).toBe(corte.segmento);
      // Los seis son extremo de tramo: el aviso de «estás en el borde» tiene que salir.
      await expect(avisoDeBorde(page)).toHaveCount(1);
    }
  });

  // ---------- CASO 3: lo que debe rechazarse ----------
  // La sesión guardada no es legible y la app NO se repone: se queda en la pantalla de
  // error, y como nadie borra la clave, cada recarga vuelve a caer en la misma piedra.
  test('1213 — una sesión guardada ilegible empieza de cero y no rompe la app', async ({
    page,
  }) => {
    await conSesionLimpia(page);
    // `leerSesion` solo comprueba la FORMA: `typeof currentQuestion === 'number'` y
    // `typeof answers === 'object'`. Un índice de pregunta fuera de rango pasa el filtro,
    // y luego `QUESTIONS[42]` es undefined → `question.id` revienta el render.
    await page.evaluate(() =>
      sessionStorage.setItem(
        'meskeia:test-perfil-inversor:v1',
        JSON.stringify({ currentQuestion: 42, answers: { 1: 2 } }),
      ),
    );
    await page.goto(RUTA);
    await esperarHidratacion(page);
    await expect(page.getByText('Algo salió mal')).toHaveCount(0);
    // Lo que promete el comentario de `leerSesion`: «JSON corrupto: se empieza de cero».
    await expect(page.getByRole('button', { name: /Comenzar Test/ })).toBeVisible();
    // Y la clave envenenada no debe sobrevivir a la lectura fallida, o el error se repite
    // en cada recarga de esa pestaña.
    expect(
      await page.evaluate(() => sessionStorage.getItem('meskeia:test-perfil-inversor:v1')),
    ).toBeNull();
  });

  test('1213 (bis) — `answers: null` ya no pasa el filtro por typeof null === "object"', async ({
    page,
  }) => {
    await conSesionLimpia(page);
    await page.evaluate(() =>
      sessionStorage.setItem(
        'meskeia:test-perfil-inversor:v1',
        JSON.stringify({ currentQuestion: 3, answers: null }),
      ),
    );
    await page.goto(RUTA);
    await esperarHidratacion(page);
    // `Object.keys(null)` lanza dentro del useEffect de recuperación.
    await expect(page.getByText('Algo salió mal')).toHaveCount(0);
  });

  // ---------- Hallazgos abiertos de esta re-inspección ----------
  test('1220 (regresión) — el aviso de borde NO sale en los dos extremos de la escala', async ({ page }) => {
    await conSesionLimpia(page);
    // 10 puntos es el MÍNIMO teórico (todo A): no existe un 9, así que «con un punto de
    // diferencia el resultado sería el perfil de al lado» es falso. Pasa igual con 40.
    await empezar(page);
    await responder(page, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    await expect(puntuacion(page)).toContainText('10 puntos');
    await expect(avisoDeBorde(page)).toHaveCount(0);
  });

  test('1215 (regresión) — avanzar de pregunta devuelve el foco a la tarjeta, no al <body>', async ({
    page,
  }) => {
    await conSesionLimpia(page);
    await empezar(page);
    await opcion(page, 1).click();
    await botonSiguiente(page).click();
    // «Siguiente →» se deshabilita al cambiar de pregunta (la nueva no tiene respuesta),
    // así que el navegador suelta el foco: activeElement pasa a ser BODY y el siguiente
    // Tab aterriza en el pie («catálogo de meskeIA»), no en las opciones de la pregunta
    // que se acaba de abrir. Hay que retroceder con Shift+Tab para contestarla. Y nada
    // anuncia el cambio: el único [aria-live] de la página es el de rutas de Next.
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
  });

  test('1216 (regresión) — los datos estructurados no llaman «validadas» a las 10 preguntas', async ({ page }) => {
    await page.goto(RUTA);
    // `featureList` del WebApplication dice «10 preguntas validadas para evaluar tolerancia
    // al riesgo». No hay validación de ninguna clase: el cuestionario y sus puntuaciones
    // están escritos inline en `page.tsx`, sin fuente ni referencia. Es la frase que se
    // llevan los asistentes de IA, en una app de riesgo financiero.
    const estructurados = (
      await page.locator('script[type="application/ld+json"]').allInnerTexts()
    ).join(' ');
    expect(estructurados).toContain('10 preguntas');
    expect(estructurados).not.toContain('preguntas validadas');
  });

  test('1218 (regresión) — la guía no nombra un índice concreto ni una cifra sin fuente', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const reglasDeOro = page.locator('[class*="tipsSection"]');
    const erroresComunes = page.locator('[class*="warningBox"]');
    // La reparación del 21/08/2026 quitó «MSCI World» y el «60/40» del RESULTADO y le puso
    // la nota de «ejemplos ilustrativos», pero la guía educativa de la misma página sigue
    // dando una regla en imperativo con el índice dentro —«Diversifica globalmente. No
    // concentres en España ni en Europa. Un ETF global (MSCI World)…»— y una cifra de
    // comportamiento sin fuente ni año («obtienen un 2–4% menos anual»).
    await expect(reglasDeOro).not.toContainText('MSCI World');
    await expect(erroresComunes).not.toContainText('2–4% menos anual');
  });

  test('1217 (regresión) — la app declara sus datos de referencia España (Latam-friendly)', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const cuerpo = page.locator('body');
    // CLAUDE.md §1.bis: datos de referencia de España con metodología universal →
    // <RegionBadge variant="es-data" />. La app no monta ninguno, y en cambio:
    //   · «Los bancos hacen el test de MiFID II por obligación legal» (norma de la UE,
    //     enunciada como lo que hacen «los bancos», sin más).
    //   · ocho importes en €, «pensión pública», «cuenta remunerada».
    //   · en el faqJsonLd que leen las IAs, «letras del Tesoro» para el conservador.
    expect(await page.locator('[class*="egionBadge"]').count()).toBeGreaterThan(0);
    await expect(cuerpo).not.toContainText('Los bancos hacen el test de MiFID II');
  });

  test('1214 (regresión) — con la sesión restaurada incompleta NO se emite resultado', async ({
    page,
  }) => {
    await conSesionLimpia(page);
    // El estado restaurado no se valida: basta con que `answers` sea un objeto. Con dos
    // respuestas y el índice en la última pregunta, la app deja pedir el resultado y
    // emite un juicio sobre la persona con una puntuación IMPOSIBLE en su propia escala:
    // «3 puntos · tramo 10–16» —el tramo no contiene la puntuación que él mismo imprime—
    // y la flecha se va a left: -16,6667 %, fuera de la barra.
    await page.evaluate(() =>
      sessionStorage.setItem(
        'meskeia:test-perfil-inversor:v1',
        JSON.stringify({ currentQuestion: 9, answers: { 1: 1, 2: 1 } }),
      ),
    );
    await page.goto(RUTA);
    await opcion(page, 0).click();

    /*
      ⚠️ 22/09/2026 — el testigo del acta comprobaba que la FLECHA cayera dentro de la barra
      (left >= 0), dando por hecho que la reparación consistiría en colocarla bien. El propio
      acta pide otra cosa en su «esperado» —«no hay resultado sin las 10 respuestas, como hace
      el flujo normal, que deshabilita Ver Resultado»— y es lo correcto: la flecha era el
      síntoma, y el defecto es emitir un juicio sobre la persona con una puntuación imposible
      en su propia escala. Ahora el botón no promete el resultado y lleva a la primera pregunta
      sin responder, así que no hay flecha que medir.
    */
    await expect(botonSiguiente(page)).toHaveText('Completar las que faltan →');
    await botonSiguiente(page).click();

    // No hay resultado: se ha vuelto a la primera pregunta sin contestar (la 3, porque la
    // sesión traía la 1 y la 2, y la 10 se acaba de responder).
    await expect(perfilMostrado(page)).toHaveCount(0);
    await expect(flecha(page)).toHaveCount(0);
    await expect(page.getByText('Pregunta 3 de 10')).toBeVisible();
  });

  test('1221 (regresión) — una sesión a medias avisa de que se ha recuperado y deja empezar de cero', async ({
    page,
  }) => {
    await conSesionLimpia(page);
    await empezar(page);
    await opcion(page, 1).click();
    await botonSiguiente(page).click();
    // Irse y volver en la misma pestaña (el logo lleva a la home) es un recorrido normal.
    await page.goto(RUTA);
    await expect(enunciado(page)).toHaveCount(1); // la recuperación funciona…
    // …pero no hay ni aviso de que se ha recuperado un test a medias ni forma de empezar
    // de nuevo: los únicos botones de la fase son A-D, «Anterior» y «Siguiente».
    await expect(page.getByRole('button', { name: /Comenzar Test|Repetir Test|empezar/i })).toHaveCount(
      1,
    );
  });
});

// ============================================================
// RE-INSPECCIÓN 26/09/2026 — con FIRMA DE ROTURA (nivel)
//
// Analytics marcaba 82,1 % de visitas cortas (catálogo 62,7 %) y 50 % de RECARGAS tras visita
// corta (catálogo 3,1 %) en 78 visitas de 30 días. Los nueve hallazgos del 22/09 siguen
// reparados (los casos de arriba, en verde), y la firma NO es de rotura: es de INSTRUMENTACIÓN.
//
// Cada fase de la app (portada, cuestionario, resultado) es un `return` distinto con su propio
// `<Footer appName="test-perfil-inversor" />`, y en cada uno el Footer cae en otra posición del
// árbol (índice 9, 7 y 5 dentro del `.container`). React no lo reconcilia: lo DESMONTA y lo
// vuelve a montar, y con él el `AnalyticsTracker`, cuyo efecto de montaje hace un
// POST /api/analytics/track/ — una VISITA nueva, en la misma sesión y sin otra app en medio.
// Medido con el navegador creyendo estar en meskeia.com (host-resolver-rules; todas las
// peticiones de analytics contestadas en el propio navegador, ninguna salió):
//   carga → 1 registro · «Comenzar» → 2 · «Ver Resultado» → 3 · «Revisar» → 4 · otra vez
//   «Ver Resultado» → 5 · «Repetir Test» → 6. Igual en escritorio que en móvil. Un F5 con el
//   test a medias → 2 registros en esa sola carga (portada + la recuperación de la sesión).
//   `/calculadora-porcentajes/`: 1 registro por carga y ninguno más al usarla.
// En el dump del 26/09: 36 sesiones con 78 filas, y en 21 de ellas la app aparece 2-4 veces
// seguidas con un hueco entre filas igual a la duración de la anterior (2-33 s = lo que se
// tarda en pulsar «Comenzar»; 54-462 s = lo que se tarda en contestar las diez).
//
// En localhost el tracker no envía nada, pero cada montaje escribe en consola
// «[Analytics] Desactivado en entorno de desarrollo»: eso es lo que cuentan los casos de abajo.
// Se compara siempre contra la carga limpia de la misma página, así que vale también contra
// `next dev` (donde el modo estricto duplica los montajes).
// ============================================================
test.describe('re-inspección 26/09/2026', () => {
  const puntuacion = (page: Page) => page.locator('p[class*="resultScore"]');
  const avisoDeBorde = (page: Page) => page.locator('[class*="resultScoreBorde"]');
  const izquierdaDeLaFlecha = (page: Page) =>
    flecha(page).evaluate((el) => parseFloat((el as HTMLElement).style.left));

  /** Carga la app con el almacenamiento de sesión vacío y ESPERA A QUE REACT HAYA HIDRATADO. */
  async function cargarLimpia(page: Page): Promise<void> {
    await page.goto(RUTA);
    await page.evaluate(() => {
      try {
        sessionStorage.clear();
      } catch {
        /* ventana privada */
      }
    });
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
  }

  /** Montajes del AnalyticsTracker del Footer (en producción, uno = un registro de visita). */
  function contarMontajesDelTracker(page: Page): () => number {
    let n = 0;
    page.on('console', (m) => {
      if (m.text().includes('[Analytics] Desactivado en entorno de desarrollo')) n++;
    });
    return () => n;
  }

  /**
   * Pone el tema y espera a que terminen las transiciones de color: la app y globals.css animan
   * `background-color`, y medir en el acto devuelve el fondo CLARO a medio camino (se vio al
   * reparar el 2179: la tarjeta seguía en rgb(255, 255, 255) con el tema oscuro ya puesto).
   */
  async function ponerTema(page: Page, tema: string): Promise<void> {
    await page.evaluate(async (t) => {
      document.documentElement.setAttribute('data-theme', t);
      await Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined)));
    }, tema);
  }

  /** Contraste WCAG entre el color del texto y el primer fondo opaco de sus ancestros. */
  async function contrasteDe(loc: Locator): Promise<number> {
    return loc.evaluate((el) => {
      const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
      const lum = ([r, g, b]: number[]) => {
        const f = (v: number) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      let fondo = [255, 255, 255];
      for (let e: Element | null = el; e; e = e.parentElement) {
        const c = rgb(getComputedStyle(e).backgroundColor);
        if (c.length >= 3 && (c.length < 4 || c[3] === 1)) {
          fondo = c.slice(0, 3);
          break;
        }
      }
      const l1 = lum(rgb(getComputedStyle(el).color));
      const l2 = lum(fondo);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    });
  }

  /**
   * Texto VISIBLE de los bloques propios de la app (resultado y guía). Ni `body.textContent`,
   * que arrastra los <script> de Next con anchos CSS como «20%», ni RelatedApps, cuyas
   * descripciones son de otras apps.
   */
  async function textoPropioDeLaApp(page: Page): Promise<string> {
    const bloques = page.locator(
      [
        'resultScreen', 'startScreen', 'questionCard', 'guideSection', 'comparativaSection',
        'escenariosSection', 'faqSection', 'stepGuideSection', 'tipsSection', 'warningBox',
      ].map((c) => `[class*="${c}"]`).join(', '),
    );
    return (await bloques.allInnerTexts()).join('\n');
  }

  // ---------- CASO 2 (límite), en escritorio ----------
  test('caso límite: 23 es el primer punto de Equilibrado (con aviso de borde) y 40 el techo (sin él)', async ({
    page,
  }) => {
    // Resuelto a mano con A=1 B=2 C=3 D=4:
    //   23 → B×7 + C×3 = 14 + 9. `score <= 22` es Moderado, así que 23 ya es Equilibrado, y es
    //        el SUELO de su tramo (23 = range[0] y 23 > 10, el mínimo de la escala): aviso de
    //        borde SÍ. Flecha = 2·20 + 2 + (23−23)/(28−23)·16 = 42 %.
    //   40 → D×10. Techo de la escala: no existe un 41, así que el aviso de borde NO sale
    //        (el 1220 solo probaba el suelo, 10). Flecha = 4·20 + 2 + (40−35)/(40−35)·16 = 98 %.
    await cargarLimpia(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responder(page, [1, 1, 1, 1, 1, 1, 1, 2, 2, 2]);
    await expect(perfilMostrado(page)).toHaveText('Equilibrado');
    await expect(puntuacion(page)).toContainText('23 puntos · tramo 23–28');
    await expect(avisoDeBorde(page)).toHaveCount(1);
    expect(await izquierdaDeLaFlecha(page)).toBeCloseTo(42, 1);

    await page.getByRole('button', { name: /Repetir Test/ }).click();
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responder(page, [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
    await expect(perfilMostrado(page)).toHaveText('Agresivo');
    await expect(puntuacion(page)).toContainText('40 puntos · tramo 35–40');
    await expect(avisoDeBorde(page)).toHaveCount(0);
    expect(await izquierdaDeLaFlecha(page)).toBeCloseTo(98, 1);
  });

  // ---------- CASO 3 (operativa / firma) ----------
  test('ningún botón del recorrido recarga ni navega: la URL no cambia y no hay navegación de documento', async ({
    page,
  }) => {
    // Descarta la hipótesis de «un Repetir que recarga la página»: todo es estado de React.
    await cargarLimpia(page);
    let navegaciones = 0;
    page.on('framenavigated', (f) => {
      if (f === page.mainFrame()) navegaciones++;
    });
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responder(page, [2, 1, 2, 0, 3, 1, 2, 2, 1, 2]); // 26 → Equilibrado
    await page.getByRole('button', { name: /Revisar mis respuestas/ }).click();
    await botonSiguiente(page).click(); // «Ver Resultado» otra vez
    await page.getByRole('button', { name: /Repetir Test/ }).click();
    await expect(page.getByRole('button', { name: /Comenzar Test/ })).toBeVisible();
    expect(navegaciones).toBe(0);
    expect(new URL(page.url()).pathname).toBe(RUTA);
  });

  /*
    ✅ REPARADOS el 26/09/2026 (hallazgos 2175 y 2176). La causa estaba en la app, no en el
    tracker: tres `return`, uno por fase, con el Footer en otra posición del árbol cada vez.
    Ahora hay un único árbol y lo común ocupa siempre el mismo sitio. Criterio del encargo:
    tras la carga, CERO montajes nuevos del tracker en TODO el recorrido —Comenzar → diez
    respuestas → Ver Resultado → Revisar → Ver Resultado → Repetir—, y una recarga con la
    sesión restaurada monta el tracker las mismas veces que una carga limpia.
  */
  test('2175 (regresión) — una carga registra UNA visita aunque pase por portada, cuestionario y resultado', async ({
    page,
  }) => {
    // Esperado: 0 montajes nuevos del tracker al pasar de fase (la página es la misma carga).
    // Antes: 2 hasta el resultado (uno en «Comenzar Test» y otro en «Ver Resultado») y 5 con
    // el recorrido entero.
    const montajes = contarMontajesDelTracker(page);
    await cargarLimpia(page);
    const trasLaCarga = montajes();
    expect(trasLaCarga).toBeGreaterThan(0); // el testigo existe: la carga sí se cuenta
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responder(page, [2, 1, 2, 0, 3, 1, 2, 2, 1, 2]); // 26 → Equilibrado
    await expect(perfilMostrado(page)).toHaveText('Equilibrado');
    await esperarPaginaAsentada(page);
    expect(montajes() - trasLaCarga).toBe(0);

    // El resto del recorrido que contaba el acta: Revisar → Ver Resultado → Repetir.
    await page.getByRole('button', { name: /Revisar mis respuestas/ }).click();
    await expect(enunciado(page)).toHaveText('¿Qué afirmación te representa mejor?');
    await botonSiguiente(page).click(); // «Ver Resultado» otra vez
    await expect(perfilMostrado(page)).toHaveText('Equilibrado');
    await page.getByRole('button', { name: /Repetir Test/ }).click();
    await expect(page.getByRole('button', { name: /Comenzar Test/ })).toBeVisible();
    await esperarPaginaAsentada(page);
    expect(montajes() - trasLaCarga).toBe(0);
  });

  test('2176 (regresión) — recuperar un test a medias tras un F5 no registra DOS visitas en esa carga', async ({
    page,
  }) => {
    // Esperado: una carga con la sesión recuperada monta el tracker las MISMAS veces que una
    // carga limpia. Antes: el doble (portada y, al restaurar, cuestionario).
    //
    // ⚠️ 26/09/2026 — la base del acta era `montajes()` justo después de `cargarLimpia`, que
    // navega DOS veces (una para vaciar sessionStorage y otra para cargar): medía dos cargas, y
    // comparada con una sola recarga no distinguía la app sana de la rota. Ahora se mide UNA
    // recarga con la sesión vacía, igual que la recarga con sesión que se compara después.
    const montajes = contarMontajesDelTracker(page);
    await cargarLimpia(page);
    const antesDeLaCargaLimpia = montajes();
    await page.reload();
    await esperarPaginaAsentada(page);
    const porCargaLimpia = montajes() - antesDeLaCargaLimpia;
    expect(porCargaLimpia).toBeGreaterThan(0); // el testigo existe
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responder(page, [1, 1]); // dos respuestas guardadas en sessionStorage
    await expect(page.getByText('Pregunta 3 de 10')).toBeVisible();

    const antesDelF5 = montajes();
    await page.reload();
    await esperarPaginaAsentada(page);
    await expect(page.getByText(/Hemos recuperado el test/)).toBeVisible(); // 1221 sigue reparado
    await esperarPaginaAsentada(page);
    expect(montajes() - antesDelF5).toBe(porCargaLimpia);
  });

  // ---------- Contenido y accesibilidad ----------
  test('2178 (regresión) — las cifras de la barra de distribución se leen (≥ 4,5:1) en los dos temas', async ({
    page,
  }) => {
    // Todo B = 20 puntos → Moderado, el perfil con los cuatro segmentos: 30/50/15/5.
    // Antes, en blanco: «30%» 4,11:1 (#2E86AB) · «50%» 2,80:1 (#48A9A6) · «15%» 2,26:1
    // (#7FB3D3) · «5%» 1,81:1 (#95C8DE). Texto de 14,4 px: exige 4,5:1. Umbrales calculados
    // a mano con la fórmula WCAG: blanco sobre #26718F (--primary-boton) 5,47:1; #1A1A1A
    // sobre #48A9A6 6,2:1, sobre #7FB3D3 7,7:1 y sobre #95C8DE 9,1:1.
    await cargarLimpia(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responder(page, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    await expect(perfilMostrado(page)).toHaveText('Moderado');
    const segmentos = page.locator('[class*="allocationSegment"]');
    await expect(segmentos).toHaveCount(4);
    for (const tema of ['light', 'dark']) {
      await ponerTema(page, tema);
      for (let i = 0; i < 4; i++) {
        expect(await contrasteDe(segmentos.nth(i))).toBeGreaterThanOrEqual(4.5);
      }
    }
    // Y ninguna cifra VISIBLE se sale de su segmento (se pintaría sobre el color de al lado):
    // la de un segmento estrecho se oculta, porque la leyenda de debajo ya la repite.
    const desbordadas = await segmentos.evaluateAll((els) =>
      els.filter((el) => {
        const cifra = el.querySelector('span');
        if (!cifra || cifra.getClientRects().length === 0) return false; // oculta: no cuenta
        const s = el.getBoundingClientRect();
        const c = cifra.getBoundingClientRect();
        return c.left < s.left - 0.5 || c.right > s.right + 0.5;
      }).length,
    );
    expect(desbordadas).toBe(0);
  });

  test('2179 (regresión) — el color de marca como texto y el blanco sobre marca cumplen 4,5:1 en los dos temas', async ({
    page,
  }) => {
    // `.contentCard h4` (17,6 px, peso 600: no llega a «texto grande») usaba var(--primary) como
    // color de TEXTO: 4,11:1 en claro y 3,50:1 en oscuro. CLAUDE.md: para eso está
    // --primary-texto (5,47:1 sobre blanco), y para el blanco encima de la marca, --primary-boton.
    await cargarLimpia(page);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const titulo = page.locator('[class*="contentCard"] h4').first();
    await expect(titulo).toContainText('¿Qué es el perfil inversor?');
    const situacion = page.locator('[class*="escenarioExample"] p').first(); // «Situación:», 3,90:1
    const faqAvanzada = page.locator('[class*="faqSectionItem"] h3').first();
    const pasoFuerte = page.locator('[class*="stepContent"] p strong').first();
    const perfilRecomendado = page.locator('[class*="escenarioTip"] strong').first();
    for (const tema of ['light', 'dark']) {
      await ponerTema(page, tema);
      for (const texto of [titulo, situacion, faqAvanzada, pasoFuerte, perfilRecomendado]) {
        expect(await contrasteDe(texto)).toBeGreaterThanOrEqual(4.5);
      }
    }

    // La insignia «Pregunta 1» (13,6 px) y «Simular esta Cartera»: blanco sobre la marca, 4,11:1.
    await ponerTema(page, 'light');
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    const insignia = page.locator('[class*="questionNumber"]');
    await expect(insignia).toHaveText('Pregunta 1');
    await responder(page, [2, 1, 2, 0, 3, 1, 2, 2, 1, 2]); // 26 → Equilibrado
    const simular = page.getByRole('link', { name: /Simular esta Cartera/ });
    for (const tema of ['light', 'dark']) {
      await ponerTema(page, tema);
      expect(await contrasteDe(simular)).toBeGreaterThanOrEqual(4.5);
    }
    await page.getByRole('button', { name: /Revisar mis respuestas/ }).click();
    for (const tema of ['light', 'dark']) {
      await ponerTema(page, tema);
      expect(await contrasteDe(insignia)).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('2180 (regresión) — el % va separado de la cifra con espacio duro', async ({ page }) => {
    // Norma del 25/09/2026: U+00A0 entre la cifra y el %. Se comprueba el carácter EXACTO con
    // textContent, porque toContainText normaliza los espacios y daría por bueno uno normal.
    await cargarLimpia(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await opcion(page, 1).click();
    await botonSiguiente(page).click();
    // Pregunta 2, QUESTIONS[1].text: «…perdiera un 20 % de su valor…»
    expect(await enunciado(page).textContent()).toContain('un 20 % de su valor');
    // Leyenda del Moderado (todo B = 20 puntos): «Renta Variable (30 %)».
    await responder(page, [1, 1, 1, 1, 1, 1, 1, 1, 1]);
    await expect(perfilMostrado(page)).toHaveText('Moderado');
    expect(await page.locator('[class*="legendItem"]').first().textContent()).toBe(
      'Renta Variable (30 %)',
    );
    // En todo el texto de la app (resultado + guía abierta) ya no queda una cifra pegada al %.
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    expect((await textoPropioDeLaApp(page)).match(/\d%/g) ?? []).toEqual([]);
    // Y el faqJsonLd que leen las IAs: «pérdidas temporales del 30-50 %».
    const estructurados = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).join(' ');
    expect(estructurados).toContain('30-50 %');
    expect(estructurados).not.toMatch(/\d%/);
  });

  test('2181 (regresión) — los importes de la guía llevan espacio antes del €', async ({ page }) => {
    await cargarLimpia(page);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    // Paso 4 de la guía: «Imagina que tu cartera de 10.000 € vale 6.000 € mañana».
    await expect(page.locator('[class*="stepGuideSection"]')).toContainText(
      /10\.000[ \u00A0]€ vale 6\.000[ \u00A0]€/,
    );
    // Los escenarios: «1.000 €/mes», «100.000 €» y los dos «200.000 €».
    const escenarios = page.locator('[class*="escenariosSection"]');
    await expect(escenarios).toContainText(/1\.000[ \u00A0]€\/mes/);
    await expect(escenarios).toContainText(/100\.000[ \u00A0]€ ahorrados/);
    await expect(escenarios).toContainText(/Los 200\.000[ \u00A0]€ son solo una parte/);
    // Ninguna cifra pegada al € en el texto de la app.
    expect((await textoPropioDeLaApp(page)).match(/\d€/g) ?? []).toEqual([]);
  });
});

// ============================================================
// RE-INSPECCIÓN 26/09/2026 — MÓVIL (360×740, táctil)
// ============================================================
test.describe('re-inspección 26/09/2026 · móvil', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  async function cargarLimpia(page: Page): Promise<void> {
    await page.goto(RUTA);
    await page.evaluate(() => {
      try {
        sessionStorage.clear();
      } catch {
        /* ventana privada */
      }
    });
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
  }

  async function responderTocando(page: Page, indices: number[]): Promise<void> {
    for (const i of indices) {
      await opcion(page, i).tap();
      await botonSiguiente(page).tap();
    }
  }

  // ---------- CASO 1 (normal), tocando ----------
  test('caso normal tocando: B,C,B,C,D,B,C,A,C,D suma 27 y da Equilibrado, sin aviso de borde', async ({
    page,
  }) => {
    // 2 + 3 + 2 + 3 + 4 + 2 + 3 + 1 + 3 + 4 = 27 → tramo 23–28 → Equilibrado. No es extremo
    // de tramo (23 ni 28): sin aviso. Flecha = 2·20 + 2 + (27−23)/(28−23)·16 = 54,8 %.
    await cargarLimpia(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    await responderTocando(page, [1, 2, 1, 2, 3, 1, 2, 0, 2, 3]);
    await expect(perfilMostrado(page)).toHaveText('Equilibrado');
    await expect(page.locator('p[class*="resultScore"]')).toContainText('27 puntos · tramo 23–28');
    await expect(page.locator('[class*="resultScoreBorde"]')).toHaveCount(0);
    expect(
      await flecha(page).evaluate((el) => parseFloat((el as HTMLElement).style.left)),
    ).toBeCloseTo(54.8, 1);
    await expect(page.getByRole('link', { name: /Simular esta Cartera/ })).toHaveAttribute(
      'href',
      '/estimador-cartera-inversion/?perfil=equilibrado',
    );
    // Nada se sale por la derecha a 360 px
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });

  /**
   * Borde inferior de la barra fija del logo (MeskeiaLogo, `position: fixed; top: 0`). Lo que
   * quede por encima está en el viewport pero TAPADO: `toBeInViewport` no lo distingue.
   */
  async function bordeDeLaBarraFija(page: Page): Promise<number> {
    return page.evaluate(() => {
      let borde = 0;
      for (const el of Array.from(document.querySelectorAll('body *'))) {
        const estilo = getComputedStyle(el);
        if (estilo.position !== 'fixed' || estilo.visibility === 'hidden') continue;
        const r = el.getBoundingClientRect();
        // Solo lo anclado arriba y de altura de barra (no un modal a pantalla completa).
        if (r.top <= 1 && r.height > 0 && r.height < 200) borde = Math.max(borde, r.bottom);
      }
      return borde;
    });
  }

  /** El elemento está en pantalla y ENTERO por debajo de la barra fija. */
  async function aLaVistaBajoLaBarra(page: Page, loc: Locator): Promise<void> {
    await expect(loc).toBeInViewport({ timeout: 2000 });
    const barra = await bordeDeLaBarraFija(page);
    const caja = await loc.boundingBox();
    expect(caja).not.toBeNull();
    expect(caja!.y).toBeGreaterThanOrEqual(barra);
    expect(caja!.y + caja!.height).toBeLessThanOrEqual(740);
  }

  /** Texto accesible del elemento que tiene el foco. */
  const foco = (page: Page) => page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');

  test('2177 (regresión) — tras tocar «Comenzar Test» se ve la pregunta 1, no el pie de la tarjeta', async ({
    page,
  }) => {
    // «Comenzar Test» está a ~1.300 px del principio de la portada (casi dos pantallas abajo).
    // Antes, al tocarlo, la fase de preguntas conservaba ese scroll: en pantalla quedaban la
    // opción D, «Anterior», «Siguiente» y el pie; el enunciado, en top −351 px.
    await cargarLimpia(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    await aLaVistaBajoLaBarra(page, page.getByText('Pregunta 1 de 10'));
    await aLaVistaBajoLaBarra(page, enunciado(page));
    // Y el foco va al encabezado de la fase nueva, no se queda en un botón que ya no existe.
    expect(await foco(page)).toBe('¿Cuál es tu horizonte temporal de inversión?');
  });

  test('2177 (regresión) — «Ver Resultado», «Revisar mis respuestas» y «Repetir Test» dejan a la vista lo que abren', async ({
    page,
  }) => {
    // Antes: «Revisar» → enunciado en top −644 px; «Repetir» → «Comenzar Test» en top −948 px.
    await cargarLimpia(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    await responderTocando(page, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]); // 20 → Moderado
    await expect(perfilMostrado(page)).toHaveText('Moderado');
    // El resultado empieza por su encabezado, y el nombre del perfil queda también a la vista.
    await aLaVistaBajoLaBarra(page, page.getByRole('heading', { name: 'Tu perfil es:' }));
    await aLaVistaBajoLaBarra(page, perfilMostrado(page));
    expect(await foco(page)).toBe('Tu perfil es:');

    await page.getByRole('button', { name: /Revisar mis respuestas/ }).tap();
    await aLaVistaBajoLaBarra(page, enunciado(page));
    expect(await foco(page)).toBe('¿Qué afirmación te representa mejor?');

    await botonSiguiente(page).tap();
    await page.getByRole('button', { name: /Repetir Test/ }).tap();
    await aLaVistaBajoLaBarra(page, page.getByRole('button', { name: /Comenzar Test/ }));
    expect(await foco(page)).toBe('¿Qué tipo de inversor eres?');
  });

  test('2177 — la recuperación de sesión al cargar NO roba el foco', async ({ page }) => {
    // El cambio de fase de la recuperación no lo pide la persona: la página acaba de cargarse
    // y el foco se queda donde lo deja el navegador. (El scroll no se afirma: en una recarga el
    // navegador restaura el suyo, y eso no es de la app.)
    await cargarLimpia(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    await responderTocando(page, [1]);
    await page.reload();
    await esperarPaginaAsentada(page);
    await expect(page.getByText(/Hemos recuperado el test/)).toBeVisible();
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BODY');
  });
});
