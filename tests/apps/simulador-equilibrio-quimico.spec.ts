import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-equilibrio-quimico (segmento cálculo/química, riesgo 3, 497 usos reales)
 *
 * Primera inspección: 21/08/2026. El <h1> promete «Simulador de Equilibrio Químico» y el
 * subtítulo «Principio de Le Chatelier en acción»; la metadata promete «cambia concentración,
 * temperatura o presión y observa cómo se desplaza la reacción» y lista entre sus rasgos
 * «Cálculo del cociente Q y comparación con Kc» y «Predicción visual del desplazamiento».
 * Hay verdad comprobable —Q, Kc, Δn, el nuevo equilibrio y el SENTIDO del desplazamiento—,
 * así que se trata como app verificable.
 *
 * DÓNDE VIVE EL CÁLCULO — app/simulador-equilibrio-quimico/page.tsx
 *   · const REACCIONES        → 6 reacciones con Kc, ΔH, flag `exotermica` y concentraciones de partida
 *   · calcularQ()             → Π[productos]^coef / Π[reactivos]^coef, excluyendo sólidos y
 *                               líquidos puros (salvo si TODA la reacción es líquida: caso
 *                               esterificación, tratada como disolución). Suelo de 1e-12 por especie.
 *   · deltaN()                → Σcoef(productos gas) − Σcoef(reactivos gas)
 *   · nuevoEquilibrio()       → busca por bisección el avance ξ tal que Q(ξ) = Kc
 *   · nuevoKcConTemperatura() → van t Hoff: ln(K₂/K₁) = −ΔH/R · (1/T₂ − 1/T₁), anclado en T₁ = 298 K
 *   · direccion               → Q/Kc > 1,02 ⇒ izquierda · < 0,98 ⇒ derecha · si no, equilibrio
 *   lib/formatters.ts → formatNumber(n, d) con toLocaleString('es-ES'); devuelve «≈0» si |n| < 0,0001
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — Water-gas shift · CO + H₂O ⇌ CO₂ + H₂ · Kc = 5 · Δn = 0
 *     Partida de fábrica: [CO] = [H₂O] = 1,00 · [CO₂] = [H₂] = 0,50
 *       Q = ([CO₂][H₂]) / ([CO][H₂O]) = (0,50 · 0,50) / (1,00 · 1,00) = 0,25   → «0,2500»
 *       Q = 0,25 < Kc = 5  ⇒ el sistema avanza HACIA PRODUCTOS (→)
 *     Tabla ICE con avance x (todos los coeficientes son 1, así que se resuelve exacto):
 *              CO       H₂O      CO₂      H₂
 *       I     1,00     1,00     0,50     0,50
 *       C      −x       −x       +x       +x
 *       E    1−x      1−x    0,5+x    0,5+x
 *       (0,5+x)² / (1−x)² = 5  ⇒  (0,5+x)/(1−x) = √5 = 2,2360680
 *       0,5 + x = 2,2360680 − 2,2360680x  ⇒  3,2360680x = 1,7360680  ⇒  x = 0,5364745
 *       [CO]eq = [H₂O]eq = 1 − 0,5364745 = 0,4635255   → «0,4635 mol/L»
 *       [CO₂]eq = [H₂]eq = 0,5 + 0,5364745 = 1,0364745 → «1,0365 mol/L»
 *       Control: (1,0364745 / 0,4635255)² = 2,2360680² = 5,0000 = Kc ✔
 *
 *   CASO 1 bis (normal, con coeficientes ≠ 1) — Haber-Bosch · N₂ + 3H₂ ⇌ 2NH₃ · Kc = 0,5 · Δn = −2
 *     Partida: [N₂] = 1,0 · [H₂] = 3,0 · [NH₃] = 0,5
 *       Q = [NH₃]² / ([N₂][H₂]³) = 0,25 / (1 · 27) = 0,00925926   → «0,0093»
 *       Q < Kc ⇒ HACIA PRODUCTOS. ICE: [N₂] = 1−ξ · [H₂] = 3−3ξ · [NH₃] = 0,5+2ξ
 *       (0,5+2ξ)² / ((1−ξ)·27(1−ξ)³) = 0,5  ⇒  (0,5+2ξ)² = 13,5(1−ξ)⁴
 *       Raíz positiva: 0,5+2ξ = √13,5 (1−ξ)² con √13,5 = 3,6742346
 *       3,6742346ξ² − 9,3484692ξ + 3,1742346 = 0  ⇒  ξ = 0,4035520 (la raíz < 1)
 *       [N₂]eq  = 1 − 0,4035520      = 0,5964480 → «0,5964 mol/L»
 *       [H₂]eq  = 3 − 3·0,4035520    = 1,7893441 → «1,7893 mol/L»
 *       [NH₃]eq = 0,5 + 2·0,4035520  = 1,3071040 → «1,3071 mol/L»
 *       Control: 1,3071040² / (0,5964480 · 1,7893441³) = 1,708521 / 3,417029 = 0,50000 ✔
 *
 *   CASO 2 (límite) — Δn = 0: la presión NO debe mover nada
 *     Water-gas shift tiene 2 mol de gas a cada lado ⇒ Δn = (1+1) − (1+1) = 0.
 *     Comprimir ×2 multiplica las cuatro concentraciones por 2 y Q = (2a·2b)/(2c·2d) = Q:
 *     el cociente es INVARIANTE. La app debe dejar las concentraciones intactas, Q en 0,2500
 *     y decirlo. Lo mismo al expandir ÷2. (Es el error clásico: desplazar igualmente.)
 *     Y como Δn = 0, además Kp = Kc·(RT)⁰ = Kc.
 *
 *   CASO 2 bis (límite) — van t Hoff sobre la esterificación · ΔH = −3 kJ/mol · Kc(298) = 4
 *       ln(K₂/K₁) = −ΔH/R · (1/T₂ − 1/T₁) = (3000/8,314) · (1/348 − 1/298)
 *                 = 360,8370 · (0,00287356 − 0,00335570)
 *                 = 360,8370 · (−0,00048214) = −0,1739746
 *       K₂ = 4 · e^(−0,1739746) = 4 · 0,8403183 = 3,3612731   → «3,3613»
 *       ΔH < 0 ⇒ al subir T la Kc BAJA. Lo confirma el propio número de la app (4,0000 → 3,3613).
 *
 *   CASO 3 (rechazo) — concentración negativa, campo vacío y texto
 *       −5 mol/L no existe, «» no es una cantidad y «abc» tampoco: la app debe quedarse en 0
 *       sin emitir NaN, «No definido» ni Infinity en ninguna casilla del panel 5.
 *       Además la temperatura: −100 K está por debajo del cero absoluto y no es un estado físico.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * HALLAZGOS ABIERTOS. Van al final, marcados con `test.fail()`: cada uno afirma lo que la app
 * DEBERÍA hacer y hoy falla a propósito, de modo que la suite queda en VERDE mientras el defecto
 * siga ahí. El día que se reparen saldrán en ROJO («expected to fail, but passed») y habrá que
 * quitarles la marca, con lo que pasan a ser red de regresión. El Inspector no repara.
 *
 *   [1] calculo/alto — El mensaje de Le Chatelier CONTRADICE la flecha que la app pinta a la
 *       vez, porque NINGUNO de los 6 estados de partida está en equilibrio (Q ≪ Kc en los seis:
 *       0,0093/0,5 · 0,04/4 · 0,01/0,04 · 0,50/4,32 · 25/170 · 0,25/5). Le Chatelier solo habla
 *       de sistemas EN equilibrio, pero el mensaje está cableado al tipo de perturbación y no
 *       mira el estado real. Comprobado que la raíz es esa: partiendo de un equilibrio de
 *       verdad (botón «Aplicar nuevo equilibrio») el mensaje y la flecha SÍ coinciden.
 *
 *   [2] calculo/alto — La esterificación está marcada `exotermica: false` teniendo ΔH = −3
 *       kJ/mol. La tarjeta se rotula a sí misma «endotérmica · ΔH = -3 kJ/mol» (imposible), la
 *       tabla del bloque educativo la llama «Casi neutra», y al subir T el mensaje afirma
 *       «reacción endotérmica (ΔH>0) … hacia los productos (→). Kc aumenta» mientras el panel
 *       de al lado enseña la Kc BAJANDO de 4,0000 a 3,3613. Signo invertido.
 *
 *   [3] dato/medio — Cuatro de las seis Kc no son las de 298 K, pero la app las rotula
 *       «Kc (a 298 K, referencia)» y ancla van t Hoff en T₁ = 298 K. Kc(298 K) reales, desde
 *       ΔG°f tabuladas (CRC/Atkins) vía K = e^(−ΔG°/RT) y Kc = Kp(RT)^(−Δn), RT = 24,78 L·bar/mol:
 *         Haber-Bosch  ΔG° = 2·(−16,4) = −32,8 kJ ⇒ Kp = 5,6·10⁵ ⇒ Kc ≈ 3,4·10⁸ · app: 0,50 (es ~700 K)
 *         Contacto SO₃ ΔG° = −142,0 kJ           ⇒ Kc ≈ 1,9·10²⁶ · app: 4,32  (es ~1000 K)
 *         Water-gas    ΔG° = −28,6 kJ            ⇒ Kc ≈ 1,0·10⁵  · app: 5,00  (es ~900 K)
 *         PCl₅         ΔG° = +37,2 kJ            ⇒ Kc ≈ 1,2·10⁻⁸ · app: 0,04  (es ~500 K)
 *       Las dos que SÍ cuadran a 298 K: NO₂/N₂O₄ (ΔG° = −4,73 kJ ⇒ Kc ≈ 167, app 170) y la
 *       esterificación (Kc ≈ 4, valor clásico). Los seis ΔH sí son correctos.
 *
 *   [4] operativa/medio — La temperatura no se valida: el `min={100}`/`max={2000}` del input es
 *       decorativo porque el onChange hace `parseFloat(v) || 298` sin acotar. −100 K se acepta y
 *       la app rotula «Kc (a -100 K) = ≈0» como si fuera un estado. 99999 K, igual. Y T = 0
 *       cae en el `|| 298` (0 es falsy) y se convierte en 298 en silencio.
 *
 *   [5] operativa/bajo — Con un reactivo en 0 el suelo interno de 1e-12 mol/L asoma en pantalla:
 *       Q se muestra como «9.259.259.259,2593» (= 0,25 / (1e-12 · 27)), un número de aspecto
 *       exacto que no es Q sino el epsilon. A mano, con [N₂] = 0 el cociente diverge (Q → ∞).
 *       El SENTIDO que deduce sí es el correcto (← reactivos) y el equilibrio predicho también.
 *
 *   [6] accesibilidad/bajo — Los 7 emojis decorativos propios de la app van sin
 *       aria-hidden="true" pese a estar junto a texto: 🧪 📐 🌡️ 🔢 ⚖️ 🔍 (tarjetas de «Mejores
 *       Prácticas») y ⚠️ (cabecera de «Errores Frecuentes»).
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

const RUTA = '/simulador-equilibrio-quimico/';

/** Valor de una fila del panel «5. Análisis cuantitativo», buscado por su etiqueta exacta. */
const valorDe = (page: Page, etiqueta: string) =>
  page.locator(`xpath=//span[normalize-space(.)='${etiqueta}']/following-sibling::span[1]`);

/**
 * La banda con la flecha de desplazamiento del panel 4. Se acota por sección porque
 * EducationalSection monta OTRO div con aria-live="polite" (su contenido colapsable).
 */
const flecha = (page: Page) =>
  page.locator(
    'xpath=//h2[contains(., "Visualización del sistema")]/ancestor::section[1]//div[@aria-live="polite"]',
  );

/** El bloque «Le Chatelier dice: …». */
const mensaje = (page: Page) => page.locator('div[role="status"]');

const reaccion = (page: Page, nombre: RegExp) => page.getByRole('button', { name: nombre });

/** Todo el texto del panel 5, para barrer NaN/Infinity de una sola pasada. */
function panelCuantitativo(page: Page) {
  return page.locator('xpath=//h2[contains(., "Análisis cuantitativo")]/ancestor::section[1]');
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Simulador de Equilibrio Químico');
});

test('la app promete lo que este fichero verifica', async ({ page }) => {
  // La promesa del subtítulo y la de los cinco pasos que la app se impone a sí misma.
  await expect(page.getByText('Principio de Le Chatelier en acción')).toBeVisible();
  await expect(page.getByRole('heading', { name: '1. Elige una reacción reversible' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '3. Aplica una perturbación' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '5. Análisis cuantitativo' })).toBeVisible();

  // Las 6 reacciones que anuncian metadata y bloque educativo, cada una como tarjeta pulsable.
  await expect(page.locator('button[aria-pressed]')).toHaveCount(6);
  for (const nombre of [
    /Haber-Bosch/,
    /Esterificación/,
    /Disociación de PCl₅/,
    /proceso de contacto/,
    /Equilibrio NO₂/,
    /Water-gas shift/,
  ]) {
    await expect(reaccion(page, nombre)).toBeVisible();
  }
});

test('CASO 1 (normal) — water-gas shift: Q, Kc, Δn y la ICE completa', async ({ page }) => {
  await reaccion(page, /Water-gas shift/).click();

  // La ecuación sobre la que descansa el cálculo hecho a mano.
  await expect(page.getByText('CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g)')).toBeVisible();

  // Q = (0,50·0,50)/(1,00·1,00) = 0,25 — cabecera del CASO 1
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,2500');
  await expect(valorDe(page, 'Kc (a 298 K)')).toHaveText('5,0000');
  // Δn = (1+1) − (1+1) = 0, los dos lados con 2 mol de gas
  await expect(valorDe(page, 'Δn (gas)')).toHaveText('0');
  // Q = 0,25 < Kc = 5 ⇒ hacia productos
  await expect(valorDe(page, 'Dirección de desplazamiento')).toHaveText('→ Productos');
  await expect(flecha(page)).toContainText('Q < Kc → Sistema avanza HACIA PRODUCTOS');

  // ICE resuelta a mano: x = (√5 − 0,5)/(1 + √5) = 0,5364745
  await expect(valorDe(page, '[CO]eq')).toHaveText('0,4635 mol/L'); // 1 − 0,5364745
  await expect(valorDe(page, '[H₂O]eq')).toHaveText('0,4635 mol/L'); // idéntico, por la simetría 1:1
  await expect(valorDe(page, '[CO₂]eq')).toHaveText('1,0365 mol/L'); // 0,5 + 0,5364745
  await expect(valorDe(page, '[H₂]eq')).toHaveText('1,0365 mol/L');
});

test('CASO 1 bis (normal) — Haber-Bosch: la ICE con coeficientes 1:3:2', async ({ page }) => {
  await reaccion(page, /Haber-Bosch/).click();

  // Q = 0,5² / (1 · 3³) = 0,25/27 = 0,00925926
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,0093');
  await expect(valorDe(page, 'Kc (a 298 K)')).toHaveText('0,5000');
  // Δn = 2 − (1+3) = −2
  await expect(valorDe(page, 'Δn (gas)')).toHaveText('-2');
  await expect(valorDe(page, 'Dirección de desplazamiento')).toHaveText('→ Productos');

  // Raíz de 3,6742346ξ² − 9,3484692ξ + 3,1742346 = 0  ⇒  ξ = 0,4035520
  await expect(valorDe(page, '[N₂]eq')).toHaveText('0,5964 mol/L'); // 1 − ξ
  await expect(valorDe(page, '[H₂]eq')).toHaveText('1,7893 mol/L'); // 3 − 3ξ
  await expect(valorDe(page, '[NH₃]eq')).toHaveText('1,3071 mol/L'); // 0,5 + 2ξ

  // Y el equilibrio predicho es un equilibrio de verdad: al aplicarlo, Q pasa a valer Kc.
  await page.getByRole('button', { name: 'Aplicar nuevo equilibrio' }).click();
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,5000');
  await expect(valorDe(page, 'Dirección de desplazamiento')).toHaveText('⇌ Equilibrio');
});

test('CASO 2 (límite) — con Δn = 0 la presión no mueve absolutamente nada', async ({ page }) => {
  await reaccion(page, /Water-gas shift/).click();
  await expect(valorDe(page, 'Δn (gas)')).toHaveText('0');
  // La propia etiqueta del grupo de presión ya avisa de que no habrá efecto.
  await expect(page.getByText('Presión (Δn=0, sin efecto)')).toBeVisible();

  await page.getByRole('button', { name: /Comprimir/ }).click();
  // Comprimir ×2 multiplicaría las cuatro por 2 y Q = (2a·2b)/(2c·2d) = Q: invariante.
  await expect(page.locator('#conc-CO')).toHaveValue('1');
  await expect(page.locator('#conc-H₂O')).toHaveValue('1');
  await expect(page.locator('#conc-CO₂')).toHaveValue('0.5');
  await expect(page.locator('#conc-H₂')).toHaveValue('0.5');
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,2500');
  await expect(mensaje(page)).toContainText('Comprimir no afecta porque Δn = 0');

  await page.getByRole('button', { name: /Expandir/ }).click();
  await expect(page.locator('#conc-CO')).toHaveValue('1');
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,2500');
  await expect(mensaje(page)).toContainText('Expandir no afecta porque Δn = 0');

  // La esterificación es el otro Δn = 0 (líquida entera): comprimir tampoco puede tocarla.
  await reaccion(page, /Esterificación/).click();
  await expect(valorDe(page, 'Δn (gas)')).toHaveText('0');
  await page.getByRole('button', { name: /Comprimir/ }).click();
  await expect(page.locator('#conc-CH₃COOH')).toHaveValue('1');
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,0400'); // (0,2·0,2)/(1·1)
});

test('CASO 2 (límite) — con Δn ≠ 0 comprimir sí mueve Q, y en el sentido correcto', async ({ page }) => {
  // Haber-Bosch, Δn = −2: al duplicar todo, Q = (2·NH₃)²/((2·N₂)(2·H₂)³) = Q/4 ⇒ Q baja ⇒ →
  await reaccion(page, /Haber-Bosch/).click();
  await page.getByRole('button', { name: /Comprimir/ }).click();
  await expect(page.locator('#conc-N₂')).toHaveValue('2');
  await expect(page.locator('#conc-H₂')).toHaveValue('6');
  await expect(page.locator('#conc-NH₃')).toHaveValue('1');
  // 1²/(2·6³) = 1/432 = 0,0023148 — exactamente Q/4 del 0,0092593 de partida
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,0023');
  await expect(mensaje(page)).toContainText('los productos (→)');

  // PCl₅, Δn = +1: al duplicar todo, Q = (2·PCl₃)(2·Cl₂)/(2·PCl₅) = 2Q ⇒ Q sube ⇒ ←
  await reaccion(page, /Disociación de PCl₅/).click();
  await expect(valorDe(page, 'Δn (gas)')).toHaveText('1');
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,0100'); // (0,1·0,1)/1
  await page.getByRole('button', { name: /Comprimir/ }).click();
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,0200'); // (0,2·0,2)/2 = 2·Q
  await expect(mensaje(page)).toContainText('los reactivos (←)');
});

test('CASO 2 bis (límite) — la ecuación de van t Hoff mueve Kc bien en exo y en endo', async ({ page }) => {
  // Haber-Bosch, ΔH = −92 kJ/mol (exotérmica): subir T tiene que BAJAR Kc.
  // ln(K₂/K₁) = (92000/8,314)·(1/348 − 1/298) = 11066,15 · (−0,00048214) = −5,33565
  // K₂ = 0,5 · e^(−5,33565) = 0,5 · 0,0048185 = 0,00240925 → «0,0024»
  await reaccion(page, /Haber-Bosch/).click();
  await page.getByRole('button', { name: /Subir T/ }).click();
  await expect(page.locator('#temperatura')).toHaveValue('348');
  await expect(valorDe(page, 'Kc (a 348 K)')).toHaveText('0,0024');
  await expect(valorDe(page, 'Kc (a 298 K, referencia)')).toHaveText('0,5000');
  await expect(mensaje(page)).toContainText('Kc disminuye');
  // Q sigue en 0,0093 y ahora Q > Kc ⇒ el sistema retrocede
  await expect(valorDe(page, 'Dirección de desplazamiento')).toHaveText('← Reactivos');

  // PCl₅, ΔH = +88 kJ/mol (endotérmica): subir T tiene que SUBIR Kc.
  // ln(K₂/K₁) = (−88000/8,314)·(−0,00048214) = +5,10331 ⇒ K₂ = 0,04 · 164,56 = 6,5823
  await reaccion(page, /Disociación de PCl₅/).click();
  await page.getByRole('button', { name: /Subir T/ }).click();
  await expect(valorDe(page, 'Kc (a 348 K)')).toHaveText('6,5823');
  await expect(mensaje(page)).toContainText('Kc aumenta');
  await expect(valorDe(page, 'Dirección de desplazamiento')).toHaveText('→ Productos');
});

test('el catalizador no toca ni el equilibrio ni Kc', async ({ page }) => {
  await reaccion(page, /Haber-Bosch/).click();
  await page.getByRole('button', { name: /Añadir catalizador/ }).click();
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,0093');
  await expect(valorDe(page, 'Kc (a 298 K)')).toHaveText('0,5000');
  await expect(valorDe(page, '[NH₃]eq')).toHaveText('1,3071 mol/L');
  await expect(mensaje(page)).toContainText('NO desplaza el equilibrio ni cambia Kc');
});

test('CASO 3 (rechazo) — negativo, vacío y texto no producen NaN ni resultado imposible', async ({ page }) => {
  await reaccion(page, /Haber-Bosch/).click();

  // −5 mol/L no existe: debe quedarse en 0.
  await page.locator('#conc-N₂').fill('-5');
  await expect(page.locator('#conc-N₂')).toHaveValue('0');

  // Campo vacío: tampoco es una cantidad.
  await page.locator('#conc-N₂').fill('');
  await expect(page.locator('#conc-N₂')).toHaveValue('0');

  // Texto tecleado de verdad (el input[type=number] lo descarta antes de llegar al estado).
  await page.locator('#conc-N₂').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('abc');
  await expect(page.locator('#conc-N₂')).toHaveValue('0');

  // Y en ninguno de los tres el panel 5 emite basura.
  const panel = await panelCuantitativo(page).innerText();
  expect(panel).not.toContain('NaN');
  expect(panel).not.toContain('No definido');
  expect(panel).not.toContain('Infinity');
  expect(panel).not.toContain('undefined');

  // Con [N₂] = 0 y NH₃ presente el sentido correcto es hacia reactivos, y lo acierta.
  await expect(valorDe(page, 'Dirección de desplazamiento')).toHaveText('← Reactivos');
  // El equilibrio predicho es coherente: y = 0,0155 cumple (0,5−2y)²/(y(3+3y)³) ≈ 0,5
  await expect(valorDe(page, '[N₂]eq')).toHaveText('0,0155 mol/L');
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// HALLAZGOS ABIERTOS
// ─────────────────────────────────────────────────────────────────────────────────────────

test('HALLAZGO [1] — el mensaje de Le Chatelier contradice la flecha de la propia app', async ({ page }) => {
  test.fail(); // Reparado el día que esto pase en verde.
  await reaccion(page, /Haber-Bosch/).click();

  // Primero, la prueba de que el motor NO está invertido: partiendo de un equilibrio real,
  // añadir un producto da mensaje y flecha coincidentes (ambos «hacia los reactivos»).
  await page.getByRole('button', { name: 'Aplicar nuevo equilibrio' }).click();
  await expect(valorDe(page, 'Dirección de desplazamiento')).toHaveText('⇌ Equilibrio');
  await page.getByRole('button', { name: '+ Añadir NH₃' }).click();
  // Q = 1,8071²/(0,59645·1,78934³) = 3,26563/3,41651 = 0,95573 > Kc = 0,5 ⇒ ←
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,9557');
  await expect(valorDe(page, 'Dirección de desplazamiento')).toHaveText('← Reactivos');
  await expect(mensaje(page)).toContainText('hacia los reactivos (←)');

  // Ahora la MISMA perturbación desde el estado de fábrica, que NO está en equilibrio
  // (Q = 0,0093 frente a Kc = 0,5). Le Chatelier no aplica: con Q todavía muy por debajo de Kc
  // el sistema avanza a productos, y el mensaje debe decir lo mismo que la flecha.
  await page.getByRole('button', { name: 'Restaurar valores iniciales' }).click();
  await page.getByRole('button', { name: '+ Añadir NH₃' }).click();
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,0370'); // 1,0²/(1·27)
  await expect(valorDe(page, 'Dirección de desplazamiento')).toHaveText('→ Productos');
  await expect(flecha(page)).toContainText('HACIA PRODUCTOS');
  const trasAnadirProducto = await mensaje(page).innerText();

  // El mismo choque con la presión: comprimir PCl₅ (Δn = +1) SUBE Q de 0,0100 a 0,0200, que
  // sigue por debajo de Kc = 0,04, así que la flecha marca «→ Productos» y el mensaje también.
  await reaccion(page, /Disociación de PCl₅/).click();
  await page.getByRole('button', { name: /Comprimir/ }).click();
  await expect(valorDe(page, 'Dirección de desplazamiento')).toHaveText('→ Productos');
  const trasComprimir = await mensaje(page).innerText();

  // Los dos mensajes tienen que concordar con la flecha que la app pinta a la vez.
  expect(trasAnadirProducto).toContain('los productos (→)');
  expect(trasComprimir).toContain('los productos (→)');
});

test('HALLAZGO [2] — la esterificación va marcada endotérmica teniendo ΔH = −3 kJ/mol', async ({ page }) => {
  test.fail(); // Reparado el día que esto pase en verde.
  const tarjeta = reaccion(page, /Esterificación/);
  const rotulo = await tarjeta.innerText();
  expect(rotulo).toContain('ΔH = -3 kJ/mol'); // el ΔH tabulado sí es el correcto

  await tarjeta.click();
  await expect(valorDe(page, 'Kc (a 298 K)')).toHaveText('4,0000');
  await page.getByRole('button', { name: /Subir T/ }).click();

  // van t Hoff con ΔH = −3 kJ/mol: K₂ = 4·e^(−0,1739746) = 3,3613. Este número sí está bien:
  // la Kc BAJA al calentar, que es exactamente lo que hace una reacción exotérmica.
  await expect(valorDe(page, 'Kc (a 348 K)')).toHaveText('3,3613');
  await expect(valorDe(page, 'Kc (a 298 K, referencia)')).toHaveText('4,0000');
  const texto = await mensaje(page).innerText();

  // Con ΔH < 0 la reacción es exotérmica: el rótulo de la tarjeta y el mensaje deben decirlo,
  // en vez de anunciar una subida de Kc que el panel de al lado desmiente.
  expect(rotulo).toContain('exotérmica');
  expect(texto).toContain('Kc disminuye');
});

test('HALLAZGO [3] — cuatro de las seis Kc no son las de 298 K que la app dice', async ({ page }) => {
  test.fail(); // Reparado el día que esto pase en verde.
  /** «1.234,56» → 1234.56 */
  const numeroEs = (s: string): number => Number(s.replace(/\./g, '').replace(',', '.'));

  // Las dos que SÍ son las de 298 K, como control de que el criterio se aplica bien.
  // NO₂/N₂O₄: ΔG° = 97,89 − 2·51,31 = −4,73 kJ/mol ⇒ Kp = 6,75 bar⁻¹
  //           ⇒ Kc = Kp·RT = 6,75 · 24,78 = 167 ≈ 170. Correcta.
  await reaccion(page, /Equilibrio NO₂/).click();
  await expect(valorDe(page, 'Kc (a 298 K, referencia)')).toHaveText('170,0000');
  // Q de partida = 1,0 / 0,2² = 25 (el N₂O₄ va en el numerador, exponente 1; NO₂ al cuadrado)
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('25,0000');
  // Esterificación: Kc ≈ 4 es el valor clásico a temperatura ambiente. También correcta.
  await reaccion(page, /Esterificación/).click();
  await expect(valorDe(page, 'Kc (a 298 K, referencia)')).toHaveText('4,0000');

  // Kc(298 K) real del Haber ≈ 3,4·10⁸ (ΔG° = 2·ΔG°f(NH₃) = −32,8 kJ/mol ⇒ Kp = 5,6·10⁵,
  // Kc = Kp·(RT)² con RT = 24,78 L·bar/mol). La app tabula 0,50, que es el valor a ~700 K.
  await reaccion(page, /Haber-Bosch/).click();
  const kcHaber = numeroEs(await valorDe(page, 'Kc (a 298 K, referencia)').innerText());

  // Proceso de contacto: Kc(298 K) ≈ 1,9·10²⁶ (ΔG° = −142,0 kJ/mol). La app tabula 4,32 (~1000 K).
  await reaccion(page, /proceso de contacto/).click();
  const kcSO3 = numeroEs(await valorDe(page, 'Kc (a 298 K, referencia)').innerText());

  // Una Kc rotulada «a 298 K» tiene que ser la de 298 K, y a esa temperatura las dos son
  // enormes: ambas reacciones están desplazadísimas hacia productos en frío.
  expect(kcHaber).toBeGreaterThan(1000);
  expect(kcSO3).toBeGreaterThan(1000);
});

test('HALLAZGO [4] — la temperatura no se valida: −100 K se acepta como estado', async ({ page }) => {
  test.fail(); // Reparado el día que esto pase en verde.
  await reaccion(page, /Haber-Bosch/).click();
  const campo = page.locator('#temperatura');

  // El input declara min={100} y max={2000}, pero el onChange hace `parseFloat(v) || 298`
  // sin acotar, así que esos límites nunca llegan al estado.
  await campo.fill('-100');
  const bajoCero = await campo.inputValue();
  await campo.fill('99999');
  const pasado = await campo.inputValue();
  await campo.fill('0');
  const cero = await campo.inputValue();

  // Por debajo del cero absoluto no hay estado físico: debe acotarse al mínimo declarado.
  expect(Number(bajoCero)).toBeGreaterThanOrEqual(100);
  // Y por arriba, al máximo declarado.
  expect(Number(pasado)).toBeLessThanOrEqual(2000);
  // T = 0 cae hoy en el `|| 298` (0 es falsy) y se vuelve 298 K en silencio. Lo correcto es
  // acotar al mínimo declarado, no sustituir lo que el usuario escribió por otra temperatura.
  expect(Number(cero)).toBe(100);
});

test('HALLAZGO [5] — con un reactivo en 0, lo que se enseña como Q es el epsilon interno', async ({ page }) => {
  test.fail(); // Reparado el día que esto pase en verde.
  await reaccion(page, /Haber-Bosch/).click();
  await page.locator('#conc-N₂').fill('0');
  // A mano, con [N₂] = 0 el cociente diverge: Q = 0,5²/(0 · 3³) → ∞. Hoy el suelo interno de
  // 1e-12 mol/L de calcularQ() asoma en pantalla y lo convierte en 0,25/(1e-12 · 27) =
  // «9.259.259.259,2593», una cifra de aspecto exacto que no es Q sino el epsilon.
  // formatNumber ya sabe pintar «∞» para un valor no finito, así que la vía está abierta.
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('∞');
});

test('HALLAZGO [6] — los emojis decorativos propios de la app van sin aria-hidden', async ({ page }) => {
  test.fail(); // Reparado el día que esto pase en verde.
  // Solo los del bloque educativo de ESTA app; el contenido se monta siempre en el DOM,
  // así que no hace falta desplegarlo para inspeccionarlo.
  const sinAriaHidden = await page.evaluate(() => {
    const titulo = [...document.querySelectorAll('h3')].find((h) =>
      h.textContent?.includes('Guía de Equilibrio Químico'),
    );
    const contenido = titulo?.closest('div')?.parentElement?.querySelector('[aria-live="polite"]');
    if (!contenido) return [];
    return [...contenido.querySelectorAll('span')]
      .filter((s) => /^[\p{Extended_Pictographic}️]+$/u.test(s.textContent?.trim() ?? ''))
      .filter((s) => (s.textContent?.trim() ?? '').length > 0)
      .filter((s) => s.getAttribute('aria-hidden') !== 'true')
      .map((s) => s.textContent!.trim());
  });
  // Hoy salen 🧪 📐 🌡️ 🔢 ⚖️ 🔍 de «Mejores Prácticas» y ⚠️ de «Errores Frecuentes»; todos van
  // junto a texto, así que ninguno debería llegar al lector de pantalla.
  expect(sinAriaHidden).toEqual([]);
});
