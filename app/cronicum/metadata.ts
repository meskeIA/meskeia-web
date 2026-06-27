import { Metadata } from 'next';

const URL_CANONICA = 'https://cronicum.com/';

export const metadata: Metadata = {
  title: 'Cronicum — Historia interactiva de la humanidad | meskeIA',
  description:
    'Cronicum reúne cronologías interactivas de la historia universal: civilizaciones y países del mundo, y la historia de la ciencia, la tecnología, el arte, la economía y la vida cotidiana. Navegable, sin registro y sin coste.',
  keywords:
    'cronicum, historia interactiva, cronología, civilizaciones, historia universal, línea del tiempo, historia de la ciencia, historia del arte, América precolombina, grandes acontecimientos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cronicum — Historia interactiva de la humanidad',
    description:
      'Cronologías interactivas de la historia universal: civilizaciones, países y la historia de las grandes ideas e inventos.',
    url: URL_CANONICA,
    siteName: 'Cronicum',
    locale: 'es_ES',
    images: [
      {
        // Servida como estático directo (sin el host-rewrite del proxy).
        url: 'https://meskeia.com/cronicum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cronicum — el portal de historia interactiva de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cronicum — Historia interactiva de la humanidad',
    description:
      'Cronologías interactivas de la historia universal. Navegable, sin registro, sin coste.',
    images: ['https://meskeia.com/cronicum/og-image.png'],
  },
  other: {
    'application-name': 'Cronicum',
  },
  alternates: {
    canonical: URL_CANONICA,
  },
  icons: {
    icon: [
      { url: '/cronicum/favicon.svg', type: 'image/svg+xml' },
      { url: '/cronicum/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/cronicum/app-icon-180.png',
  },
};

// JSON-LD a nivel de sitio: Organización Cronicum (editor meskeIA).
// Se inyecta en el layout compartido, por lo que aplica a toda la subweb /cronicum.
export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Cronicum',
  url: URL_CANONICA,
  description:
    'Plataforma de historia interactiva: cronologías navegables de civilizaciones, países y la historia de la ciencia, el arte, la economía y la vida cotidiana. Parte de meskeIA.',
  logo: 'https://cronicum.com/cronicum/app-icon-512.png',
  parentOrganization: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com/',
  },
};
