import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { TRAMOS_GANANCIAS_PATRIMONIALES_2025 } from '../../data/fiscal/inmuebles';

/**
 * Quiz Conceptos de Inversión — test de regresión del Inspector (1.ª pasada, 28/10/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «Quiz Conceptos de Inversión» · subtítulo «Sharpe, beta, duration, TER, rebalanceo y
 *   valoración — nivel intermedio con explicaciones detalladas» · metadata y applications.ts: «25
 *   preguntas en 5 categorías» con explicaciones tras cada respuesta.
 * · Pantalla de inicio con dos modos: «Examen completo» (las 25, barajadas) y «Práctica por
 *   categoría» (las 5 de una categoría, barajadas). Las OPCIONES no se barajan. Tras la última,
 *   «Ver resultado» da «N / total», «P % de respuestas correctas», un nivel por tramos y un
 *   «Resultado por categoría». La única salida del resultado es «Volver a empezar», que vuelve a
 *   la pantalla de inicio.
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · Nota: `pct = Math.round(correctas / total · 100)` y `clasificacion()` (page.tsx:386-392):
 *   100 → 🏆 «Experto en inversión» · ≥ 80 → 🌟 «Nivel avanzado — listo para construir cartera
 *   propia» · ≥ 60 → 👍 «Nivel intermedio — base sólida para seguir aprendiendo» · ≥ 40 → 📚 «Nivel
 *   básico-medio — repasa los conceptos clave» · resto → 🌱 «Nivel inicial — empieza por el quiz
 *   básico de finanzas». Con 25 preguntas cada acierto vale 4 %, así que no hay redondeo.
 * · Desglose: en el orden de `resultadosCat` (Riesgo y Rentabilidad, Renta Fija y Bonos, Fondos y
 *   ETF, Cartera y Estrategia, Valoración de Activos), solo las categorías jugadas.
 * · CLAVE: la respuesta correcta de cada enunciado, cotejada a mano el 28/10/2026 contra el concepto
 *   (no copiada del índice `correcta`), con su categoría. Es la clave de la app en las 25.
 * · Como las preguntas salen barajadas, el plan de cada partida se da por ENUNCIADO, no por número.
 */

const RUTA = '/quiz-conceptos-inversion/';

/** Espacio duro a espacio, «%» pegado al número y blancos colapsados (el formato del % es hallazgo aparte). */
const norm = (s: string | null | undefined): string =>
  (s ?? '').replace(/ /g, ' ').replace(/(\d) %/g, '$1%').replace(/\s+/g, ' ').trim();

type Cat = 'Riesgo y Rentabilidad' | 'Renta Fija y Bonos' | 'Fondos y ETF' | 'Cartera y Estrategia' | 'Valoración de Activos';
const RR: Cat = 'Riesgo y Rentabilidad';
const RF: Cat = 'Renta Fija y Bonos';
const FE: Cat = 'Fondos y ETF';
const CE: Cat = 'Cartera y Estrategia';
const VA: Cat = 'Valoración de Activos';

const CLAVE = new Map<string, { correcta: string; cat: Cat }>(
  (
    [
      ['¿Qué mide el ratio de Sharpe?', 'La rentabilidad obtenida por unidad de riesgo (volatilidad) asumido', RR],
      // 1,5 × 10 % = 15 %
      ['Una acción tiene beta = 1,5. Si el mercado sube un 10%, ¿qué comportamiento esperamos de la acción?', 'Sube aproximadamente un 15%', RR],
      ['¿Cuál de estos riesgos NO se elimina diversificando la cartera?', 'Riesgo de una recesión global que afecte a todos los mercados', RR],
      ['El ratio de Sortino es una variante del Sharpe. ¿Cuál es su diferencia principal?', 'Solo penaliza la volatilidad negativa (drawdowns), no la positiva', RR],
      // 100 / 65 − 1 = 0,53846 → 53,8 %
      ['El drawdown máximo de un fondo es del 35%. ¿Qué rentabilidad necesita para recuperar ese nivel?', 'Un 53,8%', RR],
      ['¿Qué ocurre con el precio de un bono cuando suben los tipos de interés (tasas de interés)?', 'El precio baja, porque los nuevos bonos ofrecen más rentabilidad', RF],
      ['¿Qué es la "duration" de un bono?', 'La vida media ponderada de los flujos de caja, que mide la sensibilidad al tipo de interés', RF],
      // cupón 3 % < 5 % de mercado → precio < 100
      ['Un bono con cupón del 3% se emite cuando los tipos están al 3%. Los tipos suben al 5%. ¿Cómo cotiza el bono en mercado secundario?', 'Bajo la par (<100), porque su cupón es inferior al tipo de mercado', RF],
      ['¿Qué indica que un bono tenga un spread de crédito elevado respecto al bono soberano?', 'Que el mercado percibe mayor riesgo de impago y exige más rentabilidad', RF],
      ['Un bono "callable" (rescatable) normalmente cotiza con menor rentabilidad que uno comparable no callable. ¿Por qué es incorrecto este enunciado?', 'Es incorrecto: los bonos callable ofrecen mayor rentabilidad porque el inversor asume el riesgo de amortización anticipada', RF],
      ['¿Qué es el TER (Total Expense Ratio) de un fondo?', 'El coste anual total del fondo como porcentaje del patrimonio, incluyendo gestión, depositaría y otros gastos', FE],
      ['Un ETF de réplica física completa vs uno de réplica sintética. ¿Cuál es la diferencia principal?', 'El físico compra los activos del índice directamente; el sintético usa derivados (swaps) para replicar el rendimiento', FE],
      ['¿Qué es el "tracking error" de un ETF?', 'La desviación estándar de las diferencias de rentabilidad entre el ETF y su índice', FE],
      ['A largo plazo, ¿qué porcentaje de fondos activos supera a su índice de referencia después de comisiones?', 'Entre el 10% y el 20% a 15–20 años según estudios SPIVA', FE],
      ['Un fondo de acumulación vs un fondo de distribución. Para un inversor en fase de crecimiento en España, ¿cuál suele ser más eficiente fiscalmente?', 'El de acumulación, porque los dividendos se reinvierten sin tributar hasta la venta', FE],
      ['¿Por qué se rebalancea una cartera periódicamente?', 'Para restaurar la distribución de activos objetivo cuando las ponderaciones se desvían por la evolución del mercado', CE],
      // ρ = −1: w₁ = σ₂ / (σ₁ + σ₂) anula la varianza
      ['Dos activos tienen correlación de −1. ¿Qué ocurre si los combinas en una cartera?', 'Es posible construir una cartera con riesgo cero si las ponderaciones son las adecuadas', CE],
      ['¿Qué es el "factor investing" o inversión factorial?', 'Estrategia que sobrepondera acciones con características (factores) que históricamente han generado alfa: valor, calidad, momentum, tamaño, baja volatilidad', CE],
      ['El "sesgo del hogar" (home bias) es un error cognitivo frecuente en inversores. ¿En qué consiste?', 'Sobreponderar las acciones del país donde se vive respecto a su peso en el mercado global', CE],
      ['La estrategia "buy and hold" vs. "market timing". ¿Qué muestra la evidencia académica?', 'El market timing consistente y rentable después de costes es prácticamente imposible; buy and hold supera a la mayoría de estrategias activas', CE],
      ['¿Qué significa que una acción tenga un PER de 25?', 'Que los inversores pagan 25 euros por cada euro de beneficio anual de la empresa', VA],
      ['¿Qué ventaja tiene el múltiplo EV/EBITDA sobre el PER para comparar empresas?', 'Neutraliza el efecto de la estructura de capital (deuda) y los impuestos, permitiendo comparar empresas con diferente apalancamiento', VA],
      ['En un modelo DCF (Descuento de Flujos de Caja), ¿qué ocurre si aumentas la tasa de descuento?', 'El valor de la empresa disminuye porque los flujos futuros valen menos en el presente', VA],
      ['¿Qué es el "margen de seguridad" en la filosofía de inversión value?', 'La diferencia entre el precio de mercado y el valor intrínseco estimado, que actúa como colchón ante errores de valoración', VA],
      ['El ratio P/B (Price to Book) es especialmente relevante para valorar empresas de ciertos sectores. ¿En cuáles?', 'Bancos, aseguradoras y empresas con activos tangibles relevantes', VA],
    ] as [string, string, Cat][]
  ).map(([e, c, cat]) => [norm(e), { correcta: norm(c), cat }]),
);

async function abrir(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
    } catch {
      /* sin almacenamiento: saldrá el aviso de transparencia */
    }
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(RUTA);
  await expect(page.locator('h1')).toHaveText('📈 Quiz Conceptos de Inversión');
  // Sin <input>: la espera que vale es la de la página con la hidratación confirmada.
  await esperarPaginaAsentada(page);
}

const opciones = (page: Page): Locator => page.locator('div[class*="_opciones"] > button');
const enunciado = (page: Page): Locator => page.locator('p[class*="_pregunta"]');
const contador = (page: Page): Locator => page.locator('span[class*="_contador"]');
const insignia = (page: Page): Locator => page.locator('span[class*="_categoriaBadge"]');
const veredicto = (page: Page): Locator => page.locator('p[class*="_feedbackTitulo"]');
const explicacion = (page: Page): Locator => page.locator('p[class*="_feedbackExplicacion"]');
const tarjeta = (page: Page): Locator => page.locator('div[class*="_resultadoTarjeta"]');
const empezar = (page: Page): Locator => page.getByRole('button', { name: 'Empezar quiz →' });
const siguiente = (page: Page): Locator => page.getByRole('button', { name: /Siguiente pregunta|Ver resultado/ });

const claseTermina = (clases: string, nombre: string): boolean =>
  clases.split(/\s+/).some((c) => c === nombre || c.endsWith(`_${nombre}`));

async function textosOpcion(page: Page): Promise<string[]> {
  const brutos = await opciones(page).evaluateAll((bs) =>
    bs.map((b) => {
      const letra = b.querySelector('[class*="_opcionLetra"]')?.textContent ?? '';
      return (b.textContent ?? '').slice(letra.length);
    }),
  );
  return brutos.map(norm);
}

async function preguntaVisible(page: Page): Promise<{ texto: string; iC: number; cat: Cat }> {
  const texto = norm(await enunciado(page).innerText());
  const k = CLAVE.get(texto);
  expect(k, `enunciado que no está en la clave: «${texto}»`).toBeTruthy();
  const ops = await textosOpcion(page);
  const iC = ops.indexOf(k!.correcta);
  expect(iC, `la correcta «${k!.correcta}» no está entre ${JSON.stringify(ops)}`).toBeGreaterThanOrEqual(0);
  return { texto, iC, cat: k!.cat };
}

type Modo = 'bien' | 'mal' | number;

/** Contesta la pregunta visible: bien, mal (la A, o la B si la A fuera la buena) o la opción N. */
async function responder(page: Page, modo: Modo): Promise<boolean> {
  const { iC, cat } = await preguntaVisible(page);
  await expect(insignia(page)).toContainText(cat);
  const i = typeof modo === 'number' ? modo : modo === 'bien' ? iC : iC === 0 ? 1 : 0;
  await opciones(page).nth(i).click();
  // La clave de la app coincide con la cotejada a mano: «Correcto» solo si se pulsó la buena
  await expect(veredicto(page)).toHaveText(i === iC ? /^\s*✅?\s*Correcto$/ : /^\s*❌?\s*Incorrecto$/);
  return i === iC;
}

/** Juega hasta el resultado; `plan(texto, cat)` dice cómo contestar cada pregunta. Devuelve los aciertos. */
async function jugar(page: Page, total: number, plan: (texto: string, cat: Cat) => Modo): Promise<number> {
  let aciertos = 0;
  for (let n = 1; n <= total; n++) {
    await expect(contador(page)).toHaveText(`${n} / ${total}`);
    const { texto, cat } = await preguntaVisible(page);
    if (await responder(page, plan(texto, cat))) aciertos++;
    const rotulo = norm(await siguiente(page).innerText());
    expect(rotulo, `rótulo del botón en la pregunta ${n}`).toBe(n === total ? 'Ver resultado →' : 'Siguiente pregunta →');
    await siguiente(page).click();
  }
  await expect(tarjeta(page)).toBeVisible();
  return aciertos;
}

async function resultado(page: Page) {
  await expect(tarjeta(page)).toBeVisible();
  return page.evaluate(() => {
    const t = (n: Element | null | undefined): string => (n?.textContent ?? '').replace(/[\s ]+/g, ' ').trim();
    const tj = document.querySelector('div[class*="_resultadoTarjeta"]');
    return {
      icono: t(tj?.querySelector('[class*="_resultadoIcono"]')),
      puntuacion: t(tj?.querySelector('h2')),
      pct: t(tj?.querySelector('[class*="_resultadoPct"]')).replace(/(\d) %/g, '$1%'),
      nivel: t(tj?.querySelector('[class*="_resultadoClasif"]')),
      categorias: [...document.querySelectorAll('div[class*="_desgloseItem"]')].map(
        (d) => `${t(d.querySelector('span'))} ${t(d.querySelector('[class*="_desgloseScore"]'))}`,
      ),
    };
  });
}

async function empezarExamen(page: Page): Promise<void> {
  await expect(page.getByRole('button', { name: /Examen completo/ })).toHaveAttribute('aria-pressed', 'true');
  await empezar(page).click();
  await expect(contador(page)).toHaveText('1 / 25');
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Quiz Conceptos de Inversión · partida', () => {
  /**
   * CASO NORMAL — examen: bien todas salvo las 5 de Fondos y ETF, el «sesgo del hogar» y el «buy
   * and hold». Esperado a mano: 25 − 7 = 18 aciertos → 18 / 25 = 72 % → tramo ≥ 60 → 👍 «Nivel
   * intermedio — base sólida para seguir aprendiendo». Por categoría: Riesgo 5/5 · Renta fija 5/5
   * · Fondos 0/5 · Cartera 3/5 · Valoración 5/5.
   */
  test('caso normal: 18 de 25 dan «18 / 25», 72 % y «Nivel intermedio»', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await empezarExamen(page);
    const aciertos = await jugar(page, 25, (texto, cat) =>
      cat === FE || /sesgo del hogar|buy and hold/.test(texto) ? 'mal' : 'bien',
    );
    expect(aciertos).toBe(18);
    const r = await resultado(page);
    expect(r.puntuacion).toBe('18 / 25');
    expect(r.pct).toBe('72% de respuestas correctas');
    expect(r.nivel).toBe('Nivel intermedio — base sólida para seguir aprendiendo');
    expect(r.icono).toBe('👍');
    expect(r.categorias).toEqual([
      '📊 Riesgo y Rentabilidad 5/5',
      '📄 Renta Fija y Bonos 5/5',
      '🏦 Fondos y ETF 0/5',
      '⚖️ Cartera y Estrategia 3/5',
      '🔍 Valoración de Activos 5/5',
    ]);
  });

  /**
   * CASO LÍMITE — todo mal, «Volver a empezar» sin recargar y todo bien.
   * Esperado a mano: 0 / 25 → 0 % → 🌱 «Nivel inicial…», las 5 categorías a 0/5; «Volver a
   * empezar» vuelve a la pantalla de inicio con el examen elegido, sin recargar (conserva una marca
   * en window); «Empezar» da «1 / 25» sin respuesta; 25 / 25 → 100 % → 🏆 «Experto en inversión».
   */
  test('caso límite: 0 de 25, «Volver a empezar» sin recargar y 25 de 25', async ({ page }) => {
    test.setTimeout(150_000);
    await abrir(page);
    await page.evaluate(() => {
      (window as unknown as { __marca: string }).__marca = 'sin-recarga';
    });
    await empezarExamen(page);
    expect(await jugar(page, 25, () => 'mal')).toBe(0);
    let r = await resultado(page);
    expect(r.puntuacion).toBe('0 / 25');
    expect(r.pct).toBe('0% de respuestas correctas');
    expect(r.nivel).toBe('Nivel inicial — empieza por el quiz básico de finanzas');
    expect(r.icono).toBe('🌱');
    expect(r.categorias).toHaveLength(5);
    expect(r.categorias.every((c) => / 0\/5$/.test(c)), r.categorias.join(' · ')).toBe(true);

    await page.getByRole('button', { name: '↺ Volver a empezar' }).click();
    await empezarExamen(page);
    await expect(veredicto(page)).toHaveCount(0);
    for (let i = 0; i < 4; i++) await expect(opciones(page).nth(i)).toBeEnabled();
    expect(await page.evaluate(() => (window as unknown as { __marca?: string }).__marca)).toBe('sin-recarga');

    expect(await jugar(page, 25, () => 'bien')).toBe(25);
    r = await resultado(page);
    expect(r.puntuacion).toBe('25 / 25');
    expect(r.pct).toBe('100% de respuestas correctas');
    expect(r.nivel).toBe('Experto en inversión');
    expect(r.icono).toBe('🏆');
  });

  /**
   * UMBRALES — los bordes de `clasificacion()` con 25 preguntas (4 % por acierto):
   * 24 → 96 % avanzado · 20 → 80 % avanzado · 19 → 76 % intermedio · 15 → 60 % intermedio ·
   * 14 → 56 % básico-medio · 10 → 40 % básico-medio · 9 → 36 % inicial.
   */
  test('umbrales: 24, 20, 19, 15, 14, 10 y 9 aciertos caen en su tramo', async ({ page }) => {
    test.setTimeout(300_000);
    await abrir(page);
    const tramos: [number, string][] = [
      [24, 'Nivel avanzado — listo para construir cartera propia'],
      [20, 'Nivel avanzado — listo para construir cartera propia'],
      [19, 'Nivel intermedio — base sólida para seguir aprendiendo'],
      [15, 'Nivel intermedio — base sólida para seguir aprendiendo'],
      [14, 'Nivel básico-medio — repasa los conceptos clave'],
      [10, 'Nivel básico-medio — repasa los conceptos clave'],
      [9, 'Nivel inicial — empieza por el quiz básico de finanzas'],
    ];
    for (const [k, nivel] of tramos) {
      await empezarExamen(page);
      let n = 0;
      expect(await jugar(page, 25, () => (++n <= k ? 'bien' : 'mal'))).toBe(k);
      const r = await resultado(page);
      expect(r.puntuacion).toBe(`${k} / 25`);
      expect(r.pct).toBe(`${k * 4}% de respuestas correctas`);
      expect(r.nivel, `${k} aciertos`).toBe(nivel);
      await page.getByRole('button', { name: '↺ Volver a empezar' }).click();
    }
  });

  /**
   * PRÁCTICA — «Fondos y ETF», 4 bien y la última mal. Esperado a mano: 5 preguntas, todas con la
   * insignia «Fondos y ETF»; 4 / 5 = 80 % → 🌟 «Nivel avanzado…»; el desglose solo trae su categoría.
   */
  test('práctica por categoría: 4 de 5 en «Fondos y ETF» dan 80 % y solo esa categoría', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await page.getByRole('button', { name: /Práctica por categoría/ }).click();
    await page.getByRole('button', { name: 'Fondos y ETF' }).click();
    await expect(page.getByRole('button', { name: 'Fondos y ETF' })).toHaveAttribute('aria-pressed', 'true');
    await empezar(page).click();
    let n = 0;
    expect(await jugar(page, 5, (_t, cat) => (expect(cat).toBe(FE), ++n <= 4 ? 'bien' : 'mal'))).toBe(4);
    const r = await resultado(page);
    expect(r.puntuacion).toBe('4 / 5');
    expect(r.pct).toBe('80% de respuestas correctas');
    expect(r.nivel).toBe('Nivel avanzado — listo para construir cartera propia');
    expect(r.categorias).toEqual(['🏦 Fondos y ETF 4/5']);
  });

  /**
   * LO QUE DEBE IGNORARSE — doble clic en la correcta y un clic tardío en otra opción.
   * Esperado a mano: `responder` sale si el estado no es «jugando» y las opciones quedan disabled →
   * sigue «Correcto», una sola opción en verde y ninguna en rojo; jugando el resto mal, 1 / 25 =
   * 4 % → 🌱 «Nivel inicial». A 1280×800, donde el 2.º clic no cae en «Siguiente» (medido 0 de 25;
   * el salto de la explicación se mide aparte).
   */
  test('caso de rechazo: la segunda respuesta a la misma pregunta no cuenta', async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1280, height: 800 });
    await abrir(page);
    await empezarExamen(page);
    const { iC } = await preguntaVisible(page);
    await opciones(page).nth(iC).dblclick();
    await opciones(page)
      .nth(iC === 0 ? 1 : 0)
      .click({ force: true });
    await expect(veredicto(page)).toHaveText(/Correcto$/);
    await expect(contador(page)).toHaveText('1 / 25');
    const clases = await opciones(page).evaluateAll((bs) => bs.map((b) => b.className));
    expect(clases.filter((c) => claseTermina(c, 'opcionCorrecta'))).toHaveLength(1);
    expect(clases.filter((c) => claseTermina(c, 'opcionIncorrecta')), 'el clic tardío ha marcado otra opción').toHaveLength(0);
    await siguiente(page).click();
    let aciertos = 1;
    for (let n = 2; n <= 25; n++) {
      await expect(contador(page)).toHaveText(`${n} / 25`);
      if (await responder(page, 'mal')) aciertos++;
      await siguiente(page).click();
    }
    expect(aciertos).toBe(1);
    const r = await resultado(page);
    expect(r.puntuacion).toBe('1 / 25'); // 1 acierto pese a 3 clics en la P1
    expect(r.pct).toBe('4% de respuestas correctas');
    expect(r.nivel).toBe('Nivel inicial — empieza por el quiz básico de finanzas');
  });

  /** Invariante de la familia: foco al enunciado (tabindex -1) tras «Empezar» y «Siguiente»; opciones sin aria-pressed. */
  test('sano · foco tras «Empezar», «Siguiente» y «Ver resultado»; opciones sin aria-pressed', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    const enfocado = (sel: string) => page.evaluate((s) => document.activeElement === document.querySelector(s), sel);
    await empezar(page).focus();
    await page.keyboard.press('Enter');
    await expect(contador(page)).toHaveText('1 / 25');
    await expect.poll(() => enfocado('p[class*="_pregunta"]'), { message: 'foco tras «Empezar»' }).toBe(true);
    for (let n = 1; n <= 25; n++) {
      expect(await opciones(page).evaluateAll((bs) => bs.filter((b) => b.hasAttribute('aria-pressed')).length)).toBe(0);
      const { iC } = await preguntaVisible(page);
      await opciones(page).nth(iC).focus();
      await page.keyboard.press('Enter');
      await expect(veredicto(page)).toBeVisible();
      expect(await opciones(page).evaluateAll((bs) => bs.filter((b) => b.hasAttribute('aria-pressed')).length)).toBe(0);
      // Tras responder, el foco va a «Siguiente» (la opción pulsada queda disabled)
      await expect.poll(() => page.evaluate(() => (document.activeElement?.textContent ?? '').trim())).toMatch(/Siguiente pregunta|Ver resultado/);
      await page.keyboard.press('Enter');
      if (n < 25) {
        await expect(contador(page)).toHaveText(`${n + 1} / 25`);
        await expect.poll(() => enfocado('p[class*="_pregunta"]'), { message: `foco tras «Siguiente» ${n}` }).toBe(true);
        await expect(enunciado(page)).toHaveAttribute('tabindex', '-1');
      }
    }
    await expect.poll(() => enfocado('div[class*="_resultadoTarjeta"]'), { message: 'foco tras «Ver resultado»' }).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * DOBLE TOQUE (invariante de la familia, cabo C0082). Ratón de verdad, como el testigo
 * tests/familias/quizzes.spec.ts: 1.er clic suelto en el centro del botón, esperar a que la
 * pantalla NUEVA esté pintada y el 2.º clic de la ráfaga (`detail` 2) en el mismo punto.
 */
async function rafaga(page: Page, boton: Locator, pintada: () => Promise<boolean>, paso: string): Promise<string[]> {
  const url = page.url();
  const guia = (): Locator => page.getByRole('button', { name: /guía educativa/i });
  const foto = async () =>
    [
      (await contador(page).count()) ? norm(await contador(page).innerText()) : '-',
      await veredicto(page).count(),
      await tarjeta(page).count(),
      await empezar(page).count(),
      await guia().getAttribute('aria-expanded'),
    ].join('|');
  await boton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  const caja = await boton.boundingBox();
  if (!caja) throw new Error(`${paso}: el botón no tiene caja`);
  const [x, y] = [caja.x + caja.width / 2, caja.y + caja.height / 2];
  await page.mouse.move(x, y);
  await page.mouse.down({ clickCount: 1 });
  await page.mouse.up({ clickCount: 1 });
  await expect.poll(pintada, { intervals: [20], timeout: 3000, message: `${paso}: el primer toque cambia de pantalla` }).toBe(true);
  await page.waitForTimeout(80);
  const antes = await foto();
  await page.mouse.down({ clickCount: 2 });
  await page.mouse.up({ clickCount: 2 });
  await page.waitForTimeout(400);
  if (page.url() !== url) return [`${paso}: saca de la app (${page.url()})`];
  const despues = await foto();
  return despues === antes ? [] : [`${paso}: ${antes} → ${despues}`];
}

test.describe('Inspector 28/10/2026 · doble toque', () => {
  /**
   * La app usa `useGuardaRafaga` (page.tsx:416, en captura sobre window) en «Empezar», «Siguiente»,
   * «Ver resultado» y «Volver a empezar». Medido el 28/10/2026 a 360, 375, 390, 412, 768, 1280×720,
   * 1280×800 y 1920: 0 efectos, también cuando el 2.º toque cae FUERA del quiz (12 de 25 sobre una
   * relacionada a 390×844, la guía educativa a 360-412, la cabecera de la guía a 768-1920).
   */
  for (const [ancho, alto] of [
    [360, 740],
    [412, 915],
    [768, 1024],
    [1280, 800],
  ] as const) {
    test(`sano · ${ancho}×${alto}: ninguna ráfaga en «Empezar», «Siguiente», «Ver resultado» ni «Volver a empezar» hace nada`, async ({ page }) => {
      test.setTimeout(150_000);
      await page.setViewportSize({ width: ancho, height: alto });
      await abrir(page);
      const incidencias: string[] = [];
      incidencias.push(...(await rafaga(page, empezar(page), async () => (await enunciado(page).count()) > 0, 'Empezar')));
      for (let n = 1; n <= 25; n++) {
        if ((await veredicto(page).count()) === 0) await responder(page, 'bien');
        const antes = norm(await enunciado(page).innerText());
        const ultima = n === 25;
        incidencias.push(
          ...(await rafaga(
            page,
            siguiente(page),
            async () => (ultima ? (await tarjeta(page).count()) > 0 : norm(await enunciado(page).innerText().catch(() => '')) !== antes),
            ultima ? 'Ver resultado' : `Siguiente ${n}`,
          )),
        );
      }
      expect((await resultado(page)).puntuacion, 'la nota tras 25 respuestas buenas con ráfagas').toBe('25 / 25');
      incidencias.push(
        ...(await rafaga(page, page.getByRole('button', { name: '↺ Volver a empezar' }), async () => (await empezar(page).count()) > 0, 'Volver a empezar')),
      );
      expect(incidencias).toEqual([]);
    });
  }

  /**
   * Doble toque en una OPCIÓN (fuera del invariante de la familia). Al contestar, el efecto de foco
   * hace `siguienteRef.current?.focus()` SIN preventScroll (page.tsx:485): si «Siguiente» queda bajo
   * el borde, el navegador sube la página y el botón cae bajo el dedo, y el 2.º toque —que la guarda
   * no filtra, porque contestar no cambia de pantalla— lo pulsa: la explicación no se llega a ver.
   * Medido el 28/10/2026: 375×667 → 5 de 25 (2 corridas; en la última pregunta pulsa «Ver
   * resultado») · 360×740 → 2 de 25 (2 corridas) · 390, 412, 768, 1280×720, 1280×800, 1920 → 0.
   */
  test('hallazgo · 375×667: el doble toque en una respuesta no se salta su explicación', async ({ page }) => {
    test.fail();
    test.setTimeout(150_000);
    await page.setViewportSize({ width: 375, height: 667 });
    await abrir(page);
    await empezarExamen(page);
    const saltos: string[] = [];
    for (let n = 1; n <= 25; n++) {
      await expect(contador(page)).toHaveText(`${n} / 25`);
      const { texto, iC } = await preguntaVisible(page);
      const op = opciones(page).nth(iC);
      await op.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
      const caja = await op.boundingBox();
      if (!caja) throw new Error('la opción no tiene caja');
      const [x, y] = [caja.x + caja.width / 2, caja.y + caja.height / 2];
      await page.mouse.move(x, y);
      await page.mouse.down({ clickCount: 1 });
      await page.mouse.up({ clickCount: 1 });
      await expect(veredicto(page)).toBeVisible();
      await page.waitForTimeout(80);
      await page.mouse.down({ clickCount: 2 });
      await page.mouse.up({ clickCount: 2 });
      await page.waitForTimeout(300);
      if ((await veredicto(page).count()) === 0) {
        saltos.push(`P${n} «${texto.slice(0, 40)}…»`);
        if (n === 25) break;
      } else {
        await siguiente(page).click();
      }
    }
    expect(saltos, 'preguntas cuya explicación se saltó el 2.º toque').toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 28/10/2026 · nota, foco y accesibilidad', () => {
  test('hallazgo · tras «Volver a empezar» el foco no cae a <body>', async ({ page }) => {
    // reiniciar() desmonta el botón y el efecto de foco (page.tsx:479-487) no tiene rama para la
    // pantalla de inicio: el foco cae a <body> y con teclado se vuelve al principio de la página.
    test.fail();
    test.setTimeout(120_000);
    await abrir(page);
    await empezarExamen(page);
    await jugar(page, 25, () => 'bien');
    await page.getByRole('button', { name: '↺ Volver a empezar' }).focus();
    await page.keyboard.press('Enter');
    await expect(empezar(page)).toBeVisible();
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
  });

  /**
   * Las opciones no se barajan y la correcta es la B en 15 de 25 y la C en 10: nunca la A ni la D.
   * Pulsar siempre la B: examen → 15 / 25 = 60 % «Nivel intermedio»; práctica «Valoración de
   * Activos» (las 5 son B) → 5 / 5 = 100 % «Experto en inversión». Con las opciones barajadas, una
   * letra fija acierta como Binomial(25; 0,25): P(≥ 15) ≈ 2·10⁻⁵; en 5 preguntas, P(5) ≈ 0,001.
   */
  test('hallazgo · contestar siempre la B no da «Experto en inversión» ni «Nivel intermedio»', async ({ page }) => {
    test.fail();
    test.setTimeout(150_000);
    await abrir(page);
    await page.getByRole('button', { name: /Práctica por categoría/ }).click();
    await page.getByRole('button', { name: 'Valoración de Activos' }).click();
    await empezar(page).click();
    const practica = await jugar(page, 5, () => 1);
    const rp = await resultado(page);
    await page.getByRole('button', { name: '↺ Volver a empezar' }).click();
    await page.getByRole('button', { name: /Examen completo/ }).click();
    await empezarExamen(page);
    const examen = await jugar(page, 25, () => 1);
    const re = await resultado(page);
    const fallos: string[] = [];
    if (practica === 5) fallos.push(`práctica Valoración siempre B → ${rp.puntuacion} «${rp.nivel}»`);
    if (examen >= 15) fallos.push(`examen siempre B → ${re.puntuacion} «${re.nivel}»`);
    expect(fallos).toEqual([]);
  });

  test('hallazgo · el veredicto se anuncia y la correcta se distingue sin depender del color', async ({ page }) => {
    // page.tsx:623-634 — el feedback no está en ninguna región viva y el foco salta a «Siguiente»:
    // con lector de pantalla no se oye «Incorrecto» ni cuál era la buena. La correcta solo cambia de
    // borde y fondo verde (clase opcionCorrecta), sin texto ni aria-label (WCAG 1.4.1). La referencia
    // (quiz-literatura-universal) usa role="status" y un aria-label con la marca.
    test.fail();
    await abrir(page);
    await empezarExamen(page);
    const { iC } = await preguntaVisible(page);
    await opciones(page).nth(iC === 0 ? 1 : 0).focus();
    await page.keyboard.press('Enter');
    await expect(veredicto(page)).toBeVisible();
    const fallos: string[] = [];
    const vivas = page.locator('main :is([aria-live], [role="status"], [role="alert"])');
    if ((await vivas.count()) === 0) fallos.push('sin región viva en el quiz');
    else if (!/Incorrecto/.test(await vivas.first().innerText())) fallos.push('la región viva no lleva el veredicto');
    const nombreCorrecta = await opciones(page)
      .nth(iC)
      .evaluate((b) => b.getAttribute('aria-label') ?? b.textContent ?? '');
    if (!/correcta|✓/i.test(nombreCorrecta)) fallos.push(`la opción buena se anuncia igual que antes: «${nombreCorrecta}»`);
    expect(fallos).toEqual([]);
  });

  test('hallazgo · la insignia de categoría y las cifras del resultado tienen contraste suficiente', async ({ page }) => {
    // Colores de CATEGORIAS (page.tsx:49-55) y de clasificacion() en style={{…}}: los candados de
    // contraste no los ven. Insignia: texto blanco 12,8 px bold (pide 4,5:1) sobre #48A9A6 2,80 ·
    // #27AE60 2,87 · #E07B39 2,97 · #2E86AB 4,11 (solo #8E44AD, 5,87, cumple). Puntuación 40 px
    // (pide 3:1) en claro: #F39C12 (100 %) 2,19 · #27AE60 (≥ 80 %) 2,87 · #E07B39 (≥ 40 %) 2,97.
    test.fail();
    test.setTimeout(120_000);
    await abrir(page);
    await empezarExamen(page);
    type ConContraste = { __contraste: (e: Element) => number };
    await page.evaluate(() => {
      const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number).slice(0, 3);
      const lum = ([r, g, b]: number[]) => {
        const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      // El color de destino se lee del style={{…}} del propio elemento: el calculado puede ir aún
      // en transición desde el de la pregunta anterior.
      (window as unknown as ConContraste).__contraste = (el: Element): number => {
        let fondo = [255, 255, 255];
        for (let n: Element | null = el; n; n = n.parentElement) {
          const propio = (n as HTMLElement).style?.backgroundColor;
          const v = ((propio || getComputedStyle(n).backgroundColor).match(/[\d.]+/g) ?? []).map(Number);
          if (v.length === 3 || (v.length === 4 && v[3] > 0.5)) {
            fondo = v.slice(0, 3);
            break;
          }
        }
        const [a, b] = [lum(rgb((el as HTMLElement).style?.color || getComputedStyle(el).color)), lum(fondo)];
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      };
    });
    const bajos: string[] = [];
    for (let n = 1; n <= 25; n++) {
      const { cat } = await preguntaVisible(page);
      await expect(insignia(page)).toContainText(cat);
      const r = await insignia(page).evaluate((el) => (window as unknown as ConContraste).__contraste(el));
      if (r < 4.5) bajos.push(`insignia ${cat} ${r.toFixed(2)}`);
      await responder(page, 'bien');
      await siguiente(page).click();
    }
    const rh2 = await page
      .locator('h2[class*="_resultadoPuntuacion"]')
      .evaluate((el) => (window as unknown as ConContraste).__contraste(el));
    if (rh2 < 3) bajos.push(`puntuación 25 / 25 ${rh2.toFixed(2)}`);
    expect([...new Set(bajos)]).toEqual([]);
  });

  test('hallazgo · el emoji de la insignia de categoría va con aria-hidden', async ({ page }) => {
    // page.tsx:584 — `{icono} {label}` en el mismo <span>: el lector lee «gráfico de barras Riesgo
    // y Rentabilidad» (CLAUDE.md §5: emoji junto a texto → <span aria-hidden="true">).
    test.fail();
    await abrir(page);
    await empezarExamen(page);
    const ocultos = await insignia(page).locator('[aria-hidden="true"]').count();
    expect(ocultos).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 28/10/2026 · banco', () => {
  /** Recorre las 25 contestando bien y devuelve {enunciado → explicación} y todos los textos crudos. */
  async function leerBanco(page: Page): Promise<{ expl: Map<string, string>; crudos: string[] }> {
    await empezarExamen(page);
    const expl = new Map<string, string>();
    const crudos: string[] = [];
    for (let n = 1; n <= 25; n++) {
      const texto = norm(await enunciado(page).innerText());
      crudos.push(await enunciado(page).evaluate((e) => e.textContent ?? ''));
      crudos.push(...(await opciones(page).evaluateAll((bs) => bs.map((b) => b.textContent ?? ''))));
      await responder(page, 'bien');
      const e = await explicacion(page).evaluate((el) => el.textContent ?? '');
      crudos.push(e);
      expl.set(texto, norm(e));
      await siguiente(page).click();
    }
    crudos.push(await page.locator('p[class*="_resultadoPct"]').evaluate((e) => e.textContent ?? ''));
    return { expl, crudos };
  }
  const buscar = (m: Map<string, string>, inicio: RegExp): string => [...m].find(([k]) => inicio.test(k))?.[1] ?? '';

  /**
   * P «¿Qué es el TER…?»: «A 30 años con un 7% bruto: TER 0,10% → 7,6x capital; TER 1,5% → 5,6x».
   * A mano: (1,07 − 0,001)^30 = 1,069^30 = 7,40 · (1,07 − 0,015)^30 = 1,055^30 = 4,98 (con la
   * comisión multiplicativa, 1,07·0,999 y 1,07·0,985: 7,39 y 4,84). El 7,6x es el 7 % SIN comisión
   * (1,07^30 = 7,61) y el 5,6x corresponde a un 5,9 % neto.
   */
  test('hallazgo · las cifras del TER a 30 años cuadran con el 7 % menos la comisión', async ({ page }) => {
    test.fail();
    test.setTimeout(120_000);
    expect(1.069 ** 30).toBeCloseTo(7.4, 1);
    expect(1.055 ** 30).toBeCloseTo(4.98, 1);
    await abrir(page);
    const { expl } = await leerBanco(page);
    const ter = buscar(expl, /^¿Qué es el TER/);
    const m = ter.match(/TER 0,10% → ([\d,]+)x capital; TER 1,5% → ([\d,]+)x/);
    expect(m, ter).not.toBeNull();
    const [bajo, alto] = [Number(m![1].replace(',', '.')), Number(m![2].replace(',', '.'))];
    expect(Math.abs(bajo - 7.4), `TER 0,10 % → ${m![1]}x`).toBeLessThanOrEqual(0.1);
    expect(alto >= 4.8 && alto <= 5.05, `TER 1,5 % → ${m![2]}x`).toBe(true);
  });

  test('hallazgo · el tipo del ahorro de los repartos es el de data/fiscal (19 % a 30 %)', async ({ page }) => {
    // P «Un fondo de acumulación vs…»: «cada reparto tributa como rendimiento del capital mobiliario
    // (19–28% según tramo)». La escala del ahorro (LIRPF art. 66, redacción de la Ley 7/2024 con
    // efectos 1/1/2025) es TRAMOS_GANANCIAS_PATRIMONIALES_2025 de data/fiscal/inmuebles.ts: 19-30 %.
    test.fail();
    test.setTimeout(120_000);
    const minimo = TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo;
    const maximo = TRAMOS_GANANCIAS_PATRIMONIALES_2025.at(-1)!.tipo;
    expect([minimo, maximo]).toEqual([19, 30]);
    await abrir(page);
    const { expl } = await leerBanco(page);
    const p = buscar(expl, /^Un fondo de acumulación/);
    expect(p).toMatch(/rendimiento del capital mobiliario/);
    expect(p).toContain(`${minimo}–${maximo}%`);
  });

  test('hallazgo · la explicación del DCF no dice que el denominador baja al subir la tasa', async ({ page }) => {
    // «Cuanto mayor la tasa de descuento r, menor el denominador → menor el valor presente»: con
    // VP = F / (1 + r)^t, subir r AGRANDA el denominador (1,10² = 1,21 > 1,05² = 1,1025).
    test.fail();
    test.setTimeout(120_000);
    expect(1.1 ** 2).toBeGreaterThan(1.05 ** 2);
    await abrir(page);
    const { expl } = await leerBanco(page);
    expect(buscar(expl, /^En un modelo DCF/)).not.toMatch(/mayor la tasa de descuento r, menor el denominador/);
  });

  test('hallazgo · Fama y French no «documentaron» el momentum ni la calidad', async ({ page }) => {
    // «valor (P/B bajo), momentum (subidas recientes), calidad (…), tamaño (small caps) y baja
    // volatilidad. Fama y French documentaron los tres primeros factores»: los tres primeros de la
    // lista son valor, momentum y calidad; el modelo de tres factores de Fama y French (1993) es
    // mercado, tamaño y valor, y el momentum lo añadió Carhart (1997).
    test.fail();
    test.setTimeout(120_000);
    await abrir(page);
    const { expl } = await leerBanco(page);
    const p = buscar(expl, /^¿Qué es el "factor investing"/);
    expect(p).toMatch(/valor \(P\/B bajo\), momentum/);
    expect(p).not.toMatch(/Fama y French documentaron los tres primeros factores/);
  });

  test('hallazgo · el porcentaje va separado del número con espacio duro («35 %»)', async ({ page }) => {
    // Regla de formato del 25/09/2026 (Ortografía RAE 2010): «sube un 10%», «del 35%», «Un 53,8%»,
    // «19–28%», «0,05–0,20%» y «100% de respuestas correctas» en el resultado.
    test.fail();
    test.setTimeout(120_000);
    await abrir(page);
    const { crudos } = await leerBanco(page);
    expect(crudos.filter((t) => /\d%/.test(t)).length).toBe(0);
  });

  test('hallazgo · cifras populares sin fuente (neutralidad editorial)', async ({ page }) => {
    // CLAUDE.md §1.quinquies, antipatrones 1 y 5:
    //   · «La estrategia "buy and hold"…»: estudios de DALBAR (inversor de EE. UU.) y «Perder los 10
    //     mejores días en 20 años puede reducir la rentabilidad a la mitad», sin fuente, índice ni
    //     periodo (la cifra circula sobre el S&P 500).
    //   · «El "sesgo del hogar"…»: «muchos inversores españoles tienen el 50–70% en bolsa española» y
    //     «rentabilidades históricamente peores que el índice global», sin fuente ni periodo.
    test.fail();
    test.setTimeout(120_000);
    await abrir(page);
    const { expl } = await leerBanco(page);
    const bh = buscar(expl, /^La estrategia "buy and hold"/);
    const hb = buscar(expl, /^El "sesgo del hogar"/);
    const fallos: string[] = [];
    if (/10 mejores días/.test(bh) && !/S&P|MSCI|J\.? ?P\.? Morgan|fuente|entre \d{4} y \d{4}/.test(bh)) fallos.push('10 mejores días sin fuente');
    if (/DALBAR/.test(bh) && !/EE\. ?UU\.|Estados Unidos|estadounidense/.test(bh)) fallos.push('DALBAR sin su origen');
    if (/50–70%/.test(hb) && !/según|fuente|encuesta|CNMV|estudio/.test(hb)) fallos.push('50–70 % sin fuente');
    expect(fallos).toEqual([]);
  });
});
