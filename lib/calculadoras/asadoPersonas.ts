// Cuánta carne para un asado o barbacoa — lógica pura
//
// Estima la carne a comprar para un asado según el número de comensales, el nivel
// de apetito y si hay guarniciones que llenan. Las cantidades son de carne CRUDA;
// recuerda que pierde peso al cocinarse. Son orientativas: ajústalas al perfil de
// tus invitados. Verificado: 2026-06.

export interface NivelApetito {
  id: string;
  nombre: string;
  gramosBase: number; // g de carne cruda por persona (sin guarnición)
  nota: string;
}

export const NIVELES_APETITO: NivelApetito[] = [
  { id: 'ligero', nombre: 'Ligero', gramosBase: 300, nota: 'Hay bastantes acompañamientos o comen poco.' },
  { id: 'normal', nombre: 'Normal', gramosBase: 400, nota: 'El asado es el plato principal, con algo de guarnición.' },
  { id: 'asador', nombre: 'De asador', gramosBase: 500, nota: 'Mucha variedad de carnes y buen apetito.' },
];

export const NIVEL_APETITO_POR_ID: Record<string, NivelApetito> = NIVELES_APETITO.reduce<
  Record<string, NivelApetito>
>((acc, n) => { acc[n.id] = n; return acc; }, {});

export interface ResultadoAsado {
  totalKg: number;
  porPersonaG: number;
  desglose: { tipo: string; cantidad: string }[];
}

export function calcularAsado(
  nivelId: string,
  personas: number,
  conGuarnicion: boolean,
): ResultadoAsado | null {
  const n = NIVEL_APETITO_POR_ID[nivelId];
  if (!n || !(personas > 0)) return null;

  // Con guarnición abundante se reduce la carne ~15%.
  const porPersona = Math.round(n.gramosBase * (conGuarnicion ? 0.85 : 1));
  const totalG = porPersona * personas;

  // Reparto orientativo típico de un asado variado.
  const desglose = [
    { tipo: 'Carne de res / vacuno', cantidad: formatPeso(totalG * 0.5) },
    { tipo: 'Cerdo (costilla, panceta)', cantidad: formatPeso(totalG * 0.25) },
    { tipo: 'Embutido (chorizo, morcilla)', cantidad: formatPeso(totalG * 0.15) },
    { tipo: 'Pollo', cantidad: formatPeso(totalG * 0.1) },
  ];

  return { totalKg: Math.round((totalG / 1000) * 100) / 100, porPersonaG: porPersona, desglose };
}

function formatPeso(g: number): string {
  if (g >= 1000) return `${Math.round((g / 1000) * 100) / 100} kg`;
  return `${Math.round(g)} g`;
}
