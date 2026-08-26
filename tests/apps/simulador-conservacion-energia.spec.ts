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
async function poner(page: Page, etiqueta: string, valor: number): Promise<string> {
  const aceptado = await page.evaluate(
    ([et, v]) => {
      const el = document.querySelector(`input[aria-label="${et}"]`) as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
      setter.call(el, String(v));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return el.value;
    },
    [etiqueta, valor] as [string, number],
  );
  await page.waitForTimeout(200);
  return aceptado;
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
// HALLAZGOS ABIERTOS (Inspector, 26/08/2026)
// Estos seis tests FALLAN hoy a propósito: describen lo que debería ocurrir.
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

  // Correr hasta que la pelota alcance el final de la pista (x = xMax = 20 m).
  const historia = await correr(page, 60, 100, (l) => aNumero(l['Posición x']) >= 20);
  const final = historia[historia.length - 1];
  expect(final['Posición x']).toBe('20,00 m');

  // Sin fricción, esos 98 J tienen que seguir ahí en alguna forma.
  expect(final['Energía disipada']).toBe('0,00 J');
  expect(final.Emec).toBe('98,00 J');
});

// HALLAZGO B (operativa, alto) · El deslizador de altura ofrece 1–12 m en las cuatro pistas
// (1–10 en la doble joroba), pero ninguna pista cubre esa banda. En rampa y valle la altura
// máxima es 10 m y reset() topa el x calculado en xMin, así que 11 y 12 m dan los mismos
// 10 m. En las dos pistas procedurales el barrido busca en x ∈ [xMin, xMin+6], cuyo mínimo
// de y(x) es 6,64 m (montaña rusa) y 7,13 m (doble joroba): la mitad baja del deslizador es
// inerte. En los tres casos el rótulo sigue afirmando la altura pedida, y la tarjeta rotulada
// «m·g·h₀» muestra una energía que no es m·g·h₀ — hasta 6,6 veces mayor.
// Caso: Montaña rusa · h₀ = 1,0 m · m = 1 kg · g = 9,8 → esperado altura 1,00 m y 9,80 J ·
//       obtenido altura 6,64 m y 65,03 J (y 1, 2, 4 y 6 m dan los cuatro exactamente lo mismo).
test('HALLAZGO B · la altura que promete el deslizador es la altura de la que parte la pelota', async ({
  page,
}) => {
  await page.getByRole('button', { name: /Montaña rusa/ }).click();
  await poner(page, 'Altura inicial', 1);
  const bajo = await leer(page);
  expect(bajo.rotuloAltura).toBe('Altura inicial (h₀ = 1,0 m)');
  expect(bajo['Altura h']).toBe('1,00 m'); // hoy: 6,64 m
  expect(bajo['Energía inicial']).toBe('9,80 J'); // hoy: 65,03 J

  // Y el tramo alto en el valle: 12 m debe dar 1 · 9,8 · 12 = 117,60 J, o no ofrecerse.
  await page.getByRole('button', { name: /Valle parabólico/ }).click();
  await poner(page, 'Altura inicial', 12);
  const alto = await leer(page);
  expect(alto['Altura h']).toBe('12,00 m'); // hoy: 10,00 m
  expect(alto['Energía inicial']).toBe('117,60 J'); // hoy: 98,00 J
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

  const fila = page.getByRole('row').filter({ hasText: '44,3 m/s' });
  await expect(fila).not.toContainText('Velocidad terminal');
});
