import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia del Teatro | Cronología Interactiva | meskeIA',
  description: 'Cronología interactiva del teatro con 14 períodos desde el teatro griego (534 a.C.) hasta el teatro digital e inmersivo. De Esquilo a Punchdrunk: 2.500 años de escena.',
  keywords: ['historia teatro', 'teatro griego', 'Shakespeare', 'Brecht', 'teatro del absurdo', 'teatro inmersivo', 'Beckett', 'cronología'],
  openGraph: {
    title: 'Historia del Teatro | meskeIA',
    description: 'Del teatro griego al teatro inmersivo: 2.500 años de escena en una cronología interactiva.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-historia-teatro/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-historia-teatro/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Historia del Teatro',
  description: 'Herramienta educativa sobre historia del teatro y sus períodos desde la Antigua Grecia hasta el teatro digital',
  url: 'https://meskeia.com/visualizador-historia-teatro/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
