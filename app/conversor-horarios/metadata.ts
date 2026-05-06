import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversor de Horarios Mundial - Zonas Horarias | meskeIA',
  description: 'Convierte horarios entre diferentes zonas horarias del mundo. Compara la hora actual en múltiples ciudades. Herramienta gratuita y sin registro.',
  keywords: 'conversor horarios, zonas horarias, hora mundial, time zone converter, diferencia horaria, hora ciudades, GMT, UTC, reloj mundial',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Horarios Mundial',
    description: 'Convierte horarios entre zonas horarias. Compara la hora en diferentes ciudades.',
    url: 'https://meskeia.com/conversor-horarios',
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
    title: 'Conversor de Horarios | meskeIA',
    description: 'Convierte horarios entre zonas horarias del mundo',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Conversor de Horarios meskeIA',
  },
};
