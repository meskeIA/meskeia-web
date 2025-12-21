/**
 * Definición de las 12 Suites Temáticas de meskeIA
 *
 * Las Suites agrupan apps por "problemas que resuelven", no por tipo de herramienta.
 * Una app puede pertenecer a múltiples suites (clasificación NO excluyente).
 *
 * Creado: 2025-12-21
 */

// Tipos de suites disponibles (exportado como valor para compatibilidad con Turbopack)
export const SUITE_IDS = [
  'fiscal',
  'inmobiliaria',
  'finanzas',
  'freelance',
  'marketing',
  'diseno',
  'estudiantes',
  'salud',
  'juegos',
  'cultura',
  'productividad',
  'tecnicas',
] as const;

export type SuiteType = typeof SUITE_IDS[number];

// Definición de las 12 Suites
export const suites = [
  {
    id: 'fiscal' as SuiteType,
    name: 'Fiscal y Herencias',
    icon: '🏛️',
    description: 'Impuestos, herencias, donaciones y trámites fiscales'
  },
  {
    id: 'inmobiliaria' as SuiteType,
    name: 'Inmobiliaria y Hogar',
    icon: '🏘️',
    description: 'Hipotecas, alquiler y gestión del hogar'
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
    id: 'marketing' as SuiteType,
    name: 'Marketing y Contenido',
    icon: '📢',
    description: 'SEO, redes sociales y creación de contenido'
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
    id: 'salud' as SuiteType,
    name: 'Salud y Bienestar',
    icon: '🏥',
    description: 'Salud personal, nutrición y cuidado de mascotas'
  },
  {
    id: 'juegos' as SuiteType,
    name: 'Juegos y Ocio',
    icon: '🎲',
    description: 'Diversión y entretenimiento'
  },
  {
    id: 'cultura' as SuiteType,
    name: 'Cultura General',
    icon: '📚',
    description: 'Conocimiento, referencias y aprendizaje'
  },
  {
    id: 'productividad' as SuiteType,
    name: 'Productividad',
    icon: '⚡',
    description: 'Organización personal y herramientas del día a día'
  },
  {
    id: 'tecnicas' as SuiteType,
    name: 'Herramientas Técnicas',
    icon: '🔧',
    description: 'Herramientas especializadas y técnicas'
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
