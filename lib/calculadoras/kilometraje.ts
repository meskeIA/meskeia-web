/**
 * Calculadora de Deducción por Kilometraje — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_kilometraje)
 *
 * Calcula la compensación/deducción fiscal por uso de vehículo propio
 * en actividades económicas o desplazamientos laborales.
 *
 * Modelos:
 * A) Empleados: exención IRPF hasta 0,26 €/km (RIRPF art. 9.B.2)
 * B) Autónomos: deducción en IRPF e IVA si el vehículo es afecto a la actividad
 *
 * Fuente: RIRPF art. 9.B.2 + Resolución DGT — módulo km 2025: 0,26 €/km
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

/** Módulo exento de km para empleados (€/km) — AEAT 2025 */
const MODULO_KM_EXENTO = 0.26;

/** Límite de IVA deducible para autónomos sin justificación exclusividad (50%) */
const PCT_IVA_DEDUCIBLE_PARCIAL = 0.5;

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type PerfilKilometraje = 'empleado' | 'autonomo';

export interface ParametrosKilometraje {
  /** Perfil del contribuyente */
  perfil: PerfilKilometraje;
  /** Kilómetros profesionales anuales */
  kmProfesionalesAnuales: number;
  /** Compensación recibida por km (€/km). Para empleados: lo que paga la empresa. */
  compensacionRecibidaPorKm?: number;
  /** Coste real del combustible por km (€/km). Por defecto 0,10 €/km. */
  costeCombustiblePorKm?: number;
  /** Coste total del vehículo por km incluyendo amortización y seguros (€/km). Por defecto 0,20 €/km. */
  costeRealPorKm?: number;
  /** ¿El vehículo está afecto exclusivamente a la actividad? (solo para autónomos) */
  usoExclusivoActividad?: boolean;
  /** Tipo de IVA soportado en gastos del vehículo (%). Por defecto 21%. */
  tipoIVA?: number;
  /** Total gastos del vehículo en el año (combustible, seguro, reparaciones, amortización) (€). Para autónomos. */
  totalGastosVehiculo?: number;
  /** Tipo marginal IRPF del contribuyente (%) para calcular ahorro fiscal. Por defecto 30%. */
  tipoMarginalIRPF?: number;
}

export interface ResultadoKilometraje {
  /** Perfil usado */
  perfil: PerfilKilometraje;
  /** Km profesionales anuales */
  kmProfesionalesAnuales: number;
  /** Resultado específico del perfil */
  resultado: ResultadoEmpleado | ResultadoAutonomo;
}

export interface ResultadoEmpleado {
  tipo: 'empleado';
  /** Compensación máxima exenta de IRPF (€/año) */
  compensacionMaximaExenta: number;
  /** Compensación recibida de la empresa (€/año) */
  compensacionRecibida: number;
  /** Importe exento de IRPF (€/año) */
  importeExento: number;
  /** Importe sujeto a IRPF si la empresa paga más del límite (€) */
  importeSujetoIRPF: number;
  /** Coste real del desplazamiento (€/año) */
  costeRealDesplazamiento: number;
  /** Diferencia no cubierta por la empresa (€) */
  diferenciaSinCubrir: number;
  /** Módulo AEAT aplicado (€/km) */
  moduloKm: number;
}

export interface ResultadoAutonomo {
  tipo: 'autonomo';
  /** Total gastos vehículo deducibles en IRPF (€) */
  gastosDeduciblesIRPF: number;
  /** IVA deducible (€) */
  ivaDeducible: number;
  /** Ahorro fiscal estimado en IRPF (€) */
  ahorroFiscalIRPF: number;
  /** Ahorro por IVA deducible (€) */
  ahorroIVA: number;
  /** Ahorro total (€) */
  ahorroTotal: number;
  /** ¿Uso exclusivo acreditado? */
  usoExclusivo: boolean;
  /** % de deducción aplicado */
  pctDeduccion: number;
  /** Advertencia legal importante */
  advertencia: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularKilometraje(p: ParametrosKilometraje): ResultadoKilometraje {
  if (p.kmProfesionalesAnuales < 0) throw new Error('Los km profesionales no pueden ser negativos.');
  if (p.kmProfesionalesAnuales > 200000) throw new Error('El límite máximo es 200.000 km/año.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const tipoMarginal = p.tipoMarginalIRPF ?? 30;
  const tipoIVA = p.tipoIVA ?? 21;

  if (p.perfil === 'empleado') {
    const compensacionPorKm = p.compensacionRecibidaPorKm ?? 0;
    const costeRealPorKm = p.costeRealPorKm ?? 0.20;

    const compensacionMaximaExenta = r(p.kmProfesionalesAnuales * MODULO_KM_EXENTO);
    const compensacionRecibida = r(p.kmProfesionalesAnuales * compensacionPorKm);
    const importeExento = r(Math.min(compensacionRecibida, compensacionMaximaExenta));
    const importeSujetoIRPF = r(Math.max(0, compensacionRecibida - compensacionMaximaExenta));
    const costeRealDesplazamiento = r(p.kmProfesionalesAnuales * costeRealPorKm);
    const diferenciaSinCubrir = r(Math.max(0, costeRealDesplazamiento - compensacionRecibida));

    return {
      perfil: 'empleado',
      kmProfesionalesAnuales: p.kmProfesionalesAnuales,
      resultado: {
        tipo: 'empleado',
        compensacionMaximaExenta,
        compensacionRecibida,
        importeExento,
        importeSujetoIRPF,
        costeRealDesplazamiento,
        diferenciaSinCubrir,
        moduloKm: MODULO_KM_EXENTO,
      },
    };
  }

  // Autónomo
  const usoExclusivo = p.usoExclusivoActividad ?? false;
  const pctDeduccion = usoExclusivo ? 100 : 50; // 50% parcial es la presunción general Hacienda
  const totalGastosVehiculo = p.totalGastosVehiculo ?? (p.kmProfesionalesAnuales * (p.costeRealPorKm ?? 0.20));

  const gastosDeduciblesIRPF = r(totalGastosVehiculo * (pctDeduccion / 100));
  const ivaBase = r(totalGastosVehiculo / (1 + tipoIVA / 100));
  const ivaSoportado = r(totalGastosVehiculo - ivaBase);
  const ivaDeducible = usoExclusivo
    ? ivaSoportado
    : r(ivaSoportado * PCT_IVA_DEDUCIBLE_PARCIAL);

  const ahorroFiscalIRPF = r(gastosDeduciblesIRPF * (tipoMarginal / 100));
  const ahorroIVA = ivaDeducible;
  const ahorroTotal = r(ahorroFiscalIRPF + ahorroIVA);

  return {
    perfil: 'autonomo',
    kmProfesionalesAnuales: p.kmProfesionalesAnuales,
    resultado: {
      tipo: 'autonomo',
      gastosDeduciblesIRPF,
      ivaDeducible,
      ahorroFiscalIRPF,
      ahorroIVA,
      ahorroTotal,
      usoExclusivo,
      pctDeduccion,
      advertencia: usoExclusivo
        ? 'Uso exclusivo acreditado: deducción 100%. Hacienda puede exigir justificación documental de la exclusividad.'
        : 'Sin exclusividad acreditada: Hacienda acepta 50% de IVA pero suele negar gastos IRPF de vehículos turismo. Consulta con asesor fiscal.',
    },
  };
}
