/**
 * Definición de las 11 Suites Temáticas de meskeIA
 *
 * Las Suites agrupan apps por "problemas que resuelven", no por tipo de herramienta.
 * Una app puede pertenecer a múltiples suites (clasificación NO excluyente).
 * Ordenadas alfabéticamente por nombre.
 *
 * Actualizado: 2026-02-19
 */

// Tipos de suites disponibles (exportado como valor para compatibilidad con Turbopack)
export const SUITE_IDS = [
  'cultura',
  'diseno',
  'estudiantes',
  'finanzas',
  'freelance',
  'tecnicas',
  'inmobiliaria',
  'juegos',
  'marketing',
  'productividad',
  'salud',
  'viajes',
] as const;

export type SuiteType = typeof SUITE_IDS[number];

// Definición de las 11 Suites (ordenadas alfabéticamente por nombre)
export const suites = [
  {
    id: 'cultura' as SuiteType,
    name: 'Cultura General',
    icon: '📚',
    description: 'Conocimiento, referencias y aprendizaje'
  },
  {
    id: 'diseno' as SuiteType,
    name: 'Diseño y Desarrollo',
    icon: '🎨',
    description: 'Herramientas para diseñadores y desarrolladores'
  },
  {
    id: 'estudiantes' as SuiteType,
    name: 'Estudiantes',
    icon: '🧮',
    description: 'Matemáticas, ciencias y herramientas de estudio'
  },
  {
    id: 'finanzas' as SuiteType,
    name: 'Finanzas e Inversión',
    icon: '📈',
    description: 'Ahorro, inversión y planificación financiera'
  },
  {
    id: 'freelance' as SuiteType,
    name: 'Freelance y Autónomo',
    icon: '💼',
    description: 'Herramientas para profesionales independientes'
  },
  {
    id: 'tecnicas' as SuiteType,
    name: 'Herramientas Técnicas',
    icon: '🔧',
    description: 'Herramientas especializadas y técnicas'
  },
  {
    id: 'inmobiliaria' as SuiteType,
    name: 'Inmobiliaria y Hogar',
    icon: '🏘️',
    description: 'Hipotecas, alquiler y gestión del hogar'
  },
  {
    id: 'juegos' as SuiteType,
    name: 'Juegos y Ocio',
    icon: '🎲',
    description: 'Diversión y entretenimiento'
  },
  {
    id: 'marketing' as SuiteType,
    name: 'Marketing y Contenido',
    icon: '📢',
    description: 'SEO, redes sociales y creación de contenido'
  },
  {
    id: 'productividad' as SuiteType,
    name: 'Productividad',
    icon: '⚡',
    description: 'Organización personal y herramientas del día a día'
  },
  {
    id: 'salud' as SuiteType,
    name: 'Salud y Bienestar',
    icon: '🏥',
    description: 'Salud personal, nutrición y cuidado de mascotas'
  },
  {
    id: 'viajes' as SuiteType,
    name: 'Viajes y Turismo',
    icon: '✈️',
    description: 'Planifica viajes, divisas, enchufes y presupuestos de viaje'
  },
] as const;

// Función para obtener una suite por su ID
export const getSuiteById = (id: SuiteType) => {
  return suites.find(suite => suite.id === id);
};

// Función para obtener el nombre de una suite por su ID
export const getSuiteName = (id: SuiteType): string => {
  return getSuiteById(id)?.name || id;
};
