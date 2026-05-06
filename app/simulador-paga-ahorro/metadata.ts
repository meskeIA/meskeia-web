import { Metadata } from 'next';

const title = 'Simulador de Paga y Ahorro — Aprende a gestionar tu dinero | meskeIA';
const description = 'Herramienta educativa para jóvenes: gestiona tu paga semanal o mensual, distribuye gastos por categorías y aprende a ahorrar con objetivos visuales.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'paga semanal, ahorrar paga, gestionar dinero joven, educacion financiera jovenes, ahorro adolescentes, presupuesto paga, mesada ahorro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Paga y Ahorro | meskeIA',
    description,
    url: 'https://meskeia.com/simulador-paga-ahorro/',
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
    title: 'Simulador de Paga y Ahorro | meskeIA',
    description: 'Aprende a gestionar tu paga y ahorrar con objetivos visuales',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Simulador de Paga y Ahorro',
  description,
  url: 'https://meskeia.com/simulador-paga-ahorro/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};
