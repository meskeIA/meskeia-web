import { Metadata } from 'next';

const URL_CANONICA = 'https://delegum.com/';

export const metadata: Metadata = {
  title: 'Delegum — Plataforma de fiscalidad, derecho laboral y finanzas en España | meskeIA',
  description:
    'Delegum reúne datos fiscales verificados, un asistente de IA (MCP) y calculadoras de fiscalidad, derecho laboral y finanzas para España. Sin registro y sin coste.',
  keywords:
    'delegum, plataforma fiscal, datos fiscales España, ITP por comunidad, IRPF, autónomos, herencias, jubilación, MCP fiscal, calculadoras fiscales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Delegum — Plataforma de fiscalidad, derecho laboral y finanzas en España',
    description:
      'Datos fiscales verificados, asistente de IA y calculadoras de fiscalidad, derecho laboral y finanzas para España.',
    url: URL_CANONICA,
    siteName: 'Delegum',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delegum — Plataforma de fiscalidad, derecho laboral y finanzas',
    description:
      'Datos fiscales verificados, asistente de IA y calculadoras para España. Sin registro, sin coste.',
  },
  other: {
    'application-name': 'Delegum',
  },
  alternates: {
    canonical: URL_CANONICA,
  },
  icons: {
    icon: [
      { url: '/delegum/favicon.svg', type: 'image/svg+xml' },
      { url: '/delegum/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/delegum/app-icon-180.png',
  },
};

// JSON-LD a nivel de sitio: Organización Delegum (editor meskeIA).
// Se inyecta en el layout compartido, por lo que aplica a toda la subweb /delegum.
export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Delegum',
  url: URL_CANONICA,
  description:
    'Plataforma digital de fiscalidad, derecho laboral y finanzas para España: datos fiscales verificados, asistente de IA (MCP) y calculadoras. Parte de meskeIA.',
  logo: 'https://delegum.com/delegum/app-icon-512.png',
  parentOrganization: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com/',
  },
};
