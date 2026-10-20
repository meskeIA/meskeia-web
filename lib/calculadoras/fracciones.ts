/**
 * Motor de fracciones — aritmética EXACTA, sin React ni DOM.
 *
 * Usada por: `app/calculadora-fracciones/`, la calculadora y sus casos de aula, y
 * `app/generador-fichas-calculo/`, las fichas de fracciones y su hoja de soluciones. Una sola
 * implementación: la ficha impresa y la calculadora no pueden dar soluciones distintas.
 *
 * Vive fuera de las páginas porque el build las compila sin comprobar si la matemática está
 * bien: lo que aquí se equivoque no lo delata ningún candado, solo `tests/fracciones-motor.spec.ts`
 * (casos resueltos a mano) y `tests/apps/calculadora-fracciones.spec.ts` (los casos de aula).
 *
 * CONVENIO (el de la escuela, en España y en Latinoamérica)
 * ─────────────────────────────────────────────────────────
 *   · Jerarquía: paréntesis → potencias → multiplicaciones y divisiones de izquierda a derecha →
 *     sumas y restas de izquierda a derecha. `−2^2` es −(2²) = −4.
 *   · Suma y resta por el m.c.m. de los denominadores (no por el producto cruzado: da la misma
 *     fracción, pero no la que el alumno ve en su cuaderno).
 *   · División: se multiplica por la inversa.
 *   · Cada resultado intermedio se SIMPLIFICA antes de seguir, como en el cuaderno.
 *   · La barra `/` entre dos enteros escritos ES una fracción, y liga más que cualquier operación:
 *     `1/2 ÷ 3/4` es (1/2) ÷ (3/4). Cualquier otra `/` es una división.
 *   · `2/3^2` es ambiguo (¿(2/3)² o 2/3²?), así que NO se adivina: se pide el paréntesis.
 *   · Coma y punto valen los dos como separador decimal (0,25 y 0.25): en una operación con
 *     fracciones no hay millares que agrupar, y el punto es el decimal de México y Centroamérica.
 *
 * Nada lanza: un error es `{ ok: false, error }`, que la vista pinta. Un `throw` dentro de un
 * render tumbaría la página entera (el analizador usa una excepción interna y la captura).
 *
 * Números en `number` con comprobación de entero seguro (2^53): por encima, el cálculo deja de ser
 * exacto y se devuelve un error en vez de una cifra falsa. Las comparaciones por producto cruzado
 * van en BigInt, porque el producto de dos enteros seguros ya no lo es.
 */

export interface Fraccion {
  num: number;
  den: number;
}

/** Signo menos tipográfico: el de la pantalla. El guion se acepta al escribir. */
export const MENOS = '−';

const FORMATO_ENTERO = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });

/* ─────────────────────────────── Primitivas ─────────────────────────────── */

/** Máximo común divisor (Euclides). mcd(0, 0) = 0. */
export function mcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const r = x % y;
    x = y;
    y = r;
  }
  return x;
}

/** Mínimo común múltiplo. NaN si se sale de los enteros seguros. */
export function mcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  const r = Math.abs((a / mcd(a, b)) * b);
  return Number.isSafeInteger(r) ? r : NaN;
}

function seguros(...ns: number[]): boolean {
  return ns.every((n) => Number.isSafeInteger(n));
}

/** El signo va al numerador y el denominador queda positivo. No simplifica. */
export function normalizar(f: Fraccion): Fraccion {
  if (f.den < 0) return { num: -f.num || 0, den: -f.den };
  return { num: f.num || 0, den: f.den };
}

/** Fracción irreducible equivalente. 0/7 → 0/1. */
export function simplificar(f: Fraccion): Fraccion {
  const n = normalizar(f);
  if (n.num === 0) return { num: 0, den: 1 };
  const k = mcd(n.num, n.den);
  return { num: n.num / k, den: n.den / k };
}

/** ¿Ya es irreducible? (con el denominador positivo; 0 solo lo es como 0/1). */
export function esIrreducible(f: Fraccion): boolean {
  const n = normalizar(f);
  if (n.num === 0) return n.den === 1;
  return mcd(n.num, n.den) === 1;
}

/** Signo de a − b, por producto cruzado en BigInt: −1, 0 o 1. */
export function compararValor(a: Fraccion, b: Fraccion): number {
  const x = normalizar(a);
  const y = normalizar(b);
  const d = BigInt(x.num) * BigInt(y.den) - BigInt(y.num) * BigInt(x.den);
  return d === BigInt(0) ? 0 : d > BigInt(0) ? 1 : -1;
}

export function igualValor(a: Fraccion, b: Fraccion): boolean {
  return compararValor(a, b) === 0;
}

export function aDecimal(f: Fraccion): number {
  return f.num / f.den;
}

/* ─────────────────────────────── Texto ─────────────────────────────── */

/** Un entero con el formato español (12.345; 4 cifras sin agrupar) y el menos tipográfico. */
export function textoEntero(n: number): string {
  const t = FORMATO_ENTERO.format(Math.abs(n));
  return n < 0 ? MENOS + t : t;
}

/** «3/4», «−3/4» o «5» si el denominador es 1. NO simplifica: 6/8 se escribe 6/8. */
export function textoFraccion(f: Fraccion): string {
  const n = normalizar(f);
  if (n.den === 1) return textoEntero(n.num);
  return `${textoEntero(n.num)}/${textoEntero(n.den)}`;
}

/** Igual que `textoFraccion`, pero un negativo va entre paréntesis (para ir detrás de un signo). */
function textoOperando(f: Fraccion): string {
  const t = textoFraccion(f);
  return normalizar(f).num < 0 ? `(${t})` : t;
}

export interface Mixto {
  negativo: boolean;
  entero: number;
  /** Parte fraccionaria, positiva y propia (num < den). num = 0 si el valor es entero. */
  parte: Fraccion;
}

/** Número mixto de una fracción (se simplifica antes): 7/4 → 1 y 3/4. */
export function aMixto(f: Fraccion): Mixto {
  const s = simplificar(f);
  const a = Math.abs(s.num);
  return {
    negativo: s.num < 0,
    entero: Math.floor(a / s.den),
    parte: { num: a % s.den, den: s.den },
  };
}

/** «1 3/4», «−2 1/3», «5» o «3/4» (sin parte entera). */
export function textoMixto(m: Mixto): string {
  const signo = m.negativo ? MENOS : '';
  if (m.parte.num === 0) return signo + textoEntero(m.entero);
  if (m.entero === 0) return signo + textoFraccion(m.parte);
  return `${signo}${textoEntero(m.entero)} ${textoFraccion(m.parte)}`;
}

export interface DesarrolloDecimal {
  negativo: boolean;
  entera: string;
  /** Cifras decimales que no se repiten. */
  anteperiodo: string;
  /** Cifras que se repiten sin fin ('' si el decimal es exacto). */
  periodo: string;
  /** El período es tan largo que no se ha calculado entero. */
  truncado: boolean;
}

/**
 * Desarrollo decimal exacto por división larga: 5/6 = 0,8(3), 1/7 = 0,(142857), 3/8 = 0,375.
 * Se detiene al repetirse un resto (ahí empieza el período) o a las `maxCifras` cifras.
 */
export function desarrolloDecimal(f: Fraccion, maxCifras = 60): DesarrolloDecimal {
  const s = simplificar(f);
  const a = Math.abs(s.num);
  const entera = Math.floor(a / s.den);
  let resto = a % s.den;
  const visto = new Map<number, number>();
  let cifras = '';
  while (resto !== 0 && !visto.has(resto) && cifras.length < maxCifras) {
    visto.set(resto, cifras.length);
    resto *= 10;
    cifras += String(Math.floor(resto / s.den));
    resto %= s.den;
  }
  const base = { negativo: s.num < 0, entera: textoEntero(entera) };
  if (resto === 0) return { ...base, anteperiodo: cifras, periodo: '', truncado: false };
  if (visto.has(resto)) {
    const inicio = visto.get(resto) as number;
    return { ...base, anteperiodo: cifras.slice(0, inicio), periodo: cifras.slice(inicio), truncado: false };
  }
  return { ...base, anteperiodo: cifras, periodo: '', truncado: true };
}

/** «0,8(3)» — el período entre paréntesis. Para pantalla, la vista lo pinta con una raya encima. */
export function textoDecimal(d: DesarrolloDecimal): string {
  const signo = d.negativo ? MENOS : '';
  if (!d.anteperiodo && !d.periodo) return signo + d.entera;
  const periodo = d.periodo ? `(${d.periodo})` : '';
  return `${signo}${d.entera},${d.anteperiodo}${periodo}${d.truncado ? '…' : ''}`;
}

/* ─────────────────────────── Factorización ─────────────────────────── */

/** Tope de la descomposición en primos: división de prueba hasta la raíz, milisegundos. */
const MAX_FACTORIZAR = 1e12;

/** Factores primos de |n| (n ≥ 2): 84 → [[2,2],[3,1],[7,1]]. null si es 0, 1 o pasa del tope. */
export function factorizar(n: number): [number, number][] | null {
  let x = Math.abs(n);
  if (!Number.isSafeInteger(x) || x < 2 || x > MAX_FACTORIZAR) return null;
  const r: [number, number][] = [];
  for (let p = 2; p * p <= x; p += p === 2 ? 1 : 2) {
    let e = 0;
    while (x % p === 0) {
      x /= p;
      e++;
    }
    if (e > 0) r.push([p, e]);
  }
  if (x > 1) r.push([x, 1]);
  return r;
}

const SUPERINDICES = '⁰¹²³⁴⁵⁶⁷⁸⁹';

/** 12 → «¹²»; −2 → «⁻²». */
export function superindice(n: number): string {
  const t = String(Math.abs(n))
    .split('')
    .map((c) => SUPERINDICES[Number(c)])
    .join('');
  return n < 0 ? '⁻' + t : t;
}

/** [[2,2],[3,1],[7,1]] → «2² · 3 · 7». */
export function textoFactores(fs: [number, number][]): string {
  return fs.map(([p, e]) => (e === 1 ? textoEntero(p) : textoEntero(p) + superindice(e))).join(' · ');
}

export interface Simplificacion {
  original: Fraccion;
  resultado: Fraccion;
  mcd: number;
  lineas: string[];
}

/**
 * Explica cómo se llega a la irreducible: m.c.d. por factores primos cuando se puede, y la
 * división de numerador y denominador entre él.
 */
export function explicarSimplificacion(f: Fraccion): Simplificacion {
  const o = normalizar(f);
  const resultado = simplificar(o);
  const lineas: string[] = [];
  if (o.num === 0) {
    lineas.push(`Un numerador 0 da siempre 0: ${textoFraccion(o)} = 0.`);
    return { original: o, resultado, mcd: o.den, lineas };
  }
  const k = mcd(o.num, o.den);
  const fa = factorizar(o.num);
  const fb = factorizar(o.den);
  const a = textoEntero(Math.abs(o.num));
  const b = textoEntero(o.den);
  if (fa && fb) {
    lineas.push(`Descomponemos en factores primos: ${a} = ${textoFactores(fa)} y ${b} = ${textoFactores(fb)}.`);
    const comunes: [number, number][] = [];
    for (const [p, e] of fa) {
      const g = fb.find(([q]) => q === p);
      if (g) comunes.push([p, Math.min(e, g[1])]);
    }
    if (comunes.length === 0) {
      lineas.push(`No tienen ningún factor primo en común: m.c.d.(${a}, ${b}) = 1.`);
    } else {
      lineas.push(
        `Factores comunes con su menor exponente: m.c.d.(${a}, ${b}) = ${textoFactores(comunes)} = ${textoEntero(k)}.`,
      );
    }
  } else {
    lineas.push(`m.c.d.(${a}, ${b}) = ${textoEntero(k)} (algoritmo de Euclides).`);
  }
  if (k === 1) {
    lineas.push(`Como el m.c.d. es 1, ${textoFraccion(o)} ya es irreducible.`);
  } else {
    lineas.push(
      `Dividimos numerador y denominador entre ${textoEntero(k)}: ${textoFraccion(o)} = ${textoFraccion(resultado)}.`,
    );
  }
  return { original: o, resultado, mcd: k, lineas };
}

/* ──────────────────────── Operaciones con su explicación ──────────────────────── */

export type Operador = '+' | '-' | '*' | '/';

export const SIMBOLO: Record<Operador, string> = { '+': '+', '-': MENOS, '*': '×', '/': '÷' };

export type ResultadoOperacion = { ok: true; valor: Fraccion; explicacion: string[] } | { ok: false; error: string };

const ERROR_RANGO = 'El cálculo tiene demasiadas cifras para hacerlo de forma exacta. Prueba con números más pequeños.';

/** Cierra una operación: comprueba el rango y, si hace falta, anota la simplificación. */
function cerrar(bruto: Fraccion, explicacion: string[]): ResultadoOperacion {
  if (!seguros(bruto.num, bruto.den)) return { ok: false, error: ERROR_RANGO };
  const n = normalizar(bruto);
  const s = simplificar(n);
  if (s.num !== n.num || s.den !== n.den) {
    explicacion.push(
      n.num === 0
        ? `${textoFraccion(n)} = 0.`
        : `Simplificamos dividiendo entre ${textoEntero(mcd(n.num, n.den))}: ${textoFraccion(n)} = ${textoFraccion(s)}.`,
    );
  }
  return { ok: true, valor: s, explicacion };
}

/** a op b, con la explicación que se escribiría en el cuaderno. */
export function operar(a: Fraccion, op: Operador, b: Fraccion): ResultadoOperacion {
  const x = normalizar(a);
  const y = normalizar(b);
  const ta = textoFraccion(x);
  const tb = textoOperando(y);
  const s = SIMBOLO[op];

  if (op === '+' || op === '-') {
    const signo = op === '+' ? 1 : -1;
    if (x.den === 1 && y.den === 1) {
      const r = x.num + signo * y.num;
      return cerrar({ num: r, den: 1 }, [`${ta} ${s} ${tb} = ${textoEntero(r)}.`]);
    }
    if (x.den === y.den) {
      const r = x.num + signo * y.num;
      return cerrar({ num: r, den: x.den }, [
        `Tienen el mismo denominador: se ${op === '+' ? 'suman' : 'restan'} los numeradores y se deja el denominador. ${ta} ${s} ${tb} = ${textoFraccion({ num: r, den: x.den })}.`,
      ]);
    }
    const m = mcm(x.den, y.den);
    if (!Number.isFinite(m)) return { ok: false, error: ERROR_RANGO };
    const xa = { num: x.num * (m / x.den), den: m };
    const ya = { num: y.num * (m / y.den), den: m };
    if (!seguros(xa.num, ya.num)) return { ok: false, error: ERROR_RANGO };
    const r = xa.num + signo * ya.num;
    const conversiones: string[] = [];
    if (x.den !== m) conversiones.push(`${textoFraccion(x)} = ${textoFraccion(xa)}`);
    if (y.den !== m) conversiones.push(`${textoFraccion(y)} = ${textoFraccion(ya)}`);
    // Un entero no necesita m.c.m.: se escribe con el denominador de la otra fracción.
    const comun =
      x.den === 1 || y.den === 1
        ? `Escribimos el entero con denominador ${textoEntero(m)}: ${conversiones.join(' y ')}.`
        : `Denominador común: m.c.m.(${textoEntero(x.den)}, ${textoEntero(y.den)}) = ${textoEntero(m)}. ${conversiones.join(' y ')}.`;
    return cerrar({ num: r, den: m }, [
      comun,
      `${textoFraccion(xa)} ${s} ${textoOperando(ya)} = ${textoFraccion({ num: r, den: m })}.`,
    ]);
  }

  if (op === '*') {
    const n = x.num * y.num;
    const d = x.den * y.den;
    if (x.den === 1 && y.den === 1) return cerrar({ num: n, den: 1 }, [`${ta} × ${tb} = ${textoEntero(n)}.`]);
    if (x.den === 1 || y.den === 1) {
      return cerrar({ num: n, den: d }, [
        `Un entero multiplica solo al numerador: ${ta} × ${tb} = ${textoFraccion({ num: n, den: d })}.`,
      ]);
    }
    return cerrar({ num: n, den: d }, [
      `Numerador por numerador y denominador por denominador: ${ta} × ${tb} = ${textoFraccion({ num: n, den: d })}.`,
    ]);
  }

  // División
  if (y.num === 0) return { ok: false, error: 'No se puede dividir entre cero.' };
  const inversa = normalizar({ num: y.den, den: y.num });
  const n = x.num * inversa.num;
  const d = x.den * inversa.den;
  return cerrar({ num: n, den: d }, [
    `Dividir es multiplicar por la inversa: ${ta} ÷ ${tb} = ${ta} × ${textoOperando(inversa)} = ${textoFraccion({ num: n, den: d })}.`,
  ]);
}

/** Cómo se escribe una base de potencia: entre paréntesis si es fracción o negativa. */
function textoBase(f: Fraccion): string {
  return f.den === 1 && f.num >= 0 ? textoFraccion(f) : `(${textoFraccion(f)})`;
}

/** base^exp con exponente entero (también negativo o cero). */
export function potencia(base: Fraccion, exp: number): ResultadoOperacion {
  const b = normalizar(base);
  if (exp === 0) {
    if (b.num === 0) return { ok: false, error: '0 elevado a 0 no está definido.' };
    return cerrar({ num: 1, den: 1 }, [`Todo número distinto de 0 elevado a 0 vale 1: ${textoBase(b)}⁰ = 1.`]);
  }
  const explicacion: string[] = [];
  let f = b;
  let e = exp;
  if (exp < 0) {
    if (b.num === 0) return { ok: false, error: '0 elevado a un exponente negativo no está definido (sería dividir entre 0).' };
    f = normalizar({ num: b.den, den: b.num });
    e = -exp;
    explicacion.push(
      `Exponente negativo: se invierte la base y el exponente pasa a positivo. ${textoBase(b)}${superindice(exp)} = ${textoBase(f)}${superindice(e)}.`,
    );
  }
  const n = Math.pow(f.num, e);
  const d = Math.pow(f.den, e);
  if (!seguros(n, d)) return { ok: false, error: ERROR_RANGO };
  if (f.den === 1) {
    explicacion.push(`${textoBase(f)}${superindice(e)} = ${textoEntero(n)}.`);
  } else {
    const tn = f.num < 0 ? `(${textoEntero(f.num)})` : textoEntero(f.num);
    explicacion.push(
      `Se elevan el numerador y el denominador: ${textoBase(f)}${superindice(e)} = ${tn}${superindice(e)}/${textoEntero(f.den)}${superindice(e)} = ${textoFraccion({ num: n, den: d })}.`,
    );
  }
  return cerrar({ num: n, den: d }, explicacion);
}

/* ─────────────────────────── Expresiones combinadas ─────────────────────────── */

export type Nodo =
  | { t: 'num'; f: Fraccion; decimal?: string }
  | { t: 'bin'; op: Operador; a: Nodo; b: Nodo }
  | { t: 'neg'; x: Nodo }
  | { t: 'par'; x: Nodo }
  | { t: 'pot'; base: Nodo; exp: number };

type OpLexico = '+' | '-' | '*' | 'div' | 'barra' | '^' | '(' | ')';

type Token =
  | { k: 'ent'; v: number; texto: string }
  | { k: 'dec'; f: Fraccion; texto: string }
  | { k: 'op'; v: OpLexico };

/** Tope de longitud: una operación de clase cabe de sobra, y acota el trabajo del analizador. */
export const MAX_LONGITUD = 200;

const SUPER_A_DIGITO: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
};

/** Cada símbolo que se acepta al escribir y lo que significa. `/` decide luego el analizador. */
const SIMBOLOS_ENTRADA: Record<string, OpLexico> = {
  '+': '+', '-': '-', '−': '-', '–': '-', '—': '-',
  '*': '*', '×': '*', '·': '*', 'x': '*', 'X': '*', '⋅': '*',
  ':': 'div', '÷': 'div', '/': 'barra',
  '^': '^', '(': '(', ')': ')', '[': '(', ']': ')',
};

const ES_DIGITO = /[0-9]/;

type Tokenizado = { ok: true; tokens: Token[] } | { ok: false; error: string };

function tokenizar(s: string): Tokenizado {
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (ES_DIGITO.test(c)) {
      const inicio = i;
      while (i < s.length && ES_DIGITO.test(s[i])) i++;
      const enteros = s.slice(inicio, i);
      if ((s[i] === ',' || s[i] === '.') && ES_DIGITO.test(s[i + 1] ?? '')) {
        i++;
        const ini2 = i;
        while (i < s.length && ES_DIGITO.test(s[i])) i++;
        const decimales = s.slice(ini2, i);
        const num = Number(enteros + decimales);
        const den = Math.pow(10, decimales.length);
        if (!seguros(num, den)) return { ok: false, error: `El número ${s.slice(inicio, i)} tiene demasiadas cifras.` };
        tokens.push({ k: 'dec', f: { num, den }, texto: `${enteros},${decimales}` });
      } else {
        const v = Number(enteros);
        if (!Number.isSafeInteger(v)) return { ok: false, error: `El número ${enteros} tiene demasiadas cifras.` };
        tokens.push({ k: 'ent', v, texto: enteros });
      }
      continue;
    }
    if (c in SUPER_A_DIGITO) {
      let digitos = '';
      while (i < s.length && s[i] in SUPER_A_DIGITO) digitos += SUPER_A_DIGITO[s[i++]];
      tokens.push({ k: 'op', v: '^' });
      tokens.push({ k: 'ent', v: Number(digitos), texto: digitos });
      continue;
    }
    if (c in SIMBOLOS_ENTRADA) {
      tokens.push({ k: 'op', v: SIMBOLOS_ENTRADA[c] });
      i++;
      continue;
    }
    if (c === ',' || c === '.') {
      return { ok: false, error: 'Hay un separador decimal suelto: escribe una cifra antes y otra después (0,5).' };
    }
    return { ok: false, error: `No reconozco el símbolo «${c}». Usa números, / para las fracciones, + − × ÷ ^ y paréntesis.` };
  }
  return { ok: true, tokens };
}

class ErrorSintaxis {
  mensaje: string;
  constructor(mensaje: string) {
    this.mensaje = mensaje;
  }
}

function describir(t: Token): string {
  if (t.k !== 'op') return t.texto;
  const vista: Record<OpLexico, string> = { '+': '+', '-': MENOS, '*': '×', div: '÷', barra: '/', '^': '^', '(': '(', ')': ')' };
  return vista[t.v];
}

/** Analizador descendente recursivo. Los errores viajan como ErrorSintaxis y se capturan en `analizar`. */
function construirArbol(tokens: Token[]): Nodo {
  let p = 0;
  const ver = (): Token | undefined => tokens[p];
  const esOp = (v: OpLexico): boolean => {
    const t = ver();
    return !!t && t.k === 'op' && t.v === v;
  };

  function expr(): Nodo {
    let n = termino();
    while (esOp('+') || esOp('-')) {
      const op: Operador = esOp('+') ? '+' : '-';
      p++;
      n = { t: 'bin', op, a: n, b: termino() };
    }
    return n;
  }

  function termino(): Nodo {
    let n = unario();
    while (esOp('*') || esOp('div') || esOp('barra')) {
      const op: Operador = esOp('*') ? '*' : '/';
      p++;
      n = { t: 'bin', op, a: n, b: unario() };
    }
    return n;
  }

  function unario(): Nodo {
    if (esOp('-')) {
      p++;
      const x = unario();
      // «−3/4» escrito es un número negativo, no «menos (3/4)»: se pliega en el literal.
      if (x.t === 'num') {
        return { t: 'num', f: { num: -x.f.num, den: x.f.den }, ...(x.decimal ? { decimal: MENOS + x.decimal } : {}) };
      }
      return { t: 'neg', x };
    }
    if (esOp('+')) {
      p++;
      return unario();
    }
    return potenciaNodo();
  }

  function potenciaNodo(): Nodo {
    const base = primario();
    if (!esOp('^')) return base;
    if (base.t === 'num' && !base.decimal && base.f.den !== 1) {
      throw new ErrorSintaxis(
        `«${textoFraccion(base.f)}^…» es ambiguo. Escribe (${textoFraccion(base.f)})^… para elevar la fracción entera.`,
      );
    }
    p++;
    let signo = 1;
    if (esOp('-')) {
      signo = -1;
      p++;
    } else if (esOp('+')) {
      p++;
    }
    const t = ver();
    if (!t || t.k !== 'ent') throw new ErrorSintaxis('El exponente tiene que ser un número entero, como ^2 o ^-1.');
    p++;
    if (t.v > 64) throw new ErrorSintaxis('El exponente es demasiado grande: como mucho 64.');
    // «2^1/2» parece una raíz (2^(1/2)) y daría (2¹)/2 = 1 en silencio: se pide el paréntesis.
    const s1 = tokens[p];
    if (s1 && s1.k === 'op' && s1.v === 'barra' && tokens[p + 1]?.k === 'ent') {
      throw new ErrorSintaxis(
        'El exponente tiene que ser un número entero: esta calculadora no hace raíces. Si querías dividir la potencia, ponla entre paréntesis: (2^1)/2.',
      );
    }
    if (esOp('^')) throw new ErrorSintaxis('Dos potencias seguidas son ambiguas: usa paréntesis, como (2^3)^2.');
    return { t: 'pot', base, exp: signo * t.v };
  }

  function primario(): Nodo {
    const t = ver();
    if (!t) throw new ErrorSintaxis('La operación está incompleta: falta un número al final.');
    if (t.k === 'ent') {
      p++;
      // Entero / entero escrito = una fracción (liga más que cualquier operación).
      const s1 = tokens[p];
      const s2 = tokens[p + 1];
      if (s1 && s1.k === 'op' && s1.v === 'barra' && s2 && s2.k === 'ent') {
        p += 2;
        if (s2.v === 0) throw new ErrorSintaxis(`${t.texto}/0 no es una fracción: el denominador no puede ser 0.`);
        return { t: 'num', f: { num: t.v, den: s2.v } };
      }
      return { t: 'num', f: { num: t.v, den: 1 } };
    }
    if (t.k === 'dec') {
      p++;
      return { t: 'num', f: t.f, decimal: t.texto };
    }
    if (t.v === '(') {
      p++;
      if (esOp(')')) throw new ErrorSintaxis('Hay un paréntesis vacío.');
      const x = expr();
      if (!esOp(')')) throw new ErrorSintaxis('Falta cerrar un paréntesis.');
      p++;
      return { t: 'par', x };
    }
    if (t.v === ')') throw new ErrorSintaxis('Sobra un paréntesis de cierre, o falta el de apertura.');
    throw new ErrorSintaxis(`Falta un número antes de «${describir(t)}».`);
  }

  const raiz = expr();
  if (p < tokens.length) {
    const t = tokens[p];
    if (t.k === 'op' && t.v === ')') throw new ErrorSintaxis('Sobra un paréntesis de cierre, o falta el de apertura.');
    const previo = tokens[p - 1];
    throw new ErrorSintaxis(
      previo && previo.k !== 'op' && t.k !== 'op'
        ? `Falta un operador entre «${describir(previo)}» y «${describir(t)}». Para un número mixto escribe la suma: 1 + 1/2.`
        : `Falta un operador antes de «${describir(t)}».`,
    );
  }
  return raiz;
}

export type Analisis = { ok: true; arbol: Nodo } | { ok: false; error: string };

/** Texto → árbol. Sin lanzar. */
export function analizar(texto: string): Analisis {
  const limpio = texto.trim();
  if (!limpio) return { ok: false, error: 'Escribe una operación, por ejemplo 2/3 + 1/4.' };
  if (limpio.length > MAX_LONGITUD) {
    return { ok: false, error: `La operación es demasiado larga (más de ${MAX_LONGITUD} caracteres).` };
  }
  const tk = tokenizar(limpio);
  if (!tk.ok) return tk;
  try {
    return { ok: true, arbol: construirArbol(tk.tokens) };
  } catch (e) {
    if (e instanceof ErrorSintaxis) return { ok: false, error: e.mensaje };
    return { ok: false, error: 'No he podido leer la operación.' };
  }
}

type Posicion = 'inicio' | 'operando' | 'base';

/**
 * Imprime un nodo. Los paréntesis del original viajan como nodos `par`; aquí solo se añaden los
 * que exige un número negativo detrás de un signo o como base de una potencia.
 */
function textoNodo(n: Nodo, posicion: Posicion): string {
  switch (n.t) {
    case 'num': {
      const t = n.decimal ?? textoFraccion(n.f);
      const negativo = normalizar(n.f).num < 0;
      if (posicion === 'base' && (negativo || n.f.den !== 1 || n.decimal)) return `(${t})`;
      if (posicion === 'operando' && negativo) return `(${t})`;
      return t;
    }
    case 'par':
      return `(${textoNodo(n.x, 'inicio')})`;
    case 'neg':
      return posicion === 'inicio' ? `${MENOS}${textoNodo(n.x, 'base')}` : `(${MENOS}${textoNodo(n.x, 'base')})`;
    case 'pot':
      return `${textoNodo(n.base, 'base')}${superindice(n.exp)}`;
    case 'bin':
      return `${textoNodo(n.a, posicion)} ${SIMBOLO[n.op]} ${textoNodo(n.b, 'operando')}`;
  }
}

/** La expresión como se escribe en el cuaderno: «(3/4 − 1/2) ÷ 5/8». */
export function textoExpresion(n: Nodo): string {
  return textoNodo(n, 'inicio');
}

export interface PasoCalculo {
  /** Lo que se ha hecho en este paso, frase a frase. */
  explicacion: string[];
  /** La expresión completa tal como queda después del paso. */
  expresion: string;
}

export type ResultadoExpresion =
  | { ok: true; inicial: string; valor: Fraccion; pasos: PasoCalculo[] }
  | { ok: false; error: string };

/** Quita los paréntesis que ya solo encierran un número y pliega «−(número)». No es un paso. */
function limpiar(n: Nodo): Nodo {
  switch (n.t) {
    case 'num':
      return n;
    case 'par': {
      const x = limpiar(n.x);
      return x.t === 'num' ? x : { t: 'par', x };
    }
    case 'neg': {
      const x = limpiar(n.x);
      return x.t === 'num' ? { t: 'num', f: { num: -x.f.num, den: x.f.den } } : { t: 'neg', x };
    }
    case 'pot':
      return { t: 'pot', base: limpiar(n.base), exp: n.exp };
    case 'bin':
      return { t: 'bin', op: n.op, a: limpiar(n.a), b: limpiar(n.b) };
  }
}

function hayDecimales(n: Nodo): boolean {
  switch (n.t) {
    case 'num':
      return !!n.decimal;
    case 'par':
    case 'neg':
      return hayDecimales(n.x);
    case 'pot':
      return hayDecimales(n.base);
    case 'bin':
      return hayDecimales(n.a) || hayDecimales(n.b);
  }
}

/** Pasa a fracción irreducible cada decimal escrito y anota la conversión. */
function convertirDecimales(n: Nodo, notas: string[]): Nodo {
  switch (n.t) {
    case 'num': {
      if (!n.decimal) return n;
      const s = simplificar(n.f);
      const bruto = textoFraccion(n.f);
      const fin = textoFraccion(s);
      notas.push(bruto === fin ? `${n.decimal} = ${fin}` : `${n.decimal} = ${bruto} = ${fin}`);
      return { t: 'num', f: s };
    }
    case 'par':
      return { t: 'par', x: convertirDecimales(n.x, notas) };
    case 'neg':
      return { t: 'neg', x: convertirDecimales(n.x, notas) };
    case 'pot':
      return { t: 'pot', base: convertirDecimales(n.base, notas), exp: n.exp };
    case 'bin':
      return { t: 'bin', op: n.op, a: convertirDecimales(n.a, notas), b: convertirDecimales(n.b, notas) };
  }
}

type Reduccion =
  | { hecho: 'no' }
  | { hecho: 'si'; nodo: Nodo; explicacion: string[] }
  | { hecho: 'error'; error: string };

/**
 * Reduce UNA operación: la primera que tiene sus operandos ya resueltos, recorriendo el árbol de
 * izquierda a derecha y de dentro afuera. El árbol ya codifica la jerarquía (lo construyó el
 * analizador por precedencias), así que este orden ES el del cuaderno.
 */
function reducirUna(n: Nodo): Reduccion {
  switch (n.t) {
    case 'num':
      return { hecho: 'no' };
    case 'par': {
      const r = reducirUna(n.x);
      return r.hecho === 'si' ? { ...r, nodo: { t: 'par', x: r.nodo } } : r;
    }
    case 'neg': {
      const r = reducirUna(n.x);
      return r.hecho === 'si' ? { ...r, nodo: { t: 'neg', x: r.nodo } } : r;
    }
    case 'pot': {
      const r = reducirUna(n.base);
      if (r.hecho !== 'no') return r.hecho === 'si' ? { ...r, nodo: { t: 'pot', base: r.nodo, exp: n.exp } } : r;
      if (n.base.t !== 'num') return { hecho: 'no' };
      const p = potencia(n.base.f, n.exp);
      if (!p.ok) return { hecho: 'error', error: p.error };
      return { hecho: 'si', nodo: { t: 'num', f: p.valor }, explicacion: p.explicacion };
    }
    case 'bin': {
      const ra = reducirUna(n.a);
      if (ra.hecho !== 'no') return ra.hecho === 'si' ? { ...ra, nodo: { ...n, a: ra.nodo } } : ra;
      const rb = reducirUna(n.b);
      if (rb.hecho !== 'no') return rb.hecho === 'si' ? { ...rb, nodo: { ...n, b: rb.nodo } } : rb;
      if (n.a.t !== 'num' || n.b.t !== 'num') return { hecho: 'no' };
      const r = operar(n.a.f, n.op, n.b.f);
      if (!r.ok) return { hecho: 'error', error: r.error };
      return { hecho: 'si', nodo: { t: 'num', f: r.valor }, explicacion: r.explicacion };
    }
  }
}

/** Tope de pasos: una expresión de 200 caracteres no llega ni a la mitad. */
const MAX_PASOS = 120;

/**
 * Resuelve una operación combinada paso a paso. El resultado final es SIEMPRE irreducible; si la
 * entrada era una fracción sola sin simplificar (84/126), el único paso es simplificarla.
 */
export function evaluarExpresion(texto: string): ResultadoExpresion {
  const a = analizar(texto);
  if (!a.ok) return a;
  const inicial = textoExpresion(a.arbol);
  const pasos: PasoCalculo[] = [];
  let arbol = a.arbol;

  if (hayDecimales(arbol)) {
    const notas: string[] = [];
    arbol = limpiar(convertirDecimales(arbol, notas));
    pasos.push({ explicacion: [`Pasamos los decimales a fracción: ${notas.join('; ')}.`], expresion: textoExpresion(arbol) });
  } else {
    arbol = limpiar(arbol);
  }

  for (let i = 0; i < MAX_PASOS; i++) {
    const r = reducirUna(arbol);
    if (r.hecho === 'error') return { ok: false, error: r.error };
    if (r.hecho === 'no') break;
    arbol = limpiar(r.nodo);
    pasos.push({ explicacion: r.explicacion, expresion: textoExpresion(arbol) });
  }

  if (arbol.t !== 'num') return { ok: false, error: 'La operación es demasiado larga para resolverla paso a paso.' };
  let valor = normalizar(arbol.f);
  if (!esIrreducible(valor)) {
    const s = explicarSimplificacion(valor);
    valor = s.resultado;
    pasos.push({ explicacion: s.lineas, expresion: textoFraccion(valor) });
  }
  return { ok: true, inicial, valor, pasos };
}

/* ─────────────────────────── Leer UNA fracción escrita ─────────────────────────── */

export type FormaEscrita = 'fraccion' | 'entero' | 'mixto' | 'decimal';

export type Lectura = { ok: true; forma: FormaEscrita; valor: Fraccion } | { ok: false };

const RE_FRACCION = /^([+-]?)(\d+)\/([+-]?)(\d+)$/;
const RE_MIXTO = /^([+-]?)(\d+) (\d+)\/(\d+)$/;
const RE_ENTERO = /^([+-]?)(\d+)$/;
const RE_DECIMAL = /^([+-]?)(\d*)[.,](\d+)$/;

/**
 * Lee una sola cantidad escrita por el alumno o en un campo: «7/12», «−7/12», «4», «1 3/4»,
 * «0,75». NO simplifica: si escribe 6/8, devuelve 6/8 (el corrector necesita saberlo).
 */
export function leerFraccion(texto: string): Lectura {
  const t = texto
    .trim()
    .replace(/[−–—]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\s*\/\s*/g, '/');
  if (!t) return { ok: false };
  let m = t.match(RE_FRACCION);
  if (m) {
    const num = Number(m[2]);
    const den = Number(m[4]);
    if (!seguros(num, den) || den === 0) return { ok: false };
    const negativo = (m[1] === '-') !== (m[3] === '-');
    return { ok: true, forma: 'fraccion', valor: { num: negativo ? -num : num, den } };
  }
  m = t.match(RE_MIXTO);
  if (m) {
    const entero = Number(m[2]);
    const num = Number(m[3]);
    const den = Number(m[4]);
    if (!seguros(entero, num, den) || den === 0) return { ok: false };
    const total = entero * den + num;
    if (!Number.isSafeInteger(total)) return { ok: false };
    return { ok: true, forma: 'mixto', valor: { num: m[1] === '-' ? -total : total, den } };
  }
  m = t.match(RE_ENTERO);
  if (m) {
    const n = Number(m[2]);
    if (!Number.isSafeInteger(n)) return { ok: false };
    return { ok: true, forma: 'entero', valor: { num: m[1] === '-' ? -n : n, den: 1 } };
  }
  m = t.match(RE_DECIMAL);
  if (m) {
    const num = Number((m[2] || '0') + m[3]);
    const den = Math.pow(10, m[3].length);
    if (!seguros(num, den)) return { ok: false };
    return { ok: true, forma: 'decimal', valor: { num: m[1] === '-' ? -num : num, den } };
  }
  return { ok: false };
}

/* ─────────────────────────── Equivalentes y comparar ─────────────────────────── */

/** Las `cuantas` primeras amplificaciones de la irreducible: 2/3 → 4/6, 6/9, 8/12… */
export function equivalentes(f: Fraccion, cuantas = 6): Fraccion[] {
  const s = simplificar(f);
  const r: Fraccion[] = [];
  if (s.num === 0) return r;
  for (let k = 2; k <= cuantas + 1; k++) {
    const g = { num: s.num * k, den: s.den * k };
    if (!seguros(g.num, g.den)) break;
    r.push(g);
  }
  return r;
}

export interface Comparacion {
  /** −1 si a < b, 0 si son equivalentes, 1 si a > b. */
  signo: number;
  lineas: string[];
}

/** Compara dos fracciones por denominador común (y lo explica). */
export function comparar(a: Fraccion, b: Fraccion): Comparacion {
  const x = normalizar(a);
  const y = normalizar(b);
  const signo = compararValor(x, y);
  const lineas: string[] = [];
  const m = mcm(x.den, y.den);
  const simbolo = signo === 0 ? '=' : signo > 0 ? '>' : '<';
  const xa = { num: x.num * (m / x.den), den: m };
  const ya = { num: y.num * (m / y.den), den: m };
  if (Number.isFinite(m) && seguros(xa.num, ya.num)) {
    if (x.den === y.den) {
      lineas.push(`Tienen el mismo denominador: basta comparar los numeradores, ${textoEntero(x.num)} y ${textoEntero(y.num)}.`);
    } else {
      lineas.push(
        `Denominador común: m.c.m.(${textoEntero(x.den)}, ${textoEntero(y.den)}) = ${textoEntero(m)}. ${textoFraccion(x)} = ${textoFraccion(xa)} y ${textoFraccion(y)} = ${textoFraccion(ya)}.`,
      );
      lineas.push(`Se comparan los numeradores: ${textoEntero(xa.num)} ${simbolo} ${textoEntero(ya.num)}.`);
    }
  } else {
    lineas.push('Por producto cruzado: se compara el numerador de cada una por el denominador de la otra.');
  }
  lineas.push(
    signo === 0
      ? `${textoFraccion(x)} y ${textoFraccion(y)} son equivalentes: representan la misma cantidad.`
      : `${textoFraccion(x)} ${simbolo} ${textoFraccion(y)}.`,
  );
  return { signo, lineas };
}
