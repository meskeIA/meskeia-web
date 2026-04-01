import { Metadata } from 'next';

const title = 'Test de Bienestar WHO-5 — Índice de Bienestar de la OMS | meskeIA';
const description = 'Escala WHO-5 de la Organización Mundial de la Salud: 5 preguntas para evaluar tu bienestar subjetivo en las últimas 2 semanas. Gratuito, validado y con recursos de ayuda.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'test bienestar WHO-5, escala bienestar OMS, indice bienestar subjetivo, como estoy emocionalmente, test bienestar emocional, WHO-5 español, evaluacion bienestar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Bienestar WHO-5 | meskeIA',
    description,
    url: 'https://meskeia.com/test-bienestar-who5/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test de Bienestar WHO-5 | meskeIA',
    description: 'Escala de bienestar de la OMS: 5 preguntas, 2 minutos, con recursos de ayuda',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Test de Bienestar WHO-5',
  description,
  url: 'https://meskeia.com/test-bienestar-who5/',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};
