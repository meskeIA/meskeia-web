import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de MRU y MRUA - Cinemática (Caída Libre, Tiro Parabólico)',
  description: 'Resuelve problemas de cinemática paso a paso: MRU (movimiento uniforme), MRUA (uniformemente acelerado), caída libre y tiro parabólico. Con fórmulas y ejemplos.',
  keywords: 'cinemática, física, MRU, MRUA, caída libre, tiro parabólico, velocidad, aceleración, distancia, tiempo, movimiento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de MRU y MRUA - Cinemática Paso a Paso',
    description: 'MRU, MRUA, caída libre y tiro parabólico. Resuelve velocidad, aceleración, distancia y tiempo con fórmulas y ejemplos.',
    url: 'https://meskeia.com/calculadora-movimiento/',
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
    title: 'Calculadora de MRU y MRUA - Cinemática',
    description: 'Caída libre, tiro parabólico, velocidad y aceleración. Fórmulas y ejemplos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Movimiento - Cinemática MRU, MRUA, Caída Libre",
  description: "Calculadora de cinemática con MRU, MRUA, caída libre y tiro parabólico. Calcula velocidad, aceleración, distancia y tiempo con fórmulas y ejemplos prácticos.",
  url: 'https://meskeia.com/calculadora-movimiento/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
