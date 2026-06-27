// Qué se puede congelar y cuánto dura — datos curados (orientativos)
//
// No todos los alimentos se congelan igual de bien: algunos aguantan meses sin
// perder calidad, otros cambian de textura y unos pocos directamente no conviene
// congelarlos. Los tiempos indican CALIDAD (a −18 °C el alimento sigue seguro más
// tiempo, pero pierde sabor y textura). Nunca recongeles un alimento crudo ya
// descongelado. Fuente: FoodSafety.gov (USDA/FDA). Verificado: 2026-06.

export type AptoCongelar = 'bien' | 'regular' | 'no';

export const ETIQUETA_APTO: Record<AptoCongelar, string> = {
  bien: 'Se congela bien',
  regular: 'Con matices',
  no: 'Mejor no congelar',
};

export type CategoriaCongelacion =
  | 'carnes-pescados'
  | 'fruta-verdura'
  | 'lacteos-huevos'
  | 'cocinados'
  | 'pan-masas';

export const CATEGORIAS_CONGELACION: Record<CategoriaCongelacion, string> = {
  'carnes-pescados': 'Carnes y pescados',
  'fruta-verdura': 'Frutas y verduras',
  'lacteos-huevos': 'Lácteos y huevos',
  cocinados: 'Cocinados',
  'pan-masas': 'Pan y masas',
};

export interface AlimentoCongelacion {
  nombre: string;
  emoji: string;
  categoria: CategoriaCongelacion;
  apto: AptoCongelar;
  duracion: string;
  nota: string;
}

export const ALIMENTOS_CONGELACION: AlimentoCongelacion[] = [
  // Carnes y pescados
  { nombre: 'Carne cruda (filetes, piezas)', emoji: '🥩', categoria: 'carnes-pescados', apto: 'bien', duracion: '6–12 meses', nota: 'Envuelve bien para evitar quemaduras por frío.' },
  { nombre: 'Carne picada cruda', emoji: '🍖', categoria: 'carnes-pescados', apto: 'bien', duracion: '3–4 meses', nota: 'Congela cuanto antes; es muy perecedera.' },
  { nombre: 'Pollo crudo', emoji: '🍗', categoria: 'carnes-pescados', apto: 'bien', duracion: '9–12 meses', nota: 'Por piezas para descongelar solo lo necesario.' },
  { nombre: 'Pescado azul', emoji: '🐟', categoria: 'carnes-pescados', apto: 'bien', duracion: '2–3 meses', nota: 'Menos que el blanco por su grasa.' },
  { nombre: 'Marisco cocido', emoji: '🦐', categoria: 'carnes-pescados', apto: 'regular', duracion: '2–3 meses', nota: 'Pierde algo de textura al descongelar.' },

  // Frutas y verduras
  { nombre: 'Verdura escaldada', emoji: '🥦', categoria: 'fruta-verdura', apto: 'bien', duracion: '8–12 meses', nota: 'Escáldala antes para conservar color y nutrientes.' },
  { nombre: 'Fruta para batidos/compota', emoji: '🍓', categoria: 'fruta-verdura', apto: 'bien', duracion: '6–12 meses', nota: 'Se ablanda: ideal para batidos, no para comer cruda.' },
  { nombre: 'Lechuga y hoja cruda', emoji: '🥬', categoria: 'fruta-verdura', apto: 'no', duracion: '—', nota: 'El agua de sus células la deja mustia y babosa.' },
  { nombre: 'Patata cruda', emoji: '🥔', categoria: 'fruta-verdura', apto: 'no', duracion: '—', nota: 'Cruda se vuelve harinosa; cocida o frita sí aguanta.' },
  { nombre: 'Hierbas aromáticas', emoji: '🌿', categoria: 'fruta-verdura', apto: 'bien', duracion: '4–6 meses', nota: 'Mejor picadas en cubitos con aceite o agua.' },

  // Lácteos y huevos
  { nombre: 'Queso curado rallado', emoji: '🧀', categoria: 'lacteos-huevos', apto: 'bien', duracion: '6 meses', nota: 'Mejor rallado; entero se vuelve quebradizo.' },
  { nombre: 'Mantequilla', emoji: '🧈', categoria: 'lacteos-huevos', apto: 'bien', duracion: '6–9 meses', nota: 'Aguanta muy bien la congelación.' },
  { nombre: 'Leche', emoji: '🥛', categoria: 'lacteos-huevos', apto: 'regular', duracion: '3 meses', nota: 'Puede separarse; agita al descongelar.' },
  { nombre: 'Nata para montar', emoji: '🍶', categoria: 'lacteos-huevos', apto: 'no', duracion: '—', nota: 'Se corta y ya no monta; solo sirve para cocinar.' },
  { nombre: 'Huevo (batido, sin cáscara)', emoji: '🥚', categoria: 'lacteos-huevos', apto: 'regular', duracion: '6 meses', nota: 'Nunca con cáscara: revienta. Bátelos antes.' },

  // Cocinados
  { nombre: 'Guisos y sopas', emoji: '🍲', categoria: 'cocinados', apto: 'bien', duracion: '2–3 meses', nota: 'En raciones; deja espacio porque el líquido se expande.' },
  { nombre: 'Arroz y pasta cocidos', emoji: '🍚', categoria: 'cocinados', apto: 'regular', duracion: '1–2 meses', nota: 'Algo más sueltos al descongelar; bien en salsa.' },
  { nombre: 'Fritos (croquetas, empanados)', emoji: '🧆', categoria: 'cocinados', apto: 'bien', duracion: '2–3 meses', nota: 'Mejor congelarlos crudos y freír sin descongelar.' },
  { nombre: 'Salsas con nata o huevo', emoji: '🥫', categoria: 'cocinados', apto: 'no', duracion: '—', nota: 'Tienden a cortarse; las de tomate sí aguantan.' },

  // Pan y masas
  { nombre: 'Pan', emoji: '🍞', categoria: 'pan-masas', apto: 'bien', duracion: '3 meses', nota: 'Mejor rebanado para sacar solo lo que necesites.' },
  { nombre: 'Masa cruda (pizza, pan)', emoji: '🥖', categoria: 'pan-masas', apto: 'bien', duracion: '1–3 meses', nota: 'Congela tras el primer levado; descongela en nevera.' },
  { nombre: 'Bizcochos y magdalenas', emoji: '🧁', categoria: 'pan-masas', apto: 'bien', duracion: '3 meses', nota: 'Sin glaseado; añádelo tras descongelar.' },
];
