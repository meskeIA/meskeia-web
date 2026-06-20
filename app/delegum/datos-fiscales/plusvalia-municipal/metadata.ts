import { Metadata } from 'next';
import { PLUSVALIA_MUNICIPAL_META } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/plusvalia-municipal/';

export const metadata: Metadata = {
  title: 'Plusvalía municipal (IIVTNU): coeficientes por años | Delegum',
  description:
    'Coeficientes de la plusvalía municipal (IIVTNU) por años de tenencia, quién la paga, tipo máximo legal y métodos de cálculo objetivo y real (RDL 26/2021), con fuente oficial. Verificado el ' +
    PLUSVALIA_MUNICIPAL_META.verificado + '.',
  keywords:
    'plusvalía municipal, IIVTNU, coeficientes plusvalía 2025, RDL 26/2021, plusvalía venta vivienda, plusvalía herencia, método objetivo plusvalía, método real plusvalía, tipo plusvalía municipal, incremento valor terrenos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Plusvalía municipal (IIVTNU): coeficientes por años',
    description:
      'Coeficientes de la plusvalía municipal por años de tenencia, quién la paga y métodos de cálculo objetivo y real (RDL 26/2021), con fuente oficial.',
    url: URL_CANONICA,
    siteName: 'Delegum',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Plusvalía municipal (IIVTNU): coeficientes por años',
    description:
      'Coeficientes de la plusvalía municipal por años de tenencia y métodos de cálculo objetivo y real, con fuente oficial.',
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

// Dataset JSON-LD — señal estructurada para que las IAs citen esta tabla como fuente
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Plusvalía municipal (IIVTNU): coeficientes por años de tenencia (España)',
  description:
    'Coeficientes máximos del Impuesto sobre el Incremento del Valor de los Terrenos de Naturaleza Urbana (IIVTNU) por años de tenencia, tipo máximo legal y métodos de cálculo objetivo y real según el RDL 26/2021.',
  url: URL_CANONICA,
  license: 'https://delegum.com/aviso-legal',
  creator: {
    '@type': 'Organization',
    name: 'Delegum',
    url: 'https://delegum.com/',
  },
  publisher: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com/',
  },
  isBasedOn: PLUSVALIA_MUNICIPAL_META.urlReferencia,
  dateModified: PLUSVALIA_MUNICIPAL_META.verificado,
  temporalCoverage: PLUSVALIA_MUNICIPAL_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: [
    'Coeficiente IIVTNU por años de tenencia',
    'Tipo máximo legal (%)',
  ],
  keywords: ['plusvalía municipal', 'IIVTNU', 'coeficientes por años', 'RDL 26/2021'],
};

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la plusvalía municipal (IIVTNU)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La plusvalía municipal, oficialmente Impuesto sobre el Incremento del Valor de los Terrenos de Naturaleza Urbana (IIVTNU), es un tributo local que grava el aumento de valor del suelo urbano cuando se transmite un inmueble (venta, herencia o donación). Lo gestiona y cobra el ayuntamiento donde está el inmueble.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Quién paga la plusvalía municipal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una venta la paga el vendedor; en una herencia, el heredero; y en una donación, el donatario (quien recibe). El plazo es de 30 días hábiles en transmisiones entre vivos y de 6 meses (prorrogables) en herencias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la plusvalía municipal desde 2021?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tras el RDL 26/2021 existen dos métodos y el contribuyente puede elegir el que le resulte más favorable. El método objetivo multiplica el valor catastral del suelo por un coeficiente según los años de tenencia. El método real toma el incremento de valor efectivo (precio de venta menos compra, en la parte proporcional al suelo). Se aplica el menor de los dos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se paga plusvalía municipal si vendo con pérdidas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Desde la sentencia del Tribunal Constitucional y el RDL 26/2021, si no ha habido incremento de valor del terreno (se vende por igual o menos de lo que costó) no se paga el impuesto. Hay que poder acreditarlo con las escrituras de compra y venta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el coeficiente de la plusvalía según los años?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los coeficientes máximos van desde 0,14 para menos de un año de tenencia hasta 0,45 para 20 o más años, pasando por valores más bajos en torno a los 8-13 años (0,08). Cada ayuntamiento puede aplicar coeficientes iguales o inferiores a esos máximos, y el tipo de gravamen no puede superar el 30%.',
      },
    },
  ],
};
