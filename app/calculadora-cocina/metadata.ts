import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Cocina: Recetas, Tiempos y Conversor | meskeIA',
  description: 'Calculadora de cocina online: convierte unidades (tazas, gramos, ml), escala recetas, consulta tiempos de cocción y encuentra sustitutos de ingredientes. Gratis y sin registro.',
  keywords: 'calculadora cocina, conversor unidades cocina, tazas a gramos, escalador recetas, tiempos coccion, sustitutos ingredientes, medidas cocina, recetas, conversion, temperatura horno',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-cocina/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Cocina - Conversor y Escalador de Recetas',
    description: 'Convierte unidades de cocina, escala recetas, consulta tiempos de cocción y encuentra sustitutos de ingredientes.',
    url: 'https://meskeia.com/calculadora-cocina',
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
    title: 'Calculadora de Cocina | meskeIA',
    description: 'Conversor de unidades, escalador de recetas, tiempos de cocción y sustitutos',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora de Cocina meskeIA',
  },
};
