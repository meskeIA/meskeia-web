import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata = {
  title: 'Quiz de Métrica y Estrofas — Poesía española | meskeIA',
  description: 'Pon a prueba tus conocimientos de métrica española: tipos de verso, sinalefa, estrofas clásicas y esquemas de rima. Niveles básico, intermedio y avanzado para ESO, Bachillerato y Selectividad.',
  keywords: ['quiz metrica española', 'test estrofas poesia', 'ejercicios sinalefa', 'tipos de verso ejercicios', 'endecasilabo octosilabo test', 'soneto decima romance', 'bachillerato literatura', 'selectividad poesia'],
  openGraph: {
    title: 'Quiz de Métrica y Estrofas | meskeIA',
    description: 'Identifica tipos de verso, estrofas y esquemas de rima · 3 niveles · ESO, Bachillerato y Selectividad.',
    url: 'https://meskeia.com/quiz-metrica-estrofas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Quiz de Métrica y Estrofas',
  description: 'Quiz interactivo de métrica española con tres niveles de dificultad: identifica tipos de verso por sílabas, estrofas por su esquema y licencias métricas como la sinalefa.',
  url: 'https://meskeia.com/quiz-metrica-estrofas/',
  category: 'EducationalApplication',
  features: [
    'Tres niveles: básico, intermedio y avanzado',
    'Preguntas sobre tipos de verso (pentasílabo al alejandrino)',
    'Identificación de estrofas clásicas: soneto, décima, romance, redondilla',
    'Preguntas sobre sinalefa, hiato y corrección por acento',
    'Esquemas de rima consonante y asonante',
    'Feedback educativo detallado en cada respuesta',
    'Puntuación, tiempo y estadísticas de acierto',
  ],
});
