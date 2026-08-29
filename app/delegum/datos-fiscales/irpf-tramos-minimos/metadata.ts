import { Metadata } from 'next';
import { FISCAL_IRPF_META, TRAMOS_IRPF_2025 } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/irpf-tramos-minimos/';

export const metadata: Metadata = {
  title: 'Tramos y mínimos del IRPF 2025 | Delegum',
  description:
    'Escala general del IRPF 2025 por tramos, escala del ahorro y mínimos personales y familiares (personal, por edad, por hijos, ascendientes y discapacidad), con fuente oficial. Verificado el ' +
    FISCAL_IRPF_META.verificado + '.',
  keywords:
    'tramos IRPF 2025, escala IRPF, tipos IRPF, mínimo personal IRPF, mínimo por hijos, base del ahorro IRPF, tipo marginal IRPF, retención IRPF, declaración renta 2025',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Tramos y mínimos del IRPF 2025',
    description:
      'Escala general por tramos, escala del ahorro y mínimos personales y familiares del IRPF 2025, con fuente oficial.',
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
    title: 'Tramos y mínimos del IRPF 2025',
    description:
      'Escala general, escala del ahorro y mínimos personales y familiares del IRPF 2025, con fuente oficial.',
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
  name: 'Tramos y mínimos del IRPF (España) 2025',
  description:
    'Escala general del IRPF por tramos, escala del ahorro y mínimos personales y familiares aplicables en España en el ejercicio 2025.',
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
  isBasedOn: FISCAL_IRPF_META.urlOficial,
  dateModified: FISCAL_IRPF_META.verificado,
  temporalCoverage: FISCAL_IRPF_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: ['Tipo IRPF por tramo (%)', 'Mínimo personal y familiar (€)'],
  keywords: TRAMOS_IRPF_2025.map((t) => `IRPF ${t.tipo}%`),
};

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos tramos tiene el IRPF en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La escala general del IRPF tiene seis tramos en 2025: 19% hasta 12.450 €, 24% hasta 20.200 €, 30% hasta 35.200 €, 37% hasta 60.000 €, 45% hasta 300.000 € y 47% a partir de ahí. Son tipos orientativos que suman la parte estatal y un tipo autonómico medio; cada comunidad autónoma fija su propia escala autonómica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la base general y la base del ahorro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La base general incluye el salario, los rendimientos de actividades económicas y los alquileres, y tributa según la escala general progresiva (19% a 47%). La base del ahorro incluye intereses, dividendos y ganancias por venta de bienes, y tributa con una escala propia más baja: 19% hasta 6.000 €, 21% hasta 50.000 €, 23% hasta 200.000 €, 27% hasta 300.000 € y 30% por encima.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el mínimo personal y familiar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es la parte de la renta que no tributa porque se destina a cubrir las necesidades básicas del contribuyente y su familia. En 2025 el mínimo personal general es de 5.550 € y aumenta por edad (6.700 € a partir de 65 años), por descendientes, por ascendientes a cargo y por discapacidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El IRPF es igual en toda España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El IRPF se reparte entre el Estado y la comunidad autónoma de residencia. La parte estatal es común, pero cada comunidad aprueba su propia escala autonómica y puede ajustar mínimos y deducciones. Por eso, para una misma renta, el impuesto final varía según dónde residas. Las cifras de esta ficha usan un tipo autonómico medio orientativo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa el tipo marginal del IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tipo marginal es el porcentaje que se aplica al último euro ganado, es decir, el tramo más alto que alcanza tu base. No es el porcentaje que pagas sobre toda tu renta: como la escala es progresiva, cada tramo tributa a su tipo y el tipo medio efectivo siempre es inferior al marginal.',
      },
    },
  ],
};
