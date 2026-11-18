/**
 * Preguntas que la página pinta en su FAQ visible y metadata.ts declara en el FAQPage (§1.ter):
 * una sola fuente. Hallazgo 5154 (18/11/2026): la de los factores de la elasticidad iba dos veces,
 * con dos redacciones de los mismos cuatro factores.
 */

export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

export const FAQ_FACTORES: PreguntaFrecuente = {
  pregunta: '¿Qué factores hacen que una demanda sea más elástica?',
  respuesta:
    'Cuatro factores aumentan la elasticidad: 1) la existencia de sustitutivos cercanos (si hay alternativas, los consumidores las usan al subir el precio); 2) que el bien suponga un gasto alto sobre la renta (más incentivo para buscar alternativas); 3) que sea un bien de lujo y no de primera necesidad; y 4) un horizonte temporal largo (a largo plazo hay más opciones de adaptación).',
};
