import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * visualizador-trigonometria — Inspector, 25/09/2026 (primera inspección)
 *
 * Lo que promete: «Identidades y Razones Trigonométricas». Círculo unitario con las razones
 * del ángulo θ en cuatro tarjetas (sen, cos, tan, sen²+cos²), gráficas A·f(ωx + φ) y tabla
 * de valores exactos. La FAQ de la propia página dice que en 90° «la tangente muestra ∞».
 *
 * EL RIESGO PROPIO DE ESTA APP: calcula con `Math.sin/cos/tan` sobre θ·π/180, y π/2 no es
 * representable en binario. `Math.cos(π/2)` vale 6,1·10⁻¹⁷ (no 0), así que `Math.tan(π/2)`
 * es FINITO: 16.331.239.353.195.370. Es la forma del hallazgo 1778 de
 * `calculadora-trigonometria`, ya reparado allí con un motor que reconoce los ángulos
 * cuadrantales en GRADOS (`app/calculadora-trigonometria/motor.ts`).
 *
 * Valores esperados, a mano:
 *     30°  → sen 1/2 = 0,500 · cos √3/2 = 0,866 · tan √3/3 = 0,577 · rad π/6 = 0,5236 → 0,524
 *     60°  → sen √3/2 = 0,866 · cos 1/2 = 0,500 · tan √3 = 1,732
 *     180° → sen 0 · cos −1 · tan 0 · rad π = 3,14159 → 3,142
 *     90°  → sen 1 · cos 0 · tan NO DEFINIDA  ·  270° → sen −1 · cos 0 · tan NO DEFINIDA
 * El deslizador va de 0 a 360 con paso 1: lo que se sale del rango lo capa el propio control.
 */

const URL_APP = '/visualizador-trigonometria/';

/** «1.234,567» o «−0,500» → número. Solo para las tarjetas, que no llevan otra cosa. */
function aNumero(texto: string): number {
  return Number(texto.trim().replace(/−/g, '-').replace(/\./g, '').replace(',', '.'));
}

/** El número grande de la tarjeta cuyo rótulo es exactamente `nombre`. */
function tarjeta(page: Page, nombre: string): Locator {
  return page
    .locator('[class*="valorCard"]')
    .filter({ has: page.getByText(nombre, { exact: true }) })
    .locator('[class*="valorNumero"]');
}

async function abrirCirculo(page: Page): Promise<void> {
  await page.goto(URL_APP);
  // La pestaña inicial es Identidades: su deslizador sirve de testigo antes del primer clic.
  await esperarHidratacion(page, ['#slider-angulo-i']);
  await page.getByRole('button', { name: /Círculo Unitario/ }).click();
  await esperarHidratacion(page, ['#slider-angulo']);
}

test.describe('Círculo unitario — razones en ángulos notables', () => {
  test.beforeEach(async ({ page }) => {
    await abrirCirculo(page);
  });

  test('30°: sen 0,500 · cos 0,866 · tan 0,577 · sen²+cos² 1,000', async ({ page }) => {
    await sembrarValor(page, '#slider-angulo', 30); // parte de 45
    // sen 30° = 1/2 · cos 30° = √3/2 = 0,86603 · tan 30° = √3/3 = 0,57735 (3 decimales)
    await expect(tarjeta(page, 'sen(θ)')).toHaveText('0,500');
    await expect(tarjeta(page, 'cos(θ)')).toHaveText('0,866');
    await expect(tarjeta(page, 'tan(θ)')).toHaveText('0,577');
    await expect(tarjeta(page, 'sen²+cos²')).toHaveText('1,000');
    await expect(page.locator('[class*="valoresPanel"]')).toContainText('I (sen+, cos+)');
  });

  test('60°: sen 0,866 · cos 0,500 · tan 1,732', async ({ page }) => {
    await sembrarValor(page, '#slider-angulo', 60);
    // sen 60° = √3/2 = 0,86603 · cos 60° = 1/2 · tan 60° = √3 = 1,73205
    await expect(tarjeta(page, 'sen(θ)')).toHaveText('0,866');
    await expect(tarjeta(page, 'cos(θ)')).toHaveText('0,500');
    await expect(tarjeta(page, 'tan(θ)')).toHaveText('1,732');
  });

  test('180°: sen es 0 exacto, no el ruido 1,2246·10⁻¹⁶ de Math.sin(π)', async ({ page }) => {
    await sembrarValor(page, '#slider-angulo', 180);
    const sen = (await tarjeta(page, 'sen(θ)').textContent()) ?? '';
    expect(sen).not.toMatch(/e/i);
    expect(aNumero(sen)).toBe(0);
    // cos 180° = −1 · tan 180° = 0/−1 = 0
    expect(aNumero((await tarjeta(page, 'cos(θ)').textContent()) ?? '')).toBe(-1);
    expect(aNumero((await tarjeta(page, 'tan(θ)').textContent()) ?? '')).toBe(0);
    await expect(page.locator('[class*="valoresPanel"]')).toContainText('Eje X−');
  });

  test('90° y 270°: seno y coseno exactos (±1 y 0)', async ({ page }) => {
    await sembrarValor(page, '#slider-angulo', 90);
    expect(aNumero((await tarjeta(page, 'sen(θ)').textContent()) ?? '')).toBe(1);
    expect(aNumero((await tarjeta(page, 'cos(θ)').textContent()) ?? '')).toBe(0);
    await sembrarValor(page, '#slider-angulo', 270);
    expect(aNumero((await tarjeta(page, 'sen(θ)').textContent()) ?? '')).toBe(-1);
    expect(aNumero((await tarjeta(page, 'cos(θ)').textContent()) ?? '')).toBe(0);
  });

  test('90°: la tangente no está definida', async ({ page }) => {
    // HALLAZGO ABIERTO (Inspector 25/09/2026, forma del 1778 de calculadora-trigonometria):
    // page.tsx:471 publica Math.tan(π/2) = 16331239353195370 porque solo trata como
    // indefinido lo que no es finito (l. 575). Hoy sale «16331239353195370,000».
    // Quitar test.fail() cuando se repare.
    test.fail();
    await sembrarValor(page, '#slider-angulo', 90);
    await expect(tarjeta(page, 'tan(θ)')).toHaveText(/no definida|∞/i);
  });

  test('270°: la tangente no está definida', async ({ page }) => {
    // HALLAZGO ABIERTO (el mismo que el de 90°): Math.tan(3π/2) = 5443746451065123.
    // Hoy sale «5443746451065123,000». Quitar test.fail() cuando se repare.
    test.fail();
    await sembrarValor(page, '#slider-angulo', 270);
    await expect(tarjeta(page, 'tan(θ)')).toHaveText(/no definida|∞/i);
  });

  test('fuera de rango: el deslizador capa −30 a 0° y 400 a 360°', async ({ page }) => {
    // El control es <input type="range" min=0 max=360 step=1>: no hay campo de texto que
    // pueda recibir basura, así que el «rechazo» es el recorte del propio control.
    expect(await sembrarValorAcotado(page, '#slider-angulo', -30)).toBe('0');
    await expect(page.locator('label[for="slider-angulo"] strong')).toHaveText('0°');
    await expect(tarjeta(page, 'sen(θ)')).toHaveText('0,000');
    await expect(tarjeta(page, 'cos(θ)')).toHaveText('1,000');

    expect(await sembrarValorAcotado(page, '#slider-angulo', 400)).toBe('360');
    await expect(page.locator('label[for="slider-angulo"] strong')).toHaveText('360°');
    await expect(page.locator('[class*="valoresPanel"]')).toContainText('Eje X+');
    expect(aNumero((await tarjeta(page, 'sen(θ)').textContent()) ?? '')).toBe(0);
  });

  test('grados → radianes: 30° = π/6 ≈ 0,524 y 180° = π ≈ 3,142', async ({ page }) => {
    const radianes = async (): Promise<number> => {
      const texto = (await page.locator('label[for="slider-angulo"]').textContent()) ?? '';
      const m = texto.match(/\(([-\d.,]+) rad\)/);
      expect(m, `sin radianes en «${texto}»`).not.toBeNull();
      // Admite los dos separadores: aquí se vigila la CONVERSIÓN, el formato va aparte.
      return Number(m![1].replace(',', '.'));
    };
    await sembrarValor(page, '#slider-angulo', 30);
    // π/6 = 0,523599 → 3 decimales. Un olvido de la conversión daría 30 o 0,009: la precisión
    // 3 (±0,0005) basta y sobra.
    expect(await radianes()).toBeCloseTo(0.524, 3);
    await sembrarValor(page, '#slider-angulo', 180);
    expect(await radianes()).toBeCloseTo(3.142, 3);
  });

  test('los radianes se escriben con coma decimal', async ({ page }) => {
    // HALLAZGO ABIERTO (Inspector 25/09/2026): page.tsx:523 presenta con toFixed(3) y sale
    // «(0.524 rad)» con punto. Formato español obligatorio. Quitar test.fail() al repararlo.
    test.fail();
    await sembrarValor(page, '#slider-angulo', 30);
    await expect(page.locator('label[for="slider-angulo"]')).toContainText('0,524 rad');
  });
});

test.describe('Identidades — tan 90° no publica un número', () => {
  test('en 90° las identidades con tangente no dan una cifra de 17 dígitos', async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-angulo-i']);
    await sembrarValor(page, '#slider-angulo-i', 90); // parte de 45
    const valorDe = (rotulo: string): Locator =>
      page
        .locator('[class*="identidadItem"]')
        .filter({ has: page.getByText(rotulo, { exact: true }) })
        .locator('[class*="identidadValor"]');
    // Aquí la vista sí se protege (|cos| > 0,001 → «∞», page.tsx:407 y :425).
    await expect(valorDe('tan(θ) = sen(θ)/cos(θ)')).toHaveText(/∞|no definida/i);
    await expect(valorDe('1 + tan²(θ) = sec²(θ)')).toHaveText(/∞|no definida/i);
    // sen²(90°) + cos²(90°) = 1 + 0 = 1
    await expect(page.locator('[class*="identidadCalculo"] strong')).toHaveText('1,000');
  });
});

test.describe('Gráficas — marcador del ángulo θ sobre la curva', () => {
  // Geometría del SVG (page.tsx:216-221): W 560, padX 36 → el eje x va de 36 (x = 0) a 524
  // (x = 2π), plotW 488. Alto: padY 20, plotH 160 → y = 180 − (v + A)/(2A)·160.
  // Con A = 1, ω = 0,5 y coseno: f(θ) = cos(θ/2).
  async function prepararCoseno(page: Page): Promise<Locator> {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-angulo-i']);
    await page.getByRole('button', { name: /Gráficas/ }).click();
    await esperarHidratacion(page, ['#slider-frecuencia', '#slider-angulo-g']);
    await page.getByRole('radio', { name: 'cos(x)' }).check();
    await expect(page.getByRole('radio', { name: 'cos(x)' })).toBeChecked();
    await sembrarValor(page, '#slider-frecuencia', 0.5); // parte de 1
    return page.locator('svg[aria-label^="Gráfica"] circle');
  }

  test('θ = 359°: el marcador cae al final de la curva, en cos(179,5°) ≈ −1', async ({ page }) => {
    const marcador = await prepararCoseno(page);
    await sembrarValor(page, '#slider-angulo-g', 359);
    // x = 36 + 359/360 · 488 = 522,64 · y = 180 − (cos 179,5° + 1)/2 · 160 = 179,997
    expect(Number(await marcador.getAttribute('cx'))).toBeCloseTo(522.64, 1);
    expect(Number(await marcador.getAttribute('cy'))).toBeCloseTo(180, 1);
  });

  test('θ = 360°: el marcador va al extremo derecho (x = 2π), no al izquierdo', async ({ page }) => {
    // HALLAZGO ABIERTO (Inspector 25/09/2026): page.tsx:271 coloca el marcador en
    // θ mod 2π, así que 360° cae en x = 0 (cx 36) mientras su altura se calcula con
    // cos(π) = −1: el punto queda en (36, 180) y la curva en x = 0 vale +1 (y = 20).
    // Esperado cx 524. El defecto es de 488 px: la precisión 0 (±0,5 px) lo separa de sobra.
    // Quitar test.fail() cuando se repare.
    test.fail();
    const marcador = await prepararCoseno(page);
    await sembrarValor(page, '#slider-angulo-g', 360);
    expect(Number(await marcador.getAttribute('cy'))).toBeCloseTo(180, 1);
    expect(Number(await marcador.getAttribute('cx'))).toBeCloseTo(524, 0);
  });

  test('los parámetros y la fórmula se escriben con coma decimal', async ({ page }) => {
    // HALLAZGO ABIERTO (Inspector 25/09/2026): page.tsx:652, 668, 684 y 716 usan toFixed y
    // hoy se lee «Amplitud (A): 1.0» y «f(x) = 1.0 · sen(1.0x + 0.00)». Quitar test.fail()
    // cuando se repare.
    test.fail();
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-angulo-i']);
    await page.getByRole('button', { name: /Gráficas/ }).click();
    await esperarHidratacion(page, ['#slider-amplitud']);
    const textos = [
      (await page.locator('label[for="slider-amplitud"]').textContent()) ?? '',
      (await page.locator('label[for="slider-frecuencia"]').textContent()) ?? '',
      (await page.locator('label[for="slider-fase"]').textContent()) ?? '',
      (await page.locator('[class*="formulaText"]').textContent()) ?? '',
    ];
    for (const t of textos) expect(t, `punto decimal en «${t}»`).not.toMatch(/\d\.\d/);
  });
});
