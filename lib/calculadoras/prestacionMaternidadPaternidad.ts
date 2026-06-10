/**
 * Calculadora de Prestación por Maternidad/Paternidad — lógica pura
 * Usada por: MCP server (calcular_prestacion_maternidad_paternidad)
 *
 * Calcula la prestación económica por nacimiento, adopción o acogimiento
 * (coloquialmente maternidad/paternidad), igual para ambos progenitores
 * desde la equiparación de enero de 2021 (RDL 6/2019) y ampliada por el
 * RDL 9/2025.
 *
 * Marco normativo:
 *   - LGSS arts. 177-182 (prestación por nacimiento/cuidado menor)
 *   - RDL 6/2019: equiparación de permisos madre/padre (16 semanas desde 2021)
 *   - RDL 9/2025 (en vigor 31-jul-2025, ratificado 09-sep-2025, BOE-A-2025-15741):
 *     amplía la duración a 19 semanas (32 en familias monoparentales) y
 *     redefine el reparto de semanas
 *
 * Duración (RDL 9/2025):
 *   - Familia biparental: 19 semanas por progenitor
 *   - Familia monoparental: 32 semanas (un único progenitor)
 *   - Reparto biparental: 6 semanas obligatorias e ininterrumpidas tras el
 *     nacimiento + 11 semanas flexibles hasta que el menor cumpla 12 meses +
 *     2 semanas de cuidado prolongado, distribuibles hasta que el menor
 *     cumpla 8 años
 *   - Reparto monoparental: 6 semanas obligatorias + 22 semanas flexibles
 *     hasta los 12 meses + 4 semanas de cuidado prolongado hasta los 8 años
 *   - Discapacidad del menor ≥33%: +2 semanas adicionales (fijo, igual para
 *     ambos progenitores)
 *   - Parto múltiple: +1 semana adicional por cada hijo a partir del segundo
 *   - Nacimiento prematuro u hospitalización del recién nacido tras el parto:
 *     el permiso se amplía un día por cada día de hospitalización, con un
 *     máximo de 13 semanas adicionales (no incluido en este cálculo, ver
 *     advertencias)
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
 * Fuente: LGSS arts. 177-182 + RDL 6/2019 (equiparación 2021) + RDL 9/2025
 *         (ampliación a 19/32 semanas, en vigor 31-jul-2025) — vigente 2026
 * Verificado: 2026-06-10
 *
 * Encadenable con: calcular_sueldo_neto, calcular_baja_medica, calcular_complemento_it_empresa
 */

// ─── Constantes ─────────────────────────────────────────────────────────────

const DIAS_SEMANA = 7;
const SEMANAS_BASE_BIPARENTAL = 19;
const SEMANAS_BASE_MONOPARENTAL = 32;
const SEMANAS_OBLIGATORIAS = 6; // primeras 6 semanas, ininterrumpidas
const DIAS_OBLIGATORIOS = SEMANAS_OBLIGATORIAS * DIAS_SEMANA; // 42 días
const SEMANAS_FLEXIBLES_HASTA_12_MESES_BIPARENTAL = 11;
const SEMANAS_FLEXIBLES_HASTA_12_MESES_MONOPARENTAL = 22;
const SEMANAS_CUIDADO_PROLONGADO_BIPARENTAL = 2; // distribuibles hasta los 8 años
const SEMANAS_CUIDADO_PROLONGADO_MONOPARENTAL = 4;
const SEMANAS_ADICIONAL_MULTIPLE_POR_HIJO = 1; // por cada hijo a partir del segundo
const SEMANAS_ADICIONAL_DISCAPACIDAD = 2; // fijo, para cada progenitor
const BASE_MAXIMA_MENSUAL_2025 = 4909.50; // €/mes
const BASE_MAXIMA_DIARIA_2025 = BASE_MAXIMA_MENSUAL_2025 / 30;

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type EdadProgenitor = 'menor_21' | 'entre_21_y_26' | 'mayor_26';
export type SituacionLaboralMP = 'trabajador_cuenta_ajena' | 'autonomo' | 'desempleado_sin_derecho';
export type TipoFamiliaMP = 'biparental' | 'monoparental';

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
  /** Tipo de familia: 'biparental' (19 semanas, por defecto) o 'monoparental' (32 semanas, RDL 9/2025) */
  tipoFamilia?: TipoFamiliaMP;
}

export interface ResultadoPrestacionMP {
  /** Base reguladora diaria (€) */
  baseReguladoraDiaria: number;
  /** Base reguladora mensual equivalente (€) */
  baseReguladoraMensual: number;
  /** Duración total de la prestación (días) para este progenitor */
  duracionTotalDias: number;
  /** Tipo de familia aplicado */
  tipoFamilia: TipoFamiliaMP;
  /** Semanas base según el tipo de familia (19 biparental / 32 monoparental, RDL 9/2025) */
  semanasBase: number;
  /** Semanas adicionales por parto múltiple */
  semanasAdicionalMultiple: number;
  /** Semanas adicionales por discapacidad del menor */
  semanasAdicionalDiscapacidad: number;
  /** Días obligatorios tras el parto (primeras 6 semanas) */
  diasObligatorios: number;
  /** Días de disfrute flexible (resto del período, hasta los 12 meses o los 8 años del menor) */
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

// ─── Función principal ───────────────────────────────────────────────────────

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
  const tipoFamilia = p.tipoFamilia ?? 'biparental';
  const semanasBase = tipoFamilia === 'monoparental' ? SEMANAS_BASE_MONOPARENTAL : SEMANAS_BASE_BIPARENTAL;
  const semanasFlexiblesHasta12Meses = tipoFamilia === 'monoparental'
    ? SEMANAS_FLEXIBLES_HASTA_12_MESES_MONOPARENTAL
    : SEMANAS_FLEXIBLES_HASTA_12_MESES_BIPARENTAL;
  const semanasCuidadoProlongado = tipoFamilia === 'monoparental'
    ? SEMANAS_CUIDADO_PROLONGADO_MONOPARENTAL
    : SEMANAS_CUIDADO_PROLONGADO_BIPARENTAL;

  const numHijos = p.numerosHijos ?? 1;
  const hijosAdicionales = Math.max(0, numHijos - 1);
  const semanasAdicionalMultiple = hijosAdicionales * SEMANAS_ADICIONAL_MULTIPLE_POR_HIJO;
  const semanasAdicionalDiscapacidad = p.hijoConDiscapacidad ? SEMANAS_ADICIONAL_DISCAPACIDAD : 0;

  const semanasTotal = semanasBase + semanasAdicionalMultiple + semanasAdicionalDiscapacidad;
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
  advertencias.push(
    `Las primeras ${SEMANAS_OBLIGATORIAS} semanas (${diasObligatorios} días) son OBLIGATORIAS e ininterrumpidas a jornada completa, inmediatamente después del parto/adopción/acogimiento. ` +
    `De las ${semanasBase - SEMANAS_OBLIGATORIAS} semanas base restantes (familia ${tipoFamilia}), ${semanasFlexiblesHasta12Meses} se disfrutan de forma flexible hasta que el menor cumpla 12 meses, ` +
    `y ${semanasCuidadoProlongado} son de cuidado prolongado, distribuibles a tiempo completo o parcial hasta que el menor cumpla 8 años (RDL 9/2025).`
  );
  advertencias.push('La prestación tributa en IRPF como rendimiento del trabajo (está sujeta a retención). A diferencia de 2018 (cuando estaba exenta), desde 2019 solo está exenta la prestación de Seguridad Social por maternidad/paternidad reconocida por el TSJUE, que fue incorporada en la Ley de PGE 2018 — la exención aún genera dudas en AEAT para algunos supuestos. Consulte con asesor fiscal.');
  if (p.situacionLaboral === 'autonomo') {
    advertencias.push('Autónomos: la base reguladora se calcula igual (base cotización mes anterior / días del mes). El RETA cotiza por contingencias comunes, por lo que el autónomo tiene derecho a esta prestación si cumple carencia y está al corriente de pago.');
  }
  if (numHijos >= 2) {
    advertencias.push(`Parto múltiple (${numHijos} hijos): se añade ${SEMANAS_ADICIONAL_MULTIPLE_POR_HIJO} semana adicional por cada hijo a partir del segundo (total +${semanasAdicionalMultiple} semanas / ${semanasAdicionalMultiple * DIAS_SEMANA} días) para cada progenitor.`);
  }
  if (p.hijoConDiscapacidad) {
    advertencias.push(`Discapacidad del menor ≥33%: se añaden ${SEMANAS_ADICIONAL_DISCAPACIDAD} semanas adicionales (${SEMANAS_ADICIONAL_DISCAPACIDAD * DIAS_SEMANA} días) para cada progenitor.`);
  }
  if (limitadaPorBaseMaxima) {
    advertencias.push(`La base de cotización supera la base máxima de 2025 (${BASE_MAXIMA_MENSUAL_2025.toLocaleString('es-ES')} €/mes). La cuantía diaria se limita a ${BASE_MAXIMA_DIARIA_2025.toFixed(2)} €/día.`);
  }
  advertencias.push('Si el recién nacido debe permanecer hospitalizado tras el parto, o en caso de parto prematuro, el permiso se amplía un día por cada día de hospitalización, con un máximo de 13 semanas adicionales (RDL 9/2025). Esta calculadora no incluye dicha ampliación; consúltela aparte si aplica.');

  return {
    baseReguladoraDiaria,
    baseReguladoraMensual,
    duracionTotalDias,
    tipoFamilia,
    semanasBase,
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
    fuenteDatos: 'LGSS arts. 177-182 + RDL 6/2019 (equiparación 2021) + RDL 9/2025 (ampliación a 19/32 semanas, en vigor 31-jul-2025) — vigente 2026',
  };
}
