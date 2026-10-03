import { test, expect, devices, Page } from '@playwright/test';
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
 *       numéricamente (Euler con dt = 0,01 s en 2026-09; RK4 desde el 03/10/2026) con a = −g·ĵ − k·|v|·v⃗. Con
 *       k = 0,05 el alcance cae de 40,77 m a 17,53 m (17,33 con el Euler de entonces), que es una diferencia imposible de
 *       fingir. ⚠️ Pero el coeficiente k arranca en 0, así que el primer instante tras pulsar
 *       «Con resistencia del aire» sigue siendo el caso ideal (40,73 m, la diferencia es el
 *       sesgo del integrador). Se fija también ese estado intermedio.
 *
 * LO QUE ESTOS CASOS DEJARON AL DESCUBIERTO, REPARADO EL 20/09/2026
 *   Los bloques de abajo eran TESTIGO —fijaban lo que la app hacía mal— y se han invertido.
 *   El cálculo vive desde entonces en `app/simulador-proyectiles/motor.ts`, con sus casos
 *   unitarios en `tests/proyectiles-motor.spec.ts`.
 *   · Vaciar el campo de gravedad COLGABA la pestaña (Number('') === 0 → T = ∞ → bucle
 *     infinito). El texto del campo se guarda ahora aparte del número, el motor valida y
 *     además acota el muestreo pase lo que pase.
 *   · Una gravedad negativa producía alcance y tiempo de vuelo NEGATIVOS sin un solo aviso.
 *   · El modo «Con resistencia del aire» se activaba con k = 0, así que anunciaba rozamiento
 *     y entregaba el caso ideal. Arranca en k = 0,01.
 *   · La caja de fórmulas llamaba «modelo lineal» a un rozamiento que el código implementa
 *     cuadrático (−k·|v|·v⃗), contradiciendo a la propia FAQ de la app.
 *   · Añadir dos veces el mismo lanzamiento a la comparativa daba dos tarjetas con el mismo
 *     id, y borrar una borraba las dos.
 *   · En el tiro vertical el alcance salía «≈0 m» por el 6,1·10⁻¹⁷ de cos(π/2).
 *
 * RE-INSPECCIÓN DEL 03/10/2026
 *   Los seis hallazgos del 20/09 (984 a 989) siguen cerrados: se vuelven a ejercitar abajo.
 *   Casos nuevos, resueltos a mano antes de abrir el navegador (mismas fórmulas de arriba):
 *     · v₀ = 30, θ = 40°, h₀ = 0 → R = 900·sen 80°/9,81 = 90,349 m · H = 900·sen²40°/19,62 =
 *       18,953 m · T = 60·sen 40°/9,81 = 3,931 s · ½v² = 450 J/kg.
 *     · Tiro HORIZONTAL desde altura, θ = 0°, v₀ = 20, h₀ = 45 → T = √(2·45/9,81) = 3,0289 s ·
 *       R = 60,578 m · H = 45 m · v_impacto = √(400 + 2·9,81·45) = 35,818 m/s.
 *     · Raíz positiva de la cuadrática, θ = 60°, v₀ = 15, h₀ = 25 → T = (12,990 + √659,25)/9,81 =
 *       3,9415 s · R = 7,5·T = 29,561 m · H = 25 + 168,75/19,62 = 33,601 m · v_imp = √715,5 =
 *       26,749 m/s.
 *     · Vertical desde altura, θ = 90°, v₀ = 10, h₀ = 20 → T = (10 + √492,4)/9,81 = 3,2814 s ·
 *       R = 0 · H = 25,097 m · v_imp = 22,190 m/s.
 *     · Complementarios 20° y 70° con v₀ = 25 → R = 625·sen 40°/9,81 = 40,952 m los dos.
 *   Con rozamiento, la verdad del modelo F = −k·|v|·v⃗ se ha calculado con RK4 convergido
 *   (dt = 10⁻⁴ y 10⁻⁵ s coinciden en 5 decimales), NO con el integrador de la app:
 *       v₀ = 20, θ = 45° · k = 0 → R 40,77472 · H 10,19368 (el caso ideal) · k = 0,01 → R 31,32293 ·
 *       H 8,78272 · T 2,67329 · k = 0,02 → R 25,83443 · T 2,51584 · k = 0,05 → R 17,52553 ·
 *       H 6,03505 · T 2,20178 · v_imp 10,24719 · subida 1,0009 s y bajada 1,2008 s.
 *   Los dos casos de «Trampa (b)» fijaban como correcta la salida de Euler con dt = 0,01 s
 *   (40,73 · 31,26 · 17,33 m…), que se aparta de esa verdad hasta 20 cm. Se han REESCRITO con
 *   tolerancias que admiten ese sesgo —vigilan que el deslizador mueva el resultado, no la
 *   segunda cifra decimal—, y la precisión que la app anuncia (dos decimales) va aparte, en
 *   test.fail().
 *   Sospechas que traía esta vuelta, las dos DESCARTADAS con medida (bloques del final):
 *     (a) teclear un estado intermedio («-», «9.») en un type=number con Number(e.target.value)
 *         reescribiría «0» bajo el cursor. Aquí el único type=number es la gravedad, y guarda el
 *         TEXTO desde 81efb858: tecleando pulsación a pulsación «5.5», «-9.81», «0.5» y «3,71»
 *         el campo conserva lo escrito, en escritorio y en móvil. v₀, θ y h₀ son deslizadores.
 *     (b) bajo stemum.com, de 1024 a 1120 px y a 800 px, la píldora «Stemum › Física» acaba en
 *         x = 232 y el título empieza en x ≥ 258: 0 puntos del h1 bajo la barra fija.
 *   Lo que sigue abierto va en test.fail() con «ABIERTO, hallazgo (inspector 03/10/2026)».
 *
 * REPARACIÓN DEL 03/10/2026 (hallazgos 2753-2763, los once cerrados)
 *   · La rama con rozamiento es RK4 con paso adaptado a la escala de tiempo del problema, con el
 *     impacto y el vértice buscados dentro del último paso, y sin tope de 200 s: un vuelo que no
 *     llegara al suelo dentro de su cota de pasos se RECHAZA en vez de publicarse (2753, 2754).
 *     Casos del motor en tests/proyectiles-motor.spec.ts, contra un RK4 independiente.
 *   · La región viva de resultados es una frase aparte, fuera de la animación (2755).
 *   · Ejes y rótulos del gráfico con clase y variante oscura (2756); tokens -boton/-texto (2757);
 *     el botón activo se distingue en oscuro (2758); el tope de la escala vertical va dentro del
 *     dibujo y alineado a la izquierda (2759), y los rótulos crecen con el ancho real (2760).
 *   · FAQ y JSON-LD corregidos (2761, 2762, 2763), y una fila «Ángulo de máximo alcance» que
 *     calcula el óptimo de cada caso en vez de dar horquillas.
 *   Los test.fail() de esos once casos se han retirado; sus comentarios dicen qué se reparó.
 */

/**
 * Para visitar la app bajo stemum.com (sospecha b) sin tocar el DNS: el host se resuelve al
 * servidor local. `launchOptions` fuerza un worker nuevo, por eso va al nivel del fichero; a las
 * visitas a localhost no les afecta.
 */
test.use({ launchOptions: { args: ['--host-resolver-rules=MAP stemum.com 127.0.0.1:3050'] } });

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

/** «20.000,00 m» → 20000. Para comparar con una tolerancia en vez de con el texto exacto. */
const cifra = (texto: string): number =>
  Number(texto.replace(/\s.*$/, '').replace(/\./g, '').replace(',', '.'));

/**
 * ¿La cifra mostrada está a menos de UNA unidad de su última cifra decimal de la verdad? Es la
 * precisión que la propia app anuncia al escribir dos decimales: si la reparación decide mostrar
 * menos decimales con rozamiento, la tolerancia se ensancha sola.
 */
function dentroDeSuPrecision(texto: string, verdad: number): boolean {
  const numero = texto.replace(/\s.*$/, '');
  const decimales = numero.includes(',') ? numero.split(',')[1].length : 0;
  return Math.abs(cifra(texto) - verdad) <= 10 ** -decimales + 1e-9;
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

    // El alcance de un tiro vertical es CERO exacto. cos(π/2) en coma flotante vale
    // 6,1·10⁻¹⁷, así que el alcance salía 1,2·10⁻¹⁵ m y formatNumber lo rotulaba «≈0 m»,
    // sugiriendo una imprecisión física que no existe: el motor lleva a cero los
    // infinitésimos de las componentes antes de multiplicar por el tiempo.
    await expect.poll(() => alcance(page)).toBe('0,00 m');
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
  test('g negativa se rechaza con aviso, en vez de publicar cifras negativas', async ({
    page,
  }) => {
    await sembrarValor(page, '#v0', 20);
    await expect.poll(() => alcance(page)).toBe('40,77 m');

    // El campo declara min = 0,1, pero un <input type="number"> no acota nada: el navegador
    // se limita a marcar validity.rangeUnderflow. Quien valida es el motor.
    await page.locator('#gravedad').fill('-9.81');
    await esperarValorEnReact(page, '#gravedad', '-9.81');

    // Antes salían «−40,77 m» y «−2,88 s» como si fueran resultados. Ahora no hay cifras.
    const aviso = page.locator('main [role="alert"]');
    await expect(aviso).toHaveCount(1);
    await expect(aviso).toContainText('gravedad');
    await expect.poll(() => alcance(page)).toBe('');
    await expect.poll(() => tiempoVuelo(page)).toBe('');
  });

  test('vaciar el campo de gravedad ya no cuelga la pestaña', async ({ page }) => {
    // El gesto de cualquiera que quiera teclear otra gravedad: clic, Ctrl+A, Backspace.
    // Number('') es 0, y con g = 0 el tiempo de vuelo era Infinity, los pasos también y
    // dtMuestreo NaN: el bucle de muestreo no terminaba nunca. Ahora el campo vacío es un
    // estado legítimo —el texto se guarda aparte del número— y el motor lo rechaza.
    await page.locator('#gravedad').press('Control+a');
    await page.locator('#gravedad').press('Backspace');
    await expect(page.locator('#gravedad')).toHaveValue('');

    // La prueba de que el hilo de render sigue vivo: un evaluate trivial vuelve, y el
    // aviso está en pantalla.
    expect(await page.evaluate(() => document.querySelector('#gravedad') !== null)).toBe(true);
    await expect(page.locator('main [role="alert"]')).toContainText('gravedad');

    // Y se puede seguir tecleando: 1.62 (la Luna) devuelve las cifras.
    await page.locator('#gravedad').fill('1.62');
    await esperarValorEnReact(page, '#gravedad', '1.62');
    await sembrarValor(page, '#v0', 20);
    // R = v₀²/g = 400/1,62 = 246,91 m
    await expect.poll(() => alcance(page)).toBe('246,91 m');
    await expect(page.locator('main [role="alert"]')).toHaveCount(0);
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
  // REESCRITO el 03/10/2026: fijaba «31,26 m · 8,70 m», que es la salida del integrador de la
  // app (Euler, dt = 0,01 s), no la verdad del modelo (RK4: 31,32 m · 8,78 m · 2,67 s). Lo que
  // este caso vigila es el hallazgo 987 —que activar el modo SE NOTE—, un efecto del 23 %; la
  // tolerancia admite el sesgo del integrador (6 cm) y la precisión va en su propio test.fail().
  test('activarla ya recorta el alcance: unos 31,3 m frente a los 40,77 ideales', async ({
    page,
  }) => {
    await sembrarValor(page, '#v0', 20);
    await expect.poll(() => alcance(page)).toBe('40,77 m');

    await page.getByRole('button', { name: 'Con resistencia del aire' }).click();

    // k arrancaba en 0, así que el modo anunciaba rozamiento y entregaba el caso ideal
    // (40,73 m, la diferencia era solo el sesgo del integrador) hasta que el usuario
    // reparaba en el deslizador. Ahora arranca en 0,01 y se nota de inmediato.
    await esperarValorEnReact(page, '#resistencia', '0.01');
    await expect.poll(async () => cifra(await alcance(page))).toBeLessThan(35);
    expect(Math.abs(cifra(await alcance(page)) - 31.32293)).toBeLessThanOrEqual(0.25);
    expect(Math.abs(cifra(await alturaMax(page)) - 8.78272)).toBeLessThanOrEqual(0.15);
    expect(Math.abs(cifra(await tiempoVuelo(page)) - 2.67329)).toBeLessThanOrEqual(0.03);
  });

  // REESCRITO el 03/10/2026: fijaba 40,73 · 10,12 · 17,33 · 5,93 · 2,18 · 10,20 · 25,66 · 2,50,
  // todo salida de Euler. Ahora compara con la verdad del modelo (RK4, cabecera) con una
  // tolerancia que cubre el sesgo actual: vigila que el deslizador recorra el rango y que el
  // resultado se mueva en la dirección y el orden correctos, no la segunda cifra decimal.
  test('el deslizador recorre el rango completo, de k = 0 a k = 0,05', async ({ page }) => {
    await sembrarValor(page, '#v0', 20);
    await page.getByRole('button', { name: 'Con resistencia del aire' }).click();

    // k = 0 → el caso ideal: R = 40,77472 m · H = 10,19368 m
    await sembrarValor(page, '#resistencia', 0);
    await expect.poll(async () => Math.abs(cifra(await alcance(page)) - 40.77472)).toBeLessThanOrEqual(0.1);
    expect(Math.abs(cifra(await alturaMax(page)) - 10.19368)).toBeLessThanOrEqual(0.15);
    const r0 = cifra(await alcance(page));

    // k = 0,05 → RK4: R 17,52553 m · H 6,03505 m · T 2,20178 s · v_imp 10,24719 m/s
    await sembrarValor(page, '#resistencia', 0.05);
    await expect.poll(async () => Math.abs(cifra(await alcance(page)) - 17.52553)).toBeLessThanOrEqual(0.25);
    expect(Math.abs(cifra(await alturaMax(page)) - 6.03505)).toBeLessThanOrEqual(0.15);
    expect(Math.abs(cifra(await tiempoVuelo(page)) - 2.20178)).toBeLessThanOrEqual(0.03);
    // Y ya no llega al suelo con la velocidad de salida: se disipó energía.
    expect(Math.abs(cifra(await vImpacto(page)) - 10.24719)).toBeLessThanOrEqual(0.1);
    const r5 = cifra(await alcance(page));

    // k = 0,02 → RK4: R 25,83443 m · T 2,51584 s, entre los dos anteriores
    await sembrarValor(page, '#resistencia', 0.02);
    await expect.poll(async () => Math.abs(cifra(await alcance(page)) - 25.83443)).toBeLessThanOrEqual(0.25);
    expect(Math.abs(cifra(await tiempoVuelo(page)) - 2.51584)).toBeLessThanOrEqual(0.03);
    const r2 = cifra(await alcance(page));
    expect(r0).toBeGreaterThan(r2);
    expect(r2).toBeGreaterThan(r5);
  });

  test('y la caja de fórmulas ya llama cuadrático al rozamiento que integra', async ({ page }) => {
    await page.getByRole('button', { name: 'Con resistencia del aire' }).click();

    // El código hace ax = −k·|v|·vx y ay = −g − k·|v|·vy: el módulo de la fuerza va con
    // |v|², que es rozamiento CUADRÁTICO (régimen turbulento, Re alto). La FAQ de la app
    // ya lo decía bien; era la caja de fórmulas la que lo contradecía con «modelo lineal».
    await expect(page.locator('main')).toContainText(
      '# Con resistencia del aire (modelo cuadrático): F = −k · |v| · v⃗',
    );
  });
});

test.describe('Comparativa — cada lanzamiento guardado tiene identidad propia', () => {
  test('borrar uno de dos lanzamientos idénticos deja el otro', async ({ page }) => {
    const tarjetas = page.locator('[class*="lanzamientoCard"]');

    // Antes `anadirComparativa` copiaba `lanzamientoActual` con su id intacto: sin tocar
    // ningún parámetro entre las dos pulsaciones salían dos tarjetas con la misma clave,
    // y como `eliminarComparativa` filtra por id, la × de una se llevaba la otra.
    await page.getByRole('button', { name: /Añadir a comparativa/ }).click();
    await expect(tarjetas).toHaveCount(1);
    await page.getByRole('button', { name: /Añadir a comparativa/ }).click();
    await expect(tarjetas).toHaveCount(2);

    await page.locator('button[aria-label="Eliminar lanzamiento"]').first().click();
    await expect(tarjetas).toHaveCount(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DEL 03/10/2026 — casos nuevos (las cuentas, en la cabecera)
// ═══════════════════════════════════════════════════════════════════════════

const aviso = (page: Page) => page.locator('main [role="alert"]');

test.describe('Re-inspección 03/10/2026 — normal, límites y rechazos resueltos a mano', () => {
  test('normal: v₀ = 30, θ = 40°, h₀ = 0 → R 90,35 m · H 18,95 m · T 3,93 s', async ({ page }) => {
    await sembrarValor(page, '#v0', 30);
    await sembrarValor(page, '#angulo', 40);
    // R = 900·sen 80°/9,81 = 886,32702/9,81 = 90,34934 m
    await expect.poll(() => alcance(page)).toBe('90,35 m');
    // H = 900·sen²40°/19,62 = 371,85831/19,62 = 18,95302 m
    await expect.poll(() => alturaMax(page)).toBe('18,95 m');
    // T = 2·30·sen 40°/9,81 = 38,567256/9,81 = 3,93142 s
    await expect.poll(() => tiempoVuelo(page)).toBe('3,93 s');
    await expect.poll(() => vImpacto(page)).toBe('30,00 m/s');
    // ½·v² con el proyectil en el punto de impacto, |v| = v₀ → 450 J/kg
    await expect
      .poll(() => leerFila(page, 'Energía cinética (masa unitaria, en proyectil actual)'))
      .toBe('450,00 J/kg');
  });

  test('límite: tiro horizontal (θ = 0°) desde h₀ = 45 m → 60,58 m en 3,03 s', async ({ page }) => {
    await sembrarValor(page, '#v0', 20);
    await sembrarValor(page, '#angulo', 0);
    await sembrarValor(page, '#altura', 45);
    // T = √(2·45/9,81) = √9,174312 = 3,028913 s · R = 20·T = 60,57826 m
    await expect.poll(() => tiempoVuelo(page)).toBe('3,03 s');
    await expect.poll(() => alcance(page)).toBe('60,58 m');
    // Con θ = 0° no sube: la altura máxima es la de salida.
    await expect.poll(() => alturaMax(page)).toBe('45,00 m');
    // v_imp = √(v₀² + 2·g·h₀) = √(400 + 882,9) = √1282,9 = 35,81759 m/s
    await expect.poll(() => vImpacto(page)).toBe('35,82 m/s');
  });

  test('límite: raíz POSITIVA de la cuadrática, θ = 60°, v₀ = 15, h₀ = 25 → 29,56 m', async ({
    page,
  }) => {
    await sembrarValor(page, '#v0', 15);
    await sembrarValor(page, '#angulo', 60);
    await sembrarValor(page, '#altura', 25);
    // v₀ᵧ = 12,990381 · v₀ₓ = 7,5 · disc = 168,75 + 490,5 = 659,25 → √ = 25,675864
    // T = (12,990381 + 25,675864)/9,81 = 3,941513 s (la otra raíz, negativa, no tiene sentido)
    await expect.poll(() => tiempoVuelo(page)).toBe('3,94 s');
    // R = 7,5·3,941513 = 29,56135 m
    await expect.poll(() => alcance(page)).toBe('29,56 m');
    // H = 25 + 168,75/19,62 = 33,60092 m · v_imp = √(225 + 490,5) = 26,74883 m/s
    await expect.poll(() => alturaMax(page)).toBe('33,60 m');
    await expect.poll(() => vImpacto(page)).toBe('26,75 m/s');
  });

  test('límite: tiro vertical desde h₀ = 20 m con v₀ = 10 → alcance nulo, 25,10 m, 3,28 s', async ({
    page,
  }) => {
    await sembrarValor(page, '#v0', 10);
    await sembrarValor(page, '#angulo', 90);
    await sembrarValor(page, '#altura', 20);
    // T = (10 + √(100 + 392,4))/9,81 = (10 + 22,190088)/9,81 = 3,281355 s
    await expect.poll(() => tiempoVuelo(page)).toBe('3,28 s');
    await expect.poll(() => alcance(page)).toBe('0,00 m');
    // H = 20 + 100/19,62 = 25,09684 m · v_imp = √492,4 = 22,19009 m/s
    await expect.poll(() => alturaMax(page)).toBe('25,10 m');
    await expect.poll(() => vImpacto(page)).toBe('22,19 m/s');
  });

  test('límite: 20° y 70° con v₀ = 25 dan el mismo alcance, 40,95 m', async ({ page }) => {
    await sembrarValor(page, '#v0', 25);
    // R = 625·sen 40°/9,81 = 401,74225/9,81 = 40,95232 m en los dos
    await sembrarValor(page, '#angulo', 20);
    await expect.poll(() => alcance(page)).toBe('40,95 m');
    // H = 625·sen²20°/19,62 = 3,72636 m · T = 50·sen 20°/9,81 = 1,74322 s
    await expect.poll(() => alturaMax(page)).toBe('3,73 m');
    await expect.poll(() => tiempoVuelo(page)).toBe('1,74 s');
    await sembrarValor(page, '#angulo', 70);
    await expect.poll(() => alcance(page)).toBe('40,95 m');
    // H = 625·sen²70°/19,62 = 28,12889 m · T = 50·sen 70°/9,81 = 4,78946 s
    await expect.poll(() => alturaMax(page)).toBe('28,13 m');
    await expect.poll(() => tiempoVuelo(page)).toBe('4,79 s');
  });

  test('a rechazar: g = 0, g = 60 y el campo vacío dejan un aviso y ninguna cifra', async ({
    page,
  }) => {
    const g = page.locator('#gravedad');
    await g.fill('0');
    await esperarValorEnReact(page, '#gravedad', '0');
    await expect(aviso(page)).toContainText('al menos 0,1');
    await expect.poll(() => alcance(page)).toBe('');

    await g.fill('60');
    await esperarValorEnReact(page, '#gravedad', '60');
    await expect(aviso(page)).toContainText('como mucho de 50');
    await expect.poll(() => alcance(page)).toBe('');

    await g.fill('');
    await esperarValorEnReact(page, '#gravedad', '');
    await expect(aviso(page)).toContainText('Escribe una gravedad');
    await expect.poll(() => alcance(page)).toBe('');

    // Y se recupera: 9.81 otra vez → R = 2500/9,81 = 254,84 m (v₀ = 50, θ = 45° iniciales)
    await g.fill('9.81');
    await esperarValorEnReact(page, '#gravedad', '9.81');
    await expect.poll(() => alcance(page)).toBe('254,84 m');
    await expect(aviso(page)).toHaveCount(0);
  });
});

/** Borra el campo de gravedad como lo haría alguien y teclea `texto` pulsación a pulsación. */
async function teclearGravedad(page: Page, texto: string): Promise<void> {
  const campo = page.locator('#gravedad');
  await campo.click();
  await campo.press('Control+a');
  await campo.press('Backspace');
  await campo.pressSequentially(texto, { delay: 30 });
}

/**
 * Sospecha (a), DESCARTADA. Un `setX(Number(e.target.value))` en un type=number reescribe «0»
 * bajo el cursor al teclear «-» o «9.», porque el navegador entrega '' en esos estados. fill()
 * no lo ve —escribe el valor entero de golpe—, así que aquí se teclea de verdad.
 */
async function teclearYComprobar(page: Page): Promise<void> {
  // R = v₀²/g con v₀ = 50 y θ = 45° (iniciales): 2500/5,5 = 454,54545 m
  await teclearGravedad(page, '5.5');
  await expect(page.locator('#gravedad')).toHaveValue('5.5');
  await esperarValorEnReact(page, '#gravedad', '5.5');
  await expect.poll(() => alcance(page)).toBe('454,55 m');

  // «-» y «-9.» son estados intermedios que el navegador entrega como ''
  await teclearGravedad(page, '-9.81');
  await expect(page.locator('#gravedad')).toHaveValue('-9.81');
  await expect(aviso(page)).toContainText('al menos 0,1');
  await expect.poll(() => alcance(page)).toBe('');

  // «0» se rechaza y «0.» vuelve a ser '': el campo tiene que llegar a «0.5» → 2500/0,5 = 5000 m
  await teclearGravedad(page, '0.5');
  await expect(page.locator('#gravedad')).toHaveValue('0.5');
  await expect.poll(() => alcance(page)).toBe('5000,00 m');

  // La coma decimal de un teclado español: Chromium la admite y entrega «3.71» → Marte,
  // 2500/3,71 = 673,85445 m
  await teclearGravedad(page, '3,71');
  await expect(page.locator('#gravedad')).toHaveValue('3.71');
  await expect.poll(() => alcance(page)).toBe('673,85 m');
}

test.describe('Sospecha (a) descartada — teclear la gravedad pulsación a pulsación', () => {
  test('en escritorio, «5.5», «-9.81», «0.5» y «3,71» se conservan tal como se escriben', async ({
    page,
  }) => {
    await teclearYComprobar(page);
  });
});

test.describe('Sospecha (a) descartada — y en móvil (390 px)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test('en móvil, «5.5», «-9.81», «0.5» y «3,71» se conservan tal como se escriben', async ({
    page,
  }) => {
    await teclearYComprobar(page);
  });

  // HALLAZGO 2760 (accesibilidad, bajo) — REPARADO. Los rótulos de escala del gráfico («255 m»,
  // «73 m», «Distancia horizontal (m)») van a fontSize 11 en un viewBox de 800 de ancho; a
  // 390 px el <svg> mide 290 px, así que se pintan a 11·290/800 ≈ 4 px. Es la única escala del
  // dibujo. El suelo de 10 px es holgado: el texto más pequeño de la app en HTML mide 12 px.
  // Reparado: el tamaño sale del ancho real del <svg> (ResizeObserver), así que tras hidratar
  // la lectura se espera con poll.
  test('a 390 px los rótulos de escala del gráfico se pintan a 10 px o más', async ({ page }) => {
    const medir = () =>
      page
        .locator('svg[aria-label="Trayectoria del proyectil"] text')
        .evaluateAll((textos) =>
          textos.map((t) => {
            const svg = (t as SVGTextElement).ownerSVGElement!;
            const escala = svg.getScreenCTM()!.a;
            return parseFloat(getComputedStyle(t).fontSize) * escala;
          }),
        );
    await expect.poll(async () => Math.min(...(await medir()))).toBeGreaterThanOrEqual(10);
    expect((await medir()).length).toBe(3);

    // Y al crecer no se pisan: los dos rótulos de abajo quedan bajo la línea del suelo y
    // separados entre sí, y el de la escala vertical, dentro del dibujo.
    const cajas = await page.locator('svg[aria-label="Trayectoria del proyectil"]').evaluate((svg) => {
      const suelo = Number(svg.querySelector('line')!.getAttribute('y1'));
      const caja = (t: Element) => (t as SVGTextElement).getBBox();
      const [x, y, titulo] = Array.from(svg.querySelectorAll('text'));
      const bx = caja(x);
      const by = caja(y);
      const bt = caja(titulo);
      return {
        suelo,
        topeAbajo: Math.min(bx.y, bt.y),
        solape: bt.x + bt.width > bx.x,
        yIzquierda: by.x,
        yDerecha: by.x + by.width,
      };
    });
    expect(cajas.topeAbajo).toBeGreaterThan(cajas.suelo);
    expect(cajas.solape).toBe(false);
    expect(cajas.yIzquierda).toBeGreaterThanOrEqual(0);
    expect(cajas.yDerecha).toBeLessThanOrEqual(800);
  });
});

/**
 * Bajo stemum.com, el `next dev` local rechaza el WebSocket de HMR y sin él la página no se
 * hidrata: la píldora no llega a montarse. El puente reenvía el socket a localhost:3050. Copiado
 * de `visualizador-volumenes.spec.ts`; bajo `next start` no hay HMR y no hace nada.
 */
async function puenteHmr(page: Page): Promise<void> {
  const abiertos: WebSocket[] = [];
  page.on('close', () => abiertos.forEach((s) => s.close()));
  await page.routeWebSocket(/\/_next\/(webpack-)?hmr/, (ws) => {
    const u = new URL(ws.url());
    const arriba = new WebSocket(`ws://localhost:3050${u.pathname}${u.search}`);
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

/** Cuántos puntos del texto del h1 caen bajo la barra fija del logo (la píldora, en Stemum). */
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

test.describe('Sospecha (b) descartada — la barra fija no tapa el título', () => {
  test('bajo stemum.com, de 1024 a 1120 px y a 800 px, la píldora «Stemum › Física» no pisa el h1', async ({
    page,
  }) => {
    // El corte de 1023 px de a1d72a9c se midió con el logo de meskeia.com. Con la píldora, medido
    // el 03/10/2026: acaba en x = 231-232 y el título empieza en x = 258 a 1024 px (306 a 1120).
    await puenteHmr(page);
    await page.goto('http://stemum.com/simulador-proyectiles/');
    await expect(page.locator('html')).toHaveAttribute('data-brand', 'stemum');
    await expect(page.locator('[class*="stemumPill"]')).toContainText('Física');
    const tapados: string[] = [];
    for (const ancho of [800, 1023, 1024, 1040, 1056, 1072, 1088, 1104, 1110, 1120]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      const m = await tituloBajoLaBarra(page);
      expect(m.total).toBeGreaterThan(100);
      if (m.tapados > 0) tapados.push(`${ancho} px: ${m.tapados}/${m.total}`);
    }
    expect(tapados).toEqual([]);
  });

  test('bajo meskeia, de 360 a 1024 px el logo no tapa el título (586a4d61, a1d72a9c)', async ({
    page,
  }) => {
    const tapados: string[] = [];
    for (const ancho of [360, 390, 800, 1000, 1023, 1024]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      const m = await tituloBajoLaBarra(page);
      expect(m.total).toBeGreaterThan(100);
      if (m.tapados > 0) tapados.push(`${ancho} px: ${m.tapados}/${m.total}`);
    }
    expect(tapados).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS DE LA RE-INSPECCIÓN DEL 03/10/2026
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos abiertos — cálculo con rozamiento', () => {
  // HALLAZGO 2753 (calculo, medio) — REPARADO. La rama con rozamiento integraba con
  // `while (y >= 0 && t < T_MAX …)` y T_MAX = 200 s: un vuelo más largo se corta en seco y el
  // último punto —en el aire— se presenta como impacto (alcance, tiempo y velocidad).
  // Caso: g = 0,5, v₀ = 100, θ = 45°, «Con resistencia» con k = 0 (el deslizador lo rotula
  // «0 (sin resistencia)»: la misma física que la solución cerrada). Sin rozamiento la app da
  // 20.000,00 m en 282,84 s (= 10000/0,5 y 2·70,710678/0,5); con k = 0 daba 14.142,84 m en
  // 200,01 s y 76,54 m/s, con el proyectil a media altura del dibujo.
  // Reparado con RK4 y sin tope de tiempo (el paso se adapta a la escala del vuelo): con k = 0 la
  // aceleración es constante y RK4 es exacto, así que se exigen las MISMAS cifras que la solución
  // cerrada. Segundo caso, con rozamiento real y g = 0,1: verdad (RK4 de paso fijo 10⁻³ s,
  // independiente del motor) 2571,14 m en 333,40 s, que con el tope antiguo salía 2270,86 m en 200 s.
  test('g = 0,5, k = 0, v₀ = 100, θ = 45° → 20.000 m en 282,84 s, como sin rozamiento', async ({
    page,
  }) => {
    await sembrarValor(page, '#v0', 100);
    await page.locator('#gravedad').fill('0.5');
    await esperarValorEnReact(page, '#gravedad', '0.5');
    await expect.poll(() => alcance(page)).toBe('20.000,00 m');
    await expect.poll(() => tiempoVuelo(page)).toBe('282,84 s');

    await page.getByRole('button', { name: 'Con resistencia del aire' }).click();
    await esperarValorEnReact(page, '#resistencia', '0.01');
    await sembrarValor(page, '#resistencia', 0);
    await expect.poll(() => tiempoVuelo(page)).toBe('282,84 s');
    await expect.poll(() => alcance(page)).toBe('20.000,00 m');
    await expect.poll(() => vImpacto(page)).toBe('100,00 m/s');
    // Y el proyectil termina en el suelo del dibujo, no a media altura.
    await page.getByRole('button', { name: /Lanzar proyectil/ }).click();
    await expect(page.getByRole('button', { name: /Lanzar proyectil/ })).toBeEnabled({ timeout: 6000 });
    const cy = Number(
      await page.locator('svg[aria-label="Trayectoria del proyectil"] circle').getAttribute('cy'),
    );
    expect(cy).toBe(370);

    // g = 0,1 con k = 0,001: 333,40 s de vuelo, más allá del antiguo tope de 200 s.
    await page.locator('#gravedad').fill('0.1');
    await esperarValorEnReact(page, '#gravedad', '0.1');
    await sembrarValor(page, '#resistencia', 0.001);
    await expect.poll(() => tiempoVuelo(page)).toBe('333,40 s');
    await expect.poll(() => alcance(page)).toBe('2571,14 m');
  });

  // HALLAZGO 2754 (calculo, bajo) — REPARADO. La rama con rozamiento era Euler semi-implícito con
  // dt = 0,01 s, y su sesgo (−½·g·dt·t en la altura, más el error de primer orden del
  // rozamiento) se publica con dos decimales. Con k = 0, que el deslizador rotula «sin
  // resistencia», da 40,73 m · 10,12 m · 19,98 m/s donde el modo ideal da 40,77 · 10,19 · 20,00;
  // con k = 0,05, 17,33 m · 5,93 m · 2,18 s frente a la verdad del modelo (RK4) 17,53 · 6,04 ·
  // 2,20. Tolerancia: una unidad de la última cifra que la app MUESTRA. Reparado con RK4; se
  // añade el caso de v₀ = 100 (Euler daba 44,82 m frente a 45,96 m).
  test('con rozamiento, cada cifra está a una unidad de su último decimal de la verdad del modelo', async ({
    page,
  }) => {
    await sembrarValor(page, '#v0', 20);
    await page.getByRole('button', { name: 'Con resistencia del aire' }).click();
    await esperarValorEnReact(page, '#resistencia', '0.01');
    const fallos: string[] = [];
    const mirar = (nombre: string, texto: string, verdad: number) => {
      if (!dentroDeSuPrecision(texto, verdad)) fallos.push(`${nombre}: ${texto} (verdad ${verdad})`);
    };

    await sembrarValor(page, '#resistencia', 0);
    await expect.poll(async () => cifra(await alcance(page))).toBeGreaterThan(40);
    mirar('k = 0 · alcance', await alcance(page), 40.77472);
    mirar('k = 0 · altura máx.', await alturaMax(page), 10.19368);
    mirar('k = 0 · v impacto', await vImpacto(page), 20);

    await sembrarValor(page, '#resistencia', 0.05);
    await expect.poll(async () => cifra(await alcance(page))).toBeLessThan(20);
    mirar('k = 0,05 · alcance', await alcance(page), 17.52553);
    mirar('k = 0,05 · altura máx.', await alturaMax(page), 6.03505);
    mirar('k = 0,05 · tiempo', await tiempoVuelo(page), 2.20178);
    mirar('k = 0,05 · v impacto', await vImpacto(page), 10.24719);

    // v₀ = 100, k = 0,05 → RK4 de referencia: 45,96040 m · 24,44121 m · 4,36236 s
    await sembrarValor(page, '#v0', 100);
    await expect.poll(async () => cifra(await alcance(page))).toBeGreaterThan(40);
    mirar('v₀ = 100 · alcance', await alcance(page), 45.9604);
    mirar('v₀ = 100 · altura máx.', await alturaMax(page), 24.44121);
    mirar('v₀ = 100 · tiempo', await tiempoVuelo(page), 4.36236);
    expect(fallos).toEqual([]);
  });
});

/** Contraste WCAG entre dos colores «rgb(r, g, b)». */
function contraste(a: string, b: string): number {
  const canal = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const lum = (color: string) => {
    const [r, g, bl] = (color.match(/\d+(\.\d+)?/g) ?? []).map(Number);
    return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(bl);
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

async function pasarAOscuro(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300); // las transiciones de los botones son de 0,15 s
}

/**
 * Los pares texto/fondo en color de marca que estaban bajo 4,5:1 (hallazgo 2757), en claro y en
 * oscuro. Devuelve los que siguen bajo el listón.
 */
async function textosDeMarcaBajos(page: Page): Promise<{ claro: string[]; oscuro: string[] }> {
  await page.getByRole('button', { name: /Añadir a comparativa/ }).click();
  await expect(page.getByRole('button', { name: 'Limpiar comparativa' })).toBeVisible();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  const medir = () =>
    page.evaluate(() => {
      const fondoDe = (el: Element | null): string => {
        for (let e = el; e; e = e.parentElement) {
          const c = getComputedStyle(e).backgroundColor;
          const a = c.match(/rgba\([^)]*,\s*([\d.]+)\)/);
          if (c !== 'transparent' && !(a && Number(a[1]) < 0.5)) return c;
        }
        return 'rgb(255, 255, 255)';
      };
      const sel: Record<string, string> = {
        'Lanzar proyectil': '[class*="calcBtn"]',
        'preset activo': '[class*="gravityBtn"][aria-pressed="true"]',
        'modo activo': '[class*="modeBtn"][aria-pressed="true"]',
        'valor del deslizador': '[class*="sliderValue"]',
        'Añadir a comparativa': '[class*="secondaryBtn"]',
        'Limpiar comparativa': '[class*="dangerBtn"]',
        'tarjeta comparada': '[class*="lanzamientoInfo"] strong',
        'paso de la guía': '[class*="stepNumber"]',
        'h4 de escenario': '[class*="escenarioCard"] h4',
      };
      const salida = Object.entries(sel).map(([nombre, s]) => {
        const el = document.querySelector(s)!;
        return { nombre, texto: getComputedStyle(el).color, fondo: fondoDe(el) };
      });
      // Los valores destacados van sobre un degradado: contra cada parada.
      const bloque = document.querySelector('[class*="resultBlock"]')!;
      const paradas = getComputedStyle(bloque).backgroundImage.match(/rgb\([^)]+\)/g) ?? [];
      document.querySelectorAll('[class*="resultValueAccent"]').forEach((v, i) => {
        for (const p of paradas) {
          salida.push({ nombre: `valor destacado ${i + 1}`, texto: getComputedStyle(v).color, fondo: p });
        }
      });
      return salida;
    });
  const bajos = (pares: { nombre: string; texto: string; fondo: string }[]) =>
    pares
      .map((p) => ({ ...p, ratio: contraste(p.texto, p.fondo) }))
      .filter((p) => p.ratio < 4.5)
      .map((p) => `${p.nombre} ${p.ratio.toFixed(2)}:1`);
  // La guía está colapsada: se abre para que los pasos y los h4 existan.
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  const pares = await medir();
  expect(pares.length).toBeGreaterThan(12);
  const claro = bajos(pares);
  await pasarAOscuro(page);
  const oscuro = bajos(await medir());
  return { claro, oscuro };
}

test.describe('Hallazgos abiertos — accesibilidad y dibujo', () => {
  // HALLAZGO 2755 (accesibilidad, medio) — REPARADO. La sección de resultados era role="status" con
  // aria-live="polite" y aria-atomic="true", y dentro está la fila «Energía cinética … en
  // proyectil actual», que cambia en cada fotograma de la animación, además de la caja de
  // fórmulas (466 caracteres en total). Medido: un lanzamiento de 1,7 s produce 103 cambios y 71
  // textos distintos de la región, y un lector de pantalla tiene que releerla entera cada vez.
  // Reparado: la única región viva es una frase sr-only con alcance, altura y tiempo, que no
  // depende de la animación. El localizador del test ya buscaba por atributo y la encuentra.
  test('lanzar el proyectil no re-anuncia los resultados en cada fotograma', async ({ page }) => {
    await sembrarValor(page, '#v0', 20);
    await expect.poll(() => alcance(page)).toBe('40,77 m');
    await page.evaluate(() => {
      const w = window as unknown as { __textosVivos: Map<Element, Set<string>> };
      w.__textosVivos = new Map();
      const regiones = document.querySelectorAll(
        'main [aria-live]:not([aria-live="off"]), main [role="status"], main [role="log"]',
      );
      regiones.forEach((r) => {
        w.__textosVivos.set(r, new Set());
        new MutationObserver(() => w.__textosVivos.get(r)!.add(r.textContent ?? '')).observe(r, {
          subtree: true,
          characterData: true,
          childList: true,
        });
      });
    });
    await page.getByRole('button', { name: /Lanzar proyectil/ }).click();
    // duración = min(4000, 2,883 s·600) = 1730 ms
    await page.waitForTimeout(2500);
    const { peor, regiones } = await page.evaluate(() => {
      const w = window as unknown as { __textosVivos: Map<Element, Set<string>> };
      return {
        peor: Math.max(0, ...Array.from(w.__textosVivos.values()).map((s) => s.size)),
        regiones: w.__textosVivos.size,
      };
    });
    // Que haya región (si no, el test pasaría en falso) y que no se re-anuncie en cada fotograma.
    expect(regiones).toBeGreaterThan(0);
    expect(peor).toBeLessThanOrEqual(2);
    // Y lo que anuncia son los resultados, en una frase corta.
    await expect(page.locator('main [role="status"]')).toHaveText(
      'Alcance 40,77 m, altura máxima 10,19 m, tiempo de vuelo 2,88 s.',
    );
  });

  // HALLAZGO 2756 (accesibilidad, medio) — REPARADO. En oscuro, los ejes y los rótulos del gráfico
  // siguen en #374151 (fill y stroke fijos en el JSX) sobre el degradado oscuro del lienzo
  // (#0c4a6e → #064e3b → #022c22): 1,09 · 1,06 · 1,47:1. «Distancia horizontal (m)» y la escala
  // («255 m», «73 m») no se ven. En claro, 8,98:1 o más. Reparado con clases y variante oscura
  // (#e5e7eb: 7,64:1 o más); se miden ahora TODOS los rótulos, no solo el primero.
  test('en oscuro los rótulos del gráfico se leen sobre el lienzo (4,5:1)', async ({ page }) => {
    const medir = () =>
      page.locator('[class*="canvasContainer"]').evaluate((c) => {
        const paradas = getComputedStyle(c).backgroundImage.match(/rgb\([^)]+\)/g) ?? [];
        const rellenos = Array.from(c.querySelectorAll('svg text')).map((t) => getComputedStyle(t).fill);
        const ejes = Array.from(c.querySelectorAll('svg line')).map((l) => getComputedStyle(l).stroke);
        return { paradas, rellenos, ejes };
      });
    const peor = (m: { paradas: string[]; rellenos: string[]; ejes: string[] }, de: 'rellenos' | 'ejes') =>
      Math.min(...m[de].flatMap((color) => m.paradas.map((p) => contraste(color, p))));
    const claro = await medir();
    expect(claro.paradas.length).toBeGreaterThan(1);
    expect(claro.rellenos.length).toBe(3);
    expect(peor(claro, 'rellenos')).toBeGreaterThanOrEqual(4.5);
    expect(peor(claro, 'ejes')).toBeGreaterThanOrEqual(3);

    await pasarAOscuro(page);
    const oscuro = await medir();
    expect(oscuro.paradas.length).toBeGreaterThan(1);
    expect(peor(oscuro, 'rellenos')).toBeGreaterThanOrEqual(4.5);
    expect(peor(oscuro, 'ejes')).toBeGreaterThanOrEqual(3);
  });

  // HALLAZGO 2757 (accesibilidad, medio) — REPARADO. Texto sobre el color de marca sin 4,5:1. En claro:
  // «Lanzar proyectil» y el preset activo, blanco sobre --primary (4,11:1); el modo activo,
  // blanco sobre --secondary (2,80:1); el valor de cada deslizador, --primary sobre la tarjeta
  // (4,11:1); «Añadir a comparativa», --primary sobre #FAFAFA (3,93:1). En oscuro: «Lanzar
  // proyectil», blanco sobre #3FA5D1 (2,79:1) y «Limpiar comparativa», #dc2626 sobre #1A1A1A
  // (3,60:1). Ninguno es texto grande (≤ 15,2 px). Existen --primary-boton y --secondary-boton.
  // Reparado con los tokens -boton/-texto, #f87171 para «Limpiar» en oscuro y un degradado de
  // resultados más oscuro. Se añaden a la medida los valores destacados de resultados, el h4 de
  // los escenarios y la cabecera de la tarjeta comparada, y la misma medida bajo stemum.com.
  test('los textos sobre el color de marca llegan a 4,5:1 en los dos temas', async ({ page }) => {
    expect(await textosDeMarcaBajos(page)).toEqual({ claro: [], oscuro: [] });
  });

  test('y bajo stemum.com, con el violeta del portal, también', async ({ page }) => {
    await puenteHmr(page);
    await page.goto('http://stemum.com/simulador-proyectiles/');
    await expect(page.locator('html')).toHaveAttribute('data-brand', 'stemum');
    await esperarHidratacion(page, ['#v0', '#angulo', '#altura']);
    expect(await textosDeMarcaBajos(page)).toEqual({ claro: [], oscuro: [] });
  });

  // HALLAZGO 2758 (accesibilidad, bajo) — REPARADO. En oscuro, `[data-theme='dark'] .gravityBtn` y
  // `.modeBtn` (0,2,0) ganan a `.gravityActive` y `.modeActive` (0,1,0): el activo pierde su fondo
  // y su borde, y queda igual que los demás (#2a2a2a con borde #4b5563). Solo cambia el tono del
  // texto, blanco frente a #B0B0B0 (2,17:1 entre ellos): no se ve qué planeta ni qué modo está puesto.
  // Reparado con `.gravityBtn.gravityActive` y su variante oscura de mayor especificidad.
  test('en oscuro el preset y el modo activos se distinguen de los demás', async ({ page }) => {
    const firmas = () =>
      page.evaluate(() => {
        const firma = (s: string) => {
          const cs = getComputedStyle(document.querySelector(s)!);
          return `${cs.backgroundColor} | ${cs.borderTopColor}`;
        };
        return {
          preset: [
            firma('[class*="gravityBtn"][aria-pressed="true"]'),
            firma('[class*="gravityBtn"][aria-pressed="false"]'),
          ],
          modo: [
            firma('[class*="modeBtn"][aria-pressed="true"]'),
            firma('[class*="modeBtn"][aria-pressed="false"]'),
          ],
        };
      });
    await page.mouse.move(0, 0);
    const claro = await firmas();
    expect(claro.preset[0]).not.toBe(claro.preset[1]);
    expect(claro.modo[0]).not.toBe(claro.modo[1]);

    await pasarAOscuro(page);
    const oscuro = await firmas();
    expect(oscuro.preset[0]).not.toBe(oscuro.preset[1]);
    expect(oscuro.modo[0]).not.toBe(oscuro.modo[1]);
  });

  // HALLAZGO 2759 (operativa, bajo) — REPARADO. El rótulo de la escala vertical iba en x = 22 con
  // text-anchor="end", así que desde tres cifras empieza a la izquierda del viewBox y el <svg>
  // lo recorta. Con el ejemplo de la propia FAQ (50 m/s a 45° en la Luna): H = 385,80 m → tope
  // de la escala 385,80·1,15 = 443,67 → «444 m», que en pantalla se lee «44 m».
  // Reparado: va dentro del dibujo con text-anchor="start". El localizador pasa de `x="22"` a
  // `data-eje="y"`. Se prueba también una cifra de cuatro dígitos: Luna con 100 m/s →
  // H = 10000·0,5/3,24 = 1543,21 m → tope 1774,69 → «1775 m».
  test('con la Luna (50 m/s a 45°) el rótulo «444 m» de la escala vertical cabe entero', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Luna', exact: true }).click();
    await esperarValorEnReact(page, '#gravedad', '1.62');
    const rotulo = page.locator('svg[aria-label="Trayectoria del proyectil"] text[data-eje="y"]');
    await expect(rotulo).toHaveText('444 m');
    const izquierda = await rotulo.evaluate((t) => (t as SVGTextElement).getBBox().x);
    expect(izquierda).toBeGreaterThanOrEqual(0);

    await sembrarValor(page, '#v0', 100);
    await expect(rotulo).toHaveText('1775 m');
    const caja = await rotulo.evaluate((t) => {
      const b = (t as SVGTextElement).getBBox();
      return { izquierda: b.x, derecha: b.x + b.width };
    });
    expect(caja.izquierda).toBeGreaterThanOrEqual(0);
    expect(caja.derecha).toBeLessThanOrEqual(800);
  });
});

test.describe('Hallazgos abiertos — contenido', () => {
  // HALLAZGO 2761 (contenido, bajo) — REPARADO. La FAQ decía que con rozamiento la trayectoria «cae más
  // rápido de lo que sube». Es al revés: con F = −k·|v|·v⃗ la bajada dura MÁS que la subida
  // (v₀ = 20, θ = 45°, k = 0,05 → RK4: subida 1,00 s y bajada 1,20 s; la propia trayectoria de la
  // app, muestreada a 0,01 s, alcanza el vértice a los 0,97 s de 2,18). Lo que sí es más
  // empinado es el tramo de bajada, que es lo que dice bien el JSON-LD. Reparado: la FAQ dice ahora
  // que tarda más en bajar que en subir, con las cifras del caso, que se comprueban aquí contra
  // la trayectoria que dibuja la app (el punto más alto de la polilínea).
  test('la FAQ no dice que con rozamiento el proyectil «cae más rápido de lo que sube»', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.locator('main')).toContainText('¿Qué pasa si añadimos resistencia del aire?');
    const texto = await page.locator('main').innerText();
    expect(texto).not.toContain('cae más rápido de lo que sube');
    expect(texto).toContain('tarda más en bajar que en subir');
    expect(texto).toContain('1,00 s de subida y 1,20 s de bajada');

    // Las cifras de la FAQ, contra la propia app: v₀ = 20, θ = 45°, k = 0,05 → vértice a 1,00 s
    // de 2,20 s (RK4 de referencia: 1,0009 y 2,20178).
    await sembrarValor(page, '#v0', 20);
    await page.getByRole('button', { name: 'Con resistencia del aire' }).click();
    await esperarValorEnReact(page, '#resistencia', '0.01');
    await sembrarValor(page, '#resistencia', 0.05);
    await expect.poll(() => tiempoVuelo(page)).toBe('2,20 s');
    // La polilínea en coordenadas del SVG: el punto más alto es el de y MENOR. Con la bajada más
    // empinada, el vértice queda pasada la mitad del recorrido horizontal.
    const { xVertice, xFinal } = await page
      .locator('svg[aria-label="Trayectoria del proyectil"] polyline')
      .last()
      .evaluate((pl) => {
        const pts = (pl.getAttribute('points') ?? '').trim().split(/\s+/).map((p) => p.split(',').map(Number));
        const vertice = pts.reduce((m, p) => (p[1] < m[1] ? p : m), pts[0]);
        return { xVertice: vertice[0] - 30, xFinal: pts[pts.length - 1][0] - 30 };
      });
    // Con rozamiento el vértice está más allá de la mitad del recorrido horizontal: la bajada es
    // más corta en x y más empinada (RK4: vértice en x = 10,12 m de 17,53 m, un 58 %).
    expect(xVertice / xFinal).toBeGreaterThan(0.55);
  });

  // HALLAZGO 2762 (contenido, bajo) — REPARADO. Dos horquillas de ángulo óptimo sin fuente que la
  // propia app desmiente: «35-40° para velocidades altas» con rozamiento (a 100 m/s con
  // k = 0,05 el óptimo es 27°: RK4 50,89 m a 27° · 50,74 a 30° · 49,85 a 35° · 48,24 a 40°) y
  // «típicamente 35-42°» desde altura (con h₀ = 30 m y v₀ = 20 m/s, tan θ = v₀/√(v₀² + 2gh₀) →
  // 32,5°; el caso «Trampa (a)» de arriba ya mide 30° por delante de 35°).
  // Reparado: la guía da la fórmula cerrada desde altura y, con rozamiento, que el óptimo depende
  // de v₀ y k, con un caso; y la app calcula una fila «Ángulo de máximo alcance» (fórmula cerrada
  // sin rozamiento, sección áurea sobre el integrador con él). Verdades: RK4 de referencia a
  // 100 m/s y k = 0,05 → máximo en 27,04° con 50,888 m · desde 30 m a 20 m/s → atan(20/√988,6) =
  // 32,46° y R = (v₀/g)·√(v₀² + 2gh₀) = 2,038736·31,442010 = 64,102 m.
  test('a 100 m/s con k = 0,05 el óptimo queda por debajo de 35°, y la guía no lo acota en 35-40°', async ({
    page,
  }) => {
    await sembrarValor(page, '#v0', 100);
    await page.getByRole('button', { name: 'Con resistencia del aire' }).click();
    await esperarValorEnReact(page, '#resistencia', '0.01');
    await sembrarValor(page, '#resistencia', 0.05);
    await expect.poll(async () => cifra(await alcance(page))).toBeLessThan(60);

    const alcanceA = async (angulo: number, previo: string) => {
      await sembrarValor(page, '#angulo', angulo);
      await expect.poll(() => alcance(page)).not.toBe(previo);
      return alcance(page);
    };
    const a30 = await alcanceA(30, await alcance(page));
    const a35 = await alcanceA(35, a30);
    const a40 = await alcanceA(40, a35);
    // Con el modelo de la app, el alcance BAJA de 30° a 35° y de 35° a 40°.
    expect(cifra(a30)).toBeGreaterThan(cifra(a35));
    expect(cifra(a35)).toBeGreaterThan(cifra(a40));

    // La fila del óptimo, con estos mismos parámetros (el ángulo actual no le afecta).
    await expect.poll(() => leerFila(page, 'Ángulo de máximo alcance')).toBe('27,0° (50,89 m)');

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const texto = await page.locator('main').innerText();
    expect(texto).not.toContain('35-40° para velocidades altas');
    expect(texto).not.toContain('típicamente 35-42°');
    expect(texto).toContain('tan θ = v₀ / √(v₀² + 2gh₀)');
  });

  test('sin rozamiento, la fila del óptimo da 45° desde el suelo y 32,5° desde 30 m', async ({
    page,
  }) => {
    await sembrarValor(page, '#v0', 20);
    // h₀ = 0: 45° y R = v₀²/g = 40,77 m
    await expect.poll(() => leerFila(page, 'Ángulo de máximo alcance')).toBe('45,0° (40,77 m)');
    await sembrarValor(page, '#altura', 30);
    await expect.poll(() => leerFila(page, 'Ángulo de máximo alcance')).toBe('32,5° (64,10 m)');
    // Y está entre los dos ángulos que mide «Trampa (a)»: a 30° y a 35° la app da 63,99 y
    // 63,98 m, menos que los 64,10 m del óptimo (cerca del máximo la curva es plana: a 32° y 33°
    // ya redondea a 64,10).
    await sembrarValor(page, '#angulo', 30);
    await expect.poll(() => alcance(page)).toBe('63,99 m');
    await sembrarValor(page, '#angulo', 35);
    await expect.poll(() => alcance(page)).toBe('63,98 m');
  });

  // HALLAZGO 2763 (contenido, bajo) — REPARADO. El JSON-LD describía otra app: «dibuja la trayectoria
  // resultante en tiempo real sobre un canvas 2D», que «integra las ecuaciones cinemáticas en
  // cada fotograma» y trae una «Tabla comparativa». La app dibuja en <svg>, sin rozamiento usa la
  // solución cerrada y la comparativa son tarjetas. Es lo que leen los asistentes de IA.
  // Reparado: describe SVG, solución analítica, RK4 y tarjetas comparativas.
  test('el JSON-LD no habla de un canvas que la app no tiene', async ({ page }) => {
    await expect(page.locator('canvas')).toHaveCount(0);
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    expect(ld).toContain('Simulador de Proyectiles 2D');
    expect(ld.toLowerCase()).not.toContain('canvas');
    expect(ld).not.toContain('Tabla comparativa');
    expect(ld).toContain('SVG');
    expect(ld).toContain('RK4');
    expect(ld).toContain('tarjetas comparativas');
    // Y no repite el error de la FAQ (2761) ni la horquilla sin fuente (2762).
    expect(ld).not.toContain('30°–40°');
    expect(ld).toContain('la bajada dura más que la subida');
  });
});
