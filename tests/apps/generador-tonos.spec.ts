import { test, expect, devices, type Page } from '@playwright/test';

/**
 * Generador de Tonos — test de regresión (Inspector, 21/08/2026 · re-inspección 10/09/2026)
 *
 * 1.518 usos reales, segmento «cálculo con salida de audio». Aquí la verdad comprobable NO es
 * un número en pantalla: es la frecuencia que llega DE VERDAD al oscilador. Que exista un
 * botón «Reproducir» y que el campo muestre «440» no prueba nada, así que en todos los casos
 * se instrumenta la Web Audio API (ver `INSTRUMENTAR`) y se comprueba, sobre el nodo real:
 *   - que se crea un OscillatorNode y arranca (`start()`),
 *   - con qué valores se llama a `frequency.setValueAtTime()`,
 *   - qué `frequency.value` y qué `type` tiene el oscilador vivo,
 *   - que el AudioContext queda en estado «running» (si quedara «suspended» no sonaría),
 *   - y desde el 10/09/2026, EL ESPECTRO REALMENTE EMITIDO: la instrumentación engancha un
 *     AnalyserNode a cada oscilador, así que el CASO 4 no comprueba el parámetro que la app
 *     pidió sino el sonido que sale de él.
 *
 * QUÉ PROMETE LA APP (de aquí salen los valores esperados de este fichero):
 *   - <h1> «Generador de Tonos» + subtítulo «Frecuencias de audio de 20Hz a 20kHz».
 *   - metadata.ts → title «Generador de Frecuencias Hz y Tonos Online (20-20000 Hz)» y
 *     jsonLd.features: «Generación de tonos puros entre 20 Hz y 20.000 Hz», «Cuatro formas
 *     de onda: senoidal, cuadrada, triangular, sierra» y «Control fino de frecuencia».
 *   - Bloque educativo: «La nota La4 estándar es 440 Hz (ISO 16:1975)», la lista de notas
 *     Do (261,63 Hz) … Si (493,88 Hz), «muchas orquestas modernas tocan a 441-443 Hz» y
 *     «La polémica de los 432 Hz como frecuencia natural».
 *
 * CÓMO SE DERIVAN LOS NÚMEROS ESPERADOS
 *   Temperamento igual con La4 = 440 Hz:  f(n) = 440 · 2^(n/12), n = semitonos desde La4.
 *     Do4  → n = −9 → 440·2^(−9/12) = 261,6256 Hz → 261,63
 *     Sol4 → n = −2 → 440·2^(−2/12) = 391,9954 Hz → 392,00
 *     Si4  → n = +2 → 440·2^( 2/12) = 493,8833 Hz → 493,88
 *   Distancia en cents entre dos frecuencias: 1200 · log2(f2/f1).
 *   Serie de Fourier de la onda cuadrada: solo armónicos IMPARES, amplitud 1/n
 *     → 3.º armónico = 20·log10(1/3) = −9,54 dB; 5.º = 20·log10(1/5) = −13,98 dB;
 *       armónicos pares = 0 (silencio).
 *   Escalera del barrido: incremento = (hasta − desde) / (duración · 20), un paso cada 50 ms.
 *   NINGÚN valor esperado está copiado de lo que devuelve la app.
 *
 *   El techo físico no es 20.000 Hz sino la frecuencia de Nyquist: con `sampleRate` de
 *   48.000 Hz, `frequency.maxValue` del oscilador es 24.000 Hz y la Web Audio API SATURA
 *   ahí en silencio. Por eso se comprueba que lo mostrado coincide con lo emitido.
 *
 * Chromium arranca con `--autoplay-policy=no-user-gesture-required` para que el
 * AudioContext no se quede suspendido en un navegador sin usuario delante.
 *
 * ORDEN DEL FICHERO
 *   1. CASOS 1-3 (21/08/2026) y CASOS 4-6 (10/09/2026): pasan, y son la red de regresión.
 *   2. HALLAZGOS REPARADOS: los cinco defectos de 08/2026, ya corregidos. Se conservan como
 *      guardias — si vuelven a romperse, se ponen en rojo.
 *   3. HALLAZGOS ABIERTOS (10/09/2026): van con `test.fail()`, la convención de estos
 *      ficheros. Afirman lo que la app DEBERÍA hacer, así que hoy fallan a propósito; el día
 *      que se reparen, Playwright avisará de que hay que quitarles la marca y pasan al bloque 2.
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

/** Lectura del espectro REAL que emite el oscilador vivo, medida con un AnalyserNode. */
interface LecturaEspectro {
  sampleRate: number;
  anchoBin: number;
  /** Frecuencia del bin más alto de todo el espectro. */
  picoHz: number;
  picoDb: number;
  /** Nivel en dB alrededor de cada frecuencia pedida (máximo de ±3 bins). */
  niveles: { f: number; db: number }[];
}

/**
 * Envuelve `createOscillator`, `start`/`stop` y el `setValueAtTime` del parámetro
 * `frequency`. Se inyecta ANTES de cargar la página (`addInitScript`), así que la app
 * usa ya las versiones envueltas sin enterarse.
 *
 * Además engancha a cada oscilador un AnalyserNode propio del test. Va conectado ANTES que
 * la ganancia de la app, así que mide el tono crudo y su lectura no depende del volumen ni
 * de la rampa de arranque.
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
    __analizador: AnalyserNode | null;
    __espectro: (frecuencias: number[]) => LecturaEspectro | null;
  };
  w.__tonos = { osciladores: [] };
  w.__osciladores = [];
  w.__ganancias = [];
  w.__analizador = null;

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

    // 32.768 puntos a 48 kHz dan 1,4648 Hz por bin: suficiente para distinguir 432 de 440 Hz
    // (8 Hz de separación, más de cinco bins).
    const analizador = this.createAnalyser();
    analizador.fftSize = 32768;
    analizador.smoothingTimeConstant = 0;
    osc.connect(analizador);
    w.__analizador = analizador;

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

  w.__espectro = (frecuencias: number[]): LecturaEspectro | null => {
    const analizador = w.__analizador;
    if (!analizador) return null;
    const datos = new Float32Array(analizador.frequencyBinCount);
    analizador.getFloatFrequencyData(datos);
    const anchoBin = analizador.context.sampleRate / analizador.fftSize;

    let picoDb = -Infinity;
    let picoIdx = -1;
    // Se empieza en 1: el bin 0 es la componente continua, que no es un tono.
    for (let i = 1; i < datos.length; i++) {
      if (datos[i] > picoDb) {
        picoDb = datos[i];
        picoIdx = i;
      }
    }

    const nivelEn = (f: number): number => {
      const centro = Math.round(f / anchoBin);
      let maximo = -Infinity;
      for (let i = Math.max(0, centro - 3); i <= Math.min(datos.length - 1, centro + 3); i++) {
        if (datos[i] > maximo) maximo = datos[i];
      }
      return maximo;
    };

    return {
      sampleRate: analizador.context.sampleRate,
      anchoBin,
      picoHz: picoIdx * anchoBin,
      picoDb,
      niveles: frecuencias.map((f) => ({ f, db: nivelEn(f) })),
    };
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

/** El espectro que sale de verdad del oscilador vivo. */
const espectro = (page: Page, frecuencias: number[]): Promise<LecturaEspectro | null> =>
  page.evaluate(
    (fs: number[]) =>
      (window as unknown as { __espectro: (f: number[]) => LecturaEspectro | null }).__espectro(fs),
    frecuencias,
  );

/** El nivel medido en una de las frecuencias pedidas al analizador. */
const nivel = (lectura: LecturaEspectro | null, f: number): number =>
  lectura?.niveles.find((n) => n.f === f)?.db ?? 0;

/**
 * Los hercios que anuncia un rótulo de la app, leídos en FORMATO ESPAÑOL: el punto es
 * separador de millares («15.000 Hz») y la coma, decimal («261,63 Hz»). Leerlo con las
 * reglas inglesas daba 63 en vez de 261,63.
 */
function hzAnunciados(texto: string): number {
  const encontrado = texto.match(/([\d.,]+)\s*Hz/);
  // No es entrada del usuario sino la SALIDA ya formateada por la app, y el test no puede
  // importar `parseSpanishNumber` de `@/lib`: Playwright corre fuera del alias @/.
  // parser-ok: se lee un rótulo que la propia app acaba de imprimir, no un campo de entrada.
  return Number((encontrado?.[1] ?? '').replace(/\./g, '').replace(',', '.'));
}

/** La frecuencia del nodo tarda un quantum en reflejar el `setValueAtTime`. */
async function esperarFrecuencia(page: Page, esperada: number, decimales = 2): Promise<void> {
  await expect
    .poll(async () => (await vivo(page))?.frecuencia ?? -1, {
      timeout: 5000,
      message: `el oscilador nunca llegó a ${esperada} Hz`,
    })
    .toBeCloseTo(esperada, decimales);
}

/** Espera a que el ANÁLISIS del sonido emitido tenga su pico en la frecuencia esperada. */
async function esperarPicoEspectral(page: Page, esperada: number): Promise<void> {
  await expect
    .poll(async () => (await espectro(page, []))?.picoHz ?? -1, {
      timeout: 5000,
      message: `el pico del espectro emitido nunca cayó en ${esperada} Hz`,
    })
    .toBeCloseTo(esperada, -1); // −1 decimal ⇒ tolerancia de 5 Hz (el bin mide 1,46 Hz)
}

/** Todas las frecuencias que la app ha llegado a pedir, en orden. */
async function frecuenciasAplicadas(page: Page): Promise<number[]> {
  return (await registros(page)).flatMap((r) => r.frecuenciasAplicadas);
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
    // Desde el 23/08/2026 los presets se imprimen en formato español («261,63 Hz»), que es
    // obligatorio: la coma es el separador DECIMAL, no de millares. Leerlo con punto daba 63.
    expect(hzAnunciados(texto), `${nota} anunciada por la app`).toBeCloseTo(
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
    // El rótulo sale de `getDescripcionFrecuencia`. Decía «Ultrasonido» desde 16.000 Hz, en
    // contra de la tabla educativa de la propia página (8–20 kHz = «Muy agudos»; ultrasonido
    // = «> 20 kHz, inaudible»), y este mismo comentario avisaba de que al corregirlo habría
    // que actualizar la línea. Corregido el 10/09/2026 (hallazgo 692): 20.000 Hz es
    // exactamente el umbral, y ahí sí se nombra el ultrasonido.
    await expect(page.getByText('Umbral del ultrasonido - Inaudible para la mayoría')).toBeVisible();

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

  // ⚠️ Reescrito el 23/08/2026 al reparar el hallazgo 127. Este caso afirmaba que el valor
  // se satura NADA MÁS escribirlo, y esa era justamente la causa del defecto: acotar en cada
  // pulsación hacía imposible teclear («1000» acababa en 20.000 Hz). Ahora se acota al SALIR
  // del campo, así que la comprobación es la misma con un blur() de por medio — el borde
  // sigue siendo el borde, y sigue sin haber NaN.
  const saturaA = async (escrito: string, esperado: string) => {
    await campoFrecuencia(page).fill(escrito);
    await campoFrecuencia(page).blur();
    await expect(campoFrecuencia(page)).toHaveValue(esperado);
  };

  // 99.999 Hz → techo prometido, 20.000 Hz (no 99.999, ni Nyquist, ni NaN).
  await saturaA('99999', '20000');
  await esperarFrecuencia(page, 20000, 0);

  // 20.001 Hz, un hercio por encima del techo → 20.000 Hz.
  await saturaA('20001', '20000');

  // Negativo → suelo prometido, 20 Hz (una frecuencia negativa es audio inválido).
  await saturaA('-50', '20');
  await esperarFrecuencia(page, 20, 0);

  // Cero y 19 Hz, justo por debajo del suelo → 20 Hz.
  await saturaA('0', '20');
  await saturaA('19', '20');

  // Texto: el campo numérico lo ignora, y al salir vuelve a haber un número válido.
  // (Mientras se escribe el campo puede quedar vacío: eso es lo que permite teclear una
  // frecuencia entera sin que el primer dígito se sature. Ver hallazgo 127.)
  await campoFrecuencia(page).click();
  await campoFrecuencia(page).press('Control+a');
  await campoFrecuencia(page).pressSequentially('abc', { delay: 30 });
  await campoFrecuencia(page).blur();
  await expect(campoFrecuencia(page)).toHaveValue(/^\d+(\.\d+)?$/);

  // Ninguna de las frecuencias que la app ha llegado a aplicar es NaN ni absurda.
  const aplicadas = await frecuenciasAplicadas(page);
  expect(aplicadas.length).toBeGreaterThan(0);
  for (const f of aplicadas) {
    expect(Number.isFinite(f), `frecuencia aplicada: ${f}`).toBe(true);
    expect(f).toBeGreaterThanOrEqual(20);
    expect(f).toBeLessThanOrEqual(20000);
  }
  expect((await vivo(page))?.estadoCtx).toBe('running');
});

// ============================================================
// CASO 4 — NORMAL (10/09/2026): 432 Hz tecleado dígito a dígito,
// comprobado sobre el SONIDO emitido y no sobre el parámetro pedido
// ============================================================
test('CASO 4 — «432» tecleado dígito a dígito emite un tono cuyo pico está en 432 Hz', async ({
  page,
}) => {
  await abrir(page);

  // 432 Hz es la frecuencia que el propio bloque educativo discute («la polémica de los
  // 432 Hz»), y está 1200·log2(432/440) = −31,77 cents por debajo del La4 estándar.
  expect(1200 * Math.log2(432 / 440)).toBeCloseTo(-31.77, 2);

  // Se teclea dígito a dígito, que es el gesto que el hallazgo 127 hacía imposible: con la
  // saturación en cada pulsación, «432» pasaba por 4 → 20 y terminaba en 20.432 → 20.000.
  await campoFrecuencia(page).click();
  await campoFrecuencia(page).press('Control+a');
  await campoFrecuencia(page).pressSequentially('432', { delay: 60 });
  await expect(campoFrecuencia(page)).toHaveValue('432');

  await botonReproducir(page).click();
  await expect.poll(async () => (await registros(page)).length, { timeout: 5000 }).toBe(1);

  // Lo que la app PIDE: exactamente 432, ni 20 ni 20.432.
  expect((await registros(page))[0].frecuenciasAplicadas).toEqual([432]);
  expect((await registros(page))[0].tipoAlArrancar).toBe('sine');
  expect((await registros(page))[0].estadoCtx).toBe('running');

  // Lo que la app EMITE. El bin de la FFT mide sampleRate/32.768: 1,4648 Hz con los 48 kHz
  // habituales y 1,3458 Hz con los 44,1 kHz que da Chromium sin tarjeta de sonido — el
  // sampleRate lo elige el sistema, así que NO se fija aquí. Con cualquiera de los dos,
  // 432 Hz cae a menos de un bin de su sitio y se separa de 440 Hz por casi seis bins.
  const lectura = await espectro(page, []);
  expect(lectura, 'el analizador del test tiene que estar enganchado al oscilador').not.toBeNull();
  expect(lectura?.sampleRate ?? 0).toBeGreaterThanOrEqual(44100);
  expect(lectura?.anchoBin ?? 99, 'resolución de la FFT, en Hz por bin').toBeLessThan(1.5);
  await esperarPicoEspectral(page, 432);

  // ⚠️ Toda comparación de niveles va con `expect.poll`, y no es cosmética: la ventana de la
  // FFT son 32.768 muestras, o sea 0,74 s de sonido a 44,1 kHz. Una lectura tomada nada más
  // arrancar el tono analiza una ventana medio vacía y reparte energía por todo el espectro
  // (medido: el «segundo armónico» de una senoidal daba −28 dB a los 0 ms y −151 dB al
  // llenarse). Sin la espera, el test mediría el transitorio de arranque, no el tono.
  const relArmonico = async (fundamental: number, armonico: number): Promise<number> => {
    const l = await espectro(page, [fundamental, armonico]);
    return nivel(l, armonico) - nivel(l, fundamental);
  };

  // Tono PURO: una senoidal no tiene segundo armónico (medido con la ventana llena: −151 dB).
  await expect
    .poll(() => relArmonico(432, 864), {
      timeout: 8000,
      message: 'la senoidal de 432 Hz emitía un segundo armónico audible',
    })
    .toBeLessThan(-40);

  // La franja que la app rotula para 432 Hz (su tabla: 250–500 Hz = medios-bajos).
  await expect(page.getByText('Medios-bajos - Calidez')).toBeVisible();

  // Y ahora el timbre: «Cuatro formas de onda» es una promesa de jsonLd.features, y la única
  // forma de comprobarla es en el espectro. Onda cuadrada a 1.000 Hz:
  //   armónicos impares con amplitud 1/n → 3.º = 20·log10(1/3) = −9,54 dB
  //                                        5.º = 20·log10(1/5) = −13,98 dB
  //   armónicos pares = 0 → el de 2.000 Hz tiene que estar enterrado.
  await page.getByRole('button', { name: 'Ir a 1.000 Hz' }).click();
  await page.getByRole('button', { name: /Cuadrada/ }).click();
  await expect.poll(async () => (await vivo(page))?.tipo, { timeout: 5000 }).toBe('square');
  await esperarPicoEspectral(page, 1000);

  await expect
    .poll(() => relArmonico(1000, 3000), {
      timeout: 8000,
      message: '3.º armónico de la onda cuadrada',
    })
    .toBeCloseTo(20 * Math.log10(1 / 3), 0); // ±0,5 dB en torno a −9,54 (medido: −9,66)
  await expect
    .poll(() => relArmonico(1000, 5000), {
      timeout: 8000,
      message: '5.º armónico de la onda cuadrada',
    })
    .toBeCloseTo(20 * Math.log10(1 / 5), 0); // ±0,5 dB en torno a −13,98 (medido: −14,19)
  await expect
    .poll(() => relArmonico(1000, 2000), {
      timeout: 8000,
      message: '2.º armónico: una onda cuadrada no lo tiene',
    })
    .toBeLessThan(-40); // medido: −96,7

  // La senoidal vuelve a serlo cuando se pide: el cambio de onda no es solo un color de botón.
  await page.getByRole('button', { name: /Senoidal/ }).click();
  await expect.poll(async () => (await vivo(page))?.tipo, { timeout: 5000 }).toBe('sine');
  await expect
    .poll(() => relArmonico(1000, 3000), {
      timeout: 8000,
      message: 'la senoidal seguía teniendo tercer armónico',
    })
    .toBeLessThan(-40);

  await botonDetener(page).click();
  await expect.poll(async () => (await registros(page))[0].detenido, { timeout: 5000 }).toBe(true);
});

// ============================================================
// CASO 5 — LÍMITE (10/09/2026): barrido con el mínimo MAYOR que
// el máximo, y los bordes del rango en los campos del barrido
// ============================================================
test('CASO 5 — el barrido con «Desde» mayor que «Hasta» ordena los límites y recorre la escalera', async ({
  page,
}) => {
  await abrir(page);

  // Bordes de los campos del barrido: se acotan al salir, igual que el campo principal.
  const desde = page.locator('#sweep-min');
  const hasta = page.locator('#sweep-max');
  await desde.fill('5');
  await desde.blur();
  await expect(desde).toHaveValue('20'); // suelo prometido
  await hasta.fill('99999');
  await hasta.blur();
  await expect(hasta).toHaveValue('20000'); // techo prometido

  // Ahora el caso: límites INVERTIDOS, 2.000 → 500 en 1 segundo.
  //   iniciarSweep ordena: desde = min(2000,500) = 500 · hasta = max(2000,500) = 2.000
  //   incremento = (2000 − 500) / (1 · 20) = 75 Hz, un paso cada 50 ms
  //   escalera aplicada: 575, 650, 725 … 1.925 y vuelta a 500
  //   (al alcanzar 2.000 exactos se reinicia ANTES de aplicar, así que 2.000 no se emite)
  await desde.fill('2000');
  await desde.blur();
  await hasta.fill('500');
  await hasta.blur();
  await page.locator('#sweep-dur').fill('1');

  await page.getByRole('button', { name: /Iniciar barrido/ }).click();
  await expect(page.getByRole('button', { name: /Detener barrido/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.waitForTimeout(1300); // ~26 pasos de 50 ms
  await page.getByRole('button', { name: /Detener barrido/ }).click();

  // El primer valor aplicado es el 440 con el que arranca el oscilador; el resto es el barrido.
  const aplicadas = await frecuenciasAplicadas(page);
  expect(aplicadas[0]).toBe(440);
  const barrido = aplicadas.slice(1);

  // Que se MUEVE es lo que prueba que los límites se ordenaron: con incremento negativo se
  // quedaba clavado en el mínimo sin avisar (hallazgo 128 de 08/2026).
  expect(barrido.length, 'pasos del barrido en 1,3 s').toBeGreaterThanOrEqual(15);
  expect(new Set(barrido).size, 'frecuencias distintas recorridas').toBeGreaterThanOrEqual(10);

  // Y recorre EXACTAMENTE la escalera calculada a mano: 500 + 75k, con k de 0 a 19.
  expect(Math.min(...barrido)).toBe(500);
  expect(Math.max(...barrido)).toBe(1925); // 500 + 75·19
  for (const f of barrido) {
    expect((f - 500) % 75, `paso fuera de la escalera de 75 Hz: ${f}`).toBe(0);
    expect(f).toBeGreaterThanOrEqual(500);
    expect(f).toBeLessThanOrEqual(1925);
  }

  // Lo que se enseña es lo que se emite: el campo y el oscilador terminan en el mismo sitio.
  const mostrada = Number(await campoFrecuencia(page).inputValue());
  expect(barrido).toContain(mostrada);
  await esperarFrecuencia(page, mostrada, 0);
});

// ============================================================
// CASO 6 — RECHAZO (10/09/2026): entradas hostiles en los tres
// campos numéricos; nada de lo que salga puede estar fuera de rango
// ============================================================
test('CASO 6 — ninguna entrada inválida saca al oscilador del rango 20–20.000 Hz', async ({
  page,
}) => {
  await abrir(page);
  await botonReproducir(page).click();
  await expect.poll(async () => (await registros(page)).length, { timeout: 5000 }).toBe(1);

  const tras = async (escrito: string, esperado: string) => {
    await campoFrecuencia(page).fill(escrito);
    await campoFrecuencia(page).blur();
    await expect(campoFrecuencia(page), `«${escrito}» al salir del campo`).toHaveValue(esperado);
  };

  // Notación exponencial: `parseInt('1e4')` se queda con el 1 y descarta el resto, así que
  // 1e4 NO son 10.000 Hz. Lo importante es que acabe dentro del rango y no en NaN.
  await tras('1e4', '20');
  // Campo vacío: `parseInt('') || FREC_MIN` → suelo prometido.
  await tras('', '20');
  // Cifras y letras mezcladas: el <input type="number"> descarta las letras al teclearlas,
  // así que queda «12», y al salir se acota al suelo. Lo que no puede salir es «12abc» ni NaN.
  await campoFrecuencia(page).click();
  await campoFrecuencia(page).press('Control+a');
  await campoFrecuencia(page).pressSequentially('12abc', { delay: 30 });
  await expect(campoFrecuencia(page)).toHaveValue('12');
  await campoFrecuencia(page).blur();
  await expect(campoFrecuencia(page)).toHaveValue('20');

  // Y los bordes, ahora desde los campos del barrido.
  const desde = page.locator('#sweep-min');
  const hasta = page.locator('#sweep-max');
  await desde.fill('-100');
  await desde.blur();
  await expect(desde).toHaveValue('20');
  // Los dos extremos NO caen en el mismo sitio, y está bien que no lo hagan: cada campo usa
  // su propio borde como respaldo (`parseInt(t) || FREC_MIN` en «Desde», `|| FREC_MAX` en
  // «Hasta»), así que un 0 —que es falsy— manda a «Desde» al suelo y a «Hasta» al techo.
  await hasta.fill('0');
  await hasta.blur();
  await expect(hasta).toHaveValue('20000'); // techo, no NaN ni 0

  // Barrido con los límites ya saneados, 20 → 20.000 Hz en 2 s: incremento = 499,5 Hz. Lo que
  // NO puede pasar es que emita NaN ni que se salga del rango prometido.
  await page.locator('#sweep-dur').fill('2');
  await page.getByRole('button', { name: /Iniciar barrido/ }).click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /Detener barrido/ }).click();

  const aplicadas = await frecuenciasAplicadas(page);
  expect(aplicadas.length).toBeGreaterThan(0);
  for (const f of aplicadas) {
    expect(Number.isFinite(f), `frecuencia aplicada: ${f}`).toBe(true);
    expect(f, `frecuencia aplicada fuera del rango prometido: ${f}`).toBeGreaterThanOrEqual(20);
    expect(f, `frecuencia aplicada fuera del rango prometido: ${f}`).toBeLessThanOrEqual(20000);
  }
  // La app sigue viva y sonando tras la ronda de entradas hostiles.
  expect((await vivo(page))?.estadoCtx).toBe('running');
  expect(Number.isNaN((await vivo(page))?.frecuencia ?? NaN)).toBe(false);
});

// ============================================================
// HALLAZGOS DE 08/2026, YA REPARADOS — guardias de regresión
// (verificados de nuevo el 10/09/2026: los cinco siguen en verde)
// ============================================================

/**
 * [127, alto] El campo numérico se re-saturaba en CADA pulsación: al teclear el primer
 * dígito el valor (p. ej. «1») caía por debajo del mínimo y `Math.max(20, …)` lo convertía
 * en 20, así que los dígitos siguientes se añadían detrás de ese 20. Medido entonces:
 * «1000» → 20000, «440» → 2040, «50» → 200. Reparado con un texto espejo que solo se acota
 * al salir del campo.
 */
test('REGRESIÓN 127 — teclear una frecuencia a mano da esa frecuencia', async ({ page }) => {
  await abrir(page);
  await campoFrecuencia(page).click();
  await campoFrecuencia(page).press('Control+a');
  await campoFrecuencia(page).pressSequentially('1000', { delay: 40 });
  await expect(campoFrecuencia(page)).toHaveValue('1000');
});

/**
 * [128, medio] Los campos del barrido llevaban `min`/`max` en el HTML pero el `onChange` no
 * acotaba: tecleando 99999 en «Hasta», la app mostraba frecuencias de hasta 99.999 Hz
 * mientras el oscilador saturaba en Nyquist (24.000 Hz). Enseñaba una frecuencia que no
 * estaba emitiendo.
 */
test('REGRESIÓN 128 — el barrido respeta el rango 20–20.000 Hz que promete la app', async ({
  page,
}) => {
  await abrir(page);
  await page.locator('#sweep-min').fill('15000');
  const hasta = page.locator('#sweep-max');
  await hasta.click();
  await hasta.press('Control+a');
  await hasta.pressSequentially('99999', { delay: 30 }); // alcanzable tecleando, sin trucos
  await expect(hasta).toHaveValue('99999');
  await page.locator('#sweep-dur').fill('1');

  await page.getByRole('button', { name: /Iniciar barrido/ }).click();

  // ⚠️ Campo y oscilador se leen en la MISMA evaluación. Leyéndolos por separado la
  // comparación era una carrera: el barrido cambia de frecuencia cada 50 ms y aquí el paso
  // son (20.000 − 15.000)/20 = 250 Hz, así que las dos lecturas caían a veces a un paso de
  // distancia y el test fallaba una vez de cada tres sin que la app hiciera nada mal
  // (medido el 10/09/2026: 1 fallo en 3 pasadas completas, 0 en 5 pasadas del test suelto).
  let maximoMostrado = 0;
  let maximoEmitido = 0;
  for (let i = 0; i < 12; i++) {
    const par = await page.evaluate(() => {
      const w = window as unknown as { __osciladores: OscillatorNode[] };
      const osc = w.__osciladores[w.__osciladores.length - 1];
      const campo = document.querySelector<HTMLInputElement>('input[aria-label="Frecuencia en Hz"]');
      return { mostrada: Number(campo?.value ?? 0), emitida: osc ? osc.frequency.value : 0 };
    });
    maximoMostrado = Math.max(maximoMostrado, par.mostrada);
    maximoEmitido = Math.max(maximoEmitido, par.emitida);
    await page.waitForTimeout(120);
  }
  await page.getByRole('button', { name: /Detener barrido/ }).click();

  expect(maximoMostrado).toBeLessThanOrEqual(20000); // antes llegaba a 99.999
  // Un paso del barrido son 250 Hz; el defecto que esto vigila abría una brecha de 76.000 Hz
  // (99.999 mostrados contra 24.000 emitidos, que es donde satura Nyquist).
  expect(Math.abs(maximoEmitido - maximoMostrado)).toBeLessThanOrEqual(300);
});

/**
 * [129, medio] El selector de onda es un grupo excluyente (solo una activa, marcada con la
 * clase `.ondaActiva`) y sus botones no exponían `aria-pressed`: con lector de pantalla no
 * había forma de saber qué onda estaba seleccionada. Mismo caso en los presets.
 */
test('REGRESIÓN 129 — el selector de onda expone cuál está activa', async ({ page }) => {
  await abrir(page);
  await page.getByRole('button', { name: /Cuadrada/ }).click();
  await expect(page.getByRole('button', { name: /Cuadrada/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  // Y los presets, que eran el segundo caso del mismo hallazgo.
  await page.getByRole('button', { name: /La \(A4\)/ }).click();
  await expect(page.getByRole('button', { name: /La \(A4\)/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

/**
 * [130, bajo] Emojis decorativos junto a texto sin `aria-hidden="true"`: 〰️ 📐 ⬜ 📈 en el
 * selector de onda (medidos entonces: 28 emojis expuestos frente a 4 ocultos). Un lector de
 * pantalla los anunciaba («onda ondulada Senoidal»).
 */
test('REGRESIÓN 130 — los iconos decorativos del selector de onda van ocultos a la ayuda técnica', async ({
  page,
}) => {
  await abrir(page);
  const icono = page.getByRole('button', { name: /Senoidal/ }).locator('span').first();
  await expect(icono).toHaveAttribute('aria-hidden', 'true');
});

/**
 * [131, bajo] Formato español (regla obligatoria del proyecto): los presets imprimían
 * `{frecuencia} Hz` en crudo, con punto decimal («261.63 Hz»), mientras el bloque educativo
 * de la misma página escribía «261,63 Hz». La app se contradecía a sí misma.
 */
test('REGRESIÓN 131 — los presets de notas usan coma decimal', async ({ page }) => {
  await abrir(page);
  await expect(page.getByRole('button', { name: /Do \(C4\)/ })).toContainText('261,63 Hz');
  // Y los millares con punto, que es la otra mitad de la regla: 15.000, no 15,000.
  // El preset se llamaba «Ultrasonido» y pasó a «Test de edad» el 10/09/2026 (hallazgo 692):
  // 15 kHz los oye la mayoría de menores de 40, y la tabla de la propia página reserva el
  // ultrasonido para «> 20 kHz». La frecuencia y su formato no cambian, que es lo que este
  // caso vigila.
  await expect(page.getByRole('button', { name: /Test de edad/ })).toContainText('15.000 Hz');
});

// ============================================================
// HALLAZGOS ABIERTOS (Inspector 10/09/2026) — fallan a propósito
// ============================================================

/**
 * [A] El campo «Duración» del barrido es el único de los cuatro que se quedó sin texto
 * espejo cuando se reparó el hallazgo 127: su `onChange` hace `parseInt(v) || 5` y escribe
 * el resultado en el propio valor, así que NO se puede vaciar para teclear otro número.
 *
 * Medido el 10/09/2026 (contraste con «Desde», que sí quedó reparado):
 *   #sweep-dur: seleccionar todo + Backspace → «5» (debería quedar vacío) · teclear «3» → «53»
 *   #sweep-min: seleccionar todo + Backspace → «»  · teclear «3» → «3» · al salir → «20»
 * Consecuencia: quien quiera un barrido de 3 s se queda con uno de 53 s, con el incremento
 * casi 18 veces más pequeño, y la app no avisa de nada.
 */
test('HALLAZGO A — el campo «Duración» del barrido debe dejarse borrar y reteclear', async ({
  page,
}) => {
  await abrir(page);
  const duracion = page.locator('#sweep-dur');
  await expect(duracion).toHaveValue('5');

  await duracion.click();
  await duracion.press('Control+a');
  await duracion.press('Backspace');
  await expect(duracion, 'al borrarlo debería quedar vacío, como #sweep-min').toHaveValue('');

  await duracion.pressSequentially('3', { delay: 60 });
  await expect(duracion, 'tecleado «3» debería poner 3 segundos').toHaveValue('3');
});

/**
 * [B] «Duración» tampoco acota lo que recibe, aunque declare `min="1"` en el HTML. Con una
 * duración negativa —alcanzable pegando, y pegar no se bloquea nunca— el incremento sale
 * negativo: (2000 − 20) / (−3 · 20) = −33 Hz por paso. `frecActual` baja, `acotarFrecuencia`
 * la clava en 20 Hz y nunca alcanza `hasta`, así que el barrido no barre.
 *
 * Medido el 10/09/2026 con Desde 20 / Hasta 2.000 / Duración −3, tras 1,5 s de barrido:
 *   el botón anuncia «⏹️ Detener barrido» con aria-pressed=true
 *   frecuencias aplicadas al oscilador: [440, 20] — una sola, y ahí se queda
 * Es el mismo defecto que el hallazgo 128 (barrido clavado por incremento negativo), que se
 * reparó ordenando los límites pero dejando fuera la duración.
 */
test('HALLAZGO B — si el botón dice que está barriendo, el barrido tiene que barrer', async ({
  page,
}) => {
  await abrir(page);
  await page.locator('#sweep-min').fill('20');
  await page.locator('#sweep-min').blur();
  await page.locator('#sweep-max').fill('2000');
  await page.locator('#sweep-max').blur();
  await page.locator('#sweep-dur').fill('-3'); // equivale a pegar «-3»

  await page.getByRole('button', { name: /Iniciar barrido/ }).click();
  await expect(page.getByRole('button', { name: /Detener barrido/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.waitForTimeout(1500);

  const barrido = (await frecuenciasAplicadas(page)).slice(1);
  await page.getByRole('button', { name: /Detener barrido/ }).click();

  expect(
    new Set(barrido).size,
    'un barrido anunciado como activo debe recorrer más de una frecuencia',
  ).toBeGreaterThan(3);
});

/**
 * [C] El campo de frecuencia lee con `parseInt`, así que TRUNCA los decimales — y la app
 * emite presets decimales. Basta con enfocar el campo y salir, sin teclear nada, para
 * desafinar la referencia:
 *
 *   preset Do (C4) → campo «261.63», oscilador a 261,63 Hz, preset marcado como activo
 *   click en el campo + blur → campo «261», oscilador a 261 Hz, preset ya NO activo
 *   desafinación: 1200·log2(261,63/261) = 4,17 cents
 *
 * Lo mismo tecleando: «442.5» → 442 (1,96 cents), y la propia app dice en su bloque
 * educativo que «muchas orquestas modernas tocan a 441-443 Hz». Además `aplicarFrecuencia`
 * lleva escrito en el código que los presets NO se redondean «porque redondear aquí las
 * destruía»: el onBlur del campo hace justo eso, una pantalla más abajo.
 */
test('HALLAZGO C — enfocar y salir del campo no debe desafinar el preset elegido', async ({
  page,
}) => {
  await abrir(page);
  await page.getByRole('button', { name: /Do \(C4\)/ }).click();
  await botonReproducir(page).click();
  await esperarFrecuencia(page, 261.63, 2);
  await expect(campoFrecuencia(page)).toHaveValue('261.63');

  await campoFrecuencia(page).click();
  await campoFrecuencia(page).blur(); // no se teclea NADA

  await expect(campoFrecuencia(page), 'el campo no debería perder los decimales').toHaveValue(
    '261.63',
  );
  await esperarFrecuencia(page, 261.63, 2);
  await expect(page.getByRole('button', { name: /Do \(C4\)/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

/**
 * [D] El preset «Ultrasonido» emite 15.000 Hz, que la propia página clasifica de otras dos
 * maneras: su tabla educativa dice «Ultrasonido: > 20 kHz — inaudible para humanos» y
 * «Muy agudos: 8 – 20 kHz», y al pulsar el preset el rótulo de la app muestra «Muy agudos -
 * Aire». Un tono de 15 kHz es audible para la mayoría de menores de 40 años, así que
 * llamarlo ultrasonido es incorrecto además de contradictorio.
 *
 * Medido el 10/09/2026: botón «Ultrasonido | 15.000 Hz» → franja mostrada «Muy agudos - Aire».
 *
 * REPARADO ese mismo día por el lado del NOMBRE: el preset pasa a llamarse «Test de edad»,
 * que es el uso que la propia tabla da a esa franja («límite audición, test de edad»), y
 * `getDescripcionFrecuencia` deja de llamar ultrasonido a todo lo que pasa de 16 kHz. Subir
 * el preset a 20.000 Hz habría sido la otra opción, pero deja un botón que casi nadie oye.
 * Este test se queda como la invariante de fondo: ningún preset ni rótulo puede nombrar el
 * ultrasonido por debajo del umbral que la tabla de la página declara.
 */
test('HALLAZGO D — el preset llamado «Ultrasonido» debe emitir una frecuencia ultrasónica', async ({
  page,
}) => {
  await abrir(page);
  const presetsUltrasonido = page.getByRole('button', { name: /Ultrasonido/i });
  const cuantos = await presetsUltrasonido.count();

  for (let i = 0; i < cuantos; i++) {
    const hz = hzAnunciados(await presetsUltrasonido.nth(i).innerText());
    expect(
      hz,
      'la propia tabla de la página sitúa el ultrasonido por encima de 20 kHz',
    ).toBeGreaterThanOrEqual(20000);
  }

  // Y el RÓTULO de la frecuencia tampoco lo nombra por debajo del umbral: a 15.000 Hz, que
  // es lo que emite el preset que antes se llamaba así, dice lo mismo que la tabla educativa
  // de la propia página («Muy agudos: 8 – 20 kHz»).
  await page.getByRole('button', { name: /Test de edad/ }).click();
  const rotulo = page.locator('[class*="descripcionFrecuencia"]');
  await expect(rotulo).toHaveText(/Muy agudos/);
  await expect(rotulo).not.toHaveText(/ultrasonido/i);
});
