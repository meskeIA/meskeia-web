import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador del Impuesto de Donaciones 2025 | meskeIA',
  description: 'Estima el Impuesto de Donaciones en las 17 comunidades autónomas de España. Régimen común, Cataluña, País Vasco y Navarra. Orientación antes de hablar con tu asesor fiscal.',
  keywords: 'impuesto donaciones, ISD donaciones 2025, calculadora donaciones, donaciones CCAA España, estimador donaciones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador del Impuesto de Donaciones 2025 — meskeIA',
    description: 'Estima el impuesto que pagas al recibir una donación en cualquier CCAA de España.',
    url: 'https://meskeia.com/estimador-impuesto-donaciones/',
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
    title: 'Estimador del Impuesto de Donaciones 2025',
    description: 'Estima el ISD donaciones en las 17 comunidades autónomas. Orientación fiscal antes de acudir al asesor.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Impuesto de Donaciones",
  description: "Estima el Impuesto de Donaciones en las 17 comunidades autónomas de España. Régimen común, Cataluña, País Vasco y Navarra. Orientación antes de hablar con tu asesor fiscal.",
  url: "https://meskeia.com/estimador-impuesto-donaciones/",
  category: 'FinanceApplication',
  features: [],
});
