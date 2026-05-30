import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estratificación Social | meskeIA',
  description: 'Visualiza modelos de clases sociales, coeficiente Gini, movilidad social intergeneracional y teorías de Marx, Weber y Bourdieu.',
  keywords: ['estratificación social', 'clases sociales', 'coeficiente Gini', 'movilidad social', 'desigualdad', 'sociología'],
  openGraph: {
    title: 'Estratificación Social — meskeIA',
    description: 'Clases sociales, desigualdad (Gini) y movilidad social intergeneracional visualizados.',
    url: 'https://meskeia.com/visualizador-estratificacion-social/',
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
  name: 'Visualizador de Estratificación Social',
  description: 'Herramienta educativa sobre clases sociales, desigualdad y movilidad social',
  url: 'https://meskeia.com/visualizador-estratificacion-social/',
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
      name: '¿Qué es la estratificación social?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La estratificación social es la división de una sociedad en grupos o capas jerárquicas (estratos) según criterios como la riqueza, el poder, el prestigio o el origen. Cada estrato comparte condiciones de vida similares y tiene acceso diferenciado a recursos y oportunidades. Las principales formas históricas son los sistemas de castas, estamentos y clases sociales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo explican Marx, Weber y Bourdieu las clases sociales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Marx identificó dos clases fundamentales según la propiedad de los medios de producción: burguesía y proletariado. Weber amplió el análisis con tres dimensiones: clase económica, estatus social y poder político. Bourdieu introdujo el concepto de capital cultural y social, mostrando que la posición en la jerarquía no depende solo del dinero sino también de la educación, los contactos y los hábitos culturales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué mide el coeficiente de Gini?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coeficiente de Gini mide la desigualdad en la distribución de ingresos de un país en una escala de 0 a 1 (o 0 a 100). Un valor de 0 indica igualdad perfecta (todos tienen lo mismo) y 1 indica desigualdad máxima (una sola persona lo tiene todo). Los países nórdicos como Suecia o Dinamarca tienen valores cercanos a 0,28, mientras que algunos países latinoamericanos superan 0,50.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la movilidad social intergeneracional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La movilidad social intergeneracional mide en qué medida los hijos alcanzan una posición socioeconómica diferente a la de sus padres. Una alta movilidad indica que el origen familiar no determina el destino personal. Investigaciones de Raj Chetty y otros economistas muestran que países como Dinamarca tienen movilidad ascendente mucho mayor que Estados Unidos, donde el efecto del origen persiste más a lo largo de las generaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este visualizador de estratificación social?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para estudiantes de sociología, economía, ciencias políticas y bachillerato que necesitan comprender la estructura de clases y la desigualdad. También sirve a profesores que buscan materiales visuales para explicar teorías de Marx, Weber o Bourdieu, y a cualquier persona que quiera entender cómo se organiza la jerarquía social y qué factores determinan la movilidad entre estratos.',
      },
    },
  ],
};
