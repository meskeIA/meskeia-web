/**
 * Motor del Simulador de Transformaciones de Funciones — funciones puras, sin React ni DOM.
 *
 * f(x) = a · g(b · (x − c)) + d
 *
 * Todo lo de este fichero vivía dentro de `page.tsx` y se MOVIÓ aquí el 28/09/2026 sin
 * cambiar una sola operación, para que la tarea de aula (`casos.ts`) evalúe la gráfica con
 * la MISMA `evaluarTransformada` con la que el lienzo la pinta. Si hubiera dos
 * implementaciones, la app podría suspender una predicción que ella misma enseña en pantalla.
 *
 * ⚠️ Lo que no se toca sin mirar el lienzo:
 * - `b = 0` se sustituye por 0,001 (`bSafe`) tanto al evaluar como al escribir la ecuación.
 * - `construirEcuacion` escribe EXACTAMENTE la función que `evaluarTransformada` dibuja. Hasta el
 *   28/09/2026 no era así (hallazgos 2340 y 2341): con x² y c = 0 escribía «b·x²» sin paréntesis,
 *   así que b = 2 salía como «2·x²» (la misma fórmula que a = 2, cuando el lienzo dibuja
 *   (2x)² = 4x²) y b = −1 como «-x²» (una parábola hacia abajo, cuando (−x)² = x²). Y con b = 1 y
 *   c ≠ 0 duplicaba el paréntesis: «sin((x − 2))», «|(x − 2)|». La regla de ahora: el ARGUMENTO
 *   b·(x − c) se escribe una sola vez, y cada función lo envuelve con lo que su notación exige —
 *   la potencia es la única que necesita paréntesis propios, y solo si el argumento no es «x».
 *   El spec lo comprueba evaluando la fórmula ESCRITA contra `evaluarTransformada` en una rejilla.
 * - Los signos de la fórmula son todos U+2212 («−»), el binario y el unario: antes el de a y b
 *   salía con guion (U+002D) y los de c y d con «−», en la misma línea.
 */

import { formatNumber } from '@/lib';

// ============================================
// TIPOS
// ============================================
export type FuncionBase = 'sin' | 'cos' | 'cuadratica' | 'absoluto' | 'raiz';

export interface ConfigFuncion {
  id: FuncionBase;
  etiqueta: string;
  simbolo: string;
  icono: string;
}

// ============================================
// CONSTANTES
// ============================================
export const FUNCIONES_BASE: ConfigFuncion[] = [
  { id: 'sin', etiqueta: 'sin(x)', simbolo: 'sin', icono: '〜' },
  { id: 'cos', etiqueta: 'cos(x)', simbolo: 'cos', icono: '〰' },
  { id: 'cuadratica', etiqueta: 'x²', simbolo: 'x²', icono: '⌒' },
  { id: 'absoluto', etiqueta: '|x|', simbolo: '|x|', icono: '∧' },
  { id: 'raiz', etiqueta: '√x', simbolo: '√x', icono: '√' },
];

// ============================================
// FUNCIONES MATEMÁTICAS
// ============================================

export function evaluarBase(tipo: FuncionBase, x: number): number {
  switch (tipo) {
    case 'sin': return Math.sin(x);
    case 'cos': return Math.cos(x);
    case 'cuadratica': return x * x;
    case 'absoluto': return Math.abs(x);
    case 'raiz': return x >= 0 ? Math.sqrt(x) : NaN;
  }
}

export function evaluarTransformada(tipo: FuncionBase, a: number, b: number, c: number, d: number, x: number): number {
  const bSafe = b === 0 ? 0.001 : b;
  const inner = bSafe * (x - c);
  const base = evaluarBase(tipo, inner);
  if (isNaN(base)) return NaN;
  return a * base + d;
}

/**
 * Rótulo de un parámetro (deslizadores, etiquetas del panel): entero sin decimales y, si no, con
 * uno, que es el paso de los deslizadores. Con `formatNumber` (formato español), no `toFixed`.
 */
export function fmtParam(valor: number): string {
  const entero = Math.abs(valor - Math.round(valor)) < 1e-9;
  return formatNumber(entero ? Math.round(valor) : valor, entero ? 0 : 1);
}

/** El signo menos de la fórmula (U+2212), el mismo para el binario y el unario. */
const MENOS = '−';

/** Un coeficiente dentro de la fórmula: su valor absoluto y el signo «−» tipográfico delante. */
function coeficiente(valor: number): string {
  return `${valor < 0 ? MENOS : ''}${fmtParam(Math.abs(valor))}`;
}

/**
 * El argumento b·(x − c) tal como se lee: «x», «x − 2», «2·x», «−x», «2·(x − 1)», «−(x + 3)».
 * Solo lleva paréntesis propios cuando b multiplica a un (x − c).
 */
function construirArgumento(b: number, c: number): string {
  const traslacion = c === 0 ? 'x' : c > 0 ? `x − ${fmtParam(c)}` : `x + ${fmtParam(Math.abs(c))}`;
  if (b === 1) return traslacion;
  const factor = b === -1 ? MENOS : `${coeficiente(b)}·`;
  return c === 0 ? `${factor}x` : `${factor}(${traslacion})`;
}

/** g aplicada al argumento, con la notación de cada función. */
function aplicarBase(funcBase: FuncionBase, argumento: string): string {
  const esX = argumento === 'x';
  switch (funcBase) {
    case 'cuadratica':
      // La potencia es la única notación que no trae su propio paréntesis: sin él, «2·x²» y
      // «−x²» se leerían como 2·(x²) y −(x²), que es lo que escribe a, no b.
      return esX ? 'x²' : `(${argumento})²`;
    case 'absoluto':
      return `|${argumento}|`;
    case 'raiz':
      return esX ? '√x' : `√(${argumento})`;
    case 'sin':
      return `sin(${argumento})`;
    case 'cos':
      return `cos(${argumento})`;
  }
}

export function construirEcuacion(funcBase: FuncionBase, a: number, b: number, c: number, d: number): string {
  const aStr = a === 1 ? '' : a === -1 ? MENOS : `${coeficiente(a)}·`;
  const bSafe = b === 0 ? 0.001 : b;
  const dStr = d === 0 ? '' : d > 0 ? ` + ${fmtParam(d)}` : ` ${MENOS} ${fmtParam(Math.abs(d))}`;
  return `f(x) = ${aStr}${aplicarBase(funcBase, construirArgumento(bSafe, c))}${dStr}`;
}

/**
 * El deslizador de b no admite 0 (b = 0 borraría la x de la fórmula): cuando la entrada pide 0,
 * decide a qué lado del cero se queda. Hallazgo 2351 (28/09/2026): antes siempre devolvía 0,1,
 * así que desde 0,1 la flecha «←» pedía 0, volvía a 0,1 y por teclado nunca se cruzaba a
 * negativo.
 * - Un PASO desde ±0,1 (flechas, o el incremento de un lector de pantalla) cruza al otro lado:
 *   desde 0,1 va a −0,1 y desde −0,1 va a 0,1.
 * - Arrastrando con el puntero se queda en el lado de donde viene: si el cero cruzara, el valor
 *   parpadearía entre ±0,1 mientras el puntero pasa por el centro. Sigue arrastrando y cruza.
 * - Un SALTO a 0 desde más lejos se queda en el lado de donde viene (desde 1 → 0,1).
 */
export function ajustarB(pedido: number, previo: number, arrastrando: boolean): number {
  if (pedido !== 0) return pedido;
  const lado = previo < 0 ? -1 : 1;
  const esPasoDesdeElBorde = Math.abs(Math.abs(previo) - 0.1) < 1e-9;
  if (esPasoDesdeElBorde && !arrastrando) return -lado * 0.1;
  return lado * 0.1;
}
