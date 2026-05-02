import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia del Deporte | Cronología Interactiva | meskeIA',
  description: 'Cronología interactiva del deporte con 14 períodos desde los Juegos Olímpicos griegos (-776 a.C.) hasta los eSports y la IA deportiva. De Olimpia a los Juegos de París 2024.',
  keywords: ['historia deporte', 'Juegos Olímpicos', 'fútbol historia', 'eSports', 'dopaje historia', 'olimpismo', 'cronología deporte'],
  openGraph: {
    title: 'Historia del Deporte | meskeIA',
    description: 'De los Juegos Olímpicos griegos a los eSports: 2.800 años de deporte en una cronología interactiva.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-historia-deporte/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-historia-deporte/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Historia del Deporte',
  description: 'Herramienta educativa sobre historia del deporte desde los Juegos Olímpicos griegos hasta los eSports',
  url: 'https://meskeia.com/visualizador-historia-deporte/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
