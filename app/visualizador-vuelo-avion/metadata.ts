import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Por qué Vuelan los Aviones — Bernoulli y el Ángulo de Ataque | meskeIA',
  description: 'La explicación correcta del vuelo: por qué Bernoulli solo es parte de la historia, qué es el ángulo de ataque y cómo los aviones pueden volar invertidos.',
  keywords: ['vuelo avión física', 'bernoulli vuelo', 'ángulo de ataque', 'sustentación aerodinámica', 'perfil alar', 'física bachillerato', 'aerodinámica', 'cómo vuelan los aviones'],
  openGraph: {
    title: 'Por qué Vuelan los Aviones — Bernoulli y el Ángulo de Ataque',
    description: 'Lo que los libros no explican bien sobre el vuelo: Bernoulli es real pero incompleto. La verdadera clave es el ángulo de ataque y la 3ª ley de Newton.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalContent',
  name: 'Visualizador del Vuelo de Aviones',
  description: 'Explicación física del vuelo: Bernoulli, ángulo de ataque, sustentación y por qué los aviones pueden volar invertidos.',
  educationalLevel: 'secondary',
  inLanguage: 'es',
  publisher: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
};
