import { Metadata } from 'next';
import { FISCAL_AUTONOMOS_META } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/cuota-autonomos-reta/';

export const metadata: Metadata = {
  title: 'Cuota de autónomos (RETA): tramos 2026 | Delegum',
  description:
    'Tabla de cotización de autónomos por ingresos reales 2026: tramos de rendimiento neto, base mínima y cuota mensual a la Seguridad Social, tipo del 31,50% y tarifa plana. Verificado el ' +
    FISCAL_AUTONOMOS_META.verificado + '.',
  keywords:
    'cuota autónomos 2026, tramos RETA, cotización autónomos ingresos reales, cuota mínima autónomo, tarifa plana autónomos, base de cotización autónomo, Seguridad Social autónomos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Cuota de autónomos (RETA): tramos 2026',
    description:
      'Tramos de cotización por ingresos reales, cuota mensual, tipo del 31,50% y tarifa plana.',
    url: URL_CANONICA,
    siteName: 'Delegum',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Cuota de autónomos (RETA): tramos 2026',
    description: 'Cotización por ingresos reales: tramos, cuota mensual y tarifa plana.',
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
  name: 'Cuota de autónomos (RETA) por tramos de ingresos — España 2026',
  description:
    'Tabla de cotización de los trabajadores autónomos por ingresos reales en España 2026: tramos de rendimiento neto, base mínima y cuota mensual a la Seguridad Social.',
  url: URL_CANONICA,
  license: 'https://delegum.com/aviso-legal',
  creator: { '@type': 'Organization', name: 'Delegum', url: 'https://delegum.com/' },
  publisher: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com/' },
  isBasedOn: FISCAL_AUTONOMOS_META.urlOficial,
  dateModified: FISCAL_AUTONOMOS_META.verificado,
  temporalCoverage: FISCAL_AUTONOMOS_META.vigencia,
  spatialCoverage: { '@type': 'Country', name: 'España' },
  variableMeasured: ['Rendimiento neto mensual (€)', 'Base mínima de cotización (€)', 'Cuota mensual (€)'],
  keywords: ['cuota autónomos 2026', 'tramos RETA', 'cotización ingresos reales'],
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la cuota de autónomo en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Desde 2023 los autónomos cotizan por ingresos reales: según el rendimiento neto mensual (ingresos menos gastos deducibles y la propia cuota) te corresponde un tramo, que fija una base mínima y máxima. La cuota es la base elegida multiplicada por el tipo del 31,50%. Eligiendo la base mínima de cada tramo, la cuota va desde unos 206 € hasta más de 600 € al mes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la cuota mínima de autónomo en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuota mínima general en 2026 es de unos 205-206 € al mes, correspondiente al tramo más bajo (rendimientos hasta 670 € mensuales) sobre la base mínima reducida. Quien tiene mayores rendimientos cotiza por tramos superiores con cuotas más altas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el rendimiento neto a efectos de la cuota?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El rendimiento neto se calcula restando a los ingresos los gastos deducibles de la actividad y la propia cuota de autónomo, y aplicando además una deducción adicional del 7% (3% para autónomos societarios) por gastos genéricos. Ese rendimiento neto mensual es el que determina el tramo de cotización.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué consiste la tarifa plana de autónomos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los nuevos autónomos pueden acogerse a una tarifa plana de 80 € al mes durante los primeros 12 meses, prorrogable otros 12 si los rendimientos se mantienen por debajo del SMI. Es una cuota fija reducida, independiente del tramo de ingresos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo de cotización se aplica a los autónomos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tipo de cotización del RETA en 2026 es del 31,50%, que se desglosa en contingencias comunes (28,30%), contingencias profesionales (1,30%), cese de actividad (0,90%), formación profesional (0,10%) y mecanismo de equidad intergeneracional o MEI (0,90%).',
      },
    },
  ],
};
