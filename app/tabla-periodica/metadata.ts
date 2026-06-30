import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tabla Periódica Interactiva - 118 Elementos con Propiedades | meskeIA',
  description: 'Tabla periódica interactiva con los 118 elementos químicos. Propiedades, masas molares y electronegatividad de cada elemento. Filtros por familia y estado. 100% gratis.',
  keywords: 'tabla periodica, elementos quimicos, quimica, masa molar, masas molares, propiedades elementos, taula periòdica, metales, no metales, gases nobles, lantanidos, actinidos, educacion, bachillerato, preparatoria, secundaria, educacion media',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/tabla-periodica/',
  },
  openGraph: {
    type: 'website',
    title: 'Tabla Periódica Interactiva | meskeIA',
    description: 'Explora los 118 elementos químicos de forma interactiva. Filtros, información detallada y calculadora de masa molar incluida.',
    url: 'https://meskeia.com/tabla-periodica/',
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
    title: 'Tabla Periódica Interactiva | meskeIA',
    description: 'Explora los 118 elementos químicos de forma visual y educativa.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos elementos tiene la tabla periódica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tabla periódica tiene 118 elementos químicos confirmados, desde el hidrógeno (H, número atómico 1) hasta el oganesón (Og, número atómico 118). Los elementos del 1 al 94 se encuentran en la naturaleza; los del 95 al 118 son sintéticos, obtenidos en laboratorio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la masa molar de un compuesto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La masa molar de un compuesto se obtiene sumando las masas atómicas de todos sus átomos. Por ejemplo, el agua (H₂O) tiene masa molar = 2 × 1,008 + 15,999 = 18,015 g/mol. Las masas atómicas de cada elemento aparecen en la tabla periódica y se expresan en gramos por mol (g/mol).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las familias o grupos de la tabla periódica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las principales familias de la tabla periódica son: metales alcalinos (grupo 1), alcalinotérreos (grupo 2), metales de transición (grupos 3-12), metaloides, no metales, halógenos (grupo 17), gases nobles (grupo 18), lantánidos y actínidos. Los elementos de un mismo grupo comparten propiedades químicas similares.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre período y grupo en la tabla periódica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los grupos son las columnas verticales (del 1 al 18) y agrupan elementos con propiedades químicas similares porque tienen el mismo número de electrones en su capa exterior. Los períodos son las filas horizontales (del 1 al 7) y agrupan elementos con el mismo número de capas electrónicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el número atómico de un elemento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El número atómico (Z) indica el número de protones en el núcleo del átomo. Es único para cada elemento y determina su identidad química. El carbono tiene Z=6, el oxígeno Z=8 y el oro Z=79. En un átomo neutro, el número de protones es igual al número de electrones.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: 'Tabla Periódica Interactiva',
  description: 'Tabla periódica interactiva con los 118 elementos químicos. Filtros por familia y estado, información detallada de cada elemento y calculadora de masa molar integrada.',
  url: 'https://meskeia.com/tabla-periodica/',
  category: 'EducationalApplication',
  features: [
    'Visualización completa de los 118 elementos químicos',
    'Filtros por familia (metales, no metales, gases nobles, etc.)',
    'Filtros por estado físico (sólido, líquido, gaseoso)',
    'Información detallada de cada elemento al hacer clic',
    'Calculadora de masa molar integrada',
    'Búsqueda por nombre, símbolo o número atómico',
    'En español',
  ],
  keywords: ['tabla periódica', 'elementos químicos', 'química', 'masa molar', 'estudiantes', 'bachillerato', 'preparatoria', 'secundaria', 'educación media'],
});
