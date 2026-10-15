/**
 * Reparto del zoom de la lupa entre la CÁMARA y la PANTALLA.
 *
 * Ampliar con `transform: scale()` estira un vídeo de 1920×1080: a 4x solo quedan unos
 * 480×270 píxeles con detalle real, que es justo la letra pequeña de un prospecto. Muchos
 * móviles (Chrome en Android) dejan pedir el zoom a la propia cámara, que recorta sobre la
 * resolución completa del sensor (12 MP o más) y entrega el mismo 1080p, pero nítido.
 *
 * Por eso el zoom que elige el usuario se pide primero a la cámara, hasta donde llegue, y
 * solo el resto se aplica en pantalla. Sin capacidad de zoom (iPhone, webcams, cámara
 * frontal), todo va a la pantalla como siempre. Semilla S0201 (13/10/2026).
 */

export interface RangoZoomCamara {
  min: number;
  max: number;
  step: number;
}

export interface RepartoZoom {
  /** Lo que se pide a la cámara con applyConstraints. 1 si no hay capacidad de zoom. */
  camara: number;
  /** Lo que falta, aplicado con scale() sobre el vídeo. */
  pantalla: number;
}

/** Lee la capacidad de zoom de la pista; null si la cámara no la expone o no amplía. */
export function leerRangoZoom(capacidades: { zoom?: Partial<RangoZoomCamara> } | undefined): RangoZoomCamara | null {
  const z = capacidades?.zoom;
  if (!z || typeof z.min !== 'number' || typeof z.max !== 'number') return null;
  // Una cámara que solo ofrece min = max (o un máximo por debajo de 1) no amplía nada.
  if (z.max <= Math.max(1, z.min)) return null;
  // Un mínimo por encima de 1 no cabe en un aumento (1 = sin ampliar): es una cámara que da el
  // zoom en sus propias unidades (100-500, por ejemplo). Tratarlo como aumentos dejaba el vídeo
  // en scale(0,02) dentro del visor negro (hallazgo 3290); todo el zoom va a la pantalla.
  if (z.min > 1) return null;
  // Lo mismo con un mínimo de 0 o menos (0-10, por ejemplo): 0 aumentos no existe, así que esa
  // escala tampoco es de aumentos, y pedirle «2» no tiene por qué ampliar 2 veces (hallazgo 3306).
  // Un mínimo de 0,5 (gran angular) sí es un aumento y se queda.
  if (z.min <= 0) return null;
  return { min: z.min, max: z.max, step: typeof z.step === 'number' && z.step > 0 ? z.step : 0 };
}

export function repartirZoom(zoom: number, rango: RangoZoomCamara | null): RepartoZoom {
  if (!rango) return { camara: 1, pantalla: zoom };
  // Nunca por debajo de 1: un mínimo de 0,5 (gran angular) alejaría en vez de ampliar.
  let camara = Math.min(Math.max(zoom, Math.max(1, rango.min)), rango.max);
  if (rango.step > 0) {
    // Se redondea al paso HACIA ABAJO: si se pasara, la pantalla tendría que encoger.
    // El 1e-9 y el redondeo a milésimas evitan que 15 × 0,1 dé 1,5000000000000002.
    const pasos = Math.floor(camara / rango.step + 1e-9);
    camara = Math.max(Math.max(1, rango.min), Math.round(pasos * rango.step * 1000) / 1000);
  }
  return { camara, pantalla: Math.round((zoom / camara) * 1000) / 1000 };
}
