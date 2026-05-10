import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prueba de Cámara Web Online - Test Webcam Gratis | meskeIA',
  description: 'Prueba tu cámara web antes de videollamadas. Verifica resolución, brillo, contraste y toma fotos. Sin registro ni instalación. Totalmente privado.',
  keywords: 'prueba camara, test webcam, probar camara web, verificar camara, videollamada, zoom, meet, teams, camara ordenador, webcam test',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Prueba de Cámara Web Online - Test Webcam Gratis',
    description: 'Verifica tu cámara web antes de videollamadas. Test completo con captura de fotos.',
    url: 'https://meskeia.com/prueba-camara/',
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
    title: 'Prueba de Cámara Web Online',
    description: 'Test de webcam gratis antes de tus videollamadas',
    images: ['https://meskeia.com/og-image.png']
  },
};
