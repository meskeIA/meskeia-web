/**
 * Calculadora de Bonificaciones a la Seguridad Social por Contratación — lógica pura
 * Usada por: MCP server (calcular_bonificacion_contratacion)
 *
 * Calcula las bonificaciones o reducciones en las cuotas empresariales a la
 * Seguridad Social por la contratación de determinados colectivos, aplicando
 * el RDL 1/2023 (que refunde las bonificaciones dispersas).
 *
 * Marco normativo:
 *   - RDL 1/2023, de 10 de enero: medidas urgentes en materia de incentivos a
 *     la contratación laboral (derogó la Ley 43/2006 y la mayoría de bonificaciones)
 *   - ET art. 11 (contratos formativos) — el RDL 1/2023 también los incluye
 *   - RDL 32/2021 (reforma laboral): contratos indefinidos como regla general
 *   - LGSS arts. 20-26: cotizaciones y bonificaciones
 *
 * PRINCIPIO GENERAL (RDL 1/2023):
 *   Solo se bonifican los contratos INDEFINIDOS (regla general post-reforma laboral).
 *   Los contratos temporales (salvo formativos) dejan de tener bonificaciones.
 *
 * COLECTIVOS CON BONIFICACIÓN (RDL 1/2023):
 *   a) Personas con discapacidad: 4.500-6.300 €/año según sexo y grado
 *   b) Víctimas de violencia de género / terrorismo: 1.500 €/año mujeres (1.800 si <45)
 *   c) Jóvenes en situación de exclusión social: ≤30 años, itinerario empleo
 *   d) Personas en riesgo exclusión social: certificado servicios sociales
 *   e) Empleados del hogar: bonificación 45% cuota indefinida (desde 2023)
 *   f) Contrato relevo (sustitución jubilados): 50% cuota del relevista
 *
 * REDUCCIONES (no bonificaciones) — más favorables:
 *   - Contratos de sustitución por nacimiento/adopción: reducción 100% cuota
 *   - Empleados del hogar (contrato indefinido a tiempo completo): 45%
 *   - Primer empleo joven: reducción durante primer año en contratos formativos
 *
 * Cuota empresa tipo: 23,6% contingencias comunes + 5,5% desempleo + 0,2% FOGASA
 *   + AT/EP (varía por actividad, estimada 1,5% en esta calculadora)
 *   ≈ 30,8% total
 *
 * Fuente: RDL 1/2023 + LGSS arts. 20-26 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_coste_empleado, calcular_sueldo_neto, calcular_irpf
 */

// ─── Constantes ────────────────────────────────────────────────────────────

const TIPO_SS_EMPRESA_TOTAL_APROX = 30.8; // % cuota total empresa (CC + desempleo + FOGASA + AT/EP estimado)
const TIPO_SS_EMPRESA_CC = 23.6;          // % contingencias comunes (cuota empresa)

// Bonificaciones anuales por colectivo (RDL 1/2023) — en €/año
const BONIFICACIONES: Record<string, { hombre: number; mujer: number; descripcion: string }> = {
  discapacidad_menor33: { hombre: 0, mujer: 0, descripcion: 'Discapacidad <33% — sin bonificación' },
  discapacidad_33_64: { hombre: 4500, mujer: 4500, descripcion: 'Discapacidad 33-64%' },
  discapacidad_65_mas: { hombre: 5700, mujer: 6300, descripcion: 'Discapacidad ≥65%' },
  discapacidad_con_especiales: { hombre: 5100, mujer: 5700, descripcion: 'Discapacidad 33-64% con especiales dificultades (parálisis, enfermedad mental...)' },
  victima_violencia_genero: { hombre: 0, mujer: 1500, descripcion: 'Víctima violencia de género (mujeres)' },
  victima_violencia_genero_menor45: { hombre: 0, mujer: 1800, descripcion: 'Víctima violencia de género <45 años (mujeres)' },
  victima_terrorismo: { hombre: 1500, mujer: 1800, descripcion: 'Víctima de terrorismo' },
  exclusion_social_certificada: { hombre: 1650, mujer: 2100, descripcion: 'Exclusión social con certificado SSSS' },
  empleado_hogar: { hombre: 0, mujer: 0, descripcion: 'Empleados del hogar — bonificación por % (ver nota)' },
};

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type ColectivoBonificacion =
  | 'discapacidad_33_64'           // Discapacidad 33-64%
  | 'discapacidad_65_mas'          // Discapacidad ≥65%
  | 'discapacidad_con_especiales'  // 33-64% con especiales dificultades
  | 'victima_violencia_genero'     // Víctima VG ≥45 años
  | 'victima_violencia_genero_menor45' // Víctima VG <45 años
  | 'victima_terrorismo'           // Víctima de terrorismo
  | 'exclusion_social_certificada' // Exclusión social con cert. SSSS
  | 'empleado_hogar'               // Empleado del hogar (45% cuota)
  | 'contrato_relevo'              // Contrato relevo sustitución jubilado (50%)
  | 'sustitucion_nacimiento';      // Sustitución por nacimiento/adopción (100%)

export type SexoTrabajador = 'hombre' | 'mujer';

export interface ParametrosBonificacionContratacion {
  /** Colectivo que da derecho a bonificación */
  colectivo: ColectivoBonificacion;
  /** Sexo del trabajador (relevante en algunas bonificaciones) */
  sexo: SexoTrabajador;
  /** Salario bruto mensual del trabajador (€) */
  salarioBrutoMensual: number;
  /** Duración del contrato en meses (0 = indefinido sin límite) */
  duracionMeses?: number;
  /**
   * ¿Contrato a tiempo parcial?
   * La bonificación se aplica en proporción a la jornada.
   */
  tiempoParcial?: boolean;
  /** Porcentaje de jornada en tiempo parcial (%) — solo si tiempoParcial = true */
  pctJornada?: number;
}

export interface ResultadoBonificacionContratacion {
  colectivo: ColectivoBonificacion;
  /** Descripción del colectivo */
  descripcionColectivo: string;
  /** Cuota SS empresa SIN bonificación (€/mes) */
  cuotaSSEmpresaMensualSinBonificacion: number;
  /** Importe de bonificación mensual (€) */
  bonificacionMensual: number;
  /** Porcentaje de bonificación efectivo sobre cuota (%) */
  pctBonificacionEfectivo: number;
  /** **Cuota SS empresa CON bonificación (€/mes)** */
  cuotaSSEmpresaMensualConBonificacion: number;
  /** Ahorro anual por bonificación (€) */
  ahorroAnual: number;
  /** Ahorro total para el período indicado (€) — si se indica duración */
  ahorroTotalPeriodo: number;
  /** Duración máxima de la bonificación (meses, 0 = indefinida) */
  duracionMaximaBonificacion: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularBonificacionContratacion(
  p: ParametrosBonificacionContratacion
): ResultadoBonificacionContratacion {
  if (p.salarioBrutoMensual <= 0) throw new Error('El salario bruto mensual debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const pctJornada = (p.tiempoParcial ? (p.pctJornada ?? 100) : 100) / 100;
  const baseCotizacionMensual = r(p.salarioBrutoMensual * pctJornada);
  const cuotaSSEmpresaMensualSinBonificacion = r(baseCotizacionMensual * TIPO_SS_EMPRESA_TOTAL_APROX / 100);

  let bonificacionAnual = 0;
  let descripcionColectivo = '';
  let duracionMaximaBonificacion = 0; // 0 = indefinida

  switch (p.colectivo) {
    case 'discapacidad_33_64':
    case 'discapacidad_65_mas':
    case 'discapacidad_con_especiales': {
      const datos = BONIFICACIONES[p.colectivo];
      bonificacionAnual = p.sexo === 'mujer' ? datos.mujer : datos.hombre;
      descripcionColectivo = datos.descripcion;
      duracionMaximaBonificacion = 0; // Indefinida mientras subsiste el contrato
      break;
    }
    case 'victima_violencia_genero':
    case 'victima_violencia_genero_menor45': {
      if (p.sexo === 'hombre') {
        advertencias.push('Esta bonificación es exclusiva para mujeres víctimas de violencia de género. El cálculo se realiza con 0 € de bonificación.');
      }
      const datos = BONIFICACIONES[p.colectivo];
      bonificacionAnual = p.sexo === 'mujer' ? datos.mujer : 0;
      descripcionColectivo = datos.descripcion;
      duracionMaximaBonificacion = 0;
      break;
    }
    case 'victima_terrorismo': {
      const datos = BONIFICACIONES['victima_terrorismo'];
      bonificacionAnual = p.sexo === 'mujer' ? datos.mujer : datos.hombre;
      descripcionColectivo = datos.descripcion;
      duracionMaximaBonificacion = 0;
      break;
    }
    case 'exclusion_social_certificada': {
      const datos = BONIFICACIONES['exclusion_social_certificada'];
      bonificacionAnual = p.sexo === 'mujer' ? datos.mujer : datos.hombre;
      descripcionColectivo = datos.descripcion;
      duracionMaximaBonificacion = 0;
      break;
    }
    case 'empleado_hogar': {
      // 45% sobre cuota empresa CC
      const cuotaCC = r(baseCotizacionMensual * TIPO_SS_EMPRESA_CC / 100);
      bonificacionAnual = r(cuotaCC * 0.45 * 12);
      descripcionColectivo = 'Empleado del hogar — contrato indefinido (bonificación 45% cuota CC)';
      duracionMaximaBonificacion = 0;
      advertencias.push('Empleados del hogar: bonificación del 45% sobre la cuota de contingencias comunes de la empresa, solo para contratos INDEFINIDOS. Para tiempo parcial, se aplica proporcionalmente a la jornada.');
      break;
    }
    case 'contrato_relevo': {
      // 50% sobre cuota empresa total del relevista
      bonificacionAnual = r(cuotaSSEmpresaMensualSinBonificacion * 0.50 * 12);
      descripcionColectivo = 'Contrato de relevo — sustitución de trabajador jubilado parcialmente';
      duracionMaximaBonificacion = 0;
      advertencias.push('Contrato de relevo: la bonificación del 50% aplica mientras el jubilado parcial permanezca en activo y el relevista cubra su reducción de jornada. Requiere acuerdo empresa-trabajador y comunicación a la TGSS.');
      break;
    }
    case 'sustitucion_nacimiento': {
      // 100% cuota empresa durante la sustitución
      bonificacionAnual = r(cuotaSSEmpresaMensualSinBonificacion * 12); // max período suspensión
      descripcionColectivo = 'Contrato de sustitución por nacimiento/adopción — reducción 100% cuota';
      duracionMaximaBonificacion = p.duracionMeses ?? 16; // típicamente duración del permiso
      advertencias.push('Sustitución por nacimiento/adopción: reducción del 100% de la cuota empresarial durante la vigencia del contrato de sustitución. No es técnicamente una bonificación sino una reducción (no computa para el umbral de empleados).');
      break;
    }
  }

  // Ajuste por tiempo parcial (excepto empleado hogar y relevo que ya lo contemplan)
  if (p.tiempoParcial && p.colectivo !== 'empleado_hogar' && p.colectivo !== 'contrato_relevo') {
    bonificacionAnual = r(bonificacionAnual * pctJornada);
    advertencias.push(`Tiempo parcial (${pctJornada * 100}% jornada): la bonificación se reduce proporcionalmente a la jornada pactada.`);
  }

  const bonificacionMensual = r(bonificacionAnual / 12);
  const cuotaSSEmpresaMensualConBonificacion = r(Math.max(0, cuotaSSEmpresaMensualSinBonificacion - bonificacionMensual));
  const pctBonificacionEfectivo = cuotaSSEmpresaMensualSinBonificacion > 0
    ? r(bonificacionMensual / cuotaSSEmpresaMensualSinBonificacion * 100) : 0;
  const ahorroAnual = r(bonificacionMensual * 12);
  const meses = p.duracionMeses ?? (duracionMaximaBonificacion || 12);
  const ahorroTotalPeriodo = r(bonificacionMensual * meses);

  // Advertencias generales
  advertencias.push('Las bonificaciones del RDL 1/2023 solo aplican a contratos INDEFINIDOS (o formativos en algunos casos). Los contratos temporales no tienen bonificaciones a la SS desde la reforma laboral (RDL 32/2021).');
  advertencias.push('Incompatibilidades: las bonificaciones no son acumulables entre sí para el mismo trabajador. Si el trabajador pertenece a varios colectivos, solo se aplica la más favorable.');
  advertencias.push('Obligación de mantenimiento del empleo: algunas bonificaciones exigen mantener al trabajador un mínimo de 3 años desde la contratación. El incumplimiento conlleva devolución de las cuotas bonificadas con recargo.');

  return {
    colectivo: p.colectivo,
    descripcionColectivo,
    cuotaSSEmpresaMensualSinBonificacion,
    bonificacionMensual,
    pctBonificacionEfectivo,
    cuotaSSEmpresaMensualConBonificacion,
    ahorroAnual,
    ahorroTotalPeriodo,
    duracionMaximaBonificacion,
    advertencias,
    fuenteDatos: 'RDL 1/2023 (incentivos contratación) + LGSS arts. 20-26 — vigente 2025',
  };
}
