import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulador de Hipoteca Online Gratis - Sistema Francés | meskeIA',
  description:
    '¿Cuánto pagarás mensualmente por tu hipoteca? Calcula cuotas, intereses totales y tabla de amortización con el sistema francés. Genera PDF gratis.',
  keywords: [
    'simulador hipoteca',
    'calculadora préstamos',
    'sistema francés',
    'amortización',
    'cuotas mensuales',
    'intereses',
    'finanzas personales',
    'hipoteca vivienda',
    'tabla amortización',
    'calculadora financiera',
    'préstamo inmobiliario',
  ],
  authors: [{ name: 'meskeIA' }],
  openGraph: {
    type: 'website',
    title: 'Simulador de Hipoteca Online Gratis - Sistema Francés | meskeIA',
    description:
      'Simulador de hipoteca gratuito con sistema francés. Calcula cuotas, intereses y tabla de amortización completa con visualizaciones interactivas.',
    url: 'https://meskeia.com/simulador-hipoteca/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Simulador de Hipoteca Online Gratis | meskeIA',
    description:
      'Simulador de hipoteca gratuito con sistema francés. Calcula cuotas, intereses y tabla de amortización completa.',
  },
  alternates: {
    canonical: 'https://meskeia.com/simulador-hipoteca/',
  },
};

// Schema.org JSON-LD
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Simulador de Hipoteca',
  applicationCategory: 'FinanceApplication',
  description:
    'Simulador de hipoteca online gratuito con sistema francés. Calcula cuotas mensuales, intereses totales, tabla de amortización completa y genera reportes en PDF.',
  url: 'https://meskeia.com/simulador-hipoteca/',
  author: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
  operatingSystem: 'Web',
  permissions: 'No requiere permisos',
  price: '0',
  priceCurrency: 'EUR',
  featureList: [
    'Cálculo de cuotas mensuales con sistema francés',
    'Tabla de amortización completa mes a mes',
    'Gráficos de evolución de la hipoteca',
    'Cálculo de intereses totales',
    'Generación de reportes PDF descargables',
    'Visualización interactiva de datos',
    'Sistema francés de amortización (cuotas constantes)',
    'Cálculos financieros precisos y profesionales',
    'Funciona 100% offline (PWA)',
    'Sin registros, sin publicidad, totalmente gratis',
  ],
  mainEntity: {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cómo funciona el simulador de hipoteca?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El simulador utiliza el sistema francés de amortización para calcular cuotas mensuales constantes. Introduce el importe, duración en años y tipo de interés anual para obtener cálculos precisos de tu hipoteca.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué es el sistema francés de amortización?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El sistema francés es el método más común en España. Calcula cuotas mensuales constantes donde inicialmente se pagan más intereses y menos capital, equilibrándose progresivamente hasta el final del préstamo.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Puedo descargar los resultados de la simulación?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, el simulador genera reportes en PDF con todos los detalles: parámetros de la hipoteca, resumen de resultados y tabla de amortización completa para los primeros 24 meses.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Es gratuito el simulador de hipoteca?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Completamente gratuito. No requiere registro ni instalación. Todos los cálculos se realizan localmente en tu navegador garantizando total privacidad de tus datos financieros.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué información necesito para simular mi hipoteca?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Solo necesitas tres datos: el importe total de la hipoteca, la duración en años y el tipo de interés anual (TIN). El simulador calculará automáticamente cuotas, intereses totales y tabla de amortización.',
        },
      },
    ],
  },
};
