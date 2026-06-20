import { Metadata } from 'next';
import { BONIFICACIONES_CCAA_PATRIMONIO, FISCAL_PATRIMONIO_META } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/impuesto-patrimonio/';

export const metadata: Metadata = {
  title: 'Impuesto sobre el Patrimonio por comunidad autónoma | Delegum',
  description:
    'Mínimo exento, escala estatal, bonificaciones autonómicas e Impuesto de Solidaridad de las Grandes Fortunas (ITSGF) del Impuesto sobre el Patrimonio, con fuente oficial. Verificado el ' +
    FISCAL_PATRIMONIO_META.verificado + '.',
  keywords:
    'impuesto sobre el patrimonio, IP por comunidad autónoma, mínimo exento patrimonio, bonificación patrimonio Madrid, patrimonio Andalucía, ITSGF, impuesto grandes fortunas, escala patrimonio, obligación declarar patrimonio, exención vivienda habitual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Impuesto sobre el Patrimonio por comunidad autónoma',
    description:
      'Mínimo exento, escala estatal, bonificaciones autonómicas y ITSGF del Impuesto sobre el Patrimonio, con fuente oficial.',
    url: URL_CANONICA,
    siteName: 'Delegum',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Impuesto sobre el Patrimonio por comunidad autónoma',
    description:
      'Mínimo exento, escala estatal, bonificaciones por CCAA y ITSGF del Impuesto sobre el Patrimonio, con fuente oficial.',
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
  name: 'Impuesto sobre el Patrimonio por comunidad autónoma (España)',
  description:
    'Mínimo exento, escala estatal por tramos, bonificaciones autonómicas y umbral del Impuesto de Solidaridad de las Grandes Fortunas (ITSGF) del Impuesto sobre el Patrimonio en España.',
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
  isBasedOn: FISCAL_PATRIMONIO_META.urlOficial,
  dateModified: FISCAL_PATRIMONIO_META.verificado,
  temporalCoverage: FISCAL_PATRIMONIO_META.vigencia,
  spatialCoverage: { '@type': 'Country', name: 'España' },
  variableMeasured: [
    'Bonificación autonómica IP (%)',
    'Mínimo exento (€)',
    'Escala estatal (tipo %)',
    'Umbral ITSGF (€)',
  ],
  keywords: BONIFICACIONES_CCAA_PATRIMONIO.map((c) => `patrimonio ${c.nombre}`),
};

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Quién tiene que pagar el Impuesto sobre el Patrimonio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lo pagan las personas físicas cuyo patrimonio neto (bienes y derechos menos deudas) supera el mínimo exento, que con carácter general es de 700.000 €, además de una exención de 300.000 € para la vivienda habitual. El impuesto está cedido a las comunidades autónomas, así que la cuota final depende mucho de la comunidad de residencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el mínimo exento del Impuesto sobre el Patrimonio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El mínimo exento general estatal es de 700.000 €, pero algunas comunidades lo han reducido: Cataluña y la Comunitat Valenciana lo fijan en 500.000 € y Aragón en 400.000 €. A ese mínimo se suma la exención de la vivienda habitual hasta 300.000 € por contribuyente. Por debajo de esos importes no hay cuota a pagar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué en Madrid o Andalucía no se paga Patrimonio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque tienen una bonificación autonómica cercana al 100% de la cuota (Madrid desde 2008, Andalucía y otras después). En la práctica no se paga Impuesto sobre el Patrimonio, salvo que el patrimonio supere los 3.000.000 €, en cuyo caso entra en juego el Impuesto de Solidaridad de las Grandes Fortunas (ITSGF) estatal, que actúa como suelo mínimo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Impuesto de Solidaridad de las Grandes Fortunas (ITSGF)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es un impuesto estatal (Ley 38/2022) que grava los patrimonios netos superiores a 3.000.000 €. Se creó para que las comunidades con bonificación del 100% en Patrimonio (como Madrid) no dejaran sin tributar a las grandes fortunas. Si se paga Impuesto sobre el Patrimonio autonómico, esa cuota se descuenta del ITSGF para evitar doble imposición.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo hay obligación de declarar aunque no salga a pagar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hay obligación de presentar la declaración cuando la cuota sale a pagar o cuando el valor bruto de los bienes y derechos supera 2.000.000 €, aunque la cuota sea cero por bonificación autonómica. Es decir, en comunidades con bonificación del 100% puede no pagarse nada y, aun así, tener que declarar si se supera ese umbral de patrimonio bruto.',
      },
    },
  ],
};
