/**
 * Los 12 casos numerados de la Calculadora de Escalas.
 *
 * Resuelven llamando al MISMO motor que usa la calculadora (`./motor`), nunca con una
 * aritmética propia. Si divergieran, la app suspendería una respuesta que ella misma
 * produce, que es el peor fallo posible en algo que corrige a un alumno.
 *
 * POR QUÉ ESTA APP LOS LLEVA
 * ──────────────────────────
 * Las escalas son temario de 13-16 años por partida doble —proporcionalidad en matemáticas y
 * dibujo técnico—, y el canal de meskeIA que más crece es el de profesores que asignan una
 * app a su clase. Ese canal no premia que la herramienta sea bonita de manipular: premia que
 * el profesor pueda decir «entra y haz los casos 3, 7 y 11» y corregir igual para todo el
 * grupo. De ahí las dos condiciones que cumplen los doce:
 *
 * · DETERMINISTAS: el caso 3 es el mismo para todo el mundo, hoy y dentro de un año.
 * · UNIVERSALES: sin ciudades, sin países y sin monedas nacionales.
 *
 * LA TRAMPA QUE ORDENA LOS CASOS
 * ──────────────────────────────
 * El error clásico del tema no es equivocarse de operación: es aplicar el factor lineal a
 * una SUPERFICIE. En 1:50 las longitudes se dividen entre 50, pero las áreas entre 2.500, y
 * quien no lo ha visto escrito divide entre 50 y se queda tan tranquilo porque el número que
 * sale es perfectamente plausible. Por eso hay dos casos de superficie (el 7 y el 12), y el
 * 7 usa el mismo plano 1:50 del caso 1 para que la diferencia se vea en dos números y no en
 * una explicación.
 *
 * LAS RESPUESTAS NO SE ESCRIBEN A MANO
 * ────────────────────────────────────
 * Cada caso declara sus DATOS y `construirCaso` obtiene la solución ejecutando el motor. Un
 * caso con la respuesta tecleada podría contradecir a la calculadora sin que nada se queje.
 */

import { parseSpanishNumber } from '@/lib';
import {
  convertirSuperficie,
  deducirEscala,
  factorEntreEscalas,
  formatearNumero,
  medidaEnPlano,
  medidaReal,
  type Escala,
  type Unidad,
} from './motor';

// ============================================================
// TIPOS
// ============================================================

/** Qué pide un caso. Cada valor tiene su rama en `resolverCaso`. */
export type TipoCaso =
  | 'plano-a-real'
  | 'real-a-plano'
  | 'deducir-denominador'
  | 'factor-entre-escalas'
  | 'superficie-plano-a-real'
  | 'superficie-real-a-plano';

export interface DatosCaso {
  tipo: TipoCaso;
  escala?: Escala;
  escalaDestino?: Escala;
  valor?: number;
  unidadEntrada?: Unidad;
  unidadSalida?: Unidad;
  /** Para deducir una escala: la medida real y su unidad. */
  valorReal?: number;
  unidadReal?: Unidad;
}

export interface CasoEscala {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  /** Qué se escribe en la casilla. NUNCA vacía. */
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  /** Unidad del resultado, para mostrarla junto al número. Vacía si es adimensional. */
  unidad: string;
  pasos: readonly string[];
  pista: string;
  requiereRedondeo: boolean;
}

export interface Comprobacion {
  correcto: boolean;
  motivo: 'acierto' | 'fallo' | 'vacia' | 'no-numerico';
  diferencia?: number;
  tolerancia?: number;
}

export interface ResultadoCaso {
  ok: boolean;
  valor: number;
  error: string | null;
}

// ============================================================
// RESOLUCIÓN
// ============================================================

/**
 * Recalcula un caso desde sus datos, SIN mirar la respuesta declarada.
 *
 * Nada lanza: los datos incompletos salen como `{ ok: false }`.
 */
export function resolverCaso(datos: DatosCaso): ResultadoCaso {
  const sinDatos = { ok: false, valor: NaN, error: 'Faltan datos del caso' };

  switch (datos.tipo) {
    case 'plano-a-real': {
      if (
        datos.escala === undefined ||
        datos.valor === undefined ||
        datos.unidadEntrada === undefined ||
        datos.unidadSalida === undefined
      )
        return sinDatos;
      const r = medidaReal(datos.valor, datos.unidadEntrada, datos.escala, datos.unidadSalida);
      return { ok: r.ok, valor: r.valor, error: r.error };
    }
    case 'real-a-plano': {
      if (
        datos.escala === undefined ||
        datos.valor === undefined ||
        datos.unidadEntrada === undefined ||
        datos.unidadSalida === undefined
      )
        return sinDatos;
      const r = medidaEnPlano(datos.valor, datos.unidadEntrada, datos.escala, datos.unidadSalida);
      return { ok: r.ok, valor: r.valor, error: r.error };
    }
    case 'deducir-denominador': {
      if (
        datos.valor === undefined ||
        datos.unidadEntrada === undefined ||
        datos.valorReal === undefined ||
        datos.unidadReal === undefined
      )
        return sinDatos;
      const r = deducirEscala(
        datos.valor,
        datos.unidadEntrada,
        datos.valorReal,
        datos.unidadReal,
      );
      return r.ok && r.escala !== null
        ? { ok: true, valor: r.escala.denominador, error: null }
        : { ok: false, valor: NaN, error: r.error };
    }
    case 'factor-entre-escalas': {
      if (datos.escala === undefined || datos.escalaDestino === undefined) return sinDatos;
      const factor = factorEntreEscalas(datos.escala, datos.escalaDestino);
      return Number.isFinite(factor)
        ? { ok: true, valor: factor, error: null }
        : { ok: false, valor: NaN, error: 'Las escalas no son válidas' };
    }
    case 'superficie-plano-a-real':
    case 'superficie-real-a-plano': {
      if (
        datos.escala === undefined ||
        datos.valor === undefined ||
        datos.unidadEntrada === undefined ||
        datos.unidadSalida === undefined
      )
        return sinDatos;
      const r = convertirSuperficie(
        datos.valor,
        datos.unidadEntrada,
        datos.escala,
        datos.unidadSalida,
        datos.tipo === 'superficie-plano-a-real' ? 'plano-a-real' : 'real-a-plano',
      );
      return { ok: r.ok, valor: r.valor, error: r.error };
    }
  }
}

// ============================================================
// COMPROBACIÓN
// ============================================================

/** El mayor entre 0,01 y el 1 % del valor. Mismo convenio que el resto del catálogo. */
export function toleranciaDe(valorEsperado: number): number {
  return Math.max(0.01, Math.abs(valorEsperado) * 0.01);
}

/**
 * Compara la respuesta con la esperada.
 *
 * El parseo va por `parseSpanishNumber` a través del motor: con `parseFloat`, «3,6» se
 * leería como 3 —se queda con el prefijo y tira el resto— y se suspendería una respuesta
 * correcta escrita en el formato del propio enunciado.
 */
export function comprobarRespuesta(respuestaUsuario: string, valorEsperado: number): Comprobacion {
  if (respuestaUsuario.trim() === '') return { correcto: false, motivo: 'vacia' };
  const valor = parseSpanishNumber(respuestaUsuario);
  if (!Number.isFinite(valor)) return { correcto: false, motivo: 'no-numerico' };
  const tolerancia = toleranciaDe(valorEsperado);
  const diferencia = Math.abs(valor - valorEsperado);
  return {
    correcto: diferencia <= tolerancia,
    motivo: diferencia <= tolerancia ? 'acierto' : 'fallo',
    diferencia,
    tolerancia,
  };
}

// ============================================================
// LOS 12 CASOS
// ============================================================

interface DefinicionCaso {
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  etiquetaRespuesta: string;
  unidad: string;
  pasos: readonly string[];
  pista: string;
  requiereRedondeo?: boolean;
}

const E = (numerador: number, denominador: number): Escala => ({ numerador, denominador });

const DEFINICIONES: readonly DefinicionCaso[] = [
  {
    titulo: 'Del plano a la realidad',
    enunciado:
      'En un plano a escala 1:50, un muro mide 7,2 cm. ¿Cuánto mide ese muro en la realidad, en metros?',
    categoria: 'aplicado',
    datos: {
      tipo: 'plano-a-real',
      escala: E(1, 50),
      valor: 7.2,
      unidadEntrada: 'cm',
      unidadSalida: 'm',
    },
    etiquetaRespuesta: 'Medida real',
    unidad: 'm',
    pasos: [
      'En 1:50 el dibujo es 50 veces más pequeño que la realidad, así que para ir del plano a la realidad se MULTIPLICA.',
      '7,2 cm × 50 = 360 cm.',
      '360 cm son 3,6 m, porque 1 m son 100 cm.',
    ],
    pista: 'Del plano a la realidad se agranda: multiplica por el denominador de la escala.',
  },
  {
    titulo: 'De la realidad al plano',
    enunciado:
      'Una fachada mide 4,5 m. ¿Cuántos centímetros mide dibujada en un plano a escala 1:100?',
    categoria: 'aplicado',
    datos: {
      tipo: 'real-a-plano',
      escala: E(1, 100),
      valor: 4.5,
      unidadEntrada: 'm',
      unidadSalida: 'cm',
    },
    etiquetaRespuesta: 'Medida en el plano',
    unidad: 'cm',
    pasos: [
      'De la realidad al plano se REDUCE: se divide entre el denominador.',
      '4,5 m ÷ 100 = 0,045 m.',
      '0,045 m son 4,5 cm. Atajo útil: en 1:100, cada metro real es exactamente 1 cm de plano.',
    ],
    pista: 'Pasa primero a centímetros y divide después, o al revés: el resultado es el mismo.',
  },
  {
    titulo: 'Deducir la escala',
    enunciado:
      'En un plano, una distancia dibujada de 3 cm corresponde a 6 m reales. ¿Cuál es el denominador de la escala? (Es decir, la escala es 1:¿cuánto?)',
    categoria: 'abstracto',
    datos: {
      tipo: 'deducir-denominador',
      valor: 3,
      unidadEntrada: 'cm',
      valorReal: 6,
      unidadReal: 'm',
    },
    etiquetaRespuesta: 'Denominador de la escala',
    unidad: '',
    pasos: [
      'Para comparar las dos medidas hay que ponerlas en la MISMA unidad: 6 m son 600 cm.',
      'La escala es la razón dibujo : realidad = 3 : 600.',
      'Se simplifica dividiendo los dos términos entre 3: 1 : 200.',
      'La escala es 1:200, así que el denominador es 200.',
    ],
    pista: 'Una escala compara dos medidas de la misma magnitud: pásalas a la misma unidad antes de dividir.',
  },
  {
    titulo: 'Una escala de ampliación',
    enunciado:
      'Una pieza mecánica mide 2,4 mm y se dibuja a escala 5:1 para poder acotarla. ¿Cuántos milímetros mide en el dibujo?',
    categoria: 'aplicado',
    datos: {
      tipo: 'real-a-plano',
      escala: E(5, 1),
      valor: 2.4,
      unidadEntrada: 'mm',
      unidadSalida: 'mm',
    },
    etiquetaRespuesta: 'Medida en el dibujo',
    unidad: 'mm',
    pasos: [
      '5:1 es una AMPLIACIÓN: el dibujo es 5 veces mayor que la pieza real.',
      '2,4 mm × 5 = 12 mm.',
      'Ojo al sentido: aquí se multiplica para ir al dibujo, justo al revés que en una reducción.',
    ],
    pista: 'Mira cuál de los dos números es mayor: si lo es el primero, el dibujo crece.',
  },
  {
    titulo: 'Maqueta ferroviaria H0',
    enunciado:
      'Un vagón real mide 26,1 m de largo. En la escala ferroviaria H0, que es 1:87, ¿cuántos centímetros mide su maqueta?',
    categoria: 'aplicado',
    datos: {
      tipo: 'real-a-plano',
      escala: E(1, 87),
      valor: 26.1,
      unidadEntrada: 'm',
      unidadSalida: 'cm',
    },
    etiquetaRespuesta: 'Largo de la maqueta',
    unidad: 'cm',
    pasos: [
      'La escala H0 reduce 87 veces, así que se divide entre 87.',
      '26,1 m = 2.610 cm.',
      '2.610 cm ÷ 87 = 30 cm.',
      'El 87 no es un número redondo por capricho: viene de que el ancho de vía H0 es la mitad del de la escala 1, que es 1:43,5.',
    ],
    pista: 'Pasa los metros a centímetros antes de dividir y el resultado sale redondo.',
  },
  {
    titulo: 'Redibujar a otra escala',
    enunciado:
      'Un plano está dibujado a 1:200 y hay que redibujarlo a 1:50. ¿Por cuánto hay que multiplicar todas sus medidas?',
    categoria: 'abstracto',
    datos: { tipo: 'factor-entre-escalas', escala: E(1, 200), escalaDestino: E(1, 50) },
    etiquetaRespuesta: 'Factor multiplicador',
    unidad: 'veces',
    pasos: [
      'Aquí no interviene ninguna medida real: es la razón entre las dos escalas.',
      'Factor = (1/50) ÷ (1/200) = 200/50 = 4.',
      'Todas las medidas del dibujo se multiplican por 4.',
      'Tiene sentido: 1:50 reduce menos que 1:200, así que el dibujo nuevo es más grande.',
    ],
    pista: 'Divide el denominador viejo entre el nuevo. Si el resultado es mayor que 1, el dibujo crece.',
  },
  {
    titulo: 'Superficie: la trampa del cuadrado',
    enunciado:
      'En el mismo plano 1:50 del caso 1, un salón ocupa 24 cm² sobre el papel. ¿Cuántos metros cuadrados mide en la realidad?',
    categoria: 'aplicado',
    datos: {
      tipo: 'superficie-plano-a-real',
      escala: E(1, 50),
      valor: 24,
      unidadEntrada: 'cm',
      unidadSalida: 'm',
    },
    etiquetaRespuesta: 'Superficie real',
    unidad: 'm²',
    pasos: [
      'Las SUPERFICIES no escalan con el factor, sino con su CUADRADO: si las longitudes se multiplican por 50, las áreas lo hacen por 50² = 2.500.',
      '24 cm² × 2.500 = 60.000 cm².',
      '60.000 cm² ÷ 10.000 = 6 m², porque 1 m² son 10.000 cm².',
      'Multiplicar por 50 en vez de por 2.500 habría dado 0,12 m², un salón del tamaño de una hoja: el número es absurdo, pero nada avisa si no se comprueba.',
    ],
    pista: 'Un cuadrado de 1 cm de lado pasa a ser uno de 50 cm: su área no se multiplica por 50, sino por 2.500.',
  },
  {
    titulo: 'Comprobar una puerta',
    enunciado:
      'Una puerta de paso mide 210 cm de alto. En un plano de detalle a escala 1:25, ¿cuántos centímetros mide dibujada?',
    categoria: 'aplicado',
    datos: {
      tipo: 'real-a-plano',
      escala: E(1, 25),
      valor: 210,
      unidadEntrada: 'cm',
      unidadSalida: 'cm',
    },
    etiquetaRespuesta: 'Altura en el plano',
    unidad: 'cm',
    pasos: [
      'La escala 1:25 reduce 25 veces, así que se divide entre 25.',
      '210 cm ÷ 25 = 8,4 cm.',
      'Como la entrada y la salida están las dos en centímetros, no hay ninguna conversión de unidad que hacer.',
    ],
    pista: 'Dividir entre 25 es lo mismo que multiplicar por 4 y dividir entre 100.',
  },
  {
    titulo: 'La escala de un mapa',
    enunciado:
      'En un mapa topográfico, 2 cm sobre el papel equivalen a 1 km de terreno. ¿Cuál es el denominador de la escala del mapa?',
    categoria: 'aplicado',
    datos: {
      tipo: 'deducir-denominador',
      valor: 2,
      unidadEntrada: 'cm',
      valorReal: 1,
      unidadReal: 'km',
    },
    etiquetaRespuesta: 'Denominador de la escala',
    unidad: '',
    pasos: [
      'Hay que llevar las dos medidas a la misma unidad: 1 km son 100.000 cm.',
      'La razón es 2 : 100.000.',
      'Se simplifica dividiendo entre 2: 1 : 50.000.',
      'Es una de las escalas cartográficas más habituales, junto con 1:25.000.',
    ],
    pista: 'Un kilómetro son mil metros, y cada metro cien centímetros: cien mil en total.',
  },
  {
    titulo: 'Una parcela en el plano',
    enunciado:
      'En un plano de urbanización a escala 1:1000, el lado de una parcela mide 12,5 cm. ¿Cuántos metros mide en la realidad?',
    categoria: 'aplicado',
    datos: {
      tipo: 'plano-a-real',
      escala: E(1, 1000),
      valor: 12.5,
      unidadEntrada: 'cm',
      unidadSalida: 'm',
    },
    etiquetaRespuesta: 'Medida real',
    unidad: 'm',
    pasos: [
      'Del plano a la realidad se multiplica por 1.000.',
      '12,5 cm × 1.000 = 12.500 cm.',
      '12.500 cm ÷ 100 = 125 m.',
      'Atajo: en 1:1000, cada centímetro del plano son 10 metros reales.',
    ],
    pista: 'Multiplica primero y convierte la unidad después; así solo hay una división al final.',
  },
  {
    titulo: 'Coche en miniatura',
    enunciado:
      'Un automóvil mide 4,3 m de largo. ¿Cuántos centímetros mide su miniatura a escala 1:43?',
    categoria: 'aplicado',
    datos: {
      tipo: 'real-a-plano',
      escala: E(1, 43),
      valor: 4.3,
      unidadEntrada: 'm',
      unidadSalida: 'cm',
    },
    etiquetaRespuesta: 'Largo de la miniatura',
    unidad: 'cm',
    pasos: [
      'La escala 1:43 reduce 43 veces.',
      '4,3 m = 430 cm.',
      '430 cm ÷ 43 = 10 cm.',
      'Por eso casi todas las miniaturas 1:43 miden alrededor de 10 cm: es la escala pensada para que quepan en una vitrina.',
    ],
    pista: 'El 43 del enunciado y el 4,3 del coche no son casualidad: el resultado sale exacto.',
  },
  {
    titulo: 'Del terreno al papel',
    enunciado:
      'Una parcela rectangular mide 600 m² y se dibuja en un plano a escala 1:500. ¿Cuántos centímetros cuadrados ocupa sobre el papel?',
    categoria: 'aplicado',
    datos: {
      tipo: 'superficie-real-a-plano',
      escala: E(1, 500),
      valor: 600,
      unidadEntrada: 'm',
      unidadSalida: 'cm',
    },
    etiquetaRespuesta: 'Superficie en el plano',
    unidad: 'cm²',
    pasos: [
      'De nuevo el CUADRADO del factor: las áreas se dividen entre 500² = 250.000.',
      '600 m² = 6.000.000 cm², porque 1 m² son 10.000 cm².',
      '6.000.000 cm² ÷ 250.000 = 24 cm².',
      'Es el camino inverso del caso 7, y sirve para comprobarlo: si allí 24 cm² de papel eran 6 m² reales en 1:50, aquí 600 m² reales son 24 cm² de papel en 1:500.',
    ],
    pista: 'Eleva el denominador al cuadrado antes de dividir, y no olvides que 1 m² son 10.000 cm².',
  },
];

/**
 * Construye un caso resolviéndolo con el motor.
 *
 * `respuesta` sale SIEMPRE de `resolverCaso`, nunca de `DEFINICIONES`: así un cambio en el
 * motor arrastra la solución consigo en vez de dejar el caso corrigiendo con un número viejo.
 */
function construirCaso(definicion: DefinicionCaso, indice: number): CasoEscala {
  const resultado = resolverCaso(definicion.datos);
  return {
    id: indice + 1,
    titulo: definicion.titulo,
    enunciado: definicion.enunciado,
    categoria: definicion.categoria,
    datos: definicion.datos,
    etiquetaRespuesta: definicion.etiquetaRespuesta,
    respuesta: resultado.valor,
    respuestaTexto: formatearNumero(resultado.valor),
    unidad: definicion.unidad,
    pasos: definicion.pasos,
    pista: definicion.pista,
    requiereRedondeo: definicion.requiereRedondeo === true,
  };
}

/** Los 12 casos fijos, con ids 1..12 sin huecos. */
export const CASOS: readonly CasoEscala[] = DEFINICIONES.map(construirCaso);

export const TOTAL_CASOS = CASOS.length;

// ============================================================
// PRÁCTICA SIN FINAL
// ============================================================

export interface EjercicioEscala {
  enunciado: string;
  etiquetaRespuesta: string;
  unidad: string;
  respuesta: number;
  respuestaTexto: string;
  pasos: readonly string[];
}

/** Generador congruente lineal: misma semilla, misma secuencia. */
function generadorDeterminista(semilla: number): () => number {
  let estado = semilla >>> 0 || 1;
  return () => {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}

/**
 * Un ejercicio nuevo cada vez, resuelto por el MISMO motor que los doce fijos.
 *
 * Los datos se sortean para que la respuesta salga limpia: el denominador viene de la serie
 * normalizada y la medida del plano es un número con un solo decimal. Si el aleatorio
 * corrigiera con otra regla que los fijos, el alumno entrenaría con una y sería evaluado con
 * otra.
 */
export function generarEjercicioAleatorio(semilla?: number): EjercicioEscala {
  const aleatorio = generadorDeterminista(semilla ?? Math.floor(Math.random() * 1e9) + 1);

  const denominadores = [20, 25, 50, 100, 200, 500];
  const denominador = denominadores[Math.floor(aleatorio() * denominadores.length)];
  const escala: Escala = { numerador: 1, denominador };
  const haciaLaRealidad = aleatorio() < 0.5;

  if (haciaLaRealidad) {
    const medida = Math.round((aleatorio() * 180 + 20)) / 10; // 2,0 a 20,0 cm
    const datos: DatosCaso = {
      tipo: 'plano-a-real',
      escala,
      valor: medida,
      unidadEntrada: 'cm',
      unidadSalida: 'm',
    };
    const resultado = resolverCaso(datos);
    return {
      enunciado: `En un plano a escala 1:${denominador}, una medida es de ${formatearNumero(medida)} cm. ¿Cuánto mide en la realidad, en metros?`,
      etiquetaRespuesta: 'Medida real',
      unidad: 'm',
      respuesta: resultado.valor,
      respuestaTexto: formatearNumero(resultado.valor),
      pasos: [
        `Del plano a la realidad se multiplica por el denominador: ${formatearNumero(medida)} cm × ${denominador}.`,
        `Son ${formatearNumero(medida * denominador)} cm.`,
        `Y en metros, ${formatearNumero(resultado.valor)} m.`,
      ],
    };
  }

  const medida = Math.round(aleatorio() * 190 + 10) / 10; // 1,0 a 20,0 m
  const datos: DatosCaso = {
    tipo: 'real-a-plano',
    escala,
    valor: medida,
    unidadEntrada: 'm',
    unidadSalida: 'cm',
  };
  const resultado = resolverCaso(datos);
  return {
    enunciado: `Un elemento mide ${formatearNumero(medida)} m en la realidad. ¿Cuántos centímetros mide en un plano a escala 1:${denominador}?`,
    etiquetaRespuesta: 'Medida en el plano',
    unidad: 'cm',
    respuesta: resultado.valor,
    respuestaTexto: formatearNumero(resultado.valor),
    pasos: [
      `De la realidad al plano se divide entre el denominador: ${formatearNumero(medida)} m = ${formatearNumero(medida * 100)} cm.`,
      `${formatearNumero(medida * 100)} cm ÷ ${denominador}.`,
      `Son ${formatearNumero(resultado.valor)} cm.`,
    ],
  };
}
