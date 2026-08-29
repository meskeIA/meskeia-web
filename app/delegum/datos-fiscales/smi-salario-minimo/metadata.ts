import { Metadata } from 'next';
import { FISCAL_SMI_META, SMI_2026 } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/smi-salario-minimo/';

export const metadata: Metadata = {
  title: 'Salario Mínimo Interprofesional (SMI) 2026 | Delegum',
  description:
    'SMI 2026 en España: ' + SMI_2026.mensual14 + ' € al mes en 14 pagas, ' + SMI_2026.anual +
    ' € anuales, importe diario y por hora para empleadas de hogar. Comparativa con 2025 y norma oficial.',
  keywords:
    'SMI 2026, salario mínimo interprofesional, salario mínimo España 2026, SMI mensual, SMI anual, SMI por hora empleadas hogar, RD 126/2026',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Salario Mínimo Interprofesional (SMI) 2026',
    description:
      'SMI 2026: importe mensual, anual, diario y por hora, con comparativa 2025 y norma oficial.',
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
    title: 'Salario Mínimo Interprofesional (SMI) 2026',
    description: SMI_2026.mensual14 + ' €/mes en 14 pagas · ' + SMI_2026.anual + ' €/año.',
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
  name: 'Salario Mínimo Interprofesional (SMI) de España 2026',
  description:
    'Cuantías del Salario Mínimo Interprofesional vigente en España en 2026: mensual (14 y 12 pagas), anual, diario y por hora para empleadas de hogar.',
  url: URL_CANONICA,
  license: 'https://delegum.com/aviso-legal',
  creator: { '@type': 'Organization', name: 'Delegum', url: 'https://delegum.com/' },
  publisher: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com/' },
  isBasedOn: FISCAL_SMI_META.urlOficial,
  dateModified: FISCAL_SMI_META.verificado,
  temporalCoverage: FISCAL_SMI_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: ['SMI mensual (€)', 'SMI anual (€)', 'SMI por hora (€)'],
  keywords: ['SMI 2026', 'salario mínimo interprofesional'],
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es el SMI en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Salario Mínimo Interprofesional en 2026 es de 1.221 € al mes en 14 pagas (o 1.424,50 € en 12 pagas), lo que equivale a 17.094 € anuales. El importe diario es de 40,70 €. Lo fija el Real Decreto 126/2026 y supone una subida del 3,1% respecto a 2025.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El SMI se paga en 14 pagas o en 12?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El SMI se fija para 14 pagas: 1.221 € al mes (12 mensualidades + 2 pagas extra) en 2026. Si el convenio o el contrato prorratea las pagas extra en 12 mensualidades, el importe mensual equivalente es de 1.424,50 €. En ambos casos el total anual es el mismo: 17.094 €.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto es el SMI por hora para empleadas de hogar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En 2026 el SMI por hora para empleadas de hogar que trabajan por horas en régimen externo es de 9,55 €. Este importe incluye la parte proporcional de pagas extra y vacaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El SMI es bruto o neto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El SMI se expresa en bruto. Del importe se descuentan las cotizaciones a la Seguridad Social a cargo del trabajador y, en su caso, la retención de IRPF. En rentas tan bajas la retención de IRPF suele ser cero o muy reducida, por lo que el neto se acerca al bruto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto ha subido el SMI respecto a 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El SMI de 2026 (1.221 € en 14 pagas) sube un 3,1% respecto al de 2025, que era de 1.184 € al mes (16.576 € anuales). En términos anuales, el incremento es de 518 € brutos.',
      },
    },
  ],
};
