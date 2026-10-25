/**
 * Empaquetado de paquetes Opus en un archivo OGG (lógica pura, sin DOM ni dependencias).
 *
 * El navegador codifica Opus con WebCodecs (`AudioEncoder`), pero no trae quien lo meta en un
 * contenedor: esto escribe las páginas OGG a mano (semilla S0226, 25/10/2026). Es el formato
 * de las notas de voz de WhatsApp y Telegram.
 *
 * Normas que aplica:
 *  - RFC 3533 (OGG): página = cabecera de 27 B + tabla de segmentos + datos. Cada paquete se
 *    trocea en segmentos de 255 B y uno final de menos de 255 (un 0 si el paquete es múltiplo
 *    exacto de 255). Como mucho 255 segmentos por página. CRC-32 de polinomio 0x04C11DB7, valor
 *    inicial 0, sin reflejar y sin XOR final, calculado con el campo del CRC a cero.
 *  - RFC 7845 (Opus en OGG): la primera página lleva solo `OpusHead` (con la marca de inicio),
 *    la segunda solo `OpusTags`, y después el audio. La posición (granule) cuenta SIEMPRE
 *    muestras a 48 kHz, sea cual sea la frecuencia del original, e incluye el pre-skip: el
 *    reproductor descarta las primeras `preSkip` muestras. En la última página la posición
 *    puede quedar por debajo de lo codificado, y eso recorta el relleno del último paquete.
 */

/** Un paquete Opus tal como sale del codificador, con su duración en muestras a 48 kHz. */
export interface PaqueteOpus {
  datos: Uint8Array;
  muestras48k: number;
}

export interface EntradaOggOpus {
  paquetes: readonly PaqueteOpus[];
  canales: number;
  /** Frecuencia del original; en OpusHead es solo informativa. */
  frecuenciaOriginal: number;
  /** Muestras a 48 kHz que hay que descartar al principio (retardo del codificador). */
  preSkip: number;
  /** Duración real del audio en muestras a 48 kHz: lo que sobra del último paquete se recorta. */
  muestrasAudio48k: number;
  /** Número de serie del flujo (cualquier valor de 32 bits). */
  serie: number;
}

/** Paquetes de audio por página: 50 de 20 ms son un segundo, para que buscar sea rápido. */
const PAQUETES_POR_PAGINA = 50;
const MAX_SEGMENTOS = 255;
const VENDOR = 'meskeIA recortador-audio';

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let r = i << 24;
    for (let b = 0; b < 8; b++) r = r & 0x80000000 ? (r << 1) ^ 0x04c11db7 : r << 1;
    tabla[i] = r >>> 0;
  }
  return tabla;
})();

/** CRC-32 de OGG (no es el de zlib, que va reflejado). */
export function crcOgg(bytes: Uint8Array): number {
  let crc = 0;
  for (let i = 0; i < bytes.length; i++) {
    crc = ((crc << 8) ^ TABLA_CRC[((crc >>> 24) ^ bytes[i]) & 0xff]) >>> 0;
  }
  return crc;
}

/** Segmentos de un paquete: tantos 255 como quepan y el resto (un 0 si no queda resto). */
export function segmentosDe(longitud: number): number[] {
  const segmentos = Array<number>(Math.floor(longitud / 255)).fill(255);
  segmentos.push(longitud % 255);
  return segmentos;
}

// Ningún paquete se parte entre páginas (cabe siempre: un paquete Opus no pasa de 1.275 B, 6
// segmentos), así que no hace falta la marca de continuación (0x01).
const TIPO_INICIO = 0x02;
const TIPO_FIN = 0x04;

function pagina(
  paquetes: readonly Uint8Array[],
  tipo: number,
  granule: number,
  serie: number,
  secuencia: number,
): Uint8Array {
  const tablaSegmentos = paquetes.flatMap((p) => segmentosDe(p.length));
  if (tablaSegmentos.length > MAX_SEGMENTOS) throw new Error('Demasiados segmentos para una página OGG');
  const datos = paquetes.reduce((suma, p) => suma + p.length, 0);
  const salida = new Uint8Array(27 + tablaSegmentos.length + datos);
  const vista = new DataView(salida.buffer);

  salida.set([0x4f, 0x67, 0x67, 0x53], 0); // «OggS»
  salida[4] = 0; // versión
  salida[5] = tipo;
  vista.setBigUint64(6, BigInt(granule), true);
  vista.setUint32(14, serie >>> 0, true);
  vista.setUint32(18, secuencia, true);
  // bytes 22-25: CRC, a cero hasta calcularlo
  salida[26] = tablaSegmentos.length;
  salida.set(tablaSegmentos, 27);
  let desplazamiento = 27 + tablaSegmentos.length;
  for (const p of paquetes) {
    salida.set(p, desplazamiento);
    desplazamiento += p.length;
  }
  vista.setUint32(22, crcOgg(salida), true);
  return salida;
}

/** Cabecera de identificación (RFC 7845, 5.1), familia de canales 0: mono o estéreo. */
export function opusHead(canales: number, preSkip: number, frecuenciaOriginal: number): Uint8Array {
  if (canales < 1 || canales > 2) throw new Error('La familia de canales 0 solo admite 1 o 2 canales');
  const cabecera = new Uint8Array(19);
  const vista = new DataView(cabecera.buffer);
  cabecera.set([...'OpusHead'].map((c) => c.charCodeAt(0)), 0);
  cabecera[8] = 1; // versión
  cabecera[9] = canales;
  vista.setUint16(10, preSkip, true);
  vista.setUint32(12, frecuenciaOriginal, true);
  vista.setInt16(16, 0, true); // ganancia de salida
  cabecera[18] = 0; // familia de canales
  return cabecera;
}

/** Cabecera de comentarios (RFC 7845, 5.2): el codificador y ningún comentario. */
export function opusTags(): Uint8Array {
  const vendor = new TextEncoder().encode(VENDOR);
  const tags = new Uint8Array(8 + 4 + vendor.length + 4);
  const vista = new DataView(tags.buffer);
  tags.set([...'OpusTags'].map((c) => c.charCodeAt(0)), 0);
  vista.setUint32(8, vendor.length, true);
  tags.set(vendor, 12);
  vista.setUint32(12 + vendor.length, 0, true);
  return tags;
}

/** Pre-skip de una descripción `OpusHead` del codificador, o null si no lo es. */
export function preSkipDeDescripcion(descripcion: Uint8Array | null): number | null {
  if (!descripcion || descripcion.length < 19) return null;
  const firma = String.fromCharCode(...descripcion.slice(0, 8));
  if (firma !== 'OpusHead') return null;
  return descripcion[10] | (descripcion[11] << 8);
}

/** Archivo OGG completo con las dos cabeceras y el audio. */
export function empaquetarOggOpus(entrada: EntradaOggOpus): Uint8Array {
  const { paquetes, canales, frecuenciaOriginal, preSkip, muestrasAudio48k, serie } = entrada;
  if (paquetes.length === 0) throw new Error('No hay audio que empaquetar');

  const paginas: Uint8Array[] = [
    pagina([opusHead(canales, preSkip, frecuenciaOriginal)], TIPO_INICIO, 0, serie, 0),
    pagina([opusTags()], 0, 0, serie, 1),
  ];

  // Posición final: el audio real más el pre-skip, sin pasar de lo codificado
  const codificado = paquetes.reduce((suma, p) => suma + p.muestras48k, 0);
  const granuleFinal = Math.min(codificado, preSkip + muestrasAudio48k);

  // Grupos de hasta PAQUETES_POR_PAGINA paquetes que quepan en los 255 segmentos de una página
  const grupos: PaqueteOpus[][] = [];
  let grupo: PaqueteOpus[] = [];
  let segmentos = 0;
  for (const p of paquetes) {
    const suyos = segmentosDe(p.datos.length).length;
    if (grupo.length === PAQUETES_POR_PAGINA || segmentos + suyos > MAX_SEGMENTOS) {
      grupos.push(grupo);
      grupo = [];
      segmentos = 0;
    }
    grupo.push(p);
    segmentos += suyos;
  }
  grupos.push(grupo);

  let acumulado = 0;
  let granuleAnterior = 0;
  grupos.forEach((g, i) => {
    acumulado += g.reduce((suma, p) => suma + p.muestras48k, 0);
    const ultima = i === grupos.length - 1;
    // El recorte del final nunca deja la última página por detrás de la anterior
    const granule = ultima ? Math.max(granuleAnterior, granuleFinal) : acumulado;
    paginas.push(pagina(g.map((p) => p.datos), ultima ? TIPO_FIN : 0, granule, serie, paginas.length));
    granuleAnterior = granule;
  });

  const total = paginas.reduce((suma, p) => suma + p.length, 0);
  const archivo = new Uint8Array(total);
  let desplazamiento = 0;
  for (const p of paginas) {
    archivo.set(p, desplazamiento);
    desplazamiento += p.length;
  }
  return archivo;
}
