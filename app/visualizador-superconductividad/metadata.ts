import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Superconductividad: Resistencia Cero y Levitación Magnética | meskeIA',
  description:
    'Explora la superconductividad interactivamente: efecto Meissner (levitación magnética), pares de Cooper, temperatura crítica de 8 materiales reales y aplicaciones en MRI, LHC, Maglev y fusión nuclear.',
  keywords: [
    'superconductividad',
    'efecto Meissner',
    'pares de Cooper',
    'temperatura crítica Tc',
    'YBCO alta Tc',
    'MRI superconductor',
    'Maglev tren levitación',
    'ITER fusión superconductores',
  ],
  openGraph: {
    title: 'Superconductividad: Resistencia Cero y Levitación Magnética',
    description:
      'El efecto más espectacular de la física cuántica: conductividad perfecta y levitación magnética real. Visualizador interactivo con 8 materiales y animaciones.',
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
  name: "Superconductividad: Efecto Meissner y Pares de Cooper",
  description: "Explora la superconductividad interactivamente: efecto Meissner (levitación magnética), pares de Cooper, temperatura crítica de 8 materiales reales y aplicaciones en MRI, LHC, Maglev y fusión nuclear.",
  url: "https://meskeia.com/visualizador-superconductividad/",
  category: 'EducationalApplication',
  features: [],
});
