/**
 * Motor del estimador break-even (análisis coste-volumen-beneficio), sin dependencias de React.
 *
 * Reparado el 09/11/2026 (hallazgos 4313-4319 del Inspector). Antes vivía dentro del useMemo de
 * page.tsx y tenía cuatro fallos que comparten raíz —un número inventado donde no hay número—:
 *   · con margen de contribución ≤ 0 devolvía 0 unidades como centinela, y la pantalla anunciaba
 *     «0 unidades/mes» justo a quien vende por debajo del coste (4313);
 *   · `Math.ceil` sobre el cociente en coma flotante: 1.200 ÷ (2,30 − 1,10) daba 1001 (4315);
 *   · «|| 0» convertía un importe ilegible en 0 y lo calculaba sin decir nada (4316);
 *   · con costes fijos 0 la barra decía «0 % del punto de equilibrio» con beneficio (4318).
 * Ahora «no hay equilibrio» es `null`, y quien pinta decide qué decir.
 */

export interface Equilibrio {
  /** Margen de contribución por unidad (P − CV). */
  margen: number;
  /** Unidades de equilibrio, o null si el margen es ≤ 0 (ninguna cantidad cubre los fijos). */
  unidades: number | null;
  /** Facturación en el equilibrio (unidades × P), o null. */
  euros: number | null;
}

/**
 * Techo «limpio»: si el cociente es un entero salvo error de coma flotante, ese entero; si no,
 * el techo. 1.200 ÷ 1,2000000000000002 = 999,9999999999998 → 1000, no 1001; 2,5 → 3.
 */
export function techoLimpio(x: number): number {
  const entero = Math.round(x);
  if (Math.abs(x - entero) <= 1e-9 * Math.max(1, Math.abs(x))) return entero;
  return Math.ceil(x);
}

export function calcularEquilibrio(precio: number, costeVariable: number, fijos: number): Equilibrio {
  // El margen se redondea a la millonésima para que 2,30 − 1,10 sea 1,2 y no 1,1999999999999997.
  const margen = Math.round((precio - costeVariable) * 1e6) / 1e6;
  if (margen <= 0) return { margen, unidades: null, euros: null };
  const unidades = techoLimpio(fijos / margen);
  return { margen, unidades, euros: unidades * precio };
}

/** Unidades para cubrir los fijos y además ganar `objetivo`, o null si el margen es ≤ 0. */
export function unidadesParaObjetivo(
  precio: number,
  costeVariable: number,
  fijos: number,
  objetivo: number,
): number | null {
  return calcularEquilibrio(precio, costeVariable, fijos + objetivo).unidades;
}

/**
 * Resultado de vender exactamente las unidades de equilibrio. Como se redondean HACIA ARRIBA a
 * la unidad, casi nunca es 0: con P 10.000, CV 4.000 y CF 15.000 son 3 uds y +3.000 € (4317).
 */
export function resultadoEnEquilibrio(precio: number, costeVariable: number, fijos: number, unidades: number): number {
  const r = unidades * precio - fijos - unidades * costeVariable;
  return Math.abs(r) < 0.005 ? 0 : r;
}

export type LecturaImporte =
  | { estado: 'vacio' }
  | { estado: 'ilegible' }
  | { estado: 'negativo'; valor: number }
  | { estado: 'ok'; valor: number };

/** Clasifica lo tecleado en un importe. `leer` es el parser (parseSpanishNumber). */
export function clasificarImporte(texto: string, leer: (t: string) => number): LecturaImporte {
  if (texto.trim() === '') return { estado: 'vacio' };
  const valor = leer(texto);
  if (!Number.isFinite(valor)) return { estado: 'ilegible' };
  if (valor < 0) return { estado: 'negativo', valor };
  return { estado: 'ok', valor };
}

/**
 * Mensaje de error de un campo, o undefined si se puede leer (o está vacío). `nombre` va con su
 * artículo («el precio de venta») y `negativo` es la frase entera, por la concordancia.
 */
export function errorDeImporte(lectura: LecturaImporte, nombre: string, negativo: string): string | undefined {
  if (lectura.estado === 'ilegible') return `No se ha podido leer ${nombre}: revisa la cifra.`;
  if (lectura.estado === 'negativo') return negativo;
  return undefined;
}
