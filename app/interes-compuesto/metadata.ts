import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Calculadora de Interés Compuesto Online Gratis - El 8º Milagro | meskeIA',
  description:
    '¿Cuánto crecerán tus ahorros en 10 años? Calcula el interés compuesto con gráficos y tabla anual. Descubre el "octavo milagro del mundo" de las inversiones.',
  keywords: [
    'calculadora interés compuesto',
    'octavo milagro del mundo',
    'crecimiento exponencial',
    'inversiones',
    'ahorro',
    'finanzas personales',
    'rentabilidad',
    'capitalización',
    'ROI',
    'valor futuro',
  ],
  authors: [{ name: 'meskeIA' }],
  openGraph: {
    type: 'website',
    title:
      'Calculadora de Interés Compuesto Online Gratis - El 8º Milagro | meskeIA',
    description:
      'Calculadora de interés compuesto gratuita online. Descubre el poder del "octavo milagro del mundo" con cálculos precisos y visualizaciones interactivas.',
    url: 'https://meskeia.com/interes-compuesto/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Calculadora de Interés Compuesto Online | meskeIA',
    description:
      'Calculadora gratuita de interés compuesto. Visualiza el crecimiento exponencial de tus inversiones.',
    creator: '@meskeIA',
  },
  alternates: {
    canonical: 'https://meskeia.com/interes-compuesto/',
  },
};

// Schema.org JSON-LD
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora de Interés Compuesto',
  applicationCategory: 'FinanceApplication',
  description:
    'Calculadora online gratuita de interés compuesto. Descubre el poder del "octavo milagro del mundo" con cálculos precisos, gráficos evolutivos, tabla detallada año por año y generación de reportes PDF.',
  url: 'https://meskeia.com/interes-compuesto/',
  author: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
  operatingSystem: 'Web',
  permissions: 'No requiere permisos',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  featureList: [
    'Cálculo de interés compuesto con diferentes frecuencias de capitalización',
    'Visualización gráfica de evolución de inversiones',
    'Tabla detallada año por año',
    'Generación de reportes PDF',
    'Insights inteligentes sobre crecimiento',
    'Presets de rentabilidad conservador, moderado y agresivo',
    'Cálculo automático en tiempo real',
    'Análisis de ROI y valor futuro',
  ],
  mainEntity: {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué es el interés compuesto?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El interés compuesto es el "octavo milagro del mundo" según Einstein. Es el interés que se genera sobre el capital inicial más los intereses acumulados, creando un efecto exponencial de crecimiento que se acelera con el tiempo.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo funciona la calculadora de interés compuesto?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Introduce tu capital inicial, aportación mensual, rentabilidad anual esperada, período de inversión y frecuencia de capitalización. La calculadora proyectará tu crecimiento con gráficos y tablas detalladas.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué frecuencias de capitalización están disponibles?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Puedes elegir entre capitalización anual, trimestral, mensual y diaria. Mayor frecuencia de capitalización genera ligeramente más rendimientos debido al efecto compuesto más frecuente.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Puedo descargar los resultados?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, la calculadora genera reportes detallados en PDF con todos los parámetros, resultados y tabla de evolución anual. También puedes compartir los resultados fácilmente.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Son realistas las proyecciones de rentabilidad?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Los presets están basados en promedios históricos: conservador (3%), moderado (7%), agresivo (10%). Las proyecciones son estimativas y los rendimientos pasados no garantizan resultados futuros.',
        },
      },
    ],
  },
};
