/**
 * Codificación del recorte: WAV (PCM 16 bits, siempre disponible) y M4A con AAC-LC.
 *
 * El M4A lo codifica el propio navegador con WebCodecs (`AudioEncoder`) y lo empaqueta
 * `mp4-muxer`, la misma librería que ya usa recortador-video: no entra ningún paquete nuevo.
 * Hasta el 22/10/2026 la app ofrecía MP3 y OGG y entregaba un WAV con la extensión cambiada
 * (semilla S0220): diez veces más pesado y rechazado por quien mira el contenido, no el nombre.
 *
 * El codificador AAC del sistema solo acepta 44,1 y 48 kHz (medido en Chromium 151 y Edge 155:
 * 22,05 kHz da `supported: false`). Un original a otra frecuencia se remuestrea antes.
 */

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

  const planos = Array.from({ length: canales }, (_, c) => buffer.getChannelData(c));
  for (let inicio = 0; inicio < buffer.length; inicio += TRAMAS_POR_BLOQUE) {
    if (errorCodificador) break;
    const tramas = Math.min(TRAMAS_POR_BLOQUE, buffer.length - inicio);
    // f32-planar: cada canal entero detrás del anterior. Se recorta a [-1, 1] como el WAV,
    // porque el volumen llega al 200 %.
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

  await encoder.flush();
  encoder.close();
  if (errorCodificador) throw errorCodificador;

  muxer.finalize();
  return new Blob([target.buffer], { type: 'audio/mp4' });
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
