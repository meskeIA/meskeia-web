import { Metadata } from 'next';

const URL_CANONICA = 'https://coquinum.com/';

export const metadata: Metadata = {
  title: 'Coquinum — Cocina y gastronomía: calculadoras y herramientas | meskeIA',
  description:
    'Coquinum reúne las herramientas de cocina técnica de meskeIA: calculadoras de panadería y repostería, conversor y escalado de recetas, guías de ingredientes y bebidas, y herramientas de cocción y conservación. En español, sin registro y sin coste.',
  keywords:
    'coquinum, cocina técnica, calculadora panadería, porcentaje del panadero, hidratación masa, escalador de recetas, conversor de cocina, guía de ingredientes, maridaje, gastronomía en español',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Coquinum — Cocina y gastronomía con precisión',
    description:
      'Calculadoras y herramientas de cocina técnica: panadería y repostería, recetas y medidas, cocción y conservación, ingredientes y bebidas. Mide, convierte y cocina con precisión.',
    url: URL_CANONICA,
    siteName: 'Coquinum',
    locale: 'es_ES',
    images: [
      {
        // Servida como estático directo (sin el host-rewrite del proxy).
        url: 'https://meskeia.com/coquinum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coquinum — Cocina y gastronomía',
    description:
      'Herramientas de cocina técnica en español. Panadería, cocción, conversiones y food cost. Sin registro, sin coste.',
    images: ['https://meskeia.com/coquinum/og-image.png'],
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
    'Portal de cocina y gastronomía con herramientas de cocina técnica: panadería y repostería, recetas y medidas, cocción y conservación, ingredientes y bebidas. Parte de meskeIA.',
  logo: 'https://coquinum.com/coquinum/app-icon-512.png',
  parentOrganization: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com/',
  },
};
