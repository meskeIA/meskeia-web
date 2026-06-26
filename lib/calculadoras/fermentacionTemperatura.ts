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
