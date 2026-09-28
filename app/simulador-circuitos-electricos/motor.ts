/**
 * Motor del simulador de circuitos eléctricos: ley de Ohm, serie, paralelo y potencia.
 *
 * Vive aparte de la vista porque el build compila la página sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras, y nada lanza excepciones: lo que no tiene respuesta vuelve como `null` o como
 * `{ ok: false }`, y la vista decide qué mensaje enseña.
 *
 * ── Por qué existe este fichero (28/09/2026) ─────────────────────────────────
 *
 * Hasta esa fecha la aritmética vivía dentro de los cuatro manejadores de `page.tsx` (`calcOhm`,
 * `calcSerie`, `calcParalelo` y `calcPotencia`). Se TRASLADÓ aquí, sin tocar una sola operación
 * ni su orden, para que la sección «Casos para clase» (`./casos.ts`) corrija con la MISMA
 * aritmética que pintan las cuatro pestañas. Si el panel calculara de una manera y los casos de
 * otra, la app podría suspender una respuesta que ella misma acaba de imprimir.
 *
 * La lectura y la validación de los campos (`motivoDeRechazo`, `parseSpanishNumber`, los
 * mensajes de error) SIGUEN en `page.tsx`: aquí solo entra lo que ya se ha dado por bueno.
 *
 * ── Convenio ─────────────────────────────────────────────────────────────────
 *
 *   · Unidades del SI: V en voltios, I en amperios, R en ohmios, P en vatios.
 *   · Ohm con los tres despejes: V = I·R · I = V/R · R = V/I.
 *   · Serie: Req = ΣR · la corriente es la misma en todas · V_i = I·R_i · P_i = I²·R_i.
 *   · Paralelo: Req = 1/Σ(1/R) · la tensión es la misma en todas · I_i = V/R_i · P_i = V²/R_i.
 *   · Potencia: P = V·I · energía en kWh = P/1000 · horas · días · coste = kWh · tarifa.
 *     La tarifa va en «unidades monetarias por kWh»: el motor no sabe de monedas. El campo
 *     `costeEuros` conserva el nombre que ya tenía en la vista, que es quien lo rotula.
 */

export type Incognita = 'V' | 'I' | 'R';

export interface ResultadoOhm {
  V: number;
  I: number;
  R: number;
}

export interface ResultadoSerie {
  Req: number;
  V: number;
  /** Las resistencias YA parseadas con las que se calculó, para que la tabla no relea los inputs (hallazgo 872) */
  resistencias: number[];
  I: number;
  tensiones: number[];
  potencias: number[];
  potenciaTotal: number;
}

export interface ResultadoParalelo {
  Req: number;
  V: number;
  resistencias: number[];
  Itotal: number;
  corrientes: number[];
  potencias: number[];
  potenciaTotal: number;
}

export interface ResultadoPotencia {
  P: number;
  V: number;
  I: number;
  R: number;
  energiaKwh: number;
  costeEuros: number;
}

/**
 * Margen relativo con el que se acepta que V, I y R tecleados A LA VEZ cumplan V = I × R.
 * Un 1 % deja pasar los redondeos normales de un enunciado (dos o tres cifras significativas)
 * y caza las ternas que no describen ningún circuito posible (hallazgo 869).
 */
export const TOLERANCIA_OHM = 0.01;

/* ─────────────────────────── Ley de Ohm ─────────────────────────── */

/**
 * Pestaña «Ley de Ohm». `a` y `b` son los dos campos en el orden en que la pestaña los pinta:
 *   · incógnita V → a = I, b = R
 *   · incógnita I → a = V, b = R
 *   · incógnita R → a = V, b = I
 * Devuelve `null` si el resultado no es finito o la R no es positiva (una división entre cero):
 * la vista lo traduce a «Valores fuera de rango».
 */
export function resolverOhm(incognita: Incognita, a: number, b: number): ResultadoOhm | null {
  let V: number, I: number, R: number;
  if (incognita === 'V') { I = a; R = b; V = I * R; }
  else if (incognita === 'I') { V = a; R = b; I = V / R; }
  else { V = a; I = b; R = V / I; }
  if (!isFinite(V) || !isFinite(I) || !isFinite(R) || R <= 0) return null;
  return { V, I, R };
}

/* ─────────────────────────── Serie ─────────────────────────── */

/** Pestaña «Serie»: la tensión de la fuente y las resistencias, ya validadas. */
export function resolverSerie(V: number, rs: number[]): ResultadoSerie {
  const Req = rs.reduce((a, r) => a + r, 0);
  const I = V / Req;
  const tensiones = rs.map(r => I * r);
  const potencias = rs.map(r => I * I * r);
  return { Req, V, resistencias: rs, I, tensiones, potencias, potenciaTotal: I * I * Req };
}

/* ─────────────────────────── Paralelo ─────────────────────────── */

/** Pestaña «Paralelo»: la tensión de la fuente y las resistencias, ya validadas. */
export function resolverParalelo(V: number, rs: number[]): ResultadoParalelo {
  const invReq = rs.reduce((a, r) => a + 1 / r, 0);
  const Req = 1 / invReq;
  const corrientes = rs.map(r => V / r);
  const Itotal = corrientes.reduce((a, i) => a + i, 0);
  const potencias = rs.map(r => V * V / r);
  return { Req, V, resistencias: rs, Itotal, corrientes, potencias, potenciaTotal: V * V / Req };
}

/* ─────────────────────────── Potencia ─────────────────────────── */

export type DespejePotencia =
  | { ok: true; P: number; V: number; I: number; R: number }
  /**
   * `incoherente`: V, I y R dados a la vez no cumplen V = I × R (hallazgo 869).
   * `sinPotencia`: la potencia no sale finita y positiva.
   */
  | { ok: false; motivo: 'incoherente' | 'sinPotencia' };

/**
 * Pestaña «Potencia», primera mitad: completa la terna V, I, R con la ley de Ohm y calcula
 * P = V·I. Un valor que falta llega como NaN (o ≤ 0) y se despeja de los otros dos.
 *
 * Con los tres dados, ninguna rama del despeje se ejecuta, así que antes se comprueba que la
 * terna cumpla V = I × R: si no, no se recalcula ninguno, porque no hay forma de saber cuál de
 * los tres está mal (hallazgo 869).
 */
export function despejarPotencia(V: number, I: number, R: number): DespejePotencia {
  const validos = [V, I, R].filter(v => !isNaN(v) && v > 0);
  if (validos.length === 3 && Math.abs(V - I * R) > TOLERANCIA_OHM * I * R) {
    return { ok: false, motivo: 'incoherente' };
  }
  let fV = V, fI = I, fR = R;
  if (isNaN(fV) || fV <= 0) fV = fI * fR;
  else if (isNaN(fI) || fI <= 0) fI = fV / fR;
  else if (isNaN(fR) || fR <= 0) fR = fV / fI;
  const P = fV * fI;
  if (!isFinite(P) || P <= 0) return { ok: false, motivo: 'sinPotencia' };
  return { ok: true, P, V: fV, I: fI, R: fR };
}

/**
 * Pestaña «Potencia», segunda mitad: energía del periodo en kWh y su coste.
 * `tarifa` en unidades monetarias por kWh; el coste sale en esas mismas unidades.
 */
export function consumoYCoste(
  P: number,
  horas: number,
  dias: number,
  tarifa: number,
): { energiaKwh: number; costeEuros: number } {
  const energiaKwh = (P / 1000) * horas * dias;
  const costeEuros = energiaKwh * tarifa;
  return { energiaKwh, costeEuros };
}

export type ResolucionPotencia =
  | { ok: true; resultado: ResultadoPotencia }
  | { ok: false; motivo: 'incoherente' | 'sinPotencia' };

/**
 * Las dos mitades seguidas, para quien no necesita validar nada entre medias (los casos para
 * clase). La vista las llama por separado porque entre una y otra valida horas, días y tarifa,
 * y ese orden de los mensajes de error es parte de su comportamiento.
 */
export function resolverPotencia(
  V: number,
  I: number,
  R: number,
  horas: number,
  dias: number,
  tarifa: number,
): ResolucionPotencia {
  const despeje = despejarPotencia(V, I, R);
  if (!despeje.ok) return despeje;
  const { energiaKwh, costeEuros } = consumoYCoste(despeje.P, horas, dias, tarifa);
  return {
    ok: true,
    resultado: { P: despeje.P, V: despeje.V, I: despeje.I, R: despeje.R, energiaKwh, costeEuros },
  };
}
