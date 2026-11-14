/**
 * Guía de lectura de la lupa (semilla S0275, 14/11/2026): la línea guía y la máscara de las
 * lupas electrónicas de sobremesa. Todo va en % de la ALTURA del visor, así que la guía se queda
 * en el mismo renglón al girar el móvil o al cambiar el visor de tamaño, sin recalcular nada.
 *
 * - `linea`: una raya horizontal bajo el renglón que se está leyendo.
 * - `mascara`: una ventana del alto de uno o dos renglones; lo de arriba y lo de abajo se
 *   oscurece para que la vista no salte de línea.
 */
export type GuiaLectura = 'ninguna' | 'linea' | 'mascara';

export const ALTO_VENTANA_MIN = 10;
export const ALTO_VENTANA_MAX = 40;

/**
 * Posición del CENTRO de la guía, en % entero, dentro de lo que cabe en el visor: la ventana de
 * la máscara no puede salirse por arriba ni por abajo (su centro va de alto/2 a 100 − alto/2);
 * la línea, de borde a borde.
 */
export function acotarGuia(pos: number, modo: GuiaLectura, altoVentana: number): number {
  const margen = modo === 'mascara' ? altoVentana / 2 : 0;
  if (!Number.isFinite(pos)) return 50;
  return Math.round(Math.max(margen, Math.min(100 - margen, pos)));
}

/** Bordes de la ventana de la máscara, en % de la altura del visor. */
export function bordesVentana(pos: number, altoVentana: number): { arriba: number; abajo: number } {
  return { arriba: pos - altoVentana / 2, abajo: pos + altoVentana / 2 };
}
