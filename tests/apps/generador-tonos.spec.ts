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
 *   3. HALLAZGOS A-D (10/09/2026): nacieron con `test.fail()` y fueron REPARADOS; hoy son
 *      guardias de regresión como las del bloque 2 y ninguno lleva ya la marca.
 *   4. RE-INSPECCIÓN 25/09/2026: la SOSPECHA de la rampa de ganancia (hallazgo 1509 de
 *      diapason), medida aquí sobre el sonido que sale de la ganancia, y la frecuencia decimal
 *      tras el cambio de parser 527373e0. Los que salieron abiertos nacieron con `test.fail()`
 *      y fueron REPARADOS el 25/09/2026 (hallazgos 1637-1639): hoy son regresión.
 *   5. INSPECTOR 25/09/2026 (tarde): la SOSPECHA del desmontaje sin rampa y la de los campos del
 *      barrido que truncan con parseInt (las dos vistas al reparar diapason), tres casos nuevos
 *      —timbre triangular y sierra, barrido desde el móvil, formato español en el campo— y un
 *      test por hallazgo. Los abiertos, con `test.fail()`.
 *      REPARADOS el mismo 25/09/2026 (hallazgos 1803-1811): los H1-H9 dejan de ser `test.fail()` y
 *      quedan como regresión; el H2 suma el caso «0,5 s» del acta, y el CASO 6 deja de exigir que
 *      un 0 en «Hasta» salte al techo (ver su comentario). Sus comentarios describen el defecto
 *      tal como se midió ese día, en presente: hoy ninguno está abierto.
 *   6. INSPECTOR 27/09/2026: la medida con el micrófono, que ningún caso tocaba, con un micrófono
 *      FALSO en bucle (`INSTRUMENTAR_MICRO`): el caso normal A/B, el límite con el tono manual
 *      sonando (en móvil) y los rechazos (permiso denegado, procesados activos, silencio). Los
 *      defectos nuevos nacieron con `test.fail()` y «ABIERTO», y fueron REPARADOS el mismo
 *      27/09/2026 (hallazgos 2306-2309, los I1-I4): hoy son regresión y ninguno lleva ya la
 *      marca. Y la SOSPECHA S2 (CASO 3 inestable con la
 *      CPU cargada): `abrir` espera ahora a la hidratación (ver su comentario).
 *   7. INSPECTOR 13/10/2026 (al final): re-inspección tras la <ZonaHerramienta> (3d5c5db0). Casos
 *      N (1.234,5 Hz triangular, medido en el sonido) y L (20.000 Hz al 100 %), la envoltura sin
 *      efecto visible ni de teclado, y los hallazgos J1-J3, ABIERTOS, con `test.fail()`. El caso de
 *      rechazo (un sonido por encima de 20 kHz en el medidor) y el J4, en
 *      generador-tonos-medidor-inspector.spec.ts, que ya lleva el micrófono falso.
 *   8. INSPECTOR 14/10/2026 (al final): re-inspección tras el cromo fijo (cd462414), que quitó el
 *      `scroll-margin` de la sección del medidor. El salto del hero, en escritorio y a 360/390 px;
 *      el motor del medidor con un micrófono SINTÉTICO (442 Hz, la frontera Si4 | Do5) y el rechazo
 *      de una respuesta en zigzag; y los hallazgos K1-K4, que nacieron ABIERTOS con `test.fail()` y
 *      fueron REPARADOS el mismo 14/10/2026 (d72384b5, hallazgos 3292-3295): hoy son regresión.
 *   9. RE-INSPECCIÓN 14/10/2026 (tarde), tras d72384b5: el 3292 entre dos medidas y bajando de nota
 *      (CASOS 16 y 17), un glissando rápido que no puede darse por estable (CASO 18), la rampa de
 *      salida medida en 3 ms (cabo C0240: aquí no llega empezada) y los hallazgos L1 (vecino del
 *      3292) y L2 (vecino del 3293), que nacieron ABIERTOS con `test.fail()` y fueron REPARADOS el
 *      15/10/2026 (34046071, hallazgos 3307 y 3308): hoy son regresión.
 *  10. RE-INSPECCIÓN 15/10/2026, tras 34046071 (al final): un sonido que se apaga y vuelve cruzando
 *      la frontera La4 | La#4 en UNA medida (CASO 19), y los hallazgos M1-M3 (vecinos de lo que se
 *      anuncia y de lo que se lleva al generador), ABIERTOS, con `test.fail()`.
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

/**
 * Abre la app instrumentada y ESPERA A QUE ESTÉ HIDRATADA (SOSPECHA S2, Inspector 27/09/2026).
 *
 * Hasta ese día `abrir` solo esperaba al <h1>, que llega en el HTML del servidor, y el CASO 3
 * pulsaba «Reproducir» acto seguido. Medido con la CPU emulada (CDP
 * `Emulation.setCPUThrottlingRate`) sobre el flujo del CASO 3, en el instante del clic la raíz de
 * React ya existía pero el botón aún no tenía fibra ni el campo su rastreador en 8 de 8 cargas a
 * 1/6 y 1/20: el clic no se pierde —React 19.2 hidrata en síncrono ante un evento discreto—, pero
 * esa hidratación de la página ENTERA se cobraba dentro de los 5 s de reloj de pared del
 * `expect.poll` que espera al oscilador: 0,44 s a 1/6, 2,0-2,8 s a 1/20 y 3,9-4,5 s a 1/40, a un
 * paso del límite. Es la forma que falló el 24/09/2026 con 24 procesos de CPU. Esperando antes a
 * la hidratación (margen de 15 s, `_hidratacion.ts`), el mismo paso baja a 2,3-2,8 s a 1/40 y el
 * plazo de 5 s vuelve a medir solo lo que tarda la app en responder al botón.
 */
async function abrir(page: Page): Promise<void> {
  await page.addInitScript(INSTRUMENTAR);
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Generador de Tonos');
  await esperarHidratacion(page, ['input[aria-label="Frecuencia en Hz"]']);
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
// El emoji va con aria-hidden desde el hallazgo 1806: el nombre accesible es «Detener» a secas.
const botonDetener = (page: Page) => page.getByRole('button', { name: /^Detener$/ });

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
  // `abrir` ya ha esperado a la hidratación: este es el caso que salió inestable con la CPU
  // cargada (SOSPECHA S2, 24/09/2026), porque su primer gesto es el clic y el plazo de 5 s del
  // poll de abajo se comía la hidratación de toda la página. Ver el comentario de `abrir`.
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
  await expect(page.locator('#sweep-min-aviso')).toContainText('se ajusta a 20');
  // Hasta el 25/09/2026 (hallazgo 1804) este caso esperaba que un 0 en «Hasta» saltara al
  // TECHO (20.000): era el `parseInt(t) || FREC_MAX` de entonces, que trataba el 0 —falsy— como
  // un campo vacío. Consagraba ese atajo: 0 Hz es un número, está por debajo del suelo y lo
  // coherente es acotarlo al suelo, como «Desde» con −100, y decirlo en pantalla. El fondo del
  // caso no cambia: nada de lo que se escriba saca al oscilador del rango ni produce NaN.
  await hasta.fill('0');
  await hasta.blur();
  await expect(hasta).toHaveValue('20'); // suelo, no NaN ni 0
  await expect(page.locator('#sweep-max-aviso')).toContainText('se ajusta a 20');
  // Y vuelta al techo escribiéndolo con punto de millares, que es un número español válido.
  await hasta.fill('20.000');
  await hasta.blur();
  await expect(hasta).toHaveValue('20000');
  await expect(page.locator('#sweep-max-aviso')).toHaveCount(0);

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
// HALLAZGOS DEL INSPECTOR 10/09/2026 — nacieron con test.fail() y
// están REPARADOS: hoy pasan y quedan como guardias de regresión.
// Sus comentarios describen el defecto tal como se midió entonces.
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
  // «0 %» con espacio duro desde el hallazgo 1805 (antes esperaba «0%» pegado).
  await expect(page.locator('[class*="volumenValor"]')).toHaveText('0 %');
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
 * HALLAZGO H2 (tercer caso, el del acta). «Duración» 0,5 s:
 *   esperado  0,5 está por debajo del mínimo de 1 s → al salir, 1 s (acotarDuracion), y se dice
 *   obtenido  (antes) parseInt('0.5') = 0, falsy, `|| DUR_DEFECTO` → 5 s, diez veces lo pedido,
 *             sin ningún aviso.
 * Con 1 s, Desde 20 y Hasta 2.000: incremento (2000 − 20) / (1 · 20) = 99 Hz → 119, 218, 317…
 */
test('HALLAZGO H2 — «Duración» 0,5 s se acota al mínimo de 1 s y lo dice, no salta a 5 s', async ({ page }) => {
  await abrir(page);
  await esperarHidratacion(page, ['#sweep-dur']);
  const duracion = page.locator('#sweep-dur');
  await duracion.click();
  await duracion.press('Control+a');
  await duracion.pressSequentially('0,5', { delay: 40 });
  await duracion.blur();
  await expect(duracion).toHaveValue('1');
  await expect(page.locator('#sweep-dur-aviso')).toBeVisible();
  await expect(page.locator('#sweep-dur-aviso')).toContainText('se ajusta a 1');
  await expect(duracion).toHaveAttribute('aria-describedby', 'sweep-dur-aviso');

  await page.getByRole('button', { name: /Iniciar barrido/ }).click();
  await expect
    .poll(async () => (await frecuenciasAplicadas(page)).length, { timeout: 10000 })
    .toBeGreaterThanOrEqual(6);
  await page.getByRole('button', { name: /Detener barrido/ }).click();
  const escalera = Array.from({ length: 21 }, (_, k) => 20 + 99 * k);
  for (const f of (await frecuenciasAplicadas(page)).slice(1)) {
    expect(escalera, `${f} Hz no está en la escalera de 99 Hz de un barrido de 1 s`).toContain(f);
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
  await abrir(page);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA]);
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const frase = await page.getByText(/Los perros oyen hasta/).innerText();
  const khz = Number(frase.match(/perros oyen hasta ~?(\d+)\s*kHz/)?.[1] ?? NaN);
  expect(khz, frase).toBeCloseTo(45, -1);
});

// ============================================================
// INSPECTOR 27/09/2026 — «Medir la respuesta con el micrófono»
// ============================================================

/** Cómo contesta el micrófono falso a `getUserMedia`. */
type ModoMicro = 'bucle' | 'silencio' | 'denegar' | 'eco' | 'agc';

/**
 * Micrófono FALSO en bucle: todo lo que la app manda a `ctx.destination` vuelve por
 * `getUserMedia`, después de pasar por un «altavoz» del test — un contexto aparte con un filtro
 * peaking (RBJ, el de la especificación Web Audio) a 1 kHz, Q = 4,318, ganancia ajustable. Con
 * ganancia 0 el filtro es la identidad (|H| = 1 en todas las frecuencias): la cadena es PLANA
 * y sin ruido, que es el caso que se puede resolver a mano. Así se mide la cadena entera de la
 * app —tonos, FFT, resta de ruido, mediana, comparación— sin depender del hardware.
 *
 * Los modos que no son el bucle ensayan los rechazos: permiso denegado, un navegador que deja
 * encendidos sus procesados (se simula con `getSettings`, que es lo que la app lee) y un
 * micrófono que solo oye silencio. Cada `getUserMedia` entrega una pista NUEVA, porque la app
 * detiene la suya al terminar (y eso también se comprueba).
 */
function INSTRUMENTAR_MICRO(): void {
  interface Bucle {
    ctx: AudioContext;
    entrada: GainNode;
    filtro: BiquadFilterNode;
    salida: MediaStreamAudioDestinationNode;
  }
  const w = window as unknown as {
    __modoMicro: ModoMicro;
    __pedidoMicro: MediaStreamConstraints | null;
    __pistasMicro: MediaStreamTrack[];
    __bucle: Bucle | null;
  };
  w.__modoMicro = 'bucle';
  w.__pedidoMicro = null;
  w.__pistasMicro = [];
  w.__bucle = null;

  // Los nodos del bucle se crean con CONSTRUCTORES, no con `ctx.createGain()` y compañía: esos
  // métodos los envuelve `INSTRUMENTAR`, y un nodo del test en `__ganancias` taparía la ganancia
  // de la app en `vivo()`.
  const prepararBucle = (): Bucle => {
    if (w.__bucle) return w.__bucle;
    const ctx = new AudioContext();
    const entrada = new GainNode(ctx);
    const filtro = new BiquadFilterNode(ctx, { type: 'peaking', frequency: 1000, Q: 4.318, gain: 0 });
    const salida = new MediaStreamAudioDestinationNode(ctx);
    entrada.connect(filtro);
    filtro.connect(salida);
    w.__bucle = { ctx, entrada, filtro, salida };
    return w.__bucle;
  };

  // Lo que va a los altavoces de un contexto de la app se copia también al bucle.
  const copias = new WeakMap<BaseAudioContext, MediaStreamAudioDestinationNode>();
  const conectar = AudioNode.prototype.connect as unknown as (
    this: AudioNode,
    destino: AudioNode | AudioParam,
    ...resto: number[]
  ) => unknown;
  AudioNode.prototype.connect = function (this: AudioNode, destino: AudioNode | AudioParam, ...resto: number[]) {
    const r = conectar.call(this, destino, ...resto);
    if (destino instanceof AudioDestinationNode) {
      let copia = copias.get(this.context);
      if (!copia) {
        copia = new MediaStreamAudioDestinationNode(this.context as AudioContext);
        copias.set(this.context, copia);
        const b = prepararBucle();
        new MediaStreamAudioSourceNode(b.ctx, { mediaStream: copia.stream }).connect(b.entrada);
      }
      conectar.call(this, copia);
    }
    return r;
  } as unknown as typeof AudioNode.prototype.connect;

  navigator.mediaDevices.getUserMedia = async (restricciones?: MediaStreamConstraints): Promise<MediaStream> => {
    w.__pedidoMicro = restricciones ?? null;
    const modo = w.__modoMicro;
    if (modo === 'denegar') throw new DOMException('Permiso denegado', 'NotAllowedError');
    const b = prepararBucle();
    const pista =
      modo === 'silencio'
        ? new MediaStreamAudioDestinationNode(b.ctx).stream.getAudioTracks()[0]
        : b.salida.stream.getAudioTracks()[0].clone();
    if (modo === 'eco' || modo === 'agc') {
      const reales = pista.getSettings.bind(pista);
      pista.getSettings = (): MediaTrackSettings => ({
        ...reales(),
        autoGainControl: true,
        ...(modo === 'eco' ? { echoCancellation: true } : {}),
      });
    }
    w.__pistasMicro.push(pista);
    return new MediaStream([pista]);
  };
}

async function abrirConMicro(page: Page, modo: ModoMicro = 'bucle'): Promise<void> {
  await page.addInitScript(INSTRUMENTAR_MICRO);
  await abrir(page);
  await fijarModoMicro(page, modo);
}

const fijarModoMicro = (page: Page, modo: ModoMicro): Promise<void> =>
  page.evaluate((m) => {
    (window as unknown as { __modoMicro: ModoMicro }).__modoMicro = m;
  }, modo);

/** Ganancia del «altavoz» del bucle a 1 kHz, en dB. 0 = cadena plana. */
const fijarAltavoz = (page: Page, gananciaDb: number): Promise<void> =>
  page.evaluate((g) => {
    (window as unknown as { __bucle: { filtro: BiquadFilterNode } }).__bucle.filtro.gain.value = g;
  }, gananciaDb);

const pistasMicro = (page: Page): Promise<string[]> =>
  page.evaluate(() =>
    (window as unknown as { __pistasMicro: MediaStreamTrack[] }).__pistasMicro.map((p) => p.readyState),
  );

const pedidoMicro = (page: Page): Promise<MediaStreamConstraints | null> =>
  page.evaluate(() => (window as unknown as { __pedidoMicro: MediaStreamConstraints | null }).__pedidoMicro);

/**
 * Lanza una medida y espera a que la app la GUARDE: el botón pasa a «Repetir medida X». Es el
 * estado de la app, no un plazo. Desde la reparación del I1 (27/09/2026) cada tercio espera la
 * ventana entera de la FFT + latencia + 100 ms antes de sus 3 lecturas: 27 esperas × (372 + 100)
 * ms + 26 × 3 × 35 ms ≈ 15,5 s a 44,1 kHz; el tope de 45 s solo cubre una máquina cargada.
 */
async function medir(page: Page, letra: 'A' | 'B', gesto: 'click' | 'tap' = 'click'): Promise<void> {
  const boton = page.getByRole('button', { name: `Medir ${letra}`, exact: true });
  await (gesto === 'tap' ? boton.tap() : boton.click());
  await expect(page.getByRole('button', { name: `Repetir medida ${letra}`, exact: true })).toBeVisible({
    timeout: 45000,
  });
}

/**
 * La tabla «Ver los números» leída en FORMATO ESPAÑOL: frecuencia → [A, B, B − A], con `null`
 * donde la app escribe «sin medida» o «—». No es entrada del usuario: es la salida que la app
 * acaba de formatear, y el test no puede importar `parseSpanishNumber` (corre fuera de @/).
 */
async function tablaMedida(page: Page): Promise<Map<number, (number | null)[]>> {
  const detalles = page.locator('details').filter({ hasText: 'Ver los números' });
  if (!(await detalles.evaluate((d) => (d as HTMLDetailsElement).open))) {
    await detalles.locator('summary').click();
  }
  // parser-ok: se lee una celda que la propia app acaba de imprimir, no un campo de entrada.
  const cifra = (texto: string): number => Number(texto.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
  const tabla = new Map<number, (number | null)[]>();
  for (const fila of await detalles.locator('tbody tr').allInnerTexts()) {
    const [frecuencia, ...celdas] = fila.split('\t');
    tabla.set(
      cifra(frecuencia),
      celdas.map((c) => (/\d/.test(c) ? cifra(c) : null)),
    );
  }
  return tabla;
}

/** Tercios de octava nominales (ISO 266) de 50 Hz a 16 kHz: el rango que mide la app. */
const TERCIOS_50_16K = [
  50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000,
  5000, 6300, 8000, 10000, 12500, 16000,
];

const avisoMedida = (page: Page) => page.locator('[role="alert"][class*="medidaAviso"]');
const resumenMedida = (page: Page) => page.locator('[class*="medidaResumen"]');
const graficaMedida = (page: Page) => page.getByRole('img', { name: /Respuesta en frecuencia relativa/ });

// ------------------------------------------------------------
// CASO 10 — NORMAL: la comparación A/B que promete jsonLd.features
// ------------------------------------------------------------
/**
 * «Comparación A/B de dos posiciones o dos altavoces en decibelios relativos» (jsonLd.features).
 * A = cadena plana; B = el mismo «altavoz» con +12 dB a 1 kHz. Resuelto a mano con la fórmula
 * del peaking (RBJ, fs = 44.100 o 48.000 Hz, da lo mismo a dos decimales):
 *   H(1.000 Hz) = +12,00 dB exactos (es la ganancia en la frecuencia central) · H(800) = +2,84 ·
 *   H(1.250) = +2,83 · en los extremos (50 Hz, 16 kHz) +0,00
 *   Cada curva se normaliza a SU mediana: la de A es la de una cadena plana; la de B sube lo que
 *   sube la mediana de H sobre los 26 tercios = +0,048 dB (media de los valores 13.º y 14.º).
 *   ⇒ B − A en 1.000 Hz = 12,00 − 0,05 = 11,95 dB, y es el máximo de la diferencia.
 * Tolerancia ±3 dB: este caso vigila defectos de 12 dB —la resta al revés, la frecuencia
 * cambiada, el pico perdido—, y el ruido propio de la medida llegaba a ±3 dB (HALLAZGO I1, abajo).
 * Medido el 27/09/2026 en seis cargas: 10,3 · 11,0 · 11,3 · 11,5 · 11,7 · 11,8 (antes de reparar el I1;
 * reparado, B − A de la misma cadena medida dos veces queda en 0,0-0,7 dB).
 */
test('CASO 10 — A/B con el micrófono: un altavoz con +12 dB a 1 kHz sale como +12 dB en 1.000 Hz', async ({
  page,
}) => {
  test.setTimeout(120000);
  await abrirConMicro(page);

  await medir(page, 'A');
  // El micrófono se pide con los tres procesados apagados (motor-respuesta.ts, `evaluarMicrofono`).
  expect(await pedidoMicro(page)).toEqual({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  // El sonido de la medida existe de verdad: UN oscilador, arrancado con el contexto en marcha,
  // que recorre los 26 tercios en orden (el primer 50 es el de su creación) y se detiene al final.
  const [medidaA] = await registros(page);
  expect(medidaA.iniciado).toBe(true);
  expect(medidaA.estadoCtx).toBe('running');
  expect(medidaA.frecuenciasAplicadas).toEqual([50, ...TERCIOS_50_16K]);
  await expect.poll(async () => (await registros(page))[0].detenido).toBe(true);
  // Y el micrófono se suelta: si no, el indicador de grabación se queda encendido.
  expect(await pistasMicro(page)).toEqual(['ended']);
  await expect(resumenMedida(page)).toContainText('26 de 26 puntos medidos');
  await expect(graficaMedida(page)).toBeVisible();

  await fijarAltavoz(page, 12);
  await medir(page, 'B');
  const tabla = await tablaMedida(page);
  expect([...tabla.keys()]).toEqual(TERCIOS_50_16K);
  const bMenosA = tabla.get(1000)?.[2] ?? null;
  expect(bMenosA, 'B − A en 1.000 Hz').not.toBeNull();
  expect(bMenosA as number).toBeGreaterThanOrEqual(11.95 - 3);
  expect(bMenosA as number).toBeLessThanOrEqual(11.95 + 3);
  await expect(resumenMedida(page)).toContainText(/Donde más gana B es en 1\.?000 Hz/);
  await expect(resumenMedida(page)).toContainText('Comparadas sobre 26 puntos con medida en las dos');
  expect(await pistasMicro(page)).toEqual(['ended', 'ended']);
});

// ------------------------------------------------------------
// HALLAZGO I1 — REPARADO: la misma cadena medida dos veces no daba la misma curva
// ------------------------------------------------------------
/**
 * HALLAZGO I1 [medio · cálculo] (Inspector 27/09/2026, hallazgo 2306) — REPARADO 27/09/2026: cada
 * tercio se lee cuando el reloj de AUDIO ha pasado la ventana entera de la FFT (`fftSize /
 * sampleRate`, leída del analizador) + la latencia declarada + 100 ms de margen, contando desde el
 * final de la rampa de arranque en el primero. Lo que había: las esperas de la medida eran más
 * cortas que la ventana que analizan. La FFT es de 16.384 muestras (FFT_MEDIDA) = 341 ms a 48 kHz y
 * 372 ms a 44,1 kHz, pero cada tercio se lee a los 175, 210 y 245 ms de cambiar el tono
 * (MS_ESTABILIZACION 140 + 3 × MS_ENTRE_LECTURAS 35): la ventana aún guarda un 30-50 % del tono
 * anterior o del silencio, y el nivel del tono en curso está SUBIENDO cuando se lee. Medido con una
 * sonda sobre el propio analizador de la app: −35,4 → −29,0 → −25,4 dB a los 171, 211 y 251 ms de
 * audio, unos 0,13 dB por milisegundo, así que diez milisegundos de holgura de un setTimeout mueven
 * el punto más de 1 dB. El primer tercio sale además 4-6 dB bajo: su ventana incluye la rampa de
 * arranque de 50 ms.
 *
 * Resuelto a mano: la cadena es la identidad (bucle plano), así que las dos medidas son la MISMA
 * situación y B − A = 0 dB en los 26 tercios; y en una curva plana el 0 relativo es el de todos los
 * tercios, 50 Hz incluido. Tolerancias: 1 dB para B − A (la pérdida por festoneo de la ventana, hasta
 * 1,1 dB, se cancela porque A y B se leen en las mismas frecuencias) y 1,5 dB para el punto de 50 Hz
 * (ahí el festoneo no se cancela).
 * Medido el 27/09/2026 en cuatro cargas: máx |B − A| = 2,1 · 2,3 · 3,2 · 2,4 dB, con 10-15 de los 26
 * tercios a 1 dB o más, y el resumen dice «se separan 4,2-5,1 dB. Donde más gana B es en 1250 Hz;
 * donde más pierde, en 630 Hz» entre dos medidas idénticas. El 50 Hz de A: −5,6 · −4,3 · −4,1 · −5,0
 * dB, así que casi toda curva sale con «mínimo en 50 Hz» sea cual sea el altavoz.
 */
test('HALLAZGO I1 — la misma cadena medida dos veces da la misma curva, y plana', async ({ page }) => {
  test.setTimeout(120000);
  await abrirConMicro(page);
  await medir(page, 'A');
  await medir(page, 'B'); // el altavoz no se toca: la misma situación dos veces
  const tabla = await tablaMedida(page);
  const diferencias = TERCIOS_50_16K.map((f) => tabla.get(f)?.[2] ?? null);
  // Cabo C0173 (14/10/2026): este caso ha fallado alguna vez en la suite entera y pasa suelto. Si
  // vuelve a fallar, el mensaje lleva la tabla ENTERA —A y B por tercio, no solo B − A—, que es lo
  // que hace falta para saber si se movió una medida o las dos.
  const tablaEntera = TERCIOS_50_16K.map((f) => {
    const [a, b, d] = tabla.get(f) ?? [];
    return `${f} Hz: A ${a ?? '—'} · B ${b ?? '—'} · B−A ${d ?? '—'}`;
  }).join(' | ');
  expect(diferencias.every((d) => d !== null), `en un bucle sin ruido se miden los 26 tercios (${tablaEntera})`).toBe(true);
  const peor = Math.max(...diferencias.map((d) => Math.abs(d ?? Infinity)));
  expect(peor, `B − A por tercio: ${diferencias.join(' · ')} — tabla entera: ${tablaEntera}`).toBeLessThanOrEqual(1);
  const a50 = tabla.get(50)?.[0] ?? null;
  expect(Math.abs(a50 ?? Infinity), `el tercio de 50 Hz de una cadena plana, en dB rel. (${tablaEntera})`).toBeLessThanOrEqual(1.5);
});

// ------------------------------------------------------------
// CASO 12 — RECHAZO: sin permiso, con procesados activos, en silencio
// ------------------------------------------------------------
/**
 * Lo que debe pasar, leído en `medirRespuesta` y `evaluarMicrofono`:
 *   permiso denegado → aviso «No se ha podido abrir el micrófono…», sin emitir ningún tono;
 *   el navegador deja encendida la cancelación de eco → aviso de que no se mide, sin emitir
 *     ningún tono, y la pista del micrófono DETENIDA (el indicador de grabación se apaga);
 *   un micrófono que solo oye silencio → se emiten los 26 tonos, ninguno despega del ruido y se
 *     avisa «Ningún tono llegó a despegar del ruido de fondo» en vez de dibujar una curva.
 * En ninguno de los tres aparece la gráfica.
 */
test('CASO 12 — sin permiso, con cancelación de eco o en silencio, se avisa y no se dibuja ninguna curva', async ({
  page,
}) => {
  test.setTimeout(60000);
  await abrirConMicro(page, 'denegar');
  const medirA = page.getByRole('button', { name: 'Medir A', exact: true });

  await medirA.click();
  await expect(avisoMedida(page)).toContainText(
    'No se ha podido abrir el micrófono. Hay que dar permiso al navegador para medir.',
  );
  expect(await registros(page), 'sin micrófono no se emite nada').toHaveLength(0);
  await expect(medirA).toBeEnabled();

  await fijarModoMicro(page, 'eco');
  await medirA.click();
  await expect(avisoMedida(page)).toContainText('cancelación de eco');
  await expect(avisoMedida(page)).toContainText('no se mide');
  expect(await registros(page), 'con la medida rechazada no se emite nada').toHaveLength(0);
  expect(await pistasMicro(page), 'el micrófono rechazado se suelta').toEqual(['ended']);

  await fijarModoMicro(page, 'silencio');
  await medirA.click();
  await expect(avisoMedida(page)).toContainText('Ningún tono llegó a despegar del ruido de fondo', {
    timeout: 45000,
  });
  const [medida] = await registros(page);
  expect(medida.frecuenciasAplicadas, 'los 26 tonos se emitieron').toEqual([50, ...TERCIOS_50_16K]);
  await expect.poll(async () => (await registros(page))[0].detenido).toBe(true);
  expect(await pistasMicro(page)).toEqual(['ended', 'ended']);

  await expect(graficaMedida(page)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Repetir medida A', exact: true })).toHaveCount(0);
});

// ------------------------------------------------------------
// HALLAZGO I3 — REPARADO: «la control automático de ganancia»
// ------------------------------------------------------------
/**
 * HALLAZGO I3 [bajo · contenido] (Inspector 27/09/2026, hallazgo 2308) — REPARADO 27/09/2026: el aviso
 * lo arma `avisoProcesados`, con el artículo y el género de cada procesado, el adjetivo en plural
 * (masculino si hay géneros mezclados) y «que altera/alteran» según el número. El aviso se armaba con
 * `mantiene activa la ${procesadosActivos.join(' y la ')} del micrófono` (page.tsx ~557), y uno de
 * los tres nombres de motor-respuesta.ts es masculino: «control automático de ganancia».
 *   solo el control de ganancia activo → obtenido «mantiene activa la control automático de
 *     ganancia del micrófono» · esperado «mantiene activo el control automático de ganancia»
 *   cancelación de eco + control de ganancia → «mantiene activa la cancelación de eco y la
 *     control automático de ganancia»
 * Es el aviso que ve quien usa un navegador que no deja apagar esos procesados.
 */
test('HALLAZGO I3 — el aviso del control automático de ganancia concuerda en género', async ({ page }) => {
  await abrirConMicro(page, 'agc');
  const medirA = page.getByRole('button', { name: 'Medir A', exact: true });
  await medirA.click();
  await expect(avisoMedida(page)).toContainText('control automático de ganancia');
  const soloGanancia = await avisoMedida(page).innerText();
  expect(soloGanancia).not.toMatch(/\bla control\b|\bactiva el control\b/);
  expect(soloGanancia).toContain(
    'Este navegador mantiene activo el control automático de ganancia del micrófono, que altera el sonido',
  );

  // Dos procesados de género distinto (el modo «eco» del micro falso deja también el de ganancia):
  // adjetivo en masculino plural y verbo en plural.
  await fijarModoMicro(page, 'eco');
  await medirA.click();
  await expect(avisoMedida(page)).toContainText(
    'Este navegador mantiene activos la cancelación de eco y el control automático de ganancia del micrófono, que alteran el sonido',
  );
});

// ------------------------------------------------------------
// HALLAZGO I4 — REPARADO: `@disclaimer: exempt` en una app que orienta sobre la salud auditiva
// ------------------------------------------------------------
/**
 * HALLAZGO I4 [medio · contenido] (Inspector 27/09/2026, SOSPECHA S1, hallazgo 2309) — REPARADO
 * 27/09/2026: fuera el exempt; la app monta <DisclaimerCard variant="medical" severity="high"
 * collapsible={false}> antes de la EducationalSection, con el texto del Nivel 2 médico (§4) adaptado
 * al test de oído. Lo que había: page.tsx:2 declaraba
 * `// @disclaimer: exempt` y no monta <DisclaimerCard>. La política (_private/DISCLAIMER-POLICY.md)
 * reserva el exempt a «herramientas técnicas sin consejo profesional» (§7) y manda un DisclaimerCard
 * a toda app que dé «consejos personalizados sobre temas … médicos» o cuyo resultado pueda llevar a
 * «decisiones de impacto» (§7, paso 1). Esta se anuncia «Para test de oído, tinnitus» (description),
 * trae una guía de test de audición casero con normas por edad («Valores significativamente
 * inferiores al rango para tu edad pueden indicar presbiacusia o daño auditivo por ruido») y
 * patologías («La asimetría auditiva puede indicar patologías como la neurinoma del acústico»), y
 * deja el volumen llegar al 100 %: es «orientación … de salud» del Nivel 2 ALTO (§2), no colapsable.
 * Las advertencias propias están a la vista desde el 1808, pero les falta la descarga de
 * responsabilidad del texto estándar del Nivel 2 (§4: «meskeIA no se responsabiliza de decisiones
 * basadas en el uso de esta herramienta»), y un role="note" no lo vigila ningún candado (el Cuadre
 * solo cuenta DisclaimerCard, LegalNotice, role="alert"…). Sus hermanas con el mismo riesgo,
 * generador-ruido-blanco y amplificador-sonido, llevan DisclaimerCard medical/high no colapsable.
 */
test('HALLAZGO I4 — la descarga de responsabilidad de salud se ve sin abrir nada', async ({ page }) => {
  await abrir(page);
  // Dentro de un DisclaimerCard (role="note" con su título), no suelta en cualquier párrafo.
  const aviso = page
    .getByRole('note')
    .filter({ has: page.getByRole('heading', { name: 'Antes de usarlo como test de oído' }) });
  await expect(aviso).toBeVisible();
  await expect(
    aviso.getByText(/meskeIA no se responsabiliza de decisiones basadas en el uso de esta herramienta/),
  ).toBeVisible();
  await expect(aviso).toContainText(/audiólogo|otorrinolaringólogo/);
  // No colapsable: no hay botón que lo pliegue.
  await expect(aviso.getByRole('button')).toHaveCount(0);
});

// ------------------------------------------------------------
// CASO 11 — LÍMITE, en móvil: medir con el tono manual sonando al 100 %
// ------------------------------------------------------------
test.describe('Inspector 27/09/2026 — medir con el tono sonando, en móvil (Pixel 7)', () => {
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  /**
   * El límite: el tono manual de 1.000 Hz —el preset «Medios», justo un tercio de la retícula—
   * sonando al volumen máximo (100 %) cuando se pulsa «Medir A». La app lo sabe («El generador
   * manual no puede seguir sonando: contaminaría su propia medida») y lo apaga antes de abrir el
   * micrófono.
   */
  async function tonoManualAlMaximo(page: Page): Promise<void> {
    await abrirConMicro(page);
    await page.getByRole('button', { name: 'Ir a 1.000 Hz' }).tap();
    await page.getByRole('slider', { name: 'Volumen' }).press('End');
    await expect(page.locator('[class*="volumenValor"]')).toHaveText('100 %');
    await botonReproducir(page).tap();
    await expect.poll(async () => (await vivo(page))?.ganancia ?? -1).toBeCloseTo(1, 2);
    expect((await registros(page))[0].frecuenciasAplicadas).toEqual([1000]);
  }

  test('CASO 11 — «Medir A» con 1.000 Hz sonando al 100 %: apaga el tono y mide los 26 tercios', async ({
    page,
  }) => {
    test.setTimeout(60000);
    await tonoManualAlMaximo(page);
    await medir(page, 'A', 'tap');

    const [manual, medida] = await registros(page);
    expect(manual.detenido, 'el tono manual se detiene al empezar a medir').toBe(true);
    await expect(botonReproducir(page)).toHaveAttribute('aria-pressed', 'false');
    expect(medida.frecuenciasAplicadas).toEqual([50, ...TERCIOS_50_16K]);
    expect(await pistasMicro(page)).toEqual(['ended']);

    // La gráfica y la tabla caben en los 412 px del Pixel 7 sin desbordar la página.
    await expect(graficaMedida(page)).toBeVisible();
    const tabla = await tablaMedida(page);
    expect([...tabla.keys()]).toEqual(TERCIOS_50_16K);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    ).toBe(0);
  });

  /**
   * HALLAZGO I2 [bajo · cálculo] (Inspector 27/09/2026, hallazgo 2307) — REPARADO 27/09/2026: la app
   * apunta cuándo calla el tono manual (final de su rampa, en el reloj de audio) y lee el suelo de
   * ruido cuando la ventana entera de la FFT + latencia + margen es posterior a ese instante y a la
   * apertura del micrófono. Lo que había: apagar el tono manual no bastaba:
   * el suelo de ruido se lee 250 ms después de abrir el micrófono, con una ventana de FFT de 341-372
   * ms (la causa del I1), así que con un micrófono que entrega audio en cuanto se abre —el bucle del
   * test; en la vida real, un dispositivo ya abierto o un altavoz con latencia, como uno Bluetooth—
   * la rampa de salida del tono manual cae DENTRO de la ventana del «silencio». El ruido medido en
   * 1.000 Hz queda a menos de 6 dB del tono de medida y `restarRuido` descarta el punto.
   * Resuelto a mano: la cadena es plana y sin ruido, así que 1.000 Hz se mide como los otros 25.
   * Medido el 27/09/2026 al 100 %: «sin medida» en 1.000 Hz en 4 de 4 cargas (una en móvil), y con B
   * (+12 dB a 1 kHz) la comparación se hace «sobre 25 puntos» y dice «Donde más gana B es en 800 Hz»:
   * el pico real desaparece. Al 30 % por defecto: hueco en 1 de 3 cargas y punto hundido en otra.
   */
  test('HALLAZGO I2 — el tono manual recién apagado no deja un hueco en su propio tercio', async ({ page }) => {
    test.setTimeout(90000);
    await tonoManualAlMaximo(page);
    await medir(page, 'A', 'tap');
    const tabla = await tablaMedida(page);
    expect(tabla.get(1000)?.[0] ?? null, 'A en 1.000 Hz (null = «sin medida»)').not.toBeNull();
    await expect(resumenMedida(page)).toContainText('26 de 26 puntos medidos');
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// INSPECTOR 13/10/2026 — re-inspección (invalidada por 3d5c5db0, la <ZonaHerramienta>)
// ═════════════════════════════════════════════════════════════════════════════════════════

/**
 * Resuelto a mano ANTES de ejecutar (los casos con micrófono, en generador-tonos-medidor-inspector,
 * que es el fichero que ya lleva los launchOptions del micrófono falso):
 *   · NORMAL: «1234,5» tecleado con coma decimal (formato español: la coma sola es decimal) y onda
 *     triangular. Suena 1.234,5 Hz: el pico del sonido, afinado con la parábola sobre el bin más
 *     alto de la FFT de 32.768, a menos de 0,2 Hz (el defecto que vigila es perder el decimal, que
 *     da 0,5 Hz, o leer la coma como millar, que da 12.345). Triangular = serie de Fourier con solo
 *     impares y amplitud 1/n²: 3.º = 20·log10(1/9) = −19,08 dB, 5.º = 20·log10(1/25) = −27,96 dB,
 *     2.º enterrado. Campo «1234,5» (la app lo reescribe con coma; cuatro cifras sin punto, como
 *     hace Intl en es-ES), franja «Medios - Voz humana» (su tabla: 500 Hz – 2 kHz) y el deslizador
 *     anuncia «1234,5 Hz». Medido: 1.234,509 Hz · −18,85 · −28,33 · −144 dB.
 *   · LÍMITE: el techo, 20.000 Hz, con el volumen al máximo (tecla Fin): el pico del sonido en
 *     20.000 Hz ± 1 bin (1,35-1,46 Hz; Nyquist es 22.050 o 24.000, no satura), ganancia 1,0 y
 *     «100 %» en el rótulo y en el aria-valuetext. Medido: 19.999,99 Hz y ganancia 1.
 *   · ZonaHerramienta (3d5c5db0, `display: contents`): ninguna caja propia, el panel en la misma
 *     columna que el hero, el Tab sigue el orden de siempre (campo → deslizador → «Ir a 20 Hz»), las
 *     teclas responden (ArrowUp: 440 → 441; Espacio en Reproducir) y nada sale hacia /api/analytics.
 */
test.describe('Inspector 13/10/2026', () => {
  /** Pico del sonido emitido cerca de `cerca`, afinado con la parábola (FFT de 32.768 de INSTRUMENTAR). */
  const picoAfinado = (page: Page, cerca: number): Promise<number> =>
    page.evaluate((fc) => {
      const an = (window as unknown as { __analizador: AnalyserNode | null }).__analizador;
      if (!an) return NaN;
      const d = new Float32Array(an.frequencyBinCount);
      an.getFloatFrequencyData(d);
      const ancho = an.context.sampleRate / an.fftSize;
      const c = Math.round(fc / ancho);
      let k = c;
      for (let i = c - 5; i <= c + 5; i++) if (d[i] > d[k]) k = i;
      const delta = (d[k - 1] - d[k + 1]) / (2 * (d[k - 1] - 2 * d[k] + d[k + 1]));
      return (k + (Number.isFinite(delta) && Math.abs(delta) <= 0.5 ? delta : 0)) * ancho;
    }, cerca);

  /** Escribe en un campo como un usuario y espera a que React lo tenga, antes de salir de él. */
  async function teclear(page: Page, selector: string, texto: string): Promise<void> {
    const campo = page.locator(selector);
    await campo.click();
    await campo.press('Control+a');
    await campo.pressSequentially(texto, { delay: 30 });
    await esperarValorEnReact(page, selector, texto);
    await campo.blur();
  }

  test('CASO N — «1234,5» con coma y onda triangular: suena 1.234,5 Hz con los armónicos 1/n² de la triangular', async ({
    page,
  }) => {
    await abrir(page);
    await teclear(page, CAMPO_FRECUENCIA, '1234,5');
    await expect(campoFrecuencia(page)).toHaveValue('1234,5');
    await page.getByRole('button', { name: /Triangular/ }).click();
    await expect(page.getByRole('button', { name: /Triangular/ })).toHaveAttribute('aria-pressed', 'true');
    await botonReproducir(page).click();
    await expect.poll(async () => (await registros(page)).length, { timeout: 5000 }).toBe(1);
    const [osc] = await registros(page);
    expect(osc.tipoAlArrancar).toBe('triangle');
    expect(osc.frecuenciasAplicadas).toEqual([1234.5]);

    // El SONIDO, no el parámetro: la ventana (0,68-0,74 s) se llena antes de que el pico sea fiable.
    await expect
      .poll(async () => Math.abs((await picoAfinado(page, 1234.5)) - 1234.5), {
        timeout: 8000,
        message: 'el pico del sonido emitido no cae en 1.234,5 Hz (± 0,2)',
      })
      .toBeLessThan(0.2);
    const nivelDe = async (armonico: number): Promise<number> =>
      (await armonicosRelativos(page, 1234.5, [armonico]))[0];
    // ±1,5 dB: lo que se vigila es la LEY 1/n² (la cuadrada o la sierra darían −9,54 en el 3.º).
    const dentro = async (armonico: number, esperado: number): Promise<string | number> => {
      const v = await nivelDe(armonico);
      return Math.abs(v - esperado) <= 1.5 ? 'dentro' : v;
    };
    await expect
      .poll(() => dentro(3 * 1234.5, 20 * Math.log10(1 / 9)), { timeout: 8000, message: 'triangular: 3.er armónico (−19,08 dB)' })
      .toBe('dentro');
    await expect
      .poll(() => dentro(5 * 1234.5, 20 * Math.log10(1 / 25)), { timeout: 8000, message: 'triangular: 5.º armónico (−27,96 dB)' })
      .toBe('dentro');
    expect(await nivelDe(2 * 1234.5), 'triangular: no tiene armónicos pares').toBeLessThan(-40);

    await expect(page.getByText('Medios - Voz humana')).toBeVisible();
    await expect(page.getByLabel('Seleccionar frecuencia')).toHaveAttribute('aria-valuetext', /^1234,5\sHz$/);
  });

  test('CASO L — 20.000 Hz al 100 % de volumen: el sonido tiene su pico en 20.000 Hz y la ganancia llega a 1', async ({
    page,
  }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Ir a 20.000 Hz' }).click();
    await expect(campoFrecuencia(page)).toHaveValue('20000');
    const volumen = page.getByRole('slider', { name: 'Volumen' });
    await volumen.focus();
    await volumen.press('End');
    await expect(page.locator('[class*="volumenValor"]')).toHaveText('100 %');
    await expect(volumen).toHaveAttribute('aria-valuetext', /^100\s%$/);

    await botonReproducir(page).click();
    await expect.poll(async () => (await registros(page)).length, { timeout: 5000 }).toBe(1);
    expect((await registros(page))[0].frecuenciasAplicadas).toEqual([20000]);
    await expect.poll(async () => (await vivo(page))?.ganancia ?? -1, { timeout: 5000 }).toBeCloseTo(1, 2);
    // ± 1 bin: un oscilador saturado en Nyquist o una frecuencia cambiada caen a miles de hercios.
    await expect
      .poll(async () => Math.abs((await picoAfinado(page, 20000)) - 20000), {
        timeout: 8000,
        message: 'el pico del sonido emitido no cae en 20.000 Hz (± 1,5)',
      })
      .toBeLessThan(1.5);
    await expect(page.getByText('Umbral del ultrasonido - Inaudible para la mayoría')).toBeVisible();
  });

  test('ZonaHerramienta (3d5c5db0) — la envoltura no se ve, no cambia el teclado ni manda nada a /api/analytics', async ({
    page,
  }) => {
    const enviadas: string[] = [];
    await page.route('**/api/analytics/**', (ruta) => {
      enviadas.push(ruta.request().postData() ?? '');
      return ruta.fulfill({ status: 204, body: '' });
    });
    await abrir(page);

    const zona = await page.evaluate(() => {
      const z = document.querySelector('[data-zona-herramienta]');
      const panel = z?.querySelector('[class*="mainPanel"]')?.getBoundingClientRect();
      const hero = document.querySelector('header[class*="hero"]')?.getBoundingClientRect();
      return {
        app: z?.getAttribute('data-zona-herramienta') ?? null,
        display: z ? getComputedStyle(z).display : null,
        cajas: z?.getClientRects().length ?? -1,
        mismaColumna: !!panel && !!hero && panel.left === hero.left && panel.width === hero.width,
      };
    });
    expect(zona).toEqual({ app: 'generador-tonos', display: 'contents', cajas: 0, mismaColumna: true });

    // El orden de tabulación es el del DOM, con la envoltura o sin ella.
    await campoFrecuencia(page).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Seleccionar frecuencia')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Ir a 20 Hz' })).toBeFocused();

    // Las teclas llegan a los controles: 440 + ArrowUp = 441, y Espacio arranca el tono.
    await page.getByLabel('Seleccionar frecuencia').focus();
    await page.keyboard.press('ArrowUp');
    await expect(campoFrecuencia(page)).toHaveValue('441');
    await botonReproducir(page).focus();
    await page.keyboard.press('Space');
    await expect.poll(async () => (await registros(page)).length, { timeout: 5000 }).toBe(1);
    expect((await registros(page))[0].frecuenciasAplicadas).toEqual([441]);
    await expect(botonDetener(page)).toHaveAttribute('aria-pressed', 'true');

    // En localhost la medición no se emite (lib/trackingEvento.ts: solo dominios de producción).
    expect(enviadas.filter((cuerpo) => cuerpo.includes('evt:'))).toEqual([]);
  });

  /**
   * HALLAZGO J1 [bajo · operativa] — ABIERTO (13/10/2026). El barrido no empieza en «Desde»:
   * `iniciarSweep` arranca el oscilador con la frecuencia que hubiera en el campo (`iniciarAudio`
   * usa `frecuencia`) y el primer paso del intervalo, a los 50 ms, ya suma el incremento: la primera
   * vuelta va de «Desde» + incremento a «Hasta» − incremento, y «Desde» solo suena al dar la vuelta.
   *   entrada   «Ir a 5.000 Hz» y, con el barrido por defecto (Desde 20 · Hasta 2.000 · 5 s),
   *             «Iniciar barrido»
   *   esperado  la primera frecuencia que suena es 20 Hz y ninguna sale de 20–2.000 Hz
   *   obtenido  [5000, 40, 60, 79, 99, …]: 50 ms a 5.000 Hz (con la rampa de entrada subiendo) y
   *             el primer peldaño en 40 Hz. Con el último tono en 20.000 Hz, como tras un test de
   *             agudos, el barrido de graves empieza con un pitido de 20 kHz.
   * El CASO 5 fija hoy ese primer valor («aplicadas[0] = 440»): al reparar, ese caso cambia.
   */
  test('HALLAZGO J1 — el barrido empieza en «Desde», sin sonar antes la frecuencia que había', async ({ page }) => {
    // ABIERTO: afirma lo que DEBERÍA pasar. Comprobado el 13/10/2026 que cae en la aserción de la
    // primera frecuencia (5000 en vez de 20), no en la precondición de que el barrido se mueva.
    test.fail();
    await abrir(page);
    await page.getByRole('button', { name: 'Ir a 5.000 Hz' }).click();
    await expect(campoFrecuencia(page)).toHaveValue('5000');
    await expect(page.locator('#sweep-min')).toHaveValue('20');
    await expect(page.locator('#sweep-max')).toHaveValue('2000');
    await expect(page.locator('#sweep-dur')).toHaveValue('5');
    await page.getByRole('button', { name: /Iniciar barrido/ }).click();
    await expect(page.getByRole('button', { name: /Detener barrido/ })).toHaveAttribute('aria-pressed', 'true');
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: /Detener barrido/ }).click();
    const aplicadas = await frecuenciasAplicadas(page);
    expect(aplicadas.length, 'el barrido tenía que moverse (pasos de 50 ms)').toBeGreaterThanOrEqual(4);
    expect(aplicadas[0], `primera frecuencia que suena (todas: ${aplicadas.slice(0, 6).join(', ')}…)`).toBe(20);
    expect(aplicadas.filter((f) => f < 20 || f > 2000), 'frecuencias fuera de Desde–Hasta').toEqual([]);
  });

  /**
   * HALLAZGO J2 [bajo · contenido] — ABIERTO (13/10/2026). La guía propone el barrido para algo
   * que su barrido no puede hacer en los graves. «Calibración de Sistemas de Audio»: «Usa el barrido
   * (sweep) de 20 Hz a 20 kHz para detectar resonancias o "huecos" en la respuesta de frecuencia de
   * altavoces, auriculares o una sala»; consejo: «Un barrido lento de 20 Hz a 20 kHz […] Las
   * "montañas" son resonancias del altavoz o la sala», y la misma guía sitúa las de la sala por debajo
   * de 100 Hz («Los graves <100 Hz dependen de la sala»). Pero el barrido es LINEAL en peldaños de
   * 50 ms: incremento = (Hasta − Desde)/(Duración·20).
   * Resuelto a mano con el más lento que admite (Duración 60 s, el máximo del campo): 19.980/1.200 =
   * 16,65 Hz por peldaño, así que de 20 a 200 Hz hay 10 peldaños (37, 53, 70, 87, 103, 120, 137, 153,
   * 170, 187) y se cruzan en 0,5 s, con 50 ms por peldaño (1,85 ciclos a 37 Hz); la octava de 10 a
   * 20 kHz se lleva 30 s. Un barrido logarítmico de 60 s, el habitual en acústica (mismo tiempo por
   * octava), dedicaría a 20–200 Hz 60·log(10)/log(1.000) = 20 s, y a los 1,5 s iría por
   * 20·1.000^(1,5/60) = 23,8 Hz. Medido: a los 0,55 s ya suena 203 Hz.
   * Se acepta cualquiera de las dos reparaciones: un barrido que no cruce los graves de un salto, o
   * una guía que deje de proponerlo para las resonancias de sala.
   */
  test('HALLAZGO J2 — el barrido más lento de 20 Hz a 20 kHz no cruza los graves de un salto, o la guía no lo propone para ellos', async ({
    page,
  }) => {
    // ABIERTO: comprobado el 13/10/2026 que cae en la última aserción (519 Hz a los 1,5 s, con la
    // guía proponiéndolo), no en la precondición de que el barrido se mueva.
    test.fail();
    await abrir(page);
    await teclear(page, '#sweep-min', '20');
    await teclear(page, '#sweep-max', '20.000');
    await teclear(page, '#sweep-dur', '60');
    await expect(page.locator('#sweep-max')).toHaveValue('20000');
    await expect(page.locator('#sweep-dur')).toHaveValue('60');
    await page.getByRole('button', { name: /Iniciar barrido/ }).click();
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: /Detener barrido/ }).click();
    // Sin la primera: es la que hubiera en el campo al arrancar (HALLAZGO J1).
    const barrido = (await frecuenciasAplicadas(page)).slice(1);
    expect(barrido.length, 'el barrido tenía que moverse (pasos de 50 ms)').toBeGreaterThanOrEqual(15);
    const texto = (await page.locator('body').textContent()) ?? '';
    const proponeResonanciasDeSala =
      /barrido \(sweep\) de 20 Hz a 20 kHz para detectar resonancias/.test(texto) ||
      /barrido lento de 20 Hz a 20 kHz/.test(texto);
    const hastaDondeLlega = Math.max(...barrido);
    expect(
      proponeResonanciasDeSala ? hastaDondeLlega : 0,
      `en 1,5 s de un barrido de 60 s ya suena ${hastaDondeLlega} Hz (peldaños: ${barrido.slice(0, 12).join(', ')}…)`,
    ).toBeLessThanOrEqual(200);
  });

  /**
   * HALLAZGO J3 [bajo · contenido] — ABIERTO (13/10/2026). Dos preguntas están en las dos FAQ (la
   * visible de la guía y el FAQPage de metadata.ts, que leen buscadores e IAs) con respuestas
   * distintas. No se contradicen: el FAQPage resume, y añade o quita frases sueltas.
   *   «¿Cómo mido cuántos hercios tiene un sonido?» (visible) / «¿Cómo puedo medir la frecuencia de
   *   un sonido en hercios?» (FAQPage)
   *   «¿Qué diferencia hay entre onda senoidal, cuadrada, triangular y sierra?» (visible) / «¿Cuál es
   *   la diferencia entre una onda senoidal, cuadrada, triangular y sierra?» (FAQPage)
   * La reparación es UNA constante en metadata.ts de la que salgan las dos bocas (como
   * app/simulador-gastos-compraventa-garaje): el test pide que, si la pregunta está en las dos, la
   * respuesta sea la misma.
   */
  test('HALLAZGO J3 — una pregunta que está en las dos FAQ tiene la misma respuesta en las dos', async ({ page }) => {
    // ABIERTO: comprobado el 13/10/2026 que cae en la comparación de respuestas (la de los hercios),
    // no en las precondiciones de que la pregunta exista en las dos FAQ.
    test.fail();
    await abrir(page);
    const delFaqPage = await page.evaluate(() => {
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        const j = JSON.parse(s.textContent ?? '{}') as {
          '@type'?: string;
          mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
        };
        if (j['@type'] === 'FAQPage') return (j.mainEntity ?? []).map((q) => ({ pregunta: q.name, respuesta: q.acceptedAnswer.text }));
      }
      return [];
    });
    const visibles = await page.evaluate(() =>
      [...document.querySelectorAll('details')]
        .map((d) => ({ d, s: d.querySelector('summary') }))
        .filter((x) => x.s !== null)
        .map(({ d, s }) => ({
          pregunta: (s?.textContent ?? '').trim(),
          respuesta: (d.textContent ?? '').replace(s?.textContent ?? '', '').trim(),
        })),
    );
    const normal = (t: string) => t.replace(/\s+/g, ' ').trim();
    for (const tema of [/hercios/i, /senoidal, cuadrada, triangular y sierra/i]) {
      const ld = delFaqPage.find((q) => tema.test(q.pregunta));
      const vista = visibles.find((q) => tema.test(q.pregunta));
      expect(ld, `el FAQPage tenía que tener la pregunta de ${tema}`).toBeTruthy();
      expect(vista, `la FAQ visible tenía que tener la pregunta de ${tema}`).toBeTruthy();
      expect(normal(ld?.respuesta ?? ''), `respuesta del FAQPage a «${ld?.pregunta}» frente a la visible «${vista?.pregunta}»`).toBe(
        normal(vista?.respuesta ?? ''),
      );
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// INSPECTOR 14/10/2026 — re-inspección (invalidada por cd462414, el cromo fijo)
// ═════════════════════════════════════════════════════════════════════════════════════════

/**
 * LO QUE LA INVALIDÓ. cd462414 quitó el `scroll-margin-top: 5rem` de `.seccionMedidor`, el destino
 * del enlace del hero «Mídelo con el micrófono» (#medir-frecuencia, hallazgo 2414): ahora lo
 * respeta el `scroll-padding-top` del documento (app/globals.css), que es la caja de la barra del
 * logo + 0,25rem: 62 + 4 = 66 px hasta 768 px de ancho y 92 + 4 = 96 px por encima. Resuelto a mano:
 * la sección queda con su borde de arriba a 66/96 px, y su título, debajo del relleno de la sección,
 * fuera de la barra (que acaba en 62/92 px). Medido el 14/10/2026: sección a 96,2 px (1280×800),
 * 66,1 (360×740) y 65,6 (390×844); título a 122, 92 y 92 px, y lo mismo al cargar la página con el
 * hash. La app no lleva nada más a la vista (ni scrollIntoView ni focus()): la píldora del pie no
 * entra en juego.
 *
 * El MOTOR del medidor (lib/calculadoras/frecuenciaDominante y afinacionInstrumentos) con un
 * micrófono SINTÉTICO: `getUserMedia` devuelve un búfer fabricado en la página, como
 * `microfonoSintetico` de generador-tonos-medidor-inspector.spec.ts, con un fondo de ruido blanco de
 * ±0,001 (≈ −65 dBFS). Resueltos a mano ANTES de ejecutar (temperamento igual, La4 = 440 Hz;
 * n = round(12·log2(f/440)); la nota cuenta desde La y la octava sube en Do; cents =
 * 1200·log2(f/f_nota)):
 *   · NORMAL — 442 Hz, el La de orquesta que cita la guía: 12·log2(442/440) = 0,0785 → n = 0 → La4,
 *     +7,85 cents → «442 Hz · La4 (+8 cents)», y «Llevar la lectura al generador» escribe 442.
 *   · LÍMITE — la frontera Si4 | Do5, donde cambia la nota Y sube la octava: 440·2^(2,5/12) =
 *     508,36 Hz. 506 Hz → 2,4196 semitonos → n = 2 → Si4 (493,88 Hz), +42 cents · 510 Hz → 2,5559 →
 *     n = 3 → Do5 (523,25 Hz; no Do4), −44 cents.
 *   · RECHAZO — la medida de respuesta con un «altavoz» que alterna 0 y −20 dB entre tercios
 *     contiguos: cada salto entre vecinos vale 20 dB, su media 20 > 12 (SALTO_MAXIMO_PLAUSIBLE_DB,
 *     motor-respuesta.ts) → `pareceRuido` → se descarta con su aviso y no se dibuja nada.
 * Medido el 14/10/2026 (a 44,1 kHz): los tres, como se resolvieron. Con −6 dB en vez de −20 (control,
 * fuera del test) la medida se guarda: 26 de 26 puntos, ±2,6-3,6 dB.
 * Tolerancias: los cents van con ±1 (±0,3 Hz de afinado entre bins ≈ ±1,2 cents) y lo que se lleva
 * al generador, con ±0,5 Hz: el defecto que se vigila es el hercio que la app promete no fallar.
 */

/** Tras el enlace del hero: la caja de la barra del logo, la sección del medidor y su título. */
async function saltoAlMedidor(page: Page, gesto: 'click' | 'tap') {
  await page.goto(RUTA);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA]);
  const enlace = page.getByRole('link', { name: 'Mídelo con el micrófono' });
  await (gesto === 'tap' ? enlace.tap() : enlace.click());
  await expect(page).toHaveURL(/#medir-frecuencia$/);
  // Que el salto haya terminado: dos lecturas iguales de scrollY, lejos de arriba.
  await expect
    .poll(async () => {
      const a = await page.evaluate(() => scrollY);
      await page.waitForTimeout(150);
      return a > 0 && a === (await page.evaluate(() => scrollY));
    })
    .toBe(true);
  return page.evaluate(() => {
    const barra = document.querySelector('[data-barra-logo]');
    const seccion = document.querySelector('#medir-frecuencia');
    const titulo = seccion?.querySelector('h3') ?? null;
    const r = titulo?.getBoundingClientRect();
    const arranque = r ? document.elementFromPoint(r.left + 5, r.top + r.height / 2) : null;
    return {
      barraAbajo: barra ? barra.getBoundingClientRect().bottom : 0,
      seccionArriba: seccion ? seccion.getBoundingClientRect().top : -1,
      tituloArriba: r ? r.top : -1,
      tituloLibre: !!titulo && !!arranque && (arranque === titulo || titulo.contains(arranque)),
    };
  });
}

function comprobarSalto(m: Awaited<ReturnType<typeof saltoAlMedidor>>): void {
  expect(m.barraAbajo, 'la barra fija del logo existe').toBeGreaterThan(40);
  expect(m.seccionArriba, `sección a ${m.seccionArriba} px con la barra hasta ${m.barraAbajo}`).toBeGreaterThanOrEqual(m.barraAbajo);
  // Y sin pasarse: el scroll-padding es la barra + 0,25rem, no media pantalla (ni el antiguo
  // scroll-margin SUMADO al padding, que la dejaba a 140-180 px).
  expect(m.seccionArriba, 'la sección no queda lejos de la barra').toBeLessThan(m.barraAbajo + 24);
  expect(m.tituloArriba, `título a ${m.tituloArriba} px con la barra hasta ${m.barraAbajo}`).toBeGreaterThanOrEqual(m.barraAbajo);
  expect(m.tituloLibre, 'el arranque del título lo tapa otro elemento').toBe(true);
}

interface TonoSintetico {
  hz: number;
  amp: number;
  /** Segundos del búfer entre los que suena. */
  desde: number;
  hasta: number;
  /** Rampa de salida hasta `hasta`, en segundos. */
  rampa?: number;
}

/**
 * Sustituye el micrófono por un búfer en bucle: los tonos pedidos más ruido blanco de ±`fondo`, con
 * un generador congruencial de semilla fija (el caso es el mismo cada vez). La pista dice haber
 * apagado los tres procesados, como un micrófono que obedece.
 */
async function microfonoSintetico(page: Page, segundos: number, tonos: TonoSintetico[], fondo = 0.001): Promise<void> {
  await page.addInitScript(
    ({ s, ts, f }: { s: number; ts: TonoSintetico[]; f: number }) => {
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        configurable: true,
        value: async () => {
          const ctx = new AudioContext();
          await ctx.resume();
          const n = Math.round(ctx.sampleRate * s);
          const bufer = ctx.createBuffer(1, n, ctx.sampleRate);
          const d = bufer.getChannelData(0);
          let semilla = 12345;
          for (let i = 0; i < n; i++) {
            const t = i / ctx.sampleRate;
            semilla = (Math.imul(semilla, 1664525) + 1013904223) >>> 0;
            let v = f * ((semilla / 4294967296) * 2 - 1);
            for (const k of ts) {
              if (t >= k.desde && t < k.hasta) {
                const envolvente = k.rampa ? Math.min(1, (k.hasta - t) / k.rampa) : 1;
                v += k.amp * envolvente * Math.sin(2 * Math.PI * k.hz * (t - k.desde));
              }
            }
            d[i] = Math.max(-1, Math.min(1, v));
          }
          const fuente = ctx.createBufferSource();
          fuente.buffer = bufer;
          fuente.loop = true;
          const destino = ctx.createMediaStreamDestination();
          fuente.connect(destino);
          fuente.start();
          const pista = destino.stream.getAudioTracks()[0];
          pista.getSettings = (): MediaTrackSettings => ({
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          });
          return destino.stream;
        },
      });
    },
    { s: segundos, ts: tonos, f: fondo },
  );
}

const seccionMedidor = (page: Page) => page.locator('#medir-frecuencia');
const sinEspacioDuro = (t: string): string => t.replace(/ /g, ' ').trim();

/** Lo que enseña el medidor ahora mismo (sin esperar: `allTextContents` no aguarda al elemento). */
async function lecturaMedidor(page: Page) {
  const s = seccionMedidor(page);
  const texto = async (sel: string) => sinEspacioDuro((await s.locator(sel).allTextContents()).join(' '));
  return {
    cifra: await texto('[class*="medidorCifra"]'),
    nota: await texto('[class*="medidorNota"]'),
    estable: (await s.locator('[class*="medidorEstable"]').count()) > 0,
    retenida: await texto('[class*="medidorRetenida"]'),
  };
}

/** «La4 (+8 cents)» → { nota: 'La4', cents: 8 } (el menos de la app es U+2212). */
function notaYCents(texto: string): { nota: string; cents: number } {
  const m = texto.match(/^(\S+) \(([+−-]?\d+) cents\)$/);
  return m ? { nota: m[1], cents: Number(m[2].replace('−', '-')) } : { nota: '', cents: NaN };
}

async function arrancarMedidor(page: Page): Promise<void> {
  await abrir(page);
  await page.getByRole('button', { name: /Medir la frecuencia/ }).click();
  await expect(page.getByRole('button', { name: /Dejar de medir/ })).toHaveAttribute('aria-pressed', 'true');
}

/** La frecuencia que «Llevar la lectura al generador» deja escrita en el campo. */
async function llevarAlGenerador(page: Page): Promise<{ texto: string; hz: number }> {
  await page.getByRole('button', { name: 'Llevar la lectura al generador' }).click();
  await expect(page.getByRole('button', { name: /Medir la frecuencia/ })).toHaveAttribute('aria-pressed', 'false');
  const texto = await campoFrecuencia(page).inputValue();
  // parser-ok: se lee el campo que la propia app acaba de escribir con coma decimal, no lo que teclea el usuario.
  return { texto, hz: Number(texto.replace(',', '.')) };
}

test.describe('Inspector 14/10/2026', () => {
  test('CROMO FIJO (cd462414) — en escritorio, el enlace del hero deja el título del medidor bajo la barra del logo, no debajo', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    comprobarSalto(await saltoAlMedidor(page, 'click'));
  });

  test('CASO 13 — un diapasón de 442 Hz por el micrófono: «442 Hz · La4 (+8 cents)», estable, y se lleva al generador', async ({
    page,
  }) => {
    await microfonoSintetico(page, 4, [{ hz: 442, amp: 0.3, desde: 0, hasta: 4 }]);
    await arrancarMedidor(page);
    await expect(seccionMedidor(page).getByText('Lectura estable', { exact: true })).toBeVisible({ timeout: 6000 });
    const l = await lecturaMedidor(page);
    // Sin decimales por encima de 100 Hz: 442 ± 0,3 Hz se escribe «442».
    expect(l.cifra).toBe('442 Hz');
    const n = notaYCents(l.nota);
    expect(n.nota, l.nota).toBe('La4');
    expect(n.cents, l.nota).toBeGreaterThanOrEqual(7);
    expect(n.cents, l.nota).toBeLessThanOrEqual(9);
    expect(l.retenida).toMatch(/^Última lectura estable: 442 Hz · La4 \(\+[789] cents\)$/);

    const llevado = await llevarAlGenerador(page);
    expect(Math.abs(llevado.hz - 442), `campo «${llevado.texto}»`).toBeLessThanOrEqual(0.5);
    await expect(
      seccionMedidor(page).getByText(`Frecuencia puesta en el generador: ${llevado.texto} Hz. Pulsa Reproducir para oírla.`),
    ).toBeVisible();
  });

  for (const c of [
    { hz: 506, cifra: '506 Hz', nota: 'Si4', cents: [41, 43] },
    { hz: 510, cifra: '510 Hz', nota: 'Do5', cents: [-45, -43] },
  ]) {
    test(`CASO 14 — a un lado y otro de la frontera Si4 | Do5 (508,36 Hz): ${c.hz} Hz es ${c.nota}`, async ({ page }) => {
      await microfonoSintetico(page, 4, [{ hz: c.hz, amp: 0.3, desde: 0, hasta: 4 }]);
      await arrancarMedidor(page);
      await expect(seccionMedidor(page).getByText('Lectura estable', { exact: true })).toBeVisible({ timeout: 6000 });
      const l = await lecturaMedidor(page);
      expect(l.cifra).toBe(c.cifra);
      const n = notaYCents(l.nota);
      expect(n.nota, `nota «${l.nota}»`).toBe(c.nota);
      expect(n.cents, `nota «${l.nota}»`).toBeGreaterThanOrEqual(c.cents[0]);
      expect(n.cents, `nota «${l.nota}»`).toBeLessThanOrEqual(c.cents[1]);
    });
  }

  test('CASO 15 — una «respuesta» en zigzag de 20 dB entre tercios vecinos se descarta y no se dibuja', async ({ page }) => {
    test.setTimeout(90000);
    // Antes que los instrumentadores: alterna la ganancia del bucle con cada tercio que la app pide,
    // 0 dB en los pares y −20 dB (×0,1) en los impares.
    await page.addInitScript((tercios: number[]) => {
      const w = window as unknown as { __bucle?: { entrada: GainNode } | null; __zigzag: [number, number][] };
      w.__zigzag = [];
      const crear = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function (this: AudioContext): OscillatorNode {
        const osc = crear.call(this);
        const parametro = osc.frequency;
        const fijar = parametro.setValueAtTime.bind(parametro);
        parametro.setValueAtTime = (valor: number, cuando: number): AudioParam => {
          const i = tercios.indexOf(valor);
          if (i >= 0 && w.__bucle) {
            const g = i % 2 === 0 ? 1 : 0.1;
            w.__bucle.entrada.gain.value = g;
            w.__zigzag.push([valor, g]);
          }
          return fijar(valor, cuando);
        };
        return osc;
      };
    }, TERCIOS_50_16K);
    await abrirConMicro(page);

    await page.getByRole('button', { name: 'Medir A', exact: true }).click();
    await expect(avisoMedida(page)).toContainText(
      'Los niveles saltan demasiado entre frecuencias vecinas para ser la respuesta de un altavoz',
      { timeout: 45000 },
    );
    await expect(avisoMedida(page)).toContainText('La medida se descarta.');
    // No es un caso vacío: se emitieron los 26 tonos y el «altavoz» alternó con cada uno.
    expect((await registros(page))[0].frecuenciasAplicadas).toEqual([50, ...TERCIOS_50_16K]);
    const zigzag = await page.evaluate(() => (window as unknown as { __zigzag: [number, number][] }).__zigzag);
    expect(zigzag.slice(1)).toEqual(TERCIOS_50_16K.map((f, i) => [f, i % 2 === 0 ? 1 : 0.1]));
    // Y no se guarda ni se dibuja nada; el micrófono se suelta.
    await expect(graficaMedida(page)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Repetir medida A', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Medir A', exact: true })).toBeEnabled();
    expect(await pistasMicro(page)).toEqual(['ended']);
  });

  /**
   * HALLAZGO K1 (3292) [medio · cálculo] — REPARADO el 14/10/2026.
   * La «Última lectura estable» no era la última: solo cambiaba si el tono nuevo se separaba 10
   * cents o más de la retenida (para no repetir el anuncio de la región aria-live con cada décima
   * de hercio). Lo retenido —y lo que «Llevar la lectura al generador» escribe en el campo— podía
   * ir hasta 10 cents por detrás: 2,5 Hz a 440 Hz, 29 Hz a 5 kHz, frente al «menos de un hercio»
   * que promete la página. REPARADO: la retenida y lo que se lleva son siempre la última estable;
   * la histéresis queda solo en lo que se anuncia, en una región viva aparte.
   *   entrada   micrófono: 440 Hz 2 s, 442 Hz 2 s, silencio (ruido a −65 dBFS)
   *   esperado  con «442 Hz · La4 (+8 cents) · Lectura estable» en pantalla, la retenida es
   *             «442 Hz · La4 (+8 cents)» y se lleva 442 al generador
   *   antes     la retenida se quedaba en «440 Hz · La4 (0 cents)» y se llevaba 440
   */
  test('REPARADO K1 (3292) — la «Última lectura estable» sigue al tono: 440 Hz y luego 442 Hz retiene 442 y lleva 442', async ({
    page,
  }) => {
    await microfonoSintetico(page, 8, [
      { hz: 440, amp: 0.3, desde: 0, hasta: 2 },
      { hz: 442, amp: 0.3, desde: 2, hasta: 4, rampa: 0.02 },
    ]);
    await arrancarMedidor(page);
    const retenida = seccionMedidor(page).locator('[class*="medidorRetenida"]');
    // Precondiciones: primero se retiene el 440, y después el medidor da el 442 por estable.
    await expect(retenida).toContainText(/440\sHz · La4 \(0\scents\)/, { timeout: 6000 });
    await expect
      .poll(
        async () => {
          const l = await lecturaMedidor(page);
          return l.estable && l.cifra === '442 Hz' && /^La4 \(\+[78] cents\)$/.test(l.nota);
        },
        { timeout: 6000, intervals: [100], message: 'el 442 Hz tenía que llegar a «Lectura estable»' },
      )
      .toBe(true);
    await expect(retenida, 'la última lectura estable es la de 442 Hz').toContainText(/442\sHz · La4 \(\+[78]\scents\)/, {
      timeout: 1500,
    });
    // Lo anunciado conserva la histéresis: 442 está a 7,85 cents de 440, menos de 10, así que no se
    // vuelve a anunciar. Desde el 3307 (15/10/2026) el anuncio del 440 ya no se queda en la región
    // viva contradiciendo a la retenida: se vacía al poco de anunciarse.
    await expect(seccionMedidor(page).getByRole('status')).not.toContainText(/Lectura estable: 440\sHz/);
    const llevado = await llevarAlGenerador(page);
    expect(Math.abs(llevado.hz - 442), `campo «${llevado.texto}»`).toBeLessThanOrEqual(0.5);
  });

  /**
   * HALLAZGO K2 (3293) [bajo · contenido] — REPARADO el 14/10/2026 corrigiendo el texto.
   * «Qué mide y qué no» dice: «Si hay varios sonidos a la vez o el sonido cambia sin parar, la cifra
   * salta y no llega a "estable"». Con dos sonidos SOSTENIDOS a la vez llega: gana siempre el mismo
   * pico y las cinco lecturas coinciden. Con dos de igual nivel decide el festoneo de la ventana, que
   * depende de la frecuencia de muestreo del aparato: 440 + 660 Hz a 0,3 dieron «660 Hz · Mi5
   * (+2 cents) · Lectura estable» a 44,1 kHz y «440 Hz · La4 (0 cents) · Lectura estable» a 48 kHz.
   *   entrada   micrófono: 440 Hz (0,3) + 660 Hz (0,15) a la vez, sostenidos
   *   esperado  (lo que dice la página) ninguna «Lectura estable»
   *   obtenido  «440 Hz · La4 (0 cents) · Lectura estable», retenida y ofrecida al generador
   * Vale corregir el texto o no dar por estable un pico con otro cerca de su nivel; el test admite las dos.
   */
  test('REPARADO K2 (3293) — dos sonidos sostenidos a la vez no llegan a «estable» mientras la página diga que no llegan', async ({
    page,
  }) => {
    // REPARADO por el lado del texto: ahora dice que con varios sostenidos da el que más destaca
    // y que puede darlo por estable. La aserción de abajo admite las dos reparaciones.
    await microfonoSintetico(page, 4, [
      { hz: 440, amp: 0.3, desde: 0, hasta: 4 },
      { hz: 660, amp: 0.15, desde: 0, hasta: 4 },
    ]);
    await arrancarMedidor(page);
    const s = seccionMedidor(page);
    await expect(s.locator('[class*="medidorCifra"]'), 'el medidor tenía que oír los dos tonos').not.toHaveText('— Hz', {
      timeout: 6000,
    });
    // Tiempo de sobra para cinco lecturas (cada 100 ms) con la ventana llena.
    await page.waitForTimeout(1500);
    const limites = sinEspacioDuro((await s.locator('[class*="medidaLimites"]').allTextContents()).join(' ')).replace(/\s+/g, ' ');
    const diceQueNoLlega = /varios sonidos (sostenidos )?a la vez[^.]*no llega a «estable»/.test(limites);
    expect(limites).toContain('Si hay varios sonidos sostenidos a la vez, da el que más destaca, y puede darlo por «estable»');
    const l = await lecturaMedidor(page);
    expect(
      diceQueNoLlega && l.estable,
      `la página dice que con varios sonidos no llega a «estable», y da «${l.cifra} · ${l.nota} · Lectura estable»`,
    ).toBe(false);
  });

  /**
   * HALLAZGO K3 (3294) [bajo · contenido] — REPARADO el 14/10/2026: el preset emite 350 Hz, en el
   * centro de 250 – 500 Hz. Antes: el preset «Medios-bajos» emitía 500 Hz, y el rótulo de franja de la propia app
   * (`getDescripcionFrecuencia`: «Medios-bajos» es < 500) dice entonces «Medios - Voz humana». Su
   * tabla pone 500 en el borde de las dos franjas («250 – 500 Hz» y «500 Hz – 2 kHz»). Es la forma del
   * hallazgo 692 (el preset «Ultrasonido» que su rótulo no llamaba así). Los demás presets con nombre
   * de franja caen en la suya.
   *   entrada   pulsar el preset «Medios-bajos»
   *   esperado  un rótulo «Medios-bajos - …»
   *   obtenido  «Medios - Voz humana»
   */
  test('REPARADO K3 (3294) — cada preset de prueba con nombre de franja suena en esa franja', async ({ page }) => {
    await abrir(page);
    const descuadres: string[] = [];
    for (const nombre of ['Subgraves', 'Graves', 'Medios-bajos', 'Medios', 'Medios-altos', 'Agudos', 'Muy agudos']) {
      const boton = page
        .locator('[class*="presetBtn"]')
        .filter({ has: page.locator('[class*="presetNombre"]', { hasText: new RegExp(`^${nombre}$`) }) });
      await boton.click();
      await expect(boton).toHaveAttribute('aria-pressed', 'true');
      const franja = ((await page.locator('[class*="descripcionFrecuencia"]').textContent()) ?? '').trim();
      if (!franja.startsWith(`${nombre} - `)) descuadres.push(`«${nombre}» → «${franja}»`);
    }
    expect(descuadres).toEqual([]);
  });

  /**
   * HALLAZGO K4 (3295) [bajo · contenido] — REPARADO el 14/10/2026: la descripción ya no promete
   * ejercicios, y og/twitter dejan de anunciar «tinnitus» como uso. Antes: la descripción del WebApplication (la que leen buscadores e IAs) dice «Útil para … ejercicios de
   * tinnitus», y la página no tiene ningún ejercicio ni nombra el tinnitus: solo el DisclaimerCard
   * habla de «cómo suena un pitido que ya tienes» y de consultar si hay «acúfenos persistentes». El
   * hallazgo 2309 citó esa frase como prueba de que la app orienta sobre salud (y trajo el
   * DisclaimerCard), pero nadie juzgó si la promesa se cumple.
   */
  test('REPARADO K4 (3295) — el JSON-LD no promete «ejercicios de tinnitus» que la página no tiene', async ({ page }) => {
    await abrir(page);
    for (const sel of ['meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      expect(await page.locator(sel).getAttribute('content'), sel).not.toMatch(/tinnitus/i);
    }
    const descripcion = await page.evaluate(() => {
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        const j = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; description?: string };
        if (j['@type'] === 'WebApplication') return j.description ?? '';
      }
      return '';
    });
    expect(descripcion, 'la app tiene que servir su WebApplication').toMatch(/Generador online de tonos/);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const texto = sinEspacioDuro(await page.locator('body').innerText());
    const paginaLosTiene = /tinnitus|acúfeno/i.test(texto) && /ejercicio/i.test(texto);
    expect(/ejercicios? de tinnitus/i.test(descripcion) && !paginaLosTiene, `WebApplication.description: «${descripcion}»`).toBe(
      false,
    );
  });
});

test.describe('Inspector 14/10/2026 — el salto del hero a 360 px', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('CROMO FIJO (cd462414) — a 360×740, el título del medidor queda bajo la barra del logo, no debajo', async ({ page }) => {
    comprobarSalto(await saltoAlMedidor(page, 'tap'));
  });
});

test.describe('Inspector 14/10/2026 — el salto del hero a 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('CROMO FIJO (cd462414) — a 390×844, el título del medidor queda bajo la barra del logo, no debajo', async ({ page }) => {
    comprobarSalto(await saltoAlMedidor(page, 'tap'));
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 14/10/2026 (tarde) — tras d72384b5 (hallazgos 3292, 3293, 3294 y 3295)
// ═════════════════════════════════════════════════════════════════════════════════════════

/**
 * Lo que d72384b5 cambió en el medidor: la retenida («Última lectura estable») y lo que «Llevar la
 * lectura al generador» escribe pasan a ser SIEMPRE la última estable, y la histéresis de 10 cents
 * queda solo en lo que se anuncia (una región aria-live aparte, `anunciadaHz`). El K1 de arriba
 * comprueba 440 → 442 en UNA medida, subiendo. Aquí lo que su caso no cubría: la otra mitad de la
 * ficha del 3292 (entre DOS medidas, que es como se afina), bajar de nota en una medida, lo que
 * dice la región que se anuncia, y la frase que el 3293 dejó en pie («Si el sonido cambia sin
 * parar, la cifra salta y no llega a "estable"»).
 *
 * Resueltos a mano ANTES de ejecutar (temperamento igual, La4 = 440 Hz; n = round(12·log2(f/440));
 * cents = 1200·log2(f/f_nota); el medidor da por estable cinco lecturas cada 100 ms a ±20 cents de
 * su mediana y sin que el nivel caiga más de 4 dB, motor-medidor.ts):
 *   · NORMAL (CASO 16) — afinar en dos pasadas: 440 Hz, «Dejar de medir», 442 Hz. 440 → La4, 0 cents.
 *     442 → 12·log2(442/440) = 0,0785 → La4, +7,85 → «442 Hz · La4 (+8 cents)»; la retenida pasa a
 *     442 y se lleva 442 (± 0,5 Hz: el defecto que se vigila es quedarse en 440, a 2 Hz).
 *   · LÍMITE (CASO 17) — bajar MENOS que el umbral de 10 cents, en una sola medida: 442 Hz 2 s y
 *     440 Hz 2 s. 1200·log2(440/442) = −7,85 cents, por debajo de los 10 que antes retenían la
 *     cifra vieja. La retenida acaba en «440 Hz · La4 (0 cents)» (±1 cent: el afinado entre bins
 *     yerra ±0,3 Hz ≈ ±1,2 cents) y se lleva 440 ± 0,5.
 *   · RECHAZO (CASO 18) — un glissando de 300 a 600 Hz en 1 s y vuelta (1.200 cents/s): entre dos
 *     lecturas (100 ms) el sonido se mueve 120 cents, y cinco lecturas abarcan 480, frente a los ±20
 *     que admite «estable». Ninguna «Lectura estable», ninguna retenida, ningún «Llevar».
 *   · C0240 — la rampa de 50 ms de «Detener» y del volumen: medida con el medidor de caída en 3 ms de
 *     visualizador-matematicas-musica.spec.ts (validado allí: corte en seco 0,889 · rampa lineal de
 *     10 ms 0,274 · de 50 ms 0,090). Una rampa bien anclada da ≈ 0,09; si llegara empezada δ ms,
 *     saltaría δ/50 de golpe: con los ≈ 16 ms del cabo, ≈ 0,38.
 * Medido el 14/10/2026 (48 kHz): los tres casos, como se resolvieron (CASO 17 lleva «440,1»);
 * C0240: caída 0,099 en 6 de 6 al Detener, 0,099-0,100 en 6 de 6 al bajar el volumen y 0,099 en
 * 4 de 4 al salir a otra app (apagarConRampa); el arranque sube 0,008 · 0,010 · 0,024 · 0,038 ·
 * 0,065 a 0/1/3/5/10 ms (esperado con la rampa en hora: 0,009 · 0,015 · 0,027 · 0,039 · 0,069).
 */

/** Un glissando exponencial (cents por segundo constantes) de `f0` a `f1` entre `desde` y `hasta`. */
interface Glissando {
  f0: number;
  f1: number;
  amp: number;
  desde: number;
  hasta: number;
}

/** Lo que suena por el micrófono en UNA apertura (cada «Medir la frecuencia» abre el micrófono otra vez). */
interface Apertura {
  segundos: number;
  tonos?: TonoSintetico[];
  glissandos?: Glissando[];
}

/**
 * Como `microfonoSintetico`, pero con una señal distinta en cada apertura del micrófono: la primera
 * vez que la app lo pide suena `aperturas[0]`, la segunda `aperturas[1]`… (la última se repite).
 * Ruido blanco de fondo de ±0,001 (≈ −65 dBFS) con semilla fija, y la pista dice haber apagado los
 * tres procesados.
 */
async function microfonoPorApertura(page: Page, aperturas: Apertura[], fondo = 0.001): Promise<void> {
  await page.addInitScript(
    ({ ap, f }: { ap: Apertura[]; f: number }) => {
      const w = window as unknown as { __aperturasMicro: number };
      w.__aperturasMicro = 0;
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        configurable: true,
        value: async () => {
          const sn = ap[Math.min(w.__aperturasMicro, ap.length - 1)];
          w.__aperturasMicro++;
          const ctx = new AudioContext();
          await ctx.resume();
          const n = Math.round(ctx.sampleRate * sn.segundos);
          const bufer = ctx.createBuffer(1, n, ctx.sampleRate);
          const d = bufer.getChannelData(0);
          let semilla = 12345;
          for (let i = 0; i < n; i++) {
            const t = i / ctx.sampleRate;
            semilla = (Math.imul(semilla, 1664525) + 1013904223) >>> 0;
            let v = f * ((semilla / 4294967296) * 2 - 1);
            for (const k of sn.tonos ?? []) {
              if (t >= k.desde && t < k.hasta) {
                const envolvente = k.rampa ? Math.min(1, (k.hasta - t) / k.rampa) : 1;
                v += k.amp * envolvente * Math.sin(2 * Math.PI * k.hz * (t - k.desde));
              }
            }
            for (const g of sn.glissandos ?? []) {
              if (t >= g.desde && t < g.hasta) {
                // Fase integrada de f(τ) = f0·r^(τ/T): 2π·f0·T·(r^(τ/T) − 1) / ln r, con r = f1/f0
                const T = g.hasta - g.desde;
                const r = g.f1 / g.f0;
                v += g.amp * Math.sin((2 * Math.PI * g.f0 * T * (Math.pow(r, (t - g.desde) / T) - 1)) / Math.log(r));
              }
            }
            d[i] = Math.max(-1, Math.min(1, v));
          }
          const fuente = ctx.createBufferSource();
          fuente.buffer = bufer;
          fuente.loop = true;
          const destino = ctx.createMediaStreamDestination();
          fuente.connect(destino);
          fuente.start();
          const pista = destino.stream.getAudioTracks()[0];
          pista.getSettings = (): MediaTrackSettings => ({
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          });
          return destino.stream;
        },
      });
    },
    { ap: aperturas, f: fondo },
  );
}

interface ApunteMedidor {
  cifra: string;
  estado: string;
  retenida: string;
}

/**
 * Apunta, cada 20 ms, lo que enseña el medidor cuando cambia (la cifra, «Lectura estable» /
 * «Leyendo…» y la retenida). Mirar el DOM desde el test cada 100 ms podría perderse una lectura suelta.
 */
async function vigilarMedidor(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __apuntesMedidor: ApunteMedidor[] };
    w.__apuntesMedidor = [];
    let previo = '';
    window.setInterval(() => {
      const s = document.querySelector('#medir-frecuencia');
      if (!s) return;
      const texto = (sel: string) => (s.querySelector(sel)?.textContent ?? '').replace(/ /g, ' ').trim();
      const a = {
        cifra: texto('[class*="medidorCifra"]'),
        estado: texto('[class*="medidorEstable"]') || texto('[class*="medidorLeyendo"]'),
        retenida: texto('[class*="medidorRetenida"]'),
      };
      const clave = `${a.cifra}|${a.estado}|${a.retenida}`;
      if (clave !== previo) {
        previo = clave;
        w.__apuntesMedidor.push(a);
      }
    }, 20);
  });
}

const apuntesMedidor = (page: Page): Promise<ApunteMedidor[]> =>
  page.evaluate(() => (window as unknown as { __apuntesMedidor: ApunteMedidor[] }).__apuntesMedidor);

const aperturasMicro = (page: Page): Promise<number> =>
  page.evaluate(() => (window as unknown as { __aperturasMicro: number }).__aperturasMicro);

/** «Última lectura estable: 442 Hz · La4 (+8 cents)» o «Lectura estable: 440 Hz, La4 (0 cents)» → partes. */
function lecturaDeTexto(texto: string): { hz: string; nota: string; cents: number } | null {
  const m = sinEspacioDuro(texto).match(/lectura estable: ([\d.,]+) Hz[ ·,]+(\S+) \(([+−-]?\d+) cents\)/i);
  return m ? { hz: m[1], nota: m[2], cents: Number(m[3].replace('−', '-')) } : null;
}

/** La caída más brusca de la envolvente en 3 ms, relativa a lo que sonaba los 30 ms anteriores (ver arriba). */
function caidaMaxima3ms(c: CapturaSalida): { caida: number; nivel: number } {
  const ms = (m: number): number => Math.round((m / 1000) * c.sr);
  const media = ms(1.5);
  const paso = Math.max(1, ms(0.25));
  const env: number[] = [];
  for (let i = 0; i < c.x.length; i += paso) {
    let m = 0;
    for (let k = Math.max(0, i - media); k <= Math.min(c.x.length - 1, i + media); k++) m = Math.max(m, Math.abs(c.x[k]));
    env.push(m);
  }
  const d3 = Math.round(ms(3) / paso);
  const d30 = Math.round(ms(30) / paso);
  let caida = 0;
  let nivel = 0;
  for (let j = d30; j + d3 < env.length; j++) {
    let ref = 0;
    for (let k = j - d30; k <= j; k++) ref = Math.max(ref, env[k]);
    nivel = Math.max(nivel, ref);
    if (ref < 0.02) continue;
    caida = Math.max(caida, (env[j] - env[j + d3]) / ref);
  }
  return { caida, nivel };
}

test.describe('re-inspección 14/10/2026 (tarde)', () => {
  const botonMedir = (page: Page) => page.getByRole('button', { name: /Medir la frecuencia/ });
  const botonDejar = (page: Page) => page.getByRole('button', { name: /Dejar de medir/ });
  const retenida = (page: Page) => seccionMedidor(page).locator('[class*="medidorRetenida"]');

  /** Primera pasada en 440 Hz, «Dejar de medir» y segunda pasada hasta que el 442 sea estable. */
  async function dosPasadas440y442(page: Page): Promise<void> {
    await microfonoPorApertura(page, [
      { segundos: 6, tonos: [{ hz: 440, amp: 0.3, desde: 0, hasta: 6 }] },
      { segundos: 6, tonos: [{ hz: 442, amp: 0.3, desde: 0, hasta: 6 }] },
    ]);
    await arrancarMedidor(page);
    await expect(retenida(page)).toHaveText(/^Última lectura estable: 440\sHz · La4 \(0\scents\)$/, { timeout: 6000 });
    await botonDejar(page).click();
    await expect(botonMedir(page)).toHaveAttribute('aria-pressed', 'false');
    // Con el sonido parado la retenida se queda a la vista: es lo que se compara al volver a medir.
    await expect(retenida(page)).toHaveText(/440\sHz/);
    await botonMedir(page).click();
    await expect(botonDejar(page)).toHaveAttribute('aria-pressed', 'true');
    await expect
      .poll(
        async () => {
          const l = await lecturaMedidor(page);
          return l.estable && l.cifra === '442 Hz' && /^La4 \(\+[789] cents\)$/.test(l.nota);
        },
        { timeout: 6000, intervals: [100], message: 'el 442 Hz de la segunda pasada tenía que llegar a «Lectura estable»' },
      )
      .toBe(true);
    expect(await aperturasMicro(page), 'dos pasadas = dos aperturas del micrófono').toBe(2);
  }

  test('CASO 16 — afinar en dos pasadas: 440 Hz, «Dejar de medir», 442 Hz → retiene «442 Hz · La4 (+8 cents)» y lleva 442', async ({
    page,
  }) => {
    await dosPasadas440y442(page);
    // La otra mitad de la ficha del 3292: antes, la retenida se quedaba en 440 entre dos medidas.
    await expect(retenida(page)).toHaveText(/^Última lectura estable: 442\sHz · La4 \(\+[789]\scents\)$/, { timeout: 1500 });
    const llevado = await llevarAlGenerador(page);
    expect(Math.abs(llevado.hz - 442), `campo «${llevado.texto}»`).toBeLessThanOrEqual(0.5);

    // Y el generador emite DE VERDAD lo que se ha llevado: oscilador arrancado con el contexto en
    // marcha, a la frecuencia del campo, y el pico del sonido (FFT de 32.768 de INSTRUMENTAR,
    // afinado con la parábola) a menos de 0,5 Hz de ella: 440 estaría a 2 Hz.
    await botonReproducir(page).click();
    await expect.poll(async () => (await registros(page)).length, { timeout: 5000 }).toBe(1);
    const [osc] = await registros(page);
    expect(osc.estadoCtx).toBe('running');
    expect(osc.frecuenciasAplicadas).toEqual([llevado.hz]);
    await expect
      .poll(
        () =>
          page.evaluate((fc) => {
            const an = (window as unknown as { __analizador: AnalyserNode | null }).__analizador;
            if (!an) return NaN;
            const d = new Float32Array(an.frequencyBinCount);
            an.getFloatFrequencyData(d);
            const ancho = an.context.sampleRate / an.fftSize;
            const c = Math.round(fc / ancho);
            let k = c;
            for (let i = c - 5; i <= c + 5; i++) if (d[i] > d[k]) k = i;
            const delta = (d[k - 1] - d[k + 1]) / (2 * (d[k - 1] - 2 * d[k] + d[k + 1]));
            return Math.abs((k + (Number.isFinite(delta) && Math.abs(delta) <= 0.5 ? delta : 0)) * ancho - fc);
          }, llevado.hz),
        { timeout: 8000, message: `el pico del sonido emitido no cae en ${llevado.texto} Hz (± 0,5)` },
      )
      .toBeLessThan(0.5);
  });

  test('CASO 17 — bajar 7,85 cents en una sola medida (442 → 440 Hz): la retenida acaba en «440 Hz · La4 (0 cents)» y lleva 440', async ({
    page,
  }) => {
    await microfonoPorApertura(page, [
      {
        segundos: 8,
        tonos: [
          { hz: 442, amp: 0.3, desde: 0, hasta: 2, rampa: 0.02 },
          { hz: 440, amp: 0.3, desde: 2, hasta: 4, rampa: 0.02 },
        ],
      },
    ]);
    await arrancarMedidor(page);
    // Precondición: primero se retiene el 442 (el búfer suena 442 Hz los dos primeros segundos).
    await expect(retenida(page)).toHaveText(/^Última lectura estable: 442\sHz · La4 \(\+[789]\scents\)$/, { timeout: 6000 });
    // Antes de que el bucle vuelva al 442 (segundo 8 del búfer).
    await expect(retenida(page)).toHaveText(/^Última lectura estable: 440\sHz · La4 \((0|\+1|−1)\scents\)$/, { timeout: 4000 });
    const llevado = await llevarAlGenerador(page);
    expect(Math.abs(llevado.hz - 440), `campo «${llevado.texto}»`).toBeLessThanOrEqual(0.5);
  });

  test('CASO 18 — un glissando de 300 a 600 Hz por segundo no llega nunca a «Lectura estable» ni deja nada que llevar', async ({
    page,
  }) => {
    await vigilarMedidor(page);
    await microfonoPorApertura(page, [
      {
        segundos: 2,
        glissandos: [
          { f0: 300, f1: 600, amp: 0.3, desde: 0, hasta: 1 },
          { f0: 600, f1: 300, amp: 0.3, desde: 1, hasta: 2 },
        ],
      },
    ]);
    await arrancarMedidor(page);
    // Dos vueltas y media del búfer: tiempo de sobra para cinco lecturas seguidas, si fueran a coincidir.
    await page.waitForTimeout(3500);
    const apuntes = await apuntesMedidor(page);
    const cifras = apuntes.map((a) => a.cifra).filter((c) => /\d/.test(c));
    // No es un caso vacío: el medidor oye el glissando y la cifra se mueve con él.
    expect(new Set(cifras).size, `cifras leídas: ${cifras.slice(0, 12).join(' · ')}`).toBeGreaterThanOrEqual(8);
    expect(apuntes.filter((a) => a.estado === 'Lectura estable').map((a) => a.cifra), 'lecturas «estables» de un glissando').toEqual([]);
    expect(apuntes.filter((a) => a.retenida !== '').map((a) => a.retenida)).toEqual([]);
    await expect(page.getByRole('button', { name: 'Llevar la lectura al generador' })).toHaveCount(0);
  });

  /**
   * Cabo C0240: una rampa de salida que empieza en ctx.currentTime puede llegar ya empezada si el
   * hilo de audio calcula por delante (visualizador-matematicas-musica: 20 ms de rampa, −79 % en
   * 3 ms). Aquí la forma está en `detenerAudio`, en el efecto de volumen y en `apagarConRampa`, con
   * 50 ms de rampa. Resuelto arriba: bien anclada ≈ 0,09; con 16 ms de retraso ≈ 0,38. Umbral 0,2,
   * que es lo que daría un retraso de unos 7 ms. Medido el 14/10/2026: 0,099 en todas.
   */
  test('C0240 — «Detener» y bajar el volumen caen como la rampa de 50 ms, sin escalón al empezar', async ({ page }) => {
    await abrirConSalida(page);
    await botonReproducir(page).click();
    await expect.poll(() => gananciasCreadas(page)).toBe(1);
    await esperarAudio(page, 1.0);
    let antes = await segundosDeAudio(page);
    await botonDetener(page).click();
    await esperarAudio(page, antes + 0.15);
    const alDetener = caidaMaxima3ms(await capturarSalida(page));
    expect(alDetener.nivel, 'la captura contiene el tono al 30 %').toBeGreaterThan(0.25);
    expect(alDetener.caida, 'caída de la envolvente en 3 ms al pulsar «Detener»').toBeLessThan(0.2);

    await expect(botonReproducir(page)).toHaveAttribute('aria-pressed', 'false');
    await botonReproducir(page).click();
    await expect.poll(() => gananciasCreadas(page)).toBe(2);
    await esperarAudio(page, 0.5);
    antes = await segundosDeAudio(page);
    await page.getByRole('slider', { name: 'Volumen' }).press('Home'); // 30 % → 0 %
    await expect(page.locator('[class*="volumenValor"]')).toHaveText(/^0\s%$/);
    await esperarAudio(page, antes + 0.15);
    const alBajar = caidaMaxima3ms(await capturarSalida(page));
    expect(alBajar.nivel, 'la captura contiene el tono al 30 %').toBeGreaterThan(0.25);
    expect(alBajar.caida, 'caída de la envolvente en 3 ms al bajar el volumen a 0').toBeLessThan(0.2);
  });

  /**
   * HALLAZGO L1 (3307) [bajo · accesibilidad] — REPARADO el 15/10/2026 (34046071), vecino del 3292.
   * Tal como se midió el 14/10/2026, antes de repararlo: la reparación separó
   * lo que se ve y se lleva (siempre la última estable) de lo que se anuncia (`anunciadaHz`, con la
   * histéresis de 10 cents). Pero lo anunciado no es solo un aviso que se calla: es el texto de un
   * párrafo sr-only que se QUEDA en la región role="status", y la región es aria-atomic, así que
   * cuando «Llevar la lectura al generador» escribe su aviso se vuelve a leer entera. Un lector de
   * pantalla tiene en esa región una lectura hasta 10 cents vieja (2,5 Hz a 440 Hz, 29 Hz a 5 kHz),
   * que contradice a la retenida visible y a lo que se lleva: el 3292 entero, ahora solo para él.
   *   entrada   micrófono: 440 Hz, «Dejar de medir», 442 Hz (el CASO 16)
   *   esperado  la región que anuncia «Lectura estable» dice lo mismo que la retenida («442 Hz, La4
   *             (+8 cents)»), o no conserva una lectura distinta
   *   obtenido  visible «Última lectura estable: 442 Hz · La4 (+8 cents)» y se lleva 442; en la región
   *             «Lectura estable: 440 Hz, La4 (0 cents)», y al llevar se anuncia «Lectura estable: 440
   *             Hz, La4 (0 cents) Frecuencia puesta en el generador: 442 Hz». Con un glissando lento
   *             la misma cifra sale con dos notas: visible «403 Hz · Sol4 (+47 cents)», anunciado
   *             «403 Hz, Sol#4 (−50 cents)».
   * El K1 de arriba (REPARADO K1) afirma hoy que la región «sigue diciendo 440»: al reparar este, esa
   * línea cambia. Se acepta cualquier reparación que deje la región sin contradecir a la retenida.
   */
  // REPARADO (15/10/2026): el anuncio se escribe, se deja 1,5 s y se vacía; la histéresis se
  // reinicia en cada medida, así que la primera lectura estable de la segunda pasada (442) se
  // anuncia; al parar o al llevar la lectura, en la región no queda ninguna.
  test('REPARADO L1 (3307) — lo que se anuncia de la lectura estable no contradice a la retenida que se ve y se lleva', async ({
    page,
  }) => {
    await dosPasadas440y442(page);
    await expect(retenida(page)).toHaveText(/442\sHz · La4 \(\+[789]\scents\)/, { timeout: 1500 });
    const vista = lecturaDeTexto((await retenida(page).textContent()) ?? '');
    expect(vista, 'la retenida tiene cifra y nota').not.toBeNull();
    const region = (await seccionMedidor(page).getByRole('status').textContent()) ?? '';
    const anunciada = lecturaDeTexto(region);
    expect(
      anunciada === null || (anunciada.hz === vista?.hz && anunciada.nota === vista?.nota && anunciada.cents === vista?.cents),
      `retenida «${sinEspacioDuro((await retenida(page).textContent()) ?? '')}» · región que se anuncia «${sinEspacioDuro(region)}»`,
    ).toBe(true);
    // Pasado el anuncio, la región no conserva ninguna lectura
    await expect(seccionMedidor(page).getByRole('status')).not.toContainText(/Lectura estable/, { timeout: 4000 });
    // Y al llevarla al generador solo se anuncia lo que se ha llevado, sin otra cifra delante
    const llevado = await llevarAlGenerador(page);
    expect(Math.abs(llevado.hz - 442)).toBeLessThanOrEqual(0.5);
    await expect(seccionMedidor(page).getByRole('status')).toHaveText(/^Frecuencia puesta en el generador: 442(,\d)?\sHz\. Pulsa Reproducir para oírla\.$/);
  });

  /**
   * HALLAZGO L2 (3308) [bajo · contenido] — REPARADO el 15/10/2026 (34046071), vecino del 3293. Tal
   * como se midió el 14/10/2026, antes de repararlo: «Qué mide y qué no»,
   * reescrito por el 3293, conservaba: «Si el sonido cambia sin parar, la cifra salta y no llega a
   * "estable"». Solo vale para los cambios rápidos: «estable» son cinco lecturas (0,4 s) a ±20 cents de
   * su mediana, así que un sonido que se desliza a menos de 100 cents por segundo (un semitono por
   * segundo) pasa: cinco lecturas abarcan 0,4·r cents y la mayor desviación es 0,2·r ≤ 20. Una sirena,
   * un motor que acelera, un silbido que sube o un portamento se dan por «Lectura estable», la
   * retenida va cambiando con ellos y «Llevar la lectura al generador» se ofrece todo el rato.
   * Resuelto a mano: glissando de 400 a 443,83 Hz en 3 s y vuelta (400·2^(180/1200); 60 cents/s):
   * 6 cents entre lecturas, 24 en cinco, desviación máxima 12 ≤ 20 → «estable» casi siempre.
   *   esperado  (lo que dice la página) ninguna «Lectura estable»
   *   obtenido  54 de las 58 lecturas en 6 s, «406 · 408 · 409 · 410 · 412 · 413 Hz · Lectura estable»
   *             seguidas (en este test, 22 cifras «estables» distintas en 3 s, de 406 a 437 Hz); a
   *             100 cents/s, 9 de 57; a 150 cents/s, 2 de 58; a 1.200 cents/s, ninguna
   * Se acepta cualquiera de las dos reparaciones: que el texto diga que un cambio lento sí puede darse
   * por estable, o que el medidor no dé por estable un sonido que se desliza.
   */
  // REPARADO (15/10/2026) corrigiendo el texto: «Si el sonido cambia deprisa, la cifra salta…; pero
  // uno que se desliza despacio —menos de un semitono por segundo…— sí puede darse por estable».
  // Se comprueba además que la página dice lo que el medidor hace con este glissando.
  test('REPARADO L2 (3308) — un sonido que se desliza 60 cents por segundo no llega a «estable» mientras la página diga que no llega', async ({
    page,
  }) => {
    await vigilarMedidor(page);
    await microfonoPorApertura(page, [
      {
        segundos: 6,
        glissandos: [
          { f0: 400, f1: 443.83, amp: 0.3, desde: 0, hasta: 3 },
          { f0: 443.83, f1: 400, amp: 0.3, desde: 3, hasta: 6 },
        ],
      },
    ]);
    await arrancarMedidor(page);
    await page.waitForTimeout(3000);
    const apuntes = await apuntesMedidor(page);
    const cifras = apuntes.map((a) => a.cifra).filter((c) => /\d/.test(c));
    expect(new Set(cifras).size, `el sonido se desliza y la cifra lo sigue: ${cifras.slice(0, 12).join(' · ')}`).toBeGreaterThanOrEqual(8);
    const limites = sinEspacioDuro((await seccionMedidor(page).locator('[class*="medidaLimites"]').allTextContents()).join(' ')).replace(
      /\s+/g,
      ' ',
    );
    const diceQueNoLlega = /cambia sin parar, la cifra salta y no llega a «estable»/.test(limites);
    const estables = apuntes.filter((a) => a.estado === 'Lectura estable').map((a) => a.cifra);
    expect(
      diceQueNoLlega ? estables : [],
      'la página dice que un sonido que cambia sin parar no llega a «estable», y este glissando llega',
    ).toEqual([]);
    // Lo que la página dice ahora, y que este glissando (60 cents/s) lo cumple
    expect(limites).toMatch(/se desliza despacio —menos de un semitono por segundo, .*— sí puede darse por estable/);
    expect(estables.length, 'a 60 cents/s el medidor da lecturas estables, como dice la página').toBeGreaterThan(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 15/10/2026 — tras 34046071 (hallazgos 3307 y 3308)
// ═════════════════════════════════════════════════════════════════════════════════════════

/**
 * Lo que 34046071 cambió en el medidor: lo anunciado (`anunciadaHz`) se escribe en la región viva, se
 * deja 1,5 s (MS_ANUNCIO_VISIBLE) y se vacía; la histéresis de 10 cents se mide contra una referencia
 * que se reinicia al pulsar «Medir la frecuencia» —no cuando el sonido se apaga—. Su caso (L1) eran
 * DOS medidas. Aquí lo que no cubría: un sonido que se apaga y vuelve dentro de la MISMA medida, que es
 * como se usa un medidor encendido (tocar, parar, corregir, volver a tocar), cruzando la frontera de
 * una nota; el deslizamiento lento que el 3308 deja escrito que sí es «estable»; y el aviso que deja
 * «Llevar la lectura al generador».
 *
 * Resueltos a mano ANTES de ejecutar (temperamento igual, La4 = 440 Hz; n = round(12·log2(f/440));
 * cents = 1200·log2(f/f_nota); la frontera La4 | La#4 está en 440·2^(0,5/12) = 452,89 Hz):
 *   · LÍMITE (CASO 19) — 452 Hz 2 s, silencio 2,5 s (el medidor vuelve a «— Hz»), 454 Hz 2 s, en UNA
 *     medida. 452 → 0,4661 semitonos → n = 0 → La4, +46,6 → «452 Hz · La4 (+47 cents)».
 *     454 → 0,5423 → n = 1 → La#4 (466,164 Hz) → 1200·log2(454/466,164) = −45,77 → «454 Hz · La#4
 *     (−46 cents)». La retenida pasa de una a otra y se lleva 454 (± 0,5 Hz: el defecto que se
 *     vigila es quedarse en 452). Entre los dos sonidos hay 1200·log2(454/452) = 7,64 cents, menos
 *     que los 10 de la histéresis de lo anunciado.
 *   · M1 — en ese flujo, quien usa lector de pantalla tiene que oír también el segundo sonido.
 *   · M2 — glissando de 400 a 443,83 Hz en 3 s (60 cents/s, el del L2): 6 cents entre lecturas
 *     estables, así que la histéresis de 10 cents se cumple cada dos: un anuncio cada ~0,2 s, frente
 *     a los 1,5 s que la propia app da a cada anuncio para que el lector lo recoja.
 *   · M3 — 442 Hz, «Llevar la lectura al generador» (campo 442) y después el preset «La (A4)»: el campo
 *     pasa a 440 y «Reproducir» emite 440 (n = 0, 0 cents).
 * Medido el 15/10/2026 (Chromium, 48 kHz): CASO 19 como se resolvió; M1, una sola escritura de la
 * región en todo el flujo («Lectura estable: 452 Hz, La4 (+47 cents)»; igual con 440 → 442 y con 440
 * → 440, y con 1 s de silencio en vez de 2,5); M2, 24 escrituras en 5,3 s, una cada 200 ms; M3, el
 * aviso sigue diciendo «Frecuencia puesta en el generador: 442 Hz. Pulsa Reproducir para oírla.».
 */

/** Apunta cada texto que pasa por la región viva del medidor, con su instante (performance.now, ms). */
async function vigilarRegionMedidor(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __regionMedidor: { t: number; texto: string }[] };
    w.__regionMedidor = [];
    let previo = '';
    window.setInterval(() => {
      const r = document.querySelector('#medir-frecuencia [role="status"]');
      if (!r) return;
      const texto = (r.textContent ?? '').replace(/ /g, ' ').trim();
      if (texto !== previo) {
        previo = texto;
        w.__regionMedidor.push({ t: performance.now(), texto });
      }
    }, 20);
  });
}

/** Las escrituras de la región (sin los vaciados), en orden. */
async function escriturasRegion(page: Page): Promise<{ t: number; texto: string }[]> {
  const todas = await page.evaluate(
    () => (window as unknown as { __regionMedidor: { t: number; texto: string }[] }).__regionMedidor,
  );
  return todas.filter((e) => e.texto !== '');
}

test.describe('re-inspección 15/10/2026', () => {
  const retenida = (page: Page) => seccionMedidor(page).locator('[class*="medidorRetenida"]');

  /** 452 Hz, 2,5 s de silencio y 454 Hz en UNA medida, hasta que la retenida pasa al 454. */
  async function apagaYVuelve(page: Page): Promise<void> {
    await vigilarMedidor(page);
    await vigilarRegionMedidor(page);
    await microfonoPorApertura(page, [
      {
        segundos: 10,
        tonos: [
          { hz: 452, amp: 0.3, desde: 0, hasta: 2, rampa: 0.02 },
          { hz: 454, amp: 0.3, desde: 4.5, hasta: 6.5, rampa: 0.02 },
        ],
      },
    ]);
    await arrancarMedidor(page);
    await expect(retenida(page)).toHaveText(/^Última lectura estable: 452\sHz · La4 \(\+4[678]\scents\)$/, { timeout: 6000 });
    await expect(retenida(page)).toHaveText(/^Última lectura estable: 454\sHz · La#4 \(−4[567]\scents\)$/, { timeout: 8000 });
    expect(await aperturasMicro(page), 'una sola medida: una apertura del micrófono').toBe(1);
    // Entre los dos, el medidor se quedó sin sonido: son dos sonidos, no uno que se mueve.
    const apuntes = await apuntesMedidor(page);
    const i452 = apuntes.findIndex((a) => a.estado === 'Lectura estable' && a.cifra === '452 Hz');
    const i454 = apuntes.findIndex((a) => a.estado === 'Lectura estable' && a.cifra === '454 Hz');
    expect(i452, 'el 452 Hz llegó a «Lectura estable»').toBeGreaterThanOrEqual(0);
    expect(
      apuntes.slice(i452, i454).some((a) => a.cifra === '— Hz'),
      `entre los dos sonidos el medidor vuelve a «— Hz»: ${apuntes.map((a) => `${a.cifra} ${a.estado}`).join(' · ')}`,
    ).toBe(true);
  }

  test('CASO 19 — 452 Hz, silencio y 454 Hz en una medida: la retenida cruza de «La4 (+47 cents)» a «La#4 (−46 cents)» y se lleva 454', async ({
    page,
  }) => {
    await apagaYVuelve(page);
    const llevado = await llevarAlGenerador(page);
    expect(Math.abs(llevado.hz - 454), `campo «${llevado.texto}»`).toBeLessThanOrEqual(0.5);
    await expect(seccionMedidor(page).getByRole('status')).toHaveText(
      /^Frecuencia puesta en el generador: 454(,\d)?\sHz\. Pulsa Reproducir para oírla\.$/,
    );
  });

  /**
   * HALLAZGO M1 (3318) [bajo · accesibilidad] — ABIERTO (15/10/2026), vecino del 3307. La histéresis de lo
   * que se anuncia compara cada lectura estable con lo ÚLTIMO ANUNCIADO, y esa referencia solo se
   * reinicia al pulsar «Medir la frecuencia». Un sonido nuevo dentro de la misma medida —tocar, parar,
   * corregir la clavija y volver a tocar, con el medidor encendido— que caiga a menos de 10 cents del
   * anunciado no se anuncia nunca: quien usa lector de pantalla no oye nada del segundo sonido, aunque
   * la retenida que se ve cambie (aquí, hasta de nota) y «Llevar» se lleve la cifra nueva. Es el 3307
   * sin pulsar «Dejar de medir» entre medias.
   *   entrada   micrófono: 452 Hz 2 s, silencio 2,5 s (el medidor vuelve a «— Hz»), 454 Hz 2 s
   *   esperado  la región anuncia también el segundo sonido: «Lectura estable: 454 Hz, La#4 (−46 cents)»
   *   obtenido  una sola escritura en todo el flujo, «Lectura estable: 452 Hz, La4 (+47 cents)», con la
   *             retenida en «454 Hz · La#4 (−46 cents)» y «Llevar» escribiendo 454. Igual con 440 → 442
   *             (el caso del 3307: se oye «La4 (0 cents)» con el tono a +8) y con 440 → 440 (la segunda
   *             nota no se anuncia).
   */
  test('HALLAZGO M1 — un sonido nuevo tras un silencio, en la misma medida, se anuncia aunque quede a menos de 10 cents del anterior', async ({
    page,
  }) => {
    // ABIERTO: comprobado el 15/10/2026 que cae en la última aserción (ninguna escritura del 454),
    // no en las precondiciones de apagaYVuelve ni en la de que el primer sonido se anuncie.
    test.fail();
    await apagaYVuelve(page);
    await page.waitForTimeout(500);
    const textos = (await escriturasRegion(page)).map((e) => e.texto);
    expect(lecturaDeTexto(textos[0] ?? '')?.nota, `primera escritura de la región: «${textos[0]}»`).toBe('La4');
    const delSegundo = textos.map(lecturaDeTexto).filter((l) => l !== null && l.nota === 'La#4');
    expect(delSegundo.length, `la región solo ha dicho: ${textos.join(' · ')}`).toBeGreaterThan(0);
  });

  /**
   * HALLAZGO M2 (3319) [bajo · accesibilidad] — ABIERTO (15/10/2026), vecino del 3308. El 3308 deja escrito
   * que un sonido que se desliza despacio «sí puede darse por estable, y la última lectura estable lo va
   * siguiendo». Lo que se anuncia lo sigue también: la histéresis de 10 cents —puesta para que un lector
   * de pantalla no repita la cifra «diez veces por segundo» (comentario de iniciarMedidor)— se cumple
   * cada dos lecturas a 60 cents/s, y la región se reescribe cada 0,2 s, cuando la propia app da 1,5 s a
   * cada anuncio para que el lector lo recoja (MS_ANUNCIO_VISIBLE). Una sirena o un motor que acelera,
   * los ejemplos de la página, llenan la cola del lector con cifras que ya no valen.
   *   entrada   micrófono: glissando de 400 a 443,83 Hz en 3 s y vuelta (60 cents/s)
   *   esperado  cada anuncio dura al menos el 1,5 s que la app le da antes de que otro lo sustituya
   *   obtenido  24 escrituras en 5,3 s, una cada 200 ms (406 · 409 · 412 · 415 · 418 Hz…), con unos
   *             12 cents entre una y la siguiente; a 20 cents/s, una cada 0,6 s
   */
  test('HALLAZGO M2 — un deslizamiento lento no reescribe la región viva más deprisa de lo que la app deja leer un anuncio', async ({
    page,
  }) => {
    // ABIERTO: comprobado el 15/10/2026 que cae en la última aserción (escrituras a 200 ms), no en las
    // precondiciones de que el glissando se lea como estable y se anuncie.
    test.fail();
    await vigilarMedidor(page);
    await vigilarRegionMedidor(page);
    await microfonoPorApertura(page, [
      {
        segundos: 6,
        glissandos: [
          { f0: 400, f1: 443.83, amp: 0.3, desde: 0, hasta: 3 },
          { f0: 443.83, f1: 400, amp: 0.3, desde: 3, hasta: 6 },
        ],
      },
    ]);
    await arrancarMedidor(page);
    await page.waitForTimeout(3200);
    const estables = new Set((await apuntesMedidor(page)).filter((a) => a.estado === 'Lectura estable').map((a) => a.cifra));
    expect(estables.size, 'el glissando se da por «Lectura estable» y la cifra lo sigue').toBeGreaterThanOrEqual(8);
    const escrituras = await escriturasRegion(page);
    expect(escrituras.length, 'la primera lectura estable se anuncia').toBeGreaterThan(0);
    const huecos = escrituras.slice(1).map((e, i) => Math.round(e.t - escrituras[i].t));
    // 1.500 ms de MS_ANUNCIO_VISIBLE, menos 100 de holgura por el reloj de las lecturas
    expect(
      Math.min(...huecos),
      `escrituras cada ${huecos.join(' · ')} ms: ${escrituras.map((e) => lecturaDeTexto(e.texto)?.hz).join(' · ')} Hz`,
    ).toBeGreaterThanOrEqual(1400);
  });

  /**
   * HALLAZGO M3 (3320) [bajo · contenido] — ABIERTO (15/10/2026), vecino del 3292 por lo que se lleva al
   * generador. «Llevar la lectura al generador» escribe la cifra en el campo y deja en el medidor
   * «Frecuencia puesta en el generador: 442 Hz. Pulsa Reproducir para oírla.». El aviso no se retira
   * cuando el generador pasa a otra frecuencia (un preset, el deslizador, el campo, el barrido): solo al
   * volver a medir. Sigue diciendo que el generador tiene 442 Hz y pidiendo pulsar «Reproducir» para
   * oírla, y «Reproducir» emite otra cosa.
   *   entrada   micrófono 442 Hz → «Llevar la lectura al generador» → preset «La (A4)» → «Reproducir»
   *   esperado  el aviso ya no dice 442 Hz (se retira o dice la frecuencia que hay)
   *   obtenido  campo 440, el oscilador recibe 440, y el aviso sigue: «Frecuencia puesta en el
   *             generador: 442 Hz. Pulsa Reproducir para oírla.»
   */
  test('HALLAZGO M3 — tras llevar la lectura y cambiar de frecuencia, el aviso no sigue diciendo la que se llevó', async ({ page }) => {
    // ABIERTO: comprobado el 15/10/2026 que cae en la última aserción, no en las precondiciones.
    test.fail();
    await microfonoSintetico(page, 4, [{ hz: 442, amp: 0.3, desde: 0, hasta: 4 }]);
    await arrancarMedidor(page);
    await expect(seccionMedidor(page).getByText('Lectura estable', { exact: true })).toBeVisible({ timeout: 6000 });
    const llevado = await llevarAlGenerador(page);
    expect(Math.abs(llevado.hz - 442)).toBeLessThanOrEqual(0.5);
    const aviso = seccionMedidor(page).getByText(/Frecuencia puesta en el generador: 442/);
    await expect(aviso).toBeVisible();

    const la4 = page.locator('[class*="presetBtn"]').filter({ hasText: 'La (A4)' });
    await la4.click();
    await expect(la4).toHaveAttribute('aria-pressed', 'true');
    await expect(campoFrecuencia(page)).toHaveValue('440');
    await botonReproducir(page).click();
    await expect.poll(async () => (await registros(page)).length, { timeout: 5000 }).toBe(1);
    expect((await registros(page))[0].frecuenciasAplicadas, 'lo que suena al pulsar «Reproducir»').toEqual([440]);
    await expect(aviso).toHaveCount(0, { timeout: 1000 });
  });
});
