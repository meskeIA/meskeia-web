import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo se Propaga un Bulo: El Ciclo de la Desinformación | meskeIA',
  description:
    'Descubre cómo nace y se viraliza un bulo. Visualizador interactivo del ciclo de desinformación: creación, amplificación, viralización y desmentido. Con datos del MIT y el Reuters Institute.',
  keywords: [
    'desinformación',
    'bulos',
    'fake news',
    'verificación',
    'sesgos cognitivos',
    'DSA',
    'fact-checking',
    'noticias falsas',
  ],
  openGraph: {
    title: 'Cómo se Propaga un Bulo: El Ciclo de la Desinformación',
    description:
      'Los bulos viajan 6 veces más rápido que la verdad. Descubre por qué y cómo protegerte.',
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
  name: "El Ciclo de la Desinformación: Cómo se Propaga un Bulo",
  description: "Descubre cómo nace y se viraliza un bulo. Visualizador interactivo del ciclo de desinformación: creación, amplificación, viralización y desmentido. Con datos del MIT y el Reuters Institute.",
  url: "https://meskeia.com/visualizador-desinformacion/",
  category: 'EducationalApplication',
  features: [],
});
