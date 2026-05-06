import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Constelaciones del Cielo - Guía de 32 Constelaciones Famosas | meskeIA',
  description: 'Explora las 32 constelaciones más famosas del cielo: zodiacales, boreales y australes. Estrellas principales, mitología griega, mejor época de observación y curiosidades.',
  keywords: 'constelaciones, astronomía, zodíaco, estrellas, Orión, Osa Mayor, Cruz del Sur, mitología griega, cielo nocturno, observación astronómica',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Constelaciones del Cielo - Guía de 32 Constelaciones Famosas',
    description: 'Explora las 32 constelaciones más famosas: zodiacales, boreales y australes. Estrellas, mitología y curiosidades.',
    url: 'https://meskeia.com/constelaciones-del-cielo',
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
    title: 'Constelaciones del Cielo - Guía Astronómica',
    description: 'Explora las 32 constelaciones más famosas del cielo nocturno.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Constelaciones del Cielo meskeIA',
  },
};
