import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
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
    url: 'https://meskeia.com/informacion-tiempo/',
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
    title: 'Información del Tiempo - meskeIA',
    description: 'Pronóstico meteorológico para cualquier ciudad del mundo.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Información del Tiempo - Pronóstico Meteorológico",
  description: "Consulta el tiempo actual y pronóstico de 5 días para cualquier ciudad del mundo. Temperatura, humedad, viento y más. Gratis y sin registro.",
  url: 'https://meskeia.com/informacion-tiempo/',
  category: 'UtilityApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
