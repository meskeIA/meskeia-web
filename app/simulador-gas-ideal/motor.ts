/**
 * Motor del simulador de gas ideal: la ecuación de estado, los cuatro procesos y los cuatro
 * ciclos.
 *
 * Vive aparte de la vista porque el build compila la página sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── Por qué existe este fichero (28/09/2026) ─────────────────────────────────
 *
 * Hasta esa fecha el cálculo vivía dentro de los `useMemo` de `page.tsx`. Primero se
 * TRASLADARON aquí los de «Ley del Gas Ideal» y «Procesos», sin tocar una operación, para que
 * la sección «Casos para clase» (`./casos.ts`) corrija con la MISMA aritmética que pintan esas
 * pestañas. El mismo día, al reparar los hallazgos 2352-2362 del Inspector, se trajo también la
 * pestaña «Ciclos» y se añadieron las validaciones: toda la física de la app está ya aquí.
 *
 * ── El estado de «Procesos» es UNO solo (hallazgos 2352 y 2353, 28/09/2026) ──
 *
 * La pestaña pedía cuatro campos libres (P₁, V₁, T₁ y n) sin exigir PV = nRT, y el estado de
 * fábrica la incumplía: 1 atm · 10 L = 1.013,25 J frente a 1 mol · R · 300 K = 2.494,20 J, un
 * factor 2,46. El motor mezclaba las dos fuentes (P₂, V₂ y el W isobárico salían de P₁V₁; el
 * ΔU, el Q y el W isotermo, de n) y el diagrama del isotermo dibujaba P = nRT/V junto a unos P₁
 * y P₂ que no estaban en la curva. Ningún gas ideal da esos balances.
 *
 * Arreglo: **n ya no se teclea, se DERIVA del estado inicial**, n = P₁V₁/(RT₁), y la vista lo
 * enseña como dato calculado. Se eligió derivar n (y no P₁, V₁ o T₁) porque los casos de aula
 * y las leyes de Boyle, Charles y Gay-Lussac se plantean con P, V y T, y porque así P₂, V₂ y T₂
 * no cambian respecto a lo que la app ya imprimía. De ese único estado salen P₂, V₂, T₂, W, Q,
 * ΔU y la curva del diagrama.
 *
 * Y el balance deja de ser una tautología: antes Q se calculaba como ΔU + W, así que «comprobar
 * ΔU = Q − W», como recomienda la guía de la app, salía bien siempre. Ahora cada magnitud sale
 * de su propia fórmula (isobárico: Q = nCₚΔT, ΔU = nCᵥΔT, W = PΔV; adiabático: W por
 * (P₁V₁ − P₂V₂)/(γ−1) y ΔU = nCᵥΔT), y el primer principio solo cuadra si el estado es coherente.
 *
 * ── Convenio ─────────────────────────────────────────────────────────────────
 *
 *   · Se trabaja en el SI: P en Pa, V en m³, T en K, n en mol. R = 8,314 J/(mol·K).
 *   · La interfaz habla en unidades amigables: 1 atm = 101.325 Pa y 1 L = 0,001 m³.
 *   · Un campo vacío llega como NaN, nunca como 0 (hallazgo 2357): `Number('')` daba 0 y la app
 *     calculaba con un gas sin moles. Todo dato vacío, no finito o ≤ 0 se RECHAZA con un aviso
 *     legible (`error…`) y el cálculo devuelve `null`: no hay cifra que inventar.
 */

// R en J/(mol·K). Trabajamos en SI: P en Pa, V en m³, T en K, n en mol.
// Para presentar al usuario, convertimos: 1 atm = 101325 Pa, 1 L = 0.001 m³.
export const R = 8.314;
export const ATM_TO_PA = 101325;
export const L_TO_M3 = 0.001;

export type CalcVar = 'P' | 'V' | 'T' | 'n';
export type Proceso = 'isotermo' | 'isobaro' | 'isocoro' | 'adiabatico';
export type Ciclo = 'carnot' | 'otto' | 'diesel' | 'stirling';

export interface PuntoPV {
  P: number; // Pa
  V: number; // m³
}

/* ─────────────────────────── Validación de los datos ─────────────────────────── */

/** Cifra corta para los avisos, sin ceros de relleno: «12», «0,5», «810,58». */
function cifraAviso(x: number, decimales = 2): string {
  return (x + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

/** Primera letra en mayúscula: los nombres van con artículo («la presión P»). */
function mayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Por qué una magnitud no puede ser ≤ 0, en palabras del aula. */
const MOTIVO_POSITIVO: Readonly<Record<CalcVar, string>> = {
  P: 'tiene que ser mayor que 0: un gas siempre empuja las paredes que lo encierran.',
  V: 'tiene que ser mayor que 0: el gas siempre ocupa algún volumen.',
  T: 'tiene que ser mayor que 0 K: es una temperatura absoluta y no existe nada por debajo del cero absoluto. Si la tienes en °C, súmale 273,15.',
  n: 'tiene que ser mayor que 0 mol: sin gas no hay nada que calcular.',
};

/**
 * Por qué un dato no vale: vacío (NaN), no finito o ≤ 0. `null` si vale. `nombre` lleva el
 * artículo («la temperatura T₁»), porque el aviso lo usa al principio de la frase.
 */
export function errorDato(valor: number, nombre: string, magnitud: CalcVar): string | null {
  if (!Number.isFinite(valor)) return `Falta ${nombre}: escribe un número.`;
  if (valor > 0) return null;
  return `${mayuscula(nombre)} ${MOTIVO_POSITIVO[magnitud]}`;
}

/** γ = Cₚ/Cᵥ de un gas ideal está entre 1 y 5/3; con γ ≤ 1, Cᵥ = R/(γ−1) no existe. */
function errorGamma(gamma: number): string | null {
  return Number.isFinite(gamma) && gamma > 1 ? null : 'γ = Cₚ/Cᵥ tiene que ser mayor que 1.';
}

function primerError(errores: ReadonlyArray<string | null>): string | null {
  return errores.find((e) => e !== null) ?? null;
}

/* ─────────────────────────── Pestaña «Ley del Gas Ideal» ─────────────────────────── */

const NOMBRE_GAS: Readonly<Record<CalcVar, string>> = {
  P: 'la presión P',
  V: 'el volumen V',
  T: 'la temperatura T',
  n: 'la cantidad de gas n',
};

/**
 * Por qué no se puede despejar `calcVar`: el primero de los otros tres datos que falte o sea
 * ≤ 0. La entrada de la variable que se despeja se ignora.
 */
export function errorGasIdeal(
  calcVar: CalcVar,
  Patm: number,
  VL: number,
  TK: number,
  nMol: number,
): string | null {
  const datos: ReadonlyArray<[CalcVar, number]> = [
    ['P', Patm],
    ['V', VL],
    ['T', TK],
    ['n', nMol],
  ];
  return primerError(datos.map(([v, valor]) => (v === calcVar ? null : errorDato(valor, NOMBRE_GAS[v], v))));
}

/**
 * Pestaña «Ley del Gas Ideal»: despeja la variable elegida de PV = nRT.
 *
 * Entradas en unidades amigables (atm, L, K, mol). Devuelve la variable despejada en su unidad
 * amigable (atm, L, K o mol), o `null` si algún dato falta o no es positivo (el motivo, en
 * `errorGasIdeal`). La entrada de la variable que se despeja se ignora.
 */
export function calcularGasIdeal(
  calcVar: CalcVar,
  Patm: number,
  VL: number,
  TK: number,
  nMol: number,
): number | null {
  if (errorGasIdeal(calcVar, Patm, VL, TK, nMol) !== null) return null;
  const P_Pa = Patm * ATM_TO_PA;
  const V_m3 = VL * L_TO_M3;
  if (calcVar === 'P') {
    // P = nRT/V
    const P = (nMol * R * TK) / V_m3;
    return P / ATM_TO_PA; // atm
  }
  if (calcVar === 'V') {
    const V = (nMol * R * TK) / P_Pa;
    return V / L_TO_M3; // L
  }
  if (calcVar === 'T') {
    const T = (P_Pa * V_m3) / (nMol * R);
    return T; // K
  }
  const n = (P_Pa * V_m3) / (R * TK);
  return n; // mol
}

/* ─────────────────────────── Pestaña «Procesos» ─────────────────────────── */

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
  /** Lo leen el ΔU y el Q del isobárico y del isocórico, y todo el adiabático (vía Cᵥ). */
  gamma: number;
}

export interface ResultadoProceso {
  /** Cantidad de gas, DERIVADA del estado inicial: n = P₁V₁/(RT₁). */
  n: number; // mol
  P1: number; // Pa
  V1: number; // m³
  T1: number; // K
  P2: number; // Pa
  V2: number; // m³
  T2: number; // K
  W: number; // J (trabajo realizado por el gas)
  Q: number; // J
  dU: number; // J
  gamma: number;
  formula: string;
}

/**
 * La cantidad de gas que fija un estado (P en atm, V en L, T en K), o `null` si el estado no
 * vale. Es la que usa «Procesos»: por eso no se teclea.
 */
export function molesDelEstado(Patm: number, VL: number, TK: number): number | null {
  return calcularGasIdeal('n', Patm, VL, TK, NaN);
}

/** Por qué no se puede calcular el proceso, o `null` si todos sus datos valen. */
export function errorProceso(e: EntradaProceso): string | null {
  const conVolumenFinal = e.proceso === 'isotermo' || e.proceso === 'adiabatico';
  return primerError([
    errorDato(e.P1atm, 'la presión inicial P₁', 'P'),
    errorDato(e.V1L, 'el volumen inicial V₁', 'V'),
    errorDato(e.T1K, 'la temperatura inicial T₁', 'T'),
    conVolumenFinal
      ? errorDato(e.V2L, 'el volumen final V₂', 'V')
      : errorDato(e.T2K, 'la temperatura final T₂', 'T'),
    errorGamma(e.gamma),
  ]);
}

/**
 * Pestaña «Procesos»: estado final y balance energético de UN estado coherente. Devuelve P en
 * Pa, V en m³, T en K y W, Q, ΔU en J, o `null` si algún dato no vale (motivo en
 * `errorProceso`).
 *
 * W, Q y ΔU salen cada uno de su fórmula, no uno de los otros dos: así ΔU = Q − W es una
 * comprobación de verdad y no una identidad escrita a mano.
 */
export function calcularProceso(e: EntradaProceso): ResultadoProceso | null {
  if (errorProceso(e) !== null) return null;
  const { proceso, gamma } = e;
  const P1 = e.P1atm * ATM_TO_PA;
  const V1 = e.V1L * L_TO_M3;
  const T1 = e.T1K;
  // La cantidad de gas la fija el estado inicial (hallazgo 2352): una sola fuente para todo.
  const n = (P1 * V1) / (R * T1);
  // Cᵥ y Cₚ del gas ideal según γ: Cᵥ = R/(γ−1), Cₚ = γ·Cᵥ = Cᵥ + R.
  const Cv = R / (gamma - 1);
  const Cp = gamma * Cv;
  const base = { n, P1, V1, T1, gamma };

  if (proceso === 'isotermo') {
    // T = cte → P₁V₁ = P₂V₂; W = nRT·ln(V₂/V₁) = P₁V₁·ln(V₂/V₁); ΔU = nCᵥ·0 = 0; Q = W.
    const V2 = e.V2L * L_TO_M3;
    const W = n * R * T1 * Math.log(V2 / V1);
    return {
      ...base,
      P2: (P1 * V1) / V2,
      V2,
      T2: T1,
      W,
      Q: W,
      dU: 0,
      formula: 'P₁V₁ = P₂V₂ · W = Q = nRT·ln(V₂/V₁) · ΔU = 0',
    };
  }
  if (proceso === 'isobaro') {
    // P = cte → V₁/T₁ = V₂/T₂; W = P·ΔV; Q = nCₚ·ΔT; ΔU = nCᵥ·ΔT.
    const T2 = e.T2K;
    const V2 = V1 * (T2 / T1);
    return {
      ...base,
      P2: P1,
      V2,
      T2,
      W: P1 * (V2 - V1),
      Q: n * Cp * (T2 - T1),
      dU: n * Cv * (T2 - T1),
      formula: 'V₁/T₁ = V₂/T₂ · W = P·ΔV · Q = nCₚ·ΔT · ΔU = nCᵥ·ΔT',
    };
  }
  if (proceso === 'isocoro') {
    // V = cte → P₁/T₁ = P₂/T₂; W = 0; Q = ΔU = nCᵥ·ΔT.
    const T2 = e.T2K;
    const dU = n * Cv * (T2 - T1);
    return {
      ...base,
      P2: P1 * (T2 / T1),
      V2: V1,
      T2,
      W: 0,
      Q: dU,
      dU,
      formula: 'P₁/T₁ = P₂/T₂ · W = 0 · Q = ΔU = nCᵥ·ΔT',
    };
  }
  // Adiabático: Q = 0; PVᵞ = cte; TVᵞ⁻¹ = cte. ΔU = nCᵥ·ΔT, calculado aparte de W.
  const V2 = e.V2L * L_TO_M3;
  const P2 = P1 * Math.pow(V1 / V2, gamma);
  const T2 = T1 * Math.pow(V1 / V2, gamma - 1);
  return {
    ...base,
    P2,
    V2,
    T2,
    W: (P1 * V1 - P2 * V2) / (gamma - 1),
    Q: 0,
    dU: n * Cv * (T2 - T1),
    formula: 'PVᵞ = cte · Q = 0 · W = (P₁V₁−P₂V₂)/(γ−1) · ΔU = nCᵥ·ΔT',
  };
}

/**
 * La curva P-V del proceso, del estado 1 al 2, con el MISMO estado que las cifras: el primer
 * punto es (P₁, V₁) y el último (P₂, V₂) (hallazgo 2353: el isotermo dibujaba P = nRT/V con
 * otra n y los puntos no caían donde decían las cifras).
 */
export function curvaProceso(proceso: Proceso, r: ResultadoProceso, tramos = 60): PuntoPV[] {
  const { P1, V1, P2, V2, gamma } = r;
  const pts: PuntoPV[] = [];
  for (let i = 0; i <= tramos; i += 1) {
    const f = i / tramos;
    if (proceso === 'isocoro') {
      pts.push({ P: P1 + (P2 - P1) * f, V: V1 });
      continue;
    }
    const V = V1 + (V2 - V1) * f;
    if (proceso === 'isobaro') pts.push({ P: P1, V });
    else if (proceso === 'isotermo') pts.push({ P: (P1 * V1) / V, V });
    else pts.push({ P: P1 * Math.pow(V1 / V, gamma), V });
  }
  return pts;
}

/* ─────────────────────────── Escala de los diagramas P-V ─────────────────────────── */

/** Límites de los ejes, en el SI (Pa y m³). */
export interface EscalaPV {
  Vmin: number;
  Vmax: number;
  Pmin: number;
  Pmax: number;
}

/**
 * Un eje con margen por abajo y por arriba, sin bajar nunca de 0: no hay volúmenes ni
 * presiones negativos.
 *
 * Rango nulo (el V de un isocórico, el P de un isobárico): antes se tapaba con `|| 1`, que
 * está en m³ o en Pa, así que para un isocórico a 10 L el eje iba de −90 L a 110 L (hallazgo
 * 2362). Ahora va de 0 al doble del valor, con la recta en medio.
 */
function intervaloEje(min: number, max: number, margenInf: number, margenSup: number): [number, number] {
  const rango = max - min;
  if (rango > Math.abs(max) * 1e-9) {
    return [Math.max(0, min - rango * margenInf), max + rango * margenSup];
  }
  return max > 0 ? [0, 2 * max] : [0, 1];
}

/** Escala de un diagrama P-V que abarca todos los puntos, o `null` si no hay puntos. */
export function escalaDiagrama(
  puntos: readonly PuntoPV[],
  margenV: number,
  margenPInf: number,
  margenPSup: number,
): EscalaPV | null {
  if (puntos.length === 0) return null;
  let vMin = Infinity;
  let vMax = -Infinity;
  let pMin = Infinity;
  let pMax = -Infinity;
  for (const p of puntos) {
    vMin = Math.min(vMin, p.V);
    vMax = Math.max(vMax, p.V);
    pMin = Math.min(pMin, p.P);
    pMax = Math.max(pMax, p.P);
  }
  const [Vmin, Vmax] = intervaloEje(vMin, vMax, margenV, margenV);
  const [Pmin, Pmax] = intervaloEje(pMin, pMax, margenPInf, margenPSup);
  return { Vmin, Vmax, Pmin, Pmax };
}

/* ─────────────────────────── Pestaña «Ciclos» ─────────────────────────── */

/** Entradas de la pestaña «Ciclos», en las unidades de sus campos (K, L, mol). */
export interface EntradaCiclo {
  ciclo: Ciclo;
  /** T caliente en Carnot y Stirling; T pico (T₃, tras la combustión) en Otto. El Diesel no la lee. */
  Th: number;
  /** T fría; en Otto y Diesel, la del gas al empezar la compresión (T₁). */
  Tc: number;
  /** V₁ de Carnot y Stirling (L). */
  V1L: number;
  /** V₂ de Carnot y Stirling; V máx de Otto y Diesel (L). */
  V2L: number;
  /** Relación de compresión de Otto y Diesel. */
  r: number;
  /** Relación de corte (cut-off) del Diesel. */
  rc: number;
  nMol: number;
  gamma: number;
}

export interface ResultadoCiclo {
  eta: number; // eficiencia [0..1]
  /** η de Carnot entre la T MÍNIMA y la T MÁXIMA que alcanza de verdad este ciclo. */
  etaCarnot: number;
  W: number; // trabajo neto J
  Qh: number; // calor absorbido J
  Qc: number; // calor cedido J
  Tmin: number; // K
  Tmax: number; // K
  /** T₂, al acabar la compresión adiabática (Otto y Diesel); `null` en Carnot y Stirling. */
  Tcompresion: number | null;
  puntos: PuntoPV[]; // ciclo cerrado
}

/**
 * Por qué no se puede calcular el ciclo, o `null` si sus datos valen. Además de los datos
 * vacíos o ≤ 0 (hallazgo 2357), rechaza lo que convertiría el ciclo en otra cosa y publicaría
 * una η sin sentido:
 *   · Otto con la T pico por debajo de la T tras la compresión (hallazgo 2354): el «calor
 *     absorbido» salía negativo y la η, mayor que la de Carnot;
 *   · Diesel con rc ≥ r: la combustión llevaría el gas más allá del volumen máximo;
 *   · Carnot y Stirling con Th ≤ Tc o V₂ ≤ V₁: el ciclo dejaría de ser un motor.
 */
export function errorCiclo(e: EntradaCiclo): string | null {
  const { ciclo, Th, Tc, V1L, V2L, r, rc, nMol, gamma } = e;
  const comunes = [errorDato(nMol, 'la cantidad de gas n', 'n'), errorGamma(gamma)];

  if (ciclo === 'carnot' || ciclo === 'stirling') {
    const falta = primerError([
      errorDato(Th, 'la T caliente', 'T'),
      errorDato(Tc, 'la T fría', 'T'),
      errorDato(V1L, 'el volumen V₁', 'V'),
      errorDato(V2L, 'el volumen V₂', 'V'),
      ...comunes,
    ]);
    if (falta) return falta;
    if (Th <= Tc) {
      return `La T caliente (${cifraAviso(Th)} K) tiene que ser mayor que la fría (${cifraAviso(Tc)} K): sin esa diferencia el ciclo no produce trabajo.`;
    }
    if (V2L <= V1L) {
      return `V₂ (${cifraAviso(V2L)} L) tiene que ser mayor que V₁ (${cifraAviso(V1L)} L): en el tramo 1→2 el gas se expande a la T caliente.`;
    }
    return null;
  }

  const falta = primerError([
    errorDato(Tc, 'la T fría inicial', 'T'),
    ciclo === 'otto' ? errorDato(Th, 'la T pico', 'T') : null,
    errorDato(V2L, 'el volumen máximo', 'V'),
    ...comunes,
  ]);
  if (falta) return falta;
  if (!Number.isFinite(r) || r <= 1) {
    return 'La compresión r tiene que ser mayor que 1: es V máx / V mín, y el pistón reduce el volumen.';
  }
  const T2 = Tc * Math.pow(r, gamma - 1);
  if (ciclo === 'otto') {
    if (Th <= T2) {
      return `Con r = ${cifraAviso(r)} y T fría ${cifraAviso(Tc)} K, el gas ya sale de la compresión a ${cifraAviso(T2)} K, y la T pico es ${cifraAviso(Th)} K: para que la combustión aporte calor, la T pico tiene que superar esos ${cifraAviso(T2)} K. Sube la T pico o baja la compresión.`;
    }
    return null;
  }
  if (!Number.isFinite(rc) || rc <= 1) {
    return 'El cut-off rc tiene que ser mayor que 1: durante la combustión el gas se expande.';
  }
  if (rc >= r) {
    return `El cut-off rc (${cifraAviso(rc)}) tiene que ser menor que la compresión r (${cifraAviso(r)}): la combustión no puede llevar el gas más allá del volumen máximo.`;
  }
  return null;
}

/**
 * Pestaña «Ciclos»: rendimiento, calores, trabajo y curva cerrada, o `null` si algún dato no
 * vale (motivo en `errorCiclo`).
 *
 * La η de Carnot de referencia se calcula entre la T mínima y la T MÁXIMA reales del ciclo. En
 * el Diesel la T máxima es T₃ = T₂·rc, la fija el cut-off: antes el campo «T pico» no entraba
 * en el cálculo y solo movía esa η de referencia, que así no acotaba nada y con r = 20 salía
 * por debajo de la η del propio ciclo (hallazgo 2355).
 */
export function calcularCiclo(e: EntradaCiclo): ResultadoCiclo | null {
  if (errorCiclo(e) !== null) return null;
  const { ciclo, Th, Tc, r, rc, nMol, gamma } = e;
  const Cv = R / (gamma - 1);
  const Cp = gamma * Cv;
  const N = 30;
  const puntos: PuntoPV[] = [];

  if (ciclo === 'carnot') {
    // 4 estados: 1→2 expansión isoterma a Th; 2→3 expansión adiabática Th→Tc;
    // 3→4 compresión isoterma a Tc; 4→1 compresión adiabática Tc→Th.
    // Tomamos V1, V2 (a Th); calculamos V3, V4 con relaciones adiabáticas.
    const V1 = e.V1L * L_TO_M3;
    const V2 = e.V2L * L_TO_M3;
    // Relación adiabática T·V^(γ-1) = cte
    // 2→3: Th·V2^(γ-1) = Tc·V3^(γ-1) → V3 = V2·(Th/Tc)^(1/(γ-1))
    const V3 = V2 * Math.pow(Th / Tc, 1 / (gamma - 1));
    // 4→1: Tc·V4^(γ-1) = Th·V1^(γ-1) → V4 = V1·(Th/Tc)^(1/(γ-1))
    const V4 = V1 * Math.pow(Th / Tc, 1 / (gamma - 1));
    const P2 = (nMol * R * Th) / V2;
    const P4 = (nMol * R * Tc) / V4;

    // Calor absorbido en isoterma 1→2: Qh = nRTh·ln(V2/V1)
    const Qh = nMol * R * Th * Math.log(V2 / V1);
    // Calor cedido en isoterma 3→4: |Qc| = nRTc·ln(V3/V4)
    const Qc = nMol * R * Tc * Math.log(V3 / V4);
    const W = Qh - Qc;

    // 1→2 isoterma Th
    for (let i = 0; i <= N; i += 1) {
      const V = V1 + ((V2 - V1) * i) / N;
      puntos.push({ P: (nMol * R * Th) / V, V });
    }
    // 2→3 adiabática
    for (let i = 1; i <= N; i += 1) {
      const V = V2 + ((V3 - V2) * i) / N;
      puntos.push({ P: P2 * Math.pow(V2 / V, gamma), V });
    }
    // 3→4 isoterma Tc
    for (let i = 1; i <= N; i += 1) {
      const V = V3 + ((V4 - V3) * i) / N;
      puntos.push({ P: (nMol * R * Tc) / V, V });
    }
    // 4→1 adiabática (cierre)
    for (let i = 1; i <= N; i += 1) {
      const V = V4 + ((V1 - V4) * i) / N;
      puntos.push({ P: P4 * Math.pow(V4 / V, gamma), V });
    }

    return { eta: W / Qh, etaCarnot: 1 - Tc / Th, W, Qh, Qc, Tmin: Tc, Tmax: Th, Tcompresion: null, puntos };
  }

  if (ciclo === 'otto') {
    // Otto: 1→2 compresión adiabática; 2→3 isocora calentamiento; 3→4 expansión adiabática;
    // 4→1 isocora enfriamiento. V máx = V₂ del campo, V mín = V máx/r, T₁ = Tc, T₃ = T pico.
    const Vmax = e.V2L * L_TO_M3;
    const Vmin = Vmax / r;
    const T1 = Tc;
    const T2 = T1 * Math.pow(r, gamma - 1); // adiabática
    const T3 = Th; // mayor que T2: lo garantiza errorCiclo
    const T4 = T3 / Math.pow(r, gamma - 1);
    const P1 = (nMol * R * T1) / Vmax;
    const P2 = (nMol * R * T2) / Vmin;
    const P3 = (nMol * R * T3) / Vmin;
    const P4 = (nMol * R * T4) / Vmax;

    // Calor: solo en isocoras
    const Qh = nMol * Cv * (T3 - T2); // 2→3 absorbido
    const Qc = nMol * Cv * (T4 - T1); // 4→1 cedido (positivo)
    const W = Qh - Qc;
    const eta = 1 - 1 / Math.pow(r, gamma - 1);

    // 1→2 adiabática (V de Vmax a Vmin)
    for (let i = 0; i <= N; i += 1) {
      const V = Vmax + ((Vmin - Vmax) * i) / N;
      puntos.push({ P: P1 * Math.pow(Vmax / V, gamma), V });
    }
    // 2→3 isocora (V=Vmin, P sube)
    for (let i = 1; i <= N; i += 1) {
      puntos.push({ P: P2 + ((P3 - P2) * i) / N, V: Vmin });
    }
    // 3→4 adiabática (V de Vmin a Vmax)
    for (let i = 1; i <= N; i += 1) {
      const V = Vmin + ((Vmax - Vmin) * i) / N;
      puntos.push({ P: P3 * Math.pow(Vmin / V, gamma), V });
    }
    // 4→1 isocora (V=Vmax, P baja)
    for (let i = 1; i <= N; i += 1) {
      puntos.push({ P: P4 + ((P1 - P4) * i) / N, V: Vmax });
    }

    return { eta, etaCarnot: 1 - T1 / T3, W, Qh, Qc, Tmin: T1, Tmax: T3, Tcompresion: T2, puntos };
  }

  if (ciclo === 'diesel') {
    // Diesel: 1→2 compresión adiabática; 2→3 isobara expansión (combustión a P cte);
    // 3→4 expansión adiabática; 4→1 isocora enfriamiento.
    const Vmax = e.V2L * L_TO_M3;
    const Vmin = Vmax / r;
    const T1 = Tc;
    const T2 = T1 * Math.pow(r, gamma - 1);
    const V3 = Vmin * rc;
    // Isobárico 2→3: V/T = cte. T₃ es la temperatura MÁXIMA del ciclo.
    const T3 = T2 * rc;
    // Adiabático 3→4 hasta V4=Vmax
    const T4 = T3 * Math.pow(V3 / Vmax, gamma - 1);
    const P1 = (nMol * R * T1) / Vmax;
    const P2 = (nMol * R * T2) / Vmin;
    const P3 = P2; // isobaro
    const P4 = (nMol * R * T4) / Vmax;

    const Qh = nMol * Cp * (T3 - T2); // isobárica
    const Qc = nMol * Cv * (T4 - T1); // isocórica enfriamiento
    const W = Qh - Qc;
    const eta = 1 - (1 / Math.pow(r, gamma - 1)) * ((Math.pow(rc, gamma) - 1) / (gamma * (rc - 1)));

    // 1→2 adiabática (Vmax → Vmin)
    for (let i = 0; i <= N; i += 1) {
      const V = Vmax + ((Vmin - Vmax) * i) / N;
      puntos.push({ P: P1 * Math.pow(Vmax / V, gamma), V });
    }
    // 2→3 isobara (Vmin → V3)
    for (let i = 1; i <= N; i += 1) {
      puntos.push({ P: P2, V: Vmin + ((V3 - Vmin) * i) / N });
    }
    // 3→4 adiabática (V3 → Vmax)
    for (let i = 1; i <= N; i += 1) {
      const V = V3 + ((Vmax - V3) * i) / N;
      puntos.push({ P: P3 * Math.pow(V3 / V, gamma), V });
    }
    // 4→1 isocora (Vmax)
    for (let i = 1; i <= N; i += 1) {
      puntos.push({ P: P4 + ((P1 - P4) * i) / N, V: Vmax });
    }

    return { eta, etaCarnot: 1 - T1 / T3, W, Qh, Qc, Tmin: T1, Tmax: T3, Tcompresion: T2, puntos };
  }

  // Stirling: 1→2 isoterma a Th expansión (V1→V2); 2→3 isocora enfriamiento Th→Tc;
  // 3→4 isoterma a Tc compresión (V2→V1); 4→1 isocora calentamiento Tc→Th.
  const V1 = e.V1L * L_TO_M3;
  const V2 = e.V2L * L_TO_M3;
  const P1 = (nMol * R * Th) / V1;
  const P2 = (nMol * R * Th) / V2;
  const P3 = (nMol * R * Tc) / V2;
  const P4 = (nMol * R * Tc) / V1;

  // Con regenerador ideal (el calor de las isocoras se recicla): solo cuenta el calor
  // isotermo, y η = 1 − Tc/Th, la de Carnot.
  const Qh = nMol * R * Th * Math.log(V2 / V1);
  const Qc = nMol * R * Tc * Math.log(V2 / V1);
  const W = Qh - Qc;

  // 1→2 isoterma Th
  for (let i = 0; i <= N; i += 1) {
    const V = V1 + ((V2 - V1) * i) / N;
    puntos.push({ P: (nMol * R * Th) / V, V });
  }
  // 2→3 isocora (V=V2, P baja)
  for (let i = 1; i <= N; i += 1) {
    puntos.push({ P: P2 + ((P3 - P2) * i) / N, V: V2 });
  }
  // 3→4 isoterma Tc
  for (let i = 1; i <= N; i += 1) {
    const V = V2 + ((V1 - V2) * i) / N;
    puntos.push({ P: (nMol * R * Tc) / V, V });
  }
  // 4→1 isocora (V=V1)
  for (let i = 1; i <= N; i += 1) {
    puntos.push({ P: P4 + ((P1 - P4) * i) / N, V: V1 });
  }

  return { eta: 1 - Tc / Th, etaCarnot: 1 - Tc / Th, W, Qh, Qc, Tmin: Tc, Tmax: Th, Tcompresion: null, puntos };
}
