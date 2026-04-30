import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de las Epidemias | meskeIA',
  description: 'Cronología interactiva de las grandes pandemias: Muerte Negra, Gripe Española, COVID-19. Compara mortalidad, patógenos y el legado médico de cada epidemia.',
  keywords: ['historia epidemias', 'pandemias históricas', 'peste negra', 'gripe española', 'COVID-19', 'epidemiología histórica'],
  openGraph: {
    title: 'Historia de las Epidemias — meskeIA',
    description: 'Las grandes pandemias de la historia: cronología, mortalidad y legado médico.',
    url: 'https://meskeia.com/visualizador-historia-epidemias/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Historia de las Epidemias',
  description: 'Cronología interactiva de las grandes pandemias históricas y su impacto',
  url: 'https://meskeia.com/visualizador-historia-epidemias/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
