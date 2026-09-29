import { test, expect, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { esperarHidratacion } from './_hidratacion';

/**
 * Generador de Tonos — medidor de frecuencia en el LÍMITE grave (Inspector, 29/09/2026).
 *
 * Fichero aparte de generador-tonos-medidor-inspector.spec.ts solo porque el WAV del micrófono
 * falso va en los launchOptions, que son por fichero. Mismo camino de verdad: Chromium con
 * `--use-fake-device-for-media-stream` leyendo un WAV que escribe este fichero (PCM 16 bits,
 * 48 kHz, mono, senoide pura de 15 Hz, 10 s = 150 ciclos exactos, sin salto en el bucle).
 *
 * 10 s y no 2 s (29/09/2026): al dar la vuelta al fichero, el micrófono falso de Chromium mete un
 * chasquido de banda ancha (medido: bins de 100 a 400 Hz hasta −66 dB durante unas diez tramas,
 * aunque la senoide empalma sin salto). Es un sonido de verdad y las apps pueden leerlo; con 10 s
 * la vuelta queda fuera de la ventana que se observa y el test mide solo el tono de 15 Hz.
 *
 * HALLAZGO M1 [medio · cálculo] (id 2412) — REPARADO el 29/09/2026 (ver los tests). Lo que
 * pasaba: el medidor busca el pico entre FREC_MIN = 20 Hz y FREC_MAX = 20.000 Hz
 * (page.tsx → picoDominante), pero `picoDominante` arrancaba en el bin
 * floor(fMin / hzPorBin), que está POR DEBAJO de 20 Hz (a 44,1 kHz: floor(20/2,6917) = 7 →
 * 18,84 Hz; a 48 kHz: 6 → 17,58 Hz), y no exige que el bin elegido sea un máximo local. Un tono
 * por debajo del rango pone ese primer bin en el flanco de su lóbulo principal (la ventana
 * Blackman del AnalyserNode lo abre ±3 bins): el flanco sobresale del fondo mucho más de los 20 dB
 * de PROMINENCIA_MIN_DB, el afinado se descarta (el vértice cae a más de medio bin) y la lectura
 * es SIEMPRE el centro de ese bin. Cinco lecturas idénticas → «Lectura estable» de una cifra que
 * no es la del sonido. Medido también con 12 Hz (la misma cifra que con 15) y con un escalón de
 * continua al abrirse el micrófono (el «plop» de encender un micro): «18,8 Hz» estable y
 * retenida. El motor es compartido: analizador-espectro lo llama con los mismos 20 Hz por defecto.
 *
 * Resuelto a mano:
 *   15 Hz está fuera del rango de 20 a 20.000 Hz que la app se pide a sí misma (y del que declara
 *   en su hero), y el bloque «Qué mide y qué no» dice que en los graves extremos «puede no leer
 *   nada». Esperado: sin cifra («— Hz», «Esperando un sonido…») o, si la da, la del sonido:
 *   15 Hz ± 1 Hz, la precisión que la app promete. Una «Lectura estable» a 3,8 Hz no vale.
 *   obtenido: la cifra del primer bin del rango, «Lectura estable» y retenida con el botón
 *   «Llevar la lectura al generador». Depende de la frecuencia de muestreo del contexto:
 *     · a 48 kHz (esta spec con `npx playwright test`): «17,6 Hz · Do#0 (+25 cents)».
 *       17,6 = 6 × 48000/16384 = 17,578 Hz; Do#0 = 440·2^(−56/12) = 17,324 Hz → +25 cents.
 *     · a 44,1 kHz (el mismo WAV desde un script suelto): «18,8 Hz · Re0 (+45 cents)».
 *       18,8 = 7 × 44100/16384 = 18,842 Hz; Re0 = 440·2^(−55/12) = 18,354 Hz → +45 cents.
 */

const RUTA = '/generador-tonos/';
const CAMPO_FRECUENCIA = 'input[aria-label="Frecuencia en Hz"]';

function escribirWav(ruta: string, hz: number, segundos = 2, amplitud = 0.5): void {
  const tasa = 48000;
  const muestras = tasa * segundos;
  const b = Buffer.alloc(44 + muestras * 2);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + muestras * 2, 4);
  b.write('WAVE', 8);
  b.write('fmt ', 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
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

const WAV_15 = join(tmpdir(), 'meskeia-generador-tonos-15hz.wav');
escribirWav(WAV_15, 15, 10);

test.use({
  launchOptions: {
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-audio-capture=${WAV_15}`,
      '--autoplay-policy=no-user-gesture-required',
    ],
  },
  permissions: ['microphone'],
});

type VentanaVigilada = Window & { __pistasMedidor?: MediaStreamTrack[] };

/** Deja a la vista las pistas de getUserMedia, sin sustituirlas: el audio es el del WAV. */
async function vigilarMicrofono(page: Page) {
  await page.addInitScript(() => {
    const w = window as VentanaVigilada;
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    w.__pistasMedidor = [];
    navigator.mediaDevices.getUserMedia = async (restricciones?: MediaStreamConstraints) => {
      const stream = await original(restricciones);
      w.__pistasMedidor?.push(...stream.getAudioTracks());
      return stream;
    };
  });
}

/**
 * Arranca el medidor y observa durante 3 s (tiempo de sobra para cinco lecturas seguidas, una
 * cada 100 ms, con la ventana llena en 0,37 s). Devuelve todo lo que la cifra grande ha llegado a
 * mostrar, muestreado cada 100 ms, y el texto de la retenida si aparece.
 */
async function medirQuinceHz(page: Page): Promise<{ cifras: string[]; retenida: string | null }> {
  await vigilarMicrofono(page);
  await page.goto(RUTA);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA]);

  const boton = page.getByRole('button', { name: /Medir la frecuencia|Dejar de medir/ });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
  // El micrófono falso está vivo de verdad.
  await expect
    .poll(() => page.evaluate(() => ((window as VentanaVigilada).__pistasMedidor ?? []).map((p) => p.readyState)))
    .toEqual(['live']);

  const cifra = page.locator('#medir-frecuencia [class*="medidorCifra"]');
  const cifras = new Set<string>();
  for (let i = 0; i < 30; i++) {
    cifras.add(((await cifra.textContent()) ?? '').replace(/ /g, ' ').trim());
    await page.waitForTimeout(100);
  }
  const retenida = page.locator('#medir-frecuencia').getByText(/Última lectura estable:/);
  const textoRetenida = (await retenida.count()) > 0 ? ((await retenida.textContent()) ?? '') : null;
  return { cifras: [...cifras], retenida: textoRetenida };
}

/*
 * REPARADO el 29/09/2026 en el motor (lib/calculadoras/frecuenciaDominante.ts): el rango empieza
 * en el primer bin ≥ fMin (ceil) y el pico tiene que ser la cima de su lóbulo (±3 bins, mirando
 * también fuera del rango), así que el flanco de un sonido más grave ya no es un pico. Lo que
 * queda por encima de 20 Hz son rizos a la altura del fondo, que no pasan la prominencia. Se
 * pide lo que dice la ficha como primera opción: sin cifra en ningún momento («— Hz», sin
 * «Lectura estable» ni retenida). Golden del motor: tests/frecuencia-dominante-motor.spec.ts.
 */
test('HALLAZGO M1 (REPARADO) — un tono de 15 Hz a 48 kHz no da ninguna cifra', async ({ page }) => {
  const { cifras, retenida } = await medirQuinceHz(page);
  expect(retenida, 'no debe quedar una «Última lectura estable» de un tono de 15 Hz').toBeNull();
  expect(cifras, 'la cifra grande no debe mostrar nada más que «— Hz»').toEqual(['— Hz']);
});

test('HALLAZGO M1 (REPARADO) — el mismo WAV con el contexto a 44,1 kHz: tampoco da cifra', async ({ page }) => {
  // El caso de la ficha que daba «18,8 Hz · Re0 (+45 cents)»: se fuerza la frecuencia de muestreo
  // del contexto del medidor (el WAV sigue siendo de 48 kHz; Chromium lo remuestrea).
  await page.addInitScript(() => {
    const Original = window.AudioContext;
    class Contexto441 extends Original {
      constructor(opciones?: AudioContextOptions) {
        super({ ...opciones, sampleRate: 44100 });
      }
    }
    window.AudioContext = Contexto441;
  });
  const { cifras, retenida } = await medirQuinceHz(page);
  expect(await page.evaluate(() => new AudioContext().sampleRate)).toBe(44100);
  expect(retenida, 'no debe quedar una «Última lectura estable» de un tono de 15 Hz').toBeNull();
  expect(cifras, 'la cifra grande no debe mostrar nada más que «— Hz»').toEqual(['— Hz']);
});
