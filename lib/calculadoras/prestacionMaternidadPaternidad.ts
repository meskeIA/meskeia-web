/**
 * Calculadora de Prestación por Maternidad/Paternidad — lógica pura
 * Usada por: MCP server (calcular_prestacion_maternidad_paternidad)
 *
 * Calcula la prestación económica por nacimiento, adopción o acogimiento
 * (coloquialmente maternidad/paternidad), igual para ambos progenitores
 * desde la equiparación de enero de 2021 (RDL 6/2019).
 *
 * Marco normativo:
 *   - LGSS arts. 177-182 (prestación por nacimiento/cuidado menor)
 *   - RDL 6/2019: equiparación de permisos madre/padre
 *   - Desde enero 2021: ambos progenitores tienen 16 semanas
 *
 * Duración:
 *   - 16 semanas para cada progenitor (112 días naturales)
 *   - Parto múltiple: +2 semanas por cada hijo a partir del segundo
 *   - Discapacidad del menor ≥33%: +2 semanas adicionales
 *   - Primeras 6 semanas: obligatorias e ininterrumpidas justo después del parto
 *   - Las 10 semanas restantes: pueden disfrutarse de manera flexible hasta
 *     que el menor cumpla 12 meses
 *
 * Cuantía:
 *   - 100% de la base reguladora diaria (no hay espera ni reducción)
 *   - Base reguladora diaria = base cotización mes anterior / días del mes
 *   - Máximo: base máxima de cotización 2025 = 4.909,50 €/mes
 *   - No hay mínimo propio (si no se cumple período de carencia, no se genera)
 *
 * Período de carencia (LGSS art. 178):
 *   - < 21 años en la fecha del parto: sin carencia mínima
 *   - 21-26 años: 90 días cotizados en los últimos 7 años, o 180 días totales
 *   - ≥ 26 años: 180 días cotizados en los últimos 7 años, o 360 días totales
 *   - Trabajadores a tiempo parcial: cómputo proporcional
 *
 * Incompatibilidades:
 *   - Compatible con lactancia y reducción de jornada (simultáneamente no)
 *   - Incompatible con IT, desempleo (salvo excepciones) durante el mismo período
 *
 * Fuente: LGSS arts. 177-182 + RDL 6/2019 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_sueldo_neto, calcular_baja_medica, calcular_complemento_it_empresa
 */

// ─── Constantes 2025 ────────────────────────────────────────────────────────

const SEMANAS_PRESTACION_BASE = 16;
const DIAS_SEMANA = 7;
const DIAS_BASE_PRESTACION = SEMANAS_PRESTACION_BASE * DIAS_SEMANA; // 112 días
const SEMANAS_OBLIGATORIAS = 6; // primeras 6 semanas, ininterrumpidas
const DIAS_OBLIGATORIOS = SEMANAS_OBLIGATORIAS * DIAS_SEMANA; // 42 días
const SEMANAS_ADICIONALES_MULTIPLE = 2; // por cada hijo adicional en parto múltiple
const BASE_MAXIMA_MENSUAL_2025 = 4909.50; // €/mes
const BASE_MAXIMA_DIARIA_2025 = BASE_MAXIMA_MENSUAL_2025 / 30;

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type EdadProgenitor = 'menor_21' | 'entre_21_y_26' | 'mayor_26';
export type SituacionLaboralMP = 'trabajador_cuenta_ajena' | 'autonomo' | 'desempleado_sin_derecho';

export interface ParametrosPrestacionMP {
  /** Base de cotización mensual del mes anterior al inicio de la prestación (€) */
  baseCotizacionMensual: number;
  /** Número de días del mes de la base de cotización (para el divisor diario) */
  diasMesBaseCotizacion?: number;
  /** Edad del progenitor para determinar el período de carencia */
  edadProgenitor: EdadProgenitor;
  /** Número total de hijos en el parto (1 para parto simple, 2+ para múltiple) */
  numerosHijos?: number;
  /** ¿Alguno de los hijos tiene discapacidad reconocida ≥33%? */
  hijoConDiscapacidad?: boolean;
  /** ¿Cumple el período de carencia? (si no se indica, se asume que sí) */
  cumpleCarencia?: boolean;
  /** Situación laboral del progenitor */
  situacionLaboral?: SituacionLaboralMP;
}

export interface ResultadoPrestacionMP {
  /** Base reguladora diaria (€) */
  baseReguladoraDiaria: number;
  /** Base reguladora mensual equivalente (€) */
  baseReguladoraMensual: number;
  /** Duración total de la prestación (días) para este progenitor */
  duracionTotalDias: number;
  /** Semanas base (16) */
  semanasBase: number;
  /** Semanas adicionales por parto múltiple */
  semanasAdicionalMultiple: number;
  /** Semanas adicionales por discapacidad del menor */
  semanasAdicionalDiscapacidad: number;
  /** Días obligatorios tras el parto (primeras 6 semanas) */
  diasObligatorios: number;
  /** Días de disfrute flexible (hasta los 12 meses del menor) */
  diasFlexibles: number;
  /** ¿Cumple el período de carencia? */
  cumpleCarencia: boolean;
  /** Cuantía diaria de la prestación (€) */
  cuantiaDiaria: number;
  /** **Cuantía mensual de la prestación (€)** */
  cuantiaMensual: number;
  /** **Cuantía total de la prestación para todo el período (€)** */
  cuotaTotalPrestacion: number;
  /** ¿Se aplica el límite de la base máxima? */
  limitadaPorBaseMaxima: boolean;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularPrestacionMaternidadPaternidad(
  p: ParametrosPrestacionMP
): ResultadoPrestacionMP {
  if (p.baseCotizacionMensual <= 0) throw new Error('La base de cotización mensual debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const diasMes = p.diasMesBaseCotizacion ?? 30;
  const baseReguladoraDiaria = r(Math.min(p.baseCotizacionMensual / diasMes, BASE_MAXIMA_DIARIA_2025));
  const limitadaPorBaseMaxima = (p.baseCotizacionMensual / diasMes) > BASE_MAXIMA_DIARIA_2025;
  const baseReguladoraMensual = r(baseReguladoraDiaria * 30);

  // ── Duración ──────────────────────────────────────────────────────────────
  const numHijos = p.numerosHijos ?? 1;
  const hijosAdicionales = Math.max(0, numHijos - 1);
  const semanasAdicionalMultiple = hijosAdicionales * SEMANAS_ADICIONALES_MULTIPLE;
  const semanasAdicionalDiscapacidad = p.hijoConDiscapacidad ? SEMANAS_ADICIONALES_MULTIPLE : 0;

  const semanasTotal = SEMANAS_PRESTACION_BASE + semanasAdicionalMultiple + semanasAdicionalDiscapacidad;
  const duracionTotalDias = semanasTotal * DIAS_SEMANA;
  const diasObligatorios = Math.min(DIAS_OBLIGATORIOS, duracionTotalDias);
  const diasFlexibles = duracionTotalDias - diasObligatorios;

  // ── Carencia ──────────────────────────────────────────────────────────────
  const cumpleCarencia = p.cumpleCarencia ?? true;

  let periodoCarenciaRequerido = '';
  if (p.edadProgenitor === 'menor_21') {
    periodoCarenciaRequerido = 'Sin carencia mínima requerida (menos de 21 años en la fecha del parto)';
  } else if (p.edadProgenitor === 'entre_21_y_26') {
    periodoCarenciaRequerido = '90 días cotizados en los últimos 7 años, o 180 días totales a lo largo de la vida laboral';
  } else {
    periodoCarenciaRequerido = '180 días cotizados en los últimos 7 años, o 360 días totales a lo largo de la vida laboral';
  }

  // ── Cuantía ───────────────────────────────────────────────────────────────
  const cuantiaDiaria = cumpleCarencia ? baseReguladoraDiaria : 0;
  const cuantiaMensual = r(cuantiaDiaria * 30);
  const cuotaTotalPrestacion = r(cuantiaDiaria * duracionTotalDias);

  // ── Advertencias ──────────────────────────────────────────────────────────
  advertencias.push(`Período de carencia requerido para este progenitor (${p.edadProgenitor === 'menor_21' ? '<21 años' : p.edadProgenitor === 'entre_21_y_26' ? '21-26 años' : '≥26 años'}): ${periodoCarenciaRequerido}.`);
  advertencias.push(`Las primeras ${SEMANAS_OBLIGATORIAS} semanas (${diasObligatorios} días) son OBLIGATORIAS e ininterrumpidas inmediatamente tras el parto/adopción. Las ${semanasTotal - SEMANAS_OBLIGATORIAS} semanas restantes (${diasFlexibles} días) pueden disfrutarse de forma flexible hasta que el menor cumpla 12 meses.`);
  advertencias.push('La prestación tributa en IRPF como rendimiento del trabajo (está sujeta a retención). A diferencia de 2018 (cuando estaba exenta), desde 2019 solo está exenta la prestación de Seguridad Social por maternidad/paternidad reconocida por el TSJUE, que fue incorporada en la Ley de PGE 2018 — la exención aún genera dudas en AEAT para algunos supuestos. Consulte con asesor fiscal.');
  if (p.situacionLaboral === 'autonomo') {
    advertencias.push('Autónomos: la base reguladora se calcula igual (base cotización mes anterior / días del mes). El RETA cotiza por contingencias comunes, por lo que el autónomo tiene derecho a esta prestación si cumple carencia y está al corriente de pago.');
  }
  if (numHijos >= 2) {
    advertencias.push(`Parto múltiple (${numHijos} hijos): se añaden ${semanasAdicionalMultiple} semanas adicionales (${semanasAdicionalMultiple * DIAS_SEMANA} días) por los ${hijosAdicionales} hijos adicionales.`);
  }
  if (limitadaPorBaseMaxima) {
    advertencias.push(`La base de cotización supera la base máxima de 2025 (${BASE_MAXIMA_MENSUAL_2025.toLocaleString('es-ES')} €/mes). La cuantía diaria se limita a ${BASE_MAXIMA_DIARIA_2025.toFixed(2)} €/día.`);
  }

  return {
    baseReguladoraDiaria,
    baseReguladoraMensual,
    duracionTotalDias,
    semanasBase: SEMANAS_PRESTACION_BASE,
    semanasAdicionalMultiple,
    semanasAdicionalDiscapacidad,
    diasObligatorios,
    diasFlexibles,
    cumpleCarencia,
    cuantiaDiaria,
    cuantiaMensual,
    cuotaTotalPrestacion,
    limitadaPorBaseMaxima,
    advertencias,
    fuenteDatos: 'LGSS arts. 177-182 + RDL 6/2019 (equiparación 2021) — vigente 2025',
  };
}
