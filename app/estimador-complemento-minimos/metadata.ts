import { Metadata } from 'next';

const title = 'Estimador de Complemento a Mínimos 2026 — Pensión mínima garantizada | meskeIA';
const description = 'Estima si tienes derecho al complemento a mínimos de la Seguridad Social. Pensiones mínimas 2026 por tipo (jubilación, viudedad, incapacidad), edad y situación familiar.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'complemento a minimos 2026, pension minima seguridad social, pension minima jubilacion, pension minima viudedad, complemento minimos requisitos, pension minima incapacidad permanente',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Complemento a Mínimos 2026 | meskeIA',
    description,
    url: 'https://meskeia.com/estimador-complemento-minimos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estimador de Complemento a Mínimos 2026 | meskeIA',
    description: 'Pensiones mínimas 2026: calcula si tienes derecho al complemento a mínimos de la SS',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Complemento a Mínimos meskeIA',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Estimador de Complemento a Mínimos 2026',
  description,
  url: 'https://meskeia.com/estimador-complemento-minimos/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el complemento a mínimos de la Seguridad Social?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El complemento a mínimos es una prestación adicional que la Seguridad Social abona a los pensionistas cuya pensión contributiva no alcanza el importe mínimo establecido para cada modalidad. Su objetivo es garantizar que ningún pensionista perciba una cantidad inferior a la pensión mínima legal, que varía según el tipo de pensión, la edad del titular y su situación familiar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los requisitos para cobrar el complemento a mínimos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para tener derecho al complemento a mínimos es necesario: que la pensión contributiva reconocida sea inferior a la cuantía mínima del año en curso, residir en España, y no disponer de rentas anuales superiores al límite de ingresos establecido (en 2025, alrededor de 8.942 € al año). Quedan excluidas las pensiones de gran invalidez y ciertas modalidades de incapacidad permanente total con porcentaje reducido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto es la pensión mínima de jubilación en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En 2026, la pensión mínima de jubilación con cónyuge a cargo ronda los 1.020 € al mes en 14 pagas. Sin cónyuge a cargo se sitúa en torno a 835 € mensuales, y para beneficiarios menores de 65 años en torno a 790 €. Estos importes se actualizan cada año conforme a la revalorización de pensiones aprobada en los Presupuestos Generales o mediante real decreto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El complemento a mínimos se aplica también a pensiones de viudedad e incapacidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El complemento a mínimos se puede aplicar a jubilación, incapacidad permanente (total, absoluta y gran invalidez) y viudedad, siempre que la pensión reconocida quede por debajo del mínimo correspondiente a cada modalidad. Los importes mínimos difieren: por ejemplo, la pensión mínima de viudedad con cargas familiares es superior a la de viudedad sin cargas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula si tengo derecho al complemento a mínimos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cálculo compara tu pensión contributiva bruta con la cuantía mínima legal para tu tipo de pensión y situación familiar. Si tu pensión es inferior, la diferencia es el complemento a mínimos. A continuación se verifica que tus rentas totales anuales (excluyendo la propia pensión) no superen el límite vigente. El estimador automatiza este proceso introduciendo tu pensión reconocida, tipo de prestación, edad y situación de convivencia.',
      },
    },
  ],
};
