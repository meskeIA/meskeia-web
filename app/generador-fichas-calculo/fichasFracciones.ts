/**
 * Ejercicios de fracciones del Generador de Fichas de Cálculo (S0216, 20/10/2026).
 *
 * Funciones puras, fuera de `page.tsx` para poder probarlas: `tests/fichas-fracciones-motor.spec.ts`
 * recorre cientos de fichas y comprueba que ningún ejercicio sale negativo, nulo o con un m.c.m.
 * de cuaderno imposible, y que cada solución es la que da la calculadora para ese mismo ejercicio.
 *
 * La aritmética NO vive aquí: las soluciones salen de `@/lib/calculadoras/fracciones`, el motor
 * de calculadora-fracciones, ya simplificadas. La plantilla de corrección y la calculadora no
 * pueden discrepar.
 *
 * Mismas reglas que el resto de la ficha: el minuendo es siempre el mayor (sin negativos) y nunca
 * sale un 0.
 */

import { compararValor, mcd, mcm, operar, simplificar, type Fraccion, type Operador } from '@/lib/calculadoras/fracciones';

export type TipoFraccion = 'mismo' | 'distinto' | 'producto' | 'simplificar' | 'mezcla';

/** `b` es null en «simplifica»: solo hay una fracción. */
export interface CuentaFraccion {
  tipo: 'fraccion';
  a: Fraccion;
  b: Fraccion | null;
  operador: Operador | null;
  simbolo: string;
  resultado: Fraccion;
}

export const TIPOS_FRACCION: { id: TipoFraccion; nombre: string; detalle: string }[] = [
  { id: 'mismo', nombre: 'Mismo denominador', detalle: 'Sumas y restas: 2/7 + 3/7' },
  { id: 'distinto', nombre: 'Distinto denominador', detalle: 'Sumas y restas con m.c.m.: 1/4 + 2/3' },
  { id: 'producto', nombre: 'Multiplicar y dividir', detalle: '2/3 × 4/5 · 3/4 : 1/2' },
  { id: 'simplificar', nombre: 'Simplificar', detalle: 'Hasta la irreducible: 12/18' },
  { id: 'mezcla', nombre: 'Mezcla', detalle: 'Las cuatro operaciones alternadas' },
];

/**
 * Denominador máximo según el nivel de la ficha. Un m.c.m. de dos denominadores grandes y primos
 * entre sí (13 y 15 → 195) ya no es un ejercicio de cuaderno: por eso además se acota el m.c.m.
 */
export const DENOMINADOR_MAXIMO: Record<string, number> = {
  iniciacion: 6,
  basico: 8,
  intermedio: 10,
  avanzado: 12,
  experto: 15,
};
export const MCM_MAXIMO = 60;

/** Símbolo impreso: el de la ficha de enteros (división con dos puntos). */
const SIMBOLO_HOJA: Record<Operador, string> = { '+': '+', '-': '−', '*': '×', '/': ':' };

function entero(aleatorio: () => number, minimo: number, maximo: number): number {
  return minimo + Math.min(maximo - minimo, Math.floor(aleatorio() * (maximo - minimo + 1)));
}

/** Fracción propia con denominador `den` (o al azar entre 2 y `maxDen`, entonces irreducible). */
function fraccionPropia(aleatorio: () => number, maxDen: number, den?: number): Fraccion {
  const d = den ?? entero(aleatorio, 2, maxDen);
  let n = entero(aleatorio, 1, d - 1);
  while (den === undefined && mcd(n, d) !== 1) n = entero(aleatorio, 1, d - 1);
  return { num: n, den: d };
}

function cuenta(a: Fraccion, operador: Operador, b: Fraccion): CuentaFraccion {
  const r = operar(a, operador, b);
  // Con fracciones propias de denominador ≤ 15 el motor nunca falla; el respaldo evita un throw
  const resultado = r.ok ? r.valor : { num: 0, den: 1 };
  return { tipo: 'fraccion', a, b, operador, simbolo: SIMBOLO_HOJA[operador], resultado };
}

/** Un ejercicio de fracciones del tipo pedido, con la dificultad del nivel. */
export function generarFraccion(tipo: TipoFraccion, nivelId: string, aleatorio: () => number): CuentaFraccion {
  const maxDen = DENOMINADOR_MAXIMO[nivelId] ?? 10;
  const real: Exclude<TipoFraccion, 'mezcla'> =
    tipo === 'mezcla' ? (['mismo', 'distinto', 'producto', 'producto'] as const)[entero(aleatorio, 0, 3)] : tipo;

  switch (real) {
    case 'mismo': {
      const den = entero(aleatorio, 3, maxDen);
      let a = fraccionPropia(aleatorio, maxDen, den);
      let b = fraccionPropia(aleatorio, maxDen, den);
      if (aleatorio() < 0.5) return cuenta(a, '+', b);
      // Resta: numeradores distintos (si no, saldría 0) y el mayor delante
      while (a.num === b.num) b = fraccionPropia(aleatorio, maxDen, den);
      if (a.num < b.num) [a, b] = [b, a];
      return cuenta(a, '-', b);
    }
    case 'distinto': {
      let a = fraccionPropia(aleatorio, maxDen);
      let b = fraccionPropia(aleatorio, maxDen);
      const valido = () => a.den !== b.den && mcm(a.den, b.den) <= MCM_MAXIMO && compararValor(a, b) !== 0;
      for (let i = 0; i < 50 && !valido(); i++) {
        a = fraccionPropia(aleatorio, maxDen);
        b = fraccionPropia(aleatorio, maxDen);
      }
      // Respaldo determinista: 1/2 y 1/3 cumplen todo en cualquier nivel
      if (!valido()) {
        a = { num: 1, den: 2 };
        b = { num: 1, den: 3 };
      }
      if (aleatorio() < 0.5) return cuenta(a, '+', b);
      if (compararValor(a, b) < 0) [a, b] = [b, a];
      return cuenta(a, '-', b);
    }
    case 'producto': {
      const a = fraccionPropia(aleatorio, maxDen);
      const b = fraccionPropia(aleatorio, maxDen);
      return cuenta(a, aleatorio() < 0.5 ? '*' : '/', b);
    }
    case 'simplificar':
    default: {
      const base = fraccionPropia(aleatorio, maxDen);
      const k = entero(aleatorio, 2, Math.max(3, Math.floor(maxDen / 2)));
      const a = { num: base.num * k, den: base.den * k };
      return { tipo: 'fraccion', a, b: null, operador: null, simbolo: '', resultado: simplificar(a) };
    }
  }
}
