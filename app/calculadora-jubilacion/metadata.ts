import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Jubilación Gratis - Planifica tu Pensión | meskeIA',
  description:
    '¿Cuánto necesitas ahorrar para jubilarte? Calcula tu pensión futura y capital necesario con diferentes escenarios de rentabilidad. Planifica tu jubilación de forma profesional.',
  keywords: [
    'calculadora jubilación',
    'pensión futura',
    'ahorro jubilación',
    'planificación financiera',
    'capital jubilación',
    'calculadora pensión',
    'ahorro pensión',
    'planificar jubilación',
    'finanzas personales',
    'calculadora financiera',
  ],
  authors: [{ name: 'meskeIA' }],
  openGraph: {
    type: 'website',
    title: 'Calculadora de Jubilación Gratis - Planifica tu Pensión | meskeIA',
    description:
      'Calculadora de jubilación gratuita online. Calcula tu pensión futura y planifica tu ahorro con diferentes escenarios de rentabilidad.',
    url: 'https://meskeia.com/calculadora-jubilacion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Calculadora de Jubilación Gratis | meskeIA',
    description:
      'Calculadora de jubilación online. Calcula tu pensión futura y planifica tu ahorro para la jubilación.',
  },
  alternates: {
    canonical: 'https://meskeia.com/calculadora-jubilacion/',
  },
};

// Schema.org JSON-LD
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora de Jubilación',
  applicationCategory: 'FinanceApplication',
  description:
    'Calculadora de jubilación online gratuita para planificar tu pensión futura. Calcula el capital necesario, pensión mensual estimada y visualiza la evolución de tu ahorro con diferentes escenarios de rentabilidad.',
  url: 'https://meskeia.com/calculadora-jubilacion/',
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
    'Cálculo de pensión futura',
    'Planificación de ahorro para jubilación',
    'Escenarios de rentabilidad conservador, moderado y agresivo',
    'Visualización gráfica de evolución del capital',
    'Cálculo de pensión mensual equivalente',
    'Proyección de capital total acumulado',
    'Planificación financiera personalizada',
    'Análisis de períodos de ahorro',
  ],
  mainEntity: {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cómo funciona la calculadora de jubilación?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La calculadora utiliza fórmulas de valor futuro con aportaciones periódicas. Introduce tu edad actual, edad de jubilación deseada, capital inicial, aportación mensual y rentabilidad esperada para obtener proyecciones de tu pensión futura.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué escenarios de rentabilidad puedo usar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ofrecemos tres escenarios predefinidos: Conservador (3% anual), Moderado (5% anual) y Agresivo (7% anual), además de la opción de introducir una rentabilidad personalizada según tu estrategia de inversión.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Son fiables las proyecciones de la calculadora?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Las proyecciones son estimaciones basadas en cálculos matemáticos. Los rendimientos pasados no garantizan resultados futuros. Es importante consultar con un asesor financiero para decisiones importantes de inversión.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Es gratuita la calculadora de jubilación?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Completamente gratuita. No requiere registro ni instalación. Todos los cálculos se realizan localmente en tu navegador garantizando privacidad total de tu información financiera.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué información necesito para calcular mi jubilación?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Necesitas: edad actual, edad de jubilación deseada, capital inicial disponible, aportación mensual que puedes realizar y la rentabilidad anual esperada de tus inversiones.',
        },
      },
    ],
  },
};
