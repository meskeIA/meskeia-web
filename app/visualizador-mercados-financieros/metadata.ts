import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Mercados Financieros | Bolsa, Libro de Órdenes y Activos | meskeIA',
  description: 'Cómo funciona la bolsa: libro de órdenes (bid/ask/spread), formación de precios, tipos de activos (acciones, bonos, ETF, derivados), índices bursátiles y participantes del mercado.',
  keywords: ['mercados financieros', 'bolsa', 'libro ordenes', 'bid ask', 'acciones', 'bonos', 'ETF', 'IBEX 35', 'SP500', 'formacion precios'],
  openGraph: {
    title: 'Visualizador de Mercados Financieros | meskeIA',
    description: 'Cómo funciona la bolsa: libro de órdenes, formación de precios, tipos de activos e índices bursátiles.',
    url: 'https://meskeia.com/visualizador-mercados-financieros/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Mercados Financieros - Bolsa, Órdenes y Activos",
  description: "Cómo funciona la bolsa: libro de órdenes (bid/ask/spread), formación de precios, tipos de activos (acciones, bonos, ETF, derivados), índices bursátiles y participantes del mercado.",
  url: "https://meskeia.com/visualizador-mercados-financieros/",
  category: 'FinanceApplication',
  features: [],
});
