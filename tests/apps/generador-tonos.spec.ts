import { test, expect, devices, type Page } from '@playwright/test';

/**
 * Generador de Tonos — test de regresión (Inspector, 21/08/2026)
 *
 * 965 usos reales, segmento «cálculo / audio». Aquí la verdad comprobable NO es un número
 * en pantalla: es la frecuencia que llega DE VERDAD al oscilador. Que exista un botón
 * «Reproducir» y que el campo muestre «440» no prueba nada, así que en los tres casos se
 * instrumenta la Web Audio API (ver `INSTRUMENTAR`) y se comprueba, sobre el nodo real:
 *   - que se crea un OscillatorNode y arranca (`start()`),
 *   - con qué valores se llama a `frequency.setValueAtTime()`,
 *   - qué `frequency.value` y qué `type` tiene el oscilador vivo,
 *   - y que el AudioContext queda en estado «running» (si quedara «suspended» no sonaría).
 *
 * QUÉ PROMETE LA APP (de aquí salen los valores esperados de este fichero):
 *   - <h1> «Generador de Tonos» + subtítulo «Frecuencias de audio de 20Hz a 20kHz».
 *   - metadata.ts → title «Generador de Frecuencias Hz y Tonos Online (20-20000 Hz)» y
 *     jsonLd.features: «Generación de tonos puros entre 20 Hz y 20.000 Hz» y «Cuatro formas
 *     de onda: senoidal, cuadrada, triangular, sierra».
 *   - Bloque educativo: «La nota La4 estándar es 440 Hz (ISO 16:1975)» y la lista de notas
 *     Do (261,63 Hz) … Si (493,88 Hz).
 *
 * CÓMO SE DERIVAN LOS NÚMEROS ESPERADOS
 *   Temperamento igual con La4 = 440 Hz:  f(n) = 440 · 2^(n/12), n = semitonos desde La4.
 *     Do4  → n = −9 → 440·2^(−9/12) = 261,6256 Hz → 261,63
 *     Sol4 → n = −2 → 440·2^(−2/12) = 391,9954 Hz → 392,00
 *     Si4  → n = +2 → 440·2^( 2/12) = 493,8833 Hz → 493,88
 *   NINGÚN valor esperado está copiado de lo que devuelve la app.
 *
 *   El techo físico no es 20.000 Hz sino la frecuencia de Nyquist: con `sampleRate` de
 *   48.000 Hz, `frequency.maxValue` del oscilador es 24.000 Hz y la Web Audio API SATURA
 *   ahí en silencio. Por eso se comprueba que lo mostrado coincide con lo emitido.
 *
 * Chromium arranca con `--autoplay-policy=no-user-gesture-required` para que el
 * AudioContext no se quede suspendido en un navegador sin usuario delante.
 *
 * Los HALLAZGOS ABIERTOS van al final, marcados con `test.fail()`: afirman lo que la app
 * debería hacer y hoy fallan a propósito. El día que se reparen saldrán en ROJO
 * («expected to fail, but passed») y habrá que quitarles la marca, quedando como regresión.
 */

test.use({
  launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
});

const RUTA = '/generador-tonos/';

/** Lo que el instrumentador deja en `window.__tonos` para cada oscilador creado. */
interface RegistroOscilador {
  id: number;
  iniciado: boolean;
  detenido: boolean;
  tipoAlArrancar: OscillatorType | null;
  estadoCtx: AudioContextState | null;
  frecuenciasAplicadas: number[];
}

/** Foto del oscilador vivo (el último creado), leída del nodo, no del DOM. */
interface EstadoVivo {
  frecuencia: number;
  tipo: OscillatorType;
  estadoCtx: AudioContextState;
  maxFrecuencia: number;
  ganancia: number | null;
}

/**
 * Envuelve `createOscillator`, `start`/`stop` y el `setValueAtTime` del parámetro
 * `frequency`. Se inyecta ANTES de cargar la página (`addInitScript`), así que la app
 * usa ya las versiones envueltas sin enterarse.
 */
function INSTRUMENTAR(): void {
  interface Registro {
    id: number;
    iniciado: boolean;
    detenido: boolean;
    tipoAlArrancar: OscillatorType | null;
    estadoCtx: AudioContextState | null;
    frecuenciasAplicadas: number[];
  }
  const w = window as unknown as {
    __tonos: { osciladores: Registro[] };
    __osciladores: OscillatorNode[];
    __ganancias: GainNode[];
  };
  w.__tonos = { osciladores: [] };
  w.__osciladores = [];
  w.__ganancias = [];

  const idsPorNodo = new WeakMap<OscillatorNode, number>();

  const crearOsc = AudioContext.prototype.createOscillator;
  AudioContext.prototype.createOscillator = function (this: AudioContext): OscillatorNode {
    const osc = crearOsc.call(this);
    const registro: Registro = {
      id: w.__tonos.osciladores.length,
      iniciado: false,
      detenido: false,
      tipoAlArrancar: null,
      estadoCtx: null,
      frecuenciasAplicadas: [],
    };
    w.__tonos.osciladores.push(registro);
    idsPorNodo.set(osc, registro.id);
    w.__osciladores.push(osc);

    const parametro = osc.frequency;
    const fijar = parametro.setValueAtTime.bind(parametro);
    parametro.setValueAtTime = (valor: number, cuando: number): AudioParam => {
      registro.frecuenciasAplicadas.push(valor);
      return fijar(valor, cuando);
    };
    return osc;
  };

  const crearGanancia = AudioContext.prototype.createGain;
  AudioContext.prototype.createGain = function (this: AudioContext): GainNode {
    const nodo = crearGanancia.call(this);
    w.__ganancias.push(nodo);
    return nodo;
  };

  const arrancar = OscillatorNode.prototype.start;
  OscillatorNode.prototype.start = function (this: OscillatorNode, cuando?: number): void {
    const id = idsPorNodo.get(this);
    if (id !== undefined) {
      const registro = w.__tonos.osciladores[id];
      registro.iniciado = true;
      registro.tipoAlArrancar = this.type;
      registro.estadoCtx = this.context.state;
    }
    return arrancar.call(this, cuando);
  };

  const parar = OscillatorNode.prototype.stop;
  OscillatorNode.prototype.stop = function (this: OscillatorNode, cuando?: number): void {
    const id = idsPorNodo.get(this);
    if (id !== undefined) w.__tonos.osciladores[id].detenido = true;
    return parar.call(this, cuando);
  };
}

async function abrir(page: Page): Promise<void> {
  await page.addInitScript(INSTRUMENTAR);
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Generador de Tonos');
}

const registros = (page: Page): Promise<RegistroOscilador[]> =>
  page.evaluate(
    () =>
      (window as unknown as { __tonos: { osciladores: RegistroOscilador[] } }).__tonos.osciladores,
  );

/** Estado del oscilador vivo. `null` si la app todavía no ha creado ninguno. */
const vivo = (page: Page): Promise<EstadoVivo | null> =>
  page.evaluate(() => {
    const w = window as unknown as { __osciladores: OscillatorNode[]; __ganancias: GainNode[] };
    const osc = w.__osciladores[w.__osciladores.length - 1];
    if (!osc) return null;
    const ganancia = w.__ganancias[w.__ganancias.length - 1];
    return {
      frecuencia: osc.frequency.value,
      tipo: osc.type,
      estadoCtx: osc.context.state,
      maxFrecuencia: osc.frequency.maxValue,
      ganancia: ganancia ? ganancia.gain.value : null,
    };
  });

/** La frecuencia del nodo tarda un quantum en reflejar el `setValueAtTime`. */
async function esperarFrecuencia(page: Page, esperada: number, decimales = 2): Promise<void> {
  await expect
    .poll(async () => (await vivo(page))?.frecuencia ?? -1, {
      timeout: 5000,
      message: `el oscilador nunca llegó a ${esperada} Hz`,
    })
    .toBeCloseTo(esperada, decimales);
}

const campoFrecuencia = (page: Page) => page.getByLabel('Frecuencia en Hz');
const botonReproducir = (page: Page) => page.getByRole('button', { name: /Reproducir/ });
const botonDetener = (page: Page) => page.getByRole('button', { name: /⏹️ Detener$/ });

// ============================================================
// CASO 1 — NORMAL: 440 Hz (La4) suena de verdad, y a 440 Hz
// ============================================================
test('CASO 1 — 440 Hz senoidal crea un oscilador real a 440 Hz, y los cambios llegan en caliente', async ({
  page,
}) => {
  await abrir(page);

  // El valor de partida que muestra la app.
  await expect(campoFrecuencia(page)).toHaveValue('440');
  expect(await registros(page)).toHaveLength(0); // nada suena antes de pulsar

  await botonReproducir(page).click();

  // La prueba de que suena: hay UN oscilador, arrancado, con el contexto en marcha.
  await expect.poll(async () => (await registros(page)).length, { timeout: 5000 }).toBe(1);
  const [osc] = await registros(page);
  expect(osc.iniciado).toBe(true);
  expect(osc.tipoAlArrancar).toBe('sine'); // onda por defecto de la app
  expect(osc.estadoCtx).toBe('running'); // 'suspended' = no sonaría nada
  expect(osc.frecuenciasAplicadas).toEqual([440]); // La4 = 440 Hz (ISO 16:1975)

  const foto = await vivo(page);
  expect(foto?.frecuencia).toBe(440);
  expect(foto?.tipo).toBe('sine');
  // El volumen NO se lee de golpe: la app arranca la ganancia en 0 y sube con
  // `linearRampToValueAtTime(volumen, currentTime + 0.05)`, así que leer `gain.value`
  // nada más pulsar coge la rampa a medias: medido tres veces, la primera lectura da
  // siempre 0,1218 y a los ~10 ms ya está en 0,30. Se espera a que se asiente en el 30 %
  // que muestra la UI; si nunca llegara, el fallo sería real y no de tiempos.
  await expect
    .poll(async () => (await vivo(page))?.ganancia ?? -1, {
      timeout: 5000,
      message: 'la ganancia nunca llegó al 30 % que muestra la UI',
    })
    .toBeCloseTo(0.3, 2);
  await expect(botonDetener(page)).toHaveAttribute('aria-pressed', 'true');

  // Cambio de onda en caliente: el MISMO oscilador cambia de tipo, no se crea otro.
  await page.getByRole('button', { name: /Cuadrada/ }).click();
  await expect.poll(async () => (await vivo(page))?.tipo, { timeout: 5000 }).toBe('square');
  expect(await registros(page)).toHaveLength(1);

  // Cambio de frecuencia en caliente con el atajo «1k».
  await page.getByRole('button', { name: 'Ir a 1.000 Hz' }).click();
  await expect(campoFrecuencia(page)).toHaveValue('1000');
  await esperarFrecuencia(page, 1000, 0);

  // Preset Do (C4): 440·2^(−9/12) = 261,6256 → la app anuncia 261.63 Hz.
  expect(440 * Math.pow(2, -9 / 12)).toBeCloseTo(261.63, 2);
  await page.getByRole('button', { name: /Do \(C4\)/ }).click();
  await expect(campoFrecuencia(page)).toHaveValue('261.63');
  await esperarFrecuencia(page, 261.63, 2);
  // La franja que rotula la app para esa frecuencia (tabla educativa: 250–500 Hz).
  await expect(page.getByText('Medios-bajos - Calidez')).toBeVisible();

  // Las siete notas del bloque «Notas», contra el temperamento igual calculado aquí.
  const semitonosDesdeLa4: [string, number][] = [
    ['Do (C4)', -9],
    ['Re (D4)', -7],
    ['Mi (E4)', -5],
    ['Fa (F4)', -4],
    ['Sol (G4)', -2],
    ['La (A4)', 0],
    ['Si (B4)', 2],
  ];
  for (const [nota, semitonos] of semitonosDesdeLa4) {
    const texto = await page.getByRole('button', { name: nota, exact: false }).first().innerText();
    const anunciada = Number(/([\d.]+)\s*Hz/.exec(texto)?.[1]);
    expect(anunciada, `${nota} anunciada por la app`).toBeCloseTo(
      440 * Math.pow(2, semitonos / 12),
      1,
    );
  }

  // Detener para de verdad el oscilador (no solo cambia el rótulo del botón).
  await botonDetener(page).click();
  await expect.poll(async () => (await registros(page))[0].detenido, { timeout: 5000 }).toBe(true);
  await expect(botonReproducir(page)).toHaveAttribute('aria-pressed', 'false');
});

// ============================================================
// CASO 2 — LÍMITE: los extremos 20 Hz y 20.000 Hz, en móvil
// ============================================================
test.describe('En móvil (Pixel 7)', () => {
  // Se enumeran las opciones en vez de esparcir `...devices['Pixel 7']` porque el device
  // trae `defaultBrowserType`, y Playwright no lo admite dentro de un describe («forces a
  // new worker»). Lo que importa aquí es el viewport de 412×839 y hasTouch.
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  test('CASO 2 — los extremos del rango 20 Hz / 20.000 Hz se aplican tal cual desde el móvil', async ({
    page,
  }) => {
    await abrir(page);

    // La app no debe desbordar a lo ancho en 412 px (viewport del Pixel 7).
    expect(page.viewportSize()?.width).toBe(412);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      ),
    ).toBe(false);
    // El control principal tiene que ser tocable (≥ 44 px de alto, criterio táctil).
    const cajaPlay = await botonReproducir(page).boundingBox();
    expect(cajaPlay?.height ?? 0).toBeGreaterThanOrEqual(44);

    // Extremo superior: 20 kHz, el techo que promete el subtítulo «20Hz a 20kHz».
    await page.getByRole('button', { name: 'Ir a 20.000 Hz' }).click();
    await expect(campoFrecuencia(page)).toHaveValue('20000');
    await expect(page.getByLabel('Seleccionar frecuencia')).toHaveValue('20000');
    await botonReproducir(page).click();
    await expect.poll(async () => (await registros(page)).length, { timeout: 5000 }).toBe(1);
    expect((await registros(page))[0].frecuenciasAplicadas).toEqual([20000]);
    await esperarFrecuencia(page, 20000, 0);

    const foto = await vivo(page);
    expect(foto?.estadoCtx).toBe('running');
    // 20.000 < Nyquist (24.000 con sampleRate 48.000): el tono se emite, no se satura.
    expect(foto?.maxFrecuencia ?? 0).toBeGreaterThan(20000);
    await expect(page.getByText('Ultrasonido - Límite audible')).toBeVisible();

    // Extremo inferior: 20 Hz, sobre el oscilador ya sonando.
    await page.getByRole('button', { name: 'Ir a 20 Hz' }).click();
    await expect(campoFrecuencia(page)).toHaveValue('20');
    await esperarFrecuencia(page, 20, 0);
    await expect(page.getByText('Subgraves - Sentir más que oír')).toBeVisible();

    // Lo mostrado y lo aplicado coinciden en los dos extremos.
    expect((await registros(page))[0].frecuenciasAplicadas).toEqual([20000, 20]);
  });
});

// ============================================================
// CASO 3 — RECHAZO: fuera de rango, negativo y texto
// ============================================================
test('CASO 3 — un valor fuera de rango se satura en el borde y nunca genera NaN', async ({
  page,
}) => {
  await abrir(page);
  await botonReproducir(page).click();
  await expect.poll(async () => (await registros(page)).length, { timeout: 5000 }).toBe(1);

  // 99.999 Hz → techo prometido, 20.000 Hz (no 99.999, ni Nyquist, ni NaN).
  await campoFrecuencia(page).fill('99999');
  await expect(campoFrecuencia(page)).toHaveValue('20000');
  await esperarFrecuencia(page, 20000, 0);

  // 20.001 Hz, un hercio por encima del techo → 20.000 Hz.
  await campoFrecuencia(page).fill('20001');
  await expect(campoFrecuencia(page)).toHaveValue('20000');

  // Negativo → suelo prometido, 20 Hz (una frecuencia negativa es audio inválido).
  await campoFrecuencia(page).fill('-50');
  await expect(campoFrecuencia(page)).toHaveValue('20');
  await esperarFrecuencia(page, 20, 0);

  // Cero y 19 Hz, justo por debajo del suelo → 20 Hz.
  await campoFrecuencia(page).fill('0');
  await expect(campoFrecuencia(page)).toHaveValue('20');
  await campoFrecuencia(page).fill('19');
  await expect(campoFrecuencia(page)).toHaveValue('20');

  // Texto: el campo numérico lo ignora y el estado sigue siendo un número válido.
  await campoFrecuencia(page).click();
  await campoFrecuencia(page).press('Control+a');
  await campoFrecuencia(page).pressSequentially('abc', { delay: 30 });
  await expect(campoFrecuencia(page)).toHaveValue(/^\d+(\.\d+)?$/);

  // Ninguna de las frecuencias que la app ha llegado a aplicar es NaN ni absurda.
  const aplicadas = (await registros(page)).flatMap((r) => r.frecuenciasAplicadas);
  expect(aplicadas.length).toBeGreaterThan(0);
  for (const f of aplicadas) {
    expect(Number.isFinite(f), `frecuencia aplicada: ${f}`).toBe(true);
    expect(f).toBeGreaterThanOrEqual(20);
    expect(f).toBeLessThanOrEqual(20000);
  }
  expect((await vivo(page))?.estadoCtx).toBe('running');
});

// ============================================================
// HALLAZGOS ABIERTOS (Inspector 21/08/2026) — fallan a propósito
// ============================================================

/**
 * El campo numérico se re-satura en CADA pulsación: al teclear el primer dígito el valor
 * (p. ej. «1») cae por debajo del mínimo y `Math.max(20, …)` lo convierte en 20, así que
 * los dígitos siguientes se añaden detrás de ese 20. Resultado medido: «1000» → 20000,
 * «440» → 2040, «50» → 200, «15000» → 20000. Idéntico en escritorio y en móvil.
 */
test.fail('HALLAZGO — teclear una frecuencia a mano debe dar esa frecuencia', async ({ page }) => {
  await abrir(page);
  await campoFrecuencia(page).click();
  await campoFrecuencia(page).press('Control+a');
  await campoFrecuencia(page).pressSequentially('1000', { delay: 40 });
  await expect(campoFrecuencia(page)).toHaveValue('1000'); // hoy devuelve 20000
});

/**
 * Los campos del barrido llevan `min="20" max="20000"` en el HTML, pero el `onChange` no
 * acota (`parseInt(e.target.value) || 20000`). Tecleando 99999 en «Hasta», el barrido
 * muestra frecuencias de hasta 99.999 Hz mientras el oscilador satura en Nyquist
 * (24.000 Hz con sampleRate 48.000): la app enseña una frecuencia que NO está emitiendo.
 */
test.fail(
  'HALLAZGO — el barrido debe respetar el rango 20–20.000 Hz que promete la app',
  async ({ page }) => {
    await abrir(page);
    await page.locator('#sweep-min').fill('15000');
    const hasta = page.locator('#sweep-max');
    await hasta.click();
    await hasta.press('Control+a');
    await hasta.pressSequentially('99999', { delay: 30 }); // alcanzable tecleando, sin trucos
    await expect(hasta).toHaveValue('99999');
    await page.locator('#sweep-dur').fill('1');

    await page.getByRole('button', { name: /Iniciar barrido/ }).click();

    let maximoMostrado = 0;
    let maximoEmitido = 0;
    for (let i = 0; i < 12; i++) {
      maximoMostrado = Math.max(maximoMostrado, Number(await campoFrecuencia(page).inputValue()));
      maximoEmitido = Math.max(maximoEmitido, (await vivo(page))?.frecuencia ?? 0);
      await page.waitForTimeout(120);
    }
    await page.getByRole('button', { name: /Detener barrido/ }).click();

    expect(maximoMostrado).toBeLessThanOrEqual(20000); // hoy llega a 99.999
    expect(maximoEmitido).toBeCloseTo(maximoMostrado, -1); // hoy: 24.000 emitidos vs 99.999 mostrados
  },
);

/**
 * El selector de onda es un grupo excluyente (solo una activa, marcada con la clase
 * `.ondaActiva`), pero los botones no exponen `aria-pressed`: con lector de pantalla no
 * hay forma de saber qué onda está seleccionada. Mismo caso en los presets `.presetActivo`.
 * Regla del proyecto: «todo botón que cambie un filtro o un estado visual lleva aria-pressed».
 */
test.fail('HALLAZGO — el selector de onda debe exponer cuál está activa', async ({ page }) => {
  await abrir(page);
  await page.getByRole('button', { name: /Cuadrada/ }).click();
  await expect(page.getByRole('button', { name: /Cuadrada/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

/**
 * Emojis decorativos junto a texto sin `aria-hidden="true"`: 〰️ 📐 ⬜ 📈 en el selector de
 * onda y 🔉 🔊 en el control de volumen (medidos: 28 emojis expuestos frente a 4 ocultos).
 * Un lector de pantalla los anuncia («onda ondulada Senoidal»).
 */
test.fail(
  'HALLAZGO — los iconos decorativos del selector de onda deben ir ocultos a la ayuda técnica',
  async ({ page }) => {
    await abrir(page);
    const icono = page.getByRole('button', { name: /Senoidal/ }).locator('span').first();
    await expect(icono).toHaveAttribute('aria-hidden', 'true');
  },
);

/**
 * Formato español (regla obligatoria del proyecto): los presets imprimen `{frecuencia} Hz`
 * en crudo, con punto decimal («261.63 Hz»), mientras el bloque educativo de la misma
 * página escribe correctamente «261,63 Hz». La app se contradice a sí misma.
 */
test.fail('HALLAZGO — los presets de notas deben usar coma decimal', async ({ page }) => {
  await abrir(page);
  await expect(page.getByRole('button', { name: /Do \(C4\)/ })).toContainText('261,63 Hz');
});
