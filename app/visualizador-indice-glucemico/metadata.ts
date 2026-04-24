import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visualizador del Índice Glucémico y Carga Glucémica | meskeIA',
  description: 'Aprende la diferencia entre índice glucémico (IG) y carga glucémica (CG). Paradoja de la sandía, papel de la fibra y curva de glucosa post-comida explicados.',
  keywords: ['índice glucémico', 'carga glucémica', 'glucosa', 'insulina', 'fibra', 'diabetes', 'nutrición', 'glucemia', 'carbohidratos'],
  openGraph: {
    title: 'Visualizador del Índice Glucémico y Carga Glucémica',
    description: 'Por qué la sandía tiene IG alto pero carga glucémica baja. Entiende la diferencia que cambia cómo interpretar los alimentos.',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalContent',
  name: 'Visualizador del Índice Glucémico y Carga Glucémica',
  description: 'Explicación educativa de índice glucémico, carga glucémica e índice insulínico con ejemplos de alimentos reales.',
  educationalLevel: 'general',
  inLanguage: 'es',
  publisher: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
};
