/**
 * Motor del péndulo simple.
 *
 * Vive aparte porque el defecto que lo motivó era que la integración numérica —que existe,
 * es correcta y mueve la animación— no llegaba nunca a la caja de resultados: «Período T»
 * salía siempre de 2π√(L/g) sin mirar el modelo seleccionado, así que la misma pantalla
 * enseñaba un número y balanceaba el péndulo a otro ritmo (hallazgo 971).
 *
 * El período exacto de un péndulo simple de amplitud θ₀ no es 2π√(L/g), sino
 *
 *     T = 4·√(L/g)·K(sen(θ₀/2))
 *
 * donde K es la integral elíptica completa de primera especie. Se calcula aquí con la media
 * aritmético-geométrica: K(k) = π / (2·AGM(1, √(1−k²))), que converge cuadráticamente y da
 * quince cifras exactas en cinco iteraciones. Es lo que permite publicar el «período real»
 * que el FAQPage de la app promete (hallazgo 972) y corregir el aviso de grandes ángulos,
 * que usaba solo el primer término de la serie de Bernoulli y se quedaba corto justo en los
 * ángulos que el propio deslizador ofrece (hallazgo 973).
 *
 * Casos resueltos a mano en tests/pendulo-motor.spec.ts.
 */

export type Modelo = 'numerico' | 'pequeno';

export interface EstadoPendulo {
  theta: number; // rad
  omega: number; // rad/s
}

export interface DerivadosFisicos {
  /** T₀ = 2π√(L/g), el período de la aproximación de pequeños ángulos. */
  T0: number;
  /** T = 4√(L/g)·K(sen(θ₀/2)), el período exacto para esa amplitud. */
  Treal: number;
  /** El que se publica, según el modelo elegido. */
  T: number;
  f: number;
  omega0: number;
  /** T_real / T₀ − 1, en tanto por uno. Con θ₀ = 90° vale 0,1803. */
  desviacion: number;
}

const MIN_L = 0.0001;

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
 * Período exacto de un péndulo simple de amplitud θ₀.
 *
 * Con θ₀ → 0 tiende a 2π√(L/g), porque K(0) = π/2.
 */
export function periodoReal(L: number, g: number, theta0Rad: number): number {
  const longitud = Math.max(L, MIN_L);
  return 4 * Math.sqrt(longitud / g) * integralElipticaK(Math.sin(Math.abs(theta0Rad) / 2));
}

export function calcularDerivados(
  L: number,
  g: number,
  theta0Rad: number,
  modelo: Modelo = 'numerico'
): DerivadosFisicos {
  const omega0 = Math.sqrt(g / Math.max(L, MIN_L));
  const T0 = (2 * Math.PI) / omega0;
  const Treal = periodoReal(L, g, theta0Rad);
  // La pestaña activa decide qué número se publica: el modelo numérico integra la ecuación
  // completa, así que su período es el real; la aproximación lineal publica el suyo.
  const T = modelo === 'numerico' ? Treal : T0;

  return {
    T0,
    Treal,
    T,
    f: 1 / T,
    omega0,
    desviacion: Treal / T0 - 1,
  };
}

/**
 * Paso de integración (Euler-Cromer) de la ecuación completa:
 *   θ″ + (γ/m·L²)·θ′ + (g/L)·sen(θ) = 0
 * con `damping` como coeficiente efectivo.
 */
export function pasoEulerNumerico(
  estado: EstadoPendulo,
  L: number,
  g: number,
  damping: number,
  dt: number
): EstadoPendulo {
  const alpha = -(g / Math.max(L, MIN_L)) * Math.sin(estado.theta) - damping * estado.omega;
  const omega = estado.omega + alpha * dt;
  return { theta: estado.theta + omega * dt, omega };
}

/** Solución cerrada de pequeños ángulos: θ(t) = θ₀·e^(−γt/2)·cos(ω₀·t). */
export function thetaPequenosAngulos(
  theta0Rad: number,
  omega0: number,
  damping: number,
  t: number
): EstadoPendulo {
  const envolvente = Math.exp((-damping * t) / 2);
  return {
    theta: theta0Rad * envolvente * Math.cos(omega0 * t),
    omega:
      theta0Rad *
      envolvente *
      (-omega0 * Math.sin(omega0 * t) - (damping / 2) * Math.cos(omega0 * t)),
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
