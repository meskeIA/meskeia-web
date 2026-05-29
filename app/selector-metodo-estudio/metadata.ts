import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Método de Estudio | ¿Cómo Estudias Mejor? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué método de estudio se adapta mejor a tu forma de aprender: repetición espaciada, mapas mentales, proyectos prácticos, Pomodoro con libros o clases particulares.',
  keywords: [
    'qué método de estudio usar',
    'cómo estudiar mejor',
    'repetición espaciada o mapas mentales',
    'Pomodoro para estudiar',
    'clases particulares o autoaprendizaje',
    'técnica estudio efectiva',
    'aprendizaje activo o pasivo',
    'memorización eficiente',
    'método estudio oposiciones',
    'cómo mejorar rendimiento académico',
  ],
  openGraph: {
    title: 'Selector de Método de Estudio — ¿Cómo Aprendes Mejor?',
    description:
      'Descubre qué método de estudio se adapta mejor a tu forma de aprender en 10 preguntas.',
    url: 'https://meskeia.com/selector-metodo-estudio/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Método de Estudio",
  description: "Test de 10 preguntas para saber qué método de estudio se adapta mejor a tu forma de aprender: repetición espaciada, mapas mentales, proyectos prácticos, Pomodoro con libros o clases particulares.",
  url: "https://meskeia.com/selector-metodo-estudio/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los métodos de estudio más efectivos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La evidencia científica respalda especialmente la repetición espaciada (repasar el material en intervalos crecientes), la práctica de recuperación (hacerse preguntas en lugar de releer) y la elaboración (explicar el contenido con las propias palabras). Técnicas como los mapas mentales o el método Pomodoro también son útiles, aunque su efectividad varía mucho según el tipo de aprendiz y el tipo de materia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la repetición espaciada y para quién es útil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La repetición espaciada consiste en revisar el material justo antes de olvidarlo, aumentando progresivamente el intervalo entre repasos. Es especialmente efectiva para memorizar vocabulario, fórmulas, fechas o cualquier contenido factual. Herramientas como Anki implementan este sistema de forma automática y son muy populares entre estudiantes de idiomas, medicina y oposiciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la técnica Pomodoro para estudiar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La técnica Pomodoro divide el tiempo de estudio en bloques de 25 minutos de trabajo concentrado seguidos de 5 minutos de descanso. Tras cuatro bloques, se hace una pausa más larga de 15-30 minutos. Es útil para personas que se distraen con facilidad o que tienen dificultades para mantener la concentración durante periodos prolongados, ya que el límite de tiempo crea un sentido de urgencia manejable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los mapas mentales realmente mejoran el aprendizaje?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los mapas mentales son útiles para organizar ideas, ver relaciones entre conceptos y planificar proyectos, pero la evidencia sobre su superioridad respecto a otras técnicas de estudio es limitada. Funcionan mejor para aprendices visuales y en materias con mucha información interrelacionada (historia, biología). No son especialmente eficaces para memorizar datos aislados, donde la repetición espaciada es más adecuada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué método de estudio se recomienda para oposiciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para oposiciones, la combinación de repetición espaciada (para fijar temario) con práctica de exámenes anteriores (para familiarizarse con el formato y detectar lagunas) es el enfoque más recomendado. Dividir el temario en bloques semanales y hacer repasos acumulativos ayuda a llegar al examen con todo el contenido fresco. La constancia diaria supera en eficacia a los estudios intensivos de última hora.',
      },
    },
  ],
};
