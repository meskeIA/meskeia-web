/**
 * Codificación del recorte: WAV (PCM 16 bits, siempre disponible), M4A con AAC-LC y OGG con Opus.
 *
 * El M4A lo codifica el propio navegador con WebCodecs (`AudioEncoder`) y lo empaqueta
 * `mp4-muxer`, la misma librería que ya usa recortador-video: no entra ningún paquete nuevo.
 * Hasta el 22/10/2026 la app ofrecía MP3 y OGG y entregaba un WAV con la extensión cambiada
 * (semilla S0220): diez veces más pesado y rechazado por quien mira el contenido, no el nombre.
 *
 * El codificador AAC del sistema solo acepta 44,1 y 48 kHz (medido en Chromium 151 y Edge 155:
 * 22,05 kHz da `supported: false`). Un original a otra frecuencia se remuestrea antes.
 *
 * El OGG (desde el 25/10/2026, semilla S0226) lo codifica el mismo `AudioEncoder` con Opus, y las
 * páginas OGG las escribe `ogg-opus.ts`, porque ninguna dependencia del proyecto lo hace. Opus
 * acepta en Chromium de 8 a 48 kHz, 44,1 incluido (sonda del 25/10/2026); si un navegador no
 * acepta la frecuencia del original, se remuestrea a 48 kHz, la nativa de Opus.
 */

import { empaquetarOggOpus, preSkipDeDescripcion, type PaqueteOpus } from './ogg-opus';

const CODEC_AAC = 'mp4a.40.2';
/** 96 kbps por canal: con 16 bits a 44,1 kHz, el M4A pesa unas siete veces menos que el WAV. */
const bitrateAac = (canales: number): number => 96_000 * canales;
const FRECUENCIAS_AAC = [48_000, 44_100];
/** Tramas por cada `AudioData` que se entrega al codificador (múltiplo del marco AAC de 1024). */
const TRAMAS_POR_BLOQUE = 4096;

/** ¿Puede este navegador codificar AAC? Lo pregunta al codificador, no a la versión del navegador. */
export async function navegadorCodificaAac(): Promise<boolean> {
  if (typeof AudioEncoder === 'undefined') return false;
  try {
    const { supported } = await AudioEncoder.isConfigSupported({
      codec: CODEC_AAC, sampleRate: 48_000, numberOfChannels: 2, bitrate: bitrateAac(2),
    });
    return supported === true;
  } catch {
    return false;
  }
}

/** Primera frecuencia que el codificador acepta para estos canales: la original si vale. */
async function frecuenciaAac(original: number, canales: number): Promise<number | null> {
  const candidatas = [original, ...FRECUENCIAS_AAC.filter((f) => f !== original)];
  for (const sampleRate of candidatas) {
    try {
      const { supported } = await AudioEncoder.isConfigSupported({
        codec: CODEC_AAC, sampleRate, numberOfChannels: canales, bitrate: bitrateAac(canales),
      });
      if (supported) return sampleRate;
    } catch {
      // Configuración rechazada: probar la siguiente
    }
  }
  return null;
}

async function remuestrear(buffer: AudioBuffer, sampleRate: number): Promise<AudioBuffer> {
  const tramas = Math.ceil(buffer.duration * sampleRate);
  const offline = new OfflineAudioContext(buffer.numberOfChannels, tramas, sampleRate);
  const fuente = offline.createBufferSource();
  fuente.buffer = buffer;
  fuente.connect(offline.destination);
  fuente.start();
  return offline.startRendering();
}

/**
 * Entrega el audio al codificador en bloques f32-planar. Cada canal va entero detrás del anterior
 * y se recorta a [-1, 1] como el WAV, porque el volumen llega al 200 %.
 */
async function alimentarCodificador(
  encoder: AudioEncoder,
  buffer: AudioBuffer,
  canales: number,
  hayError: () => boolean,
): Promise<void> {
  const sampleRate = buffer.sampleRate;
  const planos = Array.from({ length: canales }, (_, c) => buffer.getChannelData(c));
  for (let inicio = 0; inicio < buffer.length; inicio += TRAMAS_POR_BLOQUE) {
    if (hayError()) break;
    const tramas = Math.min(TRAMAS_POR_BLOQUE, buffer.length - inicio);
    const datos = new Float32Array(tramas * canales);
    for (let c = 0; c < canales; c++) {
      const plano = planos[c];
      for (let i = 0; i < tramas; i++) {
        datos[c * tramas + i] = Math.max(-1, Math.min(1, plano[inicio + i]));
      }
    }
    const audioData = new AudioData({
      format: 'f32-planar',
      sampleRate,
      numberOfFrames: tramas,
      numberOfChannels: canales,
      timestamp: Math.round((inicio * 1_000_000) / sampleRate),
      data: datos,
    });
    encoder.encode(audioData);
    audioData.close();
    // No acumular el archivo entero en la cola del codificador
    if (encoder.encodeQueueSize > 32) {
      await new Promise<void>((resolve) => encoder.addEventListener('dequeue', () => resolve(), { once: true }));
    }
  }
}

/**
 * Codifica el recorte a M4A (AAC-LC, 96 kbps por canal). Lanza un error si el navegador no puede:
 * quien llama debe haber comprobado antes `navegadorCodificaAac()`.
 */
export async function codificarM4a(original: AudioBuffer): Promise<Blob> {
  // Más de dos canales: el codificador del sistema puede no aceptarlos; se mezcla a estéreo.
  const canales = Math.min(original.numberOfChannels, 2);
  const sampleRate = await frecuenciaAac(original.sampleRate, canales);
  if (sampleRate === null) throw new Error('El navegador no acepta esta configuración AAC');

  const buffer = sampleRate === original.sampleRate && canales === original.numberOfChannels
    ? original
    : await remuestrear(mezclarAEstereo(original, canales), sampleRate);

  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    fastStart: 'in-memory',
    audio: { codec: 'aac', numberOfChannels: canales, sampleRate },
  });

  let errorCodificador: Error | null = null;
  const encoder = new AudioEncoder({
    output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
    error: (e) => { errorCodificador = e instanceof Error ? e : new Error(String(e)); },
  });
  encoder.configure({ codec: CODEC_AAC, sampleRate, numberOfChannels: canales, bitrate: bitrateAac(canales) });

  await alimentarCodificador(encoder, buffer, canales, () => errorCodificador !== null);

  await encoder.flush();
  encoder.close();
  if (errorCodificador) throw errorCodificador;

  muxer.finalize();
  return new Blob([target.buffer], { type: 'audio/mp4' });
}

const CODEC_OPUS = 'opus';
/** 48 kbps por canal: en Opus suena como un AAC de 96 y el archivo pesa la mitad que el M4A. */
const bitrateOpus = (canales: number): number => 48_000 * canales;
/**
 * Retardo de libopus a 48 kHz (6,5 ms). Solo se usa si el codificador no entrega su OpusHead:
 * Chromium la entrega, con este mismo valor.
 */
const PRE_SKIP_LIBOPUS = 312;

/** ¿Puede este navegador codificar Opus? Lo pregunta al codificador, como con el AAC. */
export async function navegadorCodificaOpus(): Promise<boolean> {
  return typeof AudioEncoder !== 'undefined' && opusAcepta(48_000, 2);
}

async function opusAcepta(sampleRate: number, canales: number): Promise<boolean> {
  try {
    const { supported } = await AudioEncoder.isConfigSupported({
      codec: CODEC_OPUS, sampleRate, numberOfChannels: canales, bitrate: bitrateOpus(canales),
    });
    return supported === true;
  } catch {
    return false;
  }
}

/**
 * Codifica el recorte a OGG (Opus, 48 kbps por canal). Lanza un error si el navegador no puede:
 * quien llama debe haber comprobado antes `navegadorCodificaOpus()`.
 */
export async function codificarOgg(original: AudioBuffer): Promise<Blob> {
  // Opus en OGG con la familia de canales 0 solo lleva mono o estéreo
  const canales = Math.min(original.numberOfChannels, 2);
  const mezclado = mezclarAEstereo(original, canales);
  const buffer = (await opusAcepta(mezclado.sampleRate, canales))
    ? mezclado
    : await remuestrear(mezclado, 48_000);
  if (!(await opusAcepta(buffer.sampleRate, canales))) {
    throw new Error('El navegador no acepta esta configuración Opus');
  }
  const sampleRate = buffer.sampleRate;

  const paquetes: PaqueteOpus[] = [];
  let descripcion: Uint8Array | null = null;
  let errorCodificador: Error | null = null;
  const encoder = new AudioEncoder({
    output: (chunk, meta) => {
      const datos = new Uint8Array(chunk.byteLength);
      chunk.copyTo(datos);
      // Duración en microsegundos → muestras a 48 kHz; un marco Opus típico es de 20 ms
      const muestras48k = chunk.duration ? Math.round((chunk.duration * 48_000) / 1_000_000) : 960;
      paquetes.push({ datos, muestras48k });
      const desc = meta?.decoderConfig?.description;
      if (desc && !descripcion) {
        // Copia: el codificador puede reutilizar su memoria
        descripcion = ArrayBuffer.isView(desc)
          ? new Uint8Array(desc.buffer, desc.byteOffset, desc.byteLength).slice()
          : new Uint8Array(desc).slice();
      }
    },
    error: (e) => { errorCodificador = e instanceof Error ? e : new Error(String(e)); },
  });
  encoder.configure({ codec: CODEC_OPUS, sampleRate, numberOfChannels: canales, bitrate: bitrateOpus(canales) });

  await alimentarCodificador(encoder, buffer, canales, () => errorCodificador !== null);

  await encoder.flush();
  encoder.close();
  if (errorCodificador) throw errorCodificador;

  const archivo = empaquetarOggOpus({
    paquetes,
    canales,
    frecuenciaOriginal: sampleRate,
    preSkip: preSkipDeDescripcion(descripcion) ?? PRE_SKIP_LIBOPUS,
    muestrasAudio48k: Math.round((buffer.length * 48_000) / sampleRate),
    serie: crypto.getRandomValues(new Uint32Array(1))[0],
  });
  return new Blob([archivo], { type: 'audio/ogg' });
}

/** Con 3 o más canales, mezcla los impares a la izquierda y los pares a la derecha. */
function mezclarAEstereo(buffer: AudioBuffer, canales: number): AudioBuffer {
  if (canales === buffer.numberOfChannels) return buffer;
  const mezcla = new AudioBuffer({ numberOfChannels: canales, length: buffer.length, sampleRate: buffer.sampleRate });
  const cuenta = Array.from({ length: canales }, () => 0);
  for (let c = 0; c < buffer.numberOfChannels; c++) cuenta[c % canales]++;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const origen = buffer.getChannelData(c);
    const destino = mezcla.getChannelData(c % canales);
    const peso = 1 / cuenta[c % canales];
    for (let i = 0; i < origen.length; i++) destino[i] += origen[i] * peso;
  }
  return mezcla;
}

/** WAV PCM de 16 bits: el formato sin pérdida, que cualquier navegador puede escribir. */
export function codificarWav(buffer: AudioBuffer): Blob {
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // Escribir encabezado WAV
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  // Escribir datos de audio
  const channels: Float32Array[] = [];
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
