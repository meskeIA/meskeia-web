// Catálogo de adaptaciones de adaptacion-hogar: lo leen la lista (page.tsx) y las dos FAQ
// (la visible de page.tsx y el FAQPage de metadata.ts), para que las cifras de las FAQ salgan
// de los mismos rangos que suma la lista. Hasta el 11/11/2026 cada FAQ llevaba los suyos
// escritos a mano y se contradecían con la lista (barras 80–300 € en la lista y 500-1.500 € en
// la FAQ; hallazgo 4455).
import { formatNumber } from '@/lib/formatters';

export interface ItemAdaptacion {
  id: string;
  nombre: string;
  costeMin: number;
  costeMax: number;
  prioridad: 'alta' | 'media' | 'baja';
  ayuda: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  items: ItemAdaptacion[];
}

export const CATEGORIAS: Categoria[] = [
  {
    id: 'bano',
    nombre: '🚿 Baño',
    items: [
      { id: 'barras_apoyo', nombre: 'Barras de apoyo en ducha y WC', costeMin: 80, costeMax: 300, prioridad: 'alta', ayuda: true },
      { id: 'silla_ducha', nombre: 'Silla o asiento de ducha', costeMin: 50, costeMax: 200, prioridad: 'alta', ayuda: false },
      { id: 'suelo_bano', nombre: 'Suelo antideslizante en baño', costeMin: 30, costeMax: 150, prioridad: 'alta', ayuda: false },
      { id: 'elevador_wc', nombre: 'Elevador de WC con brazos', costeMin: 40, costeMax: 200, prioridad: 'media', ayuda: false },
      { id: 'ducha_accesible', nombre: 'Ducha accesible sin barreras', costeMin: 800, costeMax: 3000, prioridad: 'alta', ayuda: true },
      { id: 'grifo_monomando', nombre: 'Grifo monomando ergonómico', costeMin: 60, costeMax: 200, prioridad: 'baja', ayuda: false },
    ],
  },
  {
    id: 'dormitorio',
    nombre: '🛏️ Dormitorio',
    items: [
      { id: 'cama_articulada', nombre: 'Cama articulada o ajustable', costeMin: 400, costeMax: 2500, prioridad: 'media', ayuda: true },
      { id: 'barra_cama', nombre: 'Barra lateral de apoyo (cama)', costeMin: 80, costeMax: 300, prioridad: 'media', ayuda: false },
      { id: 'iluminacion_nocturna', nombre: 'Iluminación nocturna automática', costeMin: 30, costeMax: 100, prioridad: 'alta', ayuda: false },
      { id: 'eliminar_alfombras', nombre: 'Eliminar o fijar alfombras', costeMin: 0, costeMax: 50, prioridad: 'alta', ayuda: false },
    ],
  },
  {
    id: 'cocina',
    nombre: '🍳 Cocina',
    items: [
      { id: 'induccion', nombre: 'Cocina de inducción (mayor seguridad)', costeMin: 250, costeMax: 800, prioridad: 'media', ayuda: false },
      { id: 'tiradores_cocina', nombre: 'Tiradores y cajones ergonómicos', costeMin: 100, costeMax: 400, prioridad: 'baja', ayuda: false },
      { id: 'encimera_adaptada', nombre: 'Encimera a altura accesible', costeMin: 500, costeMax: 2000, prioridad: 'media', ayuda: true },
    ],
  },
  {
    id: 'accesos',
    nombre: '🚪 Accesos y pasillos',
    items: [
      { id: 'rampa_entrada', nombre: 'Rampa de acceso exterior', costeMin: 100, costeMax: 1500, prioridad: 'alta', ayuda: true },
      { id: 'pasamanos_pasillos', nombre: 'Pasamanos en pasillos', costeMin: 150, costeMax: 600, prioridad: 'alta', ayuda: true },
      { id: 'ampliar_puertas', nombre: 'Ampliar puertas (≥ 80 cm)', costeMin: 300, costeMax: 1500, prioridad: 'media', ayuda: true },
      { id: 'tiradores_palanca', nombre: 'Tiradores de palanca en puertas', costeMin: 100, costeMax: 400, prioridad: 'baja', ayuda: false },
    ],
  },
  {
    id: 'escaleras',
    nombre: '⬆️ Escaleras',
    items: [
      { id: 'doble_pasamanos', nombre: 'Doble pasamanos en escalera', costeMin: 200, costeMax: 800, prioridad: 'alta', ayuda: true },
      { id: 'silla_salvaescaleras', nombre: 'Silla salvaescaleras', costeMin: 2500, costeMax: 6000, prioridad: 'alta', ayuda: true },
      { id: 'plataforma_elevadora', nombre: 'Plataforma elevadora vertical', costeMin: 4000, costeMax: 12000, prioridad: 'alta', ayuda: true },
    ],
  },
  {
    id: 'seguridad',
    nombre: '🔔 Seguridad general',
    items: [
      { id: 'telealarma', nombre: 'Telealarma / detector de caídas', costeMin: 30, costeMax: 300, prioridad: 'alta', ayuda: true },
      { id: 'suelos_generales', nombre: 'Suelos antideslizantes (toda la casa)', costeMin: 100, costeMax: 1000, prioridad: 'alta', ayuda: false },
      { id: 'interruptores', nombre: 'Interruptores a altura accesible', costeMin: 150, costeMax: 500, prioridad: 'baja', ayuda: false },
    ],
  },
];

export const TODOS_LOS_ITEMS: ItemAdaptacion[] = CATEGORIAS.flatMap(c => c.items);

/** Euros sin decimales y con espacio duro antes del símbolo: «12.000 €». */
const euros = (n: number): string => `${formatNumber(n, 0)} €`;

/** Rango de una suma de adaptaciones, para el texto de las FAQ: «160–650 €». */
export function rangoDe(ids: string[]): string {
  const items = ids.map(id => {
    const item = TODOS_LOS_ITEMS.find(i => i.id === id);
    if (!item) throw new Error(`adaptacion-hogar: no hay ninguna adaptación «${id}» en CATEGORIAS`);
    return item;
  });
  const min = items.reduce((s, i) => s + i.costeMin, 0);
  const max = items.reduce((s, i) => s + i.costeMax, 0);
  return min === 0 ? `hasta ${euros(max)}` : `${formatNumber(min, 0)}–${euros(max)}`;
}

/** Rango de todo el catálogo marcado a la vez. */
export const RANGO_TOTAL = rangoDe(TODOS_LOS_ITEMS.map(i => i.id));
