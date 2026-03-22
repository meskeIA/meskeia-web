/**
 * Calculadora de Nocturnidad en Turno Rotativo — lógica pura
 * Usada por: MCP server (calcular_nocturnidad_turno_rotativo)
 *
 * Calcula la acumulación de horas nocturnas en esquemas de turnos rotativos,
 * determina si el trabajador adquiere la condición de "trabajador nocturno"
 * y estima la compensación económica anual o en días de descanso adicionales.
 *
 * Diferencia con calcular_plus_nocturnidad:
 *   - calcular_plus_nocturnidad: calcula el plus dado un nº de horas nocturnas
 *     ya conocidas y un % de convenio.
 *   - calcular_nocturnidad_turno_rotativo: DEDUCE las horas nocturnas a partir
 *     del patrón de turnos y determina el estatus legal del trabajador nocturno.
 *
 * Marco normativo:
 *   - ET art. 36.1: trabajo nocturno = período entre 22h y 6h
 *   - ET art. 36.2: "trabajador nocturno" = quien realice normalmente en período
 *     nocturno una parte no inferior a 3 horas de su jornada diaria de trabajo,
 *     así como aquel que se prevea que puede realizar en período nocturno una
 *     parte no inferior a un tercio de su jornada de trabajo anual.
 *   - ET art. 36.4: los trabajadores nocturnos tienen derecho a protección
 *     en materia de seguridad y salud y a percibir una compensación específica.
 *   - ET art. 36.3: la jornada de los trabajadores nocturnos no puede exceder
 *     de 8 horas diarias de promedio en un período de 15 días.
 *
 * Turnos rotativos más comunes:
 *   A) 2 turnos (mañana/tarde): 6h-14h / 14h-22h → SIN horas nocturnas
 *   B) 2 turnos con nocturno: mañana + noche (6h-14h / 22h-6h) → nocturno alterna
 *   C) 3 turnos rotativos: mañana/tarde/noche → 1/3 del tiempo nocturno
 *   D) Turno de noche fijo: 22h-6h → 100% nocturno
 *   E) Turnos irregulares con solapamiento nocturno (personalizado)
 *
 * Fuente: ET art. 36 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_plus_nocturnidad, calcular_horas_efectivas, calcular_coste_empleado
 */

// ─── Constantes ────────────────────────────────────────────────────────────

const HORA_INICIO_NOCHE = 22;
const HORA_FIN_NOCHE = 6;      // en términos circulares (6h del día siguiente)
const HORAS_NOCTURNAS_TURNO_NOCHE = 8; // horas de jornada nocturna en turno noche

// Umbrales para "trabajador nocturno" (ET art. 36.2)
const UMBRAL_HORAS_DIARIAS = 3;       // ≥ 3 horas nocturnas/día en jornada habitual
const UMBRAL_PCT_ANUAL = 33.33;       // ≥ 1/3 de las horas anuales

const SEMANAS_ANIO = 52;
const DIAS_LABORABLES_SEMANA = 5;     // jornada estándar (puede ser 6)

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type PatronTurnosNocturno =
  | 'dos_turnos_sin_nocturno'       // M+T (6-14/14-22): 0 horas nocturnas
  | 'dos_turnos_con_nocturno'       // M+N (6-14/22-6): alterna una semana sin y una con noche
  | 'tres_turnos_rotativos_iguales' // M+T+N (ciclo 3 semanas o 3 días): 1/3 nocturno
  | 'turno_noche_fijo'             // N (22-6): 100% nocturno
  | 'personalizado';               // El usuario indica directamente las horas nocturnas semanales

export interface ParametrosNocturnidadTurnoRotativo {
  /** Patrón de turnos del trabajador */
  patronTurnos: PatronTurnosNocturno;
  /** Horas totales de jornada laboral semanal (€) */
  horasJornadaSemanal: number;
  /**
   * Horas nocturnas (22h-6h) por semana trabajadas efectivamente.
   * Solo necesario si patronTurnos = 'personalizado'.
   */
  horasNocturnasSemana?: number;
  /** Salario base mensual del trabajador (€) — para calcular el plus */
  salarioBaseMensual: number;
  /**
   * Porcentaje del plus de nocturnidad según convenio colectivo (%).
   * Si no hay convenio, el ET no fija porcentaje mínimo (uso habitual: 25-30%).
   */
  pctPlusNocturnidadConvenio?: number;
  /**
   * Número de días laborables por semana (default 5).
   * Para cálculo de horas nocturnas diarias medias.
   */
  diasLaborablesSemanales?: number;
  /**
   * ¿La compensación es en dinero (plus) o en descanso adicional?
   * Si se compensa con descanso, el convenio puede especificar los días extra.
   */
  compensacionEnDinero?: boolean;
}

export interface ResultadoNocturnidadTurnoRotativo {
  /** Patrón de turnos */
  patronTurnos: PatronTurnosNocturno;
  /** Horas nocturnas por semana */
  horasNocturnasSemana: number;
  /** Horas nocturnas por año */
  horasNocturnasAnuales: number;
  /** Horas totales de jornada anuales */
  horasJornadaAnuales: number;
  /** % de horas nocturnas sobre el total anual (%) */
  pctHorasNocturnas: number;
  /** Horas nocturnas diarias medias */
  horasNocturnasMediasDiarias: number;
  /** ¿Cumple el umbral de ≥3h nocturnas diarias? (criterio 1 ET art. 36.2) */
  cumpleUmbralDiario: boolean;
  /** ¿Cumple el umbral de ≥1/3 de las horas anuales? (criterio 2 ET art. 36.2) */
  cumpleUmbralAnual: boolean;
  /** **¿Es "trabajador nocturno" según el ET art. 36.2?** */
  esTrabajadorNocturno: boolean;
  /** Plus de nocturnidad mensual (€) — si compensación en dinero */
  plusNocturnidadMensual: number;
  /** Plus de nocturnidad anual (€) */
  plusNocturnidadAnual: number;
  /** Días de descanso adicional estimados por nocturnidad (si compensación en descanso) */
  diasDescansoAdicionalEstimados: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función auxiliar ─────────────────────────────────────────────────────

function calcularHorasNocturnasSemana(patron: PatronTurnosNocturno, horasJornadaSemanal: number): number {
  switch (patron) {
    case 'dos_turnos_sin_nocturno':
      return 0;
    case 'dos_turnos_con_nocturno':
      // Alterna: una semana de mañana (0h nocturnas) y una de noche (8h × días/semana)
      // Media semanal: HORAS_NOCTURNAS_TURNO_NOCHE × días_noche / 2
      // Si trabaja 5 días/semana: 8h × 5 días / 2 ciclos = 20h nocturnas cada 2 semanas = 10h/semana media
      return (HORAS_NOCTURNAS_TURNO_NOCHE * DIAS_LABORABLES_SEMANA) / 2;
    case 'tres_turnos_rotativos_iguales':
      // 1/3 del tiempo en turno de noche → 1/3 de las horas de jornada semanal son nocturnas
      return horasJornadaSemanal / 3;
    case 'turno_noche_fijo':
      // Toda la jornada es nocturna (22h-6h = 8h, pero la jornada puede ser diferente)
      return horasJornadaSemanal;
    default:
      return 0;
  }
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularNocturnidadTurnoRotativo(
  p: ParametrosNocturnidadTurnoRotativo
): ResultadoNocturnidadTurnoRotativo {
  if (p.horasJornadaSemanal <= 0) throw new Error('Las horas de jornada semanal deben ser mayores que cero.');
  if (p.salarioBaseMensual <= 0) throw new Error('El salario base mensual debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const diasSemanales = p.diasLaborablesSemanales ?? DIAS_LABORABLES_SEMANA;
  const pctPlus = p.pctPlusNocturnidadConvenio ?? 25;

  // ── Horas nocturnas semanales ─────────────────────────────────────────────
  let horasNocturnasSemana: number;
  if (p.patronTurnos === 'personalizado') {
    if (p.horasNocturnasSemana === undefined) {
      throw new Error('Para patrón personalizado debe indicar las horasNocturnasSemana.');
    }
    horasNocturnasSemana = p.horasNocturnasSemana;
  } else {
    horasNocturnasSemana = calcularHorasNocturnasSemana(p.patronTurnos, p.horasJornadaSemanal);
  }

  const horasNocturnasAnuales = r(horasNocturnasSemana * SEMANAS_ANIO);
  const horasJornadaAnuales = r(p.horasJornadaSemanal * SEMANAS_ANIO);
  const pctHorasNocturnas = r(horasNocturnasAnuales / horasJornadaAnuales * 100);
  const horasNocturnasMediasDiarias = r(horasNocturnasSemana / diasSemanales);

  // ── Estatus "trabajador nocturno" ─────────────────────────────────────────
  const cumpleUmbralDiario = horasNocturnasMediasDiarias >= UMBRAL_HORAS_DIARIAS;
  const cumpleUmbralAnual = pctHorasNocturnas >= UMBRAL_PCT_ANUAL;
  const esTrabajadorNocturno = cumpleUmbralDiario || cumpleUmbralAnual;

  // ── Compensación ──────────────────────────────────────────────────────────
  // Plus mensual = salario base × pct/100 × (horas nocturnas semanales / horas jornada semanales)
  const proporcionNocturna = horasNocturnasSemana / p.horasJornadaSemanal;
  const plusNocturnidadMensual = r(p.salarioBaseMensual * pctPlus / 100 * proporcionNocturna);
  const plusNocturnidadAnual = r(plusNocturnidadMensual * 12);

  // Estimación días descanso: cada hora nocturna podría compensarse con ~10-15 min extra
  // Sin convenio específico, se estima 1 día de descanso por cada semana de turno nocturno
  const semanasEnTurnoNoche = horasNocturnasSemana > 0
    ? (horasNocturnasAnuales / HORAS_NOCTURNAS_TURNO_NOCHE / DIAS_LABORABLES_SEMANA)
    : 0;
  const diasDescansoAdicionalEstimados = Math.round(semanasEnTurnoNoche * 2); // aprox. 2 días extra/semana nocturna

  // ── Advertencias ──────────────────────────────────────────────────────────
  if (!esTrabajadorNocturno && horasNocturnasAnuales > 0) {
    advertencias.push(`Con ${horasNocturnasMediasDiarias.toFixed(1)}h nocturnas diarias medias (${pctHorasNocturnas.toFixed(1)}% anual), el trabajador NO alcanza el umbral legal de "trabajador nocturno" (ET art. 36.2): requiere ≥3h/día o ≥1/3 de la jornada anual. El plus de nocturnidad puede seguir pactándose en convenio para cualquier hora nocturna.`);
  }
  if (esTrabajadorNocturno) {
    advertencias.push(`Trabajador nocturno (ET art. 36.2): su jornada máxima es de 8 horas diarias promediadas en un período de 15 días naturales. No puede realizar horas extraordinarias (salvo causas de fuerza mayor). Tiene derecho a evaluación de salud por el Servicio de Prevención de Riesgos Laborales.`);
  }
  advertencias.push('El ET NO fija un porcentaje mínimo de plus de nocturnidad. El derecho a compensación existe, pero su cuantía o forma (dinero o descanso) la fija el convenio colectivo o el acuerdo individual. El porcentaje habitual oscila entre el 20% y el 40% del salario base por hora nocturna.');
  advertencias.push('El plus de nocturnidad es base de cotización a la Seguridad Social y tributa en IRPF como rendimiento del trabajo.');
  if (p.patronTurnos === 'dos_turnos_con_nocturno') {
    advertencias.push('Turno M+N en alternancia: el cálculo asume rotación semanal (una semana mañana / una semana noche). Si la rotación es diferente (quincenal, mensual), ajustar horasNocturnasSemana en modo personalizado.');
  }
  if (p.patronTurnos === 'tres_turnos_rotativos_iguales') {
    advertencias.push('3 turnos iguales: se asume 1/3 del tiempo en cada turno. Si los turnos no son de igual duración o frecuencia, usar el modo personalizado indicando las horas nocturnas semanales reales.');
  }

  return {
    patronTurnos: p.patronTurnos,
    horasNocturnasSemana: r(horasNocturnasSemana),
    horasNocturnasAnuales,
    horasJornadaAnuales,
    pctHorasNocturnas,
    horasNocturnasMediasDiarias,
    cumpleUmbralDiario,
    cumpleUmbralAnual,
    esTrabajadorNocturno,
    plusNocturnidadMensual,
    plusNocturnidadAnual,
    diasDescansoAdicionalEstimados,
    advertencias,
    fuenteDatos: 'ET art. 36 — vigente 2025',
  };
}
