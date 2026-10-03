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

/**
 * El ÚNICO redondeo de la app: lo usan el panel de resultados, la clave de los casos y su
 * solución (hallazgo 2751, 03/10/2026). Si cada uno redondeara a su manera, la app podría
 * suspender una cifra que ella misma imprime.
 *
 * Dos decisiones, las dos sobre empates exactos (una cifra terminada en 5 justo después del
 * último decimal pedido):
 *   · se redondea **alejándose de cero**, el redondeo escolar y el de `formatNumber`: −9,375 da
 *     −9,38 igual que +0,375 da 0,38. `Math.round` a secas llevaba los negativos hacia cero
 *     (−9,375 → −9,37) mientras el panel imprimía −9,38;
 *   · antes de redondear se limpia el error de coma flotante con 12 cifras significativas:
 *     1/(1/2,5 − 1/4,5) deja 5,624999999999999 donde el valor exacto es 5,625, y `toFixed` lo
 *     bajaba a 5,62 mientras subía 2,125 a 2,13. Doce cifras sobran para cualquier dato de la
 *     app (los deslizadores van en pasos de 0,1 y 0,5) y quedan muy por encima del ruido
 *     binario, que vive en la cifra 16.
 */
export function redondearCifra(valor: number, decimales: number): number {
  if (!Number.isFinite(valor)) return valor;
  const limpio = Number(valor.toPrecision(12));
  const factor = 10 ** decimales;
  const escalado = Number((Math.abs(limpio) * factor).toPrecision(12));
  const redondeado = Math.round(escalado) / factor;
  // `+ 0` convierte el −0 de un valor que redondea a cero en 0: nunca «−0,00».
  return (limpio < 0 ? -redondeado : redondeado) + 0;
}
