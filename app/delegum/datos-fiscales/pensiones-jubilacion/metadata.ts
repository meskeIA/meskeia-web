import { Metadata } from 'next';
import { FISCAL_PENSIONES_META } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/pensiones-jubilacion/';

export const metadata: Metadata = {
  title: 'Pensión de jubilación 2026: edad, años cotizados y cuantías | Delegum',
  description:
    'Edad de jubilación, años mínimos de cotización, porcentaje de pensión según años cotizados y pensión máxima y mínima 2026, con fuente oficial. Verificado el ' +
    FISCAL_PENSIONES_META.verificado + '.',
  keywords:
    'pensión de jubilación 2026, edad de jubilación, años cotizados pensión, pensión máxima 2026, pensión mínima 2026, base reguladora, porcentaje pensión, jubilación 65 años, jubilación 67 años, cotización mínima jubilación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Pensión de jubilación 2026: edad, años cotizados y cuantías',
    description:
      'Edad de jubilación, años mínimos de cotización, porcentaje de pensión según años cotizados y pensión máxima y mínima 2026, con fuente oficial.',
    url: URL_CANONICA,
    siteName: 'Delegum',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Pensión de jubilación 2026: edad, años cotizados y cuantías',
    description:
      'Edad de jubilación, años de cotización y pensión máxima y mínima 2026, con fuente oficial.',
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
  name: 'Pensión de jubilación en España 2026: edad, cotización y cuantías',
  description:
    'Edad de jubilación ordinaria por año, años mínimos de cotización, porcentaje de pensión según los años cotizados y límites de la pensión pública (máxima y mínimas) de 2026.',
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
  isBasedOn: FISCAL_PENSIONES_META.urlOficial,
  dateModified: FISCAL_PENSIONES_META.verificado,
  temporalCoverage: FISCAL_PENSIONES_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: [
    'Edad de jubilación (años)',
    'Años mínimos de cotización',
    'Pensión máxima (€/mes)',
    'Pensión mínima (€/mes)',
  ],
  keywords: ['pensión de jubilación', 'edad de jubilación 2026', 'pensión máxima', 'pensión mínima', 'años cotizados'],
};

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿A qué edad puedo jubilarme en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En 2026 la edad ordinaria de jubilación es de 66 años y 10 meses para quienes tienen menos de 38 años y 3 meses cotizados. Quienes alcanzan esos 38 años y 3 meses de cotización pueden jubilarse a los 65 años. El calendario de transición termina en 2027, cuando la edad sin cotización suficiente será de 67 años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos años hay que cotizar para cobrar pensión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se necesitan al menos 15 años cotizados (180 meses) para tener derecho a la pensión de jubilación, y al menos 2 de esos años deben estar dentro de los 15 anteriores a la jubilación. Con 15 años se cobra el 50% de la base reguladora; el porcentaje sube a medida que se cotizan más años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la pensión máxima en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pensión pública máxima en 2026 es de 3.359,60 € al mes, equivalente a 47.034,40 € al año en 14 pagas. Por mucho que se haya cotizado, ninguna pensión contributiva puede superar ese tope. Las pensiones mínimas, en cambio, van de unos 888 € a 1.256 € al mes según la situación familiar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el porcentaje de la pensión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con 15 años cotizados se aplica el 50% de la base reguladora. A partir de ahí cada mes adicional suma un porcentaje (0,21% por mes hasta los ~23 años y 0,19% después), hasta llegar al 100% con unos 36 años y 9 meses cotizados. Si se cobra antes de la edad ordinaria (jubilación anticipada) se aplican coeficientes reductores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la base reguladora de la pensión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La base reguladora es el promedio de las bases de cotización de los últimos años dividido por un divisor que compensa las lagunas. En el modelo clásico se toman las 300 últimas bases (25 años) divididas entre 350. Desde 2026 convive con un sistema dual que permite descartar los peores años de un periodo más amplio; la Seguridad Social aplica de oficio la fórmula más favorable.',
      },
    },
  ],
};
