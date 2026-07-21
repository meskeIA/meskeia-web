// Tipos de corte en cocina — datos curados
//
// Recoge los cortes clásicos de cocina (brunoise, juliana, mirepoix, chiffonade…)
// con su forma, su dimensión orientativa (la capa de valor: qué mide cada corte)
// y su uso típico o el plato en el que aparece. Las dimensiones proceden de la
// cocina clásica y pueden variar entre escuelas y regiones. Verificado: 2026-07.

export type FormaCorte = 'dados' | 'tiras' | 'laminas' | 'otros';

export const ETIQUETA_FORMA: Record<FormaCorte, string> = {
  dados: 'Dados y cubos',
  tiras: 'Tiras',
  laminas: 'Láminas y rodajas',
  otros: 'Otros',
};

export interface Corte {
  nombre: string;
  emoji: string;
  forma: FormaCorte;
  dimension: string;
  uso: string;
}

export const CORTES: Corte[] = [
  { nombre: 'Brunoise', emoji: '🔲', forma: 'dados', dimension: 'Dados de 1–3 mm', uso: 'El dado más fino; sofritos finos, guarniciones y rellenos.' },
  { nombre: 'Macedonia', emoji: '🎲', forma: 'dados', dimension: 'Dados de 4–5 mm', uso: 'Menestras, ensaladilla y macedonias de fruta.' },
  { nombre: 'Parmentier', emoji: '▪️', forma: 'dados', dimension: 'Dados de 1 cm', uso: 'Guisos, salteados y guarniciones de patata.' },
  { nombre: 'Dado grande / cubo', emoji: '⬛', forma: 'dados', dimension: 'Cubos de 1,5–2 cm', uso: 'Estofados y cocciones largas.' },
  { nombre: 'Concassé', emoji: '🍅', forma: 'dados', dimension: 'Dados de ~5 mm de tomate pelado y sin semillas', uso: 'Salsas de tomate y guarniciones.' },
  { nombre: 'Juliana', emoji: '🥢', forma: 'tiras', dimension: 'Tiras de 1–2 mm × 4–5 cm', uso: 'Salteados, wok y ensaladas.' },
  { nombre: 'Bastón (batonnet)', emoji: '🍟', forma: 'tiras', dimension: 'Bastones de 6 mm × 5–6 cm', uso: 'Patatas fritas y crudités.' },
  { nombre: 'Jardinera', emoji: '🥕', forma: 'tiras', dimension: 'Bastones de 4 mm × 3 cm', uso: 'Guarnición de verduras variadas.' },
  { nombre: 'Chiffonade', emoji: '🌿', forma: 'tiras', dimension: 'Tiras finísimas de hoja (<2 mm)', uso: 'Albahaca, espinaca y lechuga para decorar.' },
  { nombre: 'Paisana', emoji: '🔷', forma: 'laminas', dimension: 'Láminas cuadradas de ~1 cm × 1 mm', uso: 'Sopas y menestras.' },
  { nombre: 'Rodaja', emoji: '⭕', forma: 'laminas', dimension: 'Cortes transversales, grosor al gusto', uso: 'Embutido, tomate, zanahoria, patata.' },
  { nombre: 'Media luna', emoji: '🌙', forma: 'laminas', dimension: 'Rodajas partidas por la mitad', uso: 'Cebolla, calabacín y pepino.' },
  { nombre: 'Vichy', emoji: '🟠', forma: 'laminas', dimension: 'Rodajas de zanahoria de 2–3 mm', uso: 'Guarnición clásica de zanahoria glaseada.' },
  { nombre: 'Emincé (pluma)', emoji: '🧅', forma: 'laminas', dimension: 'Láminas muy finas', uso: 'Cebolla pochada y champiñón laminado.' },
  { nombre: 'Mirepoix', emoji: '🧩', forma: 'otros', dimension: 'Corte irregular de ~1–1,5 cm', uso: 'Base aromática de fondos y guisos (no se come).' },
  { nombre: 'Picado / cincelado', emoji: '🔪', forma: 'otros', dimension: 'Muy pequeño e irregular', uso: 'Ajo, perejil y cebolla picados.' },
];
