// Tiempos de asado al horno por peso — datos curados (orientativos)
//
// El tiempo de asado depende sobre todo del peso de la pieza y de la temperatura
// del horno. Aquí se calcula como un tiempo base más unos minutos por kilo. Son
// tiempos ORIENTATIVOS: lo que confirma que la carne está lista (y segura) es la
// temperatura interna, no el reloj. Verificado: 2026-06.

export interface TipoAsado {
  id: string;
  nombre: string;
  emoji: string;
  minPorKg: number;
  baseMin: number;
  tempHornoC: number;
  tempInternaC: number;
  reposoMin: number;
  nota: string;
}

export const TIPOS_ASADO: TipoAsado[] = [
  { id: 'pollo', nombre: 'Pollo entero', emoji: '🍗', minPorKg: 45, baseMin: 20, tempHornoC: 190, tempInternaC: 74, reposoMin: 10, nota: 'El jugo del muslo debe salir transparente. Interior a 74 °C.' },
  { id: 'pavo', nombre: 'Pavo entero', emoji: '🦃', minPorKg: 40, baseMin: 30, tempHornoC: 180, tempInternaC: 74, reposoMin: 20, nota: 'Las piezas grandes rinden menos por kilo. Cubre la pechuga con papel si se dora pronto.' },
  { id: 'pato', nombre: 'Pato / pintada', emoji: '🦆', minPorKg: 45, baseMin: 20, tempHornoC: 180, tempInternaC: 74, reposoMin: 10, nota: 'Pincha la piel para que suelte grasa y quede crujiente.' },
  { id: 'cordero', nombre: 'Cordero (pierna o paletilla)', emoji: '🍖', minPorKg: 30, baseMin: 20, tempHornoC: 190, tempInternaC: 63, reposoMin: 15, nota: 'Tiempo para al punto (63 °C). Para bien hecho, +5 min/kg.' },
  { id: 'cerdo', nombre: 'Cerdo (lomo o pernil)', emoji: '🐖', minPorKg: 40, baseMin: 20, tempHornoC: 180, tempInternaC: 71, reposoMin: 10, nota: 'Jugoso a 63 °C, hecho a 71 °C. La corteza, con el horno fuerte al final.' },
  { id: 'ternera', nombre: 'Ternera (redondo / roast beef)', emoji: '🥩', minPorKg: 25, baseMin: 15, tempHornoC: 200, tempInternaC: 57, reposoMin: 15, nota: 'Tiempo para al punto (57 °C). Poco hecho: −5 min/kg; bien hecho: +8 min/kg.' },
];

export const TIPO_ASADO_POR_ID: Record<string, TipoAsado> = TIPOS_ASADO.reduce<
  Record<string, TipoAsado>
>((acc, t) => { acc[t.id] = t; return acc; }, {});

export interface ResultadoAsado {
  tiempoMin: number;
  tempHornoC: number;
  tempInternaC: number;
  reposoMin: number;
  nota: string;
}

export function calcularAsado(tipoId: string, pesoKg: number): ResultadoAsado | null {
  const t = TIPO_ASADO_POR_ID[tipoId];
  if (!t || !(pesoKg > 0)) return null;
  return {
    tiempoMin: Math.round(t.baseMin + t.minPorKg * pesoKg),
    tempHornoC: t.tempHornoC,
    tempInternaC: t.tempInternaC,
    reposoMin: t.reposoMin,
    nota: t.nota,
  };
}

export function formatearMin(min: number): string {
  if (!(min > 0)) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}
