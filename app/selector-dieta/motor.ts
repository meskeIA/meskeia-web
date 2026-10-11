/**
 * Motor del Selector de Dieta: preguntas con sus pesos, fichas de los seis patrones y cálculo del
 * resultado. Sin dependencias, para poder probarlo fuera del navegador (vivía en page.tsx).
 *
 * Reparación del 11/10/2026 (hallazgos 3140-3146 de la inspección del 10/10):
 *   · Lo declarado que es una IMPOSIBILIDAD descarta, no solo resta puntos. «Vegano/a» y
 *     «Vegetariano/a» daban 0 a los patrones con carne o pescado, pero cualquiera podía ganar:
 *     el 90,7 % de los perfiles veganos recibía mediterránea, DASH o cetogénica (3140). Con
 *     «Colesterol alto o hipertensión» la propia tabla daba 0 a la cetogénica, y aun así ganaba
 *     en 26 perfiles (3143).
 *   · Un empate en cabeza lo resolvía en silencio el orden de declaración (11,39 % de los
 *     perfiles): ahora se dice con quién empata (3145).
 *   · Lo declarado que el patrón ganador no recoge (sin gluten, diabetes, presupuesto ajustado,
 *     comer para gestionar emociones) se dice en una nota junto al resultado (3142-3146).
 */

export type DietaKey = 'mediterranea' | 'vegetariana' | 'vegana' | 'cetogenica' | 'dash' | 'ayuno-intermitente';

/** Orden de declaración: es el que deshace un empate (y el empate se dice, ver calcularResultado). */
export const ORDEN_DIETAS: DietaKey[] = ['mediterranea', 'vegetariana', 'vegana', 'cetogenica', 'dash', 'ayuno-intermitente'];

type PesosOpcion = Record<DietaKey, number>;

export interface OpcionPregunta {
  valor: string;
  etiqueta: string;
  descripcion: string;
  pesos: PesosOpcion;
}

export interface Pregunta {
  id: string;
  categoria: string;
  icono: string;
  texto: string;
  opciones: OpcionPregunta[];
}

export interface DietaInfo {
  icono: string;
  nombre: string;
  perfil: string;
  descripcion: string;
  macros: string;
  dificultad: string;
  coste: string;
  alimentosClave: string[];
  aLimitar: string[];
  consejos: string[];
}

export interface ResultadoCalculo {
  dieta: DietaKey;
  puntos: Record<DietaKey, number>;
  /** Las admitidas con los mismos puntos que la ganadora, sin ella. */
  empatadas: DietaKey[];
  /** Las que lo declarado descarta (restricción o condición de salud). */
  descartadas: DietaKey[];
  /** Lo declarado que el patrón ganador no recoge, dicho junto al resultado. */
  notas: string[];
}

/** % con espacio duro (CLAUDE.md global §2, 25/09/2026). */
const NBSP = ' ';

/**
 * La vitamina B12 en la dieta vegetariana, dicha igual en la tarjeta y en el FAQPage (hallazgo
 * 3159: el FAQPage decía que con lácteos y huevos «la ingesta puede ser suficiente» y la tarjeta,
 * «suplementación recomendable»).
 */
export const B12_LACTOOVO =
  'con lácteos y huevos su ingesta puede quedarse corta: conviene comprobarla en las analíticas y valorar con un profesional alimentos enriquecidos o un suplemento';

// ─────────────────────────────────────────────
// Preguntas del test (10)
// ─────────────────────────────────────────────

export const PREGUNTAS: Pregunta[] = [
  {
    id: 'objetivo',
    categoria: 'Objetivo Principal',
    icono: '🎯',
    texto: '¿Cuál es tu objetivo principal con el cambio de alimentación?',
    opciones: [
      { valor: 'perder_peso', etiqueta: 'Perder peso y grasa corporal', descripcion: 'Reducir talla y mejorar composición', pesos: { mediterranea: 1, vegetariana: 1, vegana: 1, cetogenica: 3, dash: 1, 'ayuno-intermitente': 3 } },
      { valor: 'masa_muscular', etiqueta: 'Ganar músculo o mejorar rendimiento', descripcion: 'Más proteína y energía para entrenar', pesos: { mediterranea: 2, vegetariana: 1, vegana: 0, cetogenica: 2, dash: 0, 'ayuno-intermitente': 1 } },
      { valor: 'salud_general', etiqueta: 'Mejorar la salud general y longevidad', descripcion: 'Comer mejor a largo plazo', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 1, dash: 3, 'ayuno-intermitente': 1 } },
      { valor: 'energia', etiqueta: 'Más energía y menos bajones', descripcion: 'Estabilidad a lo largo del día', pesos: { mediterranea: 3, vegetariana: 2, vegana: 1, cetogenica: 2, dash: 2, 'ayuno-intermitente': 2 } },
    ],
  },
  {
    id: 'restricciones',
    categoria: 'Restricciones Alimentarias',
    icono: '🚫',
    texto: '¿Tienes alguna restricción o preferencia alimentaria?',
    opciones: [
      { valor: 'ninguna', etiqueta: 'Ninguna, como de todo', descripcion: 'Sin limitaciones conocidas', pesos: { mediterranea: 3, vegetariana: 2, vegana: 1, cetogenica: 3, dash: 3, 'ayuno-intermitente': 3 } },
      { valor: 'vegetariano', etiqueta: 'Vegetariano/a (sin carne ni pescado)', descripcion: 'Evito carne y pescado', pesos: { mediterranea: 1, vegetariana: 3, vegana: 1, cetogenica: 0, dash: 1, 'ayuno-intermitente': 2 } },
      { valor: 'vegano', etiqueta: 'Vegano/a (sin productos animales)', descripcion: `Dieta 100${NBSP}% vegetal`, pesos: { mediterranea: 0, vegetariana: 1, vegana: 3, cetogenica: 0, dash: 0, 'ayuno-intermitente': 1 } },
      { valor: 'sin_gluten', etiqueta: 'Sin gluten (celiaquía o sensibilidad)', descripcion: 'Evito el trigo y derivados', pesos: { mediterranea: 2, vegetariana: 1, vegana: 1, cetogenica: 3, dash: 1, 'ayuno-intermitente': 2 } },
    ],
  },
  {
    id: 'actividad',
    categoria: 'Nivel de Actividad',
    icono: '🏃',
    texto: '¿Cómo describirías tu nivel de actividad física diaria?',
    opciones: [
      { valor: 'sedentario', etiqueta: 'Sedentario (trabajo sentado, poco ejercicio)', descripcion: 'Menos de 30 min de actividad al día', pesos: { mediterranea: 2, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 3, 'ayuno-intermitente': 3 } },
      { valor: 'moderado', etiqueta: 'Moderado (camino mucho, algo de deporte)', descripcion: 'Actividad ligera-moderada', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'activo', etiqueta: 'Activo (deporte 3-4 veces/semana)', descripcion: 'Entrenamiento regular', pesos: { mediterranea: 3, vegetariana: 2, vegana: 1, cetogenica: 1, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'muy_activo', etiqueta: 'Muy activo (deporte intenso casi diario)', descripcion: 'Alto rendimiento o trabajo físico', pesos: { mediterranea: 2, vegetariana: 1, vegana: 0, cetogenica: 1, dash: 1, 'ayuno-intermitente': 1 } },
    ],
  },
  {
    id: 'salud',
    categoria: 'Condición de Salud',
    icono: '🏥',
    texto: '¿Tienes alguna condición de salud diagnosticada?',
    opciones: [
      { valor: 'ninguna', etiqueta: 'No, estoy en buen estado de salud', descripcion: 'Sin condiciones relevantes', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'diabetes', etiqueta: 'Diabetes o prediabetes', descripcion: 'Control del azúcar en sangre prioritario', pesos: { mediterranea: 2, vegetariana: 1, vegana: 1, cetogenica: 3, dash: 3, 'ayuno-intermitente': 2 } },
      { valor: 'cardiovascular', etiqueta: 'Colesterol alto o hipertensión', descripcion: 'Salud cardiovascular prioritaria', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 0, dash: 3, 'ayuno-intermitente': 1 } },
      { valor: 'digestiva', etiqueta: 'Problemas digestivos crónicos', descripcion: 'Colon irritable, reflujo, etc.', pesos: { mediterranea: 2, vegetariana: 2, vegana: 1, cetogenica: 1, dash: 2, 'ayuno-intermitente': 1 } },
    ],
  },
  {
    id: 'cocina',
    categoria: 'Tiempo para Cocinar',
    icono: '👨‍🍳',
    texto: '¿Cuánto tiempo dedicas o quieres dedicar a cocinar?',
    opciones: [
      { valor: 'minimo', etiqueta: 'Mínimo, prefiero cosas rápidas', descripcion: 'Menos de 20 min por comida', pesos: { mediterranea: 2, vegetariana: 1, vegana: 1, cetogenica: 2, dash: 1, 'ayuno-intermitente': 3 } },
      { valor: 'basico', etiqueta: 'Cocino básico, recetas sencillas', descripcion: 'Tiempo justo, sin complicaciones', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'normal', etiqueta: 'Me gusta cocinar, tengo tiempo', descripcion: 'Disfruto preparando comida', pesos: { mediterranea: 3, vegetariana: 3, vegana: 3, cetogenica: 2, dash: 3, 'ayuno-intermitente': 1 } },
      { valor: 'mucho', etiqueta: 'Disfruto cocinando sin restricción', descripcion: 'La cocina es un placer', pesos: { mediterranea: 3, vegetariana: 3, vegana: 3, cetogenica: 2, dash: 3, 'ayuno-intermitente': 1 } },
    ],
  },
  {
    id: 'presupuesto',
    categoria: 'Presupuesto Alimentario',
    icono: '💶',
    texto: '¿Cuál es tu presupuesto mensual para la alimentación?',
    opciones: [
      { valor: 'ajustado', etiqueta: 'Muy ajustado, busco economía', descripcion: 'Menos de 150 €/mes por persona', pesos: { mediterranea: 3, vegetariana: 3, vegana: 2, cetogenica: 1, dash: 2, 'ayuno-intermitente': 3 } },
      { valor: 'normal', etiqueta: 'Normal, sin grandes excesos', descripcion: 'Entre 150 y 300 €/mes', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 3, 'ayuno-intermitente': 2 } },
      { valor: 'holgado', etiqueta: 'Holgado, calidad primero', descripcion: 'Más de 300 €/mes sin problema', pesos: { mediterranea: 2, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 2, 'ayuno-intermitente': 1 } },
    ],
  },
  {
    id: 'relacion_comida',
    categoria: 'Relación con la Comida',
    icono: '🧠',
    texto: '¿Cómo describirías tu relación con la comida?',
    opciones: [
      // La descripción era «Relación sana y sin obsesiones», que por contraste calificaba a las
      // demás respuestas (hallazgo 3165; regla 1.quinquies.4).
      { valor: 'equilibrada', etiqueta: 'Como de todo sin problema', descripcion: 'Sin dificultades particulares con la comida', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 3, 'ayuno-intermitente': 2 } },
      { valor: 'selectivo', etiqueta: 'Soy bastante selectivo/a con lo que como', descripcion: 'Tengo gustos definidos', pesos: { mediterranea: 2, vegetariana: 2, vegana: 1, cetogenica: 2, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'ansiedad', etiqueta: 'A veces uso la comida para gestionar emociones', descripcion: 'La relación es compleja a veces', pesos: { mediterranea: 2, vegetariana: 1, vegana: 1, cetogenica: 1, dash: 2, 'ayuno-intermitente': 1 } },
      { valor: 'irregular', etiqueta: 'Como fuera o con horarios muy irregulares', descripcion: 'Ritmo de vida cambiante, sin rutina fija', pesos: { mediterranea: 2, vegetariana: 1, vegana: 1, cetogenica: 1, dash: 1, 'ayuno-intermitente': 3 } },
    ],
  },
  {
    id: 'sostenibilidad',
    categoria: 'Valores Medioambientales',
    icono: '🌍',
    texto: '¿El impacto ambiental de tu alimentación influye en tus decisiones?',
    opciones: [
      { valor: 'muy_importante', etiqueta: 'Sí, es un criterio fundamental', descripcion: 'Busco reducir mi huella activamente', pesos: { mediterranea: 2, vegetariana: 3, vegana: 3, cetogenica: 0, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'algo', etiqueta: 'Me importa, aunque no es prioritario', descripcion: 'Lo considero entre otros factores', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 1, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'no', etiqueta: 'No especialmente, me centro en la salud', descripcion: 'Otros factores son más importantes', pesos: { mediterranea: 2, vegetariana: 1, vegana: 1, cetogenica: 2, dash: 3, 'ayuno-intermitente': 2 } },
    ],
  },
  {
    id: 'plazo',
    categoria: 'Sostenibilidad del Cambio',
    icono: '📅',
    texto: '¿Cuánto tiempo estás dispuesto/a a mantener el cambio de hábitos?',
    opciones: [
      { valor: 'corto', etiqueta: 'Resultados rápidos (1-3 meses)', descripcion: 'Quiero ver cambios pronto', pesos: { mediterranea: 1, vegetariana: 1, vegana: 0, cetogenica: 3, dash: 1, 'ayuno-intermitente': 3 } },
      { valor: 'medio', etiqueta: 'Puedo mantenerlo 6-12 meses', descripcion: 'Tengo paciencia y constancia', pesos: { mediterranea: 2, vegetariana: 2, vegana: 1, cetogenica: 2, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'largo', etiqueta: 'Busco un cambio permanente de estilo de vida', descripcion: 'Quiero que sea mi forma de comer para siempre', pesos: { mediterranea: 3, vegetariana: 3, vegana: 3, cetogenica: 1, dash: 3, 'ayuno-intermitente': 2 } },
    ],
  },
  {
    id: 'variedad',
    categoria: 'Preferencia Culinaria',
    icono: '🍽️',
    // «¿Qué describes mejor…?» (hallazgo 3162).
    texto: '¿Qué describe mejor tu relación con la variedad de alimentos?',
    opciones: [
      { valor: 'mucha_variedad', etiqueta: 'Me encanta probar cosas nuevas', descripcion: 'La variedad es esencial para mí', pesos: { mediterranea: 3, vegetariana: 3, vegana: 2, cetogenica: 1, dash: 3, 'ayuno-intermitente': 1 } },
      { valor: 'moderada', etiqueta: 'Variedad moderada, sin complicarme', descripcion: 'Equilibrio entre variedad y rutina', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'poca', etiqueta: 'Prefiero pocas cosas pero que me gusten', descripcion: 'La simplicidad me va bien', pesos: { mediterranea: 2, vegetariana: 2, vegana: 2, cetogenica: 3, dash: 1, 'ayuno-intermitente': 3 } },
    ],
  },
];

// ─────────────────────────────────────────────
// Fichas de los patrones
// ─────────────────────────────────────────────

export const DIETAS: Record<DietaKey, DietaInfo> = {
  mediterranea: {
    icono: '🫒',
    nombre: 'Dieta Mediterránea',
    perfil: 'Equilibrada · Sostenible · Probada científicamente',
    descripcion: 'El patrón alimentario más estudiado y respaldado. Rica en aceite de oliva, verduras, legumbres, pescado y cereales integrales. Flexible, sabrosa y culturalmente alineada con España.',
    macros: `45-55${NBSP}% carbohidratos · 25-35${NBSP}% grasas saludables · 15-20${NBSP}% proteínas`,
    dificultad: 'Fácil — puedes empezar mañana',
    coste: 'Económica — muchos alimentos locales y de temporada',
    alimentosClave: ['Aceite de oliva virgen extra', 'Verduras y hortalizas de temporada', 'Legumbres (lentejas, garbanzos, alubias)', 'Pescado azul 2-3 veces/semana', 'Cereales integrales', 'Frutos secos y frutas'],
    aLimitar: ['Carnes rojas y procesadas', 'Azúcares refinados y bollería', 'Aceites vegetales refinados', 'Precocinados y ultraprocesados'],
    consejos: ['Cocina con aceite de oliva virgen extra como base', 'Incluye legumbres al menos 3 veces por semana', 'Sustituye el pan blanco por integral', 'Bebe agua como bebida principal', 'Come en compañía cuando puedas — también es parte de la dieta mediterránea'],
  },
  vegetariana: {
    icono: '🥦',
    nombre: 'Dieta Vegetariana',
    perfil: 'Ética · Sostenible · Completa con planificación',
    descripcion: 'Excluye carne y pescado pero incluye huevos y lácteos. Muy completa si se planifica bien. Alta en fibra, antioxidantes y vitaminas. Reducción significativa del impacto ambiental.',
    macros: `50-60${NBSP}% carbohidratos complejos · 20-25${NBSP}% proteínas vegetales · 20-25${NBSP}% grasas`,
    dificultad: 'Media — requiere aprender nuevas combinaciones',
    coste: 'Económica a moderada',
    alimentosClave: ['Legumbres (base proteica principal)', 'Huevos y lácteos de calidad', 'Tofu y tempeh', 'Cereales integrales', 'Frutos secos y semillas', 'Verduras de hoja verde'],
    aLimitar: ['Carne y pescado', 'Procesados vegetarianos ultraelaborados', 'Exceso de lácteos grasos', 'Azúcares añadidos'],
    consejos: ['Combina legumbres + cereal en la misma comida para proteína completa', `Vigila la vitamina B12: ${B12_LACTOOVO}`, 'El hierro vegetal se absorbe mejor con vitamina C', 'No caigas en el error de sustituir carne por más queso'],
  },
  vegana: {
    icono: '🌱',
    nombre: 'Dieta Vegana',
    perfil: `100${NBSP}% vegetal · Ética ambiental · Requiere planificación`,
    descripcion: 'Excluye todos los productos de origen animal. El patrón con menor huella ambiental. Requiere planificación cuidadosa y suplementación para ser nutricionalmente completa.',
    macros: `55-65${NBSP}% carbohidratos · 15-20${NBSP}% proteínas vegetales · 20-25${NBSP}% grasas vegetales`,
    dificultad: 'Alta — suplementación necesaria y planificación constante',
    coste: 'Variable — puede ser económica o cara según las elecciones',
    alimentosClave: ['Legumbres en todas sus formas', 'Tofu, tempeh y edamame', 'Cereales integrales y pseudocereales (quinoa, amaranto)', 'Frutos secos y semillas (base de grasas)', 'Verduras de hoja verde abundantes', 'Algas (fuente de yodo)'],
    // «ultrarefinados» (hallazgo 3162).
    aLimitar: ['Todos los productos de origen animal', 'Procesados veganos ultrarrefinados', 'Exceso de aceites vegetales', 'Alimentos con azúcar añadida'],
    consejos: ['Suplementa B12 sin excepción (no negociable)', 'Vigila omega-3, vitamina D, calcio, zinc y hierro', 'Consulta con un dietista-nutricionista al inicio', 'Lee etiquetas: muchos productos llevan derivados animales ocultos'],
  },
  cetogenica: {
    icono: '🥩',
    nombre: 'Dieta Cetogénica',
    perfil: 'Baja en carbohidratos · Rápida en resultados · Restrictiva',
    descripcion: 'Muy baja en carbohidratos (menos de 50 g/día), alta en grasas. Pone al cuerpo en cetosis, usando grasa como combustible. Suele producir pérdida de peso rápida a corto plazo y mejora del control glucémico en personas con resistencia a la insulina, aunque a largo plazo los resultados se igualan con otras estrategias.',
    macros: `70-75${NBSP}% grasas · 20-25${NBSP}% proteínas · 5${NBSP}% carbohidratos`,
    dificultad: 'Alta — exige contar carbohidratos con precisión',
    coste: 'Moderada a alta — carne, pescado y grasas de calidad',
    alimentosClave: ['Carnes y pescados grasos', 'Huevos (sin límite en cetogénica)', 'Aguacate y aceite de oliva', 'Quesos curados y mantequilla', 'Verduras de hoja verde (bajas en carbohidratos)', 'Frutos secos (con moderación)'],
    aLimitar: ['Todos los cereales y pan', 'Frutas (excepto frutos rojos en pequeña cantidad)', 'Legumbres', 'Azúcares y dulces', 'Alcohol', 'Tubérculos (patata, boniato)'],
    consejos: ['Los primeros 5-7 días pueden ser duros ("gripe ceto") — es normal', 'Hidratación y electrolitos son fundamentales', 'No es adecuada sin supervisión médica si tienes diabetes tipo 1', 'Planifica antes de salir a comer fuera, es más restrictiva socialmente'],
  },
  dash: {
    icono: '❤️',
    nombre: 'Dieta DASH',
    perfil: 'Cardiovascular · Clínicamente validada · Equilibrada',
    descripcion: 'Diseñada para reducir la hipertensión. Muy baja en sodio, rica en potasio, magnesio y calcio. Excelente para la salud cardiovascular y metabólica a largo plazo.',
    macros: `55${NBSP}% carbohidratos complejos · 18${NBSP}% proteínas · 27${NBSP}% grasas saludables`,
    dificultad: 'Media — principalmente reducir sal y procesados',
    coste: 'Económica a moderada',
    alimentosClave: ['Frutas y verduras abundantes (10 raciones/día)', 'Lácteos desnatados', 'Cereales integrales', 'Carnes magras y pescado', 'Legumbres y frutos secos', 'Aceite de oliva'],
    // Decía «Sal añadida (< 2g/día en versión estricta)»: confundía sal con sodio. El tope de la
    // versión estricta es de SODIO total, y 2 g de sal son 0,79 g de sodio (hallazgo 3164).
    aLimitar: ['Sal y alimentos salados (la versión estricta limita el sodio total del día, no solo la sal que añades)', 'Carnes rojas y procesadas', 'Grasas saturadas', 'Dulces y bebidas azucaradas', 'Alcohol'],
    consejos: ['Reduce la sal gradualmente — el paladar se adapta en 2-3 semanas', 'Lee etiquetas: el sodio oculto está en muchos procesados', 'Combínala con ejercicio aeróbico para mayor efecto cardiovascular', 'Consulta a tu médico si tomas medicación antihipertensiva'],
  },
  'ayuno-intermitente': {
    icono: '⏱️',
    nombre: 'Ayuno Intermitente',
    perfil: 'Flexible en ventana · Eficaz para peso · Encaja con horarios irregulares',
    descripcion: 'No es una dieta por sí misma sino un patrón de comidas. Las más populares: 16/8 (ayuno 16h, comer en 8h) y 5:2 (5 días normal, 2 días muy baja ingesta). Permite comer con cierta libertad dentro de la ventana.',
    macros: 'Depende de lo que comas — combínalo con alimentación saludable',
    dificultad: 'Media — la restricción es temporal, no de alimentos',
    coste: 'Económico — en general se come menos',
    alimentosClave: ['Cualquier alimento saludable dentro de la ventana', 'Proteínas saciantes para aguantar el ayuno', 'Verduras y fibra para controlar el hambre', 'Agua, café e infusiones (sin azúcar) en el ayuno', 'Grasas saludables para la saciedad'],
    aLimitar: ['Calorías fuera de la ventana de alimentación', 'Ultraprocesados (derrotan el propósito)', 'Bebidas calóricas durante el ayuno', 'Exceso de comida compulsiva al romper el ayuno'],
    consejos: ['Empieza con 12h de ayuno y aumenta gradualmente', 'El café solo o el té sin azúcar suelen considerarse compatibles con el ayuno, aunque el efecto exacto sobre la insulina puede variar entre personas', 'No es adecuado si tienes historial de trastornos alimentarios', 'Mantén la calidad de lo que comes dentro de la ventana'],
  },
};

// ─────────────────────────────────────────────
// Lo declarado que descarta
// ─────────────────────────────────────────────

/**
 * Patrones que admite cada restricción (hallazgo 3140). El ayuno intermitente organiza CUÁNDO se
 * come, no qué, así que cabe con cualquiera; la nota del resultado lo dice. Sin gluten no
 * descarta: los seis patrones tienen versión sin gluten, y la nota dice qué cambiar.
 */
const ADMITIDAS_POR_RESTRICCION: Record<string, DietaKey[]> = {
  vegano: ['vegana', 'ayuno-intermitente'],
  vegetariano: ['vegetariana', 'vegana', 'ayuno-intermitente'],
};

/** Con colesterol alto o hipertensión la tabla ya daba 0 a la cetogénica (70-75 % de grasas, «quesos curados y mantequilla»): ahora descarta (hallazgo 3143). */
const DESCARTADAS_POR_SALUD: Record<string, DietaKey[]> = {
  cardiovascular: ['cetogenica'],
};

const etiquetaDe = (preguntaId: string, valor: string | undefined): string =>
  PREGUNTAS.find((p) => p.id === preguntaId)?.opciones.find((o) => o.valor === valor)?.etiqueta ?? '';

// ─────────────────────────────────────────────
// Cálculo
// ─────────────────────────────────────────────

export function calcularResultado(respuestas: Record<string, string>): ResultadoCalculo {
  const puntos = Object.fromEntries(ORDEN_DIETAS.map((d) => [d, 0])) as Record<DietaKey, number>;

  PREGUNTAS.forEach((p) => {
    const opcion = p.opciones.find((o) => o.valor === respuestas[p.id]);
    if (opcion) ORDEN_DIETAS.forEach((d) => { puntos[d] += opcion.pesos[d]; });
  });

  const admitidasRestriccion = ADMITIDAS_POR_RESTRICCION[respuestas.restricciones];
  const descartadasSalud = DESCARTADAS_POR_SALUD[respuestas.salud] ?? [];
  const descartadas = ORDEN_DIETAS.filter(
    (d) => (admitidasRestriccion && !admitidasRestriccion.includes(d)) || descartadasSalud.includes(d),
  );
  const admitidas = ORDEN_DIETAS.filter((d) => !descartadas.includes(d));

  // Gana la de más puntos entre las admitidas; un empate lo deshace el orden de declaración, pero
  // ya no en silencio: las empatadas salen en el resultado (hallazgo 3145).
  const maximo = Math.max(...admitidas.map((d) => puntos[d]));
  const enCabeza = admitidas.filter((d) => puntos[d] === maximo);
  const dieta = enCabeza[0];

  return { dieta, puntos, empatadas: enCabeza.slice(1), descartadas, notas: notasDe(dieta, respuestas) };
}

/** Lo declarado que el patrón ganador no recoge, dicho junto al resultado y no en la guía plegada. */
function notasDe(dieta: DietaKey, r: Record<string, string>): string[] {
  const notas: string[] = [];
  const ayuno = dieta === 'ayuno-intermitente';

  if (ayuno && (r.restricciones === 'vegano' || r.restricciones === 'vegetariano')) {
    notas.push(
      r.restricciones === 'vegano'
        ? 'El ayuno intermitente organiza cuándo comes, no qué: dentro de la ventana, mantén tu alimentación vegana (sin productos animales) y su suplementación de B12.'
        : 'El ayuno intermitente organiza cuándo comes, no qué: dentro de la ventana, mantén tu alimentación vegetariana (sin carne ni pescado).',
    );
  }

  // Sin gluten (hallazgo 3142): ningún texto de las seis fichas lo nombraba, y la mediterránea
  // aconsejaba «Sustituye el pan blanco por integral».
  if (r.restricciones === 'sin_gluten') {
    notas.push(
      'Has declarado que evitas el gluten: donde esta ficha dice pan, pasta o cereales integrales, elige los que no lo llevan (arroz, maíz, quinoa, trigo sarraceno, mijo) o productos con el sello «sin gluten». El trigo, la cebada y el centeno lo contienen.',
    );
  }

  // Condición de salud declarada (hallazgo 3143): la ficha solo avisaba de la diabetes tipo 1 en
  // la cetogénica, y la del ayuno no nombraba la diabetes.
  if (r.salud === 'diabetes' && ayuno) {
    notas.push(
      'Has declarado diabetes o prediabetes: el ayuno intermitente puede provocar bajadas de glucosa si tomas insulina u otros fármacos que la reducen. No lo empieces sin hablarlo con tu médico.',
    );
  }
  if (r.salud === 'diabetes' && dieta === 'cetogenica') {
    notas.push(
      'Has declarado diabetes o prediabetes: la cetogénica cambia mucho la glucosa y puede obligar a ajustar la medicación. Hazla solo con supervisión médica.',
    );
  }

  // Comer para gestionar emociones (hallazgo 3144): sus pesos no movían nunca el orden.
  if (r.relacion_comida === 'ansiedad' && (ayuno || dieta === 'cetogenica')) {
    notas.push(
      'Has dicho que a veces usas la comida para gestionar emociones: los patrones con reglas estrictas (ventanas de ayuno, contar carbohidratos) pueden complicar esa relación. Si te preocupa, coméntalo con un dietista-nutricionista o un psicólogo antes de empezar.',
    );
  }

  // Presupuesto (hallazgo 3146): «Muy ajustado» solo restaba un punto a la cetogénica.
  if (r.presupuesto === 'ajustado' && /alta/i.test(DIETAS[dieta].coste)) {
    notas.push(
      `Has dicho que tu presupuesto es muy ajustado («${etiquetaDe('presupuesto', r.presupuesto)}») y este patrón tiene un coste estimado moderado a alto: compara antes con la mediterránea o la vegetariana, que se basan en legumbres, verduras y cereales.`,
    );
  }

  return notas;
}
