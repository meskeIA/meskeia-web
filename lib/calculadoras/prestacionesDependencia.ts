/**
 * Prestaciones económicas y servicios del SAAD por grado de dependencia.
 *
 * Réplica server-side del lookup/filtrado inline de
 * app/estimacion-prestaciones-dependencia/page.tsx. La fuente única de las
 * cuantías es data/fiscal/dependencia.ts; este módulo solo selecciona por grado.
 *
 * Usada por: MCP server (calcular_prestaciones_dependencia).
 * TODO: unificar — la app aún mantiene su propia versión inline del mismo lookup.
 *
 * El copago NO se calcula (depende de renta + patrimonio y sus tramos varían por
 * CCAA): solo se devuelve la nota orientativa oficial.
 */
import {
  GRADOS_DEPENDENCIA,
  PRESTACIONES_DEPENDENCIA_2025,
  SERVICIOS_SAAD,
  COPAGO_DEPENDENCIA_2025,
  FISCAL_DEPENDENCIA_META,
  type GradoDependencia,
  type PrestacionDependencia,
  type ServicioSAAD,
} from '@/data/fiscal/dependencia';

export type GradoDependenciaId = 1 | 2 | 3;

export interface ParametrosPrestacionesDependencia {
  grado: GradoDependenciaId;
}

export interface ResultadoPrestacionesDependencia {
  grado: GradoDependenciaId;
  gradoInfo: GradoDependencia;
  prestaciones: PrestacionDependencia[];
  serviciosDisponibles: ServicioSAAD[];
  serviciosNoDisponibles: ServicioSAAD[];
  copago: {
    ipremMensual: number;
    umbralExencionPorcentajeIPREM: number;
    porcentajeMaximoCopago: number;
    nota: string;
  };
  fuente: string;
  verificado: string;
  urlOficial: string;
}

export function calcularPrestacionesDependencia(
  p: ParametrosPrestacionesDependencia
): ResultadoPrestacionesDependencia {
  const gradoInfo = GRADOS_DEPENDENCIA.find((g) => g.grado === p.grado);
  if (!gradoInfo) {
    throw new Error('Grado de dependencia no válido. Debe ser 1 (moderada), 2 (severa) o 3 (gran dependencia).');
  }

  const prestaciones = PRESTACIONES_DEPENDENCIA_2025.filter((pr) => pr.grado === p.grado);
  const serviciosDisponibles = SERVICIOS_SAAD.filter((s) => s.gradosAcceso.includes(p.grado));
  const serviciosNoDisponibles = SERVICIOS_SAAD.filter((s) => !s.gradosAcceso.includes(p.grado));

  const pctMax =
    p.grado === 1
      ? COPAGO_DEPENDENCIA_2025.porcentajeMaximoCopago.grado1
      : p.grado === 2
        ? COPAGO_DEPENDENCIA_2025.porcentajeMaximoCopago.grado2
        : COPAGO_DEPENDENCIA_2025.porcentajeMaximoCopago.grado3;

  return {
    grado: p.grado,
    gradoInfo,
    prestaciones,
    serviciosDisponibles,
    serviciosNoDisponibles,
    copago: {
      ipremMensual: COPAGO_DEPENDENCIA_2025.iprem2025Mensual,
      umbralExencionPorcentajeIPREM: COPAGO_DEPENDENCIA_2025.umbralExencionPorcentajeIPREM,
      porcentajeMaximoCopago: pctMax,
      nota: COPAGO_DEPENDENCIA_2025.nota,
    },
    fuente: FISCAL_DEPENDENCIA_META.fuente,
    verificado: FISCAL_DEPENDENCIA_META.verificado,
    urlOficial: FISCAL_DEPENDENCIA_META.urlOficial,
  };
}
