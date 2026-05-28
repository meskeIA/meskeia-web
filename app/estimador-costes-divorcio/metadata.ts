import { Metadata } from 'next';

const title = 'Estimador de Costes de Divorcio 2026 — Cuánto cuesta divorciarse en España | meskeIA';
const description = 'Estima el coste orientativo de un divorcio en España según el tipo (mutuo acuerdo o contencioso): abogado, procurador, notario, registro y tasas. Con o sin hijos, bienes comunes.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'cuanto cuesta divorciarse españa, coste divorcio mutuo acuerdo, precio divorcio contencioso, abogado divorcio precio, divorcio notarial coste, gastos divorcio 2026',
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
      name: '¿Cuánto cuesta divorciarse en España en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste de un divorcio en España depende principalmente de si es de mutuo acuerdo o contencioso. Un divorcio de mutuo acuerdo sin hijos ni bienes puede costar entre 400-900 € (abogado + notaría si es extrajudicial). Con contencioso, los honorarios del abogado pueden oscilar entre 1.500-6.000 € o más, a los que se suman los aranceles del procurador y, en su caso, los gastos de perito tasador si hay bienes comunes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre divorcio de mutuo acuerdo y contencioso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el divorcio de mutuo acuerdo ambas partes se ponen de acuerdo en todas las condiciones (custodia, pensiones, reparto de bienes) y presentan un convenio regulador ante el juzgado o ante notario. Es más rápido y económico. El divorcio contencioso ocurre cuando no hay acuerdo y un juez decide: implica mayor litigiosidad, plazos más largos y costes significativamente más elevados para ambas partes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede divorciar sin abogado en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. En España, aunque el divorcio sea de mutuo acuerdo, la ley exige que cada cónyuge cuente con su propio abogado si hay hijos menores. Cuando no hay hijos menores ni bienes que repartir, es posible el divorcio notarial con un solo abogado para ambos, lo que abarata el proceso. En cualquier caso, la asistencia letrada es obligatoria en todos los procedimientos de divorcio judicial.',
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
    {
      '@type': 'Question',
      name: '¿Quién paga las costas en un divorcio contencioso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En los procedimientos de divorcio contencioso los jueces suelen no imponer costas a ninguna de las partes, ya que se entiende que el conflicto familiar no tiene "ganador" estricto. Cada parte asume sus propios gastos de abogado y procurador. No obstante, si una parte actúa con temeridad procesal o mala fe, el tribunal puede condenarla en costas de manera excepcional.',
      },
    },
  ],
};
