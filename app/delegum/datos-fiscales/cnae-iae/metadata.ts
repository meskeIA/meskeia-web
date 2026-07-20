import { Metadata } from 'next';
import { FISCAL_CNAE_IAE_META } from '@/data/fiscal';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/cnae-iae/';

export const metadata: Metadata = {
  title: 'CNAE-2025 y epígrafes del IAE: qué código declara cada organismo | Delegum',
  description:
    'Diferencia entre CNAE (INE, estadística) e IAE (AEAT, tributaria), las tres secciones del IAE y su retención de IRPF, exención por cifra de negocio y vigencia de la CNAE-2025. Verificado el ' +
    FISCAL_CNAE_IAE_META.verificado + '.',
  keywords:
    'CNAE 2025, epígrafes IAE, diferencia CNAE IAE, secciones IAE, retención IRPF profesional 15%, retención 7% nuevos autónomos, exención IAE cifra de negocio, modelo 036 epígrafe, CNAE-2009 CNAE-2025, código actividad autónomo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'article',
    title: 'CNAE-2025 y epígrafes del IAE: qué código declara cada organismo',
    description:
      'Diferencia entre CNAE e IAE, secciones del IAE y retención de IRPF, exención por cifra de negocio y vigencia de la CNAE-2025, con fuente oficial.',
    url: URL_CANONICA,
    siteName: 'Delegum',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'CNAE-2025 y epígrafes del IAE: qué código declara cada organismo',
    description:
      'CNAE (INE) frente a IAE (AEAT), secciones del IAE y retención de IRPF, y exención por cifra de negocio.',
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

// Dataset JSON-LD — señal estructurada para que las IAs citen estos datos como fuente
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Clasificaciones de actividad económica en España: CNAE-2025 e IAE',
  description:
    'Datos de referencia de las clasificaciones de actividad económica en España: organismo y finalidad de la CNAE-2025 (INE) y de las Tarifas del IAE (AEAT), secciones del IAE con su retención de IRPF, exención del IAE por cifra de negocio y vigencia de la CNAE-2025 frente a la CNAE-2009.',
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
  isBasedOn: [FISCAL_CNAE_IAE_META.iae.urlOficial, FISCAL_CNAE_IAE_META.cnae.urlOficial],
  dateModified: FISCAL_CNAE_IAE_META.verificado,
  temporalCoverage: FISCAL_CNAE_IAE_META.vigencia,
  spatialCoverage: { '@type': 'Place', name: 'España' },
  variableMeasured: [
    'Secciones del IAE (1ª empresarial, 2ª profesional, 3ª artística)',
    'Retención de IRPF por sección del IAE (%)',
    'Umbral de exención del IAE por cifra neta de negocio (€)',
    'Clasificación CNAE vigente y norma que la aprueba',
  ],
  keywords: ['CNAE-2025', 'IAE', 'epígrafes IAE', 'retención IRPF', 'modelo 036'],
};

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el CNAE y el IAE?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La CNAE es la clasificación del INE y tiene finalidad estadística: se comunica a la Seguridad Social y figura en registros mercantiles y estadísticos. El epígrafe del IAE es de la AEAT y tiene finalidad tributaria: se declara en el alta censal (modelo 036 o 037) y de él dependen las obligaciones fiscales de la actividad, empezando por la retención de IRPF. No son intercambiables: quien se da de alta acaba declarando ambos códigos ante organismos distintos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tengo que pagar el IAE siendo autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Las personas físicas están exentas del pago del IAE cualquiera que sea su cifra de negocio, y también lo están las entidades con una cifra neta de negocio inferior a un millón de euros y quienes inician actividad durante los dos primeros períodos impositivos (art. 82.1.c del RDL 2/2004). Ahora bien, estar exento del pago no exime de declarar el epígrafe en el alta censal: la exención alcanza a la cuota, no a la obligación censal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Mi código CNAE-2009 sigue siendo válido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La CNAE-2025, aprobada por el RD 10/2025, sustituye a la CNAE-2009 (RD 475/2007) y es la clasificación operativa desde enero de 2026. Un código CNAE-2009 anotado en un trámite anterior no queda sin valor: el INE publica la tabla oficial de correspondencia entre ambas versiones, con la que se traduce al código equivalente de la CNAE-2025.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo llevan retención de IRPF mis facturas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la sección del IAE en la que esté el epígrafe. Las actividades empresariales (sección 1ª) no llevan retención con carácter general. Las profesionales (sección 2ª) sí la llevan cuando se factura a empresas y a otros profesionales: 15% con carácter general y 7% durante el año de inicio de la actividad y los dos siguientes. Las artísticas (sección 3ª) reciben un tratamiento análogo al profesional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Dónde se declara cada código de actividad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El epígrafe del IAE se declara ante la AEAT en el alta censal, con el modelo 036 o el 037. El código CNAE se comunica a la Seguridad Social al darse de alta y se emplea en registros estadísticos y mercantiles. No existe una tabla oficial de equivalencia entre ambas clasificaciones, de modo que cualquier conversión automática entre CNAE e IAE es una aproximación basada en un criterio propio, no un dato oficial.',
      },
    },
  ],
};
