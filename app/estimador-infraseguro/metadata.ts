import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimador de Infraseguro - Regla Proporcional | meskeIA',
  description: 'Calcula cuánto cobrarás en caso de siniestro si tienes infraseguro. Aplica la regla proporcional según la Ley de Contrato de Seguro (art. 30).',
  keywords: 'infraseguro, regla proporcional, seguro hogar, indemnización siniestro, capital asegurado, valor real, ley contrato seguro, artículo 30',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Infraseguro - Regla Proporcional | meskeIA',
    description: 'Calcula cuánto cobrarás en caso de siniestro si tu capital asegurado es inferior al valor real.',
    url: 'https://meskeia.com/estimador-infraseguro/',
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
    title: 'Estimador de Infraseguro - meskeIA',
    description: 'Calcula la indemnización real aplicando la regla proporcional del infraseguro.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/estimador-infraseguro/',
  },
};
