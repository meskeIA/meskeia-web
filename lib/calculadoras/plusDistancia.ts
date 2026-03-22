/**
 * Calculadora de Plus por Distancia / Kilómetros Exentos de IRPF — lógica pura
 * Usada por: MCP server (calcular_plus_distancia)
 *
 * Calcula las dietas y gastos de locomoción exentos de IRPF según el RIRPF art. 9.
 * Distingue entre:
 *
 * A) GASTOS DE LOCOMOCIÓN (desplazamiento en el día de trabajo):
 *    - Vehículo propio: 0,26 €/km (desde 17/07/2023, actualizado de 0,19 €)
 *    - Transporte público: justificado con factura (100% exento con justificante)
 *    - El exceso sobre estos límites tributa como rendimiento del trabajo
 *
 * B) DIETAS DE MANUTENCIÓN Y ESTANCIA:
 *    - Sin pernoctar en España: 26,67 €/día exento
 *    - Pernoctando en España: 53,34 €/día exento
 *    - Sin pernoctar en extranjero: 48,08 €/día exento
 *    - Pernoctando en extranjero: 91,35 €/día exento
 *    - Conductores de vehículos de transporte de mercancías: 15,63 €/día España / 25,50 €/día extranjero
 *
 * C) ASIGNACIONES PARA GASTOS DE VIAJE (alojamiento):
 *    - Con factura: 100% exento
 *    - Sin factura: el importe tributa íntegramente
 *
 * Nota: estos límites aplican cuando el trabajador se desplaza fuera del municipio
 * de su centro de trabajo y de su residencia habitual, por razón del trabajo.
 *
 * Fuente: RIRPF art. 9 (RD 439/2007) + Ley 31/2022 (PGE 2023, actualización km)
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_sueldo_neto, calcular_kilometraje
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

export const LIMITE_KM_VEHICULO_PROPIO_2025 = 0.26;   // €/km — desde 17/07/2023
export const LIMITE_KM_MOTO_2025 = 0.26;              // €/km — mismo límite que coche desde 2023

// Límites dietas manutención (€/día)
export const DIETAS = {
  espania_sin_pernoctar:   26.67,
  espania_pernoctando:     53.34,
  extranjero_sin_pernoctar: 48.08,
  extranjero_pernoctando:  91.35,
  conductor_espania:       15.63,
  conductor_extranjero:    25.50,
} as const;

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoVehiculo = 'coche_propio' | 'moto_propia' | 'transporte_publico';
export type TipoDieta = 'espania_sin_pernoctar' | 'espania_pernoctando' | 'extranjero_sin_pernoctar' | 'extranjero_pernoctando' | 'conductor_espania' | 'conductor_extranjero';

export interface ParametrosPlusDistancia {
  // Gastos de locomoción
  /** Kilómetros recorridos con vehículo propio (€) */
  kmVehiculoPropio?: number;
  /** Tipo de vehículo propio */
  tipoVehiculo?: TipoVehiculo;
  /** Importe abonado por transporte público (€) — exento si hay justificante */
  transportePublicoImporte?: number;
  /** ¿Tiene justificante de transporte público? */
  transportePublicoJustificado?: boolean;
  /** Importe abonado por peajes y parking (€) — exento si hay justificante */
  peajesParking?: number;

  // Dietas
  /** Número de días sin pernoctar en España con dieta */
  diasEspaniaSinPernoctar?: number;
  /** Número de días pernoctando en España con dieta */
  diasEspaniaPernoctando?: number;
  /** Número de días sin pernoctar en extranjero con dieta */
  diasExtranjerSinPernoctar?: number;
  /** Número de días pernoctando en extranjero con dieta */
  diasExtranjeroPernoctando?: number;
  /** Número de días como conductor de mercancías en España */
  diasConductorEspania?: number;
  /** Número de días como conductor de mercancías en extranjero */
  diasConductorExtranjero?: number;

  // Alojamiento
  /** Importe de alojamiento con factura (€) — 100% exento */
  alojamientoConFactura?: number;
  /** Importe de alojamiento sin factura (€) — tributa íntegramente */
  alojamientoSinFactura?: number;

  // Importes realmente abonados (para calcular el exceso tributable)
  /** Importe total abonado por la empresa por dietas (€) */
  dietasAbonadasTotal?: number;
}

export interface ResultadoPlusDistancia {
  // Locomoción
  /** Exención por km en vehículo propio (€) */
  exencionKmVehiculoPropio: number;
  /** Límite por km aplicado (€/km) */
  limiteKmAplicado: number;
  /** Exención por transporte público (€) */
  exencionTransportePublico: number;
  /** Exención por peajes/parking (€) */
  exencionPeajesParking: number;
  /** Total exención locomoción (€) */
  totalExencionLocomocion: number;

  // Dietas
  /** Exención total por dietas de manutención (€) */
  totalExencionDietas: number;
  /** Desglose de exención por tipo de dieta */
  desgloseDietas: { concepto: string; dias: number; limite: number; exencion: number }[];

  // Alojamiento
  /** Exención por alojamiento (€) */
  exencionAlojamiento: number;

  // Totales
  /** Exención total IRPF (€) */
  totalExencionIRPF: number;
  /** Exceso sobre los límites que tributa como rendimiento del trabajo (€) */
  excesoTributable: number;

  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPlusDistancia(p: ParametrosPlusDistancia): ResultadoPlusDistancia {
  const r = (n: number) => Math.round(n * 100) / 100;

  const tipoVehiculo = p.tipoVehiculo ?? 'coche_propio';
  const limiteKm = tipoVehiculo === 'moto_propia' ? LIMITE_KM_MOTO_2025 : LIMITE_KM_VEHICULO_PROPIO_2025;

  // Exención km vehículo propio
  const exencionKmVehiculoPropio = r((p.kmVehiculoPropio ?? 0) * limiteKm);

  // Transporte público
  const exencionTransportePublico = p.transportePublicoJustificado
    ? r(p.transportePublicoImporte ?? 0)
    : 0;

  // Peajes y parking (siempre con justificante)
  const exencionPeajesParking = r(p.peajesParking ?? 0);

  const totalExencionLocomocion = r(exencionKmVehiculoPropio + exencionTransportePublico + exencionPeajesParking);

  // Desglose de dietas
  const desgloseDietas: ResultadoPlusDistancia['desgloseDietas'] = [];

  const addDieta = (concepto: string, dias: number | undefined, limite: number) => {
    if (!dias || dias <= 0) return;
    desgloseDietas.push({ concepto, dias, limite, exencion: r(dias * limite) });
  };

  addDieta('España sin pernoctar', p.diasEspaniaSinPernoctar, DIETAS.espania_sin_pernoctar);
  addDieta('España pernoctando', p.diasEspaniaPernoctando, DIETAS.espania_pernoctando);
  addDieta('Extranjero sin pernoctar', p.diasExtranjerSinPernoctar, DIETAS.extranjero_sin_pernoctar);
  addDieta('Extranjero pernoctando', p.diasExtranjeroPernoctando, DIETAS.extranjero_pernoctando);
  addDieta('Conductor mercancías España', p.diasConductorEspania, DIETAS.conductor_espania);
  addDieta('Conductor mercancías extranjero', p.diasConductorExtranjero, DIETAS.conductor_extranjero);

  const totalExencionDietas = r(desgloseDietas.reduce((s, d) => s + d.exencion, 0));

  // Alojamiento
  const exencionAlojamiento = r(p.alojamientoConFactura ?? 0); // Sin factura → tributa

  const totalExencionIRPF = r(totalExencionLocomocion + totalExencionDietas + exencionAlojamiento);

  // Calcular exceso tributable si se ha informado el importe total abonado
  let excesoTributable = 0;
  if (p.dietasAbonadasTotal !== undefined && p.dietasAbonadasTotal > 0) {
    const exencionDietasYAlojamiento = r(totalExencionDietas + exencionAlojamiento + (p.alojamientoSinFactura ?? 0));
    excesoTributable = Math.max(0, r((p.dietasAbonadasTotal) - exencionDietasYAlojamiento));
  }
  if (p.alojamientoSinFactura && p.alojamientoSinFactura > 0) {
    excesoTributable = r(excesoTributable + (p.alojamientoSinFactura ?? 0));
  }

  const advertencias: string[] = [
    'Los límites de exención aplican cuando el desplazamiento es por razón del trabajo, fuera del municipio del centro de trabajo y de la residencia habitual del trabajador.',
    `El límite de 0,26 €/km aplica al uso del vehículo propio. Para vehículo de empresa cedido, la retribución en especie tiene reglas distintas.`,
    'Las dietas deben acreditarse documentalmente (justificante de desplazamiento, destino y fecha). La empresa debe registrarlos para justificar la exención ante Hacienda.',
    'El exceso sobre los límites reglamentarios tributa como rendimiento del trabajo y debe sumarse al salario en la nómina y en el modelo 190.',
  ];

  if (p.transportePublicoImporte && !p.transportePublicoJustificado) {
    advertencias.push('El gasto en transporte público sin justificante no está exento y tributa íntegramente como retribución en especie.');
  }

  return {
    exencionKmVehiculoPropio,
    limiteKmAplicado: limiteKm,
    exencionTransportePublico,
    exencionPeajesParking,
    totalExencionLocomocion,
    totalExencionDietas,
    desgloseDietas,
    exencionAlojamiento,
    totalExencionIRPF,
    excesoTributable,
    advertencias,
    fuenteDatos: 'RIRPF art. 9 (RD 439/2007) + actualización km por Ley 31/2022 — 0,26 €/km desde 17/07/2023, vigente 2025',
  };
}
