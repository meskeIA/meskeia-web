/**
 * Calculadora de Reequilibrio de Cartera de Inversión — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_reequilibrio_cartera)
 *
 * Calcula cómo reequilibrar (rebalancear) una cartera de inversión cuando los pesos
 * actuales de los activos han divergido de los pesos objetivo por la evolución
 * del mercado.
 *
 * Estrategias:
 * A) 'comprar_vender': operaciones de compra y venta para alcanzar los pesos exactos
 * B) 'solo_comprar': solo aportar nuevo capital sin vender (evita fiscalidad de plusvalías)
 *
 * El reequilibrio es clave en carteras indexadas (Bogleheads) y fondos perfilados.
 * La fiscalidad de las ventas (ganancias patrimoniales) es un factor determinante
 * para elegir la estrategia.
 *
 * Encadenable con: calcular_fire, calcular_plusvalias_irpf, calcular_estadisticas
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type EstrategiaReequilibrio = 'comprar_vender' | 'solo_comprar';

export interface ActivoCartera {
  /** Nombre del activo o categoría (ej: "Renta Variable Global", "Renta Fija") */
  nombre: string;
  /** Valor actual de mercado en cartera (€) */
  valorActual: number;
  /** Peso objetivo en la cartera (%). Todos deben sumar 100. */
  pesoObjetivoPct: number;
  /** Coste de adquisición medio (€). Para calcular plusvalías si se vende. Por defecto = valorActual. */
  costeMedio?: number;
}

export interface OperacionReequilibrio {
  /** Nombre del activo */
  nombre: string;
  /** Peso actual (%) */
  pesoActual: number;
  /** Peso objetivo (%) */
  pesoObjetivo: number;
  /** Desviación respecto al objetivo (puntos porcentuales) */
  desviacion: number;
  /** Valor actual (€) */
  valorActual: number;
  /** Valor objetivo tras el reequilibrio (€) */
  valorObjetivo: number;
  /** Importe a comprar (+) o vender (-) (€) */
  operacion: number;
  /** Tipo de operación */
  tipoOperacion: 'comprar' | 'vender' | 'mantener';
  /** Plusvalía/pérdida estimada si se vende (€). Solo relevante si tipoOperacion = 'vender'. */
  plusvaliaEstimada?: number;
  /** Impuesto estimado por plusvalía (tipo ahorro) si se vende (€) */
  impuestoEstimado?: number;
}

export interface ParametrosReequilibrioCartera {
  /** Lista de activos actuales con sus valores y pesos objetivo */
  activos: ActivoCartera[];
  /** Estrategia de reequilibrio */
  estrategia?: EstrategiaReequilibrio;
  /**
   * Nuevo capital disponible para aportar (€). Solo relevante para estrategia 'solo_comprar'.
   * Por defecto 0.
   */
  nuevoCapital?: number;
  /**
   * Umbral de desviación para activar el reequilibrio (puntos porcentuales).
   * Si la desviación es menor, no se genera operación. Por defecto 5%.
   */
  umbralDesviacion?: number;
}

export interface ResultadoReequilibrioCartera {
  /** Valor total de la cartera antes del reequilibrio (€) */
  valorTotalActual: number;
  /** Valor total de la cartera después del reequilibrio (€) */
  valorTotalObjetivo: number;
  /** Estrategia usada */
  estrategia: EstrategiaReequilibrio;
  /** Umbral de desviación usado (%) */
  umbralDesviacion: number;
  /** ¿Necesita reequilibrio? (algún activo supera el umbral) */
  necesitaReequilibrio: boolean;
  /** Operaciones por activo */
  operaciones: OperacionReequilibrio[];
  /** Total a comprar (€) */
  totalComprar: number;
  /** Total a vender (€) */
  totalVender: number;
  /** Plusvalías totales generadas por ventas (€) */
  plusvaliasTotal: number;
  /** Impuesto estimado total sobre plusvalías (€) */
  impuestoTotal: number;
  /** Número de operaciones necesarias */
  numOperaciones: number;
  /** Interpretación y recomendación */
  interpretacion: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularReequilibrioCartera(p: ParametrosReequilibrioCartera): ResultadoReequilibrioCartera {
  if (!p.activos || p.activos.length === 0) throw new Error('Se requiere al menos un activo en la cartera.');

  const sumaPesos = p.activos.reduce((s, a) => s + a.pesoObjetivoPct, 0);
  if (Math.abs(sumaPesos - 100) > 0.5) {
    throw new Error(`Los pesos objetivo deben sumar 100%. Suma actual: ${sumaPesos.toFixed(1)}%.`);
  }

  const r = (n: number) => Math.round(n * 100) / 100;

  const estrategia = p.estrategia ?? 'comprar_vender';
  const nuevoCapital = p.nuevoCapital ?? 0;
  const umbral = p.umbralDesviacion ?? 5;

  const valorTotalActual = r(p.activos.reduce((s, a) => s + a.valorActual, 0));
  const valorTotalObjetivo = r(valorTotalActual + nuevoCapital);

  if (valorTotalActual <= 0) throw new Error('El valor total de la cartera debe ser mayor que cero.');

  const operaciones: OperacionReequilibrio[] = p.activos.map(activo => {
    const pesoActual = r(activo.valorActual / valorTotalActual * 100);
    const pesoObjetivo = activo.pesoObjetivoPct;
    const desviacion = r(pesoActual - pesoObjetivo);
    const valorObjetivo = r(valorTotalObjetivo * pesoObjetivo / 100);

    let operacion: number;
    if (estrategia === 'solo_comprar') {
      // Solo compramos; si el activo está sobreponderado, no vendemos
      operacion = desviacion <= -umbral ? r(valorObjetivo - activo.valorActual) : 0;
    } else {
      operacion = Math.abs(desviacion) >= umbral ? r(valorObjetivo - activo.valorActual) : 0;
    }

    const tipoOperacion: 'comprar' | 'vender' | 'mantener' =
      operacion > 0.5 ? 'comprar' :
      operacion < -0.5 ? 'vender' : 'mantener';

    // Plusvalías en caso de venta
    let plusvaliaEstimada: number | undefined;
    let impuestoEstimado: number | undefined;
    if (tipoOperacion === 'vender' && operacion < 0) {
      const costeMedio = activo.costeMedio ?? activo.valorActual;
      const precioMedioActual = activo.valorActual > 0 ? costeMedio / activo.valorActual : 1;
      const costeVendido = r(Math.abs(operacion) * precioMedioActual);
      plusvaliaEstimada = r(Math.abs(operacion) - costeVendido);
      // Tipo ahorro: 19% hasta 6.000, 21% hasta 50.000, 23% resto
      if (plusvaliaEstimada > 0) {
        let impuesto = 0;
        if (plusvaliaEstimada <= 6000) impuesto = plusvaliaEstimada * 0.19;
        else if (plusvaliaEstimada <= 50000) impuesto = 6000 * 0.19 + (plusvaliaEstimada - 6000) * 0.21;
        else impuesto = 6000 * 0.19 + 44000 * 0.21 + (plusvaliaEstimada - 50000) * 0.23;
        impuestoEstimado = r(impuesto);
      } else {
        impuestoEstimado = 0;
      }
    }

    return {
      nombre: activo.nombre,
      pesoActual,
      pesoObjetivo,
      desviacion,
      valorActual: activo.valorActual,
      valorObjetivo,
      operacion,
      tipoOperacion,
      plusvaliaEstimada,
      impuestoEstimado,
    };
  });

  const necesitaReequilibrio = operaciones.some(o => o.tipoOperacion !== 'mantener');
  const totalComprar = r(operaciones.filter(o => o.operacion > 0).reduce((s, o) => s + o.operacion, 0));
  const totalVender = r(Math.abs(operaciones.filter(o => o.operacion < 0).reduce((s, o) => s + o.operacion, 0)));
  const plusvaliasTotal = r(operaciones.reduce((s, o) => s + (o.plusvaliaEstimada ?? 0), 0));
  const impuestoTotal = r(operaciones.reduce((s, o) => s + (o.impuestoEstimado ?? 0), 0));
  const numOperaciones = operaciones.filter(o => o.tipoOperacion !== 'mantener').length;

  let interpretacion: string;
  if (!necesitaReequilibrio) {
    interpretacion = `Cartera equilibrada. Ningún activo supera el umbral de desviación del ${umbral}%. No es necesario actuar.`;
  } else if (estrategia === 'solo_comprar') {
    interpretacion = `Reequilibrio sin ventas. Aporta ${totalComprar.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € para acercarte a los pesos objetivo. Los activos sobreponderados se irán diluyendo con las nuevas aportaciones. Sin impacto fiscal por plusvalías.`;
  } else {
    interpretacion = `Reequilibrio completo: comprar ${totalComprar.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € y vender ${totalVender.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €.`;
    if (impuestoTotal > 0) {
      interpretacion += ` Las ventas generan plusvalías estimadas de ${plusvaliasTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € con un coste fiscal de ${impuestoTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €. Considera la estrategia "solo_comprar" si las plusvalías son significativas.`;
    }
  }

  return {
    valorTotalActual,
    valorTotalObjetivo,
    estrategia,
    umbralDesviacion: umbral,
    necesitaReequilibrio,
    operaciones,
    totalComprar,
    totalVender,
    plusvaliasTotal,
    impuestoTotal,
    numOperaciones,
    interpretacion,
  };
}
