import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tendencias de la Tabla Periódica - El Mapa de la Química | meskeIA',
  description: 'Descubre las tendencias de la tabla periódica: electronegatividad, radio atómico, energía de ionización. Mapas de calor interactivos. Explicador visual.',
  keywords: 'tabla periódica tendencias, electronegatividad, radio atómico, energía ionización, mapa calor, química visual, Pauling, elementos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tendencias de la Tabla Periódica - El Mapa de la Química',
    description: 'Electronegatividad, radio atómico y energía de ionización visualizados como mapas de calor interactivos.',
    url: 'https://meskeia.com/visualizador-tabla-periodica-interactiva/',
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
    title: 'Tendencias Tabla Periódica - Explicador Visual',
    description: 'La tabla periódica como nunca la habías visto: mapas de calor de propiedades atómicas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Tabla Periódica Tendencias meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tendencias de la Tabla Periódica - El Mapa de la Química',
  description: 'Explicador visual interactivo sobre tendencias periódicas: electronegatividad (escala Pauling), radio atómico, energía de ionización y aplicaciones prácticas.',
  url: 'https://meskeia.com/visualizador-tabla-periodica-interactiva/',
  category: 'EducationalApplication',
  features: [
    'Mapa de calor de electronegatividad (escala Pauling)',
    'Radio atómico con círculos proporcionales',
    'Energía de ionización con gráfico de barras',
    'Aplicaciones prácticas: baterías, materiales, electrónica',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las tendencias periódicas y para qué sirven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tendencias periódicas son patrones sistemáticos en las propiedades de los elementos a medida que avanzan por la tabla periódica. Las más importantes son la electronegatividad, el radio atómico y la energía de ionización. Permiten predecir el comportamiento químico de los elementos y diseñar materiales con propiedades específicas, desde baterías de litio hasta semiconductores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la electronegatividad y cómo se mide en la escala Pauling?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La electronegatividad mide la tendencia de un átomo a atraer electrones en un enlace químico. La escala Pauling, propuesta por Linus Pauling en 1932, va de 0,7 (francio, menos electronegativo) a 4,0 (flúor, el más electronegativo). Los metales tienen valores bajos y los no metales altos; esta diferencia determina si un enlace es iónico, covalente polar o covalente puro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué disminuye el radio atómico de izquierda a derecha en un período?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al avanzar de izquierda a derecha en un mismo período, el número de protones aumenta pero los electrones se añaden a la misma capa. La mayor carga nuclear atrae con más fuerza a los electrones, contrayendo la nube electrónica. Por eso el sodio (Na) tiene un radio de 186 pm mientras que el cloro (Cl), en el mismo período, solo tiene 99 pm.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este visualizador de la tabla periódica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de secundaria y bachillerato que estudian química, así como para universitarios de primeros cursos de ciencias. También sirve a docentes que quieren mostrar en clase patrones visuales difíciles de captar en una tabla estática. No requiere instalación ni registro, por lo que puede usarse directamente en el navegador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la energía de ionización y la electronegatividad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La energía de ionización es la energía necesaria para arrancar completamente un electrón de un átomo en estado gaseoso, mientras que la electronegatividad describe la capacidad de atraer electrones dentro de un enlace. Ambas aumentan hacia la derecha y arriba de la tabla, pero la energía de ionización muestra irregularidades notables (por ejemplo, el nitrógeno tiene mayor primera energía de ionización que el oxígeno por la estabilidad del orbital semilleno 2p).',
      },
    },
  ],
};
