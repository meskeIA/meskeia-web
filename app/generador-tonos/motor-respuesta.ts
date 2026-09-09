/**
 * Motor de la medida de respuesta en frecuencia — aparte de la vista, sin React ni Web Audio.
 *
 * La app emite un tono por el altavoz y lo escucha con el micrófono del mismo aparato. Lo que
 * sale de ahí NO es la respuesta del altavoz: es la cadena entera —altavoz + sala + micrófono—,
 * y ninguna de las tres partes está calibrada. Por eso todo lo que hay aquí trabaja en RELATIVO
 * y el resultado solo tiene sentido comparando dos medidas hechas con el mismo aparato:
 * esta posición contra aquella, este altavoz contra el otro.
 *
 * Las dos decisiones que sostienen la honestidad de la medida:
 *
 *  1. Un punto que no supera el ruido de fondo en MARGEN_RUIDO_DB se descarta y se dibuja como
 *     hueco, NUNCA como 0 dB. Es la diferencia entre «aquí no llega señal» y «aquí la respuesta
 *     es plana», que en una gráfica se parecen y significan lo contrario.
 *  2. La curva se normaliza restando su MEDIANA, no su valor a 1 kHz. Con la mediana, un pico
 *     aislado en la frecuencia de referencia no desplaza la curva entera.
 *
 * Casos resueltos a mano en tests/respuesta-frecuencia-motor.spec.ts.
 */

/**
 * Serie nominal de tercios de octava (ISO 266). Es la retícula con la que se mide acústica
 * desde hace décadas: espaciado logarítmico, que es como oye el oído y como se comportan los
 * altavoces. Un barrido lineal gastaría la mitad de los puntos entre 10 y 20 kHz.
 */
export const TERCIOS_DE_OCTAVA = [
  20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800,
  1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000,
] as const;

/**
 * Cuánto tiene que despegar la señal del ruido de fondo para que el punto valga. Por debajo de
 * 6 dB la corrección por ruido arrastra más incertidumbre que señal, que es el umbral con el
 * que trabajan las normas de medida de ruido (ISO 3744 y familia).
 */
export const MARGEN_RUIDO_DB = 6;

export interface PuntoMedida {
  frecuencia: number;
  /** Nivel en dB, o null si el punto no despegó del ruido de fondo. */
  db: number | null;
}

/** Las frecuencias de la retícula que caen dentro del rango pedido, extremos incluidos. */
export function frecuenciasDeMedida(min: number, max: number): number[] {
  const desde = Math.min(min, max);
  const hasta = Math.max(min, max);
  return TERCIOS_DE_OCTAVA.filter((f) => f >= desde && f <= hasta);
}

/** Ancho de un bin de la FFT, en Hz. */
export function resolucionFft(sampleRate: number, fftSize: number): number {
  return sampleRate / fftSize;
}

/** Bin de la FFT donde cae una frecuencia. */
export function indiceBin(frecuencia: number, sampleRate: number, fftSize: number): number {
  return Math.round(frecuencia / resolucionFft(sampleRate, fftSize));
}

/**
 * Nivel del pico alrededor de una frecuencia.
 *
 * No basta con leer el bin exacto: el reloj del altavoz y el del micrófono no son el mismo, así
 * que el tono emitido a 1.000 Hz se recibe unos hercios al lado y su energía cae en un bin
 * vecino. Leyendo solo el bin teórico la curva sale llena de valles que no existen. Se toma el
 * máximo de una ventana del ±TOLERANCIA_RELATIVA de la frecuencia, con un suelo de 2 bins para
 * que en los graves —donde ese porcentaje es menos de un bin— la ventana siga existiendo.
 */
const TOLERANCIA_RELATIVA = 0.03;

export function nivelPico(
  espectroDb: ArrayLike<number>,
  frecuencia: number,
  sampleRate: number,
  fftSize: number,
): number {
  const centro = indiceBin(frecuencia, sampleRate, fftSize);
  const ancho = Math.max(2, Math.round((TOLERANCIA_RELATIVA * frecuencia) / resolucionFft(sampleRate, fftSize)));
  const desde = Math.max(0, centro - ancho);
  const hasta = Math.min(espectroDb.length - 1, centro + ancho);

  let maximo = -Infinity;
  for (let i = desde; i <= hasta; i++) {
    const v = espectroDb[i];
    if (Number.isFinite(v) && v > maximo) maximo = v;
  }
  return maximo;
}

/**
 * Quita del nivel medido la parte que aportaba el ruido de fondo.
 *
 * La resta es energética, no aritmética: los decibelios son logarítmicos y restarlos como
 * números daría cualquier cosa. Devuelve null cuando la señal no despega lo suficiente del
 * ruido — ese punto no se ha medido, y decirlo es más útil que dibujar un número inventado.
 */
export function restarRuido(nivelSenal: number, nivelRuido: number): number | null {
  if (!Number.isFinite(nivelSenal)) return null;
  if (!Number.isFinite(nivelRuido)) return nivelSenal;
  if (nivelSenal - nivelRuido < MARGEN_RUIDO_DB) return null;

  const energiaSenal = 10 ** (nivelSenal / 10);
  const energiaRuido = 10 ** (nivelRuido / 10);
  return 10 * Math.log10(energiaSenal - energiaRuido);
}

/** La mediana de una lista no vacía. Con número par de elementos, la media de los dos centrales. */
export function mediana(valores: number[]): number {
  const orden = [...valores].sort((a, b) => a - b);
  const medio = Math.floor(orden.length / 2);
  return orden.length % 2 === 0 ? (orden[medio - 1] + orden[medio]) / 2 : orden[medio];
}

/**
 * Lleva la curva a decibelios RELATIVOS restando su mediana, de modo que el 0 dB signifique
 * «el nivel típico de esta medida» y no una presión sonora absoluta que aquí nadie conoce.
 * Los puntos descartados siguen descartados: no se rellenan.
 */
export function normalizarCurva(puntos: PuntoMedida[]): PuntoMedida[] {
  const validos = puntos.map((p) => p.db).filter((db): db is number => db !== null);
  if (validos.length === 0) return puntos.map((p) => ({ ...p }));

  const referencia = mediana(validos);
  return puntos.map((p) => ({
    frecuencia: p.frecuencia,
    db: p.db === null ? null : p.db - referencia,
  }));
}

/**
 * Diferencia entre dos curvas, punto a punto (B menos A). Solo donde LAS DOS tienen medida:
 * comparar contra un hueco daría una diferencia falsa que además parecería un hallazgo.
 */
export function compararCurvas(a: PuntoMedida[], b: PuntoMedida[]): PuntoMedida[] {
  const porFrecuencia = new Map(a.map((p) => [p.frecuencia, p.db]));
  return b.map((p) => {
    const dbA = porFrecuencia.get(p.frecuencia);
    if (dbA === undefined || dbA === null || p.db === null) {
      return { frecuencia: p.frecuencia, db: null };
    }
    return { frecuencia: p.frecuencia, db: p.db - dbA };
  });
}

export interface ResumenCurva {
  /** Cuántos puntos llegaron a medirse. */
  medidos: number;
  /** Distancia entre el punto más alto y el más bajo, en dB. null si no hay medidas. */
  desviacion: number | null;
  /** Frecuencia del punto más alto (resonancia) y del más bajo (hueco). */
  frecuenciaPico: number | null;
  frecuenciaValle: number | null;
}

export function resumirCurva(puntos: PuntoMedida[]): ResumenCurva {
  const validos = puntos.filter((p): p is { frecuencia: number; db: number } => p.db !== null);
  if (validos.length === 0) {
    return { medidos: 0, desviacion: null, frecuenciaPico: null, frecuenciaValle: null };
  }

  let pico = validos[0];
  let valle = validos[0];
  for (const p of validos) {
    if (p.db > pico.db) pico = p;
    if (p.db < valle.db) valle = p;
  }

  return {
    medidos: validos.length,
    desviacion: pico.db - valle.db,
    frecuenciaPico: pico.frecuencia,
    frecuenciaValle: valle.frecuencia,
  };
}

/**
 * Salto medio, en dB, entre tercios de octava contiguos. Solo cuenta las parejas en las que
 * las dos bandas tienen medida.
 */
export function saltoMedioEntreVecinos(puntos: PuntoMedida[]): number | null {
  let suma = 0;
  let parejas = 0;
  for (let i = 1; i < puntos.length; i++) {
    const a = puntos[i - 1].db;
    const b = puntos[i].db;
    if (a === null || b === null) continue;
    suma += Math.abs(b - a);
    parejas++;
  }
  return parejas === 0 ? null : suma / parejas;
}

/**
 * Por encima de este salto medio entre bandas contiguas, lo medido no es una respuesta.
 *
 * Un altavoz responde de forma CONTINUA: dos tercios de octava vecinos comparten casi todo el
 * mecanismo físico, así que su nivel no puede diferir mucho. Incluso un altavoz de móvil malo,
 * o un modo de sala marcado en los graves, se queda muy por debajo de 12 dB de salto medio a
 * lo largo de toda la banda. Cuando el promedio los supera, los puntos no guardan relación
 * entre sí: se está midiendo ruido de fondo, no un tono.
 */
export const SALTO_MAXIMO_PLAUSIBLE_DB = 12;

/** Con menos parejas que esto no hay forma de distinguir una respuesta abrupta de puro ruido. */
const PAREJAS_MINIMAS = 4;

/**
 * ¿Lo medido tiene forma de respuesta en frecuencia, o es ruido disfrazado de curva?
 *
 * Existe porque una gráfica convence por su forma. Si el altavoz está en silencio, hay
 * auriculares puestos o el micrófono está tapado, cada punto recoge un pedazo de ruido
 * distinto y sale un zigzag que se dibuja igual de bien que una medida buena — con su eje,
 * su leyenda y sus decimales. Sin esta comprobación, la app presentaría eso como resultado.
 */
export function pareceRuido(puntos: PuntoMedida[]): boolean {
  const validos = puntos.filter((p) => p.db !== null);
  if (validos.length < PAREJAS_MINIMAS + 1) return false;

  const salto = saltoMedioEntreVecinos(puntos);
  return salto !== null && salto > SALTO_MAXIMO_PLAUSIBLE_DB;
}

/**
 * Lo que el navegador dice haber hecho con el micrófono.
 *
 * Es la comprobación que decide si la medida vale algo. El navegador aplica por defecto
 * cancelación de eco, supresión de ruido y control automático de ganancia; los tres están
 * pensados para videollamadas y los tres destruyen esta medida en concreto:
 *
 *  · la cancelación de eco existe justamente para BORRAR el sonido que sale de tu propio
 *    altavoz, que aquí es toda la señal;
 *  · el control automático de ganancia sube y baja la sensibilidad sola, así que aplana
 *    artificialmente la curva y la deja lisa aunque el altavoz sea pésimo;
 *  · la supresión de ruido decide por su cuenta qué parte del espectro es ruido.
 *
 * Se piden desactivados, pero pedirlo no es conseguirlo: hay navegadores que ignoran la
 * petición en silencio. Por eso se leen los ajustes REALES de la pista después de abrirla, y
 * si alguno sigue activo se dice que aquí no se puede medir, en vez de dibujar una curva
 * bonita que no significa nada.
 */
export interface AjustesMicrofono {
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

export interface VeredictoMicrofono {
  sirve: boolean;
  /** Los procesados que siguen activos, con el nombre con el que se le explican al usuario. */
  procesadosActivos: string[];
}

export function evaluarMicrofono(ajustes: AjustesMicrofono): VeredictoMicrofono {
  const procesadosActivos: string[] = [];
  if (ajustes.echoCancellation) procesadosActivos.push('cancelación de eco');
  if (ajustes.autoGainControl) procesadosActivos.push('control automático de ganancia');
  if (ajustes.noiseSuppression) procesadosActivos.push('supresión de ruido');
  return { sirve: procesadosActivos.length === 0, procesadosActivos };
}
