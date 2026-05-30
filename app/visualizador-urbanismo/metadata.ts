import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Urbanismo y Planificación Urbana | meskeIA',
  description: 'Explora modelos urbanos (Burgess, Hoyt, Harris-Ullman), densidad de ciudades del mundo, movilidad sostenible e indicadores de ciudad sostenible.',
  keywords: ['urbanismo', 'planificación urbana', 'densidad urbana', 'movilidad sostenible', 'ciudad sostenible', 'modelos urbanos'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Urbanismo y Planificación Urbana — meskeIA',
    description: 'Modelos de ciudad, densidad urbana, movilidad y sostenibilidad en una herramienta visual.',
    url: 'https://meskeia.com/visualizador-urbanismo/',
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
  twitter: {
    card: 'summary_large_image',
    title: 'Urbanismo y Planificación Urbana',
    description: 'Modelos urbanos, densidad de ciudades del mundo, movilidad y sostenibilidad. Herramienta visual educativa.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Urbanismo',
  description: 'Herramienta educativa sobre urbanismo, modelos urbanos y planificación de ciudades',
  url: 'https://meskeia.com/visualizador-urbanismo/',
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
      name: '¿Qué es el urbanismo y qué estudia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El urbanismo es la disciplina que estudia la organización, planificación y diseño de los espacios urbanos. Analiza cómo se distribuyen las funciones dentro de una ciudad (vivienda, comercio, industria, zonas verdes) y cómo estas decisiones afectan a la calidad de vida de sus habitantes. También aborda la movilidad, la densidad de población y la sostenibilidad ambiental.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los principales modelos de estructura urbana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tres modelos clásicos son: el modelo de zonas concéntricas de Burgess (1925), que describe la ciudad como anillos de usos del suelo desde el centro hacia la periferia; el modelo de sectores de Hoyt (1939), basado en ejes radiales influidos por el transporte; y el modelo de núcleos múltiples de Harris y Ullman (1945), que reconoce varios centros funcionales dentro de una misma ciudad. Cada modelo refleja una época y un tipo de ciudad diferente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la densidad urbana y por qué importa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La densidad urbana mide el número de habitantes por kilómetro cuadrado en una zona urbana. Ciudades como Manila (71.000 hab/km²) o Dhaka (44.000 hab/km²) son extremadamente densas, mientras que Los Ángeles (3.100 hab/km²) es comparativamente dispersa. Una alta densidad puede mejorar la eficiencia del transporte público y reducir emisiones, pero también genera presión sobre la vivienda e infraestructuras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué indicadores definen una ciudad sostenible?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una ciudad sostenible se evalúa con indicadores como las emisiones de CO₂ per cápita, el porcentaje de viajes en transporte público o bicicleta, los metros cuadrados de zona verde por habitante (la OMS recomienda ≥9 m²), la gestión de residuos y el acceso al agua potable. Ciudades como Copenhague o Ámsterdam son referentes mundiales por integrar movilidad sostenible con planificación urbana compacta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un visualizador de urbanismo en educación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un visualizador de urbanismo permite comparar modelos teóricos con datos reales de ciudades del mundo, facilitando la comprensión de conceptos abstractos como la zonificación o la movilidad sostenible. Es útil para estudiantes de geografía, arquitectura, ciencias sociales y bachillerato, así como para cualquier persona interesada en entender cómo se organizan las ciudades y qué políticas urbanas mejoran la calidad de vida.',
      },
    },
  ],
};
