/**
 * Mínimo por discapacidad en el IRPF (Ley 35/2006, arts. 60-65).
 *
 * Réplica server-side de la lógica inline de
 * app/estimacion-deduccion-discapacidad/page.tsx. La fuente única de los importes
 * es data/fiscal/dependencia.ts (DEDUCCIONES_IRPF_DISCAPACIDAD_2025).
 *
 * Usada por: MCP server (calcular_deduccion_discapacidad).
 * TODO: unificar — la app aún mantiene su propia versión inline del mismo cálculo.
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

  // El contribuyente usa sus propios importes; ascendiente/descendiente usan los familiares.
  const datos =
    p.titular === 'contribuyente'
      ? DEDUCCIONES_IRPF_DISCAPACIDAD_2025.contribuyente
      : DEDUCCIONES_IRPF_DISCAPACIDAD_2025.familiar;

  const minimoDiscapacidad =
    p.grado === '33a65' ? datos.discapacidad33a65 : datos.discapacidad65oMas;

  const gastosAsistencia = p.necesitaAsistencia
    ? p.grado === '33a65'
      ? datos.gastosAsistencia33a65
      : datos.gastosAsistencia65oMas
    : 0;

  const totalMinimo = minimoDiscapacidad + gastosAsistencia;
  const ahorroEstimado = totalMinimo * (p.tipoMarginal / 100);

  return {
    minimoDiscapacidad,
    gastosAsistencia,
    totalMinimo,
    tipoMarginal: p.tipoMarginal,
    ahorroEstimado,
    fuente: FISCAL_DEPENDENCIA_META.fuente,
    verificado: FISCAL_DEPENDENCIA_META.verificado,
  };
}
