import { Metadata } from 'next';

const URL_CANONICA = 'https://coquinum.com/';

export const metadata: Metadata = {
  title: 'Coquinum — Cocina y gastronomía: calculadoras y herramientas | meskeIA',
  description:
    'Coquinum reúne las herramientas de cocina técnica de meskeIA: calculadoras de panadería y repostería, cocción y temperatura, conversiones (tazas a gramos, altitud), bebidas, conservación y food cost. En español, sin registro y sin coste.',
  keywords:
    'coquinum, cocina técnica, calculadora panadería, porcentaje del panadero, hidratación masa, conversor tazas gramos, temperatura cocción, sous-vide, food cost, escandallo, gastronomía en español',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Coquinum — Cocina y gastronomía con precisión',
    description:
      'Calculadoras y herramientas de cocina técnica: panadería, repostería, cocción, conversiones, bebidas y food cost. Mide, convierte y cocina con precisión.',
    url: URL_CANONICA,
    siteName: 'Coquinum',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coquinum — Cocina y gastronomía',
    description:
      'Herramientas de cocina técnica en español. Panadería, cocción, conversiones y food cost. Sin registro, sin coste.',
  },
  other: {
    'application-name': 'Coquinum',
  },
  alternates: {
    canonical: URL_CANONICA,
  },
  icons: {
    icon: [
      { url: '/coquinum/favicon.svg', type: 'image/svg+xml' },
      { url: '/coquinum/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/coquinum/app-icon-180.png',
  },
};

// JSON-LD a nivel de sitio: Organización Coquinum (editor meskeIA).
// Se inyecta en el layout compartido, por lo que aplica a toda la subweb /coquinum.
export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Coquinum',
  url: URL_CANONICA,
  description:
    'Portal de cocina y gastronomía con herramientas de cocina técnica: panadería, repostería, cocción, conversiones, bebidas, conservación y food cost. Parte de meskeIA.',
  logo: 'https://coquinum.com/coquinum/app-icon-512.png',
  parentOrganization: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com/',
  },
};
