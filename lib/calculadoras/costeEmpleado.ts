/**
 * Calculadora de Coste Real de un Empleado — lógica pura sin React ni DOM
 * Usada por: /chatgpt/coste-empleado
 *
 * Calcula el coste total para el empleador: salario bruto + cuotas
 * de Seguridad Social a cargo de la empresa (contingencias comunes,
 * desempleo, FP, FOGASA, MEI y accidentes de trabajo).
 *
 * Fuente: Orden PJC/297/2026 de cotización SS + Estatuto de los Trabajadores
 *
 * Hasta el 09/10/2026 (cabos C0001 y C0075) llevaba una copia propia de los tipos de 2025 SIN
 * el MEI de empresa (0,75 % en 2026), y subía la base a la mínima de jornada COMPLETA: con
 * 14.000 €/año daba una base de 1.424,40 € en vez de 1.166,67 € (+971 € de cuotas). Un sueldo
 * por debajo de esa mínima solo es legal a jornada parcial, cuya base mínima es por horas y
 * queda por debajo: la base es el propio sueldo prorrateado.
 */

import { BASES_SS_2026, COTIZACION_EMPRESA_2026 } from '@/data/fiscal';

// ─── Tipos de accidentes de trabajo ─────────────────────────────────────────────

// El tipo AT/EP real depende del CNAE (tarifa de primas, DA 61.ª LGSS): aquí, medias orientativas
const TIPOS_AT_ORIENTATIVOS = {
  oficina:               1.50,  // % — media orientativa actividades de oficina
  comercio:              1.80,  // % — media orientativa comercio/hostelería
  construccion:          6.70,  // % — construcción (la más alta)
  industrial:            2.80,  // % — industria media
};

const FUENTE_DATOS = 'Orden PJC/297/2026 de cotización a la Seguridad Social. Tipos vigentes 2026.';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoContrato = 'indefinido' | 'temporal';
export type SectorActividad = 'oficina' | 'comercio' | 'industrial' | 'construccion';

export interface ParametrosCosteEmpleado {
  /** Salario bruto anual del empleado (€) */
  salarioBrutoAnual: number;
  /** Tipo de contrato */
  tipoContrato?: TipoContrato;
  /** Sector de actividad (para tipo AT/EP) */
  sector?: SectorActividad;
  /** Beneficios extra anuales (seguro médico, tickets restaurante, etc.) (€) */
  beneficiosExtra?: number;
  /** Número de pagas del empleado (12 o 14) */
  pagas?: 12 | 14;
}

export interface ResultadoCosteEmpleado {
  /** Salario bruto anual */
  salarioBrutoAnual: number;
  /** Salario bruto mensual */
  salarioBrutoMensual: number;
  /** Base de cotización mensual: el sueldo prorrateado, con el tope máximo */
  baseCotizacion: number;
  /** Desglose cuotas empresa anuales */
  cuotas: {
    contingenciasComunes: number;
    desempleo: number;
    formacionProfesional: number;
    fogasa: number;
    mei: number;
    accidentesTrabajo: number;
    total: number;
  };
  /** Tipos aplicados */
  tipos: {
    contingenciasComunes: number;
    desempleo: number;
    formacionProfesional: number;
    fogasa: number;
    mei: number;
    accidentesTrabajo: number;
    totalSS: number;
  };
  /** Beneficios extra anuales */
  beneficiosExtra: number;
  /** Coste total anual para la empresa */
  costeTotalAnual: number;
  /** Coste total mensual */
  costeTotalMensual: number;
  /** Ratio coste/salario bruto (%) */
  sobrecoste: number;
  /** Fuente normativa */
  fuenteDatos: string;
  /** Avisos sobre la base (sueldo bajo la mínima de jornada completa o sobre el tope) */
  advertencias: string[];
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularCosteEmpleado(p: ParametrosCosteEmpleado): ResultadoCosteEmpleado {
  if (p.salarioBrutoAnual <= 0) throw new Error('El salario bruto anual debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const tipoContrato = p.tipoContrato ?? 'indefinido';
  const sector = p.sector ?? 'oficina';
  const beneficiosExtra = p.beneficiosExtra ?? 0;

  const salarioBrutoMensual = r(p.salarioBrutoAnual / 12);

  // Base de cotización: el sueldo prorrateado (incluye la parte de las pagas extra, art. 147
  // LGSS) con el tope máximo. NO se sube a la mínima de jornada completa: por debajo de ella
  // solo cabe la jornada parcial (cabecera)
  const baseSinTope = p.salarioBrutoAnual / 12;
  const baseCotizacion = Math.min(baseSinTope, BASES_SS_2026.maxima);
  const advertencias: string[] = [];
  if (baseSinTope < BASES_SS_2026.minima) {
    advertencias.push(
      `El sueldo queda por debajo de la base mínima de jornada completa (${BASES_SS_2026.minima} €/mes): ` +
      'se calcula como jornada parcial, con el propio sueldo como base. A jornada completa no sería legal.'
    );
  }
  if (baseSinTope > BASES_SS_2026.maxima) {
    advertencias.push(`La base se limita al tope máximo de ${BASES_SS_2026.maxima} €/mes.`);
  }

  // Tipos aplicados
  const T = COTIZACION_EMPRESA_2026;
  const tipoDesempleo = tipoContrato === 'indefinido' ? T.desempleoIndefinido : T.desempleoTemporal;
  const tipoAT = TIPOS_AT_ORIENTATIVOS[sector];
  const tipoTotalSS = (
    T.contingenciasComunes +
    tipoDesempleo +
    T.formacionProfesional +
    T.fogasa +
    T.mei +
    tipoAT
  );

  // Cuotas mensuales → × 12 para anual
  const ccMensual = baseCotizacion * (T.contingenciasComunes / 100);
  const desempleoMensual = baseCotizacion * (tipoDesempleo / 100);
  const fpMensual = baseCotizacion * (T.formacionProfesional / 100);
  const fogasaMensual = baseCotizacion * (T.fogasa / 100);
  const meiMensual = baseCotizacion * (T.mei / 100);
  const atMensual = baseCotizacion * (tipoAT / 100);

  const cuotas = {
    contingenciasComunes: r(ccMensual * 12),
    desempleo: r(desempleoMensual * 12),
    formacionProfesional: r(fpMensual * 12),
    fogasa: r(fogasaMensual * 12),
    mei: r(meiMensual * 12),
    accidentesTrabajo: r(atMensual * 12),
    total: r((ccMensual + desempleoMensual + fpMensual + fogasaMensual + meiMensual + atMensual) * 12),
  };

  const costeTotalAnual = r(p.salarioBrutoAnual + cuotas.total + beneficiosExtra);
  const costeTotalMensual = r(costeTotalAnual / 12);
  const sobrecoste = r(((costeTotalAnual - p.salarioBrutoAnual) / p.salarioBrutoAnual) * 100);

  return {
    salarioBrutoAnual: r(p.salarioBrutoAnual),
    salarioBrutoMensual,
    baseCotizacion: r(baseCotizacion),
    cuotas,
    tipos: {
      contingenciasComunes: T.contingenciasComunes,
      desempleo: tipoDesempleo,
      formacionProfesional: T.formacionProfesional,
      fogasa: T.fogasa,
      mei: T.mei,
      accidentesTrabajo: tipoAT,
      totalSS: r(tipoTotalSS),
    },
    beneficiosExtra,
    costeTotalAnual,
    costeTotalMensual,
    sobrecoste,
    fuenteDatos: FUENTE_DATOS,
    advertencias,
  };
}
