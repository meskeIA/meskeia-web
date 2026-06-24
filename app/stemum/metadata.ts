import { Metadata } from 'next';

const URL_CANONICA = 'https://stemum.com/';

export const metadata: Metadata = {
  title: 'Stemum — Visualizadores y simuladores interactivos de ciencia | meskeIA',
  description:
    'Stemum reúne visualizadores y simuladores interactivos de ciencia: física, matemáticas, química, computación y biología. Toca, ajusta y descubre cómo funciona el mundo. En español, sin registro y sin coste.',
  keywords:
    'stemum, simuladores interactivos, visualizadores ciencia, física interactiva, matemáticas visuales, simulador química, algoritmos animados, STEM en español, ciencia interactiva, aprender ciencia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Stemum — Visualizadores y simuladores interactivos de ciencia',
    description:
      'Física, matemáticas, química, computación y biología para experimentar. Toca, ajusta y descubre cómo funciona el mundo.',
    url: URL_CANONICA,
    siteName: 'Stemum',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stemum — Ciencia interactiva',
    description:
      'Visualizadores y simuladores interactivos de ciencia. En español, sin registro, sin coste.',
  },
  other: {
    'application-name': 'Stemum',
  },
  alternates: {
    canonical: URL_CANONICA,
  },
  icons: {
    icon: [
      { url: '/stemum/favicon.svg', type: 'image/svg+xml' },
      { url: '/stemum/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/stemum/app-icon-180.png',
  },
};

// JSON-LD a nivel de sitio: Organización Stemum (editor meskeIA).
// Se inyecta en el layout compartido, por lo que aplica a toda la subweb /stemum.
export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Stemum',
  url: URL_CANONICA,
  description:
    'Plataforma de visualizadores y simuladores interactivos de ciencia: física, matemáticas, química, computación y biología. Parte de meskeIA.',
  logo: 'https://stemum.com/stemum/app-icon-512.png',
  parentOrganization: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com/',
  },
};
