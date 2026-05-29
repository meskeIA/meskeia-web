import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Movimientos Artísticos | meskeIA',
  description: 'Explora 15 movimientos artísticos: Románico, Gótico, Renacimiento, Barroco, Impresionismo, Cubismo, Surrealismo, Pop Art y más. Cronología, artistas y contexto histórico.',
  keywords: ['movimientos artísticos', 'historia del arte', 'impresionismo', 'cubismo', 'renacimiento', 'surrealismo', 'arte moderno'],
  openGraph: {
    title: 'Movimientos Artísticos — meskeIA',
    description: 'Cronología visual de los grandes movimientos artísticos: del Románico al Arte Digital.',
    url: 'https://meskeia.com/visualizador-arte-movimientos/',
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

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Movimientos Artísticos',
  description: 'Herramienta educativa sobre historia del arte y movimientos artísticos',
  url: 'https://meskeia.com/visualizador-arte-movimientos/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los principales movimientos artísticos de la historia del arte occidental?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La historia del arte occidental se articula en grandes períodos: Arte Románico (siglos XI-XII) y Gótico (XII-XV) en la Edad Media; Renacimiento (XV-XVI) y Barroco (XVII-XVIII) en la Modernidad temprana; Neoclasicismo y Romanticismo en el siglo XVIII-XIX; e Impresionismo, Expresionismo, Cubismo, Surrealismo, Abstracción y Arte Conceptual en el arte moderno y contemporáneo. Cada movimiento responde a su contexto histórico, filosófico y tecnológico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia al Impresionismo del Postimpresionismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Impresionismo (París, 1860-1880) buscaba capturar la luz y el instante con pinceladas sueltas y color directo del natural; sus figuras clave fueron Monet, Renoir y Degas. El Postimpresionismo (1880-1905) parte de esa base técnica pero la lleva en direcciones más personales: Cézanne exploró la estructura geométrica de la naturaleza, Van Gogh el color expresivo, y Gauguin el primitivismo simbólico. El Postimpresionismo pavimentó el camino al arte moderno del siglo XX.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Cubismo y quiénes fueron sus principales representantes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Cubismo fue un movimiento de vanguardia desarrollado entre 1907 y 1914 por Pablo Picasso y Georges Braque, con influencia decisiva de las últimas pinturas de Cézanne y el arte africano. Rompe con la perspectiva renaissant única: muestra el objeto desde múltiples puntos de vista simultáneos, fragmentando la forma en planos geométricos. Se distinguen dos fases: Cubismo analítico (formas descompuestas, colores neutros) y Cubismo sintético (collage, mayor color y síntesis formal).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo influyó el contexto histórico en el surgimiento del Surrealismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Surrealismo nació en París en 1924, impulsado por André Breton, en el período de entreguerras marcado por la crisis del racionalismo tras la Primera Guerra Mundial y la expansión del psicoanálisis de Freud. El movimiento exploró el inconsciente, los sueños y el azar como fuentes de creación artística, en reacción al horror de la guerra y al dominio de la razón. Dalí, Magritte, Ernst y Kahlo son sus representantes más reconocidos internacionalmente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué caracteriza al Arte Digital como movimiento contemporáneo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Arte Digital surge a partir de la segunda mitad del siglo XX con la incorporación del ordenador como herramienta creativa, y se acelera desde los años 90 con internet. Sus rasgos principales son la interactividad (la obra puede modificarse con la participación del espectador), la reproductibilidad sin pérdida de calidad, el uso de algoritmos y, desde 2021, la emergencia de los NFT como mecanismo de autenticación de obra digital única. Abarca desde net.art hasta instalaciones de realidad aumentada y generación por inteligencia artificial.',
      },
    },
  ],
};
