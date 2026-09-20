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
 *   («γ > γ_c: sobreamortiguado, vuelve lentamente SIN oscilar»). Su motor hace justo lo
 *   contrario: `calcPosicion` es `A·cos(ω₀·t)·exp(−γt/2m)`, con ω₀ en el coseno.
 *
 *   Números de contraste calculados a mano:
 *     · m=1, k=10, γ=2  → γ_c = 6,324555, subcrítico. β = 1, ω_d = √(10−1) = 3,000000 rad/s
 *       EXACTO → T_d = 2π/3 = 2,094395 s, frente a los 1,986918 s que la app publica y anima
 *       (−5,13 %).
 *     · m=1, k=1, A=1, γ=2 → γ_c = 2√1 = 2,000000: amortiguamiento CRÍTICO exacto.
 *       Real: x(t) = (1+t)·e^(−t).  x(1,5708 s) = 0,534440 m · x(3,1416 s) = 0,178995 m,
 *       siempre positiva. La app: x(t) = cos(t)·e^(−t), que cruza a negativo en t = π/2 y
 *       baja hasta −0,067 m (mínimo en t = 3π/4 = 2,356 s).
 *     · m=0,1, k=1, γ=2 → γ_c = 0,632456: γ es 3,16 veces el crítico, sobreamortiguado puro.
 *       ω₀² − β² = 10 − 100 = −90 → ω_d sería √(−90). La app publica T = 1,987 s.
 *     · ENERGÍA: el modelo de la app implica v(0) = −β·A ≠ 0 (deriva el coseno amortiguado),
 *       así que con m=1, k=1, A=1, γ=2 arranca con E(0) = ½kA² + ½m(βA)² = 0,5 + 0,5 =
 *       1,000000 J, el DOBLE de la ½kA² = 0,500 J que la propia app publica como energía
 *       total. Un oscilador amortiguado solo puede PERDER energía.
 *
 * LO QUE ESTOS TRES CASOS FIJAN
 *   1) normal (γ = 0): el núcleo no amortiguado es exacto — cifras, energía y ritmo de la
 *      animación coinciden entre sí y con la fórmula. Esto debe seguir así.
 *   2) límite (γ = γ_c y γ > γ_c, más un subcrítico): cuatro comprobaciones que hoy
 *      documentan el defecto. Si algún día se repara el motor, FALLARÁN — es su razón de ser,
 *      y cada una lleva escrito al lado el número correcto.
 *   3) rechazo (masa 0, k negativa, amplitud negativa): los deslizadores capan al mínimo y
 *      no sale ni un NaN ni un infinito.
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

  test('⚠️ con γ = γ_c la masa CRUZA el equilibrio, y el crítico por definición no lo cruza', async ({
    page,
  }) => {
    test.setTimeout(45000);

    await ponerCritico(page);
    await expect.poll(() => leerFila(page, 'ω₀')).toBe('1,000 rad/s'); // √(1/1)
    await page.getByRole('button', { name: 'Reiniciar simulación' }).click();

    const muestras = await muestrear(page, 5000, ['Posición x']);
    const minimo = Math.min(...muestras.map((m) => m[1]).filter((n) => isFinite(n)));

    // VERDAD FÍSICA: en el crítico x(t) = A(1+βt)e^(−βt) = (1+t)e^(−t) ≥ 0 SIEMPRE.
    //   x(1,5708 s) = 0,534440 m   ·   x(3,1416 s) = 0,178995 m   ·   mínimo = 0.
    // LO QUE HACE LA APP: x(t) = cos(t)·e^(−t) → cruza a negativo en t = π/2 = 1,571 s y
    //   toca el mínimo −0,067 m en t = 3π/4 = 2,356 s. Medido: −0,067 m.
    // Cuando se repare el motor esta línea fallará: el mínimo pasará a ser 0.
    expect(minimo).toBeLessThan(-0.01);
  });

  test('⚠️ con γ = γ_c publica un período finito de 6,283 s para algo que no oscila', async ({
    page,
  }) => {
    await ponerCritico(page);

    // ω₀ = 1 rad/s, pero β = γ/2m = 1 → ω_d = √(1 − 1) = 0: NO hay período.
    // La app publica T = 2π/ω₀ = 6,283185 s y f = 0,159155 Hz como si no hubiera γ.
    await expect.poll(() => leerFila(page, 'Período T')).toBe('6,283 s');
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('0,159 Hz');
  });

  test('⚠️ sobreamortiguado (γ = 3,16·γ_c) y sigue publicando T = 1,987 s', async ({ page }) => {
    await sembrarValor(page, '#slider-k', 1);
    await sembrarValor(page, '#slider-gamma', 2);
    await sembrarValor(page, '#slider-masa', 0.1); // arranca en 1,0

    // γ_c = 2√(1·0,1) = 0,632456 → γ = 2 es 3,16 veces el crítico.
    // β = γ/2m = 10 s⁻¹ y ω₀ = √(1/0,1) = 3,162278 rad/s → ω₀² − β² = −90: ω_d ni existe.
    // La FAQ de la propia app dice que aquí «vuelve lentamente sin oscilar».
    await expect.poll(() => leerFila(page, 'ω₀')).toBe('3,162 rad/s');
    await expect.poll(() => leerFila(page, 'Período T')).toBe('1,987 s');
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('0,503 Hz');
  });

  test('⚠️ subcrítico: anima a ω₀ y no a ω_d — 1,99 s donde tocan 2,094 s', async ({ page }) => {
    test.setTimeout(45000);

    await sembrarValor(page, '#slider-k', 10);
    await sembrarValor(page, '#slider-A', 1);
    await sembrarValor(page, '#slider-gamma', 2);

    // m=1, k=10, γ=2 → γ_c = 2√10 = 6,324555: subcrítico de verdad, aquí SÍ oscila.
    //   β = γ/2m = 1 ;  ω_d = √(ω₀² − β²) = √(10 − 1) = 3,000000 rad/s EXACTO
    //   T_d = 2π/3 = 2,094395 s      ← lo correcto
    //   T₀  = 2π/√10 = 1,986918 s    ← lo que publica y anima la app (−5,13 %)
    await expect.poll(() => leerFila(page, 'Período T')).toBe('1,987 s');
    await page.getByRole('button', { name: 'Reiniciar simulación' }).click();

    const animado = await medirPeriodoAnimado(page, 4500);
    // La banda excluye 2,0944 s por un margen amplio. Medido: 1,98 s.
    expect(animado).toBeGreaterThan(1.85);
    expect(animado).toBeLessThan(2.03);
  });

  test('⚠️ la energía total se DUPLICA en el primer frame y supera ½kA²', async ({ page }) => {
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

    // El coseno amortiguado derivado da v(0) = −β·A = −1,000000 m/s, no 0, así que la
    // energía de partida es ½kA² + ½m(βA)² = 0,5 + 0,5 = 1,000000 J: el DOBLE de la
    // «E_total = ½·k·A²» que la propia caja de fórmulas publica. Un oscilador amortiguado
    // solo puede PERDER energía, nunca ganarla. Medido: v = −1,000 m/s y E = 1,000 J en el
    // segundo frame tras reanudar.
    expect(vMax).toBeGreaterThan(0.8);
    expect(eMax).toBeGreaterThan(0.6); // ½kA² = 0,500 J es el techo físico
  });
});

// ─────────────────────────────────────────────────────────────────────────────
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
    // ⚠️ Con la animación CORRIENDO esta cifra no se sostiene, y no por el reloj: el motor
    // arranca con v(0) = −βA en vez de 0 cuando γ > 0, así que la E total publicada supera la
    // ½kA² que la propia app declara. Está levantada como hallazgo aparte de esta inspección.
    expect(aNumero(await leerFila(page, 'Total E'))).toBeLessThan(0.002);
  });
});
