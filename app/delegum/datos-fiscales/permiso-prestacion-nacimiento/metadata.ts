import { Metadata } from 'next';
import { FISCAL_MATERNIDAD_META } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/permiso-prestacion-nacimiento/';

export const metadata: Metadata = {
  title: 'Permiso y prestación por nacimiento 2026: semanas y cuantía | Delegum',
  description:
    'Semanas del permiso por nacimiento y cuidado del menor (19/32, RDL 9/2025), prestación del 100%, requisitos de cotización y deducción por maternidad, con fuente oficial. Verificado el ' +
    FISCAL_MATERNIDAD_META.verificado + '.',
  keywords:
    'permiso por nacimiento 2026, baja maternal semanas, baja paternidad, RDL 9/2025, 19 semanas, familia monoparental 32 semanas, prestación nacimiento, deducción por maternidad, 1200 euros maternidad, cuidado del menor',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Permiso y prestación por nacimiento 2026: semanas y cuantía',
    description:
      'Semanas del permiso por nacimiento (19/32, RDL 9/2025), prestación del 100%, requisitos de cotización y deducción por maternidad, con fuente oficial.',
    url: URL_CANONICA,
    siteName: 'Delegum',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Permiso y prestación por nacimiento 2026',
    description:
      'Semanas del permiso por nacimiento, prestación del 100% y deducción por maternidad, con fuente oficial.',
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
  name: 'Permiso y prestación por nacimiento en España 2026',
  description:
    'Semanas del permiso por nacimiento y cuidado del menor en familias biparentales y monoparentales (RDL 9/2025), ampliaciones, prestación económica de la Seguridad Social y deducción por maternidad en el IRPF.',
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
  isBasedOn: FISCAL_MATERNIDAD_META.urlOficial,
  dateModified: FISCAL_MATERNIDAD_META.verificado,
  temporalCoverage: FISCAL_MATERNIDAD_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: [
    'Semanas de permiso por nacimiento',
    'Prestación (% base reguladora)',
    'Deducción por maternidad (€)',
  ],
  keywords: ['permiso por nacimiento', 'baja maternal', 'baja paternidad', 'deducción por maternidad', 'RDL 9/2025'],
};

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas semanas de permiso por nacimiento hay en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Desde el RDL 9/2025 (en vigor el 31 de julio de 2025), cada progenitor tiene 19 semanas de permiso en familias biparentales, de las cuales 6 son obligatorias e ininterrumpidas tras el parto. En familias monoparentales, el único progenitor dispone de 32 semanas. El resto de semanas se pueden disfrutar de forma flexible hasta que el menor cumple 12 meses.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se cobra durante el permiso por nacimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La prestación por nacimiento es el 100% de la base reguladora, que equivale a la base de cotización del mes anterior dividida entre 30. Está exenta de IRPF, por lo que no se declara. Si no se cumple el periodo mínimo de cotización, existe una prestación no contributiva del 100% del IPREM durante 42 días.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué requisitos de cotización se exigen para cobrar la prestación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la edad: los menores de 21 años no necesitan periodo mínimo de cotización; entre 21 y 25 años se exigen 90 días cotizados en los últimos 7 años (o 180 en toda la vida laboral); y a partir de 26 años, 180 días en los últimos 7 años (o 360 en total).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la deducción por maternidad en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una deducción de 1.200 € al año (100 € al mes) por cada hijo menor de 3 años, para madres trabajadoras dadas de alta en la Seguridad Social o mutualidad. Se puede ampliar hasta 1.000 € adicionales por gastos de guardería o centro de educación infantil autorizado, y se puede cobrar de forma anticipada con el Modelo 140.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede ampliar el permiso por nacimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Se amplía una semana por progenitor por cada hijo adicional en parto múltiple, dos semanas por discapacidad del recién nacido, hasta 13 semanas adicionales por parto prematuro u hospitalización neonatal, y hasta 2 semanas por adopción internacional. Estas ampliaciones se suman a las semanas ordinarias.',
      },
    },
  ],
};
