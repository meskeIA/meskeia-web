import { test, expect, Page } from '@playwright/test';
import {
  CASOS,
  OPCIONES_DIRECCION,
  REACCIONES,
  TOTAL_CASOS,
  T_REFERENCIA_K,
  calcularQ,
  comprobarPrediccion,
  comprobarRespuesta,
  deltaN,
  equilibrioDePartida,
  esExotermicaDe,
  nuevoEquilibrio,
  nuevoKcConTemperatura,
  resolverCasoNumerico,
  simularPerturbacion,
  toleranciaDe,
  type CasoNumerico,
  type CasoPrediccion,
} from '../../app/simulador-equilibrio-quimico/casos';

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
 * HALLAZGOS del 21/08, reparados el 23/08/2026 (tanda 3). Se escribieron con `test.fail()`
 * afirmando lo que la app
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
  //
  // ⚠️ ACOTADO al panel del simulador el 11/09/2026. La comprobación es la misma —que la
  // ecuación de esta reacción está a la vista antes de calcular nada—, pero desde que la app
  // tiene casos para clase la misma ecuación aparece además en las tarjetas de los casos 2 y
  // 11 y dentro del enunciado del 11, así que el locator global encontraba cuatro nodos y
  // Playwright lo rechazaba por ambiguo. No se ha relajado la aserción: se ha dicho DÓNDE.
  await expect(
    page.locator('#panel-simulador').getByText('CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g)'),
  ).toBeVisible();

  // ⚠️ ACTUALIZADO el 23/08/2026 (hallazgo 171). La app ya no arranca en las concentraciones
  // sugeridas en crudo —que no eran un equilibrio— sino EN el equilibrio, porque Le Chatelier
  // solo habla de sistemas en equilibrio. Y el estado de partida de hoy es exactamente el que
  // este mismo test calculaba a mano como equilibrio predicho:
  //   ICE desde CO=1, H₂O=1, CO₂=0,5, H₂=0,5 con Kc=5:
  //   x = (√5 − 0,5)/(1 + √5) = 1,7360679/3,2360679 = 0,5364745
  //   CO = H₂O = 1 − x = 0,4635 · CO₂ = H₂ = 0,5 + x = 1,0365
  await expect(page.locator('#conc-CO')).toHaveValue('0.4635');
  await expect(page.locator('#conc-CO₂')).toHaveValue('1.0365');

  // Q = (1,0365)² / (0,4635)² = 1,074332 / 0,214832 = 5,0008 ≈ Kc
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('5,0008');
  await expect(valorDe(page, 'Kc (a 298 K)')).toHaveText('5,0000');
  // Δn = (1+1) − (1+1) = 0, los dos lados con 2 mol de gas
  await expect(valorDe(page, 'Δn (gas)')).toHaveText('0');
  // Q ≈ Kc ⇒ el sistema está donde tiene que estar antes de perturbarlo
  await expect(valorDe(page, 'Dirección de desplazamiento')).toHaveText('⇌ Equilibrio');

  // Y el equilibrio predicho coincide consigo mismo, que es lo que significa estar en él
  await expect(valorDe(page, '[CO]eq')).toHaveText('0,4635 mol/L');
  await expect(valorDe(page, '[H₂O]eq')).toHaveText('0,4635 mol/L');
  await expect(valorDe(page, '[CO₂]eq')).toHaveText('1,0365 mol/L');
  await expect(valorDe(page, '[H₂]eq')).toHaveText('1,0365 mol/L');
});

test('CASO 1 bis (normal) — Haber-Bosch: la ICE con coeficientes 1:3:2', async ({ page }) => {
  await reaccion(page, /Haber-Bosch/).click();

  // ⚠️ ACTUALIZADO el 23/08/2026 (hallazgo 171): se arranca EN el equilibrio.
  //   Partiendo de N₂=1, H₂=3, NH₃=0,5 con Kc=0,5, el avance ξ lleva a
  //   N₂ = 0,5964 · H₂ = 1,7893 · NH₃ = 1,3071
  //   Q = 1,3071² / (0,5964 · 1,7893³) = 1,70851 / 3,41655 = 0,5001 ≈ Kc ✓
  await expect(page.locator('#conc-N₂')).toHaveValue('0.5964');
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,5001');
  await expect(valorDe(page, 'Kc (a 298 K)')).toHaveText('0,5000');
  // Δn = 2 − (1+3) = −2
  await expect(valorDe(page, 'Δn (gas)')).toHaveText('-2');
  await expect(valorDe(page, 'Dirección de desplazamiento')).toHaveText('⇌ Equilibrio');

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

  // ⚠️ Concentraciones actualizadas el 23/08/2026: se parte del equilibrio (hallazgo 171).
  // Lo que se comprueba es lo mismo: con Δn = 0 la presión no mueve NADA.
  await page.getByRole('button', { name: /Comprimir/ }).click();
  await expect(page.locator('#conc-CO')).toHaveValue('0.4635');
  await expect(page.locator('#conc-H₂O')).toHaveValue('0.4635');
  await expect(page.locator('#conc-CO₂')).toHaveValue('1.0365');
  await expect(page.locator('#conc-H₂')).toHaveValue('1.0365');
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('5,0008');
  await expect(mensaje(page)).toContainText('Comprimir no afecta porque Δn = 0');

  await page.getByRole('button', { name: /Expandir/ }).click();
  await expect(page.locator('#conc-CO')).toHaveValue('0.4635');
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('5,0008');
  await expect(mensaje(page)).toContainText('Expandir no afecta porque Δn = 0');

  // La esterificación es el otro Δn = 0 (líquida entera): comprimir tampoco puede tocarla.
  await reaccion(page, /Esterificación/).click();
  await expect(valorDe(page, 'Δn (gas)')).toHaveText('0');
  await page.getByRole('button', { name: /Comprimir/ }).click();
  // Equilibrio de partida: desde AcOH=EtOH=1 y éster=H₂O=0,2 con Kc=4,
  // (0,2+x)/(1−x) = 2 ⇒ x = 0,6 ⇒ AcOH = 0,4 y éster = 0,8 ⇒ Q = 0,8²/0,4² = 4
  await expect(page.locator('#conc-CH₃COOH')).toHaveValue('0.4');
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('4,0000');
});

test('CASO 2 (límite) — con Δn ≠ 0 comprimir sí mueve Q, y en el sentido correcto', async ({ page }) => {
  // Haber-Bosch, Δn = −2: al duplicar todo, Q = (2·NH₃)²/((2·N₂)(2·H₂)³) = Q/4 ⇒ Q baja ⇒ →
  await reaccion(page, /Haber-Bosch/).click();
  await page.getByRole('button', { name: /Comprimir/ }).click();
  // ⚠️ Actualizado el 23/08/2026: se parte del equilibrio (N₂ 0,5964 · H₂ 1,7893 · NH₃ 1,3071).
  await expect(page.locator('#conc-N₂')).toHaveValue('1.1928');
  await expect(page.locator('#conc-H₂')).toHaveValue('3.5786');
  await expect(page.locator('#conc-NH₃')).toHaveValue('2.6142');
  // Q = 2,6142² / (1,1928 · 3,5786³) = 6,83405 / 54,6620 = 0,1250
  // — exactamente Q/4 del 0,5001 de partida, que es la propiedad que Δn = −2 garantiza
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,1250');
  await expect(mensaje(page)).toContainText('los productos (→)');

  // PCl₅, Δn = +1: al duplicar todo, Q = (2·PCl₃)(2·Cl₂)/(2·PCl₅) = 2Q ⇒ Q sube ⇒ ←
  await reaccion(page, /Disociación de PCl₅/).click();
  await expect(valorDe(page, 'Δn (gas)')).toHaveText('1');
  // Equilibrio de partida: desde PCl₅=1, PCl₃=Cl₂=0,1 con Kc=0,04,
  //   (0,1+x)²/(1−x) = 0,04 ⇒ x² + 0,24x − 0,03 = 0 ⇒ x = 0,0907
  //   PCl₅ = 0,9093 · PCl₃ = Cl₂ = 0,1907 ⇒ Q = 0,1907²/0,9093 = 0,0400 = Kc ✓
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,0400');
  await page.getByRole('button', { name: /Comprimir/ }).click();
  // 0,3814² / 1,8186 = 0,145466 / 1,8186 = 0,0800 — el doble, que es lo que Δn = +1 predice
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,0800');
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
  await expect(valorDe(page, 'Kc de referencia (didáctica, a 298 K)')).toHaveText('0,5000');
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
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,5001');
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
  // ⚠️ Valores recalculados el 23/08/2026: desde la reparación del hallazgo 171 la app parte
  // del EQUILIBRIO (N₂ 0,5964 · H₂ 1,7893 · NH₃ 1,3071) y no de las sugeridas en crudo.
  // Poniendo [N₂] = 0, el sistema retrocede con avance y hasta cumplir Kc:
  //   N₂ = y = 0,1629 · H₂ = 1,7893 + 3y = 2,2780 · NH₃ = 1,3071 − 2y = 0,9813
  //   comprobación: 0,9813² / (0,1629 · 2,2780³) = 0,96295 / 1,92553 = 0,5001 ≈ Kc ✓
  await expect(valorDe(page, '[N₂]eq')).toHaveText('0,1629 mol/L');
  await expect(valorDe(page, '[H₂]eq')).toHaveText('2,2780 mol/L');
  await expect(valorDe(page, '[NH₃]eq')).toHaveText('0,9813 mol/L');
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// HALLAZGOS ABIERTOS
// ─────────────────────────────────────────────────────────────────────────────────────────

test('HALLAZGO [1] — el mensaje de Le Chatelier contradice la flecha de la propia app', async ({ page }) => {
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
  // El estado de partida ya ES un equilibrio (Q = Kc), que es la premisa que Le Chatelier
  // necesita. Añadir producto lo saca de él hacia los reactivos, y el mensaje dice lo mismo
  // que la flecha — que es justo lo que antes no ocurría.
  await page.getByRole('button', { name: 'Restaurar valores iniciales' }).click();
  await page.getByRole('button', { name: '+ Añadir NH₃' }).click();
  // ⚠️ Recalculado el 23/08/2026. La app ya parte del equilibrio (Q = Kc = 0,5000), así que
  // añadir 0,5 de NH₃ lo lleva a 1,8071 y el cociente sube:
  //   Q = 1,8071² / (0,5964 · 1,7893³) = 3,26561 / 3,41655 = 0,9558
  // Q > Kc ⇒ el sistema retrocede, y el mensaje de Le Chatelier dice lo mismo. Ese es el
  // hallazgo 171: antes el estado de partida NO era un equilibrio y los dos se contradecían.
  await expect(valorDe(page, 'Q (cociente actual)')).toHaveText('0,9558');
  await expect(valorDe(page, 'Dirección de desplazamiento')).toHaveText('← Reactivos');
  await expect(flecha(page)).toContainText('HACIA REACTIVOS');
  const trasAnadirProducto = await mensaje(page).innerText();

  // Lo mismo con la presión, y ahora las dos cosas concuerdan porque se parte del equilibrio:
  // PCl₅ arranca en Q = Kc = 0,0400 y comprimir (Δn = +1) lo sube a 0,0800 > Kc, así que el
  // sistema retrocede — que es exactamente lo que Le Chatelier predice para Δn > 0.
  await reaccion(page, /Disociación de PCl₅/).click();
  await page.getByRole('button', { name: /Comprimir/ }).click();
  await expect(valorDe(page, 'Dirección de desplazamiento')).toHaveText('← Reactivos');
  const trasComprimir = await mensaje(page).innerText();

  // Los dos mensajes tienen que concordar con la flecha que la app pinta a la vez.
  expect(trasAnadirProducto).toContain('los reactivos (←)');
  expect(trasComprimir).toContain('los reactivos (←)');
});

test('HALLAZGO [2] — la esterificación va marcada endotérmica teniendo ΔH = −3 kJ/mol', async ({ page }) => {
  const tarjeta = reaccion(page, /Esterificación/);
  const rotulo = await tarjeta.innerText();
  expect(rotulo).toContain('ΔH = -3 kJ/mol'); // el ΔH tabulado sí es el correcto

  await tarjeta.click();
  await expect(valorDe(page, 'Kc (a 298 K)')).toHaveText('4,0000');
  await page.getByRole('button', { name: /Subir T/ }).click();

  // van t Hoff con ΔH = −3 kJ/mol: K₂ = 4·e^(−0,1739746) = 3,3613. Este número sí está bien:
  // la Kc BAJA al calentar, que es exactamente lo que hace una reacción exotérmica.
  await expect(valorDe(page, 'Kc (a 348 K)')).toHaveText('3,3613');
  await expect(valorDe(page, 'Kc de referencia (didáctica, a 298 K)')).toHaveText('4,0000');
  const texto = await mensaje(page).innerText();

  // Con ΔH < 0 la reacción es exotérmica: el rótulo de la tarjeta y el mensaje deben decirlo,
  // en vez de anunciar una subida de Kc que el panel de al lado desmiente.
  expect(rotulo).toContain('exotérmica');
  expect(texto).toContain('Kc disminuye');
});

test('HALLAZGO [3] — cuatro de las seis Kc no son las de 298 K que la app dice', async ({ page }) => {
  // ⚠️ REESCRITO el 23/08/2026 al reparar. El acta y este test daban por hecho que la
  // solución era poner las Kc REALES a 298 K (de ahí el `toBeGreaterThan(1000)` que había
  // aquí). No lo es: la Kc del Haber a 298 K es del orden de 10⁸ y la del proceso de
  // contacto, de 10²⁶ — con esos números ninguna perturbación se ve en pantalla y el
  // simulador deja de enseñar lo que promete.
  //
  // El defecto era la ETIQUETA, no el valor: presentar como «Kc (a 298 K, referencia)» unos
  // números que son didácticos. Tampoco vale sustituirla por una temperatura concreta —se
  // intentó, y las tablas dan 0,061 a 500 K, 0,159 a 723 K y 50 a 700 K según la fuente, así
  // que cualquier T que se escribiera sería otra afirmación sin respaldo—. Lo que la app
  // dice ahora es lo único verificable: que son valores de aula.
  //
  // Lo que sí es real y es lo que se enseña —los ΔH, el signo del desplazamiento y cómo se
  // mueve Kc con la temperatura— se comprueba en los casos de arriba.
  await reaccion(page, /Haber-Bosch/).click();
  const rotulo = await page.locator('body').innerText();
  expect(rotulo).not.toContain('Kc (a 298 K, referencia)');
  expect(rotulo).toContain('Kc de referencia (didáctica');
});

test('HALLAZGO [4] — la temperatura no se valida: −100 K se acepta como estado', async ({ page }) => {
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
  await reaccion(page, /Haber-Bosch/).click();
  await page.locator('#conc-N₂').fill('0');
  // A mano, con [N₂] = 0 el cociente diverge: Q = 0,5²/(0 · 3³) → ∞. Hoy el suelo interno de
  // 1e-12 mol/L de calcularQ() asoma en pantalla y lo convierte en 0,25/(1e-12 · 27) =
  // «9.259.259.259,2593», una cifra de aspecto exacto que no es Q sino el epsilon.
  // formatNumber ya sabe pintar «∞» para un valor no finito, así que la vía está abierta.
  // Se dice además POR QUÉ diverge, que es lo que convierte el símbolo en una explicación
  await expect(valorDe(page, 'Q (cociente actual)')).toContainText('∞');
  await expect(valorDe(page, 'Q (cociente actual)')).toContainText('se ha agotado');
});

test('HALLAZGO [6] — los emojis decorativos propios de la app van sin aria-hidden', async ({ page }) => {
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


// ═══════════════════════════════════════════════════════════════════════════
// CASOS PARA CLASE (11/09/2026) — sin navegador, sobre casos.ts
//
// Lo de arriba es el acta del Inspector y NO se toca: es el contrato de la app.
// Lo de aquí abajo prueba el motor de los casos asignables, que corrige respuestas
// de alumnos y por tanto no puede fallar en silencio.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Simulador de Equilibrio Químico — casos para clase (11/09/2026)
 *
 * Es la app con MÁS peso de aula de todo meskeIA: 353 de sus 549 visitas del último mes
 * llegaron dentro de eventos de clase (el 64 %). Cuando un profesor manda «resuelve los
 * casos 3, 7 y 11», la corrección tiene que ser la misma para todo el grupo, y una
 * corrección equivocada no se ve: la app carga igual de bien.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO
 *   Todos calculados a mano desde la definición, NUNCA copiados de lo que devuelve la app.
 *
 *   · Caso 1, Q de la síntesis de amoníaco con [N₂]=1, [H₂]=2, [NH₃]=0,4:
 *       Q = [NH₃]² / ([N₂]·[H₂]³) = 0,16 / (1 · 8) = 0,02
 *   · Caso 2, Q del gas de agua con todo a coeficiente 1:
 *       Q = (1·1) / (0,5·0,5) = 1 / 0,25 = 4
 *   · Caso 3, Δn de 2 SO₂ + O₂ ⇌ 2 SO₃: 2 − 3 = −1
 *   · Caso 4, Q de la esterificación: (1·1) / (1·0,5) = 2
 *   · Caso 5, Q del PCl₅: (0,2·0,1) / 0,5 = 0,04, que es exactamente su Kc
 *   · Caso 6, van 't Hoff sobre el PCl₅ (ΔH = +88 kJ/mol, K₁ = 0,04, 298 K → 350 K):
 *       1/350 − 1/298 = 0,00285714 − 0,00335570 = −0,00049856
 *       ln(K₂/K₁) = −(88000/8,314)·(−0,00049856) = −10584,6·(−0,00049856) = 5,277
 *       K₂ = 0,04 · e^5,277 ≈ 0,04 · 195,8 ≈ 7,83
 *
 *   Y las seis predicciones, derivadas del principio de Le Chatelier, NO de ejecutar la app:
 *       7  añadir N₂ a un equilibrio → se consume avanzando  → DERECHA
 *       8  calentar una exotérmica (el calor es un producto) → IZQUIERDA
 *       9  calentar una endotérmica (el calor es un reactivo)→ DERECHA
 *      10  comprimir con Δn = −1 (menos gas a la derecha)    → DERECHA
 *      11  comprimir con Δn = 0                              → NO SE DESPLAZA
 *      12  catalizador (acelera los dos sentidos por igual)  → NO SE DESPLAZA
 */

const numericos = CASOS.filter((c): c is CasoNumerico => c.tipo === 'numerico');
const predicciones = CASOS.filter((c): c is CasoPrediccion => c.tipo === 'prediccion');

test.describe('Simulador de Equilibrio Químico · casos para clase', () => {
  // ----------------------------------------------------------------
  // Invariante 1 — 12 casos con ids 1..12 sin huecos
  // ----------------------------------------------------------------
  test('hay exactamente 12 casos con ids consecutivos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(numericos).toHaveLength(6);
    expect(predicciones).toHaveLength(6);
  });

  // ----------------------------------------------------------------
  // Invariante 2 — deterministas
  // ----------------------------------------------------------------
  test('dos lecturas dan el mismo enunciado y la misma respuesta', () => {
    const huella = () => CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuestaTexto}`);
    expect(huella()).toEqual(huella());
  });

  // ----------------------------------------------------------------
  // Invariante 3 — la respuesta declarada coincide con recalcularla
  // ----------------------------------------------------------------
  test('recalcular cada caso numérico desde sus datos devuelve la respuesta declarada', () => {
    for (const caso of numericos) {
      const recalculado = resolverCasoNumerico(caso.datos);
      expect(recalculado.ok, `caso ${caso.id}`).toBe(true);
      expect(recalculado.valor, `caso ${caso.id}`).toBeCloseTo(caso.respuesta, 9);
    }
  });

  test('recalcular cada predicción ejecutando el modelo devuelve la dirección declarada', () => {
    for (const caso of predicciones) {
      const simulacion = simularPerturbacion(caso.datos);
      expect(simulacion.ok, `caso ${caso.id}`).toBe(true);
      expect(simulacion.direccion, `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  // ----------------------------------------------------------------
  // Invariante 4 — cada caso está completo
  // ----------------------------------------------------------------
  test('cada caso tiene enunciado, etiqueta no vacía, respuesta y desarrollo', () => {
    for (const caso of CASOS) {
      expect(caso.titulo.length, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(30);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.respuestaTexto.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(3);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.ecuacion.trim(), `caso ${caso.id}`).not.toBe('');
      if (caso.tipo === 'numerico') {
        expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      }
    }
  });

  // ----------------------------------------------------------------
  // Invariante 5 — enunciados universales
  // ----------------------------------------------------------------
  test('ningún enunciado nombra un país ni una ciudad', () => {
    const prohibido =
      /\b(españa|espana|madrid|barcelona|méxico|mexico|colombia|argentina|perú|peru|chile|bogotá|bogota|lima|buenos aires|euros?|pesos?)\b/i;
    for (const caso of CASOS) {
      expect(prohibido.test(caso.titulo), `título del caso ${caso.id}`).toBe(false);
      expect(prohibido.test(caso.enunciado), `enunciado del caso ${caso.id}`).toBe(false);
      for (const paso of caso.pasos) {
        expect(prohibido.test(paso), `paso del caso ${caso.id}`).toBe(false);
      }
    }
  });

  // ----------------------------------------------------------------
  // Invariante 7 — el convenio de la app, fijado a mano
  // ----------------------------------------------------------------
  test('convenio · en Kc solo entran gases y especies en disolución', () => {
    // Haber-Bosch, todo gas: entran las tres especies.
    const haber = REACCIONES.find((r) => r.id === 'haber-bosch')!;
    expect(calcularQ(haber, { 'N₂': 1, 'H₂': 2, 'NH₃': 0.4 })).toBeCloseTo(0.02, 10);
  });

  test('convenio · la esterificación es TODA líquida y por eso sus cuatro especies cuentan', () => {
    const ester = REACCIONES.find((r) => r.id === 'esterificacion')!;
    expect(ester.reactivos.every((e) => e.estado === 'l')).toBe(true);
    expect(ester.productos.every((e) => e.estado === 'l')).toBe(true);
    // (1·1) / (1·0,5) = 2. Si los líquidos no contaran, el cociente daría 1.
    expect(
      calcularQ(ester, { 'CH₃COOH': 1, 'C₂H₅OH': 0.5, 'CH₃COOC₂H₅': 1, 'H₂O': 1 }),
    ).toBeCloseTo(2, 10);
  });

  test('convenio · Δn cuenta SOLO moles de gas', () => {
    expect(deltaN(REACCIONES.find((r) => r.id === 'so3')!)).toBe(-1); // 2 − 3
    expect(deltaN(REACCIONES.find((r) => r.id === 'haber-bosch')!)).toBe(-2); // 2 − 4
    expect(deltaN(REACCIONES.find((r) => r.id === 'pcl5')!)).toBe(1); // 2 − 1
    expect(deltaN(REACCIONES.find((r) => r.id === 'water-gas-shift')!)).toBe(0); // 2 − 2
    // La esterificación no tiene NINGÚN gas, así que su Δn es 0 aunque haya 4 especies.
    expect(deltaN(REACCIONES.find((r) => r.id === 'esterificacion')!)).toBe(0);
  });

  test('convenio · exotérmica ⟺ ΔH < 0, sin excepciones', () => {
    for (const reaccion of REACCIONES) {
      expect(esExotermicaDe(reaccion.deltaH), reaccion.id).toBe(reaccion.deltaH < 0);
    }
  });

  test('convenio · un reactivo agotado hace diverger el cociente, no devuelve un número enorme', () => {
    const haber = REACCIONES.find((r) => r.id === 'haber-bosch')!;
    expect(calcularQ(haber, { 'N₂': 0, 'H₂': 2, 'NH₃': 0.4 })).toBe(Infinity);
  });

  // ----------------------------------------------------------------
  // Los seis valores numéricos, derivados a mano
  // ----------------------------------------------------------------
  test('caso 1 · Q = 0,16 / 8 = 0,02', () => {
    expect(numericos[0].respuesta).toBeCloseTo(0.02, 10);
    expect(numericos[0].respuestaTexto).toBe('0,02');
  });

  test('caso 2 · Q = 1 / 0,25 = 4', () => {
    expect(numericos[1].respuesta).toBeCloseTo(4, 10);
    expect(numericos[1].respuestaTexto).toBe('4');
  });

  test('caso 3 · Δn = 2 − 3 = −1', () => {
    expect(numericos[2].respuesta).toBe(-1);
    expect(numericos[2].respuestaTexto).toBe('-1');
  });

  test('caso 4 · Q = 1 / 0,5 = 2', () => {
    expect(numericos[3].respuesta).toBeCloseTo(2, 10);
  });

  test('caso 5 · Q = 0,02 / 0,5 = 0,04, que es exactamente la Kc de esa reacción', () => {
    expect(numericos[4].respuesta).toBeCloseTo(0.04, 10);
    expect(numericos[4].respuestaTexto).toBe('0,04');
    const pcl5 = REACCIONES.find((r) => r.id === 'pcl5')!;
    expect(numericos[4].respuesta).toBeCloseTo(pcl5.Kc, 10);
  });

  test('caso 6 · van ’t Hoff: 0,04 a 298 K pasa a ≈ 7,83 a 350 K', () => {
    const esperado = 7.83;
    expect(numericos[5].respuesta).toBeGreaterThan(esperado * 0.99);
    expect(numericos[5].respuesta).toBeLessThan(esperado * 1.01);
    expect(numericos[5].requiereRedondeo).toBe(true);
    expect(numericos[5].respuestaTexto).toBe('7,83');
  });

  test('caso 6 · usar R = 8,31 en vez de 8,314 sigue cayendo dentro de la tolerancia', () => {
    // Un alumno que redondea la constante de los gases no puede suspender por eso.
    const conRmenosPreciso = 0.04 * Math.exp(-(88000 / 8.31) * (1 / 350 - 1 / 298));
    expect(comprobarRespuesta(String(conRmenosPreciso).replace('.', ','), numericos[5].respuesta)
      .correcto).toBe(true);
  });

  test('van ’t Hoff sube la K de una endotérmica y baja la de una exotérmica', () => {
    const pcl5 = REACCIONES.find((r) => r.id === 'pcl5')!; // ΔH > 0
    const so3 = REACCIONES.find((r) => r.id === 'so3')!; // ΔH < 0
    expect(nuevoKcConTemperatura(pcl5.Kc, pcl5.deltaH, T_REFERENCIA_K, 500)).toBeGreaterThan(
      pcl5.Kc,
    );
    expect(nuevoKcConTemperatura(so3.Kc, so3.deltaH, T_REFERENCIA_K, 500)).toBeLessThan(so3.Kc);
    // Sin cambio de temperatura, la constante es exactamente la misma.
    expect(nuevoKcConTemperatura(so3.Kc, so3.deltaH, 298, 298)).toBe(so3.Kc);
  });

  // ----------------------------------------------------------------
  // Las seis predicciones, una por mecanismo
  //
  // Es LA invariante del tipo C: la opción correcta sale de ejecutar el
  // modelo, con un caso a mano por cada mecanismo.
  // ----------------------------------------------------------------
  test('caso 7 · añadir un reactivo desplaza hacia la derecha', () => {
    expect(predicciones[0].respuesta).toBe('derecha');
    const simulacion = simularPerturbacion({
      perturbacion: 'anadir-especie',
      reaccionId: 'haber-bosch',
      especie: 'N₂',
      cantidad: 0.5,
    });
    expect(simulacion.direccion).toBe('derecha');
    expect(simulacion.avance).toBeGreaterThan(0);
    // Y se forma más amoníaco del que había justo tras la inyección.
    expect(simulacion.despues['NH₃']).toBeGreaterThan(simulacion.perturbado['NH₃']);
  });

  test('caso 7 bis · QUITAR ese mismo reactivo desplaza hacia el otro lado', () => {
    // La simetría es lo que demuestra que el modelo responde al cambio, no al enunciado.
    const simulacion = simularPerturbacion({
      perturbacion: 'quitar-especie',
      reaccionId: 'haber-bosch',
      especie: 'N₂',
      cantidad: 0.5,
    });
    expect(simulacion.direccion).toBe('izquierda');
    expect(simulacion.avance).toBeLessThan(0);
  });

  test('caso 8 · calentar una EXOTÉRMICA desplaza hacia la izquierda', () => {
    expect(predicciones[1].respuesta).toBe('izquierda');
    const so3 = REACCIONES.find((r) => r.id === 'so3')!;
    expect(so3.deltaH).toBeLessThan(0);
    const simulacion = simularPerturbacion({
      perturbacion: 'cambiar-temperatura',
      reaccionId: 'so3',
      temperaturaFinalK: 500,
    });
    expect(simulacion.direccion).toBe('izquierda');
    expect(simulacion.KcEfectiva).toBeLessThan(so3.Kc);
  });

  test('caso 9 · calentar una ENDOTÉRMICA desplaza hacia la derecha', () => {
    expect(predicciones[2].respuesta).toBe('derecha');
    const pcl5 = REACCIONES.find((r) => r.id === 'pcl5')!;
    expect(pcl5.deltaH).toBeGreaterThan(0);
    const simulacion = simularPerturbacion({
      perturbacion: 'cambiar-temperatura',
      reaccionId: 'pcl5',
      temperaturaFinalK: 500,
    });
    expect(simulacion.direccion).toBe('derecha');
    expect(simulacion.KcEfectiva).toBeGreaterThan(pcl5.Kc);
  });

  test('casos 8 y 9 · la ÚNICA diferencia entre ambos es el signo de ΔH', () => {
    // Misma perturbación, misma temperatura final, direcciones opuestas.
    expect(predicciones[1].datos.perturbacion).toBe(predicciones[2].datos.perturbacion);
    expect(predicciones[1].datos.temperaturaFinalK).toBe(predicciones[2].datos.temperaturaFinalK);
    expect(predicciones[1].respuesta).not.toBe(predicciones[2].respuesta);
  });

  test('caso 10 · comprimir con Δn negativo desplaza hacia la derecha', () => {
    expect(predicciones[3].respuesta).toBe('derecha');
    const no2 = REACCIONES.find((r) => r.id === 'no2-n2o4')!;
    expect(deltaN(no2)).toBe(-1);
    const simulacion = simularPerturbacion({
      perturbacion: 'cambiar-volumen',
      reaccionId: 'no2-n2o4',
      factorVolumen: 0.5,
    });
    expect(simulacion.direccion).toBe('derecha');
    // Reducir el volumen a la mitad duplica las concentraciones de partida.
    expect(simulacion.perturbado['NO₂']).toBeCloseTo(simulacion.antes['NO₂'] * 2, 8);
  });

  test('caso 11 · comprimir con Δn = 0 NO desplaza nada', () => {
    expect(predicciones[4].respuesta).toBe('equilibrio');
    const wgs = REACCIONES.find((r) => r.id === 'water-gas-shift')!;
    expect(deltaN(wgs)).toBe(0);
    const simulacion = simularPerturbacion({
      perturbacion: 'cambiar-volumen',
      reaccionId: 'water-gas-shift',
      factorVolumen: 0.5,
    });
    expect(simulacion.direccion).toBe('equilibrio');
    // Y esto es lo que lo explica: al escalar todo por igual, Q no se mueve.
    const qAntes = calcularQ(wgs, simulacion.antes);
    const qPerturbado = calcularQ(wgs, simulacion.perturbado);
    expect(qPerturbado).toBeCloseTo(qAntes, 8);
  });

  test('caso 12 · un catalizador NO desplaza el equilibrio', () => {
    expect(predicciones[5].respuesta).toBe('equilibrio');
    const simulacion = simularPerturbacion({
      perturbacion: 'catalizador',
      reaccionId: 'haber-bosch',
    });
    expect(simulacion.direccion).toBe('equilibrio');
    const haber = REACCIONES.find((r) => r.id === 'haber-bosch')!;
    expect(simulacion.KcEfectiva).toBe(haber.Kc);
  });

  test('el umbral de avance no se traga un desplazamiento real ni inventa uno falso', () => {
    // El catalizador y la compresión con Δn = 0 dejan un ξ residual del redondeo a 4
    // decimales de `equilibrioDePartida`: tiene que quedar POR DEBAJO del umbral...
    for (const id of ['haber-bosch', 'so3', 'pcl5', 'water-gas-shift', 'no2-n2o4']) {
      const simulacion = simularPerturbacion({ perturbacion: 'catalizador', reaccionId: id });
      expect(simulacion.direccion, `catalizador en ${id}`).toBe('equilibrio');
    }
    // ...y el desplazamiento real de añadir reactivo, muy POR ENCIMA.
    const real = simularPerturbacion({
      perturbacion: 'anadir-especie',
      reaccionId: 'haber-bosch',
      especie: 'N₂',
      cantidad: 0.5,
    });
    expect(Math.abs(real.avance)).toBeGreaterThan(1e-3);
  });

  // ----------------------------------------------------------------
  // El equilibrio de partida ES un equilibrio
  //
  // Si no lo fuera, TODAS las predicciones medirían el reajuste del
  // punto de partida en vez de la perturbación que se les pide.
  // ----------------------------------------------------------------
  test('el estado de partida de cada reacción cumple Q ≈ Kc', () => {
    for (const reaccion of REACCIONES) {
      const equilibrio = equilibrioDePartida(reaccion);
      const q = calcularQ(reaccion, equilibrio);
      expect(q / reaccion.Kc, `${reaccion.id}: Q = ${q}, Kc = ${reaccion.Kc}`).toBeCloseTo(1, 2);
    }
  });

  /**
   * REGRESIÓN (11/09/2026) · la zona muda de las reacciones muy exotérmicas.
   *
   * Con el proceso de contacto, a partir de unos 470 K la Kc cae por debajo de 1e-13 y
   * `nuevoEquilibrio` dejaba de mover el sistema: devolvía las concentraciones intactas. En
   * pantalla eso era un deslizador de temperatura que a partir de cierto punto no hacía
   * nada, justo cuando enseña la lección (una exotérmica se descompone al calentar). Lo
   * destapó el caso 8 de esta misma tanda, que preguntaba a 500 K.
   *
   * La prueba no es que a 500 K se desplace, sino que la serie sea CONTINUA: si a 450 K el
   * SO₃ casi ha desaparecido, a 500 K no puede volver a aparecer entero.
   */
  test('regresión · calentar una exotérmica sigue desplazando el equilibrio con Kc diminutas', () => {
    const so3 = REACCIONES.find((r) => r.id === 'so3')!;
    const partida = equilibrioDePartida(so3);

    let anterior = partida['SO₃'];
    for (const T of [320, 350, 400, 450, 500, 700, 1200, 2000]) {
      const simulacion = simularPerturbacion({
        perturbacion: 'cambiar-temperatura',
        reaccionId: 'so3',
        temperaturaFinalK: T,
      });
      expect(simulacion.ok, `T = ${T} K`).toBe(true);
      expect(simulacion.direccion, `T = ${T} K`).toBe('izquierda');
      // Monótona: a más temperatura, menos SO₃. Nunca vuelve a subir.
      expect(simulacion.despues['SO₃'], `T = ${T} K`).toBeLessThanOrEqual(anterior + 1e-9);
      anterior = simulacion.despues['SO₃'];
    }
    // Y al final del recorrido el producto está prácticamente agotado, no intacto.
    expect(anterior).toBeLessThan(partida['SO₃'] / 1000);
  });

  test('regresión · sin raíz interior, el sistema va al extremo, no se queda quieto', () => {
    const so3 = REACCIONES.find((r) => r.id === 'so3')!;
    const partida = equilibrioDePartida(so3);
    // Una Kc absurdamente pequeña: la reacción es completa hacia la izquierda.
    const casiCero = nuevoEquilibrio(so3, partida, 1e-30);
    expect(casiCero['SO₃']).toBeLessThan(partida['SO₃'] / 1000);
    expect(casiCero['SO₂']).toBeGreaterThan(partida['SO₂']);
    // Y una absurdamente grande: completa hacia la derecha.
    const casiInfinito = nuevoEquilibrio(so3, partida, 1e30);
    expect(casiInfinito['SO₃']).toBeGreaterThan(partida['SO₃']);
    expect(casiInfinito['SO₂']).toBeLessThan(partida['SO₂']);
  });

  test('nuevoEquilibrio deja el sistema en equilibrio, venga de donde venga', () => {
    const haber = REACCIONES.find((r) => r.id === 'haber-bosch')!;
    const desdeLejos = nuevoEquilibrio(haber, { 'N₂': 2, 'H₂': 4, 'NH₃': 0.1 }, haber.Kc);
    expect(calcularQ(haber, desdeLejos) / haber.Kc).toBeCloseTo(1, 2);
  });

  // ----------------------------------------------------------------
  // Comprobación de respuestas
  // ----------------------------------------------------------------
  test('la tolerancia es el mayor entre 0,01 y el 1 %', () => {
    expect(toleranciaDe(0.02)).toBe(0.01); // el 1 % sería 0,0002
    expect(toleranciaDe(7.83)).toBeCloseTo(0.0783, 6);
    expect(toleranciaDe(-1)).toBe(0.01);
  });

  test('la coma decimal española se acepta, y «0,02» no se lee como 0', () => {
    // Es lo que pasaría con parseFloat: se queda con el prefijo y tira el resto.
    expect(comprobarRespuesta('0,02', 0.02).correcto).toBe(true);
    expect(comprobarRespuesta('0.02', 0.02).correcto).toBe(true);
    expect(comprobarRespuesta('0,021', 0.02).correcto).toBe(true); // dentro de 0,01
    expect(comprobarRespuesta('0,5', 0.02).correcto).toBe(false);
  });

  test('una respuesta vacía o no numérica se distingue de un fallo', () => {
    expect(comprobarRespuesta('', 4).motivo).toBe('vacia');
    expect(comprobarRespuesta('   ', 4).motivo).toBe('vacia');
    expect(comprobarRespuesta('cuatro', 4).motivo).toBe('no-numerico');
    expect(comprobarRespuesta('12abc', 4).motivo).toBe('no-numerico');
    expect(comprobarRespuesta('9', 4).motivo).toBe('fallo');
  });

  test('una predicción sin elegir no cuenta como fallo cualquiera', () => {
    expect(comprobarPrediccion(null, 'derecha')).toEqual({ correcto: false, motivo: 'vacia' });
    expect(comprobarPrediccion('derecha', 'derecha').correcto).toBe(true);
    expect(comprobarPrediccion('izquierda', 'derecha').correcto).toBe(false);
  });

  test('las tres opciones son siempre las mismas y en el mismo orden', () => {
    expect(OPCIONES_DIRECCION).toEqual(['derecha', 'izquierda', 'equilibrio']);
    for (const caso of predicciones) {
      expect(caso.opciones, `caso ${caso.id}`).toEqual(OPCIONES_DIRECCION);
    }
  });

  // ----------------------------------------------------------------
  // Nada lanza
  // ----------------------------------------------------------------
  test('los datos incompletos o imposibles salen como no-ok, nunca como excepción', () => {
    expect(resolverCasoNumerico({ magnitud: 'cociente-Q', reaccionId: 'inventada' }).ok).toBe(false);
    expect(resolverCasoNumerico({ magnitud: 'cociente-Q', reaccionId: 'pcl5' }).ok).toBe(false);
    expect(
      resolverCasoNumerico({ magnitud: 'Kc-a-temperatura', reaccionId: 'pcl5' }).ok,
    ).toBe(false);
    expect(simularPerturbacion({ perturbacion: 'catalizador', reaccionId: 'inventada' }).ok).toBe(
      false,
    );
    expect(
      simularPerturbacion({ perturbacion: 'anadir-especie', reaccionId: 'pcl5', especie: 'Xx', cantidad: 1 })
        .ok,
    ).toBe(false);
    // Retirar más de lo que hay agotaría la especie: no-ok, no una división entre cero.
    expect(
      simularPerturbacion({
        perturbacion: 'quitar-especie',
        reaccionId: 'pcl5',
        especie: 'PCl₅',
        cantidad: 99,
      }).ok,
    ).toBe(false);
    // Una temperatura fuera del rango del simulador tampoco cuela.
    expect(
      simularPerturbacion({
        perturbacion: 'cambiar-temperatura',
        reaccionId: 'pcl5',
        temperaturaFinalK: 5000,
      }).ok,
    ).toBe(false);
  });

  // ----------------------------------------------------------------
  // Mezcla de categorías
  // ----------------------------------------------------------------
  test('hay casos de cálculo directo y casos de situación real', () => {
    const abstractos = CASOS.filter((c) => c.categoria === 'abstracto').length;
    const aplicados = CASOS.filter((c) => c.categoria === 'aplicado').length;
    expect(abstractos).toBeGreaterThanOrEqual(4);
    expect(aplicados).toBeGreaterThanOrEqual(4);
    expect(abstractos + aplicados).toBe(12);
  });
});
