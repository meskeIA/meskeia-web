/**
 * Motor del péndulo simple.
 *
 * Vive aparte porque el defecto que lo motivó era que la integración numérica —que existe,
 * es correcta y mueve la animación— no llegaba nunca a la caja de resultados: «Período T»
 * salía siempre de 2π√(L/g) sin mirar el modelo seleccionado, así que la misma pantalla
 * enseñaba un número y balanceaba el péndulo a otro ritmo (hallazgo 971).
 *
 * La ecuación que se resuelve es la del péndulo con rozamiento viscoso:
 *
 *     θ″ + γ·θ′ + (g/L)·sen θ = 0
 *
 * Sin rozamiento, el período exacto de un péndulo de amplitud θ₀ no es 2π√(L/g), sino
 *
 *     T = 4·√(L/g)·K(sen(θ₀/2))
 *
 * donde K es la integral elíptica completa de primera especie. Se calcula aquí con la media
 * aritmético-geométrica: K(k) = π / (2·AGM(1, √(1−k²))), que converge cuadráticamente y da
 * quince cifras exactas en cinco iteraciones (hallazgos 972 y 973).
 *
 * CON ROZAMIENTO (hallazgo 2638, 02/10/2026) el período ya no es ese: en la ecuación lineal
 * (sen θ ≈ θ) la pulsación baja a ω_d = √(ω₀² − γ²/4), y si γ/2 ≥ ω₀ el péndulo vuelve a la
 * vertical sin oscilar y no hay período que publicar. Antes la caja daba siempre el período
 * sin rozamiento, mientras la animación sí integraba el −γ·θ′: con la Luna, L = 5 m y
 * γ = 0,5 publicaba 11,044 s y el péndulo oscilaba a 12,29 s.
 *
 * Casos resueltos a mano en tests/pendulo-motor.spec.ts.
 */

export type Modelo = 'numerico' | 'pequeno';

/** Régimen de la ecuación linealizada, según ζ = γ/(2ω₀). */
export type Regimen = 'subamortiguado' | 'critico' | 'sobreamortiguado';

export interface EstadoPendulo {
  theta: number; // rad
  omega: number; // rad/s
}

export interface DerivadosFisicos {
  /** T₀ = 2π√(L/g), el período de la aproximación de pequeños ángulos sin rozamiento. */
  T0: number;
  /** T = 4√(L/g)·K(sen(θ₀/2)), el período exacto SIN rozamiento para esa amplitud. */
  Treal: number;
  /**
   * El que se publica, según el modelo elegido y con el rozamiento incluido. null cuando el
   * péndulo no oscila (amortiguamiento crítico o sobreamortiguado).
   */
  T: number | null;
  /** f = 1/T. */
  f: number | null;
  /** ω = 2π·f = 2π/T: la pulsación a la que de verdad oscila el péndulo (hallazgo 2640). */
  omega: number | null;
  /** ω₀ = √(g/L), la pulsación natural (sin rozamiento y a pequeños ángulos). */
  omega0: number;
  /** Treal / T₀ − 1, en tanto por uno. Con θ₀ = 90° vale 0,1803. */
  desviacion: number;
  /** ζ = γ/(2ω₀): por debajo de 1 oscila; en 1 o más, no. */
  zeta: number;
  regimen: Regimen;
}

const MIN_L = 0.0001;

/** Tolerancia relativa para dar por crítico un ζ que es 1 salvo el redondeo. */
const TOLERANCIA_CRITICO = 1e-9;

/**
 * Integral elíptica completa de primera especie K(k), por la media aritmético-geométrica.
 *
 *   K(k) = π / (2·AGM(1, √(1−k²)))
 *
 * Diverge en k = 1 (θ₀ = 180°, el péndulo en equilibrio invertido), que es un ángulo que el
 * deslizador no ofrece; aun así se acota para no devolver Infinity.
 */
export function integralElipticaK(k: number): number {
  const kk = Math.min(Math.abs(k), 0.9999999);
  let a = 1;
  let b = Math.sqrt(1 - kk * kk);
  for (let i = 0; i < 60 && Math.abs(a - b) > 1e-15; i++) {
    const siguienteA = (a + b) / 2;
    b = Math.sqrt(a * b);
    a = siguienteA;
  }
  return Math.PI / (2 * a);
}

/**
 * Período exacto de un péndulo simple SIN rozamiento y de amplitud θ₀.
 *
 * Con θ₀ → 0 tiende a 2π√(L/g), porque K(0) = π/2.
 */
export function periodoReal(L: number, g: number, theta0Rad: number): number {
  const longitud = Math.max(L, MIN_L);
  return 4 * Math.sqrt(longitud / g) * integralElipticaK(Math.sin(Math.abs(theta0Rad) / 2));
}

/** Régimen de θ″ + γ·θ′ + ω₀²·θ = 0 y su ζ = γ/(2ω₀). */
export function regimenAmortiguamiento(
  omega0: number,
  damping: number,
): { zeta: number; regimen: Regimen } {
  const zeta = Math.max(damping, 0) / (2 * omega0);
  if (Math.abs(zeta - 1) <= TOLERANCIA_CRITICO) return { zeta, regimen: 'critico' };
  return { zeta, regimen: zeta < 1 ? 'subamortiguado' : 'sobreamortiguado' };
}

/** Aceleración angular de la ecuación completa. */
function aceleracion(theta: number, omega: number, w02: number, damping: number): number {
  return -w02 * Math.sin(theta) - damping * omega;
}

/** Un paso de Runge-Kutta de orden 4 de la ecuación completa. */
function pasoRK4(e: EstadoPendulo, w02: number, damping: number, h: number): EstadoPendulo {
  const k1t = e.omega;
  const k1w = aceleracion(e.theta, e.omega, w02, damping);
  const k2t = e.omega + (h / 2) * k1w;
  const k2w = aceleracion(e.theta + (h / 2) * k1t, k2t, w02, damping);
  const k3t = e.omega + (h / 2) * k2w;
  const k3w = aceleracion(e.theta + (h / 2) * k2t, k3t, w02, damping);
  const k4t = e.omega + h * k3w;
  const k4w = aceleracion(e.theta + h * k3t, k4t, w02, damping);
  return {
    theta: e.theta + (h / 6) * (k1t + 2 * k2t + 2 * k3t + k4t),
    omega: e.omega + (h / 6) * (k1w + 2 * k2w + 2 * k3w + k4w),
  };
}

/** Pasos de integración por período natural: con ω₀·h = 2π/1000, RK4 pierde ~1e-11 por paso. */
const PASOS_POR_PERIODO = 1000;

/**
 * Avanza el péndulo `dt` segundos integrando θ″ + γ·θ′ + (g/L)·sen θ = 0 por Runge-Kutta 4,
 * troceando el intervalo en sub-pasos de T₀/1000 como mucho.
 *
 * Sustituye a Euler-Cromer con el dt de un frame (hallazgo 2641): conservaba bien el período,
 * pero la energía evaluada en cada frame oscilaba ±ω₀·dt/2 alrededor de E₀, y con γ = 0 el
 * «Total» de la pantalla no se quedaba quieto —con Júpiter, L = 0,10 m y θ₀ = 90°, entre
 * −10,66 % y +12,58 %—, justo la comprobación que el bloque educativo propone. Medido con
 * frames de 1/60 s: Euler-Cromer, ±2,6 % a 20° en la Tierra y ±12 % en el caso de Júpiter;
 * RK4 troceado, por debajo de 1e-8 en los dos tras diez minutos de animación.
 */
export function pasoNumerico(
  estado: EstadoPendulo,
  L: number,
  g: number,
  damping: number,
  dt: number,
): EstadoPendulo {
  if (!(dt > 0)) return estado;
  const w02 = g / Math.max(L, MIN_L);
  const omega0 = Math.sqrt(Math.abs(w02));
  const hMax = omega0 > 0 ? (2 * Math.PI) / omega0 / PASOS_POR_PERIODO : dt;
  const n = Math.min(Math.max(1, Math.ceil(dt / hMax)), 100000);
  const h = dt / n;
  let e = estado;
  for (let i = 0; i < n; i++) e = pasoRK4(e, w02, damping, h);
  return e;
}

/**
 * Período de la PRIMERA oscilación de la ecuación completa con rozamiento: el tiempo que
 * tarda el péndulo, soltado en reposo desde θ₀, en volver a su siguiente máximo del mismo lado.
 *
 * Con rozamiento la amplitud decae y, como el período del péndulo no lineal depende de la
 * amplitud, cada oscilación dura un poco menos que la anterior: no hay UN período, y el que
 * se publica es el de la primera, que es el que se cronometra al soltarlo. En la ecuación
 * lineal, el tiempo entre dos máximos consecutivos es exactamente 2π/ω_d.
 *
 * Devuelve null si no encuentra el máximo en 200 períodos naturales (el péndulo no oscila
 * de forma apreciable).
 */
export function periodoPrimeraOscilacion(
  L: number,
  g: number,
  theta0Rad: number,
  damping: number,
): number | null {
  const w02 = g / Math.max(L, MIN_L);
  const h = (2 * Math.PI) / Math.sqrt(w02) / 2000;
  const signo = theta0Rad >= 0 ? 1 : -1;
  let e: EstadoPendulo = { theta: theta0Rad, omega: 0 };
  let haVuelto = false; // la velocidad, en el sentido de θ₀, ya ha sido positiva
  for (let i = 1; i <= 400000; i++) {
    const sig = pasoRK4(e, w02, damping, h);
    const vAntes = signo * e.omega;
    const vDespues = signo * sig.omega;
    if (vDespues > 0) haVuelto = true;
    if (haVuelto && vAntes > 0 && vDespues <= 0) {
      // Máximo entre los dos pasos: interpolación lineal del cero de la velocidad.
      return (i - 1) * h + (vAntes / (vAntes - vDespues)) * h;
    }
    e = sig;
  }
  return null;
}

export function calcularDerivados(
  L: number,
  g: number,
  theta0Rad: number,
  modelo: Modelo = 'numerico',
  damping = 0,
): DerivadosFisicos {
  const omega0 = Math.sqrt(g / Math.max(L, MIN_L));
  const T0 = (2 * Math.PI) / omega0;
  const Treal = periodoReal(L, g, theta0Rad);
  const { zeta, regimen } = regimenAmortiguamiento(omega0, damping);
  const gamma = Math.max(damping, 0);

  let T: number | null = null;
  if (regimen === 'subamortiguado') {
    // Período lineal amortiguado: 2π/ω_d, con ω_d = √(ω₀² − γ²/4).
    const Tlineal = (2 * Math.PI) / Math.sqrt(omega0 * omega0 - (gamma * gamma) / 4);
    if (modelo === 'pequeno') {
      T = Tlineal;
    } else if (gamma === 0) {
      // Sin rozamiento, el exacto de esa amplitud.
      T = Treal;
    } else if (Math.abs(theta0Rad) < 1e-9) {
      // Amplitud nula: el límite de pequeños ángulos.
      T = Tlineal;
    } else {
      T = periodoPrimeraOscilacion(L, g, theta0Rad, gamma);
    }
  }

  return {
    T0,
    Treal,
    T,
    f: T === null ? null : 1 / T,
    omega: T === null ? null : (2 * Math.PI) / T,
    omega0,
    desviacion: Treal / T0 - 1,
    zeta,
    regimen,
  };
}

/**
 * Solución cerrada de la ecuación LINEAL amortiguada, soltada en reposo desde θ₀:
 *
 *   θ″ + γ·θ′ + ω₀²·θ = 0,   θ(0) = θ₀,   θ′(0) = 0,   a = γ/2
 *
 *   subamortiguado (a < ω₀), ω_d = √(ω₀² − a²):
 *       θ = θ₀·e^(−at)·[cos(ω_d·t) + (a/ω_d)·sen(ω_d·t)]      θ′ = −θ₀·(ω₀²/ω_d)·e^(−at)·sen(ω_d·t)
 *   crítico (a = ω₀):
 *       θ = θ₀·e^(−at)·(1 + a·t)                              θ′ = −θ₀·ω₀²·t·e^(−at)
 *   sobreamortiguado (a > ω₀), β = √(a² − ω₀²):
 *       θ = θ₀·e^(−at)·[cosh(β·t) + (a/β)·senh(β·t)]          θ′ = −θ₀·(ω₀²/β)·e^(−at)·senh(β·t)
 *
 * Antes era θ₀·e^(−γt/2)·cos(ω₀·t), que no resuelve esa ecuación: oscilaba con ω₀ en vez de
 * ω_d, salía con una velocidad inicial de −γθ₀/2 (un empujón) y seguía oscilando en régimen
 * sobreamortiguado (hallazgo 2639).
 */
export function thetaPequenosAngulos(
  theta0Rad: number,
  omega0: number,
  damping: number,
  t: number,
): EstadoPendulo {
  const a = Math.max(damping, 0) / 2;
  const w02 = omega0 * omega0;
  const { regimen } = regimenAmortiguamiento(omega0, damping);

  if (regimen === 'subamortiguado') {
    const wd = Math.sqrt(w02 - a * a);
    const env = Math.exp(-a * t);
    return {
      theta: theta0Rad * env * (Math.cos(wd * t) + (a / wd) * Math.sin(wd * t)),
      omega: -theta0Rad * (w02 / wd) * env * Math.sin(wd * t),
    };
  }
  if (regimen === 'critico') {
    const env = Math.exp(-a * t);
    return {
      theta: theta0Rad * env * (1 + a * t),
      omega: -theta0Rad * w02 * t * env,
    };
  }
  // Sobreamortiguado: e^(−at)·cosh(βt) y e^(−at)·senh(βt) se escriben con e^((β−a)t) y
  // e^(−(β+a)t), que no desbordan (β < a).
  const beta = Math.sqrt(a * a - w02);
  const lenta = Math.exp((beta - a) * t);
  const rapida = Math.exp(-(beta + a) * t);
  const coshEnv = (lenta + rapida) / 2;
  const senhEnv = (lenta - rapida) / 2;
  return {
    theta: theta0Rad * (coshEnv + (a / beta) * senhEnv),
    omega: -theta0Rad * (w02 / beta) * senhEnv,
  };
}

/**
 * Motivo por el que una gravedad no sirve, o null si sirve.
 *
 * El onChange del campo era `parseFloat(e.target.value) || 9.81`, así que un 0 —que es
 * falsy— se convertía en 9,81 EN SILENCIO y la etiqueta acababa mostrando la gravedad de la
 * Tierra como si la hubiera tecleado el usuario (hallazgo 975). En una app que compara la
 * Luna con Júpiter, «¿y con g = 0?» es justo lo que un alumno escribe en ese campo.
 */
export function validarGravedad(g: number): string | null {
  if (!Number.isFinite(g)) {
    return 'Escribe una gravedad: sin ella el péndulo no oscila.';
  }
  if (g === 0) {
    return 'Con gravedad nula no hay restitución: el péndulo no oscila, se queda donde lo sueltes. No hay período que calcular.';
  }
  if (g < 0) {
    return 'Una gravedad negativa apartaría la masa de la vertical en lugar de devolverla: el ángulo crecería sin límite y no habría oscilación. Escribe un valor positivo.';
  }
  if (g > 100) {
    return 'La gravedad debe ser como mucho de 100 m/s².';
  }
  return null;
}
