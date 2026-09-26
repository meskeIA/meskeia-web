/**
 * Motor de cálculo de Estadística Avanzada — funciones puras, sin React ni formato.
 *
 * Sacado de page.tsx el 26/09/2026 al reparar la inspección del 25/09 (hallazgos 2007-2014).
 * Solo depende de jStat para las funciones de distribución (t, χ², F, normal); los
 * estadísticos —momentos, rangos, sumas de cuadrados, tablas de contingencia— se calculan
 * aquí a mano para que cada uno se pueda comprobar contra un caso resuelto en papel.
 *
 * Tres reglas que atraviesan todo el fichero:
 *
 *  1. Un estadístico que no existe NO se publica con veredicto. Con varianza cero, X o Y
 *     constantes o todos los datos iguales, el cociente es 0/0 o c/0; hasta el 26/09/2026 el
 *     p-valor salía NaN y `NaN < 0,05` es falso, así que la app lo convertía en «No
 *     significativo» (2010) o en «Se rechaza normalidad» (2011). Ahora cada resultado lleva
 *     `motivoIndefinido` y la vista lo enseña en lugar de las cifras.
 *  2. Un estadístico INFINITO sí tiene p-valor: ajuste perfecto (r = ±1, residuos nulos) da
 *     t = ±∞ y P(|T| > ∞) = 0. jStat devuelve NaN en cdf(∞): se resuelve aquí.
 *  3. La aproximación χ² solo vale con esperadas no pequeñas (Cochran, 1954). Por debajo se
 *     da el estadístico, pero no el p-valor ni el veredicto (2014).
 */

import jStat from 'jstat';

export const ALFA = 0.05;

// ─── Utilidades ────────────────────────────────────────────────────────────

const suma = (xs: number[]): number => xs.reduce((s, x) => s + x, 0);
const media = (xs: number[]): number => suma(xs) / xs.length;

/** Suma de cuadrados de las desviaciones respecto a la media. */
const sumaCuadrados = (xs: number[]): number => {
  const m = media(xs);
  return xs.reduce((s, x) => s + (x - m) * (x - m), 0);
};

/**
 * ¿Es cero una suma de cuadrados? Con datos constantes la resta x − x̄ puede dejar restos de
 * redondeo del orden de 1e-30 en vez de un 0 limpio (p. ej. 0,1 + 0,2), así que se compara con
 * la escala de los propios datos.
 */
const esCeroRelativo = (valor: number, escala: number): boolean =>
  Math.abs(valor) <= 1e-12 * Math.max(1, escala);

/** P(|T| > |t|) con `gl` grados de libertad. Con t = ±∞ es 0; con t indefinido, NaN. */
export function pValorBilateralT(t: number, gl: number): number {
  if (Number.isNaN(t) || !(gl > 0)) return NaN;
  if (!Number.isFinite(t)) return 0;
  return 2 * (1 - jStat.studentt.cdf(Math.abs(t), gl));
}

/** P(χ²_gl > x). */
export function pValorChiCuadrado(x: number, gl: number): number {
  if (Number.isNaN(x) || !(gl > 0)) return NaN;
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, 1 - jStat.chisquare.cdf(x, gl));
}

export interface Veredicto {
  significativo: boolean;
  texto: string;
}

/** α con coma decimal: «0,05». */
export const alfaTexto = (alfa: number = ALFA): string => alfa.toLocaleString('es-ES');

/**
 * Veredicto al nivel α. Devuelve null si el p-valor no es un número: un p indefinido no es
 * «no significativo», es que no hay contraste (2010).
 */
export function interpretarP(p: number, alfa: number = ALFA): Veredicto | null {
  if (!Number.isFinite(p)) return null;
  return p < alfa
    ? { significativo: true, texto: `Significativo (p < ${alfaTexto(alfa)})` }
    : { significativo: false, texto: `No significativo (p ≥ ${alfaTexto(alfa)})` };
}

/** Lectura de la fuerza de una correlación. Null si r no existe (2011). */
export function interpretarCorrelacion(r: number): string | null {
  if (!Number.isFinite(r)) return null;
  const absR = Math.abs(r);
  const direccion = r >= 0 ? 'positiva' : 'negativa';
  if (absR < 0.1) return 'Correlación nula o muy débil';
  if (absR < 0.3) return `Correlación ${direccion} débil`;
  if (absR < 0.5) return `Correlación ${direccion} moderada`;
  if (absR < 0.7) return `Correlación ${direccion} fuerte`;
  if (absR < 0.9) return `Correlación ${direccion} muy fuerte`;
  if (absR < 1) return `Correlación ${direccion} casi perfecta`;
  return `Correlación ${direccion} perfecta`;
}

// ─── Test t ────────────────────────────────────────────────────────────────

export interface ResultadoTTest {
  tipo: string;
  t: number;
  gl: number;
  p: number;
  veredicto: Veredicto | null;
  /** Si no es null, el test no está definido y t, gl y p no se enseñan. */
  motivoIndefinido: string | null;
  media1: number;
  /** Solo en muestras independientes. */
  media2: number | null;
}

const VARIANZA_CERO =
  'no hay variabilidad (desviación típica 0), así que el error estándar es 0 y el estadístico t no está definido.';

/** t de una muestra frente a μ₀. Null si hay menos de 2 datos. */
export function tUnaMuestra(datos: number[], mu: number): ResultadoTTest | null {
  const n = datos.length;
  if (n < 2) return null;
  const m = media(datos);
  const ss = sumaCuadrados(datos);
  const base = { tipo: 'Una muestra', media1: m, media2: null };
  if (esCeroRelativo(ss, m * m * n)) {
    return {
      ...base, t: NaN, gl: n - 1, p: NaN, veredicto: null,
      motivoIndefinido: `Todos los valores son iguales: ${VARIANZA_CERO}`,
    };
  }
  const se = Math.sqrt(ss / (n - 1)) / Math.sqrt(n);
  const t = (m - mu) / se;
  const p = pValorBilateralT(t, n - 1);
  return { ...base, t, gl: n - 1, p, veredicto: interpretarP(p), motivoIndefinido: null };
}

/** t de muestras pareadas. Null si faltan datos o los tamaños no coinciden. */
export function tPareadas(antes: number[], despues: number[]): ResultadoTTest | null {
  if (antes.length < 2 || antes.length !== despues.length) return null;
  const d = antes.map((v, i) => v - despues[i]);
  const n = d.length;
  const md = media(d);
  const ss = sumaCuadrados(d);
  const base = { tipo: 'Muestras pareadas', media1: md, media2: null };
  if (esCeroRelativo(ss, md * md * n)) {
    return {
      ...base, t: NaN, gl: n - 1, p: NaN, veredicto: null,
      motivoIndefinido: `Todas las diferencias son iguales: ${VARIANZA_CERO}`,
    };
  }
  const se = Math.sqrt(ss / (n - 1)) / Math.sqrt(n);
  const t = md / se;
  const p = pValorBilateralT(t, n - 1);
  return { ...base, t, gl: n - 1, p, veredicto: interpretarP(p), motivoIndefinido: null };
}

/** t de Welch para dos muestras independientes (no supone varianzas iguales). */
export function tWelch(g1: number[], g2: number[]): ResultadoTTest | null {
  const n1 = g1.length;
  const n2 = g2.length;
  if (n1 < 2 || n2 < 2) return null;
  const m1 = media(g1);
  const m2 = media(g2);
  const ss1 = sumaCuadrados(g1);
  const ss2 = sumaCuadrados(g2);
  const base = { tipo: 'Muestras independientes (Welch)', media1: m1, media2: m2 };
  if (esCeroRelativo(ss1, m1 * m1 * n1) && esCeroRelativo(ss2, m2 * m2 * n2)) {
    return {
      ...base, t: NaN, gl: NaN, p: NaN, veredicto: null,
      motivoIndefinido: `Los dos grupos son constantes: ${VARIANZA_CERO}`,
    };
  }
  const a = ss1 / (n1 - 1) / n1;
  const b = ss2 / (n2 - 1) / n2;
  const t = (m1 - m2) / Math.sqrt(a + b);
  const gl = (a + b) ** 2 / (a * a / (n1 - 1) + b * b / (n2 - 1));
  const p = pValorBilateralT(t, gl);
  return { ...base, t, gl, p, veredicto: interpretarP(p), motivoIndefinido: null };
}

// ─── Correlación ───────────────────────────────────────────────────────────

/**
 * Rangos con RANGO MEDIO en los empates (2008): los valores iguales comparten la media de las
 * posiciones que ocupan. Es la definición de Spearman (y lo que hacen R, SciPy y SPSS); con
 * rangos correlativos el coeficiente cambia y además depende del orden en que se escriben.
 */
export function rangosMedios(xs: number[]): number[] {
  const orden = xs.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const rangos = new Array<number>(xs.length);
  let i = 0;
  while (i < orden.length) {
    let j = i;
    while (j + 1 < orden.length && orden[j + 1].v === orden[i].v) j++;
    const rangoMedio = (i + j) / 2 + 1; // posiciones i…j (base 0) → rangos i+1…j+1
    for (let k = i; k <= j; k++) rangos[orden[k].i] = rangoMedio;
    i = j + 1;
  }
  return rangos;
}

export interface ResultadoCorrelacion {
  tipo: 'Pearson' | 'Spearman';
  r: number;
  t: number;
  gl: number;
  p: number;
  n: number;
  interpretacion: string | null;
  veredicto: Veredicto | null;
  motivoIndefinido: string | null;
}

function pearsonCrudo(x: number[], y: number[]): { r: number; motivo: string | null } {
  const mx = media(x);
  const my = media(y);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < x.length; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  const xConst = esCeroRelativo(sxx, mx * mx * x.length);
  const yConst = esCeroRelativo(syy, my * my * y.length);
  if (xConst || yConst) {
    const cual = xConst && yConst ? 'X e Y son constantes' : xConst ? 'X es constante' : 'Y es constante';
    return {
      r: NaN,
      motivo: `r no está definido: ${cual}. Sin variación en una variable no hay relación que medir (0/0).`,
    };
  }
  // Acotado a [−1, 1]: el redondeo puede dar 1,0000000000000002 y √(1 − r²) sería NaN.
  return { r: Math.max(-1, Math.min(1, sxy / Math.sqrt(sxx * syy))), motivo: null };
}

/** Pearson (o Spearman, que es Pearson sobre rangos medios) con su t y p (gl = n − 2). */
export function correlacion(
  x: number[],
  y: number[],
  tipo: 'Pearson' | 'Spearman'
): ResultadoCorrelacion | null {
  if (x.length < 3 || x.length !== y.length) return null;
  const n = x.length;
  const [a, b] = tipo === 'Spearman' ? [rangosMedios(x), rangosMedios(y)] : [x, y];
  const { r, motivo } = pearsonCrudo(a, b);
  if (motivo) {
    return {
      tipo, r: NaN, t: NaN, gl: n - 2, p: NaN, n,
      interpretacion: null, veredicto: null, motivoIndefinido: motivo,
    };
  }
  const uno = 1 - r * r;
  const t = uno <= 1e-15 ? (r > 0 ? Infinity : -Infinity) : r * Math.sqrt((n - 2) / uno);
  const p = pValorBilateralT(t, n - 2);
  return {
    tipo, r, t, gl: n - 2, p, n,
    interpretacion: interpretarCorrelacion(r),
    veredicto: interpretarP(p),
    motivoIndefinido: null,
  };
}

// ─── Regresión lineal simple ───────────────────────────────────────────────

export interface ResultadoRegresion {
  pendiente: number;
  ordenada: number;
  r: number;
  r2: number;
  errorEstandar: number;
  tPendiente: number;
  pPendiente: number;
  f: number;
  pF: number;
  n: number;
  veredicto: Veredicto | null;
  motivoIndefinido: string | null;
}

export function regresion(x: number[], y: number[]): ResultadoRegresion | null {
  if (x.length < 3 || x.length !== y.length) return null;
  const n = x.length;
  const mx = media(x);
  const my = media(y);
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
  }
  const ssTot = sumaCuadrados(y);
  const vacio = {
    pendiente: NaN, ordenada: NaN, r: NaN, r2: NaN, errorEstandar: NaN,
    tPendiente: NaN, pPendiente: NaN, f: NaN, pF: NaN, n, veredicto: null,
  };
  if (esCeroRelativo(sxx, mx * mx * n)) {
    return {
      ...vacio,
      motivoIndefinido:
        'La recta no está definida: X es constante (todas las x son iguales), así que la pendiente sería un cociente entre 0.',
    };
  }
  const pendiente = sxy / sxx;
  const ordenada = my - pendiente * mx;
  if (esCeroRelativo(ssTot, my * my * n)) {
    return {
      ...vacio, pendiente, ordenada,
      motivoIndefinido:
        'Y es constante: la recta es horizontal, pero no hay variabilidad que explicar, así que R², t y F no están definidos (0/0).',
    };
  }
  let ssRes = 0;
  for (let i = 0; i < n; i++) ssRes += (y[i] - (ordenada + pendiente * x[i])) ** 2;
  // Ajuste perfecto: los residuos son ruido de redondeo, no información.
  if (ssRes <= 1e-12 * ssTot) ssRes = 0;
  const r2 = 1 - ssRes / ssTot;
  const r = Math.sqrt(r2) * (pendiente >= 0 ? 1 : -1);
  const errorEstandar = Math.sqrt(ssRes / (n - 2));
  const sePendiente = errorEstandar / Math.sqrt(sxx);
  const tPendiente = ssRes === 0 ? (pendiente > 0 ? Infinity : -Infinity) : pendiente / sePendiente;
  const pPendiente = pValorBilateralT(tPendiente, n - 2);
  const f = ssRes === 0 ? Infinity : (ssTot - ssRes) / (ssRes / (n - 2));
  const pF = ssRes === 0 ? 0 : Math.max(0, 1 - jStat.centralF.cdf(f, 1, n - 2));
  return {
    pendiente, ordenada, r, r2, errorEstandar, tPendiente, pPendiente, f, pF, n,
    veredicto: interpretarP(pPendiente),
    motivoIndefinido: null,
  };
}

// ─── Chi-cuadrado ──────────────────────────────────────────────────────────

export interface CeldaChi {
  etiqueta: string;
  observada: number;
  esperada: number;
  contribucion: number;
}

export interface ValidezChi {
  fiable: boolean;
  /** Cuántas esperadas quedan por debajo de 5 y de 1. */
  menoresDe5: number;
  menoresDe1: number;
  total: number;
  minima: number;
}

export interface ResultadoChi {
  modo: 'ajuste' | 'independencia';
  chi2: number;
  gl: number;
  /** NaN cuando la aproximación no es fiable: no se publica un p que no es el de verdad. */
  p: number;
  veredicto: Veredicto | null;
  celdas: CeldaChi[];
  validez: ValidezChi;
  /** Avisos que no invalidan el cálculo (esperadas escaladas, uniforme supuesta…). */
  avisos: string[];
  /** Solo en tablas 2×2: χ² con la corrección de continuidad de Yates y su p. */
  yates: { chi2: number; p: number } | null;
  filas: number;
  columnas: number;
}

export interface ErrorChi {
  error: string;
}

/**
 * Validez de la aproximación χ² (Cochran, 1954): ninguna esperada < 1 y no más del 20 % por
 * debajo de 5. Con 1 grado de libertad (dos categorías o tabla 2×2) se exige 5 en todas, que es
 * la versión que enseña la regla de «≥ 5 en cada celda». Patrón del hallazgo 1696 de
 * simulador-genetica, reimplementado aquí (las apps no se importan entre sí).
 */
export function validezCochran(esperadas: number[], gl: number): ValidezChi {
  const menoresDe5 = esperadas.filter((e) => e < 5).length;
  const menoresDe1 = esperadas.filter((e) => e < 1).length;
  const fiable =
    gl === 1 ? menoresDe5 === 0 : menoresDe1 === 0 && menoresDe5 <= 0.2 * esperadas.length;
  return { fiable, menoresDe5, menoresDe1, total: esperadas.length, minima: Math.min(...esperadas) };
}

function cerrarChi(
  modo: 'ajuste' | 'independencia',
  celdas: CeldaChi[],
  gl: number,
  avisos: string[],
  filas: number,
  columnas: number,
  yates: { chi2: number; p: number } | null
): ResultadoChi {
  const chi2 = suma(celdas.map((c) => c.contribucion));
  const validez = validezCochran(celdas.map((c) => c.esperada), gl);
  const p = validez.fiable ? pValorChiCuadrado(chi2, gl) : NaN;
  return {
    modo, chi2, gl, p,
    veredicto: validez.fiable ? interpretarP(p) : null,
    celdas, validez, avisos,
    yates: validez.fiable ? yates : null,
    filas, columnas,
  };
}

const esCasiIgual = (a: number, b: number): boolean =>
  Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b), 1);

/**
 * Bondad de ajuste: ¿se ajustan las observadas a una distribución esperada (o a la uniforme)?
 * gl = k − 1. Las esperadas pueden escribirse como frecuencias o como proporciones: si su suma
 * no coincide con la de las observadas, se ESCALAN al total observado y se dice (2013).
 */
export function chiBondadAjuste(observadas: number[], esperadasEscritas: number[]): ResultadoChi | ErrorChi | null {
  const k = observadas.length;
  if (k < 2) return null;
  if (observadas.some((o) => o < 0)) {
    return { error: 'Las frecuencias observadas no pueden ser negativas: son recuentos.' };
  }
  const totalObs = suma(observadas);
  if (totalObs <= 0) return { error: 'Las frecuencias observadas suman 0: no hay nada que contrastar.' };

  const avisos: string[] = [];
  let esperadas: number[];
  if (esperadasEscritas.length === 0) {
    esperadas = observadas.map(() => totalObs / k);
    avisos.push('Sin esperadas: se contrasta contra la distribución uniforme (el total repartido a partes iguales).');
  } else {
    if (esperadasEscritas.length !== k) {
      return {
        error: `Has escrito ${esperadasEscritas.length} ${esperadasEscritas.length === 1 ? 'esperada' : 'esperadas'} para ${k} observadas: tiene que haber una por categoría (o ninguna, para la uniforme).`,
      };
    }
    if (esperadasEscritas.some((e) => e <= 0)) {
      return { error: 'Las frecuencias esperadas tienen que ser mayores que 0.' };
    }
    const totalEsp = suma(esperadasEscritas);
    if (esCasiIgual(totalEsp, totalObs)) {
      esperadas = esperadasEscritas;
    } else {
      esperadas = esperadasEscritas.map((e) => (e * totalObs) / totalEsp);
      avisos.push(
        `Las esperadas suman ${totalEsp.toLocaleString('es-ES', { maximumFractionDigits: 4 })} y las observadas ${totalObs.toLocaleString('es-ES', { maximumFractionDigits: 4 })}: se han tomado como proporciones y escalado al total observado.`
      );
    }
  }
  const celdas = observadas.map((o, i) => ({
    etiqueta: String(i + 1),
    observada: o,
    esperada: esperadas[i],
    contribucion: (o - esperadas[i]) ** 2 / esperadas[i],
  }));
  return cerrarChi('ajuste', celdas, k - 1, avisos, 1, k, null);
}

/**
 * Independencia en una tabla de contingencia r × c: esperada = total de fila · total de columna
 * / total general; gl = (r − 1)(c − 1). Sin corrección de continuidad; en 2×2 se da además la
 * de Yates, que es la que R (`chisq.test`) y SciPy (`chi2_contingency`) aplican por defecto.
 */
export function chiIndependencia(tabla: number[][]): ResultadoChi | ErrorChi | null {
  const filas = tabla.length;
  if (filas === 0) return null;
  if (filas < 2) return { error: 'Una tabla de contingencia necesita al menos 2 filas (una por línea).' };
  const columnas = tabla[0].length;
  if (tabla.some((f) => f.length !== columnas)) {
    return {
      error: `Las filas no tienen el mismo número de valores (${tabla.map((f) => f.length).join(', ')}): cada fila es una categoría y cada columna otra.`,
    };
  }
  if (columnas < 2) return { error: 'Una tabla de contingencia necesita al menos 2 columnas.' };
  if (tabla.some((f) => f.some((v) => v < 0))) {
    return { error: 'Las frecuencias no pueden ser negativas: son recuentos.' };
  }
  const totFila = tabla.map(suma);
  const totCol = Array.from({ length: columnas }, (_, j) => suma(tabla.map((f) => f[j])));
  const total = suma(totFila);
  const filaVacia = totFila.findIndex((t) => t <= 0);
  if (filaVacia >= 0) return { error: `La fila ${filaVacia + 1} suma 0: sus esperadas serían 0. Quítala.` };
  const colVacia = totCol.findIndex((t) => t <= 0);
  if (colVacia >= 0) return { error: `La columna ${colVacia + 1} suma 0: sus esperadas serían 0. Quítala.` };

  const celdas: CeldaChi[] = [];
  let chi2Yates = 0;
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      const o = tabla[i][j];
      const e = (totFila[i] * totCol[j]) / total;
      celdas.push({ etiqueta: `F${i + 1}·C${j + 1}`, observada: o, esperada: e, contribucion: (o - e) ** 2 / e });
      chi2Yates += Math.max(0, Math.abs(o - e) - 0.5) ** 2 / e;
    }
  }
  const gl = (filas - 1) * (columnas - 1);
  const yates = filas === 2 && columnas === 2 ? { chi2: chi2Yates, p: pValorChiCuadrado(chi2Yates, 1) } : null;
  return cerrarChi('independencia', celdas, gl, [], filas, columnas, yates);
}

// ─── Intervalo de confianza ────────────────────────────────────────────────

export interface ResultadoIC {
  media: number;
  desviacion: number;
  errorEstandar: number;
  n: number;
  nivel: number;
  tCritico: number;
  margen: number;
  inferior: number;
  superior: number;
  inferiorZ: number;
  superiorZ: number;
}

export function intervaloConfianza(datos: number[], nivel: number): ResultadoIC | null {
  const n = datos.length;
  if (n < 2 || !(nivel > 0 && nivel < 1)) return null;
  const m = media(datos);
  const s = Math.sqrt(sumaCuadrados(datos) / (n - 1));
  const se = s / Math.sqrt(n);
  const alfa = 1 - nivel;
  const tCritico = jStat.studentt.inv(1 - alfa / 2, n - 1);
  const zCritico = jStat.normal.inv(1 - alfa / 2, 0, 1);
  const margen = tCritico * se;
  return {
    media: m, desviacion: s, errorEstandar: se, n, nivel, tCritico, margen,
    inferior: m - margen, superior: m + margen,
    inferiorZ: m - zCritico * se, superiorZ: m + zCritico * se,
  };
}

// ─── Normalidad (Jarque-Bera) ──────────────────────────────────────────────

export interface ResultadoNormalidad {
  n: number;
  media: number;
  desviacion: number;
  minimo: number;
  maximo: number;
  q1: number;
  q2: number;
  q3: number;
  iqr: number;
  atipicos: number[];
  /** Asimetría de momentos, S = m3 / m2^1,5 (0 en la normal). */
  asimetria: number;
  /** Curtosis de momentos, K = m4 / m2² (3 en la normal; el EXCESO es K − 3). */
  curtosis: number;
  jb: number;
  p: number;
  /** null si JB no está definido. */
  noRechaza: boolean | null;
  lecturaAsimetria: string | null;
  lecturaCurtosis: string | null;
  motivoIndefinido: string | null;
}

/**
 * Jarque-Bera: JB = n/6 · (S² + (K − 3)²/4), con S y K los coeficientes de MOMENTOS (m2, m3,
 * m4 con divisor n), y p = P(χ²₂ > JB) = e^(−JB/2).
 *
 * ⚠️ 26/09/2026 (hallazgo 2007, ALTO) — la app tomaba K de `jStat.kurtosis`, que ya devuelve el
 * EXCESO (stanMoment(arr, 4) − 3), y le volvía a restar 3: usaba (K − 6)² y rechazaba la
 * normalidad de toda muestra normal con n ≥ 16. Por eso los momentos se calculan aquí.
 */
export function normalidad(datos: number[]): ResultadoNormalidad | null {
  const n = datos.length;
  if (n < 3) return null;
  const m = media(datos);
  const orden = [...datos].sort((a, b) => a - b);
  let m2 = 0;
  let m3 = 0;
  let m4 = 0;
  for (const x of datos) {
    const d = x - m;
    m2 += d * d;
    m3 += d * d * d;
    m4 += d * d * d * d;
  }
  m2 /= n;
  m3 /= n;
  m4 /= n;
  const q1 = jStat.percentile(datos, 0.25);
  const q2 = jStat.percentile(datos, 0.5);
  const q3 = jStat.percentile(datos, 0.75);
  const iqr = q3 - q1;
  const atipicos = datos.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);
  const comun = {
    n, media: m, desviacion: Math.sqrt((m2 * n) / (n - 1)),
    minimo: orden[0], maximo: orden[n - 1], q1, q2, q3, iqr, atipicos,
  };
  if (esCeroRelativo(m2 * n, m * m * n)) {
    return {
      ...comun, asimetria: NaN, curtosis: NaN, jb: NaN, p: NaN, noRechaza: null,
      lecturaAsimetria: null, lecturaCurtosis: null,
      motivoIndefinido:
        'Todos los valores son iguales: con varianza 0 la asimetría y la curtosis no están definidas (0/0), y el test de Jarque-Bera tampoco.',
    };
  }
  const asimetria = m3 / m2 ** 1.5;
  const curtosis = m4 / (m2 * m2);
  const jb = (n / 6) * (asimetria ** 2 + (curtosis - 3) ** 2 / 4);
  const p = Math.exp(-jb / 2);

  let lecturaAsimetria = 'Distribución aproximadamente simétrica';
  if (asimetria < -0.5) lecturaAsimetria = 'Asimetría negativa (cola izquierda)';
  else if (asimetria > 0.5) lecturaAsimetria = 'Asimetría positiva (cola derecha)';

  let lecturaCurtosis = 'Curtosis similar a la normal (mesocúrtica)';
  if (curtosis < 2.5) lecturaCurtosis = 'Curtosis baja (platicúrtica): colas más ligeras que la normal';
  else if (curtosis > 3.5) lecturaCurtosis = 'Curtosis alta (leptocúrtica): colas más pesadas que la normal';

  return {
    ...comun, asimetria, curtosis, jb, p,
    noRechaza: p >= ALFA,
    lecturaAsimetria, lecturaCurtosis,
    motivoIndefinido: null,
  };
}
