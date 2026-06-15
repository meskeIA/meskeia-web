import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona una Elección - Ley D\'Hondt y Sistemas Electorales | meskeIA',
  description: 'Entiende cómo se reparten los escaños en España: ley D\'Hondt paso a paso, sistemas proporcional vs mayoritario, el efecto de las circunscripciones. Explicador visual interactivo.',
  keywords: 'sistema electoral, ley dhondt, elecciones españa, proporcional, mayoritario, circunscripciones, escaños, congreso diputados, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona una Elección — Sistemas Electorales Explicados',
    description: 'Ley D\'Hondt, sistemas proporcional y mayoritario, circunscripciones: cómo los votos se convierten en escaños.',
    url: 'https://meskeia.com/visualizador-sistema-electoral/',
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
    title: 'Cómo Funciona una Elección — Sistemas Electorales Explicados',
    description: 'Ley D\'Hondt paso a paso, sistemas electorales comparados y el efecto de las circunscripciones en España.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sistema Electoral meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona una Elección',
  description: 'Explicador visual interactivo sobre sistemas electorales: cómo se emiten los votos, la ley D\'Hondt paso a paso, comparación entre sistemas proporcional, mayoritario y mixto, y el efecto de las circunscripciones en España.',
  url: 'https://meskeia.com/visualizador-sistema-electoral/',
  features: [
    'Ley D\'Hondt explicada paso a paso con ejemplo real',
    'Comparación visual: proporcional vs mayoritario vs mixto',
    'Mismo resultado de votos, distintos repartos de escaños',
    'Mapa de circunscripciones y el "bonus rural"',
    'Comparativa de sistemas electorales: cuándo favorecen a partidos grandes o pequeños',
    'Circunscripciones electorales y su efecto en la representatividad por tamaño de provincia',
    'Simulación interactiva con datos reales del sistema electoral español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la ley D\'Hondt y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ley D\'Hondt es un método matemático para convertir votos en escaños de forma proporcional. Se dividen los votos de cada partido entre 1, 2, 3... y se asignan los escaños a los cocientes más altos. Este método tiende a favorecer ligeramente a los partidos más votados respecto a los pequeños.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un sistema electoral proporcional y uno mayoritario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un sistema proporcional, los escaños se reparten según el porcentaje de votos de cada partido, lo que favorece la representación de múltiples fuerzas políticas. En un sistema mayoritario, el candidato o partido más votado en cada circunscripción se lleva todos los escaños de esa zona, aunque no haya obtenido mayoría absoluta. España usa un sistema proporcional con circunscripciones provinciales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el mismo porcentaje de votos puede dar distinto número de escaños según la provincia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque cada provincia elige un número diferente de diputados: Madrid elige 37 y Soria solo 2. En circunscripciones pequeñas, la barrera efectiva para entrar es mucho más alta y los partidos medianos o pequeños tienen pocas opciones de conseguir representación. Este efecto se conoce como "bonus rural" o sesgo territorial del sistema.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos escaños tiene el Congreso de los Diputados en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Congreso de los Diputados tiene 350 escaños, elegidos en 52 circunscripciones (una por provincia más Ceuta y Melilla). Cada provincia tiene asignado un mínimo de 2 diputados, y el resto se reparte proporcionalmente según la población.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Existe una barrera mínima de votos para entrar al Congreso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La Ley Orgánica del Régimen Electoral General (LOREG) establece una barrera legal del 3% de los votos válidos emitidos en la circunscripción. Sin embargo, en provincias con pocos escaños la barrera efectiva puede superar el 15-20%, lo que en la práctica excluye a partidos con apoyo disperso territorialmente.',
      },
    },
  ],
};
