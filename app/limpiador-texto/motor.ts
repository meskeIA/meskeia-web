/**
 * Motor de «Párrafos de PDF» del Limpiador de Texto (S0262, 09/11/2026).
 *
 * El texto copiado de un PDF llega con cada línea de la maqueta cortada por un salto, y con las
 * palabras partidas a final de línea por un guion. La opción «Saltos de línea» lo junta TODO en
 * una línea y pierde los párrafos; esta reconstruye los párrafos y une las palabras partidas.
 *
 * Sin dependencias, para probarlo en Node (tests/parrafos-pdf-motor.spec.ts).
 *
 * REGLAS
 *  · Una línea en blanco separa párrafos y se conserva tal cual.
 *  · Dentro de un bloque, cada línea se une a la siguiente con un espacio, SALVO que:
 *      - la siguiente empiece por una viñeta o un número de lista («• », «- », «1. », «a) »);
 *      - una de las dos sea un título en mayúsculas («CAPÍTULO 1»);
 *      - la línea acabe en punto (o ! ? : …) y sea CORTA — más corta que el 80 % de la línea
 *        más larga del bloque —: ahí acababa el párrafo aunque el PDF no dejara línea en blanco;
 *      - la línea sea MUY corta (< 50 %) y la siguiente empiece por mayúscula: un título sin punto.
 *  · Guion a final de línea, pegado a una letra o cifra:
 *      - la siguiente empieza por guion → compuesto partido en su guion, que la Ortografía de la
 *        RAE (2010) manda repetir al principio de la línea siguiente: queda UN guion
 *        («franco-» + «-alemán» → «franco-alemán»);
 *      - letra + guion y la siguiente empieza en minúscula → partición de palabra: se quita el
 *        guion y se une sin espacio («comunica-» + «ción» → «comunicación»);
 *      - en otro caso se conserva el guion y se une sin espacio («anti-» + «OTAN» → «anti-OTAN»).
 *  · El guion blando (U+00AD), invisible: a final de línea une sin espacio; en el resto se borra.
 *
 * LÍMITE CONOCIDO: un compuesto con guion partido en su guion SIN repetirlo («teórico-» +
 * «práctico») se une como si fuera una partición («teóricopráctico»). Sin la repetición de la RAE
 * no hay forma de distinguirlo de «comunica-» + «ción»; lo advierte el bloque de limitaciones.
 */

const GUIONES_FINAL = /[-‐‑]$/;
// La letra de lista solo en minúscula: «A. Pérez» o «J. R. R. Tolkien» son iniciales, no viñetas.
const VINETA = /^(?:[•·▪◦‣∙●○■□*–—-]\s|\d{1,3}[.)]\s|[a-z][.)]\s)/;
const CIERRES_FINALES = /[»”"')\]]+$/;
const PUNTO_FINAL = /[.!?:…]$/;
const MAYUSCULA_INICIAL = /^[¿¡«“"(]*\p{Lu}/u;
const MINUSCULA_INICIAL = /^\p{Ll}/u;
const LETRA = /\p{L}/u;
const LETRA_O_CIFRA = /[\p{L}\p{N}]/u;

/** Línea que es un título en mayúsculas: tiene al menos dos letras y ninguna minúscula. */
function esTitulo(linea: string): boolean {
  const letras = linea.match(/\p{L}/gu) ?? [];
  return letras.length >= 2 && !/\p{Ll}/u.test(linea);
}

/** ¿Termina el párrafo después de `linea`, aunque no haya línea en blanco detrás? */
function cortaParrafo(linea: string, siguiente: string, maxLongitud: number): boolean {
  // Una palabra partida con guion sigue SIEMPRE en la línea de abajo: sin esto, «anti-» (línea
  // muy corta) + «OTAN…» (mayúscula) se tomaba por un título y se cortaba.
  if (GUIONES_FINAL.test(linea) && LETRA_O_CIFRA.test(linea.slice(-2, -1))) return false;
  if (VINETA.test(siguiente)) return true;
  if (esTitulo(linea) || esTitulo(siguiente)) return true;
  const sinCierres = linea.replace(CIERRES_FINALES, '');
  if (PUNTO_FINAL.test(sinCierres) && linea.length < 0.8 * maxLongitud) return true;
  if (linea.length < 0.5 * maxLongitud && MAYUSCULA_INICIAL.test(siguiente)) return true;
  return false;
}

/** Une `linea` con `siguiente` (las dos ya recortadas y no vacías). */
function unir(linea: string, siguiente: string): string {
  if (GUIONES_FINAL.test(linea)) {
    const antes = linea.slice(-2, -1);
    if (LETRA_O_CIFRA.test(antes)) {
      if (/^[-‐‑]/.test(siguiente)) return linea + siguiente.slice(1);
      if (LETRA.test(antes) && MINUSCULA_INICIAL.test(siguiente)) return linea.slice(0, -1) + siguiente;
      return linea + siguiente;
    }
  }
  return `${linea} ${siguiente}`;
}

/** Reconstruye los párrafos de un texto copiado de un PDF. */
export function repararTextoPdf(texto: string): string {
  // El guion blando a final de línea es una partición: se une sin espacio ANTES de partir en
  // líneas (si no, «comu» + «nicación» se unían con espacio). El resto, invisible, se borra.
  const lineas = texto
    .replace(/­[ \t]*\r?\n[ \t]*/g, '')
    .replace(/­/g, '')
    .replace(/\r\n?/g, '\n')
    .split('\n');
  const salida: string[] = [];
  let bloque: string[] = [];

  const cerrarBloque = () => {
    if (bloque.length === 0) return;
    const maxLongitud = Math.max(...bloque.map((l) => l.length));
    let actual = bloque[0];
    for (let i = 1; i < bloque.length; i++) {
      const siguiente = bloque[i];
      if (cortaParrafo(bloque[i - 1], siguiente, maxLongitud)) {
        salida.push(actual);
        actual = siguiente;
      } else {
        actual = unir(actual, siguiente);
      }
    }
    salida.push(actual);
    bloque = [];
  };

  for (const cruda of lineas) {
    const linea = cruda.trim();
    if (linea === '') {
      cerrarBloque();
      salida.push('');
    } else {
      bloque.push(linea);
    }
  }
  cerrarBloque();
  return salida.join('\n');
}
