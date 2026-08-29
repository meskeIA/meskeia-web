import { Metadata } from 'next';
import { FISCAL_INTERESES_META } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/interes-legal-demora/';

export const metadata: Metadata = {
  title: 'Interés legal del dinero y de demora 2026 | Delegum',
  description:
    'Interés legal del dinero (3,25%), interés de demora comercial por semestre (Ley 3/2004) e interés de demora tributario (4,0625%) en España, con fuente oficial. Verificado el ' +
    FISCAL_INTERESES_META.verificado + '.',
  keywords:
    'interés legal del dinero 2026, interés de demora comercial, Ley 3/2004 morosidad, interés de demora tributario, tipo de interés reclamación facturas, intereses deuda',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Interés legal del dinero y de demora 2026',
    description:
      'Interés legal, interés de demora comercial por semestre e interés de demora tributario en España.',
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
    card: 'summary',
    title: 'Interés legal del dinero y de demora 2026',
    description: 'Interés legal (3,25%), demora comercial e interés tributario, con fuente oficial.',
    images: ['https://delegum.com/delegum/og-image.png'],
  },
  alternates: { canonical: URL_CANONICA },
  icons: {
    icon: [
      { url: '/delegum/favicon.svg', type: 'image/svg+xml' },
      { url: '/delegum/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/delegum/app-icon-180.png',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Interés legal del dinero y de demora (España) 2026',
  description:
    'Interés legal del dinero, interés de demora comercial por semestre (Ley 3/2004) e interés de demora tributario vigentes en España.',
  url: URL_CANONICA,
  license: 'https://delegum.com/aviso-legal',
  creator: { '@type': 'Organization', name: 'Delegum', url: 'https://delegum.com/' },
  publisher: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com/' },
  isBasedOn: FISCAL_INTERESES_META.urlOficialLey3,
  dateModified: FISCAL_INTERESES_META.verificado,
  temporalCoverage: FISCAL_INTERESES_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: ['Interés legal del dinero (%)', 'Interés de demora comercial (%)', 'Interés de demora tributario (%)'],
  keywords: ['interés legal del dinero', 'interés de demora comercial', 'Ley 3/2004'],
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es el interés legal del dinero en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El interés legal del dinero en 2026 es del 3,25%. Se aplica a deudas civiles y mercantiles cuando no hay un tipo pactado (art. 1108 del Código Civil). Lo fija cada año la Ley de Presupuestos; al no haberse aprobado nuevos presupuestos, se prorroga el de 2023.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el interés de demora comercial de la Ley 3/2004?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es el interés que se devenga automáticamente cuando una empresa o autónomo cobra tarde una factura entre profesionales. Equivale al tipo de referencia del BCE más 8 puntos porcentuales y se publica cada semestre en el BOE. En el primer semestre de 2026 es del 10,15%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia el interés de demora comercial del tributario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El interés de demora comercial (Ley 3/2004) se usa para reclamar facturas impagadas entre empresas. El interés de demora tributario (4,0625% en 2025) lo aplica Hacienda en liquidaciones, aplazamientos y fraccionamientos. Son tipos y ámbitos distintos: no deben confundirse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Desde cuándo se devengan los intereses por una factura impagada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En operaciones comerciales, los intereses de demora se devengan de forma automática desde el día siguiente al vencimiento del plazo de pago, sin necesidad de avisar al deudor. El plazo legal de pago por defecto es de 30 días, ampliable hasta 60 por acuerdo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cada cuánto cambia el interés de demora comercial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El interés de demora comercial se revisa cada seis meses. El Ministerio de Economía publica en el BOE, en enero y en julio, el tipo de referencia del BCE aplicable a cada semestre, al que se suman los 8 puntos fijos de la Ley 3/2004.',
      },
    },
  ],
};
