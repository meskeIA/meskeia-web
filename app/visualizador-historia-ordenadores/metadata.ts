import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de los Ordenadores | De Babbage a la IA Cuántica | meskeIA',
  description: 'Cronología interactiva de 200 años de historia de la informática: de la Difference Engine de Babbage a ENIAC, el IBM PC, Internet, el iPhone y ChatGPT. 14 períodos con inventores, máquinas icónicas y contexto histórico en 6 eras.',
  keywords: ['historia ordenadores cronología', 'ENIAC primer ordenador', 'IBM PC historia informática', 'Alan Turing máquina', 'ChatGPT IA generativa historia', 'Apple Macintosh interfaz gráfica', 'Intel microprocesador historia', 'computación cuántica Google Willow'],
  openGraph: {
    title: 'Historia de los Ordenadores | meskeIA',
    description: 'De Babbage a ChatGPT: 200 años de historia de la informática en 14 períodos interactivos.',
    url: 'https://meskeia.com/visualizador-historia-ordenadores',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de los Ordenadores',
  description: 'Cronología interactiva de la informática con 14 períodos históricos desde 1820 hasta 2025.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
