import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Banca | De los Medici al Bitcoin y el Fintech | meskeIA',
  description: 'Cronología interactiva de 600 años de historia bancaria: del Banco de los Medici (1397) al Banco de España, el Crash del 29, Bretton Woods, la crisis de 2008 y el fintech, las criptomonedas y el euro digital. 13 períodos con instituciones, innovaciones y crisis financieras clave.',
  keywords: ['historia banca cronología finanzas', 'Banco Medici Florencia 1397 banca renacentista', 'Banco de España Santander BBVA historia', 'Crash 1929 Gran Depresión crisis bancaria', 'Bretton Woods FMI Banco Mundial dólar reserva', 'Lehman Brothers 2008 crisis financiera subprime', 'Bitcoin criptomoneda fintech blockchain historia', 'euro digital CBDC Open Banking PSD2 Bizum'],
  openGraph: {
    title: 'Historia de la Banca | meskeIA',
    description: 'De los Medici al Bitcoin: 600 años de historia bancaria en 13 períodos interactivos.',
    url: 'https://meskeia.com/visualizador-historia-banca',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de la Banca',
  description: 'Cronología interactiva de 600 años de historia bancaria desde los Medici hasta las criptomonedas.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
