import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador del Impuesto de Sucesiones 2025 | meskeIA',
  description: 'Estima el Impuesto de Sucesiones (ISD) en las 17 comunidades autónomas de España. Tarifa estatal, Cataluña, País Vasco y Navarra. Orientación antes de hablar con tu asesor fiscal.',
  keywords: 'impuesto sucesiones, herencias España, ISD 2025, calculadora sucesiones, CCAA sucesiones, estimador herencias',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador del Impuesto de Sucesiones 2025 — meskeIA',
    description: 'Estima el ISD en las 17 CCAA de España antes de hablar con tu asesor fiscal.',
    url: 'https://meskeia.com/estimador-impuesto-sucesiones/',
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
    title: 'Estimador del Impuesto de Sucesiones 2025',
    description: 'Estima el ISD en las 17 comunidades autónomas. Orientación fiscal antes de acudir al asesor.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Impuesto de Sucesiones",
  description: "Estima el Impuesto de Sucesiones (ISD) en las 17 comunidades autónomas de España. Tarifa estatal, Cataluña, País Vasco y Navarra. Orientación antes de hablar con tu asesor fiscal.",
  url: "https://meskeia.com/estimador-impuesto-sucesiones/",
  category: 'FinanceApplication',
  features: [],
});
