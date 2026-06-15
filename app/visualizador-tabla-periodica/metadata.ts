import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Tabla Periódica en tu Vida - Elementos que Usas a Diario | meskeIA',
  description: 'Descubre qué elementos químicos hay en tu cuerpo, tu móvil, tu casa y cuáles podrían agotarse. Explicador visual interactivo sobre la tabla periódica en tu día a día.',
  keywords: 'tabla periódica, elementos químicos, química cotidiana, litio batería, oxígeno cuerpo, tierras raras, elementos smartphone, escasez elementos, helio, fósforo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Tabla Periódica en tu Vida - Elementos que Usas a Diario',
    description: 'Qué elementos químicos hay en tu cuerpo, tu móvil y tu casa. Y cuáles podrían agotarse pronto.',
    url: 'https://meskeia.com/visualizador-tabla-periodica/',
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
    title: 'La Tabla Periódica en tu Vida - Explicador Visual',
    description: 'Los elementos químicos que tocas, respiras y llevas en el bolsillo cada día.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Tabla Periódica Vida meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Tabla Periódica en tu Vida - Elementos que Usas a Diario',
  description: 'Explicador visual interactivo sobre los elementos químicos presentes en tu cuerpo, tu smartphone, tu hogar y cuáles son los más escasos del planeta. Química cotidiana explicada de forma visual.',
  url: 'https://meskeia.com/visualizador-tabla-periodica/',
  category: 'EducationalApplication',
  features: [
    'Composición elemental del cuerpo humano con funciones biológicas',
    'Mapa de 30+ elementos en un smartphone: batería, chip, pantalla, contactos',
    'Exploración habitación por habitación de elementos en el hogar',
    'Ranking de escasez: qué elementos podrían agotarse primero',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué elementos químicos componen el cuerpo humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cuerpo humano está formado principalmente por oxígeno (65%), carbono (18%), hidrógeno (10%) y nitrógeno (3%), que juntos representan el 96% de la masa corporal. El resto lo componen calcio y fósforo (huesos y dientes), potasio, sodio y cloro (señalización nerviosa), magnesio, azufre, hierro y una decena de oligoelementos como zinc, yodo, selenio y cobre imprescindibles en pequeñísimas cantidades.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué elementos de la tabla periódica hay dentro de un smartphone?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un smartphone moderno contiene más de 30 elementos diferentes. El litio y el cobalto conforman la batería; el silicio domina el chip; el indio y el estaño forman el recubrimiento conductor de la pantalla táctil (ITO); el oro, la plata y el cobre conectan los circuitos; y elementos de tierras raras como el neodimio, el disprosio o el europio dan vida al altavoz y la cámara. Algunos, como el galio y el germanio, son críticos para los semiconductores de alta frecuencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los elementos químicos más escasos que podrían agotarse?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El helio es el caso más urgente: se obtiene como subproducto del gas natural y, al ser más ligero que el aire, se escapa al espacio una vez liberado. El fósforo es crítico para la agricultura y sus reservas explotables se concentran en pocos países. Las tierras raras (neodimio, disprosio, terbio…) tienen producción muy concentrada y son esenciales para tecnologías limpias. El indio, el galio y el germanio tampoco tienen sustitutos sencillos en electrónica de precisión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la tabla periódica en la vida cotidiana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tabla periódica organiza los 118 elementos conocidos según su número atómico y propiedades, lo que permite predecir cómo se comportarán en reacciones y materiales. En el día a día, explica por qué el aluminio no se oxida a simple vista (capa protectora de alúmina), por qué el cobre conduce bien la electricidad, por qué el flúor fortalece el esmalte dental o por qué el cloro desinfecta el agua. Es la guía fundamental de toda la química industrial y de los materiales modernos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué elementos químicos se encuentran en un hogar normal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una casa hay docenas de elementos en objetos cotidianos. El hierro y el carbono forman el acero de las estructuras y electrodomésticos; el silicio y el calcio están en el vidrio y el cemento; el cloro es la base de los productos de limpieza; el flúor está en las sartenes antiadherentes (PTFE); el cobre corre por el cableado eléctrico; el plomo queda aún en algunas soldaduras antiguas; y el mercurio persiste en termómetros y algunas lámparas fluorescentes compactas de generaciones anteriores.',
      },
    },
  ],
};
