/**
 * Motor de recomendación de selector-seguro-coche.
 *
 * Vive aparte, sin dependencias, para poder enumerar todas las combinaciones de respuestas sin
 * navegador: mismo patrón que `app/selector-mascota/motor.ts` (commit 934e57bc). Las preguntas
 * y sus pesos son los MISMOS que tenía la página; lo que cambia es el empate.
 *
 * EMPATES. Antes el ganador salía de un `reduce` con `>` estricto sobre las entradas del
 * objeto: a igualdad de puntos se quedaba la PRIMERA modalidad del objeto —terceros básico,
 * la de menos cobertura— sin decirlo. Ahora, a igualdad de puntos, va primero la que mejor
 * encaja con lo que has dicho sobre asumir una reparación de tu bolsillo (pregunta 9, el
 * centro de la decisión entre terceros y todo riesgo); si sigue el empate, la que mejor encaja
 * con el valor del coche (pregunta 2), y por último la de prima más baja. El empate se anuncia
 * en pantalla con el criterio que lo ha deshecho.
 */

export type Modalidad =
  | 'terceros_basico'
  | 'terceros_ampliado'
  | 'todo_riesgo_franquicia'
  | 'todo_riesgo_sin_franquicia';

export interface Opcion {
  texto: string;
  icono: string;
  pesos: Partial<Record<Modalidad, number>>;
}

export interface Pregunta {
  id: number;
  texto: string;
  icono: string;
  opciones: Opcion[];
}

export interface ResultadoInfo {
  titulo: string;
  descripcion: string;
  icono: string;
  coberturas: string[];
  advertencia: string;
}


export const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuántos años tiene tu vehículo?',
    icono: '📅',
    opciones: [
      {
        texto: 'Menos de 2 años (vehículo nuevo o casi nuevo)',
        icono: '🆕',
        pesos: { todo_riesgo_sin_franquicia: 3 },
      },
      {
        texto: 'Entre 2 y 5 años',
        icono: '🚗',
        pesos: { todo_riesgo_franquicia: 2, todo_riesgo_sin_franquicia: 1 },
      },
      {
        texto: 'Entre 5 y 10 años',
        icono: '🚙',
        pesos: { terceros_ampliado: 2, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'Más de 10 años',
        icono: '🏚️',
        pesos: { terceros_basico: 3, terceros_ampliado: 1 },
      },
    ],
  },
  {
    id: 2,
    texto: '¿Cuál es el valor de mercado aproximado de tu coche?',
    icono: '💶',
    opciones: [
      {
        texto: 'Más de 25.000 €',
        icono: '💎',
        pesos: { todo_riesgo_sin_franquicia: 3 },
      },
      {
        texto: 'Entre 10.000 € y 25.000 €',
        icono: '💰',
        pesos: { todo_riesgo_franquicia: 2, todo_riesgo_sin_franquicia: 1 },
      },
      {
        texto: 'Entre 3.000 € y 10.000 €',
        icono: '🪙',
        pesos: { terceros_ampliado: 2, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'Menos de 3.000 €',
        icono: '📉',
        pesos: { terceros_basico: 3 },
      },
    ],
  },
  {
    id: 3,
    texto: '¿El coche está financiado (préstamo o leasing)?',
    icono: '🏦',
    opciones: [
      {
        texto: 'Sí, sigue con financiación activa',
        icono: '✅',
        pesos: { todo_riesgo_sin_franquicia: 3, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'No, es de mi propiedad total',
        icono: '❌',
        pesos: { terceros_basico: 1, terceros_ampliado: 1, todo_riesgo_franquicia: 1 },
      },
    ],
  },
  {
    id: 4,
    texto: '¿Cuántos años llevas conduciendo?',
    icono: '🎓',
    opciones: [
      {
        texto: 'Menos de 2 años (conductor novel)',
        icono: '🟢',
        pesos: { todo_riesgo_sin_franquicia: 2, todo_riesgo_franquicia: 2 },
      },
      {
        texto: 'Entre 2 y 5 años',
        icono: '🟡',
        pesos: { todo_riesgo_franquicia: 2, terceros_ampliado: 1 },
      },
      {
        texto: 'Más de 5 años con experiencia sólida',
        icono: '🏆',
        pesos: { terceros_basico: 1, terceros_ampliado: 1 },
      },
    ],
  },
  {
    id: 5,
    texto: '¿Has tenido siniestros o partes en los últimos 3 años?',
    icono: '🚨',
    opciones: [
      {
        texto: 'No, ninguno',
        icono: '😊',
        pesos: { terceros_basico: 1, terceros_ampliado: 1 },
      },
      {
        texto: 'Uno leve (golpe pequeño, rayada)',
        icono: '😐',
        pesos: { todo_riesgo_franquicia: 2, terceros_ampliado: 1 },
      },
      {
        texto: 'Más de uno o alguno grave',
        icono: '😬',
        pesos: { todo_riesgo_sin_franquicia: 2, todo_riesgo_franquicia: 1 },
      },
    ],
  },
  {
    id: 6,
    texto: '¿Cuál es el uso principal del vehículo?',
    icono: '🛣️',
    opciones: [
      {
        texto: 'Uso particular ocasional (fines de semana)',
        icono: '🌅',
        pesos: { terceros_basico: 2, terceros_ampliado: 1 },
      },
      {
        texto: 'Uso diario (trabajo, familia)',
        icono: '🏢',
        pesos: { terceros_ampliado: 1, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'Uso profesional o comercial intensivo',
        icono: '🔧',
        pesos: { todo_riesgo_sin_franquicia: 2, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'Lo comparten varias personas (coche de empresa o familiar)',
        icono: '👨‍👩‍👧',
        pesos: { todo_riesgo_franquicia: 2, todo_riesgo_sin_franquicia: 1 },
      },
    ],
  },
  {
    id: 7,
    texto: '¿Conduces principalmente en zona urbana o rural?',
    icono: '🗺️',
    opciones: [
      {
        texto: 'Zona urbana con tráfico denso (ciudad)',
        icono: '🏙️',
        pesos: { todo_riesgo_franquicia: 2, todo_riesgo_sin_franquicia: 1 },
      },
      {
        texto: 'Zona semiurbana o mixta',
        icono: '🌆',
        pesos: { terceros_ampliado: 1, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'Principalmente carretera o zona rural',
        icono: '🌳',
        pesos: { terceros_basico: 1, terceros_ampliado: 2 },
      },
    ],
  },
  {
    id: 8,
    texto: '¿Tienes garaje o aparcamiento privado habitual?',
    icono: '🅿️',
    opciones: [
      {
        texto: 'Sí, siempre guardo el coche en garaje privado',
        icono: '✅',
        pesos: { terceros_basico: 1, terceros_ampliado: 1 },
      },
      {
        texto: 'A veces, pero también aparca en calle',
        icono: '🔄',
        pesos: { terceros_ampliado: 1, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'No, siempre en la calle o zona pública',
        icono: '❌',
        pesos: { terceros_ampliado: 2, todo_riesgo_franquicia: 1 },
      },
    ],
  },
  {
    id: 9,
    texto: '¿Podrías asumir una reparación importante de tu bolsillo si ocurriera un accidente?',
    icono: '💳',
    opciones: [
      {
        texto: 'Sí, sin problemas (tengo ahorro suficiente)',
        icono: '💪',
        pesos: { terceros_basico: 2, terceros_ampliado: 1 },
      },
      {
        texto: 'Podría asumir parte, pero no el total',
        icono: '😅',
        pesos: { todo_riesgo_franquicia: 3 },
      },
      {
        texto: 'No, sería un problema económico serio',
        icono: '😰',
        pesos: { todo_riesgo_sin_franquicia: 3 },
      },
    ],
  },
  {
    id: 10,
    texto: '¿Hay conductores menores de 25 años que usen habitualmente el coche?',
    icono: '👨‍🎓',
    opciones: [
      {
        texto: 'Sí, conductor/a joven o novel frecuente',
        icono: '🧑',
        pesos: { todo_riesgo_sin_franquicia: 2, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'Sí, esporádicamente',
        icono: '🔁',
        pesos: { todo_riesgo_franquicia: 2, terceros_ampliado: 1 },
      },
      {
        texto: 'No, solo conductores con experiencia',
        icono: '✅',
        pesos: { terceros_basico: 1, terceros_ampliado: 1 },
      },
    ],
  },
];

/*
 * LAS FICHAS DESCRIBEN LA MODALIDAD, NO A QUIÉN LE VA BIEN (hallazgos 1475, 1476, 1482-1484).
 * Antes cada descripción decía para quién era «ideal» («vehículos antiguos de bajo valor»,
 * «coches de valor medio», «vehículos nuevos, de alto valor»), y como la ficha es fija salía
 * igual a quien acababa de declarar lo contrario: un coche de menos de dos años y más de
 * 25.000 € recibía el básico «ideal para vehículos antiguos de bajo valor». Lo que depende de
 * lo declarado va aparte, en las NOTAS de `calcularResultado`.
 *
 * Fuera también lo que la póliza no garantiza por nombre: «Conductor designado sin recargo»
 * (a quien declara un conductor joven frecuente), «Cualquier daño queda cubierto» (la póliza
 * tiene límites y exclusiones) y las cifras sin fuente de la franquicia.
 *
 * La responsabilidad civil obligatoria cubre en todo el Espacio Económico Europeo con una sola
 * prima (RDL 8/2004, texto refundido de la LRCSCVM, art. 4.1, BOE-A-2004-18911), así que va en
 * la ficha de terceros: antes solo el todo riesgo decía cubrir «en el extranjero» (hallazgo 1482).
 */
export const RESULTADOS: Record<Modalidad, ResultadoInfo> = {
  terceros_basico: {
    titulo: 'Seguro a Terceros Básico',
    descripcion:
      'La cobertura mínima que exige la ley en España: la responsabilidad civil obligatoria, que paga los daños que causes a otras personas y a sus bienes. No cubre los daños de tu propio coche.',
    icono: '🛡️',
    coberturas: [
      'Responsabilidad civil obligatoria: daños a personas y a bienes de terceros, hasta los límites legales',
      'Esa misma cobertura en todo el Espacio Económico Europeo (EEE), con la misma prima',
      'Asistencia en viaje básica (según compañía)',
      'Defensa jurídica básica (según compañía)',
    ],
    advertencia:
      'No cubre los daños de tu coche: si el accidente es culpa tuya o no se identifica al responsable, la reparación la pagas tú.',
  },
  terceros_ampliado: {
    titulo: 'Seguro a Terceros Ampliado',
    descripcion:
      'Suma a la responsabilidad civil obligatoria la protección de tu propio coche ante robo, incendio, rotura de lunas y fenómenos naturales, pero no ante los daños por accidente.',
    icono: '🛡️',
    coberturas: [
      'Todo lo del terceros básico (responsabilidad civil válida en el EEE)',
      'Robo e intento de robo',
      'Incendio y explosión',
      'Rotura de lunas (parabrisas, luneta, laterales)',
      'Fenómenos naturales y daños por inundación',
      'Asistencia en carretera 24h',
    ],
    advertencia:
      'No incluye cobertura de daños propios por accidente. Si chocas por tu culpa, los daños en tu coche no quedarán cubiertos.',
  },
  todo_riesgo_franquicia: {
    titulo: 'Todo Riesgo con Franquicia',
    descripcion:
      'Cubre también los daños de tu coche en un accidente, aunque sea culpa tuya: en cada siniestro de daños propios pagas tú la franquicia pactada y la compañía, el resto.',
    icono: '🔰',
    coberturas: [
      'Todo lo incluido en terceros ampliado',
      'Daños propios por accidente (independientemente de la culpa)',
      'Daños en aparcamiento (golpes sin parte contrario)',
      'Actos vandálicos',
    ],
    advertencia:
      'En cada siniestro con daños propios pagas la franquicia pactada. Su importe cambia mucho de una póliza a otra: compáralo antes de contratar, junto con la prima.',
  },
  todo_riesgo_sin_franquicia: {
    titulo: 'Todo Riesgo sin Franquicia',
    descripcion:
      'La modalidad más amplia: cubre los daños de tu coche en un accidente sin franquicia a tu cargo, dentro de los límites y exclusiones que fije la póliza.',
    icono: '⭐',
    coberturas: [
      'Todo lo incluido en terceros ampliado',
      'Daños propios por accidente, sin franquicia a tu cargo',
      'Daños en aparcamiento y actos vandálicos',
      'Vehículo de sustitución (según póliza)',
    ],
    advertencia:
      'Es la modalidad más cara. Valora si la prima anual compensa respecto al valor real del vehículo.',
  },
};

/** Orden de declaración: SOLO para recorrer, nunca para desempatar. */
export const CLAVES: Modalidad[] = ['terceros_basico', 'terceros_ampliado', 'todo_riesgo_franquicia', 'todo_riesgo_sin_franquicia'];

/** Nombre con artículo, para las frases del aviso de empate. */
export const CON_ARTICULO: Record<Modalidad, string> = {
  terceros_basico: 'el seguro a terceros básico',
  terceros_ampliado: 'el seguro a terceros ampliado',
  todo_riesgo_franquicia: 'el todo riesgo con franquicia',
  todo_riesgo_sin_franquicia: 'el todo riesgo sin franquicia',
};

/**
 * De menos a más prima: cada modalidad incluye la cobertura de la anterior (así lo dicen sus
 * propias fichas), y el todo riesgo sin franquicia es «la opción más cara del mercado».
 */
export const ORDEN_PRIMA: Record<Modalidad, number> = {
  terceros_basico: 0,
  terceros_ampliado: 1,
  todo_riesgo_franquicia: 2,
  todo_riesgo_sin_franquicia: 3,
};

/** Las preguntas que deshacen un empate (su posición en PREGUNTAS), y cómo se dice cada una. */
const DESEMPATE: { indice: number; motivo: string }[] = [
  { indice: 8, motivo: 'encaja mejor con lo que has dicho sobre pagar una reparación de tu bolsillo' },
  { indice: 1, motivo: 'encaja mejor con el valor de tu coche' },
];

/**
 * LO DECLARADO QUE CHOCA CON LA RECOMENDACIÓN: NOTAS, NO FILTROS (hallazgos 1473-1477).
 *
 * La familia de los selectores filtra cuando el usuario declara una imposibilidad (un
 * presupuesto máximo, una alergia). Aquí ninguna respuesta lo es, y por eso cada una se DICE en
 * pantalla en vez de apartar modalidades:
 *
 *  · Financiación. La ley solo obliga a la responsabilidad civil (RDL 8/2004, art. 2.1); el
 *    todo riesgo, si acaso, lo exige el CONTRATO de préstamo o leasing, y no todos. Filtrar
 *    repondría el «todo riesgo obligatorio» que la guía decía y era falso (hallazgo 1478). Con
 *    una recomendación a terceros se avisa de revisar el contrato y se nombra el todo riesgo
 *    que mejor encaja (1473).
 *  · Valor. Que el coche valga poco o mucho no hace imposible ninguna modalidad: cambia lo que
 *    compensa. Como regla, el seguro indemniza según el valor del coche justo antes del
 *    siniestro (Ley 50/1980, art. 26), así que con menos de 3.000 € y un todo riesgo se avisa y
 *    se nombra el terceros que mejor encaja (1474); con un coche nuevo o de más de 25.000 € y
 *    un terceros, se recuerda que la reparación propia corre de su cuenta (1475).
 *  · Uso profesional y conductores menores de 25 años. No cambian la modalidad, cambian lo que
 *    hay que DECLARAR: si el riesgo se declaró inexacto, la prestación se reduce en proporción
 *    a la prima (Ley 50/1980, art. 10; art. 11 si cambia después de contratar) (1476, 1477).
 */
export type TipoNota = 'financiacion' | 'valor-bajo' | 'valor-alto' | 'uso-profesional' | 'conductor-joven';

export interface Nota {
  tipo: TipoNota;
  /** La modalidad que la nota propone comparar, cuando la hay. */
  alternativa?: Modalidad;
}

export interface Resultado {
  modalidad: Modalidad;
  puntos: Record<Modalidad, number>;
  /** Otras modalidades con la MISMA puntuación que la recomendada. */
  empatadas: Modalidad[];
  /** Frase que explica cómo se ha deshecho el empate; vacía si no lo hay. */
  criterioDesempate: string;
  /** Lo declarado que hay que decir junto a la recomendación, en este orden. */
  notas: Nota[];
}

/** Índices de las respuestas que disparan una nota (posición de la opción en su pregunta). */
export const RESPUESTA = {
  antiguedadMenos2: [0, 0],
  valorMas25000: [1, 0],
  valorMenos3000: [1, 3],
  financiado: [2, 0],
  usoProfesional: [5, 2],
  jovenFrecuente: [9, 0],
  jovenEsporadico: [9, 1],
} as const;

const ES_TODO_RIESGO: Record<Modalidad, boolean> = {
  terceros_basico: false,
  terceros_ampliado: false,
  todo_riesgo_franquicia: true,
  todo_riesgo_sin_franquicia: true,
};
export const esTodoRiesgo = (k: Modalidad): boolean => ES_TODO_RIESGO[k];

/**
 * La modalidad a la que más empuja cada opción de una pregunta (la de mayor peso). Es lo que
 * rotulan la guía y el FAQPage: antes la guía decía «3 a 7 años → todo riesgo con franquicia»,
 * con tramos que no eran los de la pregunta, y el FAQ, «terceros ampliado» para más de diez
 * años donde la guía decía «básico» (hallazgo 1480). Ahora los dos leen los pesos del test.
 */
export function favoritaDeOpcion(indicePregunta: number, indiceOpcion: number): Modalidad {
  const pesos = PREGUNTAS[indicePregunta].opciones[indiceOpcion].pesos;
  return [...CLAVES].sort((a, b) => (pesos[b] ?? 0) - (pesos[a] ?? 0) || ORDEN_PRIMA[a] - ORDEN_PRIMA[b])[0];
}

/** La opción sin su aclaración entre paréntesis: «Menos de 2 años (vehículo nuevo…)» → «Menos de 2 años». */
export const textoCorto = (texto: string): string => texto.replace(/\s*\(.*\)\s*$/, '');

/** Nombre de la modalidad dentro de una frase, sin artículo. */
export const NOMBRE_CORTO: Record<Modalidad, string> = {
  terceros_basico: 'terceros básico',
  terceros_ampliado: 'terceros ampliado',
  todo_riesgo_franquicia: 'todo riesgo con franquicia',
  todo_riesgo_sin_franquicia: 'todo riesgo sin franquicia',
};

/** Pregunta 1 (antigüedad) y pregunta 2 (valor), las dos que rotulan la guía y el FAQPage. */
export const PREGUNTA_ANTIGUEDAD = 0;
export const PREGUNTA_VALOR = 1;

/** Cada opción de una pregunta con la modalidad a la que más empuja, en el orden del test. */
export function orientacionDe(indicePregunta: number): { opcion: string; modalidad: Modalidad }[] {
  return PREGUNTAS[indicePregunta].opciones.map((o, i) => ({
    opcion: textoCorto(o.texto),
    modalidad: favoritaDeOpcion(indicePregunta, i),
  }));
}

/** La misma orientación en una frase: «menos de 2 años → todo riesgo sin franquicia; …». */
export function orientacionEnFrase(indicePregunta: number): string {
  return orientacionDe(indicePregunta)
    .map(({ opcion, modalidad }) => `${opcion.charAt(0).toLowerCase()}${opcion.slice(1)} → ${NOMBRE_CORTO[modalidad]}`)
    .join('; ');
}

/** `respuestas[i]` es el ÍNDICE de la opción elegida en la pregunta i. */
export function calcularResultado(respuestas: readonly number[]): Resultado {
  const puntos = Object.fromEntries(CLAVES.map((k) => [k, 0])) as Record<Modalidad, number>;
  PREGUNTAS.forEach((p, i) => {
    const opcion = p.opciones[respuestas[i]];
    if (!opcion) return;
    for (const k of CLAVES) puntos[k] += opcion.pesos[k] ?? 0;
  });

  const peso = (indice: number, k: Modalidad) => PREGUNTAS[indice].opciones[respuestas[indice]]?.pesos[k] ?? 0;
  const ordenar = (a: Modalidad, b: Modalidad) => {
    if (puntos[a] !== puntos[b]) return puntos[b] - puntos[a];
    for (const { indice } of DESEMPATE) {
      const d = peso(indice, b) - peso(indice, a);
      if (d !== 0) return d;
    }
    return ORDEN_PRIMA[a] - ORDEN_PRIMA[b];
  };
  const orden = [...CLAVES].sort(ordenar);
  const modalidad = orden[0];

  const empatadas = orden.slice(1).filter((k) => puntos[k] === puntos[modalidad]);
  let criterioDesempate = '';
  if (empatadas.length > 0) {
    // El criterio que la separa de CADA empatada; si no es el mismo para todas, se dicen los
    // que han intervenido, en su orden.
    const motivos = [...DESEMPATE.map((d) => d.motivo), 'es la modalidad de prima más baja'];
    const decisivo = (k: Modalidad) => {
      const i = DESEMPATE.findIndex(({ indice }) => peso(indice, modalidad) !== peso(indice, k));
      return i === -1 ? DESEMPATE.length : i;
    };
    const usados = [...new Set(empatadas.map(decisivo))].sort((a, b) => a - b).map((i) => motivos[i]);
    criterioDesempate = `se muestra primero ${CON_ARTICULO[modalidad]} porque ${usados.join(' y, a igualdad, ')}`;
  }

  // La alternativa que se nombra es la mejor del otro grupo con el MISMO orden que la
  // recomendación (puntos y, a igualdad, los mismos criterios de desempate).
  const eligio = ([p, o]: readonly [number, number]) => respuestas[p] === o;
  const mejor = (grupoTodoRiesgo: boolean) => orden.find((k) => esTodoRiesgo(k) === grupoTodoRiesgo);
  const notas: Nota[] = [];
  const recomiendaTR = esTodoRiesgo(modalidad);
  if (eligio(RESPUESTA.financiado) && !recomiendaTR) notas.push({ tipo: 'financiacion', alternativa: mejor(true) });
  if (eligio(RESPUESTA.valorMenos3000) && recomiendaTR) notas.push({ tipo: 'valor-bajo', alternativa: mejor(false) });
  if ((eligio(RESPUESTA.valorMas25000) || eligio(RESPUESTA.antiguedadMenos2)) && !recomiendaTR) {
    notas.push({ tipo: 'valor-alto', alternativa: mejor(true) });
  }
  if (eligio(RESPUESTA.usoProfesional)) notas.push({ tipo: 'uso-profesional' });
  if (eligio(RESPUESTA.jovenFrecuente) || eligio(RESPUESTA.jovenEsporadico)) notas.push({ tipo: 'conductor-joven' });

  return { modalidad, puntos, empatadas, criterioDesempate, notas };
}
