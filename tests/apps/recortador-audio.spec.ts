import { test, expect, devices, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
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
 *
 * INSPECCIÓN DEL 19/11/2026 (primera, con el cabo C0199). Bloques del final de este fichero.
 * Esperados resueltos a mano antes de abrir la app:
 *   - CASO 1 (normal): 3 s estéreo, fin 2,29 y inicio 1,13 → 1,16 s. A la frecuencia de salida
 *     (48 kHz aquí) son 55.680 tramas ± 1 → 44 + 55.680 × 4 = 222.764 B ± 4. La primera muestra
 *     cae en la fase del seno a 1,13 s: 440 × 1,13 = 497,2 ciclos → 0,5 · sen(0,4π) · 32.767 ≈
 *     +15.582 (si empezara en 1,12, 492,8 ciclos → −15.582). Rótulos: «00:01.13», «00:02.29» y
 *     «00:01.16».
 *   - CASO 2 (límite): volumen 200 % sobre un seno de 0,8 → 1,6 · sen, recortado a ±1: máximo
 *     32.767, mínimo −32.768, sin saltos de signo, y saturado el 1 − (2/π) · asen(1/1,6) = 57,0 %
 *     de las muestras.
 *   - CASO 3 (rechazo): un .txt avisa y deja la zona de carga; el inicio no pasa del fin (End en
 *     el deslizador del inicio con el fin en 2 s lo deja en 0) ni el fin del inicio.
 *   - Móvil (Pixel 7): 3 s estéreo en WAV → 44 + 3 × frecuencia × 4 B, sin desbordar el ancho.
 * Los test con test.fail() son HALLAZGOS ABIERTOS: el día que se reparen, fallarán por pasar y
 * habrá que quitarles el test.fail() (y cambiar ABIERTO por REPARADO).
 */

const URL_APP = '/recortador-audio/';

/** WAV PCM 16 bits con un seno de `hz` a `amplitud` (por defecto, media amplitud). */
function wavSeno(segundos: number, sampleRate: number, canales: number, hz = 440, amplitud = 0.5): Buffer {
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
    const v = Math.round(amplitud * Math.sin((2 * Math.PI * hz * i) / sampleRate) * 0x7fff);
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

/**
 * OGG con Opus (semilla S0226, 25/10/2026). Esperados derivados a mano:
 *   - Página OGG (RFC 3533): «OggS» en 0-3; la primera página lleva solo OpusHead, así que su
 *     firma va en 28-35 (27 B de cabecera + 1 de tabla de segmentos).
 *   - Granule de la última página (RFC 7845): pre-skip + duración real a 48 kHz. 3 s → 144.000.
 *   - Peso: 48 kbps por canal → 3 s estéreo = 96.000 × 3 / 8 = 36.000 B de audio más las
 *     cabeceras de página (~1 %). Se exige < 1/8 del WAV más pequeño (66.155 B) y > 20.000 B.
 *   - El CRC de cada página se recalcula aquí bit a bit (polinomio 0x04C11DB7, inicio 0).
 */
function crcOggBitABit(bytes: Uint8Array): number {
  let crc = 0;
  for (const byte of bytes) {
    crc ^= byte << 24;
    for (let b = 0; b < 8; b++) crc = crc & 0x80000000 ? ((crc << 1) ^ 0x04c11db7) >>> 0 : (crc << 1) >>> 0;
  }
  return crc >>> 0;
}

function paginasOgg(bytes: number[]): { granule: number; crcOk: boolean; tipo: number }[] {
  const a = Uint8Array.from(bytes);
  const paginas: { granule: number; crcOk: boolean; tipo: number }[] = [];
  let i = 0;
  while (i < a.length) {
    const vista = new DataView(a.buffer, i);
    const n = a[i + 26];
    let largo = 27 + n;
    for (let k = 0; k < n; k++) largo += a[i + 27 + k];
    const copia = a.slice(i, i + largo);
    copia.fill(0, 22, 26);
    paginas.push({
      granule: Number(vista.getBigUint64(6, true)),
      crcOk: crcOggBitABit(copia) === vista.getUint32(22, true),
      tipo: a[i + 5],
    });
    i += largo;
  }
  return paginas;
}

/**
 * Cabo C0622 (reparar 04/11/2026): durante la reproducción la onda se recalculaba entera en cada
 * fotograma (el cursor cambia currentTime, eso redibuja, y el dibujo recorría todas las muestras
 * del canal 0). Se mide por las lecturas de getChannelData(0): con los picos calculados una vez
 * por audio y ancho, reproducir 1,5 s no lee el canal ni una vez más; antes, una por fotograma.
 */
test.describe('recortador-audio · la onda no se recalcula al reproducir', () => {
  test('reproducir 1,5 s no vuelve a recorrer las muestras, y el cursor avanza', async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __lecturasCanal: number };
      w.__lecturasCanal = 0;
      const original = AudioBuffer.prototype.getChannelData;
      AudioBuffer.prototype.getChannelData = function (this: AudioBuffer, canal: number) {
        w.__lecturasCanal++;
        return original.call(this, canal);
      };
    });
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['input[type="file"]']);
    await cargar(page, wavSeno(3, 44_100, 2));
    const lecturas = () => page.evaluate(() => (window as unknown as { __lecturasCanal: number }).__lecturasCanal);
    await expect.poll(lecturas).toBeGreaterThan(0);
    const antes = await lecturas();
    const reloj = page.locator('[class*="currentTime"]');
    const textoAntes = await reloj.innerText();
    await page.getByRole('button', { name: /Reproducir selección/ }).click();
    await page.waitForTimeout(1500);
    // El cursor avanzó (la animación corre de verdad) y la onda no se recalculó
    await expect(reloj).not.toHaveText(textoAntes);
    expect(await lecturas()).toBe(antes);
    await page.getByRole('button', { name: /Detener/ }).click();
  });
});

test.describe('recortador-audio · OGG (Opus)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['input[type="file"]']);
  });

  test('OGG de verdad: páginas con CRC válido, OpusHead, granule exacto, mitad de peso y mismo tono', async ({ page }) => {
    await cargar(page, wavSeno(3, 44_100, 2));
    const ogg = page.getByRole('button', { name: 'OGG (Opus)' });
    await expect(ogg).toBeEnabled();
    // No es el formato por defecto: iPhone y Mac no siempre lo abren
    await expect(ogg).toHaveAttribute('aria-pressed', 'false');
    await ogg.click();

    const { nombre, bytes } = await procesarYDescargar(page);
    expect(nombre).toBe('tono_recortado.ogg');
    expect(texto(bytes, 0, 4)).toBe('OggS');
    expect(texto(bytes, 28, 36)).toBe('OpusHead');
    expect(bytes.length).toBeLessThan(529_244 / 8);
    expect(bytes.length).toBeGreaterThan(20_000);

    const paginas = paginasOgg(bytes);
    expect(paginas.every((p) => p.crcOk)).toBe(true);
    expect(paginas[0].tipo).toBe(0x02);
    expect(paginas.at(-1)?.tipo).toBe(0x04);
    const preSkip = bytes[28 + 10] | (bytes[28 + 11] << 8);
    expect(paginas.at(-1)?.granule).toBe(preSkip + 144_000);

    const r = await analizar(page, bytes);
    expect(r.canales).toBe(2);
    expect(Math.abs(r.duracion - 3)).toBeLessThan(0.06);
    expect(Math.abs(r.hz - 440)).toBeLessThan(5);
  });

  test('el recorte de 1 a 2 s llega al OGG', async ({ page }) => {
    await cargar(page, wavSeno(3, 44_100, 1));
    const rangos = page.locator('input[type="range"]');
    await sembrarValor(page, rangos.nth(1), 2);
    await sembrarValor(page, rangos.nth(0), 1);
    await page.getByRole('button', { name: 'OGG (Opus)' }).click();
    const { bytes } = await procesarYDescargar(page);
    const r = await analizar(page, bytes);
    expect(r.canales).toBe(1);
    expect(Math.abs(r.duracion - 1)).toBeLessThan(0.06);
  });

  test('una nota de voz .opus sin tipo MIME se abre y se recorta', async ({ page }) => {
    // La nota se fabrica con la propia app (OGG con Opus, como las de WhatsApp) y se vuelve a
    // cargar con otro nombre y sin tipo, que es como llega desde algunos sistemas
    await cargar(page, wavSeno(2, 48_000, 1));
    await page.getByRole('button', { name: 'OGG (Opus)' }).click();
    const nota = await procesarYDescargar(page);

    await page.goto(URL_APP);
    await esperarHidratacion(page, ['input[type="file"]']);
    // setInputFiles deduce el tipo del nombre aunque se le pase vacío: el File se arma a mano
    const tipo = await page.locator('input[type="file"]').evaluate((input: HTMLInputElement, arr: number[]) => {
      const dt = new DataTransfer();
      dt.items.add(new File([new Uint8Array(arr)], 'PTT-20261025-WA0001.opus', { type: '' }));
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return input.files[0].type;
    }, nota.bytes);
    // Testigo: si el navegador le pusiera tipo, el caso no probaría nada
    expect(tipo).toBe('');
    await expect(page.getByRole('button', { name: /Recortar y Procesar/ })).toBeVisible();
    await page.getByRole('button', { name: 'OGG (Opus)' }).click();
    const { nombre, bytes } = await procesarYDescargar(page);
    expect(nombre).toBe('PTT-20261025-WA0001_recortado.ogg');
    const r = await analizar(page, bytes);
    expect(Math.abs(r.duracion - 2)).toBeLessThan(0.06);
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
    await expect(page.getByRole('button', { name: 'OGG (Opus)' })).toBeDisabled();
    await expect(page.getByRole('status').filter({ hasText: 'no puede codificar Opus' })).toBeVisible();
    const { nombre, bytes } = await procesarYDescargar(page);
    expect(nombre).toBe('tono_recortado.wav');
    expect(texto(bytes, 0, 4)).toBe('RIFF');
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Inspección del 19/11/2026 (esperados en la cabecera del fichero)
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** WAV PCM 24 bits con un seno de 440 Hz a media amplitud (un original «de estudio»). */
function wavSeno24(segundos: number, sampleRate: number, canales: number): Buffer {
  const tramas = Math.round(segundos * sampleRate);
  const datos = tramas * canales * 3;
  const b = Buffer.alloc(44 + datos);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + datos, 4);
  b.write('WAVE', 8);
  b.write('fmt ', 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(canales, 22);
  b.writeUInt32LE(sampleRate, 24);
  b.writeUInt32LE(sampleRate * canales * 3, 28);
  b.writeUInt16LE(canales * 3, 32);
  b.writeUInt16LE(24, 34);
  b.write('data', 36);
  b.writeUInt32LE(datos, 40);
  for (let i = 0; i < tramas; i++) {
    const v = Math.round(0.5 * Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0x7fffff);
    for (let c = 0; c < canales; c++) b.writeIntLE(v, 44 + (i * canales + c) * 3, 3);
  }
  return b;
}

interface WavLeido {
  canales: number;
  sr: number;
  bits: number;
  tramas: number;
  muestras: Int16Array;
}

/** Cabecera y muestras (16 bits, intercaladas) de un WAV descargado. */
function leerWav(bytes: number[]): WavLeido {
  const a = Uint8Array.from(bytes);
  const v = new DataView(a.buffer);
  const canales = v.getUint16(22, true);
  const bits = v.getUint16(34, true);
  const datos = v.getUint32(40, true);
  const muestras = new Int16Array(Math.floor((a.length - 44) / 2));
  for (let i = 0; i < muestras.length; i++) muestras[i] = v.getInt16(44 + i * 2, true);
  return { canales, sr: v.getUint32(24, true), bits, tramas: datos / (canales * (bits / 8)), muestras };
}

/** Pico absoluto del canal 0 entre los segundos [desde, hasta). */
function picoCanal0(w: WavLeido, desde: number, hasta: number): number {
  let pico = 0;
  const fin = Math.min(Math.floor(hasta * w.sr), w.tramas);
  for (let i = Math.floor(desde * w.sr); i < fin; i++) pico = Math.max(pico, Math.abs(w.muestras[i * w.canales]));
  return pico;
}

/** Segundos de un rótulo «mm:ss.cc». */
function segundosDeRotulo(rotulo: string): number {
  const m = rotulo.match(/(\d\d):(\d\d)\.(\d\d)/);
  if (!m) throw new Error(`Rótulo sin tiempo: «${rotulo}»`);
  return Number(m[1]) * 60 + Number(m[2]) + Number(m[3]) / 100;
}

/** Avisos que da la app, por alert() o en un aviso de la página (sin el anunciador de rutas). */
async function avisosDe(page: Page, alertas: string[]): Promise<string> {
  const enPagina = await page.locator('[role="alert"]').filter({ hasText: /audio|archivo/i }).allInnerTexts();
  return [...alertas, ...enPagina].join(' · ');
}

test.describe('recortador-audio · inspección 19/11/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['input[type="file"]']);
  });

  test('CASO 1 (normal) · de 1,13 a 2,29 s: 1,16 s exactos que empiezan en la fase del seno a 1,13 s', async ({ page }) => {
    await cargar(page, wavSeno(3, 44_100, 2));
    await sembrarValor(page, '#fin-recorte', 2.29);
    await sembrarValor(page, '#inicio-recorte', 1.13);
    await expect(page.locator('#fin-recorte + span')).toHaveText('00:02.29');
    await expect(page.getByText('Duración seleccionada:').locator('xpath=..').locator('strong')).toHaveText('00:01.16');

    await page.getByRole('button', { name: 'WAV' }).click();
    const { nombre, bytes } = await procesarYDescargar(page);
    expect(nombre).toBe('tono_recortado.wav');
    expect(texto(bytes, 0, 4)).toBe('RIFF');
    const w = leerWav(bytes);
    expect(w.bits).toBe(16);
    expect(w.canales).toBe(2);
    // 1,16 s a la frecuencia de salida, con una trama de margen por el redondeo de los extremos
    expect(Math.abs(w.tramas - Math.round(1.16 * w.sr))).toBeLessThanOrEqual(1);
    expect(bytes.length).toBe(44 + w.tramas * 4);
    // +15.582 si empieza en 1,13 s; un corte una centésima antes daría −15.582
    expect(Math.abs(w.muestras[0] - 15_582)).toBeLessThan(1_000);
    await expect(page.getByText(/^Duración: 00:01\.16$/)).toBeVisible();
  });

  test('HALLAZGO (19/11/2026, REPARADO) · el rótulo de tiempo pinta bien la centésima: 1,13 s sale «00:01.13»', async ({ page }) => {
    // formatTime hacía Math.floor((s % 1) * 100) y 1,13 % 1 = 0,12999… → 12. Pasaba en 367 de las
    // 1.001 posiciones de 0,00 a 10,00 s (1,13-1,22, 1,38-1,45, 2,01, 2,03…), y con las flechas,
    // que la guía da como el modo de afinar «de centésima en centésima», 1,14 se leía «00:01.13».
    // Ahora cuenta centésimas enteras (Math.round(s · 100)).
    await cargar(page, wavSeno(3, 44_100, 2));
    await sembrarValor(page, '#inicio-recorte', 1.13);
    await expect(page.locator('#inicio-recorte + span')).toHaveText('00:01.13');
    await page.locator('#inicio-recorte').press('ArrowRight');
    await expect(page.locator('#inicio-recorte')).toHaveValue('1.14');
    await expect(page.locator('#inicio-recorte + span')).toHaveText('00:01.14');
  });

  test('CASO 2 (límite) · volumen 200 % sobre un seno de 0,8: satura en ±32.767 sin dar la vuelta', async ({ page }) => {
    await cargar(page, wavSeno(1, 44_100, 1, 440, 0.8));
    await sembrarValor(page, '#volumen', 200);
    await page.getByRole('button', { name: 'WAV' }).click();
    const w = leerWav((await procesarYDescargar(page)).bytes);
    let maximo = 0;
    let minimo = 0;
    let saturadas = 0;
    let saltos = 0;
    for (let i = 0; i < w.muestras.length; i++) {
      const v = w.muestras[i];
      maximo = Math.max(maximo, v);
      minimo = Math.min(minimo, v);
      if (v === 32_767 || v === -32_768) saturadas++;
      // Un desbordamiento de 16 bits saltaría de +32.767 a −32.768 entre dos muestras seguidas
      if (i > 0 && Math.abs(v - w.muestras[i - 1]) > 40_000) saltos++;
    }
    expect(maximo).toBe(32_767);
    expect(minimo).toBe(-32_768);
    expect(saltos).toBe(0);
    // |1,6 · sen| ≥ 1 el 57,0 % del tiempo
    expect(saturadas / w.muestras.length).toBeGreaterThan(0.52);
    expect(saturadas / w.muestras.length).toBeLessThan(0.62);
  });

  test('HALLAZGO (19/11/2026, REPARADO) · un fundido de 5 s se acota al estrechar la selección a 2 s y el audio llega a su volumen', async ({ page }) => {
    // Con 10 s el fundido llega a 5 s (la mitad de la selección); al dejar la selección en 2 s el
    // deslizador ya solo llega a 1 s y se pinta ahí, pero el estado seguía en 5: el rótulo decía
    // «Fade In: 5,0s» y el WAV aplicaba 5 s de rampa a 2 s de audio (ganancia final 2/5 = 0,4,
    // pico del último medio segundo ≈ 6.550 en vez de 0,5 × 32.767 ≈ 16.383). Ahora se acota a 1 s.
    await cargar(page, wavSeno(10, 44_100, 1));
    await sembrarValor(page, '#fade-in', 5);
    await sembrarValor(page, '#fin-recorte', 2);
    await expect(page.locator('#fade-in')).toHaveAttribute('max', '1');
    await page.getByRole('button', { name: 'WAV' }).click();
    const w = leerWav((await procesarYDescargar(page)).bytes);
    expect(w.tramas).toBe(2 * w.sr);
    expect(picoCanal0(w, 1.5, 2)).toBeGreaterThan(15_000);
    await expect(page.locator('label[for="fade-in"]')).toHaveText(/Fade In: (0,\d|1,0)\s?s/);
  });

  test('HALLAZGO (19/11/2026, REPARADO) · mover el fin o el volumen tras procesar retira el resultado viejo', async ({ page }) => {
    // Cambiar de formato retiraba el resultado (elegirFormato); mover inicio, fin, volumen o
    // fundidos no. Se procesaba de 1 a 2 s, se llevaba el fin a 3 s y el recuadro decía «Duración:
    // 00:02.00» mientras «Descargar audio» entregaba el WAV de 1 s (192.044 B a 48 kHz).
    await cargar(page, wavSeno(3, 44_100, 2));
    await sembrarValor(page, '#fin-recorte', 2);
    await sembrarValor(page, '#inicio-recorte', 1);
    await page.getByRole('button', { name: 'WAV' }).click();
    await page.getByRole('button', { name: /Recortar y Procesar/ }).click();
    const descargar = page.getByRole('button', { name: /Descargar audio/ });
    await expect(descargar).toBeVisible({ timeout: 20_000 });
    await sembrarValor(page, '#fin-recorte', 3);
    // Lo correcto: retirar el resultado, o que lo que se descarga sea lo que dice el recuadro
    if (await descargar.isVisible()) {
      const rotulo = await page.getByText(/^Duración: \d\d:\d\d\.\d\d$/).innerText();
      const [d] = await Promise.all([page.waitForEvent('download'), descargar.click()]);
      const w = leerWav([...readFileSync(await d.path())]);
      expect(Math.abs(w.tramas / w.sr - segundosDeRotulo(rotulo))).toBeLessThan(0.02);
    }
    // La reparación elegida: el resultado se retira
    await expect(descargar).toHaveCount(0);

    // Lo mismo con el volumen: se procesa otra vez y se mueve al 50 %
    await page.getByRole('button', { name: /Recortar y Procesar/ }).click();
    await expect(descargar).toBeVisible({ timeout: 20_000 });
    await sembrarValor(page, '#volumen', 50);
    await expect(descargar).toHaveCount(0);
  });

  test('CASO 3 (rechazo) · el inicio no pasa del fin ni el fin del inicio, y el WAV sigue de 0 a 2 s', async ({ page }) => {
    await cargar(page, wavSeno(3, 44_100, 2));
    await sembrarValor(page, '#fin-recorte', 2);
    // End pide 3 s para el inicio, más allá del fin: se descarta
    await page.locator('#inicio-recorte').press('End');
    await expect(page.locator('#inicio-recorte')).toHaveValue('0');
    await expect(page.locator('#inicio-recorte + span')).toHaveText('00:00.00');
    // Home pide 0 s para el fin, igual al inicio: se descarta
    await page.locator('#fin-recorte').press('Home');
    await expect(page.locator('#fin-recorte')).toHaveValue('2');
    await expect(page.locator('#fin-recorte + span')).toHaveText('00:02.00');
    await page.getByRole('button', { name: 'WAV' }).click();
    const w = leerWav((await procesarYDescargar(page)).bytes);
    expect(w.tramas).toBe(2 * w.sr);
  });

  test('CASO 3 (rechazo) · un .txt se rechaza con aviso y la zona de carga sigue ahí', async ({ page }) => {
    const alertas: string[] = [];
    page.on('dialog', (d) => { alertas.push(d.message()); void d.accept(); });
    await page.locator('input[type="file"]').setInputFiles({ name: 'notas.txt', mimeType: 'text/plain', buffer: Buffer.from('hola, esto no es audio') });
    await expect.poll(() => avisosDe(page, alertas)).toMatch(/archivo de audio válido/);
    await expect(page.locator('input[type="file"]')).toHaveCount(1);
    await expect(page.getByRole('button', { name: /Recortar y Procesar/ })).toHaveCount(0);
  });

  test('HALLAZGO (19/11/2026, REPARADO) · un audio que el navegador no decodifica avisa y deja la zona de carga', async ({ page }) => {
    // handleFileSelect fijaba audioFile antes de decodificar y, si decodeAudioData fallaba, avisaba
    // pero no lo devolvía a null: la zona de carga (solo sin audioFile) y el editor (solo con
    // audioInfo) desaparecían los dos, y no había forma de elegir otro archivo sin recargar.
    const alertas: string[] = [];
    page.on('dialog', (d) => { alertas.push(d.message()); void d.accept(); });
    await page.locator('input[type="file"]').setInputFiles({ name: 'falso.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('esto no es audio, '.repeat(60)) });
    await expect.poll(() => avisosDe(page, alertas)).not.toBe('');
    await expect(page.locator('input[type="file"]')).toHaveCount(1);
  });

  test('HALLAZGO (19/11/2026, REPARADO) · con el teclado se puede abrir el selector de archivo', async ({ page }) => {
    // La zona de carga es un <div onClick> sin tabIndex ni teclado y el <input type="file"> iba
    // con display: none, así que el Tab no pasaba por ningún control que cargue audio (WCAG 2.1.1).
    // Ahora el input está oculto solo a la vista y entra en el Tab.
    let abierto = false;
    page.on('filechooser', () => { abierto = true; });
    for (let i = 0; i < 40 && !abierto; i++) {
      await page.keyboard.press('Tab');
      const candidato = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el.tagName === 'A') return false;
        const input = document.querySelector('input[type="file"]');
        if (el === input || (input?.parentElement?.contains(el) ?? false)) return true;
        return /archivo|seleccionar|subir|cargar/i.test(`${el.textContent ?? ''} ${el.getAttribute('aria-label') ?? ''}`);
      });
      if (candidato) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);
        if (!abierto) {
          await page.keyboard.press(' ');
          await page.waitForTimeout(300);
        }
      }
    }
    expect(abierto).toBe(true);
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · tamaños con punto decimal y porcentajes pegados', async ({ page }) => {
    // formatSize usa toFixed: 529.244 B / 1.024 = 516,84 → «516.8 KB». CLAUDE.md §2: «516,8 KB» y
    // «100 %» con espacio duro.
    test.fail();
    await cargar(page, wavSeno(3, 44_100, 2));
    await expect(page.getByText(/516,8\s?KB/)).toBeVisible();
    await expect(page.locator('label[for="volumen"]')).toHaveText(/Volumen: 100[\u00a0\u202f]%/);
  });

  test('C0199 · ningún botón ofrece MP3 y la descripción promete solo M4A, OGG y WAV', async ({ page }) => {
    await cargar(page, wavSeno(1, 44_100, 2));
    const formatos = page.getByRole('heading', { name: 'Formato de salida' }).locator('xpath=..').getByRole('button');
    await expect(formatos).toHaveText(['M4A (AAC)', 'OGG (Opus)', 'WAV']);
    await expect(page.getByRole('button', { name: /MP3/ })).toHaveCount(0);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /exporta a M4A \(AAC\), OGG \(Opus\) o WAV/);
  });

  test('HALLAZGO (19/11/2026, ABIERTO, cierra C0199) · el FAQPage dice que recortar mantiene el formato y la calidad originales', async ({ page }) => {
    // La app siempre vuelve a codificar (un MP3 sale en M4A, OGG o WAV) y su propia FAQ lo dice:
    // «¿Por qué no se puede descargar en MP3?» y «¿Por qué hay que volver a codificar…?».
    test.fail();
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques
      .map((b) => JSON.parse(b) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] })
      .find((j) => j['@type'] === 'FAQPage');
    const pregunta = faq?.mainEntity?.find((e) => /recortar audio y convertir audio/.test(e.name));
    expect(pregunta?.acceptedAnswer.text ?? '').not.toMatch(/manteniendo el formato/);
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · el WAV «sin pérdida» de un original de 24 bits a 96 kHz sale de 16 bits a 48 kHz', async ({ page }) => {
    // decodeAudioData remuestrea a la frecuencia del contexto (la de la tarjeta, 48 kHz aquí) y
    // codificarWav escribe siempre 16 bits. Lo que promete la página: «WAV: sin pérdida, para
    // seguir editando», «El WAV no pierde calidad», «Exporta en WAV (sin pérdida)».
    // Esperado si se cumple: 24 bits y 96 kHz (44 + 96.000 × 2 × 3 = 576.044 B). Hoy: 192.044 B.
    test.fail();
    await cargar(page, wavSeno24(1, 96_000, 2));
    await page.getByRole('button', { name: 'WAV' }).click();
    const w = leerWav((await procesarYDescargar(page)).bytes);
    const conserva = w.bits === 24 && w.sr === 96_000;
    const textoPagina = (await page.locator('body').textContent()) ?? '';
    const prometeSinPerdida = /WAV: sin pérdida|El WAV no pierde calidad|Exporta en WAV \(sin pérdida\)|mantener la máxima calidad/.test(textoPagina);
    expect(conserva || !prometeSinPerdida).toBe(true);
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · la FAQ visible repite tres preguntas con respuestas distintas', async ({ page }) => {
    // La guía tiene dos listas de preguntas: «¿Mis archivos (de audio) son seguros?», «¿Qué es el
    // fade in…?» y «¿Hay límite de tamaño o duración…?» salen dos veces, y una dice «Archivos de
    // hasta 100 MB funcionan sin problemas» y la otra no.
    test.fail();
    for (const pregunta of [/^¿Mis archivos( de audio)? son seguros\?$/, /^¿Qué es el fade in/, /^¿Hay límite de tamaño o duración/]) {
      await expect(page.locator('h3, h4').filter({ hasText: pregunta })).toHaveCount(1);
    }
  });
});

/**
 * La guía (paso 5) dice que «Reproducir selección» sirve «para escuchar exactamente lo que vas a
 * exportar», pero playAudio solo aplica el volumen, no los fundidos. Se mide la salida real con
 * un analizador colgado de todo lo que se conecta al destino del contexto: con un fundido de
 * entrada de 1,5 s, a ~0,2 s la ganancia es ~0,13 y el RMS debería ser ~0,13 del de ~2,4 s.
 * Hoy el cociente es ~1,0.
 */
test.describe('recortador-audio · la previsualización y los fundidos', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __analizador?: AnalyserNode; __rms: () => number };
      const original = AudioNode.prototype.connect as unknown as (this: AudioNode, ...args: unknown[]) => unknown;
      (AudioNode.prototype as unknown as { connect: (...args: unknown[]) => unknown }).connect = function (
        this: AudioNode,
        ...args: unknown[]
      ) {
        if (args[0] instanceof AudioDestinationNode) {
          if (!w.__analizador || w.__analizador.context !== this.context) {
            w.__analizador = this.context.createAnalyser();
            w.__analizador.fftSize = 2048;
          }
          original.call(this, w.__analizador);
        }
        return original.apply(this, args);
      };
      w.__rms = () => {
        const a = w.__analizador;
        if (!a) return -1;
        const d = new Float32Array(a.fftSize);
        a.getFloatTimeDomainData(d);
        return Math.sqrt(d.reduce((s, v) => s + v * v, 0) / d.length);
      };
    });
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['input[type="file"]']);
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · «Reproducir selección» suena sin el fundido que se exportará', async ({ page }) => {
    test.fail();
    await cargar(page, wavSeno(3, 44_100, 2));
    await sembrarValor(page, '#fade-in', 1.5);
    const rms = () => page.evaluate(() => (window as unknown as { __rms: () => number }).__rms());
    await page.getByRole('button', { name: /Reproducir selección/ }).click();
    await page.waitForTimeout(200);
    const pronto = await rms();
    await page.waitForTimeout(2_200);
    const tarde = await rms();
    await page.getByRole('button', { name: /Detener/ }).click();
    expect(tarde).toBeGreaterThan(0.3);
    const textoPagina = (await page.locator('body').textContent()) ?? '';
    const prometeExacto = /exactamente lo que vas a exportar/.test(textoPagina);
    expect(pronto / tarde < 0.5 || !prometeExacto).toBe(true);
  });
});

const PIXEL_7 = devices['Pixel 7'];

test.describe('recortador-audio · móvil (Pixel 7)', () => {
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  test('carga, recorta y descarga un WAV de 3 s sin desbordar el ancho', async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['input[type="file"]']);
    await cargar(page, wavSeno(3, 44_100, 2));
    const ancho = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, vista: window.innerWidth }));
    expect(ancho.scroll).toBeLessThanOrEqual(ancho.vista);
    await page.getByRole('button', { name: 'WAV' }).tap();
    await expect(page.getByRole('button', { name: 'WAV' })).toHaveAttribute('aria-pressed', 'true');
    const { nombre, bytes } = await procesarYDescargar(page);
    expect(nombre).toBe('tono_recortado.wav');
    const w = leerWav(bytes);
    expect(w.canales).toBe(2);
    expect(bytes.length).toBe(44 + 3 * w.sr * 4);
  });
});
