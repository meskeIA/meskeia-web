/**
 * Calculadora de Gastos Deducibles IRPF Autónomo — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_deduccion_autonomo_irpf)
 *
 * Calcula los gastos deducibles en el IRPF para autónomos en estimación
 * directa simplificada (EDS) o normal (EDN), conforme al RIRPF arts. 28-30
 * y la LIRPF.
 *
 * Gastos deducibles principales:
 *
 * A) CUOTAS SS AUTÓNOMO (RETA)
 *    - 100% deducible (art. 30.2.1 LIRPF)
 *
 * B) SUMINISTROS OFICINA EN CASA (art. 30.2.5 LIRPF, desde 2018)
 *    - Si el domicilio habitual se usa para la actividad:
 *    - Fórmula: 30% × (% superficie destinada a actividad) × gasto total suministros
 *    - Suministros: luz, agua, gas, internet, teléfono
 *    - Afectación parcial del inmueble: porcentaje de la superficie
 *
 * C) GASTOS DE DIFÍCIL JUSTIFICACIÓN — EDS (art. 30.2.4 RIRPF)
 *    - 7% del rendimiento neto previo (máximo 2.000 €/año) — solo EDS
 *    - Sustituyó la deducción del 5% hasta 2023; subió a 7% desde 2023
 *
 * D) DIETAS Y GASTOS DE MANUTENCIÓN (art. 30.2.6 LIRPF)
 *    - El autónomo puede deducir sus propias dietas si:
 *      a) La actividad se realiza en un establecimiento de hostelería
 *      b) Se paga por medios electrónicos
 *      c) Límites = mismos que para trabajadores (26,67 €/día España sin pernoctar)
 *
 * E) VEHÍCULO (uso exclusivo actividad económica — difícil de acreditar)
 *    - Para transporte de mercancías, enseñanza conductores, agentes comerciales:
 *      100% deducible si uso exclusivo acreditado
 *    - Para el resto: AEAT generalmente no admite deducción parcial en ED
 *    - Autónomos EDS: 50% en algunos criterios DGT — muy controvertido
 *
 * F) LOCAL / ALQUILER OFICINA EXTERIOR
 *    - 100% deducible si es la sede de la actividad
 *
 * G) OTROS GASTOS (art. 28 LIRPF)
 *    - Seguros de responsabilidad civil
 *    - Asesoría / gestoría
 *    - Material de oficina, publicidad, formación
 *    - Amortizaciones de inmovilizado
 *
 * Fuente: LIRPF arts. 28-30 + RIRPF arts. 28-30 + consultas DGT — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_modelo_130, calcular_cuota_autonomo, calcular_irpf
 */

// ─── Constantes 2025 ────────────────────────────────────────────────────────────

const PCT_SUMINISTROS_DEDUCIBLE = 30;        // % sobre la parte proporcional
const PCT_DIFICIL_JUSTIFICACION_EDS = 7;     // % rendimiento neto previo (EDS)
const LIMITE_DIFICIL_JUSTIFICACION = 2000;   // € máximo anual
const DIETA_MAX_ESPANIA_SIN_PERNOCTAR = 26.67; // €/día (art. 9 RIRPF)
const DIETA_MAX_ESPANIA_PERNOCTANDO = 53.34;
const DIETA_MAX_EXTRANJERO_SIN_PERNOCTAR = 48.08;
const DIETA_MAX_EXTRANJERO_PERNOCTANDO = 91.35;

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type ModalidadEstimacion = 'simplificada' | 'directa_normal';

export interface GastoDeducibleAutonomo {
  concepto: string;
  importeTotal: number;
  importeDeducible: number;
  pctDeduccion: number;
  observacion: string;
}

export interface ParametrosDeduccionAutonomoIRPF {
  /** Modalidad de estimación directa */
  modalidadEstimacion: ModalidadEstimacion;
  /** Ingresos brutos anuales de la actividad (€) */
  ingresosBrutos: number;
  /** Cuotas SS autónomo (RETA) anuales pagadas (€) */
  cuotasSSAutonomo?: number;
  /** Alquiler del local / oficina exterior anual (€) */
  alquilerLocal?: number;
  /** Gasto en suministros del domicilio habitual (luz, agua, internet...) anual (€) */
  gastosSupministrosHogar?: number;
  /** % de la superficie del hogar dedicada a la actividad (0-100) */
  pctSuperficieActividadHogar?: number;
  /** Gastos de asesoría/gestoría anuales (€) */
  gastosAsesoria?: number;
  /** Seguros de responsabilidad civil, accidentes, etc. anuales (€) */
  gastosSeguros?: number;
  /** Material de oficina, publicidad, formación, etc. (€) */
  otrosGastos?: number;
  /** Gastos de dietas en hostelería (pagados con tarjeta) anuales (€) */
  gastosDietas?: number;
  /** Días de dietas en España sin pernoctar */
  diasDietasEspaniaSinPernoctar?: number;
  /** Días de dietas en España pernoctando */
  diasDietasEspaniaPernoctando?: number;
  /** Días de dietas en extranjero sin pernoctar */
  diasDietasExtranjeroSinPernoctar?: number;
  /** Días de dietas en extranjero pernoctando */
  diasDietasExtranjeroPernoctando?: number;
  /**
   * Otros gastos deducibles acreditados no incluidos en los apartados anteriores (€).
   * (amortizaciones, compras de mercancías, etc.)
   */
  otrosGastosAcreditados?: number;
}

export interface ResultadoDeduccionAutonomoIRPF {
  /** Ingresos brutos anuales (€) */
  ingresosBrutos: number;
  /** Detalle de gastos deducibles */
  gastos: GastoDeducibleAutonomo[];
  /** Total gastos deducibles antes de difícil justificación (€) */
  totalGastosDeducibles: number;
  /** Rendimiento neto previo (€) = ingresos - gastos (antes de deducción difícil justificación) */
  rendimientoNetoPrevio: number;
  /** Deducción por gastos de difícil justificación (solo EDS) (€) */
  deduccionDificilJustificacion: number;
  /** **Rendimiento neto de la actividad (€)** */
  rendimientoNetoActividad: number;
  /** Tipo estimado de IRPF sobre el rendimiento neto (%) */
  tipoIRPFEstimado: number;
  /** Cuota IRPF estimada (€) */
  cuotaIRPFEstimada: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularDeduccionAutonomoIRPF(p: ParametrosDeduccionAutonomoIRPF): ResultadoDeduccionAutonomoIRPF {
  if (p.ingresosBrutos < 0) throw new Error('Los ingresos brutos no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const gastos: GastoDeducibleAutonomo[] = [];
  const advertencias: string[] = [];

  // A) Cuotas SS
  if (p.cuotasSSAutonomo && p.cuotasSSAutonomo > 0) {
    gastos.push({
      concepto: 'Cuotas SS autónomo (RETA)',
      importeTotal: r(p.cuotasSSAutonomo),
      importeDeducible: r(p.cuotasSSAutonomo),
      pctDeduccion: 100,
      observacion: 'Deducibles al 100% (art. 30.2.1 LIRPF). Incluye cuota base, mejoras voluntarias y contingencias profesionales.',
    });
  }

  // B) Alquiler local
  if (p.alquilerLocal && p.alquilerLocal > 0) {
    gastos.push({
      concepto: 'Alquiler oficina / local de negocio',
      importeTotal: r(p.alquilerLocal),
      importeDeducible: r(p.alquilerLocal),
      pctDeduccion: 100,
      observacion: 'Deducible al 100% si el local se usa exclusivamente para la actividad. Requiere contrato de arrendamiento y facturas.',
    });
  }

  // C) Suministros hogar
  if (p.gastosSupministrosHogar && p.gastosSupministrosHogar > 0 &&
      p.pctSuperficieActividadHogar && p.pctSuperficieActividadHogar > 0) {
    const pctSup = Math.min(p.pctSuperficieActividadHogar, 100) / 100;
    const importeDeducible = r(p.gastosSupministrosHogar * pctSup * PCT_SUMINISTROS_DEDUCIBLE / 100);
    gastos.push({
      concepto: 'Suministros hogar (oficina en casa)',
      importeTotal: r(p.gastosSupministrosHogar),
      importeDeducible,
      pctDeduccion: r(pctSup * PCT_SUMINISTROS_DEDUCIBLE),
      observacion: `Fórmula: 30% × ${p.pctSuperficieActividadHogar}% superficie = ${r(pctSup * PCT_SUMINISTROS_DEDUCIBLE)}% del total de suministros. Art. 30.2.5 LIRPF.`,
    });
    advertencias.push('Para deducir suministros del hogar, el autónomo debe estar dado de alta con el domicilio habitual como sede de la actividad (en el modelo 036/037). AEAT puede requerir acreditación de la afectación.');
  }

  // D) Asesoría / gestoría
  if (p.gastosAsesoria && p.gastosAsesoria > 0) {
    gastos.push({
      concepto: 'Asesoría / gestoría',
      importeTotal: r(p.gastosAsesoria),
      importeDeducible: r(p.gastosAsesoria),
      pctDeduccion: 100,
      observacion: 'Deducibles al 100% con factura. Incluye asesoría fiscal, laboral, contable y jurídica.',
    });
  }

  // E) Seguros
  if (p.gastosSeguros && p.gastosSeguros > 0) {
    gastos.push({
      concepto: 'Seguros (RC, accidentes, salud)',
      importeTotal: r(p.gastosSeguros),
      importeDeducible: r(p.gastosSeguros),
      pctDeduccion: 100,
      observacion: 'Deducibles al 100%: seguros de responsabilidad civil, accidentes, salud (hasta 500 €/persona IRPF como retribución en especie exenta). Con factura.',
    });
  }

  // F) Otros gastos (material, publicidad, formación)
  if (p.otrosGastos && p.otrosGastos > 0) {
    gastos.push({
      concepto: 'Material de oficina, publicidad, formación y otros',
      importeTotal: r(p.otrosGastos),
      importeDeducible: r(p.otrosGastos),
      pctDeduccion: 100,
      observacion: 'Deducibles al 100% si están vinculados a la actividad y están justificados con factura.',
    });
  }

  // G) Dietas propias del autónomo
  const limiteDietas = r(
    (p.diasDietasEspaniaSinPernoctar ?? 0) * DIETA_MAX_ESPANIA_SIN_PERNOCTAR +
    (p.diasDietasEspaniaPernoctando ?? 0) * DIETA_MAX_ESPANIA_PERNOCTANDO +
    (p.diasDietasExtranjeroSinPernoctar ?? 0) * DIETA_MAX_EXTRANJERO_SIN_PERNOCTAR +
    (p.diasDietasExtranjeroPernoctando ?? 0) * DIETA_MAX_EXTRANJERO_PERNOCTANDO
  );

  const gastoDietasReal = p.gastosDietas ?? 0;
  if (gastoDietasReal > 0 || limiteDietas > 0) {
    const importeDeducibleDietas = r(Math.min(gastoDietasReal, limiteDietas));
    gastos.push({
      concepto: 'Dietas propias del autónomo (hostelería + tarjeta)',
      importeTotal: r(gastoDietasReal),
      importeDeducible: importeDeducibleDietas,
      pctDeduccion: gastoDietasReal > 0 ? r(importeDeducibleDietas / gastoDietasReal * 100) : 100,
      observacion: `Límite según días: ${limiteDietas.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €. Requiere pago con tarjeta y que la actividad se realice en establecimiento de hostelería (art. 30.2.6 LIRPF).`,
    });
    advertencias.push('Las dietas del autónomo son deducibles solo si se pagan con medios electrónicos y en establecimientos de hostelería/restauración. Los importes en efectivo no son deducibles.');
  }

  // H) Otros gastos acreditados
  if (p.otrosGastosAcreditados && p.otrosGastosAcreditados > 0) {
    gastos.push({
      concepto: 'Otros gastos acreditados (amortizaciones, compras, etc.)',
      importeTotal: r(p.otrosGastosAcreditados),
      importeDeducible: r(p.otrosGastosAcreditados),
      pctDeduccion: 100,
      observacion: 'Gastos deducibles adicionales acreditados con factura y vinculados a la actividad económica.',
    });
  }

  const totalGastosDeducibles = r(gastos.reduce((s, g) => s + g.importeDeducible, 0));
  const rendimientoNetoPrevio = r(p.ingresosBrutos - totalGastosDeducibles);

  // Deducción gastos difícil justificación (solo EDS)
  let deduccionDificilJustificacion = 0;
  if (p.modalidadEstimacion === 'simplificada' && rendimientoNetoPrevio > 0) {
    deduccionDificilJustificacion = r(Math.min(
      rendimientoNetoPrevio * PCT_DIFICIL_JUSTIFICACION_EDS / 100,
      LIMITE_DIFICIL_JUSTIFICACION
    ));
  }

  const rendimientoNetoActividad = r(rendimientoNetoPrevio - deduccionDificilJustificacion);

  // Estimación tipo IRPF (escala general simplificada)
  let tipoIRPFEstimado: number;
  if (rendimientoNetoActividad <= 12450) tipoIRPFEstimado = 19;
  else if (rendimientoNetoActividad <= 20200) tipoIRPFEstimado = 24;
  else if (rendimientoNetoActividad <= 35200) tipoIRPFEstimado = 30;
  else if (rendimientoNetoActividad <= 60000) tipoIRPFEstimado = 37;
  else if (rendimientoNetoActividad <= 300000) tipoIRPFEstimado = 45;
  else tipoIRPFEstimado = 47;

  const cuotaIRPFEstimada = rendimientoNetoActividad > 0
    ? r(rendimientoNetoActividad * tipoIRPFEstimado / 100)
    : 0;

  advertencias.push(`Gastos de difícil justificación: solo aplicable en estimación directa SIMPLIFICADA. El ${PCT_DIFICIL_JUSTIFICACION_EDS}% del rendimiento neto previo, con un máximo de ${LIMITE_DIFICIL_JUSTIFICACION.toLocaleString('es-ES')} €/año (art. 30.2.4 RIRPF).`);
  advertencias.push('El vehículo de uso mixto (laboral y personal) NO es deducible en estimación directa salvo que se acredite uso exclusivo para la actividad (muy restrictivo según AEAT). Para agentes comerciales y transporte: posible 100%.');
  advertencias.push('La cuota IRPF estimada es orientativa y no considera reducciones personales y familiares, rendimientos del capital, otras fuentes ni el mínimo personal exento. Use calcular_irpf para un cálculo más preciso.');

  return {
    ingresosBrutos: r(p.ingresosBrutos),
    gastos,
    totalGastosDeducibles,
    rendimientoNetoPrevio,
    deduccionDificilJustificacion,
    rendimientoNetoActividad,
    tipoIRPFEstimado,
    cuotaIRPFEstimada,
    advertencias,
    fuenteDatos: 'LIRPF arts. 28-30 + RIRPF arts. 28-30 + DGT consultas vinculantes — vigente 2025',
  };
}
