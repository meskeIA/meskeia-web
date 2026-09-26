import { test, expect, devices, type Locator, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Los Números de la Música — test de regresión generado por /inspector el 25/09/2026
 * (primera inspección · 34 usos · segmento «interactiva», riesgo 3).
 *
 * QUÉ PROMETE LA APP (de aquí salen los esperados)
 *   - <h1> «Los Números de la Música» · «Frecuencias, ratios, acordes y ritmo — toda la música es
 *     matemáticas». Cuatro secciones (sonido, escala, acordes, ritmo) con botones «Escuchar» que
 *     tocan tonos, intervalos, acordes, progresiones y ritmos por la Web Audio API.
 *   - Escala: «Cada semitono es exactamente ¹²√2 ≈ 1,0595»; quintas «1,4983 vs 1,5 puro» y terceras
 *     «1,2599 vs 1,25 puro»; tabla «La octava central: frecuencias de cada nota» (Do4 → Do5).
 *   - Intervalos «de Pitágoras» por su razón: la quinta justa suena a 3:2 sobre Do4 = 261,63 Hz.
 *   - Ninguna cifra se teclea: la app no tiene ni un <input>. Lo que se comprueba es lo que ROTULA
 *     y lo que SUENA.
 *
 * CÓMO SE DERIVAN LOS NÚMEROS (a mano, ninguno copiado de la app)
 *   - Temperamento igual con La4 = 440 Hz (ISO 16:1975): f = 440·2^(n/12). Do4 (n = −9) =
 *     261,6256 · Re4 (−7) 293,6648 · Mi4 (−5) 329,6276 · Fa4 (−4) 349,2282 · Sol4 (−2) 391,9954 ·
 *     La4 440 · Si4 (+2) 493,8833 · Do5 (+3) 523,2511. Sin decimales (formatNumber(f, 0)):
 *     262 · 294 · 330 · 349 · 392 · 440 · 494 · 523 Hz.
 *   - ¹²√2 = 1,059463 → «1,0595» · 2^(7/12) = 1,498307 → «1,4983» · 2^(4/12) = 1,259921 → «1,2599».
 *   - Quinta justa sobre Do4: 261,63 · 3/2 = 392,445 Hz. En cents, 1200·log₂(3/2) = 701,955; la
 *     quinta temperada Do4–Sol4 de la propia tabla, 1200·log₂(392/261,63) = 699,99 (≈ 700).
 *     Coma pitagórica: 12 quintas justas − 7 octavas = 1200·log₂(3¹²/2¹⁹) = 23,46 cents.
 *   - Duraciones que la app programa (page.tsx 83-124): progresión de 8 acordes a 0,7 s = 5,6 s
 *     (Canon de Pachelbel); tono de La4: 1,0 s con ganancia 0,3·(0,001/0,3)^(t/1) — a los 0,2 s
 *     vale 0,3·e^(−5,7038·0,2) = 0,096.
 *
 * INSTRUMENTACIÓN
 *   Se envuelve la Web Audio con addInitScript (modelo de generador-ondas y visualizador-sonido-
 *   ondas): cada AudioContext que se crea, cada automatización y asignación de un AudioParam,
 *   start()/stop() con su argumento y cada close(), con el reloj de AUDIO. Todo lo que la app
 *   conecta a `ctx.destination` pasa por un bus con un AnalyserNode (lo que mide es lo que llega
 *   a los altavoces) y, además, cada voz lleva su propio analizador, para ver cómo acaba UNA voz
 *   aunque otra empiece en el mismo instante. Los tiempos se esperan en el reloj de audio con
 *   expect.poll, nunca con esperas de pared.
 *
 * ORDEN: CASOS 1-3 (en verde, red de regresión) · HALLAZGOS del 25/09/2026 (1935-1952),
 * reparados el 26/09/2026: ya sin `test.fail()`, quedan como candado de lo que la app debe hacer.
 */

// Sin gesto de usuario el AudioContext podría quedarse «suspended». A nivel de fichero: dentro
// de un describe Playwright lo rechaza (obliga a un worker nuevo).
test.use({ launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } });

const RUTA = '/visualizador-matematicas-musica/';
const DESTINO = '/visualizador-probabilidad/'; // una de sus RelatedApps, sin audio propio

interface Llamada {
  quien: string;
  metodo: string;
  args: number[];
  /** Reloj de audio (ctx.currentTime) en el instante de la llamada. */
  ct: number;
}

interface VentanaMusica {
  __mmLlamadas: Llamada[];
  __mmContextos: AudioContext[];
  __mmBuses: { ctx: AudioContext; g: GainNode; an: AnalyserNode }[];
  __mmVoces: { id: string; an: AnalyserNode; ctx: AudioContext }[];
}

function INSTRUMENTAR(): void {
  const w = window as unknown as VentanaMusica;
  w.__mmLlamadas = [];
  w.__mmContextos = [];
  w.__mmBuses = [];
  w.__mmVoces = [];
  const Original = window.AudioContext;
  class Contado extends Original {
    constructor(opciones?: AudioContextOptions) {
      super(opciones);
      w.__mmContextos.push(this);
    }
  }
  window.AudioContext = Contado;

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
    return nodo;
  };
  proto.createGain = function (this: BaseAudioContext): GainNode {
    const nodo = crearGan.call(this);
    const id = `gain${nGan++}`;
    dueno.set(nodo, { id, ctx: this });
    dueno.set(nodo.gain, { id: `${id}.gain`, ctx: this });
    return nodo;
  };
  const anotar = (obj: object, metodo: string, args: unknown[]): void => {
    const d = dueno.get(obj);
    if (!d) return;
    w.__mmLlamadas.push({
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
  // La app fija la frecuencia con `osc.frequency.value = f` (page.tsx 50, 68, 93, 114).
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
  const cerrar = Original.prototype.close;
  Original.prototype.close = function (this: AudioContext): Promise<void> {
    w.__mmLlamadas.push({ quien: 'ctx', metodo: 'close', args: [], ct: this.currentTime });
    return cerrar.call(this);
  };
  // Bus por contexto (lo que llega a los altavoces) y analizador por voz. 32.768 muestras =
  // 0,74 s a 44,1 kHz (0,68 s a 48 kHz).
  const nodo = AudioNode.prototype as unknown as { connect: (...a: unknown[]) => unknown };
  const conectar = nodo.connect;
  nodo.connect = function (this: AudioNode, destino: unknown, ...resto: unknown[]): unknown {
    if (destino instanceof AudioDestinationNode) {
      const ctx = this.context as AudioContext;
      let bus = w.__mmBuses.find((b) => b.ctx === ctx);
      if (!bus) {
        const g = crearGan.call(ctx);
        const an = crearAn.call(ctx);
        an.fftSize = 32768;
        an.smoothingTimeConstant = 0;
        conectar.call(g, ctx.destination);
        conectar.call(g, an);
        bus = { ctx, g, an };
        w.__mmBuses.push(bus);
      }
      const voz = crearAn.call(ctx);
      voz.fftSize = 32768;
      conectar.call(this, voz);
      w.__mmVoces.push({ id: dueno.get(this)?.id ?? '?', an: voz, ctx });
      return conectar.call(this, bus.g, ...resto);
    }
    return conectar.call(this, destino, ...resto);
  };
}

async function abrir(page: Page): Promise<void> {
  await page.addInitScript(INSTRUMENTAR);
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Los Números de la Música');
  // La app no tiene inputs que sirvan de testigo: se espera a la hidratación CONFIRMADA de la
  // página entera, que es lo que necesita un clic para no perderse.
  await esperarPaginaAsentada(page);
}

const navegacion = (page: Page): Locator =>
  page.getByRole('navigation', { name: 'Secciones del explicador' });

async function irASeccion(page: Page, nombre: string): Promise<void> {
  const boton = navegacion(page).getByRole('button', { name: nombre });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

const llamadas = (page: Page): Promise<Llamada[]> =>
  page.evaluate(() => (window as unknown as VentanaMusica).__mmLlamadas);

/** Reloj de audio del último contexto que ha sonado. */
const reloj = (page: Page): Promise<number> =>
  page.evaluate(() => (window as unknown as VentanaMusica).__mmBuses.at(-1)?.ctx.currentTime ?? -1);

async function esperarReloj(page: Page, t: number): Promise<void> {
  await expect
    .poll(() => reloj(page), { intervals: [20], timeout: 10000, message: `el reloj de audio nunca llegó a ${t} s` })
    .toBeGreaterThanOrEqual(t);
}

/** Pulsa y espera, en el reloj de AUDIO, a que lo que empezó a sonar lleve `segundos`. */
async function escuchar(page: Page, boton: Locator, segundos: number): Promise<{ inicio: number; desde: number }> {
  const desde = (await llamadas(page)).length;
  await boton.click();
  await expect.poll(async () => (await llamadas(page)).slice(desde).some((l) => l.metodo === 'start')).toBe(true);
  const inicio = (await llamadas(page)).slice(desde).find((l) => l.metodo === 'start')?.ct ?? 0;
  await esperarReloj(page, inicio + segundos);
  return { inicio, desde };
}

const frecuenciasPedidas = (log: Llamada[]): number[] =>
  log.filter((l) => l.quien.endsWith('.frequency') && l.metodo === 'value=').map((l) => l.args[0]);

/** Pico de |x| en los últimos `segundos` del bus del último contexto (máximo 0,68 s). */
const picoBus = (page: Page, segundos = 1): Promise<number> =>
  page.evaluate((s) => {
    const b = (window as unknown as VentanaMusica).__mmBuses.at(-1);
    if (!b) return -1;
    const x = new Float32Array(b.an.fftSize);
    b.an.getFloatTimeDomainData(x);
    const n = Math.min(x.length, Math.round(s * b.ctx.sampleRate));
    let m = 0;
    for (let i = x.length - n; i < x.length; i++) m = Math.max(m, Math.abs(x[i]));
    return m;
  }, segundos);

interface Captura {
  sr: number;
  x: number[];
}

const capturarVoz = (page: Page, id: string): Promise<Captura> =>
  page.evaluate((id) => {
    const v = (window as unknown as VentanaMusica).__mmVoces.find((z) => z.id === id);
    if (!v) return { sr: 0, x: [] };
    const x = new Float32Array(v.an.fftSize);
    v.an.getFloatTimeDomainData(x);
    return { sr: v.ctx.sampleRate, x: Array.from(x) };
  }, id);

/**
 * La mayor CAÍDA de la envolvente en 3 ms, relativa al nivel de los 30 ms anteriores (el mismo
 * medidor que visualizador-sonido-ondas, validado allí: corte en seco 0,889 · rampa lineal de
 * 10 ms 0,274 · de 50 ms 0,090 · sin corte 0,010; umbral 0,45). Envolvente = máximo de |x| en
 * ±1,5 ms (a 440 Hz, 1,3 periodos), en pasos de 0,25 ms. La caída natural de la rampa
 * exponencial del tono en 3 ms es del 1,7 %.
 */
function caidaMaxima3ms(c: Captura): { caida: number; nivel: number } {
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

// ============================================================
// CASO 1 — NORMAL: frecuencias de la octava y la quinta justa
// ============================================================
test('CASO 1 — la octava rotula 440·2^(n/12) y la quinta justa suena a 3:2 (701,96 cents frente a 700)', async ({
  page,
}) => {
  await abrir(page);
  await irASeccion(page, 'La escala musical');

  // 440·2^(n/12), n = −9…+3, sin decimales (ver cabecera).
  await expect(page.locator('[class*="notaBarraFreq"]')).toHaveText([
    '262 Hz',
    '294 Hz',
    '330 Hz',
    '349 Hz',
    '392 Hz',
    '440 Hz',
    '494 Hz',
    '523 Hz',
  ]);
  // ¹²√2 = 1,059463 · 2^(7/12) = 1,498307 · 2^(4/12) = 1,259921, a cuatro decimales y con coma.
  const doce = page.locator('[class*="doceNotasExplicacion"]');
  await expect(doce).toContainText('¹²√2 ≈ 1,0595');
  await expect(doce).toContainText('las quintas (1,4983 vs 1,5 puro)');
  await expect(doce).toContainText('las terceras (1,2599 vs 1,25 puro)');

  // Lo que SUENA: la quinta justa es Do4 y Do4·3/2 = 392,445 Hz, en un contexto que corre.
  const { desde } = await escuchar(page, page.getByRole('button', { name: 'Escuchar Quinta justa' }), 0.25);
  const quinta = frecuenciasPedidas((await llamadas(page)).slice(desde));
  expect(quinta).toHaveLength(2);
  expect(quinta[0]).toBe(261.63);
  expect(quinta[1]).toBeCloseTo(392.445, 6);
  expect(1200 * Math.log2(quinta[1] / quinta[0])).toBeCloseTo(701.955, 2); // quinta justa en cents
  expect(await page.evaluate(() => (window as unknown as VentanaMusica).__mmBuses[0].ctx.state)).toBe('running');
  // Dos senos de 0,2/2 = 0,1 de pico cada uno: la suma no pasa de 0,2 y se oye (> 0,1).
  const pico = await picoBus(page);
  expect(pico).toBeGreaterThan(0.1);
  expect(pico).toBeLessThanOrEqual(0.2005);

  // La quinta TEMPERADA de la tabla: Sol4 = 392,00 Hz sobre Do4 = 261,63 → 699,99 cents.
  const sol = await escuchar(page, page.getByRole('button', { name: 'Escuchar Sol (G4)' }), 0.05);
  const fSol = frecuenciasPedidas((await llamadas(page)).slice(sol.desde));
  expect(fSol).toEqual([392]);
  expect(1200 * Math.log2(392 / 261.63)).toBeCloseTo(699.99, 2);
  // Coma pitagórica: 12 quintas justas − 7 octavas.
  expect(1200 * Math.log2(1.5 ** 12 / 2 ** 7)).toBeCloseTo(23.46, 2);

  // Y la octava de arriba suena a lo que rotula: Do5 = 523,25 Hz.
  const do5 = await escuchar(page, page.getByRole('button', { name: 'Escuchar Do (C5)' }), 0.05);
  expect(frecuenciasPedidas((await llamadas(page)).slice(do5.desde))).toEqual([523.25]);
});

// ============================================================
// CASO 2 — LÍMITE: en un móvil de 360 px
// ============================================================
test.describe('En móvil (360 px)', () => {
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: { width: 360, height: 800 },
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 2 — las cuatro secciones sin scroll horizontal, y el tono grave suena a 110 Hz al tocarlo', async ({ page }) => {
    await abrir(page);
    for (const seccion of ['Qué es el sonido', 'La escala musical', 'Acordes y armonía', 'Ritmo y matemáticas']) {
      await irASeccion(page, seccion);
      const anchos = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        cliente: document.documentElement.clientWidth,
      }));
      expect(anchos.cliente).toBe(360);
      expect(anchos.scroll, seccion).toBeLessThanOrEqual(anchos.cliente);
    }
    await irASeccion(page, 'Qué es el sonido');
    const grave = page.getByRole('button', { name: 'Escuchar Grave (110 Hz)' });
    const desde = (await llamadas(page)).length;
    await grave.tap();
    await expect.poll(async () => frecuenciasPedidas((await llamadas(page)).slice(desde))).toEqual([110]);
  });

  /**
   * HALLAZGO [medio, operativa]. En la tarjeta «Ondas sonoras», cada fila pone 8 px por barra con
   * 3 px de hueco (Aguda: 16 barras = 173 px) más la etiqueta (80 px), la cifra (65 px) y el
   * botón, sin envolver: la fila de 880 Hz desborda la tarjeta, y como <html> y <body> llevan
   * overflow-x: hidden, lo que sobra queda FUERA de la pantalla sin forma de desplazarse.
   * Medido a 360 px: «880 Hz» en x = 334-399 y el botón «Escuchar Aguda (880 Hz)» en x = 415-441;
   * a 412 px (Pixel 7), el botón sigue en 415-441. El tono agudo no se puede tocar en el móvil.
   */
  test('HALLAZGO — el botón «Escuchar Aguda (880 Hz)» y su cifra caben en la pantalla', async ({ page }) => {
    await abrir(page);
    const caja = await page.evaluate(() => {
      const fila = Array.from(document.querySelectorAll('[class*="ondaRow"]')).find((f) =>
        f.textContent?.includes('880'),
      );
      const boton = fila?.querySelector('button')?.getBoundingClientRect();
      const cifra = fila?.querySelector('[class*="ondaFreq"]')?.getBoundingClientRect();
      return { ancho: document.documentElement.clientWidth, boton: boton?.right ?? Infinity, cifra: cifra?.right ?? Infinity };
    });
    expect(caja.cifra, 'borde derecho de «880 Hz»').toBeLessThanOrEqual(caja.ancho);
    expect(caja.boton, 'borde derecho del botón').toBeLessThanOrEqual(caja.ancho);
  });

  /**
   * HALLAZGO [bajo, accesibilidad]. En «La octava central», los nombres de las notas son
   * position:absolute con white-space:nowrap bajo barras de 29 px: a 360 px cada uno pisa al
   * siguiente entre 1,7 y 5,4 px («Do (C4)» acaba en x = 83,0 y «Re (D4)» empieza en 77,9), y se
   * leen «Do (C4Re (D4Mi (E4)…». A 412 px ya no se tocan.
   */
  test('HALLAZGO — los nombres de las notas de la octava no se pisan a 360 px', async ({ page }) => {
    await abrir(page);
    await irASeccion(page, 'La escala musical');
    const solapes = await page
      .locator('[class*="notaBarraNombre"]')
      .evaluateAll((els) => {
        const r = els.map((e) => e.getBoundingClientRect());
        return r.slice(1).map((c, i) => r[i].right - c.left);
      });
    expect(solapes).toHaveLength(7);
    for (const s of solapes) expect(s, 'px que un nombre pisa al siguiente').toBeLessThanOrEqual(0);
  });

  /**
   * REPARACIÓN del 1941 en móvil (26/09/2026): la pista de BPM baja a su propia línea y la regla
   * vive en la misma columna, así que cada marca sigue sobre su tempo (bpm/190 de la pista) y
   * las cinco no se pisan entre sí.
   */
  test('REPARACIÓN — a 360 px la escala de BPM cuadra con las barras y sus marcas no se pisan', async ({ page }) => {
    await abrir(page);
    await irASeccion(page, 'Ritmo y matemáticas');
    const medida = await page.evaluate(() => {
      const pista = document.querySelector('[class*="bpmBarContainer"]')!.getBoundingClientRect();
      const marcas = Array.from(document.querySelectorAll('[class*="bpmEscala"] span')).map((s) => {
        const r = s.getBoundingClientRect();
        return { bpm: Number(s.textContent), izq: r.left, der: r.right, centro: r.left + r.width / 2 };
      });
      return { pista: { left: pista.left, width: pista.width }, marcas };
    });
    expect(medida.marcas.map((m) => m.bpm)).toEqual([60, 90, 120, 150, 180]);
    for (const m of medida.marcas) {
      expect(Math.abs(m.centro - (medida.pista.left + (m.bpm / 190) * medida.pista.width)), `marca ${m.bpm}`).toBeLessThanOrEqual(3);
    }
    for (let i = 1; i < medida.marcas.length; i++) {
      expect(medida.marcas[i].izq, `la marca ${medida.marcas[i].bpm} empieza tras la anterior`).toBeGreaterThan(medida.marcas[i - 1].der);
    }
  });
});

// ============================================================
// CASO 3 — LO QUE NO DEBE OCURRIR
// ============================================================
test('CASO 3 — nada suena sin pulsar, y un sonido nuevo corta la progresión que quedaba programada', async ({ page }) => {
  await abrir(page);
  // Cargar y recorrer las cuatro secciones no crea ningún AudioContext ni oscilador (sin autoplay).
  for (const seccion of ['La escala musical', 'Acordes y armonía', 'Ritmo y matemáticas', 'Qué es el sonido']) {
    await irASeccion(page, seccion);
  }
  expect(await page.evaluate(() => (window as unknown as VentanaMusica).__mmContextos.length)).toBe(0);
  expect(await llamadas(page)).toHaveLength(0);

  // Canon de Pachelbel: 8 acordes × 3 voces = 24 osciladores programados a 0,7 s = 5,6 s.
  await irASeccion(page, 'Acordes y armonía');
  const { inicio } = await escuchar(page, page.getByRole('button', { name: 'Escuchar Canon de Pachelbel' }), 0.3);
  const starts = (await llamadas(page)).filter((l) => l.metodo === 'start');
  expect(starts).toHaveLength(24);
  // Un acorde cada 0,7 s (idx·0,7). Antes la app releía ctx.currentTime en cada vuelta del bucle
  // y, con el contexto recién creado, los acordes derivaban (0 · 0,70 · 1,41 · 2,12…); desde el
  // 26/09/2026 todos cuelgan de un único origen. Se miden los saltos entre acordes, con ±0,03 s.
  const acordes = starts.filter((_, i) => i % 3 === 0).map((l) => l.args[0] - inicio);
  expect(acordes).toHaveLength(8);
  expect(acordes[0]).toBeCloseTo(0, 1);
  for (let k = 1; k < 8; k++) expect(Math.abs(acordes[k] - acordes[k - 1] - 0.7), `salto ${k}`).toBeLessThanOrEqual(0.03);

  // Do Mayor (1,5 s) a mitad de la progresión: los acordes que quedaban NO deben sonar después.
  const acorde = await escuchar(page, page.getByRole('button', { name: 'Escuchar Do Mayor' }), 0.05);
  expect(frecuenciasPedidas((await llamadas(page)).slice(acorde.desde))).toEqual([261.63, 329.63, 392]);
  // El acorde acaba en inicio + 1,5 s; sin el corte, la progresión seguiría hasta ~5,6 s.
  await esperarReloj(page, acorde.inicio + 1.65);
  expect(await picoBus(page, 0.1), 'silencio en los 0,1 s posteriores al acorde').toBeLessThan(1e-3);
});

// ============================================================
// HALLAZGOS del Inspector (25/09/2026), reparados el 26/09/2026
// ============================================================

/**
 * HALLAZGO [medio, operativa] — forma del 1757 de generador-ondas. `useAudio` (page.tsx 23-127)
 * no tiene efecto de limpieza al desmontarse: ni para los osciladores de `activeRef` ni cierra el
 * AudioContext. Las secuencias se programan enteras por adelantado (osc.start(t)/stop(t),
 * page.tsx 98-99 y 120-121), así que al navegar con un <Link> siguen sonando en la app de destino.
 * Medido: Canon de Pachelbel, clic en la tarjeta «Probabilidad» a los 0,5 s → 0 stop() y
 * 0 close() nuevos, contexto «running» y pico ≈ 0,13 en los altavoces a los 1,5 · 2,5 · 3,5 ·
 * 4,5 · 5,5 s de reloj, ya en /visualizador-probabilidad/; silencio solo a los 5,6 s, cuando
 * acaba lo programado. El ritmo «Ambient» (70 BPM, 8 golpes) alarga lo mismo a 6,0 s. La app de
 * destino no tiene forma de pararlo. Correcto: al salir de la página, silencio.
 */
test('HALLAZGO — salir a otra app con la progresión sonando la detiene', async ({ page }) => {
  await abrir(page);
  await irASeccion(page, 'Acordes y armonía');
  await escuchar(page, page.getByRole('button', { name: 'Escuchar Canon de Pachelbel' }), 0.3);
  const salida = await reloj(page);
  await page.locator(`a[href*="${DESTINO}"]`).first().click();
  await page.waitForURL(/visualizador-probabilidad/);
  // Se espera en el reloj de audio a salida + 1,5 s (o a que la app cierre el contexto, que
  // congela su reloj). La ventana del bus (0,68 s) cubre entonces de +0,8 a +1,5 s: dentro de la
  // progresión, que no acaba hasta 5,6 s.
  await expect
    .poll(
      () =>
        page.evaluate(
          (t) => {
            const b = (window as unknown as VentanaMusica).__mmBuses[0];
            return b.ctx.state === 'closed' || b.ctx.currentTime >= t;
          },
          salida + 1.5,
        ),
      { intervals: [20], timeout: 10000 },
    )
    .toBe(true);
  const estado = await page.evaluate(() => (window as unknown as VentanaMusica).__mmBuses[0].ctx.state);
  if (estado !== 'closed') expect(await picoBus(page), 'lo que llega a los altavoces en la app de destino').toBeLessThan(1e-3);
  // Reparado (26/09/2026) con el patrón de conversor-morse y generador-ondas: al desmontar, las
  // voces bajan en rampa y el contexto se cierra al acabarla.
  await expect.poll(() => page.evaluate(() => (window as unknown as VentanaMusica).__mmBuses[0].ctx.state)).toBe('closed');
  expect((await llamadas(page)).filter((l) => l.metodo === 'close')).toHaveLength(1);
});

/**
 * HALLAZGO [bajo, operativa]. Mismo origen: cada visita que suena crea SU AudioContext (vive en un
 * useRef del componente, page.tsx 24-35) y ninguno se cierra. En la navegación de cliente no se
 * recoge: siguen «running», mudos, con su hilo de audio. Medido: sonar La4 y salir, cuatro veces
 * → 4 contextos «running», 0 close(). Correcto: nunca más de uno vivo.
 */
test('HALLAZGO — ir y volver sonando no acumula AudioContext vivos', async ({ page }) => {
  test.setTimeout(60000);
  await abrir(page);
  for (let vuelta = 0; vuelta < 3; vuelta++) {
    if (vuelta > 0) {
      await page.goBack();
      await page.waitForURL(/visualizador-matematicas-musica/);
      await esperarPaginaAsentada(page);
    }
    await escuchar(page, page.getByRole('button', { name: 'Escuchar La4 a 440 Hz' }), 0.1);
    await page.locator(`a[href*="${DESTINO}"]`).first().click();
    await page.waitForURL(/visualizador-probabilidad/);
  }
  const vivos = await page.evaluate(
    () => (window as unknown as VentanaMusica).__mmContextos.filter((c) => c.state !== 'closed').length,
  );
  expect(vivos, 'AudioContext sin cerrar tras tres visitas').toBeLessThanOrEqual(1);
});

/**
 * HALLAZGO [bajo, operativa] — sospecha confirmada. Cada «Escuchar» empieza con stopAll()
 * (page.tsx 37-42), que hace osc.stop() sin argumento y sin bajar antes la ganancia: la voz que
 * sonaba se corta en seco y chasquea. Es el camino más transitado (tocar una nota tras otra).
 * Medido: La4 (1 s, ganancia 0,3) y, a los 0,24-0,27 s, «Grave (110 Hz)» → stop() sin argumento
 * sobre osc0, ninguna automatización nueva de gain0; su voz pasa de ≈ 0,077 a 0 en una muestra
 * (caída en 3 ms del 84-86 % del nivel; umbral 45 %, una rampa de 10 ms daría ≈ 27 %).
 */
test('HALLAZGO — encadenar dos sonidos: el que sonaba sale con rampa, no con stop() en seco', async ({ page }) => {
  await abrir(page);
  await escuchar(page, page.getByRole('button', { name: 'Escuchar La4 a 440 Hz' }), 0.2);
  const segundo = await escuchar(page, page.getByRole('button', { name: 'Escuchar Grave (110 Hz)' }), 0.15);
  const voz = await capturarVoz(page, 'gain0');
  const { caida, nivel } = caidaMaxima3ms(voz);
  const log = (await llamadas(page)).slice(segundo.desde);
  expect(nivel, 'la captura contiene la voz de La4').toBeGreaterThan(0.03);
  expect(caida, `caída de la voz de La4 en 3 ms · llamadas: ${JSON.stringify(log)}`).toBeLessThan(0.45);
});

/**
 * HALLAZGO [medio, dato]. «La octava central: frecuencias de cada nota» pinta cada barra a
 * freq/540 del alto de su columna (140 px), pero en la misma columna vive el botón ▶ y el flex la
 * encoge: La4, Si4 y Do5 salen las TRES a 113,8 px. Esperado: Do4 48,45 % → 67,8 px y Do5
 * 96,90 % → 135,7 px, justo el doble (la octava 2:1 que rotula debajo). Obtenido: 67,8 y 113,8 px
 * (1,68:1), y Si4 (494 Hz) tan alta como La4 (440 Hz). Igual a 1.280, 412 y 360 px.
 */
test('HALLAZGO — en la octava, la barra de Do5 dobla a la de Do4 y La4 < Si4 < Do5', async ({ page }) => {
  await abrir(page);
  await irASeccion(page, 'La escala musical');
  const alturas = await page
    .locator('[class*="notaBarraFill"]')
    .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
  expect(alturas).toHaveLength(8);
  expect(alturas[7] / alturas[0], 'Do5 / Do4').toBeCloseTo(2, 1);
  expect(alturas[6]).toBeGreaterThan(alturas[5]); // Si4 > La4
  expect(alturas[7]).toBeGreaterThan(alturas[6]); // Do5 > Si4
});

/**
 * HALLAZGO [bajo, dato]. «Ondas sonoras: la frecuencia cambia el tono» dibujaba 2, 4 y 8 ciclos para
 * 110, 440 y 880 Hz con el mismo periodo en las tres filas: la proporción 1:2:4 no era la de las
 * frecuencias (1:4:8), y el dibujo no enseñaba lo que dice el subtítulo.
 *
 * Reparado (26/09/2026): cada onda es una senoide SVG dibujada en la MISMA ventana de tiempo,
 * T = 2/110 s = 18,18 ms, así que los ciclos son f·T: 110·T = 2 · 440·T = 8 · 880·T = 16. El caso
 * ya no cuenta barras (la forma antigua): cuenta las crestas del TRAZO que se ve, comprueba que
 * las tres ondas miden lo mismo de ancho (ventana común) y que el rótulo dice la ventana.
 */
test('HALLAZGO — las ondas dibujan ciclos proporcionales a la frecuencia (110 : 440 : 880 = 1 : 4 : 8)', async ({
  page,
}) => {
  await abrir(page);
  const filas = await page.locator('[class*="ondaRow"]').evaluateAll((els) =>
    els.map((f) => {
      const svg = f.querySelector('svg');
      const d = svg?.querySelector('path')?.getAttribute('d') ?? '';
      // Coordenadas y del trazo: una cresta es un mínimo local de y (el eje y del SVG va hacia abajo).
      const ys = Array.from(d.matchAll(/[ML]([\d.]+),([\d.]+)/g)).map((m) => Number(m[2]));
      let crestas = 0;
      for (let i = 1; i < ys.length - 1; i++) if (ys[i] < ys[i - 1] && ys[i] <= ys[i + 1]) crestas++;
      return { crestas, ancho: svg?.getBoundingClientRect().width ?? 0, ciclos: Number(svg?.getAttribute('data-ciclos')) };
    }),
  );
  expect(filas).toHaveLength(3);
  // f·T con T = 2/110 s, calculado a mano: 2, 8 y 16.
  expect(filas.map((f) => f.ciclos)).toEqual([2, 8, 16]);
  expect(filas.map((f) => f.crestas)).toEqual([2, 8, 16]);
  // Misma ventana de tiempo = mismo ancho dibujado.
  expect(Math.abs(filas[0].ancho - filas[2].ancho)).toBeLessThanOrEqual(1);
  expect(filas[0].ancho).toBeGreaterThan(100);
  // 2/110 s = 18,18 ms → «18,2 milisegundos».
  await expect(page.locator('[class*="ondasSubtitulo"]')).toContainText('18,2 milisegundos');
});

/**
 * HALLAZGO [bajo, dato]. «BPM por género musical»: las barras se colocan en su pista a
 * left = min/190 (page.tsx 653), pero la escala 60 · 90 · 120 · 150 · 180 va con
 * justify-content: space-between a lo ancho de TODA la rejilla, columna de géneros incluida.
 * Medido a 1.280 px: «60» centrado en x = 245 y los 60 BPM de las barras en x = 545; «120» en 634
 * frente a 742; «180» en 1.032 frente a 940. Leída con su escala, «Ambient 60-80» cae entre 100 y
 * 115 BPM.
 */
test('HALLAZGO — la escala de BPM está alineada con las barras', async ({ page }) => {
  await abrir(page);
  await irASeccion(page, 'Ritmo y matemáticas');
  const desvios = await page.evaluate(() => {
    const pista = document.querySelector('[class*="bpmBarContainer"]')!.getBoundingClientRect();
    return Array.from(document.querySelectorAll('[class*="bpmEscala"] span')).map((s) => {
      const r = s.getBoundingClientRect();
      const bpm = Number(s.textContent);
      return Math.abs(r.left + r.width / 2 - (pista.left + (bpm / 190) * pista.width));
    });
  });
  expect(desvios).toHaveLength(5);
  for (const d of desvios) expect(d, 'px entre la marca y su BPM en la pista').toBeLessThanOrEqual(10);
});

/**
 * HALLAZGO [bajo, dato]. La tabla de la octava pone bajo cada frecuencia TEMPERADA la razón
 * JUSTA, sin «≈»: «La (A4) · 440 Hz · 5:3», pero 261,63·5/3 = 436,05 Hz y 440/261,63 = 1,6818
 * (900 cents frente a 884,36: 15,6 cents); «Mi (E4) · 330 Hz · 5:4» (327,04 Hz; 13,7 cents);
 * «Si (B4) · 494 Hz · 15:8» (490,56 Hz; 11,7 cents). La propia sección explica dos tarjetas más
 * arriba que el temperamento igual NO da esas razones.
 */
test('HALLAZGO — la octava no rotula 5:3 bajo La4 = 440 Hz como si fuera exacto', async ({ page }) => {
  await abrir(page);
  await irASeccion(page, 'La escala musical');
  // Reparado (26/09/2026): la razón justa se rotula exacta solo si la nota temperada la da (a
  // menos de 0,5 cents). A mano, temperada menos justa en cents: Re 199,9 − 203,9 = −4,0 ·
  // Mi 400,0 − 386,3 = 13,7 · Fa 500,0 − 498,0 = 1,9 · Sol 700,0 − 702,0 = −2,0 · La 900,0 − 884,4 = 15,6 ·
  // Si 1100,0 − 1088,3 = 11,7; Do4 1:1 y Do5 2:1, 0,0.
  await expect(page.locator('[class*="notaBarraRatio"]')).toHaveText([
    '1:1',
    '≈ 9:8',
    '≈ 5:4',
    '≈ 4:3',
    '≈ 3:2',
    '≈ 5:3',
    '≈ 15:8',
    '2:1',
  ]);
  // El desvío de La4 que da el título, con el Do4 = 261,63 que rotula la tabla:
  // 1200·log₂(440/261,63) − 1200·log₂(5/3) = 899,96 − 884,36 = 15,60 → «15,6».
  const la = page.locator('[class*="notaBarraRatio"]').nth(5);
  await expect(la).toHaveAttribute('title', /15,6 cents/);
});

/**
 * REPARACIÓN (26/09/2026, sin hallazgo propio). Los intervalos «justos» sonaban con la razón
 * truncada: cuarta 1,333 (en vez de 4/3: −0,43 cents), sexta 1,667 y tritono 1,406. Y la
 * clasificación ponía la sexta mayor (consonancia imperfecta, como las terceras) junto a la
 * segunda mayor (disonancia). A mano sobre Do4 = 261,63: cuarta 348,84 · sexta 436,05 ·
 * tritono 367,917 Hz.
 */
test('REPARACIÓN — los intervalos suenan con su razón exacta y se clasifican como en la teoría tradicional', async ({ page }) => {
  await abrir(page);
  await irASeccion(page, 'La escala musical');
  for (const [nombre, esperado] of [
    ['Cuarta justa', 348.84],
    ['Sexta mayor', 436.05],
    ['Tritono', 367.917],
  ] as const) {
    const { desde } = await escuchar(page, page.getByRole('button', { name: `Escuchar ${nombre}` }), 0.02);
    const f = frecuenciasPedidas((await llamadas(page)).slice(desde));
    expect(f[0]).toBe(261.63);
    expect(f[1], nombre).toBeCloseTo(esperado, 2);
  }
  const fila = (n: string): Locator => page.locator('[class*="intervaloRow"]').filter({ hasText: n });
  await expect(fila('Sexta mayor').locator('[class*="consonanciaTag"]')).toHaveText('Consonancia imperfecta');
  await expect(fila('Segunda mayor').locator('[class*="consonanciaTag"]')).toHaveText('Disonancia suave');
  await expect(fila('Tritono').locator('[class*="consonanciaTag"]')).toHaveText('Disonancia');
});

/** Contraste del texto de `selector` contra su fondo real; con degradado, el PEOR extremo. */
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
    // Cada capa es una lista de colores posibles (uno si es liso, los extremos si es degradado).
    const capas: C[][] = [];
    for (let e: Element | null = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage.includes('gradient')) {
        const cols = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) ?? []).map(leer);
        capas.push([cols[0], cols[cols.length - 1]]);
        if (cols.every((c) => c.a === 1)) break;
        continue;
      }
      const c = leer(cs.backgroundColor);
      if (c.a > 0) {
        capas.push([c]);
        if (c.a === 1) break;
      }
    }
    let peor = Infinity;
    const recorrer = (i: number, fondo: C): void => {
      if (i < 0) {
        const texto = mezcla(leer(getComputedStyle(el).color), fondo);
        const [l1, l2] = [lum(texto), lum(fondo)];
        peor = Math.min(peor, (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
        return;
      }
      for (const c of capas[i]) recorrer(i - 1, mezcla(c, fondo));
    };
    recorrer(capas.length - 1, { r: 255, g: 255, b: 255, a: 1 });
    return peor;
  }, selector);
}

/**
 * HALLAZGO [bajo, accesibilidad]. Texto pequeño (10,9-17,6 px, ninguno «grande») por debajo de
 * 4,5:1. `.container` fija --primary: #2E86AB sin variante oscura, y hay colores literales.
 * Medido en claro: sección activa y botones «Escuchar» (blanco sobre #2E86AB) 4,11 · cifras de
 * las ondas y grados de las progresiones 4,11 · razones de los intervalos 3,77 · etiquetas de
 * consonancia 2,32-3,28 · números de los pasos 4,11 · «Mayor»/«Menor» 3,56/4,01 · obra y dato de
 * Fibonacci 3,77 · «Hz» del dato destacado 2,44 · «Audible» sobre el degradado 2,80 · números de
 * Fibonacci (blanco sobre el degradado) 2,80. En oscuro: cifras de las ondas 3,50 · razones 3,08 ·
 * consonancia 2,72-3,77 · «Mayor»/«Menor» 3,06/2,73 · grados 3,50 · Fibonacci 3,08.
 */
test('HALLAZGO — el texto en color de marca y el de las etiquetas pasa de 4,5:1 en claro y en oscuro', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await abrir(page);
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
  const POR_SECCION: Record<string, Record<string, string>> = {
    'Qué es el sonido': {
      'sección activa': '[class*="navActivo"] [class*="navTexto"]',
      // El grande, con el texto «Escuchar» (los pequeños solo llevan ▶, que es gráfico: 3:1).
      'botón Escuchar': 'button[class*="playBtn"]:not([class*="playBtnSmall"])',
      'cifra de la onda': '[class*="ondaFreq"]',
      '«Audible»': '[class*="rangoAudible"] [class*="rangoLabel"]',
      '«Hz» del dato destacado': '[class*="datoUnidad"]',
    },
    'La escala musical': {
      'razón del intervalo': '[class*="intervaloRatio"]',
      '«Consonancia imperfecta»': '[class*="consonancia_alta"]',
      '«Disonancia suave»': '[class*="consonancia_media"]',
      '«Disonancia»': '[class*="consonancia_baja"]',
      'número del paso': '[class*="pasoNumero"]',
    },
    'Acordes y armonía': {
      '«Mayor»': '[class*="tipoMayor"]',
      '«Menor»': '[class*="tipoMenor"]',
      'grados de la progresión': '[class*="progresionGrados"]',
    },
    'Ritmo y matemáticas': {
      'dato de Fibonacci': '[class*="fibonacciDato"]',
      'número de Fibonacci': '[class*="fibonacciNumeros"] > span',
    },
  };
  const medidas: Record<string, number> = {};
  for (const tema of ['claro', 'oscuro']) {
    if (tema === 'oscuro') {
      await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    }
    for (const [seccion, sels] of Object.entries(POR_SECCION)) {
      await irASeccion(page, seccion);
      for (const [nombre, sel] of Object.entries(sels)) medidas[`${nombre} (${tema})`] = await contraste(page, sel);
    }
  }
  for (const [donde, ratio] of Object.entries(medidas)) {
    expect(ratio, `${donde}: la medida tiene que existir`).toBeGreaterThan(1);
    expect(ratio, donde).toBeGreaterThanOrEqual(4.5);
  }
});

/**
 * HALLAZGO [bajo, accesibilidad]. La sección entera va dentro de <div aria-live="polite"
 * aria-atomic="true"> (page.tsx 787-789): cada cambio de pestaña hace que el lector de pantalla
 * lea TODA la sección nueva de un tirón, sin poder navegarla. Medido: 1.207 caracteres
 * («Qué es el sonido»), 1.657 («La escala musical»), 2.047 («Acordes y armonía») y 2.038
 * («Ritmo y matemáticas»). Basta con anunciar el título (aria-pressed ya dice cuál está activa).
 */
test('HALLAZGO — cambiar de sección no anuncia la sección entera por una región viva atómica', async ({ page }) => {
  await abrir(page);
  await irASeccion(page, 'Acordes y armonía');
  const anunciado = await page.evaluate(() =>
    Math.max(0, ...Array.from(document.querySelectorAll('[aria-live][aria-atomic="true"]')).map((r) => r.textContent?.length ?? 0)),
  );
  expect(anunciado, 'caracteres de la región viva atómica').toBeLessThan(200);
  // Y lo que se anuncia es el título de la sección nueva (la región viva envuelve solo la cabecera).
  await expect(page.locator('[aria-live="polite"][aria-atomic="true"]').filter({ hasText: 'Acordes y armonía' })).toHaveCount(1);
});

// ------------------------------------------------------------
// Contenido: afirmaciones que no se sostienen
// ------------------------------------------------------------

/**
 * HALLAZGO [medio, contenido]. «¿Universal o cultural?» (Acordes): «Estudios con tribus aisladas
 * muestran preferencia natural por consonancias simples». El estudio de referencia dice lo
 * contrario: los tsimane' de la Amazonía boliviana puntuaron IGUAL de agradables los acordes
 * consonantes y los disonantes (McDermott, Schultz, Undurraga y Godoy, Nature 535:547-550, 2016,
 * «Indifference to dissonance in native Amazonians…»); la preferencia crece con la exposición a
 * la música occidental.
 */
test('HALLAZGO — no se afirma una «preferencia natural» por la consonancia en pueblos aislados', async ({ page }) => {
  await abrir(page);
  await irASeccion(page, 'Acordes y armonía');
  await expect(page.getByText(/preferencia natural por consonancias/)).toHaveCount(0, { timeout: 1000 });
});

/**
 * HALLAZGO [bajo, contenido]. El dato destacado dice que La4 = 440 Hz es «el estándar de
 * afinación universal desde 1955. Todos los instrumentos del mundo se afinan a partir de esta
 * frecuencia», y el FAQ del JSON-LD de la misma página, que fue «adoptado como estándar
 * internacional en 1939 por la ISO» (la ISO se fundó en 1947: 1939 fue la conferencia de Londres
 * y 1955 la ISO/R 16). Y no todos: muchas orquestas afinan a 442-443 Hz y la música barroca a
 * 415, como dice el propio FAQ.
 */
test('HALLAZGO — el año del La 440 no se contradice y no se dice que afinen así «todos los instrumentos»', async ({
  page,
}) => {
  await abrir(page);
  await expect(page.getByText(/Todos los instrumentos del mundo se afinan/)).toHaveCount(0, { timeout: 1000 });
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(jsonLd.join('\n')).not.toContain('1939 por la ISO');
});

/**
 * HALLAZGO [bajo, contenido · neutralidad editorial n.º 3]. Bloque educativo: «Bach fue uno de sus
 * mayores defensores [del temperamento igual], componiendo El clave bien temperado para demostrar
 * que se podía tocar en las 24 tonalidades»; y la escala: «En el siglo XVIII se decidió dividir la
 * octava en 12 partes iguales». «Bien temperado» no es «igual»: El clave se escribió para un
 * temperamento (desigual) que permite las 24 tonalidades, y cuál usaba Bach sigue discutido; el
 * temperamento igual no se generaliza en los teclados hasta el siglo XIX.
 */
test('HALLAZGO — no se presenta a Bach como defensor del temperamento igual', async ({ page }) => {
  await abrir(page);
  await expect(page.getByText(/Bach fue uno de sus mayores defensores/)).toHaveCount(0, { timeout: 1000 });
});

/**
 * HALLAZGO [bajo, contenido · neutralidad editorial n.º 3]. «Lo que la ciencia ha confirmado es
 * que estudiar música mejora habilidades matemáticas, espaciales y de lenguaje». Los metaanálisis
 * de Sala y Gobet (Educational Research Review 20, 2017; Memory & Cognition 48, 2020) hallan que
 * esa transferencia es pequeña y desaparece en los estudios con grupo de control activo y buen
 * diseño.
 */
test('HALLAZGO — la transferencia de la música a las matemáticas no se da por «confirmada»', async ({ page }) => {
  await abrir(page);
  await expect(page.getByText(/la ciencia ha confirmado es que/)).toHaveCount(0, { timeout: 1000 });
});

/**
 * HALLAZGO [bajo, contenido · neutralidad editorial n.º 1 y 3]. «La proporción áurea en la
 * música»: Bartók, «el primer movimiento tiene 89 compases (F11) … La proporción áurea divide la
 * pieza exactamente». La partitura tiene 88; el compás 89 es el de silencio que añadió Lendvai en
 * su análisis, que Howat y otros discuten. Mozart: «se acercan notablemente a φ», cuando el
 * estudio de Putz (Mathematics Magazine 68(4), 1995) concluye que no hay indicio de que lo
 * buscara. El subtítulo lo presenta como hecho («aparecen en la estructura de obras maestras»).
 */
test('HALLAZGO — Bartók: la partitura no tiene 89 compases ni la proporción áurea la divide «exactamente»', async ({
  page,
}) => {
  await abrir(page);
  await irASeccion(page, 'Ritmo y matemáticas');
  await expect(page.getByText(/89 compases/)).toHaveCount(0, { timeout: 1000 });
  await expect(page.getByText(/divide la pieza exactamente/)).toHaveCount(0, { timeout: 1000 });
});

/**
 * HALLAZGO [bajo, dato]. Compases: el ejemplo del 7/8 «asimétrico» es «Money (Pink Floyd)», que
 * está en 7/4 (salvo el solo de guitarra, en 4/4).
 */
test('HALLAZGO — «Money» de Pink Floyd no es el ejemplo del 7/8 (está en 7/4)', async ({ page }) => {
  await abrir(page);
  await irASeccion(page, 'Ritmo y matemáticas');
  const fila = page.locator('[class*="compasItem"]').filter({ hasText: '7/8' });
  await expect(fila).not.toContainText('Money (Pink Floyd)', { timeout: 1000 });
});

/**
 * HALLAZGO [bajo, contenido · formato español]. Con cuatro cifras enteras no se agrupa (Ortografía
 * de la RAE, 2010; lo mismo hace Intl en es-ES): «Piano: 27,5 Hz (La0) → 4.186 Hz (Do8)», «Voz
 * humana: 80 - 1.100 Hz» y «Hace 2.500 años, Pitágoras…» deberían ser 4186, 1100 y 2500
 * («20.000 Hz», de cinco cifras, sí va agrupado).
 */
test('HALLAZGO — las cifras de cuatro dígitos no se agrupan', async ({ page }) => {
  await abrir(page);
  const textos: string[] = [];
  for (const seccion of ['Qué es el sonido', 'La escala musical']) {
    await irASeccion(page, seccion);
    textos.push(await page.locator('[class*="seccionContent"]').innerText());
  }
  const agrupadas = textos.join('\n').match(/(?<![\d.,])\d\.\d{3}(?!\d|[.,]\d)[^\n]{0,8}/g) ?? [];
  expect(agrupadas).toEqual([]);
});
