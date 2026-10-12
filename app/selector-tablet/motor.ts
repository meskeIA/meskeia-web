/**
 * Motor del Selector de Tablet: preguntas, puntos y las dos reglas que no son puntos.
 *
 * Sin dependencias, para que el spec lo recorra entero sin navegador (174.960 perfiles).
 *
 * 1. Suma de puntos por candidata (android, ios_ipad, windows, ereader, sin_tablet).
 * 2. «Sin tablet» NO sale por puntos (nunca ganaba: hallazgo 3195) sino por el criterio que la
 *    propia guía de la app escribe: «Una tablet aporta valor real cuando lees mucho en pantalla
 *    grande, dibujas digitalmente, tienes hijos en edad escolar o necesitas un segundo dispositivo
 *    más ligero para viajar». Sale cuando no se da ninguno de esos cuatro motivos y ya se usa mucho
 *    un portátil (P10), que es lo que la guía pone en su lugar.
 * 3. Presupuesto (hallazgo 3196, forma del 1678 de selector-smartphone y del 1407 de
 *    selector-portatil): por debajo de TRAMO_MINIMO_IPADOS_NUEVO no hay tablet con iPadOS nueva, así
 *    que esa plataforma se descarta (ni ganadora ni alternativa) y la tarjeta lo dice.
 */

export type TipoTablet = 'android' | 'ios_ipad' | 'windows' | 'ereader' | 'sin_tablet';

export type PuntajeMap = Record<TipoTablet, number>;

export interface Opcion {
  texto: string;
  icono: string;
  puntaje: Partial<PuntajeMap>;
}

export interface Pregunta {
  id: number;
  texto: string;
  opciones: Opcion[];
}

export const ORDEN_TIPOS: TipoTablet[] = ['android', 'ios_ipad', 'windows', 'ereader', 'sin_tablet'];

export const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuál será tu uso principal de la tablet?',
    opciones: [
      { texto: 'Leer libros, revistas o artículos', icono: '📚', puntaje: { ereader: 4, android: 1 } },
      { texto: 'Entretenimiento: vídeo, música y redes sociales', icono: '🎬', puntaje: { android: 3, ios_ipad: 2 } },
      { texto: 'Trabajo y productividad (documentos, correo, videollamadas)', icono: '💼', puntaje: { windows: 3, ios_ipad: 2, android: 1 } },
      { texto: 'Dibujo digital y creatividad', icono: '🎨', puntaje: { ios_ipad: 4, android: 2 } },
      { texto: 'Estudio (apuntes, PDFs, apps educativas)', icono: '🎓', puntaje: { ios_ipad: 3, android: 2, windows: 2 } },
    ],
  },
  {
    id: 2,
    texto: '¿Tienes ya smartphone y cuál es su sistema operativo?',
    opciones: [
      { texto: 'Sí, tengo iPhone (iOS)', icono: '📱', puntaje: { ios_ipad: 3 } },
      { texto: 'Sí, tengo Android', icono: '🤖', puntaje: { android: 2 } },
      { texto: 'No tengo smartphone o tengo un modelo básico', icono: '📵', puntaje: { android: 1, ios_ipad: 1 } },
    ],
  },
  {
    id: 3,
    texto: '¿Cuánto estás dispuesto/a a gastar en la tablet?',
    opciones: [
      { texto: 'Menos de 150 €', icono: '💶', puntaje: { android: 3, ereader: 3, sin_tablet: 2 } },
      { texto: 'Entre 150 € y 350 €', icono: '💵', puntaje: { android: 3, ereader: 2 } },
      { texto: 'Entre 350 € y 700 €', icono: '💴', puntaje: { ios_ipad: 2, android: 1, windows: 2 } },
      { texto: 'Más de 700 €', icono: '💎', puntaje: { ios_ipad: 3, windows: 3 } },
    ],
  },
  {
    id: 4,
    texto: '¿Necesitarás teclado físico para escribir documentos largos?',
    opciones: [
      { texto: 'Sí, es fundamental para mí', icono: '⌨️', puntaje: { windows: 4, ios_ipad: 2 } },
      { texto: 'A veces, pero no es imprescindible', icono: '🤔', puntaje: { ios_ipad: 2, android: 1 } },
      { texto: 'No, escribiré poco o usaré teclado táctil', icono: '👆', puntaje: { android: 2, ereader: 2, sin_tablet: 1 } },
    ],
  },
  {
    id: 5,
    texto: '¿Piensas usar lápiz digital o stylus para dibujar o tomar apuntes?',
    opciones: [
      { texto: 'Sí, es una de mis razones principales para comprar tablet', icono: '✏️', puntaje: { ios_ipad: 4, android: 2 } },
      { texto: 'Quizás lo use ocasionalmente', icono: '🖊️', puntaje: { ios_ipad: 1, android: 1 } },
      { texto: 'No lo usaré', icono: '🚫', puntaje: { android: 1, ereader: 2, sin_tablet: 1 } },
    ],
  },
  {
    id: 6,
    texto: '¿Cuánto lees actualmente (libros, artículos largos)?',
    opciones: [
      { texto: 'Leo mucho, es mi actividad principal en pantalla', icono: '📖', puntaje: { ereader: 4, android: 1 } },
      { texto: 'Leo con regularidad, pero también hago otras cosas', icono: '📰', puntaje: { android: 2, ios_ipad: 1, ereader: 1 } },
      { texto: 'Leo poco; prefiero vídeo y redes sociales', icono: '🎥', puntaje: { android: 2, ios_ipad: 2, sin_tablet: 1 } },
    ],
  },
  {
    id: 7,
    texto: '¿Necesitas compatibilidad con software profesional de escritorio (Adobe CC, Office completo, programas específicos de tu sector)?',
    opciones: [
      { texto: 'Sí, es imprescindible', icono: '🖥️', puntaje: { windows: 4, sin_tablet: 1 } },
      { texto: 'Prefiero versiones móviles o web de esas apps', icono: '☁️', puntaje: { ios_ipad: 2, android: 2 } },
      { texto: 'No necesito software de escritorio', icono: '📲', puntaje: { android: 2, ereader: 1, sin_tablet: 1 } },
    ],
  },
  {
    id: 8,
    texto: '¿Es para un niño o adolescente?',
    opciones: [
      { texto: 'Sí, para un niño menor de 10 años', icono: '👧', puntaje: { android: 3 } },
      { texto: 'Sí, para un adolescente (10-17 años)', icono: '🧑', puntaje: { android: 2, ios_ipad: 2 } },
      { texto: 'No, es para uso adulto', icono: '🧑‍💼', puntaje: { ios_ipad: 1, windows: 1, ereader: 1 } },
    ],
  },
  {
    id: 9,
    texto: '¿Viajas frecuentemente y necesitas usarla fuera de casa durante horas?',
    opciones: [
      { texto: 'Sí, la usaré mucho en transporte y viajes', icono: '✈️', puntaje: { ereader: 2, ios_ipad: 2, android: 2 } },
      { texto: 'Ocasionalmente, pero principalmente en casa', icono: '🏠', puntaje: { android: 1, ereader: 1, sin_tablet: 1 } },
      { texto: 'Prácticamente siempre en casa o la oficina', icono: '🖥️', puntaje: { windows: 1, sin_tablet: 2 } },
    ],
  },
  {
    id: 10,
    texto: '¿Ya tienes un portátil o PC que usas con frecuencia?',
    opciones: [
      { texto: 'Sí, tengo portátil Windows y lo uso mucho', icono: '💻', puntaje: { android: 2, ereader: 1, sin_tablet: 3 } },
      { texto: 'Sí, tengo Mac y lo uso mucho', icono: '🍎', puntaje: { ios_ipad: 3, android: 1 } },
      { texto: 'Tengo PC pero lo uso poco o quiero reemplazarlo', icono: '🖥️', puntaje: { windows: 2, ios_ipad: 1 } },
      { texto: 'No tengo portátil o mi PC está anticuado', icono: '❌', puntaje: { windows: 3, ios_ipad: 2, android: 2 } },
    ],
  },
];

/**
 * Índice (en P3) del primer tramo de presupuesto en el que hay una tablet con iPadOS NUEVA.
 * apple.com/es/shop/buy-ipad, consultado el 12/10/2026: el modelo de entrada sale «Desde 499 €» y
 * el mini «Desde 679 €», así que no hay ninguna en «Menos de 150 €» ni en «Entre 150 € y 350 €».
 * No se guarda el precio, que cambia: solo el tramo, que es lo que usa el motor. Revisar si Apple
 * lanza un modelo por debajo de 350 €.
 */
export const TRAMO_MINIMO_IPADOS_NUEVO = 2;

// Índices de las respuestas que usa el criterio de «Sin tablet» (base 0, en el orden de arriba).
const P1_LEER = 0;
const P1_DIBUJO = 3;
const P5_LAPIZ_PRINCIPAL = 0;
const P6_LEO_MUCHO = 0;
const P8_USO_ADULTO = 2;
const P9_VIAJO = 0;
const P10_PORTATIL_EN_USO = [0, 1];

export type Motivo = 'leer' | 'dibujar' | 'menores' | 'viajar';

export interface ResultadoMotor {
  ganador: TipoTablet;
  alternativas: TipoTablet[];
  totales: PuntajeMap;
  /** Los motivos de la guía para tener tablet que se dan en las respuestas. */
  motivos: Motivo[];
  /** iPadOS fuera por presupuesto (tramo por debajo de TRAMO_MINIMO_IPADOS_NUEVO). */
  ipadosDescartada: boolean;
  /** Sin el filtro de presupuesto habría salido una tablet con iPadOS. */
  ipadosHabriaSalido: boolean;
}

function sumar(respuestas: readonly (number | null)[]): PuntajeMap {
  const totales: PuntajeMap = { android: 0, ios_ipad: 0, windows: 0, ereader: 0, sin_tablet: 0 };
  respuestas.forEach((idx, p) => {
    if (idx === null) return;
    const opcion = PREGUNTAS[p]?.opciones[idx];
    if (!opcion) return;
    for (const tipo of ORDEN_TIPOS) totales[tipo] += opcion.puntaje[tipo] ?? 0;
  });
  return totales;
}

/** Ordena por puntos; a igualdad, el orden de declaración (sort estable). */
function porPuntos(tipos: TipoTablet[], totales: PuntajeMap): TipoTablet[] {
  return [...tipos].sort((a, b) => totales[b] - totales[a]);
}

export function motivosParaTablet(respuestas: readonly (number | null)[]): Motivo[] {
  const r = respuestas;
  const motivos: Motivo[] = [];
  if (r[0] === P1_LEER || r[5] === P6_LEO_MUCHO) motivos.push('leer');
  if (r[0] === P1_DIBUJO || r[4] === P5_LAPIZ_PRINCIPAL) motivos.push('dibujar');
  if (r[7] !== null && r[7] !== undefined && r[7] !== P8_USO_ADULTO) motivos.push('menores');
  if (r[8] === P9_VIAJO) motivos.push('viajar');
  return motivos;
}

export function calcularResultado(respuestas: readonly (number | null)[]): ResultadoMotor {
  const totales = sumar(respuestas);
  const presupuesto = respuestas[2];
  const ipadosDescartada = presupuesto !== null && presupuesto !== undefined && presupuesto < TRAMO_MINIMO_IPADOS_NUEVO;

  // Las tablets compiten por puntos; «Sin tablet» no entra en esa carrera (ver la cabecera).
  const tablets = ORDEN_TIPOS.filter((t) => t !== 'sin_tablet');
  const ipadosHabriaSalido = ipadosDescartada && porPuntos(tablets, totales)[0] === 'ios_ipad';
  const candidatas = tablets.filter((t) => !(ipadosDescartada && t === 'ios_ipad'));

  const motivos = motivosParaTablet(respuestas);
  const portatilEnUso = P10_PORTATIL_EN_USO.includes(respuestas[9] ?? -1);
  const ganador: TipoTablet = motivos.length === 0 && portatilEnUso ? 'sin_tablet' : porPuntos(candidatas, totales)[0];

  const alternativas = porPuntos(
    ORDEN_TIPOS.filter((t) => t !== ganador && !(ipadosDescartada && t === 'ios_ipad')),
    totales,
  ).slice(0, 2);

  return { ganador, alternativas, totales, motivos, ipadosDescartada, ipadosHabriaSalido };
}
