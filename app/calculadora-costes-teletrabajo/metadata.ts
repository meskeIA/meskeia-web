import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Costes Teletrabajo vs Oficina — Ahorro Real | meskeIA',
  description:
    'Calcula el ahorro o coste real de trabajar desde casa frente a ir a la oficina: transporte, comidas, electricidad, ropa y más. Resultado mensual y anual.',
  keywords:
    'calculadora teletrabajo, ahorro teletrabajo, coste trabajar desde casa, teletrabajo vs oficina, ahorro trabajar en casa, gastos teletrabajo, calculadora trabajo remoto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Costes Teletrabajo vs Oficina',
    description:
      '¿Cuánto ahorras (o gastas) trabajando desde casa? Calcula tu ahorro real en transporte, comidas, electricidad y ropa.',
    url: 'https://meskeia.com/calculadora-costes-teletrabajo/',
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
    title: 'Calculadora Costes Teletrabajo vs Oficina',
    description:
      '¿Vale la pena el teletrabajo económicamente? Calcula el ahorro real comparando todos los gastos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Costes Teletrabajo",
  description: "Calcula el ahorro o coste real de trabajar desde casa frente a ir a la oficina: transporte, comidas, electricidad, ropa y más. Resultado mensual y anual.",
  url: "https://meskeia.com/calculadora-costes-teletrabajo/",
  category: 'FinanceApplication',
  features: [],
});
