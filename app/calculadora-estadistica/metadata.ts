import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Estadística Online - Media, Mediana, Desviación | meskeIA',
  description: 'Calcula media, mediana, moda, varianza, desviación estándar y más. Análisis estadístico completo de conjuntos de datos con gráficos.',
  keywords: 'estadística, media, mediana, moda, varianza, desviación estándar, cuartiles, percentiles, datos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-estadistica/',
  },
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

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora Estadística',
  description: 'Calculadora estadística online para análisis descriptivo: media, mediana, moda, varianza, desviación estándar, cuartiles y percentiles. Visualización gráfica de los datos.',
  url: 'https://meskeia.com/calculadora-estadistica/',
  category: 'EducationalApplication',
  features: [
    'Estadísticos descriptivos: media, mediana, moda',
    'Medidas de dispersión: varianza, desviación estándar, rango',
    'Cuartiles, deciles y percentiles',
    'Gráfico de distribución de datos',
    'Detección de valores atípicos (outliers)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['estadística', 'media mediana moda', 'desviación estándar', 'análisis datos', 'estudiantes'],
});
