/**
 * Motor de la ecuación general — `visualizador-geometria-analitica` (26/10/2026, semilla S0228).
 *
 * El visualizador iba en un solo sentido: de los parámetros (a, b, h, k) al dibujo. El ejercicio
 * de clase va al revés: te dan Ax² + Cy² + Dx + Ey + F = 0 y hay que completar cuadrados, decir
 * qué cónica es y sacar centro, vértices, focos y excentricidad. Eso es lo que hace
 * `analizarConica`, y de aquí salen a la vez el modo «Desde la ecuación general» de la página y
 * las respuestas de los casos para clase (`casos.ts`): una sola implementación.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la matemática está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras, y nada lanza: una entrada imposible devuelve `{ ok: false, error }`.
 *
 * ── ALCANCE ───────────────────────────────────────────────────────────────────
 *
 * Sin término en xy (B = 0): cónicas de ejes paralelos a los de coordenadas, que es lo que se
 * pide en secundaria y preparatoria. Con un xy hay que girar los ejes, y eso ya es otro tema.
 *
 * ── LOS CONVENIOS QUE NO SE PREGUNTAN ────────────────────────────────────────
 *
 * · La parábola: hay libros que escriben (x − h)² = 4p(y − k), con p la distancia del vértice al
 *   foco (es el de esta app), y otros y² = 2px, con p la distancia del foco a la directriz. Por eso
 *   aquí p es SIEMPRE la distancia con signo del vértice al foco, y los casos nunca piden «p»: piden
 *   el foco, la directriz o la distancia del vértice al foco, que son lo mismo con cualquier libro.
 * · La elipse: unos libros llaman a al semieje que va bajo la x y otros al mayor. Aquí a es el
 *   MAYOR (el de la app), y los casos piden focos, distancias y excentricidad, que no dependen del
 *   nombre.
 */

import { formatNumber } from '@/lib';

/* ─────────────────────────── Tipos ─────────────────────────── */

export interface Coeficientes {
  /** Coeficiente de x² */
  A: number;
  /** Coeficiente de y² */
  C: number;
  /** Coeficiente de x */
  D: number;
  /** Coeficiente de y */
  E: number;
  /** Término independiente */
  F: number;
}

export type TipoConica = 'circunferencia' | 'elipse' | 'parabola' | 'hiperbola';
export type TipoDegenerado = 'punto' | 'vacia' | 'rectas-secantes' | 'rectas-paralelas' | 'recta-doble';
export type Tipo = TipoConica | TipoDegenerado;

export interface Punto {
  x: number;
  y: number;
}

/** Una recta vertical (x = valor) u horizontal (y = valor). */
export interface RectaEje {
  eje: 'x' | 'y';
  valor: number;
}

/**
 * El análisis completo. Interfaz plana, no unión discriminada (types/CLAUDE.md): lo que no
 * aplica a la cónica va en NaN, null o lista vacía, y quien pinta mira `tipo` antes de leer.
 */
export interface Analisis {
  ok: boolean;
  /** '' si ok. */
  error: string;
  tipo: Tipo | null;
  /** El nombre para pintar: «Elipse», «Ninguna curva: no hay puntos reales»… */
  nombre: string;
  pasos: string[];
  /** La ecuación reducida, o '' si no la hay. */
  reducida: string;
  /**
   * Con x² e y²: lo que queda al otro lado del igual al completar cuadrados, ya dividido entre
   * el coeficiente de x² cuando los dos coeficientes son iguales (es el r² de una circunferencia,
   * que puede salir negativo o cero). NaN si A ≠ C.
   */
  rCuadrado: number;
  centro: Punto | null;
  vertice: Punto | null;
  radio: number;
  /** Semieje mayor (elipse) o real (hipérbola). */
  a: number;
  /** Semieje menor (elipse) o imaginario (hipérbola). */
  b: number;
  /** Distancia del centro a cada foco. */
  c: number;
  /** Dirección del eje focal (o del eje de la parábola). */
  eje: 'horizontal' | 'vertical' | null;
  focos: Punto[];
  vertices: Punto[];
  excentricidad: number;
  /** Parábola: distancia CON SIGNO del vértice al foco (positiva si abre hacia +x o +y). */
  p: number;
  directriz: RectaEje | null;
  /** Hipérbola: la pendiente positiva de las asíntotas. */
  pendienteAsintota: number;
  /** Rectas de una cónica degenerada: secantes (pendientes por el centro) o paralelas (x = …). */
  rectas: { pendientes: number[]; paralelas: RectaEje[] };
}

/* ─────────────────────────── Formato ─────────────────────────── */

/** Por debajo de esto un coeficiente o un segundo miembro cuenta como cero (ruido binario). */
const CERO = 1e-9;
const esCero = (v: number): boolean => Math.abs(v) < CERO;

/**
 * Cifra en formato español con los decimales que de verdad tiene, hasta 4, y con el signo menos
 * tipográfico (−), el de las fórmulas. «2», «−3», «2,2361», «0,6».
 */
export function cifra(n: number, maxDecimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  let d = 0;
  while (d < maxDecimales && Math.abs(Number(n.toFixed(d)) - n) > 1e-9 * Math.max(1, Math.abs(n))) d += 1;
  const texto = formatNumber(Math.abs(n) < 0.5 * 10 ** -d ? 0 : n, d);
  return texto.replace(/^-/, '−');
}

/** «4x²», «− 16x», «+ 9y²», «x²», «− y»: un término con su signo delante (salvo el primero). */
function termino(coef: number, literal: string, primero: boolean): string {
  const abs = Math.abs(coef);
  const cuerpo = literal ? `${esCero(abs - 1) ? '' : cifra(abs)}${literal}` : cifra(abs);
  if (primero) return coef < 0 ? `−${cuerpo}` : cuerpo;
  return `${coef < 0 ? '−' : '+'} ${cuerpo}`;
}

/** Une términos no nulos: «4x² + 9y² − 16x». Si todos son cero, «0». */
function polinomio(partes: readonly [number, string][]): string {
  const vivos = partes.filter(([c]) => !esCero(c));
  if (vivos.length === 0) return '0';
  return vivos.map(([c, l], i) => termino(c, l, i === 0)).join(' ');
}

/** La ecuación general tal como la escribiría un libro: «4x² + 9y² − 16x + 18y − 11 = 0». */
export function escribirGeneral(co: Coeficientes): string {
  return `${polinomio([[co.A, 'x²'], [co.C, 'y²'], [co.D, 'x'], [co.E, 'y'], [co.F, '']])} = 0`;
}

/** «(x − 2)», «(y + 1)», «x»: la variable desplazada por su centro. */
function desplazada(variable: 'x' | 'y', centro: number): string {
  if (esCero(centro)) return variable;
  return `(${variable} ${centro > 0 ? '−' : '+'} ${cifra(Math.abs(centro))})`;
}

/** «(x − 2)²», «x²». */
function cuadrado(variable: 'x' | 'y', centro: number): string {
  return `${desplazada(variable, centro)}²`;
}

/** «4(x − 2)²», «(x − 2)²», «−(y + 2)²». */
function cuadradoCon(coef: number, variable: 'x' | 'y', centro: number): string {
  const c = cuadrado(variable, centro);
  if (esCero(coef - 1)) return c;
  if (esCero(coef + 1)) return `−${c}`;
  return `${coef < 0 ? '−' : ''}${cifra(Math.abs(coef))}${c}`;
}

/** «(2, −1)». */
function punto(p: Punto): string {
  return `(${cifra(p.x)}, ${cifra(p.y)})`;
}

/** «√9 = 3» o «√5 ≈ 2,2361». */
function raiz(v: number): string {
  const s = Math.sqrt(v);
  const exacta = Math.abs(Number(s.toFixed(4)) ** 2 - v) < 1e-9 * Math.max(1, v);
  return `√${cifra(v)} ${exacta ? '=' : '≈'} ${cifra(s)}`;
}

/* ─────────────────────────── Análisis ─────────────────────────── */

function vacio(): Analisis {
  return {
    ok: true,
    error: '',
    tipo: null,
    nombre: '',
    pasos: [],
    reducida: '',
    rCuadrado: NaN,
    centro: null,
    vertice: null,
    radio: NaN,
    a: NaN,
    b: NaN,
    c: NaN,
    eje: null,
    focos: [],
    vertices: [],
    excentricidad: NaN,
    p: NaN,
    directriz: null,
    pendienteAsintota: NaN,
    rectas: { pendientes: [], paralelas: [] },
  };
}

function fallo(error: string, pasos: string[] = []): Analisis {
  return { ...vacio(), ok: false, error, pasos };
}

/**
 * Lleva la ecuación general a su forma reducida completando cuadrados, la clasifica y saca sus
 * elementos. Es lo que pinta el modo «Desde la ecuación general» y de donde salen las respuestas
 * de los casos para clase.
 */
export function analizarConica(co: Coeficientes): Analisis {
  const { A, C, D, E, F } = co;
  if (![A, C, D, E, F].every(Number.isFinite)) return fallo('Algún coeficiente no es un número.');
  if (esCero(A) && esCero(C)) {
    return fallo('Sin x² ni y² no es una cónica: lo que queda es la ecuación de una recta (o de nada).');
  }
  const pasos = [`Partimos de ${escribirGeneral(co)}.`];
  if (esCero(A) || esCero(C)) return parabola(co, pasos);
  return conDosCuadrados(co, pasos);
}

/** El paso de completar el cuadrado de una variable: «x² − 4x = (x − 2)² − 4». */
function completar(variable: 'x' | 'y', lineal: number): string {
  const mitad = lineal / 2;
  const centro = -mitad;
  return `${polinomio([[1, `${variable}²`], [lineal, variable]])} = ${cuadrado(variable, centro)} − ${cifra(mitad * mitad)}`;
}

/** Circunferencia, elipse, hipérbola y sus degeneradas: x² e y² con coeficiente no nulo. */
function conDosCuadrados(co: Coeficientes, pasos: string[]): Analisis {
  const { A, C, D, E, F } = co;
  const h = -D / (2 * A);
  const k = -E / (2 * C);
  // A(x − h)² + C(y − k)² = R
  const R = A * h * h + C * k * k - F;
  const r: Analisis = { ...vacio(), pasos };

  // 1 · Agrupar
  const grupoX = esCero(D) ? termino(A, 'x²', true) : `(${polinomio([[A, 'x²'], [D, 'x']])})`;
  const grupoY = esCero(E) ? termino(C, 'y²', true) : `(${polinomio([[C, 'y²'], [E, 'y']])})`;
  const unirY = grupoY.startsWith('−') ? `− ${grupoY.slice(1)}` : `+ ${grupoY}`;
  const sinLineales = esCero(D) && esCero(E);
  pasos.push(
    sinLineales
      ? `No hay términos en x ni en y, así que no hace falta completar cuadrados. Pasa el número suelto al otro lado: ${grupoX} ${unirY} = ${cifra(-F)}.`
      : `Agrupa los términos de cada variable y pasa el número suelto al otro lado: ${grupoX} ${unirY} = ${cifra(-F)}.`,
  );

  // 2 · Sacar factor común (solo si hay término lineal y el coeficiente no es 1)
  const factorX = !esCero(D) && !esCero(A - 1);
  const factorY = !esCero(E) && !esCero(C - 1);
  if (factorX || factorY) {
    const fx = esCero(D) ? termino(A, 'x²', true) : `${cuadradoCoef(A)}(${polinomio([[1, 'x²'], [D / A, 'x']])})`;
    const fyCuerpo = esCero(E) ? termino(C, 'y²', true) : `${cuadradoCoef(C)}(${polinomio([[1, 'y²'], [E / C, 'y']])})`;
    const fy = fyCuerpo.startsWith('−') ? `− ${fyCuerpo.slice(1)}` : `+ ${fyCuerpo}`;
    pasos.push(`Saca factor común el coeficiente de cada cuadrado: ${fx} ${fy} = ${cifra(-F)}.`);
  }

  // 3 · Completar cuadrados
  const completados: string[] = [];
  if (!esCero(D)) completados.push(completar('x', D / A));
  if (!esCero(E)) completados.push(completar('y', E / C));
  if (completados.length > 0) {
    pasos.push(`Completa cuadrados (suma y resta el cuadrado de la mitad del coeficiente de la variable): ${completados.join('; ')}.`);
  }

  // 4 · Sustituir y pasar los números al otro lado
  const izquierda = `${cuadradoCon(A, 'x', h)} ${C < 0 ? '−' : '+'} ${cuadradoCon(Math.abs(C), 'y', k)}`;
  const sumandos = [cifra(-F)];
  if (!esCero(h)) sumandos.push(sumando(A * h * h));
  if (!esCero(k)) sumandos.push(sumando(C * k * k));
  if (sumandos.length > 1) {
    pasos.push(`Sustituye y deja solo los cuadrados a la izquierda: ${izquierda} = ${sumandos.join(' ')} = ${cifra(R)}.`);
  } else if (!sinLineales) {
    pasos.push(`Los cuadrados ya están completos: ${izquierda} = ${cifra(R)}.`);
  }

  const centro = { x: h, y: k };
  if (esCero(A - C)) r.rCuadrado = R / A;

  if (A * C > 0) {
    // Mismo signo: circunferencia o elipse (o un punto, o nada).
    const rx = R / A;
    const ry = R / C;
    if (esCero(R)) {
      pasos.push(`Una suma de dos cuadrados (con coeficientes del mismo signo) solo vale 0 si los dos valen 0: el único punto es ${punto(centro)}. Es una cónica degenerada.`);
      return { ...r, tipo: 'punto', nombre: 'Un solo punto (cónica degenerada)', centro, reducida: `${izquierda} = 0` };
    }
    if (rx < 0) {
      const dividida = esCero(A - 1) ? '' : `Divide entre ${cifra(A)}: ${cuadrado('x', h)} + ${cuadrado('y', k)} = ${cifra(rx)}. `;
      pasos.push(
        esCero(A - C)
          ? `${dividida}Una suma de cuadrados no puede dar un número negativo: ningún punto cumple la ecuación, no hay circunferencia real.`
          : `Los dos cuadrados tienen el mismo signo y el otro miembro el contrario: ningún punto real cumple la ecuación.`,
      );
      return { ...r, tipo: 'vacia', nombre: 'Ninguna curva: no hay puntos reales', centro };
    }
    if (esCero(A - C)) {
      const radio = Math.sqrt(rx);
      const reducida = `${cuadrado('x', h)} + ${cuadrado('y', k)} = ${cifra(rx)}`;
      if (!esCero(A - 1)) pasos.push(`Divide entre ${cifra(A)}: ${reducida}.`);
      pasos.push(`Es una circunferencia (x² e y² con el mismo coeficiente). Centro ${punto(centro)} y radio r = ${raiz(rx)}.`);
      return {
        ...r, tipo: 'circunferencia', nombre: 'Circunferencia', reducida, centro, radio, excentricidad: 0,
      };
    }
    const horizontal = rx > ry;
    const a2 = horizontal ? rx : ry;
    const b2 = horizontal ? ry : rx;
    const a = Math.sqrt(a2);
    const b = Math.sqrt(b2);
    const c = Math.sqrt(a2 - b2);
    const reducida = `${cuadrado('x', h)}/${cifra(rx)} + ${cuadrado('y', k)}/${cifra(ry)} = 1`;
    pasos.push(`Divide entre ${cifra(R)}: ${reducida}.`);
    pasos.push(
      `Es una elipse (x² e y² con el mismo signo y distinto coeficiente). El denominador mayor, ${cifra(a2)}, está bajo la ${horizontal ? 'x' : 'y'}: el eje mayor es ${horizontal ? 'horizontal' : 'vertical'}, a = ${raiz(a2)} y b = ${raiz(b2)}.`,
    );
    pasos.push(`En la elipse c² = a² − b²: c = √(${cifra(a2)} − ${cifra(b2)}) = ${raiz(a2 - b2)}.`);
    const focos = horizontal ? [{ x: h + c, y: k }, { x: h - c, y: k }] : [{ x: h, y: k + c }, { x: h, y: k - c }];
    const vertices = horizontal ? [{ x: h + a, y: k }, { x: h - a, y: k }] : [{ x: h, y: k + a }, { x: h, y: k - a }];
    pasos.push(
      `Centro ${punto(centro)}. Los focos están sobre el eje mayor a c = ${cifra(c)} del centro, y los vértices a a = ${cifra(a)}: focos ${punto(focos[0])} y ${punto(focos[1])}; vértices ${punto(vertices[0])} y ${punto(vertices[1])}.`,
    );
    const e = c / a;
    pasos.push(`Excentricidad e = c/a = ${cifra(c)} ÷ ${cifra(a)} = ${cifra(e)}.`);
    return {
      ...r, tipo: 'elipse', nombre: 'Elipse', reducida, centro, a, b, c,
      eje: horizontal ? 'horizontal' : 'vertical', focos, vertices, excentricidad: e,
    };
  }

  // Signos distintos: hipérbola (o dos rectas que se cortan).
  if (esCero(R)) {
    const m = Math.sqrt(-A / C);
    pasos.push(
      `Una diferencia de cuadrados igual a 0 se factoriza en dos rectas que se cortan en ${punto(centro)}: y − ${cifra(k)} = ± ${cifra(m)}·(x − ${cifra(h)}). Es una cónica degenerada.`,
    );
    return {
      ...r, tipo: 'rectas-secantes', nombre: 'Dos rectas que se cortan (cónica degenerada)', centro,
      rectas: { pendientes: [m, -m], paralelas: [] },
    };
  }
  const rx = R / A;
  const ry = R / C;
  const horizontal = rx > 0;
  const a2 = horizontal ? rx : ry;
  const b2 = horizontal ? -ry : -rx;
  const a = Math.sqrt(a2);
  const b = Math.sqrt(b2);
  const c = Math.sqrt(a2 + b2);
  const reducida = horizontal
    ? `${cuadrado('x', h)}/${cifra(a2)} − ${cuadrado('y', k)}/${cifra(b2)} = 1`
    : `${cuadrado('y', k)}/${cifra(a2)} − ${cuadrado('x', h)}/${cifra(b2)} = 1`;
  pasos.push(`Divide entre ${cifra(R)} y escribe primero el término positivo: ${reducida}.`);
  pasos.push(
    `Es una hipérbola (x² e y² con signos distintos). El término positivo es el de la ${horizontal ? 'x' : 'y'}: el eje real es ${horizontal ? 'horizontal' : 'vertical'}, a = ${raiz(a2)} y b = ${raiz(b2)}.`,
  );
  pasos.push(`En la hipérbola c² = a² + b²: c = √(${cifra(a2)} + ${cifra(b2)}) = ${raiz(a2 + b2)}.`);
  const focos = horizontal ? [{ x: h + c, y: k }, { x: h - c, y: k }] : [{ x: h, y: k + c }, { x: h, y: k - c }];
  const vertices = horizontal ? [{ x: h + a, y: k }, { x: h - a, y: k }] : [{ x: h, y: k + a }, { x: h, y: k - a }];
  pasos.push(`Centro ${punto(centro)}; focos ${punto(focos[0])} y ${punto(focos[1])}; vértices ${punto(vertices[0])} y ${punto(vertices[1])}.`);
  const pendiente = horizontal ? b / a : a / b;
  pasos.push(
    `Asíntotas: ${desplazada('y', k)} = ± ${horizontal ? 'b/a' : 'a/b'} · ${desplazada('x', h)}, con pendiente ± ${cifra(horizontal ? b : a)} ÷ ${cifra(horizontal ? a : b)} = ± ${cifra(pendiente)}.`,
  );
  const e = c / a;
  pasos.push(`Excentricidad e = c/a = ${cifra(c)} ÷ ${cifra(a)} = ${cifra(e)}.`);
  return {
    ...r, tipo: 'hiperbola', nombre: 'Hipérbola', reducida, centro, a, b, c,
    eje: horizontal ? 'horizontal' : 'vertical', focos, vertices, excentricidad: e, pendienteAsintota: pendiente,
  };
}

/** «4» delante de un paréntesis, «−» si es −1, nada si es 1. */
function cuadradoCoef(coef: number): string {
  if (esCero(coef - 1)) return '';
  if (esCero(coef + 1)) return '−';
  return `${coef < 0 ? '−' : ''}${cifra(Math.abs(coef))}`;
}

/** «+ 16», «− 9»: un sumando que se pasa al otro lado. */
function sumando(v: number): string {
  return `${v < 0 ? '−' : '+'} ${cifra(Math.abs(v))}`;
}

/**
 * La parábola: solo una de las dos variables va al cuadrado. Se resuelve con la variable al
 * cuadrado llamada u y la otra w, y al final se devuelven las coordenadas a su sitio.
 */
function parabola(co: Coeficientes, pasos: string[]): Analisis {
  const vertical = !esCero(co.A); // x² → eje vertical
  const u: 'x' | 'y' = vertical ? 'x' : 'y';
  const w: 'x' | 'y' = vertical ? 'y' : 'x';
  const cu = vertical ? co.A : co.C; // coeficiente del cuadrado
  const lu = vertical ? co.D : co.E; // lineal en u
  const lw = vertical ? co.E : co.D; // lineal en w
  const F = co.F;
  const r: Analisis = { ...vacio(), pasos };

  const centroU = -lu / (2 * cu);
  if (esCero(lw)) {
    // cu·u² + lu·u + F = 0: no depende de w, son rectas paralelas al eje (o nada).
    const delta = lu * lu - 4 * cu * F;
    pasos.push(`Solo aparece la ${u} y no la ${w}: ${polinomio([[cu, `${u}²`], [lu, u], [F, '']])} = 0 es una ecuación de segundo grado en ${u}, con discriminante Δ = ${cifra(delta)}.`);
    if (esCero(delta)) {
      pasos.push(`Δ = 0: una sola solución, ${u} = ${cifra(centroU)}. Es una recta contada dos veces (cónica degenerada).`);
      return { ...r, tipo: 'recta-doble', nombre: 'Una recta doble (cónica degenerada)', rectas: { pendientes: [], paralelas: [{ eje: u, valor: centroU }] } };
    }
    if (delta < 0) {
      pasos.push('Δ < 0: ninguna solución real. Ningún punto cumple la ecuación.');
      return { ...r, tipo: 'vacia', nombre: 'Ninguna curva: no hay puntos reales' };
    }
    const s = Math.sqrt(delta) / (2 * Math.abs(cu));
    const valores = [centroU - s, centroU + s];
    pasos.push(`Δ > 0: dos soluciones, ${u} = ${cifra(valores[0])} y ${u} = ${cifra(valores[1])}. Son dos rectas paralelas (cónica degenerada).`);
    return {
      ...r, tipo: 'rectas-paralelas', nombre: 'Dos rectas paralelas (cónica degenerada)',
      rectas: { pendientes: [], paralelas: valores.map((valor) => ({ eje: u, valor })) },
    };
  }

  pasos.push(`Solo aparece ${u}² (no ${w}²): es una parábola de eje ${vertical ? 'vertical' : 'horizontal'}.`);
  // cu·u² + lu·u = −lw·w − F
  pasos.push(`Deja a la izquierda los términos de la ${u}: ${polinomio([[cu, `${u}²`], [lu, u]])} = ${polinomio([[-lw, w], [-F, '']])}.`);
  const d = lu / cu; // lineal en u tras dividir
  const m = -lw / cu; // coeficiente de w tras dividir (= 4p)
  const n = -F / cu;
  if (!esCero(cu - 1)) {
    pasos.push(`Divide entre ${cifra(cu)}: ${polinomio([[1, `${u}²`], [d, u]])} = ${polinomio([[m, w], [n, '']])}.`);
  }
  // (u − centroU)² = m·w + n + centroU²
  const independiente = n + centroU * centroU;
  if (!esCero(d)) {
    pasos.push(`Completa el cuadrado: ${completar(u, d)}, así que ${cuadrado(u, centroU)} = ${polinomio([[m, w], [independiente, '']])}.`);
  }
  // = m(w − centroW), con centroW = −independiente / m
  const centroW = -independiente / m;
  const p = m / 4;
  const reducida = `${cuadrado(u, centroU)} = ${cifra(m)}${esCero(centroW) ? w : desplazada(w, centroW)}`;
  if (!esCero(centroW)) pasos.push(`Saca factor común ${cifra(m)}: ${reducida}.`);

  const vertice = vertical ? { x: centroU, y: centroW } : { x: centroW, y: centroU };
  const foco = vertical ? { x: centroU, y: centroW + p } : { x: centroW + p, y: centroU };
  const directriz: RectaEje = { eje: w, valor: centroW - p };
  const hacia = vertical ? (p > 0 ? 'hacia arriba' : 'hacia abajo') : p > 0 ? 'hacia la derecha' : 'hacia la izquierda';
  pasos.push(
    `Comparando con (${u} − ${vertical ? 'h' : 'k'})² = 4p(${w} − ${vertical ? 'k' : 'h'}): 4p = ${cifra(m)}, así que p = ${cifra(m)} ÷ 4 = ${cifra(p)}. La distancia del vértice al foco es |p| = ${cifra(Math.abs(p))}.`,
  );
  pasos.push(
    `Vértice ${punto(vertice)}; como p ${p > 0 ? '> 0' : '< 0'}, abre ${hacia}. Foco: ${w} = ${cifra(centroW)} ${p > 0 ? '+' : '−'} ${cifra(Math.abs(p))} → ${punto(foco)}. Directriz, al otro lado del vértice: ${w} = ${cifra(centroW)} ${p > 0 ? '−' : '+'} ${cifra(Math.abs(p))} = ${cifra(directriz.valor)}.`,
  );
  return {
    ...r, tipo: 'parabola', nombre: 'Parábola', reducida, vertice, eje: vertical ? 'vertical' : 'horizontal',
    focos: [foco], vertices: [vertice], excentricidad: 1, p, directriz,
  };
}

/* ─────────────────────────── Expansión (para el modo práctica) ─────────────────────────── */

/**
 * La ecuación general de una cónica dada por sus elementos, multiplicada por `m` para que no
 * siempre empiece por x² a secas. Es la cuenta inversa de `analizarConica`: el test exige que
 * analizar lo expandido devuelva los mismos elementos.
 */
export function expandir(
  forma:
    | { tipo: 'circunferencia'; h: number; k: number; r: number }
    | { tipo: 'elipse' | 'hiperbola'; h: number; k: number; a: number; b: number; eje: 'horizontal' | 'vertical' }
    | { tipo: 'parabola'; h: number; k: number; p: number; eje: 'horizontal' | 'vertical' },
  m = 1,
): Coeficientes {
  const { h, k } = forma;
  switch (forma.tipo) {
    case 'circunferencia':
      // (x − h)² + (y − k)² = r²
      return { A: m, C: m, D: -2 * h * m, E: -2 * k * m, F: (h * h + k * k - forma.r * forma.r) * m };
    case 'elipse':
    case 'hiperbola': {
      const a2 = forma.a * forma.a;
      const b2 = forma.b * forma.b;
      // Se multiplica la reducida por a²b²:
      //   elipse horizontal     (x−h)²/a² + (y−k)²/b² = 1  →  b²(x−h)² + a²(y−k)² = a²b²
      //   elipse vertical       (x−h)²/b² + (y−k)²/a² = 1  →  a²(x−h)² + b²(y−k)² = a²b²
      //   hipérbola horizontal  (x−h)²/a² − (y−k)²/b² = 1  →  b²(x−h)² − a²(y−k)² = a²b²
      //   hipérbola vertical    (y−k)²/a² − (x−h)²/b² = 1  →  −a²(x−h)² + b²(y−k)² = a²b²
      const horizontal = forma.eje === 'horizontal';
      const [cx, cy] =
        forma.tipo === 'elipse'
          ? horizontal ? [b2, a2] : [a2, b2]
          : horizontal ? [b2, -a2] : [-a2, b2];
      return {
        A: cx * m,
        C: cy * m,
        D: -2 * h * cx * m,
        E: -2 * k * cy * m,
        F: (cx * h * h + cy * k * k - a2 * b2) * m,
      };
    }
    case 'parabola':
      if (forma.eje === 'vertical') {
        // (x − h)² = 4p(y − k)  →  x² − 2hx − 4py + h² + 4pk = 0
        return { A: m, C: 0, D: -2 * h * m, E: -4 * forma.p * m, F: (h * h + 4 * forma.p * k) * m };
      }
      // (y − k)² = 4p(x − h)  →  y² − 2ky − 4px + k² + 4ph = 0
      return { A: 0, C: m, D: -4 * forma.p * m, E: -2 * k * m, F: (k * k + 4 * forma.p * h) * m };
  }
}
