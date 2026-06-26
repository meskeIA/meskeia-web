// Tiempos de conservación de alimentos — datos curados (orientativos)
//
// Cuánto aguanta cada alimento en nevera, congelador o despensa en buenas
// condiciones. Son tiempos ORIENTATIVOS de seguridad y calidad: ante cualquier
// signo de deterioro (olor, color, textura, moho), desecha el alimento. La nevera
// debe estar a 4 °C o menos y el congelador a −18 °C.
//
// Fuente: FoodSafety.gov (USDA/FDA) "Cold Food Storage Chart" y guías de
// seguridad alimentaria. Verificado: 2026-06.

export interface MetaCaducidad {
  fuente: string;
  urlOficial: string;
  verificado: string;
}

export const CADUCIDAD_META: MetaCaducidad = {
  fuente: 'FoodSafety.gov (USDA/FDA) — Cold Food Storage Chart',
  urlOficial: 'https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts',
  verificado: '2026-06',
};

export type CategoriaCaducidad =
  | 'carnes-pescados'
  | 'lacteos-huevos'
  | 'frutas-verduras'
  | 'cocinados'
  | 'despensa';

export const CATEGORIAS_CADUCIDAD: Record<CategoriaCaducidad, string> = {
  'carnes-pescados': 'Carnes y pescados',
  'lacteos-huevos': 'Lácteos y huevos',
  'frutas-verduras': 'Frutas y verduras',
  cocinados: 'Cocinados y sobras',
  despensa: 'Despensa',
};

export interface AlimentoCaducidad {
  nombre: string;
  emoji: string;
  categoria: CategoriaCaducidad;
  nevera: string;
  congelador: string;
  despensa: string;
}

const NA = '—';

export const ALIMENTOS_CADUCIDAD: AlimentoCaducidad[] = [
  // Carnes y pescados (crudos salvo indicación)
  { nombre: 'Carne picada cruda', emoji: '🥩', categoria: 'carnes-pescados', nevera: '1–2 días', congelador: '3–4 meses', despensa: NA },
  { nombre: 'Filetes y chuletas crudas', emoji: '🥩', categoria: 'carnes-pescados', nevera: '3–5 días', congelador: '6–12 meses', despensa: NA },
  { nombre: 'Pollo crudo', emoji: '🍗', categoria: 'carnes-pescados', nevera: '1–2 días', congelador: '9–12 meses', despensa: NA },
  { nombre: 'Pescado fresco', emoji: '🐟', categoria: 'carnes-pescados', nevera: '1–2 días', congelador: '3–6 meses', despensa: NA },
  { nombre: 'Embutido loncheado (abierto)', emoji: '🍖', categoria: 'carnes-pescados', nevera: '3–5 días', congelador: '1–2 meses', despensa: NA },
  { nombre: 'Jamón cocido (abierto)', emoji: '🍖', categoria: 'carnes-pescados', nevera: '3–5 días', congelador: '1–2 meses', despensa: NA },

  // Lácteos y huevos
  { nombre: 'Leche (abierta)', emoji: '🥛', categoria: 'lacteos-huevos', nevera: '4–7 días', congelador: '3 meses', despensa: NA },
  { nombre: 'Yogur', emoji: '🥄', categoria: 'lacteos-huevos', nevera: '1–2 sem.', congelador: '1–2 meses', despensa: NA },
  { nombre: 'Queso fresco', emoji: '🧀', categoria: 'lacteos-huevos', nevera: '1 semana', congelador: 'No recomendado', despensa: NA },
  { nombre: 'Queso curado', emoji: '🧀', categoria: 'lacteos-huevos', nevera: '3–4 sem.', congelador: '6–8 meses', despensa: NA },
  { nombre: 'Huevos (con cáscara)', emoji: '🥚', categoria: 'lacteos-huevos', nevera: '3–5 sem.', congelador: 'No con cáscara', despensa: NA },
  { nombre: 'Mantequilla', emoji: '🧈', categoria: 'lacteos-huevos', nevera: '1–3 meses', congelador: '6–9 meses', despensa: NA },

  // Frutas y verduras
  { nombre: 'Lechuga y hoja verde', emoji: '🥬', categoria: 'frutas-verduras', nevera: '3–5 días', congelador: 'No recomendado', despensa: NA },
  { nombre: 'Tomate', emoji: '🍅', categoria: 'frutas-verduras', nevera: '5–7 días', congelador: 'Solo triturado', despensa: '3–5 días' },
  { nombre: 'Manzana', emoji: '🍎', categoria: 'frutas-verduras', nevera: '3–4 sem.', congelador: 'Solo en compota', despensa: '5–7 días' },
  { nombre: 'Plátano', emoji: '🍌', categoria: 'frutas-verduras', nevera: 'Oscurece', congelador: '2–3 meses (pelado)', despensa: '3–5 días' },
  { nombre: 'Zanahoria', emoji: '🥕', categoria: 'frutas-verduras', nevera: '2–3 sem.', congelador: '10–12 meses (escaldada)', despensa: NA },
  { nombre: 'Hierbas frescas', emoji: '🌿', categoria: 'frutas-verduras', nevera: '1 semana', congelador: '4–6 meses', despensa: NA },

  // Cocinados y sobras
  { nombre: 'Sobras de comida cocinada', emoji: '🍲', categoria: 'cocinados', nevera: '3–4 días', congelador: '2–3 meses', despensa: NA },
  { nombre: 'Arroz o pasta cocida', emoji: '🍚', categoria: 'cocinados', nevera: '3–5 días', congelador: '1–2 meses', despensa: NA },
  { nombre: 'Sopa o guiso', emoji: '🥣', categoria: 'cocinados', nevera: '3–4 días', congelador: '2–3 meses', despensa: NA },
  { nombre: 'Salsa de tomate (abierta)', emoji: '🥫', categoria: 'cocinados', nevera: '5–7 días', congelador: '1–2 meses', despensa: NA },

  // Despensa (sin abrir o seco)
  { nombre: 'Arroz y pasta seca', emoji: '🍝', categoria: 'despensa', nevera: NA, congelador: NA, despensa: '1–2 años' },
  { nombre: 'Legumbre seca', emoji: '🫘', categoria: 'despensa', nevera: NA, congelador: NA, despensa: '2–3 años' },
  { nombre: 'Harina', emoji: '🌾', categoria: 'despensa', nevera: 'Prolonga', congelador: NA, despensa: '6–12 meses' },
  { nombre: 'Conserva enlatada (cerrada)', emoji: '🥫', categoria: 'despensa', nevera: NA, congelador: NA, despensa: '2–5 años' },
];
