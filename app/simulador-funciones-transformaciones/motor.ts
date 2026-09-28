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
 * - `fmtParam` usa `toFixed(1)`: es el rótulo de los deslizadores (paso 0,1) y ya estaba así.
 */

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

export function fmtParam(valor: number): string {
  if (valor === Math.floor(valor)) return String(valor);
  return valor.toFixed(1).replace('.', ',');
}

export function construirEcuacion(funcBase: FuncionBase, a: number, b: number, c: number, d: number): string {
  const config = FUNCIONES_BASE.find(f => f.id === funcBase);
  const simbolo = config?.simbolo ?? funcBase;

  const aStr = a === 1 ? '' : a === -1 ? '-' : `${fmtParam(a)}·`;
  const bSafe = b === 0 ? 0.001 : b;
  const bStr = bSafe === 1 ? '' : bSafe === -1 ? '-' : `${fmtParam(bSafe)}·`;
  const cStr = c === 0 ? 'x' : c > 0 ? `(x − ${fmtParam(c)})` : `(x + ${fmtParam(Math.abs(c))})`;
  const dStr = d === 0 ? '' : d > 0 ? ` + ${fmtParam(d)}` : ` − ${fmtParam(Math.abs(d))}`;

  let argumento: string;
  if (funcBase === 'cuadratica') {
    argumento = c === 0 ? `${bStr}x` : `(${bStr}${cStr})`;
    if (bSafe === 1 && c !== 0) argumento = cStr;
    if (bSafe === 1 && c === 0) argumento = 'x';
    return `f(x) = ${aStr}${argumento}²${dStr}`;
  }
  if (funcBase === 'absoluto') {
    argumento = c === 0 ? `${bStr}x` : `${bStr}${cStr}`;
    if (bSafe === 1 && c !== 0) argumento = cStr;
    if (bSafe === 1 && c === 0) argumento = 'x';
    return `f(x) = ${aStr}|${argumento}|${dStr}`;
  }
  if (funcBase === 'raiz') {
    argumento = c === 0 ? `${bStr}x` : `${bStr}${cStr}`;
    if (bSafe === 1 && c !== 0) argumento = cStr;
    if (bSafe === 1 && c === 0) argumento = 'x';
    return `f(x) = ${aStr}√(${argumento})${dStr}`;
  }

  // sin/cos
  argumento = c === 0 ? `${bStr}x` : `${bStr}${cStr}`;
  if (bSafe === 1 && c !== 0) argumento = cStr;
  if (bSafe === 1 && c === 0) argumento = 'x';
  return `f(x) = ${aStr}${simbolo}(${argumento})${dStr}`;
}
