import { Metadata } from 'next';
import { CALENDARIO_FISCAL, FISCAL_CALENDARIO_META } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/calendario-fiscal/';

export const metadata: Metadata = {
  title: 'Calendario fiscal de España: plazos de los modelos | Delegum',
  description:
    'Plazos recurrentes de los modelos tributarios trimestrales y anuales (303, 130, 111, 115, 349, 200…), la campaña de la Renta y el Impuesto de Sociedades, con fuente oficial. Verificado el ' +
    FISCAL_CALENDARIO_META.verificado + '.',
  keywords:
    'calendario fiscal, plazos modelo 303, plazos modelo 130, calendario del contribuyente, fechas declaraciones trimestrales, modelo 111, modelo 200, modelo 714, declaración de patrimonio plazo, campaña de la renta, impuesto de sociedades plazo, calendario AEAT',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Calendario fiscal de España: plazos de los modelos',
    description:
      'Plazos recurrentes de los modelos trimestrales y anuales, la Renta y el Impuesto de Sociedades, con fuente oficial.',
    url: URL_CANONICA,
    siteName: 'Delegum',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Calendario fiscal de España: plazos de los modelos',
    description:
      'Plazos recurrentes de los modelos trimestrales y anuales, la Renta y el Impuesto de Sociedades, con fuente oficial.',
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
  name: 'Calendario fiscal de España: plazos de los modelos tributarios',
  description:
    'Plazos recurrentes de presentación de los modelos tributarios en España (trimestrales, resúmenes anuales, Renta e Impuesto de Sociedades), con el perfil al que aplican.',
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
  isBasedOn: FISCAL_CALENDARIO_META.urlOficial,
  dateModified: FISCAL_CALENDARIO_META.verificado,
  temporalCoverage: FISCAL_CALENDARIO_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: ['Modelo tributario', 'Periodicidad', 'Plazo de presentación'],
  keywords: CALENDARIO_FISCAL.map((m) => `modelo ${m.modelo}`),
};

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo se presenta el modelo 303 del IVA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo 303 de IVA es trimestral: el primer trimestre hasta el 20 de abril, el segundo hasta el 20 de julio, el tercero hasta el 20 de octubre y el cuarto hasta el 30 de enero del año siguiente. Si el último día cae en fin de semana o festivo, el plazo se traslada al siguiente día hábil.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué declaraciones trimestrales tiene que presentar un autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lo habitual es el modelo 303 (IVA) y el 130 (pago fraccionado del IRPF en estimación directa) o el 131 (en módulos). Si tiene trabajadores o paga a profesionales con retención, también el 111; si paga alquiler de local con retención, el 115. Todos se presentan, con carácter general, hasta el día 20 del mes siguiente a cada trimestre.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo es la campaña de la Renta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La campaña de la Renta (modelo 100) se desarrolla cada año, aproximadamente, de principios de abril a finales de junio. Las fechas exactas (inicio, fin y plazo para domiciliar el pago) las publica la Agencia Tributaria al comienzo de cada ejercicio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se presenta el Impuesto de Sociedades?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La declaración anual (modelo 200) se presenta en los 25 días naturales siguientes a los 6 meses desde el cierre del ejercicio; para un ejercicio que coincide con el año natural, hasta el 25 de julio. Además, las sociedades con cuota positiva el año anterior realizan tres pagos fraccionados (modelo 202) en abril, octubre y diciembre.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si un plazo fiscal cae en fin de semana o festivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando el último día del plazo es inhábil (sábado, domingo o festivo), la presentación se traslada al siguiente día hábil. Conviene tener en cuenta que la domiciliación bancaria del pago suele cerrarse unos días antes del fin del plazo, por lo que no se puede apurar hasta el último día si se quiere domiciliar.',
      },
    },
  ],
};
