/**
 * Calculadora de Gastos Deducibles del Autonomo en IRPF (Estimacion Directa)
 * Usada por: MCP server (calcular_gastos_deducibles_autonomo)
 *
 * Calcula los gastos fiscalmente deducibles en el IRPF para un trabajador
 * autonomo en regimen de Estimacion Directa (Normal o Simplificada),
 * aplicando los porcentajes y limites que establece la AEAT.
 *
 * Marco normativo:
 *   - LIRPF arts. 28-30: normas de determinacion del rendimiento neto actividades
 *   - LIS arts. 10-24: gastos deducibles (aplicables por remision)
 *   - DGT consultas vinculantes: criterios de deducibilidad
 *   - RIRPF art. 22: deduccion por suministros vivienda habitual
 *
 * GASTOS DEDUCIBLES — REGLAS ESPECIALES IRPF AUTONOMO:
 *
 *   1. LOCAL COMERCIAL:
 *      Si es local independiente: 100% deducible (alquiler, suministros, IBI, etc.)
 *      Si trabaja desde casa (vivienda habitual): solo el PORCENTAJE de la vivienda
 *      afecta a la actividad (metros cuadrados del despacho / total vivienda)
 *
 *   2. SUMINISTROS (LUZ, AGUA, GAS, INTERNET) — VIVIENDA HABITUAL:
 *      Porcentaje de la vivienda afecta a la actividad × 30% de los suministros
 *      (RIRPF art. 22: formula 30% × % afectacion)
 *      Si hay local independiente: 100% deducibles sin formula
 *
 *   3. VEHICULO:
 *      - Autonomo en actividad NO exclusivamente de transporte: 50% deducible
 *        (IVA solo deducible al 50%; en IRPF igual)
 *      - Actividad exclusiva de transporte/alquiler veh.: 100% deducible
 *      - Si el vehiculo es de la empresa (SL): 100% si exclusivamente empresa
 *
 *   4. DIETAS Y GASTOS DE MANUTENCIÓN:
 *      Solo deducibles si se realizan fuera del municipio del local/domicilio fiscal
 *      Limites: 26,67 EUR/dia (sin pernocta) o 53,34 EUR/dia (con pernocta) en España
 *      En extranjero: 48,08 EUR (sin pernocta) o 91,35 EUR (con pernocta)
 *      Deben pagarse con tarjeta o transferencia (no efectivo)
 *
 *   5. SEGURIDAD SOCIAL (CUOTA AUTONOMO): 100% deducible
 *
 *   6. SEGUROS MEDICOS (LIRPF art. 30.2.5.o):
 *      Hasta 500 EUR/ano por el autonomo (si la prima es propia)
 *      Hasta 500 EUR adicionales por conyuge o cada hijo menor de 25 anos
 *      Con discapacidad: hasta 1.500 EUR por persona
 *
 *   7. GASTOS FINANCIEROS: 100% deducibles si son para la actividad
 *
 *   8. AMORTIZACIONES: segun tablas RIS (inmuebles 3%, mobiliario 10%, equipos 25%, etc.)
 *
 *   PROVISION DE INSOLVENCIAS (E.D. Simplificada):
 *   En E.D. Simplificada, provision global del 5% sobre saldo deudores al final del ano.
 *
 * Fuente: LIRPF arts. 28-30 + RIRPF art. 22 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_autonomos_cuota_ss, calcular_modelo_130
 */

// --- Constantes ---

const PCT_SUMINISTROS_VIVIENDA = 30;         // % de los suministros × % afectacion
const PCT_VEHICULO_NO_EXCLUSIVO = 50;        // % deducible si actividad no de transporte
const LIMITE_SEGURO_MEDICO_PP = 500;         // EUR/ano por el autonomo
const LIMITE_SEGURO_MEDICO_FAMILIAR = 500;   // EUR/ano por conyuge / cada hijo < 25a
const LIMITE_SEGURO_MEDICO_DISCAPACIDAD = 1_500; // EUR/ano por persona con discapacidad
const PROVISION_GLOBAL_ED_SIMPLIFICADA = 5; // % sobre saldo deudores al final del ejercicio

// --- Tipos publicos ---

export type ModalidadEstimacionDirectaGA = 'normal' | 'simplificada';
export type UsoVivienda = 'local_independiente' | 'vivienda_habitual';
export type ActividadTransporte = 'si_exclusivo' | 'no_exclusivo';

export interface GastosVehiculo {
  /** Importe total de gastos del vehiculo en el ano (combustible, seguro, ITV, reparaciones) (EUR) */
  totalGastosVehiculo: number;
  /** Cuota de amortizacion anual del vehiculo (si es de su propiedad) (EUR) */
  amortizacionVehiculo?: number;
  tipoActividad: ActividadTransporte;
}

export interface ParametrosGastosDeduciblesAutonomo {
  modalidad: ModalidadEstimacionDirectaGA;
  tipoLocal: UsoVivienda;
  /** Solo si tipoLocal = vivienda_habitual: porcentaje de la vivienda afecta a actividad (%) */
  pctViviendaAfecta?: number;
  /** Gastos de local o alquiler de oficina (EUR/ano) */
  gastoLocal?: number;
  /** Gastos de suministros (luz, agua, gas, internet) de la vivienda/local (EUR/ano) */
  gastosSubministros?: number;
  /** Cuota de autonomo SS (RETA o SETA) (EUR/ano) */
  cuotaAutonomo?: number;
  /** Gastos de personal (nominas de empleados, SS empresa) (EUR/ano) */
  gastosPersonal?: number;
  /** Gastos de materiales y mercaderias (EUR/ano) */
  gastosCompras?: number;
  /** Gastos financieros (intereses prestamos actividad, comisiones bancarias) (EUR/ano) */
  gastosFinancieros?: number;
  /** Gastos de publicidad y marketing (EUR/ano) */
  gastosPublicidad?: number;
  /** Cuota de seguros medicos privados — autonomo + familia (EUR/ano) */
  segurosPrivadosMedicos?: number;
  /** Numero de familiares adicionales cubiertos (conyuge + hijos < 25a) sin discapacidad */
  numFamiliaresSeguroMedico?: number;
  /** Numero de familiares con discapacidad en el seguro medico */
  numFamiliaresDiscapacidad?: number;
  /** Amortizaciones de inmovilizado (equipos, mobiliario, software) (EUR/ano) */
  amortizaciones?: number;
  /** Otros gastos deducibles (formacion, suscripciones profesionales, etc.) (EUR/ano) */
  otrosGastos?: number;
  /** Gastos de vehiculo */
  vehiculo?: GastosVehiculo;
  /** Dietas pagadas con tarjeta (EUR/ano — ya aplicando los limites del RIRPF) */
  dietasPagadasConTarjeta?: number;
  /** Saldo de clientes/deudores al cierre del ejercicio (EUR) — para provision ED simplificada */
  saldoDeudoresFinAnio?: number;
}

export interface LineaGastoDeducible {
  concepto: string;
  gastoTotal: number;
  porcentajeDeducible: number;
  importeDeducible: number;
  nota?: string;
}

export interface ResultadoGastosDeduciblesAutonomo {
  modalidad: ModalidadEstimacionDirectaGA;
  lineas: LineaGastoDeducible[];
  /** Total gastos deducibles fiscalmente (EUR) */
  totalGastosDeducibles: number;
  /** Provision global ED simplificada (si aplica) */
  provisionGlobalED5pct: number;
  /** Total gastos deducibles incluyendo provision (EUR) */
  totalGastosConProvision: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularGastosDeduciblesAutonomo(
  p: ParametrosGastosDeduciblesAutonomo
): ResultadoGastosDeduciblesAutonomo {
  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const lineas: LineaGastoDeducible[] = [];

  const pctVivienda = p.pctViviendaAfecta ?? 0;
  const esLocal = p.tipoLocal === 'local_independiente';

  // 1. Gastos de local / alquiler
  if (p.gastoLocal && p.gastoLocal > 0) {
    const pct = esLocal ? 100 : pctVivienda;
    const imp = r(p.gastoLocal * pct / 100);
    lineas.push({ concepto: 'Alquiler / gastos local', gastoTotal: p.gastoLocal, porcentajeDeducible: pct, importeDeducible: imp,
      nota: esLocal ? undefined : `${pct}% por afectación de vivienda habitual` });
  }

  // 2. Suministros
  if (p.gastosSubministros && p.gastosSubministros > 0) {
    let pct: number;
    let nota: string;
    if (esLocal) {
      pct = 100;
      nota = 'Local independiente — 100% deducible';
    } else {
      pct = r(pctVivienda * PCT_SUMINISTROS_VIVIENDA / 100);
      nota = `${pctVivienda}% vivienda × 30% (RIRPF art. 22) = ${pct}%`;
    }
    const imp = r(p.gastosSubministros * pct / 100);
    lineas.push({ concepto: 'Suministros (luz, agua, gas, internet)', gastoTotal: p.gastosSubministros, porcentajeDeducible: pct, importeDeducible: imp, nota });
  }

  // 3. Cuota SS autonomo
  if (p.cuotaAutonomo && p.cuotaAutonomo > 0) {
    lineas.push({ concepto: 'Cuota SS autónomo (RETA)', gastoTotal: p.cuotaAutonomo, porcentajeDeducible: 100, importeDeducible: r(p.cuotaAutonomo) });
  }

  // 4. Personal
  if (p.gastosPersonal && p.gastosPersonal > 0) {
    lineas.push({ concepto: 'Gastos de personal (nóminas + SS empresa)', gastoTotal: p.gastosPersonal, porcentajeDeducible: 100, importeDeducible: r(p.gastosPersonal) });
  }

  // 5. Compras y materiales
  if (p.gastosCompras && p.gastosCompras > 0) {
    lineas.push({ concepto: 'Compras y materiales', gastoTotal: p.gastosCompras, porcentajeDeducible: 100, importeDeducible: r(p.gastosCompras) });
  }

  // 6. Gastos financieros
  if (p.gastosFinancieros && p.gastosFinancieros > 0) {
    lineas.push({ concepto: 'Gastos financieros (intereses, comisiones)', gastoTotal: p.gastosFinancieros, porcentajeDeducible: 100, importeDeducible: r(p.gastosFinancieros) });
  }

  // 7. Publicidad
  if (p.gastosPublicidad && p.gastosPublicidad > 0) {
    lineas.push({ concepto: 'Publicidad y marketing', gastoTotal: p.gastosPublicidad, porcentajeDeducible: 100, importeDeducible: r(p.gastosPublicidad) });
  }

  // 8. Seguros medicos privados
  if (p.segurosPrivadosMedicos && p.segurosPrivadosMedicos > 0) {
    const limiteTotal = LIMITE_SEGURO_MEDICO_PP +
      (p.numFamiliaresSeguroMedico ?? 0) * LIMITE_SEGURO_MEDICO_FAMILIAR +
      (p.numFamiliaresDiscapacidad ?? 0) * LIMITE_SEGURO_MEDICO_DISCAPACIDAD;
    const imp = r(Math.min(p.segurosPrivadosMedicos, limiteTotal));
    lineas.push({ concepto: 'Seguros médicos privados (LIRPF art. 30.2.5º)', gastoTotal: p.segurosPrivadosMedicos, porcentajeDeducible: r(imp / p.segurosPrivadosMedicos * 100), importeDeducible: imp,
      nota: `Límite: ${limiteTotal.toLocaleString('es-ES')} EUR (${LIMITE_SEGURO_MEDICO_PP} autonomo + familiares)` });
  }

  // 9. Amortizaciones
  if (p.amortizaciones && p.amortizaciones > 0) {
    lineas.push({ concepto: 'Amortizaciones (equipos, mobiliario, software)', gastoTotal: p.amortizaciones, porcentajeDeducible: 100, importeDeducible: r(p.amortizaciones) });
  }

  // 10. Vehiculo
  if (p.vehiculo && p.vehiculo.totalGastosVehiculo > 0) {
    const pct = p.vehiculo.tipoActividad === 'si_exclusivo' ? 100 : PCT_VEHICULO_NO_EXCLUSIVO;
    const totalV = p.vehiculo.totalGastosVehiculo + (p.vehiculo.amortizacionVehiculo ?? 0);
    const imp = r(totalV * pct / 100);
    lineas.push({ concepto: 'Gastos de vehículo', gastoTotal: r(totalV), porcentajeDeducible: pct, importeDeducible: imp,
      nota: pct < 100 ? `${pct}% — actividad no exclusiva de transporte (LIRPF art. 29.2)` : '100% — actividad exclusiva de transporte' });
    if (pct === PCT_VEHICULO_NO_EXCLUSIVO) {
      advertencias.push(
        'VEHICULO (50%): La AEAT acepta la deduccion del 50% del vehiculo solo si se ' +
        'puede acreditar un uso mixto (personal y profesional). Si el uso es exclusivamente ' +
        'profesional, puede intentar acreditar el 100% pero la carga de la prueba es muy exigente.'
      );
    }
  }

  // 11. Dietas
  if (p.dietasPagadasConTarjeta && p.dietasPagadasConTarjeta > 0) {
    lineas.push({ concepto: 'Dietas pagadas con tarjeta (fuera del municipio)', gastoTotal: p.dietasPagadasConTarjeta, porcentajeDeducible: 100, importeDeducible: r(p.dietasPagadasConTarjeta),
      nota: 'Límites: 26,67 EUR/día (sin pernocta) / 53,34 EUR/día (con pernocta) en España' });
    advertencias.push(
      'DIETAS: solo deducibles si se producen en municipio diferente al del domicilio fiscal, ' +
      'se pagan con tarjeta o transferencia (NO efectivo), y existen justificantes del desplazamiento ' +
      '(factura, programa de trabajo, cliente visitado).'
    );
  }

  // 12. Otros gastos
  if (p.otrosGastos && p.otrosGastos > 0) {
    lineas.push({ concepto: 'Otros gastos deducibles', gastoTotal: p.otrosGastos, porcentajeDeducible: 100, importeDeducible: r(p.otrosGastos) });
  }

  const totalGastosDeducibles = r(lineas.reduce((s, l) => s + l.importeDeducible, 0));

  // Provision global 5% (solo ED simplificada)
  let provisionGlobalED5pct = 0;
  if (p.modalidad === 'simplificada' && p.saldoDeudoresFinAnio && p.saldoDeudoresFinAnio > 0) {
    provisionGlobalED5pct = r(p.saldoDeudoresFinAnio * PROVISION_GLOBAL_ED_SIMPLIFICADA / 100);
    advertencias.push(
      'PROVISION GLOBAL ED SIMPLIFICADA: en estimacion directa simplificada puede deducirse ' +
      'el 5% del saldo de deudores al cierre del ejercicio como provision para insolvencias ' +
      '(' + provisionGlobalED5pct.toLocaleString('es-ES') + ' EUR). ' +
      'No compatible con la deduccion de insolvencias especificas del regimen general.'
    );
  }

  const totalGastosConProvision = r(totalGastosDeducibles + provisionGlobalED5pct);

  if (!esLocal && pctVivienda === 0) {
    advertencias.push(
      'VIVIENDA HABITUAL: ha indicado que trabaja desde casa pero no ha especificado el ' +
      'porcentaje de afectacion (metros cuadrados del despacho / total vivienda). ' +
      'Sin este dato, los gastos de local y suministros de vivienda se calculan al 0%.'
    );
  }

  return {
    modalidad: p.modalidad,
    lineas,
    totalGastosDeducibles,
    provisionGlobalED5pct,
    totalGastosConProvision,
    advertencias,
    fuenteDatos: 'LIRPF arts. 28-30 + RIRPF art. 22 — vigente 2025',
  };
}
