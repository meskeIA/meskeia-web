import { Metadata } from 'next';

const title = 'Estimador de Costas Judiciales 2026 — Cuánto cuesta un juicio en España | meskeIA';
const description = 'Estima el coste orientativo de un procedimiento judicial en España: honorarios de abogado, aranceles de procurador, tasas judiciales y peritos. Por tipo de procedimiento y cuantía.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'costas judiciales españa, cuanto cuesta un juicio, honorarios abogado juicio, aranceles procurador, tasas judiciales, coste procedimiento judicial, costas procesales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Costas Judiciales 2026 | meskeIA',
    description,
    url: 'https://meskeia.com/estimador-costas-judiciales/',
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
    title: 'Estimador de Costas Judiciales 2026 | meskeIA',
    description: 'Calcula cuánto puede costar un juicio en España: abogado, procurador, tasas y peritos',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Estimador de Costas Judiciales 2026',
  description,
  url: 'https://meskeia.com/estimador-costas-judiciales/',
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
      name: '¿Cuánto cuesta un juicio en España en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste total de un juicio en España varía enormemente según el tipo de procedimiento y la cuantía reclamada. Un juicio verbal sencillo puede rondar los 600-1.500 €, mientras que un juicio ordinario complejo puede superar los 5.000-10.000 €. Los principales conceptos son los honorarios del abogado, los aranceles del procurador (obligatorio en muchos procedimientos), las tasas judiciales y, en su caso, los honorarios de peritos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las costas judiciales y quién las paga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las costas judiciales son los gastos generados por el proceso judicial: honorarios de abogado, aranceles de procurador, tasas, peritos y otros desembolsos. En España, el principio general es que el juez condena en costas a la parte que pierde el juicio (art. 394 LEC). Sin embargo, si el tribunal aprecia dudas de hecho o de derecho, puede no imponer costas a ninguna de las partes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo es obligatorio el procurador en un juicio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España, el procurador es obligatorio en la mayoría de los procedimientos ante los juzgados de primera instancia, audiencias provinciales y tribunales superiores. No es necesario en juicios verbales con cuantía inferior a 2.000 € ni en determinados procedimientos administrativos y laborales. Sus aranceles están regulados por el Real Decreto 1373/2003 y se calculan en función de la cuantía del asunto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Existe alguna manera de reducir el coste de un juicio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Si no superas el umbral de ingresos establecido (vinculado al IPREM), puedes solicitar el beneficio de justicia gratuita, que cubre abogado y procurador de oficio sin coste. Además, muchos conflictos pueden resolverse mediante mediación o arbitraje, que suelen ser más económicos y rápidos que la vía judicial. En reclamaciones de cantidad inferiores a 6.000 € tampoco hay tasas judiciales para personas físicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las tasas judiciales afectan a las personas físicas en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Desde la reforma de 2015, las personas físicas están exentas del pago de tasas judiciales en todos los órdenes jurisdiccionales. Las tasas judiciales solo las pagan las personas jurídicas (empresas, asociaciones, etc.) en determinados procedimientos civiles y contencioso-administrativos, con cuotas que oscilan entre 150 € y varios miles según el tipo de recurso y la cuantía.',
      },
    },
  ],
};
