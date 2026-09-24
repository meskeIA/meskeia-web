/**
 * Motor de recomendación de selector-ejercicio.
 *
 * Vive aparte, sin dependencias, para poder enumerar las 1.376.256 combinaciones de respuestas
 * sin navegador: mismo patrón que `app/selector-mascota/motor.ts` (commit 934e57bc). Las
 * preguntas y sus pesos son los MISMOS que tenía la página; lo que cambia es el empate.
 *
 * EMPATES. Antes el ganador salía de ordenar `Object.entries(puntos)` por puntos: a igualdad,
 * ganaba el primero del objeto —siempre el gimnasio, luego el running…— y en silencio. Ahora, a
 * igualdad de puntos, va primero el que mejor encaja con la limitación física declarada
 * (pregunta 7: la seguridad antes que la preferencia); si sigue el empate, el que mejor encaja
 * con el objetivo principal (pregunta 1), luego con el presupuesto (pregunta 5), y por último el
 * de menor coste de partida. El empate se anuncia en pantalla con el criterio que lo ha deshecho.
 */

export type EjercicioKey = 'gimnasio' | 'running' | 'natacion' | 'ciclismo' | 'yoga-pilates' | 'entrenamiento-casa';

export interface PesosPorEjercicio {
  gimnasio: number;
  running: number;
  natacion: number;
  ciclismo: number;
  'yoga-pilates': number;
  'entrenamiento-casa': number;
}

export interface OpcionPregunta {
  valor: string;
  etiqueta: string;
  descripcion: string;
  pesos: PesosPorEjercicio;
}

export interface Pregunta {
  id: string;
  categoria: string;
  icono: string;
  texto: string;
  opciones: OpcionPregunta[];
}

export interface EjercicioInfo {
  icono: string;
  nombre: string;
  perfil: string;
  descripcion: string;
  frecuencia: string;
  inicio: string;
  coste: string;
  beneficios: string[];
  equipo: string[];
  consejos: string[];
}


// ─────────────────────────────────────────────
// Preguntas del test (10)
// ─────────────────────────────────────────────

export const PREGUNTAS: Pregunta[] = [
  {
    id: 'objetivo',
    categoria: 'Objetivo Principal',
    icono: '🎯',
    texto: '¿Cuál es tu objetivo principal con el ejercicio?',
    opciones: [
      { valor: 'perder_peso', etiqueta: 'Perder peso y quemar grasa', descripcion: 'Déficit calórico y cardio prioritario', pesos: { gimnasio: 2, running: 3, natacion: 2, ciclismo: 3, 'yoga-pilates': 1, 'entrenamiento-casa': 2 } },
      { valor: 'musculo', etiqueta: 'Ganar músculo y fuerza', descripcion: 'Entrenamiento de resistencia', pesos: { gimnasio: 3, running: 0, natacion: 1, ciclismo: 1, 'yoga-pilates': 1, 'entrenamiento-casa': 2 } },
      { valor: 'cardio', etiqueta: 'Mejorar la resistencia cardiovascular', descripcion: 'Corazón y pulmones más fuertes', pesos: { gimnasio: 1, running: 3, natacion: 3, ciclismo: 3, 'yoga-pilates': 1, 'entrenamiento-casa': 1 } },
      { valor: 'bienestar', etiqueta: 'Reducir estrés y mejorar el bienestar mental', descripcion: 'Equilibrio mental y físico', pesos: { gimnasio: 1, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 3, 'entrenamiento-casa': 2 } },
      { valor: 'flexibilidad', etiqueta: 'Ganar flexibilidad y movilidad', descripcion: 'Articulaciones y músculos más ágiles', pesos: { gimnasio: 1, running: 0, natacion: 2, ciclismo: 0, 'yoga-pilates': 3, 'entrenamiento-casa': 2 } },
      { valor: 'mantener', etiqueta: 'Mantener mi estado físico actual', descripcion: 'Conservar la forma sin un objetivo de cambio', pesos: { gimnasio: 2, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
      { valor: 'disfrutar', etiqueta: 'Disfrutar y desconectar (sin objetivo de cambio)', descripcion: 'Mover el cuerpo como placer, no como obligación', pesos: { gimnasio: 1, running: 2, natacion: 2, ciclismo: 3, 'yoga-pilates': 3, 'entrenamiento-casa': 1 } },
    ],
  },
  {
    id: 'tiempo',
    categoria: 'Disponibilidad',
    icono: '⏱️',
    texto: '¿Cuánto tiempo puedes dedicar al ejercicio por sesión?',
    opciones: [
      { valor: 'poco', etiqueta: 'Menos de 30 minutos', descripcion: 'Sesiones cortas pero frecuentes', pesos: { gimnasio: 1, running: 2, natacion: 1, ciclismo: 1, 'yoga-pilates': 2, 'entrenamiento-casa': 3 } },
      { valor: 'medio', etiqueta: 'Entre 30 y 60 minutos', descripcion: 'Tiempo razonable para una rutina', pesos: { gimnasio: 2, running: 3, natacion: 2, ciclismo: 2, 'yoga-pilates': 3, 'entrenamiento-casa': 3 } },
      { valor: 'bastante', etiqueta: 'Entre 1 y 2 horas', descripcion: 'Puedo dedicar tiempo de calidad', pesos: { gimnasio: 3, running: 2, natacion: 3, ciclismo: 3, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
      { valor: 'mucho', etiqueta: 'Más de 2 horas', descripcion: 'El deporte es una prioridad en mi vida', pesos: { gimnasio: 3, running: 2, natacion: 3, ciclismo: 3, 'yoga-pilates': 2, 'entrenamiento-casa': 1 } },
    ],
  },
  {
    id: 'compania',
    categoria: 'Entorno Social',
    icono: '👥',
    texto: '¿Prefieres hacer ejercicio solo/a o con compañía?',
    opciones: [
      { valor: 'solo', etiqueta: 'Solo/a, a mi ritmo', descripcion: 'La soledad me ayuda a concentrarme', pesos: { gimnasio: 2, running: 3, natacion: 3, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 3 } },
      { valor: 'acompanado', etiqueta: 'Con compañía, me motiva más', descripcion: 'El grupo me ayuda a mantener el ritmo', pesos: { gimnasio: 2, running: 2, natacion: 1, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 1 } },
      { valor: 'indiferente', etiqueta: 'Me da igual, me adapto', descripcion: 'Flexible con el entorno', pesos: { gimnasio: 3, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
    ],
  },
  {
    id: 'lugar',
    categoria: 'Preferencia de Lugar',
    icono: '📍',
    texto: '¿Dónde prefieres hacer ejercicio?',
    opciones: [
      { valor: 'casa', etiqueta: 'En casa, sin salir', descripcion: 'Comodidad y ahorro de tiempo de desplazamiento', pesos: { gimnasio: 0, running: 0, natacion: 0, ciclismo: 0, 'yoga-pilates': 2, 'entrenamiento-casa': 3 } },
      { valor: 'exterior', etiqueta: 'Al aire libre', descripcion: 'Contacto con la naturaleza y el entorno', pesos: { gimnasio: 0, running: 3, natacion: 1, ciclismo: 3, 'yoga-pilates': 1, 'entrenamiento-casa': 0 } },
      { valor: 'instalacion', etiqueta: 'En instalación deportiva (gym, piscina...)', descripcion: 'Equipamiento profesional disponible', pesos: { gimnasio: 3, running: 0, natacion: 3, ciclismo: 1, 'yoga-pilates': 2, 'entrenamiento-casa': 0 } },
      { valor: 'cualquier', etiqueta: 'Donde sea, lo que importe es moverme', descripcion: 'Total flexibilidad', pesos: { gimnasio: 2, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
    ],
  },
  {
    id: 'presupuesto',
    categoria: 'Presupuesto',
    icono: '💶',
    texto: '¿Cuánto puedes invertir mensualmente en tu práctica deportiva?',
    opciones: [
      { valor: 'cero', etiqueta: 'Cero euros, sin gasto', descripcion: 'El deporte debe ser gratuito', pesos: { gimnasio: 0, running: 2, natacion: 0, ciclismo: 1, 'yoga-pilates': 1, 'entrenamiento-casa': 3 } },
      { valor: 'bajo', etiqueta: 'Hasta 20 €/mes', descripcion: 'Gasto mínimo aceptable', pesos: { gimnasio: 1, running: 3, natacion: 1, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 3 } },
      { valor: 'medio', etiqueta: 'Entre 20 y 60 €/mes', descripcion: 'Cuota de gimnasio o actividad habitual', pesos: { gimnasio: 3, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 3, 'entrenamiento-casa': 2 } },
      { valor: 'alto', etiqueta: 'Más de 60 €/mes sin problema', descripcion: 'Inversión en salud sin restricciones', pesos: { gimnasio: 3, running: 2, natacion: 3, ciclismo: 3, 'yoga-pilates': 3, 'entrenamiento-casa': 2 } },
    ],
  },
  {
    id: 'condicion',
    categoria: 'Condición Física Actual',
    icono: '💪',
    texto: '¿Cómo describirías tu condición física actual?',
    opciones: [
      { valor: 'muy_baja', etiqueta: 'Muy sedentario/a, empiezo desde cero', descripcion: 'Poca o nula actividad hasta ahora', pesos: { gimnasio: 2, running: 1, natacion: 2, ciclismo: 2, 'yoga-pilates': 3, 'entrenamiento-casa': 3 } },
      { valor: 'baja', etiqueta: 'Regular, algo de actividad ocasional', descripcion: 'Me muevo algo pero sin rutina', pesos: { gimnasio: 2, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
      { valor: 'media', etiqueta: 'Buena, tengo base física', descripcion: 'Entrenamiento regular previo', pesos: { gimnasio: 3, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
      { valor: 'alta', etiqueta: 'Muy buena, busco un reto mayor', descripcion: 'Alto rendimiento o competición', pesos: { gimnasio: 3, running: 3, natacion: 3, ciclismo: 3, 'yoga-pilates': 2, 'entrenamiento-casa': 1 } },
    ],
  },
  {
    id: 'limitaciones',
    categoria: 'Limitaciones Físicas',
    icono: '🩺',
    texto: '¿Tienes alguna limitación física o lesión?',
    opciones: [
      { valor: 'ninguna', etiqueta: 'Ninguna, estoy bien físicamente', descripcion: 'Puedo hacer cualquier tipo de ejercicio', pesos: { gimnasio: 3, running: 3, natacion: 3, ciclismo: 3, 'yoga-pilates': 3, 'entrenamiento-casa': 3 } },
      { valor: 'rodillas', etiqueta: 'Problemas de rodillas o piernas', descripcion: 'Evito impactos', pesos: { gimnasio: 2, running: 0, natacion: 3, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
      { valor: 'espalda', etiqueta: 'Problemas de espalda o columna', descripcion: 'Necesito cuidado postural', pesos: { gimnasio: 1, running: 1, natacion: 3, ciclismo: 1, 'yoga-pilates': 3, 'entrenamiento-casa': 2 } },
      { valor: 'general', etiqueta: 'Problemas articulares generales', descripcion: 'Bajo impacto necesario', pesos: { gimnasio: 1, running: 0, natacion: 3, ciclismo: 2, 'yoga-pilates': 3, 'entrenamiento-casa': 2 } },
    ],
  },
  {
    id: 'motivacion',
    categoria: 'Factor de Motivación',
    icono: '🔥',
    texto: '¿Qué te motiva mejor para mantener la constancia?',
    opciones: [
      { valor: 'estructura', etiqueta: 'Rutinas estructuradas y planificadas', descripcion: 'Seguir un plan predefinido', pesos: { gimnasio: 3, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
      { valor: 'variedad', etiqueta: 'Variedad, me aburro con la rutina', descripcion: 'Necesito estímulos distintos', pesos: { gimnasio: 2, running: 1, natacion: 2, ciclismo: 2, 'yoga-pilates': 1, 'entrenamiento-casa': 1 } },
      { valor: 'progreso', etiqueta: 'Ver progreso medible (kilos, tiempos, récords)', descripcion: 'Los datos me enganchan', pesos: { gimnasio: 3, running: 3, natacion: 2, ciclismo: 3, 'yoga-pilates': 1, 'entrenamiento-casa': 2 } },
      { valor: 'social', etiqueta: 'El componente social o competitivo', descripcion: 'Otros me dan energía', pesos: { gimnasio: 2, running: 2, natacion: 1, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 0 } },
    ],
  },
  {
    id: 'historial',
    categoria: 'Experiencia Previa',
    icono: '📋',
    texto: '¿Qué te ha funcionado mejor hasta ahora?',
    opciones: [
      { valor: 'ninguno', etiqueta: 'No he tenido rutina deportiva nunca', descripcion: 'Empiezo desde cero', pesos: { gimnasio: 2, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 3, 'entrenamiento-casa': 3 } },
      { valor: 'sala', etiqueta: 'Entrenamiento en sala o con máquinas', descripcion: 'Gimnasio o similar', pesos: { gimnasio: 3, running: 1, natacion: 1, ciclismo: 1, 'yoga-pilates': 1, 'entrenamiento-casa': 2 } },
      { valor: 'individual', etiqueta: 'Deporte individual a mi aire', descripcion: 'Running, bici, natación...', pesos: { gimnasio: 1, running: 3, natacion: 3, ciclismo: 3, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
      { valor: 'equipo', etiqueta: 'Deporte de equipo o en grupo', descripcion: 'Fútbol, pádel, clases colectivas...', pesos: { gimnasio: 2, running: 1, natacion: 1, ciclismo: 1, 'yoga-pilates': 2, 'entrenamiento-casa': 0 } },
    ],
  },
  {
    id: 'prioridad',
    categoria: 'Prioridad Personal',
    icono: '⭐',
    texto: '¿Qué priorizas al elegir una actividad deportiva?',
    opciones: [
      { valor: 'comodidad', etiqueta: 'Comodidad y cercanía', descripcion: 'Que sea fácil de mantener sin desplazamientos', pesos: { gimnasio: 2, running: 2, natacion: 1, ciclismo: 1, 'yoga-pilates': 2, 'entrenamiento-casa': 3 } },
      { valor: 'eficacia', etiqueta: 'Eficacia y rapidez de resultados', descripcion: 'Máximo resultado en mínimo tiempo', pesos: { gimnasio: 3, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 1, 'entrenamiento-casa': 2 } },
      { valor: 'diversion', etiqueta: 'Diversión y disfrute', descripcion: 'Que sea un placer, no una obligación', pesos: { gimnasio: 1, running: 2, natacion: 2, ciclismo: 3, 'yoga-pilates': 2, 'entrenamiento-casa': 1 } },
      { valor: 'impacto', etiqueta: 'Bajo impacto para las articulaciones', descripcion: 'Que no me lastime a largo plazo', pesos: { gimnasio: 1, running: 0, natacion: 3, ciclismo: 2, 'yoga-pilates': 3, 'entrenamiento-casa': 2 } },
    ],
  },
];

// ─────────────────────────────────────────────
// Datos de ejercicios
// ─────────────────────────────────────────────

export const EJERCICIOS: Record<EjercicioKey, EjercicioInfo> = {
  gimnasio: {
    icono: '🏋️',
    nombre: 'Gimnasio y Entrenamiento de Fuerza',
    perfil: 'Resultados medibles · Estructura · Equipamiento completo',
    descripcion: 'El gimnasio ofrece el entorno más versátil para trabajar todos los grupos musculares. Ideal si buscas resultados tangibles en fuerza, composición corporal o simplemente quieres una rutina estructurada.',
    frecuencia: '3-4 días/semana, sesiones de 45-75 min',
    inicio: 'Pide orientación inicial a un monitor para no lesionarte',
    coste: '25-50 €/mes según instalación',
    beneficios: ['Mejora de fuerza y masa muscular demostrable', 'Control total de cargas y progresión', 'Acceso a todos los grupos musculares', 'Protección articular a largo plazo si entrenas bien', 'Independiente del clima'],
    equipo: ['Zapatillas de entrenamiento (no de running)', 'Ropa cómoda y transpirable', 'Toalla y candado para taquilla', 'Botella de agua reutilizable', 'Opcional: guantes, cinturón, straps'],
    consejos: ['Empieza con pesos bajos para aprender la técnica', 'El descanso entre sesiones es tan importante como entrenar', 'La progresión debe ser gradual: no subas más del 10% de carga por semana', 'Come proteína suficiente (1,6-2g/kg de peso) si quieres ganar músculo'],
  },
  running: {
    icono: '🏃',
    nombre: 'Running y Carrera',
    perfil: 'Libertad · Bajo coste · Alta eficacia cardiovascular',
    descripcion: 'El running es la actividad aeróbica más accesible. Solo necesitas zapatillas y salir a la calle. Extraordinario para la salud cardiovascular, gestión del estrés y pérdida de grasa con constancia.',
    frecuencia: '3-4 días/semana, sesiones de 20-60 min',
    inicio: 'Método run-walk: empieza alternando 1 min corriendo / 2 min caminando',
    coste: 'Casi gratuito — solo zapatillas de calidad (~80-150€ que duran 500-800 km)',
    beneficios: ['Mejora cardiovascular muy rápida', 'Quema calórica alta por sesión', 'Libera endorfinas y reduce el estrés', 'Puedes hacerlo en cualquier lugar del mundo', 'Comunidad muy amplia y accesible'],
    equipo: ['Zapatillas de running específicas (imprescindible)', 'Ropa técnica transpirable', 'Reloj o app para medir ritmo y distancia', 'Sujetador deportivo de sujeción alta (imprescindible)', 'Opcional: auriculares inalámbricos'],
    consejos: ['El 80% de tu entrenamiento debe ser a ritmo conversacional (test: puedes hablar)', 'Descansa al menos un día entre sesiones al principio', 'Estira y fortalece el core para prevenir lesiones', 'El calzado inadecuado es la principal causa de lesión en runners'],
  },
  natacion: {
    icono: '🏊',
    nombre: 'Natación',
    perfil: 'Cero impacto · Cuerpo completo · Ideal para lesiones',
    descripcion: 'El ejercicio más completo y con menos riesgo de lesión. Trabaja todos los grupos musculares simultáneamente, mejora la capacidad pulmonar y es especialmente indicada para personas con problemas articulares.',
    frecuencia: '3-4 días/semana, sesiones de 30-60 min',
    inicio: 'Empieza con 20-30 min y aumenta el volumen progresivamente',
    coste: '20-40 €/mes en piscina municipal, más en centros privados',
    beneficios: ['Cero impacto articular', 'Trabaja todo el cuerpo en una sesión', 'Mejora capacidad pulmonar y cardiovascular', 'Indicada en embarazo, artritis, obesidad, rehabilitación', 'Refrescante en verano, climatizada en invierno'],
    equipo: ['Bañador/bañadora de lycra (no de playa)', 'Gafas de natación', 'Gorro de silicona', 'Chanclas para la zona de duchas', 'Opcional: tabla, pull buoy, aletas'],
    consejos: ['Si no tienes buena técnica, una clase inicial vale mucho la inversión', 'Aprende al menos 2 estilos para variar y evitar sobrecargas', 'El cloro reseca: hidrata la piel y el cabello después', 'Comer justo antes de nadar puede causar molestias — espera 1h'],
  },
  ciclismo: {
    icono: '🚴',
    nombre: 'Ciclismo (Ruta o MTB)',
    perfil: 'Libertad · Alta quema calórica · Bajo impacto',
    descripcion: 'El ciclismo combina ejercicio cardiovascular intenso con bajo impacto articular. Tanto en ruta como en montaña, ofrece paisajes, comunidad activa y una herramienta de transporte sostenible.',
    frecuencia: '2-4 días/semana, salidas de 1-3 horas',
    inicio: 'Empieza en terreno llano y ve aumentando la distancia gradualmente',
    coste: 'Inversión inicial en bici (300-1.500€) + mantenimiento anual',
    beneficios: ['Muy alta quema calórica en salidas largas', 'Bajo impacto en rodillas y articulaciones', 'Puede ser transporte y ejercicio a la vez', 'Comunidad muy activa y solidaria', 'Paisajes y naturaleza como motivación'],
    equipo: ['Bicicleta adecuada al uso (ruta, MTB, urbana)', 'Casco (obligatorio en carretera)', 'Culotte acolchado', 'Gafas de sol y guantes', 'Agua y gel energético para salidas largas'],
    consejos: ['Regula la altura del sillín: la rodilla debe quedar casi extendida abajo', 'En carretera, sé siempre visible (luces, chaleco en condiciones de poca visibilidad)', 'El mantenimiento básico (inflado, cadena) lo puedes aprender fácilmente', 'Empieza con distancias cortas: la resistencia ciclista se construye despacio'],
  },
  'yoga-pilates': {
    icono: '🧘',
    nombre: 'Yoga y Pilates',
    perfil: 'Mente-cuerpo · Flexibilidad · Bajo impacto',
    descripcion: 'Disciplinas que combinan movimiento consciente, respiración y fuerza postural. Ideales para reducir el estrés, ganar flexibilidad y mejorar la postura. Perfectas como complemento o como actividad principal.',
    frecuencia: '3-5 días/semana, sesiones de 30-60 min',
    inicio: 'Clases para principiantes presenciales o apps guiadas',
    coste: 'Gratis con apps o YouTube · 30-80 €/mes en estudio',
    beneficios: ['Reducción del estrés y la ansiedad demostrada', 'Mejora de postura y consciencia corporal', 'Flexibilidad y movilidad articular', 'Fortalecimiento del core y músculos estabilizadores', 'Puede practicarse en casa sin equipamiento'],
    equipo: ['Esterilla antideslizante (imprescindible)', 'Ropa cómoda y elástica', 'Opcional: bloque y correa de yoga', 'Espacio despejado de 2x1 metros'],
    consejos: ['No fuerces las posturas — el dolor es una señal, no un objetivo', 'La constancia importa más que la intensidad: 20 min diarios supera 90 min una vez/semana', 'Yoga y pilates son complementarios, no rivales — combínalos si puedes', 'El yoga online de calidad es excelente y gratuito en YouTube'],
  },
  'entrenamiento-casa': {
    icono: '🏠',
    nombre: 'Entrenamiento en Casa',
    perfil: 'Sin desplazamiento · Flexible · Económico',
    descripcion: 'El entrenamiento en casa ha ganado enorme popularidad. Con el peso corporal o mínimo equipamiento puedes conseguir resultados excelentes. La clave está en la planificación y la constancia.',
    frecuencia: '4-5 días/semana, sesiones de 20-45 min',
    inicio: 'Elige un programa estructurado (app, YouTube, entrenador online)',
    coste: 'Gratis o mínimo — opcional invertir en mancuernas o bandas elásticas',
    beneficios: ['Sin desplazamiento ni cuota de instalación', 'Horario totalmente libre', 'Ideal para empezar sin vergüenza social', 'Muy efectivo con programas bien diseñados', 'Puedes combinar distintos estilos (HIIT, fuerza, yoga...)'],
    equipo: ['Espacio despejado de al menos 2x2 metros', 'Esterilla', 'Opcional: mancuernas ajustables, bandas elásticas, barra de dominadas', 'Dispositivo para seguir el entrenamiento'],
    consejos: ['La autodisciplina es el mayor reto: fija un horario fijo como si fuera una cita', 'Sigue programas estructurados, no hagas ejercicios al azar', 'El HIIT de 20-30 min puede ser tan efectivo como 1h en el gym', 'La ventilación del espacio importa: evita sitios cerrados y sin aire'],
  },
};

/** Orden de declaración: SOLO para recorrer, nunca para desempatar. */
export const CLAVES: EjercicioKey[] = ['gimnasio', 'running', 'natacion', 'ciclismo', 'yoga-pilates', 'entrenamiento-casa'];

/** Nombre con artículo, para las frases del aviso de empate. */
export const CON_ARTICULO: Record<EjercicioKey, string> = {
  gimnasio: 'el gimnasio',
  running: 'el running',
  natacion: 'la natación',
  ciclismo: 'el ciclismo',
  'yoga-pilates': 'el yoga o el pilates',
  'entrenamiento-casa': 'el entrenamiento en casa',
};

/**
 * Coste de partida, de menor a mayor, según las propias fichas de la app: en casa «gratis o
 * mínimo»; yoga y pilates «gratis con apps» y una esterilla; running, unas zapatillas de
 * 80-150 €; natación 20-40 €/mes; gimnasio 25-50 €/mes; ciclismo, una bici de 300-1.500 €.
 * Es un orden estricto: el último criterio de desempate siempre decide.
 */
export const ORDEN_COSTE: Record<EjercicioKey, number> = {
  'entrenamiento-casa': 0,
  'yoga-pilates': 1,
  running: 2,
  natacion: 3,
  gimnasio: 4,
  ciclismo: 5,
};

/** Las preguntas que deshacen un empate, en orden, y cómo se dice cada una. */
const DESEMPATE: { pregunta: string; motivo: string }[] = [
  { pregunta: 'limitaciones', motivo: 'se adapta mejor a la limitación física que has indicado' },
  { pregunta: 'objetivo', motivo: 'encaja mejor con tu objetivo principal' },
  { pregunta: 'presupuesto', motivo: 'encaja mejor con el presupuesto que has indicado' },
];

export interface Resultado {
  ejercicio: EjercicioKey;
  puntos: Record<EjercicioKey, number>;
  /** Otras actividades con la MISMA puntuación que la recomendada. */
  empatados: EjercicioKey[];
  /** Frase que explica cómo se ha deshecho el empate; vacía si no lo hay. */
  criterioDesempate: string;
}

export function calcularResultado(respuestas: Record<string, string>): Resultado {
  const puntos = Object.fromEntries(CLAVES.map((k) => [k, 0])) as Record<EjercicioKey, number>;
  const aporte: Record<string, PesosPorEjercicio> = {};
  for (const p of PREGUNTAS) {
    const opcion = p.opciones.find((o) => o.valor === respuestas[p.id]);
    if (!opcion) continue;
    aporte[p.id] = opcion.pesos;
    for (const k of CLAVES) puntos[k] += opcion.pesos[k];
  }

  const peso = (pregunta: string, k: EjercicioKey) => aporte[pregunta]?.[k] ?? 0;
  const ordenar = (a: EjercicioKey, b: EjercicioKey) => {
    if (puntos[a] !== puntos[b]) return puntos[b] - puntos[a];
    for (const { pregunta } of DESEMPATE) {
      const d = peso(pregunta, b) - peso(pregunta, a);
      if (d !== 0) return d;
    }
    return ORDEN_COSTE[a] - ORDEN_COSTE[b];
  };
  const orden = [...CLAVES].sort(ordenar);
  const ejercicio = orden[0];

  const empatados = orden.slice(1).filter((k) => puntos[k] === puntos[ejercicio]);
  let criterioDesempate = '';
  if (empatados.length > 0) {
    // El criterio que la separa de CADA empatada; si no es el mismo para todas, se dicen los
    // que han intervenido, en su orden.
    const motivos = [...DESEMPATE.map((d) => d.motivo), 'es la opción con menor coste de partida'];
    const decisivo = (k: EjercicioKey) => {
      const i = DESEMPATE.findIndex(({ pregunta }) => peso(pregunta, ejercicio) !== peso(pregunta, k));
      return i === -1 ? DESEMPATE.length : i;
    };
    const usados = [...new Set(empatados.map(decisivo))].sort((a, b) => a - b).map((i) => motivos[i]);
    criterioDesempate = `se muestra primero ${CON_ARTICULO[ejercicio]} porque ${usados.join(' y, a igualdad, ')}`;
  }

  return { ejercicio, puntos, empatados, criterioDesempate };
}
