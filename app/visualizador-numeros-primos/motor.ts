/**
 * Motor de la criba de Eratóstenes por RANGO — sin dependencias, probado en
 * tests/criba-rango-motor.spec.ts con casos resueltos a mano.
 *
 * ── De dónde sale (19/10/2026, semilla S0213) ──
 * Las únicas consultas de Search Console que traía la página eran de rango —«criba de
 * eratostenes del 1 al 300», «del 101 al 200»—, y la criba arrancaba siempre en 1 con cuatro
 * límites fijos. Un ejercicio «del 101 al 200» no se podía hacer aquí.
 *
 * La trampa de la criba por rango: los primos que TACHAN son los de hasta √hasta, y si la
 * hoja empieza en 101 ninguno de ellos está en ella. Hay que tachar los múltiplos de 2, 3,
 * 5, 7, 11 y 13 aunque esos números no aparezcan. Por eso el resultado los separa en
 * `primosFueraDeHoja`: es lo primero que necesita saber quien criba a mano.
 */

/** Hasta dónde llega la criba. 1.000 casillas aún se dibujan sin atascar el navegador. */
export const CRIBA_MAXIMO = 1000;

export interface CeldaResuelta {
  numero: number;
  primo: boolean;
  /** El primo que la tacha en la criba: su menor factor primo. `null` si es primo o es el 1. */
  tachadoPor: number | null;
}

export interface CribaResuelta {
  desde: number;
  hasta: number;
  celdas: CeldaResuelta[];
  /** Los primos que quedan en la hoja, en orden. */
  primos: number[];
  /** Los primos cuyos múltiplos hay que tachar: todos los de hasta √hasta. */
  primosQueTachan: number[];
  /** Los que tachan sin estar en la hoja (los menores que `desde`). */
  primosFueraDeHoja: number[];
}

/** Primos hasta `n` incluido, por la propia criba. */
export function primosHasta(n: number): number[] {
  if (n < 2) return [];
  const compuesto = new Uint8Array(n + 1);
  const primos: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (compuesto[i]) continue;
    primos.push(i);
    for (let j = i * i; j <= n; j += i) compuesto[j] = 1;
  }
  return primos;
}

/** Mayor entero cuyo cuadrado no pasa de `n`, sin depender del redondeo de Math.sqrt. */
function raizEntera(n: number): number {
  let r = Math.floor(Math.sqrt(n));
  while (r * r > n) r--;
  while ((r + 1) * (r + 1) <= n) r++;
  return r;
}

/**
 * Comprueba un rango antes de cribarlo. Devuelve el motivo del rechazo, en una frase que
 * se puede enseñar tal cual, o `null` si el rango vale.
 */
export function validarRango(desde: number, hasta: number): string | null {
  if (!Number.isFinite(desde) || !Number.isFinite(hasta)) return 'Escribe los dos números del rango.';
  if (!Number.isInteger(desde) || !Number.isInteger(hasta)) return 'La criba trabaja con números enteros.';
  if (desde < 1) return 'El rango empieza como pronto en 1.';
  if (hasta > CRIBA_MAXIMO) return `El rango llega como mucho a ${CRIBA_MAXIMO.toLocaleString('es-ES')}.`;
  if (hasta <= desde) return 'El final del rango tiene que ser mayor que el principio.';
  return null;
}

/** Criba el rango [desde, hasta]. Lanza si el rango no pasa `validarRango`. */
export function resolverCriba(desde: number, hasta: number): CribaResuelta {
  const error = validarRango(desde, hasta);
  if (error) throw new Error(error);

  const primosQueTachan = primosHasta(raizEntera(hasta));
  const celdas: CeldaResuelta[] = [];
  for (let n = desde; n <= hasta; n++) {
    if (n === 1) {
      celdas.push({ numero: 1, primo: false, tachadoPor: null });
      continue;
    }
    // El primero que lo divide es su menor factor primo; si ninguno de hasta √hasta lo
    // divide, es primo (un compuesto ≤ hasta tiene un factor ≤ √hasta).
    const factor = primosQueTachan.find((p) => p < n && n % p === 0) ?? null;
    celdas.push({ numero: n, primo: factor === null, tachadoPor: factor });
  }

  return {
    desde,
    hasta,
    celdas,
    primos: celdas.filter((c) => c.primo).map((c) => c.numero),
    primosQueTachan,
    primosFueraDeHoja: primosQueTachan.filter((p) => p < desde),
  };
}
