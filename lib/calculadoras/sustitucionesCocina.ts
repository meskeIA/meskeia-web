// Sustituciones de ingredientes en cocina y repostería — datos curados
//
// Resuelve dos necesidades muy buscadas: «se me acabó X, ¿con qué lo cambio?» y
// «quiero adaptar la receta a vegana / sin gluten / sin lactosa». Cada sustitución
// lleva proporción concreta, en qué casos funciona y para qué dietas sirve.
//
// Proporciones de referencia: guías de repostería (King Arthur, BBC Good Food) y
// equivalencias estándar. Son orientativas: la textura final puede variar.
// Verificado: 2026-06.

export type EtiquetaDieta = 'vegano' | 'sin-gluten' | 'sin-lactosa';

export const ETIQUETAS_DIETA: Record<EtiquetaDieta, string> = {
  vegano: 'Vegano',
  'sin-gluten': 'Sin gluten',
  'sin-lactosa': 'Sin lactosa',
};

export interface Sustitucion {
  reemplazo: string;
  proporcion: string;
  notas: string;
  apto: EtiquetaDieta[];
}

export interface IngredienteSustituible {
  id: string;
  nombre: string;
  emoji: string;
  contexto: string;
  sustituciones: Sustitucion[];
}

export const INGREDIENTES_SUSTITUIBLES: IngredienteSustituible[] = [
  {
    id: 'huevo',
    nombre: 'Huevo',
    emoji: '🥚',
    contexto: 'En repostería el huevo liga, da humedad y ayuda a subir. Cada sustituto cubre mejor una de esas funciones (1 huevo ≈ 50 g).',
    sustituciones: [
      { reemplazo: 'Linaza o chía molida + agua', proporcion: '1 cda molida + 3 cda de agua (reposar 5–10 min) = 1 huevo', notas: 'Forma un gel que liga bien. Ideal en bizcochos, magdalenas y galletas rústicas.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
      { reemplazo: 'Puré de manzana sin azúcar', proporcion: '60 g (¼ taza) = 1 huevo', notas: 'Aporta humedad y liga; deja la miga más densa. Bien en bizcochos.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
      { reemplazo: 'Plátano maduro machacado', proporcion: '½ plátano (≈ 60 g) = 1 huevo', notas: 'Liga y endulza, pero aporta sabor a plátano. Para bizcochos y panes dulces.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
      { reemplazo: 'Aquafaba (líquido de garbanzo)', proporcion: '3 cda = 1 huevo (2 cda = 1 clara)', notas: 'Se monta como las claras: perfecta para merengues, mousses y bizcochos esponjosos.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
      { reemplazo: 'Yogur natural', proporcion: '60 g = 1 huevo', notas: 'Aporta humedad y liga. Usa yogur vegetal para versión sin lactosa.', apto: [] },
    ],
  },
  {
    id: 'mantequilla',
    nombre: 'Mantequilla',
    emoji: '🧈',
    contexto: 'Aporta grasa, sabor y estructura. Según la receta puedes buscar otra grasa o aligerar parte con purés (100 g de referencia).',
    sustituciones: [
      { reemplazo: 'Aceite suave (girasol, oliva suave)', proporcion: '80 g de aceite = 100 g de mantequilla', notas: 'Deja la miga más húmeda y tierna. No sirve para masas que necesitan grasa sólida (hojaldre).', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
      { reemplazo: 'Margarina vegetal', proporcion: '100 g = 100 g (1:1)', notas: 'Sustituto directo. Comprueba que sea 100% vegetal para versión vegana.', apto: ['vegano', 'sin-lactosa'] },
      { reemplazo: 'Aceite de coco', proporcion: '100 g = 100 g (1:1)', notas: 'Sólido a temperatura ambiente, se comporta parecido a la mantequilla. Aporta ligero sabor.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
      { reemplazo: 'Puré de manzana o de aguacate', proporcion: 'Sustituye hasta la mitad de la grasa', notas: 'Para aligerar bizcochos. Reemplazar toda la grasa reseca la miga; cambia solo la mitad.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
    ],
  },
  {
    id: 'azucar-blanco',
    nombre: 'Azúcar blanco',
    emoji: '🍬',
    contexto: 'Endulza, da humedad y ayuda al dorado. Los sustitutos líquidos obligan a ajustar el resto de líquidos (100 g de referencia).',
    sustituciones: [
      { reemplazo: 'Azúcar moreno o panela', proporcion: '100 g = 100 g (1:1)', notas: 'Aporta humedad y sabor a melaza. La miga queda algo más densa y oscura.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
      { reemplazo: 'Miel', proporcion: '75 g de miel = 100 g de azúcar', notas: 'Reduce el resto de líquidos en 1–2 cda y baja el horno 10 °C: se dora antes. No es vegana.', apto: ['sin-gluten', 'sin-lactosa'] },
      { reemplazo: 'Sirope de arce o de agave', proporcion: '75 g = 100 g de azúcar', notas: 'Como la miel: ajusta líquidos y vigila el dorado. Opción vegana.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
      { reemplazo: 'Eritritol u otro edulcorante', proporcion: 'Según la tabla del fabricante', notas: 'No carameliza ni dora igual; la textura cambia. Útil para reducir azúcar.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
    ],
  },
  {
    id: 'leche',
    nombre: 'Leche',
    emoji: '🥛',
    contexto: 'Aporta líquido y algo de grasa. Casi cualquier bebida vegetal la sustituye bien (250 ml de referencia).',
    sustituciones: [
      { reemplazo: 'Bebida de soja, avena o almendra', proporcion: '250 ml = 250 ml (1:1)', notas: 'Sustituto directo. La de avena y la de soja son las más neutras para repostería.', apto: ['vegano', 'sin-lactosa'] },
      { reemplazo: 'Leche sin lactosa', proporcion: '250 ml = 250 ml (1:1)', notas: 'Idéntica en cocción; solo cambia para quien no tolera la lactosa.', apto: ['sin-lactosa'] },
      { reemplazo: 'Leche evaporada + agua', proporcion: '125 ml de evaporada + 125 ml de agua', notas: 'Opción de despensa cuando no hay leche fresca.', apto: [] },
    ],
  },
  {
    id: 'suero-leche',
    nombre: 'Suero de leche (buttermilk)',
    emoji: '🥛',
    contexto: 'Habitual en recetas estadounidenses (tortitas, bizcochos). Su acidez activa el bicarbonato; se imita fácil (250 ml de referencia).',
    sustituciones: [
      { reemplazo: 'Leche + zumo de limón o vinagre', proporcion: '250 ml de leche + 1 cda de limón/vinagre (reposar 5–10 min)', notas: 'La leche se corta ligeramente y aporta la acidez que necesita la receta.', apto: [] },
      { reemplazo: 'Bebida vegetal + limón o vinagre', proporcion: '250 ml de bebida de soja + 1 cda de limón/vinagre', notas: 'Versión vegana del truco anterior; la soja cuaja mejor que otras bebidas.', apto: ['vegano', 'sin-lactosa'] },
      { reemplazo: 'Yogur diluido', proporcion: '180 g de yogur + 70 ml de agua o leche', notas: 'Aporta acidez y cuerpo. Usa yogur vegetal para versión sin lactosa.', apto: [] },
    ],
  },
  {
    id: 'harina-trigo',
    nombre: 'Harina de trigo',
    emoji: '🌾',
    contexto: 'Da estructura por el gluten. Sin gluten no hay un sustituto 1:1 perfecto, pero sí buenas opciones según el uso.',
    sustituciones: [
      { reemplazo: 'Mezcla comercial sin gluten 1:1', proporcion: '100 g = 100 g (1:1)', notas: 'La opción más fiable: ya lleva almidones y goma para imitar el gluten.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
      { reemplazo: 'Harina de arroz + almidón + goma xantana', proporcion: '70 g arroz + 30 g almidón + ½ cdta xantana por cada 100 g', notas: 'Mezcla casera sin gluten. La xantana aporta la elasticidad que falta.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
      { reemplazo: 'Maicena (solo para espesar)', proporcion: 'La mitad: 1 cda de maicena = 2 cda de harina', notas: 'Para salsas y cremas, no para masas. Espesa el doble que la harina.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
      { reemplazo: 'Harina de almendra', proporcion: 'No sustituye 1:1', notas: 'Da humedad y sabor pero no estructura; solo en recetas pensadas para ella.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
    ],
  },
  {
    id: 'levadura-quimica',
    nombre: 'Levadura química (polvo de hornear)',
    emoji: '🫧',
    contexto: 'Hace subir las masas rápidas. Se puede improvisar con bicarbonato y un ácido (1 cdta de referencia).',
    sustituciones: [
      { reemplazo: 'Bicarbonato + crémor tártaro', proporcion: '¼ cdta de bicarbonato + ½ cdta de crémor = 1 cdta de polvo de hornear', notas: 'La mezcla clásica. Úsala al momento, no la guardes preparada.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
      { reemplazo: 'Bicarbonato + ácido de la receta', proporcion: '¼ cdta de bicarbonato por cada cdta de polvo, si hay yogur, limón o vinagre', notas: 'Aprovecha la acidez ya presente en la masa para activar el bicarbonato.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
    ],
  },
  {
    id: 'nata',
    nombre: 'Nata para montar',
    emoji: '🍶',
    contexto: 'Aporta grasa y volumen al montarla. Las alternativas vegetales montan si están bien frías (250 ml de referencia).',
    sustituciones: [
      { reemplazo: 'Nata vegetal para montar', proporcion: '250 ml = 250 ml (1:1)', notas: 'Específica para montar (soja o coco). Monta mejor muy fría.', apto: ['vegano', 'sin-lactosa'] },
      { reemplazo: 'Parte sólida de leche de coco', proporcion: 'La crema de 1 lata refrigerada 12 h', notas: 'Se monta como la nata y aporta sabor a coco. Refrigera la lata boca abajo.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
      { reemplazo: 'Leche evaporada bien fría', proporcion: '250 ml muy fríos', notas: 'Monta con dificultad y baja el volumen rápido; úsala recién montada.', apto: [] },
    ],
  },
  {
    id: 'pan-rallado',
    nombre: 'Pan rallado',
    emoji: '🍞',
    contexto: 'Para empanar y ligar. Varias opciones de despensa cubren su función (rebozados y albóndigas).',
    sustituciones: [
      { reemplazo: 'Copos de avena triturados', proporcion: '1:1 en volumen', notas: 'Ligan masas de albóndigas y hamburguesas; quedan algo más rústicos.', apto: ['vegano', 'sin-lactosa'] },
      { reemplazo: 'Copos de maíz o nachos triturados', proporcion: '1:1 en volumen', notas: 'Para empanar: rebozado más crujiente. Comprueba que no lleven gluten si lo necesitas.', apto: ['vegano', 'sin-lactosa'] },
      { reemplazo: 'Harina de almendra o frutos secos molidos', proporcion: '1:1 en volumen', notas: 'Empanado sin gluten con sabor a fruto seco. Se dora rápido, vigila el fuego.', apto: ['vegano', 'sin-gluten', 'sin-lactosa'] },
    ],
  },
];

export const INGREDIENTE_SUSTITUIBLE_POR_ID: Record<string, IngredienteSustituible> =
  INGREDIENTES_SUSTITUIBLES.reduce<Record<string, IngredienteSustituible>>((acc, ing) => {
    acc[ing.id] = ing;
    return acc;
  }, {});

/**
 * Devuelve las sustituciones de un ingrediente, filtradas opcionalmente por una
 * etiqueta de dieta (vegano / sin gluten / sin lactosa).
 */
export function sustitucionesDe(
  ingredienteId: string,
  dieta: EtiquetaDieta | null,
): Sustitucion[] {
  const ing = INGREDIENTE_SUSTITUIBLE_POR_ID[ingredienteId];
  if (!ing) return [];
  if (!dieta) return ing.sustituciones;
  return ing.sustituciones.filter((s) => s.apto.includes(dieta));
}
