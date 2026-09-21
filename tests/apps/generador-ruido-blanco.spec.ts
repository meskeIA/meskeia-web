import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Generador de Ruido Blanco, Rosa y Marrón — test de regresión (Inspector, 21/09/2026)
 *
 * 44 usos reales, segmento «interactiva con audio», riesgo 2. Aquí la verdad comprobable NO
 * es un número en pantalla: es la FORMA DEL ESPECTRO que sale de verdad por el grafo de Web
 * Audio. Que el botón exista y diga «Reproducir» no prueba nada, así que los tres casos
 * instrumentan la API (ver `INSTRUMENTAR`): enganchan un AnalyserNode a lo que la app conecta
 * a `destination` y miden sobre el nodo real, no sobre el DOM.
 *
 * QUÉ PROMETE LA APP (de aquí salen los valores esperados de este fichero)
 *   · <h1> «Generador de Ruido Blanco, Rosa y Marrón». Subtítulo: «Cinco tipos de ruido
 *     sintetizados en tu navegador, con temporizador de apagado y fundido de salida».
 *   · Los cinco botones de tipo llevan escrita SU PROPIA pendiente: Blanco «0 dB/octava»,
 *     Rosa «−3 dB/octava», Marrón «−6 dB/octava», Azul «+3 dB/octava», Violeta «+6 dB/octava».
 *   · metadata.ts / JSON-LD: «blanco (espectro plano), rosa (−3 dB por octava), marrón (−6 dB
 *     por octava), azul (+3 dB por octava) y violeta (+6 dB por octava)» y «Síntesis en tiempo
 *     real con Web Audio: no descarga ningún archivo de sonido».
 *   · Bloque educativo: «El ruido rosa corrige justo eso al perder 3 dB por octava […] El
 *     marrón, que desciende 6 dB por octava». Y, sobre el bucle: «no hay descarga previa ni un
 *     bucle reconocible que delate su repetición» (el FAQ del JSON-LD repite la afirmación).
 *   · Ambientes: Oleaje = marrón, tono 45, LFO de 0,09 Hz con profundidad 0,45.
 *
 * CÓMO SE DERIVAN LOS NÚMEROS ESPERADOS — resueltos a mano ANTES de abrir el navegador
 *
 *   1) Frecuencia de corte del filtro de tono. `tonoAFrecuencia(t) = exp(ln240 + (ln20000 −
 *      ln240)·t/100)`, con ln240 = 5,480639 y ln20000 = 9,903487 (diferencia 4,422848).
 *          tono 70 (por defecto) → exp(8,576633) = 5.306,2 Hz
 *          tono 45 (Oleaje)      → exp(7,470921) = 1.756,2 Hz
 *
 *   2) Banda de medida. Se mide entre 250 Hz y 1.000 Hz —dos octavas— y NO más arriba: el
 *      paso bajo por defecto está en 5.306 Hz y a 4.000 Hz ya se come 1,2 dB, que falsearía
 *      la pendiente en 0,6 dB/octava. A 1.000 Hz el mismo filtro (Q 0,7) atenúa
 *      1/((1−Ω²)² + (Ω/Q)²) con Ω = 0,1885 → −0,012 dB: despreciable.
 *
 *   3) Pendientes esperadas en esa banda, leídas del código de `rellenarRuido`:
 *          Blanco  muestras aleatorias, espectro plano ................  0,0 dB/octava
 *          Rosa    filtro de Paul Kellett ............................. −3,0 dB/octava
 *          Azul    derivada del rosa (−3 +6) .......................... +3,0 dB/octava
 *          Violeta derivada del blanco (0 +6) ........................ +6,0 dB/octava
 *          Marrón  integrador con fuga y[n] = (y[n−1] + 0,02·x[n])/1,02
 *      El marrón es el único que NO vale −6 exactos en esta banda, y se puede calcular:
 *      es un polo simple en a = 1/1,02, con |H(ω)| = b/√(1 − 2a·cos ω + a²) y b = 0,02/1,02.
 *      A 44.100 Hz de muestreo: |H(250)| = 0,4860 y |H(1000)| = 0,1365, o sea
 *      20·log₁₀(0,1365/0,4860) = −11,03 dB en dos octavas → −5,51 dB/octava. La asíntota de
 *      −6 solo se alcanza bien por encima del codo del integrador, que está en
 *      ln(1,02)·fs/2π = 139 Hz. Por eso a 250 Hz todavía se queda a medio camino.
 *      La tolerancia es ±1,5 dB/octava sobre la pendiente que la app ANUNCIA, y el margen
 *      real es holgado: en cuatro cargas distintas la peor lectura fue −5,18 (marrón).
 *
 *   4) Caída de nivel del empalme del bucle (HALLAZGO 2). `suavizarBucle` mezcla las primeras
 *      f = 4.096 muestras con las f últimas: datos[i] = datos[i]·t + datos[n−f+i]·(1−t).
 *      Son dos tramos INDEPENDIENTES del mismo ruido, así que sus potencias se suman:
 *      P(t) = t² + (1−t)². Promediada en t ∈ [0,25 · 0,75) —la ventana [1024, 3072) que mide
 *      el test— vale (1/0,5)·∫(2t²−2t+1)dt = 0,5417, es decir 10·log₁₀(0,5417) = −2,66 dB.
 *      Eso es un bache de nivel de 93 ms que se repite CADA 8 SEGUNDOS, porque el buffer dura
 *      8 s y va con `loop = true`.
 *
 *   NINGÚN valor esperado está copiado de lo que devolvió la app.
 *
 * DÓNDE VIVE EL CÁLCULO — no hay motor aparte: `rellenarRuido`, `suavizarBucle` y
 * `tonoAFrecuencia` son funciones de módulo dentro de app/generador-ruido-blanco/page.tsx.
 *
 * ORDEN DEL FICHERO
 *   1. CASOS 1-3: pasan, y son la red de regresión.
 *   2. HALLAZGOS REPARADOS (21/09/2026): iban con `test.fail()`, la convención de estos
 *      ficheros. Afirman lo que la app DEBERÍA hacer, así que hoy fallan a propósito; el día
 *      que se reparen, Playwright avisará de que hay que quitarles la marca.
 *
 * Chromium arranca con `--autoplay-policy=no-user-gesture-required` para que el AudioContext
 * no se quede suspendido en un navegador sin nadie delante. Aun así los casos pulsan el botón
 * con un `click()` de verdad: la política de gesto se comprueba, no se esquiva.
 */

test.use({
  launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
});

const RUTA = '/generador-ruido-blanco/';

/** Foto del grafo vivo, leída de los nodos de Web Audio y no del DOM. */
interface Vivos {
  estadoCtx: AudioContextState | null;
  fuentesVivas: number;
  oscVivos: number;
  /** Frecuencia de cada oscilador de baja frecuencia vivo (el «vaivén» de los ambientes). */
  oscHz: number[];
  /** Frecuencia de corte del filtro de tono, en hercios. */
  filtroHz: number | null;
  /** Ganancia principal de la cadena (el volumen que de verdad se aplica). */
  gananciaValor: number | null;
  /** Amplitud de la modulación del LFO sobre esa ganancia. */
  lfoProfundidad: number | null;
}

/** Medida del artefacto que `suavizarBucle` deja en el punto de empalme del bucle. */
interface Empalme {
  muestras: number;
  duracionSeg: number;
  /** Nivel del centro del fundido cruzado frente al resto del bucle, en dB. */
  caidaDb: number;
  /** Lo mismo medido lejos del empalme: es el cero de referencia de la medida. */
  controlDb: number;
}

interface VentanaRuido {
  __pendiente: (f1: number, f2: number, marcos: number, esperaMs: number) => Promise<number>;
  __rms: () => number | null;
  __vivos: () => Vivos;
  __empalme: () => Empalme | null;
}

/**
 * Envuelve `connect`, `createBufferSource` y `createOscillator`. Se inyecta ANTES de cargar la
 * página (`addInitScript`), así que la app usa las versiones envueltas sin enterarse.
 *
 * La pieza clave es el `connect`: en cuanto la app conecta algo a `context.destination`, el
 * test engancha ahí su propio AnalyserNode. Mide por tanto la señal FINAL —ruido, filtro de
 * tono, volumen y modulación incluidos—, que es justo lo que llegaría al altavoz.
 */
function INSTRUMENTAR(): void {
  interface RegistroNodo {
    iniciado: boolean;
    detenido: boolean;
    nodo: AudioScheduledSourceNode;
  }
  const w = window as unknown as VentanaRuido & {
    __reg: {
      fuentes: RegistroNodo[];
      osciladores: RegistroNodo[];
      buffers: AudioBufferSourceNode[];
      analizador: AnalyserNode | null;
      ctx: BaseAudioContext | null;
      filtro: BiquadFilterNode | null;
      gananciaPrincipal: GainNode | null;
      gananciaLfo: GainNode | null;
    };
  };
  w.__reg = {
    fuentes: [],
    osciladores: [],
    buffers: [],
    analizador: null,
    ctx: null,
    filtro: null,
    gananciaPrincipal: null,
    gananciaLfo: null,
  };

  // La firma de connect() está SOBRECARGADA (a un nodo devuelve el nodo, a un parámetro no
  // devuelve nada), y `Parameters<...>` se queda solo con la última sobrecarga, así que el
  // espía no se puede tipar con ella. Aquí lo único que importa es mirar el destino y
  // reenviar los argumentos intactos, de modo que se tipa como una función suelta y se casa
  // con la firma original en el único punto de asignación.
  const conectarBruto = AudioNode.prototype.connect as unknown as (
    this: AudioNode,
    ...a: unknown[]
  ) => AudioNode & AudioParam;
  const espiarConexion = function (
    this: AudioNode,
    ...args: unknown[]
  ): AudioNode & AudioParam {
    const destino: unknown = args[0];
    const salida = conectarBruto.apply(this, args);
    const ctx = this.context;
    w.__reg.ctx = ctx;
    if (destino === (ctx.destination as unknown)) {
      // 16.384 puntos a 44.100 Hz dan 2,69 Hz por bin: la banda de tercio de octava
      // alrededor de 250 Hz (222,7-280,6 Hz) se promedia sobre 21 bins.
      const analizador = ctx.createAnalyser();
      analizador.fftSize = 16384;
      analizador.smoothingTimeConstant = 0;
      analizador.minDecibels = -200;
      conectarBruto.call(this, analizador);
      w.__reg.analizador = analizador;
      if (this instanceof GainNode) w.__reg.gananciaPrincipal = this;
    } else if (destino instanceof AudioParam && this instanceof GainNode) {
      w.__reg.gananciaLfo = this;
    }
    return salida;
  };
  AudioNode.prototype.connect = espiarConexion as unknown as AudioNode['connect'];

  const envolver = (nodo: AudioScheduledSourceNode, lista: RegistroNodo[]): void => {
    const registro: RegistroNodo = { iniciado: false, detenido: false, nodo };
    lista.push(registro);
    const arrancar = nodo.start.bind(nodo);
    const parar = nodo.stop.bind(nodo);
    nodo.start = (cuando?: number): void => {
      registro.iniciado = true;
      arrancar(cuando);
    };
    nodo.stop = (cuando?: number): void => {
      registro.detenido = true;
      parar(cuando);
    };
  };

  const crearFuente = BaseAudioContext.prototype.createBufferSource;
  BaseAudioContext.prototype.createBufferSource = function (
    this: BaseAudioContext,
  ): AudioBufferSourceNode {
    const nodo = crearFuente.call(this);
    // Cada `reproducir()` empieza creando su fuente: es la señal de que arranca una cadena
    // nueva, así que aquí se olvidan las ganancias de la anterior.
    w.__reg.gananciaPrincipal = null;
    w.__reg.gananciaLfo = null;
    w.__reg.buffers.push(nodo);
    envolver(nodo, w.__reg.fuentes);
    return nodo;
  };

  const crearOsc = BaseAudioContext.prototype.createOscillator;
  BaseAudioContext.prototype.createOscillator = function (this: BaseAudioContext): OscillatorNode {
    const nodo = crearOsc.call(this);
    envolver(nodo, w.__reg.osciladores);
    return nodo;
  };

  const crearFiltro = BaseAudioContext.prototype.createBiquadFilter;
  BaseAudioContext.prototype.createBiquadFilter = function (
    this: BaseAudioContext,
  ): BiquadFilterNode {
    const nodo = crearFiltro.call(this);
    w.__reg.filtro = nodo;
    return nodo;
  };

  /**
   * Pendiente espectral real entre dos frecuencias, en dB por octava.
   *
   * Promedia `marcos` lecturas del analizador en POTENCIA lineal (no en dB: promediar
   * decibelios pondera mal los valles) y compara dos bandas de tercio de octava. Un ruido es
   * una señal aleatoria, así que una sola lectura de FFT baila varios dB; con una docena de
   * marcos y ~20 bins por banda la medida se queda en décimas y el test no parpadea.
   */
  w.__pendiente = async (
    f1: number,
    f2: number,
    marcos: number,
    esperaMs: number,
  ): Promise<number> => {
    const analizador = w.__reg.analizador;
    if (!analizador) throw new Error('No hay analizador: la app no conectó nada a destination.');
    const bins = analizador.frequencyBinCount;
    const lectura = new Float32Array(bins);
    const acumulado = new Float64Array(bins);
    for (let m = 0; m < marcos; m++) {
      await new Promise((listo) => setTimeout(listo, esperaMs));
      analizador.getFloatFrequencyData(lectura);
      for (let i = 0; i < bins; i++) acumulado[i] += Math.pow(10, lectura[i] / 10);
    }
    const anchoBin = analizador.context.sampleRate / analizador.fftSize;
    const nivelBanda = (f: number): number => {
      const inferior = f / Math.pow(2, 1 / 6);
      const superior = f * Math.pow(2, 1 / 6);
      let suma = 0;
      let cuenta = 0;
      for (
        let i = Math.max(1, Math.floor(inferior / anchoBin));
        i <= Math.ceil(superior / anchoBin) && i < bins;
        i++
      ) {
        suma += acumulado[i] / marcos;
        cuenta++;
      }
      return 10 * Math.log10(suma / cuenta);
    };
    return (nivelBanda(f2) - nivelBanda(f1)) / Math.log2(f2 / f1);
  };

  /** Valor eficaz de la señal que sale ahora mismo. Cero exacto = no suena nada. */
  w.__rms = (): number | null => {
    const analizador = w.__reg.analizador;
    if (!analizador) return null;
    const onda = new Float32Array(analizador.fftSize);
    analizador.getFloatTimeDomainData(onda);
    let suma = 0;
    for (let i = 0; i < onda.length; i++) suma += onda[i] * onda[i];
    return Math.sqrt(suma / onda.length);
  };

  w.__vivos = (): Vivos => {
    const r = w.__reg;
    const siguenVivos = (lista: RegistroNodo[]): RegistroNodo[] =>
      lista.filter((x) => x.iniciado && !x.detenido);
    return {
      estadoCtx: r.ctx ? r.ctx.state : null,
      fuentesVivas: siguenVivos(r.fuentes).length,
      oscVivos: siguenVivos(r.osciladores).length,
      oscHz: siguenVivos(r.osciladores).map((x) => (x.nodo as OscillatorNode).frequency.value),
      filtroHz: r.filtro ? r.filtro.frequency.value : null,
      gananciaValor: r.gananciaPrincipal ? r.gananciaPrincipal.gain.value : null,
      lfoProfundidad: r.gananciaLfo ? r.gananciaLfo.gain.value : null,
    };
  };

  w.__empalme = (): Empalme | null => {
    const conBuffer = w.__reg.buffers.filter((b) => b.buffer);
    if (!conBuffer.length) return null;
    const buffer = conBuffer[conBuffer.length - 1].buffer as AudioBuffer;
    const d = buffer.getChannelData(0);
    const n = d.length;
    const rms = (desde: number, hasta: number): number => {
      let s = 0;
      for (let i = desde; i < hasta; i++) s += d[i] * d[i];
      return Math.sqrt(s / (hasta - desde));
    };
    // Nivel de referencia: muchas ventanas repartidas por el interior del bucle.
    let potencia = 0;
    let cuenta = 0;
    for (let a = 20000; a + 2048 < n - 20000; a += 16384) {
      potencia += rms(a, a + 2048) ** 2;
      cuenta++;
    }
    const referencia = Math.sqrt(potencia / cuenta);
    return {
      muestras: n,
      duracionSeg: n / buffer.sampleRate,
      caidaDb: 20 * Math.log10(rms(1024, 3072) / referencia),
      controlDb: 20 * Math.log10(rms(100000, 102048) / referencia),
    };
  };
}

/** Deja la app cargada, instrumentada e HIDRATADA: antes de eso un clic se pierde. */
async function abrir(page: Page): Promise<void> {
  await page.addInitScript(INSTRUMENTAR);
  await page.goto(RUTA, { waitUntil: 'load' });
  await esperarHidratacion(page, ['input[aria-label="Volumen"]']);
}

const vivos = (page: Page): Promise<Vivos> =>
  page.evaluate(() => (window as unknown as VentanaRuido).__vivos());

const rms = (page: Page): Promise<number | null> =>
  page.evaluate(() => (window as unknown as VentanaRuido).__rms());

const botonPlay = (page: Page) => page.getByRole('button', { name: /Reproducir|Detener/ });

/** El renglón de estado del panel: «−3 dB/octava · corte a 5306,00 Hz». */
const lineaEstado = (page: Page) =>
  page.locator('p').filter({ hasText: /dB\/octava · corte a/ }).first();

/**
 * La cuenta atrás del temporizador. Se localiza por su TEXTO y no por `getByRole('alert')`:
 * ese rol casa también con el anunciador de rutas de Next (`#__next-route-announcer__`) y
 * rompería el modo estricto. Aquí además el aviso es `role="status"`, no `alert`.
 */
const cuentaAtras = (page: Page) => page.locator('p').filter({ hasText: /Se apagará en/ });

/** «⏱️ Se apagará en 14:55 · …» → 895. Sirve para comprobar que la cuenta no retrocede. */
function segundosRestantes(texto: string): number {
  const partes = texto.match(/(\d+):(\d\d)/);
  if (!partes) throw new Error(`No hay cuenta atrás legible en «${texto.trim()}».`);
  return Number(partes[1]) * 60 + Number(partes[2]);
}

// ════════════════════════════════════════════════════════════════════════════════════════
// CASO 1 — Las cinco pendientes espectrales que la app anuncia en sus propios botones
// ════════════════════════════════════════════════════════════════════════════════════════

test('CASO 1 · cada tipo de ruido cumple la pendiente espectral que lleva escrita', async ({
  page,
}) => {
  test.setTimeout(150_000);
  await abrir(page);

  // Pendiente ANUNCIADA por la app en cada botón. Entre 250 Hz y 1.000 Hz la física dice que
  // debe medirse eso mismo; solo el marrón cae en −5,5 por el codo de su integrador (139 Hz).
  const TIPOS = [
    { nombre: 'Blanco', anunciada: 0, etiqueta: '0 dB/octava' },
    { nombre: 'Rosa', anunciada: -3, etiqueta: '−3 dB/octava' },
    { nombre: 'Marrón', anunciada: -6, etiqueta: '−6 dB/octava' },
    { nombre: 'Azul', anunciada: 3, etiqueta: '+3 dB/octava' },
    { nombre: 'Violeta', anunciada: 6, etiqueta: '+6 dB/octava' },
  ] as const;

  // ±1,5 dB/octava. En cuatro cargas distintas la peor desviación fue 0,82 (marrón, que en
  // esta banda vale −5,5 por su codo), así que el margen no tapa un error de tipo: confundir
  // rosa con marrón son 3 dB y equivocar el signo, 6.
  const TOLERANCIA = 1.5;

  await botonPlay(page).click();

  for (const tipo of TIPOS) {
    await page.getByRole('button', { name: new RegExp(`^${tipo.nombre}`) }).first().click();
    // La rampa de entrada dura 0,6 s; se espera a que el volumen esté ya estable.
    await page.waitForTimeout(900);

    const estado = await vivos(page);
    expect(estado.estadoCtx, `${tipo.nombre}: el AudioContext debe estar corriendo`).toBe(
      'running',
    );
    expect(estado.fuentesVivas, `${tipo.nombre}: una sola fuente sonando`).toBe(1);

    const pendiente = await page.evaluate(() =>
      (window as unknown as VentanaRuido).__pendiente(250, 1000, 12, 100),
    );

    expect(
      Math.abs(pendiente - tipo.anunciada),
      `Ruido ${tipo.nombre}: el botón anuncia «${tipo.etiqueta}» y el espectro real entre ` +
        `250 y 1.000 Hz mide ${pendiente.toFixed(2)} dB/octava`,
    ).toBeLessThanOrEqual(TOLERANCIA);
  }

  // Y la etiqueta del botón es la misma que se acaba de verificar: si alguien cambia el
  // rótulo sin tocar el motor (o al revés), este caso deja de cuadrar.
  for (const tipo of TIPOS) {
    await expect(
      page.getByRole('button', { name: new RegExp(`^${tipo.nombre}`) }).first(),
    ).toContainText(tipo.etiqueta);
  }
});

// ════════════════════════════════════════════════════════════════════════════════════════
// CASO 2 — Que suene de verdad, que pare de verdad y que no acumule nodos
// ════════════════════════════════════════════════════════════════════════════════════════

test('CASO 2 · arranca con señal real, cambia de tipo en caliente sin acumular y para a cero', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await abrir(page);

  // ── Antes de tocar nada no hay ni AudioContext ──
  expect((await vivos(page)).estadoCtx).toBeNull();
  expect(await rms(page)).toBeNull();

  // ── Arranque con un clic DE VERDAD (la política de autoplay exige el gesto) ──
  const play = botonPlay(page);
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await play.click();
  await page.waitForTimeout(900);

  const arrancado = await vivos(page);
  expect(arrancado.estadoCtx).toBe('running');
  expect(arrancado.fuentesVivas).toBe(1);
  expect(arrancado.oscVivos, 'sin ambiente no hay oscilador de vaivén').toBe(0);
  // Volumen por defecto 25 % sobre un ruido normalizado a 0,85 de pico: el valor eficaz
  // medido ronda 0,034. El umbral 0,005 solo distingue «hay señal» de «hay silencio», que es
  // lo que este caso vigila; el nivel exacto lo comprueba la ganancia del nodo, justo debajo.
  expect(await rms(page), 'debe salir señal, no un array de ceros').toBeGreaterThan(0.005);
  expect(arrancado.gananciaValor as number).toBeCloseTo(0.25, 2);
  // tonoAFrecuencia(70) = exp(5,480639 + 4,422848·0,7) = exp(8,576633) = 5.306,2 Hz.
  // Precisión 0 (±0,5 Hz): vigila que el mando siga siendo LOGARÍTMICO. Uno lineal daría
  // 0,7·20.000 = 14.000 Hz, y un error de redondeo del exponente, decenas de hercios.
  expect(arrancado.filtroHz as number).toBeCloseTo(5306.2, 0);
  await expect(play).toHaveAttribute('aria-pressed', 'true');
  await expect(play).toContainText('Detener');
  await expect(lineaEstado(page)).toContainText('−3 dB/octava');

  // ── Seis cambios de tipo en caliente: cada uno rehace la cadena ──
  // Si `reproducir()` no parase la fuente anterior, aquí habría seis fuentes sonando a la vez
  // y el ruido se iría acumulando hasta saturar.
  for (const nombre of ['Marrón', 'Azul', 'Blanco', 'Violeta', 'Rosa', 'Marrón']) {
    await page.getByRole('button', { name: new RegExp(`^${nombre}`) }).first().click();
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(700);

  const trasCambios = await vivos(page);
  expect(trasCambios.fuentesVivas, 'seis cambios de tipo, UNA sola fuente viva').toBe(1);
  expect(trasCambios.oscVivos).toBe(0);
  expect(await rms(page), 'sigue sonando tras los cambios').toBeGreaterThan(0.005);
  await expect(lineaEstado(page)).toContainText('−6 dB/octava');

  // ── Parar tiene que parar ──
  await play.click();
  // El botón hace un fundido corto de 0,08 s y retira los nodos 60 ms después.
  await page.waitForTimeout(900);

  const parado = await vivos(page);
  expect(parado.fuentesVivas, 'la fuente se detiene').toBe(0);
  expect(parado.oscVivos).toBe(0);
  expect(await rms(page), 'tras detener la señal es CERO, no «casi cero»').toBe(0);
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await expect(play).toContainText('Reproducir');
});

// ════════════════════════════════════════════════════════════════════════════════════════
// CASO 3 — Móvil: ambiente Oleaje, temporizador y volumen
// ════════════════════════════════════════════════════════════════════════════════════════

test.describe('CASO 3 · móvil (Pixel 7)', () => {
  // Enumerado a mano en vez de `...devices['Pixel 7']`: ese descriptor arrastra
  // `defaultBrowserType`, que dentro de un describe obligaría a un worker nuevo.
  test.use({
    viewport: { width: 412, height: 839 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.34 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('el ambiente Oleaje monta su vaivén, bloquea el tono y el temporizador cuenta', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await abrir(page);

    // ── La página cabe en 412 px sin scroll horizontal ──
    const ancho = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(ancho.scroll, 'sin desbordamiento horizontal en móvil').toBeLessThanOrEqual(
      ancho.cliente,
    );

    // ── Oleaje = marrón con el tono fijado en 45 ──
    await page.getByRole('button', { name: /^Oleaje$/ }).click();
    await expect(lineaEstado(page)).toContainText('−6 dB/octava');
    // tonoAFrecuencia(45) = exp(5,480639 + 4,422848·0,45) = exp(7,470921) = 1.756,2 Hz
    await expect(lineaEstado(page)).toContainText(/1\.?756/);
    await expect(page.locator('input[aria-label^="Tono"]')).toBeDisabled();

    // ── Temporizador de 15 min con fundido de 30 s, fijado ANTES de reproducir ──
    // Los rótulos van con regex tolerante al formato: hoy se imprimen «15,00 min» y
    // «30,00 s» (hallazgo 3), y el día que se corrijan este caso debe seguir pasando.
    await page.getByRole('button', { name: /^15(,00)?\s*min$/ }).click();
    await page.getByRole('button', { name: /^30(,00)?\s*s$/ }).click();

    const play = botonPlay(page);
    await play.click();
    await page.waitForTimeout(1200);

    const sonando = await vivos(page);
    expect(sonando.estadoCtx).toBe('running');
    expect(sonando.fuentesVivas).toBe(1);
    // El preset Oleaje declara lfoHz 0,09 y lfoProfundidad 0,45. Precisión de 3 decimales:
    // basta para separarlo de los otros presets (Lluvia 0,25 Hz, Cascada 0,5 Hz) y para
    // detectar que se hubiera quedado en los 440 Hz por omisión de un OscillatorNode.
    expect(sonando.oscVivos, 'Oleaje monta un oscilador de baja frecuencia').toBe(1);
    expect(sonando.oscHz[0]).toBeCloseTo(0.09, 3);
    expect(sonando.filtroHz as number).toBeCloseTo(1756.2, 0);
    // Profundidad = volumen · 0,45 = 0,25 · 0,45 = 0,1125
    expect(sonando.lfoProfundidad as number).toBeCloseTo(0.1125, 3);
    expect(await rms(page)).toBeGreaterThan(0.005);

    // ── La cuenta atrás aparece, es un aviso educado y de verdad descuenta ──
    const cuenta = cuentaAtras(page);
    await expect(cuenta).toHaveAttribute('role', 'status');
    await expect(cuenta).toHaveAttribute('aria-live', 'polite');
    await expect(cuenta).toContainText(/Se apagará en 14:5\d/);
    const primera = segundosRestantes((await cuenta.textContent()) ?? '');
    await page.waitForTimeout(3000);
    const segunda = segundosRestantes((await cuenta.textContent()) ?? '');
    // 3 s de espera con un intervalo de 250 ms: al menos 2 s tienen que haberse descontado.
    expect(primera - segunda, 'a los 3 s la cuenta atrás ha bajado').toBeGreaterThanOrEqual(2);

    // ── Volumen en caliente: lo que se mueve es la ganancia real del grafo ──
    await sembrarValor(page, 'input[aria-label="Volumen"]', '0.6');
    await page.waitForTimeout(600);
    const tras = await vivos(page);
    expect(tras.gananciaValor as number).toBeCloseTo(0.6, 2);
    // La profundidad del vaivén se reescala con el volumen: 0,6 · 0,45 = 0,27
    expect(tras.lfoProfundidad as number).toBeCloseTo(0.27, 2);

    // ── Parar retira también el oscilador del ambiente y la cuenta atrás ──
    await play.click();
    await page.waitForTimeout(900);
    const parado = await vivos(page);
    expect(parado.fuentesVivas).toBe(0);
    expect(parado.oscVivos, 'el vaivén del ambiente también se detiene').toBe(0);
    expect(await rms(page)).toBe(0);
    await expect(cuenta).toHaveCount(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════════════════
// HALLAZGOS REPARADOS (Inspector, 21/09/2026 — reparados el mismo día)
// Afirman lo que la app hace desde la reparación. Hasta entonces iban con `test.fail()`.
// ════════════════════════════════════════════════════════════════════════════════════════

test.describe('hallazgos reparados', () => {
  test('1085 · cambiar de tipo de ruido no reinicia el temporizador de apagado', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await abrir(page);

    await page.getByRole('button', { name: /^15(,00)?\s*min$/ }).click();
    await botonPlay(page).click();

    const cuenta = cuentaAtras(page);
    await expect(cuenta).toContainText(/Se apagará en 14:5\d/);
    await page.waitForTimeout(5000);
    const antesTexto = (await cuenta.textContent()) ?? '';
    const antes = segundosRestantes(antesTexto);

    // El efecto de [tipo, ambiente] vuelve a llamar a `reproducir()`, que hace
    // `pararCuentaAtras()` y monta el intervalo otra vez desde `minutos · 60`.
    await page.getByRole('button', { name: /^Marrón/ }).first().click();
    await page.waitForTimeout(900);
    const despuesTexto = (await cuenta.textContent()) ?? '';
    const despues = segundosRestantes(despuesTexto);

    // Tras cinco segundos la cuenta iba por 14:5x; cambiar de timbre no debería devolverla a
    // 15:00, porque quien programa un apagado para dormir no está pidiendo quince minutos MÁS
    // cada vez que prueba otro ruido.
    expect(
      despues,
      `la cuenta atrás pasó de «${antesTexto.trim()}» a «${despuesTexto.trim()}» al cambiar ` +
        `de tipo de ruido`,
    ).toBeLessThanOrEqual(antes);
  });

  test('1086 · el empalme del bucle no deja un bache de nivel', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await abrir(page);

    await page.getByRole('button', { name: /^Blanco/ }).first().click();
    await botonPlay(page).click();
    await page.waitForTimeout(900);

    const empalme = await page.evaluate(
      () => (window as unknown as VentanaRuido).__empalme() as Empalme,
    );

    // El bucle dura ocho segundos MENOS las muestras de fundido, que ahora se descartan
    // para que el final empalme de verdad con el principio: a 48 kHz son 4.096 muestras,
    // 85 ms. Va con `loop = true`, así que lo que pase en el empalme se repite sin parar.
    expect(empalme.duracionSeg).toBeGreaterThan(7.8);
    expect(empalme.duracionSeg).toBeLessThanOrEqual(8);
    // La ventana de control confirma que la medida tiene el cero donde debe.
    expect(Math.abs(empalme.controlDb), 'la referencia de la medida está a 0 dB').toBeLessThan(
      0.6,
    );
    // Antes `suavizarBucle` sumaba dos tramos INDEPENDIENTES del ruido con pesos t y 1−t,
    // de modo que la potencia caía a t² + (1−t)²: −2,66 dB de media en la ventana
    // [1024, 3072), medidos −2,72 / −2,69 / −2,80 en tres cargas, 93 ms CADA OCHO SEGUNDOS
    // durante toda la sesión. Con pesos sen y cos la suma de cuadrados vale 1 para todo t,
    // que es la condición de potencia constante, y descartando la cola el empalme deja de
    // ser una discontinuidad movida de sitio.
    expect(
      Math.abs(empalme.caidaDb),
      `el centro del fundido cruzado cae ${empalme.caidaDb.toFixed(2)} dB respecto al resto ` +
        `del bucle: con un fundido de potencia constante no debería pasar de medio decibelio`,
    ).toBeLessThan(0.5);
  });

  test('1087 · las cifras enteras no se imprimen con dos decimales', async ({
    page,
  }) => {
    await abrir(page);

    // `formatNumber(x)` sin segundo argumento fija DOS decimales, y aquí se le pasaban
    // enteros —varios ya redondeados con `Math.round()`—: minutos, segundos de fundido,
    // porcentaje de volumen y hercios de corte. Es el mismo defecto que motivó
    // `formatTipoNominal` en lib/formatters.ts (hallazgo 331 del Inspector).
    await expect(
      page.locator('input[aria-label="Volumen"]').locator('xpath=following-sibling::span[1]'),
      'el volumen por defecto es el 25 %',
    ).toHaveText('25 %');
    await expect(page.getByRole('button', { name: /min$/ }).first()).toHaveText('15 min');
    await expect(lineaEstado(page)).toContainText('5306 Hz');
  });

  test('1088 · el emoji del botón principal no entra en su nombre accesible', async ({
    page,
  }) => {
    await abrir(page);

    // El emoji viajaba dentro de una cadena de JavaScript y no como texto JSX, así que el
    // candado `check:a11y-jsx` no podía verlo, pero el lector de pantalla sí: anunciaba
    // «▶️ Reproducir». La regla 3 del CLAUDE.md global §5 pide `<span aria-hidden="true">`
    // para todo emoji junto a texto.
    // Se mide el NOMBRE ACCESIBLE, no `innerText`: este último no respeta aria-hidden,
    // así que seguiría leyendo el emoji aunque el lector de pantalla ya no lo anuncie.
    await expect(botonPlay(page)).toHaveAccessibleName('Reproducir');
    await botonPlay(page).click();
    await expect(botonPlay(page)).toHaveAccessibleName('Detener');
  });
});
