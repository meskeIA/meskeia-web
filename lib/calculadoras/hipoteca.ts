/**
 * Calculadora de Hipoteca — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_hipoteca)
 *
 * Soporta hipotecas a tipo fijo, variable (Euríbor + diferencial) y mixta.
 * Usa el sistema francés (cuota constante) que es el estándar bancario en España.
 * Devuelve cuota mensual, cuadro resumen anual y métricas financieras clave.
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoHipoteca = 'fijo' | 'variable' | 'mixta';

export interface ParametrosHipoteca {
  /** Precio de la vivienda en euros */
  precioVivienda: number;
  /** Entrada aportada (euros). Mínimo recomendado: 20% del precio */
  entrada: number;
  /** Plazo en años */
  plazoAnios: number;
  /** Tipo de hipoteca */
  tipoHipoteca: TipoHipoteca;
  /**
   * Tipo de interés anual fijo (%) — para tipo 'fijo' y fase fija de 'mixta'.
   * Para 'variable', ignorado (se usa euribor + diferencial).
   */
  interesAnual?: number;
  /** Euríbor actual anual (%) — para tipo 'variable' y fase variable de 'mixta' */
  euribor?: number;
  /** Diferencial del banco sobre Euríbor (%) — para 'variable' y 'mixta' */
  diferencial?: number;
  /** Años de fase fija en hipoteca mixta (solo para tipo 'mixta') */
  plazoFijoMixta?: number;
  /** Ingresos netos mensuales del solicitante (para calcular ratio de endeudamiento) */
  ingresosMensuales?: number;
}

export interface ResumenAnual {
  anio: number;
  cuotasAnuales: number;
  interesesAnio: number;
  capitalAnio: number;
  capitalPendiente: number;
}

export interface ResultadoHipoteca {
  /** Capital financiado (precio - entrada) */
  capital: number;
  /** Porcentaje de financiación sobre el precio */
  porcentajeFinanciacion: number;
  /** Cuota mensual en la fase inicial (o única si es fija) */
  cuotaMensual: number;
  /** Cuota mensual en fase variable (solo para mixta) */
  cuotaMensualFase2?: number;
  /** Tipo de interés efectivo aplicado en fase 1 (%) */
  tipoEfectivo: number;
  /** Tipo efectivo en fase 2 para mixta (%) */
  tipoEfectivFase2?: number;
  /** Total de intereses pagados durante toda la vida del préstamo */
  totalIntereses: number;
  /** Total pagado (capital + intereses) */
  totalPagado: number;
  /** Coste de los intereses en % sobre el capital */
  porcentajeInteresesSobreCapital: number;
  /** Ratio cuota/ingresos (%) — null si no se proporcionan ingresos */
  ratioCuotaIngresos: number | null;
  /** Si el ratio supera el 30% recomendado */
  alertaRatio: boolean;
  /** Resumen por años (sin cuadro mensual completo para no saturar) */
  resumenAnual: ResumenAnual[];
  /** Nota sobre el cálculo */
  nota: string;
}

// ─── Helper: fórmula francesa ──────────────────────────────────────────────────

function calcCuotaFrancesa(capital: number, tipoAnual: number, numCuotas: number): number {
  if (numCuotas <= 0) return 0;
  if (tipoAnual === 0) return capital / numCuotas;
  const r = tipoAnual / 100 / 12;
  return capital * (r * Math.pow(1 + r, numCuotas)) / (Math.pow(1 + r, numCuotas) - 1);
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularHipoteca(p: ParametrosHipoteca): ResultadoHipoteca {
  if (p.precioVivienda <= 0) throw new Error('El precio de la vivienda debe ser mayor que cero.');
  if (p.entrada < 0 || p.entrada >= p.precioVivienda) throw new Error('La entrada debe ser entre 0 y el precio de la vivienda.');
  if (p.plazoAnios <= 0 || p.plazoAnios > 40) throw new Error('El plazo debe estar entre 1 y 40 años.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const capital = p.precioVivienda - p.entrada;
  const porcentajeFinanciacion = r((capital / p.precioVivienda) * 100);
  const numCuotas = p.plazoAnios * 12;

  let cuotaMensual: number;
  let cuotaMensualFase2: number | undefined;
  let tipoEfectivo: number;
  let tipoEfectivFase2: number | undefined;
  let totalIntereses = 0;
  const resumenAnual: ResumenAnual[] = [];

  if (p.tipoHipoteca === 'mixta') {
    const interesF1 = p.interesAnual ?? 3.0;
    const interesF2 = (p.euribor ?? 3.0) + (p.diferencial ?? 0.8);
    const mesesFase1 = Math.min((p.plazoFijoMixta ?? 5) * 12, numCuotas - 1);
    const mesesFase2 = numCuotas - mesesFase1;

    // Fase 1: cuota calculada sobre el plazo total (práctica bancaria)
    cuotaMensual = calcCuotaFrancesa(capital, interesF1, numCuotas);
    cuotaMensualFase2 = mesesFase2 > 0 ? 0 : undefined;
    tipoEfectivo = interesF1;
    tipoEfectivFase2 = interesF2;

    // Simular para obtener capital pendiente al final de fase 1
    let pendiente = capital;
    const r1 = interesF1 / 100 / 12;
    let interesesAcum = 0;

    for (let mes = 1; mes <= numCuotas; mes++) {
      const tipo = mes <= mesesFase1 ? r1 : interesF2 / 100 / 12;
      const interesMes = pendiente * tipo;
      const cuotaActual = mes <= mesesFase1 ? cuotaMensual : (cuotaMensualFase2 ?? 0);

      // Recalcular cuota fase 2 cuando empieza
      if (mes === mesesFase1 + 1 && mesesFase2 > 0) {
        cuotaMensualFase2 = calcCuotaFrancesa(pendiente, interesF2, mesesFase2);
      }

      const cuotaReal = mes <= mesesFase1 ? cuotaMensual : (cuotaMensualFase2 ?? 0);
      const capitalMes = cuotaReal - interesMes;
      interesesAcum += interesMes;
      pendiente = Math.max(0, pendiente - capitalMes);

      // Resumen anual
      if (mes % 12 === 0 || mes === numCuotas) {
        const anio = Math.ceil(mes / 12);
        if (!resumenAnual[anio - 1]) {
          resumenAnual.push({ anio, cuotasAnuales: 0, interesesAnio: 0, capitalAnio: 0, capitalPendiente: 0 });
        }
      }
    }
    totalIntereses = interesesAcum;

  } else {
    tipoEfectivo = p.tipoHipoteca === 'fijo'
      ? (p.interesAnual ?? 3.5)
      : (p.euribor ?? 3.0) + (p.diferencial ?? 0.8);

    cuotaMensual = calcCuotaFrancesa(capital, tipoEfectivo, numCuotas);
    const rMes = tipoEfectivo / 100 / 12;
    let pendiente = capital;

    for (let mes = 1; mes <= numCuotas; mes++) {
      const interesMes = pendiente * rMes;
      const capitalMes = cuotaMensual - interesMes;
      totalIntereses += interesMes;
      pendiente = Math.max(0, pendiente - capitalMes);

      if (mes % 12 === 0 || mes === numCuotas) {
        const anio = Math.ceil(mes / 12);
        // Acumular en el año
        const idx = anio - 1;
        if (!resumenAnual[idx]) {
          resumenAnual.push({ anio, cuotasAnuales: 0, interesesAnio: 0, capitalAnio: 0, capitalPendiente: 0 });
        }
        resumenAnual[idx].capitalPendiente = r(pendiente);
      }
    }

    // Reconstruir resumen anual correctamente
    resumenAnual.length = 0;
    pendiente = capital;
    for (let anio = 1; anio <= p.plazoAnios; anio++) {
      let interesesAnio = 0;
      let capitalAnio = 0;
      const mesesEsteAnio = Math.min(12, numCuotas - (anio - 1) * 12);
      for (let m = 0; m < mesesEsteAnio; m++) {
        const interesMes = pendiente * rMes;
        const capitalMes = cuotaMensual - interesMes;
        interesesAnio += interesMes;
        capitalAnio += capitalMes;
        pendiente = Math.max(0, pendiente - capitalMes);
      }
      resumenAnual.push({
        anio,
        cuotasAnuales: r(cuotaMensual * mesesEsteAnio),
        interesesAnio: r(interesesAnio),
        capitalAnio: r(capitalAnio),
        capitalPendiente: r(pendiente),
      });
    }
  }

  const totalPagado = r(capital + totalIntereses);
  const ratioCuotaIngresos = p.ingresosMensuales && p.ingresosMensuales > 0
    ? r((cuotaMensual / p.ingresosMensuales) * 100)
    : null;

  return {
    capital:                         r(capital),
    porcentajeFinanciacion,
    cuotaMensual:                    r(cuotaMensual),
    cuotaMensualFase2:               cuotaMensualFase2 !== undefined ? r(cuotaMensualFase2) : undefined,
    tipoEfectivo,
    tipoEfectivFase2,
    totalIntereses:                  r(totalIntereses),
    totalPagado,
    porcentajeInteresesSobreCapital: r((totalIntereses / capital) * 100),
    ratioCuotaIngresos,
    alertaRatio:                     ratioCuotaIngresos !== null && ratioCuotaIngresos > 30,
    resumenAnual,
    nota: 'Cálculo orientativo con sistema francés (cuota constante). No incluye seguros, comisiones de apertura ni TAE. Consulta con tu banco las condiciones exactas.',
  };
}
