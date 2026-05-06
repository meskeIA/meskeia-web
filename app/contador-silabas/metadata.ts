import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contador de Sílabas - Separa y Cuenta Sílabas en Español | meskeIA',
  description: 'Cuenta y separa las sílabas de cualquier palabra o texto en español. Herramienta útil para poesía, ortografía y aprendizaje del idioma.',
  keywords: 'contador sílabas, separar sílabas, silabeador español, división silábica, sílabas online, poesía, métrica',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/contador-silabas/',
  },
  openGraph: {
    type: 'website',
    title: 'Contador de Sílabas en Español - meskeIA',
    description: 'Cuenta y separa las sílabas de cualquier texto en español',
    url: 'https://meskeia.com/contador-silabas',
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
    title: 'Contador de Sílabas en Español - meskeIA',
    description: 'Cuenta y separa las sílabas de cualquier texto en español',
    images: ['https://meskeia.com/og-image.png']
  },
};
