import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
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
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Distribuciones de Probabilidad',
    description: 'Normal, Poisson, Exponencial, Uniforme, Gamma y Beta con PDF, CDF y cuantiles.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Distribuciones de Probabilidad",
  description: "Calcula probabilidades con distribuciones Normal, Poisson, Exponencial, Uniforme, Gamma y Beta. Funciones PDF, CDF y cuantiles con visualización.",
  url: 'https://meskeia.com/calculadora-distribuciones/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
