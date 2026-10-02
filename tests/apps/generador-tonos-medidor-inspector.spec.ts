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
 *
 * ── RE-INSPECCIÓN 02/10/2026 (al final del fichero) ──
 * Invalidada por c0eb8f95, que cambió el motor compartido lib/calculadoras/frecuenciaDominante.ts
 * (meseta saturada centrada por cocientes; el rango decide por la frecuencia AFINADA de cada cima
 * y la búsqueda empieza en el bin 1). Se comprobó con WAV por el micrófono falso (un fichero por
 * señal, desde un script aparte) y aquí se fija con el MISMO audio fabricado en la página: este
 * fichero ya tiene su WAV (432 Hz) en los launchOptions, que son por fichero, así que para las
 * demás señales se sustituye getUserMedia por un búfer en bucle (`microfonoSintetico`). Las cifras
 * salieron idénticas por los dos caminos (21 Hz: «21,0 Hz · Mi0 (+34 cents)» en los dos).
 * Resuelto a mano ANTES de ejecutar (La4 = 440 Hz; cents = 1200·log2(f/f_nota)):
 *   · NORMAL, móvil de 360 px y camino de verdad (WAV de 432 Hz): el AudioContext corre, el
 *     analizador recibe la senoide (RMS = 0,5/√2 = 0,354) y «Llevar la lectura al generador» +
 *     «Reproducir» emite 432 Hz, medidos en el sonido que sale del oscilador.
 *   · LÍMITES: 21 Hz → Mi0 (20,602 Hz), +33 cents · 20,3 Hz → Mi0, −26 cents (el borde que
 *     c0eb8f95 recupera) · 19.950 Hz → Re#10 (19.912 Hz), +3 cents · Mi2 de 82,4 Hz con la
 *     amplitud al doble y recortada → Mi2 (82,407 Hz), 0 cents · 19,8 Hz, fuera del rango →
 *     ninguna cifra.
 *   · RECHAZO, SOSPECHA (b) del 29/09: un 15 Hz que EMPIEZA (y acaba) en escalón con el medidor ya
 *     escuchando → ninguna cifra. DESCARTADA: lo que deja el corte con prominencia ≥ 20 dB queda
 *     ≥ 76 dB bajo el tono, y lo que queda a menos de 58 dB no pasa de 5 dB de prominencia.
 *   · SOSPECHA (a) del 29/09, CONFIRMADA: un clic de unos 10 ms se da por «Lectura estable» y
 *     sustituye la retenida (HALLAZGO R1, abajo, con `test.fail()`).
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

// ═════════════════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 02/10/2026 — el medidor tras c0eb8f95 (motor compartido con analizador-espectro)
// ═════════════════════════════════════════════════════════════════════════════════════════

interface ComponenteTono {
  tipo: 'tono';
  hz: number;
  amp: number;
  /** Segundos del búfer entre los que suena (fuera, silencio). */
  desde: number;
  hasta: number;
  /** Fase inicial en radianes: con π/2 el tono ENTRA en escalón (de 0 a `amp`). */
  fase?: number;
  /** Rampa de salida hasta `hasta`, en segundos (sin ella, el tono se corta en seco). */
  rampa?: number;
}

/** Golpe o clic: senoide amortiguada amp·e^(−t/τ)·sen(2π·hz·t) desde `en`. */
interface ComponenteGolpe {
  tipo: 'golpe';
  hz: number;
  tau: number;
  amp: number;
  en: number;
}

interface SenalSintetica {
  /** Duración del búfer, que suena en bucle. */
  segundos: number;
  /** Amplitud de pico de un ruido blanco de fondo (0,001 ≈ −65 dBFS eficaces, un micro en una sala). */
  fondo?: number;
  semilla?: number;
  componentes: (ComponenteTono | ComponenteGolpe)[];
}

type VentanaSenal = Window & { __senalPedida?: number };
type VentanaRegistro = Window & {
  __registroMedidor?: { t: number; cifra: string; estado: string; retenida: string }[];
};
type VentanaAudio = Window & { __analizadoresInspeccion?: AnalyserNode[]; __osciladoresInspeccion?: OscillatorNode[] };

/**
 * Sustituye el micrófono por un búfer fabricado en la página (recortado a ±1, como un conversor
 * saturado) que empieza a sonar al pedir el micrófono, igual que el WAV del dispositivo falso.
 * Ruido de fondo con un generador congruencial de semilla fija: el caso es el mismo cada vez.
 */
async function microfonoSintetico(page: Page, senal: SenalSintetica) {
  await page.addInitScript((sn: SenalSintetica) => {
    const w = window as VentanaSenal;
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async () => {
        const ctx = new AudioContext();
        await ctx.resume();
        const tasa = ctx.sampleRate;
        const n = Math.round(tasa * sn.segundos);
        const bufer = ctx.createBuffer(1, n, tasa);
        const d = bufer.getChannelData(0);
        let s = (sn.semilla ?? 12345) >>> 0;
        const ruido = () => {
          s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
          return (s / 4294967296) * 2 - 1;
        };
        for (let i = 0; i < n; i++) {
          const t = i / tasa;
          let v = (sn.fondo ?? 0) * ruido();
          for (const c of sn.componentes) {
            if (c.tipo === 'tono') {
              if (t >= c.desde && t < c.hasta) {
                const envolvente = c.rampa ? Math.min(1, (c.hasta - t) / c.rampa) : 1;
                v += c.amp * envolvente * Math.sin(2 * Math.PI * c.hz * (t - c.desde) + (c.fase ?? 0));
              }
            } else if (t >= c.en) {
              const k = t - c.en;
              v += c.amp * Math.exp(-k / c.tau) * Math.sin(2 * Math.PI * c.hz * k);
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
        // Un micrófono que ha obedecido: los tres procesados apagados (sin la nota informativa).
        const pista = destino.stream.getAudioTracks()[0];
        pista.getSettings = () => ({ echoCancellation: false, noiseSuppression: false, autoGainControl: false });
        w.__senalPedida = performance.now();
        return destino.stream;
      },
    });
  }, senal);
}

/**
 * Apunta, cada 20 ms, lo que muestra el medidor cuando cambia: la cifra grande, «Lectura estable» /
 * «Leyendo…» y la retenida. Mirar el DOM desde el test cada 100 ms podría perderse una lectura suelta.
 */
async function registrarMedidor(page: Page) {
  await page.addInitScript(() => {
    const w = window as VentanaRegistro;
    w.__registroMedidor = [];
    let previo = '';
    window.setInterval(() => {
      const s = document.querySelector('#medir-frecuencia');
      if (!s) return;
      const texto = (sel: string) => (s.querySelector(sel)?.textContent ?? '').replace(/ /g, ' ').trim();
      const r = {
        t: performance.now(),
        cifra: texto('[class*="medidorCifra"]'),
        estado: texto('[class*="medidorEstable"]') || texto('[class*="medidorLeyendo"]'),
        retenida: texto('[class*="medidorRetenida"]'),
      };
      const clave = `${r.cifra}|${r.estado}|${r.retenida}`;
      if (clave !== previo) {
        previo = clave;
        w.__registroMedidor?.push(r);
      }
    }, 20);
  });
}

async function registro(page: Page) {
  return page.evaluate(() => (window as VentanaRegistro).__registroMedidor ?? []);
}

/** Abre la app con el micrófono sintético y arranca el medidor. */
async function medirSintetico(page: Page, senal: SenalSintetica) {
  await microfonoSintetico(page, senal);
  await registrarMedidor(page);
  await abrir(page);
  await botonMedidor(page).click();
  await expect(botonMedidor(page)).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => (window as VentanaSenal).__senalPedida ?? 0)).toBeGreaterThan(0);
}

/** Espera hasta que el búfer lleve `ms` sonando (reloj de la página, desde que se pidió el micrófono). */
async function esperarDesdeElMicrofono(page: Page, ms: number) {
  await expect
    .poll(() => page.evaluate(() => performance.now() - ((window as VentanaSenal).__senalPedida ?? Infinity)), {
      timeout: ms + 5000,
    })
    .toBeGreaterThanOrEqual(ms);
}

/** Ninguna cifra en todo lo observado: solo «— Hz», sin «Lectura estable» ni retenida. */
async function comprobarSinCifra(page: Page) {
  const r = await registro(page);
  const conMedidor = r.filter((x) => x.cifra !== '');
  expect(conMedidor.length, 'el medidor tenía que estar a la vista').toBeGreaterThan(0);
  expect([...new Set(conMedidor.map((x) => x.cifra))], 'la cifra grande no debe mostrar nada más que «— Hz»').toEqual([
    '— Hz',
  ]);
  expect(
    r.filter((x) => x.retenida !== '').map((x) => x.retenida),
    'sin «Última lectura estable»',
  ).toEqual([]);
}

test.describe('RE-INSPECCIÓN 02/10 — móvil de 360 px por el micrófono falso (camino de verdad)', () => {
  test.use({
    viewport: { width: 360, height: 780 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('el AudioContext corre, llegan las muestras del WAV y la lectura vuelve al generador, que emite 432 Hz', async ({
    page,
  }) => {
    await vigilarMicrofono(page);
    await page.addInitScript(() => {
      const w = window as VentanaAudio;
      w.__analizadoresInspeccion = [];
      w.__osciladoresInspeccion = [];
      const proto = AudioContext.prototype;
      const crearAnalizador = proto.createAnalyser;
      proto.createAnalyser = function (this: AudioContext) {
        const a = crearAnalizador.call(this);
        w.__analizadoresInspeccion?.push(a);
        return a;
      };
      const crearOscilador = proto.createOscillator;
      proto.createOscillator = function (this: AudioContext) {
        const o = crearOscilador.call(this);
        w.__osciladoresInspeccion?.push(o);
        return o;
      };
    });
    await abrir(page);
    await botonMedidor(page).tap();
    await comprobar432(page);

    // El medio arranca DE VERDAD: el contexto del medidor corre (su reloj avanza ~0,3 s en 300 ms)
    // y su analizador recibe la senoide del WAV: RMS = 0,5/√2 = 0,354.
    const medio = await page.evaluate(async () => {
      const an = ((window as VentanaAudio).__analizadoresInspeccion ?? []).find((a) => a.fftSize === 16384);
      if (!an) return null;
      const t1 = an.context.currentTime;
      await new Promise((r) => setTimeout(r, 300));
      const avance = an.context.currentTime - t1;
      const td = new Float32Array(an.fftSize);
      an.getFloatTimeDomainData(td);
      let suma = 0;
      for (let i = 0; i < td.length; i++) suma += td[i] * td[i];
      return { estado: an.context.state, avance, rms: Math.sqrt(suma / td.length) };
    });
    expect(medio, 'no se creó el analizador del medidor').not.toBeNull();
    expect(medio?.estado).toBe('running');
    expect(medio?.avance ?? 0).toBeGreaterThan(0.2);
    expect(medio?.rms ?? 0).toBeGreaterThan(0.3);
    expect(medio?.rms ?? 1).toBeLessThan(0.4);
    const anchos = await page.evaluate(() => ({ pagina: document.documentElement.scrollWidth, vista: innerWidth }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.vista);

    // «Llevar la lectura al generador» y «Reproducir»: el oscilador emite lo que dice el campo.
    await page.getByRole('button', { name: 'Llevar la lectura al generador' }).tap();
    const campo = Number((await page.locator(CAMPO_FRECUENCIA).inputValue()).replace(',', '.'));
    expect(campo).toBeGreaterThanOrEqual(431);
    expect(campo).toBeLessThanOrEqual(433);
    await botonTono(page).tap();
    await expect(botonTono(page)).toHaveAttribute('aria-pressed', 'true');
    const emitido = await page.evaluate(async () => {
      const lista = (window as VentanaAudio).__osciladoresInspeccion ?? [];
      const o = lista[lista.length - 1];
      if (!o) return null;
      // Un analizador propio enganchado al oscilador: mide el sonido, no el parámetro.
      const an = o.context.createAnalyser();
      an.fftSize = 16384;
      an.smoothingTimeConstant = 0;
      o.connect(an);
      await new Promise((r) => setTimeout(r, 600));
      const e = new Float32Array(an.frequencyBinCount);
      an.getFloatFrequencyData(e);
      let i = 1;
      for (let k = 1; k < e.length - 1; k++) if (e[k] > e[i]) i = k;
      const delta = (e[i - 1] - e[i + 1]) / (2 * (e[i - 1] - 2 * e[i] + e[i + 1]));
      return { parametro: o.frequency.value, hz: ((i + delta) * o.context.sampleRate) / an.fftSize };
    });
    expect(emitido, 'no se creó el oscilador del generador').not.toBeNull();
    expect(emitido?.parametro).toBe(campo);
    expect(Math.abs((emitido?.hz ?? 0) - campo), `emitido ${emitido?.hz} Hz, campo ${campo}`).toBeLessThan(0.5);
  });
});

/**
 * LÍMITES — resueltos a mano (La4 = 440 Hz, f_nota = 440·2^(n/12), n = round(12·log2(f/440)),
 * cents = 1200·log2(f/f_nota)). La tolerancia vigila defectos de 1 Hz o más (el flanco leído como
 * 17,6/18,8 Hz, hallazgo 2412; el borde de 20,0-20,5 Hz que no se leía, 2568 del analizador), no
 * los 0,02 Hz del afinado; los cents van con el intervalo que corresponde a esa tolerancia.
 *   21 Hz:     n = −53 → Mi0 = 20,602 Hz → +33 cents. ±0,1 Hz → +25…+41.
 *   20,3 Hz:   n = −53 → Mi0 → 1200·log2(20,3/20,602) = −25,5 → −26. ±0,1 Hz → −34…−17.
 *   19.950 Hz: n = 66 → Re#10 = 19.912 Hz → +3 cents. ±1 Hz → +2…+4.
 *   82,4 Hz recortado (amplitud 2, recorte a ±1: casi cuadrada, el 3.er armónico ~9,5 dB bajo la
 *              fundamental, que sigue siendo el pico): n = −29 → Mi2 = 82,407 Hz → 0 cents. ±0,1 Hz → −2…+2.
 * Ciclos enteros en el búfer: el bucle no mete ningún salto.
 */
const BORDES: { nombre: string; senal: SenalSintetica; hz: [number, number]; nota: string; cents: [number, number] }[] = [
  {
    nombre: '21 Hz → «21,0 Hz · Mi0 (+33 cents)»',
    senal: { segundos: 10, componentes: [{ tipo: 'tono', hz: 21, amp: 0.5, desde: 0, hasta: 10 }] },
    hz: [20.9, 21.1],
    nota: 'Mi0',
    cents: [25, 41],
  },
  {
    nombre: '20,3 Hz (el borde que recupera c0eb8f95) → «20,3 Hz · Mi0 (−26 cents)»',
    senal: { segundos: 10, componentes: [{ tipo: 'tono', hz: 20.3, amp: 0.5, desde: 0, hasta: 10 }] },
    hz: [20.2, 20.4],
    nota: 'Mi0',
    cents: [-34, -17],
  },
  {
    nombre: '19.950 Hz → «19.950 Hz · Re#10 (+3 cents)»',
    senal: { segundos: 2, componentes: [{ tipo: 'tono', hz: 19950, amp: 0.5, desde: 0, hasta: 2 }] },
    hz: [19949, 19951],
    nota: 'Re#10',
    cents: [2, 4],
  },
  {
    nombre: 'Mi2 de 82,4 Hz SATURADO (amplitud 2, recortada) → «82,4 Hz · Mi2 (0 cents)»',
    senal: { segundos: 10, componentes: [{ tipo: 'tono', hz: 82.4, amp: 2, desde: 0, hasta: 10 }] },
    hz: [82.3, 82.5],
    nota: 'Mi2',
    cents: [-2, 2],
  },
];

test.describe('RE-INSPECCIÓN 02/10 — los bordes del rango y la señal saturada', () => {
  for (const b of BORDES) {
    test(b.nombre, async ({ page }) => {
      await medirSintetico(page, b.senal);
      await expect(seccion(page).getByText('Lectura estable', { exact: true })).toBeVisible({ timeout: 6000 });
      const { cifra, nota } = await lecturaEnVivo(page);
      const hz = hzDe(cifra);
      expect(hz, `cifra «${cifra}»`).toBeGreaterThanOrEqual(b.hz[0]);
      expect(hz, `cifra «${cifra}»`).toBeLessThanOrEqual(b.hz[1]);
      const n = notaDe(nota);
      expect(n.nota, `nota «${nota}»`).toBe(b.nota);
      expect(n.cents, `nota «${nota}»`).toBeGreaterThanOrEqual(b.cents[0]);
      expect(n.cents, `nota «${nota}»`).toBeLessThanOrEqual(b.cents[1]);
    });
  }

  test('19,8 Hz, por debajo del rango de 20 Hz a 20 kHz: ninguna cifra', async ({ page }) => {
    // 19,8 Hz asoma en el bin de 20,5 Hz a 48 kHz, pero afinado da 19,8: no es del rango.
    await medirSintetico(page, {
      segundos: 10,
      componentes: [{ tipo: 'tono', hz: 19.8, amp: 0.5, desde: 0, hasta: 10 }],
    });
    await esperarDesdeElMicrofono(page, 3000);
    await comprobarSinCifra(page);
  });
});

/**
 * SOSPECHA (b) del 29/09/2026 — DESCARTADA. La guarda de llenado solo cubre ABRIR el micrófono; un
 * sonido por debajo de 20 Hz que empieza con el medidor ya escuchando es también un sonido cortado.
 * Caso más duro que el de la ficha: el 15 Hz entra en ESCALÓN (fase π/2: de 0 a 0,5 de golpe, que
 * reparte energía por todo el espectro) al segundo 1 y se corta en otro escalón al 3. Esperado
 * (como en el hallazgo 2412): ninguna cifra. Medido el 02/10 con WAV a 48 y 44,1 kHz, con fase 0,
 * π/2 y 1 rad (tres arranques y tres cortes por WAV): ninguna lectura. Lo que deja el corte con
 * prominencia ≥ 20 dB queda ≥ 76 dB bajo el tono (la guarda de 58 dB lo descarta), y lo que queda a
 * menos de 58 dB no pasa de 5 dB de prominencia. No hay un caso que cumpla las dos a la vez.
 */
test('SOSPECHA (b) DESCARTADA — un 15 Hz que entra y sale en escalón con el medidor escuchando no da cifra', async ({
  page,
}) => {
  await medirSintetico(page, {
    segundos: 4,
    componentes: [{ tipo: 'tono', hz: 15, amp: 0.5, desde: 1, hasta: 3, fase: Math.PI / 2 }],
  });
  // Hasta pasado el corte del segundo 3 y el vaciado de la ventana (0,34 s) con su suavizado.
  await esperarDesdeElMicrofono(page, 4300);
  await comprobarSinCifra(page);
});

/**
 * HALLAZGO R1 [medio · cálculo] — ABIERTO (02/10/2026). SOSPECHA (a) del 29/09, CONFIRMADA.
 *
 * La app dice que la cifra es ESTABLE «cuando cinco lecturas seguidas coinciden a ±20 cents, que es
 * lo que separa un tono sostenido de una voz que habla», y la deja retenida («Última lectura
 * estable», con «Llevar la lectura al generador»). Pero cinco lecturas cada 100 ms no son
 * independientes: la ventana de la FFT abarca 16.384 muestras (0,34 s) y el suavizado de 0,5 guarda
 * la mitad de cada lectura en la siguiente (−6 dB por lectura). Un clic de 10 ms conserva la MISMA
 * forma de espectro mientras cruza la ventana y mientras se apaga el suavizado: unas ocho lecturas
 * con el mismo pico, que la prominencia (el fondo queda 20-55 dB por debajo) y la guarda de 58 dB
 * (el clic es lo más fuerte) dejan pasar. Un impulso de una muestra o una ráfaga de ruido no dan
 * cifra (espectro plano); lo que la da es un clic con resonancia, como casi todos los reales.
 *
 * Medido el 02/10/2026:
 *   · por el micrófono falso (WAV): golpe de 250 Hz con τ = 2 ms sobre ruido a −65 dBFS →
 *     «Lectura estable» y retenida «239 Hz · La#3 (+45 cents)», en los dos golpes del bucle;
 *   · fuera del navegador, con el motor real y un AnalyserNode simulado que reproduce las cifras
 *     del navegador a la décima: un clic de 1 kHz con τ = 2 ms da «Lectura estable» en 36 de 36
 *     ensayos (12 semillas de ruido × 3 desfases), uno de 3 kHz con τ = 1 ms en 36 de 36.
 * Y el daño que se ve: la retenida de un tono de verdad se sustituye por la del clic.
 *   entrada   silbido de 432 Hz durante 1,5 s (amplitud 0,3), silencio con ruido a −65 dBFS y, en el
 *             segundo 2,5, un clic de 1 kHz que se apaga en ~10 ms (amplitud 0,9, τ = 2 ms)
 *   esperado  la retenida sigue en «432 Hz · La4 (−32 cents)»: el clic no es un tono sostenido
 *   obtenido  «Lectura estable» del clic y retenida «997 Hz · Si5 (+16 cents)»
 */
test('HALLAZGO R1 (ABIERTO) — un clic de 10 ms no se da por «Lectura estable» ni sustituye la retenida', async ({
  page,
}) => {
  test.fail();
  await medirSintetico(page, {
    segundos: 6,
    fondo: 0.001,
    semilla: 12345,
    componentes: [
      { tipo: 'tono', hz: 432, amp: 0.3, desde: 0, hasta: 1.5, rampa: 0.05 },
      { tipo: 'golpe', hz: 1000, tau: 0.002, amp: 0.9, en: 2.5 },
    ],
  });
  // `\s`: la cifra y «Hz» van separados por un espacio duro.
  await expect(seccion(page).getByText(/Última lectura estable: 43[123]\sHz · La4/)).toBeVisible({ timeout: 5000 });
  await esperarDesdeElMicrofono(page, 4000);

  const r = await registro(page);
  const establesAjenas = r.filter((x) => x.estado === 'Lectura estable' && !/^43[123] Hz$/.test(x.cifra));
  expect(
    establesAjenas.map((x) => x.cifra),
    'el clic no puede darse por lectura estable',
  ).toEqual([]);
  await expect(seccion(page).getByText(/Última lectura estable:/)).toContainText(/43[123]\sHz · La4/);
});
