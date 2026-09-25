/**
 * Motor de las cuatro calculadoras de la vista (Funciones, Triángulo, Conversiones e
 * Identidades). Funciones puras, sin React ni DOM: se prueban con casos resueltos a mano en
 * `tests/apps/calculadora-trigonometria.spec.ts`.
 *
 * ── De dónde sale (Inspector, 25/09/2026, hallazgos 1778-1788) ──
 * Hasta entonces la vista hacía sus propias cuentas con `Math.sin` sobre el ángulo en
 * radianes, y tres cosas fallaban en los bordes sin que nada se quejara:
 *
 * 1. π/2 no es representable en binario: `Math.cos(Math.PI / 2)` vale 6,1·10⁻¹⁷, no 0, así
 *    que tan 90° salía «16.331.239.353.195.370» y sen 180° salía «≈0». Aquí los ángulos
 *    CUADRANTALES (múltiplos de 90°) se reconocen en GRADOS, que sí son exactos, y sus
 *    razones se devuelven exactas (0, ±1) o como no definidas.
 * 2. En radianes, los botones de ángulos notables escribían 1,5708, que no es π/2. Ahora
 *    escriben «π/2» y `leerAngulo` entiende múltiplos de π, así que el ángulo llega exacto.
 * 3. El cuadrante se calculaba sobre el número tecleado aunque estuviera en radianes, y los
 *    ejes se asignaban a un cuadrante. Aquí se calcula siempre en grados y un ángulo sobre un
 *    eje no pertenece a ninguno.
 *
 * Tolerancia de «está sobre un eje»: 1e-9 grados, la misma que usa `tangente()` de casos.ts.
 */

import { parseSpanishNumber } from '@/lib';
import { formatearFlexible } from './casos';

// ============================================================
// TIPOS
// ============================================================

export type UnidadEntrada = 'grados' | 'radianes' | 'gradianes';

/** Un ángulo leído, en las tres unidades y con su cociente exacto respecto a π. */
export interface Angulo {
  grados: number;
  radianes: number;
  /** θ / π, calculado desde la unidad de origen para no arrastrar el redondeo de π. */
  cocientePi: number;
}

export type LecturaAngulo =
  | { estado: 'vacio' }
  | { estado: 'invalido' }
  | { estado: 'ok'; angulo: Angulo };

export interface Razones {
  seno: number;
  coseno: number;
  /** `null` = la razón no está definida en ese ángulo (división entre cero). */
  tangente: number | null;
  cosecante: number | null;
  secante: number | null;
  cotangente: number | null;
}

export interface Ubicacion {
  /** 1 a 4, o `null` si el ángulo cae sobre un eje (cuadrantal). */
  cuadrante: 1 | 2 | 3 | 4 | null;
  /** Rótulo para la vista: «I»…«IV» o «Ninguno». */
  rotulo: string;
  /** Explicación corta: el intervalo del cuadrante o el semieje. */
  detalle: string;
}

// ============================================================
// LECTURA DEL ÁNGULO (admite múltiplos de π en radianes)
// ============================================================

/** «π», «-π/2», «3π/4», «2pi», «0,5π»: coeficiente opcional, π y denominador opcional. */
const EXPRESION_PI = /^([+-]?)\s*([\d.,]*)\s*(?:π|pi)\s*(?:\/\s*([\d.,]+))?$/i;

/**
 * Lee lo que se ha tecleado en un campo de ángulo. En radianes admite múltiplos de π
 * («π/2», «3π/2»), que es como se escriben los ángulos notables y la única forma de que
 * lleguen exactos: 1,5708 no es π/2 y su tangente vale −272.241,8.
 */
export function leerAngulo(texto: string, unidad: UnidadEntrada): LecturaAngulo {
  const limpio = texto.trim();
  if (limpio === '') return { estado: 'vacio' };

  if (unidad === 'radianes') {
    const m = limpio.match(EXPRESION_PI);
    if (m) {
      const signo = m[1] === '-' ? -1 : 1;
      const coef = m[2] === '' ? 1 : parseSpanishNumber(m[2]);
      const den = m[3] === undefined ? 1 : parseSpanishNumber(m[3]);
      if (!Number.isFinite(coef) || !Number.isFinite(den) || den === 0) {
        return { estado: 'invalido' };
      }
      const cocientePi = (signo * coef) / den;
      return {
        estado: 'ok',
        angulo: {
          // 180·3/2 = 270 exacto: el producto se hace antes de dividir.
          grados: (signo * coef * 180) / den,
          radianes: cocientePi * Math.PI,
          cocientePi,
        },
      };
    }
  }

  const valor = parseSpanishNumber(limpio);
  if (!Number.isFinite(valor)) return { estado: 'invalido' };
  return { estado: 'ok', angulo: anguloDesde(valor, unidad) };
}

/** Construye un ángulo desde un número en la unidad dada. */
export function anguloDesde(valor: number, unidad: UnidadEntrada): Angulo {
  switch (unidad) {
    case 'grados':
      return { grados: valor, radianes: (valor * Math.PI) / 180, cocientePi: valor / 180 };
    case 'gradianes':
      // 400 gon = 360°: 100 gon · 9/10 = 90 exacto.
      return { grados: (valor * 9) / 10, radianes: (valor * Math.PI) / 200, cocientePi: valor / 200 };
    case 'radianes':
    default:
      return { grados: (valor * 180) / Math.PI, radianes: valor, cocientePi: valor / Math.PI };
  }
}

/** Combina ángulos (a·fA + b·fB) sin perder la exactitud en grados. */
export function combinar(a: Angulo, factorA: number, b?: Angulo, factorB = 0): Angulo {
  return {
    grados: a.grados * factorA + (b ? b.grados * factorB : 0),
    radianes: a.radianes * factorA + (b ? b.radianes * factorB : 0),
    cocientePi: a.cocientePi * factorA + (b ? b.cocientePi * factorB : 0),
  };
}

// ============================================================
// ÁNGULOS CUADRANTALES Y RAZONES
// ============================================================

const TOLERANCIA_EJE = 1e-9;

/** Grados reducidos a [0, 360). */
export function normalizarGrados(grados: number): number {
  const r = ((grados % 360) + 360) % 360;
  // 359,9999999999 → 0 cuando la diferencia es solo ruido.
  return Math.abs(r - 360) < TOLERANCIA_EJE ? 0 : r;
}

/** Si el ángulo cae sobre un eje, cuál: 0 = +X, 1 = +Y, 2 = −X, 3 = −Y. Si no, `null`. */
export function ejeDe(grados: number): 0 | 1 | 2 | 3 | null {
  if (!Number.isFinite(grados)) return null;
  const r = normalizarGrados(grados);
  const k = Math.round(r / 90);
  if (Math.abs(r - k * 90) >= TOLERANCIA_EJE) return null;
  return (k % 4) as 0 | 1 | 2 | 3;
}

/** (cos, sen) exactos de los cuatro semiejes. */
const PUNTOS_EJE: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

/**
 * Las seis razones. En un ángulo cuadrantal son exactas (0, ±1) y las que dividen entre
 * cero se devuelven como `null`; en el resto, `Math.sin`/`Math.cos` sobre los radianes.
 */
export function razones(angulo: Angulo): Razones {
  const eje = ejeDe(angulo.grados);
  let seno: number;
  let coseno: number;
  if (eje !== null) {
    [coseno, seno] = PUNTOS_EJE[eje];
  } else {
    seno = Math.sin(angulo.radianes);
    coseno = Math.cos(angulo.radianes);
  }
  // `+ 0` convierte un −0 en 0, para no imprimir «-0,00000000».
  return {
    seno: seno + 0,
    coseno: coseno + 0,
    tangente: coseno === 0 ? null : seno / coseno + 0,
    cosecante: seno === 0 ? null : 1 / seno,
    secante: coseno === 0 ? null : 1 / coseno,
    cotangente: seno === 0 ? null : coseno / seno + 0,
  };
}

const ROMANOS = ['I', 'II', 'III', 'IV'] as const;
const SEMIEJES = ['semieje X positivo', 'semieje Y positivo', 'semieje X negativo', 'semieje Y negativo'];
const INTERVALOS = ['0° < θ < 90°', '90° < θ < 180°', '180° < θ < 270°', '270° < θ < 360°'];

/** Cuadrante del ángulo, calculado SIEMPRE en grados (también si se tecleó en radianes). */
export function ubicacion(angulo: Angulo): Ubicacion {
  const eje = ejeDe(angulo.grados);
  if (eje !== null) {
    return {
      cuadrante: null,
      rotulo: 'Ninguno',
      detalle: `Ángulo cuadrantal: cae sobre el ${SEMIEJES[eje]}`,
    };
  }
  const r = normalizarGrados(angulo.grados);
  const indice = Math.min(3, Math.floor(r / 90));
  return {
    cuadrante: (indice + 1) as 1 | 2 | 3 | 4,
    rotulo: ROMANOS[indice],
    detalle: `Cuadrante ${ROMANOS[indice]}: ${INTERVALOS[indice]}`,
  };
}

// ============================================================
// FRACCIÓN DE π
// ============================================================

const DENOMINADOR_MAXIMO = 12;
const TOLERANCIA_FRACCION_EXACTA = 1e-9;
const TOLERANCIA_FRACCION_APROX = 5e-5;

/** «π», «-π/2», «3π/4», «0». Recibe numerador y denominador ya reducidos. */
export function escribirFraccionPi(numerador: number, denominador: number): string {
  if (numerador === 0) return '0';
  const signo = numerador < 0 ? '-' : '';
  const n = Math.abs(numerador);
  const coef = n === 1 ? '' : String(n);
  return denominador === 1 ? `${signo}${coef}π` : `${signo}${coef}π/${denominador}`;
}

/** Mejor fracción n/d con d ≤ 12 para el cociente θ/π, y lo lejos que queda. */
function fraccionMasCercana(cociente: number): { n: number; d: number; error: number } {
  let mejor = { n: Math.round(cociente), d: 1, error: Math.abs(cociente - Math.round(cociente)) };
  for (let d = 2; d <= DENOMINADOR_MAXIMO; d++) {
    const n = Math.round(cociente * d);
    const error = Math.abs(cociente - n / d);
    // Solo gana si mejora de verdad: así 2/4 se queda en 1/2 (el menor denominador).
    if (error < mejor.error - TOLERANCIA_FRACCION_EXACTA) mejor = { n, d, error };
  }
  return mejor;
}

/**
 * El ángulo como fracción de π: exacta («π/2»), aproximada («≈ π/2», cuando se teclea
 * 1,5708 rad) o, si no se parece a ninguna, el cociente decimal («0,3183π»).
 * `formatearDecimal` se inyecta para usar el formateador español de la app.
 */
export function fraccionDePi(cociente: number, formatearDecimal: (x: number) => string): string {
  if (!Number.isFinite(cociente)) return '—';
  const { n, d, error } = fraccionMasCercana(cociente);
  if (error < TOLERANCIA_FRACCION_EXACTA) return escribirFraccionPi(n, d);
  if (error < TOLERANCIA_FRACCION_APROX) return `≈ ${escribirFraccionPi(n, d)}`;
  return `${formatearDecimal(cociente)}π`;
}

/** Lo que escribe en el campo un botón de ángulo notable en modo radianes: «π/2», «2π», «0». */
export function textoRadianesDeNotable(grados: number): string {
  const { n, d } = fraccionMasCercana(grados / 180);
  return escribirFraccionPi(n, d);
}

// ============================================================
// IDENTIDADES
// ============================================================

export interface ResultadoIdentidades {
  sin2cos2: number;
  sin2a: number;
  cos2a: number;
  sinMitad: number;
  cosMitad: number;
  suma: { sinSuma: number; cosSuma: number; sinResta: number; cosResta: number } | null;
}

/**
 * Cada identidad se evalúa sobre su ángulo (2A, A/2, A+B, A−B) con `razones`, que reconoce
 * los cuadrantales: cos(30° + 60°) = cos 90° = 0 exacto, no 6·10⁻¹⁷ impreso como «≈0».
 */
export function identidades(a: Angulo, b: Angulo | null): ResultadoIdentidades {
  const rA = razones(a);
  const r2A = razones(combinar(a, 2));
  const rMitad = razones(combinar(a, 0.5));
  let suma: ResultadoIdentidades['suma'] = null;
  if (b) {
    const rSuma = razones(combinar(a, 1, b, 1));
    const rResta = razones(combinar(a, 1, b, -1));
    suma = {
      sinSuma: rSuma.seno,
      cosSuma: rSuma.coseno,
      sinResta: rResta.seno,
      cosResta: rResta.coseno,
    };
  }
  return {
    sin2cos2: rA.seno * rA.seno + rA.coseno * rA.coseno,
    sin2a: r2A.seno,
    cos2a: r2A.coseno,
    sinMitad: rMitad.seno,
    cosMitad: rMitad.coseno,
    suma,
  };
}

// ============================================================
// TRIÁNGULO RECTÁNGULO
// ============================================================

/**
 * Datos del triángulo tal como llegan de la vista: `null` = campo vacío, NaN = escrito pero
 * no es un número. `alfa` es el ángulo opuesto al cateto a, en grados.
 */
export interface DatosTriangulo {
  a: number | null;
  b: number | null;
  c: number | null;
  alfa: number | null;
}

export interface Triangulo {
  a: number;
  b: number;
  c: number;
  /** Ángulo opuesto al cateto a (= α), en grados. */
  anguloA: number;
  /** Ángulo opuesto al cateto b, en grados. */
  anguloB: number;
  area: number;
  perimetro: number;
}

type ClaveDato = keyof DatosTriangulo;

export type ResultadoTriangulo =
  | { estado: 'faltan' }
  | { estado: 'error'; mensaje: string }
  | { estado: 'ok'; triangulo: Triangulo; nota: string | null };

/** Con artículo, para que las frases concuerden («la hipotenusa c», «el cateto a»). */
const NOMBRES: Record<ClaveDato, string> = {
  a: 'el cateto a',
  b: 'el cateto b',
  c: 'la hipotenusa c',
  alfa: 'el ángulo α',
};

const mayuscula = (texto: string): string => texto.charAt(0).toUpperCase() + texto.slice(1);

/** Tolerancia relativa para dar por buenos datos de más tecleados con redondeo (0,5 %). */
export const TOLERANCIA_REDUNDANCIA = 0.005;

const PAREJAS: ReadonlyArray<readonly [ClaveDato, ClaveDato]> = [
  ['a', 'b'],
  ['a', 'c'],
  ['b', 'c'],
  ['a', 'alfa'],
  ['b', 'alfa'],
  ['c', 'alfa'],
];

const aGrados = (rad: number): number => (rad * 180) / Math.PI;
const aRadianes = (grados: number): number => (grados * Math.PI) / 180;

function completar(a: number, b: number, c: number, anguloA: number): Triangulo {
  return { a, b, c, anguloA, anguloB: 90 - anguloA, area: (a * b) / 2, perimetro: a + b + c };
}

/** Número corto para los mensajes, en formato español y sin ceros sobrantes. */
function formatoCorto(x: number): string {
  return formatearFlexible(x, 4);
}

function mensajeHipotenusa(cateto: string, valorCateto: number, hipotenusa: number): string {
  return `La hipotenusa (${formatoCorto(hipotenusa)}) tiene que ser MAYOR que ${cateto} (${formatoCorto(valorCateto)}): es siempre el lado más largo del triángulo rectángulo. Revisa qué dato es cuál.`;
}

/** Resuelve desde una pareja de datos ya validados. Devuelve un mensaje si es imposible. */
function resolverPareja(
  pareja: readonly [ClaveDato, ClaveDato],
  d: Record<ClaveDato, number>,
): Triangulo | string {
  const clave = `${pareja[0]}+${pareja[1]}`;
  switch (clave) {
    case 'a+b':
      return completar(d.a, d.b, Math.hypot(d.a, d.b), aGrados(Math.atan2(d.a, d.b)));
    case 'a+c':
      if (d.c <= d.a) return mensajeHipotenusa(NOMBRES.a, d.a, d.c);
      return completar(d.a, Math.sqrt(d.c * d.c - d.a * d.a), d.c, aGrados(Math.asin(d.a / d.c)));
    case 'b+c':
      if (d.c <= d.b) return mensajeHipotenusa(NOMBRES.b, d.b, d.c);
      return completar(Math.sqrt(d.c * d.c - d.b * d.b), d.b, d.c, aGrados(Math.acos(d.b / d.c)));
    case 'a+alfa': {
      const t = aRadianes(d.alfa);
      return completar(d.a, d.a / Math.tan(t), d.a / Math.sin(t), d.alfa);
    }
    case 'b+alfa': {
      const t = aRadianes(d.alfa);
      return completar(d.b * Math.tan(t), d.b, d.b / Math.cos(t), d.alfa);
    }
    case 'c+alfa':
    default: {
      const t = aRadianes(d.alfa);
      return completar(d.c * Math.sin(t), d.c * Math.cos(t), d.c, d.alfa);
    }
  }
}

/**
 * Resuelve el triángulo rectángulo con CUALQUIER pareja de datos (las seis). Con datos de
 * más, resuelve con la primera pareja y comprueba que los demás cuadran; si no cuadran, lo
 * dice en vez de descartar en silencio lo tecleado (hallazgo 1784). Un dato imposible se
 * explica, no se trata como un dato que falta (hallazgo 1785).
 */
export function resolverTriangulo(datos: DatosTriangulo): ResultadoTriangulo {
  const claves: ClaveDato[] = ['a', 'b', 'c', 'alfa'];
  const presentes = claves.filter((k) => datos[k] !== null);

  for (const k of presentes) {
    const v = datos[k] as number;
    if (!Number.isFinite(v)) {
      return {
        estado: 'error',
        mensaje: `${mayuscula(NOMBRES[k])} no es un número. Escribe solo la cifra, con coma o punto decimal.`,
      };
    }
    if (k === 'alfa') {
      if (v <= 0 || v >= 90) {
        return {
          estado: 'error',
          mensaje:
            'El ángulo α tiene que estar entre 0° y 90°, sin incluirlos: en un triángulo rectángulo los otros dos ángulos son el recto y su complementario.',
        };
      }
    } else if (v <= 0) {
      return {
        estado: 'error',
        mensaje: `${mayuscula(NOMBRES[k])} tiene que ser mayor que cero: es la longitud de un lado.`,
      };
    }
  }

  if (presentes.length < 2) return { estado: 'faltan' };

  const d: Record<ClaveDato, number> = {
    a: datos.a ?? NaN,
    b: datos.b ?? NaN,
    c: datos.c ?? NaN,
    alfa: datos.alfa ?? NaN,
  };
  const pareja = PAREJAS.find(([x, y]) => presentes.includes(x) && presentes.includes(y));
  if (!pareja) return { estado: 'faltan' };

  const solucion = resolverPareja(pareja, d);
  if (typeof solucion === 'string') return { estado: 'error', mensaje: solucion };

  const sobrantes = presentes.filter((k) => !pareja.includes(k));
  if (sobrantes.length === 0) return { estado: 'ok', triangulo: solucion, nota: null };

  const calculado: Record<ClaveDato, number> = {
    a: solucion.a,
    b: solucion.b,
    c: solucion.c,
    alfa: solucion.anguloA,
  };
  const conUnidadDe = (k: ClaveDato, x: number): string =>
    `${formatoCorto(x)}${k === 'alfa' ? '°' : ''}`;
  const base = `${NOMBRES[pareja[0]]} = ${conUnidadDe(pareja[0], d[pareja[0]])} y ${NOMBRES[pareja[1]]} = ${conUnidadDe(pareja[1], d[pareja[1]])}`;

  for (const k of sobrantes) {
    const tecleado = d[k];
    const esperado = calculado[k];
    if (Math.abs(tecleado - esperado) > TOLERANCIA_REDUNDANCIA * Math.abs(esperado)) {
      return {
        estado: 'error',
        mensaje: `Los datos no son compatibles: con ${base}, ${NOMBRES[k]} sería ${conUnidadDe(k, esperado)}, no ${conUnidadDe(k, tecleado)}. Deja solo dos datos o corrige el que no cuadra.`,
      };
    }
  }
  return {
    estado: 'ok',
    triangulo: solucion,
    nota: `Hay datos de más: se ha resuelto con ${base}, y el resto cuadra con ellos (dentro del 0,5 %).`,
  };
}
