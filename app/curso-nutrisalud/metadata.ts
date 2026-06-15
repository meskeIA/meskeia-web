import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Curso de Nutrición - Nutrición Avanzada Basada en Ciencia | meskeIA',
  description: 'Descubre la diferencia entre comer y nutrirse con conocimiento nutricional avanzado basado en ciencia. Fundamentos, interacciones alimentarias, efectos en órganos y aplicación práctica.',
  keywords: 'nutrición avanzada, alimentación saludable, macronutrientes, micronutrientes, biodisponibilidad, interacciones alimentarias, nutrición científica, educación nutricional, meskeIA',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Curso de Nutrición - Nutrición Avanzada Basada en Ciencia',
    description: 'Conocimiento nutricional avanzado basado en ciencia. Más allá de los consejos básicos que ya conoces.',
    url: 'https://meskeia.com/curso-nutrisalud/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Curso de Nutrición - Nutrición Avanzada Basada en Ciencia',
    description: 'Conocimiento nutricional avanzado basado en ciencia. Más allá de los consejos básicos que ya conoces.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Curso de Nutrición - meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Curso de Nutrición - Nutrición Avanzada Basada en Ciencia",
  description: "Descubre la diferencia entre comer y nutrirse con conocimiento nutricional avanzado basado en ciencia. Fundamentos, interacciones alimentarias, efectos en órganos y aplicación práctica.",
  url: 'https://meskeia.com/curso-nutrisalud/',
  category: 'EducationalApplication',
  features: [
    '12 módulos estructurados: fundamentos, macronutrientes, micronutrientes, interacciones, órganos y aplicación práctica',
    'Capítulos sobre efectos de la nutrición en cerebro, corazón, intestino, hígado y huesos',
    'Sección de interacciones alimentarias: combinaciones sinérgicas y que reducen la absorción',
    'Capítulo de mitos nutricionales con revisión de evidencia científica actualizada',
    'Glosario técnico de términos nutricionales y recursos adicionales',
    'Sistema de progreso persistente con consentimiento informado y disclaimers médicos',
    'TextToSpeech en cada capítulo para seguir el contenido sin leer',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué aprendo en este curso de nutrición?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El curso cubre nutrición basada en evidencia científica: fundamentos de macro y micronutrientes, biodisponibilidad, interacciones entre alimentos (sinérgicas y que reducen la absorción), efectos de la nutrición en cerebro, corazón, intestino, hígado y huesos, y aplicación práctica. Incluye también un capítulo de mitos nutricionales con revisión crítica de la evidencia disponible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito conocimientos previos para seguir el curso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El curso está diseñado para personas con curiosidad por la nutrición y la salud, sin necesidad de formación en biología o medicina. Los conceptos se explican desde la base, con terminología clara, y hay un glosario técnico disponible para consultar cualquier término.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia este curso de los consejos de nutrición habituales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Este curso va más allá de las recomendaciones generalistas ("come más verdura", "reduce el azúcar") para explicar los mecanismos: por qué ciertos alimentos se absorben mejor juntos, cómo el intestino comunica con el cerebro, qué ocurre realmente a nivel metabólico. Se citan estudios concretos y se distingue entre evidencia sólida, prometedora y débil.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Sustituye este curso a la consulta con un dietista o médico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El contenido es educativo y de divulgación científica. No constituye asesoramiento dietético personalizado ni orientación médica. Para cambios significativos en la alimentación, especialmente si hay patologías, es imprescindible consultar a un dietista-nutricionista colegiado o a un profesional de la salud. El curso incluye un aviso médico explícito antes de comenzar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo se tarda en completar el curso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El curso tiene 12 módulos y más de 30 capítulos. A un ritmo de lectura cómoda, cada capítulo lleva entre 5 y 15 minutos. El progreso se guarda automáticamente en el navegador, por lo que puedes avanzar a tu ritmo en varias sesiones. Todos los capítulos incluyen lectura en voz alta (TextToSpeech) para seguir el contenido sin leer.',
      },
    },
  ],
};
