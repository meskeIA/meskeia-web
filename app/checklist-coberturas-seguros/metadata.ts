import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checklist de Coberturas de Seguros por Perfil | meskeIA',
  description: 'Descubre qué seguros necesitas según tu perfil: autónomo, familia, jubilado, propietario o inquilino. Coberturas obligatorias vs recomendables en España.',
  keywords: 'checklist seguros, coberturas recomendadas, seguros obligatorios España, seguros familia, seguros autónomo, seguros jubilado, qué seguros contratar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist de Coberturas de Seguros por Perfil | meskeIA',
    description: 'Descubre qué seguros necesitas según tu perfil. Guía de coberturas obligatorias y recomendables en España.',
    url: 'https://meskeia.com/checklist-coberturas-seguros/',
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
    title: 'Checklist de Coberturas de Seguros - meskeIA',
    description: 'Descubre qué seguros necesitas según tu perfil personal y familiar.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/checklist-coberturas-seguros/',
  },
};
