// Tiempo de fermentación según temperatura — lógica pura
//
// Complementa a calculadora-temperatura-masa (el «qué temperatura») con el
// «cuánto tiempo». La actividad de la levadura sigue aproximadamente la regla
// Q10 ≈ 2 en el rango de panadería: la velocidad de fermentación se duplica por
// cada +10 °C, así que el tiempo se reduce a la mitad. Es una aproximación útil
// entre ~4 °C (retardo en nevera) y ~32 °C; por encima la levadura se estresa.
// Verificado: 2026-06.

export const Q10 = 2; // factor de cambio de velocidad por cada 10 °C

export interface ResultadoFermentacion {
  tiempoHoras: number;
  factor: number; // tiempoActual / tiempoRef
  masRapido: boolean;
}

/**
 * Ajusta un tiempo de fermentación conocido a otra temperatura de masa.
 * @param tiempoRefHoras tiempo que indica la receta
 * @param tempRefC temperatura a la que está pensado ese tiempo
 * @param tempActualC temperatura real de tu masa/ambiente
 */
export function ajustarFermentacion(
  tiempoRefHoras: number,
  tempRefC: number,
  tempActualC: number,
): ResultadoFermentacion | null {
  if (!(tiempoRefHoras > 0)) return null;
  /**
   * Fuera del rango del modelo no se devuelve cifra, igual que en `ajustarRangoFermentacion`.
   *
   * ── De dónde sale (Inspector, 20/09/2026) ──
   * El guardián existía SOLO en la variante de horquilla, así que bastaba con llamar a esta
   * primitiva para saltárselo — y eso hacían dos de los tres consumidores. A 45 °C
   * (una cámara de fermentación, o el horno con la luz encendida) se publicaban «28 min»
   * con toda naturalidad, cuando lo que ocurre ahí es que la levadura se muere; a −18 °C,
   * «36 h 46 min» para una masa congelada. Un guardián que el consumidor puede eludir no es
   * un guardián: por eso ahora vive en el motor y no en quien lo llama.
   */
  if (!dentroDelModelo(tempActualC) || !dentroDelModelo(tempRefC)) return null;
  // Más caliente que la referencia → fermenta más rápido → menos tiempo.
  const factor = Math.pow(Q10, (tempRefC - tempActualC) / 10);
  return {
    tiempoHoras: Math.round(tiempoRefHoras * factor * 100) / 100,
    factor: Math.round(factor * 100) / 100,
    masRapido: tempActualC > tempRefC,
  };
}

// Formatea horas decimales a «2 h 30 min».
export function formatearTiempo(horas: number): string {
  if (!(horas > 0)) return '—';
  const totalMin = Math.round(horas * 60);
  const h = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  if (h === 0) return `${min} min`;
  if (min === 0) return `${h} h`;
  return `${h} h ${min} min`;
}

// ─── Temperaturas de referencia para la tabla y notas ─────────────────────────

export interface NotaTemperatura {
  tempC: number;
  etiqueta: string;
  nota: string;
}

export const TEMPERATURAS_REFERENCIA: NotaTemperatura[] = [
  { tempC: 4, etiqueta: 'Nevera (retardo en frío)', nota: 'Fermentación muy lenta: ideal para desarrollar sabor durante la noche o varios días.' },
  { tempC: 18, etiqueta: 'Ambiente fresco', nota: 'Levado lento y controlado; buena miga y sabor.' },
  { tempC: 24, etiqueta: 'Temperatura ideal', nota: 'El punto dulce para la mayoría de masas: actividad ágil sin sobrefermentar.' },
  { tempC: 28, etiqueta: 'Ambiente cálido', nota: 'Fermenta rápido; vigila el volumen para que no se pase.' },
  { tempC: 32, etiqueta: 'Muy cálido', nota: 'Máximo recomendable: por encima la levadura se estresa y aparecen sabores ácidos.' },
];

export const TEMP_OPTIMA = 24;

// ─── Rango de fermentación ajustado por temperatura ───────────────────────────
//
// Las recetas no dan un tiempo exacto sino una horquilla («4–6 h»), y esa horquilla
// también se estira con el frío y se encoge con el calor: ajustar solo uno de los dos
// extremos daría un rango que no existe en ninguna cocina.
//
// Añadido el 13/09/2026 para que `calculadora-masa-madre` —103 usos/30 d, la app que más
// se usa de Coquinum— dejara de dar un rango FIJO de 4-6 h mientras su propio texto repite
// ocho veces que el tiempo lo manda la temperatura. La capacidad vive aquí, con el Q10 ya
// probado, y no en una app aparte: `fermentacion-temperatura` hacía 4 usos en 30 días.

/** Límites entre los que la regla Q10 ≈ 2 es una aproximación razonable en panadería. */
export const TEMP_MODELO_MIN = 4;
export const TEMP_MODELO_MAX = 32;

/**
 * ¿Está esa temperatura dentro del rango en el que el modelo describe algo real?
 *
 * Se exporta para que la app pueda EXPLICAR por qué no hay cifra, en vez de limitarse a no
 * enseñar nada: un resultado que desaparece sin decir por qué se lee como un fallo.
 */
export const dentroDelModelo = (tempC: number): boolean =>
  Number.isFinite(tempC) && tempC >= TEMP_MODELO_MIN && tempC <= TEMP_MODELO_MAX;

export interface RangoFermentacion {
  horasMin: number;
  horasMax: number;
  factor: number;
  masRapido: boolean;
}

/**
 * Ajusta una horquilla de fermentación conocida a otra temperatura de masa.
 *
 * Devuelve `null` —y no una cifra— cuando la temperatura cae fuera del rango en el que el
 * modelo vale: por debajo de 4 °C la levadura queda casi parada y por encima de 32 °C se
 * estresa y aparecen sabores ácidos, así que en ambos extremos el Q10 extrapolaría un
 * número de aspecto convincente que no describe lo que pasa en la masa.
 */
export function ajustarRangoFermentacion(
  horasMinRef: number,
  horasMaxRef: number,
  tempRefC: number,
  tempActualC: number,
): RangoFermentacion | null {
  if (!Number.isFinite(tempActualC)) return null;
  if (tempActualC < TEMP_MODELO_MIN || tempActualC > TEMP_MODELO_MAX) return null;

  const min = ajustarFermentacion(horasMinRef, tempRefC, tempActualC);
  const max = ajustarFermentacion(horasMaxRef, tempRefC, tempActualC);
  if (!min || !max) return null;

  return {
    horasMin: min.tiempoHoras,
    horasMax: max.tiempoHoras,
    factor: min.factor,
    masRapido: min.masRapido,
  };
}
