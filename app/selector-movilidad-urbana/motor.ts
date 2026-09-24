/**
 * Motor de recomendación de selector-movilidad-urbana.
 *
 * Vive aparte, sin dependencias, para poder enumerar todas las combinaciones de respuestas sin
 * navegador: mismo patrón que `app/selector-mascota/motor.ts` (commit 934e57bc). Las preguntas
 * y sus pesos son los MISMOS que tenía la página; lo que cambia es esto:
 *
 *  1. Empates. Antes el ganador salía de un `reduce` que partía de «combinación» y solo cambiaba
 *     con un `>` estricto: a igualdad de puntos ganaba la combinación multimodal y, si no
 *     estaba en el empate, el primero del objeto (el coche). En silencio. Ahora, a igualdad de
 *     puntos, va primero el medio que mejor responde a la limitación física declarada
 *     (pregunta 10); si sigue el empate, el que mejor encaja con la distancia (pregunta 1), y
 *     por último el de menor coste mensual. El empate se anuncia en pantalla.
 *
 *  2. Razones. La descripción de cada medio afirmaba cosas del usuario: al transporte público
 *     le acompañaba «Vives en una ciudad bien comunicada, tus horarios son regulares…» aunque
 *     se hubiera respondido red «deficiente» y horarios nocturnos. Ahora la descripción habla
 *     del medio, y las razones citan las respuestas que más le han sumado.
 *
 *  3. Lo declarado como imposibilidad es un FILTRO, no un peso (hallazgos 1488-1490; regla a de
 *     la familia de selectores, con selector-mascota como referencia). Antes todas las
 *     respuestas solo sumaban, así que salía el transporte público a quien acababa de decir que
 *     en su zona no lo hay, la bici o la moto a quien tiene limitaciones de movilidad
 *     importantes y la bici a más de 40 km. Ahora se descarta:
 *       · el transporte público con la red «Deficiente o inexistente en mi zona»;
 *       · la bici o el patinete y la moto con «Sí, tengo limitaciones importantes» (riesgo de
 *         seguridad, no una preferencia);
 *       · la bici o el patinete con «Más de 40 km» (su propia ficha: «rinde en trayectos
 *         cortos»);
 *       · la combinación multimodal cuando, con esos descartes, no quedan dos medios que
 *         combinar (sin red y con limitaciones solo queda el coche).
 *     El coche nunca se descarta, así que siempre hay recomendación. Si lo descartado sumaba
 *     tantos puntos o más que lo recomendado, el resultado lo dice (`avisoDescarte`).
 *
 *  4. Lo demás son PREFERENCIAS y siguen siendo pesos, pero ya no en silencio (hallazgos
 *     1491-1494): bultos o sillas de bebé habituales, coste «crítico», seguridad vial como
 *     prioridad, clima adverso y trayectos de 15-40 km en bici o de más de 40 en moto. Son
 *     compromisos que alguien puede aceptar (un portabultos, ropa de lluvia, un casco), no
 *     imposibilidades; cuando juegan contra el medio recomendado, `enContra` cita la respuesta.
 *
 *  5. Costes: una sola fuente (`COSTE_MENSUAL`). La tarjeta, la guía y el FAQPage daban cifras
 *     distintas para el mismo medio (hallazgo 1496); ahora todas se derivan de esta tabla.
 */

export type TipoTransporte =
  | 'coche_propio'
  | 'transporte_publico'
  | 'moto_escuter'
  | 'bici_patinete'
  | 'combinacion';

export interface Opcion {
  texto: string;
  icono: string;
  pesos: Partial<Record<TipoTransporte, number>>;
}

export interface Pregunta {
  id: number;
  icono: string;
  texto: string;
  opciones: Opcion[];
}

export interface TransporteInfo {
  tipo: TipoTransporte;
  titulo: string;
  etiqueta: string;
  icono: string;
  descripcion: string;
  ventajas: string[];
  costoMensual: string;
}

export const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    icono: '📏',
    texto: '¿Cuál es tu distancia habitual al trabajo o estudios?',
    opciones: [
      {
        texto: 'Menos de 5 km',
        icono: '🚶',
        pesos: { bici_patinete: 3, transporte_publico: 2, combinacion: 1 },
      },
      {
        texto: 'Entre 5 y 15 km',
        icono: '🛴',
        pesos: { moto_escuter: 3, bici_patinete: 2, transporte_publico: 2, combinacion: 2 },
      },
      {
        texto: 'Entre 15 y 40 km',
        icono: '🚇',
        pesos: { coche_propio: 2, transporte_publico: 3, moto_escuter: 2, combinacion: 2 },
      },
      {
        texto: 'Más de 40 km',
        icono: '🚗',
        pesos: { coche_propio: 4, combinacion: 1 },
      },
    ],
  },
  {
    id: 2,
    icono: '🚇',
    texto: '¿Tu ciudad o barrio tiene buena red de transporte público (metro, autobús, cercanías)?',
    opciones: [
      {
        texto: 'Sí, muy completa y frecuente',
        icono: '✅',
        pesos: { transporte_publico: 4, combinacion: 2 },
      },
      {
        texto: 'Regular, con algunas líneas útiles',
        icono: '🟡',
        pesos: { transporte_publico: 2, combinacion: 3, moto_escuter: 1 },
      },
      {
        texto: 'Deficiente o inexistente en mi zona',
        icono: '❌',
        pesos: { coche_propio: 3, moto_escuter: 2 },
      },
    ],
  },
  {
    id: 3,
    icono: '📦',
    texto: '¿Necesitas transportar objetos pesados, sillas de bebé u otros bultos con frecuencia?',
    opciones: [
      {
        texto: 'Sí, habitualmente',
        icono: '👶',
        pesos: { coche_propio: 4 },
      },
      {
        texto: 'A veces, pero no siempre',
        icono: '🎒',
        pesos: { coche_propio: 2, combinacion: 2, transporte_publico: 1 },
      },
      {
        texto: 'Casi nunca, solo lo básico',
        icono: '💼',
        pesos: { bici_patinete: 2, moto_escuter: 2, transporte_publico: 2, combinacion: 1 },
      },
    ],
  },
  {
    id: 4,
    icono: '🌙',
    texto: '¿Trabajas en horarios nocturnos, fines de semana o con horarios muy irregulares?',
    opciones: [
      {
        texto: 'Sí, con frecuencia',
        icono: '🌃',
        pesos: { coche_propio: 3, moto_escuter: 2 },
      },
      {
        texto: 'Ocasionalmente',
        icono: '🌆',
        pesos: { coche_propio: 1, moto_escuter: 1, combinacion: 2 },
      },
      {
        texto: 'No, horario fijo de lunes a viernes',
        icono: '☀️',
        pesos: { transporte_publico: 3, bici_patinete: 2, combinacion: 2 },
      },
    ],
  },
  {
    id: 5,
    icono: '💶',
    texto: '¿Qué importancia tiene el coste mensual del transporte para ti?',
    opciones: [
      {
        texto: 'Crítica, quiero el mínimo gasto posible',
        icono: '🔴',
        pesos: { transporte_publico: 4, bici_patinete: 3 },
      },
      {
        texto: 'Importante, pero puedo asumir costes razonables',
        icono: '🟡',
        pesos: { transporte_publico: 2, moto_escuter: 2, bici_patinete: 1, combinacion: 2 },
      },
      {
        texto: 'Secundaria, priorizo comodidad y tiempo',
        icono: '🟢',
        pesos: { coche_propio: 3, moto_escuter: 1 },
      },
    ],
  },
  {
    id: 6,
    icono: '🅿️',
    texto: '¿Tienes aparcamiento garantizado en tu trabajo o lugar de destino habitual?',
    opciones: [
      {
        texto: 'Sí, gratuito o muy asequible',
        icono: '✅',
        pesos: { coche_propio: 3, moto_escuter: 1 },
      },
      {
        texto: 'Sí, pero tiene coste notable',
        icono: '💰',
        pesos: { coche_propio: 1, moto_escuter: 2, combinacion: 2 },
      },
      {
        texto: 'No, es complicado o caro aparcar',
        icono: '❌',
        pesos: { transporte_publico: 3, moto_escuter: 2, bici_patinete: 2, combinacion: 2 },
      },
    ],
  },
  {
    id: 7,
    icono: '⚠️',
    texto: '¿Te preocupa especialmente la seguridad vial en tu desplazamiento?',
    opciones: [
      {
        texto: 'Mucho, es una prioridad para mí',
        icono: '🛡️',
        pesos: { transporte_publico: 3, coche_propio: 2 },
      },
      {
        texto: 'Me preocupa, pero tengo experiencia',
        icono: '🚦',
        pesos: { coche_propio: 1, moto_escuter: 1, combinacion: 2, transporte_publico: 1 },
      },
      {
        texto: 'Poco, me siento cómodo/a en cualquier vehículo',
        icono: '😎',
        pesos: { moto_escuter: 2, bici_patinete: 2, combinacion: 2 },
      },
    ],
  },
  {
    id: 8,
    icono: '🌧️',
    texto: '¿El clima de tu ciudad es adverso frecuentemente (lluvia, frío intenso, calor extremo)?',
    opciones: [
      {
        texto: 'Sí, llueve mucho o hace mucho frío/calor',
        icono: '🌩️',
        pesos: { coche_propio: 3, transporte_publico: 2 },
      },
      {
        texto: 'Moderado, con algunas semanas complicadas',
        icono: '🌦️',
        pesos: { combinacion: 3, transporte_publico: 1, moto_escuter: 1 },
      },
      {
        texto: 'Muy bueno, clima seco y agradable casi todo el año',
        icono: '☀️',
        pesos: { bici_patinete: 3, moto_escuter: 2, combinacion: 1 },
      },
    ],
  },
  {
    id: 9,
    icono: '🌿',
    texto: '¿Priorizar la sostenibilidad medioambiental es importante en tu decisión?',
    opciones: [
      {
        texto: 'Sí, es fundamental para mí',
        icono: '♻️',
        pesos: { bici_patinete: 4, transporte_publico: 3, combinacion: 1 },
      },
      {
        texto: 'Me importa, pero no es el factor decisivo',
        icono: '🌱',
        pesos: { transporte_publico: 2, bici_patinete: 1, combinacion: 2 },
      },
      {
        texto: 'Poco relevante frente a comodidad y tiempo',
        icono: '⚡',
        pesos: { coche_propio: 2, moto_escuter: 1 },
      },
    ],
  },
  {
    id: 10,
    icono: '♿',
    texto: '¿Tienes alguna limitación de movilidad física o condición de salud que afecte al transporte?',
    opciones: [
      {
        texto: 'Sí, tengo limitaciones importantes',
        icono: '♿',
        pesos: { coche_propio: 4, transporte_publico: 2 },
      },
      {
        texto: 'Leve, prefiero comodidad en el transporte',
        icono: '🦽',
        pesos: { coche_propio: 2, transporte_publico: 2, combinacion: 1 },
      },
      {
        texto: 'No, estoy en buena forma física',
        icono: '💪',
        pesos: { bici_patinete: 3, moto_escuter: 2, combinacion: 2, transporte_publico: 1 },
      },
    ],
  },
];

/**
 * Horquilla de coste mensual de cada medio, en €/mes: la ÚNICA fuente de las cifras de coste de
 * la tarjeta, la guía y el FAQPage (hallazgo 1496) y del último criterio de desempate.
 *
 * No sale de una estadística oficial: es una estimación orientativa de meskeIA (2026) para una
 * ciudad española, y la pantalla lo dice. El INE (EPF) publica el gasto de los hogares en
 * transporte, no el coste de cada medio; por eso las cifras se presentan como horquilla y con
 * lo que incluye cada una.
 */
export const COSTE_MENSUAL: Record<TipoTransporte, { min: number; max: number; incluye: string }> = {
  coche_propio: { min: 400, max: 700, incluye: 'amortización, seguro, combustible, aparcamiento y mantenimiento' },
  transporte_publico: { min: 20, max: 80, incluye: 'abono mensual de metro, autobús o cercanías' },
  moto_escuter: { min: 100, max: 200, incluye: 'seguro, combustible, mantenimiento y amortización de una moto de ciudad' },
  bici_patinete: { min: 5, max: 30, incluye: 'mantenimiento de una bici convencional o carga de un patinete o bici eléctrica, sin contar la compra' },
  combinacion: { min: 80, max: 250, incluye: 'abono más bici o patinete, o uso puntual de coche o taxi' },
};

/** Entero con punto de miles («4.800»): `es-ES` no agrupa los números de cuatro cifras. */
const miles = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** «400–700 €/mes» */
export const rangoMensual = (k: TipoTransporte) => `${miles(COSTE_MENSUAL[k].min)}–${miles(COSTE_MENSUAL[k].max)} €/mes`;

/** «4.800–8.400 €» al año (la misma horquilla por doce). */
export const rangoAnual = (k: TipoTransporte) => `${miles(COSTE_MENSUAL[k].min * 12)}–${miles(COSTE_MENSUAL[k].max * 12)} €`;

const textoCoste = (k: TipoTransporte) => `Coste estimado: ${rangoMensual(k)} (${COSTE_MENSUAL[k].incluye})`;

export const TRANSPORTES: Record<TipoTransporte, TransporteInfo> = {
  coche_propio: {
    tipo: 'coche_propio',
    titulo: 'Coche Propio',
    etiqueta: 'Máxima flexibilidad',
    icono: '🚗',
    descripcion:
      'El coche propio da la máxima autonomía: responde a distancias largas, a cargar bultos, a horarios irregulares o a una limitación de movilidad, a cambio del coste mensual más alto.',
    ventajas: [
      'Total independencia de horarios y rutas',
      'Capacidad para transportar personas y carga',
      'Protección ante cualquier condición meteorológica',
      'Ideal para zonas con transporte público deficiente',
    ],
    costoMensual: textoCoste('coche_propio'),
  },
  transporte_publico: {
    tipo: 'transporte_publico',
    titulo: 'Transporte Público',
    etiqueta: 'Económico y sin estrés',
    icono: '🚇',
    // «la opción más económica» chocaba con la bici, que cuesta menos (hallazgo 1496).
    descripcion:
      'El transporte público es de las opciones más económicas cuando la red cubre tus trayectos y tus horarios: sin tráfico que conducir ni aparcamiento que buscar.',
    ventajas: [
      // Antes «El más económico: desde 20–60 €/mes con abono», con otra horquilla que la del
      // coste estimado de la misma tarjeta (20–80 €/mes). La cifra vive solo en `costoMensual`.
      'Coste bajo: pagas el abono o los billetes',
      'Sin preocupaciones de aparcamiento ni tráfico',
      'Tiempo productivo durante el trayecto',
      'Sin coche que mantener ni aparcar',
    ],
    costoMensual: textoCoste('transporte_publico'),
  },
  moto_escuter: {
    tipo: 'moto_escuter',
    titulo: 'Moto o Escúter',
    etiqueta: 'Agilidad urbana',
    icono: '🛵',
    descripcion:
      'La moto o el escúter es el término medio: ágil en el tráfico, fácil de aparcar y mucho más económica que el coche. Rinde en distancias medias en ciudad y pide algo de experiencia vial.',
    ventajas: [
      'Agilidad en el tráfico y reducción de tiempo',
      'Aparcamiento gratuito o muy económico',
      'Menor coste que el coche',
      'Ideal para distancias de 5–30 km en ciudad',
    ],
    costoMensual: textoCoste('moto_escuter'),
  },
  bici_patinete: {
    tipo: 'bici_patinete',
    titulo: 'Bicicleta o Patinete Eléctrico',
    etiqueta: 'Sostenible y económico',
    icono: '🚴',
    // Antes «Rinde en distancias cortas, con buen clima…», leído también por quien acababa de
    // declarar clima adverso (hallazgo 1494). Ahora dice lo que le resta al medio, y el clima
    // declarado se cita aparte, en `enContra`.
    descripcion:
      'La bici o el patinete eléctrico es la opción más sostenible y la de menor coste. Rinde mejor en trayectos cortos y donde hay carriles bici; la lluvia, el frío o el calor fuerte le restan comodidad.',
    ventajas: [
      'Coste casi nulo de operación',
      'Cero emisiones contaminantes',
      'Ejercicio físico integrado en tu rutina',
      'Sin problemas de aparcamiento ni atascos',
    ],
    costoMensual: textoCoste('bici_patinete'),
  },
  combinacion: {
    tipo: 'combinacion',
    titulo: 'Combinación Multimodal',
    etiqueta: 'Lo mejor de cada mundo',
    icono: '🔀',
    descripcion:
      'La movilidad multimodal combina medios —transporte público con bici, coche en ocasiones puntuales, o moto con metro— para cubrir necesidades que un solo medio no resuelve.',
    ventajas: [
      'Flexibilidad según la situación y el día',
      'Optimización de costes y tiempos',
      'Adaptación a diferentes condiciones meteorológicas',
      'Menor dependencia de un único medio',
    ],
    costoMensual: textoCoste('combinacion'),
  },
};

/** Orden de declaración: SOLO para recorrer, nunca para desempatar. */
export const CLAVES: TipoTransporte[] = ['coche_propio', 'transporte_publico', 'moto_escuter', 'bici_patinete', 'combinacion'];

/** Nombre con artículo, para las frases de las razones y del aviso de empate. */
export const CON_ARTICULO: Record<TipoTransporte, string> = {
  coche_propio: 'el coche propio',
  transporte_publico: 'el transporte público',
  moto_escuter: 'la moto o el escúter',
  bici_patinete: 'la bici o el patinete eléctrico',
  combinacion: 'la combinación multimodal',
};

/**
 * Mínimo del coste mensual que publica cada ficha, en euros: último criterio de desempate.
 * Bici o patinete 5 € · transporte público 20 € · combinación 80 € · moto 100 € · coche 400 €.
 * Se deriva de `COSTE_MENSUAL`, para que no pueda divergir de lo que se enseña.
 */
export const COSTE_MENSUAL_MINIMO = Object.fromEntries(
  CLAVES.map((k) => [k, COSTE_MENSUAL[k].min]),
) as Record<TipoTransporte, number>;

/** Lista legible: «A, B y C». */
export function enumerar(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

/** Nombre corto de lo que pregunta cada pregunta, para citar la respuesta en las razones. */
export const TEMA: Record<number, string> = {
  1: 'Distancia',
  2: 'Red de transporte público',
  3: 'Carga y bultos',
  4: 'Horarios',
  5: 'Coste mensual',
  6: 'Aparcamiento en destino',
  7: 'Seguridad vial',
  8: 'Clima',
  9: 'Sostenibilidad',
  10: 'Movilidad física',
};

/** Las preguntas que deshacen un empate, en orden, y cómo se dice cada una. */
const DESEMPATE: { pregunta: number; motivo: string; frente: (otros: string) => string }[] = [
  {
    pregunta: 10,
    motivo: 'responde mejor a lo que has indicado sobre tu movilidad física',
    frente: (otros) => `responde mejor que ${otros} a lo que has indicado sobre tu movilidad física`,
  },
  {
    pregunta: 1,
    motivo: 'encaja mejor con la distancia de tu trayecto',
    frente: (otros) => `encaja mejor que ${otros} con la distancia de tu trayecto`,
  },
];

/** Último criterio: el menor coste mensual mínimo de `COSTE_MENSUAL`. */
const POR_COSTE = {
  motivo: 'su coste mensual es el más bajo',
  frente: (otros: string) => `cuesta menos al mes que ${otros}`,
};

/** Por qué se descarta un medio (regla 3 de la cabecera). */
export type MotivoDescarte = 'sin_red' | 'limitacion' | 'distancia' | 'sin_combinar';

// Índices de las opciones que acotan (la opción n de la pregunta, contando desde 0).
const P1_15_40 = 2;
const P1_MAS_40 = 3;
const P2_SIN_RED = 2;
const P3_BULTOS_HABITUAL = 0;
const P5_COSTE_CRITICO = 0;
const P7_SEGURIDAD_PRIORIDAD = 0;
const P8_CLIMA_ADVERSO = 0;
const P10_LIMITACION_IMPORTANTE = 0;

/** Los medios «simples» con los que se arma una combinación multimodal. */
const SIMPLES: TipoTransporte[] = ['coche_propio', 'transporte_publico', 'moto_escuter', 'bici_patinete'];

export interface Resultado {
  tipo: TipoTransporte;
  /** El que ganaría por puntos si no se descartara nada. */
  tipoPorPuntos: TipoTransporte;
  /** Medios descartados por lo declarado, con el motivo. */
  descartes: Partial<Record<TipoTransporte, MotivoDescarte>>;
  puntos: Record<TipoTransporte, number>;
  /** Otros medios ADMITIDOS con la MISMA puntuación que el recomendado. */
  empatados: TipoTransporte[];
  /** Frase que explica cómo se ha deshecho el empate; vacía si no lo hay. */
  criterioDesempate: string;
  /**
   * Los medios descartados que sumaban tantos puntos o más que el recomendado, con la respuesta
   * que los descarta; vacía si el descarte no ha cambiado nada.
   */
  avisoDescarte: string;
  razones: string[];
  /** Respuestas que juegan en contra del medio recomendado, citadas literalmente. */
  enContra: string[];
}

const puntosEnLetra = (n: number) => `${n} ${n === 1 ? 'punto' : 'puntos'}`;

/** «a» + nombre con artículo, con la contracción: «al coche propio», «a la moto». */
const aNombre = (s: string) => (s.startsWith('el ') ? `al ${s.slice(3)}` : `a ${s}`);

/** `respuestas[i]` es el ÍNDICE de la opción elegida en la pregunta i, o −1 si no hay. */
export function calcularResultado(respuestas: readonly number[]): Resultado {
  const puntos = Object.fromEntries(CLAVES.map((k) => [k, 0])) as Record<TipoTransporte, number>;
  const aporte: Record<number, Partial<Record<TipoTransporte, number>>> = {};
  PREGUNTAS.forEach((p, i) => {
    const opcion = p.opciones[respuestas[i]];
    if (!opcion) return;
    aporte[p.id] = opcion.pesos;
    for (const k of CLAVES) puntos[k] += opcion.pesos[k] ?? 0;
  });

  /** ¿Se ha respondido en la pregunta `id` (1-10) la opción `indice`? */
  const respondio = (id: number, indice: number) => respuestas[id - 1] === indice;
  /** La respuesta literal de la pregunta `id`, entre comillas angulares. */
  const cita = (id: number) => `«${PREGUNTAS[id - 1].opciones[respuestas[id - 1]]?.texto ?? ''}»`;

  // ─ Descartes: lo declarado como imposibilidad no se negocia a puntos ─
  const descartes: Resultado['descartes'] = {};
  if (respondio(2, P2_SIN_RED)) descartes.transporte_publico = 'sin_red';
  if (respondio(10, P10_LIMITACION_IMPORTANTE)) {
    descartes.bici_patinete = 'limitacion';
    descartes.moto_escuter = 'limitacion';
  }
  if (respondio(1, P1_MAS_40) && !descartes.bici_patinete) descartes.bici_patinete = 'distancia';
  // Una combinación necesita al menos dos medios que combinar.
  if (SIMPLES.filter((k) => !descartes[k]).length < 2) descartes.combinacion = 'sin_combinar';

  const peso = (pregunta: number, k: TipoTransporte) => aporte[pregunta]?.[k] ?? 0;
  const ordenar = (a: TipoTransporte, b: TipoTransporte) => {
    if (puntos[a] !== puntos[b]) return puntos[b] - puntos[a];
    for (const { pregunta } of DESEMPATE) {
      const d = peso(pregunta, b) - peso(pregunta, a);
      if (d !== 0) return d;
    }
    return COSTE_MENSUAL_MINIMO[a] - COSTE_MENSUAL_MINIMO[b];
  };
  const tipoPorPuntos = [...CLAVES].sort(ordenar)[0];
  // Nunca queda vacía: el coche no se descarta nunca.
  const orden = CLAVES.filter((k) => !descartes[k]).sort(ordenar);
  const tipo = orden[0];

  // ─ Empate entre admitidos ─
  const empatados = orden.slice(1).filter((k) => puntos[k] === puntos[tipo]);
  let criterioDesempate = '';
  if (empatados.length > 0) {
    // El criterio que separa al recomendado de CADA empatado. Si es el mismo para todos, se dice
    // tal cual; si no, cada criterio nombra a los que ha dejado detrás. Antes se encadenaban en
    // superlativo («y, a igualdad, su coste mensual es el más bajo») aunque otro empatado,
    // apartado por el primer criterio, costara menos (mismo defecto que selector-mascota, 1442).
    const decisivo = (k: TipoTransporte) => {
      const i = DESEMPATE.findIndex(({ pregunta }) => peso(pregunta, tipo) !== peso(pregunta, k));
      return i === -1 ? DESEMPATE.length : i;
    };
    const criterios = [...DESEMPATE, POR_COSTE];
    const grupos = [...new Set(empatados.map(decisivo))].sort((a, b) => a - b);
    const porque = grupos.length === 1
      ? criterios[grupos[0]].motivo
      : grupos
        .map((g) => criterios[g].frente(enumerar(empatados.filter((k) => decisivo(k) === g).map((k) => CON_ARTICULO[k]))))
        .join(' y ');
    criterioDesempate = `se muestra primero ${CON_ARTICULO[tipo]} porque ${porque}`;
  }

  // ─ Aviso de descarte: solo si lo descartado competía de verdad ─
  const MOTIVO: Record<MotivoDescarte, string> = {
    sin_red: `porque sobre la red de transporte público has respondido ${cita(2)}`,
    limitacion: `porque has respondido ${cita(10)} sobre tu movilidad física`,
    distancia: `porque tu trayecto es de ${cita(1)} y la bici o el patinete rinden en trayectos cortos`,
    sin_combinar: 'porque, con lo que has declarado, no quedan dos medios que combinar',
  };
  const apartados = CLAVES
    .filter((k) => descartes[k] && puntos[k] >= puntos[tipo])
    .sort(ordenar);
  const avisoDescarte = apartados.length === 0
    ? ''
    : `${apartados.length === 1 ? 'Se ha descartado una opción que sumaba' : 'Se han descartado opciones que sumaban'} tantos puntos o más que ${CON_ARTICULO[tipo]} (${puntosEnLetra(puntos[tipo])}): ${apartados
      .map((k) => `${CON_ARTICULO[k]} (${puntosEnLetra(puntos[k])}), ${MOTIVO[descartes[k] as MotivoDescarte]}`)
      .join('; ')}.`;

  // ─ Razones: las respuestas que más han sumado al medio recomendado ─
  const razones = PREGUNTAS
    .map((p, i) => ({ p, i, valor: peso(p.id, tipo) }))
    .filter((x) => x.valor > 0)
    .sort((a, b) => b.valor - a.valor || a.p.id - b.p.id)
    .slice(0, 3)
    .map(({ p, i, valor }) =>
      `${TEMA[p.id]}: has respondido «${p.opciones[respuestas[i]].texto}», que suma ${puntosEnLetra(valor)} ${aNombre(CON_ARTICULO[tipo])}.`,
    );

  // ─ Lo que juega en contra: preferencias declaradas que el medio recomendado no cumple ─
  const enContra: string[] = [];
  const esBici = tipo === 'bici_patinete';
  const esMoto = tipo === 'moto_escuter';
  const vehiculoAbierto = esBici ? 'bici o patinete' : 'moto o escúter';

  if (esBici && respondio(1, P1_15_40)) {
    enContra.push(`Distancia: has respondido ${cita(1)}. Es un trayecto largo para hacerlo cada día en bici o patinete, que rinden en trayectos cortos; valora cubrir parte del recorrido en transporte público.`);
  }
  if (esMoto && respondio(1, P1_MAS_40)) {
    enContra.push(`Distancia: has respondido ${cita(1)}. La moto rinde en trayectos medios; a esa distancia pasarás buena parte del recorrido en vías interurbanas y a la intemperie.`);
  }
  if (tipo === 'combinacion' && descartes.transporte_publico) {
    const quedan = SIMPLES.filter((k) => !descartes[k]).map((k) => CON_ARTICULO[k]);
    enContra.push(`Red de transporte público: has respondido ${cita(2)}. Tu combinación tendrá que apoyarse en ${enumerar(quedan)}, no en el transporte público.`);
  }
  if (tipo === 'combinacion' && descartes.bici_patinete === 'limitacion') {
    enContra.push(`Movilidad física: has respondido ${cita(10)}. En tu combinación quedan fuera la bici, el patinete y la moto.`);
  }
  if (esBici && respondio(3, P3_BULTOS_HABITUAL)) {
    enContra.push(`Carga y bultos: has respondido ${cita(3)}. En bici hace falta portabultos, alforjas o remolque, y el patinete apenas admite carga.`);
  }
  if (esMoto && respondio(3, P3_BULTOS_HABITUAL)) {
    // RGC (RD 1428/2003), art. 12.1 y 12.2: el pasajero de una moto o un ciclomotor debe tener
    // más de doce años; excepcionalmente, más de siete si conduce su padre, madre o tutor.
    enContra.push(`Carga y bultos: has respondido ${cita(3)}. Una moto carga poco (baúl o alforjas) y, en España, no puede llevar de pasajero a un menor de 7 años (Reglamento General de Circulación, art. 12).`);
  }
  if (respondio(5, P5_COSTE_CRITICO) && (tipo === 'coche_propio' || esMoto || tipo === 'combinacion')) {
    const masBarato = orden
      .filter((k) => COSTE_MENSUAL_MINIMO[k] < COSTE_MENSUAL_MINIMO[tipo])
      .sort((a, b) => COSTE_MENSUAL_MINIMO[a] - COSTE_MENSUAL_MINIMO[b])[0];
    enContra.push(
      `Coste mensual: has respondido ${cita(5)}, y ${CON_ARTICULO[tipo]} cuesta ${rangoMensual(tipo)} en la estimación de este test${
        masBarato ? `; lo más barato que no descartan tus respuestas es ${CON_ARTICULO[masBarato]} (${rangoMensual(masBarato)})` : ''
      }.`,
    );
  }
  if ((esBici || esMoto) && respondio(7, P7_SEGURIDAD_PRIORIDAD)) {
    enContra.push(`Seguridad vial: has respondido ${cita(7)}. En ${vehiculoAbierto} vas sin carrocería que te proteja en caso de choque: la protección depende del casco, de la ropa y de la vía (carriles separados, calles de velocidad reducida).`);
  }
  if ((esBici || esMoto) && respondio(8, P8_CLIMA_ADVERSO)) {
    enContra.push(`Clima: has respondido ${cita(8)}. En ${vehiculoAbierto} vas a la intemperie: prevé ropa impermeable o de abrigo y una alternativa para los peores días.`);
  }

  return { tipo, tipoPorPuntos, descartes, puntos, empatados, criterioDesempate, avisoDescarte, razones, enContra };
}
