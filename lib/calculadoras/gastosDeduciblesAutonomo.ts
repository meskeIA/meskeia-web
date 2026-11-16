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
 *   3. VEHICULO (art. 22.2 y 22.4 RIRPF, VEHICULOS_AFECTACION_IRPF de data/fiscal/estimacion-directa.ts):
 *      - Turismo de uso mixto (actividad + fines privados): 0 % en IRPF. No está afecto.
 *      - Afecto en exclusiva, o en uno de los cinco supuestos del art. 22.4 (mixtos de mercancías,
 *        transporte de viajeros, autoescuela, representantes o agentes comerciales, cesión habitual
 *        y onerosa): 100 %.
 *      ⚠️ Hasta el 16/11/2026 deducía el 50 % del uso mixto «igual que en IVA». Ese 50 % es la
 *        presunción del art. 95.3 de la Ley del IVA y no vale en el IRPF.
 *
 *   4. DIETAS Y GASTOS DE MANUTENCIÓN:
 *      Solo deducibles si se realizan fuera del municipio del local/domicilio fiscal
 *      Limites: los de las dietas de manutencion de los trabajadores (art. 30.2.5.ª.c LIRPF ->
 *      art. 9.A.3.a RIRPF), que la nota de la linea toma de DIETAS_MANUTENCION_EXENTAS de
 *      data/fiscal/retribuciones-exentas.ts desde el 29/10/2026 (cabo C0183)
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
 *   PROVISIONES Y GASTOS DE DIFICIL JUSTIFICACION (E.D. Simplificada, art. 30.2.ª RIRPF):
 *   5 % del rendimiento neto positivo con tope de 2.000 EUR/año, de `reduccionGastosDificilJustificacion`
 *   (data/fiscal/estimacion-directa.ts). Necesita los ingresos de la actividad.
 *   ⚠️ Hasta el 16/11/2026 aplicaba el 5 % al SALDO DE DEUDORES al cierre, sin tope: otra base y
 *     otra cifra para el mismo artículo que el resto del repositorio ya calculaba bien.
 *
 * Fuente: LIRPF arts. 28-30 + RIRPF arts. 22 y 30
 * Verificado: vehículo y difícil justificación, 2026-11-16 (auditoría de motores con consumidor).
 * Los límites del seguro médico (500 / 1.500 EUR) y el 30 % de los suministros siguen escritos
 * aquí: no se cotejaron en esa auditoría.
 *
 * Encadenable con: calcular_irpf, calcular_autonomos_cuota_ss, calcular_modelo_130
 */

import {
  DIETAS_MANUTENCION_EXENTAS,
  VEHICULOS_AFECTACION_IRPF,
  GASTOS_DIFICIL_JUSTIFICACION_EDS,
  reduccionGastosDificilJustificacion,
} from '@/data/fiscal';

// --- Constantes ---

const fmtEur = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const { espana: DIETA_ESPANA, extranjero: DIETA_EXTRANJERO } = DIETAS_MANUTENCION_EXENTAS;
const NOTA_LIMITES_DIETAS =
  `Límites diarios: ${fmtEur(DIETA_ESPANA.sinPernocta)} EUR (sin pernocta) / ${fmtEur(DIETA_ESPANA.conPernocta)} EUR (con pernocta) en España; ` +
  `${fmtEur(DIETA_EXTRANJERO.sinPernocta)} EUR / ${fmtEur(DIETA_EXTRANJERO.conPernocta)} EUR en el extranjero`;

const PCT_SUMINISTROS_VIVIENDA = 30;         // % de los suministros × % afectacion
const LIMITE_SEGURO_MEDICO_PP = 500;         // EUR/ano por el autonomo
const LIMITE_SEGURO_MEDICO_FAMILIAR = 500;   // EUR/ano por conyuge / cada hijo < 25a
const LIMITE_SEGURO_MEDICO_DISCAPACIDAD = 1_500; // EUR/ano por persona con discapacidad

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
  /**
   * Ingresos de la actividad en el año (EUR). Solo en ED simplificada: con ellos se calcula el 5 %
   * de provisiones y gastos de difícil justificación sobre el rendimiento neto (art. 30.2.ª RIRPF).
   */
  ingresosAnuales?: number;
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
  /** Provisiones y gastos de difícil justificación de la ED simplificada (0 si no aplica o faltan los ingresos) */
  gastosDificilJustificacion: number;
  /** Total gastos deducibles incluyendo los de difícil justificación (EUR) */
  totalGastosConDificilJustificacion: number;
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
    const afecto = p.vehiculo.tipoActividad === 'si_exclusivo';
    const pct = afecto ? VEHICULOS_AFECTACION_IRPF.pctAfecto : VEHICULOS_AFECTACION_IRPF.pctUsoMixto;
    const totalV = p.vehiculo.totalGastosVehiculo + (p.vehiculo.amortizacionVehiculo ?? 0);
    const imp = r(totalV * pct / 100);
    lineas.push({ concepto: 'Gastos de vehículo', gastoTotal: r(totalV), porcentajeDeducible: pct, importeDeducible: imp,
      nota: afecto
        ? '100 % — vehículo afecto en exclusiva a la actividad o en un supuesto del art. 22.4 RIRPF'
        : '0 % en IRPF — un turismo de uso mixto no está afecto a la actividad (art. 22.2 y 22.4 RIRPF)' });
    advertencias.push(afecto
      ? 'VEHICULO: el 100 % exige que el vehículo se use solo para la actividad, o que sea uno de estos supuestos del ' +
        `art. 22.4 RIRPF: ${VEHICULOS_AFECTACION_IRPF.excepciones.join('; ')}. La carga de la prueba es del autónomo.`
      : 'VEHICULO: en el IRPF un turismo que también se usa para fines privados no es deducible (art. 22.2 RIRPF), ' +
        'salvo los supuestos tasados del art. 22.4 (mixtos de mercancías, transporte de viajeros, autoescuela, ' +
        'representantes o agentes comerciales y cesión habitual y onerosa). El 50 % de uso mixto es una presunción ' +
        'del IVA (art. 95.3 de la Ley del IVA), no del IRPF.'
    );
  }

  // 11. Dietas
  if (p.dietasPagadasConTarjeta && p.dietasPagadasConTarjeta > 0) {
    lineas.push({ concepto: 'Dietas pagadas con tarjeta (fuera del municipio)', gastoTotal: p.dietasPagadasConTarjeta, porcentajeDeducible: 100, importeDeducible: r(p.dietasPagadasConTarjeta),
      nota: NOTA_LIMITES_DIETAS });
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

  // Provisiones y gastos de difícil justificación (solo ED simplificada, art. 30.2.ª RIRPF):
  // un % del rendimiento neto positivo, excluido este concepto, con tope anual.
  let gastosDificilJustificacion = 0;
  if (p.modalidad === 'simplificada') {
    const { porcentaje, limiteAnual } = GASTOS_DIFICIL_JUSTIFICACION_EDS;
    if (p.ingresosAnuales !== undefined) {
      gastosDificilJustificacion = r(reduccionGastosDificilJustificacion(p.ingresosAnuales - totalGastosDeducibles));
      advertencias.push(
        `DIFICIL JUSTIFICACION: en estimacion directa simplificada se deduce el ${porcentaje} % del rendimiento ` +
        `neto positivo (ingresos menos gastos), con un maximo de ${limiteAnual.toLocaleString('es-ES')} EUR al ano ` +
        `para todas las actividades: ${fmtEur(gastosDificilJustificacion)} EUR. Cubre las provisiones, que no se ` +
        'deducen aparte. No se aplica si se usa la reduccion del art. 32.2.1.º LIRPF (un unico cliente no vinculado).'
      );
    } else {
      advertencias.push(
        `DIFICIL JUSTIFICACION: en estimacion directa simplificada se deduce ademas el ${porcentaje} % del ` +
        `rendimiento neto positivo, con un maximo de ${limiteAnual.toLocaleString('es-ES')} EUR al ano; ` +
        'indique los ingresos de la actividad para calcularlo.'
      );
    }
  }

  const totalGastosConDificilJustificacion = r(totalGastosDeducibles + gastosDificilJustificacion);

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
    gastosDificilJustificacion,
    totalGastosConDificilJustificacion,
    advertencias,
    fuenteDatos: 'LIRPF arts. 28-30 + RIRPF arts. 22 y 30 — vehículo y difícil justificación verificados el 16/11/2026',
  };
}
