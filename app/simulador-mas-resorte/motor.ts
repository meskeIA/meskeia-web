/**
 * Motor del oscilador masa-resorte con amortiguamiento viscoso.
 *
 * Resuelve m·x″ + γ·x′ + k·x = 0 con las condiciones iniciales que la propia app declara
 * en el PASO 3 de su bloque educativo: x(0) = A y v(0) = 0.
 *
 * Vive aparte porque el defecto que lo motivó no se ve en pantalla: el motor oscilaba a ω₀
 * en vez de a la frecuencia amortiguada ω_d = √(ω₀² − β²), y la tarjeta «Período T» imprimía
 * 2π/ω₀ sin mirar γ. Como la cifra y la animación salían de la MISMA fórmula equivocada,
 * concordaban entre sí y nada delataba el error (hallazgo 966). Era además justo el error
 * que el bloque «Errores frecuentes» de la app enseña a evitar.
 *
 * Los tres regímenes, con β = γ/(2m) y ω₀ = √(k/m), más el caso sin amortiguamiento:
 *
 *   γ = 0   LIBRE (MAS)      ω_d = ω₀, x(t) = A·cos(ω₀·t): la amplitud NO decrece, así que
 *           no se rotula «subamortiguado», que la FAQ de la app define como «oscila con
 *           amplitud decreciente» (hallazgo 2158). Es el límite β → 0 de la fórmula de abajo.
 *
 *   β < ω₀  SUBAMORTIGUADO   ω_d = √(ω₀² − β²)
 *           x(t) = A·e^(−βt)·[cos(ω_d·t) + (β/ω_d)·sen(ω_d·t)]
 *           v(t) = −A·e^(−βt)·(ω₀²/ω_d)·sen(ω_d·t)
 *
 *   β = ω₀  CRÍTICO          x(t) = A·(1 + β·t)·e^(−βt)
 *           v(t) = −A·β²·t·e^(−βt)          — nunca cruza el equilibrio
 *
 *   β > ω₀  SOBREAMORTIGUADO r = √(β² − ω₀²)
 *           x(t) = A·e^(−βt)·[cosh(r·t) + (β/r)·senh(r·t)]
 *           v(t) = −A·e^(−βt)·(ω₀²/r)·senh(r·t)   — tampoco cruza
 *
 * Las tres cumplen x(0) = A y v(0) = 0, que es lo que arregla el hallazgo 968: derivar
 * A·cos(ω₀t)·e^(−βt) daba v(0) = −βA, o sea energía cinética que nadie puso, y la energía
 * total arrancaba por encima de la ½kA² que la propia caja de fórmulas publica como techo.
 *
 * Casos resueltos a mano en tests/mas-resorte-motor.spec.ts.
 */

export type Regimen = 'libre' | 'subamortiguado' | 'critico' | 'sobreamortiguado';

export interface EstadoOscilador {
  x: number;
  v: number;
  a: number;
  Ek: number;
  Ep: number;
  Et: number;
}

export interface Oscilador {
  omega0: number;
  /** β = γ/(2m), el factor de decaimiento de la envolvente. */
  beta: number;
  /** γ_c = 2√(k·m), el amortiguamiento que separa los regímenes. */
  gammaCritico: number;
  regimen: Regimen;
  /** ω_d = √(ω₀² − β²). Solo existe si oscila (libre o subamortiguado); si no, null. */
  omegaD: number | null;
  /** T = 2π/ω_d. En crítico y sobreamortiguado NO hay período: null. */
  periodo: number | null;
  /** f = 1/T, con la misma condición. */
  frecuencia: number | null;
}

/** Ni la masa ni la constante pueden ser cero: el deslizador ya las acota, esto es el suelo. */
const MIN_MASA = 0.001;
const MIN_K = 0.001;

/**
 * El umbral en el que se considera que β y ω₀ coinciden. El amortiguamiento crítico es un
 * punto de medida nula en los reales, así que sin una banda no se alcanzaría nunca desde un
 * deslizador; y el caso importa porque es el que enseña que ahí deja de haber oscilación.
 */
const TOLERANCIA_CRITICO = 1e-9;

export function describirOscilador(k: number, m: number, gamma: number): Oscilador {
  const masa = Math.max(m, MIN_MASA);
  const constante = Math.max(k, MIN_K);

  const omega0 = Math.sqrt(constante / masa);
  const beta = gamma / (2 * masa);
  const gammaCritico = 2 * Math.sqrt(constante * masa);

  const diferencia = omega0 * omega0 - beta * beta;
  let regimen: Regimen;
  let omegaD: number | null;

  if (beta <= 0) {
    regimen = 'libre';
    omegaD = omega0;
  } else if (Math.abs(diferencia) <= TOLERANCIA_CRITICO * Math.max(1, omega0 * omega0)) {
    regimen = 'critico';
    omegaD = null;
  } else if (diferencia > 0) {
    regimen = 'subamortiguado';
    omegaD = Math.sqrt(diferencia);
  } else {
    regimen = 'sobreamortiguado';
    omegaD = null;
  }

  return {
    omega0,
    beta,
    gammaCritico,
    regimen,
    omegaD,
    periodo: omegaD ? (2 * Math.PI) / omegaD : null,
    frecuencia: omegaD ? omegaD / (2 * Math.PI) : null,
  };
}

/** Posición y velocidad en el instante t, por el régimen que corresponda. */
export function calcularEstado(
  A: number,
  k: number,
  m: number,
  gamma: number,
  t: number
): EstadoOscilador {
  const masa = Math.max(m, MIN_MASA);
  const constante = Math.max(k, MIN_K);
  const { omega0, beta, regimen, omegaD } = describirOscilador(constante, masa, gamma);

  const decaimiento = Math.exp(-beta * t);
  let x: number;
  let v: number;

  if ((regimen === 'libre' || regimen === 'subamortiguado') && omegaD) {
    const cos = Math.cos(omegaD * t);
    const sen = Math.sin(omegaD * t);
    x = A * decaimiento * (cos + (beta / omegaD) * sen);
    v = -A * decaimiento * ((omega0 * omega0) / omegaD) * sen;
  } else if (regimen === 'critico') {
    x = A * (1 + beta * t) * decaimiento;
    v = -A * beta * beta * t * decaimiento;
  } else {
    const r = Math.sqrt(beta * beta - omega0 * omega0);
    x = A * decaimiento * (Math.cosh(r * t) + (beta / r) * Math.sinh(r * t));
    v = -A * decaimiento * ((omega0 * omega0) / r) * Math.sinh(r * t);
  }

  const a = (-constante * x - gamma * v) / masa;
  const Ek = 0.5 * masa * v * v;
  const Ep = 0.5 * constante * x * x;

  return { x, v, a, Ek, Ep, Et: Ek + Ep };
}

/** E(0) = ½·k·A²: el techo que un oscilador amortiguado solo puede bajar, nunca superar. */
export function energiaInicial(A: number, k: number): number {
  return 0.5 * Math.max(k, MIN_K) * A * A;
}

/**
 * Marcas del eje horizontal de la gráfica x(t), en segundos.
 *
 * El eje avanzaba por FRAMES y no llevaba ni un rótulo, así que no se podía hacer en él lo
 * que la propia app manda hacer en su consejo de examen —«mide la distancia entre dos
 * máximos consecutivos»— y encima su escala dependía de los fps de la máquina (hallazgo 970).
 */
export function marcasDeTiempo(tInicio: number, tFin: number): number[] {
  const ventana = Math.max(tFin - tInicio, 0);
  const paso = ventana > 12 ? 5 : ventana > 5 ? 2 : 1;
  const marcas: number[] = [];
  for (let t = Math.ceil(tInicio / paso) * paso; t <= tFin; t += paso) {
    marcas.push(Math.round(t * 1000) / 1000);
  }
  return marcas;
}
