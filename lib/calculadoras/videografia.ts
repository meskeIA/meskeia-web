// Calculadoras de videografía técnica — lógica pura
import { SENSORES, type TipoSensor } from './fotografia';

// ─── Utilidades internas ──────────────────────────────────────────────────────

function formatShutter(t: number): string {
  if (t >= 1) return `${Math.round(t * 10) / 10} s`;
  const den = Math.round(1 / t);
  return `1/${den}`;
}

// ─── 1. Regla 180° — obturador para video ────────────────────────────────────

export interface ResultadoRegla180 {
  fps: number;
  obturador_s: number;
  obturadorFormateado: string;
  descripcion: string;
  fps_alternativos: { fps: number; obturador: string }[];
}

export function calcularRegla180(fps: number): ResultadoRegla180 {
  const obturador_s = 1 / (2 * fps);

  const fps_alternativos = [24, 25, 30, 48, 50, 60, 90, 120, 180, 240]
    .filter(f => f !== fps)
    .map(f => ({ fps: f, obturador: formatShutter(1 / (2 * f)) }));

  return {
    fps,
    obturador_s,
    obturadorFormateado: formatShutter(obturador_s),
    descripcion:
      `Según la regla de los 180°, el obturador debe ser el doble del frame rate. ` +
      `A ${fps} fps la velocidad correcta es ${formatShutter(obturador_s)}, ` +
      `lo que produce el motion blur natural que el ojo humano asocia con movimiento fluido.`,
    fps_alternativos,
  };
}

// ─── 2. Cámara lenta — cálculo de slow motion ────────────────────────────────

export interface ResultadoCamaraLenta {
  fps_grabacion: number;
  fps_reproduccion: number;
  factor_lentitud: number;
  duracion_resultado_s: number | null;
  obturador_grabacion: string;
  descripcion: string;
  nivel: string;
}

export function calcularCamaraLenta(
  fps_grabacion: number,
  fps_reproduccion: number,
  duracion_grabacion_s?: number,
): ResultadoCamaraLenta {
  const factor_lentitud = fps_grabacion / fps_reproduccion;
  const duracion_resultado_s =
    duracion_grabacion_s !== undefined ? duracion_grabacion_s * factor_lentitud : null;
  const obturador_grabacion = formatShutter(1 / (2 * fps_grabacion));

  let nivel: string;
  if      (factor_lentitud < 2)   nivel = 'Ligeramente ralentizado';
  else if (factor_lentitud < 4)   nivel = 'Slow motion suave';
  else if (factor_lentitud < 8)   nivel = 'Slow motion marcado';
  else if (factor_lentitud < 20)  nivel = 'Slow motion intenso';
  else                            nivel = 'Ultra slow motion';

  const descripcion = duracion_resultado_s !== null
    ? `${duracion_grabacion_s}s de grabación se reproducen en ${duracion_resultado_s.toFixed(1)}s (${factor_lentitud}× más lento).`
    : `Factor de ralentización: ${factor_lentitud}×.`;

  return {
    fps_grabacion,
    fps_reproduccion,
    factor_lentitud: Math.round(factor_lentitud * 100) / 100,
    duracion_resultado_s: duracion_resultado_s !== null
      ? Math.round(duracion_resultado_s * 10) / 10
      : null,
    obturador_grabacion,
    descripcion,
    nivel,
  };
}

// ─── 3. Filtro ND para video (regla 180°) ─────────────────────────────────────

export interface FiltroNDOpcion {
  paradas: number;
  denominacion: string;
  obturadorResultante: string;
  obturadorResultante_s: number;
  desviacionRegla180_stops: number;
  recomendado: boolean;
}

export interface ResultadoFiltroND {
  fps: number;
  obturadorObjetivo: string;
  obturadorObjetivo_s: number;
  obturadorActual: string;
  paradas_necesarias_exactas: number;
  necesitaND: boolean;
  opciones: FiltroNDOpcion[];
  recomendacion: string;
}

export function calcularFiltroNDVideo(
  fps: number,
  obturador_actual_s: number,
): ResultadoFiltroND {
  const obturadorObjetivo_s = 1 / (2 * fps);
  const necesitaND = obturador_actual_s < obturadorObjetivo_s;
  const paradas_necesarias_exactas = necesitaND
    ? Math.log2(obturadorObjetivo_s / obturador_actual_s)
    : 0;

  const filtrosCatalogo: { paradas: number; denominacion: string }[] = [
    { paradas: 1,  denominacion: 'ND2'    },
    { paradas: 2,  denominacion: 'ND4'    },
    { paradas: 3,  denominacion: 'ND8'    },
    { paradas: 4,  denominacion: 'ND16'   },
    { paradas: 5,  denominacion: 'ND32'   },
    { paradas: 6,  denominacion: 'ND64'   },
    { paradas: 7,  denominacion: 'ND128'  },
    { paradas: 8,  denominacion: 'ND256'  },
    { paradas: 9,  denominacion: 'ND512'  },
    { paradas: 10, denominacion: 'ND1000' },
  ];

  const opciones: FiltroNDOpcion[] = filtrosCatalogo.map(f => {
      const obturadorResultante_s = obturador_actual_s * Math.pow(2, f.paradas);
      const desviacion = Math.abs(Math.log2(obturadorResultante_s / obturadorObjetivo_s));
      return {
        paradas: f.paradas,
        denominacion: f.denominacion,
        obturadorResultante: formatShutter(obturadorResultante_s),
        obturadorResultante_s,
        desviacionRegla180_stops: Math.round(desviacion * 100) / 100,
        recomendado: false,
      };
    });

  // Marcar el filtro más cercano al objetivo que no sobreexpone
  const mejorIdx = opciones.reduce((bestIdx, opt, idx) => {
    if (opt.desviacionRegla180_stops < opciones[bestIdx].desviacionRegla180_stops) return idx;
    return bestIdx;
  }, 0);
  if (opciones[mejorIdx]) opciones[mejorIdx].recomendado = true;

  const recomendacion = necesitaND
    ? `Necesitas ≈${paradas_necesarias_exactas.toFixed(1)} paradas de ND para cumplir la regla de los 180°.`
    : 'Tu velocidad de obturación actual ya es más lenta que la recomendada por la regla 180°. No necesitas filtro ND (considera abrir apertura o bajar ISO).';

  return {
    fps,
    obturadorObjetivo: formatShutter(obturadorObjetivo_s),
    obturadorObjetivo_s,
    obturadorActual: formatShutter(obturador_actual_s),
    paradas_necesarias_exactas: Math.round(paradas_necesarias_exactas * 100) / 100,
    necesitaND,
    opciones,
    recomendacion,
  };
}

// ─── 4. Bitrate y tamaño de archivo de vídeo ─────────────────────────────────

export type TipoResolucionVideo = '8k' | '4k' | '2k' | '1080p' | '720p' | '480p';
export type TipoCodecVideo = 'h264' | 'h265' | 'prores422' | 'raw';

export interface ResultadoBitrateVideo {
  resolucion: TipoResolucionVideo;
  fps: number;
  codec: TipoCodecVideo;
  duracion_min: number;
  bitrate_mbps: number;
  tamano_gb: number;
  tamano_formateado: string;
  descripcion: string;
}

const BITRATE_BASE_H264: Record<TipoResolucionVideo, number> = {
  '8k':    100,
  '4k':    45,
  '2k':    25,
  '1080p': 12,
  '720p':  7,
  '480p':  3,
};

const CODEC_FACTOR: Record<TipoCodecVideo, number> = {
  'h264':     1,
  'h265':     0.55,
  'prores422': 10,
  'raw':      40,
};

const CODEC_NOMBRE: Record<TipoCodecVideo, string> = {
  'h264':     'H.264/AVC',
  'h265':     'H.265/HEVC',
  'prores422': 'ProRes 422',
  'raw':      'RAW (estimación)',
};

export function calcularBitrateVideo(
  resolucion: TipoResolucionVideo,
  fps: number,
  duracion_min: number,
  codec: TipoCodecVideo,
): ResultadoBitrateVideo {
  const bitrate_base = BITRATE_BASE_H264[resolucion];
  const factor_fps   = fps / 30;
  const factor_codec = CODEC_FACTOR[codec];
  const bitrate_mbps = Math.round(bitrate_base * factor_fps * factor_codec * 10) / 10;

  const duracion_s   = duracion_min * 60;
  const tamano_mb    = (bitrate_mbps * duracion_s) / 8;
  const tamano_gb    = tamano_mb / 1024;

  let tamano_formateado: string;
  if      (tamano_gb >= 1)    tamano_formateado = `${tamano_gb.toFixed(2)} GB`;
  else if (tamano_mb >= 1)    tamano_formateado = `${Math.round(tamano_mb)} MB`;
  else                        tamano_formateado = `${Math.round(tamano_mb * 1024)} KB`;

  return {
    resolucion,
    fps,
    codec,
    duracion_min,
    bitrate_mbps,
    tamano_gb: Math.round(tamano_gb * 100) / 100,
    tamano_formateado,
    descripcion: `${resolucion} a ${fps} fps en ${CODEC_NOMBRE[codec]}: ≈${bitrate_mbps} Mbps → ${tamano_formateado} por cada ${duracion_min} min de vídeo.`,
  };
}

// ─── 5. Ángulo de campo (FOV) para vídeo ─────────────────────────────────────

export interface ResultadoFOV {
  focal_mm: number;
  sensor: TipoSensor;
  sensorNombre: string;
  factorCrop: number;
  focalEquivalenteFF: number;
  fov_horizontal_deg: number;
  fov_vertical_deg: number;
  fov_diagonal_deg: number;
  clasificacion: string;
  comparativa: { sensor: TipoSensor; nombre: string; fov_h: number; focal_eq_ff: number }[];
}

export function calcularFOVVideo(
  focal_mm: number,
  sensor: TipoSensor,
): ResultadoFOV {
  const s = SENSORES[sensor];
  const diagonal = Math.sqrt(s.anchoMM ** 2 + s.altoMM ** 2);

  const fov_h = 2 * Math.atan(s.anchoMM / (2 * focal_mm)) * (180 / Math.PI);
  const fov_v = 2 * Math.atan(s.altoMM  / (2 * focal_mm)) * (180 / Math.PI);
  const fov_d = 2 * Math.atan(diagonal   / (2 * focal_mm)) * (180 / Math.PI);

  let clasificacion: string;
  if      (fov_h > 100) clasificacion = 'Ultra gran angular — distorsión pronunciada';
  else if (fov_h > 75)  clasificacion = 'Gran angular extremo';
  else if (fov_h > 55)  clasificacion = 'Gran angular';
  else if (fov_h > 35)  clasificacion = 'Normal-angular — visión próxima a la humana';
  else if (fov_h > 20)  clasificacion = 'Teleobjetivo suave';
  else if (fov_h > 10)  clasificacion = 'Teleobjetivo';
  else                  clasificacion = 'Super teleobjetivo';

  const sensorKeys: TipoSensor[] = ['ff', 'apsc15', 'apsc16', 'm43'];
  const comparativa = sensorKeys.map(k => {
    const sk = SENSORES[k];
    const fh = 2 * Math.atan(sk.anchoMM / (2 * focal_mm)) * (180 / Math.PI);
    return {
      sensor: k,
      nombre: sk.nombre,
      fov_h: Math.round(fh * 10) / 10,
      focal_eq_ff: Math.round(focal_mm * sk.factor * 10) / 10,
    };
  });

  return {
    focal_mm,
    sensor,
    sensorNombre: s.nombre,
    factorCrop: s.factor,
    focalEquivalenteFF: Math.round(focal_mm * s.factor * 10) / 10,
    fov_horizontal_deg: Math.round(fov_h * 10) / 10,
    fov_vertical_deg:   Math.round(fov_v * 10) / 10,
    fov_diagonal_deg:   Math.round(fov_d * 10) / 10,
    clasificacion,
    comparativa,
  };
}
