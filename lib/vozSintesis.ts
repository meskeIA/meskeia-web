/**
 * Qué voz usa la síntesis de voz del navegador (Web Speech API).
 *
 * Por qué existe (cabo C0738, 14/11/2026): tablero-comunicacion y components/TextToSpeech
 * tomaban la PRIMERA voz cuyo idioma empezaba por «es», y teclado-barrido-switch y
 * guia-respiracion solo fijaban `lang`, dejando que eligiera el navegador. Donde hay una voz en
 * línea delante (en Chrome, «Google español»), el texto se sintetiza en un servidor remoto: sale
 * del equipo y sin conexión no suena, aunque haya una voz española instalada en el sistema. En un
 * tablero de comunicación, lo que se envía son los mensajes de una persona sin habla.
 *
 * Receta del hallazgo 3959 (lector-texto-voz): por defecto, una voz con `localService !== false`;
 * la remota, solo si el sistema no tiene ninguna local en ese idioma.
 */

/** ¿La síntesis de esta voz se hace en el propio dispositivo? */
export function esVozLocal(voz: SpeechSynthesisVoice): boolean {
  return voz.localService !== false;
}

/**
 * La voz para un idioma («es-ES» o «es»): la primera LOCAL de ese idioma; si no hay ninguna, la
 * primera en línea de ese idioma. `undefined` si el sistema no tiene ninguna de ese idioma: entonces
 * no se fija voz y el navegador elige por `lang`, en vez de leer español con una voz de otro idioma.
 */
export function elegirVoz(
  voces: readonly SpeechSynthesisVoice[],
  idioma: string,
): SpeechSynthesisVoice | undefined {
  const prefijo = idioma.split('-')[0].toLowerCase();
  const delIdioma = voces.filter((v) => v.lang.toLowerCase().startsWith(prefijo));
  return delIdioma.find(esVozLocal) ?? delIdioma[0];
}

/** Fija en el enunciado el idioma y, si la hay, la voz que elige `elegirVoz`. */
export function ponerVoz(enunciado: SpeechSynthesisUtterance, idioma: string): void {
  enunciado.lang = idioma;
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const voz = elegirVoz(window.speechSynthesis.getVoices(), idioma);
  if (voz) enunciado.voice = voz;
}
