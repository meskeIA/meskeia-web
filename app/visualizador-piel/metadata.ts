import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de la Piel | Capas, Funciones y Cicatrización | meskeIA',
  description:
    'Explora las capas de la piel (epidermis, dermis, hipodermis), sus funciones de protección, cicatrización y fototipos. Visualizador educativo interactivo.',
  keywords: ['piel', 'epidermis', 'dermis', 'hipodermis', 'cicatrización', 'fototipo', 'melanocitos', 'queratinocitos'],
  openGraph: {
    title: 'Visualizador de la Piel | meskeIA',
    description:
      'Explora la estructura y funciones de la piel: capas, cicatrización, fototipos y mecanismos de protección.',
    url: 'https://meskeia.com/visualizador-piel/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "La Piel - Capas, Funciones y Cicatrización",
  description: "Explora las capas de la piel (epidermis, dermis, hipodermis), sus funciones de protección, cicatrización y fototipos. Visualizador educativo interactivo.",
  url: "https://meskeia.com/visualizador-piel/",
  category: 'EducationalApplication',
  features: [],
});
