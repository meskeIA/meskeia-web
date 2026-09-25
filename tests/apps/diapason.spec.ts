import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Diapasón Digital — test de regresión generado por /inspector el 24/09/2026.
 *
 * Lo que la app promete: un La de referencia (440 Hz por defecto) generado con Web Audio,
 * presets históricos (432, 442, 443, 415, 466 Hz), frecuencia libre de 20 a 2000 Hz y cuatro
 * tipos de onda. No hay cálculo más allá de la frecuencia: lo que se verifica es que el tono
 * que SUENA es el que dice la pantalla, que «Detener» lo detiene de verdad y que no se quedan
 * osciladores huérfanos sonando.
 *
 * Para oírlo sin altavoces se envuelve el Web Audio con addInitScript: cada OscillatorNode que
 * la app arranca queda registrado con su tipo, su frecuencia real (`frequency.value`) y si se
 * llegó a parar.
 *
 * Valores de referencia, a mano (temperamento igual, f = 440 · 2^(n/12);
 * cents = 1200 · log2(f1/f2)):
 *   · La4 estándar = 440 Hz.
 *   · 415 Hz frente a 440 Hz = 1200 · log2(415/440) = −101,27 cents (algo MÁS de un semitono;
 *     el La♭4 temperado es 440 · 2^(−1/12) = 415,30 Hz).
 *   · 432 Hz frente a 440 Hz = −31,77 cents.
 */

const RUTA = '/diapason/';
const CAMPO = 'input[aria-label="Frecuencia personalizada en Hz"]';

interface Oscilador {
  tipo: string;
  frecuencia: number;
  parado: boolean;
}

declare global {
  interface Window {
    __osciladores: { nodo: OscillatorNode; parado: boolean }[];
  }
}

/** Registra cada oscilador que la app arranca y si se llega a parar. */
async function instrumentarAudio(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__osciladores = [];
    const proto = OscillatorNode.prototype;
    const arrancar = proto.start;
    const parar = proto.stop;
    proto.start = function (this: OscillatorNode, ...args: [number?]) {
      window.__osciladores.push({ nodo: this, parado: false });
      return arrancar.apply(this, args);
    };
    proto.stop = function (this: OscillatorNode, ...args: [number?]) {
      const r = window.__osciladores.find((o) => o.nodo === this);
      if (r) r.parado = true;
      return parar.apply(this, args);
    };
  });
}

async function osciladores(page: Page): Promise<Oscilador[]> {
  return page.evaluate(() =>
    window.__osciladores.map((o) => ({
      tipo: o.nodo.type,
      frecuencia: o.nodo.frequency.value,
      parado: o.parado,
    })),
  );
}

async function sonando(page: Page): Promise<Oscilador[]> {
  return (await osciladores(page)).filter((o) => !o.parado);
}

function botonReproducir(page: Page) {
  return page.getByRole('button', { name: /tono de referencia/ });
}

/*
 * Estado del botón principal. Hasta el 24/09/2026 estos tests lo leían en `aria-pressed`, que
 * el botón llevaba A LA VEZ que un nombre que cambia con el estado: el lector anunciaba
 * «Detener tono de referencia, activado» (hallazgo 1510). Se retiró aria-pressed y se conserva
 * el nombre que cambia (coincide con el texto visible), así que el estado se lee en el nombre.
 */
const SONANDO = 'Detener tono de referencia';
const PARADO = 'Reproducir tono de referencia';

function pantalla(page: Page) {
  return page.locator('[class*="frecuenciaNumero"]');
}

test.use({ launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } });

test.beforeEach(async ({ page }) => {
  await instrumentarAudio(page);
  await page.goto(RUTA);
  await esperarHidratacion(page, [CAMPO]);
});

test('caso normal: por defecto suena un único La senoidal a 440 Hz y Detener lo para', async ({
  page,
}) => {
  // La4 = 440 Hz, el valor por defecto que anuncian el hero y la metadata.
  await expect(pantalla(page)).toHaveText('440');
  await botonReproducir(page).click();
  await expect(botonReproducir(page)).toHaveAttribute('aria-label', SONANDO);

  await expect.poll(() => sonando(page)).toHaveLength(1);
  const [osc] = await sonando(page);
  expect(osc.tipo).toBe('sine');
  // Un semitono son ~6 %: con precisión de 0,01 Hz cualquier desvío musical se ve.
  expect(osc.frecuencia).toBeCloseTo(440, 2);

  await botonReproducir(page).click();
  await expect(botonReproducir(page)).toHaveAttribute('aria-label', PARADO);
  await expect.poll(() => sonando(page)).toHaveLength(0);
});

test('caso límite: el preset 432 suena a 432 Hz y cambiar a 415 en vivo retoca el mismo oscilador', async ({
  page,
}) => {
  await page.getByRole('button', { name: /La 432Hz/ }).click();
  await expect(pantalla(page)).toHaveText('432');
  await botonReproducir(page).click();
  await expect.poll(async () => (await sonando(page))[0]?.frecuencia).toBeCloseTo(432, 2);

  // 415 Hz = −101,27 cents respecto a 440 (más de un semitono): el oscilador debe bajar
  // hasta 415 sin que se cree otro encima.
  await page.getByRole('button', { name: /La 415Hz/ }).click();
  await expect(pantalla(page)).toHaveText('415');
  await expect.poll(async () => (await sonando(page)).map((o) => o.frecuencia)).toEqual([415]);

  // Extremos del campo libre (metadata: «de 20 a 2000 Hz»), aplicados en vivo.
  await page.locator(CAMPO).fill('2000');
  await esperarValorEnReact(page, CAMPO, '2000');
  await expect(pantalla(page)).toHaveText('2000');
  await expect.poll(async () => (await sonando(page)).map((o) => o.frecuencia)).toEqual([2000]);

  await page.locator(CAMPO).fill('20');
  await esperarValorEnReact(page, CAMPO, '20');
  await expect(pantalla(page)).toHaveText('20');
  await expect.poll(async () => (await sonando(page)).map((o) => o.frecuencia)).toEqual([20]);
});

test('caso de rechazo: fuera de 20–2000 Hz se recorta al salir del campo y el vacío vuelve a 440', async ({
  page,
}) => {
  const campo = page.locator(CAMPO);
  const casos: [string, string][] = [
    ['3000', '2000'], // por encima del máximo → 2000
    ['5', '20'], //      por debajo del mínimo → 20
    ['-5', '20'], //     negativo → 20
    ['', '440'], //      vacío → el La estándar
  ];
  // Se parte de 442 para que el primer caso no pueda coincidir con el valor inicial.
  await page.getByRole('button', { name: /La 442Hz/ }).click();
  await expect(pantalla(page)).toHaveText('442');
  for (const [entrada, esperado] of casos) {
    await campo.fill(entrada);
    await campo.blur();
    await esperarValorEnReact(page, CAMPO, esperado);
    await expect(pantalla(page), `campo «${entrada}»`).toHaveText(esperado);
  }
  // Con el recorte, lo que suena es lo que se ve: 440 tras el último caso.
  await botonReproducir(page).click();
  await expect.poll(async () => (await sonando(page)).map((o) => o.frecuencia)).toEqual([440]);
});

/** Pulsa dos botones de onda desde el propio navegador con `ms` milisegundos entre ellos. */
async function dosOndas(page: Page, primera: string, segunda: string, ms: number): Promise<void> {
  // En la MISMA tarea no vale: React agrupa los dos cambios de estado en uno.
  await page.evaluate(
    async ([a, b, espera]) => {
      const boton = (t: string) =>
        [...document.querySelectorAll('button')].find((el) => el.textContent?.includes(t));
      boton(a)?.click();
      await new Promise((r) => setTimeout(r, espera));
      boton(b)?.click();
    },
    [primera, segunda, ms] as [string, string, number],
  );
}

test('hallazgo 1362: dos cambios de onda seguidos no dejan un oscilador huérfano tras Detener', async ({
  page,
}) => {
  // Antes: cambiar de onda hacía detenerAudio() + setTimeout(iniciarAudio, 150); con otra onda
  // antes de ~50 ms se programaban DOS arranques y quedaba un triangular a 440 Hz que ni
  // «Detener» ni los presets alcanzaban. Ahora la onda se cambia en caliente sobre el MISMO
  // oscilador: en toda la secuencia solo se crea uno.
  await botonReproducir(page).click();
  await expect.poll(() => sonando(page)).toHaveLength(1);

  await dosOndas(page, 'Triangular', 'Cuadrada', 20);
  await expect(page.getByRole('button', { name: /Cuadrada/ })).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(600);
  expect((await sonando(page)).map((o) => o.tipo)).toEqual(['square']);
  expect(await osciladores(page), 'un único oscilador creado en toda la secuencia').toHaveLength(1);

  await botonReproducir(page).click();
  await expect(botonReproducir(page)).toHaveAttribute('aria-label', PARADO);
  await expect.poll(() => sonando(page), { timeout: 2000 }).toHaveLength(0);

  // Y tras elegir 415 nada vuelve a sonar (el huérfano seguía a 440 Hz).
  await page.getByRole('button', { name: /La 415Hz/ }).click();
  await page.waitForTimeout(300);
  expect(await sonando(page)).toHaveLength(0);
});

test('hallazgo 1363: con 100–150 ms entre dos ondas suena la onda que queda marcada', async ({
  page,
}) => {
  await botonReproducir(page).click();
  await expect.poll(() => sonando(page)).toHaveLength(1);
  for (const ms of [105, 145]) {
    await dosOndas(page, 'Triangular', 'Cuadrada', ms);
    await expect(page.getByRole('button', { name: /Cuadrada/ })).toHaveAttribute('aria-pressed', 'true');
    await page.waitForTimeout(400);
    expect((await sonando(page)).map((o) => o.tipo), `intervalo ${ms} ms`).toEqual(['square']);
    await page.getByRole('button', { name: /Senoidal/ }).click();
    await expect.poll(async () => (await sonando(page)).map((o) => o.tipo)).toEqual(['sine']);
  }
  expect(await osciladores(page)).toHaveLength(1);
});

test('hallazgo 1364: la etiqueta muestra la nota temperada más cercana y su desvío en cents', async ({
  page,
}) => {
  const nota = page.getByTestId('nota-cercana');
  // 440 Hz = La4 exacto.
  await expect(nota).toContainText('La');
  await expect(nota).toContainText('A4');
  await expect(nota).toContainText('0 cents');

  const casos: [string, string, string, string][] = [
    // Do4 temperado = 440 · 2^(−9/12) = 261,63 Hz → 262 Hz = 1200·log2(262/261,626) = +2,5 cents
    ['262', 'Do', 'C4', '+2,5 cents'],
    // 415 Hz: n = 12·log2(415/440) = −1,013 → Sol♯4 (415,305 Hz), 1200·log2(415/415,305) = −1,3 cents
    ['415', 'Sol♯', 'G♯4', '−1,3 cents'],
    // 2000 Hz: n = 26,21 → Si6 = 440 · 2^(26/12) = 1975,53 Hz; 1200·log2(2000/1975,53) = +21,3 cents
    ['2000', 'Si', 'B6', '+21,3 cents'],
  ];
  for (const [entrada, nombre, cientifica, cents] of casos) {
    await page.locator(CAMPO).fill(entrada);
    await esperarValorEnReact(page, CAMPO, entrada);
    await expect(pantalla(page)).toHaveText(entrada);
    await expect(nota.locator('[class*="notaNombre"]'), `${entrada} Hz`).toHaveText(nombre);
    await expect(nota.locator('[class*="notaOctava"]'), `${entrada} Hz`).toHaveText(cientifica);
    await expect(nota.locator('[class*="notaCents"]'), `${entrada} Hz`).toHaveText(cents);
  }
});

test('hallazgos 1365-1367: datos de la tabla y la FAQ', async ({ page }) => {
  const texto = await page.locator('body').textContent();
  // 1200 · log2(415/440) = −101,27 cents: algo MÁS de un semitono.
  expect(texto).toContain('−101,27 cents');
  expect(texto).not.toContain('-99 cents');
  expect(texto).not.toContain('exactamente un semitono');
  // La ISO se fundó en 1947: en 1939 fue la Conferencia de Londres (ISA).
  expect(texto).not.toContain('En 1939 la ISO');
  expect(texto).not.toContain('some jazz');
});

test('hallazgos 1368-1369: botones con type, presets con aria-pressed y deslizadores con nombre', async ({
  page,
}) => {
  const sinType = await page
    .locator('main button:not([type]), [class*="container"] button:not([type])')
    .count();
  expect(sinType).toBe(0);

  await expect(page.getByRole('button', { name: /La 440Hz/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /La 432Hz/ })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: /La 432Hz/ }).click();
  await expect(page.getByRole('button', { name: /La 432Hz/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /La 440Hz/ })).toHaveAttribute('aria-pressed', 'false');

  await expect(page.getByRole('slider', { name: 'Volumen' })).toHaveCount(1);
  await expect(page.getByRole('slider', { name: /Frecuencia en Hz/ })).toHaveCount(1);
});

/*
 * SOSPECHA DEL INSPECTOR (24/09/2026), CONFIRMADA Y REPARADA el mismo día:
 * el preset de 466 Hz se etiquetaba «Renacimiento (medio tono arriba)» y la tabla lo daba como
 * «Renacentista · S. XV-XVI», como si hubiera habido un La renacentista. No lo hubo: la afinación
 * variaba según ciudad, institución e instrumento. 466 Hz es una convención actual de la
 * interpretación historicista, próxima al Chorton/Cornetton alemán (s. XVII-XVIII) y a la de las
 * cornetas venecianas (~465 Hz). Lo mismo con 415 Hz, que se presentaba como «el estándar»
 * documentado en los s. XVII-XVIII: es una convención del s. XX elegida por quedar un semitono
 * bajo 440 Hz (J. Montagu, «Why Differing Pitch Standards?», 2019; B. Haynes, «A History of
 * Performing Pitch», 2002).
 */
test('sospecha 466/415 Hz: se presentan como convenciones historicistas, no como estándares de época', async ({
  page,
}) => {
  const p466 = page.getByRole('button', { name: /La 466Hz/ });
  await expect(p466).toContainText('Chorton · convención historicista');
  await expect(p466).not.toContainText('Renacimiento');
  await expect(page.getByRole('button', { name: /La 415Hz/ })).toContainText('Barroco · convención historicista');

  const texto = (await page.locator('body').textContent()) ?? '';
  expect(texto).not.toContain('Renacentista');
  expect(texto).not.toContain('S. XV-XVI / Europa');
  expect(texto).not.toContain('es el estándar adoptado por los grupos');
  expect(texto).toContain('No hubo una afinación renacentista');
  expect(texto).toContain('convención del siglo XX');

  // Los cents no cambian: 1200 · log2(466/440) = +99,39
  expect(texto).toContain('+99,39 cents');
  await p466.click();
  await expect(p466).toHaveAttribute('aria-pressed', 'true');
});

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * RE-INSPECCIÓN del 24/09/2026 (tarde), tras f7a6bb51 y 3de61f3c.
 *
 * Los tests de arriba cuentan un oscilador como «parado» en cuanto se llama a stop(). Desde la
 * reparación, Detener programa el stop en el reloj de audio (+0,1 s), así que aquí se mide lo
 * que de verdad importa: el evento `ended`. Vivo = arrancado y sin `ended`.
 * ─────────────────────────────────────────────────────────────────────────────
 */
declare global {
  interface Window {
    __terminados: WeakSet<OscillatorNode>;
    __ganancias: { nodo: GainNode; ctx: BaseAudioContext; t0: number }[];
  }
}

test.describe('Inspección 24/09/2026 — re-inspección: osciladores vivos, notas, tabla y datos', () => {
  test.beforeEach(async ({ page }) => {
    // Se añade a la instrumentación del beforeEach de fichero y se recarga para que valga.
    await page.addInitScript(() => {
      window.__terminados = new WeakSet();
      window.__ganancias = [];
      const proto = BaseAudioContext.prototype;
      const crearOsc = proto.createOscillator;
      const crearGan = proto.createGain;
      proto.createOscillator = function (this: BaseAudioContext) {
        const nodo = crearOsc.call(this);
        nodo.addEventListener('ended', () => window.__terminados.add(nodo));
        return nodo;
      };
      proto.createGain = function (this: BaseAudioContext) {
        const nodo = crearGan.call(this);
        window.__ganancias.push({ nodo, ctx: this, t0: this.currentTime });
        return nodo;
      };
    });
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO]);
  });

  /** Osciladores arrancados que todavía no han emitido `ended`. */
  async function vivos(page: Page): Promise<{ tipo: string; frecuencia: number }[]> {
    return page.evaluate(() =>
      window.__osciladores
        .filter((o) => !window.__terminados.has(o.nodo))
        .map((o) => ({ tipo: o.nodo.type, frecuencia: o.nodo.frequency.value })),
    );
  }

  /** Clics desde el propio navegador, en tareas distintas, con `ms` de espera tras cada uno. */
  async function rafaga(page: Page, pasos: [string, number][]): Promise<void> {
    await page.evaluate(async (ps) => {
      const boton = (t: string) =>
        t === 'PLAY'
          ? document.querySelector<HTMLButtonElement>('button[aria-label*="tono de referencia"]')
          : [...document.querySelectorAll('button')].find((el) => el.textContent?.includes(t));
      for (const [t, ms] of ps) {
        boton(t)?.click();
        await new Promise((r) => setTimeout(r, ms));
      }
    }, pasos);
  }

  test('1362/1363 siguen cerrados: carrera de ondas a 0, 50, 100 y 150 ms, y tras Detener nada queda VIVO', async ({
    page,
  }) => {
    let arranques = 0;
    for (const ms of [0, 50, 100, 150]) {
      await botonReproducir(page).click();
      arranques++;
      await expect.poll(() => vivos(page)).toHaveLength(1);
      await dosOndas(page, 'Triangular', 'Cuadrada', ms);
      await expect(page.getByRole('button', { name: /Cuadrada/ })).toHaveAttribute('aria-pressed', 'true');
      await page.waitForTimeout(300);
      // Suena la onda marcada, sobre el mismo oscilador: uno creado por cada Reproducir.
      expect((await vivos(page)).map((o) => o.tipo), `intervalo ${ms} ms`).toEqual(['square']);
      expect(await osciladores(page), `intervalo ${ms} ms`).toHaveLength(arranques);

      await botonReproducir(page).click();
      await expect(botonReproducir(page)).toHaveAttribute('aria-label', PARADO);
      // El stop va a +0,1 s en el reloj de audio: el `ended` llega poco después.
      await expect.poll(() => vivos(page), { message: `intervalo ${ms} ms` }).toHaveLength(0);
      await page.getByRole('button', { name: /Senoidal/ }).click();
    }
  });

  test('ráfaga mixta de presets y ondas con el tono activo: un solo oscilador y suena lo último marcado', async ({
    page,
  }) => {
    await botonReproducir(page).click();
    await expect.poll(() => vivos(page)).toHaveLength(1);
    await rafaga(page, [
      ['La 432Hz', 5],
      ['Sierra', 5],
      ['La 415Hz', 5],
      ['Triangular', 5],
      ['La 466Hz', 5],
      ['Cuadrada', 5],
      ['La 443Hz', 300],
    ]);
    // Lo último marcado: Cuadrada y 443 Hz. 443 Hz = La4 + 1200·log2(443/440) = +11,76 → «+11,8 cents».
    expect(await vivos(page)).toEqual([{ tipo: 'square', frecuencia: 443 }]);
    expect(await osciladores(page)).toHaveLength(1);
    await expect(pantalla(page)).toHaveText('443');
    await expect(page.getByTestId('nota-cercana').locator('[class*="notaCents"]')).toHaveText('+11,8 cents');

    await botonReproducir(page).click();
    await expect.poll(() => vivos(page)).toHaveLength(0);
  });

  test('Reproducir/Detener en ráfaga: con clics impares queda uno vivo; con pares, ninguno', async ({
    page,
  }) => {
    // 3 clics (Reproducir, Detener, Reproducir) en 50 ms: el primero termina, el segundo suena.
    await rafaga(page, [
      ['PLAY', 30],
      ['PLAY', 20],
      ['PLAY', 0],
    ]);
    await expect.poll(() => vivos(page)).toHaveLength(1);
    await expect(botonReproducir(page)).toHaveAttribute('aria-label', SONANDO);
    // 7 clics más (10 en total, par): detenido y sin nada vivo.
    await rafaga(page, Array.from({ length: 7 }, (): [string, number] => ['PLAY', 5]));
    await expect(botonReproducir(page)).toHaveAttribute('aria-label', PARADO);
    await expect.poll(() => vivos(page)).toHaveLength(0);
  });

  test('etiqueta de nota: 432, 466, 500, 1.000 y 20 Hz, resueltos a mano', async ({ page }) => {
    const nota = page.getByTestId('nota-cercana');
    // n = 12·log2(f/440); nota = round(n) semitonos desde La4; cents = 100·(n − round(n)).
    const casos: [string, string, string, string][] = [
      ['432', 'La', 'A4', '−31,8 cents'], //    n = −0,3177 → La4, −31,77
      ['466', 'La♯', 'A♯4', '−0,6 cents'], //   n = +0,9939 → La♯4, −0,61
      ['500', 'Si', 'B4', '+21,3 cents'], //    n = +2,2131 → Si4 (493,88 Hz), +21,31
      ['1000', 'Si', 'B5', '+21,3 cents'], //   n = +14,2131 → Si5 (987,77 Hz), +21,31 (una octava más)
      ['20', 'Re♯', 'D♯0', '+48,7 cents'], //   n = −53,5132 → Re♯0 (19,45 Hz), +48,68
    ];
    for (const [entrada, nombre, cientifica, cents] of casos) {
      await page.locator(CAMPO).fill(entrada);
      await esperarValorEnReact(page, CAMPO, entrada);
      await expect(pantalla(page)).toHaveText(entrada);
      await expect(nota.locator('[class*="notaNombre"]'), `${entrada} Hz`).toHaveText(nombre);
      await expect(nota.locator('[class*="notaOctava"]'), `${entrada} Hz`).toHaveText(cientifica);
      await expect(nota.locator('[class*="notaCents"]'), `${entrada} Hz`).toHaveText(cents);
    }
  });

  test('tabla de afinaciones: cada fila da los cents que salen de su frecuencia', async ({ page }) => {
    // Esperados a mano, 1200·log2(f/440): 442 → +7,85 · 441 → +3,93 · 443 → +11,76 ·
    // 415 → −101,27 · 466 → +99,39 · 432 → −31,77 · 430,54 → −37,63.
    // REESCRITO el 24/09/2026: la última fila esperaba «430,5 Hz» y «−37,79 cents», que son los
    // cents de la frecuencia REDONDEADA (hallazgo 1512). El tono científico es Do4 = 256 Hz:
    // La4 = 256·2^(9/12) = 430,5390 Hz y 1200·log2(430,5390/440) = −37,6317 cents.
    const esperados: Record<string, string> = {
      '440,0 Hz': 'Referencia (0 cents)',
      '442,0 Hz': '+7,85 cents',
      '441,0 Hz': '+3,93 cents',
      '443,0 Hz': '+11,76 cents',
      '415,0 Hz': '−101,27 cents',
      '466,0 Hz': '+99,39 cents',
      '432,0 Hz': '−31,77 cents',
      '430,54 Hz': '−37,63 cents',
    };
    const filas = page.locator('table tbody tr');
    await expect(filas).toHaveCount(Object.keys(esperados).length);
    for (const [frecuencia, cents] of Object.entries(esperados)) {
      const fila = filas.filter({ hasText: frecuencia });
      await expect(fila.locator('td').nth(4), frecuencia).toContainText(cents);
    }
    // 415 Hz: algo MÁS de un semitono, no «casi».
    await expect(filas.filter({ hasText: '415,0 Hz' })).toContainText('algo más de un semitono');
  });

  test('móvil 375 px: sin scroll horizontal y los controles responden al toque', async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: { width: 375, height: 740 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const movil = await ctx.newPage();
    await movil.goto(RUTA);
    await esperarHidratacion(movil, [CAMPO]);
    const anchos = await movil.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(anchos.scroll).toBeLessThanOrEqual(anchos.cliente);

    await movil.getByRole('button', { name: /La 415Hz/ }).tap();
    await movil.getByRole('button', { name: /Cuadrada/ }).tap();
    await movil.getByRole('button', { name: /tono de referencia/ }).tap();
    await expect(movil.locator('[class*="frecuenciaNumero"]')).toHaveText('415');
    await expect(movil.getByRole('button', { name: /La 415Hz/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(movil.getByRole('button', { name: /Cuadrada/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(movil.getByRole('button', { name: /tono de referencia/ })).toHaveAttribute('aria-label', SONANDO);
    await ctx.close();
  });

  // ── HALLAZGOS 1508-1512, REPARADOS el 24/09/2026 ───────────────────────────────────────────
  // Eran test.fail() que documentaban cada defecto; se reescriben como regresión en verde.

  /**
   * Pulsa el botón principal y muestrea, desde la propia página, la ganancia del GainNode que ese
   * clic crea, en el reloj de audio, hasta `limite` segundos. El muestreo se arranca ANTES del
   * clic y espera al nodo nuevo; el clic es el de Playwright (un gesto de usuario real): con un
   * `element.click()` sintético, el AudioContext del primer arranque se quedaba suspendido y el
   * reloj no avanzaba.
   */
  async function arrancarYMuestrear(page: Page, limite: number): Promise<{ dt: number; valor: number }[]> {
    const muestreo = page.evaluate(async (hasta) => {
      const antes = window.__ganancias.length;
      for (let i = 0; i < 2000 && window.__ganancias.length === antes; i++) {
        await new Promise((r) => setTimeout(r, 1));
      }
      const g = window.__ganancias[antes];
      if (!g) return [];
      const muestras: { dt: number; valor: number }[] = [];
      for (let i = 0; i < 3000; i++) {
        const dt = g.ctx.currentTime - g.t0;
        muestras.push({ dt, valor: g.nodo.gain.value });
        if (dt > hasta) break;
        await new Promise((r) => setTimeout(r, 2));
      }
      return muestras;
    }, limite);
    await botonReproducir(page).click();
    return muestreo;
  }

  /** La rampa de entrada: de 0 al volumen (0,5) en 0,1 s, lineal y sin saltos. */
  function comprobarRampaDeEntrada(muestras: { dt: number; valor: number }[], etiqueta: string): void {
    // Solo cuentan las muestras con el reloj de audio ya en marcha (dt > 0): antes de que el hilo
    // de audio procese el primer cuanto, `gain.value` devuelve el valor por defecto del nodo (1),
    // no el programado. Medido el 24/09/2026: la muestra del instante del clic leía 1 aunque lo
    // primero programado sea setValueAtTime(0, t0); eso no llega a sonar.
    const validas = muestras.filter((m) => m.dt > 0);
    expect(validas.length, `${etiqueta}: hay muestras`).toBeGreaterThan(5);
    // Arranca desde abajo: la primera muestra rendida está en la rampa, no en el volumen. Se mide
    // contra la rampa EN SU INSTANTE (0,5 × dt / 0,1, con el margen de ±0,1 de abajo): la primera
    // muestra cae cada vez en un momento distinto, y un umbral fijo (< 0,15) fallaba 3 de cada 5
    // veces con la app correcta, a los 32 ms, donde la rampa vale 0,16 (suite del 25/09/2026). El
    // defecto sigue fallando: 0,5 al instante, o un salto a 0,5 a los 20 ms.
    const primera = validas[0];
    expect(primera.valor, `${etiqueta}: ganancia al arrancar (${primera.dt.toFixed(3)} s)`).toBeLessThan(
      Math.min(0.45, (0.5 * primera.dt) / 0.1 + 0.1),
    );
    // Nunca baja: una rampa de subida, sin escalones hacia atrás.
    for (let i = 1; i < validas.length; i++) {
      expect(validas[i].valor, `${etiqueta}: muestra ${i} a ${validas[i].dt.toFixed(3)} s`).toBeGreaterThanOrEqual(
        validas[i - 1].valor - 1e-6,
      );
    }
    // A mitad de rampa, lejos del 0,5: lineal, 0,5 × dt / 0,1 (±0,1 por el cuanto de 128 muestras).
    const enMitad = validas.filter((m) => m.dt >= 0.02 && m.dt <= 0.08);
    expect(enMitad.length, `${etiqueta}: muestras entre 20 y 80 ms`).toBeGreaterThan(0);
    for (const m of enMitad) {
      expect(m.valor, `${etiqueta}: ganancia a ${m.dt.toFixed(3)} s`).toBeLessThan(0.45);
      expect(Math.abs(m.valor - (0.5 * m.dt) / 0.1), `${etiqueta}: lineal a ${m.dt.toFixed(3)} s`).toBeLessThan(0.1);
    }
    // Y llega al volumen elegido.
    expect(muestras.at(-1)!.valor, `${etiqueta}: volumen final`).toBeCloseTo(0.5, 3);
  }

  test('1509 · la entrada del tono sube en rampa desde 0, en frío y en caliente', async ({ page }) => {
    // Antes, el efecto de volumen hacía setValueAtTime(volumen, currentTime) en cuanto
    // `reproduciendo` pasaba a true y pisaba la rampa: en caliente, 0,5 al instante; en frío, de
    // 0,10 a 0,50 de golpe a los ~20 ms. La metadata promete «rampa suave (sin clic)».
    comprobarRampaDeEntrada(await arrancarYMuestrear(page, 0.15), 'en frío');
    await botonReproducir(page).click();
    await expect.poll(() => vivos(page)).toHaveLength(0);
    comprobarRampaDeEntrada(await arrancarYMuestrear(page, 0.15), 'en caliente');
    await botonReproducir(page).click();
    await expect.poll(() => vivos(page)).toHaveLength(0);
  });

  test('1509 · mover el volumen con el tono sonando es una rampa, no un escalón', async ({ page }) => {
    await botonReproducir(page).click();
    await expect.poll(() => vivos(page)).toHaveLength(1);
    await page.waitForTimeout(300); // pasada la rampa de entrada: la ganancia está en 0,5
    // El muestreo corre en la página mientras Playwright pulsa Inicio en el deslizador (0,5 → 0).
    const muestreo = page.evaluate(async () => {
      const g = window.__ganancias.at(-1)!;
      const muestras: number[] = [];
      const t0 = g.ctx.currentTime;
      while (g.ctx.currentTime - t0 < 0.8) {
        muestras.push(g.nodo.gain.value);
        await new Promise((r) => setTimeout(r, 2));
      }
      return muestras;
    });
    await page.getByRole('slider', { name: 'Volumen' }).press('Home');
    const muestras = await muestreo;
    await expect(page.getByRole('slider', { name: 'Volumen' })).toHaveAttribute('aria-valuetext', '0 %');
    expect(muestras[0]).toBeCloseTo(0.5, 3);
    expect(muestras.at(-1)!).toBeCloseTo(0, 3);
    // Con un escalón no habría ningún valor intermedio; con la rampa de 50 ms hay varios.
    const intermedias = muestras.filter((v) => v > 0.05 && v < 0.45);
    expect(intermedias.length, `muestras: ${muestras.map((v) => v.toFixed(2)).join(' ')}`).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < muestras.length; i++) expect(muestras[i]).toBeLessThanOrEqual(muestras[i - 1] + 1e-6);
  });

  test('1510 · el botón principal cambia de nombre con el estado y NO lleva aria-pressed', async ({ page }) => {
    // WAI-ARIA APG, patrón Button: si el nombre de un conmutador cambia con su estado, no se
    // marca con aria-pressed. El nombre sigue al texto visible («Reproducir» / «Detener»).
    const boton = botonReproducir(page);
    await expect(boton).toHaveAccessibleName(PARADO);
    expect(await boton.getAttribute('aria-pressed')).toBeNull();
    await expect(boton).toContainText('Reproducir');
    await boton.click();
    await expect(boton).toHaveAccessibleName(SONANDO);
    expect(await boton.getAttribute('aria-pressed')).toBeNull();
    await expect(boton).toContainText('Detener');
    await boton.click();
    await expect(boton).toHaveAccessibleName(PARADO);
  });

  /** Contraste de la descripción del preset activo, con el fondo translúcido compuesto. */
  async function contrastePresetActivo(page: Page): Promise<number> {
    return page.evaluate(() => {
      const leer = (c: string) => {
        const p = (c.match(/rgba?\(([^)]+)\)/)?.[1] ?? '0,0,0').split(/[ ,/]+/).filter(Boolean).map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
      };
      type C = ReturnType<typeof leer>;
      const mezcla = (a: C, b: C): C => ({
        r: a.r * a.a + b.r * (1 - a.a),
        g: a.g * a.a + b.g * (1 - a.a),
        b: a.b * a.a + b.b * (1 - a.a),
        a: 1,
      });
      const lum = ({ r, g, b }: C) => {
        const f = (v: number) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const desc = document.querySelector('button[aria-pressed="true"] [class*="presetDesc"]');
      if (!desc) return 0;
      const capas: C[] = [];
      for (let e: Element | null = desc; e; e = e.parentElement) {
        const c = leer(getComputedStyle(e).backgroundColor);
        if (c.a > 0) {
          capas.push(c);
          if (c.a === 1) break;
        }
      }
      let fondo: C = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = capas.length - 1; i >= 0; i--) fondo = mezcla(capas[i], fondo);
      const texto = mezcla(leer(getComputedStyle(desc).color), fondo);
      const [l1, l2] = [lum(texto), lum(fondo)];
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    });
  }

  test('1511 · la descripción del preset activo pasa de 4,5:1 en oscuro y en claro', async ({ page }) => {
    // Antes: --text-muted #9B9B9B sobre rgb(45,54,58) = 4,45:1 en oscuro. Ahora --text-secondary:
    // #B0B0B0 → 5,70:1 en oscuro; #666666 sobre rgb(234,243,247) → 5,10:1 en claro.
    await page.addStyleTag({ content: '*{transition:none !important}' });
    const claro = await contrastePresetActivo(page);
    expect(claro, 'claro').toBeGreaterThanOrEqual(4.5);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const oscuro = await contrastePresetActivo(page);
    expect(oscuro, 'la medida tiene que existir').toBeGreaterThan(1);
    expect(oscuro, 'oscuro').toBeGreaterThanOrEqual(4.5);
  });

  test('1508 · la fila del 432 es el diapasón italiano de Verdi, y «natural» se atribuye al movimiento 432', async ({
    page,
  }) => {
    // Fuente: E. Lockhart, «Tuning Sounds in Italy, 1750–1885», Nineteenth-Century Music Review
    // 22 (2025), 344-360: Boito defendió A = 432 en el Congresso dei Musicisti Italiani (Milán,
    // 16-21/06/1881); un decreto del Ministerio de la Guerra de 1884 lo prescribió para «all
    // orchestral and military ensembles»; en 1885 el congreso de Viena votó el diapason normal
    // (435 Hz). El Schiller Institute lo promueve desde finales de los ochenta como «natural».
    const fila = page.locator('table tbody tr').filter({ hasText: '432,0 Hz' });
    const celdas = fila.locator('td');
    await expect(celdas.nth(0)).toHaveText('Diapasón italiano (Verdi)');
    await expect(celdas.nth(2)).toContainText('Milán, 1881');
    await expect(celdas.nth(2)).toContainText('Ministerio de la Guerra (1884)');
    await expect(celdas.nth(3)).toContainText('el movimiento «432 Hz», que lo llama «natural» sin base acústica');
    await expect(celdas.nth(4)).toHaveText('−31,77 cents');
    await expect(fila).not.toContainText('Natural');
    await expect(fila).not.toContainText('jazz');
    // El preset tampoco presenta «natural» como descripción del 432.
    const preset = page.getByRole('button', { name: /La 432Hz/ });
    await expect(preset).toContainText('Italia 1881-1884 · diapasón de Verdi');
    await expect(preset).not.toContainText('natural');
  });

  test('1512 · el tono científico (Do4 = 256 Hz) es La4 = 430,54 Hz y −37,63 cents, propuesto en 1713', async ({
    page,
  }) => {
    // Calculado, no copiado: 256 · 2^(9/12) = 430,5390 Hz; 1200 · log2(430,5390 / 440) = −37,6317.
    const la4 = 256 * 2 ** (9 / 12);
    expect(la4).toBeCloseTo(430.539, 3);
    expect(1200 * Math.log2(la4 / 440)).toBeCloseTo(-37.6317, 3);
    const fila = page.locator('table tbody tr').filter({ hasText: 'Científico' });
    const celdas = fila.locator('td');
    await expect(celdas.nth(1)).toHaveText('430,54 Hz');
    await expect(celdas.nth(4)).toHaveText('−37,63 cents');
    // Wikipedia, «Scientific pitch»: «first proposed in 1713 by French physicist Joseph Sauveur».
    await expect(celdas.nth(2)).toContainText('1713');
    await expect(fila).not.toContainText('Siglo XIX');
    await expect(fila).not.toContainText('−37,79');
  });
});

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * RE-INSPECCIÓN del 25/09/2026, tras 3c41c63e y 78876cf2.
 *
 * Aquí se registra CADA llamada que la app hace a una AudioParam (frecuencia y ganancia), a
 * start/stop del oscilador y a close() del contexto, con el reloj de audio del momento. Así se
 * comprueba el patrón de rampas tal como se programa (entrada, volumen y salida ANTES del stop),
 * no solo el valor que la ganancia tiene al muestrearla.
 *
 * Valores esperados, a mano (temperamento igual, La4 = 440 Hz; n = 12·log2(f/440) semitonos;
 * nota = la de round(n); cents = 1200·log2(f / f_nota)):
 *   · 452 Hz: n = 12·log2(1,027273) = +0,4658 → La4, 1200·log2(452/440) = +46,58 → «+46,6 cents».
 *   · 453 Hz: n = +0,5041 → La♯4 (440·2^(1/12) = 466,164 Hz), 1200·log2(453/466,164) = −49,59
 *     → «−49,6 cents». La frontera del cuarto de tono está en 440·2^(0,5/12) = 452,89 Hz.
 *   · 27,5 Hz = La0 (440/16), la tecla más grave del piano; 27 Hz = 1200·log2(27/27,5) = −31,77.
 * ─────────────────────────────────────────────────────────────────────────────
 */
interface Llamada {
  quien: string;
  metodo: string;
  args: number[];
  /** Reloj de audio (ctx.currentTime) en el instante de la llamada */
  ct: number;
}

declare global {
  interface Window {
    __llamadas: Llamada[];
  }
}

test.describe('Inspección 25/09/2026 — re-inspección 2: rampas programadas, deslizador, decimales y datos', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__llamadas = [];
      const dueno = new WeakMap<object, { id: string; ctx: BaseAudioContext }>();
      const proto = BaseAudioContext.prototype;
      const crearOsc = proto.createOscillator;
      const crearGan = proto.createGain;
      let nOsc = 0;
      let nGan = 0;
      proto.createOscillator = function (this: BaseAudioContext) {
        const nodo = crearOsc.call(this);
        const id = `osc${nOsc++}`;
        dueno.set(nodo, { id, ctx: this });
        dueno.set(nodo.frequency, { id: `${id}.frequency`, ctx: this });
        return nodo;
      };
      proto.createGain = function (this: BaseAudioContext) {
        const nodo = crearGan.call(this);
        const id = `gain${nGan++}`;
        dueno.set(nodo, { id, ctx: this });
        dueno.set(nodo.gain, { id: `${id}.gain`, ctx: this });
        return nodo;
      };
      const anotar = (obj: object, metodo: string, args: unknown[]): void => {
        const d = dueno.get(obj);
        if (!d) return;
        window.__llamadas.push({
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
      ]) {
        const original = param[metodo];
        param[metodo] = function (this: AudioParam, ...args: number[]) {
          anotar(this, metodo, args);
          return original.apply(this, args);
        };
      }
      const osc = OscillatorNode.prototype;
      const arrancar = osc.start;
      const parar = osc.stop;
      osc.start = function (this: OscillatorNode, ...args: [number?]) {
        anotar(this, 'start', args);
        return arrancar.apply(this, args);
      };
      osc.stop = function (this: OscillatorNode, ...args: [number?]) {
        anotar(this, 'stop', args);
        return parar.apply(this, args);
      };
      const cerrar = AudioContext.prototype.close;
      AudioContext.prototype.close = function (this: AudioContext) {
        window.__llamadas.push({ quien: 'ctx', metodo: 'close', args: [], ct: this.currentTime });
        return cerrar.call(this);
      };
    });
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO]);
  });

  const llamadas = (page: Page): Promise<Llamada[]> => page.evaluate(() => window.__llamadas);

  test('caso normal: Reproducir, volumen y Detener programan rampa de entrada, de volumen y de salida ANTES del stop', async ({
    page,
  }) => {
    const nota = page.getByTestId('nota-cercana');
    // 440 Hz = La4 exacto (0 cents).
    await expect(nota).toHaveText('LaA4afinada (0 cents)');

    await botonReproducir(page).click();
    await expect.poll(async () => (await sonando(page)).map((o) => o.frecuencia)).toEqual([440]);
    let log = await llamadas(page);
    // Frecuencia fijada en el reloj de audio antes de arrancar.
    const freq = log.find((l) => l.quien === 'osc0.frequency' && l.metodo === 'setValueAtTime');
    expect(freq?.args[0]).toBe(440);
    // Entrada: setValueAtTime(0, t0) y linearRamp(0,5, t0 + 0,1); el start, después.
    const iAncla = log.findIndex((l) => l.quien === 'gain0.gain' && l.metodo === 'setValueAtTime');
    const iRampa = log.findIndex((l) => l.quien === 'gain0.gain' && l.metodo === 'linearRampToValueAtTime');
    const iStart = log.findIndex((l) => l.quien === 'osc0' && l.metodo === 'start');
    expect(log[iAncla].args[0], 'la entrada parte de 0').toBe(0);
    expect(log[iRampa].args[0], 'hasta el volumen (50 %)').toBeCloseTo(0.5, 6);
    expect(log[iRampa].args[1] - log[iAncla].args[1], 'rampa de entrada de 0,1 s').toBeCloseTo(0.1, 6);
    expect(iAncla).toBeLessThan(iStart);
    expect(iRampa).toBeLessThan(iStart);

    // Volumen con el tono sonando (0,50 → 0,49): cancelar, anclar en el valor en curso y rampa de 0,05 s.
    await page.waitForTimeout(250); // pasada la rampa de entrada
    let desde = (await llamadas(page)).length;
    await page.getByRole('slider', { name: 'Volumen' }).press('ArrowLeft');
    await expect(page.getByRole('slider', { name: 'Volumen' })).toHaveAttribute('aria-valuetext', '49 %');
    await expect.poll(async () => (await llamadas(page)).length).toBeGreaterThan(desde + 2);
    log = (await llamadas(page)).slice(desde);
    expect(log.map((l) => l.metodo)).toEqual(['cancelScheduledValues', 'setValueAtTime', 'linearRampToValueAtTime']);
    expect(log[1].args[0], 'anclada en el valor en curso').toBeCloseTo(0.5, 3);
    expect(log[2].args[0]).toBeCloseTo(0.49, 6);
    expect(log[2].args[1] - log[1].args[1], 'rampa de volumen de 0,05 s').toBeCloseTo(0.05, 6);

    // Detener: rampa a 0 anclada en el valor en curso y el stop en el mismo instante en que acaba.
    await page.waitForTimeout(150);
    desde = (await llamadas(page)).length;
    await botonReproducir(page).click();
    await expect(botonReproducir(page)).toHaveAttribute('aria-label', PARADO);
    log = (await llamadas(page)).slice(desde);
    expect(log.map((l) => `${l.quien}.${l.metodo}`)).toEqual([
      'gain0.gain.cancelScheduledValues',
      'gain0.gain.setValueAtTime',
      'gain0.gain.linearRampToValueAtTime',
      'osc0.stop',
    ]);
    expect(log[1].args[0], 'anclada en 0,49').toBeCloseTo(0.49, 3);
    expect(log[2].args[0]).toBe(0);
    expect(log[2].args[1] - log[1].args[1], 'rampa de salida de 0,1 s').toBeCloseTo(0.1, 6);
    expect(log[3].args[0], 'stop al final de la rampa, en el reloj de audio').toBeCloseTo(log[2].args[1], 6);
  });

  test('caso normal: el preset 415 con el tono sonando retoca la frecuencia; la nota es Sol♯4 −1,3 cents', async ({
    page,
  }) => {
    await botonReproducir(page).click();
    await expect.poll(async () => (await sonando(page)).map((o) => o.frecuencia)).toEqual([440]);
    await page.getByRole('button', { name: /La 415Hz/ }).click();
    // 1200·log2(415/440) = −101,27 cents del La4: la temperada más cercana es Sol♯4 = 415,305 Hz,
    // de la que 415 Hz dista 1200·log2(415/415,305) = −1,27 → «−1,3 cents».
    await expect(page.getByTestId('nota-cercana')).toHaveText('Sol♯G♯4−1,3 cents');
    await expect.poll(async () => (await sonando(page)).map((o) => o.frecuencia)).toEqual([415]);
    const cambio = (await llamadas(page)).filter((l) => l.quien === 'osc0.frequency').at(-1);
    expect(cambio?.metodo).toBe('setValueAtTime');
    expect(cambio?.args[0]).toBe(415);
  });

  test('caso límite: 452 Hz es La4 +46,6 cents y 453 Hz ya es La♯4 −49,6 cents (frontera en 452,89 Hz)', async ({
    page,
  }) => {
    await botonReproducir(page).click();
    const nota = page.getByTestId('nota-cercana');
    const casos: [string, string][] = [
      ['452', 'LaA4+46,6 cents'], // n = +0,4658 → La4; 1200·log2(452/440) = +46,58
      ['453', 'La♯A♯4−49,6 cents'], // n = +0,5041 → La♯4 (466,164 Hz); 1200·log2(453/466,164) = −49,59
    ];
    for (const [entrada, texto] of casos) {
      await page.locator(CAMPO).fill(entrada);
      await esperarValorEnReact(page, CAMPO, entrada);
      await expect(pantalla(page)).toHaveText(entrada);
      await expect(nota, `${entrada} Hz`).toHaveText(texto);
      await expect.poll(async () => (await sonando(page)).map((o) => o.frecuencia)).toEqual([Number(entrada)]);
    }
  });

  test('caso de rechazo: 19 → 20 y 2001 → 2000 al salir del campo; texto tecleado vuelve a 440', async ({
    page,
  }) => {
    const campo = page.locator(CAMPO);
    await botonReproducir(page).click();
    // 19 está fuera (mínimo 20): mientras se escribe no cambia lo que suena; al salir, se recorta.
    await page.getByRole('button', { name: /La 442Hz/ }).click();
    await campo.fill('19');
    await expect(pantalla(page), 'mientras se escribe, sigue el 442').toHaveText('442');
    await campo.blur();
    await esperarValorEnReact(page, CAMPO, '20');
    await expect(pantalla(page)).toHaveText('20');
    await expect.poll(async () => (await sonando(page)).map((o) => o.frecuencia)).toEqual([20]);

    await campo.fill('2001');
    await expect(pantalla(page)).toHaveText('20');
    await campo.blur();
    await esperarValorEnReact(page, CAMPO, '2000');
    await expect(pantalla(page)).toHaveText('2000');
    await expect.poll(async () => (await sonando(page)).map((o) => o.frecuencia)).toEqual([2000]);

    // Letras tecleadas en un campo numérico: el navegador deja el valor vacío → el La estándar.
    await page.getByRole('button', { name: /La 442Hz/ }).click();
    await campo.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('abc');
    await campo.blur();
    await esperarValorEnReact(page, CAMPO, '440');
    await expect(pantalla(page)).toHaveText('440');
    await expect.poll(async () => (await sonando(page)).map((o) => o.frecuencia)).toEqual([440]);
  });

  /**
   * Lo que un lector de pantalla anuncia para el deslizador de frecuencia, o null si no está
   * visible. aria-valuetext manda sobre el número (WAI-ARIA 1.2); sin él, un <input type="range">
   * anuncia su valor del DOM, ya recortado a [min, max]. Medido el 25/09/2026 en el árbol de
   * accesibilidad de Chrome (CDP, Accessibility.getFullAXTree) con 1.000 Hz sonando: value 480,
   * valuetext «480». Ojo: ese árbol NO refleja aria-valuetext en un range nativo (muestra el valor
   * del DOM también con el atributo puesto), por eso aquí se lee el atributo.
   */
  async function valorAccesibleDeslizador(page: Page): Promise<string | null> {
    const deslizador = page.locator('input[type="range"]:not([aria-label="Volumen"])');
    if ((await deslizador.count()) === 0 || !(await deslizador.first().isVisible())) return null;
    const primero = deslizador.first();
    return (
      (await primero.getAttribute('aria-valuetext')) ??
      (await primero.getAttribute('aria-valuenow')) ??
      (await primero.inputValue())
    );
  }

  /*
   * HALLAZGO REPARADO el 25/09/2026 (ronda 15; antes test.fail). Acta original (25/09/2026, sospecha confirmada). El deslizador de frecuencia va de 400 a 480; con
   * una frecuencia fuera de ese rango, el <input type="range"> recorta su valor al extremo y no
   * lleva aria-valuetext: con 1.000 Hz sonando, el lector de pantalla anuncia «480» (medido en
   * el árbol de accesibilidad de Chrome: value 480, valuetext «480»); con 20 Hz, «400». Además,
   * End o → no hacen nada (el DOM ya está en 480) y ← salta de 1.000 a 479 Hz.
   * Correcto: si el deslizador se expone, su valor accesible dice la frecuencia que suena.
   */
  test('1729 · con 1.000 Hz sonando, el deslizador de frecuencia no anuncia 480', async ({ page }) => {
    await page.locator(CAMPO).fill('1000');
    await esperarValorEnReact(page, CAMPO, '1000');
    await botonReproducir(page).click();
    await expect.poll(async () => (await sonando(page)).map((o) => o.frecuencia)).toEqual([1000]);
    const valor = await valorAccesibleDeslizador(page);
    if (valor !== null) {
      expect(valor, 'suena 1.000 Hz').toMatch(/1\.?000/);
    }
    await page.locator(CAMPO).fill('20');
    await esperarValorEnReact(page, CAMPO, '20');
    const valor20 = await valorAccesibleDeslizador(page);
    if (valor20 !== null) {
      expect(valor20, 'suena 20 Hz').toMatch(/\b20\b/);
    }
  });

  /*
   * HALLAZGO REPARADO el 25/09/2026 (ronda 15; antes test.fail). Acta original (25/09/2026). El campo lee con parseInt: los decimales se TRUNCAN (no se redondean,
   * aunque aplicarFrecuencia redondea), y el navegador sí acepta «27,5» y lo entrega como «27.5».
   * 27,5 Hz es el La0, la tecla más grave del piano: suena 27 Hz, 1200·log2(27/27,5) = −31,8 cents
   * (la propia etiqueta lo delata: «La A0 −31,8 cents»). 440,9 → 440 en vez de 441.
   * Correcto: suena el valor pedido o, si la app solo admite enteros, el entero más cercano.
   */
  test('1733 · 27,5 Hz (La0) no se trunca a 27 Hz, ni 440,9 a 440', async ({ page }) => {
    await botonReproducir(page).click();
    const campo = page.locator(CAMPO);
    const casos: [string, number, number][] = [
      ['27.5', 27.5, 28], // La0 = 440/16 = 27,5 Hz; redondeado, 28
      ['440.9', 440.9, 441], // redondeado, 441
    ];
    for (const [entrada, exacto, redondeado] of casos) {
      await page.getByRole('button', { name: /La 442Hz/ }).click();
      await expect.poll(async () => (await sonando(page))[0]?.frecuencia).toBe(442);
      await campo.fill(entrada);
      await campo.blur();
      // Se sondea hasta que suene uno de los dos valores aceptables (partiendo de 442, que no lo es).
      await expect
        .poll(
          async () => {
            // AudioParam guarda float32: 440,9 se lee como 440,8999938964844. Se compara a la
            // centésima, que es la precisión con la que la app fija la frecuencia.
            const f = (await sonando(page))[0]?.frecuencia;
            return `${f === undefined ? f : Math.round(f * 100) / 100} Hz`;
          },
          { message: `campo «${entrada}»: debe sonar ${exacto} o ${redondeado} Hz`, timeout: 2000 },
        )
        .toMatch(new RegExp(`^(${String(exacto).replace('.', '\\.')}|${redondeado}) Hz$`));
    }
    // La pantalla lo dice en formato español y la nota es el La0 exacto: 440/16 = 27,5 Hz.
    await campo.fill('27.5');
    await campo.blur();
    await expect(pantalla(page)).toHaveText('27,5');
    await expect(page.getByTestId('nota-cercana')).toHaveText('LaA0afinada (0 cents)');
  });

  /*
   * HALLAZGO REPARADO el 25/09/2026 (ronda 15; antes test.fail). Acta original (25/09/2026). Al desmontar la página con el tono sonando (clic en una app
   * relacionada: navegación de cliente), el efecto de limpieza hace oscillator.stop() sin
   * argumento y audioContext.close() en el mismo instante, sin ninguna rampa sobre la ganancia:
   * el tono se corta en seco desde 0,5, el chasquido que Detener sí evita.
   * Correcto: una rampa de la ganancia a 0 antes de parar el oscilador o cerrar el contexto.
   */
  test('1730 · salir a otra app con el tono sonando hace rampa de salida antes de cortar', async ({ page }) => {
    await botonReproducir(page).click();
    await expect.poll(async () => (await sonando(page)).map((o) => o.frecuencia)).toEqual([440]);
    await page.waitForTimeout(300); // pasada la rampa de entrada: la ganancia está en 0,5
    const desde = (await llamadas(page)).length;
    await page.locator('a[href*="/afinador-instrumentos/"]').first().click();
    await page.waitForURL(/afinador-instrumentos/);
    await page.waitForTimeout(500);
    const log = (await llamadas(page)).slice(desde);
    const iCorte = log.findIndex((l) => (l.quien === 'osc0' && l.metodo === 'stop') || l.metodo === 'close');
    expect(iCorte, `llamadas: ${JSON.stringify(log)}`).toBeGreaterThanOrEqual(0);
    const iRampa = log.findIndex(
      (l) =>
        l.quien === 'gain0.gain' &&
        ((l.metodo === 'linearRampToValueAtTime' && l.args[0] === 0) || (l.metodo === 'setTargetAtTime' && l.args[0] === 0)),
    );
    expect(iRampa, `rampa a 0 antes del corte · llamadas: ${JSON.stringify(log)}`).toBeGreaterThanOrEqual(0);
    expect(iRampa).toBeLessThan(iCorte);
  });

  /*
   * HALLAZGO REPARADO el 25/09/2026 (ronda 15; antes test.fail). Acta original (25/09/2026, sospecha confirmada con fuentes consultadas en sesión). La fila
   * «Europeo alto · 442,0 Hz» pone como usuarias a las «Orquestas de Viena, Berlín». La
   * Filarmónica de Viena afina a 443 Hz: en.wikipedia «Vienna Philharmonic» («The orchestra's
   * standard tuning pitch is A4=443 Hz», citando wienerphilharmoniker.at, «Viennese Sound»);
   * de.wikipedia «Kammerton» («2016 wird allerdings auch bei den Wiener Philharmonikern auf
   * 443 Hz (+12 Cent) eingestimmt», citando a C. Hellsberg, «Gedanken zum Stimmton», Bühne 9/2016;
   * antes, 444-445 Hz). Y Berlín sale a la vez en la fila de 442 y en la de 443.
   */
  test('1731 · la tabla no pone a Viena en 442 Hz', async ({ page }) => {
    const fila442 = page.locator('table tbody tr').filter({ hasText: '442,0 Hz' });
    await expect(fila442).toHaveCount(1);
    await expect(fila442).not.toContainText('Viena');
  });

  /*
   * HALLAZGO REPARADO el 25/09/2026 (ronda 15; antes test.fail). Acta original (25/09/2026). El escenario «Afinar guitarra acústica» dice: genera el La4 a 440 Hz,
   * toca la cuerda La (5ª) «y ajusta la clavija hasta que ambos tonos suenen igual». La 5ª cuerda
   * al aire es La2 = 110 Hz (en.wikipedia «Guitar tunings», afinación estándar: «5 (A) | 110.00 Hz
   * | A2»), dos octavas por debajo: nunca «suenan igual». Se compara con su armónico del traste 5
   * (4 × 110 = 440 Hz) o se genera 110 Hz, que el campo libre admite.
   * Correcto: el escenario menciona los 110 Hz, el armónico o la diferencia de octavas.
   */
  test('1732 · el escenario de guitarra no manda igualar la 5ª cuerda al aire con 440 Hz', async ({ page }) => {
    const tarjeta = page.locator('[class*="escenarioCard"]').filter({ hasText: 'Afinar guitarra acústica' });
    await expect(tarjeta).toHaveCount(1);
    await expect(tarjeta).toContainText(/110 Hz|armónico|octava/);
  });

  test('móvil 390 px: sin scroll horizontal, y lo que suena es lo que se toca (415, triangular, 452)', async ({
    browser,
  }) => {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    const movil = await ctx.newPage();
    await instrumentarAudio(movil);
    await movil.goto(RUTA);
    await esperarHidratacion(movil, [CAMPO]);
    const anchos = await movil.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(anchos.scroll).toBeLessThanOrEqual(anchos.cliente);

    await movil.getByRole('button', { name: /La 415Hz/ }).tap();
    await movil.getByRole('button', { name: /Triangular/ }).tap();
    await movil.getByRole('button', { name: /tono de referencia/ }).tap();
    await expect.poll(async () => (await sonando(movil)).map((o) => [o.tipo, o.frecuencia])).toEqual([['triangle', 415]]);
    await movil.locator(CAMPO).tap();
    await movil.locator(CAMPO).fill('452');
    await esperarValorEnReact(movil, CAMPO, '452');
    // 452 Hz: La4 +46,58 cents (a mano, arriba).
    await expect(movil.getByTestId('nota-cercana')).toHaveText('LaA4+46,6 cents');
    await expect.poll(async () => (await sonando(movil)).map((o) => [o.tipo, o.frecuencia])).toEqual([['triangle', 452]]);
    await movil.getByRole('button', { name: /tono de referencia/ }).tap();
    await expect.poll(() => sonando(movil)).toHaveLength(0);
    await ctx.close();
  });
});
