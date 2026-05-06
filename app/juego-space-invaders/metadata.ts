import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Juego Space Invaders - Arcade Clásico en Español | meskeIA',
  description: 'Juega al clásico Space Invaders online gratis. Defiende la Tierra de la invasión alienígena. Juego arcade retro con controles de teclado y récords.',
  keywords: 'space invaders, juego, arcade, clasico, retro, aliens, invasores, disparos, gratis, online, español',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Juego Space Invaders - Arcade Clásico | meskeIA',
    description: 'Juega al clásico Space Invaders online gratis. Defiende la Tierra de los invasores.',
    url: 'https://meskeia.com/juego-space-invaders/',
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
    title: 'Juego Space Invaders - Arcade Clásico | meskeIA',
    description: 'Juega al clásico Space Invaders online gratis. Defiende la Tierra.',
    images: ['https://meskeia.com/og-image.png']
  },
};
