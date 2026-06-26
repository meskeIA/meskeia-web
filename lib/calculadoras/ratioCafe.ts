// Ratio de café — lógica pura
//
// La proporción café:agua define la intensidad de la extracción. Cada método
// tiene su ratio habitual (gramos de café por gramo/ml de agua). Dado el agua,
// se calcula el café; dado el café, el agua. Una taza estándar se toma como
// 200 ml. Verificado: 2026-06.

export interface MetodoCafe {
  id: string;
  nombre: string;
  emoji: string;
  // 1 g de café por `ratio` g de agua (1:ratio).
  ratio: number;
  nota: string;
}

export const METODOS_CAFE: MetodoCafe[] = [
  { id: 'v60', nombre: 'V60 / goteo (pour over)', emoji: '☕', ratio: 16, nota: 'Molido medio-fino. Equilibrado y limpio.' },
  { id: 'prensa', nombre: 'Prensa francesa', emoji: '🫖', ratio: 15, nota: 'Molido grueso. Cuerpo y aromas intensos.' },
  { id: 'aeropress', nombre: 'AeroPress', emoji: '🌀', ratio: 14, nota: 'Molido medio. Versátil; admite más concentración.' },
  { id: 'espresso', nombre: 'Espresso', emoji: '⚡', ratio: 2, nota: 'Molido muy fino. Ratio 1:2 (p. ej. 18 g → 36 g).' },
  { id: 'moka', nombre: 'Cafetera italiana (moka)', emoji: '🇮🇹', ratio: 10, nota: 'Llena el filtro sin apretar; agua hasta la válvula.' },
  { id: 'cold-brew', nombre: 'Cold brew', emoji: '🧊', ratio: 8, nota: 'Concentrado en frío 12–18 h; se diluye al servir.' },
];

export const METODO_CAFE_POR_ID: Record<string, MetodoCafe> = METODOS_CAFE.reduce<
  Record<string, MetodoCafe>
>((acc, m) => {
  acc[m.id] = m;
  return acc;
}, {});

export const ML_POR_TAZA = 200;

export type ModoCafe = 'por-agua' | 'por-cafe' | 'por-tazas';

export interface ResultadoCafe {
  cafe_g: number;
  agua_g: number;
  tazas: number;
}

/**
 * Calcula café y agua para un método.
 * @param valor según el modo: ml de agua, g de café o nº de tazas.
 */
export function calcularCafe(metodoId: string, modo: ModoCafe, valor: number): ResultadoCafe | null {
  const m = METODO_CAFE_POR_ID[metodoId];
  if (!m || !(valor > 0)) return null;

  let agua_g: number;
  if (modo === 'por-agua') {
    agua_g = valor;
  } else if (modo === 'por-tazas') {
    agua_g = valor * ML_POR_TAZA;
  } else {
    // por-cafe: agua = café × ratio
    agua_g = valor * m.ratio;
  }

  const cafe_g = agua_g / m.ratio;

  return {
    cafe_g: Math.round(cafe_g * 10) / 10,
    agua_g: Math.round(agua_g),
    tazas: Math.round((agua_g / ML_POR_TAZA) * 10) / 10,
  };
}
