/**
 * Casos para clase — la tarea asignable de `simulador-distribucion-normal`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la matemática está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * `pdf`, `erf` y `cdf` se MOVIERON aquí desde `page.tsx`, tal cual, y la página las importa de
 * este fichero; `probabilidadNormal` es el cuerpo del `useMemo` de la probabilidad, EXTRAÍDO con
 * sus cuatro variables como parámetros. Hay una sola implementación: si la corrección y el panel
 * calcularan distinto, la app suspendería una respuesta que ella misma imprime.
 *
 * Lo único nuevo es `cuantilNormal` (la inversa de `cdf`, que la app no tenía porque no despeja
 * x), y se obtiene por bisección SOBRE esa misma `cdf`, no con una fórmula aparte.
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 * ⚠️ **N(μ, σ) con la DESVIACIÓN, no con la varianza.** La app escribe N(176, 7) con σ = 7; hay
 *    libros que escriben N(μ, σ²). Por eso ningún enunciado usa la notación N(·,·): todos dicen
 *    «media … y desviación estándar …» con palabras.
 *
 * ⚠️ **La tabla Z frente a la función exacta.** En clase se resuelve con la tabla: z con DOS
 *    decimales y Φ(z) con CUATRO. La app calcula con `erf` (error < 1,5·10⁻⁷). La técnica es la de
 *    los cuartiles de `calculadora-estadistica`: los datos están elegidos para que z salga EXACTA
 *    con dos decimales, así que la tabla y la función dan lo mismo salvo el redondeo de la cuarta
 *    cifra, que la tolerancia absorbe. Cuando la resta de dos valores de tabla cambia la última
 *    cifra de la respuesta, la solución lo dice (`notaTabla`). El test lo comprueba con una Φ
 *    propia, escrita en el test e independiente de esta.
 *
 * ⚠️ **Los cuantiles de la tabla no son exactos**: el 10 % superior es z ≈ 1,28 (1,2816) y el 5 %
 *    inferior está entre −1,64 y −1,65. Esos casos piden x redondeado a unidades o a décimas, con
 *    σ grande frente al error, de modo que cualquier z de la tabla entra en la tolerancia.
 *
 * ⚠️ **Las probabilidades se piden en %** con dos decimales, como las imprime el panel. Quien
 *    escribe el tanto por uno (0,1056 en vez de 10,56) recibe un aviso propio, no un «incorrecto»
 *    a secas.
 */

import { formatNumber } from '@/lib';

/* ─────────────────────────── La matemática de la app ─────────────────────────── */

/**
 * Función de densidad de probabilidad (PDF) de una N(μ, σ)
 */
export function pdf(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
}

/**
 * Función error (erf) — aproximación de Abramowitz & Stegun (precisión 1.5e-7)
 */
export function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1.0 / (1.0 + p * ax);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

/**
 * Función de distribución acumulada (CDF) de una N(μ, σ)
 * P(X ≤ x)
 */
export function cdf(x: number, mu: number, sigma: number): number {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.sqrt(2))));
}

export type TipoProbabilidad = 'menor' | 'mayor' | 'entre';

/**
 * La probabilidad que pinta el panel: P(X < a), P(X > a) o P(a < X < b), con a y b en cualquier
 * orden. Es el `useMemo` de la página con sus variables como parámetros.
 */
export function probabilidadNormal(
  tipo: TipoProbabilidad,
  a: number,
  b: number,
  mu: number,
  sigma: number,
): number {
  if (tipo === 'menor') return cdf(a, mu, sigma);
  if (tipo === 'mayor') return 1 - cdf(a, mu, sigma);
  if (tipo === 'entre') {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    return cdf(hi, mu, sigma) - cdf(lo, mu, sigma);
  }
  return 0;
}

/**
 * z tal que Φ(z) = p, por bisección sobre la MISMA `cdf` de la app. NaN fuera de (0, 1).
 * Cien iteraciones en [−10, 10] dejan el intervalo muy por debajo de la precisión de `erf`.
 */
export function cuantilNormal(p: number): number {
  if (!Number.isFinite(p) || p <= 0 || p >= 1) return NaN;
  let lo = -10;
  let hi = 10;
  for (let i = 0; i < 100; i++) {
    const medio = (lo + hi) / 2;
    if (cdf(medio, 0, 1) < p) lo = medio;
    else hi = medio;
  }
  return (lo + hi) / 2;
}

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Pregunta =
  /** P(X < a), P(X > a) o P(a < X < b), en %. */
  | 'probabilidad'
  /** P(X < a o X > b): lo que queda FUERA de [a, b], en %. */
  | 'fuera'
  /** Cuántos de `n` elementos se espera que queden fuera de [a, b]. */
  | 'recuento'
  /** La puntuación z de `a`. */
  | 'z'
  /** El valor x que deja por debajo una proporción `p`. */
  | 'cuantil'
  /** La σ que hace que una proporción `p` quede por debajo de `a`, conocida μ. */
  | 'sigma';

export interface DatosCaso {
  pregunta: Pregunta;
  mu: number;
  /** En la pregunta 'sigma' es la incógnita: no se da. */
  sigma?: number;
  tipo?: TipoProbabilidad;
  a?: number;
  b?: number;
  /** Proporción que queda POR DEBAJO (tanto por uno), en 'cuantil' y 'sigma'. */
  p?: number;
  /** Tamaño del lote, en 'recuento'. */
  n?: number;
  /** Decimales a los que se pide redondear. Por defecto 2. */
  decimales?: number;
}

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

/* ─────────────────────────── Utilidades de presentación ─────────────────────────── */

/** Espacio duro entre la cifra y el %, para que el signo no salte solo de línea. */
const NBSP = ' ';

/**
 * El signo menos tipográfico (U+2212) en lugar del guion, como en los enunciados: «−0,75» y no
 * «-0,75». La casilla de respuesta admite los dos.
 */
function conMenos(texto: string): string {
  return texto.replace(/^-/, '−');
}

/** Cifra intermedia en formato español, sin ceros de relleno: «0,8944», «1.000». */
function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  return conMenos((n + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales }));
}

/** Cifra con un número FIJO de decimales: «0,8944», «1,50». */
function fijo(n: number, decimales: number): string {
  if (!Number.isFinite(n)) return '—';
  return conMenos(
    (n + 0).toLocaleString('es-ES', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    }),
  );
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/** Φ(z) como la da la tabla: z con dos decimales, Φ con cuatro. */
function phiTabla(z: number): number {
  return redondear(cdf(redondear(z, 2), 0, 1), 4);
}

/** «Φ(1,25) = 0,8944», y para z negativa, por simetría: «Φ(−1,25) = 1 − Φ(1,25) = 0,1056». */
function lecturaTabla(z: number): string {
  const zr = redondear(z, 2);
  if (zr >= 0) return `Φ(${fijo(zr, 2)}) = ${fijo(phiTabla(zr), 4)}`;
  const positivo = -zr;
  return `Φ(${fijo(zr, 2)}) = 1 − Φ(${fijo(positivo, 2)}) = 1 − ${fijo(phiTabla(positivo), 4)} = ${fijo(1 - phiTabla(positivo), 4)}`;
}

function tipificacion(x: number, mu: number, sigma: number): string {
  const z = (x - mu) / sigma;
  return `z = (${numero(x)} − ${numero(mu)}) / ${numero(sigma)} = ${fijo(z, 2)}`;
}

/**
 * La nota de redondeo de tabla: si con los valores de la tabla la respuesta redondeada sale
 * distinta, se dice cuánto da y que también vale. Sin ella, el alumno que resta 0,8944 − 0,1056
 * vería 0,7888 en su cuaderno y 78,87 % en la solución, y creería haberse equivocado.
 */
function notaTabla(exacto: number, conTabla: number, decimales: number, sufijo: string): string | null {
  if (redondear(exacto, decimales) === redondear(conTabla, decimales)) return null;
  return `Con los valores redondeados de la tabla sale ${fijo(conTabla, decimales)}${sufijo}: la diferencia es solo de redondeo y también se da por buena.`;
}

/**
 * El z de la tabla para una proporción `p`: el de dos decimales cuya Φ tabulada está más cerca.
 * Si hay empate (0,95 queda justo entre 1,64 y 1,65), se dicen los dos.
 */
function zDeTabla(p: number): { texto: string; valores: number[] } {
  const exacto = cuantilNormal(p);
  const abajo = Math.floor(exacto * 100) / 100;
  const arriba = redondear(abajo + 0.01, 2);
  const dAbajo = Math.abs(redondear(cdf(abajo, 0, 1), 4) - p);
  const dArriba = Math.abs(redondear(cdf(arriba, 0, 1), 4) - p);
  if (Math.abs(dAbajo - dArriba) < 1e-9) {
    return {
      texto: `entre ${fijo(abajo, 2)} y ${fijo(arriba, 2)} (con más precisión, ${fijo(exacto, 4)})`,
      valores: [abajo, arriba],
    };
  }
  const elegido = dAbajo < dArriba ? abajo : arriba;
  return { texto: `≈ ${fijo(elegido, 2)} (con más precisión, ${fijo(exacto, 4)})`, valores: [elegido] };
}

function falta(nombre: string): Resolucion {
  return { ok: false, valor: NaN, pasos: [], error: `Falta el dato ${nombre}.` };
}

function valido(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

/* ─────────────────────────── Resolución ─────────────────────────── */

/**
 * Recalcula un caso desde sus datos, sin mirar la respuesta declarada. Nunca lanza: devuelve
 * `{ ok: false }` con los datos incompletos o imposibles.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const { pregunta, mu } = datos;
  const decimales = datos.decimales ?? 2;
  if (!valido(mu)) return falta('μ');

  if (pregunta === 'sigma') {
    const { a, p } = datos;
    if (!valido(a)) return falta('x');
    if (!valido(p) || p <= 0 || p >= 1) return falta('p');
    const z = cuantilNormal(p);
    if (!Number.isFinite(z) || Math.abs(z) < 1e-9) {
      return { ok: false, valor: NaN, pasos: [], error: 'Con p = 0,5 la σ no se puede despejar.' };
    }
    const sigma = (a - mu) / z;
    if (!(sigma > 0)) {
      return { ok: false, valor: NaN, pasos: [], error: 'Los datos darían una σ negativa.' };
    }
    const tabla = zDeTabla(p);
    return {
      ok: true,
      valor: sigma,
      pasos: [
        `Que el ${numero(p * 100, 2)}${NBSP}% quede por debajo de ${numero(a)} significa P(X < ${numero(a)}) = ${fijo(p, 4)}.`,
        `Busca ${fijo(p, 4)} DENTRO de la tabla Z: z ${tabla.texto}.`,
        `Tipifica al revés: z = (x − μ) / σ, así que σ = (x − μ) / z = (${numero(a)} − ${numero(mu)}) / ${fijo(z, 2)}.`,
        `σ = ${numero(a - mu)} / ${fijo(z, 2)} = ${fijo(sigma, decimales)}.`,
      ],
    };
  }

  const sigma = datos.sigma;
  if (!valido(sigma) || sigma <= 0) return falta('σ (positiva)');

  if (pregunta === 'z') {
    const { a } = datos;
    if (!valido(a)) return falta('x');
    const z = (a - mu) / sigma;
    return {
      ok: true,
      valor: z,
      pasos: [
        'Tipificar es medir la distancia a la media en desviaciones estándar: z = (x − μ) / σ.',
        tipificacion(a, mu, sigma) + '.',
        z < 0
          ? `El signo menos dice que el valor está por DEBAJO de la media, a ${fijo(-z, 2)} desviaciones estándar.`
          : `El valor está por ENCIMA de la media, a ${fijo(z, 2)} desviaciones estándar.`,
      ],
    };
  }

  if (pregunta === 'cuantil') {
    const { p } = datos;
    if (!valido(p) || p <= 0 || p >= 1) return falta('p');
    const z = cuantilNormal(p);
    const x = mu + z * sigma;
    const pasos: string[] = [`Se busca el x que deja por debajo el ${numero(p * 100, 2)}${NBSP}%: P(X < x) = ${fijo(p, 4)}.`];
    if (p >= 0.5) {
      pasos.push(`Busca ${fijo(p, 4)} DENTRO de la tabla Z: z ${zDeTabla(p).texto}.`);
    } else {
      pasos.push(
        `La tabla solo trae z positivas: por simetría, busca 1 − ${fijo(p, 4)} = ${fijo(1 - p, 4)}, que da z ${zDeTabla(1 - p).texto}, y cámbiale el signo, porque el valor está por debajo de la media.`,
      );
    }
    pasos.push(
      `Deshaz la tipificación: x = μ + z·σ = ${numero(mu)} + (${fijo(z, 4)})·${numero(sigma)} = ${fijo(x, decimales)}.`,
    );
    return { ok: true, valor: x, pasos };
  }

  // Las tres preguntas de probabilidad: 'probabilidad', 'fuera' y 'recuento'.
  const { a } = datos;
  if (!valido(a)) return falta('a');
  const tipo: TipoProbabilidad = pregunta === 'probabilidad' ? (datos.tipo ?? 'menor') : 'entre';
  const necesitaB = tipo === 'entre';
  if (necesitaB && !valido(datos.b)) return falta('b');
  const b = datos.b ?? a;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const zLo = (lo - mu) / sigma;
  const zHi = (hi - mu) / sigma;

  const pasos: string[] = [];
  if (tipo === 'entre') {
    pasos.push(`Tipifica los dos extremos: ${tipificacion(lo, mu, sigma)} y ${tipificacion(hi, mu, sigma)}.`);
    pasos.push(`Lee la tabla: ${lecturaTabla(zHi)} y ${lecturaTabla(zLo)}.`);
  } else {
    pasos.push(`Tipifica: ${tipificacion(a, mu, sigma)}.`);
    pasos.push(`Lee la tabla: ${lecturaTabla(zLo)}.`);
  }

  const dentro = probabilidadNormal(tipo, a, b, mu, sigma);
  const dentroTabla = tipo === 'entre' ? phiTabla(zHi) - phiTabla(zLo) : phiTabla(zLo);

  if (pregunta === 'probabilidad') {
    let prob = dentro;
    let probTabla = dentroTabla;
    if (tipo === 'menor') {
      pasos.push(`P(X < ${numero(a)}) = P(Z < ${fijo(zLo, 2)}) = ${fijo(prob, 4)}.`);
    } else if (tipo === 'mayor') {
      probTabla = 1 - dentroTabla;
      pasos.push(
        `La tabla da el área a la IZQUIERDA; la de la derecha es el resto: P(X > ${numero(a)}) = 1 − P(Z < ${fijo(zLo, 2)}) = ${fijo(prob, 4)}.`,
      );
    } else {
      pasos.push(
        `P(${numero(lo)} < X < ${numero(hi)}) = Φ(${fijo(zHi, 2)}) − Φ(${fijo(zLo, 2)}) = ${fijo(prob, 4)}.`,
      );
    }
    prob = redondear(prob * 100, 10);
    pasos.push(`En porcentaje: ${fijo(prob, decimales)}${NBSP}%.`);
    const nota = notaTabla(prob, probTabla * 100, decimales, `${NBSP}%`);
    if (nota) pasos.push(nota);
    return { ok: true, valor: prob, pasos };
  }

  const fuera = 1 - dentro;
  const fueraTabla = 1 - dentroTabla;
  pasos.push(
    `Lo que queda FUERA es el resto del área: 1 − P(${numero(lo)} < X < ${numero(hi)}) = 1 − (Φ(${fijo(zHi, 2)}) − Φ(${fijo(zLo, 2)})) = ${fijo(fuera, 4)}.`,
  );

  if (pregunta === 'fuera') {
    const prob = fuera * 100;
    pasos.push(`En porcentaje: ${fijo(prob, decimales)}${NBSP}%.`);
    const nota = notaTabla(prob, fueraTabla * 100, decimales, `${NBSP}%`);
    if (nota) pasos.push(nota);
    return { ok: true, valor: prob, pasos };
  }

  // 'recuento'
  const { n } = datos;
  if (!valido(n) || n <= 0) return falta('n');
  const esperados = n * fuera;
  pasos.push(`De ${numero(n)} elementos se esperan ${numero(n)} · ${fijo(fuera, 4)} = ${fijo(esperados, 2)}.`);
  const nota = notaTabla(esperados, n * fueraTabla, decimales, '');
  if (nota) pasos.push(nota);
  return { ok: true, valor: esperados, pasos };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** El MAYOR entre 0,01 y el 1 % del valor esperado. */
export function toleranciaDe(valor: number): number {
  return Math.max(0.01, Math.abs(valor) * 0.01);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/**
 * Corrige la respuesta del alumno. Nunca lanza.
 *
 * `enPorcentaje` activa el aviso del tanto por uno: si piden 10,56 y el alumno escribe 0,1056,
 * no se equivocó en la estadística sino en la unidad, y se le dice así.
 */
export function comprobarRespuesta(usuario: number, esperado: number, enPorcentaje = false): Veredicto {
  const tolerancia = toleranciaDe(esperado);

  if (!Number.isFinite(usuario)) {
    return {
      correcto: false,
      motivo: 'Escribe un número (puedes usar la coma decimal).',
      diferencia: NaN,
      tolerancia,
    };
  }

  const diferencia = Math.abs(usuario - esperado);
  /**
   * Margen de ruido binario (hallazgo 1211 de `simulador-conservacion-energia`): en el borde
   * EXACTO de la tolerancia la resta en coma flotante decide por ±1 ulp. 1e-9 absorbe ese ruido
   * y queda siete órdenes de magnitud por debajo de la tolerancia más pequeña (0,01).
   */
  const RUIDO_BINARIO = 1e-9;
  if (diferencia <= tolerancia + RUIDO_BINARIO) {
    return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  }

  if (enPorcentaje && Math.abs(usuario * 100 - esperado) <= tolerancia + RUIDO_BINARIO) {
    return {
      correcto: false,
      motivo: `Casi: has escrito la probabilidad en tanto por uno. Aquí se pide en porcentaje: multiplícala por 100 (${fijo(usuario * 100, 2)}).`,
      diferencia,
      tolerancia,
    };
  }

  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${numero(diferencia, 2)} de la respuesta.`,
    diferencia,
    tolerancia,
  };
}

/* ─────────────────────────── Los doce casos ─────────────────────────── */

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  pasos: string[];
  pista: string;
}

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas: el 91 % de este canal es de fuera de España. Todas las z de
 * los casos de probabilidad salen exactas con dos decimales (ver la cabecera).
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>> = [
  {
    id: 1,
    titulo: 'El área a la izquierda',
    enunciado: `Z sigue una distribución normal estándar (media 0 y desviación estándar 1). Calcula P(Z < 1,25). Da el resultado en %, redondeado a dos decimales.`,
    categoria: 'abstracto',
    datos: { pregunta: 'probabilidad', tipo: 'menor', mu: 0, sigma: 1, a: 1.25 },
    etiquetaRespuesta: 'P en %',
    pista: 'Es la lectura directa de la tabla Z: fila 1,2 y columna 0,05.',
  },
  {
    id: 2,
    titulo: 'Mayor que un valor negativo',
    enunciado: `Z sigue una distribución normal estándar. Calcula P(Z > −0,75). Da el resultado en %, redondeado a dos decimales.`,
    categoria: 'abstracto',
    datos: { pregunta: 'probabilidad', tipo: 'mayor', mu: 0, sigma: 1, a: -0.75 },
    etiquetaRespuesta: 'P en %',
    pista: 'La curva es simétrica: el área a la derecha de −0,75 es igual que el área a la izquierda de +0,75.',
  },
  {
    id: 3,
    titulo: 'Entre dos valores de Z',
    enunciado: `Z sigue una distribución normal estándar. Calcula P(−0,5 < Z < 1,5). Da el resultado en %, redondeado a dos decimales.`,
    categoria: 'abstracto',
    datos: { pregunta: 'probabilidad', tipo: 'entre', mu: 0, sigma: 1, a: -0.5, b: 1.5 },
    etiquetaRespuesta: 'P en %',
    pista: 'El área entre dos valores es el área a la izquierda del mayor menos el área a la izquierda del menor.',
  },
  {
    id: 4,
    titulo: 'Tipificar una puntuación',
    enunciado:
      'Las puntuaciones de un examen de admisión siguen una distribución normal de media 70 puntos y desviación estándar 8 puntos. ¿Cuál es la puntuación z de quien obtuvo 58 puntos? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { pregunta: 'z', mu: 70, sigma: 8, a: 58 },
    etiquetaRespuesta: 'z (sin unidad)',
    pista: 'z = (x − μ) / σ. Si la puntuación está por debajo de la media, z sale negativa.',
  },
  {
    id: 5,
    titulo: 'Paquetes que pesan de menos',
    enunciado: `Una máquina llena paquetes de arroz de 1 kg. La masa de los paquetes sigue una distribución normal de media 1000 g y desviación estándar 8 g. ¿Qué porcentaje de paquetes pesa menos de 990 g? Redondea a dos decimales.`,
    categoria: 'aplicado',
    datos: { pregunta: 'probabilidad', tipo: 'menor', mu: 1000, sigma: 8, a: 990 },
    etiquetaRespuesta: 'P en %',
    pista: 'Tipifica 990 g: sale una z negativa. La tabla da Φ de z positivas; para las negativas, Φ(−z) = 1 − Φ(z).',
  },
  {
    id: 6,
    titulo: 'Baterías que duran mucho',
    enunciado: `La duración de las baterías de un modelo de linterna sigue una distribución normal de media 40 horas y desviación estándar 5 horas. ¿Qué porcentaje de baterías dura más de 50 horas? Redondea a dos decimales.`,
    categoria: 'aplicado',
    datos: { pregunta: 'probabilidad', tipo: 'mayor', mu: 40, sigma: 5, a: 50 },
    etiquetaRespuesta: 'P en %',
    pista: '50 horas está exactamente a dos desviaciones estándar de la media. La regla 68-95-99,7 te dice por dónde tiene que salir.',
  },
  {
    id: 7,
    titulo: 'Estaturas en un intervalo simétrico',
    enunciado: `La estatura de los estudiantes de 15 años de una escuela sigue una distribución normal de media 160 cm y desviación estándar 8 cm. ¿Qué porcentaje mide entre 150 y 170 cm? Redondea a dos decimales.`,
    categoria: 'aplicado',
    datos: { pregunta: 'probabilidad', tipo: 'entre', mu: 160, sigma: 8, a: 150, b: 170 },
    etiquetaRespuesta: 'P en %',
    pista: 'Los dos extremos están a la misma distancia de la media, así que P = 2·Φ(z) − 1.',
  },
  {
    id: 8,
    titulo: 'El tiempo de viaje a la escuela',
    enunciado: `El tiempo que tarda un estudiante en llegar a la escuela sigue una distribución normal de media 25 minutos y desviación estándar 4 minutos. ¿Qué porcentaje de los días tarda entre 21 y 30 minutos? Redondea a dos decimales.`,
    categoria: 'aplicado',
    datos: { pregunta: 'probabilidad', tipo: 'entre', mu: 25, sigma: 4, a: 21, b: 30 },
    etiquetaRespuesta: 'P en %',
    pista: 'Tipifica los dos extremos por separado: aquí NO son simétricos, uno queda a 1 desviación estándar y el otro a 1,25.',
  },
  {
    id: 9,
    titulo: 'La nota de corte de una beca',
    enunciado: `Las puntuaciones de una prueba siguen una distribución normal de media 500 y desviación estándar 100. Una beca se concede al 10${NBSP}% con mejor puntuación. ¿Qué puntuación mínima hace falta? Redondea a unidades.`,
    categoria: 'aplicado',
    datos: { pregunta: 'cuantil', mu: 500, sigma: 100, p: 0.9, decimales: 0 },
    etiquetaRespuesta: 'Puntuación mínima',
    pista: 'Si el 10 % queda por ENCIMA, el 90 % queda por debajo: busca 0,9000 dentro de la tabla, no en sus bordes.',
  },
  {
    id: 10,
    titulo: 'Las botellas con menos líquido',
    enunciado: `Una máquina llena botellas con un volumen que sigue una distribución normal de media 500 mL y desviación estándar 4 mL. ¿Por debajo de qué volumen queda el 5${NBSP}% de las botellas con menos líquido? Redondea a una décima.`,
    categoria: 'aplicado',
    datos: { pregunta: 'cuantil', mu: 500, sigma: 4, p: 0.05, decimales: 1 },
    etiquetaRespuesta: 'Volumen en mL',
    pista: 'El valor está por debajo de la media, así que su z es negativa. Busca 0,9500 en la tabla y cámbiale el signo.',
  },
  {
    id: 11,
    titulo: 'Tornillos rechazados en un lote',
    enunciado:
      'El diámetro de los tornillos de una fábrica sigue una distribución normal de media 10 mm y desviación estándar 0,2 mm. Se rechazan los que miden menos de 9,6 mm o más de 10,4 mm. En un lote de 2000 tornillos, ¿cuántos se espera rechazar? Redondea a unidades.',
    categoria: 'aplicado',
    datos: { pregunta: 'recuento', mu: 10, sigma: 0.2, a: 9.6, b: 10.4, n: 2000, decimales: 0 },
    etiquetaRespuesta: 'Tornillos rechazados',
    pista: 'Primero la probabilidad de quedar FUERA de [9,6; 10,4]; después multiplícala por el tamaño del lote.',
  },
  {
    id: 12,
    titulo: 'Averiguar la desviación estándar',
    enunciado: `Las puntuaciones de una prueba, de 0 a 100, siguen una distribución normal de media 62 puntos. Se sabe que el 84,13${NBSP}% de los participantes obtiene menos de 78 puntos. ¿Cuánto vale la desviación estándar? Redondea a una décima.`,
    categoria: 'abstracto',
    datos: { pregunta: 'sigma', mu: 62, a: 78, p: 0.8413, decimales: 1 },
    etiquetaRespuesta: 'σ en puntos',
    pista: 'Busca 0,8413 dentro de la tabla Z: es un valor muy conocido. Después despeja σ de z = (x − μ) / σ.',
  },
];

/** ¿La respuesta de este caso es una probabilidad en %? Lo usa la vista para el aviso del tanto por uno. */
export function esPorcentaje(datos: DatosCaso): boolean {
  return datos.pregunta === 'probabilidad' || datos.pregunta === 'fuera';
}

/**
 * Formatea el resultado con su unidad a partir de la etiqueta: «89,44 %», «493,4 mL». La unidad
 * es lo que va detrás de « en » en la etiqueta; el % va con espacio duro.
 */
export function textoRespuesta(valor: number, etiqueta: string, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  const corte = etiqueta.indexOf(' en ');
  const unidad = corte === -1 ? '' : etiqueta.slice(corte + 4);
  const cifra = conMenos(formatNumber(valor, decimales));
  return unidad ? `${cifra}${NBSP}${unidad}` : cifra;
}

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const decimales = def.datos.decimales ?? 2;
  const valor = r.ok ? redondear(r.valor, decimales) : NaN;
  return {
    ...def,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.etiquetaRespuesta, decimales),
    pasos: r.pasos,
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente con
 * enteros pequeños, los primeros valores salen diminutos y parecidos, y `Math.floor(rnd()*n)`
 * devuelve el índice 0 una y otra vez: el «aleatorio» acaba dando SIEMPRE el mismo ejercicio y
 * aun así pasa la prueba de reproducibilidad, porque reproducible no es variado.
 */
function aleatorioCon(semilla: number): () => number {
  let estado = (semilla >>> 0) || 1;
  return () => {
    estado = (estado + 0x9e3779b9) >>> 0;
    let z = estado;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
    z = (z ^ (z >>> 15)) >>> 0;
    return z / 0x100000000;
  };
}

export interface Ejercicio {
  enunciado: string;
  datos: DatosCaso;
  respuesta: number;
  etiquetaRespuesta: string;
  pasos: string[];
}

/**
 * Listas «amables». Las z van de cuarto en cuarto y hasta 2: salen EXACTAS con dos decimales
 * (la tabla y la función coinciden) y la cola más pequeña es un 2,28 %, lejos de la zona donde
 * la tolerancia mínima de 0,01 empezaría a aceptar cualquier cosa.
 */
const MEDIAS = [20, 50, 70, 100, 150, 500] as const;
const DESVIACIONES = [2, 4, 5, 8, 10, 20] as const;
const ZETAS = [-2, -1.75, -1.5, -1.25, -1, -0.75, -0.5, -0.25, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
const TIPOS = ['menor', 'mayor', 'entre', 'z'] as const;

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

/**
 * Ejercicio aleatorio de probabilidad o de tipificación. Usa EL MISMO `resolverCaso` que los doce
 * fijos, y por tanto la misma `cdf` que el panel: si divergieran, el alumno entrenaría con una
 * regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const tipo = elegir(TIPOS, rnd);
  const mu = elegir(MEDIAS, rnd);
  const sigma = elegir(DESVIACIONES, rnd);
  const z1 = elegir(ZETAS, rnd);
  const x = (z: number) => redondear(mu + z * sigma, 4);
  const presentacion = `Una variable X sigue una distribución normal de media ${numero(mu)} y desviación estándar ${numero(sigma)}.`;
  const redondeo = 'Da el resultado en %, redondeado a dos decimales.';

  let datos: DatosCaso;
  let enunciado: string;
  let etiqueta = 'P en %';

  if (tipo === 'menor') {
    datos = { pregunta: 'probabilidad', tipo: 'menor', mu, sigma, a: x(z1) };
    enunciado = `${presentacion} Calcula P(X < ${numero(x(z1))}). ${redondeo}`;
  } else if (tipo === 'mayor') {
    datos = { pregunta: 'probabilidad', tipo: 'mayor', mu, sigma, a: x(z1) };
    enunciado = `${presentacion} Calcula P(X > ${numero(x(z1))}). ${redondeo}`;
  } else if (tipo === 'entre') {
    const resto = ZETAS.filter((z) => z !== z1);
    const z2 = elegir(resto, rnd);
    const [lo, hi] = z1 < z2 ? [z1, z2] : [z2, z1];
    datos = { pregunta: 'probabilidad', tipo: 'entre', mu, sigma, a: x(lo), b: x(hi) };
    enunciado = `${presentacion} Calcula P(${numero(x(lo))} < X < ${numero(x(hi))}). ${redondeo}`;
  } else {
    datos = { pregunta: 'z', mu, sigma, a: x(z1) };
    enunciado = `${presentacion} ¿Cuál es la puntuación z del valor ${numero(x(z1))}? Redondea a dos decimales.`;
    etiqueta = 'z (sin unidad)';
  }

  const r = resolverCaso(datos);
  return {
    enunciado,
    datos,
    respuesta: r.ok ? redondear(r.valor, datos.decimales ?? 2) : NaN,
    etiquetaRespuesta: etiqueta,
    pasos: r.pasos,
  };
}
