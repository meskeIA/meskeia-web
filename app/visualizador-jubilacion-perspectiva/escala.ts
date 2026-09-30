/**
 * Cifras normativas del visualizador, DERIVADAS de data/fiscal/pensiones.ts y del motor
 * compartido lib/calculadoras/pensionPublica.ts. Aquí no se teclea ningún porcentaje, plazo
 * ni coeficiente: lo usan page.tsx (textos y gráfico) y metadata.ts (FAQPage del JSON-LD),
 * para que la página y lo que leen las IA digan lo mismo que el módulo.
 *
 * Hallazgos 2229-2234 del Inspector (26/09/2026): la app llevaba su propia copia de la
 * escala (con el tramo del 0,21 % hasta el mes 276, la forma del hallazgo 1093) y cifras
 * escritas a mano que no cuadraban con data/fiscal.
 */

import {
  COTIZACION_MINIMA,
  getEscalaPorcentajePension,
  getEdadJubilacion,
  getCoeficienteAnticipada,
  COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025,
  COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025,
  REQUISITOS_ANTICIPADA_INVOLUNTARIA,
  REQUISITOS_ANTICIPADA_VOLUNTARIA,
} from '@/data/fiscal';
import { calcularPorcentajePension } from '@/lib/calculadoras/pensionPublica';
import { formatNumber } from '@/lib/formatters';

/**
 * La app modela la jubilación DEFINITIVA —la edad de la fila 2027 de la tabla—, así que la
 * escala del porcentaje también es la de 2027, la del art. 210.1.b) LGSS. Hasta el
 * 30/09/2026 combinaba la edad de 2027 con la escala de 2026 (semilla S0163).
 */
export const ANIO_ESCALA = 2027;
const ESCALA = getEscalaPorcentajePension(ANIO_ESCALA);

/** Porcentaje de la base reguladora con la escala definitiva (motor compartido). */
export function porcentajePension(meses: number): number {
  return calcularPorcentajePension(meses, ANIO_ESCALA);
}

/** «15 %» con espacio duro (U+00A0), regla del CLAUDE.md global §2. Recibe el porcentaje, no la fracción. */
export function pct(valor: number, decimales: number): string {
  return `${formatNumber(valor, decimales)}\u00A0%`;
}

/** Porcentaje sin ceros de relleno: 1,5 → «1,5 %», 2 → «2 %», 1,875 → «1,875 %». */
export function pctCompacto(valor: number): string {
  return `${valor.toLocaleString('es-ES', { maximumFractionDigits: 3 })}\u00A0%`;
}

/** 438 → «36 años y 6 meses» · 12 → «1 año» · 6 → «6 meses» · 13 → «1 año y 1 mes». */
export function aniosYMeses(mesesTotales: number): string {
  const anios = Math.floor(mesesTotales / 12);
  const meses = mesesTotales % 12;
  const a = anios === 1 ? '1 año' : `${anios} años`;
  const m = meses === 1 ? '1 mes' : `${meses} meses`;
  if (anios === 0) return m;
  if (meses === 0) return a;
  return `${a} y ${m}`;
}

// ─── Escala del porcentaje (DT 9.ª LGSS) ──────────────────────────────────────

export const MESES_ACCESO = COTIZACION_MINIMA.mesesMinimosAcceso; // 180
export const ANIOS_ACCESO = COTIZACION_MINIMA.anosMinimosAcceso; // 15
export const MESES_PARA_CIEN = ESCALA.mesesParaCien; // 444
export const PCT_ACCESO = porcentajePension(MESES_ACCESO); // 50

/** Los dos tramos crecientes de la escala, con lo que suma un año completo en cada uno. */
export const TRAMOS_CRECIENTES = ESCALA.tramos
  .filter((t) => t.incrementoPorMes > 0)
  .map((t) => ({
    desde: t.mesesDesde,
    hasta: t.mesesHasta,
    porMes: t.incrementoPorMes,
    porAnio: Math.round(t.incrementoPorMes * 12 * 100) / 100,
  }));

// ─── Edad de jubilación (fila 2027 de TABLA_EDAD_JUBILACION, la definitiva) ───

export const FILA_EDAD_DEFINITIVA = getEdadJubilacion(2027);
/** 67: la app asume la edad ordinaria definitiva, sin los meses del calendario transitorio. */
export const EDAD_ORDINARIA = FILA_EDAD_DEFINITIVA.edadSinCotizacion.anios;
export const EDAD_CON_CARRERA_LARGA = 65;
/** 38 años y 6 meses → 462 meses. */
export const MESES_PARA_65 =
  FILA_EDAD_DEFINITIVA.cotizacionPara65.anios * 12 + FILA_EDAD_DEFINITIVA.cotizacionPara65.meses;

// ─── Jubilación anticipada ────────────────────────────────────────────────────

export const ANIOS_ANTICIPO_VOLUNTARIA = REQUISITOS_ANTICIPADA_VOLUNTARIA.maxMesesAnticipacion / 12; // 2
export const ANIOS_ANTICIPO_INVOLUNTARIA = REQUISITOS_ANTICIPADA_INVOLUNTARIA.maxMesesAnticipacion / 12; // 4

const todosLosCoeficientes = [
  ...COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025,
  ...COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025,
].map((c) => c.reduccionPorTrimestre);
export const COEF_TRIMESTRE_MIN = Math.min(...todosLosCoeficientes); // 1,5
export const COEF_TRIMESTRE_MAX = Math.max(...todosLosCoeficientes); // 2

/**
 * Ejemplo del texto educativo: jubilarse a los 63 con 38 años cotizados.
 * 38 años < 38 años y 6 meses → edad ordinaria 67 (fila 2027) → 48 meses de anticipo.
 * 48 > 24 (máximo de la voluntaria) y ≤ 48 (máximo de la involuntaria): solo cabe la
 * involuntaria, y con 38 años el coeficiente es 1,875 % por trimestre → 16 × 1,875 = 30 %.
 */
export const EJEMPLO_ANTICIPADA = (() => {
  const edad = 63;
  const aniosCotizados = 38;
  const edadOrdinaria = aniosCotizados * 12 >= MESES_PARA_65 ? EDAD_CON_CARRERA_LARGA : EDAD_ORDINARIA;
  const mesesAnticipo = (edadOrdinaria - edad) * 12;
  const cabeVoluntaria =
    mesesAnticipo <= REQUISITOS_ANTICIPADA_VOLUNTARIA.maxMesesAnticipacion &&
    aniosCotizados >= REQUISITOS_ANTICIPADA_VOLUNTARIA.anosMinimoCotizados;
  const cabeInvoluntaria =
    mesesAnticipo <= REQUISITOS_ANTICIPADA_INVOLUNTARIA.maxMesesAnticipacion &&
    aniosCotizados >= REQUISITOS_ANTICIPADA_INVOLUNTARIA.anosMinimoCotizados;
  const trimestres = Math.ceil(mesesAnticipo / 3);
  const coeficiente = getCoeficienteAnticipada(aniosCotizados, COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025);
  const reduccion = Math.round(trimestres * coeficiente * 1000) / 1000;
  return { edad, aniosCotizados, edadOrdinaria, mesesAnticipo, cabeVoluntaria, cabeInvoluntaria, trimestres, coeficiente, reduccion };
})();

// ─── Ejemplos de carrera ──────────────────────────────────────────────────────

/**
 * «más de los» / «justo los» / «menos de los»: cómo queda una carrera frente a los meses que
 * dan el 100 %. Con la escala de 2027, empezar a los 30 da exactamente 37 años = 444 meses,
 * y el «más de los» fijo de antes escribía «37 años, más de los 37 años» (S0163).
 */
export function frenteAlCien(meses: number): string {
  if (meses > MESES_PARA_CIEN) return 'más de los';
  if (meses === MESES_PARA_CIEN) return 'justo los';
  return 'menos de los';
}

/** Porcentaje con el que llega a la edad ordinaria quien empieza a cotizar a `edadInicio`. */
export function ejemploInicio(edadInicio: number): { anios: number; meses: number; porcentaje: number } {
  const anios = Math.max(0, EDAD_ORDINARIA - edadInicio);
  const meses = anios * 12;
  return { anios, meses, porcentaje: porcentajePension(meses) };
}
