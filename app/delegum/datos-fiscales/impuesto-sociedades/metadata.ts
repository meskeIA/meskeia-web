import { Metadata } from 'next';
import { FISCAL_SOCIEDADES_META } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/impuesto-sociedades/';

export const metadata: Metadata = {
  title: 'Tipos del Impuesto de Sociedades 2026 | Delegum',
  description:
    'Tipos del Impuesto de Sociedades en 2026: general, nueva creación, escala de microempresas (Ley 7/2024), cooperativas y obligaciones (modelos 200 y 202), con fuente oficial. Verificado el ' +
    FISCAL_SOCIEDADES_META.verificado + '.',
  keywords:
    'impuesto de sociedades 2026, tipo impuesto sociedades, escala microempresas, Ley 7/2024, IS nueva creación 15%, modelo 200, modelo 202, tipo general 25%, cooperativas IS, pago fraccionado sociedades',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Tipos del Impuesto de Sociedades 2026',
    description:
      'Tipos del Impuesto de Sociedades en 2026: general, nueva creación, escala de microempresas, cooperativas y obligaciones periódicas, con fuente oficial.',
    url: URL_CANONICA,
    siteName: 'Delegum',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Tipos del Impuesto de Sociedades 2026',
    description:
      'Tipos del IS en 2026: general, nueva creación, escala de microempresas y obligaciones, con fuente oficial.',
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
  name: 'Tipos del Impuesto de Sociedades (España) 2026',
  description:
    'Tipos de gravamen del Impuesto sobre Sociedades en España: tipo general, empresas de nueva creación, escala progresiva de microempresas (Ley 7/2024), cooperativas y entidades parcialmente exentas, con las obligaciones periódicas asociadas.',
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
  isBasedOn: FISCAL_SOCIEDADES_META.urlOficial,
  dateModified: FISCAL_SOCIEDADES_META.verificado,
  temporalCoverage: FISCAL_SOCIEDADES_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: [
    'Tipo general IS (%)',
    'Tipo nueva creación (%)',
    'Escala microempresas (%)',
  ],
  keywords: ['impuesto de sociedades', 'tipo general 25%', 'escala microempresas', 'Ley 7/2024', 'modelo 200'],
};

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es el tipo del Impuesto de Sociedades en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tipo general del Impuesto sobre Sociedades es del 25% y no ha cambiado. Sobre él existen tipos especiales: las empresas de nueva creación tributan al 15% los dos primeros ejercicios con beneficios, las microempresas por una escala progresiva del 19% y 21%, y las cooperativas protegidas al 20%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo pagan las microempresas y pymes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Desde 2025, las microempresas con una cifra de negocio inferior a 1 millón de euros tributan por una escala progresiva introducida por la Ley 7/2024, en lugar del antiguo tipo plano del 23%. En 2026 la escala es del 19% sobre los primeros 50.000 € de base imponible y del 21% sobre el resto, y bajará al 17% / 20% en 2027.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo paga una sociedad de nueva creación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las entidades de nueva creación tributan al 15% en el primer periodo impositivo en que su base imponible es positiva y en el siguiente. Es un tipo reducido pensado para los primeros años de actividad; después pasan al tipo que les corresponda (general o escala de microempresa).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se presenta el Impuesto de Sociedades?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La declaración anual se presenta con el Modelo 200 en los 25 días naturales siguientes a los 6 meses desde el cierre del ejercicio; para un ejercicio que coincide con el año natural, eso significa hasta el 25 de julio. Además, las sociedades con cuota positiva el año anterior realizan tres pagos fraccionados con el Modelo 202 en abril, octubre y diciembre.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Conviene tributar como autónomo o como sociedad limitada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del beneficio. El autónomo tributa por IRPF (escala progresiva que puede superar el 45%), mientras que la SL tributa por el Impuesto de Sociedades (25% general, o la escala de microempresa). A partir de cierto nivel de beneficio la SL puede resultar más eficiente, pero implica más obligaciones contables y la doble tributación de los dividendos. Conviene comparar ambos escenarios con cifras concretas.',
      },
    },
  ],
};
