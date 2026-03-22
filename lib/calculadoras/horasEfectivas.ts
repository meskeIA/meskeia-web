/**
 * Calculadora de Horas Efectivas y Coste Hora Real — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_horas_efectivas)
 *
 * Calcula las horas realmente trabajadas al año (descontando vacaciones, festivos,
 * bajas por enfermedad, formación, etc.) y el coste hora efectivo resultante.
 *
 * Es clave para freelances (para fijar tarifa correcta) y para empresas
 * (para conocer el coste real por hora productiva de un empleado).
 *
 * Fórmula:
 * Horas brutas = días_laborables × horas_por_día
 * Días laborables = 365 - (52 × 2 fines de semana) - festivos_nacionales - festivos_locales
 * Horas ausencias = (vacaciones + bajas + formación + otros) × horas_por_día
 * Horas efectivas = horas_brutas - horas_ausencias
 * Coste_hora = salario_bruto_anual / horas_efectivas
 *
 * Encadenable con: calcular_tarifa_freelance, calcular_coste_empleado, calcular_sueldo_neto
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type PerfilHoras = 'empleado' | 'freelance';

export interface ParametrosHorasEfectivas {
  /** Perfil del contribuyente */
  perfil: PerfilHoras;
  /** Salario bruto anual (€). Para empleados: bruto empresa. Para freelances: facturación neta. */
  salarioBrutoAnual: number;
  /** Horas de trabajo por día laboral. Por defecto 8. */
  horasPorDia?: number;
  /** Días de vacaciones al año. Por defecto 22 (mínimo legal convenio). */
  diasVacaciones?: number;
  /** Festivos nacionales + autonómicos al año. Por defecto 14 (festivos típicos España). */
  festivos?: number;
  /** Festivos locales (municipales). Por defecto 2. */
  festivosLocales?: number;
  /** Días de baja médica estimados al año. Por defecto 5 (promedio España). */
  diasBaja?: number;
  /** Días de formación/cursos al año. Por defecto 0. */
  diasFormacion?: number;
  /** Otros días de ausencia (licencias, permisos, etc.). Por defecto 0. */
  otrasAusencias?: number;
  /**
   * Para freelances: horas semanales dedicadas a tareas no facturables
   * (administración, marketing, reuniones comerciales, etc.).
   * Reduce las horas facturables respecto al total de horas trabajadas.
   * Por defecto 0.
   */
  horasNoFacturablesSemanales?: number;
  /**
   * Para freelances: porcentaje estimado de impagos o meses sin trabajo (%).
   * Reduce la facturación efectiva. Por defecto 0.
   */
  pctTiempoSinFacturar?: number;
}

export interface ResultadoHorasEfectivas {
  /** Perfil usado */
  perfil: PerfilHoras;
  /** Días laborables brutos al año (sin ausencias) */
  diasLaborablesBrutos: number;
  /** Total ausencias en días */
  totalAusenciasDias: number;
  /** Días efectivos trabajados al año */
  diasEfectivos: number;
  /** Horas brutas anuales (días laborables × horas/día) */
  horasBrutas: number;
  /** Horas de ausencia anuales */
  horasAusencia: number;
  /** Horas trabajadas efectivas al año */
  horasEfectivas: number;
  /** Horas facturables anuales (solo freelance: descuenta no facturables) */
  horasFacturables?: number;
  /** Coste por hora efectiva (salario / horas efectivas) (€/h) */
  costeHoraEfectiva: number;
  /** Tarifa mínima por hora facturable para cubrir salario objetivo (solo freelance) (€/h) */
  tarifaMinimaHora?: number;
  /** Semanas laborables al año */
  semanasLaborables: number;
  /** Distribución de ausencias detallada */
  detalleAusencias: {
    vacaciones: number;
    festivos: number;
    festivosLocales: number;
    bajas: number;
    formacion: number;
    otros: number;
  };
  /** Interpretación */
  interpretacion: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularHorasEfectivas(p: ParametrosHorasEfectivas): ResultadoHorasEfectivas {
  if (p.salarioBrutoAnual <= 0) throw new Error('El salario/facturación anual debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const r0 = (n: number) => Math.round(n);

  const horasPorDia = p.horasPorDia ?? 8;
  const vacaciones = p.diasVacaciones ?? 22;
  const festivos = p.festivos ?? 14;
  const festivosLocales = p.festivosLocales ?? 2;
  const bajas = p.diasBaja ?? 5;
  const formacion = p.diasFormacion ?? 0;
  const otros = p.otrasAusencias ?? 0;

  if (horasPorDia <= 0 || horasPorDia > 24) throw new Error('Las horas por día deben estar entre 1 y 24.');

  // Días laborables brutos (lunes-viernes, 52 semanas)
  const diasFinesSemana = 52 * 2;
  const diasLaborablesBrutos = r0(365 - diasFinesSemana - festivos - festivosLocales);

  // Total ausencias (vacaciones y bajas ya están dentro de los días laborables)
  const totalAusenciasDias = r0(vacaciones + bajas + formacion + otros);
  const diasEfectivos = Math.max(0, r0(diasLaborablesBrutos - totalAusenciasDias));

  // Horas
  const horasBrutas = r0(diasLaborablesBrutos * horasPorDia);
  const horasAusencia = r0(totalAusenciasDias * horasPorDia);
  const horasEfectivas = Math.max(1, r0(diasEfectivos * horasPorDia));

  // Semanas laborables
  const semanasLaborables = r(diasEfectivos / 5);

  // Coste hora
  const costeHoraEfectiva = r(p.salarioBrutoAnual / horasEfectivas);

  // Freelance: horas facturables
  let horasFacturables: number | undefined;
  let tarifaMinimaHora: number | undefined;
  if (p.perfil === 'freelance') {
    const horasNoFacturablesAnuales = r0((p.horasNoFacturablesSemanales ?? 0) * semanasLaborables);
    horasFacturables = Math.max(1, r0(horasEfectivas - horasNoFacturablesAnuales));
    const factorSinFacturar = 1 - (p.pctTiempoSinFacturar ?? 0) / 100;
    const horasFacturablesEfectivas = Math.max(1, r0(horasFacturables * factorSinFacturar));
    tarifaMinimaHora = r(p.salarioBrutoAnual / horasFacturablesEfectivas);
  }

  // Interpretación
  const pctProductividad = r(diasEfectivos / diasLaborablesBrutos * 100);
  let interpretacion: string;
  if (pctProductividad >= 90) {
    interpretacion = `Alta disponibilidad: ${pctProductividad}% del tiempo es productivo. Pocas ausencias.`;
  } else if (pctProductividad >= 75) {
    interpretacion = `Disponibilidad normal: ${pctProductividad}% del tiempo productivo. Dentro del promedio español.`;
  } else {
    interpretacion = `Disponibilidad reducida: solo el ${pctProductividad}% del tiempo es productivo. Considerar reducir ausencias o ajustar tarifas.`;
  }

  return {
    perfil: p.perfil,
    diasLaborablesBrutos,
    totalAusenciasDias,
    diasEfectivos,
    horasBrutas,
    horasAusencia,
    horasEfectivas,
    horasFacturables,
    costeHoraEfectiva,
    tarifaMinimaHora,
    semanasLaborables,
    detalleAusencias: {
      vacaciones,
      festivos,
      festivosLocales,
      bajas,
      formacion,
      otros,
    },
    interpretacion,
  };
}
