import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';

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
 *   4. RE-INSPECCIÓN 25/09/2026: la SOSPECHA de la rampa de ganancia (hallazgo 1509 de
 *      diapason), medida aquí sobre el sonido que sale de la ganancia, y la frecuencia decimal
 *      tras el cambio de parser 527373e0. Los abiertos, con `test.fail()`.
 *   5. INSPECTOR 25/09/2026 (tarde): la SOSPECHA del desmontaje sin rampa y la de los campos del
 *      barrido que truncan con parseInt (las dos vistas al reparar diapason), tres casos nuevos
 *      —timbre triangular y sierra, barrido desde el móvil, formato español en el campo— y un
 *      test por hallazgo. Los abiertos, con `test.fail()`.
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

  // Preset Do (C4): 440·2^(−9/12) = 261,6256 → la app escribe «261,63» en el campo, con coma decimal (hallazgo 1639: con punto, «261.626» se releía como millar).
  expect(440 * Math.pow(2, -9 / 12)).toBeCloseTo(261.63, 2);
  await page.getByRole('button', { name: /Do \(C4\)/ }).click();
  await expect(campoFrecuencia(page)).toHaveValue('261,63');
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
  // Coma decimal: la app escribe el campo en formato español desde el hallazgo 1639.
  await expect(campoFrecuencia(page)).toHaveValue(/^\d+(,\d+)?$/);

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

  // Notación exponencial: ya no se puede ni escribir. El filtro del onChange —el mismo de
  // components/NumberInput.tsx— rechaza la «e», así que el campo conserva el valor anterior
  // en vez de aceptarla y acotarla después. Antes llegaba a entrar porque el navegador la
  // daba por válida en un type="number", y `parseInt('1e4')` se quedaba con el 1.
  await tras('1e4', '440');
  // Campo vacío: `parseInt('') || FREC_MIN` → suelo prometido.
  await tras('', '20');
  // Cifras y letras mezcladas. Desde la reparación del hallazgo 873 el campo es type="text"
  // —en un campo numérico el navegador normalizaba «440,000» a «440.000» y parseSpanishNumber
  // lo leía como millar—, así que quien filtra ya no es el navegador sino el onChange, con la
  // misma regla que components/NumberInput.tsx: solo dígitos, coma, punto y signo. El
  // resultado visible es el mismo que antes, «12», y al salir se acota al suelo.
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
  // El estado de React, no el DOM: un `fill` anterior a la hidratación mueve el campo y no
  // el barrido. Y salir de «Hasta» ya lo ha acotado al techo.
  await esperarValorEnReact(page, '#sweep-min', 15000);
  await esperarValorEnReact(page, '#sweep-max', 20000);
  await esperarValorEnReact(page, '#sweep-dur', 1);

  await page.getByRole('button', { name: /Iniciar barrido/ }).click();

  /*
   * ⚠️ 24/09/2026 — sin reloj de pared. Hasta ese día se tomaban 12 lecturas cada 120 ms y
   * se comparaba el máximo del campo con el máximo de `osc.frequency.value`. Ese valor lo
   * pone el hilo de AUDIO un quantum después del `setValueAtTime`, y con la máquina cargada
   * llegaba dos pasos tarde: brecha de 500 Hz contra un límite de 300, 2 fallos de 4 en la
   * suite entera y 4 de 6 con la CPU ocupada, sin que la app hiciera nada mal. Y si el
   * muestreo no coincidía con la cima del barrido, la cima no se miraba.
   *
   * Ahora se lee lo que la app ORDENA (`setValueAtTime`, instrumentado: el registro entero,
   * no una muestra) y el campo en la misma evaluación, hasta que el barrido haya pasado por
   * la cima; después, en reposo, se exige que campo, orden y oscilador digan lo mismo.
   */
  const PASO = (20000 - 15000) / 20; // 1 s de barrido = 20 pasos de 50 ms
  let maximoMostrado = 0;
  await expect
    .poll(
      async () => {
        const foto = await page.evaluate(() => {
          const w = window as unknown as {
            __tonos: { osciladores: { frecuenciasAplicadas: number[] }[] };
          };
          const campo = document.querySelector<HTMLInputElement>('input[aria-label="Frecuencia en Hz"]');
          const ordenadas = w.__tonos.osciladores.flatMap((o) => o.frecuenciasAplicadas);
          return { mostrada: Number(campo?.value ?? 0), maximoOrdenado: Math.max(0, ...ordenadas) };
        });
        maximoMostrado = Math.max(maximoMostrado, foto.mostrada);
        return foto.maximoOrdenado;
      },
      { timeout: 15000, message: 'el barrido nunca llegó a la cima del rango' },
    )
    .toBeGreaterThanOrEqual(20000 - PASO);
  await page.getByRole('button', { name: /Detener barrido/ }).click();

  // Todo lo que la app ha ordenado cae en el rango que promete —antes llegaba a 99.999— y
  // por debajo del techo del propio oscilador: nada se recorta en Nyquist, así que lo
  // emitido es exactamente lo ordenado.
  const ordenadas = await frecuenciasAplicadas(page);
  const techo = (await vivo(page))?.maxFrecuencia ?? 0;
  for (const f of ordenadas) {
    expect(f, `frecuencia ordenada fuera del rango prometido: ${f}`).toBeGreaterThanOrEqual(20);
    expect(f, `frecuencia ordenada fuera del rango prometido: ${f}`).toBeLessThanOrEqual(20000);
    expect(f, `el oscilador recortaría ${f} Hz a su techo de ${techo}`).toBeLessThanOrEqual(techo);
  }
  expect(maximoMostrado).toBeLessThanOrEqual(20000); // antes llegaba a 99.999

  // Y en reposo el campo enseña lo que suena: la última orden y el valor que el hilo de audio
  // ya aplica. El defecto abría aquí una brecha de 76.000 Hz (99.999 mostrados contra 24.000
  // emitidos); se espera a que el oscilador alcance la orden en vez de dar un plazo fijo.
  const mostradaFinal = Number(await campoFrecuencia(page).inputValue());
  await expect
    .poll(async () => (await frecuenciasAplicadas(page)).slice(-1)[0], {
      message: 'la última frecuencia ordenada no es la que enseña el campo',
    })
    .toBe(mostradaFinal);
  await esperarFrecuencia(page, mostradaFinal, 0);
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
 *   preset Do (C4) → campo «261,63», oscilador a 261,63 Hz, preset marcado como activo
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
  await expect(campoFrecuencia(page)).toHaveValue('261,63');

  await campoFrecuencia(page).click();
  await campoFrecuencia(page).blur(); // no se teclea NADA

  await expect(campoFrecuencia(page), 'el campo no debería perder los decimales').toHaveValue(
    '261,63',
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

// ============================================================
// RE-INSPECCIÓN 25/09/2026 — la SOSPECHA de la rampa (hallazgo 1509
// de diapason) y la frecuencia decimal tras el parser de 527373e0
// ============================================================

const CAMPO_FRECUENCIA = 'input[aria-label="Frecuencia en Hz"]';
const DESLIZADOR_VOLUMEN = 'input[aria-label="Volumen"]';

/**
 * Engancha un AnalyserNode DETRÁS de cada GainNode que crea la app, así que captura el sonido
 * que sale de verdad, con la ganancia ya aplicada (el de `INSTRUMENTAR` va delante de la
 * ganancia y por eso no ve la rampa). Guarda también el `currentTime` del contexto al crear la
 * ganancia, que es el instante en que `iniciarAudio` programa la rampa.
 *
 * Por qué el sonido y no `gain.value` muestreado: el hilo principal ve el reloj de audio a saltos
 * de ~10,7 ms, y con la máquina cargada la primera muestra puede caer pasada la zona donde la
 * rampa y el escalón se distinguen. El búfer del analizador (32.768 muestras: 0,68 s a 48 kHz,
 * 0,74 s a 44,1 kHz) es el sonido mismo, muestra a muestra, y no depende de cuándo se lea
 * — siempre que se lea antes de que el suceso salga de él (ver `esperarAudio`).
 *
 * Se registra ANTES que `INSTRUMENTAR` (los addInitScript corren por orden de registro): el
 * envoltorio de `INSTRUMENTAR` captura este como «el original» y los dos encadenan.
 */
function INSTRUMENTAR_SALIDA(): void {
  const w = window as unknown as {
    __salidas: { an: AnalyserNode; ctx: AudioContext; t0: number }[];
  };
  w.__salidas = [];
  const crear = AudioContext.prototype.createGain;
  AudioContext.prototype.createGain = function (this: AudioContext): GainNode {
    const nodo = crear.call(this);
    const an = this.createAnalyser();
    an.fftSize = 32768;
    nodo.connect(an);
    w.__salidas.push({ an, ctx: this, t0: this.currentTime });
    return nodo;
  };
}

async function abrirConSalida(page: Page): Promise<void> {
  await page.addInitScript(INSTRUMENTAR_SALIDA);
  await abrir(page);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA, DESLIZADOR_VOLUMEN]);
}

interface CapturaSalida {
  sr: number;
  x: number[];
}

const gananciasCreadas = (page: Page): Promise<number> =>
  page.evaluate(() => (window as unknown as { __salidas: unknown[] }).__salidas.length);

/** Segundos de reloj de AUDIO desde que la app creó su última ganancia. */
const segundosDeAudio = (page: Page): Promise<number> =>
  page.evaluate(() => {
    const s = (window as unknown as { __salidas: { ctx: AudioContext; t0: number }[] }).__salidas.at(-1);
    return s ? s.ctx.currentTime - s.t0 : -1;
  });

/**
 * Espera, en el reloj de audio, a que la última ganancia lleve `s` segundos. Sondea cada 20 ms
 * y no con los intervalos por defecto (hasta 1 s): el analizador solo guarda 0,68 s, y un
 * sondeo que se pasara de largo leería un búfer del que el suceso ya ha salido.
 */
async function esperarAudio(page: Page, s: number): Promise<void> {
  await expect
    .poll(() => segundosDeAudio(page), {
      intervals: [20],
      timeout: 10000,
      message: `el reloj de audio nunca llegó a ${s} s`,
    })
    .toBeGreaterThanOrEqual(s);
}

const capturarSalida = (page: Page): Promise<CapturaSalida> =>
  page.evaluate(() => {
    const s = (window as unknown as { __salidas: { an: AnalyserNode; ctx: AudioContext }[] }).__salidas.at(-1)!;
    const x = new Float32Array(s.an.fftSize);
    s.an.getFloatTimeDomainData(x);
    return { sr: s.ctx.sampleRate, x: Array.from(x) };
  });

/**
 * Amplitud emitida en torno al instante `t` (s), contado desde la muestra `desde`: el máximo de
 * |x| en ±1,5 ms. A 440 Hz esa ventana abarca 1,3 periodos, así que su máximo ES la ganancia de
 * ese tramo (el seno llega a su pico dentro); en una rampa de subida, la del final de la ventana.
 */
function amplitud(c: CapturaSalida, desde: number, t: number): number {
  const centro = desde + Math.round(t * c.sr);
  const media = Math.round(0.0015 * c.sr);
  let maximo = 0;
  for (let i = Math.max(0, centro - media); i <= Math.min(c.x.length - 1, centro + media); i++) {
    maximo = Math.max(maximo, Math.abs(c.x[i]));
  }
  return maximo;
}

/** Primera muestra no nula del búfer: donde empieza a sonar. */
const primeraMuestra = (c: CapturaSalida): number => c.x.findIndex((v) => Math.abs(v) > 1e-6);

/**
 * Cuánto tarda la amplitud en bajar del 90 % al 10 % del 30 % de volumen (de 0,27 a 0,03), en
 * ms: desde la ÚLTIMA ventana que aún pasa de 0,27 hasta la primera que ya no llega a 0,03.
 */
function bajada(c: CapturaSalida): { hallada: boolean; ms: number } {
  const paso = Math.round(0.0005 * c.sr);
  let ultimoAlto = -1;
  for (let i = 0; i < c.x.length; i += paso) if (amplitud(c, i, 0) >= 0.27) ultimoAlto = i;
  if (ultimoAlto < 0) return { hallada: false, ms: NaN };
  for (let i = ultimoAlto; i < c.x.length; i += paso) {
    if (amplitud(c, i, 0) <= 0.03) return { hallada: true, ms: ((i - ultimoAlto) / c.sr) * 1000 };
  }
  return { hallada: false, ms: NaN };
}

/**
 * La rampa de entrada que programa `iniciarAudio` (page.tsx ~311-312):
 *   gain.setValueAtTime(0, t0) · gain.linearRampToValueAtTime(volumen, t0 + 0,05)
 * Con el volumen por defecto (30 %): v(t) = 0,3 · t / 0,05 = 6·t, y 0,3 desde los 50 ms. La
 * ventana de ±1,5 ms toma el máximo, así que en una subida mide 6·(t + 0,0015):
 *   5 ms → 0,039 · 10 ms → 0,069 · 20 ms → 0,129 · 30 ms → 0,189 · 150 ms → 0,300
 * Tolerancia ±0,05 (`toBeCloseTo(…, 1)`): el error de la ventana es 0,009, y el defecto se aleja
 * 0,111 como mínimo (0,300 contra 0,189 a los 30 ms). Validado el 25/09/2026 con una ganancia
 * montada a mano con esa misma rampa en la página de la app: 0,038 · 0,065 · 0,126 · 0,187.
 */
function comprobarEntrada(c: CapturaSalida, etiqueta: string): void {
  const inicio = primeraMuestra(c);
  expect(
    inicio,
    `${etiqueta}: la captura tiene que empezar en silencio; si no, el arranque ya salió del búfer`,
  ).toBeGreaterThan(0);
  const esperados: [number, number][] = [
    [0.005, 0.039],
    [0.01, 0.069],
    [0.02, 0.129],
    [0.03, 0.189],
  ];
  for (const [t, esperado] of esperados) {
    expect(amplitud(c, inicio, t), `${etiqueta}: amplitud a ${t * 1000} ms del arranque`).toBeCloseTo(
      esperado,
      1,
    );
  }
  expect(amplitud(c, inicio, 0.15), `${etiqueta}: volumen asentado (30 %)`).toBeCloseTo(0.3, 2);
}

/**
 * [E, bajo — la SOSPECHA de 24/09/2026, confirmada] El tono no tiene rampa de entrada ni de
 * volumen. `iniciarAudio` programa la ganancia de 0 al volumen en 0,05 s, pero el efecto de
 * volumen depende de [volumen, reproduciendo] y, en cuanto `reproduciendo` pasa a true, hace
 * `gain.setValueAtTime(volumen, currentTime)`, que pisa la rampa: es el hallazgo 1509 de
 * diapason, con la misma forma. Y mover el deslizador es un escalón por la misma línea.
 *
 * Medido el 25/09/2026 (volumen 30 %, 440 Hz, 48 kHz):
 *   eventos de la ganancia, en frío:    setValueAtTime(0, 0) · linearRamp(0,3, 0,05) · setValueAtTime(0,3, 0)
 *   eventos, en caliente:               setValueAtTime(0, t0) · linearRamp(0,3, t0+0,05) · setValueAtTime(0,3, t0+0,008)
 *   gain.value en el reloj de audio:    frío 0,300 a los 10,7 ms (esperado 0,064) · caliente 0,300 a los 18,7 ms (esperado 0,112)
 *   amplitud emitida a 5/10/20/30 ms:   0,300 · 0,300 · 0,300 · 0,300, en frío y en caliente
 *                                       (esperado 0,039 · 0,069 · 0,129 · 0,189)
 *   deslizador 30 % → 0 % sonando:      de 0,27 a 0,03 en 0,5 ms, un solo setValueAtTime(0, …)
 * La metadata no promete nada sobre chasquidos; promete «tonos puros» y «control fino de
 * volumen», y el código programa una rampa que no llega a sonar. Qué debería pasar: el tono
 * sube de 0 al volumen en los 0,05 s que programa, y el volumen cambia con rampa.
 *
 * REPARADO el 25/09/2026 (hallazgo 1637), con el mismo arreglo que el 1509 de diapason: el efecto
 * de volumen solo depende de [volumen], y lleva la ganancia al valor nuevo con
 * cancelScheduledValues + setValueAtTime(valor en curso) + linearRamp de 0,05 s. Los tres tests
 * dejan de ser test.fail y quedan como regresión.
 */
test('HALLAZGO E — en frío, el tono entra con la rampa de 0,05 s que programa, desde 0', async ({
  page,
}) => {
  await abrirConSalida(page);
  await botonReproducir(page).click();
  await expect.poll(() => gananciasCreadas(page)).toBe(1);
  await esperarAudio(page, 0.2);
  comprobarEntrada(await capturarSalida(page), 'en frío');
});

test('HALLAZGO E — en caliente (Reproducir → Detener → Reproducir), la entrada es la misma rampa', async ({
  page,
}) => {
  await abrirConSalida(page);
  await botonReproducir(page).click();
  await expect.poll(() => gananciasCreadas(page)).toBe(1);
  await esperarAudio(page, 0.3);
  await botonDetener(page).click();
  await expect(botonReproducir(page)).toHaveAttribute('aria-pressed', 'false');
  await botonReproducir(page).click();
  await expect.poll(() => gananciasCreadas(page)).toBe(2); // cada Reproducir crea su ganancia
  await esperarAudio(page, 0.2);
  comprobarEntrada(await capturarSalida(page), 'en caliente');
});

test('HALLAZGO E — bajar el volumen con el tono sonando es una rampa, no un escalón', async ({
  page,
}) => {
  await abrirConSalida(page);
  await botonReproducir(page).click();
  await expect.poll(() => gananciasCreadas(page)).toBe(1);
  await esperarAudio(page, 0.2); // pasada la rampa de entrada: suena al 30 %
  const antes = await segundosDeAudio(page);
  await page.getByRole('slider', { name: 'Volumen' }).press('Home'); // 30 % → 0 %
  await expect(page.locator('[class*="volumenValor"]')).toHaveText('0%');
  await esperarAudio(page, antes + 0.15);

  const b = bajada(await capturarSalida(page));
  expect(b.hallada, 'la captura contiene la bajada de 0,27 a 0,03').toBe(true);
  // Con una rampa de 50 ms, como la de entrada y salida del propio código (y la que usa
  // diapason desde el 1509): (0,27 − 0,03) / 0,3 · 50 = 40 ms. Un escalón baja en menos de una
  // ventana: medido 0,5 ms. El umbral de 10 ms separa los dos casos sin fijar la duración.
  expect(b.ms, 'milisegundos de 0,27 a 0,03 al bajar el volumen').toBeGreaterThanOrEqual(10);
});

/**
 * [F, bajo] «Detener» tampoco tiene rampa de salida. `detenerAudio` hace
 * `gain.linearRampToValueAtTime(0, currentTime + 0,05)` SIN anclar antes el valor en curso, y
 * una rampa de Web Audio empieza en el EVENTO ANTERIOR, no en «ahora»: aquí, el
 * `linearRamp(0,3, 0,05)` del arranque. Tras T segundos sonando, la rampa va de (0,05 s; 0,3) a
 * (T + 0,05 s; 0), así que en el instante del clic ya vale 0,3 · 0,05 / T: la ganancia cae de
 * golpe y lo que queda de rampa es inaudible.
 *
 * Medido el 25/09/2026 (volumen 30 %, 1,5 s sonando): gain.value a los 10,7 ms del clic = 0,0069
 * (esperado con la rampa de 50 ms: 0,3 · (1 − 10,7/50) = 0,236); amplitud emitida de 0,300 a
 * 0,010 en 5 ms, bajada de 0,27 a 0,03 en 0,5-1,0 ms (esperado ≈ 40 ms). Con un tono de 16.000 Hz,
 * el corte pone en la banda de 1 a 8 kHz un pico 61,8 dB por debajo del tono, frente a 130,9 dB
 * con la rampa de 50 ms: el chasquido cae donde el oído es más sensible, también para quien
 * hace el test de agudos y no oye el tono. Qué debería pasar: la ganancia baja desde el valor
 * en curso a 0 en los 0,05 s que programa el propio código.
 *
 * REPARADO el 25/09/2026 (hallazgo 1638): `detenerAudio` ancla la rampa con
 * cancelScheduledValues + setValueAtTime(valor en curso) y programa el stop del oscilador en el
 * reloj de audio, al final de la rampa (antes un setTimeout de 50 ms podía cortarla). La rampa de
 * salida de `medirRespuesta` se ancla igual.
 */
test('HALLAZGO F — «Detener» baja la ganancia con la rampa de 0,05 s que programa, no de golpe', async ({
  page,
}) => {
  await abrirConSalida(page);
  await botonReproducir(page).click();
  await expect.poll(() => gananciasCreadas(page)).toBe(1);
  await esperarAudio(page, 1.5);
  const antes = await segundosDeAudio(page);
  await botonDetener(page).click();
  await esperarAudio(page, antes + 0.15);

  const b = bajada(await capturarSalida(page));
  expect(b.hallada, 'la captura contiene la bajada de 0,27 a 0,03').toBe(true);
  // Rampa lineal de 50 ms desde 0,3: (0,27 − 0,03) / 0,3 · 50 = 40 ms. Medido: 0,5-1,0 ms.
  expect(b.ms, 'milisegundos de 0,27 a 0,03 al pulsar Detener').toBeGreaterThanOrEqual(10);
});

/**
 * Frecuencia decimal tras 527373e0 (18/09/2026), que pasó el campo a type="text" y lo lee con
 * `parseSpanishNumber`. Resueltos a mano:
 *   NORMAL  «261,63» → coma decimal → 261,63 Hz (Do4 = 440·2^(−9/12) = 261,6256), y el preset
 *           Do (C4) queda marcado: Math.round(261,63) = Math.round(261,63) = 262.
 *   RECHAZO «25.000» → millar español = 25.000 Hz, fuera del rango → al salir, techo 20.000.
 *           «1.2.3» → no es un número (NaN) → al salir, suelo 20.
 */
test('RE-INSPECCIÓN 25/09 — «261,63» con coma llega al oscilador con sus decimales; «25.000» y «1.2.3» se acotan', async ({
  page,
}) => {
  await abrir(page);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA]);
  await botonReproducir(page).click();
  await expect.poll(async () => (await registros(page)).length, { timeout: 5000 }).toBe(1);
  const salir = async () => {
    await campoFrecuencia(page).focus();
    await campoFrecuencia(page).blur();
  };

  await sembrarValor(page, CAMPO_FRECUENCIA, '261,63');
  await esperarFrecuencia(page, 261.63, 2);
  await expect(page.getByRole('button', { name: /Do \(C4\)/ })).toHaveAttribute('aria-pressed', 'true');
  await salir();
  await expect(campoFrecuencia(page)).toHaveValue(/^261,63$/);
  await esperarFrecuencia(page, 261.63, 2);
  await salir(); // y una segunda vez, sin teclear: dos decimales no se leen como millar
  await esperarFrecuencia(page, 261.63, 2);

  await sembrarValor(page, CAMPO_FRECUENCIA, '25.000');
  await salir();
  await expect(campoFrecuencia(page)).toHaveValue('20000');
  await esperarFrecuencia(page, 20000, 0);

  await sembrarValor(page, CAMPO_FRECUENCIA, '1.2.3');
  await salir();
  await expect(campoFrecuencia(page)).toHaveValue('20');
  await esperarFrecuencia(page, 20, 0);
});

/**
 * [G, alto] Una frecuencia con TRES decimales salta a 20.000 Hz al enfocar y salir del campo por
 * segunda vez, sin teclear nada. El onBlur reescribe el campo con `String(n)`, que usa PUNTO
 * decimal —«261,626» pasa a «261.626», también contra el formato español de la app—, y la
 * siguiente lectura de `parseSpanishNumber` toma «261.626» por un millar español (un punto
 * seguido de tres cifras): 261.626 Hz, fuera del rango, acotado al techo. Es la forma del
 * hallazgo 873, pero con la app releyendo lo que ella misma ha escrito.
 *
 * Medido el 25/09/2026, con el tono sonando:
 *   «261,626» → oscilador 261,626 · 1.ª salida: campo «261.626», oscilador 261,626
 *             → 2.ª salida: campo «20000», oscilador 20.000 Hz, rótulo «Umbral del ultrasonido»
 *   igual con «415,305» (La♭4 temperado, 440·2^(−1/12)), «440,125», «20,001» y «999,999».
 *   No les pasa a «261,6256» ni a «442,5» (cuatro y un decimal no forman grupo de millar).
 * Qué debería pasar: la frecuencia sigue en 261,626 Hz por muchas veces que se salga del campo.
 *
 * REPARADO el 25/09/2026 (hallazgo 1639): la app escribe el campo con coma decimal y sin punto
 * de millares («261,626», «20000»), que `parseSpanishNumber` no puede leer de otra manera. Por
 * eso el esperado se estrecha de /261[.,]626/ a la coma sola, y el CASO 1 y el HALLAZGO C, que
 * esperaban «261.63», pasan a «261,63»: consagraban el punto decimal que causaba el defecto.
 */
test('HALLAZGO G — una frecuencia con tres decimales sobrevive a enfocar y salir del campo', async ({
  page,
}) => {
  await abrir(page);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA]);
  await botonReproducir(page).click();
  await expect.poll(async () => (await registros(page)).length, { timeout: 5000 }).toBe(1);
  const salir = async () => {
    await campoFrecuencia(page).focus();
    await campoFrecuencia(page).blur();
  };

  // Do4 con tres decimales: 440·2^(−9/12) = 261,6256 → «261,626». Precisión de 3 decimales:
  // lo que se vigila es que los decimales sigan siendo decimales.
  await sembrarValor(page, CAMPO_FRECUENCIA, '261,626');
  await esperarFrecuencia(page, 261.626, 3);
  await salir();
  await expect(campoFrecuencia(page)).toHaveValue(/^261,626$/);
  await esperarFrecuencia(page, 261.626, 3);

  await salir(); // sin teclear nada
  await expect(campoFrecuencia(page), 'el campo no debe saltar al techo de 20.000 Hz').toHaveValue(
    /^261,626$/,
  );
  await esperarFrecuencia(page, 261.626, 3);
});

// ============================================================
// INSPECTOR 25/09/2026 (tarde) — re-inspección tras reparar 1637-1639
// ============================================================
//
// Viene por la SOSPECHA que dejó la reparación de diapason (4fe67571) y de generador-ondas
// (dbea0e22): el efecto de limpieza de esta página hace `oscillator.stop()` sin tiempo y
// `audioContext.close()` en el mismo instante, sin tocar la ganancia; y los campos del barrido
// leen con `parseInt`. Las dos quedan confirmadas con caso (HALLAZGOS H1 y H2). Además, tres casos
// propios resueltos a mano (CASOS 7, 8 y 9) y un test por cada hallazgo.

/** Lo que el instrumentador del desmontaje anota: cada llamada de audio, con el reloj de AUDIO. */
interface LlamadaDs {
  quien: string;
  metodo: string;
  args: number[];
  ct: number;
}

interface VentanaDs {
  __dsLlamadas: LlamadaDs[];
  __dsBuses: { ctx: AudioContext; g: GainNode; an: AnalyserNode }[];
}

/**
 * El modelo es el de `tests/apps/generador-ondas.spec.ts` («HALLAZGO — al salir a otra app…»):
 * anota los métodos de automatización de cada `gain` que crea la app, start()/stop() con su
 * argumento y cada close(), y desvía todo lo que la app conecta a `ctx.destination` por un bus
 * con un AnalyserNode propio: lo que mide ese bus es exactamente lo que llega a los altavoces.
 * Cuando el contexto se cierra, su analizador conserva las últimas 32.768 muestras (0,68 s a
 * 48 kHz), así que la COLA de ese búfer es el sonido en el instante del corte.
 */
function INSTRUMENTAR_DESMONTAJE(): void {
  const w = window as unknown as VentanaDs;
  w.__dsLlamadas = [];
  w.__dsBuses = [];
  const dueno = new WeakMap<object, { id: string; ctx: BaseAudioContext }>();
  const proto = BaseAudioContext.prototype;
  const crearOsc = proto.createOscillator;
  const crearGan = proto.createGain;
  const crearAn = proto.createAnalyser;
  let nOsc = 0;
  let nGan = 0;

  proto.createOscillator = function (this: BaseAudioContext): OscillatorNode {
    const nodo = crearOsc.call(this);
    dueno.set(nodo, { id: `osc${nOsc++}`, ctx: this });
    return nodo;
  };
  proto.createGain = function (this: BaseAudioContext): GainNode {
    const nodo = crearGan.call(this);
    dueno.set(nodo.gain, { id: `gain${nGan++}.gain`, ctx: this });
    return nodo;
  };

  const anotar = (obj: object, metodo: string, args: unknown[]): void => {
    const d = dueno.get(obj);
    if (!d) return;
    w.__dsLlamadas.push({
      quien: d.id,
      metodo,
      args: args.filter((a): a is number => typeof a === 'number'),
      ct: d.ctx.currentTime,
    });
  };

  const param = AudioParam.prototype as unknown as Record<string, (...a: number[]) => AudioParam>;
  for (const metodo of [
    'setValueAtTime',
    'linearRampToValueAtTime',
    'exponentialRampToValueAtTime',
    'setTargetAtTime',
    'cancelScheduledValues',
    'cancelAndHoldAtTime',
  ]) {
    const original = param[metodo];
    param[metodo] = function (this: AudioParam, ...args: number[]): AudioParam {
      anotar(this, metodo, args);
      return original.apply(this, args);
    };
  }

  const osc = OscillatorNode.prototype;
  const arrancar = osc.start;
  const parar = osc.stop;
  osc.start = function (this: OscillatorNode, cuando?: number): void {
    anotar(this, 'start', cuando === undefined ? [] : [cuando]);
    return arrancar.call(this, cuando);
  };
  osc.stop = function (this: OscillatorNode, cuando?: number): void {
    anotar(this, 'stop', cuando === undefined ? [] : [cuando]);
    return parar.call(this, cuando);
  };
  const cerrar = AudioContext.prototype.close;
  AudioContext.prototype.close = function (this: AudioContext): Promise<void> {
    w.__dsLlamadas.push({ quien: 'ctx', metodo: 'close', args: [], ct: this.currentTime });
    return cerrar.call(this);
  };

  const nodo = AudioNode.prototype as unknown as { connect: (...a: unknown[]) => unknown };
  const conectar = nodo.connect;
  nodo.connect = function (this: AudioNode, destino: unknown, ...resto: unknown[]): unknown {
    if (destino instanceof AudioDestinationNode) {
      const ctx = this.context as AudioContext;
      let bus = w.__dsBuses.find((b) => b.ctx === ctx);
      if (!bus) {
        const g = crearGan.call(ctx);
        const an = crearAn.call(ctx);
        an.fftSize = 32768;
        conectar.call(g, ctx.destination);
        conectar.call(g, an);
        bus = { ctx, g, an };
        w.__dsBuses.push(bus);
      }
      return conectar.call(this, bus.g, ...resto);
    }
    return conectar.call(this, destino, ...resto);
  };
}

async function abrirDesmontaje(page: Page): Promise<void> {
  await page.addInitScript(INSTRUMENTAR_DESMONTAJE);
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Generador de Tonos');
  await esperarHidratacion(page, [CAMPO_FRECUENCIA]);
}

const llamadasDs = (page: Page): Promise<LlamadaDs[]> =>
  page.evaluate(() => (window as unknown as VentanaDs).__dsLlamadas);

/** Reloj de audio del contexto del generador (el primero que conecta algo a los altavoces). */
const relojDs = (page: Page): Promise<number> =>
  page.evaluate(() => (window as unknown as VentanaDs).__dsBuses[0]?.ctx.currentTime ?? -1);

/** Pulsa Reproducir y espera, en el reloj de AUDIO, a que el tono lleve `segundos` sonando. */
async function reproducirDs(page: Page, segundos: number): Promise<void> {
  await botonReproducir(page).click();
  await expect.poll(async () => (await llamadasDs(page)).some((l) => l.metodo === 'start')).toBe(true);
  const inicio = (await llamadasDs(page)).find((l) => l.metodo === 'start')?.ct ?? 0;
  await expect
    .poll(() => relojDs(page), { intervals: [20], timeout: 10000, message: 'el reloj de audio no avanza' })
    .toBeGreaterThanOrEqual(inicio + segundos);
}

interface ColaSalida {
  estado: string;
  /** Hay sonido en el búfer (si no, el suceso ya salió de él). */
  hallada: boolean;
  /** Los últimos 10 ms del búfer ya son silencio: el tono terminó y el contexto sigue vivo. */
  colaSilenciosa: boolean;
  /** Máximo de |x| en los 2 ms que preceden a la ÚLTIMA muestra con sonido. */
  amplitud: number;
}

/** La cola de lo que llegó a los altavoces desde el contexto del generador. */
const colaDeSalida = (page: Page): Promise<ColaSalida> =>
  page.evaluate(() => {
    const b = (window as unknown as VentanaDs).__dsBuses[0];
    const x = new Float32Array(b.an.fftSize);
    b.an.getFloatTimeDomainData(x);
    const sr = b.ctx.sampleRate;
    let ultima = -1;
    for (let i = x.length - 1; i >= 0; i--) {
      if (Math.abs(x[i]) > 1e-6) {
        ultima = i;
        break;
      }
    }
    const colaSilenciosa = ultima < x.length - Math.round(0.01 * sr);
    if (ultima < 0) return { estado: b.ctx.state, hallada: false, colaSilenciosa, amplitud: NaN };
    const ventana = Math.round(0.002 * sr);
    let maximo = 0;
    for (let i = Math.max(0, ultima - ventana); i <= ultima; i++) maximo = Math.max(maximo, Math.abs(x[i]));
    return { estado: b.ctx.state, hallada: true, colaSilenciosa, amplitud: maximo };
  });

/** Sale de la app por la tarjeta de RelatedApps: navegación de cliente, que DESMONTA la página. */
async function salirAOtraApp(page: Page): Promise<void> {
  await page.locator('a[href*="/analizador-espectro/"]').first().click();
  await page.waitForURL(/analizador-espectro/);
}

/**
 * Nivel de un armónico respecto a la fundamental, en dB, sobre el tono crudo del oscilador (el
 * analizador de `INSTRUMENTAR`, delante de la ganancia). Suma la POTENCIA de ±4 bins en vez de
 * tomar el máximo: con 1.000 Hz la fundamental cae a 0,33 bins del centro (682,67 bins a 48 kHz)
 * y el 3.er armónico justo en uno (2.048), y el festoneo de la ventana de Blackman se come 0,48 dB
 * de la referencia — medido: −18,60 con el máximo frente a −19,08 con la suma, igual a 44,1 kHz.
 */
const armonicosRelativos = (page: Page, f0: number, armonicos: number[]): Promise<number[]> =>
  page.evaluate(
    ({ f0, armonicos }) => {
      const an = (window as unknown as { __analizador: AnalyserNode | null }).__analizador;
      if (!an) return armonicos.map(() => 0);
      const datos = new Float32Array(an.frequencyBinCount);
      an.getFloatFrequencyData(datos);
      const anchoBin = an.context.sampleRate / an.fftSize;
      const potencia = (f: number): number => {
        const centro = Math.round(f / anchoBin);
        let suma = 0;
        for (let i = centro - 4; i <= centro + 4; i++) suma += Math.pow(10, datos[i] / 10);
        return 10 * Math.log10(suma);
      };
      const referencia = potencia(f0);
      return armonicos.map((f) => potencia(f) - referencia);
    },
    { f0, armonicos },
  );

// ------------------------------------------------------------
// CASO 7 — NORMAL: «Cuatro formas de onda» (jsonLd.features), comprobadas en el sonido
// ------------------------------------------------------------
/**
 * El CASO 4 ya mide la cuadrada. Faltaban las otras dos, y el bloque educativo afirma de ellas
 * algo comprobable: «La onda sierra contiene todos los armónicos (pares e impares)» y «La onda
 * triangular tiene solo armónicos impares pero con caída mucho más rápida (1/n²)».
 * Series de Fourier, a 1.000 Hz:
 *   triangular → solo impares, amplitud 1/n² → 3.º = 20·log10(1/9)  = −19,08 dB
 *                                              5.º = 20·log10(1/25) = −27,96 dB
 *                                              2.º = 0 (enterrado)
 *   sierra     → todos, amplitud 1/n         → 2.º = 20·log10(1/2) = −6,02 dB
 *                                              3.º = 20·log10(1/3) = −9,54 dB
 *                                              4.º = 20·log10(1/4) = −12,04 dB
 * Precisión ±0,5 dB (`toBeCloseTo(…, 0)`): lo que se vigila es la LEY de caída, y 1/n² frente a
 * 1/n se separan 9,5 dB ya en el 3.er armónico. Medido el 25/09/2026: −19,08 · −27,96 · −140,8 y
 * −6,02 · −9,54 · −12,04 (a 48 y a 44,1 kHz).
 */
test('CASO 7 — triangular (1/n², solo impares) y sierra (1/n, todos) a 1.000 Hz, medidas en el sonido', async ({
  page,
}) => {
  await abrir(page);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA]);
  await page.getByRole('button', { name: 'Ir a 1.000 Hz' }).click();
  await page.getByRole('button', { name: /Triangular/ }).click();
  await expect(page.getByRole('button', { name: /Triangular/ })).toHaveAttribute('aria-pressed', 'true');
  await botonReproducir(page).click();
  await expect.poll(async () => (await registros(page)).length, { timeout: 5000 }).toBe(1);
  expect((await registros(page))[0].tipoAlArrancar).toBe('triangle');
  expect((await registros(page))[0].frecuenciasAplicadas).toEqual([1000]);

  // La ventana de la FFT son 0,68-0,74 s: cada nivel se sondea hasta que se llena (ver CASO 4).
  const nivelDe = async (armonico: number): Promise<number> =>
    (await armonicosRelativos(page, 1000, [armonico]))[0];
  await expect
    .poll(() => nivelDe(3000), { timeout: 8000, message: 'triangular: 3.er armónico' })
    .toBeCloseTo(20 * Math.log10(1 / 9), 0); // −19,08
  await expect
    .poll(() => nivelDe(5000), { timeout: 8000, message: 'triangular: 5.º armónico' })
    .toBeCloseTo(20 * Math.log10(1 / 25), 0); // −27,96
  await expect
    .poll(() => nivelDe(2000), { timeout: 8000, message: 'triangular: no tiene armónicos pares' })
    .toBeLessThan(-40); // medido: −140,8

  // Sierra, en caliente sobre el MISMO oscilador.
  await page.getByRole('button', { name: /Sierra/ }).click();
  await expect.poll(async () => (await vivo(page))?.tipo, { timeout: 5000 }).toBe('sawtooth');
  expect(await registros(page)).toHaveLength(1);
  await expect
    .poll(() => nivelDe(2000), { timeout: 8000, message: 'sierra: 2.º armónico (par)' })
    .toBeCloseTo(20 * Math.log10(1 / 2), 0); // −6,02
  await expect
    .poll(() => nivelDe(3000), { timeout: 8000, message: 'sierra: 3.er armónico' })
    .toBeCloseTo(20 * Math.log10(1 / 3), 0); // −9,54
  await expect
    .poll(() => nivelDe(4000), { timeout: 8000, message: 'sierra: 4.º armónico (par)' })
    .toBeCloseTo(20 * Math.log10(1 / 4), 0); // −12,04

  await botonDetener(page).click();
  await expect.poll(async () => (await registros(page))[0].detenido, { timeout: 5000 }).toBe(true);
});

// ------------------------------------------------------------
// CASO 8 — LÍMITE, en móvil: el barrido 100 → 1.100 Hz en 1 s, a toques
// ------------------------------------------------------------
test.describe('Inspector 25/09/2026 (tarde) — en móvil (Pixel 7)', () => {
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  /**
   * Resuelto a mano con `iniciarSweep`: desde = 100, hasta = 1.100, 1 s = 20 pasos de 50 ms,
   *   incremento = (1100 − 100) / (1 · 20) = 50 Hz (exacto en coma flotante)
   *   escalera aplicada: 150, 200, … 1.050 y, en el paso 20, frecActual = 1.100 ≥ hasta → vuelve a
   *   100 y aplica 100. El techo (1.100) no llega a emitirse nunca; el suelo solo en la vuelta.
   * Medido el 25/09/2026: [440, 150, 200, … 1050, 100, 150, …].
   * Se espera a que la vuelta a 100 aparezca en el registro, no un plazo de reloj. Con la máquina
   * cargada React puede agrupar dos pasos en un render, así que no se exige cada peldaño: se exige
   * que todo lo emitido esté EN la escalera.
   */
  test('CASO 8 — el barrido 100 → 1.100 Hz en 1 s recorre la escalera de 50 Hz y vuelve al suelo', async ({
    page,
  }) => {
    await abrir(page);
    await esperarHidratacion(page, ['#sweep-min', '#sweep-max', '#sweep-dur']);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

    for (const [campo, valor] of [
      ['#sweep-min', '100'],
      ['#sweep-max', '1100'],
      ['#sweep-dur', '1'],
    ] as const) {
      await page.locator(campo).tap();
      await page.locator(campo).fill(valor);
      await esperarValorEnReact(page, campo, valor);
    }

    const iniciar = page.getByRole('button', { name: /Iniciar barrido/ });
    expect((await iniciar.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44); // tocable
    await iniciar.tap();
    await expect(page.getByRole('button', { name: /Detener barrido/ })).toHaveAttribute('aria-pressed', 'true');

    const barrido = async (): Promise<number[]> => (await frecuenciasAplicadas(page)).slice(1);
    await expect
      .poll(async () => (await barrido()).includes(100), {
        timeout: 10000,
        message: 'el barrido nunca volvió al suelo de 100 Hz',
      })
      .toBe(true);
    await page.getByRole('button', { name: /Detener barrido/ }).tap();

    const aplicadas = await frecuenciasAplicadas(page);
    expect(aplicadas[0]).toBe(440); // el tono arranca en la frecuencia del campo
    const pasos = aplicadas.slice(1);
    for (const f of pasos) {
      expect((f - 100) % 50, `fuera de la escalera de 50 Hz: ${f}`).toBe(0);
      expect(f).toBeGreaterThanOrEqual(100);
      expect(f, 'el techo de 1.100 Hz no se emite: la vuelta llega antes').toBeLessThanOrEqual(1050);
    }
    expect(new Set(pasos).size, 'peldaños distintos recorridos').toBeGreaterThanOrEqual(10);

    // Al parar el barrido el tono sigue, y el campo enseña lo que suena.
    const mostrada = Number(await campoFrecuencia(page).inputValue());
    expect(pasos).toContain(mostrada);
    await esperarFrecuencia(page, mostrada, 0);
    await botonDetener(page).tap();
    await expect.poll(async () => (await registros(page))[0].detenido, { timeout: 5000 }).toBe(true);
  });
});

// ------------------------------------------------------------
// CASO 9 — RECHAZO y formato español en el campo principal, con el tono sonando
// ------------------------------------------------------------
/**
 * Resuelto a mano con `parseSpanishNumber` y `acotarFrecuencia` (20–20.000 Hz):
 *   «15.000»   → punto seguido de tres cifras = millar español → 15.000 Hz, dentro del rango.
 *                Tecleado dígito a dígito pasa por 1 · 15 · «15.» · 15,0 · 15,00: todos < 20, así
 *                que NINGÚN intermedio llega al oscilador → aplicadas [440, 15000].
 *                Rótulo (8.000 ≤ f < 16.000): «Muy agudos - Aire». Al salir: «15000» (sin millar).
 *   «20.000,5» → con los dos separadores manda el último → 20.000,5 > 20.000 → al salir, 20.000;
 *                rótulo «Umbral del ultrasonido - Inaudible para la mayoría».
 *   «19,99»    → 19,99 < 20 → al salir, 20; rótulo «Subgraves - Sentir más que oír».
 * Medido el 25/09/2026: exactamente eso.
 */
test('CASO 9 — «15.000» es quince mil hercios sin pasar por 15; «20.000,5» y «19,99» se acotan al salir', async ({
  page,
}) => {
  await abrir(page);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA]);
  await botonReproducir(page).click();
  await expect.poll(async () => (await registros(page)).length, { timeout: 5000 }).toBe(1);
  const rotulo = page.locator('[class*="descripcionFrecuencia"]');
  const salir = async () => {
    await campoFrecuencia(page).focus();
    await campoFrecuencia(page).blur();
  };

  await campoFrecuencia(page).click();
  await campoFrecuencia(page).press('Control+a');
  await campoFrecuencia(page).pressSequentially('15.000', { delay: 40 });
  await esperarValorEnReact(page, CAMPO_FRECUENCIA, '15.000');
  await esperarFrecuencia(page, 15000, 0);
  expect(await frecuenciasAplicadas(page), 'ningún valor a medio teclear llega al oscilador').toEqual([
    440, 15000,
  ]);
  await expect(rotulo).toHaveText('Muy agudos - Aire');
  await salir();
  await expect(campoFrecuencia(page)).toHaveValue('15000');

  await sembrarValor(page, CAMPO_FRECUENCIA, '20.000,5');
  await salir();
  await expect(campoFrecuencia(page)).toHaveValue('20000');
  await esperarFrecuencia(page, 20000, 0);
  await expect(rotulo).toHaveText('Umbral del ultrasonido - Inaudible para la mayoría');

  await sembrarValor(page, CAMPO_FRECUENCIA, '19,99');
  await salir();
  await expect(campoFrecuencia(page)).toHaveValue('20');
  await esperarFrecuencia(page, 20, 0);
  await expect(rotulo).toHaveText('Subgraves - Sentir más que oír');

  for (const f of await frecuenciasAplicadas(page)) {
    expect(f, `frecuencia aplicada fuera del rango prometido: ${f}`).toBeGreaterThanOrEqual(20);
    expect(f, `frecuencia aplicada fuera del rango prometido: ${f}`).toBeLessThanOrEqual(20000);
  }
});

// ------------------------------------------------------------
// SOSPECHA (a) — el desmontaje con el tono sonando
// ------------------------------------------------------------

/**
 * Lo que en generador-ondas era el hallazgo ALTO (el tono seguía sonando en la app de destino)
 * aquí NO pasa: la limpieza cierra el contexto. Medido el 25/09/2026 tras el clic en la tarjeta
 * «Analizador Espectro»: contexto «closed». Queda como guardia.
 */
test('SOSPECHA (a) — salir a otra app con el tono sonando lo deja en silencio', async ({ page }) => {
  await abrirDesmontaje(page);
  await reproducirDs(page, 0.3);
  await salirAOtraApp(page);
  await expect
    .poll(
      async () =>
        page.evaluate(() =>
          (window as unknown as VentanaDs).__dsBuses.every((b) => {
            if (b.ctx.state === 'closed') return true;
            const x = new Float32Array(2048);
            b.an.getFloatTimeDomainData(x);
            return x.every((v) => Math.abs(v) < 1e-3);
          }),
        ),
      { timeout: 5000, message: 'el tono sigue llegando a los altavoces en la app de destino' },
    )
    .toBe(true);
});

/**
 * HALLAZGO H1 [bajo] (Inspector 25/09/2026) — SOSPECHA (a) confirmada. El efecto de limpieza
 * (page.tsx ~289-311) hace `oscillatorRef.current.stop()` SIN tiempo y `audioContextRef.current
 * .close()` en el mismo instante, sin ninguna automatización de la ganancia. Es el 1730 de
 * diapason y la forma que el 1638 reparó esta mañana en «Detener»: al salir con el tono sonando,
 * se corta en seco.
 * Medido el 25/09/2026 (440 Hz, 30 %, 48 kHz, 1 s sonando, clic en «Analizador Espectro»):
 *   llamadas tras el clic: stop() sin argumento (ct 1,0507) · close() (ct 1,0507) — nada más
 *   cola de lo emitido: 0,30 en cada uno de los últimos 60 ms, hasta la última muestra
 * Esperado con una rampa de 50 ms como la de «Detener» (RAMPA_GANANCIA_S): en los 2 ms previos a
 * la última muestra con sonido, 0,3 · 2/50 = 0,012. Umbral 0,03 (el 10 % del volumen): el
 * defecto está a 0,30, diez veces por encima.
 * Referencias del patrón reparado: `apagarConRampa` de app/diapason y generador-ondas (dbea0e22).
 */
test('HALLAZGO H1 — al salir a otra app, la ganancia baja con rampa antes de stop()/close()', async ({
  page,
}) => {
  test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
  await abrirDesmontaje(page);
  await reproducirDs(page, 1.0);
  const desde = (await llamadasDs(page)).length;
  await salirAOtraApp(page);

  // Se espera a que el sonido haya terminado: o el contexto está cerrado, o su cola ya es silencio.
  await expect
    .poll(
      async () => {
        const c = await colaDeSalida(page);
        return c.estado === 'closed' || c.colaSilenciosa;
      },
      { intervals: [20], timeout: 5000, message: 'el tono no termina al salir de la página' },
    )
    .toBe(true);
  const cola = await colaDeSalida(page);
  expect(cola.hallada, 'la captura contiene el final del tono').toBe(true);
  expect(cola.amplitud, 'amplitud en los 2 ms previos al corte (0,012 con rampa de 50 ms)').toBeLessThanOrEqual(0.03);

  // Y el orden de las llamadas: rampa a 0, stop() al final de la rampa, close() después.
  const log = (await llamadasDs(page)).slice(desde);
  const iRampa = log.findIndex(
    (l) =>
      l.quien === 'gain0.gain' &&
      ['linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'setTargetAtTime'].includes(l.metodo) &&
      Number(l.args[0]) <= 1e-3,
  );
  const stop = log.find((l) => l.quien === 'osc0' && l.metodo === 'stop');
  expect(iRampa, `llamadas tras salir: ${JSON.stringify(log)}`).toBeGreaterThanOrEqual(0);
  expect(stop?.args.length, 'stop() sin argumento corta en el acto').toBe(1);
  expect(Number(stop?.args[0])).toBeGreaterThanOrEqual(Number(log[iRampa].args[1]) - 1e-6);
  const iClose = log.findIndex((l) => l.metodo === 'close');
  if (iClose >= 0) expect(iClose, 'close() antes que stop() corta la rampa').toBeGreaterThan(log.indexOf(stop!));
});

// ------------------------------------------------------------
// SOSPECHA (b) — los campos del barrido truncan con parseInt
// ------------------------------------------------------------

/**
 * HALLAZGO H2 [bajo] (Inspector 25/09/2026) — SOSPECHA (b) confirmada, la forma del 691 (campo de
 * frecuencia de esta app) y del 1733 de diapason. «Desde», «Hasta» y «Duración» son type="number"
 * y se leen con `parseInt` (page.tsx ~852, ~873, ~903 y los onBlur ~856, ~877, ~907). El navegador
 * entrega «2,5» como «2.5» (medido en es-ES y en en-US) y `parseInt` se queda con 2.
 *
 * Duración «2,5» s, con Desde 20 y Hasta 2.000 (los de partida):
 *   esperado  incremento = (2000 − 20) / (2,5 · 20) = 39,6 Hz → peldaños 60 · 99 · 139 · 178 · 218…
 *   obtenido  incremento = (2000 − 20) / (2 · 20)   = 49,5 Hz → peldaños 70 · 119 · 169 · 218…
 *             y el campo pasa a «2» al salir: el barrido va un 25 % más rápido de lo pedido.
 * Con «0,5» es peor: parseInt da 0, que es falsy, y `|| DUR_DEFECTO` lo convierte en 5 s — diez
 * veces lo pedido, cuando `acotarDuracion` lo habría llevado al mínimo de 1 s.
 * Tolerancia: cada peldaño emitido a ≤ 1 Hz de la escalera de 39,6 (la app redondea cada paso).
 */
test('HALLAZGO H2 — «Duración» 2,5 s barre con el paso de 2,5 s, no con el de 2 s', async ({ page }) => {
  test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
  await abrir(page);
  await esperarHidratacion(page, ['#sweep-dur']);
  const duracion = page.locator('#sweep-dur');
  await duracion.click();
  await duracion.press('Control+a');
  await duracion.pressSequentially('2,5', { delay: 40 });
  await duracion.blur();

  await page.getByRole('button', { name: /Iniciar barrido/ }).click();
  await expect
    .poll(async () => (await frecuenciasAplicadas(page)).length, {
      timeout: 10000,
      message: 'el barrido no avanza',
    })
    .toBeGreaterThanOrEqual(8);
  await page.getByRole('button', { name: /Detener barrido/ }).click();

  const escalera = Array.from({ length: 51 }, (_, k) => Math.round(20 + 39.6 * k));
  for (const f of (await frecuenciasAplicadas(page)).slice(1)) {
    const distancia = Math.min(...escalera.map((e) => Math.abs(e - f)));
    expect(distancia, `${f} Hz no está en la escalera de 39,6 Hz de un barrido de 2,5 s`).toBeLessThanOrEqual(1);
  }
});

/**
 * HALLAZGO H2 (segundo caso, mismo defecto). «Desde» 261,63 Hz (Do4, 440·2^(−9/12) = 261,6256),
 * «Hasta» 300, «Duración» 1:
 *   esperado  el suelo del barrido es 261,63: la app redondea cada paso, así que lo más bajo que
 *             emite es round(261,63) = 262 (o 261,63 si dejara de redondear) — nunca menos de 261,13
 *   obtenido  el campo pasa a «261» al salir y la vuelta del barrido emite 261 Hz
 *             (medido: [440, 263, 265, … 298, 300, 261, 263, …]).
 */
test('HALLAZGO H2 — «Desde» 261,63 Hz no se trunca a 261 en el barrido', async ({ page }) => {
  test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
  await abrir(page);
  await esperarHidratacion(page, ['#sweep-min', '#sweep-max', '#sweep-dur']);
  for (const [campo, texto] of [
    ['#sweep-min', '261,63'],
    ['#sweep-max', '300'],
    ['#sweep-dur', '1'],
  ] as const) {
    await page.locator(campo).click();
    await page.locator(campo).press('Control+a');
    await page.locator(campo).pressSequentially(texto, { delay: 40 });
    await page.locator(campo).blur();
  }

  await page.getByRole('button', { name: /Iniciar barrido/ }).click();
  // 25 peldaños garantizan al menos una vuelta al suelo (un ciclo son 20 pasos).
  await expect
    .poll(async () => (await frecuenciasAplicadas(page)).length, { timeout: 10000 })
    .toBeGreaterThanOrEqual(26);
  await page.getByRole('button', { name: /Detener barrido/ }).click();

  const barrido = (await frecuenciasAplicadas(page)).slice(1);
  expect(Math.min(...barrido), 'suelo del barrido pedido: 261,63 Hz').toBeGreaterThanOrEqual(261.13);
});

// ------------------------------------------------------------
// Resto de hallazgos de la inspección
// ------------------------------------------------------------

/**
 * HALLAZGO H3 [bajo · contenido] (Inspector 25/09/2026). Formato español desde el 25/09/2026: el %
 * va SEPARADO de la cifra con espacio duro («30 %»). Pegado en cuatro sitios visibles:
 *   el rótulo del volumen (page.tsx ~806, «{Math.round(volumen * 100)}%» → «30%»)
 *   «ajusta el volumen al 30-50%» (guía del test de audición, ~1302)
 *   «reduce el volumen al 20-30%» (consejos, ~1354)
 *   «Mantén siempre el volumen por debajo del 50%» (advertencias, ~1385)
 * Ojo al repararlo: el HALLAZGO E de más arriba espera «0%» en el rótulo y habrá que pasarlo a «0 %».
 */
test('HALLAZGO H3 — el % va separado de la cifra con espacio duro', async ({ page }) => {
  test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
  await abrir(page);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA]);
  await expect(page.locator('[class*="volumenValor"]')).toHaveText('30 %');
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const texto = await page.locator('body').innerText();
  expect(texto.match(/\d%/g) ?? [], '% pegados a la cifra en el texto visible').toEqual([]);
});

/**
 * HALLAZGO H4 [bajo · accesibilidad] (Inspector 25/09/2026). Emojis junto a texto expuestos a la
 * ayuda técnica: el 130 (08/2026) listaba «▶️/⏹️ dentro del nombre accesible del botón principal»,
 * «🔉 🔊 en el volumen» y «los iconos de las tarjetas», pero su reparación solo cubrió el selector
 * de onda. Medido hoy en el árbol de accesibilidad: button «▶️ Reproducir» (y «⏹️ Detener»),
 * button «🔄 Iniciar barrido», 🔉 y «🔊 30%» en el volumen, 🔊 👂 🎵 en «Usos comunes», y con la
 * guía abierta 👂 🎵 🔊 🏫 · 🎧 📉 🔁 🎼 🐕 🏠 · ⚠️: 17 emojis de la app que lee un lector de pantalla.
 * Ojo al repararlo: `botonDetener` (arriba) busca /⏹️ Detener$/ y habrá que aflojarlo.
 */
test('HALLAZGO H4 — los emojis decorativos no forman parte de lo que anuncia el lector de pantalla', async ({
  page,
}) => {
  test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
  await abrir(page);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA]);
  await expect(page.getByRole('button', { name: 'Reproducir', exact: true })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Iniciar barrido', exact: true })).toHaveCount(1);
  const emoji = /\p{Extended_Pictographic}/u;
  expect(await page.locator('[class*="volumenControl"]').ariaSnapshot()).not.toMatch(emoji);
  expect(await page.locator('[class*="infoGrid"]').ariaSnapshot()).not.toMatch(emoji);
});

/**
 * HALLAZGO H5 [bajo · accesibilidad] (Inspector 25/09/2026). Los dos deslizadores no llevan
 * aria-valuetext, así que el lector anuncia el valor crudo del <input type="range">:
 *   Volumen → anuncia «0.3» (con punto decimal) mientras la pantalla dice «30%»
 *   Frecuencia, tras el preset Do (C4) → anuncia «262» (el range redondea a su paso de 1) mientras
 *   suena 261,63 Hz y el campo dice «261,63». Es la forma del 1729 de diapason, aquí sin recorte.
 * Esperado: aria-valuetext «30 %» y uno que diga «261,63 Hz».
 */
test('HALLAZGO H5 — los deslizadores anuncian el volumen en % y la frecuencia que suena', async ({ page }) => {
  test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
  await abrir(page);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA, DESLIZADOR_VOLUMEN]);
  await expect(page.getByRole('slider', { name: 'Volumen' })).toHaveAttribute('aria-valuetext', /^30\s%$/);
  await page.getByRole('button', { name: /Do \(C4\)/ }).click();
  await expect(page.getByRole('slider', { name: 'Seleccionar frecuencia' })).toHaveAttribute(
    'aria-valuetext',
    /261,63/,
  );
});

/**
 * HALLAZGO H6 [medio · contenido] (Inspector 25/09/2026). Las advertencias de seguridad y de
 * responsabilidad viven DENTRO de <EducationalSection>, que nace colapsada: «Riesgo de daño
 * auditivo: … Mantén siempre el volumen por debajo del 50%» y «No es un diagnóstico médico: los
 * resultados de un test de audición casero… no sustituyen a una audiometría clínica». La
 * estructura estándar del proyecto lo prohíbe expresamente («Nunca ocultar dentro de
 * <EducationalSection> un disclaimer legal, una advertencia de responsabilidad…»). La app promete
 * un «test de oído» (title, description, tarjeta «Test de audición», preset «Test de edad») y deja
 * el deslizador de volumen llegar al 100 %; quien no abra la guía no ve ninguna de las dos.
 * Medido: al cargar, «Riesgo de daño auditivo» no es visible; solo aparece tras «Ver guía educativa».
 */
test('HALLAZGO H6 — la advertencia de daño auditivo y de «no es un diagnóstico» se ve sin abrir la guía', async ({
  page,
}) => {
  test.fail(); // HALLAZGO medio (Inspector 25/09/2026)
  await abrir(page);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA]);
  await expect(page.getByText('Riesgo de daño auditivo', { exact: false })).toBeVisible();
  await expect(page.getByText('No es un diagnóstico médico', { exact: false })).toBeVisible();
});

/**
 * HALLAZGO H7 [bajo · contenido] (Inspector 25/09/2026). La FAQ del JSON-LD —la que leen las IAs
 * para citar la app— le atribuye lo que no hace y contradice a la propia página:
 *   «puedes usar para … explorar fenómenos acústicos como los tonos binaurales»: un tono binaural
 *   exige una frecuencia distinta en cada oído (la propia guía: 400 Hz en el izquierdo y 410 en el
 *   derecho), y la app emite un único oscilador a los dos canales, sin control por oído.
 *   «También se usa … para generar ruido blanco»: la app solo tiene cuatro ondas periódicas.
 *   «para un diagnóstico auditivo profesional consulta a un audioprotesista»: la página dice
 *   «audiometría clínica realizada por un audiólogo o médico ORL».
 */
test('HALLAZGO H7 — la FAQ estructurada no promete binaurales, ruido blanco ni diagnóstico que la app no da', async ({
  page,
}) => {
  test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
  await abrir(page);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA]);
  const faq = (await page.locator('script[type="application/ld+json"]').allTextContents())
    .filter((t) => t.includes('FAQPage'))
    .join(' ');
  expect(faq, 'la app tiene que servir un FAQPage').toContain('FAQPage');
  const controlesPorOido = await page.getByLabel(/izquierd|derech/i).count();
  expect(
    /binaural/i.test(faq) && controlesPorOido === 0,
    'la FAQ promete tonos binaurales y la app no deja poner una frecuencia en cada oído',
  ).toBe(false);
  const botonesDeRuido = await page.getByRole('button', { name: /ruido/i }).count();
  expect(/ruido blanco/i.test(faq) && botonesDeRuido === 0, 'la FAQ promete ruido blanco').toBe(false);
  expect(faq, 'la página remite a «un audiólogo o médico ORL»').not.toMatch(/audioprotesista/i);
});

/**
 * HALLAZGO H8 [bajo · contenido] (Inspector 25/09/2026). Formato de cifras y unidades (Ortografía
 * de la RAE, 2010, la misma regla que el % de H3): con cinco cifras se agrupa con punto, y el
 * símbolo de unidad va separado. El title y el og:title dicen «(20-20000 Hz)» —la description
 * dice bien «20.000 Hz»— y el subtítulo del hero «de 20Hz a 20kHz» (también «15-20kHz» en la
 * tarjeta «Test de audición»). Si el «20000» del title es a propósito por la consulta literal,
 * que quede escrito como excepción.
 */
test('HALLAZGO H8 — el title agrupa los millares y el hero separa el símbolo de la unidad', async ({ page }) => {
  test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
  await abrir(page);
  expect(await page.title(), 'title').not.toMatch(/\d{5}/);
  expect(await page.locator('meta[property="og:title"]').getAttribute('content'), 'og:title').not.toMatch(/\d{5}/);
  await expect(page.locator('[class*="hero"] [class*="subtitle"]')).not.toHaveText(/\dk?Hz/);
});

/**
 * HALLAZGO H9 [bajo · dato] (Inspector 25/09/2026). Consejo «Las mascotas oyen más que tú»: «Los
 * perros oyen hasta ~65 kHz y los gatos hasta ~79 kHz». Los 79 kHz del gato son de Heffner (70 dB
 * SPL: 55 Hz – 79 kHz), pero para el perro la medida de referencia del mismo laboratorio es 67 Hz –
 * 45 kHz (Heffner, H. E. 1983, «Hearing in large and small dogs: Absolute thresholds and size of
 * the tympanic membrane», Behavioral Neuroscience 97(2):310; la recoge en.wikipedia «Hearing
 * range»: «around 67 Hz to 45 kHz»). 65 kHz es la cifra de divulgación, no la medida.
 * Consultado el 25/09/2026. Tolerancia ±5 kHz (`toBeCloseTo(45, -1)`): el defecto está a 20.
 */
test('HALLAZGO H9 — el techo de audición del perro es el medido (~45 kHz), no ~65 kHz', async ({ page }) => {
  test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
  await abrir(page);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA]);
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const frase = await page.getByText(/Los perros oyen hasta/).innerText();
  const khz = Number(frase.match(/perros oyen hasta ~?(\d+)\s*kHz/)?.[1] ?? NaN);
  expect(khz, frase).toBeCloseTo(45, -1);
});
