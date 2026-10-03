/**
 * Motor del sonido de visualizador-escalas-musicales (S0177, 03/10/2026): qué notas suenan,
 * en qué orden y a qué frecuencia. Sin dependencias ni Web Audio: la página solo programa
 * osciladores con lo que esto devuelve. Probado en `tests/escalas-sonido-motor.spec.ts`.
 *
 * Por qué: la app tenía un 67 % de retorno sin un solo evento de aula —gente que practica—
 * y era MUDA, mientras su propio texto pedía «escucha cuál encaja mejor» y «practica cada
 * escala a tempo lento». El sonido es justo lo que un chat no puede dar.
 *
 * Convención MIDI: Do central (C4) = 60 y La 440 Hz (A4) = 69, temperamento igual:
 *     f = 440 · 2^((midi − 69) / 12)
 * La escala arranca en la octava del Do central (de C4 a B4 según la tónica) y sube hasta
 * la octava de su tónica, que es como se estudia: la escala «cerrada».
 */

export const MIDI_DO_CENTRAL = 60;
const MIDI_LA_440 = 69;

export type Recorrido = 'subir' | 'bajar' | 'subir-bajar';

/** Frecuencia en Hz de una nota MIDI, en temperamento igual con La = 440 Hz. */
export function frecuenciaMidi(midi: number): number {
  return 440 * Math.pow(2, (midi - MIDI_LA_440) / 12);
}

/** Nota MIDI de cada grado de la escala, en la octava en que se toca (sin la octava de cierre). */
export function notasMidiEscala(notaRaiz: number, intervalos: readonly number[]): number[] {
  const base = MIDI_DO_CENTRAL + notaRaiz;
  return intervalos.map(i => base + i);
}

/**
 * La secuencia que suena al pulsar «Escuchar», con la octava de la tónica como cierre.
 * En «subir y bajar» la nota de arriba suena una sola vez, como se toca.
 */
export function secuenciaEscala(notaRaiz: number, intervalos: readonly number[], recorrido: Recorrido): number[] {
  const grados = notasMidiEscala(notaRaiz, intervalos);
  const subida = [...grados, MIDI_DO_CENTRAL + notaRaiz + 12];
  const bajada = [...subida].reverse();
  if (recorrido === 'subir') return subida;
  if (recorrido === 'bajar') return bajada;
  return [...subida, ...bajada.slice(1)];
}

/**
 * A qué grado de la escala (índice en `intervalos`) corresponde una nota de la secuencia,
 * para resaltar su ficha mientras suena. La octava de cierre es otra vez la tónica (0).
 * Devuelve -1 si la nota no es de la escala.
 */
export function gradoDeNota(midi: number, notaRaiz: number, intervalos: readonly number[]): number {
  const relativa = (((midi - MIDI_DO_CENTRAL - notaRaiz) % 12) + 12) % 12;
  return intervalos.indexOf(relativa);
}

/** Segundos que dura cada nota a un tempo dado, en notas por minuto. */
export function segundosPorNota(notasPorMinuto: number): number {
  return 60 / notasPorMinuto;
}
