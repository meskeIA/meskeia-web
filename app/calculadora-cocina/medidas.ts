/**
 * Unidades y densidades de la calculadora de cocina, en un módulo sin dependencias para que el
 * conversor (page.tsx) y los textos que se escriben en el servidor (FAQ de metadata.ts) lean las
 * MISMAS cifras. La FAQ «¿Cómo medir ingredientes secos sin báscula?» conservaba los valores
 * colmados que la reparación del 548 quitó de la tarjeta de al lado (hallazgo 3853).
 *
 * UN SOLO SISTEMA DE VOLUMEN (hallazgo 3850, 16/11/2026): el del etiquetado nutricional de
 * EE. UU. (21 CFR 101.9(b)(5)(viii)): taza 240 ml, onza líquida 30 ml, cucharada 15 ml,
 * cucharadita 5 ml. En él 1 taza = 8 fl oz = 16 cucharadas y 1 fl oz = 2 cucharadas, como en el
 * sistema tradicional (taza 236,588 ml, fl oz 29,5735 ml). Antes la app mezclaba los dos: taza
 * y cucharada del etiquetado con la fl oz tradicional, y 1 taza daba 8,12 fl oz.
 */

export interface ConversionUnidad {
  nombre: string;
  aGramos: number; // Factor de conversión a gramos (o ml para líquidos)
  categoria: 'peso' | 'volumen' | 'temperatura';
}

export const unidadesCocina: Record<string, ConversionUnidad> = {
  // Peso
  'gramos': { nombre: 'Gramos (g)', aGramos: 1, categoria: 'peso' },
  'kilogramos': { nombre: 'Kilogramos (kg)', aGramos: 1000, categoria: 'peso' },
  'onzas': { nombre: 'Onzas (oz)', aGramos: 28.3495, categoria: 'peso' },
  'libras': { nombre: 'Libras (lb)', aGramos: 453.592, categoria: 'peso' },
  // Volumen (sistema del etiquetado de EE. UU., ver cabecera)
  'mililitros': { nombre: 'Mililitros (ml)', aGramos: 1, categoria: 'volumen' },
  'litros': { nombre: 'Litros (L)', aGramos: 1000, categoria: 'volumen' },
  'tazas': { nombre: 'Tazas (cup)', aGramos: 240, categoria: 'volumen' },
  'cucharadas': { nombre: 'Cucharadas (tbsp)', aGramos: 15, categoria: 'volumen' },
  'cucharaditas': { nombre: 'Cucharaditas (tsp)', aGramos: 5, categoria: 'volumen' },
  'onzas-liquidas': { nombre: 'Onzas líquidas (fl oz)', aGramos: 30, categoria: 'volumen' },
};

/**
 * Densidades aproximadas para conversión peso↔volumen, en g/ml.
 *
 * Se contrastan con la tabla de pesos de King Arthur Baking, que es la referencia habitual
 * en repostería y mide «spooned & levelled» (cucharear y enrasar), no compactando.
 * Verificado: 2026-08-23.
 *
 * ⚠️ El cacao estaba en 0,52 g/ml, que da 124,80 g por taza de 240 ml: es el valor de cacao
 * COMPACTADO. King Arthur da 1/2 taza = 42 g, es decir 84 g por taza, y las demás tablas lo
 * sitúan en torno a 85 g. Se pasaba entre un 25 % y un 47 %, y era la única de las doce que
 * no cuadraba (hallazgo 144 del Inspector, 21/08/2026).
 */
export const densidadesIngredientes: Record<string, number> = {
  'agua': 1,
  'leche': 1.03,
  'aceite': 0.92,
  'harina': 0.53,
  'azucar': 0.85,
  'azucar-glass': 0.48,
  'sal': 1.2,
  'arroz': 0.75,
  'miel': 1.42,
  'mantequilla': 0.946,
  'cacao': 0.35,   // 84 g por taza de 240 ml (King Arthur: 1/2 taza = 42 g)
  'avena': 0.4,
};

/**
 * Cuántos gramos pesan `ml` de `ingrediente`, con la misma densidad que usa el conversor.
 * Las tarjetas educativas escribían estas cifras a mano y se desincronizaban del motor:
 * «1 cuchara sopera = 10 g de harina» cuando el conversor da 7,95 g (hallazgo 548).
 */
export const gramosDeIngrediente = (ml: number, ingrediente: string): number =>
  Math.round(ml * densidadesIngredientes[ingrediente]);
