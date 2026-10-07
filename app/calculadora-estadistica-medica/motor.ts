/**
 * Motor de la calculadora de estadística médica — sin dependencias.
 *
 * Nace el 07/10/2026 al reparar los hallazgos 3024-3029: el cálculo vivía en tres useMemo de
 * page.tsx con guardas que miraban la variable equivocada (LR+ con especificidad 0 salía «∞ ·
 * muy útil para confirmar»), aceptaba recuentos negativos y decimales, y resolvía cada división
 * por cero de una forma distinta (null, 0, Infinity o NaN pintado como «Cambio insignificante»).
 *
 * Convención: un valor que no se puede calcular es `null` (no definido, 0/0) y uno que crece sin
 * límite es `Infinity` (x/0 con x > 0). La vista decide cómo decirlo; el motor no inventa ceros.
 */

export type Valor = number | null;

/** Lee un recuento: entero y no negativo. `null` si el campo está vacío; NaN si no es válido. */
export function leerRecuento(texto: string, parse: (t: string) => number): number | null {
  if (texto.trim() === '') return null;
  const n = parse(texto);
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return Number.NaN;
  return n;
}

const cociente = (num: number, den: number): Valor => {
  if (den === 0) return num === 0 ? null : Infinity;
  return num / den;
};

// ─── Pruebas diagnósticas ─────────────────────────────────────────────────

export interface Diagnostico {
  sensibilidad: Valor; // fracción
  especificidad: Valor;
  vpp: Valor;
  vpn: Valor;
  lrPositivo: Valor;
  lrNegativo: Valor;
  prevalencia: number;
  exactitud: number;
}

export function diagnostico(vp: number, fp: number, fn: number, vn: number): Diagnostico | null {
  const total = vp + fp + fn + vn;
  if (total === 0) return null;
  const enfermos = vp + fn;
  const sanos = fp + vn;
  const sens = enfermos > 0 ? vp / enfermos : null;
  const esp = sanos > 0 ? vn / sanos : null;
  return {
    sensibilidad: sens,
    especificidad: esp,
    vpp: vp + fp > 0 ? vp / (vp + fp) : null,
    vpn: fn + vn > 0 ? vn / (fn + vn) : null,
    // LR+ = sens / (1 − esp): se anula el DENOMINADOR cuando esp = 1 (antes miraba esp > 0)
    lrPositivo: sens === null || esp === null ? null : cociente(sens, 1 - esp),
    // LR− = (1 − sens) / esp: se anula cuando esp = 0 (antes miraba sens > 0)
    lrNegativo: sens === null || esp === null ? null : cociente(1 - sens, esp),
    prevalencia: enfermos / total,
    exactitud: (vp + vn) / total,
  };
}

// ─── Epidemiología (tabla de exposición × evento) ─────────────────────────

export interface Intervalo {
  inferior: number;
  superior: number;
}

export interface Epidemiologia {
  oddsRatio: Valor;
  /** IC 95 % de Woolf; `null` si alguna celda es 0 (el método no lo admite) */
  icOddsRatio: Intervalo | null;
  riesgoRelativo: Valor;
  icRiesgoRelativo: Intervalo | null;
  riesgoExpuestos: number;
  riesgoNoExpuestos: number;
  /** riesgo no expuestos − riesgo expuestos (negativo si la exposición aumenta el riesgo) */
  reduccionRiesgoAbsoluto: number;
  /** ARR / riesgo no expuestos; `null` si el riesgo de los no expuestos es 0 */
  reduccionRiesgoRelativo: Valor;
  /** 1 / |ARR|; Infinity si no hay diferencia */
  nnt: number;
}

export function epidemiologia(a: number, b: number, c: number, d: number): Epidemiologia | null {
  // Hacen falta los dos grupos: con b = 0 o c = 0 el RR, los riesgos y el NNT SÍ se calculan
  // (antes la app no pintaba nada: hallazgo 3026); solo el OR deja de ser finito.
  if (a + b === 0 || c + d === 0) return null;
  const re = a / (a + b);
  const rne = c / (c + d);
  const arr = rne - re;
  const todasPositivas = a > 0 && b > 0 && c > 0 && d > 0;
  const oddsRatio = cociente(a * d, b * c);
  const riesgoRelativo = cociente(re, rne);

  let icOddsRatio: Intervalo | null = null;
  let icRiesgoRelativo: Intervalo | null = null;
  if (todasPositivas && oddsRatio !== null && Number.isFinite(oddsRatio)) {
    const se = Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d);
    icOddsRatio = { inferior: Math.exp(Math.log(oddsRatio) - 1.96 * se), superior: Math.exp(Math.log(oddsRatio) + 1.96 * se) };
  }
  if (a > 0 && c > 0 && riesgoRelativo !== null && Number.isFinite(riesgoRelativo)) {
    const se = Math.sqrt(1 / a - 1 / (a + b) + 1 / c - 1 / (c + d));
    icRiesgoRelativo = {
      inferior: Math.exp(Math.log(riesgoRelativo) - 1.96 * se),
      superior: Math.exp(Math.log(riesgoRelativo) + 1.96 * se),
    };
  }

  return {
    oddsRatio,
    icOddsRatio,
    riesgoRelativo,
    icRiesgoRelativo,
    riesgoExpuestos: re,
    riesgoNoExpuestos: rne,
    reduccionRiesgoAbsoluto: arr,
    reduccionRiesgoRelativo: rne > 0 ? arr / rne : null,
    nnt: arr !== 0 ? Math.abs(1 / arr) : Infinity,
  };
}

/** ¿El IC incluye el 1? (`null` si no hay IC) */
export function incluyeUno(ic: Intervalo | null): boolean | null {
  return ic === null ? null : ic.inferior <= 1 && ic.superior >= 1;
}

// ─── NNT directo ──────────────────────────────────────────────────────────

export interface NNT {
  cer: number; // fracción
  eer: number;
  arr: number; // cer − eer
  rrr: Valor; // null si cer = 0
  nnt: number; // Infinity si arr = 0
}

export function nntDirecto(cer: number, eer: number): NNT | null {
  if (!Number.isFinite(cer) || !Number.isFinite(eer)) return null;
  if (cer < 0 || cer > 1 || eer < 0 || eer > 1) return null;
  const arr = cer - eer;
  return { cer, eer, arr, rrr: cer > 0 ? arr / cer : null, nnt: arr !== 0 ? Math.abs(1 / arr) : Infinity };
}

/** VPP por el teorema de Bayes, para los textos educativos. */
export function vppBayes(sens: number, esp: number, prev: number): number {
  return (sens * prev) / (sens * prev + (1 - esp) * (1 - prev));
}
