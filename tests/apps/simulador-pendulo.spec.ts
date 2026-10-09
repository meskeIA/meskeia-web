import { test, expect, Page, Locator } from '@playwright/test';
import { PUERTO } from './_puerto';
import {
  esperarHidratacion,
  esperarPaginaAsentada,
  esperarValorEnReact,
  sembrarValor,
} from './_hidratacion';

/**
 * stemum.com → el servidor local, para ver la app como la sirve el portal (data-brand="stemum"
 * y la píldora «Stemum › Física» en la barra fija). Va al NIVEL DEL FICHERO porque
 * `launchOptions` fuerza un worker nuevo; al resto de tests no les afecta: solo resuelve ese host.
 */
test.use({ launchOptions: { args: [`--host-resolver-rules=MAP stemum.com 127.0.0.1:${PUERTO}`] } });

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
 *
 * RE-INSPECCIÓN 02/10/2026 (invalidada por los lotes de CSS b7733c6d, 586a4d61, 3de36a1f y
 * a1d72a9c): bloque del final del fichero, con sus casos resueltos a mano, el hero medido bajo
 * meskeia.com y bajo stemum.com, y los hallazgos que abrió (test.fail).
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
    // (Con el rozamiento de fábrica, γ = 0,05, la primera oscilación dura 2,009772 s: también
    // «2,010 s». El efecto del rozamiento lo fija el bloque del hallazgo 2638, más abajo.)
    // f = 1/T = 0,497536 Hz
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('0,498 Hz');
    // ω = 2π·f = 2π/2,009905 = 3,126096 rad/s: la pulsación a la que oscila (hallazgo 2640).
    // Con γ = 0,05, 2π/2,009772 = 3,126303: también «3,126».
    await expect.poll(() => leerFila(page, 'Frecuencia angular ω')).toBe('3,126 rad/s');
    // ω₀ = √(9,81/1,00) = 3,132092 rad/s, la pulsación natural, en su propia fila
    await expect.poll(() => leerFila(page, 'Frecuencia natural ω₀')).toBe('3,132 rad/s');

    // 10° ≤ 15°: la aproximación vale y la app no debe avisar de nada.
    await expect(page.getByText(/fuera de la aproximación de pequeños ángulos/)).toHaveCount(0);
  });

  test('la masa no entra en el período (sí en la energía)', async ({ page }) => {
    await sembrarValor(page, '#ang', 10);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,010 s');

    // d²θ/dt² = −(g/L)·sen θ no contiene m: subir la masa de 1 a 7 kg no puede mover T.
    await sembrarValor(page, '#masa', 7);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,010 s');
    await expect.poll(() => leerFila(page, 'Frecuencia natural ω₀')).toBe('3,132 rad/s');
  });

  test('la gravedad sí entra: con la Luna el período se alarga', async ({ page }) => {
    // Sin rozamiento, para que la cifra sea la de la integral elíptica. Con el γ = 0,05 de
    // fábrica, la primera oscilación dura 4,971 s: la amplitud cae un 12 % en esos 5 s y, con
    // ella, la corrección de amplitud (hallazgo 2638).
    await sembrarValor(page, '#damp', 0);
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
    // Sin rozamiento: con el γ = 0,05 de fábrica la amplitud cae de 90° a ~85° en la primera
    // oscilación y esta dura 2,341 s, no 2,368 (hallazgo 2638; golden en pendulo-motor.spec.ts).
    await sembrarValor(page, '#damp', 0);
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
    // Con el espacio duro U+00A0 antes del % (hallazgo 2643).
    await expect(aviso).toContainText('+18,03 %');
    await expect(aviso).toContainText('2,368 s');
    await expect(aviso).not.toContainText('+15,42');
  });

  test('a 60° la desviación también es la exacta', async ({ page }) => {
    await sembrarValor(page, '#ang', 60);

    const aviso = page.getByText(/está fuera de la aproximación de pequeños ángulos/);
    // θ₀ = π/3 → la serie truncada daba +6,85 % y 2,144 s; la exacta, +7,32 % y 2,153 s.
    await expect(aviso).toContainText('+7,32 %');
    await expect(aviso).toContainText('2,153 s');
  });

  test('la animación numérica va al mismo ritmo que la cifra que publica', async ({ page }) => {
    test.setTimeout(45000); // hay que dejar oscilar el péndulo unos segundos

    await sembrarValor(page, '#damp', 0); // sin fricción: el período no deriva
    await sembrarValor(page, '#ang', 90);
    await page.getByRole('button', { name: /Modelo numérico/ }).click();
    await page.getByRole('button', { name: /Reiniciar/ }).click();

    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,368 s');

    // El integrador (Runge-Kutta 4 con sub-pasos desde el 02/10/2026; antes Euler-Cromer con
    // el dt de un frame) resuelve el péndulo NO lineal, así que su período animado es el
    // exacto: 2,3678 s. Antes la pantalla enseñaba 2,006 s y
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

    // Esta pestaña usa la solución cerrada; sin rozamiento, θ(t) = θ₀·cos(ω₀t): período 2,006 s aunque
    // la amplitud sea de 90°, que es justo lo que la aproximación NO puede sostener.
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,006 s');
    const animado = await medirPeriodoAnimado(page, 7000);
    expect(animado).toBeGreaterThan(1.95);
    expect(animado).toBeLessThan(2.06);
  });
});

test.describe('Caso 3 — a rechazar: gravedad cero o negativa', () => {
  test('g = 0 se rechaza con motivo, en vez de sustituirse por 9,81', async ({ page }) => {
    await sembrarValor(page, '#damp', 0); // la cifra de abajo es la de la integral elíptica
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
    await sembrarValor(page, '#damp', 0); // la cifra de abajo es la de la integral elíptica
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
    // (Con el γ = 0,05 de fábrica, 0,639163 s: también «0,639».)
    await expect.poll(() => leerFila(page, 'Período T')).toBe('0,639 s');
    await expect.poll(() => leerFila(page, 'Frecuencia natural ω₀')).toBe('9,905 rad/s');
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

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN 02/10/2026 — vuelve a la cola INVALIDADA por cuatro lotes de CSS de catálogo
 * (b7733c6d, cabeceras de tabla; 586a4d61, 3de36a1f y a1d72a9c, el logo fijo sobre el título).
 * Ningún commit de lógica desde la reparación de los hallazgos 971-977 (aa10b2c7, 20/09), y
 * los siete se comprueban REPARADOS en el navegador con los bloques de arriba.
 *
 * Casos resueltos A MANO antes de abrir el navegador, con K(k) integrada por Simpson
 * (20.000 tramos) y cotejada con la serie de Legendre, sin usar el motor de la app:
 *
 * CASO 4 (normal) — L = 2,00 m · m = 2 kg · θ₀ = 30° · g = 9,81 · γ = 0.
 *   T₀ = 2π·√(2/9,81) = 2,837007 s · K(sen 15°) = 1,598142 → T = 4·√(2/9,81)·K = 2,886396 s
 *   f = 1/T = 0,346453 Hz · ω₀ = √(9,81/2) = 2,214723 rad/s · desviación +1,7409 %
 *   E₀ = m·g·L·(1 − cos 30°) = 2 × 9,81 × 2 × 0,133975 = 5,257163 J
 *
 * CASO 5 (límite) — los extremos de los controles.
 *   Júpiter (24,79) · L = 0,10 m · θ₀ = 90°: T₀ = 0,399063 s · T = T₀·(2/π)·K(sen 45°) =
 *   0,471030 s · f = 2,123005 Hz · ω₀ = 15,744840 rad/s · E₀ (1 kg) = 2,479 J
 *   Luna (1,62) · L = 5,00 m · θ₀ = 90° · m = 10 kg: T = 13,029109 s · ω₀ = 0,569210 rad/s ·
 *   E₀ = 10 × 1,62 × 5 × 1 = 81 J
 *   g = 100 (el tope que admite) · L = 0,10 · θ₀ = 45°: T = 4·√(0,001)·K(sen 22,5°) = 0,206634 s
 *
 * CASO 6 (rechazo) — g = 100,5 y g = 150 se rechazan («como mucho de 100»); L ≤ 0 y θ₀ fuera
 *   de [0°, 90°] los capan los deslizadores (bloques de arriba).
 *
 * EL HERO (lo que invalidó la app) — medido el 02/10/2026 de 320 a 1400 px de 4 en 4: ningún
 *   punto del h1 bajo la barra fija, ni en localhost ni en stemum.com. El hero de esta app baja
 *   el título a y = 99 desde 800 px (100 px de relleno), y la píldora «Stemum › Física» acaba en
 *   x = 232 e y = 77: no llega al título, ni siquiera de 1024 a 1060 px, donde la de Punnett sí.
 *
 * HALLAZGOS de esta re-inspección (2638-2648): REPARADOS el 02/10/2026. Cada uno tenía su
 * test.fail() abajo, que afirmaba lo CORRECTO; se ha retirado la marca y el comentario va en
 * pasado. Lo que cambió en el motor: el período publicado incluye el rozamiento (y desaparece
 * en régimen crítico o sobreamortiguado), ω es 2π·f con ω₀ en fila aparte, la solución cerrada
 * de pequeños ángulos es la de la ecuación amortiguada, y el integrador es Runge-Kutta 4 con
 * sub-pasos en vez de Euler-Cromer con el dt de un frame.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

const SIN_TRANSICIONES = '*, *::before, *::after { transition: none !important; animation: none !important; }';

/** Lee una cifra mostrada en formato español («2,886 s», «-0,5°», «5,257 J») como número. */
function aNumero(texto: string): number {
  return parseFloat(texto.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
}

/** Las tres cifras de energía (cinética, potencial, total) tal como se ven. */
async function energias(page: Page): Promise<string[]> {
  return (await page.locator('[class*="energyValue"]').allInnerTexts()).map((t) => t.trim());
}

interface Muestra {
  t: number;
  th: number;
  total: number;
}

/**
 * Muestrea en cada frame el reloj de la app («Tiempo transcurrido»), el ángulo de la CUERDA del
 * SVG —a precisión completa: el «θ actual» va redondeado a 0,1° y, con la amplitud amortiguada a
 * menos de 1°, adelanta los cruces por cero décimas de segundo— y la energía «Total», hasta que
 * el reloj de la app pase de `hastaT` segundos (o `maxMs` de reloj real).
 */
async function muestrear(page: Page, hastaT: number, maxMs = 25000): Promise<Muestra[]> {
  return page.evaluate(
    ({ hastaT, maxMs }) =>
      new Promise<Array<{ t: number; th: number; total: number }>>((resolver) => {
        const aNum = (s: string): number =>
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
        const salida: Array<{ t: number; th: number; total: number }> = [];
        const inicio = performance.now();
        const paso = (): void => {
          const cuerda = document.querySelectorAll('svg[aria-label="Animación del péndulo"] line')[1];
          const x1 = Number(cuerda?.getAttribute('x1'));
          const y1 = Number(cuerda?.getAttribute('y1'));
          const x2 = Number(cuerda?.getAttribute('x2'));
          const y2 = Number(cuerda?.getAttribute('y2'));
          const t = aNum(fila('Tiempo transcurrido'));
          const totales = document.querySelectorAll('[class*="energyValue"]');
          salida.push({
            t,
            th: Math.atan2(x2 - x1, y2 - y1),
            total: aNum(totales[2]?.textContent ?? ''),
          });
          if (!(t >= hastaT) && performance.now() - inicio < maxMs) requestAnimationFrame(paso);
          else resolver(salida);
        };
        requestAnimationFrame(paso);
      }),
    { hastaT, maxMs },
  );
}

/** Instantes (reloj de la app) en que la cuerda pasa por la vertical, por interpolación lineal. */
function crucesPorCero(m: Muestra[]): number[] {
  const cruces: number[] = [];
  for (let i = 1; i < m.length; i++) {
    const a = m[i - 1];
    const b = m[i];
    if (!(b.t > a.t) || !isFinite(a.th) || !isFinite(b.th)) continue; // el reloj volvió a 0 o no avanzó
    if ((a.th > 0 && b.th <= 0) || (a.th < 0 && b.th >= 0)) {
      cruces.push(a.t + (a.th / (a.th - b.th)) * (b.t - a.t));
    }
  }
  return cruces;
}

/** Reinicia y espera a que el reloj de la app haya vuelto a cero antes de muestrear. */
async function reiniciarYEsperar(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Reiniciar/ }).click();
  await expect
    .poll(async () => aNumero(await leerFila(page, 'Tiempo transcurrido')))
    .toBeLessThan(0.5);
}

/**
 * Contraste WCAG del color de un elemento —el del texto o, en un elemento SVG, el de su
 * `stroke`— contra CADA parada de su fondo: la caja de resultados es un degradado, y una sola
 * media escondería el extremo que no llega. Sube por los antecesores hasta el primer fondo opaco
 * o con degradado.
 */
async function contrastesContraFondo(locator: Locator): Promise<number[]> {
  return locator.evaluate((el) => {
    interface Rgba { r: number; g: number; b: number; a: number }
    const leer = (css: string): Rgba => {
      const p = (css.match(/[\d.]+/g) ?? []).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const canal = (c: number): number => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (c: Rgba): number => 0.2126 * canal(c.r) + 0.7152 * canal(c.g) + 0.0722 * canal(c.b);
    const ratio = (a: Rgba, b: Rgba): number => {
      const x = lum(a);
      const y = lum(b);
      return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2);
    };
    const fondos: Rgba[] = [];
    for (let n: Element | null = el; n && !fondos.length; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        for (const m of cs.backgroundImage.match(/rgba?\([^)]+\)/g) ?? []) fondos.push(leer(m));
        if (fondos.length) break;
      }
      const c = leer(cs.backgroundColor);
      if (c.a >= 1) fondos.push(c);
    }
    if (!fondos.length) fondos.push(leer(getComputedStyle(document.body).backgroundColor));
    // En un elemento SVG, el trazo CALCULADO: desde la reparación de 2648 viene de una clase
    // con variante oscura, no del atributo stroke, que ya no existe.
    const trazo = el instanceof SVGElement ? getComputedStyle(el).stroke : '';
    const color: Rgba =
      trazo && trazo !== 'none' ? leer(trazo) : leer(getComputedStyle(el).color);
    return fondos.map((f) => ratio(color, f));
  });
}

/** Pasa a oscuro con el botón real (un `data-theme` a mano lo pisa el gestor de tema). */
async function aOscuro(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
}

/** Cuántos puntos del texto del <h1> (muestreo de 4 en 4 px) caen bajo la barra fija del logo. */
async function tituloBajoLaBarra(page: Page): Promise<{ total: number; tapados: number }> {
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );
  return page.locator('h1').evaluate((h1) => {
    const barra = document.querySelector('[class*="headerBar"]');
    const rango = document.createRange();
    rango.selectNodeContents(h1);
    let total = 0;
    let tapados = 0;
    for (const q of Array.from(rango.getClientRects())) {
      for (let x = q.left + 2; x < q.right - 1; x += 4) {
        for (let y = q.top + 4; y < q.bottom - 3; y += 4) {
          total++;
          const e = document.elementFromPoint(x, y);
          if (e && barra?.contains(e)) tapados++;
        }
      }
    }
    return { total, tapados };
  });
}

/** Los anchos que se miden: los de móvil y tableta, y la franja 1024-1060 donde Punnett fallaba. */
const ANCHOS_HERO = [360, 390, 800, 1024, 1028, 1032, 1036, 1040, 1044, 1048, 1052, 1056, 1059, 1060, 1280];

test.describe('Péndulo · re-inspección 02/10/2026', () => {
  test('CASO 4 — normal: L = 2,00 m, m = 2 kg, θ₀ = 30°, sin rozamiento', async ({ page }) => {
    await sembrarValor(page, '#long', 2);
    await sembrarValor(page, '#masa', 2);
    await sembrarValor(page, '#ang', 30);
    await sembrarValor(page, '#damp', 0);

    // T = 4·√(2/9,81)·K(sen 15°) = 4 × 0,451524 × 1,598142 = 2,886396 s
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,886 s');
    // f = 1/2,886396 = 0,346453 Hz · ω = 2π·f = 2,176828 rad/s · ω₀ = √(9,81/2) = 2,214723 rad/s
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('0,346 Hz');
    await expect.poll(() => leerFila(page, 'Frecuencia angular ω')).toBe('2,177 rad/s');
    await expect.poll(() => leerFila(page, 'Frecuencia natural ω₀')).toBe('2,215 rad/s');

    // 30° > 15°: el aviso da la desviación exacta, 2,886396/2,837007 − 1 = +1,7409 %
    const aviso = page.getByText(/está fuera de la aproximación de pequeños ángulos/);
    await expect(aviso).toContainText('+1,74');
    await expect(aviso).toContainText('2,886 s');
    await expect(aviso).toContainText('2,837 s');

    // En t = 0 (pausado y reiniciado) toda la energía es potencial:
    // E₀ = m·g·L·(1 − cos 30°) = 2 × 9,81 × 2 × 0,133975 = 5,257163 J
    await page.getByRole('button', { name: 'Pausar simulación' }).click();
    await page.getByRole('button', { name: /Reiniciar/ }).click();
    await expect.poll(() => energias(page)).toEqual(['0,000 J', '5,257 J', '5,257 J']);

    // La pestaña lineal publica T₀ = 2π·√(2/9,81) = 2,837007 s y f₀ = 0,352484 Hz.
    await page.getByRole('button', { name: /Aproximación pequeños ángulos/ }).click();
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,837 s');
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('0,352 Hz');
  });

  test('CASO 4 bis — la animación sin rozamiento va al período que publica cada pestaña', async ({
    page,
  }) => {
    test.setTimeout(45000);
    await sembrarValor(page, '#long', 2);
    await sembrarValor(page, '#ang', 30);
    await sembrarValor(page, '#damp', 0);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,886 s');

    // Numérico: 2,886396 s. Con Euler-Cromer y el dt de un frame se midieron 2,8836 s el
    // 02/10/2026; con Runge-Kutta 4 y sub-pasos de T₀/1000 el error del integrador es
    // despreciable. Tolerancia ±1 %, por debajo del 1,7 % que separa este período del lineal.
    await reiniciarYEsperar(page);
    let c = crucesPorCero(await muestrear(page, 6.5));
    expect(c.length).toBeGreaterThanOrEqual(3);
    let animado = (2 * (c[c.length - 1] - c[0])) / (c.length - 1);
    expect(Math.abs(animado / 2.886396 - 1)).toBeLessThan(0.01);

    // Lineal: θ₀·cos(ω₀t) → 2,837007 s (medido 2,8345 s).
    await page.getByRole('button', { name: /Aproximación pequeños ángulos/ }).click();
    await reiniciarYEsperar(page);
    c = crucesPorCero(await muestrear(page, 6.5));
    expect(c.length).toBeGreaterThanOrEqual(3);
    animado = (2 * (c[c.length - 1] - c[0])) / (c.length - 1);
    expect(Math.abs(animado / 2.837007 - 1)).toBeLessThan(0.01);
  });

  test('CASO 5 — límite: Júpiter, L mínima (0,10 m) y θ₀ = 90°', async ({ page }) => {
    // Sin rozamiento: con el γ = 0,05 de fábrica la primera oscilación dura 0,469894 s (golden).
    await sembrarValor(page, '#damp', 0);
    await sembrarValor(page, '#long', 0.1);
    await sembrarValor(page, '#ang', 90);
    await page.getByRole('button', { name: /Júpiter/ }).click();
    await esperarValorEnReact(page, '#grav', '24.79');

    // T₀ = 2π·√(0,1/24,79) = 0,399063 s · T = T₀·(2/π)·K(sen 45°) = 0,471030 s
    await expect.poll(() => leerFila(page, 'Período T')).toBe('0,471 s');
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('2,123 Hz');
    // ω = 2π/0,471030 = 13,339 rad/s · ω₀ = √(24,79/0,1) = 15,744840 rad/s
    await expect.poll(() => leerFila(page, 'Frecuencia angular ω')).toBe('13,339 rad/s');
    await expect.poll(() => leerFila(page, 'Frecuencia natural ω₀')).toBe('15,745 rad/s');
    await expect(page.getByText(/está fuera de la aproximación de pequeños ángulos/)).toContainText(
      '+18,03',
    );

    // E₀ = 1 × 24,79 × 0,10 × (1 − cos 90°) = 2,479 J
    await page.getByRole('button', { name: 'Pausar simulación' }).click();
    await page.getByRole('button', { name: /Reiniciar/ }).click();
    await expect.poll(() => energias(page)).toEqual(['0,000 J', '2,479 J', '2,479 J']);

    await page.getByRole('button', { name: /Aproximación pequeños ángulos/ }).click();
    await expect.poll(() => leerFila(page, 'Período T')).toBe('0,399 s');
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('2,506 Hz');
  });

  test('CASO 5 bis — límite opuesto: Luna, L máxima (5,00 m), θ₀ = 90° y 10 kg', async ({ page }) => {
    // Sin rozamiento: con γ = 0,05 la amplitud cae a ~65° en la primera oscilación, que dura
    // 12,452 s (golden en pendulo-motor.spec.ts).
    await sembrarValor(page, '#damp', 0);
    await sembrarValor(page, '#long', 5);
    await sembrarValor(page, '#masa', 10);
    await sembrarValor(page, '#ang', 90);
    await page.getByRole('button', { name: /Luna/ }).click();
    await esperarValorEnReact(page, '#grav', '1.62');

    // T = 4·√(5/1,62)·K(sen 45°) = 4 × 1,756821 × 1,854075 = 13,029109 s · ω₀ = √0,324 = 0,569210
    await expect.poll(() => leerFila(page, 'Período T')).toBe('13,029 s');
    await expect.poll(() => leerFila(page, 'Frecuencia f')).toBe('0,077 Hz');
    // ω = 2π/13,029109 = 0,482240 rad/s · ω₀ = √0,324 = 0,569210 rad/s
    await expect.poll(() => leerFila(page, 'Frecuencia angular ω')).toBe('0,482 rad/s');
    await expect.poll(() => leerFila(page, 'Frecuencia natural ω₀')).toBe('0,569 rad/s');

    // E₀ = 10 × 1,62 × 5 × (1 − cos 90°) = 81 J
    await page.getByRole('button', { name: 'Pausar simulación' }).click();
    await page.getByRole('button', { name: /Reiniciar/ }).click();
    await expect.poll(() => energias(page)).toEqual(['0,000 J', '81,000 J', '81,000 J']);
  });

  test('CASO 5 ter y 6 — g = 100 es el tope que se acepta; 100,5 y 150 se rechazan', async ({ page }) => {
    await sembrarValor(page, '#damp', 0);
    await sembrarValor(page, '#long', 0.1);
    await sembrarValor(page, '#ang', 45);
    await page.locator('#grav').fill('100');
    await esperarValorEnReact(page, '#grav', '100');

    // T = 4·√(0,1/100)·K(sen 22,5°) = 4 × 0,0316228 × 1,633586 = 0,206634 s · ω₀ = √1000
    await expect.poll(() => leerFila(page, 'Período T')).toBe('0,207 s');
    await expect.poll(() => leerFila(page, 'Frecuencia natural ω₀')).toBe('31,623 rad/s');
    await expect(page.locator('#aviso-gravedad')).toHaveCount(0);

    for (const valor of ['100.5', '150']) {
      await page.locator('#grav').fill(valor);
      await esperarValorEnReact(page, '#grav', valor);
      const aviso = page.locator('#aviso-gravedad');
      await expect(aviso).toHaveAttribute('role', 'alert');
      await expect(aviso).toContainText('como mucho de 100');
    }
  });

  test('HERO — en meskeia.com el logo fijo no tapa el título de 360 a 1280 px', async ({ page }) => {
    await esperarPaginaAsentada(page);
    for (const ancho of ANCHOS_HERO) {
      await page.setViewportSize({ width: ancho, height: 900 });
      const m = await tituloBajoLaBarra(page);
      expect(m.total).toBeGreaterThan(100);
      expect(m.tapados, `${ancho} px: puntos del título bajo la barra fija`).toBe(0);
    }
  });

  // ─── Hallazgos abiertos el 02/10/2026 y REPARADOS el mismo día ─────────────────────────

  test('REPARADO (2638) — «Período T» incluye la amortiguación: Luna, L = 5 m, γ = 0,5', async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.getByRole('button', { name: /Luna/ }).click();
    await esperarValorEnReact(page, '#grav', '1.62');
    await sembrarValor(page, '#long', 5);
    await sembrarValor(page, '#ang', 5);
    await sembrarValor(page, '#damp', 0.5);

    // A mano: θ″ + γ·θ′ + (g/L)·θ = 0 con ω₀² = 1,62/5 = 0,324 y γ²/4 = 0,0625 →
    // ω_d = √(0,324 − 0,0625) = 0,511371 rad/s → T_d = 2π/ω_d = 12,287 s (a 5° la corrección
    // de amplitud es del 0,05 %). La animación numérica sí integra el −γ·θ′: medido el
    // 02/10/2026, cruza la vertical a los 3,95 s y a los 10,08 s → 12,26 s.
    // La app publicaba 4·√(5/1,62)·K(sen 2,5°) = 11,044 s, el del péndulo SIN rozamiento: un 10 %
    // menos de lo que se veía. Ahora publica la primera oscilación de la ecuación completa,
    // 12,289 s (golden); la lineal amortiguada da 12,287 s.
    await reiniciarYEsperar(page);
    const c = crucesPorCero(await muestrear(page, 10.6));
    expect(c.length).toBeGreaterThanOrEqual(2);
    const animado = 2 * (c[1] - c[0]);
    expect(animado).toBeGreaterThan(12.0);
    expect(animado).toBeLessThan(12.5);

    // Lo correcto: la cifra es la del péndulo que se ve oscilar (±1 %; el defecto era del 10 %).
    const publicado = aNumero(await leerFila(page, 'Período T'));
    expect(publicado).toBeCloseTo(12.289, 3);
    expect(Math.abs(publicado / animado - 1)).toBeLessThan(0.01);
  });

  test('REPARADO (2638) — en régimen sobreamortiguado no se publica período', async ({ page }) => {
    // g = 0,3 · L = 5 · γ = 0,5 · θ₀ = 10°: ω₀² = 0,3/5 = 0,06 < γ²/4 = 0,0625, así que
    // γ/2 = 0,25 > ω₀ = 0,244949 y el péndulo vuelve a la vertical sin cruzarla. La app publicaba
    // «Período T 25,700 s» y «Frecuencia f 0,039 Hz» sin aviso.
    await page.locator('#grav').fill('0.3');
    await esperarValorEnReact(page, '#grav', '0.3');
    await sembrarValor(page, '#long', 5);
    await sembrarValor(page, '#ang', 10);
    await sembrarValor(page, '#damp', 0.5);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('—');
    expect(await leerFila(page, 'Frecuencia f')).toBe('—');
    expect(await leerFila(page, 'Frecuencia angular ω')).toBe('—');
    // La pulsación natural sí existe: √0,06 = 0,244949
    expect(await leerFila(page, 'Frecuencia natural ω₀')).toBe('0,245 rad/s');
    await expect(page.getByText(/Régimen sobreamortiguado/)).toBeVisible();

    // Y la pestaña lineal tampoco: con la solución sobreamortiguada,
    // θ(10 s) = θ₀·e^(−2,5)·[cosh(0,5) + (0,25/0,05)·senh(0,5)], con β = √(0,0625 − 0,06) = 0,05,
    // = 10° × 0,082085 × (1,127626 + 5 × 0,521095) = 3,064° (la app daba −0,6°).
    await page.getByRole('button', { name: /Aproximación pequeños ángulos/ }).click();
    await expect.poll(() => leerFila(page, 'Período T')).toBe('—');
  });

  test('REPARADO (2639) — la solución cerrada de pequeños ángulos oscila con ω_d cuando hay rozamiento', async ({
    page,
  }) => {
    test.setTimeout(45000);
    await page.getByRole('button', { name: /Luna/ }).click();
    await esperarValorEnReact(page, '#grav', '1.62');
    await sembrarValor(page, '#long', 5);
    await sembrarValor(page, '#ang', 5);
    await sembrarValor(page, '#damp', 0.5);
    await page.getByRole('button', { name: /Aproximación pequeños ángulos/ }).click();

    // A mano, la ecuación LINEAL amortiguada con θ(0) = 5° y θ′(0) = 0:
    //   θ(t) = θ₀·e^(−γt/2)·[cos(ω_d·t) + (γ/2ω_d)·sen(ω_d·t)]
    // primer paso por la vertical en ω_d·t = π/2 + atan(0,25/0,511371) → t = 3,961 s (la pestaña
    // numérica, con los mismos datos y a 5°, cruza a los 3,95 s). La app dibujaba
    // θ₀·e^(−γt/2)·cos(ω₀·t), que no resuelve esa ecuación: cruzaba a π/(2ω₀) = 2,76 s (medido).
    await reiniciarYEsperar(page);
    const c = crucesPorCero(await muestrear(page, 4.6));
    expect(c.length).toBeGreaterThan(0);
    expect(c[0]).toBeGreaterThan(3.8);
    expect(c[0]).toBeLessThan(4.1);
  });

  test('REPARADO (2640) — en el modelo numérico, «Frecuencia angular ω» es 2π·f', async ({
    page,
  }) => {
    await sembrarValor(page, '#damp', 0); // el 2,368 s de abajo es el de la integral elíptica
    await sembrarValor(page, '#ang', 90);
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,368 s');

    // La tabla de la propia app: «ω = 2π·f». Con θ₀ = 90° la caja publicaba
    // f = 1/2,367842 = 0,422 Hz y ω = √9,81 = 3,132 rad/s, cuando 2π·f = 2,654 rad/s (y la
    // animación oscila a 2,654): un 18 % de diferencia entre dos cifras de la misma caja.
    // Ahora ω = 2π/2,367842 = 2,653549 → «2,654», y ω₀ = 3,132 va en su propia fila.
    await expect.poll(() => leerFila(page, 'Frecuencia angular ω')).toBe('2,654 rad/s');
    await expect.poll(() => leerFila(page, 'Frecuencia natural ω₀')).toBe('3,132 rad/s');
    const f = aNumero(await leerFila(page, 'Frecuencia f'));
    const w = aNumero(await leerFila(page, 'Frecuencia angular ω'));
    // ±0,5 %: el redondeo a 3 decimales de f mueve un 0,12 %; el defecto, un 18 %.
    expect(Math.abs(w / (2 * Math.PI * f) - 1)).toBeLessThan(0.005);
  });

  test('REPARADO (2641) — sin rozamiento, la energía total se conserva', async ({ page }) => {
    test.setTimeout(45000);
    await sembrarValor(page, '#long', 0.1);
    await sembrarValor(page, '#ang', 90);
    await sembrarValor(page, '#damp', 0);
    await page.getByRole('button', { name: /Júpiter/ }).click();
    await esperarValorEnReact(page, '#grav', '24.79');

    // E₀ = 1 × 24,79 × 0,10 × (1 − cos 90°) = 2,479 J. Con γ = 0, «Ec + Ep debe ser constante.
    // Es una buena prueba de tu modelo», dice el bloque educativo. Medido el 02/10/2026: «Total»
    // entre 2,215 y 2,792 J (−10,6 % / +12,6 %); con los valores de fábrica y γ = 0, entre 0,577 y
    // 0,607 J sobre 0,592 (±2,5 %). Era Euler-Cromer con el dt de un frame: oscilaba ±ω₀·dt/2.
    // Con Runge-Kutta 4 y sub-pasos, la deriva medida en diez minutos es menor de 1e-9.
    await reiniciarYEsperar(page);
    const totales = (await muestrear(page, 2.5)).map((m) => m.total).filter(Number.isFinite);
    expect(totales.length).toBeGreaterThan(60);
    // ±2 %: el defecto era de ±12 % en este caso; con tres decimales se lee siempre «2,479».
    expect(Math.min(...totales)).toBeGreaterThan(2.479 * 0.98);
    expect(Math.max(...totales)).toBeLessThan(2.479 * 1.02);
  });

  test('REPARADO (2642) — una gravedad rechazada ya no calcula', async ({ page }) => {
    await page.locator('#grav').fill('150');
    await esperarValorEnReact(page, '#grav', '150');
    await expect(page.locator('#aviso-gravedad')).toContainText('como mucho de 100');
    // Lo correcto: si la gravedad se rechaza, no se publica un período calculado con ella.
    // Obtenido el 02/10/2026: «Período T 0,517 s» (= 4·√(1/150)·K(sen 10°)) junto al aviso.
    expect(await leerFila(page, 'Período T')).not.toMatch(/\d/);
    expect(await energias(page)).toEqual(['—', '—', '—']);

    // Y con g = 0 el aviso de grandes ángulos se anuncia (role="alert") diciendo
    // «es un +No definido% mayor: ∞ s frente a los ∞ s de la fórmula lineal».
    await page.locator('#grav').fill('0');
    await esperarValorEnReact(page, '#grav', '0');
    await expect(page.locator('#aviso-gravedad')).toBeVisible();
    const avisos = await page.locator('main [role="alert"]').allInnerTexts();
    expect(avisos.filter((a) => /No definido|∞/.test(a))).toEqual([]);

    // Con g = −5 la energía salía negativa («Potencial -0,146 J»).
    await page.locator('#grav').fill('-5');
    await esperarValorEnReact(page, '#grav', '-5');
    await expect.poll(() => energias(page)).toEqual(['—', '—', '—']);
  });

  test('REPARADO (2643) — los porcentajes llevan el espacio duro antes del %', async ({ page }) => {
    // Estado de fábrica, θ₀ = 20°: 2,021451/2,006067 − 1 = +0,7669 % → «+0,77 %» con U+00A0
    // (CLAUDE.md global §2, 25/09/2026). Se obtenía «+0,77%», pegado.
    await expect(page.getByText(/está fuera de la aproximación de pequeños ángulos/)).toContainText(
      '+0,77 %',
    );
    // El consejo del bloque educativo («&lt; 1%») y el FAQPage («18 %» con espacio normal).
    expect(await page.locator('[class*="faqTip"]').nth(1).textContent()).toContain('1 %');
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('');
    expect(ld).toContain('18 %');
  });

  test('REPARADO (2644) — «Pausar» ya no se anuncia pulsado mientras la simulación corre', async ({
    page,
  }) => {
    const boton = page.getByRole('button', { name: 'Pausar simulación' });
    await expect(boton).toBeVisible();
    // Con la simulación en marcha, el lector leía «Pausar simulación, pulsado»: la pausa ACTIVA,
    // justo lo contrario. Un botón cuyo rótulo cambia con el estado no lleva aria-pressed.
    await expect(boton).not.toHaveAttribute('aria-pressed');
  });

  test('REPARADO (2644) — los presets de gravedad anuncian cuál está activo', async ({ page }) => {
    // «Tierra (9,81)» se veía marcado (.gravityActive) y no llevaba aria-pressed.
    await expect(page.getByRole('button', { name: 'Tierra (9,81)' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Luna (1,62)' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('REPARADO (2645) — emojis junto a texto con aria-hidden', async ({ page }) => {
    // Los tres 💡 de los consejos del bloque educativo y la ↺ de «Reiniciar», que entraba en su
    // nombre accesible («↺ Reiniciar»).
    const sueltos = await page.locator('[class*="faqTip"]').evaluateAll(
      (ps) =>
        ps.filter((p) =>
          Array.from(p.childNodes).some(
            (n) => n.nodeType === Node.TEXT_NODE && /💡/u.test(n.nodeValue ?? ''),
          ),
        ).length,
    );
    expect(sueltos).toBe(0);
    await expect(page.getByRole('button', { name: 'Reiniciar', exact: true })).toBeVisible();
  });

  test('REPARADO (2646) — texto blanco sobre el color de marca a 4,5:1 o más', async ({ page }) => {
    await page.addStyleTag({ content: SIN_TRANSICIONES });
    // Medido el 02/10/2026 en meskeia.com: «⏸ Pausar» (blanco sobre var(--secondary), el botón
    // que se ve al cargar) 2,80:1 en claro y 2,23:1 en oscuro; «▶ Iniciar» 4,11 y 2,79; el
    // preset activo 4,11 en claro. Bajo Stemum, «⏸ Pausar» 3,96 y «▶ Iniciar» 2,21 en oscuro.
    const fallan: string[] = [];
    const medir = async (tema: string, nombre: string, loc: Locator): Promise<void> => {
      const r = Math.min(...(await contrastesContraFondo(loc)));
      if (r < 4.5) fallan.push(`${tema} · ${nombre} ${r}:1`);
    };
    for (const tema of ['claro', 'oscuro']) {
      if (tema === 'oscuro') await aOscuro(page);
      await medir(tema, '⏸ Pausar', page.getByRole('button', { name: 'Pausar simulación' }));
      await medir(tema, 'preset activo', page.getByRole('button', { name: 'Tierra (9,81)' }));
      await page.getByRole('button', { name: 'Pausar simulación' }).click();
      await medir(tema, '▶ Iniciar', page.getByRole('button', { name: 'Iniciar simulación' }));
      await page.getByRole('button', { name: 'Iniciar simulación' }).click();
    }
    expect(fallan).toEqual([]);
  });

  test('REPARADO (2647) — texto en el color de marca a 4,5:1 o más, la cifra principal incluida', async ({
    page,
  }) => {
    await page.addStyleTag({ content: SIN_TRANSICIONES });
    // Medido el 02/10/2026 en meskeia.com: la cifra de «Período T» (var(--primary) sobre el
    // degradado #eff6ff → #f0fdf4) 3,77-3,92:1 en claro y 4,12-3,26:1 en oscuro; los valores de
    // los deslizadores 4,11:1 y la pestaña activa 3,93:1 en claro. Bajo Stemum pasan en claro.
    const fallan: string[] = [];
    const medir = async (tema: string, nombre: string, loc: Locator): Promise<void> => {
      const r = Math.min(...(await contrastesContraFondo(loc)));
      if (r < 4.5) fallan.push(`${tema} · ${nombre} ${r}:1`);
    };
    for (const tema of ['claro', 'oscuro']) {
      if (tema === 'oscuro') await aOscuro(page);
      await medir(tema, 'Período T', page.locator('[class*="resultValueAccent"]').first());
      await medir(tema, 'valor de L', page.locator('[class*="valueBadge"]').first());
      await medir(tema, 'pestaña activa', page.getByRole('button', { name: /Modelo numérico/ }));
      await medir(tema, 'escenario', page.locator('[class*="escenarioCard"] h4').first());
    }
    expect(fallan).toEqual([]);
  });

  test('REPARADO (2648) — en oscuro la cuerda del péndulo se ve', async ({ page }) => {
    // Sin transiciones: globals.css anima el background-color 0,3 s en `*`, y medir nada más
    // cambiar de tema lee el fondo claro a medio camino (así dio un falso verde el 02/10/2026).
    await page.addStyleTag({ content: SIN_TRANSICIONES });
    await aOscuro(page);
    // Era stroke="#374151" fijo en el SVG (page.tsx) sobre el #1a1a1a del escenario oscuro:
    // 1,69:1, por debajo de los 3:1 de un objeto gráfico (WCAG 1.4.11), y la línea de referencia
    // discontinua (#cbd5e1) se veía más que la propia cuerda: 11,72:1.
    const svg = page.locator('svg[aria-label="Animación del péndulo"]');
    const cuerda = svg.locator('line').nth(1);
    const cuerdaRatio = Math.min(...(await contrastesContraFondo(cuerda)));
    expect(cuerdaRatio).toBeGreaterThanOrEqual(3);
    // Y la guía no debe verse más que la cuerda.
    const referencia = Math.min(...(await contrastesContraFondo(svg.locator('line').nth(2))));
    expect(referencia).toBeLessThan(cuerdaRatio);
    // En claro, la cuerda sigue a ≥ 3:1.
    await page.getByRole('button', { name: 'Cambiar a modo claro' }).first().click();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
    expect(Math.min(...(await contrastesContraFondo(cuerda)))).toBeGreaterThanOrEqual(3);
  });
});

/**
 * Bajo stemum.com, el `next dev` local rechaza el WebSocket de HMR (`allowedDevOrigins` solo
 * admite meskeia.com) y, sin él, la página NO se hidrata: la píldora «Stemum › Física» no llega
 * a montarse (useStemumHost corre en un efecto). El puente reenvía el socket a localhost:3050,
 * que sí se acepta; no toca ninguna petición HTTP, así que lo que se mide es la página real.
 * Copiado de tests/apps/simulador-punnett.spec.ts (01/10/2026). Bajo `next start` no hay HMR y
 * el puente no intercepta nada.
 */
async function puenteHmr(page: Page): Promise<void> {
  const abiertos: WebSocket[] = [];
  page.on('close', () => abiertos.forEach((s) => s.close()));
  await page.routeWebSocket(/\/_next\/(webpack-)?hmr/, (ws) => {
    const u = new URL(ws.url());
    const arriba = new WebSocket(`ws://localhost:${PUERTO}${u.pathname}${u.search}`);
    arriba.binaryType = 'arraybuffer';
    abiertos.push(arriba);
    const cola: (string | Buffer)[] = [];
    arriba.onopen = () => {
      for (const m of cola) arriba.send(m);
      cola.length = 0;
    };
    ws.onMessage((m) => {
      if (arriba.readyState === WebSocket.OPEN) arriba.send(m);
      else cola.push(m);
    });
    arriba.onmessage = (e: MessageEvent) =>
      ws.send(typeof e.data === 'string' ? e.data : Buffer.from(e.data as ArrayBuffer));
    ws.onClose(() => arriba.close());
  });
}

test.describe('Péndulo · stemum.com · re-inspección 02/10/2026', () => {
  test.beforeEach(async ({ page }) => {
    await puenteHmr(page);
    await page.goto('http://stemum.com/simulador-pendulo/');
    await esperarPaginaAsentada(page);
    await expect(page.locator('html')).toHaveAttribute('data-brand', 'stemum');
    await expect(page.locator('[class*="stemumPill"]')).toBeVisible();
  });

  test('HERO bajo Stemum — la píldora «Stemum › Física» no pisa el título, tampoco de 1024 a 1060 px', async ({
    page,
  }) => {
    await expect(page.locator('[class*="stemumPill"]')).toContainText('Física');
    // La misma app, el mismo cálculo: T(20°) = 4·√(1/9,81)·K(sen 10°) = 2,021451 s
    await expect.poll(() => leerFila(page, 'Período T')).toBe('2,021 s');

    // Medido el 02/10/2026: la píldora acaba en x = 232 e y = 77, y el título empieza en y = 99
    // desde 800 px (en móvil, en y = 79 con la píldora hasta y = 59). En simulador-punnett la
    // de «Biología» llegaba a x = 253 y pisaba el título de 1024 a 1044 px (hallazgo 2589).
    for (const ancho of ANCHOS_HERO) {
      await page.setViewportSize({ width: ancho, height: 900 });
      const m = await tituloBajoLaBarra(page);
      expect(m.total).toBeGreaterThan(100);
      expect(m.tapados, `${ancho} px: puntos del título bajo la píldora`).toBe(0);
      const cajas = await page.evaluate(() => {
        const pildora = document.querySelector('[class*="stemumPill"]')?.getBoundingClientRect();
        const rango = document.createRange();
        rango.selectNodeContents(document.querySelector('h1') as Element);
        const titulo = rango.getBoundingClientRect();
        return {
          seCruzan:
            !!pildora &&
            pildora.right > titulo.left &&
            pildora.left < titulo.right &&
            pildora.bottom > titulo.top + 1,
          pildora: pildora ? [Math.round(pildora.right), Math.round(pildora.bottom)] : null,
          titulo: [Math.round(titulo.left), Math.round(titulo.top)],
        };
      });
      expect(cajas.seCruzan, `${ancho} px: píldora ${cajas.pildora} · título ${cajas.titulo}`).toBe(false);
    }
  });
});
