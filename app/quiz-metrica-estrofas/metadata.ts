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
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quiz de Métrica y Estrofas | meskeIA',
    description: 'Identifica tipos de verso, estrofas y esquemas de rima · 3 niveles · ESO, Bachillerato y Selectividad.',
    images: ['https://meskeia.com/og-image.png'],
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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se cuentan las sílabas de un verso en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para contar las sílabas de un verso se siguen estas reglas: primero se dividen todas las palabras en sílabas; luego se aplica la sinalefa (dos vocales contiguas en palabras distintas se pronuncian en una sola sílaba); finalmente se ajusta el cómputo según el acento de la última palabra: si es aguda se suma una sílaba, si es esdrújula se resta una. El número resultante es la medida del verso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una sinalefa y cuándo no se produce?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La sinalefa es la fusión en una sola sílaba métrica de la vocal final de una palabra y la vocal inicial de la siguiente dentro del mismo verso. No se produce cuando hay una pausa interna fuerte (cesura), cuando el poeta la evita deliberadamente por efecto expresivo (dialefa o hiato métrico), o cuando interviene la letra h (aunque en la práctica la h muda no impide la sinalefa).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las estrofas clásicas de la poesía española?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre las estrofas más estudiadas en secundaria y bachillerato están el romance (versos octosílabos con rima asonante en pares), el soneto (dos cuartetos y dos tercetos en endecasílabos), la décima o espinela (diez octosílabos con esquema ABBAACCDDC), la redondilla (cuatro octosílabos ABBA) y la lira (combinación de heptasílabos y endecasílabos con rima consonante). Cada forma tiene un esquema métrico y de rima definido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la rima consonante y la rima asonante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La rima consonante repite todos los sonidos —vocales y consonantes— a partir de la última vocal tónica: por ejemplo "viento" y "aliento". La rima asonante solo repite las vocales: por ejemplo "tarde" y "calle" (a-e en ambas). El romance emplea rima asonante; el soneto y la décima utilizan rima consonante. Identificar el tipo de rima es esencial para reconocer la estrofa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está pensado este quiz de métrica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El quiz cubre los contenidos de métrica española de 3.º y 4.º de la ESO, Bachillerato y pruebas de acceso universitario. El nivel básico trabaja los versos más comunes (octosílabo, endecasílabo) y la sinalefa; el intermedio introduce estrofas clásicas y esquemas de rima; el avanzado profundiza en formas métricas menos habituales y casos especiales de cómputo silábico. También sirve para repasar antes de exámenes de lengua y literatura.',
      },
    },
  ],
};
