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
  /** bruto / neto; null si no queda producto útil (neto 0: la división no existe) */
  factorCorreccion: number | null;
  costeRealPorKg: number | null; // coste del kg útil (si se da precio de compra y queda producto)
}

/** Una merma es un porcentaje entre 0 y 100: lo demás no es una merma posible. */
export function esMermaValida(pct: number): boolean {
  return Number.isFinite(pct) && pct >= 0 && pct <= 100;
}

/**
 * @param pesoBruto gramos comprados
 * @param mermaLimpiezaPct % que se pierde al limpiar
 * @param mermaCoccionPct % que se pierde al cocinar (sobre el peso ya limpio)
 * @param precioPorKgBruto precio de compra por kilo (opcional)
 * @returns null si el peso no es positivo o alguna merma no está entre 0 y 100
 *
 * Hasta el 04/11/2026 las mermas se recortaban a 0-100 en silencio (−10 calculaba con 0 %,
 * 150 con 100 %) y daban un resultado completo con aspecto de válido (hallazgo 4016). Y con
 * el 100 % de merma el factor salía 0 («×0,00», que dice que no hace falta comprar nada),
 * cuando bruto / 0 no existe (hallazgo 4017): ahora es null.
 */
export function calcularMerma(
  pesoBruto: number,
  mermaLimpiezaPct: number,
  mermaCoccionPct: number,
  precioPorKgBruto: number | null,
): ResultadoMerma | null {
  if (!(pesoBruto > 0) || !Number.isFinite(pesoBruto)) return null;
  if (!esMermaValida(mermaLimpiezaPct) || !esMermaValida(mermaCoccionPct)) return null;

  const pesoLimpio = pesoBruto * (1 - mermaLimpiezaPct / 100);
  const pesoNeto = pesoLimpio * (1 - mermaCoccionPct / 100);

  const rendimientoPct = (pesoNeto / pesoBruto) * 100;
  const mermaTotalPct = 100 - rendimientoPct;
  const factorCorreccion = pesoNeto > 0 ? pesoBruto / pesoNeto : null;

  // Coste real del kg útil = precio de compra × factor de corrección.
  const costeRealPorKg =
    precioPorKgBruto !== null && precioPorKgBruto > 0 && factorCorreccion !== null
      ? Math.round(precioPorKgBruto * factorCorreccion * 100) / 100
      : null;

  return {
    pesoLimpio: Math.round(pesoLimpio),
    pesoNeto: Math.round(pesoNeto),
    mermaTotalPct: Math.round(mermaTotalPct * 10) / 10,
    rendimientoPct: Math.round(rendimientoPct * 10) / 10,
    factorCorreccion: factorCorreccion === null ? null : Math.round(factorCorreccion * 100) / 100,
    costeRealPorKg,
  };
}

// Mermas orientativas de limpieza para alimentos habituales (% sobre bruto).
// El «%» va separado con espacio duro (U+00A0), como manda el formato español (hallazgo 4020).
export interface ReferenciaMerma {
  alimento: string;
  emoji: string;
  mermaLimpieza: string;
  nota: string;
}

export const REFERENCIAS_MERMA: ReferenciaMerma[] = [
  { alimento: 'Patata (pelar)', emoji: '🥔', mermaLimpieza: '15–25 %', nota: 'Más si se tornea o se quitan brotes.' },
  { alimento: 'Cebolla / ajo', emoji: '🧅', mermaLimpieza: '10–15 %', nota: 'Piel y extremos.' },
  { alimento: 'Pescado entero', emoji: '🐟', mermaLimpieza: '40–60 %', nota: 'Cabeza, espina, piel y vísceras.' },
  { alimento: 'Pollo entero (deshuesar)', emoji: '🍗', mermaLimpieza: '25–35 %', nota: 'Huesos y piel según el uso.' },
  { alimento: 'Lechuga / verdura de hoja', emoji: '🥬', mermaLimpieza: '20–30 %', nota: 'Hojas exteriores y troncos.' },
  { alimento: 'Solomillo (limpiar grasa)', emoji: '🥩', mermaLimpieza: '10–20 %', nota: 'Grasa, nervios y cordón.' },
];
