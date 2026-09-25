import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, sembrarValorAcotado } from './_hidratacion';

/**
 * Generador de Ondas y Visualizador — test de regresión generado por /inspector el 25/09/2026
 * (primera inspección · 47 usos · segmento «cálculo con audio», riesgo 3).
 *
 * QUÉ PROMETE LA APP (de aquí salen los esperados):
 *   - <h1> «Generador de Ondas y Visualizador»: «genera tonos, visualiza audio y aprende física
 *     del sonido». Cuatro ondas (senoidal, cuadrada, triangular, diente de sierra), frecuencia
 *     de 20 a 2.000 Hz por deslizador, presets «con las frecuencias exactas de las notas Do a
 *     Si», volumen de 0 a 100 %, y «puedes cambiar los parámetros mientras el sonido está activo».
 *   - Visualizador: carga un audio, lo dibuja en tres estilos (Barras, Línea, Espejo), con
 *     colores a elegir, y lo exporta como PNG.
 *   - No muestra periodo, longitud de onda ni cents, ni declara una velocidad del sonido: solo
 *     la frecuencia. Por eso los esperados del generador son la frecuencia y el DIBUJO.
 *
 * CÓMO SE DERIVAN LOS NÚMEROS (a mano, ninguno copiado de la app)
 *   - La4 = 440 Hz (ISO 16). Do4 = 440·2^(−9/12) = 261,6256 → preset 261,63; con un decimal,
 *     formatNumber(261,63; 1) = «261,6».
 *   - Periodo a 440 Hz: T = 1/440 = 2,2727 ms (a título informativo, la app no lo muestra;
 *     λ = 343/440 = 0,780 m con c = 343 m/s a 20 °C, tampoco).
 *   - El osciloscopio pinta `fftSize` = 2.048 muestras en 800 px: 2.048/sr segundos. Con
 *     sr = 44.100 Hz son 46,44 ms = 20,43 periodos de 2,2727 ms; con 48.000 Hz, 18,77. El
 *     sampleRate lo elige el sistema, así que se lee y se calcula aquí: 440·2.048/sr.
 *   - Amplitud del dibujo: getByteTimeDomainData lleva [−1, 1] a [0, 255] (128 = 0); la app
 *     pinta y = byte/128 · 100 px. Con volumen 50 % (ganancia 0,5) el byte va de 64 a 192 →
 *     y de 50 a 150 px.
 *   - Visualizador: el lienzo es de 800 × 200 y `amplitude` = 200/2 − 20 = 80 px.
 *     Espejo, columna de amplitud a: banda de 2·a·80 px. Con la rampa de prueba a(t) = 0,08·t,
 *     en la columna 400 (t = 5 s) a = 0,4 → 64 px.
 *     Barras: media de |a·sen| = a·2/π → alto = a·(2/π)·80·2. En t = 5 s: 0,4·0,6366·160 = 40,7 px.
 *   - Tamaño: WAV PCM 16 bits mono de 1 s a 8.000 Hz = 44 + 16.000 = 16.044 B = 15,668 KB
 *     → «15,7 KB» en formato español. Duración 1 s → «0:01».
 *
 * INSTRUMENTACIÓN
 *   Se envuelve el Web Audio con addInitScript: cada llamada a un AudioParam (setValueAtTime,
 *   rampas, setTargetAtTime, cancelScheduledValues y las asignaciones a `.value`), cada
 *   start()/stop() con su argumento, cada close() y cada cambio de `type`, con el reloj de audio
 *   (ctx.currentTime). Y todo lo que la app conecta a `ctx.destination` pasa por un bus propio
 *   con un AnalyserNode: lo que mide ese bus es EXACTAMENTE lo que llega a los altavoces. Los
 *   tiempos del audio se miden con ese reloj y con expect.poll, nunca con esperas de pared.
 *
 * ORDEN: CASOS 1-4 (pasan: red de regresión) · HALLAZGOS con `test.fail()`, que afirman lo que
 * la app DEBERÍA hacer; el día que se reparen, Playwright avisará de que sobra la marca.
 */

test.use({ launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } });

const RUTA = '/generador-ondas/';
const FRECUENCIA = 'input[type="range"][max="2000"]';
const VOLUMEN = 'input[type="range"][max="100"]';

interface LlamadaAudio {
  quien: string;
  metodo: string;
  args: (number | string)[];
  /** Reloj de audio (ctx.currentTime) en el instante de la llamada. */
  ct: number;
}

interface VentanaOndas {
  __ondasLlamadas: LlamadaAudio[];
  __ondasOsc: OscillatorNode[];
  __ondasGan: GainNode[];
  __ondasBuses: { ctx: BaseAudioContext; g: GainNode; an: AnalyserNode }[];
}

function INSTRUMENTAR(): void {
  const w = window as unknown as VentanaOndas;
  w.__ondasLlamadas = [];
  w.__ondasOsc = [];
  w.__ondasGan = [];
  w.__ondasBuses = [];
  const dueno = new WeakMap<object, { id: string; ctx: BaseAudioContext }>();
  const proto = BaseAudioContext.prototype;
  const crearOsc = proto.createOscillator;
  const crearGan = proto.createGain;
  const crearAn = proto.createAnalyser;
  let nOsc = 0;
  let nGan = 0;

  proto.createOscillator = function (this: BaseAudioContext): OscillatorNode {
    const nodo = crearOsc.call(this);
    const id = `osc${nOsc++}`;
    dueno.set(nodo, { id, ctx: this });
    dueno.set(nodo.frequency, { id: `${id}.frequency`, ctx: this });
    w.__ondasOsc.push(nodo);
    return nodo;
  };
  proto.createGain = function (this: BaseAudioContext): GainNode {
    const nodo = crearGan.call(this);
    const id = `gain${nGan++}`;
    dueno.set(nodo, { id, ctx: this });
    dueno.set(nodo.gain, { id: `${id}.gain`, ctx: this });
    w.__ondasGan.push(nodo);
    return nodo;
  };

  const anotar = (obj: object, metodo: string, args: unknown[]): void => {
    const d = dueno.get(obj);
    if (!d) return;
    w.__ondasLlamadas.push({
      quien: d.id,
      metodo,
      args: args.filter((a): a is number | string => typeof a === 'number' || typeof a === 'string'),
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
  const valor = Object.getOwnPropertyDescriptor(AudioParam.prototype, 'value');
  if (valor?.get && valor.set) {
    const leer = valor.get;
    const escribir = valor.set;
    Object.defineProperty(AudioParam.prototype, 'value', {
      configurable: true,
      get(this: AudioParam): number {
        return leer.call(this);
      },
      set(this: AudioParam, v: number) {
        anotar(this, 'value=', [v]);
        escribir.call(this, v);
      },
    });
  }
  const tipo = Object.getOwnPropertyDescriptor(OscillatorNode.prototype, 'type');
  if (tipo?.get && tipo.set) {
    const leer = tipo.get;
    const escribir = tipo.set;
    Object.defineProperty(OscillatorNode.prototype, 'type', {
      configurable: true,
      get(this: OscillatorNode): OscillatorType {
        return leer.call(this);
      },
      set(this: OscillatorNode, v: OscillatorType) {
        anotar(this, 'type=', [v]);
        escribir.call(this, v);
      },
    });
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
    w.__ondasLlamadas.push({ quien: 'ctx', metodo: 'close', args: [], ct: this.currentTime });
    return cerrar.call(this);
  };

  // El bus: lo que la app manda a los altavoces pasa por aquí, y el analizador lo registra.
  // 32.768 muestras = 0,74 s a 44,1 kHz (0,68 s a 48 kHz) de margen para leerlo.
  const nodo = AudioNode.prototype as unknown as { connect: (...a: unknown[]) => unknown };
  const conectar = nodo.connect;
  nodo.connect = function (this: AudioNode, destino: unknown, ...resto: unknown[]): unknown {
    if (destino instanceof AudioDestinationNode) {
      const ctx = this.context;
      let bus = w.__ondasBuses.find((b) => b.ctx === ctx);
      if (!bus) {
        const g = crearGan.call(ctx);
        const an = crearAn.call(ctx);
        an.fftSize = 32768;
        conectar.call(g, ctx.destination);
        conectar.call(g, an);
        bus = { ctx, g, an };
        w.__ondasBuses.push(bus);
      }
      return conectar.call(this, bus.g, ...resto);
    }
    return conectar.call(this, destino, ...resto);
  };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(INSTRUMENTAR);
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Generador de Ondas y Visualizador');
  await esperarHidratacion(page, [FRECUENCIA, VOLUMEN]);
});

const llamadas = (page: Page): Promise<LlamadaAudio[]> =>
  page.evaluate(() => (window as unknown as VentanaOndas).__ondasLlamadas);

interface EstadoVivo {
  osciladores: number;
  frecuencia: number;
  tipo: OscillatorType;
  ganancia: number;
  estadoCtx: AudioContextState;
}

/** El último oscilador y la última ganancia que ha creado la app, leídos de los nodos. */
const vivo = (page: Page): Promise<EstadoVivo | null> =>
  page.evaluate(() => {
    const w = window as unknown as VentanaOndas;
    const osc = w.__ondasOsc.at(-1);
    const gan = w.__ondasGan.at(-1);
    if (!osc || !gan) return null;
    return {
      osciladores: w.__ondasOsc.length,
      frecuencia: osc.frequency.value,
      tipo: osc.type,
      ganancia: gan.gain.value,
      estadoCtx: (osc.context as AudioContext).state,
    };
  });

interface Salida {
  estado: AudioContextState;
  t: number;
  max: number;
}

/** Lo que llega a los altavoces por cada AudioContext: pico de los últimos 0,7 s. */
const salidas = (page: Page): Promise<Salida[]> =>
  page.evaluate(() =>
    (window as unknown as VentanaOndas).__ondasBuses.map((b) => {
      const x = new Float32Array(b.an.fftSize);
      b.an.getFloatTimeDomainData(x);
      let max = 0;
      for (const v of x) max = Math.max(max, Math.abs(v));
      return { estado: (b.ctx as AudioContext).state, t: b.ctx.currentTime, max };
    }),
  );

/** Reloj de audio del primer contexto (el que crea el generador). */
const reloj = (page: Page): Promise<number> =>
  page.evaluate(() => (window as unknown as VentanaOndas).__ondasBuses[0]?.ctx.currentTime ?? -1);

/**
 * Espera a que el reloj de AUDIO llegue a `t`. Sondea cada 20 ms: el analizador guarda 0,7 s,
 * y un sondeo que se pasara de largo leería un búfer del que el suceso ya ha salido.
 */
async function esperarReloj(page: Page, t: number): Promise<void> {
  await expect
    .poll(() => reloj(page), { intervals: [20], timeout: 10000, message: `el reloj de audio nunca llegó a ${t} s` })
    .toBeGreaterThanOrEqual(t);
}

interface Captura {
  sr: number;
  x: number[];
}

const capturar = (page: Page): Promise<Captura> =>
  page.evaluate(() => {
    const b = (window as unknown as VentanaOndas).__ondasBuses[0];
    const x = new Float32Array(b.an.fftSize);
    b.an.getFloatTimeDomainData(x);
    return { sr: b.ctx.sampleRate, x: Array.from(x) };
  });

/** Máximo de |x| en ±1,5 ms alrededor de la muestra `centro` (a 440 Hz, 1,3 periodos). */
function amplitudEn(c: Captura, centro: number): number {
  const media = Math.round(0.0015 * c.sr);
  let m = 0;
  for (let i = Math.max(0, centro - media); i <= Math.min(c.x.length - 1, centro + media); i++) {
    m = Math.max(m, Math.abs(c.x[i]));
  }
  return m;
}

/**
 * Milisegundos que tarda lo emitido en bajar del 90 % al 10 % de 0,5 (de 0,45 a 0,05): desde la
 * ÚLTIMA ventana que aún pasa de 0,45 hasta la primera que ya no llega a 0,05. Con una rampa
 * lineal de 50 ms serían 0,4/0,5 · 50 = 40 ms; un escalón baja en menos de una ventana (≈ 1 ms).
 */
function bajada(c: Captura): number {
  const paso = Math.round(0.0005 * c.sr);
  let ultimoAlto = -1;
  for (let i = 0; i < c.x.length; i += paso) if (amplitudEn(c, i) >= 0.45) ultimoAlto = i;
  if (ultimoAlto < 0) return NaN;
  for (let i = ultimoAlto; i < c.x.length; i += paso) {
    if (amplitudEn(c, i) <= 0.05) return ((i - ultimoAlto) / c.sr) * 1000;
  }
  return NaN;
}

const botonReproducir = (page: Page) => page.getByRole('button', { name: /Reproducir/ });
const botonDetener = (page: Page) => page.getByRole('button', { name: /Detener/ });
const rotuloFrecuencia = (page: Page) => page.getByRole('heading', { name: /^Frecuencia:/ });
const rotuloVolumen = (page: Page) => page.getByRole('heading', { name: /^Volumen:/ });

/** Reproduce y espera a que el reloj de audio pase de `segundos` desde el arranque. */
async function reproducir(page: Page, segundos = 0.3): Promise<number> {
  await botonReproducir(page).click();
  await expect.poll(async () => (await llamadas(page)).some((l) => l.metodo === 'start')).toBe(true);
  const inicio = (await llamadas(page)).filter((l) => l.metodo === 'start').at(-1)?.ct ?? 0;
  await esperarReloj(page, inicio + segundos);
  return inicio;
}

interface Trazo {
  min: number;
  max: number;
  cruces: number;
}

/** El trazo del osciloscopio (color #2E86AB): extremos verticales y cruces del eje, subiendo. */
const trazoOsciloscopio = (page: Page): Promise<Trazo> =>
  page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>('[class*="canvasContainer"] canvas');
    if (!c) return { min: -1, max: -1, cruces: -1 };
    const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    const ys: (number | null)[] = [];
    for (let x = 0; x < c.width; x++) {
      let suma = 0;
      let n = 0;
      for (let y = 0; y < c.height; y++) {
        const i = (y * c.width + x) * 4;
        if (Math.abs(d[i] - 46) + Math.abs(d[i + 1] - 134) + Math.abs(d[i + 2] - 171) < 90) {
          suma += y;
          n++;
        }
      }
      ys.push(n ? suma / n : null);
    }
    const validos = ys.filter((v): v is number => v !== null);
    let cruces = 0;
    for (let x = 1; x < ys.length - 2; x++) {
      const a = ys[x - 1];
      const b = ys[x];
      if (a !== null && b !== null && a > 100 && b <= 100) cruces++;
    }
    return validos.length
      ? { min: Math.min(...validos), max: Math.max(...validos), cruces }
      : { min: -1, max: -1, cruces: 0 };
  });

/** WAV PCM 16 bits mono, 8.000 Hz, tono de 440 Hz con la envolvente `amp(t)`. */
function wav(segundos: number, amp: (t: number) => number): Buffer {
  const sr = 8000;
  const n = Math.round(sr * segundos);
  const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + n * 2, 4);
  b.write('WAVE', 8);
  b.write('fmt ', 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24);
  b.writeUInt32LE(sr * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write('data', 36);
  b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    b.writeInt16LE(Math.round(32767 * amp(t) * Math.sin(2 * Math.PI * 440 * t)), 44 + i * 2);
  }
  return b;
}

async function cargarAudio(page: Page, nombre: string, buffer: Buffer, mimeType = 'audio/wav'): Promise<void> {
  await page.getByRole('button', { name: /Visualizador de Audio/ }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: nombre, mimeType, buffer });
}

/** Alto del trazo del visualizador, en px, en las columnas [x0, x1]: de su punto más alto al más bajo. */
const altoTrazo = (page: Page, x0: number, x1: number): Promise<number> =>
  page.evaluate(
    ({ x0, x1 }) => {
      const c = document.querySelector<HTMLCanvasElement>('[class*="canvasContainer"] canvas');
      if (!c) return -1;
      const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
      let lo = Infinity;
      let hi = -Infinity;
      for (let x = x0; x <= x1; x++) {
        for (let y = 0; y < c.height; y++) {
          const i = (y * c.width + x) * 4;
          if (Math.abs(d[i] - 46) + Math.abs(d[i + 1] - 134) + Math.abs(d[i + 2] - 171) < 120) {
            lo = Math.min(lo, y);
            hi = Math.max(hi, y);
          }
        }
      }
      return hi < 0 ? 0 : hi - lo + 1;
    },
    { x0, x1 },
  );

/** Rampa de amplitud 0 → 0,8 en 10 s: a(t) = 0,08·t. */
const RAMPA_10S = (): Buffer => wav(10, (t) => 0.08 * t);

// ============================================================
// CASO 1 — NORMAL: La4 senoidal a 440 Hz y volumen 50 %
// ============================================================
test('CASO 1 — La4 senoidal: suena 440 Hz a 0,5, el osciloscopio dibuja 440·2048/sr periodos, y Do4 = 261,63 Hz', async ({
  page,
}) => {
  await expect(rotuloFrecuencia(page)).toHaveText('Frecuencia: 440,0 Hz');
  await expect(rotuloVolumen(page)).toHaveText('Volumen: 50%');
  await expect(page.getByRole('button', { name: 'La (A4)' })).toHaveAttribute('aria-pressed', 'true');
  expect(await llamadas(page)).toHaveLength(0); // nada suena antes de pulsar

  await reproducir(page);
  const foto = await vivo(page);
  expect(foto?.osciladores).toBe(1);
  expect(foto?.tipo).toBe('sine'); // onda por defecto
  expect(foto?.frecuencia).toBe(440); // La4 = 440 Hz
  expect(foto?.estadoCtx).toBe('running'); // «suspended» = no sonaría
  await expect.poll(async () => (await vivo(page))?.ganancia).toBeCloseTo(0.5, 3); // 50 %
  // Lo que llega a los altavoces: una senoidal de pico 0,5.
  await expect.poll(async () => (await salidas(page))[0]?.max ?? 0).toBeCloseTo(0.5, 2);

  // El dibujo: y de 50 a 150 px (ganancia 0,5) y 440·2.048/sr periodos en los 800 px.
  const sr = await page.evaluate(() => (window as unknown as VentanaOndas).__ondasBuses[0].ctx.sampleRate);
  const periodos = (440 * 2048) / sr; // 20,43 a 44,1 kHz · 18,77 a 48 kHz
  await expect
    .poll(async () => {
      const t = await trazoOsciloscopio(page);
      return Math.abs(t.min - 50) <= 3 && Math.abs(t.max - 150) <= 3 && Math.abs(t.cruces - periodos) <= 1.5;
    }, { message: `el osciloscopio debería mostrar ~${periodos.toFixed(2)} periodos entre y = 50 y 150 px` })
    .toBe(true);

  // Preset Do (C4) con el tono sonando: 440·2^(−9/12) = 261,6256 → 261,63 Hz, rótulo «261,6».
  await page.getByRole('button', { name: 'Do (C4)' }).click();
  await expect(rotuloFrecuencia(page)).toHaveText('Frecuencia: 261,6 Hz');
  await expect(page.getByRole('button', { name: 'Do (C4)' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await vivo(page))?.frecuencia ?? 0).toBeCloseTo(261.63, 2);
  expect((await vivo(page))?.osciladores).toBe(1); // el mismo oscilador, retocado en caliente

  // Detener para de verdad: stop() y, pasados 0,74 s de audio, silencio en los altavoces.
  await botonDetener(page).click();
  await expect(botonReproducir(page)).toBeVisible();
  expect((await llamadas(page)).some((l) => l.quien === 'osc0' && l.metodo === 'stop')).toBe(true);
  await expect
    .poll(async () => (await salidas(page))[0]?.max ?? 1, { timeout: 8000, message: 'tras Detener, silencio' })
    .toBeLessThan(1e-3);
});

// ============================================================
// CASO 2 — LÍMITE: extremos 20 / 2.000 Hz, volumen 0 y 100 %, y
// cambio de onda con el tono sonando — en móvil (390 px)
// ============================================================
test.describe('En móvil (390 px)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 2 — extremos del rango y del volumen, y cambio de onda en caliente, sin desbordar a lo ancho', async ({
    page,
  }) => {
    const anchos = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(anchos.cliente).toBe(390);
    expect(anchos.scroll).toBeLessThanOrEqual(anchos.cliente);
    expect((await botonReproducir(page).boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);

    await reproducir(page);

    // Techo prometido («20 Hz (grave) … 2000 Hz (agudo)»). formatNumber en es-ES no agrupa
    // números de cuatro cifras (ICU, minimumGroupingDigits = 2): «2000,0».
    await page.locator(FRECUENCIA).press('End');
    await expect(rotuloFrecuencia(page)).toHaveText('Frecuencia: 2000,0 Hz');
    await expect.poll(async () => (await vivo(page))?.frecuencia).toBe(2000);
    // Suelo prometido.
    await page.locator(FRECUENCIA).press('Home');
    await expect(rotuloFrecuencia(page)).toHaveText('Frecuencia: 20,0 Hz');
    await expect.poll(async () => (await vivo(page))?.frecuencia).toBe(20);

    // Volumen 0 %: ganancia 0. Volumen 100 %: ganancia 1 (la escala es volumen/100).
    await page.locator(VOLUMEN).press('Home');
    await expect(rotuloVolumen(page)).toHaveText('Volumen: 0%');
    await expect.poll(async () => (await vivo(page))?.ganancia ?? 1).toBeLessThan(1e-3);
    await page.locator(VOLUMEN).press('End');
    await expect(rotuloVolumen(page)).toHaveText('Volumen: 100%');
    await expect.poll(async () => (await vivo(page))?.ganancia ?? 0).toBeCloseTo(1, 3);

    // Cambio de onda con el tono sonando: el MISMO oscilador cambia de tipo.
    await page.getByRole('button', { name: /Cuadrada/ }).click();
    await expect(page.getByRole('button', { name: /Cuadrada/ })).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(async () => (await vivo(page))?.tipo).toBe('square');
    expect((await vivo(page))?.osciladores).toBe(1);

    await botonDetener(page).click();
    await expect(botonReproducir(page)).toBeVisible();
  });
});

// ============================================================
// CASO 3 — RECHAZO: fuera de rango, texto y un archivo que no es audio
// ============================================================
test('CASO 3 — el deslizador no deja salir la frecuencia de 20–2.000 Hz y un .txt no se carga', async ({ page }) => {
  await reproducir(page);

  // Fuera de rango: el <input type="range"> satura en su min/max y la app lee lo saturado.
  expect(await sembrarValorAcotado(page, FRECUENCIA, '5000')).toBe('2000');
  await expect(rotuloFrecuencia(page)).toHaveText('Frecuencia: 2000,0 Hz');
  await expect.poll(async () => (await vivo(page))?.frecuencia).toBe(2000);
  expect(await sembrarValorAcotado(page, FRECUENCIA, '-50')).toBe('20');
  await expect.poll(async () => (await vivo(page))?.frecuencia).toBe(20);
  expect(await sembrarValorAcotado(page, VOLUMEN, '150')).toBe('100');
  await expect(rotuloVolumen(page)).toHaveText('Volumen: 100%');

  // Texto: un range no admite teclearlo; si llega por programa, el navegador lo sanea a su valor
  // por defecto, el punto medio (20 + 2.000)/2 = 1.010. Lo que se vigila es que no llegue NaN.
  expect(await sembrarValorAcotado(page, FRECUENCIA, 'abc')).toBe('1010');
  await expect.poll(async () => (await vivo(page))?.frecuencia).toBe(1010);

  const pedidas = (await llamadas(page))
    .filter((l) => l.quien.endsWith('.frequency'))
    .map((l) => Number(l.args[0]));
  for (const f of pedidas) {
    expect(Number.isFinite(f), `frecuencia pedida: ${f}`).toBe(true);
    expect(f).toBeGreaterThanOrEqual(20);
    expect(f).toBeLessThanOrEqual(2000);
  }
  await botonDetener(page).click();

  // Un archivo que no es audio se rechaza con aviso y la zona de carga sigue ahí.
  const avisos: string[] = [];
  page.on('dialog', (d) => {
    avisos.push(d.message());
    void d.dismiss();
  });
  await cargarAudio(page, 'notas.txt', Buffer.from('hola'), 'text/plain');
  await expect.poll(() => avisos).toEqual(['Por favor, selecciona un archivo de audio válido']);
  await expect(page.locator('[class*="dropZone"]')).toBeVisible();
  await expect(page.locator('[class*="fileInfo"]')).toHaveCount(0);
});

// ============================================================
// CASO 4 — NORMAL: el visualizador dibuja lo que hay en el archivo
// ============================================================
test('CASO 4 — visualizador: 1 s dura «0:01»; Espejo y Barras miden la amplitud de una rampa 0 → 0,8', async ({
  page,
}) => {
  await cargarAudio(page, 'la440_1s.wav', wav(1, () => 0.8));
  await expect(page.locator('[class*="fileName"]')).toHaveText('la440_1s.wav');
  await expect(page.locator('[class*="fileMeta"]')).toContainText('0:01'); // 1 s
  await page.getByRole('button', { name: 'Cambiar archivo' }).click();

  await cargarAudio(page, 'rampa10s.wav', RAMPA_10S());
  await expect(page.locator('[class*="fileMeta"]')).toContainText('0:10');

  // Espejo, columna 400 (t = 5 s, a = 0,4): banda de 2·0,4·80 = 64 px.
  await page.getByRole('button', { name: /Espejo/ }).click();
  await expect.poll(async () => Math.abs((await altoTrazo(page, 400, 400)) - 64)).toBeLessThanOrEqual(3);
  // Y la rampa se ve: t = 1 s → 12,8 px · t = 9 s → 115,2 px.
  await expect.poll(async () => Math.abs((await altoTrazo(page, 80, 80)) - 12.8)).toBeLessThanOrEqual(3);
  await expect.poll(async () => Math.abs((await altoTrazo(page, 720, 720)) - 115.2)).toBeLessThanOrEqual(3);

  // Barras, columna 400: 0,4·(2/π)·160 = 40,7 px.
  await page.getByRole('button', { name: /Barras/ }).click();
  await expect.poll(async () => Math.abs((await altoTrazo(page, 400, 400)) - 40.7)).toBeLessThanOrEqual(3);

  // Exportar: un PNG con el nombre del archivo.
  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Exportar como PNG/ }).click(),
  ]);
  expect(descarga.suggestedFilename()).toBe('waveform_rampa10s.png');
});

// ============================================================
// HALLAZGOS (Inspector 25/09/2026) — fallan a propósito
// ============================================================

/**
 * HALLAZGO [alto]. La página no tiene efecto de limpieza al desmontarse: con el tono sonando,
 * una navegación de cliente (clic en una tarjeta de RelatedApps) deja el oscilador, la ganancia
 * y el AudioContext vivos. El tono sigue sonando en la app de destino, y al volver no hay botón
 * que lo pare: la página nueva crea su PROPIO contexto, así que su «Detener» no lo alcanza.
 * Medido: tras el clic en «Generador de Tonos», 0 llamadas a stop()/close(), contexto
 * «running» y pico 0,50 en los altavoces a los 2 s; de vuelta, Reproducir + Detener deja el
 * contexto nuevo en silencio y el viejo a 0,50. Solo lo corta recargar o cerrar la pestaña.
 * Correcto: al salir de la página, silencio.
 */
test('HALLAZGO — salir a otra app con el tono sonando lo detiene', async ({ page }) => {
  test.fail();
  await reproducir(page);
  await page.locator('a[href*="/generador-tonos/"]').first().click();
  await page.waitForURL(/generador-tonos/);
  await expect
    .poll(
      async () => (await salidas(page)).every((s) => s.estado === 'closed' || s.max < 1e-3),
      { timeout: 5000, message: 'el tono sigue llegando a los altavoces en la app de destino' },
    )
    .toBe(true);
});

/**
 * HALLAZGO [bajo, forma de los 1637/1638 de generador-tonos]. Aunque se añada la limpieza, el
 * corte al desmontar debe ir precedido de una rampa de la ganancia a 0 (es lo que hoy falta
 * también en diapason y generador-tonos). Hoy no hay ni corte.
 */
test('HALLAZGO — al salir a otra app, rampa de la ganancia a 0 antes de stop()/close()', async ({ page }) => {
  test.fail();
  await reproducir(page);
  const desde = (await llamadas(page)).length;
  await page.locator('a[href*="/generador-tonos/"]').first().click();
  await page.waitForURL(/generador-tonos/);
  await esperarReloj(page, (await reloj(page)) + 0.3);
  const log = (await llamadas(page)).slice(desde);
  const iCorte = log.findIndex((l) => (l.quien === 'osc0' && l.metodo === 'stop') || l.metodo === 'close');
  expect(iCorte, `llamadas tras salir: ${JSON.stringify(log)}`).toBeGreaterThanOrEqual(0);
  const iRampa = log.findIndex(
    (l) =>
      l.quien === 'gain0.gain' &&
      ['linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'setTargetAtTime'].includes(l.metodo) &&
      Number(l.args[0]) <= 1e-3,
  );
  expect(iRampa).toBeGreaterThanOrEqual(0);
  expect(iRampa).toBeLessThan(iCorte);
});

/**
 * HALLAZGO [bajo · SOSPECHA confirmada]. Arranque en escalón: `startOscillator` hace
 * gain.setValueAtTime(volumen/100, t0) y start() sin rampa (page.tsx 113-123), y el efecto de
 * volumen sobre [volume, isPlaying] vuelve a fijar el mismo valor un quantum después.
 * Medido (44,1 kHz): eventos de la ganancia = setValueAtTime(0,5; 0) · start() ·
 * setValueAtTime(0,5; 0,0203); amplitud emitida a los 5/10/20/50 ms del arranque: 0,500 en
 * todos. Con la rampa del patrón reparado (0 → 0,5 en 0,1 s) serían ≈ 0,03 · 0,06 · 0,11 · 0,26.
 */
test('HALLAZGO — Reproducir entra con rampa desde 0, no en escalón', async ({ page }) => {
  test.fail();
  const inicio = await reproducir(page, 0.15);
  const c = await capturar(page);
  const primera = c.x.findIndex((v) => Math.abs(v) > 1e-6);
  expect(primera, 'la captura tiene que empezar en silencio').toBeGreaterThan(0);
  // 5 ms después de la primera muestra, una rampa de 20 ms o más no pasa de 0,5·6,5/20 = 0,16.
  const a5 = amplitudEn(c, primera + Math.round(0.005 * c.sr));
  expect(a5, `amplitud a 5 ms del arranque (t0 = ${inicio} s)`).toBeLessThan(0.2);
  expect(amplitudEn(c, primera + Math.round(0.14 * c.sr)), 'volumen asentado').toBeCloseTo(0.5, 2);
});

/**
 * HALLAZGO [bajo · SOSPECHA confirmada]. El volumen cambia en escalón: el efecto sobre
 * [volume, isPlaying] (page.tsx 173-177) hace gain.setValueAtTime(v, currentTime), sin
 * cancelScheduledValues, sin ancla en el valor en curso y sin rampa.
 * Medido: Inicio en el deslizador con el tono al 50 % → un solo setValueAtTime(0, t); lo
 * emitido baja de 0,45 a 0,05 en 1,0 ms (con una rampa de 50 ms: 40 ms).
 */
test('HALLAZGO — bajar el volumen a 0 con el tono sonando es una rampa, no un escalón', async ({ page }) => {
  test.fail();
  const inicio = await reproducir(page, 0.3);
  const antes = await reloj(page);
  await page.locator(VOLUMEN).press('Home');
  await expect(rotuloVolumen(page)).toHaveText('Volumen: 0%');
  await esperarReloj(page, antes + 0.2);
  const ms = bajada(await capturar(page));
  expect(ms, `ms de 0,45 a 0,05 (arranque en ${inicio} s)`).toBeGreaterThanOrEqual(10);
});

/**
 * HALLAZGO [bajo · SOSPECHA confirmada]. «Detener» corta en seco: `stopOscillator` hace
 * oscillator.stop() sin argumento y desconecta la ganancia y el analizador en el acto
 * (page.tsx 136-148), sin rampa. El mismo camino lo sigue cambiar a la pestaña «Visualizador»
 * con el tono sonando (efecto de page.tsx 246-250).
 * Medido: eventos = stop() (sin argumento), ninguno sobre la ganancia; lo emitido baja de 0,45
 * a 0,05 en 0,5 ms (con la rampa de salida del patrón reparado, ≈ 40-80 ms).
 * Ojo al repararlo: desconectar la ganancia en el acto también corta la rampa.
 */
test('HALLAZGO — Detener baja la ganancia con rampa antes de parar el oscilador', async ({ page }) => {
  test.fail();
  await reproducir(page, 0.3);
  const antes = await reloj(page);
  await botonDetener(page).click();
  await expect(botonReproducir(page)).toBeVisible();
  await esperarReloj(page, antes + 0.25);
  expect(bajada(await capturar(page)), 'ms de 0,45 a 0,05 al pulsar Detener').toBeGreaterThanOrEqual(10);
});

/**
 * HALLAZGO [medio]. El estilo «Línea» del visualizador dibuja, en cada columna, la MEDIA de
 * mínimo y máximo, (min + max)/2 (page.tsx 338): en cualquier audio simétrico eso es ≈ 0, así
 * que pinta una recta en el eje sea cual sea el volumen. Medido con la rampa 0 → 0,8 en 10 s:
 * Espejo 11 · 63 · 115 px de alto en t = 1 · 5 · 9 s; Barras 7 · 39 · 73 px; Línea 1 px en
 * todo el ancho (y = 99-100). Correcto: el trazo refleja la amplitud (al menos la mitad de la
 * banda del Espejo, 32 px, en torno a t = 5 s).
 */
test('HALLAZGO — el estilo «Línea» no es una recta plana para un audio que suena', async ({ page }) => {
  test.fail();
  await cargarAudio(page, 'rampa10s.wav', RAMPA_10S());
  await page.getByRole('button', { name: /Espejo/ }).click();
  await expect.poll(async () => Math.abs((await altoTrazo(page, 400, 400)) - 64)).toBeLessThanOrEqual(3);
  await page.getByRole('button', { name: /Línea/ }).click();
  await expect.poll(() => altoTrazo(page, 380, 420), { timeout: 3000 }).toBeGreaterThanOrEqual(32);
});

/**
 * HALLAZGO [bajo]. Un audio que no se puede decodificar muestra «Error al procesar el archivo de
 * audio», pero `setAudioFile(file)` va ANTES del try (page.tsx 261): la app se queda en la
 * vista de archivo cargado con un lienzo vacío. Medido: «roto.mp3 · 39 B • 0:00», botones
 * «Cambiar archivo» y «Exportar como PNG». Correcto: tras el error, vuelve la zona de carga.
 */
test('HALLAZGO — un audio corrupto no deja la app en la vista de «archivo cargado»', async ({ page }) => {
  test.fail();
  const avisos: string[] = [];
  page.on('dialog', (d) => {
    avisos.push(d.message());
    void d.dismiss();
  });
  await cargarAudio(page, 'roto.mp3', Buffer.from('esto no es un mp3 de verdad, solo texto'), 'audio/mpeg');
  await expect.poll(() => avisos).toEqual(['Error al procesar el archivo de audio']);
  await expect(page.locator('[class*="fileInfo"]')).toHaveCount(0, { timeout: 2000 });
  await expect(page.locator('[class*="dropZone"]')).toBeVisible();
});

/**
 * HALLAZGO [bajo, formato español]. `formatSize` usa toFixed (page.tsx 53-54): punto decimal.
 * 16.044 B / 1.024 = 15,668 → esperado «15,7 KB» · obtenido «15.7 KB».
 */
test('HALLAZGO — el tamaño del archivo va con coma decimal', async ({ page }) => {
  test.fail();
  await cargarAudio(page, 'la440_1s.wav', wav(1, () => 0.8));
  await expect(page.locator('[class*="fileMeta"]')).toHaveText('15,7 KB • 0:01', { timeout: 3000 });
});

/**
 * HALLAZGO [medio, accesibilidad]. La zona de carga del visualizador es un <div onClick> sin
 * tabindex ni rol, y el <input type="file"> va con display:none: con teclado no hay forma de
 * cargar un audio, que es la mitad de la app. Medido: foco en «Visualizador de Audio» + Tab →
 * «Ver Guía Completa» (el siguiente control, ya fuera de la herramienta).
 */
test('HALLAZGO — con teclado se puede elegir un archivo en el visualizador', async ({ page }) => {
  test.fail();
  await page.getByRole('button', { name: /Visualizador de Audio/ }).click();
  await page.getByRole('button', { name: /Visualizador de Audio/ }).focus();
  await page.keyboard.press('Tab');
  const dentro = await page.evaluate(
    () => Boolean(document.activeElement?.closest('[class*="visualizerPanel"]')),
  );
  expect(dentro, 'el siguiente foco tras la pestaña debe estar en la zona de carga').toBe(true);
});

/**
 * HALLAZGO [medio, accesibilidad]. Los dos deslizadores no tienen nombre accesible (ni label,
 * ni aria-label, ni aria-labelledby: el <h3> de encima no está asociado) ni aria-valuetext: un
 * lector anuncia «control deslizante, 440», sin decir de qué ni en qué unidad; tras el preset
 * Do (C4), que suena a 261,63 Hz, anuncia 262 (el range redondea a su step). Los selectores de
 * color («Color onda», «Color fondo») tampoco: su <label> no lleva htmlFor.
 */
test('HALLAZGO — los deslizadores y los selectores de color tienen nombre accesible', async ({ page }) => {
  test.fail();
  await expect(page.getByRole('slider', { name: /Frecuencia/ })).toHaveCount(1, { timeout: 2000 });
  await expect(page.getByRole('slider', { name: /Volumen/ })).toHaveCount(1, { timeout: 2000 });
  await expect(page.getByRole('slider', { name: /Frecuencia/ })).toHaveAttribute('aria-valuetext', /Hz/);
  await cargarAudio(page, 'la440_1s.wav', wav(1, () => 0.8));
  await expect(page.getByLabel('Color onda')).toHaveCount(1, { timeout: 2000 });
});

/**
 * HALLAZGO [bajo, accesibilidad — forma del 1510 de diapason]. El botón principal lleva a la vez
 * aria-pressed={isPlaying} y un nombre que cambia («Reproducir» ↔ «Detener»): el lector anuncia
 * «Detener, conmutador, presionado». Un estado se expone por el nombre O por aria-pressed.
 */
test('HALLAZGO — el botón «Detener» no se anuncia además como conmutador presionado', async ({ page }) => {
  test.fail();
  await reproducir(page, 0.05);
  await expect(botonDetener(page)).not.toHaveAttribute('aria-pressed', 'true', { timeout: 2000 });
});

/**
 * HALLAZGO [bajo, accesibilidad]. `node scripts/check-a11y-jsx.mjs app/generador-ondas/page.tsx`
 * marca 17 emojis junto a texto sin aria-hidden (L781-801, 898-918, 925, 943-964), y los iconos
 * de los botones de onda (〜 ⊓ △ ⩘) entran en su nombre: «〜 Senoidal», «△ Triangular».
 */
test('HALLAZGO — emojis e iconos decorativos ocultos a la ayuda técnica', async ({ page }) => {
  test.fail();
  await expect(page.getByRole('button', { name: 'Senoidal', exact: true })).toHaveCount(1, { timeout: 2000 });
  const titulo = page.locator('h3').filter({ hasText: 'Afinar instrumentos' });
  await expect(titulo.locator('span[aria-hidden="true"]')).toHaveCount(1, { timeout: 2000 });
});

/** Contraste del texto de `selector` contra su fondo real (capas semitransparentes compuestas). */
async function contraste(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    interface C {
      r: number;
      g: number;
      b: number;
      a: number;
    }
    const leer = (s: string): C => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return { r: 0, g: 0, b: 0, a: 0 };
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const mezcla = (a: C, b: C): C => ({
      r: a.r * a.a + b.r * (1 - a.a),
      g: a.g * a.a + b.g * (1 - a.a),
      b: a.b * a.a + b.b * (1 - a.a),
      a: 1,
    });
    const lum = ({ r, g, b }: C): number => {
      const f = (v: number): number => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const el = document.querySelector(sel);
    if (!el) return 0;
    const capas: C[] = [];
    for (let e: Element | null = el; e; e = e.parentElement) {
      const c = leer(getComputedStyle(e).backgroundColor);
      if (c.a > 0) {
        capas.push(c);
        if (c.a === 1) break;
      }
    }
    let fondo: C = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = capas.length - 1; i >= 0; i--) fondo = mezcla(capas[i], fondo);
    const texto = mezcla(leer(getComputedStyle(el).color), fondo);
    const [l1, l2] = [lum(texto), lum(fondo)];
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }, selector);
}

const ONDA_ACTIVA = 'button[aria-pressed="true"] [class*="waveName"]';
const NOTA_ACTIVA = '[class*="noteBtn"][aria-pressed="true"]';
const AVISO_LIENZO = '[class*="canvasPlaceholder"] span';

/**
 * HALLAZGO [bajo, accesibilidad]. Texto de los controles por debajo de 4,5:1 (13,6-15,2 px):
 *   · onda activa («Senoidal», #2E86AB sobre var(--focus)): 3,65:1 en claro, 2,78:1 en oscuro;
 *   · nota activa («La (A4)», blanco sobre #2E86AB): 4,11:1 en los dos temas;
 *   · «Pulsa reproducir para ver la onda» en claro: --text-muted #6E6E6E sobre el lienzo, que es
 *     #0A0A0A en LOS DOS temas: 3,88:1 (en oscuro el token vale #9B9B9B y pasa).
 */
test('HALLAZGO — los controles del generador pasan de 4,5:1 en claro y en oscuro', async ({ page }) => {
  test.fail();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addStyleTag({ content: '*{transition:none !important; animation:none !important}' });
  const claro = {
    onda: await contraste(page, ONDA_ACTIVA),
    nota: await contraste(page, NOTA_ACTIVA),
    aviso: await contraste(page, AVISO_LIENZO),
  };
  await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const oscuro = { onda: await contraste(page, ONDA_ACTIVA), nota: await contraste(page, NOTA_ACTIVA) };
  for (const [clave, ratio] of Object.entries({ ...claro, ondaOscuro: oscuro.onda, notaOscuro: oscuro.nota })) {
    expect(ratio, `${clave}: la medida tiene que existir`).toBeGreaterThan(1);
    expect(ratio, clave).toBeGreaterThanOrEqual(4.5);
  }
});

/**
 * HALLAZGO [medio, accesibilidad]. En tema claro, la nota que se acaba de pulsar se vuelve
 * ILEGIBLE mientras el puntero sigue encima: `.noteBtn:hover` (dos clases) gana a
 * `.noteBtnActive` (una) y le pone de fondo var(--hover) = #F5F5F5, pero el color del texto
 * sigue siendo el blanco de la activa. Medido: clic en «Do (C4)» → blanco sobre #F5F5F5 = 1,08:1.
 * (En oscuro, blanco sobre #333333, se lee.)
 */
test('HALLAZGO — la nota recién pulsada sigue legible con el puntero encima (tema claro)', async ({ page }) => {
  test.fail();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addStyleTag({ content: '*{transition:none !important}' });
  await page.getByRole('button', { name: 'Do (C4)' }).click(); // el puntero se queda encima
  await expect(page.getByRole('button', { name: 'Do (C4)' })).toHaveAttribute('aria-pressed', 'true');
  expect(await contraste(page, NOTA_ACTIVA), 'texto de la nota activa bajo el puntero').toBeGreaterThanOrEqual(4.5);
});

/**
 * HALLAZGO [bajo, accesibilidad]. Bloque educativo en claro: la cabecera de la tabla comparativa
 * es blanco sobre #2E86AB LITERAL (4,11:1; el candado check:contraste-cabeceras solo vigila
 * var(--primary)), y los títulos de escenarios, FAQ y consejos van en #2E86AB sobre blanco
 * (4,11:1) o sobre el degradado de las tarjetas de consejo (3,77:1), a 14,4-16 px.
 */
test('HALLAZGO — la cabecera de la tabla y los títulos del bloque educativo pasan de 4,5:1', async ({ page }) => {
  test.fail();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  expect(await contraste(page, '[class*="comparativaTable"] th'), 'cabecera de tabla').toBeGreaterThanOrEqual(4.5);
  expect(await contraste(page, '[class*="escenarioCard"] h3'), 'título de escenario').toBeGreaterThanOrEqual(4.5);
});

// ------------------------------------------------------------
// Contenido: afirmaciones del bloque educativo que no se sostienen
// ------------------------------------------------------------

/**
 * HALLAZGO [bajo, contenido]. La FAQ de la guitarra dice «Mi6=329,6 Hz»: 329,63 Hz es Mi4
 * (440·2^(−5/12) = 329,628), como dicen el preset «Mi (E4)» y el consejo «Mi4=329,6Hz» de la
 * misma página. Las otras cinco cuerdas sí van en notación científica (Si3, Sol3, Re3, La2, Mi2).
 */
test('HALLAZGO — la 1.ª cuerda de la guitarra es Mi4 = 329,6 Hz, no «Mi6»', async ({ page }) => {
  test.fail();
  expect(440 * 2 ** (-5 / 12)).toBeCloseTo(329.628, 3);
  await expect(page.getByText(/Mi6=329,6 Hz/)).toHaveCount(0, { timeout: 2000 });
});

/**
 * HALLAZGO [bajo, contenido]. «A la misma amplitud de pico, la cuadrada entrega ~1,41 veces más
 * potencia que la senoidal». A pico A: valor eficaz senoidal = A/√2, cuadrada = A; la POTENCIA
 * va con el cuadrado: A² / (A²/2) = 2 (+3,01 dB). 1,41 = √2 es la razón de valores eficaces.
 */
test('HALLAZGO — la cuadrada entrega el doble de potencia que la senoidal, no 1,41 veces', async ({ page }) => {
  test.fail();
  expect(1 / (1 / Math.SQRT2) ** 2).toBeCloseTo(2, 10);
  await expect(page.getByText(/1,41 veces más potencia/)).toHaveCount(0, { timeout: 2000 });
});

/**
 * HALLAZGO [medio, contenido]. El escenario «Testing de altavoces» manda hacer «un barrido de
 * frecuencias (de 20 Hz a 20.000 Hz)» y el consejo «frecuencias extremas», probar 10.000 Hz; la
 * app no barre y su deslizador acaba en 2.000 Hz (End → «Frecuencia: 2000,0 Hz»). Es una
 * función que la app anuncia como uso y no tiene.
 */
test('HALLAZGO — la guía no promete barridos ni frecuencias por encima de los 2.000 Hz del deslizador', async ({
  page,
}) => {
  test.fail();
  await page.locator(FRECUENCIA).press('End');
  await expect(rotuloFrecuencia(page)).toHaveText('Frecuencia: 2000,0 Hz');
  await expect(page.getByText(/barrido de frecuencias \(de 20 Hz a 20\.000 Hz\)/)).toHaveCount(0, { timeout: 2000 });
  await expect(page.getByText(/Prueba 20 Hz .*10\.000 Hz/)).toHaveCount(0, { timeout: 2000 });
});

/**
 * HALLAZGO [bajo, contenido]. Dos «mejores prácticas» describen funciones que la app no tiene:
 *   · «activa pantalla completa antes de exportar para obtener mayor resolución en el PNG»: el
 *     lienzo es 800 × 200 fijo (atributos width/height), y el PNG sale 800 × 200 con la ventana
 *     a 1.920 × 1.080 igual que en móvil;
 *   · «Genera un tono y luego analiza en el visualizador cómo suena mezclado con tu instrumento»:
 *     el visualizador solo abre archivos, no graba, y pasar a su pestaña detiene el tono.
 */
test('HALLAZGO — «pantalla completa» no cambia la resolución del PNG exportado', async ({ page }) => {
  test.fail();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await cargarAudio(page, 'rampa10s.wav', RAMPA_10S());
  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Exportar como PNG/ }).click(),
  ]);
  const ruta = await descarga.path();
  const png = readFileSync(ruta);
  const ancho = png.readUInt32BE(16); // cabecera IHDR
  expect(png.readUInt32BE(20)).toBe(200);
  const promete = await page.getByText(/activa pantalla completa antes de exportar/).count();
  if (promete > 0) expect(ancho, 'el consejo promete más resolución que 800 px').toBeGreaterThan(800);
  await expect(page.getByText(/analiza en el visualizador cómo suena mezclado/)).toHaveCount(0, { timeout: 2000 });
});

/**
 * HALLAZGO [bajo, contenido]. La FAQ dice que el visualizador «muestra la forma de onda en tiempo
 * real usando FFT». Dibuja una imagen ESTÁTICA a partir de las muestras decodificadas
 * (`getChannelData`, page.tsx 288), en el dominio del tiempo: ni tiempo real ni FFT.
 */
test('HALLAZGO — el visualizador no se describe como «en tiempo real usando FFT»', async ({ page }) => {
  test.fail();
  await expect(page.getByText(/muestra la forma de onda en tiempo real usando FFT/)).toHaveCount(0, { timeout: 2000 });
});

/**
 * HALLAZGO [bajo, contenido · neutralidad editorial n.º 1]. «Terapia de sonido»: «Ciertas
 * frecuencias (396 Hz, 528 Hz, 741 Hz) se usan en terapia de sonido» presenta las frecuencias
 * «solfeggio» sin fuente ni matiz de evidencia, y promete «técnicas de binaural beats», que
 * necesitan un tono DISTINTO en cada oído: esta app tiene un solo oscilador, mono.
 */
test('HALLAZGO — la guía no promete binaural beats con un oscilador mono', async ({ page }) => {
  test.fail();
  await expect(page.getByText(/binaural beats/)).toHaveCount(0, { timeout: 2000 });
});

/**
 * HALLAZGO [bajo, contenido]. La tabla comparativa llama «infrasónico» y «No audible, solo
 * vibración» a 20 Hz, que la misma página da como límite inferior de lo audible («percibe de 20 Hz
 * a 20.000 Hz»; «Por debajo de 20 Hz (infrasonidos)») y que es el mínimo del deslizador, rotulado
 * «20 Hz (grave)». Y a 20.000 Hz le atribuye el uso técnico «Ecografías»: la ecografía médica
 * trabaja a 2-18 MHz, cien veces más.
 */
test('HALLAZGO — la tabla no llama «infrasónico» a 20 Hz ni pone ecografías a 20.000 Hz', async ({ page }) => {
  test.fail();
  await expect(page.getByText('20 Hz (infrasónico)')).toHaveCount(0, { timeout: 2000 });
  await expect(page.getByText(/Ecografías/)).toHaveCount(0, { timeout: 2000 });
});
