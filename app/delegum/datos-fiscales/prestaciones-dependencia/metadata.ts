import { Metadata } from 'next';
import { FISCAL_DEPENDENCIA_META } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/prestaciones-dependencia/';

export const metadata: Metadata = {
  title: 'Prestaciones por dependencia (SAAD): grados y cuantías | Delegum',
  description:
    'Grados de dependencia, cuantías de las prestaciones económicas SAAD por grado, cotización del cuidador no profesional y deducciones IRPF por discapacidad, con fuente oficial. Verificado el ' +
    FISCAL_DEPENDENCIA_META.verificado + '.',
  keywords:
    'prestaciones dependencia, grados de dependencia, SAAD, PEVS, PECEF, asistencia personal, cuantía dependencia 2025, cuidador no profesional cotización, Ley 39/2006, deducción discapacidad IRPF',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'Prestaciones por dependencia (SAAD): grados y cuantías',
    description:
      'Grados de dependencia, cuantías de las prestaciones SAAD por grado, cotización del cuidador y deducciones IRPF por discapacidad, con fuente oficial.',
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
    title: 'Prestaciones por dependencia (SAAD): grados y cuantías',
    description:
      'Grados de dependencia, cuantías SAAD por grado y cotización del cuidador no profesional, con fuente oficial.',
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
  name: 'Prestaciones por dependencia (SAAD) en España',
  description:
    'Grados de dependencia (Ley 39/2006), cuantías máximas de las prestaciones económicas del SAAD (PEVS, PECEF y asistencia personal) por grado, cotización del cuidador no profesional y deducciones por discapacidad en el IRPF.',
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
  isBasedOn: FISCAL_DEPENDENCIA_META.urlOficial,
  dateModified: FISCAL_DEPENDENCIA_META.verificado,
  temporalCoverage: FISCAL_DEPENDENCIA_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: [
    'Grado de dependencia',
    'Cuantía máxima prestación SAAD (€/mes)',
    'Cotización del cuidador (€/mes)',
  ],
  keywords: ['prestaciones por dependencia', 'SAAD', 'grados de dependencia', 'PEVS', 'PECEF'],
};

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué grados de dependencia existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Ley 39/2006 reconoce tres grados según la puntuación del baremo de valoración (BVD): Grado I o dependencia moderada (25 a 49 puntos), Grado II o dependencia severa (50 a 74) y Grado III o gran dependencia (75 a 100). A mayor grado, mayor intensidad de los servicios y mayores cuantías de las prestaciones económicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se cobra por cuidar a un familiar dependiente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La prestación económica para cuidados en el entorno familiar (PECEF) tiene una cuantía máxima estatal de 153 €/mes en Grado I, 286,66 €/mes en Grado II y 449,77 €/mes en Grado III. Son importes máximos: el copago según la capacidad económica del beneficiario puede reducirlos, y algunas comunidades los complementan.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre PEVS, PECEF y asistencia personal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La PEVS (prestación vinculada a servicio) sirve para pagar un servicio privado acreditado cuando no hay plaza pública; la PECEF retribuye al cuidador familiar no profesional; y la prestación de asistencia personal (solo Grado III) financia un asistente que facilite la vida autónoma. Todas son económicas pero con finalidad y cuantía distintas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cotiza a la Seguridad Social el cuidador familiar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El cuidador no profesional puede darse de alta en la Seguridad Social mediante un convenio especial, y desde 2023 el Estado abona el 100% de la cotización. Así el cuidador queda protegido frente a jubilación, incapacidad temporal y muerte y supervivencia sin coste para la familia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué deducciones de IRPF hay por discapacidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El IRPF aplica un mínimo por discapacidad que reduce la base imponible: 3.000 € con un grado del 33% al 64% y 9.000 € con un grado igual o superior al 65%. Se suma otro mínimo de 3.000 € por gastos de asistencia si se acredita necesidad de ayuda de terceros o movilidad reducida. Existen importes equivalentes por ascendientes o descendientes con discapacidad a cargo.',
      },
    },
  ],
};
