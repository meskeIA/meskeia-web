import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Lentes Ópticas: Trazado de Rayos | meskeIA',
  description: 'Visualiza el trazado de rayos a través de lentes convergentes y divergentes. Mueve el objeto y mira cómo cambian la imagen, su tamaño y si es real o virtual.',
  keywords: 'lentes ópticas, lente convergente, lente divergente, trazado de rayos, imagen real, imagen virtual, distancia focal, aumento, óptica geométrica, EBAU, Bachillerato, física',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-lentes-opticas/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Lentes Ópticas | meskeIA',
    description: 'Trazado de rayos en lentes convergentes y divergentes. Mueve el objeto y observa la imagen formada en tiempo real.',
    url: 'https://meskeia.com/simulador-lentes-opticas/',
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
    title: 'Simulador de Lentes Ópticas | meskeIA',
    description: 'Visualiza imágenes reales y virtuales con trazado de rayos en lentes delgadas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Lentes Ópticas',
  description: 'Simulador interactivo de óptica geométrica para lentes delgadas convergentes y divergentes. Visualiza los tres rayos principales (paralelo→F2, centro sin desviar, F1→paralelo) atravesando la lente y formando la imagen del objeto. Permite ajustar la distancia focal f, la distancia objeto s, la altura del objeto h y el tipo de lente. Calcula automáticamente la distancia imagen, el aumento y clasifica la imagen (real/virtual, derecha/invertida, mayor/menor). Ideal para EBAU de Física, Bachillerato y primero de universidad.',
  url: 'https://meskeia.com/simulador-lentes-opticas/',
  category: 'EducationalApplication',
  features: [
    'Trazado en directo de los 3 rayos principales',
    'Lentes convergentes y divergentes',
    'Imagen formada (real o virtual) calculada y dibujada',
    'Sliders interactivos de distancia focal, distancia objeto y altura',
    'Cálculo automático de aumento y clasificación de la imagen',
    'Aplicación de la ecuación de Gauss (1/s + 1/s\' = 1/f)',
    'Funciona 100% en el navegador, gratuito y en español',
    'Ideal para EBAU, Bachillerato y óptica universitaria',
  ],
  keywords: ['lentes ópticas', 'trazado de rayos', 'óptica', 'imagen real', 'imagen virtual', 'EBAU', 'Bachillerato', 'física'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una lente convergente y una divergente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una lente convergente (convexa) tiene distancia focal positiva y hace que los rayos paralelos se concentren en su foco posterior, formando imágenes reales cuando el objeto está más allá del foco. Una lente divergente (cóncava) tiene distancia focal negativa y hace que los rayos se separen como si proviniesen de un foco virtual situado delante de la lente; siempre forma imágenes virtuales, derechas y más pequeñas que el objeto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la ecuación de Gauss y cómo se aplica a las lentes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ecuación de Gauss para lentes delgadas es 1/s + 1/s\' = 1/f, donde s es la distancia del objeto a la lente, s\' es la distancia de la imagen a la lente y f es la distancia focal. Si s\' resulta positiva, la imagen es real (se forma al otro lado de la lente); si es negativa, la imagen es virtual (se forma en el mismo lado que el objeto). El simulador aplica esta ecuación en tiempo real al mover los controles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se forma una imagen real y cuándo una virtual en una lente convergente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una lente convergente, si el objeto está más allá del foco (s > f), la imagen es real, invertida y se forma al otro lado de la lente. Si el objeto está entre el foco y la lente (s < f), los rayos refractados divergen y la imagen resultante es virtual, derecha y ampliada —como ocurre con una lupa—. Cuando el objeto está exactamente en el foco (s = f), los rayos salen paralelos y no forman imagen.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el trazado de los tres rayos principales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El método de los tres rayos principales permite localizar gráficamente la imagen sin cálculos: el rayo paralelo al eje que tras la lente pasa por el foco posterior; el rayo que pasa por el centro óptico sin desviarse; y el rayo que pasa por el foco anterior y sale paralelo al eje. La intersección de los dos primeros (o sus prolongaciones, para imágenes virtuales) determina la posición y tamaño de la imagen.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué asignaturas se estudia la óptica geométrica de lentes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La óptica geométrica con lentes delgadas forma parte del currículo de Física de 2.º de Bachillerato y es contenido frecuente en la EBAU. También aparece en Física General universitaria y en asignaturas de Instrumentación Óptica o Fotónica. La ecuación de Gauss y el trazado de rayos son las herramientas básicas tanto para resolver problemas de examen como para entender el funcionamiento de cámaras, microscopios y telescopios.',
      },
    },
  ],
};
