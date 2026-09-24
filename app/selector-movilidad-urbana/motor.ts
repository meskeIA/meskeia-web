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
    costoMensual:
      'Coste estimado: 400–700 €/mes (amortización, seguro, combustible, aparcamiento y mantenimiento en ciudad española)',
  },
  transporte_publico: {
    tipo: 'transporte_publico',
    titulo: 'Transporte Público',
    etiqueta: 'Económico y sin estrés',
    icono: '🚇',
    descripcion:
      'El transporte público es la opción más económica cuando la red cubre tus trayectos y tus horarios: sin tráfico que conducir ni aparcamiento que buscar.',
    ventajas: [
      'El más económico: desde 20–60 €/mes con abono',
      'Sin preocupaciones de aparcamiento ni tráfico',
      'Tiempo productivo durante el trayecto',
      'Sin coche que mantener ni aparcar',
    ],
    costoMensual:
      'Coste estimado: 20–80 €/mes (abono transporte en grandes ciudades españolas, incluyendo metro, bus y cercanías)',
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
    costoMensual:
      'Coste estimado: 100–200 €/mes (seguro, combustible, mantenimiento y amortización de una moto de ciudad)',
  },
  bici_patinete: {
    tipo: 'bici_patinete',
    titulo: 'Bicicleta o Patinete Eléctrico',
    etiqueta: 'Sostenible y económico',
    icono: '🚴',
    descripcion:
      'La bici o el patinete eléctrico es la opción más sostenible y la de menor coste. Rinde en distancias cortas, con buen clima y donde hay infraestructura ciclista.',
    ventajas: [
      'Coste casi nulo de operación',
      'Cero emisiones contaminantes',
      'Ejercicio físico integrado en tu rutina',
      'Sin problemas de aparcamiento ni atascos',
    ],
    costoMensual:
      'Coste estimado: 5–30 €/mes (mantenimiento bici convencional o carga eléctrica de patinete/e-bike)',
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
    costoMensual:
      'Coste estimado: 80–250 €/mes (varía según la combinación: abono + bici/patinete o uso puntual de coche/taxi)',
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
 */
export const COSTE_MENSUAL_MINIMO: Record<TipoTransporte, number> = {
  bici_patinete: 5,
  transporte_publico: 20,
  combinacion: 80,
  moto_escuter: 100,
  coche_propio: 400,
};

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
const DESEMPATE: { pregunta: number; motivo: string }[] = [
  { pregunta: 10, motivo: 'responde mejor a lo que has indicado sobre tu movilidad física' },
  { pregunta: 1, motivo: 'encaja mejor con la distancia de tu trayecto' },
];

export interface Resultado {
  tipo: TipoTransporte;
  puntos: Record<TipoTransporte, number>;
  /** Otros medios con la MISMA puntuación que el recomendado. */
  empatados: TipoTransporte[];
  /** Frase que explica cómo se ha deshecho el empate; vacía si no lo hay. */
  criterioDesempate: string;
  razones: string[];
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

  const peso = (pregunta: number, k: TipoTransporte) => aporte[pregunta]?.[k] ?? 0;
  const ordenar = (a: TipoTransporte, b: TipoTransporte) => {
    if (puntos[a] !== puntos[b]) return puntos[b] - puntos[a];
    for (const { pregunta } of DESEMPATE) {
      const d = peso(pregunta, b) - peso(pregunta, a);
      if (d !== 0) return d;
    }
    return COSTE_MENSUAL_MINIMO[a] - COSTE_MENSUAL_MINIMO[b];
  };
  const orden = [...CLAVES].sort(ordenar);
  const tipo = orden[0];

  const empatados = orden.slice(1).filter((k) => puntos[k] === puntos[tipo]);
  let criterioDesempate = '';
  if (empatados.length > 0) {
    // El criterio que lo separa de CADA empatado; si no es el mismo para todos, se dicen los
    // que han intervenido, en su orden.
    const motivos = [...DESEMPATE.map((d) => d.motivo), 'su coste mensual es el más bajo'];
    const decisivo = (k: TipoTransporte) => {
      const i = DESEMPATE.findIndex(({ pregunta }) => peso(pregunta, tipo) !== peso(pregunta, k));
      return i === -1 ? DESEMPATE.length : i;
    };
    const usados = [...new Set(empatados.map(decisivo))].sort((a, b) => a - b).map((i) => motivos[i]);
    criterioDesempate = `se muestra primero ${CON_ARTICULO[tipo]} porque ${usados.join(' y, a igualdad, ')}`;
  }

  // ─ Razones: las respuestas que más han sumado al medio recomendado ─
  const razones = PREGUNTAS
    .map((p, i) => ({ p, i, valor: peso(p.id, tipo) }))
    .filter((x) => x.valor > 0)
    .sort((a, b) => b.valor - a.valor || a.p.id - b.p.id)
    .slice(0, 3)
    .map(({ p, i, valor }) =>
      `${TEMA[p.id]}: has respondido «${p.opciones[respuestas[i]].texto}», que suma ${puntosEnLetra(valor)} ${aNombre(CON_ARTICULO[tipo])}.`,
    );

  return { tipo, puntos, empatados, criterioDesempate, razones };
}
