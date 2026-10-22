import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Recortador de Audio — test de regresión escrito al construir la semilla S0220 (22/10/2026).
 *
 * QUÉ SE ARREGLÓ: hasta ese día la app ofrecía MP3 (por defecto) y OGG, y entregaba un WAV con
 * la extensión cambiada. Ahora exporta M4A (AAC) codificado con WebCodecs, o WAV, y sin
 * codificador AAC en el navegador solo ofrece WAV y lo dice.
 *
 * CÓMO SE DERIVAN LOS ESPERADOS (a mano, ninguno copiado de la app)
 *   - La entrada es un WAV sintético: 3 s de un seno de 440 Hz a media amplitud.
 *   - El navegador decodifica a la frecuencia de su contexto de audio (la de la tarjeta de
 *     sonido, 48 kHz en esta máquina), no a la del archivo: la frecuencia de salida se lee de la
 *     cabecera del WAV y se exige que sea 44,1 o 48 kHz.
 *   - WAV de salida, 16 bits: 44 B de cabecera + tramas × canales × 2 B. A 48 kHz estéreo,
 *     3 s = 144.000 tramas → 44 + 144.000 × 4 = 576.044 B (a 44,1 kHz, 529.244 B). Recortado
 *     de 1 a 2 s: 48.000 tramas → 44 + 192.000 = 192.044 B (a 44,1 kHz, 176.444 B).
 *   - M4A a 96 kbps por canal: 3 s estéreo ≈ 192.000 × 3 / 8 = 72.000 B de audio, más el
 *     contenedor. Se exige < 1/4 del WAV más pequeño (132.311 B) y > 40.000 B: un WAV renombrado o un
 *     archivo vacío caen fuera.
 *   - El contenedor MP4 empieza por una caja `ftyp` en los bytes 4-7 (ISO/IEC 14496-12, 4.3).
 *   - Al decodificarlo, AAC añade unas 2.112 tramas de arranque y rellena el último marco de
 *     1.024 (≈ 0,07 s a 44,1 kHz): la duración se compara con ±0,12 s.
 *   - El tono se mide contando cruces por cero en el tramo central: 440 Hz → 880 cruces/s.
 */

const URL_APP = '/recortador-audio/';

/** WAV PCM 16 bits con un seno de `hz` a media amplitud. */
function wavSeno(segundos: number, sampleRate: number, canales: number, hz = 440): Buffer {
  const tramas = Math.round(segundos * sampleRate);
  const datos = tramas * canales * 2;
  const b = Buffer.alloc(44 + datos);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + datos, 4);
  b.write('WAVE', 8);
  b.write('fmt ', 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(canales, 22);
  b.writeUInt32LE(sampleRate, 24);
  b.writeUInt32LE(sampleRate * canales * 2, 28);
  b.writeUInt16LE(canales * 2, 32);
  b.writeUInt16LE(16, 34);
  b.write('data', 36);
  b.writeUInt32LE(datos, 40);
  for (let i = 0; i < tramas; i++) {
    const v = Math.round(0.5 * Math.sin((2 * Math.PI * hz * i) / sampleRate) * 0x7fff);
    for (let c = 0; c < canales; c++) b.writeInt16LE(v, 44 + (i * canales + c) * 2);
  }
  return b;
}

async function cargar(page: Page, buffer: Buffer): Promise<void> {
  await page.locator('input[type="file"]').setInputFiles({ name: 'tono.wav', mimeType: 'audio/wav', buffer });
  await expect(page.getByRole('button', { name: /Recortar y Procesar/ })).toBeVisible();
}

async function procesarYDescargar(page: Page): Promise<{ nombre: string; bytes: number[] }> {
  await page.getByRole('button', { name: /Recortar y Procesar/ }).click();
  const descargar = page.getByRole('button', { name: /Descargar audio/ });
  await expect(descargar).toBeVisible({ timeout: 20_000 });
  const [descarga] = await Promise.all([page.waitForEvent('download'), descargar.click()]);
  const ruta = await descarga.path();
  const { readFileSync } = await import('node:fs');
  return { nombre: descarga.suggestedFilename(), bytes: [...readFileSync(ruta)] };
}

/**
 * Decodifica en la página los bytes descargados y mide duración, canales y tono. Se pasan los
 * bytes y no se hace `fetch` del `blob:` del reproductor porque la CSP de la página no lo deja.
 */
async function analizar(page: Page, bytes: number[]) {
  return page.evaluate(async (arr) => {
    const ctx = new OfflineAudioContext(1, 1, 44_100);
    const buf = await ctx.decodeAudioData(new Uint8Array(arr).buffer);
    const ch = buf.getChannelData(0);
    // Cruces por cero en el tramo central (evita el arranque y la cola del códec)
    const desde = Math.floor(buf.length * 0.25);
    const hasta = Math.floor(buf.length * 0.75);
    let cruces = 0;
    for (let i = desde + 1; i < hasta; i++) if ((ch[i - 1] < 0) !== (ch[i] < 0)) cruces++;
    const hz = cruces / 2 / ((hasta - desde) / buf.sampleRate);
    return { duracion: buf.duration, canales: buf.numberOfChannels, hz };
  }, bytes);
}

/** Frecuencia de muestreo escrita en la cabecera de un WAV (bytes 24-27, little-endian). */
const frecuenciaWav = (b: number[]) => b[24] | (b[25] << 8) | (b[26] << 16) | (b[27] << 24);

const texto = (bytes: number[], desde: number, hasta: number) => String.fromCharCode(...bytes.slice(desde, hasta));

test.describe('recortador-audio · exportación real', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['input[type="file"]']);
  });

  test('M4A por defecto: contenedor MP4 de verdad, siete veces más ligero y con el mismo tono', async ({ page }) => {
    await cargar(page, wavSeno(3, 44_100, 2));
    const m4a = page.getByRole('button', { name: 'M4A (AAC)' });
    await expect(m4a).toBeEnabled();
    await expect(m4a).toHaveAttribute('aria-pressed', 'true');

    const { nombre, bytes } = await procesarYDescargar(page);
    expect(nombre).toBe('tono_recortado.m4a');
    expect(texto(bytes, 4, 8)).toBe('ftyp');
    expect(texto(bytes, 0, 4)).not.toBe('RIFF');
    expect(bytes.length).toBeLessThan(529_244 / 4);
    expect(bytes.length).toBeGreaterThan(40_000);

    const r = await analizar(page, bytes);
    expect(r.canales).toBe(2);
    expect(Math.abs(r.duracion - 3)).toBeLessThan(0.12);
    expect(Math.abs(r.hz - 440)).toBeLessThan(5);
  });

  test('WAV: cabecera RIFF y tamaño exacto, con extensión .wav', async ({ page }) => {
    await cargar(page, wavSeno(3, 44_100, 2));
    await page.getByRole('button', { name: 'WAV' }).click();
    const { nombre, bytes } = await procesarYDescargar(page);
    expect(nombre).toBe('tono_recortado.wav');
    expect(texto(bytes, 0, 4)).toBe('RIFF');
    expect(texto(bytes, 8, 12)).toBe('WAVE');
    const sr = frecuenciaWav(bytes);
    expect([44_100, 48_000]).toContain(sr);
    expect(bytes.length).toBe(sr === 48_000 ? 576_044 : 529_244);
  });

  test('el recorte de 1 a 2 s llega al archivo, en WAV y en M4A', async ({ page }) => {
    await cargar(page, wavSeno(3, 44_100, 2));
    const rangos = page.locator('input[type="range"]');
    // Primero el fin (2 > inicio 0) y luego el inicio (1 < fin 2): cada control exige el orden
    await sembrarValor(page, rangos.nth(1), 2);
    await sembrarValor(page, rangos.nth(0), 1);

    await page.getByRole('button', { name: 'WAV' }).click();
    const wav = await procesarYDescargar(page);
    expect(wav.bytes.length).toBe(frecuenciaWav(wav.bytes) === 48_000 ? 192_044 : 176_444);

    await page.getByRole('button', { name: 'M4A (AAC)' }).click();
    const m4a = await procesarYDescargar(page);
    const r = await analizar(page, m4a.bytes);
    expect(Math.abs(r.duracion - 1)).toBeLessThan(0.12);
  });

  test('cambiar de formato retira el resultado anterior (no se descarga un WAV como .m4a)', async ({ page }) => {
    await cargar(page, wavSeno(1, 44_100, 2));
    await page.getByRole('button', { name: 'WAV' }).click();
    await page.getByRole('button', { name: /Recortar y Procesar/ }).click();
    await expect(page.getByRole('button', { name: /Descargar audio/ })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'M4A (AAC)' }).click();
    await expect(page.getByRole('button', { name: /Descargar audio/ })).toHaveCount(0);
  });

  test('un original mono a 22,05 kHz sale en M4A mono, con su duración y su tono', async ({ page }) => {
    // 22,05 kHz es la frecuencia que el codificador AAC rechaza (Chromium 151, Edge 155). Aquí
    // el contexto de audio ya la sube al decodificar; el remuestreo de codificar.ts solo actúa
    // si el propio contexto corre a una frecuencia que el codificador no acepta.
    await cargar(page, wavSeno(3, 22_050, 1));
    const { bytes } = await procesarYDescargar(page);
    expect(texto(bytes, 4, 8)).toBe('ftyp');
    const r = await analizar(page, bytes);
    expect(r.canales).toBe(1);
    expect(Math.abs(r.duracion - 3)).toBeLessThan(0.12);
    expect(Math.abs(r.hz - 440)).toBeLessThan(5);
  });
});

test.describe('recortador-audio · contexto de audio a 22,05 kHz', () => {
  test.beforeEach(async ({ page }) => {
    // Un contexto a una frecuencia que el codificador AAC no acepta obliga a remuestrear
    await page.addInitScript(() => {
      const Original = window.AudioContext;
      window.AudioContext = class extends Original {
        constructor(opciones?: AudioContextOptions) {
          super({ ...opciones, sampleRate: 22_050 });
        }
      };
    });
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['input[type="file"]']);
  });

  test('remuestrea a una frecuencia AAC y conserva duración y tono', async ({ page }) => {
    // Testigo de que la sustitución del contexto ha surtido efecto: si no, el caso no prueba nada
    expect(await page.evaluate(() => new AudioContext().sampleRate)).toBe(22_050);
    await cargar(page, wavSeno(3, 44_100, 2));
    const { bytes } = await procesarYDescargar(page);
    expect(texto(bytes, 4, 8)).toBe('ftyp');
    const r = await analizar(page, bytes);
    expect(r.canales).toBe(2);
    expect(Math.abs(r.duracion - 3)).toBeLessThan(0.12);
    expect(Math.abs(r.hz - 440)).toBeLessThan(5);
  });
});

test.describe('recortador-audio · navegador sin codificador AAC', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      delete (window as unknown as Record<string, unknown>).AudioEncoder;
    });
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['input[type="file"]']);
  });

  test('solo ofrece WAV, lo dice y lo entrega', async ({ page }) => {
    await cargar(page, wavSeno(1, 44_100, 2));
    await expect(page.getByRole('button', { name: 'M4A (AAC)' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'WAV' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('status').filter({ hasText: 'no puede codificar AAC' })).toBeVisible();
    const { nombre, bytes } = await procesarYDescargar(page);
    expect(nombre).toBe('tono_recortado.wav');
    expect(texto(bytes, 0, 4)).toBe('RIFF');
  });
});
