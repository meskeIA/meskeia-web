/**
 * Casos para clase de la Calculadora de Fracciones (skill /casos-aula-meskeia, tipo A).
 *
 * Funciones puras, sin React ni DOM: el build compila la página sin comprobar si la matemática está
 * bien, y estos casos corrigen a alumnos. Lo vigila `tests/apps/calculadora-fracciones.spec.ts`,
 * con las respuestas calculadas a mano en su cabecera.
 *
 * REGLA DE ORO: aquí no hay aritmética propia. Cada respuesta y cada desarrollo salen de
 * `evaluarExpresion` de `@/lib/calculadoras/fracciones`, la MISMA función que resuelve lo que se escribe en la
 * calculadora. Si los casos calcularan por su cuenta, la app podría suspender una respuesta que
 * ella misma produce.
 *
 * LA RESPUESTA ES UNA FRACCIÓN, NO UN DECIMAL (variante del tipo A, como el numeral de
 * calculadora-sistemas-numericos): no hay tolerancia ni `corregirNumero`. Se lee lo escrito con
 * `leerFraccion` y se compara el VALOR exacto por producto cruzado. Lo que el profesor pide —«en
 * fracción irreducible»— se exige aparte, con su propio motivo:
 *   · equivalente pero sin simplificar (6/8 por 3/4) → no vale, y se dice entre qué dividir;
 *   · el valor en decimal (0,75) → no vale, y se dice que se pide la fracción;
 *   · el número mixto (1 3/4 por 7/4) → SÍ vale: es la misma cantidad, irreducible.
 *
 * CONVENIO: el del motor (jerarquía de operaciones, m.c.m. para sumar, inversa para dividir). Los
 * casos solo usan expresiones que no dependen de él más allá de la jerarquía, que es temario.
 */

import {
  analizar,
  aMixto,
  esIrreducible,
  evaluarExpresion,
  igualValor,
  leerFraccion,
  mcd,
  normalizar,
  simplificar,
  textoExpresion,
  textoFraccion,
  textoMixto,
  type Fraccion,
} from '@/lib/calculadoras/fracciones';

export interface DatosCaso {
  /** La operación que resuelve el caso, tal como se escribiría en la calculadora. */
  expresion: string;
}

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  etiquetaRespuesta: string;
  /** Calculada por el motor desde `datos`, nunca escrita a mano. */
  respuesta: Fraccion;
  respuestaTexto: string;
  pasos: string[];
  pista: string;
}

export const ETIQUETA_RESPUESTA = 'Resultado (fracción irreducible, o entero si sale exacto)';

/** La operación con los signos de pantalla: «(3/4 − 1/2) ÷ 5/8». */
export function expresionBonita(expresion: string): string {
  const a = analizar(expresion);
  return a.ok ? textoExpresion(a.arbol) : expresion;
}

export type Resolucion = { ok: true; valor: Fraccion; pasos: string[] } | { ok: false; error: string };

/** Recalcula un caso desde sus datos, sin mirar la respuesta declarada. */
export function resolverCaso(datos: DatosCaso, categoria: Caso['categoria'] = 'abstracto'): Resolucion {
  const r = evaluarExpresion(datos.expresion);
  if (!r.ok) return r;
  const cabecera = categoria === 'aplicado' ? `Planteamiento: ${r.inicial}.` : `Operación: ${r.inicial}.`;
  return {
    ok: true,
    valor: r.valor,
    pasos: [cabecera, ...r.pasos.map((p) => `${p.explicacion.join(' ')} Queda: ${p.expresion}.`)],
  };
}

interface DefinicionCaso {
  titulo: string;
  categoria: Caso['categoria'];
  expresion: string;
  /** Solo en los aplicados: el abstracto se escribe solo desde la expresión. */
  enunciado?: string;
  pista: string;
}

function enunciadoOperacion(expresion: string): string {
  return `Calcula ${expresionBonita(expresion)} y escribe el resultado como fracción irreducible.`;
}

const DEFINICIONES: DefinicionCaso[] = [
  {
    titulo: 'Suma con distinto denominador',
    categoria: 'abstracto',
    expresion: '2/3 + 1/4',
    pista: 'Busca el m.c.m. de 3 y 4 y pasa las dos fracciones a ese denominador antes de sumar.',
  },
  {
    titulo: 'Resta con distinto denominador',
    categoria: 'abstracto',
    expresion: '5/6 − 3/8',
    pista: 'El m.c.m. de 6 y 8 no es 48: es más pequeño.',
  },
  {
    titulo: 'Multiplicación y simplificación',
    categoria: 'abstracto',
    expresion: '4/9 × 3/8',
    pista: 'Multiplica en línea y después simplifica; o simplifica antes en cruz (4 con 8, 3 con 9).',
  },
  {
    titulo: 'División que da un entero',
    categoria: 'abstracto',
    expresion: '6/7 ÷ 3/14',
    pista: 'Dividir es multiplicar por la inversa de la segunda fracción.',
  },
  {
    titulo: 'Simplificar hasta la irreducible',
    categoria: 'abstracto',
    expresion: '84/126',
    enunciado: 'Simplifica 84/126 hasta obtener la fracción irreducible.',
    pista: 'Descompón 84 y 126 en factores primos: el m.c.d. son los factores comunes con su menor exponente.',
  },
  {
    titulo: 'Resta con resultado negativo',
    categoria: 'abstracto',
    expresion: '1/6 − 3/4',
    pista: 'El segundo término es mayor que el primero: el resultado lleva signo menos.',
  },
  {
    titulo: 'Jerarquía sin paréntesis',
    categoria: 'abstracto',
    expresion: '1/3 + 2/5 × 5/6',
    pista: 'La multiplicación va antes que la suma: no sumes 1/3 + 2/5 primero.',
  },
  {
    titulo: 'Operación con paréntesis',
    categoria: 'abstracto',
    expresion: '(3/4 − 1/2) ÷ 5/8',
    pista: 'Resuelve primero el paréntesis y divide después.',
  },
  {
    titulo: 'Potencia de una fracción',
    categoria: 'abstracto',
    expresion: '(2/3)^2 − 1/9',
    pista: 'Eleva el numerador y el denominador por separado; la potencia va antes que la resta.',
  },
  {
    titulo: 'Lo que queda de una pizza',
    categoria: 'aplicado',
    expresion: '1 − 3/8 − 1/4',
    enunciado:
      'De una pizza entera, Ana se come 3/8 y Luis 1/4. ¿Qué fracción de la pizza queda? Escribe la fracción irreducible.',
    pista: 'La pizza entera es 1. Réstale lo que se come cada uno.',
  },
  {
    titulo: 'Tandas de una receta',
    categoria: 'aplicado',
    expresion: '4 ÷ 2/3',
    enunciado:
      'Cada tanda de galletas lleva 2/3 de taza de harina. Si tienes 4 tazas, ¿cuántas tandas completas puedes hacer?',
    pista: 'Se trata de saber cuántas veces cabe 2/3 en 4: es una división.',
  },
  {
    titulo: 'Fracción de lo que queda',
    categoria: 'aplicado',
    expresion: '1 − 2/5 − 1/3 × (1 − 2/5)',
    enunciado:
      'Una excursionista recorre 2/5 del camino el primer día y, el segundo, 1/3 de lo que le quedaba. ¿Qué fracción del camino total le falta por recorrer? Escribe la fracción irreducible.',
    pista: 'El segundo día no recorre 1/3 del camino total, sino 1/3 de lo que quedaba tras el primero.',
  },
];

function construirCaso(d: DefinicionCaso, i: number): Caso {
  const r = resolverCaso({ expresion: d.expresion }, d.categoria);
  // Un caso que el motor no resuelve es un error de quien lo escribió: se ve en el test (respuesta
  // 0/1 y desarrollo con el error), nunca como excepción en el render.
  const valor = r.ok ? r.valor : { num: 0, den: 1 };
  return {
    id: i + 1,
    titulo: d.titulo,
    enunciado: d.enunciado ?? enunciadoOperacion(d.expresion),
    categoria: d.categoria,
    datos: { expresion: d.expresion },
    etiquetaRespuesta: ETIQUETA_RESPUESTA,
    respuesta: valor,
    respuestaTexto: textoFraccion(valor),
    pasos: r.ok ? r.pasos : [`Error en el caso: ${r.error}`],
    pista: d.pista,
  };
}

export const CASOS: readonly Caso[] = DEFINICIONES.map(construirCaso);

export const TOTAL_CASOS = CASOS.length;

/* ───────────────────────────── Corrector ───────────────────────────── */

export type EstadoCorreccion =
  | 'vacio'
  | 'no-valido'
  | 'acierto'
  | 'sin-simplificar'
  | 'decimal'
  | 'signo'
  | 'inversa'
  | 'fallo';

export interface Correccion {
  estado: EstadoCorreccion;
  correcto: boolean;
  motivo: string;
}

/** Corrige lo que ha escrito el alumno frente a la respuesta exacta. */
export function comprobarRespuesta(texto: string, esperado: Fraccion): Correccion {
  const e = simplificar(esperado);
  if (!texto.trim()) {
    return { estado: 'vacio', correcto: false, motivo: 'Escribe tu respuesta, por ejemplo 7/12 o −2/5.' };
  }
  const l = leerFraccion(texto);
  if (!l.ok) {
    return {
      estado: 'no-valido',
      correcto: false,
      motivo: `No reconozco «${texto.trim()}» como una fracción. Escríbela como numerador/denominador, por ejemplo 7/12.`,
    };
  }
  const v = normalizar(l.valor);
  if (l.forma === 'decimal') {
    return igualValor(v, e)
      ? { estado: 'decimal', correcto: false, motivo: 'Ese decimal vale lo mismo que el resultado, pero se pide la fracción irreducible.' }
      : { estado: 'fallo', correcto: false, motivo: 'Incorrecto. Además, se pide el resultado como fracción, no como decimal.' };
  }
  if (igualValor(v, e)) {
    const parte = l.forma === 'mixto' ? { num: Math.abs(v.num) % v.den, den: v.den } : v;
    if (!esIrreducible(parte)) {
      return {
        estado: 'sin-simplificar',
        correcto: false,
        motivo: `Es equivalente al resultado, pero no es irreducible: todavía puedes dividir entre ${mcd(parte.num, parte.den)}.`,
      };
    }
    if (l.forma === 'mixto') {
      return { estado: 'acierto', correcto: true, motivo: `¡Correcto! ${textoMixto(aMixto(e))} es ${textoFraccion(e)} escrito como número mixto.` };
    }
    return { estado: 'acierto', correcto: true, motivo: `¡Correcto! El resultado es ${textoFraccion(e)}.` };
  }
  if (e.num !== 0 && igualValor(v, { num: -e.num, den: e.den })) {
    return { estado: 'signo', correcto: false, motivo: 'Casi: el valor es correcto, pero el signo no.' };
  }
  if (e.num !== 0 && v.num !== 0 && igualValor(v, { num: e.den, den: e.num })) {
    return {
      estado: 'inversa',
      correcto: false,
      motivo: 'Has escrito la inversa del resultado: revisa si le diste la vuelta a la fracción que no tocaba.',
    };
  }
  return { estado: 'fallo', correcto: false, motivo: 'Incorrecto. Prueba con la pista o mira la solución.' };
}

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente con
 * enteros pequeños, los primeros valores salen diminutos y parecidos, y `Math.floor(rnd()*n)`
 * devuelve el índice 0 una y otra vez: el «aleatorio» acaba dando SIEMPRE el mismo ejercicio
 * y aun así pasa la prueba de reproducibilidad, porque reproducible no es variado.
 */
function aleatorioCon(semilla: number): () => number {
  let estado = (semilla >>> 0) || 1;
  return () => {
    estado = (estado + 0x9e3779b9) >>> 0;
    let z = estado;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
    z = (z ^ (z >>> 15)) >>> 0;
    return z / 0x100000000;
  };
}

/** Entero entre `min` y `max`, ambos incluidos. */
function entre(min: number, max: number, rnd: () => number): number {
  return min + Math.min(max - min, Math.floor(rnd() * (max - min + 1)));
}

/** Una fracción propia irreducible con denominador de 2 a 10, escrita «a/b». */
function fraccionAl(rnd: () => number): string {
  const den = entre(2, 10, rnd);
  let num = entre(1, den - 1, rnd);
  while (mcd(num, den) !== 1) num = entre(1, den - 1, rnd);
  return `${num}/${den}`;
}

const PLANTILLAS: ((rnd: () => number) => string)[] = [
  (r) => `${fraccionAl(r)} + ${fraccionAl(r)}`,
  (r) => `${fraccionAl(r)} − ${fraccionAl(r)}`,
  (r) => `${fraccionAl(r)} × ${fraccionAl(r)}`,
  (r) => `${fraccionAl(r)} ÷ ${fraccionAl(r)}`,
  (r) => `${fraccionAl(r)} + ${fraccionAl(r)} × ${fraccionAl(r)}`,
  (r) => `(${fraccionAl(r)} − ${fraccionAl(r)}) ÷ ${fraccionAl(r)}`,
  (r) => `${fraccionAl(r)} × (${fraccionAl(r)} + ${fraccionAl(r)})`,
];

/** Topes del resultado: que el ejercicio se pueda hacer a mano en un cuaderno. */
const MAX_NUMERADOR = 150;
const MAX_DENOMINADOR = 144;

export interface Ejercicio {
  semilla: number;
  enunciado: string;
  datos: DatosCaso;
  etiquetaRespuesta: string;
  respuesta: Fraccion;
  respuestaTexto: string;
  pasos: string[];
}

/** Un ejercicio de práctica, reproducible por semilla y resuelto con el mismo `resolverCaso`. */
export function generarEjercicioAleatorio(semilla?: number): Ejercicio {
  const s = semilla ?? Math.floor(Math.random() * 0xffffffff);
  const rnd = aleatorioCon(s);
  let expresion = '2/3 + 1/4';
  for (let intento = 0; intento < 60; intento++) {
    const candidata = PLANTILLAS[entre(0, PLANTILLAS.length - 1, rnd)](rnd);
    const r = resolverCaso({ expresion: candidata });
    if (!r.ok) continue;
    if (r.valor.num === 0) continue;
    if (Math.abs(r.valor.num) > MAX_NUMERADOR || r.valor.den > MAX_DENOMINADOR) continue;
    expresion = candidata;
    break;
  }
  const r = resolverCaso({ expresion });
  const valor = r.ok ? r.valor : { num: 0, den: 1 };
  return {
    semilla: s,
    enunciado: enunciadoOperacion(expresion),
    datos: { expresion },
    etiquetaRespuesta: ETIQUETA_RESPUESTA,
    respuesta: valor,
    respuestaTexto: textoFraccion(valor),
    pasos: r.ok ? r.pasos : [`Error: ${r.error}`],
  };
}
