import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Prensa | De Gutenberg al Periodismo Digital e IA | meskeIA',
  description: 'Cronología interactiva de 575 años de historia de la prensa: de Gutenberg (1450) a la imprenta de tipos móviles, la prensa penny, el periodismo amarillo, la radio, la televisión, internet y la IA en las redacciones. 14 períodos con hitos, datos y contexto histórico en 6 eras.',
  keywords: ['historia prensa periodismo cronología', 'Gutenberg imprenta tipos móviles', 'prensa penny democratización', 'periodismo amarillo Hearst Pulitzer', 'BBC radio periodismo', 'Watergate investigación', 'periodismo digital internet', 'IA inteligencia artificial periodismo', 'historia medios comunicación España', 'Gaceta de Madrid primer periódico'],
  openGraph: {
    title: 'Historia de la Prensa | meskeIA',
    description: 'De Gutenberg al periodismo digital con IA: 575 años de historia de la prensa en 14 períodos interactivos.',
    url: 'https://meskeia.com/visualizador-historia-prensa',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de la Prensa',
  description: 'Cronología interactiva de la historia de la prensa con 14 períodos históricos desde Gutenberg (1450) hasta el periodismo con IA (2026).',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
