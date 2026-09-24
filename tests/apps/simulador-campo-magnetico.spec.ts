import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * Inspector — simulador-campo-magnetico (segmento CÁLCULO / física, portal Stemum)
 *
 * Generado por /inspector el 24/09/2026 (primera inspección).
 *
 * El <h1> promete «Simulador de Campo Magnético» con el subtítulo «Fuerza de Lorentz, campo
 * de las corrientes e inducción de Faraday-Lenz», y la metadata «Calcula la fuerza magnética
 * sobre cargas y corrientes, el radio y el periodo del movimiento circular, el campo de hilos,
 * espiras y solenoides». Todo el cálculo vive en app/simulador-campo-magnetico/page.tsx:
 *   · μ₀ = 4π·10⁻⁷ T·m/A · e = 1,602176634·10⁻¹⁹ C · m_p = 1,67262192·10⁻²⁷ kg
 *   · Lorentz:   F = |q|·v·B·sen θ · r = m·v·sen θ/(|q|·B) · T = 2π·m/(|q|·B) · paso = v·cos θ·T
 *   · Corrientes: B_hilo = μ₀I/(2πr) · B_espira = μ₀I/(2R) · B_sol = μ₀·(N/L)·I
 *                 F_hilos = μ₀·I₁·|I₂|/(2π·d), atracción si I₂ ≥ 0
 *   · Presentación: formatCientifico(x, d) → notación científica con coma si x < 10⁻³ o
 *     x ≥ 10⁵; en la franja [10⁻³, 10⁵) usa formatNumber(x, d) con d decimales FIJOS.
 *
 * Los deslizadores arrancan en: v = 5·10⁶ m/s · B = 0,5 T · θ = 90° · I = 10 A · r = 5 cm ·
 * N = 500 · L = 0,30 m · I₂ = 10 A · d = 2 cm. Cada caso parte de OTRO estado, para que
 * sembrar pruebe algo.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * CASOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal)
 *   (a) Corrientes: I = 25 A, r = R = 2 cm, N = 800, L = 0,40 m.
 *       B_hilo   = 2·10⁻⁷ · 25 / 0,02            = 2,5·10⁻⁴ T  (250 μT) → «2,500 × 10⁻⁴ T»
 *       B_espira = 4π·10⁻⁷ · 25 / (2 · 0,02)     = 7,853982·10⁻⁴ T      → «7,854 × 10⁻⁴ T»
 *       n = 800 / 0,40 = 2000 /m                                        → «2000 /m»
 *       B_sol    = 4π·10⁻⁷ · 2000 · 25           = 0,0628319 T          → «0,063 T»
 *       Espira / hilo = π exactamente: un 2π de más o de menos salta a la vista.
 *   (b) Lorentz: protón, v = 3·10⁶ m/s, B = 0,2 T, θ = 90°.
 *       F = 1,602176634·10⁻¹⁹ · 3·10⁶ · 0,2 = 9,613060·10⁻¹⁴ N          → «9,61 × 10⁻¹⁴ N»
 *       r = 1,67262192·10⁻²⁷ · 3·10⁶ / (1,602176634·10⁻¹⁹ · 0,2) = 0,156595 m → «0,157 m»
 *       T = 2π · 1,67262192·10⁻²⁷ / (3,204353·10⁻²⁰) = 3,279724·10⁻⁷ s  → «3,28 × 10⁻⁷ s»
 *
 *   CASO 2 (límite)
 *   (a) θ = 0° (v paralela a B), protón a 5·10⁶ m/s en 0,5 T: sen 0 = 0 → F = 0 N, r = 0 m,
 *       v⊥ = 0 m/s. Y el dibujo no debería pintar una flecha F de 48 px con F = 0.
 *   (b) θ = 90° (arranque): cos 90° = 0 → la trayectoria es una circunferencia y el paso de la
 *       hélice es 0 m. La app lo calcula con Math.cos(π/2) = 6,12·10⁻¹⁷ y muestra
 *       5·10⁶ · 6,12·10⁻¹⁷ · 1,3119·10⁻⁷ = 4,017·10⁻¹⁷ m.
 *   (c) Sentido: ω = −q·B/m. Protón con B saliente (+z) → giro HORARIO visto desde la
 *       pantalla; invertir B → ANTIHORARIO; electrón con B entrante → HORARIO otra vez.
 *   (d) Corriente del segundo hilo invertida: I₁ = 10 A, I₂ = −25 A, d = 10 cm →
 *       F = 2·10⁻⁷ · 10 · 25 / 0,10 = 5·10⁻⁴ N/m → «5,000 × 10⁻⁴ N/m», y «se repelen».
 *
 *   CASO 3 (rechazo / aviso)
 *   (a) I = −5 A y r = 0 m no tienen sentido en estos controles: el <input type="range">
 *       debe caparlos a su mínimo (I = 0,1 A, r = 0,5 cm) y el cálculo seguir finito:
 *       B_hilo = 2·10⁻⁷ · 0,1 / 0,005 = 4·10⁻⁶ T → «4,000 × 10⁻⁶ T»
 *       B_espira = 4π·10⁻⁷ · 0,1 / 0,01 = 1,256637·10⁻⁵ T → «1,257 × 10⁻⁵ T»
 *   (b) Precisión en la franja del militesla: I = 30 A, r = 0,5 cm →
 *       B_hilo = 2·10⁻⁷ · 30 / 0,005 = 1,2·10⁻³ T (1,2 mT). La app escribe «0,001 T» en la
 *       tabla (−17 %) y «B = 0,00 T» en la etiqueta del dibujo, porque en [10⁻³, 10⁻²) usa 3
 *       (o 2) decimales fijos. DEFECTO → test.fail.
 */

// ── utilidades ────────────────────────────────────────────────────────────────────────

const SUPER: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-',
};

/** «7,854 × 10⁻⁴ T» → 7.854e-4 · «0,063 T» → 0.063 */
function leerCifra(texto: string): number {
  const limpio = texto.trim();
  const m = limpio.match(/^(-?[\d.]*\d(?:,\d+)?)(?:\s*×\s*10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+))?/);
  if (!m) return NaN;
  const mantisa = Number(m[1].replace(/\./g, '').replace(',', '.'));
  if (!m[2]) return mantisa;
  const exp = Number(m[2].split('').map((c) => SUPER[c] ?? c).join(''));
  return mantisa * Math.pow(10, exp);
}

/** El valor de la fila de resultados cuyo rótulo contiene `rotulo`. */
function valorDeFila(page: Page, rotulo: string): Locator {
  return page
    .locator('[class*="resultRow"]')
    .filter({ hasText: rotulo })
    .locator('[class*="resultValue"]');
}

async function abrir(page: Page): Promise<void> {
  await page.goto('/simulador-campo-magnetico/');
  await esperarHidratacion(page, ['#velocidad', '#campo', '#anguloVB']);
}

async function irACorrientes(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Corrientes y conductores' }).click();
  await esperarHidratacion(page, ['#corriente', '#distancia']);
}

test.beforeEach(async ({ page }) => {
  await abrir(page);
});

// ── CASO 1 ────────────────────────────────────────────────────────────────────────────

test('caso 1a · hilo, espira y solenoide con I = 25 A, r = 2 cm, N = 800, L = 0,40 m', async ({ page }) => {
  await irACorrientes(page);
  await sembrarValor(page, '#corriente', 25);
  await sembrarValor(page, '#distancia', 0.02);
  await sembrarValor(page, '#vueltas', 800);
  await sembrarValor(page, '#longitudSolenoide', 0.4);

  // B_hilo = μ₀·I/(2πr) = 2·10⁻⁷·25/0,02 = 2,5·10⁻⁴ T (250 μT)
  const hilo = valorDeFila(page, 'Campo de un hilo recto');
  await expect(hilo).toHaveText('2,500 × 10⁻⁴ T');
  // Precisión 2 → ±0,5 %: un factor 2π, π o un prefijo mal puesto quedan muy fuera.
  expect(leerCifra(await hilo.innerText()) / 2.5e-4).toBeCloseTo(1, 2);

  // B_espira = μ₀·I/(2R) = 4π·10⁻⁷·25/0,04 = 7,853982·10⁻⁴ T
  const espira = valorDeFila(page, 'Campo en el centro de una espira');
  await expect(espira).toHaveText('7,854 × 10⁻⁴ T');
  expect(leerCifra(await espira.innerText()) / 7.853982e-4).toBeCloseTo(1, 2);

  // n = N/L = 800/0,40 = 2000 /m (es-ES no agrupa las cifras de cuatro dígitos)
  await expect(valorDeFila(page, 'Espiras por metro')).toHaveText('2000 /m');
  // B_sol = μ₀·n·I = 4π·10⁻⁷·2000·25 = 0,0628319 T → 3 decimales fijos: «0,063 T»
  const sol = valorDeFila(page, 'Campo del solenoide');
  await expect(sol).toHaveText('0,063 T');
  expect(leerCifra(await sol.innerText()) / 0.0628319).toBeCloseTo(1, 1);

  // La etiqueta del dibujo repite el campo del hilo
  await expect(page.locator('svg text').filter({ hasText: /^B = / })).toHaveText('B = 2,50 × 10⁻⁴ T');
  await expect(page.locator('svg text').filter({ hasText: 'del hilo' })).toHaveText('a 2,0 cm del hilo');
});

test('caso 1b · Lorentz: protón a 3·10⁶ m/s en 0,2 T con θ = 90°', async ({ page }) => {
  await sembrarValor(page, '#velocidad', 3);
  await sembrarValor(page, '#campo', 0.2);

  // F = e·v·B = 1,602176634·10⁻¹⁹·3·10⁶·0,2 = 9,613060·10⁻¹⁴ N
  const f = valorDeFila(page, 'Fuerza F = q·v·B');
  await expect(f).toHaveText('9,61 × 10⁻¹⁴ N');
  expect(leerCifra(await f.innerText()) / 9.61306e-14).toBeCloseTo(1, 2);

  // r = m·v/(e·B) = 1,67262192·10⁻²⁷·3·10⁶/(3,204353·10⁻²⁰) = 0,156595 m
  const r = valorDeFila(page, 'Radio r =');
  await expect(r).toHaveText('0,157 m');
  expect(leerCifra(await r.innerText()) / 0.156595).toBeCloseTo(1, 2);

  // T = 2π·m/(e·B) = 3,279724·10⁻⁷ s (no depende de v)
  const periodo = valorDeFila(page, 'Periodo T =');
  await expect(periodo).toHaveText('3,28 × 10⁻⁷ s');
  expect(leerCifra(await periodo.innerText()) / 3.279724e-7).toBeCloseTo(1, 2);
});

// ── CASO 2 ────────────────────────────────────────────────────────────────────────────

test('caso 2a · θ = 0°: la fuerza, el radio y v⊥ se anulan', async ({ page }) => {
  await sembrarValor(page, '#anguloVB', 0);
  // sen 0 = 0 → F = 0, r = m·v·sen θ/(qB) = 0, v⊥ = 0
  await expect(valorDeFila(page, 'Fuerza F = q·v·B')).toHaveText('0 N');
  await expect(valorDeFila(page, 'Radio r =')).toHaveText('0 m');
  await expect(valorDeFila(page, 'Componente v perpendicular')).toHaveText('0 m/s');
  // El periodo no depende del ángulo: 2π·m/(e·0,5) = 1,311889·10⁻⁷ s
  await expect(valorDeFila(page, 'Periodo T =')).toHaveText('1,31 × 10⁻⁷ s');
});

test('caso 2c · el sentido de giro sigue a q·v×B (invertir B o la carga lo invierte)', async ({ page }) => {
  const pista = page.locator('[class*="canvasHint"]');
  // Protón con B saliente (+z): ω = −qB/m apunta a −z → horario visto desde la pantalla
  await expect(pista).toContainText('Giro horario');
  await page.getByRole('button', { name: /B sale de la pantalla/ }).click();
  // B entrante → se invierte
  await expect(pista).toContainText('Giro antihorario');
  await page.getByRole('button', { name: /Electrón/ }).click();
  // Carga negativa con B entrante → vuelve a horario
  await expect(pista).toContainText('Giro horario');
});

test('caso 2d · segundo hilo con la corriente invertida: misma fuerza, pero se repelen', async ({ page }) => {
  await irACorrientes(page);
  await expect(valorDeFila(page, 'Los hilos')).toHaveText('se atraen');
  await sembrarValor(page, '#corriente2', -25);
  await sembrarValor(page, '#separacion', 0.1);
  // F/L = μ₀·I₁·|I₂|/(2πd) = 2·10⁻⁷·10·25/0,10 = 5·10⁻⁴ N/m
  const f = valorDeFila(page, 'Fuerza entre hilos');
  await expect(f).toHaveText('5,000 × 10⁻⁴ N/m');
  expect(leerCifra(await f.innerText()) / 5e-4).toBeCloseTo(1, 2);
  await expect(valorDeFila(page, 'Los hilos')).toHaveText('se repelen');
});

test('caso 2b · con θ = 90° la trayectoria es circular: el paso de la hélice es 0', async ({ page }) => {
  // HALLAZGO (24/09/2026): la app calcula v·cos θ·T con Math.cos(π/2) = 6,12·10⁻¹⁷ y en el
  // estado de arranque muestra «4,017 × 10⁻¹⁷ m» en vez de 0, contradiciendo su propia pista
  // («Con 90° la trayectoria es circular»). Se parte de otro ángulo para que sembrar pruebe algo.
  test.fail();
  await sembrarValor(page, '#anguloVB', 45);
  await sembrarValor(page, '#anguloVB', 90);
  await expect(valorDeFila(page, 'Paso de la hélice')).toHaveText('0 m', { timeout: 2000 });
});

test('caso 2a-dibujo · con F = 0 el lienzo no pinta un vector fuerza', async ({ page }) => {
  // HALLAZGO (24/09/2026): con θ = 0° la tabla dice «0 N» pero el SVG sigue dibujando la
  // flecha F con 48 px de largo (y girando), porque su longitud es fija.
  test.fail();
  await sembrarValor(page, '#anguloVB', 0);
  await expect(valorDeFila(page, 'Fuerza F = q·v·B')).toHaveText('0 N');
  const largo = await page.locator('[class*="vFuerza"] line').evaluate((l) => {
    const n = (a: string) => Number(l.getAttribute(a));
    return Math.hypot(n('x2') - n('x1'), n('y2') - n('y1'));
  });
  expect(largo).toBeLessThan(1);
});

// ── CASO 3 ────────────────────────────────────────────────────────────────────────────

test('caso 3a · I negativa y r = 0 se capan al mínimo y el campo sigue finito', async ({ page }) => {
  await irACorrientes(page);
  // −5 A no es un valor del control: el range lo satura a su mínimo, 0,1 A
  expect(await sembrarValorAcotado(page, '#corriente', -5)).toBe('0.1');
  // r = 0 haría divergir B: el range lo satura a 0,005 m
  expect(await sembrarValorAcotado(page, '#distancia', 0)).toBe('0.005');
  // B_hilo = 2·10⁻⁷·0,1/0,005 = 4·10⁻⁶ T · B_espira = 4π·10⁻⁷·0,1/0,01 = 1,256637·10⁻⁵ T
  await expect(valorDeFila(page, 'Campo de un hilo recto')).toHaveText('4,000 × 10⁻⁶ T');
  await expect(valorDeFila(page, 'Campo en el centro de una espira')).toHaveText('1,257 × 10⁻⁵ T');
  await expect(page.locator('[class*="resultBlock"]')).not.toContainText(/NaN|∞|No definido/);
});

test('caso 3b · 1,2 mT no puede presentarse como «0,001 T» ni el dibujo como «0,00 T»', async ({ page }) => {
  // HALLAZGO (24/09/2026): formatCientifico usa decimales FIJOS en [10⁻³, 10⁵), así que en la
  // franja del militesla se come las cifras significativas. I = 30 A, r = 0,5 cm:
  // B = 2·10⁻⁷·30/0,005 = 1,2·10⁻³ T; la tabla da «0,001 T» (−17 %) y la etiqueta del
  // lienzo «B = 0,00 T». Precisión 2 (±0,5 %) basta para ver el −17 %.
  test.fail();
  await irACorrientes(page);
  await sembrarValor(page, '#corriente', 30);
  await sembrarValor(page, '#distancia', 0.005);
  const hilo = valorDeFila(page, 'Campo de un hilo recto');
  await expect(hilo).toHaveText(/T$/);
  expect(leerCifra(await hilo.innerText()) / 1.2e-3).toBeCloseTo(1, 2);
  await expect(page.locator('svg text').filter({ hasText: /^B = / })).not.toHaveText('B = 0,00 T');
});

// ── Dibujo y accesibilidad ────────────────────────────────────────────────────────────

test('dibujo · el punto de medida del hilo se aleja cuando crece la distancia', async ({ page }) => {
  // HALLAZGO (24/09/2026): el punto de medida está fijo en cx = 490 sea cual sea r; la
  // etiqueta cambia («a 2,0 cm» / «a 40,0 cm») pero el dibujo no muestra la distancia.
  test.fail();
  await irACorrientes(page);
  await sembrarValor(page, '#distancia', 0.02);
  const cerca = Number(await page.locator('[class*="puntoMedida"]').getAttribute('cx'));
  await sembrarValor(page, '#distancia', 0.4);
  await expect(page.locator('svg text').filter({ hasText: 'del hilo' })).toHaveText('a 40,0 cm del hilo');
  const lejos = Number(await page.locator('[class*="puntoMedida"]').getAttribute('cx'));
  expect(lejos).toBeGreaterThan(cerca);
});

test('a11y · el botón «Pausar» no se anuncia como pulsado mientras la animación corre', async ({ page }) => {
  // HALLAZGO (24/09/2026): el botón cambia de rótulo (Pausar/Reanudar) Y lleva
  // aria-pressed={reproduciendo}: al arrancar un lector dice «Pausar, pulsado» con la
  // animación en marcha. Un botón de acción con rótulo cambiante no lleva aria-pressed.
  test.fail();
  const boton = page.getByRole('button', { name: 'Pausar' });
  await expect(boton).toBeVisible();
  await expect(boton).not.toHaveAttribute('aria-pressed', 'true', { timeout: 2000 });
});
