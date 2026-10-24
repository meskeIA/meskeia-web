/**
 * Motor del simulador de potencial de acción.
 *
 * Es un **integrador con fuga y umbral** (leaky integrate-and-fire) con una plantilla de
 * potencial de acción: la membrana carga hacia V_reposo + I con constante de tiempo τ, y al
 * cruzar el umbral se dispara una forma fija de 7 ms (2 de espiga y 5 de hiperpolarización;
 * hasta el 24/10/2026 eran 3 y 5). NO es Hodgkin-Huxley —no hay
 * conductancias ni variables de compuerta m/h/n— y llamarlo así era un error en una app que
 * prepara la EBAU, donde el nombre del modelo es materia examinable (hallazgo 982).
 *
 * Tres cosas que este fichero arregla y que no se veían leyendo la vista:
 *
 *  1. El PA arrancaba SIEMPRE en −55 mV (`v = -55` cableado), estuviera donde estuviera el
 *     umbral, que es un deslizador de −65 a −40 mV. Con umbral −65 el trazo daba un salto
 *     vertical de 10 mV hacia arriba en el instante del disparo, y con −45 retrocedía
 *     (hallazgo 980). Ahora la despolarización arranca en el umbral que se acaba de cruzar.
 *
 *  2. La despolarización que un pulso consigue de verdad no es V_reposo + I, que es la
 *     asíntota tras ≥5τ, sino V_reposo + I·(1 − e^(−duración/τ)). Con el pulso de fábrica
 *     de 2 ms eso es solo el 33 % del camino (hallazgos 978 y 979).
 *
 *  3. El refractario era uno solo, absoluto, de 8 ms. La FAQ de la app define además el
 *     RELATIVO —una ventana en la que un estímulo más intenso sí dispara— y el jsonLd lo
 *     anunciaba como característica. Desde el hallazgo 982 el umbral quedaba elevado al
 *     terminar el PA, pero el absoluto seguía siendo la plantilla ENTERA de 8 ms,
 *     hiperpolarización incluida, frente al «absoluto (1-2 ms)» y «relativo (3-5 ms):
 *     hiperpolarización» de la FAQ: ninguna intensidad bajaba de 8 ms entre PA (hallazgo
 *     2954). Ahora la plantilla tiene una espiga de 2 ms (0,5 de subida y 1,5 de bajada), que
 *     es el absoluto, y 5 ms de hiperpolarización, que es el relativo: en ella la membrana
 *     vuelve a integrar el estímulo encima de la plantilla y dispara si cruza un umbral
 *     elevado que decae. Fuera de las dos ventanas, el umbral es el nominal.
 *
 * Casos resueltos a mano en tests/potencial-accion-motor.spec.ts.
 */

export type ModoEstimulo = 'unico' | 'sostenido';

export interface Muestra {
  t: number;
  v: number;
  estimulo: number;
}

export interface Disparo {
  inicio: number;
  pico: number;
}

export interface ResultadoSimulacion {
  trayectoria: Muestra[];
  spikes: Disparo[];
  estimuloMaxAplicado: number;
  alturaMaxAlcanzada: number;
}

export interface ParametrosSimulacion {
  intensidad: number;
  duracionEstimulo: number;
  inicioEstimulo: number;
  umbral: number;
  modo: ModoEstimulo;
  intervaloSostenido: number;
}

export const V_REPOSO = -70; // mV
export const V_PICO = 35; // mV
export const V_HIPER = -85; // mV
export const T_TOTAL = 50; // ms — ventana visible
export const DT = 0.1; // ms — paso de simulación

/** Constante de tiempo de la membrana: cuánto tarda en cargar hacia su asíntota. */
export const TAU = 5.0; // ms

/** Subida de la espiga: del umbral al pico. */
export const T_SUBIDA = 0.5; // ms
/** Bajada de la espiga: del pico al mínimo de la hiperpolarización. */
export const T_BAJADA = 1.5; // ms

/**
 * La espiga entera (subida + bajada): canales de Na⁺ inactivados, el estímulo no cuenta y no hay
 * forma de volver a disparar. Es el «absoluto (1-2 ms)» de la FAQ (hallazgo 2954).
 */
export const REFRACTARIO_ABSOLUTO = T_SUBIDA + T_BAJADA; // 2 ms

/**
 * La hiperpolarización que sigue a la espiga: el umbral sigue elevado y decae, así que un
 * estímulo MÁS INTENSO puede disparar antes de que termine, que es como la propia FAQ define el
 * refractario relativo («relativo (3-5 ms): hiperpolarización»).
 */
export const REFRACTARIO_RELATIVO = 5.0; // ms
/** Cuánto se eleva el umbral justo al terminar el absoluto, en mV. */
export const ELEVACION_UMBRAL = 15.0; // mV

/** Duración de la plantilla de PA: espiga + hiperpolarización. */
export const DURACION_PA = REFRACTARIO_ABSOLUTO + REFRACTARIO_RELATIVO; // 7 ms

/**
 * Despolarización que un pulso de intensidad I y duración d consigue de verdad.
 *
 * Es lo que la tarjeta de resultado debe anunciar. V_reposo + I es la asíntota que la
 * membrana alcanzaría tras un estímulo sostenido de ≥5τ = 25 ms, y el pulso más largo que
 * admite el control dura 5 ms.
 */
export function despolarizacionAlcanzable(intensidad: number, duracion: number): number {
  return V_REPOSO + intensidad * (1 - Math.exp(-duracion / TAU));
}

/** Intensidad mínima que hace falta para cruzar `umbral` con un pulso de `duracion` ms. */
export function intensidadUmbral(umbral: number, duracion: number): number {
  const fraccion = 1 - Math.exp(-duracion / TAU);
  return (umbral - V_REPOSO) / fraccion;
}

export interface RespuestaEstimulo {
  /** Hasta dónde llega la membrana con el estímulo elegido si no disparase (mV). */
  despolarizacion: number;
  /** Intensidad a partir de la cual dispara: con MÁS que esto dispara, con esto o menos no. */
  intensidadNecesaria: number;
}

/**
 * Lo que anuncia la tarjeta «Despolarización del pulso», calculado con el MISMO integrador y el
 * MISMO patrón de pulsos que `simular`, para que nunca contradiga al veredicto.
 *
 * Hasta el primer disparo la membrana es lineal en la intensidad: con u = V − V_reposo, cada paso
 * hace u ← u + (I·s(t) − u)·DT/τ, así que u(t) = I · u₁(t), donde u₁ es la respuesta a 1 u.a. Por
 * eso la neurona dispara si y solo si I · máx u₁ > umbral − V_reposo, y la intensidad necesaria
 * es exactamente (umbral − V_reposo) / máx u₁ dentro de la ventana de `T_TOTAL` ms.
 *
 * Sustituye en la vista a `despolarizacionAlcanzable` e `intensidadUmbral`, que siguen aquí como
 * la forma cerrada de UN pulso aislado en tiempo continuo, y fallaban dos veces:
 *  - en modo sostenido no suman el tren: con pulsos de 5 ms cada 10 ms la neurona dispara con
 *    21 u.a. y la tarjeta pedía 23,7 (hallazgo 3066; 7.874 de 277.160 combinaciones);
 *  - en modo único, la integración por pasos de 0,1 ms llega un 0,8 % más arriba que la fórmula:
 *    con 2,5 ms la neurona disparaba a 38 y la tarjeta pedía 38,1 (hallazgo 2953).
 */
export function respuestaEstimulo(p: ParametrosSimulacion): RespuestaEstimulo {
  // Con umbral infinito la simulación no dispara nunca: es la carga pura de la membrana.
  const unitaria = simular({ ...p, intensidad: 1, umbral: Infinity });
  const maxU1 = Math.max(...unitaria.trayectoria.map((m) => m.v - V_REPOSO));
  return {
    despolarizacion: V_REPOSO + p.intensidad * maxU1,
    intensidadNecesaria: maxU1 > 0 ? (p.umbral - V_REPOSO) / maxU1 : Infinity,
  };
}

/**
 * Plantilla del potencial de acción, arrancando en `vInicio` — el umbral que se acaba de
 * cruzar — en vez de en un −55 mV cableado.
 */
export function formaPA(tDesdeInicio: number, vInicio: number): number {
  if (tDesdeInicio < 0) return V_REPOSO;
  if (tDesdeInicio < T_SUBIDA) {
    // Despolarización rápida (0,5 ms): del umbral al pico
    return vInicio + (V_PICO - vInicio) * (tDesdeInicio / T_SUBIDA);
  }
  if (tDesdeInicio < REFRACTARIO_ABSOLUTO) {
    // Repolarización (1,5 ms): del pico a la hiperpolarización
    return V_PICO + (V_HIPER - V_PICO) * ((tDesdeInicio - T_SUBIDA) / T_BAJADA);
  }
  if (tDesdeInicio < DURACION_PA) {
    // Hiperpolarización + recuperación (5 ms, el refractario relativo): de −85 al reposo
    return V_HIPER + (V_REPOSO - V_HIPER) * ((tDesdeInicio - REFRACTARIO_ABSOLUTO) / REFRACTARIO_RELATIVO);
  }
  return V_REPOSO;
}

/**
 * Umbral efectivo en un instante, contando el refractario relativo.
 *
 * `msDesdeFinAbsoluto` es el tiempo transcurrido desde que terminó la espiga del último PA.
 * Durante la ventana relativa el umbral está elevado y decae exponencialmente hacia el nominal.
 */
export function umbralEfectivo(umbralNominal: number, msDesdeFinAbsoluto: number | null): number {
  if (msDesdeFinAbsoluto === null || msDesdeFinAbsoluto >= REFRACTARIO_RELATIVO) return umbralNominal;
  const decaimiento = Math.exp((-3 * msDesdeFinAbsoluto) / REFRACTARIO_RELATIVO);
  return umbralNominal + ELEVACION_UMBRAL * decaimiento;
}

export function simular(p: ParametrosSimulacion): ResultadoSimulacion {
  const trayectoria: Muestra[] = [];
  const spikes: Disparo[] = [];
  const pasos = Math.floor(T_TOTAL / DT);

  // `u` es la despolarización que el estímulo acumula sobre la línea de base: el reposo fuera
  // de un PA y la plantilla durante la hiperpolarización (refractario relativo). Fuera de un PA
  // v = V_reposo + u, y la integración es la misma de siempre: v ← v + (V_reposo + I − v)·DT/τ.
  let u = 0;
  let v = V_REPOSO;
  // `paso` es el índice del disparo: medir la espiga en pasos y no en ms evita que 2,0000000004
  // caiga del lado equivocado del límite del absoluto.
  let enPA: { paso: number; umbralDisparo: number } | null = null;
  const pasosAbsoluto = Math.round(REFRACTARIO_ABSOLUTO / DT);
  const pasosPA = Math.round(DURACION_PA / DT);
  let estimuloMaxAplicado = 0;

  for (let i = 0; i <= pasos; i++) {
    const t = i * DT;

    let estimuloActual = 0;
    if (p.modo === 'unico') {
      if (t >= p.inicioEstimulo && t < p.inicioEstimulo + p.duracionEstimulo) {
        estimuloActual = p.intensidad;
      }
    } else {
      const desdeInicio = (t - p.inicioEstimulo) % p.intervaloSostenido;
      if (t >= p.inicioEstimulo && desdeInicio < p.duracionEstimulo) {
        estimuloActual = p.intensidad;
      }
    }

    estimuloMaxAplicado = Math.max(estimuloMaxAplicado, estimuloActual);

    const k = enPA ? i - enPA.paso : null;
    if (enPA && k !== null && k <= pasosAbsoluto) {
      // Refractario ABSOLUTO: la espiga sigue su plantilla y el estímulo no cuenta.
      v = formaPA(k * DT, enPA.umbralDisparo);
      u = 0;
    } else {
      u = u + (estimuloActual * 1.0 - u) * (DT / TAU); // 1 mV por unidad de intensidad
      let umbralAhora = p.umbral;
      if (enPA && k !== null && k < pasosPA) {
        // Refractario RELATIVO: el estímulo suma encima de la hiperpolarización y el umbral está
        // elevado; solo uno más intenso que el normal llega a cruzarlo.
        v = formaPA(k * DT, enPA.umbralDisparo) + u;
        umbralAhora = umbralEfectivo(p.umbral, (k - pasosAbsoluto) * DT);
      } else {
        enPA = null;
        v = V_REPOSO + u;
      }

      if (v > umbralAhora) {
        // El PA arranca EN el umbral que se acaba de cruzar, no en un −55 cableado.
        enPA = { paso: i, umbralDisparo: umbralAhora };
        spikes.push({ inicio: t, pico: t + T_SUBIDA });
        v = umbralAhora;
        u = 0;
      }
    }

    trayectoria.push({ t, v, estimulo: estimuloActual });
  }

  return {
    trayectoria,
    spikes,
    estimuloMaxAplicado,
    alturaMaxAlcanzada: Math.max(...trayectoria.map((m) => m.v)),
  };
}
