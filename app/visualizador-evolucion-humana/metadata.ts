import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Evolución Humana - De Lucy a Homo Sapiens | meskeIA',
  description: 'Visualiza el linaje humano: Australopithecus, Homo habilis, erectus, Neandertales y sapiens. Timeline interactivo, migraciones Out of Africa y la revolución cognitiva.',
  keywords: ['evolucion humana', 'homo sapiens', 'australopithecus', 'neandertales', 'homo erectus', 'out of africa', 'revolucion cognitiva', 'prehistoria', 'antropologia', 'paleoantropologia'],
  openGraph: {
    title: 'Evolución Humana | meskeIA',
    description: 'De Lucy a Homo sapiens: timeline, migraciones y revolución cognitiva',
    url: 'https://meskeia.com/visualizador-evolucion-humana/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Evolución Humana - De los Primeros Homínidos al Homo Sapiens",
  description: "Visualiza el linaje humano: Australopithecus, Homo habilis, erectus, Neandertales y sapiens. Timeline interactivo, migraciones Out of Africa y la revolución cognitiva.",
  url: "https://meskeia.com/visualizador-evolucion-humana/",
  category: 'EducationalApplication',
  features: [],
});
