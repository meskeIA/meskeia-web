import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora TIR y VAN Gratis | Análisis de Inversiones - meskeIA',
  description:
    'Calcula la Tasa Interna de Retorno (TIR) y Valor Actual Neto (VAN) de tus inversiones. Incluye análisis de sensibilidad y comparativa de escenarios. 100% gratis.',
  keywords: [
    'calculadora TIR',
    'VAN',
    'valor actual neto',
    'tasa interna retorno',
    'análisis inversiones',
    'flujos caja',
    'rentabilidad inversión',
    'método Newton-Raphson',
    'análisis sensibilidad',
    'meskeIA',
  ],
  authors: [{ name: 'meskeIA' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Calculadora TIR y VAN Gratis | Análisis de Inversiones - meskeIA',
    description:
      'Calcula TIR y VAN de tus inversiones con análisis de sensibilidad. Herramienta gratuita para evaluar proyectos de inversión.',
    type: 'website',
    url: 'https://meskeia.com/tir-van/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora TIR y VAN Gratis - meskeIA',
    description:
      'Calcula la rentabilidad de tus inversiones con TIR y VAN. Análisis completo gratuito.',
  },
};

// JSON-LD para Schema.org
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora TIR y VAN',
  description:
    'Calculadora de Tasa Interna de Retorno (TIR) y Valor Actual Neto (VAN) para análisis de proyectos de inversión mediante método Newton-Raphson.',
  url: 'https://meskeia.com/tir-van',
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
    'Cálculo automático de Tasa Interna de Retorno mediante método Newton-Raphson',
    'Cálculo de Valor Actual Neto con tasa de descuento personalizable',
    'Generación de flujos de caja proyectados con múltiples períodos',
    'Análisis de sensibilidad para variación de parámetros de inversión',
    'Tabla de comparativa de escenarios entre múltiples proyectos',
    'Cálculo del Índice de Rentabilidad y Período de Recuperación',
  ],
};
