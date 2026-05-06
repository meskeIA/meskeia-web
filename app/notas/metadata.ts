import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notas - Guarda tus Ideas y Apuntes | meskeIA',
  description: 'Guarda tus notas, ideas y apuntes organizados por categorías. Escribe o pega texto con guardado automático local. Gratis y sin registro.',
  keywords: 'notas, apuntes, ideas, guardar notas, notas online, bloc notas, organizar notas, categorias, texto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Notas - Guarda tus Ideas y Apuntes | meskeIA',
    description: 'Guarda tus notas organizadas por categorías con guardado automático.',
    url: 'https://meskeia.com/notas',
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
    title: 'Notas - meskeIA',
    description: 'Notas y apuntes organizados por categorías.',
    images: ['https://meskeia.com/og-image.png']
  },
};
