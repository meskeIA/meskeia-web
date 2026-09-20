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
 *   Y la app se queda en el primer término de la serie (1 + θ₀²/16), que a 90° da
 *   +15,42 % → 2,315 s: 53 ms por debajo del valor real.
 *
 * LO QUE ESTOS TRES CASOS FIJAN
 *   1) normal (θ₀ = 10°, dentro de la hipótesis): las cuatro cifras deben salir exactas.
 *   2) límite (θ₀ = 90°, fuera de la hipótesis): la cifra grande NO cambia ni de pestaña
 *      ni de ángulo, y la propia animación de la app oscila a otro ritmo. El test mide
 *      las dos cosas para que una reparación futura lo note.
 *   3) rechazo (g = 0 y g < 0): qué hace la app con una gravedad imposible.
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

    // T = 2π·√(1,00/9,81) = 2,006067 s
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,006 s');
    // f = 1/T = 0,498488 Hz
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('0,498 Hz');
    // ω₀ = √(9,81/1,00) = 3,132092 rad/s
    await expect.poll(() => leerFila(page, 'Frecuencia angular ω')).toBe('3,132 rad/s');

    // 10° ≤ 15°: la aproximación vale y la app no debe avisar de nada.
    await expect(page.getByText(/fuera de la aproximación de pequeños ángulos/)).toHaveCount(0);
  });

  test('la masa no entra en el período (sí en la energía)', async ({ page }) => {
    await sembrarValor(page, '#ang', 10);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,006 s');

    // d²θ/dt² = −(g/L)·sen θ no contiene m: subir la masa de 1 a 7 kg no puede mover T.
    await sembrarValor(page, '#masa', 7);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,006 s');
    await expect.poll(() => leerFila(page, 'Frecuencia angular ω')).toBe('3,132 rad/s');
  });

  test('la gravedad sí entra: con la Luna (1,62 m/s²) el período es 4,937 s', async ({ page }) => {
    // T = 2π·√(1,00/1,62) = 4,936553 s  →  «4,937 s». Es el número que la propia FAQ
    // de la app anuncia («≈ 4,93 s»), así que aquí se comprueba que coinciden.
    await page.getByRole('button', { name: /Luna/ }).click();
    await expect.poll(() => leerFila(page, 'Período T')).toBe('4,937 s');
  });
});

test.describe('Caso 2 — límite: θ₀ = 90°, el máximo del deslizador', () => {
  test('el período mostrado no cambia con el ángulo ni con la pestaña de modelo', async ({
    page,
  }) => {
    await sembrarValor(page, '#ang', 90);

    // Verdad física: T(90°) = 2,006067 · (2/π)·K(sen 45°) = 2,3678 s.
    // Lo que la app muestra es el de pequeñas oscilaciones, 2,006 s (−15,3 %).
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,006 s');

    // Y la pestaña «Modelo numérico (cualquier ángulo)» —activa por defecto— no mueve
    // esa cifra: las dos pestañas dan exactamente el mismo número.
    await expect(page.getByRole('button', { name: /Modelo numérico/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.getByRole('button', { name: /Aproximación pequeños ángulos/ }).click();
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,006 s');
    await page.getByRole('button', { name: /Modelo numérico/ }).click();
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,006 s');
  });

  test('el aviso de grandes ángulos sale junto a la cifra, y se queda corto', async ({ page }) => {
    await sembrarValor(page, '#ang', 90);

    const aviso = page.getByText(/está fuera de la aproximación de pequeños ángulos/);
    await expect(aviso).toBeVisible();

    // La app corrige con el PRIMER término de la serie: 1 + θ₀²/16 con θ₀ = π/2 rad
    //   (π/2)² / 16 = 2,467401/16 = 0,154213  →  +15,42 %  →  2,006067·1,154213 = 2,315 s
    await expect(aviso).toContainText('+15,42%');
    await expect(aviso).toContainText('2,315 s');

    // La serie completa da +18,03 % → 2,3678 s. El aviso se queda 53 ms (2,2 %) por debajo.
    // Si algún día se añaden los términos siguientes, estas dos líneas fallarán: es su
    // razón de ser. El valor correcto a 90° es «2,368 s» y la corrección «+18,03%».
  });

  test('a 60° la corrección ofrecida también se queda por debajo del valor real', async ({
    page,
  }) => {
    await sembrarValor(page, '#ang', 60);

    const aviso = page.getByText(/está fuera de la aproximación de pequeños ángulos/);
    // θ₀ = π/3 = 1,047198 rad → θ₀²/16 = 0,068539 → +6,85 % → 2,144 s
    await expect(aviso).toContainText('+6,85%');
    await expect(aviso).toContainText('2,144 s');
    // Verdad exacta: 2,006067·(2/π)·K(sen 30°) = 2,1529 s (+7,32 %).
  });

  test('la animación numérica oscila a 2,368 s mientras la cifra dice 2,006 s', async ({
    page,
  }) => {
    test.setTimeout(45000); // hay que dejar oscilar el péndulo unos segundos

    await sembrarValor(page, '#damp', 0); // sin fricción: el período no deriva
    await sembrarValor(page, '#ang', 90);
    await page.getByRole('button', { name: /Modelo numérico/ }).click();
    await page.getByRole('button', { name: /Reiniciar/ }).click();

    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,006 s');

    // El integrador de la app (Euler-Cromer, dt de un frame) sí resuelve el péndulo
    // NO lineal, así que su período animado es el exacto: 2,3678 s. Medido: 2,369 s.
    const animado = await medirPeriodoAnimado(page, 7000);
    expect(animado).toBeGreaterThan(2.3);
    expect(animado).toBeLessThan(2.45);

    // Es decir: la misma pantalla enseña 2,006 s y mueve el péndulo a 2,368 s.
    expect(animado).toBeGreaterThan(2.2); // > 2,006 s + margen: no son el mismo número
  });

  test('bajo «pequeños ángulos» la animación sí va al ritmo de la cifra mostrada', async ({
    page,
  }) => {
    test.setTimeout(45000);

    await sembrarValor(page, '#damp', 0);
    await sembrarValor(page, '#ang', 90);
    await page.getByRole('button', { name: /Aproximación pequeños ángulos/ }).click();
    await page.getByRole('button', { name: /Reiniciar/ }).click();

    // Esta pestaña usa la solución cerrada θ(t) = θ₀·cos(ω₀t): período 2,006 s aunque
    // la amplitud sea de 90°, que es justo lo que la aproximación NO puede sostener.
    const animado = await medirPeriodoAnimado(page, 7000);
    expect(animado).toBeGreaterThan(1.95);
    expect(animado).toBeLessThan(2.06);
  });
});

test.describe('Caso 3 — a rechazar: gravedad cero o negativa', () => {
  test('g = 0 se sustituye por 9,81 sin decirlo', async ({ page }) => {
    // Primero se mueve a un valor distinto del inicial, para que la prueba no dé verde
    // sin haber cambiado nada: g = 2,00 m/s² → T = 2π·√(1/2) = 4,442883 s.
    await page.locator('#grav').fill('2');
    await esperarValorEnReact(page, '#grav', '2');
    await expect.poll(() => leerFila(page, 'Período T')).toBe('4,443 s');

    // Ahora la entrada imposible. Esperado: rechazo explícito («la gravedad no puede ser
    // cero») o al menos un aviso. Obtenido: el campo salta a 9,81 y el período vuelve al
    // de la Tierra, sin un solo mensaje — el usuario cree haber simulado gravedad nula.
    await page.locator('#grav').fill('0');
    await esperarValorEnReact(page, '#grav', '9.81');
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,006 s');

    // La etiqueta del propio control acaba mostrando «9,81 m/s²», como si el usuario
    // lo hubiera tecleado él. Y en toda la herramienta no queda rastro de por qué.
    await expect(page.locator('label[for="grav"]')).toContainText('9,81 m/s²');
    const textoHerramienta = (await page.locator('main').innerText()).toLowerCase();
    expect(textoHerramienta).not.toContain('no puede ser');
    expect(textoHerramienta).not.toContain('no válid');
    expect(textoHerramienta).not.toContain('gravedad nula');
  });

  test('g negativa no se rechaza: las tres cifras quedan en «No definido»', async ({ page }) => {
    await page.locator('#grav').fill('-5');
    await esperarValorEnReact(page, '#grav', '-5');

    // ω₀ = √(−5/1) = NaN, y formatNumber lo imprime como «No definido» conservando la
    // unidad. No se muestra ningún número falso, pero tampoco se explica nada ni se
    // detiene la animación, que se va en fuga (θ crece sin límite).
    await expect.poll(() => leerFila(page, 'Período T')).toBe('No definido s');
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('No definido Hz');
    await expect.poll(() => leerFila(page, 'Frecuencia angular ω')).toBe('No definido rad/s');
  });

  test('la longitud no puede ser cero: el deslizador la capa en su mínimo de 0,10 m', async ({
    page,
  }) => {
    // Pedir L = 0 daría ω₀ = √(g/0) = ∞. El <input type="range"> lo recorta a min=0,1
    // antes de que React lo vea, así que el caso imposible nunca llega al cálculo.
    await sembrarValor(page, '#long', 0, { esperado: '0.1' });

    // T = 2π·√(0,10/9,81) = 0,634371 s · ω₀ = √98,1 = 9,904544 rad/s
    await expect.poll(() => leerFila(page, 'Período T')).toBe('0,634 s');
    await expect.poll(() => leerFila(page, 'Frecuencia angular ω')).toBe('9,905 rad/s');
  });
});
