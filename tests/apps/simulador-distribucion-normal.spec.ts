import { test, expect, Page, Locator } from '@playwright/test';

/**
 * Inspector — simulador-distribucion-normal (segmento cálculo, riesgo 3)
 *
 * Primera inspección: 31/08/2026.
 *
 * QUÉ PROMETE
 *   <h1>: «📊 Simulador de Distribución Normal»
 *   subtítulo: «Mueve la media (μ) y la desviación típica (σ) para ver la curva de Gauss en
 *     tiempo real. Calcula probabilidades, puntuaciones Z y la regla 68-95-99.7.»
 *   bloque educativo: fórmula f(x) = (1/σ√(2π))·e^(−½((x−μ)/σ)²), tipificación Z = (X−μ)/σ,
 *     regla 68-95-99,7 y cinco errores conceptuales frecuentes.
 *
 * DÓNDE VIVE EL CÁLCULO — todo inline en app/simulador-distribucion-normal/page.tsx (no hay
 * módulo de motor aparte, todo son funciones puras en el mismo fichero):
 *   · pdf(x, mu, sigma) — densidad N(μ,σ)
 *   · erf(x) — aproximación de Abramowitz & Stegun 7.1.26 (precisión declarada 1,5·10⁻⁷)
 *   · cdf(x, mu, sigma) = 0,5·(1 + erf((x−μ)/(σ√2))) — función de distribución acumulada
 *   · probabilidad (useMemo): menor → cdf(a) · mayor → 1−cdf(a) · entre → cdf(hi)−cdf(lo)
 *   · zA = (a−mu)/sigma, zB = (b−mu)/sigma
 *   · σ nunca debería poder ser ≤ 0 (la normal no tiene densidad definida ahí): el slider
 *     declara min="0.1" (o problema.sigma·0,2 en modo Problemas tipo).
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — estado por defecto al cargar: N(0,1), P(−1 < X < 1)
 *     Φ(1) = 0,8413 (valor tabulado) → P(−1<X<1) = 2·Φ(1)−1 = 2·0,8413−1 = 0,6826 ≈ 68,27 %
 *     z(a) = (−1−0)/1 = −1,000 · z(b) = (1−0)/1 = 1,000
 *
 *   CASO 2 (límite — σ muy pequeña tras haber fijado a/b para una σ mayor) — se reduce σ de 1
 *     a su mínimo (0,1) SIN tocar a/b (que quedan en −1 y 1, es decir ±10σ de la nueva σ).
 *     El rango de los sliders a/b se recalcula a [−0,45, 0,45] (σ·4,5). Tras la reparación del
 *     hallazgo 574 (02/09/2026), un `useEffect` reclampa a/b al nuevo rango en cuanto cambia,
 *     así que a y b pasan de −1/1 a −0,45/0,45 — YA NO se quedan ancladas fuera del recorrido.
 *       z(a) = (−0,45−0)/0,1 = −4,500 · z(b) = (0,45−0)/0,1 = 4,500
 *       P(−4,5<Z<4,5) = 0,999993… → redondea a 100,00 % / decimal 1,0000 (para z≥4, Φ(z) ya
 *       está a varios nueves de 1, así que el redondeo a 2/4 decimales no distingue este caso
 *       del ±10σ que daba la versión rota).
 *     Consecuencia observable: la etiqueta de "a" y el valor DOM del slider ya coinciden
 *     (−0,45 los dos), así que una flecha de teclado avanza un solo paso —(0,45−(−0,45))/200 =
 *     0,0045— en vez de saltar más de 5σ de golpe.
 *
 *   CASO 3 (rechazo) — intentar fijar σ = 0 o σ negativa
 *     La normal exige σ > 0. El slider declara min="0.1": escribir "0" o "-5" directamente en
 *     el <input type="range"> debe clampar al mínimo (0,1), nunca aceptar el valor inválido.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * ── Reparado 02/09/2026 (hallazgo 574) ───────────────────────────────────────────────────
 *   Antes: al reducir σ después de haber fijado a/b para una σ mayor, el slider de "a" (o "b")
 *   se desincronizaba — el navegador clampaba su valor DOM al nuevo extremo del recorrido
 *   mientras React seguía mostrando el valor anterior, que ya no cabía en ese recorrido. La
 *   siguiente interacción (incluida una sola flecha de teclado) producía entonces un salto
 *   brusco en a/b, en vez de un cambio gradual de un paso.
 *   Ahora: un `useEffect` que depende de `rango` (a su vez de `mu`/`sigma`) reclampa `a` y `b`
 *   al nuevo `[rango.xMin, rango.xMax]` en cuanto el rango cambia, así que el estado de React
 *   nunca queda por detrás de lo que el propio slider puede mostrar. Ver CASO 2.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

const RUTA = '/simulador-distribucion-normal/';

const resultsPanel = (page: Page) => page.locator('[role="status"]');
const probLabel = (page: Page) =>
  page.locator('[class$="__resultCardMain"] [class$="__resultLabel"]');
const probValueLarge = (page: Page) => page.locator('[class$="__resultValueLarge"]');
const probDecimal = (page: Page) => page.locator('[class$="__resultDecimal"]');

/** Tarjeta .resultCard (Z(a) o Z(b), nunca la .resultCardMain — el sufijo $= las distingue). */
function tarjetaZ(page: Page, cual: 'Z(a)' | 'Z(b)'): Locator {
  return page.locator('[class$="__resultCard"]').filter({ hasText: cual });
}
function valorZ(page: Page, cual: 'Z(a)' | 'Z(b)'): Locator {
  return tarjetaZ(page, cual).locator('[class$="__resultValue"]');
}

const sigmaInput = (page: Page) => page.getByLabel('Desviación típica σ');
const aInput = (page: Page) => page.getByLabel('Valor a');

/**
 * Mueve un slider con el setter nativo. Un <input type="range"> no acepta fill() (lanza
 * "Malformed value: 3"), y arrastrar con el ratón no da un valor exacto — mismo patrón que
 * simulador-movimiento-circular.spec.ts. El propio navegador clampa a [min,max]: es justo lo
 * que el CASO 3 quiere observar.
 */
async function mover(input: Locator, valor: number | string): Promise<void> {
  await input.evaluate((el, v) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
    setter.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, String(valor));
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.locator('canvas')).toBeVisible();
});

test.describe('CASO 1 (normal) — estado por defecto, N(0,1), P(−1<X<1)', () => {
  test('68,27 %, decimal 0,6827 y z(a)=−1,000 / z(b)=1,000', async ({ page }) => {
    await expect(probLabel(page)).toHaveText('P(-1,00 < X < 1,00)');
    await expect(probValueLarge(page)).toHaveText('68,27 %');
    // Φ(1) tabulado = 0,8413 → 2·0,8413−1 = 0,6826 ≈ 0,6827 (diferencia de redondeo de tabla).
    await expect(probDecimal(page)).toHaveText('= 0,6827');
    await expect(valorZ(page, 'Z(a)')).toHaveText('-1,000');
    await expect(valorZ(page, 'Z(b)')).toHaveText('1,000');
  });
});

test.describe('CASO 2 (límite, reparado) — σ muy pequeña con a/b heredados de una σ mayor', () => {
  test('a/b se reclampan al nuevo rango: el slider "a" y el estado de React quedan sincronizados', async ({
    page,
  }) => {
    // Reduce σ de 1 a su mínimo (0,1) sin tocar a (-1) ni b (1) directamente.
    await mover(sigmaInput(page), 0.1);

    // REPARADO (574): el useEffect reclampa a/b al nuevo rango [-0,45, 0,45] — ya no
    // se quedan ancladas en -1/1, fuera del recorrido visible del slider.
    await expect(aInput(page)).toHaveAttribute('min', '-0.45');
    await expect(aInput(page)).toHaveValue('-0.45');
    await expect(probLabel(page)).toContainText('-0,45');
    await expect(probLabel(page)).not.toContainText('-1,00');

    // z(a)=-4,500 y z(b)=4,500 (antes ±10): la probabilidad sigue redondeando a 100,00 %/1,0000,
    // porque para z≥4 la cola ya está a varios nueves de 1.
    await expect(probValueLarge(page)).toHaveText('100,00 %');
    await expect(probDecimal(page)).toHaveText('= 1,0000');
    await expect(valorZ(page, 'Z(a)')).toHaveText('-4,500');
    await expect(valorZ(page, 'Z(b)')).toHaveText('4,500');

    // Consecuencia: una flecha de teclado ahora avanza UN SOLO paso del slider
    // ((0,45-(-0,45))/200 = 0,0045), no un salto de más de 5σ de golpe.
    await aInput(page).focus();
    await aInput(page).press('ArrowRight');
    await expect(aInput(page)).toHaveValue('-0.4455');
    await expect(valorZ(page, 'Z(a)')).toHaveText('-4,455');
    await expect(probLabel(page)).toContainText('-0,446');
  });
});

test.describe('CASO 3 (rechazo) — σ = 0 o σ negativa nunca se aceptan', () => {
  test('el slider clampa cualquier intento de σ ≤ 0 al mínimo declarado (0,1)', async ({ page }) => {
    await expect(sigmaInput(page)).toHaveAttribute('min', '0.1');

    await mover(sigmaInput(page), 0);
    await expect(sigmaInput(page)).toHaveValue('0.1');

    await mover(sigmaInput(page), -5);
    await expect(sigmaInput(page)).toHaveValue('0.1');

    // Con σ=0,1 (el mínimo válido) el panel sigue dando números finitos, sin NaN ni Infinity.
    const texto = await resultsPanel(page).innerText();
    expect(texto).not.toContain('NaN');
    expect(texto).not.toContain('Infinity');
  });
});
