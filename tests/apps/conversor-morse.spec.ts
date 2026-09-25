import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Conversor de Código Morse — test de regresión generado por /inspector el 25/09/2026
 * (primera inspección · 12 usos · segmento «interactiva», riesgo 2).
 *
 * QUÉ PROMETE LA APP (de aquí salen los esperados):
 *   - <h1> «Conversor de Código Morse»: «Traduce texto a código Morse y viceversa con
 *     reproducción de sonido». La metadata añade «Alfabeto Morse Internacional ITU-R M.1677
 *     completo con letras, números y signos» y «Reproducción de sonido … a 600 Hz».
 *   - Su propia tarjeta «Tiempos»: «Un punto dura 1 unidad, una raya 3 unidades. Entre
 *     símbolos 1 unidad, entre letras 3 unidades, entre palabras 7 unidades».
 *
 * FUENTE DE LOS ESPERADOS: Recomendación UIT-R M.1677-1 (10/2009), «International Morse code»,
 * Anexo 1, Parte I (texto descargado de itu.int y leído el 25/09/2026):
 *   §1.1.1 letras a–z y la «accented e» = ..-.. (la ÚNICA letra acentuada; no hay Ñ)
 *   §1.1.2 cifras: 0 = -----, 5 = .....
 *   §1.1.3 signos: . = .-.-.- · , = --..-- · ? = ..--.. · @ = .--.-. (y :, ', -, /, (, ), ",
 *          =, +, ×). NO están: ! & ; _ $ (son extensiones de radioaficionado, no UIT).
 *   §2 raya = 3 puntos · hueco dentro de la letra = 1 · entre letras = 3 · entre palabras = 7.
 *   §3.3 el % se transmite como 0/0.
 * La app escribe las palabras separadas por « / » (lo dice su FAQ y su placeholder).
 *
 * CÓMO SE DERIVAN LOS NÚMEROS (a mano, ninguno copiado de la app)
 *   - «SOS» = S O S = «... --- ...».
 *   - «Hola mundo» → H .... · O --- · L .-.. · A .- · / · M -- · U ..- · N -. · D -.. · O ---.
 *   - Audio: la unidad de la app es un punto de 100 ms (page.tsx:95) = 12 PPM en la norma
 *     PARIS (unidad = 1200/PPM ms → 1200/100 = 12). La app no declara PPM.
 *     «SOS E» = ... --- ... / . → 10 tonos: 1 1 1 3 3 3 1 1 1 1 unidades; huecos: 1 dentro de
 *     cada letra, 3 entre letras (S-O, O-S), 7 entre palabras (S-E).
 *
 * INSTRUMENTACIÓN
 *   addInitScript envuelve window.AudioContext (cuenta contextos creados y close()), anota cada
 *   start()/stop() de un OscillatorNode con el reloj de AUDIO (ctx.currentTime) y la ruta en la
 *   que arrancó, y hace pasar lo que la app conecta a `ctx.destination` por un bus con un
 *   AnalyserNode: lo que mide ese bus es lo que llega a los altavoces. Los tiempos se leen de ese
 *   reloj y se esperan con expect.poll, no con esperas de pared.
 *
 * ORDEN: CASOS 1-3 (red de regresión, en verde) · HALLAZGOS con `test.fail()` (abiertos: el
 * fichero pasa en verde hoy y avisa cuando se reparen).
 */

// Sin usuario delante el AudioContext puede quedarse «suspended». Va al nivel del fichero:
// un launchOptions dentro de un describe obliga a un worker nuevo y Playwright lo rechaza.
test.use({ launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } });

const RUTA = '/conversor-morse/';
/** Un punto de la app, en segundos (page.tsx:95). */
const U = 0.1;

interface Tono {
  ctx: number;
  ini: number;
  fin: number | null;
  ruta: string;
}

interface VentanaMorse {
  __morse: {
    ctx: AudioContext[];
    cerrados: number;
    tonos: Tono[];
    buses: { ctx: BaseAudioContext; an: AnalyserNode }[];
  };
}

function INSTRUMENTAR(): void {
  const w = window as unknown as VentanaMorse & { AudioContext: typeof AudioContext };
  const m: VentanaMorse['__morse'] = { ctx: [], cerrados: 0, tonos: [], buses: [] };
  w.__morse = m;
  const Original = w.AudioContext;
  class Contado extends Original {
    constructor(opciones?: AudioContextOptions) {
      super(opciones);
      m.ctx.push(this);
    }
    close(): Promise<void> {
      m.cerrados++;
      return super.close();
    }
  }
  w.AudioContext = Contado;

  const osc = OscillatorNode.prototype;
  const arrancar = osc.start;
  const parar = osc.stop;
  const registro = new WeakMap<OscillatorNode, Tono>();
  osc.start = function (this: OscillatorNode, cuando?: number): void {
    const t: Tono = {
      ctx: m.ctx.indexOf(this.context as AudioContext),
      ini: cuando ?? this.context.currentTime,
      fin: null,
      ruta: location.pathname,
    };
    registro.set(this, t);
    m.tonos.push(t);
    return arrancar.call(this, cuando);
  };
  osc.stop = function (this: OscillatorNode, cuando?: number): void {
    const t = registro.get(this);
    if (t) t.fin = cuando ?? this.context.currentTime;
    return parar.call(this, cuando);
  };

  // El bus: 32.768 muestras = 0,68 s a 48 kHz (0,74 s a 44,1 kHz) de lo que llega a los altavoces.
  const crearGan = BaseAudioContext.prototype.createGain;
  const crearAn = BaseAudioContext.prototype.createAnalyser;
  const nodo = AudioNode.prototype as unknown as { connect: (...a: unknown[]) => unknown };
  const conectar = nodo.connect;
  nodo.connect = function (this: AudioNode, destino: unknown, ...resto: unknown[]): unknown {
    if (destino instanceof AudioDestinationNode) {
      const ctx = this.context;
      let bus = m.buses.find((b) => b.ctx === ctx);
      if (!bus) {
        const g = crearGan.call(ctx);
        const an = crearAn.call(ctx);
        an.fftSize = 32768;
        conectar.call(g, ctx.destination);
        conectar.call(g, an);
        bus = { ctx, an };
        (bus as unknown as { g: GainNode }).g = g;
        m.buses.push(bus);
      }
      return conectar.call(this, (bus as unknown as { g: GainNode }).g, ...resto);
    }
    return conectar.call(this, destino, ...resto);
  };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(INSTRUMENTAR);
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Conversor de Código Morse');
  await esperarHidratacion(page, ['textarea']);
});

// ---------- utilidades ----------

const salida = (page: Page) => page.locator('[class*="outputBox"]');
const botonReproducir = (page: Page) => page.getByRole('button', { name: /Reproducir sonido/ });
const botonDetener = (page: Page) => page.getByRole('button', { name: /Detener/ });

async function escribir(page: Page, texto: string): Promise<void> {
  await page.locator('textarea').fill(texto);
  await esperarValorEnReact(page, 'textarea', texto);
}

async function convertir(page: Page, texto: string): Promise<string> {
  await escribir(page, texto);
  await page.getByRole('button', { name: 'Convertir', exact: true }).click();
  await expect(salida(page)).not.toHaveText('El resultado aparecerá aquí...');
  return (await salida(page).textContent()) ?? '';
}

const tonos = (page: Page): Promise<Tono[]> =>
  page.evaluate(() => (window as unknown as VentanaMorse).__morse.tonos.map((t) => ({ ...t })));

/** Reloj de audio del último contexto creado (-1 si no hay ninguno). */
const reloj = (page: Page): Promise<number> =>
  page.evaluate(() => (window as unknown as VentanaMorse).__morse.ctx.at(-1)?.currentTime ?? -1);

interface EstadoContextos {
  creados: number;
  cerrados: number;
  abiertos: number;
}
const contextos = (page: Page): Promise<EstadoContextos> =>
  page.evaluate(() => {
    const m = (window as unknown as VentanaMorse).__morse;
    return { creados: m.ctx.length, cerrados: m.cerrados, abiertos: m.ctx.filter((c) => c.state !== 'closed').length };
  });

/** Duración de cada tono en unidades de 100 ms. */
const duraciones = (ts: Tono[]): number[] => ts.map((t) => ((t.fin ?? t.ini) - t.ini) / U);
/** Silencio entre un tono y el siguiente, en unidades. */
const huecos = (ts: Tono[]): number[] => ts.slice(1).map((t, i) => (t.ini - (ts[i].fin ?? ts[i].ini)) / U);

function solapes(ts: Tono[]): number {
  const o = ts.slice().sort((a, b) => a.ini - b.ini);
  let n = 0;
  for (let i = 1; i < o.length; i++) {
    for (let j = 0; j < i; j++) if (o[i].ini < (o[j].fin ?? o[j].ini) - 1e-6) n++;
  }
  return n;
}

/** Reproduce lo que haya y espera a que termine (el botón vuelve a «Reproducir sonido»). */
async function reproducirHastaElFinal(page: Page, nTonos: number): Promise<Tono[]> {
  await botonReproducir(page).click();
  await expect.poll(async () => (await tonos(page)).length, { timeout: 15000 }).toBeGreaterThanOrEqual(nTonos);
  await expect(botonReproducir(page)).toBeVisible({ timeout: 15000 });
  return tonos(page);
}

// ============================================================
// CASO 1 — NORMAL: texto → Morse (letras, cifras, signos) e ida y vuelta
// ============================================================
test('CASO 1 — SOS, «Hola mundo», cifras y signos según la UIT-R M.1677-1, y vuelta a texto', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Texto → Morse' })).toHaveAttribute('aria-pressed', 'true');

  expect(await convertir(page, 'SOS')).toBe('... --- ...'); // §1.1.1
  // Minúsculas: la UIT no distingue caja. H O L A / M U N D O.
  expect(await convertir(page, 'Hola mundo')).toBe('.... --- .-.. .- / -- ..- -. -.. ---');

  // Intercambiar: pasa a Morse → Texto con el Morse como entrada, y la vuelta da el texto.
  await page.locator('[class*="btnSwap"]').click();
  await expect(page.getByRole('button', { name: 'Morse → Texto' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('textarea')).toHaveValue('.... --- .-.. .- / -- ..- -. -.. ---');
  await page.getByRole('button', { name: 'Convertir', exact: true }).click();
  await expect(salida(page)).toHaveText('HOLA MUNDO');
  expect(await convertir(page, '... --- ...')).toBe('SOS');

  await page.getByRole('button', { name: 'Texto → Morse' }).click();
  expect(await convertir(page, '0 5')).toBe('----- / .....'); // §1.1.2
  // §1.1.3: punto, coma, interrogación y arroba.
  expect(await convertir(page, '. , ? @')).toBe('.-.-.- / --..-- / ..--.. / .--.-.');
});

// ============================================================
// CASO 2 — LÍMITE: la duración de puntos y rayas, y el móvil de 360 px
// ============================================================
test('CASO 2 — audio de «SOS E»: 10 tonos, punto = 100 ms, raya = 300 ms, 1 unidad dentro de la letra', async ({
  page,
}) => {
  expect(await convertir(page, 'SOS E')).toBe('... --- ... / .');
  const ts = await reproducirHastaElFinal(page, 10);
  expect(ts).toHaveLength(10);
  // Punto = 1 unidad y raya = 3 (§2.1). stop() se programa con el reloj de audio; entre leerlo
  // en start() y en stop() puede avanzar un quantum (2,7 ms = 0,027 u): tolerancia de 0,05 u.
  const esperadas = [1, 1, 1, 3, 3, 3, 1, 1, 1, 1];
  duraciones(ts).forEach((d, i) => expect(d, `tono ${i}`).toBeCloseTo(esperadas[i], 1));
  // Hueco dentro de la letra = 1 unidad (§2.2). Los tonos se encadenan con setTimeout: se admite
  // el retraso de un temporizador, no un hueco de letra (3) ni tonos pegados.
  const h = huecos(ts);
  for (const i of [0, 1, 3, 4, 6, 7]) {
    expect(h[i], `hueco ${i}`).toBeGreaterThan(0.8);
    expect(h[i], `hueco ${i}`).toBeLessThan(2);
  }
  // Un único contexto de audio para toda la reproducción.
  expect((await contextos(page)).creados).toBe(1);
});

test.describe('En móvil (360 px)', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 2 (móvil) — la herramienta cabe a lo ancho y convierte', async ({ page }) => {
    expect(await convertir(page, 'SOS')).toBe('... --- ...');
    const anchos = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(anchos.cliente).toBe(360);
    expect(anchos.scroll).toBeLessThanOrEqual(anchos.cliente);
    for (const sel of ['textarea', '[class*="btnPrimary"]', '[class*="outputBox"]']) {
      const caja = await page.locator(sel).boundingBox();
      expect(caja, sel).not.toBeNull();
      expect((caja?.x ?? -1) >= 0 && (caja?.x ?? 0) + (caja?.width ?? 999) <= 360, sel).toBe(true);
    }
  });

  /**
   * HALLAZGO [medio, accesibilidad · reflujo]. Las tres tarjetas del principio de la guía van en
   * una rejilla en línea `gridTemplateColumns: 'repeat(3,1fr)'` (page.tsx:254) sin media query:
   * a 360 px no caben y el html corta el desbordamiento (overflow-x: hidden), así que no se
   * puede desplazar hasta ellas. Medido: tarjetas en x = 41 · 248 · 407 con anchos 183 · 135 ·
   * 120 px: «SOS» cortada y «Tiempos» (la regla 1:3:7) entera fuera de la pantalla.
   * Correcto: las tres tarjetas dentro de los 360 px.
   */
  test('HALLAZGO — a 360 px las tarjetas Historia/SOS/Tiempos caben en la pantalla', async ({ page }) => {
    test.fail(true, 'Hallazgo abierto: rejilla de 3 columnas en línea (page.tsx:254)');
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const tarjetas = page.locator('[class*="infoCard"]');
    await expect(tarjetas).toHaveCount(3);
    await expect(tarjetas.nth(2)).toBeVisible();
    const bordes = await tarjetas.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().right)));
    for (const b of bordes) expect(b).toBeLessThanOrEqual(360);
  });
});

// ============================================================
// CASO 3 — RECHAZO: sin entrada no hay nada que convertir ni que sonar
// ============================================================
test('CASO 3 — vacío: Convertir no inventa salida, Reproducir y Copiar desactivados, nada suena', async ({ page }) => {
  await page.getByRole('button', { name: 'Convertir', exact: true }).click();
  await expect(salida(page)).toHaveText('El resultado aparecerá aquí...');
  await expect(botonReproducir(page)).toBeDisabled();
  await expect(page.getByRole('button', { name: /Copiar/ })).toBeDisabled();

  // Limpiar tras una conversión deja la app como al principio.
  expect(await convertir(page, 'SOS')).toBe('... --- ...');
  await page.getByRole('button', { name: 'Limpiar' }).click();
  await expect(page.locator('textarea')).toHaveValue('');
  await expect(salida(page)).toHaveText('El resultado aparecerá aquí...');
  await expect(botonReproducir(page)).toBeDisabled();
  expect(await contextos(page)).toEqual({ creados: 0, cerrados: 0, abiertos: 0 });
});

// ============================================================
// HALLAZGOS (Inspector 25/09/2026) — abiertos, con test.fail()
// ============================================================

/**
 * HALLAZGO [alto, forma del 1757 de generador-ondas]. La reproducción es un bucle async
 * (page.tsx:130-143) que solo mira `stopRef`, y la página no tiene limpieza al desmontarse:
 * al salir con un enlace interno el bucle sigue creando osciladores en el contexto viejo, que
 * nunca se cierra (page.tsx:92). Suena en la app de destino hasta que acaba el mensaje, y el
 * «Detener» de la página al volver es otra instancia: no lo alcanza.
 * Medido: «PARIS» × 6, clic en «Traductor de Braille» tras 2 tonos → 10 tonos a los 3 s,
 * arrancados en /conversor-braille/, pico 0,30 en los altavoces, 0 close().
 * Correcto: al salir, ningún tono nuevo.
 */
test('HALLAZGO — salir a otra app con un mensaje sonando lo detiene', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: sin limpieza al desmontar (page.tsx:84-146)');
  await convertir(page, 'PARIS PARIS PARIS PARIS PARIS PARIS');
  await botonReproducir(page).click();
  await expect.poll(async () => (await tonos(page)).length).toBeGreaterThanOrEqual(2);
  await page.locator('a[href*="/conversor-braille/"]').first().click();
  await page.waitForURL(/conversor-braille/);
  const t0 = await page.evaluate(() => (window as unknown as VentanaMorse).__morse.ctx[0].currentTime);
  // Esperar 2 s de reloj de audio… o a que el contexto se haya cerrado (su reloj se congela).
  await expect
    .poll(() =>
      page.evaluate((desde) => {
        const c = (window as unknown as VentanaMorse).__morse.ctx[0];
        return c.state === 'closed' || c.currentTime >= desde + 2;
      }, t0),
    )
    .toBe(true);
  const enDestino = (await tonos(page)).filter((t) => t.ruta.includes('conversor-braille'));
  expect(enDestino, 'tonos arrancados ya en la app de destino').toHaveLength(0);
});

/**
 * HALLAZGO [bajo]. Cada visita que reproduce algo crea su AudioContext (page.tsx:91-93, en un
 * ref del componente) y ninguno se cierra: se acumulan uno por visita. No es el caso de
 * visualizador-sonido-ondas (allí el contexto es de módulo y se reutiliza; se DESCARTÓ).
 * Medido: reproducir «E», ir a Traductor de Braille, volver con Atrás y reproducir «E» →
 * 2 contextos «running», 0 close(). Correcto: como mucho uno abierto.
 */
test('HALLAZGO — ir y volver no acumula AudioContext abiertos', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: el AudioContext de page.tsx:92 nunca se cierra');
  await convertir(page, 'E');
  await reproducirHastaElFinal(page, 1);
  await page.locator('a[href*="/conversor-braille/"]').first().click();
  await page.waitForURL(/conversor-braille/);
  await page.goBack();
  await page.waitForURL(/conversor-morse/);
  await esperarHidratacion(page, ['textarea']);
  await convertir(page, 'E');
  await reproducirHastaElFinal(page, 2);
  await expect.poll(async () => (await contextos(page)).abiertos).toBeLessThanOrEqual(1);
});

/**
 * HALLAZGO [alto]. En modo «Morse → Texto», «Reproducir sonido» toma la ENTRADA (que ya es
 * Morse) y la vuelve a codificar como si fuera texto: `textoAMorse(entrada)` (page.tsx:85).
 * Cada «.» suena como el signo «punto» (.-.-.-), cada «-» como el guion (-....-) y cada espacio
 * como un hueco de palabra. Medido con «... --- ...»: los primeros tonos salen 1 3 1 3 1 3 1 3
 * (el signo punto) y el mensaje entero son 54 tonos.
 * Correcto (UIT §1.1.1): 9 tonos, 1 1 1 3 3 3 1 1 1.
 */
test('HALLAZGO — en Morse → Texto, «... --- ...» suena como SOS', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: textoAMorse(entrada) sobre Morse (page.tsx:85)');
  await page.getByRole('button', { name: 'Morse → Texto' }).click();
  expect(await convertir(page, '... --- ...')).toBe('SOS');
  await botonReproducir(page).click();
  await expect.poll(async () => (await tonos(page)).length, { timeout: 10000 }).toBeGreaterThanOrEqual(9);
  const d = duraciones((await tonos(page)).slice(0, 9)).map((x) => Math.round(x));
  await botonDetener(page).click().catch(() => undefined);
  expect(d).toEqual([1, 1, 1, 3, 3, 3, 1, 1, 1]);
});

/**
 * HALLAZGO [medio, cálculo]. Los huecos entre letras y entre palabras se SUMAN al hueco de
 * símbolo que ya sigue a cada tono (page.tsx:133-141), y el « / » llega rodeado de dos espacios:
 * entre letras suena 1 + 3 = 4 unidades y entre palabras 1 + 3 + 7 + 3 = 14, no 3 y 7 (UIT
 * §2.3-2.4, y la tarjeta «Tiempos» y la regla «1:3:7» de la propia página).
 * Medido con «SOS E»: huecos S-O 4,20 · O-S 4,28 · S-E 14,41 unidades.
 */
test('HALLAZGO — entre letras suenan 3 unidades y entre palabras 7', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: huecos 4 y 14 unidades (page.tsx:130-143)');
  expect(await convertir(page, 'SOS E')).toBe('... --- ... / .');
  const h = huecos(await reproducirHastaElFinal(page, 10));
  // Los temporizadores solo pueden retrasar: el menor de los dos huecos de letra no debe pasar de 3,5.
  expect(Math.min(h[2], h[5]), 'hueco entre letras (esperado 3)').toBeLessThan(3.5);
  expect(h[8], 'hueco entre palabras (esperado 7)').toBeGreaterThan(6.5);
  expect(h[8], 'hueco entre palabras (esperado 7)').toBeLessThan(8.5);
});

/**
 * HALLAZGO [medio]. «Detener» solo pone `stopRef = true`, y «Reproducir» lo vuelve a poner a
 * false (page.tsx:89): si el bucle viejo está esperando un temporizador (un hueco de palabra
 * dura 1,4 s), al despertar ve false y SIGUE. Suenan dos mensajes a la vez, entremezclados.
 * Medido con «T TTTT»: Detener a 0,80 s y Reproducir a 0,90 s → 10 tonos (1 + 4 del viejo + 5
 * del nuevo) con 3 solapados. Correcto: 1 + 5 = 6 tonos y ninguno solapado.
 */
test('HALLAZGO — Detener y volver a Reproducir no mezcla dos mensajes', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: el bucle viejo sobrevive a Detener (page.tsx:89, 131)');
  await convertir(page, 'T TTTT');
  await botonReproducir(page).click();
  // Primer tono (T = 0,3 s) y medio segundo después: dentro del hueco entre palabras.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const m = (window as unknown as VentanaMorse).__morse;
        const t = m.tonos[0];
        return Boolean(t?.fin !== null && t && m.ctx[0].currentTime >= (t.fin ?? 0) + 0.5);
      }),
      { intervals: [10] },
    )
    .toBe(true);
  await botonDetener(page).click();
  await botonReproducir(page).click();
  const desde = await reloj(page);
  // «T TTTT» dura menos de 4,5 s incluso con los huecos de hoy: pasado eso, todo ha sonado.
  await expect.poll(() => reloj(page), { timeout: 15000 }).toBeGreaterThanOrEqual(desde + 4.5);
  const ts = await tonos(page);
  expect(solapes(ts), 'tonos solapados').toBe(0);
  expect(ts, 'T del primer intento + las 5 T del segundo').toHaveLength(6);
});

/**
 * HALLAZGO [bajo]. En Texto → Morse el botón «Reproducir sonido» se activa en cuanto hay
 * entrada (`disabled={!salida && !entrada}`, page.tsx:226), pero lo que suena es la SALIDA
 * (page.tsx:85-86): antes de pulsar Convertir, el clic no hace nada y no avisa.
 * Medido: escribir «SOS» y pulsar Reproducir → botón activo, 0 tonos, 0 AudioContext.
 * Correcto: o suena «SOS», o el botón está desactivado.
 */
test('HALLAZGO — Reproducir antes de Convertir suena o está desactivado', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: botón activo que no hace nada (page.tsx:85-86, 226)');
  await escribir(page, 'SOS');
  if (await botonReproducir(page).isDisabled()) return;
  await botonReproducir(page).click();
  await expect.poll(async () => (await tonos(page)).length, { timeout: 3000 }).toBeGreaterThan(0);
});

/**
 * HALLAZGO [bajo, sospecha de SOSPECHAS.md]. Cada tono entra y sale en escalón: la ganancia se
 * fija a 0,3 con setValueAtTime y start()/stop() sin rampa (page.tsx:113-115). Como 600 Hz ×
 * 100 ms son 60 ciclos exactos, el tono empieza y acaba en un cruce por cero: no hay salto de
 * valor, solo de pendiente, y el clic es suave. Medido (48 kHz): la primera muestra con señal
 * vale 0,0235 y a los 0,42 ms ya 0,30 (el pico); energía por encima de 3 kHz en una ventana de
 * 256 muestras en el borde: 4,5·10⁻⁴ del total, frente a 2,5·10⁻⁸ en mitad del tono.
 * Correcto (práctica de CW, ≈ 5 ms de subida): a 2 ms del arranque, menos de 0,15.
 */
test('HALLAZGO — cada tono entra con rampa, no en escalón', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: envolvente rectangular (page.tsx:113-115)');
  await convertir(page, 'E');
  await botonReproducir(page).click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const m = (window as unknown as VentanaMorse).__morse;
        const t = m.tonos[0];
        return Boolean(t && t.fin !== null && m.ctx[0].currentTime >= (t.fin ?? 0) + 0.15);
      }),
      { intervals: [10] },
    )
    .toBe(true);
  const c = await page.evaluate(() => {
    const b = (window as unknown as VentanaMorse).__morse.buses[0];
    const x = new Float32Array(b.an.fftSize);
    b.an.getFloatTimeDomainData(x);
    return { sr: b.ctx.sampleRate, x: Array.from(x) };
  });
  const primera = c.x.findIndex((v) => Math.abs(v) > 1e-6);
  expect(primera, 'la captura tiene que empezar en silencio').toBeGreaterThan(0);
  const tramo = c.x.slice(primera, primera + Math.round(0.002 * c.sr)).map(Math.abs);
  expect(Math.max(...tramo), 'amplitud en los 2 primeros ms').toBeLessThan(0.15);
});

/**
 * HALLAZGO [medio, cálculo]. Lo que no está en el diccionario pasa TAL CUAL a la salida Morse
 * (`MORSE_CODE[char] || char`, page.tsx:43), sin aviso: la Ñ, las vocales con tilde, «¿», «¡»,
 * «#», el «%» y el salto de línea. El resultado no es Morse válido, y al reproducirlo esos
 * caracteres se saltan en silencio (el bucle solo suena «.» y «-»). Para un público que escribe
 * en español es lo habitual: «¿AÑO #1?» → «¿ .- Ñ --- / # .---- ..--..». La app no usa la
 * variante española de la Ñ (--.--) ni dice que la UIT no la tiene.
 * Correcto: la salida solo lleva Morse (con la variante declarada, o transcrita), o un aviso
 * visible de qué caracteres no tienen código.
 */
test('HALLAZGO — «¿AÑO #1?» no deja caracteres sueltos en la salida Morse sin avisar', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: caracteres sin código pasan tal cual (page.tsx:43)');
  const s = await convertir(page, '¿AÑO #1?');
  const soloMorse = /^[.\-/ ]+$/.test(s);
  // El aviso se busca DENTRO de la herramienta y con límite de palabra: «humano tiene» casa sin él.
  const aviso = await page
    .locator('[class*="mainContent"]')
    .getByText(/\bno (tiene|tienen|existe|se puede)\b|\bsin (código|equivalente)\b|\bno representable/i)
    .count();
  expect(soloMorse || aviso > 0, `salida: «${s}»`).toBe(true);
});

/**
 * HALLAZGO [bajo, cálculo/contenido]. La metadata promete el «Alfabeto Morse Internacional
 * ITU-R M.1677 completo» (metadata.ts:42), pero el diccionario (page.tsx:10-22) no tiene la
 * «accented e» = ..-.. de la UIT (§1.1.1), mete ! & ; _ $ (no están en §1.1.3) sin decir que
 * son extensiones, y no transmite el % como 0/0 (§3.3).
 * Medido: «CAFÉ» → «-.-. .- ..-. É»; «..-..» → «..-..». Correcto: «-.-. .- ..-. ..-..» y «É».
 */
test('HALLAZGO — la É de la UIT: «CAFÉ» ↔ «-.-. .- ..-. ..-..»', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: falta la É de la UIT-R M.1677-1 §1.1.1 (page.tsx:10-22)');
  expect(await convertir(page, 'CAFÉ')).toBe('-.-. .- ..-. ..-..');
  await page.getByRole('button', { name: 'Morse → Texto' }).click();
  expect(await convertir(page, '-.-. .- ..-. ..-..')).toBe('CAFÉ');
});

/**
 * HALLAZGO [bajo]. En Morse → Texto un código que no existe se copia tal cual al texto, pegado a
 * las letras (`MORSE_TO_TEXT[code] || code`, page.tsx:53): «... ...... ...» → «S......S», sin
 * marca de error. Y separar palabras con varios espacios (otra convención común) las junta:
 * «... --- ...   ... --- ...» → «SOSSOS». Correcto: el código desconocido se marca o se avisa.
 */
test('HALLAZGO — en Morse → Texto un código inexistente se marca', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: códigos desconocidos pasan tal cual (page.tsx:53)');
  await page.getByRole('button', { name: 'Morse → Texto' }).click();
  const s = await convertir(page, '... ...... ...');
  const aviso = await page
    .locator('[class*="mainContent"]')
    .getByText(/\bno (reconocid|válid|existe)|\bdesconocid|\binválid/i)
    .count();
  expect(!/[.-]/.test(s) || aviso > 0, `salida: «${s}»`).toBe(true);
});

/**
 * HALLAZGO [bajo, accesibilidad]. El rótulo «Texto»/«Código Morse» es un <label> sin htmlFor y
 * sin el textarea dentro (page.tsx:188-199): el nombre accesible sale del placeholder
 * («Escribe tu mensaje aquí...»), y el rótulo visible no está en él (WCAG 1.3.1 y 2.5.3). El de
 * la salida (page.tsx:215) es un <label> de un <div>. Y el botón «⇄» (page.tsx:206) se llama
 * «⇄»: el title «Intercambiar» no cuenta cuando hay contenido.
 */
test('HALLAZGO — el campo se llama «Texto» y el botón ⇄ «Intercambiar»', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: <label> sin asociar y ⇄ sin aria-label (page.tsx:188-206)');
  await expect(page.getByRole('textbox', { name: 'Texto', exact: true })).toHaveCount(1);
  await expect(page.getByRole('button', { name: /Intercambiar/ })).toHaveCount(1);
});

/**
 * HALLAZGO [bajo, accesibilidad]. Emojis junto a texto sin aria-hidden: «📋 Copiar»,
 * «🔊 Reproducir sonido», «⏹ Detener» (page.tsx:223-231) y 19 más en la guía (encabezados,
 * celdas ✅/❌ y la lista de errores). `node scripts/check-a11y-jsx.mjs app/conversor-morse/page.tsx`
 * da 22. Un lector de pantalla lee «portapapeles Copiar».
 */
test('HALLAZGO — los botones se llaman sin el emoji', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: emojis sin aria-hidden (page.tsx:223-231 y otras 19 líneas)');
  await convertir(page, 'SOS');
  await expect(page.getByRole('button', { name: 'Copiar', exact: true })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Reproducir sonido', exact: true })).toHaveCount(1);
});

interface Contraste {
  ratio: number;
  minimo: number;
}

/** Contraste del texto de `sel` sobre su fondo real (capas rgba mezcladas; con degradado, el peor tramo). */
const contraste = (page: Page, sel: string): Promise<Contraste> =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return { ratio: -1, minimo: 4.5 };
    interface Rgba { r: number; g: number; b: number; a: number }
    const leer = (c: string): Rgba | null => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const sobre = (a: Rgba, b: Rgba): Rgba => ({
      r: a.r * a.a + b.r * (1 - a.a),
      g: a.g * a.a + b.g * (1 - a.a),
      b: a.b * a.a + b.b * (1 - a.a),
      a: 1,
    });
    const lum = (c: Rgba): number => {
      const f = (v: number): number => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const capas: Rgba[] = [];
    let degradado: Rgba[] | null = null;
    for (let n: Element | null = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (!degradado && cs.backgroundImage.includes('gradient')) {
        degradado = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) ?? []).map((x) => leer(x) as Rgba);
      }
      const bg = leer(cs.backgroundColor);
      if (bg && bg.a > 0) {
        capas.push(bg);
        if (bg.a >= 1) break;
      }
    }
    let fondo: Rgba = capas.length && capas[capas.length - 1].a >= 1 ? capas[capas.length - 1] : { r: 255, g: 255, b: 255, a: 1 };
    for (let i = capas.length - 2; i >= 0; i--) fondo = sobre(capas[i], fondo);
    const cs = getComputedStyle(el);
    const color = leer(cs.color) as Rgba;
    const ratio = (f: Rgba): number => {
      const c = color.a < 1 ? sobre(color, f) : color;
      const [a, b] = [lum(c), lum(f)];
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    };
    const r = degradado ? Math.min(...degradado.map((g) => ratio(g.a < 1 ? sobre(g, fondo) : g))) : ratio(fondo);
    const px = parseFloat(cs.fontSize);
    const grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
    return { ratio: Math.round(r * 100) / 100, minimo: grande ? 3 : 4.5 };
  }, sel);

/**
 * HALLAZGO [medio, accesibilidad]. Texto en la marca por debajo de 4,5:1, medido en el navegador:
 *   modo activo (#2E86AB, 16 px/600) 4,11 claro · 3,50 oscuro — la marca va redefinida en
 *     .container (ConversorMorse.module.css:2) sin variante oscura;
 *   «Convertir» blanco sobre el degradado #2E86AB → #48A9A6: 2,80 en el tramo teal (ambos temas);
 *   «⏹ Detener» (#EF4444 sobre su 10 %) 3,3 · 3,5;
 *   títulos h4 de escenarios/FAQ (#2E86AB) 4,11 · 3,50; de consejos 3,56 · 2,96;
 *   número de paso (blanco sobre #2E86AB) 4,11; título del aviso (#D97706, 19,2 px/600) 2,76 en claro.
 * (La cabecera de la tabla ya usa --primary-boton y cumple: 5,47 · 7,35.)
 */
test('HALLAZGO — botones y títulos de la app a 4,5:1 en claro y en oscuro', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: contraste de --primary, degradado, Detener y aviso');
  await convertir(page, 'PARIS PARIS PARIS');
  await page.getByRole('button', { name: /Ver guía educativa/ }).click();
  // Botones y tarjetas llevan `transition: all`: sin esto se mide a mitad del cambio de tema
  // (medido: el título del aviso daba 1,25 en oscuro, amarillo sobre el fondo claro aún).
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
  const selectores = [
    '[class*="modeBtn"][class*="active"]',
    '[class*="btnPrimary"]',
    '[class*="eduFaqItem"] h4',
    '[class*="eduTipCard"] h4',
    '[class*="eduStepNumber"]',
    '[class*="warningHeader"] h3',
  ];
  const fallos: string[] = [];
  for (const tema of ['light', 'dark']) {
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
    }, tema);
    await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
    for (const s of selectores) {
      const c = await contraste(page, s);
      if (c.ratio < c.minimo) fallos.push(`${tema} ${s}: ${c.ratio}`);
    }
  }
  await botonReproducir(page).click();
  for (const tema of ['light', 'dark']) {
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
    }, tema);
    const c = await contraste(page, '[class*="btnStop"]');
    if (c.ratio < c.minimo) fallos.push(`${tema} Detener: ${c.ratio}`);
  }
  await botonDetener(page).click();
  expect(fallos).toEqual([]);
});

/**
 * HALLAZGO [medio, contenido]. «En España, la licencia de radioaficionado clase A requiere su
 * dominio» (page.tsx:331) es falso: la Orden IET/1311/2013 (BOE-A-2013-7624) establece una sola
 * autorización de radioaficionado y un examen de dos partes (electricidad/radioelectricidad y
 * normativa, art. 10 y anexo II) sin telegrafía. Y lo contradice la misma guía (page.tsx:365,
 * «España lo retiró de las pruebas de licencia») y la FAQ JSON-LD (metadata.ts:74, «la licencia
 * … todavía lo evalúa en muchos países»).
 */
test('HALLAZGO — la guía no dice que la licencia española exija Morse', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: page.tsx:331');
  await page.getByRole('button', { name: /Ver guía educativa/ }).click();
  await expect(page.getByText(/clase A requiere su dominio/)).toHaveCount(0);
});

/**
 * HALLAZGO [bajo, contenido]. «El oído humano tiene máxima sensibilidad entre 500-1000 Hz»
 * (page.tsx:471): las curvas de igual sonoridad (ISO 226:2003) sitúan la máxima sensibilidad en
 * torno a 3-4 kHz. 600-700 Hz es la costumbre en CW, no el máximo del oído.
 */
test('HALLAZGO — la guía no sitúa la máxima sensibilidad del oído en 500-1000 Hz', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: page.tsx:471');
  await expect(page.getByText(/máxima sensibilidad entre 500-1000 Hz/)).toHaveCount(0);
});

/** HALLAZGO [bajo, contenido]. Errata «aveería» por «avería» (page.tsx:346). */
test('HALLAZGO — sin la errata «aveería»', async ({ page }) => {
  test.fail(true, 'Hallazgo abierto: page.tsx:346');
  await expect(page.getByText(/aveería/)).toHaveCount(0);
});
