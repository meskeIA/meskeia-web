import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Tiempo de Lectura - Estima Minutos de Lectura | meskeIA',
  description: 'Calcula el tiempo de lectura y escucha de tus textos. Estadísticas de estructura, densidad y recomendaciones por tipo de contenido.',
  keywords: 'tiempo lectura, reading time, minutos lectura, palabras por minuto, ppm, blog, articulo, contenido',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Tiempo de Lectura',
    description: 'Estima cuánto tardarán tus lectores en consumir tu contenido',
    url: 'https://meskeia.com/calculadora-tiempo-lectura/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Tiempo de Lectura',
    description: 'Calcula minutos de lectura y escucha de tus textos',
  },
};
