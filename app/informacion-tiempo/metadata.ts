import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Información del Tiempo - Pronóstico Meteorológico | meskeIA',
  description: 'Consulta el tiempo actual y pronóstico de 5 días para cualquier ciudad del mundo. Temperatura, humedad, viento y más. Gratis y sin registro.',
  keywords: 'tiempo, clima, meteorologia, pronostico, temperatura, humedad, viento, lluvia, tiempo hoy, prevision',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Información del Tiempo - Pronóstico Meteorológico | meskeIA',
    description: 'Consulta el tiempo actual y pronóstico para cualquier ciudad del mundo.',
    url: 'https://meskeia.com/informacion-tiempo',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Información del Tiempo - meskeIA',
    description: 'Pronóstico meteorológico para cualquier ciudad del mundo.',
  },
};
