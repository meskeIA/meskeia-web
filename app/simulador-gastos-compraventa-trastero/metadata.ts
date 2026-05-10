import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Gastos Compraventa Trastero - ITP y Costes | meskeIA',
  description: 'Calcula los gastos de compra y venta de un trastero en España: ITP por comunidad autónoma, notaría, registro y plusvalía municipal. Incluye trastero vinculado y trastero independiente. Gratis.',
  keywords: 'simulador gastos compraventa trastero, gastos compra trastero, ITP trastero, impuestos trastero españa, comprar trastero gastos, calculadora trastero',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-gastos-compraventa-trastero/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Gastos Compraventa Trastero | meskeIA',
    description: 'Calcula el ITP y gastos de compraventa de un trastero en España.',
    url: 'https://meskeia.com/simulador-gastos-compraventa-trastero/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Gastos Compraventa Trastero | meskeIA',
    description: 'ITP, notaría y registro en la compraventa de trastero. Calcula gratis.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Gastos Compraventa Trastero',
  description: 'Calculadora de gastos de compra y venta de trastero en España. Incluye ITP por comunidad autónoma, IVA 10% en obra nueva, notaría, registro de la propiedad y plusvalía municipal.',
  url: 'https://meskeia.com/simulador-gastos-compraventa-trastero/',
  category: 'FinanceApplication',
  features: [
    'ITP por comunidad autónoma para trastero (tipo residencial)',
    'IVA 10% en trastero de obra nueva vinculado a vivienda',
    'Gastos de notaría y registro de la propiedad',
    'Plusvalía municipal del vendedor',
    'IRPF sobre ganancia patrimonial',
    'Preconfigurado para trastero',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['gastos trastero', 'ITP trastero', 'compraventa trastero', 'España'],
});
