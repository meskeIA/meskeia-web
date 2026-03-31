import { Metadata } from 'next';

const title = 'Quiz de Conceptos Financieros — ¿Cuánto sabes de dinero? | meskeIA';
const description = 'Test educativo de 15 preguntas sobre conceptos financieros básicos: ahorro, interés, inflación, inversión, deuda y presupuesto. Aprende mientras juegas.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'quiz financiero, test educacion financiera, conceptos financieros basicos, aprender finanzas, inflacion que es, interes compuesto explicado, presupuesto basico',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz de Conceptos Financieros | meskeIA',
    description,
    url: 'https://meskeia.com/quiz-conceptos-financieros/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quiz de Conceptos Financieros | meskeIA',
    description: '¿Cuánto sabes de dinero? Test de 15 preguntas con explicaciones',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Quiz de Conceptos Financieros',
  description,
  url: 'https://meskeia.com/quiz-conceptos-financieros/',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};
