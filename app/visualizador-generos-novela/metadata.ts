import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Grandes Géneros de la Novela — Guía para Lectores | meskeIA',
  description: 'Explora 11 géneros narrativos: novela negra, terror, ciencia ficción, fantasía, thriller, distopía, histórica y más. Características, autores fundacionales y obras para empezar.',
  keywords: 'géneros de la novela, novela negra, terror, ciencia ficción, fantasía épica, thriller, distopía, novela histórica, qué leer, recomendaciones literarias, géneros literarios',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Grandes Géneros de la Novela — Guía para Lectores',
    description: 'Explora 11 géneros narrativos con características definitorias, autores fundacionales y obras ideales para empezar.',
    url: 'https://meskeia.com/visualizador-generos-novela',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grandes Géneros de la Novela — Guía para Lectores',
    description: '11 géneros narrativos con características, autores fundacionales y lecturas de entrada.',
  },
  other: {
    'application-name': 'Géneros de la Novela meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Grandes Géneros de la Novela — Guía para Lectores',
  description: 'Directorio visual de 11 géneros narrativos desde la perspectiva del lector: características definitorias, autores fundacionales, obras de entrada recomendadas y subgéneros. Incluye comparativa de géneros frecuentemente confundidos.',
  url: 'https://meskeia.com/visualizador-generos-novela/',
  category: 'EducationalApplication',
  features: [
    '11 géneros narrativos con características definitorias desde la perspectiva del lector',
    'Autores fundacionales y obras de entrada recomendadas por género',
    'Filtros por lo que buscas: suspense, mundos, personajes, ideas, emoción, historia',
    'Sección de géneros frecuentemente confundidos (negro vs thriller, sci-fi vs fantasía)',
    'Subgéneros destacados para cada familia narrativa',
    'CTA cruzado al test de tipo de lector',
    'Gratuito, sin registro, en español',
  ],
});
