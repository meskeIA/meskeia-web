import { test, expect } from '@playwright/test';
import {
  crcOgg,
  segmentosDe,
  opusHead,
  opusTags,
  preSkipDeDescripcion,
  empaquetarOggOpus,
  type PaqueteOpus,
} from '../app/recortador-audio/ogg-opus';

/**
 * Empaquetador OGG del recortador de audio (semilla S0226, 25/10/2026) — casos resueltos A MANO.
 *
 * DE DÓNDE SALEN LOS ESPERADOS
 *   - CRC: el de OGG es CRC-32 de polinomio 0x04C11DB7, inicio 0, sin reflejar y sin XOR final.
 *     El catálogo de CRC publica CRC-32/CKSUM (el mismo, con XOR final 0xFFFFFFFF) con valor de
 *     control 0x765E7680 para «123456789»; sin el XOR final: 0x765E7680 ^ 0xFFFFFFFF = 0x89A1897F.
 *     Además cada página se re-comprueba con un CRC bit a bit escrito aquí, no con la tabla de la app.
 *   - OpusHead: los 19 bytes que devolvió el AudioEncoder de Chromium (estéreo, 48 kHz) como
 *     `decoderConfig.description` en la sonda del 25/10/2026, copiados tal cual.
 *   - Segmentos (RFC 3533): 255 B por segmento y uno final < 255; múltiplo exacto → un 0 al final.
 *   - Granule (RFC 7845): muestras a 48 kHz acumuladas al cerrar cada página; la última se recorta
 *     a pre-skip + audio real, sin bajar de la página anterior.
 */

const DESCRIPCION_CHROMIUM = [79, 112, 117, 115, 72, 101, 97, 100, 1, 2, 56, 1, 128, 187, 0, 0, 0, 0, 0];

/** CRC de OGG bit a bit (independiente de la tabla de la app). */
function crcBitABit(bytes: Uint8Array): number {
  let crc = 0;
  for (const byte of bytes) {
    crc ^= byte << 24;
    for (let b = 0; b < 8; b++) crc = crc & 0x80000000 ? ((crc << 1) ^ 0x04c11db7) >>> 0 : (crc << 1) >>> 0;
  }
  return crc >>> 0;
}

interface Pagina {
  tipo: number;
  granule: number;
  serie: number;
  secuencia: number;
  crc: number;
  segmentos: number[];
  datos: Uint8Array;
  crcRecalculado: number;
}

/** Lee las páginas de un OGG: lo que haría un reproductor. */
function leerPaginas(archivo: Uint8Array): Pagina[] {
  const paginas: Pagina[] = [];
  let i = 0;
  while (i < archivo.length) {
    const vista = new DataView(archivo.buffer, archivo.byteOffset + i);
    expect(String.fromCharCode(...archivo.slice(i, i + 4))).toBe('OggS');
    const n = archivo[i + 26];
    const segmentos = [...archivo.slice(i + 27, i + 27 + n)];
    const largo = 27 + n + segmentos.reduce((a, b) => a + b, 0);
    const copia = archivo.slice(i, i + largo);
    copia.fill(0, 22, 26);
    paginas.push({
      tipo: archivo[i + 5],
      granule: Number(vista.getBigUint64(6, true)),
      serie: vista.getUint32(14, true),
      secuencia: vista.getUint32(18, true),
      crc: vista.getUint32(22, true),
      segmentos,
      datos: archivo.slice(i + 27 + n, i + largo),
      crcRecalculado: crcBitABit(copia),
    });
    i += largo;
  }
  return paginas;
}

const paquetes = (n: number, bytes: number, muestras = 960): PaqueteOpus[] =>
  Array.from({ length: n }, (_, k) => ({ datos: new Uint8Array(bytes).fill(k & 0xff), muestras48k: muestras }));

test.describe('ogg-opus · piezas', () => {
  test('CRC de OGG: valor de control de «123456789» y cadena vacía', () => {
    expect(crcOgg(new TextEncoder().encode('123456789'))).toBe(0x89a1897f);
    expect(crcOgg(new Uint8Array(0))).toBe(0);
  });

  test('segmentos: resto, múltiplo exacto de 255 y paquete vacío', () => {
    expect(segmentosDe(0)).toEqual([0]);
    expect(segmentosDe(254)).toEqual([254]);
    expect(segmentosDe(255)).toEqual([255, 0]);
    expect(segmentosDe(600)).toEqual([255, 255, 90]);
  });

  test('OpusHead coincide byte a byte con el que da el codificador de Chromium', () => {
    expect([...opusHead(2, 312, 48_000)]).toEqual(DESCRIPCION_CHROMIUM);
    expect(() => opusHead(3, 312, 48_000)).toThrow();
  });

  test('OpusTags: firma, longitud del vendor y cero comentarios', () => {
    const t = opusTags();
    expect(String.fromCharCode(...t.slice(0, 8))).toBe('OpusTags');
    const vendor = 'meskeIA recortador-audio';
    expect(new DataView(t.buffer).getUint32(8, true)).toBe(vendor.length);
    expect(new TextDecoder().decode(t.slice(12, 12 + vendor.length))).toBe(vendor);
    expect(t.length).toBe(12 + vendor.length + 4);
  });

  test('pre-skip de la descripción del codificador', () => {
    expect(preSkipDeDescripcion(new Uint8Array(DESCRIPCION_CHROMIUM))).toBe(312);
    expect(preSkipDeDescripcion(null)).toBeNull();
    expect(preSkipDeDescripcion(new Uint8Array(19))).toBeNull();
  });
});

test.describe('ogg-opus · archivo', () => {
  test('tres paquetes: cabeceras en su página, recorte del final y CRC válidos', () => {
    const archivo = empaquetarOggOpus({
      paquetes: paquetes(3, 3), canales: 2, frecuenciaOriginal: 48_000,
      preSkip: 312, muestrasAudio48k: 2_000, serie: 0x12345678,
    });
    // (27 + 1 + 19) + (27 + 1 + OpusTags 8 + 4 + 24 + 4) + (27 + 3 + 9)
    expect(archivo.length).toBe(47 + 68 + 39);
    const p = leerPaginas(archivo);
    expect(p).toHaveLength(3);
    expect(p.map((x) => x.tipo)).toEqual([0x02, 0x00, 0x04]);
    expect(p.map((x) => x.secuencia)).toEqual([0, 1, 2]);
    expect(p.every((x) => x.serie === 0x12345678)).toBe(true);
    expect(p.every((x) => x.crc === x.crcRecalculado)).toBe(true);
    expect([...p[0].datos]).toEqual(DESCRIPCION_CHROMIUM);
    expect(p[0].granule).toBe(0);
    expect(p[1].granule).toBe(0);
    // Codificado 3 × 960 = 2.880; audio real 312 + 2.000 = 2.312
    expect(p[2].granule).toBe(2_312);
    expect(p[2].segmentos).toEqual([3, 3, 3]);
  });

  test('120 paquetes de 20 ms: páginas de un segundo y granule acumulado', () => {
    const archivo = empaquetarOggOpus({
      paquetes: paquetes(120, 100), canales: 1, frecuenciaOriginal: 44_100,
      preSkip: 312, muestrasAudio48k: 115_000, serie: 1,
    });
    const p = leerPaginas(archivo);
    // 2 de cabecera + 50 + 50 + 20
    expect(p.map((x) => x.segmentos.length)).toEqual([1, 1, 50, 50, 20]);
    expect(p[2].granule).toBe(48_000);
    expect(p[3].granule).toBe(96_000);
    // Codificado 115.200; real 312 + 115.000 = 115.312 → manda lo codificado
    expect(p[4].granule).toBe(115_200);
    expect(p.every((x) => x.crc === x.crcRecalculado)).toBe(true);
    // OpusHead mono con la frecuencia original informativa (44.100 = 0xAC44)
    expect(p[0].datos[9]).toBe(1);
    expect([...p[0].datos.slice(12, 16)]).toEqual([0x44, 0xac, 0, 0]);
  });

  test('paquetes grandes: la página se corta por los 255 segmentos antes que por los 50 paquetes', () => {
    // 1.275 B = 5 × 255 → 6 segmentos ([255 × 5, 0]); caben 42 por página (252 segmentos)
    const p = leerPaginas(empaquetarOggOpus({
      paquetes: paquetes(60, 1_275), canales: 2, frecuenciaOriginal: 48_000,
      preSkip: 312, muestrasAudio48k: 60 * 960, serie: 7,
    }));
    expect(p.map((x) => x.segmentos.length)).toEqual([1, 1, 252, 108]);
    expect(p[2].granule).toBe(42 * 960);
    expect(p[3].granule).toBe(60 * 960);
    expect(p.every((x) => x.crc === x.crcRecalculado)).toBe(true);
  });

  test('el recorte del final no deja la última página por detrás de la anterior', () => {
    // 51 paquetes: la primera página cierra en 48.000; un audio real de 1.000 muestras
    // pediría 1.312, pero la última no puede bajar de 48.000
    const p = leerPaginas(empaquetarOggOpus({
      paquetes: paquetes(51, 10), canales: 1, frecuenciaOriginal: 48_000,
      preSkip: 312, muestrasAudio48k: 1_000, serie: 7,
    }));
    expect(p[2].granule).toBe(48_000);
    expect(p[3].granule).toBe(48_000);
  });

  test('sin paquetes no hay archivo', () => {
    expect(() => empaquetarOggOpus({
      paquetes: [], canales: 1, frecuenciaOriginal: 48_000, preSkip: 312, muestrasAudio48k: 0, serie: 1,
    })).toThrow();
  });
});
