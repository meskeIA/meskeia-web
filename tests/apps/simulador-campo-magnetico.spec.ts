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
 *     x ≥ 10⁵; en la franja [10⁻³, 10⁵) usa formatNumber con d decimales COMO MÍNIMO, ampliados
 *     por debajo de 1 hasta 3 cifras significativas (reparado el 24/09/2026, hallazgo 1344:
 *     antes eran d decimales fijos y 1,2·10⁻³ T salía «0,001 T»).
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
 *       B_sol    = 4π·10⁻⁷ · 2000 · 25           = 0,0628319 T          → «0,0628 T»
 *       Espira / hilo = π exactamente: un 2π de más o de menos salta a la vista.
 *   (b) Lorentz: protón, v = 3·10⁶ m/s, B = 0,2 T, θ = 90°.
 *       F = 1,602176634·10⁻¹⁹ · 3·10⁶ · 0,2 = 9,613060·10⁻¹⁴ N          → «9,61 × 10⁻¹⁴ N»
 *       r = 1,67262192·10⁻²⁷ · 3·10⁶ / (1,602176634·10⁻¹⁹ · 0,2) = 0,156595 m → «0,157 m»
 *       T = 2π · 1,67262192·10⁻²⁷ / (3,204353·10⁻²⁰) = 3,279724·10⁻⁷ s  → «3,28 × 10⁻⁷ s»
 *
 *   CASO 2 (límite)
 *   (a) θ = 0° (v paralela a B), protón a 5·10⁶ m/s en 0,5 T: sen 0 = 0 → F = 0 N, r = 0 m,
 *       v⊥ = 0 m/s. Y el dibujo no debe pintar flecha F con F = 0; con fuerza, su largo es
 *       48 px · F/F_ref (F_ref = fuerza del arranque), acotado a [12, 120] px:
 *       θ = 30° → sen 30° = 0,5 → 24 px.
 *   (b) θ = 90° (arranque): cos 90° = 0 → la trayectoria es una circunferencia y el paso de la
 *       hélice es 0 m. La app lo calculaba con Math.cos(π/2) = 6,12·10⁻¹⁷ y mostraba
 *       5·10⁶ · 6,12·10⁻¹⁷ · 1,3119·10⁻⁷ = 4,017·10⁻¹⁷ m (hallazgo 1345, reparado).
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
 *       B_hilo = 2·10⁻⁷ · 30 / 0,005 = 1,2·10⁻³ T (1,2 mT) → «0,00120 T» en la tabla y en la
 *       etiqueta del dibujo (antes «0,001 T» y «B = 0,00 T»: hallazgo 1344, reparado).
 *       Electrón a 2·10⁶ m/s: E = ½·9,1093837·10⁻³¹·(2·10⁶)² / 1,602176634·10⁻¹⁹
 *       = 11,3712 eV = 0,0113712 keV → «0,0114 keV».
 *       I₁ = I₂ = 30 A a 4 cm: F/L = 2·10⁻⁷·30·30/0,04 = 4,5·10⁻³ N/m → «0,00450 N/m».
 *
 *   DIBUJO DEL HILO: el punto de medida está a 380 + 40 + 300·ln(r/0,005)/ln(100) px (escala
 *   logarítmica acotada a 0,5-50 cm): r = 2 cm → 510,3 · r = 40 cm → 705,5.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * REINSPECCIÓN 25/09/2026 (invalidada por 99857a6b y 0d54c8f9) — casos NUEVOS, resueltos a mano
 * antes de abrir el navegador, con las constantes de la app: e = 1,602176634·10⁻¹⁹ C,
 * mₑ = 9,1093837·10⁻³¹ kg, m_p = 1,67262192·10⁻²⁷ kg, μ₀ = 4π·10⁻⁷ T·m/A.
 *
 *   R1 · hilo recto, I = 10 A, r = 0,05 m: B = 2·10⁻⁷·10/0,05 = 4·10⁻⁵ T (40 μT) →
 *        «4,000 × 10⁻⁵ T» y en el dibujo «B = 4,00 × 10⁻⁵ T»; espira μ₀I/(2R) = 1,256637·10⁻⁴ T.
 *        Partiendo de I = 40 A, r = 0,10 m: 2·10⁻⁷·40/0,10 = 8·10⁻⁵ T → «8,000 × 10⁻⁵ T».
 *   R2 · electrón, v = 1·10⁶ m/s, B = 0,01 T, θ = 90°:
 *        F = e·v·B = 1,602177·10⁻¹⁵ N → «1,60 × 10⁻¹⁵ N»
 *        r = mₑ·v/(e·B) = 9,1093837·10⁻²⁵/1,602176634·10⁻²¹ = 5,685630·10⁻⁴ m → «5,686 × 10⁻⁴ m»
 *        T = 2π·mₑ/(e·B) = 3,572387·10⁻⁹ s → «3,57 × 10⁻⁹ s» · f = 1/T = 2,799249·10⁸ Hz
 *        E = ½·mₑ·v²/e = 2,842815 eV = 0,002842815 keV → «0,00284 keV» · paso 0 m.
 *        Carga negativa con B saliente: ω = −qB/m apunta a +z → giro ANTIHORARIO.
 *        θ = 30°: F = 8,010883·10⁻¹⁶ N · r = 2,842815·10⁻⁴ m · v⊥ = 5·10⁵ m/s ·
 *        paso = v·cos 30°·T = 10⁶·0,8660254·3,572387·10⁻⁹ = 3,093778·10⁻³ m → «0,00309 m»
 *        (rama decimal nueva de formatCientifico, 3 cifras significativas).
 *        θ = 0°: F = 0, r = 0, v⊥ = 0 y paso = v·T = 3,572387·10⁻³ m → «0,00357 m».
 *   R3 · solenoide N = 1000, L = 0,50 m, I = 10 A: n = 2000 /m; B = μ₀·n·I = 0,02513274 T → «0,0251 T».
 *   R4 · bordes de formatCientifico: v = 0,1·10⁶ m/s con θ = 90° da v⊥ = 10⁵ m/s EXACTO →
 *        «1,00 × 10⁵ m/s»; con θ = 89°, 10⁵·sen 89° = 99.984,77 m/s → «99.984,77 m/s».
 *        I = 25 A a 0,5 cm: B = 2·10⁻⁷·25/0,005 = 10⁻³ T EXACTO → «0,00100 T»; y en el arranque
 *        de Corrientes, F/L = 2·10⁻⁷·10·10/0,02 = 10⁻³ N/m → «0,00100 N/m».
 *   R5 · mantisa que redondea a 10 (hallazgo nuevo): protón, v = 5,2·10⁶ m/s, B = 1,2 T, θ = 90°
 *        → F = 9,997582·10⁻¹³ N, que con 2 decimales es «1,00 × 10⁻¹² N».
 *   R6 · inducción (hallazgo nuevo): barra con B = 0,2 T, L = 0,3 m, v = 2 m/s, R = 25 Ω →
 *        ε = 0,12 V · I = 4,8·10⁻³ A · F = B·I·L = 2,88·10⁻⁴ N · P = ε·I = 5,76·10⁻⁴ W.
 *        Alternador N = 10, B = 0,1 T, A = 0,01 m², f = 1 Hz → ε_máx = N·B·A·2πf = 0,0628319 V ·
 *        ε_ef = 0,0444288 V.
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
  // B_sol = μ₀·n·I = 4π·10⁻⁷·2000·25 = 0,0628319 T → 3 cifras significativas: «0,0628 T»
  const sol = valorDeFila(page, 'Campo del solenoide');
  await expect(sol).toHaveText('0,0628 T');
  expect(leerCifra(await sol.innerText()) / 0.0628319).toBeCloseTo(1, 2);

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
  // Hallazgo 1345 (reparado 24/09/2026): la app calculaba v·cos θ·T con Math.cos(π/2) =
  // 6,12·10⁻¹⁷ y en el arranque mostraba «4,017 × 10⁻¹⁷ m». Con 45° el paso sí existe:
  // 5·10⁶·cos 45°·1,311889·10⁻⁷ = 0,463826 m → «0,464 m». Luego se vuelve a 90°.
  await sembrarValor(page, '#anguloVB', 45);
  await expect(valorDeFila(page, 'Paso de la hélice')).toHaveText('0,464 m');
  await sembrarValor(page, '#anguloVB', 90);
  await expect(valorDeFila(page, 'Paso de la hélice')).toHaveText('0 m');
});

test('caso 2a-dibujo · con F = 0 el lienzo no pinta un vector fuerza', async ({ page }) => {
  // Hallazgo 1346 (reparado 24/09/2026): con θ = 0° la tabla decía «0 N» pero el SVG seguía
  // dibujando la flecha F con 48 px de largo fijo. Ahora el largo es 48 px·F/F_ref (acotado).
  const flecha = page.locator('[class*="vFuerza"] line');
  const largo = () =>
    flecha.evaluate((l) => {
      const n = (a: string) => Number(l.getAttribute(a));
      return Math.hypot(n('x2') - n('x1'), n('y2') - n('y1'));
    });
  // θ = 30° → sen 30° = 0,5 → F = 2,003·10⁻¹³ N → 24 px
  await sembrarValor(page, '#anguloVB', 30);
  await expect(valorDeFila(page, 'Fuerza F = q·v·B')).toHaveText('2,00 × 10⁻¹³ N');
  expect(await largo()).toBeCloseTo(24, 1);
  // θ = 0° → F = 0 → sin flecha
  await sembrarValor(page, '#anguloVB', 0);
  await expect(valorDeFila(page, 'Fuerza F = q·v·B')).toHaveText('0 N');
  await expect(page.locator('[class*="vFuerza"]')).toHaveCount(0);
});

test('caso 2a-dibujo-v · el lienzo dibuja v⊥ = v·sen θ, y con θ = 0° no hay flecha que girar', async ({ page }) => {
  // Sospecha del Inspector (24/09/2026), confirmada en el navegador antes de reparar: con
  // θ = 0° la trayectoria desaparecía (r = 0) pero la flecha v seguía midiendo 62 px y su
  // extremo pasaba de (339, 257) a (318, 212) en medio segundo: giraba en el plano ⊥ B sin v⊥.
  // Mismo patrón que el hallazgo 1346 con F. El lienzo es el plano perpendicular a B:
  //   θ = 90° → sen 90° = 1   → 62 px (v⊥ = v)
  //   θ = 30° → sen 30° = 0,5 → 31 px
  //   θ = 0°  → sen 0° = 0    → sin flecha (la partícula avanza a lo largo de B)
  const flecha = page.locator('[class*="vVelocidad"] line');
  const largo = () =>
    flecha.evaluate((l) => {
      const n = (a: string) => Number(l.getAttribute(a));
      return Math.hypot(n('x2') - n('x1'), n('y2') - n('y1'));
    });
  await sembrarValor(page, '#anguloVB', 30);
  await expect.poll(largo).toBeCloseTo(31, 1);
  await expect(page.locator('[class*="vVelocidad"] text')).toHaveText('v⊥');
  await sembrarValor(page, '#anguloVB', 90);
  await expect.poll(largo).toBeCloseTo(62, 1);
  await sembrarValor(page, '#anguloVB', 0);
  await expect(valorDeFila(page, 'Componente v perpendicular')).toHaveText('0 m/s');
  await expect(page.locator('[class*="vVelocidad"]')).toHaveCount(0);
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
  // Hallazgo 1344 (reparado 24/09/2026): formatCientifico usaba decimales FIJOS en
  // [10⁻³, 10⁵) y en la franja del militesla se comía las cifras significativas. I = 30 A,
  // r = 0,5 cm: B = 2·10⁻⁷·30/0,005 = 1,2·10⁻³ T; la tabla daba «0,001 T» (−17 %) y la
  // etiqueta del lienzo «B = 0,00 T». Ahora se garantizan 3 cifras significativas.
  await irACorrientes(page);
  await sembrarValor(page, '#corriente', 30);
  await sembrarValor(page, '#distancia', 0.005);
  const hilo = valorDeFila(page, 'Campo de un hilo recto');
  await expect(hilo).toHaveText('0,00120 T');
  expect(leerCifra(await hilo.innerText()) / 1.2e-3).toBeCloseTo(1, 2);
  await expect(page.locator('svg text').filter({ hasText: /^B = / })).toHaveText('B = 0,00120 T');
  // I₁ = I₂ = 30 A a 4 cm: F/L = 2·10⁻⁷·30·30/0,04 = 4,5·10⁻³ N/m
  await sembrarValor(page, '#corriente2', 30);
  await sembrarValor(page, '#separacion', 0.04);
  await expect(valorDeFila(page, 'Fuerza entre hilos')).toHaveText('0,00450 N/m');
});

test('caso 3b-energía · electrón a 2·10⁶ m/s: 11,37 eV no puede salir «0,01 keV»', async ({ page }) => {
  // E = ½·m_e·v² / e = ½·9,1093837·10⁻³¹·(2·10⁶)² / 1,602176634·10⁻¹⁹ = 11,3712 eV
  // = 0,0113712 keV → 3 cifras significativas: «0,0114 keV» (antes «0,01 keV»: hallazgo 1344)
  await page.getByRole('button', { name: /Electrón/ }).click();
  await sembrarValor(page, '#velocidad', 2);
  const energia = valorDeFila(page, 'Energía cinética');
  await expect(energia).toHaveText('0,0114 keV');
  expect(leerCifra(await energia.innerText()) / 0.0113712).toBeCloseTo(1, 2);
});

// ── Dibujo y accesibilidad ────────────────────────────────────────────────────────────

test('dibujo · el punto de medida del hilo se aleja cuando crece la distancia', async ({ page }) => {
  // Hallazgo 1347 (reparado 24/09/2026): el punto de medida estaba fijo en cx = 490 sea cual
  // sea r. Ahora cx = 420 + 300·ln(r/0,005)/ln(100): r = 2 cm → 510,3 · r = 40 cm → 705,5.
  await irACorrientes(page);
  await sembrarValor(page, '#distancia', 0.02);
  await expect(page.locator('svg text').filter({ hasText: 'del hilo' })).toHaveText('a 2,0 cm del hilo');
  const cerca = Number(await page.locator('[class*="puntoMedida"]').getAttribute('cx'));
  expect(cerca).toBeCloseTo(510.3, 0);
  await sembrarValor(page, '#distancia', 0.4);
  await expect(page.locator('svg text').filter({ hasText: 'del hilo' })).toHaveText('a 40,0 cm del hilo');
  const lejos = Number(await page.locator('[class*="puntoMedida"]').getAttribute('cx'));
  expect(lejos).toBeCloseTo(705.5, 0);
  // Sin salirse del lienzo (760 px)
  expect(lejos).toBeLessThan(760);
});

test('a11y · el botón «Pausar» no se anuncia como pulsado mientras la animación corre', async ({ page }) => {
  // Hallazgo 1348 (reparado 24/09/2026): el botón cambia de rótulo (Pausar/Reanudar) y además
  // llevaba aria-pressed={reproduciendo}: un lector decía «Pausar, pulsado» con la animación en
  // marcha. Un botón de acción con rótulo cambiante no lleva aria-pressed.
  const boton = page.getByRole('button', { name: 'Pausar' });
  await expect(boton).toBeVisible();
  await expect(boton).not.toHaveAttribute('aria-pressed');
  await boton.click();
  const reanudar = page.getByRole('button', { name: 'Reanudar' });
  await expect(reanudar).toBeVisible();
  await expect(reanudar).not.toHaveAttribute('aria-pressed');
});

// ── REINSPECCIÓN 25/09/2026 ───────────────────────────────────────────────────────────

test('R1 · hilo recto: 40 μT con I = 10 A a 5 cm, y B ∝ I/r', async ({ page }) => {
  await irACorrientes(page);
  const hilo = valorDeFila(page, 'Campo de un hilo recto');
  // Se parte de otro estado: I = 40 A, r = 0,10 m → 2·10⁻⁷·40/0,10 = 8·10⁻⁵ T
  await sembrarValor(page, '#corriente', 40);
  await sembrarValor(page, '#distancia', 0.1);
  await expect(hilo).toHaveText('8,000 × 10⁻⁵ T');
  // I = 10 A, r = 0,05 m → B = μ₀I/(2πr) = 2·10⁻⁷·10/0,05 = 4·10⁻⁵ T (40 μT)
  await sembrarValor(page, '#corriente', 10);
  await sembrarValor(page, '#distancia', 0.05);
  await expect(hilo).toHaveText('4,000 × 10⁻⁵ T');
  // ±0,5 %: un factor 2π o un prefijo mal puesto quedan muy fuera
  expect(leerCifra(await hilo.innerText()) / 4e-5).toBeCloseTo(1, 2);
  await expect(page.locator('svg text').filter({ hasText: /^B = / })).toHaveText('B = 4,00 × 10⁻⁵ T');
  // Espira μ₀I/(2R) = 4π·10⁻⁷·10/0,10 = 1,256637·10⁻⁴ T
  await expect(valorDeFila(page, 'Campo en el centro de una espira')).toHaveText('1,257 × 10⁻⁴ T');
  await expect(page.locator('[class*="resultBlock"]')).not.toContainText(/NaN|∞|Infinity|No definido/);
});

test('R2 · Lorentz: electrón a 10⁶ m/s en 0,01 T con θ = 90°, 30° y 0°', async ({ page }) => {
  await page.getByRole('button', { name: /Electrón/ }).click();
  await sembrarValor(page, '#velocidad', 1);
  await sembrarValor(page, '#campo', 0.01);
  const f = valorDeFila(page, 'Fuerza F = q·v·B');
  const r = valorDeFila(page, 'Radio r =');
  const periodo = valorDeFila(page, 'Periodo T =');
  const paso = valorDeFila(page, 'Paso de la hélice');
  const vPerp = valorDeFila(page, 'Componente v perpendicular');

  // θ = 90° (arranque). F = e·v·B = 1,602177·10⁻¹⁵ N
  await expect(f).toHaveText('1,60 × 10⁻¹⁵ N');
  // r = mₑ·v/(e·B) = 5,685630·10⁻⁴ m (precisión 3: el radio lleva 4 cifras)
  await expect(r).toHaveText('5,686 × 10⁻⁴ m');
  expect(leerCifra(await r.innerText()) / 5.68563e-4).toBeCloseTo(1, 3);
  // T = 2π·mₑ/(e·B) = 3,572387·10⁻⁹ s · f = 2,799249·10⁸ Hz
  await expect(periodo).toHaveText('3,57 × 10⁻⁹ s');
  await expect(valorDeFila(page, 'Frecuencia de ciclotrón')).toHaveText('2,80 × 10⁸ Hz');
  await expect(paso).toHaveText('0 m');
  // E = ½·mₑ·v²/e = 2,842815 eV = 0,002842815 keV → 3 cifras significativas
  await expect(valorDeFila(page, 'Energía cinética')).toHaveText('0,00284 keV');
  // Carga negativa con B saliente: ω = −qB/m apunta a +z → antihorario
  await expect(page.locator('[class*="canvasHint"]')).toContainText('Giro antihorario');

  // θ = 30°: sen = 0,5 · cos = 0,8660254
  await sembrarValor(page, '#anguloVB', 30);
  await expect(f).toHaveText('8,01 × 10⁻¹⁶ N');
  await expect(r).toHaveText('2,843 × 10⁻⁴ m');
  await expect(vPerp).toHaveText('5,00 × 10⁵ m/s');
  await expect(periodo).toHaveText('3,57 × 10⁻⁹ s');
  // paso = v·cos θ·T = 10⁶·0,8660254·3,572387·10⁻⁹ = 3,093778·10⁻³ m (rama decimal nueva)
  await expect(paso).toHaveText('0,00309 m');
  expect(leerCifra(await paso.innerText()) / 3.093778e-3).toBeCloseTo(1, 2);

  // θ = 0°: F, r y v⊥ nulos; el «paso» es v·T = 3,572387·10⁻³ m
  await sembrarValor(page, '#anguloVB', 0);
  await expect(f).toHaveText('0 N');
  await expect(r).toHaveText('0 m');
  await expect(vPerp).toHaveText('0 m/s');
  await expect(paso).toHaveText('0,00357 m');
});

test('R3 · solenoide N = 1000, L = 0,50 m, I = 10 A: B = μ₀·n·I = 0,0251 T', async ({ page }) => {
  await irACorrientes(page);
  await sembrarValor(page, '#vueltas', 1000);
  await sembrarValor(page, '#longitudSolenoide', 0.5);
  // n = 1000/0,50 = 2000 /m · B = 4π·10⁻⁷·2000·10 = 0,02513274 T
  await expect(valorDeFila(page, 'Espiras por metro')).toHaveText('2000 /m');
  const sol = valorDeFila(page, 'Campo del solenoide');
  await expect(sol).toHaveText('0,0251 T');
  expect(leerCifra(await sol.innerText()) / 0.02513274).toBeCloseTo(1, 2);
});

test('R4 · bordes de formatCientifico: 10⁵ exacto, justo por debajo y 10⁻³ exacto', async ({ page }) => {
  const vPerp = valorDeFila(page, 'Componente v perpendicular');
  // v = 0,1·10⁶ m/s con θ = 90° (arranque) → v⊥ = 10⁵ m/s EXACTO: ya es notación científica
  await sembrarValor(page, '#velocidad', 0.1);
  await expect(vPerp).toHaveText('1,00 × 10⁵ m/s');
  // θ = 89° → 10⁵·sen 89° = 99.984,77 m/s: rama decimal, con el punto de miles
  await sembrarValor(page, '#anguloVB', 89);
  await expect(vPerp).toHaveText('99.984,77 m/s');

  await irACorrientes(page);
  // Arranque de Corrientes: F/L = 2·10⁻⁷·10·10/0,02 = 10⁻³ N/m EXACTO
  await expect(valorDeFila(page, 'Fuerza entre hilos')).toHaveText('0,00100 N/m');
  // I = 25 A a 0,5 cm: B = 2·10⁻⁷·25/0,005 = 10⁻³ T EXACTO, en la tabla y en el dibujo
  await sembrarValor(page, '#corriente', 25);
  await sembrarValor(page, '#distancia', 0.005);
  await expect(valorDeFila(page, 'Campo de un hilo recto')).toHaveText('0,00100 T');
  await expect(page.locator('svg text').filter({ hasText: /^B = / })).toHaveText('B = 0,00100 T');
});

test('R5 · la mantisa de la notación científica no puede redondear a «10,00»', async ({ page }) => {
  // HALLAZGO 2166, REPARADO el 26/09/2026 (el exponente se fija tras redondear la mantisa). Era: formatCientifico (page.tsx:73-74) fija el
  // exponente con Math.floor(log10) ANTES de redondear la mantisa, y una mantisa ≥ 9,995 sale
  // «10,00». La cifra vale lo mismo; la notación deja de estar normalizada.
  const f = valorDeFila(page, 'Fuerza F = q·v·B');
  // Protón, v = 5,2·10⁶ m/s, B = 1,2 T, θ = 90° (arranque): F = e·v·B = 9,997582·10⁻¹³ N
  await sembrarValor(page, '#velocidad', 5.2);
  await sembrarValor(page, '#campo', 1.2);
  // El valor numérico es correcto (±0,5 %): lo que falla es cómo se escribe
  await expect.poll(async () => leerCifra(await f.innerText()) / 9.997582e-13).toBeCloseTo(1, 2);
  await expect(f).toHaveText('1,00 × 10⁻¹² N'); // hoy «10,00 × 10⁻¹³ N»
  // v = 1·10⁶ m/s, θ = 89° → v⊥ = 999.847,7 m/s → «1,00 × 10⁶ m/s» (hoy «10,00 × 10⁵ m/s»)
  await sembrarValor(page, '#velocidad', 1);
  await sembrarValor(page, '#anguloVB', 89);
  await expect(valorDeFila(page, 'Componente v perpendicular')).toHaveText('1,00 × 10⁶ m/s');
  // Borde 10⁻³: v = 0,5·10⁶ m/s, B = 2,61 T, θ = 30° → r = m_p·v·sen 30°/(e·B) = 9,99970·10⁻⁴ m
  // → «0,00100 m» o «1,000 × 10⁻³ m» (hoy «10,000 × 10⁻⁴ m»)
  await sembrarValor(page, '#velocidad', 0.5);
  await sembrarValor(page, '#campo', 2.61);
  await sembrarValor(page, '#anguloVB', 30);
  await expect(valorDeFila(page, 'Radio r =')).toHaveText(/^(0,00100|1,000 × 10⁻³) m$/);
});

test('R6 · inducción: fem, corriente, frenado y potencia conservan sus cifras significativas', async ({ page }) => {
  // HALLAZGO 2165, REPARADO el 26/09/2026 (Inducción pasa por formatCientifico). Era: la pestaña Inducción presenta con
  // formatNumber y decimales FIJOS (page.tsx:1340, 1346, 1364, 1377, 1383, 1389, 1395), la
  // misma clase de defecto que el 1344, en una ruta que no pasa por formatCientifico.
  await page.getByRole('button', { name: 'Inducción', exact: true }).click();
  await page.getByRole('button', { name: 'Barra sobre raíles' }).click();
  await esperarHidratacion(page, ['#campoBarra', '#longitudBarra', '#velocidadBarra', '#resistencia']);
  // Barra: B = 0,2 T, L = 0,3 m, v = 2 m/s, R = 25 Ω
  await sembrarValor(page, '#campoBarra', 0.2);
  await sembrarValor(page, '#longitudBarra', 0.3);
  await sembrarValor(page, '#velocidadBarra', 2);
  await sembrarValor(page, '#resistencia', 25);
  // ε = B·L·v = 0,12 V (este sale bien: «0,120 V»)
  await expect(valorDeFila(page, 'fem inducida')).toHaveText('0,120 V');
  // I = ε/R = 4,8·10⁻³ A · F = B·I·L = 2,88·10⁻⁴ N · P = ε·I = 5,76·10⁻⁴ W.
  // Hoy «0,005 A» (+4 %), «0,0003 N» (+4 %) y «0,001 W» (+74 %). Precisión 2 (±0,5 %).
  expect(leerCifra(await valorDeFila(page, 'Potencia disipada').innerText()) / 5.76e-4).toBeCloseTo(1, 2);
  expect(leerCifra(await valorDeFila(page, 'Corriente inducida').innerText()) / 4.8e-3).toBeCloseTo(1, 2);
  expect(leerCifra(await valorDeFila(page, 'Fuerza de frenado').innerText()) / 2.88e-4).toBeCloseTo(1, 2);
  // Por debajo de 10⁻⁴ formatNumber escribía «≈0»: B = 0,05 T, L = 0,2 m, v = 2 m/s, R = 10 Ω →
  // ε = 0,02 V · I = 2·10⁻³ A · F = 0,05·0,002·0,2 = 2·10⁻⁵ N · P = 0,02·0,002 = 4·10⁻⁵ W
  await sembrarValor(page, '#campoBarra', 0.05);
  await sembrarValor(page, '#longitudBarra', 0.2);
  await sembrarValor(page, '#resistencia', 10);
  await expect(valorDeFila(page, 'Fuerza de frenado')).toHaveText('2,000 × 10⁻⁵ N');
  await expect(valorDeFila(page, 'Potencia disipada')).toHaveText('4,000 × 10⁻⁵ W');

  // Alternador: N = 10, B = 0,1 T, A = 0,01 m², f = 1 Hz
  await page.getByRole('button', { name: 'Espira giratoria' }).click();
  await esperarHidratacion(page, ['#espiras', '#area', '#campoInduccion', '#frecuencia']);
  await sembrarValor(page, '#espiras', 10);
  await sembrarValor(page, '#area', 0.01);
  await sembrarValor(page, '#campoInduccion', 0.1);
  await sembrarValor(page, '#frecuencia', 1);
  // ε_máx = N·B·A·2πf = 0,0628319 V · ε_ef = 0,0444288 V (hoy «0,1 V» y «0,0 V»)
  expect(leerCifra(await valorDeFila(page, 'fem máxima').innerText()) / 0.0628319).toBeCloseTo(1, 2);
  expect(leerCifra(await valorDeFila(page, 'fem eficaz').innerText()) / 0.0444288).toBeCloseTo(1, 2);
});

test('R7 · la cota del dibujo del hilo no tacha el rótulo de la distancia', async ({ page }) => {
  // HALLAZGO 2167, REPARADO el 26/09/2026 (con el rótulo a la izquierda, la distancia va bajo la
  // cota). Era, nacido con la reparación del 1347: la cota
  // punteada va a y = 210 desde el hilo hasta el punto de medida, y cuando el rótulo pasa a la
  // izquierda del punto (r ≳ 4,3 cm, arranque incluido) su caja [201; 216] queda tachada.
  await irACorrientes(page);
  const rotulo = page.locator('svg text').filter({ hasText: 'del hilo' });
  const cotaTachaRotulo = () =>
    page.locator('svg[aria-label^="Hilo"]').evaluate((svg) => {
      const cota = svg.querySelector('[class*="cotaMedida"]');
      const texto = Array.from(svg.querySelectorAll('text')).find((t) =>
        (t.textContent ?? '').includes('del hilo'),
      );
      if (!cota || !texto) return null;
      const caja = texto.getBBox();
      const n = (a: string) => Number(cota.getAttribute(a));
      const desde = Math.min(n('x1'), n('x2'));
      const hasta = Math.max(n('x1'), n('x2'));
      const solapaX = caja.x < hasta && caja.x + caja.width > desde;
      const solapaY = n('y1') > caja.y && n('y1') < caja.y + caja.height;
      return solapaX && solapaY;
    });
  // Control: a 2 cm el rótulo va a la derecha del punto y la cota no lo toca
  await sembrarValor(page, '#distancia', 0.02);
  await expect(rotulo).toHaveText('a 2,0 cm del hilo');
  expect(await cotaTachaRotulo()).toBe(false);
  // 5 cm (el arranque): el rótulo pasa a la izquierda, encima de la cota
  await sembrarValor(page, '#distancia', 0.05);
  await expect(rotulo).toHaveText('a 5,0 cm del hilo');
  expect(await cotaTachaRotulo()).toBe(false);
});

test('R8 · con θ = 0° el texto no anuncia giro ni trayectoria circular', async ({ page }) => {
  // HALLAZGO 2168, REPARADO el 26/09/2026 (pista y aria-label según v⊥). Era: con θ = 0° la tabla da F = 0 y v⊥ = 0 y el
  // lienzo ya no dibuja circunferencia, pero la pista dice «Giro horario/antihorario · el tamaño
  // del círculo sigue al radio real» y el aria-label del SVG, «Trayectoria circular de …»
  // (page.tsx:559 y 651-656). La partícula avanza en línea recta a lo largo de B.
  const pista = page.locator('[class*="canvasHint"]');
  const lienzo = page.locator('[class*="canvasSvg"]').first();
  // Control a 90° (arranque): protón con B saliente, circunferencia en sentido horario
  await expect(pista).toContainText('Giro horario');
  await expect(lienzo).toHaveAttribute('aria-label', /circular/);
  await sembrarValor(page, '#anguloVB', 0);
  await expect(valorDeFila(page, 'Componente v perpendicular')).toHaveText('0 m/s');
  await expect(page.locator('[class*="trayectoria"]')).toHaveCount(0);
  await expect(pista).not.toContainText(/Giro (horario|antihorario)/);
  await expect(lienzo).not.toHaveAttribute('aria-label', /circular/);
});

test('a11y · 1348 también en Inducción: «Pausar» sin aria-pressed', async ({ page }) => {
  // El hallazgo 1348 citaba las pestañas Lorentz e Inducción; el test de arriba cubre Lorentz.
  await page.getByRole('button', { name: 'Inducción', exact: true }).click();
  await esperarHidratacion(page, ['#espiras']);
  const boton = page.getByRole('button', { name: 'Pausar' });
  await expect(boton).toBeVisible();
  await expect(boton).not.toHaveAttribute('aria-pressed');
  await boton.click();
  await expect(page.getByRole('button', { name: 'Reanudar' })).not.toHaveAttribute('aria-pressed');
});
