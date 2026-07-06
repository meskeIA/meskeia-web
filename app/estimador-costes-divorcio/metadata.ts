import { Metadata } from 'next';

const title = 'Estimador de Costes de Divorcio 2026 — Cuánto cuesta divorciarse en España | meskeIA';
const description = 'Cuánto cuesta divorciarse en España en 2026: estima el precio orientativo del divorcio según el tipo (mutuo acuerdo vs contencioso), con el desglose de honorarios de abogado y procurador, tarifa notarial, registro y tasas judiciales. Con o sin hijos y con bienes comunes.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'cuanto cuesta divorciarse en españa, precio divorcio españa, precio abogado divorcio, coste divorcio mutuo acuerdo vs contencioso, coste divorcio juzgado, honorarios abogado y procurador divorcio, tarifa notarial divorcio, coste divorcio notarial, tasas judiciales divorcio, coste divorcio con hijos, gastos divorcio 2026',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Costes de Divorcio 2026 | meskeIA',
    description,
    url: 'https://meskeia.com/estimador-costes-divorcio/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estimador de Costes de Divorcio 2026 | meskeIA',
    description: 'Calcula cuánto cuesta divorciarse en España: mutuo acuerdo vs contencioso',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Estimador de Costes de Divorcio 2026',
  description,
  url: 'https://meskeia.com/estimador-costes-divorcio/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta un divorcio en España en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El precio de un divorcio en España depende sobre todo de si es de mutuo acuerdo o contencioso. Un divorcio de mutuo acuerdo sin hijos ni bienes suele costar entre 600 y 1.500 € (abogado y procurador, o notaría si es extrajudicial), al compartirse un único abogado. Un divorcio contencioso es mucho más caro: cada cónyuge paga su propio abogado y procurador, con un coste por parte que suele ir de 2.000 a 12.000 € o más según los bienes y la disputa por los hijos. Las personas físicas están exentas de tasas judiciales desde 2015.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia de coste hay entre un divorcio de mutuo acuerdo y uno contencioso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el divorcio de mutuo acuerdo ambos comparten un solo abogado y un solo procurador, por lo que el coste total suele quedar entre 750 y 3.750 €. En el contencioso no hay acuerdo y decide el juez: cada parte contrata su propio abogado y procurador, de forma que el gasto se duplica y el coste total familiar puede superar fácilmente los 4.000-20.000 €. Además el contencioso dura más (de 6 meses a varios años), lo que encarece los honorarios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cobra un abogado por un divorcio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los honorarios del abogado son la partida principal del divorcio. En un mutuo acuerdo sin bienes rondan los 500-1.500 €, y aumentan si hay hijos o patrimonio que repartir. En un divorcio contencioso el abogado suele cobrar entre 1.500 y 6.000 € por cónyuge, o más si hay bienes complejos o peritajes. Los aranceles del procurador (unos 250-800 €) se suman aparte. Si tus ingresos están por debajo del límite IPREM puedes solicitar justicia gratuita y no pagar abogado ni procurador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta un divorcio notarial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El divorcio notarial (Ley 15/2015) es la vía más rápida y económica, pero solo es posible cuando no hay hijos menores ni personas con discapacidad a cargo. El coste total ronda los 650-2.550 €: incluye un único abogado para ambos cónyuges, la tarifa notarial de la escritura (unos 150-250 € según el patrimonio) y la inscripción en el Registro Civil (unos 50 €). No hay procurador ni tasas judiciales. La escritura notarial tiene la misma validez que una sentencia de divorcio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tarda en tramitarse un divorcio en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un divorcio de mutuo acuerdo ante notario puede resolverse en pocas semanas; ante el juzgado, en 2-6 meses dependiendo de la carga del tribunal. Un divorcio contencioso puede durar entre 1 y 3 años si hay recursos o conflictos sobre hijos y bienes. El plazo legal mínimo para poder solicitar el divorcio es de 3 meses desde la celebración del matrimonio, salvo riesgo para alguno de los cónyuges o los hijos.',
      },
    },
  ],
};
