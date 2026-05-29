import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía del Té - Variedades, origen y preparación | meskeIA',
  description: '40 variedades de té del mundo: familia, temperatura, tiempo de infusión, notas de sabor y nivel de cafeína. Verdes, negros, oolong, blancos, pu-erh y rooibos.',
  keywords: 'guia te variedades, te verde japones, te negro darjeeling, oolong taiwan, te blanco china, pu-erh, rooibos, infusion temperatura, te especialidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía del Té | meskeIA',
    description: '40 variedades de té: familia, temperatura de infusión, tiempo, notas de sabor y nivel de cafeína.',
    url: 'https://meskeia.com/guia-te/',
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
    title: 'Guía del Té | meskeIA',
    description: '40 variedades de té del mundo: temperatura, tiempo de infusión, notas de sabor y cafeína.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía del Té meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía del Té',
  description: 'Directorio de 40 variedades de té del mundo con familia (verde, negro, oolong, blanco, pu-erh, amarillo, rooibos), país y región de origen, temperatura de infusión, tiempo, cantidad, nivel de cafeína, notas de sabor y curiosidades históricas. Filtros por familia y búsqueda libre.',
  url: 'https://meskeia.com/guia-te/',
  features: [
    '40 variedades de té con perfil completo',
    'Filtros por familia de té',
    'Búsqueda por nombre, país, región o notas de sabor',
    'Temperatura y tiempo de infusión exactos por variedad',
    'Indicador visual de nivel de cafeína',
    'Nombres originales en su idioma de procedencia',
    'Curiosidades históricas y culturales',
    'Funciona 100% en el navegador, sin registro',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre té verde, negro y oolong?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La diferencia principal está en el nivel de oxidación de la hoja. El té verde no se oxida (0%), lo que preserva sus antioxidantes y le da un sabor fresco y vegetal. El té negro se oxida completamente (~100%), desarrollando sabores robustos, malta y mayor contenido de cafeína. El oolong se oxida parcialmente (entre el 15% y el 85%), situándose a medio camino en sabor, aroma y cafeína.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué temperatura se prepara el té verde para que no amargue?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El té verde debe infusionarse entre 70 °C y 80 °C, nunca con agua hirviendo. A más de 85 °C las catequinas y los taninos se liberan en exceso, produciendo un sabor amargo y astringente. El tiempo de infusión recomendado es de 1 a 3 minutos según la variedad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el té pu-erh y por qué es tan diferente a otros tés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El pu-erh es un té fermentado originario de la provincia de Yunnan (China) que pasa por un proceso de maduración microbiana post-producción. A diferencia del resto de tés, mejora con el tiempo —como un vino— y puede envejecerse durante décadas. Tiene un sabor terroso, húmedo y complejo, y se asocia con propiedades para la digestión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tés tienen menos cafeína para tomar por la noche?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El rooibos (rooibos rojo, originario de Sudáfrica) no contiene cafeína en absoluto, siendo ideal por la noche. Las infusiones de hierbas como manzanilla o menta tampoco son propiamente tés y carecen de cafeína. Entre los tés de la planta Camellia sinensis, el blanco suele tener el nivel más bajo de cafeína, seguido del verde, mientras que el negro y el pu-erh contienen más.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas veces se puede re-infusionar la misma hoja de té?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del tipo de té y de la calidad de la hoja. Los tés de alta calidad como el oolong taiwanés (Dong Ding, Ali Shan) o el pu-erh suelto pueden infusionarse entre 4 y 8 veces, ganando matices distintos en cada vuelta. Los tés negros en bolsita suelen dar solo una o dos infusiones de calidad. Los tés en hoja suelta siempre permiten más re-infusiones que los de bolsita.',
      },
    },
  ],
};
