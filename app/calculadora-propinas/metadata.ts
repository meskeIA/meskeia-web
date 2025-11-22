import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Propinas - Calcula la propina perfecta | meskeIA',
  description:
    '¿Cuánto dejar de propina en un restaurante? Calculadora automática con diferentes porcentajes (5%, 10%, 15%). Divide la cuenta entre personas fácilmente.',
  keywords: [
    'calculadora propinas',
    'calcular propina',
    'porcentaje propina',
    'propina camarero',
    'tip calculator',
    'propinas español',
  ],
  authors: [{ name: 'meskeIA' }],
  openGraph: {
    type: 'website',
    title: 'Calculadora de Propinas - meskeIA',
    description:
      'Calcula propinas automáticamente con diferentes porcentajes. Gratis, sin registro, 100% offline.',
    url: 'https://meskeia.com/calculadora-propinas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Propinas - meskeIA',
    description: 'Calcula propinas automáticamente. Sin publicidad, funciona offline.',
  },
  alternates: {
    canonical: 'https://meskeia.com/calculadora-propinas/',
  },
};

// Schema.org JSON-LD
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora de Propinas',
  description:
    'Calculadora online para calcular propinas automáticamente con diferentes porcentajes',
  url: 'https://meskeia.com/calculadora-propinas/',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'Web Browser',
  inLanguage: 'es-ES',
  author: {
    '@type': 'Organization',
    name: 'meskeIA',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  featureList: [
    'Cálculo automático de propinas',
    'Múltiples porcentajes predefinidos',
    'Funciona 100% offline',
    'Sin registros ni publicidad',
  ],
};
