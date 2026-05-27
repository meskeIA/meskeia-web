import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Regímenes Políticos: Tipología y Características Estructurales — meskeIA',
  description:
    'Matriz interactiva de los 6 tipos de régimen político, espectro de concentración del poder, evolución histórica agregada y mecanismos de transición. Tipología estructural de la ciencia política académica.',
  keywords: [
    'regímenes políticos tipología',
    'democracia liberal características',
    'autoritarismo totalitarismo diferencias',
    'separación de poderes regímenes',
    'transición democrática tipos',
    'monarquía constitucional república',
    'legitimidad política Weber',
    'ciencia política comparada',
    'filosofía política clásica Aristóteles',
    'sistemas de gobierno estructuras',
  ],
  openGraph: {
    title: 'Visualizador de Regímenes Políticos: Tipología y Características Estructurales — meskeIA',
    description:
      'Matriz interactiva de 6 tipos de régimen, espectro de poder y evolución histórica agregada. Enfoque puramente tipológico y estructural.',
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
  name: "Regímenes Políticos: Tipología y Características Estructurales",
  description: "Matriz interactiva de los 6 tipos de régimen político, espectro de concentración del poder, evolución histórica agregada y mecanismos de transición. Tipología estructural de la ciencia política académ",
  url: "https://meskeia.com/visualizador-regimenes-politicos/",
  category: 'EducationalApplication',
  features: [],
});
