import { Metadata } from 'next';

const title = '¿Cuánto tardo en ahorrar? — Calculadora de objetivos de ahorro | meskeIA';
const description = 'Calcula cuánto tiempo necesitas para alcanzar tu objetivo de ahorro. Introduce el precio, tu ahorro mensual y descubre cuándo lo tendrás. Visual y motivador.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'cuanto tardo en ahorrar, calculadora ahorro objetivo, tiempo ahorro, meta ahorro, ahorrar para comprar, planificador ahorro jovenes',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '¿Cuánto tardo en ahorrar? | meskeIA',
    description,
    url: 'https://meskeia.com/estimador-tiempo-ahorro/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Cuánto tardo en ahorrar? | meskeIA',
    description: 'Descubre cuándo alcanzarás tu objetivo de ahorro con esta calculadora visual',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '¿Cuánto tardo en ahorrar?',
  description,
  url: 'https://meskeia.com/estimador-tiempo-ahorro/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};
