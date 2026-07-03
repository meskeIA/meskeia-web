/**
 * Declaraciones de tipos mínimas para mp4box.js (sin tipos oficiales).
 * Solo se declara la superficie de la API que usa el recortador de vídeo.
 */
declare module 'mp4box' {
  export type MP4ArrayBuffer = ArrayBuffer & { fileStart: number };

  export interface MP4MediaTrack {
    id: number;
    codec: string;
    timescale: number;
    movie_duration: number;
    duration: number;
    nb_samples: number;
  }

  export interface MP4VideoTrack extends MP4MediaTrack {
    video: { width: number; height: number };
  }

  export interface MP4AudioTrack extends MP4MediaTrack {
    audio: { sample_rate: number; channel_count: number; sample_size: number };
  }

  export interface MP4Info {
    duration: number;
    timescale: number;
    videoTracks: MP4VideoTrack[];
    audioTracks: MP4AudioTrack[];
  }

  export interface MP4Sample {
    data: Uint8Array;
    cts: number;
    dts: number;
    duration: number;
    timescale: number;
    is_sync: boolean;
    size: number;
  }

  export interface MP4Box {
    write(stream: DataStream): void;
  }

  export interface SampleDescriptionEntry {
    avcC?: MP4Box;
    hvcC?: MP4Box;
    vpcC?: MP4Box;
    av1C?: MP4Box;
    esds?: MP4Box;
  }

  export interface TrakBox {
    mdia: { minf: { stbl: { stsd: { entries: SampleDescriptionEntry[] } } } };
  }

  export interface ISOFile {
    onReady?: (info: MP4Info) => void;
    onError?: (error: string) => void;
    onSamples?: (id: number, user: unknown, samples: MP4Sample[]) => void;
    appendBuffer(data: MP4ArrayBuffer): number;
    start(): void;
    stop(): void;
    flush(): void;
    setExtractionOptions(id: number, user: unknown, options: { nbSamples?: number }): void;
    getTrackById(id: number): TrakBox;
  }

  export function createFile(): ISOFile;

  export class DataStream {
    static BIG_ENDIAN: boolean;
    constructor(arrayBuffer?: ArrayBuffer, byteOffset?: number, endianness?: boolean);
    buffer: ArrayBuffer;
  }
}
