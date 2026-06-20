import { Metadata } from 'next';
import { FISCAL_IPREM_META } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/iprem/';

export const metadata: Metadata = {
  title: 'IPREM 2026: cuantía diaria, mensual y anual | Delegum',
  description:
    'Cuantías del IPREM 2026 (diaria, mensual y anual con 12 y 14 pagas), para qué se usa y diferencia con el SMI, con fuente oficial. Verificado el ' +
    FISCAL_IPREM_META.verificado + '.',
  keywords:
    'IPREM 2026, IPREM mensual, IPREM anual, IPREM 14 pagas, indicador público renta efectos múltiples, IPREM diario, IPREM becas, IPREM ayudas vivienda, diferencia IPREM SMI, IPREM justicia gratuita',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'IPREM 2026: cuantía diaria, mensual y anual',
    description:
      'Cuantías del IPREM 2026 (diaria, mensual y anual con 12 y 14 pagas), para qué sirve y diferencia con el SMI, con fuente oficial.',
    url: URL_CANONICA,
    siteName: 'Delegum',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'IPREM 2026: cuantía diaria, mensual y anual',
    description:
      'Cuantías del IPREM 2026 con 12 y 14 pagas, para qué sirve y diferencia con el SMI, con fuente oficial.',
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
  name: 'IPREM 2026 (España)',
  description:
    'Cuantías del Indicador Público de Renta de Efectos Múltiples (IPREM) de 2026 en sus versiones diaria, mensual y anual (con 12 y 14 pagas), usado como referencia para topes de prestaciones, becas y ayudas.',
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
  isBasedOn: FISCAL_IPREM_META.urlOficial,
  dateModified: FISCAL_IPREM_META.verificado,
  temporalCoverage: FISCAL_IPREM_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: [
    'IPREM diario (€)',
    'IPREM mensual (€)',
    'IPREM anual 12 pagas (€)',
    'IPREM anual 14 pagas (€)',
  ],
  keywords: ['IPREM 2026', 'IPREM mensual', 'IPREM anual', 'indicador público de renta'],
};

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el IPREM?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El IPREM (Indicador Público de Renta de Efectos Múltiples) es un índice de referencia que se usa para fijar los umbrales de acceso a muchas prestaciones y ayudas públicas: subsidios de desempleo, becas, ayudas a la vivienda, justicia gratuita, etc. Sustituyó al Salario Mínimo Interprofesional como referencia para estos fines en 2004.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto es el IPREM en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En 2026 el IPREM es de 20 € al día, 600 € al mes y 7.200 € al año en su versión de 12 pagas, o 8.400 € al año en la versión de 14 pagas. Permanece congelado desde 2022 al mantenerse la prórroga presupuestaria, por lo que coincide con el de 2025.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué hay un IPREM anual de 12 pagas y otro de 14?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se usa el IPREM anual de 14 pagas (8.400 €) cuando la norma de la prestación incluye las pagas extraordinarias, que es lo más habitual en ayudas y subsidios. Se usa el de 12 pagas (7.200 €) cuando la referencia es estrictamente mensual sin extras. Cada convocatoria indica cuál de los dos aplica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia el IPREM del SMI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El SMI (Salario Mínimo Interprofesional) es la retribución mínima legal por trabajar y se actualiza cada año, mientras que el IPREM es solo un índice de referencia para conceder ayudas y no marca ningún salario. El IPREM (600 €/mes) es bastante más bajo que el SMI y lleva congelado desde 2022, por lo que ambos se han ido separando.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usa el IPREM?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se usa para fijar límites de renta: por ejemplo, muchos subsidios exigen no superar el 75% del IPREM mensual, la justicia gratuita usa múltiplos del IPREM anual según el número de miembros de la unidad familiar, y becas y ayudas a la vivienda fijan sus umbrales en veces el IPREM. Es la vara de medir de buena parte de las ayudas públicas en España.',
      },
    },
  ],
};
