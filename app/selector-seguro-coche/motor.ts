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

export const RESULTADOS: Record<Modalidad, ResultadoInfo> = {
  terceros_basico: {
    titulo: 'Seguro a Terceros Básico',
    descripcion:
      'La cobertura mínima legal. Ideal para vehículos antiguos de bajo valor donde el coste del seguro podría superar el valor del coche.',
    icono: '🛡️',
    coberturas: [
      'Responsabilidad civil obligatoria',
      'Daños a terceros (personas y bienes)',
      'Asistencia en viaje básica (según compañía)',
      'Defensa jurídica básica',
    ],
    advertencia:
      'No cubre daños propios del vehículo. Si sufres un accidente sin culpable identificado, correrás con el gasto de reparación.',
  },
  terceros_ampliado: {
    titulo: 'Seguro a Terceros Ampliado',
    descripcion:
      'Amplía la cobertura básica con protección ante robos, incendios, fenómenos naturales y daños en lunas. Una opción equilibrada para coches de valor medio.',
    icono: '🛡️',
    coberturas: [
      'Responsabilidad civil obligatoria',
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
      'Cobertura total con una parte del coste de reparación a tu cargo (franquicia). Protección completa a un precio más asequible.',
    icono: '🔰',
    coberturas: [
      'Todo lo incluido en terceros ampliado',
      'Daños propios por accidente (independientemente de la culpa)',
      'Daños en aparcamiento (golpes sin parte contrario)',
      'Actos vandálicos',
      'Cobertura en el extranjero (zona UE)',
    ],
    advertencia:
      'En cada siniestro deberás abonar la franquicia pactada (habitualmente entre 150 € y 600 €). Compara el importe de la franquicia antes de contratar.',
  },
  todo_riesgo_sin_franquicia: {
    titulo: 'Todo Riesgo sin Franquicia',
    descripcion:
      'La cobertura más completa del mercado. Cualquier daño queda cubierto sin coste adicional. Recomendado para vehículos nuevos, de alto valor o conductores noveles.',
    icono: '⭐',
    coberturas: [
      'Cobertura total de daños propios y a terceros',
      'Sin coste adicional por siniestro (0 € franquicia)',
      'Robo, incendio, lunas y fenómenos naturales',
      'Conductor designado sin recargo',
      'Vehículo de sustitución incluido (según póliza)',
      'Cobertura en toda Europa',
    ],
    advertencia:
      'Es la opción más cara del mercado. Valora si la prima anual compensa respecto al valor real del vehículo.',
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

export interface Resultado {
  modalidad: Modalidad;
  puntos: Record<Modalidad, number>;
  /** Otras modalidades con la MISMA puntuación que la recomendada. */
  empatadas: Modalidad[];
  /** Frase que explica cómo se ha deshecho el empate; vacía si no lo hay. */
  criterioDesempate: string;
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

  return { modalidad, puntos, empatadas, criterioDesempate };
}
