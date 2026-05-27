import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Pintura - Calcula Litros por Metros Cuadrados | meskeIA',
  description: 'Calcula cuántos litros de pintura necesitas según los metros cuadrados, número de capas y tipo de superficie. Incluye calculadora de coste total.',
  keywords: 'calculadora pintura, litros pintura, metros cuadrados, pintar pared, cuanta pintura necesito, rendimiento pintura, bricolaje, decoracion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Pintura - Litros por m²',
    description: 'Calcula cuántos litros de pintura necesitas para tu proyecto. Considera capas, tipo de superficie y calcula el coste.',
    url: 'https://meskeia.com/calculadora-pintura/',
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
    title: 'Calculadora de Pintura - meskeIA',
    description: 'Calcula cuántos litros de pintura necesitas según metros cuadrados y capas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora de Pintura - meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Pintura",
  description: "Calcula cuántos litros de pintura necesitas según los metros cuadrados, número de capas y tipo de superficie. Incluye calculadora de coste total.",
  url: "https://meskeia.com/calculadora-pintura/",
  category: 'FinanceApplication',
  features: [],
});
