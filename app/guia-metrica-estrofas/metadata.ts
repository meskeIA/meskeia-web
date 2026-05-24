import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata = {
  title: 'Guía de Métrica y Estrofas — Poesía española | meskeIA',
  description: 'Aprende a contar sílabas en poesía española: sinalefa, acento y tipos de verso. Referencia completa de estrofas (redondilla, décima, soneto, romance, lira) con ejemplos de los grandes poetas.',
  keywords: ['métrica española', 'sinalefa', 'endecasílabo', 'octosílabo', 'alejandrino', 'estrofas', 'soneto', 'romance', 'décima', 'redondilla', 'contar sílabas poesía', 'tipos de verso'],
  openGraph: {
    title: 'Guía de Métrica y Estrofas | meskeIA',
    description: 'Contador de sílabas interactivo, tipos de verso, rima y estrofas de la poesía española clásica.',
    url: 'https://meskeia.com/guia-metrica-estrofas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Métrica y Estrofas — Poesía española',
  description: 'Referencia completa de la métrica española: contador interactivo de sílabas con sinalefa, tipos de verso por número de sílabas, esquemas de rima, estrofas clásicas y formas poéticas con ejemplos.',
  url: 'https://meskeia.com/guia-metrica-estrofas/',
  category: 'EducationalApplication',
  features: [
    'Contador interactivo de sílabas con detección de sinalefa',
    'Tipos de verso: del tetrasílabo al alejandrino con ejemplos',
    'Rima consonante y asonante, esquemas visuales',
    'Estrofas: pareado, redondilla, cuarteto, décima, romance…',
    'Formas poéticas completas: soneto, romance, lira, haiku',
    'Reglas de métrica: sinalefa, hiato, acento y corrección silábica',
    'Ejemplos de Garcilaso, Machado, Lorca, Bécquer, Quevedo y más',
  ],
});
