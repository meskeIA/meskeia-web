import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Topología: Superficies, Nudos y Homeomorfismos | meskeIA',
  description: 'Explora topología interactivamente: superficies (esfera, toro, banda de Möbius, botella de Klein), homeomorfismos, genus, nudos y la característica de Euler. La geometría que estudia propiedades invariantes bajo deformación.',
  keywords: 'topología, superficies topológicas, toro, banda de Möbius, botella de Klein, homeomorfismo, genus, característica de Euler, nudos topológicos, matemáticas, geometría',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Topología: Superficies y Homeomorfismos',
    description: '¿Por qué una taza de café y un donut son lo mismo para las matemáticas? Explora topología: superficies, genus, nudos y la característica de Euler.',
    url: 'https://meskeia.com/visualizador-topologia/',
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
    title: 'Topología',
    description: 'La geometría que estudia propiedades invariantes bajo deformación continua. Superficies, nudos y homeomorfismos interactivos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Topología meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Topología: Superficies, Nudos y Homeomorfismos',
  description: 'Visualizador interactivo de topología: galería de superficies (esfera, toro, doble toro, banda de Möbius, botella de Klein), clasificación por genus, nudos topológicos y tabla de propiedades con la característica de Euler.',
  url: 'https://meskeia.com/visualizador-topologia/',
  features: [
    'Galería de superficies topológicas con SVG y propiedades',
    'Clasificación por genus (0 a 3) con visualización progresiva',
    'Nudos topológicos: trivial, trébol y figura-8',
    'Tabla comparativa con característica de Euler χ = V − E + F',
    'Equivalencia taza-donut explicada paso a paso',
  ],
  category: 'EducationalApplication',
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué estudia la topología?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La topología es la rama de las matemáticas que estudia las propiedades de los objetos que se conservan bajo deformaciones continuas (estirar, doblar, comprimir) sin cortar ni pegar. A diferencia de la geometría, no le importan las distancias ni los ángulos, sino la conectividad y la estructura global de las superficies y espacios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué una taza de café y un donut son topológicamente equivalentes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tanto la taza como el donut tienen exactamente un agujero que los atraviesa: el asa de la taza y el hueco central del donut. En topología, dos objetos son homeomorfos si uno puede transformarse en el otro mediante deformación continua sin cortar ni pegar. Al tener el mismo número de agujeros (genus = 1), ambos pertenecen a la misma clase topológica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la banda de Möbius y qué la hace especial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La banda de Möbius es una superficie que se construye tomando una tira de papel, dándole media vuelta y pegando los extremos. Su propiedad más sorprendente es que tiene una sola cara y un solo borde, lo que la convierte en una superficie no orientable. Si recorres su superficie sin levantar el dedo, regresarás al punto de partida habiendo cubierto ambos "lados".',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la característica de Euler y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La característica de Euler χ (chi) es un invariante topológico que se calcula con la fórmula χ = V − E + F, donde V son vértices, E aristas y F caras de una triangulación de la superficie. Para una esfera χ = 2; para un toro χ = 0; para una superficie de genus g vale χ = 2 − 2g. Este número permite clasificar superficies orientables sin importar cómo estén deformadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la topología en aplicaciones prácticas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La topología tiene aplicaciones en física teórica (topología de cuerdas, aislantes topológicos), análisis de datos (topological data analysis, TDA), robótica (planificación de movimiento), redes de comunicaciones y biología molecular (estudio de proteínas y ADN). La teoría de nudos, una rama de la topología, se usa para entender cómo el ADN se anuda y desanuda durante la replicación celular.',
      },
    },
  ],
};
