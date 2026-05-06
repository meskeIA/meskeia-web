import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora Estadística Online - Media, Mediana, Desviación | meskeIA',
  description: 'Calcula media, mediana, moda, varianza, desviación estándar y más. Análisis estadístico completo de conjuntos de datos con gráficos.',
  keywords: 'estadística, media, mediana, moda, varianza, desviación estándar, cuartiles, percentiles, datos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Estadística | meskeIA',
    description: 'Análisis estadístico completo: media, mediana, varianza, desviación y más.',
    url: 'https://meskeia.com/calculadora-estadistica/',
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
    title: 'Calculadora Estadística | meskeIA',
    description: 'Herramienta de análisis estadístico descriptivo online.',
    images: ['https://meskeia.com/og-image.png']
  },
};
