import { Metadata } from 'next';
import { FISCAL_AMORTIZACION_META } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/amortizacion-inmovilizado/';

export const metadata: Metadata = {
  title: 'Tabla de coeficientes de amortización del inmovilizado | Delegum',
  description:
    'Coeficientes de amortización lineal por tipo de activo (art. 12.1 LIS), período máximo y métodos de amortización degresiva admitidos en el Impuesto sobre Sociedades, con fuente oficial. Verificado el ' +
    FISCAL_AMORTIZACION_META.verificado + '.',
  keywords:
    'tabla amortización, coeficientes amortización, amortización inmovilizado, art 12 LIS, amortización lineal, amortización degresiva, porcentaje constante, amortización ordenador, amortización maquinaria, vida útil fiscal',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Tabla de coeficientes de amortización del inmovilizado',
    description:
      'Coeficientes de amortización lineal por tipo de activo, período máximo y métodos degresivos admitidos en el Impuesto sobre Sociedades, con fuente oficial.',
    url: URL_CANONICA,
    siteName: 'Delegum',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Tabla de coeficientes de amortización del inmovilizado',
    description:
      'Coeficientes de amortización lineal por tipo de activo y métodos degresivos admitidos (art. 12.1 LIS), con fuente oficial.',
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
  name: 'Tabla de coeficientes de amortización del inmovilizado (España)',
  description:
    'Coeficientes de amortización lineal máximos y períodos máximos por tipo de activo (art. 12.1.a de la Ley del Impuesto sobre Sociedades) y multiplicadores de la amortización degresiva por porcentaje constante.',
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
  isBasedOn: FISCAL_AMORTIZACION_META.urlOficial,
  dateModified: FISCAL_AMORTIZACION_META.verificado,
  temporalCoverage: FISCAL_AMORTIZACION_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: [
    'Coeficiente lineal máximo (%)',
    'Período máximo (años)',
    'Multiplicador degresivo',
  ],
  keywords: ['amortización lineal', 'amortización degresiva', 'art 12.1 LIS', 'Impuesto sobre Sociedades'],
};

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la amortización del inmovilizado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es el reparto del coste de un activo (maquinaria, equipos, vehículos, edificios…) como gasto a lo largo de su vida útil, en lugar de deducirlo entero el año de la compra. En el Impuesto sobre Sociedades, la Ley 27/2014 fija en su artículo 12.1 una tabla con el coeficiente lineal máximo y el período máximo admitidos para cada tipo de elemento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué coeficiente de amortización puedo aplicar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes amortizar entre el coeficiente lineal máximo (la amortización más rápida) y el que resulta del período máximo (la más lenta). Por ejemplo, la maquinaria admite hasta un 12% anual con un período máximo de 18 años, y los equipos informáticos hasta un 25% anual en un máximo de 8 años. Dentro de ese intervalo la amortización se considera fiscalmente deducible sin justificación adicional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la amortización degresiva por porcentaje constante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es un método (art. 12.1.b LIS) que concentra más gasto en los primeros años. Se multiplica el coeficiente lineal por 1,5 si el período es menor de 5 años, por 2 si está entre 5 y 8 años y por 2,5 si supera los 8 años, y ese porcentaje constante se aplica cada año sobre el valor pendiente de amortizar. El porcentaje resultante no puede ser inferior al 11%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede amortizar un edificio de forma degresiva?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La amortización degresiva (tanto por porcentaje constante como por números dígitos) no es aplicable a edificios, mobiliario y enseres; estos solo pueden amortizarse de forma lineal. Los edificios de uso comercial o administrativo se amortizan hasta un 2% anual y los de uso industrial hasta un 3%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En cuántos años se amortiza un ordenador o el software?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los equipos para procesos de información (ordenadores) admiten hasta un 25% anual, lo que permite amortizarlos en unos 4 años (y hasta un máximo de 8). Los sistemas y programas informáticos (software) admiten hasta un 33% anual, amortizables en unos 3 años, con un período máximo de 6.',
      },
    },
  ],
};
