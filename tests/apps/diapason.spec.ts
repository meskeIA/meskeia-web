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
