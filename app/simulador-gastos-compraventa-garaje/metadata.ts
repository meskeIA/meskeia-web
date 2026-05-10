import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Gastos Compraventa Garaje - Calcular ITP y Costes | meskeIA',
  description: 'Calcula los gastos de compra y venta de un garaje o plaza de parking en España. ITP por comunidad autónoma, notaría, registro y plusvalía municipal. Gratis y sin registro.',
  keywords: 'simulador gastos compra venta garaje, gastos compraventa garaje, ITP garaje, comprar garaje impuestos, plaza parking gastos, calculadora garaje españa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-gastos-compraventa-garaje/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Gastos Compraventa Garaje | meskeIA',
    description: 'Calcula cuánto pagarás en impuestos y gastos al comprar o vender un garaje en España.',
    url: 'https://meskeia.com/simulador-gastos-compraventa-garaje/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Gastos Compraventa Garaje | meskeIA',
    description: 'ITP, notaría, registro y plusvalía en la compraventa de garaje. Calcula gratis.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Gastos Compraventa Garaje',
  description: 'Calculadora de gastos de compra y venta de garaje o plaza de parking en España. Incluye ITP por comunidad autónoma, notaría, registro de la propiedad, plusvalía municipal y IRPF del vendedor.',
  url: 'https://meskeia.com/simulador-gastos-compraventa-garaje/',
  category: 'FinanceApplication',
  features: [
    'ITP por comunidad autónoma para garaje (tipo residencial)',
    'IVA 10% en garaje de obra nueva',
    'Gastos de notaría y registro de la propiedad',
    'Plusvalía municipal del vendedor',
    'IRPF sobre ganancia patrimonial',
    'Preconfigurado para garaje/plaza de parking',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['gastos garaje', 'ITP garaje', 'compraventa garaje', 'plaza parking impuestos', 'España'],
});
