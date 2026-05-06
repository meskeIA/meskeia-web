import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Revoluciones Industriales | Cronología Visual | meskeIA',
  description: 'Visualiza las revoluciones industriales: de la máquina de vapor a la IA y la Industria 4.0. Cronología interactiva de fases, inventos y transformaciones económicas.',
  keywords: ['revoluciones industriales', 'industria 4.0', 'máquina de vapor', 'fordismo', 'automatización', 'IA industrial', 'cronología economía'],
  openGraph: {
    title: 'Revoluciones Industriales | Cronología Visual | meskeIA',
    description: 'Visualiza las revoluciones industriales: de la máquina de vapor a la IA y la Industria 4.0.',
    url: 'https://meskeia.com/visualizador-revoluciones-industriales/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-revoluciones-industriales/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Revoluciones Industriales — Cronología Visual',
  description: 'Cronología interactiva de las revoluciones industriales: de la manufactura preindustrial a la IA y la Industria 4.0.',
  url: 'https://meskeia.com/visualizador-revoluciones-industriales/',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Any',
  inLanguage: 'es',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
