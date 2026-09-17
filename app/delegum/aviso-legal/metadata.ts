import { Metadata } from 'next';

const URL_CANONICA = 'https://delegum.com/aviso-legal/';

export const metadata: Metadata = {
  title: 'Aviso Legal y Términos de Uso | Delegum',
  description:
    'Aviso legal de Delegum: naturaleza orientativa de los cálculos fiscales, laborales y financieros, limitación de responsabilidad, uso a través de asistentes de IA de terceros, responsabilidad del usuario y tratamiento de datos.',
  keywords:
    'delegum aviso legal, términos de uso, limitación de responsabilidad, condiciones de uso, privacidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Aviso Legal y Términos de Uso de Delegum',
    description:
      'Naturaleza orientativa de los resultados, limitación de responsabilidad y condiciones de uso de Delegum.',
    url: URL_CANONICA,
    siteName: 'Delegum',
    locale: 'es_ES',
    images: [
      {
        url: 'https://delegum.com/delegum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Delegum — el portal de fiscalidad y derecho de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aviso Legal y Términos de Uso de Delegum',
    description:
      'Naturaleza orientativa de los resultados, limitación de responsabilidad y condiciones de uso de Delegum.',
    images: ['https://delegum.com/delegum/og-image.png'],
  },
  alternates: {
    canonical: URL_CANONICA,
  },
};
