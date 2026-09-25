/**
 * La distribución χ² que juzga la pestaña Población: p-valor y valor crítico para CUALQUIER
 * número de grados de libertad, sin tabla escrita a mano.
 *
 * ⚠️ 24/09/2026 (hallazgo 1586, ALTO) — `interpretChiSquare` llevaba una tabla de valores
 * críticos (α = 0,05) de 1 a 5 grados de libertad y todo lo demás caía a `|| 3.841`, el de
 * gl = 1. Mientras ningún cruce pasaba de 4 fenotipos (gl = 3) no se notaba; el ABO de cuatro
 * grupos en dihíbrido con un rasgo que segregue da 8 fenotipos, gl = 7, crítico 14,067, y la
 * app juzgaba contra 3,841: como la simulación sortea con las proporciones esperadas,
 * P(χ²₇ > 3,841) ≈ 0,80, así que cuatro de cada cinco poblaciones simuladas correctamente se
 * publicaban como «p < 0,05 · Diferencia significativa». Ampliar la tabla habría dejado la
 * misma trampa un fenotipo más allá; calcular la distribución la cierra para todos.
 *
 * Sin dependencias, a propósito: se prueba sola (tests/apps/simulador-genetica.spec.ts) contra
 * la tabla publicada del NIST/SEMATECH e-Handbook, §1.3.6.7.4 «Critical Values of the
 * Chi-Square Distribution» (https://www.itl.nist.gov/div898/handbook/eda/section3/eda3674.htm).
 *
 * MÉTODO. P(χ²ₖ > x) = Q(k/2, x/2), la gamma incompleta regularizada SUPERIOR. Se evalúa con
 * su serie cuando x < a + 1 y con su fracción continua (algoritmo de Lentz) en el resto, que
 * es donde cada una converge deprisa (Press et al., Numerical Recipes, §6.2). Como a = k/2 es
 * siempre entero o semientero, ln Γ(a) sale EXACTO por recurrencia desde Γ(1) = 1 y
 * Γ(1/2) = √π, sin aproximación de Lanczos ni constantes que copiar.
 */

const EPSILON = 1e-15;
const MUY_PEQUENO = 1e-300;
const MAX_ITERACIONES = 1000;

/** ln Γ(a) para a entero o semientero positivo, por Γ(a + 1) = a·Γ(a). */
function lnGammaMedioEntero(a: number): number {
  if (a <= 0 || !Number.isInteger(a * 2)) {
    throw new RangeError(`lnGammaMedioEntero solo admite enteros y semienteros positivos: ${a}`);
  }
  let x = Number.isInteger(a) ? 1 : 0.5;
  let suma = Number.isInteger(a) ? 0 : 0.5 * Math.log(Math.PI);
  while (x < a) {
    suma += Math.log(x);
    x += 1;
  }
  return suma;
}

/** Q(a, x) = Γ(a, x) / Γ(a), la gamma incompleta regularizada superior. */
function gammaIncompletaSuperior(a: number, x: number): number {
  if (x <= 0) return 1;
  const prefactor = Math.exp(-x + a * Math.log(x) - lnGammaMedioEntero(a));

  if (x < a + 1) {
    // Serie de P(a, x); Q = 1 − P.
    let denominador = a;
    let termino = 1 / a;
    let suma = termino;
    for (let n = 1; n <= MAX_ITERACIONES; n++) {
      denominador += 1;
      termino *= x / denominador;
      suma += termino;
      if (Math.abs(termino) < Math.abs(suma) * EPSILON) break;
    }
    return Math.max(0, Math.min(1, 1 - suma * prefactor));
  }

  // Fracción continua de Q(a, x), por el algoritmo de Lentz modificado.
  let b = x + 1 - a;
  let c = 1 / MUY_PEQUENO;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= MAX_ITERACIONES; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < MUY_PEQUENO) d = MUY_PEQUENO;
    c = b + an / c;
    if (Math.abs(c) < MUY_PEQUENO) c = MUY_PEQUENO;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < EPSILON) break;
  }
  return Math.max(0, Math.min(1, prefactor * h));
}

/** p-valor del contraste: P(χ² con `gl` grados de libertad > `chi2`). */
export function pValorChiCuadrado(chi2: number, gl: number): number {
  if (!Number.isInteger(gl) || gl < 1) {
    throw new RangeError(`Los grados de libertad son un entero ≥ 1: ${gl}`);
  }
  return gammaIncompletaSuperior(gl / 2, chi2 / 2);
}

/**
 * Valor crítico: el x tal que P(χ²_gl > x) = α. Se busca por bisección sobre el p-valor, que
 * decrece con x; con 200 pasos el intervalo queda muy por debajo de la milésima que se imprime.
 */
export function valorCriticoChiCuadrado(gl: number, alfa: number = 0.05): number {
  let bajo = 0;
  let alto = 1;
  while (pValorChiCuadrado(alto, gl) > alfa) alto *= 2;
  for (let i = 0; i < 200; i++) {
    const medio = (bajo + alto) / 2;
    if (pValorChiCuadrado(medio, gl) > alfa) bajo = medio;
    else alto = medio;
  }
  return (bajo + alto) / 2;
}

/** La esperanza mínima por clase con la que se da por buena la aproximación χ². */
export const ESPERANZA_MINIMA_CHI_CUADRADO = 5;

/**
 * Las clases cuya frecuencia ESPERADA queda por debajo de 5, en el orden en que llegan.
 *
 * ⚠️ 25/09/2026 (hallazgo 1696) — el panel publicaba p y veredicto con N = 10, donde en Aa × Aa
 * se esperan 2,5 verdes. El estadístico solo sigue la distribución χ² cuando las esperanzas no
 * son pequeñas; por debajo, el p que se imprime no es el de verdad y el veredicto tampoco.
 *
 * Se aplica la versión ESTRICTA de la regla, la que se enseña en secundaria y bachillerato: toda
 * esperanza ≥ 5. La de Cochran (1954) tolera hasta un 20 % de clases por debajo de 5 en tablas
 * grandes, pero en gl = 1 exige 5 en todas —y hay quien pide 10—, que es el caso de la mayoría de
 * cruces de la app (https://en.wikipedia.org/wiki/Pearson%27s_chi-squared_test, «Assumptions»).
 */
export function clasesConEsperanzaPequena(
  esperadas: Record<string, { count: number }>
): Array<{ clase: string; esperada: number }> {
  return Object.entries(esperadas)
    .filter(([, datos]) => datos.count < ESPERANZA_MINIMA_CHI_CUADRADO)
    .map(([clase, datos]) => ({ clase, esperada: datos.count }));
}
