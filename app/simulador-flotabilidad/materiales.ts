/**
 * Sustancias de referencia de `simulador-flotabilidad`.
 *
 * Densidades típicas a temperatura ambiente; la tabla del bloque educativo da la fuente y el
 * margen de variación de cada una. El color es solo el del dibujo.
 *
 * Viven aquí, y no en `page.tsx`, porque las leen TRES consumidores: los botones del simulador,
 * los «Casos para clase» (`casos.ts`) y los líquidos de `simulador-principio-pascal`. Un caso que
 * nombra el hielo o el agua de mar saca su densidad de esta lista por id, así que el enunciado no
 * puede decir una cifra y el botón otra, ni una app dar al mercurio una densidad y la otra otra.
 */

export interface Sustancia {
  id: string;
  nombre: string;
  densidad: number;
  color: string;
}

export const MATERIALES: Sustancia[] = [
  { id: 'corcho', nombre: 'Corcho', densidad: 240, color: '#B98A55' },
  { id: 'pino', nombre: 'Madera de pino', densidad: 500, color: '#D9B37A' },
  { id: 'hielo', nombre: 'Hielo', densidad: 917, color: '#CDE9F5' },
  { id: 'aluminio', nombre: 'Aluminio', densidad: 2700, color: '#AEB6BF' },
  { id: 'hierro', nombre: 'Hierro', densidad: 7870, color: '#5B6470' },
  { id: 'oro', nombre: 'Oro', densidad: 19300, color: '#D4AF37' },
];

export const LIQUIDOS: Sustancia[] = [
  { id: 'agua', nombre: 'Agua dulce', densidad: 1000, color: '#4FA3D9' },
  { id: 'mar', nombre: 'Agua de mar', densidad: 1025, color: '#2F8C8A' },
  { id: 'aceite', nombre: 'Aceite de oliva', densidad: 920, color: '#C9B23A' },
  { id: 'alcohol', nombre: 'Alcohol etílico', densidad: 789, color: '#A9CDE3' },
  { id: 'glicerina', nombre: 'Glicerina', densidad: 1260, color: '#D8CF9A' },
  { id: 'mercurio', nombre: 'Mercurio', densidad: 13534, color: '#9AA3AD' },
];
