/**
 * Tabla periódica muda para imprimir (S0259, 07/11/2026).
 *
 * Por qué existe: en Bing, «tabla periodica muda» (441 impresiones en 6 meses), «vacia» (252),
 * «en blanco» (207), «pdf» (226) y «para imprimir» (95), y esta página, con 40.189 impresiones
 * en 90 días en Google, recibía 1 por esas consultas: no tenía hoja que imprimir.
 *
 * Aquí solo vive lo que no depende de la vista (qué puede llevar cada casilla y la frase que
 * anuncia la hoja), para poder probarlo sin navegador. La rejilla está en page.tsx.
 */

/** Lo que puede llevar cada casilla de la hoja impresa. Lo que no se marca sale en blanco. */
export type CampoHoja = 'numero' | 'simbolo' | 'nombre' | 'masa';
export type CamposHoja = Record<CampoHoja, boolean>;

export const CAMPOS_HOJA: { clave: CampoHoja; etiqueta: string; enFrase: string }[] = [
  { clave: 'numero', etiqueta: 'Número atómico', enFrase: 'el número atómico' },
  { clave: 'simbolo', etiqueta: 'Símbolo', enFrase: 'el símbolo' },
  { clave: 'nombre', etiqueta: 'Nombre', enFrase: 'el nombre' },
  { clave: 'masa', etiqueta: 'Masa atómica', enFrase: 'la masa atómica' },
];

/** La muda clásica: solo el número atómico, para escribir el símbolo y el nombre. */
export const CAMPOS_HOJA_INICIALES: CamposHoja = { numero: true, simbolo: false, nombre: false, masa: false };

/** Con todo marcado no hay nada que completar, así que tampoco solucionario. */
export const llevaSolucionario = (campos: CamposHoja): boolean =>
  CAMPOS_HOJA.some((c) => !campos[c.clave]);

const enumerar = (partes: string[]): string =>
  partes.length <= 1 ? partes.join('') : `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;

/** La frase que dice, antes de imprimir, qué hoja va a salir. */
export function resumenHoja(campos: CamposHoja): string {
  const visibles = CAMPOS_HOJA.filter((c) => campos[c.clave]).map((c) => c.enFrase);
  if (visibles.length === CAMPOS_HOJA.length) {
    return 'Saldrá la tabla completa, con los cuatro datos en cada casilla, en una sola página.';
  }
  if (visibles.length === 0) {
    return 'Saldrá la tabla vacía, solo con la forma y los números de grupo y de período, y detrás el solucionario.';
  }
  return `Saldrá cada casilla con ${enumerar(visibles)} y el resto en blanco, y detrás el solucionario.`;
}
