/**
 * Calculadora de Punto de Equilibrio (Break-Even) — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_break_even)
 *
 * Calcula las unidades y euros de ventas necesarios para cubrir todos los costes.
 * Incluye análisis de escenarios what-if.
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosBreakEven {
  /** Precio de venta por unidad (€) */
  precioVenta: number;
  /** Coste variable por unidad (€) — materiales, comisiones, packaging... */
  costoVariable: number;
  /** Costes fijos totales mensuales (€) — alquiler, nóminas fijas, seguros... */
  costosFijos: number;
  /** Unidades vendidas actualmente (opcional, para comparar con el break-even) */
  ventasActuales?: number;
  /** Objetivo de ganancia mensual deseado (€, opcional) */
  objetivoGanancia?: number;
}

export interface EscenarioBreakEven {
  descripcion: string;
  precioVenta: number;
  costoVariable: number;
  costosFijos: number;
  margenContribucion: number;
  breakEvenUnidades: number;
  breakEvenEuros: number;
  variacionVsActual: number | null; // % de cambio vs escenario base
}

export interface ResultadoBreakEven {
  // Inputs procesados
  precioVenta: number;
  costoVariable: number;
  costosFijos: number;

  // Métricas principales
  /** Margen de contribución por unidad (precio - coste variable) */
  margenContribucion: number;
  /** Margen de contribución como % del precio */
  margenContribucionPorcentaje: number;
  /** Punto de equilibrio en unidades */
  breakEvenUnidades: number;
  /** Punto de equilibrio en euros de ventas */
  breakEvenEuros: number;

  // Con objetivo de ganancia (si se proporcionó)
  /** Unidades necesarias para alcanzar el objetivo de ganancia */
  unidadesParaObjetivo: number | null;
  /** Ventas en euros para alcanzar el objetivo */
  ventasParaObjetivo: number | null;

  // Análisis de situación actual (si se proporcionaron ventas actuales)
  /** Ganancia/pérdida con las ventas actuales */
  gananciaActual: number | null;
  /** % de las ventas actuales respecto al break-even */
  porcentajeBreakEven: number | null;
  /** Unidades de margen de seguridad (ventas - break-even) */
  margenSeguridad: number | null;
  /** Margen de seguridad como % de las ventas */
  margenSeguridadPorcentaje: number | null;
  /** Si la situación actual es rentable */
  esRentable: boolean | null;

  // Escenarios what-if
  escenarios: EscenarioBreakEven[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcEscenario(descripcion: string, precio: number, costoVar: number, fijos: number, baseUnidades: number | null): EscenarioBreakEven {
  const margen = precio - costoVar;
  const breakEvenUnidades = margen > 0 ? Math.ceil(fijos / margen) : 0;
  const breakEvenEuros = breakEvenUnidades * precio;
  const variacionVsActual = baseUnidades !== null && baseUnidades > 0
    ? Math.round((breakEvenUnidades - baseUnidades) / baseUnidades * 100)
    : null;
  return { descripcion, precioVenta: precio, costoVariable: costoVar, costosFijos: fijos, margenContribucion: Math.round(margen * 100) / 100, breakEvenUnidades, breakEvenEuros: Math.round(breakEvenEuros * 100) / 100, variacionVsActual };
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularBreakEven(p: ParametrosBreakEven): ResultadoBreakEven {
  if (p.precioVenta <= 0) throw new Error('El precio de venta debe ser mayor que cero.');
  if (p.costoVariable < 0) throw new Error('El coste variable no puede ser negativo.');
  if (p.costosFijos < 0) throw new Error('Los costes fijos no pueden ser negativos.');
  if (p.costoVariable >= p.precioVenta) throw new Error('El coste variable no puede ser mayor o igual al precio de venta (margen de contribución ≤ 0).');

  const r = (n: number) => Math.round(n * 100) / 100;

  const margenContribucion = r(p.precioVenta - p.costoVariable);
  const margenContribucionPorcentaje = r((margenContribucion / p.precioVenta) * 100);
  const breakEvenUnidades = Math.ceil(p.costosFijos / margenContribucion);
  const breakEvenEuros = r(breakEvenUnidades * p.precioVenta);

  // Con objetivo de ganancia
  let unidadesParaObjetivo: number | null = null;
  let ventasParaObjetivo: number | null = null;
  if (p.objetivoGanancia !== undefined && p.objetivoGanancia >= 0) {
    unidadesParaObjetivo = Math.ceil((p.costosFijos + p.objetivoGanancia) / margenContribucion);
    ventasParaObjetivo = r(unidadesParaObjetivo * p.precioVenta);
  }

  // Situación actual
  let gananciaActual: number | null = null;
  let porcentajeBreakEven: number | null = null;
  let margenSeguridad: number | null = null;
  let margenSeguridadPorcentaje: number | null = null;
  let esRentable: boolean | null = null;

  if (p.ventasActuales !== undefined) {
    const ingresos = r(p.ventasActuales * p.precioVenta);
    const costesTotales = r(p.costosFijos + p.ventasActuales * p.costoVariable);
    gananciaActual = r(ingresos - costesTotales);
    porcentajeBreakEven = breakEvenUnidades > 0 ? r((p.ventasActuales / breakEvenUnidades) * 100) : null;
    margenSeguridad = r(p.ventasActuales - breakEvenUnidades);
    margenSeguridadPorcentaje = p.ventasActuales > 0 ? r((margenSeguridad / p.ventasActuales) * 100) : null;
    esRentable = gananciaActual > 0;
  }

  // Escenarios what-if
  const escenarios: EscenarioBreakEven[] = [
    calcEscenario('+10% precio de venta', r(p.precioVenta * 1.1), p.costoVariable, p.costosFijos, breakEvenUnidades),
    calcEscenario('-10% costes variables', p.precioVenta, r(p.costoVariable * 0.9), p.costosFijos, breakEvenUnidades),
    calcEscenario('-20% costes fijos', p.precioVenta, p.costoVariable, r(p.costosFijos * 0.8), breakEvenUnidades),
    calcEscenario('+10% precio y -10% costes variables', r(p.precioVenta * 1.1), r(p.costoVariable * 0.9), p.costosFijos, breakEvenUnidades),
  ];

  return {
    precioVenta: p.precioVenta,
    costoVariable: p.costoVariable,
    costosFijos: p.costosFijos,
    margenContribucion,
    margenContribucionPorcentaje,
    breakEvenUnidades,
    breakEvenEuros,
    unidadesParaObjetivo,
    ventasParaObjetivo,
    gananciaActual,
    porcentajeBreakEven,
    margenSeguridad,
    margenSeguridadPorcentaje,
    esRentable,
    escenarios,
  };
}
