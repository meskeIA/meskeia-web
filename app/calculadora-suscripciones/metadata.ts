import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Suscripciones - Control de Gastos Recurrentes | meskeIA',
  description: 'Controla todas tus suscripciones (Netflix, Spotify, gym...). Calcula el gasto mensual y anual total. Detecta suscripciones olvidadas y optimiza tu presupuesto.',
  keywords: 'suscripciones, netflix, spotify, hbo, gym, gastos recurrentes, control gastos, presupuesto, mensual, anual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Suscripciones - meskeIA',
    description: 'Controla todas tus suscripciones y descubre cuánto gastas realmente al mes y al año',
    url: 'https://meskeia.com/calculadora-suscripciones/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Suscripciones - meskeIA',
    description: 'Controla todas tus suscripciones y optimiza tu presupuesto',
    images: ['https://meskeia.com/og-image.png']
  },
};
