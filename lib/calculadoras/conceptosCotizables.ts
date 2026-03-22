/**
 * Calculadora de Conceptos Cotizables y Exentos — SS e IRPF — lógica pura
 * Usada por: MCP server (calcular_conceptos_cotizables)
 *
 * Determina qué parte de las retribuciones en especie y complementos salariales
 * están exentos de cotización a la Seguridad Social y de IRPF, y qué parte
 * tributa y cotiza íntegramente.
 *
 * Conceptos analizados (límites 2025):
 *
 * A) DIETAS Y GASTOS DE VIAJE (art. 26.2 ET + RIRPF art. 9 + LGSS art. 147)
 *    - Ver calculadora plusDistancia para el detalle completo
 *
 * B) TICKETS RESTAURANTE / VALES COMIDA
 *    - Exento SS: hasta 11 €/día (RD 1483/2012)
 *    - Exento IRPF: hasta 11 €/día (RIRPF art. 42.3.a)
 *    - Condición: entrega en días hábiles trabajados; no acumulables
 *
 * C) CHEQUE GUARDERÍA / SERVICIO DE GUARDERÍA
 *    - Exento SS: totalidad (no límite)
 *    - Exento IRPF: totalidad hasta inicio educación primaria obligatoria (RIRPF art. 42.3.b)
 *    - Condición: servicio de guardería autorizado para hijos menores de 3 años
 *
 * D) TARJETA/BONO TRANSPORTE
 *    - Exento IRPF: hasta 1.500 €/año por trabajador (RIRPF art. 42.3.c, desde 2023)
 *    - Exento SS: mismo límite
 *
 * E) SEGURO MÉDICO COLECTIVO (empresa para empleados)
 *    - Exento IRPF: hasta 500 €/persona/año (trabajador, cónyuge, descendientes)
 *    - Con discapacidad: hasta 1.500 €/persona/año (RIRPF art. 42.3.f)
 *    - Cotiza a SS: NO si se considera retribución en especie no dineraria convencional
 *    - Exento SS: si cumple requisitos (art. 26.2 ET + criterio SS)
 *
 * F) VEHÍCULO DE EMPRESA (uso privado)
 *    - IRPF: 20% del coste de adquisición (nuevo o segunda mano)
 *    - IRPF vehículo eléctrico: 15% del coste
 *    - Si vehículo alquilado: 20% del valor de mercado
 *    - Cotiza a SS: sí, se suma a la base de cotización
 *
 * G) STOCK OPTIONS / ACCIONES (ver calculadora específica calcular_stock_options)
 *
 * Fuente: ET art. 26.2 + LGSS art. 147 + RIRPF art. 42 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_sueldo_neto, calcular_coste_empleado, calcular_irpf
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

const LIMITE_TICKET_RESTAURANTE_DIA = 11;       // €/día
const LIMITE_BONO_TRANSPORTE_ANUAL = 1500;       // €/año
const LIMITE_SEGURO_MEDICO_NORMAL = 500;         // €/persona/año
const LIMITE_SEGURO_MEDICO_DISCAPACIDAD = 1500;  // €/persona/año
const PCT_VEHICULO_EMPRESA_IRPF = 0.20;
const PCT_VEHICULO_ELECTRICO_IRPF = 0.15;

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosConceptosCotizables {
  // Tickets restaurante
  /** Importe diario del ticket restaurante (€) */
  ticketRestauranteDiario?: number;
  /** Días hábiles trabajados al año con ticket restaurante */
  diasHabilesConTicket?: number;

  // Cheque guardería
  /** Importe anual del cheque guardería o servicio guardería (€) */
  chequeGuarderiaAnual?: number;

  // Bono transporte
  /** Importe anual del bono/tarjeta transporte (€) */
  bonoTransporteAnual?: number;

  // Seguro médico
  /** Importe anual del seguro médico para el trabajador (€) */
  seguroMedicoTrabajador?: number;
  /** Importe anual del seguro médico para el cónyuge/descendientes (€) */
  seguroMedicoFamiliares?: number;
  /** Número de familiares cubiertos (cónyuge + descendientes) */
  numFamiliaresCubiertos?: number;
  /** ¿Algún familiar con discapacidad (aplica límite 1.500€)? */
  familiaresConDiscapacidad?: boolean;

  // Vehículo de empresa
  /** Valor de adquisición o valor de mercado del vehículo de empresa (€) */
  valorVehiculo?: number;
  /** ¿Es vehículo eléctrico? (tipo reducido 15%) */
  vehiculoElectrico?: boolean;
  /** ¿Vehículo en propiedad de la empresa? (vs renting/alquiler) */
  vehiculoEnPropiedad?: boolean;
  /** Porcentaje de uso privado del vehículo (%). Normalmente AEAT presume 100% privado. */
  pctUsoPrivado?: number;
}

export interface DetalleConcepto {
  concepto: string;
  importeTotal: number;
  exentoIRPF: number;
  tributaIRPF: number;
  exentoSS: boolean;
  observacion: string;
}

export interface ResultadoConceptosCotizables {
  /** Desglose por concepto */
  conceptos: DetalleConcepto[];
  /** Total de retribuciones en especie analizadas (€) */
  totalRetribucionEspecie: number;
  /** Total exento de IRPF (€) */
  totalExentoIRPF: number;
  /** Total que tributa en IRPF (€) */
  totalTributaIRPF: number;
  /** Total exento de SS (conceptos que no cotizan) */
  totalExentoSS: number;
  /** Total que cotiza a SS (€) */
  totalCotizaSS: number;
  /** Ahorro fiscal estimado (a tipo marginal 30%) (€) */
  ahorroFiscalEstimado: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularConceptosCotizables(p: ParametrosConceptosCotizables): ResultadoConceptosCotizables {
  const r = (n: number) => Math.round(n * 100) / 100;
  const conceptos: DetalleConcepto[] = [];
  const advertencias: string[] = [];

  // Tickets restaurante
  if (p.ticketRestauranteDiario !== undefined || p.diasHabilesConTicket !== undefined) {
    const diasHabiles = p.diasHabilesConTicket ?? 220;
    const importeDiario = p.ticketRestauranteDiario ?? 0;
    const importeTotal = r(importeDiario * diasHabiles);
    const exentoIRPFDiario = Math.min(importeDiario, LIMITE_TICKET_RESTAURANTE_DIA);
    const exentoIRPF = r(exentoIRPFDiario * diasHabiles);
    const tributaIRPF = r(importeTotal - exentoIRPF);
    conceptos.push({
      concepto: 'Tickets restaurante / vales comida',
      importeTotal,
      exentoIRPF,
      tributaIRPF,
      exentoSS: importeDiario <= LIMITE_TICKET_RESTAURANTE_DIA,
      observacion: `Límite exento: ${LIMITE_TICKET_RESTAURANTE_DIA} €/día trabajado. ${importeDiario > LIMITE_TICKET_RESTAURANTE_DIA ? `Exceso de ${r(importeDiario - LIMITE_TICKET_RESTAURANTE_DIA)} €/día tributa.` : 'Dentro del límite.'}`,
    });
  }

  // Cheque guardería
  if (p.chequeGuarderiaAnual !== undefined && p.chequeGuarderiaAnual > 0) {
    conceptos.push({
      concepto: 'Cheque guardería / servicio guardería',
      importeTotal: r(p.chequeGuarderiaAnual),
      exentoIRPF: r(p.chequeGuarderiaAnual),
      tributaIRPF: 0,
      exentoSS: true,
      observacion: 'Exento íntegramente de IRPF y SS para hijos menores de 3 años en guarderías autorizadas, hasta el inicio de la educación primaria obligatoria.',
    });
  }

  // Bono transporte
  if (p.bonoTransporteAnual !== undefined && p.bonoTransporteAnual > 0) {
    const exentoIRPF = Math.min(p.bonoTransporteAnual, LIMITE_BONO_TRANSPORTE_ANUAL);
    const tributaIRPF = Math.max(0, p.bonoTransporteAnual - LIMITE_BONO_TRANSPORTE_ANUAL);
    conceptos.push({
      concepto: 'Bono / tarjeta transporte público',
      importeTotal: r(p.bonoTransporteAnual),
      exentoIRPF: r(exentoIRPF),
      tributaIRPF: r(tributaIRPF),
      exentoSS: p.bonoTransporteAnual <= LIMITE_BONO_TRANSPORTE_ANUAL,
      observacion: `Límite exento: ${LIMITE_BONO_TRANSPORTE_ANUAL.toLocaleString('es-ES')} €/año. ${p.bonoTransporteAnual > LIMITE_BONO_TRANSPORTE_ANUAL ? 'Exceso tributa.' : 'Dentro del límite.'}`,
    });
  }

  // Seguro médico
  const seguroTrabajador = p.seguroMedicoTrabajador ?? 0;
  const seguroFamiliares = p.seguroMedicoFamiliares ?? 0;
  if (seguroTrabajador > 0 || seguroFamiliares > 0) {
    const limiteTrabajador = LIMITE_SEGURO_MEDICO_NORMAL;
    const limitePorFamiliar = p.familiaresConDiscapacidad ? LIMITE_SEGURO_MEDICO_DISCAPACIDAD : LIMITE_SEGURO_MEDICO_NORMAL;
    const numFamiliares = p.numFamiliaresCubiertos ?? 0;
    const limiteTotal = r(limiteTrabajador + limitePorFamiliar * numFamiliares);
    const importeTotal = r(seguroTrabajador + seguroFamiliares);
    const exentoIRPF = Math.min(importeTotal, limiteTotal);
    const tributaIRPF = Math.max(0, importeTotal - limiteTotal);
    conceptos.push({
      concepto: 'Seguro médico colectivo (empresa)',
      importeTotal: r(importeTotal),
      exentoIRPF: r(exentoIRPF),
      tributaIRPF: r(tributaIRPF),
      exentoSS: true,
      observacion: `Límite: ${limiteTrabajador} €/año trabajador + ${limitePorFamiliar} €/año por familiar${numFamiliares > 0 ? ` (${numFamiliares} familiares)` : ''}. Total exento: ${limiteTotal.toLocaleString('es-ES')} €.`,
    });
  }

  // Vehículo de empresa
  if (p.valorVehiculo !== undefined && p.valorVehiculo > 0) {
    const pctUsoPrivado = (p.pctUsoPrivado ?? 100) / 100;
    const pctIRPF = p.vehiculoElectrico ? PCT_VEHICULO_ELECTRICO_IRPF : PCT_VEHICULO_EMPRESA_IRPF;
    const importeTotal = r(p.valorVehiculo * pctIRPF * pctUsoPrivado);
    conceptos.push({
      concepto: `Vehículo de empresa${p.vehiculoElectrico ? ' (eléctrico)' : ''} — uso privado`,
      importeTotal,
      exentoIRPF: 0, // No hay exención; tributa íntegramente
      tributaIRPF: importeTotal,
      exentoSS: false, // Cotizan las retribuciones en especie
      observacion: `Tributación: ${(pctIRPF * 100).toFixed(0)}% del valor de adquisición × ${(pctUsoPrivado * 100).toFixed(0)}% uso privado = ${importeTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €/año. AEAT puede presumir uso privado al 100% si no se acredita uso laboral.`,
    });
    advertencias.push('El vehículo de empresa cotiza a la SS como retribución en especie y tributa en IRPF. Si solo se usa para trabajo (sin disponibilidad privada), no hay retribución en especie.');
  }

  const totalRetribucionEspecie = r(conceptos.reduce((s, c) => s + c.importeTotal, 0));
  const totalExentoIRPF = r(conceptos.reduce((s, c) => s + c.exentoIRPF, 0));
  const totalTributaIRPF = r(conceptos.reduce((s, c) => s + c.tributaIRPF, 0));
  const totalExentoSS = r(conceptos.filter(c => c.exentoSS).reduce((s, c) => s + c.importeTotal, 0));
  const totalCotizaSS = r(conceptos.filter(c => !c.exentoSS).reduce((s, c) => s + c.importeTotal, 0));
  const ahorroFiscalEstimado = r(totalExentoIRPF * 0.30); // Tipo marginal orientativo 30%

  advertencias.push('Los límites de exención de IRPF se aplican por trabajador y año. El exceso sobre los límites se suma al salario dinerario en la nómina.');
  advertencias.push('La clasificación como retribución en especie exenta de SS requiere que se trate de prestaciones no dinerarias y que cumplan los requisitos reglamentarios. La empresa debe documentarlo.');
  advertencias.push('Los planes de retribución flexible (flex comp) permiten transformar parte del salario dinerario en retribuciones en especie exentas, con ahorro fiscal conjunto empresa-empleado.');

  return {
    conceptos,
    totalRetribucionEspecie,
    totalExentoIRPF,
    totalTributaIRPF,
    totalExentoSS,
    totalCotizaSS,
    ahorroFiscalEstimado,
    advertencias,
    fuenteDatos: 'ET art. 26.2 + LGSS art. 147 + RIRPF art. 42.3 — vigente 2025',
  };
}
