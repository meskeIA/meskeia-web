/**
 * Motor del Generador de Ondas y Visualizador — funciones puras, sin React ni Web Audio.
 *
 * Se separan de la vista para poder razonarlas con casos a mano:
 *  - `envolventePorColumna`: lo que dibujan los estilos «Línea» y «Espejo» del visualizador.
 *  - `formatearTamano`: el tamaño del archivo en formato español (hallazgo 1763).
 */

import { formatNumber } from '@/lib';

export interface ColumnaEnvolvente {
  /** Muestra más baja de la columna, en [−1, 1]. */
  min: number;
  /** Muestra más alta de la columna, en [−1, 1]. */
  max: number;
}

/**
 * Mínimo y máximo de las muestras que caen en cada una de las `columnas` del lienzo.
 *
 * Caso a mano: una senoidal de amplitud a, con muchas muestras por columna, da en cada columna
 * min ≈ −a y max ≈ +a. Por eso el estilo «Línea» NO puede pintar (min + max)/2, que vale ≈ 0
 * en cualquier audio simétrico y dibujaba una recta en el eje (hallazgo 1761): pinta el
 * contorno, la curva de los máximos y la de los mínimos.
 *
 * Una columna sin muestras (archivo más corto que el ancho) devuelve { min: 0, max: 0 }.
 */
export function envolventePorColumna(datos: Float32Array, columnas: number): ColumnaEnvolvente[] {
  const salida: ColumnaEnvolvente[] = [];
  const paso = Math.max(1, Math.ceil(datos.length / columnas));
  for (let c = 0; c < columnas; c++) {
    const desde = c * paso;
    const hasta = Math.min(datos.length, desde + paso);
    if (desde >= hasta) {
      salida.push({ min: 0, max: 0 });
      continue;
    }
    let min = Infinity;
    let max = -Infinity;
    for (let i = desde; i < hasta; i++) {
      const v = datos[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    salida.push({ min, max });
  }
  return salida;
}

/**
 * Tamaño de archivo en B, KB o MB (base 1.024), con coma decimal.
 * Casos a mano: 39 → «39 B» · 16.044 → 16.044/1.024 = 15,668 → «15,7 KB» ·
 * 3.145.728 → 3 MB exactos → «3,00 MB».
 */
export function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${formatNumber(bytes / 1024, 1)} KB`;
  return `${formatNumber(bytes / (1024 * 1024), 2)} MB`;
}
