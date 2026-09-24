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
  await expect(botonReproducir(page)).toHaveAttribute('aria-pressed', 'true');

  await expect.poll(() => sonando(page)).toHaveLength(1);
  const [osc] = await sonando(page);
  expect(osc.tipo).toBe('sine');
  // Un semitono son ~6 %: con precisión de 0,01 Hz cualquier desvío musical se ve.
  expect(osc.frecuencia).toBeCloseTo(440, 2);

  await botonReproducir(page).click();
  await expect(botonReproducir(page)).toHaveAttribute('aria-pressed', 'false');
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
  await expect(botonReproducir(page)).toHaveAttribute('aria-pressed', 'false');
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
      await expect(botonReproducir(page)).toHaveAttribute('aria-pressed', 'false');
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
    await expect(botonReproducir(page)).toHaveAttribute('aria-pressed', 'true');
    // 7 clics más (10 en total, par): detenido y sin nada vivo.
    await rafaga(page, Array.from({ length: 7 }, (): [string, number] => ['PLAY', 5]));
    await expect(botonReproducir(page)).toHaveAttribute('aria-pressed', 'false');
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
    // 415 → −101,27 · 466 → +99,39 · 432 → −31,77 · 430,5 → −37,79.
    const esperados: Record<string, string> = {
      '440,0 Hz': 'Referencia (0 cents)',
      '442,0 Hz': '+7,85 cents',
      '441,0 Hz': '+3,93 cents',
      '443,0 Hz': '+11,76 cents',
      '415,0 Hz': '−101,27 cents',
      '466,0 Hz': '+99,39 cents',
      '432,0 Hz': '−31,77 cents',
      '430,5 Hz': '−37,79 cents',
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
    await expect(movil.getByRole('button', { name: /tono de referencia/ })).toHaveAttribute('aria-pressed', 'true');
    await ctx.close();
  });

  test('HALLAZGO abierto: la entrada del tono no tiene rampa (salta a la ganancia de golpe)', async ({
    page,
  }) => {
    // HALLAZGO abierto: iniciarAudio programa 0 → volumen en 0,1 s, pero el efecto de volumen
    // hace setValueAtTime(volumen, currentTime) en cuanto `reproduciendo` pasa a true y pisa la
    // rampa. La metadata promete «Control de volumen con rampa suave (sin clic ni artefactos de
    // audio)». Con la rampa lineal, a los 30-80 ms la ganancia vale entre 0,15 y 0,40 (volumen 0,5).
    // Medido: en caliente el salto a 0,5 es inmediato (mismo currentTime que la rampa); en frío,
    // a los ~20 ms (de 0,10 a 0,50 de golpe). Por eso se mide el SEGUNDO arranque, y desde 30 ms.
    test.fail();
    await botonReproducir(page).click();
    await expect.poll(() => vivos(page)).toHaveLength(1);
    await botonReproducir(page).click();
    await expect.poll(() => vivos(page)).toHaveLength(0);
    await botonReproducir(page).click();
    const muestra = await page.evaluate(async () => {
      const g = window.__ganancias.at(-1);
      if (!g) return null;
      for (let i = 0; i < 500; i++) {
        const dt = g.ctx.currentTime - g.t0;
        if (dt >= 0.03 && dt <= 0.08) return { dt, valor: g.nodo.gain.value };
        if (dt > 0.08) break;
        await new Promise((r) => setTimeout(r, 2));
      }
      return null;
    });
    // Sin muestra en la ventana, el test no puede medir nada: eso NO es el hallazgo.
    expect(muestra, 'muestra de ganancia entre 30 y 80 ms').not.toBeNull();
    expect(muestra!.valor, `ganancia a ${muestra!.dt.toFixed(3)} s del arranque`).toBeLessThan(0.45);
  });

  test('HALLAZGO abierto: el botón principal cambia de nombre Y lleva aria-pressed', async ({ page }) => {
    // HALLAZGO abierto: «Reproducir tono de referencia» sin pulsar y «Detener tono de referencia»
    // [pressed] sonando. WAI-ARIA APG (Button pattern): el nombre de un botón conmutador no debe
    // cambiar con su estado; si cambia, no lleva aria-pressed. Vale cualquiera de las dos salidas.
    test.fail();
    const boton = botonReproducir(page);
    const nombreParado = await boton.getAttribute('aria-label');
    await boton.click();
    await expect(boton).toHaveAttribute('aria-label', /tono de referencia/);
    await page.waitForTimeout(200);
    const nombreSonando = await boton.getAttribute('aria-label');
    const pulsado = await boton.getAttribute('aria-pressed');
    expect(
      pulsado === null || nombreParado === nombreSonando,
      `parado «${nombreParado}», sonando «${nombreSonando}» con aria-pressed=${pulsado}`,
    ).toBe(true);
  });

  test('HALLAZGO abierto: en oscuro la descripción del preset activo queda bajo 4,5:1', async ({ page }) => {
    // HALLAZGO abierto: .presetDesc (12,8 px, peso 400) usa --text-muted (#9b9b9b en oscuro) sobre
    // el fondo del preset activo, rgba(46,134,171,0,1) compuesto sobre --bg-card: 4,45:1 medido.
    // Texto pequeño exige 4,5:1 (WCAG 1.4.3). En claro da 4,53:1 y los presets inactivos, 6,26:1.
    test.fail();
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.waitForTimeout(600); // transition: all 0.2s de los presets
    const ratio = await page.evaluate(() => {
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
    expect(ratio, 'la medida tiene que existir').toBeGreaterThan(1);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO abierto: la fila «Verdi / Natural» mezcla el 432 histórico de Verdi con la etiqueta «natural»', async ({
    page,
  }) => {
    // HALLAZGO abierto: el 432 de Verdi es histórico (Congresso dei Musicisti Italiani, Milán, 1881;
    // decreto del Ministerio de la Guerra italiano de 1884; E. Lockhart, «Tuning Sounds in Italy,
    // 1750–1885», Nineteenth-Century Music Review 22, 2025). «Natural» es la etiqueta moderna del
    // movimiento 432 (Schiller Institute, 1988, «Verdi tuning» derivada de Do = 256 Hz), que la
    // propia FAQ de la página llama mito. La fila nombra el estándar «Verdi / Natural».
    test.fail();
    const celda = page.locator('table tbody tr').filter({ hasText: '432,0 Hz' }).locator('td').first();
    await expect(celda).toContainText('Verdi');
    await expect(celda).not.toContainText('Natural', { timeout: 1000 });
  });

  test('HALLAZGO abierto: el tono científico (Do4 = 256 Hz) es La4 = 430,54 Hz, −37,63 cents', async ({
    page,
  }) => {
    // HALLAZGO abierto: 256 · 2^(9/12) = 430,54 Hz → 1200·log2(430,54/440) = −37,63 cents
    // (Wikipedia, «Scientific pitch»: «~37.63 cents lower than A440», A4 = 430.54 Hz). La tabla
    // redondea a 430,5 Hz y da los cents de ese redondeo con dos decimales: −37,79.
    test.fail();
    const fila = page.locator('table tbody tr').filter({ hasText: 'Científico' });
    await expect(fila).toContainText('−37,63', { timeout: 1000 });
  });
});
