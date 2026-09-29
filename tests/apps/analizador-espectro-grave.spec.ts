import { test, expect, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { esperarHidratacion } from './_hidratacion';

/**
 * Analizador de Espectro — un sonido por DEBAJO de su rango de 20 Hz a 20 kHz (29/09/2026).
 *
 * Testigo de la sospecha que dejó el hallazgo 2412 de generador-tonos: las dos apps comparten
 * el motor (lib/calculadoras/frecuenciaDominante.ts) y el analizador lo llama con fMin = 20 Hz
 * por defecto. Fichero aparte de analizador-espectro.spec.ts porque el micrófono falso lee un
 * WAV, y eso va en los launchOptions, que son por fichero: el mismo WAV de 15 Hz que
 * tests/apps/generador-tonos-medidor-grave.spec.ts (PCM 16 bits, 48 kHz, mono, 10 s = 150 ciclos;
 * allí se explica por qué 10 s: la vuelta del fichero mete un chasquido de banda ancha que el
 * analizador lee, con razón, como «454 Hz» o «148 Hz»).
 *
 * Resuelto a mano: 15 Hz está fuera del rango que la app declara (el eje del gráfico y el
 * JSON-LD dicen 20 Hz–20 kHz). Esperado: «-- Hz» y nota «--».
 *
 * CONFIRMADA antes de reparar, reproduciendo el espectro EN BYTES del navegador (fftSize 8192,
 * suavizado 0,8, el WAV por el micrófono falso) y pasándolo por el motor anterior:
 *   · a 48 kHz (5,86 Hz por bin) el rango empezaba en floor(20/5,86) = bin 3 (17,6 Hz), que con
 *     los bytes casi saturados (199 237 238 206) quedaba como pico y se afinaba a 14,83 Hz: una
 *     cifra fuera del rango que la app dice cubrir, publicada como «15 Hz».
 *   · a 44,1 kHz (5,38 Hz por bin) el tono cae en el bin 2,79 y el primer bin del rango, el 3
 *     (16,15 Hz), era el flanco: la cifra del flanco, no la del sonido.
 * El arreglo del motor (rango desde ceil, pico = cima de su lóbulo, afinado dentro del rango) la
 * resuelve aquí sin tocar la app: el motor ya no devuelve pico y el analizador escribe «-- Hz».
 */

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

const WAV_15 = join(tmpdir(), 'meskeia-analizador-espectro-15hz.wav');
escribirWav(WAV_15, 15, 10);

test.use({
  launchOptions: {
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-audio-capture=${WAV_15}`,
    ],
  },
  permissions: ['microphone'],
});

const frecuencia = (page: Page) => page.locator('[class*="freqValue"]');
const nota = (page: Page) => page.locator('[class*="noteValue"]');

/** Arranca el análisis y recoge lo que muestra la cifra durante 3 s, cada 100 ms. */
async function cifrasCon15Hz(page: Page): Promise<string[]> {
  await page.goto('/analizador-espectro/');
  await esperarHidratacion(page, ['#sensitivity-slider']);
  await page.getByRole('button', { name: /Iniciar análisis/ }).click();
  await expect(frecuencia(page)).toBeVisible();
  // El arranque no se juzga aquí: mientras la ventana de 8.192 muestras se llena de audio
  // (0,17 s) y el suavizado de 0,8 por fotograma lo digiere (~0,5 s para bajar 58 dB), el
  // espectro es el de un sonido CORTADO, ancho de verdad, y el analizador en vivo lo enseña
  // fotograma a fotograma (se vieron «41 Hz» y «148 Hz» durante ese medio segundo). Lo que se
  // prueba es que, con el tono ya asentado, no quede una cifra: la del flanco que daba antes.
  await page.waitForTimeout(1500);
  const vistas = new Set<string>();
  for (let i = 0; i < 30; i++) {
    vistas.add(((await frecuencia(page).textContent()) ?? '').replace(/\s/g, ' ').trim());
    await page.waitForTimeout(100);
  }
  return [...vistas];
}

test('un tono de 15 Hz a 48 kHz no da cifra (antes: «15 Hz», fuera del rango de 20 Hz–20 kHz)', async ({ page }) => {
  const cifras = await cifrasCon15Hz(page);
  expect(cifras).toEqual(['-- Hz']);
  await expect(nota(page)).toHaveText('--');
});

test('el mismo WAV con el contexto a 44,1 kHz tampoco (antes: el flanco, en 16 Hz)', async ({ page }) => {
  await page.addInitScript(() => {
    const Original = window.AudioContext;
    class Contexto441 extends Original {
      constructor(opciones?: AudioContextOptions) {
        super({ ...opciones, sampleRate: 44100 });
      }
    }
    window.AudioContext = Contexto441;
  });
  const cifras = await cifrasCon15Hz(page);
  expect(await page.evaluate(() => new AudioContext().sampleRate)).toBe(44100);
  expect(cifras).toEqual(['-- Hz']);
  await expect(nota(page)).toHaveText('--');
});
