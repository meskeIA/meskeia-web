/**
 * Comparador Alquiler vs Compra — lógica pura sin React ni DOM
 * Usada por: MCP server (comparar_alquiler_compra)
 *
 * Compara el patrimonio acumulado a N años según se alquile o se compre
 * una vivienda, teniendo en cuenta hipoteca, gastos de mantenimiento,
 * revalorización y oportunidad de inversión de la entrada.
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosAlquilerVsCompra {
  // --- Compra ---
  /** Precio de la vivienda (€) */
  precioVivienda: number;
  /** Ahorro aportado como entrada (€) */
  entrada: number;
  /** Tipo de interés de la hipoteca (%) */
  tipoInteres: number;
  /** Plazo de la hipoteca (años, por defecto 25) */
  plazoHipoteca?: number;
  /** IBI anual (€, por defecto 400) */
  ibi?: number;
  /** Comunidad de propietarios mensual (€, por defecto 80) */
  comunidadMensual?: number;
  /** Seguro de hogar anual (€, por defecto 300) */
  seguroAnual?: number;
  /** Mantenimiento anual como % del valor de la vivienda (%, por defecto 0.5) */
  mantenimientoPct?: number;
  // --- Alquiler ---
  /** Alquiler mensual (€) */
  alquilerMensual: number;
  /** Incremento anual del alquiler (%, por defecto 3) */
  incrementoAlquilerPct?: number;
  // --- Inversión / horizonte ---
  /** Rentabilidad anual de la inversión alternativa (%, por defecto 5) */
  rentabilidadInversionPct?: number;
  /** Revalorización anual esperada de la vivienda (%, por defecto 3) */
  revalorizacionPct?: number;
  /** Horizonte temporal de comparación (años, por defecto 15) */
  anos?: number;
}

export interface PuntoEvolucion {
  ano: number;
  patrimonioCompra: number;
  patrimonioAlquiler: number;
}

export interface ResultadoAlquilerVsCompra {
  // Resumen compra
  /** Capital financiado */
  capitalHipoteca: number;
  /** Cuota mensual hipoteca (€) */
  cuotaHipoteca: number;
  /** Gastos iniciales de compra (ITP/IVA, notaría, registro ~10%) */
  gastosCompra: number;
  /** Gasto mensual total de compra (hipoteca + gastos corrientes) */
  gastoMensualCompra: number;

  // Resultados al horizonte
  /** Patrimonio neto al final del horizonte si compra */
  patrimonioFinalCompra: number;
  /** Patrimonio neto al final del horizonte si alquila e invierte */
  patrimonioFinalAlquiler: number;
  /** Diferencia (positivo = comprar gana, negativo = alquilar gana) */
  diferencia: number;
  /** Opción ganadora */
  mejorOpcion: 'comprar' | 'alquilar';
  /** Total pagado comprando (incluye entrada, gastos y pagos recurrentes) */
  totalPagadoCompra: number;
  /** Total pagado alquilando */
  totalPagadoAlquiler: number;
  /** Año en que la compra supera al alquiler en patrimonio (0 si no ocurre en el horizonte) */
  puntoEquilibrio: number;
  /** Valor de la vivienda al final del horizonte */
  valorFinalVivienda: number;
  /** Evolución año a año */
  evolucion: PuntoEvolucion[];
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function compararAlquilerVsCompra(p: ParametrosAlquilerVsCompra): ResultadoAlquilerVsCompra {
  if (p.precioVivienda <= 0) throw new Error('El precio de la vivienda debe ser mayor que cero.');
  if (p.alquilerMensual <= 0) throw new Error('El alquiler mensual debe ser mayor que cero.');
  if (p.entrada < 0 || p.entrada >= p.precioVivienda) throw new Error('La entrada debe estar entre 0 y el precio de la vivienda.');
  if (p.tipoInteres < 0 || p.tipoInteres > 20) throw new Error('El tipo de interés debe estar entre 0 y 20%.');

  const rd = (n: number) => Math.round(n * 100) / 100;
  const plazo = p.plazoHipoteca ?? 25;
  const ibi = p.ibi ?? 400;
  const comunidad = p.comunidadMensual ?? 80;
  const seguro = p.seguroAnual ?? 300;
  const mantenPct = (p.mantenimientoPct ?? 0.5) / 100;
  const incrementoAlq = (p.incrementoAlquilerPct ?? 3) / 100;
  const rentInv = (p.rentabilidadInversionPct ?? 5) / 100;
  const revalPct = (p.revalorizacionPct ?? 3) / 100;
  const horizonte = p.anos ?? 15;

  // Hipoteca francesa
  const capitalHipoteca = p.precioVivienda - p.entrada;
  const rMes = p.tipoInteres / 100 / 12;
  const numCuotas = plazo * 12;
  const cuotaHipoteca = rMes === 0
    ? capitalHipoteca / numCuotas
    : capitalHipoteca * rMes * Math.pow(1 + rMes, numCuotas) / (Math.pow(1 + rMes, numCuotas) - 1);

  const gastosCompra = rd(p.precioVivienda * 0.10); // ~10% (ITP/IVA + notaría + registro)

  let totalPagadoCompra = p.entrada + gastosCompra;
  let totalPagadoAlquiler = 0;
  let capitalInvertidoAlquiler = p.entrada + gastosCompra; // el alquilador invierte lo que habría gastado en la compra
  let valorVivienda = p.precioVivienda;
  let capitalPendiente = capitalHipoteca;
  let alquilerActual = p.alquilerMensual;
  let puntoEquilibrio = 0;
  const evolucion: PuntoEvolucion[] = [];

  for (let ano = 1; ano <= horizonte; ano++) {
    // --- COMPRA: simulación mensual ---
    let amortizacionAno = 0;
    let pagosHipotecaAno = 0;
    let cap = capitalPendiente;

    for (let mes = 0; mes < 12 && cap > 0.01; mes++) {
      const interesMes = cap * rMes;
      const amortMes = Math.min(cuotaHipoteca - interesMes, cap);
      pagosHipotecaAno += interesMes + amortMes;
      amortizacionAno += amortMes;
      cap = Math.max(0, cap - amortMes);
    }

    const gastosCorrientesCompra = ibi + comunidad * 12 + seguro + valorVivienda * mantenPct;
    totalPagadoCompra += pagosHipotecaAno + gastosCorrientesCompra;
    capitalPendiente = Math.max(0, capitalPendiente - amortizacionAno);
    valorVivienda *= (1 + revalPct);

    const patrimonioCompra = rd(valorVivienda - capitalPendiente);
    evolucion.push({ ano, patrimonioCompra, patrimonioAlquiler: 0 }); // alquiler se rellena abajo

    // --- ALQUILER: inversión del capital alternativo ---
    const alquilerAno = rd(alquilerActual * 12);
    totalPagadoAlquiler += alquilerAno;

    // El capital alternativo crece con rentabilidad
    capitalInvertidoAlquiler *= (1 + rentInv);
    // Si la compra es más cara que el alquiler, el alquilador ahorra la diferencia e invierte
    const gastoMensualCompra = cuotaHipoteca + comunidad + (ibi + seguro + valorVivienda * mantenPct) / 12;
    const ahorroMensual = Math.max(0, gastoMensualCompra - alquilerActual);
    capitalInvertidoAlquiler += ahorroMensual * 12;

    evolucion[ano - 1].patrimonioAlquiler = rd(capitalInvertidoAlquiler);

    if (puntoEquilibrio === 0 && patrimonioCompra > capitalInvertidoAlquiler) {
      puntoEquilibrio = ano;
    }

    alquilerActual *= (1 + incrementoAlq);
  }

  const patrimonioFinalCompra = evolucion[horizonte - 1]?.patrimonioCompra ?? 0;
  const patrimonioFinalAlquiler = evolucion[horizonte - 1]?.patrimonioAlquiler ?? 0;
  const diferencia = rd(patrimonioFinalCompra - patrimonioFinalAlquiler);

  // Gasto mensual compra año 1
  const gastoMensualCompra = rd(cuotaHipoteca + comunidad + (ibi + seguro + p.precioVivienda * mantenPct) / 12);

  return {
    capitalHipoteca: rd(capitalHipoteca),
    cuotaHipoteca: rd(cuotaHipoteca),
    gastosCompra,
    gastoMensualCompra,
    patrimonioFinalCompra: rd(patrimonioFinalCompra),
    patrimonioFinalAlquiler: rd(patrimonioFinalAlquiler),
    diferencia,
    mejorOpcion: diferencia > 0 ? 'comprar' : 'alquilar',
    totalPagadoCompra: rd(totalPagadoCompra),
    totalPagadoAlquiler: rd(totalPagadoAlquiler),
    puntoEquilibrio,
    valorFinalVivienda: rd(valorVivienda),
    evolucion,
  };
}
