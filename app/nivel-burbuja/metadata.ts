import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nivel de Burbuja Digital + Inclinómetro - Mide ángulos con tu móvil | meskeIA',
  description: 'Nivel de burbuja digital gratuito con inclinómetro. Mide inclinaciones y ángulos con el sensor de tu móvil. Ideal para bricolaje, colgar cuadros y medir pendientes.',
  keywords: 'nivel burbuja, inclinómetro, nivel digital, medir ángulos, nivel construcción, spirit level, clinómetro, pendiente, bricolaje',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Nivel de Burbuja Digital + Inclinómetro - meskeIA',
    description: 'Mide inclinaciones y ángulos con el sensor de tu móvil. Herramienta gratuita para bricolaje.',
    url: 'https://meskeia.com/nivel-burbuja/',
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
    title: 'Nivel de Burbuja Digital - meskeIA',
    description: 'Nivel digital con inclinómetro. Gratis y sin instalación.',
    images: ['https://meskeia.com/og-image.png']
  },
};
