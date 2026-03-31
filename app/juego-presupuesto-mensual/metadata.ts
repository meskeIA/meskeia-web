import { Metadata } from 'next';

const title = 'Juego de Presupuesto Mensual — ¿Llegas a fin de mes? | meskeIA';
const description = 'Juego educativo: gestiona un presupuesto mensual real con escenarios y decisiones. Aprende a priorizar gastos, ahorrar y reaccionar ante imprevistos. Para jóvenes y adultos.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'juego presupuesto, educacion financiera juego, simulador presupuesto mensual, aprender finanzas jovenes, gestionar dinero juego, presupuesto primer sueldo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Juego de Presupuesto Mensual | meskeIA',
    description,
    url: 'https://meskeia.com/juego-presupuesto-mensual/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Juego de Presupuesto Mensual | meskeIA',
    description: '¿Puedes llegar a fin de mes? Juego educativo de gestión de presupuesto',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Juego de Presupuesto Mensual',
  description,
  url: 'https://meskeia.com/juego-presupuesto-mensual/',
  applicationCategory: 'GameApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};
