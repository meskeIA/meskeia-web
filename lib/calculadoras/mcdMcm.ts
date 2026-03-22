/**
 * Calculadora de MCD y MCM — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_mcd_mcm)
 *
 * Calcula el Máximo Común Divisor (MCD) y el Mínimo Común Múltiplo (MCM)
 * de dos o más números enteros, con factorización en primos.
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosMcdMcm {
  /** Lista de números enteros positivos (mínimo 2) */
  numeros: number[];
}

export interface ResultadoMcdMcm {
  /** Números de entrada */
  numeros: number[];
  /** Máximo Común Divisor */
  mcd: number;
  /** Mínimo Común Múltiplo */
  mcm: number;
  /** Factorización en primos de cada número */
  factorizaciones: Record<number, Record<number, number>>;
  /** Factores primos del MCD (factor → exponente) */
  factoresMcd: Record<number, number>;
  /** Factores primos del MCM (factor → exponente) */
  factoresMcm: Record<number, number>;
  /** Divisores comunes de todos los números */
  divisoresComunes: number[];
  /** Pasos del algoritmo de Euclides (si son 2 números) */
  pasosEuclides?: string[];
}

// ─── Algoritmo de Euclides ─────────────────────────────────────────────────────

function mcdDos(a: number, b: number): number {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

function mcmDos(a: number, b: number): number {
  return Math.abs(a * b) / mcdDos(a, b);
}

// ─── Factorización en primos ───────────────────────────────────────────────────

function factorizarEnPrimos(n: number): Record<number, number> {
  const factores: Record<number, number> = {};
  let num = n;
  for (let p = 2; p * p <= num; p++) {
    while (num % p === 0) {
      factores[p] = (factores[p] ?? 0) + 1;
      num = Math.floor(num / p);
    }
  }
  if (num > 1) {
    factores[num] = (factores[num] ?? 0) + 1;
  }
  return factores;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularMcdMcm(p: ParametrosMcdMcm): ResultadoMcdMcm {
  if (!p.numeros || p.numeros.length < 2) throw new Error('Se necesitan al menos 2 números.');
  for (const n of p.numeros) {
    if (!Number.isInteger(n) || n <= 0) throw new Error(`Todos los números deben ser enteros positivos. Inválido: ${n}`);
    if (n > 1e12) throw new Error(`Número demasiado grande: ${n}. Máximo 10^12.`);
  }

  // MCD y MCM de la lista completa
  let mcdTotal = p.numeros[0];
  let mcmTotal = p.numeros[0];
  for (let i = 1; i < p.numeros.length; i++) {
    mcdTotal = mcdDos(mcdTotal, p.numeros[i]);
    mcmTotal = mcmDos(mcmTotal, p.numeros[i]);
  }

  // Factorizaciones individuales
  const factorizaciones: Record<number, Record<number, number>> = {};
  for (const n of p.numeros) {
    factorizaciones[n] = factorizarEnPrimos(n);
  }

  // Factores MCD: primos comunes con el exponente mínimo
  const todosPrimos = new Set<number>();
  for (const f of Object.values(factorizaciones)) {
    for (const p of Object.keys(f).map(Number)) todosPrimos.add(p);
  }

  const factoresMcd: Record<number, number> = {};
  for (const primo of todosPrimos) {
    const exponentes = p.numeros.map(n => factorizaciones[n][primo] ?? 0);
    const minExp = Math.min(...exponentes);
    if (minExp > 0) factoresMcd[primo] = minExp;
  }

  // Factores MCM: primos con el exponente máximo
  const factoresMcm: Record<number, number> = {};
  for (const primo of todosPrimos) {
    const exponentes = p.numeros.map(n => factorizaciones[n][primo] ?? 0);
    factoresMcm[primo] = Math.max(...exponentes);
  }

  // Divisores comunes (divisores del MCD)
  const divisoresComunes: number[] = [];
  for (let i = 1; i <= mcdTotal; i++) {
    if (mcdTotal % i === 0) divisoresComunes.push(i);
  }

  // Pasos de Euclides (solo si son exactamente 2 números)
  let pasosEuclides: string[] | undefined;
  if (p.numeros.length === 2) {
    pasosEuclides = [];
    let a = p.numeros[0];
    let b = p.numeros[1];
    while (b !== 0) {
      const q = Math.floor(a / b);
      const r = a % b;
      pasosEuclides.push(`${a} = ${b} × ${q} + ${r}`);
      a = b;
      b = r;
    }
    pasosEuclides.push(`MCD = ${a}`);
  }

  return {
    numeros: p.numeros,
    mcd: mcdTotal,
    mcm: mcmTotal,
    factorizaciones,
    factoresMcd,
    factoresMcm,
    divisoresComunes,
    pasosEuclides,
  };
}
