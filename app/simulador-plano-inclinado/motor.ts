/**
 * Motor del simulador de plano inclinado: el análisis completo del bloque en una sola pasada.
 *
 * Vive aparte de la vista porque el build compila la página sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── Por qué existe este fichero (28/09/2026) ─────────────────────────────────
 *
 * Hasta esa fecha el cálculo vivía dentro del `useMemo` `fisica` de `page.tsx`. Se TRASLADÓ
 * aquí, sin tocar una sola operación, para que la sección «Casos para clase» (`./casos.ts`)
 * corrija con la MISMA aritmética que pinta el panel «Análisis de fuerzas». Si el panel
 * calculara de una manera y los casos de otra, la app podría suspender una respuesta que ella
 * misma acaba de imprimir. El `useMemo` ahora solo llama a `analizarPlano`.
 *
 * ── Convenio ─────────────────────────────────────────────────────────────────
 *
 *   · g = 9,81 m/s² (la página lo dice junto a los resultados).
 *   · Eje x paralelo al plano, positivo CUESTA ARRIBA. La fuerza aplicada es paralela al plano,
 *     así que no altera la normal: N = m·g·cos θ.
 *   · Reposo si |F − m·g·sen θ| ≤ μₛ·N (el límite exacto cuenta como reposo). En reposo el
 *     rozamiento real es el que equilibra, |F − m·g·sen θ|, y NO μₛ·N.
 *   · Si desliza, el rozamiento es el cinético μₖ·N, opuesto al movimiento.
 *   · Ángulo crítico = arctg μₛ, en grados.
 */

/** m/s² (gravedad estándar en la superficie terrestre). La que usa la app. */
export const G = 9.81;

export type Estado = 'reposo' | 'baja' | 'sube';

export interface ParametrosPlano {
  /** kg */
  masa: number;
  /** grados */
  angulo: number;
  muS: number;
  muK: number;
  /** N, paralela al plano (positiva cuesta arriba) */
  fuerza: number;
  /** m de rampa */
  longitud: number;
}

export interface AnalisisPlano {
  rad: number;
  peso: number;
  pesoParalelo: number;
  pesoPerpendicular: number;
  normal: number;
  rozamientoMaximo: number;
  resultanteSinRozar: number;
  rozamientoReal: number;
  aceleracion: number;
  estado: Estado;
  anguloCritico: number;
  tiempoRecorrido: number | null;
  velocidadFinal: number | null;
  alturaTotal: number;
  energiaPotencial: number;
  trabajoRozamiento: number;
  trabajoFuerza: number;
  energiaCinetica: number | null;
}

/**
 * El cuerpo del antiguo `useMemo` `fisica`, carácter a carácter.
 *
 * `g` es opcional y vale G, la de la app: solo existe para que un test pueda recalcular los
 * casos con otra gravedad y comprobar qué enunciados deben declararla. Es el ÚNICO cambio de
 * texto respecto del `useMemo`: `G` pasa a llamarse `g` en `peso` y en `energiaPotencial`.
 */
export function analizarPlano(
  { masa, angulo, muS, muK, fuerza, longitud }: ParametrosPlano,
  g: number = G,
): AnalisisPlano {
  const rad = (angulo * Math.PI) / 180;
  const peso = masa * g;
  const pesoParalelo = peso * Math.sin(rad); // tiende a bajar el bloque
  const pesoPerpendicular = peso * Math.cos(rad);
  const normal = pesoPerpendicular; // la fuerza aplicada es paralela al plano
  const rozamientoMaximo = muS * normal;

  // Resultante a lo largo del plano SIN contar el rozamiento (positiva: cuesta arriba)
  const resultanteSinRozar = fuerza - pesoParalelo;
  const enReposo = Math.abs(resultanteSinRozar) <= rozamientoMaximo;

  // Rozamiento real: el estático se ajusta para equilibrar; el cinético es fijo
  const rozamientoReal = enReposo ? Math.abs(resultanteSinRozar) : muK * normal;
  const sentido = Math.sign(resultanteSinRozar); // hacia dónde tiende (o se mueve) el bloque
  const aceleracion = enReposo
    ? 0
    : (Math.abs(resultanteSinRozar) - muK * normal) * sentido / masa;

  const estado: Estado = enReposo ? 'reposo' : sentido > 0 ? 'sube' : 'baja';
  const anguloCritico = (Math.atan(muS) * 180) / Math.PI;

  // Cinemática de la bajada completa (solo tiene sentido si el bloque baja desde la cima)
  const bajaLibremente = estado === 'baja';
  const tiempoRecorrido = bajaLibremente
    ? Math.sqrt((2 * longitud) / Math.abs(aceleracion))
    : null;
  const velocidadFinal = bajaLibremente ? Math.abs(aceleracion) * (tiempoRecorrido ?? 0) : null;

  // Balance energético de la bajada completa
  const alturaTotal = longitud * Math.sin(rad);
  const energiaPotencial = masa * g * alturaTotal;
  const trabajoRozamiento = muK * normal * longitud;
  // Trabajo de F en la bajada: F es positiva cuesta arriba y el bloque se desplaza cuesta
  // abajo, así que W = −F·L (positivo si empuja hacia abajo). Sin él, el balance no cierra
  // con F ≠ 0 (hallazgo 1289).
  const trabajoFuerza = -fuerza * longitud;
  const energiaCinetica = bajaLibremente
    ? Math.max(energiaPotencial - trabajoRozamiento + trabajoFuerza, 0)
    : null;

  return {
    rad,
    peso,
    pesoParalelo,
    pesoPerpendicular,
    normal,
    rozamientoMaximo,
    resultanteSinRozar,
    rozamientoReal,
    aceleracion,
    estado,
    anguloCritico,
    tiempoRecorrido,
    velocidadFinal,
    alturaTotal,
    energiaPotencial,
    trabajoRozamiento,
    trabajoFuerza,
    energiaCinetica,
  };
}
