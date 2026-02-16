import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '[Nombre App] - [Descripción Corta] | meskeIA',
  description: '[Descripción detallada 150-160 caracteres]',
  keywords: 'keyword1, keyword2, keyword3',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '[Título OG]',
    description: '[Descripción para redes sociales]',
    url: 'https://meskeia.com/[nombre-app]',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: '[Título para Twitter]',
    description: '[Descripción para Twitter]',
  },
  other: {
    'application-name': 'Nombre App meskeIA',
  },
};
