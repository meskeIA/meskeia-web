/**
 * Motor de selector-tipo-vivienda: las preguntas con sus puntos, lo que cada respuesta descarta
 * y la resolución. Puro y sin dependencias, para poder barrer las combinaciones fuera de React.
 *
 * ── De dónde sale (26/09/2026, hallazgos 2068, 2069 y 2070 del Inspector) ─────────────────────
 * Antes cada opción solo SUMABA puntos y ganaba el máximo, deshaciendo los empates por el orden
 * de declaración. Tres consecuencias:
 *   · una familia con hijos recibía «Piso Compartido» o «Estudio», que la propia tarjeta descarta
 *     («No es una solución para familias con hijos», «Espacio muy reducido para más de una
 *     persona»): 45.448 de las 1.600.000 combinaciones de familia;
 *   · el presupuesto «Muy ajustado» no restaba nada a los tipos caros, y el ático o la casa
 *     ganaban sin que el resultado dijera una palabra del presupuesto;
 *   · el 7,8 % de las combinaciones terminaba en empate exacto, resuelto en silencio.
 *
 * Ahora la resolución va en tres pasos:
 *   1. DESCARTES por necesidad: una respuesta que la tarjeta de un tipo contradice lo aparta
 *      (`descarta`). La casa unifamiliar no la descarta ninguna respuesta, así que siempre queda
 *      al menos un tipo compatible.
 *   2. El PRESUPUESTO acota (`fueraDePresupuesto`): entre los compatibles, se eligen los que
 *      caben en él. Si ninguno cabe —p. ej., un jardín grande imprescindible con un presupuesto
 *      muy ajustado—, se recomienda el compatible con más puntos y se AVISA del choque.
 *   3. Gana la puntuación más alta; si hay empate exacto, se dicen todos los empatados.
 */

export type TipoVivienda = 'piso' | 'casa' | 'atico' | 'estudio' | 'compartido';

/** Orden de presentación (y de los empatados). */
export const TIPOS: readonly TipoVivienda[] = ['piso', 'casa', 'atico', 'estudio', 'compartido'];

export interface Opcion {
  texto: string;
  pesos: Partial<Record<TipoVivienda, number>>;
  /** Tipos que esta respuesta hace incompatibles (lo dice la tarjeta de cada uno). */
  descarta?: readonly TipoVivienda[];
  /** Tipos que con este presupuesto quedan fuera de alcance. */
  fueraDePresupuesto?: readonly TipoVivienda[];
}

export interface Pregunta {
  id: number;
  texto: string;
  opciones: readonly Opcion[];
}

/** Los tipos que no caben en una casa con hijos: lo dicen sus propias tarjetas. */
const NO_PARA_FAMILIAS: readonly TipoVivienda[] = ['estudio', 'compartido'];

export const PREGUNTAS: readonly Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuántas personas vivirán en la vivienda?',
    opciones: [
      { texto: 'Solo yo', pesos: { estudio: 4, compartido: 2 } },
      { texto: 'Pareja sin hijos', pesos: { piso: 3, estudio: 2, atico: 2 } },
      { texto: 'Familia con 1-2 hijos', pesos: { piso: 4, casa: 3 }, descarta: NO_PARA_FAMILIAS },
      { texto: 'Familia numerosa (3 o más hijos)', pesos: { casa: 5, piso: 2 }, descarta: NO_PARA_FAMILIAS },
      { texto: 'Temporalmente solo, preveo cambios', pesos: { piso: 2, compartido: 2 } },
    ],
  },
  {
    id: 2,
    texto: '¿Cuál es tu presupuesto para la vivienda (compra o alquiler mensual)?',
    opciones: [
      // La tarjeta de la casa dice «Mayor precio de compra» y la del ático «Precio generalmente
      // superior al piso equivalente»: con el presupuesto más bajo quedan fuera los dos, y con el
      // moderado, el ático (hallazgo 2069).
      { texto: 'Muy ajustado', pesos: { compartido: 4, estudio: 3 }, fueraDePresupuesto: ['atico', 'casa'] },
      { texto: 'Moderado', pesos: { estudio: 3, piso: 2 }, fueraDePresupuesto: ['atico'] },
      { texto: 'Estándar', pesos: { piso: 4 } },
      { texto: 'Amplio', pesos: { atico: 3, piso: 2, casa: 2 } },
      { texto: 'Alto, puedo elegir libremente', pesos: { casa: 3, atico: 3 } },
    ],
  },
  {
    id: 3,
    texto: '¿Cuánto espacio exterior (jardín, terraza, patio) necesitas?',
    opciones: [
      { texto: 'No me importa, no lo usaría', pesos: { estudio: 2, piso: 2 } },
      { texto: 'Una pequeña terraza me bastaría', pesos: { piso: 2, atico: 2 } },
      { texto: 'Terraza amplia o ático', pesos: { atico: 4 } },
      { texto: 'Jardín propio es importante', pesos: { casa: 4 } },
      // «Imprescindible»: solo la casa tiene jardín propio grande.
      { texto: 'Jardín grande es imprescindible', pesos: { casa: 5 }, descarta: ['piso', 'atico', 'estudio', 'compartido'] },
    ],
  },
  {
    id: 4,
    texto: '¿Dónde prefieres que esté ubicada tu vivienda?',
    opciones: [
      { texto: 'Centro de ciudad, máxima accesibilidad', pesos: { estudio: 3, piso: 3, compartido: 2 } },
      { texto: 'Barrio residencial urbano', pesos: { piso: 4, atico: 2 } },
      { texto: 'Periferia con buena comunicación', pesos: { piso: 3, casa: 2 } },
      { texto: 'Extrarradio o zona semirural', pesos: { casa: 4 } },
      { texto: 'No me importa, lo decido según precio', pesos: { estudio: 2, piso: 2 } },
    ],
  },
  {
    id: 5,
    texto: '¿Tienes o planeas tener mascotas?',
    opciones: [
      { texto: 'No, y no planeo tenerlas', pesos: { estudio: 2, compartido: 2 } },
      { texto: 'Sí, animal pequeño', pesos: { piso: 2 } },
      { texto: 'Sí, perro mediano o grande', pesos: { piso: 2, casa: 3, atico: 2 } },
      // «Espacio muy reducido» (estudio) y una convivencia que no es solo tuya (compartido).
      { texto: 'Varios animales o animales grandes', pesos: { casa: 4 }, descarta: ['estudio', 'compartido'] },
    ],
  },
  {
    id: 6,
    texto: '¿Cuánta privacidad y tranquilidad necesitas en casa?',
    opciones: [
      // «Privacidad limitada en zonas comunes» (compartido).
      { texto: 'Máxima, el ruido me afecta mucho', pesos: { casa: 4, atico: 3 }, descarta: ['compartido'] },
      { texto: 'Bastante, prefiero pocos vecinos', pesos: { atico: 3, piso: 2 } },
      { texto: 'Normal, lo del bloque me parece bien', pesos: { piso: 3 } },
      { texto: 'No me importa, paso poco tiempo en casa', pesos: { estudio: 2, compartido: 3 } },
    ],
  },
  {
    id: 7,
    texto: '¿En qué etapa vital te encuentras?',
    opciones: [
      { texto: 'Estudiante o inicio de carrera', pesos: { compartido: 4, estudio: 3 } },
      { texto: 'Joven profesional independiente', pesos: { estudio: 3, piso: 2 } },
      { texto: 'Pareja establecida con planes de familia', pesos: { piso: 3, casa: 2 } },
      { texto: 'Familia consolidada', pesos: { casa: 4, piso: 2 } },
      { texto: 'Nido vacío, hijos independientes', pesos: { piso: 3, atico: 2, estudio: 2 } },
    ],
  },
  {
    id: 8,
    texto: '¿Cuánto te importa el mantenimiento y la gestión de la vivienda?',
    opciones: [
      { texto: 'Quiero mínima responsabilidad', pesos: { compartido: 3, estudio: 2 } },
      { texto: 'Puedo asumir mantenimiento básico', pesos: { piso: 3 } },
      { texto: 'No me importa gestionar', pesos: { piso: 2, atico: 2 } },
      // «No permite personalizar ni reformar el espacio» (compartido).
      { texto: 'Quiero total control y personalización', pesos: { casa: 4 }, descarta: ['compartido'] },
    ],
  },
  {
    id: 9,
    texto: '¿Trabajas desde casa o tienes necesidades de espacio para trabajo?',
    opciones: [
      { texto: 'Trabajo mayormente fuera', pesos: { estudio: 3, compartido: 2 } },
      { texto: 'Teletrabajo puntual, necesito un rincón', pesos: { piso: 3 } },
      // «Sin despacho ni habitaciones separadas» (estudio).
      { texto: 'Teletrabajo habitual, necesito despacho', pesos: { piso: 3, casa: 2 }, descarta: ['estudio'] },
      {
        texto: 'Trabajo en casa a tiempo completo o tengo negocio en el hogar',
        pesos: { casa: 4, atico: 2 },
        descarta: ['estudio'],
      },
    ],
  },
  {
    id: 10,
    texto: '¿Qué valoras más en una vivienda?',
    opciones: [
      { texto: 'El precio y la ubicación por encima de todo', pesos: { compartido: 3, estudio: 3 } },
      { texto: 'El espacio y la comodidad del día a día', pesos: { piso: 3, casa: 2 } },
      { texto: 'Las vistas y la luz natural', pesos: { atico: 4 } },
      { texto: 'La conexión con la naturaleza y el entorno', pesos: { casa: 4 } },
      { texto: 'La independencia y la privacidad total', pesos: { casa: 3, atico: 2 }, descarta: ['compartido'] },
    ],
  },
];

export interface Resultado {
  /** El tipo o tipos con más puntos entre los elegibles (más de uno = empate exacto). */
  ganadores: TipoVivienda[];
  puntos: Record<TipoVivienda, number>;
  /** Tipos que alguna respuesta hace incompatibles. */
  descartados: TipoVivienda[];
  /** Tipos compatibles que el presupuesto deja fuera. */
  fueraDePresupuesto: TipoVivienda[];
  /**
   * true si ningún tipo compatible cabía en el presupuesto y el recomendado lo supera: la
   * pantalla tiene que decirlo.
   */
  chocaConPresupuesto: boolean;
}

/** `respuestas[i]` = índice de la opción elegida en la pregunta i (undefined si no contestó). */
export function calcularResultado(respuestas: Readonly<Record<number, number>> | readonly number[]): Resultado {
  const puntos: Record<TipoVivienda, number> = { piso: 0, casa: 0, atico: 0, estudio: 0, compartido: 0 };
  const descartados = new Set<TipoVivienda>();
  const caros = new Set<TipoVivienda>();

  PREGUNTAS.forEach((pregunta, i) => {
    const idx = (respuestas as Record<number, number>)[i];
    if (idx === undefined) return;
    const opcion = pregunta.opciones[idx];
    if (!opcion) return;
    for (const [tipo, valor] of Object.entries(opcion.pesos) as [TipoVivienda, number][]) puntos[tipo] += valor;
    opcion.descarta?.forEach((t) => descartados.add(t));
    opcion.fueraDePresupuesto?.forEach((t) => caros.add(t));
  });

  const compatibles = TIPOS.filter((t) => !descartados.has(t));
  const asequibles = compatibles.filter((t) => !caros.has(t));
  const chocaConPresupuesto = asequibles.length === 0;
  const elegibles = chocaConPresupuesto ? compatibles : asequibles;
  const maximo = Math.max(...elegibles.map((t) => puntos[t]));

  return {
    ganadores: elegibles.filter((t) => puntos[t] === maximo),
    puntos,
    descartados: TIPOS.filter((t) => descartados.has(t)),
    fueraDePresupuesto: compatibles.filter((t) => caros.has(t)),
    chocaConPresupuesto,
  };
}
