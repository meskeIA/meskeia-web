// Maíces y nixtamal — datos curados
//
// El maíz, originario de Mesoamérica, tiene muchas variedades y formas de uso. La
// nixtamalización —cocer el grano con cal— es clave: mejora su valor nutricional y
// permite moler la masa de las tortillas. Aquí se recogen los tipos y productos
// más habituales del maíz. Verificado: 2026-06.

export interface Maiz {
  nombre: string;
  emoji: string;
  uso: string;
  nota: string;
}

export const MAICES: Maiz[] = [
  { nombre: 'Maíz dulce (elote)', emoji: '🌽', uso: 'En mazorca, hervido o asado; en grano para ensaladas.', nota: 'El de mesa; tierno y azucarado.' },
  { nombre: 'Maíz cacahuazintle (pozolero)', emoji: '🌽', uso: 'Pozole; grano grande nixtamalizado.', nota: 'Se abre como flor al cocer.' },
  { nombre: 'Maíz blanco', emoji: '🌽', uso: 'Masa de tortillas, arepas, tamales.', nota: 'El más usado para masa nixtamalizada.' },
  { nombre: 'Maíz azul / morado', emoji: '🌽', uso: 'Tortillas azules, chicha morada (Perú).', nota: 'Antocianinas: color intenso y antioxidantes.' },
  { nombre: 'Masa nixtamalizada', emoji: '🫓', uso: 'Tortillas, sopes, tamales recién hechos.', nota: 'Maíz cocido con cal y molido; base de la cocina mexicana.' },
  { nombre: 'Masa harina (harina de maíz nixtamalizado)', emoji: '🌾', uso: 'Tortillas y antojitos rehidratando con agua.', nota: 'Versión seca de la masa; cómoda para casa.' },
  { nombre: 'Harina de maíz precocida (arepa)', emoji: '🌽', uso: 'Arepas, hallacas (Venezuela y Colombia).', nota: 'Distinta de la masa nixtamalizada mexicana.' },
  { nombre: 'Polenta / sémola de maíz', emoji: '🥣', uso: 'Polenta cremosa o firme a la plancha.', nota: 'Grano molido grueso, sin nixtamalizar.' },
  { nombre: 'Maicena (almidón de maíz)', emoji: '🥣', uso: 'Espesar salsas y cremas; repostería sin gluten.', nota: 'Solo el almidón; espesa el doble que la harina.' },
  { nombre: 'Maíz para palomitas', emoji: '🍿', uso: 'Palomitas; el grano revienta con el calor.', nota: 'Variedad de cáscara dura que atrapa el vapor.' },
];
