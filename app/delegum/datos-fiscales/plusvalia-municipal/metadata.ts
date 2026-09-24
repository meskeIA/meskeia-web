import { Metadata } from 'next';
import { COEFICIENTES_IIVTNU_2025, PLUSVALIA_MUNICIPAL_META } from '@/data/fiscal';
import { formatNumber } from '@/lib';

/** La respuesta sobre los coeficientes, compuesta con la tabla vigente de data/fiscal. */
const RESPUESTA_COEFICIENTES = (() => {
  const c = COEFICIENTES_IIVTNU_2025;
  const f = (n: number) => formatNumber(n, 2);
  const minimo = Math.min(...c.map((x) => x.coeficiente));
  const aniosMinimo = c.filter((x) => x.coeficiente === minimo).map((x) => x.anios);
  const tramoMinimo =
    aniosMinimo.length > 1
      ? `entre los ${aniosMinimo[0]} y los ${aniosMinimo[aniosMinimo.length - 1]} años`
      : `a los ${aniosMinimo[0]} años`;
  return (
    `Los coeficientes máximos van de ${f(c[0].coeficiente)} para menos de un año de tenencia ` +
    `(prorrateado por meses completos) a ${f(c[c.length - 1].coeficiente)} para 20 o más años, ` +
    `con su valor más bajo, ${f(minimo)}, ${tramoMinimo}. Cada ayuntamiento puede aplicar ` +
    `coeficientes iguales o inferiores a esos máximos, y el tipo de gravamen no puede superar ` +
    `el ${formatNumber(PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal, 0)}%.`
  );
})();

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
    title: 'Plusvalía municipal (IIVTNU): coeficientes por años',
    description:
      'Coeficientes de la plusvalía municipal por años de tenencia y métodos de cálculo objetivo y real, con fuente oficial.',
    images: ['https://delegum.com/delegum/og-image.png'],
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
        // Derivado de la tabla: hasta el 24/09/2026 estaba escrito a mano con la del RDL 26/2021
        // (0,14 … 0,45), caducada desde 2023, en el FAQPage que leen los asistentes de IA
        // (hallazgo 1559).
        text: RESPUESTA_COEFICIENTES,
      },
    },
  ],
};
