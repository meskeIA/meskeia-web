import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora Impuesto de Donaciones Cataluña 2025 - Cálculo Gratuito | meskeIA',
  description:
    '¿Cuánto pagas por el Impuesto de Donaciones en Cataluña? Calcula reducciones por primera vivienda y discapacidad con normativa 2025 actualizada.',
  keywords: [
    'impuesto donaciones cataluña',
    'calculadora donaciones',
    'agència tributària catalunya',
    'primera vivienda',
    'reducciones fiscales',
    'donación padres hijos',
    'bonificaciones',
    'meskeIA',
  ],
  authors: [{ name: 'meskeIA' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Calculadora Impuesto de Donaciones Cataluña 2025',
    description:
      'Herramienta gratuita para calcular el Impuesto de Donaciones en Cataluña con todas las reducciones vigentes en 2025.',
    type: 'website',
    url: 'https://meskeia.com/impuesto-donaciones/',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Calculadora Impuesto Donaciones Cataluña',
    description:
      'Calcula el impuesto de donaciones en Cataluña con reducciones por primera vivienda y discapacidad.',
  },
};

// JSON-LD para Schema.org
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora Impuesto de Donaciones Cataluña',
  applicationCategory: 'FinanceApplication',
  description:
    'Calculadora gratuita del Impuesto de Donaciones en Cataluña 2025. Calcula reducciones por primera vivienda y discapacidad según la normativa vigente de la Agència Tributària de Catalunya.',
  url: 'https://meskeia.com/impuesto-donaciones',
  author: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  featureList: [
    'Cálculo completo del Impuesto de Donaciones',
    'Reducciones por primera vivienda habitual',
    'Bonificaciones por parentesco',
    'Reducciones por discapacidad',
    'Normativa Cataluña 2025',
    'Acumulación de donaciones anteriores',
    'Tarifas general y reducida',
  ],
};

// FAQ JSON-LD
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la reducción por primera vivienda en Cataluña?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La reducción por primera vivienda habitual es del 95% sobre el valor donado, con un límite de 60.000€ para menores de 36 años sin discapacidad, o 120.000€ para personas con discapacidad ≥65%. Requiere formalización en escritura pública e ingresos máximos de 36.000€.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tarifas se aplican al Impuesto de Donaciones en Cataluña?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Existen dos tarifas: la general (del 7% al 32%) y la reducida (del 5% al 9%) que se aplica a grupos I y II (hijos, cónyuge, padres) cuando la donación se formaliza en escritura pública.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se acumulan las donaciones anteriores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, las donaciones del mismo donante al mismo donatario en los últimos 3 años se acumulan para calcular el tipo impositivo medio aplicable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué grupos de parentesco existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Grupo I: descendientes menores de 21 años. Grupo II: hijos de 21+, cónyuge, pareja estable, padres. Grupo III: hermanos, tíos, sobrinos. Grupo IV: primos y extraños. Cada grupo tiene coeficientes multiplicadores diferentes.',
      },
    },
  ],
};

// BreadcrumbList JSON-LD
export const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Inicio',
      item: 'https://meskeia.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Herramientas',
      item: 'https://meskeia.com/herramientas',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Impuesto Donaciones Cataluña',
      item: 'https://meskeia.com/impuesto-donaciones',
    },
  ],
};
