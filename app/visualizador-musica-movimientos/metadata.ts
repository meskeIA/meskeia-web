import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Movimientos Musicales — Cronología Interactiva | meskeIA',
  description: 'Explora 14 movimientos musicales desde el Canto Gregoriano hasta la música electrónica. Línea del tiempo interactiva con compositores, obras icónicas y contexto histórico.',
  keywords: ['historia música', 'movimientos musicales', 'cronología música', 'barroco musical', 'romanticismo', 'jazz', 'música electrónica', 'clasicismo'],
  openGraph: {
    title: 'Movimientos Musicales — Cronología Interactiva',
    description: 'Del canto gregoriano al techno: 14 períodos musicales con compositores, obras icónicas y contexto histórico.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-musica-movimientos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-musica-movimientos/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Movimientos Musicales',
  description: 'Herramienta educativa sobre historia de la música y movimientos musicales',
  url: 'https://meskeia.com/visualizador-musica-movimientos/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
