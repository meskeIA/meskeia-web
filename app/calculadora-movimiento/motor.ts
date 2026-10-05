/**
 * Motor de cinemática de calculadora-movimiento: MRU, MRUA (MRUV) y caída libre, que son
 * el mismo movimiento rectilíneo con aceleración constante —a = 0 en el MRU, a = g en la
 * caída—, más el tiro parabólico.
 *
 * Vive aparte de la vista por dos razones (S0179, 05/10/2026):
 *
 * 1. El simulador anima el móvil y dibuja x(t), v(t) y a(t) a partir de ESTAS funciones, y
 *    las tarjetas de resultado salen de las mismas. Si cifra y dibujo tuvieran fórmulas
 *    propias podrían discrepar sin que nada lo delatara.
 *
 * 2. Antes de S0179 la tarjeta «Distancia» del MRUA imprimía x(t) = v₀·t + ½·a·t², que es el
 *    DESPLAZAMIENTO. Con un móvil que frena, se detiene y retrocede (v₀ = 20 m/s,
 *    a = −5 m/s², t = 6 s), la app decía «Distancia 30 m» cuando el móvil recorre 50 m: 40
 *    hasta pararse en t = 4 s y 10 de vuelta. Es justo el error que el propio bloque
 *    «Errores conceptuales» de la página enseña a evitar. Con la animación a la vista, el
 *    carrito dándose la vuelta habría dejado la cifra en evidencia.
 *
 * Convenio de signos: eje positivo en el sentido de v₀ cuando v₀ > 0. En la caída libre el
 * eje positivo apunta HACIA ABAJO (a = +g), que es el convenio que ya usaba la app: v₀ > 0
 * es lanzar hacia abajo y v₀ < 0, hacia arriba.
 *
 * Casos resueltos a mano en tests/cinematica-motor.spec.ts.
 */

/** Gravedad estándar en la superficie terrestre, m/s². */
export const G = 9.81;

export interface MovimientoRectilineo {
  /** Velocidad inicial, m/s */
  v0: number;
  /** Aceleración constante, m/s² (0 en el MRU) */
  a: number;
}

/** Posición en el instante t, partiendo de x₀ = 0: x = v₀·t + ½·a·t² */
export function posicion({ v0, a }: MovimientoRectilineo, t: number): number {
  return v0 * t + 0.5 * a * t * t;
}

/** Velocidad en el instante t: v = v₀ + a·t */
export function velocidad({ v0, a }: MovimientoRectilineo, t: number): number {
  return v0 + a * t;
}

/**
 * Instante en que la velocidad se anula y cambia de signo (t = −v₀/a), si ocurre después de
 * t = 0. Devuelve null cuando no hay inversión: aceleración nula, móvil que parte del reposo
 * o aceleración en el mismo sentido que la velocidad.
 */
export function instanteParada({ v0, a }: MovimientoRectilineo): number | null {
  if (a === 0 || v0 === 0) return null;
  const t = -v0 / a;
  return t > 0 ? t : null;
}

/**
 * Distancia recorrida entre 0 y t: la longitud del camino, siempre ≥ 0.
 *
 * Si el móvil se para y retrocede dentro del intervalo, suma los dos tramos por separado.
 * Si se para EXACTAMENTE en t, no hay vuelta que sumar y coincide con |x(t)|.
 */
export function distanciaRecorrida(mov: MovimientoRectilineo, t: number): number {
  const tp = instanteParada(mov);
  const xt = posicion(mov, t);
  if (tp === null || tp >= t) return Math.abs(xt);
  const xp = posicion(mov, tp);
  return Math.abs(xp) + Math.abs(xt - xp);
}

export interface ResultadoRectilineo {
  /** x(t): dónde acaba respecto al punto de partida, con signo */
  desplazamiento: number;
  /** Longitud del camino recorrido, ≥ 0 */
  distancia: number;
  /** v(t), con signo */
  velocidadFinal: number;
  /** Instante en que se detiene y da la vuelta, si cae dentro de (0, t) */
  tParada: number | null;
  /** Posición en ese instante: el punto más alejado antes de volver */
  xParada: number | null;
}

/** Resuelve un movimiento rectilíneo de aceleración constante hasta el instante t. */
export function resolverRectilineo(mov: MovimientoRectilineo, t: number): ResultadoRectilineo {
  const tp = instanteParada(mov);
  const dentro = tp !== null && tp < t;
  return {
    desplazamiento: posicion(mov, t),
    distancia: distanciaRecorrida(mov, t),
    velocidadFinal: velocidad(mov, t),
    tParada: dentro ? tp : null,
    xParada: dentro ? posicion(mov, tp) : null,
  };
}

export interface Muestra {
  t: number;
  x: number;
  v: number;
}

/**
 * n + 1 muestras equiespaciadas de 0 a T, para las gráficas. Si el móvil se para dentro del
 * intervalo, se añade además la muestra exacta de la parada: sin ella, el vértice de la
 * parábola x(t) se dibujaría recortado y la gráfica marcaría un máximo menor que el real.
 */
export function muestrear(mov: MovimientoRectilineo, T: number, n = 120): Muestra[] {
  const muestras: Muestra[] = [];
  if (!(T > 0) || n < 1) return muestras;
  for (let i = 0; i <= n; i++) {
    const t = (T * i) / n;
    muestras.push({ t, x: posicion(mov, t), v: velocidad(mov, t) });
  }
  const tp = instanteParada(mov);
  if (tp !== null && tp < T) {
    muestras.push({ t: tp, x: posicion(mov, tp), v: 0 });
    muestras.sort((m1, m2) => m1.t - m2.t);
  }
  return muestras;
}

/**
 * Rango [mín, máx] de x(t) en [0, T], incluido el punto de parada. Lo usa la pista del
 * simulador para que el carrito no se salga cuando retrocede por detrás del origen.
 */
export function rangoPosicion(mov: MovimientoRectilineo, T: number): [number, number] {
  const valores = [0, posicion(mov, T)];
  const tp = instanteParada(mov);
  if (tp !== null && tp < T) valores.push(posicion(mov, tp));
  return [Math.min(...valores), Math.max(...valores)];
}

/**
 * Marcas «redondas» para un eje entre min y max (1, 2, 2,5 o 5 por potencia de 10), con el
 * cero incluido cuando cae dentro. Devuelve el rango ampliado a esas marcas, para que la
 * curva no toque el borde de la gráfica.
 */
export function marcasEje(min: number, max: number, objetivo = 4): { min: number; max: number; marcas: number[] } {
  let lo = Math.min(min, max);
  let hi = Math.max(min, max);
  if (lo === hi) {
    // Recta horizontal (a(t) siempre, v(t) en el MRU): se abre un margen alrededor
    const margen = lo === 0 ? 1 : Math.abs(lo) * 0.5;
    lo -= margen;
    hi += margen;
  }
  const bruto = (hi - lo) / objetivo;
  const potencia = Math.pow(10, Math.floor(Math.log10(bruto)));
  const paso = [1, 2, 2.5, 5, 10].map(f => f * potencia).find(p => p >= bruto) ?? 10 * potencia;
  // Se cuenta en múltiplos enteros del paso y se limpia cada producto: sumar el paso en
  // coma flotante acumula error (3 × 0,1 = 0,30000000000000004) y el eje lo rotularía.
  // El «+ 0» convierte el −0 en 0, para que el eje no rotule «−0».
  const limpio = (k: number) => Number((k * paso).toPrecision(12)) + 0;
  const kInicio = Math.floor(lo / paso + 1e-9);
  const kFin = Math.ceil(hi / paso - 1e-9);
  const marcas: number[] = [];
  for (let k = kInicio; k <= kFin; k++) marcas.push(limpio(k));
  return { min: limpio(kInicio), max: limpio(kFin), marcas };
}

export interface ResultadoParabolico {
  alturaMaxima: number;
  alcance: number;
  tiempoVuelo: number;
  velocidadX: number;
  velocidadY: number;
}

/** Tiro parabólico desde el suelo y de vuelta al mismo nivel, sin rozamiento. */
export function resolverParabolico(v0: number, anguloGrados: number, g = G): ResultadoParabolico {
  const rad = (anguloGrados * Math.PI) / 180;
  const vx = v0 * Math.cos(rad);
  const vy = v0 * Math.sin(rad);
  const tVuelo = (2 * vy) / g;
  return {
    alturaMaxima: (vy * vy) / (2 * g),
    alcance: vx * tVuelo,
    tiempoVuelo: tVuelo,
    velocidadX: vx,
    velocidadY: vy,
  };
}
