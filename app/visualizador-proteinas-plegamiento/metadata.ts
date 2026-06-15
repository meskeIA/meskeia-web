import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Plegamiento de Proteínas: Estructura y Enfermedades — meskeIA',
  description: 'Visualizador del plegamiento proteínico. 4 niveles de estructura (1°/2°/3°/4°), funnel energético, 6 tipos funcionales y enfermedades de mal plegamiento: Alzheimer, Parkinson, priones, fibrosis quística.',
  keywords: ['plegamiento proteínas', 'estructura proteína primaria secundaria terciaria', 'funnel energético proteína', 'enfermedades priones', 'Alzheimer beta-amiloide', 'alfa-sinucleína Parkinson', 'chaperonas moleculares HSP70', 'fibrosis quística CFTR'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Plegamiento de Proteínas: Estructura y Enfermedades — meskeIA',
    description: '4 niveles de estructura, funnel de plegamiento y enfermedades por mal plegamiento.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-proteinas-plegamiento/',
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
    title: 'Plegamiento de Proteínas: Estructura y Enfermedades',
    description: 'Del gen a la estructura 3D: 4 niveles, funnel energético y enfermedades de mal plegamiento.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Plegamiento de Proteínas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Plegamiento de Proteínas: Estructura y Enfermedades',
  description: 'Visualizador interactivo del plegamiento proteínico. Estructura primaria, secundaria, terciaria y cuaternaria. Funnel energético de plegamiento. 6 tipos funcionales de proteínas. Enfermedades de mal plegamiento: Alzheimer, Parkinson, priones y fibrosis quística.',
  url: 'https://meskeia.com/visualizador-proteinas-plegamiento/',
  category: 'EducationalApplication',
  features: [
    'Los 4 niveles de estructura proteínica con SVG interactivo',
    'Funnel energético del plegamiento (paradoja de Levinthal)',
    '6 tipos funcionales de proteínas con ejemplos reales',
    'Enfermedades por mal plegamiento: Alzheimer, Parkinson, priones, fibrosis quística',
    'Chaperonas moleculares y proteínas de shock térmico',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el plegamiento de proteínas y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El plegamiento de proteínas es el proceso por el que una cadena lineal de aminoácidos adquiere su forma tridimensional específica, que determina su función biológica. Una proteína mal plegada pierde su función y puede agregarse formando estructuras tóxicas. El proceso ocurre en milisegundos y está guiado por interacciones químicas entre los aminoácidos y el entorno acuoso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los 4 niveles de estructura de una proteína?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La estructura primaria es la secuencia de aminoácidos. La secundaria son los patrones locales repetidos: hélices alfa y láminas beta estabilizadas por puentes de hidrógeno. La terciaria es el plegamiento global de la cadena en 3D mediante interacciones hidrofóbicas, puentes disulfuro y otras fuerzas. La cuaternaria aparece cuando varias cadenas se ensamblan, como en la hemoglobina (4 subunidades).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué enfermedades están causadas por el mal plegamiento de proteínas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El mal plegamiento causa enfermedades graves: en el Alzheimer, la proteína beta-amiloide forma placas tóxicas en el cerebro; en el Parkinson, la alfa-sinucleína se agrega en los cuerpos de Lewy. Las enfermedades priónicas (Creutzfeldt-Jakob) son causadas por priones que inducen el mal plegamiento de proteínas sanas. La fibrosis quística resulta del mal plegamiento de la proteína CFTR, que impide su función como canal de cloruro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las chaperonas moleculares y qué hacen en el plegamiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las chaperonas moleculares son proteínas especializadas (como HSP70 y HSP90) que asisten el plegamiento correcto de otras proteínas, evitando que se agreguen de forma incorrecta. Se expresan en mayor cantidad bajo estrés celular (fiebre, toxinas). No determinan la forma final de la proteína, sino que crean las condiciones para que se alcance su estado de mínima energía correctamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la paradoja de Levinthal y qué explica sobre el plegamiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La paradoja de Levinthal señala que si una proteína explorase aleatoriamente todas sus posibles conformaciones tardaría más que la edad del universo en plegarse, pero en la realidad lo hace en microsegundos. Esto implica que el plegamiento no es aleatorio, sino que sigue un funnel energético: rutas guiadas hacia el estado de mínima energía libre, descartando rápidamente configuraciones desfavorables.',
      },
    },
  ],
};
