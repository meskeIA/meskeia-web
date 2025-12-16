import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luxómetro Online - Mide la Intensidad de Luz | meskeIA',
  description: 'Mide la intensidad de luz en lux con tu dispositivo. Ideal para fotógrafos: incluye recomendaciones de ISO, apertura y velocidad según la iluminación.',
  keywords: 'luxometro, fotometro, medir luz, intensidad luminosa, lux, fotografia, exposicion, iso, apertura, velocidad obturacion, iluminacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Luxómetro Online - Mide la Intensidad de Luz',
    description: 'Mide la luz ambiente con tu dispositivo. Recomendaciones fotográficas incluidas.',
    url: 'https://meskeia.com/luxometro',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luxómetro Online - meskeIA',
    description: 'Mide la intensidad de luz y obtén recomendaciones para fotografía.',
  },
  other: {
    'application-name': 'Luxómetro meskeIA',
  },
};
