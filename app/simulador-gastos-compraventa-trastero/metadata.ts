import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema, combineSchemas } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Gastos Compraventa Trastero - ITP y Costes | meskeIA',
  description: 'Calcula los gastos de compra y venta de un trastero en España: ITP por comunidad autónoma, notaría, registro y plusvalía municipal. Incluye trastero vinculado y trastero independiente. Gratis.',
  keywords: 'simulador gastos compraventa trastero, gastos compra trastero, ITP trastero, impuestos trastero españa, comprar trastero gastos, calculadora trastero',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-gastos-compraventa-trastero/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Gastos Compraventa Trastero | meskeIA',
    description: 'Calcula el ITP y gastos de compraventa de un trastero en España.',
    url: 'https://meskeia.com/simulador-gastos-compraventa-trastero/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Gastos Compraventa Trastero | meskeIA',
    description: 'ITP, notaría y registro en la compraventa de trastero. Calcula gratis.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

const webAppSchema = generateWebAppSchema({
  name: 'Simulador Gastos Compraventa Trastero',
  description: 'Calculadora de gastos de compra y venta de trastero en España. Incluye ITP por comunidad autónoma, IVA en obra nueva (10% como anejo de la vivienda o 21% independiente), notaría, registro de la propiedad y plusvalía municipal.',
  url: 'https://meskeia.com/simulador-gastos-compraventa-trastero/',
  category: 'FinanceApplication',
  features: [
    'ITP por comunidad autónoma para trastero (tipo residencial)',
    'IVA 10% si va con la vivienda como anejo, 21% si es independiente (obra nueva)',
    'Gastos de notaría y registro de la propiedad',
    'Plusvalía municipal del vendedor',
    'IRPF sobre ganancia patrimonial',
    'Preconfigurado para trastero',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['gastos trastero', 'ITP trastero', 'compraventa trastero', 'España'],
});

const faqSchema = generateFAQSchema({
  url: 'https://meskeia.com/simulador-gastos-compraventa-trastero/',
  mainEntity: [
    {
      question: '¿Qué IVA paga un trastero nuevo?',
      answer: 'Depende de cómo se compre. Si el promotor transmite el trastero conjuntamente con la vivienda como anejo, se aplica el IVA reducido del 10% (art. 91.Uno.1.7º de la Ley del IVA). Si el trastero se adquiere de forma independiente, con su propia finca registral y en operación separada, tributa al tipo general del 21%. Es el mismo criterio que se aplica a las plazas de garaje.',
    },
    {
      question: '¿Qué diferencia hay entre trastero vinculado y trastero independiente?',
      answer: 'El trastero vinculado forma parte de la misma finca registral que la vivienda y se vende junto a ella como anejo. El trastero independiente tiene su propia referencia catastral y escritura y puede venderse por separado. La diferencia fiscal principal está en la obra nueva: el vinculado paga IVA al 10% como anejo y el independiente al 21%. En segunda mano ambos pagan ITP al tipo de la comunidad autónoma, aunque los tipos reducidos por perfil del comprador suelen exigir que la compra sea de vivienda habitual. Consulta siempre con un asesor fiscal antes de la operación.',
    },
    {
      question: '¿Se puede comprar un trastero sin comprar también la vivienda?',
      answer: 'Sí. Si el trastero tiene finca registral propia (trastero independiente), se puede comprar y vender de forma autónoma sin necesidad de adquirir la vivienda a la que originalmente estuvo vinculado. Esta es una operación habitual, especialmente en comunidades de propietarios donde el trastero sale a la venta de forma separada.',
    },
    {
      question: '¿Se paga plusvalía municipal al vender un trastero?',
      answer: 'Sí. La plusvalía municipal (Impuesto sobre el Incremento del Valor de los Terrenos de Naturaleza Urbana) se aplica también a la venta de trasteros. Desde 2021, el vendedor puede elegir el método más favorable: el objetivo (basado en el valor catastral del suelo y el tiempo de tenencia) o el real (basado en la ganancia efectiva). Si no hay ganancia, se puede acreditar la pérdida y quedar exento.',
    },
    {
      question: '¿Tienen tipos reducidos de ITP los trasteros?',
      answer: 'Depende de cada comunidad autónoma. La mayoría de los tipos reducidos de ITP (jóvenes, familias numerosas, discapacidad) se diseñaron para vivienda habitual. No obstante, como el trastero vinculado se considera anejo residencial, algunas CCAA pueden extenderlos. En el caso del trastero independiente, el tratamiento es menos claro y varía según la normativa autonómica. Verifica los requisitos específicos de tu comunidad antes de la compra.',
    },
  ],
});

export const jsonLd = combineSchemas(webAppSchema, faqSchema);

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué IVA paga un trastero nuevo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de cómo se compre. Si el promotor transmite el trastero conjuntamente con la vivienda como anejo, se aplica el IVA reducido del 10% (art. 91.Uno.1.7º de la Ley del IVA). Si el trastero se adquiere de forma independiente, con su propia finca registral y en operación separada, tributa al tipo general del 21%. Es el mismo criterio que se aplica a las plazas de garaje.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre trastero vinculado y trastero independiente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El trastero vinculado forma parte de la misma finca registral que la vivienda y se vende junto a ella como anejo. El trastero independiente tiene su propia referencia catastral y escritura y puede venderse por separado. La diferencia fiscal principal está en la obra nueva: el vinculado paga IVA al 10% como anejo y el independiente al 21%. En segunda mano ambos pagan ITP al tipo de la comunidad autónoma, aunque los tipos reducidos por perfil del comprador suelen exigir que la compra sea de vivienda habitual. Consulta siempre con un asesor fiscal antes de la operación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede comprar un trastero sin comprar también la vivienda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Si el trastero tiene finca registral propia (trastero independiente), se puede comprar y vender de forma autónoma sin necesidad de adquirir la vivienda a la que originalmente estuvo vinculado. Esta es una operación habitual, especialmente en comunidades de propietarios donde el trastero sale a la venta de forma separada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se paga plusvalía municipal al vender un trastero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La plusvalía municipal (Impuesto sobre el Incremento del Valor de los Terrenos de Naturaleza Urbana) se aplica también a la venta de trasteros. Desde 2021, el vendedor puede elegir el método más favorable: el objetivo (basado en el valor catastral del suelo y el tiempo de tenencia) o el real (basado en la ganancia efectiva). Si no hay ganancia, se puede acreditar la pérdida y quedar exento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tienen tipos reducidos de ITP los trasteros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de cada comunidad autónoma. La mayoría de los tipos reducidos de ITP (jóvenes, familias numerosas, discapacidad) se diseñaron para vivienda habitual. No obstante, como el trastero vinculado se considera anejo residencial, algunas comunidades autónomas pueden extenderlos. En el caso del trastero independiente, el tratamiento es menos claro y varía según la normativa autonómica. Verifica los requisitos específicos de tu comunidad antes de la compra.',
      },
    },
  ],
};
