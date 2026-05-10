import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estructuras Cristalinas 3D - Los 7 Sistemas y Celdas Rotables | meskeIA',
  description: 'Visualiza en 3D los 7 sistemas cristalinos, estructuras BCC/FCC/HCP, sal, diamante y grafito. Arrastra para rotar las celdas unitarias.',
  keywords: 'estructuras cristalinas, cristalografía, celda unitaria, BCC, FCC, HCP, sistemas cristalinos, 3D, diamante, grafito, NaCl',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estructuras Cristalinas 3D - Celdas Unitarias Rotables',
    description: 'Arrastra para rotar celdas unitarias en 3D: los 7 sistemas cristalinos, BCC, FCC, HCP, sal, diamante y grafito.',
    url: 'https://meskeia.com/visualizador-estructuras-cristalinas/',
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
    title: 'Estructuras Cristalinas 3D',
    description: 'Los 7 sistemas cristalinos con rotación interactiva en 3D.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Estructuras Cristalinas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estructuras Cristalinas 3D - Los 7 Sistemas y Celdas Rotables',
  description: 'Visualizador interactivo de estructuras cristalinas en 3D con arrastre. Los 7 sistemas cristalinos, estructuras metálicas BCC/FCC/HCP, y cristales famosos como sal, diamante y grafito.',
  url: 'https://meskeia.com/visualizador-estructuras-cristalinas/',
  category: 'EducationalApplication',
  features: [
    'Celdas unitarias 3D rotables con arrastre (mouse y táctil)',
    '7 sistemas cristalinos con parámetros de celda',
    'Estructuras metálicas BCC, FCC y HCP',
    'Cristales famosos: sal, diamante, grafito, cuarzo',
    'CSS 3D sin dependencias externas',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y en español',
  ],
});
