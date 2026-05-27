import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Carbono: Diamante, Grafeno y la Molécula de la Vida | meskeIA',
  description:
    'Por qué un solo elemento forma el diamante más duro y el grafeno más flexible. Alótropos, ciclo del carbono, química orgánica y datación con C-14.',
  keywords: [
    'carbono elemento',
    'alótropos carbono',
    'diamante grafito diferencia',
    'grafeno propiedades',
    'ciclo del carbono',
    'carbono 14 datacion',
    'quimica organica carbono',
  ],
  openGraph: {
    title: 'El Carbono: Diamante, Grafeno y la Molécula de la Vida',
    description:
      'Un solo elemento que forma el diamante más duro, el grafeno más delgado y todas las moléculas de la vida',
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
  name: "El Carbono: Diamante, Grafeno y la Molécula de la Vida",
  description: "Por qué un solo elemento forma el diamante más duro y el grafeno más flexible. Alótropos, ciclo del carbono, química orgánica y datación con C-14.",
  url: "https://meskeia.com/visualizador-carbono/",
  category: 'EducationalApplication',
  features: [],
});
