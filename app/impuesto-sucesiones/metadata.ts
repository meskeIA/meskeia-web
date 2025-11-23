import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora Impuesto de Sucesiones Cataluña 2025 - Cálculo Gratuito | meskeIA',
  description:
    '¿Cuánto pagas por una herencia en Cataluña? Calcula el Impuesto de Sucesiones 2025 con reducciones por vivienda habitual, discapacidad y parentesco.',
  keywords: [
    'impuesto sucesiones cataluña',
    'calculadora herencias',
    'agència tributària catalunya',
    'reducciones fiscales',
    'bonificaciones herencia',
    'vivienda habitual',
    'cónyuge',
    'descendientes',
    'grupo parentesco',
    'discapacidad',
    'ajuar doméstico',
    'patrimonio preexistente',
    'meskeIA',
  ],
  authors: [{ name: 'meskeIA' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Calculadora Impuesto de Sucesiones Cataluña 2025',
    description:
      'Herramienta gratuita para calcular el Impuesto de Sucesiones en Cataluña con todas las reducciones y bonificaciones vigentes en 2025.',
    type: 'website',
    url: 'https://meskeia.com/impuesto-sucesiones/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora Impuesto Sucesiones Cataluña',
    description: 'Calcula el impuesto de herencias en Cataluña con reducciones y bonificaciones vigentes.',
  },
};

// JSON-LD para Schema.org
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora Impuesto de Sucesiones Cataluña',
  description:
    'Calculadora gratuita del Impuesto de Sucesiones en Cataluña 2025. Calcula reducciones, bonificaciones y el impuesto total según la normativa vigente de la Agència Tributària de Catalunya.',
  url: 'https://meskeia.com/impuesto-sucesiones',
  author: {
    '@type': 'Organization',
    name: 'meskeIA',
  },
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  featureList: [
    'Cálculo completo del Impuesto de Sucesiones en Cataluña',
    'Reducciones por vivienda habitual hasta 500.000 €',
    'Bonificaciones por parentesco (Grupos I y II: bonificación 99%)',
    'Reducciones por discapacidad (65.000 € o 200.000 €)',
    'Ajuar doméstico (3% del caudal hereditario)',
    'Aplicación de coeficientes multiplicadores por patrimonio preexistente',
    'Normativa Cataluña actualizada 2025',
  ],
};

// FAQ JSON-LD
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la reducción por vivienda habitual en Cataluña?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los herederos de Grupos I y II (cónyuge, descendientes, ascendientes) pueden aplicar una reducción del 95% del valor de la vivienda habitual del fallecido, con un límite de 500.000 €. Requisitos: mantener la vivienda durante 5 años y que haya sido residencia habitual del causante durante los últimos 2 años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las bonificaciones por parentesco en Cataluña?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Grupo I (descendientes <21 años): 95% si la base imponible individual es ≤100.000€, 99% si >100.000€. Grupo II (descendientes ≥21, cónyuge, ascendientes): 95% si la base imponible individual es ≤100.000€, 99% si >100.000€. Grupos III y IV: sin bonificación autonómica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el ajuar doméstico en el Impuesto de Sucesiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ajuar doméstico se calcula automáticamente como el 3% del valor del caudal hereditario (bienes del fallecido menos deudas y gastos). Representa el valor de los bienes muebles, enseres y ropas de uso del fallecido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la tarifa del Impuesto de Sucesiones en Cataluña?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tarifa progresiva: 7% (hasta 100.000 €), 11% (100.000-200.000 €), 17% (200.000-400.000 €), 24% (400.000-800.000 €), 32% (más de 800.000 €). Luego se aplican coeficientes multiplicadores según patrimonio preexistente.',
      },
    },
  ],
};

// Breadcrumb JSON-LD
export const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'meskeIA',
      item: 'https://meskeia.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Finanzas y Fiscalidad',
      item: 'https://meskeia.com/#finanzas-fiscalidad',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Calculadora Impuesto Sucesiones Cataluña',
      item: 'https://meskeia.com/impuesto-sucesiones',
    },
  ],
};
