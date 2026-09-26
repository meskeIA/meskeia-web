import { test, expect, Locator, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';
import { activarTema } from '../contraste-text-muted-auxiliares';

/**
 * Inspector — simulador-termodinamica-carnot (segmento cálculo, riesgo 3, 93 usos)
 *
 * Primera inspección: 26/09/2026. El <h1> promete «Simulador del Ciclo de Carnot» y el
 * subtítulo «El motor térmico ideal: 2 isotermas + 2 adiabáticas. Visualiza el ciclo en un
 * diagrama PV con eficiencia η = 1 − Tf/Tc». El panel da η, el calor absorbido Qc, el cedido
 * Qf, el trabajo neto W, W/Qc («η real (verificación)») y la presión P₁. No calcula COP ni
 * entropía: solo los nombra en el bloque educativo, así que no se prueban.
 *
 * DÓNDE VIVE EL CÁLCULO — app/simulador-termodinamica-carnot/page.tsx (no hay motor.ts)
 *   · Constantes ESCONDIDAS: R = 8,314 J/(mol·K), n = 1 mol, γ = 5/3 (monoatómico). Ninguna
 *     sale en pantalla  ← HALLAZGO E
 *   · TcEff = máx(Tc, Tf + 1): si el usuario deja Tc ≤ Tf, la app cambia Tc por Tf + 1 K sin
 *     decirlo  ← HALLAZGO A
 *   · V₂ = r·V₁ · V₃ = V₂·(Tc/Tf)^(1/(γ−1)) · V₄ = V₁·(Tc/Tf)^(1/(γ−1))
 *   · Qc = n·R·Tc·ln(V₂/V₁) · Qf = n·R·Tf·ln(V₄/V₃) · W = Qc + Qf · η = 1 − Tf/Tc
 *   · fmt(n, d) = toFixed(d) con la coma cambiada a mano: sin millares  ← HALLAZGO B1
 *   · fmtSci: notación científica si |n| ∉ [0,1; 100.000). La SOSPECHA del 26/09/2026 («con
 *     una mantisa de 9,996 sale 10,0 × 10^n») es cierta sobre el papel, pero la rama NUNCA se
 *     alcanza: fmtSci solo formatea Qc, Qf y W, y en todo el rango de los deslizadores
 *     (Tc 400-1200 K, Tf 250-500 K, V₂/V₁ 1,5-4) su valor absoluto va de 3,37 J (Tc = Tf = 400
 *     con el TcEff de 401 K y r = 1,5) a 13.830,8 J (Tc 1200, Tf 250, r 4). Barrido exhaustivo
 *     de las 161 × 51 × 26 combinaciones el 26/09/2026. La prueba en pantalla es el CASO 2.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (n = 1 mol, R = 8,314)
 *
 *   CASO 1 (normal) — valores de fábrica: Tc = 600 K, Tf = 300 K, V₁ = 1 L, V₂/V₁ = 2
 *     η  = 1 − 300/600                           = 0,5          → «50,00 %»
 *     Qc = 8,314 · 600 · ln 2 = 4988,4 · 0,693147  = 3457,695 J  → «+3457,7 J»
 *     Qf = −8,314 · 300 · ln 2                     = −1728,848 J → «-1728,8 J»
 *     W  = 3457,695 − 1728,848                      = 1728,848 J  → «1728,8 J»  (W/Qc = 50 %)
 *     P₁ = n·R·Tc/V₁ = 8,314 · 600 / 0,001 m³       = 4.988.400 Pa → «4988,4 kPa»
 *          4.988.400 / 101.325                      = 49,2317 atm → «49,23 atm»
 *     Y subiendo Tc a 800 K: η = 1 − 300/800 = 62,50 % · Qc = 8,314·800·ln 2 = 4610,26 J
 *          → «+4610,3 J» · W = 4610,26 − 1728,85 = 2881,41 J → «2881,4 J»
 *          · P₁ = 8,314·800/0,001 = 6.651.200 Pa → «6651,2 kPa» · 65,6422 atm → «65,64 atm»
 *
 *   CASO 2 (límite) — los dos extremos del rango
 *     2a · todo al máximo: Tc = 1200, Tf = 250, V₁ = 0,5 L, r = 4
 *       η  = 1 − 250/1200 = 0,791667                         → «79,17 %»
 *       Qc = 8,314 · 1200 · ln 4 = 9976,8 · 1,386294 = 13.830,78 J → «+13.830,8 J» en es-ES
 *       Qf = −8,314 · 250 · ln 4                   = −2881,41 J   → «-2881,4 J»
 *       W  = 13.830,78 − 2881,41                   = 10.949,37 J  → «10.949,4 J»
 *       P₁ = 8,314 · 1200 / 0,0005 = 19.953.600 Pa = 19.953,6 kPa → 196,927 atm → «196,93 atm»
 *       Es el MAYOR |Q| alcanzable: por debajo de 100.000, así que nada de «× 10^».
 *     2b · Tf pegada a Tc sin llegar a igualarla: Tc = 400, Tf = 395, r = 1,5 (V₁ = 1 L)
 *       η  = 1 − 395/400 = 0,0125                          → «1,25 %»
 *       Qc = 8,314 · 400 · ln 1,5 = 3325,6 · 0,405465 = 1348,41 J → «+1348,4 J»
 *       Qf = −8,314 · 395 · ln 1,5                     = −1331,56 J → «-1331,6 J»
 *       W  = 8,314 · 5 · ln 1,5                        = 16,855 J  → «16,9 J»
 *       P₁ = 8,314 · 400 / 0,001 = 3.325.600 Pa → «3325,6 kPa» · 32,821 atm → «32,82 atm»
 *       Es el MENOR |W| alcanzable con Tc > Tf de verdad: por encima de 0,1 → sin «× 10^».
 *
 *   CASO 3 (rechazo) — Tf ≥ Tc no es un motor
 *     Tc = Tf = 500 K → η = 0, W = 0 (y los COP de refrigerador y bomba, infinitos)
 *     Tc = 400 K con Tf = 500 K → η = −25 %: no es un motor; debe rechazarse o avisarse.
 *     Lo que NO puede salir nunca: un η negativo, NaN, «Infinity» ni «∞» en el panel.
 *     Los deslizadores capan lo demás (Tf = 100 → 250, Tc = 5000 → 1200): no hay texto libre
 *     ni «abc» posible; la app no tiene ni un campo de texto.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * HALLAZGOS ABIERTOS (Inspector, 26/09/2026). Los tests marcados con test.fail FALLAN hoy a
 * propósito: describen lo que debería ocurrir, no lo que ocurre.
 *   A  · medio (operativa)      Tc ≤ Tf se cambia en silencio por Tf + 1 K: el rótulo dice
 *                               501 K con el deslizador en 500, y η = 0,20 % sin aviso
 *   B1 · bajo  (contenido)      sin separador de millares: «+13830,8 J», «19953,6 kPa»
 *   B2 · bajo  (contenido)      el % va con espacio normal (U+0020), no con espacio duro
 *   C  · medio (accesibilidad)  cifras con color fijo por debajo de 3:1 (Qf y W en claro,
 *                               Qc en oscuro)
 *   D  · medio (accesibilidad)  «▶ Animar ciclo»: blanco sobre var(--primary), 2,79:1 en
 *                               oscuro (4,11:1 en claro)
 *   E  · medio (contenido)      n = 1 mol, R y γ = 5/3 no se dicen en ningún sitio
 *   F  · medio (contenido)      la fórmula del rendimiento del diésel está mal escrita
 */

const RUTA = '/simulador-termodinamica-carnot/';

/** Los cuatro deslizadores, por su etiqueta accesible: el marcado no les pone id. */
const TC = 'input[aria-label="Temperatura foco caliente Tc"]';
const TF = 'input[aria-label="Temperatura foco frío Tf"]';
const V1 = 'input[aria-label="Volumen inicial"]';
const RATIO = 'input[aria-label="Ratio de expansión"]';
const DESLIZADORES = [TC, TF, V1, RATIO];

interface Lectura {
  eta: string;
  Qc: string;
  Qf: string;
  W: string;
  etaVerif: string;
  P1: string;
  atm: string;
  rotuloTc: string;
  rotuloTf: string;
  panel: string;
}

/** Lee de una pasada las cifras del panel de resultados y los rótulos de temperatura. */
async function leer(page: Page): Promise<Lectura> {
  return page.evaluate(() => {
    const valor = (etiqueta: string, salto = 1): string => {
      const sp = Array.from(document.querySelectorAll('span')).find(
        (s) => (s.textContent ?? '').trim() === etiqueta,
      );
      let el: Element | null | undefined = sp;
      for (let i = 0; i < salto; i++) el = el?.nextElementSibling;
      return (el?.textContent ?? '').trim();
    };
    const rotulo = (inicio: string): string =>
      Array.from(document.querySelectorAll('label'))
        .map((l) => (l.textContent ?? '').trim())
        .find((t) => t.startsWith(inicio)) ?? '';
    const panel = document.querySelector('[role="status"][aria-live="polite"]');
    return {
      eta: valor('Eficiencia η = 1 − Tf/Tc'),
      Qc: valor('Calor absorbido (Tc)'),
      Qf: valor('Calor cedido (Tf)'),
      W: valor('Trabajo neto (Wnet)'),
      etaVerif: valor('η real (verificación)'),
      P1: valor('P₁ (estado inicial)'),
      atm: valor('P₁ (estado inicial)', 2),
      rotuloTc: rotulo('Temperatura foco caliente'),
      rotuloTf: rotulo('Temperatura foco frío'),
      panel: (panel?.textContent ?? '').trim(),
    };
  });
}

/**
 * Deja la cifra en una forma que no dependa de las dos reparaciones de formato pendientes
 * (B1 millares y B2 espacio duro), para que los casos de cálculo sigan en verde después de
 * ellas: quita el punto de millar y cambia el espacio duro por uno normal.
 */
const cifra = (s: string): string => s.replace(/ /g, ' ').replace(/(\d)\.(?=\d{3}(?!\d))/g, '$1');

/** η en es-ES con dos decimales, como la pinta la app, para comparar con lo calculado aquí. */
const dosDecimales = (x: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x);

/** Contraste WCAG del texto de un elemento contra el fondo que tiene DEBAJO (capas con alfa). */
async function contraste(loc: Locator): Promise<number> {
  return loc.evaluate((el) => {
    interface Rgba { r: number; g: number; b: number; a: number }
    const leerColor = (c: string): Rgba | null => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const sobre = (arriba: Rgba, abajo: Rgba): Rgba => ({
      r: arriba.r * arriba.a + abajo.r * (1 - arriba.a),
      g: arriba.g * arriba.a + abajo.g * (1 - arriba.a),
      b: arriba.b * arriba.a + abajo.b * (1 - arriba.a),
      a: 1,
    });
    const lineal = (v: number): number => {
      const x = v / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    };
    const luminancia = (c: Rgba): number => 0.2126 * lineal(c.r) + 0.7152 * lineal(c.g) + 0.0722 * lineal(c.b);
    const capas: Rgba[] = [];
    let nodo: Element | null = el;
    while (nodo) {
      const c = leerColor(getComputedStyle(nodo).backgroundColor);
      if (c && c.a > 0) {
        capas.push(c);
        if (c.a >= 1) break;
      }
      nodo = nodo.parentElement;
    }
    let fondo: Rgba = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
    const texto = sobre(leerColor(getComputedStyle(el).color)!, fondo);
    const [a, b] = [luminancia(texto), luminancia(fondo)];
    return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
  });
}

/** El <span> con la cifra que sigue a una etiqueta del panel. */
const cifraDe = (page: Page, etiqueta: string): Locator =>
  page
    .locator('span')
    .filter({ hasText: new RegExp(`^${etiqueta.replace(/[()]/g, '\\$&')}$`) })
    .locator('xpath=following-sibling::span[1]');

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Simulador del Ciclo de Carnot');
  // El panel viaja en el HTML servido: estar visible no dice que la app responda. Hay que
  // esperar a que React haya montado los cuatro deslizadores (tests/apps/_hidratacion.ts).
  await esperarHidratacion(page, DESLIZADORES);
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// CASO 1 (normal) — valores de fábrica y Tc = 800 K
// ═════════════════════════════════════════════════════════════════════════════════════════

test('CASO 1 · de fábrica (600 K / 300 K): η 50,00 %, Qc +3457,7 J, W 1728,8 J; y con Tc = 800 K, η 62,50 %', async ({
  page,
}) => {
  const l = await leer(page);
  expect(l.rotuloTc).toBe('Temperatura foco caliente (Tc = 600 K) — 327 °C');
  expect(l.rotuloTf).toBe('Temperatura foco frío (Tf = 300 K) — 27 °C');
  // η = 1 − 300/600
  expect(cifra(l.eta)).toBe('50,00 %');
  // Qc = 8,314·600·ln 2 = 3457,695 · Qf = −8,314·300·ln 2 = −1728,848 · W = Qc + Qf
  expect(cifra(l.Qc)).toBe('+3457,7 J');
  expect(cifra(l.Qf)).toBe('-1728,8 J');
  expect(cifra(l.W)).toBe('1728,8 J');
  // Primera ley en el ciclo: W/Qc tiene que ser η
  expect(cifra(l.etaVerif)).toBe('50,00 %');
  // P₁ = 8,314·600/0,001 m³ = 4.988.400 Pa; / 101.325 = 49,2317 atm
  expect(cifra(l.P1)).toBe('4988,4 kPa');
  expect(l.atm).toBe('49,23 atm');

  await sembrarValor(page, TC, 800);
  const m = await leer(page);
  expect(m.rotuloTc).toBe('Temperatura foco caliente (Tc = 800 K) — 527 °C');
  // η = 1 − 300/800 · Qc = 8,314·800·ln 2 = 4610,26 · W = 4610,26 − 1728,85 = 2881,41
  expect(cifra(m.eta)).toBe('62,50 %');
  expect(cifra(m.Qc)).toBe('+4610,3 J');
  expect(cifra(m.Qf)).toBe('-1728,8 J');
  expect(cifra(m.W)).toBe('2881,4 J');
  expect(cifra(m.etaVerif)).toBe('62,50 %');
  // P₁ = 8,314·800/0,001 = 6.651.200 Pa → 65,6422 atm
  expect(cifra(m.P1)).toBe('6651,2 kPa');
  expect(m.atm).toBe('65,64 atm');
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// CASO 2 (límite) — el mayor |Q| y el menor |W| que admiten los deslizadores
// ═════════════════════════════════════════════════════════════════════════════════════════

test('CASO 2a · todo al máximo (1200 K / 250 K / 0,5 L / r 4): η 79,17 % y el mayor Q sigue en notación normal', async ({
  page,
}) => {
  await sembrarValor(page, TC, 1200);
  await sembrarValor(page, TF, 250);
  await sembrarValor(page, V1, 0.5);
  await sembrarValor(page, RATIO, 4);
  const l = await leer(page);
  expect(l.rotuloTc).toBe('Temperatura foco caliente (Tc = 1200 K) — 927 °C');
  // η = 1 − 250/1200 = 0,791667
  expect(cifra(l.eta)).toBe('79,17 %');
  // Qc = 8,314·1200·ln 4 = 13.830,78 · Qf = −8,314·250·ln 4 = −2881,41 · W = 10.949,37
  expect(cifra(l.Qc)).toBe('+13830,8 J');
  expect(cifra(l.Qf)).toBe('-2881,4 J');
  expect(cifra(l.W)).toBe('10949,4 J');
  expect(cifra(l.etaVerif)).toBe('79,17 %');
  // P₁ = 8,314·1200/0,0005 = 19.953.600 Pa → 196,927 atm
  expect(cifra(l.P1)).toBe('19953,6 kPa');
  expect(l.atm).toBe('196,93 atm');
  // SOSPECHA de la notación científica, descartada: ni «×» ni «^» ni «∞» en el panel.
  expect(l.panel).not.toMatch(/×|\^|∞|NaN|Infinity/);
});

test('CASO 2b · Tf pegada a Tc (400 K / 395 K / r 1,5): η 1,25 % y W 16,9 J, sin notación científica', async ({
  page,
}) => {
  // Primero Tc y luego Tf: en ese orden nunca se cruza Tc ≤ Tf (que dispara el HALLAZGO A).
  await sembrarValor(page, TC, 400);
  await sembrarValor(page, TF, 395);
  await sembrarValor(page, RATIO, 1.5);
  const l = await leer(page);
  expect(l.rotuloTc).toBe('Temperatura foco caliente (Tc = 400 K) — 127 °C');
  expect(l.rotuloTf).toBe('Temperatura foco frío (Tf = 395 K) — 122 °C');
  // η = 1 − 395/400 = 0,0125
  expect(cifra(l.eta)).toBe('1,25 %');
  // Qc = 8,314·400·ln 1,5 = 1348,41 · Qf = −8,314·395·ln 1,5 = −1331,56 · W = 8,314·5·ln 1,5 = 16,855
  expect(cifra(l.Qc)).toBe('+1348,4 J');
  expect(cifra(l.Qf)).toBe('-1331,6 J');
  expect(cifra(l.W)).toBe('16,9 J');
  expect(cifra(l.etaVerif)).toBe('1,25 %');
  // P₁ = 8,314·400/0,001 = 3.325.600 Pa → 32,821 atm
  expect(cifra(l.P1)).toBe('3325,6 kPa');
  expect(l.atm).toBe('32,82 atm');
  expect(l.panel).not.toMatch(/×|\^|∞|NaN|Infinity/);
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// CASO 3 (rechazo) — Tf ≥ Tc
// ═════════════════════════════════════════════════════════════════════════════════════════

test('CASO 3 · con Tf ≥ Tc el panel nunca da un η negativo, NaN ni infinito; y los deslizadores capan lo imposible', async ({
  page,
}) => {
  await sembrarValor(page, TF, 500);
  // El usuario lleva Tc al mínimo con el teclado (Inicio): 400 K con Tf = 500 K.
  await page.locator(TC).focus();
  await page.locator(TC).press('Home');
  await expect(page.locator('label', { hasText: 'Temperatura foco caliente' })).not.toContainText('Tc = 600 K');
  const l = await leer(page);
  expect(l.eta.startsWith('-')).toBe(false);
  expect(l.W.startsWith('-')).toBe(false);
  expect(l.panel).not.toMatch(/NaN|Infinity|∞/);

  // Un <input type="range"> no admite nada fuera de su [min, max]: Tf = 100 queda en 250.
  await sembrarValor(page, TF, 100, { esperado: 250 });
  await expect(page.locator('label', { hasText: 'Temperatura foco frío' })).toContainText('Tf = 250 K');
});

// HALLAZGO A · medio (operativa) — Tc ≤ Tf se cambia en silencio por Tf + 1 K.
// page.tsx:52 `const TcEff = Math.max(Tc, Tf + 1)`, y el deslizador se pinta con value={TcEff}.
// 501 K no cae en el paso de 5 del control, así que el pulgar se queda en 500 mientras el rótulo
// dice 501, y el panel calcula con 501: η = 1 − 500/501 = 0,20 % y W = 8,314·1·ln 2 = 5,8 J,
// donde con Tc = Tf lo que toca es η = 0 (o un aviso). Sin mensaje alguno.
// Lo que se exige es la invariante mínima: lo que marca el deslizador es lo que dice el rótulo
// y lo que se calcula. Vale cualquier reparación que la cumpla (capar a Tf + 5, avisar…).
test.fail('HALLAZGO A1 · Tc = Tf = 500 K: el rótulo y η deben corresponder a lo que marca el deslizador', async ({
  page,
}) => {
  await sembrarValor(page, TF, 500);
  // De 600 a 500 con 20 pulsaciones de flecha (paso 5), como lo haría un usuario con teclado.
  const tc = page.locator(TC);
  await tc.focus();
  for (let i = 0; i < 20; i++) await tc.press('ArrowLeft');
  const rotulo = page.locator('label', { hasText: 'Temperatura foco caliente' });
  // Hoy: pulgar en 500, rótulo «Tc = 501 K — 228 °C»
  await expect
    .poll(async () => `${await rotulo.textContent()} | deslizador ${await tc.inputValue()}`)
    .toMatch(/Tc = (\d+) K.* \| deslizador \1$/);
  const tcMarcada = Number(await tc.inputValue());
  const l = await leer(page);
  // η con las temperaturas que el usuario VE: 1 − 500/500 = 0,00 % (hoy «0,20 %»)
  expect(cifra(l.eta)).toBe(`${dosDecimales(100 * (1 - 500 / tcMarcada))} %`);
});

test.fail('HALLAZGO A2 · Tc al mínimo con Tf = 500 K: o se capa a la vista o se avisa, pero no se cambia a escondidas', async ({
  page,
}) => {
  await sembrarValor(page, TF, 500);
  const tc = page.locator(TC);
  await tc.focus();
  await tc.press('Home'); // 400 K
  const rotulo = page.locator('label', { hasText: 'Temperatura foco caliente' });
  // Hoy: pulgar en 500, rótulo «Tc = 501 K», η «0,20 %», y ningún aviso.
  await expect
    .poll(async () => `${await rotulo.textContent()} | deslizador ${await tc.inputValue()}`)
    .toMatch(/Tc = (\d+) K.* \| deslizador \1$/);
  if (Number(await tc.inputValue()) <= 500) {
    // Si el control acepta Tc ≤ Tf, tiene que decir por qué no hay motor.
    await expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).toBeVisible();
  }
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// HALLAZGOS DE FORMATO (B1, B2) — contenido, bajo
// ═════════════════════════════════════════════════════════════════════════════════════════

// B1 · fmt() es toFixed() con la coma cambiada a mano: con cinco cifras no agrupa millares.
// Mismas entradas que el CASO 2a; la cifra es correcta, el formato no (CLAUDE.md global §2).
test.fail('HALLAZGO B1 · cinco cifras con punto de millar: +13.830,8 J, 10.949,4 J y 19.953,6 kPa', async ({ page }) => {
  await sembrarValor(page, TC, 1200);
  await sembrarValor(page, TF, 250);
  await sembrarValor(page, V1, 0.5);
  await sembrarValor(page, RATIO, 4);
  const l = await leer(page);
  expect(l.Qc).toBe('+13.830,8 J'); // hoy «+13830,8 J»
  expect(l.W).toBe('10.949,4 J'); // hoy «10949,4 J»
  expect(l.P1).toBe('19.953,6 kPa'); // hoy «19953,6 kPa»
});

// B2 · Regla del 25/09/2026: el % separado con espacio duro U+00A0. Hoy «50,00 %» lleva
// U+0020, y el subtítulo de la sección educativa lo pega: «el 100% del calor».
test.fail('HALLAZGO B2 · el % de η va separado con espacio duro (U+00A0)', async ({ page }) => {
  const l = await leer(page);
  expect(l.eta).toBe('50,00 %');
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// HALLAZGOS DE ACCESIBILIDAD (C, D) — medio
// ═════════════════════════════════════════════════════════════════════════════════════════

// C · Las tres cifras de calor y trabajo llevan color fijo en style={{ color }} (page.tsx:525,
// 530, 535), sin variante oscura. Son texto grande (20,8 px en negrita): el umbral es 3:1.
// Medido el 26/09/2026: Qf #7FB3D3 2,17:1 y W #48A9A6 2,68:1 en claro; Qc #A82E68 2,70:1 en oscuro.
test.fail('HALLAZGO C · las cifras de Qc, Qf y W llegan a 3:1 en los dos temas', async ({ page }) => {
  await activarTema(page, 'light');
  expect(await contraste(cifraDe(page, 'Calor cedido (Tf)'))).toBeGreaterThanOrEqual(3);
  expect(await contraste(cifraDe(page, 'Trabajo neto (Wnet)'))).toBeGreaterThanOrEqual(3);
  await activarTema(page, 'dark');
  expect(await contraste(cifraDe(page, 'Calor absorbido (Tc)'))).toBeGreaterThanOrEqual(3);
});

// D · .actionBtn pone color: white sobre var(--primary): 4,11:1 en claro y 2,79:1 en oscuro en
// meskeia.com (2,21:1 en oscuro bajo stemum.com). Texto de 16 px/600: umbral 4,5:1. Existe
// --primary-boton, igual en los dos temas, precisamente para esto.
test.fail('HALLAZGO D · «▶ Animar ciclo» (blanco sobre var(--primary)) llega a 4,5:1 en oscuro', async ({ page }) => {
  await activarTema(page, 'dark');
  const boton = page.getByRole('button', { name: /Animar ciclo/ });
  expect(await contraste(boton)).toBeGreaterThanOrEqual(4.5);
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// HALLAZGOS DE CONTENIDO (E, F) — medio
// ═════════════════════════════════════════════════════════════════════════════════════════

// E · Qc, Qf, W y P₁ dependen de n = 1 mol (y R = 8,314), y el diagrama de γ = 5/3; la
// tarjeta muestra «= n·R·Tc·ln(V₂/V₁)» pero la página no dice cuánto vale n en ningún sitio
// (la única «mol» del texto es la de «cosmología»). Sin n, el alumno no puede rehacer
// «+3457,7 J» a mano.
test.fail('HALLAZGO E · la página declara la cantidad de gas (n = 1 mol) con la que calcula', async ({ page }) => {
  await expect(page.locator('body')).toContainText(/n\s*=\s*1\s*mol|1\s*mol de gas/);
});

// F · «Diésel: η = 1 − [r^(γ−1) (β−1)] / [γ(β−1)·r^(γ−1)·(rb−1)]» (page.tsx:776) se simplifica
// a 1 − 1/[γ(rb − 1)] e introduce un «rb» que no se define. La correcta es
// η = 1 − (1/r^(γ−1))·(β^γ − 1)/[γ(β − 1)]: con r = 18, β = 2, γ = 1,4 da 63,16 %; la escrita,
// leyendo rb = r·β, da 97,96 %, por encima del propio límite de Carnot.
test.fail('HALLAZGO F · el bloque educativo no publica la fórmula errónea del diésel', async ({ page }) => {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByText('Para ciclos reales (Otto, diésel) hay otras fórmulas')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('(rb−1)');
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// MÓVIL — 360 × 740
// ═════════════════════════════════════════════════════════════════════════════════════════

test('MÓVIL · a 360 px no hay desplazamiento horizontal y el deslizador sigue recalculando', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(ancho).toBeLessThanOrEqual(360);
  await sembrarValor(page, TC, 800);
  const l = await leer(page);
  // η = 1 − 300/800 (CASO 1)
  expect(cifra(l.eta)).toBe('62,50 %');
  expect(cifra(l.W)).toBe('2881,4 J');
  await expect(page.locator('canvas')).toBeVisible();
});
