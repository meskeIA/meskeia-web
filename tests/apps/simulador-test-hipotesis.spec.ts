import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';
import { activarTemaOscuro, prepararParaMedir } from '../_contraste';

/**
 * Inspector — simulador-test-hipotesis (segmento cálculo). Primera inspección: 18/11/2026.
 *
 * El <h1> promete «Simulador de Test de Hipótesis»; el hero y la metadata, ver «α, β, p-valor y
 * potencia» con las dos distribuciones de X̄ (H₀ y H₁) y las regiones de rechazo, en tests
 * bilateral y unilaterales. Contraste z para la media con σ conocida.
 *
 * DÓNDE VIVE EL CÁLCULO — app/simulador-test-hipotesis/page.tsx (no importa motores ni data/)
 *   · ee = σ/√n · z = (X̄ − μ₀)/ee · Φ por erf de Abramowitz-Stegun 7.1.26 (error ≤ 1,5·10⁻⁷)
 *   · z* por el algoritmo de Acklam (la app lo llama Beasley-Springer-Moro)
 *   · p: bilateral 2·(1 − Φ(|z|)), derecho 1 − Φ(z), izquierdo Φ(z) · decide «p < α»
 *   · β = P(no caer en la región de rechazo | X̄ ~ N(μ₁, ee)) · potencia = 1 − β
 *   Todo son deslizadores (μ₀ y μ₁ de 20 a 80, σ de 1 a 30) y botones (n ∈ {5, 10, 30, 50, 100,
 *   500}, α ∈ {0,01; 0,05; 0,10}). El de X̄ va de min(μ₀, μ₁) − 5·ee a max(μ₀, μ₁) + 5·ee con
 *   paso ee/20: con n = 100 y σ = 10 (ee = 1) el paso es 0,05 y 51,8 o 47,6 caen en la rejilla.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS ESPERADOS, CALCULADOS ANTES DE ABRIR LA APP con una normal propia (serie de términos
 * positivos de erf y fracción continua de erfc; inversa por bisección):
 * .inspector-trabajo/sth-esperados.mjs. Control: Φ(1,96) = 0,9750021 · z₀,₉₇₅ = 1,9599640 ·
 * z₀,₉₅ = 1,6448536 · z₀,₉₉₅ = 2,5758293 · 1 − Φ(5) = 2,8665·10⁻⁷.
 *
 *   INICIAL — bilateral, μ₀ 50, μ₁ 53, σ 10, n 30, α 0,05, X̄ 53,5
 *     ee = 1,825742 · z = 1,917029 · p = 0,0552343 → NO rechazar · z* = ±1,960
 *     β = Φ(1,959964 − 1,643168) − Φ(−1,959964 − 1,643168) = 0,624144 · potencia 0,375856
 *   CASO 1 (normal) — unilateral derecho, n 100 (ee = 1), X̄ 51,8
 *     z = 1,8 · p = 1 − Φ(1,8) = 0,0359303 → rechazar · z* = 1,645
 *     β = Φ(1,644854 − 3) = 0,087685 · potencia 0,912315
 *   CASO 1 bis — unilateral izquierdo, μ₁ 47, n 100, α 0,01, X̄ 47,6
 *     z = −2,4 · p = Φ(−2,4) = 0,0081975 → rechazar · z* = −2,326
 *     β = 1 − Φ(50 − 2,326348 − 47) = 0,250266 · potencia 0,749734
 *   CASO 2 (límite) — bilateral, μ₁ = μ₀ = 50, n 100, α 0,10, X̄ = μ₀ = 50
 *     z = 0 · p = 1 → NO rechazar · z* = ±1,645 · β = P(|Z| < 1,645) = 0,90 · potencia = α = 0,10
 *   CASO 3 (rechazo) — σ = 0 y μ₀ = 100: el deslizador los acota a 1 y a 80 (σ > 0 siempre)
 *     ee = 1/√30 = 0,182574 · z = (53,5 − 80)/0,182574 = −145,146 · p = 0 → rechazar
 *     β = 0 · potencia 1, sin ∞ ni NaN
 *   ÚNICA FORMA — bilateral, α 0,01, σ 5, n 30 (X̄ 53,5): ee = 0,912871 · z = 3,834058 ·
 *     p = 0,000126 · z* = ±2,576 · β = 0,238695. Frente al inicial (α 0,05, σ 10): α y β bajan
 *     a la vez sin tocar n, contra «La única forma de bajar ambos es aumentar n».
 *
 * Los casos con test.fail() son hallazgos ABIERTOS de esta inspección: cuando se reparen,
 * Playwright marcará el «fallo esperado» como inesperado; entonces se quita el test.fail() y el
 * comentario pasa a REPARADO.
 */

const URL_APP = '/simulador-test-hipotesis/';
const DESLIZADORES = ['#media-h0', '#media-h1', '#desviacion-poblacional', '#media-observada'];

async function abrir(page: Page): Promise<void> {
  await page.goto(URL_APP);
  await esperarHidratacion(page, DESLIZADORES);
}

/**
 * El rótulo de una tarjeta de resultados y sus hermanos (valor, insignia, pie). El rótulo «p-valor»
 * también está en la leyenda del lienzo, pero allí lleva dentro el cuadradito de color: se descarta.
 */
function tarjeta(page: Page, rotulo: string): { valor: Locator; segundo: Locator; pie: Locator } {
  const r = page.getByText(rotulo, { exact: true }).filter({ hasNot: page.locator('span') });
  return {
    valor: r.locator('xpath=following-sibling::span[1]'),
    segundo: r.locator('xpath=following-sibling::span[2]'),
    pie: r.locator('xpath=following-sibling::span[last()]'),
  };
}

const grupoN = (page: Page): Locator => page.getByRole('group', { name: /^Tamaño muestral/ });
const grupoAlfa = (page: Page): Locator => page.getByRole('group', { name: /^Nivel de significación/ });

async function elegirN(page: Page, n: number): Promise<void> {
  await grupoN(page).getByRole('button', { name: String(n), exact: true }).click();
  await expect(page.locator('#tamano-muestral-label')).toHaveText(`Tamaño muestral (n = ${n})`);
}

/** Los botones de α llevan el número tal cual lo pinta JS («0.1»): ver el hallazgo de formato. */
async function elegirAlfa(page: Page, textoBoton: string): Promise<void> {
  const boton = grupoAlfa(page).getByRole('button', { name: textoBoton, exact: true });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

async function elegirTipo(page: Page, nombre: RegExp): Promise<void> {
  const boton = page.getByRole('button', { name: nombre });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

interface Contraste {
  ratio: number;
  umbral: number;
  detalle: string;
}

/**
 * Contraste de UN elemento contra su fondo compuesto (cada capa translúcida de los antepasados con
 * su alfa, sobre blanco), con el umbral WCAG que le toca: 3:1 si es grande (≥ 24 px, o ≥ 18,66 px
 * en negrita), 4,5:1 si no. Mide el elemento, no un color: sigue valiendo si la reparación cambia
 * el tono. Los colores se normalizan pintándolos en un canvas de 1×1 (como tests/_contraste.ts).
 */
async function contrasteDe(elemento: Locator): Promise<Contraste> {
  return elemento.evaluate((el) => {
    const lienzo = document.createElement('canvas');
    lienzo.width = lienzo.height = 1;
    const ctx = lienzo.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    const normalizar = (css: string): number[] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const canal = (c: number): number => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (p: number[]): number => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
    const capas: number[][] = [];
    let m: Element | null = el;
    while (m) {
      const c = normalizar(getComputedStyle(m).backgroundColor);
      if (c[3] > 0) capas.push(c);
      if (c[3] >= 1) break;
      m = m.parentElement;
    }
    let fondo = [255, 255, 255];
    for (let i = capas.length - 1; i >= 0; i--) {
      const c = capas[i];
      fondo = [0, 1, 2].map((k) => c[k] * c[3] + fondo[k] * (1 - c[3]));
    }
    const cs = getComputedStyle(el);
    const color = normalizar(cs.color);
    const l1 = lum(color);
    const l2 = lum(fondo);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const px = parseFloat(cs.fontSize);
    const grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
    return {
      ratio: Number(ratio.toFixed(2)),
      umbral: grande ? 3 : 4.5,
      detalle: `«${(el.textContent ?? '').trim()}» rgb(${color.slice(0, 3).join(', ')}) sobre rgb(${fondo.map(Math.round).join(', ')}), ${cs.fontSize} ${cs.fontWeight}`,
    };
  });
}

/** «Media observada (X̄ = 53,50)» → 53.5 */
async function xBarDeLaEtiqueta(page: Page): Promise<number> {
  const texto = (await page.locator('label[for="media-observada"]').textContent()) ?? '';
  const m = texto.match(/=\s*(-?\d+),(\d+)/);
  if (!m) throw new Error(`Sin X̄ en «${texto}»`);
  return Number(`${m[1]}.${m[2]}`);
}

async function textoDelCuerpo(page: Page): Promise<string> {
  return page.evaluate(() => {
    const clon = document.body.cloneNode(true) as HTMLElement;
    clon.querySelectorAll('script, style').forEach((n) => n.remove());
    return (clon.textContent ?? '').replace(/\s+/g, ' ');
  });
}

test.describe('Contraste z para la media: casos resueltos a mano', () => {
  test('estado inicial (bilateral, X̄ 53,5, n 30) → p 0,05523, NO rechazar, β 62,41 %', async ({ page }) => {
    // Lectura de control del punto de partida: los casos siguientes salen de aquí y lo mueven.
    await abrir(page);
    const p = tarjeta(page, 'p-valor');
    await expect(p.valor).toHaveText('0,05523'); // 2·(1 − Φ(1,917029)) = 0,0552343
    await expect(p.segundo).toContainText('NO rechazar H₀');
    await expect(tarjeta(page, 'z observado').valor).toHaveText('1,917');
    await expect(tarjeta(page, 'Error estándar (σ/√n)').valor).toHaveText('1,826'); // 10/√30
    await expect(tarjeta(page, 'β (riesgo tipo II)').valor).toHaveText('62,41 %'); // 0,624144
    await expect(tarjeta(page, 'Potencia (1 − β)').valor).toHaveText('37,59 %');
    await expect(tarjeta(page, 'z* críticos').valor).toHaveText('±1,960');
  });

  test('caso 1 · unilateral derecho, n 100, X̄ 51,8 → z 1,800, p 0,03593, rechazar, β 8,77 %', async ({ page }) => {
    await abrir(page);
    await elegirN(page, 100);
    await elegirTipo(page, /^Unilateral derecho/);
    await sembrarValor(page, '#media-observada', 51.8);
    await expect(page.locator('label[for="media-observada"]')).toHaveText('Media observada (X̄ = 51,80)');
    await expect(page.getByText('Test sobre la media:')).toContainText('H₁: μ > 50,0');
    const p = tarjeta(page, 'p-valor');
    await expect(p.valor).toHaveText('0,03593'); // 1 − Φ(1,8) = 0,0359303
    await expect(p.segundo).toContainText('Rechazar H₀');
    await expect(p.segundo).not.toContainText('NO rechazar');
    await expect(tarjeta(page, 'z observado').valor).toHaveText('1,800');
    await expect(tarjeta(page, 'Error estándar (σ/√n)').valor).toHaveText('1,000');
    await expect(tarjeta(page, 'z* críticos').valor).toHaveText('1,645'); // z₀,₉₅ = 1,6448536
    await expect(tarjeta(page, 'z* críticos').pie).toHaveText('cola derecha');
    await expect(tarjeta(page, 'β (riesgo tipo II)').valor).toHaveText('8,77 %'); // Φ(−1,355146) = 0,087685
    await expect(tarjeta(page, 'Potencia (1 − β)').valor).toHaveText('91,23 %');
  });

  test('caso 1 bis · unilateral izquierdo, μ₁ 47, n 100, α 0,01, X̄ 47,6 → p 0,00820, z* −2,326, β 25,03 %', async ({ page }) => {
    await abrir(page);
    await elegirTipo(page, /^Unilateral izquierdo/);
    await elegirN(page, 100);
    await elegirAlfa(page, '0.01');
    await sembrarValor(page, '#media-h1', 47);
    await sembrarValor(page, '#media-observada', 47.6);
    await expect(page.locator('label[for="media-observada"]')).toHaveText('Media observada (X̄ = 47,60)');
    const p = tarjeta(page, 'p-valor');
    await expect(p.valor).toHaveText('0,00820'); // Φ(−2,4) = 0,0081975
    await expect(p.segundo).not.toContainText('NO rechazar');
    await expect(tarjeta(page, 'z observado').valor).toHaveText('-2,400');
    await expect(tarjeta(page, 'z* críticos').valor).toHaveText('-2,326'); // z₀,₀₁ = −2,3263479
    await expect(tarjeta(page, 'β (riesgo tipo II)').valor).toHaveText('25,03 %'); // 1 − Φ(0,673652) = 0,250266
    await expect(tarjeta(page, 'Potencia (1 − β)').valor).toHaveText('74,97 %');
  });

  test('caso 2 · límite: X̄ = μ₀ = μ₁ = 50, α 0,10 → z 0,000, p 1,00000, β 90,00 %, potencia = α', async ({ page }) => {
    await abrir(page);
    await elegirN(page, 100);
    await elegirAlfa(page, '0.1');
    await sembrarValor(page, '#media-h1', 50);
    await sembrarValor(page, '#media-observada', 50);
    const p = tarjeta(page, 'p-valor');
    await expect(p.valor).toHaveText('1,00000'); // 2·(1 − Φ(0)) = 1
    await expect(p.segundo).toContainText('NO rechazar H₀');
    await expect(tarjeta(page, 'z observado').valor).toHaveText('0,000');
    await expect(tarjeta(page, 'z* críticos').valor).toHaveText('±1,645'); // α/2 = 0,05 por cola
    // Con μ₁ = μ₀ la probabilidad de rechazar es α: P(|Z| > 1,645) = 0,10.
    await expect(tarjeta(page, 'β (riesgo tipo II)').valor).toHaveText('90,00 %');
    await expect(tarjeta(page, 'Potencia (1 − β)').valor).toHaveText('10,00 %');
  });

  test('caso 3 · rechazo: σ = 0 se acota a 1 y μ₀ = 100 a 80; z −145,146 y p 0,00000, sin ∞ ni NaN', async ({ page }) => {
    await abrir(page);
    expect(await sembrarValorAcotado(page, '#desviacion-poblacional', 0)).toBe('1');
    await expect(page.locator('label[for="desviacion-poblacional"]')).toHaveText('Desviación poblacional (σ = 1,0)');
    expect(await sembrarValorAcotado(page, '#media-h0', 100)).toBe('80');
    await expect(page.locator('label[for="media-h0"]')).toHaveText('Media bajo H₀ (μ₀ = 80,0)');
    await expect(tarjeta(page, 'Error estándar (σ/√n)').valor).toHaveText('0,183'); // 1/√30
    await expect(tarjeta(page, 'z observado').valor).toHaveText('-145,146'); // (53,5 − 80)/0,182574
    const p = tarjeta(page, 'p-valor');
    await expect(p.valor).toHaveText('0,00000');
    await expect(p.segundo).not.toContainText('NO rechazar');
    await expect(tarjeta(page, 'β (riesgo tipo II)').valor).toHaveText('0,00 %');
    await expect(tarjeta(page, 'Potencia (1 − β)').valor).toHaveText('100,00 %');
    for (const rotulo of ['p-valor', 'z observado', 'Error estándar (σ/√n)', 'β (riesgo tipo II)', 'Potencia (1 − β)', 'z* críticos']) {
      expect(await tarjeta(page, rotulo).valor.textContent(), rotulo).not.toMatch(/NaN|∞/);
    }
  });

  test('α 0,01 y σ 5 con n 30 fijo: α y β bajan a la vez (β 62,41 % → 23,87 %)', async ({ page }) => {
    await abrir(page);
    await expect(tarjeta(page, 'β (riesgo tipo II)').valor).toHaveText('62,41 %');
    await elegirAlfa(page, '0.01');
    await sembrarValor(page, '#desviacion-poblacional', 5);
    await expect(tarjeta(page, 'Error estándar (σ/√n)').valor).toHaveText('0,913'); // 5/√30
    await expect(tarjeta(page, 'z observado').valor).toHaveText('3,834');
    await expect(tarjeta(page, 'p-valor').valor).toHaveText('0,00013'); // 2·(1 − Φ(3,834058)) = 0,000126
    await expect(tarjeta(page, 'z* críticos').valor).toHaveText('±2,576');
    await expect(tarjeta(page, 'β (riesgo tipo II)').valor).toHaveText('23,87 %'); // 0,238695
    await expect(tarjeta(page, 'Potencia (1 − β)').valor).toHaveText('76,13 %');
  });
});

test.describe('Hallazgos abiertos de la primera inspección (18/11/2026)', () => {
  test('ABIERTO · con μ₁ fuera de H₁ la app sigue llamando a P(no rechazar) «riesgo tipo II» bajo «H₁ cierta»', async ({ page }) => {
    // Unilateral izquierdo (H₁: μ < 50) con el μ₁ = 53 de partida: 53 no cumple H₁, así que no hay
    // error tipo II posible y «potencia» no tiene sentido. La app pinta β = 99,95 % y potencia
    // 0,05 % (1 − Φ(−3,288) = 0,999496) con el pie «P(no rechazar | H₁ cierta)». Lo mismo con
    // μ₁ = μ₀ (caso 2: β 90 % «riesgo tipo II» con H₀ cierta). Lo que se espera es que la tarjeta
    // no presente esa cifra como riesgo tipo II bajo H₁ (avisar, ocultarla o cambiar el rótulo).
    await abrir(page);
    await elegirTipo(page, /^Unilateral izquierdo/);
    await expect(page.getByText('Test sobre la media:')).toContainText('H₁: μ < 50,0');
    await expect(page.locator('label[for="media-h1"]')).toHaveText('Media verdadera bajo H₁ (μ₁ = 53,0)');
    await expect(tarjeta(page, 'p-valor').valor).toHaveText('0,97238'); // Φ(1,917029)
    test.fail();
    // Hoy: «99,95 %» con el pie «P(no rechazar | H₁ cierta)».
    await expect(tarjeta(page, 'β (riesgo tipo II)').pie).not.toHaveText('P(no rechazar | H₁ cierta)', { timeout: 2000 });
  });

  test('ABIERTO · en oscuro el p-valor y «NO rechazar H₀» (#A82E68) no llegan a 3:1 (1,94 y 1,77)', async ({ page }) => {
    await abrir(page);
    await prepararParaMedir(page);
    const p = tarjeta(page, 'p-valor');
    await expect(p.segundo).toContainText('NO rechazar H₀');
    await activarTemaOscuro(page);
    const valor = await contrasteDe(p.valor);
    const insignia = await contrasteDe(p.segundo);
    test.fail();
    expect(valor.ratio, valor.detalle).toBeGreaterThanOrEqual(valor.umbral);
    expect(insignia.ratio, insignia.detalle).toBeGreaterThanOrEqual(insignia.umbral);
  });

  test('ABIERTO · en claro la potencia por debajo del 80 % (#E07A1F, 20,8 px negrita) da 2,89:1, bajo 3:1', async ({ page }) => {
    await abrir(page);
    await prepararParaMedir(page);
    const potencia = tarjeta(page, 'Potencia (1 − β)').valor;
    await expect(potencia).toHaveText('37,59 %');
    const m = await contrasteDe(potencia);
    test.fail();
    expect(m.ratio, m.detalle).toBeGreaterThanOrEqual(m.umbral);
  });

  test('ABIERTO · α en formato español: «α = 0,05», «5,0 %» y «p ≥ α (0,05)», no «0.05» ni «5.0 %»', async ({ page }) => {
    // Hoy: «Nivel de significación (α = 0.05)», «Decide a nivel α = 0.05», botones «0.01 / 0.05 /
    // 0.1», «5.0 %» en la tarjeta de α y «p ≥ α (0.05)» junto a un p-valor con coma («0,05523»).
    await abrir(page);
    await expect(tarjeta(page, 'p-valor').valor).toHaveText('0,05523');
    test.fail();
    await expect(page.locator('#nivel-significacion-label')).toHaveText('Nivel de significación (α = 0,05)', { timeout: 2000 });
    await expect(tarjeta(page, 'p-valor').pie).toContainText('(0,05)', { timeout: 2000 });
    // Coma decimal y espacio duro (U+00A0) antes del «%» (CLAUDE.md global §2); toHaveText no los
    // distingue de un espacio normal, de ahí el textContent.
    const ESPACIO_DURO = String.fromCharCode(160);
    expect(await tarjeta(page, 'α (riesgo tipo I)').valor.textContent()).toBe(`5,0${ESPACIO_DURO}%`);
  });

  test('ABIERTO · el pie de los z* bilaterales dice «a/2 a cada cola»; es «α/2»', async ({ page }) => {
    await abrir(page);
    await expect(tarjeta(page, 'z* críticos').valor).toHaveText('±1,960');
    test.fail();
    await expect(tarjeta(page, 'z* críticos').pie).toHaveText('α/2 a cada cola', { timeout: 2000 });
  });

  test('ABIERTO · tras subir n a 500 y bajar σ a 1, se decide con un X̄ = 53,5 que ni el deslizador ni el lienzo muestran', async ({ page }) => {
    // El deslizador de X̄ pasa a [49,776; 53,224] y el lienzo a [49,82; 53,18], pero el estado
    // sigue en 53,5: la etiqueta dice 53,50, z = 78,262 y «Rechazar H₀», el pulgar está en el tope
    // y la línea de X̄ no se dibuja (0 píxeles de su color).
    await abrir(page);
    await elegirN(page, 500);
    await sembrarValor(page, '#desviacion-poblacional', 1);
    await expect(tarjeta(page, 'Error estándar (σ/√n)').valor).toHaveText('0,045'); // 1/√500
    const deslizador = page.locator('#media-observada');
    const min = Number(await deslizador.getAttribute('min'));
    const max = Number(await deslizador.getAttribute('max'));
    const xBar = await xBarDeLaEtiqueta(page);
    test.fail();
    // Hoy: X̄ = 53,50 con el deslizador en [49,776; 53,224] (y z = 78,262, «Rechazar H₀»).
    expect(xBar, `X̄ ${xBar} dentro de [${min}; ${max}]`).toBeLessThanOrEqual(max + 0.005);
    expect(xBar).toBeGreaterThanOrEqual(min - 0.005);
  });

  test('ABIERTO · la línea y la etiqueta de X̄ del lienzo usan el violeta prohibido #7C3AED', async ({ page }) => {
    await abrir(page);
    await expect(tarjeta(page, 'z observado').valor).toHaveText('1,917');
    // Píxeles opacos del lienzo y, de ellos, los del violeta #7C3AED (124, 58, 237).
    const pixeles = async (): Promise<{ pintados: number; violeta: number }> =>
      page.evaluate(() => {
        const c = document.querySelector('canvas') as HTMLCanvasElement;
        const d = (c.getContext('2d') as CanvasRenderingContext2D).getImageData(0, 0, c.width, c.height).data;
        let pintados = 0;
        let violeta = 0;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] > 240) pintados++;
          if (Math.abs(d[i] - 124) < 8 && Math.abs(d[i + 1] - 58) < 8 && Math.abs(d[i + 2] - 237) < 8 && d[i + 3] > 240) violeta++;
        }
        return { pintados, violeta };
      });
    // Esperar a que el lienzo esté dibujado (curvas, ejes y rótulos), para no dar por bueno uno vacío.
    await expect.poll(async () => (await pixeles()).pintados).toBeGreaterThan(1000);
    test.fail();
    // Hoy: 681 píxeles violeta (línea de X̄ y su rótulo «X̄ = 53,5» en claro).
    expect((await pixeles()).violeta).toBe(0);
  });

  test('ABIERTO · la misma pregunta «bilateral o unilateral» va con dos respuestas, y la visible da una premisa falsa', async ({ page }) => {
    // FAQPage: «¿Cuándo se usa un test bilateral y cuándo uno unilateral?» — calla el aviso de no
    // elegir el unilateral a posteriori. FAQ visible: «¿Cuándo uso bilateral y cuándo unilateral?»
    // — justifica el unilateral con «un fármaco solo puede mejorar, no empeorar», que la respuesta
    // del FAQPage contradice («no detecta desviaciones en el sentido opuesto»). Reparación: UNA
    // constante que importen las dos (check:faq-unica).
    await abrir(page);
    const faq = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
        if (j['@type'] !== 'FAQPage') continue;
        const q = (j.mainEntity ?? []).find((e) => /bilateral/.test(e.name));
        if (q) return { pregunta: q.name, respuesta: q.acceptedAnswer.text };
      }
      return null;
    });
    expect(faq).not.toBeNull();
    const visible = page.locator('h4', { hasText: /bilateral/ }).locator('xpath=..');
    await expect(visible).toHaveCount(1);
    test.fail();
    // Hoy: dos redacciones de la misma pregunta, y la visible con la premisa falsa.
    await expect(visible.locator('h4')).toHaveText(faq?.pregunta ?? '', { timeout: 2000 });
    await expect(visible).not.toContainText('un fármaco solo puede mejorar, no empeorar', { timeout: 2000 });
    expect(faq?.respuesta).toMatch(/post-hoc|a posteriori|tras ver los datos|al ver los datos/);
  });

  test('ABIERTO · «La única forma de bajar ambos es aumentar n» contradice la propia FAQ (reducir σ) y el simulador', async ({ page }) => {
    // El caso que lo refuta está arriba: «α 0,01 y σ 5 con n 30 fijo» baja α de 5 a 1 % y β de
    // 62,41 a 23,87 %.
    await abrir(page);
    const texto = await textoDelCuerpo(page);
    expect(texto).toContain('reducir σ');
    test.fail();
    expect(texto).not.toContain('La única forma de bajar ambos es aumentar n');
  });

  test('ABIERTO · «La FDA exige potencia ≥ 80 %» sin fuente, cuando la propia página lo llama «estándar de la industria»', async ({ page }) => {
    // Tres sitios de la página hablan del 80 %: «La FDA exige potencia ≥ 80 %» (ensayos clínicos),
    // «Estándar de la industria: potencia ≥ 80 %» (FAQ) y «potencia objetivo (≥ 80 %)» (consejos).
    await abrir(page);
    const texto = await textoDelCuerpo(page);
    test.fail();
    expect(texto).not.toContain('La FDA exige potencia ≥ 80 %');
  });

  test('ABIERTO · la insignia marca «NO rechazar H₀» con ❌, que la tabla de la página reserva a los errores tipo I y II', async ({ page }) => {
    await abrir(page);
    const insignia = tarjeta(page, 'p-valor').segundo;
    await expect(insignia).toContainText('NO rechazar H₀');
    test.fail();
    await expect(insignia).not.toContainText('❌', { timeout: 2000 });
  });
});
