// Conversor de horno a freidora de aire (air fryer) — lógica pura
//
// La freidora de aire es un pequeño horno de convección: el aire forzado y el
// espacio reducido cocinan más rápido y más caliente. Para adaptar una receta de
// horno convencional, la regla práctica es bajar la temperatura ~20 °C y reducir
// el tiempo ~20%. Siempre conviene vigilar y sacudir/girar a media cocción.
// Verificado: 2026-06.

export const REDUCCION_TEMP_C = 20; // °C menos que el horno convencional
export const REDUCCION_TIEMPO = 0.2; // 20% menos de tiempo

export interface ResultadoAirfryer {
  tempC: number;
  tempF: number;
  tiempoMin: number;
}

export function convertirAAirfryer(tempHornoC: number, tiempoHornoMin: number): ResultadoAirfryer | null {
  if (!(tempHornoC > 0) || !(tiempoHornoMin > 0)) return null;
  const tempC = Math.round((tempHornoC - REDUCCION_TEMP_C) / 5) * 5;
  const tempF = Math.round((tempC * 9) / 5 + 32);
  const tiempoMin = Math.max(1, Math.round(tiempoHornoMin * (1 - REDUCCION_TIEMPO)));
  return { tempC, tempF, tiempoMin };
}

// Referencias de alimentos habituales en freidora de aire (temp y tiempo ya
// pensados para air fryer, como guía rápida).
export interface ReferenciaAirfryer {
  alimento: string;
  emoji: string;
  tempC: number;
  tiempo: string;
  nota: string;
}

export const REFERENCIAS_AIRFRYER: ReferenciaAirfryer[] = [
  { alimento: 'Patatas fritas (congeladas)', emoji: '🍟', tempC: 200, tiempo: '15–18 min', nota: 'Sacude la cesta a media cocción.' },
  { alimento: 'Patatas caseras en gajos', emoji: '🥔', tempC: 190, tiempo: '20–25 min', nota: 'Un poco de aceite y sin amontonar.' },
  { alimento: 'Alitas / muslos de pollo', emoji: '🍗', tempC: 190, tiempo: '20–25 min', nota: 'Dales la vuelta a media cocción; interior a 74 °C.' },
  { alimento: 'Pechuga de pollo', emoji: '🍗', tempC: 180, tiempo: '15–18 min', nota: 'Según grosor; comprueba 74 °C en el centro.' },
  { alimento: 'Croquetas', emoji: '🧆', tempC: 190, tiempo: '10–12 min', nota: 'Pincela con aceite para que doren.' },
  { alimento: 'Verduras (calabacín, pimiento)', emoji: '🫑', tempC: 180, tiempo: '10–15 min', nota: 'Cortadas en trozos similares.' },
  { alimento: 'Pescado / lomos', emoji: '🐟', tempC: 180, tiempo: '8–12 min', nota: 'Según grosor; queda jugoso.' },
  { alimento: 'Bacon', emoji: '🥓', tempC: 180, tiempo: '7–10 min', nota: 'Crujiente sin sartén.' },
];
