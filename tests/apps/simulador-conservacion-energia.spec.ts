import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-conservacion-energia (segmento cálculo/física, riesgo 3, 285 usos)
 *
 * Primera inspección: 26/08/2026. El <h1> promete «Simulador de Conservación de la Energía»
 * y el subtítulo «Suelta una pelota por una pista y observa cómo la energía cinética y
 * potencial se intercambian en tiempo real. Activa la fricción y mira la energía mecánica
 * disiparse». La tarjeta de descripción es aún más explícita, y es la promesa que se prueba
 * aquí: «Sin fricción, E_c + E_p permanece constante EN TODO MOMENTO».
 *
 * Hay, por tanto, verdad física externa y comprobable: las ecuaciones canónicas E_p = m·g·h,
 * E_c = ½·m·v² y v = √(2·g·h). El build no ve la física mal, así que todo lo de abajo se
 * calculó A MANO con g explícito ANTES de abrir el navegador.
 *
 * LA g QUE USA LA APP, Y SÍ LA DECLARA: g = 9,8 m/s² por defecto, escrita en el rótulo del
 * deslizador («Gravedad (g = 9,8 m/s²)») y repetida en el encabezado de la tabla del bloque
 * educativo. Es además ajustable de 1 a 25 m/s². No hay g escondida en ningún sitio.
 *
 * DÓNDE VIVE EL CÁLCULO — app/simulador-conservacion-energia/page.tsx (no hay motor.ts)
 *   · TRACKS: cuatro perfiles y(x) con su derivada analítica y'(x)
 *       rampa         y = 10 − x  en [0,10), 0 en [10,20]      → y' = −1 / 0
 *       valle         y = 0,1·(x−10)²        en [0,20]         → y' = 0,2·(x−10)
 *       montana_rusa  y = máx(0; 10−0,3x) + 2,5·cos(0,7x)·e^(−0,05x)   en [0,24]
 *       looping_suave y = 8 − 0,2x + 3·sin(0,5x)·e^(−0,04x)            en [0,24]
 *   · reset(): coloca la pelota en el x que da la altura pedida. En rampa y valle INVIERTE
 *       la fórmula (x = 10 − h · y · x = 10 − √(h/0,1)) y topa el resultado en xMin; en las
 *       otras dos BARRE x ∈ [xMin, xMin+6] a pasos de 0,05 y se queda con el x cuya y(x)
 *       está más cerca de h₀ — sin comprobar si se ha acercado o no.  ← origen del HALLAZGO B
 *   · step(dt): Euler semi-implícito sobre la curva, con sec θ = √(1+y'²)
 *       a_grav = −g·y'/sec        (proyección de g sobre la tangente)
 *       a_fric = −μ·g/sec·signo(v) (con N = m·g·cos θ; el término centrípeto se desprecia)
 *       v += a·dt · x += (v/sec)·dt · dt real topado a 0,05 s y subdividido en 6 subpasos
 *       Al llegar a xMin o xMax: x se topa y la velocidad se ANULA.  ← origen del HALLAZGO A
 *   · Panel: E_p = m·g·y(x) · E_c = ½·m·v² · E_mec = E_p + E_c
 *            E_disipada = máx(0; E_inicial − E_mec)
 *   · fmt(n,d) = n.toFixed(d).replace('.', ',') — coma decimal, sin separador de millares.
 *     No usa lib/formatters, pero en TODO el rango alcanzable (máx. 10 kg · 25 m/s² · 12,5 m
 *     = 3125 J) la salida coincide con es-ES, que por CLDR no agrupa los grupos de cuatro
 *     cifras. No es, por tanto, un fallo visible: es una desviación de convención.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — valle parabólico con los valores de fábrica:
 *                     m = 1 kg · g = 9,8 m/s² · h₀ = 10 m · μ = 0
 *       Punto de partida: x = 10 − √(10/0,1) = 10 − √100 = 10 − 10 = 0 m,
 *                         y(0) = 0,1·(0−10)² = 0,1·100 = 10 m  ✔ la altura pedida
 *       E_p = m·g·h  = 1 · 9,8 · 10               = 98 J        → «98,00 J»
 *       E_c = ½·m·v² = ½·1·0²                     = 0 J         → «0,00 J»
 *       E_mecánica = 98 + 0                       = 98 J        → «98,00 J»
 *       En el fondo del valle (x = 10, y = 0) toda la E_p se ha vuelto E_c:
 *         ½·m·v² = m·g·h → v = √(2·g·h) = √(2·9,8·10) = √196     = 14 m/s exactos
 *         (control cruzado: E_c ahí = ½·1·14² = 98 J ✔ cuadra con la inicial)
 *       Y con m = 2 kg, la MISMA altura: E = 2·9,8·10 = 196 J → «196,00 J»,
 *         pero v sigue siendo √(2gh) = 14 m/s, porque la masa se cancela.
 *
 *   CASO 2 (límite) — los extremos del deslizador de altura, pista por pista.
 *       Rampa y valle admiten exactamente [1, 10] m: y=10−x y y=0,1(x−10)² valen las dos
 *       10 m en x = 0, que es el borde izquierdo de la pista, y 1 m en x = 9 y x = 6,8377
 *       (10 − √10) respectivamente. Dentro de esa banda la altura debe ser EXACTA:
 *         h₀ =  1 m → E = 1 · 9,8 ·  1 =  9,80 J
 *         h₀ =  4 m → E = 1 · 9,8 ·  4 = 39,20 J
 *         h₀ =  8 m → E = 1 · 9,8 ·  8 = 78,40 J
 *         h₀ = 10 m → E = 1 · 9,8 · 10 = 98,00 J
 *       Fuera de esa banda el deslizador sigue subiendo hasta 12 m, que ninguna de las dos
 *       pistas alcanza → HALLAZGO B, abajo. Y en las dos pistas procedurales el mínimo de
 *       y(x) en la ventana barrida no es 1 m sino 6,64 m (montaña rusa) y 7,13 m (doble
 *       joroba), así que la mitad baja del deslizador tampoco hace nada → mismo HALLAZGO.
 *       Invariante que SÍ debe cumplirse siempre, esté el rótulo bien o mal:
 *         E_inicial = m · g · (altura h que la app muestra), exacta hasta el redondeo.
 *
 *   CASO 3 (rechazo) — la app NO tiene ni un solo campo de texto: los cuatro parámetros son
 *       <input type="range">. El rechazo, por tanto, se prueba forzando desde el DOM valores
 *       imposibles y comprobando que el control los devuelve a su mínimo legal y que nada
 *       de lo que se calcula con ellos se rompe:
 *         altura   = −5 m  → debe quedar en   1 m    (una altura negativa no es una altura)
 *         masa     =  0 kg → debe quedar en   0,1 kg (E = 0 haría la simulación vacía)
 *         gravedad =  0    → debe quedar en   1 m/s² (con g = 0 el dibujo divide por m·g)
 *         μ        = −1    → debe quedar en   0      (un rozamiento negativo daría energía)
 *       Con los cuatro mínimos: E = m·g·h = 0,1 · 1 · 1 = 0,10 J → «0,10 J»,
 *       y en el panel no puede aparecer ni «NaN» ni «Infinity» ni «∞».
 *
 *   COMPROBACIÓN CRUZADA DEL MODELO DE ROZAMIENTO (no es un caso, es el control del motor)
 *       Como el código usa N = m·g·cos θ y ds = sec θ·dx, el trabajo de rozamiento se reduce
 *       a μ·m·g·(recorrido HORIZONTAL). En la rampa con μ = 0,1, al pie de la bajada:
 *         E = 98 − 0,1·1·9,8·10 = 88,20 J → v = √(2·88,20) = 13,28 m/s
 *       Medido el 26/08/2026 sobre el suelo llano, donde E(x) = 88,20 − 0,98·(x−10):
 *         x = 10,94 → predicho 87,28 J · leído 87,39 J   (0,13 %)
 *         x = 14,00 → predicho 84,28 J · leído 84,39 J   (0,13 %)
 *       El modelo de rozamiento es correcto; ese 0,13 % constante es la deriva del
 *       integrador, la misma del HALLAZGO C.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * HALLAZGOS ABIERTOS (Inspector, 26/08/2026). Los tests del bloque final FALLAN hoy a
 * propósito: describen lo que debería ocurrir, no lo que ocurre.
 *   A · alto  (cálculo)       el tope de la pista se come la energía y la llama «disipada»
 *   B · alto  (operativa)     el deslizador de altura promete alturas que la pista no da
 *   C · bajo  (cálculo)       la deriva del integrador se presenta como energía disipada
 *   D · medio (accesibilidad) aria-live sobre unas cifras que se reescriben 60 veces/s
 *   E · bajo  (accesibilidad) tres <button> sin type y ocho emojis sin aria-hidden (pasivo)
 *   F · bajo  (contenido)     el JSON-LD anuncia un control que no existe, y la tabla llama
 *                             «velocidad terminal» a 159 km/h mientras una tarjeta dice 200
 */

const RUTA = '/simulador-conservacion-energia/';

// ── Utilidades ───────────────────────────────────────────────────────────────────────────

/** Lee de una pasada las nueve cifras del panel y los cuatro rótulos de los deslizadores. */
async function leer(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() => {
    const texto = (el: Element | null) => (el ? el.textContent!.trim() : '');
    const o: Record<string, string> = {};
    const tarjetas = ['Posición x', 'Altura h', 'Velocidad |v|', 'Tiempo', 'Energía inicial', 'Energía disipada'];
    for (const sp of Array.from(document.querySelectorAll('span'))) {
      const t = sp.textContent!.trim();
      if (tarjetas.includes(t)) {
        o[t] = texto(sp.nextElementSibling);
        o[`${t} · nota`] = texto(sp.nextElementSibling && sp.nextElementSibling.nextElementSibling);
      }
      if (t.startsWith('⚡ Cinética')) o.Ec = texto(sp.nextElementSibling);
      if (t.startsWith('🪜 Potencial')) o.Ep = texto(sp.nextElementSibling);
      if (t.startsWith('∑ Mecánica')) o.Emec = texto(sp.nextElementSibling);
    }
    for (const lab of Array.from(document.querySelectorAll('label'))) {
      const t = lab.textContent!.trim();
      if (t.startsWith('Altura inicial')) o.rotuloAltura = t;
      if (t.startsWith('Masa')) o.rotuloMasa = t;
      if (t.startsWith('Gravedad')) o.rotuloGravedad = t;
      if (t.startsWith('Coef')) o.rotuloFriccion = t;
    }
    return o;
  });
}

/**
 * Mueve un deslizador. Playwright no puede escribir en un input[type=range], así que se usa
 * el setter nativo + evento input, que es lo que React escucha. Devuelve lo que el control
 * ACEPTA, que no tiene por qué ser lo pedido: ahí está el caso 3.
 *
 * La espera del final NO es adorno: el rótulo del deslizador se pinta en el mismo render que
 * cambia el estado, pero la pelota la recoloca un useEffect que escribe en un ref y fuerza un
 * segundo render. Leer entre los dos renders devuelve el rótulo nuevo con la altura vieja.
 */
/**
 * Mueve un deslizador y NO devuelve hasta comprobar que el valor llegó al estado de React.
 *
 * El truco del setter nativo + dispatchEvent escribe el DOM y sí alcanza a React… siempre
 * que React ya haya hidratado. Si llega antes, el evento se pierde y en la siguiente
 * hidratación React restaura `value` desde su estado, deshaciendo el cambio SIN QUE NADA
 * FALLE: el test sigue adelante creyendo que movió el control. Es la forma que el plan de
 * reparación del Inspector documenta como «test que no llega a la app», y aquí se resuelve
 * declarando la causa —se espera a que el rótulo, que lo pinta React, refleje el valor— en
 * vez de subir un `waitForTimeout` hasta que deje de fallar.
 */
async function poner(page: Page, etiqueta: string, valor: number): Promise<string> {
  const escribir = () =>
    page.evaluate(
      ([et, v]) => {
        const el = document.querySelector(`input[aria-label="${et}"]`) as HTMLInputElement;
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
        setter.call(el, String(v));
        el.dispatchEvent(new Event('input', { bubbles: true }));
        return el.value;
      },
      [etiqueta, valor] as [string, number],
    );

  let aceptado = await escribir();
  for (let intento = 0; intento < 20; intento++) {
    await page.waitForTimeout(100);
    const enReact = await page.evaluate(
      (et) => (document.querySelector(`input[aria-label="${et}"]`) as HTMLInputElement).value,
      etiqueta,
    );
    if (enReact === aceptado) return aceptado;
    aceptado = await escribir(); // React aún no había hidratado: se vuelve a intentar
  }
  throw new Error(`el deslizador «${etiqueta}» no aceptó ${valor}: React no llegó a hidratar`);
}

/** «98,24 J» → 98.24 */
const aNumero = (s: string): number => parseFloat(s.replace(/[^0-9,-]/g, '').replace(',', '.'));

/** Arranca la simulación y devuelve una muestra del panel cada `ms` milisegundos. */
async function correr(
  page: Page,
  muestras: number,
  ms: number,
  hasta?: (l: Record<string, string>) => boolean,
): Promise<Record<string, string>[]> {
  await page.getByRole('button', { name: 'Iniciar simulación' }).click();
  const historia: Record<string, string>[] = [];
  for (let i = 0; i < muestras; i++) {
    await page.waitForTimeout(ms);
    const l = await leer(page);
    historia.push(l);
    if (hasta && hasta(l)) break;
  }
  await page.getByRole('button', { name: 'Pausar simulación' }).click();
  return historia;
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Simulador de Conservación de la Energía');
  // La pelota ya está colocada antes de tocar nada: el panel no arranca vacío.
  await expect(page.getByText('m·g·h₀')).toBeVisible();
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// CASO 1 (normal) — valle parabólico de fábrica: E = m·g·h = 98,00 J y v = √(2gh) = 14 m/s
// ═════════════════════════════════════════════════════════════════════════════════════════

test('CASO 1 · valle con los valores de fábrica: 98,00 J en reposo y 14,00 m/s en el fondo', async ({
  page,
}) => {
  const inicio = await leer(page);

  // Los valores de fábrica son los que suponen las cuentas de arriba, y la g está declarada.
  expect(inicio.rotuloAltura).toBe('Altura inicial (h₀ = 10,0 m)');
  expect(inicio.rotuloMasa).toBe('Masa (m = 1,0 kg)');
  expect(inicio.rotuloGravedad).toBe('Gravedad (g = 9,8 m/s²)');
  expect(inicio.rotuloFriccion).toBe('Coef. fricción (μ = 0,000)');

  // Reposo en x = 10 − √(10/0,1) = 0, o sea y = 0,1·(0−10)² = 10 m exactos.
  expect(inicio['Posición x']).toBe('0,00 m');
  expect(inicio['Altura h']).toBe('10,00 m');
  expect(inicio['Velocidad |v|']).toBe('0,00 m/s');
  expect(inicio['Velocidad |v| · nota']).toBe('— en reposo');

  // E_p = 1 · 9,8 · 10 = 98 J · E_c = ½·1·0² = 0 J · E_mec = 98 J
  expect(inicio.Ep).toBe('98,00 J');
  expect(inicio.Ec).toBe('0,00 J');
  expect(inicio.Emec).toBe('98,00 J');
  expect(inicio['Energía inicial']).toBe('98,00 J');
  expect(inicio['Energía disipada']).toBe('0,00 J');
  expect(inicio['Energía disipada · nota']).toBe('sin fricción');

  // Doblar la masa dobla la energía y NO toca la altura: E = 2 · 9,8 · 10 = 196 J.
  expect(await poner(page, 'Masa', 2)).toBe('2');
  const dosKilos = await leer(page);
  expect(dosKilos.rotuloMasa).toBe('Masa (m = 2,0 kg)');
  expect(dosKilos['Altura h']).toBe('10,00 m');
  expect(dosKilos['Energía inicial']).toBe('196,00 J');
  expect(dosKilos.Ep).toBe('196,00 J');

  // Y con m = 1 otra vez, la pelota debe alcanzar en el fondo v = √(2·9,8·10) = 14,00 m/s
  // exactos, que es el número que la propia FAQ de la app promete. Tolerancia ±0,15 m/s:
  // el integrador es de paso finito y el muestreo no cae justo en el fondo.
  expect(await poner(page, 'Masa', 1)).toBe('1');
  const historia = await correr(page, 70, 60);
  const velocidades = historia.map((l) => aNumero(l['Velocidad |v|']));
  const vMaxima = Math.max(...velocidades);
  expect(vMaxima).toBeGreaterThan(13.85);
  expect(vMaxima).toBeLessThan(14.15);

  // En el instante de máxima velocidad la altura es ~0 y E_c se lo ha llevado casi todo.
  const fondo = historia[velocidades.indexOf(vMaxima)];
  expect(aNumero(fondo['Altura h'])).toBeLessThan(0.15);
  expect(aNumero(fondo.Ec)).toBeGreaterThan(96);

  // La promesa central de la app: «sin fricción, E_c + E_p permanece constante». Se comprueba
  // sobre TODA la carrera, no solo al principio, con la tolerancia del integrador (±1 J
  // sobre 98 J ≈ 1 %; lo medido el 26/08/2026 fue 97,91 – 98,24 J).
  const mecanicas = historia.map((l) => aNumero(l.Emec));
  expect(Math.min(...mecanicas)).toBeGreaterThan(97);
  expect(Math.max(...mecanicas)).toBeLessThan(99);

  // Y la pelota no puede subir por encima de la altura de la que partió.
  expect(Math.max(...historia.map((l) => aNumero(l['Altura h'])))).toBeLessThanOrEqual(10);
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// CASO 2 (límite) — los extremos del deslizador de altura
// ═════════════════════════════════════════════════════════════════════════════════════════

test('CASO 2 · en la banda que la pista sí alcanza, la altura y la energía son exactas', async ({
  page,
}) => {
  // Rampa: y = 10 − x, así que h₀ = 1 m está en x = 9 y h₀ = 10 m en x = 0.
  await page.getByRole('button', { name: /Rampa/ }).click();
  for (const [h, energia] of [
    [1, '9,80 J'],
    [4, '39,20 J'],
    [8, '78,40 J'],
    [10, '98,00 J'],
  ] as const) {
    await poner(page, 'Altura inicial', h);
    const l = await leer(page);
    expect(l.rotuloAltura).toBe(`Altura inicial (h₀ = ${h},0 m)`);
    expect(l['Altura h']).toBe(`${h},00 m`); // la altura pedida, exacta
    expect(l['Energía inicial']).toBe(energia); // E = 1 · 9,8 · h
  }

  // Valle: y = 0,1·(x−10)², invertida x = 10 − √(h/0,1). h₀ = 4 → x = 10 − √40 = 3,68.
  await page.getByRole('button', { name: /Valle parabólico/ }).click();
  for (const [h, energia] of [
    [1, '9,80 J'],
    [4, '39,20 J'],
    [8, '78,40 J'],
    [10, '98,00 J'],
  ] as const) {
    await poner(page, 'Altura inicial', h);
    const l = await leer(page);
    expect(l['Altura h']).toBe(`${h},00 m`);
    expect(l['Energía inicial']).toBe(energia);
  }

  // Invariante que debe cumplirse en las CUATRO pistas y en todo el recorrido del deslizador,
  // aunque el rótulo mienta (HALLAZGO B): la energía inicial que se muestra es siempre
  // m·g·(altura que se muestra). Si esto se rompiera, el fallo ya no sería del rótulo.
  for (const pista of ['Rampa', 'Valle parabólico', 'Montaña rusa', 'Doble joroba']) {
    await page.getByRole('button', { name: new RegExp(pista) }).click();
    for (const h of [1, 6, 10]) {
      await poner(page, 'Altura inicial', h);
      const l = await leer(page);
      const esperada = 1 * 9.8 * aNumero(l['Altura h']); // m = 1 kg, g = 9,8 m/s²
      expect(Math.abs(aNumero(l['Energía inicial']) - esperada)).toBeLessThan(0.06);
    }
  }
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// CASO 3 (rechazo) — altura negativa, masa cero, gravedad cero y rozamiento negativo
// ═════════════════════════════════════════════════════════════════════════════════════════

test('CASO 3 · los cuatro imposibles se rechazan y quedan en el mínimo legal', async ({ page }) => {
  // Ninguno de los cuatro valores tiene sentido físico; el control debe devolverlos al mínimo.
  expect(await poner(page, 'Altura inicial', -5)).toBe('1'); // altura negativa
  expect(await poner(page, 'Masa', 0)).toBe('0.1'); // masa nula
  expect(await poner(page, 'Gravedad', 0)).toBe('1'); // g = 0 divide por m·g al dibujar
  expect(await poner(page, 'Coeficiente de fricción', -1)).toBe('0'); // μ < 0 daría energía

  const l = await leer(page);
  expect(l.rotuloAltura).toBe('Altura inicial (h₀ = 1,0 m)');
  expect(l.rotuloMasa).toBe('Masa (m = 0,1 kg)');
  expect(l.rotuloGravedad).toBe('Gravedad (g = 1,0 m/s²)');
  expect(l.rotuloFriccion).toBe('Coef. fricción (μ = 0,000)');

  // E = m·g·h = 0,1 · 1 · 1 = 0,10 J, y la pelota está a la altura pedida.
  expect(l['Altura h']).toBe('1,00 m');
  expect(l['Energía inicial']).toBe('0,10 J');
  expect(l.Ep).toBe('0,10 J');
  expect(l.Ec).toBe('0,00 J');
  expect(l.Emec).toBe('0,10 J');

  // Nada de lo calculado con esos mínimos puede degenerar.
  const panel = Object.values(l).join(' | ');
  expect(panel).not.toContain('NaN');
  expect(panel).not.toContain('Infinity');
  expect(panel).not.toContain('∞');
  expect(panel).not.toContain('undefined');

  // Y con los mínimos la simulación sigue siendo simulación: la pelota se mueve y conserva.
  const historia = await correr(page, 30, 60);
  expect(Math.max(...historia.map((h) => aNumero(h['Velocidad |v|'])))).toBeGreaterThan(0);
  expect(historia.every((h) => aNumero(h.Emec) > 0.09 && aNumero(h.Emec) < 0.11)).toBe(true);
  expect(historia.every((h) => !h.Emec.includes('NaN'))).toBe(true);
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// REGRESIÓN de los hallazgos 357-362, REPARADOS el 26/08/2026.
//
// La física se fue a `app/simulador-conservacion-energia/motor.ts` y sus invariantes se
// comprueban sin navegador en `tests/conservacion-energia-motor.spec.ts` (18 casos). Lo que
// queda aquí es lo que solo se ve en la página: que el rótulo del deslizador no mienta sobre
// la pelota, que las cifras del panel conserven, y que ni el JSON-LD ni el bloque educativo
// afirmen cosas que la app no hace.
//
// Dos de los seis se reescriben porque el «esperado» del acta no se sostenía:
//
//   · A — el acta esperaba que la pelota llegase al final de la pista y se quedara allí con
//     sus 98 J. Parar la simulación a los 2,8 s mata la demostración que la app existe para
//     dar. Los extremos son ahora TOPES ELÁSTICOS: la pelota rebota sin perder energía, así
//     que lo que se comprueba es que la energía se conserva DURANTE TODO el recorrido, que
//     es más fuerte que comprobarla en un instante.
//
//   · B — el acta esperaba que en montaña rusa h₀ = 1 m colocara la pelota a 1,00 m. Esa
//     pista NO TIENE ningún punto a 1 m: su mínimo real es 2,46 m. El defecto no era dónde
//     caía la pelota, era que el deslizador ofrecía alturas inexistentes; así que lo que se
//     comprueba es que sus dos extremos son alturas que la pista alcanza de verdad.
// ═════════════════════════════════════════════════════════════════════════════════════════

// HALLAZGO A (cálculo, alto) · La pista es finita y `step()` topa x en xMax anulando la
// velocidad. En la rampa —la primera pista del selector— el suelo llano termina en x = 20 y
// la pelota llega ahí a toda velocidad: la app la para en seco y contabiliza los 98 J de
// energía cinética como «Energía disipada», con la nota literal «sin fricción» al lado.
// Las tres barras se van a cero de golpe, que es lo contrario exacto de lo que la tarjeta de
// descripción, la metadata y la propia FAQ prometen. Ocurre 2,8 s después de pulsar Iniciar.
// Caso: Rampa · μ = 0 · h₀ = 10 m · m = 1 kg · g = 9,8 m/s² → en x = 20,00 m esperado
//       E_mecánica 98,00 J y disipada 0,00 J · obtenido E_mecánica 0,00 J y disipada
//       «98,00 J · sin fricción».
test('HALLAZGO A · el tope de la pista no puede disipar 98 J «sin fricción»', async ({ page }) => {
  await page.getByRole('button', { name: /Rampa/ }).click();
  await poner(page, 'Altura inicial', 10);
  expect((await leer(page))['Energía inicial']).toBe('98,00 J');

  // Diez segundos de simulación: de sobra para que la pelota baje los 10 m de rampa, cruce
  // los 10 m de suelo llano y llegue al tope de x = 20, donde antes se paraba en seco.
  const historia = await correr(page, 60, 100);

  // Sin fricción no hay NADA que pueda disipar energía, ni el tope de la pista.
  expect(historia.every((l) => l['Energía disipada'] === '0,00 J')).toBe(true);

  // Y las tres barras no caen a cero a la vez en ningún instante: la energía sigue ahí,
  // repartida entre cinética y potencial. Antes, en x = 20, las tres marcaban 0,00 J.
  expect(Math.min(...historia.map((l) => aNumero(l.Emec)))).toBeGreaterThan(97.9);

  // La pelota llegó al final del recorrido: el tope existe y se ha usado.
  expect(Math.max(...historia.map((l) => aNumero(l['Posición x'])))).toBeGreaterThan(19);
});

// HALLAZGO B (operativa, alto) · El deslizador de altura ofrecía 1-12 m en las cuatro pistas
// (1-10 en la doble joroba) mientras ninguna cubría esa banda: en montaña rusa y doble joroba
// la mitad baja del recorrido era inerte —1, 2, 4 y 6 m daban los cuatro la misma altura— y
// en rampa y valle lo era la parte alta, porque su tope real es 10 m. El rótulo seguía
// afirmando la altura pedida mientras la tarjeta «m·g·h₀» mostraba una energía hasta 6,6
// veces mayor. Ahora el rango se deriva del perfil de cada pista.
// Caso: para cada pista, los dos extremos de su deslizador deben ser alturas que la pelota
//       ocupa de verdad, y la energía inicial ha de ser m·g·(altura mostrada) exacta.
test('HALLAZGO B · el deslizador solo ofrece alturas que su pista alcanza', async ({ page }) => {
  for (const pista of ['Rampa', 'Valle parabólico', 'Montaña rusa', 'Doble joroba']) {
    await page.getByRole('button', { name: new RegExp(pista) }).click();
    await page.waitForTimeout(150);

    const rango = await page.evaluate(() => {
      const el = document.querySelector('input[aria-label="Altura inicial"]') as HTMLInputElement;
      return { min: Number(el.min), max: Number(el.max) };
    });
    expect(rango.max, pista).toBeGreaterThan(rango.min);

    for (const altura of [rango.min, rango.max]) {
      await poner(page, 'Altura inicial', altura);
      const l = await leer(page);
      // La pelota está EXACTAMENTE donde el rótulo dice que está.
      expect(aNumero(l['Altura h']), `${pista} a ${altura} m`).toBeCloseTo(altura, 1);
      // Y la energía inicial es m·g·h de esa misma altura (m = 1 kg, g = 9,8 m/s²).
      expect(aNumero(l['Energía inicial']), `${pista} a ${altura} m`).toBeCloseTo(9.8 * altura, 1);
    }
  }
});

// HALLAZGO C (cálculo, bajo) · Con μ = 0 la tarjeta «Energía disipada» —cuya propia nota dice
// «sin fricción»— llega a marcar 0,09 J, y la energía mecánica llega a 98,24 J partiendo de
// 98,00 J: la pelota gana un 0,24 % de energía de la nada. Es la oscilación normal del Euler
// semi-implícito y es pequeña, pero se le enseña al usuario en una tarjeta que dice que no hay
// nada que disipar, y la FAQ de la app declara que eso es imposible sin aporte externo.
// Caso: valle · μ = 0 · valores de fábrica, 17,5 s de simulación → esperado disipada 0,00 J
//       y E_mecánica ≤ 98,00 J en todo momento · obtenido 0,09 J y 98,24 J.
test('HALLAZGO C · sin fricción no se disipa nada y la energía no crece', async ({ page }) => {
  const historia = await correr(page, 90, 100);
  expect(historia.every((l) => l['Energía disipada'] === '0,00 J')).toBe(true);
  expect(Math.max(...historia.map((l) => aNumero(l.Emec)))).toBeLessThanOrEqual(98);
});

// HALLAZGO D (accesibilidad, medio) · El bloque de las tres barras de energía es
// role="status" aria-live="polite", y sus tres cifras se reescriben en cada fotograma (~60
// veces por segundo) durante toda la simulación. Un lector de pantalla intentaría anunciar
// las tres una y otra vez sin parar. Una región viva sirve para avisar de un cambio, no para
// narrar una animación: aquí el canal correcto es el resumen al pausar, no el flujo continuo.
// Caso: cargar la página → esperado ninguna región viva sobre cifras que cambian a 60 fps ·
//       obtenido <div role="status" aria-live="polite"> envolviendo las tres barras.
test('HALLAZGO D · las barras de energía no narran la animación por aria-live', async ({ page }) => {
  const barras = page.locator('[aria-label="Barras de energía cinética, potencial y mecánica total"]');
  await expect(barras).toHaveCount(1);
  expect(await barras.getAttribute('aria-live')).toBeNull();
});

// HALLAZGO E (accesibilidad, bajo, PASIVO anterior al candado) · `npm run check:a11y-jsx`
// sobre el fichero da 3 <button> sin type= (L517 selector de pista, L606 Iniciar/Pausa, L614
// Reiniciar) y 8 emojis junto a texto sin aria-hidden (L505 el <h1>, L618 «🔄 Reiniciar»,
// L632 «⚡ Cinética», L644 «🪜 Potencial» y los cinco «💡» de la FAQ). Es pasivo: el candado
// juzga las líneas que un commit AÑADE, así que hoy no rompe el build. Los aria-pressed sí
// están bien puestos: los cuatro botones de pista y el de Iniciar/Pausa son conmutadores de
// verdad, y Reiniciar —que es una acción— no lo lleva.
// Caso: los seis botones de la herramienta → esperado type="button" en los seis · obtenido
//       type=null en los cuatro de pista, en Iniciar y en Reiniciar.
test('HALLAZGO E · los botones de la herramienta llevan type="button"', async ({ page }) => {
  for (const nombre of [
    'Rampa',
    'Valle parabólico',
    'Montaña rusa',
    'Doble joroba',
    'Iniciar simulación',
    'Reiniciar',
  ]) {
    const boton = page.getByRole('button', { name: new RegExp(nombre) }).first();
    expect(await boton.getAttribute('type'), `botón «${nombre}»`).toBe('button');
  }
});

// HALLAZGO F (contenido, bajo) · Dos afirmaciones en las que la app se contradice a sí misma:
//   1. El JSON-LD (metadata.ts, `features`) anuncia «Botones de play/pausa/reset y velocidad
//      de simulación». No hay ningún control de velocidad de simulación: los deslizadores son
//      altura, masa, gravedad y rozamiento. Es una función inexistente servida a Google y a
//      los buscadores de IA.
//   2. La tabla del bloque educativo rotula los 44,3 m/s (159 km/h) de una caída libre de
//      100 m como «Velocidad terminal sin paracaídas (limitada por aire)» — pero esa columna
//      es v = √(2gh), o sea SIN aire, y tres secciones más abajo una tarjeta dice que el
//      paracaídas «reduce de 200 km/h a 20 km/h». Las dos cifras no pueden ser la misma
//      magnitud; la de la tarjeta es la que se acerca a la real (~195 km/h boca abajo).
// Caso: JSON-LD y tabla → esperado que no se anuncie un control que no existe y que 159 km/h
//       no se llame velocidad terminal · obtenido las dos afirmaciones tal cual.
test('HALLAZGO F · ni se anuncia un control inexistente ni 159 km/h es la velocidad terminal', async ({
  page,
}) => {
  const schema = (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? '';
  expect(schema).toContain('WebApplication');
  expect(schema).not.toContain('velocidad de simulación');

  // El bloque educativo llega plegado dentro de un <details>: su tabla está en el DOM pero
  // sus filas no exponen role="row", así que se lee por textContent.
  const cuerpo = (await page.locator('body').textContent()) ?? '';
  expect(cuerpo).toContain('44,3 m/s');
  expect(cuerpo).not.toContain('Velocidad terminal sin paracaídas');
  // Y la tarjeta de más abajo ya no contradice a la tabla: dice que los 200 km/h son la
  // velocidad terminal REAL, que ninguna fórmula de la página calcula.
  expect(cuerpo).toContain('que ninguna fórmula de esta página calcula');
});
