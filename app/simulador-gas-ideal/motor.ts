/**
 * Motor del simulador de gas ideal: la ecuación de estado y los cuatro procesos.
 *
 * Vive aparte de la vista porque el build compila la página sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── Por qué existe este fichero (28/09/2026) ─────────────────────────────────
 *
 * Hasta esa fecha el cálculo vivía dentro de dos `useMemo` de `page.tsx`: el de `calculado` en
 * la pestaña «Ley del Gas Ideal» y el de `resultado` en «Procesos». Se TRASLADARON aquí, sin
 * tocar una sola operación, para que la sección «Casos para clase» (`./casos.ts`) corrija con la
 * MISMA aritmética que pintan esas dos pestañas. Si el panel calculara de una manera y los casos
 * de otra, la app podría suspender una respuesta que ella misma acaba de imprimir.
 *
 * La pestaña «Ciclos» NO se trasladó: no la usa ningún caso y sigue calculando dentro de la
 * página, con las constantes que importa de aquí.
 *
 * ── Convenio ─────────────────────────────────────────────────────────────────
 *
 *   · Se trabaja en el SI: P en Pa, V en m³, T en K, n en mol. R = 8,314 J/(mol·K).
 *   · La interfaz habla en unidades amigables: 1 atm = 101.325 Pa y 1 L = 0,001 m³.
 *   · Las funciones reciben y devuelven lo mismo que recibían y devolvían los `useMemo`.
 */

// R en J/(mol·K). Trabajamos en SI: P en Pa, V en m³, T en K, n en mol.
// Para presentar al usuario, convertimos: 1 atm = 101325 Pa, 1 L = 0.001 m³.
export const R = 8.314;
export const ATM_TO_PA = 101325;
export const L_TO_M3 = 0.001;

export type CalcVar = 'P' | 'V' | 'T' | 'n';
export type Proceso = 'isotermo' | 'isobaro' | 'isocoro' | 'adiabatico';

export interface ResultadoProceso {
  P2: number; // Pa
  V2: number; // m³
  T2: number; // K
  W: number; // J (trabajo realizado por el gas)
  Q: number; // J
  dU: number; // J
  formula: string;
}

/**
 * Pestaña «Ley del Gas Ideal»: despeja la variable elegida de PV = nRT.
 *
 * Entradas en unidades amigables (atm, L, K, mol). Devuelve la variable despejada en su unidad
 * amigable (atm, L, K o mol), o `null` si el divisor no es positivo. La entrada de la variable
 * que se despeja se ignora.
 */
export function calcularGasIdeal(
  calcVar: CalcVar,
  Patm: number,
  VL: number,
  TK: number,
  nMol: number,
): number | null {
  const P_Pa = Patm * ATM_TO_PA;
  const V_m3 = VL * L_TO_M3;
  if (calcVar === 'P') {
    // P = nRT/V
    if (V_m3 <= 0) return null;
    const P = (nMol * R * TK) / V_m3;
    return P / ATM_TO_PA; // atm
  }
  if (calcVar === 'V') {
    if (P_Pa <= 0) return null;
    const V = (nMol * R * TK) / P_Pa;
    return V / L_TO_M3; // L
  }
  if (calcVar === 'T') {
    if (nMol <= 0) return null;
    const T = (P_Pa * V_m3) / (nMol * R);
    return T; // K
  }
  if (calcVar === 'n') {
    if (TK <= 0) return null;
    const n = (P_Pa * V_m3) / (R * TK);
    return n; // mol
  }
  return null;
}

/** Entradas de la pestaña «Procesos», en las unidades de sus campos. */
export interface EntradaProceso {
  proceso: Proceso;
  P1atm: number;
  V1L: number;
  T1K: number;
  /** Solo lo leen el isotermo y el adiabático. */
  V2L: number;
  /** Solo lo leen el isobárico y el isocórico. */
  T2K: number;
  nMol: number;
  /** Solo lo lee el adiabático (y el ΔU de isobárico e isocórico, vía Cv). */
  gamma: number;
}

/**
 * Pestaña «Procesos»: estado final y balance energético. Devuelve P₂ en Pa, V₂ en m³, T₂ en K
 * y W, Q, ΔU en J, o `null` si un volumen o T₁ no son positivos.
 */
export function calcularProceso(e: EntradaProceso): ResultadoProceso | null {
  const { proceso, P1atm, V1L, T1K, V2L, T2K, nMol, gamma } = e;
  const P1 = P1atm * ATM_TO_PA;
  const V1 = V1L * L_TO_M3;
  const T1 = T1K;
  const V2 = V2L * L_TO_M3;

  // Cv y Cp para gas ideal según γ
  // ΔU = n·Cv·ΔT, con Cv = R/(γ-1)
  const Cv = R / (gamma - 1);

  if (proceso === 'isotermo') {
    // T = cte → P1V1 = P2V2; W = nRT·ln(V2/V1); Q = W; ΔU = 0
    if (V2 <= 0 || V1 <= 0) return null;
    const P2 = (P1 * V1) / V2;
    const T2 = T1;
    const W = nMol * R * T1 * Math.log(V2 / V1);
    return {
      P2,
      V2,
      T2,
      W,
      Q: W,
      dU: 0,
      formula: 'P₁V₁ = P₂V₂ · W = nRT·ln(V₂/V₁) · ΔU = 0',
    };
  }
  if (proceso === 'isobaro') {
    // P = cte → V1/T1 = V2/T2; W = P·ΔV; ΔU = nCv·ΔT; Q = ΔU+W
    const P2 = P1;
    const T2 = T2K;
    if (T1 <= 0) return null;
    const V2calc = V1 * (T2 / T1);
    const W = P2 * (V2calc - V1);
    const dU = nMol * Cv * (T2 - T1);
    const Q = dU + W;
    return {
      P2,
      V2: V2calc,
      T2,
      W,
      Q,
      dU,
      formula: 'V₁/T₁ = V₂/T₂ · W = P·ΔV · ΔU = nCᵥ·ΔT',
    };
  }
  if (proceso === 'isocoro') {
    // V = cte → P1/T1 = P2/T2; W = 0; ΔU = nCv·ΔT; Q = ΔU
    const V2calc = V1;
    const T2 = T2K;
    if (T1 <= 0) return null;
    const P2 = P1 * (T2 / T1);
    const W = 0;
    const dU = nMol * Cv * (T2 - T1);
    const Q = dU;
    return {
      P2,
      V2: V2calc,
      T2,
      W,
      Q,
      dU,
      formula: 'P₁/T₁ = P₂/T₂ · W = 0 · Q = ΔU = nCᵥ·ΔT',
    };
  }
  // adiabático: Q = 0; PV^γ = cte; T·V^(γ-1) = cte
  if (V2 <= 0 || V1 <= 0) return null;
  const P2 = P1 * Math.pow(V1 / V2, gamma);
  const T2 = T1 * Math.pow(V1 / V2, gamma - 1);
  const W = (P1 * V1 - P2 * V2) / (gamma - 1);
  const dU = -W; // Q = 0 → ΔU = -W
  return {
    P2,
    V2,
    T2,
    W,
    Q: 0,
    dU,
    formula: 'PVᵞ = cte · TVᵞ⁻¹ = cte · Q = 0 · W = (P₁V₁−P₂V₂)/(γ−1)',
  };
}
