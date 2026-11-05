import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarPaginaAsentada, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * visualizador-algebra-lineal — Inspector, 05/11/2026 (primera inspección, con el cabo C0252)
 *
 * Lo que promete: «Álgebra Lineal Visual», cuatro modos con deslizadores y un SVG de 350 × 350
 * (origen en (175, 175), 30 px por unidad, y hacia arriba): Vectores 2D (u·v, |u|, |v| y ángulo,
 * paso 0,5 de −5 a 5), Transformaciones (matriz [a b; c d] de −3 a 3, paso 0,1, det(A), mensaje
 * de orientación, cuadrícula transformada y Ae₁, Ae₂), Determinante (columnas v₁ = (a, c) y
 * v₂ = (b, d), paso 0,5, área = |det|) y Eigenvalores de una simétrica [a b; b d] (paso 0,5).
 * Sin motor aparte: todo está en page.tsx. No hay campos de texto: el «rechazo» es el recorte
 * del propio deslizador.
 *
 * ESPERADOS, resueltos a mano ANTES de abrir la app
 *   Vectores · u = (3, 1), v = (1, 3) (inicial): u·v = 3 + 3 = 6 · |u| = |v| = √10 = 3,1623 ·
 *              cos θ = 6/10 = 0,6 → θ = 53,130° → «53,1°».
 *            · u = (3, 4), v = (−2,5, 0): u·v = −7,5 · |u| = 5 · |v| = 2,5 · cos θ = −7,5/12,5 =
 *              −0,6 → θ = 126,870° → «126,9°».
 *            · u = (4, −2), v = (1, 2): u·v = 4 − 4 = 0 → θ = 90° · |u| = √20 = 4,472 · |v| = √5 = 2,236.
 *            · u = (0, 0): el ángulo con un vector nulo NO está definido (cos θ = 0/0).
 *   Transf.  · A = [2 −1; 1 1,5]: det = 3 + 1 = 4 · Ae₁ = (a, c) = (2, 1) → SVG (235, 145) ·
 *              Ae₂ = (b, d) = (−1, 1,5) → (145, 130). Con filas en vez de columnas, Ae₁ iría a (235, 205).
 *            · Rotación de 90°, A = [0 −1; 1 0]: det = 0 − (−1)(1) = 1 · e₁ → (0, 1) = (175, 145) ·
 *              e₂ → (−1, 0) = (145, 175).
 *            · Reflexión [1 0; 0 −1]: det = −1 → orientación invertida · e₂ → (0, −1) = (175, 205).
 *            · Singular [1 2; 0,5 1]: det = 1 − 1 = 0 → «no invertible».
 *            · Singular [0,3 0,1; 0,9 0,3] (columna 1 = 3 · columna 2) y [0,1 0,3; 0,3 0,9]
 *              (fila 2 = 3 · fila 1): det = 0,09 − 0,09 = 0 → «no invertible». En coma flotante
 *              0,3·0,3 − 0,1·0,9 = −1,39·10⁻¹⁷ y 0,1·0,9 − 0,3·0,3 = +1,39·10⁻¹⁷: de las 42.721
 *              matrices singulares que dan los deslizadores, 4.128 (9,7 %) no dan 0 exacto.
 *   Determ.  · [2 1; 0 2] (inicial): det = 4, área 4 · vértices O (175, 175), v₁ = (2, 0) → (235, 175),
 *              v₁ + v₂ = (3, 2) → (265, 115), v₂ = (1, 2) → (205, 115).
 *            · a = 1, b = 3, c = 2, d = 1: det = 1 − 6 = −5 → área 5, orientación invertida (rojo).
 *            · v₁ = (2, 4), v₂ = (1, 2): det = 4 − 4 = 0 → colineales.
 *   Eigen    · [2 1; 1 2] (inicial): traza 4, det 3 → λ = 2 ± √(4 − 3) → 3 y 1 · v₁ = (1, 1)/√2 =
 *              (0,707; 0,707), v₂ = (1, −1)/√2 · A·v₁ = 3·v₁ = (2,121; 2,121) → SVG (238,64; 111,36).
 *            · [1 2; 2 −2]: traza −1, det −6 → λ = −0,5 ± √(0,25 + 6) = −0,5 ± 2,5 → 2 y −3 ·
 *              v₁ = (2, 1)/√5 = (0,894; 0,447), v₂ = (2, −4)/√20 = (0,447; −0,894) ·
 *              A·v₂ = −3·v₂ = (−1,342; 2,683) → SVG (134,75; 94,50).
 *            · [3 0; 0 −1]: λ₁ = 3 con (1, 0), λ₂ = −1 con (0, 1).
 *            · [2 0; 0 2] = 2·I: λ₁ = λ₂ = 2 y TODO vector es propio; la página afirma «eigenvectores
 *              ortogonales», así que se esperan dos ortogonales, p. ej. (1, 0) y (0, 1).
 *
 * HALLAZGOS ABIERTOS (inspector 05/11/2026): los test.fail() del final. Cada uno afirma lo que la
 * app DEBERÍA hacer, así que hoy falla «como se espera»; al repararse, se quita el test.fail().
 */

const URL_APP = '/visualizador-algebra-lineal/';

const U_X = 'input[aria-label="Componente x del vector u"]';
const U_Y = 'input[aria-label="Componente y del vector u"]';
const V_X = 'input[aria-label="Componente x del vector v"]';
const V_Y = 'input[aria-label="Componente y del vector v"]';
const T_A = 'input[aria-label="Componente a de la matriz"]';
const T_B = 'input[aria-label="Componente b de la matriz"]';
const T_C = 'input[aria-label="Componente c de la matriz"]';
const T_D = 'input[aria-label="Componente d de la matriz"]';
const D_A = 'input[aria-label="Componente a"]';
const D_B = 'input[aria-label="Componente b"]';
const D_C = 'input[aria-label="Componente c"]';
const D_D = 'input[aria-label="Componente d"]';
const E_A = 'input[aria-label="Componente a de la matriz simétrica"]';
const E_B = 'input[aria-label="Componente b (off-diagonal) de la matriz simétrica"]';
const E_D = 'input[aria-label="Componente d de la matriz simétrica"]';

/**
 * «−7,50», «-7.50», «53,1°» → número. Admite los dos separadores decimales porque el formato
 * tiene su propio caso (cabo C0252, abajo): aquí se vigila la CIFRA. Sin coma, el punto es el
 * decimal de hoy («1.000» = 1); con coma, es español («1.234,5»).
 */
function aNumero(texto: string | null): number {
  let t = (texto ?? '').replace(/[−‒–]/g, '-').replace(/[°\s ]/g, '');
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  return t === '' ? NaN : Number(t);
}

/** «(0.71, -0.71)» hoy o «(0,71; −0,71)» en español → [0.71, −0.71]. */
function aVector(texto: string | null): number[] {
  const m = (texto ?? '').match(/\(([^)]*)\)/);
  if (!m) return [NaN, NaN];
  const partes = m[1].includes(';') ? m[1].split(';') : m[1].split(/,\s+/);
  return partes.map((p) => aNumero(p));
}

async function abrir(page: Page): Promise<void> {
  await page.goto(URL_APP);
  await esperarHidratacion(page, [U_X]);
}

async function pestana(page: Page, nombre: string, testigo: string): Promise<void> {
  await page.getByRole('tab', { name: nombre, exact: true }).click();
  await esperarHidratacion(page, [testigo]);
}

/** La cifra de la tarjeta cuyo rótulo es exactamente `nombre`, en la pestaña visible. */
function valorDe(page: Page, nombre: string): Locator {
  return page
    .locator('[role="tabpanel"]')
    .getByText(nombre, { exact: true })
    .locator('xpath=following-sibling::*[1]');
}

async function leer(loc: Locator): Promise<number> {
  return aNumero(await loc.textContent());
}

async function punta(loc: Locator): Promise<[number, number]> {
  return [Number(await loc.getAttribute('x2')), Number(await loc.getAttribute('y2'))];
}

const mensajeDet = (page: Page): Locator => page.locator('[role="tabpanel"] [class*="detMensaje"]');
const ae1 = (page: Page): Locator => page.locator('[role="tabpanel"] svg > line[stroke="#2E86AB"]');
const ae2 = (page: Page): Locator => page.locator('[role="tabpanel"] svg > line[stroke="#48A9A6"]');

async function eigen(page: Page): Promise<{ l1: number; l2: number; v1: number[]; v2: number[] }> {
  const valores = await page.locator('[role="tabpanel"] [class*="eigenValor"]').allTextContents();
  const vectores = await page.locator('[role="tabpanel"] [class*="eigenVec"]').allTextContents();
  return { l1: aNumero(valores[0]), l2: aNumero(valores[1]), v1: aVector(vectores[0]), v2: aVector(vectores[1]) };
}

// ═══════════════════════════════════════════════════════════════════════════
// Vectores 2D
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Vectores 2D — producto escalar, módulos y ángulo', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('inicial u = (3, 1), v = (1, 3): u·v 6, |u| = |v| = √10 = 3,16 y ángulo 53,1°', async ({ page }) => {
    expect(await leer(valorDe(page, 'u · v'))).toBeCloseTo(6, 2);
    expect(await leer(valorDe(page, '|u|'))).toBeCloseTo(3.16, 2);
    expect(await leer(valorDe(page, '|v|'))).toBeCloseTo(3.16, 2);
    // acos(0,6) = 53,130° → 1 decimal
    expect(await leer(valorDe(page, 'Ángulo'))).toBeCloseTo(53.1, 1);
  });

  test('u = (3, 4), v = (−2,5, 0): u·v −7,5, |u| 5, |v| 2,5 y ángulo 126,9°', async ({ page }) => {
    await sembrarValor(page, U_Y, 4); // u parte de (3, 1)
    await sembrarValor(page, V_X, -2.5); // v parte de (1, 3)
    await sembrarValor(page, V_Y, 0);
    expect(await leer(valorDe(page, 'u · v'))).toBeCloseTo(-7.5, 2);
    expect(await leer(valorDe(page, '|u|'))).toBeCloseTo(5, 2);
    expect(await leer(valorDe(page, '|v|'))).toBeCloseTo(2.5, 2);
    // cos θ = −7,5 / (5 · 2,5) = −0,6 → θ = 126,870°
    expect(await leer(valorDe(page, 'Ángulo'))).toBeCloseTo(126.9, 1);
  });

  test('u = (4, −2), v = (1, 2): perpendiculares, u·v 0 y 90,0°', async ({ page }) => {
    await sembrarValor(page, U_X, 4);
    await sembrarValor(page, U_Y, -2);
    await sembrarValor(page, V_Y, 2); // v = (1, 2)
    expect(await leer(valorDe(page, 'u · v'))).toBeCloseTo(0, 2);
    expect(await leer(valorDe(page, '|u|'))).toBeCloseTo(4.47, 2); // √20 = 4,472
    expect(await leer(valorDe(page, '|v|'))).toBeCloseTo(2.24, 2); // √5 = 2,236
    expect(await leer(valorDe(page, 'Ángulo'))).toBeCloseTo(90, 1);
  });

  test('fuera de rango: 10 se queda en 5 y «abc» en 0; nunca NaN', async ({ page }) => {
    // El control es <input type="range" min=-5 max=5>: recorta al máximo y, con un valor que
    // no es número, toma su valor por defecto, el punto medio (0).
    expect(await sembrarValorAcotado(page, U_X, 10)).toBe('5');
    expect(await sembrarValorAcotado(page, U_Y, 'abc')).toBe('0');
    // u = (5, 0), v = (1, 3): u·v = 5 · |u| = 5 · cos θ = 5 / (5·√10) = 0,3162 → 71,6°
    expect(await leer(valorDe(page, 'u · v'))).toBeCloseTo(5, 2);
    expect(await leer(valorDe(page, '|u|'))).toBeCloseTo(5, 2);
    expect(await leer(valorDe(page, 'Ángulo'))).toBeCloseTo(71.6, 1);
    await expect(page.locator('[role="tabpanel"]')).not.toContainText('NaN');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Transformaciones
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Transformaciones — det(A) y vectores base transformados', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await pestana(page, 'Transformaciones', T_A);
  });

  test('A = [2 −1; 1 1,5]: det 4, Ae₁ = (2, 1) en (235, 145) y Ae₂ = (−1, 1,5) en (145, 130)', async ({ page }) => {
    await sembrarValor(page, T_A, 2); // parte de la identidad
    await sembrarValor(page, T_B, -1);
    await sembrarValor(page, T_C, 1);
    await sembrarValor(page, T_D, 1.5);
    expect(await leer(valorDe(page, 'det(A)'))).toBeCloseTo(4, 3);
    await expect(mensajeDet(page)).toContainText('det > 0: la orientación se preserva');
    // Las COLUMNAS son la imagen de la base: con filas, Ae₁ iría a (2, −1) = (235, 205).
    const [x1, y1] = await punta(ae1(page));
    expect(x1).toBeCloseTo(235, 1);
    expect(y1).toBeCloseTo(145, 1);
    const [x2, y2] = await punta(ae2(page));
    expect(x2).toBeCloseTo(145, 1);
    expect(y2).toBeCloseTo(130, 1);
  });

  test('rotación de 90° con los deslizadores [0 −1; 1 0]: det 1, e₁ → (0, 1) y e₂ → (−1, 0)', async ({ page }) => {
    await sembrarValor(page, T_A, 0);
    await sembrarValor(page, T_B, -1);
    await sembrarValor(page, T_C, 1);
    await sembrarValor(page, T_D, 0);
    expect(await leer(valorDe(page, 'det(A)'))).toBeCloseTo(1, 3);
    const [x1, y1] = await punta(ae1(page));
    expect([x1, y1]).toEqual([175, 145]);
    const [x2, y2] = await punta(ae2(page));
    expect([x2, y2]).toEqual([145, 175]);
  });

  test('preset Reflexión [1 0; 0 −1]: det −1, orientación invertida y rejilla roja', async ({ page }) => {
    await page.getByRole('button', { name: 'Reflexión', exact: true }).click();
    await expect(mensajeDet(page)).toContainText('det < 0: la orientación se invierte');
    expect(await leer(valorDe(page, 'det(A)'))).toBeCloseTo(-1, 3);
    const [x2, y2] = await punta(ae2(page));
    expect([x2, y2]).toEqual([175, 205]);
    await expect(page.locator('[role="tabpanel"] svg > path').last()).toHaveAttribute('stroke', 'rgba(231,76,60,0.5)');
  });

  test('singular [1 2; 0,5 1]: det 0 y el aviso de «no es invertible»', async ({ page }) => {
    await sembrarValor(page, T_B, 2);
    await sembrarValor(page, T_C, 0.5);
    // a = d = 1 de la identidad: det = 1·1 − 2·0,5 = 0 exacto también en coma flotante
    expect(await leer(valorDe(page, 'det(A)'))).toBe(0);
    await expect(mensajeDet(page)).toContainText('det = 0');
    await expect(mensajeDet(page)).toContainText('No es invertible');
  });

  test('fuera de rango: a ← 10 se queda en 3 y b ← «abc» en 0 (punto medio); det = 3·1 − 0 = 3', async ({ page }) => {
    await sembrarValor(page, T_B, 1); // parte de b = 0: así «abc» → 0 sí cambia algo
    expect(await sembrarValorAcotado(page, T_A, 10)).toBe('3');
    expect(await sembrarValorAcotado(page, T_B, 'abc')).toBe('0');
    expect(await leer(valorDe(page, 'det(A)'))).toBeCloseTo(3, 3);
    await expect(page.locator('[role="tabpanel"]')).not.toContainText('NaN');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Determinante como área
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Determinante — el paralelogramo de las columnas', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await pestana(page, 'Determinante', D_A);
  });

  test('inicial [2 1; 0 2]: det 4, área 4 y vértices (175,175) (235,175) (265,115) (205,115)', async ({ page }) => {
    expect(await leer(valorDe(page, 'det(A) = ad − bc'))).toBeCloseTo(4, 2);
    expect(await leer(valorDe(page, 'Área = |det|'))).toBeCloseTo(4, 2);
    await expect(page.locator('[role="tabpanel"] svg > polygon')).toHaveAttribute(
      'points',
      '175,175 235,175 265,115 205,115',
    );
  });

  test('a = 1, b = 3, c = 2, d = 1: det −5, área 5 y relleno rojo', async ({ page }) => {
    await sembrarValor(page, D_A, 1);
    await sembrarValor(page, D_B, 3);
    await sembrarValor(page, D_C, 2);
    await sembrarValor(page, D_D, 1);
    expect(await leer(valorDe(page, 'det(A) = ad − bc'))).toBeCloseTo(-5, 2);
    expect(await leer(valorDe(page, 'Área = |det|'))).toBeCloseTo(5, 2);
    // v₁ = (1, 2) → (205, 115) · v₁ + v₂ = (4, 3) → (295, 85) · v₂ = (3, 1) → (265, 145)
    const poligono = page.locator('[role="tabpanel"] svg > polygon');
    await expect(poligono).toHaveAttribute('points', '175,175 205,115 295,85 265,145');
    await expect(poligono).toHaveAttribute('fill', 'rgba(231,76,60,0.18)');
  });

  test('v₁ = (2, 4) y v₂ = (1, 2): área 0 y aviso de colineales', async ({ page }) => {
    await sembrarValor(page, D_C, 4); // a = 2, b = 1, d = 2 del estado inicial
    expect(await leer(valorDe(page, 'Área = |det|'))).toBe(0);
    await expect(mensajeDet(page)).toContainText('Los vectores son colineales');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Eigenvalores
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Eigenvalores — matriz simétrica [a b; b d]', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await pestana(page, 'Eigenvalores', E_A);
  });

  test('inicial [2 1; 1 2]: λ 3 y 1, v₁ (0,71; 0,71), v₂ (0,71; −0,71) y A·v₁ en (238,64; 111,36)', async ({ page }) => {
    const e = await eigen(page);
    expect(e.l1).toBeCloseTo(3, 3);
    expect(e.l2).toBeCloseTo(1, 3);
    expect(e.v1[0]).toBeCloseTo(0.71, 2);
    expect(e.v1[1]).toBeCloseTo(0.71, 2);
    expect(e.v2[0]).toBeCloseTo(0.71, 2);
    expect(e.v2[1]).toBeCloseTo(-0.71, 2);
    const [x, y] = await punta(page.locator('[role="tabpanel"] svg g line[stroke="#E67E22"]').first());
    expect(x).toBeCloseTo(238.64, 1);
    expect(y).toBeCloseTo(111.36, 1);
  });

  test('[1 2; 2 −2]: λ 2 y −3, v₁ (0,89; 0,45), v₂ (0,45; −0,89) y A·v₂ = −3·v₂ en (134,75; 94,50)', async ({ page }) => {
    await sembrarValor(page, E_A, 1);
    await sembrarValor(page, E_B, 2);
    await sembrarValor(page, E_D, -2);
    const e = await eigen(page);
    expect(e.l1).toBeCloseTo(2, 3);
    expect(e.l2).toBeCloseTo(-3, 3);
    expect(e.v1[0]).toBeCloseTo(0.89, 2);
    expect(e.v1[1]).toBeCloseTo(0.45, 2);
    expect(e.v2[0]).toBeCloseTo(0.45, 2);
    expect(e.v2[1]).toBeCloseTo(-0.89, 2);
    const [x, y] = await punta(page.locator('[role="tabpanel"] svg g line[stroke="#E67E22"]').last());
    expect(x).toBeCloseTo(134.75, 1);
    expect(y).toBeCloseTo(94.5, 1);
  });

  test('diagonal [3 0; 0 −1]: λ₁ 3 con (1, 0) y λ₂ −1 con (0, 1)', async ({ page }) => {
    await sembrarValor(page, E_A, 3);
    await sembrarValor(page, E_B, 0);
    await sembrarValor(page, E_D, -1);
    const e = await eigen(page);
    expect(e.l1).toBeCloseTo(3, 3);
    expect(e.l2).toBeCloseTo(-1, 3);
    expect(e.v1).toEqual([1, 0]);
    expect(e.v2).toEqual([0, 1]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS (inspector 05/11/2026)
// ═══════════════════════════════════════════════════════════════════════════

// HALLAZGO 4135 — REPARADO el 05/11/2026 (/reparar): las cifras pasan por formatNumber y los
// vectores separan sus componentes con «;». Lo que decía el caso (contenido, medio) — cabo C0252
// CONFIRMADO. Todas las cifras salían con toFixed(): punto decimal en las cuatro pestañas. Con la matriz identidad (estado inicial de «Transformaciones»)
// det(A) se lee «1.000», que en español es MIL; en el [2 −1; 1 1,5], «4.000».
// Caso: Transformaciones, identidad → esperado «1,000» · obtenido «1.000». Mismo defecto en u·v,
// |u|, |v|, el ángulo y la fórmula (L260-279), las etiquetas de los deslizadores (L228-254, L351,
// L466-490, L574-586), las celdas de la matriz (L364-367), det y área (L498, L502, el rótulo del
// SVG L533), λ y los eigenvectores (L595-610, que con coma decimal necesitan «;» entre
// componentes: «(0,71; −0,71)»), y el «95%» del bloque educativo sin espacio (L878).
test.describe('Formato español (cabo C0252)', () => {
  test('ninguna cifra de las cuatro pestañas lleva punto decimal, y el porcentaje va con espacio', async ({ page }) => {
    await abrir(page);
    // Texto de la página (también el bloque educativo, que está en el DOM aunque nazca plegado),
    // sin <script> ni <style>: «95%» → esperado «95 %».
    const porcentajesPegados = await page.evaluate(() => {
      const recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const pegados: string[] = [];
      for (let n = recorrido.nextNode(); n; n = recorrido.nextNode()) {
        const padre = n.parentElement?.tagName;
        if (padre === 'SCRIPT' || padre === 'STYLE' || padre === 'NOSCRIPT') continue;
        pegados.push(...((n.textContent ?? '').match(/\d+%/g) ?? []));
      }
      return pegados;
    });
    const textos: string[] = [];
    const recoger = async (): Promise<void> => {
      const panel = page.locator('[role="tabpanel"]');
      textos.push(
        ...(await panel.locator('[class*="metricaValor"], [class*="formulaBox"], [class*="eigenValor"], [class*="eigenVec"], [class*="matrizCeldas"] span').allTextContents()),
        ...(await panel.locator('label').allTextContents()),
        ...(await panel.locator('svg text').allTextContents()),
      );
    };
    await sembrarValor(page, V_X, -2.5);
    await recoger();
    await pestana(page, 'Transformaciones', T_A);
    await recoger();
    await pestana(page, 'Determinante', D_A);
    await sembrarValor(page, D_A, 0.5);
    await recoger();
    await pestana(page, 'Eigenvalores', E_A);
    await recoger();
    const conPunto = textos.map((t) => t.replace(/\s+/g, ' ').trim()).filter((t) => /\d\.\d/.test(t));
    expect({ conPunto, porcentajesPegados }).toEqual({ conPunto: [], porcentajesPegados: [] });
    // Y lo que el caso nombraba, con su forma española: det(A) de la identidad «1,000».
    await pestana(page, 'Transformaciones', T_A);
    await expect(valorDe(page, 'det(A)')).toHaveText('1,000');
    await pestana(page, 'Eigenvalores', E_A);
    await expect(page.locator('[role="tabpanel"] [class*="eigenVec"]').last()).toHaveText('v₂ = (0,71; -0,71)');
  });
});

// HALLAZGO 4136 — REPARADO el 05/11/2026 (/reparar): `limpiarCero` lleva a 0 un |det| < 10⁻⁹.
// Lo que decía el caso (calculo, medio) — det(A) se comparaba con 0 exacto en coma flotante. En el 9,7 % de las
// matrices singulares que dan los deslizadores (4.128 de 42.721) a·d − b·c deja un residuo de
// ±1,4·10⁻¹⁷ y la app dice lo contrario de «no invertible». Pasar el valor por formatNumber (la
// receta del cabo C0252) no lo arregla: saldría «≈0» con el mismo mensaje.
// Caso: [0,3 0,1; 0,9 0,3] → esperado «0,000» y «det = 0 … No es invertible» · obtenido «-0.000»
//       en rojo, «det < 0: la orientación se invierte» y la rejilla en rojo.
//       [0,1 0,3; 0,3 0,9] → esperado lo mismo · obtenido «0.000» y «det > 0: la orientación se
//       preserva».
test.describe('Transformaciones — una matriz singular es singular aunque la coma flotante deje residuo', () => {
  test('[0,3 0,1; 0,9 0,3] y [0,1 0,3; 0,3 0,9]: det = 0 y «no invertible»', async ({ page }) => {
    await abrir(page);
    await pestana(page, 'Transformaciones', T_A);
    await sembrarValor(page, T_A, 0.3);
    await sembrarValor(page, T_B, 0.1);
    await sembrarValor(page, T_C, 0.9);
    await sembrarValor(page, T_D, 0.3);
    const primera = await mensajeDet(page).textContent();
    await sembrarValor(page, T_A, 0.1);
    await sembrarValor(page, T_B, 0.3);
    await sembrarValor(page, T_C, 0.3);
    await sembrarValor(page, T_D, 0.9);
    const segunda = await mensajeDet(page).textContent();
    expect([primera, segunda].map((m) => (m ?? '').includes('det = 0'))).toEqual([true, true]);
    await expect(valorDe(page, 'det(A)')).toHaveText('0,000');
    // La rejilla no se pinta en rojo («orientación invertida») con un det que es cero.
    await expect(page.locator('[role="tabpanel"] svg > path').last()).toHaveAttribute('stroke', 'rgba(46,134,171,0.5)');
  });
});

// HALLAZGO 4138 — REPARADO el 05/11/2026 (/reparar): anguloEntreVectores devuelve null y la app
// dice «No definido», también en la fórmula. Lo que decía el caso (calculo, bajo) — con un vector
// nulo el ángulo no está definido (cos θ = 0/0), pero anguloEntreVectores devolvía 0 y la app
// afirmaba «0.0°», como si u y v apuntaran igual.
// Caso: u = (0, 0), v = (1, 3) → esperado ángulo «no definido» (o «—») · obtenido «0.0°» y la
//       fórmula «0.00 = 0.00 × 3.16 × cos(0.0°)».
test.describe('Vectores — ángulo con un vector nulo', () => {
  test('u = (0, 0): el ángulo no es una cifra', async ({ page }) => {
    await abrir(page);
    await sembrarValor(page, U_X, 0);
    await sembrarValor(page, U_Y, 0);
    expect(Number.isFinite(await leer(valorDe(page, 'Ángulo')))).toBe(false);
    await expect(valorDe(page, 'Ángulo')).toHaveText('No definido');
    await expect(page.locator('[role="tabpanel"] [class*="formulaBox"]')).toContainText('con θ no definido');
  });
});

// HALLAZGO 4137 — REPARADO el 05/11/2026 (/reparar): con A = a·I se muestran (1; 0) y (0; 1)
// y una nota dice que todo vector es propio. Lo que decía el caso:
// (calculo, medio) — con b = 0 y a = d (A = a·I) calcularEigenvector devuelve (1, 0)
// para los DOS eigenvalores: la app pinta v₁ = v₂ y las dos flechas se superponen, justo debajo
// de «Las matrices simétricas siempre tienen eigenvalores reales y eigenvectores ortogonales».
// Se llega desde el estado inicial [2 1; 1 2] moviendo solo b a 0.
// Caso: [2 0; 0 2] → esperado λ₁ = λ₂ = 2 con dos eigenvectores ortogonales, p. ej. (1, 0) y
//       (0, 1) · obtenido v₁ = (1.00, 0.00) y v₂ = (1.00, 0.00). Igual con la matriz nula.
test.describe('Eigenvalores — matriz escalar', () => {
  test('[2 0; 0 2]: los dos eigenvectores mostrados son ortogonales', async ({ page }) => {
    await abrir(page);
    await pestana(page, 'Eigenvalores', E_A);
    await sembrarValor(page, E_B, 0); // a = d = 2 del estado inicial
    const e = await eigen(page);
    expect(e.l1).toBeCloseTo(2, 3);
    expect(e.l2).toBeCloseTo(2, 3);
    expect(Math.abs(e.v1[0] * e.v2[0] + e.v1[1] * e.v2[1])).toBeLessThan(0.01);
    await expect(page.getByTestId('nota-matriz-escalar')).toContainText('todo vector es propio');
    // Y la matriz nula, el otro caso del acta: λ = 0 doble, también (1; 0) y (0; 1).
    await sembrarValor(page, E_A, 0);
    await sembrarValor(page, E_D, 0);
    const n = await eigen(page);
    expect(n.v1).toEqual([1, 0]);
    expect(n.v2).toEqual([0, 1]);
    // Fuera del caso escalar no hay nota: [3 0; 0 −1].
    await sembrarValor(page, E_A, 3);
    await sembrarValor(page, E_D, -1);
    await expect(page.getByTestId('nota-matriz-escalar')).toHaveCount(0);
  });
});

/** Contraste WCAG de `propiedad` (color o fill) sobre el fondo real compuesto. */
async function contrasteDe(elemento: Locator, propiedad: 'color' | 'fill'): Promise<number> {
  return elemento.evaluate((el, prop) => {
    const aRgba = (c: string): number[] => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return [255, 255, 255, 1];
      const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1];
    };
    const mezclar = (arriba: number[], abajo: number[]): number[] => [
      arriba[0] * arriba[3] + abajo[0] * (1 - arriba[3]),
      arriba[1] * arriba[3] + abajo[1] * (1 - arriba[3]),
      arriba[2] * arriba[3] + abajo[2] * (1 - arriba[3]),
      1,
    ];
    const capas: number[][] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = aRgba(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) {
        capas.push(c);
        if (c[3] >= 1) break;
      }
    }
    let fondo = [255, 255, 255, 1];
    for (let i = capas.length - 1; i >= 0; i--) fondo = mezclar(capas[i], fondo);
    const estilo = getComputedStyle(el);
    const texto = mezclar(aRgba(prop === 'fill' ? estilo.fill : estilo.color), fondo);
    const lum = (c: number[]): number => {
      const f = (x: number): number => {
        const s = x / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const [a, b] = [lum(texto), lum(fondo)].sort((x, y) => y - x);
    return Math.round(((a + 0.05) / (b + 0.05)) * 100) / 100;
  }, propiedad);
}

// HALLAZGO 4139 — REPARADO el 05/11/2026 (/reparar): los rótulos van con los tokens -texto
// (textoDeTrazo) y el rojo de det(A), con --rojo-texto en claro y #ef9a9a en oscuro.
// Lo que decía el caso (accesibilidad, medio) — rótulos y cifras de color por debajo de 4,5:1 (texto de 12-18 px).
// Ningún candado lo ve: check:contraste-marca no mira el fill de un SVG, check:semanticos-claro solo
// el claro y solo los .module.css (el naranja va en style={{}}), y el rojo literal de .metricaRoja
// no es un token, así que check:token-oscuro tampoco lo mira en oscuro.
// Caso: claro → rótulos del SVG «v» y «Ae₂» (#48A9A6 sobre blanco) 2,80:1, «u+v» y «Av₁»
//       (#E67E22) 2,85:1, la nota «u+v» 2,85:1, «u», «Ae₁» y «Área = …» (#2E86AB) 4,11:1 ·
//       oscuro → det(A) negativo (#c0392b sobre #373737, preset Reflexión) 2,20:1 y los rótulos
//       azules del SVG 3,87:1 · esperado ≥ 4,5:1 en todos.
test.describe('Contraste de rótulos y cifras', () => {
  test('claro: rótulos del dibujo de Vectores y Transformaciones ≥ 4,5:1', async ({ page }) => {
    await abrir(page);
    await esperarPaginaAsentada(page);
    const svg = page.locator('[role="tabpanel"] svg');
    const medidas: Record<string, number> = {
      u: await contrasteDe(svg.locator('text').filter({ hasText: /^u$/ }), 'fill'),
      v: await contrasteDe(svg.locator('text').filter({ hasText: /^v$/ }), 'fill'),
      'u+v': await contrasteDe(svg.locator('text').filter({ hasText: 'u+v' }), 'fill'),
    };
    await pestana(page, 'Transformaciones', T_A);
    medidas['Ae₁'] = await contrasteDe(page.locator('[role="tabpanel"] svg text').filter({ hasText: 'Ae₁' }), 'fill');
    medidas['Ae₂'] = await contrasteDe(page.locator('[role="tabpanel"] svg text').filter({ hasText: 'Ae₂' }), 'fill');
    const bajos = Object.entries(medidas).filter(([, r]) => r < 4.5);
    expect(bajos).toEqual([]);
  });

  test('oscuro: rótulos del dibujo de Vectores ≥ 4,5:1', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('meskeia-theme', 'dark'));
    await abrir(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await esperarPaginaAsentada(page);
    const svg = page.locator('[role="tabpanel"] svg');
    for (const rotulo of [/^u$/, /^v$/, /^u\+v$/]) {
      expect(await contrasteDe(svg.locator('text').filter({ hasText: rotulo }), 'fill'), String(rotulo)).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('oscuro: det(A) negativo en rojo ≥ 4,5:1', async ({ page }) => {
    // La preferencia se guarda ANTES de cargar: sembrar data-theme tras el goto es una carrera.
    await page.addInitScript(() => window.localStorage.setItem('meskeia-theme', 'dark'));
    await abrir(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await esperarPaginaAsentada(page);
    await pestana(page, 'Transformaciones', T_A);
    await page.getByRole('button', { name: 'Reflexión', exact: true }).click();
    const cifra = page.locator('[role="tabpanel"] [class*="metricaRoja"] [class*="metricaValor"]');
    await expect(cifra).toBeVisible();
    expect(await contrasteDe(cifra, 'color')).toBeGreaterThanOrEqual(4.5);
  });
});

// ABIERTO (contenido, bajo) — la description («transformaciones lineales animadas»), features
// («cuadrícula transformada animada») y la FAQ del JSON-LD («Este visualizador anima esa
// deformación») prometen una animación que no hay: al pulsar un preset la cuadrícula salta en el
// primer fotograma. Lo que sí hace: se redibuja en tiempo real al mover los deslizadores.
// Caso: Transformaciones, Identidad → «Cizalla» → esperado fotogramas intermedios entre la
//       cuadrícula original y la cizallada · obtenido el path final («M-125,325 L175,25 …») ya en
//       el primer requestAnimationFrame y sin cambios en los 6 siguientes.
// Este caso pasa si la promesa se retira del HTML o si la animación existe.
test.describe('Promesa de animación', () => {
  // HALLAZGO 4140 — REPARADO el 05/11/2026 (/reparar, tipo promesa): description, features y FAQ
  // dicen ahora que la cuadrícula se redibuja al mover los valores. El caso pasa por la rama de
  // «no promete»; si alguien vuelve a escribir «animada», exige la animación.
  test('si el HTML promete animación, un preset muestra fotogramas intermedios', async ({ page, request }) => {
    const html = await (await request.get(URL_APP)).text();
    const promete = /animad|anima esa deformaci/i.test(html);
    expect(html).toContain('redibuja la cuadrícula deformada');
    if (!promete) return;
    await abrir(page);
    await pestana(page, 'Transformaciones', T_A);
    const fotogramas = await page.evaluate(async () => {
      const boton = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Cizalla');
      const rejilla = (): string => {
        const ps = document.querySelectorAll('[role="tabpanel"] svg > path');
        return ps[ps.length - 1]?.getAttribute('d') ?? '';
      };
      const vistos: string[] = [];
      boton?.click();
      for (let i = 0; i < 12; i++) {
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        vistos.push(rejilla());
      }
      return vistos;
    });
    expect(new Set(fotogramas).size).toBeGreaterThan(1);
  });
});

// ABIERTO (contenido, bajo) — frases del bloque educativo que la propia app contradice o que
// no se sostienen:
//   · «Si es positivo, apuntan en la misma dirección. Si es negativo, apuntan en sentidos
//     opuestos»: el estado inicial (u = (3, 1), v = (1, 3)) da u·v = 6 > 0 con 53,1°. Positivo
//     es θ < 90°; negativo, θ > 90°.
//   · FAQ visible: «La escala y la proporción se preservan»: el preset «Escala ×2» da det 4 (las
//     áreas ×4). Lo que se conserva es la razón entre segmentos paralelos, no la escala.
//   · FAQ visible: «Las matrices de rotación pura … siempre tienen eigenvalores complejos»: el giro
//     de 0° (identidad, λ = 1) y el de 180° (−I, λ = −1) los tienen reales.
//   · «Los observables físicos (posición, momento, energía) son matrices simétricas llamadas
//     operadores hermitianos»: hermítico no es simétrico (conjugada traspuesta), y posición y
//     momento no admiten matriz finita ([x, p] = iħ tiene traza no nula).
//   · «Con eigenvalores puedes comprimir un dataset de 1000 variables a 10 componentes que
//     explican el 95% de la varianza»: cifra que depende por completo de los datos, dicha como
//     capacidad general (neutralidad editorial §1).
test.describe('Contenido — imprecisiones del bloque educativo', () => {
  // HALLAZGO 4141 — REPARADO el 05/11/2026 (/reparar): las cinco frases reescritas.
  test('las cinco frases ya no están en el HTML servido', async ({ request }) => {
    const html = await (await request.get(URL_APP)).text();
    const frases = [
      'Si es positivo, apuntan en la misma dirección',
      'La escala y la proporción se preservan',
      'siempre tienen eigenvalores complejos',
      'matrices simétricas llamadas operadores hermitianos',
      'puedes comprimir un dataset de 1000 variables a 10 componentes',
    ];
    expect(frases.filter((f) => html.includes(f))).toEqual([]);
    // Y lo que dicen ahora, coherente con la app: u·v > 0 ⇔ ángulo agudo, y los giros de 0° y 180°.
    expect(html).toContain('el ángulo entre ellos es');
    expect(html).toContain('salvo los giros de 0° y de 180°');
  });
});

// ABIERTO (contenido, bajo) — el WebApplication del JSON-LD sale DOS veces: layout.tsx ya lo
// inyecta y page.tsx (L671) lo repite. Mismo patrón en otras ~14 apps con
// `JSON.stringify(jsonLd)` en su page.tsx.
// Caso: HTML servido → esperado 1 bloque «"@type":"WebApplication"» · obtenido 2.
test.describe('JSON-LD', () => {
  // HALLAZGO 4142 — REPARADO el 05/11/2026 (/reparar): page.tsx ya no repite el jsonLd.
  test('el WebApplication se declara una sola vez', async ({ request }) => {
    const html = await (await request.get(URL_APP)).text();
    expect((html.match(/"@type":"WebApplication"/g) ?? []).length).toBe(1);
  });

  test('el FAQPage sí está, una vez', async ({ request }) => {
    const html = await (await request.get(URL_APP)).text();
    expect((html.match(/"@type":"FAQPage"/g) ?? []).length).toBe(1);
  });
});

// ABIERTO (accesibilidad, bajo) — las pestañas declaran role="tab" sin el patrón WAI-ARIA: ni
// aria-controls, ni tabpanel con nombre (aria-labelledby), ni flechas para moverse entre ellas.
// Caso: foco en «Vectores 2D» y flecha derecha → esperado «Transformaciones» seleccionada y cada
//       tab con aria-controls · obtenido la selección no se mueve y no hay aria-controls.
test.describe('Pestañas — patrón WAI-ARIA', () => {
  test('la flecha derecha pasa a la pestaña siguiente y cada tab apunta a su panel', async ({ page }) => {
    test.fail(); // ABIERTO (inspector 05/11/2026) [accesibilidad/bajo]
    await abrir(page);
    await page.getByRole('tab', { name: 'Vectores 2D', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Transformaciones', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
      { timeout: 2000 },
    );
    await expect(page.getByRole('tab', { name: 'Vectores 2D', exact: true })).toHaveAttribute('aria-controls', /.+/);
  });
});

// ABIERTO (operativa, bajo) — a 360 px la tira de pestañas mide 310 px y las cuatro piden 480
// (min-width 120 px cada una): «Determinante» queda cortada y «Eigenvalores» entera fuera, con la
// barra de desplazamiento oculta (scrollbar-width: none). El hero anuncia «4 modos interactivos».
// Caso: 360 × 780 → esperado las cuatro pestañas dentro de la tira (x ≤ 335) · obtenido
//       «Determinante» de 265 a 385 y «Eigenvalores» de 385 a 505.
test.describe('Móvil 360 px — las cuatro pestañas a la vista', () => {
  test.use({
    viewport: { width: 360, height: 780 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('la página no desborda en horizontal', async ({ page }) => {
    await abrir(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });

  test('ninguna pestaña queda fuera de la tira', async ({ page }) => {
    test.fail(); // ABIERTO (inspector 05/11/2026) [operativa/bajo]
    await abrir(page);
    const fuera = await page.evaluate(() => {
      const lista = document.querySelector('[role="tablist"]');
      if (!lista) return ['sin tablist'];
      const limite = lista.getBoundingClientRect().right + 1;
      return Array.from(lista.querySelectorAll('[role="tab"]'))
        .filter((t) => t.getBoundingClientRect().right > limite)
        .map((t) => t.textContent ?? '');
    });
    expect(fuera).toEqual([]);
  });
});
