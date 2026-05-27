import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Relatividad Especial - Dilatación del Tiempo, E=mc² y Paradoja de los Gemelos | meskeIA',
  description:
    'Visualiza la dilatación del tiempo, contracción de longitud y E=mc² con sliders interactivos. La relatividad especial de Einstein sin matemáticas complejas.',
  keywords: [
    'relatividad especial',
    'einstein',
    'dilatacion del tiempo',
    'contraccion de longitud',
    'E=mc2',
    'paradoja gemelos',
    'velocidad de la luz',
    'factor gamma',
    'fisica relativista',
    'teoria relatividad',
  ],
  openGraph: {
    title: 'Relatividad Especial | meskeIA',
    description:
      'Dilatación del tiempo, E=mc² y paradoja de los gemelos con sliders interactivos',
    url: 'https://meskeia.com/visualizador-relatividad-especial/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Relatividad Especial - Dilatación del Tiempo y E=mc²",
  description: "Visualiza la dilatación del tiempo, contracción de longitud y E=mc² con sliders interactivos. La relatividad especial de Einstein sin matemáticas complejas.",
  url: "https://meskeia.com/visualizador-relatividad-especial/",
  category: 'EducationalApplication',
  features: [],
});
