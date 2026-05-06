import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimador TIR y VAN - Análisis de Inversiones | meskeIA',
  description: 'Calcula la Tasa Interna de Retorno (TIR) y el Valor Actual Neto (VAN) de tus proyectos de inversión. Herramienta gratuita para análisis financiero.',
  keywords: 'calculadora TIR, calculadora VAN, tasa interna retorno, valor actual neto, análisis inversiones, rentabilidad proyecto, flujos caja',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador TIR y VAN | meskeIA',
    description: 'Evalúa la rentabilidad de tus proyectos de inversión con TIR y VAN.',
    url: 'https://meskeia.com/estimador-tir-van/',
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
    title: 'Estimador TIR y VAN | meskeIA',
    description: 'Analiza la rentabilidad de tus inversiones con TIR y VAN.',
    images: ['https://meskeia.com/og-image.png']
  },
};
