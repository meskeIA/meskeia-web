import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mecánica Cuántica - Dualidad, Incertidumbre, Superposición y Efecto Túnel | meskeIA',
  description:
    'Visualiza los fenómenos cuánticos: dualidad onda-partícula, principio de incertidumbre, gato de Schrödinger y efecto túnel. Sin ecuaciones, con animaciones interactivas.',
  keywords: [
    'mecanica cuantica',
    'dualidad onda particula',
    'principio incertidumbre',
    'gato schrodinger',
    'efecto tunel',
    'superposicion cuantica',
    'doble rendija',
    'qubit',
  ],
  openGraph: {
    title: 'Mecánica Cuántica | meskeIA',
    description:
      'Dualidad, incertidumbre, superposición y efecto túnel con animaciones interactivas',
    url: 'https://meskeia.com/visualizador-mecanica-cuantica/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Mecánica Cuántica - Dualidad, Incertidumbre y Efecto Túnel",
  description: "Visualiza los fenómenos cuánticos: dualidad onda-partícula, principio de incertidumbre, gato de Schrödinger y efecto túnel. Sin ecuaciones, con animaciones interactivas.",
  url: "https://meskeia.com/visualizador-mecanica-cuantica/",
  category: 'EducationalApplication',
  features: [],
});
