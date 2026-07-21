// Puntos de humo de aceites y grasas de cocina — datos curados
//
// El punto de humo es la temperatura a la que una grasa empieza a humear y
// degradarse. Es un valor ORIENTATIVO: varía mucho según el refinado, la
// calidad y la antigüedad del aceite. Un mismo aceite refinado aguanta bastante
// más que sin refinar. Las bandas agrupan el uso recomendado:
//   crudo = aliño / no calentar
//   media = salteado y plancha suave
//   alta  = fritura y wok
// Verificado: 2026-07.

export type Banda = 'crudo' | 'media' | 'alta';

export const ETIQUETA_BANDA: Record<Banda, string> = {
  crudo: 'En crudo', media: 'Calor medio', alta: 'Calor alto',
};

export interface Aceite {
  nombre: string;
  emoji: string;
  puntoC: number;      // punto de humo aproximado en °C
  banda: Banda;
  refinado: string;    // 'sin refinar' | 'refinado' | '—'
  uso: string;
}

export const ACEITES: Aceite[] = [
  { nombre: 'Aceite de aguacate (refinado)', emoji: '🥑', puntoC: 270, banda: 'alta', refinado: 'refinado', uso: 'El más estable al calor; ideal para fritura y wok.' },
  { nombre: 'Mantequilla clarificada / ghee', emoji: '🧈', puntoC: 250, banda: 'alta', refinado: 'refinado', uso: 'Aguanta más que la mantequilla porque no lleva sólidos lácteos.' },
  { nombre: 'Aceite de girasol alto oleico', emoji: '🌻', puntoC: 230, banda: 'alta', refinado: 'refinado', uso: 'Muy estable; buena opción para freír.' },
  { nombre: 'Aceite de cacahuete', emoji: '🥜', puntoC: 230, banda: 'alta', refinado: 'refinado', uso: 'Clásico del wok y de la fritura asiática.' },
  { nombre: 'Aceite de maíz', emoji: '🌽', puntoC: 230, banda: 'alta', refinado: 'refinado', uso: 'Neutro; fritura y repostería.' },
  { nombre: 'Aceite de girasol (refinado)', emoji: '🌻', puntoC: 225, banda: 'alta', refinado: 'refinado', uso: 'El de freír más común; sabor neutro.' },
  { nombre: 'Aceite de colza / canola (refinado)', emoji: '🌼', puntoC: 220, banda: 'alta', refinado: 'refinado', uso: 'Neutro y estable; muy usado fuera de España.' },
  { nombre: 'Aceite de pepita de uva', emoji: '🍇', puntoC: 215, banda: 'alta', refinado: 'refinado', uso: 'Ligero y neutro; plancha y fritura.' },
  { nombre: 'Aceite de oliva (refinado / suave)', emoji: '🫒', puntoC: 210, banda: 'alta', refinado: 'refinado', uso: 'Más neutro que el virgen; aguanta bien el calor.' },
  { nombre: 'Aceite de sésamo (refinado)', emoji: '🫙', puntoC: 210, banda: 'alta', refinado: 'refinado', uso: 'El claro; para cocinar (el tostado, no).' },
  { nombre: 'Manteca de cerdo', emoji: '🐖', puntoC: 190, banda: 'media', refinado: '—', uso: 'Da sabor a masas y frituras tradicionales.' },
  { nombre: 'Aceite de oliva virgen extra (AOVE)', emoji: '🫒', puntoC: 190, banda: 'media', refinado: 'sin refinar', uso: 'Aguanta más de lo que dice el mito; para plancha y fritura moderada, aunque pierde matices.' },
  { nombre: 'Aceite de coco virgen', emoji: '🥥', puntoC: 175, banda: 'media', refinado: 'sin refinar', uso: 'Sabor a coco; el refinado sube a ~200 °C.' },
  { nombre: 'Aceite de sésamo tostado', emoji: '🍶', puntoC: 175, banda: 'crudo', refinado: 'sin refinar', uso: 'De acabado: un chorrito al final, no para cocinar.' },
  { nombre: 'Aceite de nuez', emoji: '🌰', puntoC: 160, banda: 'crudo', refinado: 'sin refinar', uso: 'Solo en crudo, para aliñar; se quema fácil.' },
  { nombre: 'Mantequilla', emoji: '🧈', puntoC: 150, banda: 'media', refinado: '—', uso: 'Se dora y quema pronto; para saltear suave o mezclada con aceite.' },
  { nombre: 'Aceite de lino (linaza)', emoji: '🌱', puntoC: 107, banda: 'crudo', refinado: 'sin refinar', uso: 'NUNCA calentar; solo en frío por su omega-3.' },
];
