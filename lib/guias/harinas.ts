// Tipos de harina — datos curados
//
// La "fuerza" de una harina (valor W) mide su capacidad para formar gluten y
// retener gas: a más W, más fuerza y más aguante para masas largas y enriquecidas.
// El porcentaje de proteína es un buen indicador en el etiquetado doméstico. Aquí
// se recogen harinas habituales con su fuerza, proteína y usos. Verificado: 2026-06.

export interface Harina {
  nombre: string;
  emoji: string;
  w: string; // valor W o '—'
  proteina: string; // % aprox.
  usos: string;
  nota: string;
}

export const HARINAS: Harina[] = [
  { nombre: 'Floja / de repostería', emoji: '🧁', w: 'W < 160', proteina: '8–9%', usos: 'Bizcochos, galletas, magdalenas.', nota: 'Poco gluten: miga tierna y desmenuzable.' },
  { nombre: 'Panificable / media fuerza', emoji: '🍞', w: 'W 160–250', proteina: '10–11%', usos: 'Pan común, masas de levado corto.', nota: 'La "todo uso"; equilibrio para el día a día.' },
  { nombre: 'De fuerza', emoji: '🥐', w: 'W 250–350', proteina: '12–13%', usos: 'Brioche, roscón, masas enriquecidas.', nota: 'Aguanta grasa y azúcar sin perder estructura.' },
  { nombre: 'Gran fuerza / Manitoba', emoji: '🍞', w: 'W > 350', proteina: '14%+', usos: 'Panettone, masas de fermentación muy larga.', nota: 'Mucho gluten; a menudo se mezcla con otras.' },
  { nombre: 'Integral de trigo', emoji: '🌾', w: 'Variable', proteina: '12–14%', usos: 'Pan integral; aporta fibra y sabor.', nota: 'El salvado "corta" el gluten: panes más densos.' },
  { nombre: 'Sémola de trigo duro', emoji: '🍝', w: '—', proteina: '12–13%', usos: 'Pasta fresca y seca, algunos panes.', nota: 'Grano duro; da firmeza al dente.' },
  { nombre: 'Espelta', emoji: '🌾', w: 'Media', proteina: '12–15%', usos: 'Panes con sabor; alternativa al trigo común.', nota: 'Gluten más frágil; amasa con suavidad.' },
  { nombre: 'Centeno', emoji: '🌾', w: '—', proteina: '8–10%', usos: 'Pan de centeno, masa madre.', nota: 'Poco gluten y mucha pentosana: masas pegajosas.' },
  { nombre: 'De maíz (masa / arepa)', emoji: '🌽', w: '—', proteina: '7–9%', usos: 'Tortillas, arepas, polenta.', nota: 'Sin gluten; la nixtamalizada da la masa de tortilla.' },
  { nombre: 'De arroz', emoji: '🍚', w: '—', proteina: '6–7%', usos: 'Repostería sin gluten, rebozados crujientes.', nota: 'Sin gluten; necesita aglutinantes en panadería.' },
  { nombre: 'De garbanzo', emoji: '🫘', w: '—', proteina: '20–22%', usos: 'Farinata, tortillitas, rebozados.', nota: 'Sin gluten; mucha proteína y sabor propio.' },
  { nombre: 'De almendra', emoji: '🌰', w: '—', proteina: '21%', usos: 'Macarons, repostería sin gluten.', nota: 'Aporta grasa y humedad; no da estructura.' },
];
