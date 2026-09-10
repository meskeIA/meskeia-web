/**
 * Mínimo por discapacidad en el IRPF (Ley 35/2006, arts. 60-65).
 *
 * Fuente ÚNICA del cálculo: lo usan la tool `calcular_deduccion_discapacidad` del MCP de Delegum
 * y la app `app/estimacion-deduccion-discapacidad/`, que desde el 10/09/2026 ya no lleva su copia
 * inline. La fuente única de los importes es data/fiscal/dependencia.ts
 * (DEDUCCIONES_IRPF_DISCAPACIDAD_2025).
 *
 * Nació como «réplica server-side» de esa app, y mientras las dos copias convivieron divergieron:
 * el 09/09/2026 se encontró aquí condicionado a `necesitaAsistencia` un incremento que el art. 60
 * concede también por grado ≥65 %, con la app haciéndolo bien. Eran 3.000 € de mínimo.
 *
 * El mínimo reduce la base liquidable, no la cuota. El "ahorro" es una estimación
 * aplicando un tipo marginal plano (puede repartirse entre dos tramos en la realidad).
 */
import {
  DEDUCCIONES_IRPF_DISCAPACIDAD_2025,
  FISCAL_DEPENDENCIA_META,
} from '@/data/fiscal/dependencia';

export type TitularDiscapacidad = 'contribuyente' | 'ascendiente' | 'descendiente';
export type GradoDiscapacidad = '33a65' | '65oMas';

export interface ParametrosDeduccionDiscapacidad {
  titular: TitularDiscapacidad;
  grado: GradoDiscapacidad;
  /**
   * ¿Acredita necesitar ayuda de terceras personas o movilidad reducida?
   * Es UNO de los tres supuestos alternativos del incremento por gastos de
   * asistencia: con grado ≥65 % el incremento se aplica igual sin marcarla.
   */
  necesitaAsistencia?: boolean;
  /** Tipo marginal de IRPF (%) para estimar el ahorro. */
  tipoMarginal: number;
}

export interface ResultadoDeduccionDiscapacidad {
  minimoDiscapacidad: number;
  gastosAsistencia: number;
  totalMinimo: number;
  tipoMarginal: number;
  ahorroEstimado: number;
  fuente: string;
  verificado: string;
}

export function calcularDeduccionDiscapacidadIRPF(
  p: ParametrosDeduccionDiscapacidad
): ResultadoDeduccionDiscapacidad {
  if (!Number.isFinite(p.tipoMarginal) || p.tipoMarginal < 0 || p.tipoMarginal > 100) {
    throw new Error('El tipo marginal debe estar entre 0 y 100.');
  }
  // `-0 < 0` es false, así que el cero negativo atraviesa la guarda y arrastra su signo
  // hasta el ahorro (12.000 × -0 = -0), que se imprimía como «-0,00 €». Se normaliza.
  const tipoMarginal = Object.is(p.tipoMarginal, -0) ? 0 : p.tipoMarginal;

  // El contribuyente usa sus propios importes; ascendiente/descendiente usan los familiares.
  const datos =
    p.titular === 'contribuyente'
      ? DEDUCCIONES_IRPF_DISCAPACIDAD_2025.contribuyente
      : DEDUCCIONES_IRPF_DISCAPACIDAD_2025.familiar;

  const minimoDiscapacidad =
    p.grado === '33a65' ? datos.discapacidad33a65 : datos.discapacidad65oMas;

  // Art. 60 LIRPF (y art. 61 para ascendientes/descendientes): el incremento de 3.000 € por
  // gastos de asistencia procede ante CUALQUIERA de tres supuestos ALTERNATIVOS —acreditar
  // necesitar ayuda de terceras personas, acreditar movilidad reducida, O un grado de
  // discapacidad igual o superior al 65 %—. Manual práctico Renta 2025 de la AEAT: «se
  // incrementará, en concepto de gastos de asistencia, en 3.000 euros anuales por cada
  // ascendiente o descendiente que acredite necesitar ayuda de terceras personas o movilidad
  // reducida, o un grado de discapacidad igual o superior al 65 por 100».
  // Con grado 33-64 % la acreditación SÍ es condición necesaria; con ≥65 % el grado basta.
  const tieneDerechoAsistencia = p.necesitaAsistencia === true || p.grado === '65oMas';

  const gastosAsistencia = tieneDerechoAsistencia
    ? p.grado === '33a65'
      ? datos.gastosAsistencia33a65
      : datos.gastosAsistencia65oMas
    : 0;

  const totalMinimo = minimoDiscapacidad + gastosAsistencia;
  const ahorroEstimado = totalMinimo * (tipoMarginal / 100);

  return {
    minimoDiscapacidad,
    gastosAsistencia,
    totalMinimo,
    tipoMarginal,
    ahorroEstimado,
    fuente: FISCAL_DEPENDENCIA_META.fuente,
    verificado: FISCAL_DEPENDENCIA_META.verificado,
  };
}
