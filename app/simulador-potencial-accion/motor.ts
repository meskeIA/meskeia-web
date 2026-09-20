/**
 * Motor del simulador de potencial de acción.
 *
 * Es un **integrador con fuga y umbral** (leaky integrate-and-fire) con una plantilla de
 * potencial de acción: la membrana carga hacia V_reposo + I con constante de tiempo τ, y al
 * cruzar el umbral se dispara una forma fija de 8 ms. NO es Hodgkin-Huxley —no hay
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
 *     anunciaba como característica. Ahora existe: el umbral queda elevado al terminar el
 *     PA y decae exponencialmente durante `REFRACTARIO_RELATIVO` ms.
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

/** Duración de la plantilla de PA. Durante ella no hay forma de volver a disparar. */
export const REFRACTARIO_ABSOLUTO = 8.0; // ms

/**
 * Ventana posterior en la que el umbral sigue elevado y decae: un estímulo MÁS INTENSO
 * puede disparar antes de que termine, que es como la propia FAQ define el refractario
 * relativo.
 */
export const REFRACTARIO_RELATIVO = 6.0; // ms
/** Cuánto se eleva el umbral justo al terminar el PA, en mV. */
export const ELEVACION_UMBRAL = 15.0; // mV

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

/**
 * Plantilla del potencial de acción, arrancando en `vInicio` — el umbral que se acaba de
 * cruzar — en vez de en un −55 mV cableado.
 */
export function formaPA(tDesdeInicio: number, vInicio: number): number {
  if (tDesdeInicio < 0) return V_REPOSO;
  if (tDesdeInicio < 1.0) {
    // Despolarización rápida (1 ms): del umbral al pico
    return vInicio + (V_PICO - vInicio) * (tDesdeInicio / 1.0);
  }
  if (tDesdeInicio < 3.0) {
    // Repolarización (2 ms): del pico a la hiperpolarización
    return V_PICO + (V_HIPER - V_PICO) * ((tDesdeInicio - 1.0) / 2.0);
  }
  if (tDesdeInicio < REFRACTARIO_ABSOLUTO) {
    // Hiperpolarización + recuperación (5 ms): de −85 al reposo
    return V_HIPER + (V_REPOSO - V_HIPER) * ((tDesdeInicio - 3.0) / 5.0);
  }
  return V_REPOSO;
}

/**
 * Umbral efectivo en un instante, contando el refractario relativo.
 *
 * `msDesdeFinPA` es el tiempo transcurrido desde que terminó el último PA. Durante la
 * ventana relativa el umbral está elevado y decae exponencialmente hacia el nominal.
 */
export function umbralEfectivo(umbralNominal: number, msDesdeFinPA: number | null): number {
  if (msDesdeFinPA === null || msDesdeFinPA >= REFRACTARIO_RELATIVO) return umbralNominal;
  const decaimiento = Math.exp((-3 * msDesdeFinPA) / REFRACTARIO_RELATIVO);
  return umbralNominal + ELEVACION_UMBRAL * decaimiento;
}

export function simular(p: ParametrosSimulacion): ResultadoSimulacion {
  const trayectoria: Muestra[] = [];
  const spikes: Disparo[] = [];
  const pasos = Math.floor(T_TOTAL / DT);

  let v = V_REPOSO;
  let enPA: { inicio: number; pico: number; umbralDisparo: number } | null = null;
  let finUltimoPA: number | null = null;
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

    if (enPA) {
      const desde = t - enPA.inicio;
      v = formaPA(desde, enPA.umbralDisparo);
      if (desde > REFRACTARIO_ABSOLUTO) {
        finUltimoPA = t;
        enPA = null;
      }
    } else {
      const objetivo = V_REPOSO + estimuloActual * 1.0; // 1 mV por unidad de intensidad
      v = v + (objetivo - v) * (DT / TAU);

      const umbralAhora = umbralEfectivo(
        p.umbral,
        finUltimoPA === null ? null : t - finUltimoPA
      );

      if (v > umbralAhora) {
        // El PA arranca EN el umbral que se acaba de cruzar, no en un −55 cableado.
        enPA = { inicio: t, pico: t + 1.0, umbralDisparo: umbralAhora };
        spikes.push({ inicio: t, pico: t + 1.0 });
        v = umbralAhora;
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
