/**
 * Núcleo de recorte de vídeo — 100% en el navegador.
 *
 * Flujo:
 *   1. Demultiplexado del MP4 con mp4box.js (extrae muestras codificadas + configuración de códec).
 *   2. Dos modos de recorte:
 *      - Rápido (remux): copia las muestras del rango sin recodificar. Casi instantáneo.
 *        El vídeo arranca en el fotograma clave anterior al punto de inicio marcado.
 *      - Exacto (transcode): decodifica y recodifica el rango con WebCodecs. Preciso al fotograma.
 *   3. Remultiplexado a un MP4 nuevo con mp4-muxer.
 *
 * El archivo nunca sale del dispositivo: no hay ninguna petición de red.
 * Las librerías mp4box y mp4-muxer se cargan de forma diferida (solo al usarlas).
 */

import type { ISOFile, MP4Info, MP4Sample, MP4VideoTrack, MP4AudioTrack, TrakBox } from 'mp4box';

// ─────────────────────────────────────────────────────────────
// Tipos públicos
// ─────────────────────────────────────────────────────────────

export interface VideoCargado {
  isoFile: ISOFile;
  info: MP4Info;
  videoTrack: MP4VideoTrack;
  audioTrack: MP4AudioTrack | null;
  videoSamples: MP4Sample[];
  audioSamples: MP4Sample[];
  /** Configuración del decodificador de vídeo (incluye avcC/hvcC en `description`). */
  videoDecoderConfig: VideoDecoderConfig;
  /** Códec de vídeo para mp4-muxer ('avc' | 'hevc' | 'vp9' | 'av1'). */
  muxerVideoCodec: 'avc' | 'hevc' | 'vp9' | 'av1';
  ancho: number;
  alto: number;
  duracion: number; // segundos
  fps: number;
}

export type ModoRecorte = 'rapido' | 'exacto';

export interface OpcionesRecorte {
  inicio: number; // segundos
  fin: number; // segundos
  modo: ModoRecorte;
  conservarAudio: boolean;
  onProgress?: (fraccion: number) => void;
}

// ─────────────────────────────────────────────────────────────
// Utilidades internas
// ─────────────────────────────────────────────────────────────

const FREQ_INDEX: Record<number, number> = {
  96000: 0, 88200: 1, 64000: 2, 48000: 3, 44100: 4, 32000: 5,
  24000: 6, 22050: 7, 16000: 8, 12000: 9, 11025: 10, 8000: 11, 7350: 12,
};

/** Construye un AudioSpecificConfig de 2 bytes para AAC-LC (perfil 2). */
function crearAscAacLc(sampleRate: number, channels: number): Uint8Array {
  const objectType = 2; // AAC LC
  const freqIdx = FREQ_INDEX[sampleRate] ?? 4; // 44100 por defecto
  const chanCfg = Math.min(channels, 7);
  const byte0 = (objectType << 3) | (freqIdx >> 1);
  const byte1 = ((freqIdx & 1) << 7) | (chanCfg << 3);
  return new Uint8Array([byte0, byte1]);
}

/** Mapea el códec de mp4box al identificador que espera mp4-muxer. */
function mapearCodecMuxer(codec: string): 'avc' | 'hevc' | 'vp9' | 'av1' {
  if (codec.startsWith('avc')) return 'avc';
  if (codec.startsWith('hvc') || codec.startsWith('hev')) return 'hevc';
  if (codec.startsWith('vp09') || codec.startsWith('vp9')) return 'vp9';
  if (codec.startsWith('av01')) return 'av1';
  return 'avc';
}

/** Extrae la caja de configuración del códec (avcC/hvcC…) como Uint8Array sin la cabecera de caja. */
async function extraerDescripcion(isoFile: ISOFile, trackId: number): Promise<Uint8Array | undefined> {
  const mp4box = await import('mp4box');
  const DataStream = mp4box.DataStream;
  const trak: TrakBox = isoFile.getTrackById(trackId);
  const entry = trak.mdia.minf.stbl.stsd.entries[0];
  const box = entry.avcC ?? entry.hvcC ?? entry.vpcC ?? entry.av1C;
  if (!box) return undefined;
  const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
  box.write(stream);
  // Los primeros 8 bytes son la cabecera de la caja (tamaño + tipo); se descartan.
  return new Uint8Array(stream.buffer, 8);
}

const seg = (s: MP4Sample) => s.cts / s.timescale;
const segDts = (s: MP4Sample) => s.dts / s.timescale;

// ─────────────────────────────────────────────────────────────
// 1) Carga y demultiplexado
// ─────────────────────────────────────────────────────────────

export async function cargarVideo(file: File): Promise<VideoCargado> {
  const mp4box = await import('mp4box');
  const createFile = mp4box.createFile;

  const isoFile = createFile();
  const videoSamples: MP4Sample[] = [];
  const audioSamples: MP4Sample[] = [];

  const info = await new Promise<MP4Info>((resolve, reject) => {
    isoFile.onError = (e) => reject(new Error(`No se pudo leer el vídeo (${e}). ¿Es un archivo MP4/MOV válido?`));
    isoFile.onReady = (mp4Info) => {
      if (!mp4Info.videoTracks || mp4Info.videoTracks.length === 0) {
        reject(new Error('El archivo no contiene una pista de vídeo compatible. Este recortador admite MP4 y MOV con vídeo H.264/H.265.'));
        return;
      }
      const vt = mp4Info.videoTracks[0];
      isoFile.setExtractionOptions(vt.id, 'video', { nbSamples: Number.MAX_SAFE_INTEGER });
      const at = mp4Info.audioTracks?.[0];
      if (at) isoFile.setExtractionOptions(at.id, 'audio', { nbSamples: Number.MAX_SAFE_INTEGER });
      isoFile.start();
      resolve(mp4Info);
    };
    isoFile.onSamples = (_id, user, samples) => {
      const destino = user === 'video' ? videoSamples : audioSamples;
      for (const s of samples) destino.push(s);
    };

    file.arrayBuffer().then((buf) => {
      const mp4Buf = buf as ArrayBuffer & { fileStart: number };
      mp4Buf.fileStart = 0;
      isoFile.appendBuffer(mp4Buf);
      isoFile.flush();
    }).catch(reject);
  });

  const videoTrack = info.videoTracks[0];
  const audioTrack = info.audioTracks?.[0] ?? null;

  const descripcion = await extraerDescripcion(isoFile, videoTrack.id);
  const videoDecoderConfig: VideoDecoderConfig = {
    codec: videoTrack.codec,
    codedWidth: videoTrack.video.width,
    codedHeight: videoTrack.video.height,
    description: descripcion,
  };

  const duracion = info.duration / info.timescale;
  const fps = duracion > 0 ? videoTrack.nb_samples / duracion : 30;

  return {
    isoFile,
    info,
    videoTrack,
    audioTrack,
    videoSamples,
    audioSamples,
    videoDecoderConfig,
    muxerVideoCodec: mapearCodecMuxer(videoTrack.codec),
    ancho: videoTrack.video.width,
    alto: videoTrack.video.height,
    duracion,
    fps,
  };
}

// ─────────────────────────────────────────────────────────────
// 2) ¿Está disponible el modo exacto (codificación de vídeo)?
// ─────────────────────────────────────────────────────────────

/** Devuelve la cadena de códec H.264 soportada por el codificador para esas dimensiones, o null. */
async function elegirCodecEncoder(ancho: number, alto: number, fps: number): Promise<string | null> {
  if (typeof VideoEncoder === 'undefined') return null;
  const bitrate = estimarBitrate(ancho, alto, fps);
  // De más capaz (soporta 4K) a más básico.
  const candidatos = ['avc1.640034', 'avc1.640033', 'avc1.640032', 'avc1.640028', 'avc1.4d0028', 'avc1.42e01e'];
  for (const codec of candidatos) {
    try {
      const soporte = await VideoEncoder.isConfigSupported({ codec, width: ancho, height: alto, bitrate, framerate: fps });
      if (soporte.supported) return codec;
    } catch {
      // probar el siguiente
    }
  }
  return null;
}

export async function modoExactoDisponible(v: VideoCargado): Promise<boolean> {
  if (typeof VideoDecoder === 'undefined' || typeof VideoEncoder === 'undefined') return false;
  try {
    const dec = await VideoDecoder.isConfigSupported(v.videoDecoderConfig);
    if (!dec.supported) return false;
  } catch {
    return false;
  }
  return (await elegirCodecEncoder(v.ancho, v.alto, v.fps)) !== null;
}

function estimarBitrate(ancho: number, alto: number, fps: number): number {
  // ~0,08 bits por píxel y fotograma: buen equilibrio calidad/tamaño para pantalla.
  const bruto = ancho * alto * fps * 0.08;
  return Math.round(Math.min(16_000_000, Math.max(2_000_000, bruto)));
}

// ─────────────────────────────────────────────────────────────
// 3) Recorte
// ─────────────────────────────────────────────────────────────

export async function recortar(v: VideoCargado, opts: OpcionesRecorte): Promise<Blob> {
  const mux = await import('mp4-muxer');
  const Muxer = mux.Muxer;
  const ArrayBufferTarget = mux.ArrayBufferTarget;

  const conAudio = opts.conservarAudio && v.audioTrack !== null && v.audioSamples.length > 0;
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    fastStart: 'in-memory',
    // Tolera que la primera trama de cada pista no empiece en 0 (modo exacto y audio),
    // conservando la sincronía relativa entre vídeo y audio.
    firstTimestampBehavior: 'cross-track-offset',
    video: {
      codec: opts.modo === 'exacto' ? 'avc' : v.muxerVideoCodec,
      width: v.ancho,
      height: v.alto,
    },
    ...(conAudio && v.audioTrack
      ? {
          audio: {
            codec: 'aac',
            numberOfChannels: v.audioTrack.audio.channel_count,
            sampleRate: v.audioTrack.audio.sample_rate,
          },
        }
      : {}),
  });

  if (opts.modo === 'rapido') {
    await recorteRapido(v, opts, muxer, conAudio);
  } else {
    await recorteExacto(v, opts, muxer, conAudio);
  }

  muxer.finalize();
  return new Blob([target.buffer], { type: 'video/mp4' });
}

/** Índice de la última muestra de vídeo con fotograma clave cuya presentación es <= inicio. */
function indiceInicioVideo(videoSamples: MP4Sample[], inicio: number): number {
  let idx = 0;
  for (let i = 0; i < videoSamples.length; i++) {
    if (videoSamples[i].is_sync && seg(videoSamples[i]) <= inicio) idx = i;
    else if (seg(videoSamples[i]) > inicio && videoSamples[i].is_sync) break;
  }
  return idx;
}

// Modo rápido: copia de muestras sin decodificar.
async function recorteRapido(
  v: VideoCargado,
  opts: OpcionesRecorte,
  muxer: import('mp4-muxer').Muxer<import('mp4-muxer').ArrayBufferTarget>,
  conAudio: boolean,
): Promise<void> {
  const startIdx = indiceInicioVideo(v.videoSamples, opts.inicio);
  const dtsRef = v.videoSamples[startIdx].dts; // referencia de decodificación (0 del clip)

  let primeraV = true;
  let escritas = 0;
  const inicioDts = segDts(v.videoSamples[startIdx]);
  const totalAprox = Math.max(1, v.videoSamples.filter((s) => segDts(s) >= inicioDts && segDts(s) < opts.fin).length);

  // Se copian las muestras en orden de decodificación desde el fotograma clave.
  // Se usa el DTS (monótono) como marca de tiempo y el offset de composición
  // (CTS − DTS) para preservar el reordenado de los fotogramas B.
  for (let i = startIdx; i < v.videoSamples.length; i++) {
    const s = v.videoSamples[i];
    if (segDts(s) >= opts.fin) break;
    // mp4-muxer espera la marca de presentación (CTS) y deriva el DTS restando el offset.
    const ctsUs = Math.round(((s.cts - dtsRef) / s.timescale) * 1e6);
    const durUs = Math.round((s.duration / s.timescale) * 1e6);
    const compUs = Math.round(((s.cts - s.dts) / s.timescale) * 1e6);
    muxer.addVideoChunkRaw(
      s.data,
      s.is_sync ? 'key' : 'delta',
      ctsUs,
      durUs,
      primeraV ? { decoderConfig: v.videoDecoderConfig } : undefined,
      compUs,
    );
    primeraV = false;
    escritas++;
    if (escritas % 30 === 0) opts.onProgress?.(Math.min(0.99, escritas / totalAprox));
  }

  // El audio se ancla al instante del fotograma clave inicial (presentación real del clip).
  if (conAudio && v.audioTrack) escribirAudio(v, opts, muxer, seg(v.videoSamples[startIdx]));
  opts.onProgress?.(1);
}

// Modo exacto: decodifica el rango y lo recodifica desde el fotograma marcado.
async function recorteExacto(
  v: VideoCargado,
  opts: OpcionesRecorte,
  muxer: import('mp4-muxer').Muxer<import('mp4-muxer').ArrayBufferTarget>,
  conAudio: boolean,
): Promise<void> {
  const codecEncoder = await elegirCodecEncoder(v.ancho, v.alto, v.fps);
  if (!codecEncoder) throw new Error('Este navegador no admite la codificación de vídeo necesaria para el modo exacto. Prueba el modo rápido o usa Chrome/Edge de escritorio.');

  const inicioUs = Math.round(opts.inicio * 1e6);
  const finUs = Math.round(opts.fin * 1e6);
  const estimadas = Math.max(1, Math.round((opts.fin - opts.inicio) * v.fps));
  let recodificadas = 0;
  let primeraEncode = true;
  let errorCodec: Error | null = null;

  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => { errorCodec = e as Error; },
  });
  encoder.configure({
    codec: codecEncoder,
    width: v.ancho,
    height: v.alto,
    bitrate: estimarBitrate(v.ancho, v.alto, v.fps),
    framerate: v.fps,
    // 'realtime' evita fotogramas B: la salida sale en orden monótono, apta para muxear.
    latencyMode: 'realtime',
  });

  const decoder = new VideoDecoder({
    output: (frame) => {
      const t = frame.timestamp; // microsegundos (cts)
      // Se conservan los fotogramas cuya presentación cae en [inicio, fin).
      if (t >= inicioUs - 1 && t < finUs) {
        const desplazado = new VideoFrame(frame, { timestamp: t - inicioUs });
        encoder.encode(desplazado, { keyFrame: primeraEncode });
        primeraEncode = false;
        desplazado.close();
        recodificadas++;
        if (recodificadas % 15 === 0) opts.onProgress?.(Math.min(0.99, recodificadas / estimadas));
      }
      frame.close();
    },
    error: (e) => { errorCodec = e as Error; },
  });
  decoder.configure(v.videoDecoderConfig);

  const startIdx = indiceInicioVideo(v.videoSamples, opts.inicio);
  for (let i = startIdx; i < v.videoSamples.length; i++) {
    const s = v.videoSamples[i];
    if (segDts(s) > opts.fin) break; // ya no hacen falta más muestras para decodificar el rango
    if (errorCodec) throw errorCodec;
    decoder.decode(new EncodedVideoChunk({
      type: s.is_sync ? 'key' : 'delta',
      timestamp: Math.round(seg(s) * 1e6),
      duration: Math.round((s.duration / s.timescale) * 1e6),
      data: s.data,
    }));
  }

  await decoder.flush();
  await encoder.flush();
  encoder.close();
  decoder.close();
  if (errorCodec) throw errorCodec;

  // El audio se copia (sin recodificar): la precisión de fotograma del vídeo manda,
  // y el desfase máximo con el audio (~una trama AAC, ≈21 ms) es imperceptible.
  if (conAudio && v.audioTrack) escribirAudio(v, opts, muxer, opts.inicio);
  opts.onProgress?.(1);
}

// Copia las tramas de audio del rango, desplazando su marca de tiempo a `origen`.
function escribirAudio(
  v: VideoCargado,
  opts: OpcionesRecorte,
  muxer: import('mp4-muxer').Muxer<import('mp4-muxer').ArrayBufferTarget>,
  origen: number,
): void {
  if (!v.audioTrack) return;
  const asc = crearAscAacLc(v.audioTrack.audio.sample_rate, v.audioTrack.audio.channel_count);
  const decoderConfig: AudioDecoderConfig = {
    codec: 'mp4a.40.2',
    sampleRate: v.audioTrack.audio.sample_rate,
    numberOfChannels: v.audioTrack.audio.channel_count,
    description: asc,
  };
  let primera = true;
  for (const s of v.audioSamples) {
    const ts = seg(s);
    if (ts < origen) continue;
    if (ts >= opts.fin) break;
    muxer.addAudioChunkRaw(
      s.data,
      'key',
      Math.round((ts - origen) * 1e6),
      Math.round((s.duration / s.timescale) * 1e6),
      primera ? { decoderConfig } : undefined,
    );
    primera = false;
  }
}
