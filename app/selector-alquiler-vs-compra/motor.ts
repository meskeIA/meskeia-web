/**
 * Motor de selector-alquiler-vs-compra.
 *
 * Vive aparte, sin dependencias, para poder enumerar todas las combinaciones de respuestas sin
 * navegador: mismo patrón que `app/selector-mascota/motor.ts` (commit 934e57bc). Las preguntas,
 * sus puntos y los umbrales (+8 compra, −8 alquila) son los MISMOS que tenía la página.
 *
 * Aquí no hay empates que deshacer: es UNA puntuación contra dos umbrales. Lo que cambia son
 * las razones. Antes cada veredicto traía cuatro fijas, y a quien salía «comprar» con un
 * contrato temporal le decía «Tu estabilidad laboral y permanencia prevista justifican la
 * inversión». Ahora se citan las respuestas que más han empujado hacia el veredicto y, aparte,
 * las que empujan en sentido contrario, con la puntuación y los umbrales a la vista.
 *
 * LÍMITES (24/09/2026, hallazgos 1459 y 1460). Dos respuestas describen algo que ninguna otra
 * compensa, y dejaron de ser solo un peso: ver `LIMITES`. Con cualquiera de ellas, «comprar»
 * no sale como recomendación aunque la puntuación pase de +8; sale «esperar», y el resultado
 * dice por qué. Los demás factores (contrato temporal, cambio de ciudad probable, vender sería
 * un problema, préstamos importantes…) son circunstancias que otras respuestas sí pueden
 * compensar, y siguen siendo pesos.
 */

export type VeredictoKey = 'alquila' | 'espera' | 'compra';

export interface Pregunta {
  id: string;
  categoria: string;
  icono: string;
  texto: string;
  opciones: { valor: string; etiqueta: string; descripcion: string; puntos: number }[];
}

/** A partir de esta puntuación, la orientación es comprar; hasta su opuesto, alquilar. */
export const UMBRAL = 8;

export const PREGUNTAS: Pregunta[] = [
  {
    id: 'horizonte',
    categoria: 'Horizonte Temporal',
    icono: '📅',
    texto: '¿Cuánto tiempo prevés quedarte en esta ciudad o zona?',
    opciones: [
      { valor: 'corto', etiqueta: 'Menos de 3 años', descripcion: 'Situación temporal o en revisión', puntos: -4 },
      { valor: 'medio', etiqueta: 'Entre 3 y 7 años', descripcion: 'Probable, aunque puede cambiar', puntos: -1 },
      { valor: 'largo', etiqueta: 'Más de 7 años', descripcion: 'Tengo muy claro que me quedo', puntos: 3 },
      { valor: 'indefinido', etiqueta: 'Indefinidamente', descripcion: 'Esta es mi ciudad definitiva', puntos: 4 },
    ],
  },
  {
    id: 'laboral',
    categoria: 'Estabilidad Laboral',
    icono: '💼',
    texto: '¿Cuál es tu situación laboral actual?',
    opciones: [
      { valor: 'indefinido', etiqueta: 'Contrato indefinido o funcionario', descripcion: 'Estabilidad garantizada', puntos: 4 },
      { valor: 'temporal', etiqueta: 'Contrato temporal o en transición', descripcion: 'Incertidumbre a corto plazo', puntos: -3 },
      { valor: 'autonomo_consolidado', etiqueta: 'Autónomo consolidado (+3 años)', descripcion: 'Ingresos estables y predecibles', puntos: 2 },
      { valor: 'autonomo_reciente', etiqueta: 'Autónomo reciente o sin contrato', descripcion: 'Situación todavía en consolidación', puntos: -4 },
    ],
  },
  {
    id: 'ahorro',
    categoria: 'Capacidad de Entrada',
    icono: '💰',
    texto: '¿Cuánto ahorro tienes disponible para la entrada y gastos?',
    opciones: [
      // Las descripciones cuadran con la FAQ: el banco suele financiar hasta el 80 %, así que la
      // entrada (20 %) y los gastos salen del ahorro. Decían «Lo mínimo, con poco margen» del 10
      // al 20 %, que no llega en ninguna comunidad, y «Entrada cómoda con algo de colchón» del 20
      // al 30 % (hallazgo 1461).
      { valor: 'bajo', etiqueta: 'Menos del 10% del precio buscado', descripcion: 'No llega a la entrada que el banco no suele financiar', puntos: -4 },
      { valor: 'justo', etiqueta: 'Entre el 10% y el 20%', descripcion: 'Todavía no cubre la entrada y los gastos sin aval ni ayuda', puntos: -1 },
      { valor: 'suficiente', etiqueta: 'Entre el 20% y el 30%', descripcion: 'Cubre la entrada; los gastos, según la comunidad y la vivienda', puntos: 2 },
      { valor: 'holgado', etiqueta: 'Más del 30%', descripcion: 'Cubre la entrada y los gastos en la mayoría de casos', puntos: 4 },
    ],
  },
  {
    id: 'flexibilidad',
    categoria: 'Flexibilidad Geográfica',
    icono: '📍',
    texto: '¿Podrías tener que cambiar de ciudad por trabajo u otros motivos?',
    opciones: [
      { valor: 'alta', etiqueta: 'Sí, es bastante probable', descripcion: 'Movilidad laboral o personal alta', puntos: -4 },
      { valor: 'media', etiqueta: 'No descarto que ocurra', descripcion: 'Podría pasar, aunque no es seguro', puntos: -1 },
      { valor: 'baja', etiqueta: 'Muy improbable, estoy arraigado/a', descripcion: 'Mi vida está centrada aquí', puntos: 3 },
      { valor: 'remoto', etiqueta: 'Trabajo en remoto, tengo libertad total', descripcion: 'Puedo elegir sin depender del trabajo', puntos: 1 },
    ],
  },
  {
    id: 'familiar',
    categoria: 'Situación Personal',
    icono: '👨‍👩‍👧',
    texto: '¿Cómo es tu situación familiar actual y a corto plazo?',
    opciones: [
      { valor: 'solo', etiqueta: 'Vivo solo/a, sin planes inmediatos', descripcion: 'Necesidades de espacio pueden cambiar poco', puntos: -1 },
      { valor: 'pareja', etiqueta: 'En pareja, sin hijos aún', descripcion: 'Situación estable pero puede evolucionar', puntos: 1 },
      { valor: 'hijos', etiqueta: 'Con hijos o planificándolos', descripcion: 'La estabilidad residencial importa más', puntos: 3 },
      { valor: 'cambio', etiqueta: 'En transición (separación, nido vacío...)', descripcion: 'Mejor esperar a que se estabilice', puntos: -2 },
    ],
  },
  {
    id: 'mercado',
    categoria: 'Mercado Local',
    icono: '🏙️',
    texto: '¿Cómo describes el mercado inmobiliario de tu zona?',
    opciones: [
      { valor: 'compra_asequible', etiqueta: 'Alquiler caro, compra más razonable', descripcion: 'La compra tiene ventaja económica', puntos: 3 },
      { valor: 'compra_cara', etiqueta: 'Compra muy cara, alquiler razonable', descripcion: 'El alquiler es más eficiente aquí', puntos: -3 },
      { valor: 'ambos_caros', etiqueta: 'Ambos están muy caros', descripcion: 'Mercado tenso, difícil en cualquier opción', puntos: -2 },
      { valor: 'equilibrado', etiqueta: 'Equilibrado, sin grandes diferencias', descripcion: 'La decisión depende más de factores personales', puntos: 0 },
    ],
  },
  {
    id: 'deuda',
    categoria: 'Tolerancia a la Deuda',
    icono: '📊',
    texto: '¿Cómo te sientes respecto a tener una hipoteca?',
    opciones: [
      { valor: 'ansiedad', etiqueta: 'Me incomoda asumir una deuda grande y prolongada', descripcion: 'Esa preferencia es legítima y conviene tenerla en cuenta', puntos: -3 },
      { valor: 'acepta', etiqueta: 'La acepto si los números tienen sentido', descripcion: 'Visión pragmática y razonada', puntos: 1 },
      { valor: 'normal', etiqueta: 'La veo como un instrumento financiero que estoy dispuesto a usar', descripcion: 'Mayor disposición a usar palanca financiera', puntos: 3 },
      { valor: 'liquidez', etiqueta: 'Prefiero mantener liquidez', descripcion: 'El ahorro accesible te da más tranquilidad', puntos: -2 },
    ],
  },
  {
    id: 'cargas',
    categoria: 'Cargas Económicas',
    icono: '⚖️',
    texto: '¿Tienes préstamos, deudas u otras cargas económicas significativas?',
    opciones: [
      { valor: 'sin_cargas', etiqueta: 'No, situación económica despejada', descripcion: 'Puedes destinar más capacidad a la hipoteca', puntos: 3 },
      { valor: 'prestamos', etiqueta: 'Sí, préstamos o deudas importantes', descripcion: 'La hipoteca se suma a una carga ya elevada', puntos: -3 },
      { valor: 'dependientes', etiqueta: 'Tengo dependientes a mi cargo', descripcion: 'Más gastos fijos, menos margen', puntos: -1 },
      { valor: 'leve', etiqueta: 'Solo algo menor (coche, tarjeta...)', descripcion: 'Manejable, no compromete la hipoteca', puntos: 1 },
    ],
  },
  {
    id: 'riesgo_venta',
    categoria: 'Riesgo de Venta Anticipada',
    icono: '🔄',
    texto: '¿Qué pasaría si tuvieras que vender la vivienda en 3-4 años?',
    opciones: [
      { valor: 'grave', etiqueta: 'Sería un problema grave', descripcion: 'No tienes colchón para absorber pérdidas', puntos: -3 },
      { valor: 'aceptable', etiqueta: 'Me generaría pérdidas asumibles', descripcion: 'Puedes permitirte ese riesgo', puntos: 0 },
      { valor: 'margen', etiqueta: 'Tengo margen, no me preocupa', descripcion: 'Posición económica sólida', puntos: 2 },
      { valor: 'no_quiero', etiqueta: 'No quiero asumir ese riesgo en ningún caso', descripcion: 'La aversión al riesgo también es válida', puntos: -2 },
    ],
  },
  {
    id: 'prioridad',
    categoria: 'Prioridad Personal',
    icono: '🎯',
    texto: '¿Qué es lo más importante para ti en esta decisión?',
    opciones: [
      { valor: 'patrimonio', etiqueta: 'Construir patrimonio a largo plazo', descripcion: 'Tener vivienda en propiedad como objetivo', puntos: 3 },
      { valor: 'libertad', etiqueta: 'Flexibilidad y libertad de movimiento', descripcion: 'Poder cambiar de ciudad, zona o tamaño sin penalizaciones', puntos: -3 },
      { valor: 'estabilidad', etiqueta: 'Estabilidad y echar raíces', descripcion: 'Un hogar propio donde construir vida', puntos: 2 },
      { valor: 'gasto', etiqueta: 'Optimizar el gasto mensual', descripcion: 'Lo que más compense financieramente mes a mes', puntos: 0 },
    ],
  },
];

/**
 * Lo declarado que la puntuación no puede compensar (hallazgos 1459 y 1460).
 *
 *  · AHORRO por debajo del 20 %. La propia FAQ lo dice: el banco suele financiar como máximo el
 *    80 % del valor de tasación (Banco de España, Portal del Cliente Bancario), así que la
 *    entrada y los gastos de compra salen del ahorro. Con menos del 20 % no se llega ni a la
 *    entrada, en ninguna comunidad. La única salida general es el aval ICO para la primera
 *    vivienda (jóvenes y familias con hijos menores), y eso lo tiene que comprobar la persona:
 *    el test no pregunta la edad ni los ingresos. Por eso «esperar» y no «comprar», y el aviso
 *    lo nombra. Antes, 13.620 perfiles con «Menos del 10 %» salían en «comprar».
 *  · HORIZONTE de menos de 3 años. La guía de la propia app: los gastos de compra no se
 *    recuperan al vender, y en ese plazo solo compensan si la vivienda se revaloriza o el
 *    alquiler ahorrado supera con creces lo que cuesta ser propietario, cosas que no se pueden
 *    dar por hechas. Antes, 12.340 perfiles con «Menos de 3 años» salían en «comprar».
 */
export type LimiteId = 'ahorro' | 'horizonte';

export const LIMITES: { id: LimiteId; pregunta: string; valores: string[] }[] = [
  { id: 'ahorro', pregunta: 'ahorro', valores: ['bajo', 'justo'] },
  { id: 'horizonte', pregunta: 'horizonte', valores: ['corto'] },
];

export interface Limite {
  id: LimiteId;
  /** La respuesta literal que lo dispara, para citarla. */
  etiqueta: string;
}

/**
 * El plazo para que comprar compense, dicho UNA vez para la guía y el FAQPage (hallazgo 1463).
 * Antes la guía decía «entre 5 y 8 años» y «más de 7-10 años», y la FAQ, «7 a 12 años» según
 * unos «estudios sobre el mercado español» que no citaba. Sin una fuente que sostenga una
 * horquilla, se dice de qué depende y qué hace ESTE test con el plazo, con sus propios tramos.
 */
export const FRASE_SIN_PLAZO_UNIVERSAL =
  'No hay un número de años que valga para todos: depende de los gastos de compra y de venta, de lo que cueste el alquiler frente a ser propietario y de cómo evolucionen los precios.';

const etiquetaHorizonte = (valor: string): string =>
  PREGUNTAS[0].opciones.find((o) => o.valor === valor)?.etiqueta ?? valor;

export const FRASE_PLAZO_DEL_TEST =
  `Este test trata un horizonte de «${etiquetaHorizonte('corto')}» como un límite (con él no recomienda comprar, ` +
  `digan lo que digan las demás respuestas) y uno de «${etiquetaHorizonte('largo')}» o ` +
  `«${etiquetaHorizonte('indefinido')}» como un factor a favor.`;

/** La descripción del veredicto cuando un límite ha apartado «comprar». */
export const DESCRIPCION_LIMITADA =
  'Por puntuación, tus respuestas apuntarían a comprar, pero has declarado algo que ninguna otra respuesta compensa: mientras siga así, comprar no sale como recomendación. Justo debajo tienes qué es y qué puedes hacer.';

export const VEREDICTOS: Record<VeredictoKey, {
  icono: string;
  etiqueta: string;
  titulo: string;
  descripcion: string;
}> = {
  alquila: {
    icono: '🏠',
    etiqueta: 'Recomendación',
    titulo: 'Por ahora, mejor alquilar',
    descripcion: 'El conjunto de tus respuestas se inclina hacia mantener, por ahora, la flexibilidad del alquiler. Esto no significa que nunca compres: abajo tienes qué respuestas pesan más en esa dirección y cuáles apuntan a la compra.',
  },
  espera: {
    icono: '⏳',
    etiqueta: 'Recomendación',
    titulo: 'Espera antes de decidir',
    descripcion: 'Tus respuestas tienen elementos a favor y en contra que se compensan: no hay una orientación clara en este momento. Abajo tienes lo que empuja en cada dirección; mejor esperar a que el panorama se aclare.',
  },
  compra: {
    icono: '🔑',
    etiqueta: 'Recomendación',
    titulo: 'Tu situación apunta a comprar',
    descripcion: 'El conjunto de tus respuestas se inclina con claridad hacia la compra. No significa que sea fácil: abajo tienes qué respuestas pesan a favor y cuáles en contra, para que compruebes que el resultado se sostiene en tu caso.',
  },
};

/**
 * Los próximos pasos, según el veredicto Y lo declarado. Eran fijos por veredicto, y a quien
 * salía «alquilar» con más del 30 % ahorrado le decían «Establece un objetivo de ahorro para
 * la entrada» (hallazgo 1465).
 */
function proximosPasos(veredicto: VeredictoKey, limitado: boolean, limites: Limite[], respuestas: Record<string, string>): string[] {
  const ahorroCorto = LIMITES[0].valores.includes(respuestas.ahorro);
  if (veredicto === 'compra') {
    return [
      'Usa la calculadora de alquiler vs compra para validar los números de tu caso concreto',
      'Consulta con una entidad financiera para conocer tu capacidad hipotecaria real',
      'Analiza el mercado de tu zona y define tu presupuesto máximo',
      'Plantéate contratar un seguro de hogar adecuado antes de escriturar',
    ];
  }
  if (veredicto === 'alquila') {
    return [
      'Define un plazo en el que revisarás esta decisión (1-2 años)',
      ahorroCorto
        ? 'Establece un objetivo de ahorro para la entrada y los gastos de compra'
        : 'Tu ahorro ya alcanza la entrada: lo que inclina el resultado hacia el alquiler son otros factores',
      'Sigue el mercado de tu zona sin prisas',
      'Compara con la calculadora de alquiler vs compra cuando tengas datos concretos',
    ];
  }
  if (limitado) {
    const pasos: string[] = [];
    if (limites.some((l) => l.id === 'ahorro')) {
      pasos.push(
        'Calcula cuánto te falta: la entrada que el banco no financia más los gastos de compra de tu comunidad',
        'Comprueba si cumples los requisitos del aval ICO para la primera vivienda',
      );
    }
    if (limites.some((l) => l.id === 'horizonte')) {
      pasos.push('Repite el test cuando sepas si vas a quedarte más de 3 años en la zona');
    }
    pasos.push('Compara con la calculadora de alquiler vs compra cuando tengas datos concretos');
    return pasos;
  }
  return [
    'Identifica los 1-2 factores que más te frenan y trabájalos',
    'Pon un plazo de revisión: en 6-12 meses repite este test',
    ahorroCorto
      ? 'Mientras tanto, ahorra para la entrada y los gastos de compra'
      : 'Tu ahorro ya alcanza la entrada: lo que falta por aclarar son otros factores',
    'Habla con un profesional inmobiliario o financiero sin compromiso',
  ];
}

export interface Resultado {
  veredicto: VeredictoKey;
  /** El que daría la puntuación sola, antes de aplicar los límites. */
  veredictoPorPuntos: VeredictoKey;
  /** Un límite ha apartado «comprar» (la puntuación pasaba de +8). */
  limitado: boolean;
  /** Los límites declarados, hayan cambiado o no el veredicto. */
  limites: Limite[];
  proximosPasos: string[];
  puntuacion: number;
  respuestasPorCategoria: Record<string, string>;
  /** Las respuestas que más empujan hacia el veredicto (en «espera», hacia comprar). */
  razones: string[];
  /** Las que empujan en sentido contrario (en «espera», hacia alquilar). */
  contrapeso: string[];
}

interface Empuje {
  pregunta: Pregunta;
  etiqueta: string;
  puntos: number;
}

const enLetra = (n: number) => `${Math.abs(n)} ${Math.abs(n) === 1 ? 'punto' : 'puntos'}`;

/** Una respuesta, dicha con su peso y su dirección. */
function frase({ pregunta, etiqueta, puntos }: Empuje): string {
  return puntos > 0
    ? `${pregunta.categoria}: «${etiqueta}» suma ${enLetra(puntos)} hacia la compra.`
    : `${pregunta.categoria}: «${etiqueta}» resta ${enLetra(puntos)}: empuja hacia seguir de alquiler.`;
}

export function calcularResultado(respuestas: Record<string, string>): Resultado {
  const empujes: Empuje[] = [];
  let puntuacion = 0;
  for (const p of PREGUNTAS) {
    const opcion = p.opciones.find((o) => o.valor === respuestas[p.id]);
    if (!opcion) continue;
    puntuacion += opcion.puntos;
    if (opcion.puntos !== 0) empujes.push({ pregunta: p, etiqueta: opcion.etiqueta, puntos: opcion.puntos });
  }

  let veredictoPorPuntos: VeredictoKey;
  if (puntuacion >= UMBRAL) veredictoPorPuntos = 'compra';
  else if (puntuacion <= -UMBRAL) veredictoPorPuntos = 'alquila';
  else veredictoPorPuntos = 'espera';

  const limites: Limite[] = LIMITES.filter((l) => l.valores.includes(respuestas[l.pregunta])).map((l) => ({
    id: l.id,
    etiqueta: PREGUNTAS.find((p) => p.id === l.pregunta)?.opciones.find((o) => o.valor === respuestas[l.pregunta])?.etiqueta ?? '',
  }));
  const limitado = veredictoPorPuntos === 'compra' && limites.length > 0;
  const veredicto: VeredictoKey = limitado ? 'espera' : veredictoPorPuntos;

  // De más a menos peso; a igualdad, en el orden de las preguntas.
  const hacia = (signo: 1 | -1) =>
    empujes
      .map((e, i) => ({ e, i }))
      .filter(({ e }) => Math.sign(e.puntos) === signo)
      .sort((a, b) => Math.abs(b.e.puntos) - Math.abs(a.e.puntos) || a.i - b.i)
      .map(({ e }) => frase(e));
  const aComprar = hacia(1);
  const aAlquilar = hacia(-1);

  let razones: string[];
  let contrapeso: string[];
  if (veredicto === 'compra') {
    razones = aComprar.slice(0, 3);
    contrapeso = aAlquilar.slice(0, 3);
  } else if (veredicto === 'alquila') {
    razones = aAlquilar.slice(0, 3);
    contrapeso = aComprar.slice(0, 3);
  } else {
    razones = aComprar.slice(0, 3);
    contrapeso = aAlquilar.slice(0, 3);
  }

  return {
    veredicto,
    veredictoPorPuntos,
    limitado,
    limites,
    proximosPasos: proximosPasos(veredicto, limitado, limites, respuestas),
    puntuacion,
    respuestasPorCategoria: respuestas,
    razones,
    contrapeso,
  };
}

/** La puntuación con su signo, en tipografía española («+12», «−3», «0»). */
export function puntuacionConSigno(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return '0';
}
