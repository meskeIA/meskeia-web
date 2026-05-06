import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tendencias de la Tabla Periódica - El Mapa de la Química | meskeIA',
  description: 'Descubre las tendencias de la tabla periódica: electronegatividad, radio atómico, energía de ionización. Mapas de calor interactivos. Explicador visual.',
  keywords: 'tabla periódica tendencias, electronegatividad, radio atómico, energía ionización, mapa calor, química visual, Pauling, elementos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tendencias de la Tabla Periódica - El Mapa de la Química',
    description: 'Electronegatividad, radio atómico y energía de ionización visualizados como mapas de calor interactivos.',
    url: 'https://meskeia.com/visualizador-tabla-periodica-interactiva',
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
    title: 'Tendencias Tabla Periódica - Explicador Visual',
    description: 'La tabla periódica como nunca la habías visto: mapas de calor de propiedades atómicas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Tabla Periódica Tendencias meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tendencias de la Tabla Periódica - El Mapa de la Química',
  description: 'Explicador visual interactivo sobre tendencias periódicas: electronegatividad (escala Pauling), radio atómico, energía de ionización y aplicaciones prácticas.',
  url: 'https://meskeia.com/visualizador-tabla-periodica-interactiva/',
  category: 'EducationalApplication',
  features: [
    'Mapa de calor de electronegatividad (escala Pauling)',
    'Radio atómico con círculos proporcionales',
    'Energía de ionización con gráfico de barras',
    'Aplicaciones prácticas: baterías, materiales, electrónica',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
