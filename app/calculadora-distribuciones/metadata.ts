import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Distribuciones de Probabilidad | meskeIA',
  description: 'Calcula probabilidades con distribuciones Normal, Poisson, Exponencial, Uniforme, Gamma y Beta. Funciones PDF, CDF y cuantiles con visualización.',
  keywords: 'distribución normal, distribución poisson, distribución exponencial, gaussiana, probabilidad, estadística, PDF, CDF, cuantiles, función densidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Distribuciones de Probabilidad | meskeIA',
    description: 'Calcula probabilidades con distribuciones Normal, Poisson, Exponencial, Uniforme, Gamma y Beta. Con visualización de PDF y CDF.',
    url: 'https://meskeia.com/calculadora-distribuciones',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Distribuciones de Probabilidad',
    description: 'Normal, Poisson, Exponencial, Uniforme, Gamma y Beta con PDF, CDF y cuantiles.',
  },
};
