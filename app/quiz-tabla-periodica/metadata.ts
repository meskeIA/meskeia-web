import type { Metadata } from 'next';
import { TOTAL_BANCO } from './preguntas';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Tabla Periódica — Pon a prueba tu química | meskeIA',
  description:
    `Quiz interactivo sobre la tabla periódica: números atómicos, grupos, períodos, familias de elementos y propiedades. ${TOTAL_BANCO} preguntas de química. ¿Cuánto sabes de los elementos?`,
  keywords: [
    'quiz tabla periódica',
    'test química',
    'elementos químicos',
    'números atómicos',
    'grupos periódicos',
    'familias elementos',
    'halógenos',
    'gases nobles',
    'metales alcalinos',
    'quiz ciencias',
  ],
  openGraph: {
    title: 'Quiz Tabla Periódica | meskeIA',
    description:
      `${TOTAL_BANCO} preguntas sobre elementos, grupos, propiedades y curiosidades de la tabla periódica. ¿Eres un experto en química?`,
    url: 'https://meskeia.com/quiz-tabla-periodica/',
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
  alternates: {
    canonical: 'https://meskeia.com/quiz-tabla-periodica/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Quiz Tabla Periódica",
  description: `Quiz interactivo sobre la tabla periódica: números atómicos, grupos, períodos, familias de elementos y propiedades. ${TOTAL_BANCO} preguntas de química. ¿Cuánto sabes de los elementos?`,
  url: "https://meskeia.com/quiz-tabla-periodica/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos elementos tiene la tabla periódica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tabla periódica actual contiene 118 elementos confirmados. Los primeros 94 se encuentran de forma natural en la Tierra, mientras que los elementos del 95 al 118 son sintéticos, obtenidos en laboratorio mediante reacciones nucleares. El último elemento confirmado (oganesón, número 118) se sintetizó en 2002.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los grupos y períodos de la tabla periódica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los grupos son las 18 columnas verticales de la tabla periódica; los elementos de un mismo grupo comparten configuración electrónica en su capa de valencia y propiedades químicas similares. Los períodos son las 7 filas horizontales; indican el número de capas de electrones que tiene el átomo. Por ejemplo, todos los elementos del período 3 tienen sus electrones de valencia en la tercera capa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre metales, no metales y metaloides?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los metales (como el hierro, el cobre o el oro) son buenos conductores del calor y la electricidad, tienen brillo metálico y son maleables. Los no metales (como el oxígeno, el nitrógeno o el azufre) son malos conductores y suelen ser frágiles o gaseosos a temperatura ambiente. Los metaloides (como el silicio o el germanio) presentan propiedades intermedias y son fundamentales en la industria de los semiconductores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve estudiar la tabla periódica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Conocer la tabla periódica permite predecir el comportamiento químico de los elementos, entender cómo se forman los compuestos y enlazar la química con la física cuántica. Es la base de la química, la farmacología, la ciencia de materiales y la ingeniería. En el ámbito educativo es contenido obligatorio en la ESO, el bachillerato científico y los primeros cursos universitarios de ciencias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los gases nobles y por qué no reaccionan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los gases nobles son los seis elementos del grupo 18: helio, neón, argón, criptón, xenón y radón. Su capa de valencia está completamente llena de electrones (configuración de octeto estable), lo que les confiere una reactividad química extremadamente baja. Por eso se llaman también gases inertes y se usan en aplicaciones donde se necesita un ambiente inerte, como el llenado de bombillas o la soldadura de precisión.',
      },
    },
  ],
};
