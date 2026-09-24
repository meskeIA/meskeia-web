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
 *
 *  3. Restricciones declaradas (hallazgos 1445, 1446 y 1447; familia selector-*, forma a). Cuatro
 *     respuestas no son preferencias sino límites que la propia ficha de cada vía permite comprobar:
 *       · presupuesto «Menos de 2.000 €» → fuera la vía cuyo coste orientativo EMPIEZA por encima;
 *       · tiempo «3-6 meses a tiempo completo» o «Unas semanas o meses» → fuera las vías que duran
 *         un año o más (máster, FP de grado superior, oposiciones);
 *       · urgencia «Lo antes posible, en meses» → lo mismo;
 *       · «Necesito un título universitario oficial reconocido» → solo el máster lo da.
 *     Se recomienda la vía de más afinidad entre las que cumplen todos los límites. Si ninguna los
 *     cumple todos, la que incumple MENOS (a igualdad, la de más afinidad), y la pantalla dice cuál
 *     no cumple y por qué. Las demás respuestas siguen siendo pesos: «Prefiero titulación pública»
 *     o «certificado internacional» expresan una preferencia, no una imposibilidad.
 *
 *  4. Coste del máster (hallazgo 1448). La ficha decía «3.000 – 30.000 €» y COSTE_MINIMO desempataba
 *     con 3.000 €; en universidad pública, 60 ECTS cuestan 820,80 € en Andalucía (ver FORMACIONES).
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
  /** Duración mínima en meses de la horquilla de `duracion`: la usa el filtro de tiempo. */
  duracionMinimaMeses: number;
  coste: string;
  /** Solo el máster da un título universitario oficial. */
  daTituloUniversitario: boolean;
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
    // 60, 90 o 120 ECTS (RD 822/2021, art. 17.1) a 60 ECTS por curso (RD 1125/2003, art. 4.1).
    duracion: '1-2 años',
    duracionMinimaMeses: 12,
    // 60 ECTS × 13,68 €/crédito en primera matrícula de un máster no habilitante en Andalucía,
    // curso 2026/2027 (Junta de Andalucía, nota de agosto de 2026, que la sitúa entre las
    // comunidades más económicas). Antes: «3.000 – 30.000 €», sin fuente (hallazgo 1448).
    coste: '820,80 € o más (60 ECTS en universidad pública de Andalucía; el precio por crédito lo fija cada comunidad, y en la privada, cada centro)',
    daTituloUniversitario: true,
  },
  fp_superior: {
    tipo: 'fp_superior',
    titulo: 'FP de Grado Superior',
    descripcion:
      'La Formación Profesional de Grado Superior ofrece formación práctica con alta empleabilidad, titulación pública reconocida y costes muy inferiores a los de un máster. Está pensada para sectores industriales, sanitarios, de gestión o servicios.',
    icono: '🔧',
    // «Alta tasa de inserción laboral» sin cifra ni fuente: la estadística oficial da un 51,1 % de
    // afiliación al primer año (ver la guía, hallazgo 1453).
    puntos: ['Titulación pública oficial', 'Orientada al empleo', 'Prácticas en empresa incluidas', 'Opción de FP Dual'],
    duracion: '1-2 años',
    duracionMinimaMeses: 12,
    coste: '0 – 2.000 € (pública/privada)',
    daTituloUniversitario: false,
  },
  bootcamp: {
    tipo: 'bootcamp',
    titulo: 'Bootcamp / Formación Online Intensiva',
    descripcion:
      'El bootcamp o la formación online intensiva es la vía corta hacia un puesto, sobre todo en tecnología o para cambiar de sector: prima las habilidades prácticas sobre el título, y se completa en meses.',
    icono: '💻',
    puntos: ['Resultados rápidos (3-6 meses)', 'Enfocado en tecnología', 'Orientado a proyectos reales', 'Comunidad y networking activo'],
    duracion: '3-6 meses',
    duracionMinimaMeses: 3,
    coste: '2.000 – 12.000 €',
    daTituloUniversitario: false,
  },
  oposiciones: {
    tipo: 'oposiciones',
    titulo: 'Preparación de Oposiciones',
    descripcion:
      'Las oposiciones son la vía del empleo público en la Administración, la educación o la justicia. Piden una preparación larga y exigente, y a cambio ofrecen una plaza estable con condiciones reguladas.',
    icono: '🏛️',
    puntos: ['Plaza pública estable', 'Sueldo con progresión regulada', 'Conciliación y derechos laborales', 'Posibilidad de estudio autónomo'],
    duracion: '2-5 años de preparación',
    duracionMinimaMeses: 24,
    coste: '500 – 3.000 € (academia/materiales)',
    daTituloUniversitario: false,
  },
  certificacion: {
    tipo: 'certificacion',
    titulo: 'Certificación Profesional',
    descripcion:
      'Las certificaciones profesionales (PMP, AWS, CFA, Google, Microsoft…) validan habilidades concretas, se obtienen en semanas o meses y tienen reconocimiento internacional. Rinden más cuando se apoyan en experiencia laboral previa.',
    icono: '🏅',
    puntos: ['Reconocimiento internacional', 'Formato flexible y online', 'Valida habilidades concretas', 'Actualizable y renovable'],
    duracion: 'Semanas a 6 meses',
    duracionMinimaMeses: 0,
    coste: '200 – 3.000 €',
    daTituloUniversitario: false,
  },
};

/**
 * Nombre corto de cada vía para la comparativa. Sin el emoji: iba dentro de la cadena y el lector
 * de pantalla lo leía en voz alta (hallazgo 1456); la página lo pinta aparte, con aria-hidden, desde
 * FORMACIONES[tipo].icono.
 */
export const LABELS: Record<TipoFormacion, string> = {
  master: 'Máster',
  fp_superior: 'FP Superior',
  bootcamp: 'Bootcamp',
  oposiciones: 'Oposiciones',
  certificacion: 'Certificación',
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
 * Mínimo de la horquilla de coste que publica cada ficha, en euros: lo usa el filtro de
 * presupuesto y es el último criterio de desempate. FP 0 € · certificación 200 € · oposiciones
 * 500 € · máster 820,80 € (60 ECTS en universidad pública de Andalucía; antes 3.000 €, hallazgo
 * 1448) · bootcamp 2.000 €.
 */
export const COSTE_MINIMO: Record<TipoFormacion, number> = {
  fp_superior: 0,
  certificacion: 200,
  oposiciones: 500,
  master: 820.8,
  bootcamp: 2000,
};

/** Los cuatro límites declarables (ver la cabecera, punto 3). */
export type Restriccion = 'presupuesto' | 'tiempo' | 'urgencia' | 'titulo';

/** Presupuesto máximo de cada respuesta de la pregunta 4, en euros (por índice de opción). */
const PRESUPUESTO_MAXIMO = [2000, 6000, 15000, Infinity];

/** Meses que caben en cada respuesta de tiempo (pregunta 2) y de urgencia (pregunta 9). */
const MESES_TIEMPO = [6, 24, 48, 6];
const MESES_URGENCIA = [6, 24, 60, Infinity];

/** Qué límites incumple cada vía con estas respuestas. */
function incumplimientos(tipo: TipoFormacion, respuestas: Record<number, number>): Restriccion[] {
  const f = FORMACIONES[tipo];
  const lista: Restriccion[] = [];
  // «Menos de 2.000 €»: fuera la vía cuyo coste orientativo EMPIEZA en 2.000 € o más.
  if (COSTE_MINIMO[tipo] >= (PRESUPUESTO_MAXIMO[respuestas[4]] ?? Infinity)) lista.push('presupuesto');
  // Una vía que dura como mínimo un año no cabe en «3-6 meses» ni en «unas semanas o meses»; con
  // «1-2 años» o más, las horquillas se solapan y no se descarta nada.
  if (f.duracionMinimaMeses > (MESES_TIEMPO[respuestas[2]] ?? Infinity)) lista.push('tiempo');
  if (f.duracionMinimaMeses > (MESES_URGENCIA[respuestas[9]] ?? Infinity)) lista.push('urgencia');
  if (respuestas[10] === 0 && !f.daTituloUniversitario) lista.push('titulo');
  return lista;
}

/** Cómo se dice, en la comparativa, cada límite incumplido. */
export const RESTRICCION_CORTA: Record<Restriccion, string> = {
  presupuesto: 'fuera de tu presupuesto',
  tiempo: 'más larga que tu tiempo disponible',
  urgencia: 'más larga que tu urgencia',
  titulo: 'sin título universitario oficial',
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
  /** La recomendada primero; después las demás, de más a menos afinidad, con el mismo criterio. */
  orden: TipoFormacion[];
  /** Las vías entre las que se ha elegido: las que incumplen menos límites (idealmente, ninguno). */
  candidatas: TipoFormacion[];
  /** Qué límites declarados incumple cada vía. */
  incumple: Record<TipoFormacion, Restriccion[]>;
  /** Otras candidatas con la MISMA puntuación que la recomendada. */
  empatadas: TipoFormacion[];
  /** Frase que explica cómo se ha deshecho el empate; vacía si no lo hay. */
  criterioDesempate: string;
  razones: string[];
  /**
   * Aviso de restricciones: o la recomendada incumple algo (no había ninguna que lo cumpliera
   * todo), o una vía con más afinidad se ha apartado por un límite. Vacío si no hay nada que decir.
   */
  avisoRestricciones: string;
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
  // ─ Límites declarados: se elige entre las vías que incumplen menos (hallazgos 1445-1447) ─
  const incumple = Object.fromEntries(CLAVES.map((k) => [k, incumplimientos(k, respuestas)])) as Record<TipoFormacion, Restriccion[]>;
  const menosIncumplidos = Math.min(...CLAVES.map((k) => incumple[k].length));
  const candidatas = CLAVES.filter((k) => incumple[k].length === menosIncumplidos).sort(ordenar);
  const tipo = candidatas[0];
  const orden = [tipo, ...CLAVES.filter((k) => k !== tipo).sort(ordenar)];

  const empatadas = candidatas.slice(1).filter((k) => puntos[k] === puntos[tipo]);
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

  // ─ Aviso de restricciones ─
  const motivo = (k: TipoFormacion, r: Restriccion): string => {
    const f = FORMACIONES[k];
    switch (r) {
      case 'presupuesto':
        return `su coste orientativo empieza en ${f.coste.split(' ')[0]} €, y tu presupuesto es de menos de 2.000 €`;
      case 'tiempo':
        return `dura ${f.duracion}, más de lo que puedes dedicar («${PREGUNTAS[1].opciones[respuestas[2]].texto}»)`;
      case 'urgencia':
        return incumple[k].includes('tiempo')
          ? 'tampoco encaja con tu urgencia de incorporarte en meses'
          : `dura ${f.duracion}, y necesitas incorporarte lo antes posible, en meses`;
      case 'titulo':
        return 'no da un título universitario oficial, y has respondido que lo necesitas';
    }
  };
  const motivos = (k: TipoFormacion) => {
    const partes = incumple[k].map((r) => motivo(k, r));
    return partes.length <= 1 ? partes.join('') : `${partes.slice(0, -1).join('; ')}; y ${partes[partes.length - 1]}`;
  };
  let avisoRestricciones = '';
  if (incumple[tipo].length > 0) {
    avisoRestricciones = `Ninguna vía cumple a la vez todo lo que has declarado. ${capitalizar(CON_ARTICULO[tipo])} es la que menos choca con tus límites, pero ${motivos(tipo)}.`;
  } else {
    const apartada = orden.find((k) => incumple[k].length > 0 && puntos[k] > puntos[tipo]);
    if (apartada) {
      avisoRestricciones = `Por afinidad encajaría más ${CON_ARTICULO[apartada]} (${puntosEnLetra(puntos[apartada])}), pero ${motivos(apartada)}.`;
    }
  }

  return { tipo, puntos, orden, candidatas, incumple, empatadas, criterioDesempate, razones, avisoRestricciones };
}

const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
