import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Fases de la Luna y Eclipses - La Danza Sol-Tierra-Luna | meskeIA',
  description: 'Explora las fases lunares, eclipses solares y lunares, y mareas con diagramas interactivos. Geometría Sol-Tierra-Luna animada. Explicador visual.',
  keywords: 'fases luna, eclipse solar, eclipse lunar, mareas, luna llena, luna nueva, cuarto creciente, cuarto menguante, luna de sangre, astronomía',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Fases de la Luna y Eclipses - La Danza Sol-Tierra-Luna',
    description: 'Fases lunares, eclipses solares y lunares, mareas y datos fascinantes. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-fases-luna-eclipses',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fases de la Luna y Eclipses - Explicador Visual',
    description: 'Explora la danza Sol-Tierra-Luna: fases, eclipses, mareas y curiosidades cósmicas.',
  },
  other: { 'application-name': 'Fases Luna meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Fases de la Luna y Eclipses - La Danza Sol-Tierra-Luna',
  description: 'Explicador visual interactivo sobre las fases lunares, eclipses solares y lunares, mareas y datos fascinantes sobre la relación Sol-Tierra-Luna.',
  url: 'https://meskeia.com/visualizador-fases-luna-eclipses/',
  category: 'EducationalApplication',
  features: [
    'Diagrama orbital interactivo con 8 fases lunares clickables',
    'Eclipses solares y lunares con conos de sombra visuales',
    'Mareas: por qué hay 2 al día, mareas vivas y muertas',
    'Datos fascinantes sobre la Luna y su relación con la Tierra',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
