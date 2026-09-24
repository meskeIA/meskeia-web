/**
 * Calculadora de Sueldo Neto — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_sueldo_neto)
 *
 * Calcula la retención IRPF estimada y el sueldo neto mensual/anual
 * a partir del salario bruto anual (o a la inversa).
 *
 * Fuente: IRPF 2025 + SS cuenta ajena 2026
 */

import {
  calcularCuotaIntegraGeneral,
  MINIMOS_IRPF_2025,
  COTIZACIONES_SS_2026,
  BASES_SS_2026,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
  calcularReduccionRendimientosTrabajo,
  FISCAL_IRPF_META,
  calcularDeduccionRentasBajas,
  limitarDeduccionRendimientosTrabajo,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type SituacionFamiliar = 'soltero' | 'casado_sin_ingresos' | 'casado_con_ingresos';

export interface ParametrosSueldoNeto {
  /** Salario bruto anual (€) */
  brutoAnual: number;
  /** Situación familiar del contribuyente */
  situacion?: SituacionFamiliar;
  /** Número total de hijos */
  numHijos?: number;
  /** Número de hijos menores de 3 años */
  hijosMenores3?: number;
  /** Número de pagas (12 o 14) */
  pagas?: 12 | 14;
}

export interface ResultadoSueldoNeto {
  /** Bruto anual */
  brutoAnual: number;
  /** Cotización SS empleado anual */
  cuotaSSAnual: number;
  /** Base imponible (bruto - SS) */
  baseImponible: number;
  /** Reducción por rendimientos del trabajo */
  reduccionRNT: number;
  /** Mínimo personal y familiar */
  minimoPersonalFamiliar: number;
  /** Base liquidable */
  baseLiquidable: number;
  /** Cuota íntegra IRPF */
  cuotaIRPF: number;
  /** Tipo de retención efectivo (%) */
  tipoRetencion: number;
  /** Neto anual */
  netoAnual: number;
  /** Neto mensual (según número de pagas) */
  netoMensual: number;
  /** Número de pagas */
  pagas: number;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const r = (n: number) => Math.round(n * 100) / 100;



/** Calcula la reducción por rendimientos netos del trabajo */
function calcularReduccionRNT(rnt: number): number {
  return calcularReduccionRendimientosTrabajo(rnt);
}

/** Calcula el mínimo personal y familiar */
function calcularMinimo(situacion: SituacionFamiliar, numHijos: number, hijosMenores3: number): number {
  let minimo = MINIMOS_IRPF_2025.personal;
  // Hijos
  const ordenHijos = [
    MINIMOS_IRPF_2025.hijo_1,
    MINIMOS_IRPF_2025.hijo_2,
    MINIMOS_IRPF_2025.hijo_3,
  ];
  for (let i = 0; i < numHijos; i++) {
    minimo += i < 3 ? ordenHijos[i] : MINIMOS_IRPF_2025.hijo_4_mas;
  }
  minimo += hijosMenores3 * MINIMOS_IRPF_2025.hijo_menor_3;
  // Cónyuge sin ingresos (deducción art. 84): no aplica aquí directamente,
  // pero el tipo de retención puede variar. Se simplifica con el mínimo personal.
  return minimo;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularSueldoNeto(p: ParametrosSueldoNeto): ResultadoSueldoNeto {
  if (p.brutoAnual <= 0) throw new Error('El salario bruto anual debe ser mayor que cero.');

  const situacion = p.situacion ?? 'soltero';
  const numHijos = p.numHijos ?? 0;
  const hijosMenores3 = p.hijosMenores3 ?? 0;
  const pagas = p.pagas ?? 14;

  // Cotización SS: base = clamp(salario mensual, mínima, máxima)
  const salarioMensual = p.brutoAnual / 12;
  // Sin suelo en la base MÍNIMA: esa base es la de jornada completa, y coincide con el SMI, así
  // que un bruto anual por debajo solo puede ser jornada parcial o parte del año — y entonces
  // se cotiza por lo cobrado. Hasta el 24/09/2026 se subía a la mínima: 14.000 € a media
  // jornada cotizaban sobre 17.092,80 € (1.111 € en vez de 910 €).
  const baseSS = Math.min(salarioMensual, BASES_SS_2026.maxima);
  const tipoSS = (
    COTIZACIONES_SS_2026.contingenciasComunes +
    COTIZACIONES_SS_2026.desempleo +
    COTIZACIONES_SS_2026.formacionProfesional +
    COTIZACIONES_SS_2026.mef
  ) / 100;
  const cuotaSSMensual = baseSS * tipoSS;
  const cuotaSSAnual = r(cuotaSSMensual * 12);

  // Base imponible
  const baseImponible = Math.max(0, p.brutoAnual - cuotaSSAnual - GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral);

  // Reducción RNT
  const reduccionRNT = r(calcularReduccionRNT(baseImponible));

  // Base liquidable general
  const minimoPersonalFamiliar = calcularMinimo(situacion, numHijos, hijosMenores3);
  const baseLiquidableGeneral = Math.max(0, baseImponible - reduccionRNT);
  const baseLiquidable = baseLiquidableGeneral;

  // Cuota integra: art. 63.1.2 LIRPF. Reparado a mano el 09/09/2026; desde el 12/09/2026 la
  // formula la pone data/fiscal/irpf.ts y deja de estar copiada aqui.
  const cuotaIntegra = calcularCuotaIntegraGeneral(baseLiquidableGeneral, minimoPersonalFamiliar);

  // Deducción por obtención de rendimientos del trabajo (DA 61.ª LIRPF, cuantías de 2026):
  // sobre el bruto, con tope en la cuota íntegra, que aquí es toda del trabajo.
  const deduccionRentasBajas = limitarDeduccionRendimientosTrabajo(
    calcularDeduccionRentasBajas(p.brutoAnual, 0, 2026),
    cuotaIntegra,
  );
  const cuotaIRPF = r(Math.max(0, cuotaIntegra - deduccionRentasBajas));

  // Tipo de retención
  const tipoRetencion = r((cuotaIRPF / p.brutoAnual) * 100);

  // Neto
  const netoAnual = r(p.brutoAnual - cuotaSSAnual - cuotaIRPF);
  const netoMensual = r(netoAnual / pagas);

  return {
    brutoAnual: r(p.brutoAnual),
    cuotaSSAnual,
    baseImponible: r(baseImponible),
    reduccionRNT,
    minimoPersonalFamiliar,
    baseLiquidable: r(baseLiquidable),
    cuotaIRPF,
    tipoRetencion,
    netoAnual,
    netoMensual,
    pagas,
    fuenteDatos: `${FISCAL_IRPF_META.fuente} — verificado ${FISCAL_IRPF_META.verificado}`,
  };
}
