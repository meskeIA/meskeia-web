import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * Simulador Masa-Resorte (MAS) — inspección del 20/09/2026
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Simulador Masa-Resorte» y el subtítulo «Movimiento Armónico Simple con
 *   amortiguamiento viscoso — observa x(t), energías y período en tiempo real». Cuatro
 *   deslizadores (m, k, A, γ), seis tarjetas de resultado (ω₀, T, f, x, v, a) y tres barras
 *   de energía (E_k, E_p, E total). Su caja de fórmulas publica:
 *       ω₀ = √(k/m)   ·   T = 2π/ω₀   ·   x(t) = A·cos(ω₀t)·e^(−γt/2m)   ·   E_total = ½·k·A²
 *   NO promete oscilación forzada ni resonancia, y NO es un muelle vertical con gravedad:
 *   la línea de equilibrio del lienzo es la posición de reposo, así que g no entra.
 *
 * LA VERDAD FÍSICA, CALCULADA A MANO ANTES DE ABRIR EL NAVEGADOR
 *   Sin amortiguamiento (γ = 0), con x(0) = A y v(0) = 0:
 *       ω₀ = √(k/m)      T = 2π/ω₀      f = 1/T      x(t) = A·cos(ω₀t)
 *       E = ½kA² constante      v_max = A·ω₀
 *   Con m = 1,00 kg, k = 10 N/m, A = 0,20 m:
 *       ω₀   = √10          = 3,162278 rad/s   → en pantalla «3,162 rad/s»
 *       T    = 2π/3,162278  = 1,986918 s       → en pantalla «1,987 s»
 *       f    = 1/1,986918   = 0,503292 Hz      → en pantalla «0,503 Hz»
 *       E    = ½·10·0,20²   = 0,200000 J       → en pantalla «0,200 J»
 *       v_max= 0,20·3,162278= 0,632456 m/s
 *
 *   ⚠️ CON amortiguamiento viscoso la ecuación es m·ẍ + γ·ẋ + k·x = 0, cuya solución
 *   subcrítica NO oscila a ω₀ sino a la frecuencia amortiguada
 *       ω_d = √(ω₀² − (γ/2m)²)        con β ≡ γ/(2m)
 *       x(t) = A·e^(−βt)·[cos(ω_d·t) + (β/ω_d)·sen(ω_d·t)]      (para x(0)=A, v(0)=0)
 *   y el umbral es γ_c = 2√(k·m):
 *       γ = γ_c (CRÍTICO)      → ω_d = 0, x(t) = A(1+βt)e^(−βt) ≥ 0 SIEMPRE: no cruza el
 *                                equilibrio ni una vez, y no hay período que publicar.
 *       γ > γ_c (SOBREAMORT.)  → ω₀² − β² < 0, dos exponenciales reales, tampoco oscila.
 *   Esto no es una sutileza de examen: es lo que la PROPIA app enseña en «Errores frecuentes»
 *   («la frecuencia de oscilación es ω_d = √(ω₀² − (γ/2m)²), NO ω₀»), en el PASO 4 y en su FAQ
 *   («γ > γ_c: sobreamortiguado, vuelve lentamente SIN oscilar»). Su motor hacía justo lo
 *   contrario —`calcPosicion` era `A·cos(ω₀·t)·exp(−γt/2m)`, con ω₀ en el coseno— hasta la
 *   reparación del 20/09/2026, que lo mudó a `app/simulador-mas-resorte/motor.ts` con los
 *   tres regímenes y sus casos unitarios en `tests/mas-resorte-motor.spec.ts`.
 *
 *   Números de contraste calculados a mano:
 *     · m=1, k=10, γ=2  → γ_c = 6,324555, subcrítico. β = 1, ω_d = √(10−1) = 3,000000 rad/s
 *       EXACTO → T_d = 2π/3 = 2,094395 s, frente a los 1,986918 s que la app publica y anima
 *       (−5,13 %).
 *     · m=1, k=1, A=1, γ=2 → γ_c = 2√1 = 2,000000: amortiguamiento CRÍTICO exacto.
 *       Real: x(t) = (1+t)·e^(−t).  x(π/2) = 0,534416 m · x(π) = 0,178974 m, siempre
 *       positiva. La app daba x(t) = cos(t)·e^(−t), que cruzaba a negativo en t = π/2 y
 *       bajaba hasta −0,067 m (mínimo en t = 3π/4 = 2,356 s).
 *     · m=0,1, k=1, γ=2 → γ_c = 0,632456: γ es 3,16 veces el crítico, sobreamortiguado puro.
 *       ω₀² − β² = 10 − 100 = −90 → ω_d no existe. La app publicaba T = 1,987 s.
 *     · ENERGÍA: el modelo viejo implicaba v(0) = −β·A ≠ 0 (derivaba el coseno amortiguado),
 *       así que con m=1, k=1, A=1, γ=2 arrancaba con E(0) = ½kA² + ½m(βA)² = 0,5 + 0,5 =
 *       1,000000 J, el DOBLE de la ½kA² = 0,500 J que la propia app publica como energía
 *       total. Un oscilador amortiguado solo puede PERDER energía.
 *
 * LO QUE ESTOS TRES CASOS FIJAN
 *   1) normal (γ = 0): el núcleo no amortiguado es exacto — cifras, energía y ritmo de la
 *      animación coinciden entre sí y con la fórmula. Esto debe seguir así.
 *   2) límite (γ = γ_c y γ > γ_c, más un subcrítico): cinco comprobaciones que documentaban
 *      el defecto y que se invirtieron al repararlo. Ahora exigen el número correcto, que ya
 *      estaba escrito al lado de cada una.
 *   3) rechazo (masa 0, k negativa, amplitud negativa): los deslizadores capan al mínimo y
 *      no sale ni un NaN ni un infinito.
 *
 * REINSPECCIÓN DEL 25/09/2026 (tras b3ea39a4 y f30606f6)
 *   Convención de la app: su «γ» es el coeficiente viscoso b en N·s/m (m·ẍ + γ·ẋ + k·x = 0),
 *   y la tasa de decaimiento es β = γ/(2m). Donde un libro escribe A·e^(−γt) con γ < ω₀, aquí
 *   es A·e^(−βt) con β < ω₀. No integra numéricamente: `motor.ts` evalúa la solución CERRADA
 *   de cada régimen en el instante t, así que sin amortiguamiento no puede haber deriva de
 *   energía, y el único límite de fidelidad es el muestreo por frames (dt ≤ 0,05 s por tope).
 *   Los casos nuevos leen además la GRÁFICA x(t) interceptando las llamadas de dibujo del
 *   lienzo (sin tocar el estado de React): sus marcas de tiempo dan la escala, y con ella se
 *   comprueba que el eje que cerró el hallazgo 970 dice la verdad.
 *   Casos 4 a 7: regresiones de 966-970 y casos nuevos, resueltos a mano antes de ejecutar.
 *   Caso 8: hallazgos abiertos de esta reinspección, con test.fail().
 */

/** El valor de una tarjeta o de una barra, localizado por su etiqueta (las clases van con hash). */
async function leerFila(page: Page, etiqueta: string): Promise<string> {
  return page.evaluate((lab) => {
    for (const d of document.querySelectorAll('div')) {
      const sp = d.querySelectorAll(':scope > span');
      if (sp.length === 2 && sp[0].textContent?.trim() === lab) {
        return sp[1].textContent?.trim() ?? '';
      }
    }
    return '';
  }, etiqueta);
}

/** «−0,067 m» → −0,067 · «≈0 J» → 0 (así imprime formatNumber lo menor que 0,0001). */
function aNumero(texto: string): number {
  const limpio = texto.replace(/[^\d,.\-−≈]/g, '');
  if (limpio.includes('≈')) return 0;
  return parseFloat(limpio.replace(/\./g, '').replace(',', '.').replace('−', '-'));
}

/** Muestrea cada frame el valor de varias tarjetas. Devuelve [t_ms, ...valores] por frame. */
async function muestrear(
  page: Page,
  duracionMs: number,
  etiquetas: readonly string[],
): Promise<number[][]> {
  return page.evaluate(
    ({ dur, labs }) =>
      new Promise<number[][]>((resolver) => {
        const aNum = (txt: string): number => {
          const t = txt.replace(/[^\d,.\-−≈]/g, '');
          if (t.includes('≈')) return 0;
          return parseFloat(t.replace(/\./g, '').replace(',', '.').replace('−', '-'));
        };
        const fila = (lab: string): number => {
          for (const d of document.querySelectorAll('div')) {
            const sp = d.querySelectorAll(':scope > span');
            if (sp.length === 2 && sp[0].textContent?.trim() === lab) {
              return aNum(sp[1].textContent ?? '');
            }
          }
          return NaN;
        };
        const salida: number[][] = [];
        const inicio = performance.now();
        const paso = (): void => {
          const t = performance.now() - inicio;
          salida.push([t, ...labs.map(fila)]);
          if (t < dur) requestAnimationFrame(paso);
          else resolver(salida);
        };
        requestAnimationFrame(paso);
      }),
    { dur: duracionMs, labs: etiquetas as string[] },
  );
}

/**
 * Período que de verdad ANIMA la app, medido por los pasos por x = 0 de la elongación que
 * muestra. Entre dos cruces consecutivos (en cualquier sentido) va MEDIO período.
 */
async function medirPeriodoAnimado(page: Page, duracionMs: number): Promise<number> {
  const muestras = await muestrear(page, duracionMs, ['Posición x']);
  const cruces: number[] = [];
  for (let i = 1; i < muestras.length; i++) {
    const [t0, x0] = muestras[i - 1];
    const [t1, x1] = muestras[i];
    if (!isFinite(x0) || !isFinite(x1)) continue;
    if ((x0 > 0 && x1 <= 0) || (x0 < 0 && x1 >= 0)) {
      cruces.push(t0 + (x0 / (x0 - x1)) * (t1 - t0)); // interpolación lineal
    }
  }
  expect(cruces.length, 'la animación no llegó a cruzar el cero: ¿está pausada?').toBeGreaterThan(2);
  const periodos = cruces.slice(1).map((c, i) => (2 * (c - cruces[i])) / 1000);
  return periodos.reduce((a, b) => a + b, 0) / periodos.length;
}

const SLIDERS = ['#slider-masa', '#slider-k', '#slider-A', '#slider-gamma'] as const;

test.beforeEach(async ({ page }) => {
  await page.goto('/simulador-mas-resorte/');
  await esperarHidratacion(page, SLIDERS);
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 1 — normal: m = 1,00 kg, k = 10 N/m, A = 0,20 m, γ = 0', () => {
  /** La masa arranca ya en 1,0 kg y γ en 0: sembrarlos no movería nada y no probaría nada. */
  async function ponerCaso1(page: Page): Promise<void> {
    await sembrarValor(page, '#slider-k', 10); // arranca en 20
    await sembrarValor(page, '#slider-A', 0.2); // arranca en 0,30
  }

  test('ω₀, T y f son los de √(k/m)', async ({ page }) => {
    await ponerCaso1(page);

    // ω₀ = √(10/1) = 3,162278 rad/s
    await expect.poll(() => leerFila(page, 'ω₀')).toBe('3,162 rad/s');
    // T = 2π/ω₀ = 1,986918 s
    await expect.poll(() => leerFila(page, 'Período T')).toBe('1,987 s');
    // f = 1/T = 0,503292 Hz
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('0,503 Hz');
  });

  test('la amplitud no entra en el período, pero sí en la energía (E ∝ A²)', async ({ page }) => {
    await ponerCaso1(page);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('1,987 s');

    // Isocronismo: ẍ = −(k/m)·x es lineal, así que doblar A no toca T.
    await sembrarValor(page, '#slider-A', 0.4);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('1,987 s');
    await expect.poll(() => leerFila(page, 'ω₀')).toBe('3,162 rad/s');
  });

  test('en pausa, E_k + E_p reconstruye la E total = ½kA² = 0,200 J', async ({ page }) => {
    await ponerCaso1(page);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('1,987 s');

    // Con la animación corriendo las cifras cambian entre lectura y lectura: se pausa.
    await page.getByRole('button', { name: 'Pausar simulación' }).click();
    await expect(page.getByRole('button', { name: 'Reanudar simulación' })).toBeVisible();

    const ek = aNumero(await leerFila(page, 'Cinética E_k'));
    const ep = aNumero(await leerFila(page, 'Potencial E_p'));
    const et = aNumero(await leerFila(page, 'Total E'));
    const x = aNumero(await leerFila(page, 'Posición x'));
    const v = aNumero(await leerFila(page, 'Velocidad v'));

    // E = ½·10·0,20² = 0,200000 J, y se conserva porque γ = 0.
    expect(et).toBeCloseTo(0.2, 3);
    // Redondeo a 3 decimales en cada sumando: 1 milijulio de holgura sobra.
    expect(ek + ep).toBeGreaterThan(0.198);
    expect(ek + ep).toBeLessThan(0.202);
    // ½·m·v² y ½·k·x² son esas dos cifras, cada una calculada desde su variable.
    expect(0.5 * 1 * v * v).toBeCloseTo(ek, 2);
    expect(0.5 * 10 * x * x).toBeCloseTo(ep, 2);
    // Cotas del MAS: |x| ≤ A = 0,20 m y |v| ≤ A·ω₀ = 0,632456 m/s.
    expect(Math.abs(x)).toBeLessThanOrEqual(0.2);
    expect(Math.abs(v)).toBeLessThanOrEqual(0.6325);
  });

  test('la animación oscila al período que publica: 1,987 s', async ({ page }) => {
    test.setTimeout(45000); // hay que dejar oscilar el resorte unos segundos

    await ponerCaso1(page);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('1,987 s');
    await page.getByRole('button', { name: 'Reiniciar simulación' }).click();

    // T = 2π·√(m/k) = 1,986918 s. Medido por pasos por cero: 1,9867 s.
    const animado = await medirPeriodoAnimado(page, 6500);
    expect(animado).toBeGreaterThan(1.94);
    expect(animado).toBeLessThan(2.04);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 2 — límite: γ en el crítico γ_c = 2√(k·m) y más allá', () => {
  /** m = 1 kg, k = 1 N/m, A = 1,00 m, γ = 2 → γ_c = 2√(1·1) = 2,000000: CRÍTICO exacto. */
  async function ponerCritico(page: Page): Promise<void> {
    await sembrarValor(page, '#slider-k', 1); // arranca en 20
    await sembrarValor(page, '#slider-A', 1); // arranca en 0,30
    await sembrarValor(page, '#slider-gamma', 2); // arranca en 0
  }

  test('con γ = γ_c la masa NO cruza el equilibrio', async ({ page }) => {
    test.setTimeout(45000);

    await ponerCritico(page);
    await expect.poll(() => leerFila(page, 'ω₀')).toBe('1,000 rad/s'); // √(1/1)
    await expect.poll(() => leerFila(page, 'Régimen')).toBe('Amortiguamiento crítico');
    await page.getByRole('button', { name: 'Reiniciar simulación' }).click();

    const muestras = await muestrear(page, 5000, ['Posición x']);
    const minimo = Math.min(...muestras.map((m) => m[1]).filter((n) => isFinite(n)));

    // VERDAD FÍSICA: en el crítico x(t) = A(1+βt)e^(−βt) = (1+t)e^(−t) ≥ 0 SIEMPRE.
    //   x(π/2) = 0,534416 m · x(π) = 0,178974 m · mínimo = 0.
    // Antes el motor usaba x(t) = cos(t)·e^(−t), que cruzaba a negativo en t = π/2 y tocaba
    // −0,067 m en t = 3π/4. Una décima de milímetro de margen para el redondeo de pantalla.
    expect(minimo).toBeGreaterThanOrEqual(-0.0005);
  });

  test('con γ = γ_c no se publica ningún período: el sistema no oscila', async ({ page }) => {
    await ponerCritico(page);

    // ω₀ = 1 rad/s, pero β = γ/2m = 1 → ω_d = √(1 − 1) = 0: NO hay período.
    // La app publicaba T = 2π/ω₀ = 6,283 s y f = 0,159 Hz como si no hubiera γ.
    await expect.poll(() => leerFila(page, 'Período T')).toBe('no oscila');
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('no oscila');
    await expect.poll(() => leerFila(page, 'ω amortiguada')).toBe('no oscila');
  });

  test('sobreamortiguado (γ = 3,16·γ_c): tampoco hay período', async ({ page }) => {
    await sembrarValor(page, '#slider-k', 1);
    await sembrarValor(page, '#slider-gamma', 2);
    await sembrarValor(page, '#slider-masa', 0.1); // arranca en 1,0

    // γ_c = 2√(1·0,1) = 0,632456 → γ = 2 es 3,16 veces el crítico.
    // β = γ/2m = 10 s⁻¹ y ω₀ = √(1/0,1) = 3,162278 rad/s → ω₀² − β² = −90: ω_d ni existe.
    // La FAQ de la propia app dice que aquí «vuelve lentamente sin oscilar».
    await expect.poll(() => leerFila(page, 'ω₀')).toBe('3,162 rad/s');
    await expect.poll(() => leerFila(page, 'Régimen')).toBe('Sobreamortiguado');
    await expect.poll(() => leerFila(page, 'Período T')).toBe('no oscila');
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('no oscila');
  });

  test('subcrítico: anima a ω_d y no a ω₀ — 2,094 s, no 1,987 s', async ({ page }) => {
    test.setTimeout(45000);

    await sembrarValor(page, '#slider-k', 10);
    await sembrarValor(page, '#slider-A', 1);
    await sembrarValor(page, '#slider-gamma', 2);

    // m=1, k=10, γ=2 → γ_c = 2√10 = 6,324555: subcrítico de verdad, aquí SÍ oscila.
    //   β = γ/2m = 1 ;  ω_d = √(ω₀² − β²) = √(10 − 1) = 3,000000 rad/s EXACTO
    //   T_d = 2π/3 = 2,094395 s      ← lo correcto
    //   T₀  = 2π/√10 = 1,986918 s    ← lo que publicaba y animaba la app (−5,13 %)
    await expect.poll(() => leerFila(page, 'Régimen')).toBe('Subamortiguado');
    await expect.poll(() => leerFila(page, 'ω amortiguada')).toBe('3,000 rad/s');
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,094 s');
    await page.getByRole('button', { name: 'Reiniciar simulación' }).click();

    const animado = await medirPeriodoAnimado(page, 4500);
    // La banda excluye 1,9869 s por un margen amplio: lo que se mide es el nuevo ritmo.
    expect(animado).toBeGreaterThan(2.04);
    expect(animado).toBeLessThan(2.15);
  });

  test('la energía arranca en ½kA² y nunca la supera', async ({ page }) => {
    await ponerCritico(page); // m=1, k=1, A=1, γ=2 → ½kA² = 0,500 J

    await page.getByRole('button', { name: 'Pausar simulación' }).click();
    await page.getByRole('button', { name: 'Reiniciar simulación' }).click();

    // En t = 0 la app se declara en reposo en el extremo: v = 0 y toda la energía potencial.
    await expect.poll(() => leerFila(page, 'Velocidad v')).toBe('0,000 m/s');
    await expect.poll(() => leerFila(page, 'Total E')).toBe('0,500 J');

    await page.getByRole('button', { name: 'Reanudar simulación' }).click();
    const muestras = await muestrear(page, 1200, ['Velocidad v', 'Total E']);
    const vMax = Math.max(...muestras.map((m) => Math.abs(m[1])).filter((n) => isFinite(n)));
    const eMax = Math.max(...muestras.map((m) => m[2]).filter((n) => isFinite(n)));

    // Derivar A·cos(ω₀t)·e^(−βt) daba v(0) = −β·A = −1,000 m/s, o sea energía cinética que
    // nadie puso: ½kA² + ½m(βA)² = 1,000 J, el DOBLE del techo que la propia caja de
    // fórmulas publica. Con x(t) = A(1+βt)e^(−βt) la masa sale en reposo y solo pierde.
    expect(vMax).toBeLessThan(0.4); // el máximo teórico de |v| es A·β/e = 0,368 m/s
    expect(eMax).toBeLessThanOrEqual(0.501); // ½kA² = 0,500 J es el techo físico
  });
});

test.describe('Caso 3 — rechazo: masa 0, constante negativa, amplitud negativa', () => {
  test('los deslizadores capan al mínimo y la física sigue siendo la de esos mínimos', async ({
    page,
  }) => {
    // Cada control parte de un valor distinto del mínimo, así que el capado se ve de verdad.
    expect(await sembrarValorAcotado(page, '#slider-masa', 0)).toBe('0.1'); // min 0,1 kg
    expect(await sembrarValorAcotado(page, '#slider-k', -50)).toBe('1'); // min 1 N/m
    expect(await sembrarValorAcotado(page, '#slider-A', -1)).toBe('0.05'); // min 0,05 m

    // Lo que ve el usuario en las etiquetas accesibles, ya capado.
    await expect(page.locator('#slider-masa')).toHaveAttribute('aria-label', 'Masa: 0,1 kg');
    await expect(page.locator('#slider-k')).toHaveAttribute(
      'aria-label',
      'Constante del resorte: 1 N/m',
    );
    await expect(page.locator('#slider-A')).toHaveAttribute('aria-label', 'Amplitud: 0,05 m');

    // ω₀ = √(1/0,1) = 3,162278 rad/s · T = 1,986918 s · f = 0,503292 Hz
    await expect.poll(() => leerFila(page, 'ω₀')).toBe('3,162 rad/s');
    await expect.poll(() => leerFila(page, 'Período T')).toBe('1,987 s');
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('0,503 Hz');
  });

  test('ninguna cifra sale como NaN ni infinita en el mínimo de los tres controles', async ({
    page,
  }) => {
    await sembrarValorAcotado(page, '#slider-masa', 0);
    await sembrarValorAcotado(page, '#slider-k', -50);
    await sembrarValorAcotado(page, '#slider-A', -1);
    await expect.poll(() => leerFila(page, 'ω₀')).toBe('3,162 rad/s');

    // Las energías evolucionan mientras la animación corre, así que leerlas en un instante
    // cualquiera da un valor distinto en cada ejecución. Se pausa y se reinicia para medirlas
    // en t = 0, igual que hace el caso «en pausa, E_k + E_p reconstruye la E total».
    await page.getByRole('button', { name: 'Pausar simulación' }).click();
    await page.getByRole('button', { name: 'Reiniciar simulación' }).click();

    // formatNumber imprime «No definido» ante un NaN y «∞» / «-∞» ante un infinito.
    for (const etiqueta of [
      'ω₀',
      'Período T',
      'Frecuencia f',
      'Posición x',
      'Velocidad v',
      'Aceleración a',
      'Cinética E_k',
      'Potencial E_p',
      'Total E',
    ]) {
      const texto = await leerFila(page, etiqueta);
      expect(texto, `«${etiqueta}» no debe salir indefinida`).not.toMatch(
        /No definido|NaN|∞|Infinity/,
      );
      expect(texto.length, `«${etiqueta}» no apareció en pantalla`).toBeGreaterThan(0);
    }

    // En t = 0 y en pausa, E = ½·k·A² = ½·1·0,05² = 0,00125 J → con 3 decimales, «0,001 J».
    // Y ya se sostiene también con la animación corriendo: el motor arranca en reposo en el
    // extremo, así que la energía solo puede bajar desde ese techo.
    expect(aNumero(await leerFila(page, 'Total E'))).toBeLessThan(0.002);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REINSPECCIÓN DEL 25/09/2026
// ═════════════════════════════════════════════════════════════════════════════

/** Una llamada de dibujo registrada en uno de los dos lienzos de la app. */
interface OpLienzo {
  op: string;
  a: (number | string)[];
  fill: string;
  stroke: string;
  lw: number;
}

interface RegistroLienzo {
  graf: OpLienzo[];
  anim: OpLienzo[];
  /** Por cada frame de la animación: borde superior del bloque − borde inferior del anclaje (px). */
  margenAncla: number[];
}

/**
 * Se instala ANTES de cargar la página y envuelve seis métodos del contexto 2D para anotar lo
 * que se dibuja en cada lienzo (el de la gráfica mide 500×160 y el de la animación 260×420).
 * Solo observa: llama siempre al método original con los mismos argumentos.
 */
function ganchoLienzo(): void {
  const proto = CanvasRenderingContext2D.prototype as unknown as Record<
    string,
    (...args: unknown[]) => unknown
  >;
  const tipo = (c: HTMLCanvasElement): 'graf' | 'anim' | null =>
    c.width === 500 && c.height === 160
      ? 'graf'
      : c.width === 260 && c.height === 420
        ? 'anim'
        : null;
  const registro: RegistroLienzo = { graf: [], anim: [], margenAncla: [] };
  (window as unknown as { __lienzo: RegistroLienzo }).__lienzo = registro;
  let anclaAbajo = 0;
  for (const nombre of ['clearRect', 'moveTo', 'lineTo', 'fillText', 'roundRect', 'fillRect']) {
    const original = proto[nombre];
    proto[nombre] = function (this: CanvasRenderingContext2D, ...args: unknown[]): unknown {
      const k = tipo(this.canvas);
      if (k) {
        if (nombre === 'clearRect') {
          registro[k] = [];
          if (k === 'anim') anclaAbajo = 0;
        }
        registro[k].push({
          op: nombre,
          a: args.map((v) => (typeof v === 'number' ? v : String(v))),
          fill: String(this.fillStyle),
          stroke: String(this.strokeStyle),
          lw: this.lineWidth,
        });
        // El techo y la varilla se pintan con fillRect ANTES que el bloque (roundRect).
        if (k === 'anim' && nombre === 'fillRect') {
          anclaAbajo = Math.max(anclaAbajo, (args[1] as number) + (args[3] as number));
        }
        if (k === 'anim' && nombre === 'roundRect') {
          registro.margenAncla.push((args[1] as number) - anclaAbajo);
        }
      }
      return original.apply(this, args);
    };
  }
}

interface Grafica {
  /** Marcas del eje de tiempo: segundos rotulados y su abscisa en el lienzo. */
  marcas: { t: number; px: number }[];
  /** La traza x(t) convertida a (segundos, metros) con la escala que dan las propias marcas. */
  puntos: [number, number][];
  /** Color de los rótulos de tiempo y del fondo que pinta la propia gráfica. */
  colorRotulos: string | null;
  colorFondo: string | null;
}

/**
 * Lee la gráfica x(t) del último frame dibujado. La escala horizontal sale de las DOS primeras
 * marcas rotuladas («0 s», «1 s»…) y la vertical, de la del propio código: el ±A de la app se
 * dibuja a 14 px del borde de un lienzo de 160 px, o sea 66 px por A.
 */
async function leerGrafica(page: Page, A: number): Promise<Grafica> {
  const ops = await page.evaluate(
    () => (window as unknown as { __lienzo: RegistroLienzo }).__lienzo.graf,
  );
  const marcas: { t: number; px: number }[] = [];
  const traza: [number, number][] = [];
  let colorRotulos: string | null = null;
  let colorFondo: string | null = null;
  for (const o of ops) {
    if (o.op === 'fillRect' && colorFondo === null) colorFondo = o.fill;
    if (o.op === 'fillText') {
      const m = String(o.a[0]).match(/^(\d+) s$/);
      if (m) {
        marcas.push({ t: Number(m[1]), px: Number(o.a[1]) });
        colorRotulos = o.fill;
      }
    }
    if ((o.op === 'moveTo' || o.op === 'lineTo') && o.lw === 2) {
      traza.push([Number(o.a[0]), Number(o.a[1])]);
    }
  }
  if (marcas.length < 2) return { marcas, puntos: [], colorRotulos, colorFondo };
  const pxPorSegundo = (marcas[1].px - marcas[0].px) / (marcas[1].t - marcas[0].t);
  const pxPorMetro = (80 - 14) / A;
  const puntos = traza.map(
    ([px, py]): [number, number] => [
      marcas[0].t + (px - marcas[0].px) / pxPorSegundo,
      (80 - py) / pxPorMetro,
    ],
  );
  return { marcas, puntos, colorRotulos, colorFondo };
}

/** Último instante que ya tiene dibujado la gráfica (0 si aún no hay dos marcas). */
async function tFinGrafica(page: Page, A: number): Promise<number> {
  const g = await leerGrafica(page, A);
  return g.puntos.length ? g.puntos[g.puntos.length - 1][0] : 0;
}

/** x de la traza en el instante t, por interpolación lineal entre las dos muestras vecinas. */
function xEn(puntos: [number, number][], t: number): number {
  for (let i = 1; i < puntos.length; i++) {
    const [t0, x0] = puntos[i - 1];
    const [t1, x1] = puntos[i];
    if (t0 <= t && t1 >= t) return x0 + ((t - t0) / (t1 - t0)) * (x1 - x0);
  }
  return NaN;
}

/** Extremos locales de la traza, afinados con la parábola que pasa por tres muestras. */
function extremos(puntos: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 1; i < puntos.length - 1; i++) {
    const [t0, x0] = puntos[i - 1];
    const [t1, x1] = puntos[i];
    const [t2, x2] = puntos[i + 1];
    if ((x1 > x0 && x1 >= x2) || (x1 < x0 && x1 <= x2)) {
      const h = (t2 - t0) / 2;
      const den = x0 - 2 * x1 + x2;
      const d = den !== 0 ? (0.5 * (x0 - x2)) / den : 0;
      out.push([t1 + d * h, x1 - 0.25 * (x0 - x2) * d]);
    }
  }
  return out;
}

/** Pasos por x = 0 de la traza, interpolados. */
function crucesPorCero(puntos: [number, number][]): number[] {
  const c: number[] = [];
  for (let i = 1; i < puntos.length; i++) {
    const [t0, x0] = puntos[i - 1];
    const [t1, x1] = puntos[i];
    if ((x0 > 0 && x1 <= 0) || (x0 < 0 && x1 >= 0)) c.push(t0 + (x0 / (x0 - x1)) * (t1 - t0));
  }
  return c;
}

/** Contraste WCAG entre dos colores CSS cualesquiera, convertidos por el propio navegador. */
async function contrasteColores(page: Page, primero: string, segundo: string): Promise<number> {
  return page.evaluate(
    ({ c1, c2 }) => {
      const lienzo = document.createElement('canvas');
      lienzo.width = lienzo.height = 1;
      const ctx = lienzo.getContext('2d', { willReadFrequently: true })!;
      const lum = (css: string): number => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        const f = (v: number): number => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const l1 = lum(c1);
      const l2 = lum(c2);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    },
    { c1: primero, c2: segundo },
  );
}

/**
 * Contraste del texto de un elemento contra su fondo REAL: compone las capas de fondo de sus
 * ancestros (hay fondos semitransparentes con color-mix) hasta la primera opaca.
 */
async function contrasteElemento(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return NaN;
    const lienzo = document.createElement('canvas');
    lienzo.width = lienzo.height = 1;
    const ctx = lienzo.getContext('2d', { willReadFrequently: true })!;
    type Rgba = { r: number; g: number; b: number; a: number };
    const rgba = (css: string): Rgba => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
    };
    const sobre = (fg: Rgba, bg: Rgba): Rgba => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    });
    const lum = ({ r, g, b }: Rgba): number => {
      const f = (v: number): number => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const capas: Rgba[] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      if (bg === 'transparent' || /,\s*0\)$/.test(bg)) continue;
      const c = rgba(bg);
      if (c.a > 0) capas.push(c);
      if (c.a === 1) break;
    }
    let fondo: Rgba = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
    const texto = sobre(rgba(getComputedStyle(el).color), fondo);
    const l1 = lum(texto);
    const l2 = lum(fondo);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }, selector);
}

/** Da un selector estable al valor de una tarjeta (las clases llevan hash) con un atributo. */
async function marcarValorTarjeta(page: Page, etiqueta: string, marca: string): Promise<string> {
  await page.evaluate(
    ({ lab, m }) => {
      for (const d of document.querySelectorAll('div')) {
        const sp = d.querySelectorAll(':scope > span');
        if (sp.length === 2 && sp[0].textContent?.trim() === lab) sp[1].setAttribute('data-inspector', m);
      }
    },
    { lab: etiqueta, m: marca },
  );
  return `[data-inspector="${marca}"]`;
}

/** Texto de la pista bajo el deslizador de γ. */
async function leerPistaGamma(page: Page): Promise<string> {
  return page.evaluate(
    () =>
      document.querySelector('#slider-gamma')?.parentElement?.querySelector(':scope > span')
        ?.textContent ?? '',
  );
}

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 4 — #969: el deslizador de γ lleva unidad y su pista se calcula', () => {
  test('γ al máximo con m = 1 kg y k = 20 N/m: «2,0 N·s/m» y el 22 % del crítico', async ({
    page,
  }) => {
    await sembrarValor(page, '#slider-gamma', 2); // arranca en 0; m = 1 y k = 20 ya lo son

    // γ_c = 2√(k·m) = 2√20 = 8,944272 N·s/m → «8,94» · γ/γ_c = 2/8,944272 = 22,36 % → «22»
    await expect(page.locator('label[for="slider-gamma"]')).toContainText('2,0 N·s/m');
    await expect(page.locator('#slider-gamma')).toHaveAttribute(
      'aria-label',
      'Amortiguamiento: 2,0 newton segundo por metro',
    );
    await expect.poll(() => leerPistaGamma(page)).toContain('γ_c = 8,94 N·s/m (crítico)');
    // \s admite el espacio normal y el duro: aquí se vigila la cifra, no el espaciado (caso 8).
    await expect.poll(() => leerPistaGamma(page)).toMatch(/ahora 22\s% del crítico/);
    // Con el 22 % del crítico sigue siendo subamortiguado: la pista vieja decía «muy amortiguado».
    await expect.poll(() => leerFila(page, 'Régimen')).toBe('Subamortiguado');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Casos 5 a 7 — lo que DIBUJA la gráfica x(t), leído del lienzo', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(ganchoLienzo);
    await page.reload();
    await esperarHidratacion(page, SLIDERS);
  });

  test('Caso 5 (#970) — el eje de tiempo dice la verdad: m=1, k=10, A=0,20, γ=0', async ({
    page,
  }) => {
    test.setTimeout(45000);
    await sembrarValor(page, '#slider-k', 10);
    await sembrarValor(page, '#slider-A', 0.2);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('1,987 s');
    await page.getByRole('button', { name: 'Reiniciar simulación' }).click();
    await expect.poll(() => tFinGrafica(page, 0.2), { timeout: 15000 }).toBeGreaterThan(2.3);
    await page.getByRole('button', { name: 'Pausar simulación' }).click();

    const g = await leerGrafica(page, 0.2);
    // Rótulos en segundos enteros desde el reinicio: «0 s», «1 s», «2 s»…
    expect(g.marcas.slice(0, 3).map((m) => m.t)).toEqual([0, 1, 2]);

    // x(t) = A·cos(ω₀t), ω₀ = √10 = 3,162278 rad/s, calculado a mano:
    //   x(1 s) = 0,20·cos(3,162278) = −0,199957 m · x(2 s) = 0,20·cos(6,324555) = +0,199829 m
    // Si el eje fuera por frames o estuviera mal rotulado, en esas marcas no estaría esto.
    expect(xEn(g.puntos, 1)).toBeCloseTo(-0.199957, 3);
    expect(xEn(g.puntos, 2)).toBeCloseTo(0.199829, 3);

    // Y el período se MIDE en el dibujo, como manda el consejo de examen de la app: el primer
    // máximo tras el arranque cae en T = 2π/√10 = 1,986918 s. Muestras cada ~16,7 ms, afinadas
    // con una parábola: 5 ms de holgura.
    const maximos = extremos(g.puntos).filter(([t, x]) => x > 0 && t > 0.5);
    expect(maximos.length).toBeGreaterThan(0);
    expect(Math.abs(maximos[0][0] - 1.986918)).toBeLessThan(0.005);
  });

  test('Caso 6 — subamortiguado m=1, k=10, A=0,20, γ=1: ω_d, envolvente A·e^(−βt) y energía que solo baja', async ({
    page,
  }) => {
    test.setTimeout(60000);
    await sembrarValor(page, '#slider-k', 10);
    await sembrarValor(page, '#slider-A', 0.2);
    await sembrarValor(page, '#slider-gamma', 1);

    // A mano: β = γ/2m = 0,5 s⁻¹ < ω₀ = 3,162278 → ω_d = √(10 − 0,25) = √9,75 = 3,122499 rad/s
    //   T_d = 2π/ω_d = 2,012230 s (> T₀ = 1,986918 s) · f_d = 0,496961 Hz
    //   γ_c = 2√10 = 6,324555 N·s/m → γ es el 15,81 % del crítico
    await expect.poll(() => leerFila(page, 'ω amortiguada')).toBe('3,122 rad/s');
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,012 s');
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('0,497 Hz');
    await expect.poll(() => leerPistaGamma(page)).toContain('γ_c = 6,32 N·s/m');
    await expect.poll(() => leerPistaGamma(page)).toMatch(/ahora 16\s% del crítico/);

    // Se pausa y se reinicia ANTES de muestrear: si no, la primera lectura podría ser un frame
    // anterior al reinicio (energía ya gastada) y la siguiente, la de t = 0, parecería una subida.
    await page.getByRole('button', { name: 'Pausar simulación' }).click();
    await page.getByRole('button', { name: 'Reiniciar simulación' }).click();
    await expect.poll(() => leerFila(page, 'Total E')).toBe('0,200 J');
    // Energía: E(0) = ½kA² = ½·10·0,20² = 0,200 J, y dE/dt = −γ·v² ≤ 0: nunca sube.
    const enCurso = muestrear(page, 3000, ['Total E']);
    await page.getByRole('button', { name: 'Reanudar simulación' }).click();
    const muestras = await enCurso;
    const energias = muestras.map((m) => m[1]).filter((n) => isFinite(n));
    expect(energias[energias.length - 1]).toBeLessThan(0.2); // corrió de verdad
    expect(Math.max(...energias)).toBeLessThanOrEqual(0.2);
    for (let i = 1; i < energias.length; i++) {
      expect(energias[i], `la energía subió en la muestra ${i}`).toBeLessThanOrEqual(
        energias[i - 1],
      );
    }

    await expect.poll(() => tFinGrafica(page, 0.2), { timeout: 15000 }).toBeGreaterThan(2.3);
    await page.getByRole('button', { name: 'Pausar simulación' }).click();
    const g = await leerGrafica(page, 0.2);
    const ext = extremos(g.puntos).filter(([t]) => t > 0.5);
    // Los extremos (v = 0) caen en t_n = n·π/ω_d y valen EXACTAMENTE ±A·e^(−β·t_n):
    //   t₁ = T_d/2 = 1,006115 s → x = −0,20·e^(−0,503058) = −0,120936 m
    //   t₂ = T_d   = 2,012230 s → x = +0,20·e^(−1,006115) = +0,073127 m
    // Con ω₀ en el coseno (el defecto del 966) el primer mínimo caería en T₀/2 = 0,9935 s.
    expect(ext.length).toBeGreaterThanOrEqual(2);
    expect(Math.abs(ext[0][0] - 1.006115)).toBeLessThan(0.005);
    expect(ext[0][1]).toBeCloseTo(-0.120936, 3);
    expect(Math.abs(ext[1][0] - 2.01223)).toBeLessThan(0.005);
    expect(ext[1][1]).toBeCloseTo(0.073127, 3);
  });

  test('Caso 7a (#967) — crítico m=1, k=1, A=1, γ=2: la gráfica es (1+t)·e^(−t), sin cruzar el cero', async ({
    page,
  }) => {
    test.setTimeout(45000);
    await sembrarValor(page, '#slider-k', 1);
    await sembrarValor(page, '#slider-A', 1);
    await sembrarValor(page, '#slider-gamma', 2);
    await expect.poll(() => leerFila(page, 'Régimen')).toBe('Amortiguamiento crítico');
    await page.getByRole('button', { name: 'Reiniciar simulación' }).click();
    await expect.poll(() => tFinGrafica(page, 1), { timeout: 15000 }).toBeGreaterThan(3.2);
    await page.getByRole('button', { name: 'Pausar simulación' }).click();

    const g = await leerGrafica(page, 1);
    // x(t) = A(1+βt)e^(−βt) con β = 1: x(1) = 2/e = 0,735759 · x(2) = 3/e² = 0,406006 ·
    // x(3) = 4/e³ = 0,199148 m. Entre dos muestras la curva apenas se dobla: 1 mm de holgura.
    expect(xEn(g.puntos, 1)).toBeCloseTo(0.735759, 3);
    expect(xEn(g.puntos, 2)).toBeCloseTo(0.406006, 3);
    expect(xEn(g.puntos, 3)).toBeCloseTo(0.199148, 3);
    expect(Math.min(...g.puntos.map((p) => p[1]))).toBeGreaterThan(0);
  });

  test('Caso 7b (#967) — sobreamortiguado m=0,1, k=1, A=1, γ=2: dos exponenciales, sin cruzar', async ({
    page,
  }) => {
    test.setTimeout(45000);
    await sembrarValor(page, '#slider-k', 1);
    await sembrarValor(page, '#slider-A', 1);
    await sembrarValor(page, '#slider-gamma', 2);
    await sembrarValor(page, '#slider-masa', 0.1);
    await expect.poll(() => leerFila(page, 'Régimen')).toBe('Sobreamortiguado');
    // γ_c = 2√(1·0,1) = 0,632456 → «0,63» · γ/γ_c = 316,23 % → «316»
    await expect.poll(() => leerPistaGamma(page)).toContain('γ_c = 0,63 N·s/m');
    await expect.poll(() => leerPistaGamma(page)).toMatch(/ahora 316\s% del crítico/);
    await page.getByRole('button', { name: 'Reiniciar simulación' }).click();
    await expect.poll(() => tFinGrafica(page, 1), { timeout: 15000 }).toBeGreaterThan(2.2);
    await page.getByRole('button', { name: 'Pausar simulación' }).click();

    const g = await leerGrafica(page, 1);
    // A mano, con las raíces de m·s² + γ·s + k = 0: s = −β ± r, β = 10, r = √90 = 9,486833
    //   x(t) = C₁·e^(−0,513167·t) + C₂·e^(−19,486833·t), C₁ = 1,027046, C₂ = −0,027046
    //   x(1) = 0,614787 m · x(2) = 0,368009 m
    expect(xEn(g.puntos, 1)).toBeCloseTo(0.614787, 3);
    expect(xEn(g.puntos, 2)).toBeCloseTo(0.368009, 3);
    expect(Math.min(...g.puntos.map((p) => p[1]))).toBeGreaterThan(0);
  });

  test('Caso 7c — extremo de los deslizadores m=0,1, k=100: sin deriva ni aliasing en 20 períodos', async ({
    page,
  }) => {
    test.setTimeout(60000);
    await sembrarValor(page, '#slider-masa', 0.1);
    await sembrarValor(page, '#slider-k', 100);
    // ω₀ = √(100/0,1) = √1000 = 31,622777 rad/s · T = 0,198692 s · f = 5,032921 Hz
    // E = ½·100·0,30² = 4,500 J (A por defecto 0,30 m)
    await expect.poll(() => leerFila(page, 'ω₀')).toBe('31,623 rad/s');
    await expect.poll(() => leerFila(page, 'Período T')).toBe('0,199 s');
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('5,033 Hz');
    await page.getByRole('button', { name: 'Reiniciar simulación' }).click();

    // La app no integra: evalúa la solución cerrada, así que la energía no puede derivar.
    const muestras = await muestrear(page, 4800, ['Total E']);
    const energias = muestras.map((m) => m[1]).filter((n) => isFinite(n));
    expect(Math.min(...energias)).toBe(4.5);
    expect(Math.max(...energias)).toBe(4.5);

    await page.getByRole('button', { name: 'Pausar simulación' }).click();
    const g = await leerGrafica(page, 0.3);
    // Precondición: lo muestreado cubre al menos 20 períodos de tiempo SIMULADO (3,973835 s).
    expect(g.puntos[g.puntos.length - 1][0]).toBeGreaterThan(3.973835);

    // Aliasing: el paso de tiempo está topado a 0,05 s, así que hay al menos
    // T/0,05 = 3,97 muestras por período (Nyquist pide 2); a 60 fps son ~11,9.
    const pasos = g.puntos.slice(1).map((p, i) => p[0] - g.puntos[i][0]);
    expect(Math.max(...pasos)).toBeLessThanOrEqual(0.0500001);

    // Período medido en la traza, en tiempo simulado: T = 0,198692 s.
    const c = crucesPorCero(g.puntos);
    const periodos = c.slice(1).map((v, i) => 2 * (v - c[i]));
    const medio = periodos.reduce((a, b) => a + b, 0) / periodos.length;
    expect(Math.abs(medio - 0.198692)).toBeLessThan(0.002);
    expect(Math.max(...g.puntos.map((p) => Math.abs(p[1])))).toBeLessThanOrEqual(0.3001);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 8 — hallazgos abiertos de la reinspección (25/09/2026)', () => {
  test('la caja de fórmulas ya no enseña x(t) con ω₀ en el coseno (reparación incompleta del #966)', async ({
    page,
  }) => {
    // HALLAZGO ABIERTO: page.tsx:504-505 sigue publicando «T = 2π/ω₀» y
    // «x(t) = A·cos(ω₀t)·e^(−γt/2m)», justo la fórmula que la reparación del 966 retiró del
    // motor y que el bloque «Errores frecuentes» de la app enseña a evitar. En el crítico
    // (m=1, k=1, γ=2) la tarjeta dice «no oscila» y la caja predice x(π s) = cos(π)·e^(−π)
    // = −0,043214 m, cuando la app (bien) dibuja (1+π)·e^(−π) = +0,178974 m.
    test.fail();
    await sembrarValor(page, '#slider-k', 1);
    await sembrarValor(page, '#slider-gamma', 2);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('no oscila');
    const caja = (await page.locator('code').allTextContents()).join(' · ');
    expect(caja).not.toMatch(/cos\(\s*ω₀\s*·?\s*t\s*\)\s*·?\s*e\^/);
  });

  test('con γ = 0 el régimen no se rotula «Subamortiguado»', async ({ page }) => {
    // HALLAZGO ABIERTO: page.tsx:81-85 y motor.ts:85-87. Con γ = 0 (el estado inicial) la
    // tarjeta «Régimen» dice «Subamortiguado», y la propia FAQ de la app define ese régimen
    // como «oscila con amplitud decreciente» (page.tsx:781); con γ = 0 la amplitud no decrece.
    test.fail();
    // γ arranca en 0: no hay que sembrar nada, y comprobarlo es parte del caso.
    await expect(page.locator('#slider-gamma')).toHaveValue('0');
    await expect.poll(() => leerFila(page, 'Régimen')).not.toBe('');
    expect(await leerFila(page, 'Régimen')).not.toBe('Subamortiguado');
  });

  test('el «%» de la pista va con espacio duro (regla del 25/09/2026)', async ({ page }) => {
    // HALLAZGO ABIERTO: page.tsx:496 escribe «… % del crítico» con un espacio normal (U+0020);
    // el formato de meskeIA pide U+00A0 para que el «%» no salte solo de línea.
    test.fail();
    await expect.poll(() => leerPistaGamma(page)).toContain('% del crítico');
    expect(await leerPistaGamma(page)).toContain('0 % del crítico');
  });

  test('con A = 1 m el bloque no atraviesa el techo del que cuelga', async ({ page }) => {
    // HALLAZGO ABIERTO: page.tsx:177-179 dibuja a 150 px/m con el equilibrio a 165 px, así que
    // en x = −A el borde superior del bloque queda en 165 − 150·A − 25 px. El anclaje (techo y
    // varilla) acaba en y = 35 px: desde A = 0,70 m el bloque lo tapa, y con A = 1 m (el
    // máximo del deslizador) sube hasta y = −10 px, por encima del techo y fuera del lienzo,
    // con el muelle dibujado por debajo del bloque. Margen esperado > 0 · obtenido −45 px.
    test.fail();
    test.setTimeout(45000);
    await page.addInitScript(ganchoLienzo);
    await page.reload();
    await esperarHidratacion(page, SLIDERS);
    await sembrarValor(page, '#slider-A', 1); // m = 1, k = 20, γ = 0 → T = 1,404963 s
    await page.getByRole('button', { name: 'Reiniciar simulación' }).click();
    await page.evaluate(() => {
      (window as unknown as { __lienzo: RegistroLienzo }).__lienzo.margenAncla = [];
    });
    // Un período entero de tiempo simulado: pasa por x = −A en t = T/2 = 0,70 s.
    await expect.poll(() => tFinGrafica(page, 1), { timeout: 15000 }).toBeGreaterThan(1.5);
    const margenes = await page.evaluate(
      () => (window as unknown as { __lienzo: RegistroLienzo }).__lienzo.margenAncla,
    );
    expect(margenes.length).toBeGreaterThan(10);
    expect(Math.min(...margenes)).toBeGreaterThan(0);
  });

  test('la FAQ no promete explorar la resonancia sin un forzamiento que la produzca', async ({
    page,
  }) => {
    // HALLAZGO ABIERTO: metadata.ts:90 (FAQPage) dice que la simulación «permite explorar casos
    // límite como el sobreamortiguamiento o la resonancia». La resonancia exige una fuerza
    // externa periódica y la app solo tiene m, k, A y γ: el oscilador es libre.
    test.fail();
    const faq = (await page.locator('script[type="application/ld+json"]').allTextContents())
      .filter((t) => t.includes('FAQPage'))
      .join(' ');
    expect(faq.length).toBeGreaterThan(0);
    const prometeResonancia = /resonancia/i.test(faq);
    const deslizadores = await page.locator('input[type="range"]').count();
    // Si la promete, tendría que haber un quinto control (fuerza o frecuencia de excitación).
    expect(prometeResonancia ? deslizadores > 4 : true).toBe(true);
  });

  test('los «💡» de la FAQ van ocultos al lector de pantalla', async ({ page }) => {
    // HALLAZGO ABIERTO: page.tsx:774, 785 y 805 abren cada consejo de la FAQ con «💡» como
    // texto suelto, sin <span aria-hidden="true">: el lector lee «bombilla» antes del consejo.
    // Lo señala también `node scripts/check-a11y-jsx.mjs app/simulador-mas-resorte/page.tsx`.
    test.fail();
    const sueltos = await page.evaluate(() =>
      [...document.querySelectorAll('[class*="faqTip"]')].filter((p) =>
        [...p.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.includes('💡')),
      ).length,
    );
    expect(sueltos).toBe(0);
  });

  test('las cifras en color de marca llegan a 4,5:1 en claro y en oscuro', async ({ page }) => {
    // HALLAZGO ABIERTO (medido el 25/09/2026): texto en var(--primary) sobre fondo claro.
    //   · .valueNum (module.css:236), las 9 tarjetas de resultado: 4,11:1 en claro
    //   · .sliderValue (module.css:68), sobre su color-mix al 12 %: 3,55:1 claro / 4,09:1 oscuro
    //   · .formulaBox code (module.css:305): 3,73:1 claro / 4,34:1 oscuro
    //   · .stepNumber (module.css:389-391), blanco sobre --primary: 4,11:1 claro / 2,79:1 oscuro
    // Todo es texto de 14-17 px en negrita: no es «grande», así que el umbral es 4,5:1.
    test.fail();
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const periodo = await marcarValorTarjeta(page, 'Período T', 'periodo');
    const medidas: Record<string, number> = {};
    for (const tema of ['light', 'dark'] as const) {
      await page.evaluate((t) => {
        document.documentElement.dataset.theme = t;
      }, tema);
      medidas[`${tema} tarjeta`] = await contrasteElemento(page, periodo);
      medidas[`${tema} masa`] = await contrasteElemento(page, 'label[for="slider-masa"] > span');
      medidas[`${tema} fórmula`] = await contrasteElemento(page, 'code');
      medidas[`${tema} paso 1`] = await contrasteElemento(page, '[class*="stepNumber"]');
    }
    for (const [donde, ratio] of Object.entries(medidas)) {
      expect(ratio, `${donde}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('los rótulos de la gráfica x(t) —el eje de tiempo del #970— llegan a 4,5:1', async ({
    page,
  }) => {
    // HALLAZGO ABIERTO: page.tsx:292-305 rotula el eje de tiempo en #9ca3af a 10 px sobre el
    // #f8fafc que pinta la propia gráfica (igual en los dos temas): 2,43:1. Y el lienzo de
    // 500 px se encoge al ancho de la columna: a 360 px de viewport mide 278 px, así que esos
    // 10 px se ven a 5,6 px. El eje existe (el 970 está verificado), pero cuesta leerlo.
    test.fail();
    await page.addInitScript(ganchoLienzo);
    await page.reload();
    await esperarHidratacion(page, SLIDERS);
    await expect.poll(() => tFinGrafica(page, 0.3), { timeout: 15000 }).toBeGreaterThan(1.2);
    const g = await leerGrafica(page, 0.3);
    expect(g.colorRotulos).not.toBeNull();
    expect(g.colorFondo).not.toBeNull();
    const ratio = await contrasteColores(page, g.colorRotulos!, g.colorFondo!);
    expect(
      ratio,
      `rótulos ${g.colorRotulos} sobre ${g.colorFondo}: ${ratio.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(4.5);
  });
});
