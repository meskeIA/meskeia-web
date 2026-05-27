import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Oro: Por Qué la Relatividad Explica su Color y su Nobleza | meskeIA',
  description: 'La relatividad especial de Einstein explica por qué el oro es amarillo, no se oxida y es vital en electrónica. Configuración electrónica, nanopartículas y medicina.',
  keywords: [
    'por que el oro es amarillo',
    'por que el oro no se oxida',
    'oro relatividad',
    'oro electrónica',
    'nanopartículas oro',
    'oro medicina',
    'configuracion electronica oro',
    'oro metal noble',
  ],
  openGraph: {
    title: 'El Oro: Por Qué la Relatividad Explica su Color y su Nobleza',
    description: 'Einstein explica por qué el oro es amarillo, no se oxida y está en cada circuito electrónico',
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
  name: "El Oro: Por Qué la Relatividad Explica su Color y su Nobleza",
  description: "La relatividad especial de Einstein explica por qué el oro es amarillo, no se oxida y es vital en electrónica. Configuración electrónica, nanopartículas y medicina.",
  url: "https://meskeia.com/visualizador-oro/",
  category: 'EducationalApplication',
  features: [],
});
