/**
 * Motor del Quiz de Biología Molecular: barajado, corrección y clasificación.
 *
 * Sin dependencias de React, para poder razonarlo (y probarlo) aparte de la vista.
 */

export type Categoria = 'adn-arn' | 'replicacion' | 'transcripcion' | 'traduccion' | 'mutaciones';

/** Pregunta tal como está escrita en el banco: `correcta` es la posición en `opciones`. */
export interface Pregunta {
  id: number;
  categoria: Categoria;
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}

/**
 * Pregunta tal como se juega: opciones ya barajadas y la correcta guardada por su TEXTO.
 *
 * Hallazgo 1745: las opciones no se barajaban y en el banco la buena estaba 0 veces en la A,
 * 3 en la B, 19 en la C y 8 en la D; «siempre C» sacaba un 63 % sin saber biología. Al
 * barajar, la posición deja de significar nada, así que la corrección ya no puede ir por
 * índice: se compara la opción pulsada con la correcta por identidad (su texto, único
 * dentro de cada pregunta).
 */
export interface PreguntaEnJuego {
  id: number;
  categoria: Categoria;
  pregunta: string;
  opciones: string[];
  correcta: string;
  explicacion: string;
}

/** Fisher-Yates sobre una copia. */
export function mezclarArray<T>(arr: readonly T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function barajarOpciones(p: Pregunta): PreguntaEnJuego {
  return {
    id: p.id,
    categoria: p.categoria,
    pregunta: p.pregunta,
    explicacion: p.explicacion,
    opciones: mezclarArray(p.opciones),
    correcta: p.opciones[p.correcta],
  };
}

/**
 * Compone una partida. Se llama al pulsar «Comenzar quiz» —en el cliente, nunca al pintar
 * en el servidor—, así que el azar no provoca desajustes de hidratación. Primero se baraja
 * el ORDEN de las preguntas y después las opciones de cada una.
 */
export function componerPartida(banco: readonly Pregunta[]): PreguntaEnJuego[] {
  return mezclarArray(banco).map(barajarOpciones);
}

export function esCorrecta(p: PreguntaEnJuego, opcion: string): boolean {
  return opcion === p.correcta;
}

/**
 * Clasificación final con la escala española de calificaciones sobre 10 (RD 1125/2003,
 * art. 5.4): 0-4,9 suspenso · 5-6,9 aprobado · 7-8,9 notable · 9-10 sobresaliente. Para el
 * suspenso se usa «Insuficiente», el término de la secundaria.
 *
 * Hallazgo 1752: antes se daba «Aprobado» desde el 40 %, «Notable» desde el 60 % y
 * «Sobresaliente» desde el 80 %; un 12/30 (un 4) salía «Aprobado». Los cortes van sobre la
 * nota EXACTA, no sobre el porcentaje redondeado.
 */
export function obtenerClasificacion(aciertos: number, total: number): { texto: string; emoji: string; nota: number } {
  // aciertos·10/total y no (aciertos/total)·10: así 27/30 da 9 exacto y no 8,999…
  const nota = total > 0 ? (aciertos * 10) / total : 0;
  if (total > 0 && aciertos === total) return { texto: '¡Perfecto!', emoji: '🏆', nota };
  if (nota >= 9) return { texto: 'Sobresaliente', emoji: '🌟', nota };
  if (nota >= 7) return { texto: 'Notable', emoji: '👍', nota };
  if (nota >= 5) return { texto: 'Aprobado', emoji: '😊', nota };
  return { texto: 'Insuficiente', emoji: '😟', nota };
}
