import { test, expect, Page } from '@playwright/test';
import {
  esperarHidratacion,
  esperarValorEnReact,
  sembrarValor,
  sembrarValorAcotado,
} from './_hidratacion';

/**
 * Simulador de Proyectiles 2D — inspección del 20/09/2026
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Simulador de Proyectiles 2D» y el subtítulo «Ajusta velocidad, ángulo,
 *   gravedad y resistencia del aire». La metadata añade altura de lanzamiento y presets de
 *   gravedad (Tierra, Luna, Marte, Júpiter). La caja de resultados da cinco cifras: alcance
 *   horizontal, altura máxima, tiempo de vuelo, velocidad de impacto y energía cinética por
 *   unidad de masa. Las tres primeras son las que enseña cualquier libro de cinemática, y
 *   son las que estos casos fijan.
 *
 * LA FÍSICA, RESUELTA A MANO ANTES DE ABRIR EL NAVEGADOR
 *   Tiro parabólico sin rozamiento (Tipler, «Física», cap. 3 · Serway, cap. 4):
 *       x(t) = v₀·cosθ·t
 *       y(t) = h₀ + v₀·senθ·t − ½·g·t²
 *       T    = (v₀·senθ + √(v₀²·sen²θ + 2·g·h₀)) / g     ← raíz positiva de y(T) = 0
 *       R    = v₀·cosθ·T
 *       H    = h₀ + v₀²·sen²θ / (2g)
 *   Con h₀ = 0 la cuadrática se simplifica a T = 2·v₀·senθ/g y R = v₀²·sen(2θ)/g, que es la
 *   forma que la app muestra en su caja de fórmulas. Con h₀ > 0 esa forma YA NO VALE y hay
 *   que resolver la cuadrática completa: es la primera trampa que estos casos comprueban.
 *
 *   Caso normal · v₀ = 20 m/s, θ = 45°, h₀ = 0, g = 9,81 m/s²
 *       v₀ₓ = v₀ᵧ = 20·√2/2 = 14,142136 m/s
 *       R = 400·sen90°/9,81 = 400/9,81   = 40,774720 m → «40,77 m»
 *       H = 400·0,5/19,62                = 10,193680 m → «10,19 m»
 *       T = 2·14,142136/9,81             =  2,883246 s → «2,88 s»
 *       v_impacto = v₀ (simetría)        = 20,000000 m/s → «20,00 m/s»
 *
 *   Caso límite · θ = 90° (tiro vertical): R = 0 m exactos · H = 400/19,62 = 20,387360 m ·
 *   T = 2·20/9,81 = 4,077472 s.  θ = 0° con h₀ = 0: el proyectil ya está en el suelo, así
 *   que T = 0 y R = 0.  v₀ = 0 no se puede pedir: el deslizador tiene min = 1.
 *
 *   Caso a rechazar · gravedad imposible. Los tres deslizadores acotan solos (v₀ 1–100,
 *   θ 0–90, h₀ 0–100), así que la única entrada que puede salirse de madre es la gravedad,
 *   que es un <input type="number"> libre. Y ahí la app no valida nada.
 *
 * LAS DOS TRAMPAS DEL SEGMENTO, COMPROBADAS EXPRESAMENTE
 *   (a) ALTURA INICIAL. Con h₀ = 30 m, v₀ = 20 m/s y θ = 45°:
 *         disc = 200 + 2·9,81·30 = 788,6  →  √disc = 28,082023
 *         T = (14,142136 + 28,082023)/9,81 = 4,304196 s
 *         R = 14,142136 · 4,304196         = 60,870459 m
 *       La fórmula ingenua R = v₀²sen(2θ)/g daría 40,77 m: un 33 % menos. La app resuelve
 *       la cuadrática y da 60,87 m ✅. Y el óptimo deja de estar en 45°: a 35° el alcance
 *       sube a 63,98 m. La guía educativa lo dice con todas las letras en cuatro sitios
 *       («Solo cuando salida y llegada están a la misma altura»), así que no hay promesa
 *       incumplida. Ambas cosas quedan fijadas abajo.
 *
 *   (b) RESISTENCIA DEL AIRE. No es un rótulo: al activarla la app cambia de rama y integra
 *       numéricamente (Euler semi-implícito, dt = 0,01 s) con a = −g·ĵ − k·|v|·v⃗. Con
 *       k = 0,05 el alcance cae de 40,77 m a 17,33 m, que es una diferencia imposible de
 *       fingir. ⚠️ Pero el coeficiente k arranca en 0, así que el primer instante tras pulsar
 *       «Con resistencia del aire» sigue siendo el caso ideal (40,73 m, la diferencia es el
 *       sesgo del integrador). Se fija también ese estado intermedio.
 *
 * LO QUE ESTOS CASOS DEJARON AL DESCUBIERTO
 *   · Vaciar el campo de gravedad CUELGA la pestaña (Number('') === 0 → T = ∞ → bucle
 *     infinito). Crítico y trivial de provocar. Último bloque de este fichero.
 *   · Una gravedad negativa produce alcance y tiempo de vuelo NEGATIVOS sin un solo aviso.
 *   · La caja de fórmulas llama «modelo lineal» a un rozamiento que el código implementa
 *     cuadrático (−k·|v|·v⃗), contradiciendo a la propia FAQ de la app.
 *   · Añadir dos veces el mismo lanzamiento a la comparativa da dos tarjetas con el mismo
 *     id, y borrar una borra las dos.
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

const alcance = (page: Page) => leerFila(page, 'Alcance horizontal');
const alturaMax = (page: Page) => leerFila(page, 'Altura máxima');
const tiempoVuelo = (page: Page) => leerFila(page, 'Tiempo de vuelo');
const vImpacto = (page: Page) => leerFila(page, 'Velocidad de impacto');

test.beforeEach(async ({ page }) => {
  await page.goto('/simulador-proyectiles/');
  // Los deslizadores arrancan en v₀ = 50, θ = 45, h₀ = 0 y g = 9,81 (preset Tierra).
  await esperarHidratacion(page, ['#v0', '#angulo', '#altura']);
});

test.describe('Caso 1 — normal: tiro parabólico desde el suelo, sin rozamiento', () => {
  test('v₀ = 20 m/s, θ = 45°, h₀ = 0, g = 9,81 → R 40,77 m · H 10,19 m · T 2,88 s', async ({
    page,
  }) => {
    // Solo se mueve v₀ (50 → 20): θ = 45° es el valor inicial de la app y sembrarlo no
    // probaría nada. El movimiento del ángulo lo prueban los casos 1.bis y 2.
    await sembrarValor(page, '#v0', 20);

    // R = v₀²·sen(2θ)/g = 400/9,81 = 40,774720 m
    await expect.poll(() => alcance(page)).toBe('40,77 m');
    // H = v₀²·sen²θ/(2g) = 400·0,5/19,62 = 10,193680 m
    await expect.poll(() => alturaMax(page)).toBe('10,19 m');
    // T = 2·v₀·senθ/g = 2·14,142136/9,81 = 2,883246 s
    await expect.poll(() => tiempoVuelo(page)).toBe('2,88 s');
    // Sin rozamiento y con h₀ = 0 la llegada es simétrica: |v| de impacto = v₀ = 20 m/s
    await expect.poll(() => vImpacto(page)).toBe('20,00 m/s');
    // Energía cinética por unidad de masa = ½·v² = ½·400 = 200 J/kg
    await expect
      .poll(() => leerFila(page, 'Energía cinética (masa unitaria, en proyectil actual)'))
      .toBe('200,00 J/kg');
  });

  test('1.bis — ángulos complementarios: 30° y 60° dan el MISMO alcance', async ({ page }) => {
    // La propia app lo promete en «Mejores Prácticas»: sen(2·30°) = sen(2·60°) = sen 60°.
    // R = 400·0,8660254/9,81 = 35,307835 m en los dos casos, pero con alturas y tiempos
    // bien distintos — que es justo lo que hace la comprobación no trivial.
    await sembrarValor(page, '#v0', 20);

    await sembrarValor(page, '#angulo', 30);
    await expect.poll(() => alcance(page)).toBe('35,31 m');
    // H = 400·0,25/19,62 = 5,096840 m · T = 2·10/9,81 = 2,038736 s
    await expect.poll(() => alturaMax(page)).toBe('5,10 m');
    await expect.poll(() => tiempoVuelo(page)).toBe('2,04 s');

    await sembrarValor(page, '#angulo', 60);
    await expect.poll(() => alcance(page)).toBe('35,31 m');
    // H = 400·0,75/19,62 = 15,290520 m · T = 2·17,320508/9,81 = 3,531271 s
    await expect.poll(() => alturaMax(page)).toBe('15,29 m');
    await expect.poll(() => tiempoVuelo(page)).toBe('3,53 s');
  });

  test('1.ter — la gravedad de la Luna multiplica el alcance por 6,06, como promete la FAQ', async ({
    page,
  }) => {
    // La FAQ de la app dice literalmente: «50 m/s a 45° → 255 m en la Tierra, 1543 m en la
    // Luna». Con los valores iniciales (v₀ = 50, θ = 45) no hay que sembrar nada: basta
    // pulsar el preset, que además es el cambio que se quiere probar.
    // Tierra: R = 2500/9,81   =  254,841998 m
    // Luna:   R = 2500/1,62   = 1543,209877 m   (9,81/1,62 = 6,06)
    await expect.poll(() => alcance(page)).toBe('254,84 m');

    await page.getByRole('button', { name: 'Luna' }).click();
    await esperarValorEnReact(page, '#gravedad', '1.62');
    await expect.poll(() => alcance(page)).toBe('1543,21 m');
    // H = 2500·0,5/(2·1,62) = 385,802469 m · T = 2·35,355339/1,62 = 43,648567 s
    await expect.poll(() => alturaMax(page)).toBe('385,80 m');
    await expect.poll(() => tiempoVuelo(page)).toBe('43,65 s');
  });

  test('1.quater — el proyectil ANIMADO acaba donde dice el alcance', async ({ page }) => {
    // La app integra/muestrea la trayectoria para dibujarla y ADEMÁS publica una cifra de
    // alcance. Si el dibujo y la cifra salieran de sitios distintos, se notaría aquí.
    await sembrarValor(page, '#v0', 20);
    await expect.poll(() => alcance(page)).toBe('40,77 m');

    await page.getByRole('button', { name: /Lanzar proyectil/ }).click();
    // duración = min(4000, T·600) = min(4000, 1730) = 1730 ms
    await page.waitForTimeout(2500);

    const circulo = page.locator('svg[aria-label="Trayectoria del proyectil"] circle');
    const cx = Number(await circulo.getAttribute('cx'));
    const cy = Number(await circulo.getAttribute('cy'));

    // Deshacer la proyección del SVG (viewBox 0 0 800 400, padding 30, xMax = R·1,05):
    //   x_físico = (cx − 30) / (800 − 60) · R·1,05
    const xFisico = ((cx - 30) / 740) * 40.774720 * 1.05;
    expect(xFisico).toBeCloseTo(40.774720, 3);
    // Y el impacto está en el suelo: toSvgY(0) = 400 − 30 = 370
    expect(cy).toBe(370);
  });
});

test.describe('Caso 2 — límite: los ángulos extremos y la velocidad mínima', () => {
  test('θ = 90° (tiro vertical) → alcance nulo, H 20,39 m y T 4,08 s', async ({ page }) => {
    await sembrarValor(page, '#v0', 20);
    await sembrarValor(page, '#angulo', 90);

    // El alcance de un tiro vertical es CERO exacto. La app calcula x = v₀·cos(90°)·T y
    // cos(π/2) en coma flotante vale 6,1·10⁻¹⁷, así que le sale 1,2·10⁻¹⁵ m; formatNumber
    // no imprime «0,00» sino su marca de infinitésimo. Es el único caso de esta app donde
    // se ve el artefacto numérico, y queda fijado aquí para que una reparación lo note.
    await expect.poll(() => alcance(page)).toBe('≈0 m');
    // H = v₀²/(2g) = 400/19,62 = 20,387360 m · T = 2·v₀/g = 40/9,81 = 4,077472 s
    await expect.poll(() => alturaMax(page)).toBe('20,39 m');
    await expect.poll(() => tiempoVuelo(page)).toBe('4,08 s');
    await expect.poll(() => vImpacto(page)).toBe('20,00 m/s');
  });

  test('θ = 0° con h₀ = 0 → todo a cero: el proyectil ya está en el suelo', async ({ page }) => {
    await sembrarValor(page, '#v0', 20);
    await sembrarValor(page, '#angulo', 0);

    // v₀ᵧ = 0 y h₀ = 0 → la cuadrática y(T) = 0 tiene raíz doble en T = 0. No hay vuelo.
    await expect.poll(() => tiempoVuelo(page)).toBe('0,00 s');
    await expect.poll(() => alcance(page)).toBe('0,00 m');
    await expect.poll(() => alturaMax(page)).toBe('0,00 m');
    // La velocidad «de impacto» es la inicial, íntegramente horizontal: 20 m/s.
    await expect.poll(() => vImpacto(page)).toBe('20,00 m/s');
  });

  test('v₀ = 0 no se puede pedir: el deslizador lo recorta a su mínimo de 1 m/s', async ({
    page,
  }) => {
    // Un tiro con v₀ = 0 daría T = 0 y R = 0 (y con h₀ > 0, caída libre). El <input
    // type="range"> lo capa a min = 1 antes de que React lo vea, así que el caso
    // degenerado nunca llega al cálculo. Con θ = 45° (valor inicial):
    //   R = 1/9,81 = 0,101937 m · H = 0,5/19,62 = 0,025484 m · T = 2·0,707107/9,81 = 0,144156 s
    const aceptado = await sembrarValorAcotado(page, '#v0', 0);
    expect(aceptado).toBe('1');

    await expect.poll(() => alcance(page)).toBe('0,10 m');
    await expect.poll(() => alturaMax(page)).toBe('0,03 m');
    await expect.poll(() => tiempoVuelo(page)).toBe('0,14 s');
    await expect.poll(() => vImpacto(page)).toBe('1,00 m/s');
  });

  test('θ > 90° tampoco se puede pedir: el deslizador lo recorta a 90°', async ({ page }) => {
    // Un ángulo de 120° tendría cos < 0 y el proyectil saldría hacia atrás. El control lo
    // impide, y el resultado que queda es el del tiro vertical del primer caso.
    const aceptado = await sembrarValorAcotado(page, '#angulo', 120);
    expect(aceptado).toBe('90');
    // Con v₀ = 50 (inicial): H = 2500/19,62 = 127,420999 m · T = 100/9,81 = 10,193680 s
    await expect.poll(() => alturaMax(page)).toBe('127,42 m');
    await expect.poll(() => tiempoVuelo(page)).toBe('10,19 s');
  });
});

test.describe('Caso 3 — a rechazar: gravedades imposibles en el único campo libre', () => {
  test('g negativa da alcance y tiempo de vuelo NEGATIVOS, sin un solo aviso', async ({
    page,
  }) => {
    await sembrarValor(page, '#v0', 20);
    await expect.poll(() => alcance(page)).toBe('40,77 m');

    // El campo de gravedad declara min = 0,1, pero un <input type="number"> no acota nada:
    // el navegador se limita a marcar validity.rangeUnderflow, que la app no consulta.
    await page.locator('#gravedad').fill('-9.81');
    await esperarValorEnReact(page, '#gravedad', '-9.81');
    expect(await page.locator('#gravedad').evaluate((el: HTMLInputElement) => el.validity.rangeUnderflow)).toBe(true);

    // Esperado: rechazo explícito, o al menos ninguna cifra. Obtenido: T = (v₀ᵧ + |v₀ᵧ|)/g
    // con g < 0 sale NEGATIVO, y el alcance con él. La app publica un tiempo de vuelo de
    // −2,88 segundos y un alcance de −40,77 metros como si fueran resultados.
    await expect.poll(() => tiempoVuelo(page)).toBe('-2,88 s');
    await expect.poll(() => alcance(page)).toBe('-40,77 m');
    // (el ámbito es <main>: el indicador de desarrollo de Next monta su propio role="alert"
    // dentro de un shadow root y no tiene nada que ver con la app)
    await expect(page.locator('main [role="alert"]')).toHaveCount(0);

    const texto = (await page.locator('main').innerText()).toLowerCase();
    expect(texto).not.toContain('no válid');
    expect(texto).not.toContain('no puede ser');
  });

  test('vaciar el campo de gravedad CUELGA la pestaña (bucle infinito)', async ({ page }) => {
    // Es el gesto de cualquiera que quiera teclear otra gravedad: clic en el campo,
    // seleccionar todo, borrar. En ese instante e.target.value vale '' y Number('') es 0,
    // así que el cálculo hace:
    //     T     = (v₀ᵧ + √(v₀ᵧ²)) / 0        = Infinity
    //     pasos = max(80, ceil(Infinity/0,01)) = Infinity
    //     dt    = Infinity / Infinity          = NaN
    // y entra en `for (let i = 0; i <= Infinity; i++)` empujando puntos NaN a un array.
    // El hilo de render no vuelve nunca y la memoria sube sin techo: solo se sale matando
    // la pestaña. Se sondea con presupuesto acotado y se cierra la página en el acto, para
    // no dejar el bucle corriendo durante el resto de la suite.
    const respuesta = await Promise.race([
      (async () => {
        await page.locator('#gravedad').press('Control+a');
        await page.locator('#gravedad').press('Backspace');
        await page.evaluate(() => document.querySelector('#gravedad') !== null);
        return 'la página sigue respondiendo';
      })().catch(() => 'la página sigue respondiendo'),
      new Promise<string>((r) => setTimeout(() => r('congelada'), 2500)),
    ]);

    // Esperado de una app sana: seguir respondiendo (con la gravedad rechazada o repuesta).
    // Obtenido hoy: ni un evaluate trivial vuelve. Cuando esto se repare, este test pasará
    // a rojo — y esa es exactamente la señal que se busca.
    expect(respuesta).toBe('congelada');

    await page.close();
  });
});

test.describe('Trampa (a) — altura inicial: el alcance ya no es v₀²·sen(2θ)/g', () => {
  test('h₀ = 30 m, v₀ = 20, θ = 45° → 60,87 m, no los 40,77 m de la fórmula corta', async ({
    page,
  }) => {
    await sembrarValor(page, '#v0', 20);
    await sembrarValor(page, '#altura', 30);

    // T = (14,142136 + √(200 + 588,6))/9,81 = (14,142136 + 28,082023)/9,81 = 4,304196 s
    // R = 14,142136 · 4,304196 = 60,870459 m      H = 30 + 10,193680 = 40,193680 m
    // v_impacto = √(14,142136² + (14,142136 − 9,81·4,304196)²) = 31,441985 m/s
    await expect.poll(() => alcance(page)).toBe('60,87 m');
    expect(await alcance(page)).not.toBe('40,77 m'); // el error clásico
    await expect.poll(() => alturaMax(page)).toBe('40,19 m');
    await expect.poll(() => tiempoVuelo(page)).toBe('4,30 s');
    await expect.poll(() => vImpacto(page)).toBe('31,44 m/s');
  });

  test('con h₀ > 0 el óptimo baja de 45°: a 35° se llega MÁS lejos', async ({ page }) => {
    await sembrarValor(page, '#v0', 20);
    await sembrarValor(page, '#altura', 30);
    await expect.poll(() => alcance(page)).toBe('60,87 m');

    // θ = 35°: v₀ₓ = 16,383041 · v₀ᵧ = 11,471529 → T = 3,904965 s → R = 63,975126 m
    await sembrarValor(page, '#angulo', 35);
    await expect.poll(() => alcance(page)).toBe('63,98 m');

    // θ = 30°: v₀ₓ = 17,320508 · v₀ᵧ = 10 → T = 3,694312 s → R = 63,987232 m
    await sembrarValor(page, '#angulo', 30);
    await expect.poll(() => alcance(page)).toBe('63,99 m');
  });

  test('y la guía NO anuncia 45° como óptimo universal: lo condiciona a h₀ = 0', async ({
    page,
  }) => {
    // El botón lleva aria-label propio, que es lo que manda para el nombre accesible.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const guia = page.locator('table').first();
    await expect(guia).toContainText('Solo cuando salida y llegada están a la misma altura');

    const texto = await page.locator('main').innerText();
    expect(texto).toContain('si lanzas desde una altura h₀, el ángulo óptimo es menor que');
    expect(texto).toContain(
      'Asumir que el ángulo óptimo siempre es 45° — solo lo es cuando salida y llegada están al mismo nivel.',
    );
    expect(texto).toContain('hay que resolver la cuadrática completa');
  });
});

test.describe('Trampa (b) — la resistencia del aire no es un rótulo', () => {
  test('con k = 0,05 el alcance cae de 40,77 m a 17,33 m', async ({ page }) => {
    await sembrarValor(page, '#v0', 20);
    await expect.poll(() => alcance(page)).toBe('40,77 m');

    await page.getByRole('button', { name: 'Con resistencia del aire' }).click();

    // ⚠️ k arranca en 0, así que lo que se ve nada más pulsar sigue siendo el caso ideal:
    // la app cambia de rama e integra con Euler semi-implícito (dt = 0,01 s), cuyo sesgo
    // −½·g·dt·t recorta 4,5 cm del alcance y 7 cm de la altura. 40,73 m frente a 40,77 m.
    await esperarValorEnReact(page, '#resistencia', '0');
    await expect.poll(() => alcance(page)).toBe('40,73 m');
    await expect.poll(() => alturaMax(page)).toBe('10,12 m');

    // Con k = 0,05 la diferencia ya es imposible de fingir: a = −g·ĵ − k·|v|·v⃗ integrada
    // desde (14,142136 , 14,142136) m/s da, paso a paso, R = 17,326 m en T = 2,18 s.
    await sembrarValor(page, '#resistencia', 0.05);
    await expect.poll(() => alcance(page)).toBe('17,33 m');
    await expect.poll(() => alturaMax(page)).toBe('5,93 m');
    await expect.poll(() => tiempoVuelo(page)).toBe('2,18 s');
    // Y ya no llega al suelo con la velocidad de salida: se disipó energía.
    await expect.poll(() => vImpacto(page)).toBe('10,20 m/s');

    // k = 0,02 → un punto intermedio coherente: 25,66 m, entre 17,33 y 40,77.
    await sembrarValor(page, '#resistencia', 0.02);
    await expect.poll(() => alcance(page)).toBe('25,66 m');
    await expect.poll(() => tiempoVuelo(page)).toBe('2,50 s');
  });

  test('pero la caja de fórmulas llama «lineal» a un rozamiento cuadrático', async ({ page }) => {
    await page.getByRole('button', { name: 'Con resistencia del aire' }).click();

    // El código hace ax = −k·|v|·vx y ay = −g − k·|v|·vy: el módulo de la fuerza va con
    // |v|², que es rozamiento CUADRÁTICO (régimen turbulento, Re alto). La propia FAQ de
    // la app lo dice bien («proporcional al cuadrado de la velocidad»), y la etiqueta del
    // deslizador también («Modelo F = −k·v·v⃗»). Solo la caja de fórmulas lo contradice.
    await expect(page.locator('main')).toContainText(
      '# Con resistencia del aire (modelo lineal): F = −k · v · v⃗',
    );
  });
});

test.describe('Comparativa — dos lanzamientos idénticos comparten id', () => {
  test('añadir el mismo lanzamiento dos veces y borrar uno los borra LOS DOS', async ({
    page,
  }) => {
    const tarjetas = page.locator('[class*="lanzamientoCard"]');

    // Sin tocar ningún parámetro entre las dos pulsaciones, `lanzamientoActual` es el mismo
    // objeto y `anadirComparativa` lo copia con su id intacto: dos entradas, un solo id.
    await page.getByRole('button', { name: /Añadir a comparativa/ }).click();
    await expect(tarjetas).toHaveCount(1);
    await page.getByRole('button', { name: /Añadir a comparativa/ }).click();
    await expect(tarjetas).toHaveCount(2);

    // `eliminarComparativa` filtra por id, así que la × de una se lleva la otra por delante.
    // Esperado: queda 1. Obtenido: quedan 0.
    await page.locator('button[aria-label="Eliminar lanzamiento"]').first().click();
    await expect(tarjetas).toHaveCount(0);
  });
});
