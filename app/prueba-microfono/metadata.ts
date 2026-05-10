import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prueba de Micrófono Online - Test Audio Gratis | meskeIA',
  description: 'Prueba tu micrófono antes de videollamadas. Visualiza niveles de audio, graba tu voz y reproduce. Sin registro ni instalación. 100% privado.',
  keywords: 'prueba microfono, test microfono, probar micro, verificar audio, videollamada, zoom, meet, teams, micrófono ordenador, audio test, grabar voz',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Prueba de Micrófono Online - Test Audio Gratis',
    description: 'Verifica tu micrófono antes de videollamadas. Visualización de audio y grabación.',
    url: 'https://meskeia.com/prueba-microfono/',
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
    title: 'Prueba de Micrófono Online',
    description: 'Test de micrófono gratis antes de tus videollamadas',
    images: ['https://meskeia.com/og-image.png']
  },
};
