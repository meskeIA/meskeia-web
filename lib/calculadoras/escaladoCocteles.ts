// Escalado de cócteles y graduación de la mezcla — lógica pura
//
// Escala un cóctel al número de copas que necesites y calcula la graduación
// alcohólica final de la mezcla (% vol). Tiene en cuenta la dilución por hielo:
// al remover o agitar, el hielo se derrite y rebaja la graduación. Es solo una
// estimación orientativa. Verificado: 2026-06.

export interface IngredienteCoctel {
  nombre: string;
  ml: number;
  abv: number; // % de alcohol del ingrediente
}

export interface Coctel {
  id: string;
  nombre: string;
  emoji: string;
  prep: 'removido' | 'agitado' | 'directo';
  ingredientes: IngredienteCoctel[];
}

// Dilución aproximada por método (fracción de agua añadida sobre el volumen).
const DILUCION: Record<Coctel['prep'], number> = { removido: 0.25, agitado: 0.3, directo: 0.1 };

export const COCTELES: Coctel[] = [
  { id: 'negroni', nombre: 'Negroni', emoji: '🍊', prep: 'removido', ingredientes: [
    { nombre: 'Ginebra', ml: 30, abv: 40 }, { nombre: 'Campari', ml: 30, abv: 25 }, { nombre: 'Vermut rojo', ml: 30, abv: 15 } ] },
  { id: 'margarita', nombre: 'Margarita', emoji: '🍸', prep: 'agitado', ingredientes: [
    { nombre: 'Tequila', ml: 50, abv: 40 }, { nombre: 'Triple seco', ml: 20, abv: 30 }, { nombre: 'Zumo de lima', ml: 20, abv: 0 } ] },
  { id: 'daiquiri', nombre: 'Daiquiri', emoji: '🍹', prep: 'agitado', ingredientes: [
    { nombre: 'Ron blanco', ml: 60, abv: 40 }, { nombre: 'Zumo de lima', ml: 25, abv: 0 }, { nombre: 'Almíbar', ml: 15, abv: 0 } ] },
  { id: 'mojito', nombre: 'Mojito', emoji: '🌿', prep: 'directo', ingredientes: [
    { nombre: 'Ron blanco', ml: 50, abv: 40 }, { nombre: 'Zumo de lima', ml: 20, abv: 0 }, { nombre: 'Almíbar', ml: 15, abv: 0 }, { nombre: 'Soda', ml: 60, abv: 0 } ] },
  { id: 'gin-tonic', nombre: 'Gin-tonic', emoji: '🥃', prep: 'directo', ingredientes: [
    { nombre: 'Ginebra', ml: 50, abv: 40 }, { nombre: 'Tónica', ml: 150, abv: 0 } ] },
  { id: 'aperol-spritz', nombre: 'Aperol Spritz', emoji: '🧡', prep: 'directo', ingredientes: [
    { nombre: 'Aperol', ml: 60, abv: 11 }, { nombre: 'Cava o prosecco', ml: 90, abv: 11 }, { nombre: 'Soda', ml: 30, abv: 0 } ] },
];

export const COCTEL_POR_ID: Record<string, Coctel> = COCTELES.reduce<Record<string, Coctel>>(
  (acc, c) => { acc[c.id] = c; return acc; }, {});

export interface IngredienteEscalado { nombre: string; ml: number; }

export interface ResultadoCoctel {
  ingredientes: IngredienteEscalado[];
  volumenPorCopa: number; // ml por copa con dilución
  abvFinal: number; // % vol de la mezcla con dilución
}

export function escalarCoctel(coctelId: string, numCopas: number): ResultadoCoctel | null {
  const c = COCTEL_POR_ID[coctelId];
  if (!c || !(numCopas > 0)) return null;

  const baseMl = c.ingredientes.reduce((s, i) => s + i.ml, 0);
  const alcoholMl = c.ingredientes.reduce((s, i) => s + (i.ml * i.abv) / 100, 0);
  const dil = DILUCION[c.prep];
  const volConDilucion = baseMl * (1 + dil);
  const abvFinal = volConDilucion > 0 ? (alcoholMl / volConDilucion) * 100 : 0;

  return {
    ingredientes: c.ingredientes.map((i) => ({ nombre: i.nombre, ml: Math.round(i.ml * numCopas) })),
    volumenPorCopa: Math.round(volConDilucion),
    abvFinal: Math.round(abvFinal * 10) / 10,
  };
}
