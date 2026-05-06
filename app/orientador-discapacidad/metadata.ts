import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orientador Grado de Discapacidad — ¿Vale la Pena Solicitarlo? | meskeIA',
  description: 'Descubre si tu situación funcional podría justificar solicitar el reconocimiento del grado de discapacidad en España. Test orientativo basado en el RD 888/2022. Gratuito y sin registro.',
  keywords: 'grado discapacidad, solicitar discapacidad España, certificado discapacidad, reconocimiento discapacidad, baremo discapacidad, 33% discapacidad, pensión no contributiva, tarjeta estacionamiento discapacidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Grado de Discapacidad | meskeIA',
    description: 'Test orientativo para saber si vale la pena solicitar el reconocimiento de discapacidad en España. Basado en criterios funcionales del RD 888/2022.',
    url: 'https://meskeia.com/orientador-discapacidad/',
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
    title: 'Orientador Grado de Discapacidad | meskeIA',
    description: '¿Vale la pena solicitar el reconocimiento de discapacidad? Test orientativo gratuito basado en criterios del RD 888/2022.',
    images: ['https://meskeia.com/og-image.png']
  },
};
