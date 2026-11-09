/**
 * Motor del simulador de deriva genética (Wright-Fisher de 2 alelos con selección, mutación y
 * migración), sin dependencias de React.
 *
 * Reparado el 09/11/2026 (hallazgos 4342-4346 del Inspector):
 *   · «H final» era 2·p̄·(1−p̄) de la MEDIA de las K poblaciones; con deriva p̄ apenas se mueve y
 *     salía ≈ H inicial aunque cada población hubiera perdido diversidad. Ahora es la media de
 *     2·pᵢ·qᵢ, la que enseña la guía con Hₜ ≈ H₀(1−1/(2N))ᵗ (4342).
 *   · El muestreo de 2N ≥ 30 era una normal redondeada también con pocas copias, donde no vale: el
 *     alelo raro se perdía menos de lo debido (P(fijación) de 1 copia en 2N = 100: 0,0125, no 0,01).
 *     Ahora la binomial es exacta por inversión cuando el alelo minoritario espera menos de 30
 *     copias, que es donde se decide la fijación o la pérdida (4343).
 *   · Fijación y pérdida se marcaban al tocar p ≥ 0,999 o ≤ 0,001: con N ≥ 500 eso son 1-2 copias
 *     del otro alelo y la población aún podía volver. Ahora se exige p = 1 o p = 0 (4344).
 *   · El tiempo medio valía G cuando nada se fijaba, y 1 con p₀ = 1. Ahora es null sin absorciones,
 *     0 si ya se partía fijado, y se dice de cuántas poblaciones es la media (4345).
 *   · Con los tres fitness a 0 el fitness medio es 0 (0/0): se rechaza antes de simular (4346).
 */

export interface Params {
  p0: number;
  N: number;
  wAA: number;
  wAa: number;
  waa: number;
  mu: number;
  nu: number;
  m: number;
  pm: number;
  G: number;
  K: number;
}

export interface Simulacion {
  trayectoria: number[];
  fijado: boolean;
  perdido: boolean;
  /** Generación de la fijación o la pérdida, o null si no ocurrió (o no es absorbente). */
  tiempo: number | null;
}

export interface Resultado {
  /** Los parámetros con los que se simuló: la leyenda y los ejes los leen de aquí (4347). */
  parametros: Params;
  simulaciones: Simulacion[];
  media: number[];
  pFijacion: number;
  pPerdida: number;
  /** Media de las generaciones hasta fijar o perder, de las que lo hicieron; null si ninguna. */
  tiempoMedio: number | null;
  /** Cuántas poblaciones entran en el tiempo medio. */
  absorbidas: number;
  heteroInicial: number;
  heteroFinal: number;
  pFinalMedio: number;
}

/**
 * Binomial(n, p). Exacta por inversión de la función de distribución cuando el alelo minoritario
 * espera menos de 30 copias (n·min(p, q) < 30): ahí la normal no vale y ahí se decide la fijación.
 * Con 30 o más copias esperadas de cada alelo, normal con corrección por continuidad, cuyo error
 * es despreciable frente a la deriva que se estudia.
 */
export function muestrearBinomial(n: number, p: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return n;
  if (p > 0.5) return n - muestrearBinomial(n, 1 - p);
  if (n * p < 30) {
    // Inversión: P(X = x+1) = P(X = x) · (n − x)/(x + 1) · p/q, desde P(X = 0) = qⁿ (> e⁻³⁰).
    const q = 1 - p;
    const s = p / q;
    let r = Math.pow(q, n);
    let u = Math.random();
    let x = 0;
    while (u > r && x < n) {
      u -= r;
      r *= (s * (n - x)) / (x + 1);
      x++;
    }
    return x;
  }
  const media = n * p;
  const sigma = Math.sqrt(n * p * (1 - p));
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0, Math.min(n, Math.round(media + sigma * z)));
}

/** Fitness medio w̄ con la frecuencia p. */
export function fitnessMedio(p: number, params: Params): number {
  const q = 1 - p;
  return p * p * params.wAA + 2 * p * q * params.wAa + q * q * params.waa;
}

/** Error que impide simular, o null. */
export function errorDeParametros(params: Params): string | null {
  if (params.wAA === 0 && params.wAa === 0 && params.waa === 0) {
    return 'Con los tres fitness a 0 ningún genotipo deja descendencia: el fitness medio es 0 y no hay siguiente generación. Sube al menos uno.';
  }
  if (fitnessMedio(params.p0, params) === 0) {
    return 'Con esta frecuencia inicial el único genotipo presente tiene fitness 0: no deja descendencia. Cambia p₀ o ese fitness.';
  }
  return null;
}

export function siguienteGen(p: number, params: Params): number {
  const q = 1 - p;
  const wAvg = fitnessMedio(p, params);
  let p1 = p;
  if (wAvg > 0) {
    p1 = (p * p * params.wAA + p * q * params.wAa) / wAvg;
  }
  // Mutación
  p1 = p1 * (1 - params.mu) + (1 - p1) * params.nu;
  // Migración
  p1 = (1 - params.m) * p1 + params.m * params.pm;
  p1 = Math.max(0, Math.min(1, p1));
  // Deriva (Wright-Fisher): 2N alelos sorteados con probabilidad p1
  const alelos = muestrearBinomial(2 * params.N, p1);
  return alelos / (2 * params.N);
}

/** Sin mutación ni migración, p = 0 y p = 1 son absorbentes. */
function esAbsorbente(params: Params): boolean {
  return params.mu === 0 && params.nu === 0 && params.m === 0;
}

export function ejecutarSimulacion(params: Params): Simulacion {
  const trayectoria: number[] = [params.p0];
  let p = params.p0;
  const absorbente = esAbsorbente(params);
  let fijado = false;
  let perdido = false;
  let tiempo: number | null = null;

  if (absorbente && p === 1) {
    fijado = true;
    tiempo = 0;
  } else if (absorbente && p === 0) {
    perdido = true;
    tiempo = 0;
  }

  for (let g = 1; g <= params.G; g++) {
    p = siguienteGen(p, params);
    trayectoria.push(p);
    if (absorbente && !fijado && !perdido) {
      if (p === 1) {
        fijado = true;
        tiempo = g;
      } else if (p === 0) {
        perdido = true;
        tiempo = g;
      }
    }
  }
  // Con mutación o migración no hay absorción: se mira solo cómo acaba, sin tiempo.
  if (!absorbente) {
    if (p === 1) fijado = true;
    else if (p === 0) perdido = true;
  }
  return { trayectoria, fijado, perdido, tiempo };
}

export function ejecutarTodas(params: Params): Resultado {
  const simulaciones: Simulacion[] = [];
  for (let k = 0; k < params.K; k++) simulaciones.push(ejecutarSimulacion(params));

  const media: number[] = [];
  for (let g = 0; g <= params.G; g++) {
    let suma = 0;
    for (const sim of simulaciones) suma += sim.trayectoria[g] ?? 0;
    media.push(suma / simulaciones.length);
  }

  const pFijacion = simulaciones.filter((s) => s.fijado).length / simulaciones.length;
  const pPerdida = simulaciones.filter((s) => s.perdido).length / simulaciones.length;
  const tiempos = simulaciones.map((s) => s.tiempo).filter((t): t is number => t !== null);
  const tiempoMedio = tiempos.length > 0 ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : null;

  const heteroInicial = 2 * params.p0 * (1 - params.p0);
  let sumaH = 0;
  for (const sim of simulaciones) {
    const pf = sim.trayectoria[sim.trayectoria.length - 1] ?? params.p0;
    sumaH += 2 * pf * (1 - pf);
  }
  const heteroFinal = sumaH / simulaciones.length;
  const pFinalMedio = media[media.length - 1] ?? params.p0;

  return {
    parametros: { ...params },
    simulaciones,
    media,
    pFijacion,
    pPerdida,
    tiempoMedio,
    absorbidas: tiempos.length,
    heteroInicial,
    heteroFinal,
    pFinalMedio,
  };
}
