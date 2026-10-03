/**
 * Motor del simulador de tiro parabólico.
 *
 * Vive aparte porque el defecto que lo motivó colgaba la pestaña: vaciar el campo de
 * gravedad dejaba g = 0, y con g = 0 el tiempo de vuelo es Infinity, el número de pasos
 * también, y `dtMuestreo = Infinity / Infinity` es NaN, así que el bucle de muestreo no
 * terminaba nunca mientras empujaba puntos NaN al array (hallazgo 984). El `min={0.1}` del
 * <input type="number"> no acota nada: solo marca `validity.rangeUnderflow`.
 *
 * De ahí las dos defensas que este fichero añade, y que son distintas a propósito:
 *   1. `validarParametros` rechaza lo que no es físicamente calculable y DICE por qué.
 *   2. `MAX_PUNTOS` acota el bucle pase lo que pase. Un motor que se cuelga no es
 *      aceptable aunque su entrada esté validada en otro sitio.
 *
 * Casos resueltos a mano en tests/proyectiles-motor.spec.ts.
 */

export interface Punto {
  x: number;
  y: number;
  t: number;
  vx: number;
  vy: number;
}

export interface Lanzamiento {
  id: string;
  v0: number;
  angulo: number;
  altura: number;
  gravedad: number;
  resistencia: number;
  conResistencia: boolean;
  trayectoria: Punto[];
  alcance: number;
  alturaMax: number;
  tiempoVuelo: number;
  vImpacto: number;
  color: string;
}

export interface ParametrosSimulacion {
  v0: number;
  angulo: number;
  altura: number;
  gravedad: number;
  resistencia: number;
  conResistencia: boolean;
}

export type ResultadoTrayectoria =
  | { ok: true; lanzamiento: Lanzamiento }
  | { ok: false; error: string };

export const GRAVEDADES_PRESET: Record<string, number> = {
  Tierra: 9.81,
  Luna: 1.62,
  Marte: 3.71,
  Júpiter: 24.79,
};

export const COLORES_LANZAMIENTOS: string[] = ['#2E86AB', '#48A9A6', '#F39C12'];

/** Los mismos límites que declaran los controles de la vista. */
export const LIMITES = {
  v0: { min: 1, max: 200 },
  angulo: { min: 0, max: 90 },
  altura: { min: 0, max: 100 },
  gravedad: { min: 0.1, max: 50 },
  resistencia: { min: 0, max: 0.05 },
};

const DT = 0.01; // paso del muestreo analítico (s)
const MAX_PUNTOS = 4000; // tope duro de puntos dibujados

/**
 * Integración con rozamiento: RK4 con paso adaptado a la escala de tiempo del problema.
 *
 * Era Euler semi-implícito con dt = 0,01 s fijo y un tope T_MAX = 200 s. Dos defectos:
 *   · El sesgo de Euler se publicaba con dos decimales: hasta 20 cm (1-3 %) frente a la verdad
 *     del modelo, y con k = 0 —«sin resistencia», dice el deslizador— 40,73 m donde la solución
 *     cerrada da 40,77 m (hallazgo 2754).
 *   · Un vuelo de más de 200 s (g = 0,5 y v₀ = 100 dura 282,84 s) se cortaba en seco y el
 *     último punto, en el aire, se presentaba como impacto: 14.142 m en vez de 20.000 m
 *     (hallazgo 2753).
 *
 * El paso es 1/(PASOS_POR_ESCALA · (k·|v| + √(k·g) + 1/T₀)), donde k·|v| es la tasa de frenado
 * instantánea, √(k·g) la inversa del tiempo de caída a velocidad límite y T₀ el vuelo sin
 * rozamiento. Así hay siempre cientos de pasos por cada escala de tiempo del problema, sea el
 * vuelo de 0,1 s o de 4.000 s, y el número total de pasos queda acotado. Con k = 0 la
 * aceleración es constante y RK4 es exacto: coincide con la solución cerrada.
 *
 * El impacto no es el primer punto bajo el suelo: se busca el instante del cruce de y = 0
 * dentro del último paso (bisección sobre un paso RK4 desde el estado anterior). Lo mismo con
 * el vértice (vy = 0), para que la altura máxima no dependa de dónde caiga la rejilla.
 *
 * Peor caso de los controles (LIMITES): g = 0,1, v₀ = 200, θ = 90°, h₀ = 100 y k = 0 →
 * T₀ = (200 + √(200² + 2·0,1·100))/0,1 = 4.000,5 s, que son ~400 pasos. Con rozamiento el
 * vuelo es más corto y la mayor cuenta medida es de unos pocos miles. MAX_PASOS no está para
 * cortar nada que los controles admitan; si aun así se alcanzara, el motor RECHAZA el cálculo
 * en vez de publicar un punto en el aire como impacto.
 */
const PASOS_POR_ESCALA = 400;
const MAX_PASOS = 500_000;
const ITERACIONES_BISECCION = 60;

/**
 * Un k por defecto que se note. El modo «Con resistencia del aire» arrancaba con k = 0,
 * de modo que anunciaba rozamiento y entregaba el caso ideal hasta que el usuario reparaba
 * en el deslizador: quien no lo viera concluía que la resistencia no afecta (hallazgo 987).
 * 0,01 está a mitad de la escala del deslizador (0 a 0,05) y recorta el alcance de un tiro
 * de 20 m/s a 45° de 40,77 m a 31,26 m: se ve a simple vista.
 */
export const RESISTENCIA_POR_DEFECTO = 0.01;

export function nuevoId(): string {
  return `${Date.now()}-${Math.random()}`;
}

/**
 * Devuelve el motivo del rechazo, o null si los parámetros son calculables.
 *
 * La gravedad negativa no se rechaza por manía: con g < 0 el tiempo de vuelo
 * (v0y + √(v0y² + 2gh₀))/g sale negativo y el alcance con él, y la app los presentaba como
 * resultados —«Alcance horizontal −40,77 m»— sin un solo aviso (hallazgo 985).
 */
export function validarParametros(p: ParametrosSimulacion): string | null {
  if (!Number.isFinite(p.gravedad)) {
    return 'Escribe una gravedad: sin ella no hay trayectoria que calcular.';
  }
  if (p.gravedad < LIMITES.gravedad.min) {
    return 'La gravedad debe ser de al menos 0,1 m/s². Con cero o con un valor negativo el proyectil no cae y no hay tiro parabólico.';
  }
  if (p.gravedad > LIMITES.gravedad.max) {
    return 'La gravedad debe ser como mucho de 50 m/s².';
  }
  if (!Number.isFinite(p.v0) || p.v0 < LIMITES.v0.min) {
    return 'La velocidad inicial debe ser de al menos 1 m/s.';
  }
  if (!Number.isFinite(p.angulo) || p.angulo < LIMITES.angulo.min || p.angulo > LIMITES.angulo.max) {
    return 'El ángulo de lanzamiento debe estar entre 0° y 90°.';
  }
  if (!Number.isFinite(p.altura) || p.altura < LIMITES.altura.min) {
    return 'La altura inicial no puede ser negativa.';
  }
  if (!Number.isFinite(p.resistencia) || p.resistencia < 0) {
    return 'El coeficiente de resistencia no puede ser negativo.';
  }
  return null;
}

/**
 * Componentes de la velocidad inicial, con los infinitésimos de la coma flotante llevados
 * a cero.
 *
 * cos(π/2) no vale 0 sino 6,1·10⁻¹⁷, porque π/2 no se representa exacto: en el tiro
 * vertical el alcance salía 1,2·10⁻¹⁵ m y `formatNumber` lo rotulaba «≈0 m», sugiriendo una
 * imprecisión física que no existe (hallazgo 989). El alcance de un tiro vertical es cero.
 */
function componentes(v0: number, anguloGrados: number): { v0x: number; v0y: number } {
  const rad = (anguloGrados * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    v0x: Math.abs(cos) < 1e-12 ? 0 : v0 * cos,
    v0y: Math.abs(sin) < 1e-12 ? 0 : v0 * sin,
  };
}

export function calcularTrayectoria(p: ParametrosSimulacion): ResultadoTrayectoria {
  const motivo = validarParametros(p);
  if (motivo) return { ok: false, error: motivo };

  const { v0x, v0y } = componentes(p.v0, p.angulo);
  const trayectoria: Punto[] = [];
  let alturaMax = p.altura;

  if (!p.conResistencia) {
    // Solución analítica: y(t) = h + v0y·t − ½·g·t² = 0
    const discriminante = v0y * v0y + 2 * p.gravedad * p.altura;
    const tVuelo = (v0y + Math.sqrt(discriminante)) / p.gravedad;
    const pasos = Math.min(MAX_PUNTOS, Math.max(80, Math.ceil(tVuelo / DT)));
    const dtMuestreo = tVuelo / pasos;

    for (let i = 0; i <= pasos; i++) {
      const ti = i * dtMuestreo;
      const xi = v0x * ti;
      const yi = p.altura + v0y * ti - 0.5 * p.gravedad * ti * ti;
      const vyi = v0y - p.gravedad * ti;
      trayectoria.push({ x: xi, y: Math.max(0, yi), t: ti, vx: v0x, vy: vyi });
    }
    // El vértice exacto, no el punto más alto de la rejilla de muestreo.
    if (v0y > 0) alturaMax = p.altura + (v0y * v0y) / (2 * p.gravedad);

    const ultimo = trayectoria[trayectoria.length - 1];
    return {
      ok: true,
      lanzamiento: {
        id: nuevoId(),
        v0: p.v0,
        angulo: p.angulo,
        altura: p.altura,
        gravedad: p.gravedad,
        resistencia: p.resistencia,
        conResistencia: false,
        trayectoria,
        alcance: ultimo.x,
        alturaMax,
        tiempoVuelo: tVuelo,
        vImpacto: Math.hypot(ultimo.vx, ultimo.vy),
        color: COLORES_LANZAMIENTOS[0],
      },
    };
  }

  // Integración numérica (RK4) con resistencia del aire.
  // El módulo de la fuerza va con |v|², que es el régimen turbulento: F = −k·|v|·v⃗.
  // La caja de fórmulas de la vista la llamaba «modelo lineal» (hallazgo 988).
  const vuelo = integrarConRozamiento(p, v0x, v0y, true);
  if (!vuelo.ok) return { ok: false, error: vuelo.error };

  return {
    ok: true,
    lanzamiento: {
      id: nuevoId(),
      v0: p.v0,
      angulo: p.angulo,
      altura: p.altura,
      gravedad: p.gravedad,
      resistencia: p.resistencia,
      conResistencia: true,
      trayectoria: vuelo.trayectoria,
      alcance: vuelo.alcance,
      alturaMax: vuelo.alturaMax,
      tiempoVuelo: vuelo.tiempoVuelo,
      vImpacto: vuelo.vImpacto,
      color: COLORES_LANZAMIENTOS[0],
    },
  };
}

// ============================================================================
// Rozamiento: RK4 hasta el suelo
// ============================================================================

/** Estado del proyectil: posición y velocidad. */
type Estado = [x: number, y: number, vx: number, vy: number];

type Vuelo =
  | {
      ok: true;
      trayectoria: Punto[];
      alcance: number;
      alturaMax: number;
      tiempoVuelo: number;
      vImpacto: number;
    }
  | { ok: false; error: string };

/** Derivada del estado con a = −g·ĵ − k·|v|·v⃗. */
function derivada(s: Estado, g: number, k: number): Estado {
  const v = Math.hypot(s[2], s[3]);
  return [s[2], s[3], -k * v * s[2], -g - k * v * s[3]];
}

/** Un paso RK4 de duración h desde el estado s. */
function pasoRK4(s: Estado, h: number, g: number, k: number): Estado {
  const a = derivada(s, g, k);
  const b = derivada([s[0] + (h / 2) * a[0], s[1] + (h / 2) * a[1], s[2] + (h / 2) * a[2], s[3] + (h / 2) * a[3]], g, k);
  const c = derivada([s[0] + (h / 2) * b[0], s[1] + (h / 2) * b[1], s[2] + (h / 2) * b[2], s[3] + (h / 2) * b[3]], g, k);
  const d = derivada([s[0] + h * c[0], s[1] + h * c[1], s[2] + h * c[2], s[3] + h * c[3]], g, k);
  return [
    s[0] + (h / 6) * (a[0] + 2 * b[0] + 2 * c[0] + d[0]),
    s[1] + (h / 6) * (a[1] + 2 * b[1] + 2 * c[1] + d[1]),
    s[2] + (h / 6) * (a[2] + 2 * b[2] + 2 * c[2] + d[2]),
    s[3] + (h / 6) * (a[3] + 2 * b[3] + 2 * c[3] + d[3]),
  ];
}

/**
 * Busca, dentro de un paso de duración `h` desde `s`, el instante en que la componente
 * `indice` del estado (1 = y, 3 = vy) cruza a valores ≤ 0. Bisección sobre sub-pasos RK4:
 * el cruce queda con la precisión del propio integrador, no con la de la rejilla.
 */
function cruce(s: Estado, h: number, indice: 1 | 3, g: number, k: number): { dt: number; estado: Estado } {
  let bajo = 0;
  let alto = h;
  let estado = pasoRK4(s, h, g, k);
  for (let i = 0; i < ITERACIONES_BISECCION; i++) {
    const medio = (bajo + alto) / 2;
    const e = pasoRK4(s, medio, g, k);
    if (e[indice] > 0) {
      bajo = medio;
    } else {
      alto = medio;
      estado = e;
    }
  }
  return { dt: alto, estado };
}

/** Tiempo de vuelo sin rozamiento: la escala de tiempo de referencia del paso adaptativo. */
function tiempoVueloIdeal(v0y: number, altura: number, g: number): number {
  return (v0y + Math.sqrt(v0y * v0y + 2 * g * altura)) / g;
}

function integrarConRozamiento(
  p: ParametrosSimulacion,
  v0x: number,
  v0y: number,
  guardar: boolean,
): Vuelo {
  const g = p.gravedad;
  const k = p.resistencia;
  const t0 = tiempoVueloIdeal(v0y, p.altura, g);
  let s: Estado = [0, p.altura, v0x, v0y];
  const puntos: Punto[] = [{ x: 0, y: p.altura, t: 0, vx: v0x, vy: v0y }];

  // Sin altura y sin componente vertical el proyectil ya está en el suelo: no hay vuelo.
  if (!(t0 > 0)) {
    return { ok: true, trayectoria: puntos, alcance: 0, alturaMax: p.altura, tiempoVuelo: 0, vImpacto: Math.hypot(v0x, v0y) };
  }

  const raizKG = Math.sqrt(k * g);
  let t = 0;
  let alturaMax = p.altura;

  for (let paso = 0; paso < MAX_PASOS; paso++) {
    const v = Math.hypot(s[2], s[3]);
    const h = 1 / (PASOS_POR_ESCALA * (k * v + raizKG + 1 / t0));
    const siguiente = pasoRK4(s, h, g, k);

    // Vértice dentro del paso: se refina para que la altura máxima no dependa de la rejilla.
    if (s[3] > 0 && siguiente[3] <= 0) {
      const vertice = cruce(s, h, 3, g, k);
      if (vertice.estado[1] > alturaMax) alturaMax = vertice.estado[1];
      if (guardar && siguiente[1] >= 0) {
        const e = vertice.estado;
        puntos.push({ x: e[0], y: e[1], t: t + vertice.dt, vx: e[2], vy: e[3] });
      }
    }

    // Impacto dentro del paso: instante del cruce de y = 0.
    if (siguiente[1] < 0) {
      const impacto = cruce(s, h, 1, g, k);
      const e = impacto.estado;
      const tImpacto = t + impacto.dt;
      puntos.push({ x: e[0], y: 0, t: tImpacto, vx: e[2], vy: e[3] });
      return {
        ok: true,
        trayectoria: guardar ? diezmar(puntos) : puntos,
        alcance: e[0],
        alturaMax,
        tiempoVuelo: tImpacto,
        vImpacto: Math.hypot(e[2], e[3]),
      };
    }

    s = siguiente;
    t += h;
    if (s[1] > alturaMax) alturaMax = s[1];
    if (guardar) puntos.push({ x: s[0], y: s[1], t, vx: s[2], vy: s[3] });
  }

  return {
    ok: false,
    error:
      'Con estos valores el vuelo es demasiado largo para seguirlo hasta el suelo, y el simulador no publica un alcance que no ha calculado. Prueba con una gravedad mayor o una velocidad menor.',
  };
}

/** Reduce la trayectoria a MAX_PUNTOS para el dibujo, conservando el primero y el último. */
function diezmar(puntos: Punto[]): Punto[] {
  if (puntos.length <= MAX_PUNTOS) return puntos;
  const salto = Math.ceil(puntos.length / MAX_PUNTOS);
  const salida = puntos.filter((_, i) => i % salto === 0);
  const ultimo = puntos[puntos.length - 1];
  if (salida[salida.length - 1] !== ultimo) salida.push(ultimo);
  return salida;
}

// ============================================================================
// Ángulo de máximo alcance
// ============================================================================

export interface AnguloOptimo {
  /** Ángulo (grados) que da el máximo alcance con los demás parámetros fijos. */
  angulo: number;
  /** Alcance a ese ángulo (m). */
  alcance: number;
  /** Cómo se ha obtenido: fórmula cerrada o búsqueda numérica sobre el integrador. */
  metodo: 'analitico' | 'numerico';
}

/**
 * El ángulo de máximo alcance con la velocidad, la altura, la gravedad y el rozamiento dados.
 *
 * La guía daba horquillas sin fuente («35-40° para velocidades altas» con rozamiento,
 * «típicamente 35-42°» desde altura) que la propia app desmentía: a 100 m/s con k = 0,05 el
 * óptimo es 27°, y desde 30 m con 20 m/s, 32,5° (hallazgo 2762). En vez de otra horquilla, el
 * número de cada caso:
 *   · Sin rozamiento, la fórmula cerrada tan θ = v₀/√(v₀² + 2·g·h₀) (con h₀ = 0, 45°).
 *   · Con rozamiento no hay fórmula: búsqueda de sección áurea sobre el mismo integrador que
 *     da el alcance, hasta 0,01°. El alcance es unimodal en θ en [0°, 90°].
 */
export function calcularAnguloOptimo(p: ParametrosSimulacion): AnguloOptimo | null {
  if (validarParametros(p)) return null;
  const g = p.gravedad;

  if (!p.conResistencia || p.resistencia === 0) {
    const theta = Math.atan(p.v0 / Math.sqrt(p.v0 * p.v0 + 2 * g * p.altura));
    const v0x = p.v0 * Math.cos(theta);
    const v0y = p.v0 * Math.sin(theta);
    return {
      angulo: (theta * 180) / Math.PI,
      alcance: v0x * tiempoVueloIdeal(v0y, p.altura, g),
      metodo: 'analitico',
    };
  }

  const alcanceA = (grados: number): number => {
    const { v0x, v0y } = componentes(p.v0, grados);
    const vuelo = integrarConRozamiento(p, v0x, v0y, false);
    return vuelo.ok ? vuelo.alcance : NaN;
  };

  const razon = (Math.sqrt(5) - 1) / 2;
  let a = 0;
  let b = 90;
  let c = b - razon * (b - a);
  let d = a + razon * (b - a);
  let fc = alcanceA(c);
  let fd = alcanceA(d);
  if (!Number.isFinite(fc) || !Number.isFinite(fd)) return null;
  while (b - a > 0.01) {
    if (fc > fd) {
      b = d;
      d = c;
      fd = fc;
      c = b - razon * (b - a);
      fc = alcanceA(c);
    } else {
      a = c;
      c = d;
      fc = fd;
      d = a + razon * (b - a);
      fd = alcanceA(d);
    }
    if (!Number.isFinite(fc) || !Number.isFinite(fd)) return null;
  }
  const angulo = (a + b) / 2;
  const alcance = alcanceA(angulo);
  if (!Number.isFinite(alcance)) return null;
  return { angulo, alcance, metodo: 'numerico' };
}
