/**
 * Barrido fila-columna para el teclado de switch.
 *
 * Aparte del componente para poder verificar el ciclo (avanzar fila, envolver al
 * llegar al final, construir la cuadrícula) sin arrancar el navegador.
 */

export interface Tecla {
  /** Carácter a escribir, o id de acción especial (__espacio__, __borrar__...) */
  id: string;
  /** Lo que se ve dentro de la celda */
  etiqueta: string;
  /** Lo que anuncia el aviso en voz alta y el aria-label del botón */
  aria: string;
  /** Ocupa dos columnas (la barra espaciadora) */
  ancha?: boolean;
}

/**
 * Frecuencia aproximada de las letras en español (RAE, corpus CREA): las más
 * usadas primero. Sitúa las letras habituales en las primeras filas y reduce
 * el número medio de pasos de barrido para escribir un texto.
 */
export const LETRAS_POR_FRECUENCIA = 'EAOSRNIDLCTUMPBGVYQHFZJÑXKW'.split('');

/** Orden alfabético normal, para comparar contra el de frecuencia */
export const LETRAS_ALFABETICO = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

export const COLUMNAS_POR_FILA = 7;

const TECLAS_ESPECIALES: Tecla[] = [
  { id: '__espacio__', etiqueta: '␣ Espacio', aria: 'Espacio', ancha: true },
  { id: '__borrar__', etiqueta: '⌫ Borrar', aria: 'Borrar el último carácter' },
  { id: '__leer__', etiqueta: '🔊 Leer', aria: 'Leer en voz alta lo escrito' },
  { id: '__limpiar__', etiqueta: '🗑️ Limpiar', aria: 'Borrar todo el texto' },
];

/**
 * Reparte las letras en filas de `columnas` celdas y añade una última fila fija
 * con las teclas especiales. Van aparte (no mezcladas en el mismo chunk) para que
 * la tecla ancha de espacio nunca desborde una fila de letras: 27 no es múltiplo
 * de 7, así que mezclarlas dejaría alguna fila con más columnas visuales de las
 * que resalta el barrido.
 */
export function construirFilas(letras: string[], columnas: number = COLUMNAS_POR_FILA): Tecla[][] {
  const teclasLetras: Tecla[] = letras.map((l) => ({ id: l, etiqueta: l, aria: `Letra ${l}` }));

  const filas: Tecla[][] = [];
  for (let i = 0; i < teclasLetras.length; i += columnas) {
    filas.push(teclasLetras.slice(i, i + columnas));
  }
  filas.push(TECLAS_ESPECIALES);
  return filas;
}

/** Siguiente índice en un ciclo de `total` posiciones (vuelve a 0 al llegar al final) */
export const siguienteIndice = (actual: number, total: number): number =>
  total <= 0 ? 0 : (actual + 1) % total;

/** Nombres legibles para los `KeyboardEvent.code` más habituales como switch */
const NOMBRES_TECLA: Record<string, string> = {
  Space: 'Barra espaciadora',
  Enter: 'Enter',
  Escape: 'Esc',
  Tab: 'Tabulador',
};

/** Traduce un `KeyboardEvent.code` (p. ej. "KeyF", "Digit1") a algo legible */
export const nombreTecla = (code: string): string => {
  if (NOMBRES_TECLA[code]) return NOMBRES_TECLA[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  return code;
};
