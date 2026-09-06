/**
 * Motor matemático del simulador del teorema de Tales y la semejanza.
 *
 * Vive fuera de `page.tsx` a propósito: el build compila la vista sin mirar si la
 * geometría está bien. Una proporción invertida (b/a donde tocaba a/b) o un área
 * multiplicada por k en vez de por k² compilan exactamente igual que la versión
 * correcta y llegan a producción sin que nada chille — y son justo los dos errores
 * que esta app existe para desmontar. Por eso toda la aritmética vive aquí, en
 * funciones puras sin React ni DOM, que se pueden resolver a mano en papel y
 * comprobar una a una en `tests/apps/simulador-teorema-tales.spec.ts`.
 *
 * Única dependencia: `formatNumber` (formato español de cifras), para redactar los
 * pasos de cada solución. Es una función pura: no toca ventana, documento ni estado.
 *
 * CONVENIO DE ERRORES — ninguna función lanza. Cuando los datos no permiten el
 * cálculo (división por cero, valores no finitos, longitudes negativas, triángulo
 * imposible) se devuelve `NaN`, que la vista distingue y convierte en aviso. Un
 * `throw` durante un render de React tumba la app entera; un `NaN` se puede pintar.
 *
 * CONVENIO DE UNIDADES — las longitudes son adimensionales dentro del motor: quien
 * llama decide si son centímetros o metros, y solo el bloque de escalas convierte
 * de verdad (`aCentimetros` / `desdeCentimetros`), porque ahí la unidad es el
 * enunciado. Las áreas son, por tanto, unidades² de la misma unidad.
 */

import { formatNumber } from '@/lib';

// ============================================
// UTILIDADES BÁSICAS
// ============================================

/** Longitud utilizable: número finito y estrictamente positivo. */
export function esLongitudValida(valor: number): boolean {
  return Number.isFinite(valor) && valor > 0;
}

/**
 * Formato español compacto para redactar los pasos: sin decimales cuando el número
 * es entero (6, no «6,00») y con dos cuando no lo es.
 */
function num(valor: number): string {
  if (!Number.isFinite(valor)) return '—';
  return formatNumber(valor, Number.isInteger(valor) ? 0 : 2);
}

/** Redondeo a `decimales` cifras, para que 0,1 + 0,2 no aparezca como 0,30000000000000004. */
export function redondear(valor: number, decimales = 4): number {
  if (!Number.isFinite(valor)) return NaN;
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/** Resultado de un cálculo acompañado de su desarrollo. */
export interface ResultadoConPasos {
  /** Valor calculado, o NaN si los datos no lo permiten. */
  valor: number;
  /** Desarrollo, una frase por paso. Vacío si hay error. */
  pasos: string[];
  /** Mensaje de error, o null si el cálculo salió bien. */
  error: string | null;
}

// ============================================
// 1. TEOREMA DE TALES — CUARTO PROPORCIONAL
// ============================================

/**
 * Cuarto proporcional: el segmento que falta en a / b = a′ / b′.
 *
 * Despejado: b′ = b · a′ / a. El orden importa — invertir la razón es el error
 * clásico y da un resultado que también «parece» plausible.
 */
export function cuartoProporcional(a: number, b: number, aPrima: number): number {
  if (!esLongitudValida(a) || !esLongitudValida(b) || !esLongitudValida(aPrima)) return NaN;
  return (b * aPrima) / a;
}

/** El cuarto proporcional con su desarrollo escrito. */
export function cuartoProporcionalConPasos(a: number, b: number, aPrima: number): ResultadoConPasos {
  const valor = cuartoProporcional(a, b, aPrima);

  if (Number.isNaN(valor)) {
    return {
      valor: NaN,
      pasos: [],
      error: 'Los tres segmentos conocidos deben ser números mayores que cero.',
    };
  }

  return {
    valor,
    pasos: [
      'Teorema de Tales: si varias rectas paralelas cortan a dos secantes, los segmentos que determinan en una son proporcionales a los que determinan en la otra, de modo que a / b = a′ / b′.',
      `Sustituyo los datos conocidos: ${num(a)} / ${num(b)} = ${num(aPrima)} / b′.`,
      `Multiplico en cruz y despejo la incógnita: b′ = b · a′ / a = ${num(b)} · ${num(aPrima)} / ${num(a)}.`,
      `b′ = ${num(redondear(valor, 2))}. Comprobación: la razón de la primera secante vale ${num(redondear(a / b, 3))} y la de la segunda también, ${num(redondear(aPrima / valor, 3))}.`,
    ],
    error: null,
  };
}

// ============================================
// 2. SEMEJANZA
// ============================================

/** Multiplica cada lado por la razón de semejanza k. Devuelve NaN en las posiciones inválidas. */
export function aplicarSemejanza(lados: number[], k: number): number[] {
  const kValida = Number.isFinite(k) && k > 0;
  return lados.map((lado) => (kValida && esLongitudValida(lado) ? lado * k : NaN));
}

/** Cómo afecta la razón k a lados, perímetro y área. */
export interface EfectoSemejanza {
  razon: number;
  /** Cada lado se multiplica por k. */
  factorLados: number;
  /** El perímetro es una suma de lados: también se multiplica por k. */
  factorPerimetro: number;
  /** El área es un producto de DOS longitudes: se multiplica por k², no por k. */
  factorArea: number;
}

/**
 * El efecto de la razón de semejanza sobre lados, perímetro y área.
 *
 * Está separado a propósito: el error clásico —creer que el área también se
 * multiplica por k— se cuela en una línea de vista y no lo detecta ningún build.
 * Aquí se comprueba con un caso a mano: k = 2 debe dar factorArea = 4.
 */
export function efectoSobreAreaYPerimetro(k: number): EfectoSemejanza {
  if (!Number.isFinite(k) || k <= 0) {
    return { razon: NaN, factorLados: NaN, factorPerimetro: NaN, factorArea: NaN };
  }
  return { razon: k, factorLados: k, factorPerimetro: k, factorArea: k * k };
}

/** Desigualdad triangular: tres longitudes solo cierran un triángulo si cada lado es menor que la suma de los otros dos. */
export function esTrianguloValido(a: number, b: number, c: number): boolean {
  if (!esLongitudValida(a) || !esLongitudValida(b) || !esLongitudValida(c)) return false;
  return a + b > c && a + c > b && b + c > a;
}

/** Perímetro: suma de lados. NaN si alguno no es una longitud válida. */
export function perimetro(lados: number[]): number {
  if (lados.length === 0 || lados.some((lado) => !esLongitudValida(lado))) return NaN;
  return lados.reduce((suma, lado) => suma + lado, 0);
}

/** Área por la fórmula de Herón. NaN si los tres lados no cierran un triángulo. */
export function areaHeron(a: number, b: number, c: number): number {
  if (!esTrianguloValido(a, b, c)) return NaN;
  const s = (a + b + c) / 2;
  const producto = s * (s - a) * (s - b) * (s - c);
  return producto <= 0 ? NaN : Math.sqrt(producto);
}

/**
 * Los tres ángulos del triángulo en grados, cada uno OPUESTO al lado del mismo
 * índice (el primero se opone al lado `a`). Ley del coseno.
 *
 * Los ángulos son lo que NO cambia al aplicar semejanza: por eso la vista los
 * calcula una sola vez y los muestra idénticos en las dos figuras.
 */
export function angulosDeTriangulo(a: number, b: number, c: number): [number, number, number] {
  if (!esTrianguloValido(a, b, c)) return [NaN, NaN, NaN];
  const enGrados = (radianes: number): number => (radianes * 180) / Math.PI;
  const alfa = enGrados(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
  const beta = enGrados(Math.acos((a * a + c * c - b * b) / (2 * a * c)));
  // El tercero por diferencia: evita que el redondeo del acos deje una suma de 179,99°.
  return [alfa, beta, 180 - alfa - beta];
}

// ============================================
// 3. ALTURA POR SOMBRAS
// ============================================

/**
 * Altura de un objeto a partir de su sombra, comparándola con la de una vara de
 * altura conocida medida a la misma hora.
 *
 * altura del objeto = altura de la vara · sombra del objeto / sombra de la vara.
 *
 * Es el método que la tradición atribuye a Tales ante la pirámide: los rayos del
 * Sol llegan prácticamente paralelos, así que la vara y el objeto forman dos
 * triángulos rectángulos semejantes (criterio AA: el ángulo recto del suelo y el
 * ángulo de elevación del Sol, común a los dos).
 */
export function alturaPorSombra(alturaVara: number, sombraVara: number, sombraObjeto: number): number {
  if (!esLongitudValida(alturaVara) || !esLongitudValida(sombraVara) || !esLongitudValida(sombraObjeto)) {
    return NaN;
  }
  return (alturaVara * sombraObjeto) / sombraVara;
}

/** La altura por sombras con su desarrollo escrito. */
export function alturaPorSombraConPasos(
  alturaVara: number,
  sombraVara: number,
  sombraObjeto: number,
  unidad = 'm'
): ResultadoConPasos {
  const valor = alturaPorSombra(alturaVara, sombraVara, sombraObjeto);

  if (Number.isNaN(valor)) {
    return {
      valor: NaN,
      pasos: [],
      error: 'La altura de la vara y las dos sombras deben ser números mayores que cero.',
    };
  }

  const razon = sombraObjeto / sombraVara;

  return {
    valor,
    pasos: [
      'Los rayos del Sol llegan casi paralelos, así que la vara con su sombra y el objeto con la suya forman dos triángulos rectángulos semejantes (criterio AA).',
      `En triángulos semejantes los lados correspondientes son proporcionales: altura de la vara / sombra de la vara = altura del objeto / sombra del objeto.`,
      `Sustituyo: ${num(alturaVara)} / ${num(sombraVara)} = h / ${num(sombraObjeto)}.`,
      `La sombra del objeto es ${num(redondear(razon, 3))} veces la de la vara, luego su altura lo es también: h = ${num(alturaVara)} · ${num(sombraObjeto)} / ${num(sombraVara)}.`,
      `h = ${num(redondear(valor, 2))} ${unidad}. Las dos medidas de sombra deben tomarse a la misma hora: si el Sol se mueve, la comparación deja de valer.`,
    ],
    error: null,
  };
}

// ============================================
// 4. ESCALAS DE PLANOS Y MAPAS
// ============================================

export type UnidadLongitud = 'mm' | 'cm' | 'm' | 'km';

const FACTOR_A_CM: Record<UnidadLongitud, number> = {
  mm: 0.1,
  cm: 1,
  m: 100,
  km: 100_000,
};

/** Pasa una medida a centímetros. */
export function aCentimetros(valor: number, unidad: UnidadLongitud): number {
  if (!Number.isFinite(valor)) return NaN;
  return valor * FACTOR_A_CM[unidad];
}

/** Pasa una medida de centímetros a la unidad pedida. */
export function desdeCentimetros(centimetros: number, unidad: UnidadLongitud): number {
  if (!Number.isFinite(centimetros)) return NaN;
  return centimetros / FACTOR_A_CM[unidad];
}

/** La unidad en la que una medida en centímetros se lee mejor, para no escribir «170.000 cm». */
export function elegirUnidad(centimetros: number): { valor: number; unidad: UnidadLongitud } {
  if (!Number.isFinite(centimetros)) return { valor: NaN, unidad: 'cm' };
  const absoluto = Math.abs(centimetros);
  if (absoluto >= 100_000) return { valor: desdeCentimetros(centimetros, 'km'), unidad: 'km' };
  if (absoluto >= 100) return { valor: desdeCentimetros(centimetros, 'm'), unidad: 'm' };
  if (absoluto >= 1) return { valor: centimetros, unidad: 'cm' };
  return { valor: desdeCentimetros(centimetros, 'mm'), unidad: 'mm' };
}

/**
 * Medida real a partir de la medida sobre el plano.
 *
 * `escala` es el denominador de la escala: 50 para 1:50, 25000 para 1:25.000.
 * Entrada y salida van en la MISMA unidad — la conversión es cosa de quien llama.
 */
export function medidaReal(medidaPlano: number, escala: number): number {
  if (!esLongitudValida(medidaPlano) || !esLongitudValida(escala)) return NaN;
  return medidaPlano * escala;
}

/** Medida sobre el plano a partir de la medida real. Mismo convenio de escala y unidades. */
export function medidaEnPlano(medidaRealValor: number, escala: number): number {
  if (!esLongitudValida(medidaRealValor) || !esLongitudValida(escala)) return NaN;
  return medidaRealValor / escala;
}

// ============================================
// 5. GEOMETRÍA PARA LAS FIGURAS
// ============================================

export interface Punto {
  x: number;
  y: number;
}

/**
 * Punto en el que una secante (recta que pasa por `desde` y `hasta`) corta a la
 * recta horizontal de altura `y`. Devuelve NaN si la secante es horizontal.
 */
export function puntoEnSecante(desde: Punto, hasta: Punto, y: number): Punto {
  const alturaTotal = hasta.y - desde.y;
  if (alturaTotal === 0 || !Number.isFinite(alturaTotal)) return { x: NaN, y: NaN };
  const t = (y - desde.y) / alturaTotal;
  return { x: desde.x + t * (hasta.x - desde.x), y };
}

/** Distancia euclídea entre dos puntos. */
export function distancia(p: Punto, q: Punto): number {
  return Math.hypot(q.x - p.x, q.y - p.y);
}

/**
 * Vértices de un triángulo a partir de sus tres lados, con A en el origen y B
 * sobre el eje X. Convenio clásico: el lado `a` se opone a A, `b` a B y `c` a C,
 * de modo que |AB| = c, |AC| = b y |BC| = a.
 */
export function verticesTriangulo(a: number, b: number, c: number): [Punto, Punto, Punto] {
  if (!esTrianguloValido(a, b, c)) {
    const nulo: Punto = { x: NaN, y: NaN };
    return [nulo, nulo, nulo];
  }
  const x = (b * b - a * a + c * c) / (2 * c);
  const cuadrado = b * b - x * x;
  const y = cuadrado <= 0 ? 0 : Math.sqrt(cuadrado);
  return [
    { x: 0, y: 0 },
    { x: c, y: 0 },
    { x, y },
  ];
}

// ============================================
// 6. CASOS NUMERADOS
// ============================================

export type TipoCaso = 'tales' | 'semejanza' | 'sombras' | 'escalas';
export type NivelCaso = 'basico' | 'medio' | 'avanzado';
export type MagnitudPedida = 'lado' | 'perimetro' | 'area';

/** Datos con los que el motor resuelve un caso. La `tipo` discrimina la unión. */
export type DatosCaso =
  | { tipo: 'tales'; a: number; b: number; aPrima: number }
  | {
      tipo: 'semejanza';
      lados: [number, number, number];
      k: number;
      pide: MagnitudPedida;
      /** Índice del lado por el que se pregunta cuando `pide` es 'lado'. */
      indiceLado: number;
    }
  | { tipo: 'sombras'; alturaVara: number; sombraVara: number; sombraObjeto: number }
  | {
      tipo: 'escalas';
      modo: 'aReal' | 'aPlano';
      medida: number;
      unidadEntrada: UnidadLongitud;
      escala: number;
      unidadSalida: UnidadLongitud;
    };

export interface CasoTales {
  /** Número visible del caso. 0 para los ejercicios generados al azar. */
  id: number;
  tipo: TipoCaso;
  nivel: NivelCaso;
  titulo: string;
  enunciado: string;
  /** Unidad en la que se espera la respuesta ('cm', 'm', 'cm²'…). */
  unidad: string;
  datos: DatosCaso;
  /** Solución calculada por el propio motor, nunca escrita a mano. */
  solucion: number;
  pasos: string[];
}

const NOMBRES_LADO = ['primero', 'segundo', 'tercero'];

/**
 * Resuelve cualquier caso a partir de sus datos y redacta el desarrollo.
 *
 * Es la pieza que garantiza que los 12 casos fijos y los ejercicios aleatorios
 * comparten exactamente la misma matemática: si el motor se equivoca, se equivoca
 * en ambos y el test lo caza.
 */
export function resolverCaso(datos: DatosCaso, unidad = ''): ResultadoConPasos {
  const sufijo = unidad ? ` ${unidad}` : '';

  switch (datos.tipo) {
    case 'tales':
      return cuartoProporcionalConPasos(datos.a, datos.b, datos.aPrima);

    case 'sombras':
      return alturaPorSombraConPasos(datos.alturaVara, datos.sombraVara, datos.sombraObjeto, unidad || 'm');

    case 'semejanza': {
      const { lados, k, pide, indiceLado } = datos;
      const efecto = efectoSobreAreaYPerimetro(k);

      if (Number.isNaN(efecto.razon) || !esTrianguloValido(lados[0], lados[1], lados[2])) {
        return {
          valor: NaN,
          pasos: [],
          error: 'La razón de semejanza debe ser mayor que cero y los tres lados deben cerrar un triángulo.',
        };
      }

      if (pide === 'lado') {
        const original = lados[indiceLado];
        const valor = original * k;
        return {
          valor,
          pasos: [
            `En dos figuras semejantes de razón k = ${num(k)}, cada lado de la segunda es el correspondiente de la primera multiplicado por k.`,
            `El lado ${NOMBRES_LADO[indiceLado] ?? 'buscado'} mide ${num(original)}${sufijo} en la figura original.`,
            `Lado semejante = ${num(original)} · ${num(k)} = ${num(redondear(valor, 2))}${sufijo}.`,
            'Los ángulos, en cambio, no cambian: la semejanza conserva la forma y solo altera el tamaño.',
          ],
          error: null,
        };
      }

      if (pide === 'perimetro') {
        const original = perimetro(lados);
        const valor = original * k;
        return {
          valor,
          pasos: [
            `Perímetro original = ${num(lados[0])} + ${num(lados[1])} + ${num(lados[2])} = ${num(redondear(original, 2))}${sufijo}.`,
            'El perímetro es una suma de longitudes, y cada longitud queda multiplicada por k, así que el perímetro también se multiplica por k (no por k²).',
            `Perímetro semejante = ${num(redondear(original, 2))} · ${num(k)} = ${num(redondear(valor, 2))}${sufijo}.`,
          ],
          error: null,
        };
      }

      const areaOriginal = areaHeron(lados[0], lados[1], lados[2]);
      const valorArea = areaOriginal * efecto.factorArea;
      return {
        valor: valorArea,
        pasos: [
          `Área original por la fórmula de Herón, con lados ${num(lados[0])}, ${num(lados[1])} y ${num(lados[2])}: ${num(redondear(areaOriginal, 2))}${sufijo}.`,
          `Aquí está el error clásico: el área NO se multiplica por k, sino por k². Un área es el producto de dos longitudes y las dos crecen a la vez.`,
          `k² = ${num(k)}² = ${num(redondear(efecto.factorArea, 4))}.`,
          `Área semejante = ${num(redondear(areaOriginal, 2))} · ${num(redondear(efecto.factorArea, 4))} = ${num(redondear(valorArea, 2))}${sufijo}.`,
        ],
        error: null,
      };
    }

    case 'escalas': {
      const { modo, medida, unidadEntrada, escala, unidadSalida } = datos;
      const enCentimetros = aCentimetros(medida, unidadEntrada);

      if (!esLongitudValida(enCentimetros) || !esLongitudValida(escala)) {
        return {
          valor: NaN,
          pasos: [],
          error: 'La medida y el denominador de la escala deben ser números mayores que cero.',
        };
      }

      if (modo === 'aReal') {
        const realCm = medidaReal(enCentimetros, escala);
        const valor = desdeCentimetros(realCm, unidadSalida);
        return {
          valor,
          pasos: [
            `La escala 1:${num(escala)} significa que 1 unidad sobre el plano equivale a ${num(escala)} unidades en la realidad.`,
            `Paso la medida del plano a centímetros: ${num(medida)} ${unidadEntrada} = ${num(redondear(enCentimetros, 4))} cm.`,
            `Multiplico por el denominador de la escala: ${num(redondear(enCentimetros, 4))} · ${num(escala)} = ${num(redondear(realCm, 2))} cm.`,
            `Convierto a la unidad pedida: ${num(redondear(realCm, 2))} cm = ${num(redondear(valor, 4))} ${unidadSalida}.`,
          ],
          error: null,
        };
      }

      const planoCm = medidaEnPlano(enCentimetros, escala);
      const valor = desdeCentimetros(planoCm, unidadSalida);
      return {
        valor,
        pasos: [
          `La escala 1:${num(escala)} reduce la realidad ${num(escala)} veces al pasarla al plano.`,
          `Paso la medida real a centímetros: ${num(medida)} ${unidadEntrada} = ${num(redondear(enCentimetros, 4))} cm.`,
          `Divido entre el denominador de la escala: ${num(redondear(enCentimetros, 4))} / ${num(escala)} = ${num(redondear(planoCm, 4))} cm.`,
          `Convierto a la unidad pedida: ${num(redondear(planoCm, 4))} cm = ${num(redondear(valor, 4))} ${unidadSalida}.`,
        ],
        error: null,
      };
    }
  }
}

interface DefinicionCaso {
  id: number;
  nivel: NivelCaso;
  titulo: string;
  enunciado: string;
  unidad: string;
  datos: DatosCaso;
}

/**
 * Los 12 casos son FIJOS y deterministas a propósito: el caso 3 tiene que ser el
 * mismo para toda la clase, o «resuelve los casos 3, 7 y 11» deja de funcionar
 * como tarea. Aquí solo se escriben los DATOS y el enunciado; la solución y los
 * pasos los calcula `resolverCaso`, para que nunca puedan contradecir al motor.
 */
const DEFINICIONES: DefinicionCaso[] = [
  {
    id: 1,
    nivel: 'basico',
    titulo: 'Tres calles paralelas',
    enunciado:
      'Tres calles paralelas cortan a dos avenidas rectas. En la primera avenida, las calles determinan dos tramos consecutivos de 6 m y 9 m. En la segunda avenida, el tramo correspondiente al de 6 m mide 8 m. ¿Cuánto mide el otro tramo de la segunda avenida?',
    unidad: 'm',
    datos: { tipo: 'tales', a: 6, b: 9, aPrima: 8 },
  },
  {
    id: 2,
    nivel: 'basico',
    titulo: 'La sombra del árbol',
    enunciado:
      'A media tarde, una vara de 1,5 m clavada en el suelo proyecta una sombra de 2 m. A la misma hora, la sombra de un árbol cercano mide 9,2 m. ¿Cuál es la altura del árbol?',
    unidad: 'm',
    datos: { tipo: 'sombras', alturaVara: 1.5, sombraVara: 2, sombraObjeto: 9.2 },
  },
  {
    id: 3,
    nivel: 'basico',
    titulo: 'Plano de una vivienda 1:50',
    enunciado:
      'En el plano de una vivienda dibujado a escala 1:50, la pared larga del salón mide 7,4 cm. ¿Cuántos metros mide esa pared en la realidad?',
    unidad: 'm',
    datos: { tipo: 'escalas', modo: 'aReal', medida: 7.4, unidadEntrada: 'cm', escala: 50, unidadSalida: 'm' },
  },
  {
    id: 4,
    nivel: 'medio',
    titulo: 'La ampliación del cartel',
    enunciado:
      'Un cartel triangular tiene lados de 6 cm, 8 cm y 10 cm. Se amplía con una razón de semejanza k = 2,5. ¿Cuál es el ÁREA del cartel ampliado, en cm²? (Piensa bien por cuánto se multiplica un área.)',
    unidad: 'cm²',
    datos: { tipo: 'semejanza', lados: [6, 8, 10], k: 2.5, pide: 'area', indiceLado: 0 },
  },
  {
    id: 5,
    nivel: 'medio',
    titulo: 'Paralelas y secantes',
    enunciado:
      'Tres rectas paralelas cortan a dos secantes. En la primera secante determinan segmentos de 4,5 cm y 7,5 cm. En la segunda, el segmento correspondiente al de 4,5 cm mide 6 cm. ¿Cuánto mide el segmento correspondiente al de 7,5 cm?',
    unidad: 'cm',
    datos: { tipo: 'tales', a: 4.5, b: 7.5, aPrima: 6 },
  },
  {
    id: 6,
    nivel: 'medio',
    titulo: 'Triángulos semejantes: el lado que falta',
    enunciado:
      'Un triángulo tiene lados de 5 cm, 7 cm y 9 cm. Otro triángulo es semejante a él con razón k = 1,4. ¿Cuánto mide el lado que se corresponde con el de 7 cm?',
    unidad: 'cm',
    datos: { tipo: 'semejanza', lados: [5, 7, 9], k: 1.4, pide: 'lado', indiceLado: 1 },
  },
  {
    id: 7,
    nivel: 'medio',
    titulo: 'La torre del reloj',
    enunciado:
      'Una vara de 1,2 m proyecta una sombra de 0,9 m. A la misma hora, la sombra de la torre del reloj mide 21 m. ¿Qué altura tiene la torre?',
    unidad: 'm',
    datos: { tipo: 'sombras', alturaVara: 1.2, sombraVara: 0.9, sombraObjeto: 21 },
  },
  {
    id: 8,
    nivel: 'medio',
    titulo: 'Del mueble al plano',
    enunciado:
      'Quieres dibujar en un plano a escala 1:200 un mueble que mide 4,5 m de largo. ¿Cuántos centímetros medirá ese mueble en el plano?',
    unidad: 'cm',
    datos: { tipo: 'escalas', modo: 'aPlano', medida: 4.5, unidadEntrada: 'm', escala: 200, unidadSalida: 'cm' },
  },
  {
    id: 9,
    nivel: 'medio',
    titulo: 'Reducir el perímetro',
    enunciado:
      'Un triángulo de lados 5 cm, 7 cm y 9 cm se reduce con razón de semejanza k = 0,6. ¿Cuál es el perímetro del triángulo reducido?',
    unidad: 'cm',
    datos: { tipo: 'semejanza', lados: [5, 7, 9], k: 0.6, pide: 'perimetro', indiceLado: 0 },
  },
  {
    id: 10,
    nivel: 'avanzado',
    titulo: 'Decimales en las dos secantes',
    enunciado:
      'Tres paralelas cortan a dos secantes. En una determinan segmentos de 3,2 cm y 4,8 cm; en la otra, el segmento correspondiente al de 3,2 cm mide 5 cm. ¿Cuánto mide el cuarto segmento?',
    unidad: 'cm',
    datos: { tipo: 'tales', a: 3.2, b: 4.8, aPrima: 5 },
  },
  {
    id: 11,
    nivel: 'avanzado',
    titulo: 'Distancia en un mapa 1:25.000',
    enunciado:
      'En un mapa a escala 1:25.000, la distancia en línea recta entre dos pueblos es de 6,8 cm. ¿Cuántos kilómetros los separan en la realidad?',
    unidad: 'km',
    datos: { tipo: 'escalas', modo: 'aReal', medida: 6.8, unidadEntrada: 'cm', escala: 25_000, unidadSalida: 'km' },
  },
  {
    id: 12,
    nivel: 'avanzado',
    titulo: 'La pirámide, como Tales',
    enunciado:
      'Una vara de 2 m proyecta una sombra de 3 m. A la misma hora, la sombra de una pirámide, medida desde el centro de su base, alcanza los 219 m. ¿Qué altura tiene la pirámide?',
    unidad: 'm',
    datos: { tipo: 'sombras', alturaVara: 2, sombraVara: 3, sombraObjeto: 219 },
  },
];

/** Los 12 casos numerados, con su solución y sus pasos ya resueltos por el motor. */
export const CASOS: CasoTales[] = DEFINICIONES.map((definicion) => {
  const resultado = resolverCaso(definicion.datos, definicion.unidad);
  return {
    id: definicion.id,
    tipo: definicion.datos.tipo,
    nivel: definicion.nivel,
    titulo: definicion.titulo,
    enunciado: definicion.enunciado,
    unidad: definicion.unidad,
    datos: definicion.datos,
    solucion: redondear(resultado.valor, 4),
    pasos: resultado.pasos,
  };
});

/** Número de casos numerados. Se lee de la lista para que nunca quede desfasado. */
export const TOTAL_CASOS = CASOS.length;

// ============================================
// 7. EJERCICIO ALEATORIO
// ============================================

/**
 * Generador pseudoaleatorio con semilla (mulberry32).
 *
 * Con semilla, el ejercicio es reproducible: el mismo número devuelve siempre el
 * mismo enunciado, así que un profesor puede repartir semillas y seguir pudiendo
 * corregir. Sin semilla se toma una al azar y se devuelve junto al ejercicio.
 */
function generadorConSemilla(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function elegir<T>(azar: () => number, opciones: readonly T[]): T {
  return opciones[Math.floor(azar() * opciones.length)];
}

const OBJETOS_SOMBRA = ['un poste de luz', 'una antena', 'un edificio', 'una palmera', 'un mástil', 'una chimenea'];

export interface EjercicioAleatorio {
  /** Semilla con la que se generó: repetirla reproduce el mismo ejercicio. */
  semilla: number;
  caso: CasoTales;
}

/**
 * Genera un ejercicio nuevo del mismo tipo que los casos numerados, con valores
 * elegidos para que la solución salga limpia (no un 7,3846…): los factores se
 * escogen entre múltiplos sencillos, no al azar sobre los cuatro datos a la vez.
 */
export function generarEjercicioAleatorio(semilla?: number): EjercicioAleatorio {
  const semillaUsada =
    typeof semilla === 'number' && Number.isFinite(semilla)
      ? Math.floor(Math.abs(semilla))
      : Math.floor(Math.random() * 1_000_000);
  const azar = generadorConSemilla(semillaUsada);
  const tipo = elegir<TipoCaso>(azar, ['tales', 'semejanza', 'sombras', 'escalas']);

  let datos: DatosCaso;
  let enunciado: string;
  let unidad: string;
  let titulo: string;

  if (tipo === 'tales') {
    const a = elegir(azar, [3, 4, 5, 6, 8, 9]);
    const factor = elegir(azar, [1.5, 2, 2.5, 3]);
    const razon = elegir(azar, [0.5, 1.5, 2, 2.5]);
    const b = redondear(a * factor, 2);
    const aPrima = redondear(a * razon, 2);
    datos = { tipo: 'tales', a, b, aPrima };
    unidad = 'cm';
    titulo = 'Tales: el cuarto proporcional';
    enunciado = `Tres rectas paralelas cortan a dos secantes. En la primera determinan segmentos de ${num(a)} cm y ${num(b)} cm. En la segunda, el segmento correspondiente al de ${num(a)} cm mide ${num(aPrima)} cm. ¿Cuánto mide el segmento correspondiente al de ${num(b)} cm?`;
  } else if (tipo === 'sombras') {
    const alturaVara = elegir(azar, [1, 1.2, 1.5, 2]);
    const sombraVara = elegir(azar, [0.8, 1, 1.2, 1.5, 2, 2.5]);
    const multiplo = elegir(azar, [4, 5, 6, 7, 8, 10, 12]);
    const sombraObjeto = redondear(sombraVara * multiplo, 2);
    const objeto = elegir(azar, OBJETOS_SOMBRA);
    datos = { tipo: 'sombras', alturaVara, sombraVara, sombraObjeto };
    unidad = 'm';
    titulo = 'Altura por sombras';
    enunciado = `Una vara de ${num(alturaVara)} m proyecta una sombra de ${num(sombraVara)} m. A la misma hora, la sombra de ${objeto} mide ${num(sombraObjeto)} m. ¿Qué altura tiene?`;
  } else if (tipo === 'escalas') {
    const escala = elegir(azar, [50, 100, 200, 500, 1000, 25_000, 50_000]);
    const haciaReal = azar() < 0.5;
    if (haciaReal) {
      const medida = elegir(azar, [2, 3.5, 4, 5.5, 6, 7.2, 8]);
      const unidadSalida: UnidadLongitud = escala >= 25_000 ? 'km' : 'm';
      datos = { tipo: 'escalas', modo: 'aReal', medida, unidadEntrada: 'cm', escala, unidadSalida };
      unidad = unidadSalida;
      titulo = 'Escala: del plano a la realidad';
      enunciado = `En un plano a escala 1:${num(escala)}, una medida es de ${num(medida)} cm. ¿A cuántos ${unidadSalida === 'km' ? 'kilómetros' : 'metros'} equivale en la realidad?`;
    } else {
      const medida = elegir(azar, [3, 4.5, 6, 7.5, 9, 12]);
      datos = { tipo: 'escalas', modo: 'aPlano', medida, unidadEntrada: 'm', escala, unidadSalida: 'cm' };
      unidad = 'cm';
      titulo = 'Escala: de la realidad al plano';
      enunciado = `Quieres dibujar a escala 1:${num(escala)} un objeto que mide ${num(medida)} m. ¿Cuántos centímetros medirá en el plano?`;
    }
  } else {
    const ladosBase: [number, number, number][] = [
      [3, 4, 5],
      [6, 8, 10],
      [5, 7, 9],
      [4, 6, 8],
      [5, 12, 13],
    ];
    const lados = elegir(azar, ladosBase);
    const k = elegir(azar, [0.5, 0.6, 1.5, 2, 2.5, 3]);
    const pide = elegir<MagnitudPedida>(azar, ['lado', 'perimetro', 'area']);
    const indiceLado = Math.floor(azar() * 3);
    datos = { tipo: 'semejanza', lados, k, pide, indiceLado };
    unidad = pide === 'area' ? 'cm²' : 'cm';
    titulo = 'Semejanza de triángulos';
    const pregunta =
      pide === 'lado'
        ? `¿Cuánto mide el lado que se corresponde con el de ${num(lados[indiceLado])} cm?`
        : pide === 'perimetro'
          ? '¿Cuál es el perímetro del triángulo semejante?'
          : '¿Cuál es el área del triángulo semejante, en cm²?';
    enunciado = `Un triángulo tiene lados de ${num(lados[0])} cm, ${num(lados[1])} cm y ${num(lados[2])} cm. Otro triángulo es semejante a él con razón k = ${num(k)}. ${pregunta}`;
  }

  const resultado = resolverCaso(datos, unidad);

  return {
    semilla: semillaUsada,
    caso: {
      id: 0,
      tipo,
      nivel: 'medio',
      titulo,
      enunciado,
      unidad,
      datos,
      solucion: redondear(resultado.valor, 4),
      pasos: resultado.pasos,
    },
  };
}

// ============================================
// 8. CORRECCIÓN DE RESPUESTAS
// ============================================

/** Margen absoluto mínimo: ±0,01 en la unidad del enunciado. */
export const TOLERANCIA_ABSOLUTA = 0.01;
/** Margen relativo: ±1 % del valor esperado, para que los resultados grandes no exijan cuatro decimales. */
export const TOLERANCIA_RELATIVA = 0.01;

export type MotivoVeredicto = 'correcta' | 'cerca' | 'incorrecta' | 'sin-numero';

export interface Veredicto {
  correcta: boolean;
  motivo: MotivoVeredicto;
  esperado: number;
  /** Diferencia absoluta entre lo respondido y lo esperado. NaN si no había número. */
  desviacion: number;
  /** Margen aceptado, en la unidad del enunciado. */
  margen: number;
}

/**
 * Compara la respuesta del usuario con la esperada.
 *
 * El margen es el MAYOR entre ±0,01 y ±1 %: un resultado de 146 m no puede exigir
 * dos decimales exactos, y uno de 0,05 cm no puede aceptar un 1 % que sería
 * indistinguible de cualquier cosa. Devuelve el motivo en vez de un mensaje ya
 * redactado para que la vista lo formatee en español con `formatNumber`.
 */
export function comprobarRespuesta(valorUsuario: number, valorEsperado: number): Veredicto {
  if (!Number.isFinite(valorEsperado)) {
    return { correcta: false, motivo: 'sin-numero', esperado: valorEsperado, desviacion: NaN, margen: NaN };
  }

  const margen = Math.max(TOLERANCIA_ABSOLUTA, Math.abs(valorEsperado) * TOLERANCIA_RELATIVA);

  if (!Number.isFinite(valorUsuario)) {
    return { correcta: false, motivo: 'sin-numero', esperado: valorEsperado, desviacion: NaN, margen };
  }

  const desviacion = Math.abs(valorUsuario - valorEsperado);

  if (desviacion <= margen) {
    return { correcta: true, motivo: 'correcta', esperado: valorEsperado, desviacion, margen };
  }

  // «Cerca» abarca hasta cinco veces el margen: casi siempre es un redondeo
  // intermedio, y merece un aviso distinto al de haber planteado mal la proporción.
  if (desviacion <= margen * 5) {
    return { correcta: false, motivo: 'cerca', esperado: valorEsperado, desviacion, margen };
  }

  return { correcta: false, motivo: 'incorrecta', esperado: valorEsperado, desviacion, margen };
}
