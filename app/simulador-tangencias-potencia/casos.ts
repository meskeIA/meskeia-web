/**
 * Casos para clase de potencia y tangencias — 12 fijos y un modo práctica reproducible.
 *
 * Fuera de la vista y sin React por la misma razón que `motor.ts`: corrigen lo que teclea el
 * alumno, y una fórmula cambiada daría por buena una respuesta mala sin que nada lo delatara.
 * La aritmética NO se replica: cada respuesta sale de las funciones de `motor.ts` que también
 * alimentan el panel de medidas del simulador, así que la app no puede suspender un número que
 * ella misma enseña.
 *
 * CONVENIOS
 *   · Potencia = d² − r², con su signo (negativa si el punto es interior). Es la definición de
 *     cualquier libro de Dibujo Técnico; la de «producto de segmentos con signo» da lo mismo.
 *   · El eje radical se mide desde el centro de la PRIMERA circunferencia que nombra el
 *     enunciado. Medirlo desde la otra es el error con nombre propio `desde-el-otro-centro`.
 *   · Ángulos en grados. Longitudes en la unidad del enunciado.
 *   · Todos los datos se eligen para que la respuesta salga exacta (≤ 2 decimales).
 *
 * Probado en `tests/apps/simulador-tangencias-potencia.spec.ts`.
 */

import { corregirNumero, dentroDeTolerancia, redondearA, toleranciaRelativa } from '@/lib/calculadoras/correctorCasosAula';
import { formatNumber } from '@/lib/formatters';
import {
  anguloEntreTangentes,
  distanciaEjeRadical,
  longitudTangente,
  mediaProporcional,
  potenciaDesdeDistancia,
  tramoTangenteExterior,
  tramoTangenteInterior,
} from './motor';

// ============================================
// 1. TIPOS
// ============================================

export type DatosCaso =
  | { tipo: 'potencia'; d: number; r: number }
  | { tipo: 'tangente'; d: number; r: number }
  | { tipo: 'secante-tangente'; pa: number; pb: number }
  | { tipo: 'secante-segmento'; pa: number; pt: number }
  | { tipo: 'angulo-tangentes'; d: number; r: number }
  | { tipo: 'eje-radical'; d: number; r1: number; r2: number }
  | { tipo: 'comun-exterior'; d: number; r1: number; r2: number }
  | { tipo: 'comun-interior'; d: number; r1: number; r2: number }
  | { tipo: 'ppr'; ma: number; mb: number };

export type TipoCaso = DatosCaso['tipo'];

export interface CasoTangencias {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  unidad: string;
  /** Qué se escribe en la casilla, con su unidad. */
  etiquetaRespuesta: string;
  /** Calculada por el motor desde `datos`, nunca escrita a mano. */
  respuesta: number;
  pasos: string[];
  pista: string;
}

export interface ResultadoCaso {
  ok: boolean;
  valor: number;
  pasos: string[];
  error: string | null;
}

// ============================================
// 2. RESOLUCIÓN (la misma para los fijos y los aleatorios)
// ============================================

/** Cifra en formato español con los decimales que de verdad tiene (hasta 2): «6», «5,6», «3,25». */
export function cifra(valor: number): string {
  const r = redondearA(valor, 2);
  const decimales = redondearA(r, 0) === r ? 0 : redondearA(r, 1) === r ? 1 : 2;
  return formatNumber(r, decimales);
}

const n = cifra;

export function resolverCaso(datos: DatosCaso, unidad = 'cm'): ResultadoCaso {
  const u = unidad;
  let valor = NaN;
  let pasos: string[] = [];
  switch (datos.tipo) {
    case 'potencia': {
      const { d, r } = datos;
      valor = potenciaDesdeDistancia(d, r);
      pasos = [
        'La potencia de un punto respecto de una circunferencia es d² − r², con d la distancia al centro.',
        `d² = ${n(d)}² = ${n(d * d)} · r² = ${n(r)}² = ${n(r * r)}`,
        `Potencia = ${n(d * d)} − ${n(r * r)} = ${n(valor)} ${u}²`,
        valor < 0 ? 'Sale negativa porque el punto está DENTRO de la circunferencia (d < r).' : 'Sale positiva porque el punto está FUERA de la circunferencia (d > r).',
      ];
      break;
    }
    case 'tangente': {
      const { d, r } = datos;
      valor = longitudTangente(d, r);
      pasos = [
        'El radio en el punto de contacto es perpendicular a la tangente: el triángulo centro–punto de contacto–punto exterior es rectángulo.',
        `La hipotenusa es la distancia al centro (${n(d)}) y un cateto es el radio (${n(r)}).`,
        `Tangente = √(${n(d)}² − ${n(r)}²) = √(${n(d * d)} − ${n(r * r)}) = √${n(d * d - r * r)} = ${n(valor)} ${u}`,
      ];
      break;
    }
    case 'secante-tangente': {
      const { pa, pb } = datos;
      valor = mediaProporcional(pa, pb);
      pasos = [
        'La potencia del punto es la misma para la secante y para la tangente: PT² = PA · PB.',
        `PT² = ${n(pa)} · ${n(pb)} = ${n(pa * pb)}`,
        `PT = √${n(pa * pb)} = ${n(valor)} ${u}`,
      ];
      break;
    }
    case 'secante-segmento': {
      const { pa, pt } = datos;
      valor = pa > 0 ? (pt * pt) / pa : NaN;
      pasos = [
        'La potencia del punto es la misma para la secante y para la tangente: PA · PB = PT².',
        `PT² = ${n(pt)}² = ${n(pt * pt)}`,
        `PB = PT² / PA = ${n(pt * pt)} / ${n(pa)} = ${n(valor)} ${u}`,
        'PB es la distancia de P al punto de corte MÁS LEJANO: incluye el tramo PA y la cuerda AB.',
      ];
      break;
    }
    case 'angulo-tangentes': {
      const { d, r } = datos;
      valor = anguloEntreTangentes(d, r);
      pasos = [
        'La recta que une el punto con el centro es bisectriz del ángulo que forman las dos tangentes.',
        `En el triángulo rectángulo, el seno de la mitad del ángulo es radio / distancia = ${n(r)} / ${n(d)} = ${n(r / d)}`,
        `Mitad del ángulo = arcsen(${n(r / d)}) = ${n(valor / 2)}°`,
        `Ángulo entre las tangentes = 2 · ${n(valor / 2)}° = ${n(valor)}°`,
      ];
      break;
    }
    case 'eje-radical': {
      const { d, r1, r2 } = datos;
      valor = distanciaEjeRadical(d, r1, r2);
      pasos = [
        'En el eje radical las dos potencias son iguales. Llama x a la distancia desde el centro de la primera: x² − r₁² = (d − x)² − r₂².',
        'Al desarrollar, los x² se van: x = (d² + r₁² − r₂²) / (2d).',
        `x = (${n(d * d)} + ${n(r1 * r1)} − ${n(r2 * r2)}) / ${n(2 * d)} = ${n(d * d + r1 * r1 - r2 * r2)} / ${n(2 * d)} = ${n(valor)} ${u}`,
        `Comprobación: desde el centro de la segunda quedan ${n(d - valor)} ${u}, y ${n(valor)}² − ${n(r1)}² = ${n(valor * valor - r1 * r1)} = ${n(d - valor)}² − ${n(r2)}² = ${n((d - valor) * (d - valor) - r2 * r2)}.`,
      ];
      break;
    }
    case 'comun-exterior': {
      const { d, r1, r2 } = datos;
      valor = tramoTangenteExterior(d, r1, r2);
      const diferencia = Math.abs(r1 - r2);
      pasos = [
        'Desplaza la tangente exterior paralelamente hasta el centro de la menor: forma un triángulo rectángulo con la línea de centros.',
        `Su hipotenusa es la distancia entre centros (${n(d)}) y un cateto la DIFERENCIA de radios (${n(r1)} − ${n(r2)} = ${n(diferencia)}).`,
        `Tramo = √(${n(d)}² − ${n(diferencia)}²) = √(${n(d * d)} − ${n(diferencia * diferencia)}) = ${n(valor)} ${u}`,
      ];
      break;
    }
    case 'comun-interior': {
      const { d, r1, r2 } = datos;
      valor = tramoTangenteInterior(d, r1, r2);
      const suma = r1 + r2;
      pasos = [
        'Desplaza la tangente interior paralelamente hasta el centro de una de las dos: forma un triángulo rectángulo con la línea de centros.',
        `Su hipotenusa es la distancia entre centros (${n(d)}) y un cateto la SUMA de radios (${n(r1)} + ${n(r2)} = ${n(suma)}).`,
        `Tramo = √(${n(d)}² − ${n(suma)}²) = √(${n(d * d)} − ${n(suma * suma)}) = ${n(valor)} ${u}`,
      ];
      break;
    }
    case 'ppr': {
      const { ma, mb } = datos;
      valor = mediaProporcional(ma, mb);
      pasos = [
        'La recta AB es el eje radical de todas las circunferencias que pasan por A y B, así que M tiene la misma potencia respecto de todas: MA · MB.',
        'En la solución, el tramo de M al punto de tangencia T es la tangente desde M: MT² = MA · MB.',
        `MT² = ${n(ma)} · ${n(mb)} = ${n(ma * mb)} → MT = ${n(valor)} ${u}`,
        'Con el compás, ese radio llevado sobre r a los dos lados de M da los dos puntos de tangencia: hay dos soluciones.',
      ];
      break;
    }
  }
  if (!Number.isFinite(valor)) return { ok: false, valor: NaN, pasos, error: 'Los datos no forman una figura posible.' };
  return { ok: true, valor, pasos, error: null };
}

// ============================================
// 3. LOS 12 CASOS FIJOS
// ============================================

interface DefinicionCaso {
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  unidad: string;
  etiquetaRespuesta: string;
  pista: string;
}

const DEFINICIONES: DefinicionCaso[] = [
  {
    titulo: 'Potencia de un punto exterior',
    enunciado: 'Un punto P está a 10 cm del centro de una circunferencia de 6 cm de radio. ¿Cuál es la potencia de P respecto de la circunferencia?',
    categoria: 'abstracto',
    datos: { tipo: 'potencia', d: 10, r: 6 },
    unidad: 'cm',
    etiquetaRespuesta: 'Potencia, en cm²',
    pista: 'Potencia = d² − r².',
  },
  {
    titulo: 'Potencia de un punto interior',
    enunciado: 'Un punto P está a 3 cm del centro de una circunferencia de 5 cm de radio. ¿Cuál es su potencia? Escríbela con su signo.',
    categoria: 'abstracto',
    datos: { tipo: 'potencia', d: 3, r: 5 },
    unidad: 'cm',
    etiquetaRespuesta: 'Potencia con su signo, en cm²',
    pista: 'La fórmula es la misma, d² − r²; fíjate en qué es mayor.',
  },
  {
    titulo: 'Longitud de la tangente',
    enunciado: 'Desde un punto situado a 13 cm del centro de una circunferencia de 5 cm de radio se traza una tangente. ¿Cuánto mide el segmento desde el punto hasta el de contacto?',
    categoria: 'abstracto',
    datos: { tipo: 'tangente', d: 13, r: 5 },
    unidad: 'cm',
    etiquetaRespuesta: 'Segmento de tangencia, en cm',
    pista: 'El radio y la tangente forman un ángulo recto: Pitágoras.',
  },
  {
    titulo: 'Un camino tangente a una rotonda',
    enunciado: 'Una rotonda circular tiene 8 m de radio. Un camino recto sale de una farola situada a 17 m del centro de la rotonda y pasa rozando su borde. ¿Cuántos metros hay desde la farola hasta el punto donde el camino toca la rotonda?',
    categoria: 'aplicado',
    datos: { tipo: 'tangente', d: 17, r: 8 },
    unidad: 'm',
    etiquetaRespuesta: 'Distancia hasta el punto de contacto, en m',
    pista: 'El camino es tangente a la rotonda.',
  },
  {
    titulo: 'De la secante a la tangente',
    enunciado: 'Desde un punto exterior P, una secante corta a la circunferencia en A y B, con PA = 4 cm y PB = 9 cm. ¿Cuánto mide la tangente PT trazada desde P?',
    categoria: 'abstracto',
    datos: { tipo: 'secante-tangente', pa: 4, pb: 9 },
    unidad: 'cm',
    etiquetaRespuesta: 'Tangente PT, en cm',
    pista: 'PT² = PA · PB: los dos son la potencia de P.',
  },
  {
    titulo: 'De la tangente a la secante',
    enunciado: 'Desde un punto exterior P, la tangente PT mide 6 cm. Una secante que sale de P corta a la circunferencia primero en A, con PA = 3 cm, y después en B. ¿Cuánto mide PB?',
    categoria: 'abstracto',
    datos: { tipo: 'secante-segmento', pa: 3, pt: 6 },
    unidad: 'cm',
    etiquetaRespuesta: 'PB, en cm',
    pista: 'PA · PB = PT².',
  },
  {
    titulo: 'Ángulo entre las dos tangentes',
    enunciado: 'Desde un punto situado a 10 cm del centro de una circunferencia de 5 cm de radio se trazan las dos tangentes. ¿Qué ángulo forman entre sí?',
    categoria: 'abstracto',
    datos: { tipo: 'angulo-tangentes', d: 10, r: 5 },
    unidad: '°',
    etiquetaRespuesta: 'Ángulo, en grados',
    pista: 'La recta al centro parte el ángulo en dos; en cada mitad, seno = radio / distancia.',
  },
  {
    titulo: 'Eje radical de dos circunferencias exteriores',
    enunciado: 'Dos circunferencias de 4 cm y 2 cm de radio tienen sus centros a 10 cm. ¿A qué distancia del centro de la de 4 cm pasa el eje radical?',
    categoria: 'abstracto',
    datos: { tipo: 'eje-radical', d: 10, r1: 4, r2: 2 },
    unidad: 'cm',
    etiquetaRespuesta: 'Distancia desde el centro de la de 4 cm, en cm',
    pista: 'Iguala las potencias: x² − r₁² = (d − x)² − r₂².',
  },
  {
    titulo: 'La cuerda común de dos secantes',
    enunciado: 'Dos circunferencias de 4 cm y 3 cm de radio tienen sus centros a 5 cm y se cortan. ¿A qué distancia del centro de la de 4 cm está la cuerda común?',
    categoria: 'abstracto',
    datos: { tipo: 'eje-radical', d: 5, r1: 4, r2: 3 },
    unidad: 'cm',
    etiquetaRespuesta: 'Distancia desde el centro de la de 4 cm, en cm',
    pista: 'La cuerda común es el eje radical: misma fórmula.',
  },
  {
    titulo: 'Correa abierta entre dos poleas',
    enunciado: 'Una correa abierta une dos poleas de 15 cm y 5 cm de radio cuyos ejes están a 26 cm. ¿Cuánto mide cada tramo recto de la correa, entre los dos puntos donde toca a las poleas?',
    categoria: 'aplicado',
    datos: { tipo: 'comun-exterior', d: 26, r1: 15, r2: 5 },
    unidad: 'cm',
    etiquetaRespuesta: 'Tramo recto, en cm',
    pista: 'Correa abierta = tangente común exterior: interviene la diferencia de radios.',
  },
  {
    titulo: 'Correa cruzada entre dos poleas',
    enunciado: 'Una correa cruzada une dos poleas de 12 cm y 8 cm de radio cuyos ejes están a 25 cm. ¿Cuánto mide cada tramo recto de la correa?',
    categoria: 'aplicado',
    datos: { tipo: 'comun-interior', d: 25, r1: 12, r2: 8 },
    unidad: 'cm',
    etiquetaRespuesta: 'Tramo recto, en cm',
    pista: 'Correa cruzada = tangente común interior: interviene la suma de radios.',
  },
  {
    titulo: 'Circunferencia por dos puntos y tangente a una recta',
    enunciado: 'La recta que pasa por los puntos A y B corta a la recta r en M, con MA = 2 cm y MB = 8 cm. Las circunferencias que pasan por A y B y son tangentes a r la tocan en dos puntos. ¿A qué distancia de M está cada uno?',
    categoria: 'abstracto',
    datos: { tipo: 'ppr', ma: 2, mb: 8 },
    unidad: 'cm',
    etiquetaRespuesta: 'Distancia de M al punto de tangencia, en cm',
    pista: 'M es el centro radical: MT² = MA · MB.',
  },
];

export const CASOS: readonly CasoTangencias[] = DEFINICIONES.map((definicion, i) => {
  const resultado = resolverCaso(definicion.datos, definicion.unidad);
  return {
    id: i + 1,
    ...definicion,
    respuesta: resultado.valor,
    pasos: resultado.pasos,
  };
});

export const TOTAL_CASOS = CASOS.length;

// ============================================
// 4. MODO PRÁCTICA (reproducible por semilla)
// ============================================

/** splitmix32: mezcla la semilla antes de usarla, para que semillas pequeñas no den lo mismo. */
function generadorConSemilla(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x9e3779b9) >>> 0;
    let z = estado;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
    return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
  };
}

function elegir<T>(azar: () => number, opciones: readonly T[]): T {
  return opciones[Math.floor(azar() * opciones.length)];
}

/** Ternas pitagóricas (hipotenusa, cateto, cateto) para que las raíces salgan exactas. */
const TERNAS: readonly [number, number, number][] = [
  [5, 3, 4],
  [10, 6, 8],
  [13, 5, 12],
  [15, 9, 12],
  [17, 8, 15],
  [20, 12, 16],
  [25, 7, 24],
  [26, 10, 24],
  [29, 20, 21],
];

/** Parejas cuyo producto es un cuadrado perfecto. */
const PAREJAS_CUADRADO: readonly [number, number][] = [
  [1, 4],
  [1, 9],
  [2, 8],
  [2, 18],
  [3, 12],
  [4, 9],
  [4, 16],
  [5, 20],
  [9, 16],
  [3, 27],
];

export interface EjercicioAleatorio {
  semilla: number;
  caso: CasoTangencias;
}

export function generarEjercicioAleatorio(semilla?: number): EjercicioAleatorio {
  const semillaUsada =
    typeof semilla === 'number' && Number.isFinite(semilla) ? Math.floor(Math.abs(semilla)) : Math.floor(Math.random() * 1_000_000);
  const azar = generadorConSemilla(semillaUsada);
  const tipo = elegir<TipoCaso>(azar, ['potencia', 'tangente', 'secante-tangente', 'secante-segmento', 'eje-radical', 'comun-exterior', 'comun-interior', 'ppr']);

  let datos: DatosCaso;
  let titulo: string;
  let enunciado: string;
  let etiquetaRespuesta: string;
  let pista: string;

  switch (tipo) {
    case 'potencia': {
      const r = elegir(azar, [2, 3, 4, 5, 6, 7, 8]);
      const desplazamiento = elegir(azar, [-3, -2, -1, 1, 2, 3, 4, 5]);
      const d = Math.max(1, r + desplazamiento);
      datos = { tipo, d, r };
      titulo = 'Potencia de un punto';
      enunciado = `Un punto P está a ${n(d)} cm del centro de una circunferencia de ${n(r)} cm de radio. ¿Cuál es la potencia de P? Escríbela con su signo.`;
      etiquetaRespuesta = 'Potencia con su signo, en cm²';
      pista = 'Potencia = d² − r².';
      break;
    }
    case 'tangente': {
      const [d, r] = elegir(azar, TERNAS);
      datos = { tipo, d, r };
      titulo = 'Longitud de la tangente';
      enunciado = `Desde un punto situado a ${n(d)} cm del centro de una circunferencia de ${n(r)} cm de radio se traza una tangente. ¿Cuánto mide el segmento hasta el punto de contacto?`;
      etiquetaRespuesta = 'Segmento de tangencia, en cm';
      pista = 'Radio y tangente forman un ángulo recto.';
      break;
    }
    case 'secante-tangente': {
      const [pa, pb] = elegir(azar, PAREJAS_CUADRADO);
      datos = { tipo, pa, pb };
      titulo = 'De la secante a la tangente';
      enunciado = `Desde un punto exterior P, una secante corta a la circunferencia en A y B, con PA = ${n(pa)} cm y PB = ${n(pb)} cm. ¿Cuánto mide la tangente PT?`;
      etiquetaRespuesta = 'Tangente PT, en cm';
      pista = 'PT² = PA · PB.';
      break;
    }
    case 'secante-segmento': {
      const pt = elegir(azar, [4, 6, 8, 10, 12]);
      const divisores = [1, 2, 3, 4, 5, 6, 8, 9].filter((k) => k < pt && (pt * pt) % k === 0);
      const pa = elegir(azar, divisores);
      datos = { tipo, pa, pt };
      titulo = 'De la tangente a la secante';
      enunciado = `Desde un punto exterior P, la tangente PT mide ${n(pt)} cm. Una secante que sale de P corta a la circunferencia primero en A, con PA = ${n(pa)} cm, y después en B. ¿Cuánto mide PB?`;
      etiquetaRespuesta = 'PB, en cm';
      pista = 'PA · PB = PT².';
      break;
    }
    case 'eje-radical': {
      // Con d = 5 o 10 el denominador 2d es 10 o 20: la respuesta sale con dos decimales como mucho.
      const d = elegir(azar, [5, 10]);
      const r1 = elegir(azar, [2, 3, 4, 5]);
      const r2 = elegir(azar, [1, 2, 3, 4, 6].filter((x) => x !== r1));
      datos = { tipo, d, r1, r2 };
      titulo = 'Eje radical';
      enunciado = `Dos circunferencias de ${n(r1)} cm y ${n(r2)} cm de radio tienen sus centros a ${n(d)} cm. ¿A qué distancia del centro de la de ${n(r1)} cm pasa el eje radical?`;
      etiquetaRespuesta = `Distancia desde el centro de la de ${n(r1)} cm, en cm`;
      pista = 'x = (d² + r₁² − r₂²) / 2d.';
      break;
    }
    case 'comun-exterior': {
      const [d, diferencia] = elegir(azar, TERNAS);
      const r2 = elegir(azar, [2, 3, 4, 5]);
      const r1 = r2 + diferencia;
      datos = { tipo, d, r1, r2 };
      titulo = 'Tangente común exterior';
      enunciado = `Dos circunferencias de ${n(r1)} cm y ${n(r2)} cm de radio tienen sus centros a ${n(d)} cm. ¿Cuánto mide el tramo de una tangente común exterior entre los dos puntos de contacto?`;
      etiquetaRespuesta = 'Tramo exterior, en cm';
      pista = 'Interviene la diferencia de radios.';
      break;
    }
    case 'comun-interior': {
      // La suma de radios es un cateto de la terna; tiene que caber dos veces el radio menor.
      const terna = elegir(
        azar,
        TERNAS.filter(([, suma]) => suma >= 4),
      );
      const [d, suma] = terna;
      const r2 = elegir(azar, [1, 2, 3].filter((x) => x < suma / 2));
      const r1 = suma - r2;
      datos = { tipo, d, r1, r2 };
      titulo = 'Tangente común interior';
      enunciado = `Dos circunferencias de ${n(r1)} cm y ${n(r2)} cm de radio tienen sus centros a ${n(d)} cm. ¿Cuánto mide el tramo de una tangente común interior entre los dos puntos de contacto?`;
      etiquetaRespuesta = 'Tramo interior, en cm';
      pista = 'Interviene la suma de radios.';
      break;
    }
    default: {
      const [ma, mb] = elegir(azar, PAREJAS_CUADRADO);
      datos = { tipo: 'ppr', ma, mb };
      titulo = 'Por dos puntos y tangente a una recta';
      enunciado = `La recta AB corta a la recta r en M, con MA = ${n(ma)} cm y MB = ${n(mb)} cm. ¿A qué distancia de M tocan a r las circunferencias que pasan por A y B y son tangentes a r?`;
      etiquetaRespuesta = 'Distancia de M al punto de tangencia, en cm';
      pista = 'MT² = MA · MB.';
    }
  }

  const resultado = resolverCaso(datos, 'cm');
  return {
    semilla: semillaUsada,
    caso: {
      id: 0,
      titulo,
      enunciado,
      categoria: 'abstracto',
      datos,
      unidad: 'cm',
      etiquetaRespuesta,
      respuesta: resultado.valor,
      pasos: resultado.pasos,
      pista,
    },
  };
}

// ============================================
// 5. CORRECCIÓN
// ============================================

export type MotivoError = 'sin-raiz' | 'signo' | 'formula-cambiada' | 'desde-el-otro-centro' | 'negativa';

export interface Veredicto {
  estado: 'acierto' | 'fallo' | 'no-numerico' | 'imposible';
  /** Error con nombre propio del tema, si lo hay. */
  motivo: MotivoError | null;
  diferencia: number;
  tolerancia: number;
}

/** Tipos cuya respuesta es una longitud: no puede ser negativa. */
const ES_LONGITUD: Record<TipoCaso, boolean> = {
  potencia: false,
  tangente: true,
  'secante-tangente': true,
  'secante-segmento': true,
  'angulo-tangentes': false,
  'eje-radical': false,
  'comun-exterior': true,
  'comun-interior': true,
  ppr: true,
};

/**
 * Compara lo que escribe el alumno con la respuesta del caso. La tolerancia es la relativa del
 * corrector compartido (el mayor entre 0,01 y el 1 %), y los errores típicos del tema se nombran
 * comparando con `dentroDeTolerancia`, nunca con una resta propia.
 */
export function comprobarRespuesta(usuario: number, caso: Pick<CasoTangencias, 'datos' | 'respuesta'>): Veredicto {
  const esperado = caso.respuesta;
  const tolerancia = toleranciaRelativa(esperado);
  // La potencia puede ser negativa y la distancia al eje también (si el eje cae detrás del centro):
  // el dominio de la magnitud es el real, y el único imposible del tema, la longitud negativa, se
  // nombra aparte.
  const c = corregirNumero(usuario, esperado, { tolerancia, magnitud: 'real' });
  if (c.estado === 'no-numerico') return { estado: 'no-numerico', motivo: null, diferencia: NaN, tolerancia };
  if (c.estado === 'acierto') return { estado: 'acierto', motivo: null, diferencia: c.diferencia, tolerancia };
  if (ES_LONGITUD[caso.datos.tipo] && usuario < 0) {
    return { estado: 'imposible', motivo: 'negativa', diferencia: c.diferencia, tolerancia };
  }

  const cerca = (objetivo: number) => Number.isFinite(objetivo) && dentroDeTolerancia(usuario, objetivo, toleranciaRelativa(objetivo));
  let motivo: MotivoError | null = null;
  const datos = caso.datos;
  switch (datos.tipo) {
    case 'potencia':
      if (cerca(-esperado) && esperado !== 0) motivo = 'signo';
      break;
    case 'tangente':
    case 'secante-tangente':
    case 'ppr':
      if (cerca(esperado * esperado)) motivo = 'sin-raiz';
      break;
    case 'comun-exterior':
      if (cerca(tramoTangenteInterior(datos.d, datos.r1, datos.r2))) motivo = 'formula-cambiada';
      break;
    case 'comun-interior':
      if (cerca(tramoTangenteExterior(datos.d, datos.r1, datos.r2))) motivo = 'formula-cambiada';
      break;
    case 'eje-radical':
      if (cerca(datos.d - esperado)) motivo = 'desde-el-otro-centro';
      break;
    default:
      break;
  }
  return { estado: 'fallo', motivo, diferencia: c.diferencia, tolerancia };
}

export const TEXTO_MOTIVO: Record<MotivoError, string> = {
  'sin-raiz': 'Has dado el cuadrado: eso es la potencia. La tangente es su raíz cuadrada.',
  signo: 'El valor es correcto, pero el signo no: la potencia es positiva fuera de la circunferencia y negativa dentro.',
  'formula-cambiada': 'Ese es el tramo de la OTRA familia de tangentes: la exterior usa la diferencia de radios y la interior la suma.',
  'desde-el-otro-centro': 'Has medido desde el centro de la otra circunferencia. Se pide desde la primera que nombra el enunciado.',
  negativa: 'Una longitud no puede ser negativa.',
};
