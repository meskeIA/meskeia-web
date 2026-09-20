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

const DT = 0.01; // paso temporal para integración numérica (s)
const T_MAX = 200; // tope de seguridad para integración
const MAX_PUNTOS = 4000; // tope duro del muestreo analítico

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
      if (yi > alturaMax) alturaMax = yi;
    }

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

  // Integración numérica (Euler) con resistencia del aire.
  // El módulo de la fuerza va con |v|², que es el régimen turbulento: F = −k·|v|·v⃗.
  // La caja de fórmulas de la vista la llamaba «modelo lineal» (hallazgo 988).
  const k = p.resistencia;
  let x = 0;
  let y = p.altura;
  let vx = v0x;
  let vy = v0y;
  let t = 0;
  trayectoria.push({ x, y, t, vx, vy });

  while (y >= 0 && t < T_MAX && trayectoria.length < MAX_PUNTOS * 6) {
    const v = Math.hypot(vx, vy);
    const ax = -k * v * vx;
    const ay = -p.gravedad - k * v * vy;
    vx += ax * DT;
    vy += ay * DT;
    x += vx * DT;
    y += vy * DT;
    t += DT;
    if (y > alturaMax) alturaMax = y;
    trayectoria.push({ x, y: Math.max(0, y), t, vx, vy });
    if (y < 0) break;
  }

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
      conResistencia: true,
      trayectoria,
      alcance: ultimo.x,
      alturaMax,
      tiempoVuelo: t,
      vImpacto: Math.hypot(ultimo.vx, ultimo.vy),
      color: COLORES_LANZAMIENTOS[0],
    },
  };
}
