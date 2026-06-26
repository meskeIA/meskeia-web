// Conversión gastronómica: tazas/cucharadas ↔ gramos POR INGREDIENTE — lógica pura
//
// El foso: la misma taza pesa muy distinto según el ingrediente (la harina no se
// compacta igual que el azúcar, y los líquidos van por densidad). Una taza genérica
// induce a error; aquí cada ingrediente lleva su peso real por taza.
//
// Fuente de referencia de los gramos por taza: King Arthur Baking "Ingredient
// Weight Chart" (taza EE.UU. de 240 ml, harina cucharada y nivelada / "spooned &
// leveled"), contrastada con USDA FoodData Central para densidades de líquidos.
// Valores redondeados a entero. Verificado: 2026-06.

export interface MetaConversion {
  version: string;
  fuente: string;
  urlOficial: string;
  verificado: string;
  tazaMl: number;
}

export const CONVERSION_GASTRO_META: MetaConversion = {
  version: '2026.06',
  fuente: 'King Arthur Baking — Ingredient Weight Chart + USDA FoodData Central',
  urlOficial: 'https://www.kingarthurbaking.com/learn/ingredient-weight-chart',
  verificado: '2026-06',
  tazaMl: 240,
};

// ─── Categorías e ingredientes ────────────────────────────────────────────────

export type CategoriaIngrediente =
  | 'harinas'
  | 'azucares'
  | 'liquidos'
  | 'grasas'
  | 'lacteos'
  | 'frutos-cacao'
  | 'cereales-legumbres'
  | 'leudantes-sal';

export interface Ingrediente {
  id: string;
  nombre: string;
  emoji: string;
  categoria: CategoriaIngrediente;
  // Gramos por taza EE.UU. (240 ml). El resto de medidas se derivan de aquí.
  gramosPorTaza: number;
  // Nota opcional (compactado, medida habitual, etc.).
  nota?: string;
}

export const CATEGORIAS_INGREDIENTE: Record<CategoriaIngrediente, string> = {
  harinas: 'Harinas y féculas',
  azucares: 'Azúcares y endulzantes',
  liquidos: 'Líquidos',
  grasas: 'Grasas y aceites',
  lacteos: 'Lácteos',
  'frutos-cacao': 'Frutos secos, cacao y chocolate',
  'cereales-legumbres': 'Cereales y legumbres (en crudo)',
  'leudantes-sal': 'Leudantes, sal y similares',
};

// Tabla curada. gramosPorTaza = peso real de 1 taza (240 ml) del ingrediente.
export const INGREDIENTES: Ingrediente[] = [
  // Harinas y féculas
  { id: 'harina-trigo', nombre: 'Harina de trigo (todo uso)', emoji: '🌾', categoria: 'harinas', gramosPorTaza: 120, nota: 'Cucharada y nivelada, sin compactar' },
  { id: 'harina-fuerza', nombre: 'Harina de fuerza / panadera', emoji: '🍞', categoria: 'harinas', gramosPorTaza: 125 },
  { id: 'harina-integral', nombre: 'Harina integral', emoji: '🌾', categoria: 'harinas', gramosPorTaza: 113 },
  { id: 'harina-reposteria', nombre: 'Harina de repostería (floja)', emoji: '🧁', categoria: 'harinas', gramosPorTaza: 113 },
  { id: 'harina-maiz', nombre: 'Harina de maíz (masa / arepa)', emoji: '🌽', categoria: 'harinas', gramosPorTaza: 132 },
  { id: 'maicena', nombre: 'Maicena (almidón de maíz)', emoji: '🥣', categoria: 'harinas', gramosPorTaza: 120 },
  { id: 'harina-almendra', nombre: 'Harina de almendra', emoji: '🌰', categoria: 'harinas', gramosPorTaza: 96 },

  // Azúcares y endulzantes
  { id: 'azucar-blanco', nombre: 'Azúcar blanco (granulado)', emoji: '🍬', categoria: 'azucares', gramosPorTaza: 200 },
  { id: 'azucar-moreno', nombre: 'Azúcar moreno (compactado)', emoji: '🟤', categoria: 'azucares', gramosPorTaza: 213, nota: 'Medido compactado en la taza' },
  { id: 'azucar-glas', nombre: 'Azúcar glas (impalpable)', emoji: '❄️', categoria: 'azucares', gramosPorTaza: 113 },
  { id: 'miel', nombre: 'Miel', emoji: '🍯', categoria: 'azucares', gramosPorTaza: 340 },
  { id: 'sirope-maiz', nombre: 'Sirope de maíz / glucosa', emoji: '🫙', categoria: 'azucares', gramosPorTaza: 328 },

  // Líquidos
  { id: 'agua', nombre: 'Agua', emoji: '💧', categoria: 'liquidos', gramosPorTaza: 237 },
  { id: 'leche', nombre: 'Leche', emoji: '🥛', categoria: 'liquidos', gramosPorTaza: 242 },
  { id: 'cafe', nombre: 'Café / infusión', emoji: '☕', categoria: 'liquidos', gramosPorTaza: 237 },
  { id: 'zumo', nombre: 'Zumo de frutas', emoji: '🧃', categoria: 'liquidos', gramosPorTaza: 247 },

  // Grasas y aceites
  { id: 'aceite', nombre: 'Aceite (oliva / girasol)', emoji: '🫒', categoria: 'grasas', gramosPorTaza: 218 },
  { id: 'mantequilla', nombre: 'Mantequilla', emoji: '🧈', categoria: 'grasas', gramosPorTaza: 227, nota: '1 taza = 2 barras de 113 g' },
  { id: 'manteca', nombre: 'Manteca vegetal / cerdo', emoji: '🥓', categoria: 'grasas', gramosPorTaza: 205 },

  // Lácteos
  { id: 'nata', nombre: 'Nata / crema para batir', emoji: '🍶', categoria: 'lacteos', gramosPorTaza: 240 },
  { id: 'yogur', nombre: 'Yogur', emoji: '🥄', categoria: 'lacteos', gramosPorTaza: 245 },
  { id: 'queso-crema', nombre: 'Queso crema', emoji: '🧀', categoria: 'lacteos', gramosPorTaza: 232 },
  { id: 'queso-rallado', nombre: 'Queso curado rallado', emoji: '🧀', categoria: 'lacteos', gramosPorTaza: 100, nota: 'Rallado fino, sin presionar' },

  // Frutos secos, cacao y chocolate
  { id: 'cacao', nombre: 'Cacao en polvo', emoji: '🍫', categoria: 'frutos-cacao', gramosPorTaza: 85 },
  { id: 'chocolate-chips', nombre: 'Chips / gotas de chocolate', emoji: '🍫', categoria: 'frutos-cacao', gramosPorTaza: 170 },
  { id: 'nueces', nombre: 'Nueces / almendras picadas', emoji: '🌰', categoria: 'frutos-cacao', gramosPorTaza: 113 },
  { id: 'coco-rallado', nombre: 'Coco rallado (seco)', emoji: '🥥', categoria: 'frutos-cacao', gramosPorTaza: 85 },

  // Cereales y legumbres (en crudo)
  { id: 'arroz-crudo', nombre: 'Arroz (crudo)', emoji: '🍚', categoria: 'cereales-legumbres', gramosPorTaza: 195 },
  { id: 'avena', nombre: 'Avena en copos', emoji: '🥣', categoria: 'cereales-legumbres', gramosPorTaza: 90 },
  { id: 'lentejas', nombre: 'Lentejas (crudas)', emoji: '🫘', categoria: 'cereales-legumbres', gramosPorTaza: 200 },
  { id: 'quinoa', nombre: 'Quinoa (cruda)', emoji: '🌾', categoria: 'cereales-legumbres', gramosPorTaza: 170 },

  // Leudantes, sal y similares (uso habitual en cucharadita)
  { id: 'sal', nombre: 'Sal fina de mesa', emoji: '🧂', categoria: 'leudantes-sal', gramosPorTaza: 288, nota: 'Habitual en cucharadita: ≈ 6 g' },
  { id: 'levadura-quimica', nombre: 'Levadura química (polvo de hornear)', emoji: '🫧', categoria: 'leudantes-sal', gramosPorTaza: 192, nota: 'Habitual en cucharadita: ≈ 4 g' },
  { id: 'bicarbonato', nombre: 'Bicarbonato de sodio', emoji: '🫧', categoria: 'leudantes-sal', gramosPorTaza: 220, nota: 'Habitual en cucharadita: ≈ 4,6 g' },
  { id: 'levadura-seca', nombre: 'Levadura seca de panadería', emoji: '🍞', categoria: 'leudantes-sal', gramosPorTaza: 150, nota: 'Habitual en cucharadita: ≈ 3,1 g' },
];

export const INGREDIENTE_POR_ID: Record<string, Ingrediente> = INGREDIENTES.reduce<
  Record<string, Ingrediente>
>((acc, ing) => {
  acc[ing.id] = ing;
  return acc;
}, {});

// ─── Medidas de volumen ───────────────────────────────────────────────────────
// Factor relativo a 1 taza EE.UU. (240 ml). Cucharada = 1/16 taza (15 ml),
// cucharadita = 1/48 taza (5 ml).

export interface Medida {
  id: string;
  nombre: string;
  factorTaza: number;
  ml: number;
}

export const MEDIDAS: Medida[] = [
  { id: 'taza', nombre: 'Taza', factorTaza: 1, ml: 240 },
  { id: 'media-taza', nombre: 'Media taza', factorTaza: 1 / 2, ml: 120 },
  { id: 'tercio-taza', nombre: 'Un tercio de taza', factorTaza: 1 / 3, ml: 80 },
  { id: 'cuarto-taza', nombre: 'Un cuarto de taza', factorTaza: 1 / 4, ml: 60 },
  { id: 'cucharada', nombre: 'Cucharada (sopera)', factorTaza: 1 / 16, ml: 15 },
  { id: 'cucharadita', nombre: 'Cucharadita (de café)', factorTaza: 1 / 48, ml: 5 },
];

export const MEDIDA_POR_ID: Record<string, Medida> = MEDIDAS.reduce<Record<string, Medida>>(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {},
);

// ─── Conversión: medida de volumen → gramos ───────────────────────────────────

export interface ResultadoAGramos {
  gramos: number;
  ml: number;
  ingrediente: Ingrediente;
  detalle: string;
}

/**
 * Convierte una cantidad expresada en una medida de volumen a gramos para un
 * ingrediente concreto.
 */
export function convertirAGramos(
  ingredienteId: string,
  medidaId: string,
  cantidad: number,
): ResultadoAGramos | null {
  const ingrediente = INGREDIENTE_POR_ID[ingredienteId];
  const medida = MEDIDA_POR_ID[medidaId];
  if (!ingrediente || !medida || !(cantidad > 0)) return null;

  const tazas = medida.factorTaza * cantidad;
  const gramos = ingrediente.gramosPorTaza * tazas;
  const ml = medida.ml * cantidad;

  return {
    gramos: Math.round(gramos * 10) / 10,
    ml: Math.round(ml),
    ingrediente,
    detalle: `${cantidad} × ${medida.nombre.toLowerCase()} de ${ingrediente.nombre.toLowerCase()}`,
  };
}

// ─── Conversión inversa: gramos → medidas de volumen ──────────────────────────

export interface ResultadoAMedidas {
  ingrediente: Ingrediente;
  tazas: number;
  ml: number;
  // Desglose legible en tazas + cucharadas + cucharaditas.
  desglose: string;
}

/**
 * Convierte gramos a un desglose legible de tazas/cucharadas/cucharaditas para
 * un ingrediente concreto. Útil cuando una receta da gramos y solo tienes tazas.
 */
export function convertirAMedidas(
  ingredienteId: string,
  gramos: number,
): ResultadoAMedidas | null {
  const ingrediente = INGREDIENTE_POR_ID[ingredienteId];
  if (!ingrediente || !(gramos > 0)) return null;

  const tazasTotal = gramos / ingrediente.gramosPorTaza;
  const ml = tazasTotal * 240;

  // Desglose en tazas enteras + cucharadas (1/16) + cucharaditas (1/48).
  let restoCucharaditas = Math.round(tazasTotal * 48);
  const tazas = Math.floor(restoCucharaditas / 48);
  restoCucharaditas -= tazas * 48;
  const cucharadas = Math.floor(restoCucharaditas / 3);
  restoCucharaditas -= cucharadas * 3;
  const cucharaditas = restoCucharaditas;

  const partes: string[] = [];
  if (tazas > 0) partes.push(`${tazas} ${tazas === 1 ? 'taza' : 'tazas'}`);
  if (cucharadas > 0) partes.push(`${cucharadas} ${cucharadas === 1 ? 'cucharada' : 'cucharadas'}`);
  if (cucharaditas > 0)
    partes.push(`${cucharaditas} ${cucharaditas === 1 ? 'cucharadita' : 'cucharaditas'}`);

  const desglose = partes.length > 0 ? partes.join(' + ') : 'menos de 1 cucharadita';

  return {
    ingrediente,
    tazas: Math.round(tazasTotal * 100) / 100,
    ml: Math.round(ml),
    desglose,
  };
}
