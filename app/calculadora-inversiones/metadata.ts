import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Calculadora de Inversiones Online Gratis | Asset Allocation y Análisis de Carteras - meskeIA',
  description:
    '¿Cómo diversificar tu cartera de inversión? Calculadora de asset allocation con análisis de riesgo y rentabilidad esperada. Perfecta para planificar tu estrategia financiera.',
  keywords: [
    'calculadora inversiones',
    'asset allocation',
    'cartera inversión',
    'diversificación',
    'análisis riesgo',
    'Sharpe ratio',
    'finanzas personales',
    'simulador financiero',
  ],
  authors: [{ name: 'meskeIA' }],
  openGraph: {
    type: 'website',
    title: 'Calculadora de Inversiones Online | Asset Allocation - meskeIA',
    description:
      'Herramienta gratuita para diseñar carteras de inversión. Analiza riesgo, rentabilidad y diversificación. Educación financiera profesional.',
    url: 'https://meskeia.com/calculadora-inversiones/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Inversiones | Asset Allocation Gratis',
    description:
      'Diseña tu cartera ideal con nuestra calculadora de inversiones gratuita. Análisis profesional de riesgo y rentabilidad.',
    creator: '@meskeIA',
  },
  alternates: {
    canonical: 'https://meskeia.com/calculadora-inversiones/',
  },
};

// Schema.org JSON-LD
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora de Inversiones - Asset Allocation',
  description:
    'Herramienta educativa gratuita para diseñar carteras de inversión, analizar riesgo y calcular rentabilidad esperada',
  url: 'https://meskeia.com/calculadora-inversiones/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  creator: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
  featureList: [
    'Asset allocation personalizado',
    'Análisis de riesgo (volatilidad)',
    'Cálculo de ratio Sharpe',
    'Simulación de crecimiento',
    'Perfiles de inversión',
    'Rebalanceo de cartera',
    'Generación de reportes PDF',
  ],
};
