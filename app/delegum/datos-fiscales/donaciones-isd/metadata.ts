import { Metadata } from 'next';
import { BONIFICACIONES_CCAA_ID, FISCAL_DONACIONES_META } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/donaciones-isd/';

export const metadata: Metadata = {
  title: 'Impuesto de Donaciones por comunidad autónoma | Delegum',
  description:
    'Bonificaciones del Impuesto de Donaciones (ISD) comunidad por comunidad, grupos de parentesco, tarifa estatal y reducciones, con fuente oficial. Verificado el ' +
    FISCAL_DONACIONES_META.verificado + '.',
  keywords:
    'impuesto de donaciones por comunidad autónoma, ISD donaciones, bonificación donaciones, donar dinero a un hijo, modelo 651, donaciones Madrid, donaciones Andalucía, donaciones Valencia, tarifa donaciones, escritura pública donación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Impuesto de Donaciones por comunidad autónoma',
    description:
      'Bonificaciones del Impuesto de Donaciones (ISD) por comunidad autónoma, grupos de parentesco, tarifa estatal y reducciones, con fuente oficial.',
    url: URL_CANONICA,
    siteName: 'Delegum',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Impuesto de Donaciones por comunidad autónoma',
    description:
      'Bonificaciones del ISD en donaciones comunidad por comunidad, grupos de parentesco y tarifa estatal, con fuente oficial.',
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
  name: 'Impuesto de Donaciones por comunidad autónoma (España)',
  description:
    'Bonificaciones autonómicas del Impuesto de Sucesiones y Donaciones (ISD) en su modalidad de donaciones en cada comunidad autónoma española, grupos de parentesco, tarifa estatal por tramos y reducciones por parentesco.',
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
  isBasedOn: FISCAL_DONACIONES_META.urlOficial,
  dateModified: FISCAL_DONACIONES_META.verificado,
  temporalCoverage: FISCAL_DONACIONES_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: [
    'Bonificación autonómica donaciones (%)',
    'Tarifa estatal donaciones (tipo %)',
    'Reducciones por parentesco (€)',
  ],
  keywords: Object.values(BONIFICACIONES_CCAA_ID).map((c) => `donaciones ${c.nombre}`),
};

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Impuesto de Donaciones y quién lo paga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Impuesto de Donaciones es la modalidad del Impuesto de Sucesiones y Donaciones (ISD) que grava lo que se recibe en vida de forma gratuita: dinero, un inmueble, acciones, etc. Lo paga quien recibe la donación (el donatario), no quien la hace. Está cedido a las comunidades autónomas y se autoliquida con el Modelo 651 en el plazo de 1 mes desde la donación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia donar de heredar fiscalmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En las donaciones, las bonificaciones autonómicas suelen ser menos generosas que en las sucesiones. Por ejemplo, la Comunidad Valenciana bonifica el 75% en donaciones frente al 99% en herencias, y Aragón el 65%. Además, donar un inmueble genera una ganancia patrimonial en el IRPF del donante, algo que no ocurre al heredar. Por eso conviene comparar ambas vías antes de decidir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se paga por donar dinero a un hijo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la comunidad autónoma. Para hijos (Grupo II), comunidades como Madrid, Galicia, Cantabria o Extremadura bonifican el 99% de la cuota, Canarias el 99,9% y Castilla-La Mancha el 95% (exigiendo escritura pública). En cambio, Aragón bonifica el 65% y la Comunitat Valenciana el 75%. Sobre una donación de 100.000 € la cuota base ronda los 11.000 €, que se reduce drásticamente con esas bonificaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay que hacer la donación en escritura pública?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para donar un inmueble la escritura pública es obligatoria. Para donar dinero no siempre lo es, pero varias comunidades (como Castilla-La Mancha) exigen formalizarla en documento público y justificar el origen de los fondos para poder aplicar la bonificación. Sin ese requisito se pierde el beneficio fiscal, así que conviene documentar siempre la donación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la cuota del Impuesto de Donaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se parte del valor de lo donado, se restan las reducciones aplicables y sobre la base se aplica la tarifa progresiva (estatal del 7,65% al 34%, o la propia de Cataluña). El resultado se multiplica por el coeficiente según grupo de parentesco y patrimonio previo, y por último se aplica la bonificación de la comunidad autónoma del donatario (o del lugar del inmueble).',
      },
    },
  ],
};
