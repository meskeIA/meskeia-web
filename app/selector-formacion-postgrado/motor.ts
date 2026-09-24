/**
 * Motor de recomendación de selector-formacion-postgrado.
 *
 * Vive aparte, sin dependencias, para poder enumerar las 1.048.576 combinaciones de respuestas
 * sin navegador: mismo patrón que `app/selector-mascota/motor.ts` (commit 934e57bc). Las
 * preguntas y sus pesos son los MISMOS que tenía la página; lo que cambia es esto:
 *
 *  1. Empates. Antes el ganador salía de un `reduce` con `>=`, y a igualdad de puntos ganaba
 *     el primero del objeto —siempre el máster— sin decirlo; la comparativa de afinidad, que
 *     ordenaba con un `sort` estable, repetía el mismo sesgo. Ahora, a igualdad de puntos, va
 *     primero la vía que más encaja con tu motivación principal (pregunta 1); si sigue el
 *     empate, con tu objetivo profesional (pregunta 5), y por último la de menor coste mínimo.
 *     El empate se anuncia en pantalla.
 *
 *  2. Razones. La descripción de cada vía afirmaba cosas del usuario que no dependían de sus
 *     respuestas: «Tienes experiencia laboral…» a quien había marcado «Sin experiencia», o
 *     «Tu prioridad es la estabilidad laboral» a quien buscaba cambiar de sector. Ahora la
 *     descripción habla de la vía, y las razones citan las respuestas que más le han sumado.
 */

export type TipoFormacion = 'master' | 'fp_superior' | 'bootcamp' | 'oposiciones' | 'certificacion';

export interface Opcion {
  texto: string;
  icono: string;
  pesos: Partial<Record<TipoFormacion, number>>;
}

export interface Pregunta {
  id: number;
  texto: string;
  icono: string;
  opciones: Opcion[];
}

export interface FormacionInfo {
  tipo: TipoFormacion;
  titulo: string;
  descripcion: string;
  icono: string;
  puntos: string[];
  duracion: string;
  coste: string;
}

export const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuál es tu principal motivación para seguir formándote?',
    icono: '🎯',
    opciones: [
      { texto: 'Conseguir estabilidad laboral y empleo seguro', icono: '🛡️', pesos: { oposiciones: 4, certificacion: 1 } },
      { texto: 'Especializarme académicamente en mi área', icono: '🎓', pesos: { master: 4, fp_superior: 1 } },
      { texto: 'Cambiar de sector rápidamente', icono: '🔄', pesos: { bootcamp: 4, certificacion: 2 } },
      { texto: 'Mejorar mi posición en la empresa actual', icono: '📈', pesos: { certificacion: 4, master: 2 } },
    ],
  },
  {
    id: 2,
    texto: '¿Cuánto tiempo puedes dedicar a la formación?',
    icono: '⏰',
    opciones: [
      { texto: '3-6 meses a tiempo completo', icono: '⚡', pesos: { bootcamp: 4, certificacion: 2 } },
      { texto: '1-2 años compaginando con trabajo', icono: '⚖️', pesos: { master: 3, fp_superior: 3, oposiciones: 2 } },
      { texto: '2-4 años de preparación constante', icono: '📅', pesos: { oposiciones: 4, master: 2 } },
      { texto: 'Unas semanas o meses de aprendizaje flexible', icono: '🗓️', pesos: { certificacion: 4, bootcamp: 2 } },
    ],
  },
  {
    id: 3,
    texto: '¿Cuál es tu situación actual?',
    icono: '💼',
    opciones: [
      { texto: 'Recién graduado/a, sin experiencia laboral', icono: '🆕', pesos: { master: 3, fp_superior: 3, oposiciones: 2 } },
      { texto: 'Trabajo en mi sector y quiero avanzar', icono: '📊', pesos: { certificacion: 4, master: 3 } },
      { texto: 'Trabajo en otro sector y quiero cambiar', icono: '🔀', pesos: { bootcamp: 4, fp_superior: 2 } },
      { texto: 'Llevo tiempo desempleado/a y quiero reincorporarme', icono: '🚀', pesos: { fp_superior: 3, bootcamp: 3, oposiciones: 2 } },
    ],
  },
  {
    id: 4,
    texto: '¿Cuál es tu presupuesto estimado para la formación?',
    icono: '💶',
    opciones: [
      { texto: 'Menos de 2.000 €', icono: '💰', pesos: { oposiciones: 3, certificacion: 4, fp_superior: 2 } },
      { texto: 'Entre 2.000 € y 6.000 €', icono: '💳', pesos: { fp_superior: 3, bootcamp: 3, certificacion: 2 } },
      { texto: 'Entre 6.000 € y 15.000 €', icono: '🏦', pesos: { master: 3, bootcamp: 3 } },
      { texto: 'Más de 15.000 € o dispongo de beca', icono: '🎓', pesos: { master: 4 } },
    ],
  },
  {
    id: 5,
    texto: '¿Qué tipo de objetivo profesional tienes?',
    icono: '🏆',
    opciones: [
      { texto: 'Acceder a un puesto en la Administración Pública', icono: '🏛️', pesos: { oposiciones: 5, certificacion: 1 } },
      { texto: 'Especializarme en un área concreta con título oficial', icono: '📜', pesos: { master: 4, fp_superior: 2 } },
      { texto: 'Trabajar en tecnología o startups', icono: '💻', pesos: { bootcamp: 5, certificacion: 3 } },
      { texto: 'Adquirir habilidades prácticas reconocidas en mi sector', icono: '🔧', pesos: { fp_superior: 4, certificacion: 3 } },
    ],
  },
  {
    id: 6,
    texto: '¿Cuánta experiencia laboral previa tienes?',
    icono: '📋',
    opciones: [
      { texto: 'Sin experiencia o menos de 1 año', icono: '🌱', pesos: { master: 3, fp_superior: 3, oposiciones: 2 } },
      { texto: 'Entre 1 y 3 años de experiencia', icono: '🌿', pesos: { fp_superior: 2, bootcamp: 3, oposiciones: 2 } },
      { texto: 'Entre 3 y 7 años de experiencia', icono: '🌳', pesos: { certificacion: 4, master: 2, bootcamp: 2 } },
      { texto: 'Más de 7 años de experiencia profesional', icono: '🏅', pesos: { certificacion: 5, master: 2 } },
    ],
  },
  {
    id: 7,
    texto: '¿Qué modalidad de estudio prefieres?',
    icono: '🏫',
    opciones: [
      { texto: 'Presencial, con contacto directo con docentes y compañeros', icono: '🏛️', pesos: { master: 3, fp_superior: 3, oposiciones: 2 } },
      { texto: 'Online, con flexibilidad total de horario', icono: '💻', pesos: { bootcamp: 3, certificacion: 4 } },
      { texto: 'Híbrido o semipresencial', icono: '🔄', pesos: { master: 3, fp_superior: 2, bootcamp: 2 } },
      { texto: 'Estudio autónomo en casa', icono: '🏠', pesos: { oposiciones: 4, certificacion: 3 } },
    ],
  },
  {
    id: 8,
    texto: '¿A qué sector te interesa orientar tu carrera?',
    icono: '🏢',
    opciones: [
      { texto: 'Tecnología, datos, programación o ciberseguridad', icono: '💻', pesos: { bootcamp: 5, certificacion: 3 } },
      { texto: 'Administración pública, educación o justicia', icono: '🏛️', pesos: { oposiciones: 5, master: 1 } },
      { texto: 'Empresa, finanzas, marketing o gestión', icono: '📊', pesos: { master: 4, certificacion: 3 } },
      { texto: 'Sanidad, industria, comercio o sector técnico', icono: '⚙️', pesos: { fp_superior: 5, certificacion: 2 } },
    ],
  },
  {
    id: 9,
    texto: '¿Con qué urgencia necesitas incorporarte al mercado laboral?',
    icono: '⏱️',
    opciones: [
      { texto: 'Lo antes posible, en meses', icono: '🚀', pesos: { bootcamp: 4, certificacion: 4 } },
      { texto: 'En 1-2 años, puedo esperar', icono: '⏳', pesos: { master: 3, fp_superior: 4 } },
      { texto: 'En 3-5 años, priorizo la preparación profunda', icono: '🎯', pesos: { oposiciones: 5, master: 2 } },
      { texto: 'No tengo urgencia, me importa más la calidad', icono: '🌟', pesos: { master: 4, fp_superior: 2 } },
    ],
  },
  {
    id: 10,
    texto: '¿Qué importancia le das al título o certificado oficial?',
    icono: '🎓',
    opciones: [
      { texto: 'Necesito un título universitario oficial reconocido', icono: '📜', pesos: { master: 5 } },
      { texto: 'Prefiero titulación pública con valor en el mercado', icono: '🏫', pesos: { fp_superior: 5, oposiciones: 2 } },
      { texto: 'Me interesan más las habilidades que el título', icono: '🔧', pesos: { bootcamp: 4, certificacion: 4 } },
      { texto: 'Quiero un certificado reconocido internacionalmente', icono: '🌍', pesos: { certificacion: 5, master: 2 } },
    ],
  },
];

export const FORMACIONES: Record<TipoFormacion, FormacionInfo> = {
  master: {
    tipo: 'master',
    titulo: 'Máster Universitario',
    descripcion:
      'El máster universitario oficial es la vía de la especialización académica con título reconocido. Pide uno o dos años y suele valorarse en sectores como la empresa, la gestión o las áreas técnicas que miran el expediente académico.',
    icono: '🎓',
    puntos: ['Título oficial universitario', 'Alta especialización académica', 'Redes de contactos universitarias', 'Acceso a doctorado si lo deseas'],
    duracion: '1-2 años',
    coste: '3.000 – 30.000 €',
  },
  fp_superior: {
    tipo: 'fp_superior',
    titulo: 'FP de Grado Superior',
    descripcion:
      'La Formación Profesional de Grado Superior ofrece formación práctica con alta empleabilidad, titulación pública reconocida y costes muy inferiores a los de un máster. Está pensada para sectores industriales, sanitarios, de gestión o servicios.',
    icono: '🔧',
    puntos: ['Titulación pública oficial', 'Alta tasa de inserción laboral', 'Prácticas en empresa incluidas', 'Opción de FP Dual muy valorada'],
    duracion: '1-2 años',
    coste: '0 – 2.000 € (pública/privada)',
  },
  bootcamp: {
    tipo: 'bootcamp',
    titulo: 'Bootcamp / Formación Online Intensiva',
    descripcion:
      'El bootcamp o la formación online intensiva es la vía corta hacia un puesto, sobre todo en tecnología o para cambiar de sector: prima las habilidades prácticas sobre el título, y se completa en meses.',
    icono: '💻',
    puntos: ['Resultados rápidos (3-6 meses)', 'Alta demanda en tecnología', 'Orientado a proyectos reales', 'Comunidad y networking activo'],
    duracion: '3-6 meses',
    coste: '2.000 – 12.000 €',
  },
  oposiciones: {
    tipo: 'oposiciones',
    titulo: 'Preparación de Oposiciones',
    descripcion:
      'Las oposiciones son la vía del empleo público en la Administración, la educación o la justicia. Piden una preparación larga y exigente, y a cambio ofrecen una plaza estable con condiciones reguladas.',
    icono: '🏛️',
    puntos: ['Empleo público estable y vitalicio', 'Sueldo con progresión regulada', 'Conciliación y derechos laborales', 'Posibilidad de estudio autónomo'],
    duracion: '2-5 años de preparación',
    coste: '500 – 3.000 € (academia/materiales)',
  },
  certificacion: {
    tipo: 'certificacion',
    titulo: 'Certificación Profesional',
    descripcion:
      'Las certificaciones profesionales (PMP, AWS, CFA, Google, Microsoft…) validan habilidades concretas, se obtienen en semanas o meses y tienen reconocimiento internacional. Rinden más cuando se apoyan en experiencia laboral previa.',
    icono: '🏅',
    puntos: ['Reconocimiento internacional', 'Formato flexible y online', 'Alta valoración por empresas', 'Actualizable y renovable'],
    duracion: 'Semanas a 6 meses',
    coste: '200 – 3.000 €',
  },
};

export const LABELS: Record<TipoFormacion, string> = {
  master: '🎓 Máster',
  fp_superior: '🔧 FP Superior',
  bootcamp: '💻 Bootcamp',
  oposiciones: '🏛️ Oposiciones',
  certificacion: '🏅 Certificación',
};

/** Orden de declaración: SOLO para recorrer, nunca para desempatar. */
export const CLAVES: TipoFormacion[] = ['master', 'fp_superior', 'bootcamp', 'oposiciones', 'certificacion'];

/** Nombre con artículo, para las frases de las razones y del aviso de empate. */
export const CON_ARTICULO: Record<TipoFormacion, string> = {
  master: 'el máster universitario',
  fp_superior: 'la FP de grado superior',
  bootcamp: 'el bootcamp',
  oposiciones: 'la preparación de oposiciones',
  certificacion: 'la certificación profesional',
};

/**
 * Mínimo de la horquilla de coste que publica cada ficha, en euros: último criterio de
 * desempate. FP 0 € · certificación 200 € · oposiciones 500 € · bootcamp 2.000 € · máster 3.000 €.
 */
export const COSTE_MINIMO: Record<TipoFormacion, number> = {
  fp_superior: 0,
  certificacion: 200,
  oposiciones: 500,
  bootcamp: 2000,
  master: 3000,
};

/** Nombre corto de lo que pregunta cada pregunta, para citar la respuesta en las razones. */
export const TEMA: Record<number, string> = {
  1: 'Motivación',
  2: 'Tiempo disponible',
  3: 'Situación actual',
  4: 'Presupuesto',
  5: 'Objetivo profesional',
  6: 'Experiencia',
  7: 'Modalidad',
  8: 'Sector',
  9: 'Urgencia',
  10: 'Título',
};

/** Las preguntas que deshacen un empate, en orden, y cómo se dice cada una. */
const DESEMPATE: { pregunta: number; motivo: string }[] = [
  { pregunta: 1, motivo: 'encaja mejor con tu motivación principal' },
  { pregunta: 5, motivo: 'encaja mejor con tu objetivo profesional' },
];

export interface Resultado {
  tipo: TipoFormacion;
  puntos: Record<TipoFormacion, number>;
  /** Todas las vías, de más a menos afinidad, con el mismo criterio que elige la ganadora. */
  orden: TipoFormacion[];
  /** Otras vías con la MISMA puntuación que la recomendada. */
  empatadas: TipoFormacion[];
  /** Frase que explica cómo se ha deshecho el empate; vacía si no lo hay. */
  criterioDesempate: string;
  razones: string[];
}

const puntosEnLetra = (n: number) => `${n} ${n === 1 ? 'punto' : 'puntos'}`;

/** «a» + nombre con artículo, con la contracción: «al máster», «a la FP». */
const aNombre = (s: string) => (s.startsWith('el ') ? `al ${s.slice(3)}` : `a ${s}`);

/** `respuestas` guarda, por id de pregunta, el ÍNDICE de la opción elegida. */
export function calcularResultado(respuestas: Record<number, number>): Resultado {
  const puntos = Object.fromEntries(CLAVES.map((k) => [k, 0])) as Record<TipoFormacion, number>;
  const aporte: Record<number, Partial<Record<TipoFormacion, number>>> = {};
  for (const p of PREGUNTAS) {
    const opcion = p.opciones[respuestas[p.id]];
    if (!opcion) continue;
    aporte[p.id] = opcion.pesos;
    for (const k of CLAVES) puntos[k] += opcion.pesos[k] ?? 0;
  }

  const peso = (pregunta: number, k: TipoFormacion) => aporte[pregunta]?.[k] ?? 0;
  const ordenar = (a: TipoFormacion, b: TipoFormacion) => {
    if (puntos[a] !== puntos[b]) return puntos[b] - puntos[a];
    for (const { pregunta } of DESEMPATE) {
      const d = peso(pregunta, b) - peso(pregunta, a);
      if (d !== 0) return d;
    }
    return COSTE_MINIMO[a] - COSTE_MINIMO[b];
  };
  const orden = [...CLAVES].sort(ordenar);
  const tipo = orden[0];

  const empatadas = orden.slice(1).filter((k) => puntos[k] === puntos[tipo]);
  let criterioDesempate = '';
  if (empatadas.length > 0) {
    // El criterio que la separa de CADA empatada; si no es el mismo para todas, se dicen los
    // que han intervenido, en su orden.
    const motivos = [...DESEMPATE.map((d) => d.motivo), 'su coste mínimo es el más bajo'];
    const decisivo = (k: TipoFormacion) => {
      const i = DESEMPATE.findIndex(({ pregunta }) => peso(pregunta, tipo) !== peso(pregunta, k));
      return i === -1 ? DESEMPATE.length : i;
    };
    const usados = [...new Set(empatadas.map(decisivo))].sort((a, b) => a - b).map((i) => motivos[i]);
    criterioDesempate = `se muestra primero ${CON_ARTICULO[tipo]} porque ${usados.join(' y, a igualdad, ')}`;
  }

  // ─ Razones: las respuestas que más han sumado a la vía recomendada ─
  const razones = PREGUNTAS
    .map((p) => ({ p, valor: peso(p.id, tipo) }))
    .filter((x) => x.valor > 0)
    .sort((a, b) => b.valor - a.valor || a.p.id - b.p.id)
    .slice(0, 3)
    .map(({ p, valor }) =>
      `${TEMA[p.id]}: has respondido «${p.opciones[respuestas[p.id]].texto}», que suma ${puntosEnLetra(valor)} ${aNombre(CON_ARTICULO[tipo])}.`,
    );

  return { tipo, puntos, orden, empatadas, criterioDesempate, razones };
}
