import { test, expect, Page, Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { ORIGEN } from './_puerto';

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
 *   Nota (20/08/2026, DESFASADA): entonces el campo `range` de `PROFILES` no se pintaba ni lo
 *   leía nadie. Desde las reparaciones del 21/08 y el 22/09 se pinta («tramo X–Y») y lo usa
 *   `getBarPosition`; `getProfile` sigue sin leerlo, así que los tramos se anclan por la PANTALLA.
 *
 *   Barra del resultado (20/08/2026, DESFASADO desde el 21/08): `getBarPosition(score) =
 *   (score - 10) / 30 * 100`. La fórmula vigente está en la re-inspección del 22/09, más abajo.
 *
 * LAS CARTERAS (`PROFILES[*].allocation`, RV/RF/Liquidez/Alternativos)
 *   Conservador 15/60/20/5 · Moderado 30/50/15/5 · Equilibrado 50/35/10/5
 *   Dinámico 70/20/5/5 · Agresivo 90/5/0/5
 *   Son las mismas que `PERFILES_PREDEFINIDOS` de `app/estimador-cartera-inversion`, que es
 *   adonde apunta el botón «Simular esta Cartera» con `?perfil=<slug>`: comprobado que el
 *   traspaso existe y cuadra.
 *
 * HALLAZGOS: cada inspección los escribe con `test.fail()` —afirman lo que debería pasar y fallan
 * a propósito mientras el defecto siga— y al repararlos se quita esa línea y quedan como
 * regresión. Los del 20/08, el 22/09 y el 26/09/2026 están REPARADOS (la base no tenía ninguno
 * abierto el 12/10/2026), y los del 14/10/2026 (3285-3287 y 3299-3302) y el 3233, REPARADOS el
 * 14 y el 15/10/2026; los de la re-inspección del 15/10/2026 (3310-3313), REPARADOS ese mismo día.
 * A 16/10/2026 los únicos `test.fail()` vivos son los de la re-inspección del 12/10/2026 (hallazgos
 * 3227-3232) y los de la del 16/10/2026, al final del fichero.
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
  // Desde el 15/10/2026 (3313) el resultado sobrevive a la recarga en la misma pestaña: para
  // empezar un test nuevo tras otro, la sesión se retira antes de volver a cargar.
  if (page.url().includes('/test-perfil-inversor/')) {
    await page.evaluate(() => sessionStorage.clear());
  }
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
    // Nueve primeras C + B×8 = 19 y la décima C (22), pero antes de pedir el resultado se
    // retrocede a la 9 y se sube de B (2) a C (3): 23, primer punto de Equilibrado.
    // 15/10/2026 (3312): la C va en la 1 y no en la 9, porque la 1 fija el perfil máximo y con
    // una B ahí («2 a 5 años») el tope sería Moderado; la suma es la misma.
    for (const i of [2, 1, 1, 1, 1, 1, 1, 1, 1]) {
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
    await opcion(page, 2).click(); // pregunta 9: B → C, +1 punto
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
// HALLAZGOS del 20/08/2026 — los siete REPARADOS el 21/08/2026. Los comentarios de cada caso
// cuentan el defecto tal como se vio entonces; hoy son regresiones y pasan en verde.
// ============================================================
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
    //   29 → D + C×7 + B×2 = 4 + 21 + 4  (primer punto de Dinámico; la D en la 1 desde el
    //        15/10/2026, 3312: con una C ahí, «5 a 10 años», el tope sería Equilibrado)
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
      { indices: [3, 2, 2, 2, 2, 2, 2, 2, 1, 1], puntos: 29, perfil: 'Dinámico', tramo: '29–34', izquierda: 62, segmento: 3 },
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
  // REPARADO (1213). El 22/09 una sesión guardada ilegible dejaba la app en la pantalla de
  // error, y como nadie borraba la clave, cada recarga volvía a caer en la misma piedra.
  test('1213 — una sesión guardada ilegible empieza de cero y no rompe la app', async ({
    page,
  }) => {
    await conSesionLimpia(page);
    // Entonces `leerSesion` solo comprobaba la FORMA: `typeof currentQuestion === 'number'` y
    // `typeof answers === 'object'`. Un índice de pregunta fuera de rango pasaba el filtro,
    // y luego `QUESTIONS[42]` era undefined → `question.id` reventaba el render.
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
    // Antes de la reparación, `Object.keys(null)` lanzaba dentro del useEffect de recuperación.
    await expect(page.getByText('Algo salió mal')).toHaveCount(0);
  });

  // ---------- Hallazgos de esta re-inspección (1214-1221): REPARADOS, hoy son regresiones ----------
  // Los comentarios de cada caso cuentan el defecto tal como se vio el 22/09/2026.
  test('1220 (regresión) — el aviso de borde NO sale en los dos extremos de la escala', async ({ page }) => {
    await conSesionLimpia(page);
    // 10 puntos es el MÍNIMO teórico (todo A): no existe un 9, así que «con un punto de
    // diferencia el resultado sería el perfil de al lado» era falso. Pasaba igual con 40.
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
    // «Siguiente →» se deshabilita al cambiar de pregunta (la nueva no tiene respuesta), y
    // antes de la reparación el navegador soltaba el foco: activeElement pasaba a ser BODY y el
    // siguiente Tab aterrizaba en el pie («catálogo de meskeIA»), no en las opciones de la
    // pregunta recién abierta. Y nada anunciaba el cambio: el único [aria-live] de la página
    // era el de rutas de Next. Hoy el foco va a la tarjeta, que es `aria-live`.
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
  });

  test('1216 (regresión) — los datos estructurados no llaman «validadas» a las 10 preguntas', async ({ page }) => {
    await page.goto(RUTA);
    // `featureList` del WebApplication decía «10 preguntas validadas para evaluar tolerancia
    // al riesgo». No hay validación de ninguna clase: el cuestionario y sus puntuaciones
    // están escritos inline en `page.tsx`, sin fuente ni referencia. Era la frase que se
    // llevaban los asistentes de IA, en una app de riesgo financiero.
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
    // la nota de «ejemplos ilustrativos», pero la guía educativa de la misma página seguía
    // dando una regla en imperativo con el índice dentro —«Diversifica globalmente. No
    // concentres en España ni en Europa. Un ETF global (MSCI World)…»— y una cifra de
    // comportamiento sin fuente ni año («obtienen un 2–4% menos anual»). REPARADO.
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
    // <RegionBadge variant="es-data" />. El 22/09 la app no montaba ninguno, y en cambio:
    //   · «Los bancos hacen el test de MiFID II por obligación legal» (norma de la UE,
    //     enunciada como lo que hacen «los bancos», sin más).
    //   · ocho importes en €, «pensión pública», «cuenta remunerada».
    //   · en el faqJsonLd que leen las IAs, «letras del Tesoro» para el conservador.
    // REPARADO: hoy monta el badge `es-data` y la frase de MiFID habla de la UE.
    expect(await page.locator('[class*="egionBadge"]').count()).toBeGreaterThan(0);
    await expect(cuerpo).not.toContainText('Los bancos hacen el test de MiFID II');
  });

  test('1214 (regresión) — con la sesión restaurada incompleta NO se emite resultado', async ({
    page,
  }) => {
    await conSesionLimpia(page);
    // El 22/09 el estado restaurado no se validaba: bastaba con que `answers` fuera un objeto.
    // Con dos respuestas y el índice en la última pregunta, la app dejaba pedir el resultado y
    // emitía un juicio sobre la persona con una puntuación IMPOSIBLE en su propia escala:
    // «3 puntos · tramo 10–16» —el tramo no contenía la puntuación que él mismo imprimía—
    // y la flecha se iba a left: -16,6667 %, fuera de la barra. REPARADO.
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
    // …y el 22/09 no había ni aviso de que se había recuperado un test a medias ni forma de
    // empezar de nuevo: los únicos botones de la fase eran A-D, «Anterior» y «Siguiente».
    // REPARADO: aviso con «Empezar de cero».
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
    // La C en la 1 (15/10/2026, 3312): con una B ahí, «2 a 5 años», el tope sería Moderado.
    await responder(page, [2, 1, 1, 1, 1, 1, 1, 1, 2, 2]);
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
  test('caso normal tocando: C,C,B,C,D,B,C,A,B,D suma 27 y da Equilibrado, sin aviso de borde', async ({
    page,
  }) => {
    // 3 + 3 + 2 + 3 + 4 + 2 + 3 + 1 + 2 + 4 = 27 → tramo 23–28 → Equilibrado. No es extremo
    // de tramo (23 ni 28): sin aviso. Flecha = 2·20 + 2 + (27−23)/(28−23)·16 = 54,8 %.
    // La 1 y la 9 cambian de sitio (15/10/2026, 3312): con la B en la 1, «2 a 5 años», el tope
    // por horizonte daría Moderado. La suma es la misma.
    await cargarLimpia(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    await responderTocando(page, [2, 2, 1, 2, 3, 1, 2, 0, 1, 3]);
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

// ============================================================
// RE-INSPECCIÓN 12/10/2026 — FIRMA DE ROTURA (nivel) y cabo C0158
//
// LA FIRMA. Analytics: 76,2 % de visitas cortas (catálogo 62,8 %) y 33,3 % de recargas
// (catálogo 3,2 %) en 63 visitas de los 30 días hasta el 11/10. Partida en dos con el dump del
// 12/10 y la misma definición que `scripts/inspector/firma.mjs`:
//   12/09–26/09 (antes de bbb70c9b): 46 visitas · 84,8 % cortas · 45,7 % recargas
//   27/09–11/10 (después):           17 visitas · 52,9 % cortas ·  0,0 % recargas
//                                    (resto del catálogo en esa ventana: 64,9 % · 2,9 %)
// Y en el navegador, creyendo estar en https://meskeia.com (todas las peticiones contestadas en
// local, ninguna salió): UNA carga = 1 POST /api/analytics/track/, en escritorio y en móvil
// táctil; 0 más con Comenzar → 10 respuestas → Ver Resultado → Revisar → Ver Resultado →
// Repetir → Comenzar → 2 respuestas; y un F5 con el test a medias, 1 más (no 2). La firma era el
// pie remontado de 2175/2176, y su testigo es el test 2175 de arriba.
//
// LOS CASOS, resueltos a mano antes de abrir el navegador (A=1 · B=2 · C=3 · D=4):
//   normal  → D,D,C,D,D,C,D,D,C,D = 4·7 + 3·3 = 37 → Agresivo (escritorio)
//             A,C,B,B,A,C,B,D,A,B = 1+3+2+2+1+3+2+4+1+2 = 21 → Moderado (móvil 390×844)
//   límite  → C×8 + B×2 = 28, tope de Equilibrado; desde «Revisar», la 10 de B a C = 29, suelo de
//             Dinámico: un punto cambia el perfil y los dos llevan aviso de borde (móvil 360×740)
//   rechazo → seis sesiones guardadas que `leerSesion` debe tirar y RETIRAR
//
// EL ESTIMADOR (cabo C0158). «Simular esta Cartera» lleva a /estimador-cartera-inversion/ con
// ?perfil=<slug>, que carga la MISMA cartera (90/5/0/5 para Agresivo) y la pasa por su motor:
// σ de RV 16 %, RF 5 %, liquidez 0,5 %, alternativos 12 %, con su matriz de correlaciones
// (RV-RF 0,25 · RV-liq 0,10 · RV-alt 0,40 · RF-liq 0,05 · RF-alt 0,15 · liq-alt 0,05).
// A mano, σp = √(Σ wi·wj·σi·σj·ρij):
//   Conservador 15/60/20/5 → √0,0020506 = 4,53 %    Moderado 30/50/15/5 → √0,0038505 = 6,21 %
//   Equilibrado 50/35/10/5 → √0,0078672 = 8,87 %    Dinámico 70/20/5/5  → √0,0138017 = 11,75 %
//   Agresivo    90/5/0/5   → √0,0216540 = 14,72 %
// y rentabilidad Σ wi·μi (μ = 7 · 3 · 1,5 · 5 %): 3,40 · 4,08 · 4,95 · 5,83 · 6,70 %.
// El test anuncia para esas mismas carteras 5–8 · 8–12 · 12–15 · 15–20 · 20–25 % de volatilidad:
// ninguna de las cinco cifras del estimador cae dentro del tramo que anuncia el test.
//
// Los `test.fail` de este bloque son, en la base: C0158 → 3227 · flecha y etiquetas de la barra
// → 3228 · «más objetiva» que el banco → 3229 · «cada cuánto revisar» → 3230 · FAQPage del
// agresivo → 3231 · tabla comparativa → 3232 · doble toque → 3233. El 3233 se REPARÓ el 15/10/2026
// (e903863e, con el 3299) y su caso es hoy regresión; 3227-3232 siguen abiertos y reproduciéndose
// a 15/10/2026 y a 16/10/2026 (re-inspecciones de esas fechas, al final del fichero).
// ============================================================

/** Carga la app con el almacenamiento de sesión vacío y espera a que React haya hidratado. */
async function cargarSinSesion(page: Page): Promise<void> {
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

/**
 * Como `responder`, pero tocando (móvil).
 *
 * La pausa antes de cada opción es la de quien lee la pregunta (15/10/2026, 3299/3233): a 390×844
 * la B de la pregunta 5 cae justo donde se tocó «Siguiente», y un toque ahí a los ~50 ms, sin
 * desplazar la página, es la forma exacta de un doble toque, que la app absorbe a propósito.
 */
async function tocarRespuestas(page: Page, indices: number[]): Promise<void> {
  for (const i of indices) {
    await page.waitForTimeout(500);
    await opcion(page, i).tap();
    await botonSiguiente(page).tap();
  }
}

/** «14,72» → 14.72. Cifras que pinta la propia app, en formato español y sin millares. */
function cifraEspanola(texto: string): number {
  const [entera, decimales = ''] = texto.trim().split(',');
  return Number(entera) + (decimales ? Number(decimales) / 10 ** decimales.length : 0);
}

/** Tramo «a–b %» → [a, b]; un «+» final («20–25 %+») deja el techo abierto. */
function tramoPorcentual(texto: string): [number, number] {
  const m = texto.match(/(\d+(?:,\d+)?)\s*[-–]\s*(\d+(?:,\d+)?)/);
  if (!m) throw new Error(`«${texto}» no es un tramo a–b`);
  return [cifraEspanola(m[1]), texto.includes('+') ? Infinity : cifraEspanola(m[2])];
}

/** El FAQPage que se sirve en el <head>: pregunta → respuesta. */
async function faqPage(page: Page): Promise<Map<string, string>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = bloques
    .map((b) => JSON.parse(b) as { '@type'?: string; mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }> })
    .find((b) => b['@type'] === 'FAQPage');
  expect(faq, 'la página no sirve un FAQPage').toBeTruthy();
  return new Map(faq!.mainEntity!.map((q) => [q.name, q.acceptedAnswer.text]));
}

const sinEspacios = (s: string) => s.replace(/\s+/g, ' ').trim();

test.describe('re-inspección 12/10/2026', () => {
  const puntuacion = (page: Page) => page.locator('p[class*="resultScore"]');
  const avisoDeBorde = (page: Page) => page.locator('[class*="resultScoreBorde"]');

  // ---------- CASO 1 (normal), escritorio, y el traspaso al estimador ----------
  test('caso normal: D,D,C,D,D,C,D,D,C,D suma 37 → Agresivo, y «Simular esta Cartera» abre su 90/5/0/5 en el estimador', async ({
    page,
  }) => {
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responder(page, [3, 3, 2, 3, 3, 2, 3, 3, 2, 3]); // 4·7 + 3·3 = 37
    await expect(perfilMostrado(page)).toHaveText('Agresivo');
    await expect(puntuacion(page)).toContainText('37 puntos · tramo 35–40');
    await expect(avisoDeBorde(page)).toHaveCount(0); // 37 no es extremo de 35–40
    // 4·20 + 2 + (37−35)/(40−35)·16 = 88,4 %
    expect(await flecha(page).evaluate((el) => parseFloat((el as HTMLElement).style.left))).toBeCloseTo(88.4, 1);
    expect(await segmentoDeLaFlecha(page)).toBe(4);
    // PROFILES.agresivo.traits
    await expect(rasgo(page, 0)).toHaveText('Muy alto');
    await expect(rasgo(page, 1)).toHaveText('> 15 años');
    await expect(rasgo(page, 2)).toHaveText('20-25 %');
    await expect(rasgo(page, 3)).toHaveText('Máxima rentabilidad');
    expect(await reparto(page)).toEqual([
      'Renta Variable (90 %)',
      'Renta Fija (5 %)',
      'Liquidez (0 %)',
      'Alternativos (5 %)',
    ]);

    await page.getByRole('link', { name: /Simular esta Cartera/ }).click();
    await page.waitForURL(/\/estimador-cartera-inversion\/\?perfil=agresivo/);
    await esperarPaginaAsentada(page);
    // `[class*="perfilBanner"]` casa también con su icono y su enlace: el primero es el contenedor
    await expect(page.locator('[class*="perfilBanner"]').first()).toContainText(
      'Simulando con tu perfil Agresivo del test',
    );
    // Fila «Agresivo» de su tabla: 6,70 % de rentabilidad y 14,72 % de volatilidad, a mano
    // en la cabecera de este bloque (90/5/0/5 por su motor).
    const fila = page
      .locator('table', { has: page.locator('th', { hasText: 'Volatilidad' }) })
      .locator('tr', { has: page.locator('td strong', { hasText: /^Agresivo$/ }) });
    await expect(fila).toContainText('6,70');
    await expect(fila).toContainText('14,72');
  });

  // ---------- Hallazgo C0158 ----------
  test.fail('C0158 — la volatilidad que el test anuncia para cada cartera no contradice la que da el estimador al que enlaza', async ({
    page,
  }) => {
    // Esperado: el σ que calcula el estimador para cada cartera cae dentro del tramo que el test
    // anuncia para ella. No se juzga cuál de las dos cifras es la buena: basta con que las dos
    // páginas, enlazadas por «Simular esta Cartera», no se contradigan.
    // Obtenido (12/10/2026): 4,53 ∉ 5–8 · 6,21 ∉ 8–12 · 8,87 ∉ 12–15 · 11,75 ∉ 15–20 · 14,72 ∉ 20–25.
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const celdas = await page
      .locator('[class*="comparativaTable"] tr', { hasText: 'Volatilidad' })
      .locator('td')
      .allTextContents();
    const tramos = celdas.slice(1).map(tramoPorcentual);
    expect(tramos).toHaveLength(5);

    await page.goto('/estimador-cartera-inversion/');
    await esperarPaginaAsentada(page);
    const perfiles = ['Conservador', 'Moderado', 'Equilibrado', 'Dinámico', 'Agresivo'];
    const tablaDelEstimador = page.locator('table', { has: page.locator('th', { hasText: 'Volatilidad' }) });
    const volatilidades = await tablaDelEstimador.locator('tr').evaluateAll((filas, nombres) => {
      const porNombre = new Map(
        filas.map((f) => {
          const tds = Array.from(f.querySelectorAll('td')).map((td) => td.textContent ?? '');
          return [tds[0]?.trim(), tds[3] ?? ''] as const;
        }),
      );
      return nombres.map((n) => (porNombre.get(n) ?? '').replace(/[^\d,]/g, ''));
    }, perfiles);
    expect(volatilidades.every((v) => v.length > 0)).toBe(true);

    const contradicciones = perfiles
      .map((p, i) => ({ p, sigma: cifraEspanola(volatilidades[i]), tramo: tramos[i] }))
      .filter(({ sigma, tramo }) => sigma < tramo[0] || sigma > tramo[1])
      .map(({ p, sigma, tramo }) => `${p}: estimador ${sigma} % fuera de ${tramo[0]}–${tramo[1]} %`);
    expect(contradicciones).toEqual([]);
  });

  // ---------- CASO 3 (rechazo) ----------
  test('caso a rechazar: seis sesiones guardadas ilegibles empiezan de cero y se retiran', async ({ page }) => {
    test.setTimeout(60_000);
    const CLAVE = 'meskeia:test-perfil-inversor:v1';
    // Cada una la rechaza un control distinto de `leerSesion`; esperado en todas: portada con
    // «Comenzar Test», sin «Algo salió mal», sin aviso de test recuperado y la clave RETIRADA.
    const ilegibles: Record<string, string> = {
      'respuesta que no es opción (la 2 solo admite 1-4)': JSON.stringify({ currentQuestion: 4, answers: { 1: 2, 2: 5 } }),
      'índice de pregunta no entero': JSON.stringify({ currentQuestion: 2.5, answers: { 1: 2 } }),
      'pregunta que no existe (la 11)': JSON.stringify({ currentQuestion: 3, answers: { 11: 2 } }),
      'respuestas como array': JSON.stringify({ currentQuestion: 3, answers: [2, 3] }),
      'puntos como texto': JSON.stringify({ currentQuestion: 3, answers: { 1: '2' } }),
      'JSON cortado': '{"currentQuestion": 3, "answers": {1: 2',
    };
    for (const [caso, valor] of Object.entries(ilegibles)) {
      await page.goto(RUTA);
      await page.evaluate(([k, v]) => sessionStorage.setItem(k, v), [CLAVE, valor]);
      await page.goto(RUTA);
      await esperarPaginaAsentada(page);
      await expect(page.getByRole('button', { name: /Comenzar Test/ }), caso).toBeVisible();
      await expect(enunciado(page), caso).toHaveCount(0);
      await expect(page.getByText(/Hemos recuperado el test/), caso).toHaveCount(0);
      await expect(page.getByText('Algo salió mal'), caso).toHaveCount(0);
      expect(await page.evaluate((k) => sessionStorage.getItem(k), CLAVE), caso).toBeNull();
    }
    // Control: una sesión VÁLIDA sí se recupera (el rechazo no es «nunca recupera nada»).
    await page.evaluate(
      (k) => sessionStorage.setItem(k, JSON.stringify({ currentQuestion: 2, answers: { 1: 2, 2: 3 } })),
      CLAVE,
    );
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    await expect(page.getByText('Pregunta 3 de 10')).toBeVisible();
    await expect(page.getByText(/con 2 de 10 respuestas/)).toBeVisible();
  });

  // ---------- Hallazgos de contenido ----------
  test.fail('HALLAZGO — la guía no presenta este test como «más objetivo» que el de idoneidad del banco', async ({
    page,
  }) => {
    // La FAQ avanzada dice del test MiFID II del banco que «a veces está sesgado […] para reducir
    // reclamaciones» y que «el de este test busca darte una imagen más objetiva de tu situación
    // real». La propia app reconoce en metadata.ts (hallazgo 1216) que su cuestionario, sus
    // pesos 1-4 y sus cinco tramos no tienen fuente, referencia ni validación.
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const respuesta = page
      .locator('[class*="faqSectionItem"]')
      .filter({ hasText: '¿Qué pasa si el banco me asigna un perfil diferente?' });
    await expect(respuesta).toHaveCount(1);
    await expect(respuesta).not.toContainText('más objetiva');
  });

  test.fail('HALLAZGO — «cada cuánto revisar el perfil» tiene UNA respuesta en el FAQPage y en la FAQ visible', async ({
    page,
  }) => {
    // FAQPage: «…al menos una vez al año, y además ante cambios significativos en la situación
    // personal: proximidad a la jubilación, cambio de empleo, herencia, matrimonio, divorcio o
    // cambio en los objetivos financieros. El perfil puede evolucionar a lo largo de la vida.»
    // Visible: «…al menos una vez al año y siempre que ocurra un cambio vital significativo: nuevo
    // trabajo, matrimonio, nacimiento de hijos, herencia, compra de vivienda o jubilación próxima.
    // Los mercados también cambian tu exposición real…»
    await page.goto(RUTA);
    const faq = await faqPage(page);
    const enFaqPage = faq.get('¿Cada cuánto tiempo se debe revisar el perfil inversor?');
    expect(enFaqPage).toBeTruthy();
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const visible = await page
      .locator('[class*="faqSectionItem"]')
      .filter({ hasText: '¿Con qué frecuencia debo revisar mi perfil?' })
      .locator('p')
      .first()
      .textContent();
    expect(sinEspacios(visible ?? '')).toBe(sinEspacios(enFaqPage ?? ''));
  });

  test.fail('HALLAZGO — el FAQPage describe al perfil agresivo con lo que la página le asocia', async ({ page }) => {
    // FAQPage: «invierte principalmente en renta variable: acciones individuales, fondos de bolsa,
    // ETFs sectoriales y mercados emergentes». La página, para Agresivo: «ETFs 100 % renta
    // variable global», «Exposición significativa a mercados emergentes», factores; su tabla,
    // «100 % acciones globales»; y su regla de oro, «Diversifica globalmente». Acciones sueltas y
    // ETFs de un sector son concentración, lo contrario de lo que la página asocia a ese perfil.
    await page.goto(RUTA);
    const faq = await faqPage(page);
    const agresivo = faq.get('¿En qué invierte un perfil agresivo?') ?? '';
    expect(agresivo.length).toBeGreaterThan(0);
    expect(agresivo).not.toMatch(/acciones individuales|ETFs sectoriales/);
  });

  test.fail('HALLAZGO — la tabla comparativa nombra los rasgos como el resultado y no da al Equilibrado otro reparto', async ({
    page,
  }) => {
    // El resultado pinta «Volatilidad esperada» y «Horizonte ideal»; la tabla de la guía da los
    // MISMOS tramos como «Volatilidad máxima» y «Horizonte mínimo». Y la tabla pone al
    // Equilibrado «ETFs globales 60/40» cuando su cartera es 50/35/10/5.
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responder(page, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]); // 20 → Moderado
    await expect(perfilMostrado(page)).toHaveText('Moderado');
    const rotulos = (await page.locator('[class*="traitLabel"]').allTextContents()).filter((r) =>
      /Volatilidad|Horizonte/.test(r),
    );
    expect(rotulos).toHaveLength(2);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const tabla = page.locator('[class*="comparativaTable"]');
    const cabecerasDeFila = (await tabla.locator('tbody tr td:first-child').allTextContents()).map(sinEspacios);
    expect(cabecerasDeFila).toEqual(expect.arrayContaining(rotulos));
    const activos = await tabla.locator('tr', { hasText: 'Activos típicos' }).locator('td').allTextContents();
    expect(activos[3]).not.toContain('60/40'); // columna Equilibrado
  });
});

test.describe('re-inspección 12/10/2026 · móvil 390×844', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('caso normal tocando: D,C,B,B,A,C,B,A,A,B suma 21 → Moderado, sin aviso de borde', async ({ page }) => {
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    // 15/10/2026 (3312): la D de la 8 y la A de la 1 cambian de sitio (misma suma); con la A en
    // la 1, «Menos de 2 años», el tope por horizonte daría Conservador.
    await tocarRespuestas(page, [3, 2, 1, 1, 0, 2, 1, 0, 0, 1]); // 4+3+2+2+1+3+2+1+1+2 = 21
    await expect(perfilMostrado(page)).toHaveText('Moderado');
    await expect(page.locator('p[class*="resultScore"]')).toContainText('21 puntos · tramo 17–22');
    await expect(page.locator('[class*="resultScoreBorde"]')).toHaveCount(0); // ni 17 ni 22
    // 1·20 + 2 + (21−17)/(22−17)·16 = 34,8 %
    expect(await flecha(page).evaluate((el) => parseFloat((el as HTMLElement).style.left))).toBeCloseTo(34.8, 1);
    // PROFILES.moderado
    await expect(rasgo(page, 0)).toHaveText('Bajo');
    await expect(rasgo(page, 1)).toHaveText('3-5 años');
    await expect(rasgo(page, 2)).toHaveText('8-12 %');
    await expect(rasgo(page, 3)).toHaveText('Batir inflación');
    expect(await reparto(page)).toEqual([
      'Renta Variable (30 %)',
      'Renta Fija (50 %)',
      'Liquidez (15 %)',
      'Alternativos (5 %)',
    ]);
    await expect(page.getByRole('link', { name: /Simular esta Cartera/ })).toHaveAttribute(
      'href',
      '/estimador-cartera-inversion/?perfil=moderado',
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

test.describe('re-inspección 12/10/2026 · móvil 360×740', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // ---------- CASO 2 (límite) ----------
  test('caso límite tocando: 28 es el tope de Equilibrado y, revisando la 10 de B a C, 29 ya es Dinámico', async ({
    page,
  }) => {
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    // D + C×6 + B×3 = 4 + 18 + 6 = 28. Era C×8 + B×2; desde el 15/10/2026 (3312) la 1 lleva la D,
    // porque con una C ahí («5 a 10 años») el tope por horizonte no deja pasar de Equilibrado.
    await tocarRespuestas(page, [3, 2, 2, 2, 2, 2, 2, 1, 1, 1]);
    await expect(perfilMostrado(page)).toHaveText('Equilibrado');
    await expect(page.locator('p[class*="resultScore"]')).toContainText('28 puntos · tramo 23–28');
    await expect(page.locator('[class*="resultScoreBorde"]')).toHaveCount(1); // tope de su tramo
    // 2·20 + 2 + (28−23)/(28−23)·16 = 58 %
    expect(await flecha(page).evaluate((el) => parseFloat((el as HTMLElement).style.left))).toBeCloseTo(58, 1);

    await page.getByRole('button', { name: /Revisar mis respuestas/ }).tap();
    await expect(page.getByText('Pregunta 10 de 10')).toBeVisible();
    // La 10 conserva la B (2 puntos): «Acepto algo de riesgo si la posible ganancia lo justifica»
    await expect(page.locator('[class*="optionButton"][aria-pressed="true"]')).toContainText('Acepto algo de riesgo');
    await opcion(page, 2).tap(); // B → C: +1
    await botonSiguiente(page).tap();
    await expect(perfilMostrado(page)).toHaveText('Dinámico');
    await expect(page.locator('p[class*="resultScore"]')).toContainText('29 puntos · tramo 29–34');
    await expect(page.locator('[class*="resultScoreBorde"]')).toHaveCount(1); // suelo de su tramo
    // 3·20 + 2 + (29−29)/(34−29)·16 = 62 %
    expect(await flecha(page).evaluate((el) => parseFloat((el as HTMLElement).style.left))).toBeCloseTo(62, 1);
    await expect(page.getByRole('link', { name: /Simular esta Cartera/ })).toHaveAttribute(
      'href',
      '/estimador-cartera-inversion/?perfil=dinamico',
    );
  });

  // ---------- Hallazgos de operativa en móvil ----------
  test.fail('HALLAZGO — la flecha de la barra señala la etiqueta del perfil que se nombra (31 y 37 puntos)', async ({
    page,
  }) => {
    // Las cinco etiquetas van con `justify-content: space-between` y sin hueco: a 360 px suman
    // 297 px sobre una barra de 264, se pegan («ConservadorModeradoEquilibradoDinámicoAgresivo»)
    // y se salen 33 px por la derecha. La flecha se coloca por SEGMENTO (20 % cada uno), así que
    // con 31 puntos (Dinámico, 68,4 %) cae sobre «Equilibrado», y con 37 (Agresivo, 88,4 %),
    // sobre «Dinámico».
    test.setTimeout(60_000);
    const casos = [
      { indices: [3, 2, 3, 1, 2, 3, 2, 1, 3, 1], perfil: 'Dinámico' }, // 4+3+4+2+3+4+3+2+4+2 = 31
      { indices: [3, 3, 2, 3, 3, 2, 3, 3, 2, 3], perfil: 'Agresivo' }, // 4·7 + 3·3 = 37
    ];
    const problemas: string[] = [];
    for (const { indices, perfil } of casos) {
      await cargarSinSesion(page);
      await page.getByRole('button', { name: /Comenzar Test/ }).tap();
      await tocarRespuestas(page, indices);
      await expect(perfilMostrado(page)).toHaveText(perfil);
      // La flecha anima `left`: medir cuando ha terminado
      await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))));
      const g = await page.evaluate(() => {
        const f = document.querySelector('[class*="profileArrow"]')!.getBoundingClientRect();
        const barra = document.querySelector('[class*="profileBar"]')!.getBoundingClientRect();
        const etiquetas = Array.from(document.querySelectorAll('[class*="profileLabels"] span')).map((e) => {
          const r = e.getBoundingClientRect();
          return { texto: e.textContent ?? '', izq: r.left, der: r.right };
        });
        return { cx: f.left + f.width / 2, derBarra: barra.right, etiquetas };
      });
      const bajoLaFlecha = g.etiquetas.find((e) => g.cx >= e.izq && g.cx <= e.der)?.texto ?? '(hueco)';
      if (bajoLaFlecha !== perfil) problemas.push(`${perfil}: la flecha señala «${bajoLaFlecha}»`);
      const derEtiquetas = Math.max(...g.etiquetas.map((e) => e.der));
      if (derEtiquetas > g.derBarra + 1) problemas.push(`etiquetas ${Math.round(derEtiquetas - g.derBarra)} px más allá de la barra`);
    }
    expect(problemas).toEqual([]);
  });

  test('REPARADO 3233 — un doble toque en «Siguiente» avanza una pregunta y no toca nada de la nueva', async ({
    page,
  }) => {
    // «Anterior» y «Siguiente» van apilados y la tarjeta cambia de alto entre preguntas sin
    // recolocar la vista: de la 1 a la 2, «Siguiente» baja 75 px y «← Anterior» ocupa su sitio.
    // Con «Siguiente» al pie de la pantalla, el segundo toque de un doble toque (90 ms) devuelve
    // a la pregunta 1. (Con «Siguiente» a media pantalla, el segundo toque marcaba una opción de
    // la pregunta 2.) REPARADO (15/10/2026, con el 3299): el segundo toque en el mismo punto, sobre
    // otro control y dentro de 450 ms, se absorbe.
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    await opcion(page, 1).tap();
    await botonSiguiente(page).evaluate((el) => {
      window.scrollBy(0, el.getBoundingClientRect().bottom - (window.innerHeight - 24));
    });
    await page.waitForTimeout(200);
    const caja = await botonSiguiente(page).boundingBox();
    expect(caja).not.toBeNull();
    const x = caja!.x + caja!.width / 2;
    const y = caja!.y + caja!.height / 2;
    await page.touchscreen.tap(x, y);
    await page.waitForTimeout(90);
    await page.touchscreen.tap(x, y);
    await page.waitForTimeout(300);
    await expect(page.getByText('Pregunta 2 de 10')).toBeVisible();
    await expect(page.locator('[class*="optionButton"][aria-pressed="true"]')).toHaveCount(0);
  });
});

// ============================================================
// RE-INSPECCIÓN 14/10/2026 — cromo fijo (cd462414) y FIRMA DE ROTURA (nivel)
//
// LO QUE LA INVALIDÓ. cd462414 retiró el `scroll-margin-top` propio de `.destinoDeFase` (96 px, y
// 80 por debajo de 600 de ancho) y deja que lo resuelva el `scroll-padding` del documento
// (globals.css: la barra del logo, 62 px hasta 768 de ancho y 92 por encima, + 0,25rem; abajo la
// píldora del pie, fija solo por encima de 768, + 0,5rem). Medido: los cambios de FASE (Comenzar,
// Ver Resultado, Revisar, Repetir) dejan su destino a 96 px con la barra hasta 92 (1280×800) y a
// 66 px con la barra hasta 62 (390×844 y 360×740). Los cambios de PREGUNTA, no: ahí la app no
// recoloca la vista (solo da el foco a la tarjeta, 1215) y en un móvil pequeño el enunciado nuevo
// queda bajo la barra. Es el hallazgo nuevo del bloque de 360×740, y ya pasaba antes de cd462414:
// anulando el scroll-padding salen las mismas posiciones, ±8 px.
//
// LA FIRMA. Con el navegador creyendo estar en https://meskeia.com (sus peticiones servidas desde
// el servidor local, las de /api/analytics contestadas en el propio navegador y cualquier otro host
// abortado): UNA carga = 1 POST /api/analytics/track/, 0 más con Comenzar → 10 respuestas → Ver
// Resultado → Revisar → Ver Resultado → Repetir → Comenzar → 2 respuestas, y un F5 con el test a
// medias, 1 más. Igual a 1280×800, 360×740 y 390×844. La firma (antes del 27/09: 46 visitas y 21
// recargas; desde el 27/09: 17 visitas, 52,9 % cortas y 0 recargas) es el pie remontado de
// 2175/2176, reparado el 26/09. Su testigo de red es el caso «firma» del bloque de escritorio.
//
// LOS CASOS, resueltos a mano antes de abrir el navegador (A=1 · B=2 · C=3 · D=4; flecha =
// i·20 + 2 + (p − mín)/(máx − mín)·16 con el tramo del perfil, como en la re-inspección del 22/09):
//   normal  → A,B,A,A,B,A,B,A,A,C = 1+2+1+1+2+1+2+1+1+3 = 15 → Conservador (10–16), sin aviso de
//             borde, flecha 2 + 5/6·16 = 15,33 % (móvil 390×844, tocando)
//   límite  → A×4 + B×6 = 4 + 12 = 16, tope de Conservador; «Revisar», la 10 de B a C = 17, suelo de
//             Moderado: aviso de borde en los dos, flechas 18 % y 22 % (escritorio 1280×800)
//   rechazo → «Siguiente» sin contestar y «Ver Resultado» con 9 de 10 no avanzan; dos sesiones
//             imposibles (índice −1; 0 puntos, que no es opción) se tiran y se retiran (360×740)
// ============================================================

/** Borde inferior de la barra fija del logo (MeskeiaLogo la marca con `data-barra-logo`). */
async function bordeBarraLogo(page: Page): Promise<number> {
  return page.evaluate(
    () => document.querySelector('[data-barra-logo]')?.getBoundingClientRect().bottom ?? 0,
  );
}

/**
 * El elemento se ve ENTERO: por debajo de la barra fija del logo y por encima del borde de la
 * ventana o, si la píldora del pie es fija (escritorio), de la píldora. `toBeInViewport` da por
 * bueno lo que la barra tapa. Reintenta: el destino se coloca en un efecto, tras el render.
 */
async function enteroALaVista(page: Page, loc: Locator): Promise<void> {
  await expect(async () => {
    const limites = await page.evaluate(() => {
      const barra = document.querySelector('[data-barra-logo]')?.getBoundingClientRect().bottom ?? 0;
      const pildora = document.querySelector('[data-pildora-pie]');
      const suelo =
        pildora && getComputedStyle(pildora).position === 'fixed'
          ? pildora.getBoundingClientRect().top
          : window.innerHeight;
      return { barra, suelo };
    });
    const caja = await loc.boundingBox();
    expect(caja, 'el elemento no está en la página').not.toBeNull();
    expect(caja!.y, 'empieza bajo la barra del logo').toBeGreaterThanOrEqual(limites.barra - 0.5);
    expect(caja!.y + caja!.height, 'acaba antes del pie de la ventana').toBeLessThanOrEqual(limites.suelo + 0.5);
  }).toPass({ timeout: 3000 });
}

const UA_MOVIL_1410 =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36';
const izquierdaFlecha = (page: Page) =>
  flecha(page).evaluate((el) => parseFloat((el as HTMLElement).style.left));

// ---------- CASO 1 (normal), móvil 390×844 ----------
test.describe('re-inspección 14/10/2026 · móvil 390×844', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: UA_MOVIL_1410,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('caso normal tocando: A,B,A,A,B,A,B,A,A,C suma 15 → Conservador, y cada cambio de fase deja lo que abre bajo la barra del logo', async ({
    page,
  }) => {
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    // Destino de la fase: el progreso y el enunciado, enteros bajo la barra (que acaba en 62 px).
    await enteroALaVista(page, page.getByText('Pregunta 1 de 10'));
    await enteroALaVista(page, enunciado(page));

    await tocarRespuestas(page, [0, 1, 0, 0, 1, 0, 1, 0, 0, 2]); // 1+2+1+1+2+1+2+1+1+3 = 15
    await expect(perfilMostrado(page)).toHaveText('Conservador');
    await expect(page.locator('p[class*="resultScore"]')).toContainText('15 puntos · tramo 10–16');
    await expect(page.locator('[class*="resultScoreBorde"]')).toHaveCount(0); // ni 10 ni 16
    // 0·20 + 2 + (15−10)/(16−10)·16 = 15,33 %; un error de segmento movería la flecha 20 puntos
    expect(await izquierdaFlecha(page)).toBeCloseTo(15.33, 1);
    expect(await segmentoDeLaFlecha(page)).toBe(0);
    // PROFILES.conservador
    await expect(rasgo(page, 0)).toHaveText('Muy bajo');
    await expect(rasgo(page, 1)).toHaveText('< 3 años');
    await expect(rasgo(page, 2)).toHaveText('5-8 %');
    await expect(rasgo(page, 3)).toHaveText('Preservar capital');
    expect(await reparto(page)).toEqual([
      'Renta Variable (15 %)',
      'Renta Fija (60 %)',
      'Liquidez (20 %)',
      'Alternativos (5 %)',
    ]);
    await expect(page.getByRole('link', { name: /Simular esta Cartera/ })).toHaveAttribute(
      'href',
      '/estimador-cartera-inversion/?perfil=conservador',
    );
    await enteroALaVista(page, page.getByRole('heading', { name: 'Tu perfil es:' }));
    await enteroALaVista(page, perfilMostrado(page));

    await page.getByRole('button', { name: /Revisar mis respuestas/ }).tap();
    await enteroALaVista(page, page.getByText('Pregunta 10 de 10'));
    await enteroALaVista(page, enunciado(page));
    await botonSiguiente(page).tap(); // «Ver Resultado» otra vez: los mismos 15 puntos
    await expect(perfilMostrado(page)).toHaveText('Conservador');
    await enteroALaVista(page, page.getByRole('heading', { name: 'Tu perfil es:' }));

    await page.getByRole('button', { name: /Repetir Test/ }).tap();
    await enteroALaVista(page, page.getByRole('heading', { name: '¿Qué tipo de inversor eres?' }));
    await enteroALaVista(page, page.getByRole('button', { name: /Comenzar Test/ }));
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

// ---------- CASO 2 (límite) y la firma, escritorio 1280×800 ----------
test.describe('re-inspección 14/10/2026 · escritorio', () => {
  test.use({
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  });
  const puntuacion = (page: Page) => page.locator('p[class*="resultScore"]');
  const avisoDeBorde = (page: Page) => page.locator('[class*="resultScoreBorde"]');

  test('caso límite: 16 es el tope de Conservador y, revisando la 10 de B a C, 17 ya es Moderado; los destinos quedan bajo la barra de 92 px', async ({
    page,
  }) => {
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await enteroALaVista(page, page.getByText('Pregunta 1 de 10'));
    // B + A×4 + B×5 = 2 + 4 + 10 = 16. Era A×4 + B×6: desde el 15/10/2026 (3312) la 1 lleva una
    // B, porque con la A («Menos de 2 años») el tope por horizonte deja el 17 en Conservador.
    await responder(page, [1, 0, 0, 0, 0, 1, 1, 1, 1, 1]);
    await expect(perfilMostrado(page)).toHaveText('Conservador');
    await expect(puntuacion(page)).toContainText('16 puntos · tramo 10–16');
    await expect(avisoDeBorde(page)).toHaveCount(1); // 16 = range[1] y 16 < 40
    // 0·20 + 2 + (16−10)/(16−10)·16 = 18 %
    expect(await izquierdaFlecha(page)).toBeCloseTo(18, 1);
    expect(await segmentoDeLaFlecha(page)).toBe(0);
    await enteroALaVista(page, page.getByRole('heading', { name: 'Tu perfil es:' }));
    await enteroALaVista(page, perfilMostrado(page));

    await page.getByRole('button', { name: /Revisar mis respuestas/ }).click();
    await enteroALaVista(page, enunciado(page));
    await expect(enunciado(page)).toHaveText('¿Qué afirmación te representa mejor?');
    await expect(page.locator('[class*="optionButton"][aria-pressed="true"]')).toContainText(
      'Acepto algo de riesgo',
    ); // la B de la 10 (2 puntos) sigue marcada
    await opcion(page, 2).click(); // B → C: +1
    await botonSiguiente(page).click();
    await expect(perfilMostrado(page)).toHaveText('Moderado');
    await expect(puntuacion(page)).toContainText('17 puntos · tramo 17–22');
    await expect(avisoDeBorde(page)).toHaveCount(1); // 17 = range[0] y 17 > 10
    // 1·20 + 2 + (17−17)/(22−17)·16 = 22 %
    expect(await izquierdaFlecha(page)).toBeCloseTo(22, 1);
    expect(await segmentoDeLaFlecha(page)).toBe(1);
    // PROFILES.moderado
    await expect(rasgo(page, 0)).toHaveText('Bajo');
    await expect(rasgo(page, 1)).toHaveText('3-5 años');
    expect(await reparto(page)).toEqual([
      'Renta Variable (30 %)',
      'Renta Fija (50 %)',
      'Liquidez (15 %)',
      'Alternativos (5 %)',
    ]);
    await expect(page.getByRole('link', { name: /Simular esta Cartera/ })).toHaveAttribute(
      'href',
      '/estimador-cartera-inversion/?perfil=moderado',
    );
    await enteroALaVista(page, page.getByRole('heading', { name: 'Tu perfil es:' }));

    await page.getByRole('button', { name: /Repetir Test/ }).click();
    await enteroALaVista(page, page.getByRole('heading', { name: '¿Qué tipo de inversor eres?' }));
  });

  test('firma: una carga en «meskeia.com» registra UNA visita aunque recorra todas las fases, y un F5 a medias, una más', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    // El tracker solo envía en los hosts de producción y si `navigator.webdriver` es falso. Todo lo
    // de meskeia.com se sirve desde el servidor de pruebas; /api/analytics se contesta aquí mismo
    // y cualquier otro host se aborta: no sale ninguna petición de la máquina.
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false, configurable: true });
    });
    await page.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'meskeia.com') return route.abort();
      if (url.pathname.startsWith('/api/analytics/')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
      }
      return route.fulfill({ response: await route.fetch({ url: ORIGEN + url.pathname + url.search }) });
    });
    // Cabo C0247 (14/10/2026, tarde) — `page.route` no ve los WebSocket. Bajo `next dev` el de HMR
    // salía a wss://meskeia.com, el de producción, y sin él la página no se hidrataba:
    // `esperarPaginaAsentada` agotaba sus 15 s (es el C0171 de tests/apps/README.md, resuelto igual
    // en simulador-potencial-accion). Se reenvía al servidor local; bajo `next start` no hay HMR y
    // esto no hace nada (allí el caso ya pasaba). `allowedDevOrigins` ya admite meskeia.com.
    const abiertos: WebSocket[] = [];
    page.on('close', () => abiertos.forEach((s) => s.close()));
    await page.routeWebSocket(/\/_next\/(webpack-)?hmr/, (ws) => {
      const u = new URL(ws.url());
      const arriba = new WebSocket(`${ORIGEN.replace(/^http/, 'ws')}${u.pathname}${u.search}`);
      arriba.binaryType = 'arraybuffer';
      abiertos.push(arriba);
      const cola: (string | Buffer)[] = [];
      arriba.onopen = () => {
        for (const m of cola) arriba.send(m);
        cola.length = 0;
      };
      ws.onMessage((m) => {
        if (arriba.readyState === WebSocket.OPEN) arriba.send(m);
        else cola.push(m);
      });
      arriba.onmessage = (e: MessageEvent) =>
        ws.send(typeof e.data === 'string' ? e.data : Buffer.from(e.data as ArrayBuffer));
      ws.onClose(() => arriba.close());
    });
    const altas: string[] = [];
    page.on('request', (r) => {
      if (r.method() === 'POST' && new URL(r.url()).pathname === '/api/analytics/track/') {
        altas.push((JSON.parse(r.postData() ?? '{}') as { aplicacion?: string }).aplicacion ?? '');
      }
    });
    const visitas = () => altas.filter((a) => a === 'test-perfil-inversor').length;

    await page.goto('https://meskeia.com/test-perfil-inversor/');
    await esperarPaginaAsentada(page);
    await expect.poll(visitas, { message: 'el testigo existe: la carga sí se registra' }).toBeGreaterThan(0);
    const porCarga = visitas(); // 1 en producción (en `next dev` el modo estricto la duplica)

    await page.evaluate(() => sessionStorage.removeItem('meskeia:test-perfil-inversor:v1'));
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responder(page, [2, 1, 2, 0, 3, 1, 2, 2, 1, 2]); // 26 → Equilibrado
    await expect(perfilMostrado(page)).toHaveText('Equilibrado');
    await page.getByRole('button', { name: /Revisar mis respuestas/ }).click();
    await botonSiguiente(page).click();
    await page.getByRole('button', { name: /Repetir Test/ }).click();
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responder(page, [1, 1]);
    await expect(page.getByText('Pregunta 3 de 10')).toBeVisible();
    await esperarPaginaAsentada(page);
    expect(visitas(), 'visitas nuevas al recorrer las fases sin recargar').toBe(porCarga);

    await page.reload(); // F5 con el test a medias: se recupera y cuenta como UNA carga más
    await esperarPaginaAsentada(page);
    await expect(page.getByText(/Hemos recuperado el test/)).toBeVisible();
    await expect.poll(visitas).toBe(2 * porCarga);
  });

  // ---------- Hallazgos nuevos de contenido ----------
  test('REPARADO 3286 — la portada y la description no prometen «recomendaciones personalizadas» que el resultado niega', async ({
    page,
  }) => {
    // REPARADO el 14/10/2026: prometen uno de cinco perfiles y ejemplos ilustrativos. Antes: la description decía «Recomendaciones personalizadas de inversión.» y la portada, «Al final
    // recibirás tu perfil personalizado con recomendaciones de inversión adaptadas a ti» y
    // «✓ Recomendaciones personalizadas». Lo que da la app son cinco listas fijas, una por tramo, y
    // el propio resultado las presenta como «ejemplos ilustrativos, no una recomendación de
    // inversión ni de producto»; el disclaimer, «no constituye asesoramiento financiero». La
    // reparación del 104 retituló el bloque del resultado y dejó la promesa en la portada.
    await cargarSinSesion(page);
    const promesa = /recomendaciones (de inversión )?(personalizadas|adaptadas a ti)/i;
    const descripcion = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    const portada = sinEspacios(await page.locator('[class*="startScreen"]').innerText());
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responder(page, [2, 1, 2, 0, 3, 1, 2, 2, 1, 2]); // 26 → Equilibrado
    await expect(page.locator('[class*="recomendacionesNota"]')).toContainText(
      'no una recomendación de inversión',
    );
    expect({ descripcion: promesa.test(descripcion), portada: promesa.test(portada) }).toEqual({
      descripcion: false,
      portada: false,
    });
  });

  test('REPARADO 3287 — la guía no enseña al lector una nota interna («§1.quinquies»)', async ({
    page,
  }) => {
    // REPARADO el 14/10/2026: la razón pasó a un comentario del JSX. Antes, «Errores comunes»,
    // 2.ª viñeta, en texto visible: «…así que aquí no se da ninguna
    // (§1.quinquies: una cifra popular sin fuente es una cifra inventada).» El § remite a una
    // sección del CLAUDE.md del proyecto; la reparación del 1218 lo dejó en el JSX, no en un comentario.
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const vineta = page
      .locator('[class*="warningBox"] li')
      .filter({ hasText: 'Cambiar a conservador en cada caída' });
    await expect(vineta).toBeVisible();
    expect(await vineta.innerText()).not.toContain('§');
  });
});

// ---------- CASO 3 (rechazo) y la pregunta nueva bajo la barra, móvil 360×740 ----------
test.describe('re-inspección 14/10/2026 · móvil 360×740', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: UA_MOVIL_1410,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('caso a rechazar tocando: sin contestar no se avanza, con 9 de 10 no hay resultado, y dos sesiones imposibles se tiran', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const CLAVE = 'meskeia:test-perfil-inversor:v1';
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    await expect(page.getByText('Pregunta 1 de 10')).toBeVisible();
    // Sin respuesta, «Siguiente» está deshabilitado y tocarlo no avanza ni marca nada.
    await expect(botonSiguiente(page)).toBeDisabled();
    await botonSiguiente(page).tap({ force: true }).catch(() => {});
    await expect(page.getByText('Pregunta 1 de 10')).toBeVisible();
    await expect(page.locator('[class*="optionButton"][aria-pressed="true"]')).toHaveCount(0);

    // Nueve B (18 puntos) y la décima en blanco: «Ver Resultado» deshabilitado y sin resultado.
    await tocarRespuestas(page, [1, 1, 1, 1, 1, 1, 1, 1, 1]);
    await expect(page.getByText('Pregunta 10 de 10')).toBeVisible();
    await expect(botonSiguiente(page)).toHaveText('Ver Resultado');
    await expect(botonSiguiente(page)).toBeDisabled();
    await botonSiguiente(page).tap({ force: true }).catch(() => {});
    await expect(perfilMostrado(page)).toHaveCount(0);
    await expect(enunciado(page)).toHaveText('¿Qué afirmación te representa mejor?');

    // Sesiones imposibles: `leerSesion` las tira y RETIRA la clave (1213). Esperado en las dos:
    // portada con «Comenzar Test», sin aviso de test recuperado ni «Algo salió mal».
    const imposibles: Record<string, string> = {
      'índice de pregunta negativo': JSON.stringify({ currentQuestion: -1, answers: { 1: 2 } }),
      '0 puntos, que no es opción de la pregunta 1 (1-4)': JSON.stringify({ currentQuestion: 3, answers: { 1: 0 } }),
    };
    for (const [caso, valor] of Object.entries(imposibles)) {
      await page.goto(RUTA);
      // 14/10/2026 (tarde) — esta carga RECUPERA el test a medias de arriba (nueve B), y el efecto
      // que lo guarda corre tras hidratar: sembrar antes de que se asiente dejaba que la app
      // reescribiera la sesión válida encima de la imposible, y la carga siguiente caía en la
      // pregunta 10 («con 9 de 10 respuestas») en vez de en la portada. Era el test, no la app.
      await esperarPaginaAsentada(page);
      await page.evaluate(([k, v]) => sessionStorage.setItem(k, v), [CLAVE, valor]);
      await page.goto(RUTA);
      await esperarPaginaAsentada(page);
      await expect(page.getByRole('button', { name: /Comenzar Test/ }), caso).toBeVisible();
      await expect(enunciado(page), caso).toHaveCount(0);
      await expect(page.getByText(/Hemos recuperado el test/), caso).toHaveCount(0);
      await expect(page.getByText('Algo salió mal'), caso).toHaveCount(0);
      expect(await page.evaluate((k) => sessionStorage.getItem(k), CLAVE), caso).toBeNull();
    }
  });

  test('REPARADO 3285 — tras «Siguiente», el enunciado de la pregunta nueva se ve entero bajo la barra del logo', async ({
    page,
  }) => {
    // Como lo hace un dedo: en cada pregunta se toca la B, se desplaza la página hasta ver
    // «Siguiente» entero (a 20 px del borde; a 360×740 queda por debajo del pliegue desde la
    // pregunta 1) y se toca en su centro. La app no recolocaba la vista al cambiar de pregunta
    // —solo daba el foco a la tarjeta (1215), y la tarjeta, más alta que la pantalla, no se
    // movía—, así que la pregunta nueva aparecía con la vista abajo. REPARADO: si el progreso o el
    // enunciado no se ven enteros, la vista va al principio del cuestionario, como en los cambios
    // de FASE (2177).
    // Obtenido antes (14/10/2026): px del enunciado visibles bajo la barra (62 px) en las preguntas 2-10:
    // 67/90 · 0/90 · 25/90 · 2/60 · 25/90 · 25/60 · 55/90 · 14/90 · 0/60, y «Pregunta N de 10»
    // fuera de la pantalla en las nueve. A 375×667, 0 px en las nueve.
    test.setTimeout(60_000);
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    const tapadas: string[] = [];
    for (let n = 2; n <= 10; n++) {
      await opcion(page, 1).tap();
      const siguiente = botonSiguiente(page);
      await siguiente.evaluate((el) => {
        const abajo = el.getBoundingClientRect().bottom;
        if (abajo > window.innerHeight - 20) window.scrollBy(0, abajo - (window.innerHeight - 20));
      });
      const caja = await siguiente.boundingBox();
      expect(caja).not.toBeNull();
      await page.touchscreen.tap(caja!.x + caja!.width / 2, caja!.y + caja!.height / 2);
      await expect(page.getByText(`Pregunta ${n} de 10`)).toHaveCount(1);
      await page.waitForTimeout(150);
      const barra = await bordeBarraLogo(page);
      const e = await enunciado(page).boundingBox();
      // «Pregunta N de 10» también tiene que verse (antes, fuera de la pantalla en las nueve)
      const p = await page.getByText(`Pregunta ${n} de 10`).boundingBox();
      if (!p || p.y < barra - 0.5) tapadas.push(`pregunta ${n}: «Pregunta ${n} de 10» en ${Math.round(p?.y ?? NaN)} px`);
      if (!e || e.y < barra - 0.5 || e.y + e.height > 740) {
        tapadas.push(
          `pregunta ${n}: enunciado en ${Math.round(e?.y ?? NaN)}–${Math.round((e?.y ?? NaN) + (e?.height ?? 0))} px con la barra hasta ${Math.round(barra)}`,
        );
      }
    }
    expect(tapadas).toEqual([]);
  });
});

// ============================================================
// RE-INSPECCIÓN 14/10/2026 (tarde) — tras 53b0bb48 (3285, 3286 y 3287) y cd462414
//
// LAS REPARACIONES DE HOY.
//   3285 SE SOSTIENE: tocando B y «Siguiente» al pie (20 px del borde) en las nueve transiciones,
//   el progreso queda en 66–89 px y el enunciado entero bajo la barra (62 px) a 360×740, 375×667,
//   390×844, 412×915 y 740×360 (horizontal); «← Anterior» al pie, igual; y en 1280×800 la vista no
//   se mueve (no hacía falta). Vecino nuevo, en el caso 2: el salto de «Completar las que faltan».
//   3286 SE SOSTIENE en su caso (description y portada); su hermano en el featureList del JSON-LD
//   («Recomendaciones orientativas según el perfil obtenido») se abrió aparte (3300) y se REPARÓ el
//   15/10/2026.
//   3287 SE SOSTIENE: ni «§» ni notas internas en el texto visible ni en los JSON-LD.
//
// EFECTO DE 53b0bb48 SOBRE EL 3233 (entonces abierto; REPARADO el 15/10/2026 con e903863e). Al
// recolocar la vista, lo que queda bajo el dedo tras tocar «Siguiente» al pie es una opción de la
// pregunta nueva: a 360×740, con dos toques a 90 ms, el segundo marcó C o D (3 o 4 puntos) en 9 de 9
// transiciones (antes, en 2: la 1→2 y la 7→8). Su test.fail del 12/10 seguía fallando entonces, por
// la opción marcada y no por «← Anterior»; hoy pasa como regresión.
//
// CABO C0247. El caso «firma» del bloque de escritorio de la mañana pasa aquí (next start, 3052).
// Bajo `next dev` fallaba porque `page.route` no ve el WebSocket de HMR (ver el comentario dentro).
//
// LOS CASOS, resueltos a mano antes de abrir el navegador (A=1 · B=2 · C=3 · D=4; flecha =
// i·20 + 2 + (p − mín)/(máx − mín)·16 con el tramo del perfil):
//   normal  → SOLO TECLADO (1280×800): D,A,C,A; en la 5, sin contestar, «← Anterior» y la 4 de A a C;
//             luego B,A,C,B,B,C = 4+1+3+3+2+1+3+2+2+3 = 24 → Equilibrado (23–28), sin aviso de borde,
//             flecha 40 + 2 + 1/5·16 = 45,2 %. Sin la corrección serían 22 → Moderado con aviso.
//   límite  → sesión recuperada {pregunta 10; 1, 2 y 4-9 = D} (sin la 3 ni la 10) a 375×667, tocando:
//             A en la 10 → «Completar las que faltan →» → la 3, B → 4·8 + 2 + 1 = 35, suelo de
//             Agresivo (35–40) con aviso de borde, flecha 80 + 2 + 0 = 82 %. Con A en la 3: 34, Dinámico.
//   rechazo → dos activaciones seguidas de «Comenzar Test» (dos clics a 250 ms en 1280×800; dos
//             toques a 90 ms en 360×740): esperado «Pregunta 1 de 10» sin opción marcada y
//             «Siguiente» deshabilitado. HALLAZGO: el segundo cae sobre una opción de la pregunta 1.
// ============================================================

// ---------- CASO 1 (normal) y CASO 3 (rechazo) en escritorio, y el contenido ----------
test.describe('re-inspección 14/10/2026 (tarde) · escritorio', () => {
  test.use({
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  });
  const puntuacion = (page: Page) => page.locator('p[class*="resultScore"]');
  const avisoDeBorde = (page: Page) => page.locator('[class*="resultScoreBorde"]');
  const marcadas = (page: Page) => page.locator('[class*="optionButton"][aria-pressed="true"]');

  test('caso normal, solo con teclado: D,A,C,A, «← Anterior» desde la 5 para pasar la 4 de A a C, y B,A,C,B,B,C suma 24 → Equilibrado', async ({
    page,
  }) => {
    await cargarSinSesion(page);
    // El punto de partida es el botón; desde ahí, nada más que teclas.
    await page.getByRole('button', { name: /Comenzar Test/ }).focus();
    await page.keyboard.press('Enter');
    // 2177: el foco va al enunciado de la pregunta 1
    await expect(enunciado(page)).toBeFocused();

    /**
     * Desde el enunciado o la tarjeta (los dos con tabIndex −1, fuera del orden de tabulación),
     * Tab ×(i+1) llega a la opción i; Espacio la marca; Tab hasta «Siguiente» —pasando por las
     * opciones que quedan y por «← Anterior», que en la 1 está deshabilitado— y Enter.
     */
    const contestar = async (n: number, i: number): Promise<void> => {
      await expect(page.getByText(`Pregunta ${n} de 10`)).toBeVisible();
      for (let k = 0; k <= i; k++) await page.keyboard.press('Tab');
      await expect(opcion(page, i)).toBeFocused();
      await page.keyboard.press('Space');
      await expect(opcion(page, i)).toHaveAttribute('aria-pressed', 'true');
      const pasos = 3 - i + (n > 1 ? 1 : 0) + 1;
      for (let k = 0; k < pasos; k++) await page.keyboard.press('Tab');
      await expect(botonSiguiente(page)).toBeFocused();
      await page.keyboard.press('Enter');
    };

    await contestar(1, 3); // D = 4
    await contestar(2, 0); // A = 1
    await contestar(3, 2); // C = 3
    await contestar(4, 0); // A = 1
    // En la 5, sin contestar: «Siguiente» deshabilitado, así que Tab ×5 (A-D y «← Anterior»)
    await expect(page.getByText('Pregunta 5 de 10')).toBeVisible();
    await expect(botonSiguiente(page)).toBeDisabled();
    for (let k = 0; k < 5; k++) await page.keyboard.press('Tab');
    await expect(botonAnterior(page)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 4 de 10')).toBeVisible();
    await expect(opcion(page, 0)).toHaveAttribute('aria-pressed', 'true'); // la A de la 4 sigue
    await contestar(4, 2); // A → C: +2
    await expect(page.getByText('Pregunta 5 de 10')).toBeVisible();
    await expect(marcadas(page)).toHaveCount(0); // la 5 sigue sin contestar
    const resto: Array<[number, number]> = [
      [5, 1], // B = 2
      [6, 0], // A = 1
      [7, 2], // C = 3
      [8, 1], // B = 2
      [9, 1], // B = 2
      [10, 2], // C = 3
    ];
    for (const [n, i] of resto) await contestar(n, i);

    // 4 + 1 + 3 + 3 + 2 + 1 + 3 + 2 + 2 + 3 = 24 → tramo 23–28
    await expect(perfilMostrado(page)).toHaveText('Equilibrado');
    await expect(puntuacion(page)).toContainText('24 puntos · tramo 23–28');
    await expect(avisoDeBorde(page)).toHaveCount(0); // ni 23 ni 28
    // 2·20 + 2 + (24−23)/(28−23)·16 = 45,2 %; con la 4 sin corregir (22) estaría en el segmento 1
    expect(await izquierdaFlecha(page)).toBeCloseTo(45.2, 1);
    expect(await segmentoDeLaFlecha(page)).toBe(2);
    // PROFILES.equilibrado
    await expect(rasgo(page, 0)).toHaveText('Medio');
    await expect(rasgo(page, 1)).toHaveText('5-10 años');
    await expect(rasgo(page, 2)).toHaveText('12-15 %');
    await expect(rasgo(page, 3)).toHaveText('Crecimiento sostenido');
    // El % va con espacio duro (U+00A0), como manda la norma del 25/09/2026 (hallazgo 2180)
    expect(await reparto(page)).toEqual([
      'Renta Variable (50 %)',
      'Renta Fija (35 %)',
      'Liquidez (10 %)',
      'Alternativos (5 %)',
    ]);
    await expect(page.getByRole('link', { name: /Simular esta Cartera/ })).toHaveAttribute(
      'href',
      '/estimador-cartera-inversion/?perfil=equilibrado',
    );
    // El foco acaba en el encabezado del resultado, y la sesión ya no es un test a medias: desde el
    // 15/10/2026 (3313) se guarda como RESULTADO, para que «Atrás» y F5 vuelvan a él.
    await expect(page.getByRole('heading', { name: 'Tu perfil es:' })).toBeFocused();
    expect(
      JSON.parse((await page.evaluate(() => sessionStorage.getItem('meskeia:test-perfil-inversor:v1'))) ?? '{}').fase,
    ).toBe('result');
  });

  test('REPARADO 3299 — dos clics seguidos en «Comenzar Test» no contestan la pregunta 1', async ({ page }) => {
    // Esperado: «Pregunta 1 de 10» sin opción marcada y «Siguiente» deshabilitado.
    // Obtenido (14/10/2026, tarde): «B · 2 a 5 años - Plazo medio» marcada (aria-pressed) y
    // «Siguiente» habilitado, con 120 y con 250 ms entre clics. El primer clic cambia de fase y
    // lleva la vista al cuestionario (2177); bajo el puntero queda la opción B, y el segundo clic
    // la elige. Mismo mecanismo que el 3233 con «Siguiente».
    // REPARADO (15/10/2026): la segunda activación con puntero en el mismo punto, sobre otro
    // control y dentro de 450 ms, se absorbe. Una opción elegida después, a propósito, sí cuenta.
    await cargarSinSesion(page);
    const comenzar = page.getByRole('button', { name: /Comenzar Test/ });
    await comenzar.scrollIntoViewIfNeeded();
    const caja = await comenzar.boundingBox();
    expect(caja).not.toBeNull();
    const x = caja!.x + caja!.width / 2;
    const y = caja!.y + caja!.height / 2;
    for (const pausa of [250, 120]) {
      if (pausa === 120) {
        // Segunda vuelta desde la portada, con la sesión limpia
        await cargarSinSesion(page);
        await comenzar.scrollIntoViewIfNeeded();
      }
      await page.mouse.click(x, y);
      await page.waitForTimeout(pausa);
      await page.mouse.click(x, y);
      await expect(page.getByText('Pregunta 1 de 10')).toBeVisible();
      await page.waitForTimeout(200);
      await expect(marcadas(page), `con ${pausa} ms entre clics`).toHaveCount(0);
      await expect(botonSiguiente(page)).toBeDisabled();
    }
    // Pasada la ventana, un clic deliberado en el mismo punto sí elige lo que hay debajo
    await page.waitForTimeout(500);
    await page.mouse.click(x, y);
    await expect(marcadas(page)).toHaveCount(1);
    await expect(botonSiguiente(page)).toBeEnabled();
  });

  // ---------- Contenido ----------
  test('REPARADO 3300 — el featureList del JSON-LD no promete «recomendaciones» que el resultado niega', async ({
    page,
  }) => {
    // Hermano del 3286 en el tercer canal: la description y la portada ya no prometen
    // recomendaciones, pero el featureList que leen buscadores e IAs dice «Recomendaciones
    // orientativas según el perfil obtenido», y el resultado: «Son ejemplos ilustrativos, no una
    // recomendación de inversión ni de producto». REPARADO (15/10/2026): ocho características que
    // la app cumple, sin «En español», y la description sin «orienta tu estrategia de inversión».
    await cargarSinSesion(page);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const app = bloques
      .map((b) => JSON.parse(b) as { '@type'?: string; featureList?: string[]; description?: string })
      .find((b) => b['@type'] === 'WebApplication');
    expect(app, 'la página no sirve un WebApplication').toBeTruthy();
    const caracteristicas = app!.featureList ?? [];
    expect(caracteristicas.length).toBeGreaterThanOrEqual(4); // §1.ter
    expect(caracteristicas).not.toContain('En español');
    expect(app!.description ?? '').not.toMatch(/orienta tu estrategia/);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responder(page, [2, 1, 2, 0, 3, 1, 2, 2, 1, 2]); // 3+2+3+1+4+2+3+3+2+3 = 26 → Equilibrado
    await expect(page.locator('[class*="recomendacionesNota"]')).toContainText(
      'no una recomendación de inversión',
    );
    expect(caracteristicas.filter((c) => /recomendaci/i.test(c))).toEqual([]);
  });

  test('REPARADO 3301 — la guía no pega palabras entre sí al cerrar o abrir una negrita', async ({ page }) => {
    // En el JSX, un salto de línea pegado a una etiqueta se come el espacio: «</strong>⏎(3–6 meses»
    // se pinta «emergencia(3–6 meses». Obtenido (14/10/2026, tarde), en el texto visible de la guía
    // (reparado el 15/10/2026 con {' '} en los seis sitios):
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    await expect(page.locator('[class*="stepGuideSection"]')).toBeVisible();
    const texto = await page.locator('body').innerText();
    const pegadas = [
      'emergencia(3–6', // «¿Puedo tener dos perfiles…?»: «…fondo de emergencia(3–6 meses…»
      'jubilación(que', // la misma: «…dinámico para la jubilación(que queda a 30+ años)»
      'adquisitivoen', // «¿Cómo afecta la inflación…?»: «…perder poder adquisitivoen términos reales»
      'reclamaciones.El', // «¿Qué pasa si el banco…?»: «…reducir reclamaciones.El perfil del banco…»
      'pánicodurante', // «¿Existe un perfil perfecto…?»: «…sin vender en pánicodurante una crisis»
      'más?Tu', // paso 4: «¿Vendes, mantienes o compras más?Tu respuesta honesta…»
    ];
    expect(pegadas.filter((p) => texto.includes(p))).toEqual([]);
  });

  test('REPARADO 3302 — «Familia con hipoteca» no da 20–25 años como el horizonte de Equilibrado (5–10) y Dinámico (10–15)', async ({
    page,
  }) => {
    // «…el dinero de la jubilación no se toca en 20–25 años, y ese horizonte es el de los perfiles
    // Equilibrado (5–10 años) y Dinámico (10–15).» 20–25 no cae en ninguno de los dos tramos que la
    // misma frase cita; el resultado de la app da «Horizonte ideal > 15 años» al Agresivo.
    // REPARADO (15/10/2026): la tarjeta atribuye ese horizonte al Agresivo y baja el perfil por las
    // obligaciones fijas, que es la razón que sí sostiene la conclusión; la FAQ «¿Puedo tener dos
    // perfiles…?» da «dinámico o agresivo» a una jubilación a 30+ años, como su propio consejo.
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const tarjeta = page.locator('[class*="escenarioCard"]').filter({ hasText: 'Familia con hipoteca' });
    await expect(tarjeta).toHaveCount(1);
    const texto = sinEspacios(await tarjeta.innerText());
    expect(texto).toContain('20–25 años');
    expect(texto).toMatch(/Agresivo \(más de 15 años\)/);
    expect(texto).toMatch(/obligaciones financieras fijas/);
    const faqDosPerfiles = page.locator('[class*="faqSectionItem"]').filter({ hasText: '¿Puedo tener dos perfiles' });
    await expect(faqDosPerfiles).toContainText('dinámico o agresivo para la jubilación (que queda a 30+ años)');
    const letra = '[A-Za-zÁÉÍÓÚáéíóú]+';
    const m = texto.match(
      new RegExp(`(\\d+)–(\\d+) años, y ese horizonte es el de los perfiles (${letra}) \\((\\d+)–(\\d+) años\\) y (${letra}) \\((\\d+)–(\\d+)\\)`),
    );
    const contradicciones: string[] = [];
    if (m) {
      const [desde, hasta] = [Number(m[1]), Number(m[2])];
      for (const [nombre, a, b] of [
        [m[3], Number(m[4]), Number(m[5])],
        [m[6], Number(m[7]), Number(m[8])],
      ] as const) {
        if (desde > b || hasta < a) contradicciones.push(`${desde}–${hasta} años no es el horizonte de ${nombre} (${a}–${b})`);
      }
    }
    expect(contradicciones).toEqual([]);
  });

  test('REPARADO 3287 (vecinos) — ninguna nota interna en el texto visible ni en los JSON-LD, en portada, guía y resultado', async ({
    page,
  }) => {
    const interna = /§|CLAUDE\.md|hallazgo \d|cabo C\d|Inspector/;
    await cargarSinSesion(page);
    const estructurados = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    expect(estructurados).not.toMatch(interna);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    await expect(page.locator('[class*="stepGuideSection"]')).toBeVisible();
    expect(await page.locator('body').innerText()).not.toMatch(interna);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responder(page, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]); // 20 → Moderado
    await expect(perfilMostrado(page)).toHaveText('Moderado');
    expect(await page.locator('[class*="resultScreen"]').innerText()).not.toMatch(interna);
  });
});

// ---------- CASO 2 (límite) y los vecinos del 3285, móvil 375×667 ----------
test.describe('re-inspección 14/10/2026 (tarde) · móvil 375×667', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    userAgent: UA_MOVIL_1410,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const marcadas = (page: Page) => page.locator('[class*="optionButton"][aria-pressed="true"]');

  /** Como un dedo: desplaza hasta ver el botón entero a 20 px del borde y lo toca en su centro. */
  async function tocarAlPie(page: Page, boton: Locator): Promise<void> {
    await boton.evaluate((el) => {
      const abajo = el.getBoundingClientRect().bottom;
      if (abajo > window.innerHeight - 20) window.scrollBy(0, abajo - (window.innerHeight - 20));
    });
    const caja = await boton.boundingBox();
    expect(caja).not.toBeNull();
    await page.touchscreen.tap(caja!.x + caja!.width / 2, caja!.y + caja!.height / 2);
  }

  test('caso límite tocando: sesión recuperada sin la 3 ni la 10 (ocho D), A en la 10, «Completar las que faltan», B en la 3 → 35, suelo de Agresivo', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const CLAVE = 'meskeia:test-perfil-inversor:v1';
    await cargarSinSesion(page);
    await page.evaluate(
      ([k, v]) => sessionStorage.setItem(k, v),
      [CLAVE, JSON.stringify({ currentQuestion: 9, answers: { 1: 4, 2: 4, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4 } })],
    );
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    await expect(page.getByText(/Hemos recuperado el test/)).toContainText('con 8 de 10 respuestas');
    await expect(page.getByText('Pregunta 10 de 10')).toBeVisible();
    await expect(marcadas(page)).toHaveCount(0);
    await expect(botonSiguiente(page)).toHaveText('Ver Resultado');
    await expect(botonSiguiente(page)).toBeDisabled();

    await opcion(page, 0).tap(); // A = 1 en la 10; faltan la 3
    await expect(botonSiguiente(page)).toHaveText('Completar las que faltan →');
    await tocarAlPie(page, botonSiguiente(page));
    // Sin resultado: a la primera sin contestar, la 3, con la vista arriba (3285 en el salto)
    await expect(page.getByText('Pregunta 3 de 10')).toBeVisible();
    await expect(perfilMostrado(page)).toHaveCount(0);
    await expect(marcadas(page)).toHaveCount(0);
    await expect(botonSiguiente(page)).toBeDisabled();
    await enteroALaVista(page, page.getByText('Pregunta 3 de 10'));
    await enteroALaVista(page, enunciado(page));

    await opcion(page, 1).tap(); // B = 2 en la 3
    for (let n = 4; n <= 10; n++) {
      await tocarAlPie(page, botonSiguiente(page));
      await expect(page.getByText(`Pregunta ${n} de 10`)).toBeVisible();
      await expect(marcadas(page)).toHaveCount(1); // D de la sesión en la 4-9; la A recién puesta en la 10
      // 3285 a 375×667 (antes, 0 px visibles en las nueve): progreso y enunciado enteros
      await enteroALaVista(page, page.getByText(`Pregunta ${n} de 10`));
      await enteroALaVista(page, enunciado(page));
    }
    await expect(botonSiguiente(page)).toHaveText('Ver Resultado');
    await tocarAlPie(page, botonSiguiente(page));

    // 4·8 + 2 + 1 = 35 → tramo 35–40, y 35 es su suelo (35 > 10): aviso de borde
    await expect(perfilMostrado(page)).toHaveText('Agresivo');
    await expect(page.locator('p[class*="resultScore"]')).toContainText('35 puntos · tramo 35–40');
    await expect(page.locator('[class*="resultScoreBorde"]')).toHaveCount(1);
    // 4·20 + 2 + (35−35)/(40−35)·16 = 82 %
    expect(await izquierdaFlecha(page)).toBeCloseTo(82, 1);
    expect(await segmentoDeLaFlecha(page)).toBe(4);
    // PROFILES.agresivo
    await expect(rasgo(page, 0)).toHaveText('Muy alto');
    await expect(rasgo(page, 1)).toHaveText('> 15 años');
    await expect(rasgo(page, 2)).toHaveText('20-25 %');
    await expect(rasgo(page, 3)).toHaveText('Máxima rentabilidad');
    expect(await reparto(page)).toEqual([
      'Renta Variable (90 %)',
      'Renta Fija (5 %)',
      'Liquidez (0 %)',
      'Alternativos (5 %)',
    ]);
    await expect(page.getByRole('link', { name: /Simular esta Cartera/ })).toHaveAttribute(
      'href',
      '/estimador-cartera-inversion/?perfil=agresivo',
    );
    // Guardado como resultado, no como test a medias (3313, 15/10/2026).
    expect(JSON.parse((await page.evaluate((k) => sessionStorage.getItem(k), CLAVE)) ?? '{}').fase).toBe('result');

    // Vecino del 3285: «← Anterior» al pie también deja la pregunta nueva a la vista
    await page.getByRole('button', { name: /Revisar mis respuestas/ }).tap();
    await expect(page.getByText('Pregunta 10 de 10')).toBeVisible();
    await tocarAlPie(page, botonAnterior(page));
    await expect(page.getByText('Pregunta 9 de 10')).toBeVisible();
    await enteroALaVista(page, page.getByText('Pregunta 9 de 10'));
    await enteroALaVista(page, enunciado(page));
  });
});

// ---------- CASO 3 (rechazo) tocando, móvil 360×740 ----------
test.describe('re-inspección 14/10/2026 (tarde) · móvil 360×740', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: UA_MOVIL_1410,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('REPARADO 3299 — un doble toque en «Comenzar Test» no contesta la pregunta 1', async ({ page }) => {
    // Esperado: «Pregunta 1 de 10» sin opción marcada y «Siguiente» deshabilitado.
    // Obtenido (14/10/2026, tarde): con 90 ms entre toques, «A · Menos de 2 años» marcada a 360×740
    // (y «B · 2 a 5 años» a 390×844, con 150 ms). REPARADO el 15/10/2026: el segundo toque se absorbe.
    await cargarSinSesion(page);
    const comenzar = page.getByRole('button', { name: /Comenzar Test/ });
    await comenzar.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const caja = await comenzar.boundingBox();
    expect(caja).not.toBeNull();
    const x = caja!.x + caja!.width / 2;
    const y = caja!.y + caja!.height / 2;
    await page.touchscreen.tap(x, y);
    await page.waitForTimeout(90);
    await page.touchscreen.tap(x, y);
    await expect(page.getByText('Pregunta 1 de 10')).toBeVisible();
    await page.waitForTimeout(200);
    await expect(page.locator('[class*="optionButton"][aria-pressed="true"]')).toHaveCount(0);
    await expect(botonSiguiente(page)).toBeDisabled();
  });
});

// ============================================================
// RE-INSPECCIÓN 15/10/2026 — tras 53b0bb48 y e903863e, con FIRMA DE ROTURA (nivel)
//
// LAS REPARACIONES. Se sostienen las siete (3285, 3286, 3287, 3299, 3300, 3301, 3302) y el 3233:
//   3299 → dos clics en «Comenzar Test» a 250, 120 y 60 ms (1280×800 y 1366×768) y dos toques a 90,
//          150 y 300 ms (360×740) y a 90 y 150 ms (390×844): «Pregunta 1 de 10» sin opción marcada,
//          aunque bajo el puntero quede la A o la B.
//   3233 → doble toque a 90 ms en «Siguiente» al pie, en las NUEVE transiciones, a 360×740, 375×667 y
//          390×844: avanza una pregunta y no marca nada (bajo el dedo, C/D, «← Anterior» o nada).
//   La guarda no se come lo legítimo: teclado (Enter y, sin pausa, Tab Tab Espacio) y un clic en
//   OTRA opción a los 200 ms cuentan. Tras «Ver Resultado», «Revisar» y «Repetir» lo que queda bajo
//   el puntero es texto, una opción o «Comenzar Test» (las dos últimas, con guarda) en 1280×800,
//   1366×768, 1440×900, 1920×1080, 360×740, 390×844 y 412×915: ningún enlace del resultado.
//   EL VECINO QUE NO CUBRE: «Empezar de cero», el único botón de la app sin la guarda y el único que
//   BORRA. Y su aviso de test recuperado no se retira nunca (hallazgos 3310 y 3311, abajo; REPARADOS
//   el 15/10/2026 en e89a1b9a y 57343d4e).
//
// LA FIRMA (76,2 % cortas y 33,3 % recargas en los 30 días hasta el 14/10, casi todo antes de las dos
// reparaciones; partida el 12/10: 0 recargas desde el 27/09). El testigo de red («firma», bloque de
// escritorio del 14/10) sigue en 1 alta por carga. Lo que sí PIERDE trabajo a quien usa la app: el
// resultado no sobrevive a «Atrás» desde «Simular esta Cartera» ni a un F5 (hallazgo 3313, REPARADO el
// 15/10/2026 en 8ec810fe: el estado vuelve; lo que se VE al volver, en la re-inspección del 16/10).
//
// LOS CASOS, resueltos a mano antes de abrir el navegador (A=1 · B=2 · C=3 · D=4; flecha =
// i·20 + 2 + (p − mín)/(máx − mín)·16 con el tramo del perfil):
//   normal  → B,D,C,B,C,C,D,B,C,D = 2+4+3+2+3+3+4+2+3+4 = 30 → Dinámico (29–34), sin aviso de borde,
//             flecha 60 + 2 + 1/5·16 = 65,2 %, 70/20/5/5 (escritorio 1280×800)
//   límite  → D×8 + A + A = 32 + 2 = 34, tope de Dinámico (flecha 78 %); «Revisar», la 10 de A a B = 35,
//             suelo de Agresivo (flecha 82 %); aviso de borde en los dos (móvil 390×844, tocando)
//   rechazo → dobles toques en «Revisar mis respuestas» y «Repetir Test» que NO deben tocar nada de lo
//             que aparece debajo: todo B = 20 (Moderado, 17 + … → flecha 20 + 2 + 3/5·16 = 31,6 %), la
//             10 sigue en B tras «Revisar» y «Repetir» acaba en la portada (móvil 360×740)
//   horizonte → la 1 en A («Menos de 2 años») y las demás en D = 1 + 36 = 37 → Agresivo, «Horizonte
//             ideal > 15 años»: lo que la propia guía (paso 3) manda a Conservador. Era el HALLAZGO
//             3312, REPARADO el 15/10/2026 (192273c2): hoy, Conservador con la línea que explica el tope.
// ============================================================

const CLAVE_SESION_1510 = 'meskeia:test-perfil-inversor:v1';

/** Siembra una sesión a medias DESPUÉS de que la app se asiente (si no, la reescribe al hidratar). */
async function sembrarSesion1510(page: Page, sesion: { currentQuestion: number; answers: Record<number, number> }): Promise<void> {
  await cargarSinSesion(page);
  await page.evaluate(([k, v]) => sessionStorage.setItem(k, v), [CLAVE_SESION_1510, JSON.stringify(sesion)]);
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

/** Dónde quedará el centro de «Empezar de cero» cuando la vista vuelva al principio del cuestionario. */
async function alturaDeEmpezarTrasRecolocar(page: Page): Promise<number> {
  return page.evaluate(() => {
    const destino = document.querySelector('[class*="destinoDeFase"]')!.getBoundingClientRect();
    const margen = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const boton = Array.from(document.querySelectorAll('button')).find((b) => /Empezar de cero/.test(b.textContent ?? ''))!;
    const r = boton.getBoundingClientRect();
    return r.top + r.height / 2 - destino.top + margen;
  });
}

/** Desplaza la página hasta dejar el centro del control a la altura `y` y devuelve ese punto. */
async function centroA(page: Page, loc: Locator, y: number): Promise<{ x: number; y: number }> {
  await loc.evaluate((el, alto) => {
    const r = el.getBoundingClientRect();
    window.scrollBy(0, r.top + r.height / 2 - alto);
  }, y);
  await page.waitForTimeout(300);
  const caja = await loc.boundingBox();
  expect(caja).not.toBeNull();
  return { x: caja!.x + caja!.width / 2, y: caja!.y + caja!.height / 2 };
}

test.describe('re-inspección 15/10/2026 · escritorio', () => {
  test.use({
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  });
  const puntuacion = (page: Page) => page.locator('p[class*="resultScore"]');
  const avisoDeBorde = (page: Page) => page.locator('[class*="resultScoreBorde"]');
  const marcadas = (page: Page) => page.locator('[class*="optionButton"][aria-pressed="true"]');

  /** Como `responder`, pero con la pausa de quien lee: la guarda del 3299 absorbe lo de < 450 ms. */
  async function responderLeyendo(page: Page, indices: number[]): Promise<void> {
    for (const i of indices) {
      await page.waitForTimeout(500);
      await opcion(page, i).click();
      await botonSiguiente(page).click();
    }
  }

  test('caso normal: D,B,C,B,C,C,D,B,C,D suma 30 → Dinámico, sin aviso de borde, flecha 65,2 %', async ({ page }) => {
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    // La 1 y la 2 cambian de sitio (15/10/2026, 3312): con la B en la 1, «2 a 5 años», el tope
    // por horizonte daría Moderado. La suma es la misma.
    await responderLeyendo(page, [3, 1, 2, 1, 2, 2, 3, 1, 2, 3]); // 4+2+3+2+3+3+4+2+3+4 = 30
    await expect(perfilMostrado(page)).toHaveText('Dinámico');
    await expect(puntuacion(page)).toContainText('30 puntos · tramo 29–34');
    await expect(avisoDeBorde(page)).toHaveCount(0); // ni 29 ni 34
    // 3·20 + 2 + (30−29)/(34−29)·16 = 65,2 %
    expect(await izquierdaFlecha(page)).toBeCloseTo(65.2, 1);
    expect(await segmentoDeLaFlecha(page)).toBe(3);
    // PROFILES.dinamico
    await expect(rasgo(page, 0)).toHaveText('Alto');
    await expect(rasgo(page, 1)).toHaveText('10-15 años');
    await expect(rasgo(page, 2)).toHaveText('15-20 %');
    await expect(rasgo(page, 3)).toHaveText('Maximizar crecimiento');
    // PROFILES.dinamico.allocation = 70/20/5/5, con espacio duro antes del % (2180)
    expect(await reparto(page)).toEqual([
      'Renta Variable (70 %)',
      'Renta Fija (20 %)',
      'Liquidez (5 %)',
      'Alternativos (5 %)',
    ]);
    await expect(page.getByRole('link', { name: /Simular esta Cartera/ })).toHaveAttribute(
      'href',
      '/estimador-cartera-inversion/?perfil=dinamico',
    );
    await expect(page.getByRole('heading', { name: 'Tu perfil es:' })).toBeFocused();
  });

  test('REPARADO 3299 (rama nueva) — la guarda del doble clic no se come una activación legítima', async ({ page }) => {
    // La guarda absorbe una SEGUNDA activación con puntero, en el mismo punto (≤ 12 px), sobre otro
    // control, sin desplazamiento y en < 450 ms. Lo que no debe absorber:
    // 1) Teclado: Enter en «Comenzar Test» y, sin pausa, Tab Tab Espacio → la B de la pregunta 1.
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space');
    await expect(page.getByText('Pregunta 1 de 10')).toBeVisible();
    await expect(opcion(page, 1)).toHaveAttribute('aria-pressed', 'true');

    // 2) Ratón: clic en «Comenzar Test» y, a los 200 ms, clic en la C (otro punto: > 100 px más abajo).
    // La sesión a medias de arriba se retira AQUÍ, con la página asentada: si se deja a
    // `cargarSinSesion`, la carga la recupera y el efecto que la guarda la reescribe tras el clear.
    await page.evaluate(() => sessionStorage.clear());
    await cargarSinSesion(page);
    const comenzar = page.getByRole('button', { name: /Comenzar Test/ });
    await comenzar.scrollIntoViewIfNeeded();
    const c0 = await comenzar.boundingBox();
    expect(c0).not.toBeNull();
    await page.mouse.click(c0!.x + c0!.width / 2, c0!.y + c0!.height / 2);
    await page.waitForTimeout(200);
    const cC = await opcion(page, 2).boundingBox();
    expect(cC).not.toBeNull();
    expect(Math.abs(cC!.y + cC!.height / 2 - (c0!.y + c0!.height / 2))).toBeGreaterThan(12);
    await page.mouse.click(cC!.x + cC!.width / 2, cC!.y + cC!.height / 2);
    await expect(opcion(page, 2)).toHaveAttribute('aria-pressed', 'true');
    await expect(marcadas(page)).toHaveCount(1);
  });

  test('REPARADO 3312 — el resultado no da «Horizonte ideal > 15 años» a quien necesita el dinero en menos de 2 años', async ({
    page,
  }) => {
    // REPARADO el 15/10/2026 con lo que decidió el usuario: la pregunta 1 fija el perfil máximo
    // (A → Conservador, B → Moderado, C → Equilibrado, D sin tope), una línea visible lo explica
    // cuando actúa, y las descripciones describen el perfil y no a la persona.
    // La guía de la misma página, paso 3: «si necesitas el dinero en menos de 3 años → conservador
    // […] El horizonte temporal es el factor más objetivo para definir tu perfil». Pero la puntuación
    // es una suma sin topes: la 1 en A («Menos de 2 años - Necesitaré el dinero pronto», 1 punto) y las
    // demás en D (9 × 4) = 37 → Agresivo, 90 % renta variable, «Horizonte ideal > 15 años» y «Tienes
    // experiencia, horizonte muy largo…». Con la 3 en A («Ninguna - Soy completamente nuevo/a») y las
    // demás en D, también 37 y el mismo «Tienes experiencia […] Perfil para inversores experimentados».
    // Esperado: un resultado que no contradiga la respuesta (el horizonte del perfil cabe en «menos de
    // 2 años», o el resultado avisa de que lo dicho en la 1 choca con él), y una descripción que no
    // afirme una experiencia que la persona acaba de negar.
    test.setTimeout(60_000);
    const problemas: string[] = [];

    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responderLeyendo(page, [0, 3, 3, 3, 3, 3, 3, 3, 3, 3]); // 1 + 9·4 = 37
    await expect(puntuacion(page)).toContainText('37 puntos · tramo 35–40');
    const horizonte = (await rasgo(page, 1).textContent()) ?? '';
    const pantalla = await page.locator('[class*="resultScreen"]').innerText();
    if (horizonte !== '< 3 años' && !/menos de 2 años/i.test(pantalla)) {
      problemas.push(`la 1 en «Menos de 2 años» → ${await perfilMostrado(page).textContent()}, «Horizonte ideal ${horizonte}», sin aviso`);
    }
    // Lo decidido: Conservador, con la línea que explica el tope, la flecha en su segmento, el
    // enlace al estimador con su perfil y sin aviso de borde (un punto más no cambia nada).
    await expect(perfilMostrado(page)).toHaveText('Conservador');
    await expect(page.locator('[class*="resultTope"]')).toHaveText(
      'Tu horizonte de menos de 2 años limita el perfil a Conservador; el resto de tus respuestas apuntaba a Agresivo.',
    );
    expect(await segmentoDeLaFlecha(page)).toBe(0);
    await expect(avisoDeBorde(page)).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Simular esta Cartera/ })).toHaveAttribute(
      'href',
      '/estimador-cartera-inversion/?perfil=conservador',
    );
    expect(await reparto(page)).toEqual([
      'Renta Variable (15 %)',
      'Renta Fija (60 %)',
      'Liquidez (20 %)',
      'Alternativos (5 %)',
    ]);

    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responderLeyendo(page, [3, 3, 0, 3, 3, 3, 3, 3, 3, 3]); // 4 + 4 + 1 + 7·4 = 37
    await expect(puntuacion(page)).toContainText('37 puntos');
    const descripcion = (await page.locator('[class*="profileDescription"] p').first().textContent()) ?? '';
    if (/Tienes experiencia|inversores experimentados/.test(descripcion)) {
      problemas.push(`la 3 en «Ninguna» → «${descripcion}»`);
    }
    // Sin tope por experiencia (decisión del usuario): la 1 en D, así que Agresivo y sin línea de tope.
    await expect(perfilMostrado(page)).toHaveText('Agresivo');
    await expect(page.locator('[class*="resultTope"]')).toHaveCount(0);

    // A,C×9 = 1 + 27 = 28 → por puntos Equilibrado; la 1 en A lo limita a Conservador.
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responderLeyendo(page, [0, 2, 2, 2, 2, 2, 2, 2, 2, 2]);
    await expect(puntuacion(page)).toContainText('28 puntos · tramo 23–28');
    await expect(perfilMostrado(page)).toHaveText('Conservador');
    await expect(page.locator('[class*="resultTope"]')).toContainText('apuntaba a Equilibrado');

    // C,D×9 = 3 + 36 = 39 → la 1 en C («5 a 10 años») limita a Equilibrado, «Horizonte ideal 5-10 años».
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responderLeyendo(page, [2, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
    await expect(perfilMostrado(page)).toHaveText('Equilibrado');
    await expect(rasgo(page, 1)).toHaveText('5-10 años');
    await expect(page.locator('[class*="resultTope"]')).toHaveText(
      'Tu horizonte de entre 5 y 10 años limita el perfil a Equilibrado; el resto de tus respuestas apuntaba a Agresivo.',
    );
    expect(await segmentoDeLaFlecha(page)).toBe(2);
    expect(problemas).toEqual([]);
  });

  test('REPARADO 3313 — el resultado sobrevive a «Atrás» desde «Simular esta Cartera» y a un F5', async ({ page }) => {
    // Al pulsar «Ver Resultado» la app borraba la sesión (olvidarSesion), así que el resultado solo
    // vivía en el estado de React. «Simular esta Cartera» —el botón principal del resultado— navega al
    // estimador; al volver con «Atrás», la página se montaba de nuevo en la PORTADA, sin respuestas, y
    // había que repetir las diez preguntas. Igual con «Estimador de Inversiones» y con un F5.
    // REPARADO el 15/10/2026: «Ver Resultado» guarda la sesión como resultado (fase 'result') y la
    // carga lo restaura, sin aviso de test a medias. «Repetir Test» lo borra.
    test.setTimeout(60_000);
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await responderLeyendo(page, [3, 3, 2, 3, 3, 2, 3, 3, 2, 3]); // 4·7 + 3·3 = 37 → Agresivo
    await expect(perfilMostrado(page)).toHaveText('Agresivo');
    await page.getByRole('link', { name: /Simular esta Cartera/ }).click();
    await page.waitForURL(/\/estimador-cartera-inversion\/\?perfil=agresivo/);
    await esperarPaginaAsentada(page);
    await page.goBack();
    await page.waitForURL(/\/test-perfil-inversor\/$/);
    await esperarPaginaAsentada(page);
    const trasAtras = (await perfilMostrado(page).count())
      ? `resultado ${await perfilMostrado(page).textContent()}`
      : (await page.getByRole('button', { name: /Comenzar Test/ }).count())
        ? 'portada'
        : 'otra cosa';
    expect(trasAtras).toBe('resultado Agresivo');

    await expect(puntuacion(page)).toContainText('37 puntos');
    await expect(page.getByText(/Hemos recuperado el test/)).toHaveCount(0);

    await page.reload();
    await esperarPaginaAsentada(page);
    await expect(perfilMostrado(page)).toHaveText('Agresivo');
    await expect(puntuacion(page)).toContainText('37 puntos');

    // Lo mismo desde «Estimador de Inversiones».
    await page.getByRole('link', { name: /Estimador de Inversiones/ }).click();
    await page.waitForURL(/\/estimador-inversiones\//);
    await esperarPaginaAsentada(page);
    await page.goBack();
    await page.waitForURL(/\/test-perfil-inversor\/$/);
    await esperarPaginaAsentada(page);
    await expect(perfilMostrado(page)).toHaveText('Agresivo');

    // «Repetir Test» sí lo borra: tras un F5, la portada.
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Repetir Test/ }).click();
    await expect(page.getByRole('button', { name: /Comenzar Test/ })).toBeVisible();
    await page.reload();
    await esperarPaginaAsentada(page);
    await expect(page.getByRole('button', { name: /Comenzar Test/ })).toBeVisible();
    await expect(perfilMostrado(page)).toHaveCount(0);
  });
});

// ---------- CASO 2 (límite), móvil 390×844 tocando ----------
test.describe('re-inspección 15/10/2026 · móvil 390×844', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: UA_MOVIL_1410,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('caso límite tocando: D×8 + A + A = 34 es el tope de Dinámico y, revisando la 10 de A a B, 35 ya es Agresivo', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    await tocarRespuestas(page, [3, 3, 3, 3, 3, 3, 3, 3, 0, 0]); // 4·8 + 1 + 1 = 34
    await expect(perfilMostrado(page)).toHaveText('Dinámico');
    await expect(page.locator('p[class*="resultScore"]')).toContainText('34 puntos · tramo 29–34');
    await expect(page.locator('[class*="resultScoreBorde"]')).toHaveCount(1); // 34 = range[1] y 34 < 40
    // 3·20 + 2 + (34−29)/(34−29)·16 = 78 %
    expect(await izquierdaFlecha(page)).toBeCloseTo(78, 1);
    expect(await segmentoDeLaFlecha(page)).toBe(3);

    await page.getByRole('button', { name: /Revisar mis respuestas/ }).tap();
    await expect(page.getByText('Pregunta 10 de 10')).toBeVisible();
    await expect(page.locator('[class*="optionButton"][aria-pressed="true"]')).toContainText('Prefiero ganar poco');
    await page.waitForTimeout(500);
    await opcion(page, 1).tap(); // A → B: +1
    await botonSiguiente(page).tap();
    await expect(perfilMostrado(page)).toHaveText('Agresivo');
    await expect(page.locator('p[class*="resultScore"]')).toContainText('35 puntos · tramo 35–40');
    await expect(page.locator('[class*="resultScoreBorde"]')).toHaveCount(1); // 35 = range[0] y 35 > 10
    // 4·20 + 2 + (35−35)/(40−35)·16 = 82 %
    expect(await izquierdaFlecha(page)).toBeCloseTo(82, 1);
    expect(await segmentoDeLaFlecha(page)).toBe(4);
    // PROFILES.agresivo
    await expect(rasgo(page, 1)).toHaveText('> 15 años');
    // PROFILES.agresivo.allocation = 90/5/0/5, con espacio duro antes del % (2180)
    expect(await reparto(page)).toEqual([
      'Renta Variable (90 %)',
      'Renta Fija (5 %)',
      'Liquidez (0 %)',
      'Alternativos (5 %)',
    ]);
    await page.getByRole('link', { name: /Simular esta Cartera/ }).tap();
    await page.waitForURL(/\/estimador-cartera-inversion\/\?perfil=agresivo/);
  });
});

// ---------- CASO 3 (rechazo) y los vecinos de la guarda, móvil 360×740 ----------
test.describe('re-inspección 15/10/2026 · móvil 360×740', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: UA_MOVIL_1410,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const marcadas = (page: Page) => page.locator('[class*="optionButton"][aria-pressed="true"]');
  const aviso = (page: Page) => page.locator('[class*="avisoRecuperado"]');

  test('caso a rechazar tocando: dobles toques en «Revisar mis respuestas» y «Repetir Test» no tocan lo que aparece debajo', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    await tocarRespuestas(page, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]); // 10 × 2 = 20
    await expect(perfilMostrado(page)).toHaveText('Moderado');
    await expect(page.locator('p[class*="resultScore"]')).toContainText('20 puntos · tramo 17–22');
    // 1·20 + 2 + (20−17)/(22−17)·16 = 31,6 %
    expect(await izquierdaFlecha(page)).toBeCloseTo(31.6, 1);

    // «Revisar» a media pantalla y abajo: tras el primer toque, bajo el dedo queda una opción de la 10
    for (const alto of [370, 629]) {
      const p = await centroA(page, page.getByRole('button', { name: /Revisar mis respuestas/ }), alto);
      await page.touchscreen.tap(p.x, p.y);
      await page.waitForTimeout(90);
      await page.touchscreen.tap(p.x, p.y);
      await expect(page.getByText('Pregunta 10 de 10')).toBeVisible();
      await page.waitForTimeout(300);
      await expect(marcadas(page), `doble toque en «Revisar» a ${alto} px`).toHaveCount(1);
      await expect(marcadas(page)).toContainText('Acepto algo de riesgo'); // la B de la 10, intacta
      await page.waitForTimeout(500);
      await botonSiguiente(page).tap(); // «Ver Resultado»
      await expect(perfilMostrado(page)).toHaveText('Moderado');
    }

    // «Repetir Test» abajo: tras el primer toque, bajo el dedo queda «Comenzar Test» (con guarda)
    const p = await centroA(page, page.getByRole('button', { name: /Repetir Test/ }), 629);
    await page.touchscreen.tap(p.x, p.y);
    await page.waitForTimeout(90);
    await page.touchscreen.tap(p.x, p.y);
    await page.waitForTimeout(400);
    await expect(page.getByRole('button', { name: /Comenzar Test/ })).toBeVisible();
    await expect(enunciado(page)).toHaveCount(0);
  });

  test('REPARADO 3233 (vecinos) — el doble toque en «Siguiente» al pie no toca nada en ninguna de las nueve transiciones', async ({
    page,
  }) => {
    // El testigo del 12/10 solo mira la 1→2. Tras 53b0bb48 el segundo toque marcaba C o D en 9 de 9.
    test.setTimeout(90_000);
    await cargarSinSesion(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    const fallos: string[] = [];
    for (let n = 1; n <= 9; n++) {
      await page.waitForTimeout(500);
      await opcion(page, 1).tap();
      const sig = botonSiguiente(page);
      await sig.evaluate((el) => window.scrollBy(0, el.getBoundingClientRect().bottom - (window.innerHeight - 24)));
      await page.waitForTimeout(200);
      const caja = await sig.boundingBox();
      expect(caja).not.toBeNull();
      const x = caja!.x + caja!.width / 2;
      const y = caja!.y + caja!.height / 2;
      await page.touchscreen.tap(x, y);
      await page.waitForTimeout(90);
      await page.touchscreen.tap(x, y);
      await page.waitForTimeout(350);
      const progreso = await page.locator('[class*="progressText"]').textContent();
      const n2 = await marcadas(page).count();
      if (progreso !== `Pregunta ${n + 1} de 10` || n2 !== 0) fallos.push(`${n}→${n + 1}: «${progreso}», ${n2} marcada(s)`);
    }
    expect(fallos).toEqual([]);
  });

  test('REPARADO 3310 — un doble toque cuya segunda mitad cae en «Empezar de cero» no borra el test', async ({
    page,
  }) => {
    // «Empezar de cero» (aviso de test recuperado) era el único botón de la app que no pasaba por la
    // guarda de e903863e, y es el único que BORRA: handleRestart vacía las respuestas y la sesión.
    // Con la vista recolocada al principio del cuestionario (3285 al cambiar de pregunta; 2177 al
    // volver con «Revisar»), queda a ~255 px de la ventana a 360×740. REPARADO el 15/10/2026: lleva
    // la misma guarda que los demás. (La parte 2 ya no encuentra el aviso tras terminar —3311—, y
    // sigue comprobando que el doble toque en «Revisar» no lleva a la portada.)
    test.setTimeout(90_000);
    const problemas: string[] = [];

    // 1) Test a medias recuperado (B en la 1, C en la 2); B en la 3 y «Siguiente» tocado a esa altura.
    await sembrarSesion1510(page, { currentQuestion: 2, answers: { 1: 2, 2: 3 } });
    await expect(aviso(page)).toContainText('con 2 de 10 respuestas');
    await page.waitForTimeout(500);
    await opcion(page, 1).tap();
    const yEmpezar = await alturaDeEmpezarTrasRecolocar(page);
    const s = await centroA(page, botonSiguiente(page), yEmpezar);
    await page.touchscreen.tap(s.x, s.y);
    await page.waitForTimeout(90);
    await page.touchscreen.tap(s.x, s.y);
    await page.waitForTimeout(500);
    if (await page.getByRole('button', { name: /Comenzar Test/ }).count()) {
      problemas.push(`doble toque en «Siguiente» a ${Math.round(s.y)} px → portada, sesión ${await page.evaluate((k) => sessionStorage.getItem(k), CLAVE_SESION_1510)}`);
    }

    // 2) Test recuperado y TERMINADO (C en las diez = 30): «Revisar» tocado a la altura del botón.
    await sembrarSesion1510(page, { currentQuestion: 9, answers: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3 } });
    await opcion(page, 2).tap();
    await page.waitForTimeout(500);
    await botonSiguiente(page).tap(); // «Ver Resultado»
    await expect(page.locator('p[class*="resultScore"]')).toContainText('30 puntos');
    await page.waitForTimeout(500);
    const r = await centroA(page, page.getByRole('button', { name: /Revisar mis respuestas/ }), yEmpezar);
    await page.touchscreen.tap(r.x, r.y);
    await page.waitForTimeout(90);
    await page.touchscreen.tap(r.x, r.y);
    await page.waitForTimeout(500);
    if (await page.getByRole('button', { name: /Comenzar Test/ }).count()) {
      problemas.push(`doble toque en «Revisar mis respuestas» a ${Math.round(r.y)} px → portada con las 10 respuestas borradas`);
    }
    expect(problemas).toEqual([]);
  });

  test('REPARADO 3311 — el aviso de test recuperado no cuenta las respuestas nuevas ni sigue tras terminar', async ({
    page,
  }) => {
    // El aviso dice lo que se RECUPERÓ («con 2 de 10 respuestas»), pero su cifra era
    // Object.keys(answers).length, que subía con cada respuesta nueva, y `sesionRecuperada` solo se
    // apagaba con «Comenzar» o «Repetir»: seguía en la pregunta 10 tras «Ver Resultado» → «Revisar»,
    // diciendo «Hemos recuperado el test que dejaste a medias en esta pestaña, con 10 de 10
    // respuestas». Va en role="status": un lector de pantalla lo volvía a leer con cada respuesta
    // nueva (8 veces de la 3 a la 10). REPARADO el 15/10/2026: el aviso guarda la cifra recuperada
    // y se retira al ver el resultado.
    test.setTimeout(90_000);
    const problemas: string[] = [];
    await sembrarSesion1510(page, { currentQuestion: 2, answers: { 1: 2, 2: 3 } });
    await expect(aviso(page)).toContainText('con 2 de 10 respuestas');
    await page.waitForTimeout(500);
    await opcion(page, 2).tap(); // C en la 3
    await page.waitForTimeout(200);
    const trasLa3 = (await aviso(page).count()) ? sinEspacios(await aviso(page).innerText()) : '';
    if (/con 3 de 10/.test(trasLa3)) problemas.push(`tras contestar la 3: «${trasLa3}»`);
    await botonSiguiente(page).tap();
    await tocarRespuestas(page, [2, 2, 2, 2, 2, 2, 2]); // 4 a 10 en C: 2 + 3 + 8·3 = 29
    await expect(page.locator('p[class*="resultScore"]')).toContainText('29 puntos');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Revisar mis respuestas/ }).tap();
    await expect(page.getByText('Pregunta 10 de 10')).toBeVisible();
    if (await aviso(page).count()) {
      problemas.push(`tras terminar y «Revisar»: «${sinEspacios(await aviso(page).innerText())}»`);
    }
    expect(problemas).toEqual([]);
  });
});

// ============================================================
// INSPECTOR 16/10/2026 — re-inspección tras e89a1b9a (3310), 57343d4e (3311), 8ec810fe (3313) y
// 192273c2 (3312), con FIRMA DE ROTURA (75,4 % cortas y 32,3 % recargas en 65 visitas en los 30 días
// hasta el 15/10/2026: una ventana ANTERIOR a las cuatro reparaciones, y con 11 días de antes del
// 26/09, cuando cada cambio de fase contaba como visita nueva —2175/2176—).
//
// LAS REPARACIONES se sostienen en el ESTADO:
//   3310 → «Empezar de cero» lleva la guarda: doble toque a 90 ms con el botón a 140, 300, 460 y 650 px
//          (360×740) o 754 px (390×844) → portada y sesión vacía; con «Comenzar Test» bajo el dedo, el
//          segundo toque se absorbe.
//   3311 → el aviso dice lo recuperado y no vuelve tras terminar (su test del 15/10, en verde).
//   3312 → tope por la pregunta 1 (A → Conservador, B → Moderado, C → Equilibrado, D sin tope), con la
//          línea que lo explica, la flecha en el segmento nombrado y el enlace con el perfil limitado.
//   3313 → «Atrás» desde los dos enlaces del resultado y F5 devuelven el MISMO resultado. Pero lo que se
//          VE al volver no es el resultado: HALLAZGO de abajo, con su hermano del F5 a mitad.
//
// C0254 (familia «tests y cuestionarios por fases»; esta app es la referencia). La guarda cubre los
// botones de las tres fases: «Comenzar Test», las cuatro opciones, «← Anterior», «Siguiente →» / «Ver
// Resultado», «Empezar de cero», «Revisar mis respuestas» y «Repetir Test» (también con el resultado
// restaurado por F5). Las reparaciones del 15/10 no añadieron botones: 192273c2 añade un <p>. Sin
// guarda quedan solo los dos ENLACES del resultado, y tras «Ver Resultado» bajo el dedo queda texto. No
// se come lo legítimo: «Siguiente» y, a los 200 ms, otra opción a 45-138 px cuenta, y corregir A → D a
// los 200 ms también (el teclado lo cubre el bloque del 15/10).
//
// LOS CASOS, resueltos a mano antes de abrir el navegador (A=1 · B=2 · C=3 · D=4; tope por la 1;
// flecha = i·20 + 2 + (p' − mín)/(máx − mín)·16 con el tramo del perfil NOMBRADO y p' la puntuación
// acotada a ese tramo):
//   normal  → D,C,B,C,B,C,C,B,C,B = 4+3+2+3+2+3+3+2+3+2 = 27 → Equilibrado (23–28); la 1 en D, sin
//             tope ni aviso de borde; flecha 40 + 2 + 4/5·16 = 54,8 %; 50/35/10/5
//             B,C×9 = 2 + 27 = 29 → por puntos Dinámico; la B («2 a 5 años») lo limita a Moderado:
//             flecha 20 + 2 + 16 = 38 %, 30/50/15/5, ?perfil=moderado
//   límite  → C,D,D,D,C,C,C,B,A,A = 3+4+4+4+3+3+3+2+1+1 = 28, techo del tope C: Equilibrado sin línea;
//             la 10 de A a B = 29 → por puntos Dinámico, tope Equilibrado con su línea, flecha 58 %
//             (y en móvil A,D×9 = 37 → Conservador, flecha 2 + 16 = 18 %)
//   rechazo → sin contestar, «Siguiente» deshabilitado y un clic forzado no avanza; una sesión de
//             resultado sin las diez respuestas, o con una fase desconocida, se retira: portada
//   firma   → F5 a mitad, F5 con el resultado, «Atrás» desde el estimador, pestaña nueva
// ============================================================

const CLAVE_1610 = 'meskeia:test-perfil-inversor:v1';
const UA_ESCRITORIO_1610 =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

/**
 * Carga la app sin sesión. La limpia desde una página del MISMO origen que no es la app: con la app
 * cargada, su recuperación puede reescribir la sesión después del clear (medido en esta inspección:
 * la siguiente carga aterrizaba en la pregunta, sin «Comenzar Test»).
 */
async function cargarLimpia1610(page: Page): Promise<void> {
  await page.goto('/robots.txt');
  await page.evaluate(() => sessionStorage.clear());
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

/** Contesta con la pausa de quien lee: la guarda del 3299 absorbe lo que llega a < 450 ms en el mismo punto. */
async function contestar1610(page: Page, indices: number[], tocar = false): Promise<void> {
  for (const i of indices) {
    await page.waitForTimeout(500);
    if (tocar) await opcion(page, i).tap();
    else await opcion(page, i).click();
    if (tocar) await botonSiguiente(page).tap();
    else await botonSiguiente(page).click();
  }
}

/** Píxeles del elemento que se ven entre la barra fija del logo y el pie de la ventana (−1 si no existe). */
async function pxALaVista1610(page: Page, selector: string): Promise<{ px: number; caja: string }> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { px: -1, caja: 'no existe' };
    const r = el.getBoundingClientRect();
    const barra = document.querySelector('[data-barra-logo]')?.getBoundingClientRect().bottom ?? 0;
    const px = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, barra));
    return { px: Math.round(px), caja: `${Math.round(r.top)}..${Math.round(r.bottom)}` };
  }, selector);
}

/** Reparto de la leyenda con espacios normales (el % lleva espacio duro, 2180). */
async function reparto1610(page: Page): Promise<string[]> {
  return (await reparto(page)).map((s) => s.replace(/ /g, ' '));
}

test.describe('Inspector 16/10/2026 · escritorio', () => {
  test.use({ viewport: { width: 1280, height: 800 }, userAgent: UA_ESCRITORIO_1610 });
  const puntuacion = (page: Page) => page.locator('p[class*="resultScore"]');
  const avisoDeBorde = (page: Page) => page.locator('[class*="resultScoreBorde"]');
  const lineaDeTope = (page: Page) => page.locator('[class*="resultTope"]');

  test('caso normal: D,C,B,C,B,C,C,B,C,B suma 27 → Equilibrado, sin tope ni aviso de borde, flecha 54,8 %', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await cargarLimpia1610(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await contestar1610(page, [3, 2, 1, 2, 1, 2, 2, 1, 2, 1]); // 4+3+2+3+2+3+3+2+3+2 = 27
    await expect(perfilMostrado(page)).toHaveText('Equilibrado');
    await expect(puntuacion(page)).toHaveText('27 puntos · tramo 23–28');
    await expect(avisoDeBorde(page)).toHaveCount(0); // ni 23 ni 28
    await expect(lineaDeTope(page)).toHaveCount(0); // la 1 en D: sin tope
    // 2·20 + 2 + (27 − 23)/(28 − 23)·16 = 54,8 %
    expect(await izquierdaFlecha(page)).toBeCloseTo(54.8, 1);
    expect(await segmentoDeLaFlecha(page)).toBe(2);
    // PROFILES.equilibrado
    await expect(rasgo(page, 0)).toHaveText('Medio');
    await expect(rasgo(page, 1)).toHaveText('5-10 años');
    await expect(rasgo(page, 2)).toHaveText('12-15 %');
    await expect(rasgo(page, 3)).toHaveText('Crecimiento sostenido');
    expect(await reparto1610(page)).toEqual([
      'Renta Variable (50 %)',
      'Renta Fija (35 %)',
      'Liquidez (10 %)',
      'Alternativos (5 %)',
    ]);
    await expect(page.getByRole('link', { name: /Simular esta Cartera/ })).toHaveAttribute(
      'href',
      '/estimador-cartera-inversion/?perfil=equilibrado',
    );
  });

  test('tope intermedio: B,C×9 suma 29 (Dinámico por puntos) → Moderado por el horizonte de 2 a 5 años, flecha 38 %', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await cargarLimpia1610(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await contestar1610(page, [1, 2, 2, 2, 2, 2, 2, 2, 2, 2]); // 2 + 9·3 = 29
    await expect(perfilMostrado(page)).toHaveText('Moderado');
    // El tramo que se pinta es el de la PUNTUACIÓN (29–34, Dinámico), y la línea explica el tope
    await expect(puntuacion(page)).toHaveText('29 puntos · tramo 29–34');
    await expect(lineaDeTope(page)).toHaveText(
      'Tu horizonte de entre 2 y 5 años limita el perfil a Moderado; el resto de tus respuestas apuntaba a Dinámico.',
    );
    await expect(avisoDeBorde(page)).toHaveCount(0); // con el tope actuando no hay aviso de borde
    // Segmento de Moderado, extremo alto: 1·20 + 2 + (22 − 17)/(22 − 17)·16 = 38 %
    expect(await izquierdaFlecha(page)).toBeCloseTo(38, 1);
    expect(await segmentoDeLaFlecha(page)).toBe(1);
    // PROFILES.moderado
    await expect(rasgo(page, 0)).toHaveText('Bajo');
    await expect(rasgo(page, 1)).toHaveText('3-5 años');
    await expect(rasgo(page, 2)).toHaveText('8-12 %');
    await expect(rasgo(page, 3)).toHaveText('Batir inflación');
    expect(await reparto1610(page)).toEqual([
      'Renta Variable (30 %)',
      'Renta Fija (50 %)',
      'Liquidez (15 %)',
      'Alternativos (5 %)',
    ]);
    await expect(page.getByRole('link', { name: /Simular esta Cartera/ })).toHaveAttribute(
      'href',
      '/estimador-cartera-inversion/?perfil=moderado',
    );
  });

  test('caso límite: C + 25 = 28 es el techo del tope C (Equilibrado, sin línea); la 10 de A a B (29) ya lo limita el horizonte', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await cargarLimpia1610(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await contestar1610(page, [2, 3, 3, 3, 2, 2, 2, 1, 0, 0]); // 3+4+4+4+3+3+3+2+1+1 = 28
    await expect(perfilMostrado(page)).toHaveText('Equilibrado');
    await expect(puntuacion(page)).toContainText('28 puntos · tramo 23–28');
    await expect(lineaDeTope(page)).toHaveCount(0); // por puntos ya es Equilibrado: el tope no actúa
    // 2·20 + 2 + (28 − 23)/(28 − 23)·16 = 58 %
    expect(await izquierdaFlecha(page)).toBeCloseTo(58, 1);

    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Revisar mis respuestas/ }).click();
    await expect(page.getByText('Pregunta 10 de 10')).toBeVisible();
    await page.waitForTimeout(500);
    await opcion(page, 1).click(); // A → B: +1
    await botonSiguiente(page).click();
    await expect(perfilMostrado(page)).toHaveText('Equilibrado');
    await expect(puntuacion(page)).toHaveText('29 puntos · tramo 29–34');
    await expect(lineaDeTope(page)).toHaveText(
      'Tu horizonte de entre 5 y 10 años limita el perfil a Equilibrado; el resto de tus respuestas apuntaba a Dinámico.',
    );
    await expect(avisoDeBorde(page)).toHaveCount(0);
    // Segmento de Equilibrado, extremo alto (29 acotado a 28): 58 %
    expect(await izquierdaFlecha(page)).toBeCloseTo(58, 1);
    expect(await segmentoDeLaFlecha(page)).toBe(2);
    await expect(page.getByRole('link', { name: /Simular esta Cartera/ })).toHaveAttribute(
      'href',
      '/estimador-cartera-inversion/?perfil=equilibrado',
    );
  });

  test('caso a rechazar: sin respuesta no se avanza; una sesión de resultado incompleta o con fase desconocida se retira', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await cargarLimpia1610(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await page.waitForTimeout(500);
    await expect(botonSiguiente(page)).toBeDisabled();
    await botonSiguiente(page).click({ force: true });
    await expect(page.getByText('Pregunta 1 de 10')).toBeVisible();
    await expect(page.locator('[class*="optionButton"][aria-pressed="true"]')).toHaveCount(0);

    const sembrarYCargar = async (sesion: object): Promise<string | null> => {
      await page.evaluate(([k, v]) => sessionStorage.setItem(k, v), [CLAVE_1610, JSON.stringify(sesion)]);
      await page.goto(RUTA);
      await esperarPaginaAsentada(page);
      return page.evaluate((k) => sessionStorage.getItem(k), CLAVE_1610);
    };
    const diezD = { 1: 4, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 4 };

    // Resultado con DOS respuestas: no hay resultado sin las diez (mismo listón que el 1214)
    expect(await sembrarYCargar({ currentQuestion: 9, answers: { 1: 4, 2: 4 }, fase: 'result' })).toBeNull();
    await expect(page.getByRole('button', { name: /Comenzar Test/ })).toBeVisible();
    await expect(perfilMostrado(page)).toHaveCount(0);

    // Fase desconocida, aunque haya diez respuestas
    expect(await sembrarYCargar({ currentQuestion: 9, answers: diezD, fase: 'resultado' })).toBeNull();
    await expect(page.getByRole('button', { name: /Comenzar Test/ })).toBeVisible();

    // Y la buena, para comparar: todo D = 40 → Agresivo, sin aviso de borde (40 es el techo de la ESCALA)
    expect(await sembrarYCargar({ currentQuestion: 9, answers: diezD, fase: 'result' })).not.toBeNull();
    await expect(perfilMostrado(page)).toHaveText('Agresivo');
    await expect(puntuacion(page)).toHaveText('40 puntos · tramo 35–40');
    await expect(avisoDeBorde(page)).toHaveCount(0);
    await expect(page.getByText(/Hemos recuperado el test/)).toHaveCount(0);
  });

  test('pestaña nueva: la portada, aunque otra pestaña tenga el resultado guardado', async ({ page, context }) => {
    // sessionStorage es de cada pestaña: quien abre la app en otra no hereda el resultado de esta.
    await cargarLimpia1610(page);
    await page.evaluate(
      ([k, v]) => sessionStorage.setItem(k, v),
      [CLAVE_1610, JSON.stringify({ currentQuestion: 9, answers: { 1: 4, 2: 3, 3: 2, 4: 3, 5: 2, 6: 3, 7: 3, 8: 2, 9: 3, 10: 2 }, fase: 'result' })],
    );
    const nueva = await context.newPage();
    await nueva.goto(RUTA);
    await esperarPaginaAsentada(nueva);
    await expect(nueva.getByRole('button', { name: /Comenzar Test/ })).toBeVisible();
    await expect(nueva.locator('[class*="resultProfile"]')).toHaveCount(0);
    await nueva.close();
  });

  test.fail('HALLAZGO — en el techo de su tope, el aviso de borde no promete el perfil de al lado que un punto más no da', async ({
    page,
  }) => {
    // 192273c2 quitó el aviso cuando el tope ACTÚA («Con el tope actuando, un punto más o menos no
    // cambia el perfil: el aviso de borde mentiría»), pero no cuando la puntuación está justo en el
    // techo del perfil máximo que permite el horizonte. Ahí el aviso dice «con un punto de diferencia el
    // resultado sería el perfil de al lado», y un punto más en cualquiera de las preguntas 2 a 10 deja
    // el MISMO perfil: solo cambiar la respuesta del horizonte lo movería.
    // Resuelto a mano: A + 15 = 16 (Conservador, techo de A) → con la 10 de A a B, 17: Moderado por
    // puntos, tope Conservador · B + 20 = 22 (Moderado, techo de B) → 23: tope Moderado · C + 25 = 28
    // (Equilibrado, techo de C) → 29: tope Equilibrado.
    test.setTimeout(120_000);
    const problemas: string[] = [];
    const casos: Array<{ indices: number[]; puntos: number; perfil: string }> = [
      { indices: [0, 1, 1, 1, 1, 1, 1, 0, 0, 0], puntos: 16, perfil: 'Conservador' }, // 1 + 6·2 + 3·1
      { indices: [1, 2, 2, 2, 1, 1, 1, 1, 1, 0], puntos: 22, perfil: 'Moderado' }, // 2 + 3·3 + 5·2 + 1
      { indices: [2, 3, 3, 3, 2, 2, 2, 1, 0, 0], puntos: 28, perfil: 'Equilibrado' }, // 3 + 3·4 + 3·3 + 2 + 1 + 1
    ];
    for (const caso of casos) {
      await cargarLimpia1610(page);
      await page.getByRole('button', { name: /Comenzar Test/ }).click();
      await contestar1610(page, caso.indices);
      await expect(perfilMostrado(page)).toHaveText(caso.perfil);
      await expect(puntuacion(page)).toContainText(`${caso.puntos} puntos`);
      const aviso = (await avisoDeBorde(page).count()) ? sinEspacios(await avisoDeBorde(page).innerText()) : '';
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Revisar mis respuestas/ }).click();
      await expect(page.getByText('Pregunta 10 de 10')).toBeVisible();
      await page.waitForTimeout(500);
      await opcion(page, 1).click(); // la 10 de A a B: un punto más
      await botonSiguiente(page).click();
      await expect(puntuacion(page)).toContainText(`${caso.puntos + 1} puntos`);
      const conUnPuntoMas = (await perfilMostrado(page).textContent()) ?? '';
      if (/con un punto de diferencia el resultado sería el perfil de al lado/.test(aviso) && conUnPuntoMas === caso.perfil) {
        problemas.push(
          `${caso.puntos} puntos (${caso.perfil}) avisa de «el perfil de al lado», y con ${caso.puntos + 1} sigue en ${conUnPuntoMas}`,
        );
      }
    }
    expect(problemas).toEqual([]);
  });

  test.fail('HALLAZGO (3313) — al volver con «Atrás» desde «Simular esta Cartera», o tras un F5, el resultado está en pantalla', async ({
    page,
  }) => {
    // 8ec810fe restaura el ESTADO (lo comprueba «REPARADO 3313», más arriba), pero la fase guardada se
    // monta en un efecto, tras el primer render, cuando el navegador ya ha restaurado el desplazamiento
    // sobre la portada que sirve el servidor: la vista queda tan abajo como mide el resultado de más que
    // la portada. Su propio comentario lo daba por imposible: «la página acaba de cargarse arriba del
    // todo». Medido a 1280×800: «Simular esta Cartera» pulsado en scrollY 1706 → «Atrás» → scrollY 2846,
    // en «Apps relacionadas», con el resultado en −2240..−587 px. F5 mirando «Tu perfil es: Equilibrado»
    // (scrollY 510) → scrollY 1651, en «Ideas que suelen asociarse…», con el nombre del perfil 824 px
    // por encima de la ventana. 5 de 5 en las dos.
    test.setTimeout(90_000);
    const problemas: string[] = [];
    await cargarLimpia1610(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await contestar1610(page, [3, 2, 1, 2, 1, 2, 2, 1, 2, 1]); // 27 → Equilibrado
    await expect(perfilMostrado(page)).toHaveText('Equilibrado');
    const simular = page.getByRole('link', { name: /Simular esta Cartera/ });
    await simular.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await simular.click();
    await page.waitForURL(/\/estimador-cartera-inversion\/\?perfil=equilibrado/);
    await esperarPaginaAsentada(page);
    await page.goBack();
    await page.waitForURL(/\/test-perfil-inversor\/$/);
    await esperarPaginaAsentada(page);
    const trasAtras = await pxALaVista1610(page, '[class*="resultScreen"]');
    if (trasAtras.px <= 0) {
      problemas.push(`«Atrás»: el resultado en ${trasAtras.caja} px, scrollY ${await page.evaluate(() => Math.round(window.scrollY))}`);
    }

    await page.locator('[class*="resultScreen"]').evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(300);
    const antes = await pxALaVista1610(page, '[class*="resultProfile"]');
    await page.reload();
    await esperarPaginaAsentada(page);
    const trasF5 = await pxALaVista1610(page, '[class*="resultProfile"]');
    if (antes.px > 0 && trasF5.px <= 0) problemas.push(`F5: el nombre del perfil en ${trasF5.caja} px (antes, en ${antes.caja})`);
    expect(problemas).toEqual([]);
  });

  test.fail('HALLAZGO — tras un F5 a mitad del test, el aviso de recuperado y «Pregunta 4 de 10» están en pantalla', async ({
    page,
  }) => {
    // La recuperación (105, 1221) monta la pregunta y el aviso «Hemos recuperado el test que dejaste a
    // medias…» tras el primer render, con el desplazamiento ya restaurado por el navegador, y la vista
    // queda unos 500 px más abajo de donde estaba. Medido a 1280×800: B, C, B y en la pregunta 4 (la
    // app deja «Pregunta 4 de 10» en 96..119 px) → F5 → scrollY 510 → 1025, con el aviso en −340..−243,
    // «Pregunta 4 de 10» en −419..−396 y el enunciado en −142..−112: se ven las opciones de una
    // pregunta sin su enunciado y sin la explicación de lo recuperado. 9 de 9 en scripts sueltos (a
    // 390×844, 8 de 9; a 360×740, 5 de 6), con service worker y sin él; en este runner, 3 de 4 a
    // velocidad normal. Depende de que el navegador restaure el desplazamiento ANTES de que React
    // monte la pregunta, así que el F5 se hace con la CPU a 1/4, como en un móvil, para que el caso
    // no dependa de la carga de la máquina.
    test.setTimeout(60_000);
    await cargarLimpia1610(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).click();
    await contestar1610(page, [1, 2, 1]); // B, C, B
    await expect(page.getByText('Pregunta 4 de 10')).toBeVisible();
    expect((await pxALaVista1610(page, '[class*="progressText"]')).px).toBeGreaterThan(0);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.reload();
    await esperarPaginaAsentada(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await expect(page.locator('[class*="avisoRecuperado"]')).toContainText('con 3 de 10 respuestas');
    const problemas: string[] = [];
    const piezas: Array<[string, string]> = [
      ['el aviso de recuperado', '[class*="avisoRecuperado"]'],
      ['«Pregunta 4 de 10»', '[class*="progressText"]'],
      ['el enunciado', '[class*="questionText"]'],
    ];
    for (const [nombre, selector] of piezas) {
      const v = await pxALaVista1610(page, selector);
      if (v.px <= 0) problemas.push(`${nombre} en ${v.caja} px`);
    }
    expect(problemas).toEqual([]);
  });

  test.fail('HALLAZGO — la guía da la misma regla de horizonte que el tope que aplica el resultado', async ({ page }) => {
    // Resultado (192273c2, decidido por el usuario): la 1 en A («Menos de 2 años») → como mucho
    // Conservador; B («2 a 5 años - Plazo medio») → Moderado; C («5 a 10 años») → Equilibrado.
    // Guía, paso 3: «menos de 3 años → conservador; en 3–7 años → moderado/equilibrado», que da
    // Conservador a quien tiene 2-3 años (el resultado le deja llegar a Moderado) y Equilibrado a quien
    // tiene 3-5 (el resultado lo limita a Moderado). FAQ avanzada, técnica «bucket»: «medio plazo
    // (equilibrado)», cuando el «Plazo medio» de la pregunta 1 no pasa de Moderado.
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const paso3 = sinEspacios(
      await page.locator('[class*="stepItem"]').filter({ hasText: 'Determina cuándo necesitarás el dinero' }).innerText(),
    );
    const bucket = sinEspacios(
      await page.locator('[class*="faqSectionItem"]').filter({ hasText: '¿Puedo tener dos perfiles diferentes' }).innerText(),
    );
    const problemas: string[] = [];
    if (/menos de 3 años\s*→\s*conservador/i.test(paso3)) problemas.push('paso 3: «menos de 3 años → conservador»');
    if (/3[–-]7 años\s*→\s*moderado\/equilibrado/i.test(paso3)) problemas.push('paso 3: «3–7 años → moderado/equilibrado»');
    if (/medio plazo \(equilibrado\)/i.test(bucket)) problemas.push('bucket: «medio plazo (equilibrado)»');
    expect(problemas).toEqual([]);
  });
});

test.describe('Inspector 16/10/2026 · móvil 360×740', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: UA_MOVIL_1410,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const marcadas = (page: Page) => page.locator('[class*="optionButton"][aria-pressed="true"]');

  test('caso límite tocando: A,D×9 = 37 → Conservador por el horizonte, con la línea del tope en la primera pantalla', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await cargarLimpia1610(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    await contestar1610(page, [0, 3, 3, 3, 3, 3, 3, 3, 3, 3], true); // 1 + 9·4 = 37
    await expect(perfilMostrado(page)).toHaveText('Conservador');
    await expect(page.locator('p[class*="resultScore"]')).toHaveText('37 puntos · tramo 35–40');
    await expect(page.locator('[class*="resultScoreBorde"]')).toHaveCount(0);
    const tope = page.locator('[class*="resultTope"]');
    await expect(tope).toHaveText(
      'Tu horizonte de menos de 2 años limita el perfil a Conservador; el resto de tus respuestas apuntaba a Agresivo.',
    );
    await enteroALaVista(page, tope); // sin desplazarse: es lo que explica por qué no sale Agresivo
    // Segmento de Conservador, extremo alto (37 acotado a 16): 0·20 + 2 + 16 = 18 %
    expect(await izquierdaFlecha(page)).toBeCloseTo(18, 1);
    expect(await segmentoDeLaFlecha(page)).toBe(0);
    await expect(rasgo(page, 1)).toHaveText('< 3 años');
    await expect(page.getByRole('link', { name: /Simular esta Cartera/ })).toHaveAttribute(
      'href',
      '/estimador-cartera-inversion/?perfil=conservador',
    );
  });

  test('C0254 — la guarda cubre «← Anterior», «Empezar de cero» y «Ver Resultado» tocados dos veces, sin comerse lo legítimo', async ({
    page,
  }) => {
    test.setTimeout(300_000);
    const problemas: string[] = [];
    const alturas = [140, 300, 460, 650];
    const dobleToque = async (p: { x: number; y: number }): Promise<void> => {
      await page.touchscreen.tap(p.x, p.y);
      await page.waitForTimeout(90);
      await page.touchscreen.tap(p.x, p.y);
      await page.waitForTimeout(450);
    };

    // «← Anterior» en la 3 (1 = B, 2 = C, 3 = D): queda la 2, con su C
    for (const y of alturas) {
      await cargarLimpia1610(page);
      await page.getByRole('button', { name: /Comenzar Test/ }).tap();
      await contestar1610(page, [1, 2], true);
      await page.waitForTimeout(500);
      await opcion(page, 3).tap();
      await page.waitForTimeout(500);
      const p = await centroA(page, botonAnterior(page), y);
      await dobleToque(p);
      const progreso = await page.locator('[class*="progressText"]').textContent();
      const m = await marcadas(page).allTextContents();
      if (progreso !== 'Pregunta 2 de 10' || m.length !== 1 || !m[0].includes('Mantendría la posición')) {
        problemas.push(`«← Anterior» a ${Math.round(p.y)} px → «${progreso}», marcadas: ${m.join(' | ')}`);
      }
    }

    // «Empezar de cero» (test recuperado con 2 respuestas): portada y sesión vacía, también con
    // «Comenzar Test» bajo el dedo tras el primer toque (a 650 px)
    for (const y of alturas) {
      await cargarLimpia1610(page);
      await page.evaluate(
        ([k, v]) => sessionStorage.setItem(k, v),
        [CLAVE_1610, JSON.stringify({ currentQuestion: 2, answers: { 1: 2, 2: 3 } })],
      );
      await page.goto(RUTA);
      await esperarPaginaAsentada(page);
      const p = await centroA(page, page.getByRole('button', { name: /Empezar de cero/ }), y);
      await dobleToque(p);
      const enPortada = await page.getByRole('button', { name: /Comenzar Test/ }).count();
      const sesion = await page.evaluate((k) => sessionStorage.getItem(k), CLAVE_1610);
      if (!enPortada || sesion !== null) {
        problemas.push(`«Empezar de cero» a ${Math.round(p.y)} px → ${enPortada ? 'portada' : 'sin portada'}, sesión ${sesion}`);
      }
    }

    // «Ver Resultado» (B en las diez = 20, Moderado): el resultado, sin salir de la página
    for (const y of alturas) {
      await cargarLimpia1610(page);
      await page.getByRole('button', { name: /Comenzar Test/ }).tap();
      await contestar1610(page, [1, 1, 1, 1, 1, 1, 1, 1, 1], true);
      await page.waitForTimeout(500);
      await opcion(page, 1).tap();
      await page.waitForTimeout(500);
      const p = await centroA(page, botonSiguiente(page), y);
      await dobleToque(p);
      const perfil = (await perfilMostrado(page).count()) ? await perfilMostrado(page).textContent() : null;
      if (!page.url().endsWith('/test-perfil-inversor/') || perfil !== 'Moderado') {
        problemas.push(`«Ver Resultado» a ${Math.round(p.y)} px → ${page.url()}, perfil ${perfil}`);
      }
    }

    // Lo legítimo 1: «Siguiente» y, a los 200 ms, OTRA opción de la pregunta nueva, lejos del dedo
    await cargarLimpia1610(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    await page.waitForTimeout(500);
    await opcion(page, 1).tap();
    await page.waitForTimeout(500);
    const s = await centroA(page, botonSiguiente(page), 650);
    await page.touchscreen.tap(s.x, s.y);
    await page.waitForTimeout(200);
    let elegida: { i: number; x: number; y: number } | null = null;
    for (let i = 0; i < 4; i++) {
      const c = await opcion(page, i).boundingBox();
      if (!c) continue;
      const cy = c.y + c.height / 2;
      const dentro = c.y > 70 && c.y + c.height < 730;
      if (dentro && Math.abs(cy - s.y) > 40 && (!elegida || Math.abs(cy - s.y) < Math.abs(elegida.y - s.y))) {
        elegida = { i, x: c.x + c.width / 2, y: cy };
      }
    }
    expect(elegida, 'ninguna opción de la pregunta 2 a la vista').not.toBeNull();
    await page.touchscreen.tap(elegida!.x, elegida!.y);
    await page.waitForTimeout(300);
    await expect(page.getByText('Pregunta 2 de 10')).toBeVisible();
    await expect(opcion(page, elegida!.i)).toHaveAttribute('aria-pressed', 'true');

    // Lo legítimo 2: corregir la respuesta a los 200 ms (A y luego D) cuenta
    await cargarLimpia1610(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    await page.waitForTimeout(600);
    await opcion(page, 0).tap();
    await page.waitForTimeout(200);
    await opcion(page, 3).tap();
    await page.waitForTimeout(300);
    await expect(opcion(page, 3)).toHaveAttribute('aria-pressed', 'true');
    await expect(marcadas(page)).toHaveCount(1);

    expect(problemas).toEqual([]);
  });

  test.fail('HALLAZGO (3313) — en móvil, «Atrás» desde «Simular esta Cartera» deja el resultado en pantalla', async ({
    page,
  }) => {
    // Medido a 360×740: «Simular esta Cartera» en scrollY 2354 → «Atrás» → scrollY 3962, en «Apps
    // relacionadas», con el resultado en −3299..−884 px: 1.608 px más abajo, lo que mide la página con
    // el resultado (5.089 px) sobre la portada que sirve el servidor (3.481). 6 de 6 (a 390×844, 5 de 5,
    // +1.482 px). El estado sí vuelve: el resultado está, unos 900 px por encima de la ventana.
    test.setTimeout(90_000);
    await cargarLimpia1610(page);
    await page.getByRole('button', { name: /Comenzar Test/ }).tap();
    await contestar1610(page, [3, 2, 1, 2, 1, 2, 2, 1, 2, 1], true); // 27 → Equilibrado
    await expect(perfilMostrado(page)).toHaveText('Equilibrado');
    const simular = page.getByRole('link', { name: /Simular esta Cartera/ });
    await simular.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await simular.tap();
    await page.waitForURL(/\/estimador-cartera-inversion\/\?perfil=equilibrado/);
    await esperarPaginaAsentada(page);
    await page.goBack();
    await page.waitForURL(/\/test-perfil-inversor\/$/);
    await esperarPaginaAsentada(page);
    const tras = await pxALaVista1610(page, '[class*="resultScreen"]');
    expect(tras.px, `el resultado en ${tras.caja} px`).toBeGreaterThan(0);
  });
});
