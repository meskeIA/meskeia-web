/**
 * Datos del Marco Europeo de Competencias Digitales para la Ciudadanía — DigComp 2.2 (2022)
 * Fuente: Comisión Europea, Centro Común de Investigación (JRC).
 *   "DigComp 2.2: The Digital Competence Framework for Citizens" (EUR 31006 EN).
 *
 * Adaptación fiel al español para autoevaluación FORMATIVA (no credencial):
 *  - 5 áreas competenciales
 *  - 21 competencias
 *  - 8 niveles agrupados en los 4 tramos con nombre que el propio marco define
 *    (Fundamental 1-2, Intermedio 3-4, Avanzado 5-6, Altamente especializado 7-8)
 *
 * El instrumento es "basado en evidencia": cada tramo se describe con una afirmación
 * concreta de "sé hacer esto" (can-do), no con una etiqueta abstracta. El usuario elige
 * la más alta que puede hacer hoy de forma autónoma. NO es un test que puntúa una nota:
 * deriva un nivel por competencia y, sobre él, un plan de desarrollo por gaps.
 */

export type TramoId = 'fundamental' | 'intermedio' | 'avanzado' | 'especializado';

export interface Tramo {
  id: TramoId;
  nombre: string;
  nivelDigComp: string;
  corto: string;
  descripcion: string;
  valor: number; // 1-4
}

export const TRAMOS: Tramo[] = [
  {
    id: 'fundamental',
    nombre: 'Fundamental',
    nivelDigComp: 'Niveles 1-2',
    corto: 'F',
    descripcion: 'Realizo tareas sencillas con ayuda cuando la necesito.',
    valor: 1,
  },
  {
    id: 'intermedio',
    nombre: 'Intermedio',
    nivelDigComp: 'Niveles 3-4',
    corto: 'I',
    descripcion: 'Resuelvo por mi cuenta tareas bien definidas y problemas frecuentes.',
    valor: 2,
  },
  {
    id: 'avanzado',
    nombre: 'Avanzado',
    nivelDigComp: 'Niveles 5-6',
    corto: 'A',
    descripcion: 'Afronto tareas diversas y problemas no rutinarios, y oriento a otras personas.',
    valor: 3,
  },
  {
    id: 'especializado',
    nombre: 'Altamente especializado',
    nivelDigComp: 'Niveles 7-8',
    corto: 'E',
    descripcion: 'Resuelvo problemas complejos, propongo ideas nuevas y ayudo a mejorar la práctica de mi entorno.',
    valor: 4,
  },
];

export const TRAMO_VALOR: Record<TramoId, number> = {
  fundamental: 1,
  intermedio: 2,
  avanzado: 3,
  especializado: 4,
};

export const ORDEN_TRAMOS: TramoId[] = ['fundamental', 'intermedio', 'avanzado', 'especializado'];

export interface Area {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
}

export const AREAS: Area[] = [
  {
    id: '1',
    nombre: 'Información y alfabetización de datos',
    icono: '🔎',
    descripcion: 'Buscar, evaluar y organizar información y datos digitales.',
  },
  {
    id: '2',
    nombre: 'Comunicación y colaboración',
    icono: '💬',
    descripcion: 'Interactuar, compartir, colaborar y participar de forma digital, cuidando la identidad y la conducta en la red.',
  },
  {
    id: '3',
    nombre: 'Creación de contenidos digitales',
    icono: '🎨',
    descripcion: 'Crear y reelaborar contenidos, respetar derechos de autor y programar.',
  },
  {
    id: '4',
    nombre: 'Seguridad',
    icono: '🛡️',
    descripcion: 'Proteger dispositivos, datos personales, la salud y el medioambiente.',
  },
  {
    id: '5',
    nombre: 'Resolución de problemas',
    icono: '🧩',
    descripcion: 'Resolver problemas técnicos, elegir herramientas y usar la tecnología de forma creativa.',
  },
];

export interface Competencia {
  id: string;
  areaId: string;
  nombre: string;
  descripcion: string;
  canDo: Record<TramoId, string>;
  pista: string;
}

export const COMPETENCIAS: Competencia[] = [
  // ── Área 1 ──
  {
    id: '1.1',
    areaId: '1',
    nombre: 'Navegación, búsqueda y filtrado de información',
    descripcion: 'Encontrar información, datos y contenidos en internet.',
    canDo: {
      fundamental: 'Busco información con un buscador y reconozco webs sencillas, aunque a veces necesito ayuda para afinar la búsqueda.',
      intermedio: 'Uso palabras clave, filtros y varios buscadores para encontrar lo que necesito, y guardo mis búsquedas frecuentes.',
      avanzado: 'Combino estrategias de búsqueda avanzadas y fuentes especializadas, y ayudo a otras personas a encontrar y filtrar información.',
      especializado: 'Diseño estrategias de búsqueda para necesidades complejas o poco habituales y propongo métodos para mi entorno.',
    },
    pista: 'Practica con operadores (comillas, site:, filtros por fecha) y compara resultados entre varios buscadores.',
  },
  {
    id: '1.2',
    areaId: '1',
    nombre: 'Evaluación de información y datos',
    descripcion: 'Valorar la credibilidad y fiabilidad de la información.',
    canDo: {
      fundamental: 'Distingo información evidente, pero me cuesta saber sin ayuda si una fuente es fiable.',
      intermedio: 'Contrasto la información en varias fuentes y detecto señales básicas de contenido poco fiable o interesado.',
      avanzado: 'Evalúo con criterio la credibilidad de fuentes y datos (autoría, fecha, sesgos) y oriento a otros a detectar desinformación.',
      especializado: 'Analizo la fiabilidad de fuentes complejas o contradictorias y desarrollo criterios de verificación para mi entorno.',
    },
    pista: 'Ante una noticia, comprueba autor, fecha, fuente original y si otros medios fiables la confirman.',
  },
  {
    id: '1.3',
    areaId: '1',
    nombre: 'Gestión de información, datos y contenidos',
    descripcion: 'Organizar, almacenar y recuperar información digital.',
    canDo: {
      fundamental: 'Guardo archivos y los vuelvo a encontrar, aunque mi organización es básica.',
      intermedio: 'Organizo archivos en carpetas con criterio, hago copias de seguridad y recupero información cuando la necesito.',
      avanzado: 'Gestiono información en distintos entornos (local, nube) con sistemas de organización y respaldo bien pensados, y ayudo a otros.',
      especializado: 'Diseño sistemas de organización y almacenamiento de datos para necesidades complejas y propongo buenas prácticas.',
    },
    pista: 'Define una estructura de carpetas coherente y activa copias de seguridad automáticas en la nube o disco externo.',
  },
  // ── Área 2 ──
  {
    id: '2.1',
    areaId: '2',
    nombre: 'Interacción mediante tecnologías digitales',
    descripcion: 'Comunicarte con distintas herramientas digitales.',
    canDo: {
      fundamental: 'Uso herramientas sencillas como el correo o la mensajería para comunicarme.',
      intermedio: 'Elijo el medio digital adecuado según la situación (correo, chat, videollamada) y lo uso con soltura.',
      avanzado: 'Combino varias herramientas de comunicación digital según el contexto y aconsejo a otros sobre cuál usar.',
      especializado: 'Selecciono y adapto herramientas de interacción para situaciones complejas y propongo mejoras en mi entorno.',
    },
    pista: 'Prueba distintas herramientas (videollamada, mensajería de equipo) y ajusta el canal al tipo de mensaje.',
  },
  {
    id: '2.2',
    areaId: '2',
    nombre: 'Compartir mediante tecnologías digitales',
    descripcion: 'Compartir datos, información y contenidos.',
    canDo: {
      fundamental: 'Comparto archivos o enlaces de forma sencilla, a veces con ayuda.',
      intermedio: 'Comparto contenidos con las personas adecuadas usando permisos básicos y cito la fuente cuando corresponde.',
      avanzado: 'Gestiono el uso compartido con distintos niveles de permiso y ayudo a otros a compartir de forma segura y correcta.',
      especializado: 'Defino cómo compartir información en escenarios complejos (varios grupos, confidencialidad) y establezco buenas prácticas.',
    },
    pista: 'Aprende a usar los permisos de compartición (solo lectura, edición) en la nube antes de enviar un enlace.',
  },
  {
    id: '2.3',
    areaId: '2',
    nombre: 'Participación ciudadana digital',
    descripcion: 'Usar servicios digitales públicos y participar en la sociedad.',
    canDo: {
      fundamental: 'Sé que existen servicios digitales públicos (trámites, información), aunque los uso con ayuda.',
      intermedio: 'Uso por mi cuenta servicios digitales habituales (administración, banca, salud) para gestiones frecuentes.',
      avanzado: 'Utilizo con soltura servicios digitales diversos y ayudo a otras personas a participar y hacer trámites en línea.',
      especializado: 'Aprovecho servicios digitales complejos y promuevo la participación digital en mi entorno.',
    },
    pista: 'Familiarízate con la identificación digital (certificado, clave) para hacer trámites oficiales en línea.',
  },
  {
    id: '2.4',
    areaId: '2',
    nombre: 'Colaboración mediante tecnologías digitales',
    descripcion: 'Trabajar con otras personas usando herramientas digitales.',
    canDo: {
      fundamental: 'Participo en documentos o grupos compartidos cuando alguien los prepara.',
      intermedio: 'Colaboro en documentos y proyectos compartidos en tiempo real y organizo tareas sencillas con herramientas digitales.',
      avanzado: 'Coordino trabajo colaborativo con varias herramientas y ayudo al equipo a sacarles partido.',
      especializado: 'Diseño flujos de colaboración digital para proyectos complejos y mejoro cómo colabora mi entorno.',
    },
    pista: 'Trabaja un documento compartido en tiempo real con comentarios y control de cambios.',
  },
  {
    id: '2.5',
    areaId: '2',
    nombre: 'Comportamiento en la red (netiqueta)',
    descripcion: 'Conocer las normas de conducta en los entornos digitales.',
    canDo: {
      fundamental: 'Sé que hay normas básicas de conducta en la red, aunque no siempre las tengo claras.',
      intermedio: 'Adapto mi forma de comunicarme al medio y al público, y actúo con respeto en los entornos digitales.',
      avanzado: 'Manejo con criterio las normas de conducta en distintos contextos digitales y oriento a otros sobre cómo comportarse.',
      especializado: 'Aplico y promuevo normas de conducta digital en situaciones delicadas o diversas (culturas, generaciones).',
    },
    pista: 'Antes de publicar o responder, piensa en el tono, el público y si lo dirías igual en persona.',
  },
  {
    id: '2.6',
    areaId: '2',
    nombre: 'Gestión de la identidad digital',
    descripcion: 'Cuidar tu huella y reputación en la red.',
    canDo: {
      fundamental: 'Sé que tengo una huella digital, pero no controlo bien qué muestro.',
      intermedio: 'Gestiono mis perfiles y la información que comparto, y cuido la imagen que proyecto en la red.',
      avanzado: 'Gestiono varias identidades digitales según el contexto y ayudo a otros a proteger su reputación en línea.',
      especializado: 'Superviso y protejo identidades digitales en escenarios complejos y asesoro sobre reputación digital.',
    },
    pista: 'Busca tu nombre en internet y revisa la privacidad de tus perfiles para controlar qué se ve.',
  },
  // ── Área 3 ──
  {
    id: '3.1',
    areaId: '3',
    nombre: 'Desarrollo de contenidos digitales',
    descripcion: 'Crear contenidos en distintos formatos.',
    canDo: {
      fundamental: 'Creo contenidos sencillos (un texto, una foto) con herramientas básicas.',
      intermedio: 'Elaboro contenidos en varios formatos (documentos, presentaciones, imágenes) y los edito con soltura.',
      avanzado: 'Produzco contenidos digitales elaborados combinando formatos y herramientas, y ayudo a otros a crearlos.',
      especializado: 'Creo contenidos digitales complejos y originales y desarrollo formas nuevas de expresión en mi entorno.',
    },
    pista: 'Elige un formato nuevo (una presentación, un vídeo corto) y créalo de principio a fin.',
  },
  {
    id: '3.2',
    areaId: '3',
    nombre: 'Integración y reelaboración de contenidos',
    descripcion: 'Combinar y transformar contenidos existentes.',
    canDo: {
      fundamental: 'Modifico contenidos sencillos que ya existen (recorto, cambio texto).',
      intermedio: 'Combino y reelaboro contenidos de distintas fuentes para crear algo nuevo y coherente.',
      avanzado: 'Integro contenidos diversos con criterio y ayudo a otros a reelaborar y mejorar materiales.',
      especializado: 'Reelaboro e integro contenidos complejos y propongo formas nuevas de combinarlos.',
    },
    pista: 'Toma materiales existentes (datos, imágenes, textos) y móntalos en un documento propio citando su origen.',
  },
  {
    id: '3.3',
    areaId: '3',
    nombre: 'Derechos de autor y licencias',
    descripcion: 'Respetar la propiedad intelectual al usar contenidos.',
    canDo: {
      fundamental: 'Sé que los contenidos tienen derechos, pero no distingo bien qué puedo usar.',
      intermedio: 'Reconozco cuándo un contenido tiene derechos y busco materiales de uso libre (licencias abiertas).',
      avanzado: 'Aplico correctamente licencias y derechos de autor y oriento a otros sobre qué pueden usar y cómo citar.',
      especializado: 'Gestiono derechos y licencias en situaciones complejas y asesoro sobre propiedad intelectual.',
    },
    pista: 'Aprende qué permite cada licencia Creative Commons y usa bancos de imágenes libres citando al autor.',
  },
  {
    id: '3.4',
    areaId: '3',
    nombre: 'Programación',
    descripcion: 'Escribir instrucciones para que un sistema realice una tarea.',
    canDo: {
      fundamental: 'Sé que los programas siguen instrucciones, pero no las escribo yo.',
      intermedio: 'Modifico o creo secuencias de instrucciones sencillas (fórmulas, automatizaciones, bloques) para resolver tareas.',
      avanzado: 'Desarrollo programas o automatizaciones para resolver problemas y ayudo a otros a hacerlo.',
      especializado: 'Diseño soluciones programadas para problemas complejos y aporto a la práctica de programación de mi entorno.',
    },
    pista: 'Empieza por automatizaciones simples: fórmulas de hoja de cálculo o un flujo con herramientas no-code.',
  },
  // ── Área 4 ──
  {
    id: '4.1',
    areaId: '4',
    nombre: 'Protección de dispositivos',
    descripcion: 'Mantener seguros tus equipos y datos.',
    canDo: {
      fundamental: 'Sé que hay que proteger los dispositivos (contraseña, antivirus), pero dependo de ayuda.',
      intermedio: 'Protejo mis dispositivos con contraseñas, actualizaciones y antivirus, y reconozco riesgos habituales.',
      avanzado: 'Aplico medidas de seguridad variadas según el riesgo y ayudo a otros a proteger sus dispositivos.',
      especializado: 'Gestiono la seguridad de dispositivos en escenarios complejos y propongo medidas para mi entorno.',
    },
    pista: 'Activa las actualizaciones automáticas y el bloqueo de pantalla, y usa un antivirus al día.',
  },
  {
    id: '4.2',
    areaId: '4',
    nombre: 'Protección de datos personales y privacidad',
    descripcion: 'Controlar qué datos compartes y con quién.',
    canDo: {
      fundamental: 'Sé que mis datos son valiosos, pero no controlo bien qué comparto.',
      intermedio: 'Gestiono los permisos y la privacidad de apps y servicios, y comparto mis datos con precaución.',
      avanzado: 'Protejo mi privacidad con criterio en distintos servicios y ayudo a otros a cuidar sus datos personales.',
      especializado: 'Gestiono la privacidad en situaciones complejas y conozco mis derechos sobre los datos (acceso, supresión).',
    },
    pista: 'Revisa los permisos de tus apps y limita los datos que compartes al mínimo necesario.',
  },
  {
    id: '4.3',
    areaId: '4',
    nombre: 'Protección de la salud y el bienestar',
    descripcion: 'Usar la tecnología de forma saludable y segura.',
    canDo: {
      fundamental: 'Sé que un mal uso de la tecnología puede afectarme, pero no lo gestiono bien.',
      intermedio: 'Cuido mi bienestar digital (tiempo de pantalla, descansos) y reconozco riesgos como el ciberacoso.',
      avanzado: 'Gestiono con criterio el equilibrio digital y ayudo a otros a usar la tecnología de forma saludable y segura.',
      especializado: 'Promuevo el bienestar digital en mi entorno y actúo ante situaciones complejas (acoso, dependencia).',
    },
    pista: 'Establece límites de tiempo y notificaciones, y aprende a reconocer y frenar el ciberacoso.',
  },
  {
    id: '4.4',
    areaId: '4',
    nombre: 'Protección del medioambiente',
    descripcion: 'Tener en cuenta el impacto ambiental de la tecnología.',
    canDo: {
      fundamental: 'Sé que la tecnología tiene impacto ambiental, pero no lo tengo en cuenta.',
      intermedio: 'Tengo en cuenta el impacto ambiental de la tecnología (consumo, residuos) en mis decisiones.',
      avanzado: 'Aplico criterios de sostenibilidad digital y ayudo a otros a reducir su huella tecnológica.',
      especializado: 'Promuevo prácticas digitales sostenibles en mi entorno y valoro el impacto ambiental de soluciones complejas.',
    },
    pista: 'Alarga la vida de tus dispositivos, recicla la electrónica y ajusta el consumo energético de tus equipos.',
  },
  // ── Área 5 ──
  {
    id: '5.1',
    areaId: '5',
    nombre: 'Resolución de problemas técnicos',
    descripcion: 'Detectar y solucionar fallos técnicos.',
    canDo: {
      fundamental: 'Identifico problemas técnicos sencillos, pero necesito ayuda para resolverlos.',
      intermedio: 'Resuelvo por mi cuenta problemas técnicos habituales (conexión, configuración, errores frecuentes).',
      avanzado: 'Diagnostico y resuelvo problemas técnicos variados y ayudo a otros a solucionarlos.',
      especializado: 'Resuelvo problemas técnicos complejos y aporto soluciones a mi entorno.',
    },
    pista: 'Ante un fallo, busca el mensaje de error y prueba pasos básicos (reiniciar, actualizar, reinstalar) antes de pedir ayuda.',
  },
  {
    id: '5.2',
    areaId: '5',
    nombre: 'Identificación de necesidades y respuestas tecnológicas',
    descripcion: 'Elegir la herramienta adecuada para cada necesidad.',
    canDo: {
      fundamental: 'Uso las herramientas que conozco, aunque no siempre sean las más adecuadas.',
      intermedio: 'Elijo herramientas digitales adecuadas para resolver mis necesidades habituales.',
      avanzado: 'Evalúo y selecciono herramientas para necesidades diversas y ayudo a otros a elegir la mejor opción.',
      especializado: 'Identifico soluciones tecnológicas para necesidades complejas y propongo herramientas a mi entorno.',
    },
    pista: 'Antes de usar la herramienta de siempre, compara 2-3 opciones según lo que realmente necesitas.',
  },
  {
    id: '5.3',
    areaId: '5',
    nombre: 'Uso creativo de las tecnologías digitales',
    descripcion: 'Emplear la tecnología para innovar y crear.',
    canDo: {
      fundamental: 'Uso la tecnología para tareas conocidas, sin explorar mucho.',
      intermedio: 'Uso herramientas digitales para crear o resolver de formas nuevas para mí.',
      avanzado: 'Combino tecnologías de forma creativa para generar soluciones o productos, y animo a otros a innovar.',
      especializado: 'Empleo la tecnología de forma innovadora ante retos complejos y aporto ideas nuevas a mi entorno.',
    },
    pista: 'Plantéate un pequeño proyecto personal y resuélvelo con una herramienta digital que aún no dominas.',
  },
  {
    id: '5.4',
    areaId: '5',
    nombre: 'Identificación de lagunas de competencia digital',
    descripcion: 'Reconocer qué te falta y cómo seguir aprendiendo.',
    canDo: {
      fundamental: 'Sé que me falta soltura digital, pero no sé bien en qué.',
      intermedio: 'Identifico mis carencias digitales concretas y busco cómo mejorarlas.',
      avanzado: 'Analizo mis competencias con criterio, me mantengo actualizado y ayudo a otros a detectar sus lagunas.',
      especializado: 'Guío mi desarrollo digital de forma autónoma y apoyo el de mi entorno ante la evolución tecnológica.',
    },
    pista: 'Usa esta misma herramienta cada pocos meses para ver tu evolución y marcarte el siguiente objetivo.',
  },
];

export interface Perfil {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  objetivoPorArea: Record<string, TramoId>; // areaId -> tramo objetivo
}

export const PERFILES: Perfil[] = [
  {
    id: 'general',
    nombre: 'Uso general / ciudadanía digital',
    icono: '🌍',
    descripcion: 'Desenvolverte con soltura en el día a día digital.',
    objetivoPorArea: { '1': 'intermedio', '2': 'intermedio', '3': 'intermedio', '4': 'intermedio', '5': 'intermedio' },
  },
  {
    id: 'estudiante',
    nombre: 'Estudiante',
    icono: '🎓',
    descripcion: 'Estudiar, investigar y crear trabajos con medios digitales.',
    objetivoPorArea: { '1': 'avanzado', '2': 'intermedio', '3': 'avanzado', '4': 'intermedio', '5': 'intermedio' },
  },
  {
    id: 'empleo',
    nombre: 'Buscando empleo',
    icono: '💼',
    descripcion: 'Demostrar competencias digitales valoradas en el mercado laboral.',
    objetivoPorArea: { '1': 'avanzado', '2': 'avanzado', '3': 'intermedio', '4': 'intermedio', '5': 'intermedio' },
  },
  {
    id: 'teletrabajo',
    nombre: 'Teletrabajo',
    icono: '🏠',
    descripcion: 'Trabajar en remoto de forma eficaz y segura.',
    objetivoPorArea: { '1': 'intermedio', '2': 'avanzado', '3': 'intermedio', '4': 'avanzado', '5': 'intermedio' },
  },
  {
    id: 'emprendedor',
    nombre: 'Emprendedor / autónomo',
    icono: '🚀',
    descripcion: 'Crear contenido, comunicar y resolver con autonomía tu proyecto.',
    objetivoPorArea: { '1': 'intermedio', '2': 'avanzado', '3': 'avanzado', '4': 'intermedio', '5': 'avanzado' },
  },
  {
    id: 'iniciacion',
    nombre: 'Iniciación digital',
    icono: '🌱',
    descripcion: 'Dar tus primeros pasos y ganar autonomía básica.',
    objetivoPorArea: { '1': 'fundamental', '2': 'fundamental', '3': 'fundamental', '4': 'fundamental', '5': 'fundamental' },
  },
];

// ── Helpers ──

export function nombreTramo(id: TramoId): string {
  return TRAMOS.find((t) => t.id === id)?.nombre ?? '';
}

/** Devuelve el TramoId a partir de un valor 1-4 (o null si es 0/sin evaluar). */
export function tramoDesdeValor(valor: number): TramoId | null {
  return ORDEN_TRAMOS[valor - 1] ?? null;
}

/** Redondea la media de un área al tramo más cercano (>=1). */
export function valorATramo(valor: number): TramoId | null {
  if (valor <= 0) return null;
  const idx = Math.min(4, Math.max(1, Math.round(valor)));
  return ORDEN_TRAMOS[idx - 1];
}

export function competenciasDeArea(areaId: string): Competencia[] {
  return COMPETENCIAS.filter((c) => c.areaId === areaId);
}
