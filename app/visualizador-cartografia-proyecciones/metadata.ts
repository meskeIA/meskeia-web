import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cartografía y Proyecciones - Mercator, Peters y Robinson | meskeIA',
  description: 'Por qué los mapas mienten: Groenlandia no es tan grande como África. Compara 5 proyecciones cartográficas y entiende las distorsiones de tamaño y forma. Interactivo.',
  keywords: 'cartografia, proyecciones, Mercator, Peters, Robinson, mapa, coordenadas, husos horarios, distorsion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cartografía y Proyecciones',
    description: '5 proyecciones cartográficas explicadas visualmente',
    url: 'https://meskeia.com/visualizador-cartografia-proyecciones/',
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
    title: 'Cartografía y Proyecciones',
    description: 'Por qué todos los mapas mienten — y cómo',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Cartografía meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cartografía y Proyecciones',
  description: 'Explora 5 proyecciones cartográficas (Mercator, Peters, Robinson, Mollweide, Azimutal), compara distorsiones, entiende coordenadas y husos horarios.',
  url: 'https://meskeia.com/visualizador-cartografia-proyecciones/',
  category: 'EducationalApplication',
  features: [
    '5 proyecciones cartográficas comparadas',
    'Groenlandia vs África en cada proyección',
    'Indicadores de Tissot',
    'Coordenadas y husos horarios',
    'Funciona 100% en el navegador',
    'Gratuito y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué todos los mapas distorsionan la realidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Representar la superficie esférica de la Tierra en un plano bidimensional es matemáticamente imposible sin introducir algún tipo de distorsión. Dependiendo de la proyección elegida, se deforman las áreas, las formas, las distancias o las direcciones. No existe una proyección "perfecta": cada una preserva unas propiedades a costa de distorsionar otras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la proyección de Mercator y la de Peters?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La proyección de Mercator (1569) conserva los ángulos y formas locales, lo que la hizo ideal para la navegación, pero exagera enormemente el tamaño de las zonas polares: Groenlandia aparece tan grande como África cuando en realidad África es 14 veces mayor. La proyección de Peters (1973) es de área equivalente, lo que representa correctamente los tamaños relativos de los continentes, pero distorsiona las formas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los indicadores de Tissot y para qué sirven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los indicadores de Tissot son círculos imaginarios de igual tamaño distribuidos sobre el globo terráqueo. Al aplicar una proyección cartográfica, estos círculos se deforman en elipses de distinto tamaño y orientación, revelando visualmente el tipo y magnitud de la distorsión en cada punto del mapa. Son la herramienta estándar para comparar objetivamente el comportamiento de diferentes proyecciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funcionan las coordenadas geográficas y los husos horarios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las coordenadas geográficas usan latitud (−90° a +90°, norte/sur desde el ecuador) y longitud (−180° a +180°, este/oeste desde el meridiano de Greenwich) para localizar cualquier punto en la Tierra. Los husos horarios dividen el globo en 24 franjas de 15° de longitud cada una, correspondiendo cada franja a una hora de diferencia. En la práctica, los límites políticos deforman esta geometría ideal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué proyección cartográfica es la más adecuada para cada uso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del objetivo: Mercator es ideal para navegación marítima y aérea porque conserva los ángulos de rumbo. Robinson y Winkel Trípel ofrecen un buen compromiso visual para mapas de referencia general. Las proyecciones equivalentes (Peters, Mollweide) son preferibles cuando se comparan áreas de países o regiones. La proyección azimutal es útil para mostrar rutas polares o la visión desde un polo.',
      },
    },
  ],
};
