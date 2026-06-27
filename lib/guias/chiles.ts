// Chiles y pimientos del mundo — datos curados
//
// El picor se mide en la escala Scoville (SHU), que cuantifica la capsaicina.
// Aquí se recogen chiles habituales (con foco en México y Latinoamérica) con su
// rango de picor, nivel, origen y uso típico. Los SHU varían mucho según la
// variedad y el cultivo: son rangos orientativos. Verificado: 2026-06.

export type NivelPicante = 'suave' | 'medio' | 'picante' | 'muy-picante' | 'extremo';

export const ETIQUETA_NIVEL: Record<NivelPicante, string> = {
  suave: 'Suave', medio: 'Medio', picante: 'Picante', 'muy-picante': 'Muy picante', extremo: 'Extremo',
};

export interface Chile {
  nombre: string;
  emoji: string;
  shuMin: number;
  shuMax: number;
  nivel: NivelPicante;
  origen: string;
  uso: string;
}

export const CHILES: Chile[] = [
  { nombre: 'Pimiento / morrón', emoji: '🫑', shuMin: 0, shuMax: 0, nivel: 'suave', origen: 'Mundial', uso: 'Sin picor; para rellenar, asar y guisar.' },
  { nombre: 'Padrón / Shishito', emoji: '🌶️', shuMin: 500, shuMax: 2500, nivel: 'suave', origen: 'España / Japón', uso: 'Fritos; "unos pican y otros no".' },
  { nombre: 'Poblano (seco: ancho)', emoji: '🌶️', shuMin: 1000, shuMax: 2000, nivel: 'suave', origen: 'México', uso: 'Chiles rellenos, rajas, mole (como ancho).' },
  { nombre: 'Guajillo (seco)', emoji: '🌶️', shuMin: 2500, shuMax: 5000, nivel: 'medio', origen: 'México', uso: 'Base de salsas y adobos; afrutado.' },
  { nombre: 'Jalapeño', emoji: '🌶️', shuMin: 2500, shuMax: 8000, nivel: 'medio', origen: 'México', uso: 'Fresco, encurtido o relleno; muy versátil.' },
  { nombre: 'Chipotle (jalapeño ahumado)', emoji: '🌶️', shuMin: 5000, shuMax: 10000, nivel: 'medio', origen: 'México', uso: 'Ahumado; adobos y salsas con humo.' },
  { nombre: 'Serrano', emoji: '🌶️', shuMin: 10000, shuMax: 23000, nivel: 'picante', origen: 'México', uso: 'Salsas frescas, pico de gallo.' },
  { nombre: 'Chile de árbol', emoji: '🌶️', shuMin: 15000, shuMax: 30000, nivel: 'picante', origen: 'México', uso: 'Salsas secas muy picantes; decorativo.' },
  { nombre: 'Cayena', emoji: '🌶️', shuMin: 30000, shuMax: 50000, nivel: 'muy-picante', origen: 'América', uso: 'En polvo; da fuego a guisos y rubs.' },
  { nombre: 'Habanero', emoji: '🔥', shuMin: 100000, shuMax: 350000, nivel: 'extremo', origen: 'Península de Yucatán', uso: 'Salsas yucatecas; frutal e intenso.' },
  { nombre: 'Chile fantasma (Bhut Jolokia)', emoji: '🔥', shuMin: 800000, shuMax: 1000000, nivel: 'extremo', origen: 'India', uso: 'Para muy valientes; úsalo con guantes.' },
  { nombre: 'Carolina Reaper', emoji: '☠️', shuMin: 1500000, shuMax: 2200000, nivel: 'extremo', origen: 'EE. UU.', uso: 'De los más picantes del mundo; extremo.' },
];
