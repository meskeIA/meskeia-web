import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';

/**
 * Simulador de Péndulo Simple y MAS — inspección del 20/09/2026
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Simulador de Péndulo Simple y MAS» y la caja de resultados da cuatro
 *   cifras: período T, frecuencia f, frecuencia angular ω y la θ instantánea. Encima de
 *   ellas, una pestaña deja elegir entre «Modelo numérico (cualquier ángulo)» —activa por
 *   defecto— y «Aproximación pequeños ángulos».
 *
 * LA VERDAD FÍSICA, CALCULADA A MANO ANTES DE ABRIR EL NAVEGADOR
 *   Para pequeñas oscilaciones (sen θ ≈ θ):
 *       ω₀ = √(g/L)          T = 2π/ω₀ = 2π·√(L/g)          f = 1/T
 *   Con L = 1,00 m y g = 9,81 m/s²:
 *       ω₀ = √9,81      = 3,132092 rad/s
 *       T  = 2π/3,132092 = 2,006067 s   →  en pantalla «2,006 s»
 *       f  = 1/2,006067  = 0,498488 Hz  →  en pantalla «0,498 Hz»
 *   Con g = 2,00 m/s² (planeta inventado, sirve para probar que el campo está vivo):
 *       T = 2π·√(1/2) = 4,442883 s      →  en pantalla «4,443 s»
 *
 *   ⚠️ Esa fórmula SOLO vale para amplitudes pequeñas. El período exacto es
 *       T(θ₀) = T₀ · (2/π)·K(sen(θ₀/2))        [K = integral elíptica completa de 1.ª especie]
 *   que en serie de Bernoulli es  T₀·(1 + θ₀²/16 + 11·θ₀⁴/3072 + …). Con L = 1 m y
 *   g = 9,81 m/s², calculado a mano (AGM para K):
 *       θ₀ = 10°  → T = 2,0099 s   (+0,19 %)
 *       θ₀ = 60°  → T = 2,1529 s   (+7,32 %)
 *       θ₀ = 90°  → T = 2,3678 s   (+18,03 %)   ← 90° es el MÁXIMO del propio deslizador
 *   La app se quedaba en el primer término de la serie (1 + θ₀²/16), que a 90° da
 *   +15,42 % → 2,315 s: 53 ms por debajo del valor real.
 *
 * REPARADO EL 20/09/2026. El cálculo vive en `app/simulador-pendulo/motor.ts`, que resuelve
 * K por la media aritmético-geométrica, con sus casos en `tests/pendulo-motor.spec.ts`. Los
 * bloques de abajo eran TESTIGO y se han invertido:
 *   · «Período T» sale ahora del MODELO ELEGIDO: con «Modelo numérico» es el exacto de esa
 *     amplitud, y con «Aproximación pequeños ángulos», el lineal. Antes era siempre el
 *     lineal, así que la pantalla enseñaba un número y balanceaba el péndulo a otro ritmo.
 *   · El aviso de grandes ángulos da la desviación exacta y se anuncia con role="alert".
 *   · Una gravedad nula, negativa o ausente se rechaza con motivo y detiene la animación.
 *   · La gráfica θ(t) ya no apila dos puntos por frame, uno de ellos en cero.
 *
 * LO QUE ESTOS TRES CASOS FIJAN
 *   1) normal (θ₀ = 10°, dentro de la hipótesis): las cuatro cifras deben salir exactas.
 *   2) límite (θ₀ = 90°, fuera de la hipótesis): la cifra cambia con la pestaña y con el
 *      ángulo, y la animación va al ritmo de la cifra que se publica.
 *   3) rechazo (g = 0 y g < 0): la app lo dice y no calcula.
 */

/** El valor de una fila de resultados, localizada por su etiqueta (las clases van con hash). */
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

/**
 * Mide el período que de verdad ANIMA la app, por cruces por cero de la θ que muestra.
 * Muestrea cada frame dentro del navegador y usa el reloj de la propia app («Tiempo
 * transcurrido»), no el del test, para no mezclar relojes.
 */
async function medirPeriodoAnimado(page: Page, duracionMs: number): Promise<number> {
  const muestras = await page.evaluate(
    (dur) =>
      new Promise<Array<{ t: number; th: number }>>((resolver) => {
        const aNumero = (s: string): number =>
          parseFloat(s.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
        const fila = (lab: string): string => {
          for (const d of document.querySelectorAll('div')) {
            const sp = d.querySelectorAll(':scope > span');
            if (sp.length === 2 && sp[0].textContent?.trim() === lab) {
              return sp[1].textContent?.trim() ?? '';
            }
          }
          return '';
        };
        const salida: Array<{ t: number; th: number }> = [];
        const inicio = performance.now();
        const paso = (): void => {
          salida.push({ t: aNumero(fila('Tiempo transcurrido')), th: aNumero(fila('θ actual')) });
          if (performance.now() - inicio < dur) requestAnimationFrame(paso);
          else resolver(salida);
        };
        requestAnimationFrame(paso);
      }),
    duracionMs,
  );

  const cruces: number[] = [];
  for (let i = 1; i < muestras.length; i++) {
    const a = muestras[i - 1];
    const b = muestras[i];
    if (!isFinite(a.th) || !isFinite(b.th)) continue;
    if ((a.th > 0 && b.th <= 0) || (a.th < 0 && b.th >= 0)) {
      cruces.push(a.t + (a.th / (a.th - b.th)) * (b.t - a.t)); // interpolación lineal
    }
  }
  expect(cruces.length, 'la animación no llegó a cruzar el cero: ¿está pausada?').toBeGreaterThan(2);
  // Entre dos pasos por la vertical consecutivos va MEDIO período.
  const periodos = cruces.slice(1).map((c, i) => 2 * (c - cruces[i]));
  return periodos.reduce((a, b) => a + b, 0) / periodos.length;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/simulador-pendulo/');
  await esperarHidratacion(page, ['#long', '#ang', '#grav', '#damp']);
});

test.describe('Caso 1 — normal: L = 1,00 m, g = 9,81 m/s², θ₀ = 10°', () => {
  test('T, f y ω son los de 2π√(L/g), y no aparece el aviso de grandes ángulos', async ({
    page,
  }) => {
    // El deslizador arranca en 20°: moverlo a 10° lo mete DENTRO de la hipótesis.
    await sembrarValor(page, '#ang', 10);

    // Con la pestaña por defecto («Modelo numérico»), la cifra es el período REAL de esa
    // amplitud: T = 4·√(1,00/9,81)·K(sen 5°) = 2,009905 s. La fórmula lineal daría
    // 2π·√(1,00/9,81) = 2,006067 s: a 10° la diferencia es de 4 ms (+0,19 %).
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,010 s');
    // f = 1/T = 0,497536 Hz
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('0,498 Hz');
    // ω₀ = √(9,81/1,00) = 3,132092 rad/s
    await expect.poll(() => leerFila(page, 'Frecuencia angular ω')).toBe('3,132 rad/s');

    // 10° ≤ 15°: la aproximación vale y la app no debe avisar de nada.
    await expect(page.getByText(/fuera de la aproximación de pequeños ángulos/)).toHaveCount(0);
  });

  test('la masa no entra en el período (sí en la energía)', async ({ page }) => {
    await sembrarValor(page, '#ang', 10);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,010 s');

    // d²θ/dt² = −(g/L)·sen θ no contiene m: subir la masa de 1 a 7 kg no puede mover T.
    await sembrarValor(page, '#masa', 7);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,010 s');
    await expect.poll(() => leerFila(page, 'Frecuencia angular ω')).toBe('3,132 rad/s');
  });

  test('la gravedad sí entra: con la Luna el período se alarga', async ({ page }) => {
    await page.getByRole('button', { name: /Luna/ }).click();

    // Con el ángulo por defecto (20°) y el modelo numérico: T = 4·√(1,00/1,62)·K(sen 10°)
    // = 4,974378 s → «4,974 s».
    await expect.poll(() => leerFila(page, 'Período T')).toBe('4,974 s');

    // Y la fórmula lineal da los 4,936553 s que la propia FAQ de la app anuncia
    // («≈ 4,93 s»), que es lo que esa aproximación promete.
    await page.getByRole('button', { name: /Aproximación pequeños ángulos/ }).click();
    await expect.poll(() => leerFila(page, 'Período T')).toBe('4,937 s');
  });
});

test.describe('Caso 2 — límite: θ₀ = 90°, el máximo del deslizador', () => {
  test('el período mostrado depende del ángulo y de la pestaña de modelo', async ({ page }) => {
    await sembrarValor(page, '#ang', 90);

    // Verdad física: T(90°) = 4·√(L/g)·K(sen 45°) = 2,3678 s. La app publicaba 2,006 s,
    // el de pequeñas oscilaciones, con las DOS pestañas y a cualquier ángulo.
    await expect(page.getByRole('button', { name: /Modelo numérico/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,368 s');

    // La pestaña lineal publica el suyo, que es lo que esa aproximación promete.
    await page.getByRole('button', { name: /Aproximación pequeños ángulos/ }).click();
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,006 s');
    await page.getByRole('button', { name: /Modelo numérico/ }).click();
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,368 s');
  });

  test('con ángulos pequeños las dos pestañas convergen', async ({ page }) => {
    await sembrarValor(page, '#ang', 5);
    // T_real(5°) = 2,00702 s y T₀ = 2,00607 s: con tres decimales, «2,007» y «2,006».
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,007 s');
    await page.getByRole('button', { name: /Aproximación pequeños ángulos/ }).click();
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,006 s');
  });

  test('el aviso de grandes ángulos da la desviación real y se anuncia', async ({ page }) => {
    await sembrarValor(page, '#ang', 90);

    const aviso = page.getByText(/está fuera de la aproximación de pequeños ángulos/);
    await expect(aviso).toBeVisible();
    // Es lo único que sostiene la validez de la cifra principal: debe anunciarse.
    await expect(aviso).toHaveAttribute('role', 'alert');

    // La app corregía con el PRIMER término de la serie de Bernoulli: 1 + θ₀²/16 con
    // θ₀ = π/2 rad da +15,42 % → 2,315 s. La verdad exacta es +18,03 % → 2,368 s.
    await expect(aviso).toContainText('+18,03%');
    await expect(aviso).toContainText('2,368 s');
    await expect(aviso).not.toContainText('+15,42%');
  });

  test('a 60° la desviación también es la exacta', async ({ page }) => {
    await sembrarValor(page, '#ang', 60);

    const aviso = page.getByText(/está fuera de la aproximación de pequeños ángulos/);
    // θ₀ = π/3 → la serie truncada daba +6,85 % y 2,144 s; la exacta, +7,32 % y 2,153 s.
    await expect(aviso).toContainText('+7,32%');
    await expect(aviso).toContainText('2,153 s');
  });

  test('la animación numérica va al mismo ritmo que la cifra que publica', async ({ page }) => {
    test.setTimeout(45000); // hay que dejar oscilar el péndulo unos segundos

    await sembrarValor(page, '#damp', 0); // sin fricción: el período no deriva
    await sembrarValor(page, '#ang', 90);
    await page.getByRole('button', { name: /Modelo numérico/ }).click();
    await page.getByRole('button', { name: /Reiniciar/ }).click();

    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,368 s');

    // El integrador (Euler-Cromer, dt de un frame) resuelve el péndulo NO lineal, así que
    // su período animado es el exacto: 2,3678 s. Antes la pantalla enseñaba 2,006 s y
    // movía el péndulo a 2,368 s.
    const animado = await medirPeriodoAnimado(page, 7000);
    expect(animado).toBeGreaterThan(2.3);
    expect(animado).toBeLessThan(2.45);
  });

  test('bajo «pequeños ángulos» la animación va al ritmo de SU cifra', async ({ page }) => {
    test.setTimeout(45000);

    await sembrarValor(page, '#damp', 0);
    await sembrarValor(page, '#ang', 90);
    await page.getByRole('button', { name: /Aproximación pequeños ángulos/ }).click();
    await page.getByRole('button', { name: /Reiniciar/ }).click();

    // Esta pestaña usa la solución cerrada θ(t) = θ₀·cos(ω₀t): período 2,006 s aunque
    // la amplitud sea de 90°, que es justo lo que la aproximación NO puede sostener.
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,006 s');
    const animado = await medirPeriodoAnimado(page, 7000);
    expect(animado).toBeGreaterThan(1.95);
    expect(animado).toBeLessThan(2.06);
  });
});

test.describe('Caso 3 — a rechazar: gravedad cero o negativa', () => {
  test('g = 0 se rechaza con motivo, en vez de sustituirse por 9,81', async ({ page }) => {
    // Primero se mueve a un valor distinto del inicial, para que la prueba no dé verde
    // sin haber cambiado nada: g = 2,00 m/s² con θ₀ = 20° (el de partida) →
    // T = 4·√(1/2)·K(sen 10°) = 4,477020 s. (La fórmula lineal daría 4,442883 s.)
    await page.locator('#grav').fill('2');
    await esperarValorEnReact(page, '#grav', '2');
    await expect.poll(() => leerFila(page, 'Período T')).toBe('4,477 s');

    // El onChange era `parseFloat(e.target.value) || 9.81`, y el 0 es falsy: el campo
    // saltaba a 9,81 sin un solo mensaje y el usuario creía haber simulado gravedad nula.
    await page.locator('#grav').fill('0');
    await esperarValorEnReact(page, '#grav', '0');
    await expect(page.locator('#grav')).toHaveValue('0');

    const aviso = page.locator('#aviso-gravedad');
    await expect(aviso).toHaveAttribute('role', 'alert');
    await expect(aviso).toContainText('no oscila');
  });

  test('el campo se puede vaciar para teclear otra gravedad', async ({ page }) => {
    await page.locator('#grav').fill('');
    await expect(page.locator('#grav')).toHaveValue('');
    await expect(page.locator('#aviso-gravedad')).toContainText('gravedad');

    // Y se sigue pudiendo escribir: la Luna, 1,62 m/s² con θ₀ = 20° → 4,974378 s
    await page.locator('#grav').fill('1.62');
    await esperarValorEnReact(page, '#grav', '1.62');
    await expect(page.locator('#aviso-gravedad')).toHaveCount(0);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('4,974 s');
  });

  test('g negativa se rechaza y la animación se detiene', async ({ page }) => {
    await page.locator('#grav').fill('-5');
    await esperarValorEnReact(page, '#grav', '-5');

    // Antes: ω₀ = √(−5/1) = NaN, las tres cifras en «No definido» sin explicar nada, y la
    // animación en marcha con el péndulo en fuga (θ crecía sin límite).
    const aviso = page.locator('#aviso-gravedad');
    await expect(aviso).toHaveAttribute('role', 'alert');
    await expect(aviso).toContainText('negativa');

    // El péndulo se queda quieto: dos lecturas del ángulo separadas en el tiempo coinciden.
    const angulo = () => leerFila(page, 'θ actual');
    const primera = await angulo();
    await page.waitForTimeout(1200);
    expect(await angulo()).toBe(primera);
  });

  test('la longitud no puede ser cero: el deslizador la capa en su mínimo de 0,10 m', async ({
    page,
  }) => {
    // Pedir L = 0 daría ω₀ = √(g/0) = ∞. El <input type="range"> lo recorta a min=0,1
    // antes de que React lo vea, así que el caso imposible nunca llega al cálculo.
    await sembrarValor(page, '#long', 0, { esperado: '0.1' });

    // Con θ₀ = 20° y el modelo numérico: T = 4·√(0,10/9,81)·K(sen 10°) = 0,639236 s.
    // (La fórmula lineal daría 2π·√(0,10/9,81) = 0,634371 s.) ω₀ = √98,1 = 9,904544 rad/s
    await expect.poll(() => leerFila(page, 'Período T')).toBe('0,639 s');
    await expect.poll(() => leerFila(page, 'Frecuencia angular ω')).toBe('9,905 rad/s');
  });
});

test.describe('La gráfica θ(t) dibuja una sinusoide, no un peine', () => {
  test('menos de uno de cada diez puntos está sobre el eje', async ({ page }) => {
    test.setTimeout(45000);

    await sembrarValor(page, '#damp', 0);
    await sembrarValor(page, '#ang', 60);
    await page.getByRole('button', { name: /Reiniciar/ }).click();
    await page.waitForTimeout(3000); // dejar que se llene el historial

    const puntos = await page.evaluate(() => {
      const poli = document.querySelector('polyline[points]');
      return poli?.getAttribute('points')?.trim().split(/\s+/) ?? [];
    });

    expect(puntos.length).toBeGreaterThan(60);

    // El bucle de animación empujaba un 0 por frame «a la espera del valor real», y un
    // efecto aparte empujaba el bueno: se apilaban DOS puntos por frame y la mitad exacta
    // caía sobre θ = 0, o sea sobre la línea media del lienzo (y = 65,0 con esta altura).
    const alturas = puntos.map((p) => Number(p.split(',')[1]));
    const media = (Math.min(...alturas) + Math.max(...alturas)) / 2;
    const sobreElEje = alturas.filter((y) => Math.abs(y - media) < 0.5).length;
    expect(sobreElEje / alturas.length).toBeLessThan(0.1);
  });
});
