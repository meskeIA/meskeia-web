/**
 * Calculadora de Hipoteca — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_hipoteca y consulta_compra_vivienda) y /api/chatgpt/hipoteca.
 * Su app gemela es estimador-hipoteca, que lleva la misma fórmula en su useMemo: unificados por
 * barrido el 08/11/2026 (_private/inspector/MOTORES.md, «HITO unificar-app-motor-hipoteca»).
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

  // Fases: la fija y la variable tienen una sola; la mixta, dos. Con la cuota de la fase 1
  // calculada sobre el plazo TOTAL (práctica bancaria) y la de la fase 2 sobre el saldo que queda.
  const esMixta = p.tipoHipoteca === 'mixta';
  // Tipo fijo por defecto, 3,5 % también en la fase 1 de la mixta: en estimador-hipoteca los dos
  // controles son el mismo estado. Hasta el 08/11/2026 la mixta caía a 3,0 %.
  const interesFijo = p.interesAnual ?? 3.5;
  const interesVariable = (p.euribor ?? 3.0) + (p.diferencial ?? 0.8);
  const mesesFase1 = esMixta ? Math.min((p.plazoFijoMixta ?? 5) * 12, numCuotas - 1) : numCuotas;
  const tipoEfectivo = p.tipoHipoteca === 'variable' ? interesVariable : interesFijo;
  const tipoEfectivFase2 = esMixta ? interesVariable : undefined;
  const cuotaMensual = calcCuotaFrancesa(capital, tipoEfectivo, numCuotas);
  let cuotaMensualFase2: number | undefined;

  // Un solo cuadro mensual para los tres tipos, sumado por años como el de estimador-hipoteca.
  // Hasta el 08/11/2026 la mixta tenía su propio bucle y devolvía el resumen anual a cero.
  let totalIntereses = 0;
  let pendiente = capital;
  const resumenAnual: ResumenAnual[] = [];
  let anio = { cuotas: 0, intereses: 0, capital: 0 };

  for (let mes = 1; mes <= numCuotas; mes++) {
    if (esMixta && mes === mesesFase1 + 1) {
      cuotaMensualFase2 = calcCuotaFrancesa(pendiente, interesVariable, numCuotas - mesesFase1);
    }
    const enFase1 = mes <= mesesFase1;
    const cuota = enFase1 ? cuotaMensual : (cuotaMensualFase2 ?? 0);
    const interesMes = pendiente * ((enFase1 ? tipoEfectivo : interesVariable) / 100 / 12);
    const capitalMes = cuota - interesMes;
    totalIntereses += interesMes;
    pendiente = Math.max(0, pendiente - capitalMes);
    anio = { cuotas: anio.cuotas + cuota, intereses: anio.intereses + interesMes, capital: anio.capital + capitalMes };

    if (mes % 12 === 0 || mes === numCuotas) {
      resumenAnual.push({
        anio:             Math.ceil(mes / 12),
        cuotasAnuales:    r(anio.cuotas),
        interesesAnio:    r(anio.intereses),
        capitalAnio:      r(anio.capital),
        capitalPendiente: r(pendiente),
      });
      anio = { cuotas: 0, intereses: 0, capital: 0 };
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
