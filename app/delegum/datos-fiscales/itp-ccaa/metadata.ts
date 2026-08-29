import { Metadata } from 'next';
import { TIPOS_ITP_CCAA_2025, FISCAL_INMUEBLES_META } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/itp-ccaa/';

export const metadata: Metadata = {
  title: 'Tipos de ITP por comunidad autónoma 2025-2026 | Delegum',
  description:
    'Tabla actualizada de los tipos del Impuesto de Transmisiones Patrimoniales (ITP) en la compra de vivienda usada, comunidad por comunidad, con tipos reducidos y fuente oficial. Verificado el ' +
    FISCAL_INMUEBLES_META.verificado + '.',
  keywords:
    'ITP por comunidad autónoma, tipo ITP 2025, tipo ITP 2026, impuesto transmisiones patrimoniales, ITP vivienda usada, ITP reducido jóvenes, ITP Madrid, ITP Cataluña, ITP Valencia, ITP Andalucía',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Tipos de ITP por comunidad autónoma 2025-2026',
    description:
      'Tabla actualizada del Impuesto de Transmisiones Patrimoniales (ITP) por comunidad autónoma, con tipos generales, reducidos y fuente oficial.',
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
    title: 'Tipos de ITP por comunidad autónoma 2025-2026',
    description:
      'Tabla actualizada del ITP en la compra de vivienda usada, comunidad por comunidad, con fuente oficial.',
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
  name: 'Tipos de ITP por comunidad autónoma (España) 2025-2026',
  description:
    'Tipos del Impuesto de Transmisiones Patrimoniales (ITP) aplicables a la compra de vivienda de segunda mano en cada comunidad autónoma española, incluyendo tipos generales y reducidos para colectivos específicos.',
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
  isBasedOn: FISCAL_INMUEBLES_META.urlOficialITP,
  dateModified: FISCAL_INMUEBLES_META.verificado,
  temporalCoverage: FISCAL_INMUEBLES_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: ['Tipo general ITP (%)', 'Tipo reducido ITP (%)'],
  keywords: TIPOS_ITP_CCAA_2025.map((t) => `ITP ${t.ccaa}`),
};

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el ITP y cuándo se paga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Impuesto de Transmisiones Patrimoniales (ITP) grava la compra de vivienda de segunda mano (entre particulares). Lo paga el comprador sobre el valor de referencia o el precio de compra, el que sea mayor, y se liquida en la comunidad autónoma donde está el inmueble. La vivienda nueva no tributa por ITP, sino por IVA (10%) más AJD.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el tipo de ITP en cada comunidad autónoma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tipo general del ITP oscila entre el 4% del País Vasco y el 10-13% de Cataluña o Baleares. Comunidades como Madrid (6%) o Canarias (6,5%) están entre las más bajas; la media orientativa nacional ronda el 8%. La mayoría de comunidades aplican tipos reducidos para jóvenes, familias numerosas o personas con discapacidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Quién tiene derecho a un tipo reducido de ITP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los colectivos más habituales con tipo reducido son los jóvenes (normalmente menores de 35 o 36 años en su primera vivienda habitual), las familias numerosas o monoparentales y las personas con discapacidad. Casi siempre hay un límite de valor del inmueble. Las condiciones exactas varían en cada comunidad autónoma.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Sobre qué importe se calcula el ITP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Desde 2022 el ITP se calcula sobre el valor de referencia de Catastro o el precio de compra, el que sea mayor. Si el valor de referencia es superior al precio pactado, Hacienda puede exigir el impuesto sobre ese valor de referencia, salvo que se recurra justificando el valor real del inmueble.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cada cuánto cambian los tipos de ITP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada comunidad autónoma puede modificar sus tipos en cualquier momento, normalmente con las leyes de presupuestos o medidas fiscales anuales. En 2025-2026 hubo cambios relevantes, como la rebaja de Murcia al 7,75% (Ley 3/2025) y la de la Comunidad Valenciana al 9% desde junio de 2026. Conviene confirmar siempre el tipo vigente en la hacienda autonómica.',
      },
    },
  ],
};
