// Cantidades de comida y bebida para un evento — lógica pura
//
// Estima cuánta comida y bebida preparar según el número de invitados y el tipo
// de evento. Son cantidades ORIENTATIVAS por persona; ajústalas al apetito de tus
// invitados, la duración y la hora. Las cantidades de bebidas alcohólicas suponen
// un consumo moderado y de adultos. Verificado: 2026-06.

export interface TipoEvento {
  id: string;
  nombre: string;
  emoji: string;
  // gramos o unidades por persona
  items: { nombre: string; porPersona: number; unidad: string }[];
}

export const TIPOS_EVENTO: TipoEvento[] = [
  { id: 'aperitivo', nombre: 'Aperitivo / cóctel de pie', emoji: '🥂', items: [
    { nombre: 'Canapés y bocados salados', porPersona: 10, unidad: 'piezas' },
    { nombre: 'Embutido y queso', porPersona: 80, unidad: 'g' },
    { nombre: 'Pan / picos', porPersona: 50, unidad: 'g' },
    { nombre: 'Agua', porPersona: 500, unidad: 'ml' },
    { nombre: 'Refresco / zumo', porPersona: 300, unidad: 'ml' },
    { nombre: 'Vino o cava', porPersona: 250, unidad: 'ml' },
    { nombre: 'Cerveza', porPersona: 1.5, unidad: 'botellines' },
  ] },
  { id: 'comida', nombre: 'Comida o cena sentada', emoji: '🍽️', items: [
    { nombre: 'Entrante', porPersona: 120, unidad: 'g' },
    { nombre: 'Carne o pescado (principal)', porPersona: 220, unidad: 'g' },
    { nombre: 'Guarnición', porPersona: 150, unidad: 'g' },
    { nombre: 'Pan', porPersona: 60, unidad: 'g' },
    { nombre: 'Postre / tarta', porPersona: 120, unidad: 'g' },
    { nombre: 'Agua', porPersona: 500, unidad: 'ml' },
    { nombre: 'Vino', porPersona: 350, unidad: 'ml' },
    { nombre: 'Café', porPersona: 1, unidad: 'taza' },
  ] },
  { id: 'barbacoa', nombre: 'Barbacoa / asado', emoji: '🍖', items: [
    { nombre: 'Carne para asar', porPersona: 400, unidad: 'g' },
    { nombre: 'Embutido (chorizo, panceta)', porPersona: 100, unidad: 'g' },
    { nombre: 'Pan', porPersona: 80, unidad: 'g' },
    { nombre: 'Ensalada / guarnición', porPersona: 150, unidad: 'g' },
    { nombre: 'Agua', porPersona: 500, unidad: 'ml' },
    { nombre: 'Refresco', porPersona: 300, unidad: 'ml' },
    { nombre: 'Cerveza', porPersona: 3, unidad: 'botellines' },
  ] },
];

export const TIPO_EVENTO_POR_ID: Record<string, TipoEvento> = TIPOS_EVENTO.reduce<
  Record<string, TipoEvento>
>((acc, t) => { acc[t.id] = t; return acc; }, {});

export interface ItemEvento { nombre: string; cantidad: string; }

function formatCantidad(total: number, unidad: string): string {
  if (unidad === 'g' && total >= 1000) return `${Math.round((total / 1000) * 10) / 10} kg`;
  if (unidad === 'ml' && total >= 1000) return `${Math.round((total / 1000) * 10) / 10} L`;
  if (unidad === 'piezas' || unidad === 'botellines' || unidad === 'taza') return `${Math.round(total)} ${unidad}`;
  return `${Math.round(total)} ${unidad}`;
}

export function calcularEvento(tipoId: string, invitados: number): ItemEvento[] | null {
  const t = TIPO_EVENTO_POR_ID[tipoId];
  if (!t || !(invitados > 0)) return null;
  return t.items.map((i) => ({ nombre: i.nombre, cantidad: formatCantidad(i.porPersona * invitados, i.unidad) }));
}
