import { Metadata } from 'next';
import { COSTAS_JUDICIALES_META } from '@/data/fiscal';
import { PREGUNTAS_FRECUENTES } from './faq';

// Año del título: el último de la vigencia del módulo («2025-2026» → 2026). Sale del dato
// y no se escribe a mano (lo exige check:anio-titulo).
const anio = COSTAS_JUDICIALES_META.vigencia.slice(-4);

const title = `Estimador de Costes de Divorcio ${anio} — Cuánto cuesta divorciarse en España | meskeIA`;
const description = `Cuánto cuesta divorciarse en España en ${anio}: estima el precio orientativo del divorcio según el tipo (mutuo acuerdo vs contencioso), con los honorarios de abogado, el máximo del arancel del procurador (RD 434/2024), el arancel notarial y las tasas judiciales. Con o sin hijos y con bienes comunes.`;

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
    title: `Estimador de Costes de Divorcio ${anio} | meskeIA`,
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
    title: `Estimador de Costes de Divorcio ${anio} | meskeIA`,
    description: 'Calcula cuánto cuesta divorciarse en España: mutuo acuerdo vs contencioso',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: `Estimador de Costes de Divorcio ${anio}`,
  description,
  url: 'https://meskeia.com/estimador-costes-divorcio/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};

// Las preguntas y respuestas son las MISMAS que la FAQ visible, con las cifras del motor
// (hallazgo 2799: el FAQPage daba duraciones y precios que la app no calculaba).
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((p) => ({
    '@type': 'Question',
    name: p.pregunta,
    acceptedAnswer: { '@type': 'Answer', text: p.respuesta },
  })),
};
