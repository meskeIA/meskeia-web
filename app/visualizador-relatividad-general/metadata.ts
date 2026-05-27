import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Relatividad General: La Curvatura del Espacio-Tiempo | meskeIA',
  description: 'La gravedad no es una fuerza — es curvatura del espacio-tiempo. Malla SVG interactiva, geodésicas, lentes gravitacionales, agujeros negros, ondas LIGO y corrección GPS.',
  keywords: [
    'relatividad general Einstein',
    'curvatura espacio tiempo',
    'agujeros negros horizonte sucesos',
    'ondas gravitacionales LIGO',
    'lentes gravitacionales',
    'GPS relatividad corrección',
    'geodésicas gravedad',
    'Schwarzschild radio',
  ],
  openGraph: {
    title: 'Relatividad General: La Curvatura del Espacio-Tiempo',
    description: 'La gravedad no es una fuerza: es la curvatura del espacio-tiempo. Visualiza la malla del universo deformada por una masa.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Relatividad General: Curvatura del Espacio-Tiempo",
  description: "La gravedad no es una fuerza — es curvatura del espacio-tiempo. Malla SVG interactiva, geodésicas, lentes gravitacionales, agujeros negros, ondas LIGO y corrección GPS.",
  url: "https://meskeia.com/visualizador-relatividad-general/",
  category: 'EducationalApplication',
  features: [],
});
