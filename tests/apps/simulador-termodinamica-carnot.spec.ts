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
 *   · Constantes: R = 8,314 J/(mol·K), n = 1 mol, γ = 5/3 (monoatómico). Hasta el 26/09/2026
 *     no salían en pantalla (HALLAZGO E); ahora las declara el párrafo «Datos del cálculo»
 *   · Tc y Tf se acotan entre sí: Tc ∈ [máx(400, Tf + 5), 1200] y Tf ∈ [250, mín(500, Tc − 5)].
 *     Antes había un TcEff = máx(Tc, Tf + 1) que cambiaba Tc a escondidas (HALLAZGO A)
 *   · V₂ = r·V₁ · V₃ = V₂·(Tc/Tf)^(1/(γ−1)) · V₄ = V₁·(Tc/Tf)^(1/(γ−1))
 *   · Qc = n·R·Tc·ln(V₂/V₁) · Qf = n·R·Tf·ln(V₄/V₃) · W = Qc + Qf · η = 1 − Tf/Tc
 *   · Cifras con formatNumber/formatPercentage de @/lib (antes un fmt() = toFixed, HALLAZGO B1)
 *   · fmtSci (notación científica si |n| ∉ [0,1; 100.000)) se retiró en la reparación: la
 *     SOSPECHA del 26/09/2026 («con una mantisa de 9,996 sale 10,0 × 10^n») era cierta sobre
 *     el papel, pero la rama NUNCA se alcanzaba: en todo el rango de los deslizadores |Q| y |W|
 *     van de 3,37 J a 13.830,8 J (Tc 1200, Tf 250, r 4). Barrido exhaustivo de las
 *     161 × 51 × 26 combinaciones el 26/09/2026. La prueba en pantalla sigue siendo el CASO 2.
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
 *     Reparación elegida: RECHAZO a la vista. Con Tf = 500 el deslizador de Tc no baja de
 *     505 K (Tf + un paso) y el rótulo lo dice: η mínimo = 1 − 500/505 = 0,99 %.
 *     Lo que NO puede salir nunca: un η negativo, NaN, «Infinity» ni «∞» en el panel.
 *     Los deslizadores capan lo demás (Tf = 100 → 250, Tc = 5000 → 1200): no hay texto libre
 *     ni «abc» posible; la app no tiene ni un campo de texto.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * HALLAZGOS DEL INSPECTOR (26/09/2026), REPARADOS el mismo día. Cada test afirma ya el
 * comportamiento correcto; el número entre corchetes es la ficha del acta.
 *   A  [2250] medio  Tc ≤ Tf se cambiaba en silencio por Tf + 1 K (rótulo 501 K, pulgar en 500,
 *                    η 0,20 %) y al bajar Tf «saltaba» el Tc guardado. REPARACIÓN: cada
 *                    deslizador se acota al otro (Tc ≥ Tf + 5 K, Tf ≤ Tc − 5 K), el rótulo
 *                    dice el rango y por qué, y ya no hay TcEff: se calcula con lo que marca.
 *   B1 [2257] bajo   sin separador de millares («+13830,8 J», «19953,6 kPa», eje «20951,3»)
 *   B2 [2258] bajo   el % iba con espacio normal (U+0020) y el subtítulo lo pegaba («100%»)
 *   C  [2253] medio  cifras con color fijo < 3:1 (Qf y W en claro, Qc en oscuro)
 *   D  [2254] medio  «Animar ciclo»: blanco sobre var(--primary) (2,79:1 en oscuro)
 *   E  [2251] medio  n = 1 mol, R y γ = 5/3 no se decían en ningún sitio
 *   F  [2252] medio  la fórmula del rendimiento del diésel estaba mal escrita
 *   G  [2255] bajo   textos de marca / naranja / nota de la tarjeta principal < 4,5:1
 *   H  [2256] bajo   emojis sin aria-hidden, aria-pressed con rótulo cambiante, deslizadores
 *                    sin unidad en aria-valuetext, canvas sin role="img" ni alternativa
 *   I  [2259] bajo   imprecisiones del bloque educativo (clima frío/Otto, «Cambio climático»
 *                    con la Tierra a 3 K, «η real (verificación)», frigoríficos = Carnot)
 *   J  [2260] bajo   FAQ del JSON-LD: «el único ciclo reversible» y el paréntesis de Tf > 0 K
 *   K  [2261] bajo   rótulos del canvas que se tapan y etiqueta de etapa cortada en móvil
 */

const RUTA = '/simulador-termodinamica-carnot/';

/** Espacio duro U+00A0 (regla del 25/09/2026 para el %). */
const NBSP = String.fromCharCode(0xa0);

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
  wQc: string;
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
      // Antes «η real (verificación)»: se renombró porque es W/Qc del propio ciclo ideal
      // (coincide siempre con η) y la tabla educativa usa «η real» para motores reales (2259).
      wQc: valor('W/Qc (comprobación)'),
      P1: valor('P₁ (estado inicial)'),
      atm: valor('P₁ (estado inicial)', 2),
      rotuloTc: rotulo('Temperatura foco caliente'),
      rotuloTf: rotulo('Temperatura foco frío'),
      panel: (panel?.textContent ?? '').trim(),
    };
  });
}

/**
 * Deja la cifra en una forma que no dependa del formato (B1 millares y B2 espacio duro, que
 * tienen sus propios casos): quita el punto de millar y cambia el espacio duro por uno normal.
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
  expect(cifra(l.wQc)).toBe('50,00 %');
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
  expect(cifra(m.wQc)).toBe('62,50 %');
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
  expect(cifra(l.wQc)).toBe('79,17 %');
  // P₁ = 8,314·1200/0,0005 = 19.953.600 Pa → 196,927 atm
  expect(cifra(l.P1)).toBe('19953,6 kPa');
  expect(l.atm).toBe('196,93 atm');
  // SOSPECHA de la notación científica, descartada: ni «×» ni «^» ni «∞» en el panel.
  expect(l.panel).not.toMatch(/×|\^|∞|NaN|Infinity/);
});

test('CASO 2b · Tf pegada a Tc (400 K / 395 K / r 1,5): η 1,25 % y W 16,9 J, sin notación científica', async ({
  page,
}) => {
  // Primero Tc y luego Tf: con Tc = 400, Tf llega como mucho a 395 (Tc − 5), que es justo esto.
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
  expect(cifra(l.wQc)).toBe('1,25 %');
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
  // El usuario lleva Tc al mínimo con el teclado (Inicio): el mínimo es ya Tf + 5 = 505 K.
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

// HALLAZGO A [2250] · medio (operativa) — REPARADO el 26/09/2026.
// Antes: page.tsx calculaba con TcEff = máx(Tc, Tf + 1) y pintaba el deslizador con ese valor;
// 501 K no cae en el paso de 5, así que el pulgar quedaba en 500 con el rótulo en 501 y η 0,20 %,
// sin aviso, y al bajar Tf «saltaba» el Tc guardado. Reparación elegida: rechazo a la vista.
// Cada deslizador se acota al otro (Tc ≥ Tf + 5 K, Tf ≤ Tc − 5 K), el texto bajo el control dice
// el rango y el porqué, y se calcula SOLO con lo que marca el pulgar.
test('HALLAZGO A1 · Tf = 500 K y Tc bajado con flechas: se detiene en 505 K, y rótulo, pulgar y η dicen lo mismo', async ({
  page,
}) => {
  await sembrarValor(page, TF, 500);
  // De 600 a 500 con 20 pulsaciones de flecha (paso 5), como lo haría un usuario con teclado.
  const tc = page.locator(TC);
  await tc.focus();
  for (let i = 0; i < 20; i++) await tc.press('ArrowLeft');
  const rotulo = page.locator('label', { hasText: 'Temperatura foco caliente' });
  await expect
    .poll(async () => `${await rotulo.textContent()} | deslizador ${await tc.inputValue()}`)
    .toMatch(/Tc = (\d+) K.* \| deslizador \1$/);
  // Tope: Tf + 5 = 505 K (no 500: con Tc = Tf no hay motor)
  await expect(tc).toHaveValue('505');
  await expect(rotulo).toContainText('Tc = 505 K) — 232 °C'); // 505 − 273,15 = 231,85 → 232
  const tcMarcada = Number(await tc.inputValue());
  const l = await leer(page);
  // η con las temperaturas que el usuario VE: 1 − 500/505 = 0,009901 → «0,99 %»
  expect(cifra(l.eta)).toBe(`${dosDecimales(100 * (1 - 500 / tcMarcada))} %`);
  expect(cifra(l.eta)).toBe('0,99 %');
  // El control dice por qué no baja más
  await expect(page.locator('#carnot-tc-rango')).toContainText('De 505 a 1200 K');
  await expect(page.locator('#carnot-tc-rango')).toContainText('con Tc ≤ Tf no hay motor térmico');
});

test('HALLAZGO A2 · Tc al mínimo con Tf = 500 K, y después bajar Tf: Tc no salta a un valor que nadie puso', async ({
  page,
}) => {
  await sembrarValor(page, TF, 500);
  const tc = page.locator(TC);
  await tc.focus();
  await tc.press('Home');
  const rotulo = page.locator('label', { hasText: 'Temperatura foco caliente' });
  await expect
    .poll(async () => `${await rotulo.textContent()} | deslizador ${await tc.inputValue()}`)
    .toMatch(/Tc = (\d+) K.* \| deslizador \1$/);
  // El mínimo con Tf = 500 es 505: el control no acepta Tc ≤ Tf, así que no hay η ≤ 0 que avisar.
  await expect(tc).toHaveValue('505');
  expect(Number(await tc.inputValue())).toBeGreaterThan(500);

  // Antes, al bajar Tf a 300 el rótulo saltaba a «Tc = 400 K» (el valor escondido). Ahora Tc
  // se queda donde el usuario lo dejó: 505 K. η = 1 − 300/505 = 0,405941 → «40,59 %».
  await sembrarValor(page, TF, 300);
  await expect(rotulo).toContainText('Tc = 505 K');
  await expect(tc).toHaveValue('505');
  expect(cifra((await leer(page)).eta)).toBe('40,59 %');
  // Y ahora sí puede bajar hasta 400 (máx(400, 300 + 5))
  await tc.focus();
  await tc.press('Home');
  await expect(tc).toHaveValue('400');
  await expect(rotulo).toContainText('Tc = 400 K');

  // Simétrico: con Tc = 400, Tf no pasa de 395 (Tc − 5).
  await sembrarValor(page, TF, 500, { esperado: 395 });
  await expect(page.locator('label', { hasText: 'Temperatura foco frío' })).toContainText('Tf = 395 K');
  // η = 1 − 395/400 = 1,25 %
  expect(cifra((await leer(page)).eta)).toBe('1,25 %');
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// HALLAZGOS DE FORMATO (B1, B2) — contenido, bajo
// ═════════════════════════════════════════════════════════════════════════════════════════

/**
 * Registra lo que el canvas escribe (fillText) y los círculos que dibuja (arc) en el último
 * fotograma: sirve para leer el eje (B1) y para medir si los rótulos se tapan (K).
 */
async function espiarCanvas(page: Page): Promise<void> {
  await page.addInitScript(() => {
    interface Texto { t: string; x: number; y: number; w: number; alinea: string; rotado: boolean }
    interface Circulo { x: number; y: number; r: number }
    const w = window as unknown as { __textos: Texto[]; __circulos: Circulo[] };
    w.__textos = [];
    w.__circulos = [];
    const proto = CanvasRenderingContext2D.prototype;
    const clearRect = proto.clearRect;
    proto.clearRect = function (this: CanvasRenderingContext2D, ...a: [number, number, number, number]) {
      w.__textos = [];
      w.__circulos = [];
      return clearRect.apply(this, a);
    };
    const fillText = proto.fillText;
    proto.fillText = function (this: CanvasRenderingContext2D, t: string, x: number, y: number, max?: number) {
      const m = this.getTransform();
      w.__textos.push({
        t: String(t),
        x,
        y,
        w: this.measureText(String(t)).width,
        alinea: this.textAlign,
        rotado: Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6,
      });
      return max === undefined ? fillText.call(this, t, x, y) : fillText.call(this, t, x, y, max);
    };
    const arc = proto.arc;
    proto.arc = function (this: CanvasRenderingContext2D, x: number, y: number, r: number, ...resto: [number, number, boolean?]) {
      if (r >= 8) w.__circulos.push({ x, y, r });
      return arc.call(this, x, y, r, ...resto);
    };
  });
  await page.reload();
  await esperarHidratacion(page, DESLIZADORES);
}

interface TextoCanvas { t: string; x: number; y: number; w: number; alinea: string; rotado: boolean }
interface CirculoCanvas { x: number; y: number; r: number }

const leerCanvas = (page: Page): Promise<{ textos: TextoCanvas[]; circulos: CirculoCanvas[]; ancho: number }> =>
  page.evaluate(() => {
    const w = window as unknown as { __textos: TextoCanvas[]; __circulos: CirculoCanvas[] };
    return {
      textos: w.__textos,
      circulos: w.__circulos,
      ancho: document.querySelector('canvas')!.getBoundingClientRect().width,
    };
  });

/** Caja de un texto horizontal de 11-12 px, en píxeles CSS del canvas. */
const caja = (t: TextoCanvas) => {
  const x0 = t.alinea === 'center' ? t.x - t.w / 2 : t.alinea === 'right' ? t.x - t.w : t.x;
  return { x0, x1: x0 + t.w, y0: t.y - 10, y1: t.y + 3 };
};

// B1 [2257] · fmt() era toFixed() con la coma cambiada a mano: con cinco cifras no agrupaba.
// Mismas entradas que el CASO 2a; la cifra es correcta, el formato no (CLAUDE.md global §2).
// Cuatro cifras sin agrupar (3457,7) es lo correcto en es-ES (RAE 2010), no un defecto.
test('HALLAZGO B1 · cinco cifras con punto de millar: +13.830,8 J, 10.949,4 J y 19.953,6 kPa, también en el eje', async ({
  page,
}) => {
  await espiarCanvas(page);
  await sembrarValor(page, TC, 1200);
  await sembrarValor(page, TF, 250);
  await sembrarValor(page, V1, 0.5);
  await sembrarValor(page, RATIO, 4);
  const l = await leer(page);
  expect(l.Qc).toBe('+13.830,8 J');
  expect(l.W).toBe('10.949,4 J');
  expect(l.P1).toBe('19.953,6 kPa');
  // Eje P: el tope es 1,05·P₁ = 20.951,28 kPa → «20.951,3» (antes «20951,3»)
  await expect.poll(async () => (await leerCanvas(page)).textos.map((t) => t.t)).toContain('20.951,3');
  const { textos } = await leerCanvas(page);
  expect(textos.filter((t) => /\d{5}/.test(t.t))).toEqual([]);
});

// B2 [2258] · Regla del 25/09/2026: el % separado con espacio duro U+00A0.
test('HALLAZGO B2 · el % de η va separado con espacio duro (U+00A0), también en el subtítulo educativo', async ({
  page,
}) => {
  const l = await leer(page);
  expect(l.eta).toBe(`50,00${NBSP}%`);
  expect(l.wQc).toBe(`50,00${NBSP}%`);
  await expect(page.getByText(`el 100${NBSP}% del calor en trabajo`)).toBeAttached();
  // Ningún «cifra + espacio normal + %» ni «cifra%» en lo que escribe la app (bloque educativo
  // abierto incluido; los componentes comunes quedan fuera: no son de esta app)
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const pegados = (await textosDeLaApp(page)).filter((t) => /\d( )?%/.test(t));
  expect(pegados).toEqual([]);
});

/**
 * Nodos de texto que escribe ESTA app: aquellos cuyo antepasado más cercano con clase es de su
 * módulo CSS. Deja fuera Footer, ShareCard, RelatedApps… (con su propio módulo) aunque vivan
 * dentro del .container. Devuelve el texto y si está bajo aria-hidden.
 */
async function nodosDeLaApp(page: Page): Promise<{ t: string; oculto: boolean }[]> {
  return page.evaluate(() => {
    const salida: { t: string; oculto: boolean }[] = [];
    const recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = recorrido.nextNode(); n; n = recorrido.nextNode()) {
      const conClase = n.parentElement?.closest('[class]');
      if (!conClase || !/SimuladorTermodinamicaCarnot/.test(conClase.getAttribute('class') ?? '')) continue;
      salida.push({ t: n.textContent ?? '', oculto: Boolean(n.parentElement?.closest('[aria-hidden="true"]')) });
    }
    return salida;
  });
}
const textosDeLaApp = async (page: Page): Promise<string[]> => (await nodosDeLaApp(page)).map((n) => n.t);

// ═════════════════════════════════════════════════════════════════════════════════════════
// HALLAZGOS DE ACCESIBILIDAD (C, D, G, H) — medio y bajo
// ═════════════════════════════════════════════════════════════════════════════════════════

// Las medidas van con expect.poll: globals.css anima color y fondo 0,3 s al cambiar de tema, y
// una lectura a mitad de la transición da una cifra intermedia (3,7:1 medido) que no es la final.

/** Pone la marca de Stemum como lo hace el script del layout bajo stemum.com. */
async function marcaStemum(page: Page): Promise<void> {
  await page.evaluate(() => document.documentElement.setAttribute('data-brand', 'stemum'));
}

const ESCENARIOS: { tema: 'light' | 'dark'; stemum: boolean }[] = [
  { tema: 'light', stemum: false },
  { tema: 'dark', stemum: false },
  { tema: 'light', stemum: true },
  { tema: 'dark', stemum: true },
];
const nombre = (e: { tema: string; stemum: boolean }) => `${e.stemum ? 'stemum' : 'meskeia'}/${e.tema}`;

// C [2253] · Las cifras de calor y trabajo llevaban color fijo en style={{ color }} sin variante
// oscura (Qf #7FB3D3 2,17:1 y W #48A9A6 2,68:1 en claro; Qc #A82E68 2,70:1 en oscuro). Ahora son
// tokens del módulo (--carnot-*) con variante oscura. Texto grande (20,8 px bold): umbral 3:1,
// pero los tokens se eligieron para 4,5:1 porque también pintan rótulos de 11 px en el canvas.
test('HALLAZGO C · las cifras de Qc, Qf y W llegan a 4,5:1 en claro y oscuro, en meskeIA y en Stemum', async ({ page }) => {
  for (const e of ESCENARIOS) {
    await activarTema(page, e.tema);
    if (e.stemum) await marcaStemum(page);
    for (const etiqueta of ['Calor absorbido (Tc)', 'Calor cedido (Tf)', 'Trabajo neto (Wnet)']) {
      await expect.poll(() => contraste(cifraDe(page, etiqueta)), `${etiqueta} · ${nombre(e)}`).toBeGreaterThanOrEqual(4.5);
    }
  }
});

// D [2254] · .actionBtn ponía blanco sobre var(--primary): 4,11:1 en claro, 2,79:1 en oscuro y
// 2,21:1 en Stemum oscuro. Ahora usa --primary-boton (5,47:1 meskeIA, 8,72:1 Stemum).
test('HALLAZGO D · «Animar ciclo» (blanco sobre --primary-boton) llega a 4,5:1 en los cuatro escenarios', async ({ page }) => {
  for (const e of ESCENARIOS) {
    await activarTema(page, e.tema);
    if (e.stemum) await marcaStemum(page);
    const boton = page.getByRole('button', { name: /Animar ciclo/ });
    await expect.poll(() => contraste(boton), nombre(e)).toBeGreaterThanOrEqual(4.5);
  }
});

// G [2255] · Texto normal por debajo de 4,5:1: naranja #E07A1F del aviso (2,56:1), var(--primary)
// como texto pequeño (4,11:1 en el rótulo «600 K», 3,93:1 en los h4 de la FAQ) y la nota de la
// tarjeta principal en oscuro (4,06:1). Ahora: --carnot-adiabatica, --primary-texto y
// --text-secondary en la nota.
test('HALLAZGO G · aviso, rótulos de marca, h4 de la FAQ y nota de η llegan a 4,5:1 (meskeIA y Stemum)', async ({ page }) => {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByText('5 errores frecuentes con Carnot')).toBeVisible();
  // [qué, dónde, umbral]: 4,5:1 texto normal; 3:1 el η de 35 px/800 (texto grande), que sobre el
  // tinte de la tarjeta principal en oscuro da 4,03:1 con --primary-texto.
  const medir: [string, Locator, number][] = [
    ['cabecera del aviso', page.getByText('5 errores frecuentes con Carnot'), 4.5],
    ['strong del aviso', page.locator('li strong', { hasText: 'Trabajar con T en Celsius' }), 4.5],
    ['rótulo «600 K»', page.locator('label strong', { hasText: '600 K' }), 4.5],
    ['h4 de la FAQ', page.getByRole('heading', { level: 4, name: /Por qué η nunca puede ser 100/ }), 4.5],
    ['strong de escenario', page.locator('strong', { hasText: 'Centrales eléctricas térmicas' }), 4.5],
    ['strong de paso', page.locator('strong', { hasText: 'Identifica las temperaturas Tc y Tf en kelvin' }), 4.5],
    ['strong de consejo', page.locator('strong', { hasText: 'Distingue motor térmico de bomba/frigorífico' }), 4.5],
    ['nota de η', page.getByText('Trabajo extraído por unidad de calor absorbido'), 4.5],
    ['η', page.locator('span', { hasText: /^50,00/ }).first(), 3],
  ];
  for (const e of ESCENARIOS) {
    await activarTema(page, e.tema);
    if (e.stemum) await marcaStemum(page);
    for (const [que, loc, umbral] of medir) {
      await expect.poll(() => contraste(loc), `${que} · ${nombre(e)}`).toBeGreaterThanOrEqual(umbral);
    }
  }
});

// H [2256] · Piezas de accesibilidad que faltaban.
test('HALLAZGO H · emojis ocultos, botón sin aria-pressed, deslizadores con unidad y canvas con alternativa', async ({ page }) => {
  // (2) Rótulo que cambia → sin aria-pressed, y el emoji fuera del nombre accesible
  const animar = page.getByRole('button', { name: 'Animar ciclo', exact: true });
  await expect(animar).toBeVisible();
  await expect(animar).not.toHaveAttribute('aria-pressed');
  await animar.click();
  const pausa = page.getByRole('button', { name: 'Pausa', exact: true });
  await expect(pausa).toBeVisible();
  await expect(pausa).not.toHaveAttribute('aria-pressed');
  await pausa.click();

  // (3) aria-valuetext con unidad en los 4 deslizadores
  await expect(page.locator(TC)).toHaveAttribute('aria-valuetext', '600 K (327 °C)');
  await expect(page.locator(TF)).toHaveAttribute('aria-valuetext', '300 K (27 °C)');
  await expect(page.locator(V1)).toHaveAttribute('aria-valuetext', '1,00 litros');
  await expect(page.locator(RATIO)).toHaveAttribute('aria-valuetext', 'V₂ igual a 2,0 veces V₁');

  // (4) canvas como imagen con los 4 estados (V, P), calculados a mano (n = 1, R = 8,314):
  //   1: 1 L, 8,314·600/0,001 = 4988,4 kPa · 2: 2 L, 2494,2 kPa
  //   3: V₃ = 2·2^1,5 = 5,657 L → «5,66 L», P = 8,314·300/0,0056569 = 440,9 kPa
  //   4: V₄ = 2^1,5 = 2,828 L → «2,83 L», P = 8,314·300/0,0028284 = 881,8 kPa
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('role', 'img');
  const alt = (await canvas.getAttribute('aria-label')) ?? '';
  expect(alt).toContain('Estado 1: V = 1,00 L, P = 4988,4 kPa');
  expect(alt).toContain('Estado 2: V = 2,00 L, P = 2494,2 kPa');
  expect(alt).toContain('Estado 3: V = 5,66 L, P = 440,9 kPa');
  expect(alt).toContain('Estado 4: V = 2,83 L, P = 881,8 kPa');
  // …y la misma información, visible, en la tabla de estados
  const tabla = page.getByRole('table', { name: 'Los 4 estados del ciclo' });
  await expect(tabla.getByRole('row')).toHaveCount(5);
  await expect(tabla.getByRole('row').nth(3)).toContainText('5,66');

  // (1) Ningún emoji de la app junto a texto sin aria-hidden
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const nodos = await nodosDeLaApp(page);
  // Control: el recorrido ve los emojis de la app (si no viera ninguno, pasaría en falso)
  expect(nodos.filter((n) => n.oculto && /\p{Extended_Pictographic}/u.test(n.t)).length).toBeGreaterThanOrEqual(15);
  const sueltos = nodos.filter((n) => !n.oculto && /\p{Extended_Pictographic}/u.test(n.t)).map((n) => n.t.trim());
  expect(sueltos).toEqual([]);
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// HALLAZGOS DE CONTENIDO (E, F, I, J) — medio y bajo
// ═════════════════════════════════════════════════════════════════════════════════════════

// E [2251] · Qc, Qf, W y P₁ dependen de n = 1 mol (y R = 8,314), y el diagrama de γ = 5/3.
test('HALLAZGO E · la página declara n = 1 mol, R = 8,314 J/(mol·K) y γ = 5/3 junto a las cifras', async ({ page }) => {
  const datos = page.getByText('Datos del cálculo:').locator('xpath=..');
  await expect(datos).toContainText(/n\s*=\s*1\s*mol/);
  await expect(datos).toContainText('R = 8,314 J/(mol·K)');
  await expect(datos).toContainText('= 5/3');
  await expect(datos).toContainText('monoatómico');
});

// F [2252] · La fórmula del diésel era «1 − [r^(γ−1) (β−1)] / [γ(β−1)·r^(γ−1)·(rb−1)]», con un
// «rb» sin definir. La correcta: η = 1 − (1/r^(γ−1))·(β^γ − 1)/[γ(β − 1)].
// A mano con r = 18, β = 2, γ = 1,4: 18^0,4 = 3,17767 · 2^1,4 = 2,63902 →
//   (2,63902 − 1)/(1,4·1) = 1,17073 → 1,17073/3,17767 = 0,36842 → η = 0,63158 = 63,16 %.
test('HALLAZGO F · el bloque educativo publica la fórmula correcta del diésel (63,16 % con r 18, β 2)', async ({ page }) => {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const tarjeta = page.getByText('Para ciclos reales (Otto, diésel) hay otras fórmulas').locator('xpath=..');
  await expect(tarjeta).toBeVisible();
  await expect(page.locator('body')).not.toContainText('(rb−1)');
  await expect(tarjeta).toContainText('η = 1 − (1/r^(γ−1))·(β^γ − 1)/[γ(β − 1)]');
  const r = 18, beta = 2, g = 1.4;
  const eta = 1 - (1 / Math.pow(r, g - 1)) * ((Math.pow(beta, g) - 1) / (g * (beta - 1)));
  expect(dosDecimales(eta * 100)).toBe('63,16');
  await expect(tarjeta).toContainText(`63,16${NBSP}%`);
});

// I [2259] · Imprecisiones del bloque educativo.
test('HALLAZGO I · sin «climas fríos más eficientes», la Tierra emite a ~255 K, W/Qc no se llama «η real» y los frigoríficos son de compresión de vapor', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const cuerpo = page.locator('body');
  await expect(cuerpo).not.toContainText('los motores en climas fríos son más eficientes');
  await expect(cuerpo).toContainText('en el Otto depende de la relación de compresión, no de la temperatura ambiente');
  // La tarjeta «Cambio climático» no hablaba de cambio climático y ponía la Tierra a 3 K
  await expect(page.locator('strong', { hasText: 'Cambio climático' })).toHaveCount(0);
  await expect(cuerpo).not.toContainText('Tf ≈ 3 K');
  await expect(cuerpo).toContainText('unos 255 K');
  // «η real (verificación)» coincidía siempre con η y chocaba con la tabla de motores reales
  await expect(cuerpo).not.toContainText('η real (verificación)');
  await expect(page.getByText('W/Qc (comprobación)')).toBeVisible();
  // Frigoríficos: compresión de vapor, con Carnot invertido como límite
  await expect(cuerpo).not.toContainText('Son ciclos de Carnot invertidos');
  await expect(cuerpo).toContainText('ciclo de compresión de vapor');
});

// J [2260] · La FAQ del JSON-LD (la que leen las IA) decía «el único ciclo reversible» y tenía el
// paréntesis mal puesto: «siempre que Tf > 0 K (temperatura absoluta nula)».
test('HALLAZGO J · la FAQ del JSON-LD reconoce Stirling y Ericsson y corrige el paréntesis del cero absoluto', async ({ page }) => {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
  expect(faq).toBeTruthy();
  const texto: string = faq.mainEntity[2].acceptedAnswer.text;
  expect(texto).not.toContain('el único ciclo reversible');
  expect(texto).not.toContain('(temperatura absoluta nula)');
  expect(texto).toContain('Stirling');
  expect(texto).toContain('Ericsson');
  expect(texto).toContain('0 K = −273,15 °C');
  // Y el % con espacio duro en todo el JSON-LD
  for (const b of bloques) expect(b).not.toMatch(/\d %|\d%/);
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// HALLAZGO K [2261] — rótulos del canvas
// ═════════════════════════════════════════════════════════════════════════════════════════

// Antes: «Tc = … K» y «Tf = … K» fijos en la esquina superior izquierda del diagrama, bajo el
// punto 1 y bajo la etiqueta de la etapa 1→2; y en móvil (214 px) la etiqueta se cortaba
// («1→2 Isoterma Tc (absorbe»). Ahora van en una banda encima del diagrama y la etiqueta de la
// etapa usa su forma corta si no cabe.
for (const [ancho, alto] of [[1280, 900], [360, 740]] as const) {
  test(`HALLAZGO K · a ${ancho} px los rótulos del canvas caben y no se tapan entre sí ni con los puntos, en las 4 etapas`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: ancho, height: alto });
    await espiarCanvas(page);
    const rotulosBanda = /^(Tc = |Tf = |[1-4]→[1-4] )/;
    const etapasVistas = new Set<string>();
    await page.getByRole('button', { name: 'Animar ciclo', exact: true }).click();
    // Una vuelta dura 6 s: se muestrea durante algo más para ver las 4 etapas
    const fin = Date.now() + 6500;
    while (Date.now() < fin) {
      const { textos, circulos, ancho: w } = await leerCanvas(page);
      const horizontales = textos.filter((t) => !t.rotado);
      for (const t of horizontales) {
        const c = caja(t);
        expect(c.x0, `«${t.t}» se sale por la izquierda`).toBeGreaterThanOrEqual(0);
        expect(c.x1, `«${t.t}» se sale por la derecha (${w} px)`).toBeLessThanOrEqual(w);
      }
      const banda = horizontales.filter((t) => rotulosBanda.test(t.t));
      for (const t of banda) if (/→/.test(t.t)) etapasVistas.add(t.t.slice(0, 3));
      for (const t of banda) {
        const a = caja(t);
        for (const o of horizontales) {
          if (o === t) continue;
          const b = caja(o);
          const solapa = a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
          expect(solapa, `«${t.t}» pisa «${o.t}»`).toBe(false);
        }
        for (const k of circulos) {
          const dx = Math.max(a.x0 - k.x, 0, k.x - a.x1);
          const dy = Math.max(a.y0 - k.y, 0, k.y - a.y1);
          expect(Math.hypot(dx, dy) > k.r, `«${t.t}» queda bajo un punto del diagrama`).toBe(true);
        }
      }
      await page.waitForTimeout(250);
    }
    expect(Array.from(etapasVistas).sort()).toEqual(['1→2', '2→3', '3→4', '4→1']);
  });
}

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
