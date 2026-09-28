/**
 * Reparto de las medias muestrales en casillas para el histograma de X̄.
 *
 * Funciones puras, sin React ni DOM: `page.tsx` las dibuja y
 * `tests/apps/simulador-teorema-central-limite.spec.ts` las comprueba en Node con datos fijos,
 * que es la única forma de medir alturas sin depender del azar de la simulación.
 *
 * ── POR QUÉ LAS POBLACIONES DISCRETAS NO VAN EN 40 CASILLAS (hallazgo 2370, 28/09/2026) ──
 *
 * Con las dos monedas la media de n tiradas solo puede valer k/n (paso 1/n). El reparto
 * anterior usaba para todas las poblaciones 40 casillas de ancho 8·σ(X̄)/40, que con n entre 2
 * y 30 son MÁS ESTRECHAS que ese paso: cada valor posible caía en una casilla, las de en medio
 * quedaban vacías, y al dividir el recuento por el ancho de la casilla —y no por el paso— la
 * densidad salía inflada. Con la moneda justa y n = 10 la barra del 0,5 medía 7,78 frente al
 * pico 2,52 de la normal superpuesta (cociente 3,08), y con la moneda sesgada, 4,86: el
 * histograma parecía una hilera de púas tres o cinco veces más alta que la campana, justo en
 * los casos 7, 9 y 12, que mandan mirar que el TCL se cumple.
 *
 * Ahora, si la población vive en una retícula (origen + j·paso), las medias viven en la
 * retícula origen + k·paso/n y cada valor posible tiene SU casilla, de ancho h = paso/n y
 * centrada en él. La densidad es recuento/(total·h), así que el área del histograma es 1 y su
 * altura se compara con la normal sin trampa: con la moneda justa y n = 10, la barra del 0,5
 * vale P(k = 5)/0,1 = 0,24609/0,1 = 2,4609 frente al pico 1/(0,158114·√(2π)) = 2,5231
 * (cociente 0,975). Es el dibujo de manual de la aproximación de De Moivre-Laplace.
 *
 * Las poblaciones continuas no cambian: 40 casillas iguales sobre el eje.
 */

/** Retícula de una población discreta: sus valores son `origen + j·paso`. */
export interface Reticula {
  origen: number;
  paso: number;
}

export interface Casilla {
  /** Extremos de la barra que se DIBUJA, ya recortados al eje. */
  x0: number;
  x1: number;
  /** Valor de la retícula al que corresponde la barra (solo en poblaciones discretas). */
  valor: number | null;
  recuento: number;
  /** recuento / (total de medias · ancho de la casilla): área total 1. */
  densidad: number;
}

export interface Histograma {
  casillas: Casilla[];
  /** Ancho de casilla con el que se ha calculado la densidad (h = paso/n en las discretas). */
  anchoCasilla: number;
  /** Medias que caen fuera del eje dibujado. */
  fueraDeRango: number;
}

/** Número de casillas del histograma de una población continua. */
export const CASILLAS_CONTINUA = 40;

/**
 * Construye el histograma de `medias` sobre el eje [xMin, xMax].
 *
 * `reticula` = null → población continua (40 casillas iguales, el reparto de siempre).
 *
 * ⚠️ Con n = 1 la media ES la población, y el eje es su soporte [xMin, xMax] (hallazgo 1052):
 * una casilla de ancho h = paso ocuparía todo el eje y dos masas aisladas en 0 y en 1 se verían
 * como un bloque plano, que es el dibujo de una uniforme. Por eso con n = 1 la barra se DIBUJA
 * con una quinta parte del paso, como el diagrama de barras del panel de la población; su
 * altura sigue siendo recuento/(total·h), la misma escala que la curva.
 */
export function construirHistograma(
  medias: readonly number[],
  xMin: number,
  xMax: number,
  n: number,
  reticula: Reticula | null,
): Histograma {
  const total = medias.length || 1;

  if (!reticula || !(reticula.paso > 0) || !(n >= 1)) {
    const ancho = (xMax - xMin) / CASILLAS_CONTINUA;
    const recuentos = new Array<number>(CASILLAS_CONTINUA).fill(0);
    let fuera = 0;
    for (const m of medias) {
      if (m < xMin || m > xMax) {
        fuera++;
        continue;
      }
      const i = Math.min(CASILLAS_CONTINUA - 1, Math.max(0, Math.floor((m - xMin) / ancho)));
      recuentos[i]++;
    }
    return {
      casillas: recuentos.map((c, i) => ({
        x0: xMin + i * ancho,
        x1: xMin + (i + 1) * ancho,
        valor: null,
        recuento: c,
        densidad: c / (total * ancho),
      })),
      anchoCasilla: ancho,
      fueraDeRango: fuera,
    };
  }

  const h = reticula.paso / n;
  // Holgura para los valores que caen justo en el borde del eje (0,5 − 0,2 frente a 30/100).
  const eps = h * 1e-6;
  const recuentos = new Map<number, number>();
  let fuera = 0;
  for (const m of medias) {
    // La media de n valores de la retícula es origen + k·h con k entero: se redondea para
    // absorber el error de coma flotante de sumar y dividir.
    const k = Math.round((m - reticula.origen) / h);
    const v = reticula.origen + k * h;
    if (v < xMin - eps || v > xMax + eps) {
      fuera++;
      continue;
    }
    recuentos.set(k, (recuentos.get(k) ?? 0) + 1);
  }

  const anchoDibujo = n === 1 ? h / 5 : h;
  const casillas: Casilla[] = [...recuentos.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([k, c]) => {
      const v = reticula.origen + k * h;
      return {
        x0: Math.max(xMin, v - anchoDibujo / 2),
        x1: Math.min(xMax, v + anchoDibujo / 2),
        valor: v,
        recuento: c,
        densidad: c / (total * h),
      };
    });

  return { casillas, anchoCasilla: h, fueraDeRango: fuera };
}
