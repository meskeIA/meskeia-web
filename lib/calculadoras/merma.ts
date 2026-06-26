// Cálculo de merma y rendimiento — lógica pura
//
// La merma es lo que se pierde de un alimento al limpiarlo (pelar, deshuesar,
// quitar grasa) y al cocinarlo (pérdida de agua). El peso que de verdad se sirve
// (peso neto) es menor que el que se compra (peso bruto), y el coste real del
// producto útil es mayor que el precio de compra. El factor de corrección
// relaciona ambos: cuánto bruto hay que comprar por cada unidad de neto.
// Verificado: 2026-06.

export interface ResultadoMerma {
  pesoLimpio: number; // tras la limpieza
  pesoNeto: number; // tras limpieza y cocción
  mermaTotalPct: number; // % perdido sobre el bruto
  rendimientoPct: number; // % aprovechado
  factorCorreccion: number; // bruto / neto
  costeRealPorKg: number | null; // coste del kg útil (si se da precio de compra)
}

/**
 * @param pesoBruto gramos comprados
 * @param mermaLimpiezaPct % que se pierde al limpiar
 * @param mermaCoccionPct % que se pierde al cocinar (sobre el peso ya limpio)
 * @param precioPorKgBruto precio de compra por kilo (opcional)
 */
export function calcularMerma(
  pesoBruto: number,
  mermaLimpiezaPct: number,
  mermaCoccionPct: number,
  precioPorKgBruto: number | null,
): ResultadoMerma | null {
  if (!(pesoBruto > 0)) return null;

  const limpieza = Math.min(Math.max(mermaLimpiezaPct, 0), 100);
  const coccion = Math.min(Math.max(mermaCoccionPct, 0), 100);

  const pesoLimpio = pesoBruto * (1 - limpieza / 100);
  const pesoNeto = pesoLimpio * (1 - coccion / 100);

  const rendimientoPct = (pesoNeto / pesoBruto) * 100;
  const mermaTotalPct = 100 - rendimientoPct;
  const factorCorreccion = pesoNeto > 0 ? pesoBruto / pesoNeto : 0;

  // Coste real del kg útil = precio de compra × factor de corrección.
  const costeRealPorKg =
    precioPorKgBruto && precioPorKgBruto > 0 && factorCorreccion > 0
      ? Math.round(precioPorKgBruto * factorCorreccion * 100) / 100
      : null;

  return {
    pesoLimpio: Math.round(pesoLimpio),
    pesoNeto: Math.round(pesoNeto),
    mermaTotalPct: Math.round(mermaTotalPct * 10) / 10,
    rendimientoPct: Math.round(rendimientoPct * 10) / 10,
    factorCorreccion: Math.round(factorCorreccion * 100) / 100,
    costeRealPorKg,
  };
}

// Mermas orientativas de limpieza para alimentos habituales (% sobre bruto).
export interface ReferenciaMerma {
  alimento: string;
  emoji: string;
  mermaLimpieza: string;
  nota: string;
}

export const REFERENCIAS_MERMA: ReferenciaMerma[] = [
  { alimento: 'Patata (pelar)', emoji: '🥔', mermaLimpieza: '15–25%', nota: 'Más si se tornea o se quitan brotes.' },
  { alimento: 'Cebolla / ajo', emoji: '🧅', mermaLimpieza: '10–15%', nota: 'Piel y extremos.' },
  { alimento: 'Pescado entero', emoji: '🐟', mermaLimpieza: '40–60%', nota: 'Cabeza, espina, piel y vísceras.' },
  { alimento: 'Pollo entero (deshuesar)', emoji: '🍗', mermaLimpieza: '25–35%', nota: 'Huesos y piel según el uso.' },
  { alimento: 'Lechuga / verdura de hoja', emoji: '🥬', mermaLimpieza: '20–30%', nota: 'Hojas exteriores y troncos.' },
  { alimento: 'Solomillo (limpiar grasa)', emoji: '🥩', mermaLimpieza: '10–20%', nota: 'Grasa, nervios y cordón.' },
];
