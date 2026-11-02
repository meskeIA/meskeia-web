import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';

/**
 * calculadora-movimiento — simulador de MRU / MRUA / caída libre (S0179, 05/10/2026).
 *
 * Los números de cada caso están resueltos a mano en tests/cinematica-motor.spec.ts; aquí se
 * comprueba que la PANTALLA dice lo mismo que el motor: tarjetas, aviso de parada, lectura del
 * simulador en cada instante y el final de la animación.
 *
 * El caso que motivó el cambio: v₀ = 20 m/s, a = −5 m/s², t = 6 s. La app imprimía
 * «Distancia 30 m» (el desplazamiento) cuando el móvil recorre 50 m: 40 hasta pararse en
 * t = 4 s y 10 de vuelta.
 */

const RUTA = '/calculadora-movimiento/';

async function rellenar(page: Page, id: string, valor: string) {
  const campo = page.locator(`#${id}`);
  await campo.fill(valor);
  await esperarValorEnReact(page, `#${id}`, valor);
}

/** Valor de una tarjeta de resultado por su etiqueta exacta. */
function tarjeta(page: Page, etiqueta: string) {
  return page
    .locator('[class*="resultCard"]')
    .filter({ has: page.locator('[class*="resultLabel"]', { hasText: new RegExp(`^${etiqueta}$`) }) })
    .locator('[class*="resultValue"]');
}

const lectura = (page: Page) => page.locator('[class*="simLectura"]');

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#mov-v0', '#mov-t']);
});

test.describe('MRUA que frena, se para y vuelve', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole('button', { name: /MRUA/ }).click();
    await rellenar(page, 'mov-v0', '20');
    await rellenar(page, 'mov-a', '-5');
    await rellenar(page, 'mov-t', '6');
  });

  test('las tarjetas separan desplazamiento (30 m) y distancia recorrida (50 m)', async ({ page }) => {
    await expect(tarjeta(page, 'Desplazamiento \\(x\\)')).toHaveText('30,00');
    await expect(tarjeta(page, 'Distancia recorrida')).toHaveText('50,00');
    await expect(tarjeta(page, 'Velocidad final')).toHaveText('-10,00');
    await expect(page.locator('[class*="notaParada"]')).toContainText('Se detiene en t = 4,00 s, a 40,00 m');
  });

  test('el simulador arranca en el estado final y el deslizador lleva a cualquier instante', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Simulación del movimiento/ })).toBeVisible();
    await expect(lectura(page)).toContainText('t = 6,00 s');
    await expect(lectura(page)).toContainText('x = 30,00 m');
    await expect(lectura(page)).toContainText('v = -10,00 m/s');

    // En la parada: x = 40 m, v = 0
    const deslizador = page.getByRole('slider');
    await deslizador.fill('4');
    await expect(lectura(page)).toContainText('t = 4,00 s');
    await expect(lectura(page)).toContainText('x = 40,00 m');
    await expect(lectura(page)).toContainText('v = 0,00 m/s');

    await page.getByRole('button', { name: /Al inicio/ }).click();
    await expect(lectura(page)).toContainText('t = 0,00 s');
    await expect(lectura(page)).toContainText('x = 0,00 m');
    await expect(lectura(page)).toContainText('v = 20,00 m/s');
  });

  test('la animación avanza y se detiene sola al llegar a t = 6 s', async ({ page }) => {
    await page.getByRole('button', { name: /Al inicio/ }).click();
    await page.getByRole('button', { name: /^Reproducir$/ }).click();
    await expect(page.getByRole('button', { name: /Pausa/ })).toBeVisible();
    // 6 s de movimiento se animan en 6 s reales (entre 3 y 8)
    await expect(page.getByRole('button', { name: /Reproducir de nuevo/ })).toBeVisible({ timeout: 12_000 });
    await expect(lectura(page)).toContainText('t = 6,00 s');
    await expect(lectura(page)).toContainText('x = 30,00 m');
  });

  test('aviso de vuelta y tres gráficas con descripción accesible', async ({ page }) => {
    await expect(page.locator('[class*="simAviso"]')).toContainText('se detiene en t = 4,00 s');
    const graficas = page.locator('[class*="simGraficas"] svg[role="img"]');
    await expect(graficas).toHaveCount(3);
    await expect(graficas.nth(0)).toHaveAttribute('aria-label', /Posición–tiempo .*parábola/);
    await expect(graficas.nth(1)).toHaveAttribute('aria-label', /pasa de 20,00 m\/s a -10,00 m\/s/);
    await expect(graficas.nth(2)).toHaveAttribute('aria-label', /a vale -5,00 m\/s²/);
  });
});

test('MRU: sin aceleración, la gráfica x-t es una recta', async ({ page }) => {
  await rellenar(page, 'mov-v0', '10');
  await rellenar(page, 'mov-t', '5');
  await expect(tarjeta(page, 'Desplazamiento \\(x\\)')).toHaveText('50,00');
  await expect(tarjeta(page, 'Distancia recorrida')).toHaveText('50,00');
  await expect(page.locator('[class*="notaParada"]')).toHaveCount(0);
  await expect(page.locator('[class*="simGraficas"] svg[role="img"]').first()).toHaveAttribute('aria-label', /en línea recta/);
});

test('caída libre lanzada hacia arriba a 10 m/s durante 2 s: sigue 0,38 m por encima y recorre 9,81 m', async ({ page }) => {
  await page.getByRole('button', { name: /Caída/ }).click();
  await rellenar(page, 'mov-v0', '-10');
  await rellenar(page, 'mov-t', '2');
  // Eje hacia abajo · subida v₀²/(2g) = 100/19,62 = 5,0968 m · y(2) = −20 + 19,62 = −0,38 m
  // distancia = 5,0968 (sube) + 5,0968 − 0,38 (baja) = 9,8137 m
  // (No t = 3 s: y(3) = 14,145 justo en la mitad, y en coma flotante es 14,1449… → «14,14»)
  await expect(tarjeta(page, 'Desplazamiento vertical \\(y\\)')).toHaveText('-0,38');
  await expect(tarjeta(page, 'Distancia recorrida')).toHaveText('9,81');
  await expect(tarjeta(page, 'Aceleración')).toHaveText('9,81');
  await expect(lectura(page)).toContainText('y = -0,38 m');
  await expect(page.locator('[class*="simAviso"]')).toContainText('se detiene en t = 1,02 s');
});

test('tiro parabólico: sin simulador propio, enlaza al de proyectiles', async ({ page }) => {
  await page.getByRole('button', { name: /Parabólico/ }).click();
  await rellenar(page, 'mov-v0', '20');
  await rellenar(page, 'mov-angulo', '45');
  await expect(tarjeta(page, 'Alcance')).toHaveText('40,77');
  await expect(page.getByRole('heading', { name: /Simulación del movimiento/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'simulador de tiro parabólico' })).toHaveAttribute('href', '/simulador-proyectiles/');
});

test('un tiempo no válido no deja simulador colgado', async ({ page }) => {
  await rellenar(page, 'mov-t', '0');
  await expect(page.getByText('Introduce la velocidad inicial y un tiempo mayor que 0')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Simulación del movimiento/ })).toHaveCount(0);
});

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector 02/11/2026 — primera inspección entera (modo «primera»)
 *
 * ESPERADOS resueltos a mano ANTES de mirar la app, con la g que la app declara (9,81 m/s²:
 * `G` de motor.ts y el recuadro de la caída libre). Eje de la caída hacia ABAJO (motor.ts).
 *
 *   CASO 1 (normal)
 *     MRUA v₀ = 4 m/s, a = 3 m/s², t = 6 s → v = 4 + 3·6 = 22 m/s · x = 4·6 + ½·3·36 = 24 + 54 = 78 m
 *                                        · no se para: distancia = 78 m · en t = 2 s: x = 8 + 6 = 14 m,
 *                                          v = 4 + 6 = 10 m/s
 *     MRU v = 12 m/s, t = 25 s            → x = 12·25 = 300 m (el caso 1 de los Casos para clase)
 *     Parabólico v₀ = 15 m/s, θ = 30°     → vₓ = 15·cos 30° = 12,990 · vᵧ = 15·sen 30° = 7,5
 *                                          · T = 2·7,5/9,81 = 1,529 s · H = 7,5²/19,62 = 2,867 m
 *                                          · R = 225·sen 60°/9,81 = 194,856/9,81 = 19,863 m → 19,86
 *     MRUA v₀ = 0, a = 3, t = 4           → x = ½·3·16 = 24 m · v_m = 24/4 = 6 m/s = v(2 s) = 3·2
 *   CASO 2 (límite)
 *     Frena y se para JUSTO en t: v₀ = 12, a = −3, t = 4 → t_parada = 12/3 = 4 s = t · v = 0
 *                                          · x = 48 − 24 = 24 m = distancia · sin aviso de vuelta
 *     Parte del reposo con a < 0: v₀ = 0, a = −2, t = 3 → v = −6 m/s · x = −9 m · distancia 9 m
 *     Caída desde el reposo, t = 1, 5, 7 s → y = 4,905·t² = 4,905 / 122,625 / 240,345 m; con el 5
 *                                          hacia arriba (el «halfExpand» por defecto de Intl, que usa
 *                                          formatNumber): 4,91 / 122,63 / 240,35 · v = 9,81·t =
 *                                          9,81 / 49,05 / 68,67 m/s
 *   CASO 3 (rechazo)
 *     t = −5 · t = «abc» · v₀ vacía       → sin tarjetas ni simulador: «Introduce la velocidad inicial
 *                                          y un tiempo mayor que 0»
 *     Parabólico a 90° y a 0°             → «Introduce una velocidad mayor que 0 y un ángulo entre 0° y 90°»
 *   CASOS PARA CLASE (además de calculadora-movimiento-casos.spec.ts)
 *     caso 4 → 78 m (132 es el error de olvidar el ½) · caso 12 → 35,31 m (34,64 es el de g = 10)
 *     «Verlo en la calculadora» del caso 6: MRUA 30 / −6 / 8 → se para en t = 30/6 = 5 s a
 *       30·5 − 3·25 = 75 m · x(8) = 240 − 192 = 48 m · distancia 75 + 27 = 102 m · v = −18 m/s
 *
 *   HALLAZGOS que quedan ABIERTOS (test.fail(): pasan a fallar el día que se reparen)
 *     · Se para JUSTO en t con decimales (0,6 m/s, −0,2 m/s², 3 s) y la app dice que vuelve.
 *     · El empate a la milésima se redondea según caiga la coma flotante: 44,145 → 44,14.
 *     · La guía dice «≈ 19,87 m» para el balón a 15 m/s y 30°; la propia app calcula 19,86.
 *     · Dos FAQPage en la página; las 8 preguntas de la FAQ visible, escritas otra vez en metadata.ts.
 *     · El FAQPage calcula la caída con g = 9,8 y la guía llama «valor oficial» a 9,81.
 *     · «más del 60 % de los problemas de cinemática», sin fuente.
 *     · «Galileo lo demostró: … F = m·a»: la segunda ley es de Newton (Principia, 1687).
 *     · «En MRUA [velocidad media e instantánea] solo coinciden si el intervalo es infinitesimal».
 *     · og:description promete el móvil animado también en el tiro parabólico, que no lo tiene.
 *     · MRUA con la aceleración vacía: el aviso pide la velocidad y el tiempo, que ya están puestos.
 *     · Los emojis de los Ejemplos Rápidos entran en el nombre accesible del botón.
 * ══════════════════════════════════════════════════════════════════════════════════════════ */

/** Texto de la guía educativa: se monta siempre en el DOM, también colapsada. */
async function textoGuia(page: Page): Promise<string> {
  return (await page.locator('[data-guia-educativa]').textContent()) ?? '';
}

/** Todos los bloques JSON-LD de la página, en un solo texto. */
async function textoJsonLd(page: Page): Promise<string> {
  return (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
}

const avisoSinCifra = (page: Page) => page.locator('[class*="resultsPanel"] [class*="placeholder"] p');

test.describe('Inspector 02/11/2026 · casos resueltos a mano', () => {
  test('CASO 1 (normal) · MRUA 4 m/s + 3 m/s² durante 6 s: 22 m/s y 78 m; en t = 2 s, 14 m a 10 m/s', async ({ page }) => {
    await page.getByRole('button', { name: /MRUA/ }).click();
    await rellenar(page, 'mov-v0', '4');
    await rellenar(page, 'mov-a', '3');
    await rellenar(page, 'mov-t', '6');
    await expect(tarjeta(page, 'Velocidad final')).toHaveText('22,00');
    await expect(tarjeta(page, 'Desplazamiento \\(x\\)')).toHaveText('78,00');
    await expect(tarjeta(page, 'Distancia recorrida')).toHaveText('78,00');
    await expect(tarjeta(page, 'Aceleración')).toHaveText('3,00');
    await expect(tarjeta(page, 'Tiempo')).toHaveText('6,00');
    await expect(page.locator('[class*="notaParada"]')).toHaveCount(0);

    await sembrarValor(page, page.getByRole('slider'), '2');
    await expect(lectura(page)).toContainText('t = 2,00 s');
    await expect(lectura(page)).toContainText('x = 14,00 m');
    await expect(lectura(page)).toContainText('v = 10,00 m/s');
  });

  test('CASO 1 (normal) · MRU a 12 m/s durante 25 s: 300 m', async ({ page }) => {
    await rellenar(page, 'mov-v0', '12');
    await rellenar(page, 'mov-t', '25');
    await expect(tarjeta(page, 'Velocidad')).toHaveText('12,00');
    await expect(tarjeta(page, 'Desplazamiento \\(x\\)')).toHaveText('300,00');
    await expect(tarjeta(page, 'Distancia recorrida')).toHaveText('300,00');
    await expect(tarjeta(page, 'Tiempo')).toHaveText('25,00');
  });

  test('CASO 1 (normal) · tiro parabólico a 15 m/s y 30°: 12,99 / 7,50 m/s, 1,53 s, 2,87 m y 19,86 m', async ({ page }) => {
    await page.getByRole('button', { name: /Parabólico/ }).click();
    await rellenar(page, 'mov-v0', '15');
    await rellenar(page, 'mov-angulo', '30');
    await expect(tarjeta(page, 'Velocidad X')).toHaveText('12,99');
    await expect(tarjeta(page, 'Velocidad Y inicial')).toHaveText('7,50');
    await expect(tarjeta(page, 'Tiempo de Vuelo')).toHaveText('1,53');
    await expect(tarjeta(page, 'Altura Máxima')).toHaveText('2,87');
    await expect(tarjeta(page, 'Alcance')).toHaveText('19,86');
  });

  test('CASO 1 (normal) · en el MRUA la velocidad media de 0 a 4 s (24 m / 4 s = 6 m/s) es la instantánea en t = 2 s', async ({ page }) => {
    await page.getByRole('button', { name: /MRUA/ }).click();
    await rellenar(page, 'mov-v0', '0');
    await rellenar(page, 'mov-a', '3');
    await rellenar(page, 'mov-t', '4');
    await expect(tarjeta(page, 'Desplazamiento \\(x\\)')).toHaveText('24,00');
    await expect(tarjeta(page, 'Velocidad final')).toHaveText('12,00');
    await sembrarValor(page, page.getByRole('slider'), '2');
    await expect(lectura(page)).toContainText('v = 6,00 m/s');
  });

  test('CASO 2 (límite) · frena de 12 m/s con −3 m/s² y se para justo en t = 4 s: 24 m y sin aviso de vuelta', async ({ page }) => {
    await page.getByRole('button', { name: /MRUA/ }).click();
    await rellenar(page, 'mov-v0', '12');
    await rellenar(page, 'mov-a', '-3');
    await rellenar(page, 'mov-t', '4');
    await expect(tarjeta(page, 'Velocidad final')).toHaveText('0,00');
    await expect(tarjeta(page, 'Desplazamiento \\(x\\)')).toHaveText('24,00');
    await expect(tarjeta(page, 'Distancia recorrida')).toHaveText('24,00');
    await expect(page.locator('[class*="notaParada"]')).toHaveCount(0);
    await expect(page.locator('[class*="simAviso"]')).toHaveCount(0);
  });

  test('CASO 2 (límite) · parte del reposo con a = −2 m/s² durante 3 s: −6 m/s, −9 m y 9 m recorridos', async ({ page }) => {
    await page.getByRole('button', { name: /MRUA/ }).click();
    await rellenar(page, 'mov-v0', '0');
    await rellenar(page, 'mov-a', '-2');
    await rellenar(page, 'mov-t', '3');
    await expect(tarjeta(page, 'Velocidad final')).toHaveText('-6,00');
    await expect(tarjeta(page, 'Desplazamiento \\(x\\)')).toHaveText('-9,00');
    await expect(tarjeta(page, 'Distancia recorrida')).toHaveText('9,00');
    await expect(page.locator('[class*="notaParada"]')).toHaveCount(0);
  });

  test('CASO 2 (límite) · caída desde el reposo 1, 5 y 7 s: 4,91, 122,63 y 240,35 m', async ({ page }) => {
    await page.getByRole('button', { name: /Caída/ }).click();
    await rellenar(page, 'mov-v0', '0');
    await rellenar(page, 'mov-t', '1');
    await expect(tarjeta(page, 'Velocidad final')).toHaveText('9,81');
    await expect(tarjeta(page, 'Desplazamiento vertical \\(y\\)')).toHaveText('4,91');
    await rellenar(page, 'mov-t', '5');
    await expect(tarjeta(page, 'Velocidad final')).toHaveText('49,05');
    await expect(tarjeta(page, 'Desplazamiento vertical \\(y\\)')).toHaveText('122,63');
    await rellenar(page, 'mov-t', '7');
    await expect(tarjeta(page, 'Velocidad final')).toHaveText('68,67');
    await expect(tarjeta(page, 'Desplazamiento vertical \\(y\\)')).toHaveText('240,35');
  });

  test('CASO 3 (rechazo) · t = −5, t = «abc» y v₀ vacía no dan cifra ni simulador', async ({ page }) => {
    for (const [campo, valor] of [['mov-t', '-5'], ['mov-t', 'abc']] as const) {
      await rellenar(page, campo, valor);
      await expect(avisoSinCifra(page)).toHaveText('Introduce la velocidad inicial y un tiempo mayor que 0');
      await expect(page.locator('[class*="resultCard"]')).toHaveCount(0);
      await expect(page.getByRole('heading', { name: /Simulación del movimiento/ })).toHaveCount(0);
    }
    await rellenar(page, 'mov-t', '3');
    await rellenar(page, 'mov-v0', '');
    await expect(avisoSinCifra(page)).toHaveText('Introduce la velocidad inicial y un tiempo mayor que 0');
    await expect(page.locator('[class*="resultCard"]')).toHaveCount(0);
    await expect(page.locator('[class*="resultsPanel"]')).not.toContainText(/NaN|No definido|Infinity/);
  });

  test('CASO 3 (rechazo) · tiro parabólico a 90° o a 0°: pide un ángulo entre 0° y 90°', async ({ page }) => {
    await page.getByRole('button', { name: /Parabólico/ }).click();
    await rellenar(page, 'mov-v0', '20');
    for (const angulo of ['90', '0']) {
      await rellenar(page, 'mov-angulo', angulo);
      await expect(avisoSinCifra(page)).toHaveText('Introduce una velocidad mayor que 0 y un ángulo entre 0° y 90°');
      await expect(page.locator('[class*="resultCard"]')).toHaveCount(0);
    }
  });

  test('Casos para clase · caso 4 (78 m; 132 es olvidar el ½) y caso 12 (35,31 m; 34,64 es usar g = 10)', async ({ page }) => {
    await esperarHidratacion(page, ['#casos-respuesta']);
    const caja = page.locator('#casos-respuesta');
    const veredicto = page.locator('#casos-veredicto');
    const responder = async (texto: string) => {
      await caja.fill(texto);
      await esperarValorEnReact(page, caja, texto);
      await page.locator('#casos-comprobar').click();
    };

    await page.getByRole('button', { name: /^Caso 4:/ }).click();
    await responder('132');
    await expect(veredicto).toContainText('No es correcto');
    await responder('78');
    await expect(veredicto).toContainText('¡Correcto!');

    await page.getByRole('button', { name: /^Caso 12:/ }).click();
    await responder('34,64');
    await expect(veredicto).toContainText('g = 10');
    await responder('35,31');
    await expect(veredicto).toContainText('¡Correcto!');
  });

  test('Casos para clase · lo que dice «Verlo en la calculadora» del caso 6 es lo que marca la calculadora', async ({ page }) => {
    await page.getByRole('button', { name: /MRUA/ }).click();
    await rellenar(page, 'mov-v0', '30');
    await rellenar(page, 'mov-a', '-6');
    await rellenar(page, 'mov-t', '8');
    await expect(page.locator('[class*="notaParada"]')).toContainText('Se detiene en t = 5,00 s, a 75,00 m');
    await expect(tarjeta(page, 'Desplazamiento \\(x\\)')).toHaveText('48,00');
    await expect(tarjeta(page, 'Distancia recorrida')).toHaveText('102,00');
    await expect(tarjeta(page, 'Velocidad final')).toHaveText('-18,00');
  });
});

test.describe('Inspector 02/11/2026 · hallazgos abiertos', () => {
  test('HALLAZGO (02/11/2026, ABIERTO) · se para justo en t = 3 s (0,6 m/s con −0,2 m/s²) y la app dice que «vuelve»', async ({ page }) => {
    // t_parada = 0,6/0,2 = 3 s = t: no hay vuelta (motor.ts lo dice en distanciaRecorrida: «Si se
    // para EXACTAMENTE en t, no hay vuelta que sumar»). Pero en coma flotante −0,6/−0,2 =
    // 2,9999999999999996 < 3, así que resolverRectilineo marca la parada «dentro» y la página dice
    // «Se detiene en t = 3,00 s, a 0,90 m del origen, y vuelve: la distancia recorrida (0,90 m) es
    // mayor que el desplazamiento (0,90 m)»; el simulador, «después se mueve en sentido contrario».
    // La tarjeta «Velocidad final» sale «≈0» en vez de 0,00.
    test.fail();
    await page.getByRole('button', { name: /MRUA/ }).click();
    await rellenar(page, 'mov-v0', '0,6');
    await rellenar(page, 'mov-a', '-0,2');
    await rellenar(page, 'mov-t', '3');
    await expect(tarjeta(page, 'Desplazamiento \\(x\\)')).toHaveText('0,90');
    await expect(tarjeta(page, 'Distancia recorrida')).toHaveText('0,90');
    expect(await page.locator('[class*="notaParada"]').count()).toBe(0);
    expect(await page.locator('[class*="simAviso"]').count()).toBe(0);
    expect(await tarjeta(page, 'Velocidad final').textContent()).toBe('0,00');
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · caída desde el reposo 3 s: y = 44,145 m sale 44,14 (y 4,905 sale 4,91)', async ({ page }) => {
    // y = ½·9,81·3² = 44,145 m exactos. formatNumber redondea con el 5 hacia arriba (4,905 → 4,91,
    // 122,625 → 122,63: el CASO 2 de arriba), pero aquí recibe 44,14499… de la coma flotante y da
    // 44,14. Igual en el ejemplo «🏀 Lanzado hacia arriba» (v₀ = −10, t = 3): y = −30 + 44,145 =
    // 14,145 → la app 14,14. El mismo empate se redondea hacia un lado u otro según el binario.
    test.fail();
    await page.getByRole('button', { name: /Caída/ }).click();
    await rellenar(page, 'mov-v0', '0');
    await rellenar(page, 'mov-t', '3');
    await expect(tarjeta(page, 'Velocidad final')).toHaveText('29,43');
    expect(await tarjeta(page, 'Desplazamiento vertical \\(y\\)').textContent()).toBe('44,15');

    await page.getByRole('button', { name: /Lanzado hacia arriba/ }).click();
    await expect(tarjeta(page, 'Velocidad final')).toHaveText('19,43');
    expect(await tarjeta(page, 'Desplazamiento vertical \\(y\\)').textContent()).toBe('14,15');
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · la guía da «≈ 19,87 m» al balón de 15 m/s y 30°, y la app calcula 19,86', async ({ page }) => {
    // 225·sen 60°/9,81 = 194,856/9,81 = 19,863 → 19,86 (el CASO 1 de arriba lo comprueba en la
    // tarjeta «Alcance»). Con el 0,866 que escribe la propia guía: 194,85/9,81 = 19,862 → 19,86.
    test.fail();
    expect(await textoGuia(page)).not.toContain('19,87');
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · dos FAQPage en la página, y la FAQ visible escrita dos veces', async ({ page }) => {
    // metadata.ts monta un FAQPage de 8 preguntas dentro del @graph de `jsonLd` (las mismas de la FAQ
    // visible de page.tsx, copiadas, sin las notas «ángulos complementarios» ni «Inverso: m/s × 3,6»)
    // y otro de 5 en `faqJsonLd`. Esperado: uno solo, con la FAQ visible en una constante.
    test.fail();
    let faqs = 0;
    const contar = (nodo: unknown): void => {
      if (Array.isArray(nodo)) return nodo.forEach(contar);
      if (nodo && typeof nodo === 'object') {
        const o = nodo as Record<string, unknown>;
        if (o['@type'] === 'FAQPage') faqs += 1;
        if (o['@graph']) contar(o['@graph']);
      }
    };
    for (const bloque of await page.locator('script[type="application/ld+json"]').allTextContents()) {
      contar(JSON.parse(bloque));
    }
    expect(faqs).toBe(1);
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · el FAQPage calcula la caída con g = 9,8 y la guía llama «valor oficial» a 9,81', async ({ page }) => {
    // La app calcula con g = 9,81 (motor.ts) y lo declara en el recuadro de la caída libre; el
    // FAQPage dice «g = 9,8 m/s²» y la guía, «El valor oficial es g = 9,81 m/s²», sin fuente.
    test.fail();
    expect(await textoJsonLd(page)).not.toContain('g = 9,8 m/s²');
    expect(await textoGuia(page)).not.toContain('El valor oficial es g = 9,81');
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · «más del 60 % de los problemas de cinemática», sin fuente', async ({ page }) => {
    test.fail();
    expect(await textoGuia(page)).not.toMatch(/más del 60\s%/);
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · «Galileo lo demostró» con F = m·a, que es la segunda ley de Newton', async ({ page }) => {
    // Galileo murió en 1642; F = m·a es de los Principia de Newton (1687). La respuesta está en la
    // FAQ visible y en el FAQPage del @graph.
    test.fail();
    expect(await textoGuia(page)).not.toMatch(/Galileo lo demostró: la fuerza gravitacional es F = m·g, pero también F = m·a/);
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · «en MRUA solo coinciden si el intervalo es infinitesimalmente pequeño»', async ({ page }) => {
    // En el MRUA la velocidad media de un intervalo es la instantánea en su punto medio, para
    // cualquier duración: de 0 a 4 s con a = 3, 24 m / 4 s = 6 m/s = v(2 s) (CASO 1 de arriba,
    // medido con el deslizador de la propia app).
    test.fail();
    expect(await textoGuia(page)).not.toContain('solo coinciden si el intervalo es infinitesimalmente pequeño');
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · og:description promete el móvil animado también en el tiro parabólico', async ({ page }) => {
    // «MRU, MRUA, caída libre y tiro parabólico con el móvil animado y las gráficas x-t, v-t y a-t
    // sincronizadas». El parabólico no tiene simulador: enlaza a /simulador-proyectiles/ (test de
    // arriba «tiro parabólico: sin simulador propio»).
    test.fail();
    const og = (await page.locator('meta[property="og:description"]').getAttribute('content')) ?? '';
    expect(og).not.toMatch(/tiro parabólico con el móvil animado/);
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · MRUA con la aceleración vacía: el aviso pide la velocidad y el tiempo, ya puestos', async ({ page }) => {
    test.fail();
    await page.getByRole('button', { name: /MRUA/ }).click();
    await rellenar(page, 'mov-a', '');
    await expect(page.locator('[class*="resultCard"]')).toHaveCount(0);
    expect((await avisoSinCifra(page).textContent()) ?? '').toMatch(/aceleración/i);
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · el emoji de cada Ejemplo Rápido entra en el nombre accesible del botón', async ({ page }) => {
    // `{ej.nombre}` pinta «⚽ Pelota lanzada» como texto suelto: el lector dice «balón de fútbol,
    // Pelota lanzada». Regla del CLAUDE.md §5: el emoji junto a texto, en <span aria-hidden="true">.
    test.fail();
    expect(await page.getByRole('button', { name: 'Pelota lanzada', exact: true }).count()).toBe(1);
    expect(await page.getByRole('button', { name: 'Lanzado hacia arriba', exact: true }).count()).toBe(1);
  });
});
