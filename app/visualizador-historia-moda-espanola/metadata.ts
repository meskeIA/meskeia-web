import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Moda Española | De los Reyes Católicos a Inditex | meskeIA',
  description: 'Cronología interactiva de 600 años de moda española: de la indumentaria de los Reyes Católicos a Balenciaga en París, la Movida madrileña, Zara e Inditex y el lujo contemporáneo de Loewe. 13 períodos con diseñadores, tendencias e impacto cultural.',
  keywords: [
    'historia moda española cronología',
    'Balenciaga rey moda París costura española',
    'Inditex Zara fast fashion modelo negocio',
    'Loewe lujo español Jonathan Anderson',
    'Agatha Ruiz de la Prada Movida madrileña moda',
    'Cristóbal Balenciaga Getaria País Vasco historia',
    'Adolfo Domínguez arruga bella moda gallega',
    'Felipe II negro moda española Europa siglo XVI',
  ],
  openGraph: {
    title: 'Historia de la Moda Española | meskeIA',
    description: 'De los Reyes Católicos a Inditex: 600 años de moda española en 13 períodos interactivos.',
    url: 'https://meskeia.com/visualizador-historia-moda-espanola',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de la Moda Española',
  description: 'Cronología interactiva de 600 años de moda española desde los Reyes Católicos hasta hoy.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
