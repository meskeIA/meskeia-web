/**
 * Calculadora de IRNR — Impuesto sobre la Renta de No Residentes — lógica pura
 * Usada por: MCP server (calcular_irpf_no_residente)
 *
 * Calcula la cuota del IRNR para rentas obtenidas en España por no residentes
 * sin establecimiento permanente (EP), conforme al TRLIRNR (RDLeg 5/2004).
 *
 * Tipos aplicables 2025 (art. 25 TRLIRNR):
 * - Tipo general: 24% (países fuera de UE/EEE)
 * - UE, EEE (Islandia, Noruega, Liechtenstein): 19% para rendimientos trabajo,
 *   pensiones, dividendos, intereses, ganancias patrimoniales y arrendamientos
 * - Dividendos, intereses y ganancias patrimoniales (art. 25.1): 19% (todos los países)
 * - Rentas del trabajo de temporada (art. 25.2): 24%
 * - Arrendamiento de inmuebles:
 *   - Residentes UE/EEE: 19% + pueden deducir gastos
 *   - Resto: 24% sin deducción de gastos
 * - Pensiones extranjeras con origen en España (escala progresiva especial)
 *
 * Retenciones aplicables (art. 31 TRLIRNR):
 * - Rentas trabajo: 24% / 19%
 * - Dividendos e intereses: 19%
 * - Alquileres: 19% (UE/EEE) / 24% (resto)
 * - Actuaciones artistas/deportistas: 24%
 *
 * Fuente: TRLIRNR RDLeg 5/2004 + modificaciones LPGE 2023 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_plusvalias_irpf, calcular_retencion_alquiler
 */

import { FISCAL_IRPF_META } from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoRentaNoResidente =
  | 'trabajo'           // Rendimientos del trabajo
  | 'dividendos'        // Dividendos y participaciones en beneficios
  | 'intereses'         // Intereses y otros rendimientos del capital mobiliario
  | 'ganancia_inmueble' // Ganancias por venta de inmueble en España
  | 'ganancia_otros'    // Otras ganancias patrimoniales
  | 'alquiler_inmueble' // Rentas por arrendamiento de inmueble en España
  | 'pension'           // Pensiones con origen en España
  | 'royalties'         // Cánones, derechos de autor
  | 'actividad_economica'; // Rendimientos de actividad económica sin EP

export type ResidenciaFiscal = 'ue_eee' | 'convenio_sin_reduccion' | 'sin_convenio';

export interface GastoDeducibleNR {
  concepto: string;
  importe: number;
}

export interface ParametrosIRPFNoResidente {
  /** Tipo de renta obtenida en España */
  tipoRenta: TipoRentaNoResidente;
  /** Importe bruto de la renta (€) */
  importeBruto: number;
  /** Residencia fiscal del perceptor */
  residenciaFiscal: ResidenciaFiscal;
  /**
   * Gastos deducibles (solo para residentes UE/EEE en arrendamiento de inmueble).
   * Para otros tipos o residentes fuera de UE/EEE: no aplica.
   */
  gastosDeducibles?: GastoDeducibleNR[];
  /**
   * Retención ya practicada (€). Para calcular cuota diferencial.
   */
  retencionPracticada?: number;
}

export interface ResultadoIRPFNoResidente {
  /** Tipo de renta */
  tipoRenta: TipoRentaNoResidente;
  /** Residencia fiscal */
  residenciaFiscal: ResidenciaFiscal;
  /** Importe bruto de la renta (€) */
  importeBruto: number;
  /** Gastos deducibles totales (€) — solo UE/EEE en alquiler */
  gastosDeduciblesTotal: number;
  /** Base imponible (€) */
  baseImponible: number;
  /** Tipo de gravamen aplicado (%) */
  tipoGravamen: number;
  /** Cuota íntegra (€) */
  cuotaIntegra: number;
  /** Retención practicada (€) */
  retencionPracticada: number;
  /** Cuota diferencial (€): cuota - retención. Si negativo, a devolver. */
  cuotaDiferencial: number;
  /** Tipo de retención que debería aplicar el pagador (%) */
  tipoRetencionObligatorio: number;
  /** Retención correcta que debería haberse practicado (€) */
  retencionCorrecta: number;
  /** ¿Permite deducciones de gastos? */
  permiteDeducciones: boolean;
  /** Explicación del tipo aplicado */
  explicacionTipo: string;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Tipos de gravamen 2025 ────────────────────────────────────────────────────

function getTipoGravamen(tipo: TipoRentaNoResidente, residencia: ResidenciaFiscal): number {
  switch (tipo) {
    case 'dividendos':
    case 'intereses':
    case 'ganancia_inmueble':
    case 'ganancia_otros':
      return 19; // Tipo único para todos los países (art. 25.1 TRLIRNR)

    case 'royalties':
      return residencia === 'ue_eee' ? 19 : 24;

    case 'trabajo':
    case 'pension':
      return residencia === 'ue_eee' ? 19 : 24;

    case 'alquiler_inmueble':
      return residencia === 'ue_eee' ? 19 : 24;

    case 'actividad_economica':
      return 24; // Sin EP: tipo general

    default:
      return 24;
  }
}

function getTipoRetencion(tipo: TipoRentaNoResidente, residencia: ResidenciaFiscal): number {
  // Las retenciones coinciden con el tipo de gravamen en la mayoría de casos
  return getTipoGravamen(tipo, residencia);
}

function getExplicacionTipo(tipo: TipoRentaNoResidente, residencia: ResidenciaFiscal, tipoGravamen: number): string {
  const paisDesc = residencia === 'ue_eee' ? 'UE/EEE' : residencia === 'convenio_sin_reduccion' ? 'país con convenio (sin reducción de tipo)' : 'país sin convenio de doble imposición con España';
  switch (tipo) {
    case 'dividendos': return `Dividendos: tipo único del 19% independientemente del país de residencia (art. 25.1.a TRLIRNR). Residente en ${paisDesc}.`;
    case 'intereses': return `Intereses: tipo único del 19% independientemente del país de residencia (art. 25.1.b TRLIRNR). Residente en ${paisDesc}.`;
    case 'ganancia_inmueble':
    case 'ganancia_otros': return `Ganancias patrimoniales: tipo único del 19% (art. 25.1.f TRLIRNR). Residente en ${paisDesc}.`;
    case 'trabajo': return `Rendimientos del trabajo: ${tipoGravamen}% para residente en ${paisDesc} (art. 25.1.a TRLIRNR — ${residencia === 'ue_eee' ? '19% tipo reducido UE/EEE' : '24% tipo general'}).`;
    case 'alquiler_inmueble': return `Arrendamiento de inmueble: ${tipoGravamen}% para residente en ${paisDesc}. ${residencia === 'ue_eee' ? 'Los residentes UE/EEE pueden deducir gastos (art. 24.6 TRLIRNR).' : 'Los no residentes fuera de UE/EEE no pueden deducir gastos.'}`;
    case 'pension': return `Pensiones: ${tipoGravamen}% (tipo ${residencia === 'ue_eee' ? 'reducido UE/EEE 19%' : 'general 24%'}). Verificar si el convenio de doble imposición establece una reducción adicional.`;
    case 'royalties': return `Cánones/royalties: ${tipoGravamen}% para residente en ${paisDesc}. Verificar si el convenio bilateral reduce el tipo.`;
    case 'actividad_economica': return `Actividad económica sin EP: tipo general 24%. Para establecimiento permanente, se aplica el IS (25% o 23% PYME).`;
    default: return `Tipo de gravamen: ${tipoGravamen}%.`;
  }
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularIRPFNoResidente(p: ParametrosIRPFNoResidente): ResultadoIRPFNoResidente {
  if (p.importeBruto <= 0) throw new Error('El importe bruto de la renta debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const tipoGravamen = getTipoGravamen(p.tipoRenta, p.residenciaFiscal);
  const tipoRetencion = getTipoRetencion(p.tipoRenta, p.residenciaFiscal);

  // Solo UE/EEE puede deducir gastos en arrendamiento (art. 24.6 TRLIRNR)
  const permiteDeducciones = p.tipoRenta === 'alquiler_inmueble' && p.residenciaFiscal === 'ue_eee';
  const gastosDeduciblesTotal = permiteDeducciones && p.gastosDeducibles
    ? r(p.gastosDeducibles.reduce((s, g) => s + g.importe, 0))
    : 0;

  const baseImponible = r(p.importeBruto - gastosDeduciblesTotal);
  const cuotaIntegra = r(baseImponible * tipoGravamen / 100);
  const retencionPracticada = p.retencionPracticada ?? 0;
  const retencionCorrecta = r(p.importeBruto * tipoRetencion / 100);
  const cuotaDiferencial = r(cuotaIntegra - retencionPracticada);

  const advertencias: string[] = [
    'El IRNR se autoliquida mediante el Modelo 210 (rentas sin EP). El plazo varía según el tipo de renta: trimestral o anual.',
    'Si existe Convenio de Doble Imposición (CDI) entre España y el país de residencia del perceptor, el tipo puede ser inferior al establecido en el TRLIRNR. Siempre verificar el CDI aplicable.',
    'El pagador español tiene la obligación de practicar retención a cuenta del IRNR e ingresarla mediante Modelo 216.',
  ];

  if (p.residenciaFiscal === 'ue_eee' && p.tipoRenta === 'alquiler_inmueble') {
    advertencias.push('Los residentes de UE/EEE pueden deducir gastos directamente relacionados con el inmueble (IBI, intereses hipoteca, amortización, reparaciones). Requieren acreditar la residencia fiscal en UE/EEE mediante certificado.');
  }

  if (p.tipoRenta === 'actividad_economica') {
    advertencias.push('Si la actividad se desarrolla mediante establecimiento permanente en España, no tributa por IRNR sino por Impuesto sobre Sociedades (IS). Consultar con asesor fiscal.');
  }

  if (p.tipoRenta === 'ganancia_inmueble') {
    advertencias.push('En la venta de inmueble por no residente, el comprador está obligado a practicar una retención del 3% sobre el precio de venta (Modelo 211) con independencia del IRNR.');
  }

  return {
    tipoRenta: p.tipoRenta,
    residenciaFiscal: p.residenciaFiscal,
    importeBruto: r(p.importeBruto),
    gastosDeduciblesTotal,
    baseImponible,
    tipoGravamen,
    cuotaIntegra,
    retencionPracticada: r(retencionPracticada),
    cuotaDiferencial,
    tipoRetencionObligatorio: tipoRetencion,
    retencionCorrecta,
    permiteDeducciones,
    explicacionTipo: getExplicacionTipo(p.tipoRenta, p.residenciaFiscal, tipoGravamen),
    advertencias,
    fuenteDatos: `TRLIRNR (RDLeg 5/2004) arts. 24-25 — tipos vigentes 2025. ${FISCAL_IRPF_META.fuente}`,
  };
}
