import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Danza | Cronología Interactiva | meskeIA',
  description: 'Cronología interactiva de la danza con 14 períodos desde la danza ritual egipcia (-3000 a.C.) hasta el breaking olímpico y la danza digital. 5.000 años de movimiento humano.',
  keywords: ['historia danza', 'ballet clásico', 'danza moderna', 'hip-hop dance', 'Pina Bausch', 'breakdance', 'cronología'],
  openGraph: {
    title: 'Historia de la Danza | meskeIA',
    description: 'De los rituales egipcios al breaking olímpico: 5.000 años de danza en una cronología interactiva.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-historia-danza/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-historia-danza/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Historia de la Danza',
  description: 'Herramienta educativa sobre historia de la danza y sus períodos artísticos',
  url: 'https://meskeia.com/visualizador-historia-danza/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
