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

test('dos cambios de onda seguidos no dejan un oscilador huérfano sonando tras Detener', async ({
  page,
}) => {
  // HALLAZGO del Inspector (24/09/2026): cambiar de onda mientras suena hace
  // detenerAudio() + setTimeout(iniciarAudio, 150). Si se pulsa otra onda antes de ~50 ms
  // se programan DOS arranques y el primero pierde su referencia: queda un oscilador
  // triangular con ganancia 0,5 que ni «Detener» ni los presets alcanzan. Medido:
  // Senoidal → Triangular → Cuadrada → Detener deja sonando [triangle a 440 Hz].
  test.fail();
  await botonReproducir(page).click();
  await expect.poll(() => sonando(page)).toHaveLength(1);

  // Los dos clics desde el propio navegador con 20 ms entre ellos: el hueco se abre con
  // cualquier intervalo por debajo de ~50 ms (el segundo temporizador de parada llega antes
  // que el primer arranque y no encuentra nada que parar). En la MISMA tarea no vale: React
  // agrupa los dos cambios de estado en uno y el defecto no se ve.
  await page.evaluate(async () => {
    const boton = (t: string) =>
      [...document.querySelectorAll('button')].find((b) => b.textContent?.includes(t));
    boton('Triangular')?.click();
    await new Promise((r) => setTimeout(r, 20));
    boton('Cuadrada')?.click();
  });
  await expect(page.getByRole('button', { name: /Cuadrada/ })).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(600);
  expect((await sonando(page)).map((o) => o.tipo)).toEqual(['square']);

  await botonReproducir(page).click();
  await expect(botonReproducir(page)).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => sonando(page), { timeout: 2000 }).toHaveLength(0);
});
