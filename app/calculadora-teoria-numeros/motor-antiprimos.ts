/**
 * Antiprimos (números altamente compuestos) — motor de cálculo.
 *
 * Un número es **altamente compuesto** cuando tiene más divisores que cualquier número
 * menor que él: 12 tiene 6 divisores y ninguno de los once anteriores llega a 6. La
 * secuencia empieza 1, 2, 4, 6, 12, 24, 36, 48, 60, 120, 180, 240, 360… y es la que
 * Ramanujan estudió en 1915, cuando acuñó el término «highly composite number». En
 * divulgación en español se les llama «antiprimos», por ser lo contrario de un primo:
 * el primo tiene los divisores justos y el antiprimo, un récord de ellos.
 *
 * La propiedad NO es local: para saber si n es antiprimo hay que conocer el número de
 * divisores de TODOS los anteriores. Por eso aquí se criba de una vez el intervalo
 * completo en lugar de factorizar n, y por eso el análisis lleva siempre consigo hasta
 * dónde se ha explorado: fuera de ese tramo no se afirma nada.
 *
 * Vive aparte de la vista a propósito: el build no puede ver una matemática equivocada,
 * así que los casos se resuelven a mano contra `tests/antiprimos-motor.spec.ts`.
 */

export interface Antiprimo {
  /** El número altamente compuesto. */
  numero: number;
  /** Cuántos divisores tiene (contando el 1 y él mismo). */
  divisores: number;
}

export interface AnalisisAntiprimo {
  numero: number;
  /** Divisores de `numero`, contando el 1 y él mismo. */
  divisores: number;
  esAntiprimo: boolean;
  /** Mayor antiprimo estrictamente menor que `numero`. */
  anterior: Antiprimo | null;
  /** Menor antiprimo mayor que `numero`, si cae dentro de lo explorado. */
  siguiente: Antiprimo | null;
  /**
   * El primer número de la historia que alcanzó esta cantidad de divisores.
   *
   * Es lo que explica por qué un número NO es antiprimo: 40 tiene 8 divisores, pero 24
   * ya llegaba a 8 siendo mucho más pequeño, así que 40 no bate ningún récord. Cuando
   * `numero` sí es antiprimo, este campo es él mismo.
   */
  primeroConTantos: Antiprimo | null;
  /** Hasta dónde se ha comprobado. Más allá, el veredicto no se sostiene. */
  limiteExplorado: number;
}

/** Tope de la tabla que se calcula de entrada: llega hasta el antiprimo 83.160. */
export const LIMITE_EJEMPLOS = 100_000;

/**
 * Tope de lo que se acepta analizar. Cribar un millón son ~1,4·10⁷ incrementos, del
 * orden de una décima de segundo en el navegador; más arriba la espera se nota y el
 * veredicto deja de merecer la pena frente a lo que cuesta.
 */
export const LIMITE_MAXIMO = 1_000_000;

/**
 * Número de divisores de cada k desde 0 hasta `limite`, por criba.
 *
 * Suma un divisor a todos los múltiplos de cada i, que es el reverso de factorizar uno
 * por uno: el coste total es la serie armónica, ~limite·ln(limite).
 * La posición 0 no significa nada y queda a cero.
 */
export function conteoDivisoresHasta(limite: number): Uint32Array {
  if (!Number.isFinite(limite) || limite < 1) return new Uint32Array(1);
  const tope = Math.min(Math.floor(limite), LIMITE_MAXIMO);
  const cuenta = new Uint32Array(tope + 1);
  for (let i = 1; i <= tope; i++) {
    for (let j = i; j <= tope; j += i) cuenta[j]++;
  }
  return cuenta;
}

/**
 * Todos los antiprimos hasta `limite`, en orden y con su número de divisores.
 *
 * Un número entra en la lista cuando supera ESTRICTAMENTE el récord vigente: si
 * empatara no sería altamente compuesto, porque uno más pequeño ya tenía tantos.
 */
export function antiprimosHasta(limite: number): Antiprimo[] {
  const cuenta = conteoDivisoresHasta(limite);
  const tope = cuenta.length - 1;
  const lista: Antiprimo[] = [];
  let record = 0;
  for (let n = 1; n <= tope; n++) {
    if (cuenta[n] > record) {
      record = cuenta[n];
      lista.push({ numero: n, divisores: cuenta[n] });
    }
  }
  return lista;
}

/**
 * Sitúa a `numero` respecto de la serie de antiprimos.
 *
 * `antiprimos` y `limiteExplorado` se pasan ya calculados porque la vista los reutiliza
 * entre pulsaciones de teclado: recribar en cada dígito sería tirar el trabajo.
 * Devuelve `null` para lo que queda fuera del tramo explorado, en vez de suponer.
 */
export function analizarAntiprimo(
  numero: number,
  antiprimos: Antiprimo[],
  limiteExplorado: number
): AnalisisAntiprimo | null {
  if (!Number.isInteger(numero) || numero < 1 || numero > limiteExplorado) return null;

  const propio = antiprimos.find((a) => a.numero === numero) ?? null;
  const divisores = propio ? propio.divisores : contarDivisores(numero);

  return {
    numero,
    divisores,
    esAntiprimo: propio !== null,
    anterior: [...antiprimos].reverse().find((a) => a.numero < numero) ?? null,
    siguiente: antiprimos.find((a) => a.numero > numero) ?? null,
    primeroConTantos: antiprimos.find((a) => a.divisores >= divisores) ?? null,
    limiteExplorado,
  };
}

/**
 * Divisores de un solo número, por parejas hasta la raíz.
 *
 * Se usa para el número que el usuario escribe, que puede no estar en la tabla de
 * récords; la criba solo guarda los antiprimos, no el conteo de todos los enteros.
 */
export function contarDivisores(n: number): number {
  if (!Number.isInteger(n) || n < 1) return 0;
  let total = 0;
  const raiz = Math.floor(Math.sqrt(n));
  for (let i = 1; i <= raiz; i++) {
    if (n % i === 0) {
      total += 2;
      if (i === n / i) total--; // el cuadrado perfecto no cuenta su raíz dos veces
    }
  }
  return total;
}
