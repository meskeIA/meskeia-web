/**
 * Calculadora de Impuesto sobre Sociedades (IS) — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_impuesto_sociedades)
 *
 * Calcula la cuota del IS para sociedades españolas, aplicando los tipos
 * vigentes en 2026 y las principales deducciones (LIS arts. 19, 29, 68).
 *
 * Tipos de gravamen 2026 (LIS art. 29, modificado por Ley 7/2024):
 *   - General: 25%
 *   - Nueva empresa (primeros 2 años con base positiva): 15%
 *   - Microempresas / PYME (cifra de negocios < 1M€): escala progresiva
 *     19% hasta 50.000 € de base imponible / 21% el resto (Ley 7/2024, DT 44ª LIS).
 *     Sustituye al antiguo tipo plano del 23% ('pyme', Ley 31/2022) y a la
 *     categoría 'microempresa' al 20% con requisito de plantilla < 10, que
 *     era una propuesta del Proyecto de Ley de Presupuestos 2025 que no llegó
 *     a incorporarse a la ley finalmente aprobada. Ambos regímenes ('pyme' y
 *     'microempresa') aplican hoy la misma escala progresiva.
 *   - Cooperativas protegidas: 20%
 *   - Entidades sin ánimo de lucro (régimen fiscal especial): 10%
 *   - Entidades de crédito y exploración hidrocarburos: 30%
 *   - SOCIMI: 0% (retención 19% dividendos)
 *
 * Principales deducciones (LIS Título VI):
 *   - Por I+D+i (art. 35): 25% gastos I+D, 42% si supera media 2 años, 8% innovación
 *   - Por inversiones en producciones cinematográficas (art. 36): 30%/25%
 *   - Por creación de empleo (art. 37): 3.000 €/trabajador discapacitado
 *   - Deducción por donativos (art. 20 Ley 49/2002): 35%/40% en donaciones
 *   - Reserva de capitalización (art. 25): 10% del incremento fondos propios
 *   - Reserva de nivelación PYME (art. 105): hasta 10% base imponible
 *
 * Fuente: LIS (Ley 27/2014) arts. 19, 25, 29, 35-37, 105, 68, modificada por
 * Ley 7/2024, de 20 de diciembre — vigente 2026
 * Verificado: 2026-06-10
 *
 * Encadenable con: calcular_dividendo_empresarial, comparar_autonomo_vs_sl, calcular_iva
 */

import { calcularCuotaISMicropyme, TRAMOS_IS_MICROPYMES_2026 } from '@/data/fiscal';

// ─── Constantes 2026 ────────────────────────────────────────────────────────────

const TIPO_GENERAL = 25;
const TIPO_PYME = 23;               // % — ⚠️ OBSOLETO: tipo plano vigente solo hasta el ejercicio 2024 (Ley 31/2022, CN < 1M€). Desde 2025 se aplica la escala progresiva de TRAMOS_IS_MICROPYMES_2026 (calcularCuotaISMicropyme). Se conserva como referencia histórica.
const TIPO_NUEVA_EMPRESA = 15;      // Primeros 2 ejercicios con BI positiva
const TIPO_MICROEMPRESA = 20;       // % — ⚠️ OBSOLETO: categoría (CN < 1M€ + < 10 empleados) basada en una propuesta del Proyecto de Ley de Presupuestos 2025 que no se incorporó a la ley aprobada. La Ley 7/2024 unifica esta categoría con 'pyme' bajo la misma escala progresiva (TRAMOS_IS_MICROPYMES_2026). Se conserva como referencia histórica.
const TIPO_COOPERATIVA = 20;
const TIPO_SIN_ANIMO_LUCRO = 10;
const TIPO_CREDITO_HIDROCARBUROS = 30;

const LIMITE_CN_PYME = 1_000_000;   // €
const PCT_RESERVA_CAPITALIZACION = 10;
const PCT_RESERVA_NIVELACION_MAX = 10;
const LIMITE_RESERVA_NIVELACION = 1_000_000;
const PCT_DEDUCCION_IDI_BASICO = 25;
const PCT_DEDUCCION_IDI_EXCESO = 42;
const PCT_DEDUCCION_INNOVACION = 8;
const DEDUCCION_EMPLEO_DISCAPACIDAD = 3000; // €/trabajador

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type RegimenIS =
  | 'general'
  | 'pyme'
  | 'nueva_empresa'
  | 'microempresa'
  | 'cooperativa'
  | 'sin_animo_lucro'
  | 'credito_hidrocarburos';

export interface DeduccionIS {
  concepto: string;
  baseDeduccion: number;
  porcentaje: number;
  importeDeduccion: number;
  limiteAplicado?: number;
}

export interface ParametrosImpuestoSociedades {
  /** Régimen fiscal de la sociedad */
  regimenFiscal: RegimenIS;
  /** Base imponible del ejercicio (€) — resultado contable ± ajustes extracontables */
  baseImponible: number;
  /** Cifra de negocios del ejercicio anterior (€) — para verificar tipo PYME */
  cifraNegociosAnterior?: number;
  /** ¿Es el primero o segundo ejercicio con base imponible positiva? (nueva empresa) */
  esNuevaEmpresa?: boolean;
  /** Gastos en I+D del ejercicio (€) */
  gastosIDi?: number;
  /** Media de gastos I+D de los 2 ejercicios anteriores (€) — para deducción exceso */
  mediaGastosIDiAnteriores?: number;
  /** Gastos en innovación tecnológica (€) (art. 35.2 LIS) */
  gastosInnovacion?: number;
  /** Número de trabajadores con discapacidad ≥ 33% contratados en el ejercicio */
  trabajadoresDiscapacidadContratados?: number;
  /** Incremento de fondos propios para reserva de capitalización (€) */
  incrementoFondosPropios?: number;
  /** Cuota íntegra de ejercicios anteriores pendiente de compensar (€) */
  bonificacionesPendientes?: number;
  /** Retenciones y pagos fraccionados (modelo 202) ya realizados (€) */
  retencionesYPagosFraccionados?: number;
}

export interface ResultadoImpuestoSociedades {
  /** Régimen fiscal aplicado */
  regimenFiscal: RegimenIS;
  /** Tipo de gravamen aplicado (%) */
  tipoGravamen: number;
  /** Base imponible (€) */
  baseImponible: number;
  /** Reserva de capitalización aplicada (€) — reduce la base imponible */
  reservaCapitalizacion: number;
  /** Reserva de nivelación (PYME) aplicada (€) */
  reservaNivelacion: number;
  /** Base liquidable (€) */
  baseLiquidable: number;
  /** Cuota íntegra (€) */
  cuotaIntegra: number;
  /** Deducciones aplicadas (detalle) */
  deducciones: DeduccionIS[];
  /** Total deducciones (€) */
  totalDeducciones: number;
  /** Cuota líquida (€) */
  cuotaLiquida: number;
  /** Retenciones y pagos fraccionados (€) */
  retencionesYPagosFraccionados: number;
  /** **Cuota diferencial a ingresar/devolver (€)** */
  cuotaDiferencial: number;
  /** Tipo efectivo sobre base imponible (%) */
  tipoEfectivo: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const r = (n: number) => Math.round(n * 100) / 100;

function getTipoGravamen(regimen: RegimenIS): number {
  switch (regimen) {
    case 'general': return TIPO_GENERAL;
    case 'pyme': return TIPO_PYME;
    case 'nueva_empresa': return TIPO_NUEVA_EMPRESA;
    case 'microempresa': return TIPO_MICROEMPRESA;
    case 'cooperativa': return TIPO_COOPERATIVA;
    case 'sin_animo_lucro': return TIPO_SIN_ANIMO_LUCRO;
    case 'credito_hidrocarburos': return TIPO_CREDITO_HIDROCARBUROS;
    default: return TIPO_GENERAL;
  }
}

/**
 * Calcula la cuota íntegra y el tipo medio aplicado sobre la base liquidable.
 * Para 'pyme' y 'microempresa' (CN < 1M€) aplica la escala progresiva de
 * TRAMOS_IS_MICROPYMES_2026 (Ley 7/2024) en lugar de un tipo plano.
 */
function calcularCuotaIS(baseLiquidable: number, regimen: RegimenIS): { cuota: number; tipoAplicado: number } {
  if (regimen === 'pyme' || regimen === 'microempresa') {
    const cuota = r(calcularCuotaISMicropyme(baseLiquidable));
    const tipoAplicado = baseLiquidable > 0 ? r((cuota / baseLiquidable) * 100) : TRAMOS_IS_MICROPYMES_2026[0].tipo;
    return { cuota, tipoAplicado };
  }
  const tipo = getTipoGravamen(regimen);
  return { cuota: r(baseLiquidable * tipo / 100), tipoAplicado: tipo };
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularImpuestoSociedades(p: ParametrosImpuestoSociedades): ResultadoImpuestoSociedades {
  const advertencias: string[] = [];
  const deducciones: DeduccionIS[] = [];

  // Verificar coherencia de régimen
  if ((p.regimenFiscal === 'pyme' || p.regimenFiscal === 'microempresa') && p.cifraNegociosAnterior !== undefined && p.cifraNegociosAnterior >= LIMITE_CN_PYME) {
    advertencias.push(`La cifra de negocios indicada (${p.cifraNegociosAnterior.toLocaleString('es-ES')} €) supera el límite de microempresa/PYME (${LIMITE_CN_PYME.toLocaleString('es-ES')} €). Revisar el régimen fiscal aplicable.`);
  }

  // Reserva de capitalización (art. 25 LIS) — reduce base imponible
  let reservaCapitalizacion = 0;
  if (p.incrementoFondosPropios && p.incrementoFondosPropios > 0) {
    const maxReservaCapitalizacion = r(p.baseImponible * PCT_RESERVA_CAPITALIZACION / 100);
    reservaCapitalizacion = r(Math.min(
      p.incrementoFondosPropios * PCT_RESERVA_CAPITALIZACION / 100,
      maxReservaCapitalizacion
    ));
  }

  // Reserva de nivelación (art. 105 LIS) — solo PYME/microempresa
  let reservaNivelacion = 0;
  if (['pyme', 'microempresa'].includes(p.regimenFiscal) && p.baseImponible > 0) {
    const maxNivelacion = r(Math.min(
      p.baseImponible * PCT_RESERVA_NIVELACION_MAX / 100,
      LIMITE_RESERVA_NIVELACION
    ));
    reservaNivelacion = maxNivelacion; // Asumimos que la aplica al máximo si cumple requisitos
    advertencias.push(`Reserva de nivelación (art. 105 LIS): ${reservaNivelacion.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € de reducción en la base imponible (hasta 10%, máx. 1M€). Debe dotarse efectivamente en los fondos propios. Si en los 5 años siguientes hay bases negativas, se revierte.`);
  }

  const baseLiquidable = r(Math.max(0, p.baseImponible - reservaCapitalizacion - reservaNivelacion));
  const { cuota: cuotaIntegra, tipoAplicado: tipoGravamen } = calcularCuotaIS(baseLiquidable, p.regimenFiscal);

  // Deducciones I+D+i (art. 35 LIS)
  if (p.gastosIDi && p.gastosIDi > 0) {
    const mediaAnterior = p.mediaGastosIDiAnteriores ?? 0;
    const baseBasica = r(Math.min(p.gastosIDi, mediaAnterior > 0 ? mediaAnterior : p.gastosIDi));
    const baseExceso = mediaAnterior > 0 ? r(Math.max(0, p.gastosIDi - mediaAnterior)) : 0;
    const importeIDi = r(baseBasica * PCT_DEDUCCION_IDI_BASICO / 100 + baseExceso * PCT_DEDUCCION_IDI_EXCESO / 100);
    // Límite: 25% de la cuota íntegra (o 50% si > 10% de la cuota)
    const limiteIDi = importeIDi > cuotaIntegra * 0.10 ? r(cuotaIntegra * 0.50) : r(cuotaIntegra * 0.25);
    deducciones.push({
      concepto: 'Investigación y Desarrollo (art. 35.1 LIS)',
      baseDeduccion: r(p.gastosIDi),
      porcentaje: PCT_DEDUCCION_IDI_BASICO,
      importeDeduccion: r(Math.min(importeIDi, limiteIDi)),
      limiteAplicado: limiteIDi,
    });
  }

  // Deducciones innovación tecnológica (art. 35.2 LIS)
  if (p.gastosInnovacion && p.gastosInnovacion > 0) {
    const importeInnovacion = r(p.gastosInnovacion * PCT_DEDUCCION_INNOVACION / 100);
    const limiteInnovacion = r(cuotaIntegra * 0.25);
    deducciones.push({
      concepto: 'Innovación tecnológica (art. 35.2 LIS)',
      baseDeduccion: r(p.gastosInnovacion),
      porcentaje: PCT_DEDUCCION_INNOVACION,
      importeDeduccion: r(Math.min(importeInnovacion, limiteInnovacion)),
      limiteAplicado: limiteInnovacion,
    });
  }

  // Deducción por empleo de discapacitados (art. 37 LIS)
  if (p.trabajadoresDiscapacidadContratados && p.trabajadoresDiscapacidadContratados > 0) {
    const importeDiscapacidad = p.trabajadoresDiscapacidadContratados * DEDUCCION_EMPLEO_DISCAPACIDAD;
    deducciones.push({
      concepto: `Empleo trabajadores discapacidad ≥ 33% (art. 37 LIS) — ${p.trabajadoresDiscapacidadContratados} persona(s)`,
      baseDeduccion: p.trabajadoresDiscapacidadContratados,
      porcentaje: 0,
      importeDeduccion: r(importeDiscapacidad),
    });
  }

  // Bonificaciones pendientes de ejercicios anteriores
  if (p.bonificacionesPendientes && p.bonificacionesPendientes > 0) {
    deducciones.push({
      concepto: 'Deducciones pendientes de ejercicios anteriores',
      baseDeduccion: r(p.bonificacionesPendientes),
      porcentaje: 0,
      importeDeduccion: r(p.bonificacionesPendientes),
    });
  }

  const totalDeducciones = r(deducciones.reduce((s, d) => s + d.importeDeduccion, 0));
  const cuotaLiquida = r(Math.max(0, cuotaIntegra - totalDeducciones));
  const retencionesYPagos = r(p.retencionesYPagosFraccionados ?? 0);
  const cuotaDiferencial = r(cuotaLiquida - retencionesYPagos);
  const tipoEfectivo = p.baseImponible > 0 ? r(cuotaLiquida / p.baseImponible * 100) : 0;

  advertencias.push('El IS se liquida anualmente (modelo 200). Los pagos fraccionados (modelo 202) se realizan en abril, octubre y diciembre.');
  advertencias.push('La base imponible del IS parte del resultado contable, con los ajustes extracontables previstos en la LIS (diferencias permanentes y temporarias). Esta calculadora toma la base imponible ya calculada.');
  if (p.regimenFiscal === 'pyme' || p.regimenFiscal === 'microempresa') {
    advertencias.push(`Desde el ejercicio 2025, las entidades con cifra de negocio inferior a 1.000.000 € tributan según la escala progresiva de la Ley 7/2024 (en 2026: 19% hasta 50.000 € de base imponible y 21% por el resto), no por un tipo plano. El tipo medio resultante en este cálculo es del ${tipoGravamen.toFixed(2).replace('.', ',')}%.`);
  }
  if (p.regimenFiscal === 'nueva_empresa') {
    advertencias.push('Tipo reducido 15% para nuevas empresas: aplica en el primer ejercicio con base imponible positiva y en el siguiente. Posterior a estos 2 ejercicios, se aplica el tipo general o el de microempresa/PYME según corresponda.');
  }
  if (reservaCapitalizacion > 0) {
    advertencias.push(`Reserva de capitalización (art. 25 LIS): ${reservaCapitalizacion.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € de reducción. Debe mantenerse en fondos propios durante 5 años y no puede distribuirse como dividendo.`);
  }

  return {
    regimenFiscal: p.regimenFiscal,
    tipoGravamen,
    baseImponible: r(p.baseImponible),
    reservaCapitalizacion,
    reservaNivelacion,
    baseLiquidable,
    cuotaIntegra,
    deducciones,
    totalDeducciones,
    cuotaLiquida,
    retencionesYPagosFraccionados: retencionesYPagos,
    cuotaDiferencial,
    tipoEfectivo,
    advertencias,
    fuenteDatos: 'LIS (Ley 27/2014) arts. 19, 25, 29, 35-37, 105, modificada por Ley 7/2024 (escala microempresas) — vigente 2026',
  };
}
