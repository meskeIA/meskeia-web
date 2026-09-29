import { test, expect, devices, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Generador de Tonos — medidor de frecuencia, RE-INSPECCIÓN del Inspector (29/09/2026).
 *
 * La inspección del 27/09 quedó invalidada por ce2dfa44 (el medidor con el micrófono, S0170).
 * Estos casos NO repiten los de generador-tonos-medidor.spec.ts (1.000 Hz, ruido, permiso
 * denegado, «Reproducir para el medidor»), que meten la señal SUSTITUYENDO getUserMedia por un
 * oscilador de Web Audio. Aquí el tono entra por el camino de verdad: el micrófono falso de
 * Chromium (`--use-fake-device-for-media-stream`) leyendo un WAV que escribe este mismo fichero
 * (PCM 16 bits, 48 kHz, mono, senoide pura de 432 Hz, 2 s = 864 ciclos exactos, así que el
 * bucle del dispositivo no mete ningún salto). Pasa por getUserMedia con sus restricciones, por
 * el remuestreo del dispositivo (medido: el AudioContext va a 44,1 o a 48 kHz según cómo arranque
 * Chromium) y por el MediaStreamSource de la app. Y se comprueba que el micrófono arranca DE
 * VERDAD: pista «live» del dispositivo falso, no un elemento en pantalla.
 *
 * El tono de 432 Hz se eligió porque cae A MITAD DE BIN con las dos frecuencias de muestreo
 * habituales (FFT de 16.384): 432·16384/44100 = 160,50 bins y 432·16384/48000 = 147,46 bins.
 * Sin el afinado entre bins, la cifra sería la de un bin vecino, a 1,3-1,5 Hz.
 *
 * Los tres casos, resueltos a mano ANTES de ejecutar (La4 = 440 Hz, n = round(12·log2(f/440)),
 * cents = 1200·log2(f/f_nota)):
 *   1. NORMAL (escritorio y móvil): 432 Hz → n = round(12·log2(432/440)) = round(−0,318) = 0 → La4;
 *      cents = 1200·log2(432/440) = −31,77 → «La4 (−32 cents)», «432 Hz», «Lectura estable».
 *   2. LÍMITE: el tono por debajo de 20 Hz, en generador-tonos-medidor-grave.spec.ts (otro WAV
 *      obliga a otro fichero: los launchOptions son por fichero).
 *   3. RECHAZO: el medidor no puede escuchar mientras suena el propio generador. Con el tono o el
 *      barrido sonando, «Medir la frecuencia» los calla (pasa). Pero si se pulsa «Reproducir»
 *      mientras el navegador aún está abriendo el micrófono, los dos quedan activos a la vez
 *      (HALLAZGO M2, id 2413, REPARADO el 29/09/2026).
 * Más la SOSPECHA del 28/09 (type="number" + parseSpanishNumber): aquí no se da.
 */

const RUTA = '/generador-tonos/';
const CAMPO_FRECUENCIA = 'input[aria-label="Frecuencia en Hz"]';

/** WAV PCM 16 bits, mono, 48 kHz: senoide pura de `hz` (entero: ciclos exactos en `segundos`). */
function escribirWav(ruta: string, hz: number, segundos = 2, amplitud = 0.5): void {
  const tasa = 48000;
  const muestras = tasa * segundos;
  const b = Buffer.alloc(44 + muestras * 2);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + muestras * 2, 4);
  b.write('WAVE', 8);
  b.write('fmt ', 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); // PCM
  b.writeUInt16LE(1, 22); // mono
  b.writeUInt32LE(tasa, 24);
  b.writeUInt32LE(tasa * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write('data', 36);
  b.writeUInt32LE(muestras * 2, 40);
  for (let i = 0; i < muestras; i++) {
    b.writeInt16LE(Math.round(amplitud * 32767 * Math.sin((2 * Math.PI * hz * i) / tasa)), 44 + i * 2);
  }
  writeFileSync(ruta, b);
}

const WAV_432 = join(tmpdir(), 'meskeia-generador-tonos-432hz.wav');
escribirWav(WAV_432, 432);

test.use({
  launchOptions: {
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-audio-capture=${WAV_432}`,
      '--autoplay-policy=no-user-gesture-required',
    ],
  },
  permissions: ['microphone'],
});

type VentanaVigilada = Window & { __pistasMedidor?: MediaStreamTrack[] };

/**
 * Deja a la vista las pistas que devuelve getUserMedia, SIN sustituirlas: el audio es el del
 * dispositivo falso. Con `retrasoMs`, el micrófono tarda en abrirse lo que tardaría un usuario
 * en aceptar el aviso de permiso.
 */
async function vigilarMicrofono(page: Page, retrasoMs = 0) {
  await page.addInitScript((ms: number) => {
    const w = window as VentanaVigilada;
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    w.__pistasMedidor = [];
    navigator.mediaDevices.getUserMedia = async (restricciones?: MediaStreamConstraints) => {
      if (ms > 0) await new Promise((r) => setTimeout(r, ms));
      const stream = await original(restricciones);
      w.__pistasMedidor?.push(...stream.getAudioTracks());
      return stream;
    };
  }, retrasoMs);
}

async function pistas(page: Page) {
  return page.evaluate(() =>
    ((window as VentanaVigilada).__pistasMedidor ?? []).map((p) => ({ estado: p.readyState, etiqueta: p.label })),
  );
}

async function abrir(page: Page) {
  await page.goto(RUTA);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA]);
}

const seccion = (page: Page) => page.locator('#medir-frecuencia');
const botonMedidor = (page: Page) => page.getByRole('button', { name: /Medir la frecuencia|Dejar de medir/ });
const botonTono = (page: Page) => page.getByRole('button', { name: /^(Reproducir|Detener)$/ });
const botonBarrido = (page: Page) => page.getByRole('button', { name: /Iniciar barrido|Detener barrido/ });

/** «432 Hz», «18,8 Hz» → número (coma decimal, espacio normal o duro). */
function hzDe(texto: string): number {
  const m = texto.replace(/ /g, ' ').match(/([\d.,]+)\s*Hz/);
  if (!m) throw new Error(`sin cifra en hercios: «${texto}»`);
  return Number(m[1].replace(/\./g, '').replace(',', '.'));
}

/** «La4 (−32 cents)» → { nota: 'La4', cents: −32 } (el signo menos de la app es U+2212). */
function notaDe(texto: string): { nota: string; cents: number } {
  const m = texto.replace(/ /g, ' ').match(/^(\S+) \(([+−-]?\d+) cents\)$/);
  if (!m) throw new Error(`sin nota: «${texto}»`);
  return { nota: m[1], cents: Number(m[2].replace('−', '-')) };
}

async function lecturaEnVivo(page: Page) {
  const s = seccion(page);
  return {
    cifra: (await s.locator('[class*="medidorCifra"]').textContent()) ?? '',
    nota: (await s.locator('[class*="medidorNota"]').textContent()) ?? '',
  };
}

/**
 * La tolerancia es la promesa de la propia app («el error queda por debajo de un hercio»):
 * 432 ± 1 Hz → entre 1200·log2(431/440) = −35,8 y 1200·log2(433/440) = −27,8 cents, así que los
 * cents redondeados van de −35 a −28. Sin el afinado entre bins la lectura sería 430,66 Hz
 * (−37 cents) o 433,36 Hz (−26 cents) a 44,1 kHz: fuera por los dos lados.
 */
async function comprobar432(page: Page) {
  const s = seccion(page);
  await expect(s.getByText('Lectura estable', { exact: true })).toBeVisible({ timeout: 6000 });
  const { cifra, nota } = await lecturaEnVivo(page);
  const hz = hzDe(cifra);
  expect(hz, `cifra «${cifra}»`).toBeGreaterThanOrEqual(431);
  expect(hz, `cifra «${cifra}»`).toBeLessThanOrEqual(433);
  const n = notaDe(nota);
  expect(n.nota).toBe('La4');
  expect(n.cents, `nota «${nota}»`).toBeGreaterThanOrEqual(-35);
  expect(n.cents, `nota «${nota}»`).toBeLessThanOrEqual(-28);

  // El medio arrancó de verdad: una pista viva del micrófono falso de Chromium, no un sustituto.
  const p = await pistas(page);
  expect(p).toHaveLength(1);
  expect(p[0].estado).toBe('live');
  expect(p[0].etiqueta).toMatch(/Fake/i);
}

// ─────────────────────────────────────────────────────────────────────────────────────────
// CASO 1 — normal: un tono de 432 Hz, a mitad de bin y a −32 cents de La4
// ─────────────────────────────────────────────────────────────────────────────────────────

test.describe('CASO 1 — 432 Hz por el micrófono (escritorio)', () => {
  test('lee «432 Hz · La4 (−32 cents)», estable, con la pista del micrófono viva', async ({ page }) => {
    await vigilarMicrofono(page);
    await abrir(page);
    await botonMedidor(page).click();
    await expect(botonMedidor(page)).toHaveAttribute('aria-pressed', 'true');
    await comprobar432(page);
    // La retenida dice lo mismo que la lectura en vivo.
    await expect(seccion(page).getByText(/Última lectura estable:/)).toContainText('La4');

    // Al dejar de medir se suelta el micrófono: la pista pasa a «ended» (el indicador de
    // grabación del navegador se apaga).
    await botonMedidor(page).click();
    await expect(botonMedidor(page)).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(async () => (await pistas(page))[0]?.estado).toBe('ended');
  });
});

test.describe('CASO 1 (móvil) — la puerta del hero y la lectura en un Pixel 7', () => {
  test.use({
    viewport: devices['Pixel 7'].viewport,
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test('desde «Mídelo con el micrófono»: 432 Hz, sin desbordar, y «Llevar la lectura al generador»', async ({ page }) => {
    await vigilarMicrofono(page);
    await abrir(page);
    await page.getByRole('link', { name: 'Mídelo con el micrófono' }).tap();
    await expect(page).toHaveURL(/#medir-frecuencia$/);
    await botonMedidor(page).tap();
    await comprobar432(page);

    const anchos = await page.evaluate(() => ({ pagina: document.documentElement.scrollWidth, vista: innerWidth }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.vista);

    // Llevar la lectura: la app la redondea a un decimal y la escribe con coma («432» o «431,9»).
    await page.getByRole('button', { name: 'Llevar la lectura al generador' }).tap();
    await expect(botonMedidor(page)).toHaveAttribute('aria-pressed', 'false');
    const valor = await page.locator(CAMPO_FRECUENCIA).inputValue();
    const hz = Number(valor.replace(',', '.'));
    expect(hz, `campo «${valor}»`).toBeGreaterThanOrEqual(431);
    expect(hz, `campo «${valor}»`).toBeLessThanOrEqual(433);
    await expect(seccion(page).getByText(/Frecuencia puesta en el generador: 43[123](,\d)? Hz/)).toBeVisible();
  });

  /**
   * HALLAZGO M3 [bajo · operativa] (id 2414) — REPARADO el 29/09/2026: la sección lleva
   * `scroll-margin-top: 5rem` (.seccionMedidor), 80 px, por encima de los 62 px de la barra. El enlace nuevo del hero («Mídelo con el
   * micrófono», ce2dfa44) salta a #medir-frecuencia sin `scroll-margin-top`, y la barra del logo
   * es `position: fixed`. En el Pixel 7 (412×839) el título de la sección queda a 26-49 px de
   * arriba y la píldora del logo lo tapa hasta los 62 px: se lee «frecuencia de un sonido» con
   * «Medir la» debajo del logo. En escritorio el título empieza en x = 286 y no lo toca.
   *   esperado  lo que hay en el arranque del título (5 px a su derecha, a media altura) es el título
   *   obtenido  el SVG del logo (elementFromPoint), título en top = 26 px con la barra hasta 62 px
   */
  test('HALLAZGO M3 (REPARADO) — tras el enlace del hero, el título de la sección no queda bajo el logo', async ({ page }) => {
    await abrir(page);
    await page.getByRole('link', { name: 'Mídelo con el micrófono' }).tap();
    await expect(page).toHaveURL(/#medir-frecuencia$/);
    // Que el salto haya terminado: dos lecturas iguales de scrollY.
    await expect
      .poll(async () => {
        const a = await page.evaluate(() => scrollY);
        await page.waitForTimeout(150);
        return a === (await page.evaluate(() => scrollY));
      })
      .toBe(true);
    const visible = await page.evaluate(() => {
      const h = document.querySelector('#medir-frecuencia h3');
      if (!h) return false;
      const r = h.getBoundingClientRect();
      const encima = document.elementFromPoint(r.left + 5, r.top + r.height / 2);
      return encima !== null && (encima === h || h.contains(encima));
    });
    expect(visible, 'el arranque del título queda tapado por otro elemento').toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// CASO 3 — rechazo: el medidor no escucha mientras suena el propio generador
// ─────────────────────────────────────────────────────────────────────────────────────────

test.describe('CASO 3 — no se escucha a sí mismo', () => {
  test('con el tono sonando, «Medir la frecuencia» lo calla antes de escuchar', async ({ page }) => {
    await vigilarMicrofono(page);
    await abrir(page);
    await botonTono(page).click();
    await expect(botonTono(page)).toHaveAttribute('aria-pressed', 'true');
    await botonMedidor(page).click();
    await expect(botonMedidor(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(botonTono(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(botonTono(page)).toHaveText(/Reproducir/);
    // Y lo que lee es el WAV (432 Hz), no los 440 Hz del generador.
    await comprobar432(page);
  });

  test('con el barrido en marcha, «Medir la frecuencia» lo para', async ({ page }) => {
    await vigilarMicrofono(page);
    await abrir(page);
    await botonBarrido(page).click();
    await expect(botonBarrido(page)).toHaveAttribute('aria-pressed', 'true');
    await botonMedidor(page).click();
    await expect(botonMedidor(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(botonBarrido(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(botonTono(page)).toHaveAttribute('aria-pressed', 'false');
  });

  /**
   * HALLAZGO M2 [bajo · operativa] (id 2413) — REPARADO el 29/09/2026. Gana lo último que se
   * pulsa, como cuando el medidor ya escucha: `iniciarAudio` (por la que pasa también el barrido)
   * marca la apertura en curso como cancelada, e `iniciarMedidor`, al llegar el micrófono, suelta
   * la pista y no arranca. De las dos salidas que admite el «esperado», esta: el medidor no
   * arranca, el tono sigue, y la pista del micrófono queda 'ended' (sin indicador de grabación).
   *
   * Lo que pasaba: `iniciarMedidor` comprueba `reproduciendo` y para
   * el tono ANTES de `await getUserMedia`, y el guardia de `iniciarAudio` mira `medidorRef`, que
   * solo existe DESPUÉS. En la ventana entre las dos cosas —lo que tarda el navegador en abrir el
   * micrófono o el usuario en aceptar el permiso— pulsar «Reproducir» (o «Iniciar barrido»)
   * arranca el tono, y al llegar el micrófono el medidor se pone a escuchar con el tono sonando:
   * justo lo que el commit dice evitar («no se escucha a sí mismo»). Con un altavoz real, lo que
   * leería es la salida del generador.
   *   entrada   «Medir la frecuencia», el micrófono tarda 1,5 s, a los 0,3 s «Reproducir»
   *   esperado  nunca los dos activos: o el medidor no arranca, o el tono se para al abrirse
   *   obtenido  «Dejar de medir» aria-pressed=true y «Detener» aria-pressed=true a la vez
   *             (con «Iniciar barrido» en lugar de «Reproducir», igual: barrido + medidor)
   */
  test('HALLAZGO M2 (REPARADO) — pulsar Reproducir mientras se abre el micrófono no deja los dos activos', async ({ page }) => {
    await vigilarMicrofono(page, 1500);
    await abrir(page);
    await botonMedidor(page).click();
    await page.waitForTimeout(300);
    await botonTono(page).click();
    // Tiempo de sobra para que el micrófono se abra (1,5 s) y el medidor decida.
    await page.waitForTimeout(2500);
    expect(await pistas(page), 'el micrófono tenía que haberse abierto').toHaveLength(1);
    const medidor = await botonMedidor(page).getAttribute('aria-pressed');
    const tono = await botonTono(page).getAttribute('aria-pressed');
    expect({ medidor, tono }, 'medidor escuchando con el tono sonando').not.toEqual({ medidor: 'true', tono: 'true' });
    // La salida elegida: gana el tono, y el micrófono que llegó tarde se suelta.
    expect({ medidor, tono }).toEqual({ medidor: 'false', tono: 'true' });
    expect((await pistas(page)).map((p) => p.estado)).toEqual(['ended']);
  });

  test('HALLAZGO M2.bis (REPARADO) — lo mismo con «Iniciar barrido» en lugar de «Reproducir»', async ({ page }) => {
    await vigilarMicrofono(page, 1500);
    await abrir(page);
    await botonMedidor(page).click();
    await page.waitForTimeout(300);
    await botonBarrido(page).click();
    await page.waitForTimeout(2500);
    expect(await pistas(page), 'el micrófono tenía que haberse abierto').toHaveLength(1);
    await expect(botonMedidor(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(botonBarrido(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(botonTono(page)).toHaveAttribute('aria-pressed', 'true');
    expect((await pistas(page)).map((p) => p.estado)).toEqual(['ended']);
  });

  test('M2 · sin nada en medio, el micrófono lento se abre y mide igual', async ({ page }) => {
    // Contraprueba del arreglo: la cancelación solo la dispara arrancar el tono.
    await vigilarMicrofono(page, 1500);
    await abrir(page);
    await botonMedidor(page).click();
    await expect(botonMedidor(page)).toHaveAttribute('aria-pressed', 'true', { timeout: 5000 });
    expect((await pistas(page)).map((p) => p.estado)).toEqual(['live']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// SOSPECHA 28/09/2026 — type="number" leído con parseSpanishNumber: aquí NO se da
// ─────────────────────────────────────────────────────────────────────────────────────────

/**
 * La app aparece en la lista por grep porque la cadena `type="number"` sale en sus COMENTARIOS
 * (los que explican por qué los campos dejaron de serlo, hallazgos 873/691 y 1804). Los cuatro
 * campos —frecuencia, Desde, Hasta, Duración— son type="text" con inputMode="decimal".
 * Resuelto a mano: «1,234» en «Desde» es 1,234 Hz (coma decimal), por debajo del mínimo de 20 →
 * se acota a 20 y se avisa: «Desde»: 1,234 Hz queda fuera del rango de 20 a 20.000 Hz; se ajusta
 * a 20 Hz. Si el campo fuera type="number", el navegador entregaría «1.234» y parseSpanishNumber
 * leería 1.234 Hz: válido y sin aviso.
 */
test('SOSPECHA type="number" — ningún campo lo es, y «1,234» en «Desde» se lee como 1,234 Hz', async ({ page }) => {
  await abrir(page);
  await esperarHidratacion(page, ['#sweep-min']);
  await expect(page.locator('input[type="number"]')).toHaveCount(0);
  for (const sel of [CAMPO_FRECUENCIA, '#sweep-min', '#sweep-max', '#sweep-dur']) {
    await expect(page.locator(sel)).toHaveAttribute('type', 'text');
    await expect(page.locator(sel)).toHaveAttribute('inputmode', 'decimal');
  }
  const desde = page.locator('#sweep-min');
  await desde.click();
  await desde.press('Control+a');
  await desde.pressSequentially('1,234', { delay: 30 });
  await esperarValorEnReact(page, '#sweep-min', '1,234');
  await desde.blur();
  await expect(desde).toHaveValue('20');
  // El aviso lleva delante el ⚠️ decorativo (aria-hidden): se compara lo que sigue.
  await expect(page.locator('#sweep-min-aviso')).toContainText(
    '«Desde»: 1,234 Hz queda fuera del rango de 20 a 20.000 Hz; se ajusta a 20 Hz.',
  );
});
