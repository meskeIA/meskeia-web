import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Comercio Internacional - Ventaja Comparativa, Balanza Comercial y Aranceles | meskeIA',
  description:
    'Visualiza el comercio internacional: ventaja comparativa de Ricardo, balanza comercial de España, tipos de cambio y su efecto en exportaciones, y simulador de aranceles.',
  keywords: [
    'comercio internacional',
    'ventaja comparativa',
    'balanza comercial',
    'tipos de cambio',
    'aranceles',
    'proteccionismo',
    'exportaciones',
    'importaciones',
    'OMC',
    'libre comercio',
    'economia bachillerato',
  ],
  openGraph: {
    title: 'Comercio Internacional | meskeIA',
    description:
      'Ventaja comparativa, balanza comercial, tipos de cambio y aranceles explicados visualmente',
    url: 'https://meskeia.com/visualizador-comercio-internacional/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Comercio Internacional - Ventaja Comparativa y Aranceles",
  description: "Visualiza el comercio internacional: ventaja comparativa de Ricardo, balanza comercial de España, tipos de cambio y su efecto en exportaciones, y simulador de aranceles.",
  url: "https://meskeia.com/visualizador-comercio-internacional/",
  category: 'FinanceApplication',
  features: [],
});
