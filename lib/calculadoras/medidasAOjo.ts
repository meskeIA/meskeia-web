// Medidas "a ojo" — datos curados
//
// Las recetas están llenas de medidas imprecisas: una pizca, un chorro, un vaso,
// un puñado. Aquí se traducen a una cantidad aproximada para que puedas pesarlas o
// medirlas cuando lo necesites. Son equivalencias orientativas: cada cocina tiene
// su mano. Verificado: 2026-06.

export interface MedidaOjo {
  nombre: string;
  emoji: string;
  equivalencia: string;
  nota: string;
}

export const MEDIDAS_OJO: MedidaOjo[] = [
  { nombre: 'Pizca', emoji: '🤏', equivalencia: '≈ 0,3 g (lo que cogen 2-3 dedos)', nota: 'Sobre todo para sal, especias y levadura.' },
  { nombre: 'Pellizco', emoji: '🤏', equivalencia: '≈ 0,5–1 g', nota: 'Algo más que una pizca; con dos dedos generosos.' },
  { nombre: 'Chorrito', emoji: '💧', equivalencia: '≈ 5 ml (1 cucharadita)', nota: 'Para vinagre, salsa de soja, esencias.' },
  { nombre: 'Chorro', emoji: '🫗', equivalencia: '≈ 15 ml (1 cucharada)', nota: 'Un golpe de aceite o vino.' },
  { nombre: 'Cucharadita (de café)', emoji: '🥄', equivalencia: '5 ml · ≈ 5 g de líquido', nota: 'Rasa salvo que la receta diga "colmada".' },
  { nombre: 'Cucharada (sopera)', emoji: '🥄', equivalencia: '15 ml · ≈ 15 g de líquido', nota: 'El triple que una cucharadita.' },
  { nombre: 'Vaso de agua', emoji: '🥛', equivalencia: '≈ 200–250 ml', nota: 'El vaso "normal"; varía según el vaso.' },
  { nombre: 'Vaso de vino', emoji: '🍷', equivalencia: '≈ 100–125 ml', nota: 'La mitad de un vaso de agua.' },
  { nombre: 'Taza', emoji: '☕', equivalencia: '≈ 240 ml', nota: 'La taza estándar de las recetas en tazas.' },
  { nombre: 'Puñado', emoji: '✊', equivalencia: '≈ 30 g (frutos secos, hojas)', nota: 'Lo que cabe en una mano cerrada.' },
  { nombre: 'Nuez de mantequilla', emoji: '🧈', equivalencia: '≈ 15 g', nota: 'Un trozo del tamaño de una nuez.' },
  { nombre: 'Diente de ajo', emoji: '🧄', equivalencia: '≈ 4–6 g (≈ 1 cucharadita picado)', nota: 'Un gajo de la cabeza de ajo.' },
];
