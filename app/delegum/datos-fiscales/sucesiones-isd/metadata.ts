import { Metadata } from 'next';
import { BONIFICACIONES_CCAA_IS, FISCAL_SUCESIONES_META } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/sucesiones-isd/';

export const metadata: Metadata = {
  title: 'Impuesto de Sucesiones por comunidad autónoma | Delegum',
  description:
    'Bonificaciones del Impuesto de Sucesiones (ISD) comunidad por comunidad, grupos de parentesco, tarifa estatal y reducciones, con fuente oficial. Verificado el ' +
    FISCAL_SUCESIONES_META.verificado + '.',
  keywords:
    'impuesto de sucesiones por comunidad autónoma, ISD, bonificación sucesiones, impuesto herencia CCAA, sucesiones Madrid, sucesiones Andalucía, sucesiones Cataluña, grupos de parentesco ISD, tarifa estatal sucesiones, reducciones herencia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Impuesto de Sucesiones por comunidad autónoma',
    description:
      'Bonificaciones del Impuesto de Sucesiones (ISD) por comunidad autónoma, grupos de parentesco, tarifa estatal y reducciones, con fuente oficial.',
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
    title: 'Impuesto de Sucesiones por comunidad autónoma',
    description:
      'Bonificaciones del ISD comunidad por comunidad, grupos de parentesco y tarifa estatal, con fuente oficial.',
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
  name: 'Impuesto de Sucesiones por comunidad autónoma (España)',
  description:
    'Bonificaciones autonómicas del Impuesto de Sucesiones y Donaciones (ISD) en cada comunidad autónoma española, grupos de parentesco, tarifa estatal por tramos y reducciones por parentesco.',
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
  isBasedOn: FISCAL_SUCESIONES_META.urlOficial,
  dateModified: FISCAL_SUCESIONES_META.verificado,
  temporalCoverage: FISCAL_SUCESIONES_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: [
    'Bonificación autonómica ISD (%)',
    'Tarifa estatal ISD (tipo %)',
    'Reducciones por parentesco (€)',
  ],
  keywords: Object.values(BONIFICACIONES_CCAA_IS).map((c) => `sucesiones ${c.nombre}`),
};

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Quién paga el Impuesto de Sucesiones en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lo pagan los herederos o legatarios que reciben los bienes, cada uno por su parte, no la herencia en bloque. El impuesto está cedido a las comunidades autónomas, así que la cuota depende de la comunidad donde residía habitualmente la persona fallecida durante los últimos años. El plazo de presentación es de 6 meses desde el fallecimiento (Modelo 650), prorrogable otros 6.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué se paga mucho menos en unas comunidades que en otras?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque cada comunidad autónoma fija sus propias bonificaciones y reducciones sobre la cuota. Para cónyuge, hijos y padres (Grupos I y II), comunidades como Canarias bonifican el 99,9%, Madrid, Andalucía o Galicia el 99%, mientras que en Asturias prácticamente no hay bonificación general. Por eso una misma herencia puede tributar casi cero en una comunidad y varios miles de euros en otra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los grupos de parentesco I, II, III y IV?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ISD clasifica a los herederos en cuatro grupos según su parentesco con el fallecido. Grupo I: descendientes y adoptados menores de 21 años. Grupo II: descendientes de 21 o más años, cónyuge y ascendientes. Grupo III: hermanos, tíos, sobrinos y parientes por afinidad. Grupo IV: primos, parientes más lejanos y personas sin parentesco. Las bonificaciones y reducciones casi siempre se concentran en los Grupos I y II.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se paga de impuesto de sucesiones entre hermanos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los hermanos pertenecen al Grupo III, que en la mayoría de comunidades no tiene bonificación o tiene una muy reducida (por ejemplo, 50% en Madrid o Murcia, frente al 99% de hijos y cónyuge). Además se les aplica un coeficiente multiplicador de 1,5882 sobre la cuota y una reducción por parentesco menor (7.993,46 € estatal). Por eso heredar entre hermanos suele salir bastante más caro que entre padres e hijos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la cuota del Impuesto de Sucesiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se parte del valor de los bienes heredados (más el 3% de ajuar doméstico), se restan las reducciones por parentesco, vivienda habitual, seguros o discapacidad, y sobre la base resultante se aplica la tarifa progresiva (estatal de hasta el 34% efectivo, o la propia de Cataluña). Esa cuota se multiplica por el coeficiente según grupo y patrimonio previo, y por último se aplica la bonificación autonómica.',
      },
    },
  ],
};
