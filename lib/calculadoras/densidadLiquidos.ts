// Densidad de líquidos: ml ↔ gramos — lógica pura
//
// Los líquidos no pesan todos igual: el agua pesa 1 g/ml, pero el aceite menos y
// la miel mucho más. Cuando una receta da un líquido en gramos y tú lo mides en
// ml (o al revés), hay que usar su densidad. Aquí se recogen densidades de líquidos
// de cocina habituales. Verificado: 2026-06 (USDA / referencias culinarias).

export interface LiquidoDensidad {
  id: string;
  nombre: string;
  emoji: string;
  densidad: number; // g/ml
}

export const LIQUIDOS: LiquidoDensidad[] = [
  { id: 'agua', nombre: 'Agua', emoji: '💧', densidad: 1.0 },
  { id: 'leche', nombre: 'Leche', emoji: '🥛', densidad: 1.03 },
  { id: 'nata', nombre: 'Nata / crema', emoji: '🍶', densidad: 1.0 },
  { id: 'aceite', nombre: 'Aceite (oliva / girasol)', emoji: '🫒', densidad: 0.92 },
  { id: 'miel', nombre: 'Miel', emoji: '🍯', densidad: 1.42 },
  { id: 'sirope', nombre: 'Sirope / glucosa', emoji: '🫙', densidad: 1.33 },
  { id: 'almibar', nombre: 'Almíbar denso', emoji: '🍯', densidad: 1.3 },
  { id: 'leche-condensada', nombre: 'Leche condensada', emoji: '🥫', densidad: 1.3 },
  { id: 'vino', nombre: 'Vino', emoji: '🍷', densidad: 0.99 },
  { id: 'vinagre', nombre: 'Vinagre', emoji: '🧪', densidad: 1.01 },
  { id: 'zumo', nombre: 'Zumo de frutas', emoji: '🧃', densidad: 1.05 },
  { id: 'licor', nombre: 'Licor / destilado', emoji: '🥃', densidad: 0.94 },
];

export const LIQUIDO_POR_ID: Record<string, LiquidoDensidad> = LIQUIDOS.reduce<
  Record<string, LiquidoDensidad>
>((acc, l) => { acc[l.id] = l; return acc; }, {});

export type DireccionDensidad = 'ml-a-g' | 'g-a-ml';

export interface ResultadoDensidad {
  valor: number;
  unidad: string;
  densidad: number;
}

export function convertirDensidad(
  liquidoId: string,
  direccion: DireccionDensidad,
  cantidad: number,
): ResultadoDensidad | null {
  const l = LIQUIDO_POR_ID[liquidoId];
  if (!l || !(cantidad > 0)) return null;
  if (direccion === 'ml-a-g') {
    return { valor: Math.round(cantidad * l.densidad * 10) / 10, unidad: 'g', densidad: l.densidad };
  }
  return { valor: Math.round((cantidad / l.densidad) * 10) / 10, unidad: 'ml', densidad: l.densidad };
}
