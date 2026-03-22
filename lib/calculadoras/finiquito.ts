/**
 * Calculadora de Finiquito — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_finiquito)
 *
 * Calcula los conceptos que componen el finiquito:
 * - Indemnización por despido (si aplica)
 * - Vacaciones no disfrutadas
 * - Parte proporcional de pagas extras
 * - Salarios pendientes de cobro
 *
 * Fuente: Estatuto de los Trabajadores (arts. 53, 55-56) + Ley 3/2012
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type MotivoFiniquito =
  | 'despido_improcedente'      // 33 días/año (desde 12/02/2012), máx 24 mensualidades
  | 'despido_objetivo'          // 20 días/año, máx 12 mensualidades (causas ETOP, art. 52 ET)
  | 'despido_disciplinario'     // 0 € (si el juez lo declara procedente)
  | 'fin_contrato_temporal'     // 12 días/año (para fin de contrato, desde 2015)
  | 'baja_voluntaria'           // 0 € indemnización
  | 'mutuo_acuerdo';            // Lo que acuerden las partes

export interface ParametrosFiniquito {
  /** Salario bruto mensual (en la cuantía habitual de la última nómina, €) */
  salarioBrutoMensual: number;
  /** Motivo del fin de contrato */
  motivoFiniquito: MotivoFiniquito;
  /** Fecha de inicio del contrato (YYYY-MM-DD) */
  fechaInicio: string;
  /** Fecha de baja o último día trabajado (YYYY-MM-DD) */
  fechaBaja: string;
  /** Días de vacaciones pactados al año (por convenio, mínimo legal 30 días hábiles o 22 laborables) */
  diasVacacionesAnuales?: number;
  /** Días de vacaciones ya disfrutados en el año actual */
  diasVacacionesDisfrutados?: number;
  /** Número de pagas (incluidas extras): 12, 13 o 14 */
  pagas?: number;
  /** Fecha de devengo de la última paga extra (YYYY-MM-DD, para calcular parte proporcional) */
  ultimaPagaExtraFecha?: string;
}

export interface ResultadoFiniquito {
  /** Años y días de antigüedad */
  antiguedadAnios: number;
  antiguedadDias: number;
  /** Indemnización por despido (€) */
  indemnizacion: number;
  /** Días de indemnización aplicados por año */
  diasIndemnizacionPorAnio: number;
  /** Máximo de mensualidades aplicado */
  maxMensualidades: number;
  /** Si se aplicó el límite de mensualidades */
  limitadoPorMensualidades: boolean;
  /** Vacaciones no disfrutadas (€) */
  vacacionesPendientes: number;
  /** Días de vacaciones pendientes */
  diasVacacionesPendientes: number;
  /** Parte proporcional pagas extras (€) */
  pagasExtrasProporcionales: number;
  /** Salarios pendientes del mes en curso (€) */
  salariosAtrasados: number;
  /** Total finiquito bruto */
  totalFiniquitoBruto: number;
  /** Nota sobre tributación */
  notaTributacion: string;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function diasEntreFechas(inicio: string, fin: string): number {
  const d1 = new Date(inicio);
  const d2 = new Date(fin);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularFiniquito(p: ParametrosFiniquito): ResultadoFiniquito {
  if (p.salarioBrutoMensual <= 0) throw new Error('El salario mensual debe ser mayor que cero.');

  const fechaInicio = new Date(p.fechaInicio);
  const fechaBaja = new Date(p.fechaBaja);
  if (isNaN(fechaInicio.getTime()) || isNaN(fechaBaja.getTime())) {
    throw new Error('Fechas no válidas. Usar formato YYYY-MM-DD.');
  }
  if (fechaBaja <= fechaInicio) throw new Error('La fecha de baja debe ser posterior al inicio del contrato.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const diasTotales = diasEntreFechas(p.fechaInicio, p.fechaBaja);
  const aniosTotales = diasTotales / 365.25;
  const antiguedadAnios = Math.floor(aniosTotales);
  const antiguedadDias = diasTotales - Math.floor(aniosTotales) * 365;

  const salarioDiario = p.salarioBrutoMensual / 30;
  const pagas = p.pagas ?? 14;

  // ─── 1. Indemnización ────────────────────────────────────────────────────────

  let diasIndemnizacionPorAnio = 0;
  let maxMensualidades = 0;

  switch (p.motivoFiniquito) {
    case 'despido_improcedente':
      diasIndemnizacionPorAnio = 33;
      maxMensualidades = 24;
      break;
    case 'despido_objetivo':
      diasIndemnizacionPorAnio = 20;
      maxMensualidades = 12;
      break;
    case 'fin_contrato_temporal':
      diasIndemnizacionPorAnio = 12;
      maxMensualidades = 0; // sin límite mensualidades explícito en ET
      break;
    default:
      diasIndemnizacionPorAnio = 0;
      maxMensualidades = 0;
  }

  let indemnizacion = 0;
  let limitadoPorMensualidades = false;

  if (diasIndemnizacionPorAnio > 0) {
    // Pro-rata por fracción de año
    const indemnizacionBruta = r(salarioDiario * diasIndemnizacionPorAnio * aniosTotales);
    const topeMensualidades = maxMensualidades > 0
      ? r(p.salarioBrutoMensual * maxMensualidades)
      : Infinity;

    if (maxMensualidades > 0 && indemnizacionBruta > topeMensualidades) {
      indemnizacion = topeMensualidades;
      limitadoPorMensualidades = true;
    } else {
      indemnizacion = indemnizacionBruta;
    }
  }

  // ─── 2. Vacaciones no disfrutadas ───────────────────────────────────────────

  const diasVacacionesAnuales = p.diasVacacionesAnuales ?? 22; // días laborables mínimo legal
  const diasVacacionesDisfrutados = p.diasVacacionesDisfrutados ?? 0;

  // Vacaciones devengadas en el año actual (hasta fecha de baja)
  const inicioAnio = new Date(fechaBaja.getFullYear(), 0, 1);
  const diasTrabajadosAnioActual = diasEntreFechas(
    inicioAnio.toISOString().split('T')[0],
    p.fechaBaja
  );
  const vacacionesDevengadas = (diasVacacionesAnuales * diasTrabajadosAnioActual) / 365;
  const diasVacacionesPendientes = Math.max(0, vacacionesDevengadas - diasVacacionesDisfrutados);
  const vacacionesPendientes = r(salarioDiario * diasVacacionesPendientes);

  // ─── 3. Parte proporcional pagas extras ─────────────────────────────────────

  const pagasExtra = pagas - 12;
  let pagasExtrasProporcionales = 0;

  if (pagasExtra > 0) {
    // Cada paga extra equivale a 1 mes de salario bruto (simplificado: sin mejoras convenio)
    // Se devenga en 6 meses típicamente (verano/navidad)
    // Calculamos los meses proporcionales del último período de devengo
    let mesesProporcionales: number;

    if (p.ultimaPagaExtraFecha) {
      const diasDesdeUltimaPaga = diasEntreFechas(p.ultimaPagaExtraFecha, p.fechaBaja);
      mesesProporcionales = Math.min(diasDesdeUltimaPaga / 30, 6);
    } else {
      // Sin fecha, estimamos 3 meses de media proporcional
      const mesActual = fechaBaja.getMonth(); // 0-11
      mesesProporcionales = mesActual % 6; // meses desde última paga (junio o diciembre)
    }

    pagasExtrasProporcionales = r(p.salarioBrutoMensual * pagasExtra * (mesesProporcionales / 6));
  }

  // ─── 4. Salarios pendientes ──────────────────────────────────────────────────

  const diaDelMes = fechaBaja.getDate();
  const salariosAtrasados = r(salarioDiario * diaDelMes);

  // ─── Total ───────────────────────────────────────────────────────────────────

  const totalFiniquitoBruto = r(indemnizacion + vacacionesPendientes + pagasExtrasProporcionales + salariosAtrasados);

  // Nota tributación (la indemnización por despido improcedente está exenta hasta 180.000 €)
  let notaTributacion = '';
  if (p.motivoFiniquito === 'despido_improcedente') {
    notaTributacion = 'La indemnización por despido improcedente está EXENTA de IRPF hasta 180.000 € (art. 7.e LIRPF). Vacaciones y pagas extras sí tributan.';
  } else if (p.motivoFiniquito === 'despido_objetivo') {
    notaTributacion = 'La indemnización por despido objetivo (causas ETOP) está EXENTA de IRPF hasta 180.000 € (art. 7.e LIRPF). Vacaciones y pagas extras sí tributan.';
  } else {
    notaTributacion = 'Todas las cantidades del finiquito (vacaciones + pagas proporcionales + salarios) tributan como rendimientos del trabajo en IRPF.';
  }

  return {
    antiguedadAnios,
    antiguedadDias,
    indemnizacion,
    diasIndemnizacionPorAnio,
    maxMensualidades,
    limitadoPorMensualidades,
    vacacionesPendientes,
    diasVacacionesPendientes: r(diasVacacionesPendientes),
    pagasExtrasProporcionales,
    salariosAtrasados,
    totalFiniquitoBruto,
    notaTributacion,
    fuenteDatos: 'Estatuto de los Trabajadores (arts. 52-56) + Ley 3/2012 de reforma laboral',
  };
}
