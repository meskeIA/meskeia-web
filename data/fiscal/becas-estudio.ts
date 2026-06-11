/**
 * Datos: Becas y ayudas al estudio en España
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No es un cálculo de elegibilidad ni de cuantía.
 * Describe TIPOS de beca y ayuda al estudio estables (marcos normativos
 * generales), no garantiza que un estudiante o familia concretos tengan
 * derecho a percibirlas: los requisitos económicos (umbrales de renta),
 * patrimoniales y académicos se publican cada curso y la concesión depende
 * de una valoración individual del organismo competente. Para comprobar
 * tu caso, usa siempre los simuladores y comprobadores oficiales enlazados.
 *
 * IMPORTANTE — Educación está mayoritariamente transferida a las Comunidades
 * Autónomas. Las becas generales (MEC) y las ayudas NEAE son de ámbito
 * estatal y criterios comunes (excepto País Vasco y Navarra). Comedor,
 * transporte y libros/material dependen casi siempre de la Comunidad
 * Autónoma, el ayuntamiento o el propio centro educativo: aquí solo se indica
 * que existen y dónde consultar, sin detallar 17 sistemas distintos.
 *
 * Fuente: elaboración propia a partir de organismos oficiales (Ministerio de
 * Educación, Formación Profesional y Deportes; Consejerías de Educación de
 * las Comunidades Autónomas; Servicios Sociales; BDNS)
 * Verificado: 2026-06-11
 * URL oficial de referencia: https://www.becaseducacion.gob.es
 */

export const FISCAL_BECAS_ESTUDIO_META = {
  fuente: 'Ministerio de Educación, Formación Profesional y Deportes; Consejerías de Educación de las Comunidades Autónomas; Servicios Sociales; BDNS',
  descripcion: 'Catálogo de tipos de beca y ayuda al estudio (estatal y autonómica) en España',
  verificado: '2026-06-11',
  vigencia: '2025-2026',
  urlOficial: 'https://www.becaseducacion.gob.es',
  nota: 'Describe categorías estables de beca y ayuda (marcos normativos generales), no calcula elegibilidad ni cuantías. Los umbrales de renta, patrimonio y los requisitos académicos se publican cada curso: usa siempre el comprobador/simulador oficial del Ministerio de Educación para tu caso concreto.',
};

export type NivelEstudio =
  | 'educacion-obligatoria'
  | 'bachillerato-fp'
  | 'universidad'
  | 'necesidades-educativas-especiales';

export type NecesidadBeca =
  | 'beca-general'
  | 'comedor'
  | 'transporte'
  | 'libros-material'
  | 'residencia'
  | 'apoyo-discapacidad';

export type PerfilBeca =
  | 'familia-numerosa'
  | 'monoparental'
  | 'renta-baja'
  | 'discapacidad'
  | 'rural'
  | 'violencia-genero';

export interface CategoriaBecaEstudio {
  id: string;
  icono: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  comoFunciona: string;
  organismo: string;
  /** URL absoluta (organismo oficial) o ruta interna ('/...') a otra app meskeIA */
  enlace?: { texto: string; url: string };
  niveles: NivelEstudio[];
  objetivos: NecesidadBeca[];
  perfiles: PerfilBeca[];
  /** Se muestra siempre en los resultados, independientemente del perfil seleccionado */
  siempre?: boolean;
}

export const CATEGORIAS_BECAS_ESTUDIO: CategoriaBecaEstudio[] = [
  {
    id: 'beca-general-mec',
    icono: '🎓',
    nombre: 'Beca General de Estudios Postobligatorios',
    tipo: 'Beca estatal (matrícula + ayuda económica)',
    descripcion:
      'Beca del Ministerio de Educación para Bachillerato, Formación Profesional, estudios universitarios y enseñanzas artísticas superiores, dirigida a compensar el coste de matrícula y los gastos de estudiar según la renta y el patrimonio familiar.',
    comoFunciona:
      'La concesión se basa en tres tipos de requisitos que se publican cada curso: un requisito académico (nota media mínima según los estudios que vayas a cursar), un requisito económico (la renta familiar debe estar por debajo de uno de los umbrales establecidos, que determinan qué componentes recibes) y un requisito patrimonial (límites sobre inmuebles y rendimientos del capital de la familia). Según tu situación puede incluir beca de matrícula, una cuantía fija ligada a la renta, una cuantía variable, y componentes adicionales de residencia o transporte si tienes que desplazarte o alojarte fuera de tu localidad. El comprobador de requisitos del Ministerio te indica con tus datos reales qué umbral te correspondería.',
    organismo: 'Ministerio de Educación, Formación Profesional y Deportes',
    enlace: { texto: 'becaseducacion.gob.es', url: 'https://www.becaseducacion.gob.es' },
    niveles: ['bachillerato-fp', 'universidad'],
    objetivos: ['beca-general', 'residencia', 'transporte'],
    perfiles: ['renta-baja', 'familia-numerosa', 'discapacidad', 'monoparental'],
  },
  {
    id: 'ayuda-neae-mec',
    icono: '🧩',
    nombre: 'Ayudas para alumnado con Necesidad Específica de Apoyo Educativo (NEAE)',
    tipo: 'Ayuda estatal para necesidades educativas especiales',
    descripcion:
      'Convocatoria estatal para alumnado de infantil, primaria, secundaria, bachillerato o FP con discapacidad, trastorno del desarrollo, TDAH, trastorno grave de conducta o de la comunicación y el lenguaje, o altas capacidades.',
    comoFunciona:
      'Igual que la beca general, la concesión depende de un requisito económico (umbrales de renta familiar publicados cada curso) y de la acreditación de la necesidad específica mediante el informe o dictamen del equipo de orientación educativa correspondiente. Según el caso, puede cubrir ayudas de refuerzo educativo (logopedia, apoyo psicopedagógico...), comedor, transporte, residencia y material específico (por ejemplo, productos de apoyo o material adaptado).',
    organismo: 'Ministerio de Educación, Formación Profesional y Deportes',
    enlace: { texto: 'becaseducacion.gob.es', url: 'https://www.becaseducacion.gob.es' },
    niveles: ['educacion-obligatoria', 'bachillerato-fp', 'necesidades-educativas-especiales'],
    objetivos: ['apoyo-discapacidad', 'comedor', 'transporte', 'residencia'],
    perfiles: ['discapacidad'],
  },
  {
    id: 'comedor-escolar',
    icono: '🍽️',
    nombre: 'Ayudas de comedor escolar',
    tipo: 'Ayuda autonómica o municipal',
    descripcion:
      'Reducción o exención del precio del comedor escolar para familias con dificultades económicas, gestionada por cada Comunidad Autónoma, ayuntamiento o, en algunos casos, directamente por el centro educativo (AMPA o consejo escolar).',
    comoFunciona:
      'Cada Comunidad Autónoma fija sus propios umbrales de renta, porcentajes de bonificación (parcial o total) y plazos de solicitud, normalmente al inicio del curso escolar. La secretaría de tu centro educativo o la consejería de educación de tu región pueden indicarte el procedimiento exacto y si existen ayudas adicionales del ayuntamiento.',
    organismo: 'Consejería de Educación de tu Comunidad Autónoma / tu Ayuntamiento / centro educativo',
    niveles: ['educacion-obligatoria', 'bachillerato-fp'],
    objetivos: ['comedor'],
    perfiles: ['renta-baja', 'familia-numerosa', 'monoparental', 'violencia-genero'],
  },
  {
    id: 'transporte-escolar',
    icono: '🚌',
    nombre: 'Ayudas de transporte escolar',
    tipo: 'Ayuda autonómica',
    descripcion:
      'Transporte gratuito o subvencionado para alumnado que no tiene un centro educativo de su nivel a una distancia razonable de su domicilio, especialmente frecuente en zonas rurales.',
    comoFunciona:
      'En la educación obligatoria, el transporte suele ser gratuito cuando no existe centro escolar cercano y lo organiza la Comunidad Autónoma. Para otros niveles o situaciones (centro no asignado por proximidad, necesidades especiales...) puede existir una ayuda económica en lugar de transporte organizado. Consulta con la consejería de educación de tu región o con la secretaría del centro.',
    organismo: 'Consejería de Educación de tu Comunidad Autónoma',
    niveles: ['educacion-obligatoria'],
    objetivos: ['transporte'],
    perfiles: ['rural', 'discapacidad'],
  },
  {
    id: 'libros-material-escolar',
    icono: '📚',
    nombre: 'Ayudas para libros de texto y material escolar',
    tipo: 'Ayuda autonómica o municipal',
    descripcion:
      'Programas de gratuidad de libros de texto (préstamo o "banco de libros"), cheques o ayudas económicas para material escolar, dirigidos a reducir el gasto de inicio de curso de las familias.',
    comoFunciona:
      'El sistema varía mucho según la región: algunas Comunidades Autónomas ofrecen libros en préstamo gratuito para todo el alumnado de determinados cursos, otras conceden ayudas económicas según la renta familiar, y en otros casos es el propio centro (a través del banco de libros o el AMPA) quien gestiona la reutilización de libros. La secretaría del centro o la consejería de educación de tu región te informan del programa vigente.',
    organismo: 'Consejería de Educación de tu Comunidad Autónoma / tu Ayuntamiento / centro educativo',
    niveles: ['educacion-obligatoria', 'bachillerato-fp'],
    objetivos: ['libros-material'],
    perfiles: ['renta-baja', 'familia-numerosa'],
  },
  {
    id: 'becas-comunidad-autonoma',
    icono: '🏛️',
    nombre: 'Becas y ayudas propias de tu Comunidad Autónoma',
    tipo: 'Convocatorias autonómicas',
    descripcion:
      'Además de las becas estatales, muchas Comunidades Autónomas convocan sus propias ayudas: becas de excelencia académica, complementos a la beca general, ayudas para estudios en el extranjero, material informático o conectividad, entre otras.',
    comoFunciona:
      'Estas convocatorias son adicionales y compatibles, en general, con las becas estatales (siempre que las bases de cada una no indiquen lo contrario). Sus requisitos, plazos y cuantías son propios de cada región y cambian cada curso: la consejería de educación de tu Comunidad Autónoma es la fuente más fiable para conocer qué hay disponible.',
    organismo: 'Consejería de Educación de tu Comunidad Autónoma',
    niveles: [],
    objetivos: [],
    perfiles: [],
    siempre: true,
  },
  {
    id: 'servicios-sociales-becas',
    icono: '🆘',
    nombre: 'Servicios Sociales de tu Ayuntamiento',
    tipo: 'Punto de información y ayudas locales',
    descripcion:
      'Si la situación económica de tu familia es urgente y necesitas apoyo inmediato (alimentación, material escolar, suministros), los Servicios Sociales municipales pueden orientarte sobre los recursos disponibles, incluidas ayudas de emergencia compatibles con las becas educativas.',
    comoFunciona:
      'Es el punto de partida recomendado si tu situación es urgente o no encaja claramente en las demás categorías: pueden informarte sobre el conjunto de ayudas municipales y autonómicas disponibles para tu caso, incluida la tramitación de becas si necesitas apoyo para solicitarlas.',
    organismo: 'Servicios Sociales de tu Ayuntamiento / Comunidad Autónoma',
    niveles: [],
    objetivos: [],
    perfiles: [],
    siempre: true,
  },
  {
    id: 'bdns-buscador-becas',
    icono: '🔍',
    nombre: 'BDNS — Base de Datos Nacional de Subvenciones',
    tipo: 'Buscador oficial',
    descripcion:
      'El registro oficial donde se publican todas las convocatorias de ayudas y subvenciones públicas activas en España, incluidas muchas becas y ayudas al estudio estatales, autonómicas y locales.',
    comoFunciona:
      'Es un buscador, no una ayuda en sí misma. Permite filtrar por administración convocante, tipo de beneficiario y fecha para ver qué convocatorias de becas están abiertas ahora mismo en tu región.',
    organismo: 'Ministerio de Hacienda',
    enlace: { texto: 'infosubvenciones.es', url: 'https://www.infosubvenciones.es' },
    niveles: [],
    objetivos: [],
    perfiles: [],
    siempre: true,
  },
];
