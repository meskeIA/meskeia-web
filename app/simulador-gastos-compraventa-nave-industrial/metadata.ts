import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Gastos Compra Nave Industrial - IVA, ITP y Costes | meskeIA',
  description: 'Calcula los gastos de compra de una nave industrial en España: IVA 21%, ITP por comunidad autónoma, AJD, notaría y registro. Para empresas y autónomos. Gratis y sin registro.',
  keywords: 'simulador gastos compra nave industrial, gastos compraventa nave industrial, IVA nave industrial, ITP nave industrial, comprar nave impuestos, calculadora nave industrial españa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-gastos-compraventa-nave-industrial/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Gastos Compra Nave Industrial | meskeIA',
    description: 'Calcula el IVA 21%, ITP y gastos de compraventa de una nave industrial en España.',
    url: 'https://meskeia.com/simulador-gastos-compraventa-nave-industrial/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Gastos Compra Nave Industrial | meskeIA',
    description: 'IVA 21%, ITP, notaría y registro en la compraventa de nave industrial. Calcula gratis.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Gastos Compra Nave Industrial',
  description: 'Calculadora de gastos de compra de nave industrial en España. Incluye IVA 21% en obra nueva, ITP por comunidad autónoma en segunda mano, AJD, notaría y registro de la propiedad.',
  url: 'https://meskeia.com/simulador-gastos-compraventa-nave-industrial/',
  category: 'FinanceApplication',
  features: [
    'IVA 21% en nave industrial de nueva construcción',
    'ITP por comunidad autónoma en segunda mano',
    'AJD (Actos Jurídicos Documentados)',
    'Gastos de notaría y registro de la propiedad',
    'Nota sobre deducibilidad del IVA para empresas',
    'Preconfigurado para nave industrial',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['gastos nave industrial', 'IVA nave industrial', 'ITP nave industrial', 'compraventa nave', 'España'],
});
