import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Adaptaciones de las Plantas: Xerófitas, Carnívoras y Más | meskeIA',
  description:
    'Visualizador interactivo de adaptaciones vegetales. 6 hábitats extremos (desierto, selva, tundra, acuático, salino, rupestre), 8 mecanismos adaptativos (CAM, C4, micorrizas) y sección completa de plantas carnívoras.',
  keywords: [
    'adaptaciones plantas',
    'xerófitas halófitas',
    'plantas carnívoras',
    'fotosíntesis CAM C4',
    'micorrizas',
    'biología bachillerato',
  ],
  openGraph: {
    title: 'Adaptaciones de las Plantas — Hábitats Extremos | meskeIA',
    description:
      'Cómo las plantas sobreviven en desiertos, selvas, tundras y suelos salinos. Plantas carnívoras: Venus, Drosera, Nepenthes.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-adaptaciones-plantas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-adaptaciones-plantas/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Adaptaciones de las Plantas',
  description:
    'Visualizador interactivo de adaptaciones vegetales a hábitats extremos. 6 entornos (desierto, selva tropical, tundra, acuático, salino, rupestre), 8 mecanismos clave (CAM, C4, suculencia, micorrizas, neumatóforos) y sección especial de plantas carnívoras con 5 géneros.',
  url: 'https://meskeia.com/visualizador-adaptaciones-plantas/',
  category: 'EducationalApplication',
  features: [
    '6 hábitats extremos con adaptaciones específicas',
    '8 mecanismos adaptativos explicados en profundidad',
    'Sección especial de plantas carnívoras: Venus, Drosera, Nepenthes, Pinguicula, Utricularia',
    'Fotosíntesis CAM vs C4 vs C3 comparada',
    'Micorrizas y la Wood Wide Web explicadas',
  ],
});
