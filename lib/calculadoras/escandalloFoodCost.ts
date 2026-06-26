// Escandallo y food cost — lógica pura
//
// Calcula el coste de una receta a partir de sus ingredientes, el coste por
// ración y el precio de venta (PVP) según un porcentaje de food cost objetivo.
// El food cost es el porcentaje que representa el coste de materia prima sobre el
// precio de venta: si un plato cuesta 3 € y se vende a 12 €, el food cost es 25%.
// Los importes son SIN impuestos: el IVA se añade aparte según tu país.
// Verificado: 2026-06.

export type ModoIngrediente = 'peso' | 'unidad';

export interface IngredienteEscandallo {
  id: number;
  nombre: string;
  modo: ModoIngrediente;
  cantidad: number; // gramos (modo peso) o número de unidades
  precio: number; // € por kilo (peso) o € por unidad (unidad)
}

export function costeIngrediente(ing: IngredienteEscandallo): number {
  if (!(ing.cantidad > 0) || !(ing.precio >= 0)) return 0;
  return ing.modo === 'peso' ? (ing.cantidad / 1000) * ing.precio : ing.cantidad * ing.precio;
}

export interface ResultadoEscandallo {
  costeTotal: number;
  costePorRacion: number;
  pvpSinImpuestos: number;
  margenBruto: number; // por ración
  margenPct: number; // % sobre PVP
  foodCostObjetivo: number;
}

/**
 * @param ingredientes lista de ingredientes con su coste
 * @param raciones número de raciones que salen de la receta
 * @param foodCostObjetivo porcentaje de food cost deseado (p. ej. 30)
 */
export function calcularEscandallo(
  ingredientes: IngredienteEscandallo[],
  raciones: number,
  foodCostObjetivo: number,
): ResultadoEscandallo | null {
  if (!(raciones > 0)) return null;

  const costeTotal = ingredientes.reduce((s, i) => s + costeIngrediente(i), 0);
  const costePorRacion = costeTotal / raciones;

  const fc = foodCostObjetivo > 0 ? foodCostObjetivo : 0;
  const pvpSinImpuestos = fc > 0 ? costePorRacion / (fc / 100) : 0;
  const margenBruto = pvpSinImpuestos - costePorRacion;
  const margenPct = pvpSinImpuestos > 0 ? (margenBruto / pvpSinImpuestos) * 100 : 0;

  return {
    costeTotal: Math.round(costeTotal * 100) / 100,
    costePorRacion: Math.round(costePorRacion * 100) / 100,
    pvpSinImpuestos: Math.round(pvpSinImpuestos * 100) / 100,
    margenBruto: Math.round(margenBruto * 100) / 100,
    margenPct: Math.round(margenPct * 10) / 10,
    foodCostObjetivo: fc,
  };
}

// Referencias orientativas de food cost por tipo de negocio (porcentaje típico).
export interface ReferenciaFoodCost {
  tipo: string;
  rango: string;
  nota: string;
}

export const REFERENCIAS_FOOD_COST: ReferenciaFoodCost[] = [
  { tipo: 'Restaurante a la carta', rango: '28–35%', nota: 'El rango más común en cocina de servicio completo.' },
  { tipo: 'Bar de tapas / informal', rango: '25–32%', nota: 'Algo más ajustado por el volumen y la rotación.' },
  { tipo: 'Bebidas y café', rango: '15–25%', nota: 'Coste de materia prima bajo, gran margen.' },
  { tipo: 'Pastelería / repostería', rango: '20–30%', nota: 'Depende mucho de la mano de obra y la decoración.' },
];
