/**
 * Calculadora de Plus de Nocturnidad — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_plus_nocturnidad)
 *
 * Calcula el importe del plus de nocturnidad, el número de horas nocturnas
 * trabajadas y el impacto en la cotización a la Seguridad Social.
 *
 * Marco normativo:
 *   - ET art. 36: trabajo nocturno = el realizado entre las 22:00 y las 6:00 horas
 *   - El trabajador nocturno es el que trabaja normalmente ≥ 3 horas diarias
 *     en período nocturno, o al menos 1/3 de su jornada anual en período nocturno
 *   - Retribución específica: el ET no fija un porcentaje mínimo estatal.
 *     Corresponde al convenio colectivo o acuerdo individual.
 *   - Porcentaje habitual en convenios: entre el 25% y el 35% del salario base
 *   - Si el salario se establece teniendo en cuenta que el trabajo es nocturno,
 *     no procede plus adicional ("absorbido por el salario")
 *
 * Cotización SS de las horas nocturnas:
 *   - Las horas nocturnas forman parte de la jornada ordinaria (no son horas extra)
 *   - El plus de nocturnidad cotiza íntegramente a la Seguridad Social
 *   - Tipo general: empresa 23,6% + trabajador 4,7% sobre la base de cotización
 *
 * Limitaciones del trabajo nocturno:
 *   - Máximo 8 horas diarias de promedio en un período de 15 días (ET art. 36.1)
 *   - Prohibido para menores de 18 años (ET art. 6.2)
 *   - Prohibido para embarazadas si la evaluación de riesgos lo exige
 *   - Derecho a reconocimientos médicos gratuitos periódicos
 *
 * Fuente: ET art. 36 + LGSS arts. 147-148 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_horas_extra, calcular_sueldo_neto, calcular_coste_empleado
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

const HORA_INICIO_NOCTURNIDAD = 22; // 22:00h
const HORA_FIN_NOCTURNIDAD = 6;    // 6:00h
const HORAS_NOCTURNAS_DIA = 8;     // Horas nocturnas en un turno completo (22h-6h)

// Tipos de cotización SS general (contingencias comunes)
const PCT_SS_EMPRESA = 23.6;
const PCT_SS_TRABAJADOR = 4.7;

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface TurnoNocturno {
  /** Descripción del turno (ej: "Lunes a viernes") */
  descripcion?: string;
  /** Hora de inicio del turno (formato 0-23) */
  horaInicio: number;
  /** Hora de fin del turno (formato 0-24, donde 24 = medianoche del día siguiente) */
  horaFin: number;
  /** Número de días al año con este turno */
  diasAlAnio: number;
}

export interface ParametrosPlusNocturnidad {
  /** Salario base mensual bruto (€) */
  salarioBaseMensual: number;
  /** Horas ordinarias mensuales de la jornada (sin nocturnidad) */
  horasMensualesJornada: number;
  /**
   * Porcentaje de plus de nocturnidad sobre el salario base (%).
   * Según convenio colectivo. Rango habitual: 25-35%.
   */
  pctPlusNocturnidad: number;
  /**
   * Turnos nocturnos trabajados (para calcular horas nocturnas exactas).
   * Alternativa: indicar directamente el número de horas nocturnas al mes.
   */
  turnosNocturnos?: TurnoNocturno[];
  /**
   * Horas nocturnas al mes (alternativa a turnosNocturnos).
   * Si se indica, tiene prioridad sobre turnosNocturnos.
   */
  horasNocturnasMes?: number;
  /**
   * ¿El salario ya incorpora la nocturnidad? (el convenio dice "salario nocturno")
   * Si es true, no se calcula plus adicional.
   */
  salariosAbsorbeNocturnidad?: boolean;
}

export interface ResultadoPlusNocturnidad {
  /** Salario base mensual (€) */
  salarioBaseMensual: number;
  /** Horas nocturnas al mes */
  horasNocturnasMes: number;
  /** Porcentaje de la jornada en horario nocturno (%) */
  pctJornadaNocturna: number;
  /** ¿Es trabajador nocturno según el ET? (≥ 3h/día o ≥ 1/3 jornada) */
  esTrabajoNocturno: boolean;
  /** ¿El salario absorbe la nocturnidad? */
  salariosAbsorbeNocturnidad: boolean;
  /** Valor hora ordinaria (€) */
  valorHoraOrdinaria: number;
  /** Porcentaje plus de nocturnidad (%) */
  pctPlusNocturnidad: number;
  /** Plus de nocturnidad mensual (€) */
  plusNocturnidadMensual: number;
  /** Plus de nocturnidad anual (12 meses) (€) */
  plusNocturnidadAnual: number;
  /** Salario total mensual con plus de nocturnidad (€) */
  salarioTotalMensual: number;
  /** Cotización SS empresa sobre el plus mensual (€) */
  cotizacionSSEmpresaMensual: number;
  /** Cotización SS trabajador sobre el plus mensual (€) */
  cotizacionSSTrabajadorMensual: number;
  /** Coste total mensual para la empresa (salario + SS empresa) (€) */
  costeTotalEmpresaMensual: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcularHorasNocturnasDeTurno(turno: TurnoNocturno): number {
  // Las horas nocturnas son las comprendidas entre 22h y 6h
  let horasNocturnas = 0;
  const inicio = turno.horaInicio;
  const fin = turno.horaFin > turno.horaInicio ? turno.horaFin : turno.horaFin + 24;

  for (let h = inicio; h < fin; h++) {
    const horaActual = h % 24;
    if (horaActual >= HORA_INICIO_NOCTURNIDAD || horaActual < HORA_FIN_NOCTURNIDAD) {
      horasNocturnas++;
    }
  }
  return horasNocturnas;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPlusNocturnidad(p: ParametrosPlusNocturnidad): ResultadoPlusNocturnidad {
  if (p.salarioBaseMensual <= 0) throw new Error('El salario base mensual debe ser mayor que cero.');
  if (p.horasMensualesJornada <= 0) throw new Error('Las horas mensuales de jornada deben ser mayores que cero.');
  if (p.pctPlusNocturnidad < 0 || p.pctPlusNocturnidad > 100) throw new Error('El porcentaje de plus de nocturnidad debe estar entre 0 y 100.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const absorbe = p.salariosAbsorbeNocturnidad ?? false;

  // Calcular horas nocturnas al mes
  let horasNocturnasMes: number;
  if (p.horasNocturnasMes !== undefined) {
    horasNocturnasMes = p.horasNocturnasMes;
  } else if (p.turnosNocturnos && p.turnosNocturnos.length > 0) {
    // Calcular desde los turnos (dividimos días/año entre 12 para obtener por mes)
    horasNocturnasMes = r(p.turnosNocturnos.reduce((sum, turno) => {
      const hNocturnas = calcularHorasNocturnasDeTurno(turno);
      return sum + (hNocturnas * turno.diasAlAnio / 12);
    }, 0));
  } else {
    // Sin datos de turnos: asumimos turno completo nocturno
    horasNocturnasMes = HORAS_NOCTURNAS_DIA * (p.horasMensualesJornada / 8);
  }

  const pctJornadaNocturna = r(horasNocturnasMes / p.horasMensualesJornada * 100);

  // ET art. 36: trabajador nocturno si ≥ 3h/día (= ~65h/mes para jornada 8h/día)
  // o ≥ 1/3 de la jornada anual en horario nocturno
  const horasDiariasNocturnas = r(horasNocturnasMes / (p.horasMensualesJornada / 8));
  const esTrabajoNocturno = horasDiariasNocturnas >= 3 || pctJornadaNocturna >= 33;

  const valorHoraOrdinaria = r(p.salarioBaseMensual / p.horasMensualesJornada);

  let plusNocturnidadMensual = 0;
  if (!absorbe) {
    // El plus se calcula sobre el salario base × % convenio
    plusNocturnidadMensual = r(p.salarioBaseMensual * p.pctPlusNocturnidad / 100);
  }

  const plusNocturnidadAnual = r(plusNocturnidadMensual * 12);
  const salarioTotalMensual = r(p.salarioBaseMensual + plusNocturnidadMensual);

  // Cotización SS solo sobre el plus de nocturnidad
  const cotizacionSSEmpresaMensual = r(plusNocturnidadMensual * PCT_SS_EMPRESA / 100);
  const cotizacionSSTrabajadorMensual = r(plusNocturnidadMensual * PCT_SS_TRABAJADOR / 100);
  const costeTotalEmpresaMensual = r(salarioTotalMensual + cotizacionSSEmpresaMensual + r(p.salarioBaseMensual * PCT_SS_EMPRESA / 100));

  const advertencias: string[] = [
    'El porcentaje del plus de nocturnidad lo fija el convenio colectivo aplicable. El ET no establece un mínimo estatal. Comprueba el convenio de tu sector.',
    `Trabajador nocturno (ET art. 36): si trabajas regularmente ≥ 3 horas diarias en horario nocturno (22h-6h) o ≥ 1/3 de tu jornada anual, tienes derecho a reconocimiento médico gratuito y el empresario no puede imponerte trabajo nocturno de forma obligatoria y permanente.`,
    'El plus de nocturnidad cotiza íntegramente a la Seguridad Social (base de contingencias comunes). No confundir con horas extra nocturnas, que tienen un régimen diferente.',
    `Límite de jornada nocturna: máximo 8 horas de promedio en períodos de 15 días (ET art. 36.1). No se pueden compensar con períodos de menos horas nocturnas.`,
  ];

  if (absorbe) {
    advertencias.unshift('El salario ya incorpora la nocturnidad ("salario nocturno"). No se genera plus adicional. Si tienes dudas, revisa el convenio colectivo: debe indicar explícitamente que el salario incluye la retribución de la nocturnidad.');
  }

  if (pctJornadaNocturna < 33 && horasDiariasNocturnas < 3) {
    advertencias.push('Con los datos indicados, el trabajador no alcanza el umbral de "trabajador nocturno" del ET (< 3h/día ni < 1/3 de jornada). No obstante, las horas trabajadas en horario nocturno deben retribuirse según el plus pactado en convenio.');
  }

  return {
    salarioBaseMensual: r(p.salarioBaseMensual),
    horasNocturnasMes: r(horasNocturnasMes),
    pctJornadaNocturna,
    esTrabajoNocturno,
    salariosAbsorbeNocturnidad: absorbe,
    valorHoraOrdinaria,
    pctPlusNocturnidad: p.pctPlusNocturnidad,
    plusNocturnidadMensual,
    plusNocturnidadAnual,
    salarioTotalMensual,
    cotizacionSSEmpresaMensual,
    cotizacionSSTrabajadorMensual,
    costeTotalEmpresaMensual,
    advertencias,
    fuenteDatos: 'ET art. 36 + LGSS arts. 147-148 — vigente 2025',
  };
}
