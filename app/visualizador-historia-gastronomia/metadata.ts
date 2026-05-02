import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Gastronomía | Cronología Interactiva | meskeIA',
  description: 'Cronología interactiva de la gastronomía con 14 períodos desde la revolución neolítica (-10000 a.C.) hasta la IA culinaria y las proteínas del futuro. De Apicio a Ferran Adrià.',
  keywords: ['historia gastronomía', 'cocina molecular', 'Ferran Adrià', 'El Bulli', 'intercambio colombino', 'slow food', 'gastronomía sostenible', 'cronología'],
  openGraph: {
    title: 'Historia de la Gastronomía | meskeIA',
    description: 'Del fuego neolítico a la IA culinaria: 12.000 años de gastronomía en una cronología interactiva.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-historia-gastronomia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-historia-gastronomia/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Historia de la Gastronomía',
  description: 'Herramienta educativa sobre historia de la gastronomía y evolución culinaria',
  url: 'https://meskeia.com/visualizador-historia-gastronomia/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
