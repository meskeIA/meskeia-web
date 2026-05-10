import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Contador de Palabras - Análisis de Texto Online | meskeIA',
  description: 'Contador de palabras, caracteres, párrafos y frases online. Calcula tiempo de lectura, densidad de palabras clave y estadísticas de texto. Gratis, privado y sin registro.',
  keywords: 'contador palabras, contar caracteres, contador letras, analisis texto, tiempo lectura, densidad palabras, estadisticas texto, word counter, character count',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Contador de Palabras y Caracteres Online',
    description: 'Analiza tu texto: cuenta palabras, caracteres, párrafos. Calcula tiempo de lectura y densidad de palabras clave.',
    url: 'https://meskeia.com/contador-palabras/',
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
    title: 'Contador de Palabras | meskeIA',
    description: 'Cuenta palabras, caracteres, párrafos y tiempo de lectura',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Contador de Palabras meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Contador de Palabras - Análisis de Texto Online",
  description: "Contador de palabras, caracteres, párrafos y frases online. Calcula tiempo de lectura, densidad de palabras clave y estadísticas de texto. Gratis, privado y sin registro.",
  url: 'https://meskeia.com/contador-palabras/',
  category: 'UtilityApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
