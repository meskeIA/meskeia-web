import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Teoría de Juegos: Dilema del Prisionero y Equilibrio de Nash | meskeIA',
  description:
    'Juega al Dilema del Prisionero y descubre el Equilibrio de Nash. Visualizador interactivo de teoría de juegos: suma cero, cooperativos, tragedia de los comunes y aplicaciones reales.',
  keywords: [
    'teoría de juegos',
    'dilema del prisionero',
    'equilibrio de Nash',
    'tragedia de los comunes',
    'juegos suma cero',
    'tit-for-tat',
    'Von Neumann',
    'Nash Nobel',
  ],
  openGraph: {
    title: 'Teoría de Juegos: Dilema del Prisionero y Equilibrio de Nash',
    description:
      '¿Cooperarías o delatarías? Juega el dilema que explica desde la Guerra Fría hasta el cambio climático.',
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
  name: "Teoría de Juegos: Dilema del Prisionero y Nash",
  description: "Juega al Dilema del Prisionero y descubre el Equilibrio de Nash. Visualizador interactivo de teoría de juegos: suma cero, cooperativos, tragedia de los comunes y aplicaciones reales.",
  url: "https://meskeia.com/visualizador-teoria-juegos/",
  category: 'EducationalApplication',
  features: [],
});
