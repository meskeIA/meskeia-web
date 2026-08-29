import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata = {
  title: 'Guía de Comentario de Texto Literario | meskeIA',
  description: 'Aprende a hacer un comentario de texto literario paso a paso: metodología completa, análisis de poesía y prosa, vocabulario técnico y plantillas listas para usar en selectividad y Bachillerato.',
  keywords: ['comentario de texto literario', 'como comentar un poema', 'análisis texto literario', 'comentario selectividad', 'bachillerato lengua comentario', 'analizar poesia', 'análisis literario paso a paso', 'tema estructura recursos literarios', 'EBAU comentario texto', 'analisis narrativo'],
  openGraph: {
    title: 'Guía de Comentario de Texto Literario | meskeIA',
    description: 'Metodología completa, ejemplo trabajado, vocabulario técnico y plantillas para el comentario de texto literario.',
    url: 'https://meskeia.com/guia-comentario-texto/',
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
    title: 'Guía de Comentario de Texto Literario | meskeIA',
    description: 'Metodología completa, ejemplo trabajado, vocabulario técnico y plantillas para el comentario de texto literario.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Comentario de Texto Literario',
  description: 'Guía completa para hacer comentarios de texto literario: metodología en 7 pasos, análisis de poesía y prosa con ejemplos reales, glosario de términos técnicos y plantillas de frases listas para selectividad y Bachillerato.',
  url: 'https://meskeia.com/guia-comentario-texto/',
  category: 'EducationalApplication',
  features: [
    'Metodología universal en 7 pasos para cualquier texto literario',
    'Guía específica para comentar poesía con ejemplo trabajado (Bécquer)',
    'Guía específica para comentar textos en prosa narrativa',
    'Vocabulario técnico organizado por categoría (métrica, figuras, narratología)',
    'Plantillas de frases listas para cada sección del comentario',
    'Errores frecuentes en exámenes de selectividad EBAU/PAES',
    'Adaptado al currículo de Bachillerato y acceso universitario en España y Latinoamérica',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los pasos para hacer un comentario de texto literario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un comentario de texto literario sigue generalmente 7 pasos: lectura comprensiva, localización y contexto, determinación del tema, análisis de la estructura, estudio de la forma y recursos estilísticos, valoración crítica personal y conclusión. Completar cada fase de forma ordenada garantiza un análisis coherente y completo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se comenta un poema en selectividad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En los exámenes de acceso universitario el comentario de un poema suele incluir: situar al autor y la obra en su contexto literario, identificar el tema y los motivos, analizar la estructura métrica (tipo de verso, rima, estrofa) y las figuras retóricas más relevantes, y finalizar con una valoración personal argumentada. Es importante citar versos concretos para apoyar cada afirmación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre comentar un texto en prosa y un texto en verso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un texto en prosa el análisis formal se centra en el narrador, el punto de vista, el tiempo y el espacio narrativos, así como en el estilo sintáctico y léxico. En un texto en verso, además de los recursos retóricos, es imprescindible analizar la métrica: número de sílabas, tipo de rima y nombre de la estrofa. Ambos requieren determinar el tema y la estructura, pero las herramientas formales difieren.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué figuras retóricas son más frecuentes en los textos literarios de examen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las figuras más habituales en textos de examen son la metáfora, la comparación o símil, la hipérbole, el paralelismo, la anáfora, la antítesis y la personificación. Identificarlas correctamente y explicar su función expresiva —qué efecto producen en el lector y cómo refuerzan el tema— es un criterio de calificación clave en la mayoría de pruebas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil aprender a comentar textos literarios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La competencia en comentario de texto es útil para estudiantes de secundaria y bachillerato que preparan exámenes de lengua y literatura, para quienes se presentan a pruebas de acceso universitario, y para cualquier persona interesada en leer literatura con mayor profundidad. También es una habilidad transferible a la argumentación escrita en otros ámbitos académicos y profesionales.',
      },
    },
  ],
};
