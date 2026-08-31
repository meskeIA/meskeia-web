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
 *     Resuelto a mano: z(a) = (−1−0)/0,1 = −10 · z(b) = (1−0)/0,1 = 10.
 *       P(−10<Z<10) ≈ Φ(10)−Φ(−10) ≈ 1 (para z≥4, Φ(z) ya está a varios nueves de 1) → ≈100,00%
 *     Esta aritmética SALE correcta y coincide con lo que muestra la app: el hallazgo no está
 *     en el número. Está en que el propio <input type="range"> de "a" recalcula su min/max a
 *     partir de la nueva σ (ahora [−0,45, 0,45]) y el navegador clampa su valor DOM a −0,45,
 *     mientras el estado de React —y por tanto la etiqueta y el cálculo— se queda anclado en
 *     −1, un valor que ya ni cabe en el rango visible del propio slider. El pomo queda pegado
 *     al borde izquierdo mientras la etiqueta de encima sigue diciendo "-1,00". Un solo toque
 *     de teclado (flecha derecha) sobre ese slider desincronizado hace que "a" salte de −1,000
 *     a −0,446 de golpe —más de 5σ en una sola pulsación—, porque el navegador retoma como
 *     punto de partida el valor DOM clampado (−0,45), no el −1 que el panel mostraba.
 *
 *   CASO 3 (rechazo) — intentar fijar σ = 0 o σ negativa
 *     La normal exige σ > 0. El slider declara min="0.1": escribir "0" o "-5" directamente en
 *     el <input type="range"> debe clampar al mínimo (0,1), nunca aceptar el valor inválido.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * HALLAZGOS
 *
 *   1 [operativa/medio] Al reducir σ después de haber fijado a/b para una σ mayor, el slider
 *     de "a" (o "b") se desincroniza: su posición visual queda clampada al nuevo extremo del
 *     recorrido mientras React sigue usando —y mostrando en la etiqueta— el valor anterior,
 *     que ya no cabe en ese recorrido. La siguiente interacción con ese slider (incluida una
 *     sola flecha de teclado) provoca entonces un salto brusco e inesperado en a/b, en lugar
 *     de un cambio gradual de un paso. Reproducible con cualquier σ ordinaria + arrastre hacia
 *     abajo, no requiere ninguna combinación rebuscada. Ver CASO 2.
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

test.describe('CASO 2 (límite) — σ muy pequeña con a/b heredados de una σ mayor', () => {
  test('la aritmética sigue siendo correcta (≈100 %, z=±10) pero el slider "a" se desincroniza del estado', async ({
    page,
  }) => {
    // Reduce σ de 1 a su mínimo (0,1) sin tocar a (-1) ni b (1).
    await mover(sigmaInput(page), 0.1);

    // La aritmética, dado a=-1, b=1, sigma=0.1, sigue siendo correcta: z=±10, P≈100%.
    await expect(probValueLarge(page)).toHaveText('100,00 %');
    await expect(probDecimal(page)).toHaveText('= 1,0000');
    await expect(valorZ(page, 'Z(a)')).toHaveText('-10,000');
    await expect(valorZ(page, 'Z(b)')).toHaveText('10,000');

    // HALLAZGO: el propio <input> de "a" ha clampado su valor DOM al nuevo mínimo del
    // recorrido (-0,45), pero la etiqueta de arriba (calculada desde el estado de React)
    // sigue diciendo "-1,00" — un valor que ya no cabe en el propio slider.
    await expect(aInput(page)).toHaveAttribute('min', '-0.45');
    await expect(aInput(page)).toHaveValue('-0.45');
    await expect(probLabel(page)).toContainText('-1,00');

    // Consecuencia: un solo toque de teclado sobre ese slider desincronizado provoca un salto
    // de más de 5σ (-1,000 → -0,446), no un cambio gradual de un paso.
    await aInput(page).focus();
    await aInput(page).press('ArrowRight');
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
