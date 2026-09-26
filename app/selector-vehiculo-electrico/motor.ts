/**
 * Motor de recomendación de selector-vehiculo-electrico.
 *
 * Puro y sin dependencias: lo usa page.tsx y lo prueban, con casos resueltos a mano, los tests
 * de `tests/apps/selector-vehiculo-electrico.spec.ts` (bloque «motor»).
 *
 * POR QUÉ VIVE APARTE (26/09/2026, hallazgos 2049-2053 del Inspector)
 * ─────────────────────────────────────────────────────────────────────
 * Antes todas las respuestas SUMABAN y ganaba el máximo. Ninguna descartaba nada, así que:
 *
 *  - «Aparco en la calle» solo dejaba de sumar al eléctrico puro y al enchufable: el eléctrico
 *    puro ganaba en el 34,7 % de esos perfiles con una tarjeta fija que decía «Tienes acceso a
 *    carga en casa» (2049).
 *  - «No, necesito un coche sí o sí» no descartaba la moto, y la moto salía con más de 150 km
 *    diarios (2050).
 *  - El presupuesto no acotaba: con «Menos de 15.000 €», tramo en el que la propia escala de la
 *    app da 0 puntos al eléctrico, al enchufable y al híbrido, ganaban ellos (2051).
 *  - «Esperar» no salía en ninguna de las 124.416 combinaciones (2052).
 *  - Los empates los resolvía en silencio el orden del código (2053).
 *
 * CÓMO DECIDE AHORA
 * ─────────────────
 *  1. Los PUNTOS siguen siendo la suma de pesos de cada respuesta: miden cuánto encaja cada tipo
 *     con el USO declarado, y son las barras que se ven en pantalla.
 *  2. Las respuestas INCOMPATIBLES descartan (ver `incompatibilidades`), cada una con el motivo
 *     escrito con las palabras de la propia respuesta.
 *  3. El PRESUPUESTO acota: cada tipo tiene un tramo mínimo, el primero en el que la escala de
 *     la pregunta 4 le da puntos (moto desde «menos de 15.000 €»; eléctrico e híbrido desde
 *     «15.000-25.000 €»; enchufable desde «25.000-40.000 €»). Un tramo más alto nunca excluye
 *     un vehículo más barato. No hay ancla externa de precios: es la escala de la app, y se dice
 *     que es orientativa y para vehículo nuevo.
 *  4. Gana el tipo con más puntos entre los que quedan. Si no queda ninguno —solo pasa con
 *     menos de 15.000 € y la moto descartada—, el resultado es «Esperar o mirar de ocasión», que
 *     así deja de ser un resultado anunciado e inalcanzable y pasa a tener un criterio: ningún
 *     vehículo electrificado nuevo encaja a la vez con el uso y con el presupuesto.
 *  5. Un empate en cabeza se DICE (`empateCon`), no se esconde tras el orden del código.
 */

export type TipoVehiculo = 'bev' | 'phev' | 'hev' | 'moto_electrica' | 'esperar';
export type Candidato = Exclude<TipoVehiculo, 'esperar'>;

export interface Pesos {
  bev: number;
  phev: number;
  hev: number;
  moto_electrica: number;
  esperar: number;
}

export interface OpcionPregunta {
  texto: string;
  icono: string;
  pesos: Partial<Pesos>;
}

export interface Pregunta {
  id: number;
  icono: string;
  texto: string;
  opciones: OpcionPregunta[];
}

/** Índice de cada pregunta en `PREGUNTAS` (y en el array de respuestas). */
export const P = {
  km: 0,
  carga: 1,
  viajes: 2,
  presupuesto: 3,
  conduccion: 4,
  maletero: 5,
  otroVehiculo: 6,
  ayudas: 7,
  ansiedad: 8,
  moto: 9,
} as const;

/** Orden de desempate (y de las barras): el del código original. */
export const CANDIDATOS: Candidato[] = ['bev', 'phev', 'hev', 'moto_electrica'];

export const NOMBRE: Record<TipoVehiculo, string> = {
  bev: 'eléctrico puro',
  phev: 'híbrido enchufable',
  hev: 'híbrido convencional',
  moto_electrica: 'moto eléctrica',
  esperar: 'esperar',
};

/**
 * Las preguntas y sus pesos. El texto de la pregunta 8 lo recibe de fuera (`textoAyudas`) para
 * que el nombre de la ayuda vigente salga de `data/fiscal`, no de un literal.
 */
export function crearPreguntas(textoAyudas: string): Pregunta[] {
  return [
    {
      id: 1,
      icono: '📏',
      texto: '¿Cuántos kilómetros recorres habitualmente al día?',
      opciones: [
        { texto: 'Menos de 30 km (solo ciudad)', icono: '🏙️', pesos: { bev: 3, moto_electrica: 4, hev: 1 } },
        { texto: 'Entre 30 y 80 km (uso mixto)', icono: '🚗', pesos: { bev: 3, phev: 3, hev: 2 } },
        { texto: 'Entre 80 y 150 km (uso intensivo)', icono: '🛣️', pesos: { bev: 2, phev: 3, hev: 3 } },
        { texto: 'Más de 150 km diarios', icono: '🚀', pesos: { hev: 3, phev: 2, esperar: 1 } },
      ],
    },
    {
      id: 2,
      icono: '🔌',
      texto: '¿Puedes instalar o ya tienes un punto de carga en casa (garaje o plaza privada)?',
      opciones: [
        { texto: 'Sí, tengo garaje propio y puedo instalar cargador', icono: '✅', pesos: { bev: 4, phev: 3 } },
        { texto: 'Tengo garaje de comunidad, aún sin cargador pero es posible', icono: '🏢', pesos: { bev: 2, phev: 2, hev: 1 } },
        { texto: 'No tengo garaje propio, aparco en la calle', icono: '🚫', pesos: { hev: 4, esperar: 2, moto_electrica: 2 } },
      ],
    },
    {
      id: 3,
      icono: '🗺️',
      texto: '¿Con qué frecuencia realizas viajes largos (más de 200 km sin parar)?',
      opciones: [
        { texto: 'Raramente o nunca', icono: '😌', pesos: { bev: 4, moto_electrica: 2 } },
        { texto: 'Alguna vez al mes', icono: '📅', pesos: { bev: 2, phev: 3, hev: 2 } },
        { texto: 'Cada semana', icono: '🔁', pesos: { phev: 3, hev: 3 } },
        { texto: 'Es mi uso habitual (viajante, comercial…)', icono: '💼', pesos: { hev: 4, phev: 2 } },
      ],
    },
    {
      id: 4,
      icono: '💶',
      texto: '¿Cuál es tu presupuesto aproximado para el vehículo?',
      opciones: [
        { texto: 'Menos de 15.000 €', icono: '💰', pesos: { moto_electrica: 5, esperar: 2 } },
        { texto: 'Entre 15.000 y 25.000 €', icono: '💰💰', pesos: { hev: 3, esperar: 2, bev: 1 } },
        { texto: 'Entre 25.000 y 40.000 €', icono: '💰💰💰', pesos: { bev: 3, phev: 3, hev: 2 } },
        { texto: 'Más de 40.000 €', icono: '💎', pesos: { bev: 5, phev: 3 } },
      ],
    },
    {
      id: 5,
      icono: '🛤️',
      texto: '¿Qué tipo de conducción realizas principalmente?',
      opciones: [
        { texto: 'Exclusivamente ciudad y tráfico urbano', icono: '🏙️', pesos: { bev: 4, moto_electrica: 3, hev: 2 } },
        { texto: 'Mixto (ciudad + alguna carretera)', icono: '🔀', pesos: { phev: 4, bev: 2, hev: 2 } },
        { texto: 'Principalmente carretera y autopista', icono: '🛣️', pesos: { hev: 4, phev: 2 } },
        { texto: 'Mucho fuera de asfalto o rural', icono: '🌾', pesos: { hev: 3, esperar: 2 } },
      ],
    },
    {
      id: 6,
      icono: '🧳',
      texto: '¿Necesitas gran capacidad de maletero o transportar objetos voluminosos habitualmente?',
      opciones: [
        { texto: 'Sí, es imprescindible (familia, trabajo…)', icono: '🚐', pesos: { hev: 2, phev: 2, bev: 1 } },
        { texto: 'A veces, pero no es prioritario', icono: '🎒', pesos: { bev: 2, phev: 2, hev: 2 } },
        { texto: 'No, me basta con poco espacio', icono: '👜', pesos: { bev: 3, moto_electrica: 3 } },
      ],
    },
    {
      id: 7,
      icono: '🚗',
      texto: '¿Dispones de otro vehículo en casa para viajes largos o emergencias?',
      opciones: [
        { texto: 'Sí, tenemos un segundo coche', icono: '✅', pesos: { bev: 4, moto_electrica: 2 } },
        { texto: 'No, este sería el único vehículo del hogar', icono: '🚗', pesos: { hev: 3, phev: 3, esperar: 1 } },
      ],
    },
    {
      id: 8,
      icono: '🏦',
      texto: textoAyudas,
      opciones: [
        // La moto sumaba 0 aquí, aunque la ayuda estatal vigente también cubre las motocicletas
        // eléctricas (hallazgo 2054). Suma como el enchufable: tiene ayuda, con un máximo menor
        // que el del eléctrico puro. El híbrido convencional no tiene ayuda estatal: 0.
        { texto: 'Sí, quiero aprovecharlas al máximo', icono: '💸', pesos: { bev: 4, phev: 2, moto_electrica: 2 } },
        { texto: 'Las tendré en cuenta pero no son determinantes', icono: '🤔', pesos: { bev: 2, phev: 2, hev: 2 } },
        { texto: 'No me influyen demasiado', icono: '😐', pesos: { hev: 2, esperar: 1 } },
      ],
    },
    {
      id: 9,
      icono: '😰',
      texto: '¿Te preocupa quedarte sin batería lejos de un punto de carga (ansiedad de rango)?',
      opciones: [
        { texto: 'Mucho, me generaría estrés', icono: '😨', pesos: { hev: 4, phev: 3, esperar: 1 } },
        { texto: 'Un poco, pero podría adaptarme', icono: '😐', pesos: { phev: 3, bev: 2, hev: 1 } },
        { texto: 'Nada, planificaría las recargas sin problema', icono: '😎', pesos: { bev: 4 } },
      ],
    },
    {
      id: 10,
      icono: '🛵',
      texto: '¿Te plantearías una moto eléctrica como alternativa real al coche para tus desplazamientos?',
      opciones: [
        { texto: 'Sí, sería perfecta para mi día a día', icono: '✅', pesos: { moto_electrica: 4 } },
        { texto: 'Quizás para algunos trayectos, pero no como único vehículo', icono: '🤔', pesos: { moto_electrica: 2, bev: 1, hev: 1 } },
        { texto: 'No, necesito un coche sí o sí', icono: '🚗', pesos: { bev: 2, phev: 2, hev: 2 } },
      ],
    },
  ];
}

/** Tramos de la pregunta 4, para nombrarlos en la explicación. */
export const ETIQUETA_TRAMO = [
  'menos de 15.000 €',
  'entre 15.000 y 25.000 €',
  'entre 25.000 y 40.000 €',
  'más de 40.000 €',
];

/**
 * Primer tramo de presupuesto en el que la escala de la pregunta 4 da puntos a cada tipo. Por
 * debajo, la propia app lo considera fuera de precio (hallazgo 2051).
 */
export const TRAMO_MINIMO: Record<Candidato, number> = {
  moto_electrica: 0,
  bev: 1,
  hev: 1,
  phev: 2,
};

export interface Exclusion {
  tipo: Candidato;
  clase: 'incompatible' | 'presupuesto';
  motivo: string;
}

export interface ResultadoMotor {
  /** Suma de pesos de cada tipo: lo que encaja con el USO, sin descartes. */
  puntos: Pesos;
  ganador: TipoVehiculo;
  /** Otros tipos disponibles con los mismos puntos que el ganador. */
  empateCon: Candidato[];
  /**
   * El que ganaría por uso si el presupuesto no acotara (solo cuando es distinto del ganador):
   * permite decir «por uso encajaría el eléctrico puro, pero…».
   */
  mejorSinPresupuesto: Candidato | null;
  /** Un motivo por tipo descartado: primero la incompatibilidad, si la hay; si no, el precio. */
  exclusiones: Exclusion[];
  /** Advertencias sobre el ganador que salen de las respuestas (p. ej., aparcar en la calle). */
  avisos: string[];
  /** Respuestas que más han sumado al ganador (3 puntos o más), con su texto literal. */
  razones: string[];
}

function sumar(preguntas: Pregunta[], respuestas: readonly number[]): Pesos {
  const totales: Pesos = { bev: 0, phev: 0, hev: 0, moto_electrica: 0, esperar: 0 };
  preguntas.forEach((preg, i) => {
    const r = respuestas[i];
    if (r === undefined || r < 0) return;
    const pesos = preg.opciones[r].pesos;
    (Object.keys(pesos) as TipoVehiculo[]).forEach((t) => {
      totales[t] += pesos[t] ?? 0;
    });
  });
  return totales;
}

/**
 * Respuestas que hacen inviable un tipo, con el motivo en palabras del usuario. Solo se usan las
 * que la propia app ya declara incompatibles en sus textos:
 *  - Moto: «necesito un coche sí o sí»; 80 km o más al día (la guía la reserva al uso urbano
 *    corto); maletero imprescindible; o «no como único vehículo» siendo el único del hogar.
 *  - Enchufable: aparcar en la calle. Sin enchufe propio circula casi siempre con el motor de
 *    combustión, que es lo que hace un híbrido convencional sin pagar la batería.
 *  - Eléctrico puro: aparcar en la calle Y que la autonomía genere mucho estrés. Sin carga en
 *    casa dependería por completo de la recarga pública; con menos preocupación no se descarta,
 *    pero sale con un aviso (hallazgo 2049).
 */
export function incompatibilidades(respuestas: readonly number[]): Partial<Record<Candidato, string>> {
  const r = respuestas;
  const fuera: Partial<Record<Candidato, string>> = {};

  if (r[P.moto] === 2) fuera.moto_electrica = 'respondiste que necesitas un coche sí o sí';
  else if (r[P.km] >= 2) fuera.moto_electrica = 'recorres 80 km o más al día, y una moto eléctrica está pensada para trayectos urbanos cortos';
  else if (r[P.maletero] === 0) fuera.moto_electrica = 'necesitas gran capacidad de carga';
  else if (r[P.moto] === 1 && r[P.otroVehiculo] === 1) fuera.moto_electrica = 'la quieres solo para algunos trayectos y sería el único vehículo del hogar';

  if (r[P.carga] === 2) {
    fuera.phev = 'aparcas en la calle: un enchufable que no se enchufa a diario circula casi siempre con el motor de combustión';
    if (r[P.ansiedad] === 0) {
      fuera.bev = 'aparcas en la calle y quedarte sin batería te generaría estrés: sin carga en casa dependerías por completo de la recarga pública';
    }
  }
  return fuera;
}

export function recomendar(preguntas: Pregunta[], respuestas: readonly number[]): ResultadoMotor {
  const puntos = sumar(preguntas, respuestas);
  const incompatibles = incompatibilidades(respuestas);
  const tramo = respuestas[P.presupuesto];

  const exclusiones: Exclusion[] = [];
  const disponibles: Candidato[] = [];
  const compatibles: Candidato[] = [];
  for (const tipo of CANDIDATOS) {
    const motivo = incompatibles[tipo];
    if (motivo) {
      exclusiones.push({ tipo, clase: 'incompatible', motivo });
      continue;
    }
    compatibles.push(tipo);
    if (tramo >= 0 && tramo < TRAMO_MINIMO[tipo]) {
      exclusiones.push({
        tipo,
        clase: 'presupuesto',
        motivo: `con ${ETIQUETA_TRAMO[tramo]}, un ${NOMBRE[tipo]} nuevo suele quedar por encima de tu presupuesto`,
      });
      continue;
    }
    disponibles.push(tipo);
  }

  const mejor = (lista: Candidato[]): Candidato | null =>
    lista.reduce<Candidato | null>((a, b) => (a === null || puntos[b] > puntos[a] ? b : a), null);

  const elegido = mejor(disponibles);
  const ganador: TipoVehiculo = elegido ?? 'esperar';
  const empateCon = elegido ? disponibles.filter((t) => t !== elegido && puntos[t] === puntos[elegido]) : [];
  const porUso = mejor(compatibles);
  const mejorSinPresupuesto = porUso && porUso !== elegido && (elegido === null || puntos[porUso] > puntos[elegido]) ? porUso : null;

  const avisos: string[] = [];
  const carga = respuestas[P.carga];
  if (ganador === 'bev' && carga === 2) {
    avisos.push(
      'Aparcas en la calle: sin carga en casa dependerás de la recarga pública o de la del trabajo. Antes de decidir, comprueba qué puntos de carga tienes cerca, su disponibilidad y su precio, que suele ser mayor que el de una tarifa doméstica.',
    );
  }
  if ((ganador === 'bev' || ganador === 'phev') && carga === 1) {
    avisos.push(
      'Tu garaje comunitario aún no tiene cargador: antes de comprar, confirma que puedes instalar uno en tu plaza y cuánto costaría la instalación.',
    );
  }
  if (ganador === 'bev' && (respuestas[P.km] === 3 || respuestas[P.viajes] >= 2)) {
    avisos.push(
      'Haces muchos kilómetros o viajes largos frecuentes: elige una autonomía homologada (WLTP) holgada respecto a tus trayectos y planifica las paradas en cargadores rápidos.',
    );
  }

  const razones: string[] = [];
  if (elegido) {
    preguntas.forEach((preg, i) => {
      const r = respuestas[i];
      if (r === undefined || r < 0) return;
      const op = preg.opciones[r];
      if ((op.pesos[elegido] ?? 0) >= 3) razones.push(op.texto);
    });
  }

  return { puntos, ganador, empateCon, mejorSinPresupuesto, exclusiones, avisos, razones };
}
