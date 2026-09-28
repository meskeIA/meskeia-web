/**
 * Motor del simulador de lentes ópticas: la imagen que forma una lente delgada.
 *
 * Vive aparte de la vista porque el build compila la página sin comprobar si la óptica está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── Por qué existe este fichero (28/09/2026) ─────────────────────────────────
 *
 * Hasta esa fecha el cálculo vivía dentro del `useMemo` `calculoOptico` de `page.tsx`, y la
 * potencia se escribía en línea en su tarjeta (`100 / f`). Se TRASLADARON aquí, sin tocar una
 * sola operación, para que la sección «Casos para clase» (`./casos.ts`) corrija con la MISMA
 * aritmética que pinta el panel de resultados. Si el panel calculara de una manera y los casos
 * de otra, la app podría suspender una respuesta que ella misma acaba de imprimir. El `useMemo`
 * ahora solo llama a `calcularImagen`, y la tarjeta de potencia a `potenciaDioptrias`.
 *
 * ── Convenio (el que declara la app, «real es positivo») ─────────────────────
 *
 *   1/s + 1/s' = 1/f  →  s' = 1 / (1/f − 1/s)
 *   s  > 0  objeto a la izquierda de la lente (la app lo trata siempre como positivo)
 *   s' > 0  imagen a la derecha = real   ·   s' < 0 imagen a la izquierda = virtual
 *   f  > 0  convergente                  ·   f < 0 divergente
 *   M = −s'/s (negativo = invertida)     ·   h' = M · h
 *   Todas las distancias en cm; la potencia, en dioptrías (f en metros).
 */

export interface ImagenLente {
  /** Posición de la imagen, cm, con signo (+ real, − virtual). NaN si no hay imagen. */
  sImg: number;
  /** Altura de la imagen, cm, con signo (− invertida). NaN si no hay imagen. */
  hImg: number;
  /** Aumento lateral, sin unidad (− invertida). NaN si no hay imagen. */
  M: number;
  /** false con el objeto en el foco: los rayos salen paralelos y no se forma imagen. */
  valido: boolean;
}

/**
 * El cuerpo del antiguo `useMemo` `calculoOptico`, carácter a carácter.
 *
 * @param f    focal con signo, cm (+ convergente, − divergente)
 * @param sObj distancia del objeto a la lente, cm (positiva)
 * @param hObj altura del objeto, cm
 */
export function calcularImagen(f: number, sObj: number, hObj: number): ImagenLente {
  const denom = 1 / f - 1 / sObj;
  if (Math.abs(denom) < 1e-9) {
    // Imagen al infinito
    // NaN, no Infinity: el límite de M = −s'/s al acercarse desde s > f es −∞ y desde
    // s < f es +∞, así que no hay un signo que escribir. Y `valido: false` ya dice que
    // no hay imagen; lo que no debe haber es una cifra con signo que parezca calculada.
    return { sImg: NaN, hImg: NaN, M: NaN, valido: false };
  }
  const sImg = 1 / denom;
  const M = -sImg / sObj; // negativo = invertida
  const hImg = M * hObj;
  return { sImg, hImg, M, valido: true };
}

/**
 * Potencia de la lente en dioptrías, P = 1/f con f en METROS. La app trabaja en cm, así que
 * P = 100/f. Es la expresión que pintaba en línea la tarjeta «Potencia P = 1/f».
 *
 * @param fCm focal con signo, cm
 */
export function potenciaDioptrias(fCm: number): number {
  return 100 / fCm;
}
