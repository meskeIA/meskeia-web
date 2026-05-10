import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Huella de lo que Comes - Impacto Ambiental por Alimento | meskeIA',
  description: 'Compara la huella de carbono, consumo de agua y uso de suelo de alimentos comunes. Barras comparativas interactivas con datos científicos.',
  keywords: 'huella carbono alimentos, impacto ambiental comida, CO2 alimentación, consumo agua alimentos, uso suelo, sostenibilidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Huella de lo que Comes',
    description: 'Compara el impacto ambiental de los alimentos: CO2, agua y uso de suelo.',
    url: 'https://meskeia.com/visualizador-huella-alimentos/',
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
    title: 'La Huella de lo que Comes',
    description: 'El impacto ambiental de tu plato: CO2, agua y suelo por alimento.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Huella Alimentos meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Huella de lo que Comes',
  description: 'Explicador visual del impacto ambiental de alimentos comunes. Compara huella de carbono (kg CO2), consumo de agua (litros) y uso de suelo (m²) por kg de alimento.',
  url: 'https://meskeia.com/visualizador-huella-alimentos/',
  features: [
    'Comparativa de 15+ alimentos por impacto ambiental',
    '3 métricas: CO2, agua y uso de suelo',
    'Barras proporcionales con ordenación interactiva',
    'Datos de Our World in Data / Poore & Nemecek 2018',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
