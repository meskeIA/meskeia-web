import { Metadata } from 'next';
import { FISCAL_IVA_META, TIPOS_IVA } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/iva-tipos/';

export const metadata: Metadata = {
  title: 'Tipos de IVA en España 2025-2026 | Delegum',
  description:
    'Tipos de IVA en España: general (21%), reducido (10%) y superreducido (4%), con ejemplos de a qué se aplican, operaciones exentas y recargo de equivalencia. Verificado el ' +
    FISCAL_IVA_META.verificado + '.',
  keywords:
    'tipos de IVA 2025, IVA general 21%, IVA reducido 10%, IVA superreducido 4%, IVA España, recargo de equivalencia, operaciones exentas IVA, qué IVA aplicar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Tipos de IVA en España 2025-2026',
    description:
      'IVA general (21%), reducido (10%) y superreducido (4%) con ejemplos, exenciones y recargo de equivalencia.',
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
    title: 'Tipos de IVA en España 2025-2026',
    description: 'General 21%, reducido 10% y superreducido 4%, con ejemplos y exenciones.',
    images: ['https://delegum.com/delegum/og-image.png'],
  },
  alternates: { canonical: URL_CANONICA },
  icons: {
    icon: [
      { url: '/delegum/favicon.svg', type: 'image/svg+xml' },
      { url: '/delegum/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/delegum/app-icon-180.png',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Tipos de IVA en España 2025-2026',
  description:
    'Tipos impositivos del IVA en España (general 21%, reducido 10%, superreducido 4%), operaciones exentas y recargo de equivalencia.',
  url: URL_CANONICA,
  license: 'https://delegum.com/aviso-legal',
  creator: { '@type': 'Organization', name: 'Delegum', url: 'https://delegum.com/' },
  publisher: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com/' },
  isBasedOn: FISCAL_IVA_META.urlOficial,
  dateModified: FISCAL_IVA_META.verificado,
  temporalCoverage: FISCAL_IVA_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: ['Tipo de IVA (%)'],
  keywords: TIPOS_IVA.map((t) => `IVA ${t.porcentaje}%`),
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los tipos de IVA en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España hay tres tipos de IVA: el general del 21% (mayoría de bienes y servicios), el reducido del 10% (hostelería, transporte de viajeros, vivienda nueva, alimentos en general) y el superreducido del 4% (pan, leche, huevos, frutas y verduras, libros, medicamentos y viviendas de protección oficial).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué productos tienen el IVA superreducido del 4%?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El IVA superreducido del 4% se aplica a bienes de primera necesidad: pan común, leche, huevos, frutas, verduras, legumbres y tubérculos naturales; libros, periódicos y revistas; medicamentos de uso humano; prótesis y vehículos para personas con discapacidad; y viviendas de protección oficial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué operaciones están exentas de IVA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El artículo 20 de la Ley del IVA exime, entre otras, la sanidad, la educación reglada, las operaciones financieras y de seguros, el alquiler de vivienda habitual y los servicios postales universales. La exención significa que no se repercute IVA, pero normalmente tampoco se puede deducir el IVA soportado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El IVA es igual en Canarias, Ceuta y Melilla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El IVA solo se aplica en la península y Baleares. Canarias tiene su propio impuesto, el IGIC (Impuesto General Indirecto Canario), con tipos más bajos; y Ceuta y Melilla aplican el IPSI (Impuesto sobre la Producción, los Servicios y la Importación).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el recargo de equivalencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es un régimen especial obligatorio para comerciantes minoristas (personas físicas) que venden a consumidor final. El proveedor les repercute, además del IVA, un recargo: 5,2% sobre el 21%, 1,4% sobre el 10% y 0,5% sobre el 4%. A cambio, el comerciante no presenta declaraciones de IVA.',
      },
    },
  ],
};
