// Salmuera (brining) — lógica pura
//
// Sumergir carne o pescado en agua con sal antes de cocinar mejora la jugosidad y
// el sabor. La concentración se mide en % de sal sobre el peso del agua. Una
// salmuera ligera (4%) es suave; una intensa (8%), más rápida y sabrosa pero hay
// que vigilar el tiempo para no salar de más. El tiempo depende del grosor de la
// pieza. Verificado: 2026-06.

export interface NivelSalmuera {
  id: string;
  nombre: string;
  porcentaje: number; // % de sal sobre el agua
  nota: string;
}

export const NIVELES_SALMUERA: NivelSalmuera[] = [
  { id: 'ligera', nombre: 'Ligera (4%)', porcentaje: 4, nota: 'Suave: buena para piezas finas o tiempos largos sin pasarse de sal.' },
  { id: 'media', nombre: 'Media (6%)', porcentaje: 6, nota: 'La de uso general para pollo, cerdo y pescados.' },
  { id: 'intensa', nombre: 'Intensa (8%)', porcentaje: 8, nota: 'Más rápida y sabrosa; controla el tiempo para no salar en exceso.' },
];

export const NIVEL_SALMUERA_POR_ID: Record<string, NivelSalmuera> = NIVELES_SALMUERA.reduce<
  Record<string, NivelSalmuera>
>((acc, n) => { acc[n.id] = n; return acc; }, {});

export interface ResultadoSalmuera {
  sal_g: number;
  azucar_g: number; // opcional, ~la mitad de la sal
  agua_ml: number;
  porcentaje: number;
}

export function calcularSalmuera(nivelId: string, aguaMl: number): ResultadoSalmuera | null {
  const n = NIVEL_SALMUERA_POR_ID[nivelId];
  if (!n || !(aguaMl > 0)) return null;
  const sal_g = (aguaMl * n.porcentaje) / 100;
  return {
    sal_g: Math.round(sal_g),
    azucar_g: Math.round(sal_g / 2),
    agua_ml: Math.round(aguaMl),
    porcentaje: n.porcentaje,
  };
}

// Tiempos orientativos de salmuera según la pieza.
export interface TiempoSalmuera {
  pieza: string;
  emoji: string;
  tiempo: string;
}

export const TIEMPOS_SALMUERA: TiempoSalmuera[] = [
  { pieza: 'Pechuga / filetes finos', emoji: '🍗', tiempo: '30 min – 1 h' },
  { pieza: 'Chuletas, muslos', emoji: '🍖', tiempo: '1–2 h' },
  { pieza: 'Pollo entero', emoji: '🐔', tiempo: '4–8 h' },
  { pieza: 'Pavo entero', emoji: '🦃', tiempo: '12–24 h' },
  { pieza: 'Lomo / pieza grande de cerdo', emoji: '🐖', tiempo: '6–12 h' },
  { pieza: 'Pescado (lomos)', emoji: '🐟', tiempo: '15–30 min' },
];
